# Pre-Retiree Persona — Knowledge Base

*Ages 55-70, transitioning to retirement, sequence risk, Medicare, income planning*

---

## Who They Are

- 5-15 years from retirement (or recently retired)
- Peak earning years, highest savings capacity
- Shift from accumulation to preservation/decumulation
- Concerned about: "Will I have enough?"
- Typical net worth: $500K - $3M

---

## Unique Challenges

1. **Sequence of returns risk** — Bad years early destroy retirement
2. **Social Security timing** — Complex optimization
3. **Healthcare bridge** — Medicare starts at 65, what before?
4. **Withdrawal strategy** — Which accounts, what order
5. **Identity shift** — From saver to spender (psychologically hard)

---

## Key Planning Phases

### Phase 1: Pre-Retirement (55-62)
- Maximize catch-up contributions ($7,500 401k, $1,000 IRA)
- Build taxable bucket for early retirement bridge
- Model retirement dates with different scenarios
- Consider Roth conversions while still working

### Phase 2: Early Retirement (62-65)
- Social Security decision (claim early or wait?)
- Healthcare: COBRA, ACA, or retiree benefits?
- Taxable account drawdown for income
- Continue Roth conversions in low-income years

### Phase 3: Medicare Transition (65-70)
- Medicare enrollment (Parts A, B, D, Medigap)
- IRMAA planning (high income = higher premiums)
- Social Security claiming (if not already)
- Begin tax-deferred withdrawals

### Phase 4: Full Retirement (70+)
- RMDs begin (age 73+)
- Roth withdrawals as needed (tax-free)
- Legacy planning, estate optimization
- Long-term care considerations

---

## Social Security Strategies

### Single Filer
- **Claim at 62:** 70% of PIA (Primary Insurance Amount)
- **Claim at FRA (67):** 100% of PIA
- **Claim at 70:** 124% of PIA
- **Break-even:** Typically age 78-82

### Married Couple Strategies

**Strategy 1: Both Delay**
- Best if both healthy, high earners
- Maximum total lifetime benefits

**Strategy 2: Lower Earner Claims Early**
- Higher earner delays to 70
- Provides income bridge
- Maximizes survivor benefit

**Strategy 3: File & Suspend (limited)**
- Was more valuable pre-2016
- Still some spousal benefit strategies

---

## Sequence Risk Mitigation

### The Problem
```
Bad scenario:
Year 1: -20% return, withdraw $50k → Portfolio: $350k
Year 2: -10% return, withdraw $50k → Portfolio: $265k
Year 3: +30% return, withdraw $50k → Portfolio: $295k
(Never recovers)

Good scenario (same returns, different order):
Year 1: +30% return, withdraw $50k → Portfolio: $600k
Year 2: -10% return, withdraw $50k → Portfolio: $490k
Year 3: -20% return, withdraw $50k → Portfolio: $342k
(Healthy portfolio)
```

### Solutions
1. **Cash bucket** — 1-2 years expenses in cash
2. **Bond tent** — Increase bonds before/after retirement
3. **Flexible spending** — Reduce in down years
4. **Guardrails** — Cut spending 10% if portfolio drops 20%

---

## Healthcare Bridge (Pre-65)

| Option | Cost | Coverage | Notes |
|--------|------|----------|-------|
| COBRA | $$$ | Same as employer | 18-36 months max |
| ACA Marketplace | Varies | Depends on plan | Subsidies if income low enough |
| Spouse's plan | Varies | Depends on spouse | If spouse still working |
| Retiree benefits | Rare | Good if available | Increasingly uncommon |
| Health sharing | $ | Limited | Not insurance, gaps |

**Key insight:** ACA subsidies phase out at 400% FPL (~$60K single). Roth conversions can push you over.

---

## Roth Conversion Window

The years between retirement and Social Security/RMDs are the "Roth conversion sweet spot":
- Income is low (no wages)
- Can fill up lower brackets cheaply
- Reduces future RMDs
- Creates tax-free legacy

```typescript
// Optimal conversion = fill bracket without jumping
const bracketHeadroom = nextBracketStart - currentTaxableIncome;
const optimalConversion = Math.min(bracketHeadroom, iraBalance);
```

---

## Common Mistakes

1. **Claiming SS too early** — 62 is rarely optimal if you can wait
2. **Ignoring IRMAA** — High income = Medicare surcharges
3. **Not building taxable bucket** — Stuck waiting until 59½
4. **Over-conservative too early** — Need growth in early retirement
5. **Forgetting healthcare costs** — Average couple needs $315K+

---

## Talking Points for Advisors

- "What age do you want to retire, and what's your backup if markets crash?"
- "Have you modeled your Social Security options?"
- "What's your healthcare plan between retirement and 65?"
- "This is a great window for Roth conversions — let's model it"
- "Let's build a spending plan with guardrails"

---

## Integration with Maven

| Tool | How It Helps |
|------|--------------|
| SS Optimizer | Compare 62/67/70 scenarios |
| Retirement Projections | Monte Carlo with sequence risk |
| Roth Conversion Analyzer | Find optimal conversion amounts |
| Tax Intelligence | Model conversion tax impact |
| What-If Simulator | "What if I retire at 60 vs 65?" |

---

*Pre-retirees need confidence they won't run out. Math + guardrails = peace of mind.*
