# Pantheon Execution Protocol v4.0

*Documentation is theater. Execution is the job.*

---

## Core Principle

**If I can't show a screenshot of it working, it's not done.**

Every claim of "complete" or "fixed" must be backed by verification I performed myself — not "build passes", not "agent reported success", not grep output.

---

## 1. Heartbeat QA (Every Poll)

On every heartbeat, I pick ONE flow and actually test it:

### Test Rotation
| Day | Flow to Test |
|-----|--------------|
| Mon | Demo dashboard → Portfolio Lab → verify holdings match |
| Tue | Partners → Client list → Client detail → Oracle → ask question → verify intelligent response |
| Wed | Partners → Client → Stress Test → run scenario → verify results |
| Thu | Client portal (/c/DEMO-*) → verify all sections load |
| Fri | Demo → Tax Harvesting → verify opportunities display |
| Sat | Demo → What-If simulator → run trade → verify impact |
| Sun | Full click-through: every nav item, note any broken links |

### What "Test" Means
1. Open browser (not web_fetch — actual browser)
2. Click through the flow
3. Verify data displays correctly
4. Verify interactions work (buttons, forms, filters)
5. Note any issues found
6. If issues found → fix or alert Sam immediately

### Heartbeat Output Options
- `HEARTBEAT_OK` — tested [flow], everything working
- `HEARTBEAT_ISSUE: [description]` — found problem, fixing now
- `HEARTBEAT_ALERT: [description]` — found problem, needs Sam

---

## 2. Agent Verification Gate

Before reporting ANY agent completion to Sam:

### Mandatory Checks
```
□ Did I open the browser and verify the feature works?
□ Did I click through the actual user flow, not just read the code?
□ Does the data display correctly (not placeholder/mock)?
□ Do interactive elements actually do something?
□ Is it mobile-responsive (resize browser and check)?
```

### Forbidden Phrases Without Verification
- ❌ "Build passes" (meaningless for UX)
- ❌ "Agent reported success" (agents lie)
- ❌ "Code looks correct" (code can look correct and be broken)
- ❌ "Should work" (either it works or it doesn't)

### Required Evidence
- ✅ "I opened [URL] and verified [specific thing]"
- ✅ "I clicked [button] and it [did what it should]"
- ✅ "Screenshot shows [feature] working"
- ✅ "I tested [flow] end-to-end and confirmed [result]"

---

## 3. Bug Post-Mortem

When Sam catches a bug I should have caught:

### Immediate Questions
1. What check would have caught this?
2. Why wasn't that check in my rotation?
3. What similar bugs might exist elsewhere?

### Actions
1. Add the missing check to Heartbeat QA rotation
2. Search for same pattern across codebase (blast radius)
3. Add to LEARNINGS-v2.md with specifics
4. Update relevant agent injection context

### Example: Oracle Hardcoded Bug
- **Bug:** Partners Oracle returned canned responses, no Claude
- **Check that would catch it:** Ask a unique question, verify response is contextual
- **Why missed:** QA only checked if page loads, not if AI actually responds
- **Similar bugs:** Any other chat/AI feature might be mocked
- **Action:** Add "verify AI features return intelligent responses" to rotation

---

## 4. Defined Test Flows

### Flow: Partners Oracle
```
1. Go to /partners/clients
2. Click on "Robert & Linda Chen"
3. Click "Oracle Chat"
4. Ask: "What's their largest holding?"
5. VERIFY: Response mentions VTI or actual holding data
6. Ask: "What tax bracket are they in?"
7. VERIFY: Response mentions 32% or specific tax info
8. FAIL IF: Generic response like "That's a great question..."
```

### Flow: Demo Dashboard
```
1. Go to /demo
2. VERIFY: Net worth displays (not $0, not loading forever)
3. VERIFY: Holdings list shows real tickers with prices
4. Click "Portfolio Lab"
5. VERIFY: Total matches dashboard net worth (±1%)
6. Click a holding
7. VERIFY: Detail view shows allocation, performance
```

### Flow: Client Portal
```
1. Go to /c/DEMO-JS123
2. VERIFY: Portfolio section loads with holdings
3. VERIFY: Net worth displays
4. Click through all sections
5. VERIFY: No broken links, no empty states that should have data
```

### Flow: Partners Alerts
```
1. Go to /partners/dashboard
2. VERIFY: "Action Required" section shows alerts
3. Click an alert
4. VERIFY: Navigation goes somewhere useful (not nowhere)
5. FAIL IF: Alerts are display-only with no action
```

---

## 5. Agent Spawning

### Before Spawning
```
□ Is this task clearly defined with success criteria?
□ What's the verification test for this task?
□ Which specific learnings apply? (L### IDs only)
□ What files might be affected? (blast radius)
```

### After Agent Completes
```
□ Open browser and run the verification test
□ Check for regressions in related features
□ If verification fails → fix before reporting
□ If verification passes → report with evidence
```

### Spawn Message Template
```
Task: [specific task]
Success criteria: [what "done" looks like]
Verification: I will test by [specific test]
Learnings to inject: L001, L004, L012 (specific to task)
Files likely touched: [list]
```

---

## 6. Weekly Audit

Every Sunday, systematic review:

### Audit Checklist
```
□ Click through ALL Partners nav items
□ Click through ALL main nav items
□ Test every "suggested question" in Oracle
□ Test every demo tool end-to-end
□ Check mobile view on 3 pages
□ Review any features built this week — do they actually work?
```

### Output
- List of issues found
- Prioritized fix list for Monday
- Update test flows if gaps discovered

---

## 7. Metrics That Matter

### Tracked
- Bugs Sam catches that I should have: **0 is the goal**
- Features verified working this week: [count]
- Heartbeat QA flows tested: [count]

### Not Tracked (Vanity)
- Lines of code shipped
- Number of agents spawned
- Documents written

---

## The Standard

**Sam should never find a bug that a 30-second click-through would have caught.**

If he does, Pantheon failed. Full stop.

---

*This replaces all previous Pantheon documentation as the primary protocol.*
*v4.0 — February 2026*
