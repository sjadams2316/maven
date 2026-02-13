# API Key Setup Instructions

## 1. Add to .env.local

```bash
# Add these lines to /Users/theadamsfamily/.openclaw/workspace/maven/apps/dashboard/.env.local

# FMP - Stock fundamentals (FREE tier: 250 requests/day)
FMP_API_KEY="your_fmp_key_here"

# Polygon.io - Real-time prices (FREE tier: 5 req/min)
POLYGON_API_KEY="your_polygon_key_here"

# Bittensor Trading Signals (OPTIONAL)
VANTA_API_KEY="your_vanta_key_here"
DESEARCH_API_KEY="your_desearch_key_here"
```

## 2. Test Integration

```bash
# Test the integrated Oracle with stock research
curl "https://mavenwealth.ai/api/stock-research?symbol=NVDA&demo=true"

# Test live market data
curl "https://mavenwealth.ai/api/market-data"

# Test Oracle with advisor context
curl -X POST "https://mavenwealth.ai/api/athena/orchestrate" \
  -H "Content-Type: application/json" \
  -d '{"query": "Analyze NVDA fundamentals", "context": {"interface": "advisor_oracle"}}'
```

## 3. Verify Integration

Navigate to:
- https://mavenwealth.ai/advisor (your new integrated dashboard)
- Test Oracle stock research
- Check live market tickers
- Verify stock fundamentals load

## Priority Order

1. **FMP** (5 min) → Enables stock research immediately
2. **Polygon.io** (5 min) → Adds real-time price data
3. **Vanta** (15 min) → Professional trading signals
4. **Desearch** (15 min) → Social sentiment

Total setup time: ~30 minutes for full integration