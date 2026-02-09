'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import AllocationRing from '../components/AllocationRing';

interface Beneficiary {
  id: string;
  name: string;
  relationship: string;
  percentage: number;
  accounts: string[];
}

const MOCK_BENEFICIARIES: Beneficiary[] = [
  { id: '1', name: 'Sammie Adams', relationship: 'Spouse', percentage: 50, accounts: ['401k', 'IRA', 'Brokerage'] },
  { id: '2', name: 'Banks Adams', relationship: 'Son', percentage: 25, accounts: ['529 Plan'] },
  { id: '3', name: 'Navy Adams', relationship: 'Daughter', percentage: 25, accounts: ['529 Plan'] },
];

const ESTATE_DOCUMENTS = [
  { name: 'Last Will & Testament', status: 'current', lastUpdated: '2024-06-15', icon: '📜' },
  { name: 'Revocable Living Trust', status: 'current', lastUpdated: '2024-06-15', icon: '🏛️' },
  { name: 'Healthcare Power of Attorney', status: 'current', lastUpdated: '2024-06-15', icon: '🏥' },
  { name: 'Financial Power of Attorney', status: 'current', lastUpdated: '2024-06-15', icon: '💼' },
  { name: 'HIPAA Authorization', status: 'needs_review', lastUpdated: '2022-01-10', icon: '📋' },
  { name: 'Beneficiary Designations', status: 'needs_review', lastUpdated: '2023-03-20', icon: '👥' },
];

const ACCOUNT_BENEFICIARIES = [
  { account: '401(k) - Capital Group', primary: 'Sammie Adams (100%)', contingent: 'Banks & Navy (50/50)' },
  { account: 'Traditional IRA - Schwab', primary: 'Sammie Adams (100%)', contingent: 'Banks & Navy (50/50)' },
  { account: 'Brokerage - Schwab', primary: 'TOD: Sammie Adams', contingent: 'N/A' },
  { account: 'Life Insurance - $1M', primary: 'Sammie Adams (100%)', contingent: 'Adams Family Trust' },
];

export default function EstatePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'beneficiaries'>('overview');
  
  const totalEstate = 797500 + 1000000; // Net worth + life insurance
  const estateTaxExemption = 13610000; // 2024 federal exemption
  const isOverExemption = totalEstate > estateTaxExemption;
  
  const allocationData = [
    { label: 'Spouse', value: 50, color: '#6366f1', amount: totalEstate * 0.5 },
    { label: 'Children', value: 50, color: '#8b5cf6', amount: totalEstate * 0.5 },
  ];
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Estate Planning</h1>
          <p className="text-gray-400 mt-1">Protect your legacy and ensure your wishes are honored</p>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'documents', label: 'Documents' },
            { key: 'beneficiaries', label: 'Beneficiaries' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition ${
                activeTab === tab.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Estate Summary */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Estate Distribution</h3>
                <div className="flex justify-center">
                  <AllocationRing
                    segments={allocationData}
                    size={180}
                    strokeWidth={20}
                    animated={true}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 rounded-2xl p-5">
                  <p className="text-emerald-300 text-sm mb-1">Total Estate Value</p>
                  <p className="text-3xl font-bold text-white">$2.15M</p>
                  <p className="text-sm text-emerald-400 mt-1">Net worth + Life insurance</p>
                </div>
                
                <div className={`rounded-2xl p-5 ${
                  isOverExemption 
                    ? 'bg-red-500/10 border border-red-500/30' 
                    : 'bg-[#12121a] border border-white/10'
                }`}>
                  <p className={`text-sm mb-1 ${isOverExemption ? 'text-red-300' : 'text-gray-400'}`}>
                    Estate Tax Status
                  </p>
                  <p className="text-xl font-bold text-white">
                    {isOverExemption ? 'May owe estate tax' : 'Below exemption'}
                  </p>
                  <p className={`text-sm mt-1 ${isOverExemption ? 'text-red-400' : 'text-gray-500'}`}>
                    2024 exemption: $13.61M
                  </p>
                </div>
              </div>
            </div>
            
            {/* Document Status */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Document Status</h3>
                <Link href="/documents" className="text-sm text-indigo-400">View all →</Link>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-3">
                {ESTATE_DOCUMENTS.slice(0, 4).map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{doc.icon}</span>
                      <span className="text-white text-sm">{doc.name}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      doc.status === 'current'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {doc.status === 'current' ? 'Current' : 'Review'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Insights */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <p className="font-medium text-white">Review Beneficiaries</p>
                    <p className="text-sm text-amber-200/70 mt-1">
                      2 accounts haven't been reviewed in over 2 years. Life changes may require updates.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <p className="font-medium text-white">Consider a Trust</p>
                    <p className="text-sm text-indigo-200/70 mt-1">
                      With your net worth, a revocable living trust could help avoid probate and provide privacy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Estate Documents</h3>
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-xl transition">
                + Upload Document
              </button>
            </div>
            
            <div className="divide-y divide-white/5">
              {ESTATE_DOCUMENTS.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 hover:bg-white/5 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl">
                      {doc.icon}
                    </div>
                    <div>
                      <p className="font-medium text-white">{doc.name}</p>
                      <p className="text-sm text-gray-500">
                        Last updated: {new Date(doc.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      doc.status === 'current'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {doc.status === 'current' ? 'Current' : 'Needs Review'}
                    </span>
                    <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                      📥
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Beneficiaries Tab */}
        {activeTab === 'beneficiaries' && (
          <div className="space-y-6">
            {/* Account Beneficiaries */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">Account Beneficiaries</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-sm font-medium text-gray-500">Account</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-500">Primary</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-500">Contingent</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {ACCOUNT_BENEFICIARIES.map((acc, idx) => (
                      <tr key={idx} className="hover:bg-white/5">
                        <td className="p-4 text-white">{acc.account}</td>
                        <td className="p-4 text-gray-300">{acc.primary}</td>
                        <td className="p-4 text-gray-400">{acc.contingent}</td>
                        <td className="p-4">
                          <button className="text-indigo-400 hover:text-indigo-300 text-sm">
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Beneficiary Summary */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Beneficiary Summary</h3>
              
              <div className="grid sm:grid-cols-3 gap-4">
                {MOCK_BENEFICIARIES.map((ben) => (
                  <div key={ben.id} className="p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {ben.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-white">{ben.name}</p>
                        <p className="text-xs text-gray-500">{ben.relationship}</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-white mb-1">{ben.percentage}%</p>
                    <p className="text-xs text-gray-500">{ben.accounts.join(', ')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
