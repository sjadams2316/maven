'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface SimulationParams {
  startingBalance: number;
  annualContribution: number;
  yearsToRetirement: number;
  retirementYears: number;
  annualSpending: number;
  expectedReturn: number;
  volatility: number;
  inflationRate: number;
}

interface SimulationResult {
  percentile: number;
  finalBalance: number;
  paths: number[][];
  successRate: number;
}

export default function MonteCarloPage() {
  const [params, setParams] = useState<SimulationParams>({
    startingBalance: 500000,
    annualContribution: 50000,
    yearsToRetirement: 15,
    retirementYears: 30,
    annualSpending: 80000,
    expectedReturn: 7,
    volatility: 15,
    inflationRate: 2.5,
  });

  const [numSimulations, setNumSimulations] = useState(1000);
  const [showResults, setShowResults] = useState(false);

  // Generate mock simulation results
  const results = useMemo(() => {
    if (!showResults) return null;

    const generatePath = () => {
      const path: number[] = [params.startingBalance];
      let balance = params.startingBalance;
      
      // Accumulation phase
      for (let i = 0; i < params.yearsToRetirement; i++) {
        const randomReturn = (params.expectedReturn + (Math.random() - 0.5) * params.volatility * 2) / 100;
        balance = balance * (1 + randomReturn) + params.annualContribution;
        path.push(balance);
      }
      
      // Retirement phase
      for (let i = 0; i < params.retirementYears; i++) {
        const randomReturn = ((params.expectedReturn - 1) + (Math.random() - 0.5) * params.volatility * 2) / 100;
        const inflatedSpending = params.annualSpending * Math.pow(1 + params.inflationRate / 100, i);
        balance = balance * (1 + randomReturn) - inflatedSpending;
        path.push(Math.max(0, balance));
      }
      
      return path;
    };

    const allPaths = Array.from({ length: numSimulations }, generatePath);
    const finalBalances = allPaths.map(p => p[p.length - 1]).sort((a, b) => a - b);
    
    const successCount = finalBalances.filter(b => b > 0).length;
    
    return {
      paths: allPaths.slice(0, 100), // Only keep 100 for visualization
      percentiles: {
        p10: finalBalances[Math.floor(numSimulations * 0.1)],
        p25: finalBalances[Math.floor(numSimulations * 0.25)],
        p50: finalBalances[Math.floor(numSimulations * 0.5)],
        p75: finalBalances[Math.floor(numSimulations * 0.75)],
        p90: finalBalances[Math.floor(numSimulations * 0.9)],
      },
      successRate: (successCount / numSimulations) * 100,
      medianPeak: Math.max(...allPaths[Math.floor(numSimulations / 2)]),
    };
  }, [showResults, params, numSimulations]);

  const totalYears = params.yearsToRetirement + params.retirementYears;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                ← Dashboard
              </Link>
            </div>
            <h1 className="text-3xl font-bold">Monte Carlo Simulator</h1>
            <p className="text-slate-400 mt-1">Stress test your retirement plan with {numSimulations.toLocaleString()} scenarios</p>
          </div>
          <button
            onClick={() => setShowResults(true)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
          >
            🎲 Run Simulation
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Parameters */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <h2 className="text-lg font-semibold mb-4">Current Situation</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Starting Balance</label>
                  <input
                    type="number"
                    value={params.startingBalance}
                    onChange={(e) => setParams({ ...params, startingBalance: Number(e.target.value) })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Annual Contribution</label>
                  <input
                    type="number"
                    value={params.annualContribution}
                    onChange={(e) => setParams({ ...params, annualContribution: Number(e.target.value) })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Years to Retirement</label>
                  <input
                    type="number"
                    value={params.yearsToRetirement}
                    onChange={(e) => setParams({ ...params, yearsToRetirement: Number(e.target.value) })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <h2 className="text-lg font-semibold mb-4">Retirement Plan</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Years in Retirement</label>
                  <input
                    type="number"
                    value={params.retirementYears}
                    onChange={(e) => setParams({ ...params, retirementYears: Number(e.target.value) })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Annual Spending (Today's $)</label>
                  <input
                    type="number"
                    value={params.annualSpending}
                    onChange={(e) => setParams({ ...params, annualSpending: Number(e.target.value) })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <h2 className="text-lg font-semibold mb-4">Assumptions</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Expected Return: {params.expectedReturn}%
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="12"
                    step="0.5"
                    value={params.expectedReturn}
                    onChange={(e) => setParams({ ...params, expectedReturn: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Volatility (Std Dev): {params.volatility}%
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    value={params.volatility}
                    onChange={(e) => setParams({ ...params, volatility: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Inflation Rate: {params.inflationRate}%
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    value={params.inflationRate}
                    onChange={(e) => setParams({ ...params, inflationRate: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Simulations: {numSimulations.toLocaleString()}
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="10000"
                    step="100"
                    value={numSimulations}
                    onChange={(e) => setNumSimulations(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="col-span-2 space-y-6">
            {results ? (
              <>
                {/* Success Rate */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <div className="text-slate-400 text-sm mb-1">Success Rate</div>
                    <div className={`text-4xl font-bold ${
                      results.successRate >= 90 ? 'text-green-400' :
                      results.successRate >= 75 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {results.successRate.toFixed(0)}%
                    </div>
                    <div className="text-sm text-slate-500">
                      {results.successRate >= 90 ? 'Excellent' :
                       results.successRate >= 75 ? 'Good' : 'Needs adjustment'}
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <div className="text-slate-400 text-sm mb-1">Median Final Balance</div>
                    <div className="text-3xl font-bold text-green-400">
                      ${(results.percentiles.p50 / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-sm text-slate-500">50th percentile</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <div className="text-slate-400 text-sm mb-1">Worst Case (10%)</div>
                    <div className={`text-3xl font-bold ${results.percentiles.p10 > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                      ${results.percentiles.p10 > 0 ? (results.percentiles.p10 / 1000).toFixed(0) + 'K' : 'Depleted'}
                    </div>
                    <div className="text-sm text-slate-500">10th percentile</div>
                  </div>
                </div>

                {/* Simulation Fan Chart */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                  <h2 className="text-lg font-semibold mb-4">Projection Fan Chart</h2>
                  <div className="h-64 relative">
                    <svg className="w-full h-full" viewBox={`0 0 ${totalYears * 20} 200`} preserveAspectRatio="none">
                      {/* Retirement line */}
                      <line
                        x1={params.yearsToRetirement * 20}
                        y1="0"
                        x2={params.yearsToRetirement * 20}
                        y2="200"
                        stroke="#6366f1"
                        strokeDasharray="4"
                        strokeWidth="1"
                      />
                      
                      {/* Sample paths */}
                      {results.paths.slice(0, 50).map((path, i) => {
                        const maxVal = results.medianPeak * 1.5;
                        const points = path.map((val, j) => 
                          `${j * 20},${200 - (val / maxVal) * 180}`
                        ).join(' ');
                        return (
                          <polyline
                            key={i}
                            points={points}
                            fill="none"
                            stroke={path[path.length - 1] > 0 ? '#22c55e' : '#ef4444'}
                            strokeWidth="0.5"
                            opacity="0.3"
                          />
                        );
                      })}
                    </svg>
                    
                    {/* Labels */}
                    <div className="absolute bottom-0 left-0 text-xs text-slate-500">Year 0</div>
                    <div 
                      className="absolute bottom-0 text-xs text-purple-400"
                      style={{ left: `${(params.yearsToRetirement / totalYears) * 100}%` }}
                    >
                      Retire
                    </div>
                    <div className="absolute bottom-0 right-0 text-xs text-slate-500">Year {totalYears}</div>
                  </div>
                  <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-0.5 bg-green-500" />
                      <span className="text-xs text-slate-400">Success paths</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-0.5 bg-red-500" />
                      <span className="text-xs text-slate-400">Depleted paths</span>
                    </div>
                  </div>
                </div>

                {/* Percentile Outcomes */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                  <h2 className="text-lg font-semibold mb-4">Final Balance Distribution</h2>
                  <div className="space-y-4">
                    {[
                      { label: '90th Percentile (Best Case)', value: results.percentiles.p90, color: 'green' },
                      { label: '75th Percentile', value: results.percentiles.p75, color: 'emerald' },
                      { label: '50th Percentile (Median)', value: results.percentiles.p50, color: 'blue' },
                      { label: '25th Percentile', value: results.percentiles.p25, color: 'yellow' },
                      { label: '10th Percentile (Worst Case)', value: results.percentiles.p10, color: 'red' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-4">
                        <div className="w-48 text-sm text-slate-400">{item.label}</div>
                        <div className="flex-1 h-6 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-${item.color}-500 rounded-full`}
                            style={{ width: `${Math.min(100, (item.value / results.percentiles.p90) * 100)}%` }}
                          />
                        </div>
                        <div className="w-32 text-right font-medium">
                          {item.value > 0 ? `$${(item.value / 1000000).toFixed(2)}M` : '$0'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
                  <h2 className="text-lg font-semibold mb-4">Analysis & Recommendations</h2>
                  <div className="space-y-4">
                    {results.successRate < 90 && (
                      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <div className="flex items-start gap-3">
                          <span className="text-yellow-400">⚠️</span>
                          <div>
                            <div className="font-medium text-yellow-400">Success rate below 90%</div>
                            <div className="text-sm text-slate-300 mt-1">
                              Consider: Increasing savings by ${Math.round((params.annualSpending - params.annualContribution * 0.5) / 1000) * 1000}/year, 
                              reducing retirement spending, or working {Math.ceil((90 - results.successRate) / 5)} more years.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {results.successRate >= 95 && (
                      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="flex items-start gap-3">
                          <span className="text-green-400">✨</span>
                          <div>
                            <div className="font-medium text-green-400">Excellent success rate!</div>
                            <div className="text-sm text-slate-300 mt-1">
                              You may have room to retire earlier, increase spending, or reduce current savings rate.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <span className="text-blue-400">💡</span>
                        <div className="text-sm text-slate-300">
                          This simulation uses historical market patterns and random variation. Real outcomes depend on 
                          actual market conditions, your health, Social Security, and other factors not modeled here.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-12 text-center">
                <div className="text-6xl mb-4">🎲</div>
                <h2 className="text-xl font-semibold mb-2">Ready to Simulate</h2>
                <p className="text-slate-400 mb-6">
                  Adjust parameters on the left, then click "Run Simulation" to see {numSimulations.toLocaleString()} possible futures
                </p>
                <button
                  onClick={() => setShowResults(true)}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
                >
                  Run Simulation
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
