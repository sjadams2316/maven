'use client';

import { useState } from 'react';

// Demo documents
const DEMO_DOCUMENTS = {
  taxDocuments: [
    { id: '1', name: '2025 Form 1099-DIV', date: '2026-01-31', type: 'tax', size: '124 KB' },
    { id: '2', name: '2025 Form 1099-B', date: '2026-01-31', type: 'tax', size: '89 KB' },
    { id: '3', name: '2024 Form 1099-DIV', date: '2025-01-31', type: 'tax', size: '118 KB' },
    { id: '4', name: '2024 Form 1099-B', date: '2025-01-31', type: 'tax', size: '92 KB' },
  ],
  statements: [
    { id: '5', name: 'Q4 2025 Statement', date: '2026-01-15', type: 'statement', size: '256 KB' },
    { id: '6', name: 'Q3 2025 Statement', date: '2025-10-15', type: 'statement', size: '248 KB' },
    { id: '7', name: 'Q2 2025 Statement', date: '2025-07-15', type: 'statement', size: '234 KB' },
    { id: '8', name: 'Q1 2025 Statement', date: '2025-04-15', type: 'statement', size: '241 KB' },
  ],
  agreements: [
    { id: '9', name: 'Investment Advisory Agreement', date: '2022-03-15', type: 'agreement', size: '1.2 MB' },
    { id: '10', name: 'Privacy Policy', date: '2024-01-01', type: 'agreement', size: '89 KB' },
    { id: '11', name: 'Form ADV Part 2', date: '2025-03-31', type: 'agreement', size: '456 KB' },
  ],
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric',
  });
}

function DocumentCard({ doc, onDownload }: { doc: any; onDownload: () => void }) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'tax': return '📋';
      case 'statement': return '📈';
      case 'agreement': return '📝';
      default: return '📄';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-lg">
          {getIcon(doc.type)}
        </div>
        <div>
          <p className="text-white text-sm font-medium">{doc.name}</p>
          <p className="text-gray-500 text-xs">{formatDate(doc.date)} • {doc.size}</p>
        </div>
      </div>
      <button
        onClick={onDownload}
        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors min-h-[44px] flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download
      </button>
    </div>
  );
}

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<'tax' | 'statements' | 'agreements'>('tax');

  const handleDownload = (docName: string) => {
    // In production, this would trigger actual download
    alert(`Downloading ${docName}...`);
  };

  const tabs = [
    { id: 'tax', label: 'Tax Documents', icon: '📋', count: DEMO_DOCUMENTS.taxDocuments.length },
    { id: 'statements', label: 'Statements', icon: '📈', count: DEMO_DOCUMENTS.statements.length },
    { id: 'agreements', label: 'Agreements', icon: '📝', count: DEMO_DOCUMENTS.agreements.length },
  ];

  const getCurrentDocs = () => {
    switch (activeTab) {
      case 'tax': return DEMO_DOCUMENTS.taxDocuments;
      case 'statements': return DEMO_DOCUMENTS.statements;
      case 'agreements': return DEMO_DOCUMENTS.agreements;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Documents</h1>
        <p className="text-gray-400">Access your tax forms, statements, and agreements</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap min-h-[48px] ${
              activeTab === tab.id
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              activeTab === tab.id ? 'bg-amber-500/30' : 'bg-white/10'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tax Season Notice */}
      {activeTab === 'tax' && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-xl">ℹ️</span>
            <div>
              <p className="text-blue-400 font-medium text-sm">Tax Season 2025</p>
              <p className="text-blue-300/80 text-sm">
                Your 2025 tax documents are now available. Please consult with your tax professional for filing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="space-y-3">
        {getCurrentDocs().map((doc) => (
          <DocumentCard 
            key={doc.id} 
            doc={doc} 
            onDownload={() => handleDownload(doc.name)}
          />
        ))}
      </div>

      {/* Help Section */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 mt-8">
        <h3 className="text-white font-medium mb-2">Need a document?</h3>
        <p className="text-gray-400 text-sm mb-4">
          Can't find what you're looking for? Contact your advisor and we'll help you get it.
        </p>
        <a
          href="/c/DEMO-JS123/contact"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-medium rounded-lg transition-colors min-h-[44px]"
        >
          Contact Advisor
        </a>
      </div>
    </div>
  );
}
