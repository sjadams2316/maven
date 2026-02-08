# Direct Indexing Research: Maven Wealth Platform Strategy

**Research Date:** February 6, 2026  
**Status:** Deep Dive Complete  
**Priority:** High — Direct indexing is eating the ETF market

---

## Executive Summary

Direct indexing is no longer a niche strategy for the ultra-wealthy. With $864B in AUM as of year-end 2024 (growing at 22.4% CAGR), and projected to exceed **$1 trillion by end of 2025**, this strategy represents one of the most significant shifts in wealth management since the rise of ETFs. Only 18% of advisors currently use direct indexing, representing massive runway for adoption. Maven should develop a clear strategy here.

---

## 1. What Is Direct Indexing and How It Works

### The Core Concept

Direct indexing involves **buying the individual component stocks within an index** (like the S&P 500) rather than buying an ETF or mutual fund that tracks that index. Instead of owning one share of SPY, you own fractional positions in all 500 underlying companies in their appropriate weightings.

### How It Works Mechanically

1. **Initial Setup**: Purchase individual stocks that comprise the target index (e.g., S&P 500, Russell 3000) in appropriate weightings
2. **Ongoing Management**: 
   - Daily/weekly scans for tax-loss harvesting opportunities
   - Automated rebalancing to maintain index alignment
   - Replacement of harvested securities with correlated (not "substantially identical") alternatives
   - Monitoring for wash sale compliance (30-day rule)

3. **The Tax Advantage**: Even when an index is UP, individual stocks within it may be DOWN. These losses can be harvested at the individual security level—impossible with ETFs or mutual funds.

### Example (From Vanguard)
In Q4 2023, the S&P 500 increased 11.7%, yet **178 individual companies lost value**. Direct indexing investors could harvest those 178 losses while maintaining index exposure. ETF investors could not.

---

## 2. Tax Alpha Potential

### Industry Estimates

| Provider | Estimated Annual Tax Alpha | Notes |
|----------|---------------------------|-------|
| **Vanguard** | 1-2%+ | With daily TLH scans |
| **Wealthfront** | 1.87% CAGR (excess over SPY) | Actual client data, 2015-2023 |
| **Parametric** | 1-1.5% | Industry pioneer estimates |
| **Schwab** | 1.03 percentage points | Based on 40-year simulation |
| **Frec** | 1.87% vs 0.84% for ETF-TLH | Direct indexing vs ETF approach |

### The Math
- S&P 500 historical average pre-tax return: ~11%
- After-tax return (23.8% LTCG rate): ~8.38%
- With TLH direct indexing: ~9.41%
- **Tax alpha = 1.03 percentage points annually**

### Compounding Effect
Tax alpha compounds over time. Taxes saved are reinvested and generate additional returns. Over 10 years, **Frec's simulations showed 45.3% excess return** (over SPY) for direct indexing vs 17.3% for ETF-based TLH.

### Key Findings from Research

1. **Direct indexing harvests 1.9-2.1x more losses** than ETF-based tax loss harvesting (Frec simulation data)
2. **Loss harvesting declines over time** as cost basis resets lower
3. **Most effective for**:
   - High tax bracket investors (37%+ federal + 3.8% NIIT + state)
   - Investors with regular capital gains from other sources (real estate, business sales)
   - Those with long time horizons (compounding effect)
   - Investors with regular cash inflows (to purchase new securities)

### Who Benefits Most

| Investor Profile | Expected Benefit |
|-----------------|------------------|
| High earners (40%+ marginal rate) | Maximum benefit |
| Regular capital gains generators | High benefit |
| Long-term investors (10+ years) | Compounding amplifies |
| 0% LTCG bracket investors | Capital gains harvesting (step-up basis) |
| Charitably inclined | Donate highest-gain lots |

---

## 3. Direct Indexing vs ETFs — When Does It Make Sense?

### Direct Indexing Wins When:

✅ **High tax bracket** (>32% marginal rate)
✅ **Large taxable account** ($100K+ for most providers)
✅ **Long time horizon** (10+ years ideal)
✅ **Regular capital gains** from other sources to offset
✅ **ESG/Values customization** desired
✅ **Concentrated position management** needed
✅ **Charitable giving** strategy involves appreciated securities

### ETFs Win When:

✅ **Smaller accounts** (<$50K)
✅ **Tax-advantaged accounts** (IRA, 401k — no TLH benefit)
✅ **Low tax bracket** investors
✅ **Simplicity** is paramount
✅ **Broad international exposure** needed (direct indexing typically US-focused)

### The Breakeven Analysis

For direct indexing to make sense, the tax savings must exceed:
- Additional management fees (0.10-0.40% typically)
- Platform/technology costs
- Complexity cost
- Potential tracking error

**Rule of thumb**: Direct indexing typically becomes worthwhile at **$100K+ in taxable accounts** for investors in the **24%+ tax bracket**.

### Important Caveat: The Segmented ETF Alternative

Elm Wealth research suggests a **Segmented ETF approach** (using sector ETFs instead of broad market) captures ~70% of direct indexing's TLH potential with:
- Near-zero additional fees
- Less tracking error
- No "locked in" low-basis positions
- Better diversification (sector ETFs = 2,500+ stocks vs 500 for DI)

This is a legitimate competitor strategy Maven should evaluate.

---

## 4. Account Minimums and Fee Structures

### Major Provider Minimums & Fees (2024-2025)

| Provider | Minimum | Fee Structure | Notes |
|----------|---------|---------------|-------|
| **Wealthfront** | $100K (DI upgrade) / $5K (S&P 500 Direct) | 0.25% advisory (no extra DI fee) | Included in standard advisory |
| **Betterment** | $100K | 0.40% advisory | Tax-coordinated |
| **Vanguard Personalized Indexing** | $250K | ~0.20-0.22% | For advisors only |
| **Schwab Personalized Indexing** | $100K | 0.40% | Commission-free trades |
| **Fidelity Managed FidFolios** | $5K | 0.40% | Fractional shares |
| **Parametric** | $250K-$1M+ | 0.20-0.35% | Institutional/UHNW focus |
| **Aperio (BlackRock)** | $500K+ | 0.15-0.30% | $110.9B AUM |
| **Morgan Stanley** | Varies | 0.30-0.50%+ | $253.5B AUM (market leader) |
| **Frec** | $20K | 0.10% | Lowest cost option |

### Fee Trends

- Minimums declining rapidly due to fractional shares
- Wealthfront dropped from $500K → $100K → $5K for basic DI
- Fees converging toward 0.15-0.25% for competitive offerings
- Zero-commission trades have been transformative

---

## 5. Tracking Error Considerations

### What Is Tracking Error?

The difference between the direct indexing portfolio's return and the target index's return. Some tracking error is inevitable with direct indexing.

### Sources of Tracking Error

1. **Tax-loss harvesting trades** — Selling losers and buying "similar but not identical" replacements
2. **Wash sale compliance** — 30-day waiting period creates drift
3. **Customization/exclusions** — ESG screens, concentrated position management
4. **Rebalancing delays** — Not all platforms rebalance daily
5. **Fractional share limitations** — Some platforms still have constraints

### Industry Data on Tracking Error

| Scenario | Typical Tracking Error |
|----------|----------------------|
| Well-managed DI portfolio | 0.5-1.5% annually |
| Aggressive TLH | 1-3% annually |
| Heavy customization | 2-5% annually |

### The Tracking Error Trade-off

> "Managers and clients are worried about too much tracking error – with reason, because it can be hard or impossible to distinguish 'random' tracking error from systematic underperformance."  
> — Elm Wealth

**Key insight**: Most DI programs operate under tight tracking-error constraints, which **limits harvesting potential**. There's an inherent tension between maximum TLH and minimum tracking error.

### A Troubling Consideration

Elm Wealth notes that tracking error in DI portfolios may have **negative expected return** because:
- DI trades are predictable
- Sophisticated hedge funds/market makers are on the other side
- Zero-sum game where DI portfolios may be the "dumb money"

This is a minority view but worth monitoring.

---

## 6. Technology Requirements

### Core Technology Stack for Direct Indexing

1. **Portfolio Optimization Engine**
   - Quadratic optimization solving (maximize tax alpha, minimize tracking error)
   - Constraints: wash sales, max position weights, sector drift limits
   - Real-time or daily execution capability

2. **Tax Lot Accounting**
   - Specific lot identification
   - Cost basis tracking across multiple tax lots per security
   - Wash sale detection across all accounts

3. **Trade Execution**
   - Commission-free trading (essential)
   - Fractional shares support
   - High-volume order management (hundreds of positions)

4. **Data Infrastructure**
   - Real-time/EOD price feeds
   - Index constituent data (daily weights)
   - Corporate actions (splits, dividends, M&A)
   - Factor/ESG data (for customization)

5. **Client Interface**
   - Tax savings reporting
   - Performance attribution
   - Customization tools (exclusions, tilts)
   - Tax projection/scenario analysis

### Build vs. Buy Decision Framework (From F2 Strategy)

**Build when:**
- You have $5B+ AUM in taxable accounts
- Direct indexing is a core differentiator
- You have engineering resources
- You want full control over the algorithm

**Buy/Partner when:**
- Speed to market is priority
- You lack specialized quant expertise
- AUM doesn't justify development cost
- You want proven, tested algorithms

### Technology Providers (API/Platform)

| Provider | Model | Best For |
|----------|-------|----------|
| **BridgeFT** | API-first WealthTech | RIAs building custom solutions |
| **Alphathena** | Turnkey platform | Quick implementation |
| **Orion/Vanguard** | SMA platform | Advisors via integration |
| **55ip (JPMorgan)** | Tax-smart technology | Tax overlay |
| **Just Invest (Vanguard)** | Acquired platform | Vanguard ecosystem |

---

## 7. Current Major Providers

### Market Leaders (By AUM, 2024)

1. **Morgan Stanley/Parametric** — $253.5B
   - Acquired Parametric in 2021
   - Dominant market position
   - Full-service, institutional focus

2. **BlackRock/Aperio** — $110.9B
   - Acquired Aperio for $1.05B (2021)
   - ESG leadership
   - Institutional/advisor channels

3. **Vanguard Personalized Indexing** — Est. $50-75B
   - Acquired Just Invest (2018)
   - Low-cost DNA
   - Advisor-only distribution

4. **Schwab Personalized Indexing** — Growing
   - 0.40% fee, $100K minimum
   - Direct retail offering
   - Integrated with Schwab platform

5. **Fidelity** — Emerging
   - Managed FidFolios ($5K min)
   - Aggressive on minimums
   - Retail-focused

### Robo-Advisors with Direct Indexing

- **Wealthfront** — Pioneer since 2015, $100K for upgrade
- **Betterment** — Tax-coordinated portfolios
- **Frec** — Lowest cost (0.10%), $20K minimum

### Market Concentration

- **Top 5 providers control ~87% of direct indexing assets**
- First-mover advantage is significant
- Consolidation continuing (major acquisitions 2021-2022)

---

## 8. How Maven Could Implement or Integrate Direct Indexing

### Option A: Full Build (Not Recommended Initially)

**Pros:**
- Full control over algorithm
- Potential differentiation
- No revenue sharing

**Cons:**
- $2-5M+ development cost
- 12-24 months to market
- Ongoing maintenance burden
- Regulatory/compliance complexity

**Verdict:** Only if direct indexing becomes core strategic priority AND Maven reaches $1B+ taxable AUM.

### Option B: White-Label Partnership (Recommended)

Partner with existing provider for turn-key solution.

**Top Candidates:**
1. **Vanguard Personalized Indexing** — Low cost, trusted brand
2. **Parametric** — Best in class, institutional credibility
3. **Alphathena** — API-first, modern tech stack
4. **Orion** — If already using Orion for portfolio management

**Typical Economics:**
- Partner fee: 0.08-0.15% of AUM
- Maven markup: 0.10-0.20%
- Client total: 0.20-0.35%

### Option C: Hybrid — Build Tax Layer, Partner for Execution

Build Maven's tax intelligence layer on top of partner's execution infrastructure.

**Maven builds:**
- Tax projection and planning integration
- Multi-account tax optimization (household level)
- Client-facing tax alpha reporting
- Integration with Maven's existing platform

**Partner provides:**
- Trade execution
- Compliance/wash sale tracking
- Index replication engine

### Implementation Roadmap (Recommended)

**Phase 1 (Q2 2026): Research & Partner Selection**
- Evaluate Vanguard, Orion, Alphathena for partnership
- Define minimum viable feature set
- Understand regulatory requirements

**Phase 2 (Q3 2026): Pilot Launch**
- Launch with $100K minimum (match market standard)
- Target high-bracket clients first
- Track tax alpha delivered vs. projections

**Phase 3 (Q4 2026 - Q1 2027): Scale**
- Lower minimums based on partner capabilities
- Add ESG/values customization
- Integrate with Maven's broader tax planning

**Phase 4 (2027+): Evaluate Build Decision**
- If $500M+ in direct indexing AUM, consider building
- Focus on tax coordination across ALL accounts
- Differentiate on multi-account household optimization

### Key Integration Points for Maven

1. **Tax Planning Integration** — Connect DI tax alpha to overall tax strategy
2. **Household-Level Optimization** — Coordinate TLH across spouses, entities
3. **Concentrated Stock Management** — Solve for executives with company stock
4. **Charitable Strategy** — Identify best lots for donor-advised funds
5. **Estate Planning** — Step-up basis optimization

---

## 9. Is This the Future of Tax-Efficient Investing?

### The Bull Case 🚀

1. **Growth trajectory is undeniable**: $864B → $1T+ in 18 months
2. **Advisor adoption only 18%** — massive runway
3. **Technology costs declining** — Fractional shares + zero commissions = democratization
4. **Tax rates may rise** — Increases TLH value proposition
5. **Personalization is winning** — ESG, values-based investing demand
6. **Major players all in** — Morgan Stanley, BlackRock, Vanguard validate the category

### The Bear Case 🐻

1. **Tax alpha decays over time** — As basis resets lower, fewer harvesting opportunities
2. **ETF tax efficiency is already excellent** — Incremental benefit may not justify complexity
3. **Tracking error concerns** — May underperform the index you're trying to track
4. **Basis "lock-in" problem** — Exiting becomes tax-expensive
5. **Segmented ETF alternative** — Captures ~70% of benefit at lower cost/complexity
6. **Rising interest rates** — Tax deferral less valuable when rates are high

### Maven's Strategic View

**Direct indexing is real and growing, but it's not for everyone.**

The winning strategy is **targeted deployment**:

| Client Segment | Recommendation |
|---------------|----------------|
| High earners with taxable accounts >$250K | Strong fit — implement |
| Moderate earners, taxable accounts $100-250K | Evaluate case by case |
| Tax-advantaged accounts (IRA, 401k) | No benefit — skip |
| Lower tax bracket investors | Limited benefit |
| Concentrated stock positions | Excellent fit — priority use case |
| ESG-focused investors | Good fit with customization |

### The Big Picture

> "Direct indexing assets at $864B vs $9.4T in ETFs and $6.6T in mutual funds"

Direct indexing is still **tiny** relative to traditional vehicles. Even if it 10x, it's not "replacing" ETFs—it's becoming an important option for the right clients.

**Maven should be there for those clients.**

---

## Key Takeaways for Maven

1. **This is real** — $864B AUM, 22.4% CAGR, all major players committed
2. **Tax alpha is meaningful** — 1-2% annually for the right clients
3. **Not for everyone** — Target high-bracket, taxable, long-horizon investors
4. **Partner first** — Build later only if scale justifies
5. **Integrate with tax planning** — Maven's edge is holistic wealth management
6. **Watch the competition** — Segmented ETF strategies are a viable alternative
7. **Move in 2026** — Market is maturing; late movers disadvantaged

---

## Sources

- Cerulli Associates: U.S. Managed Accounts Edition (2024-2025)
- Vanguard Personalized Indexing White Papers
- Wealthfront Research: US Direct Indexing Methodology
- Elm Wealth: Direct Indexed Tax Loss Harvesting Analysis
- Schwab Center for Financial Research
- Frec: Direct Indexing vs ETF White Paper
- Kitces.com: The Four Types of Direct Indexing
- Morgan Stanley, Fidelity, and provider documentation
- InvestmentNews, Morningstar reporting

---

*Last updated: February 6, 2026*
