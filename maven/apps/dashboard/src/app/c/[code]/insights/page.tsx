'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Info, CheckCircle, Lightbulb } from 'lucide-react';
import { SkeletonList } from '@/components/client-portal/SkeletonCard';
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

const PRIMARY_COLOR = '#4f46e5';

const priorityConfig = {
  high: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    iconColor: 'text-red-500',
    borderColor: 'border-l-red-500',
    label: 'Action needed',
  },
  medium: {
    icon: Info,
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-500',
    borderColor: 'border-l-amber-500',
    label: 'Review suggested',
  },
  low: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    iconColor: 'text-green-500',
    borderColor: 'border-l-green-500',
    label: 'For your info',
  },
};

// L006: Skeleton matches real layout
function InsightsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-48 bg-slate-200 rounded animate-pulse" />
      <SkeletonList items={3} />
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
        <h1 className="text-2xl font-bold text-slate-900">Insights</h1>
        <EmptyState
          icon={Lightbulb}
          title="No insights yet"
          message="Your advisor hasn't shared any insights with you yet. Check back soon — they're working on personalized recommendations for your portfolio."
          primaryColor={PRIMARY_COLOR}
        />
      </div>
    );
  }

  const unreadCount = insights.filter(i => !i.read).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Insights</h1>
        <p className="text-slate-600 mt-1">
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
                'bg-white rounded-xl p-5 shadow-sm border border-slate-100',
                'border-l-4',
                config.borderColor,
                !insight.read && 'ring-1 ring-slate-200'
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
                    <h3 className="font-semibold text-slate-900">{insight.title}</h3>
                    {!insight.read && (
                      <span className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                    )}
                  </div>
                  
                  <span className={clsx(
                    'inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2',
                    config.bgColor,
                    config.iconColor
                  )}>
                    {config.label}
                  </span>
                  
                  <p className="text-slate-600 leading-relaxed">
                    {insight.message}
                  </p>
                  
                  <p className="text-sm text-slate-400 mt-3">
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
        <p className="text-sm text-slate-500">
          Have questions about these insights?{' '}
          <a 
            href={`/c/${params.code}/contact`}
            className="font-medium underline"
            style={{ color: PRIMARY_COLOR }}
          >
            Contact your advisor
          </a>
        </p>
      </div>
    </div>
  );
}
