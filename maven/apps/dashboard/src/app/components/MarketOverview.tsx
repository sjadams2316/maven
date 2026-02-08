'use client';

import { useState, useEffect } from 'react';

interface MarketQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

// CoinGecko IDs
const CRYPTO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  TAO: 'bittensor',
};

const CRYPTO_NAMES: Record<string, string> = {
  BTC: 'Bitcoin',
  TAO: 'Bittensor',
};

const STOCK_NAMES: Record<string, string> = {
  SPY: 'S&P 500',
  QQQ: 'Nasdaq 100',
  DIA: 'Dow Jones',
  IWM: 'Russell 2000',
};

export default function MarketOverview() {
  const [indices, setIndices] = useState<MarketQuote[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchMarketData = async () => {
    try {
      // Fetch crypto from CoinGecko
      const cryptoResponse = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,bittensor&vs_currencies=usd&include_24hr_change=true'
      );
      
      let cryptoData: MarketQuote[] = [];
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
      
      // Fetch stocks from Yahoo Finance
      const stockSymbols = ['SPY', 'QQQ', 'DIA', 'IWM'];
      const stockData: MarketQuote[] = await Promise.all(
        stockSymbols.map(async (symbol) => {
          try {
            const response = await fetch(
              `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2d`
            );
            if (!response.ok) throw new Error('Yahoo API error');
            
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
          } catch {
            return { symbol, name: STOCK_NAMES[symbol], price: 0, change: 0, changePercent: 0 };
          }
        })
      );
      
      setIndices([...stockData, ...cryptoData]);
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
