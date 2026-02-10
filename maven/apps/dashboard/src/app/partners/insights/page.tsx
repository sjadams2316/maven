'use client';

import { useState } from 'react';

const DEMO_INSIGHTS = [
  { id: '1', client: 'Robert Chen', clientId: '1', type: 'rebalance', message: 'Portfolio drift exceeds 5% threshold', severity: 'warning', date: '2 hours ago' },
  { id: '2', client: 'Sarah Park', clientId: '5', type: 'tax', message: 'Tax-loss harvesting opportunity: $12,400', severity: 'info', date: '4 hours ago' },
  { id: '3', client: 'Jennifer Walsh', clientId: '3', type: 'concentration', message: 'NVDA position at 18% (above 15% threshold)', severity: 'warning', date: '1 day ago' },
  { id: '4', client: 'Robert Chen', clientId: '1', type: 'tax', message: 'Potential Roth conversion opportunity', severity: 'info', date: '1 day ago' },
  { id: '5', client: 'Michael Thompson', clientId: '4', type: 'performance', message: 'Portfolio outperforming benchmark by 2.3%', severity: 'success', date: '2 days ago' },
  { id: '6', client: 'Emily Richardson', clientId: '7', type: 'risk', message: 'Equity allocation above target (72% vs 65%)', severity: 'warning', date: '3 days ago' },
];

export default function PartnersInsights() {
  const [filter, setFilter] = useState<'all' | 'warning' | 'info' | 'success'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredInsights = DEMO_INSIGHTS.filter(i => {
    if (filter !== 'all' && i.severity !== filter) return false;
    if (typeFilter !== 'all' && i.type !== typeFilter) return false;
    return true;
  });

  const types = ['all', ...new Set(DEMO_INSIGHTS.map(i => i.type))];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Insights</h1>
        <p className="text-gray-400">AI-generated insights across all clients</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
          {(['all', 'warning', 'info', 'success'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilter(sev)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none"
        >
          {types.map(t => (
            <option key={t} value={t}>{t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {filteredInsights.map((insight) => (
          <div
            key={insight.id}
            className="bg-[#12121a] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`w-3 h-3 rounded-full mt-1.5 ${
                  insight.severity === 'warning' ? 'bg-amber-500' :
                  insight.severity === 'success' ? 'bg-emerald-500' :
                  'bg-blue-500'
                }`} />
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <a href={`/partners/clients/${insight.clientId}`} className="text-white font-medium hover:text-amber-400">
                      {insight.client}
                    </a>
                    <span className="text-xs px-2 py-0.5 bg-white/10 rounded text-gray-400 uppercase">
                      {insight.type}
                    </span>
                    <span className="text-gray-500 text-sm">{insight.date}</span>
                  </div>
                  <p className="text-gray-300">{insight.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors">
                  View
                </button>
                <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-gray-400 transition-colors">
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
