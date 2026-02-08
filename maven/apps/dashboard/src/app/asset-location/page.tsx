'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ToolExplainer } from '@/app/components/ToolExplainer';

interface Holding {
  symbol: string;
  name: string;
  type: 'stock' | 'bond' | 'reit' | 'intl' | 'crypto';
  taxEfficiency: 'high' | 'medium' | 'low';
  currentLocation: string;
  optimalLocation: string;
  value: number;
  annualIncome: number;
  taxDrag: number;
}

const holdings: Holding[] = [
  { symbol: 'VTI', name: 'Vanguard Total Stock', type: 'stock', taxEfficiency: 'high', currentLocation: 'Individual', optimalLocation: 'Individual', value: 125000, annualIncome: 1875, taxDrag: 0 },
  { symbol: 'NVDA', name: 'NVIDIA Corp', type: 'stock', taxEfficiency: 'high', currentLocation: 'Individual', optimalLocation: 'Individual', value: 58000, annualIncome: 58, taxDrag: 0 },
  { symbol: 'BND', name: 'Vanguard Total Bond', type: 'bond', taxEfficiency: 'low', currentLocation: 'Individual', optimalLocation: 'IRA', value: 52000, annualIncome: 2080, taxDrag: 728 },
  { symbol: 'VXUS', name: 'Vanguard Intl Stock', type: 'intl', taxEfficiency: 'medium', currentLocation: 'IRA', optimalLocation: 'Individual', value: 48000, annualIncome: 1440, taxDrag: 216 },
  { symbol: 'VNQ', name: 'Vanguard REIT', type: 'reit', taxEfficiency: 'low', currentLocation: 'Individual', optimalLocation: 'Roth IRA', value: 25000, annualIncome: 1000, taxDrag: 350 },
  { symbol: 'SCHD', name: 'Schwab Dividend', type: 'stock', taxEfficiency: 'medium', currentLocation: '401(k)', optimalLocation: 'Individual', value: 35000, annualIncome: 1225, taxDrag: 122 },
  { symbol: 'TAO', name: 'Bittensor', type: 'crypto', taxEfficiency: 'low', currentLocation: 'Individual', optimalLocation: 'Roth IRA', value: 15000, annualIncome: 0, taxDrag: 0 },
];

const accounts = [
  { name: 'Individual', type: 'Taxable', balance: 275000, optimal: 231000 },
  { name: 'Traditional IRA', type: 'Tax-Deferred', balance: 85000, optimal: 77000 },
  { name: 'Roth IRA', type: 'Tax-Free', balance: 62000, optimal: 75000 },
  { name: '401(k)', type: 'Tax-Deferred', balance: 83000, optimal: 72000 },
];

export default function AssetLocationPage() {
  const [showOptimized, setShowOptimized] = useState(false);

  const totalTaxDrag = holdings.reduce((sum, h) => sum + h.taxDrag, 0);
  const potentialSavings = totalTaxDrag * 0.8; // Assume we can recover 80%

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
            <h1 className="text-3xl font-bold">Asset Location Optimizer</h1>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-slate-400">Maximize tax efficiency across your accounts</p>
              <ToolExplainer toolName="asset-location" />
            </div>
          </div>
          <button
            onClick={() => setShowOptimized(!showOptimized)}
            className={`px-6 py-3 rounded-lg transition-colors ${
              showOptimized ? 'bg-green-600' : 'bg-purple-600 hover:bg-purple-500'
            }`}
          >
            {showOptimized ? '✓ Showing Optimized' : 'Show Optimized Layout'}
          </button>
        </div>

        {/* Tax Savings Summary */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-slate-400 text-sm mb-1">Current Annual Tax Drag</div>
            <div className="text-2xl font-bold text-red-400">${totalTaxDrag.toLocaleString()}</div>
            <div className="text-sm text-slate-500">Taxes paid on mislocated assets</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-slate-400 text-sm mb-1">Potential Annual Savings</div>
            <div className="text-2xl font-bold text-green-400">${potentialSavings.toLocaleString()}</div>
            <div className="text-sm text-slate-500">By optimizing asset locations</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-slate-400 text-sm mb-1">10-Year Impact</div>
            <div className="text-2xl font-bold text-green-400">${(potentialSavings * 10 * 1.07).toLocaleString()}</div>
            <div className="text-sm text-slate-500">Compounded at 7%</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <div className="text-slate-400 text-sm mb-1">Mislocated Assets</div>
            <div className="text-2xl font-bold text-yellow-400">4</div>
            <div className="text-sm text-slate-500">Out of {holdings.length} holdings</div>
          </div>
        </div>

        {/* Account Distribution */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {accounts.map((account) => {
            const diff = showOptimized ? account.optimal - account.balance : 0;
            return (
              <div key={account.name} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="text-sm text-slate-400 mb-1">{account.name}</div>
                <div className="text-xs text-slate-500 mb-2">{account.type}</div>
                <div className="text-xl font-bold">
                  ${(showOptimized ? account.optimal : account.balance).toLocaleString()}
                </div>
                {showOptimized && diff !== 0 && (
                  <div className={`text-sm ${diff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {diff > 0 ? '+' : ''}${diff.toLocaleString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tax Efficiency Guide */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Asset Location Principles</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-4 bg-slate-700/30 rounded-lg">
              <div className="text-green-400 font-medium mb-2">🏦 Taxable Accounts</div>
              <div className="text-sm text-slate-400 mb-2">Best for tax-efficient assets:</div>
              <ul className="text-sm space-y-1">
                <li>• US stock index funds (VTI, VOO)</li>
                <li>• International stocks (foreign tax credit)</li>
                <li>• Growth stocks (unrealized gains)</li>
                <li>• Municipal bonds</li>
              </ul>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg">
              <div className="text-blue-400 font-medium mb-2">⏳ Tax-Deferred (IRA/401k)</div>
              <div className="text-sm text-slate-400 mb-2">Best for tax-inefficient assets:</div>
              <ul className="text-sm space-y-1">
                <li>• Bonds (interest taxed as income)</li>
                <li>• REITs (high dividends)</li>
                <li>• High-turnover funds</li>
                <li>• Dividend-focused strategies</li>
              </ul>
            </div>
            <div className="p-4 bg-slate-700/30 rounded-lg">
              <div className="text-purple-400 font-medium mb-2">✨ Roth (Tax-Free)</div>
              <div className="text-sm text-slate-400 mb-2">Best for highest-growth assets:</div>
              <ul className="text-sm space-y-1">
                <li>• Small-cap stocks</li>
                <li>• Emerging markets</li>
                <li>• High-growth individual stocks</li>
                <li>• Crypto (if allowed)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
          <div className="p-4 border-b border-slate-700/50">
            <h2 className="text-lg font-semibold">Holdings Analysis</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left p-4 text-slate-400 font-medium">Holding</th>
                <th className="text-left p-4 text-slate-400 font-medium">Type</th>
                <th className="text-center p-4 text-slate-400 font-medium">Tax Efficiency</th>
                <th className="text-left p-4 text-slate-400 font-medium">Current Location</th>
                <th className="text-left p-4 text-slate-400 font-medium">Optimal Location</th>
                <th className="text-right p-4 text-slate-400 font-medium">Value</th>
                <th className="text-right p-4 text-slate-400 font-medium">Tax Drag</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding) => {
                const isOptimal = holding.currentLocation === holding.optimalLocation;
                return (
                  <tr 
                    key={holding.symbol} 
                    className={`border-b border-slate-700/30 ${!isOptimal ? 'bg-yellow-500/5' : ''}`}
                  >
                    <td className="p-4">
                      <div className="font-medium">{holding.symbol}</div>
                      <div className="text-sm text-slate-400">{holding.name}</div>
                    </td>
                    <td className="p-4 capitalize">{holding.type}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        holding.taxEfficiency === 'high' ? 'bg-green-500/20 text-green-400' :
                        holding.taxEfficiency === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {holding.taxEfficiency}
                      </span>
                    </td>
                    <td className="p-4">
                      {showOptimized ? holding.optimalLocation : holding.currentLocation}
                    </td>
                    <td className="p-4">
                      {isOptimal ? (
                        <span className="text-green-400">✓ Optimal</span>
                      ) : (
                        <span className="text-yellow-400">→ {holding.optimalLocation}</span>
                      )}
                    </td>
                    <td className="text-right p-4">${holding.value.toLocaleString()}</td>
                    <td className="text-right p-4">
                      {holding.taxDrag > 0 ? (
                        <span className="text-red-400">${holding.taxDrag}/yr</span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Recommendations */}
        <div className="mt-8 bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
          <h2 className="text-xl font-semibold mb-4">Recommended Actions</h2>
          <div className="space-y-4">
            {holdings.filter(h => h.currentLocation !== h.optimalLocation).map((holding, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-yellow-500/20 text-yellow-400 rounded-full flex items-center justify-center">
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-medium">
                      Move {holding.symbol} from {holding.currentLocation} to {holding.optimalLocation}
                    </div>
                    <div className="text-sm text-slate-400">
                      ${holding.value.toLocaleString()} • Saves ~${holding.taxDrag}/year in taxes
                    </div>
                  </div>
                </div>
                <div className="text-sm text-slate-400">
                  {holding.currentLocation.includes('IRA') || holding.currentLocation.includes('401') ? (
                    <span className="text-yellow-400">⚠️ May require rebalancing within accounts</span>
                  ) : (
                    <span className="text-green-400">Can execute with new contributions</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-blue-400">💡</span>
              <div className="text-sm text-slate-300">
                <strong>Pro tip:</strong> Rather than selling and triggering taxes, implement asset location 
                gradually by directing new contributions to the optimal accounts. Use rebalancing opportunities 
                within tax-advantaged accounts to shift allocations.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
