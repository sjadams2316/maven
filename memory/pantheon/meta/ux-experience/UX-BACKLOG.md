# UX Issues Backlog

*Prioritized list of UX issues across Maven, discovered through persona-based audits.*

**Last Updated:** 2026-02-09
**Total Issues:** 11
**Open:** 11 | **In Progress:** 0 | **Resolved:** 0

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

### DASH-HNW-001: Missing Concentration Warning

| Field | Value |
|-------|-------|
| **Page** | Dashboard |
| **Found By** | HNW User (Taylor), Power User (Morgan) |
| **Element** | Insights section |
| **Problem** | 85% portfolio concentration in TAO receives NO warning. Minor issues (8% drift, $1K tax savings) highlighted instead. |
| **Impact** | Users unaware of catastrophic risk. Potential fiduciary/advisory liability. |
| **Fix** | Add concentration detection: any position >25% triggers P0 insight with diversification CTA |
| **Effort** | Medium |
| **Owner** | Unassigned |
| **Status** | 🔴 Open |

---

## P1 - High (Fix This Sprint)

### DASH-ALL-002: Portfolio Allocation Shows Target, Not Actual

| Field | Value |
|-------|-------|
| **Page** | Dashboard |
| **Found By** | Power User (Morgan), All personas |
| **Element** | Portfolio Allocation widget |
| **Problem** | Shows "US 45%, Crypto 20%" but actual holdings are "TAO 85%". Widget displays target allocation, not reality. |
| **Impact** | Users deceived about actual risk exposure. Trust undermined if noticed. |
| **Fix** | 1) Show ACTUAL allocation 2) Add toggle for Current vs Target 3) Clear labels |
| **Effort** | Medium |
| **Owner** | Unassigned |
| **Status** | 🔴 Open |

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

### DASH-PWR-004: Retirement Goal Math Incorrect

| Field | Value |
|-------|-------|
| **Page** | Dashboard |
| **Found By** | Power User (Morgan) |
| **Element** | Insights - Milestone |
| **Problem** | Shows "$1.2M of $3M retirement goal" but net worth is only $797K. Where's extra $400K? |
| **Impact** | Data integrity questioned. Could lead to poor planning decisions. |
| **Fix** | Ensure goal calculation matches visible assets OR explain what's included |
| **Effort** | Low |
| **Owner** | Unassigned |
| **Status** | 🔴 Open |

---

## P2 - Medium (Fix Next Sprint)

### DASH-PWR-005: VWO Missing from Top Holdings

| Field | Value |
|-------|-------|
| **Page** | Dashboard |
| **Found By** | Power User (Morgan) |
| **Element** | Top Holdings |
| **Problem** | Tax insight mentions VWO with $4,200 loss, but VWO not visible in holdings list |
| **Impact** | User can't see asset they're advised about. Insight loses credibility. |
| **Fix** | 1) Show all holdings OR 2) Add "Show all" link OR 3) Link to VWO from insight |
| **Effort** | Low |
| **Owner** | Unassigned |
| **Status** | 🔴 Open |

---

### DASH-NEW-006: Tax Harvest Jargon Unexplained

| Field | Value |
|-------|-------|
| **Page** | Dashboard |
| **Found By** | New User (Alex), Retiree (Pat) |
| **Element** | Insights - Tax Opportunity |
| **Problem** | "Tax-loss harvest opportunity" assumes financial literacy. No explanation provided. |
| **Impact** | Less sophisticated users confused. Feature value lost. |
| **Fix** | 1) Add info tooltip 2) "Learn more" link 3) A/B test simpler copy |
| **Effort** | Low |
| **Owner** | Unassigned |
| **Status** | 🔴 Open |

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

| Page | P0 | P1 | P2 | P3 | Total |
|------|----|----|----|----|-------|
| Dashboard | 1 | 3 | 4 | 3 | 11 |
| Portfolio Lab | - | - | - | - | 0 |
| Tax Harvesting | - | - | - | - | 0 |
| Goals | - | - | - | - | 0 |
| Other | - | - | - | - | 0 |

---

## Quick Wins (High Impact, Low Effort)

These can be done quickly and improve UX significantly:

1. ✅ **Add concentration warning** - Simple threshold check, huge safety win
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
