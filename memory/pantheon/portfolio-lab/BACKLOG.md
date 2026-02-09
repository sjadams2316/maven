# Portfolio Lab — Backlog

*Last Updated: 2026-02-09 15:13 EST*

---

## Prioritized Backlog

### P0 — Do Next
- [x] Fee analyzer ✅ (2026-02-09)
- [x] Overlap detection ✅ (2026-02-09)
- [x] What-If Trade Simulator ✅ (2026-02-09)
- [ ] Factor loading accuracy (real Morningstar data when available)

### P1 — Important  
- [x] Benchmark comparison (vs S&P 500, 60/40) ✅ (2026-02-09)
- [x] Income analysis (dividend yield, projected income) ✅ (2026-02-09)
- [x] Rebalancing preview with tax-aware trades ✅ (2026-02-09)
- [x] Wash sale tracker ✅ (2026-02-09)
- [ ] Correlation matrix visualization
- [ ] Historical performance backtest

### P2 — Nice to Have
- [ ] Peer comparison (vs similar portfolios)
- [ ] Risk capacity questionnaire integration
- [ ] Export/share PDF reports
- [ ] Multi-account view (aggregate across accounts)

### P3 — Future
- [ ] Real-time streaming prices
- [ ] Morningstar X-ray integration (when licensed)
- [ ] AI-generated portfolio review reports
- [ ] Automated rebalancing execution

---

## Completed This Sprint (2026-02-09)

| Feature | Lines | Notes |
|---------|-------|-------|
| WhatIfSimulator | 1,340 | Full gamification, A+ to F grades |
| OverlapDetection | 481 | VTI/VOO overlap detection, consolidation suggestions |
| BenchmarkComparison | 476 | vs S&P 500, 60/40, age-based |
| FeeAnalyzer | ~300 | Real $ fees, switch recommendations |
| IncomeAnalysis | ~250 | Dividend yield, projected annual income |
| RebalancingPreview | ~400 | Tax-aware trade list |
| WashSaleTracker | ~300 | 61-day window visualization |

**Total: ~3,500 lines of new functionality in one day**

---

## Tech Debt

- [ ] portfolio-lab/page.tsx is 2,900+ lines — needs component extraction
- [ ] Some duplicate code between demo and dashboard
- [ ] Missing loading states on some sections
- [ ] Error boundaries needed for component isolation
