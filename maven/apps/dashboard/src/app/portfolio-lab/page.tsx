'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import { Term } from '../components/InfoTooltip';
import { useUserProfile } from '@/providers/UserProvider';
import { decomposeFundHolding } from '@/lib/portfolio-utils';
import { ToolExplainer } from '@/app/components/ToolExplainer';
import { OracleShowcase } from '@/app/components/OracleShowcase';
import { ThesisInsight, getTradeExplanation } from '@/app/components/ThesisInsight';
import FactorExposureSection from '@/app/components/FactorExposureSection';
import FeeAnalyzer from '@/app/components/FeeAnalyzer';
import OverlapDetection from '@/app/components/OverlapDetection';
import IncomeAnalysis from '@/app/components/IncomeAnalysis';
import RebalancingPreview from '@/app/components/RebalancingPreview';
import WhatIfSimulator from '@/app/components/WhatIfSimulator';
import BenchmarkComparison from '@/app/components/BenchmarkComparison';

// Types
interface Holding {
  ticker: string;
  name?: string;
  shares: number;
  costBasis: number;
  currentPrice?: number;
  currentValue?: number;
}

interface StressScenario {
  name: string;
  description: string;
  icon: string;
  changes: {
    usEquity: number;
    intlEquity: number;
    bonds: number;
    crypto: number;
    cash: number;
  };
}

interface AllocationTarget {
  usEquity: number;
  intlEquity: number;
  bonds: number;
  crypto: number;
  cash: number;
  reits?: number;
  alternatives?: number;
}

// Tab types
type Tab = 'analysis' | 'optimize' | 'whatif' | 'stress' | 'projections' | 'actions' | 'research';

// Research data type
interface ResearchData {
  symbol: string;
  name: string;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  marketCap: number;
  peRatio: number | null;
  forwardPE: number | null;
  pegRatio: number | null;
  dividendYield: number | null;
  beta: number | null;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  avgVolume: number;
  analystRating: string;
  numberOfAnalysts: number;
  buyCount: number;
  holdCount: number;
  sellCount: number;
  strongBuyCount: number;
  strongSellCount: number;
  targetHigh: number;
  targetLow: number;
  targetMean: number;
  targetMedian: number;
  currentToTarget: number;
  earningsDate?: string;
  epsTrailingTwelveMonths: number | null;
  epsForward: number | null;
  epsGrowth: number | null;
  revenueGrowth: number | null;
  fiftyDayAvg: number;
  twoHundredDayAvg: number;
  recentNews: { title: string; link: string; publisher: string; date: string }[];
  insiderBuying: number;
  insiderSelling: number;
  mavenScore: number;
  scoreBreakdown: {
    analystConviction: number;
    valuation: number;
    momentum: number;
    quality: number;
  };
  bullCase: string[];
  bearCase: string[];
  catalysts: string[];
  risks: string[];
  // Real analyst data (when FMP is configured)
  dataSource?: 'fmp' | 'yahoo' | 'simulated';
  recentUpgradesDowngrades?: {
    date: string;
    company: string;
    action: string;
    previousGrade: string;
    newGrade: string;
    priceWhenPosted: number;
  }[];
  individualPriceTargets?: {
    date: string;
    analyst: string;
    company: string;
    priceTarget: number;
    priceWhenPosted: number;
  }[];
  nextEarningsEstimate?: {
    epsLow: number;
    epsHigh: number;
    epsAvg: number;
    revenueLow: number;
    revenueHigh: number;
    revenueAvg: number;
    numAnalysts: number;
  } | null;
  // New FMP data
  sector?: string | null;
  industry?: string | null;
  description?: string | null;
  employees?: number | null;
  // Valuation
  pbRatio?: number | null;
  psRatio?: number | null;
  evToEbitda?: number | null;
  evToSales?: number | null;
  enterpriseValue?: number | null;
  // Profitability
  grossMargin?: number | null;
  operatingMargin?: number | null;
  netMargin?: number | null;
  roe?: number | null;
  roa?: number | null;
  roic?: number | null;
  // Growth
  earningsGrowth?: number | null;
  fcfGrowth?: number | null;
  // Financial Health
  currentRatio?: number | null;
  quickRatio?: number | null;
  debtToEquity?: number | null;
  interestCoverage?: number | null;
  // Cash Flow
  freeCashFlow?: number | null;
  operatingCashFlow?: number | null;
  fcfYield?: number | null;
  // Per Share
  eps?: number | null;
  bookValuePerShare?: number | null;
  // Income
  revenue?: number | null;
  netIncome?: number | null;
  ebitda?: number | null;
  // Balance Sheet
  totalAssets?: number | null;
  totalDebt?: number | null;
  cashAndEquivalents?: number | null;
  // Dividends
  payoutRatio?: number | null;
  // Grades
  qualityGrade?: 'A' | 'B' | 'C' | 'D' | 'F';
  valuationGrade?: 'A' | 'B' | 'C' | 'D' | 'F';
  growthGrade?: 'A' | 'B' | 'C' | 'D' | 'F';
  momentumGrade?: 'A' | 'B' | 'C' | 'D' | 'F';
  // Technical
  technicalLevels?: {
    support1: number;
    support2: number;
    resistance1: number;
    resistance2: number;
    pivotPoint: number;
  };
}

// Risk profile target allocations
const RISK_TARGETS: Record<string, AllocationTarget> = {
  conservative: {
    usEquity: 25,
    intlEquity: 10,
    bonds: 50,
    crypto: 0,
    cash: 15,
    alternatives: 0
  },
  moderate: {
    usEquity: 40,
    intlEquity: 15,
    bonds: 30,
    crypto: 0,
    cash: 10,
    alternatives: 5
  },
  aggressive: {
    usEquity: 55,
    intlEquity: 20,
    bonds: 10,
    crypto: 5,
    cash: 5,
    alternatives: 5
  },
  'very-aggressive': {
    usEquity: 50,
    intlEquity: 20,
    bonds: 5,
    crypto: 15,
    cash: 5,
    alternatives: 5
  }
};

// Historical stress scenarios
const STRESS_SCENARIOS: StressScenario[] = [
  {
    name: '2008 Financial Crisis',
    description: 'Global banking collapse, credit freeze',
    icon: '🏦',
    changes: { usEquity: -38, intlEquity: -45, bonds: 5, crypto: 0, cash: 2 }
  },
  {
    name: '2020 COVID Crash',
    description: 'March 2020 pandemic selloff',
    icon: '🦠',
    changes: { usEquity: -34, intlEquity: -33, bonds: -1, crypto: -50, cash: 0 }
  },
  {
    name: '2022 Rate Hikes',
    description: 'Fed aggressive rate increases',
    icon: '📈',
    changes: { usEquity: -18, intlEquity: -16, bonds: -13, crypto: -65, cash: 4 }
  },
  {
    name: 'Dot-Com Bust',
    description: '2000-2002 tech bubble burst',
    icon: '💻',
    changes: { usEquity: -49, intlEquity: -48, bonds: 25, crypto: 0, cash: 3 }
  },
  {
    name: 'Stagflation',
    description: '1970s style: high inflation + recession',
    icon: '🔥',
    changes: { usEquity: -25, intlEquity: -20, bonds: -15, crypto: -40, cash: -5 }
  },
  {
    name: 'Flash Crash',
    description: 'Sudden liquidity crisis (1 day)',
    icon: '⚡',
    changes: { usEquity: -10, intlEquity: -12, bonds: 2, crypto: -25, cash: 0 }
  }
];

export default function PortfolioLab() {
  const router = useRouter();
  const { profile, financials, isLoading, isDemoMode } = useUserProfile();
  
  const [activeTab, setActiveTab] = useState<Tab>('analysis');
  const [customTarget, setCustomTarget] = useState<AllocationTarget | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<StressScenario | null>(null);
  const [projectionYears, setProjectionYears] = useState(20);
  const [annualContribution, setAnnualContribution] = useState(20000);
  const [expectedReturn, setExpectedReturn] = useState(7);
  
  // Live prices for demo mode (to sync with /demo page)
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  
  // Research tab state
  const [researchQuery, setResearchQuery] = useState('');
  const [researchData, setResearchData] = useState<ResearchData | null>(null);
  const [researchLoading, setResearchLoading] = useState(false);
  const [researchError, setResearchError] = useState<string | null>(null);
  const [priceTarget, setPriceTarget] = useState<number | null>(null);
  
  // Holdings table sorting state
  type HoldingSortColumn = 'name' | 'value' | 'pct' | 'gain';
  const [holdingsSortColumn, setHoldingsSortColumn] = useState<HoldingSortColumn>('value');
  const [holdingsSortDirection, setHoldingsSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Fetch live prices in demo mode (to match /demo page values)
  useEffect(() => {
    if (!isDemoMode) return;
    
    const fetchLivePrices = async () => {
      try {
        // Get all unique tickers from profile holdings
        const allTickers = [...(profile?.retirementAccounts || []), ...(profile?.investmentAccounts || [])]
          .flatMap((a: any) => a.holdings || [])
          .map((h: any) => h.ticker.toUpperCase())
          .filter((t, i, arr) => arr.indexOf(t) === i);
        
        if (allTickers.length === 0) return;
        
        const response = await fetch('/api/stock-quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbols: allTickers }),
        });
        
        if (response.ok) {
          const { quotes } = await response.json();
          const newPrices: Record<string, number> = {};
          
          for (const [symbol, quoteData] of Object.entries(quotes)) {
            const q = quoteData as { price: number };
            if (q.price > 0) {
              newPrices[symbol.toUpperCase()] = q.price;
            }
          }
          
          setLivePrices(newPrices);
        }
      } catch (error) {
        console.error('Error fetching live prices:', error);
      }
    };
    
    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 60000);
    return () => clearInterval(interval);
  }, [isDemoMode, profile]);
  
  // Fetch research data
  const fetchResearch = async (symbol: string) => {
    setResearchLoading(true);
    setResearchError(null);
    try {
      const res = await fetch(`/api/stock-research?symbol=${encodeURIComponent(symbol)}`);
      if (!res.ok) {
        throw new Error('Unable to find that ticker');
      }
      const data = await res.json();
      setResearchData(data);
      setPriceTarget(data.targetMean);
    } catch (err: any) {
      setResearchError(err.message || 'Failed to fetch research');
      setResearchData(null);
    } finally {
      setResearchLoading(false);
    }
  };
  
  // Calculate age from dateOfBirth
  const userAge = useMemo(() => {
    if (!profile?.dateOfBirth) return 35;
    const today = new Date();
    const birth = new Date(profile.dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }, [profile?.dateOfBirth]);
  
  // Get all holdings from profile, consolidating same tickers across accounts
  // In demo mode, apply live prices to match /demo page values
  const allHoldings = useMemo(() => {
    if (!profile) return [];
    
    // Get all raw holdings from all accounts
    let rawHoldings = [...(profile.retirementAccounts || []), ...(profile.investmentAccounts || [])]
      .flatMap((a: any) => a.holdings || [])
      .filter((h: Holding) => h.currentValue && h.currentValue > 0);
    
    // In demo mode, apply live prices for accuracy
    if (isDemoMode && Object.keys(livePrices).length > 0) {
      rawHoldings = rawHoldings.map((h: Holding) => {
        const ticker = h.ticker.toUpperCase();
        const livePrice = livePrices[ticker];
        if (livePrice && h.shares) {
          return {
            ...h,
            currentPrice: livePrice,
            currentValue: h.shares * livePrice,
          };
        }
        return h;
      });
    }
    
    // Cash-like tickers to consolidate
    const CASH_TICKERS = ['CASH', 'USD', 'SPAXX', 'VMFXX', 'SWVXX', 'FDRXX', 'SPRXX', 'FTEXX', 'VMMXX'];
    
    // Separate cash and non-cash holdings
    const cashHoldings = rawHoldings.filter((h: Holding) => 
      CASH_TICKERS.includes(h.ticker.toUpperCase())
    );
    const nonCashHoldings = rawHoldings.filter((h: Holding) => 
      !CASH_TICKERS.includes(h.ticker.toUpperCase())
    );
    
    // CONSOLIDATE same tickers across different accounts
    // e.g., CIFR in Roth IRA + CIFR in Taxable = one combined CIFR line
    const consolidatedByTicker = new Map<string, Holding>();
    nonCashHoldings.forEach((h: Holding) => {
      const key = h.ticker.toUpperCase();
      const existing = consolidatedByTicker.get(key);
      if (existing) {
        // Combine: add shares, cost basis, and value
        consolidatedByTicker.set(key, {
          ...existing,
          shares: (existing.shares || 0) + (h.shares || 0),
          costBasis: (existing.costBasis || 0) + (h.costBasis || 0),
          currentValue: (existing.currentValue || 0) + (h.currentValue || 0),
          // Keep the price from first occurrence (they should be same)
        });
      } else {
        consolidatedByTicker.set(key, { ...h });
      }
    });
    
    // Add cash from cashAccounts (checking, savings, money market)
    const cashAccountsTotal = (profile.cashAccounts || [])
      .reduce((sum: number, acc: any) => sum + (acc.balance || 0), 0);
    
    // Total cash from holdings + accounts
    const totalCash = cashHoldings.reduce((sum: number, h: Holding) => sum + (h.currentValue || 0), 0) + cashAccountsTotal;
    
    // Create final consolidated holdings array
    const consolidatedHoldings = Array.from(consolidatedByTicker.values());
    if (totalCash > 0) {
      consolidatedHoldings.push({
        ticker: 'CASH',
        name: 'Cash & Cash Equivalents',
        shares: totalCash,
        costBasis: totalCash, // Cash has no gain/loss
        currentPrice: 1,
        currentValue: totalCash,
      });
    }
    
    return consolidatedHoldings;
  }, [profile, isDemoMode, livePrices]);
  
  const totalValue = useMemo(() => 
    allHoldings.reduce((sum: number, h: Holding) => sum + (h.currentValue || 0), 0),
    [allHoldings]
  );
  
  // Sorted holdings for the table
  const sortedHoldings = useMemo(() => {
    const direction = holdingsSortDirection === 'desc' ? -1 : 1;
    
    return [...allHoldings].sort((a: Holding, b: Holding) => {
      switch (holdingsSortColumn) {
        case 'name':
          return direction * (a.ticker || '').localeCompare(b.ticker || '');
        case 'value':
          return direction * ((a.currentValue || 0) - (b.currentValue || 0));
        case 'pct':
          // Same as value since percentage is derived from value
          return direction * ((a.currentValue || 0) - (b.currentValue || 0));
        case 'gain':
          const gainA = a.costBasis && a.costBasis > 0 ? (a.currentValue || 0) - a.costBasis : 0;
          const gainB = b.costBasis && b.costBasis > 0 ? (b.currentValue || 0) - b.costBasis : 0;
          // Sort by gain percentage for better comparison
          const gainPctA = a.costBasis && a.costBasis > 0 ? gainA / a.costBasis : 0;
          const gainPctB = b.costBasis && b.costBasis > 0 ? gainB / b.costBasis : 0;
          return direction * (gainPctA - gainPctB);
        default:
          return 0;
      }
    });
  }, [allHoldings, holdingsSortColumn, holdingsSortDirection]);
  
  // Handle holdings sort click
  const handleHoldingsSort = (column: HoldingSortColumn) => {
    if (holdingsSortColumn === column) {
      setHoldingsSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setHoldingsSortColumn(column);
      setHoldingsSortDirection('desc');
    }
  };
  
  // Check if user holds the researched stock
  const userHolding = useMemo(() => {
    if (!researchData) return null;
    return allHoldings.find((h: Holding) => 
      h.ticker.toUpperCase() === researchData.symbol.toUpperCase()
    );
  }, [researchData, allHoldings]);
  
  // Current allocation with LOOK-THROUGH analysis for multi-asset funds
  // Global funds (VTWAX, VT, ACWI) and target-date funds are decomposed into true geographic exposure
  const currentAllocation = useMemo(() => {
    const categories = { usEquity: 0, intlEquity: 0, bonds: 0, crypto: 0, cash: 0, reits: 0, alternatives: 0 };
    
    allHoldings.forEach((h: Holding) => {
      const value = h.currentValue || 0;
      
      // Use look-through decomposition for multi-asset funds (VTWAX, VT, target-date, etc.)
      const decomposed = decomposeFundHolding(h.ticker, value);
      
      // Add decomposed values to each category
      categories.usEquity += decomposed.usEquity;
      categories.intlEquity += decomposed.intlEquity;
      categories.bonds += decomposed.bonds;
      categories.crypto += decomposed.crypto;
      categories.cash += decomposed.cash;
      categories.reits += decomposed.reits;
      categories.alternatives += decomposed.gold + decomposed.alternatives;
    });
    
    // Convert to percentages
    const total = Object.values(categories).reduce((a, b) => a + b, 0) || 1;
    return {
      usEquity: (categories.usEquity / total) * 100,
      intlEquity: (categories.intlEquity / total) * 100,
      bonds: (categories.bonds / total) * 100,
      crypto: (categories.crypto / total) * 100,
      cash: (categories.cash / total) * 100,
      reits: (categories.reits / total) * 100,
      alternatives: (categories.alternatives / total) * 100
    };
  }, [allHoldings]);
  
  // Target allocation based on risk profile
  const targetAllocation = customTarget || (profile?.riskTolerance 
    ? RISK_TARGETS[profile.riskTolerance] || RISK_TARGETS.moderate
    : RISK_TARGETS.moderate);
  
  // Calculate drift from target
  const allocationDrift = useMemo(() => {
    return {
      usEquity: currentAllocation.usEquity - targetAllocation.usEquity,
      intlEquity: currentAllocation.intlEquity - targetAllocation.intlEquity,
      bonds: currentAllocation.bonds - targetAllocation.bonds,
      crypto: currentAllocation.crypto - targetAllocation.crypto,
      cash: currentAllocation.cash - targetAllocation.cash,
      reits: currentAllocation.reits - (targetAllocation.reits || 0),
      alternatives: currentAllocation.alternatives - (targetAllocation.alternatives || 0)
    };
  }, [currentAllocation, targetAllocation]);
  
  // Generate rebalancing trades
  const rebalancingTrades = useMemo(() => {
    const trades: Array<{ action: 'buy' | 'sell'; asset: string; amount: number; reason: string }> = [];
    
    Object.entries(allocationDrift).forEach(([asset, drift]) => {
      if (Math.abs(drift) >= 3) { // 3% threshold
        const amount = Math.abs(drift) * totalValue / 100;
        trades.push({
          action: drift > 0 ? 'sell' : 'buy',
          asset: asset.replace(/([A-Z])/g, ' $1').trim(),
          amount,
          reason: drift > 0 
            ? `Overweight by ${Math.abs(drift).toFixed(1)}%` 
            : `Underweight by ${Math.abs(drift).toFixed(1)}%`
        });
      }
    });
    
    return trades.sort((a, b) => b.amount - a.amount);
  }, [allocationDrift, totalValue]);
  
  // Stress test results
  const stressTestResult = useMemo(() => {
    if (!selectedScenario) return null;
    
    const categories = { usEquity: 0, intlEquity: 0, bonds: 0, crypto: 0, cash: 0 };
    
    const classify = (ticker: string): keyof typeof categories => {
      const t = ticker.toUpperCase();
      if (['BTC', 'ETH', 'SOL', 'TAO', 'IBIT', 'FBTC', 'GBTC'].includes(t)) return 'crypto';
      if (['CASH', 'USD', 'SPAXX', 'VMFXX', 'SWVXX'].includes(t)) return 'cash';
      if (['BND', 'AGG', 'TLT', 'LQD', 'HYG'].includes(t)) return 'bonds';
      if (['VXUS', 'VEA', 'VWO', 'IEFA', 'EFA'].includes(t)) return 'intlEquity';
      return 'usEquity';
    };
    
    allHoldings.forEach((h: Holding) => {
      const cat = classify(h.ticker);
      categories[cat] += h.currentValue || 0;
    });
    
    const changes = selectedScenario.changes;
    const lossAmount = 
      categories.usEquity * (changes.usEquity / 100) +
      categories.intlEquity * (changes.intlEquity / 100) +
      categories.bonds * (changes.bonds / 100) +
      categories.crypto * (changes.crypto / 100) +
      categories.cash * (changes.cash / 100);
    
    return {
      currentValue: totalValue,
      projectedValue: totalValue + lossAmount,
      absoluteChange: lossAmount,
      percentChange: (lossAmount / totalValue) * 100,
      breakdown: {
        usEquity: { value: categories.usEquity, change: categories.usEquity * (changes.usEquity / 100) },
        intlEquity: { value: categories.intlEquity, change: categories.intlEquity * (changes.intlEquity / 100) },
        bonds: { value: categories.bonds, change: categories.bonds * (changes.bonds / 100) },
        crypto: { value: categories.crypto, change: categories.crypto * (changes.crypto / 100) },
        cash: { value: categories.cash, change: categories.cash * (changes.cash / 100) },
      }
    };
  }, [selectedScenario, allHoldings, totalValue]);
  
  // Projection data points
  const projectionData = useMemo(() => {
    const points = [];
    let currentValue = totalValue;
    const monthlyContribution = annualContribution / 12;
    const monthlyReturn = expectedReturn / 100 / 12;
    
    for (let year = 0; year <= projectionYears; year++) {
      // Compound monthly
      if (year > 0) {
        for (let month = 0; month < 12; month++) {
          currentValue = currentValue * (1 + monthlyReturn) + monthlyContribution;
        }
      }
      
      // Calculate pessimistic/optimistic scenarios
      const pessimistic = totalValue * Math.pow(1 + (expectedReturn - 3) / 100, year) + 
        annualContribution * ((Math.pow(1 + (expectedReturn - 3) / 100, year) - 1) / ((expectedReturn - 3) / 100));
      const optimistic = totalValue * Math.pow(1 + (expectedReturn + 3) / 100, year) +
        annualContribution * ((Math.pow(1 + (expectedReturn + 3) / 100, year) - 1) / ((expectedReturn + 3) / 100));
      
      points.push({
        year,
        age: userAge + year,
        expected: Math.round(currentValue),
        pessimistic: Math.round(pessimistic > 0 ? pessimistic : 0),
        optimistic: Math.round(optimistic)
      });
    }
    
    return points;
  }, [totalValue, projectionYears, annualContribution, expectedReturn, userAge]);

  // Redirect if not onboarded (only after loading is complete and demo mode is initialized)
  useEffect(() => {
    // Don't redirect while still loading
    if (isLoading) return;
    
    // Don't redirect in demo mode - demo users should see the demo portfolio
    if (isDemoMode) return;
    
    // Only redirect if no profile and not in demo mode
    if (!profile || !profile.onboardingComplete) {
      router.push('/onboarding');
    }
  }, [isLoading, profile, isDemoMode, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-pulse text-white">Loading Portfolio Lab...</div>
      </div>
    );
  }

  if (!profile) return null;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'analysis', label: 'Analysis', icon: '📊' },
    { id: 'optimize', label: 'Optimize', icon: '🎯' },
    { id: 'whatif', label: 'What-If', icon: '🔮' },
    { id: 'stress', label: 'Stress Test', icon: '🌪️' },
    { id: 'projections', label: 'Projections', icon: '📈' },
    { id: 'actions', label: 'Action Plan', icon: '✅' },
    { id: 'research', label: 'Research', icon: '🔬' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🧪</span>
            <h1 className="text-3xl font-bold text-white">Portfolio Lab</h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-gray-400">
              Deep analysis, stress testing, and optimization for your ${totalValue.toLocaleString()} portfolio
            </p>
            <ToolExplainer toolName="portfolio-lab" />
          </div>
        </div>

        {/* Tab Navigation - Mobile-optimized with larger touch targets */}
        <div className="flex gap-1.5 sm:gap-2 mb-8 p-1.5 bg-white/5 rounded-xl overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2 min-w-[48px] sm:min-w-0 px-3 sm:px-4 py-3 sm:py-2.5 rounded-lg font-medium text-sm transition flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-indigo-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-lg sm:text-base">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {/* Current Allocation vs Target */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Current */}
              <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  📊 Current <Term id="asset-allocation">Allocation</Term>
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'US Equity', value: currentAllocation.usEquity, color: 'bg-blue-500' },
                    { label: "Int'l Equity", value: currentAllocation.intlEquity, color: 'bg-purple-500' },
                    { label: 'Bonds', value: currentAllocation.bonds, color: 'bg-emerald-500' },
                    { label: 'REITs', value: currentAllocation.reits, color: 'bg-teal-500' },
                    { label: 'Crypto', value: currentAllocation.crypto, color: 'bg-orange-500' },
                    { label: 'Cash', value: currentAllocation.cash, color: 'bg-gray-400' },
                  ].filter(item => item.value > 0.5).map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">{item.label}</span>
                        <span className="text-white font-medium">{item.value.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target */}
              <div className="bg-[#12121a] border border-indigo-500/30 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  🎯 Target Allocation
                  <span className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full capitalize">
                    {profile.riskTolerance || 'moderate'}
                  </span>
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'US Equity', value: targetAllocation.usEquity, color: 'bg-blue-500' },
                    { label: "Int'l Equity", value: targetAllocation.intlEquity, color: 'bg-purple-500' },
                    { label: 'Bonds', value: targetAllocation.bonds, color: 'bg-emerald-500' },
                    { label: 'REITs', value: targetAllocation.reits || 0, color: 'bg-teal-500' },
                    { label: 'Crypto', value: targetAllocation.crypto, color: 'bg-orange-500' },
                    { label: 'Cash', value: targetAllocation.cash, color: 'bg-gray-400' },
                  ].filter(item => item.value > 0.5).map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">{item.label}</span>
                        <span className="text-white font-medium">{item.value.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Risk Metrics */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">📐 Risk Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">
                    <Term id="beta">Portfolio Beta</Term>
                  </p>
                  <p className="text-2xl font-bold text-white">1.12</p>
                  <p className="text-xs text-amber-400">Slightly aggressive</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">
                    <Term id="sharpe-ratio">Sharpe Ratio</Term>
                  </p>
                  <p className="text-2xl font-bold text-white">0.85</p>
                  <p className="text-xs text-gray-400">Estimated</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">
                    <Term id="max-drawdown">Est. Max Drawdown</Term>
                  </p>
                  <p className="text-2xl font-bold text-red-400">-32%</p>
                  <p className="text-xs text-gray-400">${(totalValue * 0.32).toLocaleString()}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">
                    <Term id="concentration-risk">Concentration</Term>
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {allHoldings.length > 0 
                      ? Math.max(...allHoldings.map((h: Holding) => ((h.currentValue || 0) / totalValue) * 100)).toFixed(0)
                      : 0}%
                  </p>
                  <p className="text-xs text-gray-400">Largest position</p>
                </div>
              </div>
            </div>

            {/* Top Holdings Detail */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">📋 Holdings Analysis</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-white/10">
                      <th 
                        className="pb-3 cursor-pointer hover:text-white transition-colors select-none"
                        onClick={() => handleHoldingsSort('name')}
                      >
                        <div className="flex items-center gap-1">
                          Holding
                          {holdingsSortColumn === 'name' && (
                            <span className="text-indigo-400">{holdingsSortDirection === 'desc' ? '↓' : '↑'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="pb-3 text-right cursor-pointer hover:text-white transition-colors select-none"
                        onClick={() => handleHoldingsSort('value')}
                      >
                        <div className="flex items-center justify-end gap-1">
                          Value
                          {holdingsSortColumn === 'value' && (
                            <span className="text-indigo-400">{holdingsSortDirection === 'desc' ? '↓' : '↑'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="pb-3 text-right cursor-pointer hover:text-white transition-colors select-none"
                        onClick={() => handleHoldingsSort('pct')}
                      >
                        <div className="flex items-center justify-end gap-1">
                          % of Portfolio
                          {holdingsSortColumn === 'pct' && (
                            <span className="text-indigo-400">{holdingsSortDirection === 'desc' ? '↓' : '↑'}</span>
                          )}
                        </div>
                      </th>
                      <th className="pb-3 text-right"><Term id="cost-basis">Cost Basis</Term></th>
                      <th 
                        className="pb-3 text-right cursor-pointer hover:text-white transition-colors select-none"
                        onClick={() => handleHoldingsSort('gain')}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <Term id="unrealized-gains">Gain/Loss</Term>
                          {holdingsSortColumn === 'gain' && (
                            <span className="text-indigo-400">{holdingsSortDirection === 'desc' ? '↓' : '↑'}</span>
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {sortedHoldings
                      .slice(0, 10)
                      .map((h: Holding, idx: number) => {
                        const pct = ((h.currentValue || 0) / totalValue) * 100;
                        const gain = h.costBasis && h.costBasis > 0 ? (h.currentValue || 0) - h.costBasis : null;
                        const gainPct = h.costBasis && h.costBasis > 0 ? (gain! / h.costBasis) * 100 : null;
                        return (
                          <tr key={idx} className="text-white">
                            <td className="py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-xs font-bold">
                                  {h.ticker.slice(0, 3)}
                                </div>
                                <div>
                                  <p className="font-medium">{h.ticker}</p>
                                  <p className="text-xs text-gray-500 truncate max-w-[150px]">{h.name}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 text-right">${(h.currentValue || 0).toLocaleString()}</td>
                            <td className="py-3 text-right">
                              <span className={pct > 10 ? 'text-amber-400' : ''}>{pct.toFixed(1)}%</span>
                            </td>
                            <td className="py-3 text-right text-gray-400">
                              {h.costBasis && h.costBasis > 0 ? `$${h.costBasis.toLocaleString()}` : '—'}
                            </td>
                            <td className={`py-3 text-right ${gain !== null ? (gain >= 0 ? 'text-emerald-400' : 'text-red-400') : 'text-gray-500'}`}>
                              {gain !== null ? (
                                <>
                                  {gain >= 0 ? '+' : ''}{gainPct?.toFixed(1)}%
                                  <span className="text-xs ml-1">({gain >= 0 ? '+' : ''}${Math.abs(gain).toLocaleString()})</span>
                                </>
                              ) : '—'}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Factor Exposure Analysis */}
            <FactorExposureSection holdings={allHoldings} />
            
            {/* Income Analysis */}
            <IncomeAnalysis holdings={allHoldings} />
            
            {/* Fee Analysis */}
            <FeeAnalyzer holdings={allHoldings} />
            
            {/* Holdings Overlap Detection */}
            <OverlapDetection holdings={allHoldings} />
            
            {/* Benchmark Comparison */}
            <BenchmarkComparison holdings={allHoldings} userAge={userAge} />
          </div>
        )}

        {activeTab === 'optimize' && (
          <div className="space-y-6">
            {/* Maven's Recommendation */}
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                  🧠
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Maven's Optimization Recommendation</h3>
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    Based on your <span className="text-indigo-400">{profile.riskTolerance || 'moderate'}</span> risk profile, 
                    {userAge ? ` ${userAge}-year age,` : ''} and goal to <span className="text-indigo-400">
                    {profile.primaryGoal?.replace(/([A-Z])/g, ' $1').toLowerCase() || 'grow wealth'}</span>, 
                    I've identified <span className="text-white font-semibold">{rebalancingTrades.length} rebalancing opportunities</span>.
                  </p>
                  
                  {/* Key insights */}
                  <div className="grid sm:grid-cols-3 gap-3 mb-4">
                    {Math.abs(allocationDrift.usEquity) >= 5 && (
                      <div className={`px-3 py-2 rounded-lg text-sm ${allocationDrift.usEquity > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>
                        {allocationDrift.usEquity > 0 ? '⚠️ Heavy US equity exposure' : '📉 Light on US equity'}
                      </div>
                    )}
                    {currentAllocation.crypto > 15 && (
                      <div className="px-3 py-2 rounded-lg text-sm bg-orange-500/10 text-orange-400">
                        🪙 High crypto allocation
                      </div>
                    )}
                    {currentAllocation.bonds < 10 && userAge > 40 && (
                      <div className="px-3 py-2 rounded-lg text-sm bg-emerald-500/10 text-emerald-400">
                        📉 Consider more bonds at your age
                      </div>
                    )}
                    {Math.max(...allHoldings.map((h: Holding) => ((h.currentValue || 0) / totalValue) * 100)) > 15 && (
                      <div className="px-3 py-2 rounded-lg text-sm bg-red-500/10 text-red-400">
                        ⚡ <Term id="concentration-risk">Concentration risk</Term> in top position
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Investment Thesis Check */}
            <ThesisInsight 
              allocation={{
                usEquity: currentAllocation.usEquity,
                intlEquity: currentAllocation.intlEquity,
                bonds: currentAllocation.bonds,
                crypto: currentAllocation.crypto,
                cash: currentAllocation.cash,
              }}
            />

            {/* Rebalancing Preview - Main Feature */}
            <RebalancingPreview
              holdings={allHoldings.map((h: Holding) => ({
                ...h,
                accountType: 'taxable' as const, // Default to taxable, would come from account data
              }))}
              targetAllocation={{
                usEquity: targetAllocation.usEquity,
                intlEquity: targetAllocation.intlEquity,
                bonds: targetAllocation.bonds,
                crypto: targetAllocation.crypto,
                cash: targetAllocation.cash,
              }}
              totalValue={totalValue}
              riskTolerance={profile.riskTolerance}
            />

            {/* Side-by-Side Portfolio Comparison */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                ⚖️ Current vs Optimized Portfolio
              </h3>
              
              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                {/* Current Portfolio */}
                <div className="bg-white/5 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-white">📊 Current Portfolio</h4>
                    <span className="text-xs text-gray-500">${totalValue.toLocaleString()}</span>
                  </div>
                  
                  {/* Mini Pie Chart */}
                  <div className="relative w-36 h-36 mx-auto mb-4">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      {(() => {
                        const data = [
                          { value: currentAllocation.usEquity, color: '#3B82F6' },
                          { value: currentAllocation.intlEquity, color: '#8B5CF6' },
                          { value: currentAllocation.bonds, color: '#10B981' },
                          { value: currentAllocation.crypto, color: '#F97316' },
                          { value: currentAllocation.cash, color: '#6B7280' },
                        ].filter(d => d.value > 0);
                        let cumulative = 0;
                        const radius = 35;
                        const circumference = 2 * Math.PI * radius;
                        return data.map((segment, idx) => {
                          const pct = segment.value / 100;
                          const strokeDasharray = `${pct * circumference} ${circumference}`;
                          const strokeDashoffset = -cumulative * circumference;
                          cumulative += pct;
                          return (
                            <circle key={idx} cx="50" cy="50" r={radius} fill="none"
                              stroke={segment.color} strokeWidth="16"
                              strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset}
                            />
                          );
                        });
                      })()}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">Current</span>
                    </div>
                  </div>
                  
                  {/* Allocation breakdown */}
                  <div className="space-y-2 text-sm">
                    {[
                      { label: 'US Equity', value: currentAllocation.usEquity, color: 'bg-blue-500' },
                      { label: "Int'l Equity", value: currentAllocation.intlEquity, color: 'bg-purple-500' },
                      { label: 'Bonds', value: currentAllocation.bonds, color: 'bg-emerald-500' },
                      { label: 'Crypto', value: currentAllocation.crypto, color: 'bg-orange-500' },
                      { label: 'Cash', value: currentAllocation.cash, color: 'bg-gray-500' },
                    ].filter(i => i.value > 0).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${item.color}`} />
                          <span className="text-gray-400">{item.label}</span>
                        </div>
                        <span className="text-white">{item.value.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Expected metrics */}
                  <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-gray-500">Est. Return</p>
                      <p className="text-white font-medium">
                        {(currentAllocation.usEquity * 0.10 + currentAllocation.intlEquity * 0.08 + 
                          currentAllocation.bonds * 0.04 + currentAllocation.crypto * 0.15 + 
                          currentAllocation.cash * 0.04).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Est. <Term id="volatility">Volatility</Term></p>
                      <p className="text-white font-medium">
                        {(currentAllocation.usEquity * 0.18 + currentAllocation.intlEquity * 0.22 + 
                          currentAllocation.bonds * 0.06 + currentAllocation.crypto * 0.60 + 
                          currentAllocation.cash * 0.01).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Optimized Portfolio */}
                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl p-5 border border-indigo-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-white flex items-center gap-2">
                      ✨ Optimized Portfolio
                      <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">Recommended</span>
                    </h4>
                    <span className="text-xs text-gray-500">${totalValue.toLocaleString()}</span>
                  </div>
                  
                  {/* Mini Pie Chart */}
                  <div className="relative w-36 h-36 mx-auto mb-4">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      {(() => {
                        const target = targetAllocation || { usEquity: 50, intlEquity: 20, bonds: 20, crypto: 5, cash: 5 };
                        const data = [
                          { value: target.usEquity, color: '#3B82F6' },
                          { value: target.intlEquity, color: '#8B5CF6' },
                          { value: target.bonds, color: '#10B981' },
                          { value: target.crypto, color: '#F97316' },
                          { value: target.cash, color: '#6B7280' },
                        ].filter(d => d.value > 0);
                        let cumulative = 0;
                        const radius = 35;
                        const circumference = 2 * Math.PI * radius;
                        return data.map((segment, idx) => {
                          const pct = segment.value / 100;
                          const strokeDasharray = `${pct * circumference} ${circumference}`;
                          const strokeDashoffset = -cumulative * circumference;
                          cumulative += pct;
                          return (
                            <circle key={idx} cx="50" cy="50" r={radius} fill="none"
                              stroke={segment.color} strokeWidth="16"
                              strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset}
                            />
                          );
                        });
                      })()}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-indigo-300 text-xs font-medium">Target</span>
                    </div>
                  </div>
                  
                  {/* Allocation breakdown */}
                  <div className="space-y-2 text-sm">
                    {(() => {
                      const target = targetAllocation || { usEquity: 50, intlEquity: 20, bonds: 20, crypto: 5, cash: 5 };
                      return [
                        { label: 'US Equity', value: target.usEquity, current: currentAllocation.usEquity, color: 'bg-blue-500' },
                        { label: "Int'l Equity", value: target.intlEquity, current: currentAllocation.intlEquity, color: 'bg-purple-500' },
                        { label: 'Bonds', value: target.bonds, current: currentAllocation.bonds, color: 'bg-emerald-500' },
                        { label: 'Crypto', value: target.crypto, current: currentAllocation.crypto, color: 'bg-orange-500' },
                        { label: 'Cash', value: target.cash, current: currentAllocation.cash, color: 'bg-gray-500' },
                      ].filter(i => i.value > 0 || i.current > 0).map((item, idx) => {
                        const diff = item.value - item.current;
                        return (
                          <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${item.color}`} />
                              <span className="text-gray-400">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-white">{item.value.toFixed(0)}%</span>
                              {diff !== 0 && (
                                <span className={`text-xs ${diff > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {diff > 0 ? '+' : ''}{diff.toFixed(0)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                  
                  {/* Expected metrics */}
                  <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-3 text-xs">
                    {(() => {
                      const target = targetAllocation || { usEquity: 50, intlEquity: 20, bonds: 20, crypto: 5, cash: 5 };
                      const expReturn = (target.usEquity * 0.10 + target.intlEquity * 0.08 + 
                        target.bonds * 0.04 + target.crypto * 0.15 + target.cash * 0.04);
                      const currentReturn = (currentAllocation.usEquity * 0.10 + currentAllocation.intlEquity * 0.08 + 
                        currentAllocation.bonds * 0.04 + currentAllocation.crypto * 0.15 + currentAllocation.cash * 0.04);
                      const expVol = (target.usEquity * 0.18 + target.intlEquity * 0.22 + 
                        target.bonds * 0.06 + target.crypto * 0.60 + target.cash * 0.01);
                      return (
                        <>
                          <div>
                            <p className="text-gray-500">Est. Return</p>
                            <p className="text-emerald-400 font-medium">
                              {expReturn.toFixed(1)}%
                              {expReturn > currentReturn && <span className="text-xs ml-1">↑</span>}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Est. <Term id="volatility">Volatility</Term></p>
                            <p className="text-white font-medium">{expVol.toFixed(1)}%</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
              
              {/* Detailed Projections & Risk Metrics */}
              {(() => {
                const target = targetAllocation || { usEquity: 50, intlEquity: 20, bonds: 20, crypto: 5, cash: 5 };
                
                // Calculate expected returns
                const currentReturn = (currentAllocation.usEquity * 0.10 + currentAllocation.intlEquity * 0.08 + 
                  currentAllocation.bonds * 0.04 + currentAllocation.crypto * 0.15 + currentAllocation.cash * 0.02) / 100;
                const optimizedReturn = (target.usEquity * 0.10 + target.intlEquity * 0.08 + 
                  target.bonds * 0.04 + target.crypto * 0.15 + target.cash * 0.02) / 100;
                
                // Calculate volatility
                const currentVol = (currentAllocation.usEquity * 0.18 + currentAllocation.intlEquity * 0.22 + 
                  currentAllocation.bonds * 0.06 + currentAllocation.crypto * 0.60 + currentAllocation.cash * 0.01) / 100;
                const optimizedVol = (target.usEquity * 0.18 + target.intlEquity * 0.22 + 
                  target.bonds * 0.06 + target.crypto * 0.60 + target.cash * 0.01) / 100;
                
                // Sharpe ratio (assuming 4% risk-free)
                const riskFree = 0.04;
                const currentSharpe = currentVol > 0 ? (currentReturn - riskFree) / currentVol : 0;
                const optimizedSharpe = optimizedVol > 0 ? (optimizedReturn - riskFree) / optimizedVol : 0;
                
                // Max drawdown estimates
                const currentMaxDD = Math.min(-15, -(currentAllocation.usEquity * 0.50 + currentAllocation.intlEquity * 0.55 + 
                  currentAllocation.bonds * 0.15 + currentAllocation.crypto * 0.80 + currentAllocation.cash * 0.01) / 100 * 100);
                const optimizedMaxDD = Math.min(-15, -(target.usEquity * 0.50 + target.intlEquity * 0.55 + 
                  target.bonds * 0.15 + target.crypto * 0.80 + target.cash * 0.01) / 100 * 100);
                
                // Project values
                const projectValue = (startVal: number, rate: number, years: number) => 
                  startVal * Math.pow(1 + rate, years);
                
                return (
                  <>
                    {/* Risk/Return Metrics Comparison */}
                    <div className="bg-white/5 rounded-xl p-5 mb-6">
                      <h4 className="font-medium text-white mb-4 flex items-center gap-2">
                        📊 Risk & Return Comparison
                      </h4>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-gray-400 border-b border-white/10">
                              <th className="text-left py-2 font-medium">Metric</th>
                              <th className="text-center py-2 font-medium">Current</th>
                              <th className="text-center py-2 font-medium text-indigo-300">Optimized</th>
                              <th className="text-right py-2 font-medium">Difference</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            <tr>
                              <td className="py-3 text-gray-400">Expected Annual Return</td>
                              <td className="py-3 text-center text-white">{(currentReturn * 100).toFixed(1)}%</td>
                              <td className="py-3 text-center text-indigo-300">{(optimizedReturn * 100).toFixed(1)}%</td>
                              <td className={`py-3 text-right ${optimizedReturn > currentReturn ? 'text-emerald-400' : 'text-red-400'}`}>
                                {optimizedReturn > currentReturn ? '+' : ''}{((optimizedReturn - currentReturn) * 100).toFixed(1)}%
                              </td>
                            </tr>
                            <tr>
                              <td className="py-3 text-gray-400"><Term id="volatility">Volatility</Term> (Risk)</td>
                              <td className="py-3 text-center text-white">{(currentVol * 100).toFixed(1)}%</td>
                              <td className="py-3 text-center text-indigo-300">{(optimizedVol * 100).toFixed(1)}%</td>
                              <td className={`py-3 text-right ${optimizedVol < currentVol ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {optimizedVol < currentVol ? '' : '+'}{((optimizedVol - currentVol) * 100).toFixed(1)}%
                              </td>
                            </tr>
                            <tr>
                              <td className="py-3 text-gray-400">Sharpe Ratio</td>
                              <td className="py-3 text-center text-white">{currentSharpe.toFixed(2)}</td>
                              <td className="py-3 text-center text-indigo-300">{optimizedSharpe.toFixed(2)}</td>
                              <td className={`py-3 text-right ${optimizedSharpe > currentSharpe ? 'text-emerald-400' : 'text-red-400'}`}>
                                {optimizedSharpe > currentSharpe ? '+' : ''}{(optimizedSharpe - currentSharpe).toFixed(2)}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-3 text-gray-400">Est. Max Drawdown</td>
                              <td className="py-3 text-center text-red-400">{currentMaxDD.toFixed(0)}%</td>
                              <td className="py-3 text-center text-indigo-300">{optimizedMaxDD.toFixed(0)}%</td>
                              <td className={`py-3 text-right ${Math.abs(optimizedMaxDD) < Math.abs(currentMaxDD) ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {Math.abs(optimizedMaxDD) < Math.abs(currentMaxDD) ? 'Better' : 'Similar'}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    {/* Dollar Projections Table */}
                    <div className="bg-white/5 rounded-xl p-5 mb-6">
                      <h4 className="font-medium text-white mb-4 flex items-center gap-2">
                        💰 Projected Portfolio Value
                        <span className="text-xs text-gray-500 font-normal">Starting with ${totalValue.toLocaleString()}</span>
                      </h4>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-gray-400 border-b border-white/10">
                              <th className="text-left py-2 font-medium">Time Horizon</th>
                              <th className="text-center py-2 font-medium">Current Allocation</th>
                              <th className="text-center py-2 font-medium text-indigo-300">Optimized</th>
                              <th className="text-right py-2 font-medium">Extra Wealth</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {[5, 10, 20, 30].map(years => {
                              const currentVal = projectValue(totalValue, currentReturn, years);
                              const optimizedVal = projectValue(totalValue, optimizedReturn, years);
                              const diff = optimizedVal - currentVal;
                              return (
                                <tr key={years}>
                                  <td className="py-3 text-gray-400">{years} Years</td>
                                  <td className="py-3 text-center text-white">${(currentVal / 1000000).toFixed(2)}M</td>
                                  <td className="py-3 text-center text-indigo-300">${(optimizedVal / 1000000).toFixed(2)}M</td>
                                  <td className={`py-3 text-right font-medium ${diff > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {diff > 0 ? '+' : ''}${(diff / 1000).toFixed(0)}K
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-3">
                        * Projections assume constant returns at historical averages. Actual results will vary.
                      </p>
                    </div>
                    
                    {/* Visual Growth Chart */}
                    <div className="bg-white/5 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-white flex items-center gap-2">
                          📈 Growth Projection (30 Years)
                        </h4>
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-gray-500 rounded" />
                            <span className="text-gray-400">Current</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-0.5 bg-purple-500 rounded" />
                            <span className="text-purple-300">Optimized</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Chart Area */}
                      <div className="relative h-56">
                        {/* Y-axis labels */}
                        <div className="absolute left-0 top-0 bottom-6 w-16 flex flex-col justify-between text-xs text-gray-500">
                          <span>${(projectValue(totalValue, Math.max(currentReturn, optimizedReturn), 30) / 1000000).toFixed(1)}M</span>
                          <span>${(projectValue(totalValue, Math.max(currentReturn, optimizedReturn), 20) / 1000000).toFixed(1)}M</span>
                          <span>${(projectValue(totalValue, Math.max(currentReturn, optimizedReturn), 10) / 1000000).toFixed(1)}M</span>
                          <span>${(totalValue / 1000000).toFixed(1)}M</span>
                        </div>
                        
                        {/* Chart */}
                        <div className="ml-16 h-full relative">
                          <svg className="w-full h-full" viewBox="0 0 400 180" preserveAspectRatio="none">
                            {/* Grid lines */}
                            <line x1="0" y1="45" x2="400" y2="45" stroke="#374151" strokeWidth="0.5" strokeDasharray="4" />
                            <line x1="0" y1="90" x2="400" y2="90" stroke="#374151" strokeWidth="0.5" strokeDasharray="4" />
                            <line x1="0" y1="135" x2="400" y2="135" stroke="#374151" strokeWidth="0.5" strokeDasharray="4" />
                            
                            {/* Current portfolio curve (gray) */}
                            <path 
                              d={`M 0,170 ${[5,10,15,20,25,30].map((y, i) => {
                                const val = projectValue(totalValue, currentReturn, y);
                                const maxVal = projectValue(totalValue, Math.max(currentReturn, optimizedReturn), 30);
                                const yPos = 170 - (val / maxVal) * 160;
                                return `L ${(i + 1) * 66},${yPos}`;
                              }).join(' ')}`}
                              fill="none"
                              stroke="#6B7280"
                              strokeWidth="2"
                            />
                            
                            {/* Optimized portfolio curve (purple) */}
                            <path 
                              d={`M 0,170 ${[5,10,15,20,25,30].map((y, i) => {
                                const val = projectValue(totalValue, optimizedReturn, y);
                                const maxVal = projectValue(totalValue, Math.max(currentReturn, optimizedReturn), 30);
                                const yPos = 170 - (val / maxVal) * 160;
                                return `L ${(i + 1) * 66},${yPos}`;
                              }).join(' ')}`}
                              fill="none"
                              stroke="#8B5CF6"
                              strokeWidth="2.5"
                            />
                          </svg>
                          
                          {/* X-axis labels */}
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Today</span>
                            <span>10 yrs</span>
                            <span>20 yrs</span>
                            <span>30 yrs</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Summary */}
                      <div className="mt-4 p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <p className="text-sm text-gray-400">After 30 years, the optimized portfolio could be worth</p>
                            <p className="text-2xl font-bold text-white">
                              ${(projectValue(totalValue, optimizedReturn, 30) / 1000000).toFixed(2)}M
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-400">That&apos;s</p>
                            <p className="text-xl font-bold text-emerald-400">
                              +${((projectValue(totalValue, optimizedReturn, 30) - projectValue(totalValue, currentReturn, 30)) / 1000000).toFixed(2)}M more
                            </p>
                            <p className="text-xs text-gray-500">than your current allocation</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Suggested Trades */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                ⚖️ Suggested <Term id="rebalancing">Rebalancing</Term> Trades
              </h3>
              
              {rebalancingTrades.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-4xl mb-4 block">✅</span>
                  <p className="text-white font-medium">Your portfolio is well-balanced!</p>
                  <p className="text-gray-400 text-sm mt-1">All allocations within 3% of targets</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rebalancingTrades.map((trade, idx) => (
                    <div 
                      key={idx}
                      className={`flex items-center justify-between p-4 rounded-xl border ${
                        trade.action === 'sell' 
                          ? 'bg-red-500/5 border-red-500/20' 
                          : 'bg-emerald-500/5 border-emerald-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                          trade.action === 'sell' ? 'bg-red-500/20' : 'bg-emerald-500/20'
                        }`}>
                          {trade.action === 'sell' ? '📉' : '📈'}
                        </div>
                        <div>
                          <p className="font-medium text-white capitalize">
                            {trade.action} {trade.asset}
                          </p>
                          <p className="text-sm text-gray-400">{trade.reason}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${trade.action === 'sell' ? 'text-red-400' : 'text-emerald-400'}`}>
                          ~${trade.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Oracle Showcase Button */}
                  <div className="pt-4 border-t border-white/10">
                    <OracleShowcase
                      trigger={<span>Have Maven Oracle Explain These Changes</span>}
                      data={{
                        type: 'portfolio_comparison',
                        title: 'Rebalancing Analysis',
                        current: {
                          usEquity: currentAllocation.usEquity / 100,
                          intlEquity: currentAllocation.intlEquity / 100,
                          bonds: currentAllocation.bonds / 100,
                          cash: currentAllocation.cash / 100,
                          crypto: currentAllocation.crypto / 100,
                        },
                        proposed: {
                          usEquity: (targetAllocation?.usEquity || 50) / 100,
                          intlEquity: (targetAllocation?.intlEquity || 15) / 100,
                          bonds: (targetAllocation?.bonds || 25) / 100,
                          cash: (targetAllocation?.cash || 5) / 100,
                          crypto: (targetAllocation?.crypto || 5) / 100,
                        },
                        metrics: [
                          { label: 'Trades Needed', current: rebalancingTrades.length, good: true },
                          { label: 'Total Value', current: totalValue, good: true },
                          { label: 'Risk Level', current: profile.riskTolerance || 'moderate' },
                        ],
                        risks: [
                          { scenario: '2008 Financial Crisis', impact: -45, color: 'bg-red-500' },
                          { scenario: 'COVID Crash (2020)', impact: -32, color: 'bg-orange-500' },
                          { scenario: 'Rate Shock (2022)', impact: -22, color: 'bg-amber-500' },
                          { scenario: 'Normal Volatility', impact: -12, color: 'bg-yellow-500' },
                        ],
                        chartData: {
                          labels: ['Year 1', 'Year 5', 'Year 10', 'Year 15', 'Year 20', 'Year 25', 'Year 30'],
                          datasets: [
                            { label: 'Current', data: [totalValue, totalValue * 1.3, totalValue * 1.7, totalValue * 2.2, totalValue * 2.8, totalValue * 3.6, totalValue * 4.6], color: '#6b7280' },
                            { label: 'Optimized', data: [totalValue, totalValue * 1.35, totalValue * 1.85, totalValue * 2.5, totalValue * 3.4, totalValue * 4.5, totalValue * 6.1], color: '#8b5cf6' },
                          ]
                        },
                        actionItems: rebalancingTrades.map(t => ({
                          priority: 'medium' as const,
                          action: `${t.action === 'sell' ? 'Sell' : 'Buy'} $${t.amount.toLocaleString()} of ${t.asset}`,
                          impact: t.reason
                        }))
                      }}
                      onAnalyze={async () => {
                        const response = await fetch('/api/chat', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            message: `Analyze these rebalancing trades and explain in plain English why they make sense for my portfolio: ${rebalancingTrades.map(t => `${t.action} ${t.asset} (~$${t.amount}): ${t.reason}`).join('; ')}. Current allocation: US ${currentAllocation.usEquity.toFixed(0)}%, Intl ${currentAllocation.intlEquity.toFixed(0)}%, Bonds ${currentAllocation.bonds.toFixed(0)}%, Cash ${currentAllocation.cash.toFixed(0)}%, Crypto ${currentAllocation.crypto.toFixed(0)}%. Total portfolio: $${totalValue.toLocaleString()}. Give me the ELI5 version of what these changes accomplish and why.`,
                          })
                        });
                        const data = await response.json();
                        return data.response || 'Unable to generate analysis.';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Alternative Model Portfolios */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">🏆 Compare Model Portfolios</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: 'Conservative', risk: 'Low', returns: '5-6%', description: 'Capital preservation focus' },
                  { name: 'Moderate', risk: 'Medium', returns: '6-8%', description: 'Balanced growth & income' },
                  { name: 'Aggressive', risk: 'High', returns: '8-10%', description: 'Growth-oriented' },
                  { name: 'Very Aggressive', risk: 'Very High', returns: '10-12%+', description: 'Maximum growth' },
                ].map((model, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCustomTarget(RISK_TARGETS[model.name.toLowerCase().replace(' ', '-')] || null)}
                    className={`text-left p-4 rounded-xl border transition ${
                      profile.riskTolerance === model.name.toLowerCase().replace(' ', '-')
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-white/10 hover:border-white/30 bg-white/5'
                    }`}
                  >
                    <p className="font-semibold text-white mb-1">{model.name}</p>
                    <p className="text-xs text-gray-400 mb-2">{model.description}</p>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Risk: {model.risk}</span>
                      <span className="text-emerald-400">{model.returns}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'whatif' && (
          <WhatIfSimulator 
            holdings={allHoldings} 
            totalValue={totalValue} 
          />
        )}

        {activeTab === 'stress' && (
          <div className="space-y-6">
            {/* Scenario Selection */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">🌪️ Historical Stress Scenarios</h3>
              <p className="text-gray-400 text-sm mb-4">
                See how your portfolio would have performed in past market crises
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {STRESS_SCENARIOS.map((scenario, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedScenario(scenario)}
                    className={`text-left p-4 rounded-xl border transition ${
                      selectedScenario?.name === scenario.name
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-white/10 hover:border-white/30 bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{scenario.icon}</span>
                      <p className="font-semibold text-white">{scenario.name}</p>
                    </div>
                    <p className="text-xs text-gray-400">{scenario.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Stress Test Results */}
            {selectedScenario && stressTestResult && (
              <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      {selectedScenario.icon} {selectedScenario.name} Impact
                    </h3>
                    <p className="text-gray-400 text-sm">{selectedScenario.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedScenario(null)}
                    className="text-gray-500 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {/* Key metrics */}
                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-black/20 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-400 mb-1">Current Value</p>
                    <p className="text-2xl font-bold text-white">${stressTestResult.currentValue.toLocaleString()}</p>
                  </div>
                  <div className="bg-black/20 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-400 mb-1">Projected Value</p>
                    <p className="text-2xl font-bold text-red-400">${stressTestResult.projectedValue.toLocaleString()}</p>
                  </div>
                  <div className="bg-black/20 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-400 mb-1">Total Impact</p>
                    <p className="text-2xl font-bold text-red-400">
                      {stressTestResult.percentChange.toFixed(1)}%
                    </p>
                    <p className="text-sm text-red-400">
                      {stressTestResult.absoluteChange < 0 ? '-' : '+'}${Math.abs(stressTestResult.absoluteChange).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Breakdown by asset class */}
                <h4 className="text-sm font-medium text-white mb-3">Impact by Asset Class</h4>
                <div className="space-y-2">
                  {Object.entries(stressTestResult.breakdown).map(([asset, data]) => (
                    <div key={asset} className="flex items-center gap-4">
                      <span className="text-sm text-gray-400 w-24 capitalize">{asset.replace(/([A-Z])/g, ' $1')}</span>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500 rounded-full" 
                          style={{ width: `${Math.abs(selectedScenario.changes[asset as keyof typeof selectedScenario.changes])}%` }}
                        />
                      </div>
                      <span className="text-sm text-red-400 w-20 text-right">
                        {selectedScenario.changes[asset as keyof typeof selectedScenario.changes]}%
                      </span>
                      <span className="text-sm text-gray-500 w-28 text-right">
                        {data.change < 0 ? '-' : '+'}${Math.abs(data.change).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Insights */}
                <div className="mt-6 p-4 bg-black/20 rounded-xl">
                  <p className="text-sm text-gray-300">
                    💡 <span className="text-white font-medium">Insight:</span> In this scenario, your portfolio's high 
                    {currentAllocation.crypto > 10 && ' crypto exposure'} 
                    {currentAllocation.usEquity > 50 && ' US equity concentration'} 
                    {' '}would amplify losses. Consider increasing bond allocation for downside protection.
                  </p>
                </div>
              </div>
            )}

            {/* <Term id="var">Value at Risk</Term> Summary */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                📊 <Term id="var">Value at Risk</Term> Summary
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-gray-400 mb-1">1-Day 95% VaR</p>
                  <p className="text-2xl font-bold text-amber-400">-${(totalValue * 0.025).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">5% chance of exceeding</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-gray-400 mb-1">1-Month 95% VaR</p>
                  <p className="text-2xl font-bold text-orange-400">-${(totalValue * 0.08).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">5% chance of exceeding</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-sm text-gray-400 mb-1">1-Year 95% VaR</p>
                  <p className="text-2xl font-bold text-red-400">-${(totalValue * 0.25).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">5% chance of exceeding</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projections' && (
          <div className="space-y-6">
            {/* Projection Controls */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">🎛️ Projection Settings</h3>
              <div className="grid sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Time Horizon: {projectionYears} years</label>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    value={projectionYears}
                    onChange={(e) => setProjectionYears(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Annual Contribution: ${annualContribution.toLocaleString()}</label>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="5000"
                    value={annualContribution}
                    onChange={(e) => setAnnualContribution(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Expected Return: {expectedReturn}%</label>
                  <input
                    type="range"
                    min="3"
                    max="12"
                    step="0.5"
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Projection Chart (Simplified Bar Representation) */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">📈 Wealth Projection</h3>
              
              {/* Chart area */}
              <div className="relative h-64 mb-6">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 w-20 flex flex-col justify-between text-xs text-gray-500">
                  <span>${(projectionData[projectionData.length - 1]?.optimistic / 1000000).toFixed(1)}M</span>
                  <span>${(projectionData[projectionData.length - 1]?.expected / 2000000).toFixed(1)}M</span>
                  <span>$0</span>
                </div>
                
                {/* Chart bars */}
                <div className="absolute left-20 right-0 top-0 bottom-8 flex items-end justify-between gap-1">
                  {projectionData.filter((_, i) => i % Math.ceil(projectionYears / 20) === 0 || i === projectionData.length - 1).map((point, idx) => {
                    const maxVal = projectionData[projectionData.length - 1]?.optimistic || 1;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex items-end justify-center gap-0.5" style={{ height: '200px' }}>
                          {/* Pessimistic */}
                          <div 
                            className="w-2 bg-red-500/40 rounded-t"
                            style={{ height: `${(point.pessimistic / maxVal) * 100}%` }}
                          />
                          {/* Expected */}
                          <div 
                            className="w-3 bg-indigo-500 rounded-t"
                            style={{ height: `${(point.expected / maxVal) * 100}%` }}
                          />
                          {/* Optimistic */}
                          <div 
                            className="w-2 bg-emerald-500/40 rounded-t"
                            style={{ height: `${(point.optimistic / maxVal) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{point.year}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-500/40" />
                  <span className="text-gray-400">Pessimistic ({expectedReturn - 3}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-indigo-500" />
                  <span className="text-gray-400">Expected ({expectedReturn}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-500/40" />
                  <span className="text-gray-400">Optimistic ({expectedReturn + 3}%)</span>
                </div>
              </div>
            </div>

            {/* Key Milestones */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">🎯 Key Milestones</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { year: 5, label: 'In 5 years' },
                  { year: 10, label: 'In 10 years' },
                  { year: 20, label: 'In 20 years' },
                  { year: projectionYears, label: `At retirement (${projectionYears}y)` },
                ].filter(m => m.year <= projectionYears).map((milestone, idx) => {
                  const point = projectionData.find(p => p.year === milestone.year) || projectionData[projectionData.length - 1];
                  return (
                    <div key={idx} className="bg-white/5 rounded-xl p-4">
                      <p className="text-sm text-gray-400 mb-1">{milestone.label}</p>
                      <p className="text-xs text-gray-500 mb-2">Age {point?.age}</p>
                      <p className="text-2xl font-bold text-white">${(point?.expected || 0).toLocaleString()}</p>
                      <div className="flex justify-between text-xs mt-2">
                        <span className="text-red-400">${(point?.pessimistic || 0).toLocaleString()}</span>
                        <span className="text-emerald-400">${(point?.optimistic || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* <Term id="safe-withdrawal-rate">Safe Withdrawal</Term> Analysis */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                💰 <Term id="safe-withdrawal-rate">Retirement Income</Term> Projection
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-black/20 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-400 mb-1">3% Withdrawal (Safe)</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    ${Math.round((projectionData[projectionData.length - 1]?.expected || 0) * 0.03 / 12).toLocaleString()}/mo
                  </p>
                </div>
                <div className="bg-black/20 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-400 mb-1">4% Withdrawal (Standard)</p>
                  <p className="text-2xl font-bold text-white">
                    ${Math.round((projectionData[projectionData.length - 1]?.expected || 0) * 0.04 / 12).toLocaleString()}/mo
                  </p>
                </div>
                <div className="bg-black/20 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-400 mb-1">5% Withdrawal (Aggressive)</p>
                  <p className="text-2xl font-bold text-amber-400">
                    ${Math.round((projectionData[projectionData.length - 1]?.expected || 0) * 0.05 / 12).toLocaleString()}/mo
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="space-y-6">
            {/* Priority Actions */}
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">🎯 Priority Actions</h3>
              <div className="space-y-4">
                {rebalancingTrades.length > 0 && (
                  <div className="flex items-start gap-4 p-4 bg-black/20 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-xl">
                      ⚖️
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">Rebalance Portfolio</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        Your portfolio has drifted from target allocation. Execute {rebalancingTrades.length} trades to rebalance.
                      </p>
                      <button 
                        onClick={() => setActiveTab('optimize')}
                        className="mt-3 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-sm font-medium rounded-lg transition"
                      >
                        View Trades →
                      </button>
                    </div>
                  </div>
                )}

                {currentAllocation.crypto > 15 && (
                  <div className="flex items-start gap-4 p-4 bg-black/20 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-xl">
                      🪙
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">Review Crypto Allocation</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        At {currentAllocation.crypto.toFixed(0)}%, your crypto exposure is significant. Consider your risk tolerance.
                      </p>
                    </div>
                  </div>
                )}

                {Math.max(...allHoldings.map((h: Holding) => ((h.currentValue || 0) / totalValue) * 100)) > 15 && (
                  <div className="flex items-start gap-4 p-4 bg-black/20 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-xl">
                      ⚠️
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">Reduce <Term id="concentration-risk">Concentration Risk</Term></h4>
                      <p className="text-sm text-gray-400 mt-1">
                        Your largest position is {Math.max(...allHoldings.map((h: Holding) => ((h.currentValue || 0) / totalValue) * 100)).toFixed(0)}% of your portfolio. 
                        Consider trimming for better <Term id="diversification">diversification</Term>.
                      </p>
                    </div>
                  </div>
                )}

                {/* Tax-loss harvesting check */}
                {allHoldings.some((h: Holding) => h.costBasis && h.costBasis > 0 && (h.currentValue || 0) < h.costBasis * 0.9) && (
                  <div className="flex items-start gap-4 p-4 bg-black/20 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-xl">
                      🌾
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white"><Term id="tax-loss-harvesting">Tax-Loss Harvesting</Term> Opportunity</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        You have positions with unrealized losses that could offset gains. Consider harvesting before year-end.
                      </p>
                      <button 
                        onClick={() => {
                          localStorage.setItem('maven_chat_prompt', 'Scan my portfolio for tax-loss harvesting opportunities');
                          router.push('/oracle');
                        }}
                        className="mt-3 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-sm font-medium rounded-lg transition"
                      >
                        Analyze with Oracle →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Implementation Checklist */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">✅ Implementation Checklist</h3>
              <div className="space-y-3">
                {[
                  { task: 'Review current allocation drift', status: 'done' },
                  { task: 'Identify rebalancing trades', status: rebalancingTrades.length > 0 ? 'done' : 'pending' },
                  { task: 'Check tax implications', status: 'pending' },
                  { task: 'Execute trades', status: 'pending' },
                  { task: 'Document for records', status: 'pending' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      item.status === 'done' 
                        ? 'border-emerald-500 bg-emerald-500/20' 
                        : 'border-gray-500'
                    }`}>
                      {item.status === 'done' && <span className="text-emerald-500 text-xs">✓</span>}
                    </div>
                    <span className={item.status === 'done' ? 'text-gray-400' : 'text-white'}>{item.task}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ask Oracle */}
            <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-violet-500/20 flex items-center justify-center text-3xl">
                  🔮
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">Need Personalized Guidance?</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Ask Maven Oracle for tailored recommendations based on your complete financial picture.
                  </p>
                </div>
                <button
                  onClick={() => {
                    localStorage.setItem('maven_chat_prompt', 'Based on my portfolio analysis, what are the top 3 things I should do to optimize my investments?');
                    router.push('/oracle');
                  }}
                  className="px-5 py-2.5 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-xl transition"
                >
                  Ask Oracle →
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'research' && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                🔬 Stock Research
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Get comprehensive research reports powered by Maven Oracle's analysis
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={researchQuery}
                  onChange={(e) => setResearchQuery(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && researchQuery && fetchResearch(researchQuery)}
                  placeholder="Enter ticker symbol (e.g., AAPL, MSFT)"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => researchQuery && fetchResearch(researchQuery)}
                  disabled={!researchQuery || researchLoading}
                  className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition"
                >
                  {researchLoading ? 'Loading...' : 'Research'}
                </button>
              </div>
              
              {/* Quick picks from holdings */}
              {allHoldings.length > 0 && !researchData && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Quick research from your holdings:</p>
                  <div className="flex flex-wrap gap-2">
                    {allHoldings
                      .filter((h: Holding) => !['CASH', 'USD'].includes(h.ticker.toUpperCase()))
                      .slice(0, 8)
                      .map((h: Holding) => (
                        <button
                          key={h.ticker}
                          onClick={() => {
                            setResearchQuery(h.ticker);
                            fetchResearch(h.ticker);
                          }}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition"
                        >
                          {h.ticker}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Error State */}
            {researchError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
                <span className="text-4xl mb-3 block">❌</span>
                <p className="text-red-400">{researchError}</p>
              </div>
            )}

            {/* Research Results */}
            {researchData && (
              <>
                {/* Data Source Badge - Prominent indicator */}
                <div className={`flex items-center gap-3 p-4 rounded-2xl mb-4 ${
                  researchData.dataSource === 'fmp' 
                    ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30' 
                    : 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30'
                }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                    researchData.dataSource === 'fmp' ? 'bg-emerald-500/20' : 'bg-amber-500/20'
                  }`}>
                    {researchData.dataSource === 'fmp' ? '📊' : '🤖'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${
                        researchData.dataSource === 'fmp' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {researchData.dataSource === 'fmp' ? 'Real-Time Analyst Data' : 'AI-Simulated Data'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        researchData.dataSource === 'fmp' 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {researchData.dataSource === 'fmp' ? 'VERIFIED' : 'ILLUSTRATIVE'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {researchData.dataSource === 'fmp' 
                        ? `Real analyst ratings from ${researchData.numberOfAnalysts} Wall Street analysts • Financial statements from SEC filings` 
                        : 'Analyst ratings simulated by Maven Oracle based on price patterns • For educational purposes only'}
                    </p>
                  </div>
                </div>

                {/* Header with Price */}
                <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-lg font-bold text-white">
                          {researchData.symbol.slice(0, 3)}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">{researchData.symbol}</h2>
                          <p className="text-gray-400">{researchData.name}</p>
                        </div>
                      </div>
                      {userHolding && (
                        <div className="space-y-2 mt-2">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 rounded-lg text-sm text-emerald-400">
                            ✓ Direct: {userHolding.shares.toLocaleString()} shares (${(userHolding.currentValue || 0).toLocaleString()})
                          </div>
                          {/* TODO: Look-through exposure - requires ETF holdings data
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-lg text-sm text-blue-400">
                            + Via ETFs: $X,XXX (SPY 7%, QQQ 9%)
                          </div>
                          <div className="text-xs text-gray-500 ml-1">
                            Total exposure: $XX,XXX
                          </div>
                          */}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-white">${researchData.currentPrice.toFixed(2)}</p>
                      <p className={`text-lg ${researchData.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {researchData.change >= 0 ? '+' : ''}{researchData.change.toFixed(2)} ({researchData.changePercent.toFixed(2)}%)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Maven Score */}
                <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      🎯 Maven Score™
                    </h3>
                    <div className={`text-4xl font-bold ${
                      researchData.mavenScore >= 70 ? 'text-emerald-400' :
                      researchData.mavenScore >= 50 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {researchData.mavenScore}
                    </div>
                  </div>
                  
                  {/* Score Gauge */}
                  <div className="relative h-4 bg-white/10 rounded-full overflow-hidden mb-6">
                    <div 
                      className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
                        researchData.mavenScore >= 70 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                        researchData.mavenScore >= 50 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 
                        'bg-gradient-to-r from-red-500 to-red-400'
                      }`}
                      style={{ width: `${researchData.mavenScore}%` }}
                    />
                    <div className="absolute inset-0 flex justify-between items-center px-2 text-xs text-gray-500">
                      <span>0</span>
                      <span>25</span>
                      <span>50</span>
                      <span>75</span>
                      <span>100</span>
                    </div>
                  </div>
                  
                  {/* Score Breakdown */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">Analyst Conviction</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-white">{researchData.scoreBreakdown.analystConviction}</span>
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${researchData.scoreBreakdown.analystConviction}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">Valuation</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-white">{researchData.scoreBreakdown.valuation}</span>
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${researchData.scoreBreakdown.valuation}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">Momentum</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-white">{researchData.scoreBreakdown.momentum}</span>
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${researchData.scoreBreakdown.momentum}%` }} />
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">Quality</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-white">{researchData.scoreBreakdown.quality}</span>
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 rounded-full" style={{ width: `${researchData.scoreBreakdown.quality}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analyst Ratings & Price Targets */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Analyst Ratings */}
                  <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">📊 Analyst Ratings</h3>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`text-2xl font-bold capitalize ${
                        researchData.analystRating.includes('buy') ? 'text-emerald-400' :
                        researchData.analystRating === 'hold' ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {researchData.analystRating}
                      </div>
                      <p className="text-gray-400 text-sm">{researchData.numberOfAnalysts} analysts</p>
                    </div>
                    
                    {/* Rating Bar */}
                    <div className="h-6 flex rounded-lg overflow-hidden mb-3">
                      {researchData.buyCount > 0 && (
                        <div 
                          className="bg-emerald-500 flex items-center justify-center text-xs text-white font-medium"
                          style={{ width: `${(researchData.buyCount / researchData.numberOfAnalysts) * 100}%` }}
                        >
                          {researchData.buyCount}
                        </div>
                      )}
                      {researchData.holdCount > 0 && (
                        <div 
                          className="bg-amber-500 flex items-center justify-center text-xs text-white font-medium"
                          style={{ width: `${(researchData.holdCount / researchData.numberOfAnalysts) * 100}%` }}
                        >
                          {researchData.holdCount}
                        </div>
                      )}
                      {researchData.sellCount > 0 && (
                        <div 
                          className="bg-red-500 flex items-center justify-center text-xs text-white font-medium"
                          style={{ width: `${(researchData.sellCount / researchData.numberOfAnalysts) * 100}%` }}
                        >
                          {researchData.sellCount}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-emerald-400">Buy: {researchData.buyCount}</span>
                      <span className="text-amber-400">Hold: {researchData.holdCount}</span>
                      <span className="text-red-400">Sell: {researchData.sellCount}</span>
                    </div>
                  </div>

                  {/* Price Targets */}
                  <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">🎯 Price Targets</h3>
                    <div className="space-y-4">
                      {/* Target Range Visual */}
                      <div className="relative h-8 bg-white/10 rounded-lg">
                        {/* Current price marker */}
                        <div 
                          className="absolute top-0 bottom-0 w-1 bg-white rounded-full z-10"
                          style={{ 
                            left: `${Math.min(100, Math.max(0, ((researchData.currentPrice - researchData.targetLow) / (researchData.targetHigh - researchData.targetLow)) * 100))}%` 
                          }}
                        />
                        {/* Mean target marker */}
                        <div 
                          className="absolute top-0 bottom-0 w-1 bg-indigo-500 rounded-full"
                          style={{ 
                            left: `${Math.min(100, Math.max(0, ((researchData.targetMean - researchData.targetLow) / (researchData.targetHigh - researchData.targetLow)) * 100))}%` 
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <div className="text-red-400">
                          <p className="text-xs text-gray-500">Low</p>
                          <p>${researchData.targetLow.toFixed(2)}</p>
                        </div>
                        <div className="text-center text-indigo-400">
                          <p className="text-xs text-gray-500">Mean Target</p>
                          <p className="font-semibold">${researchData.targetMean.toFixed(2)}</p>
                        </div>
                        <div className="text-right text-emerald-400">
                          <p className="text-xs text-gray-500">High</p>
                          <p>${researchData.targetHigh.toFixed(2)}</p>
                        </div>
                      </div>
                      
                      {/* Upside/Downside */}
                      <div className={`text-center p-3 rounded-lg ${
                        researchData.currentToTarget >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'
                      }`}>
                        <p className="text-sm text-gray-400">Implied Upside/Downside</p>
                        <p className={`text-2xl font-bold ${
                          researchData.currentToTarget >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {researchData.currentToTarget >= 0 ? '+' : ''}{researchData.currentToTarget.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bull vs Bear Case */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Bull Case */}
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                      🐂 Bull Case
                    </h3>
                    <ul className="space-y-3">
                      {researchData.bullCase.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-300 text-sm">
                          <span className="text-emerald-400 mt-0.5">✓</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Bear Case */}
                  <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                      🐻 Bear Case
                    </h3>
                    <ul className="space-y-3">
                      {researchData.bearCase.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-300 text-sm">
                          <span className="text-red-400 mt-0.5">⚠</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Individual Price Targets (Real Data) */}
                {researchData.individualPriceTargets && researchData.individualPriceTargets.length > 0 && (
                  <div className="bg-[#12121a] border border-indigo-500/20 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        🏦 Individual Analyst Price Targets
                        <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">Real Data</span>
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-500 border-b border-white/10">
                            <th className="pb-3">Analyst / Firm</th>
                            <th className="pb-3 text-right">Price Target</th>
                            <th className="pb-3 text-right">Upside</th>
                            <th className="pb-3 text-right">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {researchData.individualPriceTargets.slice(0, 8).map((target: any, idx: number) => {
                            const upside = ((target.priceTarget - researchData.currentPrice) / researchData.currentPrice) * 100;
                            return (
                              <tr key={idx} className="text-white">
                                <td className="py-3">
                                  <p className="font-medium">{target.company}</p>
                                  <p className="text-xs text-gray-500">{target.analyst}</p>
                                </td>
                                <td className="py-3 text-right font-semibold">${target.priceTarget.toFixed(2)}</td>
                                <td className={`py-3 text-right ${upside >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {upside >= 0 ? '+' : ''}{upside.toFixed(1)}%
                                </td>
                                <td className="py-3 text-right text-gray-400 text-xs">
                                  {new Date(target.date).toLocaleDateString()}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Recent Upgrades/Downgrades (Real Data) */}
                {researchData.recentUpgradesDowngrades && researchData.recentUpgradesDowngrades.length > 0 && (
                  <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      📈 Recent Analyst Actions
                      <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">Real Data</span>
                    </h3>
                    <div className="space-y-3">
                      {researchData.recentUpgradesDowngrades.map((action: any, idx: number) => (
                        <div 
                          key={idx} 
                          className={`flex items-center justify-between p-3 rounded-xl ${
                            action.action === 'upgrade' ? 'bg-emerald-500/10 border border-emerald-500/20' :
                            action.action === 'downgrade' ? 'bg-red-500/10 border border-red-500/20' :
                            'bg-white/5 border border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">
                              {action.action === 'upgrade' ? '⬆️' : 
                               action.action === 'downgrade' ? '⬇️' : 
                               action.action === 'init' ? '🆕' : '🔄'}
                            </span>
                            <div>
                              <p className="font-medium text-white">{action.company}</p>
                              <p className="text-xs text-gray-400">
                                {action.previousGrade && `${action.previousGrade} → `}{action.newGrade}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium capitalize ${
                              action.action === 'upgrade' ? 'text-emerald-400' :
                              action.action === 'downgrade' ? 'text-red-400' :
                              'text-gray-300'
                            }`}>
                              {action.action}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(action.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* What-If Price Scenario */}
                <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">📈 Price Scenario Calculator</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Drag to explore what your position would be worth at different price targets
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Target Price</span>
                        <span className="text-white font-semibold">${(priceTarget || researchData.targetMean).toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min={researchData.targetLow * 0.8}
                        max={researchData.targetHigh * 1.2}
                        step={0.01}
                        value={priceTarget || researchData.targetMean}
                        onChange={(e) => setPriceTarget(parseFloat(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>${(researchData.targetLow * 0.8).toFixed(0)}</span>
                        <span>Current: ${researchData.currentPrice.toFixed(2)}</span>
                        <span>${(researchData.targetHigh * 1.2).toFixed(0)}</span>
                      </div>
                    </div>
                    
                    {userHolding && (
                      <div className="grid sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
                        <div className="bg-white/5 rounded-xl p-4 text-center">
                          <p className="text-sm text-gray-400 mb-1">Current Value</p>
                          <p className="text-xl font-bold text-white">${(userHolding.currentValue || 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 text-center">
                          <p className="text-sm text-gray-400 mb-1">At Target Price</p>
                          <p className="text-xl font-bold text-indigo-400">
                            ${(userHolding.shares * (priceTarget || researchData.targetMean)).toLocaleString()}
                          </p>
                        </div>
                        <div className={`bg-white/5 rounded-xl p-4 text-center ${
                          ((priceTarget || researchData.targetMean) - researchData.currentPrice) >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          <p className="text-sm text-gray-400 mb-1">Potential Gain/Loss</p>
                          <p className="text-xl font-bold">
                            {((priceTarget || researchData.targetMean) - researchData.currentPrice) >= 0 ? '+' : ''}
                            ${((userHolding.shares * (priceTarget || researchData.targetMean)) - (userHolding.currentValue || 0)).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Overview - Only show if we have description */}
                {researchData.description && (
                  <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      🏢 Company Overview
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-4">
                      {researchData.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      {researchData.sector && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Sector:</span>
                          <span className="text-white bg-white/5 px-2 py-0.5 rounded">{researchData.sector}</span>
                        </div>
                      )}
                      {researchData.industry && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Industry:</span>
                          <span className="text-white bg-white/5 px-2 py-0.5 rounded">{researchData.industry}</span>
                        </div>
                      )}
                      {researchData.employees && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Employees:</span>
                          <span className="text-white">{researchData.employees.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Letter Grades - Only show if we have grades */}
                {researchData.qualityGrade && (
                  <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      📊 Maven Grades
                      <span className="text-xs px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded-full">AI Analysis</span>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Quality', grade: researchData.qualityGrade, color: 'orange', desc: 'Profitability & balance sheet strength' },
                        { label: 'Valuation', grade: researchData.valuationGrade, color: 'purple', desc: 'Price vs intrinsic value' },
                        { label: 'Growth', grade: researchData.growthGrade, color: 'emerald', desc: 'Revenue & earnings momentum' },
                        { label: 'Momentum', grade: researchData.momentumGrade, color: 'blue', desc: 'Price trend & technicals' }
                      ].map(({ label, grade, color, desc }) => (
                        <div key={label} className="bg-white/5 rounded-xl p-4 text-center">
                          <p className="text-xs text-gray-500 mb-2">{label}</p>
                          <div className={`text-4xl font-bold mb-1 ${
                            grade === 'A' ? 'text-emerald-400' :
                            grade === 'B' ? 'text-blue-400' :
                            grade === 'C' ? 'text-amber-400' :
                            grade === 'D' ? 'text-orange-400' : 'text-red-400'
                          }`}>
                            {grade}
                          </div>
                          <p className="text-xs text-gray-500">{desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Valuation Metrics */}
                <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">📋 Valuation Metrics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-xs text-gray-500"><Term id="market-cap">Market Cap</Term></p>
                      <p className="text-lg font-semibold text-white">
                        ${researchData.marketCap >= 1e12 
                          ? (researchData.marketCap / 1e12).toFixed(2) + 'T'
                          : researchData.marketCap >= 1e9 
                            ? (researchData.marketCap / 1e9).toFixed(2) + 'B'
                            : (researchData.marketCap / 1e6).toFixed(2) + 'M'}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-xs text-gray-500"><Term id="pe-ratio">P/E Ratio</Term></p>
                      <p className="text-lg font-semibold text-white">
                        {researchData.peRatio ? researchData.peRatio.toFixed(1) + 'x' : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-xs text-gray-500">P/B Ratio</p>
                      <p className="text-lg font-semibold text-white">
                        {researchData.pbRatio ? researchData.pbRatio.toFixed(1) + 'x' : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-xs text-gray-500">P/S Ratio</p>
                      <p className="text-lg font-semibold text-white">
                        {researchData.psRatio ? researchData.psRatio.toFixed(1) + 'x' : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-xs text-gray-500">EV/EBITDA</p>
                      <p className="text-lg font-semibold text-white">
                        {researchData.evToEbitda ? researchData.evToEbitda.toFixed(1) + 'x' : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-xs text-gray-500">EV/Sales</p>
                      <p className="text-lg font-semibold text-white">
                        {researchData.evToSales ? researchData.evToSales.toFixed(1) + 'x' : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-xs text-gray-500"><Term id="dividend-yield">Div Yield</Term></p>
                      <p className="text-lg font-semibold text-white">
                        {researchData.dividendYield ? researchData.dividendYield.toFixed(2) + '%' : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3">
                      <p className="text-xs text-gray-500">FCF Yield</p>
                      <p className="text-lg font-semibold text-white">
                        {researchData.fcfYield ? researchData.fcfYield.toFixed(2) + '%' : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profitability & Growth */}
                {(researchData.grossMargin || researchData.roe || researchData.revenueGrowth) && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Profitability */}
                    <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">💰 Profitability</h3>
                      <div className="space-y-3">
                        {[
                          { label: 'Gross Margin', value: researchData.grossMargin, suffix: '%' },
                          { label: 'Operating Margin', value: researchData.operatingMargin, suffix: '%' },
                          { label: 'Net Margin', value: researchData.netMargin, suffix: '%' },
                          { label: 'ROE', value: researchData.roe, suffix: '%' },
                          { label: 'ROA', value: researchData.roa, suffix: '%' },
                          { label: 'ROIC', value: researchData.roic, suffix: '%' }
                        ].filter(m => m.value !== null && m.value !== undefined).map(({ label, value, suffix }) => (
                          <div key={label} className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">{label}</span>
                            <span className={`font-semibold ${(value || 0) >= 0 ? 'text-white' : 'text-red-400'}`}>
                              {(value || 0).toFixed(1)}{suffix}
                            </span>
                          </div>
                        ))}
                        {!researchData.grossMargin && !researchData.roe && (
                          <p className="text-gray-500 text-sm text-center py-4">Profitability data not available</p>
                        )}
                      </div>
                    </div>

                    {/* Growth */}
                    <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">📈 Growth (YoY)</h3>
                      <div className="space-y-3">
                        {[
                          { label: 'Revenue Growth', value: researchData.revenueGrowth },
                          { label: 'Earnings Growth', value: researchData.earningsGrowth },
                          { label: 'FCF Growth', value: researchData.fcfGrowth }
                        ].filter(m => m.value !== null && m.value !== undefined).map(({ label, value }) => (
                          <div key={label} className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">{label}</span>
                            <span className={`font-semibold ${(value || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {(value || 0) >= 0 ? '+' : ''}{(value || 0).toFixed(1)}%
                            </span>
                          </div>
                        ))}
                        {!researchData.revenueGrowth && !researchData.earningsGrowth && (
                          <p className="text-gray-500 text-sm text-center py-4">Growth data not available</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Financial Health */}
                {(researchData.currentRatio || researchData.debtToEquity || researchData.totalDebt) && (
                  <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">🏦 Financial Health</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-xs text-gray-500">Current Ratio</p>
                        <p className={`text-lg font-semibold ${
                          (researchData.currentRatio || 0) >= 1.5 ? 'text-emerald-400' :
                          (researchData.currentRatio || 0) >= 1 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {researchData.currentRatio ? researchData.currentRatio.toFixed(2) : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-xs text-gray-500">Quick Ratio</p>
                        <p className="text-lg font-semibold text-white">
                          {researchData.quickRatio ? researchData.quickRatio.toFixed(2) : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-xs text-gray-500">Debt/Equity</p>
                        <p className={`text-lg font-semibold ${
                          (researchData.debtToEquity || 0) <= 0.5 ? 'text-emerald-400' :
                          (researchData.debtToEquity || 0) <= 1 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {researchData.debtToEquity ? researchData.debtToEquity.toFixed(2) + 'x' : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-xs text-gray-500">Interest Coverage</p>
                        <p className="text-lg font-semibold text-white">
                          {researchData.interestCoverage ? researchData.interestCoverage.toFixed(1) + 'x' : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-xs text-gray-500">Total Debt</p>
                        <p className="text-lg font-semibold text-white">
                          {researchData.totalDebt 
                            ? '$' + (researchData.totalDebt >= 1e9 
                              ? (researchData.totalDebt / 1e9).toFixed(1) + 'B'
                              : (researchData.totalDebt / 1e6).toFixed(0) + 'M')
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-xs text-gray-500">Cash & Equivalents</p>
                        <p className="text-lg font-semibold text-emerald-400">
                          {researchData.cashAndEquivalents 
                            ? '$' + (researchData.cashAndEquivalents >= 1e9 
                              ? (researchData.cashAndEquivalents / 1e9).toFixed(1) + 'B'
                              : (researchData.cashAndEquivalents / 1e6).toFixed(0) + 'M')
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-xs text-gray-500">Free Cash Flow</p>
                        <p className={`text-lg font-semibold ${(researchData.freeCashFlow || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {researchData.freeCashFlow 
                            ? '$' + (Math.abs(researchData.freeCashFlow) >= 1e9 
                              ? (researchData.freeCashFlow / 1e9).toFixed(1) + 'B'
                              : (researchData.freeCashFlow / 1e6).toFixed(0) + 'M')
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-xs text-gray-500">Total Assets</p>
                        <p className="text-lg font-semibold text-white">
                          {researchData.totalAssets 
                            ? '$' + (researchData.totalAssets >= 1e9 
                              ? (researchData.totalAssets / 1e9).toFixed(1) + 'B'
                              : (researchData.totalAssets / 1e6).toFixed(0) + 'M')
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Technical Levels */}
                {researchData.technicalLevels && (
                  <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">📉 Technical Levels</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
                        <p className="text-xs text-red-400 mb-1">Support 2</p>
                        <p className="text-lg font-semibold text-white">${researchData.technicalLevels.support2.toFixed(2)}</p>
                      </div>
                      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 text-center">
                        <p className="text-xs text-orange-400 mb-1">Support 1</p>
                        <p className="text-lg font-semibold text-white">${researchData.technicalLevels.support1.toFixed(2)}</p>
                      </div>
                      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 text-center">
                        <p className="text-xs text-indigo-400 mb-1">Pivot Point</p>
                        <p className="text-lg font-semibold text-white">${researchData.technicalLevels.pivotPoint.toFixed(2)}</p>
                      </div>
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
                        <p className="text-xs text-blue-400 mb-1">Resistance 1</p>
                        <p className="text-lg font-semibold text-white">${researchData.technicalLevels.resistance1.toFixed(2)}</p>
                      </div>
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
                        <p className="text-xs text-emerald-400 mb-1">Resistance 2</p>
                        <p className="text-lg font-semibold text-white">${researchData.technicalLevels.resistance2.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-gray-500">50-Day MA: <span className="text-white">${researchData.fiftyDayAvg.toFixed(2)}</span></span>
                      <span className="text-gray-500">200-Day MA: <span className="text-white">${researchData.twoHundredDayAvg.toFixed(2)}</span></span>
                      <span className="text-gray-500">52W Range: <span className="text-white">${researchData.fiftyTwoWeekLow.toFixed(2)} - ${researchData.fiftyTwoWeekHigh.toFixed(2)}</span></span>
                    </div>
                  </div>
                )}

                {/* Catalysts & Risks */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-[#12121a] border border-indigo-500/20 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      ⚡ Upcoming Catalysts
                    </h3>
                    <ul className="space-y-3">
                      {researchData.catalysts.map((catalyst, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-300 text-sm">
                          <span className="text-indigo-400">→</span>
                          <span>{catalyst}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-[#12121a] border border-amber-500/20 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      ⚠️ Key Risks
                    </h3>
                    <ul className="space-y-3">
                      {researchData.risks.map((risk, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-300 text-sm">
                          <span className="text-amber-400">!</span>
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recent News */}
                {researchData.recentNews.length > 0 && (
                  <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">📰 Recent News</h3>
                    <div className="space-y-3">
                      {researchData.recentNews.map((news, idx) => (
                        <a
                          key={idx}
                          href={news.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition"
                        >
                          <span className="text-gray-500">📄</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm line-clamp-2">{news.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{news.publisher} • {news.date}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* External Research Links */}
                <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">🔗 External Research</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Dive deeper with these free research resources
                  </p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <a
                      href={`https://finance.yahoo.com/quote/${researchData.symbol}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition"
                    >
                      <span className="text-xl">📈</span>
                      <div>
                        <p className="text-white text-sm font-medium">Yahoo Finance</p>
                        <p className="text-xs text-gray-500">Full quote & financials</p>
                      </div>
                    </a>
                    <a
                      href={`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${researchData.symbol}&type=10-K&dateb=&owner=include&count=40`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition"
                    >
                      <span className="text-xl">📋</span>
                      <div>
                        <p className="text-white text-sm font-medium">SEC Filings</p>
                        <p className="text-xs text-gray-500">10-K, 10-Q reports</p>
                      </div>
                    </a>
                    <a
                      href={`https://finviz.com/quote.ashx?t=${researchData.symbol}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition"
                    >
                      <span className="text-xl">📊</span>
                      <div>
                        <p className="text-white text-sm font-medium">Finviz</p>
                        <p className="text-xs text-gray-500">Charts & screening</p>
                      </div>
                    </a>
                    <a
                      href={`https://www.marketwatch.com/investing/stock/${researchData.symbol.toLowerCase()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition"
                    >
                      <span className="text-xl">📰</span>
                      <div>
                        <p className="text-white text-sm font-medium">MarketWatch</p>
                        <p className="text-xs text-gray-500">News & analysis</p>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Data Sources & Download */}
                <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        📄 Data Sources
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">
                        Transparency about where this analysis comes from
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        // Generate PDF report
                        const reportData = {
                          ...researchData,
                          userHolding: userHolding ? {
                            shares: userHolding.shares,
                            currentValue: userHolding.currentValue
                          } : null
                        };
                        
                        const response = await fetch('/api/stock-research/pdf', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(reportData)
                        });
                        
                        if (response.ok) {
                          const html = await response.text();
                          const blob = new Blob([html], { type: 'text/html' });
                          const url = URL.createObjectURL(blob);
                          const newWindow = window.open(url, '_blank');
                          if (newWindow) {
                            newWindow.onload = () => {
                              newWindow.print();
                            };
                          }
                        }
                      }}
                      className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Report
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {researchData.dataSource === 'fmp' ? (
                      <>
                        <div className="flex items-start gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                          <span className="text-emerald-400">✓</span>
                          <div>
                            <p className="text-white text-sm font-medium">Financial Modeling Prep (FMP)</p>
                            <p className="text-xs text-gray-500">Real-time quotes, analyst ratings, financial statements, and fundamentals</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                          <span className="text-emerald-400">✓</span>
                          <div>
                            <p className="text-white text-sm font-medium">Analyst Ratings & Price Targets</p>
                            <p className="text-xs text-gray-500">Real consensus from {researchData.numberOfAnalysts}+ Wall Street analysts</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                          <span className="text-emerald-400">✓</span>
                          <div>
                            <p className="text-white text-sm font-medium">Financial Statements</p>
                            <p className="text-xs text-gray-500">Income statement, balance sheet, cash flow from SEC filings</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                          <span className="text-emerald-400">✓</span>
                          <div>
                            <p className="text-white text-sm font-medium">Valuation & Growth Metrics</p>
                            <p className="text-xs text-gray-500">P/E, P/B, P/S, EV/EBITDA, ROE, ROA, margins, growth rates</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                          <span className="text-emerald-400">✓</span>
                          <div>
                            <p className="text-white text-sm font-medium">Price Data</p>
                            <p className="text-xs text-gray-500">Yahoo Finance Chart API • Real-time delayed ~15 minutes</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                          <span className="text-amber-400">~</span>
                          <div>
                            <p className="text-white text-sm font-medium">Analyst Ratings & Price Targets</p>
                            <p className="text-xs text-gray-500">Simulated based on price performance • For illustration only</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                          <span className="text-gray-500">✗</span>
                          <div>
                            <p className="text-white text-sm font-medium">Fundamentals</p>
                            <p className="text-xs text-gray-500">Not available without FMP API key</p>
                          </div>
                        </div>
                      </>
                    )}
                    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                      <span className="text-emerald-400">✓</span>
                      <div>
                        <p className="text-white text-sm font-medium">Technical Indicators</p>
                        <p className="text-xs text-gray-500">Calculated from price data: moving averages, support/resistance levels</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                      <span className="text-emerald-400">✓</span>
                      <div>
                        <p className="text-white text-sm font-medium">News Headlines</p>
                        <p className="text-xs text-gray-500">Yahoo Finance News API • Links to original sources</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                      <span className="text-indigo-400">🧠</span>
                      <div>
                        <p className="text-white text-sm font-medium">Maven Score™ & Analysis</p>
                        <p className="text-xs text-gray-500">AI-generated based on available data • Not investment advice</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Dynamic Disclaimer based on data source */}
                  <div className={`mt-4 p-4 rounded-xl ${
                    researchData.dataSource === 'fmp' 
                      ? 'bg-slate-500/10 border border-slate-500/20' 
                      : 'bg-amber-500/10 border border-amber-500/20'
                  }`}>
                    <p className={`text-xs ${researchData.dataSource === 'fmp' ? 'text-slate-300' : 'text-amber-300'}`}>
                      <strong>📋 Data Disclaimer:</strong>
                    </p>
                    {researchData.dataSource === 'fmp' ? (
                      <div className="mt-2 space-y-2 text-xs text-slate-400">
                        <p>
                          <span className="text-emerald-400 font-medium">✓ Real Analyst Data:</span> Analyst ratings, 
                          price targets, and financial statements are sourced from Financial Modeling Prep (FMP), 
                          which aggregates data from SEC filings and Wall Street research firms.
                        </p>
                        <p>
                          <span className="text-indigo-400 font-medium">🧠 Maven Analysis:</span> Maven Score™, letter grades 
                          (A-F), bull/bear cases, and investment thesis are generated by Maven Oracle AI based on the 
                          underlying data. These are algorithmic assessments, not human analyst opinions.
                        </p>
                        <p className="text-gray-500">
                          Maven is not a registered investment advisor. This report is for informational and educational 
                          purposes only. Always verify data and consult a qualified financial advisor before making 
                          investment decisions.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-2 space-y-2 text-xs text-amber-400/80">
                        <p>
                          <span className="text-amber-400 font-medium">⚠️ Simulated Data:</span> Analyst ratings and price 
                          targets shown are <strong>simulated by Maven Oracle</strong> based on price performance patterns. 
                          They do not represent actual Wall Street analyst opinions.
                        </p>
                        <p>
                          <span className="text-emerald-400 font-medium">✓ Real Data:</span> Price quotes and historical 
                          data are real, sourced from Yahoo Finance.
                        </p>
                        <p className="text-gray-500">
                          This simulated analysis is for <strong>educational and illustrative purposes only</strong>. 
                          Do not make investment decisions based on simulated ratings.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ask Oracle about this stock */}
                <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/30 rounded-2xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-violet-500/20 flex items-center justify-center text-3xl">
                      🔮
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">Want Deeper Analysis?</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        Ask Maven Oracle for personalized insights on {researchData.symbol}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        localStorage.setItem('maven_chat_prompt', `Give me a detailed analysis of ${researchData.symbol} (${researchData.name}). Should I buy, hold, or sell? Consider my overall portfolio context.`);
                        router.push('/oracle');
                      }}
                      className="px-5 py-2.5 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-xl transition"
                    >
                      Ask Oracle →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-400 hover:text-white text-sm transition"
          >
            ← Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
