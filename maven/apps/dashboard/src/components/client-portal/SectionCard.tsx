'use client';

import Link from 'next/link';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface SectionCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  accentColor?: 'teal' | 'amber' | 'blue' | 'purple' | 'emerald' | 'rose';
}

const accentStyles = {
  teal: {
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/20',
    hoverBorder: 'hover:border-teal-500/40',
    icon: 'text-teal-400',
    iconBg: 'bg-teal-500/20',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    hoverBorder: 'hover:border-amber-500/40',
    icon: 'text-amber-400',
    iconBg: 'bg-amber-500/20',
  },
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    hoverBorder: 'hover:border-blue-500/40',
    icon: 'text-blue-400',
    iconBg: 'bg-blue-500/20',
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    hoverBorder: 'hover:border-purple-500/40',
    icon: 'text-purple-400',
    iconBg: 'bg-purple-500/20',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    hoverBorder: 'hover:border-emerald-500/40',
    icon: 'text-emerald-400',
    iconBg: 'bg-emerald-500/20',
  },
  rose: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    hoverBorder: 'hover:border-rose-500/40',
    icon: 'text-rose-400',
    iconBg: 'bg-rose-500/20',
  },
};

export function SectionCard({ 
  href, 
  icon: Icon, 
  title, 
  description, 
  accentColor = 'teal' 
}: SectionCardProps) {
  const styles = accentStyles[accentColor];

  return (
    <Link
      href={href}
      className={clsx(
        // L002: 48px minimum touch target (well exceeded with padding)
        'group flex items-start gap-4 p-5 rounded-2xl border transition-all duration-200',
        'bg-[#111827] hover:bg-[#151c2c]',
        styles.border,
        styles.hoverBorder,
        'min-h-[100px]'
      )}
    >
      {/* Icon */}
      <div className={clsx(
        'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105',
        styles.iconBg
      )}>
        <Icon className={clsx('h-6 w-6', styles.icon)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-white group-hover:text-teal-300 transition-colors">
            {title}
          </h3>
          <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-teal-400 transition-colors flex-shrink-0" />
        </div>
        <p className="text-sm text-gray-400 mt-1 line-clamp-2">
          {description}
        </p>
      </div>
    </Link>
  );
}

// Grid wrapper for consistent layout
interface SectionCardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
}

export function SectionCardGrid({ children, columns = 2 }: SectionCardGridProps) {
  return (
    <div className={clsx(
      'grid gap-4',
      columns === 1 && 'grid-cols-1',
      columns === 2 && 'grid-cols-1 md:grid-cols-2',
      columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    )}>
      {children}
    </div>
  );
}
