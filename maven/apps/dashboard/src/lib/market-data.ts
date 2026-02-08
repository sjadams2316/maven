// Market data fetching utilities
// Uses CoinGecko for crypto, Yahoo Finance for stocks

export interface MarketQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: Date;
}

// CoinGecko IDs for crypto
const CRYPTO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  TAO: 'bittensor',
  SOL: 'solana',
  AVAX: 'avalanche-2',
};

// Fetch crypto prices from CoinGecko (free, no API key needed)
export async function getCryptoPrices(symbols: string[]): Promise<MarketQuote[]> {
  try {
    const ids = symbols
      .map(s => CRYPTO_IDS[s.toUpperCase()])
      .filter(Boolean)
      .join(',');
    
    if (!ids) return [];
    
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      { next: { revalidate: 60 } } // Cache for 60 seconds
    );
    
    if (!response.ok) throw new Error('CoinGecko API error');
    
    const data = await response.json();
    
    return symbols.map(symbol => {
      const id = CRYPTO_IDS[symbol.toUpperCase()];
      const coinData = data[id];
      
      if (!coinData) {
        return {
          symbol,
          name: symbol,
          price: 0,
          change: 0,
          changePercent: 0,
          lastUpdated: new Date(),
        };
      }
      
      const price = coinData.usd || 0;
      const changePercent = coinData.usd_24h_change || 0;
      const change = price * (changePercent / 100);
      
      return {
        symbol: symbol.toUpperCase(),
        name: getCryptoName(symbol),
        price,
        change,
        changePercent,
        lastUpdated: new Date(),
      };
    });
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return symbols.map(s => ({
      symbol: s,
      name: getCryptoName(s),
      price: 0,
      change: 0,
      changePercent: 0,
      lastUpdated: new Date(),
    }));
  }
}

function getCryptoName(symbol: string): string {
  const names: Record<string, string> = {
    BTC: 'Bitcoin',
    ETH: 'Ethereum',
    TAO: 'Bittensor',
    SOL: 'Solana',
    AVAX: 'Avalanche',
  };
  return names[symbol.toUpperCase()] || symbol;
}

// Fetch stock prices from Yahoo Finance (free, no API key needed)
export async function getStockPrices(symbols: string[]): Promise<MarketQuote[]> {
  try {
    const quotes = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const response = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2d`,
            { next: { revalidate: 60 } }
          );
          
          if (!response.ok) throw new Error(`Yahoo API error for ${symbol}`);
          
          const data = await response.json();
          const result = data.chart?.result?.[0];
          
          if (!result) {
            return createEmptyQuote(symbol);
          }
          
          const meta = result.meta;
          const price = meta.regularMarketPrice || 0;
          const previousClose = meta.previousClose || meta.chartPreviousClose || price;
          const change = price - previousClose;
          const changePercent = previousClose ? (change / previousClose) * 100 : 0;
          
          return {
            symbol: symbol.toUpperCase(),
            name: getStockName(symbol),
            price,
            change,
            changePercent,
            lastUpdated: new Date(),
          };
        } catch (error) {
          console.error(`Error fetching ${symbol}:`, error);
          return createEmptyQuote(symbol);
        }
      })
    );
    
    return quotes;
  } catch (error) {
    console.error('Error fetching stock prices:', error);
    return symbols.map(createEmptyQuote);
  }
}

function createEmptyQuote(symbol: string): MarketQuote {
  return {
    symbol,
    name: getStockName(symbol),
    price: 0,
    change: 0,
    changePercent: 0,
    lastUpdated: new Date(),
  };
}

function getStockName(symbol: string): string {
  const names: Record<string, string> = {
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
    AAPL: 'Apple',
    MSFT: 'Microsoft',
    GOOGL: 'Alphabet',
    AMZN: 'Amazon',
    NVDA: 'NVIDIA',
    TSLA: 'Tesla',
  };
  return names[symbol.toUpperCase()] || symbol;
}

// Fetch all market data (indices + crypto)
export async function getMarketOverview(): Promise<MarketQuote[]> {
  const [stocks, crypto] = await Promise.all([
    getStockPrices(['SPY', 'QQQ', 'DIA', 'IWM']),
    getCryptoPrices(['BTC', 'TAO']),
  ]);
  
  return [...stocks, ...crypto];
}

// Get TAO price specifically (used throughout the app)
export async function getTaoPrice(): Promise<MarketQuote> {
  const [tao] = await getCryptoPrices(['TAO']);
  return tao;
}

// Get Bitcoin price
export async function getBtcPrice(): Promise<MarketQuote> {
  const [btc] = await getCryptoPrices(['BTC']);
  return btc;
}
