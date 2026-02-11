'use client';

import { useState } from 'react';
import Link from 'next/link';

const INITIAL_INSIGHTS = [
  { id: '1', client: 'Robert Chen', clientId: '1', type: 'rebalance', message: 'Portfolio drift exceeds 5% threshold', severity: 'warning', date: '2 hours ago' },
  { id: '2', client: 'Sarah Park', clientId: '5', type: 'tax', message: 'Tax-loss harvesting opportunity: $12,400', severity: 'info', date: '4 hours ago' },
  { id: '3', client: 'Jennifer Walsh', clientId: '3', type: 'concentration', message: 'NVDA position at 18% (above 15% threshold)', severity: 'warning', date: '1 day ago' },
  { id: '4', client: 'Robert Chen', clientId: '1', type: 'tax', message: 'Potential Roth conversion opportunity', severity: 'info', date: '1 day ago' },
  { id: '5', client: 'Michael Thompson', clientId: '4', type: 'performance', message: 'Portfolio outperforming benchmark by 2.3%', severity: 'success', date: '2 days ago' },
  { id: '6', client: 'Emily Richardson', clientId: '7', type: 'risk', message: 'Equity allocation above target (72% vs 65%)', severity: 'warning', date: '3 days ago' },
];

export default function PartnersInsights() {
  const [insights, setInsights] = useState(INITIAL_INSIGHTS);
  const [filter, setFilter] = useState<'all' | 'warning' | 'info' | 'success'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dismissedMessage, setDismissedMessage] = useState<string | null>(null);
  
  const handleDismiss = (id: string, client: string) => {
    setInsights(prev => prev.filter(i => i.id !== id));
    setDismissedMessage(`Dismissed insight for ${client}`);
    setTimeout(() => setDismissedMessage(null), 3000);
  };

  const filteredInsights = insights.filter(i => {
    if (filter !== 'all' && i.severity !== filter) return false;
    if (typeFilter !== 'all' && i.type !== typeFilter) return false;
    return true;
  });

  const types = ['all', ...new Set(insights.map(i => i.type))];

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Insights</h1>
        <p className="text-gray-400 text-sm md:text-base">AI-generated insights across all clients</p>
      </div>

      {/* Filters - Stack on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 mb-6">
        {/* Severity filter - Scrollable */}
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 overflow-x-auto">
          {(['all', 'warning', 'info', 'success'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilter(sev)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-h-[44px] ${
                filter === sev
                  ? 'bg-amber-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {sev.charAt(0).toUpperCase() + sev.slice(1)}
            </button>
          ))}
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none min-h-[48px]"
        >
          {types.map(t => (
            <option key={t} value={t}>{t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Insights List */}
      <div className="space-y-3 md:space-y-4">
        {filteredInsights.map((insight) => (
          <div
            key={insight.id}
            className="bg-[#12121a] border border-white/10 rounded-xl p-4 md:p-6 hover:border-white/20 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3 md:gap-4">
                <div className={`w-3 h-3 rounded-full mt-1 md:mt-1.5 flex-shrink-0 ${
                  insight.severity === 'warning' ? 'bg-amber-500' :
                  insight.severity === 'success' ? 'bg-emerald-500' :
                  'bg-blue-500'
                }`} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                    <Link 
                      href={`/partners/clients/${insight.clientId}`} 
                      className="text-white font-medium hover:text-amber-400 min-h-[48px] sm:min-h-0 inline-flex items-center"
                    >
                      {insight.client}
                    </Link>
                    <span className="text-xs px-2 py-0.5 bg-white/10 rounded text-gray-400 uppercase">
                      {insight.type}
                    </span>
                    <span className="text-gray-500 text-xs md:text-sm">{insight.date}</span>
                  </div>
                  <p className="text-gray-300 text-sm md:text-base">{insight.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-7 sm:ml-0">
                <Link 
                  href={`/partners/clients/${insight.clientId}`}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors min-h-[48px] flex items-center justify-center flex-1 sm:flex-initial"
                >
                  View
                </Link>
                <button 
                  onClick={() => handleDismiss(insight.id, insight.client)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-gray-400 hover:text-white transition-colors min-h-[48px] flex items-center justify-center flex-1 sm:flex-initial"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredInsights.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No insights match your filters
        </div>
      )}
    </div>
  );
}
