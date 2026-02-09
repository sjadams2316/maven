# Pantheon Learnings

*Auto-accumulating insights from every agent. This file compounds over time.*

**Format:** Each agent appends one learning after completing its task.

---

## 2026-02-09 — Sprint: Polish & Fixes

### pantheon-dashboard-polish
**Task:** Clean up data source indicator messaging
**Insight:** When showing status indicators, default to "healthy" and hide completely — users don't need to see technical health checks unless something is actually wrong. "No news is good news" UX.

### pantheon-ux-polish  
**Task:** Fix Markets widget showing dashes
**Insight:** Always have fallback data for critical UI elements. Hardcoded "last known" prices with a "Delayed" badge is better than showing "—" which looks broken.

### pantheon-mobile
**Task:** Mobile responsiveness audit
**Insight:** Touch targets must be 48px minimum (not 44px) for comfortable tapping. Use `min-h-[48px]` in Tailwind. For horizontal scrolling tabs, add `scrollbar-hide` utility class.

### pantheon-data-health
**Task:** Fix FMP showing as "down" falsely  
**Insight:** Health checks should test the same endpoints the app actually uses. Testing `/profile/AAPL` when the app uses `/quote/` gives false negatives.

### pantheon-error-messages
**Task:** Improved error messaging for monte-carlo API route
**Insight:** Error responses should have 4 parts: (1) `error` - short title, (2) `message` - user-friendly explanation, (3) `code` - machine-readable for debugging, (4) `hint` - actionable fix suggestion. Also: parse request.json() separately to give a specific "invalid JSON" error rather than a generic catch-all.

### pantheon-loading-states
**Task:** Improved dashboard loading skeleton to match actual page layout
**Insight:** Skeleton loaders should match the real content structure — show the same grid layout, card shapes, and hierarchy. A generic "3 gray boxes" skeleton looks lazy; matching the real layout (left column with net worth/insights/holdings, right column with quick actions/markets/goals) gives users an accurate preview and feels more polished.

### pantheon-tooltip-polish
**Task:** Add helpful tooltips to financial terms in Portfolio Lab (Volatility, Market Cap, P/E Ratio, Dividend Yield)
**Insight:** When adding tooltips to financial terms, the Term component + glossary pattern in InfoTooltip.tsx is powerful. Add new terms to the GLOSSARY object with title, explanation, and example. The example field using real-world numbers (e.g., "S&P 500 average: ~20-25") makes definitions actionable rather than abstract.

### pantheon-copy-review
**Task:** Review and improve copy consistency across demo, dashboard, and help pages
**Insight:** When improving UX copy: (1) Action-oriented CTAs like "Take Action" outperform generic "View Details" — users know exactly what clicking will do. (2) Empty states need 3 parts: empathy (icon/emoji), explanation (what happened), and guidance (what to do next). (3) Error messages should reassure first ("Your data is safe"), explain second, and avoid technical jargon. The pattern "X is temporarily unavailable. Check back shortly." is friendly without being condescending.

### pantheon-dead-links
**Task:** Audit navigation links across demo page, dashboard, QuickActions, and insight cards for dead links
**Insight:** When adding features with hrefs (especially insight cards, feature tours, or quick actions), always verify the destination page exists with `ls` or check against `find . -name "page.tsx"` output. Common dead link patterns: (1) future pages referenced before they're built (`/rmd-planner`, `/healthcare-planning`), (2) `href="#"` placeholder links that never get updated, (3) inconsistent naming (`/income-planner` vs `/income`). Fix strategy: map to closest existing page, or change link to non-navigating button if no destination makes sense.

### pantheon-console-errors
**Task:** Fixed market data structure mismatch on landing pages causing silent failures
**Insight:** When UI code and API responses evolve separately, data structure mismatches happen silently. The API returned `{ stocks: [...], crypto: [...] }` but landing pages expected `{ indices: { sp500: {...} }, crypto: { BTC: {...} } }`. Optional chaining (`?.`) prevents crashes but also hides the bug — data just doesn't render. **Always verify data shapes match** between API and UI, especially after refactoring. A quick `console.log(data)` during development catches these fast.

### pantheon-edge-cases
**Task:** Added bulletproof error handling to /api/stock-quote with validation, multi-source fallback, and cached prices
**Insight:** User-facing APIs need **layered resilience**: (1) Validate inputs early with specific error messages ("symbol format invalid" not "bad request"), (2) Try multiple data sources with timeouts (`AbortSignal.timeout(5000)`), (3) Keep fallback data for ~20 common symbols (SPY, VOO, AAPL, BTC) that covers 80% of use cases, (4) Return `isLive` flag so UI can show "Delayed" badge instead of confusing users, (5) Error responses need 4 parts: `error` (title), `message` (human explanation), `code` (machine-readable), `hint` (what to try). The pattern `FALLBACK_PRICES[symbol] || null` means graceful degradation for known symbols, explicit failure for unknowns.

---

## Learning Categories

### UX Principles
- Hide technical details from users unless actionable
- Always have fallback states for external data
- "Partial" is less scary than "Degraded"

### Mobile Patterns
- 48px minimum touch targets
- `scrollbar-hide` for horizontal scroll areas
- Stack grids on mobile: `grid-cols-1 sm:grid-cols-3`
- Fixed positioning for mobile tooltips/modals

### API Patterns
- Health checks must mirror actual usage patterns
- Fallback data > broken UI
- Cache aggressively, show staleness indicators

### Code Patterns
- Tailwind responsive: mobile-first, then `sm:`, `md:`, `lg:`
- Always type empty arrays: `let items: Type[] = []`
- Optional chaining for API data: `data?.field?.nested || fallback`

### pantheon-form-validation
**Task:** Audited form inputs across Maven for validation issues. Fixed WhatIfSimulator, SocialSecurityForm, Stress Test, and Retirement Hub pages to prevent negative values and show clear error states.
**Insight:** HTML5 `min` attributes on number inputs only work with the spinner arrows—users can still type negative values directly. Always combine `min` constraints with `onChange` validation that rejects invalid input AND visual error states (border color + message) so users understand why their input wasn't accepted. The pattern: `onChange={(e) => { const val = Number(e.target.value); if (val >= 0) setValue(val); }}` plus conditional border/message styling.

### pantheon-accessibility
**Task:** Audited and fixed accessibility issues: added descriptive alt text to images, ARIA dialog attributes to CommandPalette modal, screen-reader labels for search inputs, and aria-labels for icon-only close buttons across modals.
**Insight:** Icon-only buttons (especially close buttons using "✕" or SVG icons) are invisible to screen readers. Always add `aria-label` describing the action. For modals: use `role="dialog"`, `aria-modal="true"`, and `aria-label` on the container. For search inputs without visible labels, use `<label className="sr-only">` or `aria-label`. Decorative icons should have `aria-hidden="true"` to reduce screen reader noise.

### pantheon-data-consistency
**Task:** Verified DEMO_PROFILE data displays correctly across Maven tools. Fixed /tax page which had hardcoded $720K income instead of using DEMO_PROFILE data ($200K-$500K range).
**Insight:** When creating demo/sample data pages, always use the central DEMO_PROFILE through `useUserProfile()` hook rather than hardcoding values inline. This ensures consistency: the demo profile lives in one file (`demo-profile.ts`), and all pages reference it via the UserProvider context. For range values like "$200,000 - $500,000", create a parser function that extracts numbers and returns a midpoint. Adding a "Demo Data" badge when `isDemoMode` is true helps users understand they're seeing sample data.

### pantheon-performance
**Task:** Parallelized batch ticker fetches in fund-profile API
**Insight:** When an API handles batch requests (e.g., `?tickers=SPY,QQQ,AAPL,...`), never fetch in a sequential for-loop — use `Promise.all()` to parallelize. The pattern: (1) First pass: synchronously resolve cached/special items, collect uncached tickers into an array. (2) Second pass: `Promise.all(tickersNeedingFetch.map(async (t) => ...))` to fetch all in parallel. This turned a 6-second batch request (20 tickers × 300ms) into ~300ms total. Also add HTTP caching headers (`Cache-Control: s-maxage=300, stale-while-revalidate=3600`) so Vercel's edge can cache responses.

### pantheon-demo-unify
**Task:** Fixed critical bug where /demo and /portfolio-lab showed completely different portfolios (GROWTH_HOLDINGS vs DEMO_PROFILE with different holdings)
**Insight:** When building demo/sample data features, establish ONE canonical data source from day one. Having hardcoded data in page components (`/demo/page.tsx` with `GROWTH_HOLDINGS`) separate from the central profile (`lib/demo-profile.ts` with `DEMO_PROFILE`) creates drift that's invisible until users compare pages. **Fix pattern:** (1) Put all demo holdings in `demo-profile.ts` with exports for both the profile object AND display-friendly arrays, (2) Have pages import from that single source, (3) Use helper functions like `getDemoHoldings(variant)` to access the right data. This ensures /demo, /portfolio-lab, /tax, /retirement all pull from the same well.

### pantheon-mobile-qa-v2
**Task:** Mobile UX audit - checked touch targets, text sizes, and table responsiveness on /demo, /dashboard, /portfolio-lab
**Insight:** Mobile touch targets need **three things**: (1) `min-h-[44px]` or `min-h-[48px]` minimum on all tappable elements, (2) Use mobile-first responsive padding like `px-4 py-2.5 sm:px-3 sm:py-1.5` so mobile gets the larger targets, (3) Never use `text-[10px]` or `text-[11px]` - use `text-xs` (12px) as the minimum readable size on mobile. For small toggle buttons (Current/Target switches), the pattern `min-h-[44px] sm:min-h-0` gives proper touch targets on mobile while staying compact on desktop. Tables with `overflow-x-auto` are fine for horizontal scroll, but add `scrollbar-hide` class for tab bars to keep the UI cleaner.

---

*This file grows with every sprint. Review weekly to promote patterns to PATTERNS.md.*

### pantheon-demo-unify-v2
**Task:** Unify demo data - Dashboard and Portfolio Lab showing different portfolios
**Insight:** When creating demo data with both a summary view (GROWTH_HOLDINGS) and detailed account-level data (DEMO_PROFILE), the holdings MUST be mathematically consistent. If GROWTH_HOLDINGS says "620 shares of VTI = $185K" but DEMO_PROFILE has VTI in multiple accounts totaling 740 shares, users will see different numbers on different pages. **Always calculate totals from account-level holdings** and verify they match any summary arrays. The pattern: Define holdings at account level first, then compute summary arrays by aggregating across accounts — not the other way around.

### pantheon-seo-meta-v2
**Task:** SEO and meta tags audit for priority pages (/, /demo, /pitch, /portfolio-lab, /oracle)
**Insight:** For OG/Twitter images in Next.js 13+, use **file-based metadata** (`opengraph-image.tsx` and `twitter-image.tsx`) instead of static PNG files or explicit image paths in metadata. Benefits: (1) No need to create/manage static image files, (2) Images are dynamically generated with branded styling, (3) Next.js automatically adds the correct `<meta og:image>` tags, (4) Each route gets its own customized image. Place the files in the route folder (e.g., `app/demo/opengraph-image.tsx`) and export `runtime = 'edge'`, `alt`, `size`, and `contentType`. Remove explicit `images` arrays from metadata objects and add a comment like `// Images auto-generated by opengraph-image.tsx`.

### pantheon-security-v2
**Task:** Basic API security hardening - audit for rate limiting, security headers, and exposed debug endpoints
**Insight:** Before adding new security measures, **audit what's already there**. This codebase already had: (1) Comprehensive rate limiting in middleware.ts with per-route configs (chat: 30/min, quotes: 100/min, compute: 20/min), (2) Security headers in both middleware.ts AND next.config.ts (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy), (3) Good error handling without stack trace exposure. The only issue found was a `/api/debug-env` route that exposed API key prefixes and env info in production. **Fix pattern:** Add `if (process.env.NODE_ENV === 'production') return 403` at the top of any debug/diagnostic endpoints. Don't duplicate security work that's already done well — focus on finding gaps like unprotected debug routes.
