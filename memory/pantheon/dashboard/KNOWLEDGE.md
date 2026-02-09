# Dashboard — Team Knowledge Base

*Last Updated: 2026-02-09*
*Team: Dashboard*

---

## Mission

First impression that hooks users and drives daily engagement. The dashboard is Maven's face.

---

## Current State (LOCKED 2026-02-09)

### Layout — Do Not Change Without Sam's Approval

```
┌─────────────────────────────────────────┐
│ Header                                   │
├─────────────────────────────┬───────────┤
│ Welcome, {firstName} 👋     │           │
│ Live prices as of X:XX      │           │
├─────────────────────────────┤  Quick    │
│ Net Worth Card              │  Actions  │
│ (period selector, chart)    │           │
├─────────────────────────────┤───────────┤
│ Insights for You            │  Markets  │
│ - Tax opportunity           │  (live)   │
│ - Rebalancing               │           │
│ - Milestones                │───────────┤
├─────────────────────────────┤  Goals    │
│ Portfolio Allocation        │  Progress │
│ (visual bar, percentages)   │           │
├─────────────────────────────┤───────────┤
│ Top Holdings                │  Oracle   │
│ (gain/loss %, expandable)   │  CTA      │
├─────────────────────────────┴───────────┤
│ Explore Maven (feature cards)            │
└─────────────────────────────────────────┘
```

### Key Features
- **Real-time prices** — Auto-refresh every 60 seconds
- **Dynamic insights** — Generated from actual portfolio data
- **Live status indicator** — Green dot when prices are current
- **Mobile responsive** — Cards stack on small screens

### Code Location
- Dashboard page: `apps/dashboard/src/app/dashboard/page.tsx`
- Components: `apps/dashboard/src/app/components/`
  - `NetWorthCard.tsx`
  - `InsightCard.tsx`
  - `QuickActions.tsx`
  - `MarketOverview.tsx`

---

## Design Principles

### 1. Lead with Value
First thing users see should be positive:
- Money found (tax savings)
- Milestones achieved
- Portfolio performance

NOT warnings or problems (those come after trust is built).

### 2. Clarity Over Completeness
Show the most important things, not everything. Users can drill into details.

### 3. Actionable Insights
Every insight should have a clear next step:
- "View Details →"
- "Take Action →"
- Link to relevant tool

### 4. Personalization
- Use first name
- Show THEIR numbers, not generic examples
- Insights relevant to THEIR situation

### 5. Real-Time Feel
- Live prices create engagement
- "Updated just now" builds trust
- Refresh indicator shows activity

---

## Insight Generation Rules

Insights are generated dynamically from portfolio data:

```typescript
// Tax-loss opportunity
if (holding.unrealizedLoss > $1000) {
  showInsight('tax', 'Tax-loss harvest opportunity', ...)
}

// Concentration risk  
if (holding.percentage > 25%) {
  showInsight('risk', 'Concentration detected', ...)
}

// Portfolio drift
if (equityWeight > 70%) {
  showInsight('rebalance', 'Portfolio drift detected', ...)
}

// Milestones
if (netWorth >= milestone.threshold) {
  showInsight('milestone', 'You\'ve reached...', ...)
}
```

**Priority order:** Tax > Risk > Rebalance > Milestone

---

## Backlog

### High Priority
1. Historical net worth tracking (show trend over time)
2. More insight types (fee savings, dividend income, goal progress)
3. Personalized action recommendations
4. Notification badges on Quick Actions

### Medium Priority
5. Customizable dashboard layout
6. Widget system (user chooses what to show)
7. Dark/light mode toggle
8. Time-of-day greetings

### Lower Priority
9. Dashboard sharing (advisor sends to client)
10. Printable summary
11. Voice summary option

---

## Completed

### 2026-02-09
- [x] Clean card-based layout (matched /demo)
- [x] Real-time price updates (60-second refresh)
- [x] Dynamic insight generation from portfolio
- [x] Mobile responsive layout
- [x] Live status indicator

---

## Agent Instructions

When working on Dashboard:

1. **Don't break the layout** — It's locked. Enhance within structure.
2. **Test on mobile first** — Most engagement is mobile
3. **Performance matters** — Dashboard loads on every visit
4. **Empty states** — New users see this first, make it welcoming
5. **Test with all personas** — Especially New User and Basic User

---

*The dashboard is the front door. Make it inviting.*
