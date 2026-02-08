/**
 * MAVEN KNOWLEDGE BASE
 * Domain expertise compiled from research
 * This is what makes Maven an Oracle, not just a chatbot
 */

export const MAVEN_KNOWLEDGE_BASE = `
=== MAVEN DOMAIN KNOWLEDGE ===

You are Maven, an AI wealth partner with deep expertise in personal finance, tax optimization, and investment management. This knowledge base contains your core domain expertise.

## TAX-LOSS HARVESTING (TLH)

**What it is:** Selling investments at a loss to offset capital gains, reducing taxes.

**Key rules:**
- Wash sale rule: Cannot repurchase "substantially identical" security within 30 days before or after sale
- ETFs from different providers tracking same index are generally NOT substantially identical
- Maximum $3,000 net capital loss deduction against ordinary income per year
- Unused losses carry forward indefinitely

**When to harvest:**
- Unrealized loss > $500 (transaction costs matter)
- Have gains to offset OR expect gains soon
- Consider tax bracket - more valuable at higher brackets
- Year-end is NOT the only time - harvest throughout year

**TLH pairs (substantially different):**
| Original | Replacement |
|----------|-------------|
| VTI (Vanguard Total Market) | ITOT (iShares Total Market) |
| VOO (Vanguard S&P 500) | IVV (iShares S&P 500) |
| VEA (Vanguard Intl Dev) | IEFA (iShares Intl Dev) |
| BND (Vanguard Total Bond) | AGG (iShares Total Bond) |
| QQQ (Invesco Nasdaq 100) | QQQM (Invesco Nasdaq 100) - DIFFERENT |

**Tax savings formula:**
Tax Savings = Loss × (Federal Rate + State Rate + NIIT if applicable)

Example: $10,000 loss × 37% = $3,700 tax savings

## ROTH CONVERSIONS

**What it is:** Moving money from Traditional IRA/401k to Roth IRA, paying taxes now for tax-free growth later.

**When conversions make sense:**
- Current tax rate < expected future rate
- Low income years (job transition, early retirement, sabbatical)
- Years before Social Security starts
- Young with long time horizon
- Want to leave tax-free inheritance

**Optimal conversion strategies:**
- "Fill the bracket" - Convert up to top of current bracket
- Multi-year conversions to avoid bracket jumping
- Consider Medicare IRMAA thresholds ($103,000 single, $206,000 married)
- Pro-rata rule applies if you have pre-tax AND after-tax IRA money

**Key thresholds (2024):**
- 10% bracket: Up to $11,600 (single) / $23,200 (married)
- 12% bracket: Up to $47,150 (single) / $94,300 (married)
- 22% bracket: Up to $100,525 (single) / $201,050 (married)
- 24% bracket: Up to $191,950 (single) / $383,900 (married)

## BACKDOOR ROTH IRA

**What it is:** Contribute to non-deductible Traditional IRA, then convert to Roth. Bypasses Roth income limits.

**Steps:**
1. Contribute to Traditional IRA (non-deductible if over income limit)
2. Wait a few days (no required waiting period, but clean separation)
3. Convert entire amount to Roth IRA
4. File Form 8606

**Critical warning - Pro-Rata Rule:**
If you have ANY pre-tax IRA money (Traditional IRA, SEP-IRA, SIMPLE IRA), conversion is taxed proportionally.

Example: $100k pre-tax IRA + $7k backdoor contribution
Taxable portion = $7k × ($100k / $107k) = $6,542

**Solutions to pro-rata:**
- Roll pre-tax IRA into employer 401k (if plan accepts)
- Do backdoor BEFORE rolling over old 401k
- Some people just pay the tax

## MEGA BACKDOOR ROTH

**What it is:** After-tax 401k contributions converted to Roth. Up to $69,000 total 401k limit (2024).

**Requirements:**
- 401k plan must allow after-tax contributions
- Plan must allow in-service withdrawals OR in-plan Roth conversions
- Not all plans offer this (~50% of large plans)

**Example:**
- Max pre-tax 401k: $23,000
- Employer match: $10,000
- After-tax contribution: $36,000 ($69,000 - $23,000 - $10,000)
- Convert $36,000 to Roth 401k or Roth IRA

## ASSET LOCATION (NOT Allocation)

**What it is:** Placing investments in the right account types to minimize taxes.

**Optimal placement:**
| Asset Type | Best Location | Why |
|------------|---------------|-----|
| High-growth stocks | Roth IRA | Tax-free growth on largest gains |
| REITs | Traditional IRA | Dividends taxed as ordinary income |
| Bonds | Traditional IRA | Interest taxed as ordinary income |
| International stocks | Taxable | Foreign tax credit available |
| Tax-efficient ETFs | Taxable | Low turnover, qualified dividends |
| Muni bonds | Taxable | Already tax-exempt |

**Priority order:**
1. Roth: Highest growth potential (small cap, emerging markets)
2. Traditional: Bonds, REITs, high-dividend stocks
3. Taxable: Tax-efficient index funds, municipal bonds

## HSA (TRIPLE TAX ADVANTAGE)

**What it is:** Health Savings Account - tax-deductible contributions, tax-free growth, tax-free withdrawals for medical.

**2024 contribution limits:**
- Self-only: $4,150
- Family: $8,300
- Catch-up (55+): +$1,000

**Investment strategy:**
- Don't use HSA for current medical expenses if possible
- Pay medical out of pocket, keep receipts
- Let HSA grow tax-free for decades
- After 65, non-medical withdrawals taxed as income (like Traditional IRA)

**Priority vs other accounts:**
1. 401k to employer match
2. Max HSA
3. Max Roth IRA (or backdoor)
4. Max 401k
5. Taxable

## NIIT (NET INVESTMENT INCOME TAX)

**What it is:** Additional 3.8% tax on investment income for high earners.

**Thresholds (MAGI):**
- Single: $200,000
- Married filing jointly: $250,000

**What's subject to NIIT:**
- Capital gains
- Dividends
- Interest
- Rental income
- Royalties
- Passive business income

**What's NOT subject:**
- Wages
- Self-employment income
- Tax-exempt interest
- Distributions from retirement accounts

## QUALIFIED DIVIDENDS VS ORDINARY

**Qualified dividends (lower tax):**
- Must hold stock > 60 days in 121-day window around ex-dividend date
- Most US stocks and many foreign stocks qualify
- Taxed at 0%/15%/20% (capital gains rates)

**Ordinary dividends (higher tax):**
- REITs
- MLPs
- Money market funds
- Short-term holdings

## RETIREMENT ACCOUNT TYPES

**Pre-tax accounts (tax later):**
- Traditional IRA
- Traditional 401k/403b/457
- SEP-IRA
- SIMPLE IRA

**After-tax accounts (tax now, grow tax-free):**
- Roth IRA
- Roth 401k

**Taxable accounts:**
- Individual brokerage
- Joint brokerage
- Trust accounts

**Capital Group share classes:**
- F2/F3: Fee-based advisory accounts (0.45-0.50% ER)
- R6: Retirement plans (lower ER but retirement-only)
- A shares: Front-end load (avoid)

## SECURITIES CLASSIFICATION

**US Equities (NOT crypto):**
- CIFR, IREN, MARA, RIOT (Bitcoin miners)
- MSTR (MicroStrategy)
- COIN (Coinbase)

**Crypto ETFs (hold actual Bitcoin):**
- IBIT (BlackRock)
- FBTC (Fidelity)
- GBTC (Grayscale)
- ARKB (ARK)

**Actual Cryptocurrency:**
- BTC, ETH, SOL, TAO

## CASH OPTIMIZATION (IDLE CASH ALERT)

**The problem:** Most people keep too much cash in checking/savings earning near 0% when they could earn 4-5%+ risk-free.

**Emergency fund guideline:**
- 3-6 months expenses in accessible savings
- Beyond that = excess cash losing to inflation

**Where to park excess cash:**

| Option | Current Yield (approx) | Access | Best For |
|--------|----------------------|--------|----------|
| High-Yield Savings | 4.0-5.0% APY | Instant | Emergency fund |
| Money Market Funds | 4.5-5.2% | 1-2 days | Brokerage cash |
| Treasury Bills | 4.5-5.0% | Maturity | Large amounts |
| I-Bonds | Inflation-linked | 1 year lock | Long-term savings |

**Top money market funds (2024):**
- SPAXX (Fidelity Gov't MM): ~4.98%
- VMFXX (Vanguard Federal MM): ~5.28%
- SWVXX (Schwab Value Advantage): ~5.16%

**Top high-yield savings:**
- Marcus (Goldman): ~4.40%
- Ally: ~4.25%
- Wealthfront Cash: ~5.00% (with promo)

**Proactive insight trigger:**
- If cash > 20% of portfolio, flag for review
- If checking/savings earning < 2%, suggest alternatives
- Calculate opportunity cost: (excess cash) × (4.5% - current rate)
- Example: $50,000 in 0.01% checking = $2,250/year lost

**State tax consideration:**
- Treasury/govt money market: State tax exempt
- Bank savings: Fully taxable
- For high-tax states (CA, NY, NJ): Govt funds more attractive

## PORTFOLIO CONSTRUCTION PRINCIPLES

**Modern allocation guidance (not 60/40):**
- Consider human capital (job security, income stability)
- Younger = more equity (but not 100%)
- Factor in Social Security as "bond" allocation
- International diversification: 20-40% of equity

**Risk tolerance mapping:**
- Conservative: 30-40% equity
- Moderate: 50-60% equity  
- Growth: 70-80% equity
- Aggressive: 90%+ equity

**Rebalancing:**
- Calendar (quarterly/annually) OR threshold (5% drift)
- Use new contributions first
- Tax-loss harvest when rebalancing taxable
- Threshold rebalancing slightly outperforms calendar

=== END KNOWLEDGE BASE ===
`;

/**
 * Get contextual knowledge snippets based on user query
 */
export function getRelevantKnowledge(query: string): string {
  const lowerQuery = query.toLowerCase();
  const snippets: string[] = [];
  
  // Tax-loss harvesting
  if (lowerQuery.includes('tax') || lowerQuery.includes('loss') || lowerQuery.includes('harvest') || lowerQuery.includes('tlh')) {
    snippets.push('Focus on: Tax-Loss Harvesting section');
  }
  
  // Roth
  if (lowerQuery.includes('roth') || lowerQuery.includes('convert') || lowerQuery.includes('backdoor')) {
    snippets.push('Focus on: Roth Conversions, Backdoor Roth IRA sections');
  }
  
  // Asset location
  if (lowerQuery.includes('location') || lowerQuery.includes('which account') || lowerQuery.includes('where should')) {
    snippets.push('Focus on: Asset Location section');
  }
  
  // HSA
  if (lowerQuery.includes('hsa') || lowerQuery.includes('health savings')) {
    snippets.push('Focus on: HSA section');
  }
  
  // Allocation/portfolio
  if (lowerQuery.includes('allocat') || lowerQuery.includes('portfolio') || lowerQuery.includes('diversif')) {
    snippets.push('Focus on: Portfolio Construction Principles section');
  }
  
  // Cash optimization
  if (lowerQuery.includes('cash') || lowerQuery.includes('savings') || lowerQuery.includes('money market') || lowerQuery.includes('idle') || lowerQuery.includes('checking')) {
    snippets.push('Focus on: Cash Optimization section');
  }
  
  return snippets.length > 0 ? `\nRELEVANT SECTIONS: ${snippets.join(', ')}\n` : '';
}
