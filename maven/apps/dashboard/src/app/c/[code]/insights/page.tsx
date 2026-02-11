'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Info, CheckCircle, Lightbulb } from 'lucide-react';
import { EmptyState } from '@/components/client-portal/EmptyState';
import { clsx } from 'clsx';

// Demo data
const DEMO_INSIGHTS = [
  { 
    id: 1, 
    title: 'Tax-Loss Opportunity', 
    message: 'You have a $3,200 loss harvesting opportunity in your taxable account. This could help reduce your tax bill this year.',
    priority: 'high' as const,
    date: '2024-02-10',
    read: false,
  },
  { 
    id: 2, 
    title: 'Rebalancing Suggested', 
    message: 'Your stock allocation has drifted 5% above target. We recommend reviewing your allocation to stay aligned with your goals.',
    priority: 'medium' as const,
    date: '2024-02-08',
    read: false,
  },
  {
    id: 3,
    title: 'Annual Review Complete',
    message: 'Great news! We\'ve completed your annual portfolio review. Everything looks on track for your retirement goals.',
    priority: 'low' as const,
    date: '2024-02-01',
    read: true,
  },
];

const priorityConfig = {
  high: {
    icon: AlertCircle,
    bgColor: 'bg-red-500/10',
    iconColor: 'text-red-400',
    borderColor: 'border-l-red-500',
    label: 'Action needed',
    labelBg: 'bg-red-500/10 text-red-400',
  },
  medium: {
    icon: Info,
    bgColor: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    borderColor: 'border-l-amber-500',
    label: 'Review suggested',
    labelBg: 'bg-amber-500/10 text-amber-400',
  },
  low: {
    icon: CheckCircle,
    bgColor: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    borderColor: 'border-l-emerald-500',
    label: 'For your info',
    labelBg: 'bg-emerald-500/10 text-emerald-400',
  },
};

// L006: Skeleton matches real layout - dark theme
function InsightsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="h-7 w-24 bg-white/10 rounded animate-pulse" />
        <div className="h-4 w-48 bg-white/10 rounded animate-pulse" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#12121a] rounded-2xl p-5 shadow-xl shadow-black/20 border border-white/10">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-white/10 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-40 bg-white/10 rounded animate-pulse" />
                <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
                <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                <div className="h-3 w-24 bg-white/10 rounded animate-pulse mt-2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InsightsPage({ params }: { params: { code: string } }) {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(DEMO_INSIGHTS);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <InsightsSkeleton />;
  }

  // L014: Empty state with empathy, explanation, guidance
  if (insights.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Insights</h1>
        <EmptyState
          icon={Lightbulb}
          title="No insights yet"
          message="Your advisor hasn't shared any insights with you yet. Check back soon — they're working on personalized recommendations for your portfolio."
          primaryColor="#f59e0b"
        />
      </div>
    );
  }

  const unreadCount = insights.filter(i => !i.read).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Insights</h1>
        <p className="text-gray-400 mt-1">
          {unreadCount > 0 
            ? `${unreadCount} new insight${unreadCount > 1 ? 's' : ''} from your advisor`
            : 'Personalized recommendations from your advisor'
          }
        </p>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => {
          const config = priorityConfig[insight.priority];
          const Icon = config.icon;
          
          return (
            <div
              key={insight.id}
              className={clsx(
                'bg-[#12121a] rounded-2xl p-5 shadow-xl shadow-black/20 border border-white/10',
                'border-l-4 transition-all duration-200 hover:border-amber-500/30',
                config.borderColor,
                !insight.read && 'ring-1 ring-white/10'
              )}
            >
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className={clsx(
                  'h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0',
                  config.bgColor
                )}>
                  <Icon className={clsx('h-5 w-5', config.iconColor)} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white">{insight.title}</h3>
                    {!insight.read && (
                      <span className="h-2 w-2 bg-amber-400 rounded-full flex-shrink-0 animate-pulse" />
                    )}
                  </div>
                  
                  <span className={clsx(
                    'inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2',
                    config.labelBg
                  )}>
                    {config.label}
                  </span>
                  
                  <p className="text-gray-400 leading-relaxed">
                    {insight.message}
                  </p>
                  
                  <p className="text-sm text-gray-500 mt-3">
                    {new Date(insight.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subtle prompt to contact */}
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">
          Have questions about these insights?{' '}
          <a 
            href={`/c/${params.code}/contact`}
            className="font-medium text-amber-400 hover:text-amber-300 transition-colors"
          >
            Contact your advisor
          </a>
        </p>
      </div>
    </div>
  );
}
