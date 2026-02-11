# Cross-Pollination Protocol

*How teams share knowledge and coordinate. The "Mail Agent" mechanism.*

---

## What Cross-Pollination Means

When one team learns something useful to another team, that knowledge should flow automatically.

**Example:** Tax Intelligence discovers a new wash sale edge case → Portfolio Lab needs to know (affects rebalancing suggestions).

---

## Mechanisms

### 1. Shared Learning Tags

When adding to LEARNINGS-v2.md, tag relevant teams:

```markdown
### L045: Wash sales apply across ALL accounts including IRAs
**Tags:** [tax] [portfolio] [integration]
**Confidence:** high
**Evidence:** production-bug

Tax-loss harvesting must check spouse accounts, IRAs, and 401ks.
Relevant to: Tax Intelligence (primary), Portfolio Lab (rebalancing),
Integration (cross-account data)
```

Teams check their tags during spawn context loading.

### 2. Team KNOWLEDGE.md Updates

When a discovery affects another team:

```
1. Fix the issue in your team
2. Open the affected team's KNOWLEDGE.md
3. Add to their "Common Issues & Fixes" section
4. Add cross-reference: "See also: [your team] KNOWLEDGE.md"
```

### 3. Integration Points Section

Every team KNOWLEDGE.md has an "Integration Points" table:

```markdown
## Integration Points

| Integrates With | How | What to Watch |
|-----------------|-----|---------------|
| Dashboard | Allocation summary | Must match exactly |
| Tax Intelligence | Gain/loss display | Use same cost basis |
```

When you change something, check who integrates with you.

### 4. Blast Radius Alerts

When a change has blast radius:

```
1. Identify affected teams
2. Note in commit message: "Affects: [team1], [team2]"
3. Add to PANTHEON-STATUS.md: "Cross-team impact: [description]"
```

---

## Cross-Pollination Triggers

| When This Happens... | Notify These Teams |
|----------------------|-------------------|
| Data source changes | Integration, all consumers |
| API contract changes | All teams using that API |
| New calculation pattern | Teams with similar calculations |
| Bug found in shared logic | All teams using that logic |
| UX pattern discovered | All teams with similar UX |
| Compliance requirement found | All client-facing teams |

---

## Coordination Patterns

### Pattern A: Async Knowledge Sharing

```
Team A discovers insight
    ↓
Team A adds to LEARNINGS-v2.md with tags
    ↓
Team A updates relevant team KNOWLEDGE.md files
    ↓
Future spawns pick up the knowledge automatically
```

**Best for:** Non-urgent discoveries, patterns, best practices

### Pattern B: Active Coordination (Same Sprint)

```
Task requires Team A + Team B

1. Eli routes to Team A (primary)
2. Team A spawn includes: "Coordinate with Team B on [specific thing]"
3. Team A agent reads Team B's KNOWLEDGE.md
4. Team A produces output that respects Team B's constraints
5. If conflict → Escalate per CONFLICT-RESOLUTION.md
```

**Best for:** Multi-domain tasks, complex features

### Pattern C: Review Request

```
Team A completes work that affects Team B

1. Team A adds to PANTHEON-STATUS.md: "Review needed: [Team B]"
2. Next Team B spawn sees the review request
3. Team B validates the change from their perspective
4. Team B clears the review or raises concerns
```

**Best for:** Significant changes, architectural decisions

---

## What the "Mail Agent" Role Actually Does

In the team structure diagram, "Mail" represents:

1. **Reading cross-team tags** in LEARNINGS-v2.md
2. **Updating other teams' KNOWLEDGE.md** when discoveries affect them
3. **Checking Integration Points** before completing work
4. **Noting blast radius** in commits and status

It's not a separate agent — it's a responsibility within each team to think beyond their boundaries.

---

## Anti-Patterns

❌ **Silo thinking** — "Not my team's problem"
❌ **Duplicate discovery** — Team B rediscovers what Team A already learned
❌ **Breaking integrations** — Changing something without notifying consumers
❌ **Knowledge hoarding** — Keeping insights in team-only context

---

## Checklist for Cross-Team Work

```
□ Did I check if other teams have relevant knowledge?
□ Did I tag my learning with all relevant teams?
□ Did I update affected team KNOWLEDGE.md files?
□ Did I check Integration Points before changing shared logic?
□ Did I note blast radius in my commit?
```

---

*Knowledge that doesn't flow is knowledge that's lost. Pollinate actively.*
