/**
 * Vanta Provider (SN8)
 * Trading signals and market signals from Taoshi
 * 
 * Vanta provides actionable trading signals based on:
 * - On-chain data
 * - Market sentiment
 * - Technical indicators
 * - Whale activity
 * 
 * API: https://bittensor-api.taoshi.ai/v1
 */

export interface VantaSignal {
  ticker: string;
  signal: 'bullish' | 'bearish' | 'neutral';
  confidence: number; // 0-1
  reason: string;
  timeframe: 'short' | 'medium' | 'long';
  timestamp: string;
}

export interface VantaResponse {
  signals: VantaSignal[];
  marketRegime?: 'bull' | 'bear' | 'sideways';
  overallSentiment: number; // -1 to 1
}

// Provider config
const VANTA_CONFIG = {
  apiUrl: 'https://bittensor-api.taoshi.ai/v1',
  subnet: 8,
};

/**
 * Check if Vanta is configured
 */
export function isVantaConfigured(): boolean {
  return !!process.env.VANTA_API_KEY;
}

/**
 * Get Vanta API key
 */
function getApiKey(): string {
  const apiKey = process.env.VANTA_API_KEY;
  if (!apiKey) {
    throw new Error('VANTA_API_KEY environment variable not set');
  }
  return apiKey;
}

/**
 * Query Vanta for trading signals
 */
export async function vantaQuery(
  ticker: string,
  options?: {
    timeframe?: 'short' | 'medium' | 'long';
  }
): Promise<VantaSignal | null> {
  if (!isVantaConfigured()) {
    console.warn('[Vanta] Not configured - returning null');
    return null;
  }

  const startTime = Date.now();
  
  try {
    const response = await fetch(`${VANTA_CONFIG.apiUrl}/signal`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getApiKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ticker: ticker.toUpperCase(),
        timeframe: options?.timeframe || 'medium',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.warn(`[Vanta] API error: ${error}`);
      return null;
    }

    const data = await response.json();
    
    return {
      ticker: data.ticker || ticker.toUpperCase(),
      signal: data.signal || 'neutral',
      confidence: data.confidence || 0.5,
      reason: data.reason || 'No reason provided',
      timeframe: data.timeframe || 'medium',
      timestamp: data.timestamp || new Date().toISOString(),
    } as VantaSignal;
  } catch (error) {
    console.warn(`[Vanta] Query failed: ${error}`);
    return null;
  }
}

/**
 * Get market regime and overall sentiment
 */
export async function vantaMarketContext(): Promise<VantaResponse | null> {
  if (!isVantaConfigured()) {
    return null;
  }

  try {
    const response = await fetch(`${VANTA_CONFIG.apiUrl}/market`, {
      headers: {
        'Authorization': `Bearer ${getApiKey()}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.warn(`[Vanta] Market context failed: ${error}`);
    return null;
  }
}

/**
 * Batch query for multiple tickers
 */
export async function vantaBatchQuery(
  tickers: string[]
): Promise<Map<string, VantaSignal | null>> {
  const results = new Map<string, VantaSignal | null>();
  
  // Process in parallel with concurrency limit
  const concurrency = 5;
  for (let i = 0; i < tickers.length; i += concurrency) {
    const batch = tickers.slice(i, i + concurrency);
    const promises = batch.map(async (ticker) => {
      const signal = await vantaQuery(ticker);
      return { ticker, signal };
    });
    
    const batchResults = await Promise.all(promises);
    batchResults.forEach(({ ticker, signal }) => {
      results.set(ticker, signal);
    });
  }
  
  return results;
}

/**
 * Format Vanta signal for Oracle context
 */
export function formatVantaSignal(signal: VantaSignal): string {
  const emoji = signal.signal === 'bullish' ? '🟢' : signal.signal === 'bearish' ? '🔴' : '⚪';
  return `${emoji} ${signal.ticker}: ${signal.signal.toUpperCase()} (${Math.round(signal.confidence * 100)}% confidence) - ${signal.reason}`;
}
