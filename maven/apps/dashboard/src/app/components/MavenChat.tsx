'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface StoredMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO string for storage
}

interface MavenChatProps {
  userProfile?: any;
  mode?: 'floating' | 'embedded' | 'fullscreen';
  showContext?: boolean;
}

const CHAT_STORAGE_KEY = 'maven_chat_history';
const CONVERSATION_ID_KEY = 'maven_conversation_id';
const MAX_STORED_MESSAGES = 100; // Increased for true conversation continuity

export default function MavenChat({ userProfile, mode = 'floating', showContext = false }: MavenChatProps) {
  const [isOpen, setIsOpen] = useState(mode !== 'floating');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(userProfile);
  const [showMenu, setShowMenu] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Sync profile from prop (takes precedence) or localStorage fallback
  useEffect(() => {
    // If userProfile prop is provided (e.g., from UserProvider/demo mode), use it
    if (userProfile) {
      setProfile(userProfile);
      return;
    }
    // Otherwise, try localStorage as fallback for guests
    const savedProfile = localStorage.getItem('maven_user_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfile(parsed);
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, [userProfile]);

  // Load chat history from localStorage
  useEffect(() => {
    if (historyLoaded) return;
    
    try {
      const savedHistory = localStorage.getItem(CHAT_STORAGE_KEY);
      const savedConversationId = localStorage.getItem(CONVERSATION_ID_KEY);
      
      if (savedHistory) {
        const parsed: StoredMessage[] = JSON.parse(savedHistory);
        const restored: Message[] = parsed.map(m => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        setMessages(restored);
      }
      
      if (savedConversationId) {
        setConversationId(savedConversationId);
      }
    } catch (e) {
      console.error('Failed to load chat history:', e);
    }
    
    setHistoryLoaded(true);
  }, [historyLoaded]);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (!historyLoaded) return; // Don't save until we've loaded
    if (messages.length === 0) return; // Don't save empty state
    
    try {
      const toStore: StoredMessage[] = messages.slice(-MAX_STORED_MESSAGES).map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp.toISOString()
      }));
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(toStore));
    } catch (e) {
      console.error('Failed to save chat history:', e);
    }
  }, [messages, historyLoaded]);

  // Save conversation ID when it changes
  useEffect(() => {
    if (conversationId) {
      localStorage.setItem(CONVERSATION_ID_KEY, conversationId);
    }
  }, [conversationId]);

  // Clear chat history
  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    localStorage.removeItem(CHAT_STORAGE_KEY);
    localStorage.removeItem(CONVERSATION_ID_KEY);
    setShowMenu(false);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    if (!showMenu) return;
    
    const handleClickOutside = () => setShowMenu(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  // Generate contextual welcome message based on user data
  const getWelcomeMessage = useCallback(() => {
    const welcomeName = profile?.firstName ? `, ${profile.firstName}` : '';
    
    // Calculate some stats for personalization
    const netWorth = calculateNetWorth(profile);
    const hasHoldings = profile?.retirementAccounts?.some((a: any) => a.holdings?.length) || 
                       profile?.investmentAccounts?.some((a: any) => a.holdings?.length);
    
    if (hasHoldings && netWorth > 0) {
      return `Hey${welcomeName}! 👋 I can see your portfolio — **$${netWorth.toLocaleString()}** across your accounts.

I'm scanning for opportunities. In the meantime, what's on your mind?

**Quick actions:**
• "Show me tax-loss harvest opportunities"
• "Am I overweight in any position?"
• "What should I do before year-end?"`;
    }
    
    if (profile?.firstName) {
      return `Hey${welcomeName}! 👋 I'm Maven, your AI wealth partner.

I notice you haven't connected any accounts yet. Once you do, I'll be able to:
• Spot tax-loss harvesting opportunities
• Analyze your allocation
• Find optimization possibilities

What can I help with today?`;
    }
    
    return `Hey! 👋 I'm Maven, your AI wealth partner.

I'm not just a chatbot — I'm designed to understand your complete financial picture and proactively guide you.

**What I can help with:**
• Portfolio analysis & allocation
• Tax optimization strategies
• Retirement planning
• Investment questions

What's on your mind?`;
  }, [profile]);

  // Add welcome message when chat opens (only if no history)
  useEffect(() => {
    if ((isOpen || mode !== 'floating') && messages.length === 0 && historyLoaded) {
      setMessages([{
        role: 'assistant',
        content: getWelcomeMessage(),
        timestamp: new Date()
      }]);
    }
  }, [isOpen, mode, getWelcomeMessage, historyLoaded]);

  // Handle pre-filled prompts from other pages
  useEffect(() => {
    if (isOpen || mode !== 'floating') {
      const prompt = localStorage.getItem('maven_chat_prompt');
      const autoSubmit = localStorage.getItem('maven_chat_autosubmit');
      if (prompt) {
        localStorage.removeItem('maven_chat_prompt');
        localStorage.removeItem('maven_chat_autosubmit');
        
        if (autoSubmit === 'true') {
          // Auto-submit the prompt immediately
          setTimeout(() => sendMessage(prompt), 100);
        } else {
          // Just populate the input
          setInput(prompt);
          inputRef.current?.focus();
        }
      }
    }
  }, [isOpen, mode]);
  
  // Listen for prompt events from Quick Actions
  useEffect(() => {
    const handlePromptEvent = () => {
      const prompt = localStorage.getItem('maven_chat_prompt');
      const autoSubmit = localStorage.getItem('maven_chat_autosubmit');
      if (prompt) {
        localStorage.removeItem('maven_chat_prompt');
        localStorage.removeItem('maven_chat_autosubmit');
        
        if (autoSubmit === 'true') {
          setTimeout(() => sendMessage(prompt), 100);
        } else {
          setInput(prompt);
          inputRef.current?.focus();
        }
      }
    };
    
    window.addEventListener('maven_prompt', handlePromptEvent);
    return () => window.removeEventListener('maven_prompt', handlePromptEvent);
  }, []);

  const sendMessage = async (overrideMessage?: string) => {
    const userMessage = (overrideMessage || input).trim();
    if (!userMessage || isTyping) return;

    setInput('');
    
    // Build new message
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    
    // Capture current messages before adding new one (for history)
    const previousMessages = [...messages];
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsTyping(true);

    try {
      // Send full conversation history so Claude maintains context across server restarts
      // Filter out the welcome message (first assistant message if it's a greeting)
      const historyForAPI = previousMessages
        .filter((m, idx) => {
          // Skip the auto-generated welcome message
          if (idx === 0 && m.role === 'assistant' && m.content.includes("I'm Maven")) {
            return false;
          }
          return true;
        })
        .map(m => ({ role: m.role, content: m.content }));
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationId,
          context: profile,
          history: historyForAPI // Full conversation history for continuity
        })
      });

      const data = await response.json();
      
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble processing that. Please try again!',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatMessage = (content: string) => {
    return content
      .split('\n')
      .map((line, i) => {
        // Bold
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>');
        // Inline code
        line = line.replace(/`(.*?)`/g, '<code class="bg-white/10 px-1 rounded">$1</code>');
        // Lists
        if (line.startsWith('• ') || line.startsWith('- ')) {
          return `<li class="ml-4 my-0.5">${line.slice(2)}</li>`;
        }
        if (line.match(/^\d+\./)) {
          return `<li class="ml-4 my-0.5">${line}</li>`;
        }
        // Headers
        if (line.startsWith('## ')) {
          return `<h3 class="font-semibold text-white mt-3 mb-1">${line.slice(3)}</h3>`;
        }
        return line;
      })
      .join('<br/>');
  };

  const quickPrompts = [
    "What tax moves should I make before year-end?",
    "Am I overweight in any single position?",
    "How's my asset allocation?",
    "Find tax-loss harvest opportunities"
  ];

  // Floating mode
  if (mode === 'floating') {
    return (
      <>
        {/* Floating Chat Button */}
        <button
          data-chat-toggle
          onClick={() => setIsOpen(!isOpen)}
          className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg transition-all z-50 flex items-center justify-center ${
            isOpen 
              ? 'bg-gray-700 hover:bg-gray-600' 
              : 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500'
          }`}
        >
          {isOpen ? (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          )}
        </button>

        {/* Floating Chat Window */}
        {isOpen && (
          <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-[#0f0f18] border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
            {renderChatContent()}
          </div>
        )}
      </>
    );
  }

  // Embedded or Fullscreen mode
  const containerClass = mode === 'fullscreen' 
    ? 'h-screen w-full bg-[#0a0a12]'
    : 'h-[600px] w-full bg-[#0f0f18] border border-white/10 rounded-2xl';

  return (
    <div className={containerClass + ' flex flex-col overflow-hidden'}>
      {renderChatContent()}
    </div>
  );

  function renderChatContent() {
    return (
      <>
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600/90 to-purple-600/90 px-4 py-3 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <span className="text-xl">🔮</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">Maven Oracle</h3>
            <p className="text-xs text-purple-200">
              {profile?.firstName ? `${profile.firstName}'s wealth partner` : 'Your AI wealth partner'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-purple-200">Online</span>
            </div>
            {/* Menu button */}
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="p-1.5 rounded-lg hover:bg-white/10 transition"
                title="Chat options"
              >
                <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
              {/* Dropdown menu */}
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-[#1a1a2e] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                  <button
                    onClick={clearChat}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/10 hover:text-white transition flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear chat
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Context Panel (optional) */}
        {showContext && profile && (
          <div className="px-4 py-2 bg-white/5 border-b border-white/10 text-xs text-gray-400">
            <div className="flex items-center gap-4">
              <span>💰 Net Worth: <strong className="text-white">${calculateNetWorth(profile).toLocaleString()}</strong></span>
              {profile.riskTolerance && (
                <span>📊 {profile.riskTolerance}</span>
              )}
              {countHoldings(profile) > 0 && (
                <span>📈 {countHoldings(profile)} holdings</span>
              )}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/5 border border-white/10 text-gray-200'
                }`}
              >
                <div 
                  className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                />
                <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-indigo-200' : 'text-gray-500'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(prompt)}
                  className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-gray-300 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything about your finances..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </>
    );
  }
}

// Helper functions
function calculateNetWorth(profile: any): number {
  if (!profile) return 0;
  
  const cash = profile.cashAccounts?.reduce((sum: number, acc: any) => sum + (acc.balance || 0), 0) || 0;
  const retirement = profile.retirementAccounts?.reduce((sum: number, acc: any) => sum + (acc.balance || 0), 0) || 0;
  const investment = profile.investmentAccounts?.reduce((sum: number, acc: any) => sum + (acc.balance || 0), 0) || 0;
  const other = (profile.realEstateEquity || 0) + (profile.cryptoValue || 0) + (profile.businessEquity || 0) + (profile.otherAssets || 0);
  const liabilities = profile.liabilities?.reduce((sum: number, l: any) => sum + (l.balance || 0), 0) || 0;
  
  return cash + retirement + investment + other - liabilities;
}

function countHoldings(profile: any): number {
  if (!profile) return 0;
  
  let count = 0;
  profile.retirementAccounts?.forEach((acc: any) => {
    count += acc.holdings?.length || 0;
  });
  profile.investmentAccounts?.forEach((acc: any) => {
    count += acc.holdings?.length || 0;
  });
  
  return count;
}
