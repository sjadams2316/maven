/**
 * Valuation Indicators and Market Timing Signals
 * 
 * These indicators help adjust return expectations based on current market valuations.
 * Higher valuations historically lead to lower future returns.
 */

/**
 * Shiller CAPE Ratio Historical Data
 * Cyclically Adjusted Price-to-Earnings ratio (price / 10-year average earnings)
 * Source: Robert Shiller's data
 */
export const CAPE_HISTORY: { year: number; cape: number; subsequentReturn: number }[] = [
  // Selected years with subsequent 10-year real returns
  { year: 1920, cape: 5.0, subsequentReturn: 0.12 },
  { year: 1929, cape: 32.6, subsequentReturn: -0.01 },
  { year: 1932, cape: 5.6, subsequentReturn: 0.13 },
  { year: 1949, cape: 9.1, subsequentReturn: 0.16 },
  { year: 1966, cape: 24.1, subsequentReturn: 0.01 },
  { year: 1982, cape: 6.6, subsequentReturn: 0.14 },
  { year: 1987, cape: 18.3, subsequentReturn: 0.12 },
  { year: 2000, cape: 44.2, subsequentReturn: -0.01 },
  { year: 2009, cape: 13.3, subsequentReturn: 0.13 },
  { year: 2020, cape: 33.0, subsequentReturn: 0.05 }, // Projected
  { year: 2024, cape: 35.0, subsequentReturn: 0.04 }, // Projected
];

/**
 * Historical CAPE percentiles
 */
export const CAPE_PERCENTILES = {
  p10: 9.0,
  p25: 12.5,
  median: 16.5,
  p75: 22.0,
  p90: 28.0,
  historicalMean: 17.2,
};

/**
 * Estimate expected real return based on CAPE
 * Uses regression: Expected Return ≈ 1/CAPE (earnings yield) + adjustment
 */
export function estimateReturnFromCAPE(cape: number): {
  expectedRealReturn: number;
  confidence: 'low' | 'medium' | 'high';
  historicalRange: { low: number; high: number };
} {
  // Earnings yield approach with slight adjustment for historical fit
  const earningsYield = 1 / cape;
  const expectedRealReturn = earningsYield * 0.9 + 0.015; // Empirical adjustment
  
  // Confidence based on how close to historical mean
  let confidence: 'low' | 'medium' | 'high';
  if (cape > 30 || cape < 10) {
    confidence = 'low'; // Extreme valuations are harder to predict
  } else if (cape > 24 || cape < 13) {
    confidence = 'medium';
  } else {
    confidence = 'high';
  }
  
  // Historical range for this CAPE level
  const historicalRange = {
    low: expectedRealReturn - 0.05,
    high: expectedRealReturn + 0.08,
  };
  
  return { expectedRealReturn, confidence, historicalRange };
}

/**
 * Get current market valuation assessment
 */
export function getValuationAssessment(currentCAPE: number): {
  level: 'cheap' | 'fair' | 'expensive' | 'very_expensive';
  percentile: number;
  historicalContext: string;
  implication: string;
} {
  let level: 'cheap' | 'fair' | 'expensive' | 'very_expensive';
  let percentile: number;
  let historicalContext: string;
  let implication: string;
  
  if (currentCAPE < CAPE_PERCENTILES.p25) {
    level = 'cheap';
    percentile = 25;
    historicalContext = 'Below 25th percentile historically';
    implication = 'Higher expected returns over next decade';
  } else if (currentCAPE < CAPE_PERCENTILES.median) {
    level = 'fair';
    percentile = 50;
    historicalContext = 'Near historical median';
    implication = 'Moderate expected returns';
  } else if (currentCAPE < CAPE_PERCENTILES.p90) {
    level = 'expensive';
    percentile = 75;
    historicalContext = 'Above 75th percentile historically';
    implication = 'Lower expected returns over next decade';
  } else {
    level = 'very_expensive';
    percentile = 90;
    historicalContext = 'Above 90th percentile - rare territory';
    implication = 'Historically poor entry point for long-term returns';
  }
  
  return { level, percentile, historicalContext, implication };
}

/**
 * Buffett Indicator: Market Cap to GDP
 * Warren Buffett's favorite valuation metric
 */
export interface BuffettIndicator {
  value: number;
  assessment: string;
  historicalAverage: number;
}

export function assessBuffettIndicator(marketCapToGDP: number): BuffettIndicator {
  const historicalAverage = 0.85; // ~85% historically
  
  let assessment: string;
  if (marketCapToGDP < 0.7) {
    assessment = 'Significantly undervalued';
  } else if (marketCapToGDP < 0.9) {
    assessment = 'Fairly valued';
  } else if (marketCapToGDP < 1.2) {
    assessment = 'Moderately overvalued';
  } else if (marketCapToGDP < 1.5) {
    assessment = 'Significantly overvalued';
  } else {
    assessment = 'Extremely overvalued';
  }
  
  return { value: marketCapToGDP, assessment, historicalAverage };
}

/**
 * Fed Model: Earnings Yield vs 10Y Treasury
 * Compares stock earnings yield to bond yields
 */
export function fedModelAssessment(
  earningsYield: number,
  treasuryYield: number
): {
  spread: number;
  favorStocks: boolean;
  assessment: string;
} {
  const spread = earningsYield - treasuryYield;
  
  let assessment: string;
  let favorStocks: boolean;
  
  if (spread > 0.02) {
    assessment = 'Stocks attractive vs bonds';
    favorStocks = true;
  } else if (spread > 0) {
    assessment = 'Stocks slightly favored';
    favorStocks = true;
  } else if (spread > -0.01) {
    assessment = 'Roughly equal';
    favorStocks = false;
  } else {
    assessment = 'Bonds more attractive';
    favorStocks = false;
  }
  
  return { spread, favorStocks, assessment };
}

/**
 * Adjust Monte Carlo expected returns based on current valuations
 */
export function adjustExpectedReturn(
  historicalReturn: number,
  currentCAPE: number,
  weight: number = 0.5 // How much to weight valuation vs history
): number {
  const { expectedRealReturn } = estimateReturnFromCAPE(currentCAPE);
  
  // Blend historical average with valuation-implied return
  const adjustedReturn = historicalReturn * (1 - weight) + expectedRealReturn * weight;
  
  // Add inflation expectation (~2.5%)
  return adjustedReturn + 0.025;
}

/**
 * Economic indicators that affect expected returns
 */
export interface EconomicIndicators {
  cape: number;
  buffettIndicator: number;
  treasury10Y: number;
  fedFundsRate: number;
  inflation: number;
  unemploymentRate: number;
  yieldCurveSpread: number;
  vix: number;
}

/**
 * Generate comprehensive market outlook
 */
export function generateMarketOutlook(indicators: EconomicIndicators): {
  overallAssessment: 'bullish' | 'neutral' | 'cautious' | 'bearish';
  expectedReturn: { low: number; mid: number; high: number };
  risks: string[];
  opportunities: string[];
  recommendation: string;
} {
  const capeAssessment = getValuationAssessment(indicators.cape);
  const buffett = assessBuffettIndicator(indicators.buffettIndicator);
  const fedModel = fedModelAssessment(1 / indicators.cape, indicators.treasury10Y);
  
  // Score various factors (-2 to +2)
  let score = 0;
  const risks: string[] = [];
  const opportunities: string[] = [];
  
  // CAPE scoring
  if (capeAssessment.level === 'cheap') {
    score += 2;
    opportunities.push('Attractive valuations historically');
  } else if (capeAssessment.level === 'very_expensive') {
    score -= 2;
    risks.push('Valuations in top 10% historically');
  } else if (capeAssessment.level === 'expensive') {
    score -= 1;
    risks.push('Above-average valuations');
  }
  
  // Yield curve
  if (indicators.yieldCurveSpread < 0) {
    score -= 1;
    risks.push('Inverted yield curve (recession warning)');
  } else if (indicators.yieldCurveSpread > 1) {
    score += 1;
    opportunities.push('Healthy yield curve');
  }
  
  // VIX
  if (indicators.vix > 30) {
    risks.push('High volatility environment');
  } else if (indicators.vix < 15) {
    risks.push('Low VIX may indicate complacency');
  }
  
  // Fed funds
  if (indicators.fedFundsRate > 5) {
    risks.push('Restrictive monetary policy');
    score -= 0.5;
  }
  
  // Inflation
  if (indicators.inflation > 4) {
    risks.push('Elevated inflation');
    score -= 0.5;
  }
  
  // Overall assessment
  let overallAssessment: 'bullish' | 'neutral' | 'cautious' | 'bearish';
  if (score >= 1.5) {
    overallAssessment = 'bullish';
  } else if (score >= 0) {
    overallAssessment = 'neutral';
  } else if (score >= -1.5) {
    overallAssessment = 'cautious';
  } else {
    overallAssessment = 'bearish';
  }
  
  // Expected returns based on CAPE
  const { expectedRealReturn, historicalRange } = estimateReturnFromCAPE(indicators.cape);
  
  // Recommendation
  let recommendation: string;
  switch (overallAssessment) {
    case 'bullish':
      recommendation = 'Conditions favor equities. Consider full allocation to target.';
      break;
    case 'neutral':
      recommendation = 'Mixed signals. Maintain target allocation with diversification.';
      break;
    case 'cautious':
      recommendation = 'Consider slightly defensive positioning. Ensure adequate cash buffer.';
      break;
    case 'bearish':
      recommendation = 'High caution warranted. Consider reducing equity exposure and extending duration on bonds.';
      break;
  }
  
  return {
    overallAssessment,
    expectedReturn: {
      low: historicalRange.low,
      mid: expectedRealReturn,
      high: historicalRange.high,
    },
    risks,
    opportunities,
    recommendation,
  };
}
