# Integration Team — Knowledge Base

*Data consistency, API contracts, cross-page sync, single source of truth*

---

## Mission

**One number should never appear differently on two pages.**

If net worth is $812,450 on the dashboard, it's $812,450 everywhere.

---

## The Golden Rule

```
Data flows ONE direction:
  Source → Calculation → Display

Never:
  Display A calculates → Display B calculates differently
```

---

## Canonical Data Sources

| Data Type | Source of Truth | File |
|-----------|-----------------|------|
| Demo holdings | `DEMO_PROFILE` | `lib/demo-profile.ts` |
| Portfolio calculations | `portfolio-utils` | `lib/portfolio-utils.ts` |
| Tax calculations | `tax-utils` | `lib/tax-utils.ts` |
| Live prices | `useLivePrices` hook | `hooks/useLivePrices.ts` |
| Market data | `/api/market-data` | `api/market-data/route.ts` |

---

## Data Consistency Checklist

Before shipping ANY change that touches data:

- [ ] Same calculation used everywhere?
- [ ] Single source of truth identified?
- [ ] No duplicate logic in components?
- [ ] Changes propagate to all consumers?

---

## Common Sync Issues

### Issue: Dashboard shows different net worth than Portfolio Lab

**Root cause:** Different calculation paths
```typescript
// Dashboard
const netWorth = accounts.reduce((sum, a) => sum + a.balance, 0);

// Portfolio Lab  
const netWorth = holdings.reduce((sum, h) => sum + h.value, 0);
```

**Fix:** Extract to shared function
```typescript
// lib/portfolio-utils.ts
export function calculateNetWorth(data: PortfolioData): number {
  return data.holdings.reduce((sum, h) => sum + h.value, 0);
}

// Both pages import and use the same function
```

### Issue: Holdings count differs across pages

**Root cause:** Some pages consolidate, others don't
```typescript
// Page A: Shows 24 holdings (raw)
// Page B: Shows 18 holdings (consolidated by ticker)
```

**Fix:** Be explicit about consolidation
```typescript
const rawHoldings = getHoldings(); // 24 items
const consolidated = consolidateByTicker(rawHoldings); // 18 items

// Display which one you're using
<span>{consolidated.length} holdings (consolidated)</span>
```

### Issue: Prices lag behind on some pages

**Root cause:** Different refresh intervals
```typescript
// Dashboard: refreshes every 60s
// Portfolio Lab: refreshes every 300s
```

**Fix:** Centralize price fetching
```typescript
// Use same SWR key and interval everywhere
const { data } = useSWR('/api/prices', fetcher, {
  refreshInterval: 60000,
  dedupingInterval: 30000,
});
```

---

## API Contract Patterns

### Standard Response Format
```typescript
interface ApiResponse<T> {
  data: T;
  meta: {
    timestamp: string;
    source: string;
    cached: boolean;
  };
}

interface ApiError {
  error: string;
  message: string;
  code: string;
  hint?: string;
}
```

### Versioning
When changing API responses:
1. Add new fields (backwards compatible)
2. Deprecate old fields (don't remove immediately)
3. Document in API route comments

---

## Cross-Page Navigation

When navigating with data:

```typescript
// WRONG: Recalculate on every page
<Link href="/portfolio-lab">Analyze</Link>
// Portfolio Lab fetches and recalculates everything

// RIGHT: Share context
<PortfolioProvider>
  <Dashboard />    {/* Calculates once */}
  <PortfolioLab /> {/* Uses same data */}
</PortfolioProvider>
```

---

## Testing for Consistency

### Manual Check
1. Open Dashboard, note net worth
2. Open Portfolio Lab, verify same
3. Open Client Portal, verify same
4. Check after 1 minute (prices update)

### Automated Check
```typescript
// Future: Integration test
test('net worth consistent across pages', async () => {
  const dashboard = await fetch('/api/dashboard').then(r => r.json());
  const portfolio = await fetch('/api/portfolio').then(r => r.json());
  
  expect(dashboard.netWorth).toBe(portfolio.netWorth);
});
```

---

## Blast Radius Protocol

When fixing a data bug:

1. **Identify the pattern** — What's inconsistent?
2. **Find all instances** — `grep -r "calculateNetWorth"` 
3. **Fix at the source** — Update the canonical function
4. **Verify everywhere** — Check ALL pages that use this data

---

## Learnings Applied

- **L004:** Demo data from ONE canonical source
- **L019:** Consolidate same tickers across accounts
- **L020:** API responses need consistent structure

---

*Consistency builds trust. Inconsistency destroys it.*
