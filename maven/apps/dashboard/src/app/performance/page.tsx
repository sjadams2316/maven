'use client';

import { useState } from 'react';
import Link from 'next/link';

interface PerformanceData {
  period: string;
  portfolioReturn: number;
  benchmark: number;
  alpha: number;
}

interface HoldingPerformance {
  symbol: string;
  name: string;
  allocation: number;
  return: number;
  contribution: number;
  gainLoss: number;
}

const performanceHistory: PerformanceData[] = [
  { period: 'MTD', portfolioReturn: 2.4, benchmark: 1.8, alpha: 0.6 },
  { period: 'QTD', portfolioReturn: 5.2, benchmark: 4.1, alpha: 1.1 },
  { period: 'YTD', portfolioReturn: 5.2, benchmark: 4.1, alpha: 1.1 },
  { period: '1Y', portfolioReturn: 18.7, benchmark: 15.2, alpha: 3.5 },
  { period: '3Y', portfolioReturn: 42.3, benchmark: 35.8, alpha: 6.5 },
  { period: '5Y', portfolioReturn: 89.4, benchmark: 72.1, alpha: 17.3 },
  { period: 'Since Inception', portfolioReturn: 156.2, benchmark: 118.5, alpha: 37.7 },
];

const holdingPerformance: HoldingPerformance[] = [
  { symbol: 'NVDA', name: 'NVIDIA Corp', allocation: 12.5, return: 45.2, contribution: 5.65, gainLoss: 28500 },
  { symbol: 'AAPL', name: 'Apple Inc', allocation: 10.2, return: 8.4, contribution: 0.86, gainLoss: 8200 },
  { symbol: 'MSFT', name: 'Microsoft Corp', allocation: 9.8, return: 12.1, contribution: 1.19, gainLoss: 11500 },
  { symbol: 'GOOGL', name: 'Alphabet Inc', allocation: 7.5, return: 15.3, contribution: 1.15, gainLoss: 9800 },
  { symbol: 'AMZN', name: 'Amazon.com', allocation: 6.8, return: -2.1, contribution: -0.14, gainLoss: -1400 },
  { symbol: 'META', name: 'Meta Platforms', allocation: 5.4, return: 22.8, contribution: 1.23, gainLoss: 8900 },
  { symbol: 'VTI', name: 'Vanguard Total Stock', allocation: 15.3, return: 11.2, contribution: 1.71, gainLoss: 15200 },
  { symbol: 'BND', name: 'Vanguard Total Bond', allocation: 12.5, return: 2.8, contribution: 0.35, gainLoss: 2800 },
  { symbol: 'VXUS', name: 'Vanguard Intl Stock', allocation: 8.2, return: 6.4, contribution: 0.52, gainLoss: 4100 },
  { symbol: 'TAO', name: 'Bittensor', allocation: 4.8, return: 128.5, contribution: 6.17, gainLoss: 42000 },
];

const attributionFactors = [
  { factor: 'Asset Allocation', contribution: 2.1, description: 'Overweight equities vs bonds' },
  { factor: 'Security Selection', contribution: 1.8, description: 'Individual stock picks outperformed' },
  { factor: 'Sector Allocation', contribution: 0.9, description: 'Tech overweight added value' },
  { factor: 'Currency', contribution: 0.2, description: 'USD strength impact' },
  { factor: 'Timing', contribution: -0.3, description: 'Cash drag from rebalancing' },
  { factor: 'Fees & Costs', contribution: -0.2, description: 'Trading and fund expenses' },
];

export default function PerformancePage() {
  const [selectedPeriod, setSelectedPeriod] = useState('1Y');
  const [benchmark, setBenchmark] = useState('SPY');

  const currentPerf = performanceHistory.find(p => p.period === selectedPeriod) || performanceHistory[3];

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
            <h1 className="text-3xl font-bold">Performance Attribution</h1>
            <p className="text-slate-400 mt-1">Understand what's driving your returns</p>
          </div>
          <div className="flex gap-3">
            <select
              value={benchmark}
              onChange={(e) => setBenchmark(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2"
            >
              <option value="SPY">S&P 500 (SPY)</option>
              <option value="VTI">Total Market (VTI)</option>
              <option value="AGG">Aggregate Bond (AGG)</option>
              <option value="60/40">60/40 Portfolio</option>
            </select>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors">
              📄 Export Report
            </button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 mb-8">
          {performanceHistory.map(p => (
            <button
              key={p.period}
              onClick={() => setSelectedPeriod(p.period)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedPeriod === p.period
                  ? 'bg-purple-600'
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              {p.period}
            </button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-slate-400 text-sm mb-1">Portfolio Return</div>
            <div className={`text-3xl font-bold ${currentPerf.portfolioReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {currentPerf.portfolioReturn >= 0 ? '+' : ''}{currentPerf.portfolioReturn}%
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-slate-400 text-sm mb-1">Benchmark ({benchmark})</div>
            <div className={`text-3xl font-bold ${currentPerf.benchmark >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
              {currentPerf.benchmark >= 0 ? '+' : ''}{currentPerf.benchmark}%
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-slate-400 text-sm mb-1">Alpha (Excess Return)</div>
            <div className={`text-3xl font-bold ${currentPerf.alpha >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {currentPerf.alpha >= 0 ? '+' : ''}{currentPerf.alpha}%
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-slate-400 text-sm mb-1">Sharpe Ratio</div>
            <div className="text-3xl font-bold">1.42</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Performance Chart Placeholder */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
            <h2 className="text-xl font-semibold mb-4">Growth of $100,000</h2>
            <div className="h-64 flex items-end justify-between gap-2 px-4">
              {/* Simple bar visualization */}
              {[
                { month: 'M', port: 102, bench: 101 },
                { month: 'A', port: 105, bench: 103 },
                { month: 'M', port: 108, bench: 106 },
                { month: 'J', port: 104, bench: 104 },
                { month: 'J', port: 112, bench: 108 },
                { month: 'A', port: 115, bench: 110 },
                { month: 'S', port: 111, bench: 107 },
                { month: 'O', port: 114, bench: 109 },
                { month: 'N', port: 118, bench: 113 },
                { month: 'D', port: 116, bench: 112 },
                { month: 'J', port: 120, bench: 114 },
                { month: 'F', port: 119, bench: 115 },
              ].map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-1 items-end h-48">
                    <div 
                      className="flex-1 bg-purple-500 rounded-t"
                      style={{ height: `${(d.port - 95) * 8}%` }}
                    />
                    <div 
                      className="flex-1 bg-blue-500/50 rounded-t"
                      style={{ height: `${(d.bench - 95) * 8}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500">{d.month}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded" />
                <span className="text-sm text-slate-400">Portfolio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500/50 rounded" />
                <span className="text-sm text-slate-400">Benchmark</span>
              </div>
            </div>
          </div>

          {/* Attribution Breakdown */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
            <h2 className="text-xl font-semibold mb-4">Return Attribution</h2>
            <div className="space-y-4">
              {attributionFactors.map((factor, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">{factor.factor}</span>
                    <span className={`text-sm font-medium ${factor.contribution >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {factor.contribution >= 0 ? '+' : ''}{factor.contribution}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${factor.contribution >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ 
                        width: `${Math.abs(factor.contribution) * 20}%`,
                        marginLeft: factor.contribution < 0 ? 'auto' : 0
                      }}
                    />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{factor.description}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-700">
              <div className="flex justify-between">
                <span className="font-medium">Total Alpha</span>
                <span className="font-bold text-green-400">+{currentPerf.alpha}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top/Bottom Contributors */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
          <h2 className="text-xl font-semibold mb-4">Holding Contributions</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left p-3 text-slate-400 font-medium">Holding</th>
                <th className="text-right p-3 text-slate-400 font-medium">Weight</th>
                <th className="text-right p-3 text-slate-400 font-medium">Return</th>
                <th className="text-right p-3 text-slate-400 font-medium">Contribution</th>
                <th className="text-right p-3 text-slate-400 font-medium">Gain/Loss</th>
              </tr>
            </thead>
            <tbody>
              {holdingPerformance
                .sort((a, b) => b.contribution - a.contribution)
                .map((holding, i) => (
                <tr key={i} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                  <td className="p-3">
                    <div className="font-medium">{holding.symbol}</div>
                    <div className="text-sm text-slate-400">{holding.name}</div>
                  </td>
                  <td className="text-right p-3">{holding.allocation}%</td>
                  <td className={`text-right p-3 ${holding.return >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {holding.return >= 0 ? '+' : ''}{holding.return}%
                  </td>
                  <td className={`text-right p-3 font-medium ${holding.contribution >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {holding.contribution >= 0 ? '+' : ''}{holding.contribution}%
                  </td>
                  <td className={`text-right p-3 ${holding.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {holding.gainLoss >= 0 ? '+' : ''}${holding.gainLoss.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Risk Metrics */}
        <div className="grid grid-cols-5 gap-4 mt-6">
          {[
            { label: 'Volatility (Std Dev)', value: '14.2%', description: 'Annualized' },
            { label: 'Max Drawdown', value: '-12.8%', description: 'Peak to trough' },
            { label: 'Beta', value: '1.08', description: 'vs S&P 500' },
            { label: 'Sortino Ratio', value: '1.89', description: 'Downside risk adjusted' },
            { label: 'Information Ratio', value: '0.72', description: 'Consistency of alpha' },
          ].map((metric, i) => (
            <div key={i} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="text-lg font-bold">{metric.value}</div>
              <div className="text-sm text-slate-400">{metric.label}</div>
              <div className="text-xs text-slate-500">{metric.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
