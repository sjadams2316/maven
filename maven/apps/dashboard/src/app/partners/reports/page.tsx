'use client';

import { useState } from 'react';

// Demo clients data
const DEMO_CLIENTS = [
  { id: '1', name: 'Robert & Linda Chen', aum: 1250000 },
  { id: '2', name: 'The Morrison Family Trust', aum: 890000 },
  { id: '3', name: 'Jennifer Walsh', aum: 675000 },
  { id: '4', name: 'Michael Thompson', aum: 520000 },
  { id: '5', name: 'Sarah & David Park', aum: 445000 },
  { id: '6', name: 'William Hartley', aum: 380000 },
  { id: '7', name: 'Emily Richardson', aum: 290000 },
];

// Report types
const REPORT_TYPES = [
  { id: 'quarterly', name: 'Quarterly Portfolio Review', icon: '📊', description: 'Comprehensive quarterly performance summary' },
  { id: 'annual', name: 'Annual Summary', icon: '📅', description: 'Year-end portfolio and tax overview' },
  { id: 'tax', name: 'Tax Planning Summary', icon: '📝', description: 'Tax-loss harvesting and planning report' },
  { id: 'meeting', name: 'Meeting Prep Document', icon: '🤝', description: 'Pre-meeting briefing for client conversations' },
  { id: 'custom', name: 'Custom Report', icon: '⚙️', description: 'Build your own report from scratch' },
];

// Available sections
const REPORT_SECTIONS = [
  { id: 'portfolio-summary', name: 'Portfolio Summary', description: 'Overview of total assets and allocation' },
  { id: 'performance', name: 'Performance vs Benchmark', description: 'Returns compared to market indices' },
  { id: 'holdings', name: 'Holdings Breakdown', description: 'Detailed list of all positions' },
  { id: 'allocation', name: 'Asset Allocation', description: 'Visual breakdown by asset class' },
  { id: 'transactions', name: 'Recent Transactions', description: 'Trading activity in the period' },
  { id: 'insights', name: 'Insights & Recommendations', description: 'AI-generated analysis and suggestions' },
  { id: 'commentary', name: 'Market Commentary', description: 'Economic and market overview' },
  { id: 'next-steps', name: 'Next Steps', description: 'Action items and follow-ups' },
];

// Demo recent reports
const DEMO_RECENT_REPORTS = [
  { id: '1', clientName: 'Robert & Linda Chen', type: 'Quarterly Portfolio Review', date: '2026-02-08', status: 'sent' },
  { id: '2', clientName: 'Jennifer Walsh', type: 'Meeting Prep Document', date: '2026-02-07', status: 'draft' },
  { id: '3', clientName: 'The Morrison Family Trust', type: 'Tax Planning Summary', date: '2026-02-05', status: 'sent' },
  { id: '4', clientName: 'Michael Thompson', type: 'Quarterly Portfolio Review', date: '2026-02-01', status: 'viewed' },
  { id: '5', clientName: 'Sarah & David Park', type: 'Annual Summary', date: '2026-01-28', status: 'sent' },
];

// Demo templates
const DEMO_TEMPLATES = [
  { id: '1', name: 'Standard Quarterly', type: 'Quarterly Portfolio Review', sections: ['portfolio-summary', 'performance', 'holdings', 'allocation', 'insights'] },
  { id: '2', name: 'Quick Meeting Prep', type: 'Meeting Prep Document', sections: ['portfolio-summary', 'insights', 'next-steps'] },
  { id: '3', name: 'Full Annual Review', type: 'Annual Summary', sections: ['portfolio-summary', 'performance', 'holdings', 'allocation', 'transactions', 'insights', 'commentary', 'next-steps'] },
];

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  return `$${(value / 1000).toFixed(0)}K`;
}

type TabType = 'builder' | 'recent' | 'templates';

export default function PartnersReports() {
  const [activeTab, setActiveTab] = useState<TabType>('builder');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedReportType, setSelectedReportType] = useState('quarterly');
  const [dateFrom, setDateFrom] = useState('2025-11-01');
  const [dateTo, setDateTo] = useState('2026-01-31');
  const [selectedSections, setSelectedSections] = useState<string[]>([
    'portfolio-summary', 'performance', 'holdings', 'allocation', 'insights'
  ]);
  const [showPreview, setShowPreview] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const toggleSection = (sectionId: string) => {
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleGenerate = (action: 'pdf' | 'send' | 'template') => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      if (action === 'pdf') {
        setSuccessMessage('Report generated successfully! Download will start shortly.');
      } else if (action === 'send') {
        setSuccessMessage('Report sent to client successfully!');
      } else {
        setSuccessMessage('Template saved successfully!');
      }
      setShowSuccessModal(true);
    }, 1500);
  };

  const selectedReportTypeData = REPORT_TYPES.find(t => t.id === selectedReportType);
  const selectedClientData = DEMO_CLIENTS.find(c => c.id === selectedClient);

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Reports</h1>
        <p className="text-gray-400 text-sm md:text-base">Generate and manage professional client reports</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 mb-6 overflow-x-auto">
        {([
          { id: 'builder', label: 'Report Builder', icon: '📝' },
          { id: 'recent', label: 'Recent Reports', icon: '📋' },
          { id: 'templates', label: 'Templates', icon: '📁' },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 md:px-6 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-h-[48px] flex-1 md:flex-none justify-center ${
              activeTab === tab.id
                ? 'bg-amber-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Report Builder Tab */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Builder Form */}
          <div className="space-y-6">
            {/* Client Selection */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Select Client</h2>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px]"
              >
                <option value="">Choose a client...</option>
                {DEMO_CLIENTS.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} ({formatCurrency(client.aum)})
                  </option>
                ))}
              </select>
            </div>

            {/* Report Type Selection */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Report Type</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {REPORT_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedReportType(type.id)}
                    className={`p-4 rounded-xl border text-left transition-all min-h-[48px] ${
                      selectedReportType === type.id
                        ? 'bg-amber-600/20 border-amber-500 text-white'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{type.icon}</span>
                      <div>
                        <div className="font-medium text-sm">{type.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5 hidden sm:block">{type.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Date Range</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                  />
                </div>
              </div>
            </div>

            {/* Sections to Include */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Sections to Include</h2>
                <button
                  onClick={() => setSelectedSections(
                    selectedSections.length === REPORT_SECTIONS.length 
                      ? [] 
                      : REPORT_SECTIONS.map(s => s.id)
                  )}
                  className="text-amber-500 text-sm hover:text-amber-400 min-h-[48px] px-2"
                >
                  {selectedSections.length === REPORT_SECTIONS.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="space-y-2">
                {REPORT_SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => toggleSection(section.id)}
                    className={`w-full p-3 md:p-4 rounded-xl border text-left transition-all flex items-center gap-3 min-h-[48px] ${
                      selectedSections.includes(section.id)
                        ? 'bg-amber-600/10 border-amber-500/50'
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedSections.includes(section.id)
                        ? 'bg-amber-600 border-amber-600'
                        : 'border-gray-500'
                    }`}>
                      {selectedSections.includes(section.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-medium text-sm">{section.name}</div>
                      <div className="text-gray-500 text-xs truncate hidden sm:block">{section.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions - Mobile */}
            <div className="lg:hidden bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleGenerate('pdf')}
                  disabled={!selectedClient || selectedSections.length === 0 || generating}
                  className="w-full px-6 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors min-h-[48px] flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <span>📄</span>
                      <span>Generate PDF</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleGenerate('send')}
                  disabled={!selectedClient || selectedSections.length === 0 || generating}
                  className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors min-h-[48px] flex items-center justify-center gap-2"
                >
                  <span>📧</span>
                  <span>Send to Client</span>
                </button>
                <button
                  onClick={() => handleGenerate('template')}
                  disabled={selectedSections.length === 0 || generating}
                  className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors min-h-[48px] flex items-center justify-center gap-2"
                >
                  <span>💾</span>
                  <span>Save as Template</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Report Preview</h2>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-amber-500 text-sm hover:text-amber-400 min-h-[48px] px-2 lg:hidden"
                >
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
              </div>

              {/* Preview Content */}
              <div className={`${showPreview ? 'block' : 'hidden lg:block'}`}>
                <div className="bg-white rounded-xl p-4 md:p-6 text-gray-900 min-h-[400px] max-h-[600px] overflow-y-auto">
                  {/* Report Header */}
                  <div className="border-b border-gray-200 pb-4 mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">M</span>
                      </div>
                      <div>
                        <div className="font-bold text-lg">Maven Partners</div>
                        <div className="text-amber-600 text-xs font-medium">WEALTH INTELLIGENCE</div>
                      </div>
                    </div>
                  </div>

                  {/* Report Title */}
                  <div className="mb-6">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                      {selectedReportTypeData?.name || 'Select a report type'}
                    </h1>
                    <p className="text-gray-500 text-sm">
                      {selectedClientData?.name || 'Select a client'} • {dateFrom} to {dateTo}
                    </p>
                  </div>

                  {/* Preview Sections */}
                  {selectedSections.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <p>Select sections to include in your report</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {REPORT_SECTIONS.filter(s => selectedSections.includes(s.id)).map((section, index) => (
                        <div key={section.id} className="border border-gray-200 rounded-lg p-3 md:p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </span>
                            <h3 className="font-semibold text-gray-900">{section.name}</h3>
                          </div>
                          <div className="pl-8">
                            <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
                            <div className="h-2 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                            {section.id === 'allocation' && (
                              <div className="mt-3 flex gap-2">
                                <div className="h-16 w-16 bg-amber-100 rounded"></div>
                                <div className="h-16 flex-1 bg-gray-100 rounded"></div>
                              </div>
                            )}
                            {section.id === 'performance' && (
                              <div className="mt-3 h-20 bg-gradient-to-r from-amber-100 to-emerald-100 rounded"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions - Desktop */}
                <div className="hidden lg:flex flex-col gap-3 mt-6">
                  <button
                    onClick={() => handleGenerate('pdf')}
                    disabled={!selectedClient || selectedSections.length === 0 || generating}
                    className="w-full px-6 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors min-h-[48px] flex items-center justify-center gap-2"
                  >
                    {generating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <span>📄</span>
                        <span>Generate PDF</span>
                      </>
                    )}
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleGenerate('send')}
                      disabled={!selectedClient || selectedSections.length === 0 || generating}
                      className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors min-h-[48px] flex items-center justify-center gap-2"
                    >
                      <span>📧</span>
                      <span>Send to Client</span>
                    </button>
                    <button
                      onClick={() => handleGenerate('template')}
                      disabled={selectedSections.length === 0 || generating}
                      className="px-4 py-3 bg-white/10 hover:bg-white/20 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors min-h-[48px] flex items-center justify-center gap-2"
                    >
                      <span>💾</span>
                      <span>Save Template</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Reports Tab */}
      {activeTab === 'recent' && (
        <div className="bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden">
          {/* Mobile: Card layout */}
          <div className="md:hidden divide-y divide-white/10">
            {DEMO_RECENT_REPORTS.map((report) => (
              <div key={report.id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-white font-medium truncate">{report.clientName}</div>
                    <div className="text-gray-500 text-sm truncate">{report.type}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                    report.status === 'sent' ? 'bg-emerald-500/20 text-emerald-400' :
                    report.status === 'viewed' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {report.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-sm">{report.date}</span>
                  <div className="flex items-center gap-2">
                    <button className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                      👁️
                    </button>
                    <button className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-amber-400 transition-colors">
                      📧
                    </button>
                    <button className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Table layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 text-sm border-b border-white/10 bg-white/5">
                  <th className="p-4 font-medium">Client</th>
                  <th className="p-4 font-medium">Report Type</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium text-center">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_RECENT_REPORTS.map((report) => (
                  <tr key={report.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="text-white font-medium">{report.clientName}</div>
                    </td>
                    <td className="p-4 text-gray-400">{report.type}</td>
                    <td className="p-4 text-gray-400">{report.date}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        report.status === 'sent' ? 'bg-emerald-500/20 text-emerald-400' :
                        report.status === 'viewed' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        <button className="min-w-[48px] min-h-[48px] flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10">
                          👁️
                        </button>
                        <button className="min-w-[48px] min-h-[48px] flex items-center justify-center text-gray-400 hover:text-amber-400 transition-colors rounded-lg hover:bg-white/10">
                          📧
                        </button>
                        <button className="min-w-[48px] min-h-[48px] flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-white/10">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {DEMO_RECENT_REPORTS.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              No reports generated yet
            </div>
          )}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEMO_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6 hover:border-amber-500/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold">{template.name}</h3>
                    <p className="text-gray-500 text-sm">{template.type}</p>
                  </div>
                  <span className="text-2xl">📁</span>
                </div>
                <div className="mb-4">
                  <p className="text-gray-400 text-sm">{template.sections.length} sections</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {template.sections.slice(0, 3).map((sectionId) => {
                      const section = REPORT_SECTIONS.find(s => s.id === sectionId);
                      return (
                        <span key={sectionId} className="px-2 py-1 bg-white/10 rounded text-xs text-gray-400">
                          {section?.name || sectionId}
                        </span>
                      );
                    })}
                    {template.sections.length > 3 && (
                      <span className="px-2 py-1 bg-white/10 rounded text-xs text-gray-400">
                        +{template.sections.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedSections(template.sections);
                      const typeMatch = REPORT_TYPES.find(t => t.name === template.type);
                      if (typeMatch) setSelectedReportType(typeMatch.id);
                      setActiveTab('builder');
                    }}
                    className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-xl transition-colors min-h-[48px]"
                  >
                    Use Template
                  </button>
                  <button className="min-w-[48px] min-h-[48px] flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors rounded-xl hover:bg-white/10">
                    🗑️
                  </button>
                </div>
              </div>
            ))}

            {/* Add New Template Card */}
            <button
              onClick={() => {
                setActiveTab('builder');
              }}
              className="bg-[#12121a] border border-dashed border-white/20 rounded-2xl p-6 hover:border-amber-500/50 transition-colors flex flex-col items-center justify-center min-h-[200px] group"
            >
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-amber-600/20 transition-colors">
                <span className="text-2xl">+</span>
              </div>
              <p className="text-gray-400 group-hover:text-white transition-colors">Create New Template</p>
            </button>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 md:p-8 max-w-md w-full text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-white mb-2">Success!</h2>
            <p className="text-gray-400 mb-6">{successMessage}</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="px-8 py-3 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl transition-colors min-h-[48px]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
