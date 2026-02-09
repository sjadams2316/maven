import { NextResponse } from 'next/server';

const STOCK_SYMBOLS = ['SPY', 'QQQ', 'DIA', 'IWM'];

const STOCK_NAMES: Record<string, string> = {
  SPY: 'S&P 500',
  QQQ: 'Nasdaq 100',
  DIA: 'Dow Jones',
  IWM: 'Russell 2000',
};

export async function GET() {
  try {
    // Fetch stocks from Yahoo Finance (server-side to avoid CORS)
    const stockData = await Promise.all(
      STOCK_SYMBOLS.map(async (symbol) => {
        try {
          const response = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2d`,
            {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
              },
              next: { revalidate: 60 }, // Cache for 60 seconds
            }
          );
          
          if (!response.ok) {
            console.error(`Yahoo API error for ${symbol}:`, response.status);
            return { symbol, name: STOCK_NAMES[symbol], price: 0, change: 0, changePercent: 0 };
          }
          
          const data = await response.json();
          const result = data.chart?.result?.[0];
          const meta = result?.meta;
          
          if (!meta) {
            return { symbol, name: STOCK_NAMES[symbol], price: 0, change: 0, changePercent: 0 };
          }
          
          const price = meta.regularMarketPrice || 0;
          const previousClose = meta.previousClose || meta.chartPreviousClose || price;
          const change = price - previousClose;
          const changePercent = previousClose ? (change / previousClose) * 100 : 0;
          
          return {
            symbol,
            name: STOCK_NAMES[symbol],
            price,
            change,
            changePercent,
          };
        } catch (err) {
          console.error(`Error fetching ${symbol}:`, err);
          return { symbol, name: STOCK_NAMES[symbol], price: 0, change: 0, changePercent: 0 };
        }
      })
    );

    // Fetch crypto from CoinGecko
    let cryptoData: { symbol: string; name: string; price: number; change: number; changePercent: number }[] = [];
    try {
      const cryptoResponse = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,bittensor&vs_currencies=usd&include_24hr_change=true',
        { next: { revalidate: 60 } }
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
