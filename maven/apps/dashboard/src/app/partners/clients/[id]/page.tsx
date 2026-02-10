'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import InteractivePortfolioChart, { Holding } from '@/components/InteractivePortfolioChart';

// Demo client data
const DEMO_CLIENT = {
  id: '1',
  name: 'Robert & Linda Chen',
  email: 'robert.chen@email.com',
  phone: '(555) 123-4567',
  aum: 1250000,
  change: 3.2,
  status: 'active',
  joinedDate: 'March 2024',
  lastLogin: '2 hours ago',
  riskTolerance: 'Moderate',
  investmentGoal: 'Retirement',
  holdings: [
    { ticker: 'VTI', name: 'Vanguard Total Stock Market', value: 425000, allocation: 34, change: 2.8, category: 'US Equity', subCategory: 'US Total Market', costBasis: 380000 },
    { ticker: 'VXUS', name: 'Vanguard Total International', value: 187500, allocation: 15, change: -0.5, category: 'International', subCategory: 'Intl Developed', costBasis: 195000 },
    { ticker: 'BND', name: 'Vanguard Total Bond', value: 250000, allocation: 20, change: 0.3, category: 'Bonds', subCategory: 'US Aggregate', costBasis: 245000 },
    { ticker: 'AAPL', name: 'Apple Inc', value: 156250, allocation: 12.5, change: 4.2, category: 'Individual Stocks', subCategory: 'Technology', costBasis: 120000 },
    { ticker: 'MSFT', name: 'Microsoft Corp', value: 125000, allocation: 10, change: 3.9, category: 'Individual Stocks', subCategory: 'Technology', costBasis: 100000 },
    { ticker: 'Cash', name: 'Cash & Equivalents', value: 106250, allocation: 8.5, change: 0, category: 'Cash', subCategory: 'Money Market', costBasis: 106250 },
  ],
  insights: [
    { id: '1', type: 'rebalance', message: 'Portfolio drift exceeds 5% threshold', severity: 'warning', enabled: true },
    { id: '2', type: 'tax', message: 'Potential tax-loss harvesting: $8,200 in VXUS', severity: 'info', enabled: true },
    { id: '3', type: 'concentration', message: 'Tech sector at 22.5% (above 20% target)', severity: 'warning', enabled: false },
  ],
  notes: [
    { date: '2026-02-08', text: 'Discussed retirement timeline, targeting 2035. Wants to maintain current allocation.' },
    { date: '2026-01-15', text: 'Quarterly review completed. Happy with performance.' },
  ],
};

// Features that can be enabled/disabled for client view
const AVAILABLE_FEATURES = [
  { id: 'dashboard', name: 'Dashboard', description: 'Portfolio overview and key metrics' },
  { id: 'portfolio-lab', name: 'Portfolio Lab', description: 'Detailed analysis and optimization' },
  { id: 'oracle', name: 'Oracle Chat', description: 'AI assistant for questions' },
  { id: 'fragility', name: 'Fragility Index', description: 'Market risk indicators' },
  { id: 'what-if', name: 'What-If Simulator', description: 'Trade scenario testing' },
  { id: 'tax-harvesting', name: 'Tax Harvesting', description: 'Tax-loss opportunities' },
  { id: 'goals', name: 'Goals Tracker', description: 'Financial goal progress' },
  { id: 'retirement', name: 'Retirement Projections', description: 'Future planning tools' },
];

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  return `$${value.toLocaleString()}`;
}

export default function ClientDetail() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'access' | 'notes'>('overview');
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>(['dashboard', 'goals', 'retirement']);
  const [clientInsights, setClientInsights] = useState(DEMO_CLIENT.insights);
  const [newNote, setNewNote] = useState('');
  const [showMeetingPrep, setShowMeetingPrep] = useState(false);

  const toggleFeature = (featureId: string) => {
    setEnabledFeatures(prev =>
      prev.includes(featureId)
        ? prev.filter(f => f !== featureId)
        : [...prev, featureId]
    );
  };

  const toggleInsight = (insightId: string) => {
    setClientInsights(prev =>
      prev.map(i => i.id === insightId ? { ...i, enabled: !i.enabled } : i)
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'insights', label: 'Insights', badge: clientInsights.filter(i => i.enabled).length },
    { id: 'access', label: 'Access' },
    { id: 'notes', label: 'Notes' },
  ];

  return (
    <div className="p-4 md:p-8">
      {/* Back link */}
      <Link href="/partners/clients" className="text-gray-400 hover:text-white text-sm mb-4 inline-flex items-center min-h-[48px] md:min-h-0">
        ← Back to Clients
      </Link>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{DEMO_CLIENT.name}</h1>
          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-gray-400 text-sm md:text-base">
            <span className="break-all">{DEMO_CLIENT.email}</span>
            <span className="hidden md:inline">•</span>
            <span>{DEMO_CLIENT.phone}</span>
            <span className="hidden md:inline">•</span>
            <span className="text-emerald-500">Active since {DEMO_CLIENT.joinedDate}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <button
            onClick={() => setShowMeetingPrep(true)}
            className="flex-1 sm:flex-none px-4 py-3 md:py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors min-h-[48px] flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <span>📋</span>
            <span className="sm:inline">Meeting Prep</span>
          </button>
          <button className="flex-1 sm:flex-none px-4 py-3 md:py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors min-h-[48px] flex items-center justify-center gap-2 text-sm md:text-base">
            <span>✉️</span>
            <span className="sm:inline">Message</span>
          </button>
          <button className="w-full sm:w-auto px-4 py-3 md:py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors font-medium min-h-[48px] text-sm md:text-base">
            Open Client View
          </button>
        </div>
      </div>

      {/* Quick Stats - 2x2 on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-3 md:p-4">
          <div className="text-gray-400 text-xs md:text-sm">Total AUM</div>
          <div className="text-lg md:text-2xl font-bold text-white">{formatCurrency(DEMO_CLIENT.aum)}</div>
          <div className={`text-xs md:text-sm ${DEMO_CLIENT.change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {DEMO_CLIENT.change >= 0 ? '+' : ''}{DEMO_CLIENT.change}% MTD
          </div>
        </div>
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-3 md:p-4">
          <div className="text-gray-400 text-xs md:text-sm">Risk Profile</div>
          <div className="text-lg md:text-2xl font-bold text-white">{DEMO_CLIENT.riskTolerance}</div>
          <div className="text-gray-500 text-xs md:text-sm">{DEMO_CLIENT.investmentGoal}</div>
        </div>
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-3 md:p-4">
          <div className="text-gray-400 text-xs md:text-sm">Last Login</div>
          <div className="text-lg md:text-2xl font-bold text-white truncate">{DEMO_CLIENT.lastLogin}</div>
          <div className="text-gray-500 text-xs md:text-sm">Client portal</div>
        </div>
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-3 md:p-4">
          <div className="text-gray-400 text-xs md:text-sm">Active Insights</div>
          <div className="text-lg md:text-2xl font-bold text-amber-500">{clientInsights.filter(i => i.enabled).length}</div>
          <div className="text-gray-500 text-xs md:text-sm">Visible to client</div>
        </div>
      </div>

      {/* Analysis Tools Quick Access */}
      <div className="mb-6 md:mb-8">
        <div className="text-gray-400 text-sm mb-3">Analysis Tools</div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/partners/clients/${params.id}/analyze`}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-xl transition-all min-h-[48px] font-medium"
          >
            <span>📊</span>
            <span>Portfolio Lab</span>
          </Link>
          <Link
            href={`/partners/clients/${params.id}/oracle`}
            className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors min-h-[48px]"
          >
            <span>🔮</span>
            <span>Oracle Chat</span>
          </Link>
          <Link
            href={`/partners/clients/${params.id}/stress-test`}
            className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors min-h-[48px]"
          >
            <span>🔥</span>
            <span>Stress Test</span>
          </Link>
          <Link
            href={`/partners/clients/${params.id}/tax`}
            className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors min-h-[48px]"
          >
            <span>📋</span>
            <span>Tax Planning</span>
          </Link>
          <Link
            href={`/partners/clients/${params.id}/what-if`}
            className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors min-h-[48px]"
          >
            <span>🎯</span>
            <span>What-If</span>
          </Link>
        </div>
      </div>

      {/* Tabs - Scrollable on mobile */}
      <div className="flex items-center gap-1 md:gap-2 mb-6 border-b border-white/10 overflow-x-auto pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 md:px-6 py-3 text-sm font-medium transition-colors relative whitespace-nowrap min-h-[48px] ${
              activeTab === tab.id
                ? 'text-amber-500 border-b-2 border-amber-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full text-xs">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Interactive Portfolio Chart */}
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
            <InteractivePortfolioChart
              holdings={DEMO_CLIENT.holdings.map(h => ({
                ticker: h.ticker,
                name: h.name,
                value: h.value,
                costBasis: h.costBasis,
                category: h.category,
                subCategory: h.subCategory,
              } as Holding))}
              totalValue={DEMO_CLIENT.aum}
              title="Asset Allocation"
              onHoldingClick={(holding) => console.log('Clicked holding:', holding)}
            />
          </div>

          {/* Holdings Table */}
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6">Holdings</h2>
            
            {/* Mobile: Card layout */}
            <div className="md:hidden space-y-3">
              {DEMO_CLIENT.holdings.map((holding) => (
                <div key={holding.ticker} className="p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-white font-medium">{holding.ticker}</div>
                      <div className="text-gray-500 text-xs">{holding.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white">{formatCurrency(holding.value)}</div>
                      <div className="text-gray-400 text-xs">{holding.allocation}%</div>
                    </div>
                  </div>
                  <div className={`text-xs ${
                    holding.change > 0 ? 'text-emerald-500' : holding.change < 0 ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {holding.change > 0 ? '+' : ''}{holding.change}% MTD
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: Table layout */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-500 text-sm border-b border-white/10">
                    <th className="pb-4 font-medium">Holding</th>
                    <th className="pb-4 font-medium text-right">Value</th>
                    <th className="pb-4 font-medium text-right">Allocation</th>
                    <th className="pb-4 font-medium text-right">MTD Change</th>
                  </tr>
                </thead>
                <tbody>
                  {DEMO_CLIENT.holdings.map((holding) => (
                    <tr key={holding.ticker} className="border-b border-white/5">
                      <td className="py-4">
                        <div className="text-white font-medium">{holding.ticker}</div>
                        <div className="text-gray-500 text-sm">{holding.name}</div>
                      </td>
                      <td className="py-4 text-right text-white">{formatCurrency(holding.value)}</td>
                      <td className="py-4 text-right text-gray-400">{holding.allocation}%</td>
                      <td className={`py-4 text-right ${
                        holding.change > 0 ? 'text-emerald-500' : holding.change < 0 ? 'text-red-500' : 'text-gray-500'
                      }`}>
                        {holding.change > 0 ? '+' : ''}{holding.change}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-white">Insight Curation</h2>
            <p className="text-gray-400 text-xs md:text-sm">Toggle which insights the client can see</p>
          </div>
          <div className="space-y-3 md:space-y-4">
            {clientInsights.map((insight) => (
              <div
                key={insight.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 md:p-4 rounded-xl border transition-colors ${
                  insight.enabled
                    ? 'bg-white/5 border-white/10'
                    : 'bg-white/[0.02] border-white/5 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3 md:gap-4">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    insight.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 bg-white/10 rounded text-gray-400 uppercase">
                        {insight.type}
                      </span>
                    </div>
                    <p className="text-white text-sm md:text-base">{insight.message}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleInsight(insight.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[48px] w-full sm:w-auto ${
                    insight.enabled
                      ? 'bg-amber-600 text-white'
                      : 'bg-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {insight.enabled ? 'Visible' : 'Hidden'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'access' && (
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-white">Client Portal Access</h2>
              <p className="text-gray-400 text-xs md:text-sm mt-1">Control which features the client can access</p>
            </div>
            <div className="sm:text-right">
              <div className="text-gray-400 text-xs md:text-sm">Client Link</div>
              <code className="text-amber-400 text-xs md:text-sm break-all">mavenwealth.ai/c/CHEN2024</code>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {AVAILABLE_FEATURES.map((feature) => (
              <div
                key={feature.id}
                onClick={() => toggleFeature(feature.id)}
                className={`p-3 md:p-4 rounded-xl border cursor-pointer transition-all min-h-[72px] ${
                  enabledFeatures.includes(feature.id)
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium text-sm md:text-base">{feature.name}</span>
                  <div className={`w-10 h-6 rounded-full p-1 transition-colors flex-shrink-0 ${
                    enabledFeatures.includes(feature.id) ? 'bg-amber-600' : 'bg-white/20'
                  }`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      enabledFeatures.includes(feature.id) ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </div>
                </div>
                <p className="text-gray-400 text-xs md:text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 md:mt-6 p-3 md:p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-3 text-amber-400">
              <span>💡</span>
              <span className="text-xs md:text-sm">Changes are saved automatically and reflected in the client's portal immediately.</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold text-white mb-4 md:mb-6">Client Notes</h2>
          
          {/* Add note */}
          <div className="mb-6">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note about this client..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 resize-none min-h-[100px]"
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={() => setNewNote('')}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-colors min-h-[48px]"
              >
                Save Note
              </button>
            </div>
          </div>

          {/* Notes list */}
          <div className="space-y-3 md:space-y-4">
            {DEMO_CLIENT.notes.map((note, idx) => (
              <div key={idx} className="p-3 md:p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="text-gray-500 text-xs md:text-sm mb-2">{note.date}</div>
                <p className="text-white text-sm md:text-base">{note.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meeting Prep Modal - Full screen on mobile */}
      {showMeetingPrep && (
        <div className="fixed inset-0 bg-black/80 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
          <div className="bg-[#12121a] border-t md:border border-white/10 rounded-t-2xl md:rounded-2xl p-6 md:p-8 w-full md:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white">Meeting Prep: {DEMO_CLIENT.name}</h2>
              <button
                onClick={() => setShowMeetingPrep(false)}
                className="text-gray-400 hover:text-white min-w-[48px] min-h-[48px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 md:space-y-6">
              <div>
                <h3 className="text-amber-500 font-medium mb-2 md:mb-3 text-sm md:text-base">📊 Portfolio Summary</h3>
                <ul className="text-gray-300 space-y-1 md:space-y-2 ml-4 text-sm md:text-base">
                  <li>• AUM: {formatCurrency(DEMO_CLIENT.aum)} ({DEMO_CLIENT.change > 0 ? '+' : ''}{DEMO_CLIENT.change}% MTD)</li>
                  <li>• Risk Profile: {DEMO_CLIENT.riskTolerance}</li>
                  <li>• Top Holding: VTI at 34% allocation</li>
                </ul>
              </div>

              <div>
                <h3 className="text-amber-500 font-medium mb-2 md:mb-3 text-sm md:text-base">⚠️ Discussion Points</h3>
                <ul className="text-gray-300 space-y-1 md:space-y-2 ml-4 text-sm md:text-base">
                  {clientInsights.filter(i => i.enabled).map(insight => (
                    <li key={insight.id}>• {insight.message}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-amber-500 font-medium mb-2 md:mb-3 text-sm md:text-base">📝 Recent Notes</h3>
                <p className="text-gray-300 ml-4 text-sm md:text-base">{DEMO_CLIENT.notes[0]?.text}</p>
              </div>

              <div>
                <h3 className="text-amber-500 font-medium mb-2 md:mb-3 text-sm md:text-base">💡 Suggested Topics</h3>
                <ul className="text-gray-300 space-y-1 md:space-y-2 ml-4 text-sm md:text-base">
                  <li>• Review retirement timeline and adjust projections if needed</li>
                  <li>• Discuss tax-loss harvesting opportunity in VXUS</li>
                  <li>• Confirm risk tolerance hasn't changed</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 md:gap-4 mt-6 md:mt-8">
              <button
                onClick={() => setShowMeetingPrep(false)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors min-h-[48px]"
              >
                Close
              </button>
              <button className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors font-medium min-h-[48px]">
                Export as PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
