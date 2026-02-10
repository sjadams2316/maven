# Research Task: Capital Market Assumptions Data

**Priority:** High — needed for portfolio comparison features

---

## Why This Matters

Historical returns make diversification recommendations look bad:
- US Large Cap 10yr: ~13% 
- International 10yr: ~5%

But forward-looking expectations flip this:
- US Large Cap expected: 5-6%
- International expected: 7-8%

**Without CMA data, our recommendations look objectively wrong to users.**

---

## Research Objectives

### 1. Gather Current CMAs from Major Sources

**Research Affiliates (Primary — FREE)**
- URL: https://interactive.researchaffiliates.com/asset-allocation
- Has: Expected returns, volatility, correlations
- Format: Interactive tool, may need scraping

**Vanguard Economic Outlook**
- Search for latest "Vanguard Economic and Market Outlook 2026"
- Usually published January
- Extract: 10-year expected returns by asset class

**J.P. Morgan LTCMA**
- URL: https://am.jpmorgan.com/us/en/asset-management/adv/insights/portfolio-insights/ltcma/
- Annual publication
- Very comprehensive

**BlackRock**
- URL: https://www.blackrock.com/institutions/en-us/insights/charts/capital-market-assumptions
- May require registration

### 2. Build Data Structure

Create `lib/capital-market-assumptions.ts`:

```typescript
interface AssetClassCMA {
  assetClass: string;
  ticker?: string;  // Representative ETF
  expectedReturn: number;  // 10-year annualized
  expectedVolatility: number;
  returnRange: { low: number; high: number };
  source: string;
  asOfDate: string;
  rationale?: string;
}

export const CAPITAL_MARKET_ASSUMPTIONS: Record<string, AssetClassCMA> = {
  'us-large-cap': {
    assetClass: 'US Large Cap',
    ticker: 'VOO',
    expectedReturn: 5.5,
    expectedVolatility: 16.0,
    returnRange: { low: 4.0, high: 7.0 },
    source: 'Research Affiliates',
    asOfDate: '2026-01',
    rationale: 'High current valuations (CAPE ~30) suggest below-average returns'
  },
  'intl-developed': {
    assetClass: 'International Developed',
    ticker: 'VXUS',
    expectedReturn: 7.5,
    expectedVolatility: 17.0,
    returnRange: { low: 6.0, high: 9.0 },
    source: 'Research Affiliates',
    asOfDate: '2026-01',
    rationale: 'Lower valuations (CAPE ~15) and potential dollar weakness'
  },
  // ... etc
};
```

### 3. Document Key Asset Classes

Need CMAs for:
- [ ] US Large Cap (VOO, SPY)
- [ ] US Small Cap (VB, IWM)
- [ ] International Developed (VXUS, VEA)
- [ ] Emerging Markets (VWO, IEMG)
- [ ] US Aggregate Bonds (BND, AGG)
- [ ] US TIPS (TIP)
- [ ] US Corporate Bonds (LQD)
- [ ] High Yield Bonds (HYG)
- [ ] REITs (VNQ)
- [ ] Commodities (DJP, GSG)
- [ ] Cash/Money Market

### 4. Capture Rationale

For each CMA, document WHY:
- What's the valuation argument?
- What's the growth expectation?
- What are the risks to the forecast?

---

## Output

1. **`lib/capital-market-assumptions.ts`** — Data file with CMAs
2. **`memory/research/cma/2026-02-cma-research.md`** — Full research notes
3. **Update domain knowledge** — `memory/pantheon/domain-knowledge/CAPITAL-MARKET-ASSUMPTIONS.md`

---

## Integration Points

Once data is gathered:
1. Portfolio comparison views use CMA for "Expected" projections
2. What-If simulator shows expected vs historical
3. Rebalancing recommendations cite forward expectations
4. Oracle can explain "why international when it's underperformed"

---

## Success Criteria

- [ ] CMAs for 10+ asset classes
- [ ] Sources documented and dated
- [ ] Rationale captured for each
- [ ] TypeScript data structure usable by UI
- [ ] Range estimates (not just point estimates)
