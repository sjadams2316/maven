'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Search, TrendingUp, TrendingDown, AlertCircle, Star, Clock } from 'lucide-react';

// Client tier interface
interface ClientProfile {
  tier: 'basic' | 'advanced' | 'sophisticated';
  aum: number;
  riskProfile: string;
  allowedQuestions: string[];
  monthlyResearchQueries: number;
  usedQueries: number;
}

// Demo client profiles by code
const CLIENT_PROFILES: Record<string, ClientProfile> = {
  'DEMO-JS123': {
    tier: 'sophisticated',
    aum: 2500000,
    riskProfile: 'Growth-oriented',
    allowedQuestions: ['portfolio', 'market_analysis', 'sector_research', 'individual_stocks', 'alternatives'],
    monthlyResearchQueries: 100,
    usedQueries: 23
  },
  'DEMO-BG456': {
    tier: 'advanced', 
    aum: 750000,
    riskProfile: 'Moderate',
    allowedQuestions: ['portfolio', 'market_analysis', 'sector_research'],
    monthlyResearchQueries: 30,
    usedQueries: 12
  },
  'DEMO-SM789': {
    tier: 'basic',
    aum: 250000,
    riskProfile: 'Conservative',
    allowedQuestions: ['portfolio'],
    monthlyResearchQueries: 5,
    usedQueries: 2
  }
};

// Demo portfolio holdings
const DEMO_HOLDINGS = {
  'DEMO-JS123': [
    { symbol: 'AAPL', shares: 150, value: 28425, allocation: 11.4 },
    { symbol: 'NVDA', shares: 40, value: 29393, allocation: 11.8 },
    { symbol: 'MSFT', shares: 60, value: 24754, allocation: 9.9 },
    { symbol: 'SPY', shares: 100, value: 68327, allocation: 27.3 },
    { symbol: 'QQQ', shares: 50, value: 27958, allocation: 11.2 },
    { symbol: 'VTI', shares: 200, value: 48000, allocation: 19.2 },
    { symbol: 'BTC', value: 21000, allocation: 8.4 }
  ],
  'DEMO-BG456': [
    { symbol: 'SPY', shares: 200, value: 136654, allocation: 45.5 },
    { symbol: 'BND', shares: 300, value: 75000, allocation: 25.0 },
    { symbol: 'VTI', shares: 150, value: 36000, allocation: 12.0 },
    { symbol: 'VXUS', shares: 100, value: 52500, allocation: 17.5 }
  ]
};

// Research suggestions by tier
const TIER_SUGGESTIONS = {
  sophisticated: [
    '📊 What\'s your take on my NVDA concentration risk?',
    '🔄 Should I rotate from tech to financials?',
    '🌍 International allocation vs current market conditions?',
    '💎 Alternative investments for portfolio diversification?',
    '📈 Sector momentum analysis for next quarter?',
    '⚖️ Optimal rebalancing strategy given tax implications?'
  ],
  advanced: [
    '📊 How does my portfolio compare to benchmarks?',
    '🎯 Is my asset allocation appropriate for my goals?',
    '📈 Market outlook for my core holdings?',
    '⚠️ Any concentration risks I should know about?',
    '🔄 When should I consider rebalancing?'
  ],
  basic: [
    '📊 How is my portfolio performing?',
    '🎯 Am I on track for my retirement goals?',
    '⚠️ Are there any risks I should be aware of?',
    '💡 Simple steps to improve my portfolio?'
  ]
};

// Recent research history
const RESEARCH_HISTORY = {
  'DEMO-JS123': [
    { query: 'Tech concentration analysis', timestamp: '2 days ago', type: 'portfolio' },
    { query: 'Alternative investments research', timestamp: '1 week ago', type: 'market_analysis' },
    { query: 'NVIDIA outlook and options', timestamp: '2 weeks ago', type: 'individual_stocks' }
  ],
  'DEMO-BG456': [
    { query: 'Bond duration risk assessment', timestamp: '3 days ago', type: 'portfolio' },
    { query: 'International diversification', timestamp: '1 week ago', type: 'market_analysis' }
  ]
};

export default function ClientResearchPage() {
  const params = useParams();
  const code = params.code as string;
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string; timestamp: Date }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const clientProfile = CLIENT_PROFILES[code];
  const holdings = DEMO_HOLDINGS[code] || [];
  const history = RESEARCH_HISTORY[code] || [];
  const suggestions = TIER_SUGGESTIONS[clientProfile?.tier || 'basic'];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (clientProfile) {
      const tierMessages = {
        sophisticated: `🔮 **Maven Research Assistant**

Welcome! As a sophisticated client, you have full access to our AI research capabilities.

**Your Research Allowance:**
• ${clientProfile.monthlyResearchQueries - clientProfile.usedQueries} queries remaining this month
• Advanced market analysis and individual stock research
• Portfolio optimization and alternative investments
• Direct access to the same tools your advisor uses

I can analyze your ${holdings.length} holdings, market trends, or answer specific investment questions. What would you like to explore?`,
        
        advanced: `🔮 **Maven Research Assistant**

Welcome! You have access to portfolio and market research.

**Your Research Allowance:**
• ${clientProfile.monthlyResearchQueries - clientProfile.usedQueries} queries remaining this month  
• Portfolio analysis and market research
• Sector trends and allocation guidance

I can help with your portfolio or broader market questions. What interests you?`,
        
        basic: `🔮 **Maven Research Assistant**

Welcome! I can help with basic portfolio questions.

**Your Research Allowance:**
• ${clientProfile.monthlyResearchQueries - clientProfile.usedQueries} queries remaining this month
• Portfolio performance and basic guidance

Feel free to ask about your portfolio or financial goals!`
      };

      setMessages([{
        role: 'assistant',
        content: tierMessages[clientProfile.tier],
        timestamp: new Date()
      }]);
    }
  }, [clientProfile, holdings.length]);

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Check query limits
    if (clientProfile && clientProfile.usedQueries >= clientProfile.monthlyResearchQueries) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ You\'ve reached your monthly research query limit. Please contact your advisor for additional access or wait until next month.',
        timestamp: new Date()
      }]);
      return;
    }
    
    const userMsg = { role: 'user' as const, content: input, timestamp: new Date() };
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
            interface: 'client_research',
            clientCode: code,
            clientTier: clientProfile?.tier,
            portfolio: holdings,
            riskProfile: clientProfile?.riskProfile,
            allowedQuestions: clientProfile?.allowedQuestions,
            source: 'client_dashboard'
          }
        })
      });
      
      const data = await response.json();
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response || data.insight || 'Research assistant unavailable. Please try again.',
        timestamp: new Date()
      }]);

      // Update query count (in real app, this would be persisted)
      if (clientProfile) {
        clientProfile.usedQueries++;
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Error connecting to research assistant. Please try again or contact your advisor.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'sophisticated': return 'from-purple-600 to-indigo-600';
      case 'advanced': return 'from-blue-600 to-cyan-600';
      case 'basic': return 'from-green-600 to-emerald-600';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'sophisticated': return '💎 Sophisticated';
      case 'advanced': return '⭐ Advanced';
      case 'basic': return '🟢 Essential';
      default: return '';
    }
  };

  if (!clientProfile) {
    return (
      <div className="min-h-screen bg-[#0a0a12] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Client Not Found</h1>
          <p className="text-gray-400">Invalid client code: {code}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      {/* Header */}
      <header className="bg-[#12121a] border-b border-white/10 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href={`/c/${code}`} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <div className="text-white font-semibold">Maven Research</div>
              <div className="text-amber-500 text-xs font-medium tracking-widest">{getTierBadge(clientProfile.tier)}</div>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">Research Queries</div>
              <div className="text-white font-medium">
                {clientProfile.monthlyResearchQueries - clientProfile.usedQueries} remaining
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Research Suggestions */}
            <div className="bg-[#12121a] rounded-xl border border-white/10 p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                Suggested Questions
              </h3>
              <div className="space-y-2">
                {suggestions.map((suggestion, i) => (
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

            {/* Recent Research */}
            <div className="bg-[#12121a] rounded-xl border border-white/10 p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Recent Research
              </h3>
              <div className="space-y-3">
                {history.map((item, i) => (
                  <div key={i} className="border-l-2 border-blue-500/30 pl-3">
                    <div className="text-sm text-white font-medium">{item.query}</div>
                    <div className="text-xs text-gray-400">{item.timestamp}</div>
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="text-sm text-gray-400">No recent research</div>
                )}
              </div>
            </div>

            {/* Portfolio Overview */}
            <div className="bg-[#12121a] rounded-xl border border-white/10 p-4">
              <h3 className="text-white font-semibold mb-3">Your Holdings</h3>
              <div className="space-y-2">
                {holdings.slice(0, 5).map((holding) => (
                  <div key={holding.symbol} className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">{holding.symbol}</span>
                    <span className="text-xs text-white">{holding.allocation.toFixed(1)}%</span>
                  </div>
                ))}
                {holdings.length > 5 && (
                  <div className="text-xs text-gray-500">+{holdings.length - 5} more</div>
                )}
              </div>
            </div>
          </div>

          {/* Main Research Chat */}
          <div className="lg:col-span-3">
            <div className={`bg-gradient-to-r ${getTierColor(clientProfile.tier)} rounded-xl p-6 mb-6`}>
              <h1 className="text-2xl font-bold text-white mb-2">Research Assistant</h1>
              <p className="text-white/80">
                Ask me about your portfolio, market trends, or investment ideas. 
                {clientProfile.tier === 'sophisticated' && ' You have full access to advanced research capabilities.'}
                {clientProfile.tier === 'advanced' && ' You can ask about portfolio and market analysis.'}
                {clientProfile.tier === 'basic' && ' I can help with basic portfolio questions.'}
              </p>
            </div>

            {/* Chat Messages */}
            <div className="bg-[#12121a] rounded-xl border border-white/10 flex flex-col h-[600px]">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`${msg.role === 'user' ? 'ml-12' : 'mr-12'} ${
                      msg.role === 'user' 
                        ? 'bg-amber-600/30 border-amber-500/30' 
                        : 'bg-white/5 border-white/10'
                    } border rounded-xl p-4`}
                  >
                    <p className="text-white whitespace-pre-wrap text-sm">{msg.content}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="mr-12 bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-white/60">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <span className="text-sm ml-2">Researching...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-6 border-t border-white/10">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me about your portfolio or the markets..."
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-amber-400"
                    disabled={isLoading || clientProfile.usedQueries >= clientProfile.monthlyResearchQueries}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim() || clientProfile.usedQueries >= clientProfile.monthlyResearchQueries}
                    className="px-6 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 disabled:opacity-50 rounded-xl text-white font-medium transition-colors"
                  >
                    Ask
                  </button>
                </div>
                {clientProfile.usedQueries >= clientProfile.monthlyResearchQueries && (
                  <div className="mt-2 text-sm text-amber-500 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Monthly research limit reached. Contact your advisor for more access.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}