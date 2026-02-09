'use client';

import { useMemo, useState } from 'react';
import { Term } from './InfoTooltip';
import {
  analyzePortfolioFees,
  getExpenseRatioGrade,
  formatExpenseRatio,
  formatBasisPoints,
  type PortfolioFeeAnalysis,
  type HoldingFeeAnalysis,
} from '@/lib/portfolio-utils';

interface Holding {
  ticker: string;
  name?: string;
  shares: number;
  costBasis?: number;
  currentPrice?: number;
  currentValue?: number;
}

interface FeeAnalyzerProps {
  holdings: Holding[];
  compact?: boolean;
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount.toFixed(0)}`;
}

function formatLargeCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
}

export default function FeeAnalyzer({ holdings, compact = false }: FeeAnalyzerProps) {
  const [showAllHoldings, setShowAllHoldings] = useState(false);
  
  const analysis = useMemo(() => {
    return analyzePortfolioFees(holdings as any);
  }, [holdings]);
  
  const grade = useMemo(() => {
    return getExpenseRatioGrade(analysis.weightedExpenseRatio);
  }, [analysis.weightedExpenseRatio]);
  
  // Calculate how much money is lost to fees each month
  const monthlyFees = analysis.totalAnnualFees / 12;
  
  // Calculate if the user is doing well or needs help
  const isLowCost = analysis.weightedExpenseRatio <= 0.001;
  const hasSavingsOpportunities = analysis.savingsOpportunities.length > 0;
  
  if (compact) {
    // Compact view for dashboard cards
    return (
      <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            💸 <Term id="expense-ratio">Fund Fees</Term>
          </h3>
          <div className={`px-2 py-1 rounded text-sm font-bold ${grade.color} bg-white/5`}>
            {grade.grade}
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">You're Paying</p>
            <p className="text-2xl font-bold text-white">
              ${analysis.totalAnnualFees.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              <span className="text-sm text-gray-500 font-normal">/year</span>
            </p>
          </div>
          
          {hasSavingsOpportunities && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
              <p className="text-sm text-emerald-400">
                💡 You could save <span className="font-bold">${Math.round(analysis.potentialAnnualSavings)}/year</span> by switching to lower-cost alternatives
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
            💸 Fee Analysis
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Hidden fees that eat your returns
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
          <p className="text-xs text-gray-500 mb-1">Annual Fees</p>
          <p className="text-2xl font-bold text-white">
            ${analysis.totalAnnualFees.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-gray-500">
            ${Math.round(monthlyFees)}/month
          </p>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">
            <Term id="expense-ratio">Expense Ratio</Term>
          </p>
          <p className="text-2xl font-bold text-white">
            {formatExpenseRatio(analysis.weightedExpenseRatio)}
          </p>
          <p className="text-xs text-gray-500">
            {formatBasisPoints(analysis.weightedExpenseRatio)} weighted
          </p>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">30-Year Fee Drag</p>
          <p className="text-2xl font-bold text-red-400">
            {formatLargeCurrency(analysis.thirtyYearFeeDrag)}
          </p>
          <p className="text-xs text-gray-500">
            Lost to fees
          </p>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Potential Savings</p>
          <p className="text-2xl font-bold text-emerald-400">
            ${Math.round(analysis.potentialAnnualSavings).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">
            /year if optimized
          </p>
        </div>
      </div>

      {/* Fee Impact Visualization */}
      <div className="bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-300">What fees cost you over time</span>
        </div>
        <div className="grid grid-cols-4 gap-4 text-center">
          {[5, 10, 20, 30].map(years => {
            const feeDrag = analysis.totalValue * (
              Math.pow(1.07, years) - Math.pow(1.07 - analysis.weightedExpenseRatio, years)
            );
            return (
              <div key={years}>
                <p className="text-xs text-gray-500 mb-1">{years} Years</p>
                <p className="text-lg font-bold text-red-400">
                  -{formatLargeCurrency(feeDrag)}
                </p>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center">
          Based on 7% annual return assumption
        </p>
      </div>

      {/* Savings Opportunities */}
      {analysis.savingsOpportunities.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-white mb-3 flex items-center gap-2">
            💡 Switch & Save
          </h4>
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-emerald-500/20 text-left">
                  <th className="px-4 py-3 text-gray-400 font-medium">Current Fund</th>
                  <th className="px-4 py-3 text-gray-400 font-medium">Switch To</th>
                  <th className="px-4 py-3 text-gray-400 font-medium text-right">Value</th>
                  <th className="px-4 py-3 text-gray-400 font-medium text-right">Annual Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-500/10">
                {analysis.savingsOpportunities.slice(0, 5).map((opp, idx) => (
                  <tr key={idx} className="hover:bg-emerald-500/5 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{opp.ticker}</span>
                        <span className="text-xs text-red-400">
                          {formatExpenseRatio(opp.currentExpenseRatio)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-medium">→</span>
                        <span className="font-medium text-emerald-400">{opp.alternativeTicker}</span>
                        <span className="text-xs text-emerald-400">
                          {formatExpenseRatio(opp.alternativeExpenseRatio)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300">
                      {formatCurrency(opp.value)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-400">
                      +${Math.round(opp.annualSavings)}/yr
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {analysis.savingsOpportunities.length > 0 && (
              <div className="px-4 py-3 bg-emerald-500/10 border-t border-emerald-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Total potential savings</span>
                  <span className="text-lg font-bold text-emerald-400">
                    +${Math.round(analysis.potentialAnnualSavings).toLocaleString()}/year
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  That's {formatLargeCurrency(analysis.potentialAnnualSavings * 30)} over 30 years (compounded)
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Most Expensive Holdings */}
      {analysis.topExpensiveHoldings.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-white mb-3 flex items-center gap-2">
            🔥 Highest Fee Holdings
          </h4>
          <div className="space-y-2">
            {analysis.topExpensiveHoldings.map((holding, idx) => {
              const holdingGrade = holding.expenseRatio !== null 
                ? getExpenseRatioGrade(holding.expenseRatio) 
                : { grade: '?', color: 'text-gray-500' };
              
              return (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${holdingGrade.color} bg-white/10`}>
                      {holdingGrade.grade}
                    </div>
                    <div>
                      <p className="font-medium text-white">{holding.ticker}</p>
                      <p className="text-xs text-gray-500">
                        {holding.expenseRatio !== null 
                          ? formatExpenseRatio(holding.expenseRatio)
                          : 'Est. ' + formatExpenseRatio(holding.annualFee / holding.value)
                        }
                        {' · '}{formatCurrency(holding.value)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-400">
                      -${Math.round(holding.annualFee)}/yr
                    </p>
                    {holding.cheaperAlternative && (
                      <p className="text-xs text-emerald-400">
                        Switch to {holding.cheaperAlternative}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Holdings Fee Breakdown */}
      <div>
        <button
          onClick={() => setShowAllHoldings(!showAllHoldings)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition mb-3"
        >
          <span>{showAllHoldings ? '▼' : '▶'}</span>
          <span>All Holdings Fee Breakdown ({analysis.holdingsByFee.length})</span>
        </button>
        
        {showAllHoldings && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-white/10">
                  <th className="pb-2 font-medium">Holding</th>
                  <th className="pb-2 font-medium text-right">Value</th>
                  <th className="pb-2 font-medium text-right">Expense Ratio</th>
                  <th className="pb-2 font-medium text-right">Annual Fee</th>
                  <th className="pb-2 font-medium text-right">30-Yr Drag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {analysis.holdingsByFee.map((holding, idx) => {
                  const holdingGrade = holding.expenseRatio !== null 
                    ? getExpenseRatioGrade(holding.expenseRatio) 
                    : { grade: '?', color: 'text-gray-500' };
                  
                  return (
                    <tr key={idx}>
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${holdingGrade.color}`}>
                            {holdingGrade.grade}
                          </span>
                          <span className="text-white">{holding.ticker}</span>
                        </div>
                      </td>
                      <td className="py-2 text-right text-gray-300">
                        {formatCurrency(holding.value)}
                      </td>
                      <td className="py-2 text-right">
                        <span className={holding.expenseRatio !== null ? holdingGrade.color : 'text-gray-500'}>
                          {holding.expenseRatio !== null 
                            ? formatExpenseRatio(holding.expenseRatio)
                            : 'N/A'
                          }
                        </span>
                      </td>
                      <td className="py-2 text-right text-gray-300">
                        {holding.annualFee > 0 
                          ? `$${Math.round(holding.annualFee)}`
                          : '—'
                        }
                      </td>
                      <td className="py-2 text-right text-red-400">
                        {holding.thirtyYearDrag > 0 
                          ? `-${formatLargeCurrency(holding.thirtyYearDrag)}`
                          : '—'
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/20 font-medium">
                  <td className="py-3 text-white">Total</td>
                  <td className="py-3 text-right text-white">
                    {formatCurrency(analysis.totalValue)}
                  </td>
                  <td className="py-3 text-right">
                    <span className={grade.color}>
                      {formatExpenseRatio(analysis.weightedExpenseRatio)}
                    </span>
                  </td>
                  <td className="py-3 text-right text-white">
                    ${Math.round(analysis.totalAnnualFees).toLocaleString()}
                  </td>
                  <td className="py-3 text-right text-red-400">
                    -{formatLargeCurrency(analysis.thirtyYearFeeDrag)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Summary Message */}
      <div className={`mt-6 p-4 rounded-xl ${
        isLowCost 
          ? 'bg-emerald-500/10 border border-emerald-500/20' 
          : hasSavingsOpportunities 
            ? 'bg-amber-500/10 border border-amber-500/20'
            : 'bg-blue-500/10 border border-blue-500/20'
      }`}>
        {isLowCost ? (
          <div className="flex items-start gap-3">
            <span className="text-2xl">🌟</span>
            <div>
              <p className="font-medium text-emerald-400">Great job keeping fees low!</p>
              <p className="text-sm text-gray-300 mt-1">
                Your weighted expense ratio of {formatExpenseRatio(analysis.weightedExpenseRatio)} is excellent. 
                You're saving thousands compared to investors in high-fee funds.
              </p>
            </div>
          </div>
        ) : hasSavingsOpportunities ? (
          <div className="flex items-start gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <p className="font-medium text-amber-400">
                You could save ${Math.round(analysis.potentialAnnualSavings).toLocaleString()}/year in fees
              </p>
              <p className="text-sm text-gray-300 mt-1">
                Consider switching the expensive funds above to their lower-cost alternatives. 
                Over 30 years, this could add {formatLargeCurrency(analysis.potentialAnnualSavings * 30)} to your wealth.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <p className="font-medium text-blue-400">Your fee analysis</p>
              <p className="text-sm text-gray-300 mt-1">
                You're paying ${Math.round(analysis.totalAnnualFees).toLocaleString()}/year in fund fees. 
                Keep an eye on expense ratios when adding new investments.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Educational Note */}
      <p className="text-xs text-gray-500 mt-4">
        <strong>Note:</strong> Expense ratios are the annual fees charged by funds. Even small differences compound significantly over time. 
        Individual stocks (AAPL, MSFT, etc.) have no expense ratio. Calculations assume 7% annual returns.
      </p>
    </div>
  );
}
