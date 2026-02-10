# Task: Portfolio Compare Enhancement

**Why This Matters (The Learning):**
The current Compare feature shows allocation percentages side-by-side but gives users no decision-grade data. Advisors and investors need to see:
- Historical performance across timeframes (1, 3, 5, 10yr)
- Risk-adjusted metrics (Sharpe, Max Drawdown, Volatility)
- Specific ticker recommendations (not just "buy international")
- Visual portfolio comparisons (pie charts)

Without this, users can't actually make an informed rebalancing decision.

---

## Current State

The Optimize tab in `portfolio-optimizer/page.tsx` shows:
1. Allocation bars (US Equity 85% → 65%)
2. Generic trade suggestions ("Sell US Equity", "Buy International")
3. A modal with only before/after standard deviation

## Required Enhancements

### 1. Performance Metrics Table
Show side-by-side comparison:

| Metric | Current Portfolio | Proposed Portfolio | Δ |
|--------|------------------|-------------------|---|
| 1-Year Return | 24.5% | 18.2% | -6.3% |
| 3-Year Return (Ann.) | 11.2% | 9.8% | -1.4% |
| 5-Year Return (Ann.) | 14.1% | 12.5% | -1.6% |
| 10-Year Return (Ann.) | 12.8% | 11.2% | -1.6% |
| Since Common Inception | — | — | — |
| Sharpe Ratio | 0.92 | 1.05 | +0.13 ✓ |
| Max Drawdown | -28.5% | -22.1% | +6.4% ✓ |
| Volatility (Std Dev) | 16.2% | 12.8% | -3.4% ✓ |

**Key Insight:** Show WHY the proposed portfolio might have lower returns — it's trading return for risk reduction.

### 2. Specific Ticker Recommendations

Replace vague "Buy International" with:

```
SELL:
- QQQ: 40 shares ($21,000) → reason: Tech overweight
- VOO: 22 shares ($11,400) → reason: Reallocating to int'l

BUY:
- VXUS: 312 shares ($19,400) → Vanguard Total Int'l Stock
  • Expense: 0.07% | 4★ Rating | Diversified int'l exposure
- BND: 225 shares ($16,200) → Vanguard Total Bond  
  • Expense: 0.03% | 5★ Rating | Core bond exposure
```

### 3. Pie Chart Visualizations

Two side-by-side pie charts:
- **Current Portfolio** - show actual holdings with labels
- **Proposed Portfolio** - show what it would look like after rebalance

Use simple donut charts with:
- Asset class colors (equities=blue, bonds=green, int'l=purple)
- Ticker labels on larger slices
- Interactive hover for details

### 4. "Common Inception" Performance

Calculate what both portfolios would have returned if you started with both on the same date (use earliest common fund inception date).

---

## Data Sources

The mock data in `lib/mock-morningstar-data.ts` already has:
```typescript
performance: {
  ytd: number;
  oneYear: number;
  threeYear: number;
  fiveYear: number;
  tenYear: number;
  sinceInception: number;
}

riskMetrics: {
  standardDeviation: number;
  sharpeRatio: number;
  maxDrawdown: number;
  // ...
}
```

**Calculate portfolio-level metrics** by weighting individual holdings.

---

## UI Location

Enhance the "Compare to Model Portfolios" section in the Optimize tab:
1. Keep existing model selector buttons
2. Add new "Performance Comparison" card below allocation bars
3. Add "Specific Trades" card with ticker-level detail
4. Add "Visual Comparison" card with pie charts

---

## Success Criteria

1. User can see historical returns across 1, 3, 5, 10yr timeframes
2. Risk metrics (Sharpe, Max Drawdown, Volatility) are compared
3. Specific ETF/fund recommendations with ticker, shares, and rationale
4. Pie charts show current vs proposed allocation visually
5. Colors indicate whether changes improve metrics (green) or trade off (amber)

---

## Meta-Learning to Capture

**Category:** UX, Product

**Learning:** 
Compare/rebalance features need decision-grade data to be actionable. Showing allocation percentages alone is like showing someone two houses and only telling them the square footage. Users need:
- Performance metrics over multiple timeframes (1, 3, 5, 10yr, since inception)
- Risk-adjusted metrics (Sharpe, Max Drawdown, Volatility)  
- Specific security recommendations with tickers, not just categories
- Visual comparisons (pie charts, not just bars)
- Clear indicators of trade-offs (you're reducing returns for lower risk)

**Anti-Pattern to Add:**
"Thin comparison views — showing side-by-side percentages without performance metrics, risk data, or specific recommendations. Users can't make decisions without decision-grade data."
