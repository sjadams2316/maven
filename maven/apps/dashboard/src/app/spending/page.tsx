'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import AllocationRing from '../components/AllocationRing';
import SparklineChart from '../components/SparklineChart';

interface SpendingCategory {
  name: string;
  amount: number;
  budget: number;
  color: string;
  icon: string;
  transactions: number;
}

const MOCK_SPENDING: SpendingCategory[] = [
  { name: 'Housing', amount: 4200, budget: 4500, color: '#6366f1', icon: '🏠', transactions: 2 },
  { name: 'Food & Dining', amount: 1850, budget: 1500, color: '#f59e0b', icon: '🍽️', transactions: 45 },
  { name: 'Transportation', amount: 680, budget: 800, color: '#10b981', icon: '🚗', transactions: 12 },
  { name: 'Shopping', amount: 920, budget: 500, color: '#ef4444', icon: '🛍️', transactions: 23 },
  { name: 'Entertainment', amount: 340, budget: 400, color: '#8b5cf6', icon: '🎬', transactions: 8 },
  { name: 'Health', amount: 280, budget: 300, color: '#06b6d4', icon: '💊', transactions: 4 },
  { name: 'Subscriptions', amount: 185, budget: 200, color: '#ec4899', icon: '📱', transactions: 15 },
  { name: 'Other', amount: 445, budget: 500, color: '#64748b', icon: '📦', transactions: 11 },
];

const MONTHLY_TOTALS = [7200, 8100, 7800, 8500, 9200, 8400, 7950, 8800, 8200, 8600, 9100, 8900];

const RECENT_TRANSACTIONS = [
  { name: 'Whole Foods', category: 'Food & Dining', amount: 127.43, date: '2h ago', icon: '🥑' },
  { name: 'Amazon', category: 'Shopping', amount: 89.99, date: '5h ago', icon: '📦' },
  { name: 'Tesla Charging', category: 'Transportation', amount: 18.50, date: '1d ago', icon: '⚡' },
  { name: 'Netflix', category: 'Subscriptions', amount: 22.99, date: '2d ago', icon: '🎬' },
  { name: 'Trader Joe\'s', category: 'Food & Dining', amount: 94.21, date: '2d ago', icon: '🛒' },
];

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function SpendingPage() {
  const [selectedMonth, setSelectedMonth] = useState('February 2026');
  
  const totalSpent = MOCK_SPENDING.reduce((sum, c) => sum + c.amount, 0);
  const totalBudget = MOCK_SPENDING.reduce((sum, c) => sum + c.budget, 0);
  const budgetUsed = (totalSpent / totalBudget) * 100;
  
  const overBudgetCategories = MOCK_SPENDING.filter(c => c.amount > c.budget);
  const underBudgetCategories = MOCK_SPENDING.filter(c => c.amount <= c.budget);
  
  const allocationData = MOCK_SPENDING.map(c => ({
    label: c.name,
    value: c.amount,
    color: c.color,
    amount: c.amount,
  }));
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Spending</h1>
            <p className="text-gray-400 mt-1">Track where your money goes</p>
          </div>
          
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
          >
            <option>February 2026</option>
            <option>January 2026</option>
            <option>December 2025</option>
          </select>
        </div>
        
        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Spending Donut */}
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">By Category</h3>
            <div className="flex justify-center">
              <AllocationRing
                segments={allocationData}
                size={200}
                strokeWidth={24}
                showLabels={false}
              />
            </div>
          </div>
          
          {/* Budget Progress */}
          <div className="lg:col-span-2 bg-[#12121a] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Budget Progress</h3>
              <span className={`text-sm ${budgetUsed > 100 ? 'text-red-400' : 'text-emerald-400'}`}>
                {budgetUsed.toFixed(0)}% used
              </span>
            </div>
            
            <div className="space-y-4">
              {MOCK_SPENDING.map((category, idx) => {
                const pct = (category.amount / category.budget) * 100;
                const isOver = pct > 100;
                
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span className="text-white text-sm">{category.name}</span>
                      </div>
                      <div className="text-sm">
                        <span className={isOver ? 'text-red-400' : 'text-white'}>
                          {formatCurrency(category.amount)}
                        </span>
                        <span className="text-gray-500"> / {formatCurrency(category.budget)}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOver ? 'bg-red-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Stats Row */}
        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(totalSpent)}</p>
          </div>
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Budget</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(totalBudget)}</p>
          </div>
          <div className={`rounded-xl p-4 ${
            totalSpent > totalBudget 
              ? 'bg-red-500/10 border border-red-500/30' 
              : 'bg-emerald-500/10 border border-emerald-500/30'
          }`}>
            <p className={`text-sm mb-1 ${totalSpent > totalBudget ? 'text-red-300' : 'text-emerald-300'}`}>
              {totalSpent > totalBudget ? 'Over Budget' : 'Under Budget'}
            </p>
            <p className={`text-2xl font-bold ${totalSpent > totalBudget ? 'text-red-400' : 'text-emerald-400'}`}>
              {formatCurrency(Math.abs(totalBudget - totalSpent))}
            </p>
          </div>
          <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Transactions</p>
            <p className="text-2xl font-bold text-white">
              {MOCK_SPENDING.reduce((sum, c) => sum + c.transactions, 0)}
            </p>
          </div>
        </div>
        
        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Spending Trend */}
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Monthly Trend</h3>
            
            <div className="h-40 flex items-end gap-2">
              {MONTHLY_TOTALS.map((amount, idx) => {
                const maxAmount = Math.max(...MONTHLY_TOTALS);
                const height = (amount / maxAmount) * 100;
                const isCurrentMonth = idx === MONTHLY_TOTALS.length - 1;
                
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className={`w-full rounded-t transition-all ${
                        isCurrentMonth ? 'bg-indigo-500' : 'bg-indigo-600/50 hover:bg-indigo-500/50'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-gray-600">
                      {['M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D', 'J', 'F'][idx]}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-sm">
              <span className="text-gray-500">12-month average</span>
              <span className="text-white font-medium">
                {formatCurrency(MONTHLY_TOTALS.reduce((a, b) => a + b, 0) / 12)}
              </span>
            </div>
          </div>
          
          {/* Recent Transactions */}
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
              <button className="text-sm text-indigo-400 hover:text-indigo-300">Show more</button>
            </div>
            
            <div className="space-y-3">
              {RECENT_TRANSACTIONS.map((tx, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{tx.icon}</span>
                    <div>
                      <p className="text-white text-sm">{tx.name}</p>
                      <p className="text-xs text-gray-500">{tx.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">-{formatCurrency(tx.amount)}</p>
                    <p className="text-xs text-gray-500">{tx.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Alerts */}
        {overBudgetCategories.length > 0 && (
          <div className="mt-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-medium text-white">Over Budget Alert</p>
                <p className="text-sm text-red-200/70 mt-1">
                  {overBudgetCategories.map(c => c.name).join(', ')} {overBudgetCategories.length === 1 ? 'is' : 'are'} over budget this month.
                  Consider adjusting your spending or updating your budget.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
