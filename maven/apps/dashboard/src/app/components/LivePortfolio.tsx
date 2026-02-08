'use client';

import { usePortfolioPrices } from '../../hooks/useMarketData';
import Link from 'next/link';

// Sam's actual holdings from memory
const SAM_HOLDINGS = [
  { symbol: 'TAO', shares: 215, account: 'Various' },
  { symbol: 'CIFR', shares: 12000, account: 'Brokerage' },
  { symbol: 'IREN', shares: 4200, account: 'Brokerage' },
  { symbol: 'VTI', shares: 620, account: 'IRA' },
  { symbol: 'VEA', shares: 450, account: '401k' },
  { symbol: 'BND', shares: 580, account: '401k' },
];

function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount.toFixed(2)}`;
}

interface LivePortfolioProps {
  holdings?: { symbol: string; shares: number; account?: string }[];
  showAccount?: boolean;
  limit?: number;
}

export default function LivePortfolio({ 
  holdings = SAM_HOLDINGS, 
  showAccount = false,
  limit 
}: LivePortfolioProps) {
  const { holdings: portfolioData, totalValue, loading, error, refresh } = usePortfolioPrices(holdings);
  
  const displayHoldings = limit ? portfolioData.slice(0, limit) : portfolioData;
  const sortedHoldings = [...displayHoldings].sort((a, b) => b.value - a.value);
  
  if (loading) {
    return (
      <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Holdings</h2>
          <span className="text-xs text-gray-500">Loading live prices...</span>
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-white/10" />
              <div className="flex-1">
                <div className="h-4 bg-white/10 rounded w-16 mb-1" />
                <div className="h-3 bg-white/10 rounded w-24" />
              </div>
              <div className="text-right">
                <div className="h-4 bg-white/10 rounded w-20 mb-1" />
                <div className="h-3 bg-white/10 rounded w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Holdings</h2>
          <p className="text-sm text-gray-500">
            Total: <span className="text-white font-semibold">{formatCurrency(totalValue)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {error && <span className="text-xs text-red-400">⚠️</span>}
          <button 
            onClick={refresh}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>↻</span> Refresh
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        {sortedHoldings.map((holding, idx) => (
          <div 
            key={idx}
            className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {holding.symbol.slice(0, 2)}
              </div>
              <div>
                <p className="font-medium text-white">{holding.symbol}</p>
                <p className="text-xs text-gray-500">
                  {holding.shares.toLocaleString()} {holding.symbol === 'TAO' ? 'tokens' : 'shares'}
                  {showAccount && holding.account && ` • ${holding.account}`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-white">
                {holding.value > 0 ? formatCurrency(holding.value) : '—'}
              </p>
              {holding.price > 0 && (
                <p className={`text-xs ${holding.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {holding.change >= 0 ? '+' : ''}{holding.change.toFixed(2)}%
                </p>
              )}
              {holding.price > 0 && (
                <p className="text-xs text-gray-600">
                  @ ${holding.price < 10 ? holding.price.toFixed(2) : holding.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {limit && portfolioData.length > limit && (
        <Link 
          href="/portfolio-lab"
          className="block mt-4 text-center text-sm text-indigo-400 hover:text-indigo-300"
        >
          View all {portfolioData.length} holdings →
        </Link>
      )}
    </div>
  );
}
