# Client Portal Team — Knowledge Base

*The `/c/[code]` pages. Calm, advisor-curated, luxury concierge experience.*

---

## Domain Ownership

The Client Portal team owns:
- All `/c/[code]/*` routes
- Client-facing experience (NOT advisor tools)
- Advisor preview mode (`?preview=true`)
- Calm UX philosophy

---

## Key Files

```
maven/apps/dashboard/src/app/c/[code]/
├── layout.tsx          # Shared layout, dark theme
├── page.tsx            # Home/overview
├── portfolio/page.tsx  # Holdings view
├── insights/page.tsx   # Curated insights
├── documents/page.tsx  # Document vault
└── contact/page.tsx    # Advisor contact
```

---

## Philosophy: Calm UX

**The client hired an advisor to NOT think about this stuff.**

### ✅ DO Show:
- Net worth (one clean number)
- Goal progress (visual rings, not percentages)
- "You're on track" confidence messaging
- Beautiful charts they can share
- Milestones to celebrate
- Advisor's availability

### ❌ DO NOT Show:
- Rebalancing alerts ("Your portfolio drifted 3%!")
- Tax-loss harvesting prompts
- Fee breakdowns
- Risk warnings (unless critical)
- Action items
- Anything that creates anxiety

---

## Advisor Curation

Advisors control what clients see via the Partners portal:

```typescript
interface ClientVisibility {
  showInsight: boolean;       // Toggle per insight
  insightContext?: string;    // Advisor's framing
  showNetWorth: boolean;      // Some clients prefer hidden
  showPerformance: boolean;   // Some get anxious
  communicationTone: 'conservative' | 'moderate' | 'engaged';
}
```

**The advisor is the curator.** They know their client's emotional needs.

---

## Design Principles

### Colors
- Background: Deep navy (`#0a1628`)
- Cards: Slightly lighter (`#111827`)
- Accent: Calm teal (`#0d9488`)
- Text: Soft white (`#f8fafc`)
- Avoid: Bright reds, alarming oranges

### Typography
- Headlines: Clean, confident
- Body: Readable, generous line-height
- Numbers: Tabular figures, easy to scan

### Spacing
- Generous whitespace
- Cards breathe
- Nothing feels cramped

### Mobile
- 48px minimum touch targets (L002)
- Single column on mobile
- Charts resize gracefully

---

## Components

### Goal Progress Ring
```tsx
<GoalProgressRing 
  current={750000}
  target={1000000}
  label="Retirement"
  targetDate="2035"
/>
```
Visual: Circular progress, fills clockwise, subtle animation

### Net Worth Journey
```tsx
<NetWorthJourney
  milestones={[
    { date: '2020', value: 200000, label: 'Started investing' },
    { date: '2023', value: 500000, label: 'Half million!' },
    { date: '2024', value: 750000, label: 'Today' },
  ]}
/>
```
Visual: Timeline with celebration markers

### Confidence Card
```tsx
<ConfidenceCard
  status="on-track"
  message="You're ahead of your retirement goal"
  detail="At your current pace, you'll reach your target 2 years early"
/>
```
Visual: Green checkmark, reassuring language

---

## Common Issues & Fixes

### Issue: Client sees advisor-only info
**Root cause:** Wrong component imported
**Fix:** Client portal has its own component library

### Issue: Feels like a dashboard, not a concierge
**Root cause:** Too many numbers, not enough story
**Fix:** Lead with narrative, data supports the story

### Issue: Mobile layout broken
**Root cause:** Fixed widths, no responsive
**Fix:** Use Tailwind responsive classes, test 375px

---

## Testing Checklist

- [ ] No fees visible
- [ ] No rebalancing alerts
- [ ] No tax-loss harvesting prompts
- [ ] Goal progress rings render
- [ ] Net worth displays (or hides per settings)
- [ ] Mobile: 375px viewport works
- [ ] Advisor preview shows "Preview Mode" banner

---

## Learnings Applied

- **L002:** 48px touch targets
- **L006:** Mobile-first responsive
- **L013:** Client portal = calm, no action items
- **L014:** Dark theme consistency

---

## Integration Points

| Integrates With | How |
|-----------------|-----|
| Partners | Advisor curation controls |
| Preview Mode | `?preview=true&advisor=true` |
| Document Vault | Shared documents from advisor |
| Oracle | Future: Embedded chat for questions |

---

## URL Structure

```
/c/[code]              → Home (goal progress, confidence)
/c/[code]/portfolio    → Holdings (simplified view)
/c/[code]/insights     → Curated insights (advisor-approved)
/c/[code]/documents    → Document vault
/c/[code]/contact      → Advisor contact info
```

Access code is per-client, maps to their profile.

---

*The client portal is not a tool. It's a feeling: "I'm in good hands."*
