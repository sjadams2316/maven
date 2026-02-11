# Pantheon Routing Manifest

*Explicit decision tree for task routing. Reduces ELI reasoning overhead.*

---

## Primary Routing Rules

**Match FIRST rule that applies. Stop at first match.**

```
IF task mentions "tax" OR "harvest" OR "Roth" OR "gains" OR "basis"
   → PRIMARY: Tax Intelligence
   → SUPPORT: Portfolio Lab (if affects allocation)

IF task mentions "Social Security" OR "RMD" OR "retirement income" OR "decumulation"
   → PRIMARY: Retirement
   → SUPPORT: Tax Intelligence (if tax implications)

IF task mentions "Oracle" OR "chat" OR "AI response" OR "prompt"
   → PRIMARY: Oracle
   → SUPPORT: None (self-contained)

IF task mentions "client portal" OR "/c/" OR "calm UX" OR "client-facing"
   → PRIMARY: Client Portal
   → SUPPORT: Integration (if data consistency)

IF task mentions "portfolio" OR "allocation" OR "holdings" OR "analysis" OR "stress test"
   → PRIMARY: Portfolio Lab
   → SUPPORT: Tax Intelligence (if tax-aware needed)

IF task mentions "dashboard" OR "home page" OR "net worth display" OR "market data"
   → PRIMARY: Dashboard
   → SUPPORT: Integration (if data sync issues)

IF task mentions "fragility" OR "risk indicator" OR "market signal"
   → PRIMARY: Fragility
   → SUPPORT: None

IF task mentions "alternatives" OR "PE" OR "VC" OR "private" OR "hedge fund"
   → PRIMARY: Alternatives
   → SUPPORT: Portfolio Lab (if integration needed)

IF task mentions "model portfolio" OR "sleeve" OR "drift" OR "rebalance"
   → PRIMARY: Model Portfolios
   → SUPPORT: Tax Intelligence (if tax-aware)

IF task mentions "data consistency" OR "numbers don't match" OR "sync"
   → PRIMARY: Integration (cross-cutting)
   → SUPPORT: Affected tool teams

IF task mentions "bug" OR "broken" OR "error" OR "doesn't work"
   → Identify affected feature → Route to owning team
   → SUPPORT: QA (for verification)

DEFAULT (no clear match):
   → Ask for clarification OR
   → Route to most likely team based on affected files
```

---

## Persona Overlay Rules

**Personas are NOT separate execution teams. They are context injections.**

```
IF client type is "tech exec" (RSUs, ISOs, equity comp)
   → INJECT: personas/tech-exec/KNOWLEDGE.md
   → INTO: Primary team's context

IF client type is "pre-retiree" (55-70, retirement planning)
   → INJECT: personas/pre-retiree/KNOWLEDGE.md
   → INTO: Primary team's context

IF client type is "inheritor" (sudden wealth, estate)
   → INJECT: personas/inheritor/KNOWLEDGE.md
   → INTO: Primary team's context

IF client type is "business owner" (exit planning, entity)
   → INJECT: personas/business-owner/KNOWLEDGE.md
   → INTO: Primary team's context
```

**Example:**
```
Task: "Add RSU vesting schedule to tax-loss harvesting"

Routing:
- PRIMARY: Tax Intelligence
- PERSONA OVERLAY: Tech Exec (inject knowledge about ISO/RSU tax treatment)
- Result: Tax Intel agent gets both team knowledge AND persona expertise
```

---

## Multi-Team Tasks

When a task clearly spans domains:

```
Pattern: [PRIMARY] + [SUPPORT] + [OVERLAY]

Example: "Tax-efficient rebalancing for pre-retiree with concentrated stock"

- PRIMARY: Portfolio Lab (owns rebalancing)
- SUPPORT: Tax Intelligence (tax-loss harvesting coordination)
- OVERLAY: Pre-Retiree persona (sequence risk awareness)
- OVERLAY: Tech Exec persona (if the concentration is company stock)

Spawn instruction:
"Read: teams/portfolio-lab/KNOWLEDGE.md
 Also read: teams/tax-intelligence/KNOWLEDGE.md (for tax coordination)
 Also read: personas/pre-retiree/KNOWLEDGE.md (for client context)
 Primary deliverable owner: Portfolio Lab"
```

---

## Self-Assembly Pattern

For complex tasks, teams can self-assemble:

```
1. ELI identifies PRIMARY team
2. PRIMARY team lead assesses: "Do I need support?"
3. If yes → PRIMARY requests specific support from other teams
4. Support teams provide input/constraints
5. PRIMARY delivers final output
6. ELI only re-engages if conflict or blocker
```

**This reduces ELI as bottleneck.** ELI routes, teams coordinate.

---

## Ambiguous Task Handling

If routing is unclear:

1. **Check file paths** — Which team owns those files?
2. **Check feature area** — Which team owns that feature?
3. **Ask clarifying question** — "Is this about X or Y?"
4. **Default to broader team** — Portfolio Lab handles general portfolio stuff

**Never:** Spawn generic agent without team routing.

---

## Quick Reference Card

| Keywords | Primary Team |
|----------|--------------|
| tax, harvest, Roth, gains, basis | Tax Intelligence |
| SS, RMD, retirement, decumulation | Retirement |
| Oracle, chat, AI, prompt | Oracle |
| /c/, client portal, calm | Client Portal |
| portfolio, allocation, analysis, stress | Portfolio Lab |
| dashboard, net worth, market | Dashboard |
| fragility, risk signal | Fragility |
| PE, VC, private, alternatives | Alternatives |
| model, sleeve, drift, rebalance | Model Portfolios |
| consistency, sync, mismatch | Integration |

---

*Route explicitly. Reduce reasoning overhead. Let teams execute.*
