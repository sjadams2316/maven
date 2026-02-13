/**
 * Desearch Provider (SN22)
 * Social sentiment analysis from Reddit and Twitter
 * 
 * Desearch aggregates sentiment from:
 * - Reddit (r/wallstreetbets, r/investing, crypto subs)
 * - Twitter/X (crypto and stock discussions)
 * - Other social platforms
 * 
 * Provides real-time sentiment without needing API keys for each platform.
 */

export interface DesearchSentiment {
  ticker: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  score: number; // -1 to 1
  volume: number; // number of mentions
  redditSentiment: number;
  twitterSentiment: number;
  topMentions: string[];
  trend: 'rising' | 'falling' | 'stable';
  timestamp: string;
}

export interface DesearchResponse {
  results: DesearchSentiment[];
  marketSentiment: number; // aggregate -1 to 1
  mostDiscussed: { ticker: string; mentions: number }[];
}

// Provider config
const DESEARCH_CONFIG = {
  apiUrl: 'https://api.dResearch.io/v1',
  subnet: 22,
};

/**
 * Check if Desearch is configured
 */
export function isDesearchConfigured(): boolean {
  return !!process.env.DESEARCH_API_KEY;
}

/**
 * Get Desearch API key
 */
function getApiKey(): string {
  const apiKey = process.env.DESEARCH_API_KEY;
  if (!apiKey) {
    throw new Error('DESEARCH_API_KEY environment variable not set');
  }
  return apiKey;
}

/**
 * Query Desearch for sentiment on a ticker
 */
export async function desearchQuery(
  ticker: string,
  options?: {
    timeframe?: '24h' | '7d' | '30d';
    platforms?: ('reddit' | 'twitter' | 'all')[];
  }
): Promise<DesearchSentiment | null> {
  if (!isDesearchConfigured()) {
    console.warn('[Desearch] Not configured - returning null');
    return null;
  }

  const startTime = Date.now();
  
  try {
    const response = await fetch(`${DESEARCH_CONFIG.apiUrl}/sentiment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getApiKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticker: ticker.toUpperCase(),
        timeframe: options?.timeframe || '7d',
        platforms: options?.platforms || ['all'],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.warn(`[Desearch] API error: ${error}`);
      return null;
    }

    const data = await response.json();
    
    return {
      ticker: data.ticker || ticker.toUpperCase(),
      sentiment: data.sentiment || 'neutral',
      score: data.score || 0,
      volume: data.volume || 0,
      redditSentiment: data.reddit_sentiment || 0,
      twitterSentiment: data.twitter_sentiment || 0,
      topMentions: data.top_mentions || [],
      trend: data.trend || 'stable',
      timestamp: data.timestamp || new Date().toISOString(),
    } as DesearchSentiment;
  } catch (error) {
    console.warn(`[Desearch] Query failed: ${error}`);
    return null;
  }
}

/**
 * Get overall market sentiment
 */
export async function desearchMarketSentiment(): Promise<DesearchResponse | null> {
  if (!isDesearchConfigured()) {
    return null;
  }

  try {
    const response = await fetch(`${DESEARCH_CONFIG.apiUrl}/market`, {
      headers: {
        'Authorization': `Bearer ${getApiKey()}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.warn(`[Desearch] Market sentiment failed: ${error}`);
    return null;
  }
}

/**
 * Batch query for multiple tickers
 */
export async function desearchBatchQuery(
  tickers: string[]
): Promise<Map<string, DesearchSentiment | null>> {
  const results = new Map<string, DesearchSentiment | null>();
  
  const concurrency = 5;
  for (let i = 0; i < tickers.length; i += concurrency) {
    const batch = tickers.slice(i, i + concurrency);
    const promises = batch.map(async (ticker) => {
      const sentiment = await desearchQuery(ticker);
      return { ticker, sentiment };
    });
    
    const batchResults = await Promise.all(promises);
    batchResults.forEach(({ ticker, sentiment }) => {
      results.set(ticker, sentiment);
    });
  }
  
  return results;
}

/**
 * Format Desearch sentiment for Oracle context
 */
export function formatDesearchSentiment(sentiment: DesearchSentiment): string {
  const emoji = sentiment.sentiment === 'bullish' ? '🟢' : sentiment.sentiment === 'bearish' ? '🔴' : '⚪';
  const trendEmoji = sentiment.trend === 'rising' ? '📈' : sentiment.trend === 'falling' ? '📉' : '➡️';
  
  return `${emoji} ${trendEmoji} ${sentiment.ticker}: ${sentiment.sentiment.toUpperCase()} (${(sentiment.score * 100).toFixed(0)}%) - ${sentiment.volume.toLocaleString()} mentions, Reddit: ${(sentiment.redditSentiment * 100).toFixed(0)}%, Twitter: ${(sentiment.twitterSentiment * 100).toFixed(0)}%`;
}
