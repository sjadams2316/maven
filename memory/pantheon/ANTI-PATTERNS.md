# Anti-Patterns — What NOT To Do

*Failures, bugs, and mistakes we've learned from. Read this to avoid repeating history.*

---

## Code Anti-Patterns

### ❌ Client-side API calls to Yahoo Finance
**What happened:** CORS errors, blocked requests, broken Market widget
**Why it failed:** Yahoo blocks browser requests, Vercel IPs get rate-limited
**Do instead:** Server-side API routes with fallback data

### ❌ Untyped empty arrays
```typescript
// BAD
let items = [];

// GOOD  
let items: MyType[] = [];
```
**Why it failed:** TypeScript can't infer types, causes downstream errors

### ❌ Direct API data access without optional chaining
```typescript
// BAD — crashes if any level is undefined
const price = data.chart.result[0].meta.price;

// GOOD
const price = data?.chart?.result?.[0]?.meta?.price || 0;
```

### ❌ Health checks on different endpoints than app uses
**What happened:** FMP showed "down" but stock-research worked fine
**Why it failed:** Health check tested `/profile/AAPL`, app used `/quote/`
**Do instead:** Health checks must mirror actual usage

---

## UX Anti-Patterns

### ❌ Showing technical errors to users
**What happened:** "HTTP 403" displayed in UI
**Why it failed:** Users don't know what 403 means, causes anxiety
**Do instead:** Friendly messages: "slow", "offline", "updating..."

### ❌ Alarming status indicators for non-critical issues
**What happened:** "Degraded" badge with pulsing animation
**Why it failed:** Creates anxiety when data is actually loading fine
**Do instead:** Hide when healthy, soft messaging when partial

### ❌ Showing dashes or blanks for missing data
**What happened:** "—" for stock prices when API failed
**Why it failed:** Looks broken, undermines trust
**Do instead:** Fallback data with "Delayed" indicator

### ❌ Touch targets under 48px
**What happened:** Tab buttons too small to tap on mobile
**Why it failed:** 44px is minimum, 48px is comfortable
**Do instead:** `min-h-[48px] min-w-[48px]` on all tappable elements

### ❌ Grids that overflow on mobile
**What happened:** 3-column grids broke at 375px
**Why it failed:** Not mobile-first responsive
**Do instead:** `grid-cols-1 sm:grid-cols-3` (mobile-first)

---

## Process Anti-Patterns

### ❌ Announcing "shipped" before verifying deploy
**What happened:** Code pushed but Vercel deploy failed (GitHub outage)
**Why it failed:** No production verification step
**Do instead:** Wait 60s, curl production URL, confirm 200

### ❌ Large multi-file tasks for agents
**What happened:** Agents got confused, produced inconsistent results
**Why it failed:** Too much context, unclear scope
**Do instead:** Atomic tasks: 1-2 files, <200 lines, single responsibility

### ❌ Spawning agents on same file simultaneously
**What happened:** Merge conflicts, overwritten work
**Why it failed:** No coordination mechanism
**Do instead:** Check PANTHEON-STATUS.md, use file locks

### ❌ Aggressive polling/retrying on outages
**What happened:** Burned API credits during GitHub outage
**Why it failed:** Retry loops don't help when external service is down
**Do instead:** Check status page, let crons handle monitoring

---

## Business Anti-Patterns

### ❌ Comparing to robo-advisors
**Why it's wrong:** Robos are commoditized, low-margin, bad positioning
**Do instead:** "Intelligence layer" / "Palantir for wealth"

### ❌ Leading with team credentials
**Why it's wrong:** Sounds like every other pitch, not differentiating
**Do instead:** Lead with vision, product, and unique capabilities

### ❌ Showing internal user data in demos
**Why it's wrong:** Privacy concern, confusing for prospects
**Do instead:** Demo mode completely isolated, uses demo data only

---

## When You Find a New Anti-Pattern

1. Document what happened
2. Explain why it failed
3. State what to do instead
4. Add to appropriate section above

*Every bug is a gift — it teaches us what not to do.*
