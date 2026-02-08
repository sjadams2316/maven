# Retirement Account Types Deep Dive

*Research Date: 2026-02-06*
*Quality Standard: 40-year veteran advisor would nod*
*Sources: IRS Notice 2025-67, IRS Publication 590-A (2025/2026), Fidelity, Mercer Advisors*

---

## Executive Summary

This document covers contribution limits, eligibility rules, and deduction phaseouts for all major retirement account types for 2025 and 2026. Maven Pro needs this information to help advisors guide clients on optimal account selection and contribution strategies.

---

## 1. Individual Retirement Accounts (IRAs)

### Traditional IRA

**Purpose**: Tax-deferred growth with potential tax deduction on contributions

#### Contribution Limits

| Year | Under 50 | Age 50+ | Total with Catch-Up |
|------|----------|---------|---------------------|
| 2025 | $7,000 | $8,000 | $8,000 |
| 2026 | $7,500 | $8,600 | $8,600 |

**Note**: IRA catch-up is now indexed for inflation under SECURE 2.0 (wasn't before)

#### Key Rules

- **No age limit** for contributions (changed under SECURE Act 2019)
- **Compensation required**: Must have earned income ≥ contribution amount
- **Combined limit**: Traditional + Roth IRA contributions share the limit
- **Deadline**: Tax filing deadline (typically April 15)

#### Deduction Phaseouts (Covered by Workplace Plan)

**2025**
| Filing Status | Full Deduction | Partial Deduction | No Deduction |
|---------------|----------------|-------------------|--------------|
| Single/HOH | MAGI ≤ $79,000 | $79,000-$89,000 | ≥ $89,000 |
| MFJ | MAGI ≤ $126,000 | $126,000-$146,000 | ≥ $146,000 |
| MFS | N/A | $0-$10,000 | ≥ $10,000 |

**2026**
| Filing Status | Full Deduction | Partial Deduction | No Deduction |
|---------------|----------------|-------------------|--------------|
| Single/HOH | MAGI ≤ $81,000 | $81,000-$91,000 | ≥ $91,000 |
| MFJ | MAGI ≤ $129,000 | $129,000-$149,000 | ≥ $149,000 |
| MFS | N/A | $0-$10,000 | ≥ $10,000 |

#### Deduction Phaseouts (NOT Covered, But Spouse IS)

**2025**: MFJ phaseout $236,000-$246,000
**2026**: MFJ phaseout $242,000-$252,000

**If neither spouse covered by workplace plan**: No income limit for deduction

---

### Roth IRA

**Purpose**: Tax-free growth and qualified withdrawals (no deduction)

#### Contribution Limits

Same as Traditional IRA: $7,500 under 50 / $8,600 age 50+ for 2026

#### Income Limits (Contribution Eligibility)

**2025**
| Filing Status | Full Contribution | Partial Contribution | No Contribution |
|---------------|-------------------|----------------------|-----------------|
| Single/HOH | MAGI < $150,000 | $150,000-$165,000 | ≥ $165,000 |
| MFJ | MAGI < $236,000 | $236,000-$246,000 | ≥ $246,000 |
| MFS | N/A | $0-$10,000 | ≥ $10,000 |

**2026**
| Filing Status | Full Contribution | Partial Contribution | No Contribution |
|---------------|-------------------|----------------------|-----------------|
| Single/HOH | MAGI < $153,000 | $153,000-$168,000 | ≥ $168,000 |
| MFJ | MAGI < $242,000 | $242,000-$252,000 | ≥ $252,000 |
| MFS | N/A | $0-$10,000 | ≥ $10,000 |

#### Backdoor Roth IRA

For those over income limits:
1. Contribute to non-deductible Traditional IRA
2. Convert to Roth IRA

**Pro-Rata Rule Warning**: If you have ANY pre-tax IRA money (Traditional, SEP, SIMPLE), conversion is partially taxable based on overall IRA ratio. See `backdoor-roth-strategies.md` for details.

---

## 2. Employer-Sponsored Plans

### 401(k) / 403(b) / 457(b)

**Who offers what:**
- 401(k): For-profit companies
- 403(b): Nonprofits, schools, hospitals
- 457(b): State/local government, some nonprofits

#### 2025-2026 Contribution Limits

| Limit Type | 2025 | 2026 |
|------------|------|------|
| **Employee Elective Deferral** | $23,500 | $24,500 |
| **Catch-Up (Age 50-59, 64+)** | $7,500 | $8,000 |
| **Super Catch-Up (Age 60-63)** | $11,250 | $11,250 |
| **Total Limit (Employer + Employee)** | $70,000 | $72,000 |
| **Total with Catch-Up** | $77,500+ | $80,000+ |

#### Super Catch-Up (SECURE 2.0 - New!)

**Ages 60, 61, 62, 63 only** (not 64+):
- 2025: $11,250 catch-up
- 2026: $11,250 catch-up

Maximum employee contributions age 60-63:
- 2025: $23,500 + $11,250 = **$34,750**
- 2026: $24,500 + $11,250 = **$35,750**

#### Roth Catch-Up Mandate (SECURE 2.0)

**Effective 2026**: If your FICA wages exceeded $150,000 in prior year, all catch-up contributions MUST be Roth.

**Warning**: If your plan doesn't offer Roth contributions, you may lose catch-up eligibility entirely.

#### 403(b) 15-Year Rule

Special additional catch-up for 403(b) participants with 15+ years at same employer:
- Additional $3,000/year
- Lifetime max: $15,000
- Applies BEFORE age-based catch-up

---

### 457(b) Special Rules

**Unique to 457(b):**
- Can double contributions in final 3 years before normal retirement age
- Catch-up rules differ from 401(k)/403(b)
- Can contribute to BOTH a 457(b) AND a 401(k)/403(b)

**Example**: Employee with both 401(k) and governmental 457(b):
- 401(k): $24,500 + catch-up
- 457(b): $24,500 + catch-up
- Total: **$49,000+** in employee deferrals alone!

---

## 3. Self-Employed Retirement Plans

### SEP IRA (Simplified Employee Pension)

**Best for**: Self-employed individuals, small business owners with few/no employees

#### Contribution Limits

| Year | Maximum | Formula |
|------|---------|---------|
| 2025 | $70,000 | 25% of net self-employment income (up to $350,000) |
| 2026 | $72,000 | 25% of net self-employment income (up to $355,000) |

**No catch-up contributions** for SEP IRAs

**Self-Employed Calculation** (more complex):
```
Net profit from Schedule C
- 1/2 of SE tax
- SEP contribution
= Net earnings for SEP calculation

Effective rate: ~20% of net profit (not 25%)
```

#### Pros and Cons

**Pros:**
- Simple to set up and administer
- High contribution limits
- Deadline for contribution = tax filing deadline + extensions
- No annual Form 5500 filing

**Cons:**
- Must contribute same % for all eligible employees
- No Roth option (until SECURE 2.0 implementation)
- No loans

---

### SIMPLE IRA

**Best for**: Employers with ≤100 employees who want simple administration

#### 2025-2026 Limits

| Limit Type | 2025 | 2026 |
|------------|------|------|
| **Employee Deferral** | $16,500 | $17,000 |
| **Catch-Up (Age 50-59, 64+)** | $3,500 | $4,000 |
| **Super Catch-Up (Age 60-63)** | $5,250 | $5,250 |
| **Higher Limit (eligible employers)** | $17,600 | $18,100 |

**Eligible for Higher Limits**: Employers with ≤25 employees (or who elected 4% match)

#### Employer Contribution Requirements

**Option 1 - Match**: Match employee deferrals up to 3% of compensation
**Option 2 - Non-Elective**: Contribute 2% of compensation for ALL eligible employees

---

### Solo 401(k) (Individual 401(k))

**Best for**: Self-employed with no employees (except spouse)

#### 2026 Maximum Contribution

```
Employee Side: $24,500 (+ catch-up if applicable)
Employer Side: 25% of compensation (up to $72,000 total combined)

Maximum (under 50): $72,000
Maximum (age 60-63): $72,000 + $11,250 = $83,250
```

#### Advantages Over SEP

1. **Roth option** available
2. **Loan provision** possible
3. **Higher employee deferral** for lower income self-employed
4. **Catch-up contributions** allowed

#### When Solo 401(k) Beats SEP

| Net Self-Employment Income | SEP Max | Solo 401(k) Max |
|----------------------------|---------|-----------------|
| $50,000 | ~$10,000 | $24,500 |
| $100,000 | ~$20,000 | $37,500 |
| $200,000 | ~$40,000 | $64,500 |
| $290,000+ | $72,000 | $72,000 |

**Crossover point**: At ~$290,000+, SEP and Solo 401(k) are equivalent

---

## 4. Special Accounts

### Health Savings Account (HSA)

**Triple tax advantage**: Deductible contributions, tax-free growth, tax-free withdrawals for medical

#### 2026 Limits

| Coverage Type | Contribution | With Catch-Up (55+) |
|---------------|--------------|---------------------|
| Self-Only | $4,400 | $5,400 |
| Family | $8,750 | $9,750 |

**Requires**: High-Deductible Health Plan (HDHP)

See `hsa-retirement-vehicle.md` for the "stealth IRA" strategy

---

### Spousal IRA

**For**: Non-working spouse with earned income from working spouse

**Requirements**:
- File MFJ
- Working spouse has compensation ≥ combined IRA contributions
- Same limits as regular IRA ($7,500 + catch-up for 2026)

**Example**:
```
Sam earns $720,000
Sammie has $10,000 side income

Both can contribute $7,500 to IRAs in 2026
(Sam's income covers both contributions)
```

---

## 5. Trump Account (NEW - 2025)

**What**: New type of IRA for children born 2025-2028

**Key Features**:
- $1,000 government pilot contribution (one-time)
- Must be U.S. citizen child
- Parents/guardians can make additional contributions
- Announced in IRS Publication 590-A (2025)

**See Form 4547** for election procedures

---

## 6. Contribution Strategy Framework

### Priority Order for High Earners

1. **401(k) to employer match** (free money)
2. **HSA maximum** (triple tax benefit)
3. **Backdoor Roth IRA** (if over income limits)
4. **401(k) to max** ($24,500 + catch-up)
5. **Mega Backdoor Roth** (if plan allows after-tax contributions)
6. **Taxable brokerage** (still tax-advantaged via LTCG rates)

### For Self-Employed

1. **HSA maximum**
2. **Solo 401(k) or SEP IRA** to maximum
3. **Backdoor Roth IRA**
4. **Defined Benefit Plan** (for very high earners 50+)
5. **Taxable brokerage**

---

## 7. Key Deadlines Summary

| Account Type | Contribution Deadline |
|--------------|----------------------|
| Traditional/Roth IRA | April 15 (tax filing deadline) |
| 401(k)/403(b) Elective | December 31 |
| Solo 401(k) Employee | December 31 |
| Solo 401(k) Employer | Tax filing deadline + extensions |
| SEP IRA | Tax filing deadline + extensions |
| SIMPLE IRA | December 31 (employee) / March 1 (employer match) |
| HSA | April 15 (tax filing deadline) |

---

## 8. Maven Application

### For Advisors (Maven Pro)

When evaluating client's retirement savings:
1. Identify all available account types
2. Calculate maximum possible contributions
3. Optimize for tax efficiency (Roth vs Traditional)
4. Consider employer match and vesting
5. Coordinate across spouse's accounts
6. Plan multi-year contribution strategy

### Key Questions to Ask

- What retirement plans are available at work?
- Does employer offer Roth 401(k)?
- Is after-tax contribution allowed (mega backdoor)?
- Are you self-employed (full or side)?
- Do you have an HDHP (HSA eligible)?
- What's your expected tax bracket in retirement?

---

## Sources

- IRS Notice 2025-67 (2026 limits announcement)
- IRS Publication 590-A (2025)
- IRS.gov newsroom (November 13, 2025)
- Fidelity IRA Contribution Limits Guide
- Mercer Advisors 2026 Retirement Plan Limits
- WhiteCoatInvestor Retirement Contribution Limits

---

*Last Updated: 2026-02-06*
*Author: Eli (Maven Research)*
