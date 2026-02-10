'use client';

import { useState } from 'react';

// Demo data for compliance tracking
const DEMO_ACTIVITY_LOG = [
  { id: '1', timestamp: '2026-02-10 14:32', client: 'Robert Chen', action: 'Recommendation Made', details: 'Suggested rebalancing to reduce tech concentration', advisor: 'Sarah Johnson' },
  { id: '2', timestamp: '2026-02-10 11:15', client: 'Jennifer Walsh', action: 'Trade Executed', details: 'Sold 50 shares NVDA, bought 100 shares VTI', advisor: 'Sarah Johnson' },
  { id: '3', timestamp: '2026-02-09 16:45', client: 'Michael Thompson', action: 'Meeting Held', details: 'Quarterly portfolio review - discussed retirement timeline', advisor: 'Sarah Johnson' },
  { id: '4', timestamp: '2026-02-09 10:20', client: 'Sarah Park', action: 'Document Sent', details: 'Updated investment policy statement', advisor: 'Sarah Johnson' },
  { id: '5', timestamp: '2026-02-08 15:00', client: 'Robert Chen', action: 'Risk Profile Updated', details: 'Changed from Aggressive to Moderate-Aggressive', advisor: 'Sarah Johnson' },
  { id: '6', timestamp: '2026-02-08 09:30', client: 'The Morrison Family Trust', action: 'Recommendation Made', details: 'Tax-loss harvesting opportunity identified', advisor: 'Sarah Johnson' },
  { id: '7', timestamp: '2026-02-07 14:00', client: 'Emily Richardson', action: 'Meeting Held', details: 'Initial consultation - discussed investment goals', advisor: 'Sarah Johnson' },
  { id: '8', timestamp: '2026-02-07 11:45', client: 'William Hartley', action: 'Trade Executed', details: 'Quarterly rebalance executed per IPS', advisor: 'Sarah Johnson' },
];

const DEMO_SUITABILITY = [
  { id: '1', client: 'Robert Chen', riskScore: 7, riskDate: '2026-02-08', objectives: 'Growth with income', timeHorizon: '15+ years', lastReview: '2026-02-08' },
  { id: '2', client: 'Jennifer Walsh', riskScore: 5, riskDate: '2025-11-15', objectives: 'Balanced growth', timeHorizon: '10-15 years', lastReview: '2025-11-15' },
  { id: '3', client: 'Michael Thompson', riskScore: 6, riskDate: '2025-12-01', objectives: 'Capital preservation with growth', timeHorizon: '5-10 years', lastReview: '2025-12-01' },
  { id: '4', client: 'Sarah Park', riskScore: 8, riskDate: '2026-01-10', objectives: 'Aggressive growth', timeHorizon: '20+ years', lastReview: '2026-01-10' },
  { id: '5', client: 'The Morrison Family Trust', riskScore: 4, riskDate: '2025-09-20', objectives: 'Income generation', timeHorizon: '10-15 years', lastReview: '2025-09-20' },
];

const DEMO_DISCLOSURES = [
  { id: '1', client: 'Robert Chen', advPart2: '2025-08-15', privacyPolicy: '2025-08-15', feeSchedule: '2025-08-15' },
  { id: '2', client: 'Jennifer Walsh', advPart2: '2025-11-10', privacyPolicy: '2025-11-10', feeSchedule: null },
  { id: '3', client: 'Michael Thompson', advPart2: '2025-06-01', privacyPolicy: '2025-06-01', feeSchedule: '2025-06-01' },
  { id: '4', client: 'Sarah Park', advPart2: '2026-01-05', privacyPolicy: null, feeSchedule: '2026-01-05' },
  { id: '5', client: 'Emily Richardson', advPart2: null, privacyPolicy: null, feeSchedule: null },
];

const DEMO_UPCOMING_REVIEWS = [
  { id: '1', client: 'The Morrison Family Trust', lastReview: '2025-09-20', dueDate: '2026-02-15', daysOverdue: -5 },
  { id: '2', client: 'Jennifer Walsh', lastReview: '2025-11-15', dueDate: '2026-02-20', daysOverdue: -10 },
  { id: '3', client: 'Michael Thompson', lastReview: '2025-12-01', dueDate: '2026-03-01', daysOverdue: -19 },
  { id: '4', client: 'William Hartley', lastReview: '2025-08-10', dueDate: '2026-02-10', daysOverdue: 0 },
];

const ACTION_TYPES = ['All', 'Recommendation Made', 'Trade Executed', 'Document Sent', 'Meeting Held', 'Risk Profile Updated'] as const;

type ActionType = typeof ACTION_TYPES[number];
type TabType = 'activity' | 'suitability' | 'disclosures' | 'reviews';

function getDisclosureStatus(date: string | null): { status: 'complete' | 'pending' | 'missing'; label: string; className: string } {
  if (!date) {
    return { status: 'missing', label: '✗ Missing', className: 'bg-red-500/20 text-red-400' };
  }
  const disclosureDate = new Date(date);
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  if (disclosureDate < oneYearAgo) {
    return { status: 'pending', label: '⚠️ Pending', className: 'bg-amber-500/20 text-amber-400' };
  }
  return { status: 'complete', label: '✓ Complete', className: 'bg-emerald-500/20 text-emerald-400' };
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getRiskLabel(score: number): { label: string; className: string } {
  if (score <= 3) return { label: 'Conservative', className: 'text-blue-400' };
  if (score <= 5) return { label: 'Moderate', className: 'text-emerald-400' };
  if (score <= 7) return { label: 'Moderate-Aggressive', className: 'text-amber-400' };
  return { label: 'Aggressive', className: 'text-red-400' };
}

function exportToCSV(data: typeof DEMO_ACTIVITY_LOG) {
  const headers = ['Timestamp', 'Client', 'Action', 'Details', 'Advisor'];
  const rows = data.map(item => [item.timestamp, item.client, item.action, item.details, item.advisor]);
  const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PartnersCompliance() {
  const [activeTab, setActiveTab] = useState<TabType>('activity');
  const [actionFilter, setActionFilter] = useState<ActionType>('All');
  const [clientFilter, setClientFilter] = useState('');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDateStart, setReportDateStart] = useState('');
  const [reportDateEnd, setReportDateEnd] = useState('');

  // Filter activity log
  const filteredActivity = DEMO_ACTIVITY_LOG.filter(item => {
    if (actionFilter !== 'All' && item.action !== actionFilter) return false;
    if (clientFilter && !item.client.toLowerCase().includes(clientFilter.toLowerCase())) return false;
    if (dateRangeStart && item.timestamp < dateRangeStart) return false;
    if (dateRangeEnd && item.timestamp > dateRangeEnd + ' 23:59') return false;
    return true;
  });

  // Calculate stats
  const currentQuarterStart = new Date();
  currentQuarterStart.setMonth(Math.floor(currentQuarterStart.getMonth() / 3) * 3, 1);
  const reviewsThisQuarter = DEMO_SUITABILITY.filter(s => new Date(s.lastReview) >= currentQuarterStart).length;
  const outstandingDocs = DEMO_DISCLOSURES.filter(d => !d.advPart2 || !d.privacyPolicy || !d.feeSchedule).length;
  const avgDaysSinceContact = 5; // Demo value

  const uniqueClients = [...new Set(DEMO_ACTIVITY_LOG.map(item => item.client))];

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'activity', label: 'Activity Log', icon: '📋' },
    { key: 'suitability', label: 'Suitability', icon: '📊' },
    { key: 'disclosures', label: 'Disclosures', icon: '📄' },
    { key: 'reviews', label: 'Reviews', icon: '📅' },
  ];

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Compliance & Audit Trail</h1>
          <p className="text-gray-400 text-sm md:text-base">Track activities and maintain regulatory compliance</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => exportToCSV(filteredActivity)}
            className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[48px]"
          >
            <span>📥</span>
            <span>Export Audit Log</span>
          </button>
          <button
            onClick={() => setShowReportModal(true)}
            className="px-5 py-3 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[48px]"
          >
            <span>📑</span>
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <span className="text-emerald-400">✓</span>
            </div>
            <div className="text-gray-400 text-sm">Reviews This Quarter</div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-white">{reviewsThisQuarter}</div>
          <div className="text-emerald-500 text-sm mt-1">On track</div>
        </div>
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <span className="text-amber-400">⚠️</span>
            </div>
            <div className="text-gray-400 text-sm">Outstanding Documentation</div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-amber-500">{outstandingDocs}</div>
          <div className="text-gray-500 text-sm mt-1">Clients need attention</div>
        </div>
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <span className="text-blue-400">💬</span>
            </div>
            <div className="text-gray-400 text-sm">Avg Days Since Contact</div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-white">{avgDaysSinceContact}</div>
          <div className="text-blue-400 text-sm mt-1">Healthy engagement</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-h-[48px] ${
              activeTab === tab.key
                ? 'bg-amber-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Activity Log Tab */}
      {activeTab === 'activity' && (
        <div className="bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-white/10 flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Filter by client..."
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 min-h-[48px]"
            />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value as ActionType)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px]"
            >
              {ACTION_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <input
              type="date"
              value={dateRangeStart}
              onChange={(e) => setDateRangeStart(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px]"
              placeholder="Start date"
            />
            <input
              type="date"
              value={dateRangeEnd}
              onChange={(e) => setDateRangeEnd(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px]"
              placeholder="End date"
            />
          </div>

          {/* Activity List - Mobile */}
          <div className="md:hidden divide-y divide-white/10">
            {filteredActivity.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-white font-medium">{item.client}</span>
                  <span className="text-gray-500 text-xs whitespace-nowrap">{item.timestamp}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.action === 'Recommendation Made' ? 'bg-blue-500/20 text-blue-400' :
                    item.action === 'Trade Executed' ? 'bg-emerald-500/20 text-emerald-400' :
                    item.action === 'Document Sent' ? 'bg-purple-500/20 text-purple-400' :
                    item.action === 'Meeting Held' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-pink-500/20 text-pink-400'
                  }`}>
                    {item.action}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-1">{item.details}</p>
                <p className="text-gray-500 text-xs">By {item.advisor}</p>
              </div>
            ))}
          </div>

          {/* Activity List - Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 text-sm border-b border-white/10 bg-white/5">
                  <th className="p-4 font-medium">Timestamp</th>
                  <th className="p-4 font-medium">Client</th>
                  <th className="p-4 font-medium">Action</th>
                  <th className="p-4 font-medium">Details</th>
                  <th className="p-4 font-medium">Advisor</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivity.map((item) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 text-gray-400 whitespace-nowrap">{item.timestamp}</td>
                    <td className="p-4 text-white font-medium">{item.client}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.action === 'Recommendation Made' ? 'bg-blue-500/20 text-blue-400' :
                        item.action === 'Trade Executed' ? 'bg-emerald-500/20 text-emerald-400' :
                        item.action === 'Document Sent' ? 'bg-purple-500/20 text-purple-400' :
                        item.action === 'Meeting Held' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-pink-500/20 text-pink-400'
                      }`}>
                        {item.action}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 max-w-md truncate">{item.details}</td>
                    <td className="p-4 text-gray-400">{item.advisor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredActivity.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              No activities match your filters
            </div>
          )}
        </div>
      )}

      {/* Suitability Tab */}
      {activeTab === 'suitability' && (
        <div className="space-y-4">
          {DEMO_SUITABILITY.map((item) => {
            const riskInfo = getRiskLabel(item.riskScore);
            return (
              <div key={item.id} className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-3">{item.client}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Risk Profile</div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{item.riskScore}/10</span>
                          <span className={`text-sm ${riskInfo.className}`}>({riskInfo.label})</span>
                        </div>
                        <div className="text-gray-500 text-xs mt-1">Assessed {formatDate(item.riskDate)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Investment Objectives</div>
                        <div className="text-white">{item.objectives}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Time Horizon</div>
                        <div className="text-white">{item.timeHorizon}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Last Review</div>
                        <div className="text-white">{formatDate(item.lastReview)}</div>
                      </div>
                    </div>
                  </div>
                  <button className="px-5 py-3 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl transition-colors min-h-[48px] whitespace-nowrap">
                    Review Suitability
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Disclosures Tab */}
      {activeTab === 'disclosures' && (
        <div className="space-y-4">
          {DEMO_DISCLOSURES.map((item) => {
            const advStatus = getDisclosureStatus(item.advPart2);
            const privacyStatus = getDisclosureStatus(item.privacyPolicy);
            const feeStatus = getDisclosureStatus(item.feeSchedule);
            
            return (
              <div key={item.id} className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
                <h3 className="text-lg font-semibold text-white mb-4">{item.client}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div>
                      <div className="text-white font-medium">ADV Part 2</div>
                      <div className="text-gray-500 text-xs">
                        {item.advPart2 ? `Delivered ${formatDate(item.advPart2)}` : 'Not delivered'}
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${advStatus.className}`}>
                      {advStatus.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div>
                      <div className="text-white font-medium">Privacy Policy</div>
                      <div className="text-gray-500 text-xs">
                        {item.privacyPolicy ? `Acknowledged ${formatDate(item.privacyPolicy)}` : 'Not acknowledged'}
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${privacyStatus.className}`}>
                      {privacyStatus.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div>
                      <div className="text-white font-medium">Fee Schedule</div>
                      <div className="text-gray-500 text-xs">
                        {item.feeSchedule ? `Agreed ${formatDate(item.feeSchedule)}` : 'Not agreed'}
                      </div>
                    </div>
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${feeStatus.className}`}>
                      {feeStatus.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upcoming Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className="bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-white font-medium">Clients Due for Annual Review</h3>
            <p className="text-gray-500 text-sm">Sorted by urgency</p>
          </div>
          
          {/* Mobile */}
          <div className="md:hidden divide-y divide-white/10">
            {DEMO_UPCOMING_REVIEWS.sort((a, b) => a.daysOverdue - b.daysOverdue).map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-white font-medium">{item.client}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    item.daysOverdue >= 0 ? 'bg-red-500/20 text-red-400' :
                    item.daysOverdue > -7 ? 'bg-amber-500/20 text-amber-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {item.daysOverdue >= 0 ? `${item.daysOverdue} days overdue` :
                     item.daysOverdue > -7 ? `Due in ${Math.abs(item.daysOverdue)} days` :
                     `Due ${formatDate(item.dueDate)}`}
                  </span>
                </div>
                <div className="text-gray-500 text-sm mb-3">Last review: {formatDate(item.lastReview)}</div>
                <button className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl transition-colors min-h-[48px]">
                  Schedule Review
                </button>
              </div>
            ))}
          </div>

          {/* Desktop */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 text-sm border-b border-white/10 bg-white/5">
                  <th className="p-4 font-medium">Client</th>
                  <th className="p-4 font-medium">Last Review</th>
                  <th className="p-4 font-medium">Due Date</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {DEMO_UPCOMING_REVIEWS.sort((a, b) => a.daysOverdue - b.daysOverdue).map((item) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 text-white font-medium">{item.client}</td>
                    <td className="p-4 text-gray-400">{formatDate(item.lastReview)}</td>
                    <td className="p-4 text-gray-400">{formatDate(item.dueDate)}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.daysOverdue >= 0 ? 'bg-red-500/20 text-red-400' :
                        item.daysOverdue > -7 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {item.daysOverdue >= 0 ? `${item.daysOverdue} days overdue` :
                         item.daysOverdue > -7 ? `Due in ${Math.abs(item.daysOverdue)} days` :
                         'On track'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl transition-colors min-h-[48px]">
                        Schedule Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generate Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/80 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
          <div className="bg-[#12121a] border-t md:border border-white/10 rounded-t-2xl md:rounded-2xl p-6 md:p-8 w-full md:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white">Generate Compliance Report</h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="min-w-[48px] min-h-[48px] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-400 text-sm md:text-base mb-6">
              Generate a comprehensive compliance report for a specific date range.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Start Date</label>
                <input
                  type="date"
                  value={reportDateStart}
                  onChange={(e) => setReportDateStart(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">End Date</label>
                <input
                  type="date"
                  value={reportDateEnd}
                  onChange={(e) => setReportDateEnd(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Include Sections</label>
                <div className="space-y-2">
                  {['Activity Log', 'Suitability Reviews', 'Disclosure Status', 'Upcoming Reviews'].map((section) => (
                    <label key={section} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 min-h-[48px]">
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded accent-amber-500" />
                      <span className="text-white">{section}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 md:gap-4 mt-8">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors min-h-[48px]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Generate report
                  alert('Compliance report generated! (Demo)');
                  setShowReportModal(false);
                }}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors font-medium min-h-[48px]"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
