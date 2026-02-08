'use client';

import { useState } from 'react';

// Benchmark data - sourced from public index data
const BENCHMARKS = {
  'sp500': {
    name: 'S&P 500',
    ticker: 'SPY',
    description: '500 largest US companies',
    allocation: { 'US Equity': 100, 'Intl Developed': 0, 'Emerging Markets': 0, 'US Bonds': 0 },
    returns: { '1yr': 24.2, '3yr': 8.9, '5yr': 14.5, '10yr': 12.1 },
    volatility: 15.5,
    sharpe: 0.78,
    maxDrawdown: -33.9, // 2020 COVID
    source: 'S&P Dow Jones Indices, as of Dec 2024'
  },
  'total_market': {
    name: 'Total US Stock Market',
    ticker: 'VTI',
    description: 'Entire US stock market (4000+ stocks)',
    allocation: { 'US Equity': 100, 'Intl Developed': 0, 'Emerging Markets': 0, 'US Bonds': 0 },
    returns: { '1yr': 23.8, '3yr': 8.5, '5yr': 14.1, '10yr': 11.8 },
    volatility: 15.8,
    sharpe: 0.75,
    maxDrawdown: -34.5,
    source: 'Vanguard, as of Dec 2024'
  },
  '60_40': {
    name: 'Classic 60/40',
    ticker: 'VBIAX',
    description: '60% stocks / 40% bonds',
    allocation: { 'US Equity': 60, 'Intl Developed': 0, 'Emerging Markets': 0, 'US Bonds': 40 },
    returns: { '1yr': 16.4, '3yr': 4.2, '5yr': 8.9, '10yr': 8.1 },
    volatility: 10.2,
    sharpe: 0.79,
    maxDrawdown: -22.1,
    source: 'Vanguard Balanced Index, as of Dec 2024'
  },
  'target_2035': {
    name: 'Target Date 2035',
    ticker: 'VTTHX',
    description: 'Vanguard Target Retirement 2035',
    allocation: { 'US Equity': 52, 'Intl Developed': 22, 'Emerging Markets': 0, 'US Bonds': 26 },
    returns: { '1yr': 14.8, '3yr': 3.9, '5yr': 8.2, '10yr': 7.8 },
    volatility: 11.5,
    sharpe: 0.68,
    maxDrawdown: -24.5,
    source: 'Vanguard, as of Dec 2024'
  },
  'agg_bond': {
    name: 'US Aggregate Bonds',
    ticker: 'BND',
    description: 'Total US bond market',
    allocation: { 'US Equity': 0, 'Intl Developed': 0, 'Emerging Markets': 0, 'US Bonds': 100 },
    returns: { '1yr': 1.3, '3yr': -3.5, '5yr': -0.2, '10yr': 1.4 },
    volatility: 5.5,
    sharpe: 0.25,
    maxDrawdown: -17.2, // 2022
    source: 'Vanguard Total Bond Market, as of Dec 2024'
  },
};

export default function BenchmarkComparison({ portfolio, onClose }) {
  const [selectedBenchmarks, setSelectedBenchmarks] = useState(['sp500', '60_40', 'target_2035']);
  const [timeframe, setTimeframe] = useState('10yr');

  const toggleBenchmark = (key) => {
    if (selectedBenchmarks.includes(key)) {
      setSelectedBenchmarks(selectedBenchmarks.filter(b => b !== key));
    } else if (selectedBenchmarks.length < 4) {
      setSelectedBenchmarks([...selectedBenchmarks, key]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">📊 Benchmark Comparison</h2>
          <p className="text-gray-600">See how your All-Star portfolio stacks up</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
      </div>

      {/* Benchmark Selector */}
      <div className="bg-white rounded-xl shadow p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Select benchmarks to compare (max 4):</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(BENCHMARKS).map(([key, bench]) => (
            <button
              key={key}
              onClick={() => toggleBenchmark(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedBenchmarks.includes(key)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {bench.name}
            </button>
          ))}
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex gap-2">
        {['1yr', '3yr', '5yr', '10yr'].map(tf => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              timeframe === tf ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {tf.replace('yr', ' Year')}
          </button>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 font-medium">Portfolio</th>
              <th className="text-center py-3 px-4 font-medium">{timeframe.replace('yr', 'Y')} Return</th>
              <th className="text-center py-3 px-4 font-medium">Volatility</th>
              <th className="text-center py-3 px-4 font-medium">Sharpe</th>
              <th className="text-center py-3 px-4 font-medium">Max Drawdown</th>
            </tr>
          </thead>
          <tbody>
            {/* Your Portfolio */}
            <tr className="bg-indigo-50 border-b-2 border-indigo-200">
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⭐</span>
                  <div>
                    <p className="font-bold text-indigo-700">Your All-Star</p>
                    <p className="text-xs text-gray-500">Maven Hybrid Model</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4 text-center">
                <span className="text-xl font-bold text-green-600">{portfolio.expectedReturn}%</span>
              </td>
              <td className="py-4 px-4 text-center">
                <span className="font-medium">{portfolio.expectedVol}%</span>
              </td>
              <td className="py-4 px-4 text-center">
                <span className="font-bold text-indigo-600">{portfolio.sharpe}</span>
              </td>
              <td className="py-4 px-4 text-center">
                <span className="text-red-600">~{Math.round(portfolio.expectedVol * -2.2)}%</span>
              </td>
            </tr>

            {/* Benchmarks */}
            {selectedBenchmarks.map(key => {
              const bench = BENCHMARKS[key];
              const returnValue = bench.returns[timeframe];
              const isWinning = parseFloat(portfolio.expectedReturn) > returnValue;
              
              return (
                <tr key={key} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium">{bench.name}</p>
                      <p className="text-xs text-gray-500">{bench.ticker} • {bench.description}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`text-xl font-bold ${isWinning ? 'text-gray-500' : 'text-green-600'}`}>
                      {returnValue}%
                    </span>
                    {isWinning && <span className="text-xs text-green-600 block">You beat this!</span>}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-medium">{bench.volatility}%</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`font-bold ${parseFloat(portfolio.sharpe) > bench.sharpe ? 'text-gray-500' : 'text-indigo-600'}`}>
                      {bench.sharpe}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-red-600">{bench.maxDrawdown}%</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Visual Comparison */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold mb-4">Return Comparison ({timeframe.replace('yr', '-Year')})</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <span className="w-32 text-sm font-medium">⭐ Your All-Star</span>
            <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                style={{ width: `${(parseFloat(portfolio.expectedReturn) / 15) * 100}%` }}
              />
            </div>
            <span className="w-16 text-right font-bold">{portfolio.expectedReturn}%</span>
          </div>
          {selectedBenchmarks.map(key => {
            const bench = BENCHMARKS[key];
            const returnValue = bench.returns[timeframe];
            return (
              <div key={key} className="flex items-center gap-4">
                <span className="w-32 text-sm text-gray-600 truncate">{bench.name}</span>
                <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gray-400 rounded-full"
                    style={{ width: `${(returnValue / 15) * 100}%` }}
                  />
                </div>
                <span className="w-16 text-right font-medium">{returnValue}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Sources */}
      <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500">
        <strong>Data Sources:</strong>
        <ul className="mt-2 space-y-1">
          {selectedBenchmarks.map(key => (
            <li key={key}>• {BENCHMARKS[key].name}: {BENCHMARKS[key].source}</li>
          ))}
          <li>• Your All-Star: Based on forward-looking CMAs from JPMorgan, Vanguard, BlackRock (2025)</li>
        </ul>
        <p className="mt-2 italic">Past performance does not guarantee future results. Forward-looking estimates involve uncertainty.</p>
      </div>
    </div>
  );
}
