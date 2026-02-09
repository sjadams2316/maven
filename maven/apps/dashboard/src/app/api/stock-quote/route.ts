import { NextRequest, NextResponse } from 'next/server';

/**
 * Stock Quote API
 * Fetches real-time stock/fund/crypto prices from Yahoo Finance
 * 
 * GET /api/stock-quote?symbol=VOO
 * Returns: { symbol, name, price, change, changePercent }
 */

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
