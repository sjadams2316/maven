# Pantheon Learnings

*Auto-accumulating insights from every agent. This file compounds over time.*

**Format:** Each agent appends one learning after completing its task.

---

## 2026-02-09 — Sprint: Polish & Fixes

### pantheon-dashboard-polish
**Task:** Clean up data source indicator messaging
**Insight:** When showing status indicators, default to "healthy" and hide completely — users don't need to see technical health checks unless something is actually wrong. "No news is good news" UX.

### pantheon-ux-polish  
**Task:** Fix Markets widget showing dashes
**Insight:** Always have fallback data for critical UI elements. Hardcoded "last known" prices with a "Delayed" badge is better than showing "—" which looks broken.

### pantheon-mobile
**Task:** Mobile responsiveness audit
**Insight:** Touch targets must be 48px minimum (not 44px) for comfortable tapping. Use `min-h-[48px]` in Tailwind. For horizontal scrolling tabs, add `scrollbar-hide` utility class.

### pantheon-data-health
**Task:** Fix FMP showing as "down" falsely  
**Insight:** Health checks should test the same endpoints the app actually uses. Testing `/profile/AAPL` when the app uses `/quote/` gives false negatives.

### pantheon-error-messages
**Task:** Improved error messaging for monte-carlo API route
**Insight:** Error responses should have 4 parts: (1) `error` - short title, (2) `message` - user-friendly explanation, (3) `code` - machine-readable for debugging, (4) `hint` - actionable fix suggestion. Also: parse request.json() separately to give a specific "invalid JSON" error rather than a generic catch-all.

### pantheon-loading-states
**Task:** Improved dashboard loading skeleton to match actual page layout
**Insight:** Skeleton loaders should match the real content structure — show the same grid layout, card shapes, and hierarchy. A generic "3 gray boxes" skeleton looks lazy; matching the real layout (left column with net worth/insights/holdings, right column with quick actions/markets/goals) gives users an accurate preview and feels more polished.

### pantheon-tooltip-polish
**Task:** Add helpful tooltips to financial terms in Portfolio Lab (Volatility, Market Cap, P/E Ratio, Dividend Yield)
**Insight:** When adding tooltips to financial terms, the Term component + glossary pattern in InfoTooltip.tsx is powerful. Add new terms to the GLOSSARY object with title, explanation, and example. The example field using real-world numbers (e.g., "S&P 500 average: ~20-25") makes definitions actionable rather than abstract.

---

## Learning Categories

### UX Principles
- Hide technical details from users unless actionable
- Always have fallback states for external data
- "Partial" is less scary than "Degraded"

### Mobile Patterns
- 48px minimum touch targets
- `scrollbar-hide` for horizontal scroll areas
- Stack grids on mobile: `grid-cols-1 sm:grid-cols-3`
- Fixed positioning for mobile tooltips/modals

### API Patterns
- Health checks must mirror actual usage patterns
- Fallback data > broken UI
- Cache aggressively, show staleness indicators

### Code Patterns
- Tailwind responsive: mobile-first, then `sm:`, `md:`, `lg:`
- Always type empty arrays: `let items: Type[] = []`
- Optional chaining for API data: `data?.field?.nested || fallback`

---

*This file grows with every sprint. Review weekly to promote patterns to PATTERNS.md.*
