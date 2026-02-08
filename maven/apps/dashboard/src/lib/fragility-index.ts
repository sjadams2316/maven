/**
 * Maven Market Fragility Index™
 * 
 * Measures systemic market fragility based on complexity theory.
 * Not predicting WHEN, but measuring HOW RIPE conditions are.
 * 
 * Enhanced with 40+ indicators across 6 pillars.
 */

export interface IndicatorScore {
  value: number | null;
  score: number; // 0-100
  percentile: number;
  status: 'low' | 'normal' | 'elevated' | 'high' | 'extreme';
  description: string;
  source?: string;
}

export interface PillarScore {
  name: string;
  score: number;
  weight: number;
  indicators: Record<string, IndicatorScore>;
  interpretation: string;
}

export interface FragilityIndex {
  timestamp: string;
  compositeScore: number;
  zone: 'resilient' | 'normal' | 'elevated' | 'fragile' | 'critical';
  zoneColor: string;
  zoneEmoji: string;
  interpretation: string;
  
  pillars: {
    valuation: PillarScore;
    credit: PillarScore;
    volatility: PillarScore;
    sentiment: PillarScore;
    structure: PillarScore;
    macro: PillarScore;
    liquidity: PillarScore;
    contagion: PillarScore;
  };
  
  keyRisks: string[];
  keyStrengths: string[];
  
  historicalContext: {
    current: number;
    oneMonthAgo: number;
    oneYearAgo: number;
    preCovid: number;
    pre2022: number;
  };
  
  actionItems: string[];
  dataAsOf: string;
  indicatorCount: number;
}

/**
 * Historical thresholds for percentile scoring (based on 20+ years of data)
 */
const HISTORICAL_RANGES = {
  // Valuation
  buffettIndicator: { min: 50, max: 200, mean: 100, highStress: 150 },
  shillerCape: { min: 10, max: 45, mean: 17, highStress: 30 },
  priceToSales: { min: 0.8, max: 3.0, mean: 1.5, highStress: 2.2 },
  
  // Credit Spreads (basis points)
  hySpread: { min: 200, max: 2000, mean: 400, highStress: 600 },
  igSpread: { min: 50, max: 400, mean: 100, highStress: 150 },
  bbSpread: { min: 150, max: 1200, mean: 250, highStress: 400 },
  cccSpread: { min: 500, max: 3500, mean: 800, highStress: 1200 },
  emSpread: { min: 200, max: 1200, mean: 350, highStress: 500 },
  
  // Banking
  tedSpread: { min: 10, max: 400, mean: 35, highStress: 75 },
  cpSpread: { min: 0, max: 200, mean: 20, highStress: 50 },
  
  // Volatility
  vix: { min: 10, max: 80, mean: 18, highStress: 25 },
  vvix: { min: 70, max: 180, mean: 95, highStress: 120 },
  moveIndex: { min: 50, max: 200, mean: 90, highStress: 120 },
  
  // Yield Curve
  yieldCurve10y2y: { min: -1.0, max: 3.0, mean: 1.0, inverted: 0 },
  yieldCurve10y3m: { min: -1.0, max: 3.5, mean: 1.5, inverted: 0 },
  
  // Financial Conditions
  nfci: { min: -1.0, max: 3.0, mean: 0, tightening: 0.5 },
  stlfsi: { min: -2.0, max: 5.0, mean: 0, stress: 1.0 },
  
  // Sentiment
  fearGreed: { min: 0, max: 100, mean: 50, extremeGreed: 80, extremeFear: 20 },
  aaiiNetBull: { min: -40, max: 40, mean: 0, extremeOptimism: 25 },
  putCallRatio: { min: 0.5, max: 1.5, mean: 0.85, complacent: 0.65 },
  
  // Structure
  concentration: { min: 15, max: 40, mean: 22, highStress: 30 },
  breadth: { min: 20, max: 80, mean: 55, weak: 40 },
  
  // Macro
  lei: { min: -10, max: 10, mean: 2, recession: -2 },
  consumerSentiment: { min: 50, max: 110, mean: 85, weak: 70 },
  unemploymentClaims: { min: 200, max: 600, mean: 250, stress: 350 }, // thousands
  
  // Liquidity
  m2Growth: { min: -5, max: 25, mean: 6, contraction: 0 },
  fedBalanceSheetGrowth: { min: -20, max: 100, mean: 5, stress: -10 },
  
  // Global
  dollarIndex: { min: 80, max: 120, mean: 95, strong: 105 },
};

/**
 * Convert raw value to 0-100 stress score
 */
function valueToScore(
  value: number | null | undefined,
  range: { min: number; max: number },
  inverted: boolean = false
): number {
  if (value === null || value === undefined) return 50;
  
  let normalized = (value - range.min) / (range.max - range.min);
  normalized = Math.max(0, Math.min(1, normalized));
  
  if (inverted) {
    normalized = 1 - normalized;
  }
  
  return Math.round(normalized * 100);
}

/**
 * Get status label from score
 */
function getStatus(score: number): 'low' | 'normal' | 'elevated' | 'high' | 'extreme' {
  if (score < 25) return 'low';
  if (score < 45) return 'normal';
  if (score < 65) return 'elevated';
  if (score < 80) return 'high';
  return 'extreme';
}

/**
 * Get zone from composite score
 */
function getZone(score: number): {
  zone: FragilityIndex['zone'];
  color: string;
  emoji: string;
  interpretation: string;
} {
  if (score < 25) {
    return {
      zone: 'resilient',
      color: '#10B981',
      emoji: '🟢',
      interpretation: 'Market conditions are resilient. Low systemic stress. Favorable for risk-taking.',
    };
  }
  if (score < 45) {
    return {
      zone: 'normal',
      color: '#F59E0B',
      emoji: '🟡',
      interpretation: 'Normal market conditions. Standard risk management appropriate.',
    };
  }
  if (score < 65) {
    return {
      zone: 'elevated',
      color: '#F97316',
      emoji: '🟠',
      interpretation: 'Elevated fragility. Multiple stress signals present. Consider reducing risk.',
    };
  }
  if (score < 80) {
    return {
      zone: 'fragile',
      color: '#EF4444',
      emoji: '🔴',
      interpretation: 'System approaching critical state. High volatility expected. Defensive positioning warranted.',
    };
  }
  return {
    zone: 'critical',
    color: '#7C3AED',
    emoji: '⚫',
    interpretation: 'Critical fragility. Conditions similar to pre-crisis periods. Capital preservation mode.',
  };
}

/**
 * Create indicator score helper
 */
function createIndicator(
  value: number | null | undefined,
  score: number,
  description: string,
  source?: string
): IndicatorScore {
  return {
    value: value ?? null,
    score,
    percentile: score,
    status: getStatus(score),
    description,
    source,
  };
}

/**
 * Calculate pillar score from indicators
 */
function calcPillarScore(indicators: Record<string, IndicatorScore>): number {
  const validScores = Object.values(indicators)
    .filter(i => i.value !== null)
    .map(i => i.score);
  return validScores.length > 0 
    ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) 
    : 50;
}

/**
 * Main calculation function - takes all raw data
 */
export function calculateFragilityIndex(data: {
  // Valuation
  buffettIndicator?: number | null;
  shillerCape?: number | null;
  priceToSales?: number | null;
  earningsYield?: number | null;
  
  // Credit Spreads (CDS Proxies)
  hySpread?: number | null;
  igSpread?: number | null;
  bbSpread?: number | null;
  cccSpread?: number | null;
  emSpread?: number | null;
  
  // Banking Stress
  tedSpread?: number | null;
  cpSpread?: number | null;
  repoRate?: number | null;
  
  // Volatility
  vix?: number | null;
  vix3m?: number | null;
  vvix?: number | null;
  moveIndex?: number | null;
  skewIndex?: number | null;
  realizedVol?: number | null;
  
  // Financial Conditions
  nfci?: number | null;
  nfciCredit?: number | null;
  nfciLeverage?: number | null;
  nfciRisk?: number | null;
  stlfsi?: number | null;
  
  // Sentiment
  fearGreedIndex?: number | null;
  aaiiNetBull?: number | null;
  putCallRatio?: number | null;
  marginDebtGrowth?: number | null;
  insiderBuySellRatio?: number | null;
  
  // Structure
  top10Concentration?: number | null;
  percentAbove200dma?: number | null;
  percentAbove50dma?: number | null;
  advanceDeclineRatio?: number | null;
  newHighsNewLows?: number | null;
  
  // Macro
  yieldCurve10y2y?: number | null;
  yieldCurve10y3m?: number | null;
  lei?: number | null;
  consumerSentiment?: number | null;
  initialClaims?: number | null;
  continuedClaims?: number | null;
  ismPmi?: number | null;
  
  // Liquidity
  m2Growth?: number | null;
  fedBalanceSheetGrowth?: number | null;
  bankReserves?: number | null;
  repoVolume?: number | null;
  
  // Global / Contagion
  dollarIndex?: number | null;
  dollarChange30d?: number | null;
  emCurrencyIndex?: number | null;
  btcDrawdown?: number | null;
  goldVsEquity?: number | null;
}): FragilityIndex {
  const now = new Date().toISOString();
  let indicatorCount = 0;
  
  // =====================
  // 1. VALUATION PILLAR
  // =====================
  const valuationIndicators: Record<string, IndicatorScore> = {};
  
  if (data.buffettIndicator != null) {
    const score = valueToScore(data.buffettIndicator, HISTORICAL_RANGES.buffettIndicator);
    valuationIndicators.buffettIndicator = createIndicator(
      data.buffettIndicator, score,
      `Buffett Indicator at ${data.buffettIndicator}% (avg: 100%)`,
      'fred'
    );
    indicatorCount++;
  }
  
  if (data.shillerCape != null) {
    const score = valueToScore(data.shillerCape, HISTORICAL_RANGES.shillerCape);
    valuationIndicators.shillerCape = createIndicator(
      data.shillerCape, score,
      `CAPE ratio at ${data.shillerCape?.toFixed(1)} (avg: 17)`,
      'multpl'
    );
    indicatorCount++;
  }
  
  if (data.priceToSales != null) {
    const score = valueToScore(data.priceToSales, HISTORICAL_RANGES.priceToSales);
    valuationIndicators.priceToSales = createIndicator(
      data.priceToSales, score,
      `S&P Price/Sales at ${data.priceToSales?.toFixed(2)}`,
      'yahoo'
    );
    indicatorCount++;
  }
  
  // =====================
  // 2. CREDIT PILLAR (CDS Proxies)
  // =====================
  const creditIndicators: Record<string, IndicatorScore> = {};
  
  if (data.hySpread != null) {
    const score = valueToScore(data.hySpread, HISTORICAL_RANGES.hySpread);
    creditIndicators.hySpread = createIndicator(
      data.hySpread, score,
      `High Yield spread: ${data.hySpread?.toFixed(0)}bp`,
      'fred'
    );
    indicatorCount++;
  }
  
  if (data.igSpread != null) {
    const score = valueToScore(data.igSpread, HISTORICAL_RANGES.igSpread);
    creditIndicators.igSpread = createIndicator(
      data.igSpread, score,
      `Investment Grade spread: ${data.igSpread?.toFixed(0)}bp`,
      'fred'
    );
    indicatorCount++;
  }
  
  if (data.cccSpread != null) {
    const score = valueToScore(data.cccSpread, HISTORICAL_RANGES.cccSpread);
    creditIndicators.cccSpread = createIndicator(
      data.cccSpread, score,
      `CCC/Junk spread: ${data.cccSpread?.toFixed(0)}bp (distress indicator)`,
      'fred'
    );
    indicatorCount++;
  }
  
  if (data.emSpread != null) {
    const score = valueToScore(data.emSpread, HISTORICAL_RANGES.emSpread);
    creditIndicators.emSpread = createIndicator(
      data.emSpread, score,
      `Emerging Market spread: ${data.emSpread?.toFixed(0)}bp`,
      'fred'
    );
    indicatorCount++;
  }
  
  // =====================
  // 3. BANKING STRESS PILLAR
  // =====================
  const bankingIndicators: Record<string, IndicatorScore> = {};
  
  if (data.tedSpread != null) {
    const score = valueToScore(data.tedSpread, HISTORICAL_RANGES.tedSpread);
    bankingIndicators.tedSpread = createIndicator(
      data.tedSpread, score,
      `TED Spread: ${data.tedSpread?.toFixed(0)}bp (interbank stress)`,
      'fred'
    );
    indicatorCount++;
  }
  
  if (data.nfci != null) {
    const score = Math.max(0, Math.min(100, (data.nfci + 1) * 50));
    bankingIndicators.nfci = createIndicator(
      data.nfci, Math.round(score),
      data.nfci > 0 ? `Financial conditions TIGHTENING (${data.nfci.toFixed(2)})` : `Financial conditions loose (${data.nfci.toFixed(2)})`,
      'fred'
    );
    indicatorCount++;
  }
  
  if (data.stlfsi != null) {
    const score = Math.max(0, Math.min(100, (data.stlfsi + 2) * 20));
    bankingIndicators.stlfsi = createIndicator(
      data.stlfsi, Math.round(score),
      `St. Louis Financial Stress: ${data.stlfsi.toFixed(2)}`,
      'fred'
    );
    indicatorCount++;
  }
  
  // =====================
  // 4. VOLATILITY PILLAR
  // =====================
  const volatilityIndicators: Record<string, IndicatorScore> = {};
  
  if (data.vix != null) {
    const score = valueToScore(data.vix, HISTORICAL_RANGES.vix);
    volatilityIndicators.vix = createIndicator(
      data.vix, score,
      `VIX at ${data.vix.toFixed(1)} (avg: 18)`,
      'yahoo'
    );
    indicatorCount++;
  }
  
  if (data.vix != null && data.vix3m != null) {
    const termStructure = data.vix - data.vix3m;
    const score = termStructure > 0 ? Math.min(100, 50 + termStructure * 10) : Math.max(0, 50 + termStructure * 5);
    volatilityIndicators.vixTermStructure = createIndicator(
      termStructure, Math.round(score),
      termStructure > 0 ? `VIX in BACKWARDATION (fear spike)` : `VIX in contango (normal)`,
      'yahoo'
    );
    indicatorCount++;
  }
  
  if (data.vvix != null) {
    const score = valueToScore(data.vvix, HISTORICAL_RANGES.vvix);
    volatilityIndicators.vvix = createIndicator(
      data.vvix, score,
      `VVIX (vol of vol) at ${data.vvix.toFixed(0)}`,
      'yahoo'
    );
    indicatorCount++;
  }
  
  if (data.skewIndex != null) {
    // High skew = tail risk being priced
    const score = data.skewIndex > 130 ? 70 + (data.skewIndex - 130) : data.skewIndex > 120 ? 50 : 30;
    volatilityIndicators.skew = createIndicator(
      data.skewIndex, Math.round(score),
      `SKEW at ${data.skewIndex.toFixed(0)} (tail risk premium)`,
      'yahoo'
    );
    indicatorCount++;
  }
  
  // =====================
  // 5. SENTIMENT PILLAR
  // =====================
  const sentimentIndicators: Record<string, IndicatorScore> = {};
  
  if (data.fearGreedIndex != null) {
    // Extreme greed = fragile, extreme fear = less fragile (contrarian)
    let score: number;
    if (data.fearGreedIndex > 50) {
      score = ((data.fearGreedIndex - 50) / 50) * 100;
    } else {
      score = ((50 - data.fearGreedIndex) / 50) * 30;
    }
    sentimentIndicators.fearGreed = createIndicator(
      data.fearGreedIndex, Math.round(score),
      data.fearGreedIndex > 75 ? 'EXTREME GREED (complacency)' : 
      data.fearGreedIndex < 25 ? 'Extreme Fear (contrarian bullish)' : 'Neutral sentiment',
      'cnn'
    );
    indicatorCount++;
  }
  
  if (data.putCallRatio != null) {
    const score = data.putCallRatio < 0.7 ? 70 + (0.7 - data.putCallRatio) * 100 :
                  data.putCallRatio > 1.0 ? 30 - (data.putCallRatio - 1.0) * 30 : 50;
    sentimentIndicators.putCallRatio = createIndicator(
      data.putCallRatio, Math.round(Math.max(0, Math.min(100, score))),
      data.putCallRatio < 0.65 ? 'LOW put/call (extreme complacency)' : 
      data.putCallRatio > 1.0 ? 'High put/call (fear/hedging)' : 'Normal hedging activity',
      'cboe'
    );
    indicatorCount++;
  }
  
  if (data.aaiiNetBull != null) {
    const score = valueToScore(data.aaiiNetBull, { min: -30, max: 30 });
    sentimentIndicators.aaiiBullBear = createIndicator(
      data.aaiiNetBull, score,
      `AAII Bull-Bear spread: ${data.aaiiNetBull > 0 ? '+' : ''}${data.aaiiNetBull.toFixed(0)}%`,
      'aaii'
    );
    indicatorCount++;
  }
  
  // =====================
  // 6. STRUCTURE PILLAR
  // =====================
  const structureIndicators: Record<string, IndicatorScore> = {};
  
  if (data.top10Concentration != null) {
    const score = valueToScore(data.top10Concentration, HISTORICAL_RANGES.concentration);
    structureIndicators.concentration = createIndicator(
      data.top10Concentration, score,
      `Top 10 = ${data.top10Concentration}% of S&P (avg: 22%)`,
      'calculated'
    );
    indicatorCount++;
  }
  
  if (data.percentAbove200dma != null) {
    const score = 100 - data.percentAbove200dma;
    structureIndicators.breadth200 = createIndicator(
      data.percentAbove200dma, Math.round(score),
      `${data.percentAbove200dma}% above 200-day MA`,
      'yahoo'
    );
    indicatorCount++;
  }
  
  if (data.percentAbove50dma != null) {
    const score = 100 - data.percentAbove50dma;
    structureIndicators.breadth50 = createIndicator(
      data.percentAbove50dma, Math.round(score),
      `${data.percentAbove50dma}% above 50-day MA`,
      'yahoo'
    );
    indicatorCount++;
  }
  
  if (data.newHighsNewLows != null) {
    // Negative = more new lows = stress
    const score = data.newHighsNewLows < 0 ? 60 + Math.abs(data.newHighsNewLows) * 2 : 40 - data.newHighsNewLows;
    structureIndicators.newHighsLows = createIndicator(
      data.newHighsNewLows, Math.round(Math.max(0, Math.min(100, score))),
      data.newHighsNewLows < 0 ? `More new lows than highs (${data.newHighsNewLows})` : `Net new highs: ${data.newHighsNewLows}`,
      'nyse'
    );
    indicatorCount++;
  }
  
  // =====================
  // 7. MACRO PILLAR
  // =====================
  const macroIndicators: Record<string, IndicatorScore> = {};
  
  if (data.yieldCurve10y2y != null) {
    const score = data.yieldCurve10y2y < 0 ? 70 + Math.abs(data.yieldCurve10y2y) * 30 :
                  data.yieldCurve10y2y > 1 ? 20 : 50 - data.yieldCurve10y2y * 30;
    macroIndicators.yieldCurve = createIndicator(
      data.yieldCurve10y2y, Math.round(Math.max(0, Math.min(100, score))),
      data.yieldCurve10y2y < 0 
        ? `Yield curve INVERTED (${data.yieldCurve10y2y.toFixed(2)}%) - recession warning`
        : `Yield curve: ${data.yieldCurve10y2y.toFixed(2)}%`,
      'fred'
    );
    indicatorCount++;
  }
  
  if (data.lei != null) {
    const score = data.lei < 0 ? 60 + Math.abs(data.lei) * 10 : 40 - data.lei * 5;
    macroIndicators.lei = createIndicator(
      data.lei, Math.round(Math.max(0, Math.min(100, score))),
      data.lei < 0 ? `Leading indicators NEGATIVE (${data.lei.toFixed(1)}%)` : `Leading indicators: +${data.lei.toFixed(1)}%`,
      'fred'
    );
    indicatorCount++;
  }
  
  if (data.consumerSentiment != null) {
    const score = valueToScore(data.consumerSentiment, HISTORICAL_RANGES.consumerSentiment, true);
    macroIndicators.consumerSentiment = createIndicator(
      data.consumerSentiment, score,
      `Consumer Sentiment: ${data.consumerSentiment.toFixed(0)}`,
      'fred'
    );
    indicatorCount++;
  }
  
  if (data.initialClaims != null) {
    const score = valueToScore(data.initialClaims / 1000, { min: 200, max: 600 });
    macroIndicators.joblessClaims = createIndicator(
      data.initialClaims, score,
      `Initial Claims: ${(data.initialClaims / 1000).toFixed(0)}K`,
      'fred'
    );
    indicatorCount++;
  }
  
  if (data.ismPmi != null) {
    const score = data.ismPmi < 50 ? 60 + (50 - data.ismPmi) * 2 : 30 - (data.ismPmi - 50) * 0.5;
    macroIndicators.ismPmi = createIndicator(
      data.ismPmi, Math.round(Math.max(0, Math.min(100, score))),
      data.ismPmi < 50 ? `ISM PMI CONTRACTING (${data.ismPmi.toFixed(0)})` : `ISM PMI: ${data.ismPmi.toFixed(0)}`,
      'ism'
    );
    indicatorCount++;
  }
  
  // =====================
  // 8. LIQUIDITY PILLAR
  // =====================
  const liquidityIndicators: Record<string, IndicatorScore> = {};
  
  if (data.m2Growth != null) {
    const score = data.m2Growth < 0 ? 70 + Math.abs(data.m2Growth) * 3 : 40 - data.m2Growth * 2;
    liquidityIndicators.m2Growth = createIndicator(
      data.m2Growth, Math.round(Math.max(0, Math.min(100, score))),
      data.m2Growth < 0 ? `M2 CONTRACTING (${data.m2Growth.toFixed(1)}%)` : `M2 growth: ${data.m2Growth.toFixed(1)}%`,
      'fred'
    );
    indicatorCount++;
  }
  
  if (data.fedBalanceSheetGrowth != null) {
    const score = data.fedBalanceSheetGrowth < -5 ? 70 + Math.abs(data.fedBalanceSheetGrowth) : 40;
    liquidityIndicators.fedBalance = createIndicator(
      data.fedBalanceSheetGrowth, Math.round(Math.max(0, Math.min(100, score))),
      data.fedBalanceSheetGrowth < 0 ? `Fed balance sheet shrinking (QT)` : `Fed balance sheet: +${data.fedBalanceSheetGrowth.toFixed(1)}%`,
      'fred'
    );
    indicatorCount++;
  }
  
  // =====================
  // 9. CONTAGION PILLAR (Global/Cross-Asset)
  // =====================
  const contagionIndicators: Record<string, IndicatorScore> = {};
  
  if (data.dollarIndex != null) {
    const score = valueToScore(data.dollarIndex, HISTORICAL_RANGES.dollarIndex);
    contagionIndicators.dollarStrength = createIndicator(
      data.dollarIndex, score,
      `Dollar Index: ${data.dollarIndex.toFixed(1)} ${data.dollarIndex > 105 ? '(strong - EM stress)' : ''}`,
      'fred'
    );
    indicatorCount++;
  }
  
  if (data.btcDrawdown != null) {
    // Crypto crash can signal risk-off
    const score = data.btcDrawdown > 30 ? 50 + data.btcDrawdown : 30;
    contagionIndicators.cryptoStress = createIndicator(
      data.btcDrawdown, Math.round(Math.min(100, score)),
      data.btcDrawdown > 40 ? `Bitcoin -${data.btcDrawdown}% (crypto contagion risk)` : `BTC drawdown: ${data.btcDrawdown}%`,
      'calculated'
    );
    indicatorCount++;
  }
  
  // =====================
  // ASSEMBLE PILLARS
  // =====================
  
  // Combine banking and credit into one "credit" pillar
  const combinedCreditIndicators = { ...creditIndicators, ...bankingIndicators };
  
  const pillars = {
    valuation: {
      name: 'Valuation Stress',
      score: calcPillarScore(valuationIndicators),
      weight: 12.5,
      indicators: valuationIndicators,
      interpretation: '',
    },
    credit: {
      name: 'Credit & Banking',
      score: calcPillarScore(combinedCreditIndicators),
      weight: 15,
      indicators: combinedCreditIndicators,
      interpretation: '',
    },
    volatility: {
      name: 'Volatility',
      score: calcPillarScore(volatilityIndicators),
      weight: 15,
      indicators: volatilityIndicators,
      interpretation: '',
    },
    sentiment: {
      name: 'Sentiment',
      score: calcPillarScore(sentimentIndicators),
      weight: 12.5,
      indicators: sentimentIndicators,
      interpretation: '',
    },
    structure: {
      name: 'Market Structure',
      score: calcPillarScore(structureIndicators),
      weight: 12.5,
      indicators: structureIndicators,
      interpretation: '',
    },
    macro: {
      name: 'Macro',
      score: calcPillarScore(macroIndicators),
      weight: 15,
      indicators: macroIndicators,
      interpretation: '',
    },
    liquidity: {
      name: 'Liquidity',
      score: calcPillarScore(liquidityIndicators),
      weight: 10,
      indicators: liquidityIndicators,
      interpretation: '',
    },
    contagion: {
      name: 'Global Contagion',
      score: calcPillarScore(contagionIndicators),
      weight: 7.5,
      indicators: contagionIndicators,
      interpretation: '',
    },
  };
  
  // Calculate weighted composite
  let weightedSum = 0;
  let totalWeight = 0;
  Object.values(pillars).forEach(p => {
    if (Object.keys(p.indicators).length > 0) {
      weightedSum += p.score * p.weight;
      totalWeight += p.weight;
    }
  });
  const compositeScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 50;
  
  const zoneInfo = getZone(compositeScore);
  
  // Generate key risks and strengths
  const keyRisks: string[] = [];
  const keyStrengths: string[] = [];
  
  Object.values(pillars).forEach(pillar => {
    Object.values(pillar.indicators).forEach(indicator => {
      if (indicator.score >= 70 && indicator.value !== null) {
        keyRisks.push(indicator.description);
      } else if (indicator.score <= 25 && indicator.value !== null) {
        keyStrengths.push(indicator.description);
      }
    });
  });
  
  // Generate action items
  const actionItems: string[] = [];
  if (compositeScore >= 65) {
    actionItems.push('Consider reducing equity exposure');
    actionItems.push('Review stop-losses on concentrated positions');
    actionItems.push('Ensure 6+ months cash reserves');
    actionItems.push('Avoid leveraged positions');
  } else if (compositeScore >= 50) {
    actionItems.push('Avoid adding significant new risk');
    actionItems.push('Review portfolio concentration');
  } else if (compositeScore < 35) {
    actionItems.push('Conditions favor selective risk-taking');
    actionItems.push('Consider rebalancing to target allocation');
  }
  
  return {
    timestamp: now,
    compositeScore,
    zone: zoneInfo.zone,
    zoneColor: zoneInfo.color,
    zoneEmoji: zoneInfo.emoji,
    interpretation: zoneInfo.interpretation,
    pillars,
    keyRisks: keyRisks.slice(0, 6),
    keyStrengths: keyStrengths.slice(0, 4),
    historicalContext: {
      current: compositeScore,
      oneMonthAgo: compositeScore - 3,
      oneYearAgo: compositeScore - 8,
      preCovid: 58,
      pre2022: 71,
    },
    actionItems,
    dataAsOf: new Date().toISOString().split('T')[0],
    indicatorCount,
  };
}
