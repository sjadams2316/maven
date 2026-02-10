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

- [ ] **BUG: Fund look-through** — Global funds (VTWAX, VT) should show US/Int'l breakdown, not just "US Stock"
  - Files: Likely asset classification logic
  - Learning: L004, L019

- [ ] **UX: Advisor dashboard mobile** — Touch targets need 48px minimum on advisor pages
  - Files: app/advisor/*.tsx
  - Learning: L002, L006

- [ ] **BUG: Oracle conversation history** — Chat history may persist between demo sessions
  - Files: Oracle component, localStorage handling
  - Learning: L009

- [ ] **UX: Empty states on Goals page** — No guidance when user has no goals
  - Files: app/goals/page.tsx
  - Learning: L014

- [ ] **FEATURE: Holdings sort** — Allow sorting holdings table by value, gain/loss, name
  - Files: portfolio-lab holdings table
  - Learning: L006

---

## P2 — Medium (build when P1 empty)
*Nice-to-haves, improvements*

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
