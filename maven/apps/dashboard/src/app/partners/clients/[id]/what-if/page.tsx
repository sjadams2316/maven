'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Demo client data
const DEMO_CLIENT = {
  id: '1',
  name: 'Robert & Linda Chen',
  aum: 1250000,
  holdings: [
    { ticker: 'VTI', name: 'Vanguard Total Stock Market', value: 425000, allocation: 34, shares: 1520, expenseRatio: 0.03 },
    { ticker: 'VXUS', name: 'Vanguard Total International', value: 187500, allocation: 15, shares: 3125, expenseRatio: 0.07 },
    { ticker: 'BND', name: 'Vanguard Total Bond', value: 250000, allocation: 20, shares: 3205, expenseRatio: 0.03 },
    { ticker: 'AAPL', name: 'Apple Inc', value: 156250, allocation: 12.5, shares: 680, expenseRatio: 0 },
    { ticker: 'MSFT', name: 'Microsoft Corp', value: 125000, allocation: 10, shares: 295, expenseRatio: 0 },
    { ticker: 'Cash', name: 'Cash & Equivalents', value: 106250, allocation: 8.5, shares: 0, expenseRatio: 0 },
  ],
  riskScore: 72,
  expenseRatio: 0.12,
};

// Preset scenarios
const PRESET_SCENARIOS = [
  {
    id: 'reduce-tech',
    name: 'Reduce Tech Exposure',
    description: 'Sell 50% of AAPL & MSFT, add to bonds',
    trades: [
      { type: 'sell' as const, ticker: 'AAPL', amount: 78125, isShares: false },
      { type: 'sell' as const, ticker: 'MSFT', amount: 62500, isShares: false },
      { type: 'buy' as const, ticker: 'BND', amount: 140625, isShares: false },
    ],
  },
  {
    id: 'add-bonds',
    name: 'Increase Bond Allocation',
    description: 'Move cash to bonds for stability',
    trades: [
      { type: 'sell' as const, ticker: 'Cash', amount: 80000, isShares: false },
      { type: 'buy' as const, ticker: 'BND', amount: 80000, isShares: false },
    ],
  },
  {
    id: 'rebalance-60-40',
    name: 'Rebalance to 60/40',
    description: 'Classic 60% stocks, 40% bonds allocation',
    trades: [
      { type: 'sell' as const, ticker: 'VTI', amount: 50000, isShares: false },
      { type: 'sell' as const, ticker: 'AAPL', amount: 81250, isShares: false },
      { type: 'sell' as const, ticker: 'MSFT', amount: 50000, isShares: false },
      { type: 'buy' as const, ticker: 'BND', amount: 181250, isShares: false },
    ],
  },
  {
    id: 'increase-international',
    name: 'Boost International',
    description: 'Increase VXUS allocation to 25%',
    trades: [
      { type: 'sell' as const, ticker: 'VTI', amount: 125000, isShares: false },
      { type: 'buy' as const, ticker: 'VXUS', amount: 125000, isShares: false },
    ],
  },
];

// Available tickers for trading
const AVAILABLE_TICKERS = [
  { ticker: 'VTI', name: 'Vanguard Total Stock Market', price: 279.60 },
  { ticker: 'VXUS', name: 'Vanguard Total International', price: 60.00 },
  { ticker: 'BND', name: 'Vanguard Total Bond', price: 78.00 },
  { ticker: 'AAPL', name: 'Apple Inc', price: 229.78 },
  { ticker: 'MSFT', name: 'Microsoft Corp', price: 423.73 },
  { ticker: 'VOO', name: 'Vanguard S&P 500', price: 540.25 },
  { ticker: 'QQQ', name: 'Invesco QQQ Trust', price: 512.40 },
  { ticker: 'VNQ', name: 'Vanguard Real Estate', price: 88.50 },
  { ticker: 'GLD', name: 'SPDR Gold Trust', price: 245.30 },
  { ticker: 'Cash', name: 'Cash & Equivalents', price: 1.00 },
];

type Trade = {
  id: string;
  type: 'buy' | 'sell';
  ticker: string;
  amount: number;
  isShares: boolean;
};

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toLocaleString()}`;
}

// Pie chart colors
const CHART_COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#6366F1', // indigo
];

export default function WhatIfSimulator() {
  const params = useParams();
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [selectedTicker, setSelectedTicker] = useState('');
  const [amount, setAmount] = useState('');
  const [isShares, setIsShares] = useState(false);
  const [pendingTrades, setPendingTrades] = useState<Trade[]>([]);
  const [showTickerSearch, setShowTickerSearch] = useState(false);
  const [tickerSearch, setTickerSearch] = useState('');

  // Calculate projected holdings after trades
  const projectedHoldings = useMemo(() => {
    const holdings = DEMO_CLIENT.holdings.map(h => ({ ...h }));
    
    for (const trade of pendingTrades) {
      const tickerInfo = AVAILABLE_TICKERS.find(t => t.ticker === trade.ticker);
      const dollarAmount = trade.isShares && tickerInfo 
        ? trade.amount * tickerInfo.price 
        : trade.amount;
      
      const existingIndex = holdings.findIndex(h => h.ticker === trade.ticker);
      
      if (trade.type === 'buy') {
        if (existingIndex >= 0) {
          holdings[existingIndex].value += dollarAmount;
        } else {
          holdings.push({
            ticker: trade.ticker,
            name: tickerInfo?.name || trade.ticker,
            value: dollarAmount,
            allocation: 0,
            shares: 0,
            expenseRatio: 0,
          });
        }
      } else {
        if (existingIndex >= 0) {
          holdings[existingIndex].value = Math.max(0, holdings[existingIndex].value - dollarAmount);
        }
      }
    }
    
    // Recalculate allocations
    const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
    holdings.forEach(h => {
      h.allocation = totalValue > 0 ? (h.value / totalValue) * 100 : 0;
    });
    
    // Filter out zero holdings
    return holdings.filter(h => h.value > 0);
  }, [pendingTrades]);

  // Calculate impact metrics
  const impactMetrics = useMemo(() => {
    const totalBuys = pendingTrades
      .filter(t => t.type === 'buy')
      .reduce((sum, t) => {
        const tickerInfo = AVAILABLE_TICKERS.find(ti => ti.ticker === t.ticker);
        return sum + (t.isShares && tickerInfo ? t.amount * tickerInfo.price : t.amount);
      }, 0);
    
    const totalSells = pendingTrades
      .filter(t => t.type === 'sell')
      .reduce((sum, t) => {
        const tickerInfo = AVAILABLE_TICKERS.find(ti => ti.ticker === t.ticker);
        return sum + (t.isShares && tickerInfo ? t.amount * tickerInfo.price : t.amount);
      }, 0);
    
    const newAum = DEMO_CLIENT.aum + totalBuys - totalSells;
    
    // Estimate new risk score (simplified)
    const stockAllocation = projectedHoldings
      .filter(h => !['BND', 'Cash'].includes(h.ticker))
      .reduce((sum, h) => sum + h.allocation, 0);
    const newRiskScore = Math.round(stockAllocation * 1.1);
    
    // Calculate weighted expense ratio
    const weightedExpense = projectedHoldings.reduce((sum, h) => {
      const original = DEMO_CLIENT.holdings.find(oh => oh.ticker === h.ticker);
      return sum + (h.allocation / 100) * (original?.expenseRatio || 0);
    }, 0);
    
    // Estimate tax implications (simplified - 15% cap gains on sells with gains)
    const taxImplication = totalSells * 0.08; // Rough estimate
    
    return {
      newAum,
      riskScoreChange: newRiskScore - DEMO_CLIENT.riskScore,
      newRiskScore,
      expenseRatioChange: weightedExpense - DEMO_CLIENT.expenseRatio,
      newExpenseRatio: weightedExpense,
      taxImplication,
      netCashFlow: totalSells - totalBuys,
    };
  }, [pendingTrades, projectedHoldings]);

  const addTrade = () => {
    if (!selectedTicker || !amount || parseFloat(amount) <= 0) return;
    
    const newTrade: Trade = {
      id: Date.now().toString(),
      type: tradeType,
      ticker: selectedTicker,
      amount: parseFloat(amount),
      isShares,
    };
    
    setPendingTrades(prev => [...prev, newTrade]);
    setSelectedTicker('');
    setAmount('');
    setShowTickerSearch(false);
    setTickerSearch('');
  };

  const removeTrade = (id: string) => {
    setPendingTrades(prev => prev.filter(t => t.id !== id));
  };

  const clearAllTrades = () => {
    setPendingTrades([]);
  };

  const applyPreset = (presetId: string) => {
    const preset = PRESET_SCENARIOS.find(p => p.id === presetId);
    if (!preset) return;
    
    const newTrades: Trade[] = preset.trades.map((t, idx) => ({
      id: `preset-${Date.now()}-${idx}`,
      type: t.type,
      ticker: t.ticker,
      amount: t.amount,
      isShares: t.isShares,
    }));
    
    setPendingTrades(newTrades);
  };

  const filteredTickers = AVAILABLE_TICKERS.filter(t =>
    t.ticker.toLowerCase().includes(tickerSearch.toLowerCase()) ||
    t.name.toLowerCase().includes(tickerSearch.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-4 md:mb-6 flex-wrap">
        <Link href="/partners/clients" className="text-gray-400 hover:text-white min-h-[48px] md:min-h-0 flex items-center">
          Clients
        </Link>
        <span className="text-gray-600">/</span>
        <Link href={`/partners/clients/${params.id}`} className="text-gray-400 hover:text-white min-h-[48px] md:min-h-0 flex items-center">
          {DEMO_CLIENT.name}
        </Link>
        <span className="text-gray-600">/</span>
        <span className="text-amber-500">What-If Simulator</span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">🎯 What-If Simulator</h1>
          <p className="text-gray-400">
            Model portfolio changes for <span className="text-amber-400">{DEMO_CLIENT.name}</span> • 
            Current AUM: <span className="text-white font-medium">{formatCurrency(DEMO_CLIENT.aum)}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <button
            onClick={clearAllTrades}
            disabled={pendingTrades.length === 0}
            className="flex-1 sm:flex-none px-4 py-3 md:py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors min-h-[48px] text-sm md:text-base"
          >
            Clear All
          </button>
          <button 
            disabled={pendingTrades.length === 0}
            className="flex-1 sm:flex-none px-4 py-3 md:py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-medium min-h-[48px] text-sm md:text-base"
          >
            Apply Changes
          </button>
          <button 
            disabled={pendingTrades.length === 0}
            className="w-full sm:w-auto px-4 py-3 md:py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors min-h-[48px] text-sm md:text-base"
          >
            Share with Client
          </button>
        </div>
      </div>

      {/* Preset Scenarios */}
      <div className="mb-6">
        <div className="text-gray-400 text-sm mb-3">Quick Scenarios</div>
        <div className="flex flex-wrap gap-2">
          {PRESET_SCENARIOS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/30 text-white rounded-xl transition-all min-h-[48px] text-sm"
            >
              <div className="font-medium">{preset.name}</div>
              <div className="text-gray-500 text-xs hidden sm:block">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content - Two Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Left Panel: Current Portfolio + Trade Builder */}
        <div className="space-y-4 md:space-y-6">
          {/* Current Portfolio Summary */}
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Current Portfolio</h2>
            <div className="space-y-3">
              {DEMO_CLIENT.holdings.map((holding, idx) => (
                <div key={holding.ticker} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                    />
                    <div>
                      <div className="text-white font-medium">{holding.ticker}</div>
                      <div className="text-gray-500 text-xs hidden sm:block">{holding.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white">{formatCurrency(holding.value)}</div>
                    <div className="text-gray-400 text-xs">{holding.allocation.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trade Builder */}
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Add Trade</h2>
            
            {/* Buy/Sell Toggle */}
            <div className="flex items-center gap-2 mb-4 bg-white/5 rounded-xl p-1">
              <button
                onClick={() => setTradeType('buy')}
                className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors min-h-[48px] ${
                  tradeType === 'buy'
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setTradeType('sell')}
                className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors min-h-[48px] ${
                  tradeType === 'sell'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Sell
              </button>
            </div>

            {/* Ticker Search */}
            <div className="relative mb-4">
              <label className="text-gray-400 text-sm mb-2 block">Ticker</label>
              <input
                type="text"
                value={selectedTicker || tickerSearch}
                onChange={(e) => {
                  setTickerSearch(e.target.value);
                  setSelectedTicker('');
                  setShowTickerSearch(true);
                }}
                onFocus={() => setShowTickerSearch(true)}
                placeholder="Search ticker..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 min-h-[48px]"
              />
              {showTickerSearch && tickerSearch && (
                <div className="absolute z-10 w-full mt-1 bg-[#1a1a24] border border-white/10 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                  {filteredTickers.map((ticker) => (
                    <button
                      key={ticker.ticker}
                      onClick={() => {
                        setSelectedTicker(ticker.ticker);
                        setTickerSearch('');
                        setShowTickerSearch(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors min-h-[48px] flex items-center justify-between"
                    >
                      <div>
                        <span className="text-white font-medium">{ticker.ticker}</span>
                        <span className="text-gray-500 text-sm ml-2">{ticker.name}</span>
                      </div>
                      <span className="text-gray-400 text-sm">${ticker.price}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Amount Input */}
            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-2 block">Amount</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    {isShares ? '#' : '$'}
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={isShares ? 'Shares' : 'Dollars'}
                    className="w-full pl-8 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                  />
                </div>
                <button
                  onClick={() => setIsShares(!isShares)}
                  className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors min-h-[48px] text-sm whitespace-nowrap"
                >
                  {isShares ? 'Shares' : 'Dollars'}
                </button>
              </div>
            </div>

            {/* Add Trade Button */}
            <button
              onClick={addTrade}
              disabled={!selectedTicker || !amount}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-medium min-h-[48px]"
            >
              Add to Queue
            </button>
          </div>

          {/* Pending Trades Queue */}
          {pendingTrades.length > 0 && (
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">
                  Pending Trades ({pendingTrades.length})
                </h2>
                <button
                  onClick={clearAllTrades}
                  className="text-gray-400 hover:text-red-400 text-sm min-h-[48px] px-2 flex items-center"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-2">
                {pendingTrades.map((trade) => {
                  const tickerInfo = AVAILABLE_TICKERS.find(t => t.ticker === trade.ticker);
                  const dollarValue = trade.isShares && tickerInfo 
                    ? trade.amount * tickerInfo.price 
                    : trade.amount;
                  
                  return (
                    <div
                      key={trade.id}
                      className={`flex items-center justify-between p-3 rounded-xl border ${
                        trade.type === 'buy'
                          ? 'bg-emerald-500/10 border-emerald-500/20'
                          : 'bg-red-500/10 border-red-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          trade.type === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {trade.type.toUpperCase()}
                        </span>
                        <span className="text-white font-medium">{trade.ticker}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-white">
                          {trade.isShares ? `${trade.amount} shares` : formatCurrency(trade.amount)}
                          {trade.isShares && <span className="text-gray-500 text-xs ml-1">({formatCurrency(dollarValue)})</span>}
                        </span>
                        <button
                          onClick={() => removeTrade(trade.id)}
                          className="text-gray-400 hover:text-red-400 min-w-[48px] min-h-[48px] flex items-center justify-center"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Impact Analysis */}
        <div className="space-y-4 md:space-y-6">
          {/* Impact Summary */}
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Impact Analysis</h2>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white/5 rounded-xl p-3 md:p-4">
                <div className="text-gray-400 text-xs md:text-sm">Risk Score</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl md:text-2xl font-bold text-white">{impactMetrics.newRiskScore}</span>
                  {impactMetrics.riskScoreChange !== 0 && (
                    <span className={`text-sm ${impactMetrics.riskScoreChange > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {impactMetrics.riskScoreChange > 0 ? '+' : ''}{impactMetrics.riskScoreChange}
                    </span>
                  )}
                </div>
                <div className="text-gray-500 text-xs">
                  {impactMetrics.newRiskScore < 50 ? 'Conservative' : impactMetrics.newRiskScore < 70 ? 'Moderate' : 'Aggressive'}
                </div>
              </div>
              
              <div className="bg-white/5 rounded-xl p-3 md:p-4">
                <div className="text-gray-400 text-xs md:text-sm">Expense Ratio</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl md:text-2xl font-bold text-white">{impactMetrics.newExpenseRatio.toFixed(2)}%</span>
                  {impactMetrics.expenseRatioChange !== 0 && (
                    <span className={`text-sm ${impactMetrics.expenseRatioChange > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {impactMetrics.expenseRatioChange > 0 ? '+' : ''}{impactMetrics.expenseRatioChange.toFixed(2)}%
                    </span>
                  )}
                </div>
                <div className="text-gray-500 text-xs">${Math.round(impactMetrics.newExpenseRatio * impactMetrics.newAum / 100)}/year</div>
              </div>
              
              <div className="bg-white/5 rounded-xl p-3 md:p-4">
                <div className="text-gray-400 text-xs md:text-sm">Est. Tax Impact</div>
                <div className="text-xl md:text-2xl font-bold text-amber-400">
                  {pendingTrades.length > 0 ? formatCurrency(impactMetrics.taxImplication) : '$0'}
                </div>
                <div className="text-gray-500 text-xs">Cap gains estimate</div>
              </div>
              
              <div className="bg-white/5 rounded-xl p-3 md:p-4">
                <div className="text-gray-400 text-xs md:text-sm">Net Cash Flow</div>
                <div className={`text-xl md:text-2xl font-bold ${
                  impactMetrics.netCashFlow > 0 ? 'text-emerald-400' : impactMetrics.netCashFlow < 0 ? 'text-red-400' : 'text-white'
                }`}>
                  {impactMetrics.netCashFlow >= 0 ? '+' : ''}{formatCurrency(impactMetrics.netCashFlow)}
                </div>
                <div className="text-gray-500 text-xs">Sells minus buys</div>
              </div>
            </div>

            {/* Tax Warning */}
            {impactMetrics.taxImplication > 5000 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4">
                <div className="flex items-start gap-3">
                  <span className="text-amber-500">⚠️</span>
                  <div>
                    <div className="text-white text-sm font-medium">Tax Consideration</div>
                    <div className="text-gray-400 text-xs">These trades may trigger ~{formatCurrency(impactMetrics.taxImplication)} in capital gains taxes. Consider tax-loss harvesting opportunities.</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* New Allocation Visualization */}
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Projected Allocation</h2>
            
            {/* Simple Pie Chart */}
            <div className="flex flex-col md:flex-row items-center gap-6 mb-4">
              <div className="relative w-40 h-40 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {(() => {
                    let currentAngle = 0;
                    return projectedHoldings.map((holding, idx) => {
                      const angle = (holding.allocation / 100) * 360;
                      const startAngle = currentAngle;
                      currentAngle += angle;
                      
                      const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                      const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                      const x2 = 50 + 40 * Math.cos(((startAngle + angle) * Math.PI) / 180);
                      const y2 = 50 + 40 * Math.sin(((startAngle + angle) * Math.PI) / 180);
                      const largeArc = angle > 180 ? 1 : 0;
                      
                      return (
                        <path
                          key={holding.ticker}
                          d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          fill={CHART_COLORS[idx % CHART_COLORS.length]}
                          stroke="#12121a"
                          strokeWidth="1"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-white font-bold text-lg">{formatCurrency(impactMetrics.newAum)}</div>
                    <div className="text-gray-500 text-xs">Total</div>
                  </div>
                </div>
              </div>
              
              {/* Legend */}
              <div className="flex-1 space-y-2 w-full">
                {projectedHoldings.map((holding, idx) => {
                  const original = DEMO_CLIENT.holdings.find(h => h.ticker === holding.ticker);
                  const change = original ? holding.allocation - original.allocation : holding.allocation;
                  
                  return (
                    <div key={holding.ticker} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                        />
                        <span className="text-white text-sm">{holding.ticker}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">{holding.allocation.toFixed(1)}%</span>
                        {Math.abs(change) > 0.1 && (
                          <span className={`text-xs ${change > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {change > 0 ? '+' : ''}{change.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Before/After Comparison */}
          {pendingTrades.length > 0 && (
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Before → After</h2>
              <div className="space-y-3">
                {projectedHoldings.map((holding) => {
                  const original = DEMO_CLIENT.holdings.find(h => h.ticker === holding.ticker);
                  const originalAlloc = original?.allocation || 0;
                  const change = holding.allocation - originalAlloc;
                  
                  return (
                    <div key={holding.ticker} className="flex items-center gap-4">
                      <span className="text-white font-medium w-12">{holding.ticker}</span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gray-500 rounded-full transition-all"
                            style={{ width: `${originalAlloc}%` }}
                          />
                        </div>
                        <span className="text-gray-500 text-xs w-12 text-right">{originalAlloc.toFixed(1)}%</span>
                      </div>
                      <span className="text-gray-600">→</span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${change > 0 ? 'bg-emerald-500' : change < 0 ? 'bg-red-500' : 'bg-amber-500'}`}
                            style={{ width: `${holding.allocation}%` }}
                          />
                        </div>
                        <span className="text-white text-xs w-12 text-right">{holding.allocation.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {pendingTrades.length === 0 && (
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-white font-medium mb-2">Ready to Model Changes</h3>
              <p className="text-gray-400 text-sm">
                Add trades or select a preset scenario to see how changes would impact the portfolio.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
