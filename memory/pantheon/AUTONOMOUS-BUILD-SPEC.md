# Autonomous Build System Specification

*Pantheon builds Maven continuously without waiting for human prompts.*

**Created:** 2026-02-10
**Status:** SPEC — Ready for implementation

---

## Vision

Every morning Sam wakes up to:
- 1-3 features built overnight
- Bugs found and fixed
- A summary of what shipped

The system runs within guardrails, escalates when uncertain, and compounds Maven's progress 24/7.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTONOMOUS BUILD LOOP                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│   │ BACKLOG  │───▶│ SELECTOR │───▶│ SPAWNER  │              │
│   │ .md      │    │          │    │          │              │
│   └──────────┘    └──────────┘    └──────────┘              │
│                         │               │                    │
│                         ▼               ▼                    │
│                   ┌──────────┐    ┌──────────┐              │
│                   │  COST    │    │  AGENT   │              │
│                   │  GUARD   │    │  RUNS    │              │
│                   └──────────┘    └──────────┘              │
│                                        │                     │
│                                        ▼                     │
│                                  ┌──────────┐               │
│                                  │ QUALITY  │               │
│                                  │  GATE    │               │
│                                  └──────────┘               │
│                                        │                     │
│                         ┌──────────────┼──────────────┐     │
│                         ▼              ▼              ▼     │
│                   ┌─────────┐    ┌─────────┐    ┌────────┐ │
│                   │  SHIP   │    │ ESCALATE│    │  FAIL  │ │
│                   │         │    │ TO SAM  │    │ REPORT │ │
│                   └─────────┘    └─────────┘    └────────┘ │
│                         │              │              │     │
│                         └──────────────┴──────────────┘     │
│                                        │                     │
│                                        ▼                     │
│                                  ┌──────────┐               │
│                                  │ MORNING  │               │
│                                  │ REPORT   │               │
│                                  └──────────┘               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Components

### 1. Backlog (`maven/BACKLOG.md`)

Prioritized work queue with clear categories:

```markdown
# Maven Backlog

## P0 — Critical (auto-fix immediately)
- [ ] Production down
- [ ] Data showing wrong to users
- [ ] Security issues

## P1 — High (auto-build overnight)
- [ ] BUG: Tax harvesting shows stale prices
- [ ] FEATURE: Add dividend yield to holdings table
- [ ] UX: Mobile touch targets on goals page

## P2 — Medium (build when bandwidth)
- [ ] FEATURE: Export portfolio to CSV
- [ ] UX: Improve empty states

## P3 — Low (backlog for later)
- [ ] RESEARCH: Evaluate Plaid alternatives
- [ ] IDEA: Gamification badges

## ❌ Not Autonomous (requires Sam)
- [ ] Major architecture changes
- [ ] New integrations requiring API keys
- [ ] Pricing/business logic changes
- [ ] Anything touching auth/payments
```

**Rules:**
- P0: Trigger immediately, alert Sam
- P1: Build overnight, ship if tests pass
- P2: Build when P1 empty
- P3: Only with explicit approval
- ❌: Never auto-build

### 2. Cost Guard

**Daily Budget:** $50 max autonomous spend

```
if (daily_spend >= $50) {
  pause_autonomous_builds()
  alert("Daily budget reached")
}
```

**Per-agent limits:**
- Simple bug fix: ~$0.10-0.30
- Feature build: ~$0.50-1.00
- Complex feature: ~$1.50-3.00
- Max single agent: $5.00 (auto-kill if exceeded)

**Tracking:**
- Log spend in `memory/pantheon/DAILY-SPEND.md`
- Reset at midnight EST

### 3. Selector Logic

```python
def select_next_task():
    # 1. Check P0 first (critical)
    if p0_items:
        return p0_items[0], "immediate"
    
    # 2. Check cost budget
    if daily_spend >= budget:
        return None, "budget_exceeded"
    
    # 3. Check time (only build overnight 11pm-7am)
    if not in_build_window():
        return None, "outside_window"
    
    # 4. Pick top P1
    if p1_items:
        return p1_items[0], "overnight"
    
    # 5. Pick top P2 if P1 empty
    if p2_items:
        return p2_items[0], "bandwidth"
    
    return None, "backlog_empty"
```

### 4. Quality Gate

Before shipping, verify:

```markdown
## Quality Checklist
- [ ] `npm run build` passes
- [ ] No TypeScript errors
- [ ] No new console errors (browser check)
- [ ] Feature works as described
- [ ] Blast radius considered (related areas checked)
- [ ] Learning captured in LEARNINGS-v2.md
```

**Auto-ship if:**
- All checks pass
- Change is < 200 lines
- Only touches files in scope

**Escalate to Sam if:**
- Tests fail
- Change is > 200 lines
- Touches unexpected files
- Agent expresses uncertainty

### 5. Morning Report

Delivered to Sam's preferred channel at 7am:

```markdown
## 🌅 Pantheon Overnight Report — 2026-02-10

### Shipped ✅
1. **Tax harvesting stale prices** — Fixed by applying useLivePrices hook
   - Files: tax-harvesting/page.tsx
   - Commit: abc123
   - Cost: $0.45

2. **Mobile touch targets on goals** — Increased to 48px minimum
   - Files: goals/page.tsx
   - Commit: def456
   - Cost: $0.22

### Escalated ⚠️
1. **CSV export feature** — Agent uncertain about file format, needs input
   - Draft PR ready for review

### Failed ❌
1. **Dividend yield column** — TypeScript errors, rolled back
   - Error log attached
   - Added to retry queue

### Stats
- Total cost: $0.67
- Budget remaining: $49.33
- P1 items remaining: 3
- Build window: 11pm-7am (8 hours)
```

---

## Implementation Plan

### Phase 1: Backlog Setup
1. Create `maven/BACKLOG.md` with current known items
2. Define clear P0/P1/P2/P3 criteria
3. Mark items that are NOT autonomous

### Phase 2: Overnight Builder Cron
```javascript
// Cron: Every 2 hours from 11pm-7am
{
  schedule: "0 23,1,3,5,7 * * *",
  task: "overnight-builder",
  payload: `
    1. Read maven/BACKLOG.md
    2. Check cost budget (memory/pantheon/DAILY-SPEND.md)
    3. Select top eligible P1 item
    4. Spawn agent with:
       - Task description
       - Relevant learnings (selective injection!)
       - Quality gate requirements
    5. On completion:
       - Verify build passes
       - If pass: commit, mark done, log cost
       - If fail: log error, add to retry queue
    6. Update morning report draft
  `
}
```

### Phase 3: Morning Report Cron
```javascript
// Cron: 7am daily
{
  schedule: "0 7 * * *",
  task: "morning-report",
  payload: `
    Compile overnight results into summary.
    Send to Sam via preferred channel.
    Reset daily spend counter.
  `
}
```

### Phase 4: Cost Tracking
- Create `memory/pantheon/DAILY-SPEND.md`
- Log each agent's token usage and estimated cost
- Enforce budget limits

---

## Safety Rails

### What CAN be auto-built:
- Bug fixes with clear reproduction
- UI improvements (styling, copy, layout)
- Adding data to existing displays
- Performance improvements
- Accessibility fixes
- Test coverage

### What CANNOT be auto-built:
- New pages or routes
- API integrations
- Authentication changes
- Database schema changes
- Payment/billing logic
- Anything in `/api/` that handles money
- Deployment configuration
- Environment variables

### Kill Switches:
1. **Budget exceeded** — Auto-pause until reset
2. **3 consecutive failures** — Pause and alert
3. **Sam says stop** — Immediate halt via command
4. **File touches forbidden path** — Abort and alert

---

## Success Metrics

After 1 week:
- [ ] 10+ P1 items shipped autonomously
- [ ] 0 production incidents from auto-builds
- [ ] Morning reports are useful (Sam confirms)
- [ ] Cost stays within $50/day budget

After 1 month:
- [ ] Backlog velocity measurable
- [ ] Patterns emerge (what works autonomously vs needs human)
- [ ] Trust calibrated (can we increase autonomy?)

---

## Configuration

| Setting | Value | Notes |
|---------|-------|-------|
| Build window | Configurable | Test: 11am-6pm, Prod: 11pm-7am |
| Daily budget | $50 | Pause if exceeded |
| Max items per window | 3 | Start conservative |
| Progress pings | Every 2 hours | During active window |
| Report channel | Main session | Telegram when stable |
| Retry attempts | 2 | Then escalate |

---

## Mandatory Agent Instructions

Every autonomous agent MUST receive:

```
## Autonomous Build Protocol

You are running autonomously. Follow these rules strictly:

1. **Selective Learning Injection** — Only these learnings apply:
   [Eli inserts relevant L### IDs based on task type]

2. **Blast Radius** — Before fixing, search for ALL instances of this pattern

3. **Quality Gate** — Before completing:
   - [ ] npm run build passes
   - [ ] Change is < 200 lines
   - [ ] Learning captured in LEARNINGS-v2.md with proper tags

4. **Escalate if uncertain** — If you're >20% unsure, STOP and flag for human review

5. **Forbidden zones** — Do NOT touch:
   - /api/ routes handling auth or payments
   - Environment variables
   - Database schemas
   - Deployment configs

Commit message format: "auto: [type] description"
Example: "auto: fix tax harvesting stale prices"
```

---

*This is the next evolution of Pantheon. Maven builds itself while Sam sleeps.*
