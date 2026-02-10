# Project Pantheon v3.2 — Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           PROJECT PANTHEON v3.2                                  │
│                    "Maven Builds Itself While Sam Sleeps"                        │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                           🔮 MAVEN ORACLE (User-Facing AI)                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│    User Asks Question ──→ Oracle Responds ──→ Interaction Logged                │
│                                   │                    │                         │
│                                   │                    ▼                         │
│                                   │         ┌──────────────────┐                │
│                                   │         │ PANTHEON LEARNS: │                │
│                                   │         │ • User confusion?│                │
│                                   │         │ • Missing tools? │                │
│                                   │         │ • Bad assumptions│                │
│                                   │         │ • New patterns?  │                │
│                                   │         └────────┬─────────┘                │
│                                   │                  │                          │
│                                   ▼                  ▼                          │
│                          Oracle Improves ◀── Knowledge Updated                  │
│                                                                                  │
│    THE LOOP: Users teach Oracle → Oracle teaches Pantheon → Pantheon improves   │
│              Oracle → Users get better answers → More usage → More learning     │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              🎯 ORCHESTRATOR (Eli)                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ Blast Radius    │  │ Learning        │  │ Protocol        │                  │
│  │ Analysis        │  │ Injection       │  │ Enforcement     │                  │
│  │ "Where else?"   │  │ "L004, L019"    │  │ "Did you...?"   │                  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    ▼                 ▼                 ▼
┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
│   🤖 AUTONOMOUS       │ │   🔬 RESEARCH         │ │   🔍 QA/MONITORING    │
│      BUILD SYSTEM     │ │      ENGINE           │ │      SYSTEM           │
├───────────────────────┤ ├───────────────────────┤ ├───────────────────────┤
│                       │ │                       │ │                       │
│  BACKLOG.md           │ │  Daily Research       │ │  Data Validation (4h) │
│       ↓               │ │  CMA Updates          │ │  Consistency Check    │
│  SELECTOR             │ │  Competitor Intel     │ │  Route Health         │
│       ↓               │ │  Domain Knowledge     │ │  Console Errors       │
│  COST GUARD ($50/day) │ │                       │ │                       │
│       ↓               │ │       ↓               │ │       ↓               │
│  SPAWN AGENT          │ │  memory/research/     │ │  Find Issue           │
│       ↓               │ │  domain-knowledge/    │ │       ↓               │
│  QUALITY GATE         │ │                       │ │  Alert or Auto-Fix    │
│       ↓               │ │                       │ │                       │
│  SHIP → REPORT        │ │                       │ │                       │
│                       │ │                       │ │                       │
└───────────────────────┘ └───────────────────────┘ └───────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           📚 KNOWLEDGE LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ LEARNINGS    │  │ PATTERNS     │  │ ANTI-        │  │ CODE         │        │
│  │ v2.md        │  │ .md          │  │ PATTERNS.md  │  │ PATTERNS/    │        │
│  │              │  │              │  │              │  │              │        │
│  │ 28 tagged    │  │ Proven       │  │ What NOT     │  │ Copy-paste   │        │
│  │ insights     │  │ solutions    │  │ to do        │  │ snippets     │        │
│  │ L001-L028    │  │              │  │              │  │              │        │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                                  │
│  ┌────────────────────────────────────────────────────────────────────┐        │
│  │              SELECTIVE INJECTION (saves 70% tokens)                 │        │
│  │  ┌─────────────────────────────────────────────────────────────┐   │        │
│  │  │ UI tasks → L002, L005, L006, L013, L014, L017               │   │        │
│  │  │ API tasks → L001, L003, L007, L008, L010, L020              │   │        │
│  │  │ Data tasks → L004, L007, L009, L019, L020, L028             │   │        │
│  │  │ Finance tasks → L025, L026, L027                            │   │        │
│  │  └─────────────────────────────────────────────────────────────┘   │        │
│  └────────────────────────────────────────────────────────────────────┘        │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           🛡️ SAFETY RAILS                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ COST GUARD   │  │ FILE LOCKS   │  │ FORBIDDEN    │  │ KILL SWITCH  │        │
│  │              │  │              │  │ ZONES        │  │              │        │
│  │ $50/day max  │  │ No conflicts │  │ No auth/pay  │  │ 3 fails =    │        │
│  │ Track spend  │  │ Check status │  │ No DB/env    │  │ pause+alert  │        │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           🔄 MAINTENANCE CRONS                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  DAILY                          │  WEEKLY (Sunday)                              │
│  ─────                          │  ──────────────                               │
│  • Research (6am)               │  • Learning Review (10am)                     │
│  • QA Sweeps (every 4h)         │  • Pattern Promotion (10am)                   │
│  • Autonomous Builds            │  • Skeptic Agent (11am)                       │
│                                 │                                               │
│  MON/THU                        │  FUTURE (at 1000 learnings)                   │
│  ───────                        │  ─────────────────────────                    │
│  • Research Accumulation (9am)  │  • Shadow Agent activation                    │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           📊 REPORTING                                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐       │
│  │                    🌅 MORNING REPORT                                 │       │
│  │  ───────────────────────────────────────────────────────────────────│       │
│  │  ✅ Shipped: 3 P1 items ($1.20)                                     │       │
│  │  ⚠️ Escalated: 1 (needs Sam's input)                                │       │
│  │  ❌ Failed: 1 (retrying tonight)                                    │       │
│  │  💰 Budget: $48.80 remaining                                        │       │
│  └─────────────────────────────────────────────────────────────────────┘       │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                           🚀 THE COMPOUND EFFECT                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   Day 1    │   Week 1   │   Month 1   │   Month 3   │   Month 6               │
│   ─────    │   ──────   │   ───────   │   ───────   │   ───────               │
│   Setup    │   20+      │   100+      │   300+      │   1000+                 │
│   Proto-   │   features │   features  │   features  │   features              │
│   cols     │   shipped  │   compound  │   compound  │   MOAT                  │
│            │            │   learnings │   patterns  │   UNBREACHABLE          │
│                                                                                  │
│   "Competitors need 6 months to match what Pantheon ships in a week"           │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Quick Reference

| Component | Location | Purpose |
|-----------|----------|---------|
| Full Spec | `memory/PROJECT-PANTHEON.md` | Complete documentation |
| Autonomous Builds | `memory/pantheon/AUTONOMOUS-BUILD-SPEC.md` | Build system details |
| Spawn Checklist | `memory/pantheon/SPAWN-CHECKLIST.md` | Pre-spawn requirements |
| Backlog | `maven/BACKLOG.md` | Prioritized work queue |
| Learnings | `memory/pantheon/LEARNINGS-v2.md` | Tagged insights |
| Cost Tracking | `memory/pantheon/DAILY-SPEND.md` | Budget monitoring |
| Agent Status | `memory/pantheon/PANTHEON-STATUS.md` | Live tracker |

---

*Pantheon v3.2 — The system that builds Maven while Sam sleeps.*
