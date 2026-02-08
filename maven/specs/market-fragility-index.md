# Maven Market Fragility Index™ - Technical Specification

## Overview

A composite indicator measuring systemic market fragility — not predicting *when* a correction happens, but measuring *how ripe* conditions are for one.

**Philosophy:** Based on complexity theory (Ubiquity by Mark Buchanan) — complex systems reach critical states where small triggers cause cascading failures. We measure proximity to critical state.

## Index Composition

### Six Pillars (Equal Weight: ~16.7% each)

#### 1. Valuation Stress (16.7%)
| Indicator | Source | Weight | Threshold Logic |
|-----------|--------|--------|-----------------|
| Buffett Indicator | FRED (WILSHIRE5000/GDP) | 40% | >150% = stress |
| Shiller CAPE | Shiller website / calc | 30% | >30 = stress |
| S&P 500 P/S Ratio | Calculated | 15% | >2.5 = stress |
| Equity Risk Premium | 10Y yield - E/P | 15% | <2% = stress |

#### 2. Credit & Liquidity Stress (16.7%)
| Indicator | Source | Weight | Threshold Logic |
|-----------|--------|--------|-----------------|
| HY Spread (OAS) | FRED (BAMLH0A0HYM2) | 35% | >500bp = stress |
| IG Spread | FRED (BAMLC0A0CM) | 25% | >150bp = stress |
| TED Spread | FRED (calc: 3M LIBOR - 3M T-bill) | 20% | >50bp = stress |
| Financial Conditions | FRED (NFCI) | 20% | >0 = tightening |

#### 3. Volatility Structure (16.7%)
| Indicator | Source | Weight | Threshold Logic |
|-----------|--------|--------|-----------------|
| VIX Level | Yahoo ^VIX | 40% | >25 = elevated, >35 = stress |
| VIX Term Structure | VIX - VIX3M | 25% | Backwardation = stress |
| MOVE Index | FRED or calc | 20% | >120 = stress |
| Realized vs Implied | 20d RV vs VIX | 15% | Gap >10 = complacency |

#### 4. Sentiment Extremes (16.7%)
| Indicator | Source | Weight | Threshold Logic |
|-----------|--------|--------|-----------------|
| AAII Bull-Bear | AAII website | 35% | Bull >50% or Bear <20% = frothy |
| Put/Call Ratio | CBOE | 25% | <0.7 = complacent |
| Margin Debt (YoY%) | FINRA | 25% | >20% YoY = excess |
| Fear & Greed | CNN | 15% | >80 = extreme greed |

#### 5. Market Structure (16.7%)
| Indicator | Source | Weight | Threshold Logic |
|-----------|--------|--------|-----------------|
| Top 10 Concentration | Calc from SPY holdings | 35% | >30% = concentrated |
| Advance/Decline | NYSE A/D line | 25% | Divergence from index = weak |
| % Above 200 DMA | Calc | 25% | <50% while index high = breadth fail |
| Correlation (avg) | Calc from sector ETFs | 15% | >0.8 = herding |

#### 6. Macro Backdrop (16.7%)
| Indicator | Source | Weight | Threshold Logic |
|-----------|--------|--------|-----------------|
| Yield Curve (10Y-2Y) | FRED (T10Y2Y) | 35% | Inverted = recession signal |
| LEI (YoY change) | Conference Board / FRED | 25% | Negative = contraction |
| ISM Manufacturing | FRED | 20% | <50 = contraction |
| Dollar Index (DXY) | Yahoo | 20% | >110 = liquidity stress |

---

## Scoring Methodology

### Per-Indicator Scoring (0-100)
Each indicator maps to a 0-100 stress score using percentile ranks against historical data (20-year lookback):

```
score = percentile_rank(current_value, historical_values)
```

For indicators where HIGH = stress (VIX, spreads):
- 95th percentile → 95 score

For indicators where LOW = stress (put/call, ERP):
- 5th percentile → 95 score (inverted)

### Pillar Scoring
Weighted average of indicators within pillar.

### Composite Index
Average of 6 pillars (equal weight).

### Risk Zones
| Score | Zone | Interpretation | Suggested Action |
|-------|------|----------------|------------------|
| 0-25 | 🟢 Resilient | Low fragility, mean-reversion works | Normal risk |
| 25-45 | 🟡 Normal | Typical market conditions | Standard allocation |
| 45-65 | 🟠 Elevated | Multiple stress signals | Reduce leverage |
| 65-80 | 🔴 Fragile | System approaching critical state | Defensive positioning |
| 80-100 | ⚫ Critical | High probability of dislocation | Capital preservation |

---

## Data Sources (Free Tier)

### FRED (Federal Reserve Economic Data)
- Base URL: `https://api.stlouisfed.org/fred/series/observations`
- API Key: Free registration
- Series we need:
  - `WILSHIRE5000PRFC` - Wilshire 5000 (for Buffett)
  - `GDP` - Nominal GDP
  - `BAMLH0A0HYM2` - HY OAS Spread
  - `BAMLC0A0CM` - IG Spread  
  - `T10Y2Y` - 10Y-2Y Spread
  - `NFCI` - Financial Conditions Index
  - `VIXCLS` - VIX (daily)

### Yahoo Finance (free)
- VIX, VIX3M, DXY
- S&P 500 for calculations
- Sector ETFs for correlation

### AAII (free, weekly)
- Sentiment survey: https://www.aaii.com/sentimentsurvey

### CNN Fear & Greed (scrape or API)
- https://production.dataviz.cnn.io/index/fearandgreed/graphdata

---

## API Design

### Endpoint: `GET /api/fragility-index`

#### Response:
```json
{
  "timestamp": "2024-02-07T12:00:00Z",
  "compositeScore": 62,
  "zone": "elevated",
  "zoneColor": "orange",
  "interpretation": "Multiple stress signals present. Consider reducing leverage.",
  
  "pillars": {
    "valuation": {
      "score": 78,
      "indicators": {
        "buffettIndicator": { "value": 188, "score": 85, "percentile": 95 },
        "shillerCAPE": { "value": 34.2, "score": 75, "percentile": 88 },
        "priceSales": { "value": 2.8, "score": 70, "percentile": 82 },
        "equityRiskPremium": { "value": 1.8, "score": 80, "percentile": 12 }
      }
    },
    "credit": { ... },
    "volatility": { ... },
    "sentiment": { ... },
    "structure": { ... },
    "macro": { ... }
  },
  
  "historicalContext": {
    "currentVs2008": "Current: 62, Pre-Lehman (Aug 2008): 74",
    "currentVs2020": "Current: 62, Pre-COVID (Feb 2020): 58",
    "currentVs2022": "Current: 62, Pre-selloff (Dec 2021): 71"
  },
  
  "keyRisks": [
    "Valuation at 95th percentile historically",
    "Top 10 stocks represent 33% of S&P 500",
    "Credit spreads still compressed despite rate hikes"
  ],
  
  "dataAsOf": "2024-02-07",
  "nextUpdate": "2024-02-08T06:00:00Z"
}
```

---

## UI Components

### 1. Fragility Gauge (Hero)
- Large circular gauge (0-100)
- Color-coded zones
- Needle animation
- Current score prominently displayed

### 2. Pillar Breakdown
- 6 horizontal bars showing each pillar score
- Expandable to show individual indicators
- Color-coded by stress level

### 3. Historical Chart
- Line chart of composite score over time
- Shaded regions for major events (2008, 2020, 2022)
- Shows "you are here" marker

### 4. Key Risks Panel
- Bullet points of top 3-5 concerns
- AI-generated interpretation

### 5. What This Means For You
- Connect to user's portfolio
- "Your portfolio has 80% equities. At current fragility (62), consider..."

---

## Implementation Phases

### Phase 1: MVP (Today)
- [ ] FRED API integration for key indicators
- [ ] Buffett Indicator calculation
- [ ] VIX from Yahoo
- [ ] Basic composite score (subset of indicators)
- [ ] Simple gauge UI
- [ ] Historical chart (mock + real where available)

### Phase 2: Full Index
- [ ] All 24 indicators
- [ ] Proper percentile scoring with historical data
- [ ] AAII sentiment integration
- [ ] Pillar breakdown UI
- [ ] Key risks AI interpretation

### Phase 3: Integration
- [ ] Connect to portfolio recommendations
- [ ] Alert system ("Fragility crossed 70")
- [ ] Historical backtesting validation
- [ ] PDF report generation

---

## Validation

### Backtest Checkpoints
The index should show elevated readings BEFORE major events:
- [ ] Fragility >70 before Sept 2008
- [ ] Fragility >65 before Feb 2020
- [ ] Fragility >65 before Jan 2022
- [ ] Fragility <40 at March 2009 bottom
- [ ] Fragility <40 at March 2020 bottom

If backtests don't show this pattern, adjust weights/thresholds.

---

## Competitive Landscape

| Indicator | Provider | Cost | Our Advantage |
|-----------|----------|------|---------------|
| GFSI | Bloomberg | $$$ | Free, transparent |
| Bubble Indicator | GMO | Institutional only | Consumer accessible |
| Fear & Greed | CNN | Free but shallow | More comprehensive |
| Risk Appetite | Deutsche Bank | Bloomberg | Free |

**Maven's Edge:** Transparent methodology, free, integrated with personal portfolio, actionable recommendations.
