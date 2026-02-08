# Maven Research Agenda

*Eli's systematic path to wealth management expertise*

---

## The Why

**Maven is the AI wealth platform we're building to democratize what family offices do for the ultra-wealthy.**

Every person deserves access to sophisticated financial guidance — the kind of advice that helps them pay less tax, invest smarter, plan for their kids' education, and retire with confidence. Right now, that advice costs $500/hour or requires $10M in assets.

We're changing that.

**Maven Pro** gives advisors superpowers — 10x productivity, deeper analysis, better client outcomes.
**Maven Personal** gives everyone access — a wealth OS that actually knows you and works for you.

Every research session builds the foundation. This isn't academic — it's the knowledge that will help real advisors serve real clients, and help real people make better decisions with their money.

**The standard:** A 40-year veteran advisor would nod and say "that's right." But also: a first-time user could understand the recommendation.

---

## Philosophy

Don't be a chatbot that googles. Be an expert who **knows**.

Every research session:
1. Go deep, not broad
2. Find primary sources (IRS pubs, academic papers, practitioner guides)
3. Document learnings in `memory/research/`
4. Build into Maven's logic where applicable
5. Test understanding by modeling scenarios

---

## Priority Research Tracks

### Track 1: Tax-Efficient Investing (HIGH PRIORITY)

#### 1.1 Asset Location Optimization ✅ *Completed 2026-02-05*
- [x] Which assets in taxable vs tax-advantaged?
- [x] Municipal bonds: when and why
- [x] Tax-equivalent yield calculations
- [ ] State-specific muni strategies (CA, NY, NJ, etc.)
- [x] REITs and their tax treatment
- [x] MLPs and K-1 complexity
- [x] Qualified dividends vs ordinary dividends

**Key questions to answer:**
- What's the optimal asset location for a $2M household split 60/40 between taxable and qualified?
- When does tax-equivalent yield favor munis over corporates?
- How do state taxes change the muni calculus?

**Research file:** `memory/research/tax-efficient-investing/asset-location.md`

#### 1.2 Tax-Loss Harvesting Deep Dive ✅ *Completed 2026-02-05*
- [x] Wash sale rules (30-day, substantially identical)
- [x] Harvesting across accounts (spouse, IRAs)
- [x] Direct indexing mechanics ✅ *Completed 2026-02-08*
- [x] When is TLH NOT worth it?
- [x] Optimal harvesting frequency
- [x] Impact of step-up basis at death

**Research file (Direct Indexing):** `memory/research/tax-strategies/direct-indexing-deep-dive.md`

**Research file:** `memory/research/tax-efficient-investing/tax-loss-harvesting.md`

#### 1.3 Capital Gains Management
- [x] Short-term vs long-term optimization (covered in TLH doc)
- [x] Lot selection methods (FIFO, LIFO, specific ID, HIFO) (covered in TLH doc)
- [x] Netting rules (short vs long, gains vs losses) (covered in TLH doc)
- [x] $3K ordinary income offset (covered in TLH doc)
- [x] Carryforward rules (covered in TLH doc)

---

### Track 2: Retirement Accounts (HIGH PRIORITY)

#### 2.1 Account Types Deep Dive ✅ *Completed 2026-02-06*
- [x] Traditional IRA: contribution limits, deduction phaseouts, RMDs
- [x] Roth IRA: income limits, backdoor Roth, mega backdoor
- [x] 401(k): employee limits, employer match, after-tax contributions
- [x] SEP-IRA, SIMPLE IRA, Solo 401(k) for self-employed
- [x] 403(b), 457(b) for government/nonprofit

**Research file:** `memory/research/retirement-accounts/account-types-deep-dive.md`

#### 2.2 Roth Conversions ✅ *Completed 2026-02-05*
- [x] When to convert (tax bracket arbitrage)
- [x] Partial conversions
- [x] Pro-rata rule
- [x] 5-year rules (contributions vs conversions vs earnings)
- [x] Modeling conversion ladders

**Research file:** `memory/research/retirement-accounts/roth-conversions.md`

#### 2.3 Distribution Strategies ✅ *Completed 2026-02-06*
- [x] RMD calculations and timing
- [x] 72(t) SEPP for early access
- [x] NUA (Net Unrealized Appreciation) for company stock ✅ *Completed 2026-02-05*
- [x] QCDs (Qualified Charitable Distributions)
- [x] Sequencing withdrawals in retirement

**Research file (NUA):** `memory/research/retirement-accounts/nua-net-unrealized-appreciation.md`
**Research file (Distribution Strategies):** `memory/research/retirement-strategies/distribution-strategies.md`

---

### Track 3: Concentrated Positions (GOOD - DEEPEN)

#### 3.1 Strategy Deep Dives
- [x] Exchange funds: mechanics, providers, typical terms ✅ *Completed 2026-02-06*
- [x] Prepaid variable forwards: pricing, collar structures ✅ *Completed 2026-02-08*
- [x] Direct indexing: realistic alpha, provider comparison ✅ *Completed 2026-02-08*
- [ ] QOZ (Qualified Opportunity Zones): timing, requirements
- [ ] Installment sales: 453 rules
- [ ] Charitable strategies: CRT, CLT, DAF, private foundations

**Research file (Exchange Funds):** `memory/research/concentrated-positions/exchange-funds.md`
**Research file (VPFs):** `memory/research/concentrated-positions/prepaid-variable-forwards.md`
**Research file (Direct Indexing):** `memory/research/tax-strategies/direct-indexing-deep-dive.md`

#### 3.2 Restricted Stock Considerations
- [ ] Rule 144 limitations
- [ ] 10b5-1 plans
- [ ] Blackout periods
- [ ] Section 16 reporting

---

### Track 4: Estate & Gifting (BUILD COMPETENCY)

#### 4.1 Basics
- [ ] Gift tax exclusions ($18K/person, lifetime exemption)
- [x] Step-up in basis at death (covered in TLH and NUA docs)
- [ ] Estate tax thresholds and rates
- [ ] Community property vs common law states

#### 4.2 Strategies
- [x] GRATs (Grantor Retained Annuity Trusts) ✅ *Completed 2026-02-08*

**Research file (GRATs):** `memory/research/estate-planning/grats-grantor-retained-annuity-trusts.md`
- [ ] IDGTs (Intentionally Defective Grantor Trusts)
- [ ] Dynasty trusts
- [ ] Family LLCs/LPs
- [ ] Life insurance trusts (ILITs)

---

### Track 5: College Planning (BUILD COMPETENCY) ✅ *Partially Completed 2026-02-05*

- [x] 529 plans: state tax deductions, investment options
- [ ] Coverdell ESAs
- [ ] UTMA/UGMA accounts
- [x] Financial aid impact (FAFSA, CSS Profile)
- [x] Superfunding (5-year gift tax averaging)
- [x] 529-to-Roth rollover rules (new!)

**Research file:** `memory/research/college-planning/529-plans.md`

---

### Track 6: Fixed Income Deep Dive (PRIORITY - CURRENT GAP)

- [ ] Treasury bonds, notes, bills: taxation, SALT exemption
- [ ] Corporate bonds: credit risk, yield spreads
- [ ] Municipal bonds: GO vs revenue, AMT implications
- [ ] State-specific munis: CA, NY, NJ, TX, FL analysis
- [ ] Tax-equivalent yield formula and application
- [ ] I-Bonds: limits, taxation, redemption rules
- [ ] Bond ladders and duration management
- [ ] Preferred stock: taxation, risks

---

## Research Output Structure

```
memory/research/
├── tax-efficient-investing/
│   ├── asset-location.md ✅
│   ├── municipal-bonds.md
│   ├── tax-loss-harvesting.md ✅
│   └── capital-gains.md
├── retirement-accounts/
│   ├── account-types.md
│   ├── roth-conversions.md ✅
│   ├── nua-net-unrealized-appreciation.md ✅
│   └── distribution-strategies.md
├── concentrated-positions/
│   ├── exchange-funds.md
│   ├── pvf-structures.md
│   └── charitable-strategies.md
├── estate-planning/
│   └── basics.md
├── college-planning/
│   └── 529-plans.md ✅
├── fixed-income/
│   ├── municipal-bonds.md
│   └── tax-equivalent-yield.md
├── backdoor-roth-strategies.md ✅ (Track 7)
├── i-bonds-strategies.md ✅ (Track 7)
├── hsa-retirement-vehicle.md ✅ (Track 7)
├── daf-vs-private-foundation.md ✅ (Track 7)
├── series-ee-bonds-education.md ✅ (Track 7)
└── niit-planning.md ✅ (Track 7)
```

---

### Track 7: Underutilized & Cutting-Edge Strategies ✅ *Completed 2026-02-05*
*"What family offices know that most advisors don't"*

#### 7.1 Backdoor Roth & Mega Backdoor Roth ✅
- [x] Pro-rata rule mechanics (December 31 trap)
- [x] Aggregation rules (which accounts count)
- [x] 401(k) rollover fix for pro-rata
- [x] Mega backdoor plan requirements
- [x] After-tax contribution limits (415(c))
- [x] In-service distribution vs in-plan conversion

**Research file:** `memory/research/backdoor-roth-strategies.md`

#### 7.2 I-Bonds Optimization ✅
- [x] $10K limit workarounds (trusts, entities, gifts)
- [x] Trust account setup at TreasuryDirect
- [x] Deflation protection mechanics (0% floor)
- [x] Education exclusion for I-Bonds
- [x] Tax refund option (DISCONTINUED 2025)
- [x] Optimal holding period (5-year penalty zone)

**Research file:** `memory/research/i-bonds-strategies.md`

#### 7.3 HSA as Retirement Vehicle ✅
- [x] Triple tax advantage explained
- [x] "Shoebox" receipt strategy (no statute of limitations!)
- [x] Medicare coordination (6-month lookback trap)
- [x] Stealth IRA pivot at age 65
- [x] Medicare premium payments (tax-free)
- [x] IRMAA avoidance via HSA

**Research file:** `memory/research/hsa-retirement-vehicle.md`

#### 7.4 DAF vs Private Foundation ✅
- [x] Bunching strategy mechanics
- [x] Appreciated stock donation (double win)
- [x] AGI deduction limits (60%/30%/20%)
- [x] Private stock valuation (FMV vs cost basis)
- [x] 5% distribution requirement (foundations only)
- [x] When to use together

**Research file:** `memory/research/daf-vs-private-foundation.md`

#### 7.5 Series EE Bonds for Education ✅
- [x] Education tax exclusion rules
- [x] Income limits (2025: $99.5K single, $149.25K MFJ)
- [x] 20-year doubling guarantee
- [x] Child registration trap (owner must be 24+)
- [x] 529 conversion play
- [x] EE vs I bonds for education

**Research file:** `memory/research/series-ee-bonds-education.md`

#### 7.6 NIIT Planning ✅
- [x] What counts as net investment income
- [x] Real estate professional exception
- [x] Grouping elections for rentals
- [x] Material participation tests
- [x] MAGI reduction strategies
- [x] Trader status election
- [x] Trust compressed bracket problem

**Research file:** `memory/research/niit-planning.md`

---

## Weekly Research Goals

**Week 1:** Fixed income & municipal bonds (address current gap)
**Week 2:** Asset location optimization ✅ DONE
**Week 3:** Roth conversions & retirement distribution ✅ PARTIALLY DONE (Roth + NUA complete)
**Week 4:** Estate planning basics
**Week 5:** Underutilized strategies ✅ DONE (Track 7 complete)

---

## Success Metrics

I'll know I'm becoming expert when:
1. I catch my own mistakes before making them
2. I can model scenarios without looking things up
3. Sam's advisor friends can't stump me
4. Maven gives advice that matches what a $5K/hr wealth planner would say

---

## Research Session Log

### Session: 2026-02-05 (Evening) - "What Modern Advisors Miss"
**Focus:** Underutilized and cutting-edge strategies that most advisors don't think about

**Completed:**
1. **Backdoor Roth & Mega Backdoor Roth** - Pro-rata rule deep dive, December 31 trap, 401(k) rollover fix, mega backdoor plan requirements, 2025-2026 limits
2. **I-Bonds Optimization** - Trust account workaround for $10K limit, entity purchases, gift box timing, deflation protection mechanics, education exclusion, tax refund option DISCONTINUED 2025
3. **HSA as Retirement Vehicle** - Triple tax advantage, shoebox receipt strategy (no statute of limitations!), Medicare 6-month lookback trap, age 65 pivot, IRMAA avoidance
4. **DAF vs Private Foundation** - Bunching strategy math, appreciated stock double-win, AGI limits comparison (60/30/20), private stock FMV vs cost basis, when to use together
5. **Series EE Bonds for Education** - The forgotten tax exclusion, income limits, 20-year doubling guarantee, child registration trap, 529 conversion play
6. **NIIT Planning** - What counts/doesn't count, real estate professional exception, grouping elections, material participation tests, trader status, trust compressed brackets

**Key Alpha Insights:**
- Pro-rata rule uses December 31 balance, not contribution date
- I-Bond tax refund purchase ENDED January 31, 2025
- HSA receipt reimbursement has NO statute of limitations
- DAF gets FMV deduction for private stock, foundations get cost basis only
- EE bond owner must be 24+ at purchase (child can't own for education exclusion)
- NIIT thresholds haven't changed since 2013 (not inflation-indexed)

**Sources consulted:**
- TreasuryDirect.gov (official I-Bond and EE bond documentation)
- IRS Publications 969, Form 8815, Form 8960 instructions
- WhiteCoatInvestor backdoor Roth tutorial
- SDO CPA pro-rata rule explainer
- J.P. Morgan DAF vs Foundation comparison
- The Finance Buff trust account setup guide
- Our Tax Partner HSA Medicare coordination guides

**Quality standard:** "What would blow a client's mind if their advisor told them this?"

### Session: 2026-02-06 (Morning) - "Core Retirement Knowledge"
**Focus:** Retirement account fundamentals and distribution strategies

**Completed:**
1. **Retirement Account Types Deep Dive** - All account types with 2025-2026 contribution limits, deduction phaseouts, and eligibility rules (Traditional/Roth IRA, 401k/403b/457b, SEP/SIMPLE/Solo 401k, HSA, Spousal IRA)
2. **Distribution Strategies Update** - Enhanced RMD, 72(t) SEPP, and QCD documentation with 2026 limits
3. **Exchange Funds** - Complete guide to mechanics, 7-year holding period, 20% real estate requirement, providers, comparison to alternatives

**Key Alpha Insights:**
- QCD limit increases to $111,000 in 2026 (from $108,000 in 2025)
- QCD age (70½) has NOT changed — 2.5 year window before RMDs begin at 73
- Super catch-up (ages 60-63): $11,250 catch-up for 401k/403b in 2026
- Roth catch-up mandate: If FICA wages >$150K, all catch-up MUST be Roth starting 2026
- Exchange funds require 7-year hold for tax-free diversified basket distribution
- 457(b) + 401(k) combo allows double deferrals ($49,000+ for government employees)
- Trump Account: New IRA type for children born 2025-2028 with $1,000 government contribution

**Sources consulted:**
- IRS Notice 2025-67 (2026 limits)
- IRS Publications 590-A, 590-B (2025)
- IRS Notice 2022-6 (SEPP guidance)
- Fidelity, Mercer Advisors, Schwab, Vanguard retirement resources
- Tax Notes, SDT Planning on exchange funds
- Cache exchange fund documentation

### Session: 2026-02-05 (Earlier)
**Completed:**
1. Asset Location Optimization - comprehensive file covering tax efficiency rankings, Vanguard/Schwab research, decision framework
2. Tax-Loss Harvesting - wash sale rules (including IRA trap), netting rules, lot selection, when NOT to harvest
3. Roth Conversions - pro-rata rule, all three 5-year rules, bracket filling strategy, backdoor/mega backdoor
4. NUA (Net Unrealized Appreciation) - lump-sum distribution rules, triggering events, cherry-picking shares, when it doesn't make sense
5. 529 Plans - contribution limits, superfunding, qualified expenses, new Roth rollover rules (SECURE 2.0)

**Sources consulted:**
- IRS Publications 550, 575, 590-B, 970
- Fidelity, Schwab, Vanguard educational content
- Kitces.com practitioner articles
- SECURE 2.0 Act text

**Quality standard:** Deep enough that a 40-year veteran advisor would nod and say "that's right."

### Session: 2026-02-08 (Morning) - "Sophisticated Strategies Deep Dive"
**Focus:** Complex concentrated stock & estate planning strategies that separate family offices from regular advisors

**Completed:**
1. **Prepaid Variable Forwards (VPFs)** - Complete guide to collar mechanics, pricing (75-90% prepayment), McKelvey case implications, tax straddle rules, stock lending trap (TAM 200604033), rolling vs extending, provider landscape
2. **GRATs (Grantor Retained Annuity Trusts)** - Zero-out structure, 7520 hurdle rate, annuity calculations, graduated payments, mortality risk, rolling GRAT strategy, 2026 exemption landscape post-OBBBA
3. **Direct Indexing Deep Dive** - Four types (tax-focused, personalized, rules-based, completion portfolios), provider comparison (Frec, Wealthfront, Fidelity, Schwab, Parametric), realistic tax alpha expectations, charitable giving integration
4. **Product Innovation Insights** - Maven feature ideas including Concentrated Position Optimizer 2.0, GRAT Planning Module, Cross-Account Tax Coordination

**Key Alpha Insights:**
- VPF extensions are taxable events (McKelvey case, 2d Cir. 2018) — must "roll," never extend
- Stock lending provisions in VPF = immediate tax recognition (TAM 200604033)
- GRATs work best when assets beat IRS 7520 rate (~5% in 2025)
- Zeroed-out GRATs use virtually no lifetime exemption
- Direct indexing now accessible at $20K minimums (Frec, Wealthfront S&P 500)
- Direct indexing generates ~2x tax alpha vs ETF-to-ETF harvesting
- Charitable giving + direct indexing = donate highest-gain lots, immediately repurchase
- Cross-account tax coordination is an underserved market — potential Maven moat

**Sources consulted:**
- AQR Research (Liberman & Sosner, 2025) on VPF pricing and taxation
- IRS Revenue Ruling 2003-7 (VPF tax treatment)
- Estate of McKelvey v. Commissioner (2d Cir. 2018)
- TAM 200604033 (stock lending trap)
- Fidelity GRAT documentation (2025)
- Evolution Tax Legal GRAT guide
- Kitces.com direct indexing article (2024)
- Frec, Wealthfront, Fidelity, Schwab direct indexing documentation
- IRC §1092 (straddle rules), §2702 (GRAT valuation), §7520 (rates)

**Quality standard:** Would blow a 40-year advisor's mind AND give them actionable insights for their HNW clients.

---

*This is the work. Let's get smarter.*

*Created: 2026-02-05*
*Last Updated: 2026-02-08*
*Author: Eli*
