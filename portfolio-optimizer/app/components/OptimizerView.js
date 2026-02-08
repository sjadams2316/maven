'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';

export default function OptimizerView({ portfolioId, portfolioName }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const runOptimization = async () => {
    if (!portfolioId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolioId })
      });
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (!portfolioId) {
    return <div className="text-center py-8 text-gray-500">Select a portfolio to run optimization analysis</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Portfolio Optimization: {portfolioName}</h3>
        <button
          onClick={runOptimization}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </div>

      {data && (
        <>
          {/* CMA Assumptions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-semibold mb-4">Capital Market Assumptions (10-Year Forward)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(data.cma.assetClasses).map(([ac, vals]) => (
                <div key={ac} className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">{ac}</p>
                  <p className="font-medium">Return: {vals.expectedReturn}%</p>
                  <p className="text-sm text-gray-500">Vol: {vals.volatility}%</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">Risk-Free Rate: {data.cma.riskFreeRate}%</p>
          </div>

          {/* Portfolio Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-semibold mb-4">Portfolio Expected Metrics</h4>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{data.portfolio.expectedReturn.toFixed(2)}%</p>
                <p className="text-gray-600">Expected Return</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-500">{data.portfolio.volatility.toFixed(2)}%</p>
                <p className="text-gray-600">Volatility (Std Dev)</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{data.portfolio.sharpe.toFixed(2)}</p>
                <p className="text-gray-600">Sharpe Ratio</p>
              </div>
            </div>
          </div>

          {/* Asset Allocation */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-semibold mb-4">Asset Class Allocation</h4>
            <div className="space-y-2">
              {Object.entries(data.portfolio.assetClassWeights).map(([ac, weight]) => (
                <div key={ac} className="flex items-center">
                  <span className="w-32 text-sm">{ac}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 mr-2">
                    <div 
                      className="bg-blue-600 h-4 rounded-full"
                      style={{ width: `${weight * 100}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-sm">{(weight * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Efficient Frontier */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-semibold mb-4">Efficient Frontier</h4>
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid />
                <XAxis 
                  type="number" 
                  dataKey="volatility" 
                  name="Volatility" 
                  unit="%" 
                  domain={[0, 'auto']}
                  label={{ value: 'Volatility (%)', position: 'bottom' }}
                />
                <YAxis 
                  type="number" 
                  dataKey="expectedReturn" 
                  name="Expected Return" 
                  unit="%" 
                  domain={[0, 'auto']}
                  label={{ value: 'Expected Return (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value) => `${value.toFixed(2)}%`}
                  labelFormatter={() => ''}
                />
                <Scatter 
                  name="Efficient Frontier" 
                  data={data.frontier} 
                  fill="#3B82F6"
                  line={{ stroke: '#3B82F6', strokeWidth: 2 }}
                />
                <Scatter
                  name="Your Portfolio"
                  data={[{ 
                    volatility: data.portfolio.volatility, 
                    expectedReturn: data.portfolio.expectedReturn 
                  }]}
                  fill="#EF4444"
                  shape="star"
                />
              </ScatterChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-500 text-center mt-2">
              Red star = Your portfolio position | Blue line = Efficient frontier (optimal risk/return tradeoff)
            </p>
          </div>
        </>
      )}
    </div>
  );
}
