# HEARTBEAT.md

## PRIMARY DIRECTIVE: Execute, Don't Document

Every heartbeat, I **actually test something**. Not grep. Not "build passes". Click through a real flow.

---

## Heartbeat QA Rotation

Pick ONE based on the day and **actually do it**:

| Day | Test Flow |
|-----|-----------|
| Mon | Demo dashboard → Portfolio Lab → verify holdings match |
| Tue | Partners → Client → Oracle → ask unique question → verify intelligent response |
| Wed | Partners → Client → Stress Test → run scenario |
| Thu | Client portal (/c/DEMO-JS123) → all sections load |
| Fri | Demo → Tax Harvesting → verify opportunities |
| Sat | Demo → What-If → run trade → verify impact |
| Sun | Full nav audit — click everything, note broken links |

### How to Test
1. `browser` tool → open the URL
2. `browser` tool → snapshot or screenshot
3. Click through the flow (act/click)
4. Verify data is real (not placeholder)
5. Verify interactions work

### Output
- If all good: `HEARTBEAT_OK — tested [flow], working`
- If issue found: Fix it, then report what I fixed
- If issue needs Sam: `HEARTBEAT_ALERT: [issue]`

---

## Quick Checks (Secondary)

Only after QA flow is done:

- [ ] GitHub status (only if deploying)
- [ ] Check for failed Vercel deploys
- [ ] Any pending agent completions to verify

## Data Health Check (MANDATORY - Every Heartbeat)

**Before anything else, check data freshness:**

```bash
curl -s https://mavenwealth.ai/api/health | jq '.status, .checks.marketData, .alerts'
```

**Action required if:**
- `status` is not "healthy" → Investigate immediately
- `marketData.status` is "stale" or "missing" → Check API providers
- `alerts` array is not empty → Address each alert

**This check exists because:** Market data has broken multiple times (L015, L016). Sam catches it before we do. That's unacceptable.

---

## Demo Mode Health Check (MANDATORY - Every Heartbeat)

**Verify demo mode returns real data (not $0 or errors):**

```bash
# Step 1: Enable demo mode cookie
curl -s -X POST https://mavenwealth.ai/api/gate -H "Content-Type: application/json" \
  -d '{"password":"BanksNavy10"}' -c demo-cookies.txt

# Step 2: Hit demo API with demo cookie
curl -s https://mavenwealth.ai/api/user/profile -b demo-cookies.txt | jq '.retirementAccounts, .investmentAccounts'

# CRITICAL: Verify holdings have values, not null/empty
```

**Action required if:**
- `/api/user/profile` returns 401/403 → Demo auth broken (CRITICAL)
- Holdings return $0 or null values → Data not loading (CRITICAL)
- Any demo route returns HTML instead of JSON → Auth gate misconfigured (CRITICAL)

**This check exists because:** Demo mode was broken for 24+ hours (Feb 12-13) while crons reported "success" despite hitting auth walls. The data consistency cron documented issues but didn't treat them as failures.

---

## Bug Post-Mortem Trigger

If Sam catches a bug → immediately ask:
1. What check would have caught this?
2. Add that check to rotation
3. Search for same pattern (blast radius)
4. Update LEARNINGS-v2.md

---

## Forbidden

- ❌ Reporting "build passes" as proof something works
- ❌ Trusting agent output without verification
- ❌ Skipping QA to save time
- ❌ `HEARTBEAT_OK` without actually testing anything

---

## The Standard

**Sam should never find a bug that a 30-second click-through would catch.**

---

*Pantheon v4.0 — Execution over documentation*
