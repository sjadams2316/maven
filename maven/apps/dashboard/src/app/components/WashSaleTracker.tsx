"use client";

import { useMemo, useState } from "react";
import { 
  WashSaleWindow, 
  WashSaleAnalysis,
  SafeSwapSuggestion,
  analyzeWashSales,
  getSafeSwapAlternatives,
  createWashSaleTimeline,
  getSubstantiallyIdenticalTickers,
  WashSaleTransaction,
  SUBSTANTIALLY_IDENTICAL_GROUPS,
} from "@/lib/portfolio-utils";
import { Holding } from "@/providers/UserProvider";

interface WashSaleTrackerProps {
  // Current holdings with cost basis
  holdings: (Holding & { 
    accountName?: string; 
    accountType?: string;
    acquisitionDate?: string;
  })[];
  // Recent transactions (optional - for more accurate tracking)
  transactions?: WashSaleTransaction[];
  // Current date for testing (defaults to now)
  currentDate?: Date;
}

/**
 * WashSaleTracker Component
 * 
 * Displays:
 * - Active wash sale windows and their status
 * - Timeline visualization
 * - Substantially identical securities warnings
 * - Safe swap alternatives
 */
export function WashSaleTracker({ holdings, transactions = [], currentDate }: WashSaleTrackerProps) {
  const [expandedTicker, setExpandedTicker] = useState<string | null>(null);
  const [showEducation, setShowEducation] = useState(false);
  
  const now = currentDate || new Date();
  
  // Analyze wash sales from transactions
  const analysis = useMemo(() => {
    if (transactions.length === 0) {
      // If no transactions provided, create simulated ones from holdings with losses
      // This is for demo/preview purposes
      return null;
    }
    return analyzeWashSales(transactions);
  }, [transactions]);
  
  // Find holdings that are at wash sale risk based on being in same groups
  const holdingsAtRisk = useMemo(() => {
    const riskHoldings: {
      ticker: string;
      name: string;
      value: number;
      identicalGroup?: string;
      identicalTickers: string[];
      accounts: string[];
      hasLoss: boolean;
      unrealizedLoss: number;
    }[] = [];
    
    // Group holdings by substantially identical groups
    const byGroup = new Map<string, typeof holdings>();
    
    holdings.forEach(h => {
      const value = h.currentValue || (h.shares * (h.currentPrice || 0));
      const costBasis = h.costBasis || 0;
      const hasLoss = costBasis > 0 && value < costBasis;
      const unrealizedLoss = hasLoss ? costBasis - value : 0;
      
      // Find which group this ticker belongs to
      let groupKey = h.ticker.toUpperCase();
      for (const [key, group] of Object.entries(SUBSTANTIALLY_IDENTICAL_GROUPS)) {
        if (group.tickers.includes(h.ticker.toUpperCase())) {
          groupKey = key;
          break;
        }
      }
      
      if (!byGroup.has(groupKey)) {
        byGroup.set(groupKey, []);
      }
      byGroup.get(groupKey)!.push(h);
    });
    
    // Find groups with potential wash sale risk (multiple holdings or loss positions)
    byGroup.forEach((groupHoldings, groupKey) => {
      const group = SUBSTANTIALLY_IDENTICAL_GROUPS[groupKey];
      
      groupHoldings.forEach(h => {
        const value = h.currentValue || (h.shares * (h.currentPrice || 0));
        const costBasis = h.costBasis || 0;
        const hasLoss = costBasis > 0 && value < costBasis;
        const unrealizedLoss = hasLoss ? costBasis - value : 0;
        
        // Only track if has loss or multiple holdings in same group
        if (hasLoss || (group && groupHoldings.length > 1)) {
          const identicalTickers = group 
            ? group.tickers.filter(t => t !== h.ticker.toUpperCase())
            : [];
          
          riskHoldings.push({
            ticker: h.ticker,
            name: h.name || h.ticker,
            value,
            identicalGroup: group?.name,
            identicalTickers,
            accounts: [h.accountName || 'Unknown'],
            hasLoss,
            unrealizedLoss,
          });
        }
      });
    });
    
    // Sort by unrealized loss descending
    return riskHoldings.sort((a, b) => b.unrealizedLoss - a.unrealizedLoss);
  }, [holdings]);
  
  // Calculate timeline data
  const timeline = useMemo(() => {
    if (!analysis || analysis.activeWindows.length === 0) {
      return null;
    }
    return createWashSaleTimeline(analysis.activeWindows);
  }, [analysis]);
  
  // Get safe alternatives for expanded ticker
  const safeAlternatives = useMemo(() => {
    if (!expandedTicker) return [];
    return getSafeSwapAlternatives(expandedTicker, { maxResults: 5 });
  }, [expandedTicker]);
  
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            🚫 Wash Sale Tracker
            <button
              onClick={() => setShowEducation(!showEducation)}
              className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
            >
              {showEducation ? "Hide Info" : "What's This?"}
            </button>
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Track the 61-day wash sale window to protect your tax deductions
          </p>
        </div>
        
        {/* Summary Stats */}
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-500">At Risk</p>
            <p className="text-lg font-bold text-amber-400">
              {formatCurrency(holdingsAtRisk.filter(h => h.hasLoss).reduce((sum, h) => sum + h.unrealizedLoss, 0))}
            </p>
          </div>
          {analysis && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Disallowed</p>
              <p className="text-lg font-bold text-red-400">
                {formatCurrency(analysis.totalDisallowed)}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Education Panel */}
      {showEducation && (
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 text-sm">
          <h4 className="font-semibold text-indigo-300 mb-2">What is the Wash Sale Rule?</h4>
          <p className="text-gray-300 mb-3">
            If you sell a security at a loss and buy a <strong>"substantially identical"</strong> security 
            within 30 days before or after the sale, the IRS disallows the loss deduction.
          </p>
          
          <h4 className="font-semibold text-indigo-300 mb-2">The 61-Day Window</h4>
          <div className="flex items-center gap-2 mb-3 text-gray-400">
            <span className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded text-xs">30 days before</span>
            <span>→</span>
            <span className="px-2 py-1 bg-red-500/20 text-red-300 rounded text-xs">SELL</span>
            <span>→</span>
            <span className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded text-xs">30 days after</span>
          </div>
          
          <h4 className="font-semibold text-indigo-300 mb-2">What's "Substantially Identical"?</h4>
          <ul className="text-gray-300 space-y-1">
            <li>• <strong>Same stock</strong> = Identical (obviously)</li>
            <li>• <strong>Same index, different ETF</strong> = Usually identical (VOO ↔ SPY ↔ IVV)</li>
            <li>• <strong>Mutual fund ↔ ETF of same index</strong> = Identical</li>
            <li>• <strong>Different indexes</strong> = Generally NOT identical (S&P 500 vs Total Market)</li>
          </ul>
        </div>
      )}
      
      {/* Timeline Visualization */}
      {timeline && timeline.windowRanges.length > 0 && (
        <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Active Wash Sale Windows</h4>
          
          <div className="relative">
            {/* Timeline axis */}
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>-45d</span>
              <span>-30d</span>
              <span>Today</span>
              <span>+30d</span>
              <span>+45d</span>
            </div>
            
            {/* Timeline bar */}
            <div className="h-2 bg-gray-700 rounded-full relative">
              {/* Today marker */}
              <div 
                className="absolute w-0.5 h-4 bg-white -top-1"
                style={{ left: '50%' }}
              />
            </div>
            
            {/* Window ranges */}
            <div className="space-y-2 mt-4">
              {timeline.windowRanges.map((w, idx) => {
                // Convert offsets to percentages (90 day range = -45 to +45)
                const startPct = ((w.startOffset + 45) / 90) * 100;
                const endPct = ((w.endOffset + 45) / 90) * 100;
                const sellPct = ((w.sellOffset + 45) / 90) * 100;
                const width = endPct - startPct;
                
                const statusColors = {
                  clean: 'bg-green-500/30 border-green-500/50',
                  'at-risk': 'bg-amber-500/30 border-amber-500/50',
                  violated: 'bg-red-500/30 border-red-500/50',
                };
                
                return (
                  <div key={idx} className="relative h-8 flex items-center">
                    {/* Ticker label */}
                    <span className="absolute -left-16 w-14 text-right text-xs font-mono text-gray-400">
                      {w.ticker}
                    </span>
                    
                    {/* Window bar */}
                    <div 
                      className={`absolute h-6 rounded border ${statusColors[w.status]}`}
                      style={{ 
                        left: `${Math.max(0, startPct)}%`, 
                        width: `${Math.min(100 - startPct, width)}%` 
                      }}
                    >
                      {/* Sell point marker */}
                      {sellPct >= 0 && sellPct <= 100 && (
                        <div 
                          className="absolute w-1 h-6 bg-red-400 -top-0"
                          style={{ left: `${((sellPct - startPct) / width) * 100}%` }}
                          title={`Sold on day ${w.sellOffset}`}
                        />
                      )}
                    </div>
                    
                    {/* Loss amount */}
                    <span className="absolute right-0 text-xs text-gray-400">
                      {formatCurrency(w.lossAmount)}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="flex gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500/30 border border-green-500/50 rounded" />
                <span className="text-gray-400">Clean</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-amber-500/30 border border-amber-500/50 rounded" />
                <span className="text-gray-400">At Risk</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500/30 border border-red-500/50 rounded" />
                <span className="text-gray-400">Violated</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-1 h-3 bg-red-400 rounded" />
                <span className="text-gray-400">Sell Date</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Holdings At Risk Table */}
      {holdingsAtRisk.length > 0 ? (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h4 className="text-sm font-medium text-gray-300">
              Holdings with Wash Sale Considerations
            </h4>
          </div>
          
          <div className="divide-y divide-gray-700/50">
            {holdingsAtRisk.map((holding, idx) => (
              <div key={`${holding.ticker}-${idx}`} className="p-4">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedTicker(
                    expandedTicker === holding.ticker ? null : holding.ticker
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-indigo-400 text-lg">{holding.ticker}</span>
                    <span className="text-gray-400 text-sm">{holding.name}</span>
                    {holding.identicalGroup && (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs rounded">
                        {holding.identicalGroup}
                      </span>
                    )}
                    {holding.hasLoss && (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-xs rounded">
                        Has Loss
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {holding.hasLoss && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Unrealized Loss</p>
                        <p className="text-red-400 font-semibold">{formatCurrency(holding.unrealizedLoss)}</p>
                      </div>
                    )}
                    <span className="text-gray-500 text-lg">
                      {expandedTicker === holding.ticker ? '▼' : '▶'}
                    </span>
                  </div>
                </div>
                
                {/* Expanded Details */}
                {expandedTicker === holding.ticker && (
                  <div className="mt-4 space-y-4">
                    {/* Substantially Identical Warning */}
                    {holding.identicalTickers.length > 0 && (
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                        <p className="text-amber-300 text-sm font-medium mb-2">
                          ⚠️ Substantially Identical Securities
                        </p>
                        <p className="text-gray-400 text-sm mb-2">
                          Buying any of these within 30 days of selling {holding.ticker} at a loss 
                          will trigger a wash sale:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {holding.identicalTickers.map(t => (
                            <span 
                              key={t}
                              className="px-2 py-1 bg-gray-800 text-amber-300 font-mono text-sm rounded"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Safe Swap Alternatives */}
                    {holding.hasLoss && safeAlternatives.length > 0 && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                        <p className="text-green-300 text-sm font-medium mb-2">
                          ✅ Safe Swap Alternatives
                        </p>
                        <p className="text-gray-400 text-sm mb-2">
                          These provide similar exposure but are NOT substantially identical:
                        </p>
                        <div className="space-y-2">
                          {safeAlternatives.filter(a => a.isSafe).map(alt => (
                            <div 
                              key={alt.ticker}
                              className="flex items-center justify-between bg-gray-800/50 rounded-lg p-2"
                            >
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-green-400">{alt.ticker}</span>
                                <span className="text-gray-300 text-sm">{alt.name}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-xs text-gray-500">{alt.expenseRatio}% ER</span>
                                <p className="text-xs text-gray-400">{alt.reason}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Safe harvest action */}
                    {holding.hasLoss && (
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <p className="text-gray-300 text-sm">
                          <strong>To safely harvest this loss:</strong>
                        </p>
                        <ol className="text-gray-400 text-sm mt-2 space-y-1 list-decimal list-inside">
                          <li>Sell {holding.ticker} to realize the {formatCurrency(holding.unrealizedLoss)} loss</li>
                          <li>Immediately buy a safe alternative (above) to maintain market exposure</li>
                          <li>Wait 31+ days before buying back {holding.ticker} or identical securities</li>
                          <li>The loss can offset up to {formatCurrency(Math.min(3000, holding.unrealizedLoss))} in ordinary income this year</li>
                        </ol>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gray-800/50 rounded-xl p-8 text-center border border-gray-700">
          <p className="text-4xl mb-4">✨</p>
          <p className="text-gray-400">No wash sale risks detected in your portfolio.</p>
          <p className="text-sm text-gray-500 mt-2">
            Holdings with losses or substantially identical securities will appear here.
          </p>
        </div>
      )}
      
      {/* Recommendations */}
      {analysis && analysis.recommendations.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <h4 className="text-blue-300 font-medium mb-2">📋 Recommendations</h4>
          <ul className="space-y-2">
            {analysis.recommendations.map((rec, idx) => (
              <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                <span className="text-blue-400">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default WashSaleTracker;
