'use client';

import { useState } from 'react';
import { AnalysisResult } from '@/types';

interface Props {
  analysis: AnalysisResult;
}

export default function AnalysisResults({ analysis }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'recommendations' | 'projections' | 'stress'>('overview');

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${(value * 100).toFixed(2)}%`;
  };

  const formatNumber = (value: number, decimals: number = 2) => {
    return value.toFixed(decimals);
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        {(['overview', 'recommendations', 'projections', 'stress'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab === 'stress' ? 'Stress Tests' : tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="p-4 bg-blue-900/30 border border-blue-700/50 rounded-lg">
            <p className="text-blue-200">{analysis.summary}</p>
          </div>

          {/* Metrics Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900 rounded-lg">
              <h3 className="text-sm text-slate-400 mb-3">Current Portfolio</h3>
              <div className="space-y-2">
                <MetricRow label="Expected Return" value={formatPercent(analysis.currentPortfolio.metrics.expectedReturn)} />
                <MetricRow label="Volatility" value={formatPercent(analysis.currentPortfolio.metrics.volatility)} />
                <MetricRow label="Sharpe Ratio" value={formatNumber(analysis.currentPortfolio.metrics.sharpeRatio)} />
                <MetricRow label="Expense Ratio" value={formatPercent(analysis.currentPortfolio.metrics.expenseRatio)} />
              </div>
            </div>
            
            <div className="p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
              <h3 className="text-sm text-green-400 mb-3">Optimized Portfolio</h3>
              <div className="space-y-2">
                <MetricRow 
                  label="Expected Return" 
                  value={formatPercent(analysis.optimizedPortfolio.metrics.expectedReturn)}
                  improved={analysis.optimizedPortfolio.metrics.expectedReturn > analysis.currentPortfolio.metrics.expectedReturn}
                />
                <MetricRow 
                  label="Volatility" 
                  value={formatPercent(analysis.optimizedPortfolio.metrics.volatility)}
                  improved={analysis.optimizedPortfolio.metrics.volatility < analysis.currentPortfolio.metrics.volatility}
                />
                <MetricRow 
                  label="Sharpe Ratio" 
                  value={formatNumber(analysis.optimizedPortfolio.metrics.sharpeRatio)}
                  improved={analysis.optimizedPortfolio.metrics.sharpeRatio > analysis.currentPortfolio.metrics.sharpeRatio}
                />
                <MetricRow 
                  label="Expense Ratio" 
                  value={formatPercent(analysis.optimizedPortfolio.metrics.expenseRatio)}
                  improved={analysis.optimizedPortfolio.metrics.expenseRatio < analysis.currentPortfolio.metrics.expenseRatio}
                />
              </div>
            </div>
          </div>

          {/* Holdings Comparison */}
          <div>
            <h3 className="text-white font-medium mb-3">Portfolio Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-700">
                    <th className="text-left py-2">Current</th>
                    <th className="text-right py-2">Weight</th>
                    <th className="text-center py-2 px-4">→</th>
                    <th className="text-left py-2">Optimized</th>
                    <th className="text-right py-2">Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.currentPortfolio.holdings.map((current, i) => {
                    const optimized = analysis.optimizedPortfolio.holdings[i];
                    const changed = current.ticker !== optimized?.ticker;
                    return (
                      <tr key={i} className="border-b border-slate-800">
                        <td className="py-2 text-white font-mono">{current.ticker}</td>
                        <td className="py-2 text-right text-slate-400">{current.weight}%</td>
                        <td className="py-2 text-center">
                          {changed ? (
                            <span className="text-yellow-400">→</span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className={`py-2 font-mono ${changed ? 'text-green-400' : 'text-white'}`}>
                          {optimized?.ticker || '-'}
                        </td>
                        <td className="py-2 text-right text-slate-400">{optimized?.weight || 0}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {analysis.recommendations.length === 0 ? (
            <div className="text-slate-400 text-center py-8">
              Your portfolio is already well-optimized. No changes recommended.
            </div>
          ) : (
            analysis.recommendations.map((rec, i) => (
              <div key={i} className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-mono">{rec.currentHolding.ticker}</span>
                    <span className="text-yellow-400">→</span>
                    <span className="text-green-400 font-mono font-medium">{rec.recommendedHolding.ticker}</span>
                  </div>
                </div>
                
                <p className="text-slate-300 text-sm mb-3">{rec.reason}</p>
                
                <div className="flex gap-4 text-xs">
                  <ImpactBadge 
                    label="Return" 
                    value={rec.impact.returnChange} 
                    positiveIsGood={true}
                  />
                  <ImpactBadge 
                    label="Volatility" 
                    value={rec.impact.volatilityChange} 
                    positiveIsGood={false}
                  />
                  <ImpactBadge 
                    label="Expense" 
                    value={rec.impact.expenseChange} 
                    positiveIsGood={false}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Projections Tab */}
      {activeTab === 'projections' && (
        <div className="space-y-6">
          <p className="text-slate-400 text-sm">
            Monte Carlo simulation showing potential portfolio value over 10 years, 
            starting with $100,000. Lines show 5th, 25th, 50th, 75th, and 95th percentile outcomes.
          </p>
          
          <div className="grid gap-4">
            <ProjectionChart 
              title="Current Portfolio Projection"
              projection={analysis.projections.current}
              color="slate"
            />
            <ProjectionChart 
              title="Optimized Portfolio Projection"
              projection={analysis.projections.optimized}
              color="green"
            />
          </div>

          {/* 10-year comparison */}
          <div className="p-4 bg-slate-900 rounded-lg">
            <h4 className="text-white font-medium mb-3">10-Year Median Outcome ($100k start)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 text-sm">Current</span>
                <p className="text-2xl text-white font-mono">
                  ${Math.round(analysis.projections.current.percentile50[9]).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-green-400 text-sm">Optimized</span>
                <p className="text-2xl text-green-400 font-mono">
                  ${Math.round(analysis.projections.optimized.percentile50[9]).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stress Tests Tab */}
      {activeTab === 'stress' && (
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">
            How each portfolio would perform under historical stress scenarios.
          </p>
          
          {analysis.stressTests.map((test, i) => (
            <div key={i} className="p-4 bg-slate-900 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="text-white font-medium">{test.scenario}</h4>
                  <p className="text-slate-400 text-sm">{test.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <span className="text-slate-500 text-xs">Current Portfolio</span>
                  <p className={`text-xl font-mono ${test.currentPortfolioImpact < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {test.currentPortfolioImpact >= 0 ? '+' : ''}{(test.currentPortfolioImpact * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Optimized Portfolio</span>
                  <p className={`text-xl font-mono ${test.optimizedPortfolioImpact < 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {test.optimizedPortfolioImpact >= 0 ? '+' : ''}{(test.optimizedPortfolioImpact * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MetricRow({ label, value, improved }: { label: string; value: string; improved?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}</span>
      <span className={improved ? 'text-green-400' : 'text-white'}>{value}</span>
    </div>
  );
}

function ImpactBadge({ label, value, positiveIsGood }: { label: string; value: number; positiveIsGood: boolean }) {
  const isGood = positiveIsGood ? value > 0 : value < 0;
  const colorClass = isGood ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400';
  
  return (
    <span className={`px-2 py-1 rounded ${colorClass}`}>
      {label}: {value >= 0 ? '+' : ''}{(value * 100).toFixed(2)}%
    </span>
  );
}

function ProjectionChart({ title, projection, color }: { 
  title: string; 
  projection: { years: number[]; percentile5: number[]; percentile25: number[]; percentile50: number[]; percentile75: number[]; percentile95: number[] };
  color: 'slate' | 'green';
}) {
  const max = Math.max(...projection.percentile95);
  const min = Math.min(...projection.percentile5);
  const range = max - min;
  
  const getY = (value: number) => {
    return 100 - ((value - min) / range) * 100;
  };
  
  const colors = color === 'green' 
    ? { fill: 'rgba(34, 197, 94, 0.1)', stroke: 'rgb(34, 197, 94)', light: 'rgba(34, 197, 94, 0.3)' }
    : { fill: 'rgba(148, 163, 184, 0.1)', stroke: 'rgb(148, 163, 184)', light: 'rgba(148, 163, 184, 0.3)' };

  return (
    <div className="p-4 bg-slate-900 rounded-lg">
      <h4 className={`text-sm font-medium mb-3 ${color === 'green' ? 'text-green-400' : 'text-slate-300'}`}>
        {title}
      </h4>
      
      <div className="h-32 relative">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* 5-95 percentile band */}
          <path
            d={`M ${projection.years.map((_, i) => `${i * (100 / (projection.years.length - 1))},${getY(projection.percentile95[i])}`).join(' L ')} 
                L ${projection.years.map((_, i) => `${(projection.years.length - 1 - i) * (100 / (projection.years.length - 1))},${getY(projection.percentile5[projection.years.length - 1 - i])}`).join(' L ')} Z`}
            fill={colors.fill}
          />
          {/* 25-75 percentile band */}
          <path
            d={`M ${projection.years.map((_, i) => `${i * (100 / (projection.years.length - 1))},${getY(projection.percentile75[i])}`).join(' L ')} 
                L ${projection.years.map((_, i) => `${(projection.years.length - 1 - i) * (100 / (projection.years.length - 1))},${getY(projection.percentile25[projection.years.length - 1 - i])}`).join(' L ')} Z`}
            fill={colors.light}
          />
          {/* Median line */}
          <path
            d={`M ${projection.years.map((_, i) => `${i * (100 / (projection.years.length - 1))},${getY(projection.percentile50[i])}`).join(' L ')}`}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="2"
          />
        </svg>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-slate-500 -ml-1">
          <span>${Math.round(max / 1000)}k</span>
          <span>${Math.round(min / 1000)}k</span>
        </div>
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>Now</span>
        <span>5yr</span>
        <span>10yr</span>
      </div>
    </div>
  );
}
