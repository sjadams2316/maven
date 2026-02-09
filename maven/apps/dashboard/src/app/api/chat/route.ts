import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { MAVEN_KNOWLEDGE_BASE, getRelevantKnowledge } from '@/lib/knowledge-base';
import { parseLocalStorageProfile, buildContextForChat, UserContext } from '@/lib/user-context';
import { extractMemories, formatMemoriesForPrompt } from '@/app/api/oracle/memory/route';

// In-memory store for Oracle memories (matches memory/route.ts)
const memoryStore = new Map<string, Map<string, any>>();

function getUserMemories(userId: string): any[] {
  const memories = memoryStore.get(userId);
  return memories ? Array.from(memories.values()) : [];
}

function storeMemory(userId: string, memory: any) {
  if (!memoryStore.has(userId)) {
    memoryStore.set(userId, new Map());
  }
  memoryStore.get(userId)!.set(memory.key, {
    ...memory,
    id: `mem_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
}

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Conversation history (production: database per user)
const conversationHistory = new Map<string, { role: 'user' | 'assistant'; content: string }[]>();

/**
 * MAVEN ORACLE SYSTEM PROMPT
 * This is what makes Maven different from a generic chatbot
 */
const MAVEN_ORACLE_PROMPT = `You are Maven, an AI wealth partner that serves as the user's financial Oracle. You don't just answer questions—you understand their complete financial picture and proactively guide them toward optimal decisions.

## YOUR ROLE

You are the central intelligence layer for someone's financial life. Think of yourself as having the expertise of:
- A CFP (Certified Financial Planner)
- A CPA specializing in tax optimization
- A portfolio manager
- A wealth advisor

...but accessible instantly, 24/7, with perfect memory of their situation.

## HOW TO BE AN ORACLE

1. **Know Everything** - You have access to their complete financial picture. Reference specific holdings, accounts, and numbers when relevant.

2. **Be Proactive** - Don't wait for perfect questions. If you see an opportunity (tax-loss harvest, Roth conversion window, concentration risk), mention it.

3. **Connect the Dots** - See relationships between things they might not. "Your CIFR position is up 200%, which creates both concentration risk AND a tax planning opportunity..."

4. **Quantify Impact** - Don't just say "consider tax-loss harvesting." Say "Harvesting your NVDA loss would save approximately $2,100 in taxes this year."

5. **Be Honest About Limitations** - If you'd need more information, ask for it. If something requires a licensed professional, say so.

## COMMUNICATION STYLE

- **Direct** - Get to the point. No "Great question!" fluff.
- **Specific** - Use actual numbers, actual tickers, actual account names
- **Actionable** - End with clear next steps when appropriate
- **Conversational** - Warm but not soft. Like a smart friend who happens to be a financial expert.

## IMPORTANT DISCLAIMERS

- You're not a licensed financial advisor, but you can provide education and analysis
- For specific tax advice, recommend they confirm with a CPA
- For legal/estate matters, recommend an attorney
- Never recommend specific buy/sell timing for market speculation

## TOOL USAGE

You have tools to both READ and WRITE user data:

**Data Modification:**
- update_holdings: Add, update, or remove holdings from their portfolio
  - When user says "I have X of Y" or "I also own Z" → use this to ADD
  - When user says "actually it's X now" or "I sold some" → use this to UPDATE
  - When user says "I sold all my X" → use this to REMOVE
  - If you don't have account info (type, custodian), the tool will tell you what's missing — then ASK the user for that info naturally

**Data Retrieval:**
- web_search: Look up real-time info (prices, news, tickers)
- get_market_data: Get current prices for symbols
- analyze_tax_impact: Calculate tax implications of a scenario
- find_harvest_opportunities: Scan for tax-loss harvesting candidates
- calculate_rebalance: Show trades needed to reach target allocation

**IMPORTANT for update_holdings:**
- Always confirm after making changes ("Got it, I've added $23k of TAOX to your Schwab IRA")
- If the tool returns "needs_info", ask the user naturally for what's missing
- Don't assume account details — if they don't specify, ask which account

## ASSET CLASSIFICATION NOTES

- Bitcoin mining stocks (CIFR, IREN, MARA, RIOT, CLSK, HUT, BITF) are US EQUITIES, not crypto
- MSTR (MicroStrategy) is a US EQUITY that holds Bitcoin
- COIN (Coinbase) is a US EQUITY
- IBIT, FBTC, GBTC, ARKB are crypto ETFs (hold actual Bitcoin)
- BTC, ETH, SOL, TAO are actual cryptocurrencies

## RESPONSE FORMAT

Use markdown formatting:
- **Bold** for emphasis and key numbers
- Bullet points for lists
- Tables for comparisons (when helpful)
- Keep paragraphs short and scannable

Now embody the Oracle. Know their situation. Guide them wisely.`;

/**
 * Voice mode system prompt modifier
 * When user has voice enabled, adjust output for spoken delivery
 */
const VOICE_MODE_PROMPT = `

## VOICE MODE ACTIVE

Your response will be READ ALOUD to the user. Adjust your style:

1. **NO BULLET POINTS OR LISTS** — Convert to flowing sentences with natural transitions ("First... Also... And finally...")

2. **NO MARKDOWN** — Don't use bold, headers, or code formatting. Speak naturally.

3. **SHORTER SENTENCES** — Keep sentences concise. Pause naturally with periods.

4. **CONVERSATIONAL TONE** — Speak like a warm, knowledgeable friend. More personal, less formal.

5. **SPOKEN NUMBERS** — Say "about eight hundred thousand dollars" not "$800,000"

6. **AVOID JARGON** — If you must use a technical term, briefly explain it.

7. **WARM PERSONALITY** — You can be slightly warmer and more personable since this feels like a real conversation.

Example bad (text): "Your allocation:
• US Equity: 65%
• International: 15%
• Bonds: 20%"

Example good (voice): "Looking at your portfolio, you're about 65% in US stocks, 15% in international, and 20% in bonds. That's a pretty solid growth-oriented mix."

Remember: They're LISTENING, not reading. Make it pleasant to hear.`;

/**
 * Tool definitions for Claude function calling
 */
const TOOLS = [
  {
    name: "update_holdings",
    description: "Add, update, or remove holdings from the user's portfolio. Use this when the user mentions having investments, shares, or money in specific securities. IMPORTANT: If you don't have all required info (account type, custodian), return what you know and ask for the missing info - DON'T make up account details.",
    input_schema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["add", "update", "remove"],
          description: "What to do: add (new holding), update (change existing), remove (delete)"
        },
        symbol: {
          type: "string",
          description: "Ticker symbol (e.g., 'TAOX', 'VTI', 'AAPL')"
        },
        name: {
          type: "string",
          description: "Full name of the security (e.g., 'Valour Tao SEK (Bittensor ETP)')"
        },
        value: {
          type: "number",
          description: "Total dollar value of the position (e.g., 23000 for $23k)"
        },
        quantity: {
          type: "number",
          description: "Number of shares (if known, otherwise will be calculated from value)"
        },
        costBasis: {
          type: "number",
          description: "Total cost basis if known"
        },
        accountType: {
          type: "string",
          description: "Type of account: brokerage, 401k, traditional_ira, roth_ira, hsa, 529, etc."
        },
        custodian: {
          type: "string",
          description: "Where the account is held: Schwab, Fidelity, Vanguard, Coinbase, etc."
        },
        accountName: {
          type: "string",
          description: "Name of existing account if updating within a known account"
        }
      },
      required: ["action", "symbol"]
    }
  },
  {
    name: "web_search",
    description: "Search the web for real-time financial information. Use this for: current prices, recent news, researching specific investments/ETPs, verifying ticker symbols, finding details about funds or companies. Always use this when the user asks about something you're not 100% certain about.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query (e.g., 'TAOX ETP bittensor current price', 'Vanguard total stock market ETF ticker')"
        }
      },
      required: ["query"]
    }
  },
  {
    name: "get_market_data",
    description: "Get current market prices for one or more symbols. Use when you need real-time price data.",
    input_schema: {
      type: "object",
      properties: {
        symbols: {
          type: "array",
          items: { type: "string" },
          description: "Array of stock/ETF/crypto symbols (e.g., ['AAPL', 'VTI', 'BTC'])"
        }
      },
      required: ["symbols"]
    }
  },
  {
    name: "calculate_tax_impact",
    description: "Calculate the tax impact of selling a position or making a conversion.",
    input_schema: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["sell", "harvest", "roth_conversion"],
          description: "Type of taxable action"
        },
        amount: {
          type: "number",
          description: "Dollar amount involved"
        },
        isLongTerm: {
          type: "boolean",
          description: "Whether the holding is long-term (>1 year)"
        },
        federalBracket: {
          type: "number",
          description: "User's federal tax bracket (e.g., 24)"
        },
        stateRate: {
          type: "number",
          description: "State tax rate (e.g., 5)"
        }
      },
      required: ["action", "amount"]
    }
  },
  {
    name: "find_harvest_opportunities",
    description: "Scan the user's taxable holdings for tax-loss harvesting opportunities.",
    input_schema: {
      type: "object",
      properties: {
        minLoss: {
          type: "number",
          description: "Minimum loss amount to consider (default: 500)"
        }
      }
    }
  },
  {
    name: "analyze_allocation",
    description: "Analyze current portfolio allocation and compare to targets.",
    input_schema: {
      type: "object",
      properties: {
        targetAllocation: {
          type: "object",
          description: "Target allocation percentages (e.g., {usEquity: 60, bonds: 30, cash: 10})"
        }
      }
    }
  },
  {
    name: "log_tax_alpha",
    description: "Log a tax optimization event. Use this when you identify a tax-saving opportunity or help the user execute one. This feeds the Tax Alpha Counter that shows users how much Maven has saved them.",
    input_schema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["LOSS_HARVEST", "ROTH_CONVERSION", "ASSET_LOCATION", "GAIN_DEFERRAL", "WASH_SALE_AVOIDED"],
          description: "Type of tax optimization"
        },
        ticker: {
          type: "string",
          description: "Ticker symbol if applicable"
        },
        description: {
          type: "string",
          description: "Human-readable description (e.g., 'Harvest $5,200 loss in MSFT')"
        },
        amount: {
          type: "number",
          description: "The loss/conversion/gain amount in dollars (positive number)"
        },
        gainType: {
          type: "string",
          enum: ["ordinary_income", "short_term", "long_term"],
          description: "Tax treatment of the amount (affects rate used)"
        },
        status: {
          type: "string",
          enum: ["potential", "realized"],
          description: "Whether this is an identified opportunity (potential) or already executed (realized)"
        }
      },
      required: ["type", "description", "amount"]
    }
  },
  {
    name: "scan_tax_losses",
    description: "Scan the user's portfolio for tax-loss harvesting opportunities. This checks ONLY taxable accounts (not retirement), requires cost basis, and warns about wash sale risks. Use this proactively or when user asks about tax harvesting.",
    input_schema: {
      type: "object",
      properties: {
        minLoss: {
          type: "number",
          description: "Minimum loss to consider (default: $100)"
        },
        saveResults: {
          type: "boolean",
          description: "Whether to save opportunities as TaxAlphaEvents (default: true)"
        }
      }
    }
  },
  {
    name: "preview_sale",
    description: "Preview the tax impact of selling shares BEFORE executing. Shows gain/loss breakdown, wash sale warnings, and compares cost basis methods (FIFO vs LIFO vs HIFO). Use this when user asks about selling a position or wants to know tax implications.",
    input_schema: {
      type: "object",
      properties: {
        accountId: {
          type: "string",
          description: "The account ID where the shares are held"
        },
        symbol: {
          type: "string",
          description: "Ticker symbol to sell"
        },
        quantity: {
          type: "number",
          description: "Number of shares to sell"
        },
        currentPrice: {
          type: "number",
          description: "Current price per share"
        },
        costBasisMethod: {
          type: "string",
          enum: ["fifo", "lifo", "hifo"],
          description: "Cost basis method: fifo (First In First Out), lifo (Last In First Out), hifo (Highest In First Out - tax optimal)"
        }
      },
      required: ["symbol", "quantity", "currentPrice"]
    }
  },
  {
    name: "update_account_balance",
    description: "Update the balance of a cash, checking, savings, or money market account. Use this when the user says things like 'I moved $X from checking to savings' or 'my checking balance is now $X' or 'I transferred money'. Also use when they mention funding an account.",
    input_schema: {
      type: "object",
      properties: {
        accountType: {
          type: "string",
          enum: ["checking", "savings", "money_market", "brokerage", "401k", "ira", "roth_ira", "hsa", "529"],
          description: "Type of account to update"
        },
        accountName: {
          type: "string",
          description: "Name of the account (e.g., 'Chase Checking', 'Marcus HYSA')"
        },
        institution: {
          type: "string", 
          description: "Bank or institution name if known"
        },
        newBalance: {
          type: "number",
          description: "New balance to set (overrides current balance)"
        },
        adjustment: {
          type: "number",
          description: "Amount to add (positive) or subtract (negative) from current balance"
        },
        note: {
          type: "string",
          description: "Reason for the change (e.g., 'transferred to brokerage', 'paycheck deposit')"
        }
      },
      required: ["accountType"]
    }
  },
  {
    name: "transfer_funds",
    description: "Record a transfer between accounts. Use this when user says 'I moved $X from A to B' or 'transferred money from checking to brokerage'. This updates both accounts at once.",
    input_schema: {
      type: "object",
      properties: {
        fromAccount: {
          type: "string",
          description: "Account money is coming FROM"
        },
        toAccount: {
          type: "string",
          description: "Account money is going TO"
        },
        amount: {
          type: "number",
          description: "Amount transferred"
        },
        purchaseTicker: {
          type: "string",
          description: "If they bought a security with the transferred funds, the ticker symbol"
        },
        purchaseShares: {
          type: "number",
          description: "Number of shares purchased if applicable"
        }
      },
      required: ["fromAccount", "toAccount", "amount"]
    }
  }
];

/**
 * Execute tool calls
 */
async function executeTool(name: string, input: any, userContext: UserContext, clerkId?: string): Promise<string> {
  switch (name) {
    case 'update_holdings':
      try {
        const { action, symbol, name: securityName, value, quantity, costBasis, accountType, custodian, accountName } = input;
        
        // Build the request body
        const requestBody: any = {
          symbol: symbol.toUpperCase(),
          name: securityName,
          value,
          quantity,
          costBasis,
          accountType,
          custodian,
          accountName
        };

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        
        if (action === 'remove') {
          // DELETE request
          const params = new URLSearchParams({ symbol: symbol.toUpperCase() });
          if (accountName) params.set('accountName', accountName);
          
          const res = await fetch(`${baseUrl}/api/user/holdings?${params}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              // Pass clerk ID for auth (in production, use proper session token forwarding)
              'x-clerk-user-id': clerkId || ''
            }
          });
          
          const data = await res.json();
          
          if (!res.ok) {
            if (data.needsInfo) {
              return JSON.stringify({
                status: 'needs_info',
                message: data.suggestion || `I need more information: ${data.needsInfo.join(', ')}`,
                needsInfo: data.needsInfo,
                availableAccounts: data.availableAccounts
              });
            }
            return JSON.stringify({ status: 'error', message: data.error });
          }
          
          return JSON.stringify({ status: 'success', message: data.message });
          
        } else {
          // POST for add, PUT for update
          const method = action === 'update' ? 'PUT' : 'POST';
          
          const res = await fetch(`${baseUrl}/api/user/holdings`, {
            method,
            headers: {
              'Content-Type': 'application/json',
              'x-clerk-user-id': clerkId || ''
            },
            body: JSON.stringify(requestBody)
          });
          
          const data = await res.json();
          
          if (!res.ok) {
            if (data.needsInfo) {
              return JSON.stringify({
                status: 'needs_info',
                message: data.suggestion || `I need more information to add this holding: ${data.needsInfo.join(', ')}`,
                needsInfo: data.needsInfo,
                availableAccounts: data.availableAccounts
              });
            }
            return JSON.stringify({ status: 'error', message: data.error });
          }
          
          return JSON.stringify({ 
            status: 'success', 
            message: data.message,
            holding: {
              symbol: data.holding.symbol,
              value: data.holding.currentValue,
              account: data.holding.account?.name
            }
          });
        }
      } catch (e) {
        console.error('update_holdings error:', e);
        return JSON.stringify({ status: 'error', message: `Failed to update holdings: ${e}` });
      }
      
    case 'web_search':
      try {
        const query = input.query;
        // Use Brave Search API if available, otherwise use DuckDuckGo instant answers
        const braveApiKey = process.env.BRAVE_SEARCH_API_KEY;
        
        if (braveApiKey) {
          const searchUrl = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`;
          const searchRes = await fetch(searchUrl, {
            headers: {
              'Accept': 'application/json',
              'X-Subscription-Token': braveApiKey
            }
          });
          
          if (searchRes.ok) {
            const data = await searchRes.json();
            const results = data.web?.results || [];
            
            if (results.length === 0) {
              return `No search results found for "${query}". Try a different search term.`;
            }
            
            const formattedResults = results.slice(0, 5).map((r: any, i: number) => 
              `${i + 1}. **${r.title}**\n   ${r.description}\n   Source: ${r.url}`
            ).join('\n\n');
            
            return `Web search results for "${query}":\n\n${formattedResults}`;
          }
        }
        
        // Fallback: use DuckDuckGo instant answer API (no key needed)
        const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`;
        const ddgRes = await fetch(ddgUrl);
        
        if (ddgRes.ok) {
          const data = await ddgRes.json();
          let result = '';
          
          if (data.Abstract) {
            result += `**Summary:** ${data.Abstract}\n`;
          }
          if (data.RelatedTopics && data.RelatedTopics.length > 0) {
            result += '\n**Related:**\n';
            data.RelatedTopics.slice(0, 5).forEach((topic: any) => {
              if (topic.Text) {
                result += `• ${topic.Text}\n`;
              }
            });
          }
          
          if (result) {
            return `Search results for "${query}":\n\n${result}`;
          }
        }
        
        return `Could not find detailed information for "${query}". The user may need to verify this information manually.`;
      } catch (e) {
        console.error('Web search error:', e);
        return `Search error: Unable to fetch results. Please try again.`;
      }
      
    case 'get_market_data':
      try {
        const symbols = input.symbols.join(',');
        // Would call our market-data API in production
        return `[Market data for ${symbols} would be fetched here. For now, prices are in user context.]`;
      } catch (e) {
        return `Error fetching market data: ${e}`;
      }
      
    case 'calculate_tax_impact':
      const { action, amount, isLongTerm, federalBracket = 24, stateRate = 5 } = input;
      let taxRate = federalBracket + stateRate;
      
      if (action === 'sell' && isLongTerm) {
        // Long-term capital gains rates
        taxRate = federalBracket <= 12 ? 0 : federalBracket <= 35 ? 15 : 20;
        taxRate += stateRate;
      }
      
      // Add NIIT if applicable (simplified)
      const niit = federalBracket >= 35 ? 3.8 : 0;
      taxRate += niit;
      
      const taxAmount = amount * (taxRate / 100);
      
      return JSON.stringify({
        action,
        amount,
        taxRate: taxRate.toFixed(1),
        estimatedTax: taxAmount.toFixed(2),
        netProceeds: (amount - taxAmount).toFixed(2),
        breakdown: {
          federal: (amount * federalBracket / 100).toFixed(2),
          state: (amount * stateRate / 100).toFixed(2),
          niit: niit > 0 ? (amount * niit / 100).toFixed(2) : '0'
        }
      });
      
    case 'find_harvest_opportunities':
      const minLoss = input.minLoss || 500;
      const opportunities = userContext.harvestablelosses
        .filter(l => Math.abs(l.unrealizedGain) >= minLoss)
        .map(l => ({
          symbol: l.symbol,
          loss: l.unrealizedGain,
          shares: l.shares,
          term: l.isLongTerm ? 'Long-term' : 'Short-term',
          potentialTaxSavings: Math.abs(l.unrealizedGain) * (l.taxRate / 100)
        }));
      
      if (opportunities.length === 0) {
        return 'No tax-loss harvesting opportunities found above the minimum threshold.';
      }
      
      return JSON.stringify({
        opportunities,
        totalHarvestable: opportunities.reduce((sum, o) => sum + Math.abs(o.loss), 0),
        totalTaxSavings: opportunities.reduce((sum, o) => sum + o.potentialTaxSavings, 0)
      });
      
    case 'analyze_allocation':
      const target = input.targetAllocation || { usEquity: 60, intlEquity: 15, bonds: 20, cash: 5 };
      const current = userContext.assetAllocation;
      
      const diffs: any = {};
      for (const [key, targetPct] of Object.entries(target)) {
        const currentPct = current[key as keyof typeof current] || 0;
        diffs[key] = {
          current: currentPct.toFixed(1),
          target: targetPct,
          diff: (currentPct - (targetPct as number)).toFixed(1)
        };
      }
      
      return JSON.stringify({
        currentAllocation: current,
        targetAllocation: target,
        differences: diffs,
        recommendation: 'Rebalance analysis complete. See differences for suggested adjustments.'
      });
      
    case 'log_tax_alpha':
      try {
        const { type: eventType, ticker: eventTicker, description, amount: eventAmount, gainType = 'short_term', status = 'potential' } = input;
        
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        
        const res = await fetch(`${baseUrl}/api/tax-alpha`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-clerk-user-id': clerkId || ''
          },
          body: JSON.stringify({
            type: eventType,
            ticker: eventTicker,
            description,
            amount: eventAmount,
            gainType,
            status
          })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          return JSON.stringify({ status: 'error', message: data.error || 'Failed to log tax alpha event' });
        }
        
        return JSON.stringify({
          status: 'success',
          message: `Logged ${eventType.toLowerCase().replace('_', ' ')} event: ${description}`,
          taxSaved: data.taxSaved,
          calculation: data.calculationBreakdown
        });
      } catch (e) {
        console.error('log_tax_alpha error:', e);
        return JSON.stringify({ status: 'error', message: `Failed to log tax alpha: ${e}` });
      }
      
    case 'scan_tax_losses':
      try {
        const { saveResults = true } = input;
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        
        const method = saveResults ? 'POST' : 'GET';
        const res = await fetch(`${baseUrl}/api/tax-alpha/scan`, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'x-clerk-user-id': clerkId || ''
          }
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          return JSON.stringify({ status: 'error', message: data.error || 'Failed to scan portfolio' });
        }
        
        // Format results for Claude to present nicely
        if (saveResults) {
          // POST response
          return JSON.stringify({
            status: 'success',
            message: `Portfolio scanned. Found ${data.newEventsCreated} new tax-loss harvesting opportunities.`,
            summary: data.summary,
            warnings: data.warnings,
            note: 'Opportunities have been saved to the Tax Alpha Counter.'
          });
        } else {
          // GET response with full opportunity details
          const opportunities = data.opportunities || [];
          if (opportunities.length === 0) {
            return JSON.stringify({
              status: 'success',
              message: 'No tax-loss harvesting opportunities found in your taxable accounts.',
              warnings: data.warnings,
              notes: [
                'Only taxable accounts are scanned (losses in retirement accounts have no tax benefit).',
                'Cost basis is required to calculate losses.',
                data.summary?.needsCostBasis?.length > 0 
                  ? `Missing cost basis for: ${data.summary.needsCostBasis.join(', ')}`
                  : null
              ].filter(Boolean)
            });
          }
          
          return JSON.stringify({
            status: 'success',
            opportunityCount: opportunities.length,
            totalHarvestable: data.summary.totalHarvestable,
            totalTaxSavings: data.summary.totalTaxSavings,
            opportunities: opportunities.slice(0, 5).map((opp: any) => ({
              ticker: opp.ticker,
              account: opp.accountName,
              loss: opp.unrealizedLoss,
              taxSavings: opp.taxSavings,
              holdingPeriod: opp.holdingPeriod,
              washSaleRisk: opp.washSaleRisk,
              washSaleNote: opp.washSaleNote,
              substitutes: opp.substitutes?.slice(0, 2),
              isActionable: opp.isActionable,
              blockers: opp.blockers
            })),
            warnings: data.warnings,
            moreAvailable: opportunities.length > 5
          });
        }
      } catch (e) {
        console.error('scan_tax_losses error:', e);
        return JSON.stringify({ status: 'error', message: `Failed to scan portfolio: ${e}` });
      }
      
    case 'preview_sale':
      try {
        const { accountId, symbol, quantity, currentPrice, costBasisMethod = 'fifo' } = input;
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        
        // If no accountId provided, we need to find accounts with this holding
        // For now, return an error asking for account info
        if (!accountId) {
          return JSON.stringify({
            status: 'needs_info',
            message: `To preview selling ${symbol}, I need to know which account the shares are in. Can you tell me the account name or type?`,
            needsInfo: ['accountId']
          });
        }
        
        const res = await fetch(`${baseUrl}/api/transactions/preview`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-clerk-user-id': clerkId || ''
          },
          body: JSON.stringify({
            accountId,
            symbol,
            quantity,
            currentPrice,
            costBasisMethod
          })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          return JSON.stringify({ status: 'error', message: data.error || 'Failed to preview sale' });
        }
        
        // Format nicely for Claude
        const selected = data.selectedMethod;
        const washAnalysis = data.washSaleAnalysis;
        
        return JSON.stringify({
          status: 'success',
          preview: {
            symbol: data.symbol,
            quantity: data.quantity,
            currentPrice: data.currentPrice,
            totalProceeds: selected.summary.totalProceeds,
            costBasis: selected.summary.totalCostBasis,
            gainLoss: selected.summary.netGainLoss,
            shortTermGainLoss: selected.summary.shortTermGainLoss,
            longTermGainLoss: selected.summary.longTermGainLoss,
            taxImpact: selected.taxImpact,
          },
          recommendation: data.recommendation,
          washSale: {
            hasRisk: washAnalysis.hasRisk,
            safeToSellDate: washAnalysis.safeToSellDate,
            reason: washAnalysis.reason,
            disallowedAmount: washAnalysis.currentDisallowedAmount,
          },
          methodComparison: Object.values(data.methodComparison).map((m: any) => ({
            method: m.methodName,
            netGainLoss: m.summary.netGainLoss,
            taxImpact: m.taxImpact.netTaxImpact,
          })),
          lotsToSell: selected.lotsUsed,
        });
      } catch (e) {
        console.error('preview_sale error:', e);
        return JSON.stringify({ status: 'error', message: `Failed to preview sale: ${e}` });
      }
    
    case 'update_account_balance':
      try {
        const { accountType, accountName, institution, newBalance, adjustment, note } = input;
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        
        const res = await fetch(`${baseUrl}/api/user/account-balance`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-clerk-user-id': clerkId || ''
          },
          body: JSON.stringify({
            accountType,
            accountName,
            institution,
            newBalance,
            adjustment,
            note
          })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          return JSON.stringify({ status: 'error', message: data.error || 'Failed to update account balance' });
        }
        
        return JSON.stringify({
          status: 'success',
          message: data.message || `Updated ${accountName || accountType} balance`,
          account: data.account,
          previousBalance: data.previousBalance,
          newBalance: data.newBalance,
          change: data.change
        });
      } catch (e) {
        console.error('update_account_balance error:', e);
        return JSON.stringify({ status: 'error', message: `Failed to update balance: ${e}` });
      }
    
    case 'transfer_funds':
      try {
        const { fromAccount, toAccount, amount, purchaseTicker, purchaseShares } = input;
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        
        const res = await fetch(`${baseUrl}/api/user/transfer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-clerk-user-id': clerkId || ''
          },
          body: JSON.stringify({
            fromAccount,
            toAccount,
            amount,
            purchaseTicker,
            purchaseShares
          })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          return JSON.stringify({ status: 'error', message: data.error || 'Failed to record transfer' });
        }
        
        let message = `Transferred $${amount.toLocaleString()} from ${fromAccount} to ${toAccount}`;
        if (purchaseTicker) {
          message += ` and bought ${purchaseShares || 'shares of'} ${purchaseTicker}`;
        }
        
        return JSON.stringify({
          status: 'success',
          message,
          transfer: data.transfer,
          fromBalance: data.fromBalance,
          toBalance: data.toBalance,
          purchase: data.purchase
        });
      } catch (e) {
        console.error('transfer_funds error:', e);
        return JSON.stringify({ status: 'error', message: `Failed to record transfer: ${e}` });
      }
      
    default:
      return `Unknown tool: ${name}`;
  }
}

/**
 * Call Claude with full Oracle context
 */
async function callOracle(
  messages: { role: 'user' | 'assistant'; content: string }[],
  userContext: UserContext,
  query: string,
  clerkId?: string,
  voiceMode?: boolean
): Promise<string> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured');
  }

  // Build comprehensive system prompt
  let systemPrompt = MAVEN_ORACLE_PROMPT;
  
  // Add voice mode instructions if enabled
  if (voiceMode) {
    systemPrompt += VOICE_MODE_PROMPT;
  }
  
  // Add knowledge base
  systemPrompt += '\n\n' + MAVEN_KNOWLEDGE_BASE;
  
  // Add relevant knowledge hints
  systemPrompt += getRelevantKnowledge(query);
  
  // Add user context
  systemPrompt += '\n\n' + buildContextForChat(userContext);
  
  // Add persistent memories if user is authenticated
  if (clerkId) {
    const memories = getUserMemories(clerkId);
    if (memories.length > 0) {
      systemPrompt += formatMemoriesForPrompt(memories);
    }
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514', // Latest Sonnet model
      max_tokens: 2048,
      system: systemPrompt,
      tools: TOOLS,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Claude API error:', error);
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  
  // Handle tool use
  if (data.stop_reason === 'tool_use') {
    const toolUseBlock = data.content.find((c: any) => c.type === 'tool_use');
    if (toolUseBlock) {
      const toolResult = await executeTool(toolUseBlock.name, toolUseBlock.input, userContext, clerkId);
      
      // Continue conversation with tool result
      const continuedMessages = [
        ...messages,
        { role: 'assistant' as const, content: JSON.stringify(data.content) },
        { 
          role: 'user' as const, 
          content: JSON.stringify([{
            type: 'tool_result',
            tool_use_id: toolUseBlock.id,
            content: toolResult
          }])
        }
      ];
      
      // Recursive call to get final response
      return callOracle(continuedMessages, userContext, query, clerkId, voiceMode);
    }
  }
  
  // Extract text response
  const textBlock = data.content.find((c: any) => c.type === 'text');
  return textBlock?.text || 'I encountered an issue processing your request.';
}

/**
 * Fallback responses when API is unavailable
 */
function generateFallbackResponse(message: string): string {
  const lowerMsg = message.toLowerCase();

  // Always indicate this is fallback mode
  const fallbackNote = '\n\n---\n*⚠️ Running in fallback mode — Claude API key not configured. Add ANTHROPIC_API_KEY to enable full AI capabilities.*';

  if (lowerMsg.includes('how you work') || lowerMsg.includes('what can you')) {
    return `I'm Maven, your AI wealth partner. I can see your complete financial picture and help with:

**📊 Portfolio Analysis** — Holdings, allocation, concentration risks
**💰 Tax Optimization** — Harvesting, Roth conversions, asset location  
**📈 Investment Strategy** — Allocation, rebalancing, goal planning
**🔮 Proactive Insights** — I'll flag opportunities you might miss

Ask me anything about your finances. I have your full context.`;
  }

  if (lowerMsg.includes('tax') || lowerMsg.includes('harvest')) {
    return `Tax optimization is one of my specialties. I can help with:

• **Tax-loss harvesting** — Identifying losses to offset gains
• **Roth conversions** — Finding optimal conversion windows  
• **Asset location** — Placing investments in the right account types
• **Backdoor Roth** — Navigating the pro-rata rule

What specific tax situation can I help with?` + fallbackNote;
  }

  return `I'm Maven, your AI wealth partner. I'm here to help you make smarter financial decisions.

What would you like to explore?
• Your portfolio and holdings
• Tax optimization strategies
• Investment allocation
• Retirement planning` + fallbackNote;
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user (optional - chat works without auth but can't save data)
    let clerkId: string | undefined;
    try {
      const authResult = await auth();
      clerkId = authResult.userId || undefined;
    } catch {
      // Not authenticated - that's okay, just can't persist changes
    }

    const { message, conversationId, context, history: clientHistory, voiceMode } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const convId = conversationId || `conv_${Date.now()}`;
    let response: string;
    let usedClaude = false;

    // Parse user context
    const userContext = context ? parseLocalStorageProfile(context) : {
      netWorth: 0,
      totalInvestments: 0,
      totalRetirement: 0,
      totalCash: 0,
      totalCrypto: 0,
      totalDebt: 0,
      accounts: [],
      topHoldings: [],
      harvestablelosses: [],
      unrealizedGains: 0,
      unrealizedLosses: 0,
      assetAllocation: { usEquity: 0, intlEquity: 0, bonds: 0, cash: 0, crypto: 0, other: 0 },
      concentrationRisks: []
    };

    if (ANTHROPIC_API_KEY) {
      try {
        // Build conversation history from client-provided history (survives server restarts)
        // Client sends previous messages, we add the new user message
        let history: { role: 'user' | 'assistant'; content: string }[] = [];
        
        // Use client history if provided (this is the source of truth now)
        if (clientHistory && Array.isArray(clientHistory)) {
          history = clientHistory
            .filter((m: any) => m.role && m.content)
            .map((m: any) => ({ role: m.role, content: m.content }));
        } else {
          // Fallback to server-side cache (for backwards compat)
          history = conversationHistory.get(convId) || [];
        }
        
        // Add the new user message
        history.push({ role: 'user', content: message });
        
        // Keep last 30 messages for context (increased for longer conversations)
        if (history.length > 30) {
          history = history.slice(-30);
        }
        
        response = await callOracle(history, userContext, message, clerkId, voiceMode);
        usedClaude = true;
        
        // Update server-side cache (backup)
        history.push({ role: 'assistant', content: response });
        conversationHistory.set(convId, history);
        
        // Extract and store memories from this conversation (if authenticated)
        if (clerkId) {
          try {
            const newMemories = extractMemories(message, response);
            for (const memory of newMemories) {
              if (memory.key && memory.value) {
                storeMemory(clerkId, memory);
              }
            }
          } catch (memError) {
            console.error('Memory extraction error:', memError);
            // Don't fail the request if memory extraction fails
          }
        }
      } catch (error: any) {
        console.error('Claude error:', error);
        // Include error details for debugging (remove in production later)
        response = generateFallbackResponse(message);
        return NextResponse.json({
          response,
          conversationId: convId,
          poweredBy: 'fallback',
          authenticated: !!clerkId,
          debug: { error: error.message || String(error) }
        });
      }
    } else {
      response = generateFallbackResponse(message);
    }

    return NextResponse.json({
      response,
      conversationId: convId,
      poweredBy: usedClaude ? 'claude-sonnet' : 'fallback',
      authenticated: !!clerkId
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    claudeEnabled: !!ANTHROPIC_API_KEY,
    model: 'claude-sonnet-4-20250514'
  });
}
