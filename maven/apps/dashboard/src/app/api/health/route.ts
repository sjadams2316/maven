/**
 * Health Check Endpoint
 * 
 * Monitors:
 * - Cache health (Redis or memory)
 * - Market data freshness
 * - API provider status
 * 
 * Used by: Heartbeat monitoring, uptime checks, debugging
 */

import { NextResponse } from 'next/server';
import { cacheHealth, getMarketPrices } from '@/lib/cache';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    cache: {
      status: 'ok' | 'degraded' | 'error';
      type: 'redis' | 'memory';
      latencyMs?: number;
      error?: string;
    };
    marketData: {
      status: 'ok' | 'stale' | 'missing';
      source?: string;
      ageSeconds?: number;
      symbols?: string[];
    };
    providers: {
      fmp: 'configured' | 'missing';
      polygon: 'configured' | 'missing';
      coingecko: 'available';
    };
  };
  alerts: string[];
}

export async function GET() {
  const alerts: string[] = [];
  
  // Check cache health
  const cache = await cacheHealth();
  const cacheStatus = cache.available 
    ? (cache.type === 'redis' ? 'ok' : 'degraded')
    : 'error';
  
  if (cache.type === 'memory') {
    alerts.push('CACHE: Using in-memory fallback (data may be lost on restart)');
  }
  if (!cache.available) {
    alerts.push('CACHE: Redis unavailable');
  }

  // Check market data freshness
  const prices = await getMarketPrices();
  let marketStatus: 'ok' | 'stale' | 'missing' = 'missing';
  let marketAge: number | undefined;
  let marketSymbols: string[] = [];
  
  if (prices) {
    const symbols = Object.keys(prices);
    marketSymbols = symbols;
    
    // Find oldest price
    const timestamps = Object.values(prices).map(p => p.timestamp);
    const oldest = Math.min(...timestamps);
    marketAge = Math.round((Date.now() - oldest) / 1000);
    
    // Check freshness
    const FIVE_MINUTES = 5 * 60;
    const ONE_HOUR = 60 * 60;
    
    if (marketAge < FIVE_MINUTES) {
      marketStatus = 'ok';
    } else if (marketAge < ONE_HOUR) {
      marketStatus = 'stale';
      alerts.push(`MARKET DATA: Prices are ${Math.round(marketAge / 60)} minutes old`);
    } else {
      marketStatus = 'stale';
      alerts.push(`MARKET DATA: Prices are ${Math.round(marketAge / 3600)} hours old (CRITICAL)`);
    }
  } else {
    alerts.push('MARKET DATA: No cached prices available');
  }

  // Check provider configuration
  const providers = {
    fmp: process.env.FMP_API_KEY ? 'configured' : 'missing',
    polygon: process.env.POLYGON_API_KEY ? 'configured' : 'missing',
    coingecko: 'available' as const, // Free API, always available
  };
  
  if (providers.fmp === 'missing') {
    alerts.push('PROVIDER: FMP API key not configured');
  }

  // Determine overall status
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  
  if (alerts.length > 0) {
    overallStatus = 'degraded';
  }
  if (cacheStatus === 'error' || marketStatus === 'missing') {
    overallStatus = 'unhealthy';
  }
  if (marketAge && marketAge > 3600) {
    overallStatus = 'unhealthy';
  }

  const response: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    checks: {
      cache: {
        status: cacheStatus,
        type: cache.type,
        latencyMs: cache.latencyMs,
        error: cache.error,
      },
      marketData: {
        status: marketStatus,
        ageSeconds: marketAge,
        symbols: marketSymbols,
      },
      providers: providers as HealthStatus['checks']['providers'],
    },
    alerts,
  };

  // Return appropriate status code
  const statusCode = overallStatus === 'healthy' ? 200 
    : overallStatus === 'degraded' ? 200 
    : 503;

  return NextResponse.json(response, { status: statusCode });
}
