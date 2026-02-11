# Retirement Team — Knowledge Base

*Social Security optimization, RMDs, 401k analysis, decumulation strategies*

---

## Domain Ownership

The Retirement team owns:
- Social Security optimizer
- RMD calculator
- 401k/IRA analysis
- Retirement income planning
- Decumulation strategies

---

## Key Files

```
maven/apps/dashboard/src/app/retirement/
maven/apps/dashboard/src/components/retirement/
maven/apps/dashboard/src/lib/retirement-utils.ts
```

---

## Social Security Optimization

### Key Ages
- 62: Earliest claiming (reduced ~30%)
- 67: Full Retirement Age (FRA) for most
- 70: Maximum benefit (+24% vs FRA)

### Break-Even Analysis
```typescript
function calculateBreakEven(
  benefit62: number,
  benefit67: number,
  benefit70: number
): { claim67vs62: number; claim70vs67: number } {
  // Years to break even waiting vs claiming early
  const monthlyDiff62to67 = benefit67 - benefit62;
  const totalLost62to67 = benefit62 * 12 * 5; // 5 years of benefits
  const breakEven67vs62 = totalLost62to67 / (monthlyDiff62to67 * 12);
  
  // Similar for 67 vs 70
  return { claim67vs62: 67 + breakEven67vs62, claim70vs67: /* ... */ };
}
```

### Spousal Coordination
- Spouse can claim on worker's record (up to 50% of worker's PIA)
- Survivor benefits (up to 100% of deceased's benefit)
- Strategy: Higher earner delays, lower earner claims early

---

## RMD Calculations

### 2024 Uniform Lifetime Table (excerpt)
```typescript
const RMD_TABLE = {
  72: 27.4, 73: 26.5, 74: 25.5, 75: 24.6,
  76: 23.7, 77: 22.9, 78: 22.0, 79: 21.1,
  80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7,
  // ... continues
};

function calculateRMD(accountBalance: number, age: number): number {
  const divisor = RMD_TABLE[age];
  return accountBalance / divisor;
}
```

### SECURE Act 2.0 Changes
- RMD age: 73 (2023-2032), then 75 (2033+)
- Roth 401k: No RMDs starting 2024
- Penalty reduced: 25% (was 50%)

---

## 401k Analysis

### Fee Impact Calculator
```typescript
function calculateFeeImpact(
  balance: number,
  annualReturn: number,
  expenseRatio: number,
  years: number
): number {
  const withFees = balance * Math.pow(1 + annualReturn - expenseRatio, years);
  const withoutFees = balance * Math.pow(1 + annualReturn, years);
  return withoutFees - withFees;
}

// Example: $500k, 7% return, 0.5% fees, 20 years
// Fee drag: ~$150,000 lost to fees
```

### Employer Match Optimization
```typescript
interface MatchAnalysis {
  matchFormula: string;        // "100% up to 6%"
  optimalContribution: number; // Get full match
  freeMoneyLeft: number;       // If not maximizing
}
```

---

## Decumulation Strategies

### Withdrawal Order (Tax-Efficient)
1. **Taxable accounts** — Use up low-basis first
2. **Tax-deferred (401k/IRA)** — Bridge years
3. **Roth** — Last (tax-free growth maximized)

### The 4% Rule
- Historical: Withdraw 4% year 1, adjust for inflation
- Modern view: 3.5-4.5% depending on flexibility
- Guardrails: Reduce if portfolio drops >20%

### Bucket Strategy
```
Bucket 1: Cash (1-2 years expenses)
Bucket 2: Bonds (3-5 years)
Bucket 3: Stocks (6+ years)
```

---

## Common Issues & Fixes

### Issue: SS estimate way off
**Root cause:** Using current earnings, not projected
**Fix:** Factor in earnings growth to FRA

### Issue: RMD shows for Roth
**Root cause:** Not checking account type
**Fix:** Exclude Roth IRAs and Roth 401ks (post-2024)

### Issue: 401k rollover analysis missing fees
**Root cause:** Only comparing returns
**Fix:** Include plan fees, fund fees, and advisory fees

---

## Testing Checklist

- [ ] SS optimizer shows all three claiming ages
- [ ] Break-even years are reasonable (typically 78-82)
- [ ] RMD calculation matches IRS tables
- [ ] 401k fee impact shows real dollar amounts
- [ ] Decumulation shows multi-decade projection

---

## Learnings Applied

- **L025:** Retirement projections need inflation adjustment
- **L027:** SS spousal benefits are complex — show both scenarios

---

## Integration Points

| Integrates With | How |
|-----------------|-----|
| Portfolio Lab | Retirement runway projection |
| Tax Intelligence | Roth conversion analysis |
| Oracle | Answer retirement questions |
| Client Portal | Goal progress toward retirement |

---

*Retirement is the biggest financial event. Get the math right.*
