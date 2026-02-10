# Maven Partners Portal — Architecture Spec

## Overview

Two distinct experiences sharing a component library:

1. **Advisor Portal** (`/partners/*`) — Where advisors manage clients
2. **Client Portal** (`/c/[code]`) — Where clients see their curated view

## Branding

### Advisor Portal
- Logo: "Maven Partners" (distinct from consumer Maven)
- Color scheme: Deeper, more professional (navy/gold accents?)
- Tone: Sophisticated, advisory
- Feel: Bloomberg terminal meets wealth management

### Client Portal  
- Logo: "Maven Partners" (consistent with advisor)
- Color scheme: Warm, trustworthy
- Tone: Clear, reassuring
- Feel: Simple, uncluttered — advisor handles complexity

---

## Advisor Portal Routes

### `/partners`
- Landing page (not logged in): Value prop, login button
- Redirects to dashboard if authenticated

### `/partners/dashboard`
- AUM overview, recent activity
- Upcoming meetings
- Alerts requiring attention
- Quick actions (add client, generate report)

### `/partners/clients`
- Client list with search/filter/sort
- Key metrics per client (AUM, last contact, alerts)
- Quick actions (view, message, schedule)

### `/partners/clients/[id]`
- Full client detail view
- Portfolio overview
- **Curation controls** — toggle what client sees:
  - [ ] Portfolio Lab
  - [ ] Oracle chat
  - [ ] Fragility Index
  - [ ] What-If Simulator
  - [ ] Tax Harvesting
  - [ ] Goals
  - etc.
- Notes & activity log
- Meeting prep generator
- Generate/revoke client access link

### `/partners/insights`
- Global insights across all clients
- Filter by type, severity, client
- Bulk actions (dismiss, contextualize)

### `/partners/settings`
- Firm details
- Advisor profile
- Notification preferences
- Billing/subscription

---

## Client Portal Routes

### `/c/[code]`
- Entry point with advisor's invite code
- If not authenticated: Sign up / Sign in
- If authenticated: Redirect to client dashboard

### `/c/[code]/dashboard`
- Personalized dashboard
- Only shows features advisor enabled
- Advisor branding/contact visible
- "Powered by Maven Partners"

### `/c/[code]/[feature]`
- Individual feature pages (portfolio, goals, etc.)
- Only accessible if advisor enabled
- Simplified versions where appropriate

---

## Data Model Additions

### `AdvisorProfile`
```typescript
{
  id: string;
  userId: string;  // Clerk user
  firmName: string;
  firmLogo?: string;
  clientCodes: string[];  // Active invite codes
  settings: {
    defaultClientFeatures: string[];
    notificationPrefs: {...};
  };
}
```

### `ClientLink`
```typescript
{
  code: string;  // Unique invite code (e.g., "ABC123")
  advisorId: string;
  clientUserId?: string;  // Set when client signs up
  clientEmail: string;
  enabledFeatures: string[];
  createdAt: Date;
  lastAccess?: Date;
  status: 'pending' | 'active' | 'revoked';
}
```

---

## Phase 1 Scaffold (This Week)

1. **Route structure** — Create all `/partners/*` routes with placeholder pages
2. **Layout shell** — Partners-specific layout with different nav/branding
3. **Auth gate** — Middleware to protect `/partners/*` routes
4. **Advisor Dashboard** — Port existing work, polish
5. **Client List** — Port existing, add invite code generation
6. **Client Detail** — Port existing, add curation toggles

## Phase 2 (Next Week)

1. **Client portal** — `/c/[code]` routes
2. **Feature gating** — Client only sees enabled features
3. **Invite flow** — Email with magic link
4. **Real data** — Connect to actual client profiles

## Phase 3 (Launch Prep)

1. **Billing integration**
2. **White-label options**
3. **Compliance features** (audit logs, disclosures)
4. **Mobile polish**

---

*Created: 2026-02-10*
