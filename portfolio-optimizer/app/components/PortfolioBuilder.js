'use client';

import { useState } from 'react';

export default function PortfolioBuilder({ onSave }) {
  const [name, setName] = useState('');
  const [holdings, setHoldings] = useState([{ ticker: '', weight: '' }]);
  const [searchResults, setSearchResults] = useState([]);
  const [activeSearch, setActiveSearch] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const searchFunds = async (query, index) => {
    if (query.length < 1) {
      setSearchResults([]);
      return;
    }
    const res = await fetch(`/api/funds?search=${encodeURIComponent(query)}&limit=10`);
    const data = await res.json();
    setSearchResults(data);
    setActiveSearch(index);
  };

  const selectFund = (fund, index) => {
    const newHoldings = [...holdings];
    newHoldings[index].ticker = fund.ticker;
    newHoldings[index].fundName = fund.name;
    setHoldings(newHoldings);
    setSearchResults([]);
    setActiveSearch(null);
  };

  const updateHolding = (index, field, value) => {
    const newHoldings = [...holdings];
    newHoldings[index][field] = value;
    setHoldings(newHoldings);
  };

  const addHolding = () => {
    setHoldings([...holdings, { ticker: '', weight: '' }]);
  };

  const removeHolding = (index) => {
    if (holdings.length === 1) return;
    setHoldings(holdings.filter((_, i) => i !== index));
  };

  const getTotalWeight = () => {
    return holdings.reduce((sum, h) => sum + (parseFloat(h.weight) || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Portfolio name is required');
      return;
    }

    const totalWeight = getTotalWeight();
    if (Math.abs(totalWeight - 100) > 0.01) {
      setError(`Weights must sum to 100% (currently ${totalWeight.toFixed(2)}%)`);
      return;
    }

    const validHoldings = holdings.filter(h => h.ticker && h.weight);
    if (validHoldings.length === 0) {
      setError('At least one holding is required');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          holdings: validHoldings.map(h => ({
            ticker: h.ticker.toUpperCase(),
            weight: parseFloat(h.weight) / 100 // Convert to decimal
          }))
        })
      });

      if (!res.ok) throw new Error('Failed to save portfolio');

      // Reset form
      setName('');
      setHoldings([{ ticker: '', weight: '' }]);
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Growth Model, Conservative Income..."
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Holdings</label>
          <span className={`text-sm ${Math.abs(getTotalWeight() - 100) < 0.01 ? 'text-green-600' : 'text-orange-500'}`}>
            Total: {getTotalWeight().toFixed(2)}%
          </span>
        </div>
        
        <div className="space-y-2">
          {holdings.map((holding, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={holding.ticker}
                  onChange={(e) => {
                    updateHolding(index, 'ticker', e.target.value.toUpperCase());
                    searchFunds(e.target.value, index);
                  }}
                  onFocus={() => holding.ticker && searchFunds(holding.ticker, index)}
                  placeholder="Ticker"
                  className="w-full border rounded-lg px-3 py-2 uppercase"
                />
                {holding.fundName && (
                  <p className="text-xs text-gray-500 mt-1 truncate">{holding.fundName}</p>
                )}
                
                {/* Search Dropdown */}
                {activeSearch === index && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {searchResults.map(fund => (
                      <button
                        key={fund.ticker}
                        type="button"
                        onClick={() => selectFund(fund, index)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 flex justify-between items-center"
                      >
                        <span>
                          <span className="font-medium">{fund.ticker}</span>
                          <span className="text-sm text-gray-500 ml-2">{fund.name}</span>
                        </span>
                        <span className="text-xs text-gray-400">{fund.asset_class}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="w-24">
                <input
                  type="number"
                  value={holding.weight}
                  onChange={(e) => updateHolding(index, 'weight', e.target.value)}
                  placeholder="%"
                  step="0.01"
                  min="0"
                  max="100"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              
              <button
                type="button"
                onClick={() => removeHolding(index)}
                className="p-2 text-gray-400 hover:text-red-500"
                disabled={holdings.length === 1}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addHolding}
          className="mt-2 text-sm text-blue-600 hover:text-blue-800"
        >
          + Add another holding
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Portfolio'}
      </button>
    </form>
  );
}
