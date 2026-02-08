# Required Minimum Distribution (RMD) Strategies for Maven

*Research completed: February 2026*

RMD planning is table stakes for retirement — any serious wealth platform must handle it comprehensively. This document covers the current rules, strategies, and how Maven should implement RMD optimization.

---

## Table of Contents
1. [Current RMD Rules (SECURE 2.0 Changes)](#1-current-rmd-rules-secure-20-changes)
2. [RMD Starting Ages: 73 Now, 75 Later](#2-rmd-starting-ages-73-now-75-later)
3. [Aggregation Rules](#3-aggregation-rules)
4. [QCDs: The Ultimate RMD Hack](#4-qcds-the-ultimate-rmd-hack)
5. [Roth Conversions to Reduce Future RMDs](#5-roth-conversions-to-reduce-future-rmds)
6. [Inherited IRA RMD Rules (10-Year Rule)](#6-inherited-ira-rmd-rules-10-year-rule)
7. [Penalties for Missing RMDs](#7-penalties-for-missing-rmds)
8. [RMD Timing Strategies](#8-rmd-timing-strategies)
9. [How Maven Should Project and Optimize RMDs](#9-how-maven-should-project-and-optimize-rmds)

---

## 1. Current RMD Rules (SECURE 2.0 Changes)

### Key Changes from SECURE 2.0 Act (2022)

| Change | Details |
|--------|---------|
| **Higher RMD Age** | Increased from 72 → 73 (2023), then → 75 (2033) |
| **Lower Penalties** | Reduced from 50% → 25%, can drop to 10% if corrected |
| **Roth 401(k) Exemption** | No longer subject to RMDs during owner's lifetime (effective 2024) |
| **QCD Inflation Adjustment** | Now indexed annually ($108,000 for 2025, $111,000 for 2026) |
| **QLAC Limit Increase** | 25% cap removed; dollar limit increased to $200,000+ (inflation-adjusted) |

### RMD Calculation Formula

```
RMD = Account Balance (Dec 31 prior year) ÷ Life Expectancy Factor
```

**Life Expectancy Factors** (Uniform Lifetime Table - excerpt):

| Age | Distribution Period | RMD per $100K |
|-----|--------------------:|-------------:|
| 73 | 26.5 | $3,774 |
| 75 | 24.6 | $4,065 |
| 80 | 20.2 | $4,950 |
| 85 | 16.0 | $6,250 |
| 90 | 12.2 | $8,197 |
| 95 | 8.9 | $11,236 |

*Note: Separate table used if sole beneficiary is spouse 10+ years younger*

---

## 2. RMD Starting Ages: 73 Now, 75 Later

### Timeline of RMD Starting Age

| Birth Year | RMD Starting Age | First RMD Due By |
|------------|------------------|------------------|
| Before 1951 | Already started at 72 | N/A |
| 1951-1959 | 73 | April 1 of year after turning 73 |
| 1960 and later | 75 | April 1 of year after turning 75 |

### First Year RMD Timing Decision

**Critical Decision Point**: Account owners can delay their *first* RMD until April 1 of the following year. However, this means taking TWO RMDs in the same tax year (first year's + current year's).

**Maven Recommendation Engine Should:**
- Calculate tax impact of single vs. double RMD year
- Factor in expected income trajectory
- Consider IRMAA (Medicare premium) implications
- Model state tax impacts

---

## 3. Aggregation Rules

### Which Accounts CAN Be Aggregated

| Account Type | Can Aggregate RMDs? | Notes |
|--------------|---------------------|-------|
| **Traditional IRAs** | ✅ YES | Calculate each, withdraw total from any one |
| **SEP IRAs** | ✅ YES | Aggregate with Traditional IRAs |
| **SIMPLE IRAs** | ✅ YES | Aggregate with Traditional IRAs |
| **403(b) Plans** | ✅ YES | Can aggregate among 403(b)s only |

### Which Accounts CANNOT Be Aggregated

| Account Type | Can Aggregate RMDs? | Notes |
|--------------|---------------------|-------|
| **401(k) Plans** | ❌ NO | Must calculate AND withdraw separately from each |
| **457(b) Plans** | ❌ NO | Must calculate AND withdraw separately from each |
| **Roth 401(k)** | ❌ NO | (No RMDs during owner's lifetime anyway) |
| **Inherited IRAs** | ⚠️ Partial | Only with same decedent + same RMD treatment |

### Strategic Implications

**IRA Aggregation Strategy:**
1. Calculate RMD for each IRA separately
2. Sum all IRA RMDs
3. Withdraw the total from the most tax-efficient account:
   - Account with biggest losses (harvest losses)
   - Account with poorest-performing assets
   - Account that simplifies consolidation

**401(k) Headache:**
- Multiple 401(k)s = multiple mandatory withdrawals
- Consider rolling old 401(k)s into IRAs before RMD age
- Exception: "Still working" exemption for current employer's 401(k)

---

## 4. QCDs: The Ultimate RMD Hack

### What is a Qualified Charitable Distribution?

A QCD allows individuals **age 70½ and older** to donate directly from an IRA to a qualified charity. The amount:
- Counts toward the RMD requirement
- Is **NOT included in taxable income**
- Cannot also be claimed as a charitable deduction (double-dip not allowed)

### QCD Limits (Inflation-Indexed)

| Year | Annual QCD Limit | One-Time Legacy QCD Limit |
|------|-----------------|---------------------------|
| 2024 | $105,000 | $53,000 |
| 2025 | $108,000 | $54,000 |
| 2026 | $111,000 | $55,000 |

*Married couples: Each spouse can do their own QCD if both qualify*

### Legacy QCD (One-Time Option)

SECURE 2.0 added a one-time QCD option to:
- Charitable Remainder Unitrust (CRUT)
- Charitable Remainder Annuity Trust (CRAT)
- Charitable Gift Annuity (CGA)

This provides income back to the donor while still getting QCD tax treatment.

### QCD vs. Standard Charitable Deduction

**Example** (Single filer, age 75, $200K income needed):
- Other income: $75,000
- RMD: $150,000
- Excess they want to donate: $25,000

| Strategy | Taxable Income |
|----------|---------------:|
| Take full RMD + donate cash | $201,125 |
| Use $25K QCD | $181,850 |
| **Tax Savings** | **~$4,000+** |

### QCD Rules & Gotchas

1. **Age 70½ requirement** — NOT the same as RMD age (73/75)
2. **Direct transfer only** — Check cannot be made payable to you
3. **Eligible charities only** — 501(c)(3) organizations; NO donor-advised funds or private foundations
4. **First-dollars-out rule** — If you take an RMD before a QCD in the same year, the RMD is taxable (QCD cannot retroactively offset it)
5. **No deduction** — Can't claim QCD as charitable deduction

### Maven QCD Optimization

**Alert users when:**
- They're age 70½+ and make regular charitable contributions
- Their RMD exceeds their living expenses
- QCD would reduce AGI enough to affect IRMAA, ACA subsidies, or Social Security taxation

---

## 5. Roth Conversions to Reduce Future RMDs

### The Core Strategy

Convert traditional IRA/401(k) balances to Roth before RMDs begin, thereby:
- Reducing future tax-deferred balances
- Reducing future RMD amounts
- Creating tax-free growth in Roth
- Leaving tax-free inheritance to heirs

### Ideal Conversion Windows

| Window | Why It Works |
|--------|--------------|
| **Early retirement (before 65)** | Lower income, before Social Security/Medicare |
| **After retirement, before RMDs** | "Gap years" with reduced income |
| **Years with low income** | Stay in lower tax brackets |
| **Years with large deductions** | Medical expenses, business losses, etc. |

### Roth Conversion Rules

1. **Cannot convert RMD itself** — Must take RMD first, then convert additional
2. **Pay taxes on conversion** — Ideally from non-IRA funds
3. **5-year rule for conversions** — Each conversion has its own 5-year clock if under 59½
4. **Irreversible** — Conversions cannot be undone (no more recharacterization)

### Roth Conversion vs. RMD Trade-offs

**Factors to Model:**
- Current tax bracket vs. expected future bracket
- Years until RMDs begin
- Expected investment growth rate
- State tax considerations
- IRMAA impact (can increase Medicare premiums)
- Social Security taxation threshold

### Maven Conversion Optimizer Should:

1. Project future RMD amounts without conversion
2. Model various conversion amounts/schedules
3. Calculate break-even year (when tax savings exceed conversion taxes paid)
4. Warn about IRMAA cliffs
5. Consider state tax residency changes
6. Factor in expected tax law changes (TCJA sunset 2026)

---

## 6. Inherited IRA RMD Rules (10-Year Rule)

### The SECURE Act's 10-Year Rule

For most non-spouse beneficiaries who inherited IRAs after 2019, the "stretch IRA" is dead. The account must be fully emptied by the end of the **10th year** following the owner's death.

### Who Is Exempt from the 10-Year Rule? (Eligible Designated Beneficiaries)

| Beneficiary Type | RMD Treatment |
|------------------|---------------|
| **Surviving spouse** | Can treat as own OR life expectancy |
| **Minor child of owner** | Life expectancy until age 21, then 10-year rule |
| **Disabled beneficiary** | Life expectancy |
| **Chronically ill beneficiary** | Life expectancy |
| **Beneficiary not more than 10 years younger** | Life expectancy |

### Critical Distinction: Did Original Owner Die Before or After RBD?

| If Original Owner Died... | Annual RMDs Required? |
|--------------------------|----------------------|
| **BEFORE** their RMD age | NO annual RMDs — just empty by year 10 |
| **AFTER** their RMD age | YES — annual RMDs AND empty by year 10 |

*RBD = Required Beginning Date (April 1 after turning 73)*

### IRS RMD Waivers (2021-2024)

The IRS waived penalties for missed inherited IRA RMDs for 2021-2024 due to regulatory confusion. **Starting 2025**, the rules are enforced:
- Annual RMDs resume for applicable beneficiaries
- Must still empty account by end of year 10

### Strategic Considerations for Inherited IRAs

**If NO annual RMDs required (owner died before RBD):**
- Consider spreading withdrawals across all 10 years
- Take more in low-income years
- Take less in high-income years

**If annual RMDs ARE required (owner died after RBD):**
- Must take minimum each year
- Can always take MORE to smooth tax impact
- Don't let large balance accumulate for year 10 "tax bomb"

### Maven Inherited IRA Features

1. Track original owner's death date and age
2. Calculate whether annual RMDs apply
3. Project year-10 balance under various scenarios
4. Alert about upcoming deadlines
5. Optimize withdrawal schedule across income years

---

## 7. Penalties for Missing RMDs

### Current Penalty Structure (Post-SECURE 2.0)

| Situation | Penalty |
|-----------|---------|
| **Missed RMD** | 25% excise tax on shortfall |
| **Corrected within 2 years** | Reduced to 10% |
| **Waiver granted by IRS** | 0% (if reasonable cause shown) |

*Previously was 50% — SECURE 2.0 reduced this significantly*

### How to Correct a Missed RMD

1. **Take the missed distribution ASAP** — Don't wait
2. **File Form 5329** — Report the excise tax
3. **Request a waiver** — Attach explanation letter with "reasonable cause"
4. **The 10% reduction** — Available if corrected within the "correction window" (by end of 2nd year after the missed RMD)

### Common "Reasonable Cause" Reasons IRS Accepts

- Custodian error
- Serious illness
- Death in family
- First-time RMD confusion
- Mathematical errors

### Maven Safeguards

**Prevent missed RMDs by:**
1. Automated reminders starting January 1 of RMD year
2. Escalating alerts as December 31 approaches
3. Tracking RMD taken vs. required throughout year
4. Integration with custodians for automatic RMD setup
5. Year-end reconciliation check

---

## 8. RMD Timing Strategies

### Early Year vs. Late Year: The Trade-offs

| Timing | Pros | Cons |
|--------|------|------|
| **January** | Peace of mind, cash flow early, no risk of forgetting | Lose potential investment growth |
| **December** | Maximum time for investment growth, clearer tax picture | Risk of forgetting, market timing risk |
| **Monthly/Quarterly** | Steady income stream, dollar-cost averaging on exit | Multiple transactions to track |

### The "Safe Harbor" Tax Hack

**Key Insight:** Tax withholding from retirement distributions is treated as paid **evenly throughout the year**, regardless of when the withdrawal occurs.

**Strategy:** Take your RMD in December, withhold enough for your ENTIRE year's tax liability, and avoid quarterly estimated payments.

### First Year RMD Timing

**Option A: Take in year you turn 73**
- One RMD in that year
- Spread tax impact

**Option B: Delay to April 1 of next year**
- Two RMDs in same tax year (first year's + current year's)
- Could push into higher bracket
- Sometimes beneficial if income drops significantly in that year

### Market Timing Considerations

**If market is down significantly:**
- Consider taking RMD early to sell fewer shares
- "Sequence of returns" risk in reverse

**If market is up significantly:**
- Consider delaying to let gains compound
- More shares available for growth

### Maven Timing Recommendations

**Model multiple scenarios:**
1. Lump sum January vs. December
2. Monthly distributions
3. Quarterly aligned with estimated taxes
4. Impact on tax brackets under each scenario

---

## 9. How Maven Should Project and Optimize RMDs

### Core RMD Projection Engine

**Inputs Required:**
- All tax-deferred account balances
- Account types (IRA, 401k, 403b, etc.)
- User's date of birth
- Spouse's date of birth (if applicable)
- Expected investment returns
- Expected income from other sources
- State of residence

**Outputs:**
- Projected RMD amounts by year (10, 20, 30+ year horizon)
- Tax impact under various scenarios
- Comparison with/without Roth conversions
- QCD optimization recommendations

### Key Optimization Algorithms

#### 1. Tax Bracket Optimization
```
Goal: Keep annual income below key tax bracket thresholds
Strategy: Combine RMDs, Roth conversions, and withdrawals to "fill" lower brackets
```

#### 2. IRMAA Cliff Management
```
Medicare IRMAA thresholds (2025):
- Single: $106,000, $133,000, $167,000, $200,000, $500,000
- Married: $212,000, $266,000, $334,000, $400,000, $750,000

Goal: Stay just below thresholds or plan for temporary spikes
```

#### 3. Social Security Taxation Optimization
```
Provisional Income thresholds:
- Single: $25,000 (0%), $34,000 (50%), above (85% taxable)
- Married: $32,000 (0%), $44,000 (50%), above (85% taxable)

Strategy: Time RMDs and conversions to minimize Social Security taxation
```

#### 4. QCD Integration
```
If (age >= 70.5 AND charitable_intent > 0):
    optimal_qcd = min(rmd_amount, charitable_intent, qcd_limit)
    recommend_qcd(optimal_qcd)
```

### Maven Feature Roadmap for RMDs

#### Phase 1: Basic RMD Tracking
- [ ] Display RMD amounts for current year
- [ ] Track RMDs taken vs. required
- [ ] Deadline reminders and alerts
- [ ] Support account aggregation rules

#### Phase 2: Projection Engine
- [ ] Multi-year RMD projections
- [ ] Tax impact modeling
- [ ] Scenario comparison tools
- [ ] Integration with retirement income planning

#### Phase 3: Optimization Engine
- [ ] Roth conversion recommendations
- [ ] QCD optimization
- [ ] Tax bracket management
- [ ] IRMAA-aware planning

#### Phase 4: Advanced Features
- [ ] Inherited IRA tracking and optimization
- [ ] Multi-state tax modeling
- [ ] Integration with custodians for automated RMDs
- [ ] AI-driven personalized recommendations

### Data Sources

**IRS Publications:**
- Publication 590-B (IRA Distributions)
- Publication 560 (Small Business Retirement Plans)
- Publication 571 (403(b) Plans)
- Uniform Lifetime Table (updated 2022)

**Regulatory Tracking:**
- SECURE Act (2019)
- SECURE 2.0 Act (2022)
- IRS Final Regulations (July 2024)
- Annual inflation adjustments

---

## Summary: Key Takeaways for Maven

1. **RMD age is increasing** — 73 now, 75 in 2033. Track user's birth year.

2. **Aggregation matters** — IRAs can aggregate, 401(k)s cannot. Help users consolidate.

3. **QCDs are powerful** — $108K+ annually for charitable users age 70½+. Proactively recommend.

4. **Roth conversions reduce future RMDs** — Model the "gap years" window aggressively.

5. **10-year rule is complex** — Track inherited IRA rules carefully; annual RMDs may or may not apply.

6. **Penalties are reduced but real** — 25% (or 10% if corrected). Never let users miss RMDs.

7. **Timing flexibility exists** — Help users optimize for tax brackets, IRMAA, and cash flow.

8. **Project forward** — RMDs compound and grow as percentages increase with age. Show users the 20-year picture.

---

*Last updated: February 2026*
*Sources: IRS, Schwab, Fidelity, Kiplinger, Kitces, various financial planning resources*
