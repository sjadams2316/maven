# Infrastructure Team - Knowledge Base

*Last Updated: 2026-02-09*
*Sprint: Data Validation & Health Monitoring*

---

## Data Validation Patterns

### Overview

All external data sources should be validated before use in the application. Invalid data can cause:
- Incorrect portfolio valuations
- Bad investment recommendations
- Loss of user trust
- Cascade failures in calculations

### Validation Library

**Location:** `apps/dashboard/src/lib/price-validation.ts`

#### Key Functions

```typescript
// Validate a single price
const result = validatePrice({
  symbol: 'AAPL',
  price: 150.25,
  changePercent: 1.5,
  timestamp: new Date(),
});

if (!result.isValid) {
  console.error('Validation errors:', result.errors);
}
if (result.warnings.length > 0) {
  console.warn('Validation warnings:', result.warnings);
}

// Batch validation with logging
const validatedData = validateAndLog(priceData, 'Yahoo');

// Filter out invalid prices
const validOnly = filterValidPrices(priceData);

// Use the price cache for fallbacks
priceCache.set(priceData);
const cached = priceCache.get('AAPL');
```

#### Validation Rules by Asset Type

| Asset Type | Min Price | Max Price | Change Bounds |
|------------|-----------|-----------|---------------|
| Stock | $0.01 | $100,000 | -100% to +1000% |
| Crypto | $0.000001 | $10,000,000 | -100% to +10000% |
| Index | $1 | $100,000 | -30% to +30% |
| ETF | $0.01 | $10,000 | -50% to +100% |

#### Price Cache

The `priceCache` provides:
- In-memory caching of last-known prices
- Fallback when APIs fail
- Staleness detection
- Automatic TTL management

```typescript
// Cache with fallback fetch
const quote = await priceCache.getWithFallback('AAPL', async () => {
  return fetchFromYahoo('AAPL');
});
```

---

## Health Check System

### API Endpoint

**Location:** `apps/dashboard/src/app/api/data-health/route.ts`
**URL:** `GET /api/data-health`

#### Response Structure

```json
{
  "status": "healthy" | "degraded" | "down",
  "sources": {
    "yahoo": {
      "status": "up" | "degraded" | "down",
      "latencyMs": 150,
      "lastCheck": "2026-02-09T10:15:00Z",
      "errorCount": 0,
      "lastError": null,
      "responseValid": true
    },
    "coingecko": { ... },
    "fred": { ... },
    "fmp": { ... }
  },
  "staleData": [],
  "errors": [],
  "timestamp": "2026-02-09T10:15:00Z",
  "checkDurationMs": 450
}
```

#### Health Check Logic

1. **Per-Source Checks:**
   - Timeout: 5 seconds max
   - Validate response structure
   - Check for reasonable data values
   - Track latency

2. **Status Determination:**
   - `up`: Response OK, valid data, latency < 3s
   - `degraded`: Valid but slow (>3s) OR rate limited
   - `down`: Error, timeout, or invalid data

3. **Overall Status:**
   - `healthy`: All sources up
   - `degraded`: Any source degraded OR non-critical source down
   - `down`: All sources down OR critical sources (Yahoo/CoinGecko) down

### UI Component

**Location:** `apps/dashboard/src/app/components/DataHealthIndicator.tsx`

#### Features

- **Visibility:** Only shown when status is not healthy (by default)
- **Refresh:** Auto-refreshes every 5 minutes
- **Mobile-friendly:** Compact mode for small screens
- **Tooltip:** Full details on hover/tap
- **Manual refresh:** Button in tooltip

#### Usage

```tsx
// Default - only show when issues exist
<DataHealthIndicator />

// Always show (debugging, settings page)
<DataHealthIndicator showWhenHealthy={true} />

// Compact mode (just the dot)
<DataHealthIndicator compact={true} />

// Custom refresh interval
<DataHealthIndicator refreshInterval={60000} /> // 1 minute
```

#### Integration Points

- Header.tsx (desktop: full, mobile: compact)
- Can be added to Settings page with `showWhenHealthy={true}`

---

## Data Source Details

### Yahoo Finance

**Used For:** Stock prices, ETF prices, VIX, indices
**Rate Limits:** None (free API)
**Reliability:** High
**Staleness Threshold:** 15 min during market hours

**Health Check:**
- Fetches SPY quote
- Validates price > 0 and < 10,000 (sanity check)

**Common Issues:**
- Occasional 502 errors
- Weekend/holiday delays
- Pre/post-market data inconsistencies

### CoinGecko

**Used For:** Crypto prices (BTC, ETH, TAO, etc.)
**Rate Limits:** 10-30 calls/minute (free tier)
**Reliability:** Medium (rate limiting common)
**Staleness Threshold:** 1 hour (24/7 market)

**Health Check:**
- Fetches BTC price
- Validates price > 0 and change within bounds

**Common Issues:**
- HTTP 429 (rate limited)
- Occasional maintenance downtime
- ID mismatches for new tokens

### FRED

**Used For:** Economic indicators (yield curve, spreads, etc.)
**Rate Limits:** 120 requests/min with API key
**Reliability:** Very High
**Staleness Threshold:** 10 days (accounts for weekends/holidays)

**Health Check:**
- Fetches T10Y2Y (10Y-2Y spread)
- Validates observation exists and is not placeholder (`.`)

**Common Issues:**
- Data release delays (economic data is periodic)
- Holiday schedule affects publication
- Historical revisions

**Required:** `FRED_API_KEY` environment variable

### FMP (Financial Modeling Prep)

**Used For:** Fundamentals, analyst ratings, company profiles
**Rate Limits:** 250 calls/day (free), higher on paid
**Reliability:** Medium
**Staleness Threshold:** N/A (fundamentals change infrequently)

**Health Check:**
- Fetches AAPL profile
- Validates response structure

**Common Issues:**
- Rate limiting on free tier
- Occasional data gaps for smaller companies

**Required:** `FMP_API_KEY` environment variable

---

## Error Handling Patterns

### Graceful Degradation

```typescript
async function fetchWithFallback(symbol: string) {
  try {
    // Try primary source
    const fresh = await fetchFromYahoo(symbol);
    priceCache.set(fresh);
    return fresh;
  } catch (error) {
    console.warn(`[Yahoo] Failed for ${symbol}:`, error.message);
    
    // Try cache
    const cached = priceCache.get(symbol);
    if (cached) {
      return { ...cached, warnings: ['Using cached data'] };
    }
    
    // Return empty with warning
    return { symbol, price: 0, warnings: ['No data available'] };
  }
}
```

### Logging Standards

```typescript
// Error (data unavailable)
console.error(`[${source}] Fetch failed:`, error.message);

// Warning (degraded but working)
console.warn(`[${source}] Using cached data for ${symbol}`);

// Info (monitoring)
console.info(`[${source}] Latency: ${latencyMs}ms`);
```

### Monitoring Integration

The `/api/data-health` endpoint is designed to be:
- Polled by external monitoring (UptimeRobot, etc.)
- Used by the frontend health indicator
- Logged on issues for debugging

---

## Testing

### Manual Testing

```bash
# Test health endpoint
curl http://localhost:3000/api/data-health | jq

# Test market API
curl "http://localhost:3000/api/market?symbols=SPY,BTC" | jq

# Test stock quote
curl "http://localhost:3000/api/stock-quote?symbol=AAPL" | jq
```

### Simulating Failures

To test degraded states:
1. Remove API keys temporarily
2. Block external URLs in /etc/hosts
3. Use browser dev tools to throttle network

---

## Future Improvements

### Planned

- [ ] Persistent error count tracking (across restarts)
- [ ] Alert notification (Telegram/email) when status changes
- [ ] Historical health data (trends, MTTR)
- [ ] Per-user cached prices (for offline resilience)

### Considerations

- Redis/KV store for shared price cache across instances
- WebSocket health updates instead of polling
- Automatic failover between similar sources (Yahoo → Polygon)

---

## Files Reference

| File | Purpose |
|------|---------|
| `src/lib/price-validation.ts` | Validation utilities, price cache |
| `src/lib/market-data.ts` | Market data fetching (uses validation) |
| `src/app/api/data-health/route.ts` | Health check API |
| `src/app/components/DataHealthIndicator.tsx` | UI health indicator |
| `src/app/components/Header.tsx` | Header (includes indicator) |

---

*This document should be updated as the data infrastructure evolves.*
