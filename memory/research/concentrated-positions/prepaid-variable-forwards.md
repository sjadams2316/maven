# Prepaid Variable Forward Contracts (VPFs)

*A sophisticated hedging and monetization strategy for concentrated low-basis stock positions*

---

## Executive Summary

A Variable Prepaid Forward (VPF) contract allows stockholders with concentrated, highly-appreciated positions to:
- Access **75-90% of stock value** as immediate cash
- **Defer capital gains taxes** until contract settlement (typically 1-3 years)
- Maintain **downside protection** via floor pricing
- Retain **some upside participation** (up to a cap)
- Keep **voting rights and dividends** during the contract term

This makes VPFs one of the most powerful tools for executives, founders, and investors who need liquidity but want to avoid immediate tax recognition on highly-appreciated stock.

---

## How VPFs Work

### The Structure

A VPF is essentially a **loan secured by a hedged stock position**. The structure combines:

1. **The stock itself** — pledged as collateral
2. **A put option** — providing downside protection (the "floor")
3. **A short call option** — limiting upside participation (the "cap")
4. **Loan repayment** — interest baked into the prepayment discount

Together, these create an "**options collar**" with a floor and cap on the investor's participation.

### The Collar Advance Terminology

The industry also uses terms like:
- Collar Advance
- Prepaid Variable Forward Contract (PVF)
- Variable Prepaid Forward (VPF)
- PRiSM (proprietary product name)

### Typical Terms

| Parameter | Typical Range |
|-----------|---------------|
| Prepayment amount | 75%-90% of stock value |
| Floor protection | 70%-90% of current value |
| Cap (upside limit) | 120%-160% of current value |
| Contract term | 1-3 years |
| Minimum position | $1M-$10M (varies by provider) |

---

## Prepayment Amount Calculation

The prepayment is determined by several factors:

### Higher Prepayment When:
- **Narrower band** (smaller gap between floor and cap)
- **Lower volatility** stock
- **Higher dividends** (investor keeps them)
- **Lower interest rates**
- **Shorter term**

### Example Prepayment Amounts (AQR Research)

| Floor | Cap | Approximate Prepayment |
|-------|-----|------------------------|
| 100% | 120% | ~90% of stock value |
| 80% | 140% | ~78% of stock value |

**Key tradeoff**: Higher prepayment = less upside participation

---

## Settlement Options at Maturity

At the end of the VPF term, three scenarios exist:

### 1. Stock Price Below Floor
- Investor delivers **all pledged shares**
- No additional obligation
- Protected from losses below floor

### 2. Stock Price Between Floor and Cap
- Investor delivers **enough shares to cover the loan** at current price
- OR pays back loan in cash and keeps all shares
- Captures appreciation above original price

### 3. Stock Price Above Cap
- Investor delivers shares **valued at cap price** to cover loan
- Forfeits appreciation above cap
- OR pays cash settlement including the upside above cap

---

## Tax Treatment

### Why VPFs Defer Taxes

Under **IRS Revenue Ruling 2003-7**, a properly structured VPF does NOT constitute:
- A current sale of stock
- A constructive sale under IRC §1259

### Requirements for Tax Deferral

1. **Variable share delivery** — The number of shares delivered must "vary significantly" based on stock price at settlement (typically 20% gap between floor/cap is sufficient)

2. **Maximum share pledge** — Investor must pledge the maximum shares that could be required

3. **Settlement flexibility** — Investor must retain right to substitute cash or other shares

4. **Ownership rights retained** — Voting and dividend rights stay with investor

### Tax Straddle Rules (IRC §1092)

VPFs create a **tax straddle**, which has two consequences:

1. **Loss deferral** — If one position is liquidated at a loss while the offsetting position has unrealized gain, the loss is disallowed to that extent

2. **Holding period effects**:
   - Long-term stock entering VPF: Retains long-term treatment
   - Short-term stock: Holding period resets to zero, doesn't accrue until VPF settles

### Settlement Tax Treatment

**Physical settlement (shares delivered):**
- Gain = Prepayment received – Cost basis of shares delivered
- Character: Long-term or short-term based on original holding period

**Cash settlement:**
- If settlement < prepayment (gain): Short-term capital gain
- If settlement > prepayment (loss): May be disallowed under straddle rules

---

## The McKelvey Case: Critical Legal Precedent

**Estate of McKelvey v. Commissioner (2d Cir. 2018)**

### Facts
- Andrew McKelvey (Monster.com founder) entered two 12-month VPFs in September 2007
- In July 2008, he **extended** the settlement dates to 2010
- He died in November 2008; estate didn't report any gain from extensions

### IRS Position
Extending a VPF = terminating original + entering new contract → **taxable event**

### Court Ruling
Second Circuit **agreed with IRS** — extensions trigger taxable events.

### Practical Impact
**Never extend a VPF**. If you need more time, you must "**roll**" the contract:
1. Cash-settle the original VPF (potential taxable event)
2. Enter a new VPF with different terms

---

## Rolling VPF Contracts

### When Rolling Makes Sense

Rolling can generate **positive cash flow** when stock price is:
- Near or slightly above the original cap
- For narrow-band VPF (100%-120%): Stock between ~$110-$216 (if started at $100)
- For wide-band VPF (80%-140%): Stock between ~$103-$269

### When Rolling is Problematic

**If stock price falls significantly:**
- New VPF prepayment < settlement on original = **negative cash flow**
- May generate short-term taxable gain
- Defeats the downside protection you originally sought

This is the "particular problem" identified by Liberman and Sosner: the VPF may fail to protect against the exact risk it was designed for when rolling is required.

---

## Critical Warning: Stock Lending Arrangements

### TAM 200604033: The Stock Lending Trap

If the VPF includes a **share lending arrangement** allowing the counterparty to borrow and sell pledged shares, the IRS ruled the entire transaction is **immediately taxable**.

### Why This Triggers Tax

The stock lending agreement effectively transfers all economic and legal rights to the counterparty:
- Counterparty can borrow and sell pledged shares
- Investor's voting/dividend rights effectively terminated
- Investor can't realistically reacquire specific pledged shares
- Benefits and burdens of ownership pass at inception

### Key Takeaway
"The mere existence of the counterparty's right to borrow and dispose of the collateral in an unrestricted manner triggers a taxable event" — regardless of whether actually exercised.

---

## Corporate Governance Considerations

### Insider Trading Policy Conflicts

VPFs can conflict with insider trading policies that typically:
- Restrict transactions during blackout periods
- Require pre-clearance of transactions
- Prohibit hedging that reduces economic exposure
- Mandate disclosure of material ownership changes

### The Economic vs Legal Ownership Gap

Even though legal ownership remains with the insider until settlement:
- Economic exposure is substantially reduced at inception
- This potentially undermines executive-shareholder alignment
- SEC requires Form 4 disclosure
- Many companies now explicitly restrict VPF usage

---

## When VPFs Make Sense

### Ideal Candidates

1. **Large concentrated stock position** with substantial unrealized gains
2. **Need for liquidity** but want to defer capital gains
3. **Bullish on the stock** (otherwise, just sell)
4. **Can tolerate complexity** in financial arrangements
5. **Not restricted by corporate policies** from such arrangements

### Use Cases

- Executive diversifying after IPO/lockup expiration
- Founder needing liquidity for new venture
- Bridge financing for real estate purchase
- Paying tax liabilities or exercising options
- Generating capital for investment diversification

---

## Combining VPFs with Tax-Aware Investment Strategies

### Research Finding (Liberman & Sosner)

Combining VPFs with **tax-aware long-short strategies** produces superior after-tax outcomes compared to:
- Continuing to hold concentrated stock
- Fully selling stock upfront
- Combining VPF with index fund
- Combining VPF with direct indexing

### Why This Works

Tax-aware long-short strategies can:
- Generate tax losses through the short book
- Offset VPF settlement gains
- Provide positive pre-tax returns
- Create ongoing loss harvesting opportunities

---

## VPF vs. Alternatives Comparison

| Strategy | Liquidity | Tax Deferral | Downside Protection | Upside | Complexity |
|----------|-----------|--------------|---------------------|--------|------------|
| **VPF** | 75-90% | Yes | Floor price | Capped | High |
| **Margin Loan** | ~50% | Yes | None | Full | Low |
| **Exchange Fund** | None | Yes (7 years) | Diversified | Diversified | Medium |
| **Charitable Trust** | Partial | Partial | None | Partial | High |
| **Outright Sale** | 100% | No | N/A | N/A | Low |

---

## Practical Implementation Steps

1. **Assessment** — Analyze current position, other assets, liabilities, goals
2. **Strategy Development** — Determine if VPF appropriate; structure floor/cap/term
3. **Market Analysis** — Compare terms from multiple VPF providers
4. **Legal Review** — Ensure compliance with insider trading policies, securities laws
5. **Implementation** — Execute contract; transfer shares to counterparty custody
6. **Integration** — Incorporate VPF into overall tax and investment planning
7. **Ongoing Monitoring** — Track stock performance; plan for settlement/roll

---

## Key Providers

Major investment banks and specialized firms offer VPFs:
- Goldman Sachs
- Morgan Stanley
- JPMorgan
- UBS
- Credit Suisse
- Bank of America/Merrill Lynch
- Cache (newer entrant, lower minimums ~$1-2M)

---

## Maven Implementation Considerations

### For Concentrated Position Lab

1. **VPF Scenario Modeling**
   - Model prepayment amounts at different floor/cap combinations
   - Project tax implications at various settlement prices
   - Compare to alternatives (exchange funds, charitable strategies, direct sale)

2. **Decision Support**
   - "Is VPF right for me?" questionnaire
   - Corporate policy check (insider restrictions)
   - Optimal structure recommendation based on goals

3. **Integration with Tax Planning**
   - Model settlement year tax impact
   - Coordinate with Roth conversions, charitable giving
   - Loss harvesting strategy for VPF proceeds

4. **Monitoring Dashboard**
   - Track stock vs floor/cap during VPF term
   - Alert on roll/settlement decision points
   - Settlement scenario projections

---

## Key Takeaways for Advisors

1. **VPFs are powerful but complex** — requires specialized expertise
2. **Never extend, always roll** (McKelvey case)
3. **Avoid stock lending provisions** — immediate tax recognition
4. **Check corporate policies first** — many insiders can't use VPFs
5. **Combine with tax-aware investing** of proceeds for maximum benefit
6. **Model multiple scenarios** — floor/cap/term tradeoffs
7. **Plan for settlement** — have cash or strategy ready

---

## Sources

- Liberman, J. & Sosner, N. (2025). "A Brief Guide to Pricing and Taxation of Variable Prepaid Forwards." Journal of Wealth Management
- IRS Revenue Ruling 2003-7
- Estate of McKelvey v. Commissioner, No. 17-2554 (2d Cir. 2018)
- TAM 200604033
- Cache Financial (2025). Collar Advance documentation
- Candor (2025). VPF Explained article
- AQR Research (2024). VPF pricing scenarios
- IRC §1092 (Straddle Rules)
- IRC §1259 (Constructive Sale Rules)

---

*Created: 2026-02-08*
*Author: Eli (Maven Research)*
