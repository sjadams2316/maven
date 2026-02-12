'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Search, Plus, X } from 'lucide-react';
import DivergenceScanner from '@/components/DivergenceScanner';
import { GROWTH_HOLDINGS } from '@/lib/demo-profile';

// Demo client portfolios for advisor view
const DEMO_CLIENTS = [
  {
    id: 'smith-family',
    name: 'Smith Family Trust',
    holdings: [
      { symbol: 'AAPL', value: 150000 },
      { symbol: 'MSFT', value: 120000 },
      { symbol: 'GOOGL', value: 80000 },
      { symbol: 'AMZN', value: 75000 },
      { symbol: 'NVDA', value: 100000 },
      { symbol: 'META', value: 50000 },
    ],
  },
  {
    id: 'johnson-ira',
    name: 'Johnson IRA',
    holdings: [
      { symbol: 'VTI', value: 200000 },
      { symbol: 'VXUS', value: 100000 },
      { symbol: 'BND', value: 80000 },
      { symbol: 'VNQ', value: 40000 },
    ],
  },
  {
    id: 'growth-demo',
    name: 'Growth Portfolio (Demo)',
    holdings: GROWTH_HOLDINGS.map(h => ({ symbol: h.symbol, value: h.value })),
  },
];

// Watchlist symbols for quick scanning
const WATCHLIST_PRESETS = [
  { name: 'Mag 7', symbols: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA'] },
  { name: 'AI Stocks', symbols: ['NVDA', 'AMD', 'SMCI', 'ARM', 'AVGO', 'PLTR', 'AI'] },
  { name: 'Crypto Miners', symbols: ['MARA', 'RIOT', 'CIFR', 'IREN', 'CLSK', 'BTDR'] },
  { name: 'Financials', symbols: ['JPM', 'BAC', 'GS', 'MS', 'WFC', 'C', 'BLK'] },
];

export default function DivergencePage() {
  const searchParams = useSearchParams();
  const isDemoMode = searchParams.get('demo') === 'true';
  const demoHref = (href: string) => isDemoMode ? `${href}?demo=true` : href;
  
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [customSymbols, setCustomSymbols] = useState<string[]>([]);
  const [symbolInput, setSymbolInput] = useState('');
  const [scanMode, setScanMode] = useState<'client' | 'watchlist' | 'custom'>('client');
  const [selectedWatchlist, setSelectedWatchlist] = useState<string | null>(null);
  
  // Get current holdings/symbols based on mode
  const getHoldingsOrSymbols = () => {
    if (scanMode === 'client' && selectedClient) {
      const client = DEMO_CLIENTS.find(c => c.id === selectedClient);
      return { holdings: client?.holdings };
    }
    if (scanMode === 'watchlist' && selectedWatchlist) {
      const watchlist = WATCHLIST_PRESETS.find(w => w.name === selectedWatchlist);
      return { symbols: watchlist?.symbols };
    }
    if (scanMode === 'custom' && customSymbols.length > 0) {
      return { symbols: customSymbols };
    }
    return { symbols: [] };
  };
  
  const { holdings, symbols } = getHoldingsOrSymbols();
  
  const addCustomSymbol = () => {
    const symbol = symbolInput.trim().toUpperCase();
    if (symbol && !customSymbols.includes(symbol)) {
      setCustomSymbols([...customSymbols, symbol]);
      setSymbolInput('');
    }
  };
  
  const removeCustomSymbol = (symbol: string) => {
    setCustomSymbols(customSymbols.filter(s => s !== symbol));
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href={demoHref('/partners/analysis')} className="text-gray-400 hover:text-white text-sm flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Analysis
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-white">🔀 Divergence Scanner</h1>
          <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
            Athena-Powered
          </span>
        </div>
        <p className="text-gray-400">
          Find where social sentiment (Twitter, Reddit) disagrees with Wall Street analyst consensus. 
          These divergences can signal opportunities or risks.
        </p>
      </div>
      
      {/* Mode Selection */}
      <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 mb-6">
        <label className="block text-white font-medium mb-3">Scan Mode</label>
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setScanMode('client')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              scanMode === 'client' 
                ? 'bg-purple-500 text-white' 
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            📁 Client Portfolio
          </button>
          <button
            onClick={() => setScanMode('watchlist')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              scanMode === 'watchlist' 
                ? 'bg-purple-500 text-white' 
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            📋 Watchlist
          </button>
          <button
            onClick={() => setScanMode('custom')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              scanMode === 'custom' 
                ? 'bg-purple-500 text-white' 
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            ✏️ Custom
          </button>
        </div>
        
        {/* Client Selection */}
        {scanMode === 'client' && (
          <div>
            <label className="block text-sm text-gray-400 mb-2">Select Client</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {DEMO_CLIENTS.map(client => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClient(client.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedClient === client.id
                      ? 'bg-purple-500/20 border-purple-500/50'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="font-medium text-white">{client.name}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {client.holdings.length} holdings · ${(client.holdings.reduce((s, h) => s + h.value, 0) / 1000).toFixed(0)}K
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Watchlist Selection */}
        {scanMode === 'watchlist' && (
          <div>
            <label className="block text-sm text-gray-400 mb-2">Select Watchlist</label>
            <div className="flex flex-wrap gap-2">
              {WATCHLIST_PRESETS.map(watchlist => (
                <button
                  key={watchlist.name}
                  onClick={() => setSelectedWatchlist(watchlist.name)}
                  className={`px-4 py-2 rounded-xl border text-sm transition-all ${
                    selectedWatchlist === watchlist.name
                      ? 'bg-purple-500/20 border-purple-500/50 text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {watchlist.name}
                  <span className="ml-2 text-xs opacity-60">({watchlist.symbols.length})</span>
                </button>
              ))}
            </div>
            {selectedWatchlist && (
              <div className="mt-3 flex flex-wrap gap-1">
                {WATCHLIST_PRESETS.find(w => w.name === selectedWatchlist)?.symbols.map(s => (
                  <span key={s} className="px-2 py-1 bg-slate-700 text-xs text-slate-300 rounded">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Custom Symbols */}
        {scanMode === 'custom' && (
          <div>
            <label className="block text-sm text-gray-400 mb-2">Enter Symbols</label>
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={symbolInput}
                  onChange={(e) => setSymbolInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomSymbol()}
                  placeholder="Enter symbol (e.g., NVDA)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <button
                onClick={addCustomSymbol}
                className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {customSymbols.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {customSymbols.map(symbol => (
                  <span 
                    key={symbol} 
                    className="inline-flex items-center gap-1 px-3 py-1 bg-slate-700 text-slate-300 rounded-lg"
                  >
                    {symbol}
                    <button
                      onClick={() => removeCustomSymbol(symbol)}
                      className="hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {customSymbols.length === 0 && (
              <div className="text-sm text-gray-500 italic">
                Add symbols to scan for divergences
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Results */}
      {(holdings?.length || symbols?.length) ? (
        <DivergenceScanner
          holdings={holdings}
          symbols={symbols}
          autoRefresh
          refreshInterval={300000}
        />
      ) : (
        <div className="p-8 bg-[#12121a] border border-white/10 rounded-2xl text-center">
          <div className="text-4xl mb-3">👆</div>
          <div className="text-white font-medium mb-1">Select something to scan</div>
          <div className="text-gray-400 text-sm">
            Choose a client portfolio, watchlist, or enter custom symbols above
          </div>
        </div>
      )}
      
      {/* Info Box */}
      <div className="mt-6 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
        <h3 className="text-white font-medium mb-2">📖 How to Use Divergence Scanner</h3>
        <div className="text-sm text-slate-400 space-y-2">
          <p>
            <strong className="text-purple-400">Social ≠ Analysts:</strong> When Twitter/Reddit sentiment strongly 
            disagrees with Wall Street analyst ratings, it can signal an opportunity — or a risk.
          </p>
          <p>
            <strong className="text-emerald-400">Social Leading:</strong> Retail bullish, analysts bearish? 
            Social may see something Wall Street doesn't. Watch for catalyst.
          </p>
          <p>
            <strong className="text-blue-400">Analysts Leading:</strong> Analysts bullish, social bearish? 
            Institutional knowledge retail missed, or retail knows something about sentiment.
          </p>
          <p>
            <strong className="text-amber-400">Major Divergences:</strong> High severity means large disagreement. 
            Worth investigating before making changes.
          </p>
        </div>
      </div>
    </div>
  );
}
