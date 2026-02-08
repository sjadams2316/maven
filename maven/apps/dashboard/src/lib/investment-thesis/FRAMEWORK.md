# Maven Investment Intelligence Framework

## The Problem With Traditional Optimization

Most robo-advisors recommend allocations based on:
1. **Historical returns** — "Stocks returned 10% historically"
2. **Historical correlations** — "Bonds hedge stocks"
3. **Mean-variance optimization** — Markowitz portfolio theory from 1952

**Why this fails:**
- **Backward-looking**: Past returns don't predict future returns
- **Regime-blind**: Correlations change in different environments (bonds didn't hedge in 2022)
- **Valuation-ignorant**: Starting valuations heavily impact future returns
- **Timing uncertainty**: "Cheap" can stay cheap for years (international 2015-2024)

## Maven's Approach: Thesis-Driven Allocation

Every allocation recommendation has three components:

### 1. Structural View (Long-term)
- What is the fundamental case for this asset class?
- What role does it play in a portfolio?
- What are the expected returns over 10+ years?

### 2. Valuation Assessment (Medium-term)
- Is it cheap, fair, or expensive vs history?
- What do valuations imply about future returns?
- How long might it take for value to be realized?

### 3. Regime Context (Near-term)
- What's the current economic/market regime?
- Are conditions favorable or unfavorable?
- What catalysts might change the outlook?

## Honest Uncertainty

For EVERY recommendation, we acknowledge:
- **What we're confident about** (structural case)
- **What we're less certain about** (timing)
- **What could go wrong** (risk factors)
- **Historical base rates** (how often has this worked?)

## Example: International Developed Markets

**Structural View:**
- Diversification across economies, currencies, sectors
- Non-US stocks = ~40% of global market cap
- Access to global champions (Nestle, ASML, Toyota)

**Valuation Assessment (Feb 2026):**
- CAPE: ~16x vs US ~32x (50% discount)
- P/E: ~14x vs US ~22x
- Dividend yield: ~3% vs US ~1.5%
- Historically, this discount has been 10-20%, now it's 50%

**Regime Context:**
- Dollar strength has hurt int'l returns for US investors
- If dollar weakens, int'l gets a tailwind
- Europe/Japan benefiting from reshoring trends
- Political/regulatory risk in EU

**Our Recommendation:**
"International stocks are significantly cheaper than US stocks, suggesting higher long-term returns. However, this has been true since 2015 with disappointing results. We recommend meaningful international exposure (15-25%) for diversification, but acknowledge timing is uncertain. Don't overweight just because it's 'cheap' — cheap can stay cheap."

**What could change our view:**
- If US valuations normalized, we'd increase int'l
- If dollar strengthened further, we'd be cautious
- If earnings growth diverged (US >> Int'l), we'd reassess

---

## Capital Market Assumptions (CMAs)

We incorporate forward-looking estimates from major asset managers:

| Source | US Equities | Int'l Dev | EM | US Bonds | 
|--------|-------------|-----------|-----|----------|
| Vanguard (10yr) | 4.2-6.2% | 6.4-8.4% | 5.5-7.5% | 4.3-5.3% |
| BlackRock (10yr) | 6.2% | 7.1% | 7.4% | 4.8% |
| JPMorgan (10-15yr) | 6.7% | 8.4% | 7.5% | 5.0% |
| AQR (5-10yr) | 4.5% | 6.5% | 7.0% | 4.0% |
| Research Affiliates | 0.5% | 5.5% | 7.5% | 5.2% |

**Key insight:** The range is huge! Anyone claiming precision is fooling themselves.

**What CMAs tell us:**
- Non-US expected to outperform US over next decade
- Bonds expected to return ~4-5% (vs 5-6% for stocks)
- Risk premia are compressed vs history
- Starting valuations matter enormously

---

## Our Research Process

Maven continuously monitors:

1. **Valuation Metrics**
   - CAPE ratios by region
   - Credit spreads
   - Earnings yields vs bond yields

2. **Regime Indicators**
   - Yield curve shape
   - Inflation trends
   - Credit conditions
   - Dollar strength

3. **Sentiment/Positioning**
   - Fund flows
   - Positioning data
   - Sentiment surveys

4. **Fundamental Trends**
   - Earnings growth
   - Margin trends
   - Capex cycles

This research feeds into our recommendations with explicit reasoning.
