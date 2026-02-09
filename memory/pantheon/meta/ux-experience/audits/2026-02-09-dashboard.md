# Dashboard UX Audit Report

**Date:** 2026-02-09
**Auditor:** UX Experience Agent (Subagent)
**URL:** https://mavenwealth.ai/demo
**Environment:** Demo Mode with sample $800K portfolio

---

## Audit Summary

```yaml
overall_friction_score: 3.2/5
personas_tested: [new_user, basic_user, power_user, retiree, tech_exec]
critical_issues: 1
high_issues: 3
medium_issues: 4
low_issues: 3
```

**Verdict:** The dashboard has a clean visual design and good mobile responsiveness, but contains **critical data integrity issues** that could mislead users about their actual risk exposure. The most dangerous position (85% in a single crypto token) receives NO warning while minor issues get highlighted.

---

## Critical Finding: Missing Concentration Warning

### The Numbers Don't Lie

| Holding | Value | % of Portfolio |
|---------|-------|----------------|
| TAO | $684,000 | **85.8%** |
| VTI | $185,000 | 23.2% |
| CIFR | $78,000 | 9.8% |
| IREN | $52,000 | 6.5% |
| BND | $48,000 | 6.0% |

**85.8% of this portfolio is in a single cryptocurrency token.**

The Insights section shows:
- ✅ Tax-loss harvest opportunity (save $1,050)
- ✅ Portfolio drift detected (8% from target)
- ✅ Milestone celebration (retirement 40% funded)
- ❌ **NO concentration warning for 85% single-asset exposure**

This is like telling someone their house is slightly dusty while it's actively on fire.

---

## Per-Persona Audit Results

### Persona 1: New User (Alex Starting)

**Friction Score: 3/5**

| Aspect | Assessment |
|--------|------------|
| First Impression | Good - clean design, clear value prop |
| Clarity | Moderate - some jargon ("tax-loss harvest") unexplained |
| Next Step | Clear - "Use My Real Data" CTA prominent |
| Emotional | Positive but potentially intimidating |

**What Works:**
- Demo mode banner clearly explains what they're seeing
- "This is a demo with sample data" sets expectations
- "Use My Real Data →" CTA is prominent
- Explore Maven section gives clear feature overview

**Friction Points:**
- "Tax-loss harvest" assumes financial literacy
- No explanation of what Maven actually does (just shows data)
- Numbers are impressive but what should they DO?

**Missing:**
- Onboarding tutorial or guided tour option
- Glossary for financial terms
- "Why this matters to you" context

---

### Persona 2: Basic User (Jordan Starter)

**Friction Score: 2.5/5**

| Aspect | Assessment |
|--------|------------|
| Relevance | Moderate - demo shows $800K portfolio, they have $50K |
| Overwhelm | Low - interface is clean |
| Appropriate Features | Good - core features visible |
| Encouragement | Mixed - big numbers might discourage |

**What Works:**
- Clean card layout is approachable
- Quick Actions are clearly labeled
- Goals section shows progress visually
- Mobile view works well

**Friction Points:**
- Demo profile is very different from their situation
- Can't easily imagine how THEIR $50K portfolio would look
- Insights seem advanced (tax harvesting at $50K?)

**Missing:**
- Beginner-appropriate demo option
- "Getting started" checklist
- Context-appropriate insights for smaller portfolios

---

### Persona 3: Power User (Morgan Maven)

**Friction Score: 3/5**

| Aspect | Assessment |
|--------|------------|
| Data Completeness | Poor - major discrepancies |
| Advanced Features | Moderate - links to Portfolio Lab |
| Performance | Good |
| Cross-Account View | Not visible |

**What Works:**
- Performance is snappy
- Links to deeper tools (Portfolio Lab)
- Multiple time period options for net worth

**Critical Issues Found:**
1. **Portfolio Allocation is WRONG** - Shows 20% crypto but actual is 85%+
2. **Top Holdings only shows 5** - Where's VWO mentioned in insights?
3. **No account breakdown** - Can't see which account holds what
4. **Net worth chart** - Bars are nearly identical, hard to see trends

**Missing:**
- "Show all holdings" option
- Account-level breakdown
- Custom dashboard widgets
- Actual allocation based on holdings (not a fake target)

---

### Persona 4: HNW User (Taylor Techstock)

**Friction Score: 3.5/5**

| Aspect | Assessment |
|--------|------------|
| Concentration Handling | **FAIL** - 85% concentration not flagged |
| Sophistication | Moderate |
| Tax Optimization | Good - tax harvest shown |
| Premium Feel | Good - clean design |

**Critical Issues:**
1. **85% single-asset concentration gets NO warning**
2. Tax insight saves $1,050 but concentration risk could lose $600K+
3. No 10b5-1 or diversification strategy suggestions

**What Works:**
- Tax-loss harvesting insight is relevant
- Markets section shows TAO price (though they'd want more)

**Missing:**
- Concentration risk alert (P0 priority!)
- Diversification roadmap
- What-if scenarios for position reduction
- Comparison to prudent allocation

---

### Persona 5: Retiree (Pat Pension)

**Friction Score: 4/5**

| Aspect | Assessment |
|--------|------------|
| Reassurance | Poor - crypto-heavy portfolio is scary |
| Relevance | Poor - demo doesn't match retiree needs |
| Accessibility | Good - readable text, clear layout |
| Income Focus | Missing |

**Issues:**
- Demo shows 85% crypto which would terrify a retiree
- No income/dividend focus visible
- No Social Security integration shown
- No RMD considerations

**What Works:**
- Text is readable
- Layout is clean and not overwhelming
- Goals section is reassuring

**Missing:**
- Income projection
- Withdrawal rate calculator
- More conservative demo option
- Larger touch targets would help (current is OK)

---

### Persona 6: Tech Executive (Sam TechExec)

**Friction Score: 3/5**

| Aspect | Assessment |
|--------|------------|
| Equity Comp Features | Not visible on dashboard |
| Efficiency | Good - information dense |
| Sophistication | Moderate |
| Time to Value | Good - key info at glance |

**What Works:**
- Quick Actions enable fast navigation
- Tax harvesting insight is relevant to this persona
- Clean design respects their time

**Missing:**
- RSU/ISO vesting schedule visibility
- Equity comp specific insights
- Blackout period awareness
- AMT exposure calculation

---

## Issue Log

### P0 - Critical

```yaml
issue_id: DASH-HNW-001
severity: P0
persona: HNW User, Power User, All
element: Insights section
problem: |
  85% concentration in a single crypto token (TAO) generates NO warning.
  Meanwhile, minor issues like 8% drift and $1K tax savings are highlighted.
  This prioritization is backwards and potentially harmful.
impact: |
  Users could lose 85% of their wealth if TAO drops significantly.
  The dashboard is actively downplaying their biggest risk.
  Fiduciary/advisory liability concern.
suggested_fix: |
  1. Add concentration detection: any single position >25% = warning
  2. Make concentration warnings P0 priority in Insights
  3. Add diversification CTA with specific suggestions
  4. Consider making this the FIRST insight if triggered
```

---

### P1 - High

```yaml
issue_id: DASH-ALL-002
severity: P1
persona: Power User, All
element: Portfolio Allocation widget
problem: |
  Widget shows: US 45%, Int'l 15%, Bonds 20%, Crypto 20%
  Actual holdings: TAO $684K (crypto), VTI $185K (US), etc.
  The widget is displaying TARGET allocation, not ACTUAL allocation.
  This is actively misleading about current risk exposure.
impact: |
  Users believe they have a balanced portfolio when they don't.
  Undermines trust if they notice the discrepancy.
suggested_fix: |
  1. Show ACTUAL allocation by default
  2. Add toggle for "Current vs Target" view
  3. Clearly label when showing target
  4. Show drift from target inline
```

```yaml
issue_id: DASH-ALL-003
severity: P1
persona: Power User, New User
element: Markets widget
problem: |
  SPY, QQQ, DIA, IWM all show "—" instead of prices.
  Only BTC and TAO show actual values.
  Major market indices appear broken.
impact: |
  Dashboard looks broken/unprofessional.
  Users can't see market context for their portfolio.
  Undermines trust in the platform.
suggested_fix: |
  1. Debug why stock market data isn't loading
  2. Show loading state instead of "—"
  3. If data unavailable, hide widget or show message
  4. Consider fallback data source
```

```yaml
issue_id: DASH-PWR-004
severity: P1
persona: Power User
element: Insights - Retirement Goal
problem: |
  Shows "You've reached $1.2M of your $3M retirement goal"
  But total net worth is only $797,500.
  Math doesn't add up. Where's the extra $400K?
impact: |
  Users confused about their actual retirement status.
  Data integrity questioned.
  Could lead to poor planning decisions.
suggested_fix: |
  1. Ensure retirement goal calculation matches visible assets
  2. If including non-tracked assets, explain this
  3. Show breakdown of what's included in goal progress
```

---

### P2 - Medium

```yaml
issue_id: DASH-PWR-005
severity: P2
persona: Power User
element: Top Holdings
problem: |
  Tax insight mentions VWO with $4,200 unrealized loss.
  But VWO is not visible in Top Holdings list.
  User can't see the asset they're being advised about.
impact: |
  Insight loses credibility.
  User has to navigate away to find VWO.
suggested_fix: |
  1. Show all holdings, or at least those mentioned in insights
  2. Add "Show all holdings" link
  3. Link directly to VWO from the insight
```

```yaml
issue_id: DASH-NEW-006
severity: P2
persona: New User, Retiree
element: Insights - Tax Harvest
problem: |
  "Tax-loss harvest opportunity" assumes user knows what this means.
  No explanation of the concept or why it matters.
impact: |
  Less sophisticated users confused.
  Potential value of feature lost.
suggested_fix: |
  1. Add info icon with tooltip explaining concept
  2. Consider "Learn more" link to educational content
  3. A/B test simpler language: "Save $1,050 on taxes by..."
```

```yaml
issue_id: DASH-ALL-007
severity: P2
persona: All
element: Net Worth Chart
problem: |
  Chart bars are nearly identical height.
  No axis labels visible.
  Hard to understand the trend or magnitude.
impact: |
  Visual provides little information.
  Users can't gauge performance trajectory.
suggested_fix: |
  1. Add Y-axis labels
  2. Auto-scale to show meaningful variation
  3. Add hover state with exact values
  4. Consider line chart alternative for trends
```

```yaml
issue_id: DASH-RET-008
severity: P2
persona: Retiree
element: Overall Dashboard
problem: |
  Demo shows 85% crypto portfolio which is inappropriate for retirees.
  No income focus, dividend visibility, or drawdown planning.
  Dashboard doesn't address retiree-specific concerns.
impact: |
  Retirees may feel Maven isn't for them.
  Could drive away a valuable user segment.
suggested_fix: |
  1. Add retiree-focused demo option
  2. Add income/yield visibility to dashboard
  3. Consider persona-specific dashboard variants
```

---

### P3 - Low

```yaml
issue_id: DASH-NEW-009
severity: P3
persona: New User
element: Welcome message
problem: |
  "Welcome to Maven 👋" is generic.
  Doesn't explain what Maven does or why it's valuable.
impact: |
  Missed opportunity to hook new users.
suggested_fix: |
  Add subheading: "Your AI-powered wealth partner. Let's grow together."
```

```yaml
issue_id: DASH-ALL-010
severity: P3
persona: All
element: Quick Actions
problem: |
  "+2 more" button hides additional actions.
  Most users won't click to discover them.
impact: |
  Reduced feature discovery.
suggested_fix: |
  Show all actions on desktop; collapse on mobile only.
```

```yaml
issue_id: DASH-ALL-011
severity: P3
persona: All
element: Goals Progress
problem: |
  Progress bars don't show absolute numbers.
  27% of what? Users have to navigate away.
impact: |
  Less informative at a glance.
suggested_fix: |
  Add "$X of $Y" below percentage.
```

---

## Mobile Assessment

**Verdict: Good** ✅

Mobile responsive design works well:
- Cards stack properly
- Text remains readable
- Touch targets are adequate
- Scrolling is smooth
- No horizontal overflow issues

Minor improvements:
- Period selector buttons slightly cramped
- "Show breakdown" might benefit from icon
- Quick Actions grid could use more padding

---

## Quick Wins (High Impact, Low Effort)

1. **Add concentration warning logic** - If any position >25%, show P0 insight
2. **Fix Markets data** - Debug why stock indices show "—"
3. **Link VWO from insight** - Let users click to see the holding
4. **Add tooltip for "tax-loss harvest"** - Help new users understand
5. **Show "Current" label on allocation** - Clarify it's actual vs target

---

## Recommended Priority Order

1. **P0: Concentration warning** - This is a safety/liability issue
2. **P1: Fix Portfolio Allocation** - Show actual, not target
3. **P1: Fix Markets data** - Broken data looks unprofessional
4. **P1: Reconcile goal math** - Data integrity matters
5. **P2: VWO visibility** - Support insights with data
6. **P2: Explain tax harvest** - Accessibility for all users
7. **P2: Improve net worth chart** - Add meaningful visualization
8. **P3: Polish items** - Welcome message, quick actions, goals

---

## Conclusion

The Maven dashboard has a **strong visual foundation** - clean design, good mobile responsiveness, and sensible information architecture. However, it has **critical data integrity issues** that undermine trust and could lead to poor financial decisions.

The most urgent fix is the missing concentration warning. A user with 85% in a single volatile asset is at extreme risk, and the dashboard's silence on this is a potential liability issue.

Secondary priority should be ensuring the Portfolio Allocation widget shows reality, not fantasy. Users deserve to know their actual risk exposure.

Once these core issues are resolved, the dashboard could become an excellent first impression for Maven.

---

*Audit completed 2026-02-09 by UX Experience Agent*
*Next audit recommended: After fixes are deployed*
