# Anti-Patterns — What NOT To Do

*Failures, bugs, and mistakes we've learned from. Read this to avoid repeating history.*

---

## Code Anti-Patterns

### ❌ Visual data doesn't match reality
**What happened:** Landing page showed red/down charts when markets were actually up. No percentages displayed.
**Why it failed:** Agents checked for 200 responses and console errors but didn't verify displayed data was CORRECT.
**Do instead:** Actually look at the page. Charts should be green when up, red when down. Percentages should show. Test against real-world state.

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

### ❌ Injecting all learnings into every agent
**What happened:** Spawned agents with "read LEARNINGS.md" — 18KB of context injected into every agent
**Why it failed:** At $250+/day, this burns tokens on irrelevant context. A UI task doesn't need API error handling patterns.
**Do instead:** 
1. Use LEARNINGS-v2.md (tagged format)
2. Specify EXACT learning IDs: "Relevant learnings: L004, L019, L020"
3. Reference the Domain-Specific Injection Guide in LEARNINGS-v2.md
4. NEVER say "read all learnings" — always be selective

### ❌ Using estimated/cached prices for calculations
**What happened:** Demo portfolio showed wildly wrong values because I used stale price estimates
**Example:** Estimated IREN at $12.80, actual was $46.15 (260% wrong!)
**Why it failed:** Prices change. Old estimates become fantasy numbers.
**Do instead:** 
```bash
# ALWAYS fetch current price before calculating
curl -s "https://yourapi.com/stock-quote?symbol=IREN" | jq '.price'
# THEN do your math
```

### ❌ Disabling live data to "fix" inconsistencies
**What happened:** Demo showed different values across pages. First fix was to disable live prices.
**Why it failed:** The problem wasn't live prices — it was that static fallback values were fantasy numbers.
**Do instead:** Keep live data features. Fix the underlying static data to be realistic at current prices.

### ❌ Accepting "build passes" as proof of correctness
**What happened:** Agent reported "10 pages fixed" with passing build. Data was still wrong.
**Why it failed:** TypeScript compilation doesn't verify business logic or data correctness.
**Do instead:** After agent completes:
1. Open browser
2. Navigate to affected pages
3. Verify ACTUAL displayed values
4. Compare across pages if data consistency matters

### ❌ Pushing multiple commits without checking deploy status
**What happened:** Pushed 3 commits, assumed they deployed, kept "fixing" the same bug
**Why it failed:** Vercel deploys were failing. No code was reaching production.
**Do instead:** After push, verify deploy succeeded before pushing more code:
1. Check Vercel/Netlify dashboard
2. Wait for "Ready" status
3. Verify change is live
4. THEN continue

**Savings:** ~70% reduction in learning context tokens per agent

---

### ❌ Fixing issues in isolation without blast radius analysis
**What happened:** Fixed data sync between /demo and /portfolio-lab, but same issue existed on /tax-harvesting, /fragility, /goals, /family, and other pages
**Why it failed:** Fixed the symptom in one place, not the systemic pattern
**Do instead:** 
1. Identify the ROOT PATTERN (e.g., "pages using different data sources")
2. Search for ALL instances of that pattern
3. Fix comprehensively in one sweep
4. Document in ANTI-PATTERNS.md so it's never repeated

**Key question to ask:** "If this was wrong HERE, where ELSE is it probably wrong?"

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

### ❌ Initializing state as null when data should always display
**What happened:** Landing page showed 0.00% and no prices because `useState(null)` meant nothing rendered until API returned
**Why it failed:** If API is slow or fails, users see broken UI for first few seconds
**Do instead:** Initialize with fallback data: `useState(FALLBACK_DATA)` — update when real data arrives

### ❌ Silent API failures hiding bugs
**What happened:** CoinGecko API failed on Vercel (IP blocked), crypto array returned empty, page showed no BTC data
**Why it failed:** No fallback, error was caught and swallowed silently
**Do instead:** Always have fallback data for external APIs. Log errors. Return stale data > no data.

### ❌ Chat history persisting in demo mode
**What happened:** Demo visitors saw previous users' chat messages (stored in localStorage)
**Why it failed:** Demo mode didn't clear localStorage on entry
**Do instead:** Clear session-specific localStorage when entering demo mode

### ❌ Multiple sources of demo data
**What happened:** /demo page showed one portfolio, /portfolio-lab showed completely different holdings
**Why it failed:** Hardcoded data in one place, DEMO_PROFILE in another — never connected
**Do instead:** Single source of truth (DEMO_PROFILE), all pages read from it via hooks

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

---

## 2026-02-09 — User-Reported Bugs (Pantheon Missed)

### ❌ Same ticker appearing multiple times in holdings list
**What happened:** CIFR showed twice — once from Roth IRA, once from Taxable
**Why Pantheon missed it:** Agents tested "holdings load" but not "holdings consolidated"
**Why it failed:** `flatMap(accounts)` extracts all holdings without deduping by ticker
**Do instead:** Consolidate by ticker: `Map<ticker, {shares: sum, value: sum}>`

### ❌ Using stale portfolio prices for simulations
**What happened:** What-If showed $6.50 for CIFR when live price was $14.73
**Why Pantheon missed it:** Agents tested "price displays" but not "price is current"
**Why it failed:** Code prioritized portfolio price over live fetch for "performance"
**Do instead:** Always fetch live prices for trade simulations. Fallback to portfolio only if API fails.

### ❌ Not explaining surprising-but-correct numbers
**What happened:** 42% crypto allocation looked like a bug but was mathematically correct
**Why Pantheon missed it:** No check for "user expectation vs actual math"
**Why it failed:** TAO is $355K of $835K = 42% — correct but surprising
**Do instead:** When allocations are extreme (>30% in one category), add explanatory tooltip.

### ❌ QA checks that don't match user behavior
**What happened:** All pages returned 200, no console errors, but data was wrong
**Why Pantheon missed it:** Tests check "does it load" not "is the data correct"
**Why it failed:** Automated tests don't ask "is CIFR showing once or twice?"
**Do instead:** Add data sanity checks: deduped holdings, prices match external source, percentages sum to 100.

### ❌ Thin comparison views (percentages without decision-grade data)
**What happened:** Portfolio compare showed allocation bars side-by-side (85% → 65%) but no performance metrics, risk data, or specific tickers
**Why it's wrong:** Users can't make rebalancing decisions without knowing: historical returns (1, 3, 5, 10yr), risk metrics (Sharpe, Max Drawdown), and specific ETF recommendations
**Do instead:** Compare features need decision-grade data:
- Performance across multiple timeframes (1yr, 3yr, 5yr, 10yr, since inception)
- Risk-adjusted metrics (Sharpe ratio, Max Drawdown, Volatility)
- Specific ticker recommendations with expense ratios and ratings
- Visual comparisons (pie charts, not just bars)
- Clear indicators of trade-offs (green = improved, amber = trading something off)

