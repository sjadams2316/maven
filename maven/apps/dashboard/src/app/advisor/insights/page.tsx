'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';

// Mock insights across all clients
const ALL_INSIGHTS = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Sam Adams',
    type: 'tax_harvest',
    severity: 'high',
    title: 'Tax-loss harvest opportunity',
    description: 'CIFR is showing $14,000 in unrealized losses. Consider harvesting before year-end to offset gains.',
    potentialSavings: 4200,
    visibility: 'show',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: '2',
    clientId: '1',
    clientName: 'Sam Adams',
    type: 'crypto',
    severity: 'medium',
    title: 'Crypto allocation above target',
    description: 'Crypto now represents 20% of portfolio (target: 10%). TAO has appreciated significantly.',
    visibility: 'show_with_context',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '3',
    clientId: '2',
    clientName: 'Jane Smith',
    type: 'concentration',
    severity: 'high',
    title: 'Extreme concentration in AAPL',
    description: 'AAPL represents 42% of portfolio. Single stock risk is elevated.',
    visibility: 'advisor_only',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
  },
  {
    id: '4',
    clientId: '4',
    clientName: 'Sarah Chen',
    type: 'rmd',
    severity: 'high',
    title: 'RMD deadline approaching',
    description: 'Required minimum distribution due by April 1. Ensure client is aware.',
    visibility: 'show',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: '5',
    clientId: '4',
    clientName: 'Sarah Chen',
    type: 'rebalance',
    severity: 'medium',
    title: 'Rebalancing opportunity',
    description: 'Portfolio drift exceeds 5% threshold. Consider rebalancing.',
    visibility: 'discussion',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
  },
  {
    id: '6',
    clientId: '1',
    clientName: 'Sam Adams',
    type: 'concentration',
    severity: 'low',
    title: 'AAPL gains available',
    description: 'AAPL position has $26,000 in unrealized gains. Low basis position.',
    visibility: 'advisor_only',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: '7',
    clientId: '5',
    clientName: 'Michael Torres',
    type: 'inactive',
    severity: 'medium',
    title: 'Client inactive for 2 weeks',
    description: 'No login activity in 14 days. Consider reaching out.',
    visibility: 'advisor_only',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
  {
    id: '8',
    clientId: '8',
    clientName: 'Lisa Park',
    type: 'tax_harvest',
    severity: 'medium',
    title: 'Tax-loss harvest available',
    description: 'VWO showing $3,200 loss. Good swap candidate with IEMG.',
    potentialSavings: 960,
    visibility: 'show',
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
  },
  {
    id: '9',
    clientId: '8',
    clientName: 'Lisa Park',
    type: 'contribution',
    severity: 'low',
    title: '401k contribution room available',
    description: 'Client has not maxed 401k. $8,500 contribution room remains.',
    visibility: 'discussion',
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
  },
];

type FilterType = 'all' | 'high' | 'medium' | 'low' | 'unresolved';
type InsightType = 'all' | 'tax_harvest' | 'concentration' | 'crypto' | 'rebalance' | 'rmd' | 'inactive' | 'contribution';

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return `${Math.floor(diffDays / 7)} weeks ago`;
}

export default function InsightsPage() {
  const [severityFilter, setSeverityFilter] = useState<FilterType>('all');
  const [typeFilter, setTypeFilter] = useState<InsightType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter insights
  let filteredInsights = ALL_INSIGHTS.filter(insight => {
    // Severity filter
    if (severityFilter !== 'all') {
      if (severityFilter === 'unresolved') {
        // Show only non-advisor-only insights
        if (insight.visibility === 'advisor_only') return false;
      } else if (insight.severity !== severityFilter) {
        return false;
      }
    }
    
    // Type filter
    if (typeFilter !== 'all' && insight.type !== typeFilter) {
      return false;
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        insight.clientName.toLowerCase().includes(query) ||
        insight.title.toLowerCase().includes(query) ||
        insight.description.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  // Sort by severity then date
  filteredInsights = filteredInsights.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    const severityDiff = severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder];
    if (severityDiff !== 0) return severityDiff;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
  
  const stats = {
    total: ALL_INSIGHTS.length,
    high: ALL_INSIGHTS.filter(i => i.severity === 'high').length,
    medium: ALL_INSIGHTS.filter(i => i.severity === 'medium').length,
    low: ALL_INSIGHTS.filter(i => i.severity === 'low').length,
    potentialSavings: ALL_INSIGHTS.reduce((sum, i) => sum + (i.potentialSavings || 0), 0),
  };
  
  const typeLabels: Record<string, string> = {
    tax_harvest: '💰 Tax Harvest',
    concentration: '⚠️ Concentration',
    crypto: '🪙 Crypto',
    rebalance: '⚖️ Rebalance',
    rmd: '📅 RMD',
    inactive: '😴 Inactive',
    contribution: '💵 Contribution',
  };
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Link href="/advisor" className="hover:text-white transition">Advisor</Link>
              <span>/</span>
              <span className="text-white">Insights</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">All Client Insights</h1>
            <p className="text-gray-400 text-sm mt-1">
              Maven-detected opportunities across your client book
            </p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          <button
            onClick={() => setSeverityFilter('all')}
            className={`p-4 rounded-xl border transition ${
              severityFilter === 'all'
                ? 'bg-indigo-600/20 border-indigo-500'
                : 'bg-[#12121a] border-white/10 hover:border-white/20'
            }`}
          >
            <p className="text-gray-400 text-sm">Total</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </button>
          <button
            onClick={() => setSeverityFilter('high')}
            className={`p-4 rounded-xl border transition ${
              severityFilter === 'high'
                ? 'bg-red-600/20 border-red-500'
                : 'bg-[#12121a] border-white/10 hover:border-white/20'
            }`}
          >
            <p className="text-gray-400 text-sm">High Priority</p>
            <p className="text-2xl font-bold text-red-400">{stats.high}</p>
          </button>
          <button
            onClick={() => setSeverityFilter('medium')}
            className={`p-4 rounded-xl border transition ${
              severityFilter === 'medium'
                ? 'bg-amber-600/20 border-amber-500'
                : 'bg-[#12121a] border-white/10 hover:border-white/20'
            }`}
          >
            <p className="text-gray-400 text-sm">Medium</p>
            <p className="text-2xl font-bold text-amber-400">{stats.medium}</p>
          </button>
          <button
            onClick={() => setSeverityFilter('low')}
            className={`p-4 rounded-xl border transition ${
              severityFilter === 'low'
                ? 'bg-blue-600/20 border-blue-500'
                : 'bg-[#12121a] border-white/10 hover:border-white/20'
            }`}
          >
            <p className="text-gray-400 text-sm">Low</p>
            <p className="text-2xl font-bold text-blue-400">{stats.low}</p>
          </button>
          <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-900/10 border border-emerald-500/30 p-4 rounded-xl">
            <p className="text-gray-400 text-sm">Potential Savings</p>
            <p className="text-2xl font-bold text-emerald-400">${stats.potentialSavings.toLocaleString()}</p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search insights or clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>
          
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as InsightType)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition appearance-none cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="tax_harvest">Tax Harvest</option>
            <option value="concentration">Concentration</option>
            <option value="crypto">Crypto</option>
            <option value="rebalance">Rebalance</option>
            <option value="rmd">RMD</option>
            <option value="inactive">Inactive</option>
            <option value="contribution">Contribution</option>
          </select>
        </div>
        
        {/* Insights List */}
        <div className="space-y-4">
          {filteredInsights.map(insight => (
            <Link
              key={insight.id}
              href={`/advisor/clients/${insight.clientId}`}
              className={`block p-5 rounded-xl border transition group ${
                insight.visibility === 'advisor_only'
                  ? 'bg-gray-900/50 border-gray-700 hover:border-gray-600'
                  : 'bg-[#12121a] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Severity indicator */}
                <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${
                  insight.severity === 'high' ? 'bg-red-500' :
                  insight.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white group-hover:text-indigo-300 transition">
                          {insight.clientName}
                        </span>
                        <span className="text-gray-500">·</span>
                        <span className="text-sm text-gray-400">{insight.title}</span>
                      </div>
                      <p className="text-sm text-gray-500">{insight.description}</p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      {insight.potentialSavings && (
                        <span className="text-emerald-400 font-semibold">
                          ${insight.potentialSavings.toLocaleString()}
                        </span>
                      )}
                      <span className="text-xs text-gray-600">{getRelativeTime(insight.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs px-2 py-1 bg-white/10 text-gray-400 rounded">
                      {typeLabels[insight.type] || insight.type}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      insight.visibility === 'show' ? 'bg-emerald-500/20 text-emerald-400' :
                      insight.visibility === 'show_with_context' ? 'bg-blue-500/20 text-blue-400' :
                      insight.visibility === 'advisor_only' ? 'bg-gray-500/20 text-gray-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {insight.visibility === 'show' ? '👁 Visible' :
                       insight.visibility === 'show_with_context' ? '👁 With context' :
                       insight.visibility === 'advisor_only' ? '🔒 Hidden' :
                       '💬 Discussion'}
                    </span>
                  </div>
                </div>
                
                <svg className="w-5 h-5 text-gray-600 group-hover:text-indigo-400 transition flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
          
          {filteredInsights.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No insights match your filters
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
