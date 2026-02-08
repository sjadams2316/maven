'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import SparklineChart from '../components/SparklineChart';

interface IncomeSource {
  id: string;
  name: string;
  type: 'salary' | 'bonus' | 'investment' | 'rental' | 'business' | 'other';
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'annually' | 'one-time';
  taxable: boolean;
  projected?: boolean;
}

const MOCK_INCOME: IncomeSource[] = [
  { id: '1', name: 'Capital Group Salary', type: 'salary', amount: 50000, frequency: 'monthly', taxable: true },
  { id: '2', name: 'Annual Bonus', type: 'bonus', amount: 120000, frequency: 'annually', taxable: true, projected: true },
  { id: '3', name: 'Dividend Income', type: 'investment', amount: 850, frequency: 'quarterly', taxable: true },
  { id: '4', name: 'Sammie\'s Business', type: 'business', amount: 10000, frequency: 'monthly', taxable: true },
];

const MONTHLY_INCOME = [52000, 55000, 53000, 58000, 54000, 62000, 56000, 58000, 55000, 60000, 57000, 65000];

const TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  salary: { icon: '💼', color: 'from-blue-500 to-cyan-500', label: 'Salary' },
  bonus: { icon: '🎁', color: 'from-emerald-500 to-teal-500', label: 'Bonus' },
  investment: { icon: '📈', color: 'from-purple-500 to-pink-500', label: 'Investment' },
  rental: { icon: '🏠', color: 'from-amber-500 to-orange-500', label: 'Rental' },
  business: { icon: '🏪', color: 'from-indigo-500 to-purple-500', label: 'Business' },
  other: { icon: '💰', color: 'from-gray-500 to-gray-600', label: 'Other' },
};

function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}

function calculateAnnual(source: IncomeSource): number {
  switch (source.frequency) {
    case 'monthly': return source.amount * 12;
    case 'quarterly': return source.amount * 4;
    case 'annually': return source.amount;
    case 'one-time': return source.amount;
    default: return source.amount;
  }
}

export default function IncomePage() {
  const [showAddModal, setShowAddModal] = useState(false);
  
  const totalAnnualIncome = MOCK_INCOME.reduce((sum, s) => sum + calculateAnnual(s), 0);
  const monthlyAverage = totalAnnualIncome / 12;
  const taxableIncome = MOCK_INCOME.filter(s => s.taxable).reduce((sum, s) => sum + calculateAnnual(s), 0);
  
  // Group by type
  const byType = MOCK_INCOME.reduce((acc, source) => {
    const type = source.type;
    const annual = calculateAnnual(source);
    acc[type] = (acc[type] || 0) + annual;
    return acc;
  }, {} as Record<string, number>);
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Income</h1>
            <p className="text-gray-400 mt-1">Track all your income sources</p>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition"
          >
            + Add Income Source
          </button>
        </div>
        
        {/* Summary Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 rounded-2xl p-5">
            <p className="text-emerald-300 text-sm mb-1">Annual Income</p>
            <p className="text-3xl font-bold text-white">{formatCurrency(totalAnnualIncome)}</p>
            <p className="text-sm text-emerald-400 mt-1">{formatCurrency(monthlyAverage)}/month avg</p>
          </div>
          
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-5">
            <p className="text-gray-400 text-sm mb-1">Income Sources</p>
            <p className="text-3xl font-bold text-white">{MOCK_INCOME.length}</p>
            <p className="text-sm text-gray-500 mt-1">{MOCK_INCOME.filter(s => s.frequency === 'monthly').length} recurring</p>
          </div>
          
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-5">
            <p className="text-gray-400 text-sm mb-1">Taxable Income</p>
            <p className="text-3xl font-bold text-white">{formatCurrency(taxableIncome)}</p>
            <p className="text-sm text-gray-500 mt-1">{((taxableIncome / totalAnnualIncome) * 100).toFixed(0)}% of total</p>
          </div>
        </div>
        
        {/* Income Trend */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Monthly Income Trend</h3>
            <div className="flex items-center gap-4">
              <SparklineChart
                data={MONTHLY_INCOME}
                width={120}
                height={40}
                color="#10b981"
                animated={true}
              />
              <span className="text-emerald-400 text-sm">+8% YoY</span>
            </div>
          </div>
          
          <div className="h-48 flex items-end gap-2">
            {MONTHLY_INCOME.map((amount, idx) => {
              const maxAmount = Math.max(...MONTHLY_INCOME);
              const height = (amount / maxAmount) * 100;
              const isCurrentMonth = idx === MONTHLY_INCOME.length - 1;
              
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  <div
                    className={`w-full rounded-t transition-all ${
                      isCurrentMonth ? 'bg-emerald-500' : 'bg-emerald-600/50 hover:bg-emerald-500/50'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-gray-600">
                    {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][idx]}
                  </span>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                    {formatCurrency(amount)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Income Sources */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden mb-8">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">Income Sources</h3>
          </div>
          
          <div className="divide-y divide-white/5">
            {MOCK_INCOME.map((source) => {
              const config = TYPE_CONFIG[source.type];
              const annualAmount = calculateAnnual(source);
              const pctOfTotal = (annualAmount / totalAnnualIncome) * 100;
              
              return (
                <div key={source.id} className="p-5 hover:bg-white/5 transition">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-2xl`}>
                      {config.icon}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{source.name}</h3>
                        {source.projected && (
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                            Projected
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {config.label} • {source.frequency.charAt(0).toUpperCase() + source.frequency.slice(1)}
                        {source.taxable && ' • Taxable'}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xl font-bold text-white">{formatCurrency(source.amount)}</p>
                      <p className="text-sm text-gray-500">
                        {source.frequency !== 'annually' && `${formatCurrency(annualAmount)}/yr • `}
                        {pctOfTotal.toFixed(0)}% of total
                      </p>
                    </div>
                  </div>
                  
                  {/* Percentage bar */}
                  <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${config.color} rounded-full`}
                      style={{ width: `${pctOfTotal}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Income by Type */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">By Type</h3>
          
          <div className="grid sm:grid-cols-3 gap-4">
            {Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, amount]) => {
              const config = TYPE_CONFIG[type];
              const pct = (amount / totalAnnualIncome) * 100;
              
              return (
                <div key={type} className="p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-xl`}>
                      {config.icon}
                    </div>
                    <div>
                      <p className="font-medium text-white">{config.label}</p>
                      <p className="text-xs text-gray-500">{pct.toFixed(0)}% of income</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-white">{formatCurrency(amount)}</p>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Tips */}
        <div className="mt-6 bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="font-medium text-white">Diversify Income Streams</p>
              <p className="text-sm text-indigo-200/70 mt-1">
                Your income is {((byType.salary || 0) / totalAnnualIncome * 100).toFixed(0)}% from salary. 
                Consider passive income sources like dividends or rental properties for financial independence.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      {/* Add Modal (placeholder) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Add Income Source</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-lg">✕</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Name</label>
                <input
                  type="text"
                  placeholder="e.g., Rental Property"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Amount</label>
                  <input
                    type="number"
                    placeholder="$0"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Frequency</label>
                  <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500">
                    <option>Monthly</option>
                    <option>Quarterly</option>
                    <option>Annually</option>
                    <option>One-time</option>
                  </select>
                </div>
              </div>
              
              <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition">
                Add Income Source
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
