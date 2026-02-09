import { NextRequest, NextResponse } from 'next/server';

/**
 * Stock/Fund/Crypto Search API
 * Searches by ticker OR name using Yahoo Finance + CoinGecko
 * 
 * GET /api/stock-search?q=vanguard total stock
 * Returns: Array of { symbol, name, type, exchange, price }
 */

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange?: string;
  price?: number;
}

// Common crypto symbols to check against CoinGecko
const CRYPTO_KEYWORDS = ['bitcoin', 'btc', 'ethereum', 'eth', 'solana', 'sol', 'tao', 'bittensor', 'dogecoin', 'doge', 'cardano', 'ada', 'polygon', 'matic', 'avalanche', 'avax', 'chainlink', 'link', 'polkadot', 'dot', 'ripple', 'xrp', 'crypto'];

// CoinGecko ID mapping for common cryptos
const COINGECKO_IDS: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum', 
  'SOL': 'solana',
  'TAO': 'bittensor',
  'DOGE': 'dogecoin',
  'ADA': 'cardano',
  'MATIC': 'polygon',
  'AVAX': 'avalanche-2',
  'LINK': 'chainlink',
  'DOT': 'polkadot',
  'XRP': 'ripple',
};

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');
  
  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }
  
  const searchTerm = query.trim().toLowerCase();
  const results: SearchResult[] = [];
  
  // Check if this looks like a crypto search
  const isCryptoSearch = CRYPTO_KEYWORDS.some(kw => searchTerm.includes(kw));
  
  try {
    // Run Yahoo Finance and CoinGecko searches in parallel
    const [yahooResults, cryptoResults] = await Promise.all([
      searchYahooFinance(query),
      isCryptoSearch ? searchCoinGecko(query) : Promise.resolve([]),
    ]);
    
    results.push(...yahooResults);
    results.push(...cryptoResults);
    
    // Deduplicate by symbol
    const seen = new Set<string>();
    const uniqueResults = results.filter(r => {
      if (seen.has(r.symbol)) return false;
      seen.add(r.symbol);
      return true;
    });
    
    // Sort: exact matches first, then by relevance
    uniqueResults.sort((a, b) => {
      const aExact = a.symbol.toLowerCase() === searchTerm || a.name.toLowerCase().includes(searchTerm);
      const bExact = b.symbol.toLowerCase() === searchTerm || b.name.toLowerCase().includes(searchTerm);
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });
    
    return NextResponse.json({ 
      results: uniqueResults.slice(0, 10),
      query,
    });
    
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ results: [], error: 'Search failed' });
  }
}

async function searchYahooFinance(query: string): Promise<SearchResult[]> {
  try {
    // Yahoo Finance autosuggest API
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=8&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });
    
    if (!response.ok) {
      console.error('Yahoo search failed:', response.status);
      return [];
    }
    
    const data = await response.json();
    const quotes = data.quotes || [];
    
    return quotes.map((q: any) => ({
      symbol: q.symbol,
      name: q.shortname || q.longname || q.symbol,
      type: mapYahooType(q.quoteType),
      exchange: q.exchange,
    }));
    
  } catch (error) {
    console.error('Yahoo search error:', error);
    return [];
  }
}

async function searchCoinGecko(query: string): Promise<SearchResult[]> {
  try {
    // CoinGecko search API
    const url = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 300 },
    });
    
    if (!response.ok) {
      console.error('CoinGecko search failed:', response.status);
      return [];
    }
    
    const data = await response.json();
    const coins = data.coins || [];
    
    return coins.slice(0, 5).map((c: any) => ({
      symbol: c.symbol.toUpperCase(),
      name: c.name,
      type: 'Cryptocurrency',
      exchange: 'Crypto',
    }));
    
  } catch (error) {
    console.error('CoinGecko search error:', error);
    return [];
  }
}

function mapYahooType(quoteType: string): string {
  const typeMap: Record<string, string> = {
    'EQUITY': 'Stock',
    'ETF': 'ETF',
    'MUTUALFUND': 'Mutual Fund',
    'INDEX': 'Index',
    'CRYPTOCURRENCY': 'Cryptocurrency',
    'CURRENCY': 'Currency',
    'FUTURE': 'Futures',
    'OPTION': 'Option',
  };
  return typeMap[quoteType] || quoteType || 'Security';
}
