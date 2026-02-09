'use client';

import { useState } from 'react';
import Link from 'next/link';

interface QuickAction {
  id: string;
  icon: string;
  label: string;
  href?: string;
  onClick?: () => void;
  color: string;
  badge?: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'oracle',
    icon: '🔮',
    label: 'Ask Oracle',
    href: '/oracle',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'link',
    icon: '🔗',
    label: 'Link Account',
    href: '/accounts/link',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'harvest',
    icon: '🌾',
    label: 'Tax Harvest',
    href: '/tax-harvesting',
    color: 'from-emerald-500 to-teal-500',
    badge: '3',
  },
  {
    id: 'goal',
    icon: '🎯',
    label: 'Add Goal',
    href: '/goals',
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'fragility',
    icon: '📊',
    label: 'Market Check',
    href: '/fragility',
    color: 'from-red-500 to-rose-500',
  },
  {
    id: 'docs',
    icon: '📄',
    label: 'Documents',
    href: '/documents',
    color: 'from-indigo-500 to-purple-500',
  },
];

export default function QuickActions() {
  const [mobileExpanded, setMobileExpanded] = useState(false);
  
  // On mobile (< sm), show 4 by default, expandable to all
  // On desktop (>= sm), always show all actions
  const mobileVisibleActions = mobileExpanded ? QUICK_ACTIONS : QUICK_ACTIONS.slice(0, 4);
  
  return (
    <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Quick Actions</h3>
        {/* Only show expand button on mobile */}
        {QUICK_ACTIONS.length > 4 && (
          <button
            onClick={() => setMobileExpanded(!mobileExpanded)}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition sm:hidden"
          >
            {mobileExpanded ? 'Show less' : `+${QUICK_ACTIONS.length - 4} more`}
          </button>
        )}
      </div>
      
      {/* Mobile: show limited actions with expand option */}
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        {mobileVisibleActions.map((action) => (
          <Link
            key={action.id}
            href={action.href || '#'}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition group relative"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-2xl group-hover:scale-110 transition shadow-lg`}>
              {action.icon}
            </div>
            <span className="text-xs text-gray-400 group-hover:text-white transition text-center">
              {action.label}
            </span>
            {action.badge && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {action.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
      
      {/* Desktop: always show all actions in a responsive grid */}
      <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-3 gap-3">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.id}
            href={action.href || '#'}
            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition group relative"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-2xl group-hover:scale-110 transition shadow-lg`}>
              {action.icon}
            </div>
            <span className="text-xs text-gray-400 group-hover:text-white transition text-center">
              {action.label}
            </span>
            {action.badge && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {action.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
