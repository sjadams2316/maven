'use client';

import { useMemo, useState } from 'react';
import { Term } from './InfoTooltip';
import {
  analyzePortfolioIncome,
  formatDividendYield,
  type PortfolioIncomeAnalysis,
  type HoldingIncomeAnalysis,
} from '@/lib/portfolio-utils';

interface Holding {
  ticker: string;
  name?: string;
  shares: number;
  costBasis?: number;
  currentPrice?: number;
  currentValue?: number;
}

interface IncomeAnalysisProps {
  holdings: Holding[];
  compact?: boolean;
}

function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount.toFixed(0)}`;
}

function formatIncome(amount: number): string {
  if (amount >= 10000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function IncomeAnalysis({ holdings, compact = false }: IncomeAnalysisProps) {
  const [showAllHoldings, setShowAllHoldings] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState<'all' | 'q1' | 'q2' | 'q3' | 'q4'>('all');
  
  const analysis = useMemo(() => {
    return analyzePortfolioIncome(holdings as any);
  }, [holdings]);
  
  // Yield category colors
  const yieldColors: Record<HoldingIncomeAnalysis['yieldCategory'], string> = {
    'none': 'text-gray-500',
    'low': 'text-yellow-400',
    'moderate': 'text-green-400',
    'high': 'text-emerald-400',
    'very-high': 'text-cyan-400',
  };
  
  const yieldLabels: Record<HoldingIncomeAnalysis['yieldCategory'], string> = {
    'none': 'No Yield',
    'low': 'Low',
    'moderate': 'Moderate',
    'high': 'High',
    'very-high': 'Very High',
  };
  
  if (compact) {
    // Compact view for dashboard cards
    return (
      <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            💰 <Term id="dividend-yield">Dividend Income</Term>
          </h3>
          <div className={`px-2 py-1 rounded text-sm font-bold ${analysis.yieldGrade.color} bg-white/5`}>
            {analysis.yieldGrade.grade}
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Annual Income</p>
            <p className="text-2xl font-bold text-white">
              {formatIncome(analysis.totalAnnualIncome)}
              <span className="text-sm text-gray-500 font-normal">/year</span>
            </p>
            <p className="text-sm text-emerald-400">
              {formatDividendYield(analysis.weightedYield)} yield
            </p>
          </div>
          
          {analysis.hasDividendAristocrats && (
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
              <p className="text-sm text-indigo-400">
                👑 {analysis.dividendAristocratPercent.toFixed(1)}% in dividend growth ETFs
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
            💰 Income Analysis
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Dividend and interest income from your portfolio
          </p>
        </div>
        <div className={`px-3 py-1.5 rounded-lg ${analysis.yieldGrade.color} bg-white/5 font-bold`}>
          {analysis.yieldGrade.grade} - {analysis.yieldGrade.label}
        </div>
      </div>
      
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Annual Income</p>
          <p className="text-2xl font-bold text-emerald-400">
            {formatIncome(analysis.totalAnnualIncome)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatDividendYield(analysis.weightedYield)} yield
          </p>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Monthly Income</p>
          <p className="text-2xl font-bold text-white">
            {formatIncome(analysis.monthlyIncome)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Average per month
          </p>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Quarterly Income</p>
          <p className="text-2xl font-bold text-white">
            {formatIncome(analysis.quarterlyIncome.q1)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Per quarter
          </p>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Portfolio Value</p>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(analysis.totalValue)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Generating income
          </p>
        </div>
      </div>
      
      {/* Quarterly Breakdown Visual */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Quarterly Income Projection</h4>
        <div className="grid grid-cols-4 gap-2">
          {(['q1', 'q2', 'q3', 'q4'] as const).map((quarter, idx) => {
            const quarterNames = ['Q1', 'Q2', 'Q3', 'Q4'];
            const quarterMonths = ['Jan-Mar', 'Apr-Jun', 'Jul-Sep', 'Oct-Dec'];
            const amount = analysis.quarterlyIncome[quarter];
            const isSelected = selectedQuarter === quarter || selectedQuarter === 'all';
            
            return (
              <button
                key={quarter}
                onClick={() => setSelectedQuarter(selectedQuarter === quarter ? 'all' : quarter)}
                className={`p-3 rounded-xl border transition-all ${
                  isSelected 
                    ? 'bg-emerald-500/20 border-emerald-500/30' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="text-xs text-gray-500 mb-1">{quarterNames[idx]}</div>
                <div className={`text-lg font-bold ${isSelected ? 'text-emerald-400' : 'text-white'}`}>
                  {formatIncome(amount)}
                </div>
                <div className="text-xs text-gray-500">{quarterMonths[idx]}</div>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Dividend Growth Info */}
      {analysis.hasDividendAristocrats && (
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">👑</span>
            <div>
              <h4 className="text-sm font-medium text-indigo-400 mb-1">Dividend Growth Holdings</h4>
              <p className="text-sm text-gray-300">
                You have <span className="text-white font-medium">
                  {formatCurrency(analysis.dividendAristocratValue)}
                </span> ({analysis.dividendAristocratPercent.toFixed(1)}%) in dividend aristocrat ETFs 
                like VIG and SCHD. These track companies with 25+ years of consecutive dividend increases.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  analysis.incomeGrowthPotential === 'high' 
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : analysis.incomeGrowthPotential === 'moderate'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {analysis.incomeGrowthPotential === 'high' ? '📈 High' : 
                   analysis.incomeGrowthPotential === 'moderate' ? '📊 Moderate' : '📉 Low'} 
                  {' '}Growth Potential
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Monthly Payers */}
      {analysis.quarterlyIncome.monthlyPayers.length > 0 && (
        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📅</span>
            <div>
              <h4 className="text-sm font-medium text-cyan-400 mb-1">Monthly Dividend Payers</h4>
              <p className="text-sm text-gray-300 mb-2">
                These holdings pay dividends every month instead of quarterly:
              </p>
              <div className="flex flex-wrap gap-2">
                {analysis.quarterlyIncome.monthlyPayers.map(p => (
                  <span key={p.ticker} className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded">
                    {p.ticker}: ${p.monthlyAmount.toFixed(0)}/mo
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Income Insights */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6">
        <h4 className="text-sm font-medium text-emerald-400 mb-2">💡 Income Insights</h4>
        <div className="space-y-2 text-sm text-gray-300">
          {analysis.weightedYield >= 0.03 && (
            <p>✅ Your portfolio yield of <span className="text-emerald-400 font-medium">
              {formatDividendYield(analysis.weightedYield)}</span> is above average. 
              Great for passive income!
            </p>
          )}
          {analysis.weightedYield < 0.015 && (
            <p>💡 Your portfolio is growth-focused with a <span className="text-yellow-400 font-medium">
              {formatDividendYield(analysis.weightedYield)}</span> yield. 
              Consider adding SCHD or VYM if you want more income.
            </p>
          )}
          {analysis.monthlyIncome >= 1000 && (
            <p>🎯 You're generating <span className="text-emerald-400 font-medium">
              ${analysis.monthlyIncome.toFixed(0)}/month</span> in passive income. 
              That's ${(analysis.monthlyIncome * 12).toLocaleString()}/year!
            </p>
          )}
          {analysis.monthlyIncome < 100 && analysis.totalValue > 10000 && (
            <p>📊 With ${analysis.totalValue.toLocaleString()} invested, you could generate more income. 
              A 3% yield would give you ${(analysis.totalValue * 0.03 / 12).toFixed(0)}/month.
            </p>
          )}
        </div>
      </div>
      
      {/* Top Income Holdings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-400">Top Income Holdings</h4>
          {analysis.holdingsByIncome.length > 5 && (
            <button 
              onClick={() => setShowAllHoldings(!showAllHoldings)}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              {showAllHoldings ? 'Show Less' : `Show All (${analysis.holdingsByIncome.length})`}
            </button>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 text-xs border-b border-white/10">
                <th className="pb-2 font-medium">Holding</th>
                <th className="pb-2 font-medium text-right">Value</th>
                <th className="pb-2 font-medium text-right">Yield</th>
                <th className="pb-2 font-medium text-right">Annual Income</th>
                <th className="pb-2 font-medium text-right">Monthly</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(showAllHoldings ? analysis.holdingsByIncome : analysis.topIncomeHoldings)
                .filter(h => h.annualIncome > 0)
                .map(holding => (
                <tr key={holding.ticker} className="text-gray-300 hover:bg-white/5">
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-white">{holding.ticker}</span>
                      {holding.isDividendAristocrat && (
                        <span className="text-xs" title="Dividend Aristocrat ETF">👑</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 truncate max-w-[150px]">{holding.name}</div>
                  </td>
                  <td className="py-2 text-right font-mono">
                    {formatCurrency(holding.value)}
                  </td>
                  <td className={`py-2 text-right font-mono ${yieldColors[holding.yieldCategory]}`}>
                    {formatDividendYield(holding.dividendYield)}
                  </td>
                  <td className="py-2 text-right font-mono text-emerald-400">
                    ${holding.annualIncome.toFixed(0)}
                  </td>
                  <td className="py-2 text-right font-mono text-gray-400">
                    ${holding.monthlyIncome.toFixed(0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Non-income holdings note */}
        {analysis.holdingsByIncome.filter(h => h.annualIncome === 0).length > 0 && (
          <p className="text-xs text-gray-500 mt-3">
            {analysis.holdingsByIncome.filter(h => h.annualIncome === 0).length} holding(s) 
            don't pay dividends (growth stocks, crypto, etc.)
          </p>
        )}
      </div>
      
      {/* Disclaimer */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <p className="text-xs text-gray-500">
          💡 Income estimates based on current dividend yields. Actual dividends may vary. 
          Bond ETF income represents interest payments. Yields change over time.
        </p>
      </div>
    </div>
  );
}
