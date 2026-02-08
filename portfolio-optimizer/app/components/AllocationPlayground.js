'use client';

import { useState, useEffect } from 'react';

// CMAs used for calculations (from our research)
const ASSET_CMAS = {
  'US Equity': { expectedReturn: 6.7, volatility: 15.5, sharpeContrib: 0.43 },
  'Intl Developed': { expectedReturn: 7.1, volatility: 16.5, sharpeContrib: 0.43 },
  'Emerging Markets': { expectedReturn: 7.2, volatility: 22.0, sharpeContrib: 0.33 },
  'US Bonds': { expectedReturn: 4.8, volatility: 5.5, sharpeContrib: 0.87 },
};

// Correlation matrix for volatility calculation
const CORRELATIONS = {
  'US Equity': { 'US Equity': 1.0, 'Intl Developed': 0.85, 'Emerging Markets': 0.75, 'US Bonds': 0.05 },
  'Intl Developed': { 'US Equity': 0.85, 'Intl Developed': 1.0, 'Emerging Markets': 0.80, 'US Bonds': 0.10 },
  'Emerging Markets': { 'US Equity': 0.75, 'Intl Developed': 0.80, 'Emerging Markets': 1.0, 'US Bonds': 0.15 },
  'US Bonds': { 'US Equity': 0.05, 'Intl Developed': 0.10, 'Emerging Markets': 0.15, 'US Bonds': 1.0 },
};

function calculatePortfolioMetrics(allocation) {
  // Calculate expected return (weighted average)
  let expectedReturn = 0;
  for (const [asset, weight] of Object.entries(allocation)) {
    const assetData = ASSET_CMAS[asset];
    if (assetData && weight > 0) {
      expectedReturn += (weight / 100) * assetData.expectedReturn;
    }
  }

  // Calculate portfolio volatility (using correlation matrix)
  let variance = 0;
  const assets = Object.keys(allocation).filter(a => allocation[a] > 0);
  
  for (const asset1 of assets) {
    for (const asset2 of assets) {
      const w1 = allocation[asset1] / 100;
      const w2 = allocation[asset2] / 100;
      const vol1 = ASSET_CMAS[asset1]?.volatility || 0;
      const vol2 = ASSET_CMAS[asset2]?.volatility || 0;
      const corr = CORRELATIONS[asset1]?.[asset2] || 0;
      
      variance += w1 * w2 * vol1 * vol2 * corr / 100;
    }
  }
  
  const volatility = Math.sqrt(variance * 100);
  const riskFreeRate = 4.5; // Current risk-free rate
  const sharpe = volatility > 0 ? (expectedReturn - riskFreeRate) / volatility : 0;

  // Estimate max drawdown (roughly 2-2.5x volatility for equity-heavy)
  const equityWeight = (allocation['US Equity'] || 0) + (allocation['Intl Developed'] || 0) + (allocation['Emerging Markets'] || 0);
  const drawdownMultiplier = 2.0 + (equityWeight / 100) * 0.5;
  const maxDrawdown = -volatility * drawdownMultiplier;

  return {
    expectedReturn: expectedReturn.toFixed(1),
    volatility: volatility.toFixed(1),
    sharpe: sharpe.toFixed(2),
    maxDrawdown: maxDrawdown.toFixed(0),
  };
}

export default function AllocationPlayground({ initialAllocation, onClose }) {
  const [allocation, setAllocation] = useState(initialAllocation);
  const [metrics, setMetrics] = useState(calculatePortfolioMetrics(initialAllocation));
  const [presetComparison, setPresetComparison] = useState(null);

  const PRESETS = {
    'conservative': { 'US Equity': 25, 'Intl Developed': 10, 'Emerging Markets': 5, 'US Bonds': 60 },
    'moderate': { 'US Equity': 40, 'Intl Developed': 15, 'Emerging Markets': 5, 'US Bonds': 40 },
    'growth': { 'US Equity': 50, 'Intl Developed': 20, 'Emerging Markets': 10, 'US Bonds': 20 },
    'aggressive': { 'US Equity': 55, 'Intl Developed': 25, 'Emerging Markets': 15, 'US Bonds': 5 },
    'all_equity': { 'US Equity': 60, 'Intl Developed': 30, 'Emerging Markets': 10, 'US Bonds': 0 },
    'all_bonds': { 'US Equity': 0, 'Intl Developed': 0, 'Emerging Markets': 0, 'US Bonds': 100 },
  };

  useEffect(() => {
    setMetrics(calculatePortfolioMetrics(allocation));
  }, [allocation]);

  const handleSliderChange = (asset, value) => {
    const newAllocation = { ...allocation, [asset]: value };
    const total = Object.values(newAllocation).reduce((a, b) => a + b, 0);
    
    // Auto-adjust bonds to keep total at 100
    if (total !== 100 && asset !== 'US Bonds') {
      const diff = 100 - total;
      newAllocation['US Bonds'] = Math.max(0, Math.min(100, (newAllocation['US Bonds'] || 0) + diff));
    }
    
    setAllocation(newAllocation);
  };

  const applyPreset = (key) => {
    const preset = PRESETS[key];
    setPresetComparison(key);
    setAllocation({ ...preset });
  };

  const resetToOriginal = () => {
    setAllocation({ ...initialAllocation });
    setPresetComparison(null);
  };

  const total = Object.values(allocation).reduce((a, b) => a + b, 0);
  const originalMetrics = calculatePortfolioMetrics(initialAllocation);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">🎛️ Allocation Playground</h2>
          <p className="text-gray-600">Drag the sliders and watch the numbers change in real-time</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
      </div>

      {/* Real-Time Metrics */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-4xl font-bold">{metrics.expectedReturn}%</p>
            <p className="text-sm opacity-80">Expected Return</p>
            <p className={`text-xs mt-1 ${parseFloat(metrics.expectedReturn) > parseFloat(originalMetrics.expectedReturn) ? 'text-green-300' : 'text-red-300'}`}>
              {parseFloat(metrics.expectedReturn) > parseFloat(originalMetrics.expectedReturn) ? '↑' : '↓'} vs original
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-4xl font-bold">{metrics.volatility}%</p>
            <p className="text-sm opacity-80">Volatility</p>
            <p className={`text-xs mt-1 ${parseFloat(metrics.volatility) < parseFloat(originalMetrics.volatility) ? 'text-green-300' : 'text-red-300'}`}>
              {parseFloat(metrics.volatility) < parseFloat(originalMetrics.volatility) ? '↓ Lower' : '↑ Higher'}
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-4xl font-bold">{metrics.sharpe}</p>
            <p className="text-sm opacity-80">Sharpe Ratio</p>
            <p className={`text-xs mt-1 ${parseFloat(metrics.sharpe) > parseFloat(originalMetrics.sharpe) ? 'text-green-300' : 'text-red-300'}`}>
              {parseFloat(metrics.sharpe) > parseFloat(originalMetrics.sharpe) ? '↑ Better' : '↓ Worse'}
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-4xl font-bold">{metrics.maxDrawdown}%</p>
            <p className="text-sm opacity-80">Est. Max Drawdown</p>
            <p className="text-xs mt-1 opacity-60">Worst-case scenario</p>
          </div>
        </div>
      </div>

      {/* Presets */}
      <div className="bg-white rounded-xl shadow p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Quick presets:</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(PRESETS).map(([key, _]) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                presetComparison === key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
          <button
            onClick={resetToOriginal}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200"
          >
            ↺ Reset to All-Star
          </button>
        </div>
      </div>

      {/* Sliders */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">Adjust Allocation</h3>
          <span className={`text-sm font-medium ${Math.abs(total - 100) < 0.1 ? 'text-green-600' : 'text-red-600'}`}>
            Total: {total}% {Math.abs(total - 100) < 0.1 ? '✓' : '(adjust to 100%)'}
          </span>
        </div>

        <div className="space-y-6">
          {Object.entries(allocation).map(([asset, value]) => {
            const assetData = ASSET_CMAS[asset];
            return (
              <div key={asset}>
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="font-medium">{asset}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      (CMA: {assetData?.expectedReturn}% return, {assetData?.volatility}% vol)
                    </span>
                  </div>
                  <span className="text-xl font-bold text-indigo-600">{value}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={value}
                  onChange={(e) => handleSliderChange(asset, parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Allocation */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold mb-4">Current Allocation</h3>
        <div className="flex h-12 rounded-xl overflow-hidden">
          {Object.entries(allocation).filter(([_, v]) => v > 0).map(([asset, value], i) => {
            const colors = {
              'US Equity': 'bg-blue-500',
              'Intl Developed': 'bg-green-500',
              'Emerging Markets': 'bg-amber-500',
              'US Bonds': 'bg-purple-500',
            };
            return (
              <div
                key={asset}
                className={`${colors[asset]} flex items-center justify-center text-white text-xs font-bold transition-all duration-300`}
                style={{ width: `${value}%` }}
              >
                {value >= 10 && `${value}%`}
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-4 mt-3 text-sm">
          <span className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-500 rounded"></span> US Equity</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded"></span> Intl Developed</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 bg-amber-500 rounded"></span> Emerging Markets</span>
          <span className="flex items-center gap-2"><span className="w-3 h-3 bg-purple-500 rounded"></span> US Bonds</span>
        </div>
      </div>

      {/* Insight */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="font-medium text-blue-800 mb-2">💡 What the Numbers Mean</p>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>More stocks</strong> → Higher expected return but more volatility</li>
          <li>• <strong>More bonds</strong> → Lower return but smoother ride</li>
          <li>• <strong>International</strong> → Diversification benefit but currency risk</li>
          <li>• <strong>Emerging Markets</strong> → Highest growth potential but highest risk</li>
        </ul>
      </div>

      {/* Data Sources */}
      <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500">
        <strong>Capital Market Assumptions:</strong>
        <ul className="mt-2 space-y-1">
          <li>• US Equity: 6.7% return, 15.5% vol (JPMorgan 2025 LTCMA)</li>
          <li>• Intl Developed: 7.1% return, 16.5% vol (JPMorgan 2025 LTCMA)</li>
          <li>• Emerging Markets: 7.2% return, 22.0% vol (JPMorgan 2025 LTCMA)</li>
          <li>• US Bonds: 4.8% return, 5.5% vol (JPMorgan 2025 LTCMA)</li>
          <li>• Correlations: Historical averages from BlackRock research</li>
        </ul>
        <p className="mt-2 italic">These are forward-looking estimates with significant uncertainty.</p>
      </div>
    </div>
  );
}
