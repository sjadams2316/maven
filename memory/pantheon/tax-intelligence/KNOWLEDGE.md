# Tax Intelligence — Team Knowledge Base

*Last Updated: 2026-02-09*
*Team: Tax Intelligence*

---

## Mission

Find every dollar of tax savings possible. Make tax optimization accessible to everyone.

---

## Current State

### Features Built
- **Tax-Loss Harvesting Scanner** — Identifies holdings with losses, suggests swaps
- **Wash Sale Detection** — Flags potential wash sale violations
- **Tax Alpha Counter** — Shows potential savings on dashboard

### Code Location
- Tax harvesting page: `apps/dashboard/src/app/tax-harvesting/page.tsx`
- Tax alpha API: `apps/dashboard/src/app/api/tax-alpha/`

### Data Sources
- User holdings from UserProvider
- Cost basis from user input
- Current prices from Yahoo/CoinGecko

---

## Domain Expertise

### Tax-Loss Harvesting Fundamentals

**What It Is:**
Selling investments at a loss to offset capital gains, reducing tax liability.

**Key Rules:**
- Short-term losses offset short-term gains first (taxed at ordinary income rates)
- Long-term losses offset long-term gains first (taxed at 0/15/20%)
- Net losses can offset up to $3,000 of ordinary income per year
- Excess losses carry forward indefinitely

**Wash Sale Rule:**
- Cannot buy "substantially identical" security within 30 days before or after sale
- Applies across all accounts (including spouse's)
- Disallowed loss gets added to cost basis of replacement

**Substantially Identical:**
- Same stock = identical
- Same company's bonds = may be identical
- Different index funds tracking same index = gray area
- Different sector ETFs = generally not identical

### Tax-Efficient Asset Location

**Principle:** Put tax-inefficient assets in tax-advantaged accounts.

**Tax-Inefficient (put in 401k/IRA):**
- Bonds (interest taxed as ordinary income)
- REITs (dividends taxed as ordinary income)
- Actively managed funds (high turnover)

**Tax-Efficient (can go in taxable):**
- Index funds (low turnover)
- Growth stocks (no dividends, defer gains)
- Municipal bonds (tax-free)
- ETFs (more tax-efficient than mutual funds)

### Capital Gains Strategies

**Long-Term vs Short-Term:**
- Hold >1 year for LTCG rates (0/15/20%)
- STCG taxed as ordinary income (up to 37%)

**Specific Identification:**
- Can choose which lots to sell
- Sell highest cost basis first to minimize gain
- Or sell long-term lots to get better rate

**Qualified Dividends:**
- Must hold stock 60+ days around ex-dividend date
- Taxed at LTCG rates

---

## Research Completed

### Tax-Loss Harvesting (2026-02-05)
- Comprehensive swap suggestions
- Wash sale risk detection
- Multi-account considerations

### Qualified Opportunity Zones (2026-02-09)
- OBBBA 2025 made program permanent
- December 31, 2026 deadline for pre-2027 investments
- Rural QOZs get 30% basis step-up
- File: `memory/research/concentrated-positions/qualified-opportunity-zones.md`

---

## Backlog

### High Priority
1. Multi-account tax-loss harvesting (coordinate across accounts)
2. Tax lot selection optimization
3. State tax considerations
4. Estimated tax payment calculator

### Medium Priority
5. Roth conversion analysis
6. Capital gains distribution predictions
7. Tax bracket management
8. Charitable giving optimization (bunching)

### Lower Priority
9. AMT exposure calculator
10. NIIT (3.8% surtax) planning
11. Tax alpha historical tracking

---

## Open Questions

1. How to handle wash sales across accounts user doesn't tell us about?
2. State tax data — where to get accurate rates?
3. Tax lot data — most users don't have detailed cost basis

---

## Agent Instructions

When working on Tax Intelligence:

1. **Accuracy is critical** — Tax advice has real financial consequences
2. **Disclaim appropriately** — We're not tax advisors
3. **Show the math** — Users should see how savings are calculated
4. **Consider all accounts** — Tax planning is holistic
5. **Test edge cases** — Tax code is full of gotchas

---

*Tax savings found = trust earned. Get it right.*
