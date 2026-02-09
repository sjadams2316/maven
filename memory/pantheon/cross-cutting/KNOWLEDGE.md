# Cross-Cutting Knowledge Base

*Last Updated: 2026-02-09*
*Project: Pantheon (Maven)*

---

## Competitive Intelligence Summary

*Full analysis: `memory/research/competitive/2026-02-09-competitive-landscape.md`*

### Maven's Competitive Position

**Category:** AI-native wealth analysis platform (not a robo-advisor)

**Unique Value Proposition:**
Institutional-grade portfolio analysis without AUM fees or asset transfer requirements.

### Key Differentiators vs. Competition

| Feature | Maven | Industry |
|---------|-------|----------|
| Market Fragility Index™ | ✅ Unique | ❌ Nobody has this |
| 6-Scenario Stress Testing | ✅ | ❌ Rare |
| 5-Factor Analysis | ✅ | ❌ Rare in retail |
| Holdings Overlap Detection | ✅ | ⚠️ Mezzi has X-Ray |
| Fee Analyzer | ✅ | ⚠️ Empower, Mezzi |
| AI-Native Architecture | ✅ | ⚠️ Mezzi only |
| Zero AUM Fees | ✅ | ⚠️ Tracking apps only |
| Open Architecture | ✅ | ❌ Robos require transfer |

### Competitor Quick Reference

**Traditional Robo-Advisors (manage money, AUM fees):**
- **Betterment:** 0.25-0.65% AUM, goal-based, human advisors available
- **Wealthfront:** 0.25% AUM, best tax optimization, Path planning tool
- **Empower:** 0.49-0.89% AUM, great free dashboard, high minimum
- **Vanguard PAS:** 0.30% AUM, $50K minimum, Vanguard funds only
- **Schwab IP:** $0 fee but high cash drag, Premium being discontinued
- **Fidelity Go:** Free under $25K, 0.35% above, basic features
- **SoFi:** 0.25% AUM, $1 minimum, free CFP access

**AI/Tracking Apps (don't manage money, subscription):**
- **Mezzi:** $200/year, closest competitor, AI-powered, SEC-registered RIA
- **Copilot:** $95/year, best-in-class UX, budgeting-focused, Apple-only
- **Monarch:** $99/year, Mint replacement, great for couples, budgeting focus

### Competitive Threats

1. **Mezzi** — Most direct competitor, AI-native, same positioning
2. **Wealthfront Path** — Free planning tool could expand
3. **Empower Dashboard** — Strong free offering, could add AI

### Strategic Moats to Build

1. **Market Fragility Index™** — Brand as a known indicator
2. **Factor Analysis Leadership** — Retail factor exposure analysis
3. **AI Quality** — Better reasoning than generic wrappers
4. **Stress Testing Depth** — More scenarios, better personalization

---

## Product Principles

### 1. Analysis Over Management
We help people understand their money; we don't manage it. This is a feature, not a limitation.

### 2. AI-Native, Not AI-Bolted
Every feature should leverage AI reasoning, not just display data.

### 3. Explain the Why
Every recommendation needs clear reasoning. "Sell X" is useless; "Sell X because..." builds trust.

### 4. Personalization is Table Stakes
Generic advice exists everywhere. Maven knows YOUR situation.

### 5. Privacy by Default
User data stays with users. We analyze, we don't sell or share.

---

## Cross-Team Dependencies

### Dashboard ↔ Portfolio Lab
- Dashboard insights pull from Portfolio Lab calculations
- Portfolio Lab findings surface on dashboard

### Portfolio Lab ↔ Tax Intelligence
- Fee analyzer lives in both contexts
- Tax-loss opportunities inform portfolio recommendations

### Tax Intelligence ↔ Retirement
- Roth conversion analysis spans both
- RMD planning needs tax context

### Fragility ↔ All Teams
- Fragility score should influence all recommendations
- High fragility = more conservative suggestions

---

## Shared Terminology

| Term | Definition |
|------|------------|
| **AUM** | Assets Under Management (how robos charge fees) |
| **TLH** | Tax-Loss Harvesting |
| **Factor Exposure** | Sensitivity to market factors (beta, size, value, momentum, quality) |
| **Overlap** | Percentage of holdings shared between two funds |
| **Fragility** | Aggregate measure of market crash risk |
| **Held-Away** | Assets at other institutions we can see but not control |

---

## Data Sources (Current vs. Target)

| Need | Current | Target |
|------|---------|--------|
| Stock prices | Yahoo Finance | Same (reliable) |
| Crypto prices | CoinGecko | Same (rate limit issues) |
| Economic data | FRED | Same (excellent) |
| Fund holdings | Manual/estimated | Morningstar ($25-50K/yr) |
| Factor loadings | Heuristic estimates | AQR/MSCI data |
| Expense ratios | Hardcoded 100+ tickers | FMP paid tier |

---

## Technical Standards

### Code Locations
- All features: `apps/dashboard/src/app/`
- Shared utilities: `apps/dashboard/src/lib/`
- API routes: `apps/dashboard/src/app/api/`

### Testing
- Test with demo profile (45+ holdings)
- Test with all 6 personas
- Mobile-first testing

### Documentation
- Update team KNOWLEDGE.md with learnings
- Add to BACKLOG.md for future work
- Session files for significant work

---

*This knowledge base contains insights that span multiple teams. Update as cross-cutting patterns emerge.*
