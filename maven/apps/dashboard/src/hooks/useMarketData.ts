'use client';

import { useState, useEffect, useCallback } from 'react';

export interface MarketQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: Date;
}

const CRYPTO_NAMES: Record<string, string> = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  TAO: 'Bittensor',
  SOL: 'Solana',
};

const STOCK_NAMES: Record<string, string> = {
  SPY: 'S&P 500 ETF',
  QQQ: 'Nasdaq 100 ETF',
  VTI: 'Vanguard Total Stock',
  VEA: 'Vanguard Developed Markets',
  VWO: 'Vanguard Emerging Markets',
  BND: 'Vanguard Total Bond',
  CIFR: 'Cipher Mining',
  IREN: 'Iris Energy',
};

// CoinGecko ID mapping
const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  TAO: 'bittensor',
  SOL: 'solana',
};

export function useMarketData(symbols: string[], refreshInterval = 60000) {
  const [data, setData] = useState<Record<string, MarketQuote>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = useCallback(async () => {
    try {
      const cryptoSymbols = symbols.filter(s => COINGECKO_IDS[s.toUpperCase()]);
      const stockSymbols = symbols.filter(s => !COINGECKO_IDS[s.toUpperCase()]);
      
      const results: Record<string, MarketQuote> = {};
      
      // Fetch crypto prices from CoinGecko
      if (cryptoSymbols.length > 0) {
        const ids = cryptoSymbols.map(s => COINGECKO_IDS[s.toUpperCase()]).join(',');
        try {
          const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
          );
          
          if (response.ok) {
            const cryptoData = await response.json();
            
            cryptoSymbols.forEach(symbol => {
              const id = COINGECKO_IDS[symbol.toUpperCase()];
              const coinData = cryptoData[id];
              
              if (coinData) {
                const price = coinData.usd || 0;
                const changePercent = coinData.usd_24h_change || 0;
                
                results[symbol.toUpperCase()] = {
                  symbol: symbol.toUpperCase(),
                  name: CRYPTO_NAMES[symbol.toUpperCase()] || symbol,
                  price,
                  change: price * (changePercent / 100),
                  changePercent,
                  lastUpdated: new Date(),
                };
              }
            });
          }
        } catch (e) {
          console.error('CoinGecko fetch error:', e);
        }
      }
      
      // Fetch stock prices from Yahoo Finance
      if (stockSymbols.length > 0) {
        await Promise.all(
          stockSymbols.map(async (symbol) => {
            try {
              const response = await fetch(
                `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2d`
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
                  
                  results[symbol.toUpperCase()] = {
                    symbol: symbol.toUpperCase(),
                    name: STOCK_NAMES[symbol.toUpperCase()] || meta.shortName || symbol,
                    price,
                    change,
                    changePercent,
                    lastUpdated: new Date(),
                  };
                }
              }
            } catch (e) {
              console.error(`Yahoo fetch error for ${symbol}:`, e);
            }
          })
        );
      }
      
      setData(results);
      setError(null);
    } catch (e) {
      console.error('Market data fetch error:', e);
      setError('Failed to fetch market data');
    } finally {
      setLoading(false);
    }
  }, [symbols]);
  
  useEffect(() => {
    fetchData();
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, refreshInterval]);
  
  return {
    data,
    loading,
    error,
    refresh: fetchData,
    getPrice: (symbol: string) => data[symbol.toUpperCase()]?.price || 0,
    getQuote: (symbol: string) => data[symbol.toUpperCase()],
  };
}

// Hook specifically for TAO price (used throughout)
export function useTaoPrice() {
  const { data, loading, error, refresh } = useMarketData(['TAO']);
  return {
    price: data.TAO?.price || 0,
    change: data.TAO?.changePercent || 0,
    loading,
    error,
    refresh,
  };
}

// Hook for a portfolio of holdings
export function usePortfolioPrices(holdings: { symbol: string; shares: number }[]) {
  const symbols = holdings.map(h => h.symbol);
  const { data, loading, error, refresh } = useMarketData(symbols);
  
  const portfolioWithPrices = holdings.map(holding => {
    const quote = data[holding.symbol.toUpperCase()];
    const price = quote?.price || 0;
    const value = price * holding.shares;
    
    return {
      ...holding,
      price,
      value,
      change: quote?.changePercent || 0,
      name: quote?.name || holding.symbol,
    };
  });
  
  const totalValue = portfolioWithPrices.reduce((sum, h) => sum + h.value, 0);
  
  return {
    holdings: portfolioWithPrices,
    totalValue,
    loading,
    error,
    refresh,
  };
}
