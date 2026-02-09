'use client';

import { useState, useMemo } from 'react';
import { Term } from './InfoTooltip';
import {
  calculateRebalancingTrades,
  generateTradeListCSV,
  generateTradeListSummary,
  RebalancingPreview as RebalancingPreviewType,
  RebalancingTrade,
  HoldingWithAccount,
  TargetAllocation,
} from '@/lib/portfolio-utils';

interface Props {
  holdings: HoldingWithAccount[];
  targetAllocation: TargetAllocation;
  totalValue: number;
  riskTolerance?: string;
}

export default function RebalancingPreview({ holdings, targetAllocation, totalValue, riskTolerance }: Props) {
  const [driftThreshold, setDriftThreshold] = useState(5);
  const [taxAware, setTaxAware] = useState(true);
  const [showAllTrades, setShowAllTrades] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'trades' | 'tax'>('overview');
  
  // Calculate rebalancing preview
  const preview = useMemo(() => {
    return calculateRebalancingTrades(
      holdings as HoldingWithAccount[],
      targetAllocation,
      {
        driftThreshold,
        taxAware,
        minTradeAmount: 100,
        preferTaxAdvantaged: true,
      }
    );
  }, [holdings, targetAllocation, driftThreshold, taxAware]);
  
  const { trades, summary, assetClassChanges, warnings, recommendations } = preview;
  
  // Export functions
  const handleExportCSV = () => {
    const csv = generateTradeListCSV(preview);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rebalancing-trades-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleExportText = () => {
    const text = generateTradeListSummary(preview);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rebalancing-summary-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const handleCopyToClipboard = () => {
    const text = generateTradeListSummary(preview);
    navigator.clipboard.writeText(text);
  };
  
  // If no rebalancing needed
  if (trades.length === 0) {
    return (
      <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-emerald-500/20 flex items-center justify-center text-3xl">
            ✅
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Portfolio is Well-Balanced!</h3>
            <p className="text-gray-400 text-sm mt-1">
              All asset classes are within {driftThreshold}% of their targets. No rebalancing needed right now.
            </p>
          </div>
        </div>
        
        {/* Settings */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Drift Threshold</label>
              <select 
                value={driftThreshold}
                onChange={(e) => setDriftThreshold(Number(e.target.value))}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
              >
                <option value={3}>3% (Aggressive)</option>
                <option value={5}>5% (Recommended)</option>
                <option value={10}>10% (Relaxed)</option>
              </select>
            </div>
            <p className="text-xs text-gray-500">
              Adjust threshold to trigger rebalancing at different drift levels
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-indigo-500/20 flex items-center justify-center text-3xl">
              ⚖️
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Rebalancing Preview</h3>
              <p className="text-gray-400 text-sm">
                {trades.length} trades to reach your {riskTolerance || 'target'} allocation
              </p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-500">Net Cash Flow</p>
              <p className={`text-lg font-bold ${summary.netCashFlow >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {summary.netCashFlow >= 0 ? '+' : ''}{summary.netCashFlow.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Est. Tax Impact</p>
              <p className={`text-lg font-bold ${summary.estimatedTaxes > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {summary.estimatedTaxes > 0 ? `-$${summary.estimatedTaxes.toLocaleString()}` : '$0'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Section Tabs */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'trades', label: 'Trade List', icon: '📋' },
            { id: 'tax', label: 'Tax Impact', icon: '💰' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                activeSection === tab.id
                  ? 'bg-indigo-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-amber-400 text-xl">⚠️</span>
            <div>
              <h4 className="font-medium text-amber-400">Attention Required</h4>
              <ul className="mt-2 space-y-1">
                {warnings.map((warning, idx) => (
                  <li key={idx} className="text-sm text-amber-300/80">• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Asset Class Changes */}
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              📊 <Term id="asset-allocation">Asset Class</Term> Adjustments
            </h4>
            
            <div className="space-y-4">
              {assetClassChanges.filter(c => c.action !== 'hold').map((change, idx) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-xl border ${
                    change.action === 'sell' 
                      ? 'bg-red-500/5 border-red-500/20' 
                      : 'bg-emerald-500/5 border-emerald-500/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-2xl ${change.action === 'sell' ? 'text-red-400' : 'text-emerald-400'}`}>
                        {change.action === 'sell' ? '📉' : '📈'}
                      </span>
                      <div>
                        <p className="font-medium text-white capitalize">
                          {change.assetClass.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {change.action === 'sell' ? 'Reduce' : 'Increase'} by ${change.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${change.action === 'sell' ? 'text-red-400' : 'text-emerald-400'}`}>
                        {change.drift > 0 ? '+' : ''}{change.drift.toFixed(1)}% drift
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress bar showing current vs target */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Current: {change.currentPercent.toFixed(1)}%</span>
                        <span className="text-indigo-400">Target: {change.targetPercent.toFixed(1)}%</span>
                      </div>
                      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                        {/* Current bar */}
                        <div 
                          className={`absolute h-full rounded-full ${
                            change.action === 'sell' ? 'bg-red-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(change.currentPercent, 100)}%` }}
                        />
                        {/* Target marker */}
                        <div 
                          className="absolute h-full w-0.5 bg-indigo-400"
                          style={{ left: `${Math.min(change.targetPercent, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Holdings on target */}
              {assetClassChanges.filter(c => c.action === 'hold').length > 0 && (
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-sm text-gray-400">
                    <span className="text-emerald-400">✓</span> On target:{' '}
                    {assetClassChanges
                      .filter(c => c.action === 'hold')
                      .map(c => c.assetClass.replace(/([A-Z])/g, ' $1').trim())
                      .join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Total to Sell</p>
              <p className="text-2xl font-bold text-red-400">${summary.totalSellAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{trades.filter(t => t.action === 'sell').length} trades</p>
            </div>
            <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Total to Buy</p>
              <p className="text-2xl font-bold text-emerald-400">${summary.totalBuyAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{trades.filter(t => t.action === 'buy').length} trades</p>
            </div>
            <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Realized Gains</p>
              <p className="text-2xl font-bold text-amber-400">
                ${(summary.shortTermGains + summary.longTermGains).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">
                {summary.shortTermGains > 0 && `$${summary.shortTermGains.toLocaleString()} short-term`}
              </p>
            </div>
            <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">
                <Term id="tax-loss-harvesting">Tax Losses</Term>
              </p>
              <p className="text-2xl font-bold text-emerald-400">${summary.realizedLosses.toLocaleString()}</p>
              <p className="text-xs text-emerald-400/70">
                Can offset ~${Math.round(summary.estimatedTaxSavings).toLocaleString()} in taxes
              </p>
            </div>
          </div>
          
          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
              <h4 className="font-medium text-blue-400 mb-2 flex items-center gap-2">
                💡 Recommendations
              </h4>
              <ul className="space-y-1">
                {recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-blue-300/80">• {rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* Trade List Section */}
      {activeSection === 'trades' && (
        <div className="space-y-4">
          {/* Settings & Export */}
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Drift Threshold</label>
                  <select 
                    value={driftThreshold}
                    onChange={(e) => setDriftThreshold(Number(e.target.value))}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white"
                  >
                    <option value={3}>3% (Aggressive)</option>
                    <option value={5}>5% (Recommended)</option>
                    <option value={10}>10% (Relaxed)</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={taxAware}
                    onChange={(e) => setTaxAware(e.target.checked)}
                    className="rounded border-white/20 bg-white/5 text-indigo-500"
                  />
                  <span className="text-sm text-gray-400">Tax-Aware Ordering</span>
                </label>
              </div>
              
              {/* Export Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleCopyToClipboard}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition flex items-center gap-2"
                >
                  <span>📋</span> Copy
                </button>
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition flex items-center gap-2"
                >
                  <span>📄</span> CSV
                </button>
                <button
                  onClick={handleExportText}
                  className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm text-white transition flex items-center gap-2"
                >
                  <span>📥</span> Download
                </button>
              </div>
            </div>
          </div>
          
          {/* Sell Trades */}
          {trades.filter(t => t.action === 'sell').length > 0 && (
            <div className="bg-[#12121a] border border-red-500/20 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-red-400">📉</span> Sell Orders
                <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full">
                  {trades.filter(t => t.action === 'sell').length} trades
                </span>
              </h4>
              
              <div className="space-y-3">
                {trades
                  .filter(t => t.action === 'sell')
                  .slice(0, showAllTrades ? undefined : 5)
                  .map((trade, idx) => (
                    <TradeCard key={idx} trade={trade} />
                  ))}
                  
                {trades.filter(t => t.action === 'sell').length > 5 && !showAllTrades && (
                  <button
                    onClick={() => setShowAllTrades(true)}
                    className="w-full py-2 text-sm text-gray-400 hover:text-white transition"
                  >
                    Show {trades.filter(t => t.action === 'sell').length - 5} more sell trades...
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Buy Trades */}
          {trades.filter(t => t.action === 'buy').length > 0 && (
            <div className="bg-[#12121a] border border-emerald-500/20 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-emerald-400">📈</span> Buy Orders
                <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">
                  {trades.filter(t => t.action === 'buy').length} trades
                </span>
              </h4>
              
              <div className="space-y-3">
                {trades
                  .filter(t => t.action === 'buy')
                  .map((trade, idx) => (
                    <TradeCard key={idx} trade={trade} />
                  ))}
              </div>
            </div>
          )}
          
          {/* Execution Order Note */}
          <div className="bg-white/5 rounded-xl p-4 text-sm text-gray-400">
            <p className="flex items-start gap-2">
              <span className="text-indigo-400">💡</span>
              <span>
                <strong>Execution order:</strong> Sell orders are listed first to generate cash for buy orders. 
                Within sells, tax-advantaged accounts and loss positions are prioritized to minimize tax impact.
              </span>
            </p>
          </div>
        </div>
      )}
      
      {/* Tax Impact Section */}
      {activeSection === 'tax' && (
        <div className="space-y-6">
          {/* Tax Summary */}
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              💰 <Term id="capital-gains">Tax Impact</Term> Summary
            </h4>
            
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Short-Term Gains</p>
                <p className="text-2xl font-bold text-red-400">
                  ${summary.shortTermGains.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  Taxed at ~22% = ${Math.round(summary.shortTermGains * 0.22).toLocaleString()}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Long-Term Gains</p>
                <p className="text-2xl font-bold text-amber-400">
                  ${summary.longTermGains.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  Taxed at ~15% = ${Math.round(summary.longTermGains * 0.15).toLocaleString()}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Harvestable Losses</p>
                <p className="text-2xl font-bold text-emerald-400">
                  ${summary.realizedLosses.toLocaleString()}
                </p>
                <p className="text-xs text-emerald-400/70">
                  Saves ~${Math.round(summary.estimatedTaxSavings).toLocaleString()} in taxes
                </p>
              </div>
            </div>
            
            {/* Net Tax Impact */}
            <div className={`p-4 rounded-xl ${
              summary.estimatedTaxes > summary.estimatedTaxSavings 
                ? 'bg-red-500/10 border border-red-500/20' 
                : 'bg-emerald-500/10 border border-emerald-500/20'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Estimated Net Tax Impact</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Based on 22% marginal rate, 15% long-term rate
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-bold ${
                    summary.estimatedTaxes > summary.estimatedTaxSavings 
                      ? 'text-red-400' 
                      : 'text-emerald-400'
                  }`}>
                    {summary.estimatedTaxes > summary.estimatedTaxSavings ? '-' : '+'}$
                    {Math.abs(summary.estimatedTaxes - Math.round(summary.estimatedTaxSavings)).toLocaleString()}
                  </p>
                  {summary.estimatedTaxes <= summary.estimatedTaxSavings && (
                    <p className="text-xs text-emerald-400">Net tax benefit!</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Wash Sale Risks */}
          {summary.washSaleRisks > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
                ⚠️ <Term id="wash-sale">Wash Sale</Term> Risks
              </h4>
              
              <p className="text-sm text-gray-400 mb-4">
                Selling at a loss and buying a substantially identical security within 30 days 
                disallows the loss for tax purposes. Review these trades carefully:
              </p>
              
              <div className="space-y-3">
                {trades
                  .filter(t => t.washSaleRisk)
                  .map((trade, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-black/20 rounded-xl">
                      <span className="text-amber-400">⚠️</span>
                      <div>
                        <p className="text-white font-medium">
                          SELL {trade.ticker} at ${Math.abs(trade.unrealizedGain || 0).toLocaleString()} loss
                        </p>
                        <p className="text-sm text-amber-300/80 mt-1">
                          {trade.washSaleReason}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
              
              <div className="mt-4 p-3 bg-black/20 rounded-lg">
                <p className="text-xs text-gray-400">
                  <strong>To avoid wash sales:</strong> Wait 31+ days before buying similar securities, 
                  or buy in a different account type (e.g., sell in taxable, buy in IRA).
                </p>
              </div>
            </div>
          )}
          
          {/* Tax-Advantaged vs Taxable */}
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              🏦 Trades by Account Type
            </h4>
            
            <div className="space-y-3">
              {Object.entries(summary.tradesByAccount).map(([account, data]) => {
                const isTaxAdv = account.toLowerCase().includes('ira') || 
                                 account.toLowerCase().includes('401k') ||
                                 account.toLowerCase().includes('roth') ||
                                 account.toLowerCase().includes('hsa');
                return (
                  <div 
                    key={account} 
                    className={`flex items-center justify-between p-4 rounded-xl ${
                      isTaxAdv ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{isTaxAdv ? '🛡️' : '💼'}</span>
                      <div>
                        <p className="font-medium text-white">{account}</p>
                        <p className="text-xs text-gray-500">
                          {isTaxAdv ? 'Tax-advantaged - no immediate tax impact' : 'Taxable - gains/losses realized'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">${data.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">
                        {data.sells} sells, {data.buys} buys
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Tax Optimization Tips */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
              💡 Tax Optimization Tips
            </h4>
            
            <ul className="space-y-3 text-sm text-gray-300">
              {summary.shortTermGains > 1000 && (
                <li className="flex items-start gap-2">
                  <span className="text-amber-400">•</span>
                  <span>
                    <strong>Defer short-term gains:</strong> ${summary.shortTermGains.toLocaleString()} in 
                    short-term gains will be taxed at your ordinary income rate (~22%). Consider waiting 
                    until positions become long-term (held 1+ year) to pay only ~15%.
                  </span>
                </li>
              )}
              {summary.realizedLosses > 500 && (
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400">•</span>
                  <span>
                    <strong>Harvest losses strategically:</strong> ${summary.realizedLosses.toLocaleString()} in 
                    losses can offset gains. Excess losses (up to $3,000/year) can offset ordinary income.
                  </span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="text-indigo-400">•</span>
                <span>
                  <strong>Use tax-advantaged accounts:</strong> When possible, sell in IRA/401k accounts 
                  where there's no immediate tax, and buy in taxable accounts.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">•</span>
                <span>
                  <strong>Consider specific lot identification:</strong> When selling partial positions, 
                  specify which lots to sell (highest cost basis first) to minimize gains.
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// Trade Card Component
function TradeCard({ trade }: { trade: RebalancingTrade }) {
  const isSell = trade.action === 'sell';
  const hasGain = trade.unrealizedGain !== undefined && trade.unrealizedGain > 0;
  const hasLoss = trade.unrealizedGain !== undefined && trade.unrealizedGain < 0;
  
  return (
    <div 
      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border ${
        isSell 
          ? 'bg-red-500/5 border-red-500/20' 
          : 'bg-emerald-500/5 border-emerald-500/20'
      }`}
    >
      <div className="flex items-center gap-4 mb-3 sm:mb-0">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold ${
          isSell ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
        }`}>
          {trade.ticker.slice(0, 3)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-white">{trade.ticker}</p>
            {trade.washSaleRisk && (
              <span className="text-xs px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">
                ⚠️ Wash Sale Risk
              </span>
            )}
            {trade.priority === 'high' && (
              <span className="text-xs px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded">
                High Priority
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate max-w-[200px]">{trade.name}</p>
          {trade.accountName && (
            <p className="text-xs text-gray-500">
              {trade.accountName} {trade.accountType && `(${trade.accountType.toUpperCase()})`}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        {/* Shares & Price */}
        <div className="text-sm">
          <p className="text-gray-400">
            {trade.shares.toFixed(3)} shares @ ${trade.currentPrice.toFixed(2)}
          </p>
        </div>
        
        {/* Gain/Loss (for sells) */}
        {isSell && trade.unrealizedGain !== undefined && (
          <div className="text-sm text-right">
            <p className={hasGain ? 'text-amber-400' : hasLoss ? 'text-emerald-400' : 'text-gray-400'}>
              {hasGain ? '+' : ''}{trade.unrealizedGain.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              {trade.gainType === 'short-term' ? 'ST' : trade.gainType === 'long-term' ? 'LT' : ''} 
              {hasGain ? 'Gain' : hasLoss ? 'Loss' : ''}
            </p>
          </div>
        )}
        
        {/* Total */}
        <div className="text-right min-w-[80px]">
          <p className={`font-bold ${isSell ? 'text-red-400' : 'text-emerald-400'}`}>
            ${trade.amount.toLocaleString()}
          </p>
          {trade.estimatedTax !== undefined && trade.estimatedTax > 0 && (
            <p className="text-xs text-gray-500">Tax: ${trade.estimatedTax.toLocaleString()}</p>
          )}
        </div>
      </div>
    </div>
  );
}
