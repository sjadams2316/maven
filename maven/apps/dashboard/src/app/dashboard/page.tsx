'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import NetWorthCard from '../components/NetWorthCard';
import InsightCard from '../components/InsightCard';
import MarketOverview from '../components/MarketOverview';
import QuickActions from '../components/QuickActions';
import { useUserProfile } from '@/providers/UserProvider';
import { calculateAllocationFromFinancials } from '@/lib/portfolio-utils';

interface Holding {
  ticker: string;
  name?: string;
  shares: number;
  costBasis: number;
  currentPrice?: number;
  currentValue?: number;
}

interface Insight {
  type: 'tax' | 'rebalance' | 'opportunity' | 'risk' | 'milestone';
  title: string;
  description: string;
  impact?: string;
  actionHref: string;
  priority?: 'high' | 'medium' | 'low';
}

export default function Dashboard() {
  const { profile, financials, isLoading } = useUserProfile();
  const [dismissedInsights, setDismissedInsights] = useState<number[]>([]);
  const [showAllHoldings, setShowAllHoldings] = useState(false);
  
  // Get all holdings from accounts
  const allHoldings = useMemo((): Holding[] => {
    if (!profile) return [];
    return [...(profile.retirementAccounts || []), ...(profile.investmentAccounts || [])]
      .flatMap(a => a.holdings || [])
      .filter(h => h.currentValue && h.currentValue > 0)
      .sort((a, b) => (b.currentValue || 0) - (a.currentValue || 0));
  }, [profile]);
  
  // Calculate allocation from actual holdings
  const allocation = useMemo(() => {
    if (!financials) return null;
    return calculateAllocationFromFinancials(financials);
  }, [financials]);
  
  // Generate dynamic insights based on portfolio
  const insights = useMemo((): Insight[] => {
    const result: Insight[] = [];
    
    if (!profile || !financials) return result;
    
    // Check for tax-loss harvesting opportunities
    const holdings = allHoldings;
    const lossHoldings = holdings.filter(h => {
      const gain = (h.currentValue || 0) - h.costBasis;
      return gain < -1000; // At least $1K loss
    });
    
    if (lossHoldings.length > 0) {
      const biggestLoss = lossHoldings[0];
      const lossAmount = Math.abs((biggestLoss.currentValue || 0) - biggestLoss.costBasis);
      const taxSavings = Math.round(lossAmount * 0.25); // ~25% tax rate estimate
      
      result.push({
        type: 'tax',
        title: 'Tax-loss harvest opportunity',
        description: `${biggestLoss.ticker} is showing a $${lossAmount.toLocaleString()} unrealized loss. Harvesting could save ~$${taxSavings.toLocaleString()} in taxes.`,
        impact: `Save $${taxSavings.toLocaleString()}`,
        actionHref: '/tax-harvesting',
        priority: 'high',
      });
    }
    
    // Check for concentration risk
    const topHolding = holdings[0];
    if (topHolding && financials.netWorth > 0) {
      const concentration = ((topHolding.currentValue || 0) / financials.netWorth) * 100;
      if (concentration > 25) {
        result.push({
          type: 'risk',
          title: 'Concentration detected',
          description: `${topHolding.ticker} represents ${concentration.toFixed(0)}% of your portfolio. Consider diversifying to reduce risk.`,
          actionHref: '/portfolio-lab',
          priority: 'medium',
        });
      }
    }
    
    // Portfolio drift check (simplified)
    if (allocation) {
      const equityWeight = (allocation.usEquity + allocation.intlEquity) * 100;
      if (equityWeight > 70) {
        result.push({
          type: 'rebalance',
          title: 'Portfolio drift detected',
          description: `Your portfolio is ${equityWeight.toFixed(0)}% equities. Consider rebalancing if this exceeds your target.`,
          actionHref: '/portfolio-lab',
          priority: 'medium',
        });
      }
    }
    
    // Milestone celebration
    if (financials.netWorth >= 100000) {
      const milestones = [
        { threshold: 1000000, label: 'millionaire', emoji: '🎉' },
        { threshold: 500000, label: 'half-millionaire', emoji: '🏆' },
        { threshold: 250000, label: 'quarter-millionaire', emoji: '💰' },
        { threshold: 100000, label: 'six figures', emoji: '🎯' },
      ];
      
      const achieved = milestones.find(m => financials.netWorth >= m.threshold);
      if (achieved) {
        result.push({
          type: 'milestone',
          title: `You've reached ${achieved.label}!`,
          description: `Your net worth is now $${financials.netWorth.toLocaleString()}. Keep building!`,
          actionHref: '/goals',
        });
      }
    }
    
    return result;
  }, [profile, financials, allHoldings, allocation]);
  
  const visibleInsights = insights.filter((_, idx) => !dismissedInsights.includes(idx));
  const displayedHoldings = showAllHoldings ? allHoldings : allHoldings.slice(0, 5);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/10 rounded w-48" />
            <div className="h-48 bg-white/10 rounded-2xl" />
            <div className="h-32 bg-white/10 rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }
  
  // Get user's first name
  const firstName = profile?.firstName || 'there';
  const netWorth = financials?.netWorth || 0;
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-gray-400">
            Here's your financial snapshot for today.
          </p>
        </div>
        
        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Net Worth */}
            <NetWorthCard 
              netWorth={netWorth}
              change={netWorth * 0.0108} // Placeholder - would come from historical data
              changePercent={1.08}
            />
            
            {/* Insights */}
            {visibleInsights.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Insights for You</h2>
                  <span className="text-sm text-gray-500">{visibleInsights.length} active</span>
                </div>
                <div className="space-y-3">
                  {visibleInsights.map((insight, idx) => (
                    <InsightCard
                      key={idx}
                      {...insight}
                      onDismiss={() => setDismissedInsights([...dismissedInsights, insights.indexOf(insight)])}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Portfolio Summary */}
            {allocation && (
              <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Portfolio Allocation</h2>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'US Stocks', value: allocation.usEquity * 100, color: 'bg-blue-500' },
                    { label: 'Int\'l Stocks', value: allocation.intlEquity * 100, color: 'bg-emerald-500' },
                    { label: 'Bonds', value: allocation.bonds * 100, color: 'bg-amber-500' },
                    { label: 'Other', value: (allocation.cash + allocation.reits + allocation.crypto + allocation.alternatives + allocation.gold) * 100, color: 'bg-purple-500' },
                  ].map((item, idx) => (
                    <div key={idx} className="text-center">
                      <div className={`w-3 h-3 ${item.color} rounded-full mx-auto mb-2`} />
                      <p className="text-white font-semibold">{item.value.toFixed(0)}%</p>
                      <p className="text-xs text-gray-500">{item.label}</p>
                    </div>
                  ))}
                </div>
                
                {/* Allocation Bar */}
                <div className="h-4 rounded-full overflow-hidden flex">
                  <div className="bg-blue-500" style={{ width: `${allocation.usEquity * 100}%` }} />
                  <div className="bg-emerald-500" style={{ width: `${allocation.intlEquity * 100}%` }} />
                  <div className="bg-amber-500" style={{ width: `${allocation.bonds * 100}%` }} />
                  <div className="bg-purple-500" style={{ width: `${(allocation.cash + allocation.reits + allocation.crypto + allocation.alternatives + allocation.gold) * 100}%` }} />
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Link 
                    href="/portfolio-lab"
                    className="text-sm text-indigo-400 hover:text-indigo-300"
                  >
                    Analyze in Portfolio Lab →
                  </Link>
                </div>
              </div>
            )}
            
            {/* Top Holdings */}
            {allHoldings.length > 0 && (
              <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Top Holdings</h2>
                  {allHoldings.length > 5 && (
                    <button
                      onClick={() => setShowAllHoldings(!showAllHoldings)}
                      className="text-sm text-indigo-400 hover:text-indigo-300"
                    >
                      {showAllHoldings ? 'Show less' : `View all ${allHoldings.length} holdings`}
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {displayedHoldings.map((holding, idx) => {
                    const gain = (holding.currentValue || 0) - holding.costBasis;
                    const gainPercent = holding.costBasis > 0 ? (gain / holding.costBasis) * 100 : 0;
                    
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                            {holding.ticker.slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium text-white">{holding.ticker}</p>
                            <p className="text-xs text-gray-500">
                              {holding.shares.toLocaleString()} {holding.shares === 1 ? 'share' : 'shares'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-white">
                            ${(holding.currentValue || 0).toLocaleString()}
                          </p>
                          <p className={`text-xs ${gainPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActions />
            
            {/* Market Overview */}
            <MarketOverview />
            
            {/* Goals Progress */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Goals</h3>
                <Link href="/goals" className="text-xs text-indigo-400 hover:text-indigo-300">
                  View all →
                </Link>
              </div>
              
              <div className="space-y-4">
                {[
                  { name: 'Retirement', current: netWorth, target: 3000000, icon: '🏖️' },
                  { name: 'Emergency Fund', current: financials?.totalCash || 0, target: 50000, icon: '🛡️' },
                  { name: 'College Fund', current: 28000, target: 200000, icon: '🎓' },
                ].map((goal, idx) => {
                  const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-400 flex items-center gap-2">
                          <span>{goal.icon}</span>
                          {goal.name}
                        </span>
                        <span className="text-sm text-white">{Math.min(100, progress).toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Oracle CTA */}
            <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 rounded-2xl p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl mx-auto mb-3 animate-pulse">
                🔮
              </div>
              <h3 className="font-semibold text-white mb-1">Ask Maven Oracle</h3>
              <p className="text-sm text-gray-400 mb-3">Get AI-powered answers about your finances</p>
              <Link
                href="/oracle"
                className="block w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition text-sm"
              >
                Start Conversation
              </Link>
            </div>
          </div>
        </div>
        
        {/* Feature Tour */}
        <div className="mt-8 bg-[#12121a] border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Explore Maven</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '📊', label: 'Portfolio Lab', desc: 'Deep analysis tools', href: '/portfolio-lab' },
              { icon: '🌾', label: 'Tax Harvesting', desc: 'Save on taxes', href: '/tax-harvesting' },
              { icon: '📈', label: 'Fragility Index', desc: 'Market conditions', href: '/fragility' },
              { icon: '👨‍👩‍👧‍👦', label: 'Family Wealth', desc: 'Multi-gen view', href: '/family' },
            ].map((feature, idx) => (
              <Link
                key={idx}
                href={feature.href}
                className="p-4 bg-white/5 hover:bg-white/10 rounded-xl transition text-center group"
              >
                <span className="text-3xl block mb-2 group-hover:scale-110 transition">{feature.icon}</span>
                <p className="font-medium text-white">{feature.label}</p>
                <p className="text-xs text-gray-500">{feature.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
