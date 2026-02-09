'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface MarketQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: Date;
}

export interface UseMarketDataResult {
  data: Record<string, MarketQuote>;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  getPrice: (symbol: string) => number;
  getQuote: (symbol: string) => MarketQuote | undefined;
}

/**
 * Hook for fetching real-time market data via our API routes
 * Uses /api/stock-quote which handles both stocks AND crypto server-side
 * Auto-refreshes at specified interval (default 60s)
 */
export function useMarketData(symbols: string[], refreshInterval = 60000): UseMarketDataResult {
  const [data, setData] = useState<Record<string, MarketQuote>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Track if component is mounted to avoid state updates after unmount
  const mountedRef = useRef(true);
  
  const fetchData = useCallback(async () => {
    if (symbols.length === 0) {
      setLoading(false);
      return;
    }
    
    try {
      // Use our API route which handles CORS and fetches from appropriate sources
      const response = await fetch('/api/stock-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const { quotes, timestamp } = await response.json();
      
      if (!mountedRef.current) return;
      
      // Transform to MarketQuote format
      const results: Record<string, MarketQuote> = {};
      const updateTime = timestamp ? new Date(timestamp) : new Date();
      
      for (const [symbol, quoteData] of Object.entries(quotes)) {
        const q = quoteData as { name: string; price: number; change: number; changePercent: number };
        results[symbol.toUpperCase()] = {
          symbol: symbol.toUpperCase(),
          name: q.name,
          price: q.price,
          change: q.change,
          changePercent: q.changePercent,
          lastUpdated: updateTime,
        };
      }
      
      setData(results);
      setLastUpdated(updateTime);
      setError(null);
    } catch (e) {
      console.error('Market data fetch error:', e);
      if (mountedRef.current) {
        setError('Failed to fetch market data');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [symbols]);
  
  useEffect(() => {
    mountedRef.current = true;
    
    fetchData();
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => {
        mountedRef.current = false;
        clearInterval(interval);
      };
    }
    
    return () => {
      mountedRef.current = false;
    };
  }, [fetchData, refreshInterval]);
  
  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh: fetchData,
    getPrice: (symbol: string) => data[symbol.toUpperCase()]?.price || 0,
    getQuote: (symbol: string) => data[symbol.toUpperCase()],
  };
}

/**
 * Hook specifically for TAO price (used throughout)
 */
export function useTaoPrice() {
  const { data, loading, error, refresh, lastUpdated } = useMarketData(['TAO']);
  return {
    price: data.TAO?.price || 0,
    change: data.TAO?.changePercent || 0,
    loading,
    error,
    refresh,
    lastUpdated,
  };
}

/**
 * Hook for a portfolio of holdings - fetches live prices and calculates values
 */
export function usePortfolioPrices(holdings: { symbol: string; shares: number; account?: string }[]) {
  const symbols = [...new Set(holdings.map(h => h.symbol))];
  const { data, loading, error, refresh, lastUpdated } = useMarketData(symbols);
  
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
    lastUpdated,
  };
}

/**
 * Format a timestamp for display (e.g., "10:07 AM EST")
 */
export function formatAsOfTime(date: Date | null): string {
  if (!date) return '';
  
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  });
}
