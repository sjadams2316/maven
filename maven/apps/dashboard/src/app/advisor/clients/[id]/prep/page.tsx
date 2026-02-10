'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../../components/Header';

// Mock data (same as client detail page)
const MOCK_CLIENTS: Record<string, any> = {
  '1': {
    id: '1',
    firstName: 'Sam',
    lastName: 'Adams',
    email: 'sam@example.com',
    aum: 847000,
    aumChange: 23000,
    ytdReturn: 8.2,
    spReturn: 7.1,
    nextMeeting: new Date('2026-02-12T14:00:00'),
    lastMeeting: new Date('2025-12-15T14:00:00'),
    allocation: {
      equity: 67,
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
    aum: 1200000,
    aumChange: -15000,
    ytdReturn: 6.8,
    spReturn: 7.1,
    nextMeeting: new Date('2026-02-14T10:00:00'),
    lastMeeting: new Date('2025-11-20T10:00:00'),
    allocation: {
      equity: 56,
      fixedIncome: 21,
      crypto: 0,
      cash: 17,
    },
  },
};

const MOCK_CHANGES: Record<string, any[]> = {
  '1': [
    { action: 'Added', detail: '50 shares AAPL', value: 8400, date: 'Jan 15' },
    { action: 'Tax-loss harvest', detail: 'Sold VWO, bought IEMG', value: -2100, date: 'Jan 8' },
    { action: 'Contribution', detail: '401k contribution increased to max', value: 23000, date: 'Jan 1' },
    { action: 'Added', detail: '15 TAO tokens', value: 7500, date: 'Dec 20' },
  ],
  '2': [
    { action: 'Distribution', detail: 'RMD taken from IRA', value: -45000, date: 'Dec 28' },
    { action: 'Dividend', detail: 'AAPL dividend reinvested', value: 2400, date: 'Dec 15' },
  ],
};

const MOCK_TALKING_POINTS: Record<string, any[]> = {
  '1': [
    { 
      priority: 'high', 
      topic: 'Crypto allocation', 
      detail: 'Now at 20% (target 10%). TAO has appreciated significantly. Discuss rebalancing strategy.',
      question: 'Are you comfortable with this level of crypto exposure?',
    },
    { 
      priority: 'high', 
      topic: 'Tax-loss harvesting', 
      detail: 'CIFR showing $14K unrealized loss. Good harvest candidate before year-end.',
      question: 'Want to proceed with harvesting CIFR losses?',
    },
    { 
      priority: 'medium', 
      topic: 'Roth conversion window', 
      detail: 'Income may be lower this year - good opportunity for conversion.',
      question: 'Should we model a Roth conversion for this year?',
    },
    { 
      priority: 'low', 
      topic: 'International underweight', 
      detail: "Int'l equity at 15% vs 20% target. Consider adding VXUS.",
      question: 'Want to increase international exposure?',
    },
  ],
  '2': [
    { 
      priority: 'high', 
      topic: 'AAPL concentration', 
      detail: 'Now 42% of portfolio. Discussing 10b5-1 plan for gradual diversification.',
      question: 'Ready to move forward with the 10b5-1 plan?',
    },
    { 
      priority: 'medium', 
      topic: 'Retirement timeline', 
      detail: '5 years to target retirement. Review income projections.',
      question: 'Any changes to your retirement timeline?',
    },
  ],
};

const MOCK_ACTION_ITEMS: Record<string, any[]> = {
  '1': [
    { text: 'Increase 401k contribution', completed: true },
    { text: 'Review beneficiary designations', completed: true },
    { text: 'Send estate planning attorney contact', completed: false },
    { text: 'Research qualified opportunity zone funds', completed: false },
  ],
  '2': [
    { text: 'Get 10b5-1 plan drafted by legal', completed: false },
    { text: 'Model Social Security claiming strategies', completed: true },
    { text: 'Review Medicare enrollment timeline', completed: false },
  ],
};

function formatCurrency(amount: number): string {
  if (Math.abs(amount) >= 1000000) {
    return `$${(amount / 1000000).toFixed(2)}M`;
  }
  if (Math.abs(amount) >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function MeetingPrepPage() {
  const params = useParams();
  const clientId = params.id as string;
  
  const [actionItems, setActionItems] = useState(MOCK_ACTION_ITEMS[clientId] || []);
  const [newActionItem, setNewActionItem] = useState('');
  const [generating, setGenerating] = useState(false);
  
  const client = MOCK_CLIENTS[clientId];
  const changes = MOCK_CHANGES[clientId] || [];
  const talkingPoints = MOCK_TALKING_POINTS[clientId] || [];
  
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
  
  const toggleActionItem = (index: number) => {
    setActionItems(prev => prev.map((item, i) => 
      i === index ? { ...item, completed: !item.completed } : item
    ));
  };
  
  const addActionItem = () => {
    if (newActionItem.trim()) {
      setActionItems(prev => [...prev, { text: newActionItem.trim(), completed: false }]);
      setNewActionItem('');
    }
  };
  
  const generatePDF = () => {
    setGenerating(true);
    // Simulate PDF generation
    setTimeout(() => {
      setGenerating(false);
      alert('PDF generated! (This would download in production)');
    }, 1500);
  };
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumb & Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
            <Link href="/advisor" className="hover:text-white transition">Advisor</Link>
            <span>/</span>
            <Link href="/advisor/clients" className="hover:text-white transition">Clients</Link>
            <span>/</span>
            <Link href={`/advisor/clients/${clientId}`} className="hover:text-white transition">
              {client.firstName} {client.lastName}
            </Link>
            <span>/</span>
            <span className="text-white">Meeting Prep</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                Meeting Prep: {client.firstName} {client.lastName}
              </h1>
              <p className="text-gray-400">
                {client.nextMeeting ? (
                  <>Scheduled: {formatDate(client.nextMeeting)} at {formatTime(client.nextMeeting)}</>
                ) : (
                  'No meeting scheduled'
                )}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={generatePDF}
                disabled={generating}
                className="px-4 py-2 min-h-[48px] bg-white/10 hover:bg-white/20 text-white rounded-xl transition flex items-center gap-2 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span>📄</span>
                    <span>Generate PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="space-y-6">
          
          {/* Portfolio Summary */}
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>📊</span> Portfolio Summary
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-gray-400 text-sm">Total AUM</p>
                <p className="text-xl font-bold text-white">{formatCurrency(client.aum)}</p>
                <p className={`text-sm ${client.aumChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {client.aumChange >= 0 ? '+' : ''}{formatCurrency(client.aumChange)} since last
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">YTD Return</p>
                <p className={`text-xl font-bold ${client.ytdReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {client.ytdReturn >= 0 ? '+' : ''}{client.ytdReturn}%
                </p>
                <p className="text-sm text-gray-500">vs S&P {client.spReturn}%</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Equity</p>
                <p className="text-xl font-bold text-white">{client.allocation.equity}%</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Fixed Income</p>
                <p className="text-xl font-bold text-white">{client.allocation.fixedIncome}%</p>
              </div>
            </div>
            
            {client.allocation.crypto > 0 && (
              <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                <p className="text-orange-400 text-sm">
                  ⚠️ Crypto allocation at {client.allocation.crypto}% — above typical threshold
                </p>
              </div>
            )}
          </div>
          
          {/* Changes Since Last Review */}
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>🔄</span> Changes Since Last Review
              <span className="text-sm font-normal text-gray-500">
                ({client.lastMeeting ? formatDate(client.lastMeeting).split(',')[0] : 'N/A'})
              </span>
            </h2>
            
            {changes.length === 0 ? (
              <p className="text-gray-500">No significant changes</p>
            ) : (
              <div className="space-y-3">
                {changes.map((change, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className={`text-sm px-2 py-1 rounded ${
                        change.action === 'Added' ? 'bg-emerald-500/20 text-emerald-400' :
                        change.action === 'Distribution' ? 'bg-red-500/20 text-red-400' :
                        change.action === 'Tax-loss harvest' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {change.action}
                      </span>
                      <span className="text-white">{change.detail}</span>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${change.value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {change.value >= 0 ? '+' : ''}{formatCurrency(change.value)}
                      </p>
                      <p className="text-xs text-gray-500">{change.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Talking Points */}
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>💡</span> Talking Points
            </h2>
            
            <div className="space-y-4">
              {talkingPoints.map((point, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-xl border-l-4 ${
                    point.priority === 'high' 
                      ? 'bg-red-500/10 border-red-500' 
                      : point.priority === 'medium'
                      ? 'bg-amber-500/10 border-amber-500'
                      : 'bg-blue-500/10 border-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-medium text-white">{point.topic}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      point.priority === 'high' ? 'bg-red-500/30 text-red-300' :
                      point.priority === 'medium' ? 'bg-amber-500/30 text-amber-300' :
                      'bg-blue-500/30 text-blue-300'
                    }`}>
                      {point.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{point.detail}</p>
                  <p className="text-sm text-indigo-400 italic">
                    💬 "{point.question}"
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Action Items */}
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>✅</span> Action Items from Last Meeting
            </h2>
            
            <div className="space-y-2 mb-4">
              {actionItems.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => toggleActionItem(idx)}
                  className={`flex items-center gap-3 p-3 min-h-[48px] rounded-xl cursor-pointer transition ${
                    item.completed ? 'bg-emerald-500/10' : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    item.completed 
                      ? 'bg-emerald-500 border-emerald-500' 
                      : 'border-gray-600'
                  }`}>
                    {item.completed && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`flex-1 ${item.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Add new action item */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newActionItem}
                onChange={(e) => setNewActionItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addActionItem()}
                placeholder="Add new action item..."
                className="flex-1 px-4 py-2 min-h-[48px] bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={addActionItem}
                className="px-4 py-2 min-h-[48px] bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition"
              >
                Add
              </button>
            </div>
          </div>
          
          {/* Suggested Agenda */}
          <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>📋</span> Suggested Agenda
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-indigo-400">1</span>
                <div>
                  <p className="font-medium text-white">Portfolio Review</p>
                  <p className="text-sm text-gray-400">10 minutes</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-indigo-400">2</span>
                <div>
                  <p className="font-medium text-white">
                    {talkingPoints[0]?.topic || 'Key Discussion Topic'}
                  </p>
                  <p className="text-sm text-gray-400">15 minutes</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-indigo-400">3</span>
                <div>
                  <p className="font-medium text-white">
                    {talkingPoints[1]?.topic || 'Secondary Topic'}
                  </p>
                  <p className="text-sm text-gray-400">10 minutes</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-indigo-400">4</span>
                <div>
                  <p className="font-medium text-white">Action Items & Next Steps</p>
                  <p className="text-sm text-gray-400">10 minutes</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-gray-400">Total meeting time: ~45 minutes</span>
              <button className="px-4 py-2 min-h-[48px] bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition flex items-center gap-2">
                <span>📧</span>
                <span>Email to Client</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
