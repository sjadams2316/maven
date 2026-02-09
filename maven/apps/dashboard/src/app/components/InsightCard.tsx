'use client';

import { useState } from 'react';
import Link from 'next/link';

interface InsightCardProps {
  type: 'tax' | 'rebalance' | 'opportunity' | 'risk' | 'milestone';
  title: string;
  description: string;
  impact?: string;
  actionLabel?: string;
  actionHref?: string;
  priority?: 'high' | 'medium' | 'low';
  onDismiss?: () => void;
  learnMoreText?: string;
}

const TYPE_CONFIG = {
  tax: { 
    icon: '💰', 
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'from-emerald-900/40 to-teal-900/40',
    borderColor: 'border-emerald-500/30',
    label: 'Tax Opportunity'
  },
  rebalance: { 
    icon: '⚖️', 
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'from-blue-900/40 to-cyan-900/40',
    borderColor: 'border-blue-500/30',
    label: 'Rebalancing'
  },
  opportunity: { 
    icon: '📈', 
    color: 'from-purple-500 to-pink-500',
    bgColor: 'from-purple-900/40 to-pink-900/40',
    borderColor: 'border-purple-500/30',
    label: 'Opportunity'
  },
  risk: { 
    icon: '⚠️', 
    color: 'from-amber-500 to-orange-500',
    bgColor: 'from-amber-900/40 to-orange-900/40',
    borderColor: 'border-amber-500/30',
    label: 'Risk Alert'
  },
  milestone: { 
    icon: '🎉', 
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'from-indigo-900/40 to-purple-900/40',
    borderColor: 'border-indigo-500/30',
    label: 'Milestone'
  },
};

export default function InsightCard({
  type,
  title,
  description,
  impact,
  actionLabel = 'View Details',
  actionHref = '#',
  priority = 'medium',
  onDismiss,
  learnMoreText,
}: InsightCardProps) {
  const config = TYPE_CONFIG[type];
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div className={`bg-gradient-to-br ${config.bgColor} border ${config.borderColor} rounded-xl p-4 relative group`}>
      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs"
        >
          ✕
        </button>
      )}
      
      <div className="flex gap-4">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-2xl flex-shrink-0 shadow-lg`}>
          {config.icon}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-400">{config.label}</span>
            {priority === 'high' && (
              <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">High</span>
            )}
          </div>
          
          <h3 className="font-semibold text-white mb-1 flex items-center gap-2 flex-wrap">
            <span className="break-words">{title}</span>
            {learnMoreText && (
              <span className="relative">
                <button
                  onClick={() => setShowTooltip(!showTooltip)}
                  className="w-6 h-6 sm:w-5 sm:h-5 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white text-xs flex items-center justify-center transition flex-shrink-0"
                  aria-label="Learn more"
                >
                  ?
                </button>
                {showTooltip && (
                  <div className="fixed sm:absolute inset-x-4 sm:inset-x-auto sm:left-0 top-auto sm:top-7 bottom-4 sm:bottom-auto z-50 w-auto sm:w-72 max-w-[calc(100vw-2rem)] p-4 sm:p-3 bg-gray-900 border border-white/20 rounded-xl shadow-xl text-sm text-gray-300 leading-relaxed">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-medium text-indigo-400">💡 What is this?</span>
                      <button
                        onClick={() => setShowTooltip(false)}
                        className="w-8 h-8 sm:w-auto sm:h-auto text-gray-500 hover:text-white text-sm sm:text-xs flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                    {learnMoreText}
                  </div>
                )}
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-400 mb-3">{description}</p>
          
          <div className="flex items-center justify-between">
            {impact && (
              <span className="text-sm font-medium text-emerald-400">{impact}</span>
            )}
            <Link
              href={actionHref}
              className="text-sm text-indigo-400 hover:text-indigo-300 transition"
            >
              {actionLabel} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
