'use client';

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
const BENCHMARK_COLOR = '#6B7280';

export default function ComparisonView({ comparison }) {
  if (!comparison || comparison.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Select one or more portfolios and click "Compare" to see the analysis.</p>
      </div>
    );
  }

  const formatReturn = (ret, showSign = true) => {
    if (ret === null || ret === undefined || isNaN(ret)) return '—';
    const formatted = ret.toFixed(2);
    const sign = showSign && ret > 0 ? '+' : '';
    return `${sign}${formatted}%`;
  };

  const formatAlpha = (alpha) => {
    if (alpha === null || alpha === undefined || isNaN(alpha)) return '—';
    const formatted = Math.abs(alpha).toFixed(2);
    if (alpha >= 0) {
      return <span className="text-green-600">+{formatted}%</span>;
    }
    return <span className="text-red-600">-{formatted}%</span>;
  };

  // Prepare data for return comparison chart
  const returnData = [
    { name: '1 Year', ...Object.fromEntries(comparison.map((c, i) => [c.portfolio.name, c.metrics.return_1yr])), Benchmark: comparison[0].benchmarkReturns.return_1yr },
    { name: '3 Year', ...Object.fromEntries(comparison.map((c, i) => [c.portfolio.name, c.metrics.return_3yr])), Benchmark: comparison[0].benchmarkReturns.return_3yr },
    { name: '5 Year', ...Object.fromEntries(comparison.map((c, i) => [c.portfolio.name, c.metrics.return_5yr])), Benchmark: comparison[0].benchmarkReturns.return_5yr },
    { name: '10 Year', ...Object.fromEntries(comparison.map((c, i) => [c.portfolio.name, c.metrics.return_10yr])), Benchmark: comparison[0].benchmarkReturns.return_10yr },
  ];

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {comparison.map((c, index) => (
          <div key={c.portfolio.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
              <h3 className="font-semibold text-lg">{c.portfolio.name}</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Expense Ratio</p>
                <p className="font-medium">{(c.metrics.weightedExpenseRatio * 100).toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-gray-500">Holdings</p>
                <p className="font-medium">{c.portfolio.holdings.length}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-gray-500 text-sm mb-2">Benchmark Allocation</p>
              <div className="flex flex-wrap gap-2 text-xs">
                {Object.entries(c.benchmarkWeights).map(([ticker, weight]) => (
                  <span key={ticker} className="bg-gray-100 px-2 py-1 rounded">
                    {ticker}: {(weight * 100).toFixed(0)}%
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Return Comparison Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-lg">Return Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Portfolio</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">1 Year</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">3 Year</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">5 Year</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">10 Year</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Expense</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {comparison.map((c, index) => (
                <tr key={c.portfolio.id}>
                  <td className="px-6 py-4 font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      {c.portfolio.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div>{formatReturn(c.metrics.return_1yr)}</div>
                    <div className="text-xs">α: {formatAlpha(c.alpha.return_1yr)}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div>{formatReturn(c.metrics.return_3yr)}</div>
                    <div className="text-xs">α: {formatAlpha(c.alpha.return_3yr)}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div>{formatReturn(c.metrics.return_5yr)}</div>
                    <div className="text-xs">α: {formatAlpha(c.alpha.return_5yr)}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div>{formatReturn(c.metrics.return_10yr)}</div>
                    <div className="text-xs">α: {formatAlpha(c.alpha.return_10yr)}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {(c.metrics.weightedExpenseRatio * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}
              {/* Benchmark Row */}
              <tr className="bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    Custom Benchmark
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-gray-600">{formatReturn(comparison[0].benchmarkReturns.return_1yr)}</td>
                <td className="px-6 py-4 text-right text-gray-600">{formatReturn(comparison[0].benchmarkReturns.return_3yr)}</td>
                <td className="px-6 py-4 text-right text-gray-600">{formatReturn(comparison[0].benchmarkReturns.return_5yr)}</td>
                <td className="px-6 py-4 text-right text-gray-600">{formatReturn(comparison[0].benchmarkReturns.return_10yr)}</td>
                <td className="px-6 py-4 text-right text-gray-600">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Return Bar Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-4">Returns Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={returnData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v) => `${v?.toFixed(2)}%`} />
              <Legend />
              {comparison.map((c, i) => (
                <Bar key={c.portfolio.id} dataKey={c.portfolio.name} fill={COLORS[i % COLORS.length]} />
              ))}
              <Bar dataKey="Benchmark" fill={BENCHMARK_COLOR} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Asset Allocation Pie Charts */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-4">Asset Class Breakdown</h3>
          <div className="grid grid-cols-2 gap-4">
            {comparison.map((c, index) => {
              const pieData = Object.entries(c.metrics.assetClassBreakdown).map(([name, value]) => ({
                name,
                value: value * 100
              }));
              
              return (
                <div key={c.portfolio.id} className="text-center">
                  <p className="text-sm font-medium mb-2">{c.portfolio.name}</p>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={50}
                        dataKey="value"
                        label={({ name, value }) => `${name.split(' ')[0]} ${value.toFixed(0)}%`}
                        labelLine={false}
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `${v.toFixed(1)}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Holdings Detail */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="font-semibold text-lg">Holdings Detail</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x">
          {comparison.map((c, index) => (
            <div key={c.portfolio.id} className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <h4 className="font-medium">{c.portfolio.name}</h4>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs">
                    <th className="text-left py-1">Ticker</th>
                    <th className="text-left py-1">Name</th>
                    <th className="text-right py-1">Weight</th>
                    <th className="text-right py-1">1Y</th>
                  </tr>
                </thead>
                <tbody>
                  {c.portfolio.holdings.map(h => (
                    <tr key={h.ticker} className="border-t">
                      <td className="py-2 font-medium">{h.ticker}</td>
                      <td className="py-2 truncate max-w-[150px]">{h.name}</td>
                      <td className="py-2 text-right">{(h.weight * 100).toFixed(1)}%</td>
                      <td className="py-2 text-right">{formatReturn(h.return_1yr)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
