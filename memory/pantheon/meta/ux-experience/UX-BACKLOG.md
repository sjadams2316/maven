# UX Issues Backlog

*Prioritized list of UX issues across Maven, discovered through persona-based audits.*

**Last Updated:** 2026-02-09
**Total Issues:** 11
**Open:** 6 | **In Progress:** 0 | **Resolved:** 5

---

## Priority Legend

| Priority | Meaning | SLA |
|----------|---------|-----|
| **P0** | Critical - Blocks users, safety/liability risk, data integrity | Fix immediately |
| **P1** | High - Major usability issue, affects many users | Fix this sprint |
| **P2** | Medium - Noticeable friction, workarounds exist | Fix next sprint |
| **P3** | Low - Polish, nice-to-have | Backlog |

---

## P0 - Critical (Fix Immediately)

### DASH-HNW-001: Missing Concentration Warning ✅ RESOLVED

| Field | Value |
|-------|-------|
| **Page** | Dashboard |
| **Found By** | HNW User (Taylor), Power User (Morgan) |
| **Element** | Insights section |
| **Problem** | 85% portfolio concentration in TAO receives NO warning. Minor issues (8% drift, $1K tax savings) highlighted instead. |
| **Impact** | Users unaware of catastrophic risk. Potential fiduciary/advisory liability. |
| **Fix** | Add concentration detection: any position >25% triggers P0 insight with diversification CTA |
| **Effort** | Medium |
| **Owner** | Risk Analysis Agent |
| **Status** | ✅ Resolved |
| **Resolution** | Created `ConcentrationWarning.tsx` component with critical P0 red styling. Triggers when ANY single position >25% of portfolio. Shows above all other insights with pulsing alert, severity levels (HIGH/CRITICAL/EXTREME), specific position list, risk explanation with dollar impact, and CTA to Portfolio Lab. Integrated into dashboard page. |
| **Resolved Date** | 2026-02-09 |

---

## P1 - High (Fix This Sprint)

### DASH-ALL-002: Portfolio Allocation Shows Target, Not Actual ✅ RESOLVED

| Field | Value |
|-------|-------|
| **Page** | Dashboard |
| **Found By** | Power User (Morgan), All personas |
| **Element** | Portfolio Allocation widget |
| **Problem** | Shows "US 45%, Crypto 20%" but actual holdings are "TAO 85%". Widget displays target allocation, not reality. |
| **Impact** | Users deceived about actual risk exposure. Trust undermined if noticed. |
| **Fix** | 1) Show ACTUAL allocation 2) Add toggle for Current vs Target 3) Clear labels |
| **Effort** | Medium |
| **Owner** | Data Integrity Agent |
| **Status** | ✅ Resolved |
| **Resolution** | Updated `/demo/page.tsx` to calculate actual allocation from holdings using `classifyTicker()` from portfolio-utils. Added Current/Target toggle buttons defaulting to Current. Added clear labels explaining what's shown ("Based on your actual holdings" vs "Your target allocation goal"). Added concentration warning when crypto >50%. Shows drift comparison vs target. Hover tooltip on "Other" shows crypto/REIT breakdown. |
| **Resolved Date** | 2026-02-09 |

---

### DASH-ALL-003: Markets Widget Shows Broken Data

| Field | Value |
|-------|-------|
| **Page** | Dashboard |
| **Found By** | New User (Alex), Power User (Morgan) |
| **Element** | Markets widget |
| **Problem** | SPY, QQQ, DIA, IWM show "—" instead of prices. Only crypto data loads. |
| **Impact** | Looks unprofessional/broken. Users can't see market context. |
| **Fix** | 1) Debug stock data feed 2) Show loading state 3) Add fallback source |
| **Effort** | Medium |
| **Owner** | Unassigned |
| **Status** | 🔴 Open |

---

### DASH-PWR-004: Retirement Goal Math Incorrect ✅ RESOLVED

| Field | Value |
|-------|-------|
| **Page** | Dashboard |
| **Found By** | Power User (Morgan) |
| **Element** | Insights - Milestone |
| **Problem** | Shows "$1.2M of $3M retirement goal" but net worth is only $797K. Where's extra $400K? |
| **Impact** | Data integrity questioned. Could lead to poor planning decisions. |
| **Fix** | Ensure goal calculation matches visible assets OR explain what's included |
| **Effort** | Low |
| **Owner** | Data Integrity Agent |
| **Status** | ✅ Resolved |
| **Resolution** | Fixed hardcoded incorrect value in DEMO_INSIGHTS. Created centralized constants (RETIREMENT_CURRENT, RETIREMENT_TARGET, RETIREMENT_PROGRESS) that match net worth ($797.5K). Insight now correctly shows "27% funded" and "$797K toward your $3M goal". Goals widget updated to use same constants for consistency. |
| **Resolved Date** | 2026-02-09 |

---

## P2 - Medium (Fix Next Sprint)

### DASH-PWR-005: VWO Missing from Top Holdings ✅ RESOLVED

| Field | Value |
|-------|-------|
| **Page** | Dashboard |
| **Found By** | Power User (Morgan) |
| **Element** | Top Holdings |
| **Problem** | Tax insight mentions VWO with $4,200 loss, but VWO not visible in holdings list |
| **Impact** | User can't see asset they're advised about. Insight loses credibility. |
| **Fix** | 1) Show all holdings OR 2) Add "Show all" link OR 3) Link to VWO from insight |
| **Effort** | Low |
| **Owner** | UX Agent |
| **Status** | ✅ Resolved |
| **Resolution** | Added VWO to DEMO_HOLDINGS with -16% change and $4,200 unrealized loss. Added "View all X holdings" link header in Top Holdings section. Added expandable "+N more holdings (including VWO)" footer when holdings exceed visible 5. Users can now see/access VWO referenced in tax insight. |
| **Resolved Date** | 2026-02-09 |

---

### DASH-NEW-006: Tax Harvest Jargon Unexplained ✅ RESOLVED

| Field | Value |
|-------|-------|
| **Page** | Dashboard |
| **Found By** | New User (Alex), Retiree (Pat) |
| **Element** | Insights - Tax Opportunity |
| **Problem** | "Tax-loss harvest opportunity" assumes financial literacy. No explanation provided. |
| **Impact** | Less sophisticated users confused. Feature value lost. |
| **Fix** | 1) Add info tooltip 2) "Learn more" link 3) A/B test simpler copy |
| **Effort** | Low |
| **Owner** | UX Agent |
| **Status** | ✅ Resolved |
| **Resolution** | Added `learnMoreText` prop to InsightCard component with expandable "?" tooltip. Tax insight now includes plain-English explanation: "Tax-loss harvesting means selling an investment at a loss, then using that loss to reduce your tax bill. You can offset gains from other investments, or deduct up to $3,000 from regular income. The key: you can immediately buy a similar (but not identical) investment to stay in the market." Tooltip is dismissable and styled consistently. |
| **Resolved Date** | 2026-02-09 |

---

### DASH-ALL-007: Net Worth Chart Uninformative

| Field | Value |
|-------|-------|
| **Page** | Dashboard |
| **Found By** | All personas |
| **Element** | Net Worth chart |
| **Problem** | Bars nearly identical height. No axis labels. Hard to see trends. |
| **Impact** | Visual provides little value. Users can't gauge trajectory. |
| **Fix** | 1) Add Y-axis labels 2) Auto-scale for variation 3) Add hover values |
| **Effort** | Medium |
| **Owner** | Unassigned |
| **Status** | 🔴 Open |

---

### DASH-RET-008: No Retiree-Appropriate Demo

| Field | Value |
|-------|-------|
| **Page** | Dashboard |
| **Found By** | Retiree (Pat) |
| **Element** | Demo Mode |
| **Problem** | Demo shows 85% crypto which terrifies retirees. No income focus or conservative option. |
| **Impact** | Retirees feel Maven isn't for them. Lost user segment. |
| **Fix** | 1) Add retiree demo option 2) Income visibility 3) Persona-specific variants |
| **Effort** | High |
| **Owner** | Unassigned |
| **Status** | 🔴 Open |

---

## P3 - Low (Backlog)

### DASH-NEW-009: Generic Welcome Message

| Field | Value |
|-------|-------|
| **Page** | Dashboard |
| **Found By** | New User (Alex) |
| **Element** | Welcome heading |
| **Problem** | "Welcome to Maven 👋" doesn't explain what Maven does. |
| **Impact** | Missed opportunity to hook new users. |
| **Fix** | Add value prop subheading |
| **Effort** | Low |
| **Owner** | Unassigned |
| **Status** | 🔴 Open |

---

### DASH-ALL-010: Quick Actions Hidden Behind "+2 more"

| Field | Value |
|-------|-------|
| **Page** | Dashboard |
| **Found By** | All personas |
| **Element** | Quick Actions |
| **Problem** | Two actions hidden behind expandable. Users won't discover them. |
| **Impact** | Reduced feature discovery. |
| **Fix** | Show all actions on desktop; collapse on mobile only |
| **Effort** | Low |
| **Owner** | Unassigned |
| **Status** | 🔴 Open |

---

### DASH-ALL-011: Goals Missing Absolute Numbers

| Field | Value |
|-------|-------|
| **Page** | Dashboard |
| **Found By** | All personas |
| **Element** | Goals widget |
| **Problem** | Shows "27%" but not "of what". Users have to navigate away. |
| **Impact** | Less informative at a glance. |
| **Fix** | Add "$X of $Y" below percentage |
| **Effort** | Low |
| **Owner** | Unassigned |
| **Status** | 🔴 Open |

---

## Summary by Page

| Page | P0 | P1 | P2 | P3 | Total Open |
|------|----|----|----|----|------------|
| Dashboard | 0 ✅ | 2 | 4 | 3 | 9 |
| Portfolio Lab | - | - | - | - | 0 |
| Tax Harvesting | - | - | - | - | 0 |
| Goals | - | - | - | - | 0 |
| Other | - | - | - | - | 0 |

*Note: DASH-HNW-001 (P0) resolved 2026-02-09*

---

## Quick Wins (High Impact, Low Effort)

These can be done quickly and improve UX significantly:

1. ✅ **Add concentration warning** - ✅ DONE (2026-02-09) - ConcentrationWarning.tsx with P0 critical styling
2. ✅ **Link VWO from insight** - Easy link, supports insight with data
3. ✅ **Add tax harvest tooltip** - Small copy change, helps new users
4. ✅ **Show "Current" label on allocation** - Clarify what's being shown
5. ✅ **Add absolute numbers to goals** - "$X of $Y" is trivial to add

---

## Audit Coverage

| Area | Last Audited | Next Scheduled |
|------|--------------|----------------|
| Dashboard | 2026-02-09 | After fixes |
| Portfolio Lab | Not audited | TBD |
| Tax Harvesting | Not audited | TBD |
| Onboarding | Not audited | TBD |
| Goals | Not audited | TBD |
| Oracle | Not audited | TBD |
| Mobile App | Not audited | TBD |

---

*This backlog is maintained by the UX Experience Agent team. Update after each audit and sprint.*
