'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';

// Market data interfaces
interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

// Live market data - in production this would be real-time
const MARKET_INDICES: MarketIndex[] = [
  { symbol: 'SPY', name: 'S&P 500', price: 683.27, change: 2.45, changePercent: 0.36 },
  { symbol: 'QQQ', name: 'NASDAQ', price: 559.15, change: -1.23, changePercent: -0.22 },
  { symbol: 'BTC', name: 'Bitcoin', price: 66984, change: -823, changePercent: -1.21 },
  { symbol: 'TAO', name: 'Bittensor', price: 156.03, change: -0.14, changePercent: -0.09 }
];

const POPULAR_STOCKS = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'NVDA', name: 'NVIDIA' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'AMZN', name: 'Amazon' }
];

export default function IntegratedOracle() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState<StockQuote | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Oracle
  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: `🔮 **Maven Oracle - Professional Research**

I'm ready to help with:
• **Stock Research** - Fundamental analysis, technicals, outlook
• **Market Analysis** - Sectors, themes, economic factors
• **Client Questions** - Portfolio optimization, allocation advice
• **Contrarian Ideas** - Under-the-radar opportunities

Markets are open — what would you like to research?`
    }]);
  }, []);

  const handleStockSearch = async () => {
    if (!searchQuery.trim()) return;
    
    const symbol = searchQuery.toUpperCase().trim();
    setInput(`Analyze ${symbol} - current outlook, key metrics, and investment thesis`);
    setSearchQuery('');
    
    // Mock stock data - in production, fetch real quote
    setSelectedStock({
      symbol,
      price: 150.00,
      change: 2.30,
      changePercent: 1.55,
      volume: 45678900
    });
  };

  const handleQuickSymbol = (symbol: string) => {
    setInput(`Research ${symbol} - what's your take on the current setup?`);
  };

  const handleIndexClick = (index: MarketIndex) => {
    setInput(`What's driving ${index.symbol} today? Any key levels to watch?`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMsg = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMsg]);
    const messageText = input;
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/athena/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: messageText,
          context: {
            interface: 'advisor_oracle',
            mode: 'advisor_research',
            source: 'integrated_dashboard',
            marketData: MARKET_INDICES,
            selectedStock
          }
        })
      });
      
      const data = await response.json();
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response || data.insight || 'Oracle response unavailable. Please try again.' 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Error connecting to Oracle. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
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
    <div className="bg-[#12121a] border border-white/10 rounded-xl">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔮</span>
            <div>
              <h2 className="text-xl font-semibold text-white">Maven Oracle</h2>
              <p className="text-gray-400 text-sm">AI Research Assistant</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-sm rounded-lg transition-colors"
          >
            {isExpanded ? 'Minimize' : 'Expand'}
          </button>
        </div>

        {/* Live Market Ticker */}
        <div className="flex items-center gap-4 mb-4 overflow-x-auto">
          {MARKET_INDICES.map((index) => (
            <button
              key={index.symbol}
              onClick={() => handleIndexClick(index)}
              className="flex items-center gap-2 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors whitespace-nowrap"
            >
              <div className="text-left">
                <div className="text-sm font-medium text-white">{index.symbol}</div>
                <div className="text-xs text-gray-400">{formatPrice(index.price, index.symbol === 'BTC')}</div>
              </div>
              <div className="text-xs">
                {formatChange(index.change, index.changePercent)}
              </div>
            </button>
          ))}
        </div>

        {/* Stock Search */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search stocks (AAPL, NVDA, etc.)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStockSearch()}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 text-sm focus:outline-none focus:border-amber-400"
            />
          </div>
          <button
            onClick={handleStockSearch}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors"
          >
            Research
          </button>
        </div>

        {/* Quick Stock Access */}
        <div className="flex flex-wrap gap-2 mt-3">
          {POPULAR_STOCKS.map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => handleQuickSymbol(stock.symbol)}
              className="px-2 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-xs rounded transition-colors"
              title={stock.name}
            >
              {stock.symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Oracle Messages */}
      <div className={`${isExpanded ? 'h-96' : 'h-64'} overflow-y-auto p-4 space-y-3`}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`${msg.role === 'user' ? 'ml-8' : 'mr-8'} ${
              msg.role === 'user' 
                ? 'bg-amber-600/30 border-amber-500/30' 
                : 'bg-white/5 border-white/10'
            } border rounded-lg p-3`}
          >
            <p className="text-sm text-white whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}
        
        {isLoading && (
          <div className="mr-8 bg-white/5 border border-white/10 rounded-lg p-3">
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
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Oracle about markets, stocks, or client strategies..."
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 text-sm focus:outline-none focus:border-amber-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 disabled:opacity-50 rounded-lg text-white text-sm font-medium transition-colors"
          >
            Ask
          </button>
        </div>
      </form>
    </div>
  );
}