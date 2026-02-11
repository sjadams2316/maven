# Client Portal Team — Knowledge Base

*The `/c/[code]` pages. Luxury concierge wealth command center.*

---

## Domain Ownership

The Client Portal team owns:
- All `/c/[code]/*` routes
- Client-facing experience (NOT advisor tools)
- Advisor preview mode (`?preview=true`)
- Calm UX philosophy
- **Branding: Always "Maven Partners" (not individual advisor names)**

---

## Expanded Section Structure

```
maven/apps/dashboard/src/app/c/[code]/
├── layout.tsx              # Shared layout, dark theme, Maven Partners branding
├── page.tsx                # Home: net worth, goals, weekly commentary
├── family/page.tsx         # Family/household with drill-ins per member
├── portfolio/page.tsx      # Holdings view (calm, no alerts)
├── social-security/page.tsx # SS strategy, benefits, timeline
├── estate/page.tsx         # Beneficiaries, trusts, documents, estate value
├── tax/page.tsx            # Year-end projection, Roth opportunities
├── philanthropy/page.tsx   # Charitable giving, DAF, impact
├── documents/page.tsx      # Document vault
├── messages/page.tsx       # Secure communication with Maven Partners
└── contact/page.tsx        # Advisor contact info
```

---

## Section Details

### Home (`/c/[code]`)
- Net worth display (clean, prominent)
- Goal progress rings
- Confidence messaging ("You're on track")
- **Weekly Commentary** from Maven Partners (AI-generated from market + portfolio)
- Quick links to other sections

### Family/Household (`/c/[code]/family`)
- List of family members (spouse, children, parents)
- Per-person drill-in showing:
  - Their accounts/assets
  - Beneficiary designations where they appear
  - Dependents (for tax purposes)
  - Education planning (529s for children)
- Household-level summary

### Social Security (`/c/[code]/social-security`)
- Your current SS strategy (claiming ages)
- Projected monthly benefits
- Break-even analysis visualization
- Spousal coordination (if applicable)
- Timeline showing key dates

### Estate Planning (`/c/[code]/estate`)
- Beneficiary summary across all accounts
- Trust status (if applicable)
- Estate value estimate
- Key documents (will, POA, healthcare directive) - status indicators
- "Next steps" if documents are missing/outdated

### Tax Planning (`/c/[code]/tax`)
- Year-end tax projection
- Estimated federal/state liability
- Roth conversion opportunities (advisor-approved)
- Tax-loss harvesting status (not action items, just "we've saved you $X")
- Important dates/deadlines

### Philanthropy (`/c/[code]/philanthropy`)
- Charitable giving summary (YTD, historical)
- Donor-advised fund balance (if applicable)
- Impact tracking
- Giving goals

### Documents (`/c/[code]/documents`)
- Organized vault:
  - Statements
  - Tax returns
  - Estate documents
  - Insurance policies
- Upload capability
- Secure sharing

### Messages (`/c/[code]/messages`)
- Secure thread with Maven Partners team
- Message history
- Notification preferences

---

## Advisor Curation Layer (CRITICAL)

**Advisors control what each client sees.** Sections are shown/hidden based on:
- Client life stage
- Relevance to their situation
- Advisor's judgment

### Visibility Settings Model

```typescript
interface ClientPortalSettings {
  clientId: string;
  
  // Section visibility (advisor toggles)
  sections: {
    family: boolean;           // Default: true
    socialSecurity: boolean;   // Default: true if age > 50
    estate: boolean;           // Default: true if net worth > $500K
    taxPlanning: boolean;      // Default: true
    philanthropy: boolean;     // Default: true if giving history
    documents: boolean;        // Default: true
    messages: boolean;         // Default: true
  };
  
  // Tone/communication style
  communicationTone: 'conservative' | 'moderate' | 'engaged';
  
  // Content preferences
  showNetWorth: boolean;       // Some clients prefer hidden
  showPerformance: boolean;    // Some get anxious about returns
  showProjections: boolean;    // Show retirement projections?
  
  // Commentary preferences
  weeklyCommentary: boolean;   // Show AI-generated commentary?
  marketUpdates: boolean;      // Show market news?
}
```

### Life Stage Presets

| Life Stage | Typical Settings |
|------------|------------------|
| **Young Professional (25-35)** | Hide: Social Security, Estate (unless HNW). Show: Tax, Family if married |
| **Growing Family (35-50)** | Show: Family, Tax, Documents. Maybe hide: SS, Philanthropy |
| **Pre-Retiree (50-65)** | Show: ALL sections. SS and Estate critical |
| **Retiree (65+)** | Show: ALL. Emphasize: SS, Estate, Tax (RMDs) |
| **HNW Any Age** | Show: ALL. Emphasize: Estate, Philanthropy, Tax |

### How Advisors Set This

In Partners portal (`/partners/clients/[id]/settings`):
- Toggle each section on/off
- Select life stage preset (auto-sets toggles)
- Override individual settings as needed
- Preview client view with current settings

### Implementation

1. **Database:** `ClientPortalSettings` table linked to client
2. **API:** `/api/client-portal/[code]/settings` returns visibility
3. **Layout:** Checks settings before rendering nav items
4. **Pages:** Return 404 or redirect if section hidden for this client

### Why This Matters

- **30-year-old doesn't need SS section** → Feels irrelevant, clutters UI
- **Anxious client doesn't need performance charts** → Creates stress
- **Simple situation doesn't need estate planning** → Overwhelming
- **Advisor knows their client** → They curate the experience

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
