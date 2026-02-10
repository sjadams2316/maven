'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const DEMO_CLIENT = {
  id: '1',
  name: 'Robert & Linda Chen',
  aum: 1250000,
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "What's their current asset allocation?",
  "Any tax-loss harvesting opportunities?",
  "How exposed are they to a tech crash?",
  "Should they rebalance soon?",
  "What's their retirement readiness?",
];

export default function ClientOracle() {
  const params = useParams();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `I'm ready to help you analyze ${DEMO_CLIENT.name}'s portfolio. Their current AUM is $${(DEMO_CLIENT.aum / 1000000).toFixed(2)}M. What would you like to know?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    
    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (in production, call actual API)
    setTimeout(() => {
      const responses: Record<string, string> = {
        "What's their current asset allocation?": `Based on ${DEMO_CLIENT.name}'s portfolio:\n\n• **US Stocks:** 48% ($600K)\n• **Bonds:** 20% ($250K)\n• **International:** 18% ($225K)\n• **Individual Stocks:** 14% ($175K)\n\nTheir allocation is slightly aggressive for their age, with higher equity exposure than the typical 60/40 benchmark.`,
        "Any tax-loss harvesting opportunities?": `Yes! I found one opportunity:\n\n• **VXUS** has an unrealized loss of **$8,200**\n\nAt their 37.75% combined tax rate, harvesting this could save approximately **$3,100** in taxes. I'd recommend swapping to a similar international fund like IXUS to maintain exposure while capturing the loss.`,
        "How exposed are they to a tech crash?": `${DEMO_CLIENT.name} has moderate tech exposure:\n\n• **AAPL:** 12.5% ($156K)\n• **MSFT:** 10% ($125K)\n• **Tech in VTI:** ~8% ($100K estimated)\n\n**Total tech exposure: ~30%**\n\nThis is above average. A 30% tech correction would impact their portfolio by approximately **-9%** ($112K). Consider discussing diversification if they're concerned about concentration risk.`,
        default: `That's a great question about ${DEMO_CLIENT.name}'s portfolio. Based on my analysis of their holdings, I can provide insights on their allocation, risk exposure, and optimization opportunities. Would you like me to dive deeper into any specific area?`,
      };

      const response = responses[text] || responses.default;
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-2 text-sm mb-4">
          <Link href="/partners/clients" className="text-gray-400 hover:text-white">Clients</Link>
          <span className="text-gray-600">/</span>
          <Link href={`/partners/clients/${params.id}`} className="text-gray-400 hover:text-white">{DEMO_CLIENT.name}</Link>
          <span className="text-gray-600">/</span>
          <span className="text-amber-500">Oracle</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Oracle Chat</h1>
            <p className="text-gray-400">AI-powered analysis for {DEMO_CLIENT.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm">
              Advisor Mode
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white/10 text-gray-100'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 p-4 rounded-2xl">
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <span>Analyzing portfolio...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length < 3 && (
        <div className="px-6 pb-4">
          <div className="text-gray-500 text-sm mb-2">Suggested questions:</div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-6 border-t border-white/10">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Ask about ${DEMO_CLIENT.name}'s portfolio...`}
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 min-h-[48px]"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-medium min-h-[48px]"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
