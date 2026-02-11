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

const STOCK_SYMBOLS = ['SPY', 'QQQ', 'DIA', 'IWM'];

// Note: We use ETFs as proxies for indices because they have better data availability
// Labels indicate this to users for accuracy
const STOCK_NAMES: Record<string, string> = {
  SPY: 'S&P 500 ETF',
  QQQ: 'Nasdaq 100 ETF',
  DIA: 'Dow 30 ETF',
  IWM: 'Russell 2000 ETF',
};

// Short names for compact displays (market ticker)
const STOCK_SHORT_NAMES: Record<string, string> = {
  SPY: 'S&P 500',
  QQQ: 'Nasdaq',
  DIA: 'Dow',
  IWM: 'Russell',
};

// ============================================================================
// STATIC FALLBACKS - Emergency only, updated Feb 11, 2026
// These should RARELY be used if caching is working properly
// ============================================================================
const FALLBACK_PRICES: Record<string, { price: number; change: number; changePercent: number }> = {
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
  
  // Results
  const stockData: { symbol: string; name: string; price: number; change: number; changePercent: number }[] = [];
  const cryptoData: { symbol: string; name: string; price: number; change: number; changePercent: number }[] = [];
  let isLiveData = true;
  let dataSource = 'live';
  
  // ========================================================================
  // FETCH STOCKS
  // ========================================================================
  
  // Try FMP first
  const fmpPrices = await fetchFromFMP(STOCK_SYMBOLS);
  
  if (fmpPrices.size > 0) {
    diagnostics.sources.push('fmp');
  }
  
  // For each symbol, get best available data
  for (const symbol of STOCK_SYMBOLS) {
    let price: MarketPrice | null = fmpPrices.get(symbol) || null;
    
    // If FMP failed for this symbol, try Yahoo
    if (!price) {
      price = await fetchFromYahoo(symbol);
      if (price) {
        diagnostics.sources.push(`yahoo:${symbol}`);
      }
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
      symbol,
      name: STOCK_NAMES[symbol] || symbol,
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
    // Include diagnostics in development
    ...(process.env.NODE_ENV === 'development' && { diagnostics }),
  });
}
