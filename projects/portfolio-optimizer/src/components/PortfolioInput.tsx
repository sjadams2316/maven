'use client';

import { useState } from 'react';
import { PortfolioHolding } from '@/types';

interface Props {
  holdings: PortfolioHolding[];
  setHoldings: (holdings: PortfolioHolding[]) => void;
}

export default function PortfolioInput({ holdings, setHoldings }: Props) {
  const [ticker, setTicker] = useState('');
  const [weight, setWeight] = useState('');
  const [csvMode, setCsvMode] = useState(false);
  const [csvText, setCsvText] = useState('');

  const addHolding = () => {
    if (!ticker || !weight) return;
    
    const newHolding: PortfolioHolding = {
      ticker: ticker.toUpperCase().trim(),
      weight: parseFloat(weight),
    };
    
    setHoldings([...holdings, newHolding]);
    setTicker('');
    setWeight('');
  };

  const removeHolding = (index: number) => {
    setHoldings(holdings.filter((_, i) => i !== index));
  };

  const parseCsv = () => {
    const lines = csvText.trim().split('\n');
    const parsed: PortfolioHolding[] = [];
    
    for (const line of lines) {
      const parts = line.split(/[,\t]/);
      if (parts.length >= 2) {
        const tickerVal = parts[0].trim().toUpperCase();
        const weightVal = parseFloat(parts[1].trim().replace('%', ''));
        if (tickerVal && !isNaN(weightVal)) {
          parsed.push({ ticker: tickerVal, weight: weightVal });
        }
      }
    }
    
    if (parsed.length > 0) {
      setHoldings(parsed);
      setCsvText('');
      setCsvMode(false);
    }
  };

  const totalWeight = holdings.reduce((sum, h) => sum + h.weight, 0);

  // Sample portfolios for quick testing
  const loadSample = (type: 'conservative' | 'moderate' | 'aggressive') => {
    const samples = {
      conservative: [
        { ticker: 'BND', weight: 40 },
        { ticker: 'VXUS', weight: 15 },
        { ticker: 'VTI', weight: 30 },
        { ticker: 'VTIP', weight: 15 },
      ],
      moderate: [
        { ticker: 'VTI', weight: 40 },
        { ticker: 'VXUS', weight: 20 },
        { ticker: 'BND', weight: 25 },
        { ticker: 'VNQ', weight: 10 },
        { ticker: 'GLD', weight: 5 },
      ],
      aggressive: [
        { ticker: 'VTI', weight: 50 },
        { ticker: 'VXUS', weight: 25 },
        { ticker: 'VGT', weight: 15 },
        { ticker: 'ARKK', weight: 10 },
      ],
    };
    setHoldings(samples[type]);
  };

  return (
    <div className="space-y-4">
      {/* Toggle between manual and CSV mode */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setCsvMode(false)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !csvMode 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Manual Entry
        </button>
        <button
          onClick={() => setCsvMode(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            csvMode 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Paste CSV
        </button>
      </div>

      {csvMode ? (
        <div className="space-y-3">
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="Paste your portfolio (ticker, weight per line)&#10;Example:&#10;VTI, 40&#10;VXUS, 30&#10;BND, 30"
            className="w-full h-40 px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono text-sm"
          />
          <button
            onClick={parseCsv}
            className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Parse Portfolio
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Quick load sample portfolios */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-slate-400 text-sm">Load sample:</span>
            <button
              onClick={() => loadSample('conservative')}
              className="text-xs px-2 py-1 bg-green-900/50 text-green-400 rounded hover:bg-green-900/70 transition-colors"
            >
              Conservative
            </button>
            <button
              onClick={() => loadSample('moderate')}
              className="text-xs px-2 py-1 bg-yellow-900/50 text-yellow-400 rounded hover:bg-yellow-900/70 transition-colors"
            >
              Moderate
            </button>
            <button
              onClick={() => loadSample('aggressive')}
              className="text-xs px-2 py-1 bg-red-900/50 text-red-400 rounded hover:bg-red-900/70 transition-colors"
            >
              Aggressive
            </button>
          </div>

          {/* Add new holding */}
          <div className="flex gap-2">
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="Ticker (e.g., VTI)"
              className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none uppercase"
              onKeyDown={(e) => e.key === 'Enter' && addHolding()}
            />
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Weight %"
              className="w-24 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              onKeyDown={(e) => e.key === 'Enter' && addHolding()}
            />
            <button
              onClick={addHolding}
              disabled={!ticker || !weight}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Holdings list */}
      {holdings.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-400">Holdings ({holdings.length})</span>
            <span className={`text-sm ${Math.abs(totalWeight - 100) < 0.01 ? 'text-green-400' : 'text-yellow-400'}`}>
              Total: {totalWeight.toFixed(1)}%
            </span>
          </div>
          
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {holdings.map((holding, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-4 py-2 bg-slate-900 rounded-lg"
              >
                <span className="text-white font-mono">{holding.ticker}</span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">{holding.weight}%</span>
                  <button
                    onClick={() => removeHolding(index)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {Math.abs(totalWeight - 100) > 0.01 && (
            <div className="mt-3 text-sm text-yellow-400">
              ⚠️ Weights should sum to 100% (currently {totalWeight.toFixed(1)}%)
            </div>
          )}

          <button
            onClick={() => setHoldings([])}
            className="mt-3 text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
