'use client';

import { useState, useEffect, useCallback } from 'react';

interface MarketQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose?: number;
  isFutures?: boolean;
  afterHoursPrice?: number;
  afterHoursChange?: number;
  afterHoursChangePercent?: number;
}

type MarketSession = 'pre-market' | 'regular' | 'after-hours' | 'closed';

interface MarketResponse {
  stocks: MarketQuote[];
  crypto: MarketQuote[];
  isLive: boolean;
  marketSession: MarketSession;
  marketLabel: string;
  timestamp: string;
}

// TradingView symbol mapping
const TV_SYMBOLS: Record<string, string> = {
  SPX: 'AMEX:SPY',
  DJI: 'AMEX:DIA',
  COMP: 'NASDAQ:QQQ',
  RUT: 'AMEX:IWM',
  BTC: 'COINBASE:BTCUSD',
  TAO: 'BINANCE:TAOUSDT',
};

const TIMEFRAMES = [
  { label: '1D', interval: '15', range: '1D' },
  { label: '5D', interval: '60', range: '5D' },
  { label: '1M', interval: 'D', range: '1M' },
  { label: '3M', interval: 'D', range: '3M' },
  { label: '1Y', interval: 'W', range: '12M' },
  { label: '5Y', interval: 'M', range: '60M' },
];

function SessionBadge({ session, label }: { session: MarketSession; label: string }) {
  const config: Record<MarketSession, { bg: string; text: string; dot?: string }> = {
    'regular': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
    'pre-market': { bg: 'bg-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400' },
    'after-hours': { bg: 'bg-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-400' },
    'closed': { bg: 'bg-gray-500/20', text: 'text-gray-400' },
  };
  const c = config[session];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 ${c.bg} ${c.text} rounded-full text-[10px] font-medium`}>
      {c.dot && <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${session === 'regular' ? 'animate-pulse' : ''}`} />}
      {label}
    </span>
  );
}

function ChartModal({ quote, onClose, session }: { quote: MarketQuote; onClose: () => void; session: MarketSession }) {
  const [timeframe, setTimeframe] = useState(TIMEFRAMES[0]);
  const tvSymbol = TV_SYMBOLS[quote.symbol] || quote.symbol;

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const embedUrl = `https://www.tradingview.com/widgetembed/?symbol=${encodeURIComponent(tvSymbol)}&interval=${timeframe.interval}&theme=dark&style=2&locale=en&hide_top_toolbar=1&hide_legend=0&range=${timeframe.range}&allow_symbol_change=0&save_image=0&backgroundColor=rgba(10,10,15,1)&gridColor=rgba(255,255,255,0.04)`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-[#0e0e16] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{quote.name}</h3>
              <span className="text-xs text-gray-500">{quote.symbol}</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-2xl font-bold text-white">
                {quote.price < 100 ? `$${quote.price.toFixed(2)}` : `$${quote.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              </span>
              <span className={`text-sm font-medium ${quote.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {quote.changePercent >= 0 ? '+' : ''}{quote.change.toFixed(2)} ({quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%)
              </span>
            </div>
            {/* After-hours info */}
            {(session === 'after-hours' || session === 'pre-market') && quote.afterHoursPrice && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">{session === 'after-hours' ? 'After Hours' : 'Pre-Market'}:</span>
                <span className="text-xs text-white">${quote.afterHoursPrice.toFixed(2)}</span>
                <span className={`text-xs ${(quote.afterHoursChangePercent ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {(quote.afterHoursChangePercent ?? 0) >= 0 ? '+' : ''}{quote.afterHoursChangePercent?.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 px-4 pt-3">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.label}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                timeframe.label === tf.label
                  ? 'bg-indigo-500/30 text-indigo-300'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="p-4">
          <div className="rounded-xl overflow-hidden bg-[#0a0a0f]" style={{ height: 350 }}>
            <iframe
              key={`${tvSymbol}-${timeframe.label}`}
              src={embedUrl}
              width="100%"
              height="100%"
              frameBorder="0"
              allowTransparency
              style={{ border: 'none' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MarketOverview() {
  const [indices, setIndices] = useState<MarketQuote[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiveData, setIsLiveData] = useState(true);
  const [marketSession, setMarketSession] = useState<MarketSession>('closed');
  const [marketLabel, setMarketLabel] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<MarketQuote | null>(null);

  const fetchMarketData = useCallback(async () => {
    try {
      const response = await fetch('/api/market-data');
      if (!response.ok) throw new Error('Failed to fetch market data');

      const data: MarketResponse = await response.json();
      const allIndices = [...(data.stocks || []), ...(data.crypto || [])];

      setIndices(allIndices);
      setLastUpdate(new Date());
      setIsLiveData(data.isLive !== false);
      setMarketSession(data.marketSession || 'closed');
      setMarketLabel(data.marketLabel || '');
      setError(null);
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError('Failed to load market data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000);
    return () => clearInterval(interval);
  }, [fetchMarketData]);

  if (loading) {
    return (
      <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Markets</h3>
          <span className="text-xs text-gray-500">Loading...</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white/5 rounded-xl p-3 animate-pulse">
              <div className="h-3 bg-white/10 rounded w-12 mb-2" />
              <div className="h-5 bg-white/10 rounded w-20 mb-1" />
              <div className="h-3 bg-white/10 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            Markets
            <SessionBadge session={marketSession} label={marketLabel} />
            {!isLiveData && (
              <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded font-normal">
                Delayed
              </span>
            )}
          </h3>
          <div className="flex items-center gap-2">
            {error && <span className="text-xs text-red-400">{error}</span>}
            <span className="text-xs text-gray-500">
              {lastUpdate
                ? marketSession === 'closed'
                  ? 'Prev Close'
                  : `Updated ${lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : ''}
            </span>
            <button
              onClick={fetchMarketData}
              className="text-xs text-indigo-400 hover:text-indigo-300"
              title="Refresh market data"
            >
              ↻
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {indices.map((idx) => (
            <div
              key={idx.symbol}
              onClick={() => setSelectedQuote(idx)}
              className="bg-white/5 rounded-xl p-3 hover:bg-white/10 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500 group-hover:text-gray-400">{idx.symbol}</span>
                {idx.price > 0 && (
                  <span className={`text-xs font-medium ${idx.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {idx.changePercent >= 0 ? '▲' : '▼'} {Math.abs(idx.changePercent).toFixed(2)}%
                  </span>
                )}
              </div>
              <p className="text-white font-semibold">
                {idx.price > 0
                  ? idx.price < 100
                    ? `$${idx.price.toFixed(2)}`
                    : `$${idx.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                  : '—'}
              </p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {idx.isFutures ? (
                    <span className="text-amber-400/80">{idx.name}</span>
                  ) : idx.name}
                </p>
                {/* Show previous close reference during futures */}
                {idx.isFutures && idx.previousClose && (
                  <span className="text-[10px] text-gray-600">
                    Close: ${idx.previousClose.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                )}
              </div>
              {/* Subtle click hint */}
              <div className="mt-1.5 flex items-center gap-1 text-[10px] text-gray-600 group-hover:text-indigo-400/60 transition">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View chart
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Modal */}
      {selectedQuote && (
        <ChartModal
          quote={selectedQuote}
          session={marketSession}
          onClose={() => setSelectedQuote(null)}
        />
      )}
    </>
  );
}
