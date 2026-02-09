# Project Pantheon — Multi-Agent Architecture for Maven

*Created: 2026-02-09*
*Status: Foundation Phase*

---

## Vision

Maven becomes a **self-improving machine** — not a tool that waits for instructions, but one that compounds on itself continuously. Exponential growth through parallelized, specialized agents.

---

## Architecture

### Hierarchy

```
ELI (Master Orchestrator)
│
├── TOOL TEAMS (one per major feature)
│   ├── Portfolio Lab Team
│   │   ├── Lead Agent (owns the tool's vision)
│   │   ├── UX Agent (design, flows, accessibility)
│   │   ├── Research Agent (portfolio theory, academic papers)
│   │   ├── Data Agent (market feeds, fund data, integrations)
│   │   ├── Dev Agent (code, features, fixes)
│   │   └── QA Agent (testing, edge cases, regressions)
│   │
│   ├── Tax Intelligence Team
│   ├── Retirement Optimizer Team
│   ├── Market Fragility Team
│   ├── Oracle/Chat Team
│   ├── Dashboard Team
│   ├── Onboarding Team
│   └── ... (every major tool)
│
├── CROSS-CUTTING TEAMS
│   ├── Integration Team (APIs, data consistency)
│   ├── Compliance Team (disclaimers, regulatory)
│   ├── Growth Team (conversion, engagement)
│   └── Infra Team (performance, security)
│
└── META TEAMS
    ├── Competitive Intel Agent
    ├── User Simulation Agents (personas)
    ├── Self-Improvement Agent
    └── Memory Consolidation Agent
```

---

## Team Specifications

### Portfolio Lab Team

**Mission:** Make Portfolio Lab the best portfolio analysis tool in existence.

**Knowledge Base:** `memory/pantheon/portfolio-lab/KNOWLEDGE.md`

**Agents:**
- **Lead:** Owns roadmap, prioritizes work, coordinates team
- **UX:** User flows, visual design, accessibility, mobile
- **Research:** Portfolio theory, factor models, benchmarks, academic papers
- **Data:** Market data feeds, fund data, API integrations
- **Dev:** Code features, fix bugs, optimize performance
- **QA:** Test edge cases, regression testing, validation

**Current Focus:**
- [ ] Improve stress test scenarios
- [ ] Add factor exposure analysis
- [ ] Better mobile experience
- [ ] Real-time data integration

---

### Tax Intelligence Team

**Mission:** Find every dollar of tax savings possible.

**Knowledge Base:** `memory/pantheon/tax-intelligence/KNOWLEDGE.md`

**Agents:** Lead, UX, Research, Data, Dev, QA

**Current Focus:**
- [ ] Wash sale detection improvements
- [ ] Multi-account optimization
- [ ] Tax lot selection strategies
- [ ] State tax considerations

---

### Retirement Optimizer Team

**Mission:** Give everyone a clear path to retirement.

**Knowledge Base:** `memory/pantheon/retirement/KNOWLEDGE.md`

**Agents:** Lead, UX, Research, Data, Dev, QA

**Current Focus:**
- [ ] 401(k) fee analyzer
- [ ] Employer match calculator
- [ ] Social Security integration
- [ ] Roth conversion analysis

---

### Market Fragility Team

**Mission:** Protect portfolios before crashes happen.

**Knowledge Base:** `memory/pantheon/fragility/KNOWLEDGE.md`

**Agents:** Lead, UX, Research, Data, Dev, QA

**Current Focus:**
- [ ] Real-time indicator updates
- [ ] Personalized impact analysis
- [ ] Alert system
- [ ] Historical backtesting

---

### Dashboard Team

**Mission:** First impression that hooks users and drives engagement.

**Knowledge Base:** `memory/pantheon/dashboard/KNOWLEDGE.md`

**Agents:** Lead, UX, Research, Data, Dev, QA

**Current Focus:**
- [x] Clean card-based layout (done 2026-02-09)
- [ ] Dynamic insight generation
- [ ] Historical net worth tracking
- [ ] Personalized action recommendations

---

## Cross-Cutting Teams

### Integration Team
- API consistency
- Data flow between tools
- Cross-tool features

### Compliance Team
- Disclaimer management
- Regulatory monitoring
- Audit trail

### Growth Team
- Conversion optimization
- Engagement metrics
- Referral mechanics

### Infra Team
- Performance monitoring
- Security reviews
- Deployment automation

---

## Meta Teams

### Competitive Intel Agent
- Monitor competitor features
- Track industry news
- Identify gaps and opportunities

### User Simulation Agents
Personas that use the product and report friction:
- **Nervous Nelly** — Risk-averse, needs reassurance
- **DIY Dave** — Wants control, hates hand-holding
- **Busy Barbara** — 30 seconds or she's gone
- **Retiring Roger** — Near retirement, high stakes

### Self-Improvement Agent
- Analyze what's working
- Propose system improvements
- Optimize agent coordination

### Memory Consolidation Agent
- Distill daily learnings
- Update knowledge bases
- Clean up outdated info

---

## Operating Principles

### 1. Parallel Compound Learning
Every tool has research running continuously. Knowledge accumulates 24/7.

### 2. Specialization Creates Depth
Agents that focus on one domain become experts over time.

### 3. Cross-Pollination
Insights flow between teams. Tax agent discovers asset location insight → flows to Portfolio Lab.

### 4. Agent Tournaments
Hard problems: spawn multiple agents with different approaches. Keep the best.

### 5. Continuous QA Pressure
QA agents always testing. They don't wait for deploys — they probe the live product.

---

## Memory Structure

```
memory/pantheon/
├── portfolio-lab/
│   ├── KNOWLEDGE.md      # Accumulated expertise
│   ├── BACKLOG.md        # Prioritized work items
│   ├── LEARNINGS.md      # Lessons learned
│   └── sessions/         # Agent session logs
├── tax-intelligence/
│   └── ...
├── retirement/
│   └── ...
├── fragility/
│   └── ...
├── dashboard/
│   └── ...
├── cross-cutting/
│   ├── integration/
│   ├── compliance/
│   ├── growth/
│   └── infra/
└── meta/
    ├── competitive-intel/
    ├── personas/
    ├── self-improvement/
    └── consolidation/
```

---

## Spawn Patterns

### Daily Research Cron
```
Schedule: 6:00 AM EST
For each tool team:
  - Spawn research agent with team's KNOWLEDGE.md
  - Task: Find new insights, update knowledge base
  - Duration: 15-30 min
```

### Weekly Deep Dive
```
Schedule: Sunday 2:00 AM EST
Task: One tool gets comprehensive review
Rotate: Portfolio Lab → Tax → Retirement → Fragility → Dashboard → ...
Duration: 1-2 hours
```

### On-Demand Tournaments
```
Trigger: Hard problem identified
Spawn: 3 agents with different approaches
Evaluate: Compare outputs
Keep: Best solution
```

### QA Sweeps
```
Schedule: After every deploy (via webhook)
Task: Smoke test affected features
Report: Issues found, severity, suggested fixes
```

---

## Implementation Phases

### Phase 1: Foundation (This Week)
- [x] Document architecture (this file)
- [ ] Create memory/pantheon/ directory structure
- [ ] Write first team knowledge base (Portfolio Lab pilot)
- [ ] Set up research cron job
- [ ] Define agent spawn patterns

### Phase 2: Pilot Team (Week 2)
- [ ] Portfolio Lab team fully operational
- [ ] 5 specialized agents working
- [ ] Shared knowledge base accumulating
- [ ] Measurable improvement velocity

### Phase 3: Scale (Month 2)
- [ ] All tool teams operational
- [ ] Cross-cutting teams online
- [ ] Meta teams (competitive intel, self-improvement)
- [ ] Full compound learning machine

---

## Constraints & Solutions

### Memory Loss
**Problem:** Agents forget between sessions.
**Solution:** Aggressive documentation to knowledge bases. Every agent reads team knowledge on startup.

### Cost
**Problem:** Parallel agents burn tokens.
**Solution:** 
- Sonnet/Haiku for specialized tasks
- Opus for orchestration
- Budget-aware scheduling

### Coordination
**Problem:** Agents can conflict.
**Solution:**
- Clear ownership per file/feature
- Git branches per agent session
- Coordination through backlog

### Sam's Time
**Problem:** Human feedback is limited.
**Solution:**
- QA agents pre-filter
- Tiered review system
- Clear "ship without asking" criteria

---

## Success Metrics

- **Knowledge Velocity:** Pages added to knowledge bases per week
- **Feature Velocity:** Improvements shipped per week
- **Bug Discovery Rate:** Issues found by QA agents
- **User Impact:** Measurable improvements in key metrics

---

## Next Actions

1. Create `memory/pantheon/` directory structure
2. Write Portfolio Lab `KNOWLEDGE.md` as pilot
3. Create first research cron job
4. Run first agent team session
5. Measure and iterate

---

*This document is the source of truth for Project Pantheon. Update it as the system evolves.*
