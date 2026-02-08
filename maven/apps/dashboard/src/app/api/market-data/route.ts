import { NextRequest, NextResponse } from 'next/server';
import { getPolygonClient } from '@/lib/polygon-client';

// Cache for rate limiting
let cache: {
  data: any;
  timestamp: number;
} | null = null;

const CACHE_TTL = 60 * 1000; // 1 minute cache

// Crypto symbols we track
const CRYPTO_SYMBOLS = ['BTC', 'ETH', 'SOL', 'TAO'];

// CoinGecko ID mapping (fallback)
const CRYPTO_IDS: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'SOL': 'solana',
  'TAO': 'bittensor',
};

async function fetchYahooQuote(symbol: string): Promise<{ price: number; change: number; changePercent: number } | null> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
        next: { revalidate: 60 },
      }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const result = data.chart?.result?.[0];
    if (!result) return null;
    
    const price = result.meta?.regularMarketPrice;
    
    // Get yesterday's close from the historical data
    const closes = result.indicators?.quote?.[0]?.close || [];
    const validCloses = closes.filter((c: number | null) => c !== null);
    const prevClose = validCloses.length >= 2 ? validCloses[validCloses.length - 2] : result.meta?.chartPreviousClose;
    
    const change = prevClose ? price - prevClose : 0;
    const changePercent = prevClose ? (change / prevClose) * 100 : 0;
    
    return { price, change, changePercent };
  } catch (error) {
    console.error(`Yahoo fetch error for ${symbol}:`, error);
    return null;
  }
}

async function fetchCryptoFromPolygon(symbols: string[]): Promise<Record<string, { price: number; changePercent: number } | null>> {
  const polygonClient = getPolygonClient();
  const results: Record<string, { price: number; changePercent: number } | null> = {};
  
  if (!polygonClient) {
    // No Polygon API key, return nulls
    symbols.forEach(s => results[s] = null);
    return results;
  }
  
  try {
    const quotes = await polygonClient.getCryptoQuotes(symbols);
    
    symbols.forEach(symbol => {
      const quote = quotes.get(symbol);
      if (quote) {
        results[symbol] = {
          price: quote.price,
          changePercent: quote.changePercent
        };
      } else {
        results[symbol] = null;
      }
    });
    
    return results;
  } catch (error) {
    console.error('Polygon crypto fetch error:', error);
    symbols.forEach(s => results[s] = null);
    return results;
  }
}

async function fetchCryptoFromCoinGecko(symbols: string[]): Promise<Record<string, { price: number; changePercent: number } | null>> {
  const results: Record<string, { price: number; changePercent: number } | null> = {};
  
  try {
    const ids = symbols.map(s => CRYPTO_IDS[s]).filter(Boolean);
    if (ids.length === 0) {
      symbols.forEach(s => results[s] = null);
      return results;
    }
    
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`,
      { next: { revalidate: 60 } }
    );
    
    if (!response.ok) {
      symbols.forEach(s => results[s] = null);
      return results;
    }
    
    const data = await response.json();
    
    symbols.forEach(symbol => {
      const geckoId = CRYPTO_IDS[symbol];
      if (geckoId && data[geckoId]) {
        results[symbol] = {
          price: data[geckoId].usd,
          changePercent: data[geckoId].usd_24h_change || 0
        };
      } else {
        results[symbol] = null;
      }
    });
    
    return results;
  } catch (error) {
    console.error('CoinGecko fetch error:', error);
    symbols.forEach(s => results[s] = null);
    return results;
  }
}

export async function GET(request: NextRequest) {
  // Check cache
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  try {
    // Fetch indices from Yahoo
    const [spyData, qqqData, diaData] = await Promise.all([
      fetchYahooQuote('^GSPC'),
      fetchYahooQuote('^IXIC'),
      fetchYahooQuote('^DJI'),
    ]);

    // Fetch crypto - try Polygon first, fall back to CoinGecko
    let cryptoPrices = await fetchCryptoFromPolygon(CRYPTO_SYMBOLS);
    
    // Check if Polygon returned data
    const polygonHasData = Object.values(cryptoPrices).some(v => v !== null);
    
    // If Polygon failed, try CoinGecko as fallback
    if (!polygonHasData) {
      console.log('Polygon crypto failed, falling back to CoinGecko');
      cryptoPrices = await fetchCryptoFromCoinGecko(CRYPTO_SYMBOLS);
    }

    // Build response
    const marketData = {
      timestamp: new Date().toISOString(),
      source: {
        indices: 'yahoo',
        crypto: polygonHasData ? 'polygon' : 'coingecko'
      },
      indices: {
        sp500: spyData ? {
          price: spyData.price,
          change: spyData.change,
          changePercent: spyData.changePercent,
        } : null,
        nasdaq: qqqData ? {
          price: qqqData.price,
          change: qqqData.change,
          changePercent: qqqData.changePercent,
        } : null,
        dow: diaData ? {
          price: diaData.price,
          change: diaData.change,
          changePercent: diaData.changePercent,
        } : null,
      },
      crypto: {
        BTC: cryptoPrices.BTC,
        ETH: cryptoPrices.ETH,
        SOL: cryptoPrices.SOL,
        TAO: cryptoPrices.TAO,
      },
    };

    // Update cache
    cache = {
      data: marketData,
      timestamp: Date.now(),
    };

    return NextResponse.json(marketData);
  } catch (error) {
    console.error('Market data API error:', error);
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
  }
}
