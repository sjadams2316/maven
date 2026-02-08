# Maven Data Sources Architecture

## Overview

Maven uses a **dual-mode data architecture**: mock data for demos/development, live data when we pay for APIs. The switch is transparent to consumers via a provider factory pattern.

## Current Status

| Data Type | Mock | Live | Provider Needed |
|-----------|------|------|-----------------|
| **Portfolio** | ✅ Demo holdings | ❌ | Plaid (~$500/mo) |
| **Market Quotes** | N/A | ✅ Yahoo/CoinGecko | - |
| **Fund Data** | ✅ Sample funds | ❌ | Morningstar ($25-50K/yr) |
| **Economic** | N/A | ✅ FRED | - |
| **Analyst Ratings** | N/A | ✅ FMP | - |
| **Tax Lots** | ✅ Demo lots | ❌ | Brokerage API |
| **Risk Metrics** | ✅ Calculated | ❌ | Institutional feeds |
| **Retirement** | ✅ Demo data | ❌ | SSA API |

## Live Data Sources (Already Integrated)

### Yahoo Finance (Free)
- **Used for**: Stock/ETF quotes, historical prices
- **Endpoint**: v8 chart API (undocumented but stable)
- **Rate limits**: Reasonable, no key required
- **Quality**: Good for quotes, may lag 15min

### CoinGecko (Free tier)
- **Used for**: Crypto prices (BTC, ETH, TAO)
- **Endpoint**: /simple/price, /coins/{id}
- **Rate limits**: 50 calls/min (free tier)
- **Quality**: Real-time, reliable

### FRED (Federal Reserve) (Free)
- **Used for**: Treasury rates, inflation, GDP, unemployment
- **API Key**: Required but free
- **Rate limits**: 120 requests/min
- **Quality**: Authoritative source

### Financial Modeling Prep (FMP) (Free tier)
- **Used for**: Stock fundamentals, analyst ratings, financial statements
- **API Key**: Required, free tier = 250 requests/day
- **Rate limits**: Tight on free tier
- **Quality**: Good, similar to Yahoo Finance

### Polygon.io (Free tier)
- **Used for**: Backup for crypto, real-time stock data
- **API Key**: Required
- **Rate limits**: 5 API calls/min on free tier
- **Quality**: Excellent, used by institutions

## Planned Integrations

### Plaid ($$)
**Purpose**: Real account aggregation - see actual holdings across all accounts

**Pricing**:
- Development: Free (100 live users)
- Production: ~$500/mo base + per-connection fees
- 401(k) read: Additional cost

**What it unlocks**:
- Real portfolio holdings
- Bank account balances
- Transaction history
- 401(k) balances (read-only)

**Priority**: HIGH - needed for Phase 2 (RIA launch)

### Morningstar ($$$)
**Purpose**: Fund-level data - holdings, X-ray analysis, proprietary ratings

**Pricing**:
- Direct API: $25,000 - $50,000/year
- Via aggregators (YCharts, etc.): May be cheaper

**What it unlocks**:
- Fund holdings (top 25-100 positions)
- Sector/geographic breakdown
- Style box classification
- Proprietary ratings (stars, medals)
- Fund X-ray (see through to underlying)
- Overlap analysis between funds

**Priority**: MEDIUM - nice-to-have, mock data works for MVP

### Social Security Administration API
**Purpose**: Actual benefit estimates

**Status**: Limited API access, mostly requires manual verification

**Alternative**: Use SSA's Quick Calculator formulas (we do this now)

## Environment Configuration

```bash
# .env.local

# Data provider modes (mock | live)
DATA_PROVIDER_PORTFOLIO=mock
DATA_PROVIDER_FUND=mock
DATA_PROVIDER_TAX=mock
DATA_PROVIDER_MARKET=live
DATA_PROVIDER_ECONOMIC=live
DATA_PROVIDER_ANALYST=live
DATA_PROVIDER_RISK=mock
DATA_PROVIDER_RETIREMENT=mock

# API Keys (for live providers)
FMP_API_KEY=your_key_here
FRED_API_KEY=your_key_here
POLYGON_API_KEY=your_key_here

# Future
PLAID_CLIENT_ID=
PLAID_SECRET=
MORNINGSTAR_API_KEY=
```

## How to Add a New Live Provider

1. Create implementation in `lib/data-providers/live/`:
   ```typescript
   // lib/data-providers/live/plaid-portfolio.ts
   import { PortfolioDataProvider } from '../types';
   
   export class PlaidPortfolioProvider implements PortfolioDataProvider {
     // Implement interface methods
   }
   ```

2. Update factory in `lib/data-providers/index.ts`:
   ```typescript
   import { PlaidPortfolioProvider } from './live/plaid-portfolio';
   
   export function getPortfolioProvider(): PortfolioDataProvider {
     if (dataConfig.portfolio === 'live') {
       return new PlaidPortfolioProvider();
     }
     return mockPortfolioProvider;
   }
   ```

3. Set environment variable:
   ```bash
   DATA_PROVIDER_PORTFOLIO=live
   ```

## Data Quality Tiers

### Tier 1: Authoritative (Use for decisions)
- FRED (Fed data)
- SSA (Social Security)
- IRS (tax rates)

### Tier 2: Institutional (Reliable, paid)
- Morningstar (fund data)
- Bloomberg/Refinitiv (everything)
- Plaid (account data)

### Tier 3: Good Enough (Free, some lag)
- Yahoo Finance
- CoinGecko
- FMP
- Polygon free tier

### Tier 4: Demo Only
- Mock providers
- Hardcoded data

## Cost Analysis

| Service | Annual Cost | What You Get |
|---------|-------------|--------------|
| Current (free tier) | $0 | Basic quotes, crypto, FRED, limited FMP |
| + Plaid | ~$6,000/yr | Real account aggregation |
| + Morningstar | ~$35,000/yr | Fund X-ray, ratings, holdings |
| + Bloomberg | ~$24,000/yr | Everything (terminal) |

**Recommended path**:
1. Now: Free tiers + mock data ✅
2. Phase 2: Add Plaid ($500/mo)
3. Phase 3: Evaluate Morningstar vs alternatives
4. Future: Consider Bloomberg if institutional clients need it
