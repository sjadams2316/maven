'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Benchmark {
  id: string;
  name: string;
  description: string;
  ytd: number;
  oneYear: number;
  threeYear: number;
  fiveYear: number;
  volatility: number;
  sharpe: number;
}

const benchmarks: Benchmark[] = [
  { id: 'SPY', name: 'S&P 500', description: 'Large-cap US stocks', ytd: 4.1, oneYear: 15.2, threeYear: 35.8, fiveYear: 72.1, volatility: 15.2, sharpe: 1.02 },
  { id: 'VTI', name: 'Total US Market', description: 'All US stocks', ytd: 3.9, oneYear: 14.8, threeYear: 34.2, fiveYear: 70.5, volatility: 15.8, sharpe: 0.98 },
  { id: 'QQQ', name: 'Nasdaq 100', description: 'Large-cap tech', ytd: 5.8, oneYear: 22.4, threeYear: 48.2, fiveYear: 112.3, volatility: 20.1, sharpe: 1.12 },
  { id: 'IWM', name: 'Russell 2000', description: 'Small-cap US stocks', ytd: 1.2, oneYear: 8.4, threeYear: 18.5, fiveYear: 42.1, volatility: 22.4, sharpe: 0.65 },
  { id: 'VXUS', name: 'Intl Developed', description: 'Non-US developed markets', ytd: 2.1, oneYear: 6.2, threeYear: 12.8, fiveYear: 28.4, volatility: 14.8, sharpe: 0.58 },
  { id: 'VWO', name: 'Emerging Markets', description: 'Developing economies', ytd: 1.8, oneYear: 4.5, threeYear: 8.2, fiveYear: 18.2, volatility: 18.2, sharpe: 0.42 },
  { id: 'AGG', name: 'US Aggregate Bond', description: 'Investment grade bonds', ytd: 0.8, oneYear: 2.4, threeYear: -2.1, fiveYear: 4.8, volatility: 5.2, sharpe: 0.28 },
  { id: 'BTC', name: 'Bitcoin', description: 'Cryptocurrency', ytd: -5.2, oneYear: 85.4, threeYear: 142.8, fiveYear: 320.5, volatility: 62.4, sharpe: 0.95 },
];

const portfolioReturn = { ytd: 5.2, oneYear: 18.7, threeYear: 42.3, fiveYear: 89.4 };

export default function BenchmarksPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'ytd' | 'oneYear' | 'threeYear' | 'fiveYear'>('oneYear');
  const [selectedBenchmarks, setSelectedBenchmarks] = useState<string[]>(['SPY', 'AGG']);

  const toggleBenchmark = (id: string) => {
    setSelectedBenchmarks(prev => 
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const periodLabels = {
    ytd: 'YTD',
    oneYear: '1 Year',
    threeYear: '3 Year',
    fiveYear: '5 Year',
  };

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
            <h1 className="text-3xl font-bold">Benchmark Comparison</h1>
            <p className="text-slate-400 mt-1">Compare your portfolio against market benchmarks</p>
          </div>
          <div className="flex gap-2">
            {Object.entries(periodLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedPeriod(key as typeof selectedPeriod)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedPeriod === key ? 'bg-purple-600' : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Portfolio vs Selected Benchmarks */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Your Portfolio vs Benchmarks ({periodLabels[selectedPeriod]})</h2>
          
          <div className="space-y-4">
            {/* Portfolio */}
            <div className="flex items-center gap-4">
              <div className="w-40 font-medium">Your Portfolio</div>
              <div className="flex-1 h-8 bg-slate-700 rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(5, (portfolioReturn[selectedPeriod] / 100) * 100)}%` }}
                />
              </div>
              <div className={`w-24 text-right font-bold ${portfolioReturn[selectedPeriod] >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {portfolioReturn[selectedPeriod] >= 0 ? '+' : ''}{portfolioReturn[selectedPeriod]}%
              </div>
            </div>

            {/* Selected Benchmarks */}
            {selectedBenchmarks.map(id => {
              const benchmark = benchmarks.find(b => b.id === id);
              if (!benchmark) return null;
              const value = benchmark[selectedPeriod];
              const diff = portfolioReturn[selectedPeriod] - value;
              return (
                <div key={id} className="flex items-center gap-4">
                  <div className="w-40 text-slate-400">{benchmark.name}</div>
                  <div className="flex-1 h-8 bg-slate-700 rounded-full overflow-hidden relative">
                    <div 
                      className="h-full bg-slate-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, (value / 100) * 100)}%` }}
                    />
                  </div>
                  <div className={`w-24 text-right ${value >= 0 ? 'text-slate-300' : 'text-red-400'}`}>
                    {value >= 0 ? '+' : ''}{value}%
                  </div>
                  <div className={`w-20 text-right text-sm ${diff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ({diff >= 0 ? '+' : ''}{diff.toFixed(1)}%)
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-6 mt-6 pt-4 border-t border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-purple-600 to-purple-400 rounded" />
              <span className="text-sm text-slate-400">Your Portfolio</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-slate-500 rounded" />
              <span className="text-sm text-slate-400">Benchmark</span>
            </div>
            <div className="text-sm text-slate-500 ml-auto">
              Difference shown in parentheses (portfolio - benchmark)
            </div>
          </div>
        </div>

        {/* Benchmark Table */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="p-4 border-b border-slate-700/50">
            <h2 className="text-lg font-semibold">All Benchmarks</h2>
            <p className="text-sm text-slate-400">Click to add/remove from comparison</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left p-4 text-slate-400 font-medium">Benchmark</th>
                <th className="text-right p-4 text-slate-400 font-medium">YTD</th>
                <th className="text-right p-4 text-slate-400 font-medium">1 Year</th>
                <th className="text-right p-4 text-slate-400 font-medium">3 Year</th>
                <th className="text-right p-4 text-slate-400 font-medium">5 Year</th>
                <th className="text-right p-4 text-slate-400 font-medium">Volatility</th>
                <th className="text-right p-4 text-slate-400 font-medium">Sharpe</th>
                <th className="text-center p-4 text-slate-400 font-medium">Compare</th>
              </tr>
            </thead>
            <tbody>
              {/* Your Portfolio Row */}
              <tr className="border-b border-purple-500/30 bg-purple-500/10">
                <td className="p-4">
                  <div className="font-semibold text-purple-400">Your Portfolio</div>
                </td>
                <td className={`text-right p-4 font-medium ${portfolioReturn.ytd >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {portfolioReturn.ytd >= 0 ? '+' : ''}{portfolioReturn.ytd}%
                </td>
                <td className={`text-right p-4 font-medium ${portfolioReturn.oneYear >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {portfolioReturn.oneYear >= 0 ? '+' : ''}{portfolioReturn.oneYear}%
                </td>
                <td className={`text-right p-4 font-medium ${portfolioReturn.threeYear >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {portfolioReturn.threeYear >= 0 ? '+' : ''}{portfolioReturn.threeYear}%
                </td>
                <td className={`text-right p-4 font-medium ${portfolioReturn.fiveYear >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {portfolioReturn.fiveYear >= 0 ? '+' : ''}{portfolioReturn.fiveYear}%
                </td>
                <td className="text-right p-4 text-slate-400">14.2%</td>
                <td className="text-right p-4">1.32</td>
                <td className="text-center p-4">—</td>
              </tr>

              {/* Benchmark Rows */}
              {benchmarks.map((benchmark) => {
                const isSelected = selectedBenchmarks.includes(benchmark.id);
                return (
                  <tr 
                    key={benchmark.id} 
                    className={`border-b border-slate-700/30 hover:bg-slate-700/20 cursor-pointer ${
                      isSelected ? 'bg-slate-700/30' : ''
                    }`}
                    onClick={() => toggleBenchmark(benchmark.id)}
                  >
                    <td className="p-4">
                      <div className="font-medium">{benchmark.name}</div>
                      <div className="text-sm text-slate-400">{benchmark.description}</div>
                    </td>
                    <td className={`text-right p-4 ${benchmark.ytd >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {benchmark.ytd >= 0 ? '+' : ''}{benchmark.ytd}%
                    </td>
                    <td className={`text-right p-4 ${benchmark.oneYear >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {benchmark.oneYear >= 0 ? '+' : ''}{benchmark.oneYear}%
                    </td>
                    <td className={`text-right p-4 ${benchmark.threeYear >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {benchmark.threeYear >= 0 ? '+' : ''}{benchmark.threeYear}%
                    </td>
                    <td className={`text-right p-4 ${benchmark.fiveYear >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {benchmark.fiveYear >= 0 ? '+' : ''}{benchmark.fiveYear}%
                    </td>
                    <td className="text-right p-4 text-slate-400">{benchmark.volatility}%</td>
                    <td className="text-right p-4">{benchmark.sharpe.toFixed(2)}</td>
                    <td className="text-center p-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-5 h-5 rounded"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Alpha Analysis */}
        <div className="grid grid-cols-2 gap-6 mt-8">
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold mb-4">Alpha vs S&P 500</h3>
            <div className="space-y-4">
              {[
                { period: 'YTD', alpha: portfolioReturn.ytd - benchmarks[0].ytd },
                { period: '1 Year', alpha: portfolioReturn.oneYear - benchmarks[0].oneYear },
                { period: '3 Year', alpha: portfolioReturn.threeYear - benchmarks[0].threeYear },
                { period: '5 Year', alpha: portfolioReturn.fiveYear - benchmarks[0].fiveYear },
              ].map((item) => (
                <div key={item.period} className="flex items-center justify-between">
                  <span className="text-slate-400">{item.period}</span>
                  <span className={`font-medium ${item.alpha >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {item.alpha >= 0 ? '+' : ''}{item.alpha.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold mb-4">Risk-Adjusted Returns</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Sharpe Ratio</span>
                <span className="font-medium">1.32 <span className="text-green-400 text-sm">(vs 1.02 SPY)</span></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Sortino Ratio</span>
                <span className="font-medium">1.89</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Treynor Ratio</span>
                <span className="font-medium">0.14</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Information Ratio</span>
                <span className="font-medium">0.72</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
