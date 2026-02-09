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
          
          if (Array.isArray(fmpData)) {
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
      console.log('FMP failed, trying internal stock-quote API...');
      stockData = await Promise.all(
        STOCK_SYMBOLS.map(async (symbol) => {
          try {
            // Use absolute URL for internal API call in production
            const baseUrl = process.env.VERCEL_URL 
              ? `https://${process.env.VERCEL_URL}` 
              : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            
            const response = await fetch(`${baseUrl}/api/stock-quote?symbol=${symbol}`, {
              cache: 'no-store',
            });
            
            if (response.ok) {
              const data = await response.json();
              return {
                symbol,
                name: STOCK_NAMES[symbol] || data.name || symbol,
                price: data.price || 0,
                change: data.change || 0,
                changePercent: data.changePercent || 0,
              };
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
