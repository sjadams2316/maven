'use client';

import { useState } from 'react';

// Demo goals with rich detail
const DEMO_GOALS = [
  {
    id: '1',
    name: 'Retirement',
    icon: '🏖️',
    description: 'Comfortable retirement with travel and hobbies',
    target: 2000000,
    current: 850000,
    monthlyContribution: 2500,
    targetDate: '2038',
    startDate: '2022',
    startValue: 450000,
    status: 'on-track',
    projectedCompletion: '2037',
    milestones: [
      { amount: 500000, reached: true, date: '2023-06' },
      { amount: 750000, reached: true, date: '2025-03' },
      { amount: 1000000, reached: false, projected: '2027-08' },
      { amount: 1500000, reached: false, projected: '2033-02' },
      { amount: 2000000, reached: false, projected: '2037-11' },
    ],
    insights: [
      "You're 1 year ahead of schedule",
      "At current pace, you'll reach your goal in 2037",
    ],
  },
  {
    id: '2',
    name: 'College Fund',
    icon: '🎓',
    description: "Emma's education fund",
    target: 150000,
    current: 72000,
    monthlyContribution: 500,
    targetDate: '2032',
    startDate: '2024',
    startValue: 25000,
    status: 'on-track',
    projectedCompletion: '2031',
    milestones: [
      { amount: 50000, reached: true, date: '2025-08' },
      { amount: 75000, reached: false, projected: '2026-04' },
      { amount: 100000, reached: false, projected: '2028-01' },
      { amount: 150000, reached: false, projected: '2031-06' },
    ],
    insights: [
      "Great progress! You're ahead of schedule",
      "Consider 529 plan for tax benefits",
    ],
  },
  {
    id: '3',
    name: 'Emergency Fund',
    icon: '🛡️',
    description: '6 months of expenses',
    target: 60000,
    current: 58500,
    monthlyContribution: 500,
    targetDate: '2026',
    startDate: '2023',
    startValue: 20000,
    status: 'almost-there',
    projectedCompletion: '2026',
    milestones: [
      { amount: 30000, reached: true, date: '2024-02' },
      { amount: 45000, reached: true, date: '2025-01' },
      { amount: 60000, reached: false, projected: '2026-04' },
    ],
    insights: [
      "Almost there! Just $1,500 to go",
      "You'll complete this goal in 3 months",
    ],
  },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Progress ring component
function ProgressRing({ progress, size = 120, strokeWidth = 10, color = '#F59E0B' }: { 
  progress: number; 
  size?: number; 
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  );
}

function GoalCard({ goal, isExpanded, onToggle }: { 
  goal: typeof DEMO_GOALS[0]; 
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const progress = Math.round((goal.current / goal.target) * 100);
  const statusColors = {
    'on-track': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', ring: '#10B981' },
    'almost-there': { bg: 'bg-amber-500/20', text: 'text-amber-400', ring: '#F59E0B' },
    'needs-attention': { bg: 'bg-red-500/20', text: 'text-red-400', ring: '#EF4444' },
  };
  const status = statusColors[goal.status as keyof typeof statusColors] || statusColors['on-track'];

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all">
      {/* Header - Always Visible */}
      <button
        onClick={onToggle}
        className="w-full p-5 flex items-center gap-4 text-left hover:bg-white/5 transition-colors min-h-[88px]"
      >
        <div className="relative flex-shrink-0">
          <ProgressRing progress={progress} size={80} strokeWidth={8} color={status.ring} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">{goal.icon}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-semibold">{goal.name}</h3>
            <span className={`px-2 py-0.5 rounded-full text-xs ${status.bg} ${status.text}`}>
              {goal.status.replace('-', ' ')}
            </span>
          </div>
          <p className="text-gray-400 text-sm truncate">{goal.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-white font-bold">{progress}%</span>
            <span className="text-gray-500 text-sm">
              {formatCurrency(goal.current)} of {formatCurrency(goal.target)}
            </span>
          </div>
        </div>
        <div className="flex-shrink-0 text-gray-400">
          <svg 
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-white/10 pt-4 space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Progress</span>
              <span className="text-gray-400">Target: {goal.targetDate}</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000"
                style={{ 
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${status.ring}, ${status.ring}dd)`
                }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-gray-500 text-xs">Monthly contribution</p>
              <p className="text-white font-semibold">{formatCurrency(goal.monthlyContribution)}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-gray-500 text-xs">Projected completion</p>
              <p className="text-white font-semibold">{goal.projectedCompletion}</p>
            </div>
          </div>

          {/* Milestones */}
          <div>
            <p className="text-gray-400 text-sm mb-3">Milestones</p>
            <div className="space-y-2">
              {goal.milestones.map((milestone, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    milestone.reached 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-white/10 text-gray-500'
                  }`}>
                    {milestone.reached ? '✓' : '○'}
                  </div>
                  <div className="flex-1">
                    <span className="text-white text-sm">{formatCurrency(milestone.amount)}</span>
                  </div>
                  <span className="text-gray-500 text-xs">
                    {milestone.reached ? `Reached ${milestone.date}` : `Est. ${milestone.projected}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          {goal.insights.length > 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <p className="text-emerald-400 text-sm font-medium mb-2">💡 Insights</p>
              <ul className="space-y-1">
                {goal.insights.map((insight, idx) => (
                  <li key={idx} className="text-emerald-300/80 text-sm">• {insight}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function GoalsPage() {
  const [expandedGoal, setExpandedGoal] = useState<string | null>('1');

  // Calculate totals
  const totalTarget = DEMO_GOALS.reduce((sum, g) => sum + g.target, 0);
  const totalCurrent = DEMO_GOALS.reduce((sum, g) => sum + g.current, 0);
  const overallProgress = Math.round((totalCurrent / totalTarget) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Your Goals</h1>
        <p className="text-gray-400">Track your progress toward what matters most</p>
      </div>

      {/* Overall Progress */}
      <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 border border-amber-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-amber-400/80 text-sm mb-1">Overall Progress</p>
            <p className="text-3xl font-bold text-white">{overallProgress}%</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">{formatCurrency(totalCurrent)}</p>
            <p className="text-gray-500 text-xs">of {formatCurrency(totalTarget)} total</p>
          </div>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-1000"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Individual Goals */}
      <div className="space-y-4">
        {DEMO_GOALS.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            isExpanded={expandedGoal === goal.id}
            onToggle={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
          />
        ))}
      </div>

      {/* Add Goal CTA */}
      <div className="bg-white/5 border border-dashed border-white/20 rounded-2xl p-6 text-center">
        <p className="text-gray-400 mb-3">Want to add or adjust a goal?</p>
        <a
          href="/c/DEMO-JS123/contact"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors min-h-[44px]"
        >
          Discuss with your advisor →
        </a>
      </div>
    </div>
  );
}
