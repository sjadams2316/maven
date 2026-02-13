'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface ClientContext {
  id: string;
  firstName: string;
  lastName: string;
  aum: number;
  riskTolerance: string;
  holdings: any[];
  allocation: any;
  accounts: any[];
  notes?: string;
  dateOfBirth?: string;
  state?: string;
}

interface AdvisorOracleProps {
  client?: ClientContext;
  compact?: boolean;
}

const POPULAR_STOCKS = [
  { symbol: 'SPY', name: 'S&P 500 ETF' },
  { symbol: 'QQQ', name: 'Nasdaq 100 ETF' },
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'GOOGL', name: 'Alphabet' },
];

const QUICK_ACTIONS = [
  { id: 'analyze', label: '📊 Analyze Portfolio', prompt: 'Analyze this client\'s portfolio and provide insights.' },
  { id: 'meeting', label: '📅 Meeting Prep', prompt: 'Generate meeting prep for this client.' },
  { id: 'tax', label: '💰 Tax Opportunities', prompt: 'Analyze this portfolio for tax-loss harvesting opportunities.' },
  { id: 'stress', label: '⚡ Stress Test', prompt: 'Run a stress test on this portfolio.' },
  { id: 'rebalance', label: '⚖️ Rebalance', prompt: 'Suggest rebalancing trades to get back to target allocation.' },
  { id: 'reallocate', label: '🔄 Reallocate', prompt: 'Suggest a complete reallocation strategy.' },
  { id: 'insights', label: '🔮 Key Insights', prompt: 'What are the most important things I should know about this portfolio?' },
  { id: 'questions', label: '❓ Interview Questions', prompt: 'Generate 5 thoughtful questions to ask this client.' },
];

export default function AdvisorOracle({ client, compact = false }: AdvisorOracleProps) {
  const [isOpen, setIsOpen] = useState(!compact);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stockSearch, setStockSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMsg = client 
        ? `Hi! I'm Maven Oracle. I'm ready to help you with ${client.firstName} ${client.lastName}'s portfolio.`
        : `Hi! I'm Maven Oracle - your research assistant.`;
      setMessages([{ role: 'assistant', content: welcomeMsg }]);
    }
  }, [client]);

  const handleQuickAction = async (action: typeof QUICK_ACTIONS[0]) => {
    setInput(action.prompt);
    const userMsg = { role: 'user' as const, content: action.prompt };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    // Simulate response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: `Analysis for: ${action.prompt}\n\n[Oracle would respond here with intelligent analysis based on client data]` }]);
      setIsLoading(false);
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMsg = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: `You asked: ${input}\n\n[Oracle would respond here]` }]);
      setIsLoading(false);
    }, 1000);
  };

  const handleStockSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockSearch.trim()) return;
    const symbol = stockSearch.toUpperCase().trim();
    setInput(`Research ${symbol}: Get current price, analyst ratings, key metrics, recent news.`);
    setStockSearch('');
  };

  if (compact && !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white p-4 rounded-full shadow-lg shadow-purple-500/30 transition-all hover:scale-110 z-50"
        title="Open Maven Oracle"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
    );
  }

  return (
    <div className={`bg-[#0f0f1a] border border-white/10 rounded-xl overflow-hidden flex ${compact ? 'fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl shadow-purple-500/20 z-50' : 'h-full'}`}>
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 shrink-0">
        <form onSubmit={handleStockSearch} className="mb-3">
          <div className="relative">
            <input
              type="text"
              value={stockSearch}
              onChange={(e) => setStockSearch(e.target.value)}
              placeholder="Search stocks..."
              className="w-full bg-white/20 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/50 focus:outline-none"
            />
          </div>
        </form>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {POPULAR_STOCKS.slice(0, 6).map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => setInput(`Research ${stock.symbol}`)}
              className="text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded-full"
            >
              {stock.symbol}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔮</span>
            <div>
              <h3 className="font-semibold text-white text-sm">Maven Oracle</h3>
              {client && <p className="text-xs text-white/70">{client.firstName} {client.lastName}</p>}
            </div>
          </div>
          {compact && (
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      {client && (
        <div className="px-3 py-2 bg-white/5 border-b border-white/10 overflow-x-auto shrink-0">
          <div className="flex gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                disabled={isLoading}
                className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full whitespace-nowrap"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`${msg.role === 'user' ? 'ml-8' : 'mr-8'} ${
              msg.role === 'user' ? 'bg-indigo-600/30 border-indigo-500/30' : 'bg-white/5 border-white/10'
            } border rounded-lg p-3`}
          >
            <p className="text-sm text-white/90 whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}
        {isLoading && (
          <div className="mr-8 bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2 text-white/60">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="text-xs">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-3 border-t border-white/10 bg-white/5 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={client ? 'Ask about this client\'s portfolio...' : 'Ask Maven Oracle...'}
            className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
