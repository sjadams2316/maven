# Tax Intelligence Team — Knowledge Base

*Tax-loss harvesting, Roth conversions, gain/loss tracking, tax-aware strategies*

---

## Domain Ownership

The Tax Intelligence team owns:
- Tax-loss harvesting scanner
- Roth conversion analyzer
- Capital gains tracking
- Tax-efficient withdrawal strategies
- `/partners/clients/[id]/tax` routes

---

## Key Files

```
maven/apps/dashboard/src/app/partners/clients/[id]/tax/page.tsx
maven/apps/dashboard/src/components/tax/
maven/apps/dashboard/src/lib/tax-utils.ts
```

---

## Core Calculations

### Tax-Loss Harvesting

```typescript
interface HarvestOpportunity {
  ticker: string;
  currentValue: number;
  costBasis: number;
  unrealizedLoss: number;
  holdingPeriod: 'short' | 'long';
  washSaleRisk: boolean;
  suggestedSwap?: string;
}

// Find harvesting opportunities
const opportunities = holdings
  .filter(h => h.unrealizedGain < 0) // Has losses
  .filter(h => !hasWashSaleRisk(h))   // No wash sale
  .sort((a, b) => a.unrealizedGain - b.unrealizedGain); // Biggest loss first
```

### Wash Sale Detection

```typescript
// Check for purchases in 30-day window
function hasWashSaleRisk(holding: Holding, transactions: Transaction[]): boolean {
  const sellDate = new Date();
  const windowStart = subDays(sellDate, 30);
  const windowEnd = addDays(sellDate, 30);
  
  return transactions.some(t => 
    t.ticker === holding.ticker &&
    t.type === 'buy' &&
    t.date >= windowStart &&
    t.date <= windowEnd
  );
}
```

### Tax Bracket Mapping

```typescript
const FEDERAL_BRACKETS_2024 = {
  single: [
    { min: 0, max: 11600, rate: 0.10 },
    { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 },
    { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243725, rate: 0.32 },
    { min: 243725, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 },
  ],
  married: [/* similar */],
};

const LTCG_BRACKETS_2024 = {
  single: [
    { min: 0, max: 47025, rate: 0.00 },
    { min: 47025, max: 518900, rate: 0.15 },
    { min: 518900, max: Infinity, rate: 0.20 },
  ],
  married: [/* similar */],
};
```

---

## Roth Conversion Analysis

```typescript
interface RothConversionAnalysis {
  recommendedAmount: number;
  currentBracket: number;
  bracketHeadroom: number;  // Room before next bracket
  taxCost: number;
  projectedBenefit: number; // Tax-free growth value
  breakEvenYears: number;
}

// Key insight: Convert up to the top of current bracket
function calculateConversionAmount(income: number, filingStatus: string): number {
  const brackets = FEDERAL_BRACKETS_2024[filingStatus];
  const currentBracket = brackets.find(b => income >= b.min && income < b.max);
  return currentBracket ? currentBracket.max - income : 0;
}
```

---

## Common Issues & Fixes

### Issue: TLH shows already-harvested positions
**Root cause:** Not tracking harvested lots
**Fix:** Mark lots as harvested, exclude from future scans

### Issue: Wrong tax bracket applied
**Root cause:** Using marginal rate instead of effective
**Fix:** For projections use effective; for "next dollar" use marginal

### Issue: Wash sale not detected
**Root cause:** Only checking same account
**Fix:** Check ALL accounts (including spouse, IRAs, 401k)

---

## Tax-Aware Swap Suggestions

When harvesting, suggest tax-efficient swaps:

| Selling | Suggest Swap | Why |
|---------|--------------|-----|
| VTI | ITOT | Same exposure, different fund |
| VXUS | IXUS | Same exposure, different fund |
| VOO | IVV | Same S&P 500 exposure |
| VNQ | SCHH | Same REIT exposure |
| Individual stock | Sector ETF | Similar exposure, diversified |

---

## Testing Checklist

- [ ] TLH opportunities show actual losses (not gains)
- [ ] Wash sale warnings appear when appropriate
- [ ] Tax savings estimate uses correct bracket
- [ ] Roth conversion uses bracket headroom correctly
- [ ] No opportunities if portfolio has no losses

---

## Learnings Applied

- **L004:** Tax data from ONE canonical source
- **L019:** Check all accounts for wash sales
- **L025:** Include tax lots, not just positions

---

## Integration Points

| Integrates With | How |
|-----------------|-----|
| Portfolio Lab | Gain/loss column in holdings |
| Oracle | Answer tax questions with context |
| Partners | Advisor tax planning tools |
| What-If | Tax impact of proposed trades |

---

*Tax alpha is real money. Get the calculations right.*
