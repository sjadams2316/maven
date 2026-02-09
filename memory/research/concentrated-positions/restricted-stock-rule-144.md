# Rule 144 & Restricted Stock — Complete Guide

*Maven Research | Last Updated: 2026-02-09*

---

## Executive Summary

Rule 144 governs the resale of **restricted securities** and **control securities** — two categories that affect executives, founders, early investors, and major shareholders. Understanding Rule 144 is essential for clients with concentrated stock positions in public companies, particularly those subject to insider trading rules.

**Key Concepts:**
- **Restricted Securities:** Acquired in unregistered transactions (private placements, stock compensation, etc.)
- **Control Securities:** Held by affiliates (insiders) regardless of how acquired
- **Rule 144:** Safe harbor allowing sales of both types under specific conditions

---

## Definitions

### Restricted Securities

Securities acquired in transactions NOT involving a public offering:
- Private placements (Regulation D, Regulation S)
- Employee stock options/grants (prior to registration)
- Compensation to founders
- Stock acquired in mergers/acquisitions

**Key characteristic:** These shares typically have restrictive legends and cannot be freely traded.

### Control Securities

Securities held by "affiliates" — persons who directly or indirectly control, are controlled by, or are under common control with the issuer:
- Officers (CEO, CFO, etc.)
- Directors
- Large shareholders (typically 10%+)
- Anyone with policy-making authority

**Key characteristic:** Even publicly-purchased shares become "control securities" when held by an affiliate.

### The Intersection

An executive might hold both:
- **Restricted control securities:** Option shares not yet registered
- **Non-restricted control securities:** Shares purchased on the open market

Both are subject to Rule 144, but the conditions differ.

---

## Rule 144 Conditions

### For Affiliates (Sellers of Control Securities)

Affiliates must satisfy ALL five conditions:

| Condition | Requirement |
|-----------|-------------|
| **1. Holding Period** | 6 months (reporting company) or 1 year (non-reporting) for restricted securities |
| **2. Current Public Information** | Issuer must be current on SEC filings |
| **3. Volume Limitations** | Cannot sell more than greater of 1% of outstanding or average weekly trading volume (4 weeks) per 3-month period |
| **4. Manner of Sale** | Must be through broker, no solicitation, normal commissions |
| **5. Form 144 Filing** | Required if sales exceed $50,000 or 5,000 shares in 3 months |

### For Non-Affiliates

**If held at least 6 months (reporting company):**
- Must have current public information
- No volume limits, manner of sale, or Form 144 requirements

**If held at least 1 year:**
- No conditions at all — free trading

### Non-Reporting Companies

| Seller Type | Holding Period | Other Conditions |
|-------------|---------------|-----------------|
| Non-affiliate | 1 year | None |
| Affiliate | 1 year | All five conditions |

---

## Holding Period — Deep Dive

### When Does It Start?

The holding period begins when **full purchase price is paid**.

**Promissory Notes:** Not considered "payment" unless:
- Full recourse against purchaser
- Secured by collateral OTHER than the securities (FMV ≥ purchase price)
- Paid in full before any Rule 144 sale

### Tacking (Combining Holding Periods)

In certain situations, you can add (tack) the prior holder's period:

| Situation | Tacking Allowed? |
|-----------|-----------------|
| Stock dividends, splits, recaps | ✅ Yes — tacks to underlying shares |
| Conversions (same issuer, no cash) | ✅ Yes — tacks to converted securities |
| Cashless exercise of options/warrants | ✅ Yes — tacks to original securities |
| Gifts from affiliate | ✅ Yes — tacks to donor's period |
| Estate of deceased affiliate | ✅ Yes — no holding period if beneficiary is non-affiliate |
| Pledged securities (bona fide default) | ✅ Yes — tacks to pledgor's period |
| Entity distributions (pro rata) | ✅ Yes — tacks to entity's period |
| Rule 145 transactions (M&A) | ❌ No — new holding period starts |

### Employee Stock Options

**Critical Rule:** For employee options where no consideration was paid:
- Holding period begins on **exercise date** (not grant date)
- Rationale: No investment risk until exercise

**Exception:** If options were purchased for consideration or the option itself had investment risk, the grant date may be used.

### Installment Sales

If acquiring securities through installments:
- Holding period begins when **each installment is paid**
- Or: Seller can elect to have holding period begin at end of tax year of sale

---

## Volume Limitations (Affiliates Only)

**Formula:** Greater of:
1. **1% of outstanding shares**, OR
2. **Average weekly trading volume** over prior 4 weeks

Measured over any rolling 3-month period.

### Calculation Example

Company XYZ:
- Outstanding shares: 50 million
- 4-week average weekly volume: 800,000 shares

Volume limit = Greater of:
- 1% × 50M = 500,000 shares
- 800,000 shares

**Limit = 800,000 shares per 3-month period**

### OTC/Non-Listed Securities

Only the 1% rule applies — no trading volume alternative.

---

## Form 144 Filing

### When Required

Affiliates must file Form 144 if, in any 3-month period, sales will exceed:
- $50,000 in aggregate sale price, OR
- 5,000 shares

### Filing Process

- File with SEC **at or before** placing sell order
- Electronic filing through EDGAR
- Form valid for 90 days
- Must actually sell within 90 days or re-file

### Non-Affiliates

No Form 144 filing required, regardless of amount.

---

## 10b5-1 Trading Plans

### Purpose

Rule 10b5-1 provides an affirmative defense against insider trading charges IF trades are made pursuant to a pre-established plan while NOT in possession of material nonpublic information (MNPI).

### 2022 Amendments (Effective April 2023)

The SEC significantly tightened 10b5-1 rules:

| Requirement | Details |
|-------------|---------|
| **Cooling-Off Period** | Directors/officers: Later of 90 days or 2 business days after next Form 10-Q/10-K |
| | Other insiders: 30 days |
| **Good Faith** | Must act in good faith with respect to plan |
| **Certification** | Officers/directors must certify not aware of MNPI |
| **No Overlapping Plans** | Cannot have multiple active plans (limited exceptions) |
| **Single Trade Limit** | Only one single-trade plan per 12-month period |
| **Modification = New Plan** | Any modification restarts cooling-off period |

### Plan Elements

A valid 10b5-1 plan must specify either:
1. Amount, price, and date of trades, OR
2. A formula for determining amount, price, and date, OR
3. Give discretion to a third party (broker) who doesn't have MNPI

### Disclosures

Companies must disclose:
- Adoption/termination of 10b5-1 plans by directors/officers (Form 8-K)
- Whether directors/officers have 10b5-1 plans (proxy statement)
- General description of plan terms

---

## Section 16 (Officers, Directors, 10% Owners)

### Short-Swing Profit Rule (§16(b))

**Who:** Officers, directors, and >10% beneficial owners

**Rule:** Profits from any purchase AND sale (or sale AND purchase) within 6 months must be disgorged to the company.

**Matching:** Any sale price matched against any purchase price in 6-month window to calculate "profit" — even if economically you lost money.

### Section 16 Reports

| Form | Trigger | Deadline |
|------|---------|----------|
| **Form 3** | Becoming an insider | Within 10 days |
| **Form 4** | Any change in ownership | Within 2 business days |
| **Form 5** | Annual catch-up for unreported transactions | Within 45 days of fiscal year end |

### Exemptions from §16(b)

- Certain employee benefit plan transactions
- Stock option exercises (often exempt)
- Gifts (no "sale")
- Inheritance

---

## Blackout Periods

### Company-Imposed Blackouts

Most public companies impose trading restrictions:
- **Quarterly blackouts:** Typically from quarter-end until 1-2 days after earnings release
- **Event-driven blackouts:** M&A, material developments
- **Individual blackouts:** When specific person has MNPI

### Regulation BTR (Blackout Trading Restriction)

**Pension fund blackouts:** When >50% of plan participants are restricted from trading, directors and executive officers are also prohibited from trading company stock.

---

## Practical Scenarios

### Scenario 1: Executive Wants to Diversify

**Situation:** CEO holds 500,000 shares (mix of option exercises and open-market purchases), currently in possession of MNPI about upcoming acquisition.

**Can they sell?**
- ❌ Not while possessing MNPI
- ✅ Can establish 10b5-1 plan NOW, but must wait for cooling-off period
- After cooling-off: Plan can auto-execute even if CEO later has MNPI

**Limits:**
- Subject to volume limitations
- Must file Form 144
- Subject to company blackout windows

### Scenario 2: Founder at IPO Lock-up Expiration

**Situation:** Founder received shares at formation (cost basis: $0.01), IPO was 6 months ago, lock-up expiring.

**Can they sell?**
- ✅ Yes, if not an affiliate: After 6 months + current public info, unlimited sales
- If still an affiliate: Volume limitations, Form 144, manner of sale apply
- Watch for: Secondary registration (removes restrictions entirely)

### Scenario 3: 10% Shareholder Selling

**Situation:** Investment fund owns 12% of company, wants to sell 3% stake.

**Key issues:**
- If 10% owner is NOT an officer/director and did NOT acquire restricted securities, they may NOT be an "affiliate" under Rule 144
- But they ARE subject to Section 16 (§16(a) reporting, §16(b) short-swing)
- Distinction matters: Rule 144 affiliate ≠ Section 16 insider

---

## Comparison Table: Who Must Comply With What

| Seller Type | Rule 144? | Section 16? | 10b5-1 Useful? |
|-------------|-----------|-------------|----------------|
| Officer with restricted stock | ✅ All conditions | ✅ Yes | ✅ Highly |
| Director with open-market shares | ✅ Control securities | ✅ Yes | ✅ Highly |
| 10% owner (passive fund) | Maybe (depends on affiliate status) | ✅ Yes | ⚠️ Maybe |
| Early employee (non-affiliate) | ✅ Holding period only | ❌ No | ❌ Not needed |
| Former executive (90 days since departure) | ❌ If not affiliate | ❌ No | ❌ Not needed |

---

## Legend Removal Process

Restricted securities have physical or electronic legends preventing free trading. To sell:

1. **Check eligibility:** Confirm Rule 144 conditions met
2. **Obtain legal opinion:** Attorney letter confirming compliance
3. **Submit to transfer agent:** With opinion letter and supporting documents
4. **Transfer agent removes legend:** Shares become freely tradeable
5. **Deposit in brokerage:** Can now sell normally

**Timeline:** Typically 1-3 weeks, but varies by transfer agent

---

## Maven Application

### Concentrated Position Lab
- Track insider status and identify Rule 144 constraints
- Calculate available selling capacity under volume limits
- Model 10b5-1 plan scenarios with cooling-off periods
- Alert to blackout windows based on calendar

### Tax Planning
- Optimize lot selection within Rule 144 constraints
- Coordinate sales timing with tax events
- Model §16(b) disgorgement risk for paired transactions

### Compliance Monitoring
- Track Form 3/4/5 filing deadlines
- Monitor Section 16 short-swing exposure
- Flag potential 10b5-1 plan violations

---

## Key Takeaways

1. **Affiliates face more restrictions** — Volume limits, Form 144, manner of sale
2. **Holding period varies** — 6 months (reporting) vs 1 year (non-reporting)
3. **10b5-1 is essential for insiders** — Only safe way to sell with advance planning
4. **Cooling-off is real** — 90 days minimum for officers/directors
5. **Section 16 ≠ Rule 144** — Different rules, different people, different consequences
6. **Tacking saves time** — Understand when holding periods can combine
7. **Get legal counsel** — Stakes are high; securities law is unforgiving

---

## Sources

- SEC Rule 144 Text (17 CFR 230.144)
- SEC Investor Bulletin: "Rule 144: Selling Restricted and Control Securities"
- SEC Rule 10b5-1 Amendments (December 2022)
- Investopedia: "SEC Rule 144: Definition, Holding Periods, and Other Rules"
- Securities Law Blog: "Rule 144 – A Deep Dive" series (Laura Anthony, Esq.)
- SEC Compliance and Disclosure Interpretations (April 2025 update)

---

*Created: 2026-02-09 | Author: Eli | Category: Concentrated Positions / Compliance*
