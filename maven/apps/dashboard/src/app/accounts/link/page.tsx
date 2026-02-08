'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';

const INSTITUTIONS = [
  { id: 'schwab', name: 'Charles Schwab', logo: '💼', color: 'from-blue-600 to-blue-700', popular: true },
  { id: 'fidelity', name: 'Fidelity', logo: '🏛️', color: 'from-green-600 to-green-700', popular: true },
  { id: 'vanguard', name: 'Vanguard', logo: '⛵', color: 'from-red-600 to-red-700', popular: true },
  { id: 'etrade', name: 'E*TRADE', logo: '📈', color: 'from-purple-600 to-purple-700', popular: true },
  { id: 'td', name: 'TD Ameritrade', logo: '🏦', color: 'from-green-600 to-green-700', popular: false },
  { id: 'merrill', name: 'Merrill Lynch', logo: '🐂', color: 'from-blue-600 to-blue-700', popular: false },
  { id: 'morgan', name: 'Morgan Stanley', logo: '🏢', color: 'from-gray-600 to-gray-700', popular: false },
  { id: 'jpmorgan', name: 'J.P. Morgan', logo: '🏛️', color: 'from-blue-600 to-blue-700', popular: false },
  { id: 'goldman', name: 'Goldman Sachs', logo: '💎', color: 'from-yellow-600 to-yellow-700', popular: false },
  { id: 'robinhood', name: 'Robinhood', logo: '🪶', color: 'from-green-500 to-green-600', popular: true },
  { id: 'coinbase', name: 'Coinbase', logo: '₿', color: 'from-blue-500 to-blue-600', popular: true },
  { id: 'chase', name: 'Chase', logo: '🏧', color: 'from-blue-600 to-blue-700', popular: false },
];

export default function LinkAccountPage() {
  const [step, setStep] = useState<'select' | 'connect' | 'success'>('select');
  const [selectedInstitution, setSelectedInstitution] = useState<typeof INSTITUTIONS[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [connecting, setConnecting] = useState(false);
  
  const filteredInstitutions = INSTITUTIONS.filter(inst =>
    inst.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const popularInstitutions = filteredInstitutions.filter(i => i.popular);
  const otherInstitutions = filteredInstitutions.filter(i => !i.popular);
  
  const handleConnect = () => {
    setConnecting(true);
    // Simulate connection
    setTimeout(() => {
      setConnecting(false);
      setStep('success');
    }, 2000);
  };
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-6">
          <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
          <span>/</span>
          <span className="text-white">Link Account</span>
        </div>
        
        {/* Step: Select Institution */}
        {step === 'select' && (
          <div>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl mx-auto mb-4">
                🔗
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Link Your Accounts</h1>
              <p className="text-gray-400">Connect your financial accounts to see your complete picture</p>
            </div>
            
            {/* Search */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search for your bank or brokerage..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
            </div>
            
            {/* Popular Institutions */}
            {popularInstitutions.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-3">Popular</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {popularInstitutions.map(inst => (
                    <button
                      key={inst.id}
                      onClick={() => {
                        setSelectedInstitution(inst);
                        setStep('connect');
                      }}
                      className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-indigo-500/30 hover:bg-white/10 transition text-left"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${inst.color} flex items-center justify-center text-xl`}>
                        {inst.logo}
                      </div>
                      <span className="text-white text-sm font-medium">{inst.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Other Institutions */}
            {otherInstitutions.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-3">All Institutions</p>
                <div className="space-y-2">
                  {otherInstitutions.map(inst => (
                    <button
                      key={inst.id}
                      onClick={() => {
                        setSelectedInstitution(inst);
                        setStep('connect');
                      }}
                      className="flex items-center gap-3 w-full p-3 bg-white/5 border border-white/10 rounded-xl hover:border-indigo-500/30 hover:bg-white/10 transition text-left"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${inst.color} flex items-center justify-center text-xl`}>
                        {inst.logo}
                      </div>
                      <span className="text-white">{inst.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {filteredInstitutions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400">No institutions found</p>
                <p className="text-sm text-gray-500 mt-1">Try a different search term</p>
              </div>
            )}
            
            {/* Security Note */}
            <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <p className="text-sm text-white font-medium">Bank-level security</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Maven uses Plaid to securely connect your accounts. Your credentials are never stored 
                    on our servers. All data is encrypted with 256-bit encryption.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Step: Connect */}
        {step === 'connect' && selectedInstitution && (
          <div>
            <button
              onClick={() => setStep('select')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition mb-6"
            >
              ← Back
            </button>
            
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 sm:p-8">
              <div className="text-center mb-8">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedInstitution.color} flex items-center justify-center text-3xl mx-auto mb-4`}>
                  {selectedInstitution.logo}
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Connect {selectedInstitution.name}</h1>
                <p className="text-gray-400">Enter your credentials to securely link your account</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Username / Email</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                    placeholder="Enter your username"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                    placeholder="Enter your password"
                  />
                </div>
                
                <div className="pt-4">
                  <button
                    onClick={handleConnect}
                    disabled={connecting}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-medium rounded-xl transition flex items-center justify-center gap-2"
                  >
                    {connecting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        Connect Account
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>🔒</span>
                  <span>Your credentials are encrypted and never stored on Maven servers</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Step: Success */}
        {step === 'success' && selectedInstitution && (
          <div className="text-center">
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-4xl mx-auto mb-6">
                ✓
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-2">Account Connected!</h1>
              <p className="text-gray-400 mb-6">
                Your {selectedInstitution.name} account has been successfully linked to Maven.
              </p>
              
              {/* Mock connected accounts */}
              <div className="bg-white/5 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm text-gray-400 mb-3">Accounts found:</p>
                <div className="space-y-2">
                  {[
                    { name: `${selectedInstitution.name} Brokerage`, type: 'Investment', balance: 275000 },
                    { name: `${selectedInstitution.name} IRA`, type: 'Retirement', balance: 180000 },
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
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStep('select');
                    setSelectedInstitution(null);
                  }}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
                >
                  Link Another
                </button>
                <Link
                  href="/dashboard"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition text-center"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
