# Modern Approaches to Portfolio Construction

## Evolution from Markowitz

### Modern Portfolio Theory (MPT) - The Foundation

Harry Markowitz (1952) introduced the mean-variance framework:

**Core Concepts**:
- Risk measured by variance (standard deviation)
- Returns measured by expected value
- Diversification reduces risk when correlation < 1
- Efficient frontier: best risk/return tradeoffs
- Two mutual fund theorem: all efficient portfolios are combinations of two portfolios

**The Efficient Frontier**:
- Hyperbolic curve in risk-return space
- Upper portion is efficient (maximum return per unit risk)
- Adding risk-free asset creates Capital Market Line (tangent)
- Tangency portfolio = Market portfolio in theory

### Limitations of Classic MPT

1. **Estimation Error** (The Real Killer)
   - Mean-variance optimization is an "error maximizer"
   - Small changes in inputs → extreme portfolio changes
   - Historical data poor predictor of future

2. **Extreme Portfolios**
   - Often produces concentrated positions
   - Large shorts combined with large longs
   - Uninvestable without constraints

3. **Unrealistic Assumptions**
   - Normal distributions (reality has fat tails)
   - Stable correlations (correlations spike in crises)
   - No transaction costs or taxes
   - Unlimited shorting/borrowing

4. **Ignores Higher Moments**
   - Skewness (asymmetric returns)
   - Kurtosis (fat tails)
   - Investors care about downside, not symmetric risk

---

## Risk Parity

### Concept

**Core Idea**: Allocate so each asset class contributes equally to portfolio risk.

Traditional 60/40 portfolio:
- 60% stocks / 40% bonds by capital
- But ~90% of risk comes from stocks!
- Bonds barely contribute to risk or diversification

Risk Parity approach:
- Equal risk contribution from each asset class
- Typically requires leverage to hit return targets
- More balanced exposure to different economic regimes

### All Weather Portfolio (Bridgewater)

Ray Dalio's pioneering risk parity strategy:

**Economic Regime Framework**:
| Environment | Best Assets |
|-------------|-------------|
| Rising Growth | Stocks, Corporate Credit |
| Falling Growth | Nominal Bonds, TIPS |
| Rising Inflation | TIPS, Commodities |
| Falling Inflation | Stocks, Nominal Bonds |

**Implementation**:
- Equal risk to each regime
- Leverage used to achieve target return
- Passive, systematic rebalancing

### Pros and Cons

**Advantages**:
- True diversification (risk balance, not capital balance)
- Performs in various regimes
- Historically good risk-adjusted returns
- Less dependent on equity risk premium

**Disadvantages**:
- Requires leverage (2-3x typically)
- Vulnerable to correlation regime shifts (Q1 2020)
- Relies on bonds as diversifiers (challenged in inflation)
- Complexity and costs

### Hierarchical Risk Parity (HRP)

**Marcos López de Prado's innovation**:
- Uses machine learning (clustering) to identify asset relationships
- Builds portfolio hierarchically based on correlation structure
- Avoids covariance matrix inversion (more stable)
- More robust to estimation error

---

## Factor Investing

### The Factor Zoo

Academic research has identified hundreds of "factors" - characteristics associated with return premia. The challenge: most don't survive out-of-sample.

### Established Factors

**Fama-French Five Factor Model**:
1. **Market** (β) - Equity risk premium
2. **Size** (SMB) - Small minus Big
3. **Value** (HML) - High minus Low book-to-market
4. **Profitability** (RMW) - Robust minus Weak
5. **Investment** (CMA) - Conservative minus Aggressive

**Additional Robust Factors**:
- **Momentum** - Past winners continue winning
- **Low Volatility** - Lower risk stocks outperform risk-adjusted
- **Quality** - Profitable, stable firms outperform

### Factor Implementation

**Long-Only Factor Tilts**:
- Tilt portfolio toward factor exposure
- Easier to implement, lower turnover
- Positive expected returns at lower cost

**Long/Short Factor Portfolios**:
- Pure factor exposure
- Hedge fund-like implementation
- Higher capacity constraints, more turnover

**Smart Beta ETFs**:
- Rules-based factor exposure
- Low cost (0.15-0.50%)
- Transparent methodology

### Factor Considerations

**Why Factors Work** (Competing theories):
- Risk-based: Compensation for bearing systematic risk
- Behavioral: Exploiting investor biases
- Structural: Market frictions and constraints

**Factor Crowding**:
- Popular factors become expensive
- Reduces forward-looking premium
- Requires dynamic factor assessment

**Factor Timing**:
- Factors go through cycles
- Value underperformed for decade+
- Timing is difficult, not recommended for most

---

## Direct Indexing

### What Is It?

Direct indexing = owning individual stocks that track an index, rather than buying the index fund itself.

**Benefits**:
1. **Tax-Loss Harvesting** - Sell losers, keep exposure
2. **Customization** - Exclude sectors, ESG screens
3. **Concentration Management** - Offset existing holdings

### Tax-Loss Harvesting at Scale

**How It Works**:
1. Own 500+ individual stocks tracking S&P 500
2. Daily monitoring for positions at a loss
3. Sell losers, replace with similar (not identical) stocks
4. Harvest losses to offset gains elsewhere
5. Wash sale rules prevent immediate repurchase

**Potential Alpha**:
- Studies suggest 1-2% per year tax alpha possible
- Most valuable in early years
- Diminishes as basis adjusts over time
- Schwab/Vanguard research: ~1% advantage vs. index

**Who Benefits Most**:
- High tax bracket investors
- Taxable accounts (not tax-deferred)
- Long time horizons (compounding of tax savings)
- Those with capital gains to offset

### Implementation

**Providers**:
- Parametric (Morgan Stanley)
- Vanguard Personalized Indexing
- Schwab Personalized Indexing
- Fidelity Managed FidFolios
- Wealthfront, Betterment

**Considerations**:
- Minimum investment: $100K-$250K typically
- Higher fees than index funds (0.30-0.40%)
- Complexity in tax reporting
- Wash sale coordination across accounts

---

## AI and Machine Learning in Portfolio Management

### Current Applications

**1. Signal Generation & Forecasting**
- Alternative data analysis (satellite, web scraping)
- Sentiment analysis from news/social media
- Earnings prediction from SEC filings
- Price prediction models

**2. Portfolio Optimization**
- Handling complex constraints
- Non-linear relationships
- Regime detection
- Robust optimization methods

**3. Execution & Trading**
- Optimal execution algorithms
- Transaction cost minimization
- Liquidity prediction
- Market impact modeling

**4. Risk Management**
- Stress testing
- Correlation regime detection
- Tail risk estimation
- Real-time portfolio monitoring

### ML Techniques Used

| Technique | Application |
|-----------|-------------|
| **Deep Learning (LSTM, Transformers)** | Time series forecasting |
| **Clustering** | Asset grouping, regime detection |
| **Random Forests** | Feature importance, return prediction |
| **Reinforcement Learning** | Dynamic portfolio optimization |
| **NLP/LLMs** | Sentiment, document analysis |
| **PCA/Autoencoders** | Dimensionality reduction, factors |

### Challenges

**Overfitting**: Financial data is noisy, non-stationary
- Walk-forward validation critical
- Out-of-sample testing essential
- Many published results don't replicate

**Black Box Problem**:
- Explainability requirements (regulatory, client)
- "Why" matters, not just "what"
- Trust and adoption barriers

**Data Quality**:
- Alternative data inconsistent
- Survivorship bias in backtests
- Look-ahead bias risks

### Realistic Assessment

**Where ML Helps**:
- Processing alternative data at scale
- Execution and trading optimization
- Risk modeling and stress testing
- Pattern recognition in high-frequency data

**Where ML Struggles**:
- Predicting long-term returns
- Regime changes and structural breaks
- Low signal-to-noise environments
- Explaining decisions to stakeholders

---

## Key Takeaways

1. **MPT is a starting point, not the answer** - Understand its limitations
2. **Risk-based approaches have merit** - Consider risk, not just capital allocation
3. **Factors are real but require patience** - Long horizons, diversified exposure
4. **Tax alpha is real alpha** - Direct indexing for taxable, high-income investors
5. **AI is a tool, not magic** - Best for specific applications, not general forecasting
