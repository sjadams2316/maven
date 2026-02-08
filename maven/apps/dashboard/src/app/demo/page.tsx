'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import NetWorthCard from '../components/NetWorthCard';
import InsightCard from '../components/InsightCard';
import MarketOverview from '../components/MarketOverview';
import QuickActions from '../components/QuickActions';

const DEMO_INSIGHTS = [
  {
    type: 'tax' as const,
    title: 'Tax-loss harvest opportunity',
    description: 'VWO is showing a $4,200 unrealized loss. Harvesting could save ~$1,050 in taxes.',
    impact: 'Save $1,050',
    actionHref: '/tax-harvesting',
    priority: 'high' as const,
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
    title: 'Retirement goal 40% funded!',
    description: 'You\'ve reached $1.2M of your $3M retirement goal. On track for 2038.',
    actionHref: '/goals',
  },
];

export default function DemoPage() {
  const [dismissedInsights, setDismissedInsights] = useState<number[]>([]);
  
  const visibleInsights = DEMO_INSIGHTS.filter((_, idx) => !dismissedInsights.includes(idx));
  
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
          <p className="text-gray-400">
            This is a demo with sample data. Everything you see is fully interactive.
          </p>
        </div>
        
        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Net Worth */}
            <NetWorthCard 
              netWorth={1150000}
              change={12400}
              changePercent={1.09}
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
              <h2 className="text-lg font-semibold text-white mb-4">Portfolio Allocation</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'US Stocks', value: 45, amount: 517500, color: 'bg-blue-500' },
                  { label: 'Int\'l Stocks', value: 15, amount: 172500, color: 'bg-emerald-500' },
                  { label: 'Bonds', value: 20, amount: 230000, color: 'bg-amber-500' },
                  { label: 'Crypto', value: 20, amount: 230000, color: 'bg-purple-500' },
                ].map((item, idx) => (
                  <div key={idx} className="text-center">
                    <div className={`w-3 h-3 ${item.color} rounded-full mx-auto mb-2`} />
                    <p className="text-white font-semibold">{item.value}%</p>
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="text-xs text-gray-600">${(item.amount / 1000).toFixed(0)}K</p>
                  </div>
                ))}
              </div>
              
              {/* Allocation Bar */}
              <div className="h-4 rounded-full overflow-hidden flex">
                <div className="bg-blue-500" style={{ width: '45%' }} />
                <div className="bg-emerald-500" style={{ width: '15%' }} />
                <div className="bg-amber-500" style={{ width: '20%' }} />
                <div className="bg-purple-500" style={{ width: '20%' }} />
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
            
            {/* Top Holdings */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Top Holdings</h2>
              
              <div className="space-y-3">
                {[
                  { symbol: 'TAO', name: 'Bittensor', value: 684000, change: 4.78, shares: '215 tokens' },
                  { symbol: 'VTI', name: 'Vanguard Total Stock', value: 185000, change: 1.2, shares: '620 shares' },
                  { symbol: 'CIFR', name: 'Cipher Mining', value: 78000, change: -2.3, shares: '12,000 shares' },
                  { symbol: 'IREN', name: 'Iris Energy', value: 52000, change: 3.1, shares: '4,200 shares' },
                  { symbol: 'BND', name: 'Vanguard Total Bond', value: 48000, change: 0.3, shares: '580 shares' },
                ].map((holding, idx) => (
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
                  { name: 'Retirement', current: 1150000, target: 3000000, icon: '🏖️' },
                  { name: 'Beach House', current: 85000, target: 400000, icon: '🏠' },
                  { name: 'Banks College', current: 28000, target: 200000, icon: '🎓' },
                ].map((goal, idx) => {
                  const progress = (goal.current / goal.target) * 100;
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-400 flex items-center gap-2">
                          <span>{goal.icon}</span>
                          {goal.name}
                        </span>
                        <span className="text-sm text-white">{progress.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
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
