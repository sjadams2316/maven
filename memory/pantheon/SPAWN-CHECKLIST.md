# Spawn Checklist (MANDATORY)

*Eli must complete this checklist BEFORE every sessions_spawn call.*

---

## Pre-Spawn Checklist

### 1. Blast Radius ✓
- [ ] What's the root pattern of this issue?
- [ ] What OTHER pages/components have this same pattern?
- [ ] Am I fixing comprehensively or just one spot?

### 2. Learning Injection ✓
- [ ] What task type is this? (UI / API / Data / Testing / Mobile / External / Error / Finance)
- [ ] Which specific learning IDs apply? (Check LEARNINGS-v2.md injection guide)
- [ ] Have I included ONLY relevant learnings in the task description?

### 3. File Locks ✓
- [ ] Check PANTHEON-STATUS.md — any agents touching same files?

---

## Spawn Template (Copy-Paste)

```
**Task:** [One-line description]

**Context:**
- Files: [specific files to modify]
- Pattern: [what's the root issue]

**Relevant Learnings:**
- L[XX]: [brief description]
- L[XX]: [brief description]

**Acceptance Criteria:**
- [ ] [specific verifiable outcome]
- [ ] npm run build passes

**Blast Radius Check:**
- [ ] All instances of this pattern identified and fixed
```

---

## Learning ID Quick Reference

| Task Type | Learning IDs |
|-----------|-------------|
| UI/Components | L002, L005, L006, L013, L014, L017 |
| API Routes | L001, L003, L007, L008, L010, L020 |
| Data/Demo | L004, L007, L009, L019, L020 |
| Testing/QA | L007, L008, L015, L018, L021, L022 |
| Mobile | L002, L006 |
| External APIs | L001, L008, L010, L020 |
| Error Handling | L001, L003, L005 |
| Finance/Analysis | L025, L026, L027 |
| Portfolio Display | L004, L019, L025, L026, L027 |

*Synced with LEARNINGS-v2.md Domain-Specific Injection Guide*

---

## Example: Good Spawn

```
**Task:** Fix data consistency across all pages showing portfolio values

**Context:**
- Files: All pages using financials/holdings data
- Pattern: Pages fetching data from different sources (static vs live prices)

**Relevant Learnings:**
- L004: Demo data must have ONE canonical source
- L019: Consolidate same tickers across accounts
- L020: Always fetch live prices for simulations

**Acceptance Criteria:**
- [ ] All pages show same portfolio value (±live price fluctuation)
- [ ] npm run build passes

**Blast Radius Check:**
- [x] Audited: /demo, /portfolio-lab, /tax-harvesting, /fragility, /goals, /family, /financial-snapshot, /retirement, /stress-test
```

---

*If Eli spawns without following this, call it out.*
