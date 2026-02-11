/**
 * Market Data API
 * 
 * Fetches live stock and crypto prices with robust fallback chain:
 * 1. Live API (FMP for stocks, CoinGecko for crypto)
 * 2. Persistent Redis cache (survives restarts)
 * 3. In-memory cache (current request lifecycle)
 * 4. Static fallback (emergency only)
 * 
 * Goal: Users should NEVER see data more than 1 hour stale.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCachedPrice, setCachedPrice, MarketPrice } from '@/lib/cache';

// Actual index symbols (Yahoo Finance format)
const INDEX_SYMBOLS = ['^GSPC', '^DJI', '^IXIC', '^RUT'];

// Display names for indices
const INDEX_NAMES: Record<string, string> = {
  '^GSPC': 'S&P 500',
  '^DJI': 'Dow 30',
  '^IXIC': 'Nasdaq',
  '^RUT': 'Russell 2000',
};

// Clean symbols for response (without ^)
const INDEX_CLEAN_SYMBOLS: Record<string, string> = {
  '^GSPC': 'SPX',
  '^DJI': 'DJI',
  '^IXIC': 'COMP',
  '^RUT': 'RUT',
};

// Legacy ETF symbols for fallback data
const ETF_SYMBOLS = ['SPY', 'QQQ', 'DIA', 'IWM'];

// ============================================================================
// MARKET SESSION DETECTION
// All times in Eastern Time
// ============================================================================
type MarketSession = 'pre-market' | 'regular' | 'after-hours' | 'closed';

function getMarketSession(): { session: MarketSession; label: string } {
  // Get current time in Eastern Time
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
    weekday: 'short',
  });
  
  const parts = formatter.formatToParts(new Date());
  const weekday = parts.find(p => p.type === 'weekday')?.value || '';
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
  const currentMinutes = hour * 60 + minute;
  
  // Weekend - market closed
  if (weekday === 'Sat' || weekday === 'Sun') {
    return { session: 'closed', label: 'Markets Closed (Weekend)' };
  }
  
  // Pre-market: 4:00 AM - 9:30 AM ET
  const preMarketStart = 4 * 60;       // 4:00 AM = 240 minutes
  const regularOpen = 9 * 60 + 30;     // 9:30 AM = 570 minutes
  
  // Regular hours: 9:30 AM - 4:00 PM ET
  const regularClose = 16 * 60;        // 4:00 PM = 960 minutes
  
  // After-hours: 4:00 PM - 8:00 PM ET
  const afterHoursClose = 20 * 60;     // 8:00 PM = 1200 minutes
  
  if (currentMinutes >= preMarketStart && currentMinutes < regularOpen) {
    return { session: 'pre-market', label: 'Pre-Market' };
  }
  
  if (currentMinutes >= regularOpen && currentMinutes < regularClose) {
    return { session: 'regular', label: 'Markets Open' };
  }
  
  if (currentMinutes >= regularClose && currentMinutes < afterHoursClose) {
    return { session: 'after-hours', label: 'After Hours' };
  }
  
  return { session: 'closed', label: 'Markets Closed' };
}

// ============================================================================
// STATIC FALLBACKS - Emergency only, updated Feb 11, 2026
// These should RARELY be used if caching is working properly
// ============================================================================
const FALLBACK_PRICES: Record<string, { price: number; change: number; changePercent: number }> = {
  // Actual index values
  '^GSPC': { price: 6941.47, change: -0.50, changePercent: -0.01 },
  '^DJI': { price: 50121.40, change: -65.00, changePercent: -0.13 },
  '^IXIC': { price: 23066.47, change: -37.00, changePercent: -0.16 },
  '^RUT': { price: 2669.47, change: -10.00, changePercent: -0.38 },
  // ETF fallbacks (legacy)
  SPY: { price: 692.00, change: -0.10, changePercent: -0.01 },
  QQQ: { price: 613.00, change: 1.80, changePercent: 0.29 },
  DIA: { price: 501.00, change: -0.70, changePercent: -0.14 },
  IWM: { price: 264.00, change: -1.70, changePercent: -0.64 },
};

const CRYPTO_FALLBACK: Record<string, { price: number; change: number; changePercent: number }> = {
  BTC: { price: 67300, change: -1400, changePercent: -2.1 },
  TAO: { price: 145, change: -8, changePercent: -5.5 },
};

// ============================================================================
// DATA FETCHING
// ============================================================================

/**
 * Fetch actual index values from Yahoo Finance
 * Uses ^GSPC, ^DJI, ^IXIC, ^RUT for real index values (not ETFs)
 */
async function fetchIndexFromYahoo(symbol: string): Promise<MarketPrice | null> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`,
      {
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const meta = data?.chart?.result?.[0]?.meta;
    const quotes = data?.chart?.result?.[0]?.indicators?.quote?.[0];
    
    if (meta?.regularMarketPrice) {
      const price = meta.regularMarketPrice;
      // Get previous close from the first close value or chartPreviousClose
      const prevClose = meta.chartPreviousClose || meta.previousClose || (quotes?.close?.[0]) || price;
      const change = price - prevClose;
      const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;
      
      return {
        symbol,
        price,
        change,
        changePercent,
        timestamp: Date.now(),
      };
    }
  } catch (err) {
    console.error(`Yahoo index fetch error for ${symbol}:`, err instanceof Error ? err.message : err);
  }
  
  return null;
}

/**
 * Fetch extended hours data from Polygon.io
 * Polygon provides pre-market and after-hours data from 4 AM to 8 PM ET
 */
async function fetchFromPolygon(symbols: string[]): Promise<Map<string, MarketPrice>> {
  const result = new Map<string, MarketPrice>();
  const apiKey = process.env.POLYGON_API_KEY;
  
  if (!apiKey) return result;
  
  try {
    // Use the aggregates endpoint with extended hours
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    for (const symbol of symbols) {
      try {
        // Previous close for comparison
        const prevCloseRes = await fetch(
          `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${apiKey}`,
          { 
            cache: 'no-store',
            signal: AbortSignal.timeout(5000),
          }
        );
        
        if (!prevCloseRes.ok) continue;
        const prevCloseData = await prevCloseRes.json();
        const prevClose = prevCloseData.results?.[0]?.c || 0;
        
        // Current price (includes extended hours)
        const snapshotRes = await fetch(
          `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}?apiKey=${apiKey}`,
          { 
            cache: 'no-store',
            signal: AbortSignal.timeout(5000),
          }
        );
        
        if (!snapshotRes.ok) continue;
        const snapshotData = await snapshotRes.json();
        
        // Use extended hours price if available, otherwise regular price
        const ticker = snapshotData.ticker;
        const price = ticker?.preMarket?.p || ticker?.afterHours?.p || ticker?.day?.c || ticker?.prevDay?.c || 0;
        
        if (price > 0 && prevClose > 0) {
          const change = price - prevClose;
          const changePercent = (change / prevClose) * 100;
          
          result.set(symbol, {
            symbol,
            price,
            change,
            changePercent,
            timestamp: Date.now(),
          });
        }
      } catch (err) {
        // Continue to next symbol
      }
    }
  } catch (err) {
    console.error('Polygon fetch error:', err instanceof Error ? err.message : err);
  }
  
  return result;
}

async function fetchFromFMP(symbols: string[]): Promise<Map<string, MarketPrice>> {
  const result = new Map<string, MarketPrice>();
  const apiKey = process.env.FMP_API_KEY;
  
  if (!apiKey) return result;
  
  try {
    const symbolList = symbols.join(',');
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/quote/${symbolList}?apikey=${apiKey}`,
      { 
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      }
    );
    
    if (!response.ok) {
      console.error(`FMP API error: ${response.status}`);
      return result;
    }
    
    const data = await response.json();
    
    if (Array.isArray(data)) {
      for (const quote of data) {
        if (quote.price > 0) {
          result.set(quote.symbol, {
            symbol: quote.symbol,
            price: quote.price,
            change: quote.change || 0,
            changePercent: quote.changesPercentage || 0,
            timestamp: Date.now(),
          });
        }
      }
    }
  } catch (err) {
    console.error('FMP fetch error:', err instanceof Error ? err.message : err);
  }
  
  return result;
}

async function fetchFromYahoo(symbol: string): Promise<MarketPrice | null> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
      {
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const meta = data?.chart?.result?.[0]?.meta;
    
    if (meta?.regularMarketPrice) {
      const price = meta.regularMarketPrice;
      const prevClose = meta.previousClose || price;
      const change = price - prevClose;
      const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;
      
      return {
        symbol,
        price,
        change,
        changePercent,
        timestamp: Date.now(),
      };
    }
  } catch (err) {
    // Silent fail, will try next source
  }
  
  return null;
}

async function fetchCrypto(): Promise<Map<string, MarketPrice>> {
  const result = new Map<string, MarketPrice>();
  
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,bittensor&vs_currencies=usd&include_24hr_change=true',
      { 
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      }
    );
    
    if (!response.ok) {
      console.error(`CoinGecko API error: ${response.status}`);
      return result;
    }
    
    const data = await response.json();
    
    if (data.bitcoin?.usd) {
      const btcPrice = data.bitcoin.usd;
      const btcChange = btcPrice * (data.bitcoin.usd_24h_change || 0) / 100;
      
      result.set('BTC', {
        symbol: 'BTC',
        price: btcPrice,
        change: btcChange,
        changePercent: data.bitcoin.usd_24h_change || 0,
        timestamp: Date.now(),
      });
    }
    
    if (data.bittensor?.usd) {
      const taoPrice = data.bittensor.usd;
      const taoChange = taoPrice * (data.bittensor.usd_24h_change || 0) / 100;
      
      result.set('TAO', {
        symbol: 'TAO',
        price: taoPrice,
        change: taoChange,
        changePercent: data.bittensor.usd_24h_change || 0,
        timestamp: Date.now(),
      });
    }
  } catch (err) {
    console.error('CoinGecko fetch error:', err instanceof Error ? err.message : err);
  }
  
  return result;
}

// ============================================================================
// MAIN API HANDLER
// ============================================================================

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const diagnostics = {
    sources: [] as string[],
    errors: [] as string[],
    cacheHits: [] as string[],
    cacheMisses: [] as string[],
  };
  
  // Get current market session
  const marketSession = getMarketSession();
  
  // Results
  const stockData: { symbol: string; name: string; price: number; change: number; changePercent: number }[] = [];
  const cryptoData: { symbol: string; name: string; price: number; change: number; changePercent: number }[] = [];
  let isLiveData = true;
  let dataSource = 'live';
  
  // ========================================================================
  // FETCH INDICES (actual index values, not ETFs)
  // ========================================================================
  
  // Fetch actual index data from Yahoo Finance
  // Yahoo is the best free source for actual index values (^GSPC, ^DJI, etc.)
  for (const symbol of INDEX_SYMBOLS) {
    let price: MarketPrice | null = await fetchIndexFromYahoo(symbol);
    
    if (price) {
      diagnostics.sources.push(`yahoo:${symbol}`);
    }
    
    // If live failed, try persistent cache
    if (!price) {
      price = await getCachedPrice(symbol);
      if (price) {
        diagnostics.cacheHits.push(symbol);
        dataSource = 'cached';
      } else {
        diagnostics.cacheMisses.push(symbol);
      }
    }
    
    // If cache failed, use static fallback
    if (!price) {
      isLiveData = false;
      dataSource = 'fallback';
      diagnostics.errors.push(`${symbol}:fallback`);
      
      price = {
        symbol,
        price: FALLBACK_PRICES[symbol]?.price || 0,
        change: FALLBACK_PRICES[symbol]?.change || 0,
        changePercent: FALLBACK_PRICES[symbol]?.changePercent || 0,
        timestamp: Date.now(),
      };
    }
    
    // Cache successful fetches
    if (price && price.timestamp === Date.now()) {
      await setCachedPrice(symbol, {
        price: price.price,
        change: price.change,
        changePercent: price.changePercent,
      });
    }
    
    stockData.push({
      symbol: INDEX_CLEAN_SYMBOLS[symbol] || symbol,
      name: INDEX_NAMES[symbol] || symbol,
      price: price.price,
      change: price.change,
      changePercent: price.changePercent,
    });
  }
  
  // ========================================================================
  // FETCH CRYPTO
  // ========================================================================
  
  const cryptoPrices = await fetchCrypto();
  
  if (cryptoPrices.size > 0) {
    diagnostics.sources.push('coingecko');
  }
  
  for (const symbol of ['BTC', 'TAO']) {
    let price: MarketPrice | null = cryptoPrices.get(symbol) || null;
    
    // Try persistent cache
    if (!price) {
      price = await getCachedPrice(symbol);
      if (price) {
        diagnostics.cacheHits.push(symbol);
        if (dataSource === 'live') dataSource = 'cached';
      } else {
        diagnostics.cacheMisses.push(symbol);
      }
    }
    
    // Use fallback
    if (!price) {
      isLiveData = false;
      dataSource = 'fallback';
      diagnostics.errors.push(`${symbol}:fallback`);
      
      price = {
        symbol,
        price: CRYPTO_FALLBACK[symbol]?.price || 0,
        change: CRYPTO_FALLBACK[symbol]?.change || 0,
        changePercent: CRYPTO_FALLBACK[symbol]?.changePercent || 0,
        timestamp: Date.now(),
      };
    }
    
    // Cache successful fetches
    if (price && price.timestamp === Date.now()) {
      await setCachedPrice(symbol, {
        price: price.price,
        change: price.change,
        changePercent: price.changePercent,
      });
    }
    
    cryptoData.push({
      symbol,
      name: symbol === 'BTC' ? 'Bitcoin' : 'Bittensor',
      price: price.price,
      change: price.change,
      changePercent: price.changePercent,
    });
  }
  
  // ========================================================================
  // LOGGING & RESPONSE
  // ========================================================================
  
  const elapsed = Date.now() - startTime;
  
  // Log for monitoring
  console.log(`Market data: source=${dataSource}, stocks=${stockData.length}, crypto=${cryptoData.length}, elapsed=${elapsed}ms, sources=[${diagnostics.sources.join(',')}]${diagnostics.errors.length > 0 ? `, errors=[${diagnostics.errors.join(',')}]` : ''}`);
  
  // Alert if using fallback (this should trigger monitoring)
  if (dataSource === 'fallback') {
    console.warn(`⚠️ MARKET DATA ALERT: Using fallback data! Errors: ${diagnostics.errors.join(', ')}`);
  }
  
  return NextResponse.json({
    stocks: stockData,
    crypto: cryptoData,
    timestamp: new Date().toISOString(),
    isLive: isLiveData,
    source: dataSource,
    marketSession: marketSession.session,
    marketLabel: marketSession.label,
    // Include diagnostics in development
    ...(process.env.NODE_ENV === 'development' && { diagnostics }),
  });
}
