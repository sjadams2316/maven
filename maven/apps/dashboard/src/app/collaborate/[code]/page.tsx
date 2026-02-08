'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import WealthJourneyChart from '../../components/WealthJourneyChart';

interface Participant {
  id: string;
  name: string;
  role: 'advisor' | 'client';
  lastSeen: string;
  cursor: { x: number; y: number; element?: string } | null;
}

interface PlanningState {
  retirementAge: number;
  annualContribution: number;
  expectedReturn: number;
  socialSecurityMonthly: number;
  socialSecurityStartAge: number;
  currentAge: number;
  currentInvestments: number;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

interface Message {
  id?: string;
  sender: string;
  senderName: string;
  role: string;
  content: string;
  timestamp: string;
}

interface Session {
  id: string;
  sessionCode: string;
  advisorName?: string;
  clientName?: string;
  status: string;
  planningState: PlanningState;
  participants: Participant[];
  messages: Message[];
}

export default function CollaborativePlanning() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;
  
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const [participantName, setParticipantName] = useState('');
  const [participantId, setParticipantId] = useState<string>('');
  const [participantRole, setParticipantRole] = useState<'advisor' | 'client'>('client');
  
  // Local planning state (synced with server)
  const [localState, setLocalState] = useState<PlanningState>({
    retirementAge: 65,
    annualContribution: 30000,
    expectedReturn: 7,
    socialSecurityMonthly: 2500,
    socialSecurityStartAge: 67,
    currentAge: 35,
    currentInvestments: 100000
  });
  
  // Chat
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Polling interval
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<string>('');
  
  // Fetch session data
  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch(`/api/collab-session?code=${code}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError('Session not found. Please check the code and try again.');
        } else {
          throw new Error('Failed to fetch session');
        }
        return;
      }
      
      const data = await res.json();
      setSession(data);
      
      // Only update local state if it changed from server
      if (data.planningState) {
        const serverStateStr = JSON.stringify(data.planningState);
        if (serverStateStr !== lastUpdateRef.current) {
          setLocalState(data.planningState);
          lastUpdateRef.current = serverStateStr;
        }
      }
      
      if (data.messages) {
        setMessages(data.messages);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching session:', err);
      setError('Failed to load session');
      setLoading(false);
    }
  }, [code]);
  
  // Initial fetch
  useEffect(() => {
    fetchSession();
  }, [fetchSession]);
  
  // Polling for real-time updates
  useEffect(() => {
    if (joined && session?.status === 'active') {
      pollIntervalRef.current = setInterval(fetchSession, 500);
      
      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [joined, session?.status, fetchSession]);
  
  // Join session
  const handleJoin = async () => {
    if (!participantName.trim()) return;
    
    try {
      const res = await fetch('/api/collab-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          sessionCode: code,
          name: participantName,
          role: participantRole
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setSession(data.session);
        setParticipantId(`guest-${Date.now()}`);
        setJoined(true);
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to join session');
      }
    } catch (err) {
      console.error('Error joining session:', err);
      setError('Failed to join session');
    }
  };
  
  // Update planning state
  const updateState = async (updates: Partial<PlanningState>) => {
    const newState = { ...localState, ...updates };
    setLocalState(newState);
    lastUpdateRef.current = JSON.stringify(newState);
    
    try {
      await fetch('/api/collab-session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionCode: code,
          planningState: updates,
          participantId
        })
      });
    } catch (err) {
      console.error('Error updating state:', err);
    }
  };
  
  // Send chat message
  const sendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    const message: Message = {
      sender: participantId,
      senderName: participantName,
      role: participantRole,
      content: chatMessage,
      timestamp: new Date().toISOString()
    };
    
    // Optimistic update
    setMessages(prev => [...prev, message]);
    setChatMessage('');
    
    try {
      await fetch('/api/collab-session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionCode: code,
          message,
          participantId
        })
      });
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };
  
  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Calculate projections
  const projection = (() => {
    let portfolio = localState.currentInvestments;
    const yearsToRetirement = localState.retirementAge - localState.currentAge;
    
    for (let i = 0; i < yearsToRetirement; i++) {
      portfolio = portfolio * (1 + localState.expectedReturn / 100) + localState.annualContribution;
    }
    
    const portfolioIncome = portfolio * 0.04;
    const ssIncome = localState.socialSecurityMonthly * 12;
    
    return {
      portfolioAtRetirement: portfolio,
      annualIncome: portfolioIncome + ssIncome,
      monthlyIncome: (portfolioIncome + ssIncome) / 12
    };
  })();
  
  // Format currency
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    maximumFractionDigits: 0 
  }).format(n);
  
  // Get active participants (seen in last 10 seconds)
  const activeParticipants = (session?.participants || []).filter(p => {
    const lastSeen = new Date(p.lastSeen).getTime();
    return Date.now() - lastSeen < 10000;
  });
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold mx-auto mb-4 animate-pulse">
            M
          </div>
          <p className="text-gray-400">Loading collaborative session...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center text-3xl mx-auto mb-4">
            ⚠️
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Session Error</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link href="/" className="text-indigo-400 hover:text-indigo-300">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }
  
  // Join screen
  if (!joined) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold mx-auto mb-4">
              M
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Join Planning Session</h1>
            <p className="text-gray-400">
              Session Code: <span className="text-indigo-400 font-mono">{code}</span>
            </p>
            {session?.advisorName && (
              <p className="text-gray-500 text-sm mt-2">
                Hosted by {session.advisorName}
              </p>
            )}
          </div>
          
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Your Name</label>
              <input
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Your Role</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setParticipantRole('client')}
                  className={`flex-1 py-3 rounded-lg border transition ${
                    participantRole === 'client'
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  👤 Client
                </button>
                <button
                  onClick={() => setParticipantRole('advisor')}
                  className={`flex-1 py-3 rounded-lg border transition ${
                    participantRole === 'advisor'
                      ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  🎓 Advisor
                </button>
              </div>
            </div>
            
            <button
              onClick={handleJoin}
              disabled={!participantName.trim()}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join Session →
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Main collaborative planning view
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold">
                M
              </div>
              <span className="font-semibold hidden sm:block">Maven</span>
            </Link>
            <div className="h-6 w-px bg-white/10" />
            <div>
              <span className="text-sm text-gray-400">Collaborative Planning</span>
              <span className="text-xs text-indigo-400 font-mono ml-2">{code}</span>
            </div>
          </div>
          
          {/* Participants */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {activeParticipants.map((p, i) => (
                <div
                  key={p.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-[#0a0a0f] ${
                    p.role === 'advisor' 
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                      : 'bg-gradient-to-br from-indigo-500 to-cyan-500'
                  }`}
                  title={`${p.name} (${p.role})`}
                >
                  {p.name.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-gray-400">
                {activeParticipants.length} online
              </span>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex h-[calc(100vh-57px)]">
        {/* Main Planning Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
                <div className="text-sm text-gray-400 mb-1">Portfolio at Retirement</div>
                <div className="text-2xl font-bold text-white">{fmt(projection.portfolioAtRetirement)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Age {localState.retirementAge}
                </div>
              </div>
              <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
                <div className="text-sm text-gray-400 mb-1">Annual Retirement Income</div>
                <div className="text-2xl font-bold text-emerald-400">{fmt(projection.annualIncome)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  4% withdrawal + Social Security
                </div>
              </div>
              <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
                <div className="text-sm text-gray-400 mb-1">Monthly Income</div>
                <div className="text-2xl font-bold text-white">{fmt(projection.monthlyIncome)}</div>
                <div className="text-xs text-gray-500 mt-1">
                  After retirement
                </div>
              </div>
            </div>
            
            {/* Interactive Sliders */}
            <div className="bg-[#12121a] border border-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                🎛️ Planning Parameters
                <span className="text-xs text-gray-500 font-normal">
                  Changes sync in real-time
                </span>
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Retirement Age */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-gray-400">Retirement Age</label>
                    <span className="text-sm font-medium text-indigo-400">{localState.retirementAge}</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="75"
                    value={localState.retirementAge}
                    onChange={(e) => updateState({ retirementAge: parseInt(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>50</span>
                    <span>75</span>
                  </div>
                </div>
                
                {/* Annual Contribution */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-gray-400">Annual Contribution</label>
                    <span className="text-sm font-medium text-indigo-400">{fmt(localState.annualContribution)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="1000"
                    value={localState.annualContribution}
                    onChange={(e) => updateState({ annualContribution: parseInt(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>$0</span>
                    <span>$100K</span>
                  </div>
                </div>
                
                {/* Expected Return */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-gray-400">Expected Return</label>
                    <span className="text-sm font-medium text-indigo-400">{localState.expectedReturn}%</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="12"
                    step="0.5"
                    value={localState.expectedReturn}
                    onChange={(e) => updateState({ expectedReturn: parseFloat(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>3%</span>
                    <span>12%</span>
                  </div>
                </div>
                
                {/* Social Security */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-gray-400">Social Security (Monthly)</label>
                    <span className="text-sm font-medium text-indigo-400">{fmt(localState.socialSecurityMonthly)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    value={localState.socialSecurityMonthly}
                    onChange={(e) => updateState({ socialSecurityMonthly: parseInt(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>$0</span>
                    <span>$5,000</span>
                  </div>
                </div>
                
                {/* SS Start Age */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-gray-400">SS Start Age</label>
                    <span className="text-sm font-medium text-indigo-400">{localState.socialSecurityStartAge}</span>
                  </div>
                  <input
                    type="range"
                    min="62"
                    max="70"
                    value={localState.socialSecurityStartAge}
                    onChange={(e) => updateState({ socialSecurityStartAge: parseInt(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>62</span>
                    <span>70</span>
                  </div>
                </div>
                
                {/* Current Investments */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm text-gray-400">Current Investments</label>
                    <span className="text-sm font-medium text-indigo-400">{fmt(localState.currentInvestments)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2000000"
                    step="10000"
                    value={localState.currentInvestments}
                    onChange={(e) => updateState({ currentInvestments: parseInt(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>$0</span>
                    <span>$2M</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Wealth Journey Chart */}
            <div className="bg-[#12121a] border border-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">📈 Wealth Projection</h2>
              <WealthJourneyChart
                currentAge={localState.currentAge}
                currentInvestments={localState.currentInvestments}
                retirementAge={localState.retirementAge}
                annualContribution={localState.annualContribution}
                expectedReturn={localState.expectedReturn}
                socialSecurityMonthly={localState.socialSecurityMonthly}
                socialSecurityStartAge={localState.socialSecurityStartAge}
              />
            </div>
          </div>
        </div>
        
        {/* Chat Sidebar */}
        <div className="w-80 border-l border-white/10 flex flex-col bg-[#0d0d14]">
          <div className="p-4 border-b border-white/10">
            <h3 className="font-semibold flex items-center gap-2">
              💬 Discussion
            </h3>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-8">
                No messages yet. Start the conversation!
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`${
                  msg.sender === participantId ? 'ml-4' : 'mr-4'
                }`}
              >
                <div className={`rounded-lg p-3 ${
                  msg.sender === participantId
                    ? 'bg-indigo-500/20 border border-indigo-500/30'
                    : 'bg-white/5 border border-white/10'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium ${
                      msg.role === 'advisor' ? 'text-purple-400' : 'text-indigo-400'
                    }`}>
                      {msg.senderName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          
          {/* Message Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={sendMessage}
                disabled={!chatMessage.trim()}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg transition disabled:opacity-50"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
