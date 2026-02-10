# Project Pantheon — Multi-Agent Architecture for Maven

*Created: 2026-02-09*
*Last Updated: 2026-02-10 07:24 EST*
*Status: Fully Autonomous + Compounding + Autonomous Build System*
*Version: 3.2 — Blast Radius + Selective Injection + Autonomous Builds*

---

## Vision

Maven becomes a **self-improving intelligence network** — not a tool that waits for instructions, but one that compounds on itself continuously through specialized AI agents working in teams, competing for quality, and learning from real outcomes.

**The Bittensor Analogy:** Pantheon is a private, purpose-built Bittensor where agents are subnets, quality is the incentive, and Maven's improvement is the emission.

---

## Core Principles

### The Compound Learning Effect

| Timeframe | Maven with Pantheon | Traditional Competitor |
|-----------|---------------------|------------------------|
| Month 1 | ~30 research sessions, 4 sprints, hundreds of micro-improvements | 1-2 feature releases |
| Month 3 | ~90 sessions, deep knowledge base, pattern recognition emerging | ~6 features, no compounding |
| Month 6 | Institutional-grade depth, gap obvious to users | Playing catch-up |
| Year 1 | Would cost competitors $1M+ to replicate | Still doing linear development |

**Key insight:** The gap doesn't close — it widens. Every day of compound learning increases the delta.

---

## Operational Safeguards

### Credit-Conscious Spawning

To prevent work loss from API credit exhaustion:

**Policy:**
1. **Check before spawning** — Before launching new agents, assess cumulative cost of running tasks
2. **Atomic commits** — Agents commit incrementally so partial work is saved
3. **Priority gating** — When credits are constrained:
   - P0 (critical bugs, safety issues): Always spawn
   - P1 (high-impact features): Spawn if reasonable headroom
   - P2/P3 (polish, exploration): Defer until credits replenished
4. **Sequential over parallel** — When uncertain, run agents one at a time instead of 3-5 parallel

**Cost Tracking:**
- Average agent run: ~$0.05-0.10 (simple task) to ~$0.20-0.50 (complex build)
- Complex sprints with multiple files: ~$0.30-0.70
- Full feature builds: ~$0.50-1.00

**Recovery:**
- Git provides instant rollback for half-finished work
- Knowledge bases persist regardless of agent completion
- Agents can resume from KNOWLEDGE.md context if restarted

### Blast Radius Analysis (v3.2 — NEW)

**When fixing ANY issue, ALWAYS think: "Where else does this same problem exist?"**

This is MANDATORY — not optional. Every fix triggers a ripple effect analysis.

**Protocol:**
1. **Identify the Pattern** — What's the root cause? (e.g., "page uses static data instead of live prices")
2. **Find All Instances** — Search codebase for everywhere this pattern might exist
3. **Spawn Comprehensive Fix** — Don't fix one page, fix ALL affected pages in one sweep
4. **Document the Pattern** — Add to ANTI-PATTERNS.md so it's never repeated

**Example:**
- ❌ Wrong: "Demo page and Portfolio Lab don't match" → Fix just those two pages
- ✅ Right: "Pages aren't using consistent data sources" → Audit ALL pages, fix ALL of them

**Why This Matters:**
- Users lose trust when they see different numbers on different pages
- Fixing one page at a time wastes cycles (you'll just find the same bug elsewhere later)
- Comprehensive fixes demonstrate systems thinking

**Trigger Questions:**
- "What OTHER pages/components use this same data?"
- "What OTHER pages/components have this same pattern?"
- "If this was wrong here, where ELSE is it probably wrong?"

**This is now a CORE Pantheon principle.** When Eli or any agent receives a fix request, the default response is to think about blast radius FIRST, then execute comprehensively.

---

### Agent Coordination

**Status Tracking:** `memory/pantheon/PANTHEON-STATUS.md`
- Live tracker of running agents and what files they're touching
- File lock registry to prevent parallel conflicts
- Update when spawning/completing agents

**Before Spawning:**
1. Check PANTHEON-STATUS.md — is similar work in flight?
2. Check file locks — will this touch files another agent is editing?
3. Read PATTERNS.md — are there known gotchas for this type of work?
4. **Think about BLAST RADIUS — does this fix need to be applied elsewhere?**
5. Add entry to status tracker

**After Completion:**
1. Move agent to "Recently Completed"
2. Release file locks
3. Spawn QA agent if code was committed
4. **Update ANTI-PATTERNS.md if a new pattern was discovered**

### Autonomous Thinking (v3.0 — NEW)

**Research agents are now programmed to THINK FOR THEMSELVES.**

The old way: Agent receives task → completes exact task → stops.

The new way: Agent receives task → thinks "what else should I learn?" → expands scope → delivers comprehensive knowledge.

**Autonomous Thinking Protocol:**

1. **Go Deep, Not Just Wide**
   - Don't grab headline numbers — read FULL methodology
   - Capture reasoning, assumptions, caveats
   - Extract quotes that explain the thinking

2. **Think: "Who Else?"**
   - If researching Vanguard CMAs, also check JP Morgan, BlackRock, Capital Group, Research Affiliates
   - Don't wait to be asked — just do it

3. **Compare and Contrast**
   - Where do sources agree?
   - Where do they disagree? Why?
   - What's the consensus vs outlier view?

4. **Capture the "Why"**
   - Numbers without reasoning are useless
   - WHY does Vanguard expect 5.5%?
   - WHAT assumptions drive that?
   - HOW confident are they?

**Mandatory CMA Sources:**
| Source | Why |
|--------|-----|
| Vanguard | Most-cited, conservative |
| JP Morgan | 30+ year track record |
| BlackRock | Largest asset manager |
| Capital Group | Sam's employer, insider view |
| Research Affiliates | Contrarian, valuation-focused |
| Schwab | Retail perspective |
| Morningstar | Independent research |

**The Goal:** After research completes, knowledge should be COMPREHENSIVE — better than any single source because we synthesize all of them.

See: `memory/pantheon/PANTHEON-PROTOCOL.md` → "Research Agent Protocol" section

### Knowledge Quality: Confidence + Evidence (v3.1 — NEW)

All learnings now require structured metadata:

```markdown
**Confidence:** [low | medium | high]
**Evidence Source:** production-bug | user-feedback | simulation | research | inference
**Review By:** [YYYY-MM-DD or "evergreen"]
```

**Why:** Prevents early or incorrect assumptions from becoming permanent system truth. Keeps knowledge adaptive and auditable.

See: `memory/pantheon/LEARNING-FORMAT.md`

### Weekly Skeptic Agent (v3.1 — NEW)

**Schedule:** Sunday 11am (after Weekly Learning Review)

A scheduled agent whose role is to CHALLENGE, not change:

**Responsibilities:**
- Review top assumptions, patterns, and domain rules
- Flag outdated beliefs, contradictory evidence, overconfident conclusions
- Add `SKEPTIC:` annotations instead of deleting content

**Output:** Notes added to knowledge files, flagging items for human review.

**Why:** Avoids institutional dogma. Keeps Pantheon intellectually honest as conditions change.

### Oracle ↔ Pantheon Integration (v3.1 — NEW)

**The Complete Loop:**

```
User asks Oracle
    ↓
Oracle responds (grounded in data, receipted)
    ↓
Interaction logged
    ↓
Pantheon analyzes:
  - New learnings?
  - User confusion?
  - Missing tools?
  - Bad assumptions?
    ↓
Knowledge updated
    ↓
Oracle improves
    ↓
User gets better answers
```

**Oracle Design Principles:**
1. **Explicit Mode** — Classify intent (Explain, Compare, Simulate, Execute, Audit)
2. **Forced Tool Grounding** — No hallucinated financial advice
3. **Decision Receipts** — Structured audit trail for every meaningful action

### Autonomous Build System (v3.2 — NEW)

**Pantheon builds Maven 24/7 without waiting for human prompts.**

**The Loop:**
```
BACKLOG → SELECTOR → COST CHECK → SPAWN AGENT → QUALITY GATE → SHIP/ESCALATE → REPORT
```

**Components:**
- `maven/BACKLOG.md` — Prioritized work queue (P0/P1/P2/P3)
- `memory/pantheon/DAILY-SPEND.md` — Cost tracking
- `memory/pantheon/AUTONOMOUS-BUILD-SPEC.md` — Full specification

**Safety Rails:**
- $50/day budget (auto-pause if exceeded)
- Max 3 items per build window
- Quality gate: build passes, <200 lines, learning captured
- Forbidden zones: auth, payments, APIs, new routes
- Kill switch: 3 failures = pause + alert

**What CAN be auto-built:**
- Bug fixes with clear reproduction
- UI improvements (styling, copy, layout)
- Performance and accessibility fixes
- Adding data to existing displays

**What CANNOT be auto-built:**
- New pages or routes
- API integrations requiring keys
- Auth, payments, database changes
- Major architecture refactors

**Morning Report:** Daily summary of what shipped, escalated, or failed overnight.

See: `memory/pantheon/AUTONOMOUS-BUILD-SPEC.md` for full details.
4. **Disagree When Appropriate** — Advisor, not yes-machine
5. **Scoped Memory** — Personalization without creepiness

See: `memory/pantheon/ORACLE-DESIGN-PRINCIPLES.md`

**Key Insight:** Oracle teaches Pantheon. Pantheon improves Oracle. Intelligence compounds.

### Automated Data Validation (Cron)

**Scheduled sweep every 4 hours** — validates Maven data is loading correctly:

| Check | What it validates |
|-------|-------------------|
| Markets widget | SPY, QQQ, BTC, TAO showing prices (not "—") |
| Net Worth | "As of" timestamp present and recent |
| Holdings | Prices loading for all positions |
| Portfolio Lab | Page loads without errors |
| Console | No JavaScript errors |

**Cron ID:** `d5f755a4-6618-4c9e-99a6-46c562fc9758`
**Frequency:** Every 4 hours
**Output:** `DATA_VALIDATION_PASS` or detailed failure report

This catches data issues before users report them.

### QA Agent Protocol

After any agent commits code changes, spawn a lightweight QA agent:

```
Task: QA verification for commit [hash]

1. Read the commit diff: git show [hash]
2. Open mavenwealth.ai in browser
3. Navigate to the affected page(s)
4. Verify the change works as intended
5. Check for console errors
6. Test on mobile viewport if UI change
7. Report: PASS with screenshots, or FAIL with details
```

**When to skip QA:** Documentation-only changes, memory file updates, research tasks.

### Task Sizing Guidelines

**Ideal task size: 1-2 files, <200 lines changed, 2-5 minutes runtime**

| Task Size | Example | Recommendation |
|-----------|---------|----------------|
| ✅ Atomic | Fix goal math, add tooltip | Ship as-is |
| ⚠️ Medium | Add new component + integrate | Consider splitting |
| ❌ Large | New demo variant + insights + UI | Must split into 3+ tasks |

**Breaking down large tasks:**
- "Add retiree demo" becomes:
  1. "Add demo variant selector UI"
  2. "Create RETIREE_DEMO_PROFILE data"
  3. "Add retiree-specific insights"

Smaller tasks = cleaner commits, fewer conflicts, faster iteration.

### Shared Patterns

**Read first:** `memory/pantheon/PATTERNS.md`
- Common TypeScript fixes
- Component patterns (InsightCard types, Portfolio Lab tabs)
- API patterns (CORS, validation)
- Build and git workflows

When you discover a new pattern or gotcha, **add it to PATTERNS.md** so future agents don't rediscover it.

---

## Architecture

### Hierarchy

```
ELI (Root Network / Master Orchestrator)
│
├── TOOL TEAMS (Subnets)
│   ├── Portfolio Lab Team
│   │   ├── Lead Agent (owns vision, coordinates)
│   │   ├── UX Agent (design, flows, accessibility)
│   │   ├── Research Agent (theory, papers, best practices)
│   │   ├── Data Agent (feeds, integrations, APIs)
│   │   ├── Dev Agent (code, features, fixes)
│   │   └── QA Agent (testing, edge cases, validation)
│   │
│   ├── Tax Intelligence Team
│   ├── Retirement Optimizer Team
│   ├── Market Fragility Team
│   ├── Oracle/Chat Team
│   ├── Dashboard Team
│   ├── Onboarding Team
│   └── ... (every major tool)
│
├── PERSONA SPECIALISTS (Vertical Depth)
│   ├── Tech Exec Agent (RSUs, ISOs, 10b5-1, QSBS, concentration)
│   ├── Inheritor Agent (sudden wealth, estate complexity, family)
│   ├── Pre-Retiree Agent (sequence risk, SS optimization, Medicare)
│   ├── Business Owner Agent (entity structure, exit planning)
│   └── ... (deep specialists per client type)
│
├── CROSS-CUTTING TEAMS
│   ├── Integration Team (APIs, data consistency)
│   ├── Compliance Team (disclaimers, regulatory)
│   ├── Growth Team (conversion, engagement)
│   └── Infra Team (performance, security)
│
├── VALIDATION LAYER (Validators)
│   ├── Quality Validator (scores agent outputs objectively)
│   ├── Outcome Validator (tracks real-world results)
│   └── Compliance Validator (regulatory checks)
│
├── ADVERSARIAL TEAM (Red Team)
│   ├── Edge Case Hunter (finds breaking inputs)
│   ├── UX Attacker (simulates confused users)
│   └── Security Prober (tests vulnerabilities)
│
└── META TEAMS
    ├── Competitive Intel Agent (monitors competitors)
    ├── External Signal Agent (regulations, markets, news)
    ├── Self-Improvement Agent (proposes system changes)
    └── Memory Consolidation Agent (distills learnings)
```

---

## Bittensor-Inspired Mechanisms

### 1. Competition (Miner Wars)

For hard problems, don't spawn one agent — spawn three:

```
Problem: Add factor exposure analysis to Portfolio Lab

Agent A: Uses academic factor model (Fama-French 5-factor)
Agent B: Uses practitioner model (Morningstar style factors)
Agent C: Uses hybrid approach with ML

Validator evaluates all three:
- Correctness: A=92, B=88, C=85
- UX Quality: A=75, B=90, C=82
- Performance: A=95, B=85, C=70

Winner: Agent A (correctness weighted heavily)
Runner-up approach logged for future reference
```

**Implementation:**
- Trigger: Complex features, architectural decisions, UX overhauls
- Spawn: 2-3 agents with different approaches
- Evaluate: Validator agent scores objectively
- Merge: Best solution, document alternatives

### 2. Reputation System (Stake Equivalent)

Track agent performance over time:

```yaml
agent: portfolio-lab-dev
metrics:
  quality_score: 94/100
  completion_rate: 87%
  bugs_introduced: 2
  bugs_fixed: 14
  validator_approval_rate: 91%
  cross_pollination_contributions: 7
reputation: HIGH
autonomy_level: ship_without_review
compute_allocation: 1.2x base
```

**Reputation Tiers:**
- **Probation:** New agents, all outputs reviewed
- **Standard:** Normal operation, major changes reviewed
- **Trusted:** Can ship most changes without review
- **Elite:** Can propose architectural changes, mentor other agents

**Reputation Affects:**
- Autonomy (what can ship without human review)
- Compute allocation (more resources for high performers)
- Task priority (first pick on interesting problems)

### 3. Emission Schedule (Resource Allocation)

Weekly compute budget allocated by value creation:

```
Total Weekly Budget: 100 compute units

Portfolio Lab: 25 units (high engagement, core feature)
Tax Intelligence: 20 units (high value per user)
Dashboard: 15 units (first impression critical)
Retirement: 15 units (complex, needs depth)
Fragility: 10 units (maintenance + alerts)
Meta Teams: 15 units (cross-cutting value)

Reallocation triggers:
- User engagement shifts → Budget follows
- Sam's strategic priority → Override allocation
- Team performance drops → Review and adjust
```

### 4. Composability (Subnet Calls)

Agents can invoke other agents:

```
Portfolio Lab Agent: "Calculating rebalance recommendation..."
  → Calls Tax Intelligence Agent: "Tax implications of selling AAPL?"
  ← Returns: "$2,400 short-term gain, suggest waiting 3 months for LTCG"
  → Calls Retirement Agent: "Impact on 401k contribution room?"
  ← Returns: "No impact, separate account"
  → Produces: Comprehensive recommendation with tax and retirement context
```

**Rules:**
- Agents declare capabilities they expose
- Calls are logged for debugging
- Circular dependencies prevented
- Timeout limits enforced

### 5. Immunity Period

New agents/teams get protected ramp-up time:

```
New Agent: estate-planning-research
Status: IMMUNE (Day 3 of 14)
Evaluation: Suspended until Day 14
Purpose: Time to learn domain, build baseline
```

After immunity:
- Performance measured against team benchmarks
- Low performers get coaching/retraining
- Persistent underperformers retired

### 6. Burn Mechanism (Negative Learning)

Failed approaches are documented, not just discarded:

```yaml
failure_log:
  id: PLB-2026-02-09-001
  agent: portfolio-lab-dev
  task: Add factor exposure chart
  approach: Used deprecated charting library
  result: Build failed
  root_cause: Didn't check library status
  learning: Always verify dependency status before using
  propagate_to: [all-dev-agents]
```

Future agents read failure logs to avoid repeating mistakes.

---

## Advanced Mechanisms

### 7. Real Outcome Tracking

Don't just optimize for "looks right" — optimize for **actual results**:

```yaml
prediction:
  id: TLH-2026-02-09-001
  type: tax_loss_harvest
  predicted_savings: $1,050
  client: client_123
  
outcome (6 months later):
  actual_savings: $1,127
  variance: +$77 (+7.3%)
  factors: [harvested_early, reinvested_gains]
  
feedback:
  model_update: Increase confidence in early harvest recommendations
  agent_reputation: +0.5 points
```

**Track outcomes for:**
- Tax savings predictions
- Retirement projections
- Risk assessments
- Rebalancing recommendations

### 8. Client Behavior as Ground Truth

Users vote with their actions:

```yaml
feature: portfolio_lab_factor_analysis
released: 2026-02-15
metrics_30_day:
  page_views: 12,450
  avg_time_on_page: 4.2 min
  completion_rate: 67%
  return_visits: 34%
  
signal: HIGH_VALUE
action: Increase Portfolio Lab team allocation
```

**Behavior signals:**
- Engagement (time, clicks, returns)
- Completion (did they finish the flow?)
- Abandonment (where do they leave?)
- Support tickets (confusion indicators)

### 9. Client Memory (Personalization Compounds)

Individual client "DNA" that improves every interaction:

```yaml
client_id: client_456
profile:
  communication:
    style: conservative_language
    jargon_tolerance: low
    preferred_format: charts_over_tables
  behavior:
    always_asks_first: tax_implications
    risk_stated: moderate
    risk_observed: conservative (based on behavior)
  context:
    life_events: [new_child_2025, promotion_expected_q2]
    concerns: [college_savings, work_life_balance]
  preferences:
    meeting_time: early_morning
    response_speed: thorough_over_fast
```

**Memory updates from:**
- Explicit preferences stated
- Behavioral patterns observed
- Life events mentioned
- Feedback given

### 10. External Signal Integration

Agents subscribe to the world:

```yaml
subscriptions:
  - source: sec_filings
    agent: compliance
    trigger: new_rule_proposal
    action: analyze_impact, flag_for_review
    
  - source: irs_updates
    agent: tax_research
    trigger: publication_release
    action: update_knowledge_base
    
  - source: fed_announcements
    agent: fragility_data
    trigger: rate_decision
    action: recalibrate_indicators
    
  - source: competitor_watch
    agent: competitive_intel
    trigger: feature_launch
    action: analyze_and_report
```

**Signal sources:**
- SEC/IRS/DOL publications
- Federal Reserve
- Competitor blogs/changelogs
- Industry news
- Academic journals

### 11. Uncertainty Awareness

Agents learn to know when they don't know:

```yaml
recommendation:
  action: Roth conversion of $50,000
  confidence: 62%
  flag: HUMAN_REVIEW_RECOMMENDED
  
uncertainty_factors:
  - inherited_ira_pre_secure_act (edge case)
  - state_tax_situation_complex
  - client_mentioned_possible_relocation
  
reasoning: |
    Standard Roth analysis suggests conversion beneficial,
    but inherited IRA rules are complex for pre-2020 deaths,
    and potential state change adds tax uncertainty.
    Recommend CPA consultation before execution.
```

**Confidence calibration:**
- Track predicted confidence vs actual outcomes
- Penalize overconfidence more than underconfidence
- Reward appropriate uncertainty flagging

### 12. Self-Modifying Architecture

Agents can propose changes to Pantheon itself:

```yaml
proposal:
  id: SYS-2026-03-15-001
  agent: self_improvement
  type: architecture_change
  
proposal: |
    Add new specialist role: Estate Planning Agent
    Justification: 
    - 23% of research queries relate to estate topics
    - Currently handled by scattered agents
    - Dedicated specialist would improve quality
    
    Suggested structure:
    - Lead, Research, Dev, QA agents
    - Initial focus: basic documents, beneficiary optimization
    
approval: PENDING_SAM_REVIEW
```

**Self-modification scope:**
- Propose new agent roles
- Suggest team restructuring
- Recommend process changes
- Flag inefficiencies

### 13. Bittensor Network Integration

Connect Pantheon to the decentralized AI network:

```yaml
bittensor_integrations:
  - subnet: 8 (Taoshi/Trading)
    use_case: Market signals for Fragility Index
    data_flow: subnet → fragility_data_agent
    
  - subnet: 1 (Text Prompting)
    use_case: Deep research queries
    data_flow: research_agent → subnet → research_agent
    
  - subnet: 18 (Cortex)
    use_case: Complex financial modeling
    data_flow: projection_agent → subnet → projection_agent
```

**Benefits:**
- Access to decentralized AI capabilities
- Diversified intelligence sources
- TAO investment directly feeds Maven
- Hedge against any single AI provider

### 14. White-Label Architecture (Scale Play)

Design Pantheon to be deployable for other RIAs:

```yaml
deployment_model:
  base_layer:
    - Core Pantheon architecture
    - Shared knowledge base (anonymized)
    - Common agent types
    
  instance_layer:
    - RIA-specific customization
    - Private client data
    - Custom branding
    - Firm-specific compliance
    
network_effects:
  - 100 RIAs using Pantheon = 100x learning (anonymized)
  - Common patterns identified across firms
  - Best practices propagate automatically
  - Each instance benefits from collective intelligence
```

**Moat:** First to build this captures the network effect.

### 15. Adversarial Red Team

Dedicated agents that try to break Maven:

```yaml
red_team:
  edge_case_hunter:
    mission: Find inputs that produce wrong outputs
    reward: Points per bug found (severity weighted)
    recent_finds:
      - Roth conversion calc fails for ages > 90
      - Tax harvesting suggests wash sale violation
      
  ux_attacker:
    mission: Simulate confused/frustrated users
    personas: [tech_phobic, impatient, skeptical]
    recent_finds:
      - "Portfolio Lab" name unclear to beginners
      - Back button on step 3 loses data
      
  security_prober:
    mission: Test for vulnerabilities
    scope: [api_endpoints, data_access, auth_flows]
    recent_finds:
      - None (good sign)
```

---

## Test Personas (Validation Layer)

Every change must be validated against multiple user types:

```yaml
test_personas:
  new_user:
    description: Empty state, first-time experience
    focus: Onboarding flow, empty states, first impressions
    net_worth: $0 (no data yet)
    
  basic_user:
    description: Simple portfolio, getting started
    focus: Core features, simple flows
    net_worth: $50K
    holdings: 5-10 positions
    
  power_user:
    description: Engaged user, complex portfolio
    focus: Advanced features, edge cases
    net_worth: $800K
    holdings: 45+ positions across 8 accounts
    
  hnw_user:
    description: High net worth, concentrated positions
    focus: Concentration tools, tax optimization
    net_worth: $2M+
    holdings: Includes single stock >25%
    
  retiree:
    description: Income-focused, decumulation phase
    focus: SS optimization, RMDs, income planning
    net_worth: $1.5M
    age: 68
    
  tech_exec:
    description: RSUs, ISOs, QSBS, IPO planning
    focus: Equity comp tools, concentration
    net_worth: $3M (60% in company stock)
    
  advisor_view:
    description: Multi-client dashboard
    focus: Client list, insights across clients
    clients: 10 test clients with varied profiles
```

**Validation Rule:** No feature ships without testing against at least 3 personas.

---

## UX Agent Responsibilities

Every team has a dedicated UX Agent. Their mandate:

```yaml
ux_agent_focus:
  user_flows:
    - Map the journey for each persona
    - Identify friction points
    - Ensure logical progression
    
  visual_design:
    - Consistency with design system
    - Proper use of color, typography, spacing
    - Dark mode compatibility
    
  mobile_first:
    - Test on small screens BEFORE desktop
    - Touch-friendly targets
    - Responsive layouts
    
  accessibility:
    - Screen reader compatibility
    - Keyboard navigation
    - Color contrast ratios
    
  clarity_test:
    - "Would a nervous 60-year-old understand this?"
    - "Would a busy executive use this in 30 seconds?"
    - "Does this create anxiety or confidence?"
    
  emotional_design:
    - Lead with value, not warnings
    - Celebrate milestones
    - Make complexity feel simple
```

**UX Quality Bar:** If you have to explain it, redesign it.

---

## Memory Structure

```
memory/pantheon/
├── portfolio-lab/
│   ├── KNOWLEDGE.md
│   ├── BACKLOG.md
│   ├── LEARNINGS.md
│   ├── FAILURES.md
│   └── sessions/
├── tax-intelligence/
├── retirement/
├── fragility/
├── dashboard/
├── personas/
│   ├── tech-exec/
│   ├── inheritor/
│   ├── pre-retiree/
│   └── business-owner/
├── cross-cutting/
│   ├── integration/
│   ├── compliance/
│   ├── growth/
│   └── infra/
├── validation/
│   ├── quality-scores/
│   ├── outcome-tracking/
│   └── reputation/
├── red-team/
│   ├── edge-cases/
│   ├── ux-issues/
│   └── security/
├── external-signals/
│   ├── regulatory/
│   ├── market/
│   └── competitive/
└── meta/
    ├── system-proposals/
    ├── performance-analysis/
    └── architecture-decisions/
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1) ✅ IN PROGRESS
- [x] Document architecture (this file)
- [x] Create directory structure
- [x] Write Portfolio Lab knowledge base
- [x] Set up daily research cron
- [x] Set up weekly sprint cron
- [ ] Implement basic reputation tracking
- [ ] Create validator agent role

### Phase 2: Competition & Validation (Weeks 2-3)
- [ ] Implement competition mechanism (spawn 2-3 for hard problems)
- [ ] Build validator agent that scores outputs
- [ ] Create failure logging system
- [ ] Add uncertainty confidence scoring
- [ ] Roll out to 3 more tool teams

### Phase 3: Feedback Loops (Month 2)
- [ ] Implement outcome tracking
- [ ] Add client behavior analytics
- [ ] Build client memory system
- [ ] Create external signal subscriptions
- [ ] Launch adversarial red team

### Phase 4: Advanced Intelligence (Month 3)
- [ ] Enable agent composability (cross-calls)
- [ ] Implement self-modification proposals
- [ ] Add persona specialists
- [ ] Integrate Bittensor subnets (pilot)

### Phase 5: Scale Architecture (Month 4+)
- [ ] Design white-label deployment model
- [ ] Build multi-tenant architecture
- [ ] Create RIA onboarding flow
- [ ] Implement network-wide learning

---

## Success Metrics

### Velocity Metrics
- Knowledge pages added per week
- Features shipped per week
- Bugs found (by red team) per week
- Bugs fixed per week

### Quality Metrics
- Validator approval rate
- Outcome prediction accuracy
- User engagement per feature
- Support ticket rate

### System Health Metrics
- Agent reputation distribution
- Competition win rate variance
- Cross-pollination frequency
- Self-modification proposal quality

### Business Metrics
- User activation rate
- Feature adoption rate
- Client retention
- NPS score

---

## Constraints & Mitigations

| Constraint | Mitigation |
|------------|------------|
| Memory loss between sessions | Aggressive documentation, structured knowledge bases |
| Token/compute cost | Tiered models (Haiku/Sonnet for tasks, Opus for orchestration) |
| Agent coordination conflicts | Clear ownership, git branches, backlog coordination |
| Human review bottleneck | Reputation-based autonomy, validator pre-filtering |
| Quality drift | Outcome tracking, adversarial testing, behavior signals |

---

## The Endgame

**Pantheon v1:** Agents that improve Maven.

**Pantheon v2:** Agents that improve themselves improving Maven.

**Pantheon v3:** A learning network that absorbs signal from users, markets, competitors, regulations, and outcomes — and converts all of it into better wealth guidance.

**Pantheon v4:** The operating system for wealth management — powering Maven and every RIA that wants institutional-grade AI.

---

## The Compounding System (v2.0) — Built 2026-02-09

*"Every sprint makes the next one smarter."*

### Overview

Pantheon now has a **self-reinforcing learning system** that captures knowledge from every agent run and feeds it back into future agents. This creates exponential improvement over time.

### Knowledge Hierarchy

```
LEARNINGS.md (raw, recent)
    ↓ promote after 2+ occurrences
PATTERNS.md (proven, curated)
    ↓ extract domain-specific
domain/KNOWLEDGE.md (specialized)
    ↓ inform
ANTI-PATTERNS.md (what NOT to do)
```

### Core Components

| File | Purpose | Update Frequency |
|------|---------|------------------|
| `LEARNINGS.md` | Raw insights from every agent | Every sprint |
| `PATTERNS.md` | Proven solutions | Weekly (promoted from LEARNINGS) |
| `ANTI-PATTERNS.md` | Documented failures | When bugs found |
| `FEEDBACK.md` | User reactions (ground truth) | Real-time |
| `code-patterns/` | Copy-paste code snippets | As needed |
| `COMPOUNDING-ROADMAP.md` | Future improvements | Monthly |

### Automated Crons

| Cron | Schedule | Purpose |
|------|----------|---------|
| `pantheon-weekly-review` | Sun 10am | Promote learnings → patterns |
| `pantheon-research-accumulation` | Mon/Thu 9am | Domain research |
| `pantheon-auto-qa` | Every 4 hours | Verify production health |

### Mandatory Agent Protocol

Every agent spawn now includes:

```
IMPORTANT — Read before starting:
1. Read memory/pantheon/PATTERNS.md for common fixes
2. Read memory/pantheon/LEARNINGS.md for recent insights
3. Read memory/pantheon/ANTI-PATTERNS.md for what NOT to do
4. After changes: run `npm run build` and fix any errors
5. Commit message format: type(scope): description
6. After push: wait 60s, then verify on production

MANDATORY BEFORE FINISHING:
Append your learning to memory/pantheon/LEARNINGS.md:
### [agent-name]
**Task:** [what you did]
**Insight:** [one actionable thing future agents should know]
```

### Verified Working — Test Sprint Results (2026-02-09)

| Agent | Task | Learning Captured |
|-------|------|-------------------|
| `pantheon-error-messages` | Improve API error structure | ✅ "4-part error responses: error, message, code, hint" |
| `pantheon-loading-states` | Dashboard skeleton loader | ✅ "Skeletons should match real layout structure" |
| `pantheon-tooltip-polish` | Financial term tooltips | ✅ "Use real-world examples in definitions" |

**Result:** 3/3 agents completed tasks AND captured learnings. System verified.

### The Exponential Math

| Timeline | Knowledge State | Agent Capability |
|----------|-----------------|------------------|
| Week 1 | 20 learnings | Junior dev |
| Month 1 | 100+ learnings, patterns emerging | Mid-level dev |
| Month 3 | Deep domain expertise encoded | Senior dev |
| Month 6 | Institutional knowledge | Principal engineer |
| Year 1 | **Unreplicable moat** | Domain expert |

**A competitor starting today needs 12 months to match our starting point.**

### Level 2: Feedback Loops (Next)

**User Feedback Capture (FEEDBACK.md)**
- Positive signals: What's working (double down)
- Negative signals: What's broken (fix fast)
- Feature requests: What users want
- Quotes: Exact words that capture intent

**Failure Analysis (ANTI-PATTERNS.md)**
- What broke?
- Why? (5 whys)
- How do we prevent forever?
- Every bug = permanent immunity

### Level 3: Research Compounding (Active)

**Continuous Domain Research**
- Competitor monitoring (Mon/Thu)
- Tax law changes
- Fintech trends
- Regulatory updates

**Research Index:** `memory/research/INDEX.md`
- Central catalog of all research
- Auto-updated by research crons

### Level 4: Code Compounding (Active)

**Pattern Library:** `memory/pantheon/code-patterns/`
- `mobile-responsive.md` — Touch targets, grids, scrolling
- `api-with-fallback.md` — Graceful degradation patterns

**Not just insights — actual copy-paste code.**

### Level 5: Meta-Compounding (Future)

**Agents that improve Pantheon itself:**
- What patterns keep appearing?
- What task types fail most?
- How can we improve the spawn template?

**The system gets better at getting better.**

### Sprint Statistics (2026-02-09)

| Sprint | Agents | Success Rate | Commits | Learnings |
|--------|--------|--------------|---------|-----------|
| Polish Sprint (15:14) | 4 | 100% | 4 | 4 |
| Test Sprint (15:39) | 3 | 100% | 4 | 3 |

**Total today:** 7 agents, 8 commits, 7 learnings captured.

### Files Created/Updated

```
memory/pantheon/
├── PANTHEON-PROTOCOL.md   — Full agent guidelines
├── PANTHEON-STATUS.md     — Live agent tracker + file locks
├── LEARNINGS.md           — Running log of insights
├── PATTERNS.md            — Proven solutions (updated)
├── ANTI-PATTERNS.md       — What NOT to do (23 items)
├── FEEDBACK.md            — User signal capture
├── COMPOUNDING-ROADMAP.md — Future improvements
└── code-patterns/
    ├── README.md
    ├── mobile-responsive.md
    └── api-with-fallback.md

memory/research/
└── INDEX.md               — Research catalog
```

---

*This document is the source of truth for Project Pantheon. Update it as the system evolves.*

*The compound learning machine has begun. Every day it runs, the moat deepens.*
