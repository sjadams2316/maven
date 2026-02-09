'use client';

import { useState, useEffect } from 'react';
import { AnimatedCurrency, AnimatedPercent } from './AnimatedNumber';
import SparklineChart from './SparklineChart';

interface WealthPulseProps {
  netWorth: number;
  dayChange: number;
  dayChangePercent: number;
  weekData: number[];
  monthData: number[];
}

export default function WealthPulse({
  netWorth = 797500,
  dayChange = 2340,
  dayChangePercent = 0.29,
  weekData = [775000, 780000, 778000, 785000, 790000, 794000, 797500],
  monthData = [755000, 765000, 760000, 770000, 775000, 780000, 778000, 785000, 790000, 794000, 796000, 797500],
}: WealthPulseProps) {
  const [activeTimeframe, setActiveTimeframe] = useState<'day' | 'week' | 'month'>('week');
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  const chartData = activeTimeframe === 'week' ? weekData : monthData;
  const isPositive = dayChange >= 0;
  
  return (
    <div className={`relative overflow-hidden transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Ambient glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />
      
      <div className="relative bg-gradient-to-br from-[#12121a] via-[#15152a] to-[#12121a] border border-white/10 rounded-3xl p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-gray-400 text-sm mb-1 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Live Net Worth
            </p>
            <div className="flex items-baseline gap-3">
              <AnimatedCurrency 
                value={netWorth}
                duration={1500}
                className="text-5xl font-bold text-white tracking-tight"
              />
            </div>
          </div>
          
          {/* Change indicator */}
          <div className={`px-4 py-2 rounded-2xl ${isPositive ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
            <div className="flex items-center gap-2">
              <span className={`text-2xl ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPositive ? '↑' : '↓'}
              </span>
              <div>
                <AnimatedCurrency
                  value={Math.abs(dayChange)}
                  className={`text-lg font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}
                />
                <AnimatedPercent
                  value={dayChangePercent}
                  className={`text-sm block ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Today</p>
          </div>
        </div>
        
        {/* Sparkline */}
        <div className="mb-4">
          <SparklineChart
            data={chartData}
            width={400}
            height={80}
            color="auto"
            strokeWidth={2.5}
            animated={true}
            className="w-full"
          />
        </div>
        
        {/* Timeframe selector */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {(['day', 'week', 'month'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setActiveTimeframe(tf)}
                className={`px-4 py-2 text-sm rounded-xl transition-all ${
                  activeTimeframe === tf
                    ? 'bg-white/10 text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tf === 'day' ? '24H' : tf === 'week' ? '7D' : '30D'}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">High:</span>
              <span className="text-white">${Math.max(...chartData).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Low:</span>
              <span className="text-white">${Math.min(...chartData).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
