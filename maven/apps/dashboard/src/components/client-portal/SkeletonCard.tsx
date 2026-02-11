'use client';

import { clsx } from 'clsx';

interface SkeletonCardProps {
  className?: string;
  lines?: number;
  showHeader?: boolean;
}

// L006: Skeleton loaders match real layout
export function SkeletonCard({ className, lines = 2, showHeader = true }: SkeletonCardProps) {
  return (
    <div className={clsx(
      'bg-white rounded-2xl p-6 shadow-sm border border-slate-100',
      className
    )}>
      {showHeader && (
        <div className="h-5 w-32 bg-slate-200 rounded animate-pulse mb-4" />
      )}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div 
            key={i} 
            className="h-4 bg-slate-200 rounded animate-pulse"
            style={{ width: `${85 - (i * 15)}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonValue({ className }: { className?: string }) {
  return (
    <div className={clsx('space-y-2', className)}>
      <div className="h-8 w-40 bg-slate-200 rounded animate-pulse" />
      <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
    </div>
  );
}

export function SkeletonList({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonCard key={i} lines={2} />
      ))}
    </div>
  );
}
