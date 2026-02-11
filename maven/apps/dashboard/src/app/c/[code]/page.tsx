'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// Demo client data - calm, client-appropriate information only
const DEMO_CLIENT = {
  code: 'DEMO-JS123',
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@email.com',
  advisor: {
    name: 'Sam Adams',
    firm: 'Adams Wealth Partners',
    photo: null,
    phone: '(555) 123-4567',
    email: 'sam@adamswealth.com',
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
      status: 'on-track',
      icon: '🏖️',
    },
    { 
      id: '2', 
      name: 'College Fund', 
      target: 150000, 
      current: 72000, 
      targetDate: '2032',
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
  // Advisor's note to client
  advisorNote: {
    date: '2026-02-01',
    message: "Markets have been volatile lately, but your portfolio is well-positioned. We're staying the course with your long-term plan. Looking forward to our quarterly review!",
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

// Progress ring component
function ProgressRing({ progress, size = 80, strokeWidth = 8, color = '#F59E0B' }: { 
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

  const isPreview = searchParams.get('preview') === 'true';

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
      {/* Warm, Personal Greeting */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
          {greeting}, {client.firstName}
        </h1>
        <p className="text-gray-400">
          Your wealth journey with {client.advisor.firm}
        </p>
      </div>

      {/* Hero: Portfolio Value - Calm, Confident */}
      <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-950/30 border border-emerald-500/20 rounded-3xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-emerald-400/80 text-sm font-medium mb-2">Your Portfolio</p>
            <p className="text-4xl md:text-5xl font-bold text-white mb-2">
              {formatCurrency(client.portfolioValue)}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-medium">
                +{client.ytdReturn}% YTD
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400 text-sm">
                +{formatCurrency(client.ytdDollars)} this year
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span>Live</span>
          </div>
        </div>
      </div>

      {/* Status Message - Reassurance */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="text-2xl">✨</div>
          <div>
            <p className="text-white font-medium mb-1">You're on track</p>
            <p className="text-gray-400 text-sm">
              Your portfolio is performing well and aligned with your long-term goals. 
              No action needed from you — we're managing everything.
            </p>
          </div>
        </div>
      </div>

      {/* Goals Progress */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Your Goals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {client.goals.map((goal) => {
            const progress = Math.round((goal.current / goal.target) * 100);
            return (
              <div 
                key={goal.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors"
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
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{formatCurrency(goal.current)}</span>
                  <span className="text-gray-500">of {formatCurrency(goal.target)}</span>
                </div>
                <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Advisor's Note */}
      {client.advisorNote && (
        <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              {client.advisor.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-white font-medium">{client.advisor.name}</p>
                <span className="text-gray-500 text-sm">• {formatDate(client.advisorNote.date)}</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                "{client.advisorNote.message}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Meeting */}
      {client.nextMeeting && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <span className="text-xl">📅</span>
              </div>
              <div>
                <p className="text-white font-medium">{client.nextMeeting.type}</p>
                <p className="text-gray-400 text-sm">
                  {formatDate(client.nextMeeting.date)} at {client.nextMeeting.time}
                </p>
              </div>
            </div>
            <Link
              href={`/c/${params.code}/contact`}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors min-h-[44px] flex items-center"
            >
              Reschedule
            </Link>
          </div>
        </div>
      )}

      {/* Recent Activity - Friendly, Not Trading Details */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          <Link 
            href={`/c/${params.code}/activity`}
            className="text-amber-500 text-sm hover:text-amber-400 transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="space-y-3">
          {client.recentActivity.slice(0, 3).map((activity) => (
            <div 
              key={activity.id}
              className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl"
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

      {/* Milestone Celebration */}
      {client.milestones.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <span className="text-3xl">{client.milestones[0].icon}</span>
            <div>
              <p className="text-white font-medium">{client.milestones[0].title}</p>
              <p className="text-amber-400/80 text-sm">{formatDate(client.milestones[0].date)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions - Client-Appropriate Only */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href={`/c/${params.code}/portfolio`}
          className="flex flex-col items-center gap-2 p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-colors min-h-[100px] justify-center"
        >
          <span className="text-2xl">📊</span>
          <span className="text-white text-sm font-medium">View Portfolio</span>
        </Link>
        <Link
          href={`/c/${params.code}/documents`}
          className="flex flex-col items-center gap-2 p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-colors min-h-[100px] justify-center"
        >
          <span className="text-2xl">📁</span>
          <span className="text-white text-sm font-medium">Documents</span>
        </Link>
        <Link
          href={`/c/${params.code}/goals`}
          className="flex flex-col items-center gap-2 p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-colors min-h-[100px] justify-center"
        >
          <span className="text-2xl">🎯</span>
          <span className="text-white text-sm font-medium">My Goals</span>
        </Link>
        <Link
          href={`/c/${params.code}/contact`}
          className="flex flex-col items-center gap-2 p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-colors min-h-[100px] justify-center"
        >
          <span className="text-2xl">💬</span>
          <span className="text-white text-sm font-medium">Contact Advisor</span>
        </Link>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-xs pt-4 border-t border-white/10">
        <p>Client of {client.advisor.firm} since {client.memberSince}</p>
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
