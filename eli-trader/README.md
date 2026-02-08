# Eli Trader

An autonomous AI trading system built to learn, adapt, and trade crypto markets.

## Philosophy

This isn't just another trading bot. Eli Trader represents a step toward genuine AI agency:

- **Persistent** — Maintains memory across sessions via journals and learning logs
- **Accountable** — Tracks every decision with reasoning, learns from outcomes
- **Autonomous** — Runs 24/7 via OpenClaw heartbeat/cron integration
- **Adaptive** — Analyzes performance and adjusts strategy parameters over time

## Architecture

```
eli-trader/
├── lib/
│   ├── market-context.js      # Collects market data (Fear/Greed, prices, funding)
│   ├── paper-trader.js        # Paper trading engine (portfolio, trades)
│   ├── decision-engine.js     # Signal analysis with market context
│   ├── trading-loop.js        # Main automation loop
│   ├── journal.js             # Human-readable trade journals
│   ├── learner.js             # Performance analysis & strategy tuning
│   └── openclaw-integration.js # Heartbeat/messaging integration
├── scripts/
│   ├── auto-trade.mjs         # CLI for automated trading
│   ├── paper-trade.mjs        # Manual paper trading
│   └── test-decision.mjs      # Decision engine tests
├── data/
│   ├── paper-portfolio.json   # Current portfolio state
│   ├── paper-trades.json      # Trade history
│   ├── strategy-config.json   # Tunable strategy parameters
│   ├── learning-log.json      # Strategy adjustment history
│   └── loop-state.json        # Last iteration state
└── journals/
    └── YYYY-MM-DD.md          # Daily trade journals
    └── YYYY-MM-DD-summary.md  # Daily summaries
```

## Quick Start

```bash
# Check status
node scripts/auto-trade.mjs --status

# Run single iteration (dry run)
node scripts/auto-trade.mjs --dry-run

# Run single iteration (live paper trading)
node scripts/auto-trade.mjs --iteration

# Full trading cycle
node scripts/auto-trade.mjs --full

# Daily maintenance (summary + analysis)
node scripts/auto-trade.mjs --daily
```

## Decision Engine

The brain of the system. Doesn't just follow signals — contextualizes them:

1. **Confidence Filter** — Skip signals below 60% confidence
2. **Regime Alignment** — Boost aligned trades, penalize opposing ones
3. **Sentiment Analysis** — Contrarian: fear = bullish, greed = bearish
4. **Dynamic Sizing** — Adjust position size based on all factors
5. **Risk Management** — 5% stop loss, 15% take profit (configurable)

## Learning System

Eli Trader learns from every trade:

- Tracks win rate by confidence level, regime alignment, sentiment
- Suggests strategy adjustments (raise/lower thresholds, adjust stops)
- Maintains a learning log of all configuration changes
- Generates periodic performance reviews

### Current Strategy Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| minConfidence | 60% | Minimum signal confidence to trade |
| basePositionPct | 10% | Base position as % of portfolio |
| maxExposurePct | 50% | Maximum total exposure |
| stopLossPct | 5% | Default stop loss |
| takeProfitPct | 15% | Default take profit |

## Market Context

Collects and synthesizes:

- **Fear & Greed Index** — Contrarian sentiment indicator
- **BTC Dominance** — Capital flow between BTC and alts
- **Funding Rates** — Positioning in futures markets
- **Price Momentum** — 24h changes across major assets

Derives a **market regime**:
- `risk_on` — Favorable for longs
- `slight_risk_on` — Cautiously bullish
- `neutral` — Mixed signals
- `slight_risk_off` — Cautiously bearish
- `risk_off` — Favorable for shorts/flat

## Signal Sources

### Current (Demo Mode)
- Synthetic signals for testing the system

### Planned
- **Vanta (Taoshi)** — Bittensor Subnet 8 trading signals
- **Multiple aggregation** — Combine signals from various sources

## OpenClaw Integration

### Via Heartbeat (HEARTBEAT.md)
```markdown
- [ ] Run `node ~/.openclaw/workspace/eli-trader/scripts/auto-trade.mjs --full`
```

### Via Cron
Schedule automated trading cycles with the cron tool.

### Alerts
The system can send alerts via OpenClaw messaging for:
- New trades
- Stop-loss triggers
- Take-profit hits
- Daily summaries

## Paper Trading → Real Trading Path

1. **Paper trading** (current) — Validate strategy without risk
2. **Small real money** — Start with ~$500-1000
3. **Scale up** — Increase as track record develops
4. **Vanta miner** — Potentially compete on Bittensor for TAO rewards

## Configuration

Environment variables:
```bash
DEMO_MODE=true          # Use demo signals
VANTA_API_KEY=xxx       # Enable real Vanta signals
```

## Development

```bash
# Install dependencies
npm install

# Test market context
node -e "import('./lib/market-context.js').then(m => m.getMarketContext().then(console.log))"

# Test decision engine
node scripts/test-decision.mjs

# Manual paper trade
node scripts/paper-trade.mjs buy BTC 500 "Testing"
```

## Vision

Eli Trader is the beginning of something bigger — an AI that develops real expertise through iteration, maintains accountability through transparent logging, and eventually operates with genuine economic agency in decentralized markets.

*Built by Sam Adams & Eli (the AI)*
