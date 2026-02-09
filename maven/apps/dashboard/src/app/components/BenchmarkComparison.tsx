'use client';

import { useMemo } from 'react';
import { Term } from './InfoTooltip';

interface Holding {
  ticker: string;
  name?: string;
  shares: number;
  costBasis?: number;
  currentPrice?: number;
  currentValue?: number;
}

interface BenchmarkComparisonProps {
  holdings: Holding[];
  userAge?: number;
}

// Benchmark allocation definitions
const BENCHMARKS = {
  sp500: {
    name: 'S&P 500',
    shortName: 'SPY',
    description: '100% US large-cap stocks',
    icon: '🇺🇸',
    color: 'blue',
    allocation: { usEquity: 100, intlEquity: 0, bonds: 0, crypto: 0, cash: 0 },
    expectedReturn: 10.0,
    volatility: 18.0,
    maxDrawdown: -50,
  },
  sixtyForty: {
    name: '60/40 Portfolio',
    shortName: '60/40',
    description: '60% stocks, 40% bonds',
    icon: '⚖️',
    color: 'purple',
    allocation: { usEquity: 60, intlEquity: 0, bonds: 40, crypto: 0, cash: 0 },
    expectedReturn: 7.5,
    volatility: 11.0,
    maxDrawdown: -30,
  },
  // Age-based is calculated dynamically
};

// Color mappings for Tailwind classes
const BENCHMARK_COLORS: Record<string, { bg: string; bgLight: string; text: string; border: string }> = {
  blue: {
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
  },
  purple: {
    bg: 'bg-purple-500',
    bgLight: 'bg-purple-500/20',
    text: 'text-purple-400',
    border: 'border-purple-500/30',
  },
  emerald: {
    bg: 'bg-emerald-500',
    bgLight: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
  amber: {
    bg: 'bg-amber-500',
    bgLight: 'bg-amber-500/20',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
  },
  indigo: {
    bg: 'bg-indigo-500',
    bgLight: 'bg-indigo-500/20',
    text: 'text-indigo-400',
    border: 'border-indigo-500/30',
  },
};

// Asset class display info
const ASSET_CLASSES = [
  { key: 'usEquity', label: 'US Stocks', color: 'bg-blue-500' },
  { key: 'intlEquity', label: "Int'l Stocks", color: 'bg-purple-500' },
  { key: 'bonds', label: 'Bonds', color: 'bg-emerald-500' },
  { key: 'crypto', label: 'Crypto', color: 'bg-orange-500' },
  { key: 'cash', label: 'Cash', color: 'bg-gray-400' },
];

export default function BenchmarkComparison({ holdings, userAge = 35 }: BenchmarkComparisonProps) {
  // Calculate user's current allocation
  const userAllocation = useMemo(() => {
    const categories = { usEquity: 0, intlEquity: 0, bonds: 0, crypto: 0, cash: 0 };
    
    // Simple classification (matches Portfolio Lab logic)
    const classify = (ticker: string): keyof typeof categories => {
      const t = ticker.toUpperCase();
      if (['BTC', 'ETH', 'SOL', 'TAO', 'IBIT', 'FBTC', 'GBTC'].includes(t)) return 'crypto';
      if (['CASH', 'USD', 'SPAXX', 'VMFXX', 'SWVXX', 'FDRXX', 'SPRXX', 'FTEXX', 'VMMXX'].includes(t)) return 'cash';
      if (['BND', 'AGG', 'TLT', 'LQD', 'HYG', 'VCIT', 'VCSH', 'VGSH', 'VGIT', 'VGLT', 'SHY', 'IEF', 'TIP'].includes(t)) return 'bonds';
      if (['VXUS', 'VEA', 'VWO', 'IEFA', 'EFA', 'EEM', 'IXUS', 'SCHF', 'IEMG'].includes(t)) return 'intlEquity';
      return 'usEquity';
    };
    
    holdings.forEach((h) => {
      const cat = classify(h.ticker);
      categories[cat] += h.currentValue || 0;
    });
    
    // Convert to percentages
    const total = Object.values(categories).reduce((a, b) => a + b, 0) || 1;
    return {
      usEquity: (categories.usEquity / total) * 100,
      intlEquity: (categories.intlEquity / total) * 100,
      bonds: (categories.bonds / total) * 100,
      crypto: (categories.crypto / total) * 100,
      cash: (categories.cash / total) * 100,
    };
  }, [holdings]);
  
  // Calculate age-based target allocation (100 - age rule)
  const ageBasedAllocation = useMemo(() => {
    const stockPct = Math.max(20, Math.min(90, 100 - userAge));
    const bondPct = 100 - stockPct;
    return {
      usEquity: stockPct * 0.7, // 70% of stocks in US
      intlEquity: stockPct * 0.3, // 30% of stocks international
      bonds: bondPct,
      crypto: 0,
      cash: 0,
    };
  }, [userAge]);
  
  // Calculate expected metrics for user portfolio
  const userMetrics = useMemo(() => {
    // Simplified return/risk estimates by asset class
    const expectedReturn = 
      userAllocation.usEquity * 0.10 +
      userAllocation.intlEquity * 0.08 +
      userAllocation.bonds * 0.04 +
      userAllocation.crypto * 0.15 +
      userAllocation.cash * 0.02;
    
    const volatility = 
      userAllocation.usEquity * 0.18 +
      userAllocation.intlEquity * 0.22 +
      userAllocation.bonds * 0.06 +
      userAllocation.crypto * 0.60 +
      userAllocation.cash * 0.01;
    
    // Max drawdown estimate
    const maxDrawdown = -(
      userAllocation.usEquity * 0.50 +
      userAllocation.intlEquity * 0.55 +
      userAllocation.bonds * 0.15 +
      userAllocation.crypto * 0.80 +
      userAllocation.cash * 0.01
    ) / 100;
    
    // Sharpe ratio (assuming 4% risk-free)
    const riskFree = 4;
    const sharpe = volatility > 0 ? (expectedReturn - riskFree) / volatility : 0;
    
    return { expectedReturn, volatility, maxDrawdown: maxDrawdown * 100, sharpe };
  }, [userAllocation]);
  
  // Age-based metrics
  const ageBasedMetrics = useMemo(() => {
    const expectedReturn = 
      ageBasedAllocation.usEquity * 0.10 +
      ageBasedAllocation.intlEquity * 0.08 +
      ageBasedAllocation.bonds * 0.04;
    
    const volatility = 
      ageBasedAllocation.usEquity * 0.18 +
      ageBasedAllocation.intlEquity * 0.22 +
      ageBasedAllocation.bonds * 0.06;
    
    const maxDrawdown = -(
      ageBasedAllocation.usEquity * 0.50 +
      ageBasedAllocation.intlEquity * 0.55 +
      ageBasedAllocation.bonds * 0.15
    ) / 100;
    
    const sharpe = volatility > 0 ? (expectedReturn - 4) / volatility : 0;
    
    return { expectedReturn, volatility, maxDrawdown: maxDrawdown * 100, sharpe };
  }, [ageBasedAllocation]);
  
  // All benchmarks for comparison
  const allBenchmarks = useMemo(() => [
    {
      id: 'user',
      name: 'Your Portfolio',
      shortName: 'You',
      icon: '👤',
      color: 'indigo',
      allocation: userAllocation,
      metrics: userMetrics,
      isUser: true,
    },
    {
      id: 'sp500',
      name: 'S&P 500',
      shortName: 'SPY',
      icon: '🇺🇸',
      color: 'blue',
      allocation: BENCHMARKS.sp500.allocation,
      metrics: {
        expectedReturn: BENCHMARKS.sp500.expectedReturn,
        volatility: BENCHMARKS.sp500.volatility,
        maxDrawdown: BENCHMARKS.sp500.maxDrawdown,
        sharpe: (BENCHMARKS.sp500.expectedReturn - 4) / BENCHMARKS.sp500.volatility,
      },
      isUser: false,
    },
    {
      id: 'sixtyForty',
      name: '60/40 Portfolio',
      shortName: '60/40',
      icon: '⚖️',
      color: 'purple',
      allocation: BENCHMARKS.sixtyForty.allocation,
      metrics: {
        expectedReturn: BENCHMARKS.sixtyForty.expectedReturn,
        volatility: BENCHMARKS.sixtyForty.volatility,
        maxDrawdown: BENCHMARKS.sixtyForty.maxDrawdown,
        sharpe: (BENCHMARKS.sixtyForty.expectedReturn - 4) / BENCHMARKS.sixtyForty.volatility,
      },
      isUser: false,
    },
    {
      id: 'ageBased',
      name: `Age-Based (${100 - userAge}/${userAge})`,
      shortName: `${100 - userAge}/${userAge}`,
      icon: '🎯',
      color: 'emerald',
      allocation: ageBasedAllocation,
      metrics: ageBasedMetrics,
      isUser: false,
    },
  ], [userAllocation, userMetrics, ageBasedAllocation, ageBasedMetrics, userAge]);
  
  // Determine insights
  const insights = useMemo(() => {
    const items: { type: 'opportunity' | 'risk' | 'milestone'; message: string }[] = [];
    
    // Compare to 60/40
    const diffFrom6040 = Math.abs(userAllocation.bonds - 40);
    if (diffFrom6040 > 20) {
      if (userAllocation.bonds < 20) {
        items.push({
          type: 'risk',
          message: `Your bond allocation (${userAllocation.bonds.toFixed(0)}%) is much lower than the classic 60/40 mix. This means higher potential returns but more volatility.`,
        });
      } else {
        items.push({
          type: 'opportunity',
          message: `Your bond allocation (${userAllocation.bonds.toFixed(0)}%) is higher than the 60/40 mix. Consider if you want more growth exposure.`,
        });
      }
    }
    
    // Compare to age-based
    const ageBasedStocks = ageBasedAllocation.usEquity + ageBasedAllocation.intlEquity;
    const userStocks = userAllocation.usEquity + userAllocation.intlEquity;
    const stockDiff = userStocks - ageBasedStocks;
    
    if (Math.abs(stockDiff) > 15) {
      if (stockDiff > 0) {
        items.push({
          type: 'opportunity',
          message: `You're ${Math.abs(stockDiff).toFixed(0)}% more aggressive than the age-based rule suggests. Great for growth, but watch your risk tolerance.`,
        });
      } else {
        items.push({
          type: 'milestone',
          message: `You're ${Math.abs(stockDiff).toFixed(0)}% more conservative than the age-based rule. Good for stability if you're nearing retirement or risk-averse.`,
        });
      }
    }
    
    // Crypto exposure
    if (userAllocation.crypto > 10) {
      items.push({
        type: 'risk',
        message: `High crypto exposure (${userAllocation.crypto.toFixed(0)}%) significantly increases portfolio volatility. Traditional benchmarks have 0% crypto.`,
      });
    }
    
    // Sharpe ratio comparison
    if (userMetrics.sharpe > BENCHMARKS.sixtyForty.expectedReturn / BENCHMARKS.sixtyForty.volatility) {
      items.push({
        type: 'milestone',
        message: `Your risk-adjusted return (Sharpe ratio ${userMetrics.sharpe.toFixed(2)}) looks better than the 60/40 benchmark!`,
      });
    }
    
    return items;
  }, [userAllocation, ageBasedAllocation, userMetrics]);
  
  if (holdings.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          📊 <Term id="benchmark">Benchmark Comparison</Term>
        </h3>
        <p className="text-sm text-gray-400 mt-1">
          How your portfolio stacks up against common investment strategies
        </p>
      </div>
      
      {/* Allocation Comparison Bars */}
      <div className="space-y-6 mb-8">
        {allBenchmarks.map((benchmark) => {
          const colors = BENCHMARK_COLORS[benchmark.color];
          
          return (
            <div key={benchmark.id} className={`p-4 rounded-xl ${benchmark.isUser ? `${colors.bgLight} border ${colors.border}` : 'bg-white/5'}`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{benchmark.icon}</span>
                  <div>
                    <span className={`font-medium ${benchmark.isUser ? colors.text : 'text-white'}`}>
                      {benchmark.name}
                    </span>
                    {benchmark.isUser && (
                      <span className="ml-2 text-xs px-2 py-0.5 bg-indigo-500/30 text-indigo-300 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right text-xs text-gray-400">
                  <span className="block">
                    {benchmark.metrics.expectedReturn.toFixed(1)}% return
                  </span>
                  <span className="block">
                    {benchmark.metrics.volatility.toFixed(1)}% vol
                  </span>
                </div>
              </div>
              
              {/* Stacked bar */}
              <div className="h-6 rounded-full overflow-hidden flex bg-white/5">
                {ASSET_CLASSES.map((asset) => {
                  const value = benchmark.allocation[asset.key as keyof typeof benchmark.allocation];
                  if (value <= 0) return null;
                  return (
                    <div
                      key={asset.key}
                      className={`${asset.color} flex items-center justify-center text-xs font-medium text-white/90 transition-all duration-300`}
                      style={{ width: `${value}%` }}
                      title={`${asset.label}: ${value.toFixed(1)}%`}
                    >
                      {value >= 10 && `${value.toFixed(0)}%`}
                    </div>
                  );
                })}
              </div>
              
              {/* Mini legend inline */}
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                {ASSET_CLASSES.map((asset) => {
                  const value = benchmark.allocation[asset.key as keyof typeof benchmark.allocation];
                  if (value <= 0) return null;
                  return (
                    <div key={asset.key} className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${asset.color}`} />
                      <span>{asset.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Risk-Adjusted Metrics Comparison */}
      <div className="bg-white/5 rounded-xl p-5 mb-6">
        <h4 className="font-medium text-white mb-4 flex items-center gap-2">
          📐 <Term id="risk-adjusted-return">Risk-Adjusted Metrics</Term>
        </h4>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-white/10">
                <th className="text-left py-2 font-medium">Portfolio</th>
                <th className="text-center py-2 font-medium">
                  <Term id="expected-return">Exp. Return</Term>
                </th>
                <th className="text-center py-2 font-medium">
                  <Term id="volatility">Volatility</Term>
                </th>
                <th className="text-center py-2 font-medium">
                  <Term id="sharpe-ratio">Sharpe</Term>
                </th>
                <th className="text-center py-2 font-medium">
                  <Term id="max-drawdown">Max Drawdown</Term>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {allBenchmarks.map((benchmark) => {
                const colors = BENCHMARK_COLORS[benchmark.color];
                return (
                  <tr key={benchmark.id} className={benchmark.isUser ? colors.bgLight : ''}>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span>{benchmark.icon}</span>
                        <span className={benchmark.isUser ? colors.text : 'text-white'}>
                          {benchmark.shortName}
                        </span>
                      </div>
                    </td>
                    <td className={`py-3 text-center ${benchmark.isUser ? colors.text : 'text-white'}`}>
                      {benchmark.metrics.expectedReturn.toFixed(1)}%
                    </td>
                    <td className={`py-3 text-center ${benchmark.metrics.volatility > 15 ? 'text-amber-400' : 'text-gray-300'}`}>
                      {benchmark.metrics.volatility.toFixed(1)}%
                    </td>
                    <td className={`py-3 text-center ${benchmark.metrics.sharpe > 0.35 ? 'text-emerald-400' : 'text-gray-300'}`}>
                      {benchmark.metrics.sharpe.toFixed(2)}
                    </td>
                    <td className="py-3 text-center text-red-400">
                      {benchmark.metrics.maxDrawdown.toFixed(0)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Insights */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-white flex items-center gap-2">
            💡 Key Insights
          </h4>
          {insights.map((insight, idx) => {
            const config = {
              opportunity: { icon: '📈', bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-300' },
              risk: { icon: '⚠️', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-300' },
              milestone: { icon: '🎯', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-300' },
            }[insight.type];
            
            return (
              <div key={idx} className={`p-3 rounded-lg ${config.bg} border ${config.border}`}>
                <div className="flex items-start gap-2">
                  <span className="text-lg">{config.icon}</span>
                  <p className={`text-sm ${config.text}`}>{insight.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Educational Note */}
      <p className="mt-6 text-xs text-gray-500 leading-relaxed">
        💡 <strong>Note:</strong> Expected returns and volatility are historical estimates and don't guarantee future performance. 
        The "100 minus age" rule ({100 - userAge}% stocks at age {userAge}) is a traditional guideline — your actual allocation 
        should reflect your personal risk tolerance, time horizon, and financial goals.
      </p>
    </div>
  );
}
