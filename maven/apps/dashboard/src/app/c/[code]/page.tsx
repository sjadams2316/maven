'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { TrendingUp, ArrowRight, Lightbulb, AlertCircle } from 'lucide-react';
import { SkeletonCard, SkeletonValue } from '@/components/client-portal/SkeletonCard';
import { clsx } from 'clsx';

// Demo data - will be replaced with API call
const DEMO_CLIENT = {
  name: 'John Smith',
  advisorFirm: 'Adams Wealth Management',
  portfolioValue: 850000,
  ytdReturn: 8.2,
  lastUpdated: '2024-02-10',
  insights: [
    { 
      id: 1, 
      title: 'Tax-Loss Opportunity', 
      message: 'You have a $3,200 loss harvesting opportunity in your taxable account.', 
      priority: 'high' as const 
    },
    { 
      id: 2, 
      title: 'Rebalancing Suggested', 
      message: 'Your stock allocation has drifted 5% above target.', 
      priority: 'medium' as const 
    },
  ]
};

const PRIMARY_COLOR = '#4f46e5';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

// Loading skeleton that matches real layout (L006)
function HomePageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Greeting skeleton */}
      <div className="space-y-1">
        <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-4 w-64 bg-slate-200 rounded animate-pulse" />
      </div>
      
      {/* Portfolio value skeleton */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="h-4 w-24 bg-slate-200 rounded animate-pulse mb-3" />
        <SkeletonValue />
      </div>
      
      {/* Insights skeleton */}
      <div className="space-y-4">
        <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
        <SkeletonCard lines={2} showHeader={false} />
        <SkeletonCard lines={2} showHeader={false} />
      </div>
    </div>
  );
}

export default function ClientHomePage() {
  const params = useParams<{ code: string }>();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState(DEMO_CLIENT);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <HomePageSkeleton />;
  }

  const highPriorityInsights = client.insights.filter(i => i.priority === 'high');
  const hasUrgentInsights = highPriorityInsights.length > 0;

  return (
    <div className="space-y-6">
      {/* Warm greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {client.name.split(' ')[0]}
        </h1>
        <p className="text-slate-600 mt-1">
          Here's how your portfolio is doing
        </p>
      </div>

      {/* Portfolio value card - the star of the show */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <p className="text-sm text-slate-500 mb-1">Total Portfolio Value</p>
        <p className="text-4xl font-bold text-slate-900">
          {formatCurrency(client.portfolioValue)}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <div 
            className="flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium"
            style={{ 
              backgroundColor: client.ytdReturn >= 0 ? '#dcfce7' : '#fee2e2',
              color: client.ytdReturn >= 0 ? '#166534' : '#991b1b'
            }}
          >
            <TrendingUp className="h-4 w-4" />
            {formatPercent(client.ytdReturn)} YTD
          </div>
          <span className="text-sm text-slate-400">
            as of {new Date(client.lastUpdated).toLocaleDateString()}
          </span>
        </div>
        
        {/* Link to full portfolio */}
        <Link
          href={`/c/${params.code}/portfolio`}
          className={clsx(
            // L002: 48px touch target
            'flex items-center justify-between min-h-[48px] mt-4 px-4 py-3',
            'bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors'
          )}
        >
          <span className="font-medium text-slate-700">View portfolio details</span>
          <ArrowRight className="h-5 w-5 text-slate-400" />
        </Link>
      </div>

      {/* Insights preview */}
      {client.insights.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Lightbulb className="h-5 w-5" style={{ color: PRIMARY_COLOR }} />
              Insights from your advisor
              {hasUrgentInsights && (
                <span className="flex h-2 w-2 bg-red-500 rounded-full" />
              )}
            </h2>
            <Link
              href={`/c/${params.code}/insights`}
              className="text-sm font-medium hover:underline"
              style={{ color: PRIMARY_COLOR }}
            >
              View all
            </Link>
          </div>
          
          <div className="space-y-3">
            {client.insights.slice(0, 2).map((insight) => (
              <Link
                key={insight.id}
                href={`/c/${params.code}/insights`}
                className={clsx(
                  'block bg-white rounded-xl p-4 shadow-sm border transition-shadow hover:shadow-md',
                  insight.priority === 'high' 
                    ? 'border-l-4 border-l-red-500 border-t-slate-100 border-r-slate-100 border-b-slate-100' 
                    : 'border-slate-100'
                )}
              >
                <div className="flex items-start gap-3">
                  {insight.priority === 'high' && (
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <h3 className="font-semibold text-slate-900">{insight.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{insight.message}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
