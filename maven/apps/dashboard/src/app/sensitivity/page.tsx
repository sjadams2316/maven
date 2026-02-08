'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  runComprehensiveSensitivity,
  calculateTornadoChart,
  runTwoWaySensitivity,
  generateSensitivityInsights,
  TornadoBar,
} from '@/lib/sensitivity-analysis';
import { runMonteCarloSimulation, MonteCarloParams } from '@/lib/monte-carlo-engine';
import { useUserProfile } from '@/providers/UserProvider';

const DEFAULT_PARAMS: MonteCarloParams = {
  initialPortfolio: 1000000,
  withdrawalRate: 0.04,
  years: 30,
  stockAllocation: 0.60,
  bondAllocation: 0.35,
  cashAllocation: 0.05,
  expectedReturn: 0.07,
  inflation: 0.025,
  simulations: 1000,
  useHistoricalData: true,
  withdrawalStrategy: 'fixed',
};

export default function SensitivityPage() {
  const { financials } = useUserProfile();
  
  const [params, setParams] = useState<MonteCarloParams>(() => ({
    ...DEFAULT_PARAMS,
    initialPortfolio: financials?.netWorth || 1000000,
  }));
  
  const [isRunning, setIsRunning] = useState(false);
  
  // Run base simulation
  const baseResult = useMemo(() => {
    return runMonteCarloSimulation(params);
  }, [params]);
  
  // Calculate tornado chart
  const tornadoData = useMemo(() => {
    return calculateTornadoChart(params, baseResult);
  }, [params, baseResult]);
  
  // Generate insights
  const insights = useMemo(() => {
    return generateSensitivityInsights(tornadoData, baseResult);
  }, [tornadoData, baseResult]);
  
  // Two-way sensitivity (withdrawal rate vs stock allocation)
  const twoWayData = useMemo(() => {
    return runTwoWaySensitivity(
      params,
      'withdrawalRate',
      [0.03, 0.035, 0.04, 0.045, 0.05],
      'stockAllocation',
      [0.40, 0.50, 0.60, 0.70, 0.80]
    );
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
          <h1 className="text-3xl font-bold">Sensitivity Analysis</h1>
          <p className="text-slate-400 mt-1">
            Understand which variables matter most for your retirement success
          </p>
        </div>
        
        {/* Base Case Summary */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
            <div className="text-slate-400 text-sm">Portfolio</div>
            <div className="text-xl font-bold">{formatCurrency(params.initialPortfolio)}</div>
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
                value={params.initialPortfolio}
                onChange={(e) => setParams(p => ({ ...p, initialPortfolio: Number(e.target.value) }))}
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
                onChange={(e) => setParams(p => ({ ...p, stockAllocation: Number(e.target.value) / 100, bondAllocation: (100 - Number(e.target.value) - 5) / 100 }))}
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
              Shows which variables have the biggest impact on success rate when varied ±20%
            </p>
            
            <div className="space-y-4">
              {tornadoData.map((bar) => {
                const baseX = 50; // Center point (base success rate)
                const leftWidth = Math.abs(bar.lowSuccessRate - bar.baseSuccessRate) * 100;
                const rightWidth = Math.abs(bar.highSuccessRate - bar.baseSuccessRate) * 100;
                const isLowBetter = bar.lowSuccessRate > bar.baseSuccessRate;
                
                return (
                  <div key={bar.variable}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">{bar.displayName}</span>
                      <span className="text-slate-500">
                        {formatPercent(bar.lowSuccessRate)} → {formatPercent(bar.highSuccessRate)}
                      </span>
                    </div>
                    <div className="relative h-6 bg-slate-700 rounded overflow-hidden">
                      {/* Center line */}
                      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-500 z-10" />
                      
                      {/* Low value bar */}
                      <div
                        className={`absolute top-0 bottom-0 ${isLowBetter ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{
                          left: isLowBetter ? '50%' : `${50 - leftWidth}%`,
                          width: `${leftWidth}%`,
                        }}
                      />
                      
                      {/* High value bar */}
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
                    {twoWayData.values2.map(v => (
                      <th key={v} className="p-2 text-center">{formatPercent(v)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {twoWayData.values1.map((v1, i) => (
                    <tr key={v1}>
                      <td className="p-2 text-slate-400">{formatPercent(v1)}</td>
                      {twoWayData.successRates[i].map((rate, j) => (
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
            {insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-purple-400">→</span>
                <p className="text-slate-300">{insight}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Variable Details */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
          <h2 className="text-lg font-semibold mb-4">📈 Variable-by-Variable Impact</h2>
          
          <div className="grid grid-cols-3 gap-4">
            {tornadoData.map((bar) => (
              <div key={bar.variable} className="bg-slate-700/30 rounded-lg p-4">
                <h3 className="font-medium mb-2">{bar.displayName}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Low scenario</span>
                    <span>{bar.variable === 'withdrawalRate' || bar.variable === 'inflation' || bar.variable === 'years'
                      ? formatPercent(bar.lowValue)
                      : bar.variable === 'initialPortfolio'
                        ? formatCurrency(bar.lowValue)
                        : formatPercent(bar.lowValue)
                    }</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">→ Success rate</span>
                    <span className={getSuccessTextColor(bar.lowSuccessRate)}>
                      {formatPercent(bar.lowSuccessRate)}
                    </span>
                  </div>
                  <div className="border-t border-slate-600 my-2" />
                  <div className="flex justify-between">
                    <span className="text-slate-400">High scenario</span>
                    <span>{bar.variable === 'withdrawalRate' || bar.variable === 'inflation' || bar.variable === 'years'
                      ? formatPercent(bar.highValue)
                      : bar.variable === 'initialPortfolio'
                        ? formatCurrency(bar.highValue)
                        : formatPercent(bar.highValue)
                    }</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">→ Success rate</span>
                    <span className={getSuccessTextColor(bar.highSuccessRate)}>
                      {formatPercent(bar.highSuccessRate)}
                    </span>
                  </div>
                  <div className="border-t border-slate-600 my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Impact</span>
                    <span className={bar.impact > 0.15 ? 'text-red-400' : bar.impact > 0.08 ? 'text-yellow-400' : 'text-green-400'}>
                      {(bar.impact * 100).toFixed(0)}% range
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Methodology */}
        <div className="mt-6 bg-slate-800/30 rounded-xl border border-slate-700/30 p-4">
          <details>
            <summary className="text-sm text-slate-400 cursor-pointer">📚 About Sensitivity Analysis</summary>
            <div className="mt-4 text-xs text-slate-500 space-y-2">
              <p><strong>Tornado Chart:</strong> Shows variables ranked by their impact on outcomes. Each bar shows the range of success rates when that variable is changed ±20% from base case while holding others constant.</p>
              <p><strong>Two-Way Table:</strong> Shows success rates for combinations of two variables. Useful for finding optimal balance between withdrawal rate and asset allocation.</p>
              <p><strong>Why It Matters:</strong> Not all inputs matter equally. Withdrawal rate typically has 2-3x the impact of asset allocation. Focus optimization effort on high-impact variables.</p>
              <p><strong>Limitations:</strong> Real-world outcomes involve interactions between variables that this analysis simplifies. Use as directional guidance, not precise predictions.</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
