# Session Log: Factor Exposure Analysis Implementation

*Date: 2026-02-09*
*Sprint: Portfolio Lab Sprint 1*
*Duration: ~90 minutes*

---

## Objective

Implement Factor Exposure Analysis in Portfolio Lab — the #1 research item in the backlog.

---

## Research Phase (30 min)

### Factor Models Studied

**Academic Foundation:**
- **CAPM (1964)**: Capital Asset Pricing Model — market beta as single factor
- **Fama-French 3-Factor (1992)**: Added Size (SMB) and Value (HML)
- **Carhart 4-Factor (1997)**: Added Momentum
- **Fama-French 5-Factor (2015)**: Added Profitability (RMW) and Investment (CMA)

**Practitioner Models:**
- Morningstar Style Box (size × value)
- MSCI Factor Indices
- AQR Factor Strategies
- Quality factor (profitability + financial health)

### Data Requirements Identified

| Approach | Accuracy | Complexity | Cost |
|----------|----------|------------|------|
| Returns-based regression | High | Complex | Free (need historical data) |
| Morningstar factor loadings | High | API integration | $25-50K/year |
| ETF characteristic mapping | Medium | Simple | Free |
| Heuristic estimation | Medium-Low | Simple | Free |

**Decision:** Start with heuristic estimation based on ticker characteristics. Can upgrade to real factor loadings when Morningstar integration happens.

### Display Options Considered

1. **Radar/Spider Chart** — Rejected: Harder to read, not mobile-friendly
2. **Horizontal Bar Chart** — Selected: Intuitive, mobile-responsive
3. **Heatmap** — Rejected: Better for comparing multiple portfolios
4. **Numeric Table** — Rejected: Less visual impact

---

## Development Phase (60 min)

### Files Created/Modified

1. **`src/lib/portfolio-utils.ts`** — Added factor calculation utilities
   - `FactorExposures` interface
   - `TICKER_FACTOR_PROFILES` — ~60 common ETFs/stocks with factor profiles
   - `DEFAULT_FACTOR_BY_CLASS` — Fallbacks for unknown tickers
   - `getTickerFactorExposures()` — Get factors for single ticker
   - `calculatePortfolioFactorExposures()` — Weighted portfolio average
   - `getFactorInterpretation()` — Plain-English analysis
   - `getBenchmarkFactorExposures()` — S&P 500, 60/40, Total Market

2. **`src/app/components/FactorExposureSection.tsx`** — New component
   - Visual bar chart for 5 factors
   - Benchmark comparison toggle
   - Interpretation section with risk level
   - Responsive design (mobile-first)
   - Tooltips via existing `<Term>` component

3. **`src/app/components/InfoTooltip.tsx`** — Added factor glossary terms
   - factor-exposure, market-beta, size-factor, value-factor, momentum-factor, quality-factor

4. **`src/app/portfolio-lab/page.tsx`** — Integration
   - Added import for FactorExposureSection
   - Placed in Analysis tab after Holdings Analysis

### Architecture Decisions

- **Calculated client-side**: Aligns with existing pattern, no API changes needed
- **Heuristic-based**: Explicit factor profiles for known tickers, fallback by asset class
- **Normalized scale**: Most factors -1 to +1, Beta 0.5 to 1.5
- **Benchmark comparison**: Optional toggle, defaults to Total Market

---

## Testing Phase (20 min)

### Persona Validation

**Power User (Morgan Maven):**
- ✅ 45+ holdings processed correctly
- ✅ Factor bars show expected tilts (growth-heavy portfolio shows negative value)
- ✅ Interpretation matches portfolio characteristics
- ✅ Benchmark comparison provides context

**Basic User (Jordan Starter):**
- ✅ 5 holdings work fine
- ✅ Simple interpretation not overwhelming
- ✅ Educational tooltips help understanding
- ✅ "Well-diversified" message for balanced portfolio

**Retiree (Pat Pension):**
- ✅ Low beta displayed (defensive)
- ✅ Quality factor high (stable companies)
- ✅ Reassuring interpretation: "Defensive quality portfolio"
- ✅ Green color scheme for low risk

### Build Validation

```bash
npm run build
# ✓ Compiled successfully
# ✓ TypeScript passes
# ✓ No unused imports
```

---

## Key Learnings

### What Worked Well

1. **Heuristic approach is viable** — For MVP, explicit factor profiles + asset class fallbacks provide reasonable accuracy without external data dependencies

2. **Plain-English interpretation matters** — Users don't need to understand Fama-French to benefit; the summary tells them what matters

3. **Benchmark comparison adds context** — "Beta 1.2" means more when you see the benchmark is 1.0

4. **Existing component patterns** — Using `<Term>` for tooltips kept consistency

### What Could Be Improved

1. **Factor accuracy** — Heuristic estimates are approximations; real factor loadings would be more accurate

2. **Fund look-through** — ETFs have underlying holdings with their own factors; we're treating them as single entities

3. **Time-varying factors** — Factors change over time; our static profiles don't capture this

4. **More tickers** — Only ~60 explicit profiles; would benefit from more coverage

### Technical Debt Identified

1. Factor profiles should move to a separate data file (not inline in portfolio-utils.ts)
2. Could add factor contribution breakdown (which holdings drive each factor)
3. Should cache factor calculations for large portfolios

---

## Next Steps

1. **Fee Analyzer** — Next P0 item in backlog
2. **Overlap Detection** — Identify redundant holdings
3. **Factor Loading Integration** — When Morningstar API is available
4. **Factor Contribution View** — Show which holdings drive each factor

---

## Artifacts

- Component: `src/app/components/FactorExposureSection.tsx`
- Utils: `src/lib/portfolio-utils.ts` (factor functions)
- Glossary: `src/app/components/InfoTooltip.tsx` (factor terms)
- Integration: `src/app/portfolio-lab/page.tsx` (Analysis tab)

---

*Session completed. Factor Exposure Analysis is live in Portfolio Lab.*
