'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';

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

const QUICK_ACTIONS = [
  {
    id: 'analyze',
    label: '📊 Analyze Portfolio',
    prompt: 'Analyze this client\'s portfolio and provide insights on diversification, risk, and opportunities.',
    icon: '📊',
  },
  {
    id: 'meeting',
    label: '📅 Meeting Prep',
    prompt: 'Generate meeting prep for this client. Include portfolio summary, key discussion points, and action items.',
    icon: '📅',
  },
  {
    id: 'tax',
    label: '💰 Tax Opportunities',
    prompt: 'Analyze this portfolio for tax-loss harvesting opportunities, tax-efficient repositioning, and any tax concerns.',
    icon: '💰',
  },
  {
    id: 'stress',
    label: '⚡ Stress Test',
    prompt: 'Run a stress test on this portfolio. Show impact of -20% market drop, recession scenario, and recovery timeline.',
    icon: '⚡',
  },
  {
    id: 'rebalance',
    label: '⚖️ Rebalance',
    prompt: 'Analyze current allocation vs target. Suggest rebalancing trades to get back to target allocation.',
    icon: '⚖️',
  },
  {
    id: 'reallocate',
    label: '🔄 Reallocate',
    prompt: 'Suggest a complete reallocation strategy based on this client\'s risk tolerance and investment goals.',
    icon: '🔄',
  },
  {
    id: 'insights',
    label: '🔮 Key Insights',
    prompt: 'What are the most important things I should know about this client\'s portfolio right now? List 3-5 key insights.',
    icon: '🔮',
  },
  {
    id: 'questions',
    label: '❓ Interview Questions',
    prompt: 'Generate 5 thoughtful questions to ask this client about their financial situation, goals, or concerns.',
    icon: '❓',
  },
];

export default function AdvisorOracle({ client, compact = false }: AdvisorOracleProps) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(!compact);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add welcome message on mount
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMsg = client 
        ? `Hi${user?.firstName ? `, ${user.firstName}` : ''}! I'm Maven Oracle. I'm ready to help you with ${client.firstName} ${client.lastName}'s portfolio. Choose a quick action or ask me anything.`
        : `Hi${user?.firstName ? `, ${user.firstName}` : ''}! I'm Maven Oracle. Select a client to get started, or ask me general questions about portfolios, markets, or financial planning.`;
      
      setMessages([{ role: 'assistant', content: welcomeMsg }]);
    }
  }, [client, user]);

  const handleQuickAction = async (action: typeof QUICK_ACTIONS[0]) => {
    setSelectedAction(action.id);
    setInput(action.prompt);
    
    // Add user message
    const userMsg = { role: 'user' as const, content: action.prompt };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Build context for the query - send as structured object for API compatibility
      let context: any = null;
      if (client) {
        // Calculate age from date of birth if available
        let age: number | undefined;
        if (client.dateOfBirth) {
          const birthDate = new Date(client.dateOfBirth);
          const today = new Date();
          age = today.getFullYear() - birthDate.getFullYear();
        }
        
        context = {
          firstName: client.firstName,
          lastName: client.lastName,
          riskTolerance: client.riskTolerance,
          age,
          state: client.state || 'VA',
          netWorth: client.aum,
          totalInvestments: client.aum,
          retirementAccounts: client.accounts?.filter((a: any) => a.type?.includes('Retirement')).map((a: any) => ({
            name: a.name,
            type: a.type,
            balance: a.balance,
            holdings: client.holdings?.filter((h: any) => a.name.includes(h.ticker)) || [],
          })) || [],
          investmentAccounts: client.accounts?.filter((a: any) => !a.type?.includes('Retirement')).map((a: any) => ({
            name: a.name,
            type: a.type,
            balance: a.balance,
            holdings: client.holdings || [],
          })) || [],
          topHoldings: client.holdings?.map((h: any) => ({
            symbol: h.ticker,
            name: h.name,
            value: h.value,
            allocation: h.allocation,
          })) || [],
          assetAllocation: {
            usEquity: client.allocation?.usEquity || 0,
            intlEquity: client.allocation?.intlEquity || 0,
            bonds: client.allocation?.fixedIncome || 0,
            cash: client.allocation?.cash || 0,
            crypto: client.allocation?.crypto || 0,
            other: 0,
          },
        };
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: action.prompt,
          context,
          mode: 'advisor',
          clientId: client?.id,
        }),
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response || 'I apologize, but I had trouble generating a response. Please try again.' 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
      setSelectedAction(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build context for the query - send as structured object for API compatibility
      let context: any = null;
      if (client) {
        // Calculate age from date of birth if available
        let age: number | undefined;
        if (client.dateOfBirth) {
          const birthDate = new Date(client.dateOfBirth);
          const today = new Date();
          age = today.getFullYear() - birthDate.getFullYear();
        }
        
        context = {
          firstName: client.firstName,
          lastName: client.lastName,
          riskTolerance: client.riskTolerance,
          age,
          state: client.state || 'VA',
          netWorth: client.aum,
          totalInvestments: client.aum,
          retirementAccounts: client.accounts?.filter((a: any) => a.type?.includes('Retirement')).map((a: any) => ({
            name: a.name,
            type: a.type,
            balance: a.balance,
            holdings: client.holdings?.filter((h: any) => a.name.includes(h.ticker)) || [],
          })) || [],
          investmentAccounts: client.accounts?.filter((a: any) => !a.type?.includes('Retirement')).map((a: any) => ({
            name: a.name,
            type: a.type,
            balance: a.balance,
            holdings: client.holdings || [],
          })) || [],
          topHoldings: client.holdings?.map((h: any) => ({
            symbol: h.ticker,
            name: h.name,
            value: h.value,
            allocation: h.allocation,
          })) || [],
          assetAllocation: {
            usEquity: client.allocation?.usEquity || 0,
            intlEquity: client.allocation?.intlEquity || 0,
            bonds: client.allocation?.fixedIncome || 0,
            cash: client.allocation?.cash || 0,
            crypto: client.allocation?.crypto || 0,
            other: 0,
          },
        };
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          context,
          mode: 'advisor',
          clientId: client?.id,
        }),
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response || 'I apologize, but I had trouble generating a response. Please try again.' 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
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
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔮</span>
          <div>
            <h3 className="font-semibold text-white text-sm">Maven Oracle</h3>
            {client && (
              <p className="text-xs text-white/70">
                {client.firstName} {client.lastName}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {client && (
            <span className="text-xs bg-white/20 px-2 py-1 rounded text-white">
              ${(client.aum / 1000).toFixed(0)}K AUM
            </span>
          )}
          {compact && (
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {client && (
        <div className="px-3 py-2 bg-white/5 border-b border-white/10 overflow-x-auto shrink-0">
          <div className="flex gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                disabled={isLoading}
                className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full whitespace-nowrap transition disabled:opacity-50"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`${msg.role === 'user' ? 'ml-8' : 'mr-8'} ${
              msg.role === 'user' 
                ? 'bg-indigo-600/30 border-indigo-500/30' 
                : 'bg-white/5 border-white/10'
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

      {/* Input */}
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
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
