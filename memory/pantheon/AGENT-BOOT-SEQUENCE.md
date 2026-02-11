# Agent Boot Sequence

*The four-file minimum every agent reads before executing. No cold starts.*

---

## Mandatory Boot Sequence

**Every spawned agent reads these BEFORE taking any action:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    AGENT BOOT SEQUENCE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. TEAM KNOWLEDGE                                              │
│     └─→ memory/pantheon/teams/[team]/KNOWLEDGE.md              │
│     └─→ Domain ownership, patterns, common issues              │
│                                                                 │
│  2. PERSONA OVERLAY (if applicable)                             │
│     └─→ memory/pantheon/personas/[persona]/KNOWLEDGE.md        │
│     └─→ Client-type specific context                           │
│                                                                 │
│  3. ROUTING-MANIFEST (scope awareness)                          │
│     └─→ memory/pantheon/ROUTING-MANIFEST.md                    │
│     └─→ Understand boundaries, when to request support         │
│                                                                 │
│  4. TEAM-PREFLIGHT (completion criteria)                        │
│     └─→ memory/pantheon/TEAM-PREFLIGHT.md                      │
│     └─→ Know what "done" looks like before starting            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Why This Matters

| Without Boot Sequence | With Boot Sequence |
|-----------------------|-------------------|
| Agent guesses at patterns | Agent knows proven patterns |
| Reinvents solutions | Uses existing solutions |
| Doesn't know completion criteria | Knows exactly what "done" means |
| May step on other teams' scope | Knows when to request support |
| Cold-start mistakes | Warm start with context |

---

## Boot Sequence by Team

### Portfolio Lab Agent
```
Read in order:
1. memory/pantheon/teams/portfolio-lab/KNOWLEDGE.md
2. [persona overlay if specified]
3. memory/pantheon/ROUTING-MANIFEST.md
4. memory/pantheon/TEAM-PREFLIGHT.md → "Portfolio Lab Pre-Flight" section
```

### Tax Intelligence Agent
```
Read in order:
1. memory/pantheon/teams/tax-intelligence/KNOWLEDGE.md
2. [persona overlay if specified]  
3. memory/pantheon/ROUTING-MANIFEST.md
4. memory/pantheon/TEAM-PREFLIGHT.md → "Tax Intelligence Pre-Flight" section
```

### Client Portal Agent
```
Read in order:
1. memory/pantheon/teams/client-portal/KNOWLEDGE.md
2. [persona overlay if specified]
3. memory/pantheon/ROUTING-MANIFEST.md
4. memory/pantheon/TEAM-PREFLIGHT.md → "Client Portal Pre-Flight" section
```

### Oracle Agent
```
Read in order:
1. memory/pantheon/teams/oracle/KNOWLEDGE.md
2. [persona overlay if specified]
3. memory/pantheon/ROUTING-MANIFEST.md
4. memory/pantheon/TEAM-PREFLIGHT.md → "Oracle Pre-Flight" section
```

*(Pattern continues for all teams)*

---

## Spawn Template with Boot Sequence

```
Task: [One-line description]

**Team:** [Team name]

**BOOT SEQUENCE (read before executing):**
1. memory/pantheon/teams/[team]/KNOWLEDGE.md
2. memory/pantheon/personas/[persona]/KNOWLEDGE.md  ← if applicable
3. memory/pantheon/ROUTING-MANIFEST.md
4. memory/pantheon/TEAM-PREFLIGHT.md (your team's section)

**Relevant Learnings:**
- L###: [specific learning]

**Task Details:**
[Description of work]

**Acceptance Criteria:**
[What success looks like]

**Verification:**
[How to prove it works]
```

---

## Integration with SPAWN-CHECKLIST.md

The boot sequence is now **Step 0** of the spawn checklist:

```
☐ STEP 0: Include boot sequence in spawn instructions
   - Team KNOWLEDGE.md
   - Persona overlay (if applicable)
   - ROUTING-MANIFEST.md
   - TEAM-PREFLIGHT.md

☐ STEP 1: Route to right team (SPAWN-ROUTER.md)
☐ STEP 2: Select specific learnings (L### IDs only)
☐ STEP 3: Blast radius analysis
☐ STEP 4: Define verification
...
```

---

## Cold Start vs Warm Start

**Cold Start (BAD):**
```
"Fix the client portal styling"
→ Agent has no context
→ Guesses at patterns
→ May break calm UX philosophy
→ Doesn't know completion criteria
```

**Warm Start (GOOD):**
```
"Fix the client portal styling"

Boot sequence:
1. Read teams/client-portal/KNOWLEDGE.md
   → Learns: calm UX, no fees, no alerts, 48px touch targets
2. Read ROUTING-MANIFEST.md
   → Learns: owns /c/[code], may need Integration support
3. Read TEAM-PREFLIGHT.md
   → Learns: must verify no fees shown, mobile tested

→ Agent starts informed
→ Follows proven patterns
→ Knows what done looks like
```

---

*No agent executes cold. Boot sequence is mandatory.*
