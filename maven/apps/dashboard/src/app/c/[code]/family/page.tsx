'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  DEMO_JS123_HOUSEHOLD, 
  formatCurrency, 
  getHouseholdByCode,
  FamilyHousehold,
} from '@/lib/demo-family';
import { FamilyMemberCard } from '@/components/client-portal/FamilyMemberCard';

// Loading skeleton
function FamilySkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-white/10 rounded" />
      <div className="bg-white/5 rounded-3xl p-8 h-32" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white/5 rounded-2xl p-6 h-40" />
        ))}
      </div>
    </div>
  );
}

export default function FamilyPage() {
  const params = useParams<{ code: string }>();
  const [loading, setLoading] = useState(true);
  const [household, setHousehold] = useState<FamilyHousehold | null>(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      const data = getHouseholdByCode(params.code);
      setHousehold(data || DEMO_JS123_HOUSEHOLD);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [params.code]);

  if (loading || !household) {
    return <FamilySkeleton />;
  }

  // Calculate household summary
  const totalRetirement = household.accounts
    .filter(a => a.type.includes('401') || a.type.includes('IRA'))
    .reduce((sum, a) => sum + a.balance, 0);
  
  const totalEducation = household.accounts
    .filter(a => a.type === '529 Plan' || a.type === 'UTMA' || a.type === 'UGMA')
    .reduce((sum, a) => sum + a.balance, 0);
  
  const totalCash = household.accounts
    .filter(a => a.type === 'Checking' || a.type === 'High-Yield Savings' || a.type === 'Savings')
    .reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Your Family
        </h1>
        <p className="text-gray-400">
          {household.householdName} • {household.members.length} members
        </p>
      </div>

      {/* Household Summary Card */}
      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-xl">
            👨‍👩‍👧‍👦
          </div>
          <div>
            <h2 className="text-white font-semibold">Household Overview</h2>
            <p className="text-gray-500 text-sm">Combined family wealth</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Net Worth */}
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Assets</p>
            <p className="text-white font-bold text-xl">{formatCurrency(household.totalNetWorth)}</p>
          </div>
          
          {/* Retirement */}
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Retirement</p>
            <p className="text-emerald-400 font-bold text-xl">{formatCurrency(totalRetirement)}</p>
          </div>
          
          {/* Education */}
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Education</p>
            <p className="text-purple-400 font-bold text-xl">{formatCurrency(totalEducation)}</p>
          </div>
          
          {/* Cash */}
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Cash & Savings</p>
            <p className="text-blue-400 font-bold text-xl">{formatCurrency(totalCash)}</p>
          </div>
        </div>
      </div>

      {/* Family Members Grid */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Family Members</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {household.members.map(member => (
            <FamilyMemberCard 
              key={member.id} 
              member={member} 
              code={params.code}
            />
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="text-2xl">✨</div>
          <div>
            <p className="text-white font-medium mb-1">Your family finances are in good hands</p>
            <p className="text-gray-400 text-sm">
              {household.totalAccounts} accounts across {household.members.length} family members. 
              All beneficiary designations are up to date.
            </p>
          </div>
        </div>
      </div>

      {/* Accounts Summary by Type */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Account Summary</h2>
        <div className="space-y-2">
          {/* Group accounts by type */}
          {Array.from(new Set(household.accounts.map(a => a.type))).map(type => {
            const typeAccounts = household.accounts.filter(a => a.type === type);
            const total = typeAccounts.reduce((sum, a) => sum + a.balance, 0);
            const icon = typeAccounts[0]?.icon || '💰';
            
            return (
              <div 
                key={type}
                className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{icon}</span>
                  <div>
                    <p className="text-white font-medium">{type}</p>
                    <p className="text-gray-500 text-xs">{typeAccounts.length} account{typeAccounts.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <p className="text-white font-semibold">{formatCurrency(total)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
