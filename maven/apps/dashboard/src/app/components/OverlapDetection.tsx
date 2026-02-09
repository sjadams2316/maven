'use client';

import { useMemo, useState } from 'react';
import { Term } from './InfoTooltip';
import {
  analyzePortfolioOverlap,
  getOverlapGrade,
  type PortfolioOverlapAnalysis,
} from '@/lib/portfolio-utils';

interface Holding {
  ticker: string;
  name?: string;
  shares: number;
  costBasis?: number;
  currentPrice?: number;
  currentValue?: number;
}

interface OverlapDetectionProps {
  holdings: Holding[];
  compact?: boolean;
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount.toFixed(0)}`;
}

// Color coding for overlap severity
function getOverlapColor(percent: number): string {
  if (percent >= 90) return 'text-red-400';
  if (percent >= 75) return 'text-orange-400';
  if (percent >= 60) return 'text-amber-400';
  return 'text-yellow-400';
}

function getOverlapBgColor(percent: number): string {
  if (percent >= 90) return 'bg-red-500';
  if (percent >= 75) return 'bg-orange-500';
  if (percent >= 60) return 'bg-amber-500';
  return 'bg-yellow-500';
}

export default function OverlapDetection({ holdings, compact = false }: OverlapDetectionProps) {
  const [showAllOverlaps, setShowAllOverlaps] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  
  const analysis = useMemo(() => {
    return analyzePortfolioOverlap(holdings as any);
  }, [holdings]);
  
  const grade = useMemo(() => {
    return getOverlapGrade(analysis.redundancyPercent);
  }, [analysis.redundancyPercent]);
  
  // Check if there are any meaningful overlaps
  const hasOverlaps = analysis.detectedOverlaps.length > 0;
  const hasHighOverlaps = analysis.detectedOverlaps.some(o => o.overlapPercent >= 75);
  
  if (compact) {
    // Compact view for dashboard cards
    return (
      <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            🔄 <Term id="holdings-overlap">Holdings Overlap</Term>
          </h3>
          <div className={`px-2 py-1 rounded text-sm font-bold ${grade.color} bg-white/5`}>
            {grade.grade}
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Redundant Exposure</p>
            <p className="text-2xl font-bold text-white">
              {analysis.redundancyPercent.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">
              {formatCurrency(analysis.totalRedundantValue)} overlapping
            </p>
          </div>
          
          {hasOverlaps && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              <p className="text-sm text-amber-400">
                ⚠️ {analysis.overlapGroups.length} overlap group{analysis.overlapGroups.length !== 1 ? 's' : ''} detected
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            🔄 Holdings Overlap Detection
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Find redundant positions and simplify your portfolio
          </p>
        </div>
        <div className={`px-3 py-1.5 rounded-lg text-lg font-bold ${grade.color} bg-white/5 flex items-center gap-2`}>
          <span>{grade.grade}</span>
          <span className="text-xs font-normal text-gray-400">{grade.label}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Overlap Groups</p>
          <p className="text-2xl font-bold text-white">
            {analysis.overlapGroups.length}
          </p>
          <p className="text-xs text-gray-500">
            detected in portfolio
          </p>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Redundant Value</p>
          <p className="text-2xl font-bold text-amber-400">
            {formatCurrency(analysis.totalRedundantValue)}
          </p>
          <p className="text-xs text-gray-500">
            {analysis.redundancyPercent.toFixed(1)}% of portfolio
          </p>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Overlapping Pairs</p>
          <p className="text-2xl font-bold text-white">
            {analysis.detectedOverlaps.length}
          </p>
          <p className="text-xs text-gray-500">
            holdings with overlap
          </p>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">
            <Term id="tax-loss-harvesting">Tax-Loss</Term> Opportunities
          </p>
          <p className="text-2xl font-bold text-emerald-400">
            {formatCurrency(analysis.potentialTaxSavings)}
          </p>
          <p className="text-xs text-gray-500">
            potential savings
          </p>
        </div>
      </div>

      {/* No Overlaps State */}
      {!hasOverlaps && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
          <span className="text-4xl mb-3 block">✨</span>
          <p className="font-medium text-emerald-400">No significant overlaps detected!</p>
          <p className="text-sm text-gray-400 mt-1">
            Your holdings are well-diversified without redundant positions.
          </p>
        </div>
      )}

      {/* Overlap Groups */}
      {analysis.overlapGroups.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-white mb-3 flex items-center gap-2">
            📊 Overlap Groups
          </h4>
          <div className="space-y-3">
            {analysis.overlapGroups.map((group, idx) => (
              <div 
                key={idx}
                className="bg-white/5 border border-white/10 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedGroup(expandedGroup === group.name ? null : group.name)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-lg">
                      🔄
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-white">{group.name}</p>
                      <p className="text-xs text-gray-500">
                        {group.holdings.length} holdings · {formatCurrency(group.totalValue)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {group.holdings.slice(0, 4).map((ticker, i) => (
                        <div 
                          key={i}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-[#12121a] ${
                            ticker === group.recommendedFund 
                              ? 'bg-emerald-500/30 text-emerald-400' 
                              : 'bg-white/10 text-gray-300'
                          }`}
                        >
                          {ticker.slice(0, 2)}
                        </div>
                      ))}
                      {group.holdings.length > 4 && (
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-gray-400 border-2 border-[#12121a]">
                          +{group.holdings.length - 4}
                        </div>
                      )}
                    </div>
                    <span className="text-gray-400 text-lg">
                      {expandedGroup === group.name ? '▼' : '▶'}
                    </span>
                  </div>
                </button>
                
                {expandedGroup === group.name && (
                  <div className="px-4 pb-4 pt-2 border-t border-white/10">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {group.holdings.map((ticker, i) => (
                        <span 
                          key={i}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                            ticker === group.recommendedFund
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-white/10 text-gray-300'
                          }`}
                        >
                          {ticker}
                          {ticker === group.recommendedFund && (
                            <span className="ml-1 text-xs">✓ Keep</span>
                          )}
                        </span>
                      ))}
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                      <p className="text-sm text-emerald-400">
                        💡 <strong>Recommendation:</strong> Consider keeping just <strong>{group.recommendedFund}</strong> and selling the others.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detected Overlaps Detail */}
      {hasOverlaps && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-white mb-3 flex items-center gap-2">
            ⚠️ Overlapping Holdings
          </h4>
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-amber-500/20 text-left">
                  <th className="px-4 py-3 text-gray-400 font-medium">Holdings</th>
                  <th className="px-4 py-3 text-gray-400 font-medium text-center">Overlap</th>
                  <th className="px-4 py-3 text-gray-400 font-medium text-right">Redundant Value</th>
                  <th className="px-4 py-3 text-gray-400 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-500/10">
                {analysis.detectedOverlaps
                  .slice(0, showAllOverlaps ? undefined : 5)
                  .map((overlap, idx) => (
                  <tr key={idx} className="hover:bg-amber-500/5 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{overlap.ticker1}</span>
                        <span className="text-gray-500">↔</span>
                        <span className="font-medium text-white">{overlap.ticker2}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{overlap.groupName}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${getOverlapBgColor(overlap.overlapPercent)}`}
                            style={{ width: `${overlap.overlapPercent}%` }}
                          />
                        </div>
                        <span className={`font-medium ${getOverlapColor(overlap.overlapPercent)}`}>
                          {overlap.overlapPercent}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-amber-400 font-medium">
                      {formatCurrency(overlap.redundantValue)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs text-emerald-400">
                        Keep {overlap.consolidationTarget}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {analysis.detectedOverlaps.length > 5 && (
              <div className="px-4 py-3 border-t border-amber-500/20 bg-amber-500/10">
                <button
                  onClick={() => setShowAllOverlaps(!showAllOverlaps)}
                  className="text-sm text-amber-400 hover:text-amber-300 transition"
                >
                  {showAllOverlaps 
                    ? 'Show less' 
                    : `Show ${analysis.detectedOverlaps.length - 5} more overlaps`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Consolidation Recommendations */}
      {analysis.consolidationRecommendations.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-white mb-3 flex items-center gap-2">
            🎯 Consolidation Plan
          </h4>
          <div className="space-y-2">
            {analysis.consolidationRecommendations.map((rec, idx) => (
              <div 
                key={idx}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  rec.action === 'keep'
                    ? 'bg-emerald-500/10 border border-emerald-500/20'
                    : 'bg-red-500/10 border border-red-500/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                    rec.action === 'keep' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {rec.action === 'keep' ? '✓' : '✕'}
                  </div>
                  <div>
                    <p className={`font-medium ${rec.action === 'keep' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {rec.action === 'keep' ? 'Keep' : 'Consider Selling'} {rec.ticker}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 max-w-md">{rec.reason}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-white">{formatCurrency(rec.value)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tax-Loss Harvesting Opportunities */}
      {analysis.taxLossOpportunities.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-white mb-3 flex items-center gap-2">
            🌾 <Term id="tax-loss-harvesting">Tax-Loss Harvesting</Term> from Consolidation
          </h4>
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-emerald-500/20 text-left">
                  <th className="px-4 py-3 text-gray-400 font-medium">Holding</th>
                  <th className="px-4 py-3 text-gray-400 font-medium text-right">Value</th>
                  <th className="px-4 py-3 text-gray-400 font-medium text-right">Loss</th>
                  <th className="px-4 py-3 text-gray-400 font-medium text-right">Tax Savings*</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-500/10">
                {analysis.taxLossOpportunities.slice(0, 5).map((opp, idx) => (
                  <tr key={idx} className="hover:bg-emerald-500/5 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{opp.ticker}</span>
                        <span className="text-gray-500">→</span>
                        <span className="text-emerald-400">{opp.consolidateTo}</span>
                      </div>
                      {opp.washSaleWarning && (
                        <p className="text-xs text-amber-400 mt-0.5">
                          ⚠️ Wait 31 days to avoid wash sale
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300">
                      {formatCurrency(opp.value)}
                    </td>
                    <td className="px-4 py-3 text-right text-red-400">
                      -{formatCurrency(opp.loss)}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-400 font-medium">
                      +{formatCurrency(opp.loss * 0.20)}
                    </td>
                  </tr>
                ))}
              </tbody>
              {analysis.taxLossOpportunities.length > 0 && (
                <tfoot>
                  <tr className="bg-emerald-500/10 border-t border-emerald-500/20">
                    <td colSpan={3} className="px-4 py-3 text-gray-300 font-medium">
                      Total Potential Tax Savings
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-400 font-bold">
                      {formatCurrency(analysis.potentialTaxSavings)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
            <p className="text-xs text-gray-500 px-4 py-2 border-t border-emerald-500/10">
              * Estimated at 20% long-term capital gains rate. Consult a tax professional.
            </p>
          </div>
        </div>
      )}

      {/* Summary Message */}
      <div className={`p-4 rounded-xl ${
        !hasOverlaps 
          ? 'bg-emerald-500/10 border border-emerald-500/20' 
          : hasHighOverlaps 
            ? 'bg-amber-500/10 border border-amber-500/20'
            : 'bg-blue-500/10 border border-blue-500/20'
      }`}>
        {!hasOverlaps ? (
          <div className="flex items-start gap-3">
            <span className="text-2xl">🌟</span>
            <div>
              <p className="font-medium text-emerald-400">Your portfolio is well-diversified!</p>
              <p className="text-sm text-gray-300 mt-1">
                No significant overlap between your holdings. Each position serves a distinct purpose.
              </p>
            </div>
          </div>
        ) : hasHighOverlaps ? (
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-medium text-amber-400">
                Significant overlap detected — {analysis.redundancyPercent.toFixed(1)}% redundancy
              </p>
              <p className="text-sm text-gray-300 mt-1">
                You're holding multiple funds with similar underlying investments. 
                Consider consolidating to reduce complexity and potentially lower fees.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="font-medium text-blue-400">Some overlap detected</p>
              <p className="text-sm text-gray-300 mt-1">
                A small amount of overlap ({analysis.redundancyPercent.toFixed(1)}%) is normal. 
                Review the recommendations above if you want to simplify your portfolio.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Educational Note */}
      <p className="text-xs text-gray-500 mt-4">
        <strong>Why overlap matters:</strong> Holding VTI + VOO means ~82% of your money is invested in the same stocks twice. 
        This wastes diversification benefits and can create tax inefficiency. Consolidating redundant positions simplifies 
        your portfolio and may reduce fees.
      </p>
    </div>
  );
}
