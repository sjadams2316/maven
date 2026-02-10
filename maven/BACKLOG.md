# Maven Backlog

*Prioritized work queue for autonomous and manual builds.*
*Last updated: 2026-02-10*

---

## P0 — Critical (auto-fix immediately)
*Production down, data wrong, security issues*

- [ ] None currently

---

## P1 — High (auto-build during window)
*Bugs, UX fixes, small features*

### Maven Partners Portal
- [ ] **UX: Partners mobile responsiveness** — All /partners/* pages need 48px touch targets, proper stacking on mobile
- [ ] **UX: Partners loading states** — Add skeletons/spinners to dashboard stats, client list, insights
- [ ] **FEATURE: Client invite link generator** — Generate unique codes, copy to clipboard, show QR code
- [ ] **UX: Meeting prep improvements** — Add print styles, make exportable
- [ ] **FEATURE: Client activity timeline** — Show login history, feature usage on client detail page

### Maven Core (Completed)
- [x] **BUG: Fund look-through** — Global funds (VTWAX, VT) should show US/Int'l breakdown ✅ L034
- [x] **UX: Advisor dashboard mobile** — Touch targets 48px minimum ✅ L002↑
- [x] **BUG: Oracle conversation history** — Fixed demo mode chat isolation ✅
- [x] **UX: Empty states on Goals page** — Added helpful guidance ✅
- [x] **FEATURE: Holdings sort** — Sortable columns added ✅

---

## P2 — Medium (build when P1 empty)
*Nice-to-haves, improvements*

### Maven Partners Portal
- [ ] **FEATURE: Client portal scaffold** — Build /c/[code] routes for client view (uses advisor's enabled features)
- [ ] **FEATURE: Bulk insight actions** — Select multiple insights, dismiss/enable in batch
- [ ] **FEATURE: Client comparison view** — Side-by-side view of 2-3 clients
- [ ] **UX: Dashboard charts** — Add AUM trend chart, client growth chart to advisor dashboard
- [ ] **FEATURE: Notification center** — Bell icon with dropdown for recent alerts

### Maven Core
- [ ] **FEATURE: Export portfolio to CSV**
- [ ] **UX: Improve loading skeletons consistency**
- [ ] **FEATURE: Dark mode toggle**
- [ ] **UX: Keyboard navigation improvements**

---

## P3 — Low (backlog for later)
*Ideas, research, long-term*

- [ ] **RESEARCH: Evaluate Plaid alternatives**
- [ ] **IDEA: Gamification achievement badges**
- [ ] **IDEA: Social sharing for milestones**
- [ ] **RESEARCH: Mobile app feasibility**

---

## ❌ Not Autonomous (requires Sam)
*Major changes, integrations, business logic*

- [ ] Plaid integration setup
- [ ] Authentication system changes
- [ ] Pricing/billing logic
- [ ] New API integrations requiring keys
- [ ] Database schema changes
- [ ] Major architecture refactors

---

## Completed (Recent)
*Moved here after shipping*

- [x] **2026-02-10:** Data consistency across all pages (10 pages fixed)
- [x] **2026-02-10:** Demo/Portfolio Lab data sync
- [x] **2026-02-09:** What-If Trade Simulator
- [x] **2026-02-09:** Fee Analyzer
- [x] **2026-02-09:** Markets widget live prices

---

*Format: [TYPE: Brief description] — Context/files/learnings*
