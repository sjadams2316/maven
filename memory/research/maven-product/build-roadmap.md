# Maven Build Roadmap
## AI-Native Wealth Platform — From Zero to Launch

*Last Updated: February 2026*
*For: Sam (Finance) + Eli (AI/Tech)*

---

## Executive Summary

Maven aims to be the "financial operating system" for individuals—combining account aggregation, AI-powered insights, tax optimization, and eventually trading/tax filing. This roadmap prioritizes **getting to revenue quickly** while building toward the full vision.

**Key Strategic Insight:** You don't need to be an RIA to launch. Start with aggregation + insights (no registration needed), then expand into advisory services once you have users and revenue.

---

## Regulatory Reality Check (Read This First)

### What Requires Registration?

| Activity | Registration Needed | Timeline to Get |
|----------|---------------------|-----------------|
| Aggregating accounts, showing data | **None** | N/A |
| Generic financial education/info | **None** | N/A |
| Personalized investment advice | **RIA** (SEC or State) | 2-6 months |
| Executing trades | **Broker-Dealer** OR use Alpaca | Alpaca handles this |
| Tax preparation/filing | **PTIN** (IRS) | 1 week |
| Handling client funds | **RIA + Custodian** | 3-6 months |

### The Smart Path

**Phase 1-2:** Launch as a "financial dashboard with AI insights" — educational, not advisory. This requires **zero registration**.

**Phase 3:** Register as RIA when you're ready to give personalized advice and manage money.

**Trading:** Use Alpaca as your broker-dealer. They handle all securities regulations. You never touch customer funds.

---

# Phase 1: Foundation (Months 1-3)
## Goal: Launchable MVP with Account Aggregation + AI Insights

### 1.1 MVP Feature Set

**Core Features (Must Have):**
- [ ] User authentication (email + OAuth)
- [ ] Account linking via Plaid (checking, savings, credit cards, investments)
- [ ] Net worth dashboard (real-time)
- [ ] Transaction categorization (auto + manual override)
- [ ] Basic spending insights (monthly breakdown, trends)
- [ ] AI chat interface for questions about their finances
- [ ] Holdings overview (stocks, ETFs, mutual funds across accounts)

**Nice to Have (If Time):**
- [ ] Investment allocation visualization (pie charts, asset classes)
- [ ] Monthly email digest
- [ ] Basic goal tracking (savings goals)

**Explicitly NOT in MVP:**
- Trading execution
- Tax-loss harvesting automation
- Tax filing
- Personalized investment recommendations (regulatory)

### 1.2 Technical Stack

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  Next.js 14+ (App Router) + TypeScript + Tailwind           │
│  shadcn/ui components | Recharts for visualizations          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API LAYER                               │
│  Next.js API Routes OR separate Node.js/Express service      │
│  tRPC for type-safe API calls (recommended)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATABASE                               │
│  PostgreSQL (Supabase or Railway) + Prisma ORM              │
│  Redis for caching (Upstash)                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
│  Plaid (aggregation) | OpenAI/Anthropic (AI) | Resend (email)│
│  Clerk or Auth0 (auth) | Vercel (hosting)                    │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Database Schema (Core Tables)

```sql
-- Users
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  created_at TIMESTAMP,
  subscription_tier TEXT DEFAULT 'free'
)

-- Plaid connections
plaid_items (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  plaid_item_id TEXT UNIQUE,
  plaid_access_token TEXT ENCRYPTED,  -- MUST encrypt at rest
  institution_id TEXT,
  institution_name TEXT,
  status TEXT,  -- 'active', 'error', 'pending_reauth'
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP
)

-- Accounts (from Plaid)
accounts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  plaid_item_id UUID REFERENCES plaid_items,
  plaid_account_id TEXT,
  name TEXT,
  type TEXT,  -- 'depository', 'investment', 'credit', 'loan'
  subtype TEXT,  -- 'checking', 'savings', 'brokerage', etc.
  mask TEXT,  -- last 4 digits
  current_balance DECIMAL,
  available_balance DECIMAL,
  currency TEXT DEFAULT 'USD',
  is_hidden BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMP
)

-- Transactions
transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  account_id UUID REFERENCES accounts,
  plaid_transaction_id TEXT,
  amount DECIMAL,
  date DATE,
  name TEXT,
  merchant_name TEXT,
  category TEXT[],  -- Plaid categories
  custom_category TEXT,  -- User override
  pending BOOLEAN,
  created_at TIMESTAMP
)

-- Investment holdings
holdings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  account_id UUID REFERENCES accounts,
  security_id UUID REFERENCES securities,
  quantity DECIMAL,
  cost_basis DECIMAL,
  current_value DECIMAL,
  last_synced_at TIMESTAMP
)

-- Securities reference table
securities (
  id UUID PRIMARY KEY,
  plaid_security_id TEXT,
  ticker TEXT,
  name TEXT,
  type TEXT,  -- 'equity', 'etf', 'mutual fund', 'bond', 'crypto'
  cusip TEXT,
  isin TEXT
)

-- AI conversation history
conversations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  messages JSONB,  -- [{role: 'user'|'assistant', content: '...'}]
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### 1.4 Security Requirements (Non-Negotiable)

**Infrastructure:**
- [ ] HTTPS everywhere (automatic with Vercel)
- [ ] Environment variables for all secrets (never in code)
- [ ] Database encryption at rest (Supabase/Railway provide this)
- [ ] Plaid access tokens encrypted at application level (use `@47ng/cloak` or similar)

**Authentication:**
- [ ] Use Clerk, Auth0, or Supabase Auth (don't roll your own)
- [ ] Enforce strong passwords (12+ chars)
- [ ] Implement rate limiting on auth endpoints
- [ ] Session management with secure, httpOnly cookies

**Data Handling:**
- [ ] Never log sensitive financial data
- [ ] Implement audit logging for all data access
- [ ] HTTPS-only API calls to all external services
- [ ] Sanitize all user inputs

**Plaid-Specific:**
- [ ] Store access tokens encrypted
- [ ] Implement webhook signature verification
- [ ] Handle `ITEM_LOGIN_REQUIRED` errors gracefully
- [ ] Never expose Plaid item IDs to frontend

### 1.5 Plaid Integration Details

**Plaid Products to Enable:**
- `transactions` — Transaction history
- `investments` — Holdings, securities, transactions
- `liabilities` — Credit cards, loans (optional for MVP)
- `identity` — Name verification (optional)

**Plaid Tier Recommendation:** Start with **Development** (free, 100 live Items). Move to **Launch** ($500/mo) at ~50 users.

**Key Implementation Notes:**
```typescript
// Plaid Link flow (simplified)
1. Frontend calls your API to get link_token
2. Your API calls Plaid /link/token/create
3. Frontend opens Plaid Link with link_token
4. User connects account
5. Plaid calls your webhook with public_token
6. Your API exchanges public_token for access_token
7. Store access_token (ENCRYPTED) in database
8. Fetch initial data via /accounts/get, /transactions/sync, /investments/holdings/get
```

**Sync Strategy:**
- Use `/transactions/sync` (cursor-based) not `/transactions/get`
- Set up webhooks for real-time updates: `SYNC_UPDATES_AVAILABLE`, `TRANSACTIONS_REMOVED`
- Poll `/investments/holdings/get` daily (investments update less frequently)
- Implement exponential backoff for rate limits

### 1.6 AI Integration Architecture

**Model Selection:**
- **Primary:** Claude 3.5 Sonnet (best reasoning for financial analysis)
- **Fallback:** GPT-4 Turbo
- **Fast queries:** Claude 3 Haiku or GPT-4o-mini

**Context Strategy:**
```typescript
// Build context for each query
const buildFinancialContext = (user: User) => {
  return {
    netWorth: calculateNetWorth(user.accounts),
    monthlyIncome: estimateIncome(user.transactions),
    monthlySpending: categorizeSpending(user.transactions),
    topHoldings: getTopHoldings(user.holdings, 10),
    recentTransactions: getRecentTransactions(user.transactions, 30),
    // Don't send raw transaction data - summarize it
  };
};

// System prompt
const SYSTEM_PROMPT = `You are a helpful financial assistant for Maven. 
You have access to the user's financial data (provided in context).
You provide educational insights and help users understand their finances.
You do NOT provide specific investment advice or tell users what to buy/sell.
Instead, you explain concepts and help them think through decisions.`;
```

**Important Guardrails:**
- Never say "you should buy X" or "sell Y" (regulatory risk)
- Frame as education: "Some investors consider..." or "One approach is..."
- Always recommend consulting a financial advisor for major decisions
- Log all AI interactions for compliance review

### 1.7 Effort Estimates (2-Person Team)

| Task | Effort | Owner |
|------|--------|-------|
| Auth setup (Clerk) | 2 days | Eli |
| Database schema + Prisma | 3 days | Eli |
| Plaid integration (Link + sync) | 1.5 weeks | Eli |
| Dashboard UI (net worth, accounts) | 1 week | Eli/contractor |
| Transaction list + categorization | 1 week | Eli/contractor |
| Holdings/portfolio view | 1 week | Eli |
| AI chat integration | 1 week | Eli |
| AI context building | 3 days | Eli |
| Basic insights (spending breakdown) | 4 days | Eli |
| Error handling, edge cases | 1 week | Eli |
| Security hardening | 3 days | Eli |
| Testing, bug fixes | 1 week | Both |

**Total: ~10-12 weeks** with one full-time engineer + Sam doing product/design/testing

**Contractor Recommendations:**
- Hire a React/Next.js contractor for UI work ($80-120/hr)
- ~40-60 hours of contractor time saves 2-3 weeks
- Use Toptal, Gun.io, or hire from Twitter/X fintech community

### 1.8 Phase 1 Dependencies & Prerequisites

**Before Starting:**
- [ ] Plaid account created, API keys obtained
- [ ] OpenAI/Anthropic API access
- [ ] Domain registered, DNS configured
- [ ] Vercel or similar hosting account
- [ ] Supabase/Railway database provisioned

**Legal (Can Do In Parallel):**
- [ ] Form LLC or C-Corp (Delaware C-Corp recommended for fundraising)
- [ ] Privacy Policy drafted (use Termly.io or attorney)
- [ ] Terms of Service drafted
- [ ] Basic compliance review with fintech attorney ($2-5K)

### 1.9 Phase 1 Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Plaid connection reliability | Medium | High | Implement robust error handling, show clear reauth prompts |
| AI hallucinating financial data | Medium | High | Always ground AI in actual data, never let it make up numbers |
| User data breach | Low | Critical | Encrypt everything, minimize data retention, audit logging |
| Slow AI responses | Medium | Medium | Cache common queries, show streaming responses |
| Plaid costs at scale | Low (early) | Medium | Start with Development tier, negotiate at scale |

---

# Phase 2: Core Features (Months 4-8)
## Goal: Tax Optimization + Trading Integration + Deeper Aggregation

### 2.1 Feature Set

**Account Aggregation Expansion:**
- [ ] SnapTrade integration (backup/additional brokerages)
- [ ] Direct API for Coinbase/crypto
- [ ] Manual account entry (real estate, private investments)
- [ ] Account grouping (e.g., "Retirement", "Taxable")

**Tax Intelligence:**
- [ ] Tax-loss harvesting opportunity detection
- [ ] Wash sale tracking
- [ ] Asset location optimization suggestions
- [ ] Estimated tax liability calculator
- [ ] Capital gains/losses report

**Trading (Read-Only First):**
- [ ] Alpaca paper trading integration
- [ ] Portfolio rebalancing suggestions
- [ ] "What-if" trade analyzer

**AI Enhancements:**
- [ ] Proactive insights ("You have a tax-loss harvesting opportunity")
- [ ] Natural language queries ("What did I spend on food last quarter?")
- [ ] Scenario planning ("What if I max out my 401k?")

### 2.2 Account Aggregation: Build vs Buy vs Integrate

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **Plaid Only** | Industry standard, reliable, good coverage | Expensive at scale ($0.30-1.50/user/mo), some gaps | ✅ Start here |
| **SnapTrade** | Better brokerage coverage, OAuth-based | Smaller company, less proven | ✅ Add for brokerages |
| **MX** | Enterprise-grade, great UX | Expensive, slow sales cycle | ❌ Skip for now |
| **Yodlee** | Comprehensive | Outdated, being sunset by Envestnet | ❌ Avoid |
| **Direct APIs** | Free, real-time | Engineering effort per integration | ✅ For key platforms |

**Recommended Strategy:**
1. **Plaid** for banks, credit cards, most accounts
2. **SnapTrade** for brokerages Plaid misses (better OAuth flow)
3. **Direct APIs** for: Coinbase (crypto), Robinhood (if needed)

### 2.3 SnapTrade Integration

**Why SnapTrade:**
- OAuth-based (more reliable than screen scraping)
- Better brokerage coverage than Plaid
- Trading execution built-in (for later)
- More affordable at scale

**Pricing:** ~$0.10-0.20 per connected account/month (negotiate)

**Integration Pattern:**
```typescript
// SnapTrade handles OAuth with brokerages
1. Create SnapTrade user
2. Redirect to SnapTrade's connection portal
3. User authorizes brokerage
4. SnapTrade returns connection info
5. Pull holdings, transactions via API
```

### 2.4 Tax Optimization Engine Architecture

**Core Components:**

```
┌─────────────────────────────────────────────────────────────┐
│                    TAX ENGINE                                │
├─────────────────────────────────────────────────────────────┤
│  1. Cost Basis Tracker                                       │
│     - Track all purchases with dates and amounts            │
│     - Handle stock splits, dividends, corporate actions     │
│     - Support FIFO, LIFO, specific identification           │
│                                                              │
│  2. Gain/Loss Calculator                                     │
│     - Real-time unrealized gains/losses                     │
│     - Distinguish short-term vs long-term                   │
│     - Track holding periods                                  │
│                                                              │
│  3. Tax-Loss Harvesting Scanner                              │
│     - Find positions with losses > threshold                │
│     - Check for wash sale violations (30-day window)        │
│     - Suggest replacement securities                         │
│                                                              │
│  4. Wash Sale Monitor                                         │
│     - Track 61-day windows around each sale                 │
│     - Flag substantially identical purchases                 │
│     - Adjust cost basis when wash sales occur               │
│                                                              │
│  5. Asset Location Optimizer                                 │
│     - Analyze tax efficiency by account type                |
│     - Suggest optimal placement (tax-inefficient → IRA)     │
└─────────────────────────────────────────────────────────────┘
```

**Database Additions:**
```sql
-- Tax lots (for cost basis tracking)
tax_lots (
  id UUID PRIMARY KEY,
  user_id UUID,
  account_id UUID,
  security_id UUID,
  quantity DECIMAL,
  cost_basis DECIMAL,
  acquisition_date DATE,
  acquisition_type TEXT,  -- 'purchase', 'dividend_reinvest', 'transfer'
  is_covered BOOLEAN,  -- broker reports to IRS
  remaining_quantity DECIMAL,  -- for partial sales
  created_at TIMESTAMP
)

-- Sales/dispositions
dispositions (
  id UUID PRIMARY KEY,
  user_id UUID,
  tax_lot_id UUID,
  quantity DECIMAL,
  proceeds DECIMAL,
  sale_date DATE,
  gain_loss DECIMAL,
  is_short_term BOOLEAN,
  wash_sale_disallowed DECIMAL DEFAULT 0,
  created_at TIMESTAMP
)

-- Wash sale tracking
wash_sales (
  id UUID PRIMARY KEY,
  user_id UUID,
  disposition_id UUID,
  replacement_lot_id UUID,
  disallowed_loss DECIMAL,
  created_at TIMESTAMP
)
```

**Key Algorithms:**

```typescript
// Tax-loss harvesting opportunity finder
function findHarvestingOpportunities(holdings: Holding[], taxLots: TaxLot[]) {
  const opportunities = [];
  
  for (const holding of holdings) {
    const lots = taxLots.filter(l => l.security_id === holding.security_id);
    const totalCostBasis = sum(lots.map(l => l.cost_basis));
    const currentValue = holding.quantity * holding.current_price;
    const unrealizedLoss = currentValue - totalCostBasis;
    
    if (unrealizedLoss < -100) {  // Threshold: $100 loss minimum
      // Check for wash sale risk
      const recentPurchases = lots.filter(l => 
        daysBetween(l.acquisition_date, today()) < 30
      );
      
      opportunities.push({
        security: holding.security,
        unrealizedLoss,
        washSaleRisk: recentPurchases.length > 0,
        suggestedReplacement: findSimilarETF(holding.security),
      });
    }
  }
  
  return opportunities.sort((a, b) => a.unrealizedLoss - b.unrealizedLoss);
}

// Wash sale detector
function checkWashSale(sale: Disposition, purchases: TaxLot[]): WashSale | null {
  const saleDate = new Date(sale.sale_date);
  const windowStart = subDays(saleDate, 30);
  const windowEnd = addDays(saleDate, 30);
  
  const washPurchases = purchases.filter(p => 
    p.security_id === sale.security_id &&
    p.acquisition_date >= windowStart &&
    p.acquisition_date <= windowEnd &&
    p.id !== sale.tax_lot_id  // Not the lot being sold
  );
  
  if (washPurchases.length > 0) {
    return {
      disposition_id: sale.id,
      replacement_lot_id: washPurchases[0].id,
      disallowed_loss: Math.min(
        Math.abs(sale.gain_loss),
        washPurchases[0].cost_basis
      ),
    };
  }
  
  return null;
}
```

### 2.5 Alpaca Trading Integration

**Why Alpaca:**
- They are the broker-dealer (you don't need to register)
- Commission-free trading
- Excellent API
- Paper trading for testing
- Fractional shares support

**Pricing:** Free for basic, revenue share on margin lending

**Integration Approach:**

```typescript
// Phase 2: Read-only + Paper Trading
const alpacaClient = new Alpaca({
  keyId: process.env.ALPACA_API_KEY,
  secretKey: process.env.ALPACA_SECRET_KEY,
  paper: true,  // Start with paper trading!
});

// Get account info
const account = await alpacaClient.getAccount();

// Get positions
const positions = await alpacaClient.getPositions();

// Paper trade execution
const order = await alpacaClient.createOrder({
  symbol: 'VTI',
  qty: 10,
  side: 'buy',
  type: 'market',
  time_in_force: 'day',
});
```

**Phase 2 Scope (Paper Trading Only):**
- [ ] Connect Alpaca paper trading account
- [ ] Display paper portfolio
- [ ] Execute paper trades via AI chat
- [ ] Rebalancing calculator (shows trades, doesn't execute)
- [ ] "What-if" trade impact analysis

**DO NOT** enable live trading in Phase 2. Get paper trading rock-solid first.

### 2.6 AI/LLM Integration Patterns

**Pattern 1: Structured Tool Calling**
```typescript
// Define tools for the AI
const tools = [
  {
    name: 'get_net_worth',
    description: 'Get user current net worth breakdown',
    parameters: {},
  },
  {
    name: 'get_spending_by_category',
    description: 'Get spending breakdown by category',
    parameters: {
      start_date: { type: 'string' },
      end_date: { type: 'string' },
    },
  },
  {
    name: 'find_tax_loss_harvesting',
    description: 'Find tax-loss harvesting opportunities',
    parameters: {},
  },
  {
    name: 'analyze_trade_impact',
    description: 'Analyze tax impact of a hypothetical trade',
    parameters: {
      symbol: { type: 'string' },
      action: { type: 'string', enum: ['buy', 'sell'] },
      quantity: { type: 'number' },
    },
  },
];

// Let AI call tools to answer questions
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  tools,
  messages: [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userQuestion },
  ],
});
```

**Pattern 2: RAG for Transaction Analysis**
```typescript
// For questions about spending, embed and search transactions
// "What did I spend on restaurants in December?"

1. Embed the question
2. Search transaction embeddings for relevant matches
3. Retrieve matching transactions
4. Pass to AI with context
5. AI generates natural language answer
```

**Pattern 3: Proactive Insights Engine**
```typescript
// Run daily/weekly batch job
async function generateProactiveInsights(userId: string) {
  const insights = [];
  
  // Tax-loss harvesting check
  const tlhOpps = await findHarvestingOpportunities(userId);
  if (tlhOpps.length > 0) {
    insights.push({
      type: 'tax_optimization',
      priority: 'high',
      title: 'Tax-Loss Harvesting Opportunity',
      message: `You could harvest $${tlhOpps[0].unrealizedLoss} in losses...`,
    });
  }
  
  // Unusual spending check
  const spending = await analyzeSpending(userId);
  if (spending.anomalies.length > 0) {
    insights.push({
      type: 'spending_alert',
      priority: 'medium',
      title: 'Unusual Spending Detected',
      message: `Your ${spending.anomalies[0].category} spending is 50% higher...`,
    });
  }
  
  // Save insights, optionally notify user
  await saveInsights(userId, insights);
}
```

### 2.7 Build vs Buy vs Integrate Decision Matrix

| Component | Build | Buy/Integrate | Notes |
|-----------|-------|---------------|-------|
| Account aggregation | ❌ | ✅ Plaid + SnapTrade | Never build this |
| Authentication | ❌ | ✅ Clerk/Auth0 | Security risk too high |
| Database | ❌ | ✅ Supabase/Railway | Managed is worth it |
| Tax engine | ✅ Build | | Core differentiator |
| AI/LLM integration | ✅ Build | | Core differentiator |
| Trading execution | ❌ | ✅ Alpaca | Regulatory nightmare |
| Portfolio analytics | ✅ Build | | Differentiate on UX |
| Email service | ❌ | ✅ Resend/Sendgrid | Commodity |
| Error monitoring | ❌ | ✅ Sentry | Standard |
| Analytics | ❌ | ✅ PostHog/Mixpanel | Not core |

### 2.8 Effort Estimates (Phase 2)

| Task | Effort | Owner |
|------|--------|-------|
| SnapTrade integration | 1.5 weeks | Eli |
| Manual account entry | 1 week | Eli/contractor |
| Tax lot tracking system | 2 weeks | Eli |
| Gain/loss calculator | 1 week | Eli |
| Tax-loss harvesting scanner | 1.5 weeks | Eli |
| Wash sale monitor | 1 week | Eli |
| Alpaca paper trading integration | 1 week | Eli |
| Rebalancing calculator | 1 week | Eli |
| AI tool calling setup | 1 week | Eli |
| Proactive insights engine | 1.5 weeks | Eli |
| UI for all new features | 2 weeks | Eli/contractor |
| Testing, edge cases | 2 weeks | Both |

**Total: ~16-18 weeks** (4-4.5 months)

### 2.9 Phase 2 Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Cost basis data quality | High | High | Allow manual entry/correction, show confidence scores |
| Wash sale edge cases | Medium | Medium | Be conservative, flag uncertain cases for user review |
| AI giving bad tax advice | Medium | Critical | Never say "do this", always "consider consulting a CPA" |
| Paper trading feels useless | Medium | Low | Show real tax impact, use realistic simulations |
| SnapTrade reliability | Low | Medium | Keep Plaid as primary, SnapTrade as supplement |

---

# Phase 3: Scale Features (Months 9-18)
## Goal: Tax Filing, Live Trading, Mobile, Professional Tools

### 3.1 Feature Set

**Tax Filing Integration:**
- [ ] Column Tax API integration
- [ ] Auto-generate Schedule D, Form 8949
- [ ] Import W-2s, 1099s
- [ ] Federal + state filing
- [ ] Estimated quarterly payments calculator

**Live Trading:**
- [ ] Alpaca live trading (approved accounts)
- [ ] One-click tax-loss harvesting
- [ ] Automated rebalancing
- [ ] Smart order routing

**Mobile Apps:**
- [ ] iOS app (React Native or native Swift)
- [ ] Push notifications for insights
- [ ] Quick net worth check
- [ ] Trading on mobile

**Maven Pro (RIA Platform):**
- [ ] Multi-client dashboard
- [ ] Household management
- [ ] Client reporting
- [ ] Billing integration

**Tokenized Assets:**
- [ ] Tokenized treasury/bonds support (backing stablecoins)
- [ ] DeFi yield reporting
- [ ] Crypto tax integration

### 3.2 Tax Filing Integration

**Column Tax API** (Recommended)
- Modern API, built for embedded tax
- Handles federal + all states
- Automatic form generation
- IRS direct submission
- Pricing: ~$15-30 per filing

**Alternative:** Direct IRS MeF integration
- Free (no per-filing fee)
- 6-12 month certification process
- Requires becoming "Electronic Return Originator"
- Only worth it at massive scale (>50K filings)

**Column Tax Integration:**
```typescript
// Simplified flow
1. User initiates tax filing in Maven
2. Pull all financial data (transactions, holdings, dispositions)
3. Transform to Column Tax format
4. Submit to Column Tax API
5. Column generates forms, user reviews
6. User e-signs
7. Column submits to IRS
8. Track status, refund

// Key data to send
{
  taxpayer: { name, ssn, address },
  income: {
    w2s: [...],  // User uploads or imports
    1099s: {
      div: [...],  // From holdings data
      int: [...],
      b: [...],  // From dispositions
    },
  },
  deductions: [...],
  capitalGains: formatScheduleD(dispositions),  // Your tax engine output
}
```

### 3.3 RIA Registration (For Maven Pro)

**When to Register:**
- When you want to give personalized investment advice
- When you want to manage client money (discretionary)
- When you want to charge advisory fees

**SEC vs State Registration:**
- **< $100M AUM:** Register with state (easier)
- **$100M+ AUM:** Must register with SEC

**Registration Process:**
1. Form ADV Part 1 & 2 (takes 2-4 weeks to prepare)
2. State/SEC filing ($150-500)
3. Background checks (fingerprints)
4. Compliance policies/procedures
5. Approval (30-90 days)

**Estimated Cost:** $10-30K with attorney (recommended first time)

**Key Requirements Once Registered:**
- Annual ADV updates
- Quarterly compliance reviews
- Written supervisory procedures
- Books and records requirements
- Custody rules compliance

### 3.4 Mobile App Strategy

**Option A: React Native** (Recommended)
- Shared codebase with web
- Faster development
- Good enough for fintech apps
- Companies using it: Coinbase, Bloomberg

**Option B: Native (Swift/Kotlin)**
- Better performance
- Platform-specific features
- Higher cost (2 codebases)
- Companies using it: Robinhood

**Recommendation:** Start with React Native. Only go native if:
- You need complex animations
- App Store rejects you (rare)
- Performance becomes a real issue

**MVP Mobile Features:**
- Net worth at a glance
- Account balances
- Recent transactions
- AI chat
- Push notifications

**Phase 2 Mobile Features:**
- Trading (paper → live)
- Tax insights
- Rebalancing

### 3.5 Effort Estimates (Phase 3)

| Task | Effort | Notes |
|------|--------|-------|
| Column Tax integration | 4-6 weeks | Complex, many edge cases |
| Tax form review UI | 2 weeks | Need good UX for IRS forms |
| Alpaca live trading | 2 weeks | Paper trading already done |
| Automated TLH execution | 3 weeks | Lots of safety checks |
| React Native app setup | 2 weeks | Shared logic with web |
| Mobile core features | 6 weeks | Ongoing |
| RIA registration process | 3-6 months | Can do in parallel |
| Maven Pro MVP | 8-12 weeks | After RIA registration |
| Tokenized assets | 4-6 weeks | Depends on partners |

**Total: ~9-12 months** with expanded team

---

# Compliance & Legal Roadmap

### Timeline by Phase

**Phase 1 (Months 1-3):**
- [ ] Form Delaware C-Corp
- [ ] Privacy Policy & ToS (use Termly.io + attorney review)
- [ ] Initial fintech attorney consult ($2-5K)
- [ ] Ensure "educational content" positioning (not advice)

**Phase 2 (Months 4-8):**
- [ ] Quarterly attorney review
- [ ] Begin SOC 2 Type 1 preparation
- [ ] Review Alpaca integration for compliance
- [ ] Document all AI guardrails

**Phase 3 (Months 9-18):**
- [ ] RIA registration (when ready for advice/discretion)
- [ ] SOC 2 Type 2 audit
- [ ] Column Tax ERO registration
- [ ] Insurance: E&O, Cyber, D&O

### SOC 2 Certification

**What is it:** Audit proving your security controls work

**Why you need it:** 
- B2B customers (Maven Pro) will require it
- Shows you take security seriously
- Required by many enterprise partners

**Timeline:**
- **Type 1:** 2-3 months (point-in-time audit)
- **Type 2:** 6-12 months (ongoing audit period)

**Cost:**
- Readiness assessment: $10-20K
- Type 1 audit: $20-40K
- Type 2 audit: $30-60K
- Annual: $20-40K

**When to start:** After you have paying customers, before B2B push

**Tools that help:**
- **Vanta** ($15K+/year) — automates compliance monitoring
- **Drata** (similar)
- **Secureframe** (similar)

These integrate with your cloud providers and monitor continuously.

### Insurance Needs

| Type | When | Est. Cost/Year |
|------|------|----------------|
| General Liability | Incorporation | $500-2K |
| Cyber Insurance | Phase 2 | $2-5K |
| E&O (Errors & Omissions) | Phase 3 (RIA) | $5-15K |
| D&O (Directors & Officers) | When you raise | $3-10K |
| Fidelity Bond | RIA requirement | $1-3K |

---

# Hiring Plan

### Immediate Needs (Phase 1)

**Contractor: Frontend Engineer**
- 40-60 hours over 3 months
- $80-120/hr
- Focus: Dashboard UI, component library
- Where to find: Toptal, Twitter/X, Contra

**Contractor: Designer**
- 20-40 hours over 3 months
- $100-150/hr
- Focus: Brand, dashboard design, mobile wireframes
- Where to find: Dribbble, Twitter/X, Design Buddies

### Phase 2 Hires

**Full-time: Senior Full-Stack Engineer**
- Salary: $180-250K + equity
- Focus: Tax engine, integrations, reliability
- When: Month 4-6
- Must have: Fintech or complex data systems experience

**Part-time: Compliance Consultant**
- $200-400/hr, 5-10 hrs/month
- Focus: Review features for regulatory issues
- When: Month 4
- Must have: RIA or fintech compliance background

### Phase 3 Hires

**Full-time: Mobile Engineer**
- Salary: $160-220K + equity
- Focus: React Native apps
- When: Month 9-10

**Full-time: Head of Compliance**
- Salary: $150-200K + equity
- Focus: RIA compliance, SOC 2, regulatory
- When: Before RIA registration
- Must have: CCO experience at RIA or fintech

**Full-time: Customer Success**
- Salary: $80-120K + equity
- Focus: User support, onboarding
- When: Month 12+ (or when >500 users)

---

# Budget Estimates

### Phase 1 (Months 1-3)

| Item | Monthly | Total |
|------|---------|-------|
| Vercel hosting | $20-150 | $450 |
| Supabase/Database | $25-75 | $225 |
| Plaid (Development) | $0 | $0 |
| OpenAI/Anthropic API | $100-500 | $1,500 |
| Clerk/Auth0 | $0-50 | $150 |
| Contractors (UI) | $3,000-5,000 | $12,000 |
| Contractors (Design) | $2,000-4,000 | $6,000 |
| Legal (setup + review) | — | $5,000 |
| Domain, misc | — | $500 |
| **Total** | | **~$26,000** |

### Phase 2 (Months 4-8)

| Item | Monthly | Total (5 mo) |
|------|---------|--------------|
| Infrastructure | $200-500 | $2,500 |
| Plaid (Launch tier) | $500-1,000 | $3,750 |
| SnapTrade | $200-500 | $1,500 |
| API costs (AI, etc) | $500-1,500 | $5,000 |
| Full-time engineer | $18,000/mo | $90,000 |
| Contractors | $2,000/mo | $10,000 |
| Compliance consultant | $1,500/mo | $7,500 |
| Legal (ongoing) | $1,000/mo | $5,000 |
| **Total** | | **~$125,000** |

### Phase 3 (Months 9-18)

Highly variable based on team size and RIA registration. Budget $300-600K for full Phase 3.

---

# Open Source Tools & Accelerators

### Definitely Use

| Tool | Purpose |
|------|---------|
| **Next.js** | Framework (already using) |
| **Prisma** | ORM, database migrations |
| **tRPC** | Type-safe API layer |
| **shadcn/ui** | UI components |
| **Tailwind CSS** | Styling |
| **Recharts/Tremor** | Charts and data viz |
| **Zod** | Schema validation |
| **React Query** | Data fetching/caching |
| **Zustand** | State management |

### Consider

| Tool | Purpose |
|------|---------|
| **Inngest** | Background jobs, workflows |
| **Trigger.dev** | Alternative to Inngest |
| **Cal.com** | If you need scheduling (Maven Pro) |
| **Documenso** | Open source e-signatures |
| **LangChain/LlamaIndex** | If you need RAG |

### Fintech-Specific

| Tool | Purpose |
|------|---------|
| **Plaid React Native SDK** | Mobile account linking |
| **react-financial-charts** | Candlestick charts |
| **dinero.js** | Money/currency handling |
| **accounting.js** | Number formatting |

---

# Launch Checklist

### Technical

- [ ] All secrets in environment variables
- [ ] Database backups configured
- [ ] Error monitoring (Sentry) set up
- [ ] Uptime monitoring (Better Uptime, etc.)
- [ ] Rate limiting on all APIs
- [ ] CORS properly configured
- [ ] CSP headers set
- [ ] Logging in place (no sensitive data)

### Legal/Compliance

- [ ] Privacy Policy published
- [ ] Terms of Service published
- [ ] Cookie consent (if applicable)
- [ ] CCPA/GDPR considerations
- [ ] Financial disclaimer visible
- [ ] "Not financial advice" throughout AI responses

### Business

- [ ] Stripe/payment setup (if charging)
- [ ] Basic analytics (PostHog/Mixpanel)
- [ ] User feedback mechanism
- [ ] Support email configured
- [ ] Social media accounts claimed

### Security

- [ ] Penetration test or security review (optional Phase 1)
- [ ] API keys rotated from development
- [ ] Access controls reviewed
- [ ] 2FA enabled on all admin accounts
- [ ] Incident response plan documented

---

# Key Decisions Summary

| Decision | Recommendation | Why |
|----------|----------------|-----|
| RIA registration timing | Phase 3 | Not needed for aggregation + insights |
| Primary aggregation | Plaid | Industry standard, best coverage |
| Brokerage aggregation | SnapTrade | OAuth-based, more reliable |
| Trading execution | Alpaca | They handle broker-dealer |
| Tax filing | Column Tax | Best API, handles compliance |
| Mobile framework | React Native | Fastest path, good enough |
| SOC 2 timing | After revenue | Expensive, only needed for B2B |
| First hire | Sr. Full-stack | Need help with tax engine |

---

# Quick Start: Week 1

If you're starting right now, here's your first week:

**Day 1-2:**
- [ ] Set up Next.js project with TypeScript
- [ ] Configure Vercel deployment
- [ ] Set up Supabase database
- [ ] Implement basic auth with Clerk

**Day 3-4:**
- [ ] Create Plaid developer account
- [ ] Implement Plaid Link flow (sandbox)
- [ ] Store access tokens (encrypted)
- [ ] Fetch accounts and balances

**Day 5:**
- [ ] Basic dashboard UI
- [ ] Net worth calculation
- [ ] Account list display

**Weekend (optional):**
- [ ] Sync transactions
- [ ] Basic spending categorization

You should have a working prototype connecting real (sandbox) accounts by end of week 1.

---

# Resources & Links

**Plaid:**
- Docs: https://plaid.com/docs/
- Pricing: https://plaid.com/pricing/
- Sandbox: Free, unlimited

**SnapTrade:**
- Docs: https://snaptrade.com/docs
- Contact for pricing

**Alpaca:**
- Docs: https://alpaca.markets/docs/
- Paper trading: Free
- Live trading: Free (they make money on payment for order flow)

**Column Tax:**
- https://columntax.com/
- Contact for API access

**Legal Resources:**
- RIA registration: https://www.sec.gov/investment-adviser-registration
- FINRA broker check: https://brokercheck.finra.org/
- State securities regulators: https://www.nasaa.org/

**Compliance:**
- Vanta: https://vanta.com/
- Laika: https://heylaika.com/

---

*This roadmap is a living document. Update as you learn and adapt.*

**Next update due:** After Phase 1 completion

---

*Generated for Maven | February 2026*
