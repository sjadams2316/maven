# Data Consistency Audit

**Created:** 2026-02-08
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

### ✅ PASSES (Uses UserProvider correctly)

| Page | Data Source | Notes |
|------|------------|-------|
| `/family` | `useUserProfile()` | Gets profile, financials |
| `/tax-harvesting` | `useUserProfile()` | Scans actual holdings for losses |
| `/dashboard` | `useUserProfile()` | Main dashboard |
| `/portfolio-lab` | `useUserProfile()` | Gets holdings |

### ❌ FAILS (Has hardcoded data) — NEEDS FIX

| Page | Issue | Fix Required |
|------|-------|--------------|
| `/stress-test` | Hardcoded `DEFAULT_ALLOCATION` | Calculate from `financials.allHoldings` |
| `/monte-carlo` | Hardcoded allocation sliders | Calculate from `financials.allHoldings` |
| `/retirement` | Hardcoded `currentAge=32`, `retirementAge=60` | Use `profile.dateOfBirth`, `profile.socialSecurity.retirementAge` |
| `/income` | Completely hardcoded income sources! | Derive from dividend holdings, SS data |
| `/rebalance` | Hardcoded `holdings` array | Use `financials.allHoldings` |
| `/asset-location` | Hardcoded `holdings` and `accounts` | Use profile accounts and holdings |
| `/sensitivity` | Uses mock simulation function | Should use actual portfolio data |

## Solution: portfolio-utils.ts

Created `src/lib/portfolio-utils.ts` with:

1. `calculateAllocationFromHoldings(holdings)` — Derives allocation %s from holdings
2. `calculateAllocationFromFinancials(financials)` — Includes cash in allocation
3. `classifyTicker(ticker)` — Maps tickers to asset classes
4. `calculateAge(dateOfBirth)` — Gets age from DOB
5. `aggregateHoldingsByTicker(holdings)` — Combines holdings across accounts

## Fix Order

1. ✅ `/stress-test` — Use `calculateAllocationFromFinancials()`
2. `/monte-carlo` — Use `calculateAllocationFromFinancials()`
3. `/retirement` — Use `calculateAge(profile.dateOfBirth)`
4. `/income` — Major rewrite to derive from holdings
5. `/rebalance` — Use `financials.allHoldings`
6. `/asset-location` — Use profile accounts and holdings
7. `/sensitivity` — Wire up to actual portfolio

## Testing Checklist

After fixes, verify in demo mode:
- [ ] Net worth shows ~$732k everywhere
- [ ] Allocation percentages are consistent
- [ ] User name shows "Alex Demo"
- [ ] Age calculates correctly (~40)
- [ ] Holdings match DEMO_PROFILE
