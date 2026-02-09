'use client';

import { useMemo, useState } from 'react';
import { Term } from './InfoTooltip';
import {
  calculatePortfolioFactorExposures,
  getFactorInterpretation,
  getBenchmarkFactorExposures,
  FactorExposures,
} from '@/lib/portfolio-utils';

interface Holding {
  ticker: string;
  name?: string;
  shares: number;
  costBasis: number;
  currentPrice?: number;
  currentValue?: number;
}

interface FactorExposureSectionProps {
  holdings: Holding[];
}

// Factor metadata for display
const FACTOR_INFO: Record<string, {
  name: string;
  termId: string;
  icon: string;
  description: string;
  range: [number, number];
  neutralValue: number;
  lowLabel: string;
  highLabel: string;
  color: string;
}> = {
  marketBeta: {
    name: 'Market Beta',
    termId: 'market-beta',
    icon: '📈',
    description: 'Sensitivity to overall market movements',
    range: [0.5, 1.5] as [number, number],
    neutralValue: 1.0,
    lowLabel: 'Defensive',
    highLabel: 'Aggressive',
    color: 'blue',
  },
  size: {
    name: 'Size',
    termId: 'size-factor',
    icon: '📏',
    description: 'Exposure to company size (small vs large)',
    range: [-1, 1] as [number, number],
    neutralValue: 0,
    lowLabel: 'Large Cap',
    highLabel: 'Small Cap',
    color: 'purple',
  },
  value: {
    name: 'Value',
    termId: 'value-factor',
    icon: '💎',
    description: 'Value vs growth stock exposure',
    range: [-1, 1] as [number, number],
    neutralValue: 0,
    lowLabel: 'Growth',
    highLabel: 'Value',
    color: 'emerald',
  },
  momentum: {
    name: 'Momentum',
    termId: 'momentum-factor',
    icon: '🚀',
    description: 'Exposure to recent winners',
    range: [-1, 1] as [number, number],
    neutralValue: 0,
    lowLabel: 'Laggards',
    highLabel: 'Winners',
    color: 'orange',
  },
  quality: {
    name: 'Quality',
    termId: 'quality-factor',
    icon: '⭐',
    description: 'Exposure to financially healthy companies',
    range: [-1, 1] as [number, number],
    neutralValue: 0,
    lowLabel: 'Speculative',
    highLabel: 'High Quality',
    color: 'cyan',
  },
};

// Color mappings for Tailwind classes
const FACTOR_COLORS = {
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
  orange: {
    bg: 'bg-orange-500',
    bgLight: 'bg-orange-500/20',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
  },
  cyan: {
    bg: 'bg-cyan-500',
    bgLight: 'bg-cyan-500/20',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
  },
};

export default function FactorExposureSection({ holdings }: FactorExposureSectionProps) {
  const [showBenchmark, setShowBenchmark] = useState(true);
  const [selectedBenchmark, setSelectedBenchmark] = useState<'sp500' | '6040' | 'total_market'>('total_market');
  
  // Calculate factor exposures
  const factorExposures = useMemo(() => {
    return calculatePortfolioFactorExposures(holdings);
  }, [holdings]);
  
  const benchmarkExposures = useMemo(() => {
    return getBenchmarkFactorExposures(selectedBenchmark);
  }, [selectedBenchmark]);
  
  const interpretation = useMemo(() => {
    return getFactorInterpretation(factorExposures);
  }, [factorExposures]);
  
  // Helper to get bar position percentage for a factor value
  const getBarPosition = (value: number, range: [number, number], neutralValue: number) => {
    const [min, max] = range;
    // Normalize to 0-100 scale
    const normalized = ((value - min) / (max - min)) * 100;
    return Math.max(0, Math.min(100, normalized));
  };
  
  // Helper to get neutral marker position
  const getNeutralPosition = (range: [number, number], neutralValue: number) => {
    const [min, max] = range;
    return ((neutralValue - min) / (max - min)) * 100;
  };
  
  if (holdings.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            🎚️ <Term id="factor-exposure">Factor Exposures</Term>
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            How your portfolio tilts toward key return drivers
          </p>
        </div>
        
        {/* Benchmark toggle */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={showBenchmark}
              onChange={(e) => setShowBenchmark(e.target.checked)}
              className="rounded bg-white/10 border-white/20 text-indigo-500 focus:ring-indigo-500"
            />
            Compare to
          </label>
          <select
            value={selectedBenchmark}
            onChange={(e) => setSelectedBenchmark(e.target.value as typeof selectedBenchmark)}
            disabled={!showBenchmark}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          >
            <option value="total_market">Total Market</option>
            <option value="sp500">S&P 500</option>
            <option value="6040">60/40 Portfolio</option>
          </select>
        </div>
      </div>
      
      {/* Factor Bars */}
      <div className="space-y-6">
        {(Object.keys(FACTOR_INFO) as Array<keyof FactorExposures>).map((factorKey) => {
          const info = FACTOR_INFO[factorKey];
          const colors = FACTOR_COLORS[info.color as keyof typeof FACTOR_COLORS];
          const value = factorExposures[factorKey as keyof FactorExposures];
          const benchmarkValue = benchmarkExposures[factorKey as keyof FactorExposures];
          const position = getBarPosition(value, info.range, info.neutralValue);
          const benchmarkPosition = getBarPosition(benchmarkValue, info.range, info.neutralValue);
          const neutralPosition = getNeutralPosition(info.range, info.neutralValue);
          
          // Determine if this factor is significantly tilted
          const deviation = Math.abs(value - info.neutralValue);
          const isSignificant = factorKey === 'marketBeta' 
            ? deviation > 0.2 
            : deviation > 0.25;
          
          return (
            <div key={factorKey} className="space-y-2">
              {/* Factor header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{info.icon}</span>
                  <Term id={info.termId}>
                    <span className="text-white font-medium">{info.name}</span>
                  </Term>
                  {isSignificant && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bgLight} ${colors.text}`}>
                      {value > info.neutralValue ? 'High' : 'Low'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-semibold ${colors.text}`}>
                    {factorKey === 'marketBeta' ? value.toFixed(2) : (value > 0 ? '+' : '') + value.toFixed(2)}
                  </span>
                  {showBenchmark && (
                    <span className="text-xs text-gray-500">
                      vs {factorKey === 'marketBeta' ? benchmarkValue.toFixed(2) : (benchmarkValue > 0 ? '+' : '') + benchmarkValue.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Factor bar */}
              <div className="relative">
                {/* Background bar */}
                <div className="h-3 bg-white/5 rounded-full overflow-hidden relative">
                  {/* Neutral marker */}
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-white/30 z-10"
                    style={{ left: `${neutralPosition}%` }}
                  />
                  
                  {/* Benchmark marker (if enabled) */}
                  {showBenchmark && (
                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-gray-500/50 z-10 rounded"
                      style={{ left: `${benchmarkPosition}%`, transform: 'translateX(-50%)' }}
                      title={`Benchmark: ${benchmarkValue.toFixed(2)}`}
                    />
                  )}
                  
                  {/* Value indicator */}
                  <div 
                    className={`absolute top-0 bottom-0 w-2.5 h-3 ${colors.bg} rounded-full z-20 shadow-lg transition-all duration-300`}
                    style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                  />
                  
                  {/* Fill from neutral to value */}
                  {value !== info.neutralValue && (
                    <div 
                      className={`absolute top-0.5 bottom-0.5 ${colors.bg} opacity-30 rounded-full`}
                      style={{
                        left: value > info.neutralValue 
                          ? `${neutralPosition}%` 
                          : `${position}%`,
                        width: `${Math.abs(position - neutralPosition)}%`,
                      }}
                    />
                  )}
                </div>
                
                {/* Labels */}
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>{info.lowLabel}</span>
                  <span>{info.highLabel}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Interpretation Section */}
      <div className={`mt-6 p-4 rounded-xl border ${
        interpretation.riskLevel === 'high' 
          ? 'bg-amber-500/10 border-amber-500/30' 
          : interpretation.riskLevel === 'low'
          ? 'bg-emerald-500/10 border-emerald-500/30'
          : 'bg-indigo-500/10 border-indigo-500/30'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 ${
            interpretation.riskLevel === 'high' 
              ? 'bg-amber-500/20' 
              : interpretation.riskLevel === 'low'
              ? 'bg-emerald-500/20'
              : 'bg-indigo-500/20'
          }`}>
            {interpretation.riskLevel === 'high' ? '⚡' : interpretation.riskLevel === 'low' ? '🛡️' : '⚖️'}
          </div>
          <div>
            <h4 className="font-medium text-white mb-1">{interpretation.summary}</h4>
            <ul className="space-y-1">
              {interpretation.details.slice(0, 3).map((detail, idx) => (
                <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                  <span className="text-gray-600 mt-0.5">•</span>
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          <span>Your Portfolio</span>
        </div>
        {showBenchmark && (
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded bg-gray-500/50" />
            <span>
              {selectedBenchmark === 'sp500' ? 'S&P 500' : 
               selectedBenchmark === '6040' ? '60/40 Portfolio' : 
               'Total Market'}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-0.5 h-3 bg-white/30" />
          <span>Neutral</span>
        </div>
      </div>
      
      {/* Educational note */}
      <p className="mt-4 text-xs text-gray-500 leading-relaxed">
        💡 Factor exposures are estimated based on holding characteristics. Academic research (Fama-French, Carhart) 
        shows these factors explain much of portfolio returns over time. A well-diversified portfolio typically 
        has balanced factor exposures, though intentional tilts can be part of a valid investment strategy.
      </p>
    </div>
  );
}
