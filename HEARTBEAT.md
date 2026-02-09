# HEARTBEAT.md

## On Every Heartbeat

### Quick Checks (rotate through these)
- [ ] **Maven smoke test**: Open mavenwealth.ai in browser, verify dashboard loads, spot-check one tool
- [ ] **Console check**: Look for JavaScript errors on key pages
- [ ] **Data consistency spot-check**: Pick a random tool, verify it uses DEMO_PROFILE data
- [ ] **Click-through test**: Actually click 3-5 buttons/links and verify they go to the right place

### Weekly Audits (do one per day)
- Monday: Mobile responsiveness check (resize browser, test 3 pages)
- Tuesday: Data consistency audit (check net worth across 5 pages)
- Wednesday: Icon/copy review (look for confusing UI)
- Thursday: Dead link check (click through ALL navigation items)
- Friday: Performance check (any slow-loading pages?)
- Saturday: Full profile setup flow test
- Sunday: Review QA-CHECKLIST.md for anything missed

### After Any Deploy
- Run through `maven/QA-CHECKLIST.md`
- **Actually open browser and click through the change**
- Test the happy path AND edge cases
- Report back what you verified (not just "looks good")

### Bug Hunt Mode
When Sam asks for a "sweep" or "find bugs", do this:
1. Run the grep commands in QA-CHECKLIST.md to find common patterns
2. Open browser and click through every link on dashboard
3. Check all buttons actually do what they say
4. Look for any `router.push` going to wrong places
5. Verify data flows correctly (profile → dashboard → tools)

## Proactive Work (when idle)
- Review `maven/docs/DATA-CONSISTENCY-AUDIT.md` for unfixed items
- **Run the bug-hunting greps** from QA-CHECKLIST.md
- Check for TypeScript warnings
- Look for opportunities to improve UX
- Research domain topics for INVESTMENT-RESEARCH.md

## Key Lesson (2026-02-08)
"View all holdings" was routing to /onboarding instead of /portfolio-lab.
**Always verify links go where they claim to go.**
Pattern to check: `grep -rn "router.push\|href=" | grep -v node_modules`
