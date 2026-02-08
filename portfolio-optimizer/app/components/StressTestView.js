'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function StressTestView({ portfolioId, portfolioName }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const runStressTest = async () => {
    if (!portfolioId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/stress-test', {
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
    return <div className="text-center py-8 text-gray-500">Select a portfolio to run stress tests</div>;
  }

  const formatPercent = (val) => {
    if (val === null || val === undefined) return '—';
    return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`;
  };

  const getBarColor = (val) => val >= 0 ? '#10B981' : '#EF4444';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Stress Testing: {portfolioName}</h3>
        <button
          onClick={runStressTest}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Running...' : 'Run Stress Tests'}
        </button>
      </div>

      {data && (
        <>
          {/* Historical Scenarios */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-semibold mb-4">Historical Scenarios</h4>
            <div className="space-y-3">
              {data.scenarios.historical.map((s) => (
                <div key={s.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5 className="font-medium">{s.name}</h5>
                      <p className="text-sm text-gray-500">{s.description} ({s.period})</p>
                    </div>
                    <span className={`text-xl font-bold ${s.portfolioImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(s.portfolioImpact)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {s.details.map((d) => (
                      <span key={d.ticker} className="bg-gray-100 px-2 py-1 rounded">
                        {d.ticker}: {formatPercent(d.impact)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hypothetical Scenarios */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-semibold mb-4">Hypothetical Scenarios</h4>
            <div className="space-y-3">
              {data.scenarios.hypothetical.map((s) => (
                <div key={s.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium">{s.name}</h5>
                      <p className="text-sm text-gray-500">{s.description}</p>
                    </div>
                    <span className={`text-xl font-bold ${s.portfolioImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(s.portfolioImpact)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scenario Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-semibold mb-4">Scenario Impact Summary</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={[...data.scenarios.historical, ...data.scenarios.hypothetical]}
                layout="vertical"
                margin={{ left: 150 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(v) => `${v}%`} domain={['auto', 'auto']} />
                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => `${v.toFixed(1)}%`} />
                <Bar dataKey="portfolioImpact" name="Portfolio Impact">
                  {[...data.scenarios.historical, ...data.scenarios.hypothetical].map((entry, index) => (
                    <Cell key={index} fill={getBarColor(entry.portfolioImpact)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monte Carlo */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-semibold mb-4">Monte Carlo Simulation ({data.monteCarlo.simulations.toLocaleString()} runs, {data.monteCarlo.years} years)</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded text-center">
                <p className="text-sm text-gray-600">Expected Return</p>
                <p className="text-lg font-bold">{data.monteCarlo.expectedReturn.toFixed(1)}%/yr</p>
              </div>
              <div className="bg-gray-50 p-3 rounded text-center">
                <p className="text-sm text-gray-600">Volatility</p>
                <p className="text-lg font-bold">{data.monteCarlo.volatility.toFixed(1)}%</p>
              </div>
              <div className="bg-gray-50 p-3 rounded text-center">
                <p className="text-sm text-gray-600">Median Outcome</p>
                <p className="text-lg font-bold">${data.monteCarlo.percentiles.p50.toFixed(0)}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded text-center">
                <p className="text-sm text-gray-600">Mean Outcome</p>
                <p className="text-lg font-bold">${data.monteCarlo.mean.toFixed(0)}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium mb-3">Projected Value of $100 after {data.monteCarlo.years} years</h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-red-600">5th Percentile (Bad)</span>
                  <span className="font-medium">${data.monteCarlo.percentiles.p5.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-500">25th Percentile</span>
                  <span className="font-medium">${data.monteCarlo.percentiles.p25.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600 font-medium">50th Percentile (Median)</span>
                  <span className="font-bold">${data.monteCarlo.percentiles.p50.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-500">75th Percentile</span>
                  <span className="font-medium">${data.monteCarlo.percentiles.p75.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">95th Percentile (Good)</span>
                  <span className="font-medium">${data.monteCarlo.percentiles.p95.toFixed(0)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Worst Case</span>
                  <span>${data.monteCarlo.worst.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Best Case</span>
                  <span>${data.monteCarlo.best.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
