'use client';

import { useState, useEffect } from 'react';

interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

const MOCK_INDICES: MarketIndex[] = [
  { symbol: 'SPY', name: 'S&P 500', value: 5234.18, change: 23.45, changePercent: 0.45 },
  { symbol: 'QQQ', name: 'Nasdaq', value: 18456.32, change: -45.23, changePercent: -0.24 },
  { symbol: 'DIA', name: 'Dow Jones', value: 42156.89, change: 156.78, changePercent: 0.37 },
  { symbol: 'IWM', name: 'Russell 2000', value: 2087.45, change: 12.34, changePercent: 0.59 },
  { symbol: 'BTC', name: 'Bitcoin', value: 97845.23, change: 2345.67, changePercent: 2.45 },
  { symbol: 'TAO', name: 'Bittensor', value: 3180.45, change: 145.23, changePercent: 4.78 },
];

export default function MarketOverview() {
  const [indices, setIndices] = useState(MOCK_INDICES);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setIndices(prev => prev.map(idx => ({
        ...idx,
        change: idx.change + (Math.random() - 0.5) * 10,
        changePercent: idx.changePercent + (Math.random() - 0.5) * 0.1,
      })));
      setLastUpdate(new Date());
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Markets</h3>
        <span className="text-xs text-gray-500">
          Updated {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {indices.map((idx) => (
          <div 
            key={idx.symbol}
            className="bg-white/5 rounded-xl p-3 hover:bg-white/10 transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">{idx.symbol}</span>
              <span className={`text-xs font-medium ${
                idx.change >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {idx.change >= 0 ? '▲' : '▼'} {Math.abs(idx.changePercent).toFixed(2)}%
              </span>
            </div>
            <p className="text-white font-semibold">
              {idx.value < 1000 
                ? `$${idx.value.toFixed(2)}`
                : idx.value.toLocaleString(undefined, { maximumFractionDigits: 0 })
              }
            </p>
            <p className="text-xs text-gray-500">{idx.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
