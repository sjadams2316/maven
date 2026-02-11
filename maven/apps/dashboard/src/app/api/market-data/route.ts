import { NextRequest, NextResponse } from 'next/server';

const STOCK_SYMBOLS = ['SPY', 'QQQ', 'DIA', 'IWM'];

const STOCK_NAMES: Record<string, string> = {
  SPY: 'S&P 500',
  QQQ: 'Nasdaq 100',
  DIA: 'Dow Jones',
  IWM: 'Russell 2000',
};

// ============================================================================
// DYNAMIC CACHE: Store last known good prices in memory
// This survives between requests (within the same serverless function lifecycle)
// Much better than hardcoded fallbacks that get stale
// ============================================================================
interface PriceData {
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

const priceCache: Record<string, PriceData> = {};

function cachePrice(symbol: string, data: PriceData) {
  priceCache[symbol] = { ...data, timestamp: Date.now() };
}

function getCachedPrice(symbol: string): PriceData | null {
  const cached = priceCache[symbol];
  if (!cached) return null;
  
  // Cache is valid for 1 hour - after that, use fallback
  const ONE_HOUR = 60 * 60 * 1000;
  if (Date.now() - cached.timestamp > ONE_HOUR) {
    return null;
  }
  return cached;
}

// ============================================================================
// FALLBACK PRICES: Updated Feb 11, 2026
// Only used if: (1) live fetch fails AND (2) no cached data available
// UPDATE THESE WEEKLY or when markets move significantly (>5%)
// ============================================================================
const FALLBACK_PRICES: Record<string, { price: number; change: number; changePercent: number }> = {
  // Updated: Feb 11, 2026 3:40 PM EST
  SPY: { price: 692.00, change: -0.10, changePercent: -0.01 },
  QQQ: { price: 613.00, change: 1.80, changePercent: 0.29 },
  DIA: { price: 501.00, change: -0.70, changePercent: -0.14 },
  IWM: { price: 264.00, change: -1.70, changePercent: -0.64 },
};

const CRYPTO_FALLBACK: Record<string, { price: number; change: number; changePercent: number }> = {
  // Updated: Feb 11, 2026 3:40 PM EST
  BTC: { price: 67300, change: -1400, changePercent: -2.1 },
  TAO: { price: 145, change: -8, changePercent: -5.5 },
};

// ============================================================================
// MAIN API HANDLER
// ============================================================================
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  
  let isLiveData = true;
  let dataSource = 'live';
  const errors: string[] = [];
  
  try {
    // ========================================================================
    // FETCH STOCKS
    // ========================================================================
    const FMP_API_KEY = process.env.FMP_API_KEY;
    let stockData: { symbol: string; name: string; price: number; change: number; changePercent: number }[] = [];
    
    // Try FMP first (primary source)
    if (FMP_API_KEY) {
      try {
        const symbolList = STOCK_SYMBOLS.join(',');
        const fmpResponse = await fetch(
          `https://financialmodelingprep.com/api/v3/quote/${symbolList}?apikey=${FMP_API_KEY}`,
          { 
            cache: 'no-store',
            signal: AbortSignal.timeout(5000),
          }
        );
        
        if (fmpResponse.ok) {
          const fmpData = await fmpResponse.json();
          
          if (Array.isArray(fmpData) && fmpData.length > 0) {
            stockData = fmpData.map((quote: {
              symbol: string;
              price: number;
              change: number;
              changesPercentage: number;
            }) => {
              const data = {
                symbol: quote.symbol,
                name: STOCK_NAMES[quote.symbol] || quote.symbol,
                price: quote.price || 0,
                change: quote.change || 0,
                changePercent: quote.changesPercentage || 0,
              };
              
              // Cache successful fetches
              if (data.price > 0) {
                cachePrice(quote.symbol, {
                  price: data.price,
                  change: data.change,
                  changePercent: data.changePercent,
                  timestamp: Date.now(),
                });
              }
              
              return data;
            });
          }
        } else {
          errors.push(`FMP: ${fmpResponse.status}`);
        }
      } catch (err) {
        errors.push(`FMP: ${err instanceof Error ? err.message : 'timeout'}`);
      }
    } else {
      errors.push('FMP: No API key');
    }
    
    // If FMP failed, try internal stock-quote API
    if (stockData.length === 0 || stockData.every(s => s.price === 0)) {
      console.log('FMP failed, trying internal stock-quote API');
      stockData = await Promise.all(
        STOCK_SYMBOLS.map(async (symbol) => {
          try {
            const response = await fetch(`${baseUrl}/api/stock-quote?symbol=${symbol}`, {
              cache: 'no-store',
              signal: AbortSignal.timeout(3000),
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.price > 0) {
                // Cache successful fetches
                cachePrice(symbol, {
                  price: data.price,
                  change: data.change || 0,
                  changePercent: data.changePercent || 0,
                  timestamp: Date.now(),
                });
                
                return {
                  symbol,
                  name: STOCK_NAMES[symbol] || data.name || symbol,
                  price: data.price || 0,
                  change: data.change || 0,
                  changePercent: data.changePercent || 0,
                };
              }
            }
          } catch (err) {
            // Silent fail, will use cache/fallback
          }
          return { symbol, name: STOCK_NAMES[symbol], price: 0, change: 0, changePercent: 0 };
        })
      );
    }

    // Check what we got
    const validStocks = stockData.filter(s => s.price > 0).length;
    
    // If live failed, try cache then fallback
    if (validStocks < STOCK_SYMBOLS.length) {
      stockData = STOCK_SYMBOLS.map(symbol => {
        // Check if we got live data for this symbol
        const liveData = stockData.find(s => s.symbol === symbol && s.price > 0);
        if (liveData) return liveData;
        
        // Try cache
        const cached = getCachedPrice(symbol);
        if (cached) {
          dataSource = 'cached';
          return {
            symbol,
            name: STOCK_NAMES[symbol],
            price: cached.price,
            change: cached.change,
            changePercent: cached.changePercent,
          };
        }
        
        // Use fallback
        isLiveData = false;
        dataSource = 'fallback';
        return {
          symbol,
          name: STOCK_NAMES[symbol],
          price: FALLBACK_PRICES[symbol]?.price || 0,
          change: FALLBACK_PRICES[symbol]?.change || 0,
          changePercent: FALLBACK_PRICES[symbol]?.changePercent || 0,
        };
      });
    }

    // ========================================================================
    // FETCH CRYPTO
    // ========================================================================
    let cryptoData: { symbol: string; name: string; price: number; change: number; changePercent: number }[] = [];
    let cryptoLive = true;
    
    try {
      const cryptoResponse = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,bittensor&vs_currencies=usd&include_24hr_change=true',
        { 
          headers: { 'Accept': 'application/json' },
          cache: 'no-store',
          signal: AbortSignal.timeout(5000),
        }
      );
      
      if (cryptoResponse.ok) {
        const crypto = await cryptoResponse.json();
        if (crypto.bitcoin?.usd) {
          const btcData = {
            symbol: 'BTC',
            name: 'Bitcoin',
            price: crypto.bitcoin?.usd || 0,
            change: (crypto.bitcoin?.usd || 0) * (crypto.bitcoin?.usd_24h_change || 0) / 100,
            changePercent: crypto.bitcoin?.usd_24h_change || 0,
          };
          
          const taoData = {
            symbol: 'TAO',
            name: 'Bittensor',
            price: crypto.bittensor?.usd || 0,
            change: (crypto.bittensor?.usd || 0) * (crypto.bittensor?.usd_24h_change || 0) / 100,
            changePercent: crypto.bittensor?.usd_24h_change || 0,
          };
          
          // Cache successful fetches
          if (btcData.price > 0) {
            cachePrice('BTC', { price: btcData.price, change: btcData.change, changePercent: btcData.changePercent, timestamp: Date.now() });
          }
          if (taoData.price > 0) {
            cachePrice('TAO', { price: taoData.price, change: taoData.change, changePercent: taoData.changePercent, timestamp: Date.now() });
          }
          
          cryptoData = [btcData, taoData];
        }
      } else {
        errors.push(`CoinGecko: ${cryptoResponse.status}`);
      }
    } catch (err) {
      errors.push(`CoinGecko: ${err instanceof Error ? err.message : 'timeout'}`);
    }
    
    // If CoinGecko failed, try cache then fallback
    if (cryptoData.length === 0 || cryptoData.every(c => c.price === 0)) {
      cryptoLive = false;
      
      cryptoData = ['BTC', 'TAO'].map(symbol => {
        const cached = getCachedPrice(symbol);
        if (cached) {
          dataSource = dataSource === 'live' ? 'cached' : dataSource;
          return {
            symbol,
            name: symbol === 'BTC' ? 'Bitcoin' : 'Bittensor',
            price: cached.price,
            change: cached.change,
            changePercent: cached.changePercent,
          };
        }
        
        dataSource = 'fallback';
        return {
          symbol,
          name: symbol === 'BTC' ? 'Bitcoin' : 'Bittensor',
          ...CRYPTO_FALLBACK[symbol],
        };
      });
    }

    // Log for debugging
    console.log(`Market data: source=${dataSource}, stocks=${stockData.filter(s => s.price > 0).length}/${STOCK_SYMBOLS.length}, crypto=${cryptoData.filter(c => c.price > 0).length}/2${errors.length > 0 ? `, errors=[${errors.join(', ')}]` : ''}`);

    return NextResponse.json({
      stocks: stockData,
      crypto: cryptoData,
      timestamp: new Date().toISOString(),
      isLive: isLiveData && cryptoLive,
      source: dataSource, // Added for debugging
    });
  } catch (err) {
    console.error('Market data API error:', err);
    
    // Even on total failure, return fallback data instead of error
    return NextResponse.json({
      stocks: STOCK_SYMBOLS.map(symbol => ({
        symbol,
        name: STOCK_NAMES[symbol],
        ...FALLBACK_PRICES[symbol],
      })),
      crypto: [
        { symbol: 'BTC', name: 'Bitcoin', ...CRYPTO_FALLBACK.BTC },
        { symbol: 'TAO', name: 'Bittensor', ...CRYPTO_FALLBACK.TAO },
      ],
      timestamp: new Date().toISOString(),
      isLive: false,
      source: 'fallback',
      error: 'Live data temporarily unavailable',
    });
  }
}
