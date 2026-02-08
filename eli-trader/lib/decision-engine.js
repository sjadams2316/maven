// Decision Engine
// Combines market context, signals, and rules to make trading decisions

import { getMarketContext } from './market-context.js';

/**
 * Risk levels that affect position sizing
 */
const RISK_LEVELS = {
  AGGRESSIVE: { positionMultiplier: 1.5, maxPositionPct: 0.20 },
  NORMAL: { positionMultiplier: 1.0, maxPositionPct: 0.15 },
  CONSERVATIVE: { positionMultiplier: 0.5, maxPositionPct: 0.10 },
  DEFENSIVE: { positionMultiplier: 0.25, maxPositionPct: 0.05 },
  OFF: { positionMultiplier: 0, maxPositionPct: 0 }
};

/**
 * Configuration
 */
const CONFIG = {
  // Base position size as percentage of portfolio
  basePositionPct: 0.10,
  
  // Maximum portfolio exposure (sum of all positions)
  maxExposurePct: 0.50,
  
  // Stop loss percentage
  defaultStopLossPct: 0.05,
  
  // Take profit percentage
  defaultTakeProfitPct: 0.15,
  
  // Minimum confidence to take a trade
  minConfidence: 0.6,
  
  // Cool-down after a loss (minutes)
  lossCooldownMinutes: 60
};

/**
 * Analyze a potential trade and decide whether to take it
 */
export async function analyzeTradeSignal(signal, portfolio, options = {}) {
  const {
    symbol,
    direction, // 'LONG', 'SHORT', 'FLAT'
    confidence = 0.5,
    source = 'manual'
  } = signal;

  // Get current market context
  const context = await getMarketContext();
  
  // Decision object we'll build up
  const decision = {
    timestamp: new Date().toISOString(),
    symbol,
    signalDirection: direction,
    signalConfidence: confidence,
    signalSource: source,
    marketContext: {
      regime: context?.regime,
      fearGreed: context?.components?.fearGreed?.value,
      btcChange24h: context?.components?.prices?.btc?.change24h
    },
    analysis: {},
    recommendation: null,
    positionSize: 0,
    stopLoss: null,
    takeProfit: null,
    reasons: []
  };

  // Rule 1: Check minimum confidence
  if (confidence < CONFIG.minConfidence) {
    decision.recommendation = 'SKIP';
    decision.reasons.push(`Confidence ${(confidence * 100).toFixed(0)}% below minimum ${(CONFIG.minConfidence * 100).toFixed(0)}%`);
    return decision;
  }

  // Rule 2: Check market regime alignment
  const regimeAnalysis = analyzeRegimeAlignment(direction, context?.regime);
  decision.analysis.regime = regimeAnalysis;
  
  if (regimeAnalysis.alignment === 'OPPOSING') {
    decision.recommendation = 'SKIP';
    decision.reasons.push(`Signal direction ${direction} opposes market regime ${context?.regime}`);
    return decision;
  }

  // Rule 3: Check extreme fear/greed
  const sentimentAnalysis = analyzeSentiment(direction, context?.components?.fearGreed?.value);
  decision.analysis.sentiment = sentimentAnalysis;

  // Rule 4: Check existing exposure
  const exposureAnalysis = analyzeExposure(symbol, portfolio);
  decision.analysis.exposure = exposureAnalysis;
  
  if (exposureAnalysis.atMaxExposure) {
    decision.recommendation = 'SKIP';
    decision.reasons.push(`Already at max exposure (${(exposureAnalysis.currentExposure * 100).toFixed(0)}%)`);
    return decision;
  }

  // Rule 5: Calculate position size
  const positionSize = calculatePositionSize({
    portfolio,
    confidence,
    regimeAnalysis,
    sentimentAnalysis,
    exposureAnalysis
  });
  
  decision.positionSize = positionSize;

  // Rule 6: Set stop loss and take profit
  decision.stopLoss = calculateStopLoss(direction, positionSize);
  decision.takeProfit = calculateTakeProfit(direction, positionSize);

  // Final recommendation
  if (positionSize > 0) {
    decision.recommendation = direction;
    decision.reasons.push(`Confidence: ${(confidence * 100).toFixed(0)}%`);
    decision.reasons.push(`Regime alignment: ${regimeAnalysis.alignment}`);
    decision.reasons.push(`Sentiment: ${sentimentAnalysis.signal}`);
    decision.reasons.push(`Position size: $${positionSize.toFixed(2)}`);
  } else {
    decision.recommendation = 'SKIP';
    decision.reasons.push('Position size calculated to zero');
  }

  return decision;
}

/**
 * Analyze how signal aligns with market regime
 */
function analyzeRegimeAlignment(direction, regime) {
  const alignments = {
    'risk_on': { LONG: 'ALIGNED', SHORT: 'OPPOSING', FLAT: 'NEUTRAL' },
    'slight_risk_on': { LONG: 'ALIGNED', SHORT: 'NEUTRAL', FLAT: 'NEUTRAL' },
    'neutral': { LONG: 'NEUTRAL', SHORT: 'NEUTRAL', FLAT: 'ALIGNED' },
    'slight_risk_off': { LONG: 'NEUTRAL', SHORT: 'ALIGNED', FLAT: 'NEUTRAL' },
    'risk_off': { LONG: 'OPPOSING', SHORT: 'ALIGNED', FLAT: 'ALIGNED' }
  };

  const alignment = alignments[regime]?.[direction] || 'NEUTRAL';
  
  const multipliers = {
    'ALIGNED': 1.25,
    'NEUTRAL': 1.0,
    'OPPOSING': 0.5
  };

  return {
    regime,
    direction,
    alignment,
    sizeMultiplier: multipliers[alignment]
  };
}

/**
 * Analyze sentiment impact
 */
function analyzeSentiment(direction, fearGreedValue) {
  if (!fearGreedValue) {
    return { signal: 'unknown', multiplier: 1.0 };
  }

  // Contrarian approach
  if (fearGreedValue <= 20) {
    // Extreme fear - bullish signal
    return {
      value: fearGreedValue,
      classification: 'extreme_fear',
      signal: direction === 'LONG' ? 'supportive' : 'opposing',
      multiplier: direction === 'LONG' ? 1.25 : 0.75,
      note: 'Extreme fear often marks bottoms'
    };
  } else if (fearGreedValue >= 80) {
    // Extreme greed - bearish signal
    return {
      value: fearGreedValue,
      classification: 'extreme_greed',
      signal: direction === 'SHORT' ? 'supportive' : 'opposing',
      multiplier: direction === 'SHORT' ? 1.25 : 0.75,
      note: 'Extreme greed often marks tops'
    };
  } else {
    return {
      value: fearGreedValue,
      classification: 'neutral',
      signal: 'neutral',
      multiplier: 1.0,
      note: 'Sentiment not extreme'
    };
  }
}

/**
 * Analyze current exposure
 */
function analyzeExposure(symbol, portfolio) {
  const totalValue = portfolio.totalValue || portfolio.startingCapital;
  const cash = portfolio.cash;
  const positions = portfolio.positions || {};
  
  // Calculate current exposure
  let totalExposure = 0;
  for (const pos of Object.values(positions)) {
    totalExposure += pos.costBasis;
  }
  
  const exposurePct = totalExposure / totalValue;
  const hasExistingPosition = !!positions[symbol];
  const existingSize = positions[symbol]?.costBasis || 0;

  return {
    totalValue,
    cash,
    totalExposure,
    currentExposure: exposurePct,
    maxExposure: CONFIG.maxExposurePct,
    atMaxExposure: exposurePct >= CONFIG.maxExposurePct,
    hasExistingPosition,
    existingSize,
    availableForNew: Math.max(0, (CONFIG.maxExposurePct * totalValue) - totalExposure)
  };
}

/**
 * Calculate position size based on all factors
 */
function calculatePositionSize({ portfolio, confidence, regimeAnalysis, sentimentAnalysis, exposureAnalysis }) {
  const totalValue = portfolio.totalValue || portfolio.startingCapital;
  
  // Start with base position size
  let size = totalValue * CONFIG.basePositionPct;
  
  // Adjust for confidence (higher confidence = larger size)
  const confidenceMultiplier = 0.5 + (confidence * 0.5); // 0.5x at 0% confidence, 1.0x at 100%
  size *= confidenceMultiplier;
  
  // Adjust for regime alignment
  size *= regimeAnalysis.sizeMultiplier;
  
  // Adjust for sentiment
  size *= sentimentAnalysis.multiplier;
  
  // Cap at max position size
  const maxSize = totalValue * RISK_LEVELS.NORMAL.maxPositionPct;
  size = Math.min(size, maxSize);
  
  // Cap at available cash
  size = Math.min(size, portfolio.cash);
  
  // Cap at available exposure room
  size = Math.min(size, exposureAnalysis.availableForNew);
  
  // Round to 2 decimal places
  return Math.round(size * 100) / 100;
}

/**
 * Calculate stop loss level
 */
function calculateStopLoss(direction, entryPrice) {
  if (direction === 'LONG') {
    return entryPrice * (1 - CONFIG.defaultStopLossPct);
  } else if (direction === 'SHORT') {
    return entryPrice * (1 + CONFIG.defaultStopLossPct);
  }
  return null;
}

/**
 * Calculate take profit level
 */
function calculateTakeProfit(direction, entryPrice) {
  if (direction === 'LONG') {
    return entryPrice * (1 + CONFIG.defaultTakeProfitPct);
  } else if (direction === 'SHORT') {
    return entryPrice * (1 - CONFIG.defaultTakeProfitPct);
  }
  return null;
}

/**
 * Simple logging for decisions
 */
export function logDecision(decision) {
  console.log('\n📋 TRADE DECISION');
  console.log('─'.repeat(40));
  console.log(`Symbol: ${decision.symbol}`);
  console.log(`Signal: ${decision.signalDirection} (${(decision.signalConfidence * 100).toFixed(0)}% confidence)`);
  console.log(`Source: ${decision.signalSource}`);
  console.log(`Regime: ${decision.marketContext.regime}`);
  console.log(`Fear/Greed: ${decision.marketContext.fearGreed}`);
  console.log(`\nRecommendation: ${decision.recommendation}`);
  if (decision.positionSize > 0) {
    console.log(`Position Size: $${decision.positionSize.toFixed(2)}`);
  }
  console.log(`\nReasons:`);
  decision.reasons.forEach(r => console.log(`  • ${r}`));
  console.log('─'.repeat(40));
}

export default {
  analyzeTradeSignal,
  logDecision,
  CONFIG,
  RISK_LEVELS
};
