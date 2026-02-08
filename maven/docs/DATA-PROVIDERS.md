# Financial Data Providers Comparison

## Current: Financial Modeling Prep (FMP)

**What we have:**
- ✅ Real-time quotes
- ✅ Analyst ratings & consensus (real data from 70-100+ analysts)
- ✅ Price targets (high/low/mean/median)
- ✅ Financial statements (income, balance sheet, cash flow)
- ✅ Key metrics & ratios (P/E, P/B, EV/EBITDA, margins, ROE, etc.)
- ✅ Growth rates (revenue, earnings, FCF)
- ✅ Company profiles (sector, industry, description, employees)
- ✅ Historical daily prices
- ✅ Basic ETF/Fund quotes
- ⚠️ ETF holdings (may require paid tier)
- ⚠️ Insider transactions (may require paid tier)

**Pricing:** Free tier = 250 calls/day

---

## Polygon.io — What it would add

**Unique capabilities:**
- 🔥 **Real-time streaming** — WebSocket connections for live tick data
- 🔥 **Options data** — Full options chain, Greeks, IV, open interest
- 🔥 **Tick-level data** — Individual trades and quotes (not just OHLC)
- ✅ **Aggregates** — Minute/hour/day bars with high precision
- ✅ **Crypto data** — Real-time crypto prices (BTC, ETH, etc.)
- ✅ **Forex data** — Currency pairs
- ✅ **Market status** — Pre-market, market hours, after-hours
- ✅ **Reference data** — Ticker details, exchanges, market holidays

**Best for:**
- Real-time trading applications
- Options analysis
- Algorithmic trading
- Live portfolio tracking with instant updates

**Pricing:** 
- Free: 5 API calls/minute, no real-time
- Basic ($29/mo): Unlimited, end-of-day
- Starter ($79/mo): Real-time, options

**Would enable for Maven:**
- Live price updates without page refresh
- Options strategies analysis in Portfolio Lab
- Real-time P&L tracking
- Crypto portfolio tracking (TAO, BTC, ETH)

---

## Alpha Vantage — What it would add

**Unique capabilities:**
- 🔥 **50+ Technical indicators** — Pre-calculated SMA, EMA, RSI, MACD, Bollinger, etc.
- 🔥 **Economic indicators** — GDP, inflation, unemployment, Fed funds rate
- 🔥 **Sector performance** — Real-time sector rotation data
- ✅ **Fundamental data** — Similar to FMP (statements, ratios)
- ✅ **Forex & Crypto** — Exchange rates, crypto prices
- ✅ **Global markets** — International stocks

**Best for:**
- Technical analysis
- Economic/macro research
- Sector rotation strategies

**Pricing:**
- Free: 25 calls/day (very limited)
- Premium ($50/mo): 75 calls/min, all data

**Would enable for Maven:**
- Pre-built technical indicator charts
- Economic dashboard (inflation, rates, GDP)
- Sector performance comparison
- Technical signals in Research tab

---

## Recommendation

| Provider | Best For | Monthly Cost | Priority |
|----------|----------|--------------|----------|
| **FMP** (current) | Fundamentals, analyst data | Free / $29 | ✅ Done |
| **Polygon** | Real-time, options, crypto | $29-79 | High — enables live updates + crypto |
| **Alpha Vantage** | Technical indicators, macro | $50 | Medium — nice-to-have |

**Next step:** Add Polygon for:
1. Real-time price streaming (WebSocket)
2. Crypto data (TAO, BTC, ETH) — fills the gap FMP doesn't cover
3. Options chain data (future feature)

---

## FMP ETF/Fund Capabilities

FMP supports ETFs and mutual funds:
```
SPY → SPDR S&P 500 ETF Trust (isEtf: true)
VFIAX → Vanguard 500 Index Fund (isFund: true)
QQQ → Invesco QQQ Trust (isEtf: true)
```

Available for ETFs:
- Profile (name, price, sector)
- Historical prices
- Basic metrics

May require paid tier:
- ETF holdings breakdown
- ETF sector weights
- Fund expense ratios
