# Pantheon Protocol v2.1

*How to run effective Pantheon sprints. Read before spawning agents.*

---

## Pre-Sprint Checklist

### 1. Review Context
- [ ] Check `PANTHEON-STATUS.md` for running agents + dependencies
- [ ] Check `PATTERNS.md` for common fixes
- [ ] Check `ANTI-PATTERNS.md` for what NOT to do
- [ ] Check `LEARNINGS-v2.md` for **tagged** insights (inject relevant domain tags only)
- [ ] Check `FEEDBACK.md` for user signals
- [ ] Review `code-patterns/` for reusable snippets
- [ ] Review relevant backlogs for prioritized tasks
- [ ] Estimate credits (rule of thumb: ~$1-3 per agent)

### 2. Context Tag Injection (NEW)
**Don't inject all learnings — inject relevant ones by domain:**

| Task Type | Inject These Tags |
|-----------|-------------------|
| UI/Components | `ui`, `ux`, `mobile`, `accessibility` |
| API Routes | `api`, `external`, `error`, `performance` |
| Data/Demo | `data`, `state` |
| Testing/QA | `testing`, `api`, `ux` |
| Mobile | `mobile`, `ui` |

**Format:** "Read learnings tagged `[tag]` from LEARNINGS-v2.md"

### 2. Task Sizing
**Ideal task:** 1-2 files, <200 lines changed, 2-5 min runtime

❌ Too big: "Rebuild the dashboard"
✅ Just right: "Fix data-health indicator showing FMP as down"

### 3. File Lock Check
Before spawning, verify no other agent is touching the same files.
Check `PANTHEON-STATUS.md` → Active Agents → Files.

---

## Agent Spawn Template

```
Task: [One-line description]

Context:
- File(s) to modify: [list specific files]
- Related patterns: [reference PATTERNS.md sections]
- Acceptance criteria: [how to verify it works]

Constraints:
- Do NOT modify: [protected files]
- Must pass: npm run build
- Must verify: [specific checks]

On completion:
1. Run build
2. Commit with conventional message
3. Push to GitHub
4. Reply with: files changed, what was done, verification status
```

---

## Mandatory Agent Instructions

**Include in EVERY agent spawn:**

```
IMPORTANT — Read before starting:
1. Read memory/pantheon/PATTERNS.md for common fixes
2. Read memory/pantheon/LEARNINGS.md for recent insights
3. Check memory/pantheon/PANTHEON-STATUS.md for file locks
4. After changes: run `npm run build` and fix any errors
5. Commit message format: type(scope): description
6. After push: verify deploy succeeded (may take 1-2 min)
7. BEFORE FINISHING: Append your learning to memory/pantheon/LEARNINGS.md
```

## Learning Requirement (MANDATORY)

**Every agent must append ONE learning before completing:**

```markdown
### [agent-name]
**Task:** [one-line description]
**Insight:** [one actionable thing future agents should know]
```

This is how Pantheon compounds. Skip this = wasted knowledge.

---

## Visual Testing Checklist (MANDATORY)

**Before marking any UI task "complete", verify:**

### Data Display
- [ ] Numbers show actual values (not 0, null, undefined, or "—")
- [ ] Percentages/changes are correct direction (positive = green/up, negative = red/down)
- [ ] Prices match reality (check against Yahoo Finance or CoinGecko)
- [ ] Charts reflect actual data (up chart when up, down chart when down)

### State Initialization
- [ ] Page looks correct on FIRST load (before any API returns)
- [ ] Fallback data exists for external API failures
- [ ] Loading states show real content structure (not generic spinners)

### Demo Mode
- [ ] No user data visible (check localStorage, cookies)
- [ ] Uses DEMO_PROFILE consistently across all pages
- [ ] Chat/history cleared on demo mode entry

### External APIs
- [ ] Works on Vercel (not just localhost)
- [ ] Has timeout (5s max)
- [ ] Has fallback data when API fails
- [ ] Errors logged but not shown to users

**Pattern for testing:**
1. Open browser devtools console
2. Hard refresh (Cmd+Shift+R)
3. Watch network tab for API calls
4. Verify displayed data matches API response
5. Compare to real-world data source (is market actually up/down?)

---

## Post-Deploy Verification

**Every agent must verify their change is live:**

```bash
# Wait for Vercel deploy (usually 30-60 seconds)
sleep 60

# Verify the route works
curl -s -o /dev/null -w "%{http_code}" https://mavenwealth.ai/[route]
# Should return 200

# For API changes, test the endpoint
curl -s "https://mavenwealth.ai/api/[endpoint]" | jq '.status // .error'
```

**Don't announce "shipped" until verified on production.**

---

## Sprint Themes

Run themed sprints for coherence:

| Theme | Focus | Example Tasks |
|-------|-------|---------------|
| **Polish** | UX fixes, copy, mobile | Button alignment, error messages |
| **Data** | APIs, accuracy, validation | Fix FMP indicator, price validation |
| **Features** | New capabilities | What-If simulator, new chart |
| **Tech Debt** | Refactor, cleanup | Extract components, fix types |
| **QA** | Testing, verification | Browser test features, find bugs |

---

## Cost Management

| Agent Type | Typical Cost | Runtime |
|------------|--------------|---------|
| Small fix | $0.50-1.00 | 1-2 min |
| Component | $1.00-2.00 | 3-5 min |
| Feature | $2.00-4.00 | 5-10 min |
| Complex | $4.00-8.00 | 10-20 min |

**Daily budget guidance:**
- Light day: $10-20 (5-10 agents)
- Heavy sprint: $30-50 (15-25 agents)
- Max sustainable: $50/day

---

## File Ownership

Some files are high-risk. Extra care required:

| File | Risk | Notes |
|------|------|-------|
| `layout.tsx` | HIGH | Breaks entire app if wrong |
| `providers/*.tsx` | HIGH | Context/state for whole app |
| `page.tsx` (any) | MEDIUM | User-facing, visible bugs |
| `api/*.ts` | MEDIUM | Can break data flow |
| `components/*.tsx` | LOW | Isolated, easy to test |
| `lib/*.ts` | LOW | Utilities, usually safe |

---

---

## Weekly Learning Review

**Every Sunday (or when LEARNINGS.md gets long):**

1. Read through all new learnings in LEARNINGS.md
2. Identify patterns that appear 2+ times
3. Promote repeated learnings to PATTERNS.md
4. Archive promoted learnings to `memory/pantheon/archive/LEARNINGS-YYYY-MM.md`
5. Keep LEARNINGS.md fresh (last 2 weeks max)

**Promotion criteria:**
- Same insight appears from 2+ different agents
- Insight prevented a bug or significantly improved quality
- Insight is generalizable (not task-specific)

---

## Knowledge Hierarchy

```
LEARNINGS.md (raw, recent)
    ↓ promote after 2+ occurrences
PATTERNS.md (proven, curated)
    ↓ domain-specific extraction  
domain/KNOWLEDGE.md (specialized)
```

---

*Update this protocol as we learn. The goal: consistent, high-quality, fast iteration.*
