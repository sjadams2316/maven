/**
 * Athena Intelligence Layer
 * 
 * The unified brain that enriches every Maven surface with:
 * - Social sentiment (xAI Twitter + Desearch Reddit)
 * - Trading signals (Vanta)
 * - Price forecasts (Precog)
 * - Market intelligence synthesis
 * 
 * This is what makes Maven Oracle different from "chatbot with Claude."
 */

import { getCombinedSentiment, isXAIConfigured } from './providers/xai';
import { 
  getMarketIntelligence, 
  fetchDesearchSentiment,
  fetchVantaSignals,
  getVantaConsensus,
  isDesearchConfigured,
  isVantaConfigured,
} from './providers/bittensor';

// ============================================================================
// SYMBOL DETECTION
// ============================================================================

// Common stock tickers that might be confused with words
const COMMON_WORDS = new Set([
  'A', 'I', 'AM', 'AN', 'AS', 'AT', 'BE', 'BY', 'DO', 'GO', 'HE', 'IF', 'IN', 
  'IS', 'IT', 'ME', 'MY', 'NO', 'OF', 'ON', 'OR', 'SO', 'TO', 'UP', 'US', 'WE',
  'ALL', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'CAN', 'HAS', 'HER', 'WAS', 'ONE',
  'NOW', 'OLD', 'SEE', 'WAY', 'WHO', 'HOW', 'MAN', 'NEW', 'OUT', 'ANY', 'DAY',
]);

// Known financial symbols
const KNOWN_SYMBOLS = new Set([
  // Major stocks
  'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.A', 'BRK.B',
  'JPM', 'JNJ', 'V', 'PG', 'UNH', 'HD', 'MA', 'DIS', 'PYPL', 'NFLX', 'ADBE', 'CRM',
  'INTC', 'AMD', 'QCOM', 'TXN', 'AVGO', 'CSCO', 'ORCL', 'IBM', 'SHOP',
  // Bitcoin mining
  'CIFR', 'IREN', 'MARA', 'RIOT', 'CLSK', 'HUT', 'BITF', 'BTBT', 'ARBK',
  // Crypto-related stocks
  'COIN', 'MSTR', 'HOOD', 'SQ', 'PYPL',
  // Crypto ETFs
  'IBIT', 'FBTC', 'GBTC', 'ARKB', 'BITB', 'HODL', 'BITO',
  // Cryptocurrencies
  'BTC', 'ETH', 'SOL', 'TAO', 'XRP', 'ADA', 'DOT', 'AVAX', 'MATIC', 'LINK',
  // Popular ETFs
  'SPY', 'QQQ', 'IWM', 'VTI', 'VOO', 'VT', 'VXUS', 'BND', 'VNQ', 'GLD', 'SLV',
  'XLF', 'XLK', 'XLE', 'XLV', 'XLI', 'XLY', 'XLP', 'XLU', 'XLB', 'XLRE',
  'ARKK', 'ARKG', 'ARKW', 'ARKF', 'ARKQ',
]);

/**
 * Extract stock/crypto symbols from text
 */
export function extractSymbols(text: string): string[] {
  const symbols: string[] = [];
  
  // Pattern 1: $SYMBOL (explicit ticker mention)
  const dollarMatches = text.match(/\$([A-Z]{1,5})/g) || [];
  dollarMatches.forEach(match => {
    const symbol = match.slice(1).toUpperCase();
    if (!symbols.includes(symbol)) symbols.push(symbol);
  });
  
  // Pattern 2: Known symbols as standalone words
  const words = text.toUpperCase().split(/\s+/);
  words.forEach(word => {
    // Clean punctuation
    const cleaned = word.replace(/[^A-Z.]/g, '');
    if (KNOWN_SYMBOLS.has(cleaned) && !symbols.includes(cleaned)) {
      symbols.push(cleaned);
    }
  });
  
  // Pattern 3: Contextual detection ("what about AAPL" or "how is Tesla doing")
  const contextPatterns = [
    /(?:what|how|thoughts? on|opinion on|analysis of|research|sentiment)\s+(?:about|on|for)?\s*([A-Z]{2,5})\b/gi,
    /\b([A-Z]{2,5})\s+(?:stock|shares?|price|chart|analysis|earnings|sentiment)/gi,
    /(?:buy|sell|hold|long|short)\s+([A-Z]{2,5})\b/gi,
  ];
  
  contextPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const symbol = match[1].toUpperCase();
      if (!COMMON_WORDS.has(symbol) && !symbols.includes(symbol)) {
        // Verify it looks like a real symbol (2-5 uppercase letters)
        if (/^[A-Z]{2,5}$/.test(symbol)) {
          symbols.push(symbol);
        }
      }
    }
  });
  
  // Company name to symbol mapping for common companies
  const companyMappings: Record<string, string> = {
    'APPLE': 'AAPL', 'MICROSOFT': 'MSFT', 'GOOGLE': 'GOOGL', 'ALPHABET': 'GOOGL',
    'AMAZON': 'AMZN', 'NVIDIA': 'NVDA', 'TESLA': 'TSLA', 'META': 'META',
    'FACEBOOK': 'META', 'NETFLIX': 'NFLX', 'COINBASE': 'COIN', 'BITCOIN': 'BTC',
    'ETHEREUM': 'ETH', 'SOLANA': 'SOL', 'BITTENSOR': 'TAO', 'MICROSTRATEGY': 'MSTR',
  };
  
  Object.entries(companyMappings).forEach(([name, symbol]) => {
    if (text.toUpperCase().includes(name) && !symbols.includes(symbol)) {
      symbols.push(symbol);
    }
  });
  
  return symbols;
}

/**
 * Detect if a query is asking about sentiment specifically
 */
export function isSentimentQuery(text: string): boolean {
  const sentimentPatterns = [
    /\bsentiment\b/i,
    /\btwitter\b/i,
    /\breddit\b/i,
    /\bsocial\s*media\b/i,
    /what.*(?:people|everyone|market|traders?).*(?:think|saying|feeling)/i,
    /(?:bullish|bearish)\s*(?:on|about)?/i,
    /\bbuzz\b/i,
    /\bhype\b/i,
    /public\s*opinion/i,
  ];
  
  return sentimentPatterns.some(p => p.test(text));
}

/**
 * Detect if query is asking for trading signals
 */
export function isTradingQuery(text: string): boolean {
  const tradingPatterns = [
    /\b(?:buy|sell|long|short)\b/i,
    /\b(?:entry|exit)\s*(?:point|price)?\b/i,
    /\btrade\b/i,
    /\bsignal/i,
    /should\s*i\s*(?:buy|sell|hold)/i,
    /\bgood\s*time\s*to\b/i,
  ];
  
  return tradingPatterns.some(p => p.test(text));
}

// ============================================================================
// INTELLIGENCE ENRICHMENT
// ============================================================================

export interface IntelligenceContext {
  symbols: string[];
  sentiment: Map<string, {
    direction: 'bullish' | 'bearish' | 'neutral';
    score: number;
    confidence: number;
    twitterSummary?: string;
    redditSummary?: string;
    agreement: string;
  }>;
  tradingSignals: Map<string, {
    direction: string;
    confidence: number;
    source: string;
  }>;
  forecasts: Map<string, {
    direction: string;
    confidence: number;
    targetPrice?: number;
  }>;
  providersUsed: string[];
  enrichmentLatencyMs: number;
}

/**
 * Enrich a query with market intelligence
 * Call this before sending to Claude to inject real-time data
 */
export async function enrichWithIntelligence(
  query: string,
  options?: {
    maxSymbols?: number;
    includeSentiment?: boolean;
    includeTrading?: boolean;
    includeForecasts?: boolean;
  }
): Promise<IntelligenceContext> {
  const startTime = Date.now();
  const {
    maxSymbols = 3,
    includeSentiment = true,
    includeTrading = true,
    includeForecasts = true,
  } = options || {};
  
  // Extract symbols from query
  const detectedSymbols = extractSymbols(query).slice(0, maxSymbols);
  
  const context: IntelligenceContext = {
    symbols: detectedSymbols,
    sentiment: new Map(),
    tradingSignals: new Map(),
    forecasts: new Map(),
    providersUsed: [],
    enrichmentLatencyMs: 0,
  };
  
  if (detectedSymbols.length === 0) {
    context.enrichmentLatencyMs = Date.now() - startTime;
    return context;
  }
  
  // Fetch intelligence in parallel
  const promises: Promise<void>[] = [];
  
  // Sentiment enrichment
  if (includeSentiment && (isXAIConfigured() || isDesearchConfigured())) {
    context.providersUsed.push('sentiment');
    
    promises.push(
      (async () => {
        for (const symbol of detectedSymbols) {
          try {
            const combined = await getCombinedSentiment(symbol);
            context.sentiment.set(symbol, {
              direction: combined.combined.sentiment,
              score: combined.combined.score,
              confidence: combined.combined.confidence,
              twitterSummary: combined.xaiSentiment?.reasoning,
              agreement: combined.combined.agreement,
            });
          } catch (e) {
            console.error(`Sentiment fetch failed for ${symbol}:`, e);
          }
        }
      })()
    );
  }
  
  // Trading signals
  if (includeTrading && isVantaConfigured()) {
    context.providersUsed.push('vanta');
    
    promises.push(
      (async () => {
        for (const symbol of detectedSymbols) {
          try {
            const signal = await fetchVantaSignals(symbol);
            if (signal) {
              context.tradingSignals.set(symbol, {
                direction: signal.signal,
                confidence: signal.confidence,
                source: 'vanta',
              });
            }
          } catch (e) {
            console.error(`Trading signal fetch failed for ${symbol}:`, e);
          }
        }
      })()
    );
  }
  
  await Promise.allSettled(promises);
  
  context.enrichmentLatencyMs = Date.now() - startTime;
  return context;
}

/**
 * Format intelligence context for injection into Claude's context
 */
export function formatIntelligenceForPrompt(context: IntelligenceContext): string {
  if (context.symbols.length === 0) {
    return '';
  }
  
  let prompt = '\n\n## REAL-TIME MARKET INTELLIGENCE\n';
  prompt += `*Data fetched just now from ${context.providersUsed.join(', ')} (${context.enrichmentLatencyMs}ms)*\n\n`;
  
  for (const symbol of context.symbols) {
    prompt += `### ${symbol}\n`;
    
    // Sentiment
    const sentiment = context.sentiment.get(symbol);
    if (sentiment) {
      const emoji = sentiment.direction === 'bullish' ? '🟢' : sentiment.direction === 'bearish' ? '🔴' : '⚪';
      prompt += `**Social Sentiment:** ${emoji} ${sentiment.direction.toUpperCase()} (score: ${sentiment.score.toFixed(2)}, confidence: ${Math.round(sentiment.confidence * 100)}%)\n`;
      if (sentiment.twitterSummary) {
        prompt += `- Twitter analysis: ${sentiment.twitterSummary}\n`;
      }
      prompt += `- Source agreement: ${sentiment.agreement}\n`;
    }
    
    // Trading signals
    const signal = context.tradingSignals.get(symbol);
    if (signal) {
      prompt += `**Trading Signal:** ${signal.direction} (${Math.round(signal.confidence * 100)}% confidence from ${signal.source})\n`;
    }
    
    // Forecast
    const forecast = context.forecasts.get(symbol);
    if (forecast) {
      prompt += `**Price Forecast:** ${forecast.direction} (${Math.round(forecast.confidence * 100)}% confidence)`;
      if (forecast.targetPrice) {
        prompt += ` → $${forecast.targetPrice.toLocaleString()}`;
      }
      prompt += '\n';
    }
    
    prompt += '\n';
  }
  
  prompt += '*Use this intelligence to enrich your response. Cite the sentiment/signals when relevant.*\n';
  
  return prompt;
}

// ============================================================================
// QUICK SENTIMENT LOOKUP (for UI components)
// ============================================================================

export interface QuickSentiment {
  symbol: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  score: number;
  confidence: number;
  twitterMentions?: number;
  redditMentions?: number;
  trending?: boolean;
  lastUpdated: string;
}

/**
 * Quick sentiment lookup for a single symbol
 * Use this for UI components like stock cards
 */
export async function getQuickSentiment(symbol: string): Promise<QuickSentiment | null> {
  try {
    const combined = await getCombinedSentiment(symbol);
    
    return {
      symbol,
      sentiment: combined.combined.sentiment,
      score: combined.combined.score,
      confidence: combined.combined.confidence,
      twitterMentions: combined.desearchSentiment?.twitterVolume,
      redditMentions: combined.desearchSentiment?.redditVolume,
      trending: (combined.desearchSentiment?.twitterVolume || 0) > 5000,
      lastUpdated: combined.timestamp,
    };
  } catch (e) {
    console.error(`Quick sentiment failed for ${symbol}:`, e);
    return null;
  }
}

/**
 * Batch sentiment lookup for multiple symbols
 */
export async function getBatchSentiment(symbols: string[]): Promise<Map<string, QuickSentiment>> {
  const results = new Map<string, QuickSentiment>();
  
  const promises = symbols.map(async (symbol) => {
    const sentiment = await getQuickSentiment(symbol);
    if (sentiment) {
      results.set(symbol, sentiment);
    }
  });
  
  await Promise.allSettled(promises);
  return results;
}

// ============================================================================
// PORTFOLIO SENTIMENT
// ============================================================================

export interface PortfolioSentimentSummary {
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
  overallScore: number;
  holdingsAnalyzed: number;
  bullishHoldings: string[];
  bearishHoldings: string[];
  neutralHoldings: string[];
  alerts: string[];
  lastUpdated: string;
}

/**
 * Analyze sentiment across a portfolio
 */
export async function analyzePortfolioSentiment(
  holdings: { symbol: string; value: number }[]
): Promise<PortfolioSentimentSummary> {
  const symbols = holdings.map(h => h.symbol);
  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  
  const sentiments = await getBatchSentiment(symbols);
  
  let weightedScore = 0;
  const bullish: string[] = [];
  const bearish: string[] = [];
  const neutral: string[] = [];
  const alerts: string[] = [];
  
  for (const holding of holdings) {
    const sentiment = sentiments.get(holding.symbol);
    if (!sentiment) continue;
    
    const weight = holding.value / totalValue;
    weightedScore += sentiment.score * weight;
    
    if (sentiment.sentiment === 'bullish') {
      bullish.push(holding.symbol);
    } else if (sentiment.sentiment === 'bearish') {
      bearish.push(holding.symbol);
      // Alert for significant bearish holdings
      if (weight > 0.1) {
        alerts.push(`⚠️ ${holding.symbol} (${Math.round(weight * 100)}% of portfolio) showing bearish sentiment`);
      }
    } else {
      neutral.push(holding.symbol);
    }
    
    // Alert for trending stocks
    if (sentiment.trending) {
      alerts.push(`📈 ${holding.symbol} is trending on social media`);
    }
  }
  
  return {
    overallSentiment: weightedScore > 0.15 ? 'bullish' : weightedScore < -0.15 ? 'bearish' : 'neutral',
    overallScore: weightedScore,
    holdingsAnalyzed: sentiments.size,
    bullishHoldings: bullish,
    bearishHoldings: bearish,
    neutralHoldings: neutral,
    alerts,
    lastUpdated: new Date().toISOString(),
  };
}
