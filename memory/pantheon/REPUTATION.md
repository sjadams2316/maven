# Pantheon Reputation System

*Track agent performance. Earn autonomy through competence.*

---

## How Reputation Works

Every agent spawn is tracked. Performance accumulates over time.

```
New Agent → PROBATION (all outputs reviewed)
    ↓ 3 successful tasks
STANDARD (normal operation)
    ↓ 10 successful tasks, no bugs
TRUSTED (can ship without review)
    ↓ 25+ tasks, mentors others
ELITE (proposes architecture changes)
```

---

## Tracking Metrics

| Metric | What It Measures | Weight |
|--------|------------------|--------|
| Completion Rate | Tasks finished successfully | 30% |
| Quality Score | Output meets requirements | 25% |
| Bug Rate | Issues introduced | -20% |
| Verification | Actually tested the work | 15% |
| Learning Capture | Appended useful insight | 10% |

---

## Team Reputation Log

### Portfolio Lab Team

| Date | Agent | Task | Outcome | Notes |
|------|-------|------|---------|-------|
| 2026-02-09 | pantheon-polish-1 | Fix allocation display | ✅ PASS | Verified in browser |
| 2026-02-09 | pantheon-loading-states | Dashboard skeleton | ✅ PASS | Learning captured |
| 2026-02-10 | — | — | — | — |

**Team Status:** STANDARD
**Successful Tasks:** 5
**Bugs Introduced:** 0

---

### Oracle Team

| Date | Agent | Task | Outcome | Notes |
|------|-------|------|---------|-------|
| 2026-02-10 | eli-direct | Fix Oracle context injection | ✅ PASS | Critical fix, verified |
| 2026-02-10 | eli-heartbeat | Verify Oracle unique response | ✅ PASS | Tested with tax question |

**Team Status:** TRUSTED
**Successful Tasks:** 8
**Bugs Introduced:** 1 (hardcoded Oracle — now fixed)

---

### Dashboard Team

| Date | Agent | Task | Outcome | Notes |
|------|-------|------|---------|-------|
| 2026-02-09 | pantheon-market-fix | Fix hydration mismatch | ✅ PASS | SSR issue resolved |
| 2026-02-09 | pantheon-error-messages | Improve API errors | ✅ PASS | 4-part error structure |

**Team Status:** STANDARD
**Successful Tasks:** 4
**Bugs Introduced:** 0

---

### Tax Intelligence Team

| Date | Agent | Task | Outcome | Notes |
|------|-------|------|---------|-------|
| — | — | No tasks yet | — | Team initialized |

**Team Status:** PROBATION
**Successful Tasks:** 0

---

### Client Portal Team

| Date | Agent | Task | Outcome | Notes |
|------|-------|------|---------|-------|
| 2026-02-10 | eli-direct | Build initial portal | ✅ PASS | 5 pages created |
| 2026-02-10 | eli-direct | Add preview mode | ✅ PASS | Advisor preview works |

**Team Status:** STANDARD
**Successful Tasks:** 2
**Bugs Introduced:** 0

---

## Reputation Thresholds

| Level | Min Tasks | Max Bug Rate | Autonomy |
|-------|-----------|--------------|----------|
| PROBATION | 0 | — | All reviewed |
| STANDARD | 3 | <20% | Major changes reviewed |
| TRUSTED | 10 | <10% | Can ship most changes |
| ELITE | 25 | <5% | Can propose architecture |

---

## Bug Impact on Reputation

| Bug Severity | Reputation Impact |
|--------------|-------------------|
| Critical (site down) | -5 points, demote to PROBATION |
| Major (feature broken) | -3 points |
| Minor (visual issue) | -1 point |
| Sam catches it | -2 additional points |

---

## Recovering from Bugs

1. Fix the bug immediately
2. Add to ANTI-PATTERNS.md
3. Add check to QA rotation
4. Complete 3 clean tasks to recover

---

## Weekly Reputation Review

Every Sunday, review team standings:
- Promote agents that earned it
- Demote agents with bugs
- Identify teams needing support
- Celebrate top performers

---

*Reputation is earned, not given. Prove yourself through execution.*
