'use client';

import { useState, useEffect } from 'react';

interface MarketQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export default function MarketOverview() {
  const [indices, setIndices] = useState<MarketQuote[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchMarketData = async () => {
    try {
      // Fetch from our API route (handles CORS issues with Yahoo Finance)
      const response = await fetch('/api/market-data');
      
      if (!response.ok) {
        throw new Error('Failed to fetch market data');
      }
      
      const data = await response.json();
      
      // Combine stocks and crypto
      const allIndices = [...(data.stocks || []), ...(data.crypto || [])];
      
      setIndices(allIndices);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError('Failed to load market data');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchMarketData();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchMarketData, 60000);
    return () => clearInterval(interval);
  }, []);
  
  if (loading) {
    return (
      <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Markets</h3>
          <span className="text-xs text-gray-500">Loading...</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white/5 rounded-xl p-3 animate-pulse">
              <div className="h-3 bg-white/10 rounded w-12 mb-2" />
              <div className="h-5 bg-white/10 rounded w-20 mb-1" />
              <div className="h-3 bg-white/10 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Markets</h3>
        <div className="flex items-center gap-2">
          {error && <span className="text-xs text-red-400">{error}</span>}
          <span className="text-xs text-gray-500">
            {lastUpdate ? `Updated ${lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
          </span>
          <button 
            onClick={fetchMarketData}
            className="text-xs text-indigo-400 hover:text-indigo-300"
          >
            ↻
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {indices.map((idx) => (
          <div 
            key={idx.symbol}
            className="bg-white/5 rounded-xl p-3 hover:bg-white/10 transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">{idx.symbol}</span>
              {idx.price > 0 && (
                <span className={`text-xs font-medium ${
                  idx.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {idx.changePercent >= 0 ? '▲' : '▼'} {Math.abs(idx.changePercent).toFixed(2)}%
                </span>
              )}
            </div>
            <p className="text-white font-semibold">
              {idx.price > 0 
                ? idx.price < 100 
                  ? `$${idx.price.toFixed(2)}`
                  : `$${idx.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                : '—'
              }
            </p>
            <p className="text-xs text-gray-500">{idx.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
