'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

const REFERRAL_CODE = 'SAMADAMS2026';
const REFERRAL_LINK = `https://maven.com/join?ref=${REFERRAL_CODE}`;

const MOCK_REFERRALS = [
  { name: 'John D.', status: 'active', date: new Date('2026-01-15'), reward: 50 },
  { name: 'Sarah M.', status: 'pending', date: new Date('2026-02-01'), reward: 0 },
];

const REWARDS_TIERS = [
  { referrals: 1, reward: '$50 credit', icon: '🎁' },
  { referrals: 3, reward: '1 month free', icon: '🗓️' },
  { referrals: 5, reward: '3 months free', icon: '🏆' },
  { referrals: 10, reward: 'Free for life', icon: '👑' },
];

export default function ReferPage() {
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const totalReferred = MOCK_REFERRALS.length;
  const activeReferrals = MOCK_REFERRALS.filter(r => r.status === 'active').length;
  const totalEarned = MOCK_REFERRALS.reduce((sum, r) => sum + r.reward, 0);
  
  const copyLink = () => {
    navigator.clipboard.writeText(REFERRAL_LINK);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const currentTier = REWARDS_TIERS.findIndex(t => totalReferred < t.referrals);
  const nextTier = REWARDS_TIERS[currentTier] || REWARDS_TIERS[REWARDS_TIERS.length - 1];
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-4xl mx-auto mb-4">
            🎁
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Invite Friends, Earn Rewards</h1>
          <p className="text-gray-400">Give friends $50 off, get $50 credit for each signup</p>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{totalReferred}</p>
            <p className="text-sm text-gray-500">Referred</p>
          </div>
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{activeReferrals}</p>
            <p className="text-sm text-gray-500">Active</p>
          </div>
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">${totalEarned}</p>
            <p className="text-sm text-gray-500">Earned</p>
          </div>
        </div>
        
        {/* Referral Link */}
        <div className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 border border-amber-500/30 rounded-2xl p-6 mb-8">
          <p className="text-amber-300 text-sm mb-2">Your referral link</p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={REFERRAL_LINK}
              className="flex-1 px-4 py-3 bg-black/30 border border-amber-500/30 rounded-xl text-white font-mono text-sm"
            />
            <button
              onClick={copyLink}
              className={`px-4 py-3 rounded-xl transition flex items-center gap-2 ${
                copied 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-amber-600 hover:bg-amber-500 text-white'
              }`}
            >
              {copied ? '✓ Copied' : '📋 Copy'}
            </button>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setShowShareModal(true)}
              className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition text-sm"
            >
              📱 Share
            </button>
            <button
              onClick={() => window.open(`mailto:?subject=Check out Maven&body=I've been using Maven for wealth management and it's amazing! Sign up with my link and get $50 off: ${REFERRAL_LINK}`)}
              className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition text-sm"
            >
              ✉️ Email
            </button>
            <button
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=I've been using @MavenWealth for AI-powered wealth management. Check it out: ${REFERRAL_LINK}`)}
              className="flex-1 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition text-sm"
            >
              🐦 Tweet
            </button>
          </div>
        </div>
        
        {/* Rewards Tiers */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Rewards Tiers</h3>
          
          <div className="space-y-3">
            {REWARDS_TIERS.map((tier, idx) => {
              const achieved = totalReferred >= tier.referrals;
              const isCurrent = currentTier === idx;
              
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-4 p-3 rounded-xl transition ${
                    achieved 
                      ? 'bg-emerald-500/10 border border-emerald-500/30' 
                      : isCurrent
                      ? 'bg-amber-500/10 border border-amber-500/30'
                      : 'bg-white/5 border border-white/10'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                    achieved ? 'bg-emerald-500/20' : 'bg-white/10'
                  }`}>
                    {achieved ? '✓' : tier.icon}
                  </div>
                  <div className="flex-1">
                    <p className={achieved ? 'text-emerald-400' : 'text-white'}>
                      {tier.referrals} referral{tier.referrals !== 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-gray-500">{tier.reward}</p>
                  </div>
                  {achieved && (
                    <span className="text-xs text-emerald-400">Unlocked!</span>
                  )}
                  {isCurrent && (
                    <span className="text-xs text-amber-400">
                      {tier.referrals - totalReferred} more to go
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Referral History */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">Your Referrals</h3>
          </div>
          
          {MOCK_REFERRALS.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No referrals yet. Share your link to get started!</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {MOCK_REFERRALS.map((referral, idx) => (
                <div key={idx} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {referral.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white">{referral.name}</p>
                      <p className="text-sm text-gray-500">
                        {referral.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      referral.status === 'active' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {referral.status === 'active' ? 'Active' : 'Pending'}
                    </span>
                    {referral.reward > 0 && (
                      <p className="text-sm text-emerald-400 mt-1">+${referral.reward}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Terms */}
        <p className="text-xs text-gray-600 text-center mt-6">
          Referral rewards are applied as account credits. See{' '}
          <a href="#" className="text-indigo-400 hover:underline">terms and conditions</a>.
        </p>
      </main>
      
      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Share Maven</h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '💬', label: 'Messages', color: 'from-green-500 to-green-600' },
                { icon: '📘', label: 'Facebook', color: 'from-blue-600 to-blue-700' },
                { icon: '💼', label: 'LinkedIn', color: 'from-blue-500 to-blue-600' },
                { icon: '📷', label: 'Instagram', color: 'from-pink-500 to-purple-500' },
              ].map((platform, idx) => (
                <button
                  key={idx}
                  className={`p-4 rounded-xl bg-gradient-to-br ${platform.color} text-white transition hover:opacity-90`}
                >
                  <span className="text-2xl block mb-1">{platform.icon}</span>
                  <span className="text-sm">{platform.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
