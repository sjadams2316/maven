'use client';

import { useState } from 'react';

interface NetWorthCardProps {
  netWorth: number;
  change: number;
  changePercent: number;
  period?: '1D' | '1W' | '1M' | '3M' | 'YTD' | '1Y';
}

export default function NetWorthCard({ 
  netWorth = 1150000, 
  change = 12400, 
  changePercent = 1.09,
  period = '1M'
}: NetWorthCardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  const isPositive = change >= 0;
  
  // Mock data for different periods
  const periodData: Record<string, { change: number; percent: number }> = {
    '1D': { change: 2340, percent: 0.20 },
    '1W': { change: 8900, percent: 0.78 },
    '1M': { change: 12400, percent: 1.09 },
    '3M': { change: 45200, percent: 4.09 },
    'YTD': { change: 78500, percent: 7.32 },
    '1Y': { change: 156000, percent: 15.68 },
  };
  
  const currentData = periodData[selectedPeriod];
  const currentIsPositive = currentData.change >= 0;
  
  // Mock breakdown
  const breakdown = [
    { label: 'Investments', value: 920000, change: 2.1 },
    { label: 'Retirement', value: 233000, change: 1.8 },
    { label: 'Cash', value: 47000, change: 0.1 },
    { label: 'Crypto', value: -50000, change: -5.2 },
  ];
  
  return (
    <div className="bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-pink-900/20 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-indigo-300 text-sm">Net Worth</p>
          <button 
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition"
          >
            {showBreakdown ? 'Hide' : 'Show'} breakdown
          </button>
        </div>
        
        {/* Main Value */}
        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-4xl sm:text-5xl font-bold text-white">
            ${netWorth.toLocaleString()}
          </span>
        </div>
        
        {/* Change */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`text-lg font-semibold ${currentIsPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {currentIsPositive ? '+' : ''}{currentData.change.toLocaleString()} ({currentIsPositive ? '+' : ''}{currentData.percent.toFixed(2)}%)
          </span>
          <span className="text-gray-500 text-sm">{selectedPeriod}</span>
        </div>
        
        {/* Period Selector */}
        <div className="flex gap-1 mb-4">
          {Object.keys(periodData).map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              className={`px-3 py-1.5 text-xs rounded-lg transition ${
                selectedPeriod === p
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        
        {/* Breakdown */}
        {showBreakdown && (
          <div className="pt-4 border-t border-white/10 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {breakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{item.label}</span>
                <div className="text-right">
                  <span className="text-sm text-white">${Math.abs(item.value).toLocaleString()}</span>
                  <span className={`text-xs ml-2 ${item.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {item.change >= 0 ? '+' : ''}{item.change}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Mini Chart (visual only) */}
        <div className="mt-4 h-16 flex items-end gap-0.5">
          {[40, 45, 42, 48, 52, 49, 55, 58, 54, 60, 62, 65, 63, 68, 72, 70, 75, 78, 82, 80].map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t transition-all ${
                i === 19 ? 'bg-indigo-400' : 'bg-indigo-600/50 hover:bg-indigo-500/50'
              }`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
