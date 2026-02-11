# Pantheon Conflict Resolution Protocol

*What happens when teams disagree? Escalation paths and resolution framework.*

---

## Common Conflicts

| Conflict Type | Example | Resolution Path |
|---------------|---------|-----------------|
| **Tax vs Portfolio** | "Harvest this loss" vs "Breaks factor exposure" | Quantify trade-off → Client preference → Eli decides |
| **Risk vs Growth** | "Too aggressive" vs "Needs returns" | Check client risk tolerance → Model both scenarios |
| **UX vs Data** | "Simpler is better" vs "Users need this info" | A/B test or user research → Data wins ties |
| **Speed vs Quality** | "Ship it" vs "Not ready" | QA gate is final → Quality wins |

---

## Escalation Ladder

```
Level 1: TEAM LEAD DISCUSSION
         └─→ Leads from both teams discuss, find common ground
         └─→ 80% of conflicts resolve here

Level 2: DATA-DRIVEN DECISION  
         └─→ Model both options quantitatively
         └─→ Present trade-offs with numbers
         └─→ Let data break the tie

Level 3: CLIENT PREFERENCE CHECK
         └─→ What does the client/persona actually want?
         └─→ Check persona KNOWLEDGE.md for guidance
         └─→ Conservative clients → lower risk wins
         └─→ Growth-oriented → returns wins

Level 4: ELI ARBITRATION
         └─→ Only for true deadlocks
         └─→ Eli reviews both positions
         └─→ Makes binding decision
         └─→ Documents reasoning for future reference
```

---

## Decision Framework

### When Tax Intelligence vs Portfolio Lab Disagree

**Scenario:** Tax says harvest AAPL loss ($5K tax savings), Portfolio says it breaks tech sector exposure.

**Resolution:**
1. Quantify tax benefit: $5K × marginal rate = $1,600 actual savings
2. Quantify portfolio impact: How much drift? Can it be fixed with rebalance?
3. Check client persona: Tax-sensitive? Factor-sensitive?
4. If close call → Tax wins (bird in hand)
5. If major portfolio impact → Portfolio wins

### When QA vs Dev Disagree

**Scenario:** Dev says "it works," QA says "edge case fails."

**Resolution:**
- QA wins. Always.
- "Works for most cases" is not shipping quality.
- Fix the edge case or document as known limitation.

### When Speed vs Quality Disagree

**Scenario:** Pressure to ship vs concerns about polish.

**Resolution:**
1. Is it a blocker for users? → Ship, iterate
2. Is it embarrassing? → Fix first
3. Is it a data accuracy issue? → Fix first (trust is everything)
4. Is it cosmetic? → Ship, add to backlog

---

## Anti-Patterns

❌ **Loudest voice wins** — Decisions should be data-driven, not debate-driven
❌ **Eli decides everything** — Teams should resolve 80%+ themselves
❌ **No decision made** — Deadlock is worse than either option
❌ **Revisiting settled decisions** — Once decided, move on

---

## Documentation Requirement

When a conflict is escalated to Level 4 (Eli Arbitration):

```markdown
## Conflict Record: [Date] - [Teams Involved]

**Issue:** [One-line description]

**Position A (Team X):**
[Their argument]

**Position B (Team Y):**
[Their argument]

**Data/Evidence:**
[Quantitative analysis if applicable]

**Decision:** [What was decided]

**Reasoning:** [Why]

**Precedent:** [Does this set a pattern for future similar conflicts?]
```

Store in: `memory/pantheon/decisions/[date]-[topic].md`

---

## Cross-Domain Task Assembly

For tasks that span multiple teams:

```
Task: "Optimize tax-loss harvesting without breaking factor exposure"

PRIMARY TEAM: Tax Intelligence (owns the outcome)
SUPPORT TEAM: Portfolio Lab (provides constraints)
OVERLAY: Client persona (provides preferences)

Coordination:
1. Tax Intel proposes harvest candidates
2. Portfolio Lab flags any that break allocation
3. Tax Intel adjusts recommendations
4. Joint output presented
```

**Rule:** One team is PRIMARY (owns the deliverable), others are SUPPORT (provide input/constraints).

---

*Most conflicts resolve at Level 1. Escalation to Eli is a sign the framework needs refinement.*
