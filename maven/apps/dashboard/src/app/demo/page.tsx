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
  DemoHolding,
  getDemoVariant, 
  setDemoVariant,
  getDemoHoldings,
  DEMO_NET_WORTH,
  RETIREE_NET_WORTH,
  RETIREE_ANNUAL_INCOME,
  GROWTH_TARGET_ALLOCATION,
  RETIREE_TARGET_ALLOCATION,
  GROWTH_GOALS,
  RETIREE_GOALS,
  GROWTH_RETIREMENT_CURRENT,
  GROWTH_RETIREMENT_TARGET,
  GROWTH_RETIREMENT_PROGRESS,
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
// GROWTH PORTFOLIO INSIGHTS
// ============================================================================
const GROWTH_INSIGHTS: DemoInsight[] = [
  {
    type: 'tax',
    title: 'Tax-loss harvest opportunity',
    description: 'VWO is showing a $2,500 unrealized loss. Harvesting could save ~$625 in taxes.',
    impact: 'Save $625',
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

// ============================================================================
// RETIREE PORTFOLIO INSIGHTS
// ============================================================================
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
    actionHref: '/tax',
    priority: 'high',
    learnMoreText: 'Required Minimum Distributions (RMDs) force you to withdraw from traditional IRAs/401(k)s starting at 73, creating taxable income. Converting some funds to Roth now—while possibly in a lower bracket—means tax-free growth and no RMDs on converted amounts.',
  },
  {
    type: 'rebalance',
    title: 'Income on Track: $42K/year',
    description: 'Your portfolio generates ~$42,000 annually in dividends and interest. This covers essential expenses without touching principal.',
    impact: '$3,500/mo passive income',
    actionHref: '/income',
    priority: 'medium',
  },
  {
    type: 'opportunity',
    title: 'Medicare Enrollment in 3 Years',
    description: 'At 65, you\'ll be eligible for Medicare. Consider how your income affects premiums (IRMAA). High-income years now can mean higher Part B/D costs.',
    actionHref: '/insurance',
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

// ============================================================================
// DEMO PAGE COMPONENT
// ============================================================================
export default function DemoPage() {
  const [variant, setVariant] = useState<DemoVariant>('growth');
  const [dismissedInsights, setDismissedInsights] = useState<number[]>([]);
  const [showTargetAllocation, setShowTargetAllocation] = useState(false);
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [pricesLoading, setPricesLoading] = useState(false);
  
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
  
  // Select data based on variant - now imported from demo-profile.ts
  const isRetiree = variant === 'retiree';
  const BASE_HOLDINGS = getDemoHoldings(variant);
  const TARGET_ALLOCATION = isRetiree ? RETIREE_TARGET_ALLOCATION : GROWTH_TARGET_ALLOCATION;
  const DEMO_INSIGHTS = isRetiree ? RETIREE_INSIGHTS : GROWTH_INSIGHTS;
  const DEMO_GOALS = isRetiree ? RETIREE_GOALS : GROWTH_GOALS;
  
  // Fetch live prices for all holdings
  useEffect(() => {
    const fetchLivePrices = async () => {
      setPricesLoading(true);
      
      try {
        // Get all unique tickers from both portfolios
        const growthHoldings = getDemoHoldings('growth');
        const retireeHoldings = getDemoHoldings('retiree');
        const allTickers = [...new Set([
          ...growthHoldings.map(h => h.symbol.toUpperCase()),
          ...retireeHoldings.map(h => h.symbol.toUpperCase())
        ])];
        
        const response = await fetch('/api/stock-quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbols: allTickers }),
        });
        
        if (response.ok) {
          const { quotes, timestamp } = await response.json();
          const newPrices: Record<string, number> = {};
          
          for (const [symbol, quoteData] of Object.entries(quotes)) {
            const q = quoteData as { price: number };
            if (q.price > 0) {
              newPrices[symbol.toUpperCase()] = q.price;
            }
          }
          
          setLivePrices(newPrices);
          setLastUpdated(timestamp ? new Date(timestamp) : new Date());
        } else {
          console.error('Failed to fetch prices:', response.status);
        }
      } catch (error) {
        console.error('Error fetching live prices:', error);
      } finally {
        setPricesLoading(false);
      }
    };
    
    // Fetch immediately
    fetchLivePrices();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchLivePrices, 60000);
    return () => clearInterval(interval);
  }, []);
  
  // Apply live prices to holdings for accuracy
  const DEMO_HOLDINGS = useMemo(() => {
    return BASE_HOLDINGS.map(h => {
      const ticker = h.symbol.toUpperCase();
      const livePrice = livePrices[ticker];
      if (livePrice && h.sharesNum) {
        const liveValue = h.sharesNum * livePrice;
        return {
          ...h,
          value: liveValue,
        };
      }
      return h;
    }).sort((a, b) => b.value - a.value);
  }, [BASE_HOLDINGS, livePrices]);
  
  // Calculate net worth from holdings
  const holdingsTotal = useMemo(() => {
    return DEMO_HOLDINGS.reduce((sum, h) => sum + h.value, 0);
  }, [DEMO_HOLDINGS]);
  
  // Net worth = holdings + cash buffer
  const cashAndOther = isRetiree ? 120000 : 85000;
  const baseNetWorth = isRetiree ? 1200000 : 835000; // Reference point for change calculation
  const netWorth = holdingsTotal + cashAndOther;
  const netWorthChange = netWorth - baseNetWorth;
  const netWorthChangePercent = baseNetWorth > 0 ? (netWorthChange / baseNetWorth) * 100 : 0;
  
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
    
    // Round individual components first, then sum for "other" so tooltip math adds up
    const cryptoRounded = Math.round(buckets.crypto);
    const reitsRounded = Math.round(buckets.reits);
    const miscRounded = Math.round(buckets.other);
    
    return {
      usStocks: Math.round(buckets.usStocks),
      intlStocks: Math.round(buckets.intlStocks),
      bonds: Math.round(buckets.bonds),
      other: cryptoRounded + reitsRounded + miscRounded, // Sum of rounded values so tooltip math is correct
      cryptoDetail: cryptoRounded,
      reitsDetail: reitsRounded,
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
              <div className="flex items-center gap-3">
                <p className="text-lg text-gray-300">
                  Your AI-powered wealth partner — see your complete financial picture in one place.
                </p>
                {lastUpdated && (
                  <span className="flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap">
                    <span className={`w-2 h-2 rounded-full ${pricesLoading ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500'}`} />
                    {pricesLoading ? 'Updating...' : `Live prices`}
                  </span>
                )}
              </div>
            </div>
            
            {/* Demo Variant Selector - Mobile-optimized */}
            <div className="flex-shrink-0 w-full sm:w-auto">
              <p className="text-xs text-gray-400 mb-1.5 text-center sm:text-right">Choose demo profile:</p>
              <div className="bg-[#1a1a24] border border-white/20 rounded-xl p-1.5 flex gap-1.5 shadow-lg">
                <button
                  onClick={() => handleVariantChange('growth')}
                  className={`flex-1 sm:flex-initial px-3 sm:px-4 py-3 sm:py-2.5 rounded-lg text-sm font-medium transition-all min-h-[48px] ${
                    variant === 'growth'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg ring-2 ring-purple-400/50'
                      : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <span className="hidden sm:inline">📈 Growth Portfolio</span>
                  <span className="sm:hidden">📈 Growth</span>
                </button>
                <button
                  onClick={() => handleVariantChange('retiree')}
                  className={`flex-1 sm:flex-initial px-3 sm:px-4 py-3 sm:py-2.5 rounded-lg text-sm font-medium transition-all min-h-[48px] ${
                    variant === 'retiree'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg ring-2 ring-emerald-400/50'
                      : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <span className="hidden sm:inline">🏖️ Retirement Income</span>
                  <span className="sm:hidden">🏖️ Retire</span>
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
              asOfTime={lastUpdated}
              isRefreshing={pricesLoading}
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
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setShowTargetAllocation(false)}
                    className={`px-4 py-2.5 sm:px-3 sm:py-1.5 text-sm sm:text-xs rounded-lg transition min-h-[44px] sm:min-h-0 ${
                      !showTargetAllocation 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    Current
                  </button>
                  <button
                    onClick={() => setShowTargetAllocation(true)}
                    className={`px-4 py-2.5 sm:px-3 sm:py-1.5 text-sm sm:text-xs rounded-lg transition min-h-[44px] sm:min-h-0 ${
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
              {!showTargetAllocation && !isRetiree && actualAllocation.cryptoDetail > 30 && (
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
                          {holding.change >= 0 ? '+' : ''}{holding.change.toFixed(1)}%
                        </p>
                        {isRetiree && holding.dividendYield && (
                          <p className="text-xs text-amber-400">
                            {holding.dividendYield}% yield
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
              { icon: '📋', label: 'Retirement Hub', desc: 'RMDs & withdrawals', href: '/retirement' },
              { icon: '🛡️', label: 'Insurance', desc: 'Coverage review', href: '/insurance' },
              { icon: '📊', label: 'Income Planner', desc: 'Sustainable income', href: '/income' },
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
