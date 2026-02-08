'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  sections: string[];
  frequency: 'one-time' | 'monthly' | 'quarterly' | 'annual';
}

interface GeneratedReport {
  id: string;
  name: string;
  type: string;
  generatedAt: string;
  period: string;
  size: string;
  status: 'ready' | 'generating' | 'scheduled';
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'performance',
    name: 'Performance Report',
    description: 'Comprehensive returns analysis with benchmarks',
    icon: '📈',
    sections: ['Returns Summary', 'Benchmark Comparison', 'Attribution Analysis', 'Risk Metrics'],
    frequency: 'monthly',
  },
  {
    id: 'holdings',
    name: 'Holdings Report',
    description: 'Complete portfolio positions and allocations',
    icon: '📊',
    sections: ['Asset Allocation', 'Holdings Detail', 'Sector Breakdown', 'Geographic Exposure'],
    frequency: 'quarterly',
  },
  {
    id: 'tax',
    name: 'Tax Report',
    description: 'Realized gains/losses and tax lot details',
    icon: '📋',
    sections: ['Realized Gains/Losses', 'Tax Lot Detail', 'Dividend/Interest Summary', 'Estimated Tax Liability'],
    frequency: 'annual',
  },
  {
    id: 'client',
    name: 'Client Review Packet',
    description: 'Full client meeting preparation package',
    icon: '👤',
    sections: ['Executive Summary', 'Performance', 'Recommendations', 'Planning Updates', 'Q&A Prep'],
    frequency: 'quarterly',
  },
  {
    id: 'risk',
    name: 'Risk Analysis',
    description: 'Portfolio risk assessment and stress tests',
    icon: '⚠️',
    sections: ['Risk Summary', 'Stress Test Results', 'Concentration Analysis', 'VaR Metrics'],
    frequency: 'monthly',
  },
  {
    id: 'esg',
    name: 'ESG Report',
    description: 'Environmental, social, and governance analysis',
    icon: '🌱',
    sections: ['ESG Scores', 'Carbon Footprint', 'Controversy Flags', 'UN SDG Alignment'],
    frequency: 'annual',
  },
];

const recentReports: GeneratedReport[] = [
  { id: '1', name: 'Q4 2025 Performance Report', type: 'Performance', generatedAt: '2026-02-01T10:00:00', period: 'Q4 2025', size: '2.4 MB', status: 'ready' },
  { id: '2', name: 'January 2026 Holdings', type: 'Holdings', generatedAt: '2026-02-01T08:00:00', period: 'Jan 2026', size: '1.8 MB', status: 'ready' },
  { id: '3', name: '2025 Tax Summary', type: 'Tax', generatedAt: '2026-01-15T14:00:00', period: '2025', size: '3.1 MB', status: 'ready' },
  { id: '4', name: 'Chen Family Review Packet', type: 'Client', generatedAt: '2026-02-05T09:00:00', period: 'Q1 2026', size: '4.2 MB', status: 'ready' },
  { id: '5', name: 'February Risk Analysis', type: 'Risk', generatedAt: '2026-02-08T06:00:00', period: 'Feb 2026', size: '1.5 MB', status: 'generating' },
];

export default function ReportsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                ← Dashboard
              </Link>
            </div>
            <h1 className="text-3xl font-bold">Report Center</h1>
            <p className="text-slate-400 mt-1">Generate and manage client reports</p>
          </div>
          <button
            onClick={() => setShowGenerator(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"
          >
            + Generate Report
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="text-2xl font-bold">24</div>
            <div className="text-slate-400 text-sm">Reports This Month</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="text-2xl font-bold">12</div>
            <div className="text-slate-400 text-sm">Scheduled</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="text-2xl font-bold text-green-400">3</div>
            <div className="text-slate-400 text-sm">Ready for Review</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <div className="text-2xl font-bold">156 MB</div>
            <div className="text-slate-400 text-sm">Storage Used</div>
          </div>
        </div>

        {/* Report Templates */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Report Templates</h2>
          <div className="grid grid-cols-3 gap-4">
            {reportTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template.id);
                  setShowGenerator(true);
                }}
                className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 hover:border-purple-500/50 cursor-pointer transition-all"
              >
                <div className="text-3xl mb-3">{template.icon}</div>
                <h3 className="font-semibold mb-1">{template.name}</h3>
                <p className="text-sm text-slate-400 mb-4">{template.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {template.sections.slice(0, 3).map((section, i) => (
                    <span key={i} className="text-xs bg-slate-700/50 px-2 py-1 rounded">
                      {section}
                    </span>
                  ))}
                  {template.sections.length > 3 && (
                    <span className="text-xs bg-slate-700/50 px-2 py-1 rounded">
                      +{template.sections.length - 3} more
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {template.frequency.charAt(0).toUpperCase() + template.frequency.slice(1)}
                  </span>
                  <span className="text-purple-400 text-sm">Generate →</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Reports</h2>
            <Link href="/documents" className="text-purple-400 hover:text-purple-300 text-sm">
              View All in Documents →
            </Link>
          </div>
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left p-4 text-slate-400 font-medium">Report</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Type</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Period</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Generated</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Size</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report) => (
                  <tr key={report.id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                    <td className="p-4">
                      <div className="font-medium">{report.name}</div>
                    </td>
                    <td className="p-4 text-slate-400">{report.type}</td>
                    <td className="p-4 text-slate-400">{report.period}</td>
                    <td className="p-4 text-slate-400">
                      {new Date(report.generatedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-slate-400">{report.size}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        report.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                        report.status === 'generating' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {report.status === 'generating' ? '⏳ Generating...' : 
                         report.status === 'scheduled' ? '📅 Scheduled' : '✓ Ready'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {report.status === 'ready' && (
                          <>
                            <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm">
                              View
                            </button>
                            <button className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded text-sm">
                              Download
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Report Generator Modal */}
        {showGenerator && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto">
              <h2 className="text-2xl font-bold mb-6">Generate Report</h2>
              
              <div className="space-y-6">
                {/* Template Selection */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Report Type</label>
                  <select
                    value={selectedTemplate || ''}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3"
                  >
                    <option value="">Select a template...</option>
                    {reportTemplates.map((t) => (
                      <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
                    ))}
                  </select>
                </div>

                {/* Period Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Start Date</label>
                    <input
                      type="date"
                      defaultValue="2026-01-01"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">End Date</label>
                    <input
                      type="date"
                      defaultValue="2026-02-08"
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3"
                    />
                  </div>
                </div>

                {/* Client Selection (for client reports) */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Client (optional)</label>
                  <select className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3">
                    <option value="">All clients / Personal</option>
                    <option value="client-1">Robert Chen</option>
                    <option value="client-2">Sarah Mitchell</option>
                    <option value="client-3">David Park</option>
                  </select>
                </div>

                {/* Benchmark */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Benchmark</label>
                  <select className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3">
                    <option value="SPY">S&P 500 (SPY)</option>
                    <option value="VTI">Total Market (VTI)</option>
                    <option value="60/40">60/40 Portfolio</option>
                    <option value="AGG">Aggregate Bond (AGG)</option>
                  </select>
                </div>

                {/* Output Format */}
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Output Format</label>
                  <div className="flex gap-4">
                    {['PDF', 'Excel', 'Both'].map((format) => (
                      <label key={format} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="format"
                          value={format.toLowerCase()}
                          defaultChecked={format === 'PDF'}
                          className="w-4 h-4"
                        />
                        <span>{format}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sections */}
                {selectedTemplate && (
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">Include Sections</label>
                    <div className="space-y-2">
                      {reportTemplates.find(t => t.id === selectedTemplate)?.sections.map((section, i) => (
                        <label key={i} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                          <span>{section}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Schedule Option */}
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 rounded" />
                    <div>
                      <div className="font-medium">Schedule recurring generation</div>
                      <div className="text-sm text-slate-400">Automatically generate this report on a schedule</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => {
                    setShowGenerator(false);
                    setSelectedTemplate(null);
                  }}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg">
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
