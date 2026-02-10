# BUG: Net Worth Mismatch Between Dashboard and Portfolio Lab

**Discovered:** 2026-02-09 10:15pm EST (by Data Consistency cron)
**Severity:** HIGH (user-facing, data credibility issue)
**Status:** DOCUMENTED - Fix in morning

## Symptoms
- Dashboard: $575,388.60
- Portfolio Lab: $919,900  
- Discrepancy: ~$344K (60% difference!)

## Root Cause Analysis

### Dashboard Calculation (dashboard/page.tsx:146-159)
```js
let total = financials.totalCash + financials.totalOtherAssets;
allHoldings.forEach(h => { total += h.currentValue || 0; });
total -= financials.totalLiabilities;
```

### Portfolio Lab Calculation (portfolio-lab/page.tsx:378-380)
```js
const totalValue = allHoldings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
```

### The Problem
1. **Dashboard** includes `financials.totalCash + totalOtherAssets` PLUS holdings
2. **Portfolio Lab** ONLY sums holdings' currentValue
3. Neither matches `financials.netWorth` from UserProvider which uses ACCOUNT BALANCES

### Expected Net Worth (per demo-profile.ts comment)
~$687,580 - but neither page shows this!

## Data Structure Issue
DEMO_PROFILE has:
- Account `balance` fields (used by calculateFinancials)
- Account `holdings` arrays with `currentValue` (used by pages)

These SHOULD be equal but might have drifted during edits.

## Fix Options

### Option A: Single Source of Truth (Recommended)
Make all pages use `financials.netWorth` from UserProvider. Don't recalculate.

### Option B: Ensure Consistency
Audit DEMO_PROFILE to ensure account.balance === sum(holdings.currentValue) for all accounts.

### Option C: Remove balance field
Calculate balance dynamically from holdings on load.

## Files to Modify
1. `src/app/dashboard/page.tsx` - use financials.netWorth
2. `src/app/portfolio-lab/page.tsx` - use financials.netWorth or profile context
3. `src/lib/demo-profile.ts` - audit balance vs holdings consistency

## Testing After Fix
- [ ] Dashboard net worth matches Portfolio Lab
- [ ] Both match DEMO_PROFILE expected ~$835K (per MEMORY.md)
- [ ] Allocation percentages consistent across pages
- [ ] All holdings visible in both views
