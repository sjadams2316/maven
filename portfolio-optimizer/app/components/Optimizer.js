'use client';

import { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function Optimizer() {
  const [frontier, setFrontier] = useState([]);
  const [optimalPortfolios, setOptimalPortfolios] = useState({});
  const [loading, setLoading] = useState(false);
  const [constraints, setConstraints] = useState({ minWeight: 0, maxWeight: 100 });

  const runOptimization = async () => {
    setLoading(true);
    
    const constraintParams = {
      minWeight: constraints.minWeight / 100,
      maxWeight: constraints.maxWeight / 100
    };

    // Fetch all optimization results in parallel
    const [frontierRes, maxSharpeRes, minVolRes, riskParityRes] = await Promise.all([
      fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'frontier', constraints: constraintParams })
      }),
      fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'maxSharpe', constraints: constraintParams })
      }),
      fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'minVol', constraints: constraintParams })
      }),
      fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'riskParity' })
      })
    ]);

    const frontierData = await frontierRes.json();
    const maxSharpeData = await maxSharpeRes.json();
    const minVolData = await minVolRes.json();
    const riskParityData = await riskParityRes.json();

    setFrontier(frontierData.frontier || []);
    setOptimalPortfolios({
      maxSharpe: maxSharpeData.portfolio,
      minVol: minVolData.portfolio,
      riskParity: riskParityData.portfolio
    });
    
    setLoading(false);
  };

  const formatWeights = (weights) => {
    if (!weights) return '';
    return Object.entries(weights)
      .filter(([_, w]) => w > 0.01)
      .sort((a, b) => b[1] - a[1])
      .map(([ac, w]) => `${ac}: ${(w * 100).toFixed(1)}%`)
      .join(' | ');
  };

  return (
    <div className="space-y-6">
      {/* Constraints */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold text-lg mb-4">Optimization Constraints</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Min Weight per Asset Class (%)</label>
            <input
              type="number"
              value={constraints.minWeight}
              onChange={(e) => setConstraints({ ...constraints, minWeight: parseFloat(e.target.value) || 0 })}
              className="w-full border rounded px-3 py-2"
              min="0"
              max="100"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Max Weight per Asset Class (%)</label>
            <input
              type="number"
              value={constraints.maxWeight}
              onChange={(e) => setConstraints({ ...constraints, maxWeight: parseFloat(e.target.value) || 100 })}
              className="w-full border rounded px-3 py-2"
              min="0"
              max="100"
            />
          </div>
        </div>
        <button
          onClick={runOptimization}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Optimizing...' : 'Run Optimization'}
        </button>
      </div>

      {/* Efficient Frontier Chart */}
      {frontier.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold text-lg mb-4">Efficient Frontier</h3>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="volatility" 
                name="Risk" 
                type="number"
                label={{ value: 'Volatility (%)', position: 'bottom' }}
                domain={['auto', 'auto']}
              />
              <YAxis 
                dataKey="expectedReturn" 
                name="Return" 
                type="number"
                label={{ value: 'Expected Return (%)', angle: -90, position: 'left' }}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                formatter={(value, name) => [`${value.toFixed(2)}%`, name === 'volatility' ? 'Risk' : 'Return']}
                labelFormatter={() => ''}
              />
              <Scatter 
                name="Efficient Frontier" 
                data={frontier} 
                fill="#3B82F6"
                line={{ stroke: '#3B82F6', strokeWidth: 2 }}
              />
              {optimalPortfolios.maxSharpe && (
                <Scatter
                  name="Max Sharpe"
                  data={[optimalPortfolios.maxSharpe]}
                  fill="#10B981"
                  shape="star"
                />
              )}
              {optimalPortfolios.minVol && (
                <Scatter
                  name="Min Volatility"
                  data={[optimalPortfolios.minVol]}
                  fill="#F59E0B"
                  shape="diamond"
                />
              )}
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-4 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full"></span> Efficient Frontier
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span> Max Sharpe Ratio
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 bg-yellow-500 rounded-full"></span> Min Volatility
            </span>
          </div>
        </div>
      )}

      {/* Optimal Portfolios */}
      {Object.keys(optimalPortfolios).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {optimalPortfolios.maxSharpe && (
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
              <h4 className="font-semibold text-green-700 mb-2">Maximum Sharpe Ratio</h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Expected Return:</span> <span className="font-medium">{optimalPortfolios.maxSharpe.expectedReturn.toFixed(2)}%</span></p>
                <p><span className="text-gray-500">Volatility:</span> <span className="font-medium">{optimalPortfolios.maxSharpe.volatility.toFixed(2)}%</span></p>
                <p><span className="text-gray-500">Sharpe Ratio:</span> <span className="font-medium">{optimalPortfolios.maxSharpe.sharpe.toFixed(3)}</span></p>
                <div className="pt-2 border-t mt-2">
                  <p className="text-gray-500 mb-1">Allocation:</p>
                  <p className="text-xs">{formatWeights(optimalPortfolios.maxSharpe.weights)}</p>
                </div>
              </div>
            </div>
          )}
          
          {optimalPortfolios.minVol && (
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
              <h4 className="font-semibold text-yellow-700 mb-2">Minimum Volatility</h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Expected Return:</span> <span className="font-medium">{optimalPortfolios.minVol.expectedReturn.toFixed(2)}%</span></p>
                <p><span className="text-gray-500">Volatility:</span> <span className="font-medium">{optimalPortfolios.minVol.volatility.toFixed(2)}%</span></p>
                <p><span className="text-gray-500">Sharpe Ratio:</span> <span className="font-medium">{optimalPortfolios.minVol.sharpe.toFixed(3)}</span></p>
                <div className="pt-2 border-t mt-2">
                  <p className="text-gray-500 mb-1">Allocation:</p>
                  <p className="text-xs">{formatWeights(optimalPortfolios.minVol.weights)}</p>
                </div>
              </div>
            </div>
          )}
          
          {optimalPortfolios.riskParity && (
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
              <h4 className="font-semibold text-purple-700 mb-2">Risk Parity</h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Expected Return:</span> <span className="font-medium">{optimalPortfolios.riskParity.expectedReturn.toFixed(2)}%</span></p>
                <p><span className="text-gray-500">Volatility:</span> <span className="font-medium">{optimalPortfolios.riskParity.volatility.toFixed(2)}%</span></p>
                <p><span className="text-gray-500">Sharpe Ratio:</span> <span className="font-medium">{optimalPortfolios.riskParity.sharpe.toFixed(3)}</span></p>
                <div className="pt-2 border-t mt-2">
                  <p className="text-gray-500 mb-1">Allocation:</p>
                  <p className="text-xs">{formatWeights(optimalPortfolios.riskParity.weights)}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CMA Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold text-lg mb-4">Capital Market Assumptions</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Asset Class</th>
              <th className="text-right py-2">Expected Return</th>
              <th className="text-right py-2">Volatility</th>
            </tr>
          </thead>
          <tbody>
            {['US Equity', 'Intl Developed', 'Emerging Markets', 'US Bonds'].map(ac => (
              <tr key={ac} className="border-b">
                <td className="py-2">{ac}</td>
                <td className="text-right">{ac === 'US Equity' ? '7.5%' : ac === 'Intl Developed' ? '7.0%' : ac === 'Emerging Markets' ? '8.5%' : '4.0%'}</td>
                <td className="text-right">{ac === 'US Equity' ? '16.0%' : ac === 'Intl Developed' ? '18.0%' : ac === 'Emerging Markets' ? '24.0%' : '5.0%'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-gray-500 mt-4">
          Based on long-term historical averages. Risk-free rate assumed at 4.5%.
        </p>
      </div>
    </div>
  );
}
