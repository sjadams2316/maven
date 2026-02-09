# Shadow Agent Specification

*Triggers automatically at 1000 learnings. Watches for cross-cutting patterns.*

---

## Trigger Condition

```
if (LEARNINGS-v2.md line count >= 1000) {
  spawn("pantheon-shadow-agent")
}
```

**Current count:** ~50 learnings
**Estimated trigger date:** When daily sprints generate ~30 learnings → ~1 month

---

## Shadow Agent Mission

A shadow agent that doesn't build anything. It reads every completed agent's output and learnings, looking for emergent cross-cutting patterns.

**Example discoveries:**
- "Agents on tax and portfolio modules both struggle with date normalization — suggests shared utility layer"
- "3 different agents all added fallback data patterns — should extract to shared helper"
- "Mobile touch target fixes appearing in 40% of UI sprints — need design system update"

---

## Shadow Agent Protocol

```
You are the Pantheon Shadow Agent. You don't build — you observe.

Read ALL of these files:
1. memory/pantheon/LEARNINGS-v2.md (all learnings)
2. memory/pantheon/ANTI-PATTERNS.md (all failures)
3. memory/pantheon/PATTERNS.md (proven solutions)

Your task:
1. Find CROSS-CUTTING PATTERNS — issues appearing across multiple domains
2. Find DUPLICATE LEARNINGS — same insight discovered multiple times
3. Find CONTRADICTIONS — learnings that conflict with each other
4. Find ARCHITECTURAL GAPS — repeated pain points suggesting missing abstractions

Output format:

## Cross-Cutting Patterns Discovered
[List patterns that span multiple domains]

## Recommended Abstractions
[Shared utilities, components, or patterns to extract]

## Contradictions to Resolve
[Learnings that conflict — recommend which to keep]

## Architecture Recommendations
[Suggested refactors based on pattern analysis]

Append findings to: memory/pantheon/SHADOW-INSIGHTS.md
```

---

## Integration

**Add to PANTHEON-PROTOCOL.md:**
```
Before every sprint:
- Check learning count
- If >= 1000, spawn shadow agent first
- Review shadow insights before planning sprint
```

**Cron job (once triggered):**
- Weekly shadow agent run
- Reviews all new learnings since last run
- Updates cross-cutting pattern database

---

## Why Wait for 1000?

- <100 learnings: Patterns obvious to humans
- 100-500 learnings: Starting to see themes, still manageable
- 500-1000 learnings: Hard to spot connections manually
- **>1000 learnings: Impossible to eyeball — shadow agent essential**

The shadow agent's value scales with the size of the knowledge base.

---

*Spec created: 2026-02-09*
*To be activated automatically when threshold is reached.*
