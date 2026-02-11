# Pantheon Learnings v2

*Tagged, scored, and distilled for efficient agent context injection.*

**Format:**
```
### [learning-id]
**Tags:** [domain tags for context filtering]
**Confidence:** [1-5, based on confirmations]
**Task:** [what triggered this learning]
**Insight:** [the reusable knowledge]
```

**Domain Tags:**
- `ui` — Frontend, components, styling
- `ux` — User experience, flows, copy
- `api` — Backend routes, data fetching
- `mobile` — Mobile-specific patterns
- `data` — Data consistency, demo profiles
- `security` — Auth, headers, rate limiting
- `testing` — QA, validation, verification
- `external` — Third-party APIs, integrations
- `state` — React state, initialization
- `error` — Error handling, fallbacks

---

## High-Confidence Patterns (≥3 confirmations)

### L001 — Fallback Data for External APIs
**Tags:** `api`, `external`, `state`, `error`
**Confidence:** 5 ⭐⭐⭐⭐⭐
**Confirmed by:** pantheon-ux-polish, pantheon-edge-cases, market-display-fix, landing-page-fix
**Insight:** External APIs WILL fail in production (rate limits, IP blocks, timeouts). Every external call needs: (1) timeout (5s max), (2) fallback data for common cases, (3) error logging, (4) `isLive` flag so UI shows "Delayed" badge. Pattern: `useState(FALLBACK_DATA)` not `useState(null)`.

### L002 — Touch Targets 48px Minimum
**Tags:** `mobile`, `ui`, `ux`
**Confidence:** 5 ⭐⭐⭐⭐⭐
**Confirmed by:** pantheon-mobile, pantheon-mobile-qa-v2, accessibility audit, pantheon-advisor-mobile
**Insight:** Touch targets must be 48px minimum. Use `min-h-[48px] min-w-[48px]` on all tappable elements. Pattern: `min-h-[44px] sm:min-h-0` for responsive (larger on mobile, compact on desktop). Also enlargened toggle switches from `w-12 h-6` to `w-14 h-8` for easier tapping.

### L003 — 4-Part Error Responses
**Tags:** `api`, `error`, `ux`
**Confidence:** 4 ⭐⭐⭐⭐
**Confirmed by:** pantheon-error-messages, pantheon-edge-cases, monte-carlo fix
**Insight:** API error responses need 4 parts: (1) `error` - short title, (2) `message` - user-friendly explanation, (3) `code` - machine-readable, (4) `hint` - actionable fix suggestion.

### L004 — Single Source of Truth for Demo Data
**Tags:** `data`, `ux`
**Confidence:** 4 ⭐⭐⭐⭐
**Confirmed by:** pantheon-demo-unify, pantheon-demo-unify-v2, data-consistency
**Insight:** Demo data must have ONE canonical source. All pages import from `demo-profile.ts` via `useUserProfile()` hook. Never hardcode display data separately — creates invisible drift.

### L005 — Hide Technical Details from Users
**Tags:** `ux`, `error`, `ui`
**Confidence:** 4 ⭐⭐⭐⭐
**Confirmed by:** pantheon-dashboard-polish, pantheon-copy-review, status indicators
**Insight:** Users don't need to see "HTTP 403" or "Degraded". Friendly messages: "temporarily unavailable", "check back shortly". Reassure first, explain second.

---

## Medium-Confidence Patterns (2 confirmations)

### L006 — Skeleton Loaders Match Real Layout
**Tags:** `ui`, `ux`, `state`
**Confidence:** 2 ⭐⭐
**Confirmed by:** pantheon-loading-states, dashboard improvements
**Insight:** Skeleton loaders should match actual content structure — same grid layout, card shapes, hierarchy. Generic "3 gray boxes" looks lazy.

### L007 — Validate Data Shapes After Refactoring
**Tags:** `api`, `data`, `testing`
**Confidence:** 2 ⭐⭐
**Confirmed by:** pantheon-console-errors, market-data fix
**Insight:** When API and UI evolve separately, data structure mismatches happen silently. Optional chaining (`?.`) hides bugs. Always verify shapes match, especially after refactoring.

### L008 — Health Checks Mirror Actual Usage
**Tags:** `api`, `testing`, `external`
**Confidence:** 2 ⭐⭐
**Confirmed by:** pantheon-data-health, FMP status fix
**Insight:** Health checks must test the same endpoints the app uses. Testing `/profile/AAPL` when app uses `/quote/` gives false negatives.

### L009 — Demo Mode Needs Prop-Based Isolation
**Tags:** `data`, `state`, `ux`
**Confidence:** 3 ⭐⭐⭐
**Confirmed by:** demo-chat-history fix, demo isolation, oracle-history-fix-2026-02-10
**Insight:** Demo mode must be completely isolated. Components that persist state MUST receive `isDemoMode` as a prop, not rely on external useEffect cleanup. Race condition: parent component clearing localStorage AFTER child already loaded stale data.

**Pattern:**
```typescript
// WRONG: Parent tries to clear after child mounts
useEffect(() => {
  if (isDemoMode) localStorage.removeItem('key'); // TOO LATE
}, [isDemoMode]);
<ChildThatLoadsOnMount />  // Already loaded stale data

// RIGHT: Pass demo mode to child, let it decide
<ChildComponent isDemoMode={isDemoMode} />

// In child:
useEffect(() => {
  if (isDemoMode) {
    localStorage.removeItem('key');
    setState(freshState);
    return; // Don't load persisted data
  }
  // Only load if NOT demo mode
  const saved = localStorage.getItem('key');
  ...
}, [isDemoMode]);
```

Also: Don't SAVE in demo mode — check `isDemoMode` before any `localStorage.setItem()`.

### L010 — Parallelize Batch API Requests
**Tags:** `api`, `performance`
**Confidence:** 2 ⭐⭐
**Confirmed by:** pantheon-performance, fund-profile fix
**Insight:** Never fetch batch items in sequential for-loop. Use `Promise.all()` to parallelize. 20 × 300ms sequential = 6s. Parallel = 300ms.

---

## Single-Confirmation Learnings (need validation)

### L011 — File-Based OG Images in Next.js 13+
**Tags:** `ui`, `seo`
**Confidence:** 1 ⭐
**Insight:** Use `opengraph-image.tsx` and `twitter-image.tsx` instead of static PNGs. Dynamic generation, no file management.

### L012 — Audit Existing Security Before Adding
**Tags:** `security`
**Confidence:** 1 ⭐
**Insight:** Before adding security measures, audit what exists. Don't duplicate work — focus on gaps like unprotected debug routes.

### L013 — Action-Oriented CTAs
**Tags:** `ux`, `ui`
**Confidence:** 1 ⭐
**Insight:** "Take Action" outperforms "View Details". Users know exactly what clicking will do.

### L014 — Empty States Need 3 Parts
**Tags:** `ux`, `ui`
**Confidence:** 2 ⭐⭐
**Confirmed by:** pantheon-goals-empty (Goals page empty state)
**Insight:** Empty states need: (1) empathy (icon/emoji), (2) explanation (what happened), (3) guidance (what to do next). Also add benefits of taking action (why should user care?) and suggestion chips for common starting points. CTA should be action-oriented ("Add Your First Goal" not "Get Started").

### L015 — Verify Links Before Shipping
**Tags:** `testing`, `ux`
**Confidence:** 1 ⭐
**Insight:** Always verify href destinations exist. Common dead link patterns: future pages, `href="#"` placeholders, inconsistent naming.

### L016 — Input Validation Beyond HTML5 min
**Tags:** `ui`, `data`
**Confidence:** 1 ⭐
**Insight:** HTML5 `min` only works with spinner arrows. Add `onChange` validation + visual error states (border + message).

### L017 — aria-label for Icon-Only Buttons
**Tags:** `ui`, `accessibility`
**Confidence:** 1 ⭐
**Insight:** Icon-only buttons (✕ close buttons, SVG icons) need `aria-label`. Modals need `role="dialog"` + `aria-modal="true"`.

### L018 — Visual Verification Required
**Tags:** `testing`
**Confidence:** 1 ⭐
**Insight:** "Works" ≠ "Correct". Functional tests must include visual verification. Charts green when up, red when down. Numbers match reality.

---

## Domain-Specific Injection Guide

**For UI/Component tasks, inject:** L002, L005, L006, L013, L014, L017, L035
**For API tasks, inject:** L001, L003, L007, L008, L010, L020
**For Mobile tasks, inject:** L002, L006
**For Data/Demo tasks, inject:** L004, L007, L009, L019, L020, L028
**For Testing/QA tasks, inject:** L007, L008, L015, L018, L021, L022
**For External API tasks, inject:** L001, L008, L010, L020
**For Error Handling tasks, inject:** L001, L003, L005
**For Finance/Analysis tasks, inject:** L025, L026, L027, L034
**For Portfolio Display tasks, inject:** L004, L019, L025, L026, L027, L034
**For Allocation/Rebalancing tasks, inject:** L019, L034

*Last updated: 2026-02-10*

---

## Contradictions Resolved

*None found in current learnings — patterns are consistent.*

---

## Deprecated Learnings

*None yet — all learnings still valid.*

---

*Last distilled: 2026-02-10 21:30 EST*
*Total learnings: 36*
*High-confidence: 10*
*Medium-confidence: 10*
*Needs validation: 16*

---

## 2026-02-09 — User-Reported Data Bugs

### L019 — Consolidate Same Tickers Across Accounts
**Tags:** `data`, `ui`, `ux`
**Confidence:** 3 ⭐⭐⭐
**Confirmed by:** CIFR duplicate bug, dashboard fix, portfolio-lab fix
**Insight:** When displaying holdings from multiple accounts, consolidate same tickers into one line. CIFR in Roth + CIFR in Taxable should show as one "CIFR: 12,000 shares" not two separate lines. Pattern: `Map<ticker, consolidatedHolding>` then aggregate shares/value.

### L020 — Always Fetch Live Prices for Simulations
**Tags:** `api`, `data`, `ux`
**Confidence:** 2 ⭐⭐
**Confirmed by:** What-If price bug
**Insight:** For trade simulations, ALWAYS fetch live prices from API. Don't use portfolio prices — they may be stale from demo data or last session. Pattern: `fetchLivePrice(ticker)` first, fallback to portfolio price only if API fails.

### L021 — Verify Math Matches User Expectations
**Tags:** `testing`, `ux`
**Confidence:** 2 ⭐⭐
**Confirmed by:** Crypto allocation "bug" (was actually correct)
**Insight:** When users report "wrong" numbers, first verify the math is actually wrong vs unexpected-but-correct. A 42% crypto allocation looks wrong but is accurate if TAO is $355K of $835K total. Add explanatory UI when numbers are surprising but correct.

### L022 — Test With Real User Behavior
**Tags:** `testing`, `ux`
**Confidence:** 2 ⭐⭐
**Confirmed by:** Multiple user-reported bugs that passed automated tests
**Insight:** Automated tests (200 response, no console errors) miss data correctness bugs. Need human-like testing: "Does CIFR show once or twice?" "Does the price match Yahoo Finance?" "Do the percentages add up?" Add data sanity checks to QA protocol.

---

## 2026-02-09 — Portfolio Enhancement

### L025 — Show Both Historical AND Expected Returns
**Tags:** `data`, `ux`, `finance`
**Confidence:** 2 ⭐⭐
**Confirmed by:** compare-enhance agent, CMA research
**Insight:** Portfolio comparison must show BOTH historical returns AND forward-looking expectations (CMAs). Historical alone makes diversification look bad (US dominated). CMAs flip the narrative: international expected to outperform. Pattern: Display side-by-side with explanation of why they differ.

### L026 — Forward-Looking CMAs Contradict Historical Returns
**Tags:** `data`, `finance`, `ux`
**Confidence:** 3 ⭐⭐⭐
**Confirmed by:** Vanguard 2026, JP Morgan 2026 LTCMA, Research Affiliates
**Insight:** Capital Market Assumptions reveal a counterintuitive truth: **the asset classes that performed best historically are expected to perform worst going forward, and vice versa.**

Key 2026 findings:
- **US Large Cap:** Historical ~13%, Expected ~5.5% (valuations elevated)
- **US Growth:** Historical ~15%, Expected ~4% (Vanguard "most guarded")
- **International:** Historical ~5%, Expected ~7% (lower valuations)
- **Bonds:** Historical ~1.5%, Expected ~4.5% (Vanguard's #1 pick!)

Vanguard 2026 explicitly ranks best opportunities:
1. High-quality US fixed income
2. US value-oriented equities  
3. Non-US developed market equities

Pattern: When displaying portfolio recommendations, ALWAYS show expected returns alongside historical. Users need context to understand why diversification makes sense despite past underperformance.

Sources: Vanguard VCMM (Dec 2025), JP Morgan 2026 LTCMA (Oct 2025), Research Affiliates AAI

### L027 — Dollar Projections Need Both Historical AND Expected Basis
**Tags:** `data`, `finance`, `ux`
**Confidence:** 2 ⭐⭐
**Confirmed by:** cma-integrate agent
**Insight:** When showing "projected portfolio value in 10 years," ALWAYS show both:
1. Based on historical returns: $340K → $253K (diversified looks worse)
2. Based on expected returns: $163K → $182K (diversified wins ✓)

This visual contrast crystallizes the CMA narrative. Users see the same $100K starting point grows to dramatically different amounts depending on assumptions. Historical makes US look like the obvious winner. Expected shows why advisors recommend diversification.

Pattern: Show both projections side-by-side with checkmarks on expected improvements and amber warnings on historical trade-offs. Include the "why they differ" explainer with CMA sources.

---

## 2026-02-10 — Data Consistency Fix

### L028 — Reusable Hooks for Cross-Cutting Concerns
**Tags:** `data`, `api`, `state`
**Confidence:** 3 ⭐⭐⭐
**Confirmed by:** pantheon-data-consistency-audit (10 pages fixed)
**Insight:** When the same logic is needed across many pages (like fetching live prices), create a reusable hook in `/hooks/`. Don't copy-paste the same useEffect + fetch pattern into 10 different pages.

Pattern created: `useLivePrices.ts`
- `useLivePrices()` — Raw price fetching
- `useLiveFinancials()` — Financials with live prices applied
- `calculateLiveFinancials()` — Helper for calculations

**Before:** Each page had its own fetch logic → drift, inconsistency, bugs
**After:** One hook, 10 pages import it → single source of truth

See: `docs/DATA-SOURCES.md` for the canonical pattern.

### L029 — Verify Agent Work Before Reporting Success
**Tags:** `testing`, `process`
**Confidence:** 5 ⭐⭐⭐⭐⭐
**Confirmed by:** Data consistency bug 2026-02-10 — agent claimed "10 pages fixed" but root cause wasn't addressed
**Insight:** When an agent reports "task complete," the orchestrator MUST verify by actually checking the output:
- For UI changes: Open the page and look at it
- For data fixes: Compare actual values across pages
- For API changes: Test the endpoint

Never accept "build passes" as proof of correctness. "Works" ≠ "Correct."

**Pattern:** After every agent completion:
1. Open browser
2. Navigate to affected pages
3. Verify the ACTUAL user-facing result
4. Compare across pages if data consistency is involved
5. Only then report success

### L030 — Fetch REAL Data Before Making Calculations
**Tags:** `data`, `api`, `demo`
**Confidence:** 5 ⭐⭐⭐⭐⭐
**Confirmed by:** Demo portfolio disaster 2026-02-10 — used stale estimates, some 260% wrong
**Insight:** When setting values that depend on external data (stock prices, exchange rates, etc.), ALWAYS fetch the actual current values first. Never use estimates, cached values, or "what I remember."

**The Failure:**
- I estimated CIFR at $6.45 → actual was $16.76 (160% wrong)
- I estimated IREN at $12.80 → actual was $46.15 (260% wrong)
- I estimated VTI at $289 → actual was $342.64 (19% wrong)

**Pattern:** Before ANY calculation involving external data:
```bash
# Fetch actual prices FIRST
curl -s "https://api.example.com/price?symbol=XXX" | jq '.price'
```
Then calculate. Never assume.

### L031 — Don't Disable Features to Fix Data Problems
**Tags:** `architecture`, `debugging`
**Confidence:** 5 ⭐⭐⭐⭐⭐
**Confirmed by:** Sam's pushback 2026-02-10 — "Who cares if crypto is volatile? We NEED live prices."
**Insight:** When live data causes inconsistencies, the problem is usually the static fallback data, not the live data feature. Fix the data, don't disable the feature.

**The Mistake:** I disabled live prices because TAO at $156 broke the demo (which assumed $3,380). Wrong fix.
**The Right Fix:** Update the demo to have realistic share counts that work with real prices.

**Principle:** Features that show real data are CREDIBILITY. Removing them destroys trust. Fix the underlying data instead.

### L032 — Verify Deploy Pipeline Before Assuming Success
**Tags:** `deployment`, `verification`
**Confidence:** 5 ⭐⭐⭐⭐⭐
**Confirmed by:** Vercel deploy failures 2026-02-10 — pushed 3 commits, none deployed
**Insight:** A successful local build ≠ successful production deploy. Always verify the deploy pipeline is actually working before moving on.

**Pattern:** After git push:
1. Check GitHub Actions status (if applicable)
2. Check Vercel/Netlify/etc dashboard for deploy status
3. Wait for "Ready" status before verifying live site
4. If deploy fails, debug THAT before pushing more code

**Red Flag:** If you push 3 commits and the site hasn't changed, STOP and check the deploy pipeline.

### L033 — vercel.json Cannot Configure Root Directory
**Tags:** `deployment`, `vercel`, `configuration`
**Confidence:** 5 ⭐⭐⭐⭐⭐
**Confirmed by:** Vercel deploy failures 2026-02-10 — schema validation rejected `projectSettings`
**Insight:** The `rootDirectory` setting is a Vercel PROJECT setting, not a `vercel.json` property. It can only be configured in the Vercel Dashboard (Settings → Build & Deployment).

**The Mistake:** I added `{ "projectSettings": { "rootDirectory": "maven/apps/dashboard" } }` to vercel.json.
**Result:** Deploy failed with "should NOT have additional property `projectSettings`"
**The Fix:** Configure Root Directory in Vercel Dashboard UI, keep vercel.json for other settings only.

**Valid vercel.json properties:**
- `headers`, `redirects`, `rewrites`, `cleanUrls`, `trailingSlash`
- `build.env`, `functions`, `regions`, `crons`
- NOT `rootDirectory`, `projectSettings`, or build-time project config

**Pattern:** When configuring monorepo deployments:
1. Set Root Directory in Vercel Dashboard (Settings > Build & Deployment)
2. Use vercel.json for runtime config (headers, redirects, etc.)
3. Don't try to override project settings via vercel.json — it will fail schema validation

### L034 — Fund Look-Through Analysis for True Geographic Allocation
**Tags:** `data`, `finance`, `ui`, `portfolio`
**Confidence:** 4 ⭐⭐⭐⭐
**Confirmed by:** pantheon-fund-lookthrough 2026-02-10
**Insight:** Global funds (VTWAX, VT, ACWI) and target-date funds contain BOTH US and international stocks, but simple ticker classification shows them as 100% one category. This misrepresents true portfolio exposure.

**The Problem:**
- VTWAX is 60% US / 40% International, but `classifyTicker('VTWAX')` might return just 'usEquity'
- A portfolio with 100% VTWAX would show as "100% US" when it's actually "60% US / 40% Int'l"
- Target-date funds (VTTSX, VFFVX) also contain bonds, international, etc.

**The Solution:**
Use `decomposeFundHolding(ticker, value)` instead of `classifyTicker(ticker)`:
```typescript
// BAD — treats VTWAX as single asset class
const assetClass = classifyTicker(h.symbol);
buckets[assetClass] += value;

// GOOD — decomposes into true underlying allocation
const decomposed = decomposeFundHolding(h.symbol, h.value);
buckets.usStocks += decomposed.usEquity;
buckets.intlStocks += decomposed.intlEquity;
buckets.bonds += decomposed.bonds;
// ... etc
```

**Where this matters:**
- Allocation displays on Dashboard, Portfolio Lab
- Risk calculations (beta, volatility) — a 60/40 fund has different risk than 100% US
- Rebalancing recommendations
- What-If simulations

**Fund compositions in FUND_COMPOSITIONS constant:**
- `portfolio-utils.ts` has ~100 funds with breakdown data
- Target-date funds shift over time (2065 more aggressive than 2025)
- Vanguard, Fidelity, T. Rowe, Schwab target-date funds all covered

**Pattern:** Whenever calculating portfolio allocation percentages, use `decomposeFundHolding()` not `classifyTicker()`. The function already handles fallback (returns full value in single category if fund not in FUND_COMPOSITIONS).

### L035 — Sortable Tables Need Clear Affordances
**Tags:** `ui`, `ux`, `interaction`
**Confidence:** 2 ⭐⭐
**Confirmed by:** pantheon-holdings-sort 2026-02-10
**Insight:** When adding sorting to data tables, users need three clear signals:

1. **Affordance:** Column headers should look clickable
   - `cursor-pointer` class
   - `hover:text-white` or similar hover state
   - `transition-colors` for smooth feedback

2. **Indicator:** Current sort state must be visible
   - Arrow showing direction (↓ descending, ↑ ascending)
   - Use accent color (e.g., `text-indigo-400`) to distinguish from column name
   - Only show on actively sorted column

3. **Interaction pattern:**
   - Click once → sort descending (largest/newest first is most useful default)
   - Click again → reverse to ascending
   - Click different column → reset to descending on new column

**Pattern:**
```tsx
// State
const [sortColumn, setSortColumn] = useState<'value' | 'name'>('value');
const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

// Click handler
const handleSort = (col: typeof sortColumn) => {
  if (sortColumn === col) {
    setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
  } else {
    setSortColumn(col);
    setSortDirection('desc'); // Reset to desc for new column
  }
};

// Header
<th onClick={() => handleSort('value')} 
    className="cursor-pointer hover:text-white transition-colors">
  <div className="flex items-center gap-1">
    Value
    {sortColumn === 'value' && (
      <span className="text-indigo-400">
        {sortDirection === 'desc' ? '↓' : '↑'}
      </span>
    )}
  </div>
</th>
```

**Connects to:** L006 (interactive elements need clear affordances and feedback)

---

## 2026-02-10 — Client Portal Curation

### L036 — Advisor Curation Layer Pattern
**Tags:** `architecture`, `ux`, `client-portal`
**Confidence:** 2 ⭐⭐
**Confirmed by:** pantheon-client-portal-curation 2026-02-10
**Insight:** Client portals should have an advisor-controlled curation layer. Advisors know their clients — a 30-year-old doesn't need Social Security, an anxious retiree doesn't need performance charts.

**Pattern:**

1. **Settings Type with Sensible Defaults:**
```typescript
interface ClientPortalSettings {
  sections: {
    family: boolean;
    socialSecurity: boolean;
    estate: boolean;
    taxPlanning: boolean;
    // ...
  };
  showPerformance: boolean;  // Hide for anxious clients
  showNetWorth: boolean;     // Some prefer hidden
  communicationTone: 'conservative' | 'moderate' | 'engaged';
}
```

2. **Life Stage Presets:**
   - Young Professional: Hide SS, Estate, simplify
   - Pre-Retiree: Show ALL (SS critical)
   - Retiree: Show all, but HIDE performance (causes anxiety)
   - HNW: Show all, emphasize Estate & Philanthropy

3. **Hook Pattern for Consumption:**
```typescript
const { settings, isSectionEnabled } = useClientPortalSettings(code);
const visibleItems = navItems.filter(item => 
  !item.sectionKey || isSectionEnabled(item.sectionKey)
);
```

4. **Preview Mode for Advisors:**
   - `?preview=true` shows what client sees
   - Hidden sections shown with strikethrough + "Hidden for this client"

**Why this matters:** The advisor is the curator. They know client emotional needs. A portal that shows everything to everyone is a dashboard, not a concierge experience.

### L037 — AI-Generated Content Needs Fallbacks + Tone Guardrails
**Tags:** `api`, `ux`, `client-portal`, `ai`
**Confidence:** 2 ⭐⭐
**Confirmed by:** pantheon-client-portal-foundation 2026-02-10
**Insight:** AI-generated client-facing content (like weekly market commentary) needs:

1. **Fallback content:** If AI fails, return pre-written calm messaging rather than errors
2. **Tone enforcement in system prompt:** Explicitly state what NOT to say (no alarmist language, no action items)
3. **Caching:** Weekly commentary doesn't need real-time generation — 24h cache TTL is fine
4. **"Generated on [date]" footer:** Be transparent about when content was created

**Pattern for calm wealth commentary:**
```typescript
const systemPrompt = `You are a wealth advisor writing weekly commentary.
Your tone must be:
- CALM: Never alarming or anxiety-inducing
- CONFIDENT: Reassuring without being dismissive
- EDUCATIONAL: Help them understand without overwhelming
- BRIEF: 2-3 short paragraphs maximum

Rules:
- Never mention specific stock picks
- Never suggest urgent action
- Never use alarming language about drops/risks
- Focus on long-term perspective
- Emphasize the advisor is managing things`;
```

**Fallback pattern:**
```typescript
catch (error) {
  // Return thoughtful fallback rather than error
  return Response.json({
    commentary: "Markets continue their steady course...",
    generatedAt: new Date().toISOString(),
    marketHighlights: ["Portfolio aligned with goals", "Long-term outlook stable"],
  });
}
```

**Connects to:** L013 (client portal = calm, no anxiety), L001 (fallback data for external calls)

### L038 — Brand Consistency: Single Source for Firm Identity
**Tags:** `ui`, `ux`, `branding`
**Confidence:** 2 ⭐⭐
**Confirmed by:** pantheon-client-portal-foundation 2026-02-10
**Insight:** When updating branding (e.g., "Adams Wealth" → "Maven Partners"):

1. **Search ALL occurrences:** Advisor names, firm names in layout, page, components
2. **Update accent colors consistently:** Don't mix amber and teal as accent
3. **Logo/initials:** "MP" for Maven Partners, use gradient matching accent color
4. **Owned strings vs fetched:** Some branding comes from advisor DB, some is hardcoded — know which is which

**Checklist for branding updates:**
- [ ] layout.tsx header/logo
- [ ] page.tsx greeting and references  
- [ ] Footer "powered by" text
- [ ] Component headers (ClientHeader, PortalNavigation)
- [ ] Color accent (Tailwind classes: `teal-400`, `teal-500`, etc.)
- [ ] Shadow colors (`shadow-teal-500/20`)
- [ ] Demo data objects (advisor.firm, advisor.name)

### L030: Dynamic routes must USE the URL parameter
**Tags:** [partners] [routing] [data]
**Confidence:** high
**Evidence:** production-bug (cron caught 2026-02-10)

When building dynamic routes like `/clients/[id]`, the `useParams()` hook returns the ID but you must actually USE it to fetch/select the correct data. Don't just define a param and ignore it.

**Pattern:**
```typescript
const params = useParams();
const clientId = typeof params.id === 'string' ? params.id : '1';
const client = DEMO_CLIENTS[clientId] || DEFAULT_CLIENT;
```

**Anti-pattern:**
```typescript
const params = useParams(); // Fetched but never used!
const client = DEMO_CLIENT;  // Always returns same hardcoded data
```
