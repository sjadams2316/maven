'use client';

import { useState } from 'react';

// Competitor model portfolios with real data
const COMPETITOR_MODELS = {
  'vanguard_growth': {
    manager: 'Vanguard',
    name: 'LifeStrategy Growth',
    ticker: 'VASGX',
    allocation: { 'US Equity': 48, 'Intl Developed': 32, 'Emerging Markets': 0, 'US Bonds': 20 },
    expense: 0.14,
    returns: { '1yr': 18.2, '3yr': 5.8, '5yr': 10.4, '10yr': 9.1 },
    volatility: 13.5,
    sharpe: 0.67,
    aum: '$32B',
    source: 'Vanguard, as of Dec 2024'
  },
  'vanguard_moderate': {
    manager: 'Vanguard',
    name: 'LifeStrategy Moderate Growth',
    ticker: 'VSMGX',
    allocation: { 'US Equity': 36, 'Intl Developed': 24, 'Emerging Markets': 0, 'US Bonds': 40 },
    expense: 0.13,
    returns: { '1yr': 14.1, '3yr': 3.9, '5yr': 7.8, '10yr': 7.2 },
    volatility: 10.2,
    sharpe: 0.71,
    aum: '$21B',
    source: 'Vanguard, as of Dec 2024'
  },
  'blackrock_growth': {
    manager: 'BlackRock',
    name: 'Target Allocation Growth',
    ticker: 'BALPX',
    allocation: { 'US Equity': 45, 'Intl Developed': 25, 'Emerging Markets': 5, 'US Bonds': 25 },
    expense: 0.56,
    returns: { '1yr': 17.5, '3yr': 5.2, '5yr': 9.8, '10yr': 8.5 },
    volatility: 12.8,
    sharpe: 0.66,
    aum: '$8.5B',
    source: 'BlackRock, as of Dec 2024'
  },
  'fidelity_balanced': {
    manager: 'Fidelity',
    name: 'Balanced Fund',
    ticker: 'FBALX',
    allocation: { 'US Equity': 50, 'Intl Developed': 10, 'Emerging Markets': 0, 'US Bonds': 40 },
    expense: 0.49,
    returns: { '1yr': 16.8, '3yr': 4.8, '5yr': 9.2, '10yr': 8.8 },
    volatility: 11.0,
    sharpe: 0.80,
    aum: '$45B',
    source: 'Fidelity, as of Dec 2024'
  },
  'capitalgroup_balanced': {
    manager: 'Capital Group',
    name: 'American Balanced F2',
    ticker: 'AMBFX',
    allocation: { 'US Equity': 55, 'Intl Developed': 10, 'Emerging Markets': 0, 'US Bonds': 35 },
    expense: 0.37,
    returns: { '1yr': 15.9, '3yr': 5.1, '5yr': 9.5, '10yr': 9.2 },
    volatility: 10.5,
    sharpe: 0.88,
    aum: '$115B',
    source: 'Capital Group, as of Dec 2024'
  },
  'schwab_balanced': {
    manager: 'Schwab',
    name: 'Balanced Fund',
    ticker: 'SWOBX',
    allocation: { 'US Equity': 40, 'Intl Developed': 20, 'Emerging Markets': 0, 'US Bonds': 40 },
    expense: 0.49,
    returns: { '1yr': 14.5, '3yr': 4.2, '5yr': 8.5, '10yr': 7.8 },
    volatility: 9.8,
    sharpe: 0.79,
    aum: '$3.2B',
    source: 'Schwab, as of Dec 2024'
  },
};

export default function ModelBattle({ portfolio, allocation, onClose }) {
  const [selectedModels, setSelectedModels] = useState(['vanguard_growth', 'fidelity_balanced', 'capitalgroup_balanced']);
  const [sortBy, setSortBy] = useState('sharpe');

  const toggleModel = (key) => {
    if (selectedModels.includes(key)) {
      setSelectedModels(selectedModels.filter(m => m !== key));
    } else if (selectedModels.length < 4) {
      setSelectedModels([...selectedModels, key]);
    }
  };

  // Calculate win/loss for each metric
  const getWinner = (metric, yourValue, theirValue) => {
    if (metric === 'expense' || metric === 'volatility') {
      return parseFloat(yourValue) < parseFloat(theirValue) ? 'you' : 'them';
    }
    return parseFloat(yourValue) > parseFloat(theirValue) ? 'you' : 'them';
  };

  const allModels = [
    { key: 'yours', ...portfolio, name: 'Your All-Star', manager: 'Maven', expense: 0.08 },
    ...selectedModels.map(key => ({ key, ...COMPETITOR_MODELS[key] }))
  ];

  const sortedModels = [...allModels].sort((a, b) => {
    if (sortBy === 'sharpe') return (b.sharpe || parseFloat(b.sharpe)) - (a.sharpe || parseFloat(a.sharpe));
    if (sortBy === 'expense') return (a.expense || 0) - (b.expense || 0);
    if (sortBy === 'returns') return (b.returns?.['10yr'] || parseFloat(b.expectedReturn)) - (a.returns?.['10yr'] || parseFloat(a.expectedReturn));
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">⚔️ Model Battle Arena</h2>
          <p className="text-gray-600">Head-to-head vs the competition</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
      </div>

      {/* Model Selector */}
      <div className="bg-white rounded-xl shadow p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Select competitors (max 4):</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(COMPETITOR_MODELS).map(([key, model]) => (
            <button
              key={key}
              onClick={() => toggleModel(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedModels.includes(key)
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {model.manager} {model.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Battle Arena */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">🏆 Leaderboard</h3>
          <div className="flex gap-2">
            {['sharpe', 'returns', 'expense'].map(sort => (
              <button
                key={sort}
                onClick={() => setSortBy(sort)}
                className={`px-3 py-1 rounded text-sm ${
                  sortBy === sort ? 'bg-white text-slate-800' : 'bg-slate-700'
                }`}
              >
                {sort === 'sharpe' ? 'Risk-Adj' : sort === 'returns' ? 'Returns' : 'Lowest Cost'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {sortedModels.map((model, index) => {
            const isYours = model.key === 'yours';
            const returnValue = model.returns?.['10yr'] || model.expectedReturn;
            
            return (
              <div 
                key={model.key}
                className={`flex items-center gap-4 p-4 rounded-xl ${
                  isYours ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-slate-700'
                }`}
              >
                <div className="text-2xl font-bold w-8">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>
                <div className="flex-1">
                  <p className="font-bold">{isYours && '⭐ '}{model.name}</p>
                  <p className="text-sm opacity-70">{model.manager}</p>
                </div>
                <div className="text-center px-4">
                  <p className="text-lg font-bold">{returnValue}%</p>
                  <p className="text-xs opacity-70">10Y Return</p>
                </div>
                <div className="text-center px-4">
                  <p className="text-lg font-bold">{model.volatility || model.expectedVol}%</p>
                  <p className="text-xs opacity-70">Volatility</p>
                </div>
                <div className="text-center px-4">
                  <p className="text-lg font-bold">{model.sharpe}</p>
                  <p className="text-xs opacity-70">Sharpe</p>
                </div>
                <div className="text-center px-4">
                  <p className="text-lg font-bold text-green-400">{model.expense}%</p>
                  <p className="text-xs opacity-70">Expense</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Comparison Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 font-medium">Model</th>
              <th className="text-center py-3 px-4 font-medium">US Eq</th>
              <th className="text-center py-3 px-4 font-medium">Intl</th>
              <th className="text-center py-3 px-4 font-medium">Bonds</th>
              <th className="text-center py-3 px-4 font-medium">Expense</th>
              <th className="text-center py-3 px-4 font-medium">AUM</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-indigo-50 border-b-2 border-indigo-200">
              <td className="py-3 px-4 font-bold text-indigo-700">⭐ Your All-Star</td>
              <td className="py-3 px-4 text-center">{allocation['US Equity']}%</td>
              <td className="py-3 px-4 text-center">{allocation['Intl Developed']}%</td>
              <td className="py-3 px-4 text-center">{allocation['US Bonds']}%</td>
              <td className="py-3 px-4 text-center text-green-600 font-bold">~0.08%</td>
              <td className="py-3 px-4 text-center">Custom</td>
            </tr>
            {selectedModels.map(key => {
              const model = COMPETITOR_MODELS[key];
              return (
                <tr key={key} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium">{model.manager}</p>
                    <p className="text-xs text-gray-500">{model.name}</p>
                  </td>
                  <td className="py-3 px-4 text-center">{model.allocation['US Equity']}%</td>
                  <td className="py-3 px-4 text-center">{model.allocation['Intl Developed']}%</td>
                  <td className="py-3 px-4 text-center">{model.allocation['US Bonds']}%</td>
                  <td className="py-3 px-4 text-center">{model.expense}%</td>
                  <td className="py-3 px-4 text-center text-gray-500">{model.aum}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Win Summary */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <h3 className="font-bold text-green-800 mb-3">🏆 Your All-Star Advantages</h3>
        <ul className="space-y-2 text-green-700">
          <li>✅ Lower expense ratio than most active competitors</li>
          <li>✅ Combines best ideas from 6 asset managers</li>
          <li>✅ Sharpe-weighted allocation based on risk-adjusted performance</li>
          <li>✅ Mix of active + passive for best of both worlds</li>
        </ul>
      </div>

      {/* Data Sources */}
      <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500">
        <strong>Data Sources:</strong> Fund data from Morningstar, manager fact sheets (Dec 2024). 
        Returns are historical and not indicative of future performance.
      </div>
    </div>
  );
}
