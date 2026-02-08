# Tax-Loss Harvesting Deep Dive

*Research completed: 2026-02-05*

## Overview

Tax-loss harvesting (TLH) is the strategy of selling investments at a loss to offset capital gains and reduce taxable income. The key benefit: you can maintain market exposure while generating tax deductions.

## The Basic Mechanics

1. **Sell** a security that has declined in value
2. **Use the loss** to offset capital gains (or up to $3,000 of ordinary income)
3. **Reinvest** in a similar (but not "substantially identical") security
4. **Result**: Tax benefit now, continued market exposure

## Tax Treatment of Losses

### Netting Rules
Losses first offset gains of the same type, then cross over:

1. **Short-term losses** offset short-term gains first
2. **Long-term losses** offset long-term gains first
3. **Excess losses** of one type offset the other type
4. **Net losses** up to **$3,000/year** offset ordinary income
5. **Remaining losses** carry forward indefinitely

### Example
- Short-term gains: $10,000
- Short-term losses: $15,000
- Long-term gains: $8,000
- Long-term losses: $2,000

**Calculation:**
- ST net: -$5,000 (loss)
- LT net: +$6,000 (gain)
- Combined: +$1,000 net LTCG (taxable)
- The $5,000 ST loss offsets $5,000 of LT gain

## The Wash Sale Rule (IRS Section 1091)

### Definition
The wash sale rule **disallows a loss deduction** if you buy "substantially identical" securities within:
- **30 days before** the sale, OR
- **30 days after** the sale

This creates a **61-day window** (30 + sale day + 30) where you must avoid the same security.

### What "Substantially Identical" Means

**Clearly the same security:**
- Same stock (e.g., selling Apple, buying Apple)
- Same mutual fund (e.g., VFIAX to VFIAX)
- Option to buy the same security

**NOT substantially identical (safe to substitute):**
- Different company in same sector (Ford vs GM)
- Different index fund tracking different index (S&P 500 fund vs Total Market fund)
- Stock vs bond of same company
- Different ETF families tracking same index (controversial — see below)

**Gray area — use caution:**
- Two S&P 500 index funds from different providers (Vanguard vs Fidelity)
- ETF vs mutual fund tracking same index
- The IRS hasn't defined this clearly; most practitioners avoid these

### Wash Sale Applies Across Accounts

**Critical**: The wash sale rule applies across ALL your accounts, including:
- Taxable brokerage accounts
- Your spouse's accounts
- Your IRAs (Traditional and Roth)

**IRS Publication 550 specifically states** that buying substantially identical securities in your IRA within the 30-day window triggers a wash sale.

### The IRA Trap

If you:
1. Sell a stock at a loss in your taxable account
2. Buy the same stock in your IRA within 30 days

**Result**: 
- The loss is permanently disallowed (you can't claim it)
- The cost basis is NOT added to the IRA (unlike taxable accounts)
- Per Revenue Ruling 2008-5, the loss is **forfeited entirely**

### What Happens When Wash Sale Triggered

In taxable accounts:
1. The loss is **disallowed** on your current-year return
2. The disallowed loss is **added to cost basis** of the new shares
3. The holding period of original shares **transfers** to new shares

This means the loss is deferred, not lost forever — you'll recognize it when you eventually sell the replacement shares.

## DRIP Trap

**Watch out for dividend reinvestment plans (DRIPs)!**

If you sell a stock for a loss but have automatic dividend reinvestment enabled, the reinvested dividends within 30 days trigger a wash sale.

**Solution**: Turn off DRIP before harvesting, or manually manage reinvestment.

## Practical Harvesting Strategies

### Strategy 1: Substitute with Similar ETF
- Sell: Vanguard S&P 500 ETF (VOO) at a loss
- Buy: Schwab US Large-Cap ETF (SCHX) — tracks a different index
- Wait 31 days, then switch back if desired

### Strategy 2: Broad Market Swap
- Sell: Total Stock Market fund at a loss
- Buy: Large-cap + mid-cap + small-cap separately
- Maintains similar exposure, clearly different securities

### Strategy 3: Direct Indexing
- Own individual stocks that comprise an index
- Harvest losses on individual stocks while maintaining overall market exposure
- More tax alpha potential but requires more management

## When Tax-Loss Harvesting Is NOT Worth It

### 1. Transaction Costs Exceed Benefit
For small losses, trading costs and bid-ask spreads may eat the benefit.

### 2. You'll Be in Higher Bracket Later
If you're harvesting a long-term loss (15%/20% rate) now but will recognize gains at higher rates later, you're deferring cheap taxes to pay expensive ones.

### 3. Expected Step-Up in Basis
If you plan to hold until death, your heirs get a stepped-up basis. Harvesting now resets basis lower, potentially creating more taxable gain later.

### 4. Low Tax Bracket
If you're in the 0% LTCG bracket ($94,050 joint income in 2025), there's no immediate benefit — you're converting 0% tax now to potential future tax.

### 5. Short-Term vs Long-Term Conversion
Selling a long-term loss position and buying replacement starts a new holding period. If you sell the replacement within a year, you've converted potential LTCG to STCG.

## Optimal Harvesting Frequency

**Research suggests**: Continuous/frequent monitoring beats year-end-only harvesting.

- Markets are volatile throughout the year
- Losses disappear if positions recover
- More opportunities with regular monitoring

**Practical approach**: Check quarterly or use automated tools. Harvest when:
- Loss exceeds a threshold (e.g., >$1,000 or >5%)
- Loss materially impacts tax liability

## Year-End Considerations

### December 31 Deadline
- Losses must be realized by 12/31 to offset gains in that tax year
- Settlement date rules: trades must **settle** by 12/31 (T+2 for stocks)
- Last reliable trading day is typically 12/28 or 12/29

### Spreading Tax Events Across Years
Strategy: Harvest loss in late December, sell replacement for LTCG in early January.
- Loss offsets current year gains
- New gain deferred to next tax year
- Consider hedging (put option) during interim period

## Carryforward Rules

Unused capital losses carry forward indefinitely. They retain their character (short-term or long-term).

**Tracking**: Keep records of:
- Amount of carryforward
- Short-term vs long-term breakdown
- Year of origin

**Death**: Carryforwards generally expire at death and don't transfer to heirs.

## Lot Selection Methods

When selling, choose your method:

| Method | Best When |
|--------|-----------|
| **FIFO** (First In, First Out) | Default; may not be optimal |
| **LIFO** (Last In, First Out) | Recent purchases at a loss |
| **Specific ID** | Maximum control; pick highest-basis lots |
| **HIFO** (Highest In, First Out) | Minimize gains automatically |
| **Average Cost** | Only for mutual funds; limits flexibility |

**Recommendation**: Use Specific ID for maximum flexibility in tax management.

## Record Keeping

**Must maintain**:
- Date of original purchase
- Original cost basis (per lot)
- Date of sale
- Sale proceeds
- Any wash sale adjustments

Brokers report this on Form 1099-B, but verify accuracy, especially for:
- Transferred positions
- Corporate actions (splits, mergers)
- Wash sale adjustments across accounts

---

## Decision Framework

**Harvest when:**
- [ ] Meaningful loss exists (>$1,000 or material % of position)
- [ ] Can find appropriate substitute investment
- [ ] Won't trigger wash sale
- [ ] Current tax rate ≥ expected future rate
- [ ] Not planning to hold until death

**Don't harvest when:**
- [ ] In 0% LTCG bracket
- [ ] Position will recover before you can repurchase
- [ ] Step-up at death is expected
- [ ] Transaction costs exceed benefit
- [ ] Creates short-term gain from long-term position

---

## Sources
- IRS Publication 550: Investment Income and Expenses
- Fidelity: "Wash-Sale Rules | Avoid This Tax Pitfall"
- Schwab: "Watch Out for Wash Sales"
- Kitces: Various articles on tax-loss harvesting

---
*Note: This is tax information, not tax advice. Individual circumstances vary significantly.*
