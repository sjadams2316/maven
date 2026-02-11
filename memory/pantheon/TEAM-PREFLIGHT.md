# Team Pre-Flight Checklists

*Each team lead must complete before declaring "done." Extension of QA gate.*

---

## Universal Pre-Flight (All Teams)

```
□ Code compiles (npm run build)
□ No TypeScript errors
□ Changes committed with conventional message
□ Browser verification completed (profile=openclaw)
□ Console has no errors
□ Mobile viewport tested (375px)
□ Learning captured in LEARNINGS-v2.md
```

---

## Portfolio Lab Pre-Flight

```
□ UNIVERSAL CHECKLIST COMPLETE

Data Validation:
□ Net worth matches across all displays
□ Allocation percentages sum to 100%
□ Holdings values match source data
□ Returns calculated correctly (weighted average)

UX Validation:
□ Charts render with correct data
□ Stress test shows realistic scenarios
□ Projections use reasonable assumptions (5-7% returns)
□ Factor exposure has benchmark comparison

Cross-Check:
□ Numbers match Dashboard
□ Numbers match Client Portal (if applicable)
```

---

## Tax Intelligence Pre-Flight

```
□ UNIVERSAL CHECKLIST COMPLETE

Data Validation:
□ Gains/losses calculated from correct cost basis
□ Tax brackets applied correctly (marginal vs effective)
□ Wash sale detection checks ALL accounts
□ Holding period (short vs long term) accurate

UX Validation:
□ Harvest opportunities sorted by impact
□ Swap suggestions are actually similar securities
□ Tax savings estimates use correct rates

Compliance Check:
□ Appropriate disclaimers present
□ Not providing specific tax advice (general education only)
```

---

## Oracle Pre-Flight

```
□ UNIVERSAL CHECKLIST COMPLETE

Context Validation:
□ Client data injected into system prompt
□ Holdings list accurate and current
□ Response references actual client data

Intelligence Validation:
□ Unique question test passed (contextual response)
□ No hallucinated holdings or data
□ Appropriate uncertainty when data is missing

UX Validation:
□ Streaming works (tokens appear progressively)
□ Voice input functional (if enabled)
□ Suggested prompts are relevant
```

---

## Client Portal Pre-Flight

```
□ UNIVERSAL CHECKLIST COMPLETE

Calm UX Validation:
□ NO fees displayed
□ NO rebalancing alerts
□ NO tax-loss harvesting prompts
□ NO anxiety-inducing warnings

Data Validation:
□ Net worth displays (or correctly hidden per settings)
□ Goal progress accurate
□ Performance numbers match reality

Advisor Curation:
□ Only advisor-approved insights visible
□ Preview mode shows banner
□ Tone matches client preference setting
```

---

## Dashboard Pre-Flight

```
□ UNIVERSAL CHECKLIST COMPLETE

Data Validation:
□ Net worth accurate and formatted
□ Market data showing (not "—" placeholders)
□ Holdings match canonical source

First Impression:
□ Loads fast (no blank screens)
□ Skeleton loaders match final layout
□ Above-the-fold content renders quickly

Live Data:
□ Prices update on refresh
□ Fallback data works if API fails
□ "As of" timestamp accurate
```

---

## Retirement Pre-Flight

```
□ UNIVERSAL CHECKLIST COMPLETE

Calculation Validation:
□ SS estimates use correct bend points
□ RMD uses current year's table
□ Break-even analysis math correct
□ Spousal benefits calculated properly

UX Validation:
□ All three claiming ages shown (62/67/70)
□ Comparison clear and visual
□ Assumptions stated explicitly
```

---

## Integration Pre-Flight

```
□ UNIVERSAL CHECKLIST COMPLETE

Consistency Validation:
□ Same number appears identically on all pages
□ Calculation logic extracted to shared utility
□ No duplicate calculation paths

API Contract:
□ Response format matches spec
□ Error responses follow standard structure
□ Timestamps present and accurate
```

---

## How to Use

1. Team lead reviews checklist BEFORE declaring done
2. Check every box — no exceptions
3. If any box fails → fix before completing
4. Document any blockers or exceptions

**The checklist is the gate.** Nothing passes without it.

---

*Pre-flight catches issues before they become bugs Sam finds.*
