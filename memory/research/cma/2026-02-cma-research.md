# Capital Market Assumptions Research - February 2026

**Date:** February 9, 2026  
**Purpose:** Gather forward-looking CMAs for Pantheon dashboard portfolio comparison features

---

## Executive Summary

Forward-looking CMAs from major sources (Vanguard, JP Morgan) paint a very different picture than historical returns:

| Asset Class | Historical 10yr | Expected 10-15yr | Delta |
|-------------|-----------------|------------------|-------|
| US Large Cap | ~13% | 5.5% | -7.5% |
| US Growth | ~15% | 4.0% | -11% |
| US Value | ~10% | 6.8% | -3.2% |
| Int'l Developed | ~5% | 7.0% | +2% |
| Emerging Markets | ~4% | 7.8% | +3.8% |
| US Agg Bonds | ~1.5% | 4.5% | +3% |

**Key Insight:** The narrative flips. International equities and even bonds are expected to outperform US growth stocks.

---

## Primary Sources Researched

### 1. Vanguard 2026 Economic and Market Outlook (Dec 2025)

**Source:** https://corporate.vanguard.com/content/corporatesite/us/en/corp/vemo/2026-outlook-economic-upside-stock-market-downside.html

**Key Findings:**
- **Best Risk-Return Opportunities (ranked):**
  1. High-quality US fixed income
  2. US value-oriented equities
  3. Non-US developed market equities

- **US Stocks:** "We expect returns for U.S. stocks—particularly growth stocks—to be muted over the next five to 10 years."
  - Muted 4-5% forecast "nearly single-handedly driven by our risk-return assessment of large-cap technology companies"
  - Two headwinds: high earnings expectations + creative destruction from new entrants

- **Bonds:** "Bonds are back" - projected ~4% returns over decade regardless of Fed policy
  - Provides diversification if AI investment disappoints
  - Short-to-intermediate term bonds fare well

- **International:** Non-US developed markets should benefit as "AI's eventual boost to growth broadens to consumers of AI technology"

- **Portfolio Allocation:** Vanguard's VEMO portfolio: 40% stocks, 60% bonds

- **Economic Outlook:**
  - US GDP growth: ~2.25% in 2026
  - Fed neutral rate: 3.5% (more hawkish than bond market expects)
  - Inflation: above 2% through 2026
  - 60% probability of 3% real GDP growth in coming years (AI-driven)

### 2. JP Morgan 2026 Long-Term Capital Market Assumptions (Oct 2025) - 30th Edition

**Source:** https://www.prnewswire.com/news-releases/jp-morgan-releases-2026-long-term-capital-market-assumptions-302589249.html

**Key Findings:**

#### Portfolio Returns
- **60/40 Portfolio:** 6.4% expected annualized return
- **60/40 + 30% Alternatives:** 6.9% return, 25% Sharpe ratio improvement

#### Specific Asset Class Returns

| Asset Class | Expected Return |
|-------------|-----------------|
| US Large Cap Equities | 6.7% |
| Global Equities (USD) | 7.0% |
| Emerging Markets Equities (USD) | 7.8% |
| US Intermediate Treasuries | 4.0% |
| US Long Treasuries | 4.9% |
| US Investment Grade Credit | 5.2% |
| US High Yield | 6.1% |
| US Core Real Estate | 8.2% |
| European Core Real Estate | 6.9% |
| Global Core Infrastructure | 6.5% |
| Commodities (broad basket) | 4.6% |
| Gold | 5.5% |
| Global Timberland | 6.3% |
| Private Equity | 10.2% |

#### Key Themes
1. **Resilience despite slower growth:** Asset return projections remain strong despite labor constraints
2. **Economic nationalism:** Trade frictions making headlines but boosting domestic investment
3. **AI at critical juncture:** Adoption surging, investment massive - active management key
4. **Currency matters:** EUR-based investors faced dollar strength headwind
5. **Diversification essential:** Smarter portfolios use alternatives and real assets

### 3. Research Affiliates Asset Allocation Interactive

**Source:** https://interactive.researchaffiliates.com/asset-allocation

**Key Features:**
- Free online tool updated regularly
- 10-year track record of CMA accuracy
- Covers 18 assets across 9 asset classes
- Two models: valuation-dependent and yield-and-growth

**Asset Classes Covered:**
- US Equity (Large Cap, Small Cap)
- International Equity (Developed Markets)
- EM Equity (Emerging Markets)
- US Bonds (Short/Intermediate/Long Treasury, Aggregate)
- Credit (IG, Long Corporate, High Yield, EM Sovereign)
- International Bonds (Global Treasury, EM Local)
- TIPS (Intermediate, Long)
- REITs (Equity REITs)
- Commodities (Diversified)

---

## Data Compiled for Implementation

The following CMAs were compiled and added to `apps/dashboard/src/lib/capital-market-assumptions.ts`:

### Equities

| Key | Asset Class | Expected Return | Volatility | Range |
|-----|-------------|-----------------|------------|-------|
| us-large-cap | US Large Cap | 5.5% | 16.5% | 4.0-6.7% |
| us-small-cap | US Small Cap | 6.5% | 21.0% | 5.1-7.4% |
| us-growth | US Growth | 4.0% | 18.5% | 2.5-5.0% |
| us-value | US Value | 6.8% | 16.0% | 5.8-7.8% |
| intl-developed | Int'l Developed | 7.0% | 17.5% | 5.5-8.0% |
| emerging-markets | Emerging Markets | 7.8% | 23.0% | 7.0-9.0% |

### Fixed Income

| Key | Asset Class | Expected Return | Volatility | Range |
|-----|-------------|-----------------|------------|-------|
| us-aggregate-bonds | US Agg Bonds | 4.5% | 5.5% | 4.0-5.0% |
| us-treasury | US Treasury | 4.3% | 6.0% | 4.0-4.9% |
| us-tips | US TIPS | 3.8% | 5.5% | 3.2-4.5% |
| us-corporate-bonds | US IG Corporate | 5.2% | 7.0% | 4.8-5.5% |
| us-high-yield | US High Yield | 6.1% | 10.0% | 5.5-6.5% |
| em-bonds | EM Bonds | 5.8% | 10.5% | 5.1-6.3% |

### Alternatives

| Key | Asset Class | Expected Return | Volatility | Range |
|-----|-------------|-----------------|------------|-------|
| us-reits | US REITs | 8.2% | 19.0% | 6.5-8.5% |
| commodities | Commodities | 4.6% | 16.0% | 3.5-5.5% |
| cash | Cash/Money Market | 3.2% | 0.5% | 2.5-3.8% |

---

## Key Insights for Pantheon Implementation

### 1. Why Historical vs Expected Matters

When users see portfolio comparison:
- Historical shows US concentration winning big (~13% vs 5% international)
- Expected shows diversification winning (5.5% US vs 7% international)

This explains WHY diversification recommendations make sense even when historical data looks bad.

### 2. Vanguard's Ranking Is Critical

Quote this directly in UI:
> "Our capital market projections show that the strongest risk-return profiles across public investments over the coming 5-to-10 years are, in order:
> 1. High-quality U.S. fixed income
> 2. U.S. value-oriented equities  
> 3. Non-U.S. developed-market equities"

### 3. "Bonds Are Back"

Key talking point: Vanguard explicitly states bonds are back regardless of Fed policy. ~4% expected returns with lower volatility = compelling risk-adjusted returns.

### 4. Growth Stock Warning

Vanguard is "most guarded" on US growth stocks. Muted returns driven by:
- Already-high earnings expectations
- Creative destruction from new entrants
- Extreme valuations

### 5. AI Investment Creates Near-Term Strength

Both Vanguard and JP Morgan note AI investment supports near-term earnings. But:
- Long-term, the winners will be "consumers of AI technology"
- Value and international should benefit more over full cycle

---

## Sources Bibliography

1. **Vanguard 2026 Economic and Market Outlook**
   - Press Release: https://corporate.vanguard.com/content/corporatesite/us/en/corp/who-we-are/pressroom/press-release-vanguard-releases-2026-economic-and-market-outlook-121025.html
   - Summary: https://corporate.vanguard.com/content/corporatesite/us/en/corp/vemo/2026-outlook-economic-upside-stock-market-downside.html
   - Advisor Article: https://advisors.vanguard.com/insights/article/2026-economic-and-market-outlook
   - VCMM Forecasts: https://corporate.vanguard.com/content/corporatesite/us/en/corp/vemo/vemo-return-forecasts.html
   - Published: December 10, 2025

2. **JP Morgan 2026 Long-Term Capital Market Assumptions (30th Edition)**
   - Press Release: https://www.prnewswire.com/news-releases/jp-morgan-releases-2026-long-term-capital-market-assumptions-302589249.html
   - Chase Summary: https://www.chase.com/personal/investments/learning-and-insights/article/2026-long-term-capital-market-assumptions
   - Full Report: https://am.jpmorgan.com/us/en/asset-management/adv/insights/portfolio-insights/ltcma/
   - Published: October 20, 2025

3. **Research Affiliates Asset Allocation Interactive**
   - Tool: https://interactive.researchaffiliates.com/asset-allocation
   - 10-Year Review: https://www.researchaffiliates.com/publications/articles/1069-asset-allocation-interactive-good-bad-ugly
   - Press Release: https://www.researchaffiliates.com/about-us/in-the-news/asset-allocation-interactive-press-release
   - Published: January 2025 (10-year anniversary)

---

## Next Steps

1. ✅ Data file created: `apps/dashboard/src/lib/capital-market-assumptions.ts`
2. ⏳ Build and verify TypeScript compiles
3. ⏳ Git commit and push
4. ⏳ Update PANTHEON-STATUS.md
5. ⏳ Add learning to LEARNINGS.md

---

*Research conducted: February 9, 2026*
