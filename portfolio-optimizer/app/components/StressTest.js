'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

export default function StressTest() {
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/portfolios').then(r => r.json()).then(setPortfolios);
  }, []);

  const runStressTest = async () => {
    if (!selectedPortfolio) return;
    setLoading(true);
    
    const res = await fetch('/api/stress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portfolioId: selectedPortfolio })
    });
    
    const data = await res.json();
    setResults(data);
    setLoading(false);
  };

  const getBarColor = (value) => {
    if (value >= 0) return '#10B981';
    if (value > -20) return '#F59E0B';
    if (value > -40) return '#EF4444';
    return '#991B1B';
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Selection */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold text-lg mb-4">Select Portfolio to Stress Test</h3>
        <div className="flex gap-4">
          <select
            value={selectedPortfolio || ''}
            onChange={(e) => setSelectedPortfolio(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2"
          >
            <option value="">Select a portfolio...</option>
            {portfolios.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            onClick={runStressTest}
            disabled={!selectedPortfolio || loading}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Running...' : 'Run Stress Tests'}
          </button>
        </div>
      </div>

      {results && (
        <>
          {/* Asset Class Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-4">Portfolio Asset Class Weights</h3>
            <div className="flex flex-wrap gap-4">
              {Object.entries(results.assetClassWeights || {}).map(([ac, weight]) => (
                <div key={ac} className="bg-gray-100 px-4 py-2 rounded-lg">
                  <span className="font-medium">{ac}:</span> {(weight * 100).toFixed(1)}%
                </div>
              ))}
            </div>
          </div>

          {/* Stress Test Results */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold text-lg mb-4">Historical Stress Scenarios</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={results.stressTests} 
                layout="vertical"
                margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(v) => `${v}%`} domain={[-70, 20]} />
                <YAxis type="category" dataKey="scenario" width={140} />
                <Tooltip formatter={(v) => `${v.toFixed(1)}%`} />
                <Bar dataKey="portfolioImpact" name="Portfolio Impact">
                  {results.stressTests.map((entry, index) => (
                    <Cell key={index} fill={getBarColor(entry.portfolioImpact)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Scenario Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.stressTests.map((test, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg shadow">
                <h4 className="font-semibold mb-2">{test.scenario}</h4>
                <p className="text-sm text-gray-600 mb-3">{test.description}</p>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">Duration:</span>
                  <span className="text-sm">{test.duration}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Portfolio Impact:</span>
                  <span className={`text-lg font-bold ${test.portfolioImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {test.portfolioImpact >= 0 ? '+' : ''}{test.portfolioImpact.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t text-xs">
                  {test.assetImpacts.filter(a => a.weight > 0.01).map((a, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{a.assetClass}</span>
                      <span className={a.impact >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {a.impact >= 0 ? '+' : ''}{a.impact}% × {(a.weight * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Monte Carlo Results */}
          {results.monteCarlo && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-4">Monte Carlo Simulation ({results.monteCarlo.simulations} scenarios, {results.monteCarlo.years} years)</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-500">5th Percentile (Worst)</p>
                  <p className="text-2xl font-bold text-red-600">${results.monteCarlo.percentiles['5th'].toFixed(0)}</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-500">25th Percentile</p>
                  <p className="text-2xl font-bold text-yellow-600">${results.monteCarlo.percentiles['25th'].toFixed(0)}</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-500">50th Percentile (Median)</p>
                  <p className="text-2xl font-bold text-blue-600">${results.monteCarlo.percentiles['50th'].toFixed(0)}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-500">95th Percentile (Best)</p>
                  <p className="text-2xl font-bold text-green-600">${results.monteCarlo.percentiles['95th'].toFixed(0)}</p>
                </div>
              </div>
              
              <div className="flex justify-between text-sm">
                <div>
                  <span className="text-gray-500">Starting Value:</span> $100
                </div>
                <div>
                  <span className="text-gray-500">Expected Value:</span> ${results.monteCarlo.expectedValue.toFixed(0)}
                </div>
                <div>
                  <span className="text-gray-500">Probability of Loss:</span> 
                  <span className={results.monteCarlo.probabilityOfLoss > 20 ? 'text-red-600' : 'text-green-600'}>
                    {' '}{results.monteCarlo.probabilityOfLoss.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!results && (
        <div className="bg-gray-50 p-12 rounded-lg text-center text-gray-500">
          <p>Select a portfolio and run stress tests to see how it would perform in various market scenarios.</p>
          <p className="mt-2 text-sm">Includes historical crashes (2008, COVID, Dot-Com) and Monte Carlo simulation.</p>
        </div>
      )}
    </div>
  );
}
