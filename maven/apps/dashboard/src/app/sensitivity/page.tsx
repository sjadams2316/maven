'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useUserProfile } from '@/providers/UserProvider';
import { ToolExplainer } from '@/app/components/ToolExplainer';
import { calculateAllocationFromFinancials } from '@/lib/portfolio-utils';

// Simplified params for sensitivity analysis UI
interface SensitivityParams {
  portfolio: number;
  withdrawalRate: number;
  years: number;
  stockAllocation: number;
}

/**
 * Simplified success rate calculator
 * Based on historical 4% rule research and Trinity Study findings
 * For full Monte Carlo, use /monte-carlo page
 */
function runSimulation(params: SensitivityParams): { successRate: number; medianEnding: number } {
  // Base success rate calibrated to Trinity Study findings
  // 4% withdrawal with 60% stocks over 30 years ≈ 95% success historically
  const baseSuccess = 0.95;
  
  // Withdrawal rate impact (each 0.5% above 4% reduces success by ~8-10%)
  const withdrawalPenalty = Math.max(0, (params.withdrawalRate - 0.04)) * 10;
  const withdrawalBonus = Math.max(0, (0.04 - params.withdrawalRate)) * 5;
  
  // Duration impact (each 5 years beyond 30 reduces success by ~3-5%)
  const durationPenalty = Math.max(0, (params.years - 30)) * 0.01;
  const durationBonus = Math.max(0, (30 - params.years)) * 0.01;
  
  // Stock allocation impact (sweet spot 50-75%, extremes reduce success)
  const stockPenalty = params.stockAllocation < 0.30 ? (0.30 - params.stockAllocation) * 0.3 :
                       params.stockAllocation > 0.85 ? (params.stockAllocation - 0.85) * 0.2 : 0;
  const stockBonus = (params.stockAllocation >= 0.50 && params.stockAllocation <= 0.75) ? 0.02 : 0;
  
  const successRate = Math.max(0.15, Math.min(0.99, 
    baseSuccess - withdrawalPenalty + withdrawalBonus - durationPenalty + durationBonus - stockPenalty + stockBonus
  ));
  
  // Median ending balance estimate
  const expectedReturn = 0.04 + (params.stockAllocation * 0.04); // 4-8% depending on stocks
  const medianEnding = params.portfolio * Math.pow(1 + expectedReturn - params.withdrawalRate, params.years);
  
  return { successRate, medianEnding: Math.max(0, medianEnding) };
}

export default function SensitivityPage() {
  const { financials, profile } = useUserProfile();
  
  // Calculate actual allocation from holdings
  const derivedAllocation = useMemo(() => {
    if (!financials) return null;
    return calculateAllocationFromFinancials(financials);
  }, [financials]);
  
  const [params, setParams] = useState<SensitivityParams>({
    portfolio: 1000000,
    withdrawalRate: 0.04,
    years: 30,
    stockAllocation: 0.60,
  });
  
  // Update params when profile data loads
  useEffect(() => {
    if (financials && derivedAllocation) {
      const investableAssets = (financials.totalRetirement || 0) + (financials.totalInvestments || 0) + (financials.totalCash || 0);
      const stockAlloc = (derivedAllocation.usEquity + derivedAllocation.intlEquity + derivedAllocation.crypto) / 100;
      
      setParams(prev => ({
        ...prev,
        portfolio: investableAssets > 0 ? investableAssets : prev.portfolio,
        stockAllocation: stockAlloc > 0 ? stockAlloc : prev.stockAllocation,
      }));
    }
  }, [financials, derivedAllocation]);
  
  // Run base simulation
  const baseResult = useMemo(() => runSimulation(params), [params]);
  
  // Calculate tornado chart data
  const tornadoData = useMemo(() => {
    const variables = [
      { key: 'withdrawalRate' as const, name: 'Withdrawal Rate', low: 0.03, high: 0.05 },
      { key: 'stockAllocation' as const, name: 'Stock Allocation', low: 0.4, high: 0.8 },
      { key: 'years' as const, name: 'Retirement Length', low: 25, high: 35 },
      { key: 'portfolio' as const, name: 'Starting Portfolio', low: params.portfolio * 0.8, high: params.portfolio * 1.2 },
    ];
    
    return variables.map(v => {
      const lowResult = runSimulation({ ...params, [v.key]: v.low });
      const highResult = runSimulation({ ...params, [v.key]: v.high });
      
      return {
        name: v.name,
        lowValue: v.low,
        highValue: v.high,
        lowSuccess: lowResult.successRate,
        highSuccess: highResult.successRate,
        impact: Math.abs(highResult.successRate - lowResult.successRate),
      };
    }).sort((a, b) => b.impact - a.impact);
  }, [params]);
  
  // Two-way sensitivity
  const twoWayData = useMemo(() => {
    const withdrawalRates = [0.03, 0.035, 0.04, 0.045, 0.05];
    const stockAllocations = [0.40, 0.50, 0.60, 0.70, 0.80];
    
    const results: number[][] = withdrawalRates.map(wr => 
      stockAllocations.map(sa => runSimulation({ ...params, withdrawalRate: wr, stockAllocation: sa }).successRate)
    );
    
    return { withdrawalRates, stockAllocations, results };
  }, [params]);
  
  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };
  
  const getSuccessColor = (rate: number) => {
    if (rate >= 0.95) return 'bg-green-500';
    if (rate >= 0.90) return 'bg-emerald-500';
    if (rate >= 0.80) return 'bg-yellow-500';
    if (rate >= 0.70) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  const getSuccessTextColor = (rate: number) => {
    if (rate >= 0.95) return 'text-green-400';
    if (rate >= 0.90) return 'text-emerald-400';
    if (rate >= 0.80) return 'text-yellow-400';
    if (rate >= 0.70) return 'text-orange-400';
    return 'text-red-400';
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm mb-2 inline-block">
            ← Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Sensitivity Analysis</h1>
            {derivedAllocation && (
              <span className="text-xs px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Using your portfolio data
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-slate-400">
              Understand which variables matter most for your retirement success
            </p>
            <ToolExplainer toolName="sensitivity" />
          </div>
        </div>
        
        {/* Base Case Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
            <div className="text-slate-400 text-sm">Portfolio</div>
            <div className="text-xl font-bold">{formatCurrency(params.portfolio)}</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
            <div className="text-slate-400 text-sm">Withdrawal Rate</div>
            <div className="text-xl font-bold">{formatPercent(params.withdrawalRate)}</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
            <div className="text-slate-400 text-sm">Stock Allocation</div>
            <div className="text-xl font-bold">{formatPercent(params.stockAllocation)}</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
            <div className="text-slate-400 text-sm">Time Horizon</div>
            <div className="text-xl font-bold">{params.years} years</div>
          </div>
          <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-xl border border-purple-500/30 p-4">
            <div className="text-slate-400 text-sm">Success Rate</div>
            <div className={`text-xl font-bold ${getSuccessTextColor(baseResult.successRate)}`}>
              {formatPercent(baseResult.successRate)}
            </div>
          </div>
        </div>
        
        {/* Quick Adjustments */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Adjust Base Parameters</h2>
          <div className="grid grid-cols-4 gap-6">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Portfolio Value</label>
              <input
                type="number"
                value={params.portfolio}
                onChange={(e) => setParams(p => ({ ...p, portfolio: Number(e.target.value) }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Withdrawal Rate: {formatPercent(params.withdrawalRate)}
              </label>
              <input
                type="range"
                min="2"
                max="7"
                step="0.1"
                value={params.withdrawalRate * 100}
                onChange={(e) => setParams(p => ({ ...p, withdrawalRate: Number(e.target.value) / 100 }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Stock Allocation: {formatPercent(params.stockAllocation)}
              </label>
              <input
                type="range"
                min="20"
                max="100"
                step="5"
                value={params.stockAllocation * 100}
                onChange={(e) => setParams(p => ({ ...p, stockAllocation: Number(e.target.value) / 100 }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Time Horizon: {params.years} years
              </label>
              <input
                type="range"
                min="15"
                max="50"
                step="5"
                value={params.years}
                onChange={(e) => setParams(p => ({ ...p, years: Number(e.target.value) }))}
                className="w-full"
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Tornado Chart */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
            <h2 className="text-lg font-semibold mb-4">🌪️ Tornado Chart</h2>
            <p className="text-sm text-slate-400 mb-6">
              Shows which variables have the biggest impact on success rate
            </p>
            
            <div className="space-y-4">
              {tornadoData.map((bar) => {
                const isLowBetter = bar.lowSuccess > bar.highSuccess;
                const leftWidth = Math.abs(bar.lowSuccess - baseResult.successRate) * 200;
                const rightWidth = Math.abs(bar.highSuccess - baseResult.successRate) * 200;
                
                return (
                  <div key={bar.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">{bar.name}</span>
                      <span className="text-slate-500">
                        {formatPercent(bar.lowSuccess)} → {formatPercent(bar.highSuccess)}
                      </span>
                    </div>
                    <div className="relative h-6 bg-slate-700 rounded overflow-hidden">
                      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-500 z-10" />
                      <div
                        className={`absolute top-0 bottom-0 ${isLowBetter ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{
                          left: isLowBetter ? '50%' : `${50 - leftWidth}%`,
                          width: `${leftWidth}%`,
                        }}
                      />
                      <div
                        className={`absolute top-0 bottom-0 ${!isLowBetter ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{
                          left: !isLowBetter ? '50%' : `${50 - rightWidth}%`,
                          width: `${rightWidth}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex items-center justify-center gap-6 mt-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded" />
                <span className="text-slate-400">Improves success</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded" />
                <span className="text-slate-400">Reduces success</span>
              </div>
            </div>
          </div>
          
          {/* Two-Way Sensitivity Table */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
            <h2 className="text-lg font-semibold mb-4">📊 Two-Way Analysis</h2>
            <p className="text-sm text-slate-400 mb-4">
              Withdrawal Rate vs Stock Allocation — find your sweet spot
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-slate-400">WR ↓ / Stocks →</th>
                    {twoWayData.stockAllocations.map(v => (
                      <th key={v} className="p-2 text-center">{formatPercent(v)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {twoWayData.withdrawalRates.map((wr, i) => (
                    <tr key={wr}>
                      <td className="p-2 text-slate-400">{formatPercent(wr)}</td>
                      {twoWayData.results[i].map((rate, j) => (
                        <td key={j} className="p-1">
                          <div className={`${getSuccessColor(rate)} rounded px-2 py-1 text-center text-white font-medium`}>
                            {(rate * 100).toFixed(0)}%
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 text-xs text-slate-500">
              <p>Your current: {formatPercent(params.withdrawalRate)} withdrawal, {formatPercent(params.stockAllocation)} stocks</p>
            </div>
          </div>
        </div>
        
        {/* AI Insights */}
        <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-xl border border-purple-500/30 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">💡 Key Insights</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-purple-400">→</span>
              <p className="text-slate-300">
                Withdrawal rate has the biggest impact on success. Reducing it from {formatPercent(params.withdrawalRate)} to 3.5% could significantly improve outcomes.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-purple-400">→</span>
              <p className="text-slate-300">
                Stock allocation matters less than withdrawal rate for long-term success. Focus on spending flexibility first.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-purple-400">→</span>
              <p className="text-slate-300">
                Each additional 5 years of retirement duration reduces success rate by approximately 5%. Plan conservatively.
              </p>
            </div>
          </div>
        </div>
        
        {/* Methodology */}
        <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-4">
          <details>
            <summary className="text-sm text-slate-400 cursor-pointer">📚 About Sensitivity Analysis</summary>
            <div className="mt-4 text-xs text-slate-500 space-y-2">
              <p><strong>Tornado Chart:</strong> Shows variables ranked by their impact on outcomes when varied from the base case.</p>
              <p><strong>Two-Way Table:</strong> Shows success rates for combinations of two variables to find optimal balance.</p>
              <p><strong>Note:</strong> This is a simplified model. For full Monte Carlo simulation with historical data, use the Retirement Hub.</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
