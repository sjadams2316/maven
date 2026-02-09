# Market Fragility — Team Knowledge Base

*Last Updated: 2026-02-09*
*Team: Market Fragility*

---

## Mission

Protect portfolios before crashes happen. Be the early warning system that gives clients confidence.

---

## Current State

### Features Built
- **Market Fragility Index™** — 8 pillars, 40+ indicators
- **Fragility Dashboard** — Visual indicator display
- **Personalized Impact Analysis** — How fragility affects YOUR portfolio

### Code Location
- Fragility page: `apps/dashboard/src/app/fragility/page.tsx`
- Fragility API: `apps/dashboard/src/app/api/fragility-index/`

### The 8 Pillars

1. **Volatility Regime** — VIX levels, term structure, realized vs implied
2. **Credit Stress** — Spreads, defaults, lending conditions
3. **Liquidity Conditions** — Bid-ask spreads, market depth, repo rates
4. **Sentiment Extremes** — Put/call ratio, AAII survey, fund flows
5. **Valuation Stretch** — P/E ratios, CAPE, price to sales
6. **Macro Divergence** — Yield curve, leading indicators, PMI
7. **Technical Breakdown** — Breadth, trends, support/resistance
8. **Contagion Risk** — Correlations, cross-market stress

---

## Domain Expertise

### Volatility Indicators

**VIX (Fear Index):**
- <15: Complacency
- 15-25: Normal
- 25-35: Elevated fear
- >35: Panic

**VIX Term Structure:**
- Contango (normal): Near-term < Far-term
- Backwardation (stress): Near-term > Far-term

### Credit Indicators

**High Yield Spreads:**
- <300bps: Risk-on
- 300-500bps: Normal
- 500-700bps: Stress
- >700bps: Crisis

**Investment Grade Spreads:**
- Similar pattern, tighter ranges
- Widening spreads = risk aversion

### Historical Crashes (Reference)

| Event | Drop | VIX Peak | Duration |
|-------|------|----------|----------|
| 2008 Financial Crisis | -57% | 89.5 | 17 months |
| 2020 COVID Crash | -34% | 82.7 | 1 month |
| 2022 Rate Hikes | -25% | 36.5 | 10 months |
| Dot-Com (2000-02) | -49% | 43.7 | 31 months |

---

## Data Sources

**Current:**
- FRED (Federal Reserve Economic Data) — Yields, spreads, economic indicators
- Yahoo Finance — VIX, market prices
- Manual calculation for some indicators

**Target:**
- Bloomberg Terminal (real-time, comprehensive)
- Refinitiv (alternative to Bloomberg)
- CBOE direct feeds (VIX data)

---

## Backlog

### High Priority
1. Real-time indicator updates (currently daily)
2. Personalized alert system ("Your portfolio is 2x exposed to current risks")
3. Push notifications for threshold breaches
4. Historical backtesting ("How would this have warned in 2008?")

### Medium Priority
5. Scenario playbooks ("If fragility hits 80, here's what to consider")
6. De-risking pathways (one-click options to reduce exposure)
7. Correlation matrix with user holdings
8. Sector-specific fragility scores

### Lower Priority
9. Crypto-specific fragility indicators
10. International market fragility
11. Factor-specific risk (value drawdown, momentum crash)

---

## Key Insight

**Fragility ≠ Prediction**

We're not predicting crashes. We're measuring conditions that precede crashes. High fragility doesn't mean crash tomorrow — it means risks are elevated and protection matters more.

Messaging should be: "Conditions suggest caution" not "Crash coming."

---

## Agent Instructions

When working on Fragility:

1. **Don't cry wolf** — False alarms erode trust
2. **Explain the indicators** — Users should understand what they're seeing
3. **Actionable, not scary** — Show what they can DO, not just what's wrong
4. **Personalize impact** — Generic warnings are ignored
5. **Test during calm markets** — Make sure it's useful when nothing is happening

---

*Protection before the storm = why clients stay.*
