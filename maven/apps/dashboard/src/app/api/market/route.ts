import { NextResponse } from 'next/server';

// CoinGecko IDs for crypto
const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  TAO: 'bittensor',
  SOL: 'solana',
};

const CRYPTO_NAMES: Record<string, string> = {
  bitcoin: 'Bitcoin',
  ethereum: 'Ethereum',
  bittensor: 'Bittensor',
  solana: 'Solana',
};

const STOCK_NAMES: Record<string, string> = {
  SPY: 'S&P 500 ETF',
  QQQ: 'Nasdaq 100 ETF',
  DIA: 'Dow Jones ETF',
  IWM: 'Russell 2000 ETF',
  VTI: 'Vanguard Total Stock',
  VEA: 'Vanguard Developed Markets',
  VWO: 'Vanguard Emerging Markets',
  BND: 'Vanguard Total Bond',
  CIFR: 'Cipher Mining',
  IREN: 'Iris Energy',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get('symbols');
  
  if (!symbolsParam) {
    return NextResponse.json({ error: 'Missing symbols parameter' }, { status: 400 });
  }
  
  const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase());
  const results: Record<string, any> = {};
  
  // Separate crypto and stock symbols
  const cryptoSymbols = symbols.filter(s => COINGECKO_IDS[s]);
  const stockSymbols = symbols.filter(s => !COINGECKO_IDS[s]);
  
  // Fetch crypto prices from CoinGecko
  if (cryptoSymbols.length > 0) {
    try {
      const ids = cryptoSymbols.map(s => COINGECKO_IDS[s]).join(',');
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`,
        { next: { revalidate: 30 } } // Cache for 30 seconds
      );
      
      if (response.ok) {
        const data = await response.json();
        
        cryptoSymbols.forEach(symbol => {
          const id = COINGECKO_IDS[symbol];
          const coinData = data[id];
          
          if (coinData) {
            const price = coinData.usd || 0;
            const changePercent = coinData.usd_24h_change || 0;
            
            results[symbol] = {
              symbol,
              name: CRYPTO_NAMES[id] || symbol,
              price,
              change: price * (changePercent / 100),
              changePercent,
              marketCap: coinData.usd_market_cap || 0,
              lastUpdated: new Date().toISOString(),
            };
          }
        });
      }
    } catch (error) {
      console.error('CoinGecko API error:', error);
    }
  }
  
  // Fetch stock prices from Yahoo Finance
  if (stockSymbols.length > 0) {
    await Promise.all(
      stockSymbols.map(async (symbol) => {
        try {
          const response = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2d`,
            { next: { revalidate: 30 } }
          );
          
          if (response.ok) {
            const data = await response.json();
            const result = data.chart?.result?.[0];
            const meta = result?.meta;
            
            if (meta) {
              const price = meta.regularMarketPrice || 0;
              const previousClose = meta.previousClose || meta.chartPreviousClose || price;
              const change = price - previousClose;
              const changePercent = previousClose ? (change / previousClose) * 100 : 0;
              
              results[symbol] = {
                symbol,
                name: STOCK_NAMES[symbol] || meta.shortName || symbol,
                price,
                change,
                changePercent,
                volume: meta.regularMarketVolume || 0,
                lastUpdated: new Date().toISOString(),
              };
            }
          }
        } catch (error) {
          console.error(`Yahoo API error for ${symbol}:`, error);
        }
      })
    );
  }
  
  return NextResponse.json({
    quotes: results,
    timestamp: new Date().toISOString(),
  });
}
