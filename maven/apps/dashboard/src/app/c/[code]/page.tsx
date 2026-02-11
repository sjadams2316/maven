'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { TrendingUp, ArrowRight, Lightbulb, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

// Demo data - will be replaced with API call
const DEMO_CLIENT = {
  name: 'John Smith',
  advisorFirm: 'Maven Partners',
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

// Loading skeleton that matches real layout (L006) - dark theme
function HomePageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Greeting skeleton */}
      <div className="space-y-1">
        <div className="h-6 w-48 bg-white/10 rounded animate-pulse" />
        <div className="h-4 w-64 bg-white/10 rounded animate-pulse" />
      </div>
      
      {/* Portfolio value skeleton */}
      <div className="bg-[#12121a] rounded-2xl p-6 shadow-xl shadow-black/20 border border-white/10">
        <div className="h-4 w-24 bg-white/10 rounded animate-pulse mb-3" />
        <div className="h-10 w-48 bg-white/10 rounded animate-pulse mb-3" />
        <div className="h-6 w-32 bg-white/10 rounded animate-pulse" />
      </div>
      
      {/* Insights skeleton */}
      <div className="space-y-4">
        <div className="h-5 w-32 bg-white/10 rounded animate-pulse" />
        <div className="bg-[#12121a] rounded-2xl p-5 shadow-xl shadow-black/20 border border-white/10">
          <div className="h-5 w-40 bg-white/10 rounded animate-pulse mb-2" />
          <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
        </div>
        <div className="bg-[#12121a] rounded-2xl p-5 shadow-xl shadow-black/20 border border-white/10">
          <div className="h-5 w-36 bg-white/10 rounded animate-pulse mb-2" />
          <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
        </div>
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
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {client.name.split(' ')[0]}
        </h1>
        <p className="text-gray-400 mt-1">
          Here's how your portfolio is doing
        </p>
      </div>

      {/* Portfolio value card - the star of the show */}
      <div className="bg-[#12121a] rounded-2xl p-6 shadow-xl shadow-black/20 border border-white/10">
        <p className="text-sm text-gray-400 mb-1">Total Portfolio Value</p>
        <p className="text-4xl font-bold text-white">
          {formatCurrency(client.portfolioValue)}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <div 
            className={clsx(
              'flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium',
              client.ytdReturn >= 0 
                ? 'bg-emerald-500/10 text-emerald-400' 
                : 'bg-red-500/10 text-red-400'
            )}
          >
            <TrendingUp className="h-4 w-4" />
            {formatPercent(client.ytdReturn)} YTD
          </div>
          <span className="text-sm text-gray-500">
            as of {new Date(client.lastUpdated).toLocaleDateString()}
          </span>
        </div>
        
        {/* Link to full portfolio */}
        <Link
          href={`/c/${params.code}/portfolio`}
          className={clsx(
            // L002: 48px touch target
            'flex items-center justify-between min-h-[48px] mt-4 px-4 py-3',
            'bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200',
            'border border-white/5 hover:border-amber-500/20'
          )}
        >
          <span className="font-medium text-gray-300">View portfolio details</span>
          <ArrowRight className="h-5 w-5 text-amber-400" />
        </Link>
      </div>

      {/* Insights preview */}
      {client.insights.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-400" />
              Insights from your advisor
              {hasUrgentInsights && (
                <span className="flex h-2 w-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </h2>
            <Link
              href={`/c/${params.code}/insights`}
              className="text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors"
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
                  'block bg-[#12121a] rounded-2xl p-4 shadow-xl shadow-black/20 border transition-all duration-200 hover:border-amber-500/30',
                  insight.priority === 'high' 
                    ? 'border-l-4 border-l-red-500 border-t-white/10 border-r-white/10 border-b-white/10' 
                    : 'border-white/10'
                )}
              >
                <div className="flex items-start gap-3">
                  {insight.priority === 'high' && (
                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <h3 className="font-semibold text-white">{insight.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{insight.message}</p>
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
