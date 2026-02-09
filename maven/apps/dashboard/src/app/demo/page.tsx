'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import NetWorthCard from '../components/NetWorthCard';
import InsightCard from '../components/InsightCard';
import MarketOverview from '../components/MarketOverview';
import QuickActions from '../components/QuickActions';
import { classifyTicker } from '@/lib/portfolio-utils';
import { 
  DemoVariant, 
  getDemoVariant, 
  setDemoVariant,
  DEMO_NET_WORTH,
  RETIREE_NET_WORTH,
  RETIREE_ANNUAL_INCOME
} from '@/lib/demo-profile';

// Insight type definition
type InsightType = 'tax' | 'rebalance' | 'opportunity' | 'risk' | 'milestone';
type InsightPriority = 'high' | 'medium' | 'low';

interface DemoInsight {
  type: InsightType;
  title: string;
  description: string;
  actionHref: string;
  impact?: string;
  priority?: InsightPriority;
  learnMoreText?: string;
}

// ============================================================================
// GROWTH PORTFOLIO DATA (existing - crypto-heavy, aggressive)
// ============================================================================
const GROWTH_HOLDINGS = [
  { symbol: 'TAO', name: 'Bittensor', value: 684000, change: 4.78, shares: '215 tokens' },
  { symbol: 'VTI', name: 'Vanguard Total Stock', value: 185000, change: 1.2, shares: '620 shares' },
  { symbol: 'CIFR', name: 'Cipher Mining', value: 78000, change: -2.3, shares: '12,000 shares' },
  { symbol: 'IREN', name: 'Iris Energy', value: 52000, change: 3.1, shares: '4,200 shares' },
  { symbol: 'BND', name: 'Vanguard Total Bond', value: 48000, change: 0.3, shares: '580 shares' },
  { symbol: 'VOO', name: 'Vanguard S&P 500', value: 42000, change: 1.1, shares: '95 shares' },
  { symbol: 'VXUS', name: 'Vanguard Total Intl', value: 35000, change: 0.8, shares: '540 shares' },
  { symbol: 'VWO', name: 'Vanguard Emerging Mkts', value: 22000, change: -16.0, shares: '380 shares', unrealizedLoss: -4200 },
  { symbol: 'VNQ', name: 'Vanguard REIT', value: 18000, change: -0.5, shares: '195 shares' },
];

const GROWTH_TARGET_ALLOCATION = {
  usStocks: 45,
  intlStocks: 15,
  bonds: 20,
  other: 20,
};

const GROWTH_RETIREMENT_CURRENT = 797500;
const GROWTH_RETIREMENT_TARGET = 3000000;
const GROWTH_RETIREMENT_PROGRESS = Math.round((GROWTH_RETIREMENT_CURRENT / GROWTH_RETIREMENT_TARGET) * 100);

const GROWTH_INSIGHTS: DemoInsight[] = [
  {
    type: 'tax',
    title: 'Tax-loss harvest opportunity',
    description: 'VWO is showing a $4,200 unrealized loss. Harvesting could save ~$1,050 in taxes.',
    impact: 'Save $1,050',
    actionHref: '/tax-harvesting',
    priority: 'high',
    learnMoreText: 'Tax-loss harvesting means selling an investment at a loss, then using that loss to reduce your tax bill. You can offset gains from other investments, or deduct up to $3,000 from regular income. The key: you can immediately buy a similar (but not identical) investment to stay in the market.',
  },
  {
    type: 'rebalance',
    title: 'Portfolio drift detected',
    description: 'Your portfolio has drifted 8% from target allocation. Tech is overweight.',
    actionHref: '/portfolio-lab',
    priority: 'medium',
  },
  {
    type: 'milestone',
    title: `Retirement goal ${GROWTH_RETIREMENT_PROGRESS}% funded!`,
    description: `You've saved $${(GROWTH_RETIREMENT_CURRENT / 1000).toFixed(0)}K toward your $${(GROWTH_RETIREMENT_TARGET / 1000000).toFixed(0)}M retirement goal. Keep it up!`,
    actionHref: '/goals',
  },
];

const GROWTH_GOALS = [
  { name: 'Retirement', current: GROWTH_RETIREMENT_CURRENT, target: GROWTH_RETIREMENT_TARGET, icon: '🏖️' },
  { name: 'Beach House', current: 85000, target: 400000, icon: '🏠' },
  { name: 'Banks College', current: 28000, target: 200000, icon: '🎓' },
];

// ============================================================================
// RETIREE PORTFOLIO DATA (new - conservative, income-focused)
// ============================================================================
const RETIREE_HOLDINGS = [
  { symbol: 'BND', name: 'Vanguard Total Bond', value: 427160, change: 0.3, shares: '5,900 shares', dividendYield: 3.8 },
  { symbol: 'VTIP', name: 'Vanguard Inflation-Protected', value: 149865, change: 0.1, shares: '3,090 shares', dividendYield: 5.2 },
  { symbol: 'VYM', name: 'Vanguard High Dividend', value: 150495, change: 0.9, shares: '1,270 shares', dividendYield: 2.9 },
  { symbol: 'VTI', name: 'Vanguard Total Stock', value: 221513, change: 1.2, shares: '825 shares', dividendYield: 1.4 },
  { symbol: 'SCHD', name: 'Schwab Dividend Equity', value: 142379, change: 0.7, shares: '1,730 shares', dividendYield: 3.4 },
  { symbol: 'VXUS', name: 'Vanguard Total Intl', value: 108644, change: 0.8, shares: '1,730 shares', dividendYield: 3.1 },
];

const RETIREE_TARGET_ALLOCATION = {
  usStocks: 40,
  intlStocks: 10,
  bonds: 50,
  other: 0, // Cash is separate
};

const RETIREE_RETIREMENT_CURRENT = 1200000;
const RETIREE_RETIREMENT_TARGET = 1500000;
const RETIREE_RETIREMENT_PROGRESS = Math.round((RETIREE_RETIREMENT_CURRENT / RETIREE_RETIREMENT_TARGET) * 100);

const RETIREE_INSIGHTS: DemoInsight[] = [
  {
    type: 'milestone',
    title: 'Social Security Decision Approaching',
    description: 'At 62, you can claim early. But waiting until 67 (FRA) increases benefits by 42%. Waiting to 70 adds another 24%. Your health and cash needs matter.',
    impact: '+$900/mo at FRA',
    actionHref: '/social-security',
    priority: 'high',
    learnMoreText: 'Social Security benefits increase ~8% per year you delay past 62 until age 70. If you\'re healthy and have other income sources, delaying often maximizes lifetime benefits. But if you need income now or have health concerns, claiming earlier may make sense.',
  },
  {
    type: 'tax',
    title: 'RMD Planning: 3 Years to Prepare',
    description: 'Required Minimum Distributions start at 73. Consider Roth conversions now while in a lower tax bracket to reduce future RMDs.',
    impact: 'Potential $15K+ tax savings',
    actionHref: '/tax-planning',
    priority: 'high',
    learnMoreText: 'Required Minimum Distributions (RMDs) force you to withdraw from traditional IRAs/401(k)s starting at 73, creating taxable income. Converting some funds to Roth now—while possibly in a lower bracket—means tax-free growth and no RMDs on converted amounts.',
  },
  {
    type: 'rebalance',
    title: 'Income on Track: $42K/year',
    description: 'Your portfolio generates ~$42,000 annually in dividends and interest. This covers essential expenses without touching principal.',
    impact: '$3,500/mo passive income',
    actionHref: '/income-planner',
    priority: 'medium',
  },
  {
    type: 'opportunity',
    title: 'Medicare Enrollment in 3 Years',
    description: 'At 65, you\'ll be eligible for Medicare. Consider how your income affects premiums (IRMAA). High-income years now can mean higher Part B/D costs.',
    actionHref: '/healthcare-planning',
    priority: 'medium',
    learnMoreText: 'Medicare premiums are income-tested. If your Modified Adjusted Gross Income exceeds certain thresholds (currently ~$103K single, ~$206K married), you pay higher premiums through IRMAA surcharges. Planning income strategically can save thousands.',
  },
  {
    type: 'risk',
    title: 'Sequence of Returns Risk',
    description: 'Early retirement years are crucial. A market drop now impacts you more than later. Your 50% bond allocation helps buffer this risk.',
    actionHref: '/portfolio-lab',
  },
];

const RETIREE_GOALS = [
  { name: 'Retire at 65', current: RETIREE_RETIREMENT_CURRENT, target: RETIREE_RETIREMENT_TARGET, icon: '🏖️' },
  { name: 'Grandkids\' Education', current: 35000, target: 100000, icon: '🎓' },
  { name: 'Travel Fund', current: 22000, target: 50000, icon: '✈️' },
];

// ============================================================================
// DEMO PAGE COMPONENT
// ============================================================================
export default function DemoPage() {
  const [variant, setVariant] = useState<DemoVariant>('growth');
  const [dismissedInsights, setDismissedInsights] = useState<number[]>([]);
  const [showTargetAllocation, setShowTargetAllocation] = useState(false);
  
  // Load saved variant preference
  useEffect(() => {
    const saved = getDemoVariant();
    setVariant(saved);
  }, []);
  
  // Handle variant change
  const handleVariantChange = (newVariant: DemoVariant) => {
    setVariant(newVariant);
    setDemoVariant(newVariant);
    setDismissedInsights([]); // Reset dismissed insights when switching
    setShowTargetAllocation(false);
  };
  
  // Select data based on variant
  const isRetiree = variant === 'retiree';
  const DEMO_HOLDINGS = isRetiree ? RETIREE_HOLDINGS : GROWTH_HOLDINGS;
  const TARGET_ALLOCATION = isRetiree ? RETIREE_TARGET_ALLOCATION : GROWTH_TARGET_ALLOCATION;
  const DEMO_INSIGHTS = isRetiree ? RETIREE_INSIGHTS : GROWTH_INSIGHTS;
  const DEMO_GOALS = isRetiree ? RETIREE_GOALS : GROWTH_GOALS;
  const netWorth = isRetiree ? RETIREE_NET_WORTH : DEMO_NET_WORTH;
  const netWorthChange = isRetiree ? 3200 : 8500;
  const netWorthChangePercent = isRetiree ? 0.27 : 1.08;
  
  // Track insights with their original indices
  const indexedInsights = DEMO_INSIGHTS.map((insight, originalIdx) => ({ ...insight, originalIdx }));
  const visibleInsights = indexedInsights.filter(({ originalIdx }) => !dismissedInsights.includes(originalIdx));
  
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
    
    const otherTotal = buckets.crypto + buckets.reits + buckets.other;
    
    return {
      usStocks: Math.round(buckets.usStocks),
      intlStocks: Math.round(buckets.intlStocks),
      bonds: Math.round(buckets.bonds),
      other: Math.round(otherTotal),
      cryptoDetail: Math.round(buckets.crypto),
      reitsDetail: Math.round(buckets.reits),
    };
  }, [DEMO_HOLDINGS]);
  
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
        {/* Welcome + Variant Selector */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                Welcome to Maven 👋
              </h1>
              <p className="text-lg text-gray-300">
                Your AI-powered wealth partner — see your complete financial picture in one place.
              </p>
            </div>
            
            {/* Demo Variant Selector */}
            <div className="flex-shrink-0">
              <div className="bg-[#12121a] border border-white/10 rounded-xl p-1 flex gap-1">
                <button
                  onClick={() => handleVariantChange('growth')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    variant === 'growth'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="hidden sm:inline">📈 Growth Portfolio</span>
                  <span className="sm:hidden">📈 Growth</span>
                </button>
                <button
                  onClick={() => handleVariantChange('retiree')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    variant === 'retiree'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="hidden sm:inline">🏖️ Retirement Income</span>
                  <span className="sm:hidden">🏖️ Retirement</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Variant Description */}
          <div className={`p-3 rounded-xl border ${
            isRetiree 
              ? 'bg-emerald-500/10 border-emerald-500/30' 
              : 'bg-purple-500/10 border-purple-500/30'
          }`}>
            <p className="text-sm text-gray-300">
              {isRetiree ? (
                <>
                  <strong className="text-emerald-400">Retirement Income Demo:</strong>{' '}
                  Conservative $1.2M portfolio (40% stocks, 50% bonds, 10% cash) focused on 
                  generating sustainable income. See how Maven helps with Social Security timing, 
                  RMD planning, and sequence-of-returns protection.
                </>
              ) : (
                <>
                  <strong className="text-purple-400">Growth Portfolio Demo:</strong>{' '}
                  Aggressive $800K portfolio with significant crypto exposure. See how Maven 
                  identifies concentration risk, tax-loss harvesting, and rebalancing opportunities.
                </>
              )}
            </p>
          </div>
        </div>
        
        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Net Worth */}
            <NetWorthCard 
              netWorth={netWorth}
              change={netWorthChange}
              changePercent={netWorthChangePercent}
            />
            
            {/* Income Summary (Retiree only) */}
            {isRetiree && (
              <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>💰</span> Portfolio Income
                  </h2>
                  <span className="text-xs text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-full">
                    Passive Income
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-3xl font-bold text-white">${(RETIREE_ANNUAL_INCOME / 1000).toFixed(0)}K</p>
                    <p className="text-sm text-gray-400">Annual dividend & interest income</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">${Math.round(RETIREE_ANNUAL_INCOME / 12).toLocaleString()}</p>
                    <p className="text-sm text-gray-400">Monthly passive income</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-emerald-500/20">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Estimated yield</span>
                    <span className="text-emerald-400 font-medium">3.5% weighted average</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-400">Next dividend date</span>
                    <span className="text-white">~$2,800 on Mar 15</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Insights */}
            {visibleInsights.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">
                    {isRetiree ? 'Retirement Planning Insights' : 'Insights for You'}
                  </h2>
                  <Link href="/notifications" className="text-sm text-indigo-400 hover:text-indigo-300">
                    View all →
                  </Link>
                </div>
                <div className="space-y-3">
                  {visibleInsights.map((insight) => (
                    <InsightCard
                      key={insight.originalIdx}
                      type={insight.type}
                      title={insight.title}
                      description={insight.description}
                      actionHref={insight.actionHref}
                      impact={insight.impact}
                      priority={insight.priority}
                      learnMoreText={insight.learnMoreText}
                      onDismiss={() => setDismissedInsights([...dismissedInsights, insight.originalIdx])}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Portfolio Summary */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Portfolio Allocation</h2>
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
              
              <p className="text-xs text-gray-500 mb-4">
                {showTargetAllocation 
                  ? '📊 Your target allocation goal' 
                  : '📈 Based on your actual holdings'}
              </p>
              
              {/* Warning for high concentration (growth portfolio only) */}
              {!showTargetAllocation && !isRetiree && actualAllocation.cryptoDetail > 50 && (
                <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <p className="text-sm text-amber-200">
                    ⚠️ <strong>High concentration:</strong> {actualAllocation.cryptoDetail}% in crypto (TAO). 
                    Consider diversifying to reduce risk.
                  </p>
                </div>
              )}
              
              {/* Well-balanced message (retiree portfolio) */}
              {!showTargetAllocation && isRetiree && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  <p className="text-sm text-emerald-200">
                    ✅ <strong>Well-balanced:</strong> Your conservative allocation with 50% bonds 
                    provides stability and income during market volatility.
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'US Stocks', value: displayAllocation.usStocks, color: 'bg-blue-500' },
                  { label: 'Int\'l Stocks', value: displayAllocation.intlStocks, color: 'bg-emerald-500' },
                  { label: 'Bonds', value: displayAllocation.bonds, color: 'bg-amber-500' },
                  { label: 'Other', value: displayAllocation.other, color: 'bg-purple-500', tooltip: !showTargetAllocation && !isRetiree ? `Crypto: ${actualAllocation.cryptoDetail}%, REITs: ${actualAllocation.reitsDetail}%` : undefined },
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
              
              {!showTargetAllocation && (
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    vs Target: US {displayAllocation.usStocks - TARGET_ALLOCATION.usStocks > 0 ? '+' : ''}{displayAllocation.usStocks - TARGET_ALLOCATION.usStocks}%, 
                    Bonds {displayAllocation.bonds - TARGET_ALLOCATION.bonds > 0 ? '+' : ''}{displayAllocation.bonds - TARGET_ALLOCATION.bonds}%
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
                <h2 className="text-lg font-semibold text-white">
                  {isRetiree ? 'Income-Generating Holdings' : 'Top Holdings'}
                </h2>
                <Link href="/portfolio-lab" className="text-sm text-indigo-400 hover:text-indigo-300">
                  View all {DEMO_HOLDINGS.length} →
                </Link>
              </div>
              
              <div className="space-y-3">
                {DEMO_HOLDINGS.slice(0, 5).map((holding, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${
                        isRetiree 
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                          : 'bg-gradient-to-br from-indigo-500 to-purple-500'
                      }`}>
                        {holding.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{holding.symbol}</p>
                        <p className="text-xs text-gray-500">{holding.shares}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-white">${holding.value.toLocaleString()}</p>
                      <div className="flex items-center gap-2 justify-end">
                        <p className={`text-xs ${holding.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {holding.change >= 0 ? '+' : ''}{holding.change}%
                        </p>
                        {isRetiree && 'dividendYield' in holding && (
                          <p className="text-xs text-amber-400">
                            {(holding as { dividendYield: number }).dividendYield}% yield
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {DEMO_HOLDINGS.length > 5 && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <Link 
                    href="/portfolio-lab"
                    className="flex items-center justify-center gap-2 p-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-gray-400 hover:text-white transition"
                  >
                    <span>+{DEMO_HOLDINGS.length - 5} more holdings</span>
                    {!isRetiree && <span className="text-xs text-gray-500">(including VWO)</span>}
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <QuickActions />
            
            {/* Social Security Preview (Retiree only) */}
            {isRetiree && (
              <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <span>🏛️</span> Social Security
                  </h3>
                  <Link href="/social-security" className="text-xs text-indigo-400 hover:text-indigo-300">
                    Plan →
                  </Link>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                    <span className="text-sm text-gray-400">At 62 (now)</span>
                    <span className="text-sm text-white">$2,100/mo</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                    <span className="text-sm text-emerald-400">At 67 (FRA)</span>
                    <span className="text-sm text-emerald-400 font-medium">$2,980/mo</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                    <span className="text-sm text-gray-400">At 70 (max)</span>
                    <span className="text-sm text-white">$3,700/mo</span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  Waiting until FRA increases lifetime benefits by ~$150K (assuming avg. lifespan)
                </p>
              </div>
            )}
            
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
                {DEMO_GOALS.map((goal, idx) => {
                  const progress = (goal.current / goal.target) * 100;
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
                          className={`h-full rounded-full ${
                            isRetiree 
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                              : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                          }`}
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 text-right">
                        {formatAmount(goal.current)} of {formatAmount(goal.target)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Oracle CTA */}
            <div className={`border rounded-2xl p-4 text-center ${
              isRetiree 
                ? 'bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-emerald-500/30'
                : 'bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-purple-500/30'
            }`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mx-auto mb-3 animate-pulse ${
                isRetiree
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                  : 'bg-gradient-to-br from-purple-500 to-pink-500'
              }`}>
                🔮
              </div>
              <h3 className="font-semibold text-white mb-1">Ask Maven Oracle</h3>
              <p className="text-sm text-gray-400 mb-3">
                {isRetiree 
                  ? 'Get answers about retirement income, Social Security, and RMDs'
                  : 'Get AI-powered answers about your finances'
                }
              </p>
              <Link
                href="/oracle"
                className={`block w-full py-2 text-white rounded-xl transition text-sm ${
                  isRetiree
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-purple-600 hover:bg-purple-500'
                }`}
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
            {(isRetiree ? [
              { icon: '🏛️', label: 'Social Security', desc: 'Optimize claiming', href: '/social-security' },
              { icon: '📋', label: 'RMD Planner', desc: 'Minimize taxes', href: '/rmd-planner' },
              { icon: '💊', label: 'Healthcare', desc: 'Medicare planning', href: '/healthcare' },
              { icon: '📊', label: 'Income Planner', desc: 'Sustainable withdrawals', href: '/income-planner' },
            ] : [
              { icon: '📊', label: 'Portfolio Lab', desc: 'Deep analysis tools', href: '/portfolio-lab' },
              { icon: '🌾', label: 'Tax Harvesting', desc: 'Save on taxes', href: '/tax-harvesting' },
              { icon: '📈', label: 'Fragility Index', desc: 'Market conditions', href: '/fragility' },
              { icon: '👨‍👩‍👧‍👦', label: 'Family Wealth', desc: 'Multi-gen view', href: '/family' },
            ]).map((feature, idx) => (
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
