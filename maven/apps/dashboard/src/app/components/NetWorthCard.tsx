'use client';

import { useState, useMemo } from 'react';

interface NetWorthCardProps {
  netWorth: number;
  change: number;
  changePercent: number;
  period?: '1D' | '1W' | '1M' | '3M' | 'YTD' | '1Y';
  /** Timestamp when prices were last updated */
  asOfTime?: Date | null;
  /** Whether prices are currently being refreshed */
  isRefreshing?: boolean;
}

// Generate realistic historical data based on current net worth and period
function generateHistoricalData(currentValue: number, period: string): { value: number; date: string }[] {
  const now = new Date();
  const points: { value: number; date: string }[] = [];
  
  // Define how far back and how many points based on period
  const config: Record<string, { days: number; points: number; volatility: number }> = {
    '1D': { days: 1, points: 24, volatility: 0.003 },
    '1W': { days: 7, points: 14, volatility: 0.008 },
    '1M': { days: 30, points: 20, volatility: 0.015 },
    '3M': { days: 90, points: 20, volatility: 0.04 },
    'YTD': { days: Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24)), points: 20, volatility: 0.07 },
    '1Y': { days: 365, points: 20, volatility: 0.15 },
  };
  
  const { days, points: numPoints, volatility } = config[period] || config['1M'];
  
  // Start from an earlier value and grow towards current
  // Add some randomness for realistic variation
  const startValue = currentValue * (1 - volatility * (0.5 + Math.random() * 0.5));
  
  for (let i = 0; i < numPoints; i++) {
    const progress = i / (numPoints - 1);
    const daysAgo = Math.floor(days * (1 - progress));
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    
    // Interpolate with some noise
    const trend = startValue + (currentValue - startValue) * progress;
    const noise = trend * (Math.random() - 0.5) * volatility * 0.3;
    const value = Math.round(trend + noise);
    
    points.push({
      value,
      date: formatDate(date, period),
    });
  }
  
  // Ensure last point is exactly current value
  points[points.length - 1].value = currentValue;
  
  return points;
}

function formatDate(date: Date, period: string): string {
  if (period === '1D') {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  if (period === '1W' || period === '1M') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function formatDollar(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

export default function NetWorthCard({ 
  netWorth = 797500, 
  change = 8500, 
  changePercent = 1.08,
  period = '1M',
  asOfTime,
  isRefreshing = false,
}: NetWorthCardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  
  // Historical change data - currently illustrative until we have real tracking
  // TODO: Integrate with historical price data for accurate period changes
  const hasRealHistoricalData = false; // Will be true when we have actual historical tracking
  
  // Calculate illustrative changes based on typical market movements
  // These are NOT real values - just reasonable estimates for demonstration
  const illustrativeChanges: Record<string, { change: number; percent: number }> = {
    '1D': { change: Math.round(netWorth * 0.002), percent: 0.20 },
    '1W': { change: Math.round(netWorth * 0.008), percent: 0.80 },
    '1M': { change: Math.round(netWorth * 0.011), percent: 1.10 },
    '3M': { change: Math.round(netWorth * 0.04), percent: 4.00 },
    'YTD': { change: Math.round(netWorth * 0.073), percent: 7.30 },
    '1Y': { change: Math.round(netWorth * 0.157), percent: 15.70 },
  };
  
  const currentData = illustrativeChanges[selectedPeriod];
  const currentIsPositive = currentData.change >= 0;
  
  // Generate historical data for chart
  const chartData = useMemo(() => 
    generateHistoricalData(netWorth, selectedPeriod),
    [netWorth, selectedPeriod]
  );
  
  // Calculate chart scaling for meaningful variation
  const { minValue, maxValue, yAxisLabels, barHeights } = useMemo(() => {
    const values = chartData.map(d => d.value);
    const dataMin = Math.min(...values);
    const dataMax = Math.max(...values);
    
    // Add padding for visual clarity (10% above and below)
    const range = dataMax - dataMin;
    const padding = Math.max(range * 0.1, dataMax * 0.02); // At least 2% of max for very flat data
    
    const min = Math.floor((dataMin - padding) / 1000) * 1000;
    const max = Math.ceil((dataMax + padding) / 1000) * 1000;
    
    // Generate 3 Y-axis labels (bottom, middle, top)
    const labels = [
      min,
      Math.round((min + max) / 2 / 1000) * 1000,
      max,
    ];
    
    // Calculate bar heights as percentage of chart area
    const heights = chartData.map(d => {
      const normalized = (d.value - min) / (max - min);
      return Math.max(5, normalized * 100); // Minimum 5% height for visibility
    });
    
    return {
      minValue: min,
      maxValue: max,
      yAxisLabels: labels,
      barHeights: heights,
    };
  }, [chartData]);
  
  // Calculate period change for indicator
  const periodChangePercent = chartData.length > 1 
    ? ((chartData[chartData.length - 1].value - chartData[0].value) / chartData[0].value * 100)
    : 0;
  
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
        <div className="flex items-baseline gap-3 mb-1">
          <span className="text-4xl sm:text-5xl font-bold text-white">
            ${netWorth.toLocaleString()}
          </span>
        </div>
        
        {/* Live Price Indicator */}
        {asOfTime && (
          <div className="flex items-center gap-1.5 mb-3">
            <span className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-xs text-gray-400">
              {isRefreshing ? 'Updating prices...' : `as of ${asOfTime.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true,
                timeZoneName: 'short',
              })}`}
            </span>
          </div>
        )}
        
        {/* Change */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`text-lg font-semibold ${currentIsPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {currentIsPositive ? '+' : ''}${currentData.change.toLocaleString()} ({currentIsPositive ? '+' : ''}{currentData.percent.toFixed(2)}%)
          </span>
          <span className="text-gray-500 text-sm">{selectedPeriod}</span>
          {!hasRealHistoricalData && (
            <span className="text-[10px] text-gray-600 bg-gray-800/50 px-1.5 py-0.5 rounded" title="Based on typical market returns, not your actual historical performance">
              illustrative
            </span>
          )}
        </div>
        
        {/* Period Selector */}
        <div className="flex gap-1 mb-4">
          {(Object.keys(periodData) as Array<'1D' | '1W' | '1M' | '3M' | 'YTD' | '1Y'>).map((p) => (
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
        
        {/* Enhanced Chart with Y-axis labels */}
        <div className="mt-4">
          {/* Period change indicator */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Net Worth Over Time</span>
            <span className={`text-xs font-medium ${periodChangePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {periodChangePercent >= 0 ? '↑' : '↓'} {Math.abs(periodChangePercent).toFixed(1)}% this {selectedPeriod === 'YTD' ? 'year' : 'period'}
            </span>
          </div>
          
          <div className="flex gap-2">
            {/* Y-axis labels */}
            <div className="flex flex-col justify-between h-20 text-right pr-2 py-1">
              <span className="text-[10px] text-gray-500">{formatDollar(yAxisLabels[2])}</span>
              <span className="text-[10px] text-gray-500">{formatDollar(yAxisLabels[1])}</span>
              <span className="text-[10px] text-gray-500">{formatDollar(yAxisLabels[0])}</span>
            </div>
            
            {/* Chart bars */}
            <div className="flex-1 h-20 flex items-end gap-0.5 relative">
              {chartData.map((point, i) => (
                <div
                  key={i}
                  className="flex-1 relative group"
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Bar */}
                  <div
                    className={`w-full rounded-t transition-all cursor-pointer ${
                      i === chartData.length - 1 
                        ? 'bg-indigo-400' 
                        : hoveredBar === i 
                          ? 'bg-indigo-400/80' 
                          : 'bg-indigo-600/50 hover:bg-indigo-500/60'
                    }`}
                    style={{ height: `${barHeights[i]}%` }}
                  />
                  
                  {/* Hover tooltip */}
                  {hoveredBar === i && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-10 whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                      <p className="text-xs font-medium text-white">${point.value.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400">{point.date}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* X-axis labels (first, middle, last) */}
          <div className="flex justify-between mt-1 ml-12 text-[10px] text-gray-500">
            <span>{chartData[0]?.date}</span>
            <span>{chartData[Math.floor(chartData.length / 2)]?.date}</span>
            <span>{chartData[chartData.length - 1]?.date}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
