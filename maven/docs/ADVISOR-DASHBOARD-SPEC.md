# Advisor Dashboard Specification

*February 8, 2026*

---

## Overview

The Advisor Dashboard is the internal control plane for Maven Partners. It's where advisors manage their client book, curate insights, prepare for meetings, and monitor client engagement.

**Core principle:** Advisors see everything. Clients see what advisors want them to see.

---

## User Roles

| Role | Access | How identified |
|------|--------|----------------|
| **Advisor** | Full dashboard, all clients, curation controls | `user.role === 'advisor'` |
| **Client** | Their own dashboard only (curated view) | `user.role === 'client'` + `user.advisorId` |
| **Pro/Basic** | Their own dashboard, no advisor link | `user.role === 'user'` (default) |

---

## Routes

```
/advisor                    → Advisor home (client list + overview)
/advisor/clients            → Full client list with search/filter
/advisor/clients/[id]       → Single client detail view
/advisor/clients/[id]/prep  → Meeting prep for specific client
/advisor/insights           → Global insight feed across all clients
/advisor/settings           → Advisor preferences, defaults
```

---

## Page Specifications

### 1. Advisor Home (`/advisor`)

**Purpose:** Quick overview + action items

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Header: "Good morning, Jon" + quick stats              │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐│
│ │ Total AUM       │ │ Active Clients  │ │ Alerts      ││
│ │ $12.4M          │ │ 23              │ │ 5 need attn ││
│ └─────────────────┘ └─────────────────┘ └─────────────┘│
├─────────────────────────────────────────────────────────┤
│ Upcoming Meetings (next 7 days)                        │
│ ┌─────────────────────────────────────────────────────┐│
│ │ Sam Adams    │ Feb 12, 2pm │ [Prep] [View]         ││
│ │ Jane Smith   │ Feb 14, 10am│ [Prep] [View]         ││
│ └─────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────┤
│ Insights Requiring Attention                           │
│ ┌─────────────────────────────────────────────────────┐│
│ │ 🔴 Sam Adams: Tax-loss harvest opportunity ($4.2K) ││
│ │ 🟡 Jane Smith: Concentration risk (AAPL 42%)       ││
│ │ 🟡 Bob Jones: RMD deadline approaching             ││
│ └─────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────┤
│ Recent Client Activity                                 │
│ • Sam Adams viewed Fragility Index (2h ago)           │
│ • Jane Smith asked Oracle about Roth conversion (5h)  │
│ • Bob Jones logged in for first time (yesterday)      │
└─────────────────────────────────────────────────────────┘
```

**Components:**
- `AdvisorStats` — AUM, client count, alerts
- `UpcomingMeetings` — Calendar integration (future: Google/Outlook)
- `InsightAlerts` — Filtered to unresolved/uncurated
- `ClientActivity` — Recent logins, Oracle questions, page views

---

### 2. Client List (`/advisor/clients`)

**Purpose:** Full client roster with search, filter, sort

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ [Search: ___________] [Filter: All ▼] [Sort: AUM ▼]    │
├─────────────────────────────────────────────────────────┤
│ Name          │ AUM      │ Last Login │ Alerts │ Action│
│───────────────┼──────────┼────────────┼────────┼───────│
│ Sam Adams     │ $847K    │ Today      │ 2      │ [→]   │
│ Jane Smith    │ $1.2M    │ 3 days ago │ 1      │ [→]   │
│ Bob Jones     │ $520K    │ 1 week ago │ 0      │ [→]   │
│ ...           │          │            │        │       │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Search by name
- Filter: All / Needs attention / Inactive (>30 days)
- Sort: AUM / Name / Last login / Alerts
- Click row → Client detail

---

### 3. Client Detail (`/advisor/clients/[id]`)

**Purpose:** Everything about one client

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ ← Back │ Sam Adams                    │ [Prep Meeting] │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐│
│ │ Total AUM       │ │ YTD Return      │ │ Next Meeting││
│ │ $847,000        │ │ +8.2%           │ │ Feb 12, 2pm ││
│ └─────────────────┘ └─────────────────┘ └─────────────┘│
├─────────────────────────────────────────────────────────┤
│ [Portfolio] [Insights] [Activity] [Notes] [Settings]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  (Tab content here)                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Tabs:**

**Portfolio Tab:**
- Same view client sees (allocation pie, holdings list)
- But with advisor annotations visible
- "View as client" toggle

**Insights Tab:**
- All Maven-detected insights for this client
- Each insight has curation controls:
  ```
  ┌────────────────────────────────────────────────────┐
  │ 🟡 Concentration Risk: AAPL at 42% of portfolio   │
  │                                                    │
  │ Visibility: [Show ▼]  ← dropdown                  │
  │   • Show to client                                │
  │   • Show with context ("Advisor aware")           │
  │   • Advisor only (hide from client)              │
  │   • Discussion topic (show as agenda item)        │
  │                                                    │
  │ Advisor note: [Intentional - low basis, hold____] │
  │                                        [Save]     │
  └────────────────────────────────────────────────────┘
  ```

**Activity Tab:**
- Login history
- Pages viewed
- Oracle conversations (advisor can read)
- Time spent

**Notes Tab:**
- Free-form advisor notes
- Meeting notes history
- Linked documents (future)

**Settings Tab:**
- Client tone: Conservative / Moderate / Engaged
- Notification preferences
- Meeting frequency
- Special instructions

---

### 4. Meeting Prep (`/advisor/clients/[id]/prep`)

**Purpose:** Generate review materials

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Meeting Prep: Sam Adams                                │
│ Scheduled: February 12, 2026 at 2:00 PM               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 📊 Portfolio Summary                                   │
│ • Total AUM: $847,000 (+$23,000 since last meeting)   │
│ • YTD Return: +8.2% (vs S&P +7.1%)                    │
│ • Allocation: 65% equity, 20% fixed, 10% crypto, 5% cash│
│                                                         │
│ 🔄 Changes Since Last Review (Dec 15, 2025)           │
│ • Added 50 shares AAPL ($8,400)                       │
│ • Tax-loss harvest: Sold VWO, bought IEMG            │
│ • 401k contribution increased to max                  │
│                                                         │
│ 💡 Talking Points                                      │
│ • Crypto allocation now 10% — discuss rebalancing?    │
│ • AAPL concentration at 42% — review exit strategy    │
│ • Roth conversion window — income lower this year     │
│                                                         │
│ ✅ Action Items from Last Meeting                      │
│ • [x] Increase 401k contribution                      │
│ • [x] Review beneficiary designations                 │
│ • [ ] Send estate planning attorney contact           │
│                                                         │
│ 📋 Suggested Agenda                                    │
│ 1. Portfolio review (10 min)                          │
│ 2. Tax planning — Roth conversion (15 min)            │
│ 3. Concentration risk discussion (10 min)             │
│ 4. Q&A / Open items (10 min)                          │
│                                                         │
│ [Generate PDF] [Email to Client] [Copy to Clipboard]  │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Auto-generated from client data + insights
- Editable before sending
- PDF export
- Email to client option
- Track what was shared

---

## Data Model

### User (extended)

```typescript
interface User {
  id: string;
  email: string;
  role: 'user' | 'client' | 'advisor';
  advisorId?: string;  // For clients: their advisor's ID
  // ... existing fields
}
```

### Client-Advisor Relationship

```typescript
interface AdvisorClient {
  id: string;
  advisorId: string;
  clientId: string;
  status: 'active' | 'inactive' | 'prospect';
  tone: 'conservative' | 'moderate' | 'engaged';
  nextMeetingDate?: Date;
  notes: string;
  createdAt: Date;
}
```

### Insight Curation

```typescript
interface InsightCuration {
  id: string;
  insightId: string;
  clientId: string;
  advisorId: string;
  visibility: 'show' | 'show_with_context' | 'advisor_only' | 'discussion';
  advisorNote?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Client Activity

```typescript
interface ClientActivity {
  id: string;
  clientId: string;
  type: 'login' | 'page_view' | 'oracle_query' | 'action';
  details: {
    page?: string;
    query?: string;
    duration?: number;
  };
  timestamp: Date;
}
```

---

## MVP Scope

### Phase 1 (Build Now)
- [x] Spec document
- [ ] `/advisor` home page with mock data
- [ ] `/advisor/clients` list page
- [ ] `/advisor/clients/[id]` detail page (Portfolio + Insights tabs)
- [ ] Basic insight curation UI (visibility dropdown)
- [ ] LocalStorage for curation state (no backend yet)

### Phase 2 (Next)
- [ ] Activity tracking
- [ ] Meeting prep generator
- [ ] Notes tab
- [ ] PDF export

### Phase 3 (Later)
- [ ] Backend persistence (database)
- [ ] Real client-advisor linking
- [ ] Calendar integration
- [ ] Email notifications

---

## Design Notes

- Match existing Maven dark theme
- Use same component patterns (cards, gradients, hover states)
- Advisor-specific accent color? Maybe a gold/bronze to feel "elevated"
- Mobile-responsive but desktop-first (advisors work on computers)

---

## Open Questions

1. How does an advisor "claim" a client? Invite flow? Admin assignment?
2. Should advisors see client Oracle conversations in full? Privacy concern?
3. How do we handle multi-advisor firms? (Multiple advisors, shared clients)
4. Compliance: Do we need to log all advisor actions for audit trail?

---

*This spec will evolve as we build.*
