'use client';

import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  primaryColor?: string;
  className?: string;
}

// L014: Empty states need 3 parts: empathy, explanation, guidance
export function EmptyState({ 
  icon: Icon, 
  title, 
  message, 
  action,
  primaryColor = '#4f46e5',
  className 
}: EmptyStateProps) {
  return (
    <div className={clsx(
      'flex flex-col items-center justify-center text-center py-12 px-6',
      className
    )}>
      {/* Icon with soft background */}
      <div 
        className="h-16 w-16 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: `${primaryColor}15` }}
      >
        <Icon 
          className="h-8 w-8" 
          style={{ color: primaryColor }}
        />
      </div>
      
      {/* Empathy - acknowledge the state */}
      <h3 className="text-xl font-semibold text-slate-900 mb-2">
        {title}
      </h3>
      
      {/* Explanation - why it's empty */}
      <p className="text-slate-600 max-w-sm mb-6">
        {message}
      </p>
      
      {/* Guidance - what to do next */}
      {action && (
        <button
          onClick={action.onClick}
          className="min-h-[48px] min-w-[48px] px-6 py-3 rounded-xl text-white font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: primaryColor }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
