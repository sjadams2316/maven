'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import MavenChat from '../components/MavenChat';
import { useUserProfile } from '@/providers/UserProvider';
import { ToolExplainer } from '@/app/components/ToolExplainer';

export default function OraclePage() {
  // Use centralized UserProvider
  const { profile, isLoading, isDemoMode } = useUserProfile();
  const [insights, setInsights] = useState<any[]>([]);

  // Clear corrupted/old chat history for real users (demo mode handled by MavenChat)
  useEffect(() => {
    if (isDemoMode) return; // MavenChat handles demo mode clearing
    
    const savedHistory = localStorage.getItem('maven_chat_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        // If history is malformed or too large, clear it
        if (!Array.isArray(parsed) || parsed.length > 50) {
          localStorage.removeItem('maven_chat_history');
          localStorage.removeItem('maven_conversation_id');
        }
      } catch {
        localStorage.removeItem('maven_chat_history');
        localStorage.removeItem('maven_conversation_id');
      }
    }
  }, [isDemoMode]);

  // Generate insights based on profile
  useEffect(() => {
    if (profile) {
      const newInsights = generateInsights(profile);
      setInsights(newInsights);
    }
  }, [profile]);

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      {/* Header */}
      <Header profile={profile} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Maven Oracle
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-gray-400">
                  Your AI wealth partner — ask me anything about your finances.
                </p>
                <ToolExplainer toolName="oracle" />
              </div>
            </div>
            
            <MavenChat 
              userProfile={profile} 
              mode="fullscreen" 
              showContext={true}
              isDemoMode={isDemoMode}
            />
          </div>

          {/* Insights Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Proactive Insights */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <span>🔮</span> Proactive Insights
              </h3>
              
              {insights.length > 0 ? (
                <div className="space-y-3">
                  {insights.map((insight, idx) => (
                    <InsightCard key={idx} insight={insight} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">
                  Connect your accounts to unlock personalized insights.
                </p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <span>⚡</span> Quick Analysis
              </h3>
              
              <div className="space-y-2">
                <QuickAction 
                  icon="📊" 
                  label="Portfolio Health Check" 
                  prompt="Give me a complete health check on my portfolio"
                />
                <QuickAction 
                  icon="💰" 
                  label="Tax Opportunities" 
                  prompt="What tax optimization opportunities do I have right now?"
                />
                <QuickAction 
                  icon="⚖️" 
                  label="Rebalancing Analysis" 
                  prompt="Analyze my current allocation and suggest rebalancing"
                />
                <QuickAction 
                  icon="🎯" 
                  label="Concentration Check" 
                  prompt="Am I over-concentrated in any positions?"
                />
                <QuickAction 
                  icon="🔄" 
                  label="Roth Conversion Analysis" 
                  prompt="Should I do a Roth conversion this year? Analyze my situation."
                />
              </div>
            </div>

            {/* What I Know */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <span>🧠</span> What I Know
              </h3>
              
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <span className={profile?.firstName ? 'text-emerald-400' : 'text-gray-600'}>●</span>
                  <span>Your profile & goals</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={countAccounts(profile) > 0 ? 'text-emerald-400' : 'text-gray-600'}>●</span>
                  <span>{countAccounts(profile)} linked accounts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={countHoldings(profile) > 0 ? 'text-emerald-400' : 'text-gray-600'}>●</span>
                  <span>{countHoldings(profile)} holdings tracked</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">●</span>
                  <span>Tax strategies & rules</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">●</span>
                  <span>Market data (live)</span>
                </div>
              </div>
              
              {countAccounts(profile) === 0 && (
                <Link 
                  href="/accounts"
                  className="mt-4 block w-full text-center py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-lg text-indigo-400 text-sm transition"
                >
                  Link Accounts →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Insight Card Component
function InsightCard({ insight }: { insight: any }) {
  const priorityColors = {
    high: 'border-red-500/30 bg-red-500/10',
    medium: 'border-yellow-500/30 bg-yellow-500/10',
    low: 'border-blue-500/30 bg-blue-500/10'
  };

  return (
    <div className={`p-3 rounded-lg border ${priorityColors[insight.priority as keyof typeof priorityColors]}`}>
      <div className="flex items-start gap-2">
        <span className="text-lg">{insight.icon}</span>
        <div>
          <p className="font-medium text-sm text-white">{insight.title}</p>
          <p className="text-xs text-gray-400 mt-1">{insight.description}</p>
          {insight.value && (
            <p className="text-sm font-semibold text-emerald-400 mt-1">{insight.value}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Quick Action Component
function QuickAction({ icon, label, prompt }: { icon: string; label: string; prompt: string }) {
  const handleClick = () => {
    // Store prompt and auto-submit
    localStorage.setItem('maven_chat_prompt', prompt);
    localStorage.setItem('maven_chat_autosubmit', 'true');
    window.dispatchEvent(new Event('maven_prompt'));
  };

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition text-left"
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm text-gray-300">{label}</span>
    </button>
  );
}

// Helper functions
function countAccounts(profile: any): number {
  if (!profile) return 0;
  return (
    (profile.cashAccounts?.length || 0) +
    (profile.retirementAccounts?.length || 0) +
    (profile.investmentAccounts?.length || 0)
  );
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

function generateInsights(profile: any): any[] {
  const insights: any[] = [];
  
  // Check for concentration risks
  const allHoldings: any[] = [];
  profile.retirementAccounts?.forEach((acc: any) => {
    acc.holdings?.forEach((h: any) => allHoldings.push(h));
  });
  profile.investmentAccounts?.forEach((acc: any) => {
    acc.holdings?.forEach((h: any) => allHoldings.push(h));
  });
  
  const totalValue = allHoldings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
  
  // Find concentrated positions
  allHoldings.forEach(h => {
    const pct = totalValue > 0 ? ((h.currentValue || 0) / totalValue) * 100 : 0;
    if (pct > 15) {
      insights.push({
        icon: '⚠️',
        title: `${h.ticker} is ${pct.toFixed(0)}% of portfolio`,
        description: 'Consider if this concentration aligns with your risk tolerance.',
        priority: pct > 25 ? 'high' : 'medium'
      });
    }
  });
  
  // Check for tax-loss harvest opportunities
  allHoldings.forEach(h => {
    const gain = (h.currentValue || 0) - (h.costBasis || 0);
    if (gain < -1000) {
      insights.push({
        icon: '💰',
        title: `Tax-loss opportunity in ${h.ticker}`,
        description: `$${Math.abs(gain).toLocaleString()} harvestable loss`,
        value: `~$${(Math.abs(gain) * 0.24).toLocaleString()} potential tax savings`,
        priority: 'high'
      });
    }
  });
  
  // Check for large gains
  allHoldings.forEach(h => {
    const gain = (h.currentValue || 0) - (h.costBasis || 0);
    const gainPct = h.costBasis ? (gain / h.costBasis) * 100 : 0;
    if (gainPct > 100) {
      insights.push({
        icon: '📈',
        title: `${h.ticker} up ${gainPct.toFixed(0)}%`,
        description: 'Consider taking some profits or tax planning',
        priority: 'low'
      });
    }
  });
  
  // If no specific insights, add general ones
  if (insights.length === 0 && profile?.firstName) {
    insights.push({
      icon: '✅',
      title: 'Portfolio looks healthy',
      description: 'No immediate action items detected.',
      priority: 'low'
    });
  }
  
  return insights.slice(0, 5); // Max 5 insights
}
