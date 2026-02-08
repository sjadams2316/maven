# Fixed Income Deep Dive for Wealth Management

*Last Updated: February 2026*  
*Primary Sources: IRS Publications, TreasuryDirect, MSRB, Fidelity, Vanguard, Schwab*

---

## Table of Contents
1. [Treasury Securities](#1-treasury-securities)
2. [Corporate Bonds](#2-corporate-bonds)
3. [Municipal Bonds](#3-municipal-bonds)
4. [Bond Mechanics](#4-bond-mechanics)
5. [Preferred Stock](#5-preferred-stock)

---

## 1. Treasury Securities

### Overview

U.S. Treasury securities are debt obligations issued by the U.S. Department of the Treasury and backed by the "full faith and credit" of the U.S. government. They are considered the safest fixed-income investments in the world.

### Types of Treasury Securities

| Type | Maturity | Interest Payment | Minimum Purchase |
|------|----------|------------------|------------------|
| Treasury Bills (T-Bills) | 4, 8, 13, 17, 26, 52 weeks | Sold at discount; "interest" is difference between purchase price and face value | $100 |
| Treasury Notes (T-Notes) | 2, 3, 5, 7, 10 years | Semiannual fixed coupon | $100 |
| Treasury Bonds (T-Bonds) | 20, 30 years | Semiannual fixed coupon | $100 |
| TIPS | 5, 10, 30 years | Semiannual (on inflation-adjusted principal) | $100 |
| FRNs | 2 years | Quarterly (floating rate based on 13-week T-Bill) | $100 |

### Taxation of Treasury Securities

#### Federal Tax Treatment
- **All Treasury interest is subject to federal income tax** at ordinary income rates
- Interest is reported on Form 1099-INT (for notes, bonds, TIPS, FRNs)
- For T-Bills, the "interest" is the difference between the discounted purchase price and face value at maturity

#### State and Local Tax Exemption (SALT)
**Per IRS Topic No. 403 and 31 U.S.C. § 3124:**
> "Interest income from Treasury bills, notes and bonds is subject to federal income tax but is **exempt from all state and local income taxes**."

This exemption applies to:
- T-Bills (the discount earned)
- T-Notes interest
- T-Bonds interest
- TIPS interest AND inflation adjustments
- FRN interest
- Distributions from Treasury-focused ETFs and money market funds (proportionally)

**Practical Application:**
For a California resident (13.3% top rate) holding a Treasury yielding 4.5%:
- Taxable equivalent yield vs. corporate bond = 4.5% ÷ (1 - 0.133) = **5.19%**

### TIPS: The Phantom Income Problem

#### How TIPS Work
Treasury Inflation-Protected Securities adjust their principal based on changes in the Consumer Price Index (CPI-U). At maturity, you receive the greater of the inflation-adjusted principal or the original principal.

#### Taxation of TIPS (IRS Publication 1212 & 26 CFR § 1.1275-7)

TIPS create **two types of taxable income:**

1. **Coupon Interest** - The semiannual interest payment (reported on Form 1099-INT)
2. **Inflation Adjustment** - Any increase in principal is treated as Original Issue Discount (OID) and taxed as **ordinary income in the year it accrues**, even though you don't receive the cash until maturity (reported on Form 1099-OID)

**The Phantom Income Problem:**
```
Example: $10,000 TIPS, 2% coupon, 3% inflation

Year 1 Income:
- Coupon payment: $10,000 × 2% = $200 (cash received)
- Inflation adjustment: $10,000 × 3% = $300 (NO cash received)
- Total taxable income: $500

Tax owed (37% bracket): $185
But cash received: only $200
Net after-tax cash flow: $15
```

**Deflation Treatment:**
- Principal adjustments can be negative during deflationary periods
- Negative adjustments reduce the amount of interest otherwise includible in income
- At maturity, you receive at least your original principal (floor protection)

**Solutions to Phantom Income:**
1. **Hold TIPS in tax-advantaged accounts** (IRA, 401(k)) - most common recommendation
2. **Use TIPS mutual funds/ETFs** - fund handles tax reporting, dividends provide cash for taxes
3. **Pair with I-Bonds** for taxable accounts - I-Bond inflation adjustments are tax-deferred until redemption

### Treasury Auction Process

#### How Auctions Work (TreasuryDirect)

**Announcement → Auction → Settlement**

1. **Announcement** (typically 1 week before auction)
   - Security type and amount offered
   - Auction date, issue date, maturity date
   - Bidding deadlines

2. **Bidding Types**

| Bid Type | Description | Maximum | Who Can Bid |
|----------|-------------|---------|-------------|
| **Non-Competitive** | Accept whatever rate is determined | $10 million per auction | Anyone via TreasuryDirect, banks, brokers |
| **Competitive** | Specify the rate/yield you'll accept | 35% of offering | Institutions via TAAPS, banks, brokers |

3. **Auction Mechanics (Single-Price Auction)**
   - All non-competitive bids accepted first (guaranteed fill)
   - Competitive bids accepted from lowest yield to highest until offering is filled
   - **All winning bidders receive the same rate** (highest accepted competitive rate)
   - This is called the "stop" or "high rate"

**Auction Schedule:**
- **T-Bills:** Weekly (4-week and 8-week every Monday; 13-week and 26-week every Monday; 52-week every 4 weeks)
- **T-Notes:** Monthly (2-year, 5-year monthly; 3-year, 7-year, 10-year quarterly with reopenings)
- **T-Bonds:** Monthly (20-year quarterly; 30-year quarterly with reopenings)
- **TIPS:** Quarterly (5-year in April, Oct; 10-year in Jan, July with reopenings; 30-year in Feb with reopening)

**Pricing Concepts:**
- **High Rate/Yield:** The highest accepted competitive bid rate
- **Bid-to-Cover Ratio:** Total bids ÷ amount offered (higher = more demand)
- **Price:** Calculated based on yield; can be above par (premium) or below (discount)

---

## 2. Corporate Bonds

### Credit Ratings and Yield Spreads

#### Rating Agency Scales

| Category | Moody's | S&P | Fitch | Description |
|----------|---------|-----|-------|-------------|
| **Investment Grade** |
| Highest quality | Aaa | AAA | AAA | Minimal credit risk |
| High quality | Aa1/Aa2/Aa3 | AA+/AA/AA- | AA+/AA/AA- | Very low credit risk |
| Upper medium | A1/A2/A3 | A+/A/A- | A+/A/A- | Low credit risk |
| Medium grade | Baa1/Baa2/Baa3 | BBB+/BBB/BBB- | BBB+/BBB/BBB- | Moderate credit risk |
| **Below Investment Grade (High Yield/Junk)** |
| Speculative | Ba1/Ba2/Ba3 | BB+/BB/BB- | BB+/BB/BB- | Substantial credit risk |
| Highly speculative | B1/B2/B3 | B+/B/B- | B+/B/B- | High credit risk |
| Extremely speculative | Caa1/Caa2/Caa3 | CCC+/CCC/CCC- | CCC+/CCC/CCC- | Very high credit risk |
| Default imminent | Ca/C | CC/C | CC/C | Near or in default |
| In default | C | D | D | Default |

**Key Threshold:** BBB-/Baa3 is the dividing line between investment grade and high yield.

#### Yield Spreads (Credit Spreads)

The yield spread is the additional yield over comparable Treasury securities that compensates investors for credit risk.

**Typical Spread Ranges (basis points over Treasuries):**

| Rating | Normal Environment | Stressed Environment |
|--------|-------------------|---------------------|
| AAA | 20-50 bps | 80-150 bps |
| AA | 40-80 bps | 100-200 bps |
| A | 60-120 bps | 150-300 bps |
| BBB | 100-200 bps | 250-500 bps |
| BB | 200-350 bps | 400-800 bps |
| B | 350-550 bps | 700-1200 bps |
| CCC and below | 600+ bps | 1000+ bps |

### Investment Grade vs. High Yield

| Characteristic | Investment Grade | High Yield |
|----------------|------------------|------------|
| Credit rating | BBB-/Baa3 or higher | BB+/Ba1 or lower |
| Default rate (historical) | ~0.1% annually | ~3-5% annually |
| Recovery rate (if default) | 40-60% | 25-45% |
| Correlation with stocks | Lower | Higher |
| Interest rate sensitivity | Higher | Lower (spread dominates) |
| Typical yield pickup | N/A | 200-400+ bps over IG |
| Appropriate allocation | Core fixed income | Satellite/diversifier |

### Corporate Bond Risks

#### 1. Credit Risk (Default Risk)
- Risk that the issuer cannot make interest or principal payments
- Mitigated by: diversification, credit analysis, sticking to investment grade

#### 2. Interest Rate Risk
- Bond prices fall when interest rates rise
- Longer maturities = more interest rate risk
- Measured by duration (see Section 4)

#### 3. Call Risk (Reinvestment Risk)
- Many corporate bonds are callable (issuer can redeem early)
- Typically called when rates fall (worst time for investor)
- Look for **non-callable bonds** or bonds with long call protection
- Call features include:
  - **Make-whole call:** Issuer pays present value at a spread to Treasuries (expensive to call)
  - **Par call:** Can be called at 100 after certain date
  - **Declining call schedule:** Call price decreases over time

**Bond Ladder Strategy:** Use non-callable bonds to avoid reinvestment risk and maintain predictable cash flows.

#### 4. Liquidity Risk
- Corporate bonds trade over-the-counter with wider bid-ask spreads
- Smaller issues and lower-rated bonds have less liquidity
- Can be significant during market stress

#### 5. Event Risk
- Credit rating changes, mergers, leveraged buyouts
- Can cause sudden price changes

### Taxation of Corporate Bonds

**All corporate bond income is taxable as ordinary income:**
- Interest payments: ordinary income (reported on Form 1099-INT)
- OID (original issue discount): ordinary income as it accrues
- Market discount: ordinary income at sale/redemption (or can elect to accrue annually)
- Capital gains/losses: if sold before maturity at different price than adjusted basis

**Tax Rates (2025):**
- Ordinary income rates apply: 10%, 12%, 22%, 24%, 32%, 35%, 37%
- Plus 3.8% Net Investment Income Tax (NIIT) for high earners
- **Maximum effective rate on corporate bond interest: 40.8%**

**State and Local Taxes:**
- Corporate bond interest IS subject to state and local income tax (unlike Treasuries)

---

## 3. Municipal Bonds

### General Obligation (GO) vs. Revenue Bonds

#### General Obligation Bonds

**Backed by:** The "full faith and credit" and taxing power of the issuing government

**Security:**
- Unlimited tax GO: Issuer can raise taxes without limit to pay debt
- Limited tax GO: Tax increases capped; slightly riskier

**Typical Issuers:** States, counties, cities, school districts

**Credit Factors:**
- Tax base diversity and stability
- Economic conditions
- Debt levels relative to tax base
- Management quality
- Fund balance/reserves

#### Revenue Bonds

**Backed by:** Specific revenue stream from the project financed

**Types and Revenue Sources:**
| Type | Revenue Source |
|------|----------------|
| Water/Sewer | Utility fees |
| Toll roads/bridges | Tolls |
| Airport | Landing fees, concessions |
| Hospital | Patient revenues |
| Higher education | Tuition, fees, auxiliary |
| Electric utility | Rate payers |
| Housing | Mortgage payments, rents |

**Key Metrics:**
- **Debt Service Coverage Ratio (DSCR):** Net revenues ÷ debt service (want > 1.25x)
- **Rate covenant:** Promise to maintain rates sufficient to cover debt service

**General Rule:** GO bonds are typically considered safer than revenue bonds, but well-secured revenue bonds from essential services can be very strong credits.

### AMT Implications (Private Activity Bonds)

#### What Are Private Activity Bonds (PABs)?

Municipal bonds where proceeds benefit private entities (≥10% private use). Examples:
- Airport bonds (airline terminals)
- Solid waste disposal facilities
- Sports stadiums
- Industrial development bonds
- 501(c)(3) hospital and university bonds

#### AMT Treatment

**Per IRS and MSRB:**
> "Interest on qualified Private Activity Bonds (PAB) is included as income by taxpayers in calculating the Alternative Minimum Tax (AMT)."

**Exceptions (NOT subject to AMT):**
- Qualified 501(c)(3) bonds
- Bonds for residential rental projects
- Bonds for mortgage revenue programs (first-time homebuyers)
- Refunding bonds for pre-1986 bonds

#### Who Needs to Care About AMT Bonds?

**2025 AMT Parameters:**
| Filing Status | Exemption | Phase-out Begins | Phase-out Complete |
|--------------|-----------|------------------|-------------------|
| Married Filing Jointly | $133,300 | $1,252,700 | $1,785,900 |
| Single | $85,700 | $626,350 | $969,150 |

**Practical Guidance:**
- Post-TCJA (2017), far fewer taxpayers are subject to AMT
- Higher exemptions and phase-out thresholds mean AMT is primarily a concern for high earners with large SALT deductions and ISO stock options
- If not subject to AMT, PAB interest is fully tax-exempt
- Check with tax advisor; if AMT is a concern, filter for non-AMT bonds

### Tax-Equivalent Yield Formula

To compare municipal bond yields to taxable alternatives:

**Basic Formula:**
```
Tax-Equivalent Yield = Municipal Yield ÷ (1 - Marginal Tax Rate)
```

**Including State Taxes (for in-state munis):**
```
Tax-Equivalent Yield = Municipal Yield ÷ (1 - Federal Rate - State Rate + (Federal Rate × State Rate))

Simplified (for high earners with SALT cap):
Tax-Equivalent Yield ≈ Municipal Yield ÷ (1 - Federal Rate - State Rate)
```

#### Examples

**Example 1: Federal Only (Florida resident, no state income tax)**
- Muni yield: 3.50%
- Federal rate: 37%
- Tax-equivalent yield: 3.50% ÷ (1 - 0.37) = **5.56%**

**Example 2: In-State Muni (California resident)**
- Muni yield: 3.00% (CA muni)
- Federal rate: 37%
- State rate: 13.3%
- Combined rate: 37% + 13.3% = 50.3%
- Tax-equivalent yield: 3.00% ÷ (1 - 0.503) = **6.04%**

**Example 3: Out-of-State Muni (California resident buying NY muni)**
- Muni yield: 3.20%
- Federal rate: 37% (still exempt)
- State rate: 13.3% (NOT exempt - must pay CA tax on NY muni)
- Tax-equivalent yield (vs fully taxable): 3.20% ÷ (1 - 0.37) = **5.08%**
- After-state-tax yield: 3.20% × (1 - 0.133) = **2.77%**

### State-Specific Analysis

#### California

**State Income Tax Rate:** Up to 13.3% (highest in nation)
**Market Size:** Largest muni market (~14% of total outstanding)
**Credit Quality:** Mostly AA and A rated issuers

**When to Buy CA Munis:**
- High earners in CA benefit significantly from double tax exemption
- CA has large, diverse market with many issuers
- For top bracket taxpayers, in-state generally preferred

**Yield Breakeven (per Schwab analysis):**
Out-of-state munis need to yield ~39 basis points MORE than CA munis to match after-tax returns for top-bracket CA residents.

#### New York

**State Income Tax Rate:** Up to 10.9%
**NYC Additional Tax:** Up to 3.876% (total can exceed 14%)
**Market Size:** Second largest (~10% of total)

**When to Buy NY Munis:**
- NYC residents face triple tax exemption opportunity (federal + state + city)
- Very compelling for NYC residents at top brackets
- Large, diverse market

**Yield Breakeven:** Out-of-state needs ~29+ bps more for state-only; much more for NYC residents.

#### New Jersey

**State Income Tax Rate:** Up to 10.75%
**Market Size:** Smaller market
**Credit Quality:** Lower average ratings; state itself has struggled

**When to Buy NJ Munis:**
- Tax benefit is significant but market is smaller with concentration risk
- Consider national diversification despite tax cost
- Yield breakeven: ~33 bps for out-of-state

#### Texas

**State Income Tax:** NONE
**Market Size:** Third largest muni market

**When to Buy TX Munis:**
- **No state tax benefit to staying in-state**
- Should invest nationally for better diversification
- Focus on credit quality and yield, not state of issuance

#### Florida

**State Income Tax:** NONE
**Market Size:** Large market

**When to Buy FL Munis:**
- Same as Texas: no state tax benefit
- Invest nationally
- FL munis may still be attractive on credit/yield basis

#### Summary Table

| State | Top Rate | Market Size | Recommendation |
|-------|----------|-------------|----------------|
| California | 13.3% | Very Large | In-state for high earners |
| New York | 10.9%+ | Very Large | In-state, especially NYC |
| New Jersey | 10.75% | Medium | Consider national despite tax |
| Texas | 0% | Large | National diversification |
| Florida | 0% | Large | National diversification |
| Illinois | 4.95% | Large | Complex; IL taxes own bonds sometimes |

**General Rule from Schwab:**
> "We generally suggest investors in all states other than New York and California consider munis outside of their home state."

Even CA/NY investors not in top brackets may benefit from national diversification.

### De Minimis Rule for Discount Bonds

#### The Rule (IRS)

When you buy a municipal bond at a discount greater than the **de minimis threshold**, the discount portion is taxed as **ordinary income** (not tax-exempt) when the bond matures or is sold.

**De Minimis Threshold:**
```
De Minimis Amount = 0.25% × Face Value × Years to Maturity
```

**Or equivalently, the De Minimis Purchase Price:**
```
De Minimis Price = Face Value - (0.25% × Face Value × Years to Maturity)
```

#### Examples

**Example 1: 10-Year Bond at $1,000 Par**
- De minimis amount: 0.25% × $1,000 × 10 = $25
- De minimis price: $1,000 - $25 = **$975**
- Buy at $976: discount ($24) treated as capital gain ✓
- Buy at $974: discount ($26) treated as **ordinary income** ✗

**Example 2: 5-Year Bond at $1,000 Par**
- De minimis amount: 0.25% × $1,000 × 5 = $12.50
- De minimis price: **$987.50**

**De Minimis Thresholds for $10,000 Face Value:**

| Years to Maturity | De Minimis Price |
|-------------------|------------------|
| 1 | $9,975 |
| 5 | $9,875 |
| 10 | $9,750 |
| 15 | $9,625 |
| 20 | $9,500 |
| 25 | $9,375 |
| 30 | $9,250 |

#### Tax Treatment Summary

| Discount Size | Tax Treatment at Maturity/Sale |
|---------------|-------------------------------|
| ≤ De minimis | Capital gain (0%/15%/20%) |
| > De minimis | **Ordinary income** (up to 37%+) |

#### Why This Matters

In today's environment with many bonds trading at discounts (due to rate increases since 2021), **roughly 40% of investment-grade munis trade at discounts.**

**Recommendation:** Prefer bonds trading at or above par to avoid de minimis complications. If buying at discount, understand the tax implications.

**PIMCO Note:**
> "For a discounted municipal security purchased at a price below the de minimis threshold, price accretion is subject to the ordinary income tax rate (40.8% for top earners)."

---

## 4. Bond Mechanics

### Duration Explained

#### What Is Duration?

Duration measures a bond's sensitivity to interest rate changes. It represents the approximate percentage change in bond price for a 1% change in interest rates.

**Key Principle:** Duration is expressed in years but is NOT the same as maturity. It rolls up maturity, coupon rate, and yield into a single risk measure.

#### Types of Duration

| Type | Definition | Use |
|------|------------|-----|
| **Macaulay Duration** | Weighted average time to receive cash flows | Theoretical measure |
| **Modified Duration** | Macaulay Duration ÷ (1 + yield/n) | Price sensitivity measure |
| **Effective Duration** | Used for bonds with embedded options | Most practical for callable bonds |

#### Factors Affecting Duration

| Factor | Effect on Duration |
|--------|-------------------|
| Longer maturity | ↑ Higher duration |
| Higher coupon | ↓ Lower duration |
| Higher yield | ↓ Slightly lower duration |
| Callable feature | ↓ Lower effective duration |

**Zero-coupon bonds:** Duration = Maturity (no interim cash flows to shorten it)

#### Duration Examples

| Bond Type | Approximate Duration |
|-----------|---------------------|
| Money market | 0-0.25 years |
| 2-year Treasury | ~1.9 years |
| 5-year Treasury | ~4.5 years |
| 10-year Treasury | ~8.5 years |
| 30-year Treasury | ~18 years |
| 30-year zero-coupon | 30 years |

#### Using Duration (Fidelity)

**Quick Estimate:**
```
% Price Change ≈ -Duration × Change in Yield
```

**Example:**
- Bond with 8-year duration
- Interest rates rise 1%
- Expected price change: -8 × 1% = **-8%**

**Rates Fall Instead:**
- Rates fall 1%
- Expected price change: -8 × (-1%) = **+8%**

### Convexity Explained

#### What Is Convexity?

Convexity measures the **curvature** of the price-yield relationship. Duration gives a linear approximation; convexity corrects for the non-linear relationship.

**Key Insight:** The price-yield relationship is actually curved, not straight. Convexity captures this curvature.

#### Why Convexity Matters

1. **Duration underestimates gains** when rates fall significantly
2. **Duration overestimates losses** when rates rise significantly
3. **Positive convexity** is beneficial to bondholders

**Per Fidelity:**
> "Duration may provide a good estimate of the potential price impact of small and sudden changes in interest rates... it may be less effective for assessing the impact of large changes in rates."

#### Convexity Characteristics

| Factor | Effect on Convexity |
|--------|-------------------|
| Longer duration | ↑ Higher convexity |
| Lower coupon | ↑ Higher convexity |
| Non-callable | ↑ Positive convexity |
| Callable | ↓ Negative convexity possible |

**Callable Bond Problem:** As rates fall, callable bonds have **negative convexity** because the call option limits upside (price won't rise much above call price).

### Bond Ladders: Construction and Purpose

#### What Is a Bond Ladder?

A portfolio of bonds with staggered maturities (the "rungs" of the ladder). As each bond matures, proceeds are reinvested at the long end to maintain the structure.

#### Example Ladder Structure

**10-Year Ladder with $100,000:**
| Rung | Maturity | Amount | Yield |
|------|----------|--------|-------|
| 1 | 1 year | $10,000 | 4.50% |
| 2 | 2 years | $10,000 | 4.45% |
| 3 | 3 years | $10,000 | 4.40% |
| 4 | 4 years | $10,000 | 4.35% |
| 5 | 5 years | $10,000 | 4.30% |
| 6 | 6 years | $10,000 | 4.25% |
| 7 | 7 years | $10,000 | 4.20% |
| 8 | 8 years | $10,000 | 4.15% |
| 9 | 9 years | $10,000 | 4.10% |
| 10 | 10 years | $10,000 | 4.05% |

Each year, the 1-year bond matures and proceeds are invested in a new 10-year bond.

#### Benefits of Bond Ladders (Per Fidelity)

1. **Predictable income stream** - Know when bonds mature and when cash flows arrive
2. **Interest rate risk management** - Regular reinvestment averages out rate changes
3. **Liquidity** - Regular maturities provide access to cash without selling
4. **Flexibility** - Can reinvest maturing proceeds based on current conditions
5. **Reduced reinvestment risk** - Not all money reinvested at once

#### Construction Guidelines

| Guideline | Recommendation |
|-----------|---------------|
| Minimum investment | $100,000+ for individual bonds; less for CDs/Treasuries |
| Number of rungs | At least 5-10 for adequate diversification |
| Bond quality | Investment grade; AA or better recommended |
| Callable bonds | Avoid - disrupts predictability |
| Diversification | 10+ different issuers for corporate/muni; 1 is fine for Treasuries |

**Per Fidelity:**
> "It may make sense to have at least $350,000 toward the bond portion of your investment mix if you're going to invest in individual bonds containing credit risk."

For smaller amounts: Consider Treasury or CD ladders where credit risk is minimal.

### Yield Curve Strategies

#### Normal Yield Curve (Upward Sloping)

Short-term rates lower than long-term rates. Typical in healthy economies.

**Strategies:**
- **Buy and hold:** Capture full yield on long-end
- **Ride the curve:** Buy longer bonds, sell before maturity as they "roll down" the curve
- **Barbell:** Concentrate in short and long maturities, skip middle

#### Flat Yield Curve

Little difference between short and long rates. Often signals economic uncertainty.

**Strategies:**
- **Short-duration:** Why take duration risk for no additional yield?
- **Flexibility:** Stay liquid for when curve normalizes

#### Inverted Yield Curve

Short-term rates higher than long-term. Often precedes recessions.

**Strategies:**
- **Short-duration focus:** Capture higher short rates
- **Lock in long rates:** If expecting rate cuts, buy long bonds before rates fall
- **Ladder:** Provides balance if uncertain about direction

#### Barbell vs. Bullet vs. Ladder

| Strategy | Structure | When to Use |
|----------|-----------|-------------|
| **Ladder** | Even distribution across maturities | Default for most investors |
| **Barbell** | Concentrate in short + long, skip middle | Expect curve steepening or volatility |
| **Bullet** | Concentrate around single maturity | Known future liability date |

### Premium vs. Discount Bonds: Tax Treatment

#### Premium Bonds (Price > Par)

**Why bonds trade at premium:** Coupon rate exceeds current market rates

**Tax Treatment - Taxable Bonds (IRS Pub 550):**
- **May elect to amortize premium** annually, reducing taxable interest income
- Amortization reduces your cost basis
- If you don't amortize, you have a capital loss at maturity

**Tax Treatment - Tax-Exempt Bonds:**
- **Must amortize premium** (mandatory, not elective)
- Reduces your basis; no tax deduction (already tax-exempt)
- Prevents "double benefit"

**Amortization Method:** Constant yield method (like reverse OID calculation)

**Example:**
- Buy $10,000 face bond for $10,500
- 10 years to maturity, 5% coupon
- Annual coupon: $500
- Annual amortization: ~$50 (reduces taxable interest to ~$450)
- At maturity: receive $10,000 (basis reduced to $10,000; no gain/loss)

#### Discount Bonds (Price < Par)

**Why bonds trade at discount:** Coupon rate below current market rates

**Tax Treatment - Taxable Bonds:**

**Original Issue Discount (OID):** If issued below par
- Accrue as ordinary income annually
- Increases your basis
- At maturity, no additional gain

**Market Discount:** If purchased below par in secondary market
- **Two options:**
  1. Recognize all discount as ordinary income at sale/maturity
  2. Elect to accrue market discount annually as ordinary income
- Affects timing, not character (ordinary income either way)

**Tax Treatment - Tax-Exempt Bonds:**
- **De minimis rule applies** (see Section 3)
- Discount within de minimis: capital gain at maturity
- Discount exceeding de minimis: **ordinary income** at maturity

**Recommendation:** For muni bonds, prefer premium or par bonds to avoid ordinary income treatment on discount. For taxable bonds, understand that discount ultimately becomes ordinary income.

---

## 5. Preferred Stock

### Overview

Preferred stock is a hybrid security with characteristics of both bonds and common stock. It pays fixed dividends and has priority over common stock but is subordinate to bonds.

### Qualified Dividend Treatment

#### What Are Qualified Dividends?

Dividends that qualify for lower capital gains tax rates (0%, 15%, or 20%) rather than ordinary income rates (up to 37%).

**Qualified Dividend Tax Rates (2025):**
| Taxable Income (MFJ) | Rate |
|---------------------|------|
| Up to $94,050 | 0% |
| $94,051 - $583,750 | 15% |
| Over $583,750 | 20% |
| Plus NIIT if applicable | +3.8% |

**Maximum rate on qualified dividends: 23.8%** vs. 40.8% on ordinary income

#### Holding Period Requirements (IRS)

**For Common Stock:**
- Hold for at least **61 days** during the 121-day period beginning 60 days before the ex-dividend date

**For Preferred Stock:**
- Must hold for at least **91 days** during the 181-day period beginning 90 days before the ex-dividend date (longer period!)

**Per Fidelity:**
> "For certain preferred stock, the security must be held for 91 days out of the 181-day period beginning 90 days before the ex-dividend date."

#### Which Preferred Dividends Qualify?

**Qualified:**
- Traditional preferred stock from U.S. corporations
- Preferred stock from qualified foreign corporations
- Must meet holding period

**NOT Qualified:**
- Preferred stock dividends from REITs (ordinary income)
- Trust preferred (often interest, not dividends)
- Preferred with no holding period met
- Certain foreign preferred stocks

**Tax Advantage Example:**
```
$100,000 in preferred yielding 6% = $6,000 annual income

If Ordinary Income (37% bracket + 3.8% NIIT):
Tax = $6,000 × 40.8% = $2,448
After-tax income = $3,552

If Qualified Dividend (20% + 3.8% NIIT):
Tax = $6,000 × 23.8% = $1,428
After-tax income = $4,572

Tax savings: $1,020/year (29% better after-tax return)
```

### Call Features and Risks

#### Call Risk in Preferred Stock

Most preferred stocks are callable, typically after 5 years from issuance.

**How Calls Work:**
- Issuer redeems shares at par (usually $25) plus any accrued dividends
- Typically callable when rates fall or issuer credit improves
- Investor loses high-yielding security at worst time

**Call Protection:**
- **Non-callable:** Rare; most valuable
- **5-year call protection:** Standard; can't be called for first 5 years
- **Make-whole call:** Expensive for issuer; rare in preferreds

#### Other Risks

| Risk | Description |
|------|-------------|
| **Interest Rate Risk** | Long/perpetual duration means high sensitivity to rate changes |
| **Credit Risk** | Subordinate to bonds; higher loss given default |
| **Dividend Suspension Risk** | Company can suspend dividends (unlike bond interest) |
| **Perpetual Nature** | No maturity date; dependent on call or sale |
| **Liquidity Risk** | Smaller market; wider bid-ask spreads |
| **Sector Concentration** | Heavy in financials (banks, insurance) |

**Note on Dividend Suspension:**
- Cumulative preferred: Missed dividends accumulate and must be paid before common dividends
- Non-cumulative preferred: Missed dividends are lost forever

### Where Preferred Stock Fits in Asset Allocation

#### Characteristics

| Attribute | Preferred Stock | Bonds | Common Stock |
|-----------|----------------|-------|--------------|
| Income priority | After bonds | First | Last |
| Dividend/interest rate | Fixed | Fixed | Variable |
| Maturity | Usually none | Defined | None |
| Price volatility | High | Moderate | Highest |
| Growth potential | None | None | Yes |
| Tax treatment | Qualified dividends (often) | Ordinary income | Qualified dividends |

#### Typical Role in Portfolio

**Traditional View:** 
- Alternative to high-yield bonds with better tax treatment
- 0-10% of fixed income allocation for income-focused investors
- Not a core holding; satellite/diversifier

**Appropriate For:**
- Income investors in high tax brackets (qualified dividend benefit)
- Those seeking higher yield than investment-grade bonds
- Investors comfortable with equity-like volatility

**Not Appropriate For:**
- Conservative investors seeking capital preservation
- Those needing predictable maturity dates
- Tax-advantaged accounts (no benefit from qualified dividends)

**Per Global X:**
> "Preferreds might often achieve a similar return profile to high-yield bonds, but the distributions they are able to pay are eligible for treatment as QDI. Consequently, preferreds may generate better after-tax results."

#### Sample Allocation

**Moderate Income Portfolio:**
```
Fixed Income (50%):
- Core Bonds (investment grade): 30%
- Treasuries/TIPS: 10%
- Municipal Bonds: 5%
- Preferred Stock: 5%

Equities (50%):
- Dividend stocks, REITs, etc.
```

**Key Point:** Preferred stocks correlate more with interest rate movements than stock market movements, but they can decline significantly during credit crises (like 2008) when financial sector preferreds dropped 50%+.

---

## Quick Reference Tables

### Tax Treatment Summary

| Security | Federal Tax | State/Local Tax | Tax Rate |
|----------|-------------|-----------------|----------|
| Treasury Securities | Taxable | **Exempt** | Ordinary income |
| TIPS (inflation adjustment) | Taxable | **Exempt** | Ordinary income (phantom) |
| Corporate Bonds | Taxable | Taxable | Ordinary income |
| Municipal Bonds (in-state) | **Exempt** | Usually exempt | N/A |
| Municipal Bonds (out-of-state) | **Exempt** | Usually taxable | State rate |
| Private Activity Bonds | Exempt (unless AMT) | Varies | Possibly AMT rate |
| Preferred Stock (qualified) | Taxable | Taxable | Qualified dividend rate |

### Risk Comparison

| Risk Factor | Treasuries | IG Corp | Muni | HY Corp | Preferred |
|------------|------------|---------|------|---------|-----------|
| Credit Risk | Minimal | Low | Low-Med | High | Medium |
| Interest Rate Risk | Medium | Medium | Medium | Low | High |
| Liquidity Risk | Very Low | Low | Medium | Medium | High |
| Call Risk | Low | Medium | Medium | High | High |
| Tax Risk | Low | Low | Medium | Low | Low |

### Duration Guidelines

| Investor Profile | Recommended Duration |
|-----------------|---------------------|
| Capital preservation | 0-2 years |
| Short-term conservative | 2-4 years |
| Intermediate/core | 4-6 years |
| Total return | 6-8 years |
| Aggressive income | 8+ years |

---

## Sources

### Primary Sources
- IRS Publication 550: Investment Income and Expenses
- IRS Publication 1212: Guide to Original Issue Discount (OID) Instruments
- IRS Topic No. 403: Interest Received
- IRS Topic No. 404: Dividends
- TreasuryDirect.gov: TIPS, Auctions, Tax Forms
- 26 CFR § 1.1275-7: Inflation-indexed debt instruments
- 31 U.S.C. § 3124: State and local taxation of Treasury securities

### Industry Sources
- MSRB (Municipal Securities Rulemaking Board): Taxable Municipal Bonds
- Fidelity: Bond Ratings, Duration, Bond Ladders, Qualified Dividends
- Vanguard: How Government Bonds Are Taxed, Bond Strategies
- Charles Schwab: Municipal Bond Tax Traps, When to Choose Out-of-State Munis
- PIMCO: Understanding the De Minimis Tax Rule
- Moody's/S&P/Fitch: Credit Rating Scales
- FRED (St. Louis Fed): High Yield Spread Data

---

*This document is for educational purposes only. Consult with qualified tax and investment professionals before making investment decisions.*
