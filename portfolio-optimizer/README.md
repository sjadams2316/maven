# Portfolio Optimizer

A comprehensive portfolio optimization tool — better than BlackRock Advisor Center.

## Features

### 🚀 Auto-Optimizer
- Set target allocation via sliders or quick presets
- Start from asset manager model portfolios (BlackRock, Vanguard, Capital Group, Fidelity, JP Morgan)
- Automatically selects optimal ETF for each asset class using multi-factor scoring

### 📋 Bullet-Point Explanations (Key Feature)
Every optimization generates clear, actionable insights:
- **Allocation Strategy** — Risk profile classification with time horizon guidance
- **Why Each Fund** — Specific reasons for fund selection (expense ratio, tracking, liquidity)
- **Efficiency Metrics** — Sharpe ratio, weighted expense ratio, expected return
- **Rearview Mirror** — How allocation would have performed in historical crises
- **Forward Outlook** — Expected returns, time to double, real return after inflation
- **Risk Warnings** — Max drawdown estimates, volatility expectations

### 📊 Model Portfolio Comparison
Compare your allocation to institutional models:
- BlackRock Growth/Moderate
- Vanguard LifeStrategy
- Capital Group Growth
- Fidelity 60/40
- JP Morgan Balanced

### 🔬 Fund Scoring Methodology
| Factor | Weight |
|--------|--------|
| Risk-Adjusted Return (Sharpe) | 30% |
| Expense Ratio | 25% |
| Consistency | 15% |
| Tracking Precision | 15% |
| Liquidity (AUM) | 15% |

### ⚡ Stress Testing
Built-in historical scenario analysis:
- 2008-09 Financial Crisis (-52% US Equity)
- 2020 COVID Crash (-34% US Equity, 5-month recovery)
- 2022 Rate Shock (stocks AND bonds fell)
- 2000-02 Dot-Com Bust
- 1973-74 Stagflation

### 💰 Capital Market Assumptions
Forward-looking expectations based on consensus from BlackRock, Vanguard, JP Morgan:
| Asset Class | Expected Return | Volatility |
|-------------|-----------------|------------|
| US Equity | 7.0% | 16.5% |
| Intl Developed | 7.5% | 18.0% |
| Emerging Markets | 8.5% | 24.0% |
| US Bonds | 4.5% | 5.5% |

## Fund Database

**Current:** 145 ETFs across 5 asset classes (51 with expense ratios)

### Adding Complete Fund Data

#### Option 1: Morningstar CSV Export (Best Quality)
1. Go to https://www.morningstar.com/tools/screener
2. Set Investment Type: "Mutual Funds and ETFs"
3. Remove Fund Size filter (to get all funds)
4. Add columns via "Data & Columns":
   - **Basics:** Ticker, Name, Morningstar Category, Expense Ratio, Fund Size
   - **Performance & Risk:** Total Return (1yr/3yr/5yr/10yr), Std Dev (3yr), Sharpe (3yr), Beta (3yr), Alpha (3yr)
5. Click Download
6. Run: `node scripts/import-funds.js --morningstar path/to/export.csv`

#### Option 2: Financial Modeling Prep API
```bash
# Get free API key at https://financialmodelingprep.com/developer
echo "FMP_API_KEY=your_key" > .env
node scripts/fmp-import.js
node scripts/import-funds.js --fmp
```

#### Option 3: Import All Available Sources
```bash
node scripts/import-funds.js  # Auto-detects all sources
```

### Asset Class Distribution
- **US Equity (64)**: SPY, VOO, VTI, QQQ, VUG, VTV, AVUV, etc.
- **Intl Developed (17)**: VEA, IEFA, EFA, VXUS, AVDE, etc.
- **Emerging Markets (8)**: VWO, IEMG, EEM, AVEM, etc.
- **US Bonds (48)**: BND, AGG, TLT, SHY, LQD, etc.
- **Other (8)**: GLD, VNQ, BITO, etc.

## Running

```bash
cd portfolio-optimizer
npm install
npm run dev
# Open http://localhost:3000
```

## Tech Stack
- Next.js 14
- React
- better-sqlite3
- Tailwind CSS
- Recharts (for visualizations)

## Data Sources
- Fund data: Yahoo Finance (seeded), expandable via Morningstar
- Returns: 1Y, 3Y, 5Y, 10Y trailing
- Volatility: Asset-class benchmarks (can upgrade to fund-specific)

---
Built for Sam Adams, Feb 2026
