'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, BarChart3, Search, Activity, Target } from 'lucide-react';

// Live market data interfaces
interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sparkline?: number[];
}

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  peRatio: number;
  dayHigh: number;
  dayLow: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
}

// Demo market data - in production, this comes from real APIs
const MARKET_INDICES: MarketIndex[] = [
  { symbol: 'SPY', name: 'S&P 500', price: 683.27, change: 2.45, changePercent: 0.36, sparkline: [680, 681, 679, 682, 683] },
  { symbol: 'QQQ', name: 'NASDAQ', price: 559.15, change: -1.23, changePercent: -0.22, sparkline: [561, 560, 558, 559, 559] },
  { symbol: 'DIA', name: 'Dow Jones', price: 494.52, change: 0.87, changePercent: 0.18, sparkline: [493, 494, 493, 495, 495] },
  { symbol: 'IWM', name: 'Russell 2000', price: 261.58, change: 1.34, changePercent: 0.51, sparkline: [260, 261, 260, 262, 262] },
  { symbol: 'BTC', name: 'Bitcoin', price: 66984, change: -823, changePercent: -1.21, sparkline: [67800, 67500, 67200, 67000, 66984] }
];

const WATCHLIST_STOCKS = [
  { symbol: 'AAPL', name: 'Apple', price: 189.45, change: 2.31, changePercent: 1.23 },
  { symbol: 'NVDA', name: 'NVIDIA', price: 734.82, change: -12.45, changePercent: -1.67 },
  { symbol: 'MSFT', name: 'Microsoft', price: 412.56, change: 3.78, changePercent: 0.92 },
  { symbol: 'GOOGL', name: 'Alphabet', price: 159.23, change: -0.89, changePercent: -0.56 },
  { symbol: 'TSLA', name: 'Tesla', price: 201.34, change: 8.67, changePercent: 4.50 },
  { symbol: 'AMZN', name: 'Amazon', price: 178.91, change: 1.23, changePercent: 0.69 }
];

// Oracle modes for professional interface
const ORACLE_MODES = [
  { id: 'research', icon: '🔍', label: 'Research', active: true },
  { id: 'charts', icon: '📈', label: 'Charts', active: false },
  { id: 'clients', icon: '👥', label: 'Clients', active: false },
  { id: 'watchlist', icon: '⭐', label: 'Watchlist', active: false }
];

export default function AdvisorProPage() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('SPY');
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [oracleMode, setOracleMode] = useState('research');
  const [oracleMessages, setOracleMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [oracleInput, setOracleInput] = useState('');
  const [isOracleLoading, setIsOracleLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [oracleMessages]);

  // Initialize Oracle
  useEffect(() => {
    setOracleMessages([{
      role: 'assistant',
      content: `🔮 **Maven Oracle - Pro Workstation**

Your professional trading assistant is ready. I have real-time access to:
• Market data & technical analysis
• Fundamental research & analyst ratings  
• Portfolio optimization & risk analysis
• Client insights & recommendations

Markets are open — what would you like to analyze?`
    }]);
  }, []);

  const handleSymbolClick = (symbol: string) => {
    setSelectedSymbol(symbol);
    // In production, fetch real stock data
    const mockStockData: StockData = {
      symbol,
      name: MARKET_INDICES.find(m => m.symbol === symbol)?.name || symbol,
      price: MARKET_INDICES.find(m => m.symbol === symbol)?.price || 100,
      change: MARKET_INDICES.find(m => m.symbol === symbol)?.change || 0,
      changePercent: MARKET_INDICES.find(m => m.symbol === symbol)?.changePercent || 0,
      volume: 45678900,
      marketCap: 2845000000000,
      peRatio: 24.5,
      dayHigh: 685.23,
      dayLow: 681.45,
      fiftyTwoWeekHigh: 695.89,
      fiftyTwoWeekLow: 512.34
    };
    setSelectedStock(mockStockData);
  };

  const handleOracleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oracleInput.trim() || isOracleLoading) return;
    
    const userMsg = { role: 'user' as const, content: oracleInput };
    setOracleMessages(prev => [...prev, userMsg]);
    const messageText = oracleInput;
    setOracleInput('');
    setIsOracleLoading(true);
    
    try {
      const response = await fetch('/api/athena/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: messageText,
          context: {
            interface: 'advisor_pro',
            mode: oracleMode,
            selectedSymbol,
            marketData: MARKET_INDICES,
            selectedStock
          }
        })
      });
      
      const data = await response.json();
      setOracleMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response || data.insight || 'Oracle response unavailable. Please try again.' 
      }]);
    } catch (error) {
      setOracleMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Error connecting to Oracle. Please try again.' 
      }]);
    } finally {
      setIsOracleLoading(false);
    }
  };

  const formatPrice = (price: number, isCrypto: boolean = false) => {
    if (isCrypto) return `$${price.toLocaleString()}`;
    return `$${price.toFixed(2)}`;
  };

  const formatChange = (change: number, changePercent: number) => {
    const color = change >= 0 ? 'text-green-400' : 'text-red-400';
    const icon = change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
    return (
      <div className={`flex items-center gap-1 ${color}`}>
        {icon}
        <span>{change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      {/* Header with Live Market Data */}
      <header className="bg-[#12121a] border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/partners" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div>
                <div className="text-white font-semibold">Maven Pro</div>
                <div className="text-amber-500 text-xs font-medium tracking-widest">ADVISOR WORKSTATION</div>
              </div>
            </Link>
            
            {/* Live Market Ticker */}
            <div className="hidden lg:flex items-center gap-6 ml-8">
              {MARKET_INDICES.map((index) => (
                <button
                  key={index.symbol}
                  onClick={() => handleSymbolClick(index.symbol)}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-white/10 ${
                    selectedSymbol === index.symbol ? 'bg-amber-600/20 border border-amber-500/30' : ''
                  }`}
                >
                  <div className="text-left">
                    <div className="text-sm font-medium">{index.symbol}</div>
                    <div className="text-xs text-gray-400">{formatPrice(index.price, index.symbol === 'BTC')}</div>
                  </div>
                  {formatChange(index.change, index.changePercent)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-green-400 text-sm">● Markets Open</div>
            <div className="text-gray-400 text-sm">9:30 AM EST</div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Oracle */}
        <div className="w-2/5 bg-[#0f0f1a] border-r border-white/10 flex flex-col">
          {/* Oracle Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🔮</span>
              <div>
                <h2 className="text-xl font-semibold">Maven Oracle</h2>
                <p className="text-gray-400 text-sm">Professional AI Assistant</p>
              </div>
            </div>
            
            {/* Oracle Modes */}
            <div className="flex gap-2">
              {ORACLE_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setOracleMode(mode.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    oracleMode === mode.id
                      ? 'bg-amber-600 text-white'
                      : 'bg-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <span>{mode.icon}</span>
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Oracle Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {oracleMessages.map((msg, i) => (
              <div
                key={i}
                className={`${msg.role === 'user' ? 'ml-6' : 'mr-6'} ${
                  msg.role === 'user' 
                    ? 'bg-amber-600/30 border-amber-500/30' 
                    : 'bg-white/5 border-white/10'
                } border rounded-xl p-4`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
            
            {isOracleLoading && (
              <div className="mr-6 bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 text-white/60">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <span className="text-sm ml-2">Oracle analyzing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Oracle Input */}
          <form onSubmit={handleOracleSubmit} className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={oracleInput}
                onChange={(e) => setOracleInput(e.target.value)}
                placeholder={`Ask Oracle about ${selectedSymbol || 'the markets'}...`}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 text-sm focus:outline-none focus:border-amber-400"
                disabled={isOracleLoading}
              />
              <button
                type="submit"
                disabled={isOracleLoading || !oracleInput.trim()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 disabled:opacity-50 rounded-lg text-white text-sm font-medium transition-colors"
              >
                Ask
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel - Charts & Research */}
        <div className="flex-1 flex flex-col">
          {/* Top Section - Technical Chart */}
          <div className="h-1/2 p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-semibold">{selectedSymbol} Technical Chart</h3>
                {selectedStock && (
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold">{formatPrice(selectedStock.price, selectedSymbol === 'BTC')}</span>
                    {formatChange(selectedStock.change, selectedStock.changePercent)}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-sm">1D</button>
                <button className="px-3 py-1 bg-amber-600 rounded text-sm">5D</button>
                <button className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-sm">1M</button>
                <button className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-sm">1Y</button>
              </div>
            </div>
            
            {/* Chart Placeholder - In production, integrate TradingView or similar */}
            <div className="h-full bg-[#12121a] rounded-xl border border-white/10 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">{selectedSymbol} Candlestick Chart</h4>
                <p className="text-gray-400 mb-4">Technical analysis with RSI, MACD, Volume</p>
                <div className="flex gap-4 justify-center text-sm">
                  <div>RSI: 64.2</div>
                  <div>MACD: Bullish</div>
                  <div>Vol: {selectedStock?.volume.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Research & Watchlist */}
          <div className="flex-1 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Research & Watchlist</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search stocks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Watchlist Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {WATCHLIST_STOCKS.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => handleSymbolClick(stock.symbol)}
                  className={`p-4 bg-[#12121a] rounded-xl border transition-colors hover:bg-white/5 text-left ${
                    selectedSymbol === stock.symbol ? 'border-amber-500' : 'border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{stock.symbol}</span>
                    <Activity className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="text-sm text-gray-400 mb-2">{stock.name}</div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{formatPrice(stock.price)}</span>
                    <div className={`text-xs ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Stock Details */}
            {selectedStock && (
              <div className="mt-6 p-4 bg-[#12121a] rounded-xl border border-white/10">
                <h4 className="text-lg font-semibold mb-3">{selectedStock.symbol} Fundamentals</h4>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Market Cap</div>
                    <div className="font-medium">${(selectedStock.marketCap / 1e12).toFixed(2)}T</div>
                  </div>
                  <div>
                    <div className="text-gray-400">P/E Ratio</div>
                    <div className="font-medium">{selectedStock.peRatio}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Day Range</div>
                    <div className="font-medium">{formatPrice(selectedStock.dayLow)} - {formatPrice(selectedStock.dayHigh)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">52W Range</div>
                    <div className="font-medium">{formatPrice(selectedStock.fiftyTwoWeekLow)} - {formatPrice(selectedStock.fiftyTwoWeekHigh)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}