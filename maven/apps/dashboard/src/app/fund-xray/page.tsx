'use client';

import { useState } from 'react';
import Header from '@/app/components/Header';
import DemoBanner from '@/app/components/DemoBanner';
import { ToolExplainer } from '@/app/components/ToolExplainer';
import { useFundData, useFundComparison, useFundOverlap, useDataSources } from '@/hooks/useDataProvider';

// Star rating display
function StarRating({ rating }: { rating?: number }) {
  if (!rating) return <span className="text-gray-500">—</span>;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? 'text-yellow-400' : 'text-gray-600'}>
          ★
        </span>
      ))}
    </div>
  );
}

// Style box visualization (Morningstar-style)
function StyleBox({ size, style }: { size?: 'large' | 'mid' | 'small'; style?: 'value' | 'blend' | 'growth' }) {
  const sizeMap = { large: 0, mid: 1, small: 2 };
  const styleMap = { value: 0, blend: 1, growth: 2 };
  
  const row = size ? sizeMap[size] : -1;
  const col = style ? styleMap[style] : -1;
  
  return (
    <div className="grid grid-cols-3 gap-0.5 w-16 h-16">
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => (
          <div
            key={`${r}-${c}`}
            className={`${
              r === row && c === col
                ? 'bg-indigo-500'
                : 'bg-gray-700'
            } rounded-sm`}
          />
        ))
      )}
    </div>
  );
}

// Sector weights chart
function SectorChart({ weights }: { weights: Record<string, number> }) {
  const sorted = Object.entries(weights).sort(([, a], [, b]) => b - a);
  const colors = [
    'bg-indigo-500', 'bg-purple-500', 'bg-blue-500', 'bg-cyan-500',
    'bg-emerald-500', 'bg-green-500', 'bg-yellow-500', 'bg-orange-500',
    'bg-red-500', 'bg-pink-500', 'bg-gray-500'
  ];

  return (
    <div className="space-y-2">
      {sorted.slice(0, 8).map(([sector, weight], idx) => (
        <div key={sector} className="flex items-center gap-2">
          <div className="w-24 text-xs text-gray-400 truncate">{sector}</div>
          <div className="flex-1 h-4 bg-gray-800 rounded overflow-hidden">
            <div
              className={`h-full ${colors[idx % colors.length]} rounded`}
              style={{ width: `${Math.min(weight, 100)}%` }}
            />
          </div>
          <div className="w-12 text-xs text-gray-400 text-right">{weight.toFixed(1)}%</div>
        </div>
      ))}
    </div>
  );
}

export default function FundXrayPage() {
  const [searchInput, setSearchInput] = useState('');
  const [selectedFund, setSelectedFund] = useState<string | null>('VTI');
  const [compareFund, setCompareFund] = useState<string | null>(null);
  const dataSources = useDataSources();

  // Fetch fund data
  const { data: fundData, loading: fundLoading } = useFundData(selectedFund || '');
  const { data: compareData } = useFundData(compareFund || '');
  const { data: overlapData } = useFundOverlap(selectedFund || '', compareFund || '');

  const quickPicks = ['VTI', 'QQQ', 'VOO', 'BND', 'VXUS', 'AGTHX'];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSelectedFund(searchInput.toUpperCase());
      setSearchInput('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white">
      <Header />
      <DemoBanner />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              🔬 Fund X-Ray
            </h1>
            <p className="text-gray-400 mt-1">
              Look through your funds to see what you actually own
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ToolExplainer toolName="fund-xray" />
            {dataSources.fund === 'mock' && (
              <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full">
                Sample Data
              </span>
            )}
          </div>
        </div>

        {/* Data Source Notice */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-xl">📊</span>
            <div>
              <p className="text-purple-300 font-medium">
                {dataSources.fund === 'mock' 
                  ? 'Demo Mode: Using sample fund data' 
                  : 'Live Mode: Real fund data via Morningstar'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {dataSources.fund === 'mock'
                  ? 'Full fund X-ray with Morningstar data would show complete holdings, overlap analysis, and proprietary ratings.'
                  : 'Connected to Morningstar API for comprehensive fund analysis.'}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-4 mb-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter fund symbol (VTI, QQQ, AGTHX...)"
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition"
            >
              Analyze
            </button>
          </form>
          
          {/* Quick picks */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-sm text-gray-500">Quick:</span>
            {quickPicks.map((symbol) => (
              <button
                key={symbol}
                onClick={() => setSelectedFund(symbol)}
                className={`px-2 py-1 text-sm rounded ${
                  selectedFund === symbol
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>

        {/* Fund Details */}
        {fundLoading && (
          <div className="text-center py-12 text-gray-400">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4" />
            Loading fund data...
          </div>
        )}

        {fundData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{fundData.symbol}</h2>
                  <p className="text-gray-400">{fundData.name}</p>
                  <p className="text-sm text-indigo-400">{fundData.category}</p>
                </div>
                <StyleBox size={fundData.styleBox?.size} style={fundData.styleBox?.style} />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <div className="text-sm text-gray-500">Expense Ratio</div>
                  <div className="text-lg font-semibold text-white">{(fundData.expenseRatio * 100).toFixed(2)}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Morningstar Rating</div>
                  <StarRating rating={fundData.morningstarRating} />
                </div>
              </div>

              {/* Performance */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Performance</h3>
                <div className="grid grid-cols-5 gap-2 text-center">
                  {[
                    { label: 'YTD', value: fundData.performance.ytd },
                    { label: '1Y', value: fundData.performance.oneYear },
                    { label: '3Y', value: fundData.performance.threeYear },
                    { label: '5Y', value: fundData.performance.fiveYear },
                    { label: '10Y', value: fundData.performance.tenYear },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-900 rounded p-2">
                      <div className="text-xs text-gray-500">{label}</div>
                      <div className={`text-sm font-semibold ${value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {value.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Risk Metrics</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-900 rounded p-3">
                    <div className="text-xs text-gray-500">Std Dev</div>
                    <div className="text-sm font-semibold text-white">{fundData.risk.standardDeviation.toFixed(1)}%</div>
                  </div>
                  <div className="bg-gray-900 rounded p-3">
                    <div className="text-xs text-gray-500">Sharpe</div>
                    <div className="text-sm font-semibold text-white">{fundData.risk.sharpeRatio.toFixed(2)}</div>
                  </div>
                  <div className="bg-gray-900 rounded p-3">
                    <div className="text-xs text-gray-500">Beta</div>
                    <div className="text-sm font-semibold text-white">{fundData.risk.beta.toFixed(2)}</div>
                  </div>
                  {fundData.risk.alpha && (
                    <div className="bg-gray-900 rounded p-3">
                      <div className="text-xs text-gray-500">Alpha</div>
                      <div className={`text-sm font-semibold ${fundData.risk.alpha >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {fundData.risk.alpha.toFixed(2)}%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sector Weights */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Sector Allocation</h3>
              <SectorChart weights={fundData.sectorWeights} />
            </div>

            {/* Top Holdings */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Top 10 Holdings</h3>
              <div className="space-y-2">
                {fundData.holdings.slice(0, 10).map((holding, idx) => (
                  <div key={holding.symbol} className="flex items-center justify-between py-2 border-b border-gray-700/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 text-sm w-5">{idx + 1}</span>
                      <div>
                        <div className="text-sm font-medium text-white">{holding.symbol}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[150px]">{holding.name}</div>
                      </div>
                    </div>
                    <div className="text-sm text-indigo-400 font-medium">{holding.weight.toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Fund Comparison */}
        {fundData && (
          <div className="mt-8 bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Compare With Another Fund</h3>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-sm text-gray-500">Compare {selectedFund} to:</span>
              {quickPicks.filter(s => s !== selectedFund).map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => setCompareFund(compareFund === symbol ? null : symbol)}
                  className={`px-2 py-1 text-sm rounded ${
                    compareFund === symbol
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {symbol}
                </button>
              ))}
            </div>

            {compareData && overlapData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                {/* Overlap */}
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-2">Holdings Overlap</div>
                  <div className="text-3xl font-bold text-purple-400">{overlapData.overlap.toFixed(1)}%</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {overlapData.sharedHoldings.length} shared holdings
                  </p>
                </div>

                {/* Side by side */}
                <div className="md:col-span-2">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500">
                        <th className="text-left py-2">Metric</th>
                        <th className="text-right">{selectedFund}</th>
                        <th className="text-right">{compareFund}</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-300">
                      <tr className="border-t border-gray-800">
                        <td className="py-2">Expense Ratio</td>
                        <td className="text-right">{(fundData.expenseRatio * 100).toFixed(2)}%</td>
                        <td className="text-right">{(compareData.expenseRatio * 100).toFixed(2)}%</td>
                      </tr>
                      <tr className="border-t border-gray-800">
                        <td className="py-2">1-Year Return</td>
                        <td className={`text-right ${fundData.performance.oneYear >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {fundData.performance.oneYear.toFixed(1)}%
                        </td>
                        <td className={`text-right ${compareData.performance.oneYear >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {compareData.performance.oneYear.toFixed(1)}%
                        </td>
                      </tr>
                      <tr className="border-t border-gray-800">
                        <td className="py-2">Sharpe Ratio</td>
                        <td className="text-right">{fundData.risk.sharpeRatio.toFixed(2)}</td>
                        <td className="text-right">{compareData.risk.sharpeRatio.toFixed(2)}</td>
                      </tr>
                      <tr className="border-t border-gray-800">
                        <td className="py-2">Beta</td>
                        <td className="text-right">{fundData.risk.beta.toFixed(2)}</td>
                        <td className="text-right">{compareData.risk.beta.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* What's possible with Morningstar */}
        {dataSources.fund === 'mock' && (
          <div className="mt-8 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              🚀 With Morningstar Integration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-300">
              <div>
                <div className="text-purple-400 font-medium mb-1">Complete Holdings</div>
                <p>See all 100+ positions in your funds, not just top 10</p>
              </div>
              <div>
                <div className="text-purple-400 font-medium mb-1">Portfolio X-Ray</div>
                <p>Aggregate all your funds to see true underlying exposure</p>
              </div>
              <div>
                <div className="text-purple-400 font-medium mb-1">Proprietary Ratings</div>
                <p>Morningstar star ratings, analyst medals, and forward-looking assessments</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
