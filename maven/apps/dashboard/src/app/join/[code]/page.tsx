'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const inviteCode = params.code as string;
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [inviteData, setInviteData] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  
  // Check if invite code exists
  useEffect(() => {
    // In production, this would validate against the backend
    // For demo, check localStorage
    const clients = JSON.parse(localStorage.getItem('maven_invited_clients') || '[]');
    const invite = clients.find((c: any) => c.inviteCode === inviteCode);
    
    if (invite) {
      setInviteData(invite);
    }
    setLoading(false);
  }, [inviteCode]);
  
  const handleComplete = () => {
    // In production, this would create the account
    // For demo, just redirect to dashboard
    localStorage.setItem('maven_joined_as_partner', 'true');
    router.push('/dashboard');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl mx-auto mb-4 animate-pulse">
            M
          </div>
          <p className="text-gray-400">Validating invite...</p>
        </div>
      </div>
    );
  }
  
  if (!inviteData) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center text-3xl mx-auto mb-4">
            ❌
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Invalid Invite Code</h1>
          <p className="text-gray-400 mb-6">
            This invite code doesn't exist or has expired. Please contact your advisor for a new invite.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition"
          >
            Go to Maven
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition w-fit">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white">
              M
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Maven</h1>
              <p className="text-xs text-gray-500">Partners</p>
            </div>
          </Link>
        </div>
      </header>
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Welcome */}
        {step === 1 && (
          <div className="text-center">
            {/* Welcome Card */}
            <div className="bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-3xl p-8 mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
              
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl shadow-purple-500/20">
                  🎉
                </div>
                
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                  Welcome, {inviteData.firstName}!
                </h1>
                
                <p className="text-lg text-purple-200 mb-6">
                  You've been invited to Maven Partners — your AI-powered wealth intelligence platform.
                </p>
                
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm text-purple-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Exclusive invitation from your advisor
                </div>
              </div>
            </div>
            
            {/* What you get */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 mb-8 text-left">
              <h2 className="text-lg font-semibold text-white mb-4">As a Maven Partner, you get:</h2>
              <div className="space-y-3">
                {[
                  { icon: '📊', text: 'Complete view of your portfolio across all accounts' },
                  { icon: '🔮', text: 'AI-powered insights personalized to your situation' },
                  { icon: '📈', text: 'Interactive retirement projections and planning tools' },
                  { icon: '🤝', text: 'Collaborative planning with your advisor' },
                  { icon: '📱', text: 'Secure access anytime, anywhere' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-gray-300">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => setStep(2)}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold text-lg rounded-xl transition transform hover:scale-[1.02]"
            >
              Get Started →
            </button>
            
            <p className="text-sm text-gray-500 mt-4">
              Your invite code: <span className="font-mono text-gray-400">{inviteCode}</span>
            </p>
          </div>
        )}
        
        {/* Create Account */}
        {step === 2 && (
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl mx-auto mb-4">
                🔐
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Create Your Account</h1>
              <p className="text-gray-400">Secure your Maven Partners access</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Email Address</label>
                <input
                  type="email"
                  value={inviteData.email}
                  disabled
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-600 mt-1">This is the email your advisor registered you with</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Create Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                  placeholder="••••••••"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                  placeholder="••••••••"
                />
              </div>
              
              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="agree" className="text-sm text-gray-400">
                  I agree to the <a href="#" className="text-indigo-400 hover:underline">Terms of Service</a> and{' '}
                  <a href="#" className="text-indigo-400 hover:underline">Privacy Policy</a>. I understand that Maven 
                  provides financial information and education, not personalized investment advice.
                </label>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!password || password !== confirmPassword || !agreed}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-xl transition"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Accounts Connected */}
        {step === 3 && (
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-3xl mx-auto mb-4">
                ✨
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">You're All Set!</h1>
              <p className="text-gray-400">Your advisor has already connected your accounts</p>
            </div>
            
            {/* Mock connected accounts */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-400 mb-3">Connected Accounts:</p>
              <div className="space-y-2">
                {[
                  { name: 'Schwab Brokerage', type: 'Investment', balance: 275000 },
                  { name: 'Schwab 401(k)', type: 'Retirement', balance: 350000 },
                  { name: 'Schwab IRA', type: 'Retirement', balance: 180000 },
                ].map((acc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        ✓
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{acc.name}</p>
                        <p className="text-xs text-gray-500">{acc.type}</p>
                      </div>
                    </div>
                    <p className="font-medium text-white">${acc.balance.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 mb-6">
              <p className="text-sm text-indigo-300">
                <strong>Your advisor</strong> can see your portfolio and help you make better decisions. 
                They've configured Maven to show you personalized insights while keeping you informed.
              </p>
            </div>
            
            <button
              onClick={handleComplete}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold text-lg rounded-xl transition transform hover:scale-[1.02]"
            >
              Enter Maven Partners 🚀
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
