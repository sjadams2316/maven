# Portfolio Lab — Team Knowledge Base

*Last Updated: 2026-02-09*
*Team: Portfolio Lab*

---

## Mission

Make Portfolio Lab the best portfolio analysis tool in existence — institutional-grade analysis accessible to everyone.

---

## Current State

### Features Built
- **Analysis Tab:** Portfolio health score, sector concentration, key metrics, **factor exposure analysis**
- **Optimize Tab:** AI-powered rebalancing recommendations with explanations
- **Stress Test Tab:** 6 historical scenarios (2008, COVID, 2022, Dot-Com, Stagflation, Flash Crash)
- **Projections Tab:** Monte Carlo-style wealth projections
- **Actions Tab:** Prioritized action items
- **Factor Exposure Analysis:** Shows Market Beta, Size, Value, Momentum, Quality factors with visual bars

### Code Location
- Main page: `apps/dashboard/src/app/portfolio-lab/page.tsx`
- Components: `apps/dashboard/src/app/components/`
- Utils: `apps/dashboard/src/lib/portfolio-utils.ts`
- Asset classification: `apps/dashboard/src/lib/asset-classification.ts`

### Data Sources
- **FMP (Financial Modeling Prep):** Fundamentals, analyst ratings (free tier)
- **Polygon.io:** Crypto prices, real-time stock data (free tier)
- **Yahoo Finance:** Stock quotes via v8 chart API (free)
- **CoinGecko:** Crypto prices (free)
- **Target:** Morningstar (fund holdings, X-ray, proprietary ratings) — $25-50K/year

---

## Domain Expertise

### Portfolio Theory Fundamentals

**Modern Portfolio Theory (MPT)**
- Diversification reduces unsystematic risk
- Efficient frontier: optimal risk/return tradeoff
- Correlation matters: uncorrelated assets improve portfolio
- Key limitation: assumes normal distributions (misses tail risk)

**Factor Models**
- CAPM: Market beta is primary factor
- Fama-French: Add size and value factors
- Carhart: Add momentum
- Modern factors: Quality, low volatility, profitability

### Factor Exposure Analysis (Implemented 2026-02-09)

**Factors We Display:**
1. **Market Beta** (0.5-1.5): Sensitivity to market movements
   - Beta 1.0 = moves with market
   - Beta >1.2 = aggressive/volatile
   - Beta <0.8 = defensive
   
2. **Size Factor** (SMB: -1 to +1): Small vs Large cap exposure
   - Positive = tilted toward small caps
   - Negative = concentrated in large caps
   - Based on Fama-French "Small Minus Big"

3. **Value Factor** (HML: -1 to +1): Value vs Growth exposure
   - Positive = value tilt (cheaper stocks)
   - Negative = growth tilt (expensive, high-growth)
   - Based on Fama-French "High Minus Low" (book-to-market)

4. **Momentum Factor** (-1 to +1): Recent winners exposure
   - Positive = holding recent outperformers
   - Negative = contrarian/laggard holdings
   - Based on Carhart's momentum factor

5. **Quality Factor** (-1 to +1): Financial health exposure
   - Positive = profitable, low-debt, stable earnings
   - Negative = speculative, unprofitable companies
   - Combines profitability + investment patterns

**Implementation Details:**
- Factors are estimated from ticker characteristics (heuristic-based)
- ~60 common ETFs/stocks have explicit factor profiles
- Unknown tickers fall back to asset class defaults
- Portfolio-weighted average calculation
- Compared against benchmark (Total Market, S&P 500, or 60/40)

**Data Needs for Future Enhancement:**
- Real factor loadings from Morningstar, MSCI, or AQR
- Historical returns-based factor regression
- Fund holdings look-through for ETF exposures
- Real-time factor tilts from providers

**UX Decisions:**
- Horizontal bar visualization (not radar chart — more intuitive)
- Color-coded by factor (consistent visual language)
- Benchmark comparison toggle
- Plain-English interpretation with risk level
- Educational tooltips for each factor term

**Risk Metrics**
- **Standard Deviation:** Total volatility
- **Beta:** Market sensitivity
- **Sharpe Ratio:** Risk-adjusted return (excess return / std dev)
- **Sortino Ratio:** Like Sharpe but only downside deviation
- **Max Drawdown:** Largest peak-to-trough decline
- **VaR (Value at Risk):** Max expected loss at confidence level

### Asset Allocation Best Practices

**Age-Based Rules (Starting Points)**
- "100 minus age" in stocks (outdated)
- "120 minus age" in stocks (more current)
- Glide paths for target-date funds

**Bucket Strategies**
- Near-term (0-3 years): Cash, short bonds
- Medium-term (3-10 years): Balanced
- Long-term (10+ years): Growth-oriented

**Rebalancing**
- Time-based: Quarterly or annually
- Threshold-based: When allocation drifts >5%
- Tax-aware: Consider gains/losses
- Cash flow rebalancing: Use new money to rebalance

### Concentration Risk

**Single Stock Rules**
- >10% of portfolio: Elevated risk
- >25% of portfolio: High concentration
- >50% of portfolio: Critical concentration

**Concentration Detection Implementation (2026-02-09)**

Location: `apps/dashboard/src/app/components/ConcentrationWarning.tsx`

```typescript
// Detection helper function
export function detectConcentratedPositions(
  holdings: Array<{ ticker: string; currentValue?: number }>,
  totalPortfolioValue: number,
  threshold: number = 25  // Default 25%
): ConcentratedPosition[] {
  if (totalPortfolioValue <= 0) return [];
  
  return holdings
    .filter(h => h.currentValue && h.currentValue > 0)
    .map(h => ({
      ticker: h.ticker,
      value: h.currentValue!,
      percentage: (h.currentValue! / totalPortfolioValue) * 100,
    }))
    .filter(p => p.percentage > threshold)
    .sort((a, b) => b.percentage - a.percentage);
}
```

**Severity Levels:**
- **HIGH** (25-50%): Position exceeds recommended limit
- **CRITICAL** (50-75%): More than half portfolio in single position
- **EXTREME** (>75%): Catastrophic concentration risk

**Dashboard Integration:**
- Appears ABOVE all other insights when triggered
- Red/critical styling (distinct from amber "risk" insights)
- Shows specific positions with percentages and values
- Risk explanation: "If {ticker} drops 50%, you lose ${amount}"
- CTA: "Explore Diversification Options" → Portfolio Lab
- Dismissible but returns next session (safety feature)

**Sector Concentration**
- Technology heavy is common (FAANG effect)
- 2000 taught: Tech can drop 80%
- Diversification across sectors matters

**Geographic Concentration**
- US bias is common
- International diversification provides some protection
- Emerging markets: Higher risk, higher potential return

---

## User Research Insights

### What Users Want
1. **Understand their portfolio** — "What do I actually own?"
2. **Know their risk** — "Am I going to be okay in a crash?"
3. **Find opportunities** — "How can I do better?"
4. **Take action** — "What should I do right now?"

### Pain Points
1. Data scattered across accounts
2. Jargon-heavy analysis
3. Generic recommendations (not personalized)
4. No clear next steps

### Key Insight
Users don't want more data — they want clarity and confidence.

---

## Competitive Analysis

### What Others Do Well
- **Morningstar:** X-ray analysis, style boxes, proprietary ratings
- **Personal Capital:** Clean UI, fee analyzer
- **Empower:** Retirement projections, investment checkup
- **Wealthfront:** Path financial planning, automated rebalancing
- **Betterment:** Tax-loss harvesting, goal-based

### Our Differentiation
1. **AI-native analysis** — Not just data display, actual reasoning
2. **Explain the WHY** — Every recommendation has reasoning
3. **Cross-account optimization** — See held-away assets
4. **Real-time insights** — Not just periodic reports

---

## Technical Decisions

### Why We Calculate Allocation Client-Side
- User data stays in browser (privacy)
- Faster iteration (no API changes needed)
- Works offline
- Trade-off: Limited to client-side data

### Asset Classification Approach
- Ticker → Asset class mapping in `portfolio-utils.ts`
- Falls back to "usEquity" for unknown tickers
- Target: Use Morningstar categories when available

### Stress Test Methodology
- Historical drawdowns applied to current allocation
- Asset class correlations from historical data
- Simplified: Doesn't model intra-crisis dynamics
- Future: Add Monte Carlo simulation

---

## Backlog (Prioritized)

### High Priority
1. **Factor exposure analysis** — Show beta, size, value, momentum exposures
2. **Fee analyzer** — Total expense ratios, annual fee drag
3. **Overlap detection** — "VTI and VOO are 99% overlapping"
4. **Tax efficiency score** — Rate tax efficiency of current allocation

### Medium Priority
5. **Benchmark comparison** — vs. 60/40, vs. age-based allocation
6. **Income analysis** — Dividend yield, projected income
7. **Correlation matrix** — Visual correlation between holdings
8. **Historical performance** — How would this portfolio have done?

### Lower Priority
9. **Peer comparison** — How does this compare to similar investors?
10. **Risk capacity questionnaire** — Refine risk tolerance
11. **What-if scenarios** — "What if I added $10K to bonds?"
12. **Export/share** — PDF reports, shareable links

---

## Lessons Learned

### 2026-02-07: Asset Classification Fix
**Issue:** Money markets classified as equity, global funds as international.
**Solution:** Created comprehensive Morningstar category mapping (200+ categories).
**Learning:** Don't assume — map explicitly.

### 2026-02-08: Data Consistency
**Issue:** Pages had hardcoded allocation instead of calculating from holdings.
**Solution:** Created `portfolio-utils.ts` with centralized calculation functions.
**Learning:** Single source of truth for derived data.

### 2026-02-08: Mobile Responsiveness
**Issue:** Portfolio Lab tables broke on mobile.
**Solution:** `overflow-x-auto` on tables, responsive grid breakpoints.
**Learning:** Test mobile early, not as afterthought.

---

## Open Questions

1. **How to handle held-away assets?** — User can add manually, but friction is high
2. **Real-time vs. EOD data?** — Cost vs. accuracy tradeoff
3. **Morningstar integration priority?** — Would unlock X-ray and ratings
4. **Factor analysis depth?** — Academic rigor vs. user comprehension

---

## Resources

### Research Papers
- Fama, French: "The Cross-Section of Expected Stock Returns" (1992)
- Markowitz: "Portfolio Selection" (1952)
- Sharpe: "Capital Asset Prices" (1964)

### Industry Standards
- CFA Institute: Global Investment Performance Standards (GIPS)
- Morningstar: Style Box methodology
- FINRA: Suitability requirements

### Competitor Documentation
- Personal Capital Investment Checkup methodology
- Wealthfront Path methodology
- Betterment portfolio allocation strategy

---

## Agent Instructions

When working on Portfolio Lab:

1. **Read this file first** — Understand context before making changes
2. **Check BACKLOG.md** — Work on prioritized items
3. **Test with real data** — Use demo profile with 45+ holdings
4. **Document changes** — Update this knowledge base with learnings
5. **Consider all tabs** — Changes to one tab may affect others
6. **Mobile first** — Test on small screens

---

*This knowledge base is the team's accumulated wisdom. Update it as you learn.*
