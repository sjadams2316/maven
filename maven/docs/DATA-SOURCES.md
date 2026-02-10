# Maven Data Sources - Single Source of Truth

This document describes the canonical data flow for financial data across Maven. **All developers must follow this pattern** to ensure consistent portfolio values across pages.

## 🚨 The Problem We're Solving

Different pages showing different portfolio values destroys user trust. If the dashboard shows $835K but portfolio-lab shows $800K, users lose confidence in the platform.

## ✅ The Solution: Consistent Data Flow

### Core Principle

1. **Profile data** (from `useUserProfile()`) contains holdings with static values
2. **Live prices** are fetched from `/api/stock-quote` and applied dynamically
3. **All pages** that display financial values must apply live prices

### Data Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         User Profile                              │
│  (from localStorage in demo mode, database for auth users)       │
│                                                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐   │
│  │ Cash Accounts   │  │ Retirement Accts │  │ Investment Accts│   │
│  │ (balances)      │  │ (holdings)       │  │ (holdings)      │   │
│  └─────────────────┘  └─────────────────┘  └────────────────┘   │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                      useLivePrices Hook                           │
│                                                                   │
│  1. Extracts all tickers from holdings                           │
│  2. Fetches prices from /api/stock-quote                         │
│  3. Returns { livePrices, isLoading, lastUpdated }               │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                    useLiveFinancials Hook                         │
│                                                                   │
│  1. Uses useLivePrices internally                                │
│  2. Calculates live netWorth, totalRetirement, etc.              │
│  3. Returns { financials, livePrices, isLoading }                │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                         Page Component                            │
│                                                                   │
│  Displays consistent, live-price-adjusted financial values       │
└──────────────────────────────────────────────────────────────────┘
```

## 📦 Demo Mode Data Source

When `isDemoMode` is true, the profile comes from `demo-profile.ts`:

```typescript
import { DEMO_PROFILE, GROWTH_HOLDINGS, GROWTH_GOALS } from '@/lib/demo-profile';
```

- **GROWTH_HOLDINGS**: The canonical demo portfolio holdings
- **RETIREE_HOLDINGS**: Alternative demo profile for retirees
- **DEMO_PROFILE**: Full user profile with accounts and holdings
- **GROWTH_GOALS**: Demo financial goals (synced with dashboard)

## 🔧 How to Use Live Prices in a Page

### Option 1: useLiveFinancials (Recommended for most pages)

```typescript
import { useUserProfile } from '@/providers/UserProvider';
import { useLiveFinancials } from '@/hooks/useLivePrices';

export default function MyPage() {
  const { profile, isDemoMode } = useUserProfile();
  const { financials, livePrices, isLoading } = useLiveFinancials(profile, isDemoMode);
  
  // financials.netWorth now reflects live prices
  // financials.allHoldings have currentValue updated with live prices
}
```

### Option 2: useLivePrices (When you need raw prices)

```typescript
import { useUserProfile } from '@/providers/UserProvider';
import { useLivePrices, applyLivePricesToHoldings } from '@/hooks/useLivePrices';

export default function MyPage() {
  const { profile, isDemoMode } = useUserProfile();
  const { livePrices, isLoading } = useLivePrices(profile, isDemoMode);
  
  // Apply live prices to holdings manually
  const liveHoldings = useMemo(() => {
    const allHoldings = [...retirementHoldings, ...investmentHoldings];
    return applyLivePricesToHoldings(allHoldings, livePrices);
  }, [livePrices]);
}
```

### Option 3: Manual Price Application (Specific holdings)

```typescript
// Inside a useMemo or calculation
holdings.forEach(holding => {
  const ticker = holding.ticker.toUpperCase();
  const livePrice = livePrices[ticker];
  const currentValue = livePrice && holding.shares > 0 
    ? holding.shares * livePrice 
    : (holding.currentValue || 0);
  // Use currentValue...
});
```

## 📋 Page Audit Checklist

Each page that displays financial data should:

| Page | Uses Live Prices? | Method |
|------|-------------------|--------|
| `/demo` | ✅ Yes | useLivePrices + useMemo |
| `/portfolio-lab` | ✅ Yes | useLivePrices + useMemo |
| `/tax-harvesting` | ✅ Yes | useLivePrices in opportunities calc |
| `/stress-test` | ✅ Yes | useLiveFinancials |
| `/retirement` | ✅ Yes | useLiveFinancials |
| `/financial-snapshot` | ✅ Yes | useLiveFinancials |
| `/family` | ✅ Yes | useLiveFinancials |
| `/goals` | ✅ Yes | useLiveFinancials + demo goals |
| `/fragility` | ✅ Yes | useLiveFinancials |
| `/oracle` | Uses chat context | Prices sent via context |

## 🔄 Price Refresh

- Prices auto-refresh every **60 seconds**
- Manual refresh available via `refresh()` from hooks
- Loading state available via `isLoading`
- Last update time via `lastUpdated`

## ⚠️ Common Mistakes to Avoid

1. **Using `financials` directly from `useUserProfile()`**
   - ❌ `const { financials } = useUserProfile();`
   - ✅ `const { financials } = useLiveFinancials(profile, isDemoMode);`

2. **Not including `livePrices` in useMemo dependencies**
   - ❌ `useMemo(() => calculate(holdings), [holdings])`
   - ✅ `useMemo(() => calculate(holdings), [holdings, livePrices])`

3. **Using hardcoded mock data instead of demo-profile.ts**
   - ❌ `const MOCK_HOLDINGS = [...]`
   - ✅ `import { GROWTH_HOLDINGS } from '@/lib/demo-profile'`

## 🧪 Testing Consistency

To verify consistent values across pages:

1. Open `/demo` and note the Net Worth
2. Navigate to `/portfolio-lab` - should show same total
3. Check `/financial-snapshot` - should show same values
4. Verify `/tax-harvesting` holdings match

If values differ, check:
- Is the page using `useLivePrices` or `useLiveFinancials`?
- Are `livePrices` in the dependency array of any useMemo?
- Is the page using demo-profile.ts data sources?

## 📁 Key Files

- `/src/hooks/useLivePrices.ts` - Live price hooks
- `/src/lib/demo-profile.ts` - Demo data source of truth
- `/src/providers/UserProvider.tsx` - User context provider
- `/src/app/api/stock-quote/route.ts` - Price API endpoint

---

Last updated: February 2026
