'use client';

import { useState } from 'react';

// Research-based rebalancing thresholds (from BBH approach)
const THRESHOLDS = {
  majorAssetClass: 5, // ±5% absolute deviation
  subAssetClass: 25,  // ±25% relative deviation
};

// Demo portfolio showing drift scenario
const DEMO_PORTFOLIO = {
  name: 'Growth Portfolio',
  lastRebalanced: '2025-08-15',
  target: {
    'US Equity': 55,
    'Intl Developed': 15,
    'Emerging Markets': 10,
    'US Bonds': 20,
  },
  current: {
    'US Equity': 62, // Drifted up (good performance)
    'Intl Developed': 13, // Drifted down
    'Emerging Markets': 8, // Drifted down
    'US Bonds': 17, // Drifted down
  },
  values: {
    'US Equity': 310000,
    'Intl Developed': 65000,
    'Emerging Markets': 40000,
    'US Bonds': 85000,
  }
};

function getDrift(current, target) {
  return current - target;
}

function getDriftStatus(drift, threshold) {
  const absDrift = Math.abs(drift);
  if (absDrift >= threshold) return 'critical';
  if (absDrift >= threshold * 0.6) return 'warning';
  return 'ok';
}

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export default function RebalanceMonitor({ portfolio: customPortfolio }) {
  const [showTaxAware, setShowTaxAware] = useState(true);
  const portfolio = customPortfolio || DEMO_PORTFOLIO;
  
  const totalValue = Object.values(portfolio.values).reduce((a, b) => a + b, 0);
  
  // Calculate rebalancing trades
  const trades = Object.keys(portfolio.target).map(asset => {
    const currentPct = portfolio.current[asset];
    const targetPct = portfolio.target[asset];
    const drift = getDrift(currentPct, targetPct);
    const status = getDriftStatus(drift, THRESHOLDS.majorAssetClass);
    
    const currentValue = portfolio.values[asset];
    const targetValue = totalValue * (targetPct / 100);
    const tradeAmount = targetValue - currentValue;
    
    return {
      asset,
      currentPct,
      targetPct,
      drift,
      status,
      currentValue,
      targetValue,
      tradeAmount,
      action: tradeAmount > 0 ? 'BUY' : tradeAmount < 0 ? 'SELL' : 'HOLD'
    };
  });

  const needsRebalance = trades.some(t => t.status === 'critical');
  const hasWarnings = trades.some(t => t.status === 'warning');
  
  const daysSinceRebalance = Math.floor(
    (new Date() - new Date(portfolio.lastRebalanced)) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className={`rounded-xl p-6 ${
        needsRebalance 
          ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
          : hasWarnings
          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white'
          : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
      }`}>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {needsRebalance 
                ? '⚠️ Rebalancing Recommended' 
                : hasWarnings 
                ? '👀 Monitor Drift'
                : '✅ Portfolio In Balance'}
            </h2>
            <p className="opacity-90">
              {needsRebalance 
                ? 'One or more asset classes have drifted beyond the ±5% threshold.'
                : hasWarnings
                ? 'Drift is approaching thresholds. No action needed yet.'
                : 'All allocations within target ranges.'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">Last Rebalanced</p>
            <p className="text-xl font-bold">{daysSinceRebalance} days ago</p>
          </div>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Portfolio Drift Analysis</h3>
          <p className="text-sm text-gray-500">
            Total Value: <span className="font-bold text-gray-900">{formatCurrency(totalValue)}</span>
          </p>
        </div>

        {/* Drift Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium">Asset Class</th>
                <th className="text-center py-3 px-4 font-medium">Target</th>
                <th className="text-center py-3 px-4 font-medium">Current</th>
                <th className="text-center py-3 px-4 font-medium">Drift</th>
                <th className="text-center py-3 px-4 font-medium">Status</th>
                <th className="text-right py-3 px-4 font-medium">Trade</th>
              </tr>
            </thead>
            <tbody>
              {trades.map(t => (
                <tr key={t.asset} className="border-t">
                  <td className="py-3 px-4 font-medium">{t.asset}</td>
                  <td className="py-3 px-4 text-center text-gray-600">{t.targetPct}%</td>
                  <td className="py-3 px-4 text-center font-bold">{t.currentPct}%</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-bold ${
                      t.drift > 0 ? 'text-green-600' : t.drift < 0 ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {t.drift > 0 ? '+' : ''}{t.drift}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      t.status === 'critical' ? 'bg-red-100 text-red-700' :
                      t.status === 'warning' ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {t.status === 'critical' ? 'Rebalance' :
                       t.status === 'warning' ? 'Watch' : 'OK'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {Math.abs(t.tradeAmount) > 100 && (
                      <span className={`font-medium ${
                        t.action === 'BUY' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {t.action} {formatCurrency(Math.abs(t.tradeAmount))}
                      </span>
                    )}
                    {Math.abs(t.tradeAmount) <= 100 && (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Visual Drift */}
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Allocation Comparison</h4>
          {trades.map(t => (
            <div key={t.asset} className="flex items-center gap-3">
              <span className="w-28 text-sm text-gray-600">{t.asset}</span>
              <div className="flex-1 relative h-8">
                {/* Target (outline) */}
                <div 
                  className="absolute top-0 h-8 border-2 border-gray-400 border-dashed rounded"
                  style={{ width: `${t.targetPct}%` }}
                />
                {/* Current (filled) */}
                <div 
                  className={`absolute top-0 h-8 rounded transition-all ${
                    t.status === 'critical' ? 'bg-red-400' :
                    t.status === 'warning' ? 'bg-amber-400' :
                    'bg-green-400'
                  }`}
                  style={{ width: `${t.currentPct}%` }}
                />
              </div>
              <span className="w-16 text-right text-sm">
                <span className="text-gray-400">{t.targetPct}%</span>
                <span className="mx-1">→</span>
                <span className="font-bold">{t.currentPct}%</span>
              </span>
            </div>
          ))}
          <p className="text-xs text-gray-500 mt-2">
            Dashed line = target allocation. Filled bar = current allocation.
          </p>
        </div>
      </div>

      {/* Tax-Aware Recommendations */}
      {needsRebalance && (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">🧾 Tax-Aware Rebalancing</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showTaxAware} 
                onChange={e => setShowTaxAware(e.target.checked)}
                className="accent-blue-600"
              />
              <span className="text-sm">Show tax optimization</span>
            </label>
          </div>

          {showTaxAware && (
            <div className="space-y-4">
              {/* Priority Order */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">📋 Rebalancing Priority (Tax-Efficient)</h4>
                <ol className="space-y-2 text-sm text-blue-700">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">1.</span>
                    <span><strong>Direct new contributions</strong> to underweight assets (US Bonds, Intl, EM). No tax impact.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">2.</span>
                    <span><strong>Redirect dividends/distributions</strong> from US Equity funds to underweight assets.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">3.</span>
                    <span><strong>Rebalance within IRA/401(k)</strong> first — no tax impact on sales.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">4.</span>
                    <span><strong>If selling in taxable:</strong> Use highest cost basis lots (Specific ID) to minimize gains.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">5.</span>
                    <span><strong>Pair with tax-loss harvesting</strong> if any positions have losses to offset gains.</span>
                  </li>
                </ol>
              </div>

              {/* Specific Recommendations */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">✅ What to Buy</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    {trades.filter(t => t.action === 'BUY').map(t => (
                      <li key={t.asset}>
                        • {t.asset}: {formatCurrency(t.tradeAmount)} ({t.drift > 0 ? '' : Math.abs(t.drift)}% underweight)
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">📉 What to Trim</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {trades.filter(t => t.action === 'SELL').map(t => (
                      <li key={t.asset}>
                        • {t.asset}: {formatCurrency(Math.abs(t.tradeAmount))} ({t.drift}% overweight)
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Tax Impact Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
                <p className="font-medium text-amber-800 mb-1">⚠️ Before Selling US Equity</p>
                <p className="text-amber-700">
                  Check your cost basis and holding period. If you have significant unrealized gains with 
                  short-term holding periods, consider waiting for long-term treatment (12+ months) or 
                  using tax-advantaged accounts for the rebalance.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Research-Based Guidelines */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold mb-4">📚 Rebalancing Best Practices</h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Thresholds (BBH Research)</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Major asset class: <strong>±5% absolute</strong> deviation</li>
              <li>• Sub-asset class: <strong>±25% relative</strong> deviation</li>
              <li>• Review at least <strong>annually</strong> even if thresholds not hit</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Why Rebalance?</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• <strong>Risk control</strong> — Maintain target risk level</li>
              <li>• <strong>Discipline</strong> — Forces buy low, sell high</li>
              <li>• <strong>Alignment</strong> — Keep portfolio matched to goals</li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Source: BBH Rebalancing Guide, Vanguard Research, academic studies on optimal rebalancing frequency.
        </p>
      </div>
    </div>
  );
}
