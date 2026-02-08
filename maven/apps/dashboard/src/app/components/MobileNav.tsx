'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: '🏠' },
  { href: '/goals', label: 'Goals', icon: '🎯' },
  { href: '/oracle', label: 'Oracle', icon: '🔮' },
  { href: '/family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { href: '/settings', label: 'More', icon: '☰' },
];

export default function MobileNav() {
  const pathname = usePathname();
  
  // Don't show on certain pages
  const hiddenPaths = ['/onboarding', '/join', '/home', '/vision'];
  if (hiddenPaths.some(p => pathname?.startsWith(p))) return null;
  
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/10 z-50 safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition ${
                isActive 
                  ? 'text-indigo-400' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
              {isActive && (
                <span className="absolute -bottom-0.5 w-1 h-1 bg-indigo-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
