'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';

export default function InviteClientPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    initialAUM: '',
    riskTolerance: 'moderate',
    investmentGoal: '',
    notes: '',
  });
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);
  
  const generateInviteCode = () => {
    // Generate a random 8-character code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };
  
  const handleSubmit = () => {
    // In production, this would create the client record and generate invite
    const code = generateInviteCode();
    setInviteCode(code);
    setStep(3);
    
    // Save to localStorage for demo
    const clients = JSON.parse(localStorage.getItem('maven_invited_clients') || '[]');
    clients.push({
      ...formData,
      inviteCode: code,
      status: 'invited',
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('maven_invited_clients', JSON.stringify(clients));
  };
  
  const copyInviteLink = () => {
    const link = `${window.location.origin}/join/${inviteCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const inviteLink = inviteCode ? `${typeof window !== 'undefined' ? window.location.origin : ''}/join/${inviteCode}` : '';
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-6">
          <Link href="/advisor" className="hover:text-white transition">Advisor</Link>
          <span>/</span>
          <Link href="/advisor/clients" className="hover:text-white transition">Clients</Link>
          <span>/</span>
          <span className="text-white">Invite</span>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition ${
                step >= s 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white/10 text-gray-500'
              }`}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-0.5 ${step > s ? 'bg-indigo-600' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>
        
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl mx-auto mb-4">
                👤
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Invite New Client</h1>
              <p className="text-gray-400">Add their basic information to create a Maven Partners invite</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                    placeholder="Sam"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                    placeholder="Adams"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                  placeholder="sam@example.com"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                  placeholder="(555) 123-4567"
                />
              </div>
              
              <div className="pt-4">
                <button
                  onClick={() => setStep(2)}
                  disabled={!formData.firstName || !formData.lastName || !formData.email}
                  className="w-full py-3 min-h-[48px] bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-xl transition"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 2: Investment Profile */}
        {step === 2 && (
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-3xl mx-auto mb-4">
                📊
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Investment Profile</h1>
              <p className="text-gray-400">Help Maven understand {formData.firstName}'s needs</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Estimated Assets Under Management</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="text"
                    value={formData.initialAUM}
                    onChange={(e) => setFormData({ ...formData, initialAUM: e.target.value })}
                    className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                    placeholder="500,000"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-3 block">Risk Tolerance</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'conservative', label: 'Conservative', icon: '🛡️' },
                    { value: 'moderate', label: 'Moderate', icon: '⚖️' },
                    { value: 'aggressive', label: 'Aggressive', icon: '🚀' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFormData({ ...formData, riskTolerance: option.value })}
                      className={`p-4 min-h-[48px] rounded-xl border transition text-center ${
                        formData.riskTolerance === option.value
                          ? 'bg-indigo-600/20 border-indigo-500 text-white'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{option.icon}</span>
                      <span className="text-sm">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Primary Investment Goal</label>
                <select
                  value={formData.investmentGoal}
                  onChange={(e) => setFormData({ ...formData, investmentGoal: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                >
                  <option value="">Select a goal...</option>
                  <option value="growth">Long-term Growth</option>
                  <option value="income">Income Generation</option>
                  <option value="preservation">Capital Preservation</option>
                  <option value="retirement">Retirement Planning</option>
                  <option value="education">Education Funding</option>
                  <option value="estate">Estate Planning</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Notes (optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none"
                  placeholder="Any initial notes about this client..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 min-h-[48px] bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 min-h-[48px] bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition"
                >
                  Generate Invite
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 3: Invite Generated */}
        {step === 3 && (
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-3xl mx-auto mb-4">
                ✅
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Invite Created!</h1>
              <p className="text-gray-400">Share this with {formData.firstName} to onboard them to Maven Partners</p>
            </div>
            
            {/* Invite Code Display */}
            <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-xl p-6 mb-6">
              <p className="text-sm text-indigo-300 mb-2 text-center">Invite Code</p>
              <p className="text-4xl font-mono font-bold text-white text-center tracking-wider">
                {inviteCode}
              </p>
            </div>
            
            {/* Invite Link */}
            <div className="mb-6">
              <label className="text-sm text-gray-400 mb-2 block">Or share this link:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="flex-1 px-4 py-3 min-h-[48px] bg-white/5 border border-white/10 rounded-xl text-white text-sm font-mono"
                />
                <button
                  onClick={copyInviteLink}
                  className={`px-4 py-3 min-h-[48px] rounded-xl transition flex items-center gap-2 ${
                    copied 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {copied ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
            </div>
            
            {/* Welcome Card Preview */}
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-3">Welcome Card Preview:</p>
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/20 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold">
                      M
                    </div>
                    <div>
                      <p className="font-bold text-white">Maven Partners</p>
                      <p className="text-xs text-gray-400">AI Wealth Intelligence</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-white/10 pt-4 mt-4">
                    <p className="text-sm text-gray-400 mb-1">Welcome,</p>
                    <p className="text-xl font-semibold text-white mb-3">{formData.firstName} {formData.lastName}</p>
                    <p className="text-xs text-gray-500">Your invite code:</p>
                    <p className="font-mono text-lg text-indigo-400">{inviteCode}</p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/10 text-center">
                    <p className="text-xs text-gray-500">Member since 2026</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  // In production, this would send an email
                  alert(`Email invite would be sent to ${formData.email}`);
                }}
                className="w-full py-3 min-h-[48px] bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition flex items-center justify-center gap-2"
              >
                <span>📧</span>
                <span>Email Invite to {formData.firstName}</span>
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setStep(1);
                    setFormData({
                      firstName: '',
                      lastName: '',
                      email: '',
                      phone: '',
                      initialAUM: '',
                      riskTolerance: 'moderate',
                      investmentGoal: '',
                      notes: '',
                    });
                    setInviteCode('');
                  }}
                  className="py-3 min-h-[48px] bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition"
                >
                  Invite Another
                </button>
                <Link
                  href="/advisor/clients"
                  className="py-3 min-h-[48px] bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition text-center flex items-center justify-center"
                >
                  View All Clients
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
