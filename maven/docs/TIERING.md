# Maven Tiering Strategy

*Draft v1 — February 8, 2026*

---

## Overview

Maven serves three distinct audiences with different needs, willingness to pay, and relationships to advice. This document defines the tiering structure, feature differentiation, and UX principles for each.

**Core insight:** The real business is Maven Partners (RIA clients). Basic and Pro are brand-building, lead generation, and proof-of-market. Revenue comes from AUM, not subscriptions.

---

## The Three Tiers

### 1. Maven Basic (Free)

**Who:** Curious individuals, early-stage accumulators, people researching wealth tools.

**Purpose:** 
- Top of funnel — build brand awareness
- Demonstrate Maven's intelligence
- Convert to Pro or (ideally) Partners

**Experience:**
- Limited Oracle queries (5-10/day)
- Manual account entry only (no Plaid)
- View-only Fragility Index
- Basic portfolio analysis (no stress testing)
- No tax harvesting recommendations
- Educational content unlocked

**Why they upgrade:** They hit the limits and want more. Or they realize they want actual guidance → Partners.

---

### 2. Maven Pro ($29-49/month)

**Who:** DIY investors who want institutional-grade tools without an advisor. FIRE community, self-directed HNW, finance-curious professionals.

**Purpose:**
- Revenue diversification (subscription)
- Brand credibility ("people pay for this")
- Conversion path to Partners ("want a human? Upgrade.")

**Experience:**
- Unlimited Oracle
- Plaid account linking
- Full Portfolio Lab (stress testing, optimization, research)
- Tax-loss harvesting scanner + recommendations
- Fragility Index with alerts
- What-If Scenario Engine
- Financial Snapshot projections
- Social Security Optimizer
- Email support

**Why they might convert to Partners:** 
- Life event (inheritance, IPO, retirement) → need real advice
- Realize DIY has limits → want someone to execute
- Tax situation gets complex → need a fiduciary

**Positioning:** "All the tools. No advisor. Your call."

---

### 3. Maven Partners (RIA Clients)

**Who:** Clients of the RIA (initially Jon's book, then growth). Typically $500K+ investable assets.

**Purpose:**
- **This is the business.** AUM fees, long-term relationships, referrals.
- Maven is the service layer that makes the RIA scalable.

**Experience:**
- Everything in Pro, plus:
- **Schwab Advisor Services direct link** (real-time, not Plaid)
- **Advisor-curated dashboard** (see below)
- **Pre-loaded onboarding** — accounts visible on first login
- **Collaborative planning tools** — shared notes, agenda items
- **Meeting prep summaries** — Maven generates review materials
- **Advisor context on all insights** — "Your advisor has reviewed this"
- **Priority support** — direct line to advisor + Maven team
- **Physical welcome kit** — card with QR code, premium feel

**Pricing:** No subscription. Included with AUM relationship (1% or tiered).

**Positioning:** "Your advisor, amplified by AI."

---

## Feature Matrix

| Feature | Basic | Pro | Partners |
|---------|:-----:|:---:|:--------:|
| **Oracle Chat** | 5-10/day | Unlimited | Unlimited + advisor context |
| **Account Linking** | Manual only | Plaid | Schwab direct + Plaid |
| **Portfolio Analysis** | Basic | Full | Full + advisor notes |
| **Stress Testing** | ❌ | ✅ | ✅ |
| **Tax-Loss Harvesting** | View only | Recommendations | Advisor-executed |
| **Fragility Index** | View only | + Alerts | Advisor-curated alerts |
| **What-If Scenarios** | ❌ | ✅ | ✅ + shared with advisor |
| **Financial Snapshot** | Limited | Full | Full + advisor projections |
| **Social Security Optimizer** | ❌ | ✅ | ✅ |
| **Retirement Optimizer** | ❌ | ✅ | ✅ + 401k integration |
| **Collaborative Planning** | ❌ | ❌ | ✅ |
| **Meeting Prep** | ❌ | ❌ | ✅ |
| **Support** | Self-serve | Email | Dedicated + advisor |
| **Onboarding** | Self-serve | Self-serve | White-glove + welcome kit |

---

## The "Advisor-Controlled Experience" (Partners Only)

This is the critical UX innovation that solves the "client sees scary risk" problem.

### Principle: Advisors See Everything. Clients See What Advisors Want.

Maven Partners clients are **not** independent users exploring their portfolio. They're clients in a relationship. The advisor controls the experience.

### Advisor Dashboard (Internal)

The advisor sees:
- Full risk analysis, concentration warnings, tax opportunities
- All Maven insights and alerts
- Client activity (what they looked at, what they asked Oracle)
- Suggested talking points for next review

### Client Dashboard (Curated)

The client sees:
- Clean, calm net worth view
- Portfolio allocation (without alarming warnings)
- Upcoming meeting agenda
- Action items from last review
- Oracle (with advisor context baked in)

### Insight Curation Controls

For each insight type, advisor can set:

| Setting | Behavior |
|---------|----------|
| **Show** | Client sees the insight directly |
| **Show with context** | Client sees it with "Your advisor is aware" badge |
| **Advisor only** | Only advisor sees it; hidden from client |
| **Collaborative** | Shows as "Discussion topic for your next review" |

**Example:**
- Client has 35% in AAPL (concentration risk)
- Advisor knows this is intentional (low basis, tax reasons)
- Advisor sets this insight to "Advisor only"
- Client never sees a scary warning
- Advisor sees it, can add a note: "Intentional — $12 cost basis, hold until step-up"

### Client Tone Settings

Advisor sets a "tone" for each client:

| Tone | Behavior |
|------|----------|
| **Conservative** | Minimal proactive insights. Calm dashboard. Maven waits to be asked. |
| **Moderate** | Key insights surface. Balanced approach. |
| **Engaged** | Full insights. Client wants to see everything. |

This lets the advisor match Maven's personality to the client's anxiety level.

---

## Partners Onboarding Experience

### The Goal
First login feels like walking into a prepared room, not filling out forms.

### The Flow

**Step 1: In-Person Handoff**
- Client signs advisory agreement
- Advisor hands them a **Maven Partners Welcome Card**
  - Premium cardstock, embossed
  - QR code linking to personalized signup
  - "Member since 2026" messaging
  - Advisor's name and photo

**Step 2: Card Scan → Personalized Signup**
- QR code contains client identifier
- Signup page is pre-branded: "Welcome to Maven Partners, [First Name]"
- Minimal form: just email + password (everything else pre-loaded)
- Accounts already visible (Schwab link established by advisor)

**Step 3: First Dashboard**
- Net worth displayed immediately
- Message from advisor: "Welcome! I've set up your dashboard. Here's what you'll find..."
- Guided tour highlights key features
- Oracle prompt: "Ask me anything about your portfolio"

**Step 4: Post-Onboarding**
- Advisor gets notification: "[Client] completed Maven setup"
- First meeting agenda auto-populated with "Review Maven dashboard together"

---

## Revenue Model

| Tier | Pricing | Revenue Type |
|------|---------|--------------|
| **Basic** | Free | Lead gen, brand building |
| **Pro** | $29-49/month | Subscription (secondary) |
| **Partners** | Included in AUM (1% or tiered) | AUM fees (primary) |

**Why AUM, not subscription for Partners:**
- Aligns incentives (we grow when you grow)
- Feels like "included" not "additional cost"
- Higher LTV than any subscription
- Referrals come from delighted clients, not cost-conscious subscribers

**Long-term:** 
- Maven Pro could evolve into B2B (other RIAs licensing Maven)
- That's where enterprise scale lives
- But first: prove it with Partners

---

## Naming Considerations

| Option | Pros | Cons |
|--------|------|------|
| **Maven Partners** | Implies relationship, premium | Could confuse with business partners |
| **Maven Private** | Exclusive feel, clear premium | Sounds like private equity |
| **Maven Advisor** | Clear it's RIA-connected | Less special |
| **Maven [RIA Name]** | White-labeled, personal | Loses Maven brand |
| **Maven Family Office** | Aspirational, premium | Might overpromise |

**Current recommendation:** Maven Partners. Revisit after client feedback.

---

## Implementation Phases

### Phase 1: Foundation (Now)
- [ ] Build advisor dashboard (internal view)
- [ ] Implement insight curation controls
- [ ] Design Partners onboarding flow
- [ ] Create welcome card template
- [ ] Schwab Advisor Services integration (read-only)

### Phase 2: Soft Launch (Q2 2026)
- [ ] Onboard Jon's first 5-10 clients as Partners
- [ ] Test insight curation workflow
- [ ] Iterate on client dashboard based on feedback
- [ ] Refine welcome kit design

### Phase 3: Scale (Q3+ 2026)
- [ ] Open Maven Basic publicly
- [ ] Launch Maven Pro subscription
- [ ] Build conversion funnels (Basic → Pro → Partners)
- [ ] Consider B2B Pro (other RIAs)

---

## Open Questions

1. **Pro pricing:** $29 or $49? Need to test willingness to pay.
2. **Partners AUM threshold:** Minimum assets for Partners? Or tiered service levels?
3. **Pro → Partners conversion:** How do we make the handoff smooth? Intro call? Local advisor matching?
4. **White-labeling:** Do Partners clients see "Maven" or "[RIA Name] powered by Maven"?
5. **Compliance review:** Insight curation needs legal sign-off (are we providing advice?).

---

## Summary

| Tier | Purpose | Revenue | Experience |
|------|---------|---------|------------|
| **Basic** | Funnel | Free | Self-serve, limited |
| **Pro** | Brand + secondary revenue | $29-49/mo | Full tools, DIY |
| **Partners** | **The business** | AUM fees | Advisor-curated, white-glove |

The moat is Partners. The magic is advisor-controlled UX. The scale comes later.

---

*This is a living document. Update as we learn.*
