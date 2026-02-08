'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  calculateHistoricalSWR,
  getSWRPercentiles,
  analyzeSequenceRisk,
  calculateGuardrails,
  WITHDRAWAL_STRATEGIES,
} from '@/lib/safe-withdrawal';
import { SP500_ANNUAL_RETURNS } from '@/lib/historical-returns';
import { useUserProfile } from '@/providers/UserProvider';

export default function SafeWithdrawalPage() {
  const { financials } = useUserProfile();
  const [portfolioValue, setPortfolioValue] = useState(1000000);
  const [stockAllocation, setStockAllocation] = useState(60);
  const [retirementDuration, setRetirementDuration] = useState(30);
  const [selectedStrategy, setSelectedStrategy] = useState(0);
  const [customRate, setCustomRate] = useState(4.0);
  
  // Update from user profile
  useMemo(() => {
    if (financials && financials.netWorth > 0) {
      setPortfolioValue(financials.netWorth);
    }
  }, [financials]);
  
  // Calculate SWR percentiles
  const swrPercentiles = useMemo(() => {
    return getSWRPercentiles(stockAllocation / 100, retirementDuration);
  }, [stockAllocation, retirementDuration]);
  
  // Historical SWR by starting year
  const historicalSWR = useMemo(() => {
    return calculateHistoricalSWR(stockAllocation / 100, retirementDuration);
  }, [stockAllocation, retirementDuration]);
  
  // Sequence of returns analysis
  const sequenceAnalysis = useMemo(() => {
    return analyzeSequenceRisk(SP500_ANNUAL_RETURNS, customRate / 100, retirementDuration);
  }, [customRate, retirementDuration]);
  
  // Guardrails calculation
  const guardrails = useMemo(() => {
    return calculateGuardrails(customRate / 100);
  }, [customRate]);
  
  const annualWithdrawal = portfolioValue * (customRate / 100);
  const monthlyWithdrawal = annualWithdrawal / 12;
  
  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    return `$${value.toLocaleString()}`;
  };
  
  const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`;
  
  // Find worst and best historical periods
  const worstPeriod = historicalSWR.reduce((worst, curr) => 
    curr.maxSafeRate < worst.maxSafeRate ? curr : worst
  );
  const bestPeriod = historicalSWR.reduce((best, curr) => 
    curr.maxSafeRate > best.maxSafeRate ? curr : best
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm mb-2 inline-block">
            ← Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Safe Withdrawal Rate Calculator</h1>
          <p className="text-slate-400 mt-1">
            Based on 97 years of historical market data (1928-2024)
          </p>
        </div>
        
        <div className="grid grid-cols-12 gap-6">
          {/* Controls */}
          <div className="col-span-4 space-y-6">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <h2 className="text-lg font-semibold mb-4">📊 Your Situation</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Portfolio Value</label>
                  <input
                    type="number"
                    value={portfolioValue}
                    onChange={(e) => setPortfolioValue(Number(e.target.value))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    Stock Allocation: {stockAllocation}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={stockAllocation}
                    onChange={(e) => setStockAllocation(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>0% (All Bonds)</span>
                    <span>100% (All Stocks)</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    Retirement Duration: {retirementDuration} years
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={retirementDuration}
                    onChange={(e) => setRetirementDuration(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    Withdrawal Rate: {customRate.toFixed(1)}%
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="8"
                    step="0.1"
                    value={customRate}
                    onChange={(e) => setCustomRate(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            
            {/* Your Withdrawal */}
            <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-xl border border-purple-500/30 p-6">
              <h3 className="text-lg font-semibold mb-4">💰 Your Withdrawal</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-slate-400 text-sm">Annual</div>
                  <div className="text-3xl font-bold">{formatCurrency(annualWithdrawal)}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Monthly</div>
                  <div className="text-2xl font-bold">{formatCurrency(monthlyWithdrawal)}</div>
                </div>
              </div>
            </div>
            
            {/* Guardrails */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold mb-4">🛡️ Guardrails Strategy</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Initial Rate</span>
                  <span>{formatPercent(guardrails.initialRate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-400">Cut Spending When</span>
                  <span>Rate &gt; {formatPercent(guardrails.cutTrigger)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-400">Raise Spending When</span>
                  <span>Rate &lt; {formatPercent(guardrails.raiseTrigger)}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4">
                Guardrails: Adjust spending by 10% when rate exceeds thresholds
              </p>
            </div>
          </div>
          
          {/* Results */}
          <div className="col-span-8 space-y-6">
            {/* Historical SWR Summary */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
                <div className="text-slate-400 text-sm">Worst Historical</div>
                <div className="text-2xl font-bold text-red-400">
                  {formatPercent(swrPercentiles.worst)}
                </div>
                <div className="text-xs text-slate-500">
                  Retired {worstPeriod.startYear}
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
                <div className="text-slate-400 text-sm">Median Safe Rate</div>
                <div className="text-2xl font-bold text-yellow-400">
                  {formatPercent(swrPercentiles.median)}
                </div>
                <div className="text-xs text-slate-500">50th percentile</div>
              </div>
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
                <div className="text-slate-400 text-sm">Best Historical</div>
                <div className="text-2xl font-bold text-green-400">
                  {formatPercent(swrPercentiles.best)}
                </div>
                <div className="text-xs text-slate-500">
                  Retired {bestPeriod.startYear}
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
                <div className="text-slate-400 text-sm">Your Rate vs Safe</div>
                <div className={`text-2xl font-bold ${
                  customRate / 100 <= swrPercentiles.worst ? 'text-green-400' :
                  customRate / 100 <= swrPercentiles.median ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {customRate / 100 <= swrPercentiles.worst ? '✓ Safe' :
                   customRate / 100 <= swrPercentiles.median ? '⚠️ Moderate' : '⚠️ Risky'}
                </div>
              </div>
            </div>
            
            {/* SWR Distribution */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold mb-4">Safe Withdrawal Rate Distribution</h3>
              <div className="space-y-3">
                {[
                  { label: 'Best Case', value: swrPercentiles.best, color: 'bg-green-500' },
                  { label: '90th Percentile', value: swrPercentiles.p90, color: 'bg-emerald-500' },
                  { label: '75th Percentile', value: swrPercentiles.p75, color: 'bg-blue-400' },
                  { label: 'Median', value: swrPercentiles.median, color: 'bg-purple-500' },
                  { label: '25th Percentile', value: swrPercentiles.p25, color: 'bg-yellow-500' },
                  { label: '10th Percentile', value: swrPercentiles.p10, color: 'bg-orange-500' },
                  { label: 'Worst Case', value: swrPercentiles.worst, color: 'bg-red-500' },
                ].map((item) => (
                  <div key={item.label} className="relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-400">{item.label}</span>
                      <span className="text-sm font-medium">{formatPercent(item.value)}</span>
                    </div>
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full`}
                        style={{ width: `${(item.value / swrPercentiles.best) * 100}%` }}
                      />
                    </div>
                    {/* Your rate indicator */}
                    <div
                      className="absolute top-6 w-0.5 h-3 bg-white"
                      style={{ left: `${(customRate / 100 / swrPercentiles.best) * 100}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-4 text-sm text-slate-400">
                <div className="w-0.5 h-4 bg-white" />
                <span>Your rate: {customRate}%</span>
              </div>
            </div>
            
            {/* Sequence of Returns */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold mb-4">⚡ Sequence of Returns Risk</h3>
              <p className="text-slate-400 text-sm mb-4">
                The order of returns matters enormously. Getting bad returns early in retirement is much worse than late.
              </p>
              
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className={`bg-slate-700/30 rounded-lg p-4 ${sequenceAnalysis.worstCase.survived ? '' : 'border border-red-500/50'}`}>
                  <div className="text-slate-400 text-sm">Worst Sequence</div>
                  <div className={`text-xl font-bold ${sequenceAnalysis.worstCase.survived ? 'text-yellow-400' : 'text-red-400'}`}>
                    {sequenceAnalysis.worstCase.survived 
                      ? formatCurrency(sequenceAnalysis.worstCase.finalBalance)
                      : 'Depleted'}
                  </div>
                  <div className="text-xs text-slate-500">Bad returns first</div>
                </div>
                
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="text-slate-400 text-sm">Actual Order</div>
                  <div className={`text-xl font-bold ${sequenceAnalysis.actualOrder.survived ? 'text-blue-400' : 'text-red-400'}`}>
                    {sequenceAnalysis.actualOrder.survived 
                      ? formatCurrency(sequenceAnalysis.actualOrder.finalBalance)
                      : 'Depleted'}
                  </div>
                  <div className="text-xs text-slate-500">Historical order</div>
                </div>
                
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="text-slate-400 text-sm">Reverse Order</div>
                  <div className={`text-xl font-bold ${sequenceAnalysis.reverseOrder.survived ? 'text-purple-400' : 'text-red-400'}`}>
                    {sequenceAnalysis.reverseOrder.survived 
                      ? formatCurrency(sequenceAnalysis.reverseOrder.finalBalance)
                      : 'Depleted'}
                  </div>
                  <div className="text-xs text-slate-500">Reversed</div>
                </div>
                
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <div className="text-slate-400 text-sm">Best Sequence</div>
                  <div className="text-xl font-bold text-green-400">
                    {sequenceAnalysis.bestCase.survived 
                      ? formatCurrency(sequenceAnalysis.bestCase.finalBalance)
                      : 'Depleted'}
                  </div>
                  <div className="text-xs text-slate-500">Best returns first</div>
                </div>
              </div>
              
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-yellow-400 text-xl">⚠️</span>
                  <div>
                    <div className="font-medium text-yellow-400">Sequence Impact: {(sequenceAnalysis.sequenceImpact * 100).toFixed(0)}%</div>
                    <div className="text-sm text-slate-300 mt-1">
                      With the same average returns but different ordering, outcomes can vary by {(sequenceAnalysis.sequenceImpact * 100).toFixed(0)}%.
                      This is why having a cash buffer or flexible spending matters in early retirement.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Historical Timeline */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold mb-4">📅 Historical Safe Rates by Decade</h3>
              <div className="h-48 flex items-end gap-1">
                {historicalSWR.filter((_, i) => i % 5 === 0).map((period, idx) => {
                  const height = (period.maxSafeRate / swrPercentiles.best) * 100;
                  const isBelowYourRate = period.maxSafeRate < customRate / 100;
                  return (
                    <div key={period.startYear} className="flex-1 flex flex-col items-center">
                      <div
                        className={`w-full rounded-t ${isBelowYourRate ? 'bg-red-500/50' : 'bg-purple-500/50'} transition-all hover:opacity-80`}
                        style={{ height: `${height}%` }}
                        title={`${period.startYear}: ${formatPercent(period.maxSafeRate)}`}
                      />
                      {idx % 2 === 0 && (
                        <span className="text-xs text-slate-500 mt-1">{period.startYear}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500/50 rounded" />
                  <span className="text-slate-400">Above your rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500/50 rounded" />
                  <span className="text-slate-400">Below your rate (would fail)</span>
                </div>
              </div>
            </div>
            
            {/* Withdrawal Strategies */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold mb-4">📋 Withdrawal Strategies</h3>
              <div className="space-y-3">
                {WITHDRAWAL_STRATEGIES.map((strategy, idx) => (
                  <div
                    key={strategy.name}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedStrategy === idx
                        ? 'bg-purple-500/20 border-purple-500/50'
                        : 'bg-slate-700/30 border-slate-600/50 hover:border-slate-500'
                    }`}
                    onClick={() => setSelectedStrategy(idx)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{strategy.name}</div>
                      {selectedStrategy === idx && (
                        <span className="text-purple-400 text-sm">Selected</span>
                      )}
                    </div>
                    <div className="text-sm text-slate-400 mt-1">{strategy.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
