# Learning Entry Format (v2.0)

*All new entries in LEARNINGS.md and PATTERNS.md must follow this format.*

---

## Required Fields

```markdown
### L[XXX] — [Category Tags]

**Task:** [One-line description of what triggered this learning]

**Insight:** [The actual learning — what should future agents know?]

**Confidence:** [low | medium | high]

**Evidence Source:** 
- [ ] production-bug — Discovered from a real bug in production
- [ ] user-feedback — Sam or user explicitly said something
- [ ] simulation — Tested/simulated before shipping
- [ ] research — From external research/documentation
- [ ] inference — Logical conclusion, not directly tested

**Review By:** [YYYY-MM-DD or "evergreen" if no expiration]

**Added:** [YYYY-MM-DD]
**Added By:** [agent-name or "eli"]
```

---

## Confidence Levels

| Level | Meaning | When to Use |
|-------|---------|-------------|
| **high** | Proven multiple times, very unlikely to be wrong | Production bugs fixed, patterns that worked 3+ times |
| **medium** | Reasonable confidence, some evidence | Worked once or twice, makes logical sense |
| **low** | Hypothesis or early observation | First time seeing this, needs more validation |

---

## Evidence Sources

| Source | Weight | Notes |
|--------|--------|-------|
| **production-bug** | Highest | We shipped it, it broke, we learned |
| **user-feedback** | High | Direct signal from the user |
| **simulation** | Medium | Tested but not in production |
| **research** | Medium | External sources, may not apply to us |
| **inference** | Low | Logical but unproven |

---

## Review Dates

- **Financial data** (CMAs, tax rates, etc.): Review every 6 months
- **API patterns** (external services): Review every 3 months
- **UX patterns**: Review annually or "evergreen"
- **Code patterns**: Usually "evergreen" unless framework changes

---

## Example Entry

```markdown
### L026 — Domain, Product

**Task:** Incorporate forward-looking CMAs into portfolio analysis

**Insight:** Don't just look in the rearview mirror. Historical returns make diversification look wrong (US 13% vs Int'l 5%). Forward-looking CMAs flip this (US 5.5% vs Int'l 7.5%). Always show BOTH historical AND expected returns, with explanation of why they differ.

**Confidence:** high

**Evidence Source:** 
- [x] research — Vanguard, JP Morgan, BlackRock, Capital Group CMAs
- [x] user-feedback — Sam explicitly requested this

**Review By:** 2026-08-09 (6 months — CMAs update annually)

**Added:** 2026-02-09
**Added By:** cma-research
```

---

## Why This Matters

Without metadata:
- Old learnings calcify into "truth"
- Wrong assumptions become permanent
- No way to know what needs review

With metadata:
- Skeptic Agent can flag low-confidence items
- Expiring items get reviewed
- Evidence quality is visible
- Knowledge stays adaptive

---

## Migration

Existing learnings without metadata are assumed:
- Confidence: medium
- Evidence: inference
- Review: evergreen

The Weekly Learning Review should gradually add metadata to important entries.
