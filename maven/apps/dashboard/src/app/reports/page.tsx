'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'wealth' | 'tax' | 'performance' | 'planning';
  icon: string;
  lastGenerated?: Date;
  frequency?: 'monthly' | 'quarterly' | 'annually' | 'on-demand';
}

const AVAILABLE_REPORTS: Report[] = [
  {
    id: 'wealth-summary',
    name: 'Wealth Summary Report',
    description: 'Complete overview of your net worth, assets, and liabilities',
    type: 'wealth',
    icon: '📊',
    lastGenerated: new Date('2026-02-01'),
    frequency: 'monthly',
  },
  {
    id: 'portfolio-performance',
    name: 'Portfolio Performance',
    description: 'Detailed analysis of investment returns, allocation, and benchmark comparison',
    type: 'performance',
    icon: '📈',
    lastGenerated: new Date('2026-02-01'),
    frequency: 'monthly',
  },
  {
    id: 'tax-projection',
    name: 'Tax Projection Report',
    description: 'Estimated tax liability and optimization opportunities',
    type: 'tax',
    icon: '💰',
    lastGenerated: new Date('2026-01-15'),
    frequency: 'quarterly',
  },
  {
    id: 'retirement-projection',
    name: 'Retirement Projection',
    description: 'Monte Carlo analysis of retirement readiness and income projections',
    type: 'planning',
    icon: '🏖️',
    lastGenerated: new Date('2026-01-01'),
    frequency: 'annually',
  },
  {
    id: 'tax-loss-harvest',
    name: 'Tax-Loss Harvest Summary',
    description: 'Year-to-date harvesting activity and realized savings',
    type: 'tax',
    icon: '🌾',
    frequency: 'on-demand',
  },
  {
    id: 'estate-summary',
    name: 'Estate Planning Summary',
    description: 'Beneficiary overview, document status, and estate value',
    type: 'planning',
    icon: '📜',
    frequency: 'annually',
  },
  {
    id: 'goals-progress',
    name: 'Goals Progress Report',
    description: 'Track progress toward all financial goals',
    type: 'planning',
    icon: '🎯',
    lastGenerated: new Date('2026-02-05'),
    frequency: 'monthly',
  },
  {
    id: 'risk-analysis',
    name: 'Risk Analysis Report',
    description: 'Portfolio risk metrics, stress tests, and concentration analysis',
    type: 'performance',
    icon: '⚠️',
    frequency: 'quarterly',
  },
];

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  wealth: { label: 'Wealth', color: 'bg-indigo-500/20 text-indigo-400' },
  tax: { label: 'Tax', color: 'bg-emerald-500/20 text-emerald-400' },
  performance: { label: 'Performance', color: 'bg-blue-500/20 text-blue-400' },
  planning: { label: 'Planning', color: 'bg-purple-500/20 text-purple-400' },
};

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ReportsPage() {
  const [filter, setFilter] = useState<string>('all');
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  
  const filteredReports = AVAILABLE_REPORTS.filter(report => {
    if (filter === 'all') return true;
    return report.type === filter;
  });
  
  const generateReport = (reportId: string) => {
    setGeneratingReport(reportId);
    setTimeout(() => {
      setGeneratingReport(null);
      // In production, this would trigger actual report generation
      alert('Report generated! In production, this would download a PDF.');
    }, 2000);
  };
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Reports</h1>
            <p className="text-gray-400 mt-1">Generate and download financial reports</p>
          </div>
          
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition">
            📥 Download All
          </button>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {Object.entries(TYPE_CONFIG).map(([type, config]) => {
            const count = AVAILABLE_REPORTS.filter(r => r.type === type).length;
            return (
              <button
                key={type}
                onClick={() => setFilter(filter === type ? 'all' : type)}
                className={`p-4 rounded-xl transition ${
                  filter === type
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[#12121a] border border-white/10 hover:border-white/20'
                }`}
              >
                <p className="text-2xl font-bold">{count}</p>
                <p className={`text-sm ${filter === type ? 'text-white/80' : 'text-gray-500'}`}>
                  {config.label}
                </p>
              </button>
            );
          })}
        </div>
        
        {/* Reports Grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {filteredReports.map((report) => {
            const typeConfig = TYPE_CONFIG[report.type];
            const isGenerating = generatingReport === report.id;
            
            return (
              <div
                key={report.id}
                className="bg-[#12121a] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition">
                      {report.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{report.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${typeConfig.color}`}>
                        {typeConfig.label}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-400 mb-4">{report.description}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="text-xs text-gray-500">
                    {report.lastGenerated ? (
                      <span>Last: {formatDate(report.lastGenerated)}</span>
                    ) : (
                      <span>Never generated</span>
                    )}
                    {report.frequency && (
                      <span className="ml-2 capitalize">• {report.frequency}</span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => generateReport(report.id)}
                    disabled={isGenerating}
                    className={`px-4 py-2 rounded-xl text-sm transition ${
                      isGenerating
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white'
                    }`}
                  >
                    {isGenerating ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                        Generating...
                      </span>
                    ) : (
                      'Generate'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Scheduled Reports */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-white mb-4">Scheduled Reports</h2>
          
          <div className="bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <p className="text-gray-400 text-sm">
                Automatically generated reports delivered to your email
              </p>
              <button className="text-sm text-indigo-400 hover:text-indigo-300">
                + Add Schedule
              </button>
            </div>
            
            <div className="divide-y divide-white/5">
              {[
                { report: 'Wealth Summary', frequency: 'Monthly', nextRun: 'Mar 1, 2026', enabled: true },
                { report: 'Portfolio Performance', frequency: 'Monthly', nextRun: 'Mar 1, 2026', enabled: true },
                { report: 'Tax Projection', frequency: 'Quarterly', nextRun: 'Apr 1, 2026', enabled: true },
              ].map((schedule, idx) => (
                <div key={idx} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-white">{schedule.report}</p>
                    <p className="text-sm text-gray-500">{schedule.frequency} • Next: {schedule.nextRun}</p>
                  </div>
                  <button
                    className={`w-12 h-6 rounded-full transition-colors ${
                      schedule.enabled ? 'bg-indigo-600' : 'bg-gray-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      schedule.enabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Report History */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Downloads</h2>
          
          <div className="bg-[#12121a] border border-white/10 rounded-2xl divide-y divide-white/5">
            {[
              { name: 'Wealth Summary - Feb 2026.pdf', date: 'Feb 5, 2026', size: '2.4 MB' },
              { name: 'Portfolio Performance - Feb 2026.pdf', date: 'Feb 5, 2026', size: '1.8 MB' },
              { name: 'Goals Progress - Feb 2026.pdf', date: 'Feb 5, 2026', size: '856 KB' },
              { name: 'Tax Projection - Q1 2026.pdf', date: 'Jan 15, 2026', size: '1.2 MB' },
            ].map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📄</span>
                  <div>
                    <p className="text-white text-sm">{file.name}</p>
                    <p className="text-xs text-gray-500">{file.date} • {file.size}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition">
                  ⬇️
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
