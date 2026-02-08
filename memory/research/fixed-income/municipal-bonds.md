# Municipal Bonds — Deep Dive

*Research for Maven Tax Intelligence & Portfolio Optimization*

---

## The Basics

**Municipal bonds ("munis")** = Debt issued by state/local governments to fund public projects.

**Key tax benefit:** Interest is exempt from federal income tax, and often state/local tax if you buy bonds from your state of residence.

---

## Tax Treatment

### Federal Level
- Interest income: **Federally tax-exempt** (for most munis)
- Capital gains: **Taxable** at LTCG/STCG rates if sold at a profit
- Some munis subject to AMT (Alternative Minimum Tax) — check before buying

### State Level
| Scenario | State Tax Treatment |
|----------|---------------------|
| In-state muni (CA resident buys CA muni) | State tax-exempt |
| Out-of-state muni (CA resident buys NY muni) | State taxable |
| US Territory munis (Puerto Rico, Guam, etc.) | Exempt in ALL states |

**Key insight:** For high-tax state residents (CA, NY, NJ), in-state munis provide double tax benefit.

---

## Tax-Equivalent Yield (TEY)

The yield a taxable bond must earn to match a muni's after-tax return.

### Formula

**Federal only:**
```
TEY = Muni Yield / (1 - Federal Tax Rate)
```

**Federal + State (for in-state munis):**
```
TEY = Muni Yield / (1 - (Federal Rate + State Rate - (Federal Rate × State Rate)))
```

Simplified (ignoring deduction interaction):
```
TEY = Muni Yield / (1 - Combined Tax Rate)
```

### Example Calculations

**Scenario 1: Top federal bracket, no state tax (TX, FL, NV resident)**
- Muni yield: 4%
- Federal rate: 37%
- TEY = 4% / (1 - 0.37) = **6.35%**

**Scenario 2: Top bracket + California (13.3%)**
- Muni yield: 4% (CA muni)
- Combined rate: ~50.3% (37% + 13.3%, simplified)
- TEY = 4% / (1 - 0.503) = **8.05%**

**Scenario 3: Same investor, OUT-of-state muni**
- 4% NY muni for CA resident
- After CA state tax: 4% × (1 - 0.133) = 3.47% effective
- Then compare to taxable using federal-only TEY

---

## High-Tax State Analysis

### California (13.3% top rate)
- Strong case for in-state CA munis
- Large, liquid CA muni market
- Consider: CA GO bonds, CA infrastructure bonds
- Watch: CA's fiscal health, pension obligations

### New York (10.9% top rate + NYC 3.876%)
- NYC residents face ~14.8% combined state/local
- In-state NY munis extremely valuable for NYC residents
- TEY for NYC resident: 4% muni = 8.7%+ taxable equivalent

### New Jersey (10.75% top rate)
- Similar story to NY/CA
- Smaller in-state muni market than CA/NY

### States with no income tax (TX, FL, WA, NV, etc.)
- National muni funds work fine
- No state tax benefit to chase
- Focus on credit quality and federal tax benefit

---

## When Munis DON'T Make Sense

1. **Tax-advantaged accounts (IRA, 401k)** — No tax benefit, just lower yield
2. **Low tax bracket investors** — TEY math doesn't work
3. **AMT exposure** — Some private activity bonds trigger AMT
4. **Need for liquidity** — Muni market less liquid than Treasuries
5. **Credit concerns** — Not all munis are safe (see: Detroit, Puerto Rico)

---

## Types of Municipal Bonds

### General Obligation (GO) Bonds
- Backed by taxing power of issuer
- Generally safer
- Lower yields

### Revenue Bonds
- Backed by specific revenue source (toll road, hospital, etc.)
- Higher yields
- More credit risk

### Private Activity Bonds
- Fund private projects (airports, housing)
- May be subject to AMT
- Check before buying

---

## Practical Application in Maven

### For Portfolio Intelligence
- Flag when clients hold munis in IRAs (suboptimal)
- Calculate TEY for client's specific tax situation
- Recommend in-state vs national muni allocation

### For Tax Intelligence
- Include muni interest in income projections (for AMT)
- Model impact of muni allocation on overall tax liability

### Decision Tree
```
Is account tax-advantaged?
├─ Yes → Don't use munis, use taxable bonds
└─ No → Continue
    │
    What's client's marginal rate (Fed + State)?
    ├─ < 32% combined → Taxable bonds likely better
    └─ > 32% combined → Calculate TEY
        │
        Is client in high-tax state (CA, NY, NJ)?
        ├─ Yes → Strongly favor in-state munis
        └─ No → National muni fund is fine
```

---

## Sources
- Investopedia: Tax-Equivalent Yield
- Breckinridge Capital: In-State vs Out-of-State Munis
- American Century: Taxable Equivalent Yield
- Corporate Finance Institute: TEY Formula

---

*Research date: 2026-02-05*
*Status: Initial research — needs deepening on AMT rules, specific state analysis*
