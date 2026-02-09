import { NextRequest, NextResponse } from 'next/server';

/**
 * Stock Quote API
 * Fetches real-time stock/fund/crypto prices
 * - Crypto: Uses CoinGecko for accurate prices
 * - Stocks/Funds: Uses Yahoo Finance
 * 
 * GET /api/stock-quote?symbol=VOO
 * Returns: { symbol, name, price, change, changePercent }
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
      next: { revalidate: 60 }, // Cache for 60 seconds
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const coinData = data[crypto.id];
    
    if (!coinData) return null;
    
    const price = coinData.usd || 0;
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

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get('symbol');
  
  if (!symbol) {
    return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
  }
  
  const upperSymbol = symbol.toUpperCase().trim();
  
  // Check if it's a known crypto ticker - use CoinGecko
  if (CRYPTO_MAP[upperSymbol]) {
    const cryptoData = await fetchCryptoPrice(upperSymbol);
    
    if (cryptoData) {
      return NextResponse.json({
        symbol: upperSymbol,
        name: cryptoData.name,
        price: cryptoData.price,
        change: cryptoData.change24h,
        changePercent: cryptoData.changePercent24h,
        currency: 'USD',
        type: 'CRYPTOCURRENCY',
        source: 'coingecko',
      });
    }
    // Fall through to Yahoo as backup
  }
  
  try {
    // Use Yahoo Finance v8 API
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(upperSymbol)}?interval=1d&range=1d`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      next: { revalidate: 60 }, // Cache for 60 seconds
    });
    
    if (!response.ok) {
      // Try alternative quote endpoint
      return await tryQuoteSummary(upperSymbol);
    }
    
    const data = await response.json();
    
    if (data.chart?.error) {
      return await tryQuoteSummary(upperSymbol);
    }
    
    const result = data.chart?.result?.[0];
    if (!result) {
      return NextResponse.json({ error: 'Symbol not found' }, { status: 404 });
    }
    
    const meta = result.meta;
    const price = meta.regularMarketPrice || meta.previousClose;
    const previousClose = meta.chartPreviousClose || meta.previousClose;
    const change = price - previousClose;
    const changePercent = previousClose ? (change / previousClose) * 100 : 0;
    
    return NextResponse.json({
      symbol: upperSymbol,
      name: meta.shortName || meta.longName || upperSymbol,
      price: price,
      previousClose: previousClose,
      change: change,
      changePercent: changePercent,
      currency: meta.currency || 'USD',
      exchange: meta.exchangeName,
      type: meta.instrumentType,
    });
    
  } catch (error) {
    console.error('Stock quote error:', error);
    return await tryQuoteSummary(upperSymbol);
  }
}

// Fallback to quote summary endpoint
async function tryQuoteSummary(symbol: string) {
  try {
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      next: { revalidate: 60 },
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 });
    }
    
    const data = await response.json();
    const quote = data.quoteResponse?.result?.[0] as YahooQuoteResult | undefined;
    
    if (!quote) {
      return NextResponse.json({ error: 'Symbol not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      symbol: quote.symbol,
      name: quote.shortName || quote.longName || symbol,
      price: quote.regularMarketPrice || 0,
      change: quote.regularMarketChange || 0,
      changePercent: quote.regularMarketChangePercent || 0,
      type: quote.quoteType,
    });
    
  } catch (error) {
    console.error('Quote summary error:', error);
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 });
  }
}

// Also support batch quotes
export async function POST(request: NextRequest) {
  try {
    const { symbols } = await request.json();
    
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return NextResponse.json({ error: 'Symbols array required' }, { status: 400 });
    }
    
    // Limit to 50 symbols
    const limitedSymbols = symbols.slice(0, 50).map(s => s.toUpperCase().trim());
    
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(limitedSymbols.join(','))}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      next: { revalidate: 60 },
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
    }
    
    const data = await response.json();
    const quotes = data.quoteResponse?.result || [];
    
    const results: Record<string, { name: string; price: number; change: number; changePercent: number }> = {};
    
    for (const quote of quotes as YahooQuoteResult[]) {
      if (quote.symbol && quote.regularMarketPrice) {
        results[quote.symbol] = {
          name: quote.shortName || quote.longName || quote.symbol,
          price: quote.regularMarketPrice,
          change: quote.regularMarketChange || 0,
          changePercent: quote.regularMarketChangePercent || 0,
        };
      }
    }
    
    return NextResponse.json({ quotes: results });
    
  } catch (error) {
    console.error('Batch quote error:', error);
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}
