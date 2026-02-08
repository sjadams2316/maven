'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Holding {
  symbol: string;
  name: string;
  currentValue: number;
  currentWeight: number;
  targetWeight: number;
  drift: number;
  action: 'buy' | 'sell' | 'hold';
  shares: number;
  tradeAmount: number;
  taxImpact?: number;
}

const holdings: Holding[] = [
  { symbol: 'VTI', name: 'Vanguard Total Stock', currentValue: 125000, currentWeight: 31.25, targetWeight: 35, drift: -3.75, action: 'buy', shares: 0, tradeAmount: 15000, taxImpact: 0 },
  { symbol: 'VXUS', name: 'Vanguard Intl Stock', currentValue: 48000, currentWeight: 12, targetWeight: 15, drift: -3, action: 'buy', shares: 0, tradeAmount: 12000, taxImpact: 0 },
  { symbol: 'BND', name: 'Vanguard Total Bond', currentValue: 52000, currentWeight: 13, targetWeight: 15, drift: -2, action: 'buy', shares: 0, tradeAmount: 8000, taxImpact: 0 },
  { symbol: 'NVDA', name: 'NVIDIA Corp', currentValue: 58000, currentWeight: 14.5, targetWeight: 8, drift: 6.5, action: 'sell', shares: 0, tradeAmount: -26000, taxImpact: 4200 },
  { symbol: 'AAPL', name: 'Apple Inc', currentValue: 42000, currentWeight: 10.5, targetWeight: 8, drift: 2.5, action: 'sell', shares: 0, tradeAmount: -10000, taxImpact: 1800 },
  { symbol: 'MSFT', name: 'Microsoft Corp', currentValue: 38000, currentWeight: 9.5, targetWeight: 8, drift: 1.5, action: 'sell', shares: 0, tradeAmount: -6000, taxImpact: 950 },
  { symbol: 'GOOGL', name: 'Alphabet Inc', currentValue: 22000, currentWeight: 5.5, targetWeight: 6, drift: -0.5, action: 'hold', shares: 0, tradeAmount: 2000, taxImpact: 0 },
  { symbol: 'TAO', name: 'Bittensor', currentValue: 15000, currentWeight: 3.75, targetWeight: 5, drift: -1.25, action: 'buy', shares: 0, tradeAmount: 5000, taxImpact: 0 },
];

const modelPortfolios = [
  { name: 'Current Target', description: 'Your existing allocation targets' },
  { name: 'Growth 80/20', description: '80% stocks, 20% bonds' },
  { name: 'Balanced 60/40', description: '60% stocks, 40% bonds' },
  { name: 'Conservative 40/60', description: '40% stocks, 60% bonds' },
  { name: 'All-Weather', description: 'Ray Dalio inspired allocation' },
];

export default function RebalancePage() {
  const [selectedModel, setSelectedModel] = useState('Current Target');
  const [driftThreshold, setDriftThreshold] = useState(5);
  const [taxAware, setTaxAware] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  const totalPortfolio = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalDrift = holdings.reduce((sum, h) => sum + Math.abs(h.drift), 0) / 2;
  const taxableGains = holdings.filter(h => h.action === 'sell').reduce((sum, h) => sum + (h.taxImpact || 0), 0);
  const tradesNeeded = holdings.filter(h => Math.abs(h.drift) > driftThreshold / 2).length;

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
            <h1 className="text-3xl font-bold">Portfolio Rebalancing</h1>
            <p className="text-slate-400 mt-1">Realign your portfolio to target allocation</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
              📥 Import Targets
            </button>
            <button 
              onClick={() => setShowPreview(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
            >
              Preview Trades
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-slate-400 text-sm mb-1">Portfolio Value</div>
            <div className="text-2xl font-bold">${totalPortfolio.toLocaleString()}</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-slate-400 text-sm mb-1">Total Drift</div>
            <div className={`text-2xl font-bold ${totalDrift > 5 ? 'text-yellow-400' : 'text-green-400'}`}>
              {totalDrift.toFixed(1)}%
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-slate-400 text-sm mb-1">Trades Needed</div>
            <div className="text-2xl font-bold">{tradesNeeded}</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-slate-400 text-sm mb-1">Est. Tax Impact</div>
            <div className="text-2xl font-bold text-red-400">${taxableGains.toLocaleString()}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 mb-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Model Portfolio</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2"
              >
                {modelPortfolios.map(model => (
                  <option key={model.name} value={model.name}>{model.name}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                {modelPortfolios.find(m => m.name === selectedModel)?.description}
              </p>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Drift Threshold: {driftThreshold}%
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={driftThreshold}
                onChange={(e) => setDriftThreshold(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-slate-500 mt-1">
                Only rebalance positions that drift more than this amount
              </p>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Tax-Aware Mode</label>
              <button
                onClick={() => setTaxAware(!taxAware)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  taxAware ? 'bg-green-600' : 'bg-slate-700'
                }`}
              >
                {taxAware ? '✓ Enabled' : 'Disabled'}
              </button>
              <p className="text-xs text-slate-500 mt-1">
                Minimize tax impact by preferring tax-advantaged accounts
              </p>
            </div>
          </div>
        </div>

        {/* Allocation Visualization */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
            <h3 className="font-semibold mb-4">Current Allocation</h3>
            <div className="flex h-8 rounded-lg overflow-hidden mb-4">
              {holdings.map((h, i) => (
                <div
                  key={i}
                  className="relative group"
                  style={{
                    width: `${h.currentWeight}%`,
                    backgroundColor: `hsl(${i * 40}, 70%, 50%)`,
                  }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 rounded text-xs whitespace-nowrap z-10">
                    {h.symbol}: {h.currentWeight}%
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {holdings.map((h, i) => (
                <div key={i} className="flex items-center gap-1 text-xs">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: `hsl(${i * 40}, 70%, 50%)` }}
                  />
                  <span>{h.symbol}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
            <h3 className="font-semibold mb-4">Target Allocation</h3>
            <div className="flex h-8 rounded-lg overflow-hidden mb-4">
              {holdings.map((h, i) => (
                <div
                  key={i}
                  className="relative group"
                  style={{
                    width: `${h.targetWeight}%`,
                    backgroundColor: `hsl(${i * 40}, 70%, 50%)`,
                  }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 rounded text-xs whitespace-nowrap z-10">
                    {h.symbol}: {h.targetWeight}%
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {holdings.map((h, i) => (
                <div key={i} className="flex items-center gap-1 text-xs">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: `hsl(${i * 40}, 70%, 50%)` }}
                  />
                  <span>{h.symbol}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left p-4 text-slate-400 font-medium">Holding</th>
                <th className="text-right p-4 text-slate-400 font-medium">Current Value</th>
                <th className="text-right p-4 text-slate-400 font-medium">Current %</th>
                <th className="text-right p-4 text-slate-400 font-medium">Target %</th>
                <th className="text-right p-4 text-slate-400 font-medium">Drift</th>
                <th className="text-right p-4 text-slate-400 font-medium">Action</th>
                <th className="text-right p-4 text-slate-400 font-medium">Trade Amount</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding, i) => (
                <tr key={i} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                  <td className="p-4">
                    <div className="font-medium">{holding.symbol}</div>
                    <div className="text-sm text-slate-400">{holding.name}</div>
                  </td>
                  <td className="text-right p-4">${holding.currentValue.toLocaleString()}</td>
                  <td className="text-right p-4">{holding.currentWeight}%</td>
                  <td className="text-right p-4">
                    <input
                      type="number"
                      value={holding.targetWeight}
                      className="w-16 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-right"
                      readOnly
                    />
                  </td>
                  <td className={`text-right p-4 font-medium ${
                    holding.drift > 0 ? 'text-red-400' : holding.drift < 0 ? 'text-blue-400' : 'text-slate-400'
                  }`}>
                    {holding.drift > 0 ? '+' : ''}{holding.drift.toFixed(1)}%
                  </td>
                  <td className="text-right p-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      holding.action === 'buy' ? 'bg-green-500/20 text-green-400' :
                      holding.action === 'sell' ? 'bg-red-500/20 text-red-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {holding.action.toUpperCase()}
                    </span>
                  </td>
                  <td className={`text-right p-4 font-medium ${
                    holding.tradeAmount > 0 ? 'text-green-400' : holding.tradeAmount < 0 ? 'text-red-400' : ''
                  }`}>
                    {holding.tradeAmount > 0 ? '+' : ''}${Math.abs(holding.tradeAmount).toLocaleString()}
                    {holding.taxImpact && holding.taxImpact > 0 && (
                      <div className="text-xs text-yellow-400">Tax: ${holding.taxImpact.toLocaleString()}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-slate-400">
            {taxAware && (
              <span className="flex items-center gap-2">
                <span className="text-yellow-400">⚠️</span>
                Tax-aware mode will prioritize rebalancing in tax-advantaged accounts
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
              Save as Draft
            </button>
            <button className="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors">
              Generate Trade Orders →
            </button>
          </div>
        </div>

        {/* Trade Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto">
              <h2 className="text-2xl font-bold mb-4">Trade Preview</h2>
              <div className="space-y-4 mb-6">
                {holdings.filter(h => h.action !== 'hold').map((h, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg">
                    <div>
                      <div className="font-medium">{h.action === 'buy' ? 'BUY' : 'SELL'} {h.symbol}</div>
                      <div className="text-sm text-slate-400">{h.name}</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${h.action === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                        ${Math.abs(h.tradeAmount).toLocaleString()}
                      </div>
                      {h.taxImpact && h.taxImpact > 0 && (
                        <div className="text-xs text-yellow-400">Est. tax: ${h.taxImpact}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-700 pt-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span>Total Buys</span>
                  <span className="text-green-400">
                    ${holdings.filter(h => h.action === 'buy').reduce((sum, h) => sum + h.tradeAmount, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Total Sells</span>
                  <span className="text-red-400">
                    ${Math.abs(holdings.filter(h => h.action === 'sell').reduce((sum, h) => sum + h.tradeAmount, 0)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Est. Tax Impact</span>
                  <span className="text-yellow-400">${taxableGains.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg">
                  Confirm & Execute
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
