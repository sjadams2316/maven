'use client';

import { useState } from 'react';
import Header from '@/app/components/Header';
import DemoBanner from '@/app/components/DemoBanner';
import { CURRENT_VIEWS, AssetClassView } from '@/lib/investment-thesis/current-views';

// Stance badge
function StanceBadge({ stance }: { stance: AssetClassView['recommendation']['stance'] }) {
  const colors = {
    underweight: 'bg-red-500/20 text-red-400 border-red-500/30',
    neutral: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    overweight: 'bg-green-500/20 text-green-400 border-green-500/30',
  };
  
  const labels = {
    underweight: '↓ Underweight',
    neutral: '→ Neutral',
    overweight: '↑ Overweight',
  };
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded border ${colors[stance]}`}>
      {labels[stance]}
    </span>
  );
}

// Valuation indicator
function ValuationBadge({ valuation }: { valuation: 'cheap' | 'fair' | 'expensive' }) {
  const colors = {
    cheap: 'text-green-400',
    fair: 'text-yellow-400',
    expensive: 'text-red-400',
  };
  
  const icons = {
    cheap: '💚',
    fair: '💛',
    expensive: '❤️',
  };
  
  return (
    <span className={`${colors[valuation]} text-sm`}>
      {icons[valuation]} {valuation.charAt(0).toUpperCase() + valuation.slice(1)}
    </span>
  );
}

// Expected return range
function ReturnRange({ returns }: { returns: { low: number; mid: number; high: number } }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden relative">
        <div 
          className="absolute h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 opacity-30"
          style={{ left: '0%', width: '100%' }}
        />
        <div 
          className="absolute h-full bg-indigo-500"
          style={{ 
            left: `${((returns.low + 50) / 100) * 100}%`, 
            width: `${((returns.high - returns.low) / 100) * 100}%` 
          }}
        />
      </div>
      <span className="text-sm text-gray-400 w-32 text-right">
        {returns.low}% - {returns.high}%
      </span>
    </div>
  );
}

// Asset class detail card
function AssetClassCard({ view, isExpanded, onToggle }: { 
  view: AssetClassView; 
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={onToggle}
        className="w-full p-6 text-left hover:bg-gray-800/50 transition"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-white">{view.name}</h3>
              <StanceBadge stance={view.recommendation.stance} />
            </div>
            <p className="text-gray-400 text-sm line-clamp-2">{view.recommendation.reasoning}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <ValuationBadge valuation={view.valuation.vsHistory} />
            <span className="text-xs text-gray-500">
              {view.recommendation.targetRange.min}-{view.recommendation.targetRange.max}% allocation
            </span>
          </div>
        </div>
        
        {/* Expected returns */}
        <div className="mt-4">
          <div className="text-xs text-gray-500 mb-1">10-Year Expected Return</div>
          <ReturnRange returns={view.expectedReturn.tenYear} />
        </div>
        
        {/* Expand indicator */}
        <div className="mt-3 text-center">
          <span className="text-xs text-indigo-400">
            {isExpanded ? '▲ Less detail' : '▼ Full thesis'}
          </span>
        </div>
      </button>
      
      {/* Expanded content */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-6 border-t border-gray-700 pt-6">
          {/* Structural Case */}
          <div>
            <h4 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-2">
              Structural Case
            </h4>
            <p className="text-gray-300 text-sm leading-relaxed">{view.structuralCase}</p>
            <p className="text-gray-500 text-sm mt-2">
              <strong>Portfolio Role:</strong> {view.portfolioRole}
            </p>
          </div>
          
          {/* Valuation */}
          <div>
            <h4 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-2">
              Valuation Assessment
            </h4>
            <p className="text-gray-300 text-sm mb-3">{view.valuation.current}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {view.valuation.keyMetrics.map((metric, idx) => (
                <div key={idx} className="bg-gray-900/50 rounded-lg p-3">
                  <div className="text-xs text-gray-500">{metric.name}</div>
                  <div className="text-lg font-semibold text-white">{metric.value}</div>
                  <div className="text-xs text-gray-500">{metric.historical}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Regime Context */}
          <div>
            <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-2">
              Current Regime
            </h4>
            <p className="text-gray-300 text-sm mb-3">{view.regime.current}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-green-400 font-medium mb-2">Catalysts ↑</div>
                <ul className="space-y-1">
                  {view.regime.catalysts.map((c, idx) => (
                    <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                      <span className="text-green-400">+</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs text-red-400 font-medium mb-2">Headwinds ↓</div>
                <ul className="space-y-1">
                  {view.regime.headwinds.map((h, idx) => (
                    <li key={idx} className="text-sm text-gray-400 flex items-start gap-2">
                      <span className="text-red-400">-</span> {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          {/* Uncertainty */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-2">
              ⚠️ Honest Uncertainty
            </h4>
            <p className="text-gray-300 text-sm mb-3">{view.uncertainty.timingRisk}</p>
            
            <div className="text-xs text-gray-500 mb-2">What could go wrong:</div>
            <ul className="space-y-1 mb-3">
              {view.uncertainty.whatCouldGoWrong.map((w, idx) => (
                <li key={idx} className="text-sm text-gray-400">• {w}</li>
              ))}
            </ul>
            
            <div className="text-xs text-amber-400 italic">
              Historical base rate: {view.uncertainty.historicalBaseRate}
            </div>
          </div>
          
          {/* Our Recommendation */}
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-2">
              🎯 Our Recommendation
            </h4>
            <div className="flex items-center gap-3 mb-3">
              <StanceBadge stance={view.recommendation.stance} />
              <span className="text-white font-medium">
                {view.recommendation.targetRange.min}-{view.recommendation.targetRange.max}% allocation
              </span>
            </div>
            <p className="text-gray-300 text-sm mb-3">{view.recommendation.reasoning}</p>
            
            <div className="text-xs text-gray-500 mb-2">Important caveats:</div>
            <ul className="space-y-1">
              {view.recommendation.caveats.map((c, idx) => (
                <li key={idx} className="text-sm text-gray-400">→ {c}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InvestmentThesisPage() {
  const [expandedId, setExpandedId] = useState<string | null>('us-large-cap');
  const [filter, setFilter] = useState<'all' | 'equity' | 'fixed-income' | 'alternative'>('all');
  
  const filteredViews = filter === 'all' 
    ? CURRENT_VIEWS 
    : CURRENT_VIEWS.filter(v => v.category === filter);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white">
      <Header />
      <DemoBanner />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            📊 Investment Thesis
          </h1>
          <p className="text-gray-400 mt-2">
            Not just what we recommend — <strong>why</strong> we recommend it
          </p>
        </div>

        {/* Philosophy Banner */}
        <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/30 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">
            Our Investment Philosophy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-purple-400 font-medium mb-1">📈 Not Just Historical Data</div>
              <p className="text-gray-400">
                We use forward-looking CMAs from Vanguard, BlackRock, JPMorgan, and AQR — not just backtests.
              </p>
            </div>
            <div>
              <div className="text-purple-400 font-medium mb-1">⚖️ Valuation Aware</div>
              <p className="text-gray-400">
                Starting valuations heavily impact returns. We adjust expectations based on where we are, not averages.
              </p>
            </div>
            <div>
              <div className="text-purple-400 font-medium mb-1">🎯 Honest About Uncertainty</div>
              <p className="text-gray-400">
                "International is cheap" has been true since 2015. We tell you what could go wrong.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['all', 'equity', 'fixed-income', 'alternative'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as typeof filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {f === 'all' ? 'All Assets' : f.charAt(0).toUpperCase() + f.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Asset Class Cards */}
        <div className="space-y-4">
          {filteredViews.map((view) => (
            <AssetClassCard
              key={view.id}
              view={view}
              isExpanded={expandedId === view.id}
              onToggle={() => setExpandedId(expandedId === view.id ? null : view.id)}
            />
          ))}
        </div>

        {/* Sources */}
        <div className="mt-8 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Data Sources & CMAs</h3>
          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
            <span className="px-2 py-1 bg-gray-800 rounded">Vanguard 10-Year CMAs</span>
            <span className="px-2 py-1 bg-gray-800 rounded">BlackRock Capital Market Assumptions</span>
            <span className="px-2 py-1 bg-gray-800 rounded">JPMorgan Long-Term CMAs</span>
            <span className="px-2 py-1 bg-gray-800 rounded">AQR Expected Returns</span>
            <span className="px-2 py-1 bg-gray-800 rounded">Research Affiliates</span>
            <span className="px-2 py-1 bg-gray-800 rounded">FRED Economic Data</span>
            <span className="px-2 py-1 bg-gray-800 rounded">Shiller CAPE Data</span>
          </div>
          <p className="text-xs text-gray-600 mt-3">
            Last updated: February 2026. Views are for educational purposes and do not constitute investment advice.
          </p>
        </div>
      </div>
    </div>
  );
}
