# Vanta/Taoshi (Bittensor Subnet 8) Trading Signal Performance Research

**Date:** February 5, 2026  
**Purpose:** Assess viability of building an automated trading bot using Vanta/PTN signals  
**Status:** Deep Research Complete

---

## Executive Summary

**Bottom Line:** Building a trading bot on Vanta signals is a speculative venture with real potential, but expectations should be heavily tempered. The system is novel, unproven at scale, and most performance data comes from the platform itself rather than independent verification.

**Realistic Expected Returns:** 10-25% annually after fees (optimistic), with significant risk of underperformance or loss.

**Recommended Capital:** $10,000+ minimum for meaningful results; $25,000+ for proper diversification and risk management.

**Risk Assessment:** HIGH - This is closer to venture capital than passive investing.

---

## 1. Historical Miner Performance

### What the Dashboard Shows (as of Feb 5, 2026)

From the Taoshi Dashboard (dashboard.taoshi.io):
- **Top Crypto Miners:** ~21 active miners listed, roughly 5-6 in "Challenge Period"
- **Top Forex Miners:** ~22 active miners listed
- **Scoring:** Currently weighted 100% on Average Daily PnL (Sharpe/Sortino/Omega weights at 0)

### Miner Survival Reality

**Elimination Data (Last 7 days visible):**
- Multiple eliminations daily for "FAILED_CHALLENGE_PERIOD_TIME" (didn't complete 60-day challenge)
- Several eliminations for "FAILED_CHALLENGE_PERIOD_DRAWDOWN" (exceeded 10% drawdown)
- A few "MAX_TOTAL_DRAWDOWN" eliminations (established miners who blew up)

**Survival Statistics (Estimated):**
- **Challenge Period Pass Rate:** ~25% or less (only top 75th percentile + meet all criteria)
- **Long-term Survival:** Very few miners have verifiable 1-year+ track records
- **Elimination Causes:** Most fail during challenge period; established miners occasionally get wiped by >10% drawdowns

### Crypto vs. Forex Miners

Based on dashboard ranking:
- **Forex miners** appear to have more stable (lower volatility) returns
- **Crypto miners** have higher potential returns but more eliminations
- Top 3 overall positions split between crypto and forex

### Key Performance Rules

From Taoshi documentation:
- **Max Drawdown:** 10% limit (elimination if exceeded)
- **Challenge Period:** 60 days minimum
- **Top Percentile Required:** Must be in top 75th percentile to pass challenge
- **Carry Fees:** 
  - Crypto: 10.95% annually on leveraged positions
  - Forex: 3% annually
  - Indices: 5.25% annually
- **Spread Fee:** 0.1% × leverage on crypto orders
- **Slippage:** Variable based on leverage and liquidity

---

## 2. Glitch Financial Performance Data

### Advertised Performance

From Glitch Financial's Twitter (2025):
> "Cross market model... returned **7.48% on 5x aggressiveness over ~3 weeks** in live trading"

Annualized: ~130% (but this is a cherry-picked short window and unsustainable)

### Minimum Requirements

- **Crypto Strategies:** $2,500 minimum, $5,000+ recommended
- **Forex Strategies:** Higher minimums (unspecified)
- **Pricing:** Percentage-based monthly fee on allocation

### Platform Status

- **Still in Beta** (as of Feb 2026)
- Supported exchanges: OxSecurities (forex), HyperLiquid (crypto)
- Non-custodial (your funds stay in your exchange account)

### Red Flags

- No publicly audited track record
- Beta means bugs and execution issues still being resolved
- March 2025 recap mentioned "minor bugs" affecting order execution
- Performance claims lack independent verification

---

## 3. Signal Quality & User Experience

### What Users Are Saying

**Limited Independent Data:**
- No substantial Reddit threads with real user results found
- Discord is primary community hub (harder to research)
- Most "discussion" is marketing from Taoshi team

**Concerns Raised:**
- Beta platform stability issues
- Execution latency (improved recently but still relevant)
- Lack of transparent public dashboards with historical performance

### Independent Analysis

**None found.** This is a significant red flag. The system is too new and too niche for independent quant analysis.

---

## 4. Realistic Expectations After Fees

### Fee Stack (Building Your Own Bot)

| Fee Type | Cost |
|----------|------|
| Carry fees (crypto) | ~10.95%/year on leveraged positions |
| Spread/slippage | 0.1-0.5% per trade |
| Exchange fees | 0.02-0.1% per trade |
| Your infrastructure | $50-200/month for servers |
| Signal subscription | Unknown (Timeless signals, Request.taoshi.io) |

### Net Return Calculation (Hypothetical)

**Gross Return (optimistic top miner):** 40-50% annually  
**After carry fees:** 35-45%  
**After slippage/spread (high frequency):** 25-35%  
**After exchange fees:** 22-32%  
**After signal costs:** 15-25%  
**During drawdowns/bad periods:** Could easily go negative

**Realistic Range:** 10-25% annually in good conditions, -20% to +10% in bad conditions

### Capital Requirements

| Account Size | Monthly $ Gain (20% annual) | Viability |
|-------------|----------------------------|-----------|
| $2,500 | ~$42 | Not worth the complexity |
| $5,000 | ~$83 | Barely covers infrastructure |
| $10,000 | ~$167 | Minimum viable |
| $25,000 | ~$417 | Reasonable |
| $50,000+ | ~$833+ | Professional level |

---

## 5. Risk of Ruin Analysis

### Drawdown Scenarios

The 10% max drawdown rule for miners exists because **drawdowns are common**:

**Risk Factors:**
- Flash crashes (crypto can drop 20%+ in hours)
- Latency issues (your bot executes after the signal is stale)
- Model degradation (strategies that worked stop working)
- Black swan events (FTX-style collapses)

**Estimated Risk of Significant Loss (>25% drawdown):** 20-30% over 2 years

**Estimated Risk of Ruin (>50% loss):** 10-15% over 2 years with aggressive leverage

### Leverage Danger

Glitch offers "aggressiveness" settings. Higher aggression = higher leverage = higher returns AND higher drawdowns.

**5x leverage example:**
- 2% move against you = 10% loss
- 4% move against you = 20% loss (approaching wipeout)

---

## 6. Comparison to Alternatives

### vs. Buy and Hold BTC

**Historical BTC Returns:**
- 2024: ~120% (exceptional year)
- 2023: ~155% (recovery year)
- 2022: -65% (bear market crash)
- 2021: +60% (bull market)

**Average (2021-2024):** ~26% annually (highly volatile)

**Verdict:** BTC buy-and-hold has historically beaten most active trading strategies, but with massive drawdowns (65%+ in bear markets).

### vs. Traditional Quant Funds

**Industry Benchmarks:**
- Top quant funds (Renaissance, Citadel): 20-40%+ annually (unavailable to retail)
- Average quant fund: 10-15% annually
- Average hedge fund: 9-10% annually

**Verdict:** If Vanta achieves 15-25% net returns, it would be competitive with institutional quant strategies. That's a big IF.

### vs. Simple Index Investing

**S&P 500 Historical:** ~10% annually  
**Risk:** Much lower than crypto/Vanta

**Verdict:** For risk-adjusted returns, index funds likely win.

---

## 7. Technical Considerations for Bot Building

### Architecture Required

1. **Signal ingestion:** Connect to Taoshi validators or Request.taoshi.io
2. **Order execution:** Exchange API integration (HyperLiquid, etc.)
3. **Risk management:** Position sizing, stop-losses, max drawdown limits
4. **Monitoring:** 24/7 uptime, alerting, logging
5. **Backtesting:** Validate before live trading

### Development Effort

**Estimated Build Time:** 2-4 weeks for MVP, 2-3 months for production-ready  
**Maintenance:** Ongoing (strategies change, exchanges update, bugs emerge)

### Key Risks

- **Latency:** By the time you get the signal, execute, and fill, the edge may be gone
- **Slippage:** Real execution worse than paper trading
- **Overfitting:** Miners may be overfitting to recent data
- **Correlation:** In crashes, all strategies correlate and lose together

---

## 8. Honest Assessment

### Pros

✅ Novel approach with real innovation  
✅ Open-source, transparent scoring  
✅ Non-custodial (you keep your funds)  
✅ Diversified "super strategy" from multiple miners  
✅ Low barrier to entry vs. prop trading firms  
✅ Active development and community  

### Cons

❌ Unproven at scale (still beta)  
❌ No independent performance verification  
❌ High elimination rate suggests fragile strategies  
❌ Complex fee structure eats into returns  
❌ Latency and execution risk for DIY bots  
❌ Crypto market correlation (if BTC crashes, everyone loses)  
❌ Platform risk (what if Taoshi pivots or fails?)  

### Who Should Consider This?

- Someone with **$25,000+** they can afford to lose
- Technical ability to build and maintain trading infrastructure
- Understanding that this is **high-risk speculation**, not investing
- Genuine interest in the Bittensor/decentralized AI space
- Patience to wait 1-2 years for real performance data

### Who Should NOT Build This?

- Anyone seeking "passive income" or "set and forget"
- Anyone who can't afford to lose their capital
- Anyone without technical skills to debug production issues at 3am
- Anyone expecting consistent monthly returns

---

## 9. Recommendations for Sam

### Option A: Wait and Watch (Recommended)
- Let Glitch exit beta with 12+ months of public track record
- Let independent analysis emerge
- The opportunity isn't going away

### Option B: Small Experiment
- Allocate $5,000-10,000 maximum (money you can afford to lose)
- Use Glitch platform rather than building custom bot
- Track results for 6-12 months before scaling

### Option C: Build Custom Bot (High Effort)
- Only if genuinely interested in the technical challenge
- Start with paper trading for 3+ months
- Use smallest viable position sizes when going live
- Set strict drawdown limits (5-10% max)

### What I Would Tell Sam:

> "This is interesting technology, but it's essentially venture-stage. The honest answer is: nobody knows if this works long-term because it hasn't existed long enough. If you have money you're prepared to lose and enjoy the technical challenge, try it small. If you're looking for reliable returns to build wealth, stick with index funds and hold some BTC. The expected value of building a complex trading bot on unproven signals is probably negative when you factor in your time."

---

## Sources

- dashboard.taoshi.io (live miner data)
- subnetalpha.ai/subnet/vanta (technical overview)
- github.com/taoshidev/vanta-network (documentation)
- docs.taoshi.io (fee structures)
- support.glitch.financial (pricing, minimums)
- @GlitchFinancial Twitter (performance claims)
- Various crypto trading bot analysis articles
- Hedge fund industry benchmarks (Aurum, BNP Paribas)

---

*This research reflects publicly available information as of February 5, 2026. The cryptocurrency and DeFi space changes rapidly. This is not financial advice.*
