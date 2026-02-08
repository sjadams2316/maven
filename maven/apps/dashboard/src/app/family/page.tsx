'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import { useUserProfile } from '@/providers/UserProvider';

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

function calculateAge(dateOfBirth?: string): number | undefined {
  if (!dateOfBirth) return undefined;
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export default function FamilyPage() {
  const { profile, financials } = useUserProfile();
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  // Build family members from profile
  const familyMembers = useMemo((): FamilyMember[] => {
    const members: FamilyMember[] = [];
    
    // Primary user (from profile)
    const userName = profile?.firstName && profile?.lastName 
      ? `${profile.firstName} ${profile.lastName}`
      : profile?.firstName || 'You';
    
    members.push({
      id: 'primary',
      name: userName,
      relationship: 'You',
      avatar: '👤',
      netWorth: financials?.netWorth ?? 0,
      accounts: (profile?.cashAccounts?.length || 0) + 
                (profile?.retirementAccounts?.length || 0) + 
                (profile?.investmentAccounts?.length || 0),
      lastActivity: new Date(),
      age: calculateAge(profile?.dateOfBirth),
    });
    
    // Spouse (if social security has spouse info)
    if (profile?.socialSecurity?.spouseDOB) {
      const spouseAge = calculateAge(profile.socialSecurity.spouseDOB);
      // Estimate spouse's benefit as their net worth contribution
      const spouseEstimatedAssets = profile.socialSecurity.spouseBenefitAtFRA 
        ? profile.socialSecurity.spouseBenefitAtFRA * 12 * 15 // 15 years of benefits as rough estimate
        : 0;
      
      members.push({
        id: 'spouse',
        name: 'Spouse',
        relationship: 'Spouse',
        avatar: '💑',
        netWorth: spouseEstimatedAssets,
        accounts: 0,
        lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        age: spouseAge,
      });
    }
    
    // If no real data, show placeholder for demo
    if (members.length === 1 && !profile?.firstName) {
      return [
        {
          id: 'demo-1',
          name: 'Demo User',
          relationship: 'You',
          avatar: '👤',
          netWorth: financials?.netWorth ?? 0,
          accounts: 0,
          lastActivity: new Date(),
        }
      ];
    }
    
    return members;
  }, [profile, financials]);

  const totalFamilyNetWorth = familyMembers.reduce((sum, m) => sum + m.netWorth, 0);

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      <Header profile={profile} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Family Dashboard
            </h1>
            <p className="text-gray-400 mt-1">
              Multi-generational wealth overview
            </p>
          </div>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm transition">
            + Invite Family Member
          </button>
        </div>

        {/* Total Family Net Worth */}
        <div className="bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 border border-indigo-500/30 rounded-2xl p-6 mb-8">
          <p className="text-gray-400 text-sm mb-1">Total Family Net Worth</p>
          <p className="text-4xl font-bold text-white">{formatCurrency(totalFamilyNetWorth)}</p>
          <p className="text-sm text-gray-400 mt-2">
            Across {familyMembers.length} {familyMembers.length === 1 ? 'member' : 'members'} • {familyMembers.reduce((sum, m) => sum + m.accounts, 0)} accounts
          </p>
        </div>

        {/* Family Members Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {familyMembers.map((member) => (
            <button
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className={`text-left p-6 rounded-2xl border transition-all ${
                selectedMember?.id === member.id
                  ? 'bg-indigo-600/20 border-indigo-500/50'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center text-2xl">
                  {member.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{member.name}</h3>
                  <p className="text-sm text-gray-400">{member.relationship}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Net Worth</span>
                  <span className="text-white font-medium">{formatCurrency(member.netWorth)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Accounts</span>
                  <span className="text-white">{member.accounts}</span>
                </div>
                {member.age && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Age</span>
                    <span className="text-white">{member.age}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Last Active</span>
                  <span className="text-gray-300 text-sm">{getRelativeTime(member.lastActivity)}</span>
                </div>
              </div>
              
              {/* Contribution to family net worth */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Family Share</span>
                  <span className="text-indigo-400 font-medium">
                    {totalFamilyNetWorth > 0 
                      ? ((member.netWorth / totalFamilyNetWorth) * 100).toFixed(1) 
                      : 0}%
                  </span>
                </div>
                <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    style={{ 
                      width: `${totalFamilyNetWorth > 0 
                        ? (member.netWorth / totalFamilyNetWorth) * 100 
                        : 0}%` 
                    }}
                  />
                </div>
              </div>
            </button>
          ))}
          
          {/* Add Family Member Card */}
          <button
            className="p-6 rounded-2xl border border-dashed border-white/20 hover:border-indigo-500/50 hover:bg-indigo-600/10 transition-all flex flex-col items-center justify-center min-h-[200px]"
          >
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-2xl mb-3">
              ➕
            </div>
            <p className="text-gray-400 font-medium">Add Family Member</p>
            <p className="text-gray-500 text-sm mt-1">Invite spouse, children, or parents</p>
          </button>
        </div>

        {/* Selected Member Detail */}
        {selectedMember && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center text-3xl">
                  {selectedMember.avatar}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedMember.name}</h2>
                  <p className="text-gray-400">{selectedMember.relationship} {selectedMember.age ? `• Age ${selectedMember.age}` : ''}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedMember(null)}
                className="text-gray-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>
            
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-gray-400 text-sm">Net Worth</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(selectedMember.netWorth)}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-gray-400 text-sm">Linked Accounts</p>
                <p className="text-2xl font-bold text-white">{selectedMember.accounts}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-gray-400 text-sm">Family Share</p>
                <p className="text-2xl font-bold text-indigo-400">
                  {totalFamilyNetWorth > 0 
                    ? ((selectedMember.netWorth / totalFamilyNetWorth) * 100).toFixed(1) 
                    : 0}%
                </p>
              </div>
            </div>
            
            {selectedMember.relationship === 'You' && (
              <div className="mt-6 p-4 bg-indigo-600/10 border border-indigo-500/30 rounded-xl">
                <p className="text-indigo-300 text-sm">
                  💡 This is your profile. Your net worth is calculated from all linked accounts and assets.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Features Coming Soon */}
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 opacity-60">
            <div className="text-2xl mb-2">🎓</div>
            <h3 className="font-semibold text-white mb-1">529 Plan Tracking</h3>
            <p className="text-gray-400 text-sm">Track education savings for children</p>
            <span className="text-xs text-indigo-400 mt-2 inline-block">Coming Soon</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 opacity-60">
            <div className="text-2xl mb-2">📜</div>
            <h3 className="font-semibold text-white mb-1">Estate Planning</h3>
            <p className="text-gray-400 text-sm">Inheritance and wealth transfer</p>
            <span className="text-xs text-indigo-400 mt-2 inline-block">Coming Soon</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 opacity-60">
            <div className="text-2xl mb-2">🔗</div>
            <h3 className="font-semibold text-white mb-1">Shared Accounts</h3>
            <p className="text-gray-400 text-sm">Joint account management</p>
            <span className="text-xs text-indigo-400 mt-2 inline-block">Coming Soon</span>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
