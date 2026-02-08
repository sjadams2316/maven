'use client';

import { useState } from 'react';
import { CURRENT_VIEWS, AssetClassView } from '@/lib/investment-thesis/current-views';
import Link from 'next/link';

interface ThesisInsightProps {
  // Current allocation
  allocation: {
    usEquity: number;
    intlEquity: number;
    bonds: number;
    crypto: number;
    cash: number;
  };
  // What we're recommending
  changes?: {
    asset: string;
    from: number;
    to: number;
    action: 'buy' | 'sell';
  }[];
  // Compact mode for inline display
  compact?: boolean;
  className?: string;
}

// Map allocation keys to thesis view IDs
const ALLOCATION_TO_VIEW: Record<string, string> = {
  usEquity: 'us-large-cap',
  intlEquity: 'intl-developed',
  bonds: 'us-bonds',
  crypto: 'crypto',
};

// Get stance badge color
function getStanceColor(stance: string) {
  switch (stance) {
    case 'overweight': return 'text-green-400';
    case 'underweight': return 'text-red-400';
    default: return 'text-gray-400';
  }
}

// Check if allocation is within thesis range
function checkAllocationVsThesis(key: string, pct: number): { status: 'below' | 'within' | 'above'; view: AssetClassView | undefined } {
  const viewId = ALLOCATION_TO_VIEW[key];
  const view = CURRENT_VIEWS.find(v => v.id === viewId);
  
  if (!view) return { status: 'within', view: undefined };
  
  if (pct < view.recommendation.targetRange.min) return { status: 'below', view };
  if (pct > view.recommendation.targetRange.max) return { status: 'above', view };
  return { status: 'within', view };
}

export function ThesisInsight({ allocation, changes, compact = false, className = '' }: ThesisInsightProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Analyze current allocation vs thesis
  const insights: { key: string; name: string; pct: number; status: 'below' | 'within' | 'above'; view: AssetClassView }[] = [];
  
  for (const [key, pct] of Object.entries(allocation)) {
    if (key === 'cash' || key === 'alternatives') continue;
    const { status, view } = checkAllocationVsThesis(key, pct);
    if (view) {
      const names: Record<string, string> = {
        usEquity: 'US Stocks',
        intlEquity: 'International',
        bonds: 'Bonds',
        crypto: 'Crypto',
      };
      insights.push({ key, name: names[key] || key, pct, status, view });
    }
  }
  
  const outOfRange = insights.filter(i => i.status !== 'within');
  
  if (compact) {
    return (
      <div className={`bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <span className="text-xl">📊</span>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-amber-400 font-medium text-sm">Thesis Check</p>
              <Link href="/investment-thesis" className="text-xs text-indigo-400 hover:underline">
                View our thesis →
              </Link>
            </div>
            {outOfRange.length === 0 ? (
              <p className="text-sm text-gray-400 mt-1">
                ✓ Your allocation is within our recommended ranges
              </p>
            ) : (
              <div className="mt-2 space-y-1">
                {outOfRange.map(insight => (
                  <p key={insight.key} className="text-sm text-gray-300">
                    <span className={insight.status === 'below' ? 'text-blue-400' : 'text-amber-400'}>
                      {insight.name} ({insight.pct.toFixed(0)}%)
                    </span>
                    {' '}is {insight.status === 'below' ? 'below' : 'above'} our{' '}
                    {insight.view.recommendation.targetRange.min}-{insight.view.recommendation.targetRange.max}% target
                    <span className={`ml-1 ${getStanceColor(insight.view.recommendation.stance)}`}>
                      ({insight.view.recommendation.stance})
                    </span>
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-6 text-left hover:bg-white/5 transition"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-2xl flex-shrink-0">
            📊
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Investment Thesis Check</h3>
              <span className="text-xs text-gray-500">{expanded ? '▲ Less' : '▼ More'}</span>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Not just math — here's <strong>why</strong> we recommend these changes
            </p>
            
            {/* Quick summary */}
            <div className="flex flex-wrap gap-2 mt-3">
              {insights.map(insight => {
                const statusColors = {
                  below: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                  within: 'bg-green-500/20 text-green-400 border-green-500/30',
                  above: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                };
                return (
                  <span 
                    key={insight.key}
                    className={`px-2 py-1 text-xs rounded border ${statusColors[insight.status]}`}
                  >
                    {insight.name}: {insight.pct.toFixed(0)}%
                    {insight.status !== 'within' && (
                      <span className="ml-1 opacity-70">
                        ({insight.status === 'below' ? '↓' : '↑'})
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </button>
      
      {/* Expanded details */}
      {expanded && (
        <div className="px-6 pb-6 border-t border-amber-500/20 pt-4 space-y-4">
          {insights.map(insight => (
            <div key={insight.key} className="bg-black/20 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-white font-medium">{insight.name}</h4>
                  <p className="text-xs text-gray-500">
                    Current: {insight.pct.toFixed(1)}% | Target: {insight.view.recommendation.targetRange.min}-{insight.view.recommendation.targetRange.max}%
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  insight.view.valuation.vsHistory === 'cheap' ? 'bg-green-500/20 text-green-400' :
                  insight.view.valuation.vsHistory === 'expensive' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {insight.view.valuation.vsHistory}
                </span>
              </div>
              
              <p className="text-sm text-gray-300 mb-2">
                {insight.view.recommendation.reasoning.split('.')[0]}.
              </p>
              
              {/* Key caveat */}
              <div className="text-xs text-amber-400 italic">
                ⚠️ {insight.view.uncertainty.timingRisk.split('.')[0]}.
              </div>
              
              {/* Expected returns */}
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <span>10-Year Expected:</span>
                <span className="text-gray-300">
                  {insight.view.expectedReturn.tenYear.low}% - {insight.view.expectedReturn.tenYear.high}%
                </span>
                <span className="text-gray-600">({insight.view.expectedReturn.source})</span>
              </div>
            </div>
          ))}
          
          <Link 
            href="/investment-thesis"
            className="block text-center py-3 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-xl text-indigo-400 text-sm font-medium transition"
          >
            View Full Investment Thesis →
          </Link>
        </div>
      )}
    </div>
  );
}

// Export a function to generate thesis-backed trade explanations
export function getTradeExplanation(asset: string, action: 'buy' | 'sell', currentPct: number): string {
  const viewMap: Record<string, string> = {
    'US Equity': 'us-large-cap',
    'US Stocks': 'us-large-cap',
    'International': 'intl-developed',
    'Intl Equity': 'intl-developed',
    'Bonds': 'us-bonds',
    'Fixed Income': 'us-bonds',
    'Crypto': 'crypto',
  };
  
  const viewId = viewMap[asset];
  const view = CURRENT_VIEWS.find(v => v.id === viewId);
  
  if (!view) return '';
  
  const { stance, targetRange, reasoning } = view.recommendation;
  const { vsHistory } = view.valuation;
  
  if (action === 'buy') {
    return `${view.name} is currently ${vsHistory}. Our stance is ${stance} (${targetRange.min}-${targetRange.max}%). ${reasoning.split('.')[0]}.`;
  } else {
    return `Trimming ${view.name} from ${currentPct.toFixed(0)}% (above our ${targetRange.max}% target). ${view.uncertainty.whatCouldGoWrong[0]}.`;
  }
}
