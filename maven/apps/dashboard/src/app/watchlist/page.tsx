'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  type: 'stock' | 'crypto' | 'etf';
  notes?: string;
  alertAbove?: number;
  alertBelow?: number;
}

// Default watchlist based on Sam's interests
const DEFAULT_WATCHLIST = [
  { symbol: 'TAO', name: 'Bittensor', type: 'crypto' as const, notes: 'Core holding - decentralized AI' },
  { symbol: 'BTC', name: 'Bitcoin', type: 'crypto' as const, notes: 'Digital gold, store of value' },
  { symbol: 'CIFR', name: 'Cipher Mining', type: 'stock' as const, notes: 'Bitcoin mining / AI compute' },
  { symbol: 'IREN', name: 'Iris Energy', type: 'stock' as const, notes: 'Bitcoin mining / AI compute' },
  { symbol: 'NVDA', name: 'NVIDIA', type: 'stock' as const, notes: 'AI infrastructure leader' },
  { symbol: 'MSTR', name: 'MicroStrategy', type: 'stock' as const, notes: 'Bitcoin proxy' },
  { symbol: 'COIN', name: 'Coinbase', type: 'stock' as const, notes: 'Crypto exchange' },
  { symbol: 'SPY', name: 'S&P 500 ETF', type: 'etf' as const, notes: 'Market benchmark' },
];

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const fetchPrices = async () => {
    try {
      // Get all symbols from the watchlist
      const allSymbols = DEFAULT_WATCHLIST.map(w => w.symbol);
      
      // Use our API route which handles both crypto and stocks server-side (avoids CORS)
      const response = await fetch('/api/stock-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols: allSymbols }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const { quotes, timestamp } = await response.json();
      
      // Map API response back to watchlist items
      const results: WatchlistItem[] = DEFAULT_WATCHLIST.map(item => {
        const quoteData = quotes[item.symbol];
        
        if (quoteData) {
          return {
            ...item,
            price: quoteData.price || 0,
            change: quoteData.change || 0,
            changePercent: quoteData.changePercent || 0,
          };
        }
        
        return { ...item, price: 0, change: 0, changePercent: 0 };
      });
      
      setWatchlist(results);
      setLastUpdate(timestamp ? new Date(timestamp) : new Date());
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, []);
  
  const gainers = watchlist.filter(w => w.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent);
  const losers = watchlist.filter(w => w.changePercent < 0).sort((a, b) => a.changePercent - b.changePercent);
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Watchlist</h1>
            <p className="text-gray-400 mt-1">
              {lastUpdate 
                ? `Updated ${lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
                : 'Loading...'}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={fetchPrices}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
            >
              ↻ Refresh
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition"
            >
              + Add
            </button>
          </div>
        </div>
        
        {/* Quick Stats */}
        {!loading && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
              <p className="text-emerald-400 text-sm mb-1">Top Gainer</p>
              {gainers[0] ? (
                <>
                  <p className="text-xl font-bold text-white">{gainers[0].symbol}</p>
                  <p className="text-emerald-400">+{gainers[0].changePercent.toFixed(2)}%</p>
                </>
              ) : (
                <p className="text-gray-500">No gainers today</p>
              )}
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-400 text-sm mb-1">Top Loser</p>
              {losers[0] ? (
                <>
                  <p className="text-xl font-bold text-white">{losers[0].symbol}</p>
                  <p className="text-red-400">{losers[0].changePercent.toFixed(2)}%</p>
                </>
              ) : (
                <p className="text-gray-500">No losers today</p>
              )}
            </div>
          </div>
        )}
        
        {/* Watchlist Table */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Symbol</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-500">Price</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-500">24h Change</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500 hidden sm:table-cell">Notes</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center">
                      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-gray-400">Loading live prices...</p>
                    </td>
                  </tr>
                ) : (
                  watchlist.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${
                            item.type === 'crypto' 
                              ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                              : item.type === 'etf'
                              ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                              : 'bg-gradient-to-br from-indigo-500 to-purple-500'
                          }`}>
                            {item.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium text-white">{item.symbol}</p>
                            <p className="text-xs text-gray-500">{item.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <p className="font-medium text-white">
                          ${item.price > 0 
                            ? item.price < 10 
                              ? item.price.toFixed(2) 
                              : item.price.toLocaleString(undefined, { maximumFractionDigits: 0 })
                            : '—'
                          }
                        </p>
                      </td>
                      <td className="p-4 text-right">
                        {item.price > 0 && (
                          <span className={`font-medium ${
                            item.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                          </span>
                        )}
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <p className="text-sm text-gray-500 truncate max-w-xs">{item.notes}</p>
                      </td>
                      <td className="p-4">
                        <button className="text-gray-500 hover:text-white transition">
                          ⋯
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Investment Thesis */}
        <div className="mt-8 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Your Investment Thesis</h3>
          <div className="space-y-3 text-sm text-gray-300">
            <p>
              <strong className="text-indigo-400">AI Infrastructure:</strong> We're in the early innings of AI. 
              The compute layer (CIFR, IREN) and decentralized AI (TAO) represent the picks and shovels of this revolution.
            </p>
            <p>
              <strong className="text-indigo-400">Bitcoin Thesis:</strong> Digital gold with fixed supply. 
              Mining companies provide leveraged exposure to BTC price appreciation.
            </p>
            <p>
              <strong className="text-indigo-400">Time Horizon:</strong> Long-term (5-10 years). 
              Volatility is the price of admission.
            </p>
          </div>
        </div>
      </main>
      
      {/* Add Modal (placeholder) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Add to Watchlist</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-lg" aria-label="Close add to watchlist modal">✕</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Symbol</label>
                <input
                  type="text"
                  placeholder="e.g., AAPL, BTC"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white uppercase placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Notes (optional)</label>
                <input
                  type="text"
                  placeholder="Why are you watching this?"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition">
                Add to Watchlist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
