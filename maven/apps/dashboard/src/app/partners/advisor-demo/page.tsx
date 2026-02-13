'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// Oracle modes for advisors
const ORACLE_MODES = [
  { 
    id: 'research', 
    icon: '🔍', 
    label: 'Research', 
    description: 'Market intelligence & stock analysis',
    color: 'indigo'
  },
  { 
    id: 'clients', 
    icon: '👥', 
    label: 'Client Book', 
    description: 'Analyze across your client portfolio',
    color: 'emerald'
  },
  { 
    id: 'models', 
    icon: '📊', 
    label: 'Models', 
    description: 'Portfolio optimization & allocation',
    color: 'amber'
  },
  { 
    id: 'insights', 
    icon: '💡', 
    label: 'Insights', 
    description: 'Market trends & opportunities',
    color: 'purple'
  }
];

// Quick suggestions by mode
const MODE_SUGGESTIONS: Record<string, string[]> = {
  research: [
    '📈 What\'s the outlook for tech stocks?',
    '🏦 Compare regional bank ETFs',
    '💎 Should I recommend gold exposure?',
    '🌍 Emerging markets vs developed',
    '⚡ How will Fed cuts affect REITs?',
    '🔮 Analyze NVDA vs other AI plays'
  ],
  clients: [
    '👥 Which clients are overweight tech?',
    '📊 Show me conservative portfolios',
    '⚠️ Flag concentrated positions > 10%',
    '💰 Tax harvesting opportunities',
    '🎯 Clients below target allocation',
    '📅 Who needs rebalancing?'
  ],
  models: [
    '⚖️ Optimize 60/40 for current market',
    '🛡️ Build defensive allocation',
    '📈 Growth vs value tilt analysis',
    '🌍 International diversification',
    '💎 Alternative investments sizing',
    '🏠 REITs in portfolio context'
  ],
  insights: [
    '🔥 What\'s trending in wealth management?',
    '📊 Sector rotation opportunities',
    '💼 RIA best practices 2026',
    '🎯 Client acquisition strategies',
    '🔮 AI impact on advisory business',
    '📈 Fee compression trends'
  ]
};

// Demo client data
const DEMO_CLIENTS = [
  { name: 'Robert Chen', aum: 1250000, risk: 'Moderate', age: 52 },
  { name: 'Morrison Trust', aum: 890000, risk: 'Conservative', age: 65 },
  { name: 'Jennifer Walsh', aum: 675000, risk: 'Aggressive', age: 34 },
  { name: 'Michael Thompson', aum: 520000, risk: 'Growth', age: 41 }
];

export default function AdvisorDemoPage() {
  const [activeMode, setActiveMode] = useState('research');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Welcome message based on mode
    const welcomeMessages: Record<string, string> = {
      research: `🔮 **Maven Oracle - Research Mode**

I'm your AI research partner. I have real-time access to market data, sentiment analysis, and trading signals through Athena.

Try asking me about any stock, sector, or market trend!`,
      clients: `👥 **Maven Oracle - Client Book Mode**

I can analyze patterns across your ${DEMO_CLIENTS.length} demo clients:
• Total AUM: $3.3M
• Avg age: 48
• Risk mix: 25% Conservative, 50% Moderate, 25% Aggressive

Ask me to find patterns, flag issues, or suggest optimizations!`,
      models: `📊 **Maven Oracle - Model Mode**

I help you build and optimize portfolio models using:
• Modern Portfolio Theory
• Risk-adjusted returns
• Tax efficiency
• Real-time market conditions

Let's create something better than 60/40!`,
      insights: `💡 **Maven Oracle - Insights Mode**

I track trends across wealth management and can help with:
• Market opportunities
• Industry best practices  
• Client relationship strategies
• Technology adoption

What would you like to explore?`
    };

    setMessages([{ role: 'assistant', content: welcomeMessages[activeMode] || welcomeMessages.research }]);
  }, [activeMode]);

  const handleModeChange = (mode: string) => {
    setActiveMode(mode);
    setInput('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
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
            mode: activeMode,
            source: 'advisor_demo',
            demo_clients: activeMode === 'clients' ? DEMO_CLIENTS : undefined
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

  const currentMode = ORACLE_MODES.find(m => m.id === activeMode);
  const suggestions = MODE_SUGGESTIONS[activeMode] || [];

  return (
    <div className="min-h-screen bg-[#0a0a12] flex flex-col">
      {/* Header */}
      <header className="p-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/partners" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <div className="text-white font-semibold">Maven Oracle</div>
              <div className="text-amber-500 text-xs font-medium tracking-widest">ADVISOR DEMO</div>
            </div>
          </Link>
          <div className="text-gray-400 text-sm">
            Experience your AI co-pilot
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Sidebar - Mode Selector */}
        <div className="w-80 bg-[#12121a] border-r border-white/10 p-6">
          <h3 className="text-white font-semibold mb-4">Oracle Modes</h3>
          <div className="space-y-3">
            {ORACLE_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode.id)}
                className={`w-full p-4 rounded-xl border transition-all text-left ${
                  activeMode === mode.id
                    ? `bg-${mode.color}-600/20 border-${mode.color}-500 text-white`
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{mode.icon}</span>
                  <div>
                    <div className="font-medium">{mode.label}</div>
                    <div className="text-xs opacity-70">{mode.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Quick Suggestions */}
          <div className="mt-6">
            <h4 className="text-white text-sm font-medium mb-3">Try asking:</h4>
            <div className="space-y-2">
              {suggestions.slice(0, 4).map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left p-2 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Oracle Chat */}
        <div className="flex-1 flex flex-col">
          {/* Mode Header */}
          <div className={`p-6 bg-gradient-to-r from-${currentMode?.color}-600 to-${currentMode?.color}-700 text-white`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{currentMode?.icon}</span>
              <div>
                <h1 className="text-2xl font-bold">{currentMode?.label} Mode</h1>
                <p className="text-white/80">{currentMode?.description}</p>
              </div>
            </div>
            {activeMode === 'clients' && (
              <div className="flex gap-4 mt-4 text-sm">
                <div>📊 {DEMO_CLIENTS.length} clients</div>
                <div>💰 $3.3M AUM</div>
                <div>📈 Avg age 48</div>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`${msg.role === 'user' ? 'ml-12' : 'mr-12'} ${
                  msg.role === 'user' 
                    ? `bg-${currentMode?.color}-600/30 border-${currentMode?.color}-500/30` 
                    : 'bg-white/5 border-white/10'
                } border rounded-xl p-4`}
              >
                <p className="text-white whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}
            
            {isLoading && (
              <div className="mr-12 bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 text-white/60">
                  <div className={`w-2 h-2 bg-${currentMode?.color}-400 rounded-full animate-bounce`} />
                  <div className={`w-2 h-2 bg-${currentMode?.color}-400 rounded-full animate-bounce`} style={{ animationDelay: '0.1s' }} />
                  <div className={`w-2 h-2 bg-${currentMode?.color}-400 rounded-full animate-bounce`} style={{ animationDelay: '0.2s' }} />
                  <span className="text-sm ml-2">Oracle is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-6 border-t border-white/10 bg-[#12121a]">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask Oracle about ${currentMode?.label.toLowerCase()}...`}
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-amber-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={`px-6 py-3 bg-${currentMode?.color}-600 hover:bg-${currentMode?.color}-500 disabled:bg-gray-600 disabled:opacity-50 rounded-xl text-white font-medium transition-colors`}
              >
                Ask
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}