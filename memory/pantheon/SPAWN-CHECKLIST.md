# Pantheon Spawn Checklist v4.1

*MANDATORY before every `sessions_spawn` call. No exceptions.*

---

## Pre-Spawn Checklist

### 1. ☐ Route to the Right Team

Check `SPAWN-ROUTER.md` — which team owns this?

| Domain | Team | Knowledge File |
|--------|------|----------------|
| Portfolio analysis | Portfolio Lab | `teams/portfolio-lab/KNOWLEDGE.md` |
| Tax-loss harvesting, conversions | Tax Intelligence | `teams/tax-intelligence/KNOWLEDGE.md` |
| SS, RMDs, retirement | Retirement | `teams/retirement/KNOWLEDGE.md` |
| AI chat, Oracle | Oracle | `teams/oracle/KNOWLEDGE.md` |
| Home page, net worth | Dashboard | `teams/dashboard/KNOWLEDGE.md` |
| Client portal `/c/[code]` | Client Portal | `teams/client-portal/KNOWLEDGE.md` |
| Market risk, fragility | Fragility | `teams/fragility/KNOWLEDGE.md` |

### 2. ☐ Inject Team Knowledge

Include in spawn task:
```
Read: memory/pantheon/teams/[team]/KNOWLEDGE.md
```

### 3. ☐ Select Specific Learnings (NOT "all learnings")

Check LEARNINGS-v2.md, pick ONLY relevant L### IDs:

| Task Type | Inject These Learnings |
|-----------|------------------------|
| UI/Components | L002, L005, L006, L013, L014, L017 |
| API Routes | L001, L003, L007, L008, L010, L020 |
| Data/Demo | L004, L007, L009, L019, L020 |
| Testing/QA | L007, L008, L015, L018, L021, L022 |
| Finance/Analysis | L025, L026, L027 |

Format:
```
Relevant learnings:
- L004: Demo data must have ONE canonical source
- L019: Consolidate same tickers across accounts
```

❌ NEVER: "Read LEARNINGS.md for all insights"
✅ ALWAYS: Specific L### IDs only

### 4. ☐ Blast Radius Analysis

Ask: **"Where ELSE does this same problem exist?"**

| Question | Action |
|----------|--------|
| What's the root pattern? | Name it |
| What other files have this? | List them |
| Should fix be comprehensive? | Usually yes |

❌ Wrong: Fix one page, ignore others
✅ Right: Fix all affected pages in one sweep

### 5. ☐ Check File Locks

Check `PANTHEON-STATUS.md` — is another agent touching these files?

If yes: Wait, or coordinate with that task.

### 6. ☐ Define Verification

How will you PROVE it works? (Not "build passes")

```
Verification:
- Open: https://mavenwealth.ai/[specific-url]
- Click: [specific element]
- Verify: [specific expected behavior]
```

### 7. ☐ Add Persona If Applicable

If the task involves a specific client type:
- Tech exec → Also inject `personas/tech-exec/KNOWLEDGE.md`
- Pre-retiree → Also inject `personas/pre-retiree/KNOWLEDGE.md`
- Inheritor → Also inject `personas/inheritor/KNOWLEDGE.md`
- Business owner → Also inject `personas/business-owner/KNOWLEDGE.md`

---

## Spawn Template

```
Task: [One-line description]

**Team:** [From SPAWN-ROUTER.md]

**Read before starting:**
- memory/pantheon/teams/[team]/KNOWLEDGE.md
- memory/pantheon/PATTERNS.md
- [Persona file if applicable]

**Relevant Learnings:**
- L###: [specific learning]
- L###: [specific learning]

**Blast Radius:**
- Files to check: [list]
- Similar patterns: [description]

**Files to modify:**
- [file1]
- [file2]

**Acceptance criteria:**
- [criterion 1]
- [criterion 2]

**Verification (REQUIRED):**
- URL: https://mavenwealth.ai/[route]
- Flow: [click X, verify Y]
- Mobile: Test 375px viewport

**After completion:**
1. Run `npm run build`
2. Browser verify (profile=openclaw)
3. Commit: `type(scope): description`
4. Push to GitHub
5. Append learning to LEARNINGS-v2.md
6. Update team KNOWLEDGE.md if new pattern found
```

---

## Anti-Patterns (What NOT to Do)

❌ Generic spawn with no team routing
❌ "Read all learnings" (tokens + noise)
❌ Fix one instance, ignore blast radius
❌ No verification defined
❌ No learning captured afterward

---

## Quick Reference

| I need to... | Route to | Key learnings |
|--------------|----------|---------------|
| Fix a chart bug | Portfolio Lab | L004, L025 |
| Fix Oracle response | Oracle | L001, L008 |
| Improve client portal | Client Portal | L002, L006, L013 |
| Fix data inconsistency | Integration (cross-cutting) | L004, L019 |
| Add tax feature | Tax Intelligence | L004, L019, L025 |

---

*Follow this checklist. Every time. No shortcuts.*
