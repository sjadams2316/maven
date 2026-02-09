import { NextRequest, NextResponse } from 'next/server';

/**
 * Stock Quote API — Bulletproof Version
 * Fetches real-time stock/fund/crypto prices with graceful degradation
 * 
 * Error handling strategy:
 * - Validate input early with helpful messages
 * - Try multiple sources (CoinGecko → Yahoo chart → Yahoo quote)
 * - Fall back to cached/known prices for major symbols
 * - Return structured errors with hints for users
 * 
 * GET /api/stock-quote?symbol=VOO
 * Returns: { symbol, name, price, change, changePercent, isLive, source }
 */

// Known crypto tickers mapped to CoinGecko IDs
const CRYPTO_MAP: Record<string, { id: string; name: string }> = {
  'BTC': { id: 'bitcoin', name: 'Bitcoin' },
  'ETH': { id: 'ethereum', name: 'Ethereum' },
  'TAO': { id: 'bittensor', name: 'Bittensor' },
  'SOL': { id: 'solana', name: 'Solana' },
  'ADA': { id: 'cardano', name: 'Cardano' },
  'DOT': { id: 'polkadot', name: 'Polkadot' },
  'AVAX': { id: 'avalanche-2', name: 'Avalanche' },
  'MATIC': { id: 'matic-network', name: 'Polygon' },
  'LINK': { id: 'chainlink', name: 'Chainlink' },
  'UNI': { id: 'uniswap', name: 'Uniswap' },
  'ATOM': { id: 'cosmos', name: 'Cosmos' },
  'XRP': { id: 'ripple', name: 'XRP' },
  'DOGE': { id: 'dogecoin', name: 'Dogecoin' },
  'SHIB': { id: 'shiba-inu', name: 'Shiba Inu' },
  'LTC': { id: 'litecoin', name: 'Litecoin' },
  'BCH': { id: 'bitcoin-cash', name: 'Bitcoin Cash' },
  'XLM': { id: 'stellar', name: 'Stellar' },
  'ALGO': { id: 'algorand', name: 'Algorand' },
  'FIL': { id: 'filecoin', name: 'Filecoin' },
  'ICP': { id: 'internet-computer', name: 'Internet Computer' },
  'NEAR': { id: 'near', name: 'NEAR Protocol' },
  'APT': { id: 'aptos', name: 'Aptos' },
  'ARB': { id: 'arbitrum', name: 'Arbitrum' },
  'OP': { id: 'optimism', name: 'Optimism' },
};

// Fallback prices for common symbols (updated 2024-02 — used when APIs fail)
const FALLBACK_PRICES: Record<string, { name: string; price: number; change: number; changePercent: number }> = {
  // Major ETFs
  'SPY': { name: 'SPDR S&P 500 ETF', price: 605.23, change: 2.41, changePercent: 0.40 },
  'QQQ': { name: 'Invesco QQQ Trust', price: 528.47, change: 3.18, changePercent: 0.61 },
  'DIA': { name: 'SPDR Dow Jones Industrial', price: 447.82, change: 0.89, changePercent: 0.20 },
  'IWM': { name: 'iShares Russell 2000 ETF', price: 224.56, change: 1.12, changePercent: 0.50 },
  'VOO': { name: 'Vanguard S&P 500 ETF', price: 555.20, change: 2.22, changePercent: 0.40 },
  'VTI': { name: 'Vanguard Total Stock Market', price: 289.45, change: 1.16, changePercent: 0.40 },
  'VGT': { name: 'Vanguard Information Technology', price: 608.30, change: 4.26, changePercent: 0.70 },
  'VNQ': { name: 'Vanguard Real Estate ETF', price: 89.20, change: 0.27, changePercent: 0.30 },
  'BND': { name: 'Vanguard Total Bond Market', price: 72.45, change: 0.07, changePercent: 0.10 },
  'AGG': { name: 'iShares Core US Aggregate Bond', price: 98.30, change: 0.10, changePercent: 0.10 },
  // Major stocks
  'AAPL': { name: 'Apple Inc.', price: 225.00, change: 1.80, changePercent: 0.81 },
  'MSFT': { name: 'Microsoft Corporation', price: 415.00, change: 2.91, changePercent: 0.71 },
  'GOOGL': { name: 'Alphabet Inc.', price: 175.50, change: 1.05, changePercent: 0.60 },
  'AMZN': { name: 'Amazon.com Inc.', price: 228.00, change: 2.05, changePercent: 0.91 },
  'NVDA': { name: 'NVIDIA Corporation', price: 870.00, change: 13.05, changePercent: 1.52 },
  'META': { name: 'Meta Platforms Inc.', price: 630.00, change: 5.67, changePercent: 0.91 },
  'TSLA': { name: 'Tesla Inc.', price: 390.00, change: 7.02, changePercent: 1.83 },
  // Crypto (approximate)
  'BTC': { name: 'Bitcoin', price: 97500, change: 1462.50, changePercent: 1.52 },
  'ETH': { name: 'Ethereum', price: 2650, change: 39.75, changePercent: 1.52 },
  'SOL': { name: 'Solana', price: 200, change: 4.00, changePercent: 2.04 },
  'TAO': { name: 'Bittensor', price: 480, change: 14.40, changePercent: 3.09 },
};

// Validate symbol format
function isValidSymbol(symbol: string): boolean {
  // Allow 1-10 chars, letters/numbers/dots/hyphens (e.g., BRK.B, BTC-USD)
  return /^[A-Z0-9.\-]{1,10}$/i.test(symbol);
}

// Structured error response
function errorResponse(
  code: string,
  error: string,
  message: string,
  hint: string,
  status: number = 400
) {
  return NextResponse.json({
    error,
    message,
    code,
    hint,
    isLive: false,
  }, { status });
}

// Fetch crypto price from CoinGecko
async function fetchCryptoPrice(symbol: string): Promise<{
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
} | null> {
  const crypto = CRYPTO_MAP[symbol];
  if (!crypto) return null;
  
  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${crypto.id}&vs_currencies=usd&include_24hr_change=true`;
    
    const response = await fetch(url, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000), // 5s timeout
    });
    
    if (!response.ok) {
      console.error(`CoinGecko error for ${symbol}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    const coinData = data[crypto.id];
    
    if (!coinData?.usd) return null;
    
    const price = coinData.usd;
    const changePercent = coinData.usd_24h_change || 0;
    const change = (price * changePercent) / 100;
    
    return {
      name: crypto.name,
      price,
      change24h: change,
      changePercent24h: changePercent,
    };
  } catch (error) {
    console.error('CoinGecko fetch error:', error);
    return null;
  }
}

interface YahooQuoteResult {
  symbol: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  quoteType?: string;
}

// Fetch from Yahoo Finance chart API
async function fetchYahooChart(symbol: string): Promise<{
  name: string;
  price: number;
  change: number;
  changePercent: number;
  exchange?: string;
  type?: string;
} | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data.chart?.error) return null;
    
    const result = data.chart?.result?.[0];
    if (!result?.meta) return null;
    
    const meta = result.meta;
    const price = meta.regularMarketPrice || meta.previousClose;
    const previousClose = meta.chartPreviousClose || meta.previousClose;
    
    if (!price || price <= 0) return null;
    
    const change = price - previousClose;
    const changePercent = previousClose ? (change / previousClose) * 100 : 0;
    
    return {
      name: meta.shortName || meta.longName || symbol,
      price,
      change,
      changePercent,
      exchange: meta.exchangeName,
      type: meta.instrumentType,
    };
  } catch (error) {
    console.error('Yahoo chart error:', error);
    return null;
  }
}

// Fetch from Yahoo Finance quote API (fallback)
async function fetchYahooQuote(symbol: string): Promise<{
  name: string;
  price: number;
  change: number;
  changePercent: number;
  type?: string;
} | null> {
  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const quote = data.quoteResponse?.result?.[0] as YahooQuoteResult | undefined;
    
    if (!quote?.regularMarketPrice) return null;
    
    return {
      name: quote.shortName || quote.longName || symbol,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange || 0,
      changePercent: quote.regularMarketChangePercent || 0,
      type: quote.quoteType,
    };
  } catch (error) {
    console.error('Yahoo quote error:', error);
    return null;
  }
}

// Get fallback data for a symbol
function getFallback(symbol: string): {
  name: string;
  price: number;
  change: number;
  changePercent: number;
} | null {
  const fallback = FALLBACK_PRICES[symbol];
  if (fallback) {
    return {
      name: fallback.name,
      price: fallback.price,
      change: fallback.change,
      changePercent: fallback.changePercent,
    };
  }
  return null;
}

export async function GET(request: NextRequest) {
  // Extract and validate symbol
  const rawSymbol = request.nextUrl.searchParams.get('symbol') 
    || request.nextUrl.searchParams.get('ticker'); // Support both param names
  
  if (!rawSymbol) {
    return errorResponse(
      'MISSING_SYMBOL',
      'Symbol required',
      'Please provide a stock ticker or crypto symbol.',
      'Add ?symbol=AAPL or ?symbol=BTC to your request'
    );
  }
  
  const symbol = rawSymbol.toUpperCase().trim();
  
  // Validate format
  if (!isValidSymbol(symbol)) {
    return errorResponse(
      'INVALID_SYMBOL',
      'Invalid symbol format',
      `"${rawSymbol}" doesn't look like a valid ticker symbol.`,
      'Ticker symbols are typically 1-5 letters (e.g., AAPL, VOO, BTC)'
    );
  }
  
  // Special case: CASH
  if (symbol === 'CASH' || symbol === 'USD') {
    return NextResponse.json({
      symbol: 'CASH',
      name: 'Cash (USD)',
      price: 1.00,
      change: 0,
      changePercent: 0,
      currency: 'USD',
      type: 'CASH',
      source: 'static',
      isLive: true,
    });
  }
  
  let result: {
    name: string;
    price: number;
    change: number;
    changePercent: number;
    exchange?: string;
    type?: string;
  } | null = null;
  let source = 'unknown';
  let isLive = true;
  
  // 1. Check if it's a known crypto — try CoinGecko first
  if (CRYPTO_MAP[symbol]) {
    const cryptoData = await fetchCryptoPrice(symbol);
    
    if (cryptoData) {
      return NextResponse.json({
        symbol,
        name: cryptoData.name,
        price: cryptoData.price,
        change: cryptoData.change24h,
        changePercent: cryptoData.changePercent24h,
        currency: 'USD',
        type: 'CRYPTOCURRENCY',
        source: 'coingecko',
        isLive: true,
      });
    }
    // CoinGecko failed, try fallback for crypto
    const fallback = getFallback(symbol);
    if (fallback) {
      return NextResponse.json({
        symbol,
        name: fallback.name,
        price: fallback.price,
        change: fallback.change,
        changePercent: fallback.changePercent,
        currency: 'USD',
        type: 'CRYPTOCURRENCY',
        source: 'fallback',
        isLive: false,
        warning: 'Price may be delayed — using cached data',
      });
    }
  }
  
  // 2. Try Yahoo Finance chart API
  result = await fetchYahooChart(symbol);
  if (result) {
    source = 'yahoo-chart';
  }
  
  // 3. Try Yahoo Finance quote API (fallback)
  if (!result) {
    result = await fetchYahooQuote(symbol);
    if (result) {
      source = 'yahoo-quote';
    }
  }
  
  // 4. Try fallback data for known symbols
  if (!result) {
    const fallback = getFallback(symbol);
    if (fallback) {
      result = fallback;
      source = 'fallback';
      isLive = false;
    }
  }
  
  // 5. If still no data, return helpful error
  if (!result) {
    // Check if it might be a typo or different exchange
    const similarSymbols = Object.keys(FALLBACK_PRICES).filter(s => 
      s.includes(symbol.slice(0, 2)) || symbol.includes(s.slice(0, 2))
    ).slice(0, 3);
    
    const hint = similarSymbols.length > 0
      ? `Did you mean: ${similarSymbols.join(', ')}? Or try searching on the holdings page.`
      : 'Double-check the ticker symbol or try searching on the holdings page.';
    
    return errorResponse(
      'SYMBOL_NOT_FOUND',
      'Symbol not found',
      `We couldn't find data for "${symbol}". This might be an invalid ticker or temporarily unavailable.`,
      hint,
      404
    );
  }
  
  // Success response
  return NextResponse.json({
    symbol,
    name: result.name,
    price: result.price,
    change: result.change,
    changePercent: result.changePercent,
    currency: 'USD',
    exchange: result.exchange,
    type: result.type,
    source,
    isLive,
    ...(isLive ? {} : { warning: 'Price may be delayed — using cached data' }),
  });
}

// Batch quotes endpoint (POST)
export async function POST(request: NextRequest) {
  let body: { symbols?: string[] };
  
  // Parse request body with specific error handling
  try {
    body = await request.json();
  } catch {
    return errorResponse(
      'INVALID_JSON',
      'Invalid request body',
      'Could not parse the request. Please send valid JSON.',
      'Request body should be: {"symbols": ["AAPL", "GOOGL"]}'
    );
  }
  
  const { symbols } = body;
  
  if (!symbols || !Array.isArray(symbols)) {
    return errorResponse(
      'MISSING_SYMBOLS',
      'Symbols array required',
      'Please provide an array of ticker symbols.',
      'Send {"symbols": ["AAPL", "VOO", "BTC"]}'
    );
  }
  
  if (symbols.length === 0) {
    return errorResponse(
      'EMPTY_SYMBOLS',
      'No symbols provided',
      'The symbols array is empty.',
      'Send at least one symbol: {"symbols": ["AAPL"]}'
    );
  }
  
  // Limit to 50 symbols
  const limitedSymbols = symbols
    .slice(0, 50)
    .map(s => (typeof s === 'string' ? s.toUpperCase().trim() : ''))
    .filter(s => isValidSymbol(s));
  
  if (limitedSymbols.length === 0) {
    return errorResponse(
      'NO_VALID_SYMBOLS',
      'No valid symbols',
      'None of the provided symbols were valid.',
      'Ticker symbols should be 1-10 letters/numbers (e.g., AAPL, VOO)'
    );
  }
  
  // Separate crypto and stock symbols
  const cryptoSymbols = limitedSymbols.filter(s => CRYPTO_MAP[s]);
  const stockSymbols = limitedSymbols.filter(s => !CRYPTO_MAP[s]);
  
  const results: Record<string, { 
    name: string; 
    price: number; 
    change: number; 
    changePercent: number;
    isLive: boolean;
    source: string;
  }> = {};
  const errors: string[] = [];
  
  // Fetch crypto prices from CoinGecko (batched)
  if (cryptoSymbols.length > 0) {
    try {
      const ids = cryptoSymbols.map(s => CRYPTO_MAP[s]?.id).filter(Boolean).join(',');
      if (ids) {
        const cryptoResponse = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
          { 
            next: { revalidate: 60 },
            signal: AbortSignal.timeout(5000),
          }
        );
        
        if (cryptoResponse.ok) {
          const cryptoData = await cryptoResponse.json();
          
          for (const symbol of cryptoSymbols) {
            const crypto = CRYPTO_MAP[symbol];
            if (crypto && cryptoData[crypto.id]?.usd) {
              const coinData = cryptoData[crypto.id];
              const price = coinData.usd;
              const changePercent = coinData.usd_24h_change || 0;
              
              results[symbol] = {
                name: crypto.name,
                price,
                change: (price * changePercent) / 100,
                changePercent,
                isLive: true,
                source: 'coingecko',
              };
            } else {
              // Use fallback for this crypto
              const fallback = getFallback(symbol);
              if (fallback) {
                results[symbol] = { ...fallback, isLive: false, source: 'fallback' };
              } else {
                errors.push(symbol);
              }
            }
          }
        } else {
          // CoinGecko failed — use fallbacks
          for (const symbol of cryptoSymbols) {
            const fallback = getFallback(symbol);
            if (fallback) {
              results[symbol] = { ...fallback, isLive: false, source: 'fallback' };
            } else {
              errors.push(symbol);
            }
          }
        }
      }
    } catch (error) {
      console.error('CoinGecko batch error:', error);
      // Use fallbacks for all crypto
      for (const symbol of cryptoSymbols) {
        const fallback = getFallback(symbol);
        if (fallback) {
          results[symbol] = { ...fallback, isLive: false, source: 'fallback' };
        } else {
          errors.push(symbol);
        }
      }
    }
  }
  
  // Fetch stock prices from Yahoo Finance (batched)
  if (stockSymbols.length > 0) {
    try {
      const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(stockSymbols.join(','))}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(8000),
      });
      
      if (response.ok) {
        const data = await response.json();
        const quotes = data.quoteResponse?.result || [];
        const foundSymbols = new Set<string>();
        
        for (const quote of quotes as YahooQuoteResult[]) {
          if (quote.symbol && quote.regularMarketPrice) {
            foundSymbols.add(quote.symbol);
            results[quote.symbol] = {
              name: quote.shortName || quote.longName || quote.symbol,
              price: quote.regularMarketPrice,
              change: quote.regularMarketChange || 0,
              changePercent: quote.regularMarketChangePercent || 0,
              isLive: true,
              source: 'yahoo',
            };
          }
        }
        
        // Check for missing symbols and use fallbacks
        for (const symbol of stockSymbols) {
          if (!foundSymbols.has(symbol)) {
            const fallback = getFallback(symbol);
            if (fallback) {
              results[symbol] = { ...fallback, isLive: false, source: 'fallback' };
            } else {
              errors.push(symbol);
            }
          }
        }
      } else {
        // Yahoo failed — use fallbacks
        for (const symbol of stockSymbols) {
          const fallback = getFallback(symbol);
          if (fallback) {
            results[symbol] = { ...fallback, isLive: false, source: 'fallback' };
          } else {
            errors.push(symbol);
          }
        }
      }
    } catch (error) {
      console.error('Yahoo batch error:', error);
      // Use fallbacks for all stocks
      for (const symbol of stockSymbols) {
        const fallback = getFallback(symbol);
        if (fallback) {
          results[symbol] = { ...fallback, isLive: false, source: 'fallback' };
        } else {
          errors.push(symbol);
        }
      }
    }
  }
  
  // Count live vs delayed
  const liveCount = Object.values(results).filter(r => r.isLive).length;
  const totalCount = Object.keys(results).length;
  
  return NextResponse.json({ 
    quotes: results,
    timestamp: new Date().toISOString(),
    stats: {
      requested: limitedSymbols.length,
      found: totalCount,
      live: liveCount,
      delayed: totalCount - liveCount,
      notFound: errors.length,
    },
    ...(errors.length > 0 ? { notFound: errors } : {}),
  });
}
