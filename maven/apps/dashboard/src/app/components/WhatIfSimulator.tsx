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
          {/* Quick Impact Summary */}
          <div
            className={`rounded-2xl p-6 border ${
              tradeType === 'buy'
                ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/30'
                : 'bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30'
            }`}
          >
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              {tradeType === 'buy' ? '📈' : '📉'} Trade Impact Summary
            </h4>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Position Size */}
              <div className="bg-black/20 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">{ticker.toUpperCase()} Would Be</p>
                <p className="text-2xl font-bold text-white">
                  {simulationResult.hypotheticalPortfolio.newPositionSize.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">of portfolio</p>
              </div>

              {/* Concentration Change */}
              <div className="bg-black/20 rounded-xl p-4">
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
              <div className="bg-black/20 rounded-xl p-4">
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
              <div className="bg-black/20 rounded-xl p-4">
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
