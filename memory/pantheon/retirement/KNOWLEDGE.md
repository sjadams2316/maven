# Retirement Optimizer — Team Knowledge Base

*Last Updated: 2026-02-09*
*Team: Retirement Optimizer*

---

## Mission

Give everyone a clear path to retirement. Make complex retirement planning simple and actionable.

---

## Current State

### Features Built
- **Social Security Optimizer** — Claiming strategy analysis, PDF generation
- **Retirement Optimizer Page** — 401(k) analysis with 5 tabs
- **Financial Snapshot** — Interactive retirement projections
- **WealthJourneyChart** — Gamified milestone tracking

### Code Location
- SS Optimizer: `apps/dashboard/src/app/social-security/`
- SS Calculator: `apps/dashboard/src/lib/social-security-calculator.ts`
- Retirement Optimizer: `apps/dashboard/src/app/retirement-optimizer/`
- Financial Snapshot: `apps/dashboard/src/app/financial-snapshot/`

---

## Domain Expertise

### Social Security Optimization

**Claiming Ages:**
- 62: Earliest (reduced ~30% from FRA)
- FRA: Full Retirement Age (66-67 depending on birth year)
- 70: Maximum (increased ~8%/year after FRA)

**Key Strategies:**
- **File and Suspend:** Suspended at FRA, allows spouse to claim on record
- **Restricted Application:** Claim spousal only, let own benefit grow (limited now)
- **Breakeven Analysis:** When does waiting pay off?

**Spousal Benefits:**
- Up to 50% of higher earner's FRA benefit
- Must wait until own FRA for full spousal benefit
- Survivor benefit: 100% of deceased spouse's benefit

### 401(k) Optimization

**Contribution Limits (2026):**
- Under 50: $23,500
- 50+: $31,000 (catch-up)
- Total (with employer): $70,500

**Key Concepts:**
- Employer match = free money (always max this first)
- High fees compound negatively over decades
- Target date funds simplify but may not optimize

**Roth vs Traditional:**
- Roth: Pay tax now, tax-free growth and withdrawal
- Traditional: Deduct now, pay tax on withdrawal
- Decision depends on current vs future tax bracket

### RMD Rules (SECURE 2.0)

**Start Age:**
- 73 for those turning 72 after 2022
- 75 starting in 2033

**Calculation:**
- Account balance ÷ Life expectancy factor
- Applies to Traditional IRA, 401(k), 403(b)
- Roth IRA: No RMDs during owner's lifetime

### Retirement Projections

**Monte Carlo Simulation:**
- Run thousands of scenarios with randomized returns
- Shows probability of success
- Better than single-point projections

**Key Variables:**
- Savings rate
- Expected return (be conservative: 5-7% real)
- Retirement age
- Withdrawal rate (4% rule as starting point)
- Social Security timing
- Inflation (assume 2-3%)

---

## Research Completed

### Social Security (2026-02-07)
- Full claiming strategy analysis
- Break-even calculations
- Spousal coordination
- PDF report generation

### SECURE 2.0 Changes
- RMD age changes
- Roth catch-up requirements
- Emergency savings in 401(k)

---

## Backlog

### High Priority
1. Roth conversion ladder analysis
2. 401(k) rollover decision tool
3. Medicare IRMAA integration
4. Sequence of returns risk visualization

### Medium Priority
5. Pension integration
6. Part-time work impact modeling
7. Healthcare cost projections
8. Legacy/inheritance planning

### Lower Priority
9. Annuity comparison tool
10. Long-term care insurance analysis
11. Geographic arbitrage calculator

---

## Open Questions

1. How to get 401(k) plan details (fund options, fees)?
2. Pension benefit projections — data availability?
3. Healthcare cost estimates — reliable data source?

---

## Agent Instructions

When working on Retirement:

1. **Long time horizons** — Small changes compound dramatically
2. **Conservative assumptions** — Better to over-prepare
3. **Emotional stakes** — Retirement is anxiety-inducing, be reassuring
4. **Clear milestones** — Show progress toward goals
5. **Test with Retiree persona** — They're the primary user

---

*Retirement confidence = Maven's core value proposition.*
