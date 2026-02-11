'use client';

import { Landmark, FileText, Users, Shield, AlertCircle } from 'lucide-react';

// Demo estate planning data
const ESTATE_DATA = {
  lastReview: '2025-08-15',
  nextReview: '2026-08-15',
  documents: [
    { name: 'Revocable Living Trust', status: 'current', lastUpdated: '2025-08-15' },
    { name: 'Pour-Over Will', status: 'current', lastUpdated: '2025-08-15' },
    { name: 'Healthcare Directive', status: 'needs-review', lastUpdated: '2023-03-10' },
    { name: 'Financial Power of Attorney', status: 'current', lastUpdated: '2025-08-15' },
    { name: 'HIPAA Authorization', status: 'current', lastUpdated: '2025-08-15' },
  ],
  beneficiaries: [
    { name: 'Sarah Chen (Spouse)', percentage: 100, type: 'Primary', accounts: 'All accounts' },
    { name: 'Emily Chen (Daughter)', percentage: 50, type: 'Contingent', accounts: 'All accounts' },
    { name: 'Michael Chen (Son)', percentage: 50, type: 'Contingent', accounts: 'All accounts' },
  ],
  trusts: [
    { name: 'Chen Family Trust', type: 'Revocable Living Trust', funded: true, value: '$1.2M' },
    { name: 'Chen Education Trust', type: '529 Plan', funded: true, value: '$85,000' },
  ],
};

function getStatusColor(status: string) {
  switch (status) {
    case 'current': return 'text-emerald-400 bg-emerald-500/20';
    case 'needs-review': return 'text-amber-400 bg-amber-500/20';
    case 'expired': return 'text-red-400 bg-red-500/20';
    default: return 'text-gray-400 bg-gray-500/20';
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'current': return 'Current';
    case 'needs-review': return 'Needs Review';
    case 'expired': return 'Expired';
    default: return status;
  }
}

export default function EstatePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Estate Planning</h1>
        <p className="text-gray-400">Your estate documents and beneficiary information</p>
      </div>

      {/* Alert if review needed */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-400 font-medium">Healthcare Directive needs review</p>
          <p className="text-gray-400 text-sm mt-1">Last updated March 2023. We recommend reviewing this document with your attorney.</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Documents</p>
              <p className="text-white font-semibold">{ESTATE_DATA.documents.length} on file</p>
            </div>
          </div>
          <p className="text-gray-500 text-xs">Last review: {new Date(ESTATE_DATA.lastReview).toLocaleDateString()}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Beneficiaries</p>
              <p className="text-white font-semibold">{ESTATE_DATA.beneficiaries.length} designated</p>
            </div>
          </div>
          <p className="text-gray-500 text-xs">Primary: {ESTATE_DATA.beneficiaries[0]?.name.split(' ')[0]}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Trusts</p>
              <p className="text-white font-semibold">{ESTATE_DATA.trusts.length} established</p>
            </div>
          </div>
          <p className="text-gray-500 text-xs">All trusts funded</p>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-400" />
          Estate Documents
        </h2>
        <div className="space-y-3">
          {ESTATE_DATA.documents.map((doc, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div>
                <p className="text-white font-medium">{doc.name}</p>
                <p className="text-gray-500 text-sm">Updated {new Date(doc.lastUpdated).toLocaleDateString()}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                {getStatusLabel(doc.status)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Beneficiaries */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-400" />
          Beneficiaries
        </h2>
        <div className="space-y-3">
          {ESTATE_DATA.beneficiaries.map((ben, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div>
                <p className="text-white font-medium">{ben.name}</p>
                <p className="text-gray-500 text-sm">{ben.accounts}</p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  ben.type === 'Primary' ? 'text-teal-400 bg-teal-500/20' : 'text-gray-400 bg-gray-500/20'
                }`}>
                  {ben.type}
                </span>
                <p className="text-gray-400 text-sm mt-1">{ben.percentage}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trusts */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Landmark className="w-5 h-5 text-gray-400" />
          Trusts
        </h2>
        <div className="space-y-3">
          {ESTATE_DATA.trusts.map((trust, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div>
                <p className="text-white font-medium">{trust.name}</p>
                <p className="text-gray-500 text-sm">{trust.type}</p>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">{trust.value}</p>
                <span className="text-emerald-400 text-xs">✓ Funded</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact advisor */}
      <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/20 rounded-2xl p-5 text-center">
        <p className="text-gray-300 mb-3">Questions about your estate plan?</p>
        <p className="text-white font-medium">Your advisor can coordinate with your estate attorney</p>
      </div>
    </div>
  );
}
