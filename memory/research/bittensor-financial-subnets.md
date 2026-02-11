# Bittensor Financial Subnets — Deep Dive for Maven

**Date:** 2026-02-11
**Status:** Research Complete

---

## Executive Summary

Three Bittensor subnets are directly relevant to Maven:

| Subnet | Name | What It Does | Maven Use Case |
|--------|------|--------------|----------------|
| **SN8** | Vanta (Taoshi) | Crowdsourced trading signals | Market intelligence, What-If scenarios |
| **SN64** | Chutes | LLM inference | Cheap AI for commodity tasks |
| **SN13** | (TBD) | Financial analytics | Market context, predictions |

**Bottom line:** Vanta (SN8) is the most immediately valuable — it provides institutional-grade trading signals that could power Maven's market intelligence layer.

---

## Subnet 8: Vanta Network (Taoshi)

### What Is It?

Vanta is a **decentralized prop trading firm**. Instead of hiring traders, it incentivizes the world's best quant systems to compete and submit trading signals. The top performers earn TAO rewards; the worst get eliminated.

**Think of it as:** Crowdsourced hedge fund alpha, available via API.

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                      VANTA NETWORK                          │
│                                                             │
│   MINERS (Traders/Quants)                                   │
│   ├── Submit LONG/SHORT/FLAT signals                       │
│   ├── Across Crypto, Forex, Equities                       │
│   ├── ML models, manual quant strategies                    │
│   └── Compete for TAO rewards ($30M+ pool)                 │
│                                                             │
│   VALIDATORS                                                │
│   ├── Verify signal validity                                │
│   ├── Track portfolio performance                           │
│   ├── Eliminate bad performers (>10% drawdown)             │
│   └── Publish rankings & metrics                            │
│                                                             │
│   CONSUMERS (via Request Network)                           │
│   ├── Purchase signals via Stripe/PayPal                   │
│   ├── Get API key for real-time data                       │
│   └── Auto-trade via partners (Glitch, Timeless)           │
└─────────────────────────────────────────────────────────────┘
```

### Asset Classes Covered

From their config, Vanta supports:

**Crypto:**
- BTC, ETH, SOL, DOGE, XRP, ADA, DOT, LINK, AVAX, ATOM
- TAO (of course)
- Many more altcoins

**Forex:**
- EUR/USD, GBP/USD, USD/JPY, AUD/USD
- Major and minor pairs

**Equities:**
- SPY, QQQ, IWM (ETFs)
- Individual stocks (expanding)

### Performance Metrics

Vanta tracks institutional-grade metrics for each miner:

| Metric | What It Measures |
|--------|-----------------|
| **Sharpe Ratio** | Risk-adjusted returns |
| **Sortino Ratio** | Downside risk-adjusted returns |
| **Calmar Ratio** | Return vs max drawdown |
| **Omega Ratio** | Probability-weighted gains vs losses |
| **Max Drawdown** | Worst peak-to-trough decline |
| **Win Rate** | % of profitable trades |

**Elimination Rules:**
- >10% max drawdown = eliminated
- Plagiarism (copying other miners) = eliminated
- Failed 60-day challenge = eliminated

### Accessing Vanta Data

**Option 1: Request Network (Official)**
1. Go to https://request.taoshi.io
2. Register and select Subnet 8 (Vanta)
3. Choose a validator
4. Pay via Stripe
5. Receive API key

**Option 2: Partner Integrations**
- **Glitch Financial** — Auto-trade execution
- **Timeless** — Signal service for manual execution

**Option 3: Run Your Own Validator**
- More complex, requires infrastructure
- Direct access to all signals
- Higher barrier but no subscription fees

### Pricing (Estimated)

Taoshi hasn't published fixed pricing — it's validator-dependent. Based on similar services:

- **Basic signals:** $50-200/month
- **Premium (all asset classes, real-time):** $200-500/month
- **Enterprise/API:** Custom pricing

### API Response Format (Expected)

```json
{
  "miner_id": "5CPtntJY...VCJ6C3",
  "timestamp": "2026-02-11T14:30:00Z",
  "signals": [
    {
      "pair": "BTC/USD",
      "signal": "LONG",
      "leverage": 2.0,
      "confidence": 0.85,
      "entry_price": 66500,
      "take_profit": 68000,
      "stop_loss": 65500
    },
    {
      "pair": "EUR/USD",
      "signal": "SHORT",
      "leverage": 1.5,
      "confidence": 0.72
    }
  ],
  "miner_metrics": {
    "sharpe_ratio": 2.4,
    "sortino_ratio": 3.1,
    "max_drawdown": 0.045,
    "win_rate": 0.62
  }
}
```

---

## Maven Integration Opportunities

### 1. Market Intelligence Layer

**What:** Feed Vanta signals into Maven's Oracle and market context features.

**Implementation:**
```
Client asks: "What's the market outlook for BTC?"

Maven Oracle response:
"Based on our decentralized intelligence network:
- 73% of top-performing trading models are LONG on BTC
- Average confidence: 0.78
- Key levels: Support at $65,500, Resistance at $68,000
- Top Sharpe-ratio model (2.4) initiated LONG yesterday

This aligns with your portfolio's 8% crypto allocation..."
```

**Value:** Institutional-grade market intelligence for retail clients.

### 2. What-If Trade Simulator Enhancement

**What:** Use Vanta signals to provide "smart" scenario suggestions.

**Implementation:**
- User opens What-If Simulator
- Maven suggests: "Top trading models are bullish on NVDA. Simulate adding 5% position?"
- Show historical accuracy of similar signals

### 3. Risk Alerts

**What:** Alert clients/advisors when Vanta consensus shifts dramatically.

**Implementation:**
```
Alert: "Market Regime Shift Detected"
- 80% of Forex models flipped SHORT on EUR/USD (was 60% LONG)
- Your portfolio has 15% international exposure
- Consider reviewing hedging strategy
```

### 4. Fragility Index Enhancement

**What:** Add crowdsourced signal sentiment to Market Fragility Index.

**Current pillars:** VIX, credit spreads, yield curve, etc.
**New pillar:** Decentralized trader consensus (bullish/bearish/neutral)

---

## Subnet 64: Chutes (Already Researched)

See `/memory/research/bittensor-integration-research.md`

**Summary:** 85-95% cost reduction on LLM inference for commodity tasks.

---

## Other Potentially Relevant Subnets

### Subnet 13: Vanta Analytics (Different from SN8)

**Status:** Need more research

**What it might do:** Financial market data analysis, predictions

### Subnet 4: Targon

**What it does:** Multi-modal AI models

**Maven use case:** Could power document processing (tax docs, statements)

### Subnet 19: Namoray

**What it does:** Vision AI

**Maven use case:** OCR for financial documents, statement parsing

---

## Implementation Roadmap

### Phase 1: Chutes Integration (Now)
- [ ] Sam runs OAuth: `openclaw models auth login --provider chutes`
- [ ] Configure task routing (simple tasks → Chutes)
- [ ] A/B test quality
- **Timeline:** 1 week
- **Cost savings:** 85-95%

### Phase 2: Vanta Exploration (Q1 2026)
- [ ] Sign up for Request Network
- [ ] Get API access to Vanta signals
- [ ] Build proof-of-concept: signals → Oracle context
- **Timeline:** 2-4 weeks
- **Cost:** ~$200/month for signal access

### Phase 3: Deep Integration (Q2 2026)
- [ ] Integrate Vanta signals into What-If Simulator
- [ ] Add to Fragility Index
- [ ] Build advisor alerts for regime shifts
- **Timeline:** 1-2 months

---

## Risks & Considerations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Signal quality varies | Medium | Only use top-ranked miners |
| TAO price volatility | Low | Pay via Stripe (USD) |
| Regulatory concerns | Medium | Frame as "market intelligence" not advice |
| API reliability | Low | Cache signals, graceful fallbacks |

---

## Key Contacts & Resources

**Taoshi (Vanta):**
- Website: https://taoshi.io
- Dashboard: https://dashboard.taoshi.io
- Discord: https://discord.gg/2XSw62p9Fj
- Twitter: @taoshiio
- Request Network: https://request.taoshi.io

**Chutes:**
- Docs: https://docs.chutes.ai
- API: https://api.chutes.ai

---

## Conclusion

**Immediate action:** Complete Chutes setup for cost savings.

**High-value opportunity:** Vanta signals could differentiate Maven with "decentralized market intelligence" — something no competitor has. Frame it as:

> "Maven's market insights are powered by a network of the world's top-performing trading algorithms, competing 24/7 to provide the most accurate signals."

This is the Bittensor thesis applied to wealth management.

---

*Research compiled: 2026-02-11*
