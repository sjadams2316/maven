# Model Portfolio Construction Methodologies

## Overview

This document covers how major asset managers construct their model portfolios, the methodologies employed, and the tradeoffs involved.

---

## Vanguard's Approach

### Investment Methodologies

Vanguard employs four main methodologies:

1. **Market-Cap Weighting** - The default passive approach
2. **Model-Based Strategic Asset Allocation (SAA)** - Using VCMM simulations
3. **Active/Passive Methodology** - Hybrid approaches combining both
4. **Time-Varying Asset Allocation (TVAA)** - Dynamic allocation based on market conditions

### Vanguard Capital Markets Model (VCMM)

VCMM is Vanguard's proprietary simulation tool:

- **Foundation**: Returns reflect compensation for bearing systematic risk (beta)
- **Method**: Monte Carlo simulation with 10,000 runs per asset class
- **Time Horizon**: 10-year and 30-year forecasts
- **Key Inputs**: Dynamic statistical relationships between risk factors and returns
- **Output**: Full probability distributions, not just point estimates
- **Data**: Monthly financial/economic data from 1960+

**Key Insight**: VCMM doesn't impose normality - it captures fat tails and skewness in modeled returns. Vanguard stresses focusing on the *full range* of outcomes, not central tendencies.

### Vanguard Asset Allocation Model (VAAM)

VAAM is Vanguard's portfolio optimization engine:
- Utility-based optimization balancing risk and return
- Accounts for correlations and diversification benefits
- Supports multiple portfolio objectives:
  - **Wealth growth portfolios**
  - **Risk-hedging portfolios** (inflation, duration)
  - **Return target portfolios**

---

## BlackRock's Approach

### Model Portfolio Categories

BlackRock offers model portfolios organized by management team:

1. **Target Allocation Models** - Consistent investment framework across variety of portfolios, including alternatives and SMAs
2. **Global Allocation Models** - Most tactical, open architecture, combining alpha, index, and factors
3. **Multi-Asset Income Models** - Income and growth focus, insights from 12+ asset-class specialist teams

### Capital Market Assumptions Methodology

BlackRock's CMA approach:
- Incorporates structural drivers of interest rates into equity return expectations
- Uses bottom-up analyst earnings forecasts
- Accounts for relationship between margins and economic cycle
- Employs augmented discounted cash flow models
- Time-varying expectations based on market conditions

### Key Principles
- Rebalance at least 4x per year
- Can include ETFs, mutual funds, SMAs, and alternatives
- Risk profiling to customize to client needs

---

## JPMorgan's Approach

### Long-Term Capital Market Assumptions (LTCMA)

JPMorgan's flagship methodology (29 years running):

- **Horizon**: 10-15 year return and risk forecasts
- **Coverage**: 200+ assets and strategies in 19 base currencies
- **Team**: 100+ investment professionals contributing
- **Process**: Rigorous combination of quantitative and qualitative inputs

### 2025 LTCMA Key Forecasts

| Asset Class | Expected Return |
|-------------|-----------------|
| 60/40 Portfolio (USD) | 6.4% |
| U.S. Large Cap Equities | 6.7% |
| Global Equities (USD) | 7.1% |
| EM Equities (USD) | 7.2% |
| U.S. Intermediate Treasuries | 3.8% |
| U.S. Long Treasuries | 5.2% |
| U.S. Investment Grade Credit | 5.0% |
| U.S. High Yield | 6.1% |
| Private Equity | 9.9% |
| U.S. Core Real Estate | 8.1% |
| Global Core Infrastructure | 6.3% |
| Commodities | 3.8% |

### Methodology Insights

- **Growth Outlook**: Upgraded for developed markets
- **AI Impact**: 20bps annual boost to DM growth from AI
- **Valuations**: U.S. large cap has 1.8% drag from current valuations
- **Private Markets**: "Generational opportunity" in real estate
- **Inflation**: Slightly higher than pre-pandemic but starting from lower base

---

## Goldman Sachs' Approach

### 10-Year Return Forecasts

Goldman's 2025 forecasts:
- **S&P 500**: 6.5% total return per year (below historical average)
- **EM Dividend Yield**: 2.9% average over 10 years
- **U.S. vs. International**: Expects U.S. to underperform other world markets

### Historical Track Record

Goldman has published 10-year forecasts in 2012, 2020, and 2024. Results vary significantly - a reminder that forecasts have wide confidence intervals.

---

## Common Themes Across Firms

### Shared Principles

1. **Distributional Thinking** - Focus on range of outcomes, not point estimates
2. **Time-Varying Assumptions** - CMAs change with market conditions
3. **Integration of Multiple Inputs** - Quantitative models + qualitative judgment
4. **Long-Term Horizon** - 10+ year timeframes for strategic allocation
5. **Risk-Based Frameworks** - Volatility, correlations, and downside risks

### Key Differences

| Aspect | Vanguard | BlackRock | JPMorgan |
|--------|----------|-----------|----------|
| Primary Method | VCMM Simulation | Bottom-up DCF | Multi-factor |
| Focus | Full distributions | Structural drivers | Macro + bottoms-up |
| Rebalancing | Client-specific | 4x/year minimum | Tactical tilts |
| Alternatives | Limited | Significant | Strong private markets |

---

## Constraints Handled

### Common Portfolio Constraints

1. **Liquidity** - Cash needs, private market lockups
2. **Tax Efficiency** - Especially for taxable accounts
3. **ESG/SRI** - Environmental/social screens
4. **Regulatory** - Pension rules, insurance requirements
5. **Client Preferences** - Sector exclusions, concentration limits
6. **Benchmark Tracking** - Tracking error constraints

### How Firms Address Constraints

- **Vanguard**: Utility-based optimization in VAAM handles trade-offs
- **BlackRock**: Customizable models with specified constraints
- **JPMorgan**: Factor-based approach allows constraint integration

---

## Key Takeaways for Maven

1. **Methodology Matters Less Than Process** - All major firms use sophisticated models, but rigorous process and judgment are crucial
2. **Full Distributions > Point Estimates** - Don't anchor on single return forecasts
3. **CMAs Are Starting Points** - They inform allocation but don't determine it
4. **Integration Is Key** - Best firms combine quantitative models with qualitative insights
5. **Constraints Shape Outcomes** - Real portfolios must handle real-world limitations
