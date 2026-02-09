import { NextResponse } from 'next/server';

const STOCK_SYMBOLS = ['SPY', 'QQQ', 'DIA', 'IWM'];

const STOCK_NAMES: Record<string, string> = {
  SPY: 'S&P 500',
  QQQ: 'Nasdaq 100',
  DIA: 'Dow Jones',
  IWM: 'Russell 2000',
};

// Full browser User-Agent to avoid Yahoo rate limiting
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function fetchYahooQuote(symbol: string): Promise<{
  price: number;
  previousClose: number;
} | null> {
  // Try v8 API first (chart endpoint)
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2d`,
      {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        cache: 'no-store', // Avoid Next.js caching issues with headers
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error(`Yahoo v8 API error for ${symbol}: ${response.status} - ${text.slice(0, 100)}`);
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];
    const meta = result?.meta;

    if (meta?.regularMarketPrice) {
      return {
        price: meta.regularMarketPrice,
        previousClose: meta.previousClose || meta.chartPreviousClose || meta.regularMarketPrice,
      };
    }
  } catch (err) {
    console.error(`Yahoo v8 failed for ${symbol}:`, err);
  }

  // Fallback to v7 API (quote endpoint)
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`,
      {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error(`Yahoo v7 API error for ${symbol}: ${response.status} - ${text.slice(0, 100)}`);
      return null;
    }

    const data = await response.json();
    const quote = data.quoteResponse?.result?.[0];

    if (quote?.regularMarketPrice) {
      return {
        price: quote.regularMarketPrice,
        previousClose: quote.regularMarketPreviousClose || quote.regularMarketPrice,
      };
    }
  } catch (err) {
    console.error(`Yahoo v7 failed for ${symbol}:`, err);
  }

  return null;
}

export async function GET() {
  try {
    // Fetch stocks from Yahoo Finance (server-side to avoid CORS)
    const stockData = await Promise.all(
      STOCK_SYMBOLS.map(async (symbol) => {
        const quote = await fetchYahooQuote(symbol);
        
        if (!quote || quote.price === 0) {
          console.warn(`No valid quote for ${symbol}`);
          return { symbol, name: STOCK_NAMES[symbol], price: 0, change: 0, changePercent: 0 };
        }
        
        const { price, previousClose } = quote;
        const change = price - previousClose;
        const changePercent = previousClose ? (change / previousClose) * 100 : 0;
        
        return {
          symbol,
          name: STOCK_NAMES[symbol],
          price,
          change,
          changePercent,
        };
      })
    );

    // Log results for debugging
    const validStocks = stockData.filter(s => s.price > 0).length;
    console.log(`Market data: ${validStocks}/${STOCK_SYMBOLS.length} stocks fetched successfully`);

    // Fetch crypto from CoinGecko
    let cryptoData: { symbol: string; name: string; price: number; change: number; changePercent: number }[] = [];
    try {
      const cryptoResponse = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,bittensor&vs_currencies=usd&include_24hr_change=true',
        { 
          headers: { 'Accept': 'application/json' },
          cache: 'no-store',
        }
      );
      
      if (cryptoResponse.ok) {
        const crypto = await cryptoResponse.json();
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
    } catch (err) {
      console.error('Error fetching crypto:', err);
    }

    return NextResponse.json({
      stocks: stockData,
      crypto: cryptoData,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Market data API error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}
