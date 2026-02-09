# PANTHEON
## Maven's Agent Hierarchy System

*A framework for exponential AI-assisted development using hierarchical agents.*

---

## Overview

Pantheon is an agent orchestration system where Eli (the Architect) leads a hierarchy of specialized agents and sub-agents to build, maintain, and improve Maven continuously.

The name comes from the Greek "pantheon" — a collective of gods, each with their domain, working together under leadership.

---

## The Hierarchy

```
                           ┌─────────────┐
                           │     ELI     │
                           │  Architect  │
                           │  & Leader   │
                           └──────┬──────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
┌───────┴───────┐        ┌───────┴───────┐        ┌───────┴───────┐
│    ATLAS      │        │    ORACLE     │        │   GUARDIAN    │
│   Portfolio   │        │   AI/Chat     │        │  QA/Security  │
│ Intelligence  │        │  Experience   │        │   Sentinel    │
└───────┬───────┘        └───────┬───────┘        └───────┬───────┘
        │                        │                        │
   ┌────┴────┐              ┌────┴────┐              ┌────┴────┐
   │Research │              │PromptEng│              │LinkCheck│
   │Optimize │              │Voice/TTS│              │DataSync │
   │UX/Flow  │              │Memory   │              │PerfTest │
   └─────────┘              └─────────┘              └─────────┘
```

---

## Tier 1: Domain Commanders

| Agent | Domain | Responsibility | Status |
|-------|--------|----------------|--------|
| **ATLAS** | Portfolio Intelligence | Portfolio Lab, Fragility Index, Stress Tests, Optimization | 🟡 Planned |
| **ORACLE** | AI Experience | Chat, Voice, Memory, Prompts, Personality | 🟡 Planned |
| **GUARDIAN** | Quality & Security | QA sweeps, Link verification, Data consistency, Performance | 🟢 Active |
| **FORGE** | Profile & Data | Onboarding, Profile Setup, Account Aggregation | 🟡 Planned |
| **COMPASS** | Planning Tools | Retirement, Monte Carlo, Tax Harvesting, Goals | 🟡 Planned |
| **PRISM** | Design System | Components, Responsive, Animations, Visual polish | 🟡 Planned |

---

## Tier 2: Specialist Sub-Agents

### GUARDIAN's Team (First to Deploy)
- `guardian-links` — Verify all routes go where they claim
- `guardian-data` — DEMO_PROFILE consistency across all pages
- `guardian-perf` — Load times, bundle size, lighthouse scores
- `guardian-security` — Auth, data exposure, XSS

### ATLAS's Team
- `atlas-research` — Fundamentals, analyst data, market research
- `atlas-optimize` — Algorithms, calculations, projections
- `atlas-ux` — User flow, accessibility, mobile
- `atlas-qa` — Edge cases, stress testing

### ORACLE's Team
- `oracle-prompts` — System prompts, personality, tone
- `oracle-voice` — TTS, STT, voice UX
- `oracle-memory` — Context, learning, personalization
- `oracle-knowledge` — Domain expertise, financial knowledge

---

## Operating Principles

### 1. Graduated Autonomy

| Level | Trust | Can Do | Needs Approval |
|-------|-------|--------|----------------|
| 🟢 Auto | High | Fix typos, update copy, minor CSS | Nothing |
| 🟡 Semi | Medium | Add features, refactor code | Destructive changes |
| 🔴 Manual | Low | Propose only | All changes |

New agents start at 🔴, earn trust through successful deploys.

### 2. Reporting Chain

```
Sub-agent completes task
        ↓
Reports to Domain Commander
        ↓
Commander synthesizes across sub-agents
        ↓
Reports to Eli
        ↓
Eli reports to Sam (if needed)
```

### 3. Communication Protocol

**Task Assignment:**
```
From: Eli
To: GUARDIAN
Task: Full QA sweep of Maven
Priority: High
Deadline: 30 minutes
Report: Findings + recommendations
```

**Status Report:**
```
From: GUARDIAN
To: Eli
Status: Complete
Findings: 3 issues (1 critical, 2 minor)
Actions Taken: Fixed 2 minor issues
Needs Approval: 1 critical fix (routing change)
```

---

## Committees (Cross-Agent Collaboration)

### UX Council
Representatives from each agent's UX sub-agents
- Ensures consistency across tools
- Resolves design conflicts
- Proposes system-wide improvements

### Performance Guild
Optimizers from each domain
- Monitors bundle sizes
- Identifies slow pages
- Shares optimization techniques

### Innovation Lab
Weekly "what if" sessions
- Agents propose wild features
- Vote on what to prototype
- Winner gets resources to build

---

## Implementation

### Phase 1: GUARDIAN (Current)
- Deploy GUARDIAN for QA sweeps
- Prove the model works
- Establish reporting patterns

### Phase 2: ATLAS + ORACLE
- Add domain commanders for core features
- Sub-agents for specialization
- Cross-agent communication

### Phase 3: Full Pantheon
- All 6 commanders active
- Sub-agents deployed
- Committees formed
- Autonomous improvement cycles

---

## Spawning Agents

### GUARDIAN Sweep (Example)
```javascript
sessions_spawn({
  task: `You are GUARDIAN, Maven's QA sentinel.
    
    Run a full QA sweep:
    1. Link verification — grep for router.push, verify all go to correct destinations
    2. Data consistency — check net worth matches across dashboard, portfolio-lab, retirement
    3. Mobile spot-check — verify 3 key pages render correctly at 375px width
    4. Console errors — check for any JavaScript errors
    
    Report:
    - Critical issues (blocking)
    - Minor issues (should fix)
    - Observations (nice to have)
    
    For each issue, include file path and line number if possible.`,
  label: "guardian-sweep",
  runTimeoutSeconds: 600
});
```

---

## Metrics

### Agent Performance
- Tasks completed
- Issues found (for QA agents)
- Bugs introduced (negative)
- User satisfaction impact

### System Health
- Deploy frequency
- Bug escape rate
- Time to fix issues
- Feature velocity

---

## Future Ideas

1. **Agent Memory** — Each agent maintains its own learnings
2. **Inter-Agent Messaging** — Agents can request help from each other
3. **Competitive Dynamics** — Agents earn "innovation tokens" based on performance
4. **User Feedback Loop** — Agents learn from actual user behavior
5. **Self-Improvement** — Agents can propose improvements to their own prompts

---

*Created: 2026-02-08*
*Status: Active Development*
*Lead: Eli*
*Sponsor: Sam*
