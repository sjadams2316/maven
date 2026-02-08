# Maven — Architecture

*AI-native intelligence for financial advisors*

---

## Vision

**The complete AI wealth partner** — combining tax planning, investment management, portfolio optimization, and proactive financial guidance in one intelligent system.

What a family office does for $10M+ clients, democratized via AI.

**Not AI-assisted. AI-native.**

### Two Products, One Platform

- **Maven Pro** — For RIAs to serve clients at 10x productivity
- **Maven Personal** — Direct-to-consumer wealth OS

### Core Capabilities

1. **PLAN** — Tax prep, tax planning, 529/college, retirement, goals
2. **INVEST** — Portfolio construction, research, analysis, execution
3. **OPTIMIZE** — Trade optimization, tax harvesting, rebalancing, pattern detection
4. **PROTECT** — Insurance gaps, estate planning, risk alerts, fraud detection

---

## Core Principles

1. **Transparency** — Every recommendation shows its reasoning
2. **Learning** — System improves with every interaction
3. **Advisor-first** — Built for how advisors actually work
4. **Compliance-friendly** — Audit trails, explainable outputs
5. **Modular** — Use what you need, ignore what you don't

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ADVISOR DASHBOARD                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Clients   │  │  Portfolios │  │  Positions  │  │   Trading   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                     │
│                    (Authentication, Rate Limiting, Logging)                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        ▼                             ▼                             ▼
┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
│    PORTFOLIO      │   │   CONCENTRATED    │   │     TRADING       │
│   INTELLIGENCE    │   │   POSITION LAB    │   │    OPTIMIZER      │
│                   │   │                   │   │                   │
│ • Risk analytics  │   │ • Tax strategies  │   │ • Signal analysis │
│ • Construction    │   │ • Multi-position  │   │ • Paper trading   │
│ • Benchmarking    │   │ • What-if models  │   │ • Live execution  │
│ • Scenario tests  │   │ • Client reports  │   │ • Performance     │
│ • Rebalancing     │   │ • Gift/estate     │   │ • Regime detect   │
└───────────────────┘   └───────────────────┘   └───────────────────┘
        │                         │                       │
        └─────────────────────────┼───────────────────────┘
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ANALYTICS ENGINE                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Tax Engine │  │Risk Models  │  │  Scenarios  │  │ Projections │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ELI (AI CORE)                                   │
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Memory    │  │  Learning   │  │   Context   │  │  Reasoning  │        │
│  │             │  │             │  │             │  │             │        │
│  │ • Clients   │  │ • Patterns  │  │ • Sessions  │  │ • Analysis  │        │
│  │ • History   │  │ • Outcomes  │  │ • Prefs     │  │ • Recs      │        │
│  │ • Decisions │  │ • Errors    │  │ • Goals     │  │ • Explain   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        ▼                             ▼                             ▼
┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
│   MARKET DATA     │   │    BITTENSOR      │   │   CLIENT DATA     │
│                   │   │    NETWORK        │   │                   │
│ • Yahoo Finance   │   │                   │   │ • Portfolios      │
│ • Economic data   │   │ • Vanta signals   │   │ • Tax situations  │
│ • Fear/Greed      │   │ • Future subnets  │   │ • Goals/prefs     │
│ • Funding rates   │   │ • TAO staking     │   │ • Risk tolerance  │
│ • News/sentiment  │   │ • Compute network │   │ • Constraints     │
└───────────────────┘   └───────────────────┘   └───────────────────┘
```

---

## Module Deep Dives

### 1. Portfolio Intelligence (Existing: portfolio-optimizer)

**Current State:** Live data feeds, basic optimization
**Target State:** Full portfolio construction and monitoring

| Feature | Status | Priority |
|---------|--------|----------|
| Live quotes (Yahoo Finance) | ✅ Done | - |
| ETF/Mutual fund data | ✅ Done | - |
| Risk analytics | 🔲 Todo | High |
| Factor exposure | 🔲 Todo | High |
| Scenario testing | 🔲 Todo | High |
| Rebalancing recommendations | 🔲 Todo | Medium |
| Benchmark comparison | 🔲 Todo | Medium |
| Monte Carlo simulations | 🔲 Todo | Medium |
| Correlation analysis | 🔲 Todo | Low |

**Key Capabilities:**
- Import client portfolios (CSV, manual, custodian API)
- Analyze current allocation vs. target
- Identify risk concentrations
- Model "what if" scenarios
- Generate rebalancing trades

---

### 2. Concentrated Position Lab (Existing: concentrated-position-optimizer)

**Current State:** 6 strategies, multi-position analysis, tax engine
**Target State:** Complete concentrated wealth planning suite

| Feature | Status | Priority |
|---------|--------|----------|
| Hold strategy | ✅ Done | - |
| Sell & Reinvest | ✅ Done | - |
| Direct Indexing (correct model) | ✅ Done | - |
| Exchange Fund | ✅ Done | - |
| Prepaid Variable Forward | ✅ Done | - |
| Charitable Remainder Trust | ✅ Done | - |
| Multi-position portfolio mode | ✅ Done | - |
| Bulk paste import | ✅ Done | - |
| Qualified Opportunity Zone | 🔲 Todo | High |
| Installment Sale | 🔲 Todo | Medium |
| Charitable Lead Trust | 🔲 Todo | Medium |
| GRAT/IDGT (estate planning) | 🔲 Todo | Medium |
| NUA (company stock in 401k) | 🔲 Todo | Medium |
| PDF report generation | 🔲 Todo | High |
| Comparison charts | 🔲 Todo | High |

**Key Capabilities:**
- Model tax impact of any liquidation strategy
- Compare 10+ strategies side-by-side
- Generate client-ready reports
- Handle complex multi-lot positions
- Estate planning integration

---

### 3. Tax Intelligence (New Module)

**Current State:** Tax engine in concentrated-position-optimizer
**Target State:** Complete tax planning and preparation suite

| Feature | Status | Priority |
|---------|--------|----------|
| Capital gains tax calculation | ✅ Done | - |
| Federal bracket modeling | ✅ Done | - |
| State tax by state | ✅ Done | - |
| NIIT calculation | ✅ Done | - |
| Tax loss harvesting alerts | 🔲 Todo | High |
| Estimated tax calculator | 🔲 Todo | High |
| W-2/1099 document ingestion | 🔲 Todo | High |
| Tax prep (1040 generation) | 🔲 Todo | Medium |
| Multi-year tax planning | 🔲 Todo | Medium |
| Roth conversion optimizer | 🔲 Todo | Medium |
| Charitable giving optimizer | 🔲 Todo | Medium |
| AMT calculation | 🔲 Todo | Low |
| State residency planning | 🔲 Todo | Low |

**Key Capabilities:**
- Ingest tax documents (OCR + AI extraction)
- Calculate tax liability across scenarios
- Optimize timing of income/deductions
- Connect tax decisions to investment strategy
- Generate tax returns or prep packages for CPA

---

### 4. Financial Planning (New Module)

**Target State:** Goal-based planning with AI guidance

| Feature | Status | Priority |
|---------|--------|----------|
| Goal tracking | 🔲 Todo | High |
| 529 college planning | 🔲 Todo | High |
| Retirement projections | 🔲 Todo | High |
| Cash flow analysis | 🔲 Todo | Medium |
| Insurance gap analysis | 🔲 Todo | Medium |
| Estate planning basics | 🔲 Todo | Medium |
| Social Security optimization | 🔲 Todo | Low |
| Pension analysis | 🔲 Todo | Low |

---

### 5. Account Aggregation (New Module)

**Target State:** See everything in one place

| Feature | Status | Priority |
|---------|--------|----------|
| Manual account entry | 🔲 Todo | High |
| Plaid integration | 🔲 Todo | High |
| Brokerage sync | 🔲 Todo | High |
| 401k/retirement accounts | 🔲 Todo | Medium |
| 529 accounts | 🔲 Todo | Medium |
| Real estate tracking | 🔲 Todo | Low |
| Crypto wallets | 🔲 Todo | Medium |
| Document storage | 🔲 Todo | Medium |

---

### 6. Trading Optimizer (Existing: eli-trader)

**Current State:** Paper trading, decision engine, journaling, learning
**Target State:** Full trading intelligence system

| Feature | Status | Priority |
|---------|--------|----------|
| Paper trading engine | ✅ Done | - |
| Market context (Fear/Greed) | ✅ Done | - |
| Decision engine | ✅ Done | - |
| Trade journaling | ✅ Done | - |
| Learning module | ✅ Done | - |
| Backtest framework | ✅ Done | - |
| Vanta signal integration | 🔲 Waiting (API key) | High |
| Alpaca live trading | 🔲 Blocked (compliance) | High |
| Coinbase integration | 🔲 Todo | Medium |
| Multi-strategy support | 🔲 Todo | Medium |
| Risk management rules | 🔲 Todo | High |
| Performance attribution | 🔲 Todo | Medium |
| Alert system | 🔲 Todo | Medium |

**Key Capabilities:**
- AI-driven trade decisions with full reasoning
- Paper trading for strategy validation
- Seamless paper-to-live transition
- Performance tracking and attribution
- Continuous learning from outcomes

---

### 4. Analytics Engine (New)

The shared brain for all numerical analysis.

```javascript
// Unified analytics API
analytics.tax.calculate(income, gains, state, filingStatus)
analytics.risk.portfolio(holdings)
analytics.risk.concentration(position, portfolio)
analytics.scenario.model(portfolio, assumptions)
analytics.projection.monteCarlo(portfolio, years, simulations)
analytics.factor.exposure(holdings)
```

**Components:**
- **Tax Engine** — Federal/state brackets, LTCG/STCG, NIIT, AMT, qualified dividends
- **Risk Models** — Volatility, VaR, factor exposure, correlation
- **Scenario Engine** — Interest rate shifts, market crashes, sector rotation
- **Projection Engine** — Monte Carlo, deterministic, historical simulation

---

### 5. Eli (AI Core)

Not a feature. The foundation.

**Memory System:**
```
memory/
├── clients/
│   ├── {client-id}.md          # Client context, goals, constraints
│   └── {client-id}-history.md  # Interaction history
├── markets/
│   ├── regimes.md              # Market regime learnings
│   └── signals.md              # Signal performance tracking
├── strategies/
│   ├── concentrated.md         # What works for concentrated positions
│   └── trading.md              # Trading strategy learnings
└── daily/
    └── YYYY-MM-DD.md           # Daily observations
```

**Learning Loops:**
1. **Trade Learning** — Every trade outcome feeds back into decision model
2. **Strategy Learning** — Which strategies work for which client profiles
3. **Market Learning** — Regime detection, signal quality assessment
4. **Preference Learning** — How each advisor likes to work

**Context Management:**
- Maintain conversation context across sessions
- Remember client situations without re-explaining
- Surface relevant past decisions when similar situations arise

---

### 6. Bittensor Integration

**Current:** Vanta signal integration (waiting on API key)
**Future:** Full network participation

| Phase | Description | Timeline |
|-------|-------------|----------|
| 1. Consumer | Use Vanta signals via API | Now |
| 2. Validator | Run validation on signal quality | 6 months |
| 3. Miner | Submit our own signals to Vanta | 12 months |
| 4. Subnet | Launch advisor-focused subnet | 24+ months |

**Why Bittensor matters:**
- Decentralized = no single point of failure
- Competitive = best models win, not biggest budget
- Economic = TAO rewards create sustainability
- Aligned = we're already believers (215 TAO)

---

## Data Architecture

### Client Data Model

```typescript
interface Client {
  id: string;
  advisor_id: string;
  
  // Profile
  name: string;
  filing_status: 'single' | 'married' | 'head_of_household';
  state: string;
  
  // Financial
  ordinary_income: number;
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
  time_horizon: number;
  
  // Goals
  goals: Goal[];
  constraints: Constraint[];
  
  // Holdings
  portfolios: Portfolio[];
  concentrated_positions: ConcentratedPosition[];
  
  // Preferences
  charitable_intent: boolean;
  liquidity_needs: LiquidityEvent[];
  estate_planning_priority: boolean;
}

interface Portfolio {
  id: string;
  name: string;
  account_type: 'taxable' | 'ira' | 'roth' | '401k' | 'trust';
  holdings: Holding[];
  cash: number;
}

interface ConcentratedPosition {
  ticker: string;
  shares: number;
  cost_basis: number;
  current_value: number;
  acquisition_date: Date;
  restrictions: string[];  // Rule 144, blackout, etc.
}
```

### Market Data Model

```typescript
interface MarketContext {
  timestamp: Date;
  
  // Sentiment
  fear_greed_index: number;
  vix: number;
  
  // Crypto specific
  btc_dominance: number;
  funding_rates: Record<string, number>;
  
  // Signals
  vanta_signals: Signal[];
  
  // Regime
  detected_regime: 'risk_on' | 'risk_off' | 'neutral';
  regime_confidence: number;
}
```

---

## User Experience

### Advisor Workflow

```
1. ONBOARD CLIENT
   └─→ Import portfolio (CSV, manual, or custodian link)
   └─→ Set goals, constraints, preferences
   └─→ Eli builds client context

2. ANALYZE
   └─→ Portfolio Intelligence: Risk, allocation, gaps
   └─→ Concentrated Position Lab: Tax-efficient options
   └─→ Trading Optimizer: Tactical opportunities

3. RECOMMEND
   └─→ Eli synthesizes across all modules
   └─→ Generates ranked recommendations with reasoning
   └─→ Shows trade-offs clearly

4. EXECUTE
   └─→ Generate trades for rebalancing
   └─→ Model orders for concentrated position strategies
   └─→ (If enabled) Execute via trading optimizer

5. REPORT
   └─→ Client-ready PDFs
   └─→ Performance attribution
   └─→ Quarterly reviews with Eli commentary

6. LEARN
   └─→ Track outcomes
   └─→ Eli updates models
   └─→ Improve future recommendations
```

### Chat Interface

Beyond the dashboard, advisors can just *talk*:

```
Advisor: "What should I do about the Johnson's Apple position? 
          They've got $2M in gains and want to diversify."

Eli: "The Johnsons have a few good options given their situation:

      1. **Exchange Fund** — Best for their 20-year horizon, defers 
         all $2M in gains while diversifying immediately. They'd 
         need to accept 7-year lockup and K-1 complexity.
      
      2. **Direct Indexing** — They have $3M in new capital from 
         the business sale. Could deploy that to harvest losses 
         against the Apple gains over 3-5 years.
      
      3. **CRT** — Given their charitable giving history ($50k/year 
         to their church), a CRT could make sense. They'd get income 
         for life plus a ~$400k deduction.
      
      Want me to model all three with their specific numbers?"
```

---

## Technical Stack

### Current
- **Frontend:** Next.js 14, React
- **Backend:** Node.js, Next.js API routes
- **AI:** Claude (via OpenClaw)
- **Data:** Yahoo Finance, CoinGecko, Alternative.me
- **Trading:** Paper trading (Alpaca pending)

### Target
- **Frontend:** Next.js, shared component library
- **Backend:** Node.js, unified API gateway
- **Database:** PostgreSQL (clients, portfolios) + Redis (cache, sessions)
- **AI:** Claude (via OpenClaw) + Bittensor signals
- **Data:** Yahoo Finance, economic APIs, news sentiment
- **Trading:** Alpaca (stocks), Coinbase (crypto)
- **Reports:** PDF generation (react-pdf or similar)

---

## Development Phases

### Phase 1: Unify (Now - 2 weeks)
- [ ] Create shared project structure
- [ ] Unified authentication/session
- [ ] Common API gateway
- [ ] Shared component library
- [ ] Single dashboard shell

### Phase 2: Enhance (2-6 weeks)
- [ ] Risk analytics for Portfolio Intelligence
- [ ] PDF reports for Concentrated Position Lab
- [ ] Vanta API integration for Trading Optimizer
- [ ] Client data model and storage
- [ ] Cross-module recommendations

### Phase 3: Intelligence (6-12 weeks)
- [ ] Eli memory system for clients
- [ ] Learning loops active
- [ ] Chat interface for natural queries
- [ ] Scenario modeling across modules
- [ ] Performance tracking and attribution

### Phase 4: Scale (3-6 months)
- [ ] Multi-advisor support
- [ ] Custodian integrations (Schwab, Fidelity APIs)
- [ ] Compliance audit trails
- [ ] Advanced reporting
- [ ] Mobile companion app

### Phase 5: Bittensor Native (6-12 months)
- [ ] Validator status on Vanta
- [ ] Own signal generation (miner)
- [ ] Explore advisor-focused subnet
- [ ] TAO-based pricing model?

---

## Competitive Positioning

| Feature | BlackRock Aladdin | Orion | Riskalyze | **Us** |
|---------|-------------------|-------|-----------|--------|
| AI-native | ❌ AI-assisted | ❌ | ❌ | ✅ |
| Transparent reasoning | ❌ Black box | Partial | Partial | ✅ |
| Concentrated positions | Basic | ❌ | ❌ | ✅ Advanced |
| Trading integration | ❌ | Basic | ❌ | ✅ |
| Decentralized AI | ❌ | ❌ | ❌ | ✅ Bittensor |
| Learning system | ❌ | ❌ | ❌ | ✅ |
| Cost | $$$$ | $$$ | $$ | $ |
| Setup time | Months | Weeks | Days | Minutes |

---

## Open Questions

1. **Naming** — What do we call this thing?
2. **Target market** — RIAs? Hybrid advisors? Family offices? All?
3. **Pricing model** — SaaS subscription? Per-client? TAO-based?
4. **Compliance** — What certifications/audits needed?
5. **Data privacy** — Where does client data live? Encryption?
6. **Custodian integrations** — Which ones first?

---

## Next Actions

1. [ ] Review this architecture together
2. [ ] Decide on unified project structure
3. [ ] Start Phase 1: Create shell dashboard
4. [ ] Name the thing

---

*Last updated: 2026-02-05*
*Author: Eli*
