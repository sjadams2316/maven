'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import ProgressRing from '../components/ProgressRing';

interface Debt {
  id: string;
  name: string;
  type: 'mortgage' | 'auto' | 'student' | 'credit' | 'personal';
  balance: number;
  originalAmount: number;
  interestRate: number;
  minimumPayment: number;
  dueDate: number;
}

const MOCK_DEBTS: Debt[] = [
  {
    id: '1',
    name: 'Primary Mortgage',
    type: 'mortgage',
    balance: 485000,
    originalAmount: 650000,
    interestRate: 3.25,
    minimumPayment: 2850,
    dueDate: 1,
  },
  {
    id: '2',
    name: 'Tesla Model Y',
    type: 'auto',
    balance: 32000,
    originalAmount: 58000,
    interestRate: 4.9,
    minimumPayment: 850,
    dueDate: 15,
  },
];

const TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  mortgage: { icon: '🏠', color: 'from-blue-500 to-cyan-500' },
  auto: { icon: '🚗', color: 'from-emerald-500 to-teal-500' },
  student: { icon: '🎓', color: 'from-purple-500 to-pink-500' },
  credit: { icon: '💳', color: 'from-red-500 to-rose-500' },
  personal: { icon: '💰', color: 'from-amber-500 to-orange-500' },
};

function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(2)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}

export default function DebtPage() {
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [extraPayment, setExtraPayment] = useState(0);
  
  const totalDebt = MOCK_DEBTS.reduce((sum, d) => sum + d.balance, 0);
  const totalOriginal = MOCK_DEBTS.reduce((sum, d) => sum + d.originalAmount, 0);
  const totalPaid = totalOriginal - totalDebt;
  const paidPercent = (totalPaid / totalOriginal) * 100;
  const totalMinimum = MOCK_DEBTS.reduce((sum, d) => sum + d.minimumPayment, 0);
  
  // Calculate payoff dates
  const calculatePayoffMonths = (debt: Debt, extraMonthly: number = 0) => {
    const monthlyRate = debt.interestRate / 100 / 12;
    const payment = debt.minimumPayment + extraMonthly;
    
    if (payment <= debt.balance * monthlyRate) return Infinity;
    
    const months = Math.log(payment / (payment - debt.balance * monthlyRate)) / Math.log(1 + monthlyRate);
    return Math.ceil(months);
  };
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Debt Tracker</h1>
          <p className="text-gray-400 mt-1">Track and optimize your debt payoff</p>
        </div>
        
        {/* Summary */}
        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          {/* Progress Ring */}
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center">
            <ProgressRing
              progress={paidPercent}
              size={160}
              strokeWidth={16}
              color="gradient"
              label="Paid Off"
              sublabel={formatCurrency(totalPaid)}
              animated={true}
              glowing={true}
            />
          </div>
          
          {/* Stats */}
          <div className="sm:col-span-2 grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-red-900/40 to-rose-900/40 border border-red-500/30 rounded-2xl p-5">
              <p className="text-red-300 text-sm mb-1">Total Debt</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(totalDebt)}</p>
              <p className="text-sm text-red-400 mt-1">{MOCK_DEBTS.length} accounts</p>
            </div>
            
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-5">
              <p className="text-gray-400 text-sm mb-1">Monthly Minimum</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(totalMinimum)}</p>
              <p className="text-sm text-gray-500 mt-1">Due monthly</p>
            </div>
            
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-5">
              <p className="text-gray-400 text-sm mb-1">Avg Interest Rate</p>
              <p className="text-3xl font-bold text-white">
                {(MOCK_DEBTS.reduce((sum, d) => sum + d.interestRate * d.balance, 0) / totalDebt).toFixed(2)}%
              </p>
              <p className="text-sm text-gray-500 mt-1">Weighted</p>
            </div>
            
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5">
              <p className="text-emerald-400 text-sm mb-1">Debt-Free Date</p>
              <p className="text-3xl font-bold text-white">Dec 2038</p>
              <p className="text-sm text-emerald-400 mt-1">~12 years</p>
            </div>
          </div>
        </div>
        
        {/* Debts List */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden mb-8">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Your Debts</h2>
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-xl transition">
              + Add Debt
            </button>
          </div>
          
          <div className="divide-y divide-white/5">
            {MOCK_DEBTS.map((debt) => {
              const config = TYPE_CONFIG[debt.type];
              const paidPercent = ((debt.originalAmount - debt.balance) / debt.originalAmount) * 100;
              const payoffMonths = calculatePayoffMonths(debt);
              
              return (
                <div
                  key={debt.id}
                  onClick={() => setSelectedDebt(debt)}
                  className="p-5 hover:bg-white/5 transition cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-2xl`}>
                      {config.icon}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-white">{debt.name}</h3>
                        <span className="text-xl font-bold text-white">
                          {formatCurrency(debt.balance)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          {debt.interestRate}% APR • ${debt.minimumPayment}/mo
                        </span>
                        <span className="text-gray-500">
                          {payoffMonths < Infinity ? `~${Math.ceil(payoffMonths / 12)} years left` : '—'}
                        </span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${config.color} rounded-full transition-all`}
                            style={{ width: `${paidPercent}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-600 mt-1">
                          <span>{paidPercent.toFixed(0)}% paid</span>
                          <span>{formatCurrency(debt.originalAmount)} original</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Payoff Strategies */}
        <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Payoff Strategies</h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">❄️</span>
                <h4 className="font-medium text-white">Debt Avalanche</h4>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Pay highest interest rate first. Saves the most money overall.
              </p>
              <p className="text-sm text-emerald-400">Save ~$12,400 in interest</p>
            </div>
            
            <div className="p-4 bg-white/5 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">⛷️</span>
                <h4 className="font-medium text-white">Debt Snowball</h4>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Pay smallest balance first. Quick wins for motivation.
              </p>
              <p className="text-sm text-blue-400">Pay off auto loan in 3 years</p>
            </div>
          </div>
          
          {/* Extra Payment Calculator */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <h4 className="font-medium text-white mb-3">Extra Payment Impact</h4>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="2000"
                step="100"
                value={extraPayment}
                onChange={(e) => setExtraPayment(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-white font-medium w-24">+${extraPayment}/mo</span>
            </div>
            {extraPayment > 0 && (
              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <p className="text-emerald-400 text-sm">
                  💡 With ${extraPayment}/mo extra, you could be debt-free{' '}
                  <strong>2 years earlier</strong> and save <strong>$8,200</strong> in interest!
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
