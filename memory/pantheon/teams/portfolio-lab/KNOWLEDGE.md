# Portfolio Lab Team — Knowledge Base

*Analysis, optimization, stress tests, projections, factor exposure*

---

## Domain Ownership

The Portfolio Lab team owns:
- `/portfolio-lab` page (all 6 tabs)
- `/partners/clients/[id]/analyze` (embedded version)
- Portfolio analysis components used elsewhere
- Factor exposure, stress testing, optimization algorithms

---

## Key Files

```
maven/apps/dashboard/src/app/portfolio-lab/page.tsx
maven/apps/dashboard/src/app/partners/clients/[id]/analyze/page.tsx
maven/apps/dashboard/src/components/portfolio/
maven/apps/dashboard/src/lib/portfolio-utils.ts
```

---

## Tabs & Functionality

| Tab | Purpose | Key Components |
|-----|---------|----------------|
| Analysis | Current allocation, holdings breakdown | AllocationPieChart, HoldingsTable |
| Optimize | Rebalancing suggestions, target vs actual | OptimizationPanel |
| Stress Test | 6 scenarios (2008 crisis, rate shock, etc) | StressTestScenarios |
| Projections | Monte Carlo, retirement runway | ProjectionChart |
| Actions | Actionable recommendations | ActionsList |
| Research | Stock/ETF deep dives | ResearchPanel |

---

## Data Flow

```
DEMO_PROFILE (or real user data)
    ↓
portfolio-utils.ts (calculations)
    ↓
Page component (renders)
    ↓
Child components (charts, tables)
```

**Critical:** All data must flow from ONE canonical source. Never calculate the same thing twice with different logic.

---

## Calculation Patterns

### Allocation Calculation
```typescript
// Group by asset class, sum values
const allocation = holdings.reduce((acc, h) => {
  const assetClass = h.assetClass || 'Other';
  acc[assetClass] = (acc[assetClass] || 0) + h.value;
  return acc;
}, {});
```

### Return Calculation
```typescript
// Weighted average return
const portfolioReturn = holdings.reduce((sum, h) => {
  const weight = h.value / totalValue;
  return sum + (h.return * weight);
}, 0);
```

### Risk Score
```typescript
// Based on equity allocation + concentration
const equityPct = equityValue / totalValue;
const maxPosition = Math.max(...holdings.map(h => h.value / totalValue));
const riskScore = (equityPct * 7) + (maxPosition > 0.2 ? 2 : 0) + 1;
```

---

## Common Issues & Fixes

### Issue: Numbers don't match across pages
**Root cause:** Multiple calculation paths
**Fix:** Extract to `portfolio-utils.ts`, import everywhere

### Issue: Charts show stale data
**Root cause:** Not using live prices when available
**Fix:** Use `useLivePrices` hook, merge with base data

### Issue: Stress test percentages seem wrong
**Root cause:** Not accounting for asset class betas
**Fix:** Apply asset-class-specific multipliers

---

## Testing Checklist

- [ ] Allocation pie totals 100%
- [ ] Holdings table values sum to net worth
- [ ] Stress test shows realistic losses (not all -50%)
- [ ] Projections use reasonable return assumptions (5-7%)
- [ ] Mobile: Charts readable, tables scroll horizontally

---

## Learnings Applied (from LEARNINGS-v2.md)

- **L004:** Demo data from ONE canonical source
- **L019:** Consolidate same tickers across accounts
- **L025:** Allocation must account for all asset classes
- **L026:** Factor exposure needs benchmark comparison
- **L027:** Stress test scenarios need asset-class betas

---

## Integration Points

| Integrates With | How |
|-----------------|-----|
| Dashboard | Allocation summary component |
| Client Portal | Simplified read-only view |
| Oracle | Can answer "analyze my portfolio" |
| Tax Intelligence | Embedded gain/loss in holdings |

---

*Update this file when you discover new patterns or fix new issues.*
