'use client';

import { Receipt, TrendingDown, PiggyBank, Calendar, ArrowRight } from 'lucide-react';

// Demo tax data
const TAX_DATA = {
  currentYear: 2026,
  projectedIncome: 285000,
  projectedTax: 62500,
  effectiveRate: 21.9,
  marginalBracket: 32,
  opportunities: [
    {
      id: 1,
      type: 'tax-loss',
      title: 'Tax-Loss Harvesting',
      description: 'Harvest losses in VXUS position to offset gains',
      potentialSavings: 1200,
      deadline: 'Year-end',
      status: 'available',
    },
    {
      id: 2,
      type: 'roth',
      title: 'Roth Conversion Opportunity',
      description: 'Lower income this year creates conversion window',
      potentialSavings: 3500,
      deadline: 'Dec 31, 2026',
      status: 'recommended',
    },
    {
      id: 3,
      type: 'charity',
      title: 'Charitable Giving Strategy',
      description: 'Bunch donations using donor-advised fund',
      potentialSavings: 2800,
      deadline: 'Year-end',
      status: 'available',
    },
  ],
  recentActions: [
    { date: '2026-01-27', action: 'Harvested $1,200 tax loss in VXUS', savings: 300 },
    { date: '2025-12-15', action: 'Completed Roth conversion ($15,000)', savings: 2100 },
    { date: '2025-11-20', action: 'Donated appreciated stock to DAF', savings: 1850 },
  ],
  ytdSavings: 4250,
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

function getStatusColor(status: string) {
  switch (status) {
    case 'recommended': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
    case 'available': return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
    default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  }
}

export default function TaxPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Tax Planning</h1>
        <p className="text-gray-400">{TAX_DATA.currentYear} projections and optimization opportunities</p>
      </div>

      {/* Tax Savings Banner */}
      <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-500/20 rounded-2xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Tax Alpha This Year</p>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(TAX_DATA.ytdSavings)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Potential additional savings</p>
            <p className="text-xl font-bold text-white">
              {formatCurrency(TAX_DATA.opportunities.reduce((sum, o) => sum + o.potentialSavings, 0))}
            </p>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-gray-400 text-sm">Projected Income</p>
          <p className="text-xl font-bold text-white">{formatCurrency(TAX_DATA.projectedIncome)}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-gray-400 text-sm">Est. Tax Liability</p>
          <p className="text-xl font-bold text-white">{formatCurrency(TAX_DATA.projectedTax)}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-gray-400 text-sm">Effective Rate</p>
          <p className="text-xl font-bold text-white">{TAX_DATA.effectiveRate}%</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-gray-400 text-sm">Marginal Bracket</p>
          <p className="text-xl font-bold text-white">{TAX_DATA.marginalBracket}%</p>
        </div>
      </div>

      {/* Opportunities */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-gray-400" />
          Tax Optimization Opportunities
        </h2>
        <div className="space-y-4">
          {TAX_DATA.opportunities.map((opp) => (
            <div 
              key={opp.id} 
              className={`p-4 rounded-xl border ${getStatusColor(opp.status)}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-medium">{opp.title}</h3>
                    {opp.status === 'recommended' && (
                      <span className="text-xs px-2 py-0.5 bg-emerald-500/30 text-emerald-300 rounded">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{opp.description}</p>
                  <p className="text-gray-500 text-xs mt-2">
                    <Calendar className="w-3 h-3 inline mr-1" />
                    Deadline: {opp.deadline}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-semibold">~{formatCurrency(opp.potentialSavings)}</p>
                  <p className="text-gray-500 text-xs">potential savings</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Actions */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-gray-400" />
          Recent Tax Actions
        </h2>
        <div className="space-y-3">
          {TAX_DATA.recentActions.map((action, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div>
                <p className="text-white text-sm">{action.action}</p>
                <p className="text-gray-500 text-xs">{new Date(action.date).toLocaleDateString()}</p>
              </div>
              <span className="text-emerald-400 font-medium text-sm">
                ~{formatCurrency(action.savings)} saved
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-500/20 rounded-2xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-white font-semibold mb-1">Year-End Tax Planning</h3>
            <p className="text-gray-400 text-sm">Let's review opportunities before December 31</p>
          </div>
          <button className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors flex items-center gap-2 min-h-[44px]">
            Schedule Review <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-center text-gray-500 text-xs px-4">
        <p>Tax projections are estimates based on current information. Consult your tax advisor for specific advice. 
        Maven does not provide tax, legal, or accounting advice.</p>
      </div>
    </div>
  );
}
