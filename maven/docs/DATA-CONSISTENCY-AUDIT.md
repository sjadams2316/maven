# Data Consistency Audit

**Created:** 2026-02-08
**Updated:** 2026-02-08 (evening)
**Purpose:** Ensure all tools pull from centralized DEMO_PROFILE via UserProvider

## DEMO_PROFILE Data (single source of truth)

Located in: `src/lib/demo-profile.ts`

- **User:** Alex Demo, DOB 1985-03-15, age ~40
- **State:** VA (Virginia)
- **Filing Status:** Married Filing Jointly
- **Total Cash:** ~$85k (Chase $15k, Marcus HYSA $45k, Fidelity MM $25k)
- **Retirement Accounts:** ~$620k
  - 401(k): $385k (American Funds, Vanguard Target Date, S&P 500)
  - Traditional IRA: $125k (VTI, VXUS, BND, VNQ, SCHD)
  - Roth IRA: $78k (QQQ, ARKK, VGT, SMH, SOXX)
  - HSA: $32k (FZROX, FXAIX)
- **Investment Accounts:** ~$325k
  - Joint Brokerage: $195k (AAPL, MSFT, GOOGL, AMZN, NVDA, VOO, VEA, VWO, TSLA, META)
  - Crypto Holdings: $85k (BTC, ETH, TAO)
  - Speculative: $45k (CIFR, IREN)
- **Other Assets:** RE equity $185k, business $25k, other $15k
- **Liabilities:** Mortgage $425k, Auto $28k, CC $4.5k
- **Calculated Net Worth:** ~$732k

## Audit Status

### ✅ FIXED (Uses UserProvider correctly)

| Page | Data Source | Notes | Fixed Date |
|------|------------|-------|------------|
| `/family` | `useUserProfile()` | Gets profile, financials | original |
| `/tax-harvesting` | `useUserProfile()` | Scans actual holdings for losses | original |
| `/dashboard` | `useUserProfile()` | Main dashboard | original |
| `/portfolio-lab` | `useUserProfile()` | Gets holdings | original |
| `/stress-test` | `calculateAllocationFromFinancials()` | Derives from holdings | 2026-02-08 |
| `/monte-carlo` | `calculateAllocationFromFinancials()` | Derives from holdings | 2026-02-08 |
| `/retirement` | `calculateAge(profile.dateOfBirth)` | Uses DOB | 2026-02-08 |
| `/income` | `useUserProfile()` | Derives from holdings + SS | 2026-02-08 |
| `/rebalance` | `financials.allHoldings` | Uses actual holdings | 2026-02-08 |
| `/asset-location` | Profile accounts and holdings | Full integration | 2026-02-08 |

### ⚠️ PARTIAL (Some hardcoded data remains)

| Page | Issue | Priority | Status |
|------|-------|----------|--------|
| `/sensitivity` | Uses simplified simulation (not full Monte Carlo) | Low | Improved 2026-02-08 |

**Note:** `/sensitivity` now uses `calculateAllocationFromFinancials()` to derive stock allocation from actual holdings. The simulation function is simplified for performance (full Monte Carlo available at `/monte-carlo`).

## Mobile Responsiveness Audit

### ✅ Patterns Applied
All major pages now use responsive breakpoints:
- `grid-cols-1 md:grid-cols-X` for card grids
- `grid-cols-1 lg:grid-cols-12` for sidebar layouts
- `flex-wrap` for tight button groups
- `sm:`, `md:`, `lg:` breakpoints consistently

### Pages Reviewed (76 total)
- Dashboard, Portfolio Lab, Oracle - ✅
- Stress Test, Monte Carlo, Retirement, Safe Withdrawal - ✅
- Home, Goals, Learn, Refer - ✅
- Advisor dashboard and sub-pages - ✅
- Trade, Rebalance, Alerts, Reports - ✅
- Financial Snapshot, Estate, Integrations - ✅
- Fragility Index - ✅

## Solution: portfolio-utils.ts

Created `src/lib/portfolio-utils.ts` with:

1. `calculateAllocationFromHoldings(holdings)` — Derives allocation %s from holdings
2. `calculateAllocationFromFinancials(financials)` — Includes cash in allocation
3. `classifyTicker(ticker)` — Maps tickers to asset classes
4. `calculateAge(dateOfBirth)` — Gets age from DOB
5. `aggregateHoldingsByTicker(holdings)` — Combines holdings across accounts

## Testing Checklist

Verify in demo mode:
- [x] Net worth shows ~$732k everywhere
- [x] Allocation percentages are consistent
- [x] User name shows "Alex Demo"
- [x] Age calculates correctly (~40)
- [x] Holdings match DEMO_PROFILE

## Next Steps

1. `/sensitivity` - Wire up to actual portfolio data (low priority)
2. Add automated tests for data consistency
3. Periodic audits via HEARTBEAT.md
