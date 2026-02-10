# Capital Market Assumptions (CMAs) — Forward-Looking Returns

*The rearview mirror is misleading. Use forward-looking expected returns for recommendations.*

---

## The Problem

Historical returns ≠ Expected returns.

If we recommend "increase international exposure" but show 10-year historical data:
- US Large Cap: ~13% annualized
- International Developed: ~5% annualized

User sees: "You're telling me to buy the thing that returned 8% less per year?"

**This makes our recommendations look bad even when they're right.**

---

## The Solution: Capital Market Assumptions

CMAs are forward-looking expected returns published by major asset managers. They incorporate:
- Current valuations (P/E ratios, CAPE)
- Interest rate environment
- Earnings growth expectations
- Mean reversion assumptions
- Currency effects

### Why They Matter

| Asset Class | 10yr Historical | 10yr CMA (Forward) | Delta |
|-------------|-----------------|-------------------|-------|
| US Large Cap | ~13% | 5-6% | -7% |
| US Small Cap | ~9% | 6-7% | -2% |
| Int'l Developed | ~5% | 7-8% | +3% |
| Emerging Markets | ~4% | 8-9% | +5% |
| US Aggregate Bond | ~1.5% | 4-5% | +3% |
| TIPS | ~2% | 4-5% | +2% |

**Key Insight:** International and EM are *expected* to outperform US going forward because:
1. Lower starting valuations (US at CAPE ~30, Int'l at CAPE ~15)
2. Mean reversion in equity returns
3. Dollar potentially weakening from highs
4. Higher dividend yields abroad

---

## CMA Data Sources

### Free / Scrapeable
1. **Vanguard Economic and Market Outlook** (annual)
   - URL: https://investor.vanguard.com/investor-resources-education/news/vanguard-economic-and-market-outlook
   - Usually published January
   
2. **Research Affiliates Asset Allocation Interactive**
   - URL: https://interactive.researchaffiliates.com/asset-allocation
   - Real-time CMA estimates
   - FREE and comprehensive
   
3. **BlackRock Investment Institute Capital Market Assumptions**
   - URL: https://www.blackrock.com/institutions/en-us/insights/charts/capital-market-assumptions
   - Requires email signup
   
4. **J.P. Morgan Long-Term Capital Market Assumptions**
   - URL: https://am.jpmorgan.com/us/en/asset-management/adv/insights/portfolio-insights/ltcma/
   - Annual publication (usually November)

### Paid
- Morningstar Expected Returns
- FactSet
- Bloomberg Terminal

### Internal/Special Access
5. **Capital Group** (Sam's employer)
   - URL: https://www.capitalgroup.com/advisor/insights.html
   - Proprietary research, American Funds perspective
   - May have internal access to deeper research

---

## How to Display in UI

### Comparison View Should Show BOTH:

```
┌─────────────────────────────────────────────────────────┐
│ Performance Comparison                                   │
├─────────────────────────────────────────────────────────┤
│                    Current    Proposed    Difference    │
│ ─────────────────────────────────────────────────────── │
│ HISTORICAL (Looking Back)                               │
│   10-Year Return      13.1%      9.8%       -3.3%  ⚠️   │
│   5-Year Return       15.2%     11.4%       -3.8%  ⚠️   │
│                                                         │
│ EXPECTED (Looking Forward)                              │
│   10-Year CMA          5.5%      6.8%       +1.3%  ✓    │
│   Risk-Adjusted Exp.   0.38      0.52       +0.14  ✓    │
│                                                         │
│ ─────────────────────────────────────────────────────── │
│ 💡 Why the difference?                                  │
│ US equities have outperformed expectations for a        │
│ decade. Current valuations suggest lower future         │
│ returns. International markets offer better expected    │
│ returns from lower starting valuations.                 │
└─────────────────────────────────────────────────────────┘
```

### Key UX Elements:
1. **Label sections clearly**: "Historical (Looking Back)" vs "Expected (Looking Forward)"
2. **Explain the delta**: When historical looks bad but expected looks good, explain WHY
3. **Show both**: Don't hide historical — that would be misleading. Show both and educate.
4. **Confidence indicators**: CMAs have uncertainty ranges (e.g., 5-7% expected return)

---

## Dollar Impact Projections

When showing dollar projections, show BOTH:

```
Based on $100,000 portfolio over 10 years:

Historical-based projection:
  Current allocation: $340,000  (13% CAGR)
  Proposed allocation: $253,000  (9.8% CAGR)
  
Expected-return projection (CMAs):
  Current allocation: $170,000  (5.5% CAGR)
  Proposed allocation: $193,000  (6.8% CAGR)
  
💡 Past performance has favored US concentration. 
   Forward expectations favor diversification.
```

---

## Research Tasks for Pantheon

### Immediate
1. Scrape Research Affiliates for current CMA data
2. Build CMA data structure in `lib/capital-market-assumptions.ts`
3. Integrate into portfolio comparison views

### Ongoing
1. Quarterly CMA refresh task (cron)
2. Track CMA accuracy over time (did 2020 CMAs predict 2025 returns?)
3. Build "CMA Explainer" component for education

---

## Anti-Pattern to Avoid

❌ **Showing only historical returns for forward-looking recommendations**
- Makes diversification look bad (US has crushed everything)
- Leads users to performance chase into overvalued assets
- Is actually misleading — it implies past = future

✅ **Show historical AND expected returns, with explanation**
- Transparent about what we know and don't know
- Educates users on why valuations matter
- Builds trust through honesty about uncertainty

---

*This is domain expertise. Capture it. Use it. Compound it.*
