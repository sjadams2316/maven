#!/usr/bin/env node
// Test multi-asset analysis and decision making

// Inline the asset analyzer logic for testing
const ASSET_CHARACTERISTICS = {
  crypto: {
    volatility: 'very_high',
    avgDailyMove: 5.0,
    stopLossDefault: 0.08,
    takeProfitDefault: 0.20,
    positionSizeMultiplier: 0.5,
    signalSources: ['vanta', 'on-chain', 'funding', 'sentiment']
  },
  etf: {
    volatility: 'low_to_medium',
    avgDailyMove: 1.0,
    stopLossDefault: 0.03,
    takeProfitDefault: 0.08,
    positionSizeMultiplier: 1.5,
    signalSources: ['trend', 'momentum', 'macro']
  },
  stock: {
    volatility: 'medium_to_high',
    avgDailyMove: 2.0,
    stopLossDefault: 0.05,
    takeProfitDefault: 0.12,
    positionSizeMultiplier: 1.0,
    signalSources: ['trend', 'momentum', 'earnings', 'sector']
  }
};

function getAssetType(symbol) {
  const cryptoSymbols = ['BTC', 'ETH', 'SOL', 'DOGE', 'AVAX', 'LINK'];
  const upperSymbol = symbol.toUpperCase().replace('/USD', '');
  
  if (cryptoSymbols.includes(upperSymbol)) return 'crypto';
  
  const etfSymbols = ['SPY', 'QQQ', 'IWM', 'DIA', 'VTI', 'VOO', 'AGG', 'GLD', 'TLT'];
  if (etfSymbols.includes(upperSymbol)) return 'etf';
  
  return 'stock';
}

function analyzeAsset(symbol) {
  const assetType = getAssetType(symbol);
  const characteristics = ASSET_CHARACTERISTICS[assetType];
  
  return {
    symbol,
    assetType,
    characteristics,
    riskParameters: {
      stopLoss: characteristics.stopLossDefault,
      takeProfit: characteristics.takeProfitDefault,
      positionMultiplier: characteristics.positionSizeMultiplier
    }
  };
}

function calculatePositionSize(baseSize, assetType, confidence) {
  const char = ASSET_CHARACTERISTICS[assetType];
  let size = baseSize * char.positionSizeMultiplier;
  size *= (0.5 + confidence * 0.5); // Confidence adjustment
  return Math.round(size * 100) / 100;
}

// Test portfolio
const mockPortfolio = {
  totalValue: 25000,
  cash: 15000,
  positions: {
    'BTC': { costBasis: 3000 },
    'SPY': { costBasis: 5000 },
    'NVDA': { costBasis: 2000 }
  }
};

const basePositionSize = 2500; // $2500 base

// Signals to test
const testSignals = [
  { symbol: 'ETH', direction: 'LONG', confidence: 0.85, source: 'vanta' },
  { symbol: 'QQQ', direction: 'LONG', confidence: 0.75, source: 'trend' },
  { symbol: 'AAPL', direction: 'LONG', confidence: 0.70, source: 'momentum' },
  { symbol: 'SOL', direction: 'LONG', confidence: 0.60, source: 'vanta' },
  { symbol: 'GLD', direction: 'LONG', confidence: 0.65, source: 'macro' },
  { symbol: 'BTC', direction: 'SHORT', confidence: 0.55, source: 'funding' }
];

console.log('\n🔬 MULTI-ASSET DECISION ENGINE TEST');
console.log('═'.repeat(60));
console.log(`\n📊 Portfolio: $${mockPortfolio.totalValue.toLocaleString()}`);
console.log(`   Cash: $${mockPortfolio.cash.toLocaleString()}`);
console.log(`   Positions: ${Object.keys(mockPortfolio.positions).join(', ')}`);

console.log('\n\n📋 ANALYZING SIGNALS ACROSS ASSET CLASSES');
console.log('─'.repeat(60));

for (const signal of testSignals) {
  const analysis = analyzeAsset(signal.symbol);
  const positionSize = calculatePositionSize(basePositionSize, analysis.assetType, signal.confidence);
  
  const stopLossPct = (analysis.riskParameters.stopLoss * 100).toFixed(0);
  const takeProfitPct = (analysis.riskParameters.takeProfit * 100).toFixed(0);
  
  const emoji = signal.direction === 'LONG' ? '🟢' : '🔴';
  const typeEmoji = analysis.assetType === 'crypto' ? '₿' : analysis.assetType === 'etf' ? '📊' : '📈';
  
  console.log(`\n${emoji} ${signal.symbol} (${analysis.assetType.toUpperCase()}) ${typeEmoji}`);
  console.log(`   Signal: ${signal.direction} @ ${(signal.confidence * 100).toFixed(0)}% confidence`);
  console.log(`   Source: ${signal.source}`);
  console.log(`   Volatility: ${analysis.characteristics.volatility}`);
  console.log(`   Position Size: $${positionSize.toFixed(2)} (${analysis.riskParameters.positionMultiplier}x multiplier)`);
  console.log(`   Stop Loss: ${stopLossPct}% | Take Profit: ${takeProfitPct}%`);
  
  // Skip low confidence
  if (signal.confidence < 0.6) {
    console.log(`   ⚠️  SKIP: Below 60% confidence threshold`);
  }
}

console.log('\n\n📈 RETURN EXPECTATIONS BY ASSET CLASS');
console.log('─'.repeat(60));

const returnExpectations = {
  crypto: {
    avgReturn: '20-40%',
    maxDrawdown: '40-60%',
    sharpe: '0.5-1.0',
    note: 'Higher returns but extreme volatility'
  },
  etf: {
    avgReturn: '8-15%',
    maxDrawdown: '15-25%',
    sharpe: '0.8-1.2',
    note: 'Diversified, lower vol, steadier returns'
  },
  stock: {
    avgReturn: '12-25%',
    maxDrawdown: '25-40%',
    sharpe: '0.6-1.0',
    note: 'Stock-picking alpha potential'
  },
  combined: {
    avgReturn: '15-25%',
    maxDrawdown: '20-35%',
    sharpe: '1.0-1.5',
    note: 'BETTER RISK-ADJUSTED RETURNS through diversification'
  }
};

for (const [type, expectations] of Object.entries(returnExpectations)) {
  const emoji = type === 'combined' ? '⭐' : type === 'crypto' ? '₿' : '📊';
  console.log(`\n${emoji} ${type.toUpperCase()}`);
  console.log(`   Expected Return: ${expectations.avgReturn} annually`);
  console.log(`   Max Drawdown: ${expectations.maxDrawdown}`);
  console.log(`   Sharpe Ratio: ${expectations.sharpe}`);
  console.log(`   Note: ${expectations.note}`);
}

console.log('\n\n💡 KEY INSIGHT');
console.log('═'.repeat(60));
console.log(`
Multi-asset trading improves RISK-ADJUSTED returns more than absolute returns.

Why?
• When crypto crashes (like today: -12%), stocks may be flat or up
• When stocks crash, crypto sometimes decouples
• Gold/bonds often inverse to risk assets
• More opportunities = more chances to deploy edge

The math:
• Crypto-only: 30% return, 50% drawdown, 0.6 Sharpe
• Multi-asset:  20% return, 25% drawdown, 1.2 Sharpe

Same capital efficiency, HALF the pain.

This is why I can trade 24/7:
• Crypto: Always on
• Stocks: Market hours + extended (4 AM - 8 PM ET)
• Regime shifts: Rotate between asset classes
`);

console.log('═'.repeat(60) + '\n');
