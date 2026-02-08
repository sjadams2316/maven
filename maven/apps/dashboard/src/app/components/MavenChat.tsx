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
  timestamp: string;
}

interface MavenChatProps {
  userProfile?: any;
  mode?: 'floating' | 'embedded' | 'fullscreen';
  showContext?: boolean;
}

const CHAT_STORAGE_KEY = 'maven_chat_history';
const CONVERSATION_ID_KEY = 'maven_conversation_id';
const MAX_STORED_MESSAGES = 100;

export default function MavenChat({ userProfile, mode = 'floating', showContext = false }: MavenChatProps) {
  const [isOpen, setIsOpen] = useState(mode !== 'floating');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(userProfile);
  const [showMenu, setShowMenu] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [claudeEnabled, setClaudeEnabled] = useState<boolean | null>(null);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Check if Claude is enabled on mount
  useEffect(() => {
    fetch('/api/chat')
      .then(res => res.json())
      .then(data => setClaudeEnabled(data.claudeEnabled))
      .catch(() => setClaudeEnabled(false));
  }, []);

  // Only scroll to bottom on NEW messages, not on initial load
  const scrollToBottom = useCallback((force = false) => {
    if (!messagesContainerRef.current) return;
    
    const container = messagesContainerRef.current;
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    
    if (force || isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Scroll when user sends message or assistant responds
  useEffect(() => {
    if (messages.length > 1) {
      scrollToBottom(true);
    }
  }, [messages.length, scrollToBottom]);

  // Sync profile
  useEffect(() => {
    if (userProfile) {
      setProfile(userProfile);
      return;
    }
    const savedProfile = localStorage.getItem('maven_user_profile');
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch { /* ignore */ }
    }
  }, [userProfile]);

  // Load chat history
  useEffect(() => {
    if (historyLoaded) return;
    
    try {
      const savedHistory = localStorage.getItem(CHAT_STORAGE_KEY);
      const savedConversationId = localStorage.getItem(CONVERSATION_ID_KEY);
      
      if (savedHistory) {
        const parsed: StoredMessage[] = JSON.parse(savedHistory);
        setMessages(parsed.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
      }
      
      if (savedConversationId) {
        setConversationId(savedConversationId);
      }
    } catch (e) {
      console.error('Failed to load chat history:', e);
    }
    
    setHistoryLoaded(true);
  }, [historyLoaded]);

  // Save chat history
  useEffect(() => {
    if (!historyLoaded || messages.length === 0) return;
    
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

  useEffect(() => {
    if (conversationId) {
      localStorage.setItem(CONVERSATION_ID_KEY, conversationId);
    }
  }, [conversationId]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    localStorage.removeItem(CHAT_STORAGE_KEY);
    localStorage.removeItem(CONVERSATION_ID_KEY);
    setShowMenu(false);
  }, []);

  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = () => setShowMenu(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  const getWelcomeMessage = useCallback(() => {
    const welcomeName = profile?.firstName ? `, ${profile.firstName}` : '';
    const netWorth = calculateNetWorth(profile);
    const hasHoldings = profile?.retirementAccounts?.some((a: any) => a.holdings?.length) || 
                       profile?.investmentAccounts?.some((a: any) => a.holdings?.length);
    
    if (hasHoldings && netWorth > 0) {
      return `Welcome back${welcomeName}. I can see your portfolio — **$${netWorth.toLocaleString()}** across your accounts.

I'm ready to help with analysis, planning, or any questions you have.`;
    }
    
    if (profile?.firstName) {
      return `Welcome${welcomeName}. I'm Maven Oracle — your AI wealth partner.

Once you connect your accounts, I'll be able to provide personalized insights on your portfolio.

What can I help you with today?`;
    }
    
    return `Welcome to Maven Oracle.

I'm designed to understand your complete financial picture and provide intelligent guidance.

**I can help with:**
• Portfolio analysis & optimization
• Tax strategies
• Retirement planning
• Investment research

What's on your mind?`;
  }, [profile]);

  // Add welcome message when chat opens
  useEffect(() => {
    if ((isOpen || mode !== 'floating') && messages.length === 0 && historyLoaded) {
      setMessages([{
        role: 'assistant',
        content: getWelcomeMessage(),
        timestamp: new Date()
      }]);
    }
  }, [isOpen, mode, getWelcomeMessage, historyLoaded, messages.length]);

  // Handle opening animation
  const handleOpen = () => {
    setIsAnimatingIn(true);
    setIsOpen(true);
    setTimeout(() => setIsAnimatingIn(false), 300);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Handle pre-filled prompts
  useEffect(() => {
    if (isOpen || mode !== 'floating') {
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
    }
  }, [isOpen, mode]);
  
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

  // Focus input when Oracle opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen || mode !== 'floating') return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, mode]);

  const sendMessage = async (overrideMessage?: string) => {
    const userMessage = (overrideMessage || input).trim();
    if (!userMessage || isTyping) return;

    setInput('');
    
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    
    const previousMessages = [...messages];
    setMessages(prev => [...prev, newUserMessage]);
    setIsTyping(true);

    try {
      const historyForAPI = previousMessages
        .filter((m, idx) => !(idx === 0 && m.role === 'assistant' && m.content.includes("Maven")))
        .map(m => ({ role: m.role, content: m.content }));
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationId,
          context: profile,
          history: historyForAPI
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
        content: 'I encountered an issue processing that request. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatMessage = (content: string) => {
    return content
      .split('\n')
      .map((line) => {
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
        line = line.replace(/`(.*?)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-purple-300 font-mono text-xs">$1</code>');
        if (line.startsWith('• ') || line.startsWith('- ')) {
          return `<li class="ml-4 my-1">${line.slice(2)}</li>`;
        }
        if (line.match(/^\d+\./)) {
          return `<li class="ml-4 my-1">${line}</li>`;
        }
        if (line.startsWith('## ')) {
          return `<h3 class="font-semibold text-white mt-4 mb-2 text-base">${line.slice(3)}</h3>`;
        }
        return line;
      })
      .join('<br/>');
  };

  const quickPrompts = [
    "Analyze my portfolio allocation",
    "Find tax-loss harvest opportunities",
    "What's the market outlook?",
    "Review my retirement plan"
  ];

  // Floating mode with premium overlay
  if (mode === 'floating') {
    return (
      <>
        {/* Global Styles for Oracle */}
        <style jsx global>{`
          @keyframes maven-orb-pulse {
            0%, 100% {
              transform: scale(1);
              box-shadow: 0 0 30px rgba(139, 92, 246, 0.6), 0 0 60px rgba(139, 92, 246, 0.4), 0 0 90px rgba(139, 92, 246, 0.2), 0 4px 20px rgba(0, 0, 0, 0.5);
            }
            50% {
              transform: scale(1.08);
              box-shadow: 0 0 40px rgba(139, 92, 246, 0.8), 0 0 80px rgba(139, 92, 246, 0.5), 0 0 120px rgba(139, 92, 246, 0.3), 0 4px 30px rgba(0, 0, 0, 0.5);
            }
          }
          @keyframes oracle-fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes oracle-ambient-1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(50px, -30px) scale(1.1); }
          }
          @keyframes oracle-ambient-2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-40px, 20px) scale(1.15); }
          }
          @keyframes oracle-thinking {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.5); opacity: 1; }
          }
          @keyframes oracle-message-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Floating Orb Button */}
        <button
          data-chat-toggle
          onClick={isOpen ? handleClose : handleOpen}
          className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl transition-all duration-300 z-[60] flex items-center justify-center ${
            isOpen 
              ? 'bg-gray-800 hover:bg-gray-700 scale-90' 
              : 'bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 hover:scale-110'
          }`}
          style={!isOpen ? {
            animation: 'maven-orb-pulse 4s ease-in-out infinite',
            boxShadow: '0 0 30px rgba(139, 92, 246, 0.6), 0 0 60px rgba(139, 92, 246, 0.4), 0 0 90px rgba(139, 92, 246, 0.2), 0 4px 20px rgba(0, 0, 0, 0.5)'
          } : undefined}
        >
          {isOpen ? (
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <span className="text-3xl" style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' }}>🔮</span>
          )}
        </button>

        {/* Full-screen Overlay Experience */}
        {isOpen && (
          <div 
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 transition-all duration-300 ${
              isAnimatingIn ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
            style={{ animation: isAnimatingIn ? 'none' : 'oracle-fade-in 0.3s ease-out' }}
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={handleClose}
            />
            
            {/* Ambient Background Effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div 
                className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full opacity-20"
                style={{
                  background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
                  animation: 'oracle-ambient-1 8s ease-in-out infinite'
                }}
              />
              <div 
                className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-20"
                style={{
                  background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
                  animation: 'oracle-ambient-2 10s ease-in-out infinite'
                }}
              />
            </div>
            
            {/* Main Oracle Container */}
            <div className="relative w-full max-w-4xl h-[85vh] max-h-[800px] bg-gradient-to-b from-[#12121f] to-[#0a0a14] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
              {/* Subtle top border glow */}
              <div className="absolute top-0 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
              
              {renderOracleContent()}
            </div>
          </div>
        )}
      </>
    );
  }

  // Embedded or Fullscreen mode
  const containerClass = mode === 'fullscreen' 
    ? 'h-screen w-full bg-[#0a0a12]'
    : 'h-[700px] w-full bg-gradient-to-b from-[#12121f] to-[#0a0a14] border border-white/10 rounded-2xl';

  return (
    <div className={containerClass + ' flex flex-col overflow-hidden'}>
      {renderOracleContent()}
    </div>
  );

  function renderOracleContent() {
    return (
      <>
        {/* Header */}
        <div className="relative px-6 py-5 flex items-center gap-4 border-b border-white/5">
          {/* Orb Icon */}
          <div className="relative">
            <div 
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg"
              style={{ boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' }}
            >
              <span className="text-2xl">🔮</span>
            </div>
            {/* Status indicator */}
            <span 
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#12121f] ${
                claudeEnabled ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
              style={{ boxShadow: claudeEnabled ? '0 0 8px rgba(52, 211, 153, 0.6)' : '0 0 8px rgba(251, 191, 36, 0.6)' }}
            />
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white tracking-tight">Maven Oracle</h2>
            <p className="text-sm text-gray-400">
              {claudeEnabled === null ? 'Initializing...' : claudeEnabled ? 'AI-Powered Wealth Intelligence' : 'Limited Mode Active'}
            </p>
          </div>
          
          {/* Menu */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-2.5 rounded-xl hover:bg-white/5 transition text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                <button
                  onClick={clearChat}
                  className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white transition flex items-center gap-3"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear conversation
                </button>
              </div>
            )}
          </div>
          
          {/* Close button for floating mode */}
          {mode === 'floating' && (
            <button
              onClick={handleClose}
              className="p-2.5 rounded-xl hover:bg-white/5 transition text-gray-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Context Bar */}
        {showContext && profile && (
          <div className="px-6 py-3 bg-white/[0.02] border-b border-white/5 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <span className="text-emerald-400">💰</span>
              <span>Net Worth: <strong className="text-white">${calculateNetWorth(profile).toLocaleString()}</strong></span>
            </div>
            {profile.riskTolerance && (
              <div className="flex items-center gap-2 text-gray-400">
                <span>📊</span>
                <span>{profile.riskTolerance} Risk</span>
              </div>
            )}
            {countHoldings(profile) > 0 && (
              <div className="flex items-center gap-2 text-gray-400">
                <span>📈</span>
                <span>{countHoldings(profile)} holdings</span>
              </div>
            )}
          </div>
        )}

        {/* Messages Area */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-6 py-6"
        >
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                style={{ animation: 'oracle-message-in 0.3s ease-out' }}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <span className="text-sm">🔮</span>
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-4 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg'
                      : 'bg-white/[0.03] border border-white/[0.06] text-gray-200'
                  }`}
                  style={msg.role === 'user' ? { 
                    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)' 
                  } : undefined}
                >
                  <div 
                    className="text-[15px] leading-relaxed prose prose-invert prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                  />
                  <p className={`text-xs mt-3 ${msg.role === 'user' ? 'text-indigo-200' : 'text-gray-500'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Premium Thinking Indicator */}
            {isTyping && (
              <div className="flex justify-start" style={{ animation: 'oracle-message-in 0.3s ease-out' }}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                  <span className="text-sm">🔮</span>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <span 
                          key={i}
                          className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-violet-400 to-indigo-400"
                          style={{ 
                            animation: 'oracle-thinking 1.4s ease-in-out infinite',
                            animationDelay: `${i * 0.2}s`
                          }} 
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-400">Oracle is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div className="px-6 pb-4">
            <div className="max-w-3xl mx-auto">
              <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">Suggested</p>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendMessage(prompt)}
                    className="text-sm px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-purple-500/30 rounded-xl text-gray-300 hover:text-white transition-all duration-200"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="px-6 py-5 border-t border-white/5 bg-white/[0.01]">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask Oracle anything about your finances..."
                  rows={1}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-4 text-[15px] text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 resize-none transition-all"
                  style={{ minHeight: '56px', maxHeight: '150px' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 150) + 'px';
                  }}
                />
              </div>
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isTyping}
                className="px-6 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-purple-500/20 flex items-center gap-2 font-medium"
              >
                <span>Send</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Press Enter to send • Shift+Enter for new line • Esc to close
            </p>
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
