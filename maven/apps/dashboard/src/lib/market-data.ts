// Market data fetching utilities
// Uses CoinGecko for crypto, Yahoo Finance for stocks

import { validatePrice, priceCache } from './price-validation';

export interface MarketQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: Date;
  /** Validation status */
  validated?: boolean;
  /** Warning messages from validation */
  warnings?: string[];
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
    
    if (!response.ok) {
      console.warn(`[CoinGecko] API error: HTTP ${response.status}`);
      // Try to return cached prices on error
      return symbols.map(symbol => {
        const cached = priceCache.get(symbol);
        if (cached) {
          return {
            symbol: cached.symbol,
            name: getCryptoName(cached.symbol),
            price: cached.price,
            change: cached.change || 0,
            changePercent: cached.changePercent || 0,
            lastUpdated: cached.timestamp || new Date(),
            warnings: ['Using cached data - API unavailable'],
          };
        }
        return createEmptyCryptoQuote(symbol);
      });
    }
    
    const data = await response.json();
    
    const quotes = symbols.map(symbol => {
      const id = CRYPTO_IDS[symbol.toUpperCase()];
      const coinData = data[id];
      
      if (!coinData) {
        console.warn(`[CoinGecko] No data for ${symbol}`);
        return createEmptyCryptoQuote(symbol);
      }
      
      const price = coinData.usd || 0;
      const changePercent = coinData.usd_24h_change || 0;
      const change = price * (changePercent / 100);
      const timestamp = new Date();
      
      // Validate the price data
      const validation = validatePrice({
        symbol: symbol.toUpperCase(),
        price,
        changePercent,
        timestamp,
      }, 'crypto');
      
      if (!validation.isValid) {
        console.error(`[CoinGecko] Invalid price for ${symbol}:`, validation.errors);
        return createEmptyCryptoQuote(symbol);
      }
      
      if (validation.warnings.length > 0) {
        console.warn(`[CoinGecko] Warnings for ${symbol}:`, validation.warnings);
      }
      
      const quote: MarketQuote = {
        symbol: symbol.toUpperCase(),
        name: getCryptoName(symbol),
        price,
        change,
        changePercent,
        lastUpdated: timestamp,
        validated: true,
        warnings: validation.warnings.length > 0 ? validation.warnings : undefined,
      };
      
      // Cache the valid price
      priceCache.set({
        symbol: quote.symbol,
        price: quote.price,
        change: quote.change,
        changePercent: quote.changePercent,
        timestamp: quote.lastUpdated,
      });
      
      return quote;
    });
    
    return quotes;
  } catch (error) {
    console.error('[CoinGecko] Error fetching crypto prices:', error);
    // Return cached prices on error
    return symbols.map(symbol => {
      const cached = priceCache.get(symbol);
      if (cached) {
        return {
          symbol: cached.symbol,
          name: getCryptoName(cached.symbol),
          price: cached.price,
          change: cached.change || 0,
          changePercent: cached.changePercent || 0,
          lastUpdated: cached.timestamp || new Date(),
          warnings: ['Using cached data - fetch failed'],
        };
      }
      return createEmptyCryptoQuote(symbol);
    });
  }
}

function createEmptyCryptoQuote(symbol: string): MarketQuote {
  return {
    symbol: symbol.toUpperCase(),
    name: getCryptoName(symbol),
    price: 0,
    change: 0,
    changePercent: 0,
    lastUpdated: new Date(),
    validated: false,
    warnings: ['No data available'],
  };
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
          
          if (!response.ok) {
            console.warn(`[Yahoo] API error for ${symbol}: HTTP ${response.status}`);
            // Try cache on error
            const cached = priceCache.get(symbol);
            if (cached) {
              return {
                symbol: cached.symbol,
                name: getStockName(cached.symbol),
                price: cached.price,
                change: cached.change || 0,
                changePercent: cached.changePercent || 0,
                lastUpdated: cached.timestamp || new Date(),
                warnings: ['Using cached data - API unavailable'],
              };
            }
            return createEmptyStockQuote(symbol);
          }
          
          const data = await response.json();
          const result = data.chart?.result?.[0];
          
          if (!result) {
            console.warn(`[Yahoo] No result data for ${symbol}`);
            return createEmptyStockQuote(symbol);
          }
          
          const meta = result.meta;
          const price = meta.regularMarketPrice || 0;
          const previousClose = meta.previousClose || meta.chartPreviousClose || price;
          const change = price - previousClose;
          const changePercent = previousClose ? (change / previousClose) * 100 : 0;
          const timestamp = new Date();
          
          // Validate the price data
          const validation = validatePrice({
            symbol: symbol.toUpperCase(),
            price,
            changePercent,
            timestamp,
          });
          
          if (!validation.isValid) {
            console.error(`[Yahoo] Invalid price for ${symbol}:`, validation.errors);
            // Try cache as fallback
            const cached = priceCache.get(symbol);
            if (cached && cached.price > 0) {
              return {
                symbol: cached.symbol,
                name: getStockName(cached.symbol),
                price: cached.price,
                change: cached.change || 0,
                changePercent: cached.changePercent || 0,
                lastUpdated: cached.timestamp || new Date(),
                warnings: ['Using cached data - invalid response'],
              };
            }
            return createEmptyStockQuote(symbol);
          }
          
          if (validation.warnings.length > 0) {
            console.warn(`[Yahoo] Warnings for ${symbol}:`, validation.warnings);
          }
          
          const quote: MarketQuote = {
            symbol: symbol.toUpperCase(),
            name: getStockName(symbol),
            price,
            change,
            changePercent,
            lastUpdated: timestamp,
            validated: true,
            warnings: validation.warnings.length > 0 ? validation.warnings : undefined,
          };
          
          // Cache the valid price
          priceCache.set({
            symbol: quote.symbol,
            price: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
            timestamp: quote.lastUpdated,
          });
          
          return quote;
        } catch (error) {
          console.error(`[Yahoo] Error fetching ${symbol}:`, error);
          // Try cache on error
          const cached = priceCache.get(symbol);
          if (cached) {
            return {
              symbol: cached.symbol,
              name: getStockName(cached.symbol),
              price: cached.price,
              change: cached.change || 0,
              changePercent: cached.changePercent || 0,
              lastUpdated: cached.timestamp || new Date(),
              warnings: ['Using cached data - fetch failed'],
            };
          }
          return createEmptyStockQuote(symbol);
        }
      })
    );
    
    return quotes;
  } catch (error) {
    console.error('[Yahoo] Error fetching stock prices:', error);
    return symbols.map(symbol => {
      const cached = priceCache.get(symbol);
      if (cached) {
        return {
          symbol: cached.symbol,
          name: getStockName(cached.symbol),
          price: cached.price,
          change: cached.change || 0,
          changePercent: cached.changePercent || 0,
          lastUpdated: cached.timestamp || new Date(),
          warnings: ['Using cached data'],
        };
      }
      return createEmptyStockQuote(symbol);
    });
  }
}

function createEmptyStockQuote(symbol: string): MarketQuote {
  return {
    symbol: symbol.toUpperCase(),
    name: getStockName(symbol),
    price: 0,
    change: 0,
    changePercent: 0,
    lastUpdated: new Date(),
    validated: false,
    warnings: ['No data available'],
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
