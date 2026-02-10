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
**Confidence:** 4 ⭐⭐⭐⭐
**Confirmed by:** pantheon-mobile, pantheon-mobile-qa-v2, accessibility audit
**Insight:** Touch targets must be 48px minimum. Use `min-h-[48px] min-w-[48px]` on all tappable elements. Pattern: `min-h-[44px] sm:min-h-0` for responsive (larger on mobile, compact on desktop).

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

### L009 — Clear localStorage in Demo Mode
**Tags:** `data`, `state`, `ux`
**Confidence:** 2 ⭐⭐
**Confirmed by:** demo-chat-history fix, demo isolation
**Insight:** Demo mode must be completely isolated. Clear all persistence layers (localStorage, cookies, sessionStorage) on demo entry.

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
**Confidence:** 1 ⭐
**Insight:** Empty states need: (1) empathy (icon/emoji), (2) explanation (what happened), (3) guidance (what to do next).

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

**For UI/Component tasks, inject:** L002, L005, L006, L013, L014, L017
**For API tasks, inject:** L001, L003, L007, L008, L010, L020
**For Mobile tasks, inject:** L002, L006
**For Data/Demo tasks, inject:** L004, L007, L009, L019, L020, L028
**For Testing/QA tasks, inject:** L007, L008, L015, L018, L021, L022
**For External API tasks, inject:** L001, L008, L010, L020
**For Error Handling tasks, inject:** L001, L003, L005
**For Finance/Analysis tasks, inject:** L025, L026, L027
**For Portfolio Display tasks, inject:** L004, L019, L025, L026, L027

*Last updated: 2026-02-10*

---

## Contradictions Resolved

*None found in current learnings — patterns are consistent.*

---

## Deprecated Learnings

*None yet — all learnings still valid.*

---

*Last distilled: 2026-02-09 18:40 EST*
*Total learnings: 18*
*High-confidence: 5*
*Medium-confidence: 5*
*Needs validation: 8*

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
