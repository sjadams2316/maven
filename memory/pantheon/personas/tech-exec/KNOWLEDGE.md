# Tech Exec Persona — Knowledge Base

*RSUs, ISOs, 10b5-1 plans, QSBS, concentration risk, IPO planning*

---

## Who They Are

- Software engineers, product managers, executives at tech companies
- Compensation heavily weighted toward equity
- Often have concentrated positions in single stock
- May be approaching IPO, acquisition, or liquidity event
- Typical net worth: $500K - $10M (often 50%+ in company stock)

---

## Unique Challenges

1. **Concentration risk** — 50-80% in one stock
2. **Liquidity constraints** — Can't always sell (blackouts, lockups)
3. **Tax complexity** — ISOs, AMT, QSBS, 83(b) elections
4. **Timing decisions** — When to exercise, when to sell
5. **Diversification vs loyalty** — Emotional attachment to company

---

## Equity Compensation Types

### RSUs (Restricted Stock Units)
- Taxed as ordinary income at vest
- No exercise decision
- Tax strategy: Plan for withholding, consider selling to cover

### ISOs (Incentive Stock Options)
- No tax at exercise (for regular tax)
- AMT exposure if spread is large
- Holding requirement: 1 year from exercise, 2 from grant for LTCG
- **ISO trap:** AMT credit carryforward is complex

### NSOs (Non-Qualified Stock Options)
- Taxed as ordinary income at exercise (spread)
- Simpler than ISOs but higher tax rate
- Often better to exercise NSOs in low-income years

### QSBS (Qualified Small Business Stock)
- Exclude up to $10M or 10x basis from capital gains
- Must hold 5+ years
- Company must be C-corp, <$50M assets at issuance
- **Huge benefit if eligible — verify carefully**

---

## Key Calculations

### Concentration Percentage
```typescript
const concentration = (companyStockValue / totalNetWorth) * 100;
// Alert if > 25%, critical if > 50%
```

### AMT Exposure (ISOs)
```typescript
const spread = (currentPrice - strikePrice) * shares;
const amtIncome = spread; // Add to AMTI
// Compare regular tax vs AMT, pay higher
```

### 83(b) Election Analysis
```typescript
// Early exercise with 83(b): Pay tax now on low value
// Risk: Stock could become worthless
// Benefit: Start LTCG clock, potentially QSBS clock
const taxNow = currentFMV * ordinaryRate;
const taxLater = (futureValue - strike) * ordinaryRate;
```

---

## 10b5-1 Plans

Pre-scheduled selling program to avoid insider trading issues:

- **Setup:** During open window, not when aware of MNPI
- **Waiting period:** 90 days for officers, 30 days for others
- **Modifications:** Limited, can reset waiting period
- **Strategy:** Systematic diversification without timing decisions

---

## Diversification Strategies

### Gradual Sale Program
- Sell X% per quarter over 2-3 years
- Reduces timing risk
- Tax-efficient if spread across years

### Charitable Giving
- Donate appreciated shares (avoid cap gains)
- Donor-advised fund for flexibility
- Can "bunch" donations for itemization

### Exchange Funds
- Pool concentrated stock with others
- Receive diversified portfolio
- 7-year lockup, complex rules

### Protective Puts / Collars
- Buy puts for downside protection
- Sell calls to fund puts (collar)
- Constructive sale rules apply

---

## Common Mistakes

1. **Holding too long** — Loyalty shouldn't mean 80% concentration
2. **ISO AMT surprise** — Exercise in December, owe huge AMT in April
3. **Missing QSBS** — Not tracking eligibility from the start
4. **Blackout panic** — Making bad decisions when can't sell
5. **83(b) missed** — Only 30 days to file, no extensions

---

## Talking Points for Advisors

- "Let's look at your concentration as a percentage of net worth"
- "Have you modeled the AMT impact of exercising these ISOs?"
- "Does your company stock qualify for QSBS?"
- "What's your plan if there's a 50% drawdown?"
- "Should we set up a 10b5-1 plan for systematic diversification?"

---

## Integration with Maven

| Tool | How It Helps |
|------|--------------|
| Concentration Analyzer | Visual of single-stock exposure |
| What-If Simulator | Model selling scenarios |
| Tax Intelligence | AMT calculations, QSBS tracking |
| Oracle | Answer complex equity comp questions |

---

*Tech execs have complex wealth. The advisor who understands equity comp wins their trust.*
