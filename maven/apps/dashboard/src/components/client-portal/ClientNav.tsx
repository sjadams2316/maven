'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PieChart, Lightbulb, MessageCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface ClientNavProps {
  code: string;
  primaryColor?: string;
}

const navItems = [
  { icon: Home, label: 'Home', path: '' },
  { icon: PieChart, label: 'Portfolio', path: '/portfolio' },
  { icon: Lightbulb, label: 'Insights', path: '/insights' },
  { icon: MessageCircle, label: 'Contact', path: '/contact' },
];

export function ClientNav({ code, primaryColor = '#4f46e5' }: ClientNavProps) {
  const pathname = usePathname();
  const basePath = `/c/${code}`;

  return (
    <>
      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 safe-area-pb">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const href = `${basePath}${item.path}`;
            const isActive = pathname === href || (item.path === '' && pathname === basePath);
            
            return (
              <Link
                key={item.path}
                href={href}
                className={clsx(
                  // L002: 48px minimum touch target
                  'flex flex-col items-center justify-center min-h-[64px] min-w-[64px] px-3 py-2',
                  'transition-colors duration-150'
                )}
                style={{
                  color: isActive ? primaryColor : '#64748b'
                }}
              >
                <item.icon 
                  className={clsx(
                    'h-6 w-6 mb-1',
                    isActive && 'stroke-[2.5px]'
                  )} 
                />
                <span className={clsx(
                  'text-xs font-medium',
                  isActive && 'font-semibold'
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-col w-56 bg-white border-r border-slate-200 min-h-screen p-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const href = `${basePath}${item.path}`;
            const isActive = pathname === href || (item.path === '' && pathname === basePath);
            
            return (
              <Link
                key={item.path}
                href={href}
                className={clsx(
                  // L002: 48px minimum touch target
                  'flex items-center gap-3 min-h-[48px] px-4 py-3 rounded-xl',
                  'transition-colors duration-150',
                  isActive 
                    ? 'text-white font-semibold' 
                    : 'text-slate-600 hover:bg-slate-100'
                )}
                style={{
                  backgroundColor: isActive ? primaryColor : undefined
                }}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-base">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
