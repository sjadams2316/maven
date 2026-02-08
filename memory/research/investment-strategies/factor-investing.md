# Factor Investing: Deep Dive for Maven

*Research compiled: February 2026*

## Executive Summary

Factor investing is the strategy of targeting specific drivers of returns that have been documented across markets, time periods, and asset classes. The evidence for certain factors is among the strongest in financial economics — but implementation matters enormously, and many "factor" products are marketing exercises rather than rigorous implementations.

**Maven's Take:** Factors are real, but the expected premiums are smaller than historical returns suggest, and capturing them requires patience through multi-year drawdowns. Factor tilts make sense for long-horizon investors willing to be different from the market.

---

## 1. The Major Factors

### Value
**Definition:** Stocks trading at low prices relative to fundamentals (book value, earnings, cash flow, sales)

**Rationale:** 
- Risk-based: Value stocks are distressed, riskier, deserve higher returns
- Behavioral: Investors overpay for "glamour" stocks, neglect boring cheap ones

**Typical metrics:** Price-to-book, price-to-earnings, EV/EBITDA, price-to-cash-flow

**Historical premium:** ~3-5% annually (long-short), though significantly weaker post-2007

### Momentum
**Definition:** Stocks that have risen over the past 6-12 months tend to continue rising

**Rationale:**
- Behavioral: Underreaction to information, herding, confirmation bias
- NOT risk-based (this is important — momentum is an anomaly)

**Typical implementation:** 12-month return excluding most recent month (2-12 momentum)

**Historical premium:** ~4-8% annually (one of the strongest factors)

**Key risk:** Momentum crashes — spectacular losses when market reverses (2009, March 2020)

### Quality
**Definition:** Companies with high profitability, stable earnings, low leverage, high margins

**Rationale:**
- Behavioral: Investors underweight boring, consistent companies
- Risk-based argument is weaker (quality = LESS risky, should earn LESS)

**Typical metrics:** ROE, ROA, gross profitability, accruals, leverage ratios

**Historical premium:** ~2-4% annually, very stable

**The puzzle:** Quality factor challenges efficient market theory — why do "better" companies earn higher returns? Shouldn't that be priced in?

### Size (Small Cap)
**Definition:** Small companies outperform large companies

**Rationale:**
- Risk-based: Small companies are riskier, less liquid, more volatile
- Limits to arbitrage: Harder to short, less analyst coverage

**Historical premium:** ~2-3% annually, but controversial

**The catch:** Size premium largely disappeared when controlling for quality. Small-cap VALUE works; small-cap in general is weak.

### Low Volatility / Low Beta
**Definition:** Stocks with lower volatility/beta outperform on a risk-adjusted basis (and sometimes absolutely)

**Rationale:**
- Leverage constraints: Many investors can't lever up, so they reach for risky stocks
- Lottery preferences: Investors overpay for "exciting" high-vol stocks
- Benchmarking: Managers paid on absolute returns chase high-beta

**Historical premium:** ~2-4% annually risk-adjusted, mixed absolute

**Implementation challenge:** Often has negative momentum exposure, can underperform dramatically in bull markets

---

## 2. Academic Evidence

### Fama-French Research
**Three-Factor Model (1992-93):**
- Market (beta), Size (SMB), Value (HML)
- Explained most cross-sectional variation in returns
- Revolutionized asset pricing

**Five-Factor Model (2015):**
- Added Profitability (RMW) and Investment (CMA)
- Investment factor: Companies that invest less outperform (conservative vs aggressive)
- Profitability: High operating profitability beats low
- HML becomes redundant when controlling for other factors

**Key insight:** Value premium may be a proxy for profitability and investment characteristics

### AQR Research
AQR (led by Cliff Asness) has been instrumental in factor research:

**Major contributions:**
- "Value and Momentum Everywhere" (2013): Factors work across asset classes (stocks, bonds, currencies, commodities)
- Quality Minus Junk (QMJ): Rigorous quality factor construction
- Betting Against Beta: Formalized low-vol/low-beta as a factor
- "Fact, Fiction, and Factor Investing": Debunked common misconceptions

**AQR's stance:**
- Factors are real but premiums are lower going forward
- Multi-factor approaches reduce timing risk
- Long-only implementation captures ~half the premium
- Factor timing is very difficult

### Other Key Research
**DFA (Dimensional Fund Advisors):**
- Pioneers in implementing academic research
- Emphasis on patient, systematic capture of premiums
- Trading cost minimization

**Robeco:**
- Strong research on quality and low-volatility
- Enhanced value definitions

**MSCI:**
- Factor index construction standards
- Documentation of factor performance

---

## 3. Factor Premiums: Historical vs. Expected

### Historical Premiums (Long-Short, US, 1963-2023)
| Factor | Annual Premium | Sharpe Ratio | Notes |
|--------|---------------|--------------|-------|
| Value (HML) | 3.5% | 0.35 | Weak since 2007 |
| Momentum (UMD) | 6.5% | 0.50 | Crash risk |
| Size (SMB) | 2.0% | 0.15 | Weak alone |
| Profitability (RMW) | 3.0% | 0.45 | Very stable |
| Investment (CMA) | 2.5% | 0.35 | Consistent |
| Low Vol/BAB | 5.0% | 0.60 | Risk-adjusted |

### Why Expected Premiums Are Lower

**1. Publication effect:**
- Factors discovered → assets flow in → premiums compress
- In-sample vs out-of-sample degradation is real

**2. Transaction costs:**
- Historical returns ignore trading costs
- Momentum is expensive to trade
- Small-cap factors even more so

**3. Implementation shortfall:**
- ETFs and funds don't capture full theoretical premium
- Long-only captures ~40-60% of long-short premium
- Diversification requirements dilute factor exposure

**4. Crowding:**
- More money chasing same factors
- Factor valuations have risen
- Expected returns mechanically lower

**AQR's estimate (2020s):** Expect 1-2% premium for diversified factor exposure, not 3-5%

### Forward-Looking Estimates
| Factor | Expected Premium | Confidence |
|--------|-----------------|------------|
| Value | 1-2% | Medium (currently cheap) |
| Momentum | 2-3% | Medium-High (behavioral) |
| Quality | 1-2% | High (stable, defensive) |
| Size | 0-1% | Low (quality-controlled) |
| Low Vol | 1-2% | Medium (leverage constraints persist) |

---

## 4. Factor Timing: Does It Work?

### Short Answer: Probably Not

**The evidence:**
- Factors have some predictability (value spread, momentum, etc.)
- BUT: Transaction costs, taxes, and model uncertainty destroy profits
- Even factor experts (AQR, DFA) don't time factors

**Asness's view:** "If timing factors was easy, we'd do it. We don't."

### Why Timing Is Hard

**1. Long cycles:**
- Value underperformed for 13+ years (2007-2020)
- Can you hold through a decade of underperformance?
- Most investors can't, and that's why premiums exist

**2. Reversals are unpredictable:**
- Value looked dead in 2020
- Then: 25%+ outperformance in 2021-2022
- No reliable signal predicted the turn

**3. Whipsaw costs:**
- Getting out at the wrong time
- Missing the snapback
- Trading costs compound

**4. Career risk:**
- Fund managers can't afford to be different for 10 years
- "Keynes problem" — the market can stay irrational longer than you can stay employed

### What The Research Shows

**Value timing via value spread:**
- When value is historically cheap → expect higher returns
- But: Statistical significance is weak, timing is imprecise
- Conclusion: Slight predictability, not actionable

**Momentum timing via momentum spread:**
- Crowded momentum = worse forward returns
- Again: Not reliable enough for trading

**Maven's conclusion:** Don't time factors. Stay diversified, stay invested.

---

## 5. Multi-Factor Approaches

### Why Combine Factors?

**1. Diversification:**
- Factors have low correlation with each other
- Momentum and value are negatively correlated (~-0.5)
- Combining smooths the ride

**2. Reduces timing risk:**
- Don't need to know which factor will work
- Something is usually working

**3. Practical portfolio construction:**
- Can target factor exposure while staying close to benchmark
- Easier to implement than pure single-factor

### Combination Approaches

**1. Mixing (Portfolio of factor portfolios):**
- Hold separate value, momentum, quality sleeves
- Simple, transparent
- Can be tax-inefficient (selling winners in one sleeve)

**2. Integrating (Multi-factor stock selection):**
- Score each stock on multiple factors
- Select stocks that rank well on MULTIPLE factors
- More efficient, but less transparent
- Avoids "negative momentum value" and "low quality momentum" stocks

**3. Sequential (Factor + Factor):**
- Start with value universe, add quality screen
- Or momentum with profitability overlay
- Simple to explain, but may miss some opportunities

### Academic Support

**The "Profitability + Value" combo:**
- Novy-Marx (2013): Gross profitability is quality metric
- Value + Profitability works better than either alone
- "Quality Value" or "Enhanced Value" strategies

**Asness, Frazzini, Pedersen:**
- Multi-factor beats single factor on risk-adjusted basis
- Integration typically beats mixing

### Implementation

**Best practice:**
- Use 3-5 factors (diminishing returns beyond that)
- Rebalance systematically (quarterly or semi-annually)
- Be aware of factor exposure drift

---

## 6. Factor ETFs: Best Options

### Value ETFs
| Ticker | Name | Expense | Notes |
|--------|------|---------|-------|
| **VTV** | Vanguard Value | 0.04% | Simple, large-cap value |
| **VLUE** | iShares MSCI USA Value Factor | 0.15% | Multi-metric value |
| **RPV** | Invesco S&P 500 Pure Value | 0.35% | Concentrated value |
| **AVUV** | Avantis US Small Cap Value | 0.25% | Best small value (DFA-style) |
| **VBR** | Vanguard Small-Cap Value | 0.07% | Cheap, broad small value |

**Maven's pick:** AVUV for small value, VTV for large value (keep it simple)

### Momentum ETFs
| Ticker | Name | Expense | Notes |
|--------|------|---------|-------|
| **MTUM** | iShares MSCI USA Momentum | 0.15% | Most popular |
| **PDP** | Invesco DWA Momentum | 0.63% | Different methodology |
| **QMOM** | Alpha Architect US Quantitative Momentum | 0.49% | Academic-style |

**Maven's pick:** MTUM is fine, but momentum is expensive to index. Be aware of tracking.

### Quality ETFs
| Ticker | Name | Expense | Notes |
|--------|------|---------|-------|
| **QUAL** | iShares MSCI USA Quality Factor | 0.15% | Standard quality |
| **DGRW** | WisdomTree US Quality Dividend Growth | 0.28% | Quality + dividends |
| **SPHQ** | Invesco S&P 500 Quality | 0.15% | S&P quality methodology |

**Maven's pick:** QUAL for simplicity

### Multi-Factor ETFs
| Ticker | Name | Expense | Notes |
|--------|------|---------|-------|
| **LRGF** | iShares MSCI USA Multifactor | 0.20% | Value + Momentum + Quality + Size |
| **GSLC** | Goldman Sachs ActiveBeta US Large Cap | 0.09% | Low-cost multi-factor |
| **VFMF** | Vanguard US Multifactor | 0.18% | Vanguard's entry |

**Maven's pick:** GSLC for cost, LRGF for purer factor exposure

### Low Volatility ETFs
| Ticker | Name | Expense | Notes |
|--------|------|---------|-------|
| **USMV** | iShares MSCI USA Min Vol | 0.15% | Minimum volatility |
| **SPLV** | Invesco S&P 500 Low Volatility | 0.25% | Simple low-vol |

**Maven's pick:** USMV (more sophisticated construction)

### Small Cap Value (Best Factor Implementation)
| Ticker | Name | Expense | Notes |
|--------|------|---------|-------|
| **AVUV** | Avantis US Small Cap Value | 0.25% | Academic-quality |
| **DFSVX** | DFA US Small Cap Value | 0.30% | Original, advisor-only |
| **VBR** | Vanguard Small-Cap Value | 0.07% | Cheap but diluted |
| **SLYV** | SPDR S&P 600 Small Cap Value | 0.15% | Index-based |

**Maven's pick:** AVUV (combines value + profitability, excellent construction)

### International Factor ETFs
| Ticker | Name | Expense | Factor |
|--------|------|---------|--------|
| **AVDV** | Avantis International Small Cap Value | 0.36% | Value |
| **IVAL** | Alpha Architect International Quant Value | 0.39% | Value |
| **IMTM** | iShares MSCI International Momentum | 0.30% | Momentum |

---

## 7. Factor Tilts in Portfolio Construction

### How Much Factor Exposure?

**Conservative tilt (5-15% of equity allocation):**
- Modest tracking error
- Easier to stick with during drawdowns
- Still meaningful long-term impact

**Moderate tilt (15-30%):**
- Noticeable factor exposure
- Will feel different from market cap weighted
- Requires conviction

**Aggressive tilt (30%+):**
- Significant tracking error
- Only for those with deep understanding
- Multi-year underperformance is likely at some point

### Sample Portfolio Constructions

**Simple Factor Tilt (Conservative):**
```
70% VTI (Total Market)
15% AVUV (Small Value)
15% International (VXUS)
```
Factor exposure: Mild value + size tilt

**Multi-Factor Tilt (Moderate):**
```
50% VTI (Total Market)
20% AVUV (Small Value)
10% MTUM (Momentum)
20% International
```
Factor exposure: Value + size + momentum

**Factor-Forward (Aggressive):**
```
30% VTI (Total Market)
25% AVUV (US Small Value)
15% AVDV (Intl Small Value)
15% QUAL (Quality)
15% MTUM (Momentum)
```
Factor exposure: Heavy multi-factor

### Implementation Principles

**1. Factor exposure should match time horizon:**
- Short horizon (<5 years): Low/no factor tilt
- Medium (5-15 years): Moderate tilt
- Long (15+ years): Can handle aggressive tilt

**2. Understand tracking error:**
- Factor portfolios WILL underperform the market sometimes
- Can be dramatic (value 2017-2020: -40% vs growth)
- Behavior matters more than allocation

**3. Rebalancing:**
- Annual or semi-annual is fine
- Momentum requires more frequent rebalancing (costly)
- Tax-aware: Rebalance with contributions

**4. Tax considerations:**
- Factor strategies have higher turnover
- Keep factor funds in tax-advantaged accounts if possible
- AVUV etc. are relatively tax-efficient (low turnover, patient trading)

---

## 8. Criticisms and Risks

### Factor Crowding

**The problem:**
- Factors get discovered → money flows in
- Same stocks get bought by everyone
- Valuations rise, future returns fall

**Evidence:**
- Value became less cheap as factor investing grew
- Low-vol premium compressed
- Momentum can be overcrowded

**Mitigation:**
- Use multi-factor (diversification)
- Avoid most crowded implementations
- Accept that premiums may be lower going forward

### Extended Drawdowns

**Value (2007-2020):**
- 13 years of underperformance vs growth
- Cumulative underperformance: 200%+
- Even true believers questioned themselves

**Momentum crashes:**
- 2009: -70% in three months (long-short)
- 2020: Violent rotation when COVID reversed

**Small cap:**
- 1983-1999: Lost to large cap
- Periods of 15+ years of relative underperformance

**The risk:** You abandon the strategy at the worst time

### Data Mining / False Factors

**The problem:**
- Researchers test thousands of factors
- Some will "work" by chance
- Publication bias toward positive results

**Red flags:**
- Factor only works in one market
- No economic rationale
- Complex, overfitted methodology
- Short sample period

**Safe factors:** Value, momentum, profitability have:
- Economic rationales
- Work across markets and time
- Simple, transparent definitions

### Implementation Decay

**Theoretical vs actual returns:**
| Factor | Academic Premium | ETF Reality |
|--------|-----------------|-------------|
| Value | 3.5% | 1-2% |
| Momentum | 6.5% | 2-3% |
| Size | 2.0% | 0-1% |

**Why the decay:**
- Trading costs
- Timing differences
- Diversification requirements
- Management fees
- Long-only constraint

### Career Risk (For Advisors)

**The challenge:**
- Recommending factors means being different
- Being different means underperforming sometimes
- Clients leave when you underperform

**Result:** Many advisors stick to market cap weighted even if they believe in factors

---

## 9. How Maven Should Incorporate Factors

### Recommended Approach

**1. Factors as tilts, not bets:**
- Core portfolio remains market cap weighted
- Factor tilts add diversification and potential premium
- Never go all-in on any single factor

**2. Default to multi-factor:**
- Diversification across factors
- Reduces timing risk
- Simpler to explain

**3. Match to investor profile:**
| Investor Type | Factor Approach |
|---------------|-----------------|
| Conservative, short horizon | No factor tilt |
| Moderate, medium horizon | 10-20% factor tilt (value + quality) |
| Aggressive, long horizon | 20-30% factor tilt (multi-factor) |
| Sophisticated, long horizon | Custom factor mix |

**4. Emphasize small-cap value:**
- Strongest evidence (Fama-French, DFA)
- Most durable premium
- Less crowded than large-cap factors
- AVUV is excellent implementation

**5. Be cautious with:**
- Pure momentum (crash risk, high turnover)
- Pure low-vol (can lag badly in bull markets)
- Single-factor concentrated bets

### Communication Framework

**When discussing factors with users:**

"Factor investing targets specific characteristics that have historically earned higher returns — like buying cheaper stocks (value) or more profitable companies (quality). The evidence is strong that these premiums exist, but they require patience: there can be years where factors underperform. We use factor tilts as a diversification tool, not a get-rich-quick scheme."

**Key messages:**
1. Factors are academically validated, not marketing
2. Premiums are smaller than history suggests
3. Long time horizons required (10+ years)
4. Diversification across factors is wise
5. Behavior (staying invested) matters more than allocation

### Implementation in Maven Portfolios

**Standard portfolios:** Include option for factor tilt

**Factor allocation logic:**
```
If time_horizon < 5 years:
    factor_tilt = 0%
Elif time_horizon < 10 years:
    factor_tilt = 10%  # Quality + Value
Elif time_horizon < 20 years:
    factor_tilt = 15-20%  # Multi-factor
Else:
    factor_tilt = 20-25%  # Multi-factor, higher conviction
```

**Preferred factor vehicles:**
1. AVUV (Small Value) — Primary factor exposure
2. QUAL or GSLC (Quality/Multi-factor) — Secondary
3. VTV (Large Value) — Simple, cheap

**Avoid:**
- Expensive factor funds (>0.50% expense ratio)
- Factors without economic rationale
- Leveraged factor products
- Factor timing strategies

---

## 10. Key Takeaways

1. **Factors are real** — Value, momentum, profitability, and quality have robust evidence across markets and time periods

2. **But premiums are smaller now** — Expect 1-2% premium from factor exposure, not the 3-5% in historical data

3. **Don't time factors** — Even experts can't do it reliably. Stay diversified and invested.

4. **Multi-factor beats single factor** — Diversification across factors reduces the pain of any one factor underperforming

5. **Small-cap value is the best implementation** — Strongest evidence, least crowded, hardest to arbitrage away

6. **Behavior matters most** — The factor premium comes from holding through painful periods. If you'll sell during a drawdown, don't tilt.

7. **Keep it simple** — AVUV + quality tilt gets you 80% of the benefit with 20% of the complexity

8. **Factor tilts should match time horizon** — Short-term investors should stay market cap weighted

---

## References & Further Reading

**Foundational Papers:**
- Fama, E. F., & French, K. R. (1992). "The Cross-Section of Expected Stock Returns"
- Fama, E. F., & French, K. R. (2015). "A Five-Factor Asset Pricing Model"
- Jegadeesh, N., & Titman, S. (1993). "Returns to Buying Winners and Selling Losers"
- Novy-Marx, R. (2013). "The Other Side of Value"

**AQR Research:**
- Asness, C., Frazzini, A., & Pedersen, L. H. (2019). "Quality Minus Junk"
- Asness, C. (2020). "Fact, Fiction and Factor Investing"
- Asness, C., Moskowitz, T., & Pedersen, L. H. (2013). "Value and Momentum Everywhere"

**Practitioner Resources:**
- Dimensional Fund Advisors research library
- AQR research library (aqr.com/insights)
- Cliff Asness blog posts
- Alpha Architect research

---

*Last updated: February 2026*
*Version: 1.0*
