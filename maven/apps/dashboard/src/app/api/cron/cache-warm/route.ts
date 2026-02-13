/**
 * Cache Warming Endpoint
 * 
 * GET /api/cron/cache-warm
 * 
 * Public endpoint for cron jobs to warm the market data cache.
 * Returns minimal data - just what's needed to populate cache.
 * No authentication required (data is public market prices).
 * 
 * Rate limited: 1 request per minute max
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCachedPrice, setCachedPrice } from '@/lib/cache';

const CRYPTO_SYMBOLS = ['BTC', 'TAO'];
const INDEX_SYMBOLS = ['^GSPC', '^DJI', '^IXIC', '^RUT'];

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Simple rate limiting (in-memory, resets on server restart)
const lastWarmTimes = new Map<string, number>();
const RATE_LIMIT_MS = 60000; // 1 minute

export async function GET(request: NextRequest) {
  const now = Date.now();
  
  // Rate limit by IP
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const lastWarm = lastWarmTimes.get(ip) || 0;
  
  if (now - lastWarm < RATE_LIMIT_MS) {
    return NextResponse.json(
      { error: 'Rate limited. Try again in 1 minute.' },
      { status: 429 }
    );
  }
  
  lastWarmTimes.set(ip, now);
  
  try {
    // Fetch crypto prices from CoinGecko
    const cryptoResponse = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,bittensor&vs_currencies=usd&include_24hr_change=true',
      { cache: 'no-store', signal: AbortSignal.timeout(5000) }
    );
    
    if (cryptoResponse.ok) {
      const data = await cryptoResponse.json();
      
      if (data.bitcoin?.usd) {
        const btc = data.bitcoin;
        await setCachedPrice('BTC', {
          price: btc.usd,
          change: btc.usd * (btc.usd_24h_change || 0) / 100,
          changePercent: btc.usd_24h_change || 0,
        });
      }
      
      if (data.bittensor?.usd) {
        const tao = data.bittensor;
        await setCachedPrice('TAO', {
          price: tao.usd,
          change: tao.usd * (tao.usd_24h_change || 0) / 100,
          changePercent: tao.usd_24h_change || 0,
        });
      }
    }
    
    // Fetch index data from Yahoo (with rate limit handling)
    for (const symbol of INDEX_SYMBOLS) {
      try {
        const yahooResponse = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`,
          {
            cache: 'no-store',
            signal: AbortSignal.timeout(3000),
            headers: { 'User-Agent': 'Mozilla/5.0' },
          }
        );
        
        if (yahooResponse.ok) {
          const ydata = await yahooResponse.json();
          const meta = ydata?.chart?.result?.[0]?.meta;
          
          if (meta?.regularMarketPrice) {
            const price = meta.regularMarketPrice;
            const prevClose = meta.previousClose || price;
            const change = price - prevClose;
            const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;
            
            await setCachedPrice(symbol, { price, change, changePercent });
          }
        }
      } catch {
        // Continue to next symbol on error
      }
    }
    
    // Return what's cached
    const cacheStatus = {
      BTC: await getCachedPrice('BTC'),
      TAO: await getCachedPrice('TAO'),
      '^GSPC': await getCachedPrice('^GSPC'),
      '^DJI': await getCachedPrice('^DJI'),
      '^IXIC': await getCachedPrice('^IXIC'),
      '^RUT': await getCachedPrice('^RUT'),
    };
    
    return NextResponse.json({
      success: true,
      cached: cacheStatus,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to warm cache', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
