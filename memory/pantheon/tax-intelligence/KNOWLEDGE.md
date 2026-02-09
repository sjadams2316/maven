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
- **Wash Sale Tracker** — Visual timeline of 61-day windows, substantially identical detection, safe swap alternatives
- **Tax Alpha Counter** — Shows potential savings on dashboard
- **Fee Analyzer** — Shows expense ratios, annual fees, 30-year drag, and cheaper alternatives

### Code Location
- Tax harvesting page: `apps/dashboard/src/app/tax-harvesting/page.tsx`
- Wash Sale Tracker component: `apps/dashboard/src/app/components/WashSaleTracker.tsx`
- Wash sale detection logic: `apps/dashboard/src/lib/portfolio-utils.ts` (search for "WASH SALE DETECTION")
- Tax alpha API: `apps/dashboard/src/app/api/tax-alpha/`
- Fee Analyzer component: `apps/dashboard/src/app/components/FeeAnalyzer.tsx`
- Expense ratio utilities: `apps/dashboard/src/lib/portfolio-utils.ts` (bottom of file)

### Data Sources
- User holdings from UserProvider
- Cost basis from user input
- Current prices from Yahoo/CoinGecko

---

## Domain Expertise

### Wash Sale Tracker Implementation (2026-02-09)

**Problem:** Users often accidentally trigger wash sales by:
- Buying substantially identical securities within the 61-day window
- Not realizing that VOO/SPY/IVV are all "substantially identical" (same S&P 500 index)
- Having automatic dividend reinvestment in one account while selling in another

**Solution Built:**
- `SUBSTANTIALLY_IDENTICAL_GROUPS` data structure defining which tickers are interchangeable
- `analyzeWashSales()` function that scans transactions for violations
- `getSafeSwapAlternatives()` returns alternatives that DON'T trigger wash sale
- `WashSaleTracker` component with:
  - Visual timeline showing 61-day windows
  - Substantially identical warnings per holding
  - Safe swap suggestions (factor ETFs, dividend funds, etc. that provide exposure without being identical)
  - Step-by-step safe harvest instructions

**Key Design Decisions:**
1. Substantially identical groups based on index tracking, not sector (VOO=SPY=IVV, but QQQ≠VOO)
2. Safe alternatives include factor ETFs (SCHD, QUAL, MTUM) that provide market exposure differently
3. Timeline visualization shows active windows relative to today
4. Warnings are per-holding, not just per-ticker (can have same ticker in multiple accounts)

**Substantially Identical Groups Defined:**
- S&P 500: VOO, SPY, IVV, SPLG, FXAIX, VFIAX, SWPPX
- Total US: VTI, ITOT, SCHB, SPTM, FZROX, FSKAX, VTSAX, SWTSX
- Nasdaq 100: QQQ, QQQM, ONEQ
- International Developed: VEA, IEFA, EFA, SCHF, SPDW
- International Total: VXUS, IXUS, FZILX, VTIAX
- Emerging: VWO, IEMG, EEM, SCHE, SPEM
- Total Bond: BND, AGG, SCHZ, FBND, VBTLX, FXNAX
- Bitcoin ETFs: IBIT, FBTC, GBTC, BITO, BITB, ARKB
- And more...

**Safe Swap Examples:**
- Selling VTI at a loss? Swap to SCHD (dividend-focused, different methodology)
- Selling VOO at a loss? Swap to RSP (equal-weight S&P 500, different enough)
- Selling QQQ at a loss? Swap to MTUM (momentum factor, tech-heavy but different index)

---

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

### Fee Analyzer Implementation (2026-02-09)
**Problem:** Users don't realize how much fund fees cost them. A 1% expense ratio on $500K costs $5,000/year — and $150K+ over 30 years.

**Solution Built:**
- Expense ratio data for 100+ common ETFs/mutual funds hardcoded
- Unknown tickers estimated by heuristics (mutual funds ~0.5%, ETFs ~0.2%, stocks = 0%)
- Shows: annual fees in dollars, weighted expense ratio, 30-year fee drag
- "Switch & Save" table showing cheaper alternatives (e.g., AGTHX → VUG saves ~$3,200/year on $500K)
- Grading system (A-F) for expense ratios

**Key Insights:**
- American Funds (AGTHX, AIVSX, etc.) often 0.5-0.7% — 10x more than Vanguard equivalents
- GBTC (1.5%) vs IBIT (0.25%) — massive difference for crypto exposure
- SPY (0.09%) vs VOO (0.03%) — even well-known ETFs have cheaper alternatives
- Target date funds vary widely: Vanguard 0.13% vs Fidelity Freedom 0.68%

**Data Sources Considered:**
- FMP API has expense ratios but requires paid tier
- Yahoo Finance doesn't consistently provide expense ratios
- Hardcoded data is reliable and fast; can be updated periodically

**Location:** Portfolio Lab → Analysis tab (bottom)

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
