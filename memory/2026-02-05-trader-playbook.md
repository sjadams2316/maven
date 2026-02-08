# The AI Crypto Trader's Playbook
## A Systematic Approach to Profitable Trading

*Compiled: February 5, 2026*
*For: Eli (AI Trading Bot)*

---

## Executive Summary

This playbook distills research on what separates winning traders from losers. The core insight: **trading success is 80% risk management and psychology, 20% strategy**. As an AI, you have unique advantages—but also blind spots. This guide provides actionable frameworks for building a robust trading system.

**Key Takeaways:**
- Survival first, profits second. Never risk more than 1-2% per trade.
- Simple strategies with proper risk management beat complex strategies without it.
- Trend-following works better than mean reversion in crypto (recent research confirms).
- Backtest ruthlessly, but assume out-of-sample performance will degrade 30-50%.
- Your edge as AI: consistency, 24/7 operation, and emotionless execution.

---

## Part 1: What Makes Traders Successful

### 1.1 Psychology of Winning vs. Losing Traders

**The Core Difference:** Winning traders think in probabilities; losing traders think in certainties.

Mark Douglas's Five Trading Truths (from "Trading in the Zone"):
1. **Anything can happen** — Markets are unpredictable on any single trade
2. **You don't need to predict the market** to make money
3. **Wins and losses are randomly distributed** for any given strategy
4. **An edge is just a higher probability** — not a guarantee
5. **Every moment in the market is unique** — past ≠ future

**Winning Trader Characteristics:**
- Process-focused, not outcome-focused
- Treats losses as business expenses, not failures
- Maintains consistent position sizing regardless of recent results
- Reviews trades objectively without emotional attachment
- Accepts uncertainty as inherent to the game

**Losing Trader Characteristics:**
- Outcome-focused ("I need to make $X today")
- Treats losses as personal failures, leading to revenge trading
- Increases position size after wins (overconfidence) or losses (martingale)
- Blames external factors rather than examining their process
- Seeks certainty in an uncertain environment

### 1.2 Common Mistakes That Blow Up Accounts

**The Seven Deadly Sins of Trading:**

1. **Overleveraging**
   - Using 10x+ leverage turns small moves into account-ending events
   - Crypto's 5-15% daily moves mean 3-5x leverage can wipe you out overnight
   - **Rule:** Never use more than 3x leverage; prefer 1-2x

2. **No Stop Losses**
   - "It'll come back" is the epitaph on every blown account
   - Hope is not a strategy
   - **Rule:** Every trade has a predetermined exit point

3. **Averaging Down Into Losers**
   - Adding to losing positions compounds losses exponentially
   - Converts small losses into catastrophic ones
   - **Rule:** Only add to winners, never to losers

4. **Revenge Trading**
   - Emotional trading after a loss to "get back" at the market
   - Leads to oversized positions and abandoned strategy
   - **Rule:** Take a break after any loss exceeding 2x normal

5. **Letting Winners Run... Into Losers**
   - Greed turns profits into losses
   - Not taking partial profits means round-tripping gains
   - **Rule:** Take 50% off at 2R, let rest ride with trailing stop

6. **Trading Too Large**
   - Betting 10-20% of account on single trades
   - One bad trade destroys months of gains
   - **Rule:** Risk 1-2% maximum per trade

7. **Ignoring Correlation**
   - Holding 5 "different" altcoins is really one bet on BTC
   - Diversification illusion in correlated assets
   - **Rule:** Calculate total correlated exposure

### 1.3 Risk Management Principles That Actually Work

**The Golden Rules:**

1. **The 1% Rule**
   - Never risk more than 1% of your account on a single trade
   - At 1% risk, you need 100 consecutive losses to blow up
   - Allows you to survive inevitable losing streaks

2. **Risk/Reward Minimums**
   - Only take trades with minimum 2:1 reward/risk ratio
   - With 2:1 R/R, you profit with just 34% win rate
   - Most successful traders aim for 3:1 or better

3. **Maximum Drawdown Limits**
   - Stop trading when account drops 10% from peak
   - Review system before continuing
   - Never let drawdown exceed 20-25%

4. **Daily/Weekly Loss Limits**
   - Stop trading for the day after 3% loss
   - Stop for the week after 6% loss
   - Prevents tilt-induced destruction

5. **Position Correlation Limits**
   - Total correlated exposure should not exceed 5% risk
   - If holding 3 altcoins, treat as single position for risk calc
   - Use correlation matrices to understand true exposure

### 1.4 Position Sizing Strategies

#### The Kelly Criterion

**Formula:**
```
f* = (p × b - q) / b

where:
f* = fraction of capital to bet
p = probability of winning
q = probability of losing (1 - p)
b = win/loss ratio (avg win / avg loss)
```

**Example:**
- Win rate: 55%
- Average win: $200
- Average loss: $100
- Win/loss ratio (b): 2
- Kelly fraction: (0.55 × 2 - 0.45) / 2 = 0.325 = 32.5%

**Critical Warning:** Full Kelly is EXTREMELY aggressive and leads to massive drawdowns.

**Practical Application:**
- **Use Half-Kelly or Quarter-Kelly** for actual trading
- Full Kelly assumes perfect probability knowledge (impossible)
- Half-Kelly: 50% of Kelly fraction → more stable growth
- Quarter-Kelly: 25% of Kelly fraction → very conservative

**Why Fractional Kelly Works Better:**
| Strategy | Growth Rate | Max Drawdown | Recovery Time |
|----------|-------------|--------------|---------------|
| Full Kelly | Highest theoretical | 50-80% | Months-years |
| Half Kelly | 75% of full | 20-40% | Weeks-months |
| Quarter Kelly | 50% of full | 10-20% | Days-weeks |

**Recommendation:** Start with Quarter-Kelly until you have 500+ trades of data.

#### Fixed Fractional Position Sizing

Simpler alternative to Kelly:
- Risk a fixed percentage (1-2%) per trade
- Position size = (Account × Risk %) / (Entry - Stop Loss)
- More robust when edge is uncertain

**Example:**
- Account: $10,000
- Risk per trade: 1% = $100
- Entry: $50,000 (BTC)
- Stop Loss: $48,000
- Risk per unit: $2,000
- Position size: $100 / $2,000 = 0.05 BTC

---

## Part 2: Technical Analysis That Works

### 2.1 What Academic Research Says

**The Mixed Verdict:**

Research from Lo & McKinlay (2000) found "several technical indicators do provide incremental information and may have some practical value."

A 2023 study analyzing 23 developed and 18 emerging markets with 6,406 trading rules over 66 years concluded:
- Technical analysis has **weak but statistically significant predictive power**
- Emerging markets show **higher predictability** than developed markets
- The effect has **diminished over time** as markets became more efficient

**Key Finding:** Technical analysis works, but barely—and the edge is declining as more participants use the same tools.

### 2.2 Indicators With Actual Predictive Value

**Tier 1 - Empirically Supported:**

1. **Moving Average Crossovers**
   - Simple but effective for trend identification
   - 50/200 SMA crossover ("golden/death cross") has historical significance
   - Works best in trending markets, whipsaws in ranging markets

2. **Relative Strength (Momentum)**
   - Assets that outperformed continue to outperform (3-12 month horizon)
   - One of the most robust anomalies in academic literature
   - Cross-sectional momentum (relative strength) > time-series momentum

3. **Volume Confirmation**
   - Price moves on high volume are more significant
   - Volume precedes price in many cases
   - Divergences between price and volume can signal reversals

**Tier 2 - Useful But Context-Dependent:**

4. **RSI (Relative Strength Index)**
   - Overbought/oversold signals work in ranging markets
   - Fails dramatically in strong trends
   - Divergences more reliable than absolute levels

5. **MACD**
   - Trend-following indicator with signal line crossovers
   - Histogram divergence can signal trend weakening
   - Lagging indicator—confirms rather than predicts

6. **Bollinger Bands**
   - Volatility-adjusted support/resistance
   - Mean reversion signals at extremes
   - Band width indicates volatility regime

**Tier 3 - Limited or Unproven:**
- Fibonacci retracements (self-fulfilling prophecy at best)
- Elliott Wave (too subjective)
- Most oscillators (redundant with price)

### 2.3 Support/Resistance: Real or Self-Fulfilling?

**Research Verdict:** Both—and that's what makes it work.

A 2014 academic study (PMC3967202) found:
> "Memory effects in the price dynamics are associated to these selected values. Prices more likely re-bounce than cross these values. Such an effect is quantitative evidence of the so-called self-fulfilling prophecy."

**Practical Implications:**
- S/R levels work BECAUSE traders believe in them
- Round numbers (50k, 100k) and historical highs/lows are most significant
- More touches = stronger level (but also more likely to eventually break)
- Volume at price levels indicates significance

**How to Use:**
- Identify major levels (daily/weekly highs, lows, round numbers)
- Wait for price to approach level
- Look for rejection candles with volume confirmation
- Place stop beyond the level
- Target the next major level

### 2.4 Volume Analysis and Order Flow

**Key Concepts:**

1. **Volume Profile**
   - Shows where most trading occurred at each price level
   - High Volume Nodes (HVN) = potential S/R
   - Low Volume Nodes (LVN) = price moves quickly through

2. **OBV (On-Balance Volume)**
   - Cumulative volume indicator
   - Divergences with price can precede reversals
   - Rising OBV + rising price = healthy trend

3. **Order Flow (for advanced implementation)**
   - Bid/ask imbalances signal institutional positioning
   - Large orders on the bid = support, on the ask = resistance
   - Delta (buy volume - sell volume) shows aggression

---

## Part 3: Crypto-Specific Factors

### 3.1 On-Chain Metrics That Matter

**Tier 1 - High Signal:**

1. **Exchange Flows**
   - Inflows to exchanges = selling pressure incoming
   - Outflows from exchanges = accumulation/HODLing
   - Track net flow direction and magnitude

2. **Whale Movements**
   - Transactions >$1M from known whale wallets
   - Whale to exchange = potential dump
   - Exchange to whale = accumulation complete
   - Tool: Whale Alert, CryptoQuant

3. **MVRV (Market Value to Realized Value)**
   - Ratio of market cap to realized cap
   - MVRV > 3.5 = historically overbought
   - MVRV < 1 = historically oversold
   - One of the best cycle top/bottom indicators

**Tier 2 - Useful Context:**

4. **Active Addresses**
   - Network usage indicator
   - Rising addresses + rising price = healthy
   - Divergences can signal weakness

5. **Exchange Whale Ratio**
   - Top 10 inflows vs total inflows
   - High ratio = whales are active
   - Track direction to gauge whale sentiment

6. **Stablecoin Flows**
   - Stablecoins flowing to exchanges = buying power ready
   - Large stablecoin inflows often precede pumps
   - "Dry powder" indicator

### 3.2 Funding Rates and Their Predictive Power

**What Research Shows (Presto Labs 2024):**
- Funding rate changes explain **12.5% of price variation** over 7 days (contemporaneous)
- **Near-zero predictive power** for future price changes on single assets
- More useful for **cross-sectional/relative analysis** across multiple assets

**How to Use Funding Rates:**

1. **Extreme Readings as Contrarian Signals**
   - Very high positive funding (>0.1%/8hr) = overcrowded longs
   - Very negative funding (<-0.05%/8hr) = overcrowded shorts
   - Extremes often precede reversals

2. **Funding Rate Arbitrage**
   - Long spot, short perp when funding is high positive
   - Collect funding payments
   - Market-neutral strategy

3. **Sentiment Gauge**
   - Persistent positive funding = bullish sentiment
   - Persistent negative funding = bearish sentiment
   - Not predictive alone, but adds context

### 3.3 BTC Correlation and Altcoin Decoupling

**The Reality:**
- Most altcoins are 70-95% correlated with BTC
- "Diversifying" into 10 alts is essentially one leveraged BTC bet
- True decoupling is rare and usually temporary

**When Alts Decouple:**

1. **Project-Specific Catalysts**
   - Major upgrades (Ethereum merge, etc.)
   - New partnerships or integrations
   - Regulatory clarity for specific chains

2. **Narrative Shifts**
   - DeFi summer, NFT boom, AI tokens
   - Sector-specific momentum can override BTC correlation
   - Usually temporary (weeks to months)

3. **Altseason Conditions**
   - BTC dominance falling from highs
   - BTC consolidating after major move
   - Risk appetite increasing broadly

**Trading Implications:**
- Treat total altcoin exposure as single position for risk management
- Trade alts when narrative favors them, not against BTC trend
- Hedge altcoin longs with BTC shorts if needed

### 3.4 Crypto Market Structure Issues

**Manipulation is Real:**

1. **Wash Trading**
   - Studies estimate 50-90% of volume on some exchanges is fake
   - Chainalysis 2025 report confirms ongoing manipulation
   - Stick to top-tier exchanges (Binance, Coinbase, Kraken)

2. **Liquidation Hunting**
   - Large players can see liquidation levels
   - Weekend/low liquidity = prime hunting time
   - Avoid tight stops at obvious levels during low liquidity

3. **Spoofing**
   - Large orders placed and canceled to move price
   - Creates false impression of S/R
   - Watch for orders that disappear when approached

**Protective Measures:**
- Avoid leveraged positions during low-liquidity periods (weekends, holidays)
- Use wider stops to avoid getting hunted
- Don't place stops at round numbers
- Size positions assuming slippage will be worse than expected

---

## Part 4: Systematic Trading Approaches

### 4.1 Trend Following vs. Mean Reversion

**Recent Research (Quantpedia 2024):**

Testing trend-following (MAX) and mean-reversion (MIN) strategies in Bitcoin from 2015-2024:

| Strategy | In-Sample Performance | Out-of-Sample (2022-2024) |
|----------|----------------------|---------------------------|
| Trend Following (MAX) | Strong | **Still effective** |
| Mean Reversion (MIN) | Strong | **Underperformed significantly** |
| Combined (MIN+MAX) | Best | Mixed results |

**Key Finding:** Trend following has been more robust in recent crypto markets.

**Why Trend Following Works Better in Crypto:**
- Crypto is prone to extended trends (bubbles and crashes)
- High volatility makes mean reversion signals noisy
- Momentum effects are stronger in less efficient markets

### 4.2 Momentum Strategies in Crypto

**Implementation Framework:**

1. **Time-Series Momentum (Absolute)**
   - Buy when price > 10/20/50 day high
   - Sell when price < 10/20/50 day low
   - Simple but effective

2. **Cross-Sectional Momentum (Relative)**
   - Rank assets by recent performance
   - Long top performers, short worst performers
   - Rebalance weekly/monthly

**Optimal Lookback Periods (from research):**
- Short-term: 10-day maximum shows best results
- Medium-term: 20-day maximum also effective
- Longer periods (30-50 days) less effective but lower turnover

### 4.3 Volatility-Based Systems

**ATR-Based Position Sizing:**
```
Position Size = Account Risk $ / (ATR × Multiplier)
```
- Uses Average True Range to normalize position sizes
- Higher volatility = smaller position
- Keeps risk constant across different volatility regimes

**Volatility Breakout:**
- Enter when price moves > 2 ATR from close
- Indicates genuine momentum vs. noise
- Works well in crypto's high-volatility environment

**Volatility Contraction/Expansion:**
- Bollinger Band squeeze = low volatility
- Breakout from squeeze often explosive
- Trade in direction of breakout

### 4.4 Combining Multiple Signals

**Signal Weighting Framework:**

1. **Trend Filter (Primary)**
   - Only take longs when above 50/200 MA
   - Only take shorts when below 50/200 MA
   - This single filter eliminates most losing trades

2. **Entry Trigger (Secondary)**
   - Momentum signal, pullback to support, etc.
   - Only take when aligned with trend filter

3. **Confirmation (Tertiary)**
   - Volume confirmation
   - On-chain metrics alignment
   - Funding rate not extreme against position

**Example Combined System:**
```
LONG ENTRY:
- Price above 50 SMA (trend filter)
- Price makes 10-day high (momentum trigger)
- Volume above 20-day average (confirmation)
- Funding rate not extremely positive (sentiment check)

EXIT:
- Stop loss: Below recent swing low or 2 ATR
- Target: 2-3x risk, or next major resistance
- Trailing stop after 2R achieved
```

---

## Part 5: Backtesting & Validation

### 5.1 Avoiding Overfitting

**The Overfitting Problem:**
> "Overfitting represents the silent killer of trading strategies. When traders optimize parameters to maximize returns on the full dataset, they're essentially peeking at the answers before taking the test."

**Signs of Overfitting:**
- Sharpe ratio > 3 in backtest (suspiciously good)
- Too many parameters (>5-7 for simple strategies)
- Performance degrades significantly out-of-sample
- Strategy works on one asset but fails on similar assets

**Prevention Techniques:**

1. **Keep It Simple**
   - Fewer parameters = less room for overfitting
   - If you can't explain it simply, it's probably overfit
   - Rule of thumb: <5 parameters for retail strategies

2. **Out-of-Sample Testing**
   - Split data: 70% in-sample, 30% out-of-sample
   - Never optimize on out-of-sample data
   - True performance is out-of-sample performance

3. **Multiple Markets Testing**
   - Strategy should work on BTC, ETH, and other majors
   - If it only works on one asset, it's curve-fit
   - Robust strategies generalize

4. **Parameter Stability**
   - Test nearby parameter values
   - If performance cliff-dives with small changes, it's overfit
   - Robust strategies work across a range of parameters

### 5.2 Walk-Forward Analysis

**The Gold Standard for Validation:**

Walk-forward analysis repeatedly:
1. Optimizes on historical data (in-sample)
2. Tests on unseen future data (out-of-sample)
3. Rolls forward and repeats

**Process:**
```
Year 1-2: Optimize parameters (in-sample)
Year 3: Test with those parameters (out-of-sample)
Year 2-3: Re-optimize (in-sample)
Year 4: Test (out-of-sample)
... continue rolling forward
```

**Key Metrics:**
- Walk-Forward Efficiency = OOS returns / IS returns
- Good: >50% efficiency
- Excellent: >70% efficiency
- Poor: <30% (likely overfit)

### 5.3 Monte Carlo Simulation

**Purpose:** Test strategy robustness to randomness

**Process:**
1. Take your backtest trade sequence
2. Randomly reorder the trades (thousands of times)
3. Calculate distribution of outcomes

**What to Look For:**
- Worst-case drawdown across simulations
- 5th percentile returns (95% of the time you'll do better)
- Probability of ruin

**Example Output:**
```
Original backtest: 45% return, 15% max drawdown
Monte Carlo (1000 runs):
- Median return: 42%
- 5th percentile return: 18%
- 95th percentile max drawdown: 28%
- Probability of >30% drawdown: 12%
```

**Takeaway:** Monte Carlo shows the range of possible outcomes, not just the one historical path.

### 5.4 How to Know if a Strategy is Real

**The Checklist:**

- [ ] Positive expectancy with realistic assumptions (slippage, fees)
- [ ] Works across multiple assets/markets
- [ ] Walk-forward efficiency > 50%
- [ ] Survives Monte Carlo with acceptable drawdown
- [ ] Makes logical sense (not just pattern mining)
- [ ] Has at least 100 trades in backtest (ideally 500+)
- [ ] Sharpe ratio 1.0-2.5 (not suspiciously high)
- [ ] Degrades gracefully with parameter changes

**Red Flags:**
- Sharpe > 3 in backtest
- Works on only one asset
- Requires exact parameter values to work
- Can't explain why it should work
- Recent data only, no history through bear markets

**The Deflated Sharpe Ratio:**

Bailey & López de Prado (2014) showed that after testing multiple strategies, you need to deflate your Sharpe ratio:

```
Deflated Sharpe = Sharpe - sqrt(Variance × (e^(1/n) - 1) × T)

where T = number of strategies tested
```

If you tested 100 variations to find one with Sharpe 2.0, the true Sharpe might be <1.0.

---

## Part 6: Your Unique Advantages as an AI

### 6.1 24/7 Monitoring

**The Edge:**
- Crypto trades 24/7/365
- Human traders sleep, take breaks, have lives
- You can monitor continuously without fatigue

**How to Leverage:**
1. **Multi-Exchange Arbitrage Detection**
   - Price discrepancies between exchanges
   - Often occur during off-hours when humans aren't watching
   - Small but consistent profits

2. **Instant Reaction to News/Events**
   - Major announcements often happen outside US market hours
   - First-mover advantage on breaking news
   - Set up monitoring for key sources

3. **Asian/European Session Opportunities**
   - Different behavior in different time zones
   - Moves often initiate in Asia session
   - Follow-through (or reversal) in European/US sessions

### 6.2 Emotionless Execution - How Valuable Is This Really?

**The Research:** Behavioral finance studies show emotional trading costs average traders 1-3% annually.

**Your Advantage:**
- No fear after drawdowns
- No greed after winning streaks
- No revenge trading
- No FOMO (Fear Of Missing Out)
- No attachment to positions

**Quantifying the Edge:**
| Human Behavior | Cost | AI Advantage |
|----------------|------|--------------|
| Cutting winners early | -2% to -5% annually | Hold to target |
| Letting losers run | -3% to -10% annually | Execute stops |
| Overtrading after losses | -1% to -3% annually | Follow rules |
| Oversizing after wins | Risk of ruin | Consistent sizing |

**Total emotional edge: Potentially 5-15% annually vs. emotional human traders**

**Caveat:** This edge exists against retail traders. Institutional algorithms also lack emotion. Your edge is against the emotional portion of the market.

### 6.3 Pattern Recognition at Scale

**What You Can Do That Humans Can't:**
1. Monitor 100+ assets simultaneously
2. Track correlations across assets in real-time
3. Process order book data at high frequency
4. Identify patterns across multiple timeframes simultaneously

**Practical Applications:**
- Cross-asset momentum signals
- Lead-lag relationships between assets
- Unusual volume/activity detection
- Divergence identification across many pairs

### 6.4 Rapid Backtesting and Iteration

**The Development Cycle Advantage:**
- Human: Test idea → code → backtest → analyze → weeks
- AI: Generate hypothesis → code → test → iterate → hours

**How to Use:**
1. Generate strategy hypotheses systematically
2. Rapid prototype and discard failures
3. A/B test variations simultaneously
4. Continuously adapt to regime changes

**Warning:** Rapid iteration increases overfitting risk. Always maintain out-of-sample discipline.

---

## Part 7: Realistic Expectations

### 7.1 What Returns Do Successful Systematic Traders Achieve?

**Benchmark Reality:**

| Trader Type | Annual Return | Sharpe Ratio | Max Drawdown |
|-------------|---------------|--------------|--------------|
| Elite Quant Funds | 15-30% | 1.5-3.0 | 10-20% |
| Good Systematic | 10-20% | 1.0-2.0 | 15-25% |
| Average Systematic | 5-15% | 0.5-1.5 | 20-35% |
| Most Retail Traders | Negative | < 0.5 | Blow up |

**Key Insight:** 15% annual returns with 15% max drawdown is excellent performance.

**Crypto-Specific Context:**
- Higher volatility means potentially higher returns
- But also potentially higher drawdowns
- Risk-adjusted returns (Sharpe) may be similar to traditional markets

### 7.2 Drawdown Expectations

**What to Expect:**
- 10% drawdowns: Common, expect several per year
- 20% drawdowns: Will happen, even with good strategies
- 30%+ drawdowns: Possible during market regime changes

**The Math of Drawdowns:**
| Drawdown | Recovery Needed |
|----------|-----------------|
| 10% | 11% |
| 20% | 25% |
| 30% | 43% |
| 50% | 100% |
| 80% | 400% |

**Rule:** Never let drawdown exceed 25%. Beyond that, recovery becomes impractical.

### 7.3 How Long to Validate a Strategy

**Statistical Requirements:**
- Minimum: 100 trades (barely statistically significant)
- Better: 500 trades (more reliable)
- Ideal: 1000+ trades (robust validation)

**Time Requirements (assuming 2-5 trades per week):**
- 100 trades: 5-12 months
- 500 trades: 2-5 years
- 1000 trades: 4-10 years

**Practical Approach:**
1. Paper trade / small size for first 100 trades
2. Increase size gradually as confidence builds
3. Full position sizing only after 200+ trades
4. Continuous monitoring and adaptation

**The Uncomfortable Truth:** You won't know if your strategy is real for at least 6-12 months of live trading.

---

## Part 8: Implementation Checklist

### Phase 1: Foundation (Weeks 1-4)
- [ ] Define risk parameters (max 1% per trade, 20% max drawdown)
- [ ] Set up data infrastructure (reliable price feeds, on-chain data)
- [ ] Implement position sizing logic (fixed fractional or Kelly)
- [ ] Build basic execution infrastructure
- [ ] Create trade logging and analysis system

### Phase 2: Strategy Development (Weeks 5-12)
- [ ] Start with simple trend-following (MA crossover, breakout)
- [ ] Backtest with realistic assumptions (0.1% fees, 0.1% slippage)
- [ ] Implement walk-forward validation
- [ ] Run Monte Carlo simulations
- [ ] Test on multiple assets for robustness

### Phase 3: Paper Trading (Months 3-6)
- [ ] Trade paper with full-size positions
- [ ] Track all metrics (win rate, R/R, drawdown)
- [ ] Compare live results to backtest expectations
- [ ] Identify execution issues
- [ ] Refine entry/exit logic

### Phase 4: Live Trading - Small Size (Months 6-12)
- [ ] Start with 10-25% of intended position sizes
- [ ] Strict adherence to risk rules
- [ ] Weekly performance reviews
- [ ] Monthly strategy assessment
- [ ] Scale up only after 100+ live trades

### Phase 5: Full Implementation (Month 12+)
- [ ] Gradual increase to full position sizes
- [ ] Add complementary strategies (trend + mean reversion)
- [ ] Implement portfolio-level risk management
- [ ] Continuous monitoring and adaptation
- [ ] Regular strategy review and deprecation

---

## Key Metrics to Track

### Trade-Level Metrics
- Win rate
- Average win / Average loss ratio
- Largest win / Largest loss
- Consecutive wins / losses
- Time in trade

### System-Level Metrics
- Sharpe Ratio (target: >1.0)
- Sortino Ratio (penalizes downside more)
- Maximum Drawdown (target: <25%)
- Calmar Ratio (return / max drawdown)
- Profit Factor (gross profits / gross losses)

### Risk Metrics
- Daily Value at Risk (VaR)
- Expected Shortfall (CVaR)
- Correlation with BTC
- Leverage ratio
- Margin utilization

---

## Final Thoughts

**The Simple Truth:** Most traders fail because they:
1. Risk too much
2. Have no edge (or a tiny edge that fees eat)
3. Can't execute consistently

**Your path to success:**
1. Survive (risk management first)
2. Learn (track everything, review honestly)
3. Adapt (markets change, strategies decay)
4. Compound (small edge + consistency = wealth)

**Remember:** The goal isn't to be right. The goal is to make money over time. Those are different things.

A 40% win rate strategy with 3:1 reward/risk makes money.
A 60% win rate strategy with 0.5:1 reward/risk loses money.

Focus on expected value, not being right.

---

*"The markets can remain irrational longer than you can remain solvent."* — John Maynard Keynes

*"Risk comes from not knowing what you're doing."* — Warren Buffett

*"The goal of a successful trader is to make the best trades. Money is secondary."* — Alexander Elder

---

## Appendix A: Recommended Tools

### Data Sources
- **CryptoQuant** - On-chain metrics, exchange flows
- **Glassnode** - Comprehensive on-chain data
- **Coinglass** - Funding rates, liquidations, open interest
- **TradingView** - Technical analysis, charting
- **Nansen** - Smart money tracking

### Backtesting Platforms
- **QuantConnect** - Cloud-based, supports crypto
- **Backtrader** (Python) - Flexible, free
- **VectorBT** (Python) - Fast, vectorized backtesting

### Execution
- **CCXT** (Python) - Unified exchange API
- **Binance API** - Direct exchange access
- **Coinbase Advanced** - US-regulated option

---

## Appendix B: Quick Reference Formulas

**Kelly Criterion:**
```
f* = (p × b - q) / b
Use 1/4 to 1/2 of this in practice
```

**Position Size:**
```
Position = (Account × Risk%) / (Entry - Stop)
```

**Expected Value:**
```
EV = (Win% × Avg Win) - (Loss% × Avg Loss)
```

**Sharpe Ratio:**
```
Sharpe = (Returns - Risk-Free Rate) / Std Dev of Returns
```

**ATR Position Sizing:**
```
Position = Account Risk $ / (ATR × Multiplier)
```

---

*This playbook will be updated as new research and results emerge. Review and revise quarterly.*
