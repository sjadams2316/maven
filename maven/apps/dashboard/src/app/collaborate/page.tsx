'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';
import { useUserProfile } from '@/providers/UserProvider';

interface Session {
  id: string;
  sessionCode: string;
  advisorName?: string;
  clientName?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function CollaborateLanding() {
  const router = useRouter();
  const { profile, financials } = useUserProfile();
  const [creating, setCreating] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch existing sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch('/api/collab-session');
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions || []);
        }
      } catch (err) {
        console.error('Error fetching sessions:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessions();
  }, []);
  
  // Create new session
  const handleCreate = async () => {
    setCreating(true);
    
    try {
      // Use current user's financial data as starting point
      const planningState = {
        retirementAge: 65,
        annualContribution: 30000,
        expectedReturn: 7,
        socialSecurityMonthly: 2500,
        socialSecurityStartAge: 67,
        currentAge: profile?.dateOfBirth 
          ? Math.floor((Date.now() - new Date(profile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          : 35,
        currentInvestments: financials 
          ? (financials.totalRetirement || 0) + (financials.totalInvestments || 0)
          : 100000
      };
      
      const res = await fetch('/api/collab-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          name: profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}`.trim() : 'Advisor',
          planningState
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        router.push(`/collaborate/${data.sessionCode}`);
      } else {
        alert('Failed to create session');
      }
    } catch (err) {
      console.error('Error creating session:', err);
      alert('Failed to create session');
    } finally {
      setCreating(false);
    }
  };
  
  // Join existing session
  const handleJoin = () => {
    const code = joinCode.trim().toUpperCase();
    if (code) {
      router.push(`/collaborate/${code}`);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-4xl mx-auto mb-6">
            🤝
          </div>
          <h1 className="text-3xl font-bold mb-4">Live Collaborative Planning</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Plan together in real-time. Share your screen with clients, adjust assumptions together, 
            and watch projections update live. Like Google Docs for financial planning.
          </p>
        </div>
        
        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Start New Session */}
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-6">
            <div className="text-3xl mb-4">🎬</div>
            <h2 className="text-xl font-semibold mb-2">Start New Session</h2>
            <p className="text-gray-400 text-sm mb-6">
              Create a planning session and share the link with your client. 
              They&apos;ll see everything update in real-time.
            </p>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold rounded-lg transition disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Session →'}
            </button>
          </div>
          
          {/* Join Session */}
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-6">
            <div className="text-3xl mb-4">🔗</div>
            <h2 className="text-xl font-semibold mb-2">Join Session</h2>
            <p className="text-gray-400 text-sm mb-6">
              Enter a session code shared by your advisor or planning partner.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="MAVEN-XXXXXX"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 font-mono focus:outline-none focus:border-indigo-500"
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              />
              <button
                onClick={handleJoin}
                disabled={!joinCode.trim()}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition disabled:opacity-50"
              >
                Join
              </button>
            </div>
          </div>
        </div>
        
        {/* Recent Sessions */}
        {sessions.length > 0 && (
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Sessions</h2>
            <div className="space-y-3">
              {sessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/collaborate/${session.sessionCode}`}
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-lg transition"
                >
                  <div>
                    <div className="font-mono text-indigo-400">{session.sessionCode}</div>
                    <div className="text-sm text-gray-400">
                      {session.clientName 
                        ? `With ${session.clientName}` 
                        : 'Waiting for client to join'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm ${
                      session.status === 'active' ? 'text-green-400' : 'text-gray-500'
                    }`}>
                      {session.status === 'active' ? '● Active' : 'Ended'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Features */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold mb-2">Real-Time Sync</h3>
            <p className="text-sm text-gray-400">
              Both participants see slider changes instantly. No refresh needed.
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="font-semibold mb-2">Built-In Chat</h3>
            <p className="text-sm text-gray-400">
              Discuss scenarios and ask questions without leaving the session.
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold mb-2">Visual Projections</h3>
            <p className="text-sm text-gray-400">
              Animated wealth journey chart updates as you adjust parameters.
            </p>
          </div>
        </div>
        
        {/* How It Works */}
        <div className="mt-16 text-center">
          <h2 className="text-xl font-semibold mb-8">How It Works</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">1</div>
              <span className="text-gray-300">Advisor creates session</span>
            </div>
            <div className="text-gray-600">→</div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">2</div>
              <span className="text-gray-300">Share code with client</span>
            </div>
            <div className="text-gray-600">→</div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">3</div>
              <span className="text-gray-300">Plan together live</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
