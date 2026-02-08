'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  avatar: string;
  netWorth: number;
  accounts: number;
  lastActivity: Date;
  age?: number;
}

const MOCK_FAMILY: FamilyMember[] = [
  {
    id: '1',
    name: 'Sam Adams',
    relationship: 'You',
    avatar: '👨',
    netWorth: 1150000,
    accounts: 6,
    lastActivity: new Date(),
    age: 32,
  },
  {
    id: '2',
    name: 'Sammie Adams',
    relationship: 'Spouse',
    avatar: '👩',
    netWorth: 320000,
    accounts: 3,
    lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    age: 31,
  },
  {
    id: '3',
    name: 'Banks Adams',
    relationship: 'Son',
    avatar: '👦',
    netWorth: 28000,
    accounts: 1,
    lastActivity: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    age: 4,
  },
  {
    id: '4',
    name: 'Navy Adams',
    relationship: 'Daughter',
    avatar: '👧',
    netWorth: 12000,
    accounts: 1,
    lastActivity: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    age: 2,
  },
  {
    id: '5',
    name: 'Jon Adams',
    relationship: 'Father',
    avatar: '👴',
    netWorth: 2800000,
    accounts: 8,
    lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    age: 64,
  },
  {
    id: '6',
    name: 'Kelly Adams',
    relationship: 'Mother',
    avatar: '👵',
    netWorth: 450000,
    accounts: 4,
    lastActivity: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    age: 62,
  },
];

function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export default function FamilyPage() {
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  
  const totalFamilyWealth = MOCK_FAMILY.reduce((sum, m) => sum + m.netWorth, 0);
  const householdWealth = MOCK_FAMILY.filter(m => ['You', 'Spouse'].includes(m.relationship))
    .reduce((sum, m) => sum + m.netWorth, 0);
  const kidsWealth = MOCK_FAMILY.filter(m => ['Son', 'Daughter'].includes(m.relationship))
    .reduce((sum, m) => sum + m.netWorth, 0);
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Family Wealth</h1>
            <p className="text-gray-400 mt-1">Multi-generational wealth overview</p>
          </div>
          
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition flex items-center gap-2">
            <span>+</span>
            <span>Add Family Member</span>
          </button>
        </div>
        
        {/* Summary Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-5">
            <p className="text-indigo-300 text-sm mb-1">Total Family Wealth</p>
            <p className="text-3xl font-bold text-white">{formatCurrency(totalFamilyWealth)}</p>
            <p className="text-sm text-indigo-400 mt-1">{MOCK_FAMILY.length} members</p>
          </div>
          
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-5">
            <p className="text-gray-400 text-sm mb-1">Your Household</p>
            <p className="text-3xl font-bold text-white">{formatCurrency(householdWealth)}</p>
            <p className="text-sm text-gray-500 mt-1">Sam + Sammie</p>
          </div>
          
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-5">
            <p className="text-gray-400 text-sm mb-1">Kids' Accounts</p>
            <p className="text-3xl font-bold text-emerald-400">{formatCurrency(kidsWealth)}</p>
            <p className="text-sm text-gray-500 mt-1">529 + UTMA</p>
          </div>
        </div>
        
        {/* Family Tree Visual */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-6">Family Tree</h2>
          
          <div className="flex flex-col items-center">
            {/* Parents (Jon & Kelly) */}
            <div className="flex gap-8 mb-4">
              {MOCK_FAMILY.filter(m => ['Father', 'Mother'].includes(m.relationship)).map(member => (
                <button
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className="flex flex-col items-center p-4 rounded-xl hover:bg-white/5 transition"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-3xl mb-2 ring-2 ring-amber-500/30">
                    {member.avatar}
                  </div>
                  <p className="text-white font-medium text-sm">{member.name.split(' ')[0]}</p>
                  <p className="text-xs text-gray-500">{member.relationship}</p>
                  <p className="text-sm text-emerald-400 mt-1">{formatCurrency(member.netWorth)}</p>
                </button>
              ))}
            </div>
            
            {/* Connection Line */}
            <div className="w-0.5 h-8 bg-white/20" />
            
            {/* You & Spouse */}
            <div className="flex gap-8 mb-4">
              {MOCK_FAMILY.filter(m => ['You', 'Spouse'].includes(m.relationship)).map(member => (
                <button
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className="flex flex-col items-center p-4 rounded-xl hover:bg-white/5 transition"
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-2 ring-2 ${
                    member.relationship === 'You' 
                      ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 ring-indigo-500/50' 
                      : 'bg-gradient-to-br from-pink-500/20 to-rose-500/20 ring-pink-500/30'
                  }`}>
                    {member.avatar}
                  </div>
                  <p className="text-white font-medium text-sm">{member.name.split(' ')[0]}</p>
                  <p className="text-xs text-gray-500">{member.relationship}</p>
                  <p className="text-sm text-emerald-400 mt-1">{formatCurrency(member.netWorth)}</p>
                </button>
              ))}
            </div>
            
            {/* Connection Line */}
            <div className="w-0.5 h-8 bg-white/20" />
            
            {/* Kids */}
            <div className="flex gap-8">
              {MOCK_FAMILY.filter(m => ['Son', 'Daughter'].includes(m.relationship)).map(member => (
                <button
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className="flex flex-col items-center p-4 rounded-xl hover:bg-white/5 transition"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-3xl mb-2 ring-2 ring-emerald-500/30">
                    {member.avatar}
                  </div>
                  <p className="text-white font-medium text-sm">{member.name.split(' ')[0]}</p>
                  <p className="text-xs text-gray-500">{member.relationship}, {member.age}</p>
                  <p className="text-sm text-emerald-400 mt-1">{formatCurrency(member.netWorth)}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Family Members List */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">All Family Members</h2>
          </div>
          
          <div className="divide-y divide-white/5">
            {MOCK_FAMILY.map(member => (
              <button
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className="flex items-center gap-4 p-4 w-full hover:bg-white/5 transition text-left"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                  member.relationship === 'You' ? 'bg-indigo-500/20 ring-2 ring-indigo-500/50' :
                  member.relationship === 'Spouse' ? 'bg-pink-500/20' :
                  ['Father', 'Mother'].includes(member.relationship) ? 'bg-amber-500/20' :
                  'bg-emerald-500/20'
                }`}>
                  {member.avatar}
                </div>
                
                <div className="flex-1">
                  <p className="font-medium text-white">{member.name}</p>
                  <p className="text-sm text-gray-500">{member.relationship}{member.age ? `, ${member.age}` : ''}</p>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-white">{formatCurrency(member.netWorth)}</p>
                  <p className="text-xs text-gray-500">{member.accounts} accounts</p>
                </div>
                
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-gray-500">Last active</p>
                  <p className="text-sm text-gray-400">{getRelativeTime(member.lastActivity)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Insights */}
        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="text-amber-300 font-medium">Estate Planning Opportunity</p>
                <p className="text-sm text-amber-200/70 mt-1">
                  Your parents' combined wealth of {formatCurrency(MOCK_FAMILY.filter(m => ['Father', 'Mother'].includes(m.relationship)).reduce((s, m) => s + m.netWorth, 0))} may benefit from gifting strategies to reduce estate taxes.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📈</span>
              <div>
                <p className="text-emerald-300 font-medium">529 Contribution Room</p>
                <p className="text-sm text-emerald-200/70 mt-1">
                  Banks and Navy's 529 plans can each receive up to $18,000/year tax-free. Consider front-loading contributions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-3xl">
                  {selectedMember.avatar}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{selectedMember.name}</h2>
                  <p className="text-gray-500">{selectedMember.relationship}{selectedMember.age ? `, ${selectedMember.age}` : ''}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Net Worth</p>
                <p className="text-xl font-bold text-white">{formatCurrency(selectedMember.netWorth)}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Accounts</p>
                <p className="text-xl font-bold text-white">{selectedMember.accounts}</p>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-500 mb-2">Account Breakdown</p>
              <div className="space-y-2">
                {selectedMember.relationship === 'You' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">401(k)</span>
                      <span className="text-white">$83,000</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">IRA</span>
                      <span className="text-white">$150,000</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Brokerage</span>
                      <span className="text-white">$103,000</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">CIFR + IREN</span>
                      <span className="text-white">$130,000</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">TAO (215 tokens)</span>
                      <span className="text-white">$684,000</span>
                    </div>
                  </>
                )}
                {['Son', 'Daughter'].includes(selectedMember.relationship) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">529 Plan</span>
                    <span className="text-white">{formatCurrency(selectedMember.netWorth)}</span>
                  </div>
                )}
                {!['You', 'Son', 'Daughter'].includes(selectedMember.relationship) && (
                  <p className="text-sm text-gray-500">Detailed breakdown requires account linking</p>
                )}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition">
                View Details
              </button>
              {selectedMember.relationship !== 'You' && (
                <button className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition">
                  Link Accounts
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
