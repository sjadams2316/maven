'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/Header';

// Mock data
const MOCK_CLIENTS: Record<string, any> = {
  '1': {
    id: '1',
    firstName: 'Sam',
    lastName: 'Adams',
    email: 'sam@example.com',
    phone: '(555) 123-4567',
    aum: 847000,
    ytdReturn: 8.2,
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
    nextMeeting: new Date('2026-02-12T14:00:00'),
    tone: 'engaged',
    riskTolerance: 'moderate',
    investmentGoal: 'Growth with income',
    retirementAge: 65,
    dateOfBirth: '1993-09-10',
    notes: 'Interested in increasing crypto allocation. Discussed TAO position. Very engaged with the platform.',
    holdings: [
      { ticker: 'GFFFX', name: 'Growth Fund of America', shares: 450, value: 145000, allocation: 17.1, change: 2.3 },
      { ticker: 'AAPL', name: 'Apple Inc.', shares: 200, value: 38000, allocation: 4.5, change: -1.2, costBasis: 12000 },
      { ticker: 'VOO', name: 'Vanguard S&P 500 ETF', shares: 180, value: 85000, allocation: 10.0, change: 1.8 },
      { ticker: 'BND', name: 'Vanguard Total Bond ETF', shares: 500, value: 42000, allocation: 5.0, change: 0.2 },
      { ticker: 'TAO', name: 'Bittensor', shares: 215, value: 102000, allocation: 12.0, change: 15.4, costBasis: 45000 },
      { ticker: 'CIFR', name: 'Cipher Mining', shares: 2000, value: 68000, allocation: 8.0, change: -3.2, costBasis: 82000 },
      { ticker: 'ANEFX', name: 'New Economy Fund', shares: 300, value: 125000, allocation: 14.8, change: 1.1 },
      { ticker: 'SPAXX', name: 'Fidelity Money Market', shares: 42000, value: 42000, allocation: 5.0, change: 0 },
    ],
    accounts: [
      { name: '401(k)', type: 'Retirement', balance: 350000, institution: 'Fidelity' },
      { name: 'Roth IRA', type: 'Retirement', balance: 180000, institution: 'Schwab' },
      { name: 'Brokerage', type: 'Investment', balance: 275000, institution: 'Schwab' },
      { name: 'Cash', type: 'Cash', balance: 42000, institution: 'Schwab' },
    ],
    allocation: {
      usEquity: 52,
      intlEquity: 15,
      fixedIncome: 5,
      crypto: 20,
      cash: 8,
    },
  },
  '2': {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    phone: '(555) 234-5678',
    aum: 1200000,
    ytdReturn: 6.8,
    lastLogin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    nextMeeting: new Date('2026-02-14T10:00:00'),
    tone: 'moderate',
    riskTolerance: 'conservative',
    investmentGoal: 'Capital preservation',
    retirementAge: 60,
    dateOfBirth: '1970-03-15',
    notes: 'Approaching retirement. Focus on income generation and capital preservation.',
    holdings: [
      { ticker: 'AAPL', name: 'Apple Inc.', shares: 2500, value: 475000, allocation: 42.0, change: -1.2, costBasis: 50000 },
      { ticker: 'BND', name: 'Vanguard Total Bond ETF', shares: 3000, value: 252000, allocation: 21.0, change: 0.2 },
      { ticker: 'VIG', name: 'Vanguard Dividend Appreciation', shares: 800, value: 168000, allocation: 14.0, change: 1.5 },
      { ticker: 'SPAXX', name: 'Fidelity Money Market', shares: 200000, value: 200000, allocation: 16.7, change: 0 },
    ],
    accounts: [
      { name: '401(k)', type: 'Retirement', balance: 650000, institution: 'Fidelity' },
      { name: 'IRA', type: 'Retirement', balance: 350000, institution: 'Schwab' },
      { name: 'Brokerage', type: 'Investment', balance: 200000, institution: 'Schwab' },
    ],
    allocation: {
      usEquity: 56,
      intlEquity: 0,
      fixedIncome: 21,
      crypto: 0,
      cash: 17,
    },
  },
};

const MOCK_INSIGHTS: Record<string, any[]> = {
  '1': [
    {
      id: '1',
      type: 'tax_harvest',
      severity: 'high',
      title: 'Tax-loss harvest opportunity',
      description: 'CIFR is showing $14,000 in unrealized losses. Consider harvesting before year-end to offset gains.',
      potentialSavings: 4200,
      visibility: 'show',
      advisorNote: '',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      id: '2',
      type: 'crypto',
      severity: 'medium',
      title: 'Crypto allocation above target',
      description: 'Crypto now represents 20% of portfolio (target: 10%). TAO has appreciated significantly.',
      visibility: 'show_with_context',
      advisorNote: 'Client is aware and comfortable. Will review at next meeting.',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: '3',
      type: 'concentration',
      severity: 'low',
      title: 'AAPL gains available',
      description: 'AAPL position has $26,000 in unrealized gains. Low basis position from early investment.',
      visibility: 'advisor_only',
      advisorNote: 'Intentional hold - waiting for step-up or charitable giving',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: '4',
      type: 'rebalance',
      severity: 'low',
      title: 'International underweight',
      description: 'International equity at 15% vs 20% target. Consider adding VXUS or similar.',
      visibility: 'discussion',
      advisorNote: '',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    },
  ],
  '2': [
    {
      id: '5',
      type: 'concentration',
      severity: 'high',
      title: 'Extreme concentration in AAPL',
      description: 'AAPL represents 42% of portfolio. Single stock risk is elevated.',
      visibility: 'advisor_only',
      advisorNote: 'Low basis position ($50K cost on $475K value). Discussing 10b5-1 plan.',
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    },
  ],
};

const MOCK_ACTIVITY: Record<string, any[]> = {
  '1': [
    { action: 'Viewed Fragility Index', time: '2 hours ago' },
    { action: 'Asked Oracle about Roth conversion', time: '5 hours ago' },
    { action: 'Viewed Portfolio Lab', time: 'Yesterday' },
    { action: 'Updated profile settings', time: '2 days ago' },
    { action: 'Viewed Tax Harvesting page', time: '3 days ago' },
  ],
  '2': [
    { action: 'Logged in', time: '3 days ago' },
    { action: 'Viewed dashboard', time: '3 days ago' },
    { action: 'Viewed Financial Snapshot', time: '1 week ago' },
  ],
};

type TabType = 'portfolio' | 'insights' | 'activity' | 'notes' | 'settings';
type VisibilityType = 'show' | 'show_with_context' | 'advisor_only' | 'discussion';

function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(2)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.id as string;
  
  const [activeTab, setActiveTab] = useState<TabType>('portfolio');
  const [insights, setInsights] = useState<any[]>([]);
  const [editingInsight, setEditingInsight] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [clientTone, setClientTone] = useState<'conservative' | 'moderate' | 'engaged'>('moderate');
  const [viewAsClient, setViewAsClient] = useState(false);
  
  const client = MOCK_CLIENTS[clientId];
  const activity = MOCK_ACTIVITY[clientId] || [];
  
  // Load saved curation data from localStorage
  useEffect(() => {
    if (client) {
      // Load insights with saved curation overrides
      const savedCuration = localStorage.getItem(`maven_curation_${clientId}`);
      const baseInsights = MOCK_INSIGHTS[clientId] || [];
      
      if (savedCuration) {
        const curationMap = JSON.parse(savedCuration);
        const mergedInsights = baseInsights.map((insight: any) => ({
          ...insight,
          visibility: curationMap[insight.id]?.visibility || insight.visibility,
          advisorNote: curationMap[insight.id]?.advisorNote ?? insight.advisorNote,
        }));
        setInsights(mergedInsights);
      } else {
        setInsights(baseInsights);
      }
      
      // Load saved notes
      const savedNotes = localStorage.getItem(`maven_notes_${clientId}`);
      setNotes(savedNotes || client.notes || '');
      
      // Load saved tone
      const savedTone = localStorage.getItem(`maven_tone_${clientId}`);
      setClientTone((savedTone as any) || client.tone || 'moderate');
    }
  }, [clientId, client]);
  
  // Save curation changes to localStorage
  useEffect(() => {
    if (insights.length > 0) {
      const curationMap: Record<string, any> = {};
      insights.forEach(insight => {
        curationMap[insight.id] = {
          visibility: insight.visibility,
          advisorNote: insight.advisorNote,
        };
      });
      localStorage.setItem(`maven_curation_${clientId}`, JSON.stringify(curationMap));
    }
  }, [insights, clientId]);
  
  // Save notes to localStorage
  useEffect(() => {
    if (notes !== undefined) {
      localStorage.setItem(`maven_notes_${clientId}`, notes);
    }
  }, [notes, clientId]);
  
  // Save tone to localStorage
  useEffect(() => {
    localStorage.setItem(`maven_tone_${clientId}`, clientTone);
  }, [clientTone, clientId]);
  
  if (!client) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Client not found</p>
          <Link href="/advisor/clients" className="text-indigo-400 hover:text-indigo-300">
            ← Back to clients
          </Link>
        </div>
      </div>
    );
  }
  
  const updateInsightVisibility = (insightId: string, visibility: VisibilityType) => {
    setInsights(prev => prev.map(i => 
      i.id === insightId ? { ...i, visibility } : i
    ));
  };
  
  const updateInsightNote = (insightId: string, note: string) => {
    setInsights(prev => prev.map(i => 
      i.id === insightId ? { ...i, advisorNote: note } : i
    ));
  };
  
  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'portfolio', label: 'Portfolio', icon: '📊' },
    { id: 'insights', label: 'Insights', icon: '💡' },
    { id: 'activity', label: 'Activity', icon: '📋' },
    { id: 'notes', label: 'Notes', icon: '📝' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Link href="/advisor" className="hover:text-white transition">Advisor</Link>
              <span>/</span>
              <Link href="/advisor/clients" className="hover:text-white transition">Clients</Link>
              <span>/</span>
              <span className="text-white">{client.firstName} {client.lastName}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {client.firstName[0]}{client.lastName[0]}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {client.firstName} {client.lastName}
                </h1>
                <p className="text-gray-400 text-sm">{client.email}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewAsClient(!viewAsClient)}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
                viewAsClient 
                  ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                  : 'bg-white/10 hover:bg-white/20 text-gray-300'
              }`}
            >
              <span>👁</span>
              <span>{viewAsClient ? 'Exit Client View' : 'View as Client'}</span>
            </button>
            <Link
              href={`/advisor/clients/${clientId}/prep`}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition flex items-center gap-2"
            >
              <span>📋</span>
              <span>Prep Meeting</span>
            </Link>
          </div>
        </div>
        
        {/* Client View Mode Banner */}
        {viewAsClient && (
          <div className="bg-amber-500/20 border border-amber-500/50 rounded-xl p-4 mb-6 flex items-center gap-3">
            <span className="text-2xl">👁</span>
            <div>
              <p className="font-medium text-amber-300">Client View Mode</p>
              <p className="text-sm text-amber-400/80">You're seeing what {client.firstName} sees. Hidden insights are excluded.</p>
            </div>
          </div>
        )}
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Total AUM</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(client.aum)}</p>
          </div>
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
            <p className="text-gray-400 text-sm">YTD Return</p>
            <p className={`text-2xl font-bold ${client.ytdReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {client.ytdReturn >= 0 ? '+' : ''}{client.ytdReturn}%
            </p>
          </div>
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Next Meeting</p>
            <p className="text-lg font-semibold text-white">
              {client.nextMeeting ? formatDate(client.nextMeeting) : 'Not scheduled'}
            </p>
            {client.nextMeeting && (
              <p className="text-sm text-gray-500">{formatTime(client.nextMeeting)}</p>
            )}
          </div>
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
            <p className="text-gray-400 text-sm">Client Tone</p>
            <p className={`text-lg font-semibold ${
              clientTone === 'conservative' ? 'text-blue-400' :
              clientTone === 'moderate' ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {clientTone.charAt(0).toUpperCase() + clientTone.slice(1)}
            </p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === 'insights' && insights.length > 0 && (
                <span className="px-1.5 py-0.5 bg-red-500/30 text-red-300 text-xs rounded-full">
                  {insights.filter(i => i.visibility !== 'advisor_only').length}
                </span>
              )}
            </button>
          ))}
        </div>
        
        {/* Tab Content */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
          
          {/* Portfolio Tab */}
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              {/* Allocation Chart */}
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-4">Asset Allocation</h3>
                  <div className="space-y-3">
                    {Object.entries(client.allocation as Record<string, number>).map(([key, value]) => {
                      const labels: Record<string, string> = {
                        usEquity: 'US Equity',
                        intlEquity: "Int'l Equity",
                        fixedIncome: 'Fixed Income',
                        crypto: 'Crypto',
                        cash: 'Cash',
                      };
                      const colors: Record<string, string> = {
                        usEquity: 'bg-blue-500',
                        intlEquity: 'bg-purple-500',
                        fixedIncome: 'bg-emerald-500',
                        crypto: 'bg-orange-500',
                        cash: 'bg-gray-500',
                      };
                      return (
                        <div key={key}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">{labels[key]}</span>
                            <span className="text-white">{value}%</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${colors[key]} rounded-full`}
                              style={{ width: `${value}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-4">Accounts</h3>
                  <div className="space-y-2">
                    {client.accounts.map((acc: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                        <div>
                          <p className="font-medium text-white">{acc.name}</p>
                          <p className="text-sm text-gray-500">{acc.institution}</p>
                        </div>
                        <p className="font-semibold text-white">{formatCurrency(acc.balance)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Holdings Table */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Holdings</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-400 border-b border-white/10">
                        <th className="pb-3 pr-4">Ticker</th>
                        <th className="pb-3 pr-4">Name</th>
                        <th className="pb-3 pr-4 text-right">Value</th>
                        <th className="pb-3 pr-4 text-right">Allocation</th>
                        <th className="pb-3 pr-4 text-right">Change</th>
                        <th className="pb-3 text-right">Gain/Loss</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {client.holdings.map((holding: any, idx: number) => {
                        const gain = holding.costBasis ? holding.value - holding.costBasis : null;
                        return (
                          <tr key={idx} className="border-b border-white/5">
                            <td className="py-3 pr-4 font-medium text-white">{holding.ticker}</td>
                            <td className="py-3 pr-4 text-gray-400">{holding.name}</td>
                            <td className="py-3 pr-4 text-right text-white">{formatCurrency(holding.value)}</td>
                            <td className="py-3 pr-4 text-right text-gray-400">{holding.allocation}%</td>
                            <td className={`py-3 pr-4 text-right ${holding.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {holding.change >= 0 ? '+' : ''}{holding.change}%
                            </td>
                            <td className={`py-3 text-right ${gain === null ? 'text-gray-600' : gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {gain === null ? '—' : `${gain >= 0 ? '+' : ''}${formatCurrency(gain)}`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {viewAsClient ? 'Portfolio Insights' : 'Maven Insights'}
                </h3>
                {!viewAsClient && (
                  <p className="text-sm text-gray-400">
                    Control what {client.firstName} sees
                  </p>
                )}
              </div>
              
              {(() => {
                // Filter insights based on view mode
                const visibleInsights = viewAsClient 
                  ? insights.filter(i => i.visibility !== 'advisor_only')
                  : insights;
                
                if (visibleInsights.length === 0) {
                  return (
                    <p className="text-gray-500 text-center py-8">
                      {viewAsClient ? 'No insights at this time' : 'No insights detected for this client'}
                    </p>
                  );
                }
                
                return visibleInsights.map(insight => (
                  <div 
                    key={insight.id}
                    className={`p-4 rounded-xl border ${
                      !viewAsClient && insight.visibility === 'advisor_only' 
                        ? 'bg-gray-900/50 border-gray-700' 
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        insight.severity === 'high' ? 'bg-red-500' :
                        insight.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h4 className="font-medium text-white">{insight.title}</h4>
                            <p className="text-sm text-gray-400 mt-1">{insight.description}</p>
                            
                            {/* Client View: Show context badges */}
                            {viewAsClient && insight.visibility === 'show_with_context' && (
                              <p className="text-xs text-blue-400 mt-2 flex items-center gap-1">
                                <span>✓</span> Your advisor is aware of this
                              </p>
                            )}
                            {viewAsClient && insight.visibility === 'discussion' && (
                              <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                                <span>💬</span> Discussion topic for your next review
                              </p>
                            )}
                          </div>
                          
                          {insight.potentialSavings && (
                            <span className="text-emerald-400 font-semibold whitespace-nowrap">
                              ${insight.potentialSavings.toLocaleString()} savings
                            </span>
                          )}
                        </div>
                        
                        {/* Visibility Control - Only show for advisor view */}
                        {!viewAsClient && (
                          <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-white/10">
                            <div className="flex-1">
                              <label className="text-xs text-gray-500 mb-1 block">Client Visibility</label>
                              <select
                                value={insight.visibility}
                                onChange={(e) => updateInsightVisibility(insight.id, e.target.value as VisibilityType)}
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                              >
                                <option value="show">Show to client</option>
                                <option value="show_with_context">Show with "Advisor aware" badge</option>
                                <option value="advisor_only">Advisor only (hidden)</option>
                                <option value="discussion">Show as discussion topic</option>
                              </select>
                            </div>
                            
                            <div className="flex-1">
                              <label className="text-xs text-gray-500 mb-1 block">Advisor Note</label>
                              <input
                                type="text"
                                value={insight.advisorNote}
                                onChange={(e) => updateInsightNote(insight.id, e.target.value)}
                                placeholder="Add internal note..."
                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Visibility Badge - Only show for advisor view */}
                        {!viewAsClient && (
                          <div className="mt-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              insight.visibility === 'show' ? 'bg-emerald-500/20 text-emerald-400' :
                              insight.visibility === 'show_with_context' ? 'bg-blue-500/20 text-blue-400' :
                              insight.visibility === 'advisor_only' ? 'bg-gray-500/20 text-gray-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {insight.visibility === 'show' ? '👁 Visible to client' :
                             insight.visibility === 'show_with_context' ? '👁 Visible with context' :
                             insight.visibility === 'advisor_only' ? '🔒 Hidden from client' :
                             '💬 Discussion topic'}
                          </span>
                        </div>
                        )}
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}
          
          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              
              {activity.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {activity.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-400">
                        📱
                      </div>
                      <div className="flex-1">
                        <p className="text-white">{item.action}</p>
                        <p className="text-sm text-gray-500">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Advisor Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this client..."
                className="w-full h-64 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none"
              />
              <div className="flex justify-end mt-4">
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition">
                  Save Notes
                </button>
              </div>
            </div>
          )}
          
          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Client Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Client Tone</label>
                    <p className="text-xs text-gray-500 mb-3">
                      Controls how much Maven proactively shares with this client.
                    </p>
                    <div className="flex gap-3">
                      {(['conservative', 'moderate', 'engaged'] as const).map(tone => (
                        <button
                          key={tone}
                          onClick={() => setClientTone(tone)}
                          className={`flex-1 p-4 rounded-xl border transition ${
                            clientTone === tone
                              ? 'bg-indigo-600/20 border-indigo-500 text-white'
                              : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                          }`}
                        >
                          <p className="font-medium capitalize">{tone}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {tone === 'conservative' ? 'Minimal alerts' :
                             tone === 'moderate' ? 'Balanced approach' :
                             'Full insights'}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-white/10">
                    <h4 className="font-medium text-white mb-3">Client Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Email</p>
                        <p className="text-white">{client.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Phone</p>
                        <p className="text-white">{client.phone || '—'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Risk Tolerance</p>
                        <p className="text-white capitalize">{client.riskTolerance}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Goal</p>
                        <p className="text-white">{client.investmentGoal}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Target Retirement</p>
                        <p className="text-white">Age {client.retirementAge}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Date of Birth</p>
                        <p className="text-white">{client.dateOfBirth}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
