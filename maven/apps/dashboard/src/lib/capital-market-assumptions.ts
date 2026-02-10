/**
 * Capital Market Assumptions (CMAs)
 *
 * Forward-looking 10-15 year expected returns for major asset classes.
 * Compiled from leading investment research firms' 2026 forecasts.
 *
 * Why this matters:
 * - Historical returns (10yr) make US stocks look dominant (~13% vs ~5% intl)
 * - Forward-looking CMAs flip this narrative due to valuations
 * - US large cap expected: 4-7%, International expected: 5-8%
 *
 * Key 2026 Themes:
 * - Vanguard favors: High-quality bonds > US value > Non-US developed equities
 * - JP Morgan: 60/40 portfolio projected at 6.4% annualized
 * - AI investment cycle supporting near-term growth but long-term returns muted
 * - Bond yields attractive at current levels (~4% projected decade returns)
 *
 * Sources:
 * - Vanguard Capital Markets Model & 2026 Economic Outlook (Dec 2025)
 * - J.P. Morgan 2026 Long-Term Capital Market Assumptions (Oct 2025) - 30th Edition
 * - BlackRock Capital Market Assumptions (2025)
 * - Research Affiliates Asset Allocation Interactive (Jan 2026)
 *
 * Last updated: February 9, 2026
 */

export interface AssetClassCMA {
  /** Human-readable asset class name */
  assetClass: string;
  /** Representative ETF ticker(s) */
  tickers: string[];
  /** 10-year annualized expected return (%) - consensus midpoint */
  expectedReturn: number;
  /** Expected annualized volatility/standard deviation (%) */
  expectedVolatility: number;
  /** Range of estimates across sources */
  returnRange: { low: number; high: number };
  /** Primary source for this estimate */
  source: string;
  /** Date of the CMA source data */
  asOfDate: string;
  /** Explanation of the forecast rationale */
  rationale: string;
}

/**
 * Capital Market Assumptions by asset class
 * Keys are kebab-case identifiers for programmatic use
 */
export const CAPITAL_MARKET_ASSUMPTIONS: Record<string, AssetClassCMA> = {
  'us-large-cap': {
    assetClass: 'US Large Cap',
    tickers: ['VOO', 'SPY', 'VTI', 'IVV'],
    expectedReturn: 5.5,
    expectedVolatility: 16.5,
    returnRange: { low: 4.0, high: 6.7 },
    source: 'Consensus (Vanguard 2026, JP Morgan 2026 LTCMA)',
    asOfDate: '2026-01',
    rationale:
      'Elevated CAPE ratio (~35) suggests below-average returns. Vanguard forecasts muted 4-5% returns driven by large-cap tech valuations. JP Morgan 2026 LTCMA: 6.7% (unchanged from prior year). Strong AI capital investment supports near-term earnings but long-term returns face valuation headwinds.',
  },

  'us-small-cap': {
    assetClass: 'US Small Cap',
    tickers: ['VB', 'IWM', 'IJR', 'SCHA'],
    expectedReturn: 6.5,
    expectedVolatility: 21.0,
    returnRange: { low: 5.1, high: 7.4 },
    source: 'Consensus (Vanguard, Research Affiliates)',
    asOfDate: '2025-12',
    rationale:
      'More attractive valuations than large caps. Higher volatility but better expected risk-adjusted returns. Vanguard forecasts 5.1-7.1%, Research Affiliates 7.1%.',
  },

  'us-growth': {
    assetClass: 'US Growth',
    tickers: ['VUG', 'IWF', 'SCHG', 'QQQ'],
    expectedReturn: 4.0,
    expectedVolatility: 18.5,
    returnRange: { low: 2.5, high: 5.0 },
    source: 'Vanguard 2026 Outlook',
    asOfDate: '2026-01',
    rationale:
      'Vanguard 2026: "We remain most guarded in our assessment of US growth stocks." Muted 4-5% US stock forecast is "nearly single-handedly driven by our risk-return assessment of large-cap technology companies." Two headwinds: already-high earnings expectations and "typical underestimation of creative destruction from new entrants."',
  },

  'us-value': {
    assetClass: 'US Value',
    tickers: ['VTV', 'IWD', 'SCHV'],
    expectedReturn: 6.8,
    expectedVolatility: 16.0,
    returnRange: { low: 5.8, high: 7.8 },
    source: 'Vanguard 2026 Outlook',
    asOfDate: '2026-01',
    rationale:
      'Vanguard 2026: US value-oriented equities ranked 2nd best risk-return opportunity (after bonds, before non-US developed). More reasonable valuations vs growth stocks. Should benefit as AI growth broadens to "consumers of AI technology."',
  },

  'intl-developed': {
    assetClass: 'International Developed',
    tickers: ['VXUS', 'VEA', 'EFA', 'IEFA', 'SCHF'],
    expectedReturn: 7.0,
    expectedVolatility: 17.5,
    returnRange: { low: 5.5, high: 8.0 },
    source: 'Consensus (Vanguard 2026, JP Morgan 2026 LTCMA)',
    asOfDate: '2026-01',
    rationale:
      'Vanguard 2026: Non-US developed markets ranked 3rd best risk-return opportunity. JP Morgan 2026: Global equities 7% (USD). Lower valuations (CAPE ~18) vs US provide tailwind. Currency matters: EUR-based investors faced dollar strength headwind in 2025. Both value-oriented and non-US developed equities "should benefit most over time as AI\'s eventual boost to growth broadens."',
  },

  'emerging-markets': {
    assetClass: 'Emerging Markets',
    tickers: ['VWO', 'IEMG', 'EEM', 'SCHE'],
    expectedReturn: 7.8,
    expectedVolatility: 23.0,
    returnRange: { low: 7.0, high: 9.0 },
    source: 'JP Morgan 2026 LTCMA',
    asOfDate: '2026-01',
    rationale:
      'JP Morgan 2026 LTCMA: 7.8% expected (USD), dipped modestly after strong 2025 performance. Attractive valuations and younger demographics support higher expected returns. Economic nationalism and trade frictions create headwinds, but EM GDP growth forecast at 3.7%. Higher volatility reflects political/currency risks.',
  },

  'us-aggregate-bonds': {
    assetClass: 'US Aggregate Bonds',
    tickers: ['BND', 'AGG', 'SCHZ'],
    expectedReturn: 4.5,
    expectedVolatility: 5.5,
    returnRange: { low: 4.0, high: 5.0 },
    source: 'Consensus (Vanguard 2026, JP Morgan 2026 LTCMA)',
    asOfDate: '2026-01',
    rationale:
      'Vanguard 2026: High-quality US fixed income ranked #1 best risk-return opportunity. "Bonds are back" - projected ~4% returns over decade regardless of Fed policy. Provides diversification if AI investment disappoints. Short-to-intermediate term bonds fare well.',
  },

  'us-treasury': {
    assetClass: 'US Treasury Bonds',
    tickers: ['GOVT', 'IEF', 'TLT', 'VGIT'],
    expectedReturn: 4.3,
    expectedVolatility: 6.0,
    returnRange: { low: 4.0, high: 4.9 },
    source: 'JP Morgan 2026 LTCMA',
    asOfDate: '2026-01',
    rationale:
      'JP Morgan 2026 LTCMA: Intermediate Treasuries 4.0%, Long Treasuries 4.9%. Fed neutral rate estimated at 3.5% per Vanguard - "a bit more hawkish than bond market expectations." Still-sticky inflation (>2% in 2026) limits Fed rate cuts.',
  },

  'us-tips': {
    assetClass: 'US TIPS (Inflation-Protected)',
    tickers: ['TIP', 'SCHP', 'VTIP'],
    expectedReturn: 3.8,
    expectedVolatility: 5.5,
    returnRange: { low: 3.2, high: 4.5 },
    source: 'Vanguard/BlackRock',
    asOfDate: '2025-10',
    rationale:
      'Real yield of ~2% plus expected inflation. Provides inflation hedge. BlackRock favors TIPS given tariff-driven inflation risks.',
  },

  'us-corporate-bonds': {
    assetClass: 'US Investment Grade Corporate',
    tickers: ['LQD', 'VCIT', 'IGIB'],
    expectedReturn: 5.2,
    expectedVolatility: 7.0,
    returnRange: { low: 4.8, high: 5.5 },
    source: 'JP Morgan 2026 LTCMA',
    asOfDate: '2026-01',
    rationale:
      'JP Morgan 2026 LTCMA: 5.2% expected. Spreads tightening due to shorter maturity debt issuance trends. Higher growth expectations support creditworthiness.',
  },

  'us-high-yield': {
    assetClass: 'US High Yield Bonds',
    tickers: ['HYG', 'JNK', 'USHY', 'SHYG'],
    expectedReturn: 6.1,
    expectedVolatility: 10.0,
    returnRange: { low: 5.5, high: 6.5 },
    source: 'JP Morgan 2026 LTCMA',
    asOfDate: '2026-01',
    rationale:
      'JP Morgan 2026 LTCMA: 6.1% expected with fair value spread of 475bps. Higher credit quality in the HY market supports returns. Vanguard maintains high-quality bonds offer compelling real returns.',
  },

  'em-bonds': {
    assetClass: 'Emerging Market Bonds',
    tickers: ['EMB', 'VWOB', 'PCY'],
    expectedReturn: 5.8,
    expectedVolatility: 10.5,
    returnRange: { low: 5.1, high: 6.3 },
    source: 'Consensus (Vanguard, JP Morgan)',
    asOfDate: '2025-12',
    rationale:
      'Higher yields reflect currency and political risk. Vanguard 5.1-6.1% (hedged), JP Morgan 6.3%.',
  },

  'us-reits': {
    assetClass: 'US REITs',
    tickers: ['VNQ', 'IYR', 'SCHH', 'USRT'],
    expectedReturn: 8.2,
    expectedVolatility: 19.0,
    returnRange: { low: 6.5, high: 8.5 },
    source: 'JP Morgan 2026 LTCMA',
    asOfDate: '2026-01',
    rationale:
      'JP Morgan 2026 LTCMA: US core real estate 8.2%, driven by attractive entry points and higher yields. European core real estate 6.9%. Real assets recommended for diversification in "smarter portfolios." Interest rate sensitivity remains a risk.',
  },

  commodities: {
    assetClass: 'Commodities',
    tickers: ['DJP', 'GSG', 'PDBC', 'DBC'],
    expectedReturn: 4.6,
    expectedVolatility: 16.0,
    returnRange: { low: 3.5, high: 5.5 },
    source: 'JP Morgan 2026 LTCMA',
    asOfDate: '2026-01',
    rationale:
      'JP Morgan 2026 LTCMA: Broad basket commodities 4.6%, Gold 5.5% (up from 4.5% last year). Energy transition and geopolitical risks create uncertainty. Real assets (including commodities) recommended for managing inflation volatility.',
  },

  cash: {
    assetClass: 'Cash / Money Market',
    tickers: ['SGOV', 'BIL', 'SHV', 'VMFXX'],
    expectedReturn: 3.2,
    expectedVolatility: 0.5,
    returnRange: { low: 2.5, high: 3.8 },
    source: 'JP Morgan 2026 LTCMA',
    asOfDate: '2026-01',
    rationale:
      'Fed neutral rate 3.5% per Vanguard 2026. Current elevated short-term rates expected to normalize over time. Still-sticky inflation (>2% in 2026) limits Fed cuts.',
  },
};

/**
 * Map of ticker symbols to asset class keys
 * Used for quick lookups by ticker
 */
const TICKER_TO_ASSET_CLASS: Record<string, string> = {};

// Build the ticker lookup map
Object.entries(CAPITAL_MARKET_ASSUMPTIONS).forEach(([key, cma]) => {
  cma.tickers.forEach((ticker) => {
    TICKER_TO_ASSET_CLASS[ticker.toUpperCase()] = key;
  });
});

/**
 * Get Capital Market Assumptions for a given ticker
 * @param ticker ETF ticker symbol (case-insensitive)
 * @returns CMA data or null if not found
 */
export function getCMAForTicker(ticker: string): AssetClassCMA | null {
  const assetClassKey = TICKER_TO_ASSET_CLASS[ticker.toUpperCase()];
  if (!assetClassKey) {
    return null;
  }
  return CAPITAL_MARKET_ASSUMPTIONS[assetClassKey];
}

/**
 * Get Capital Market Assumptions for a given asset class key
 * @param assetClassKey kebab-case asset class identifier
 * @returns CMA data or null if not found
 */
export function getCMAForAssetClass(assetClassKey: string): AssetClassCMA | null {
  return CAPITAL_MARKET_ASSUMPTIONS[assetClassKey] || null;
}

/**
 * Get all asset classes that a ticker might belong to
 * Useful when a ticker could map to multiple categories
 */
export function getAssetClassKeyForTicker(ticker: string): string | null {
  return TICKER_TO_ASSET_CLASS[ticker.toUpperCase()] || null;
}

/**
 * Get consensus expected return for a portfolio
 * @param holdings Array of { ticker, weight } objects
 * @returns Weighted average expected return, or null if any ticker not found
 */
export function getPortfolioExpectedReturn(
  holdings: Array<{ ticker: string; weight: number }>
): number | null {
  let totalWeight = 0;
  let weightedReturn = 0;

  for (const holding of holdings) {
    const cma = getCMAForTicker(holding.ticker);
    if (!cma) {
      // Unknown ticker - can't calculate
      return null;
    }
    weightedReturn += cma.expectedReturn * holding.weight;
    totalWeight += holding.weight;
  }

  if (totalWeight === 0) return null;
  return weightedReturn / totalWeight;
}

/**
 * Get all supported tickers
 */
export function getSupportedTickers(): string[] {
  return Object.keys(TICKER_TO_ASSET_CLASS);
}

/**
 * Check if a ticker has CMA data available
 */
export function hasCMAData(ticker: string): boolean {
  return ticker.toUpperCase() in TICKER_TO_ASSET_CLASS;
}

/**
 * Key insight: Why CMAs matter for recommendations
 *
 * Historical 10-year returns (as of 2025):
 * - US Large Cap (VOO): ~13% annualized
 * - International Developed (VXUS): ~5% annualized
 * - Emerging Markets (VWO): ~4% annualized
 *
 * Forward-looking CMAs (10-15 year expectations per 2026 sources):
 * - US Large Cap: ~5.5% (4.0% to 6.7% range)
 * - US Growth: ~4.0% (Vanguard's most guarded assessment)
 * - US Value: ~6.8% (Vanguard's 2nd best opportunity)
 * - International Developed: ~7.0% (5.5% to 8.0% range)
 * - Emerging Markets: ~7.8% (JP Morgan 2026 LTCMA)
 * - US Aggregate Bonds: ~4.5% (Vanguard's #1 best opportunity!)
 *
 * The narrative FLIPS: International is expected to outperform!
 * Even bonds may beat US large-cap growth stocks on a risk-adjusted basis.
 * This is critical for explaining diversification recommendations.
 *
 * Vanguard 2026 Ranking (Best to Worst Risk-Return):
 * 1. High-quality US fixed income
 * 2. US value-oriented equities
 * 3. Non-US developed market equities
 *
 * JP Morgan 2026: 60/40 portfolio projected at 6.4% annualized.
 * With 30% alternatives: 6.9% with 25% Sharpe ratio improvement.
 */
export const CMA_KEY_INSIGHT = {
  usHistorical10yr: 13.0,
  intlHistorical10yr: 5.0,
  usExpected10yr: 5.5,
  usGrowthExpected10yr: 4.0,
  usValueExpected10yr: 6.8,
  intlExpected10yr: 7.0,
  emExpected10yr: 7.8,
  bondsExpected10yr: 4.5,
  portfolio6040Expected: 6.4,
  narrative:
    'Historical returns favor US, but forward-looking expectations favor international and value. Vanguard 2026 ranks bonds as #1 risk-return opportunity.',
  vanguardRanking: [
    'High-quality US fixed income',
    'US value-oriented equities',
    'Non-US developed market equities',
  ],
};
