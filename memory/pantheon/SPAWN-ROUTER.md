# Pantheon Spawn Router

*Route tasks to the right specialist team. Don't spawn generic agents.*

---

## Quick Routing Table

| If the task involves... | Route to Team | Inject Knowledge |
|-------------------------|---------------|------------------|
| Portfolio analysis, optimization, factors, projections | **Portfolio Lab** | `teams/portfolio-lab/KNOWLEDGE.md` |
| Tax-loss harvesting, Roth conversions, gains/losses | **Tax Intelligence** | `teams/tax-intelligence/KNOWLEDGE.md` |
| Social Security, RMDs, 401k, retirement income | **Retirement** | `teams/retirement/KNOWLEDGE.md` |
| AI chat, Oracle, prompts, voice, context injection | **Oracle** | `teams/oracle/KNOWLEDGE.md` |
| Home page, net worth display, market data, first impression | **Dashboard** | `teams/dashboard/KNOWLEDGE.md` |
| Client portal `/c/[code]`, calm UX, advisor curation | **Client Portal** | `teams/client-portal/KNOWLEDGE.md` |
| Market risk indicators, fragility signals, alerts | **Fragility** | `teams/fragility/KNOWLEDGE.md` |
| PE/VC, private credit, real estate, hedge funds | **Alternatives** | `teams/alternatives/KNOWLEDGE.md` |
| Model portfolios, sleeves, drift, rebalancing | **Model Portfolios** | `teams/model-portfolios/KNOWLEDGE.md` |

---

## Persona Routing

| If the client type is... | Also inject | Why |
|--------------------------|-------------|-----|
| Tech executive (RSUs, ISOs, IPO) | `personas/tech-exec/KNOWLEDGE.md` | Equity comp complexity |
| Pre-retiree (55-70, planning transition) | `personas/pre-retiree/KNOWLEDGE.md` | Sequence risk, Medicare |
| Inheritor (sudden wealth) | `personas/inheritor/KNOWLEDGE.md` | Emotional + technical |
| Business owner (exit planning) | `personas/business-owner/KNOWLEDGE.md` | Entity, succession |

---

## Cross-Cutting Routing

| If the task requires... | Also include | From |
|-------------------------|--------------|------|
| Browser testing, verification | QA protocols | `cross-cutting/qa/KNOWLEDGE.md` |
| Data consistency across pages | Integration patterns | `cross-cutting/integration/KNOWLEDGE.md` |
| Disclaimers, audit trails | Compliance rules | `cross-cutting/compliance/KNOWLEDGE.md` |

---

## Spawn Template with Routing

```
Task: [One-line description]

**Team:** [Routed team name]
**Knowledge Files:**
- memory/pantheon/teams/[team]/KNOWLEDGE.md
- [Add persona if applicable]
- [Add cross-cutting if applicable]

**Relevant Learnings (from LEARNINGS-v2.md):**
- L### — [specific learning]
- L### — [specific learning]

**Context:**
- File(s) to modify: [list]
- Acceptance criteria: [how to verify]
- Blast radius: [what else might be affected]

**Verification:**
- [ ] Browser test URL: [specific URL]
- [ ] Click through: [specific flow]
- [ ] Verify: [specific behavior]

On completion:
1. Run build
2. Browser verify (profile=openclaw)
3. Commit with conventional message
4. Append learning to LEARNINGS-v2.md with tag
5. Update team KNOWLEDGE.md if new pattern discovered
```

---

## Examples

### Example 1: Tax-Loss Harvesting Bug

**Wrong:** Generic spawn "fix tax harvesting display"

**Right:**
```
Task: Fix tax-loss harvesting showing stale data

**Team:** Tax Intelligence
**Knowledge Files:**
- memory/pantheon/teams/tax-intelligence/KNOWLEDGE.md

**Relevant Learnings:**
- L004: Demo data must have ONE canonical source
- L019: Consolidate same tickers across accounts

**Blast radius:** Check Portfolio Lab tax tab, Demo page tax section

**Verification:**
- Browser: https://mavenwealth.ai/demo
- Click: Tax-Loss Harvesting tab
- Verify: Opportunities match actual holdings
```

### Example 2: Client Portal Redesign

**Wrong:** Generic spawn "improve client portal"

**Right:**
```
Task: Add goal progress rings to client portal home

**Team:** Client Portal
**Knowledge Files:**
- memory/pantheon/teams/client-portal/KNOWLEDGE.md
- memory/pantheon/personas/pre-retiree/KNOWLEDGE.md (if retirement goal)

**Relevant Learnings:**
- L002: 48px touch targets
- L006: Mobile-first responsive
- L013: Client portal = calm, no action items

**Blast radius:** All /c/[code] pages, preview mode from Partners

**Verification:**
- Browser: https://mavenwealth.ai/c/DEMO-JS123
- Verify: Goal rings display, no fees/rebalancing shown
- Mobile: Test 375px viewport
```

---

## Why Routing Matters

1. **Specialized knowledge** — Team KNOWLEDGE.md has domain-specific patterns
2. **Consistent approach** — Same team = same conventions
3. **Compound learning** — Team learnings stay within team context
4. **Faster spawns** — Less context = faster, cheaper agents
5. **Better quality** — Specialists > generalists

---

## Anti-Pattern: Generic Spawns

❌ **Don't do this:**
```
Task: Fix the bug on the portfolio page
Read LEARNINGS.md for context
```

✅ **Do this:**
```
Task: Fix allocation pie chart not reflecting tax-advantaged accounts

Team: Portfolio Lab
Knowledge: teams/portfolio-lab/KNOWLEDGE.md
Learnings: L004 (data source), L025 (allocation calc)
Blast radius: Dashboard allocation, Client portal summary
Verify: /demo, /partners/clients/1, /c/DEMO-JS123
```

---

*The right specialist with the right knowledge = better output, faster.*
