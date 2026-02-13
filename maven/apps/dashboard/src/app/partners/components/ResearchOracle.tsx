'use client';

import { useState, useEffect, useRef } from 'react';

const RESEARCH_SUGGESTIONS = [
  '📊 Market outlook for tech stocks',
  '🏦 Compare regional bank ETFs',
  '⚡ Impact of Fed rate changes',
  '🌍 Emerging markets vs developed',
  '🏠 REITs in rising rate environment',
  '💎 Commodities exposure strategies'
];

const POPULAR_SYMBOLS = [
  { symbol: 'SPY', name: 'S&P 500 ETF' },
  { symbol: 'QQQ', name: 'Nasdaq 100' },
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'NVDA', name: 'NVIDIA' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'TAO', name: 'Bittensor' },
  { symbol: 'VTI', name: 'Total Stock Market' }
];

export default function ResearchOracle() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setMessages([{ 
      role: 'assistant', 
      content: `🔮 **Maven Research Assistant**

I'm your AI research partner. Ask me about:
• **Stocks & ETFs** - Analysis, comparisons, outlook
• **Market trends** - Sectors, themes, opportunities  
• **Economic factors** - Fed policy, inflation, global events
• **Investment strategies** - Asset allocation, risk management

Try clicking a suggestion below or ask anything!` 
    }]);
  }, []);

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleSymbolClick = (symbol: string) => {
    setInput(`Analyze ${symbol} - current outlook, key metrics, and investment thesis`);
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
            interface: 'research_assistant',
            source: 'partners_dashboard',
            mode: 'advisor_research',
            focus: 'market_intelligence'
          }
        })
      });
      
      const data = await response.json();
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response || data.insight || 'Research assistant unavailable. Please try again.' 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Error connecting to research assistant. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#0f0f1a] border border-indigo-500/30 rounded-xl overflow-hidden h-96 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xl">🔮</span>
          <div>
            <h3 className="text-white font-semibold">Maven Research</h3>
            <p className="text-white/70 text-sm">AI-powered market intelligence</p>
          </div>
        </div>
        
        {/* Research Suggestions */}
        <div className="grid grid-cols-2 gap-2">
          {RESEARCH_SUGGESTIONS.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => handleSuggestion(suggestion)}
              className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg transition-colors text-left"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Symbol Access */}
      <div className="bg-white/5 p-3 border-b border-white/10 shrink-0">
        <div className="flex flex-wrap gap-2">
          {POPULAR_SYMBOLS.map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => handleSymbolClick(stock.symbol)}
              className="text-xs bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 px-2 py-1 rounded-md transition-colors"
              title={stock.name}
            >
              {stock.symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`${msg.role === 'user' ? 'ml-6' : 'mr-6'} ${
              msg.role === 'user' 
                ? 'bg-indigo-600/30 border-indigo-500/30' 
                : 'bg-white/5 border-white/10'
            } border rounded-lg p-3`}
          >
            <p className="text-sm text-white/90 whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}
        
        {isLoading && (
          <div className="mr-6 bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2 text-white/60">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="text-xs">Researching...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-white/10 bg-white/5 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about stocks, markets, or investment strategies..."
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 text-sm focus:outline-none focus:border-indigo-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 disabled:opacity-50 rounded-lg text-white text-sm transition-colors"
          >
            Ask
          </button>
        </div>
      </form>
    </div>
  );
}