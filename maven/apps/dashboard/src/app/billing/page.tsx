'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

const PLANS = [
  {
    id: 'basic',
    name: 'Maven Basic',
    price: 0,
    period: 'forever',
    features: [
      'Portfolio overview',
      'Basic retirement calculator',
      'Market Fragility Index',
      'Limited AI insights (5/month)',
    ],
    current: false,
  },
  {
    id: 'pro',
    name: 'Maven Pro',
    price: 29,
    period: 'month',
    features: [
      'Everything in Basic',
      'Unlimited AI insights',
      'Tax-loss harvesting scanner',
      'What-If scenario engine',
      'Plaid account linking',
      'Priority support',
    ],
    current: true,
    popular: true,
  },
  {
    id: 'partners',
    name: 'Maven Partners',
    price: null,
    period: 'AUM',
    features: [
      'Everything in Pro',
      'Personal financial advisor',
      'Schwab direct integration',
      'Family dashboard',
      'Unlimited accounts',
      'Concierge support',
    ],
    current: false,
  },
];

const MOCK_INVOICES = [
  { id: '1', date: new Date('2026-02-01'), amount: 29, status: 'paid' },
  { id: '2', date: new Date('2026-01-01'), amount: 29, status: 'paid' },
  { id: '3', date: new Date('2025-12-01'), amount: 29, status: 'paid' },
  { id: '4', date: new Date('2025-11-01'), amount: 29, status: 'paid' },
];

export default function BillingPage() {
  const [showChangePlan, setShowChangePlan] = useState(false);
  
  const currentPlan = PLANS.find(p => p.current);
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Billing</h1>
          <p className="text-gray-400 mt-1">Manage your subscription and payment methods</p>
        </div>
        
        {/* Current Plan */}
        <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-indigo-300 text-sm">Current Plan</p>
              <h2 className="text-2xl font-bold text-white">{currentPlan?.name}</h2>
              <p className="text-gray-400 mt-1">
                ${currentPlan?.price}/month • Renews Feb 1, 2026
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowChangePlan(true)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
              >
                Change Plan
              </button>
              <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition">
                Cancel
              </button>
            </div>
          </div>
          
          {/* Feature list */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-sm text-gray-400 mb-3">Your plan includes:</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {currentPlan?.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <span className="text-emerald-400">✓</span>
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Payment Method */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Payment Method</h3>
          
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded flex items-center justify-center text-white text-xs font-bold">
                VISA
              </div>
              <div>
                <p className="text-white">•••• •••• •••• 4242</p>
                <p className="text-sm text-gray-500">Expires 12/2028</p>
              </div>
            </div>
            <button className="text-sm text-indigo-400 hover:text-indigo-300 transition">
              Update
            </button>
          </div>
          
          <button className="mt-4 text-sm text-gray-500 hover:text-gray-400 transition">
            + Add payment method
          </button>
        </div>
        
        {/* Billing History */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">Billing History</h3>
          </div>
          
          <div className="divide-y divide-white/5">
            {MOCK_INVOICES.map(invoice => (
              <div key={invoice.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg">
                    📄
                  </div>
                  <div>
                    <p className="text-white">Maven Pro - Monthly</p>
                    <p className="text-sm text-gray-500">
                      {invoice.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-white">${invoice.amount}.00</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      invoice.status === 'paid' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {invoice.status === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                  <button className="text-sm text-gray-500 hover:text-gray-400 transition">
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Tax Info */}
        <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-sm text-gray-400">
            💡 <strong className="text-white">Tax deduction:</strong> Maven Pro may be tax-deductible as an investment expense. 
            Consult your tax advisor for details.
          </p>
        </div>
      </main>
      
      {/* Change Plan Modal */}
      {showChangePlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Change Plan</h2>
              <button
                onClick={() => setShowChangePlan(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                ✕
              </button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              {PLANS.map(plan => (
                <div
                  key={plan.id}
                  className={`rounded-xl border p-4 ${
                    plan.current
                      ? 'bg-indigo-600/20 border-indigo-500'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  } transition`}
                >
                  {plan.popular && (
                    <span className="inline-block px-2 py-1 bg-indigo-500 text-white text-xs rounded-full mb-3">
                      Current
                    </span>
                  )}
                  
                  <h3 className="font-semibold text-white">{plan.name}</h3>
                  <div className="mt-2 mb-4">
                    {plan.price !== null ? (
                      <p className="text-2xl font-bold text-white">
                        ${plan.price}<span className="text-sm font-normal text-gray-400">/{plan.period}</span>
                      </p>
                    ) : (
                      <p className="text-lg text-white">Custom pricing</p>
                    )}
                  </div>
                  
                  <ul className="space-y-2 mb-4">
                    {plan.features.slice(0, 4).map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="text-emerald-400">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    className={`w-full py-2 rounded-lg transition ${
                      plan.current
                        ? 'bg-white/10 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                    disabled={plan.current}
                  >
                    {plan.current ? 'Current Plan' : plan.price === null ? 'Contact Sales' : 'Switch'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
