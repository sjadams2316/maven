'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { 
  Users, 
  PieChart, 
  Shield, 
  Landmark, 
  Receipt, 
  Heart, 
  FileText, 
  MessageCircle 
} from 'lucide-react';
import { WeeklyCommentary, SectionCard, SectionCardGrid } from '@/components/client-portal';

// Demo client data - calm, client-appropriate information only
// Branding: Maven Partners (not individual advisor names)
const DEMO_CLIENT = {
  code: 'DEMO-JS123',
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@email.com',
  advisor: {
    name: 'Sarah Chen',
    title: 'Senior Wealth Advisor',
    firm: 'Maven Partners',
    photo: null, // Would be a URL in production
    phone: '(555) 123-4567',
    email: 'sarah.chen@mavenpartners.com',
  },
  portfolioValue: 850000,
  portfolioChange: 2380,
  portfolioChangePercent: 0.28,
  ytdReturn: 8.2,
  ytdDollars: 64450,
  lastUpdated: new Date().toISOString(),
  memberSince: 'March 2022',
  // Goals - what clients actually care about
  goals: [
    { 
      id: '1', 
      name: 'Retirement', 
      target: 2000000, 
      current: 850000, 
      targetDate: '2038',
      yearsRemaining: 12,
      projectedValue: 2150000, // Projected value at target date
      status: 'ahead',
      icon: '🏖️',
    },
    { 
      id: '2', 
      name: 'College Fund', 
      target: 150000, 
      current: 72000, 
      targetDate: '2032',
      yearsRemaining: 6,
      projectedValue: 145000,
      status: 'on-track',
      icon: '🎓',
    },
  ],
  // Recent activity - dividends, contributions, NOT trades
  recentActivity: [
    { id: '1', type: 'dividend', description: 'Quarterly dividend received', amount: 1842, date: '2026-02-01' },
    { id: '2', type: 'contribution', description: 'Monthly contribution', amount: 2500, date: '2026-01-15' },
    { id: '3', type: 'dividend', description: 'Dividend reinvested', amount: 456, date: '2026-01-02' },
  ],
  // What the advisor did this month (outcomes, not trades)
  advisorActions: [
    { id: '1', action: 'Rebalanced portfolio to maintain target allocation', date: '2026-02-05', icon: '⚖️' },
    { id: '2', action: 'Harvested $1,200 tax loss in international fund', date: '2026-01-28', icon: '💰', savings: 300 },
    { id: '3', action: 'Reinvested $1,842 in dividends automatically', date: '2026-02-01', icon: '🔄' },
  ],
  // Personal note from advisor (AI-generated, advisor-approved)
  advisorNote: {
    message: "Hi John — Markets have been volatile lately, but your portfolio is positioned exactly where we want it. Your retirement goal is actually ahead of schedule now. Looking forward to our quarterly review next week!",
    date: '2026-02-10',
  },
  // Milestones - celebrations!
  milestones: [
    { id: '1', title: 'Portfolio crossed $800K!', date: '2026-01-15', icon: '🎉' },
  ],
  // Next meeting
  nextMeeting: {
    date: '2026-02-20',
    time: '2:00 PM',
    type: 'Quarterly Review',
  },
  // Dynamic status (computed from portfolio state)
  status: {
    type: 'ahead', // 'ahead' | 'on-track' | 'behind' | 'needs-attention'
    headline: "You're ahead of schedule",
    detail: "Your retirement goal is tracking 7% above projections. At this pace, you could reach your target 2 years early.",
  },
  // Market context (calm framing)
  marketContext: {
    headline: 'Markets this week',
    change: -1.2,
    message: "The S&P 500 dipped 1.2% this week on inflation concerns. Your portfolio is built for moments like this — staying diversified and focused on the long term.",
  },
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric',
  });
}

// Progress ring component - teal accent
function ProgressRing({ progress, size = 80, strokeWidth = 8 }: { 
  progress: number; 
  size?: number; 
  strokeWidth?: number;
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
        stroke="#0d9488"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  );
}

// Loading skeleton
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-white/10 rounded" />
      <div className="bg-white/5 rounded-3xl p-8 h-48" />
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-2xl p-6 h-40" />
        <div className="bg-white/5 rounded-2xl p-6 h-40" />
      </div>
    </div>
  );
}

function ClientDashboardInner() {
  const params = useParams<{ code: string }>();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [client] = useState(DEMO_CLIENT);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const greeting = currentTime.getHours() < 12 
    ? 'Good morning' 
    : currentTime.getHours() < 17 
      ? 'Good afternoon' 
      : 'Good evening';

  return (
    <div className="space-y-8">
      {/* Warm, Personal Greeting - Maven Partners branding */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
          {greeting}, {client.firstName}
        </h1>
        <p className="text-gray-400">
          Your wealth journey with <span className="text-teal-400">Maven Partners</span>
        </p>
      </div>

      {/* Hero: Portfolio Value - Calm, Confident */}
      <div className="bg-gradient-to-br from-teal-900/30 to-teal-950/30 border border-teal-500/20 rounded-3xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-teal-400/80 text-sm font-medium mb-2">Your Portfolio</p>
            <p className="text-4xl md:text-5xl font-bold text-white mb-2">
              {formatCurrency(client.portfolioValue)}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-teal-400 font-medium">
                +{client.ytdReturn}% YTD
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400 text-sm">
                +{formatCurrency(client.ytdDollars)} this year
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
            <span>Live</span>
          </div>
        </div>
      </div>

      {/* Dynamic Status Message - Computed from actual data */}
      <div className={`border rounded-2xl p-5 ${
        client.status.type === 'ahead' 
          ? 'bg-emerald-500/10 border-emerald-500/20' 
          : client.status.type === 'needs-attention'
            ? 'bg-amber-500/10 border-amber-500/20'
            : 'bg-[#111827] border-white/10'
      }`}>
        <div className="flex items-start gap-4">
          <div className="text-2xl">
            {client.status.type === 'ahead' ? '🚀' : client.status.type === 'needs-attention' ? '👋' : '✨'}
          </div>
          <div>
            <p className={`font-medium mb-1 ${
              client.status.type === 'ahead' ? 'text-emerald-400' : 'text-white'
            }`}>
              {client.status.headline}
            </p>
            <p className="text-gray-400 text-sm">
              {client.status.detail}
            </p>
          </div>
        </div>
      </div>

      {/* From Your Advisor - Personal Touch */}
      {client.advisorNote && (
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {client.advisor.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-white font-medium">{client.advisor.name}</p>
                <span className="text-gray-500 text-sm">• {client.advisor.title}</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                "{client.advisorNote.message}"
              </p>
              <p className="text-gray-500 text-xs mt-2">{formatDate(client.advisorNote.date)}</p>
            </div>
          </div>
        </div>
      )}

      {/* What We Did This Month - Advisor Actions */}
      {client.advisorActions && client.advisorActions.length > 0 && (
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-5">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>🛠️</span> What we did this month
          </h2>
          <div className="space-y-3">
            {client.advisorActions.map((action) => (
              <div key={action.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                <span className="text-xl">{action.icon}</span>
                <div className="flex-1">
                  <p className="text-white text-sm">{action.action}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-500 text-xs">{formatDate(action.date)}</span>
                    {action.savings && (
                      <span className="text-emerald-400 text-xs">~${action.savings} tax savings</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Market Context - Calm Framing */}
      {client.marketContext && (
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="text-2xl">📊</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-white font-medium">{client.marketContext.headline}</p>
                <span className={`text-sm font-medium ${
                  client.marketContext.change >= 0 ? 'text-emerald-400' : 'text-amber-400'
                }`}>
                  {client.marketContext.change >= 0 ? '▲' : '▼'} {Math.abs(client.marketContext.change)}%
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                {client.marketContext.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Goals Progress with Projected Trajectory */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Your Goals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {client.goals.map((goal) => {
            const progress = Math.round((goal.current / goal.target) * 100);
            const projectedProgress = goal.projectedValue ? Math.round((goal.projectedValue / goal.target) * 100) : progress;
            const isAhead = goal.status === 'ahead' || (goal.projectedValue && goal.projectedValue >= goal.target);
            
            return (
              <div 
                key={goal.id}
                className={`border rounded-2xl p-5 transition-colors ${
                  isAhead 
                    ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40' 
                    : 'bg-[#111827] border-white/10 hover:border-teal-500/30'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{goal.icon}</span>
                    <div>
                      <p className="text-white font-medium">{goal.name}</p>
                      <p className="text-gray-500 text-sm">Target: {goal.targetDate}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <ProgressRing progress={progress} size={60} strokeWidth={6} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{progress}%</span>
                    </div>
                  </div>
                </div>
                
                {/* Current vs Target */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{formatCurrency(goal.current)}</span>
                  <span className="text-gray-500">of {formatCurrency(goal.target)}</span>
                </div>
                <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      isAhead ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-teal-500 to-teal-400'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                
                {/* Projected Trajectory */}
                {goal.projectedValue && goal.yearsRemaining && (
                  <div className={`mt-4 pt-3 border-t ${isAhead ? 'border-emerald-500/20' : 'border-white/10'}`}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Projected at {goal.targetDate}:</span>
                      <span className={isAhead ? 'text-emerald-400 font-medium' : 'text-white font-medium'}>
                        {formatCurrency(goal.projectedValue)}
                      </span>
                    </div>
                    {isAhead && (
                      <p className="text-emerald-400 text-xs mt-1">
                        ✓ On track to exceed goal by {formatCurrency(goal.projectedValue - goal.target)}
                      </p>
                    )}
                    {!isAhead && goal.projectedValue < goal.target && (
                      <p className="text-amber-400 text-xs mt-1">
                        Consider increasing contributions to close the gap
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Commentary - AI-generated */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">This Week</h2>
        <WeeklyCommentary code={params.code} portfolioValue={client.portfolioValue} />
      </div>

      {/* Quick Access - Section Cards */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Explore Your Plan</h2>
        <SectionCardGrid columns={2}>
          <SectionCard
            href={`/c/${params.code}/family`}
            icon={Users}
            title="Family"
            description="View household members and their accounts"
            accentColor="blue"
          />
          <SectionCard
            href={`/c/${params.code}/portfolio`}
            icon={PieChart}
            title="Portfolio"
            description="Holdings, allocation, and performance"
            accentColor="teal"
          />
          <SectionCard
            href={`/c/${params.code}/social-security`}
            icon={Shield}
            title="Social Security"
            description="Your claiming strategy and benefits"
            accentColor="purple"
          />
          <SectionCard
            href={`/c/${params.code}/estate`}
            icon={Landmark}
            title="Estate Planning"
            description="Beneficiaries, trusts, and documents"
            accentColor="amber"
          />
          <SectionCard
            href={`/c/${params.code}/tax`}
            icon={Receipt}
            title="Tax Planning"
            description="Year-end projections and opportunities"
            accentColor="emerald"
          />
          <SectionCard
            href={`/c/${params.code}/philanthropy`}
            icon={Heart}
            title="Philanthropy"
            description="Charitable giving and impact"
            accentColor="rose"
          />
        </SectionCardGrid>
      </div>

      {/* Upcoming Meeting */}
      {client.nextMeeting && (
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center">
                <span className="text-xl">📅</span>
              </div>
              <div>
                <p className="text-white font-medium">{client.nextMeeting.type}</p>
                <p className="text-gray-400 text-sm">
                  {formatDate(client.nextMeeting.date)} at {client.nextMeeting.time}
                </p>
              </div>
            </div>
            <a
              href={`/c/${params.code}/messages`}
              className="px-4 py-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 text-sm rounded-lg transition-colors min-h-[44px] flex items-center border border-teal-500/20"
            >
              Reschedule
            </a>
          </div>
        </div>
      )}

      {/* Milestone Celebration */}
      {client.milestones.length > 0 && (
        <div className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <span className="text-3xl">{client.milestones[0].icon}</span>
            <div>
              <p className="text-white font-medium">{client.milestones[0].title}</p>
              <p className="text-teal-400/80 text-sm">{formatDate(client.milestones[0].date)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
        </div>
        <div className="space-y-3">
          {client.recentActivity.slice(0, 3).map((activity) => (
            <div 
              key={activity.id}
              className="flex items-center justify-between p-4 bg-[#111827] border border-white/10 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'dividend' 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {activity.type === 'dividend' ? '💰' : '📥'}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{activity.description}</p>
                  <p className="text-gray-500 text-xs">{formatDate(activity.date)}</p>
                </div>
              </div>
              <span className="text-emerald-400 font-medium">
                +{formatCurrency(activity.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Documents & Messages Quick Links */}
      <div className="grid grid-cols-2 gap-4">
        <SectionCard
          href={`/c/${params.code}/documents`}
          icon={FileText}
          title="Documents"
          description="Access your document vault"
          accentColor="amber"
        />
        <SectionCard
          href={`/c/${params.code}/messages`}
          icon={MessageCircle}
          title="Messages"
          description="Contact Maven Partners"
          accentColor="teal"
        />
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-xs pt-4 border-t border-white/10">
        <p>Client of <span className="text-teal-400">Maven Partners</span> since {client.memberSince}</p>
      </div>
    </div>
  );
}

export default function ClientHomePage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <ClientDashboardInner />
    </Suspense>
  );
}
