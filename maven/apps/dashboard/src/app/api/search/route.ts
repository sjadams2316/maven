import { NextRequest, NextResponse } from 'next/server';

/**
 * YAHOO FINANCE SEARCH API
 * 
 * Search for stocks, ETFs, mutual funds, crypto by ticker or name
 * Returns matches from Yahoo Finance's autocomplete
 */

interface SearchResult {
  ticker: string;
  name: string;
  type: string;         // EQUITY, ETF, MUTUALFUND, CRYPTOCURRENCY, INDEX
  exchange?: string;    // NYSE, NASDAQ, etc.
  score?: number;       // Relevance score
}

// Cache search results briefly (30 seconds)
const searchCache = new Map<string, { results: SearchResult[]; timestamp: number }>();
const CACHE_TTL = 30 * 1000;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();
  const limit = parseInt(searchParams.get('limit') || '10');

  if (!query || query.length < 1) {
    return NextResponse.json({ results: [], query: '' });
  }

  // Check cache
  const cacheKey = query.toLowerCase();
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({ 
      results: cached.results.slice(0, limit), 
      query,
      cached: true 
    });
  }

  try {
    // Yahoo Finance autocomplete API
    const response = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=${limit}&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      }
    );

    if (!response.ok) {
      console.error(`Yahoo search error: ${response.status}`);
      return NextResponse.json({ results: [], query, error: 'Search failed' });
    }

    const data = await response.json();
    const quotes = data.quotes || [];

    const results: SearchResult[] = quotes
      .filter((q: any) => q.symbol && q.shortname)
      .map((q: any) => ({
        ticker: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        type: mapQuoteType(q.quoteType),
        exchange: q.exchange,
        score: q.score
      }));

    // Cache results
    searchCache.set(cacheKey, { results, timestamp: Date.now() });

    return NextResponse.json({ 
      results: results.slice(0, limit), 
      query,
      total: quotes.length 
    });

  } catch (error) {
    console.error('Yahoo search error:', error);
    return NextResponse.json({ results: [], query, error: 'Search failed' });
  }
}

function mapQuoteType(quoteType: string): string {
  const typeMap: Record<string, string> = {
    'EQUITY': 'Stock',
    'ETF': 'ETF',
    'MUTUALFUND': 'Mutual Fund',
    'CRYPTOCURRENCY': 'Crypto',
    'INDEX': 'Index',
    'FUTURE': 'Futures',
    'CURRENCY': 'Currency',
    'OPTION': 'Option'
  };
  return typeMap[quoteType] || quoteType || 'Unknown';
}
