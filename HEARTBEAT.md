# HEARTBEAT.md

## On Every Heartbeat

### Quick Checks (rotate through these)
- [ ] **Maven smoke test**: Open mavenwealth.ai in browser, verify dashboard loads, spot-check one tool
- [ ] **Console check**: Look for JavaScript errors on key pages
- [ ] **Data consistency spot-check**: Pick a random tool, verify it uses DEMO_PROFILE data

### Weekly Audits (do one per day)
- Monday: Mobile responsiveness check (resize browser, test 3 pages)
- Tuesday: Data consistency audit (check net worth across 5 pages)
- Wednesday: Icon/copy review (look for confusing UI)
- Thursday: Dead link check (click through navigation)
- Friday: Performance check (any slow-loading pages?)

### After Any Deploy
- Run through `maven/QA-CHECKLIST.md`
- Actually test the change in browser
- Report back what you verified

## Proactive Work (when idle)
- Review `maven/docs/DATA-CONSISTENCY-AUDIT.md` for unfixed items
- Check for TypeScript warnings
- Look for opportunities to improve UX
- Research domain topics for INVESTMENT-RESEARCH.md
