'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

interface Goal {
  id: string;
  name: string;
  type: 'retirement' | 'house' | 'education' | 'travel' | 'emergency' | 'custom';
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  monthlyContribution: number;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
}

const MOCK_GOALS: Goal[] = [
  {
    id: '1',
    name: 'Retirement at 55',
    type: 'retirement',
    targetAmount: 3000000,
    currentAmount: 797500,
    targetDate: new Date('2038-09-10'),
    monthlyContribution: 5000,
    priority: 'high',
    notes: 'Target 4% withdrawal rate = $120k/year',
  },
  {
    id: '2',
    name: 'Beach House',
    type: 'house',
    targetAmount: 400000,
    currentAmount: 85000,
    targetDate: new Date('2030-06-01'),
    monthlyContribution: 2000,
    priority: 'medium',
    notes: 'Looking at OBX or Rehoboth',
  },
  {
    id: '3',
    name: 'Banks College Fund',
    type: 'education',
    targetAmount: 200000,
    currentAmount: 28000,
    targetDate: new Date('2040-08-01'),
    monthlyContribution: 500,
    priority: 'high',
  },
  {
    id: '4',
    name: 'Navy College Fund',
    type: 'education',
    targetAmount: 200000,
    currentAmount: 12000,
    targetDate: new Date('2042-08-01'),
    monthlyContribution: 500,
    priority: 'high',
  },
  {
    id: '5',
    name: 'Emergency Fund',
    type: 'emergency',
    targetAmount: 50000,
    currentAmount: 50000,
    targetDate: new Date('2025-01-01'),
    monthlyContribution: 0,
    priority: 'high',
    notes: '6 months expenses - COMPLETE',
  },
  {
    id: '6',
    name: 'Japan Trip 2027',
    type: 'travel',
    targetAmount: 15000,
    currentAmount: 4200,
    targetDate: new Date('2027-04-01'),
    monthlyContribution: 400,
    priority: 'low',
  },
];

const TYPE_CONFIG: Record<string, { icon: string; color: string; label: string }> = {
  retirement: { icon: '🏖️', color: 'from-amber-500 to-orange-500', label: 'Retirement' },
  house: { icon: '🏠', color: 'from-blue-500 to-cyan-500', label: 'Home' },
  education: { icon: '🎓', color: 'from-purple-500 to-pink-500', label: 'Education' },
  travel: { icon: '✈️', color: 'from-emerald-500 to-teal-500', label: 'Travel' },
  emergency: { icon: '🛡️', color: 'from-red-500 to-rose-500', label: 'Emergency' },
  custom: { icon: '🎯', color: 'from-indigo-500 to-purple-500', label: 'Custom' },
};

function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}

function getTimeRemaining(targetDate: Date): string {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  const years = Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  const months = Math.floor((diff % (365.25 * 24 * 60 * 60 * 1000)) / (30.44 * 24 * 60 * 60 * 1000));
  
  if (years > 0) return `${years}y ${months}m`;
  if (months > 0) return `${months} months`;
  if (diff > 0) return 'This month';
  return 'Past due';
}

function calculateProjection(goal: Goal): { onTrack: boolean; projectedAmount: number; shortfall: number } {
  const now = new Date();
  const monthsRemaining = Math.max(0, 
    (goal.targetDate.getFullYear() - now.getFullYear()) * 12 + 
    (goal.targetDate.getMonth() - now.getMonth())
  );
  
  // Simple projection: current + (monthly * months) * 1.07 (7% annual growth)
  const futureContributions = goal.monthlyContribution * monthsRemaining;
  const growthFactor = Math.pow(1.07, monthsRemaining / 12);
  const projectedAmount = (goal.currentAmount * growthFactor) + (futureContributions * ((growthFactor - 1) / (0.07 / 12)));
  
  const onTrack = projectedAmount >= goal.targetAmount;
  const shortfall = Math.max(0, goal.targetAmount - projectedAmount);
  
  return { onTrack, projectedAmount, shortfall };
}

export default function GoalsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  
  const totalTarget = MOCK_GOALS.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalCurrent = MOCK_GOALS.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallProgress = (totalCurrent / totalTarget) * 100;
  
  const completedGoals = MOCK_GOALS.filter(g => g.currentAmount >= g.targetAmount);
  const activeGoals = MOCK_GOALS.filter(g => g.currentAmount < g.targetAmount);
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Financial Goals</h1>
            <p className="text-gray-400 mt-1">Track your progress toward what matters most</p>
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition flex items-center gap-2"
          >
            <span>+</span>
            <span>Add Goal</span>
          </button>
        </div>
        
        {/* Overall Progress */}
        <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-indigo-300 text-sm">Overall Progress</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(totalCurrent)} <span className="text-lg text-gray-400">/ {formatCurrency(totalTarget)}</span></p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-white">{overallProgress.toFixed(0)}%</p>
              <p className="text-sm text-indigo-300">{completedGoals.length} of {MOCK_GOALS.length} complete</p>
            </div>
          </div>
          
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, overallProgress)}%` }}
            />
          </div>
        </div>
        
        {/* Active Goals */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Active Goals ({activeGoals.length})</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeGoals.map(goal => {
              const config = TYPE_CONFIG[goal.type];
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              const projection = calculateProjection(goal);
              
              return (
                <div
                  key={goal.id}
                  onClick={() => setSelectedGoal(goal)}
                  className="bg-[#12121a] border border-white/10 rounded-2xl p-5 hover:border-indigo-500/30 transition cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-2xl`}>
                      {config.icon}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      goal.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      goal.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {goal.priority}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-white mb-1 group-hover:text-indigo-400 transition">{goal.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{getTimeRemaining(goal.targetDate)} remaining</p>
                  
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-400">{formatCurrency(goal.currentAmount)}</span>
                      <span className="text-white font-medium">{formatCurrency(goal.targetAmount)}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${projection.onTrack ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{formatCurrency(goal.monthlyContribution)}/mo</span>
                    <span className={projection.onTrack ? 'text-emerald-400' : 'text-amber-400'}>
                      {projection.onTrack ? '✓ On track' : `${formatCurrency(projection.shortfall)} short`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>🎉</span> Completed Goals ({completedGoals.length})
            </h2>
            
            <div className="bg-[#12121a] border border-white/10 rounded-xl divide-y divide-white/5">
              {completedGoals.map(goal => {
                const config = TYPE_CONFIG[goal.type];
                
                return (
                  <div key={goal.id} className="flex items-center gap-4 p-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-xl`}>
                      {config.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{goal.name}</p>
                      <p className="text-sm text-gray-500">{config.label}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-emerald-400">{formatCurrency(goal.targetAmount)}</p>
                      <p className="text-xs text-gray-500">Completed</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      ✓
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Tips */}
        <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-sm text-gray-400">
            💡 <strong className="text-white">Tip:</strong> Goals with higher priority should be funded first. 
            Consider automating monthly contributions to stay on track.
          </p>
        </div>
      </main>
      
      {/* Goal Detail Modal */}
      {selectedGoal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${TYPE_CONFIG[selectedGoal.type].color} flex items-center justify-center text-2xl`}>
                  {TYPE_CONFIG[selectedGoal.type].icon}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{selectedGoal.name}</h2>
                  <p className="text-sm text-gray-500">{TYPE_CONFIG[selectedGoal.type].label}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedGoal(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                ✕
              </button>
            </div>
            
            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Progress</span>
                <span className="text-white font-semibold">
                  {((selectedGoal.currentAmount / selectedGoal.targetAmount) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  style={{ width: `${Math.min(100, (selectedGoal.currentAmount / selectedGoal.targetAmount) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-emerald-400">{formatCurrency(selectedGoal.currentAmount)}</span>
                <span className="text-gray-400">{formatCurrency(selectedGoal.targetAmount)}</span>
              </div>
            </div>
            
            {/* Details */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Target Date</p>
                <p className="text-white font-medium">
                  {selectedGoal.targetDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Time Remaining</p>
                <p className="text-white font-medium">{getTimeRemaining(selectedGoal.targetDate)}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Monthly Contribution</p>
                <p className="text-white font-medium">{formatCurrency(selectedGoal.monthlyContribution)}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Priority</p>
                <p className={`font-medium capitalize ${
                  selectedGoal.priority === 'high' ? 'text-red-400' :
                  selectedGoal.priority === 'medium' ? 'text-amber-400' : 'text-gray-400'
                }`}>
                  {selectedGoal.priority}
                </p>
              </div>
            </div>
            
            {/* Projection */}
            {(() => {
              const projection = calculateProjection(selectedGoal);
              return (
                <div className={`p-4 rounded-xl mb-6 ${
                  projection.onTrack 
                    ? 'bg-emerald-500/10 border border-emerald-500/30' 
                    : 'bg-amber-500/10 border border-amber-500/30'
                }`}>
                  <p className={`text-sm ${projection.onTrack ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {projection.onTrack 
                      ? `✓ On track! Projected to reach ${formatCurrency(projection.projectedAmount)} by target date.`
                      : `⚠️ May fall short by ${formatCurrency(projection.shortfall)}. Consider increasing contributions.`
                    }
                  </p>
                </div>
              );
            })()}
            
            {/* Notes */}
            {selectedGoal.notes && (
              <div className="mb-6">
                <p className="text-xs text-gray-500 mb-2">Notes</p>
                <p className="text-gray-300 text-sm">{selectedGoal.notes}</p>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex gap-3">
              <button className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition">
                Edit Goal
              </button>
              <button className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition">
                Add Funds
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Goal Modal (placeholder) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Add New Goal</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Goal Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      className="p-3 bg-white/5 border border-white/10 rounded-xl hover:border-indigo-500/30 transition text-center"
                    >
                      <span className="text-2xl block mb-1">{config.icon}</span>
                      <span className="text-xs text-gray-400">{config.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Goal Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g., Beach House Fund"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Target Amount</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                    placeholder="$100,000"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Target Date</label>
                  <input
                    type="month"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Goal creation would work in production');
                    setShowAddModal(false);
                  }}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition"
                >
                  Create Goal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
