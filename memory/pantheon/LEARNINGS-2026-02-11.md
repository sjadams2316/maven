# Pantheon Learnings — 2026-02-11

## Bugs Sam Caught (Target: 0)

### L011: Missing Routes (404s)
**What happened:** Multiple nav links pointed to non-existent pages
- Client portal: estate, social-security, tax, philanthropy
- Advisor: activity, clients/new, reports/new, trades/new, meetings/new, alerts/new

**Root cause:** Built navigation UI before building all destination pages

**Prevention:**
```bash
# Add to CI: Route existence check
for route in $(grep -roh 'href="/[^"]*"' src --include="*.tsx" | sort -u); do
  # Verify each linked route has a page.tsx
done
```

**Rule:** Never ship a link without its destination page.

---

### L012: Demo Mode Not Preserved
**What happened:** "View all" and action links lost `?demo=true` param, causing sign-in redirects

**Root cause:** Hardcoded hrefs instead of using `demoHref()` helper

**Prevention:** 
- Every page with internal links needs `demoHref()` helper
- Search for `href="/partners/` without `demoHref` before merging

**Rule:** In demo-aware pages, ALL internal links must use the demo helper.

---

### L013: Race Condition in Auth Check
**What happened:** Partners layout checked `isPublicLanding` before path was set, causing flash + redirect

**Root cause:** Used `useState + useEffect` to track pathname instead of `usePathname()`

**Prevention:** Always use Next.js hooks (`usePathname`, `useSearchParams`) for routing state

**Rule:** Never manually track URL state that Next.js provides as a hook.

---

### L014: Inconsistent Branding
**What happened:** "Adams Wealth" appeared in client preview instead of "Maven Partners"

**Root cause:** Placeholder text not updated when branding was finalized

**Prevention:** Search codebase for old brand names before release

**Rule:** `grep -r "Adams Wealth\|placeholder brand" src` before any demo.

---

## QA Checklist Update

Before marking ANY feature complete:

1. **Route Check:** Click every nav link in both views (advisor + client)
2. **Demo Mode:** Test full flow with `?demo=true` — no sign-in prompts
3. **Auth States:** Test as signed-out, signed-in, and demo user
4. **Brand Check:** Search for placeholder/old brand names
5. **Mobile:** Test on mobile viewport
6. **Console:** No errors in browser console

## Pre-Deploy Script (Add to CI)

```bash
#!/bin/bash
# maven/scripts/pre-deploy-check.sh

echo "🔍 Checking for broken internal links..."
# Extract all href links and verify pages exist

echo "🔍 Checking for hardcoded demo links..."
grep -rn 'href="/partners/' src --include="*.tsx" | grep -v 'demoHref' | grep -v 'demo=true'

echo "🔍 Checking for old branding..."
grep -rn "Adams Wealth" src --include="*.tsx"

echo "🔍 Checking for TODO/FIXME..."
grep -rn "TODO\|FIXME\|XXX" src --include="*.tsx" | head -20
```

---

## Summary

**Bugs caught by Sam today: 5**
- 4 missing client portal routes
- 7 missing advisor routes  
- Demo mode not preserved on dashboard links
- Auth race condition
- Wrong branding in preview

**Pattern:** Most bugs were "incomplete implementation" — UI built before all destinations existed.

**Fix:** Route existence validation in CI + comprehensive click-through before marking done.

---

### L016: Stale Fallback Data (CRITICAL - Sam Reported 3:36 PM)
**What happened:** Market data showed SPY at $605 when actual price was $692 (14% off!)

**Root cause:** Hardcoded fallback prices were 3+ months old. When live API fails (timeout, rate limit), users see ancient data.

**Sam's words:** "This is killing the trust of our product. Project Pantheon is not doing what we said."

**The real problem:** Architecture was fragile:
- Fallback = static prices from October 2025
- No caching of last known good values
- Any API hiccup = massively wrong data

**Fix applied:**
1. Updated all fallback prices to current market values
2. Added in-memory caching of last known good prices (1hr TTL)
3. Cascade: Live → Cache → Fallback
4. Added `source` field to API response for debugging

**Prevention:**
- Fallback data is emergency-only, not a feature
- Any displayed data needs recency guarantees
- Add monitoring when using fallback data
- Review fallback prices monthly or when markets move >5%

**Rule:** Data shown to users must NEVER be more than 1 hour stale.

**Commit:** `5392841`

---

## Updated Bug Count

**Bugs caught by Sam today: 6** (was 5)
- This one is the worst because it's REPEAT behavior
