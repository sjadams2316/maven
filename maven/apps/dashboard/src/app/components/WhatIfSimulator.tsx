'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Term } from './InfoTooltip';
import {
  classifyTicker,
  calculatePortfolioFactorExposures,
  getFactorInterpretation,
  FactorExposures,
  AssetClass,
} from '@/lib/portfolio-utils';

// ============== GAMIFICATION TYPES ==============

type TradeGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

interface TradeGradeResult {
  grade: TradeGrade;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowClass: string;
  isPulsing: boolean;
}

interface AchievementCallout {
  emoji: string;
  message: string;
  type: 'positive' | 'neutral' | 'warning' | 'danger';
}

// ============== GAMIFICATION UTILITIES ==============

/**
 * Calculate a trade grade based on concentration, diversification, and risk impact
 */
function calculateTradeGrade(
  concentrationChange: number,
  volatilityChange: number,
  betaChange: number,
  newPositionSize: number
): TradeGradeResult {
  // Scoring: lower is better (less risk)
  let score = 0;
  
  // Concentration impact (weight: 40%)
  // Increasing concentration is bad
  if (concentrationChange > 5) score += 4;
  else if (concentrationChange > 2) score += 3;
  else if (concentrationChange > 0) score += 1;
  else if (concentrationChange < -2) score -= 2; // Reducing concentration is good
  else if (concentrationChange < 0) score -= 1;
  
  // Position size check (weight: 30%)
  // Large single positions are risky
  if (newPositionSize > 25) score += 4;
  else if (newPositionSize > 15) score += 2;
  else if (newPositionSize > 10) score += 1;
  else if (newPositionSize < 5) score -= 1; // Small, diversified position
  
  // Volatility impact (weight: 20%)
  if (volatilityChange > 5) score += 3;
  else if (volatilityChange > 2) score += 2;
  else if (volatilityChange > 0) score += 1;
  else if (volatilityChange < -2) score -= 1;
  
  // Beta impact (weight: 10%)
  if (betaChange > 0.2) score += 2;
  else if (betaChange > 0.1) score += 1;
  else if (betaChange < -0.1) score -= 1;
  
  // Map score to grade
  let grade: TradeGrade;
  if (score <= -2) grade = 'A+';
  else if (score <= 0) grade = 'A';
  else if (score <= 2) grade = 'B';
  else if (score <= 4) grade = 'C';
  else if (score <= 6) grade = 'D';
  else grade = 'F';
  
  const gradeConfig: Record<TradeGrade, Omit<TradeGradeResult, 'grade'>> = {
    'A+': {
      label: 'Excellent Diversifier',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500/50',
      glowClass: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]',
      isPulsing: false,
    },
    'A': {
      label: 'Good Addition',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/15',
      borderColor: 'border-emerald-500/40',
      glowClass: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      isPulsing: false,
    },
    'B': {
      label: 'Neutral Trade',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/15',
      borderColor: 'border-blue-500/40',
      glowClass: '',
      isPulsing: false,
    },
    'C': {
      label: 'Increases Concentration',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/15',
      borderColor: 'border-yellow-500/40',
      glowClass: 'shadow-[0_0_15px_rgba(234,179,8,0.3)]',
      isPulsing: false,
    },
    'D': {
      label: 'Significant Risk',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/15',
      borderColor: 'border-orange-500/40',
      glowClass: 'shadow-[0_0_15px_rgba(249,115,22,0.4)]',
      isPulsing: false,
    },
    'F': {
      label: 'Dangerous Concentration',
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/50',
      glowClass: 'shadow-[0_0_25px_rgba(239,68,68,0.5)]',
      isPulsing: true,
    },
  };
  
  return { grade, ...gradeConfig[grade] };
}

/**
 * Generate achievement-style callouts based on trade impact
 */
function generateCallouts(
  ticker: string,
  tradeType: 'buy' | 'sell',
  newPositionSize: number,
  concentrationChange: number,
  volatilityChange: number,
  betaChange: number,
  tradeCost: number
): AchievementCallout[] {
  const callouts: AchievementCallout[] = [];
  
  // Position size callout
  if (newPositionSize > 15) {
    callouts.push({
      emoji: '⚠️',
      message: `${ticker} would become ${newPositionSize.toFixed(1)}% of your portfolio`,
      type: 'warning',
    });
  } else if (newPositionSize > 0 && newPositionSize < 5 && tradeType === 'buy') {
    callouts.push({
      emoji: '🎯',
      message: `Smart sizing! ${ticker} stays under 5% — well diversified`,
      type: 'positive',
    });
  }
  
  // Concentration callouts
  if (concentrationChange < -2) {
    callouts.push({
      emoji: '🏆',
      message: `Great choice! This improves your diversification`,
      type: 'positive',
    });
  } else if (concentrationChange > 5) {
    callouts.push({
      emoji: '🚨',
      message: `Warning: Creates significant concentration risk`,
      type: 'danger',
    });
  }
  
  // Volatility callouts
  if (volatilityChange > 5) {
    callouts.push({
      emoji: '📉',
      message: `Increases portfolio volatility by ${volatilityChange.toFixed(1)}%`,
      type: 'warning',
    });
  } else if (volatilityChange < -3) {
    callouts.push({
      emoji: '🛡️',
      message: `Reduces portfolio volatility by ${Math.abs(volatilityChange).toFixed(1)}%`,
      type: 'positive',
    });
  }
  
  // Beta callouts
  if (betaChange > 0.15) {
    callouts.push({
      emoji: '📈',
      message: `Makes portfolio more sensitive to market swings`,
      type: 'neutral',
    });
  } else if (betaChange < -0.15) {
    callouts.push({
      emoji: '⚖️',
      message: `Adds stability with lower market correlation`,
      type: 'positive',
    });
  }
  
  // Estimated dividend (simple heuristic based on asset class)
  if (tradeType === 'buy' && tradeCost > 0) {
    const assetClass = classifyTicker(ticker);
    let yieldEstimate = 0;
    if (assetClass === 'bonds') yieldEstimate = 0.04;
    else if (assetClass === 'reits') yieldEstimate = 0.05;
    else if (assetClass === 'usEquity') yieldEstimate = 0.015;
    else if (assetClass === 'intlEquity') yieldEstimate = 0.025;
    
    if (yieldEstimate > 0) {
      const annualDividend = tradeCost * yieldEstimate;
      if (annualDividend >= 100) {
        callouts.push({
          emoji: '💰',
          message: `Adds ~$${annualDividend.toLocaleString(undefined, { maximumFractionDigits: 0 })}/year in estimated dividends`,
          type: 'positive',
        });
      }
    }
  }
  
  return callouts;
}

// ============== GAMIFICATION COMPONENTS ==============

/**
 * Trade Grade Badge - prominent visual indicator
 */
function TradeGradeBadge({ gradeResult }: { gradeResult: TradeGradeResult }) {
  return (
    <div
      className={`
        relative flex flex-col items-center justify-center p-6 rounded-2xl border-2
        ${gradeResult.bgColor} ${gradeResult.borderColor} ${gradeResult.glowClass}
        transition-all duration-300
        ${gradeResult.isPulsing ? 'animate-pulse' : ''}
      `}
    >
      <span className={`text-5xl font-black ${gradeResult.color}`}>
        {gradeResult.grade}
      </span>
      <span className={`text-sm font-medium mt-1 ${gradeResult.color}`}>
        {gradeResult.label}
      </span>
    </div>
  );
}

/**
 * Achievement Callout Card
 */
function AchievementCallout({ callout }: { callout: AchievementCallout }) {
  const typeStyles = {
    positive: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    neutral: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
    danger: 'bg-red-500/10 border-red-500/30 text-red-300 animate-pulse',
  };
  
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${typeStyles[callout.type]}`}>
      <span className="text-2xl">{callout.emoji}</span>
      <span className="text-sm font-medium">{callout.message}</span>
    </div>
  );
}

/**
 * Concentration Risk Meter - visual progress bar with color zones
 */
function ConcentrationMeter({ 
  current, 
  hypothetical, 
  label 
}: { 
  current: number; 
  hypothetical: number; 
  label: string;
}) {
  // Thresholds: 0-10% green, 10-20% yellow, 20%+ red
  const getColor = (value: number) => {
    if (value < 10) return 'bg-emerald-500';
    if (value < 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  const change = hypothetical - current;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{current.toFixed(1)}%</span>
          <span className="text-xs text-gray-600">→</span>
          <span className={`text-xs font-medium ${
            hypothetical < 10 ? 'text-emerald-400' : 
            hypothetical < 20 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {hypothetical.toFixed(1)}%
          </span>
          {Math.abs(change) >= 0.5 && (
            <span className={`text-xs ${change > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              ({change > 0 ? '+' : ''}{change.toFixed(1)})
            </span>
          )}
        </div>
      </div>
      
      {/* Progress bar with zones */}
      <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
        {/* Zone indicators */}
        <div className="absolute inset-0 flex">
          <div className="w-[33%] bg-emerald-500/20 border-r border-white/10" />
          <div className="w-[33%] bg-yellow-500/20 border-r border-white/10" />
          <div className="w-[34%] bg-red-500/20" />
        </div>
        
        {/* Current value marker */}
        <div 
          className={`absolute h-full w-1 ${getColor(current)} opacity-50 transition-all duration-500`}
          style={{ left: `${Math.min(current, 100) * 0.33}%` }}
        />
        
        {/* Hypothetical value bar */}
        <div 
          className={`absolute h-full ${getColor(hypothetical)} transition-all duration-500 rounded-full`}
          style={{ width: `${Math.min(hypothetical, 100) * 0.33}%` }}
        />
      </div>
      
      {/* Zone labels */}
      <div className="flex justify-between text-[10px] text-gray-500">
        <span>Safe</span>
        <span>Moderate</span>
        <span>High Risk</span>
      </div>
    </div>
  );
}

// Types
interface Holding {
  ticker: string;
  name?: string;
  shares: number;
  costBasis: number;
  currentPrice?: number;
  currentValue?: number;
}

interface SimulatedTrade {
  type: 'buy' | 'sell';
  ticker: string;
  quantity: number;
  inputMode: 'shares' | 'dollars';
  price: number;
}

interface SimulationResult {
  currentPortfolio: {
    totalValue: number;
    allocation: Record<string, number>;
    topPositions: { ticker: string; value: number; percent: number }[];
    concentration: number;
    factorExposures: FactorExposures;
    estimatedBeta: number;
    estimatedVolatility: number;
  };
  hypotheticalPortfolio: {
    totalValue: number;
    allocation: Record<string, number>;
    topPositions: { ticker: string; value: number; percent: number }[];
    concentration: number;
    factorExposures: FactorExposures;
    estimatedBeta: number;
    estimatedVolatility: number;
    newPositionSize: number;
  };
  tradeCost: number;
  tradeShares: number;
  changes: {
    totalValue: number;
    concentration: number;
    beta: number;
    volatility: number;
    allocationShifts: { category: string; current: number; hypothetical: number; change: number }[];
    factorShifts: { factor: string; current: number; hypothetical: number; change: number }[];
  };
}

interface WhatIfSimulatorProps {
  holdings: Holding[];
  totalValue: number;
}

// Popular tickers for autocomplete
const POPULAR_TICKERS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK.B', 'JPM', 'V',
  'VTI', 'VOO', 'VEA', 'VXUS', 'BND', 'VNQ', 'QQQ', 'SPY', 'IWM', 'AGG',
  'SCHD', 'VUG', 'VTV', 'VGT', 'ARKK', 'IBIT', 'FBTC', 'GLD', 'TLT', 'HYG',
  'CIFR', 'IREN', 'MARA', 'RIOT', 'COIN', 'SQ', 'AMD', 'CRM', 'NFLX', 'DIS',
  'BTC', 'ETH', 'SOL', 'TAO',
];

// Helper function to fetch current price
async function fetchCurrentPrice(ticker: string): Promise<number | null> {
  try {
    // Use the stock-research API which has price data
    const res = await fetch(`/api/stock-research?symbol=${encodeURIComponent(ticker)}`);
    if (res.ok) {
      const data = await res.json();
      return data.currentPrice || null;
    }
  } catch (e) {
    console.error('Failed to fetch price:', e);
  }
  return null;
}

// Calculate allocation percentages
function calculateAllocation(holdings: Holding[], totalValue: number): Record<string, number> {
  const allocation: Record<string, number> = {
    usEquity: 0,
    intlEquity: 0,
    bonds: 0,
    crypto: 0,
    cash: 0,
    alternatives: 0,
  };

  holdings.forEach((h) => {
    const value = h.currentValue || 0;
    const assetClass = classifyTicker(h.ticker);
    // Map to simplified categories
    if (assetClass === 'reits' || assetClass === 'gold') {
      allocation.alternatives += (value / totalValue) * 100;
    } else {
      allocation[assetClass] = (allocation[assetClass] || 0) + (value / totalValue) * 100;
    }
  });

  return allocation;
}

// Estimate portfolio beta from holdings
function estimateBeta(holdings: Holding[], totalValue: number): number {
  // Simple heuristic based on asset class mix
  let weightedBeta = 0;
  
  holdings.forEach((h) => {
    const value = h.currentValue || 0;
    const weight = value / totalValue;
    const assetClass = classifyTicker(h.ticker);
    
    // Approximate beta by asset class
    const betas: Record<string, number> = {
      usEquity: 1.1,
      intlEquity: 0.9,
      bonds: 0.1,
      crypto: 2.0,
      cash: 0.0,
      reits: 1.0,
      gold: 0.1,
      alternatives: 0.5,
    };
    
    weightedBeta += (betas[assetClass] || 1.0) * weight;
  });
  
  return weightedBeta;
}

// Estimate portfolio volatility
function estimateVolatility(holdings: Holding[], totalValue: number): number {
  // Simple heuristic based on asset class mix
  let weightedVol = 0;
  
  holdings.forEach((h) => {
    const value = h.currentValue || 0;
    const weight = value / totalValue;
    const assetClass = classifyTicker(h.ticker);
    
    // Approximate volatility by asset class (annualized %)
    const vols: Record<string, number> = {
      usEquity: 18,
      intlEquity: 22,
      bonds: 6,
      crypto: 60,
      cash: 1,
      reits: 20,
      gold: 15,
      alternatives: 25,
    };
    
    weightedVol += (vols[assetClass] || 18) * weight;
  });
  
  return weightedVol;
}

// Get top positions
function getTopPositions(
  holdings: Holding[],
  totalValue: number
): { ticker: string; value: number; percent: number }[] {
  return holdings
    .map((h) => ({
      ticker: h.ticker,
      value: h.currentValue || 0,
      percent: ((h.currentValue || 0) / totalValue) * 100,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

export default function WhatIfSimulator({ holdings, totalValue }: WhatIfSimulatorProps) {
  // Trade input state
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [inputMode, setInputMode] = useState<'shares' | 'dollars'>('shares');
  const [price, setPrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [simulationApplied, setSimulationApplied] = useState(false);

  // Get existing holding tickers for autocomplete
  const existingTickers = useMemo(
    () => holdings.map((h) => h.ticker.toUpperCase()),
    [holdings]
  );

  // Autocomplete suggestions
  const suggestions = useMemo(() => {
    if (!ticker || ticker.length < 1) return [];
    const upper = ticker.toUpperCase();
    const allTickers = [...new Set([...existingTickers, ...POPULAR_TICKERS])];
    return allTickers
      .filter((t) => t.startsWith(upper) && t !== upper)
      .slice(0, 8);
  }, [ticker, existingTickers]);

  // Fetch price when ticker changes
  const handleTickerChange = useCallback(async (newTicker: string) => {
    setTicker(newTicker.toUpperCase());
    setSimulationApplied(false);
    
    if (newTicker.length >= 1) {
      // Check if we already have this holding with a price
      const existingHolding = holdings.find(
        (h) => h.ticker.toUpperCase() === newTicker.toUpperCase()
      );
      if (existingHolding?.currentPrice) {
        setPrice(existingHolding.currentPrice);
        return;
      }

      // Otherwise fetch
      setPriceLoading(true);
      const fetchedPrice = await fetchCurrentPrice(newTicker);
      if (fetchedPrice) {
        setPrice(fetchedPrice);
      } else {
        setPrice(null);
      }
      setPriceLoading(false);
    } else {
      setPrice(null);
    }
  }, [holdings]);

  // Select from autocomplete
  const handleSelectTicker = (t: string) => {
    handleTickerChange(t);
    setShowAutocomplete(false);
  };

  // Calculate simulation result
  const simulationResult = useMemo((): SimulationResult | null => {
    if (!ticker || !price || !quantity) return null;

    const quantityNum = Number(quantity);
    if (quantityNum <= 0) return null;

    // Calculate shares based on input mode
    const tradeShares = inputMode === 'shares' ? quantityNum : Math.floor(quantityNum / price);
    const tradeCost = inputMode === 'dollars' ? quantityNum : quantityNum * price;

    // Build current portfolio metrics
    const currentAllocation = calculateAllocation(holdings, totalValue);
    const currentFactors = calculatePortfolioFactorExposures(holdings);
    const currentBeta = estimateBeta(holdings, totalValue);
    const currentVol = estimateVolatility(holdings, totalValue);
    const currentTopPositions = getTopPositions(holdings, totalValue);
    const currentConcentration =
      currentTopPositions.length > 0 ? currentTopPositions[0].percent : 0;

    // Build hypothetical holdings
    const hypotheticalHoldings: Holding[] = holdings.map((h) => ({ ...h }));
    const existingIdx = hypotheticalHoldings.findIndex(
      (h) => h.ticker.toUpperCase() === ticker.toUpperCase()
    );

    if (tradeType === 'buy') {
      if (existingIdx >= 0) {
        // Add to existing position
        hypotheticalHoldings[existingIdx] = {
          ...hypotheticalHoldings[existingIdx],
          shares: hypotheticalHoldings[existingIdx].shares + tradeShares,
          currentValue:
            (hypotheticalHoldings[existingIdx].currentValue || 0) + tradeShares * price,
        };
      } else {
        // New position
        hypotheticalHoldings.push({
          ticker: ticker.toUpperCase(),
          name: ticker.toUpperCase(),
          shares: tradeShares,
          costBasis: tradeCost,
          currentPrice: price,
          currentValue: tradeShares * price,
        });
      }
    } else {
      // Sell
      if (existingIdx >= 0) {
        const currentShares = hypotheticalHoldings[existingIdx].shares;
        const sharesToSell = Math.min(tradeShares, currentShares);
        const newShares = currentShares - sharesToSell;
        
        if (newShares <= 0) {
          // Remove position entirely
          hypotheticalHoldings.splice(existingIdx, 1);
        } else {
          hypotheticalHoldings[existingIdx] = {
            ...hypotheticalHoldings[existingIdx],
            shares: newShares,
            currentValue: newShares * price,
          };
        }
      }
    }

    // Calculate hypothetical metrics
    const hypotheticalTotalValue =
      tradeType === 'buy' ? totalValue + tradeCost : totalValue - tradeCost;
    const hypotheticalAllocation = calculateAllocation(
      hypotheticalHoldings,
      hypotheticalTotalValue
    );
    const hypotheticalFactors = calculatePortfolioFactorExposures(hypotheticalHoldings);
    const hypotheticalBeta = estimateBeta(hypotheticalHoldings, hypotheticalTotalValue);
    const hypotheticalVol = estimateVolatility(hypotheticalHoldings, hypotheticalTotalValue);
    const hypotheticalTopPositions = getTopPositions(
      hypotheticalHoldings,
      hypotheticalTotalValue
    );
    const hypotheticalConcentration =
      hypotheticalTopPositions.length > 0 ? hypotheticalTopPositions[0].percent : 0;

    // Find the new/modified position size
    const newPosition = hypotheticalTopPositions.find(
      (p) => p.ticker.toUpperCase() === ticker.toUpperCase()
    );
    const newPositionSize = newPosition?.percent || 0;

    // Calculate changes
    const allocationCategories = ['usEquity', 'intlEquity', 'bonds', 'crypto', 'cash', 'alternatives'];
    const allocationShifts = allocationCategories.map((cat) => ({
      category: cat,
      current: currentAllocation[cat] || 0,
      hypothetical: hypotheticalAllocation[cat] || 0,
      change: (hypotheticalAllocation[cat] || 0) - (currentAllocation[cat] || 0),
    }));

    const factorKeys: (keyof FactorExposures)[] = [
      'marketBeta',
      'size',
      'value',
      'momentum',
      'quality',
    ];
    const factorShifts = factorKeys.map((factor) => ({
      factor,
      current: currentFactors[factor],
      hypothetical: hypotheticalFactors[factor],
      change: hypotheticalFactors[factor] - currentFactors[factor],
    }));

    return {
      currentPortfolio: {
        totalValue,
        allocation: currentAllocation,
        topPositions: currentTopPositions,
        concentration: currentConcentration,
        factorExposures: currentFactors,
        estimatedBeta: currentBeta,
        estimatedVolatility: currentVol,
      },
      hypotheticalPortfolio: {
        totalValue: hypotheticalTotalValue,
        allocation: hypotheticalAllocation,
        topPositions: hypotheticalTopPositions,
        concentration: hypotheticalConcentration,
        factorExposures: hypotheticalFactors,
        estimatedBeta: hypotheticalBeta,
        estimatedVolatility: hypotheticalVol,
        newPositionSize,
      },
      tradeCost,
      tradeShares,
      changes: {
        totalValue: hypotheticalTotalValue - totalValue,
        concentration: hypotheticalConcentration - currentConcentration,
        beta: hypotheticalBeta - currentBeta,
        volatility: hypotheticalVol - currentVol,
        allocationShifts,
        factorShifts,
      },
    };
  }, [ticker, price, quantity, inputMode, tradeType, holdings, totalValue]);

  // Clear simulation
  const handleClear = () => {
    setTicker('');
    setQuantity('');
    setPrice(null);
    setSimulationApplied(false);
  };

  // Format allocation category name
  const formatCategory = (cat: string): string => {
    const names: Record<string, string> = {
      usEquity: 'US Equity',
      intlEquity: "Int'l Equity",
      bonds: 'Bonds',
      crypto: 'Crypto',
      cash: 'Cash',
      alternatives: 'Alternatives',
    };
    return names[cat] || cat;
  };

  // Format factor name
  const formatFactor = (factor: string): string => {
    const names: Record<string, string> = {
      marketBeta: 'Market Beta',
      size: 'Size (Small vs Large)',
      value: 'Value vs Growth',
      momentum: 'Momentum',
      quality: 'Quality',
    };
    return names[factor] || factor;
  };

  // Check if user owns the ticker (for sell validation)
  const existingPosition = holdings.find(
    (h) => h.ticker.toUpperCase() === ticker.toUpperCase()
  );
  const maxSellShares = existingPosition?.shares || 0;
  const maxSellValue = existingPosition?.currentValue || 0;

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            🔮 What-If Trade Simulator
          </h3>
          {simulationResult && (
            <button
              onClick={handleClear}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              Clear
            </button>
          )}
        </div>
        <p className="text-gray-400 text-sm mb-6">
          Model hypothetical trades to see how they'd impact your portfolio before executing.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Trade Type */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">Trade Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setTradeType('buy')}
                className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  tradeType === 'buy'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setTradeType('sell')}
                className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  tradeType === 'sell'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                Sell
              </button>
            </div>
          </div>

          {/* Ticker Input */}
          <div className="relative">
            <label className="block text-xs text-gray-500 mb-2">Ticker Symbol</label>
            <input
              type="text"
              value={ticker}
              onChange={(e) => handleTickerChange(e.target.value)}
              onFocus={() => setShowAutocomplete(true)}
              onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
              placeholder="e.g., CIFR"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
            {/* Autocomplete dropdown */}
            {showAutocomplete && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-[#1a1a24] border border-white/10 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSelectTicker(s)}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10 flex justify-between items-center"
                  >
                    <span className="font-medium">{s}</span>
                    {existingTickers.includes(s) && (
                      <span className="text-xs text-indigo-400">In Portfolio</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input Mode Toggle + Quantity */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-500">
                {inputMode === 'shares' ? 'Shares' : 'Dollar Amount'}
              </label>
              <button
                onClick={() => setInputMode(inputMode === 'shares' ? 'dollars' : 'shares')}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                Switch to {inputMode === 'shares' ? '$' : 'shares'}
              </button>
            </div>
            <input
              type="number"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value ? Number(e.target.value) : '');
                setSimulationApplied(false);
              }}
              placeholder={inputMode === 'shares' ? 'e.g., 100' : 'e.g., 10000'}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              min={0}
            />
            {tradeType === 'sell' && maxSellShares > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Max: {maxSellShares.toLocaleString()} shares (${maxSellValue.toLocaleString()})
              </p>
            )}
          </div>

          {/* Price Display */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">Current Price</label>
            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white">
              {priceLoading ? (
                <span className="text-gray-500 animate-pulse">Loading...</span>
              ) : price ? (
                <span className="font-medium">${price.toFixed(2)}</span>
              ) : ticker ? (
                <span className="text-gray-500">Not found</span>
              ) : (
                <span className="text-gray-500">—</span>
              )}
            </div>
          </div>

          {/* Trade Summary */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">Trade Total</label>
            <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5">
              {simulationResult ? (
                <span
                  className={`font-medium ${
                    tradeType === 'buy' ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {tradeType === 'buy' ? '+' : '-'}${simulationResult.tradeCost.toLocaleString()}
                </span>
              ) : (
                <span className="text-gray-500">—</span>
              )}
            </div>
            {simulationResult && (
              <p className="text-xs text-gray-500 mt-1">
                {simulationResult.tradeShares.toLocaleString()} shares
              </p>
            )}
          </div>
        </div>

        {/* Validation Messages */}
        {tradeType === 'sell' && ticker && !existingPosition && (
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-sm text-amber-400">
              ⚠️ You don't currently own {ticker.toUpperCase()}. Switch to Buy or select a holding you own.
            </p>
          </div>
        )}
      </div>

      {/* Simulation Results */}
      {simulationResult && (
        <>
          {/* ============== GAMIFICATION: Trade Grade & Callouts ============== */}
          {(() => {
            const gradeResult = calculateTradeGrade(
              simulationResult.changes.concentration,
              simulationResult.changes.volatility,
              simulationResult.changes.beta,
              simulationResult.hypotheticalPortfolio.newPositionSize
            );
            const callouts = generateCallouts(
              ticker.toUpperCase(),
              tradeType,
              simulationResult.hypotheticalPortfolio.newPositionSize,
              simulationResult.changes.concentration,
              simulationResult.changes.volatility,
              simulationResult.changes.beta,
              simulationResult.tradeCost
            );
            
            return (
              <div className={`rounded-2xl p-6 border transition-all duration-300 ${gradeResult.glowClass} ${
                gradeResult.grade === 'A+' || gradeResult.grade === 'A'
                  ? 'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/30'
                  : gradeResult.grade === 'B'
                  ? 'bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent border-blue-500/30'
                  : gradeResult.grade === 'C'
                  ? 'bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-transparent border-yellow-500/30'
                  : gradeResult.grade === 'D'
                  ? 'bg-gradient-to-br from-orange-500/10 via-red-500/5 to-transparent border-orange-500/30'
                  : 'bg-gradient-to-br from-red-500/15 via-red-600/10 to-transparent border-red-500/40'
              }`}>
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Trade Grade Badge */}
                  <div className="flex-shrink-0">
                    <TradeGradeBadge gradeResult={gradeResult} />
                  </div>
                  
                  {/* Achievement Callouts */}
                  <div className="flex-1 space-y-3">
                    <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                      {tradeType === 'buy' ? '📈' : '📉'} 
                      {tradeType === 'buy' ? 'Buying' : 'Selling'} {ticker.toUpperCase()}
                    </h4>
                    
                    {callouts.length > 0 ? (
                      <div className="space-y-2">
                        {callouts.map((callout, idx) => (
                          <AchievementCallout key={idx} callout={callout} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">
                        This trade appears neutral with minimal impact on your portfolio.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ============== GAMIFICATION: Risk Meters ============== */}
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
            <h4 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              📊 Risk Impact Meters
            </h4>
            <div className="grid md:grid-cols-2 gap-6">
              <ConcentrationMeter 
                current={simulationResult.currentPortfolio.concentration}
                hypothetical={simulationResult.hypotheticalPortfolio.concentration}
                label="Top Position Concentration"
              />
              <ConcentrationMeter 
                current={simulationResult.currentPortfolio.estimatedVolatility}
                hypothetical={simulationResult.hypotheticalPortfolio.estimatedVolatility}
                label="Portfolio Volatility"
              />
            </div>
          </div>

          {/* Quick Impact Summary (existing, enhanced) */}
          <div
            className={`rounded-2xl p-6 border ${
              tradeType === 'buy'
                ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30'
                : 'bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30'
            }`}
          >
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              📋 Detailed Metrics
            </h4>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Position Size */}
              <div className={`bg-black/20 rounded-xl p-4 transition-all duration-300 ${
                simulationResult.hypotheticalPortfolio.newPositionSize > 15 
                  ? 'ring-2 ring-yellow-500/50' 
                  : simulationResult.hypotheticalPortfolio.newPositionSize > 25
                  ? 'ring-2 ring-red-500/50 animate-pulse'
                  : ''
              }`}>
                <p className="text-xs text-gray-400 mb-1">{ticker.toUpperCase()} Would Be</p>
                <p className={`text-2xl font-bold ${
                  simulationResult.hypotheticalPortfolio.newPositionSize > 25 ? 'text-red-400' :
                  simulationResult.hypotheticalPortfolio.newPositionSize > 15 ? 'text-yellow-400' :
                  'text-white'
                }`}>
                  {simulationResult.hypotheticalPortfolio.newPositionSize.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">of portfolio</p>
              </div>

              {/* Concentration Change */}
              <div className={`bg-black/20 rounded-xl p-4 transition-all duration-300 ${
                simulationResult.changes.concentration < -2 
                  ? 'ring-2 ring-emerald-500/40' 
                  : simulationResult.changes.concentration > 5
                  ? 'ring-2 ring-red-500/40'
                  : ''
              }`}>
                <p className="text-xs text-gray-400 mb-1">
                  <Term id="concentration-risk">Concentration</Term>
                </p>
                <p className="text-2xl font-bold text-white">
                  {simulationResult.hypotheticalPortfolio.concentration.toFixed(1)}%
                </p>
                <p
                  className={`text-xs ${
                    simulationResult.changes.concentration > 0 ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {simulationResult.changes.concentration > 0 ? '↑ More' : '↓ Less'} concentrated
                </p>
              </div>

              {/* Beta Change */}
              <div className={`bg-black/20 rounded-xl p-4 transition-all duration-300 ${
                simulationResult.changes.beta < -0.1 
                  ? 'ring-2 ring-emerald-500/40' 
                  : simulationResult.changes.beta > 0.2
                  ? 'ring-2 ring-yellow-500/40'
                  : ''
              }`}>
                <p className="text-xs text-gray-400 mb-1">
                  <Term id="beta">Portfolio Beta</Term>
                </p>
                <p className="text-2xl font-bold text-white">
                  {simulationResult.hypotheticalPortfolio.estimatedBeta.toFixed(2)}
                </p>
                <p
                  className={`text-xs ${
                    simulationResult.changes.beta > 0 ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {simulationResult.changes.beta > 0 ? '↑ Riskier' : '↓ Less risky'}
                </p>
              </div>

              {/* Volatility Change */}
              <div className={`bg-black/20 rounded-xl p-4 transition-all duration-300 ${
                simulationResult.changes.volatility < -3 
                  ? 'ring-2 ring-emerald-500/40' 
                  : simulationResult.changes.volatility > 5
                  ? 'ring-2 ring-red-500/40'
                  : ''
              }`}>
                <p className="text-xs text-gray-400 mb-1">Est. Volatility</p>
                <p className="text-2xl font-bold text-white">
                  {simulationResult.hypotheticalPortfolio.estimatedVolatility.toFixed(1)}%
                </p>
                <p
                  className={`text-xs ${
                    simulationResult.changes.volatility > 0 ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {simulationResult.changes.volatility > 0 ? '↑' : '↓'}{' '}
                  {Math.abs(simulationResult.changes.volatility).toFixed(1)}% change
                </p>
              </div>
            </div>
          </div>

          {/* Side-by-Side Comparison */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Current Portfolio */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <h4 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                📊 Current Portfolio
                <span className="text-xs font-normal text-gray-500">
                  ${simulationResult.currentPortfolio.totalValue.toLocaleString()}
                </span>
              </h4>

              {/* Allocation Bars */}
              <div className="space-y-3 mb-6">
                {simulationResult.changes.allocationShifts
                  .filter((a) => a.current > 0 || a.hypothetical > 0)
                  .map((a) => (
                    <div key={a.category}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">{formatCategory(a.category)}</span>
                        <span className="text-white">{a.current.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${Math.min(100, a.current)}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>

              {/* Top Positions */}
              <div className="border-t border-white/10 pt-4">
                <p className="text-xs text-gray-500 mb-2">Top Positions</p>
                <div className="space-y-2">
                  {simulationResult.currentPortfolio.topPositions.slice(0, 3).map((p) => (
                    <div key={p.ticker} className="flex justify-between text-sm">
                      <span className="text-gray-300">{p.ticker}</span>
                      <span className="text-white">{p.percent.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hypothetical Portfolio */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl p-6">
              <h4 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                ✨ After {tradeType === 'buy' ? 'Buying' : 'Selling'} {ticker.toUpperCase()}
                <span className="text-xs font-normal text-gray-400">
                  ${simulationResult.hypotheticalPortfolio.totalValue.toLocaleString()}
                </span>
              </h4>

              {/* Allocation Bars with Change Indicators */}
              <div className="space-y-3 mb-6">
                {simulationResult.changes.allocationShifts
                  .filter((a) => a.current > 0 || a.hypothetical > 0)
                  .map((a) => (
                    <div key={a.category}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">{formatCategory(a.category)}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white">{a.hypothetical.toFixed(1)}%</span>
                          {Math.abs(a.change) >= 0.5 && (
                            <span
                              className={`text-xs ${
                                a.change > 0 ? 'text-emerald-400' : 'text-red-400'
                              }`}
                            >
                              {a.change > 0 ? '+' : ''}
                              {a.change.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${Math.min(100, a.hypothetical)}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>

              {/* Top Positions */}
              <div className="border-t border-white/10 pt-4">
                <p className="text-xs text-gray-500 mb-2">Top Positions</p>
                <div className="space-y-2">
                  {simulationResult.hypotheticalPortfolio.topPositions.slice(0, 3).map((p) => (
                    <div
                      key={p.ticker}
                      className={`flex justify-between text-sm ${
                        p.ticker.toUpperCase() === ticker.toUpperCase()
                          ? 'text-indigo-300'
                          : ''
                      }`}
                    >
                      <span className="text-gray-300">
                        {p.ticker}
                        {p.ticker.toUpperCase() === ticker.toUpperCase() && (
                          <span className="ml-1 text-xs text-indigo-400">★</span>
                        )}
                      </span>
                      <span className="text-white">{p.percent.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Factor Exposure Changes */}
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
            <h4 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              🧬 Factor Exposure Shift
            </h4>

            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {simulationResult.changes.factorShifts.map((f) => (
                <div key={f.factor} className="bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">{formatFactor(f.factor)}</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-gray-400">
                        {f.current.toFixed(2)} →{' '}
                        <span className="text-white font-medium">{f.hypothetical.toFixed(2)}</span>
                      </p>
                    </div>
                    {Math.abs(f.change) >= 0.05 && (
                      <span
                        className={`text-sm font-medium ${
                          f.change > 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {f.change > 0 ? '+' : ''}
                        {f.change.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {/* Mini bar visualization */}
                  <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
                    {/* Center line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-600" />
                    {/* Current value */}
                    <div
                      className="absolute h-full bg-gray-500 rounded-full"
                      style={{
                        left: '50%',
                        width: `${Math.abs(f.current) * 50}%`,
                        marginLeft: f.current >= 0 ? 0 : `-${Math.abs(f.current) * 50}%`,
                      }}
                    />
                    {/* Hypothetical value */}
                    <div
                      className="absolute h-full bg-indigo-500 rounded-full opacity-60"
                      style={{
                        left: '50%',
                        width: `${Math.abs(f.hypothetical) * 50}%`,
                        marginLeft: f.hypothetical >= 0 ? 0 : `-${Math.abs(f.hypothetical) * 50}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Interpretation */}
            <div className="mt-4 p-4 bg-white/5 rounded-xl">
              <p className="text-sm text-gray-300">
                💡{' '}
                {simulationResult.changes.beta > 0.1 ? (
                  <span>
                    This trade would make your portfolio <span className="text-amber-400">more aggressive</span> 
                    with higher market sensitivity.
                  </span>
                ) : simulationResult.changes.beta < -0.1 ? (
                  <span>
                    This trade would make your portfolio <span className="text-emerald-400">more defensive</span> 
                    with lower market sensitivity.
                  </span>
                ) : (
                  <span>
                    This trade would have <span className="text-gray-400">minimal impact</span> on your 
                    overall portfolio risk profile.
                  </span>
                )}
                {simulationResult.hypotheticalPortfolio.newPositionSize > 15 && (
                  <span className="text-amber-400 ml-2">
                    ⚠️ {ticker.toUpperCase()} would be {simulationResult.hypotheticalPortfolio.newPositionSize.toFixed(0)}% 
                    of your portfolio — consider if this concentration aligns with your goals.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Action Note */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-400">
              📝 This is a simulation only — no trades have been executed.
              Use these insights to make informed decisions.
            </p>
          </div>
        </>
      )}

      {/* Empty State */}
      {!simulationResult && (
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-12 text-center">
          <span className="text-5xl mb-4 block">🧪</span>
          <h4 className="text-lg font-semibold text-white mb-2">Test Before You Trade</h4>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Enter a ticker and quantity above to see how a hypothetical trade would impact your portfolio's 
            allocation, concentration, and risk metrics.
          </p>
        </div>
      )}
    </div>
  );
}
