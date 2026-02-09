# Portfolio Lab — Team Knowledge Base

*Last Updated: 2026-02-09*
*Team: Portfolio Lab*

---

## Mission

Make Portfolio Lab the best portfolio analysis tool in existence — institutional-grade analysis accessible to everyone.

---

## Current State

### Features Built
- **Analysis Tab:** Portfolio health score, sector concentration, key metrics, **factor exposure analysis**, **fee analyzer**, **holdings overlap detection**
- **Optimize Tab:** AI-powered rebalancing recommendations with explanations
- **Stress Test Tab:** 6 historical scenarios (2008, COVID, 2022, Dot-Com, Stagflation, Flash Crash)
- **Projections Tab:** Monte Carlo-style wealth projections
- **Actions Tab:** Prioritized action items
- **Factor Exposure Analysis:** Shows Market Beta, Size, Value, Momentum, Quality factors with visual bars
- **Holdings Overlap Detection:** Identifies redundant ETF positions with similar underlying holdings

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

### Holdings Overlap Detection (Implemented 2026-02-09)

**Why It Matters:**
Many investors unknowingly hold redundant positions. VTI + VOO = 82% overlap. SCHD + VYM = 52% overlap. This wastes diversification and can create tax inefficiency.

**Location:** 
- Component: `apps/dashboard/src/app/components/OverlapDetection.tsx`
- Logic: `apps/dashboard/src/lib/portfolio-utils.ts` (end of file)
- Integration: Portfolio Lab → Analysis tab (below Fee Analyzer)

**Overlap Groups Detected:**

| Group | Tickers | Overlap % |
|-------|---------|-----------|
| US Total Market / S&P 500 | VTI, VOO, SPY, IVV, ITOT, SCHB | 82-100% |
| International Developed | VXUS, VEA, IEFA, EFA, SCHF | 72-98% |
| Emerging Markets | VWO, IEMG, EEM, SCHE | 85-92% |
| Total Bond Market | BND, AGG, SCHZ, IUSB | 90-98% |
| Dividend/Value ETFs | VYM, SCHD, DVY, HDV, VIG | 35-65% |
| Tech/Growth ETFs | QQQ, VGT, XLK, IYW | 60-88% |
| Small Cap ETFs | VB, IJR, IWM, SCHA | 70-95% |
| Growth ETFs | VUG, IWF, SCHG, SPYG | 85-95% |

**Features:**
1. **Overlap Groups** - Expandable cards showing which holdings overlap
2. **Overlap Percentage Bars** - Visual indicator of redundancy severity
3. **Redundant Value Calculation** - Shows dollar amount of duplicated exposure
4. **Consolidation Recommendations** - "Keep VTI, Consider Selling VOO"
5. **Tax-Loss Harvesting Opportunities** - Identifies losses that can be harvested via consolidation
6. **Wash Sale Warnings** - Alerts when consolidation would trigger wash sale rules

**Grading System:**
- **A+** (0%): No overlap detected
- **A** (≤5%): Minimal overlap
- **B** (≤10%): Low overlap
- **C** (≤20%): Moderate overlap
- **D** (≤35%): High overlap
- **F** (>35%): Very high overlap — significant redundancy

**Implementation Details:**
```typescript
// Key functions in portfolio-utils.ts
analyzePortfolioOverlap(holdings) → PortfolioOverlapAnalysis
findOverlapGroup(ticker) → OverlapGroup | null
getOverlapPercent(ticker1, ticker2) → number | null
getOverlapGrade(redundancyPercent) → { grade, label, color }
```

**UX Decisions:**
- Collapsible overlap groups (default collapsed to reduce clutter)
- Keep/Sell recommendations based on lowest cost + broadest exposure
- Tax-loss harvest opportunities shown only when meaningful (>$100 loss)
- Wash sale warnings (31-day rule) included when consolidating overlapping funds
- Educational footer explaining why overlap matters

**Future Enhancements:**
- Real ETF holdings data from Morningstar/iShares for precise overlap %
- Custom overlap threshold setting
- "What if I consolidate?" preview showing simplified portfolio
- Tax impact calculator for consolidation trades

### Rebalancing Preview (Implemented 2026-02-09)

**Why It Matters:**
Users often see "your portfolio is 65% stocks instead of 60%" but don't know what specific trades to make. The Rebalancing Preview turns allocation recommendations into actionable trade lists with full tax impact analysis.

**Location:**
- Component: `apps/dashboard/src/app/components/RebalancingPreview.tsx`
- Logic: `apps/dashboard/src/lib/portfolio-utils.ts` (calculateRebalancingTrades)
- Integration: Portfolio Lab → Optimize tab (primary feature)

**Features:**

1. **Asset Class Adjustments**
   - Shows current vs target allocation with drift percentages
   - Visual progress bars for each asset class
   - Only suggests trades when drift exceeds threshold (default 5%)
   - Configurable threshold: 3% (aggressive), 5% (recommended), 10% (relaxed)

2. **Specific Trade List**
   - Sell orders: Which specific holdings to sell, how many shares
   - Buy orders: Recommended low-cost ETFs for each asset class
   - Dollar amounts and share counts
   - Account information (when available)

3. **Tax Impact Analysis**
   - Short-term vs long-term gain classification
   - Estimated tax on each trade (22% short-term, 15% long-term)
   - Tax-loss harvesting opportunities
   - Net tax impact summary
   - Tax savings from realizing losses

4. **Wash Sale Risk Detection**
   - Flags sells at loss when buying similar security
   - Detects "substantially identical" securities via overlap groups
   - Clear warnings with explanations
   - 31-day wash sale window consideration

5. **Tax-Aware Trade Ordering**
   - Sells prioritized: losses first, then long-term gains, then short-term
   - Tax-advantaged accounts (IRA/401k) preferred for selling
   - Minimizes tax impact of rebalancing

6. **Export Functionality**
   - Copy to clipboard (text summary)
   - CSV download (for spreadsheets/brokers)
   - Full text report download

**Key Calculations:**

```typescript
// Drift threshold - only trade if drift exceeds this
if (Math.abs(currentPercent - targetPercent) < driftThreshold) {
  // No trade needed
}

// Tax estimation
const taxRate = gainType === 'short-term' ? 0.22 : 0.15;
const estimatedTax = gain > 0 ? gain * taxRate : 0;

// Wash sale detection
const washSaleRisk = 
  hasLoss && 
  (buyingSameTicker || buyingOverlappingETF);

// Tax-aware sell ordering
holdings.sort((a, b) => {
  // 1. Losses first (for harvesting)
  // 2. Long-term gains second (lower tax)
  // 3. Short-term gains last (highest tax)
  // 4. Tax-advantaged accounts preferred
});
```

**Recommended ETFs by Asset Class:**
| Asset Class | Recommended ETF | Expense Ratio |
|-------------|-----------------|---------------|
| US Equity | VTI | 0.03% |
| Int'l Equity | VXUS | 0.07% |
| Bonds | BND | 0.03% |
| Crypto | IBIT | 0.25% |
| Cash | VMFXX | 0.11% |
| REITs | VNQ | 0.12% |
| Gold | IAU | 0.25% |

**UX Design Decisions:**
- Three-tab interface: Overview, Trade List, Tax Impact
- Color-coded trades: Red for sells, green for buys
- Priority badges: High/Medium/Low based on drift severity
- Wash sale warnings prominently displayed in amber
- Export buttons always visible in Trade List tab
- Empty state shows congratulations when portfolio is balanced

**Integration Notes:**
- Holdings need `purchaseDate` for accurate ST/LT classification
- Account type (`ira`/`roth`/`401k`/`taxable`) affects tax calculations
- Component receives target allocation from risk profile selection

**Future Enhancements:**
- Integration with brokerage API for one-click execution
- Specific lot selection for partial sales
- Tax bracket-aware calculations (vs flat rates)
- Year-end tax planning mode
- Multi-account rebalancing optimization

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
1. ~~**Factor exposure analysis**~~ ✅ — Show beta, size, value, momentum exposures
2. ~~**Fee analyzer**~~ ✅ — Total expense ratios, annual fee drag
3. ~~**Overlap detection**~~ ✅ — "VTI and VOO are 99% overlapping"
4. ~~**Rebalancing preview**~~ ✅ — Specific trades with tax impact and wash sale warnings
5. **Tax efficiency score** — Rate tax efficiency of current allocation

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
