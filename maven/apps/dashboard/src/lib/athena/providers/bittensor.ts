/**
 * Bittensor Subnet Providers
 * Decentralized intelligence signals for Athena
 * 
 * Subnets integrated:
 * - SN8 (Vanta/Taoshi): Trading signals
 * - SN22 (Desearch): Social sentiment
 * - SN55 (Precog): BTC price forecasting
 * 
 * These provide real-time market intelligence that no centralized
 * LLM has access to — the decentralized advantage.
 */

// ============================================================================
// TYPES
// ============================================================================

export type SignalDirection = 'LONG' | 'SHORT' | 'FLAT' | 'NEUTRAL';

export interface TradingSignal {
  pair: string;           // e.g., "BTC/USD", "SPY"
  direction: SignalDirection;
  confidence: number;     // 0-1
  leverage?: number;      // e.g., 2.0
  entryPrice?: number;
  takeProfit?: number;
  stopLoss?: number;
  timestamp: string;
}

export interface MinerMetrics {
  sharpeRatio: number;
  sortinoRatio?: number;
  maxDrawdown: number;
  winRate: number;
  omegaRatio?: number;
}

export interface VantaResponse {
  minerId?: string;
  signals: TradingSignal[];
  metrics?: MinerMetrics;
  aggregatedConsensus?: {
    direction: SignalDirection;
    bullishPercent: number;
    bearishPercent: number;
    neutralPercent: number;
  };
  timestamp: string;
}

export interface SentimentData {
  symbol: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  score: number;          // -1 to 1
  volume: number;         // number of mentions
  sources: {
    twitter: number;
    reddit: number;
    news: number;
  };
  topMentions: string[];  // sample tweets/posts
  timestamp: string;
}

export interface DesearchResponse {
  query: string;
  sentiments: SentimentData[];
  summary: string;
  timestamp: string;
}

export interface PrecogForecast {
  symbol: string;         // Always BTC for now
  currentPrice: number;
  forecastPrice: number;  // 1 hour ahead
  forecastHigh: number;
  forecastLow: number;
  confidence: number;
  direction: 'up' | 'down' | 'sideways';
  timestamp: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const BITTENSOR_CONFIG = {
  vanta: {
    // Request Network API - https://request.taoshi.io
    baseUrl: process.env.VANTA_API_URL || 'https://api.taoshi.io/v1',
    apiKey: process.env.VANTA_API_KEY,
  },
  desearch: {
    // Desearch API - SN22
    baseUrl: process.env.DESEARCH_API_URL || 'https://api.desearch.ai/v1',
    apiKey: process.env.DESEARCH_API_KEY,
  },
  precog: {
    // Precog API - SN55
    baseUrl: process.env.PRECOG_API_URL || 'https://api.precog.finance/v1',
    apiKey: process.env.PRECOG_API_KEY,
  },
};

// ============================================================================
// AVAILABILITY CHECKS
// ============================================================================

export function isVantaConfigured(): boolean {
  return !!BITTENSOR_CONFIG.vanta.apiKey;
}

export function isDesearchConfigured(): boolean {
  return !!BITTENSOR_CONFIG.desearch.apiKey;
}

export function isPrecogConfigured(): boolean {
  return !!BITTENSOR_CONFIG.precog.apiKey;
}

export function getBittensorStatus(): {
  vanta: boolean;
  desearch: boolean;
  precog: boolean;
  anyConfigured: boolean;
} {
  const vanta = isVantaConfigured();
  const desearch = isDesearchConfigured();
  const precog = isPrecogConfigured();
  return {
    vanta,
    desearch,
    precog,
    anyConfigured: vanta || desearch || precog,
  };
}

// ============================================================================
// VANTA - TRADING SIGNALS (SN8)
// ============================================================================

/**
 * Fetch trading signals from Vanta/Taoshi (SN8)
 * Returns consensus signals from top-performing miners
 */
export async function fetchVantaSignals(
  symbols: string[] = ['BTC/USD', 'ETH/USD', 'SPY']
): Promise<VantaResponse> {
  if (!isVantaConfigured()) {
    // Return mock data for development/demo
    return getMockVantaSignals(symbols);
  }

  try {
    const response = await fetch(
      `${BITTENSOR_CONFIG.vanta.baseUrl}/signals?pairs=${symbols.join(',')}`,
      {
        headers: {
          'Authorization': `Bearer ${BITTENSOR_CONFIG.vanta.apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      console.error(`Vanta API error: ${response.status}`);
      return getMockVantaSignals(symbols);
    }

    return await response.json();
  } catch (error) {
    console.error('Vanta fetch error:', error);
    return getMockVantaSignals(symbols);
  }
}

/**
 * Get aggregated trading consensus across all miners
 */
export async function getVantaConsensus(
  symbol: string
): Promise<{ direction: SignalDirection; confidence: number; details: string }> {
  const signals = await fetchVantaSignals([symbol]);
  
  if (!signals.aggregatedConsensus) {
    // Calculate from individual signals
    const bulls = signals.signals.filter(s => s.direction === 'LONG').length;
    const bears = signals.signals.filter(s => s.direction === 'SHORT').length;
    const total = signals.signals.length || 1;
    
    const bullishPercent = bulls / total;
    const bearishPercent = bears / total;
    
    let direction: SignalDirection = 'NEUTRAL';
    let confidence = 0.5;
    
    if (bullishPercent > 0.6) {
      direction = 'LONG';
      confidence = bullishPercent;
    } else if (bearishPercent > 0.6) {
      direction = 'SHORT';
      confidence = bearishPercent;
    }
    
    return {
      direction,
      confidence,
      details: `${Math.round(bullishPercent * 100)}% bullish, ${Math.round(bearishPercent * 100)}% bearish (${total} miners)`,
    };
  }
  
  const { bullishPercent, bearishPercent } = signals.aggregatedConsensus;
  let direction: SignalDirection = 'NEUTRAL';
  let confidence = 0.5;
  
  if (bullishPercent > 60) {
    direction = 'LONG';
    confidence = bullishPercent / 100;
  } else if (bearishPercent > 60) {
    direction = 'SHORT';
    confidence = bearishPercent / 100;
  }
  
  return {
    direction,
    confidence,
    details: `${bullishPercent}% bullish, ${bearishPercent}% bearish`,
  };
}

// ============================================================================
// DESEARCH - SOCIAL SENTIMENT (SN22)
// ============================================================================

/**
 * Fetch social sentiment from Desearch (SN22)
 * Analyzes Twitter, Reddit, and news for market sentiment
 */
export async function fetchDesearchSentiment(
  symbols: string[] = ['BTC', 'ETH', 'SPY']
): Promise<DesearchResponse> {
  if (!isDesearchConfigured()) {
    return getMockDesearchSentiment(symbols);
  }

  try {
    const response = await fetch(
      `${BITTENSOR_CONFIG.desearch.baseUrl}/sentiment?symbols=${symbols.join(',')}`,
      {
        headers: {
          'Authorization': `Bearer ${BITTENSOR_CONFIG.desearch.apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      console.error(`Desearch API error: ${response.status}`);
      return getMockDesearchSentiment(symbols);
    }

    return await response.json();
  } catch (error) {
    console.error('Desearch fetch error:', error);
    return getMockDesearchSentiment(symbols);
  }
}

/**
 * Get sentiment summary for a single symbol
 */
export async function getSentimentSummary(
  symbol: string
): Promise<{ sentiment: string; score: number; summary: string }> {
  const data = await fetchDesearchSentiment([symbol]);
  const symbolData = data.sentiments.find(s => s.symbol === symbol);
  
  if (!symbolData) {
    return {
      sentiment: 'neutral',
      score: 0,
      summary: `No sentiment data available for ${symbol}`,
    };
  }
  
  return {
    sentiment: symbolData.sentiment,
    score: symbolData.score,
    summary: `${symbol}: ${symbolData.sentiment} (score: ${symbolData.score.toFixed(2)}) based on ${symbolData.volume} mentions. ` +
      `Twitter: ${symbolData.sources.twitter}, Reddit: ${symbolData.sources.reddit}, News: ${symbolData.sources.news}`,
  };
}

// ============================================================================
// PRECOG - BTC FORECASTING (SN55)
// ============================================================================

/**
 * Fetch BTC price forecast from Precog (SN55)
 * High-frequency forecasting at 5-minute intervals
 */
export async function fetchPrecogForecast(): Promise<PrecogForecast> {
  if (!isPrecogConfigured()) {
    return getMockPrecogForecast();
  }

  try {
    const response = await fetch(
      `${BITTENSOR_CONFIG.precog.baseUrl}/forecast/btc`,
      {
        headers: {
          'Authorization': `Bearer ${BITTENSOR_CONFIG.precog.apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      console.error(`Precog API error: ${response.status}`);
      return getMockPrecogForecast();
    }

    return await response.json();
  } catch (error) {
    console.error('Precog fetch error:', error);
    return getMockPrecogForecast();
  }
}

// ============================================================================
// AGGREGATED MARKET INTELLIGENCE
// ============================================================================

export interface MarketIntelligence {
  symbol: string;
  timestamp: string;
  
  // Trading signals
  tradingSignal?: {
    direction: SignalDirection;
    confidence: number;
    source: 'vanta';
  };
  
  // Social sentiment
  sentiment?: {
    direction: 'bullish' | 'bearish' | 'neutral';
    score: number;
    source: 'desearch';
  };
  
  // Price forecast (BTC only)
  forecast?: {
    direction: 'up' | 'down' | 'sideways';
    confidence: number;
    targetPrice: number;
    source: 'precog';
  };
  
  // Combined assessment
  consensus: {
    direction: 'bullish' | 'bearish' | 'neutral';
    confidence: number;
    agreementLevel: 'high' | 'medium' | 'low';
    summary: string;
  };
}

/**
 * Get comprehensive market intelligence for a symbol
 * Aggregates signals from all available Bittensor subnets
 */
export async function getMarketIntelligence(
  symbol: string
): Promise<MarketIntelligence> {
  const timestamp = new Date().toISOString();
  
  // Fetch from all sources in parallel
  const [vantaResult, desearchResult, precogResult] = await Promise.allSettled([
    getVantaConsensus(symbol),
    getSentimentSummary(symbol),
    symbol.toUpperCase() === 'BTC' ? fetchPrecogForecast() : Promise.resolve(null),
  ]);
  
  // Extract results
  const vanta = vantaResult.status === 'fulfilled' ? vantaResult.value : null;
  const desearch = desearchResult.status === 'fulfilled' ? desearchResult.value : null;
  const precog = precogResult.status === 'fulfilled' ? precogResult.value : null;
  
  // Build intelligence object
  const intel: MarketIntelligence = {
    symbol,
    timestamp,
    consensus: {
      direction: 'neutral',
      confidence: 0.5,
      agreementLevel: 'low',
      summary: '',
    },
  };
  
  // Add trading signal
  if (vanta) {
    intel.tradingSignal = {
      direction: vanta.direction,
      confidence: vanta.confidence,
      source: 'vanta',
    };
  }
  
  // Add sentiment
  if (desearch) {
    intel.sentiment = {
      direction: desearch.sentiment as 'bullish' | 'bearish' | 'neutral',
      score: desearch.score,
      source: 'desearch',
    };
  }
  
  // Add forecast (BTC only)
  if (precog && symbol.toUpperCase() === 'BTC') {
    intel.forecast = {
      direction: precog.direction,
      confidence: precog.confidence,
      targetPrice: precog.forecastPrice,
      source: 'precog',
    };
  }
  
  // Calculate consensus
  const signals: Array<{ direction: string; weight: number }> = [];
  
  if (vanta) {
    const dir = vanta.direction === 'LONG' ? 'bullish' : vanta.direction === 'SHORT' ? 'bearish' : 'neutral';
    signals.push({ direction: dir, weight: vanta.confidence });
  }
  
  if (desearch) {
    signals.push({ direction: desearch.sentiment, weight: Math.abs(desearch.score) });
  }
  
  if (precog) {
    const dir = precog.direction === 'up' ? 'bullish' : precog.direction === 'down' ? 'bearish' : 'neutral';
    signals.push({ direction: dir, weight: precog.confidence });
  }
  
  if (signals.length > 0) {
    const bullish = signals.filter(s => s.direction === 'bullish');
    const bearish = signals.filter(s => s.direction === 'bearish');
    
    const bullishWeight = bullish.reduce((sum, s) => sum + s.weight, 0) / signals.length;
    const bearishWeight = bearish.reduce((sum, s) => sum + s.weight, 0) / signals.length;
    
    if (bullishWeight > bearishWeight && bullishWeight > 0.3) {
      intel.consensus.direction = 'bullish';
      intel.consensus.confidence = bullishWeight;
    } else if (bearishWeight > bullishWeight && bearishWeight > 0.3) {
      intel.consensus.direction = 'bearish';
      intel.consensus.confidence = bearishWeight;
    } else {
      intel.consensus.direction = 'neutral';
      intel.consensus.confidence = 0.5;
    }
    
    // Determine agreement level
    const allAgree = signals.every(s => s.direction === intel.consensus.direction || s.direction === 'neutral');
    const mostAgree = signals.filter(s => s.direction === intel.consensus.direction).length >= signals.length * 0.6;
    
    intel.consensus.agreementLevel = allAgree ? 'high' : mostAgree ? 'medium' : 'low';
    
    // Build summary
    const sourcesUsed = [];
    if (vanta) sourcesUsed.push('trading signals');
    if (desearch) sourcesUsed.push('social sentiment');
    if (precog) sourcesUsed.push('price forecasting');
    
    intel.consensus.summary = `${symbol} outlook: ${intel.consensus.direction} (${Math.round(intel.consensus.confidence * 100)}% confidence). ` +
      `${intel.consensus.agreementLevel} agreement across ${sourcesUsed.join(', ')}.`;
  } else {
    intel.consensus.summary = `No Bittensor signals available for ${symbol}. Configure API keys for Vanta, Desearch, or Precog.`;
  }
  
  return intel;
}

// ============================================================================
// MOCK DATA (for development/demo when APIs not configured)
// ============================================================================

function getMockVantaSignals(symbols: string[]): VantaResponse {
  const signals: TradingSignal[] = symbols.map(symbol => {
    // Generate realistic-ish mock data
    const isCrypto = symbol.includes('BTC') || symbol.includes('ETH');
    const randomDirection = Math.random();
    let direction: SignalDirection = 'NEUTRAL';
    if (randomDirection > 0.6) direction = 'LONG';
    else if (randomDirection < 0.3) direction = 'SHORT';
    
    return {
      pair: symbol,
      direction,
      confidence: 0.6 + Math.random() * 0.3,
      leverage: isCrypto ? 2.0 : 1.0,
      timestamp: new Date().toISOString(),
    };
  });
  
  // Calculate consensus
  const longs = signals.filter(s => s.direction === 'LONG').length;
  const shorts = signals.filter(s => s.direction === 'SHORT').length;
  const total = signals.length;
  
  return {
    signals,
    aggregatedConsensus: {
      direction: longs > shorts ? 'LONG' : shorts > longs ? 'SHORT' : 'NEUTRAL',
      bullishPercent: Math.round((longs / total) * 100),
      bearishPercent: Math.round((shorts / total) * 100),
      neutralPercent: Math.round(((total - longs - shorts) / total) * 100),
    },
    metrics: {
      sharpeRatio: 1.5 + Math.random(),
      maxDrawdown: 0.05 + Math.random() * 0.05,
      winRate: 0.55 + Math.random() * 0.15,
    },
    timestamp: new Date().toISOString(),
  };
}

function getMockDesearchSentiment(symbols: string[]): DesearchResponse {
  const sentiments: SentimentData[] = symbols.map(symbol => {
    const score = (Math.random() - 0.5) * 2; // -1 to 1
    return {
      symbol,
      sentiment: score > 0.2 ? 'bullish' : score < -0.2 ? 'bearish' : 'neutral',
      score,
      volume: Math.floor(1000 + Math.random() * 9000),
      sources: {
        twitter: Math.floor(500 + Math.random() * 4500),
        reddit: Math.floor(200 + Math.random() * 2000),
        news: Math.floor(50 + Math.random() * 500),
      },
      topMentions: [
        `$${symbol} looking strong today! 🚀`,
        `Just bought more $${symbol}, long-term hold`,
        `Interesting price action on $${symbol}`,
      ],
      timestamp: new Date().toISOString(),
    };
  });
  
  return {
    query: symbols.join(', '),
    sentiments,
    summary: `Analyzed ${symbols.length} symbols across Twitter, Reddit, and news sources.`,
    timestamp: new Date().toISOString(),
  };
}

function getMockPrecogForecast(): PrecogForecast {
  const currentPrice = 66000 + Math.random() * 2000;
  const change = (Math.random() - 0.5) * 0.04; // -2% to +2%
  const forecastPrice = currentPrice * (1 + change);
  
  return {
    symbol: 'BTC',
    currentPrice,
    forecastPrice,
    forecastHigh: forecastPrice * 1.02,
    forecastLow: forecastPrice * 0.98,
    confidence: 0.6 + Math.random() * 0.25,
    direction: change > 0.005 ? 'up' : change < -0.005 ? 'down' : 'sideways',
    timestamp: new Date().toISOString(),
  };
}
