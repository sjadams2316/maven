'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import MavenChat from '../components/MavenChat';
import WelcomeFlow from '../components/WelcomeFlow';
import MissionControl from '../components/MissionControl';
import TaxAlphaCounter from '../components/TaxAlphaCounter';
import { useFundProfiles, categorizeWithProfiles } from '@/lib/useFundProfiles';
import { useUserProfile } from '@/providers/UserProvider';
import { Term } from '../components/InfoTooltip';
import { ThesisInsight } from '../components/ThesisInsight';

interface MarketData {
  timestamp: string;
  indices: {
    sp500: { price: number; change: number; changePercent: number } | null;
    nasdaq: { price: number; change: number; changePercent: number } | null;
    dow: { price: number; change: number; changePercent: number } | null;
  };
  crypto: {
    BTC: { price: number; changePercent: number } | null;
    ETH: { price: number; changePercent: number } | null;
    SOL: { price: number; changePercent: number } | null;
    TAO: { price: number; changePercent: number } | null;
  };
}

interface Holding {
  ticker: string;
  name?: string;
  shares: number;
  costBasis: number;
  currentPrice?: number;
  currentValue?: number;
  percentage?: number;
}

export default function Dashboard() {
  const router = useRouter();
  
  // Use centralized UserProvider instead of local state
  const { profile, financials, isLoading: profileLoading, isOnboarded } = useUserProfile();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [marketLoading, setMarketLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showAllAccounts, setShowAllAccounts] = useState(false);
  const [showAdditionalTools, setShowAdditionalTools] = useState(false);
  
  // Fund profiles for real Morningstar classifications
  const { profiles: fundProfiles, fetchProfiles, loading: profilesLoading } = useFundProfiles();

  // Initialize welcome flow and time updates
  useEffect(() => {
    // Show welcome flow for first-time visitors
    const welcomeSeen = localStorage.getItem('maven_welcome_seen');
    if (!welcomeSeen) {
      setShowWelcome(true);
    }

    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch live market data
  useEffect(() => {
    async function fetchMarketData() {
      try {
        const res = await fetch('/api/market-data');
        if (res.ok) {
          const data = await res.json();
          setMarketData(data);
        }
      } catch (error) {
        console.error('Failed to fetch market data:', error);
      } finally {
        setMarketLoading(false);
      }
    }
    
    fetchMarketData();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchMarketData, 60000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Use financials from UserProvider (already computed)
  const calculateNetWorth = () => {
    if (!financials) return { assets: 0, liabilities: 0, netWorth: 0, cashTotal: 0, retirementTotal: 0, investmentTotal: 0, otherTotal: 0 };
    
    return {
      assets: financials.netWorth + financials.totalLiabilities,
      liabilities: financials.totalLiabilities,
      netWorth: financials.netWorth,
      cashTotal: financials.totalCash,
      retirementTotal: financials.totalRetirement,
      investmentTotal: financials.totalInvestments,
      otherTotal: financials.totalOtherAssets
    };
  };

  // Crypto symbols that we have real-time prices for
  const CRYPTO_SYMBOLS = new Set(['BTC', 'ETH', 'SOL', 'TAO']);

  const getAllHoldings = (): Holding[] => {
    if (!profile) return [];
    return [...(profile.retirementAccounts || []), ...(profile.investmentAccounts || [])]
      .flatMap(a => a.holdings || [])
      .filter(h => h.currentValue && h.currentValue > 0);
  };

  // Enhance holdings with real-time crypto prices from market data
  const getEnhancedHoldings = useMemo((): Holding[] => {
    const baseHoldings = getAllHoldings();
    
    if (!marketData?.crypto) return baseHoldings;
    
    return baseHoldings.map(h => {
      const ticker = h.ticker.toUpperCase();
      
      // Check if this is a crypto holding we have real-time data for
      if (CRYPTO_SYMBOLS.has(ticker)) {
        const cryptoData = marketData.crypto[ticker as keyof typeof marketData.crypto];
        if (cryptoData?.price && h.shares) {
          const liveValue = h.shares * cryptoData.price;
          return {
            ...h,
            currentPrice: cryptoData.price,
            currentValue: liveValue
          };
        }
      }
      
      return h;
    });
  }, [profile, marketData]);

  const netWorth = calculateNetWorth();
  const allHoldings = getEnhancedHoldings;
  const totalInvested = allHoldings.reduce((sum, h) => sum + (h.currentValue || 0), 0);

  // Fetch fund profiles for all holdings (real-time Morningstar data)
  useEffect(() => {
    if (allHoldings.length > 0) {
      const tickers = allHoldings.map(h => h.ticker);
      fetchProfiles(tickers);
    }
  }, [allHoldings.length, fetchProfiles]);

  // Fallback categorization (used while fund profiles load)
  const categorizeHoldingsFallback = (): { usEquity: number; intlEquity: number; fixedIncome: number; crypto: number; cash: number } => {
    const categories = { usEquity: 0, intlEquity: 0, fixedIncome: 0, crypto: 0, cash: 0 };
    
    // Classification database - primaryClass determines where value goes
    const CLASSIFICATIONS: Record<string, 'usEquity' | 'intlEquity' | 'fixedIncome' | 'crypto' | 'cash'> = {
      // Cash & Money Market
      'CASH': 'cash', 'CASH-USD': 'cash', 'USD': 'cash',
      'SPAXX': 'cash', 'VMFXX': 'cash', 'SWVXX': 'cash', 'FDRXX': 'cash', 'SPRXX': 'cash',
      
      // Pure Crypto
      'BTC': 'crypto', 'ETH': 'crypto', 'SOL': 'crypto', 'TAO': 'crypto',
      'AVAX': 'crypto', 'LINK': 'crypto', 'DOT': 'crypto', 'ADA': 'crypto',
      'XRP': 'crypto', 'DOGE': 'crypto', 'MATIC': 'crypto',
      
      // Crypto ETFs/ETPs (hold actual crypto)
      'IBIT': 'crypto', 'FBTC': 'crypto', 'GBTC': 'crypto', 'ETHE': 'crypto',
      'ARKB': 'crypto', 'BITB': 'crypto', 'TAOX': 'crypto',
      
      // International/Global Equity
      'VXUS': 'intlEquity', 'VEA': 'intlEquity', 'VWO': 'intlEquity',
      'IEFA': 'intlEquity', 'IEMG': 'intlEquity', 'EFA': 'intlEquity', 'EEM': 'intlEquity',
      'VT': 'intlEquity', // World stock is majority intl for diversification purposes
      
      // American Funds - Global/International
      'ANEFX': 'intlEquity', 'ANEFF': 'intlEquity', 'ANEWX': 'intlEquity', // New Economy - Emerging Markets
      'ANWFX': 'intlEquity', 'ANWAX': 'intlEquity', 'RNPFX': 'intlEquity', // New Perspective - World Stock
      'AEPFX': 'intlEquity', 'AEPAX': 'intlEquity', 'RERGX': 'intlEquity', // EuroPacific Growth
      'SMCFX': 'intlEquity', 'SMCWX': 'intlEquity', 'RLLGX': 'intlEquity', // Smallcap World
      'CFAFX': 'intlEquity', 'CWGFX': 'intlEquity', 'RWIFX': 'intlEquity', // Capital World G&I
      
      // Fixed Income / Bonds
      'BND': 'fixedIncome', 'AGG': 'fixedIncome', 'VBTLX': 'fixedIncome',
      'FBNDX': 'fixedIncome', 'BFAFX': 'fixedIncome', 'RBFGX': 'fixedIncome',
      'TEBFX': 'fixedIncome', 'AFTFX': 'fixedIncome', 'INTFX': 'fixedIncome',
      'IBAFX': 'fixedIncome', 'PZRMX': 'fixedIncome', 'PGBZX': 'fixedIncome',
      'TLT': 'fixedIncome', 'IEF': 'fixedIncome', 'SHY': 'fixedIncome',
      'LQD': 'fixedIncome', 'HYG': 'fixedIncome', 'JNK': 'fixedIncome',
      'MUB': 'fixedIncome', 'VTEB': 'fixedIncome', // Muni bonds
      
      // American Funds - US Equity
      'GFFFX': 'usEquity', 'GFFAX': 'usEquity', 'RGAFX': 'usEquity', 'AGTHX': 'usEquity', // Growth Fund
      'AFIFX': 'usEquity', 'AFAFX': 'usEquity', 'RFNFX': 'usEquity', // Fundamental Investors
      'AIVSX': 'usEquity', 'WSHFX': 'usEquity', 'RWMFX': 'usEquity', // Washington Mutual
      'AMRFX': 'usEquity', 'AMFFX': 'usEquity', 'RMFGX': 'usEquity', // American Mutual
      'ANCFX': 'usEquity', 'CAIFX': 'usEquity', 'RIRFX': 'usEquity', // Capital Income Builder (mostly US)
      'ABNFX': 'usEquity', 'BALFX': 'usEquity', 'RLBFX': 'usEquity', // American Balanced
      'IGFFX': 'usEquity', 'IFAFX': 'usEquity', 'RIDAX': 'usEquity', // Income Fund of America
      
      // US Index Funds & ETFs
      'VTI': 'usEquity', 'VOO': 'usEquity', 'IVV': 'usEquity', 'SPY': 'usEquity',
      'QQQ': 'usEquity', 'QQQM': 'usEquity', 'DIA': 'usEquity',
      'SCHD': 'usEquity', 'SCHB': 'usEquity', 'SCHX': 'usEquity',
      'FXAIX': 'usEquity', 'FSKAX': 'usEquity', 'FCNTX': 'usEquity',
      'VIG': 'usEquity', 'VYM': 'usEquity', 'VNQ': 'usEquity', // REITs = US Equity for this purpose
      
      // Bitcoin miners / Crypto-adjacent (these are US-listed stocks)
      'CIFR': 'usEquity', 'IREN': 'usEquity', 'MARA': 'usEquity', 'RIOT': 'usEquity',
      'CLSK': 'usEquity', 'HUT': 'usEquity', 'BITF': 'usEquity',
      'MSTR': 'usEquity', 'COIN': 'usEquity',
    };
    
    allHoldings.forEach(h => {
      const ticker = h.ticker.toUpperCase();
      const value = h.currentValue || 0;
      
      const classification = CLASSIFICATIONS[ticker];
      if (classification) {
        categories[classification] += value;
      } else {
        // Default unknown tickers to US equity (most common case for US-listed stocks)
        categories.usEquity += value;
      }
    });

    return categories;
  };

  // Categorize holdings using real Morningstar data from fund profiles
  const portfolioCategories = useMemo(() => {
    // Use real fund profiles if available, otherwise fall back to basic classification
    if (Object.keys(fundProfiles).length > 0) {
      const cats = categorizeWithProfiles(allHoldings, fundProfiles);
      // Map to expected structure (fixedIncome = bonds)
      return {
        usEquity: cats.usEquity,
        intlEquity: cats.intlEquity,
        fixedIncome: cats.bonds,
        crypto: cats.crypto,
        cash: cats.cash
      };
    }
    
    // Fallback to basic classification while loading
    return categorizeHoldingsFallback();
  }, [allHoldings, fundProfiles, categorizeHoldingsFallback]);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Welcome Flow for First-Time Visitors */}
      {showWelcome && (
        <WelcomeFlow onComplete={() => setShowWelcome(false)} />
      )}

      {/* Header */}
      <Header 
        profile={profile ? {
          firstName: profile.firstName,
          netWorth: netWorth.netWorth,
          totalInvestments: totalInvested
        } : null}
        showFinancialSummary={false}
      />

      {/* Loading State */}
      {profileLoading && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="animate-pulse space-y-6">
            {/* Header skeleton */}
            <div className="flex justify-between items-end">
              <div>
                <div className="h-4 w-32 bg-white/10 rounded mb-2" />
                <div className="h-8 w-64 bg-white/10 rounded" />
              </div>
              <div className="h-20 w-48 bg-white/10 rounded-2xl" />
            </div>
            {/* Cards skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-white/5 rounded-xl" />
              ))}
            </div>
            {/* Content skeleton */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-64 bg-white/5 rounded-2xl" />
              <div className="h-64 bg-white/5 rounded-2xl" />
            </div>
          </div>
        </main>
      )}

      {!profileLoading && (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* ==================== ONBOARDED USER HERO ==================== */}
        {isOnboarded && profile && (
          <>
            {/* Net Worth Hero with Pie Chart */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-900 border border-indigo-500/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6 sm:mb-8 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
              
              <div className="relative">
                <div className="flex flex-col lg:flex-row gap-8 items-center">
                  {/* Left: Net Worth + Stats */}
                  <div className="flex-1 w-full">
                    <p className="text-gray-400 text-sm mb-1">{getGreeting()}, {profile.firstName}</p>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Your Wealth Dashboard</h2>
                    
                    {/* Big Net Worth Number */}
                    <div className="mb-6">
                      <p className="text-sm text-gray-400 mb-1">Total Net Worth</p>
                      <p className="text-4xl sm:text-5xl font-bold text-white">
                        ${netWorth.netWorth.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    
                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-xs text-gray-500">Cash</p>
                        <p className="text-lg font-semibold text-emerald-400">${netWorth.cashTotal.toLocaleString()}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-xs text-gray-500">Retirement</p>
                        <p className="text-lg font-semibold text-blue-400">${netWorth.retirementTotal.toLocaleString()}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-xs text-gray-500">Investments</p>
                        <p className="text-lg font-semibold text-purple-400">${netWorth.investmentTotal.toLocaleString()}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-xs text-gray-500">Liabilities</p>
                        <p className="text-lg font-semibold text-red-400">-${netWorth.liabilities.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right: Portfolio Pie Chart */}
                  {totalInvested > 0 && (
                    <div className="w-full lg:w-80 flex-shrink-0">
                      <div className="bg-white/5 rounded-2xl p-6">
                        <h3 className="text-sm font-medium text-gray-400 mb-4 text-center">Portfolio Allocation</h3>
                        
                        {/* SVG Pie Chart */}
                        <div className="relative w-48 h-48 mx-auto mb-4">
                          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                            {(() => {
                              const data = [
                                { value: portfolioCategories.usEquity, color: '#3B82F6', label: 'US Equity' },
                                { value: portfolioCategories.intlEquity, color: '#8B5CF6', label: "Int'l" },
                                { value: portfolioCategories.fixedIncome, color: '#10B981', label: 'Bonds' },
                                { value: portfolioCategories.crypto, color: '#F97316', label: 'Crypto' },
                                { value: portfolioCategories.cash, color: '#6B7280', label: 'Cash' },
                              ].filter(d => d.value > 0);
                              
                              let cumulative = 0;
                              const radius = 40;
                              const circumference = 2 * Math.PI * radius;
                              
                              return data.map((segment, idx) => {
                                const percentage = segment.value / totalInvested;
                                const strokeDasharray = `${percentage * circumference} ${circumference}`;
                                const strokeDashoffset = -cumulative * circumference;
                                cumulative += percentage;
                                
                                return (
                                  <circle
                                    key={idx}
                                    cx="50"
                                    cy="50"
                                    r={radius}
                                    fill="none"
                                    stroke={segment.color}
                                    strokeWidth="20"
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={strokeDashoffset}
                                    className="transition-all duration-500"
                                  />
                                );
                              });
                            })()}
                          </svg>
                          {/* Center text */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <p className="text-2xl font-bold text-white">${(totalInvested / 1000).toFixed(0)}K</p>
                            <p className="text-xs text-gray-500">Invested</p>
                          </div>
                        </div>
                        
                        {/* Legend */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {[
                            { value: portfolioCategories.usEquity, color: 'bg-blue-500', label: 'US Equity' },
                            { value: portfolioCategories.intlEquity, color: 'bg-purple-500', label: "Int'l" },
                            { value: portfolioCategories.fixedIncome, color: 'bg-emerald-500', label: 'Bonds' },
                            { value: portfolioCategories.crypto, color: 'bg-orange-500', label: 'Crypto' },
                            { value: portfolioCategories.cash, color: 'bg-gray-500', label: 'Cash' },
                          ].filter(d => d.value > 0).map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${item.color}`} />
                              <span className="text-gray-400">{item.label}</span>
                              <span className="text-white ml-auto">{((item.value / totalInvested) * 100).toFixed(0)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Maven Oracle Suggestions */}
            <div className="bg-gradient-to-r from-violet-600/10 via-indigo-600/10 to-purple-600/10 border border-violet-500/20 rounded-2xl p-6 mb-6 sm:mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-xl">
                  🔮
                </div>
                <div>
                  <h3 className="font-semibold text-white">Maven Oracle Suggestions</h3>
                  <p className="text-xs text-gray-400">Personalized insights based on your portfolio</p>
                </div>
                <a 
                  href="/oracle"
                  className="ml-auto px-3 py-1.5 bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 text-sm rounded-lg transition"
                >
                  Open Oracle →
                </a>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Dynamic suggestions based on portfolio */}
                {portfolioCategories.crypto > totalInvested * 0.15 && (
                  <button
                    onClick={() => {
                      localStorage.setItem('maven_chat_prompt', 'My crypto allocation is over 15%. Should I rebalance or is this okay given my goals?');
                      router.push('/oracle');
                    }}
                    className="text-left p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/30 rounded-xl transition group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🪙</span>
                      <span className="text-xs text-orange-400">High Priority</span>
                    </div>
                    <p className="text-sm text-white group-hover:text-orange-300">Review crypto allocation ({((portfolioCategories.crypto / totalInvested) * 100).toFixed(0)}%)</p>
                    <p className="text-xs text-gray-500 mt-1">Above typical threshold</p>
                  </button>
                )}
                
                {portfolioCategories.fixedIncome < totalInvested * 0.1 && profile.riskTolerance !== 'aggressive' && (
                  <button
                    onClick={() => {
                      localStorage.setItem('maven_chat_prompt', 'I have very little bond exposure. Should I add fixed income for my risk profile?');
                      router.push('/oracle');
                    }}
                    className="text-left p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 rounded-xl transition group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">📉</span>
                      <span className="text-xs text-emerald-400">Suggestion</span>
                    </div>
                    <p className="text-sm text-white group-hover:text-emerald-300">Consider adding bonds</p>
                    <p className="text-xs text-gray-500 mt-1">Low fixed income exposure</p>
                  </button>
                )}
                
                {allHoldings.some(h => h.costBasis && h.costBasis > 0 && (h.currentValue || 0) < h.costBasis * 0.9) && (
                  <button
                    onClick={() => {
                      localStorage.setItem('maven_chat_prompt', 'Scan my portfolio for tax-loss harvesting opportunities');
                      router.push('/oracle');
                    }}
                    className="text-left p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/30 rounded-xl transition group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🌾</span>
                      <span className="text-xs text-amber-400">Tax Savings</span>
                    </div>
                    <p className="text-sm text-white group-hover:text-amber-300">Tax-loss harvesting available</p>
                    <p className="text-xs text-gray-500 mt-1">Positions with unrealized losses</p>
                  </button>
                )}
                
                {Math.max(...(allHoldings.length > 0 ? allHoldings.map(h => ((h.currentValue || 0) / totalInvested) * 100) : [0])) > 20 && (
                  <button
                    onClick={() => {
                      localStorage.setItem('maven_chat_prompt', 'My largest position is over 20% of my portfolio. Analyze my concentration risk.');
                      router.push('/oracle');
                    }}
                    className="text-left p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500/30 rounded-xl transition group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">⚠️</span>
                      <span className="text-xs text-red-400">Risk Alert</span>
                    </div>
                    <p className="text-sm text-white group-hover:text-red-300">Concentration risk detected</p>
                    <p className="text-xs text-gray-500 mt-1">Single position over 20%</p>
                  </button>
                )}
                
                {/* Always show these general suggestions */}
                <button
                  onClick={() => {
                    localStorage.setItem('maven_chat_prompt', 'Analyze my portfolio and give me 3 actionable recommendations');
                    router.push('/oracle');
                  }}
                  className="text-left p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/30 rounded-xl transition group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🎯</span>
                    <span className="text-xs text-indigo-400">Analysis</span>
                  </div>
                  <p className="text-sm text-white group-hover:text-indigo-300">Get portfolio recommendations</p>
                  <p className="text-xs text-gray-500 mt-1">AI-powered optimization</p>
                </button>
                
                <button
                  onClick={() => router.push('/portfolio-lab')}
                  className="text-left p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/30 rounded-xl transition group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🧪</span>
                    <span className="text-xs text-blue-400">Tool</span>
                  </div>
                  <p className="text-sm text-white group-hover:text-blue-300">Open Portfolio Lab</p>
                  <p className="text-xs text-gray-500 mt-1">Stress test & optimize</p>
                </button>
                
                <button
                  onClick={() => router.push('/retirement-optimizer')}
                  className="text-left p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 rounded-xl transition group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🏦</span>
                    <span className="text-xs text-cyan-400">Tool</span>
                  </div>
                  <p className="text-sm text-white group-hover:text-cyan-300">Retirement Optimizer</p>
                  <p className="text-xs text-gray-500 mt-1">401(k) fees & match analysis</p>
                </button>
                
                <button
                  onClick={() => router.push('/tax-harvesting')}
                  className="text-left p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-green-500/30 rounded-xl transition group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🌾</span>
                    <span className="text-xs text-green-400">Tax Savings</span>
                  </div>
                  <p className="text-sm text-white group-hover:text-green-300">Tax-Loss Harvesting</p>
                  <p className="text-xs text-gray-500 mt-1">Turn losses into tax savings</p>
                </button>
              </div>
            </div>
          </>
        )}

        {/* ==================== NON-ONBOARDED USER INTRO ==================== */}
        {!isOnboarded && (
          <>
            {/* Meet Maven - Chat CTA */}
            <div className="bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-8 mb-6 sm:mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
              
              <div className="relative">
                <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
                  <div className="flex-1 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 rounded-full text-purple-300 text-xs sm:text-sm mb-3 sm:mb-4">
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                      Beta — Help Us Build Something Great
                    </div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">
                      👋 Meet Maven, Your AI Wealth Partner
                    </h3>
                    <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 max-w-xl">
                      I'm still learning, and I need your help to get smarter. <span className="text-purple-300">Ask me anything</span> — about investing, 
                      about what you wish this platform could do, or just to see what I'm capable of.
                    </p>
                    <button
                      onClick={() => {
                        const chatBtn = document.querySelector('[data-chat-toggle]') as HTMLButtonElement;
                        if (chatBtn) chatBtn.click();
                      }}
                      className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold rounded-xl transition transform hover:scale-105 inline-flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Start a Conversation
                    </button>
                  </div>
                  
                  {/* Intro prompts - hidden on small mobile, shown on larger */}
                  <div className="hidden sm:block w-full md:w-96 space-y-2 sm:space-y-3">
                    <p className="text-sm text-gray-400 text-center md:text-left mb-2">Not sure where to start? Try:</p>
                    {[
                      { text: "Hey Maven, tell me how you work", emoji: "🤖" },
                      { text: "What can you help me with?", emoji: "💡" },
                      { text: "I have an idea for a feature...", emoji: "✨" },
                      { text: "How should I think about asset allocation?", emoji: "📊" },
                    ].map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          const chatBtn = document.querySelector('[data-chat-toggle]') as HTMLButtonElement;
                          if (chatBtn) chatBtn.click();
                          localStorage.setItem('maven_chat_prompt', prompt.text);
                        }}
                        className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-xl text-xs sm:text-sm text-gray-300 hover:text-white transition group flex items-center gap-2 sm:gap-3"
                      >
                        <span className="text-base sm:text-lg">{prompt.emoji}</span>
                        <span className="truncate">"{prompt.text}"</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Oracle - The Central Intelligence */}
            <a 
              href="/oracle"
              className="block bg-gradient-to-r from-violet-600/20 via-indigo-600/20 to-purple-600/20 border border-violet-500/30 hover:border-violet-400/50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 mb-6 sm:mb-8 transition group"
            >
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-3xl sm:text-4xl flex-shrink-0">
                  🔮
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <h3 className="text-lg sm:text-xl font-bold text-white">Maven Oracle</h3>
                    <span className="text-xs px-2 py-0.5 bg-violet-500/30 text-violet-300 rounded-full">NEW</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Your AI wealth partner that sees everything. Deep analysis, proactive insights, tax optimization — all in one conversation.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="px-4 py-2 bg-violet-500/20 group-hover:bg-violet-500/30 text-violet-300 rounded-lg text-sm font-medium transition">
                    Open Oracle →
                  </span>
                </div>
              </div>
            </a>
          </>
        )}

        {/* ==================== ADVISOR MODE BANNER ==================== */}
        {/* Hidden from client view - advisors access via advisor.mavenwealth.ai or direct /advisor URL */}
        {/* TODO: Add role-based check when Clerk organizations are set up */}

        {/* ==================== PRIMARY TOOLS ==================== */}
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">🎯 Primary Tools</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
          
          {/* Maven Oracle - Featured */}
          <a 
            href="/oracle"
            className="bg-gradient-to-br from-violet-900/50 to-purple-900/30 border border-violet-500/30 hover:border-violet-400/50 hover:shadow-lg hover:shadow-violet-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-200 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform shadow-lg shadow-violet-500/30">
                  🔮
                </div>
                <span className="text-xs px-2 py-1 bg-violet-500/30 text-violet-300 rounded-full">AI</span>
              </div>
              <h4 className="font-semibold text-white text-sm sm:text-base mb-1 group-hover:text-violet-300 transition-colors">Maven Oracle</h4>
              <p className="text-xs sm:text-sm text-gray-400">Ask anything</p>
            </div>
          </a>
          
          {/* Portfolio Lab */}
          <a 
            href="/portfolio-lab"
            className="bg-[#12121a] border border-white/10 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500/30 to-cyan-600/30 border border-blue-500/20 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                🧪
              </div>
              <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">Analysis</span>
            </div>
            <h4 className="font-semibold text-white text-sm sm:text-base mb-1 group-hover:text-blue-300 transition-colors">Portfolio Lab</h4>
            <p className="text-xs sm:text-sm text-gray-500">Optimize & stress test</p>
          </a>
          
          {/* Market Fragility Index - Featured */}
          <a 
            href="/fragility"
            className="bg-gradient-to-br from-orange-900/40 to-red-900/30 border border-orange-500/30 hover:border-orange-400/50 hover:shadow-lg hover:shadow-orange-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-200 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/30">
                  📊
                </div>
                <span className="text-xs px-2 py-1 bg-orange-500/30 text-orange-300 rounded-full">Live</span>
              </div>
              <h4 className="font-semibold text-white text-sm sm:text-base mb-1 group-hover:text-orange-300 transition-colors">Fragility Index™</h4>
              <p className="text-xs sm:text-sm text-gray-400">Market risk conditions</p>
            </div>
          </a>
          
          {/* Retirement Hub - Featured */}
          <a 
            href="/retirement"
            className="bg-gradient-to-br from-emerald-900/40 to-teal-900/30 border border-emerald-500/30 hover:border-emerald-400/50 hover:shadow-lg hover:shadow-emerald-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-200 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/30">
                  🎯
                </div>
                <span className="text-xs px-2 py-1 bg-emerald-500/30 text-emerald-300 rounded-full">Plan</span>
              </div>
              <h4 className="font-semibold text-white text-sm sm:text-base mb-1 group-hover:text-emerald-300 transition-colors">Retirement Hub</h4>
              <p className="text-xs sm:text-sm text-gray-400">Monte Carlo + Planning</p>
            </div>
          </a>
          
          {/* Financial Snapshot / Build Profile */}
          {isOnboarded ? (
            <a 
              href="/financial-snapshot"
              className="bg-[#12121a] border border-white/10 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-500/30 to-green-600/30 border border-emerald-500/20 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                  📸
                </div>
                <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">Plan</span>
              </div>
              <h4 className="font-semibold text-white text-sm sm:text-base mb-1 group-hover:text-emerald-300 transition-colors">Financial Snapshot</h4>
              <p className="text-xs sm:text-sm text-gray-500">Road to retirement</p>
            </a>
          ) : (
            <a 
              href="/onboarding"
              className="bg-[#12121a] border border-white/10 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-500/30 to-blue-600/30 border border-indigo-500/20 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-full">Start</span>
              </div>
              <h4 className="font-semibold text-white text-sm sm:text-base mb-1 group-hover:text-indigo-300 transition-colors">Build Your Profile</h4>
              <p className="text-xs sm:text-sm text-gray-500">Tell Maven about you</p>
            </a>
          )}
        </div>
        
        {/* ==================== ADDITIONAL TOOLS (Collapsible) ==================== */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => setShowAdditionalTools(!showAdditionalTools)}
            className="w-full flex items-center justify-between bg-[#12121a] border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 transition mb-3"
          >
            <span className="text-sm font-medium text-white flex items-center gap-2">
              <span>🛠</span>
              Additional Tools
              <span className="text-xs text-gray-500">(18 more)</span>
            </span>
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showAdditionalTools ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showAdditionalTools && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-in slide-in-from-top-2 duration-200">
              
              {/* Social Security */}
              <a 
                href="/social-security"
                className="bg-[#12121a] border border-white/10 hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-teal-500/30 to-emerald-600/30 border border-teal-500/20 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                    🛡️
                  </div>
                  <span className="text-xs px-2 py-1 bg-teal-500/20 text-teal-400 rounded-full">Plan</span>
                </div>
                <h4 className="font-semibold text-white text-sm sm:text-base mb-1 group-hover:text-teal-300 transition-colors">Social Security</h4>
                <p className="text-xs sm:text-sm text-gray-500">Optimize when to claim</p>
              </a>
              
              {/* Retirement Optimizer */}
              <a 
                href="/retirement-optimizer"
                className="bg-[#12121a] border border-white/10 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-500/20 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                    🏦
                  </div>
                  <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-full">401k</span>
                </div>
                <h4 className="font-semibold text-white text-sm sm:text-base mb-1 group-hover:text-cyan-300 transition-colors">Retirement Optimizer</h4>
                <p className="text-xs sm:text-sm text-gray-500">401k fees & match</p>
              </a>
              
              {/* What-If Scenarios */}
              <a 
                href="/scenarios"
                className="bg-[#12121a] border border-white/10 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-600/30 border border-indigo-500/20 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                    🔮
                  </div>
                  <span className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-full">Plan</span>
                </div>
                <h4 className="font-semibold text-white text-sm sm:text-base mb-1 group-hover:text-indigo-300 transition-colors">What-If Scenarios</h4>
                <p className="text-xs sm:text-sm text-gray-500">Model life changes</p>
              </a>
              
              {/* Roth Converter */}
              <a 
                href="/oracle"
                onClick={(e) => {
                  e.preventDefault();
                  localStorage.setItem('maven_chat_prompt', 'Should I do a Roth conversion this year? Analyze my situation.');
                  localStorage.setItem('maven_chat_autosubmit', 'true');
                  router.push('/oracle');
                }}
                className="bg-[#12121a] border border-white/10 hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-pink-500/30 to-rose-600/30 border border-pink-500/20 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                    🔄
                  </div>
                  <span className="text-xs px-2 py-1 bg-pink-500/20 text-pink-400 rounded-full">AI</span>
                </div>
                <h4 className="font-semibold text-white text-sm sm:text-base mb-1 group-hover:text-pink-300 transition-colors">Roth Converter</h4>
                <p className="text-xs sm:text-sm text-gray-500">Optimize conversions</p>
              </a>
              
              {/* Rebalancing */}
              <a 
                href="/oracle"
                onClick={(e) => {
                  e.preventDefault();
                  localStorage.setItem('maven_chat_prompt', 'Analyze my current allocation and suggest rebalancing trades');
                  localStorage.setItem('maven_chat_autosubmit', 'true');
                  router.push('/oracle');
                }}
                className="bg-[#12121a] border border-white/10 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-violet-600/30 border border-purple-500/20 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                    ⚖️
                  </div>
                  <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">AI</span>
                </div>
                <h4 className="font-semibold text-white text-sm sm:text-base mb-1 group-hover:text-purple-300 transition-colors">Rebalancing</h4>
                <p className="text-xs sm:text-sm text-gray-500">Get back on target</p>
              </a>
              
              {/* Investment Thesis */}
              <a 
                href="/investment-thesis"
                className="bg-[#12121a] border border-white/10 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-600/30 border border-amber-500/20 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                    📊
                  </div>
                  <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full">New</span>
                </div>
                <h4 className="font-semibold text-white text-sm sm:text-base mb-1 group-hover:text-amber-300 transition-colors">Investment Thesis</h4>
                <p className="text-xs sm:text-sm text-gray-500">Why we recommend what we recommend</p>
              </a>
              
              {/* Fund X-Ray */}
              <a 
                href="/fund-xray"
                className="bg-[#12121a] border border-white/10 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-violet-600/30 border border-purple-500/20 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                    🔬
                  </div>
                  <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">New</span>
                </div>
                <h4 className="font-semibold text-white text-sm sm:text-base mb-1 group-hover:text-purple-300 transition-colors">Fund X-Ray</h4>
                <p className="text-xs sm:text-sm text-gray-500">See through your funds</p>
              </a>
              
              {/* Risk Analysis */}
              <a 
                href="/oracle"
                onClick={(e) => {
                  e.preventDefault();
                  localStorage.setItem('maven_chat_prompt', 'What are my biggest portfolio risks right now?');
                  localStorage.setItem('maven_chat_autosubmit', 'true');
                  router.push('/oracle');
                }}
                className="bg-[#12121a] border border-white/10 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-red-500/30 to-orange-600/30 border border-red-500/20 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                    ⚠️
                  </div>
                  <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full">AI</span>
                </div>
                <h4 className="font-semibold text-white text-sm sm:text-base mb-1 group-hover:text-red-300 transition-colors">Risk Analysis</h4>
                <p className="text-xs sm:text-sm text-gray-500">Spot vulnerabilities</p>
              </a>
              
              {/* Link Accounts */}
              <a 
                href="/accounts"
                className="bg-[#12121a] border border-white/10 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-500/30 to-green-600/30 border border-emerald-500/20 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                    🔗
                  </div>
                  <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">Beta</span>
                </div>
                <h4 className="font-semibold text-white text-sm sm:text-base mb-1 group-hover:text-emerald-300 transition-colors">Link Accounts</h4>
                <p className="text-xs sm:text-sm text-gray-500">Connect via Plaid</p>
              </a>
              
              {/* Collaborative Planning */}
              <a 
                href="/collaborate"
                className="bg-[#12121a] border border-white/10 hover:border-sky-500/50 hover:shadow-lg hover:shadow-sky-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-sky-500/30 to-blue-600/30 border border-sky-500/20 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                    👥
                  </div>
                  <span className="text-xs px-2 py-1 bg-sky-500/20 text-sky-400 rounded-full">Live</span>
                </div>
                <h4 className="font-semibold text-white text-sm sm:text-base mb-1 group-hover:text-sky-300 transition-colors">Collaborative Planning</h4>
                <p className="text-xs sm:text-sm text-gray-500">Plan together in real-time</p>
              </a>
              
              {/* ========== RETIREMENT PLANNING SUITE ========== */}
              
              {/* Retirement Hub - Featured */}
              <a 
                href="/retirement"
                className="bg-gradient-to-br from-emerald-900/40 to-teal-900/30 border border-emerald-500/30 hover:border-emerald-400/50 hover:shadow-lg hover:shadow-emerald-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-200 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/30">
                      🎯
                    </div>
                    <span className="text-xs px-2 py-1 bg-emerald-500/30 text-emerald-300 rounded-full">New</span>
                  </div>
                  <h4 className="font-semibold text-white text-sm sm:text-base mb-1 group-hover:text-emerald-300 transition-colors">Retirement Hub</h4>
                  <p className="text-xs sm:text-sm text-gray-400">Complete planning center</p>
                </div>
              </a>
              
              {/* Monte Carlo */}
              <a 
                href="/monte-carlo"
                className="bg-[#12121a] border border-white/10 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-violet-600/30 border border-purple-500/20 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                    🎲
                  </div>
                  <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">97yr</span>
                </div>
                <h4 className="font-semibold text-white text-sm sm:text-base mb-1 group-hover:text-purple-300 transition-colors">Monte Carlo</h4>
                <p className="text-xs sm:text-sm text-gray-500">1000+ simulations</p>
              </a>
              
              {/* Safe Withdrawal */}
              <a 
                href="/safe-withdrawal"
                className="bg-[#12121a] border border-white/10 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-500/30 to-yellow-600/30 border border-amber-500/20 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                    💰
                  </div>
                  <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full">SWR</span>
                </div>
                <h4 className="font-semibold text-white text-sm sm:text-base mb-1 group-hover:text-amber-300 transition-colors">Safe Withdrawal</h4>
                <p className="text-xs sm:text-sm text-gray-500">Historical analysis</p>
              </a>
              
              {/* Stress Test */}
              <a 
                href="/stress-test"
                className="bg-[#12121a] border border-white/10 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-red-500/30 to-orange-600/30 border border-red-500/20 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                    ⚡
                  </div>
                  <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full">8 Crises</span>
                </div>
                <h4 className="font-semibold text-white text-sm sm:text-base mb-1 group-hover:text-red-300 transition-colors">Stress Test</h4>
                <p className="text-xs sm:text-sm text-gray-500">GFC, COVID, Dot-Com...</p>
              </a>
              
              {/* Sensitivity Analysis */}
              <a 
                href="/sensitivity"
                className="bg-[#12121a] border border-white/10 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-500/30 to-blue-600/30 border border-indigo-500/20 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                    🌪️
                  </div>
                  <span className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-full">What-If</span>
                </div>
                <h4 className="font-semibold text-white text-sm sm:text-base mb-1 group-hover:text-indigo-300 transition-colors">Sensitivity</h4>
                <p className="text-xs sm:text-sm text-gray-500">Tornado charts</p>
              </a>
              
              {/* Market Outlook */}
              <a 
                href="/market-outlook"
                className="bg-[#12121a] border border-white/10 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500/30 to-cyan-600/30 border border-blue-500/20 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                    📈
                  </div>
                  <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">CAPE</span>
                </div>
                <h4 className="font-semibold text-white text-sm sm:text-base mb-1 group-hover:text-blue-300 transition-colors">Market Outlook</h4>
                <p className="text-xs sm:text-sm text-gray-500">Valuation indicators</p>
              </a>
              
              {/* Asset Location */}
              <a 
                href="/asset-location"
                className="bg-[#12121a] border border-white/10 hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-teal-500/30 to-green-600/30 border border-teal-500/20 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                    🗂️
                  </div>
                  <span className="text-xs px-2 py-1 bg-teal-500/20 text-teal-400 rounded-full">Tax</span>
                </div>
                <h4 className="font-semibold text-white text-sm sm:text-base mb-1 group-hover:text-teal-300 transition-colors">Asset Location</h4>
                <p className="text-xs sm:text-sm text-gray-500">Optimize placement</p>
              </a>
              
              {/* Income Planning */}
              <a 
                href="/income"
                className="bg-[#12121a] border border-white/10 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-green-500/30 to-emerald-600/30 border border-green-500/20 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform">
                    💵
                  </div>
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">Plan</span>
                </div>
                <h4 className="font-semibold text-white text-sm sm:text-base mb-1 group-hover:text-green-300 transition-colors">Income Planning</h4>
                <p className="text-xs sm:text-sm text-gray-500">Distribution strategy</p>
              </a>
            </div>
          )}
        </div>

        {/* NOT ONBOARDED: Get Started CTA */}
        {!isOnboarded && (
          <>
            <div 
              onClick={() => router.push('/onboarding')}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600/80 via-purple-600/80 to-pink-600/80 border border-purple-500/30 cursor-pointer group mb-8 hover:border-purple-400/50 transition"
            >
              <div className="relative p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/10 flex items-center justify-center text-2xl sm:text-3xl">
                        👋
                      </div>
                    </div>
                    <div className="flex-1 sm:hidden">
                      <h3 className="text-lg font-bold text-white">
                        Let Maven Get to Know You
                      </h3>
                      <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-purple-200">5 min</span>
                    </div>
                  </div>
                  <div className="flex-1 hidden sm:block">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-white">
                        Let Maven Get to Know You
                      </h3>
                      <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-purple-200">5 min</span>
                    </div>
                    <p className="text-sm text-purple-200/80">
                      Complete your profile to unlock personalized insights, portfolio analysis, and tax optimization.
                    </p>
                  </div>
                  <p className="text-sm text-purple-200/80 sm:hidden">
                    Complete your profile to unlock personalized insights and recommendations.
                  </p>
                  <button className="w-full sm:w-auto flex-shrink-0 px-5 py-2.5 bg-white text-purple-700 font-semibold rounded-lg hover:bg-purple-50 transition text-sm group-hover:scale-105 transform text-center">
                    Get Started →
                  </button>
                </div>
              </div>
            </div>

            {/* Feature Preview Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-2xl mb-4">
                  📊
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Portfolio Intelligence</h3>
                <p className="text-sm text-gray-400">
                  See your complete asset allocation, concentration risks, and get AI-powered rebalancing recommendations.
                </p>
              </div>
              <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-2xl mb-4">
                  🎯
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">All-Star Model Builder</h3>
                <p className="text-sm text-gray-400">
                  Build portfolios from the best ideas of Vanguard, BlackRock, Capital Group, and more — weighted by Sharpe ratio.
                </p>
              </div>
              <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-2xl mb-4">
                  🧠
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">AI Wealth Partner</h3>
                <p className="text-sm text-gray-400">
                  Get personalized insights, tax-loss harvesting opportunities, and actionable recommendations daily.
                </p>
              </div>
            </div>
          </>
        )}

        {/* ONBOARDED: Additional Dashboard Sections */}
        {isOnboarded && profile && (
          <>
            {/* Expandable Accounts List */}
            <div className="mb-8">
              <button
                onClick={() => setShowAllAccounts(!showAllAccounts)}
                className="w-full flex items-center justify-between bg-[#12121a] border border-white/10 hover:border-white/20 rounded-xl px-4 py-3 transition"
              >
                <span className="text-sm font-medium text-white">
                  {showAllAccounts ? 'Hide' : 'Show'} All Accounts ({(profile.cashAccounts?.length || 0) + (profile.retirementAccounts?.length || 0) + (profile.investmentAccounts?.length || 0)})
                </span>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform ${showAllAccounts ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showAllAccounts && (
                <div className="mt-3 bg-[#12121a] border border-white/10 rounded-xl divide-y divide-white/5 overflow-hidden">
                  {/* Cash Accounts */}
                  {profile.cashAccounts?.length > 0 && (
                    <div className="p-4">
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Cash Accounts</h4>
                      <div className="space-y-2">
                        {profile.cashAccounts.map((acc: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium text-white">{acc.name}</p>
                              <p className="text-xs text-gray-500">{acc.institution || acc.type}</p>
                            </div>
                            <p className="text-sm font-semibold text-white">${acc.balance?.toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Retirement Accounts */}
                  {profile.retirementAccounts?.length > 0 && (
                    <div className="p-4">
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Retirement Accounts</h4>
                      <div className="space-y-2">
                        {profile.retirementAccounts.map((acc: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium text-white">{acc.name}</p>
                              <p className="text-xs text-gray-500">{acc.type} · {acc.holdings?.length || 0} holdings</p>
                            </div>
                            <p className="text-sm font-semibold text-white">${acc.balance?.toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Investment Accounts */}
                  {profile.investmentAccounts?.length > 0 && (
                    <div className="p-4">
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Investment Accounts</h4>
                      <div className="space-y-2">
                        {profile.investmentAccounts.map((acc: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium text-white">{acc.name}</p>
                              <p className="text-xs text-gray-500">{acc.institution} · {acc.holdings?.length || 0} holdings</p>
                            </div>
                            <p className="text-sm font-semibold text-white">${acc.balance?.toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Liabilities */}
                  {profile.liabilities?.length > 0 && (
                    <div className="p-4">
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Liabilities</h4>
                      <div className="space-y-2">
                        {profile.liabilities.map((l: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium text-white">{l.name}</p>
                              <p className="text-xs text-gray-500">{l.type} · {l.interestRate}% APR</p>
                            </div>
                            <p className="text-sm font-semibold text-red-400">-${l.balance?.toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Mission Control - Gamified Dashboard */}
            <div className="mb-8">
              <MissionControl
                netWorth={netWorth.netWorth}
                previousNetWorth={netWorth.netWorth * 0.98} // TODO: Store historical data
                monthlyExpenses={5000} // TODO: Get from profile
                monthlySavings={2000} // TODO: Calculate from income - expenses
                savingsRate={0.2} // TODO: Calculate
                taxAlphaSaved={0} // TODO: Track
                contributions401k={0} // TODO: Track from holdings
                contributionsIRA={0}
                savingsStreak={3} // TODO: Track
                hasNonMortgageDebt={netWorth.liabilities > 0}
                maxPositionPercent={
                  allHoldings.length > 0 
                    ? Math.max(...allHoldings.map(h => ((h.currentValue || 0) / totalInvested) * 100))
                    : 0
                }
                harvestCount={0}
                taxHarvestOpportunity={0}
                emergencyFundTarget={15000}
                emergencyFundCurrent={netWorth.cashTotal}
                debtTotal={netWorth.liabilities}
                debtPaidThisYear={0}
                investmentReturnYTD={0.05}
              />
            </div>

            {/* Tax Alpha Counter - Money Maven Saved You */}
            <div className="mb-8">
              <TaxAlphaCounter />
            </div>

            {/* Portfolio Allocation (if holdings exist) */}
            {totalInvested > 0 && (
              <>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Allocation Chart */}
                <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">📊 Portfolio Allocation</h3>
                  
                  {/* Allocation Bar */}
                  <div className="h-6 rounded-lg overflow-hidden flex mb-4">
                    {portfolioCategories.usEquity > 0 && (
                      <div className="bg-blue-500" style={{ width: `${(portfolioCategories.usEquity / totalInvested) * 100}%` }} />
                    )}
                    {portfolioCategories.intlEquity > 0 && (
                      <div className="bg-purple-500" style={{ width: `${(portfolioCategories.intlEquity / totalInvested) * 100}%` }} />
                    )}
                    {portfolioCategories.fixedIncome > 0 && (
                      <div className="bg-emerald-500" style={{ width: `${(portfolioCategories.fixedIncome / totalInvested) * 100}%` }} />
                    )}
                    {portfolioCategories.crypto > 0 && (
                      <div className="bg-orange-500" style={{ width: `${(portfolioCategories.crypto / totalInvested) * 100}%` }} />
                    )}
                    {portfolioCategories.cash > 0 && (
                      <div className="bg-gray-400" style={{ width: `${(portfolioCategories.cash / totalInvested) * 100}%` }} />
                    )}
                  </div>

                  {/* Legend */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {portfolioCategories.usEquity > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-500" />
                        <span className="text-sm text-gray-400">US Equity</span>
                        <span className="text-sm font-medium text-white ml-auto">{((portfolioCategories.usEquity / totalInvested) * 100).toFixed(0)}%</span>
                      </div>
                    )}
                    {portfolioCategories.intlEquity > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-purple-500" />
                        <span className="text-sm text-gray-400">Int'l Equity</span>
                        <span className="text-sm font-medium text-white ml-auto">{((portfolioCategories.intlEquity / totalInvested) * 100).toFixed(0)}%</span>
                      </div>
                    )}
                    {portfolioCategories.fixedIncome > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-emerald-500" />
                        <span className="text-sm text-gray-400">Fixed Income</span>
                        <span className="text-sm font-medium text-white ml-auto">{((portfolioCategories.fixedIncome / totalInvested) * 100).toFixed(0)}%</span>
                      </div>
                    )}
                    {portfolioCategories.crypto > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-orange-500" />
                        <span className="text-sm text-gray-400">Crypto</span>
                        <span className="text-sm font-medium text-white ml-auto">{((portfolioCategories.crypto / totalInvested) * 100).toFixed(0)}%</span>
                      </div>
                    )}
                    {portfolioCategories.cash > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-gray-400" />
                        <span className="text-sm text-gray-400">Cash</span>
                        <span className="text-sm font-medium text-white ml-auto">{((portfolioCategories.cash / totalInvested) * 100).toFixed(0)}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Top Holdings */}
                <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">📋 Top Holdings</h3>
                  <div className="space-y-3">
                    {allHoldings
                      .sort((a, b) => (b.currentValue || 0) - (a.currentValue || 0))
                      .slice(0, 5)
                      .map((h, idx) => {
                        const gain = h.costBasis && h.costBasis > 0 ? (h.currentValue || 0) - h.costBasis : null;
                        const gainPercent = h.costBasis && h.costBasis > 0 ? (gain! / h.costBasis) * 100 : null;
                        return (
                          <div key={idx} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                <span className="text-sm font-bold text-white">{h.ticker.slice(0, 3)}</span>
                              </div>
                              <div>
                                <span className="font-semibold text-white">{h.ticker}</span>
                                <p className="text-xs text-gray-500 truncate max-w-[120px]">{h.name}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-white">${(h.currentValue || 0).toLocaleString()}</p>
                              {gain !== null ? (
                                <p className={`text-xs ${gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {gain >= 0 ? '+' : ''}{gainPercent?.toFixed(1)}%
                                </p>
                              ) : (
                                <p className="text-xs text-gray-500">{((h.currentValue || 0) / totalInvested * 100).toFixed(1)}% of portfolio</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  {allHoldings.length > 5 && (
                    <button 
                      onClick={() => router.push('/onboarding')}
                      className="w-full mt-4 py-2 text-sm text-indigo-400 hover:text-indigo-300 transition"
                    >
                      View all {allHoldings.length} holdings →
                    </button>
                  )}
                </div>
              </div>

            {/* Thesis Insight - Quick Check */}
            <ThesisInsight 
              allocation={{
                usEquity: (portfolioCategories.usEquity / totalInvested) * 100,
                intlEquity: (portfolioCategories.intlEquity / totalInvested) * 100,
                bonds: (portfolioCategories.fixedIncome / totalInvested) * 100,
                crypto: (portfolioCategories.crypto / totalInvested) * 100,
                cash: (portfolioCategories.cash / totalInvested) * 100,
              }}
              compact={true}
              className="mb-8"
            />
            </>
          )}

          </>
        )}

        {/* Markets - Live Data */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">{marketData?.indices?.sp500?.changePercent && marketData.indices.sp500.changePercent >= 0 ? '📈' : '📉'}</span>
              <h3 className="font-semibold text-white">Markets</h3>
              {/* Live indicator */}
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400">Live</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Market status */}
              {(() => {
                const now = new Date();
                const hour = now.getHours();
                const day = now.getDay();
                const isWeekend = day === 0 || day === 6;
                const isMarketHours = hour >= 9 && hour < 16 && !isWeekend;
                return (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${isMarketHours ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {isMarketHours ? '🟢 Market Open' : '🔴 Market Closed'}
                  </span>
                );
              })()}
              {marketData?.timestamp && (
                <span className="text-xs text-gray-500">
                  {new Date(marketData.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
              {marketLoading && <span className="text-xs text-gray-500 animate-pulse">Refreshing...</span>}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'S&P 500', data: marketData?.indices?.sp500, prefix: '', decimals: 0 },
              { label: 'Nasdaq', data: marketData?.indices?.nasdaq, prefix: '', decimals: 0 },
              { label: 'Bitcoin', data: marketData?.crypto?.BTC, prefix: '$', decimals: 0 },
              { label: 'TAO', data: marketData?.crypto?.TAO, prefix: '$', decimals: 2 },
            ].map((item, idx) => (
              <div 
                key={idx} 
                className={`bg-white/5 hover:bg-white/[0.07] rounded-xl p-4 transition-all duration-200 border border-transparent hover:border-white/10 ${
                  item.data?.changePercent !== undefined 
                    ? item.data.changePercent >= 0 
                      ? 'hover:border-emerald-500/20' 
                      : 'hover:border-red-500/20'
                    : ''
                }`}
              >
                <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                <p className="text-xl font-semibold text-white">
                  {item.data?.price 
                    ? `${item.prefix}${item.data.price.toLocaleString(undefined, { maximumFractionDigits: item.decimals })}` 
                    : '—'}
                </p>
                {item.data?.changePercent !== undefined && (
                  <p className={`text-sm font-medium ${item.data.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {item.data.changePercent >= 0 ? '↑' : '↓'} {Math.abs(item.data.changePercent).toFixed(2)}%
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-white/10 text-center">
          <p className="text-sm text-gray-500">
            Maven — AI-native wealth intelligence · Powered by 
            <span className="text-indigo-400"> Bittensor</span>
          </p>
          <p className="text-xs text-gray-600 mt-2">
            Built by Sam & Eli · 2026
          </p>
        </footer>
      </main>
      )}

      {/* Maven AI Chat */}
      <MavenChat userProfile={profile ? { firstName: profile.firstName, riskTolerance: profile.riskTolerance } : undefined} />
    </div>
  );
}
