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

export function ClientNav({ code, primaryColor = '#f59e0b' }: ClientNavProps) {
  const pathname = usePathname();
  const basePath = `/c/${code}`;

  return (
    <>
      {/* Mobile bottom navigation - dark theme */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#12121a]/95 backdrop-blur-xl border-t border-white/10 z-50 safe-area-pb">
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
                  'transition-all duration-200',
                  isActive 
                    ? 'text-amber-400' 
                    : 'text-gray-500 hover:text-gray-300'
                )}
              >
                <div className={clsx(
                  'relative p-1.5 rounded-xl transition-all duration-200',
                  isActive && 'bg-amber-500/10'
                )}>
                  <item.icon 
                    className={clsx(
                      'h-6 w-6',
                      isActive && 'stroke-[2.5px]'
                    )} 
                  />
                </div>
                <span className={clsx(
                  'text-xs mt-1',
                  isActive ? 'font-semibold' : 'font-medium'
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar - dark theme */}
      <nav className="hidden md:flex flex-col w-56 bg-[#12121a] border-r border-white/10 min-h-screen p-4">
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
                  'transition-all duration-200',
                  isActive 
                    ? 'bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                <item.icon className={clsx(
                  'h-5 w-5',
                  isActive && 'stroke-[2.5px]'
                )} />
                <span className="text-base">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
