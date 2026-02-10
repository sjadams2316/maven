'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

// Demo clients data
const DEMO_CLIENTS = [
  { 
    id: '1', 
    name: 'Robert & Linda Chen', 
    aum: 1250000, 
    holdings: [
      { ticker: 'VTI', name: 'Vanguard Total Stock Market', value: 425000, currentAlloc: 34, targetAlloc: 30, costBasis: 380000, purchaseDate: '2024-03-15' },
      { ticker: 'VXUS', name: 'Vanguard Total International', value: 187500, currentAlloc: 15, targetAlloc: 20, costBasis: 195000, purchaseDate: '2024-03-15' },
      { ticker: 'BND', name: 'Vanguard Total Bond', value: 250000, currentAlloc: 20, targetAlloc: 20, costBasis: 245000, purchaseDate: '2024-03-15' },
      { ticker: 'AAPL', name: 'Apple Inc', value: 156250, currentAlloc: 12.5, targetAlloc: 10, costBasis: 120000, purchaseDate: '2024-06-01' },
      { ticker: 'MSFT', name: 'Microsoft Corp', value: 125000, currentAlloc: 10, targetAlloc: 10, costBasis: 100000, purchaseDate: '2024-06-01' },
      { ticker: 'Cash', name: 'Cash & Equivalents', value: 106250, currentAlloc: 8.5, targetAlloc: 10, costBasis: 106250, purchaseDate: '2024-01-01' },
    ]
  },
  { 
    id: '2', 
    name: 'The Morrison Family Trust', 
    aum: 890000,
    holdings: [
      { ticker: 'VTI', name: 'Vanguard Total Stock Market', value: 356000, currentAlloc: 40, targetAlloc: 35, costBasis: 320000, purchaseDate: '2023-12-01' },
      { ticker: 'BND', name: 'Vanguard Total Bond', value: 267000, currentAlloc: 30, targetAlloc: 35, costBasis: 260000, purchaseDate: '2023-12-01' },
      { ticker: 'VNQ', name: 'Vanguard Real Estate', value: 178000, currentAlloc: 20, targetAlloc: 20, costBasis: 165000, purchaseDate: '2024-02-15' },
      { ticker: 'Cash', name: 'Cash & Equivalents', value: 89000, currentAlloc: 10, targetAlloc: 10, costBasis: 89000, purchaseDate: '2024-01-01' },
    ]
  },
  { 
    id: '3', 
    name: 'Jennifer Walsh', 
    aum: 675000,
    holdings: [
      { ticker: 'VOO', name: 'Vanguard S&P 500', value: 337500, currentAlloc: 50, targetAlloc: 45, costBasis: 300000, purchaseDate: '2024-01-15' },
      { ticker: 'VXUS', name: 'Vanguard Total International', value: 135000, currentAlloc: 20, targetAlloc: 20, costBasis: 140000, purchaseDate: '2024-01-15' },
      { ticker: 'BND', name: 'Vanguard Total Bond', value: 135000, currentAlloc: 20, targetAlloc: 25, costBasis: 132000, purchaseDate: '2024-01-15' },
      { ticker: 'Cash', name: 'Cash & Equivalents', value: 67500, currentAlloc: 10, targetAlloc: 10, costBasis: 67500, purchaseDate: '2024-01-01' },
    ]
  },
];

// Model portfolios
const MODEL_PORTFOLIOS = {
  conservative: {
    name: 'Conservative',
    description: 'Lower risk, income-focused',
    allocations: { 'US Equity': 20, 'Intl Equity': 10, 'Bonds': 50, 'Real Estate': 5, 'Cash': 15 }
  },
  moderate: {
    name: 'Moderate',
    description: 'Balanced growth and income',
    allocations: { 'US Equity': 35, 'Intl Equity': 15, 'Bonds': 35, 'Real Estate': 5, 'Cash': 10 }
  },
  aggressive: {
    name: 'Aggressive',
    description: 'Growth-focused, higher risk',
    allocations: { 'US Equity': 50, 'Intl Equity': 25, 'Bonds': 15, 'Real Estate': 5, 'Cash': 5 }
  },
  custom: {
    name: 'Custom',
    description: 'Define your own allocation',
    allocations: {}
  }
};

// Rebalancing history
const REBALANCING_HISTORY = [
  { id: '1', clientId: '1', clientName: 'Robert & Linda Chen', date: '2026-01-15', trades: 4, value: 45000, status: 'completed', reviewedBy: 'Jane Smith' },
  { id: '2', clientId: '2', clientName: 'The Morrison Family Trust', date: '2026-01-10', trades: 3, value: 28000, status: 'completed', reviewedBy: 'Jane Smith' },
  { id: '3', clientId: '1', clientName: 'Robert & Linda Chen', date: '2025-10-15', trades: 5, value: 62000, status: 'completed', reviewedBy: 'Jane Smith' },
  { id: '4', clientId: '3', clientName: 'Jennifer Walsh', date: '2025-10-01', trades: 2, value: 15000, status: 'completed', reviewedBy: 'Jane Smith' },
];

interface Trade {
  ticker: string;
  name: string;
  action: 'BUY' | 'SELL';
  shares: number;
  dollarAmount: number;
  taxImpact: number;
  washSaleWarning: boolean;
  shortTermGain: boolean;
}

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toLocaleString()}`;
}

function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export default function RebalancePage() {
  const [selectedClients, setSelectedClients] = useState<string[]>(['1']);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [driftThreshold, setDriftThreshold] = useState(5);
  const [taxAware, setTaxAware] = useState(true);
  const [useCashFlow, setUseCashFlow] = useState(false);
  const [showTradePreview, setShowTradePreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [reviewedTrades, setReviewedTrades] = useState<Set<string>>(new Set());

  // Filter clients by search
  const filteredClients = DEMO_CLIENTS.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected client data (use first selected for single view)
  const primaryClient = DEMO_CLIENTS.find(c => c.id === selectedClients[0]);

  // Calculate trades needed
  const suggestedTrades = useMemo(() => {
    if (!primaryClient) return [];

    const trades: Trade[] = [];
    const totalValue = primaryClient.aum;

    primaryClient.holdings.forEach(holding => {
      const drift = holding.currentAlloc - holding.targetAlloc;
      
      // Only trade if drift exceeds threshold
      if (Math.abs(drift) < driftThreshold) return;

      const targetValue = (holding.targetAlloc / 100) * totalValue;
      const currentValue = holding.value;
      const dollarDiff = currentValue - targetValue;
      
      // Estimate price per share (simplified)
      const pricePerShare = holding.ticker === 'Cash' ? 1 : 
        holding.ticker === 'VTI' ? 250 :
        holding.ticker === 'VXUS' ? 60 :
        holding.ticker === 'BND' ? 75 :
        holding.ticker === 'AAPL' ? 180 :
        holding.ticker === 'MSFT' ? 420 :
        holding.ticker === 'VOO' ? 500 :
        holding.ticker === 'VNQ' ? 90 : 100;

      const shares = Math.abs(Math.round(dollarDiff / pricePerShare));
      
      // Calculate tax impact
      const gain = holding.value - holding.costBasis;
      const taxRate = 0.15; // Long-term cap gains
      const taxImpact = dollarDiff > 0 && gain > 0 ? Math.min(gain, dollarDiff) * taxRate : 0;
      
      // Check for wash sale (sold within 30 days)
      const purchaseDate = new Date(holding.purchaseDate);
      const daysSincePurchase = Math.floor((Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
      const washSaleWarning = dollarDiff > 0 && daysSincePurchase < 30 && gain < 0;
      
      // Short-term gain warning
      const shortTermGain = dollarDiff > 0 && daysSincePurchase < 365 && gain > 0;

      if (holding.ticker !== 'Cash' && shares > 0) {
        trades.push({
          ticker: holding.ticker,
          name: holding.name,
          action: dollarDiff > 0 ? 'SELL' : 'BUY',
          shares,
          dollarAmount: Math.abs(dollarDiff),
          taxImpact: taxAware ? taxImpact : 0,
          washSaleWarning,
          shortTermGain
        });
      }
    });

    return trades;
  }, [primaryClient, driftThreshold, taxAware]);

  const totalTaxImpact = suggestedTrades.reduce((sum, t) => sum + t.taxImpact, 0);
  const totalTradeValue = suggestedTrades.reduce((sum, t) => sum + t.dollarAmount, 0);

  const toggleClientSelection = (clientId: string) => {
    setSelectedClients(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const exportToCsv = () => {
    const headers = ['Action', 'Ticker', 'Name', 'Shares', 'Dollar Amount', 'Tax Impact', 'Warnings'];
    const rows = suggestedTrades.map(t => [
      t.action,
      t.ticker,
      t.name,
      t.shares.toString(),
      t.dollarAmount.toFixed(2),
      t.taxImpact.toFixed(2),
      [t.washSaleWarning ? 'Wash Sale' : '', t.shortTermGain ? 'Short-Term Gain' : ''].filter(Boolean).join(', ')
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rebalance-trades-${primaryClient?.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const markAllReviewed = () => {
    const allIds = new Set(suggestedTrades.map(t => t.ticker));
    setReviewedTrades(allIds);
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Rebalancing Tool</h1>
          <p className="text-gray-400 text-sm md:text-base">
            Manage portfolio drift and generate trades
          </p>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[48px]"
        >
          <span>📜</span>
          <span>History</span>
        </button>
      </div>

      {/* History Panel */}
      {showHistory && (
        <div className="mb-6 md:mb-8 bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-white">Rebalancing History</h2>
            <button
              onClick={() => setShowHistory(false)}
              className="text-gray-400 hover:text-white min-w-[48px] min-h-[48px] flex items-center justify-center"
            >
              ✕
            </button>
          </div>
          
          {/* Mobile: Card layout */}
          <div className="md:hidden space-y-3">
            {REBALANCING_HISTORY.map(event => (
              <div key={event.id} className="p-4 bg-white/5 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{event.clientName}</span>
                  <span className="text-emerald-400 text-xs px-2 py-1 bg-emerald-500/20 rounded">
                    {event.status}
                  </span>
                </div>
                <div className="text-gray-400 text-sm mb-2">{event.date}</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{event.trades} trades • {formatCurrency(event.value)}</span>
                  <span className="text-gray-500 text-xs">by {event.reviewedBy}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Table layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 text-sm border-b border-white/10">
                  <th className="pb-3 font-medium">Client</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium text-right">Trades</th>
                  <th className="pb-3 font-medium text-right">Value</th>
                  <th className="pb-3 font-medium text-center">Status</th>
                  <th className="pb-3 font-medium">Reviewed By</th>
                </tr>
              </thead>
              <tbody>
                {REBALANCING_HISTORY.map(event => (
                  <tr key={event.id} className="border-b border-white/5">
                    <td className="py-3 text-white">{event.clientName}</td>
                    <td className="py-3 text-gray-400">{event.date}</td>
                    <td className="py-3 text-right text-gray-400">{event.trades}</td>
                    <td className="py-3 text-right text-white">{formatCurrency(event.value)}</td>
                    <td className="py-3 text-center">
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs">
                        {event.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">{event.reviewedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left Column: Client Selection & Options */}
        <div className="space-y-6">
          {/* Client Selector */}
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Select Client(s)</h2>
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 mb-4 min-h-[48px]"
            />
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {filteredClients.map(client => (
                <button
                  key={client.id}
                  onClick={() => toggleClientSelection(client.id)}
                  className={`w-full p-3 rounded-xl text-left transition-colors min-h-[64px] flex items-center gap-3 ${
                    selectedClients.includes(client.id)
                      ? 'bg-amber-500/20 border border-amber-500/30'
                      : 'bg-white/5 border border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                    selectedClients.includes(client.id)
                      ? 'bg-amber-600 border-amber-600'
                      : 'border-gray-500'
                  }`}>
                    {selectedClients.includes(client.id) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{client.name}</div>
                    <div className="text-gray-400 text-sm">{formatCurrency(client.aum)}</div>
                  </div>
                </button>
              ))}
            </div>
            {selectedClients.length > 1 && (
              <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <div className="text-amber-400 text-sm flex items-center gap-2">
                  <span>⚠️</span>
                  <span>Batch rebalancing: {selectedClients.length} clients selected</span>
                </div>
              </div>
            )}
          </div>

          {/* Model Portfolios */}
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Model Portfolios</h2>
            <div className="space-y-2">
              {Object.entries(MODEL_PORTFOLIOS).map(([key, model]) => (
                <button
                  key={key}
                  onClick={() => setSelectedModel(selectedModel === key ? null : key)}
                  className={`w-full p-3 rounded-xl text-left transition-colors min-h-[56px] ${
                    selectedModel === key
                      ? 'bg-amber-500/20 border border-amber-500/30'
                      : 'bg-white/5 border border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="text-white font-medium">{model.name}</div>
                  <div className="text-gray-400 text-sm">{model.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Rebalancing Options */}
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Options</h2>
            
            {/* Drift Threshold */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">
                Drift Threshold: {driftThreshold}%
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={driftThreshold}
                onChange={(e) => setDriftThreshold(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1%</span>
                <span>10%</span>
              </div>
            </div>

            {/* Tax-Aware Toggle */}
            <div
              onClick={() => setTaxAware(!taxAware)}
              className="flex items-center justify-between p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors min-h-[56px] mb-3"
            >
              <div>
                <div className="text-white font-medium">Tax-Aware</div>
                <div className="text-gray-400 text-sm">Minimize taxable events</div>
              </div>
              <div className={`w-12 h-7 rounded-full p-1 transition-colors ${
                taxAware ? 'bg-amber-600' : 'bg-white/20'
              }`}>
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  taxAware ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
            </div>

            {/* Cash-Flow Rebalancing Toggle */}
            <div
              onClick={() => setUseCashFlow(!useCashFlow)}
              className="flex items-center justify-between p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors min-h-[56px]"
            >
              <div>
                <div className="text-white font-medium">Cash-Flow Rebalancing</div>
                <div className="text-gray-400 text-sm">Use new deposits first</div>
              </div>
              <div className={`w-12 h-7 rounded-full p-1 transition-colors ${
                useCashFlow ? 'bg-amber-600' : 'bg-white/20'
              }`}>
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  useCashFlow ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Allocation View & Trades */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current vs Target Allocation */}
          {primaryClient && (
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <h2 className="text-lg font-semibold text-white">
                  Allocation: {primaryClient.name}
                </h2>
                <div className="text-gray-400 text-sm">
                  Total: {formatCurrency(primaryClient.aum)}
                </div>
              </div>

              <div className="space-y-4">
                {primaryClient.holdings.map(holding => {
                  const drift = holding.currentAlloc - holding.targetAlloc;
                  const isOutsideTolerance = Math.abs(drift) >= driftThreshold;

                  return (
                    <div key={holding.ticker} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{holding.ticker}</span>
                          {isOutsideTolerance && (
                            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs">
                              {formatPercent(drift)} drift
                            </span>
                          )}
                        </div>
                        <div className="text-gray-400 text-sm">
                          {formatCurrency(holding.value)}
                        </div>
                      </div>
                      
                      {/* Allocation Bars */}
                      <div className="relative h-8 bg-white/5 rounded-lg overflow-hidden">
                        {/* Current Allocation Bar */}
                        <div
                          className={`absolute top-0 left-0 h-4 rounded-t transition-all ${
                            isOutsideTolerance ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(holding.currentAlloc, 100)}%` }}
                        />
                        {/* Target Allocation Bar */}
                        <div
                          className="absolute bottom-0 left-0 h-4 bg-white/20 rounded-b"
                          style={{ width: `${Math.min(holding.targetAlloc, 100)}%` }}
                        />
                        {/* Target Marker */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-white"
                          style={{ left: `${holding.targetAlloc}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-xs">
                        <span className={isOutsideTolerance ? 'text-amber-400' : 'text-emerald-400'}>
                          Current: {holding.currentAlloc}%
                        </span>
                        <span className="text-gray-400">
                          Target: {holding.targetAlloc}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-white/10 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded" />
                  <span className="text-gray-400">Within tolerance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded" />
                  <span className="text-gray-400">Outside tolerance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-white/20 rounded" />
                  <span className="text-gray-400">Target</span>
                </div>
              </div>
            </div>
          )}

          {/* Suggested Trades */}
          {primaryClient && (
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white">Suggested Trades</h2>
                  <p className="text-gray-400 text-sm">
                    {suggestedTrades.length} trades • {formatCurrency(totalTradeValue)} total
                  </p>
                </div>
                <button
                  onClick={() => setShowTradePreview(true)}
                  disabled={suggestedTrades.length === 0}
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors min-h-[48px] flex items-center justify-center gap-2"
                >
                  <span>👁️</span>
                  <span>Preview Trades</span>
                </button>
              </div>

              {suggestedTrades.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-3">✓</div>
                  <div>Portfolio is within tolerance</div>
                  <div className="text-sm">No trades needed</div>
                </div>
              ) : (
                <>
                  {/* Mobile: Card layout */}
                  <div className="md:hidden space-y-3">
                    {suggestedTrades.map(trade => (
                      <div
                        key={trade.ticker}
                        className={`p-4 rounded-xl border ${
                          reviewedTrades.has(trade.ticker)
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              trade.action === 'BUY'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {trade.action}
                            </span>
                            <span className="text-white font-medium">{trade.ticker}</span>
                          </div>
                          {reviewedTrades.has(trade.ticker) && (
                            <span className="text-emerald-400 text-xs">✓ Reviewed</span>
                          )}
                        </div>
                        <div className="text-gray-400 text-sm mb-2">{trade.name}</div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-400">{trade.shares} shares</span>
                          <span className="text-white font-medium">{formatCurrency(trade.dollarAmount)}</span>
                        </div>
                        {trade.taxImpact > 0 && (
                          <div className="text-amber-400 text-xs">
                            Est. tax: {formatCurrency(trade.taxImpact)}
                          </div>
                        )}
                        {trade.washSaleWarning && (
                          <div className="mt-2 px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs flex items-center gap-1">
                            <span>⚠️</span>
                            <span>Wash Sale Warning</span>
                          </div>
                        )}
                        {trade.shortTermGain && (
                          <div className="mt-2 px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-xs flex items-center gap-1">
                            <span>⚠️</span>
                            <span>Short-Term Gain</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Desktop: Table layout */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-gray-500 text-sm border-b border-white/10">
                          <th className="pb-3 font-medium">Action</th>
                          <th className="pb-3 font-medium">Ticker</th>
                          <th className="pb-3 font-medium">Name</th>
                          <th className="pb-3 font-medium text-right">Shares</th>
                          <th className="pb-3 font-medium text-right">Amount</th>
                          <th className="pb-3 font-medium text-right">Tax Impact</th>
                          <th className="pb-3 font-medium text-center">Warnings</th>
                          <th className="pb-3 font-medium text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {suggestedTrades.map(trade => (
                          <tr
                            key={trade.ticker}
                            className={`border-b border-white/5 ${
                              reviewedTrades.has(trade.ticker) ? 'bg-emerald-500/5' : ''
                            }`}
                          >
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                trade.action === 'BUY'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {trade.action}
                              </span>
                            </td>
                            <td className="py-3 text-white font-medium">{trade.ticker}</td>
                            <td className="py-3 text-gray-400">{trade.name}</td>
                            <td className="py-3 text-right text-white">{trade.shares}</td>
                            <td className="py-3 text-right text-white">{formatCurrency(trade.dollarAmount)}</td>
                            <td className="py-3 text-right text-amber-400">
                              {trade.taxImpact > 0 ? formatCurrency(trade.taxImpact) : '—'}
                            </td>
                            <td className="py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                {trade.washSaleWarning && (
                                  <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs" title="Wash Sale Warning">
                                    WS
                                  </span>
                                )}
                                {trade.shortTermGain && (
                                  <span className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-xs" title="Short-Term Gain">
                                    ST
                                  </span>
                                )}
                                {!trade.washSaleWarning && !trade.shortTermGain && '—'}
                              </div>
                            </td>
                            <td className="py-3 text-center">
                              {reviewedTrades.has(trade.ticker) ? (
                                <span className="text-emerald-400">✓</span>
                              ) : (
                                <button
                                  onClick={() => setReviewedTrades(prev => new Set([...prev, trade.ticker]))}
                                  className="text-gray-500 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                                >
                                  ○
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Tax Summary */}
                  {totalTaxImpact > 0 && (
                    <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-amber-400 text-xl">💰</span>
                        <div>
                          <div className="text-amber-400 font-medium">
                            Estimated Tax Impact: {formatCurrency(totalTaxImpact)}
                          </div>
                          <div className="text-amber-400/70 text-sm">
                            Consider tax-loss harvesting opportunities to offset gains
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {primaryClient && suggestedTrades.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={exportToCsv}
                className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors min-h-[48px] flex items-center justify-center gap-2"
              >
                <span>📥</span>
                <span>Generate Trade File (CSV)</span>
              </button>
              <button
                onClick={markAllReviewed}
                disabled={reviewedTrades.size === suggestedTrades.length}
                className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors min-h-[48px] flex items-center justify-center gap-2"
              >
                <span>✓</span>
                <span>Mark All as Reviewed</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Trade Preview Modal */}
      {showTradePreview && primaryClient && (
        <div className="fixed inset-0 bg-black/80 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
          <div className="bg-[#12121a] border-t md:border border-white/10 rounded-t-2xl md:rounded-2xl p-6 md:p-8 w-full md:max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white">Trade Preview</h2>
                <p className="text-gray-400 text-sm">{primaryClient.name}</p>
              </div>
              <button
                onClick={() => setShowTradePreview(false)}
                className="text-gray-400 hover:text-white min-w-[48px] min-h-[48px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className="p-3 bg-white/5 rounded-xl">
                <div className="text-gray-400 text-xs">Total Trades</div>
                <div className="text-white text-xl font-bold">{suggestedTrades.length}</div>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <div className="text-gray-400 text-xs">Trade Value</div>
                <div className="text-white text-xl font-bold">{formatCurrency(totalTradeValue)}</div>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <div className="text-gray-400 text-xs">Est. Tax Impact</div>
                <div className="text-amber-400 text-xl font-bold">{formatCurrency(totalTaxImpact)}</div>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <div className="text-gray-400 text-xs">Reviewed</div>
                <div className={`text-xl font-bold ${
                  reviewedTrades.size === suggestedTrades.length ? 'text-emerald-400' : 'text-gray-400'
                }`}>
                  {reviewedTrades.size}/{suggestedTrades.length}
                </div>
              </div>
            </div>

            {/* Trade List */}
            <div className="space-y-2 mb-6 max-h-[300px] overflow-y-auto">
              {suggestedTrades.map(trade => (
                <div
                  key={trade.ticker}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      trade.action === 'BUY'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {trade.action}
                    </span>
                    <div>
                      <div className="text-white font-medium">{trade.ticker}</div>
                      <div className="text-gray-500 text-xs">{trade.shares} shares</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white">{formatCurrency(trade.dollarAmount)}</div>
                    {trade.taxImpact > 0 && (
                      <div className="text-amber-400 text-xs">Tax: {formatCurrency(trade.taxImpact)}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Warnings */}
            {suggestedTrades.some(t => t.washSaleWarning || t.shortTermGain) && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-6">
                <div className="text-red-400 font-medium mb-2">⚠️ Compliance Warnings</div>
                <ul className="text-red-400/80 text-sm space-y-1">
                  {suggestedTrades.filter(t => t.washSaleWarning).map(t => (
                    <li key={`ws-${t.ticker}`}>• {t.ticker}: Potential wash sale violation</li>
                  ))}
                  {suggestedTrades.filter(t => t.shortTermGain).map(t => (
                    <li key={`st-${t.ticker}`}>• {t.ticker}: Short-term capital gain (higher tax rate)</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button
                onClick={() => setShowTradePreview(false)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors min-h-[48px]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  exportToCsv();
                  setShowTradePreview(false);
                }}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors font-medium min-h-[48px]"
              >
                Export & Execute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
