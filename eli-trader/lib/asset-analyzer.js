// Asset-Specific Analysis
// Different assets require different analysis approaches

import { getAssetType, getTradingHours } from './alpaca.js';

/**
 * Asset class characteristics
 */
const ASSET_CHARACTERISTICS = {
  crypto: {
    volatility: 'very_high',
    avgDailyMove: 5.0, // 5% typical daily range
    tradingHours: '24/7',
    correlatedWith: ['BTC'], // Most crypto correlates with BTC
    liquidityHours: 'all',
    stopLossDefault: 0.08, // 8% - wider due to volatility
    takeProfitDefault: 0.20, // 20%
    positionSizeMultiplier: 0.5, // Smaller positions due to volatility
    signalSources: ['vanta', 'on-chain', 'funding', 'sentiment']
  },
  etf: {
    volatility: 'low_to_medium',
    avgDailyMove: 1.0, // 1% typical
    tradingHours: 'market',
    correlatedWith: ['SPY'],
    liquidityHours: 'market',
    stopLossDefault: 0.03, // 3%
    takeProfitDefault: 0.08, // 8%
    positionSizeMultiplier: 1.5, // Larger positions due to lower volatility
    signalSources: ['trend', 'momentum', 'macro']
  },
  stock: {
    volatility: 'medium_to_high',
    avgDailyMove: 2.0, // 2% typical, varies by stock
    tradingHours: 'market',
    correlatedWith: ['SPY', 'sector'],
    liquidityHours: 'market',
    stopLossDefault: 0.05, // 5%
    takeProfitDefault: 0.12, // 12%
    positionSizeMultiplier: 1.0,
    signalSources: ['trend', 'momentum', 'earnings', 'sector']
  }
};

/**
 * Market regime indicators by asset class
 */
const REGIME_INDICATORS = {
  // For stocks/ETFs
  equities: {
    vix_high: 30, // VIX above 30 = high fear
    vix_low: 15,  // VIX below 15 = complacency
    spy_trend_days: 20, // 20-day trend
  },
  // For crypto
  crypto: {
    fear_greed_extreme_fear: 20,
    fear_greed_extreme_greed: 80,
    btc_dominance_high: 55, // Money to safety
    btc_dominance_low: 40,  // Alt season
  }
};

/**
 * Analyze asset and return trading parameters
 */
export function analyzeAsset(symbol) {
  const assetType = getAssetType(symbol);
  const characteristics = ASSET_CHARACTERISTICS[assetType];
  const tradingHours = getTradingHours(assetType);

  return {
    symbol,
    assetType,
    characteristics,
    tradingHours,
    canTradeNow: assetType === 'crypto' || tradingHours.isOpen || tradingHours.isExtendedHours,
    riskParameters: {
      stopLoss: characteristics.stopLossDefault,
      takeProfit: characteristics.takeProfitDefault,
      positionMultiplier: characteristics.positionSizeMultiplier
    }
  };
}

/**
 * Get correlation adjustment
 * If we already have correlated positions, reduce new position size
 */
export function getCorrelationAdjustment(symbol, existingPositions) {
  const assetType = getAssetType(symbol);
  const characteristics = ASSET_CHARACTERISTICS[assetType];
  
  let correlatedExposure = 0;
  
  for (const [posSymbol, position] of Object.entries(existingPositions)) {
    const posType = getAssetType(posSymbol);
    
    // Same asset class = correlated
    if (posType === assetType) {
      correlatedExposure += position.costBasis;
    }
    
    // Check specific correlations
    if (characteristics.correlatedWith.includes(posSymbol)) {
      correlatedExposure += position.costBasis;
    }
  }
  
  // Reduce size if heavily correlated
  if (correlatedExposure > 3000) {
    return 0.5; // 50% of normal size
  } else if (correlatedExposure > 1500) {
    return 0.75; // 75% of normal size
  }
  
  return 1.0; // Full size
}

/**
 * Get asset-specific signal sources to consider
 */
export function getSignalSources(symbol) {
  const assetType = getAssetType(symbol);
  const characteristics = ASSET_CHARACTERISTICS[assetType];
  
  return {
    assetType,
    sources: characteristics.signalSources,
    primary: characteristics.signalSources[0],
    description: getSignalSourceDescriptions(assetType)
  };
}

function getSignalSourceDescriptions(assetType) {
  const descriptions = {
    crypto: {
      vanta: 'Decentralized AI trading signals from Bittensor Subnet 8',
      'on-chain': 'Whale movements, exchange flows, miner behavior',
      funding: 'Perpetual futures funding rates (positioning)',
      sentiment: 'Fear & Greed Index, social sentiment'
    },
    etf: {
      trend: 'Price trend (above/below moving averages)',
      momentum: 'Rate of change, relative strength',
      macro: 'Economic indicators, Fed policy, yields'
    },
    stock: {
      trend: 'Price trend and breakouts',
      momentum: 'Relative strength vs sector and market',
      earnings: 'Earnings surprises, guidance',
      sector: 'Sector rotation and relative performance'
    }
  };
  
  return descriptions[assetType] || {};
}

/**
 * Calculate volatility-adjusted position size
 */
export function getVolatilityAdjustedSize(baseSize, symbol, recentVolatility = null) {
  const analysis = analyzeAsset(symbol);
  
  // Apply asset-type multiplier
  let adjustedSize = baseSize * analysis.riskParameters.positionMultiplier;
  
  // If we have recent volatility data, adjust further
  if (recentVolatility) {
    const avgDailyMove = analysis.characteristics.avgDailyMove;
    const volatilityRatio = avgDailyMove / recentVolatility;
    
    // If current vol is higher than average, reduce size
    // If current vol is lower than average, can increase size (capped)
    const volAdjustment = Math.min(Math.max(volatilityRatio, 0.5), 1.5);
    adjustedSize *= volAdjustment;
  }
  
  return Math.round(adjustedSize * 100) / 100;
}

/**
 * Get diversification score
 * Higher score = better diversified
 */
export function getDiversificationScore(positions) {
  if (Object.keys(positions).length === 0) return 1.0;
  
  const typeCount = { crypto: 0, etf: 0, stock: 0 };
  const totalValue = Object.values(positions).reduce((sum, p) => sum + p.costBasis, 0);
  
  for (const [symbol, position] of Object.entries(positions)) {
    const type = getAssetType(symbol);
    typeCount[type] += position.costBasis;
  }
  
  // Calculate concentration (Herfindahl-like)
  let concentration = 0;
  for (const value of Object.values(typeCount)) {
    const share = value / totalValue;
    concentration += share * share;
  }
  
  // Score: 1.0 = perfectly diversified, 0.0 = all in one asset class
  const diversificationScore = 1 - concentration;
  
  return {
    score: Math.round(diversificationScore * 100) / 100,
    breakdown: {
      crypto: typeCount.crypto / totalValue,
      etf: typeCount.etf / totalValue,
      stock: typeCount.stock / totalValue
    },
    recommendation: getDiversificationRecommendation(typeCount, totalValue)
  };
}

function getDiversificationRecommendation(typeCount, totalValue) {
  const cryptoPct = typeCount.crypto / totalValue;
  const etfPct = typeCount.etf / totalValue;
  const stockPct = typeCount.stock / totalValue;
  
  if (cryptoPct > 0.6) {
    return 'Consider adding stocks/ETFs to reduce crypto concentration';
  }
  if (cryptoPct === 0 && totalValue > 5000) {
    return 'Consider small crypto allocation for diversification';
  }
  if (etfPct > 0.8) {
    return 'Well diversified via ETFs, could add individual positions for alpha';
  }
  
  return 'Portfolio reasonably diversified';
}

/**
 * Get universe of tradable symbols by asset class
 */
export function getTradableUniverse() {
  return {
    crypto: [
      { symbol: 'BTC/USD', name: 'Bitcoin' },
      { symbol: 'ETH/USD', name: 'Ethereum' },
      { symbol: 'SOL/USD', name: 'Solana' },
      { symbol: 'DOGE/USD', name: 'Dogecoin' },
      { symbol: 'AVAX/USD', name: 'Avalanche' },
      { symbol: 'LINK/USD', name: 'Chainlink' }
    ],
    etf: [
      { symbol: 'SPY', name: 'S&P 500 ETF' },
      { symbol: 'QQQ', name: 'Nasdaq 100 ETF' },
      { symbol: 'IWM', name: 'Russell 2000 ETF' },
      { symbol: 'DIA', name: 'Dow Jones ETF' },
      { symbol: 'VTI', name: 'Total US Market' },
      { symbol: 'AGG', name: 'US Aggregate Bond' },
      { symbol: 'GLD', name: 'Gold ETF' },
      { symbol: 'TLT', name: 'Long-Term Treasury' },
      { symbol: 'XLF', name: 'Financials Sector' },
      { symbol: 'XLK', name: 'Technology Sector' },
      { symbol: 'XLE', name: 'Energy Sector' }
    ],
    stock: [
      { symbol: 'AAPL', name: 'Apple' },
      { symbol: 'MSFT', name: 'Microsoft' },
      { symbol: 'GOOGL', name: 'Alphabet' },
      { symbol: 'AMZN', name: 'Amazon' },
      { symbol: 'NVDA', name: 'Nvidia' },
      { symbol: 'META', name: 'Meta' },
      { symbol: 'TSLA', name: 'Tesla' }
    ]
  };
}

export default {
  analyzeAsset,
  getCorrelationAdjustment,
  getSignalSources,
  getVolatilityAdjustedSize,
  getDiversificationScore,
  getTradableUniverse,
  ASSET_CHARACTERISTICS
};
