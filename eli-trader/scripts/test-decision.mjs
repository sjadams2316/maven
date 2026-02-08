#!/usr/bin/env node
// Test the decision engine with simulated signals

import fs from 'fs/promises';

// Simulated portfolio
const mockPortfolio = {
  startingCapital: 10000,
  totalValue: 10000,
  cash: 6500,
  positions: {
    'BTC': { symbol: 'BTC', costBasis: 2000, quantity: 0.031 },
    'ETH': { symbol: 'ETH', costBasis: 1500, quantity: 0.8 }
  }
};

// Import decision engine functions inline since we can't easily import .js modules
const CONFIG = {
  basePositionPct: 0.10,
  maxExposurePct: 0.50,
  defaultStopLossPct: 0.05,
  defaultTakeProfitPct: 0.15,
  minConfidence: 0.6
};

async function getMarketContext() {
  try {
    const fgRes = await fetch('https://api.alternative.me/fng/?limit=1');
    const fgData = await fgRes.json();
    const fg = fgData.data?.[0];
    
    const fearGreedValue = parseInt(fg?.value || 50);
    let regime = 'neutral';
    if (fearGreedValue < 30) regime = 'risk_on'; // Contrarian
    else if (fearGreedValue > 70) regime = 'risk_off'; // Contrarian
    
    return {
      regime,
      components: {
        fearGreed: { value: fearGreedValue, classification: fg?.value_classification }
      }
    };
  } catch {
    return { regime: 'neutral', components: { fearGreed: { value: 50 } } };
  }
}

function analyzeRegimeAlignment(direction, regime) {
  const alignments = {
    'risk_on': { LONG: 'ALIGNED', SHORT: 'OPPOSING', FLAT: 'NEUTRAL' },
    'neutral': { LONG: 'NEUTRAL', SHORT: 'NEUTRAL', FLAT: 'ALIGNED' },
    'risk_off': { LONG: 'OPPOSING', SHORT: 'ALIGNED', FLAT: 'ALIGNED' }
  };
  const alignment = alignments[regime]?.[direction] || 'NEUTRAL';
  const multipliers = { 'ALIGNED': 1.25, 'NEUTRAL': 1.0, 'OPPOSING': 0.5 };
  return { regime, direction, alignment, sizeMultiplier: multipliers[alignment] };
}

function analyzeSentiment(direction, fearGreedValue) {
  if (fearGreedValue <= 20) {
    return {
      value: fearGreedValue,
      signal: direction === 'LONG' ? 'supportive' : 'opposing',
      multiplier: direction === 'LONG' ? 1.25 : 0.75,
      note: 'Extreme fear - contrarian bullish'
    };
  } else if (fearGreedValue >= 80) {
    return {
      value: fearGreedValue,
      signal: direction === 'SHORT' ? 'supportive' : 'opposing',
      multiplier: direction === 'SHORT' ? 1.25 : 0.75,
      note: 'Extreme greed - contrarian bearish'
    };
  }
  return { value: fearGreedValue, signal: 'neutral', multiplier: 1.0, note: 'Neutral sentiment' };
}

async function analyzeSignal(signal) {
  const context = await getMarketContext();
  const { symbol, direction, confidence = 0.7, source = 'test' } = signal;
  
  console.log('\n' + '═'.repeat(50));
  console.log(`📊 ANALYZING SIGNAL: ${direction} ${symbol}`);
  console.log('═'.repeat(50));
  
  console.log(`\n📍 Signal Details:`);
  console.log(`   Direction: ${direction}`);
  console.log(`   Confidence: ${(confidence * 100).toFixed(0)}%`);
  console.log(`   Source: ${source}`);
  
  console.log(`\n🌍 Market Context:`);
  console.log(`   Regime: ${context.regime}`);
  console.log(`   Fear & Greed: ${context.components.fearGreed.value} (${context.components.fearGreed.classification})`);
  
  // Check confidence threshold
  if (confidence < CONFIG.minConfidence) {
    console.log(`\n❌ SKIP: Confidence ${(confidence * 100).toFixed(0)}% below minimum ${(CONFIG.minConfidence * 100).toFixed(0)}%`);
    return;
  }
  
  // Analyze regime alignment
  const regimeAnalysis = analyzeRegimeAlignment(direction, context.regime);
  console.log(`\n📈 Regime Analysis:`);
  console.log(`   Alignment: ${regimeAnalysis.alignment}`);
  console.log(`   Size Multiplier: ${regimeAnalysis.sizeMultiplier}x`);
  
  if (regimeAnalysis.alignment === 'OPPOSING') {
    console.log(`\n⚠️  CAUTION: Signal opposes market regime`);
  }
  
  // Analyze sentiment
  const sentimentAnalysis = analyzeSentiment(direction, context.components.fearGreed.value);
  console.log(`\n💭 Sentiment Analysis:`);
  console.log(`   Signal: ${sentimentAnalysis.signal}`);
  console.log(`   Multiplier: ${sentimentAnalysis.multiplier}x`);
  console.log(`   Note: ${sentimentAnalysis.note}`);
  
  // Calculate position size
  let size = mockPortfolio.totalValue * CONFIG.basePositionPct;
  const confidenceMultiplier = 0.5 + (confidence * 0.5);
  size *= confidenceMultiplier;
  size *= regimeAnalysis.sizeMultiplier;
  size *= sentimentAnalysis.multiplier;
  size = Math.min(size, mockPortfolio.cash);
  size = Math.round(size * 100) / 100;
  
  console.log(`\n💰 Position Sizing:`);
  console.log(`   Base: $${(mockPortfolio.totalValue * CONFIG.basePositionPct).toFixed(2)}`);
  console.log(`   × Confidence (${(confidenceMultiplier).toFixed(2)}): $${(mockPortfolio.totalValue * CONFIG.basePositionPct * confidenceMultiplier).toFixed(2)}`);
  console.log(`   × Regime (${regimeAnalysis.sizeMultiplier}): $${(mockPortfolio.totalValue * CONFIG.basePositionPct * confidenceMultiplier * regimeAnalysis.sizeMultiplier).toFixed(2)}`);
  console.log(`   × Sentiment (${sentimentAnalysis.multiplier}): $${size.toFixed(2)}`);
  
  // Final recommendation
  const emoji = direction === 'LONG' ? '🟢' : direction === 'SHORT' ? '🔴' : '⚪';
  console.log(`\n${emoji} RECOMMENDATION: ${direction} $${size.toFixed(2)} of ${symbol}`);
  console.log(`   Stop Loss: 5% (${direction === 'LONG' ? 'below' : 'above'} entry)`);
  console.log(`   Take Profit: 15% (${direction === 'LONG' ? 'above' : 'below'} entry)`);
  console.log('═'.repeat(50) + '\n');
}

// Test scenarios
async function main() {
  console.log('\n🧪 DECISION ENGINE TEST');
  console.log('Testing signal analysis with current market conditions\n');
  console.log(`Portfolio: $${mockPortfolio.totalValue.toLocaleString()} ($${mockPortfolio.cash.toLocaleString()} cash)`);
  
  // Test 1: High confidence LONG
  await analyzeSignal({
    symbol: 'SOL',
    direction: 'LONG',
    confidence: 0.85,
    source: 'vanta-miner-1'
  });
  
  // Test 2: Medium confidence LONG
  await analyzeSignal({
    symbol: 'BTC',
    direction: 'LONG',
    confidence: 0.65,
    source: 'vanta-miner-2'
  });
  
  // Test 3: Low confidence (should skip)
  await analyzeSignal({
    symbol: 'ETH',
    direction: 'LONG',
    confidence: 0.45,
    source: 'vanta-miner-3'
  });
  
  // Test 4: SHORT signal (will depend on sentiment)
  await analyzeSignal({
    symbol: 'BTC',
    direction: 'SHORT',
    confidence: 0.75,
    source: 'vanta-miner-4'
  });
}

main().catch(console.error);
