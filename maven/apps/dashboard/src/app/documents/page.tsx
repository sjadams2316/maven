'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

interface Document {
  id: string;
  name: string;
  type: 'statement' | 'tax' | 'agreement' | 'report' | 'other';
  size: string;
  uploadedAt: Date;
  uploadedBy: string;
  shared: boolean;
}

const MOCK_DOCUMENTS: Document[] = [
  {
    id: '1',
    name: 'Q4 2025 Portfolio Statement.pdf',
    type: 'statement',
    size: '245 KB',
    uploadedAt: new Date('2026-01-15'),
    uploadedBy: 'advisor',
    shared: true,
  },
  {
    id: '2',
    name: '2025 1099-B Composite.pdf',
    type: 'tax',
    size: '128 KB',
    uploadedAt: new Date('2026-02-01'),
    uploadedBy: 'system',
    shared: true,
  },
  {
    id: '3',
    name: 'Investment Policy Statement.pdf',
    type: 'agreement',
    size: '89 KB',
    uploadedAt: new Date('2025-06-10'),
    uploadedBy: 'advisor',
    shared: true,
  },
  {
    id: '4',
    name: 'Retirement Projection Report.pdf',
    type: 'report',
    size: '312 KB',
    uploadedAt: new Date('2026-01-28'),
    uploadedBy: 'system',
    shared: true,
  },
  {
    id: '5',
    name: 'ADV Part 2 Brochure.pdf',
    type: 'agreement',
    size: '456 KB',
    uploadedAt: new Date('2025-06-10'),
    uploadedBy: 'advisor',
    shared: true,
  },
  {
    id: '6',
    name: 'Tax-Loss Harvesting Summary.pdf',
    type: 'tax',
    size: '78 KB',
    uploadedAt: new Date('2026-02-05'),
    uploadedBy: 'system',
    shared: true,
  },
];

const TYPE_ICONS: Record<string, string> = {
  statement: '📄',
  tax: '💰',
  agreement: '📝',
  report: '📊',
  other: '📎',
};

const TYPE_LABELS: Record<string, string> = {
  statement: 'Statement',
  tax: 'Tax Document',
  agreement: 'Agreement',
  report: 'Report',
  other: 'Other',
};

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DocumentsPage() {
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  
  const filteredDocs = MOCK_DOCUMENTS.filter(doc => {
    if (filter !== 'all' && doc.type !== filter) return false;
    if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });
  
  const docCounts = {
    all: MOCK_DOCUMENTS.length,
    statement: MOCK_DOCUMENTS.filter(d => d.type === 'statement').length,
    tax: MOCK_DOCUMENTS.filter(d => d.type === 'tax').length,
    agreement: MOCK_DOCUMENTS.filter(d => d.type === 'agreement').length,
    report: MOCK_DOCUMENTS.filter(d => d.type === 'report').length,
  };
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Document Vault</h1>
            <p className="text-gray-400 mt-1">Securely store and access your financial documents</p>
          </div>
          
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition flex items-center gap-2"
          >
            <span>📤</span>
            <span>Upload Document</span>
          </button>
        </div>
        
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {[
              { key: 'all', label: 'All' },
              { key: 'statement', label: 'Statements' },
              { key: 'tax', label: 'Tax' },
              { key: 'agreement', label: 'Agreements' },
              { key: 'report', label: 'Reports' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition ${
                  filter === key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {label} ({docCounts[key as keyof typeof docCounts] || 0})
              </button>
            ))}
          </div>
          
          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          </div>
        </div>
        
        {/* Document Grid */}
        {filteredDocs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl mx-auto mb-4">
              📂
            </div>
            <p className="text-gray-400">No documents found</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map(doc => (
              <div
                key={doc.id}
                className="bg-[#12121a] border border-white/10 rounded-xl p-4 hover:border-indigo-500/30 transition group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-2xl flex-shrink-0">
                    {TYPE_ICONS[doc.type]}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate group-hover:text-indigo-400 transition">
                      {doc.name}
                    </h3>
                    <p className="text-sm text-gray-500">{TYPE_LABELS[doc.type]}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                  <div className="text-xs text-gray-500">
                    <p>{formatDate(doc.uploadedAt)}</p>
                    <p>{doc.size}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg hover:bg-white/10 transition text-gray-400 hover:text-white">
                      👁️
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/10 transition text-gray-400 hover:text-white">
                      ⬇️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Recent Activity */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
          <div className="bg-[#12121a] border border-white/10 rounded-xl divide-y divide-white/5">
            {[
              { action: 'uploaded', doc: 'Tax-Loss Harvesting Summary.pdf', by: 'Maven', time: '3 days ago' },
              { action: 'uploaded', doc: '2025 1099-B Composite.pdf', by: 'Schwab', time: '1 week ago' },
              { action: 'viewed', doc: 'Retirement Projection Report.pdf', by: 'You', time: '2 weeks ago' },
              { action: 'uploaded', doc: 'Q4 2025 Portfolio Statement.pdf', by: 'Your Advisor', time: '3 weeks ago' },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  activity.action === 'uploaded' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {activity.action === 'uploaded' ? '📤' : '👁️'}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">
                    <span className="text-gray-400">{activity.by}</span> {activity.action}{' '}
                    <span className="font-medium">{activity.doc}</span>
                  </p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Upload Document</h2>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                ✕
              </button>
            </div>
            
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-indigo-500/50 transition cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-2xl mx-auto mb-4">
                📤
              </div>
              <p className="text-white mb-2">Drop files here or click to browse</p>
              <p className="text-sm text-gray-500">PDF, JPG, PNG up to 10MB</p>
            </div>
            
            <div className="mt-4">
              <label className="text-sm text-gray-400 mb-2 block">Document Type</label>
              <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer">
                <option value="statement">Statement</option>
                <option value="tax">Tax Document</option>
                <option value="agreement">Agreement</option>
                <option value="report">Report</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setUploadModalOpen(false)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Upload functionality would work in production');
                  setUploadModalOpen(false);
                }}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
