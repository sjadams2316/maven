# Maven QA Checklist

Run this checklist after every deploy or during heartbeats. Use the browser tool to actually click through.

## 🔗 Link & Navigation Audit

### Dashboard Links
- [ ] "View all X holdings" → goes to /portfolio-lab (not /onboarding!)
- [ ] All tool cards link to correct pages
- [ ] Oracle suggestions open Oracle modal
- [ ] "Open Oracle →" button works
- [ ] Net worth card accounts expand properly
- [ ] Profile completion indicator links to /profile/setup

### Header Navigation
- [ ] Logo → /dashboard (when logged in) or / (when logged out)
- [ ] Dashboard → /dashboard
- [ ] Portfolio Lab → /portfolio-lab
- [ ] Goals → /goals
- [ ] Family → /family
- [ ] Oracle button opens modal
- [ ] Profile dropdown works
- [ ] AdvisorPro → /advisor

### Profile Setup Flow
- [ ] Can complete all 8 steps without errors
- [ ] Back button works on each step
- [ ] Auto-save persists between sessions
- [ ] "Continue Profile Setup" button appears if draft exists
- [ ] Completion saves to profile correctly

## 📊 Data Consistency

### Dashboard
- [ ] Net worth matches sum of accounts
- [ ] Holdings show real data from DEMO_PROFILE (not hardcoded)
- [ ] Portfolio allocation pie matches holdings
- [ ] Market data shows (S&P, Nasdaq, BTC, TAO)

### Portfolio Lab
- [ ] Holdings list matches dashboard
- [ ] Allocation percentages add to 100%
- [ ] Stress test uses actual holdings
- [ ] Optimize tab shows current vs target

### Other Tools
- [ ] Monte Carlo uses profile data
- [ ] Retirement uses correct age from DOB
- [ ] Tax harvesting shows actual holdings
- [ ] Income page derives from dividend holdings

## 🐛 Common Bug Patterns

### Wrong Routes (like today's bug)
Look for any `router.push('/onboarding')` or `router.push('/')` that should go elsewhere.

```bash
# Find potential wrong routes
grep -r "router.push.*onboarding" apps/dashboard/src/
grep -r "href.*onboarding" apps/dashboard/src/
```

### Hardcoded Data
Look for hardcoded values that should come from profile:

```bash
# Find hardcoded portfolio values
grep -rn "800000\|797500\|620000" apps/dashboard/src/app/
```

### Missing Error Handling
- [ ] API calls have try/catch
- [ ] Loading states shown while fetching
- [ ] Empty states for no data

## 🎯 After Every Deploy

1. Open https://mavenwealth.ai in browser
2. Click "Try Demo"
3. Verify FirstWinModal shows "$4,185" (not old "$42k" message)
4. Click through to dashboard
5. Verify net worth shows $797,500
6. Click "View all holdings" → should go to Portfolio Lab
7. Open Oracle → verify it responds
8. Check console for JavaScript errors

## 🔄 Weekly Deep Dive (rotate one per day)

- **Monday**: Mobile responsiveness (resize browser, test 3 key pages)
- **Tuesday**: Data consistency (check net worth across 5 different pages)
- **Wednesday**: Icon/copy review (look for confusing or placeholder text)
- **Thursday**: Dead link check (click through all nav items)
- **Friday**: Performance (any pages that load slowly?)
- **Weekend**: Full flow test (complete profile setup end-to-end)

---

## 🚨 2026-02-11 Bug Patterns (NEW)

### Missing Route Check (L011)
Before shipping ANY UI with links:
```bash
# Verify every href has a corresponding page.tsx
grep -roh 'href="/c/\[code\]/[^"]*"' src --include="*.tsx" | sort -u
# Then check: ls apps/dashboard/src/app/c/[code]/
```

### Demo Mode Preservation (L012)
In any page under `/partners/`:
- Use `demoHref()` helper for ALL internal links
- Search for violations:
```bash
grep -n 'href="/partners/' src/app/partners --include="*.tsx" | grep -v demoHref | grep -v 'demo=true'
```

### Auth Race Conditions (L013)
- Use `usePathname()` not `useState` for URL tracking
- Never check auth state before path is determined

### Brand Consistency (L014)
Before any demo:
```bash
grep -rn "Adams Wealth\|placeholder\|TODO\|FIXME" src --include="*.tsx"
```

## ✅ Partners Dashboard Checklist

- [ ] All nav sidebar links work with `?demo=true`
- [ ] "View all →" links preserve demo mode
- [ ] Quick Action buttons work
- [ ] Action Required items are clickable → client detail
- [ ] Prep Meeting opens modal with AI content
- [ ] Client table links work

## ✅ Client Portal Checklist

- [ ] All sidebar nav links work: Home, Family, Portfolio, Goals, Explore, Social Security, Estate, Tax, Philanthropy, Documents, Messages
- [ ] "Explore Your Plan" cards link correctly
- [ ] Oracle/Ask Maven button works
- [ ] All pages show demo content (not 404)

---

*Last updated: 2026-02-11*
*Update this checklist when you find new bug patterns!*
