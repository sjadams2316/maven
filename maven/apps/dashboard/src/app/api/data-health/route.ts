/**
 * Data Health API
 * 
 * GET /api/data-health
 * Checks status of all data sources (Yahoo, CoinGecko, FRED, FMP)
 * Returns latency, last successful check, error count, overall status
 * 
 * @author Pantheon Infrastructure Team
 * @version 1.0.0
 */

import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Health status types
type SourceStatus = 'up' | 'degraded' | 'down';
type OverallStatus = 'healthy' | 'degraded' | 'down';

interface DataSourceHealth {
  status: SourceStatus;
  latencyMs: number;
  lastCheck: string;
  errorCount: number;
  lastError?: string;
  responseValid: boolean;
}

interface HealthCheckResponse {
  status: OverallStatus;
  sources: {
    yahoo: DataSourceHealth;
    coingecko: DataSourceHealth;
    fred: DataSourceHealth;
    fmp: DataSourceHealth;
  };
  staleData: string[];
  errors: string[];
  timestamp: string;
  checkDurationMs: number;
}

// Timeout for health checks (5 seconds max)
const HEALTH_CHECK_TIMEOUT = 5000;

/**
 * Check Yahoo Finance health by fetching SPY quote
 */
async function checkYahooHealth(): Promise<DataSourceHealth> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT);
    
    const response = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/SPY?interval=1d&range=1d',
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        cache: 'no-store',
      }
    );
    
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;
    
    if (!response.ok) {
      return {
        status: 'down',
        latencyMs,
        lastCheck: new Date().toISOString(),
        errorCount: 1,
        lastError: `HTTP ${response.status}: ${response.statusText}`,
        responseValid: false,
      };
    }
    
    const data = await response.json();
    const price = data.chart?.result?.[0]?.meta?.regularMarketPrice;
    
    // Validate response has expected data structure and reasonable price
    const isValid = price && price > 0 && price < 10000; // SPY sanity check
    
    if (!isValid) {
      return {
        status: 'degraded',
        latencyMs,
        lastCheck: new Date().toISOString(),
        errorCount: 0,
        lastError: 'Invalid price data received',
        responseValid: false,
      };
    }
    
    // Check for staleness (price should be from today on trading days)
    const status: SourceStatus = latencyMs > 3000 ? 'degraded' : 'up';
    
    return {
      status,
      latencyMs,
      lastCheck: new Date().toISOString(),
      errorCount: 0,
      responseValid: true,
    };
    
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      status: 'down',
      latencyMs,
      lastCheck: new Date().toISOString(),
      errorCount: 1,
      lastError: errorMessage.includes('aborted') ? 'Request timeout' : errorMessage,
      responseValid: false,
    };
  }
}

/**
 * Check CoinGecko health by fetching BTC price
 */
async function checkCoinGeckoHealth(): Promise<DataSourceHealth> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT);
    
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
      {
        signal: controller.signal,
        cache: 'no-store',
      }
    );
    
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;
    
    if (!response.ok) {
      // CoinGecko rate limits at 429
      const isRateLimited = response.status === 429;
      
      return {
        status: isRateLimited ? 'degraded' : 'down',
        latencyMs,
        lastCheck: new Date().toISOString(),
        errorCount: 1,
        lastError: isRateLimited ? 'Rate limited' : `HTTP ${response.status}`,
        responseValid: false,
      };
    }
    
    const data = await response.json();
    const price = data.bitcoin?.usd;
    const change = data.bitcoin?.usd_24h_change;
    
    // Validate response: price should be positive and change within bounds
    const isPriceValid = price && price > 0 && price < 10000000; // BTC sanity check
    const isChangeValid = change !== undefined && change > -100 && change < 500; // Reasonable 24h change
    
    if (!isPriceValid) {
      return {
        status: 'degraded',
        latencyMs,
        lastCheck: new Date().toISOString(),
        errorCount: 0,
        lastError: 'Invalid price data',
        responseValid: false,
      };
    }
    
    const status: SourceStatus = latencyMs > 3000 ? 'degraded' : 'up';
    
    return {
      status,
      latencyMs,
      lastCheck: new Date().toISOString(),
      errorCount: 0,
      responseValid: isPriceValid && isChangeValid,
    };
    
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      status: 'down',
      latencyMs,
      lastCheck: new Date().toISOString(),
      errorCount: 1,
      lastError: errorMessage.includes('aborted') ? 'Request timeout' : errorMessage,
      responseValid: false,
    };
  }
}

/**
 * Check FRED health by fetching a common indicator
 */
async function checkFredHealth(): Promise<DataSourceHealth> {
  const startTime = Date.now();
  const apiKey = process.env.FRED_API_KEY;
  
  if (!apiKey) {
    return {
      status: 'down',
      latencyMs: 0,
      lastCheck: new Date().toISOString(),
      errorCount: 1,
      lastError: 'FRED_API_KEY not configured',
      responseValid: false,
    };
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT);
    
    // Fetch 10Y-2Y Treasury spread (T10Y2Y) - a commonly used indicator
    const response = await fetch(
      `https://api.stlouisfed.org/fred/series/observations?series_id=T10Y2Y&api_key=${apiKey}&file_type=json&limit=1&sort_order=desc`,
      {
        signal: controller.signal,
        cache: 'no-store',
      }
    );
    
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;
    
    if (!response.ok) {
      return {
        status: 'down',
        latencyMs,
        lastCheck: new Date().toISOString(),
        errorCount: 1,
        lastError: `HTTP ${response.status}`,
        responseValid: false,
      };
    }
    
    const data = await response.json();
    const observation = data.observations?.[0];
    
    // Validate we got a real observation
    const hasValidData = observation && observation.value && observation.value !== '.';
    
    if (!hasValidData) {
      return {
        status: 'degraded',
        latencyMs,
        lastCheck: new Date().toISOString(),
        errorCount: 0,
        lastError: 'No valid observation data',
        responseValid: false,
      };
    }
    
    // Check for staleness - FRED data should be within last 7 days typically
    const observationDate = new Date(observation.date);
    const daysSinceUpdate = (Date.now() - observationDate.getTime()) / (1000 * 60 * 60 * 24);
    const isStale = daysSinceUpdate > 10; // Allow for weekends + holidays
    
    const status: SourceStatus = latencyMs > 3000 ? 'degraded' : isStale ? 'degraded' : 'up';
    
    return {
      status,
      latencyMs,
      lastCheck: new Date().toISOString(),
      errorCount: 0,
      lastError: isStale ? `Data is ${Math.round(daysSinceUpdate)} days old` : undefined,
      responseValid: true,
    };
    
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      status: 'down',
      latencyMs,
      lastCheck: new Date().toISOString(),
      errorCount: 1,
      lastError: errorMessage.includes('aborted') ? 'Request timeout' : errorMessage,
      responseValid: false,
    };
  }
}

/**
 * Check FMP (Financial Modeling Prep) health
 */
async function checkFmpHealth(): Promise<DataSourceHealth> {
  const startTime = Date.now();
  const apiKey = process.env.FMP_API_KEY;
  
  if (!apiKey) {
    return {
      status: 'down',
      latencyMs: 0,
      lastCheck: new Date().toISOString(),
      errorCount: 1,
      lastError: 'FMP_API_KEY not configured',
      responseValid: false,
    };
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT);
    
    // Fetch AAPL profile as a health check
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/profile/AAPL?apikey=${apiKey}`,
      {
        signal: controller.signal,
        cache: 'no-store',
      }
    );
    
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;
    
    if (!response.ok) {
      const isRateLimited = response.status === 429;
      
      return {
        status: isRateLimited ? 'degraded' : 'down',
        latencyMs,
        lastCheck: new Date().toISOString(),
        errorCount: 1,
        lastError: isRateLimited ? 'Rate limited' : `HTTP ${response.status}`,
        responseValid: false,
      };
    }
    
    const data = await response.json();
    
    // Validate response structure
    const isValid = Array.isArray(data) && data.length > 0 && data[0].symbol === 'AAPL';
    
    if (!isValid) {
      return {
        status: 'degraded',
        latencyMs,
        lastCheck: new Date().toISOString(),
        errorCount: 0,
        lastError: 'Invalid response structure',
        responseValid: false,
      };
    }
    
    const status: SourceStatus = latencyMs > 3000 ? 'degraded' : 'up';
    
    return {
      status,
      latencyMs,
      lastCheck: new Date().toISOString(),
      errorCount: 0,
      responseValid: true,
    };
    
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      status: 'down',
      latencyMs,
      lastCheck: new Date().toISOString(),
      errorCount: 1,
      lastError: errorMessage.includes('aborted') ? 'Request timeout' : errorMessage,
      responseValid: false,
    };
  }
}

/**
 * Determine overall system status based on individual sources
 */
function calculateOverallStatus(sources: HealthCheckResponse['sources']): OverallStatus {
  const statuses = Object.values(sources).map(s => s.status);
  
  // If any critical source is down, system is degraded
  const criticalSources: (keyof typeof sources)[] = ['yahoo', 'coingecko'];
  const criticalDown = criticalSources.some(key => sources[key].status === 'down');
  
  if (criticalDown) {
    return 'degraded';
  }
  
  // If all sources are down, system is down
  if (statuses.every(s => s === 'down')) {
    return 'down';
  }
  
  // If any source is degraded, system is degraded
  if (statuses.some(s => s === 'degraded')) {
    return 'degraded';
  }
  
  return 'healthy';
}

/**
 * Collect all errors from sources
 */
function collectErrors(sources: HealthCheckResponse['sources']): string[] {
  const errors: string[] = [];
  
  for (const [name, health] of Object.entries(sources)) {
    if (health.lastError && health.status !== 'up') {
      errors.push(`${name}: ${health.lastError}`);
    }
  }
  
  return errors;
}

/**
 * Identify stale data sources
 */
function identifyStaleData(sources: HealthCheckResponse['sources']): string[] {
  const stale: string[] = [];
  
  for (const [name, health] of Object.entries(sources)) {
    if (health.lastError?.includes('days old')) {
      stale.push(name);
    }
  }
  
  return stale;
}

export async function GET() {
  const startTime = Date.now();
  
  // Run all health checks in parallel
  const [yahoo, coingecko, fred, fmp] = await Promise.all([
    checkYahooHealth(),
    checkCoinGeckoHealth(),
    checkFredHealth(),
    checkFmpHealth(),
  ]);
  
  const sources = { yahoo, coingecko, fred, fmp };
  const status = calculateOverallStatus(sources);
  const errors = collectErrors(sources);
  const staleData = identifyStaleData(sources);
  
  // Log issues for monitoring
  if (status !== 'healthy') {
    console.warn('[DataHealth] System status:', status, {
      errors,
      staleData,
      sources: Object.fromEntries(
        Object.entries(sources).map(([k, v]) => [k, v.status])
      ),
    });
  }
  
  const response: HealthCheckResponse = {
    status,
    sources,
    staleData,
    errors,
    timestamp: new Date().toISOString(),
    checkDurationMs: Date.now() - startTime,
  };
  
  return NextResponse.json(response);
}
