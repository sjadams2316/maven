# Maven Data Sources Roadmap

*What's live, what's mocked, and what APIs we need*

---

## Current Data Sources (Live)

| Source | Data | Cost | Status |
|--------|------|------|--------|
| **Yahoo Finance** | Stock quotes, historical prices | Free | ✅ Live |
| **CoinGecko** | Crypto prices (BTC, ETH, TAO, etc.) | Free | ✅ Live |
| **FMP (Financial Modeling Prep)** | Fundamentals, analyst ratings | Free tier | ✅ Live |
| **FRED** | Economic indicators (yields, spreads) | Free | ✅ Live |

---

## Features by Data Source

### Dashboard
| Feature | Data Source | Status | Notes |
|---------|-------------|--------|-------|
| Net Worth | User input + live prices | ✅ Live | Yahoo + CoinGecko |
| Holdings values | Yahoo/CoinGecko | ✅ Live | 60-sec refresh |
| Market overview | Yahoo/CoinGecko | ✅ Live | SPY, QQQ, BTC, TAO |
| Portfolio allocation | Calculated from holdings | ✅ Live | Client-side calc |

### Portfolio Lab
| Feature | Data Source | Status | Notes |
|---------|-------------|--------|-------|
| Holdings list | User input + prices | ✅ Live | |
| Allocation breakdown | Calculated | ✅ Live | |
| Factor exposure | **Heuristic/estimated** | ⚠️ Mock | Need Morningstar for real factors |
| Stress tests | Historical scenarios | ✅ Live | Uses known historical drops |
| Projections | Monte Carlo calc | ✅ Live | Client-side simulation |

### Tax Intelligence
| Feature | Data Source | Status | Notes |
|---------|-------------|--------|-------|
| Tax-loss opportunities | User holdings + prices | ✅ Live | |
| Wash sale detection | User transaction history | ⚠️ Partial | Need Plaid for full history |
| Cost basis | User input | ⚠️ Manual | Need Plaid for automatic |

### Market Fragility
| Feature | Data Source | Status | Notes |
|---------|-------------|--------|-------|
| VIX | Yahoo Finance | ✅ Live | |
| Credit spreads | FRED | ✅ Live | |
| Economic indicators | FRED | ✅ Live | |
| Sentiment indicators | **Estimated** | ⚠️ Mock | Need AAII, put/call data |

### Social Security
| Feature | Data Source | Status | Notes |
|---------|-------------|--------|-------|
| Benefit calculations | IRS formulas | ✅ Live | Coded from SSA rules |
| Break-even analysis | Calculated | ✅ Live | |

### Retirement Projections
| Feature | Data Source | Status | Notes |
|---------|-------------|--------|-------|
| Future value calcs | Calculated | ✅ Live | |
| Monte Carlo | Calculated | ✅ Live | Historical return distributions |

---

## APIs Needed to Go Fully Live

### Priority 1: Account Aggregation
**Plaid** — $500-2,000/month depending on volume

Unlocks:
- ✅ Automatic account balances
- ✅ Transaction history (for wash sales, spending)
- ✅ Cost basis (from some brokerages)
- ✅ 401(k) visibility (read-only)
- ✅ Real-time sync vs manual entry

**Integration effort:** 2-3 days
**Value:** CRITICAL — enables "client brain" and removes manual entry friction

---

### Priority 2: Fund Data
**Morningstar Direct/Office** — $25,000-50,000/year

Unlocks:
- ✅ Real factor exposures (not heuristics)
- ✅ Fund holdings (X-ray analysis)
- ✅ Expense ratios database
- ✅ Star ratings
- ✅ Style box classifications
- ✅ Historical performance

**Integration effort:** 1-2 weeks
**Value:** HIGH — institutional-grade fund analysis

**Alternative (cheaper):** 
- Morningstar API (usage-based, ~$100-500/month for low volume)
- Build from SEC 13F filings (free but limited)

---

### Priority 3: Real-Time Market Data
**Polygon.io** — $29-199/month

Unlocks:
- ✅ Real-time stock quotes (not 15-min delay)
- ✅ Options data
- ✅ Historical tick data
- ✅ Crypto real-time

**Integration effort:** 1 day
**Value:** MEDIUM — Yahoo works for now, Polygon for premium feel

---

### Priority 4: Sentiment/Alternative Data
**AAII Sentiment** — Contact for pricing
**CBOE** (put/call ratios) — Varies
**Quandl/Nasdaq** — $50-500/month

Unlocks:
- ✅ Real sentiment indicators for Fragility Index
- ✅ Options flow data
- ✅ Alternative datasets

**Integration effort:** 1-2 days each
**Value:** MEDIUM — improves Fragility Index accuracy

---

## Data Validation System

### Continuous Checks Needed

```yaml
data_validation:
  stock_prices:
    source: Yahoo Finance
    check_frequency: every 5 minutes
    validations:
      - price > 0
      - price changed in last 24h (market days)
      - no stale timestamps
    alert_if: price unchanged for 2+ hours during market
    
  crypto_prices:
    source: CoinGecko
    check_frequency: every 5 minutes
    validations:
      - price > 0
      - 24h change within reasonable bounds (-50% to +100%)
    alert_if: API returns error 3x consecutively
    
  economic_indicators:
    source: FRED
    check_frequency: daily
    validations:
      - data timestamp within expected range
      - values within historical bounds
    alert_if: data older than expected release schedule
    
  user_holdings:
    source: User input / Plaid
    check_frequency: on load
    validations:
      - ticker symbols valid
      - share counts > 0
      - cost basis reasonable (not $0 unless intended)
    alert_if: calculated values seem wrong (e.g., negative percentages)
```

### Health Dashboard (To Build)

```
/api/data-health endpoint returns:
{
  "status": "healthy" | "degraded" | "down",
  "sources": {
    "yahoo": { "status": "up", "lastCheck": "...", "latency": 120 },
    "coingecko": { "status": "up", "lastCheck": "...", "latency": 85 },
    "fred": { "status": "up", "lastCheck": "...", "latency": 200 },
    "fmp": { "status": "up", "lastCheck": "...", "latency": 150 }
  },
  "staleData": [],
  "errors": []
}
```

### Alert System

When data issues detected:
1. Log to monitoring system
2. Show user-facing indicator ("Data may be delayed")
3. Notify via Telegram/email if critical
4. Fallback to cached data if available

---

## Migration Path: Mock → Live

### Phase 1: Current (MVP)
- Manual data entry for holdings
- Yahoo/CoinGecko for prices
- Heuristics for factors
- FRED for economic data

### Phase 2: Account Aggregation (Next)
- Plaid integration
- Automatic account sync
- Transaction history
- Remove most manual entry

### Phase 3: Institutional Data
- Morningstar for fund data
- Real factor exposures
- Holdings transparency
- Professional-grade analysis

### Phase 4: Real-Time Premium
- Polygon for real-time quotes
- Streaming price updates
- Options data
- Premium experience

---

## Cost Summary

| Phase | Monthly Cost | Annual Cost |
|-------|--------------|-------------|
| Current | ~$0 | ~$0 |
| + Plaid | ~$500-1,000 | ~$6,000-12,000 |
| + Morningstar | ~$2,000-4,000 | ~$25,000-50,000 |
| + Polygon | ~$100-200 | ~$1,200-2,400 |
| **Full Stack** | ~$3,000-5,000 | ~$35,000-65,000 |

**Break-even:** At 1% AUM fee on $5M, annual revenue = $50K. Data costs covered.

---

*Update this document as data sources change.*
