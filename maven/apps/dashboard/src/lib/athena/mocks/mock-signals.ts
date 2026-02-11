/**
 * Mock Signal Generator for Athena Testing
 * 
 * Generates realistic trading signals without hitting real APIs.
 * Supports various scenarios for testing router and synthesis logic.
 */

export type SignalSource = 'vanta' | 'precog' | 'mantis' | 'desearch';

export interface TradingSignal {
  source: SignalSource;
  symbol: string;
  signal: number; // -1 to +1
  confidence: number; // 0 to 1
  metadata: Record<string, unknown>;
  timestamp: number;
}

export type SignalScenario = 'bullish' | 'bearish' | 'mixed' | 'random';

/**
 * Source-specific behavior profiles
 * Each source has characteristic patterns in how it generates signals
 */
const SOURCE_PROFILES: Record<SignalSource, {
  biasMean: number;      // Default signal tendency
  volatility: number;    // How much signals vary
  confidenceBase: number; // Base confidence level
  specialSymbols?: string[]; // Symbols this source focuses on
}> = {
  // Vanta: Momentum-focused, tends toward directional signals
  vanta: {
    biasMean: 0.15,        // Slight bullish bias (momentum chasing)
    volatility: 0.4,       // Moderate volatility
    confidenceBase: 0.72,
  },
  
  // Precog: BTC-focused, more neutral/conservative
  precog: {
    biasMean: 0,           // Neutral by default
    volatility: 0.25,      // Lower volatility, more measured
    confidenceBase: 0.78,
    specialSymbols: ['BTC', 'BTCUSD', 'BTC-USD'],
  },
  
  // MANTIS: More volatile, aggressive signals
  mantis: {
    biasMean: 0,
    volatility: 0.6,       // High volatility
    confidenceBase: 0.65,  // Lower base confidence (more uncertain)
  },
  
  // Desearch: Sentiment-based, lags price action
  desearch: {
    biasMean: -0.05,       // Slight lag effect (contrarian when late)
    volatility: 0.35,
    confidenceBase: 0.7,
  },
};

/**
 * Generate a random number with approximate normal distribution
 * Uses Box-Muller transform
 */
function gaussianRandom(mean = 0, stdDev = 1): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Generate metadata specific to each source
 */
function generateMetadata(source: SignalSource, symbol: string, signal: number): Record<string, unknown> {
  const base = {
    generatedAt: new Date().toISOString(),
    mock: true,
  };

  switch (source) {
    case 'vanta':
      return {
        ...base,
        momentum_1h: signal * 0.8 + gaussianRandom(0, 0.1),
        momentum_4h: signal * 0.6 + gaussianRandom(0, 0.15),
        volume_spike: Math.random() > 0.7,
        trend_strength: Math.abs(signal) * 100,
      };

    case 'precog':
      return {
        ...base,
        prediction_horizon: '4h',
        model_version: '2.3.1',
        btc_correlation: symbol.includes('BTC') ? 1 : gaussianRandom(0.6, 0.2),
        uncertainty_band: [signal - 0.1, signal + 0.1],
      };

    case 'mantis':
      return {
        ...base,
        volatility_regime: Math.abs(signal) > 0.5 ? 'high' : 'normal',
        options_flow: signal > 0 ? 'bullish' : signal < 0 ? 'bearish' : 'neutral',
        whale_activity: Math.random() > 0.8,
        liquidation_risk: Math.abs(signal) > 0.7 ? 'elevated' : 'low',
      };

    case 'desearch':
      return {
        ...base,
        sentiment_sources: ['twitter', 'reddit', 'discord'],
        sentiment_lag_hours: Math.floor(Math.random() * 4) + 1,
        mention_volume: Math.floor(Math.random() * 10000),
        sentiment_trend: signal > 0.2 ? 'improving' : signal < -0.2 ? 'declining' : 'stable',
      };

    default:
      return base;
  }
}

/**
 * Generate a single mock signal with realistic distributions
 * 
 * @param source - The signal source
 * @param symbol - Trading symbol (e.g., 'BTC', 'ETH')
 * @param bias - Optional bias to apply (-1 to +1), overrides source default
 */
export function generateMockSignal(
  source: SignalSource,
  symbol: string,
  bias?: number
): TradingSignal {
  const profile = SOURCE_PROFILES[source];
  
  // Calculate signal with source-specific characteristics
  const effectiveBias = bias ?? profile.biasMean;
  
  // Special handling for precog with BTC
  const isFocusSymbol = profile.specialSymbols?.some(s => 
    symbol.toUpperCase().includes(s)
  );
  const confidenceBoost = isFocusSymbol ? 0.1 : 0;
  
  // Generate signal with gaussian noise around the bias
  const rawSignal = gaussianRandom(effectiveBias, profile.volatility);
  const signal = clamp(rawSignal, -1, 1);
  
  // Confidence is higher when signal is more extreme (conviction)
  const extremity = Math.abs(signal);
  const rawConfidence = profile.confidenceBase + confidenceBoost + (extremity * 0.15) + gaussianRandom(0, 0.08);
  const confidence = clamp(rawConfidence, 0.3, 0.98);
  
  return {
    source,
    symbol: symbol.toUpperCase(),
    signal: Math.round(signal * 1000) / 1000, // Round to 3 decimals
    confidence: Math.round(confidence * 100) / 100,
    metadata: generateMetadata(source, symbol, signal),
    timestamp: Date.now(),
  };
}

/**
 * Generate a set of signals from all sources for a given scenario
 * 
 * @param symbol - Trading symbol
 * @param scenario - The test scenario to generate
 */
export function generateSignalSet(
  symbol: string,
  scenario: SignalScenario
): TradingSignal[] {
  const sources: SignalSource[] = ['vanta', 'precog', 'mantis', 'desearch'];
  
  switch (scenario) {
    case 'bullish':
      // All sources agree on bullish signal
      return sources.map(source => 
        generateMockSignal(source, symbol, gaussianRandom(0.6, 0.15))
      );

    case 'bearish':
      // All sources agree on bearish signal
      return sources.map(source => 
        generateMockSignal(source, symbol, gaussianRandom(-0.6, 0.15))
      );

    case 'mixed':
      // Sources disagree - creates low confidence synthesis
      const biases = [0.5, -0.4, 0.3, -0.6]; // Deliberately conflicting
      return sources.map((source, i) => 
        generateMockSignal(source, symbol, biases[i])
      );

    case 'random':
    default:
      // Each source generates independently
      return sources.map(source => generateMockSignal(source, symbol));
  }
}

/**
 * Simulate a source being offline (returns null or throws)
 */
export function generateDegradedSignalSet(
  symbol: string,
  offlineSources: SignalSource[]
): (TradingSignal | null)[] {
  const sources: SignalSource[] = ['vanta', 'precog', 'mantis', 'desearch'];
  
  return sources.map(source => {
    if (offlineSources.includes(source)) {
      return null; // Source is offline
    }
    return generateMockSignal(source, symbol);
  });
}

/**
 * Generate signals that simulate a specific market condition
 */
export function generateMarketCondition(
  symbol: string,
  condition: 'trending_up' | 'trending_down' | 'choppy' | 'breakout' | 'breakdown'
): TradingSignal[] {
  const sources: SignalSource[] = ['vanta', 'precog', 'mantis', 'desearch'];
  
  switch (condition) {
    case 'trending_up':
      // Strong agreement, high confidence
      return sources.map(source => 
        generateMockSignal(source, symbol, gaussianRandom(0.7, 0.1))
      );

    case 'trending_down':
      return sources.map(source => 
        generateMockSignal(source, symbol, gaussianRandom(-0.7, 0.1))
      );

    case 'choppy':
      // Low conviction, signals near zero
      return sources.map(source => 
        generateMockSignal(source, symbol, gaussianRandom(0, 0.15))
      );

    case 'breakout':
      // Sudden strong bullish, MANTIS leads
      return [
        generateMockSignal('mantis', symbol, 0.85),  // MANTIS catches it first
        generateMockSignal('vanta', symbol, 0.6),    // Momentum follows
        generateMockSignal('precog', symbol, 0.4),   // Model catching up
        generateMockSignal('desearch', symbol, 0.2), // Sentiment lags
      ];

    case 'breakdown':
      // Sudden drop, similar pattern
      return [
        generateMockSignal('mantis', symbol, -0.85),
        generateMockSignal('vanta', symbol, -0.6),
        generateMockSignal('precog', symbol, -0.4),
        generateMockSignal('desearch', symbol, -0.2),
      ];

    default:
      return generateSignalSet(symbol, 'random');
  }
}

/**
 * Helper to check if signals reach consensus
 */
export function analyzeConsensus(signals: TradingSignal[]): {
  hasConsensus: boolean;
  direction: 'bullish' | 'bearish' | 'neutral';
  averageSignal: number;
  averageConfidence: number;
  spread: number;
} {
  const validSignals = signals.filter(s => s !== null) as TradingSignal[];
  
  if (validSignals.length === 0) {
    return {
      hasConsensus: false,
      direction: 'neutral',
      averageSignal: 0,
      averageConfidence: 0,
      spread: 0,
    };
  }

  const signalValues = validSignals.map(s => s.signal);
  const avgSignal = signalValues.reduce((a, b) => a + b, 0) / signalValues.length;
  const avgConfidence = validSignals.reduce((a, b) => a + b.confidence, 0) / validSignals.length;
  
  const min = Math.min(...signalValues);
  const max = Math.max(...signalValues);
  const spread = max - min;
  
  // Consensus requires tight spread and same direction
  const allSameDirection = signalValues.every(s => s > 0) || signalValues.every(s => s < 0);
  const hasConsensus = spread < 0.4 && allSameDirection;
  
  return {
    hasConsensus,
    direction: avgSignal > 0.15 ? 'bullish' : avgSignal < -0.15 ? 'bearish' : 'neutral',
    averageSignal: Math.round(avgSignal * 1000) / 1000,
    averageConfidence: Math.round(avgConfidence * 100) / 100,
    spread: Math.round(spread * 1000) / 1000,
  };
}
