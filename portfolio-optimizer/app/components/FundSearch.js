'use client';

import { useState, useEffect } from 'react';

export default function FundSearch({ onSelect }) {
  const [funds, setFunds] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    minAum: 100000000, // $100M
    assetClass: '',
    type: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFunds();
  }, [filters]);

  const fetchFunds = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      ...filters,
      search
    });
    const res = await fetch(`/api/funds?${params}`);
    const data = await res.json();
    setFunds(data);
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFunds();
  };

  const formatAum = (aum) => {
    if (!aum) return 'N/A';
    if (aum >= 1e12) return `$${(aum / 1e12).toFixed(1)}T`;
    if (aum >= 1e9) return `$${(aum / 1e9).toFixed(1)}B`;
    if (aum >= 1e6) return `$${(aum / 1e6).toFixed(0)}M`;
    return `$${aum.toLocaleString()}`;
  };

  const formatReturn = (ret) => {
    if (ret === null || ret === undefined) return '—';
    const formatted = ret.toFixed(2);
    return (
      <span className={ret >= 0 ? 'positive' : 'negative'}>
        {ret >= 0 ? '+' : ''}{formatted}%
      </span>
    );
  };

  return (
    <div>
      {/* Search and Filters */}
      <form onSubmit={handleSearch} className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ticker or name..."
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asset Class</label>
            <select
              value={filters.assetClass}
              onChange={(e) => setFilters({ ...filters, assetClass: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">All</option>
              <option value="US Equity">US Equity</option>
              <option value="Intl Developed">Intl Developed</option>
              <option value="Emerging Markets">Emerging Markets</option>
              <option value="US Bonds">US Bonds</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">All</option>
              <option value="ETF">ETF</option>
              <option value="MF">Mutual Fund</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 transition"
            >
              Search
            </button>
          </div>
        </div>
      </form>

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticker</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset Class</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">AUM</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Expense</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">1Y</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">3Y</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">5Y</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">10Y</th>
                {onSelect && <th className="px-4 py-3"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="11" className="px-4 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : funds.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-4 py-8 text-center text-gray-500">No funds found</td>
                </tr>
              ) : (
                funds.map(fund => (
                  <tr key={fund.ticker} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{fund.ticker}</td>
                    <td className="px-4 py-3 text-sm max-w-xs truncate">{fund.name}</td>
                    <td className="px-4 py-3 text-sm">{fund.type}</td>
                    <td className="px-4 py-3 text-sm">{fund.asset_class}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatAum(fund.aum)}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      {fund.expense_ratio ? `${(fund.expense_ratio * 100).toFixed(2)}%` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">{formatReturn(fund.return_1yr)}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatReturn(fund.return_3yr)}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatReturn(fund.return_5yr)}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatReturn(fund.return_10yr)}</td>
                    {onSelect && (
                      <td className="px-4 py-3">
                        <button
                          onClick={() => onSelect(fund)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Add
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <p className="mt-4 text-sm text-gray-500">
        Showing {funds.length} funds with AUM &gt; $100M and track record &gt; 1 year
      </p>
    </div>
  );
}
