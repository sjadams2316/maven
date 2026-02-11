'use client';

import { Heart, Gift, Building2, TrendingUp, Calendar } from 'lucide-react';

// Demo philanthropy data
const PHILANTHROPY_DATA = {
  daf: {
    name: 'Chen Family Charitable Fund',
    provider: 'Fidelity Charitable',
    balance: 45000,
    contributions2026: 15000,
    grants2026: 8500,
  },
  yearlyGiving: 12500,
  taxDeduction: 4375,
  charities: [
    { name: 'Local Food Bank', amount: 3000, type: 'Grant from DAF', date: '2026-01-15' },
    { name: 'University Scholarship Fund', amount: 5000, type: 'Grant from DAF', date: '2025-12-01' },
    { name: 'Children\'s Hospital', amount: 2500, type: 'Direct donation', date: '2025-11-20' },
    { name: 'Environmental Conservation Trust', amount: 2000, type: 'Grant from DAF', date: '2025-10-15' },
  ],
  strategies: [
    {
      title: 'Donate Appreciated Stock',
      description: 'Donate long-term appreciated securities to avoid capital gains tax while receiving full fair market value deduction.',
      benefit: 'Double tax benefit',
    },
    {
      title: 'Bunching Strategy',
      description: 'Bunch multiple years of donations into one year to exceed standard deduction, then skip giving in alternate years.',
      benefit: 'Maximize itemized deductions',
    },
    {
      title: 'Qualified Charitable Distribution',
      description: 'If over 70½, donate directly from IRA to charity (up to $100K) to satisfy RMD without increasing taxable income.',
      benefit: 'Reduce taxable income',
    },
  ],
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

export default function PhilanthropyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Philanthropy</h1>
        <p className="text-gray-400">Your charitable giving and impact</p>
      </div>

      {/* DAF Card */}
      <div className="bg-gradient-to-r from-pink-900/30 to-rose-900/30 border border-pink-500/20 rounded-2xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold">{PHILANTHROPY_DATA.daf.name}</h2>
              <p className="text-gray-400 text-sm">{PHILANTHROPY_DATA.daf.provider}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Balance</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(PHILANTHROPY_DATA.daf.balance)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Contributed (2026)</p>
            <p className="text-xl font-bold text-emerald-400">+{formatCurrency(PHILANTHROPY_DATA.daf.contributions2026)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Granted (2026)</p>
            <p className="text-xl font-bold text-pink-400">-{formatCurrency(PHILANTHROPY_DATA.daf.grants2026)}</p>
          </div>
        </div>
      </div>

      {/* Impact Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <Gift className="w-5 h-5 text-pink-400" />
            <p className="text-gray-400">Total Giving (12 months)</p>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(PHILANTHROPY_DATA.yearlyGiving)}</p>
          <p className="text-gray-500 text-sm mt-1">{PHILANTHROPY_DATA.charities.length} organizations supported</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <p className="text-gray-400">Tax Benefit</p>
          </div>
          <p className="text-2xl font-bold text-emerald-400">~{formatCurrency(PHILANTHROPY_DATA.taxDeduction)}</p>
          <p className="text-gray-500 text-sm mt-1">Estimated deduction value</p>
        </div>
      </div>

      {/* Recent Giving */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-gray-400" />
          Organizations You Support
        </h2>
        <div className="space-y-3">
          {PHILANTHROPY_DATA.charities.map((charity, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div>
                <p className="text-white font-medium">{charity.name}</p>
                <p className="text-gray-500 text-xs">{charity.type} • {new Date(charity.date).toLocaleDateString()}</p>
              </div>
              <span className="text-pink-400 font-semibold">{formatCurrency(charity.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Strategies */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4">Tax-Smart Giving Strategies</h2>
        <div className="space-y-4">
          {PHILANTHROPY_DATA.strategies.map((strategy, i) => (
            <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-white font-medium mb-1">{strategy.title}</h3>
                  <p className="text-gray-400 text-sm">{strategy.description}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded whitespace-nowrap">
                  {strategy.benefit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Year-end reminder */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-amber-400 font-medium mb-1">Year-End Giving Reminder</h3>
            <p className="text-gray-400 text-sm">
              Contributions must be completed by December 31 to count toward this year's tax deduction. 
              Consider donating appreciated securities for additional tax benefits.
            </p>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="text-center text-gray-500 text-sm">
        <p>Questions about your charitable giving strategy? Your advisor can help optimize your impact.</p>
      </div>
    </div>
  );
}
