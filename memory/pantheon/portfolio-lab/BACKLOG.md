# Portfolio Lab — Backlog

*Last Updated: 2026-02-09*

---

## Current Sprint

### In Progress
- None currently

### Ready
1. **Fee Analyzer** — P0
   - Calculate total expense ratios
   - Show annual fee drag in dollars
   - Suggest lower-cost alternatives

2. **Overlap Detection** — P0
   - Identify overlapping holdings ("VTI and VOO are 99% overlapping")
   - Suggest consolidation opportunities

---

## Prioritized Backlog

### P0 — Do Next
- [ ] Fee analyzer
- [ ] Overlap detection ("VTI and VOO are 99% overlapping")
- [ ] Tax efficiency score
- [ ] Factor loading accuracy improvements (real data integration)

### P1 — Important
- [ ] Benchmark comparison (vs. 60/40, vs. age-based)
- [ ] Income analysis (dividend yield, projected income)
- [ ] Correlation matrix visualization
- [ ] Historical performance backtest

### P2 — Nice to Have
- [ ] Peer comparison
- [ ] Risk capacity questionnaire
- [ ] What-if scenarios
- [ ] Export/share PDF reports

### P3 — Future
- [ ] Real-time streaming prices
- [ ] Morningstar X-ray integration
- [ ] AI-generated portfolio review reports
- [ ] Automated rebalancing recommendations

---

## Completed

### 2026-02-09
- [x] **Factor Exposure Analysis** — Full implementation
  - Market Beta, Size, Value, Momentum, Quality factors
  - Visual bar representation with benchmark comparison
  - Plain-English interpretations with risk assessment
  - Tooltips explaining each factor
  - Works with user holdings from UserProvider
- [x] Mobile responsiveness fixes
- [x] Data consistency (use calculateAllocationFromFinancials)

### 2026-02-08
- [x] Asset classification mapping (200+ Morningstar categories)
- [x] Portfolio-utils.ts centralized functions

### 2026-02-07
- [x] Full 5-tab experience built
- [x] Stress test scenarios (6 historical events)
- [x] Monte Carlo projections

---

## Bug Fixes Needed
- [ ] Cost basis $0 display issue
- [ ] Stress test percentages rounding

---

## Tech Debt
- [ ] Extract stress test logic into separate utility
- [ ] Add TypeScript strict mode compliance
- [ ] Unit tests for portfolio calculations

---

*Update this file when picking up or completing work.*
