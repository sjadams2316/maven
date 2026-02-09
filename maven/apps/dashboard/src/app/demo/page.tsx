'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import NetWorthCard from '../components/NetWorthCard';
import InsightCard from '../components/InsightCard';
import MarketOverview from '../components/MarketOverview';
import QuickActions from '../components/QuickActions';
import { classifyTicker } from '@/lib/portfolio-utils';

// Demo holdings with actual values (must match what's shown in Top Holdings)
const DEMO_HOLDINGS = [
  { symbol: 'TAO', name: 'Bittensor', value: 684000, change: 4.78, shares: '215 tokens' },
  { symbol: 'VTI', name: 'Vanguard Total Stock', value: 185000, change: 1.2, shares: '620 shares' },
  { symbol: 'CIFR', name: 'Cipher Mining', value: 78000, change: -2.3, shares: '12,000 shares' },
  { symbol: 'IREN', name: 'Iris Energy', value: 52000, change: 3.1, shares: '4,200 shares' },
  { symbol: 'BND', name: 'Vanguard Total Bond', value: 48000, change: 0.3, shares: '580 shares' },
  // Additional holdings to make up the full portfolio
  { symbol: 'VOO', name: 'Vanguard S&P 500', value: 42000, change: 1.1, shares: '95 shares' },
  { symbol: 'VXUS', name: 'Vanguard Total Intl', value: 35000, change: 0.8, shares: '540 shares' },
  { symbol: 'VWO', name: 'Vanguard Emerging Mkts', value: 22000, change: -16.0, shares: '380 shares', unrealizedLoss: -4200 },
  { symbol: 'VNQ', name: 'Vanguard REIT', value: 18000, change: -0.5, shares: '195 shares' },
];

// Target allocation (what the user is aiming for)
const TARGET_ALLOCATION = {
  usStocks: 45,
  intlStocks: 15,
  bonds: 20,
  other: 20, // crypto, REITs, etc.
};

// Retirement goal constants (centralized for consistency)
const RETIREMENT_CURRENT = 797500; // Must match net worth
const RETIREMENT_TARGET = 3000000;
const RETIREMENT_PROGRESS = Math.round((RETIREMENT_CURRENT / RETIREMENT_TARGET) * 100);

const DEMO_INSIGHTS = [
  {
    type: 'tax' as const,
    title: 'Tax-loss harvest opportunity',
    description: 'VWO is showing a $4,200 unrealized loss. Harvesting could save ~$1,050 in taxes.',
    impact: 'Save $1,050',
    actionHref: '/tax-harvesting',
    priority: 'high' as const,
    learnMoreText: 'Tax-loss harvesting means selling an investment at a loss, then using that loss to reduce your tax bill. You can offset gains from other investments, or deduct up to $3,000 from regular income. The key: you can immediately buy a similar (but not identical) investment to stay in the market.',
  },
  {
    type: 'rebalance' as const,
    title: 'Portfolio drift detected',
    description: 'Your portfolio has drifted 8% from target allocation. Tech is overweight.',
    actionHref: '/portfolio-lab',
    priority: 'medium' as const,
  },
  {
    type: 'milestone' as const,
    title: `Retirement goal ${RETIREMENT_PROGRESS}% funded!`,
    description: `You've saved $${(RETIREMENT_CURRENT / 1000).toFixed(0)}K toward your $${(RETIREMENT_TARGET / 1000000).toFixed(0)}M retirement goal. Keep it up!`,
    actionHref: '/goals',
  },
];

export default function DemoPage() {
  const [dismissedInsights, setDismissedInsights] = useState<number[]>([]);
  const [showTargetAllocation, setShowTargetAllocation] = useState(false);
  
  const visibleInsights = DEMO_INSIGHTS.filter((_, idx) => !dismissedInsights.includes(idx));
  
  // Calculate ACTUAL allocation from holdings
  const actualAllocation = useMemo(() => {
    const totalValue = DEMO_HOLDINGS.reduce((sum, h) => sum + h.value, 0);
    
    const buckets = {
      usStocks: 0,
      intlStocks: 0,
      bonds: 0,
      crypto: 0,
      reits: 0,
      other: 0,
    };
    
    DEMO_HOLDINGS.forEach(h => {
      const assetClass = classifyTicker(h.symbol);
      const pct = (h.value / totalValue) * 100;
      
      switch (assetClass) {
        case 'usEquity':
          buckets.usStocks += pct;
          break;
        case 'intlEquity':
          buckets.intlStocks += pct;
          break;
        case 'bonds':
          buckets.bonds += pct;
          break;
        case 'crypto':
          buckets.crypto += pct;
          break;
        case 'reits':
          buckets.reits += pct;
          break;
        default:
          buckets.other += pct;
      }
    });
    
    // Combine crypto, REITs, and other into "Other" for display
    const otherTotal = buckets.crypto + buckets.reits + buckets.other;
    
    return {
      usStocks: Math.round(buckets.usStocks),
      intlStocks: Math.round(buckets.intlStocks),
      bonds: Math.round(buckets.bonds),
      other: Math.round(otherTotal),
      // Keep detailed breakdown for tooltips
      cryptoDetail: Math.round(buckets.crypto),
      reitsDetail: Math.round(buckets.reits),
    };
  }, []);
  
  // Use either actual or target allocation based on toggle
  const displayAllocation = showTargetAllocation ? TARGET_ALLOCATION : actualAllocation;
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 py-2 px-4 text-center">
        <p className="text-white text-sm">
          🎯 <strong>Demo Mode</strong> — Explore Maven with sample data.{' '}
          <Link href="/onboarding" className="underline hover:no-underline">
            Create your account
          </Link>{' '}
          to connect real accounts.
        </p>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            Welcome to Maven 👋
          </h1>
          <p className="text-lg text-gray-300 mb-2">
            Your AI-powered wealth partner — see your complete financial picture in one place.
          </p>
          <p className="text-sm text-gray-500">
            This is a demo with sample data. Everything you see is fully interactive.
          </p>
        </div>
        
        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Net Worth */}
            <NetWorthCard 
              netWorth={797500}
              change={8500}
              changePercent={1.08}
            />
            
            {/* Insights */}
            {visibleInsights.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Insights for You</h2>
                  <Link href="/notifications" className="text-sm text-indigo-400 hover:text-indigo-300">
                    View all →
                  </Link>
                </div>
                <div className="space-y-3">
                  {visibleInsights.map((insight, idx) => (
                    <InsightCard
                      key={idx}
                      {...insight}
                      onDismiss={() => setDismissedInsights([...dismissedInsights, DEMO_INSIGHTS.indexOf(insight)])}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Portfolio Summary */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Portfolio Allocation</h2>
                {/* Toggle between Current and Target */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowTargetAllocation(false)}
                    className={`px-3 py-1 text-xs rounded-lg transition ${
                      !showTargetAllocation 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    Current
                  </button>
                  <button
                    onClick={() => setShowTargetAllocation(true)}
                    className={`px-3 py-1 text-xs rounded-lg transition ${
                      showTargetAllocation 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    Target
                  </button>
                </div>
              </div>
              
              {/* Allocation label */}
              <p className="text-xs text-gray-500 mb-4">
                {showTargetAllocation 
                  ? '📊 Your target allocation goal' 
                  : '📈 Based on your actual holdings'}
              </p>
              
              {/* Warning for significant drift (only show when viewing current) */}
              {!showTargetAllocation && actualAllocation.cryptoDetail > 50 && (
                <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <p className="text-sm text-amber-200">
                    ⚠️ <strong>High concentration:</strong> {actualAllocation.cryptoDetail}% in crypto (TAO). 
                    Consider diversifying to reduce risk.
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'US Stocks', value: displayAllocation.usStocks, color: 'bg-blue-500' },
                  { label: 'Int\'l Stocks', value: displayAllocation.intlStocks, color: 'bg-emerald-500' },
                  { label: 'Bonds', value: displayAllocation.bonds, color: 'bg-amber-500' },
                  { label: 'Other', value: displayAllocation.other, color: 'bg-purple-500', tooltip: !showTargetAllocation ? `Crypto: ${actualAllocation.cryptoDetail}%, REITs: ${actualAllocation.reitsDetail}%` : undefined },
                ].map((item, idx) => (
                  <div key={idx} className="text-center group relative">
                    <div className={`w-3 h-3 ${item.color} rounded-full mx-auto mb-2`} />
                    <p className="text-white font-semibold">{item.value}%</p>
                    <p className="text-xs text-gray-500">{item.label}</p>
                    {item.tooltip && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-xs text-gray-300 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                        {item.tooltip}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Allocation Bar */}
              <div className="h-4 rounded-full overflow-hidden flex">
                <div className="bg-blue-500 transition-all duration-300" style={{ width: `${displayAllocation.usStocks}%` }} />
                <div className="bg-emerald-500 transition-all duration-300" style={{ width: `${displayAllocation.intlStocks}%` }} />
                <div className="bg-amber-500 transition-all duration-300" style={{ width: `${displayAllocation.bonds}%` }} />
                <div className="bg-purple-500 transition-all duration-300" style={{ width: `${displayAllocation.other}%` }} />
              </div>
              
              {/* Drift indicator when showing current allocation */}
              {!showTargetAllocation && (
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    vs Target: US {displayAllocation.usStocks - TARGET_ALLOCATION.usStocks > 0 ? '+' : ''}{displayAllocation.usStocks - TARGET_ALLOCATION.usStocks}%, 
                    Other {displayAllocation.other - TARGET_ALLOCATION.other > 0 ? '+' : ''}{displayAllocation.other - TARGET_ALLOCATION.other}%
                  </span>
                  <Link 
                    href="/portfolio-lab"
                    className="text-amber-400 hover:text-amber-300"
                  >
                    Rebalance →
                  </Link>
                </div>
              )}
              
              <div className="mt-4 flex justify-end">
                <Link 
                  href="/portfolio-lab"
                  className="text-sm text-indigo-400 hover:text-indigo-300"
                >
                  Analyze in Portfolio Lab →
                </Link>
              </div>
            </div>
            
            {/* Top Holdings */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Top Holdings</h2>
                <Link href="/portfolio-lab" className="text-sm text-indigo-400 hover:text-indigo-300">
                  View all {DEMO_HOLDINGS.length} →
                </Link>
              </div>
              
              <div className="space-y-3">
                {DEMO_HOLDINGS.slice(0, 5).map((holding, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                        {holding.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{holding.symbol}</p>
                        <p className="text-xs text-gray-500">{holding.shares}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-white">${holding.value.toLocaleString()}</p>
                      <p className={`text-xs ${holding.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {holding.change >= 0 ? '+' : ''}{holding.change}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Show additional holdings indicator */}
              {DEMO_HOLDINGS.length > 5 && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <Link 
                    href="/portfolio-lab"
                    className="flex items-center justify-center gap-2 p-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-gray-400 hover:text-white transition"
                  >
                    <span>+{DEMO_HOLDINGS.length - 5} more holdings</span>
                    <span className="text-xs text-gray-500">(including VWO)</span>
                  </Link>
                </div>
              )}
            </div>
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
                  { name: 'Retirement', current: RETIREMENT_CURRENT, target: RETIREMENT_TARGET, icon: '🏖️' },
                  { name: 'Beach House', current: 85000, target: 400000, icon: '🏠' },
                  { name: 'Banks College', current: 28000, target: 200000, icon: '🎓' },
                ].map((goal, idx) => {
                  const progress = (goal.current / goal.target) * 100;
                  // Format dollar amounts for display
                  const formatAmount = (val: number) => {
                    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
                    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
                    return `$${val.toLocaleString()}`;
                  };
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-400 flex items-center gap-2">
                          <span>{goal.icon}</span>
                          {goal.name}
                        </span>
                        <span className="text-sm text-white font-medium">{progress.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-1">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                      {/* Absolute values: $X of $Y */}
                      <div className="text-xs text-gray-500 text-right">
                        {formatAmount(goal.current)} of {formatAmount(goal.target)}
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
        <div className="mt-12 bg-[#12121a] border border-white/10 rounded-2xl p-6">
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
