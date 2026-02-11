# Dashboard Team — Knowledge Base

*Home page, net worth display, market data, first impression*

---

## Domain Ownership

The Dashboard team owns:
- `/demo` page (main demo experience)
- `/` landing page
- Net worth display
- Market status widgets
- Holdings overview
- First impression experience

---

## Key Files

```
maven/apps/dashboard/src/app/demo/page.tsx
maven/apps/dashboard/src/app/page.tsx
maven/apps/dashboard/src/components/dashboard/
maven/apps/dashboard/src/hooks/useLivePrices.ts
maven/apps/dashboard/src/lib/demo-data.ts
```

---

## First Impression Matters

The dashboard is the FIRST thing users see. It must:
1. **Load fast** — No blank screens, use skeletons
2. **Show value immediately** — Net worth prominent
3. **Feel alive** — Live prices, current market data
4. **Build confidence** — Professional, polished, trustworthy

---

## Data Flow

```
DEMO_PROFILE / User Data
    ↓
useLivePrices hook (fetches real prices)
    ↓
Merge with holdings
    ↓
Calculate net worth, allocation
    ↓
Render dashboard
```

---

## Market Status Widget

Shows SPY, QQQ, BTC, TAO with live prices:

```typescript
const MARKET_TICKERS = ['SPY', 'QQQ', 'BTC-USD', 'TAO-USD'];

// Fetch from /api/market-data
const { data, isLoading } = useSWR('/api/market-data', fetcher, {
  refreshInterval: 60000, // Refresh every minute
});
```

**Critical:** Never show "—" or "$0" for prices. Use fallback data.

---

## Net Worth Calculation

```typescript
function calculateNetWorth(accounts: Account[]): number {
  return accounts.reduce((total, account) => {
    const accountValue = account.holdings.reduce((sum, h) => sum + h.value, 0);
    return total + accountValue;
  }, 0);
}
```

**Display format:** `$XXX,XXX` with commas, no decimals for large numbers.

---

## Skeleton Loading

Always show meaningful skeletons, not spinners:

```tsx
// WRONG
{isLoading && <Spinner />}

// RIGHT  
{isLoading && (
  <div className="animate-pulse">
    <div className="h-12 w-48 bg-gray-700 rounded mb-4" /> {/* Net worth */}
    <div className="h-64 bg-gray-700 rounded" />           {/* Chart */}
  </div>
)}
```

---

## Common Issues & Fixes

### Issue: Market data shows "—"
**Root cause:** API timeout or failure, no fallback
**Fix:** Always have fallback prices, show "as of [time]"

### Issue: Net worth flickers on load
**Root cause:** Hydration mismatch (SSR vs client)
**Fix:** Use `suppressHydrationWarning` or client-only rendering

### Issue: Holdings don't update with live prices
**Root cause:** Not merging live data with base holdings
**Fix:** Use `useLivePrices` hook, merge properly

### Issue: Different numbers on different pages
**Root cause:** Multiple calculation paths
**Fix:** Single source of truth (`portfolio-utils.ts`)

---

## Testing Checklist

- [ ] Net worth displays (not $0 or NaN)
- [ ] Market tickers show prices (not "—")
- [ ] Holdings table has all positions
- [ ] Allocation pie totals 100%
- [ ] Mobile: Responsive at 375px
- [ ] No console errors on load

---

## Learnings Applied

- **L001:** API routes need error handling
- **L004:** Demo data from ONE source
- **L007:** Always have fallback data
- **L008:** Timeout external APIs

---

## Integration Points

| Integrates With | How |
|-----------------|-----|
| Portfolio Lab | Links to deeper analysis |
| Market Data API | Live prices |
| Oracle | "Ask about your portfolio" |
| What-If | Quick trade simulation |

---

*The dashboard is the handshake. Make it count.*
