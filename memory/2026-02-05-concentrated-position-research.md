# Concentrated Position Strategies - Deep Research

*Research compiled 2026-02-05 for Concentrated Position Optimizer*

---

## 1. Direct Indexing + Tax Loss Harvesting

### How It Actually Works

**The Mechanics:**
1. Client opens a direct indexing account (owns ~100-500 individual stocks replicating an index)
2. As some stocks decline, those losses are harvested (sold and replaced with similar stocks)
3. Accumulated losses are used to offset gains when selling the concentrated position
4. Client gradually sells concentrated stock, using harvested losses to offset taxes

**Key Insight:** You're NOT harvesting losses from the concentrated stock. You're building a SEPARATE direct indexing portfolio that generates losses to offset gains from selling the concentrated position.

**The Capital Requirement:**
- Need significant new capital to fund the direct index portfolio
- Rule of thumb: Need roughly 2-3x the embedded gain in direct index assets to fully offset
- Example: $1.6M gain → need $3-5M in direct indexing to harvest enough losses over time

**Loss Harvesting Decay:**
- Markets trend up over time (~7% annually)
- Studies show loss harvesting generates most value in first 5-7 years
- After ~7 years, most positions have appreciated → fewer losses to harvest
- "Tax alpha" typically 1-2% annually, decaying over time

**What You End Up With:**
- After harvesting period, you have a "bag of index-type stocks" with stepped-up basis
- Can continue holding for market exposure
- Or can sell/donate with minimal tax impact

**Best For:**
- Clients who can contribute significant new capital alongside concentrated position
- Long time horizons (10+ years)
- Those who want to maintain equity market exposure

**Providers:** Parametric, Aperio (BlackRock), Vanguard Personalized Indexing, Schwab

---

## 2. Exchange Funds (Section 721)

### How It Actually Works

**The Mechanics:**
1. Multiple investors contribute concentrated stock positions to a partnership
2. Each receives units representing their proportional share of the pooled portfolio
3. The contribution is tax-free under IRC Section 721
4. After 7-year lockup, can redeem a diversified basket of securities
5. Original basis carries over (tax is deferred, not eliminated)

**Key Requirements:**
- Must be accredited investor
- Minimums typically $500K-$5M (some newer funds: $100K)
- Stock must be publicly traded and meet diversification rules
- Fund must maintain 20% in illiquid assets (real estate) to qualify
- 7-year lockup period (IRS requirement)

**What Happens at Exit (Year 7+):**
- Receive a diversified basket of stocks (not your original stock)
- Your original low basis carries over to the new securities
- When you eventually sell the basket, you pay capital gains on original basis

**The Real Trade-Off:**
- Pro: Immediate diversification without triggering tax
- Con: Tax is DEFERRED, not eliminated. You still owe it eventually.
- Con: 7-year illiquidity
- Con: Annual K-1 tax reporting (fund generates taxable events)
- Con: Not all stocks qualify (must meet diversification rules)

**Who Offers Exchange Funds:**
- Goldman Sachs
- Eaton Vance
- Cache (newer, lower minimums)

---

## 3. Options Strategies (Collars, Prepaid Variable Forwards)

### A. Basic Collar

**The Mechanics:**
1. Buy protective put (downside floor, e.g., 10% below current price)
2. Sell covered call (caps upside, e.g., 15% above current price)
3. Premium from call can offset cost of put (zero-cost collar possible)

**Tax Treatment:**
- No immediate taxable event
- Creates "straddle" under IRC Section 1092
- Losses may be deferred; holding period can be suspended
- Still own the stock; no diversification achieved

**Key Limitations:**
- Upside is capped (if stock doubles, you miss most of it)
- Doesn't solve concentration risk (hedged ≠ diversified)
- Must manage/roll collar over time
- Eventually must address the position

### B. Prepaid Variable Forward (PVF)

**The Mechanics:**
1. Enter agreement with investment bank
2. Receive 75-90% of stock value upfront in cash
3. Agree to deliver variable number of shares at settlement (1-3 years)
4. Pledge shares as collateral but retain voting rights and dividends

**The Settlement Formula:**
- If stock falls below "floor" → deliver ALL pledged shares
- If stock rises above "cap" → deliver fewer shares, keep some upside
- Narrow band (100% floor / 120% cap) → higher prepayment (~90%)
- Wide band (80% floor / 140% cap) → lower prepayment (~78%)

**Tax Treatment:**
- No immediate taxable event (per IRS Revenue Ruling 2003-7)
- Tax straddle rules apply
- At settlement, choose physical (deliver shares) or cash settlement
- Capital gains recognized at settlement based on original basis

**Requirements for Tax Deferral:**
- Variable share delivery (20%+ gap between floor and cap)
- Pledge maximum shares that could be required
- Retain right to substitute cash or other shares
- Maintain voting rights and dividend entitlement

**Key Risks:**
- Stock could decline significantly → deliver all shares
- Lost upside if stock appreciates beyond cap
- Complexity and transaction costs
- Potential conflict with insider trading policies

---

## 4. Charitable Strategies

### A. Charitable Remainder Trust (CRT)

**The Mechanics:**
1. Contribute appreciated stock to irrevocable CRT
2. CRT sells stock TAX-FREE (CRT is tax-exempt entity)
3. Reinvest proceeds in diversified portfolio
4. Receive income stream for life or term of years (5-20 years)
5. Remainder goes to charity at end of term

**Tax Benefits:**
- No capital gains tax on sale inside CRT
- Immediate charitable deduction (present value of remainder interest)
- Deduction limited to 30% of AGI for appreciated property
- Unused deduction carries forward 5 years

**Income Distribution:**
- Must distribute at least 5% of trust value annually
- Maximum 50% annually
- Income is taxable to beneficiary (tiered: ordinary income, capital gains, tax-free)

**Key Considerations:**
- Irrevocable — can't change your mind
- Charity must receive at least 10% of initial contribution (IRS requirement)
- Good for clients with charitable intent who also want income stream
- Can name donor-advised fund as remainder beneficiary for flexibility

### B. Donor-Advised Fund (DAF)

**The Mechanics:**
1. Contribute appreciated stock to DAF
2. Receive immediate tax deduction at full fair market value
3. DAF sells stock tax-free
4. Recommend grants to charities over time

**Best For:**
- Clients who want to "bunch" charitable giving in high-income years
- Those who want charitable flexibility (don't need to pick charities now)
- Simpler than CRT

---

## 5. Other Strategies Worth Noting

### Qualified Opportunity Zone (QOZ)
- Sell appreciated stock, reinvest gains in QOZ fund within 180 days
- Defer gain until 2026 or sale of QOZ investment
- Potential for basis step-up if held 10+ years
- Limited investment options (must invest in designated zones)

### Private Placement Life Insurance (PPLI)
- Contribute assets to insurance policy
- Growth is tax-free inside policy
- Access via loans against policy
- Complex, high minimums ($1M+)

### Installment Sale
- Sell stock to third party, receive payments over time
- Spread gain recognition over payment period
- Counterparty risk; interest on deferred payments

### Step-Up in Basis at Death
- If held until death, heirs receive step-up in basis
- No capital gains tax on appreciation during lifetime
- May be relevant for older clients or estate planning

---

## Decision Framework

| Strategy | Tax Treatment | Liquidity | Diversification | Complexity | Best For |
|----------|--------------|-----------|-----------------|------------|----------|
| Direct Indexing | Offset with losses | High | Gradual | Medium | Long horizon, new capital |
| Exchange Fund | Deferred 7+ years | Low (7yr) | Immediate | Medium | Large positions, patient |
| Collar | Deferred | Medium | None | Medium | Short-term hedge |
| PVF | Deferred 1-3 years | High (upfront cash) | None | High | Monetization need |
| CRT | Avoided on sale | Low (income only) | Immediate | High | Charitable intent |
| DAF | Deduction | None | N/A | Low | Charitable intent |

---

## Modeling Considerations

**For accurate modeling, need to account for:**

1. **Direct Indexing:**
   - Requires NEW capital (not just concentrated position)
   - Loss harvesting decays over time (~2% year 1, declining to ~0.5% by year 10)
   - Wash sale rule constraints
   - Trading costs and management fees

2. **Exchange Fund:**
   - Basis carries over (model eventual tax on exit)
   - K-1 income during holding period
   - 20% illiquid allocation affects returns
   - Management fees (1-2% typical)

3. **Collars/PVF:**
   - Premium from call vs. cost of put
   - Opportunity cost of capped upside
   - Financing costs (interest on prepayment)
   - Transaction costs

4. **Charitable:**
   - CRT payout rate affects deduction and income stream
   - Client's actual charitable intent (don't suggest if no intent)
   - Income tiering rules for CRT distributions

---

*This research should inform refinements to the Concentrated Position Optimizer modeling engine.*
