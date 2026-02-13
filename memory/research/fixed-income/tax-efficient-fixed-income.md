# Fixed Income Deep Dive: Tax-Efficient Bond Investing

*Maven Research Document — Track 6: Priority Gap*
*Date: February 13, 2026*
*Author: Eli*

---

## Executive Summary

Fixed income investing requires careful consideration of tax implications. The difference between taxable and tax-free yields can significantly impact net returns. This document covers the essential knowledge for advisors to help clients optimize their fixed income allocations across Treasury, corporate, and municipal bonds.

**Key takeaways:**
- Municipal bonds provide meaningful tax advantages, especially for high-bracket investors
- Tax-equivalent yield calculations reveal when munis beat taxable alternatives
- Credit spreads indicate economic health and compensation for default risk
- Bond ladders manage interest rate risk and provide cash flow flexibility

---

## 1. Tax-Equivalent Yield: The Core Calculation

### What Is Tax-Equivalent Yield?

Tax-equivalent yield (TEY) allows investors to compare tax-free municipal bond yields with taxable bond yields on an apples-to-apples basis. The formula is:

**TEY = Municipal Bond Yield ÷ (1 - Marginal Tax Rate)**

This calculation reveals what a taxable bond would need to yield to match the after-tax return of a tax-free muni.

### The Formula in Practice

Consider an investor in the 37% federal tax bracket (plus 3.8% NIIT = 40.8% combined):

| Muni Yield | TEY Calculation | TEY Result |
|------------|-----------------|-------------|
| 3.0% | 3.0% ÷ (1 - 0.408) | 5.07% |
| 4.0% | 4.0% ÷ (1 - 0.408) | 6.76% |
| 5.0% | 5.0% ÷ (1 - 0.408) | 8.45% |

**Interpretation:** A 4% muni yielding 6.76% on a tax-equivalent basis beats a 5% corporate bond for this investor.

### Tax Rates That Matter

| Tax Bracket (2025-2026) | Combined Rate (w/ 3.8% NIIT) | Multiplier |
|-------------------------|------------------------------|------------|
| 10% | 13.8% | 1.160 |
| 12% | 15.8% | 1.188 |
| 22% | 25.8% | 1.348 |
| 24% | 27.8% | 1.385 |
| 32% | 35.8% | 1.558 |
| 35% | 38.8% | 1.634 |
| 37% | 40.8% | 1.688 |

**Higher tax brackets = larger multiplier = more advantage for munis**

### Including State Taxes

For state-specific munis, include the state tax rate in your denominator:

**TEY (State Muni) = Muni Yield ÷ (1 - Federal Rate - State Rate)**

Example: California investor at 37% federal + 13.3% state + 3.8% NIIT = 54.1% combined:

4% California muni TEY = 4% ÷ (1 - 0.541) = **8.71%**

This is why high-tax-state investors often favor in-state munis exclusively.

---

## 2. Municipal Bonds: Types and Tax Treatment

### General Obligation (GO) vs. Revenue Bonds

| Feature | General Obligation (GO) | Revenue Bonds |
|---------|------------------------|---------------|
| Backed by | Full taxing power of issuer | Specific project revenue |
| Credit risk | Generally lower | Varies by project |
| Typical yield | Lower (safer) | Higher (riskier) |
| Default history | Rare | Occasional |

**GO bonds** are backed by the issuer's general credit and taxing power—considered safer.
**Revenue bonds** pay from specific project cash flows (tolls, utilities, hospitals)—higher yields, more risk.

### Tax Exemptions Breakdown

| Tax Type | Federal | State (In-State) | State (Out-of-State) |
|----------|---------|------------------|---------------------|
| Interest income | ✓ Exempt | ✓ Exempt | ✗ Taxable |
| Capital gains | ✗ Taxable* | Varies | Varies |
| AMT | May apply | N/A | N/A |
| NIIT | Exempt** | Exempt | Taxable |

*Unless purchased at significant discount (Original Issue Discount rules apply)
**Muni interest included in MAGI for Social Security taxation

### AMT Implications

- **Private activity munis** trigger AMT for high-income investors
- Most "retail" munis are not subject to AMT
- California, New York, Connecticut investors should verify AMT status

### Key Tax Rules

1. **Original Issue Discount (OID):** Munis purchased at deep discounts may have taxable OID interest
2. **Market Discount:** Gains on munis purchased below par may be capital gains (preferential rates apply)
3. **Defaulted Bonds:** Taxable as ordinary income if interest is skipped

---

## 3. Treasury Bonds: SALT Deduction and Tax Treatment

### Federal Tax Treatment

| Feature | Treatment |
|---------|-----------|
| Interest income | Fully taxable federally |
| Capital gains | Preferential rates (0%, 15%, 20%) |
| NIIT | Subject to 3.8% NIIT |
| State/local tax | Fully deductible (SALT) up to $10,000 |

### The SALT Deduction Advantage

Unlike corporate bond interest, Treasury interest is **fully deductible** for state income tax purposes (subject to the $10,000 SALT cap from TCJA).

**Example:** New York investor at 6.85% state tax + 37% federal + 3.8% NIIT:

| Bond Type | Pre-Tax Yield | After-Tax Yield |
|-----------|---------------|-----------------|
| Treasury 5% | 5.00% | 5.00% × (1 - 0.478) = **2.61%** |
| Corporate 5.5% | 5.50% | 5.50% × (1 - 0.478) = **2.87%** |

**But the SALT deduction changes the math:**

Treasury deduction benefit: 5% × 0.0685 (state rate) = 0.34% effective benefit
Adjusted Treasury yield: 2.61% + 0.34% = **2.95%**

This narrows but doesn't eliminate the spread advantage for corporates.

### Treasury vs. Muni Comparison

| Factor | Treasury | Muni (Federal Only) | Muni (In-State) |
|--------|----------|---------------------|-----------------|
| Federal tax | Fully taxable | Exempt | Exempt |
| State tax | Deductible | Exempt (in-state) | Taxable |
| NIIT | Applies | Exempt | Exempt |
| Liquidity | Highest | High | Moderate |
| Safety | Highest | Very high | Very high |

---

## 4. Corporate Bonds: Credit Spreads and Risk

### Understanding Credit Spreads

A **credit spread** is the yield difference between a corporate bond and a comparable Treasury:

**Credit Spread = Corporate Bond Yield - Treasury Yield**

Spreads compensate investors for:
- **Default risk** (possibility of non-payment)
- **Credit risk** (rating downgrade risk)
- **Liquidity risk** (harder to sell than Treasuries)

### Current Spread Environment (2025-2026)

| Rating | Typical Spread Range | Current Market |
|--------|---------------------|----------------|
| AAA | 40-80 bps | ~50 bps |
| AA | 60-100 bps | ~75 bps |
| A | 80-140 bps | ~100 bps |
| BBB | 120-200 bps | ~150 bps |
| BB (High Yield) | 300-500 bps | ~400 bps |
| B (High Yield) | 500-800 bps | ~650 bps |

**Source:** Bloomberg indices, St. Louis Fed data, as of late 2025

### Investment-Grade vs. High-Yield

| Metric | Investment-Grade | High-Yield |
|--------|-----------------|------------|
| Default rate (normal) | <0.1% annually | 2-5% annually |
| Spread vs. Treasuries | 100-150 bps | 400-600 bps |
| Correlation to stocks | Low | Moderate-High |
| Recovery rate (default) | 40-60% | 25-40% |

### Spread as Economic Indicator

**Widening spreads** = Market concern about economy/credit quality
**Narrowing spreads** = Economic optimism, risk appetite

Historical spread spikes preceded:
- 2008 Financial Crisis
- 2020 COVID crash
- 2022 rate shock

### Credit Quality Trends (2025-2026)

Positive signs for investment-grade:
- A-rated issuers now 46% of Bloomberg Corporate Index (up from 33% in 2019)
- Baa-rated issuers 45% (down from 52% in 2019)
- Corporate profits near all-time highs (~$3.9 trillion)
- Strong balance sheets with ample liquidity

Concerns:
- Some elevated defaults in high-yield space
- Rising corporate debt supply (AI infrastructure buildout)
- Regional bank stress affecting loan markets

---

## 5. Bond Ladders: Construction and Tax Management

### What Is a Bond Ladder?

A bond ladder is a portfolio of bonds with staggered maturities:

**Example $500K Ladder:**
| Maturity | Amount | Approximate Yield (2025) |
|----------|--------|-------------------------|
| 1 year | $100K | 4.5% |
| 2 years | $100K | 4.3% |
| 3 years | $100K | 4.2% |
| 4 years | $100K | 4.3% |
| 5 years | $100K | 4.4% |

### Benefits of Laddering

1. **Interest rate risk management:** As bonds mature, you can reinvest at current rates
2. **Cash flow planning:** Predictable maturity schedule
3. **Liquidity:** Regular maturities provide accessible cash
4. **Reinvestment flexibility:** Choose to redeploy or spend

### Tax-Managed Ladder Construction

**Step 1: Determine tax bracket and muni eligibility**
- Check federal and state tax brackets
- Verify in-state muni availability

**Step 2: Asset location decision**

| Account Type | Recommended Holdings |
|--------------|---------------------|
| Taxable | Munis (especially in-state), Treasury (SALT benefit) |
| Tax-advantaged (401k/IRA) | Corporates (high yield), high-yield bonds |

**Step 3: Ladder design by account**

**Taxable Account Example:**
- Short-term (1-3 yr): Treasury bills/notes (liquidity + SALT)
- Intermediate (4-7 yr): In-state munis (tax-free income)
- Long-term (8-15 yr): Taxable munis or high-quality corporates

**Tax-Advantaged Account Example:**
- Focus on yield, not tax efficiency
- Investment-grade or high-yield corporates
- Longer maturities for higher yields

### Duration Management

**Duration** measures interest rate sensitivity:
- 2-year bond: ~2 years duration
- 10-year bond: ~8 years duration
- 30-year bond: ~15-20 years duration

**Duration management rules:**
- Rising rates: Shorten duration (maturities sooner, reinvest at higher rates)
- Falling rates: Lengthen duration (lock in higher yields)
- Uncertain rates: Moderate duration (5-7 years)

---

## 6. State-Specific Municipal Bond Analysis

### High-Tax State Comparison

| State | Top Marginal Rate | Muni Tax Treatment | TEY Multiplier (w/ 37% Fed) |
|-------|-------------------|---------------------|------------------------------|
| California | 13.3% | Exempt if CA bond | 1.688 × (1 - 0.133) = **1.46** |
| New York | 10.9% | Exempt if NY bond | 1.688 × (1 - 0.109) = **1.50** |
| New Jersey | 10.75% | Exempt if NJ bond | 1.688 × (1 - 0.108) = **1.51** |
| Connecticut | 6.99% | Exempt if CT bond | 1.688 × (1 - 0.070) = **1.61** |
| Texas | 0% | Any muni exempt | 1.688 (federal only) |
| Florida | 0% | Any muni exempt | 1.688 (federal only) |

**Example:** A 4% California muni for a 37% bracket investor equals an 8.18% taxable yield—remarkable.

### California Municipal Bonds

**Advantages:**
- Triple tax-free (federal + state + often local)
- Large, liquid market
- Diverse issuer base (state, cities, utilities, universities)

**Considerations:**
- Some CA munis subject to AMT
- Higher yields than federal-only munis
- Limited availability in intermediate/long maturities sometimes

### New York Municipal Bonds

**Advantages:**
- Triple tax-free for NY residents
- Very large, liquid market
- Broad issuer diversity

**Considerations:**
- NYC local taxes add another layer of benefit
- Some AMT exposure on certain bonds
- Premium pricing due to high demand

### Texas and Florida

**Advantages:**
- No state income tax = any muni is double tax-free
- Strong economy supports issuer credit
- Lower pricing than CA/NY munis

**Considerations:**
- Lower yields reflect tax advantage
- Still get federal tax exemption benefit

### State-Specific Yield Spreads

| State Muni vs. National Muni | Typical Spread |
|------------------------------|----------------|
| California | +20-50 bps |
| New York | +15-40 bps |
| New Jersey | +25-60 bps |
| Connecticut | +15-40 bps |
| Texas/Florida | -10 to +10 bps |

---

## 7. Practical Client Recommendations

### By Tax Bracket

| Bracket | Recommendation |
|---------|----------------|
| 10-12% | Consider Treasury/TIPS for liquidity; munis marginal benefit |
| 22-24% | Moderate muni allocation; compare TEY to corporates |
| 32-35% | Significant muni benefit; 50%+ of taxable fixed income |
| 37% | Strong muni case; especially in-state for high-tax states |

### By Account Type

| Account | Bond Type | Rationale |
|---------|-----------|-----------|
| Taxable brokerage | Munis, Treasury | Tax efficiency |
| Traditional IRA/401k | Corporates | Yield priority, no tax drag |
| Roth IRA | Any | Tax-free growth anyway |
| Taxable + High SALT | Treasury | SALT deduction valuable |

### Decision Framework

**Step 1: Calculate your TEY threshold**
- For your marginal rate, what taxable yield equals your best muni option?

**Step 2: Compare available yields**
- Treasury: ~4-5% (2025-2026)
- Investment-grade corporate: ~5-5.5%
- Muni (national): ~3-4%
- Muni (state-specific): ~3.5-4.5%

**Step 3: Make the call**

Example for 37% bracket investor:
- 4% state muni TEY = 6.76%
- Corporate at 5.3% beats the muni
- Corporate at 5.0% loses to the muni

---

## 8. Maven Product Implications

### Feature Ideas

1. **Tax-Equivalent Yield Calculator**
   - Input: Bond yield, tax bracket, state
   - Output: TEY, recommendation

2. **Asset Location Optimizer**
   - Input: Holdings by account, tax brackets
   - Output: Recommended reallocation for tax efficiency

3. **Fixed Income Analysis Dashboard**
   - Credit quality breakdown
   - Duration and ladder visualization
   - Tax drag calculation

4. **Muni Bond Scanner**
   - Filter by state, rating, maturity, yield
   - Compare to taxable alternatives

5. **Bond Ladder Builder**
   - Input: Total amount, duration preference, account types
   - Output: Recommended ladder with specific securities

---

## Sources

- IRS Publications 550 (Investment Income), 1212 (Original Issue Discount)
- IRS Notice 2025-67 (2026 inflation adjustments)
- One Big Beautiful Bill Act (OBBBA) — P.L. 119-21
- Bloomberg, ICE BofA, St. Louis Fed (FRED) data
- American Century Investments research
- Charles Schwab Fixed Income Outlook (2026)
- Investopedia tax-equivalent yield guides
- Hartford Funds muni education materials
- Moody's Investors Service rating definitions
- Tax Foundation state tax rate data

---

*This document is for educational purposes and does not constitute legal or tax advice. Consult qualified professionals for specific situations.*

*Maven Research — Fixed Income Track — February 2026*
