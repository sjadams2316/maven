import { NextRequest, NextResponse } from 'next/server';

const STOCK_SYMBOLS = ['SPY', 'QQQ', 'DIA', 'IWM'];

const STOCK_NAMES: Record<string, string> = {
  SPY: 'S&P 500',
  QQQ: 'Nasdaq 100',
  DIA: 'Dow Jones',
  IWM: 'Russell 2000',
};

// Fallback prices (updated periodically) - shown when live data unavailable
// These represent approximate market close values and are marked as "delayed"
const FALLBACK_PRICES: Record<string, { price: number; change: number; changePercent: number }> = {
  SPY: { price: 605.23, change: 2.41, changePercent: 0.40 },
  QQQ: { price: 528.47, change: 3.18, changePercent: 0.61 },
  DIA: { price: 447.82, change: 0.89, changePercent: 0.20 },
  IWM: { price: 224.56, change: 1.12, changePercent: 0.50 },
};

// Crypto fallback prices - used when CoinGecko is unavailable
// Updated: Feb 10, 2026 - Update these periodically to keep fallbacks reasonable
const CRYPTO_FALLBACK: Record<string, { price: number; change: number; changePercent: number }> = {
  BTC: { price: 69000, change: -1700, changePercent: -2.4 },
  TAO: { price: 154, change: -7, changePercent: -4.5 },
};

export async function GET(request: NextRequest) {
  // Get base URL from the request for internal API calls
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  
  let isLiveData = true;
  
  try {
    // Fetch stocks using FMP (Financial Modeling Prep) - works reliably
    const FMP_API_KEY = process.env.FMP_API_KEY;
    
    let stockData: { symbol: string; name: string; price: number; change: number; changePercent: number }[] = [];
    
    if (FMP_API_KEY) {
      try {
        // FMP batch quote endpoint
        const symbolList = STOCK_SYMBOLS.join(',');
        const fmpResponse = await fetch(
          `https://financialmodelingprep.com/api/v3/quote/${symbolList}?apikey=${FMP_API_KEY}`,
          { cache: 'no-store' }
        );
        
        if (fmpResponse.ok) {
          const fmpData = await fmpResponse.json();
          
          if (Array.isArray(fmpData) && fmpData.length > 0) {
            stockData = fmpData.map((quote: {
              symbol: string;
              price: number;
              previousClose: number;
              change: number;
              changesPercentage: number;
            }) => ({
              symbol: quote.symbol,
              name: STOCK_NAMES[quote.symbol] || quote.symbol,
              price: quote.price || 0,
              change: quote.change || 0,
              changePercent: quote.changesPercentage || 0,
            }));
          }
        } else {
          console.error('FMP API error:', await fmpResponse.text());
        }
      } catch (err) {
        console.error('FMP fetch error:', err);
      }
    }
    
    // If FMP failed, fall back to internal stock-quote API calls
    if (stockData.length === 0 || stockData.every(s => s.price === 0)) {
      console.log('FMP failed, trying internal stock-quote API at:', baseUrl);
      stockData = await Promise.all(
        STOCK_SYMBOLS.map(async (symbol) => {
          try {
            const response = await fetch(`${baseUrl}/api/stock-quote?symbol=${symbol}`, {
              cache: 'no-store',
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.price > 0) {
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
            console.error(`Stock quote failed for ${symbol}:`, err);
          }
          return { symbol, name: STOCK_NAMES[symbol], price: 0, change: 0, changePercent: 0 };
        })
      );
    }

    // Log results for debugging
    const validStocks = stockData.filter(s => s.price > 0).length;
    console.log(`Market data: ${validStocks}/${STOCK_SYMBOLS.length} stocks fetched`);
    
    // If all live sources failed, use fallback data
    if (validStocks === 0) {
      console.log('All live sources failed, using fallback data');
      isLiveData = false;
      stockData = STOCK_SYMBOLS.map(symbol => ({
        symbol,
        name: STOCK_NAMES[symbol],
        price: FALLBACK_PRICES[symbol]?.price || 0,
        change: FALLBACK_PRICES[symbol]?.change || 0,
        changePercent: FALLBACK_PRICES[symbol]?.changePercent || 0,
      }));
    }

    // Fetch crypto from CoinGecko with fallback
    let cryptoData: { symbol: string; name: string; price: number; change: number; changePercent: number }[] = [];
    let cryptoLive = true;
    try {
      const cryptoResponse = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,bittensor&vs_currencies=usd&include_24hr_change=true',
        { 
          headers: { 'Accept': 'application/json' },
          cache: 'no-store',
          signal: AbortSignal.timeout(5000), // 5 second timeout
        }
      );
      
      if (cryptoResponse.ok) {
        const crypto = await cryptoResponse.json();
        if (crypto.bitcoin?.usd) {
          cryptoData = [
            {
              symbol: 'BTC',
              name: 'Bitcoin',
              price: crypto.bitcoin?.usd || 0,
              change: (crypto.bitcoin?.usd || 0) * (crypto.bitcoin?.usd_24h_change || 0) / 100,
              changePercent: crypto.bitcoin?.usd_24h_change || 0,
            },
            {
              symbol: 'TAO',
              name: 'Bittensor',
              price: crypto.bittensor?.usd || 0,
              change: (crypto.bittensor?.usd || 0) * (crypto.bittensor?.usd_24h_change || 0) / 100,
              changePercent: crypto.bittensor?.usd_24h_change || 0,
            },
          ];
        }
      }
    } catch (err) {
      console.error('Error fetching crypto from CoinGecko:', err);
    }
    
    // If CoinGecko failed, use fallback crypto prices
    if (cryptoData.length === 0 || cryptoData.every(c => c.price === 0)) {
      console.log('CoinGecko failed, using fallback crypto prices');
      cryptoLive = false;
      cryptoData = [
        { symbol: 'BTC', name: 'Bitcoin', ...CRYPTO_FALLBACK.BTC },
        { symbol: 'TAO', name: 'Bittensor', ...CRYPTO_FALLBACK.TAO },
      ];
    }

    return NextResponse.json({
      stocks: stockData,
      crypto: cryptoData,
      timestamp: new Date().toISOString(),
      isLive: isLiveData && cryptoLive,
    });
  } catch (err) {
    console.error('Market data API error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}
