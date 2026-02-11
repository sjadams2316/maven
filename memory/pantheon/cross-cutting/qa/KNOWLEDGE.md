# QA Team — Knowledge Base

*Browser verification, edge cases, adversarial testing, execution protocol*

---

## Mission

**The only metric that matters: Bugs Sam catches that we should have caught. Target: ZERO.**

---

## Core Protocol

### Before ANY Work is "Done"

```
┌─────────────────────────────────────────────────────────────────┐
│  □ Browser opened (profile=openclaw, no human intervention)    │
│  □ Actual URL loaded (not localhost)                           │
│  □ User flow clicked through (not just page load)              │
│  □ Data verified (matches expected values)                     │
│  □ Interactive elements tested (buttons, forms)                │
│  □ Mobile viewport checked (375px)                             │
│  □ Console checked (no errors)                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Forbidden Evidence

❌ "Build passes"
❌ "Agent reported success"
❌ "Code looks correct"
❌ "Should work"
❌ "Tests pass" (without browser verification)

### Required Evidence

✅ "I opened https://mavenwealth.ai/[route]"
✅ "I clicked [element] and verified [behavior]"
✅ "Screenshot shows [expected state]"
✅ "Console has no errors"

---

## Heartbeat QA Rotation

| Day | Test Flow | URL |
|-----|-----------|-----|
| Mon | Demo → Portfolio Lab → verify data | /demo, /portfolio-lab |
| Tue | Partners → Client → Oracle → unique question | /partners/dashboard?demo=true |
| Wed | Partners → Stress Test → run scenario | /partners/clients/1/stress-test |
| Thu | Client portal → all sections | /c/DEMO-JS123 |
| Fri | Demo → Tax Harvesting | /demo (TLH tab) |
| Sat | Demo → What-If → trade | /demo (What-If) |
| Sun | Full nav audit | All routes |

---

## Browser Testing Commands

```typescript
// Start browser (autonomous profile)
browser({ action: 'start', profile: 'openclaw' })

// Open URL
browser({ action: 'open', targetUrl: 'https://mavenwealth.ai/demo', profile: 'openclaw' })

// Snapshot (get element refs)
browser({ action: 'snapshot', targetId: '...', profile: 'openclaw' })

// Click element
browser({ action: 'act', targetId: '...', profile: 'openclaw', request: { kind: 'click', ref: 'e123' } })

// Type text
browser({ action: 'act', targetId: '...', profile: 'openclaw', request: { kind: 'type', ref: 'e456', text: 'test', submit: true } })
```

---

## Test Types

### Tier 1: Smoke Tests (Every Deploy)
- Page loads (200 status)
- No console errors
- Key elements visible

### Tier 2: Functional Tests (Daily)
- Data displays correctly
- Calculations are accurate
- Forms submit properly

### Tier 3: Flow Tests (Weekly)
- Complete user journeys
- Multi-page flows
- Edge cases

### Tier 4: Adversarial Tests (Monthly)
- Invalid inputs
- Network failures
- Race conditions

---

## Common Bugs to Check

| Bug Type | How to Catch |
|----------|--------------|
| Hardcoded data | Ask unique question, verify contextual response |
| Hydration mismatch | Check console for hydration warnings |
| Missing fallbacks | Disable network, check graceful degradation |
| Mobile layout | Test 375px viewport |
| Broken links | Click all navigation |
| Stale cache | Hard refresh (Cmd+Shift+R) |

---

## Bug Post-Mortem Protocol

When a bug is found (especially by Sam):

1. **What check would have caught this?**
2. **Add that check to rotation**
3. **Blast radius: Where else might this exist?**
4. **Update LEARNINGS-v2.md**
5. **Never make this category of mistake again**

---

## Red Team Exercises

Periodically try to break things:

### Edge Case Hunting
- Empty portfolios
- Single holding
- 100+ holdings
- Negative values
- Zero values
- Very large numbers

### UX Attacking
- Confused user simulation
- Rapid clicking
- Back button abuse
- Tab switching

### Security Probing
- URL manipulation
- Unauthorized access attempts
- Input injection

---

## Demo Mode URLs

```
Partners (no auth):    https://mavenwealth.ai/partners/dashboard?demo=true
Client Portal:         https://mavenwealth.ai/c/DEMO-JS123
Main Demo:             https://mavenwealth.ai/demo
```

These bypass auth for autonomous testing.

---

## Learnings Applied

- **L007:** Always have fallback data
- **L015:** Test mobile viewports
- **L018:** Check console for errors
- **L021:** Verify after deploy, not just build
- **L022:** Unique questions catch hardcoded data

---

*We are the last line of defense. Nothing ships without verification.*
