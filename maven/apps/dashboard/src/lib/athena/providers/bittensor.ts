/**
 * Bittensor Provider for Athena
 * 
 * Provides access to Bittensor subnets for:
 * - Vanta (SN8): Trading signals and market signals
 * - Desearch (SN22): Social sentiment (Reddit + Twitter)
 * 
 * These provide real-time market intelligence that LLMs alone can't provide.
 */

import { isVantaConfigured, vantaQuery, vantaMarketContext, type VantaResponse, type TradingSignal } from './vanta';
import { isDesearchConfigured, desearchQuery, desearchMarketSentiment, type DesearchResponse, type SentimentData } from './desearch';
import { isPrecogConfigured, precogForecast, type PrecogForecast } from './precog';

// Re-export for convenience
export { vantaQuery, vantaMarketContext, isVantaConfigured, type VantaResponse, type TradingSignal } from './vanta';
export { desearchQuery, desearchMarketSentiment, isDesearchConfigured, type DesearchResponse, type SentimentData } from './desearch';
export { precogForecast, isPrecogConfigured, type PrecogForecast } from './precog';

// Market Intelligence type (aggregated from all Bittensor sources)
export interface MarketIntelligence {
  timestamp: string;
  vanta?: VantaResponse;
  desearch?: DesearchResponse;
  precog?: PrecogForecast;
  overallScore: number; // -1 to 1
  recommendation: 'bullish' | 'bearish' | 'neutral' | 'mixed';
}

// Signal direction enum
export type SignalDirection = 'bullish' | 'bearish' | 'neutral';

// =============================================================================
// Utility Exports (for routes and index.ts)
// =============================================================================

export function getBittensorStatus(): { 
  vanta: boolean; 
  desearch: boolean; 
  precog: boolean;
  anyConfigured: boolean;
} {
  const status = {
    vanta: isVantaConfigured(),
    desearch: isDesearchConfigured(),
    precog: isPrecogConfigured(),
  };
  return {
    ...status,
    anyConfigured: status.vanta || status.desearch || status.precog,
  };
}

export async function fetchVantaSignals(ticker: string): Promise<TradingSignal | null> {
  return vantaQuery(ticker);
}

export async function getVantaConsensus(tickers: string[]): Promise<{ [ticker: string]: TradingSignal | null }> {
  const results: { [ticker: string]: TradingSignal | null } = {};
  for (const ticker of tickers) {
    results[ticker] = await vantaQuery(ticker);
  }
  return results;
}

/**
 * Query Desearch for sentiment - supports single ticker or batch
 */
export async function fetchDesearchSentiment(
  tickers: string | string[]
): Promise<{
  sentiments: Array<{
    symbol: string;
    sentiment: 'bullish' | 'bearish' | 'neutral';
    score: number;
    sources: { twitter: number; reddit: number };
  }>;
}> {
  const tickerArray = Array.isArray(tickers) ? tickers : [tickers];
  
  // For each ticker, get sentiment
  const sentiments = await Promise.all(
    tickerArray.map(async (ticker) => {
      const result = await desearchQuery(ticker);
      return {
        symbol: ticker,
        sentiment: result?.sentiment || 'neutral',
        score: result?.score || 0,
        sources: {
          twitter: result?.twitterSentiment || 0,
          reddit: result?.redditSentiment || 0,
        },
      };
    })
  );
  
  return { sentiments };
}

export async function getSentimentSummary(tickers: string[]): Promise<{ [ticker: string]: SentimentData | null }> {
  const results: { [ticker: string]: SentimentData | null } = {};
  for (const ticker of tickers) {
    results[ticker] = await desearchQuery(ticker);
  }
  return results;
}

export async function fetchPrecogForecast(ticker: string): Promise<PrecogForecast | null> {
  return precogForecast(ticker);
}

export async function getMarketIntelligence(): Promise<MarketIntelligence> {
  const [vanta, desearch] = await Promise.all([
    vantaMarketContext().catch(() => null),
    desearchMarketSentiment().catch(() => null),
  ]);

  // Calculate overall score
  let totalScore = 0;
  let count = 0;
  
  if (vanta) {
    totalScore += vanta.overallSentiment;
    count++;
  }
  
  if (desearch) {
    totalScore += desearch.marketSentiment;
    count++;
  }
  
  const overallScore = count > 0 ? totalScore / count : 0;
  
  return {
    timestamp: new Date().toISOString(),
    vanta: vanta || undefined,
    desearch: desearch || undefined,
    overallScore,
    recommendation: overallScore > 0.2 ? 'bullish' : overallScore < -0.2 ? 'bearish' : 'mixed',
  };
}

// Unified Bittensor query interface
export interface BittensorQueryResult {
  source: 'vanta' | 'desearch';
  data: any;
  latencyMs: number;
  error?: string;
}

// Check if any Bittensor provider is configured
export function isBittensorConfigured(): boolean {
  return isVantaConfigured() || isDesearchConfigured();
}

// Get list of configured Bittensor providers
export function getConfiguredBittensorProviders(): string[] {
  const providers: string[] = [];
  if (isVantaConfigured()) providers.push('vanta');
  if (isDesearchConfigured()) providers.push('desearch');
  return providers;
}

// Query multiple Bittensor providers in parallel
export async function queryBittensorBatch(
  query: string,
  providers: ('vanta' | 'desearch')[]
): Promise<BittensorQueryResult[]> {
  const results: BittensorQueryResult[] = [];
  
  const promises = providers.map(async (provider) => {
    const startTime = Date.now();
    try {
      let data: any;
      
      if (provider === 'vanta') {
        data = await vantaQuery(query);
      } else if (provider === 'desearch') {
        data = await desearchQuery(query);
      }
      
      return {
        source: provider,
        data,
        latencyMs: Date.now() - startTime,
      } as BittensorQueryResult;
    } catch (error) {
      return {
        source: provider,
        data: null,
        latencyMs: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      } as BittensorQueryResult;
    }
  });
  
  return Promise.all(promises);
}

// Format Vanta/Desearch signals for synthesis
export function formatBittensorContext(results: BittensorQueryResult[]): string {
  const contexts: string[] = [];
  
  for (const result of results) {
    if (result.error) continue;
    
    if (result.source === 'vanta' && result.data) {
      contexts.push(`[VANTASIGNALS]${JSON.stringify(result.data)}[/VANTASIGNALS]`);
    } else if (result.source === 'desearch' && result.data) {
      contexts.push(`[DESEARCH_SENTIMENT]${JSON.stringify(result.data)}[/DESEARCH_SENTIMENT]`);
    }
  }
  
  return contexts.length > 0 
    ? `\n\nAdditional Market Context:\n${contexts.join('\n')}`
    : '';
}
