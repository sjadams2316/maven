'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  PieChart, 
  Shield, 
  Landmark, 
  Receipt, 
  Heart, 
  FileText, 
  MessageCircle,
  ChevronRight,
  X,
  Menu
} from 'lucide-react';
import { clsx } from 'clsx';
import { useState, useEffect } from 'react';

interface PortalNavigationProps {
  code: string;
}

const navSections = [
  { icon: Home, label: 'Home', path: '', description: 'Dashboard & overview' },
  { icon: Users, label: 'Family', path: '/family', description: 'Household members' },
  { icon: PieChart, label: 'Portfolio', path: '/portfolio', description: 'Holdings & performance' },
  { icon: Shield, label: 'Social Security', path: '/social-security', description: 'Benefits & strategy' },
  { icon: Landmark, label: 'Estate', path: '/estate', description: 'Beneficiaries & planning' },
  { icon: Receipt, label: 'Tax', path: '/tax', description: 'Projections & planning' },
  { icon: Heart, label: 'Philanthropy', path: '/philanthropy', description: 'Charitable giving' },
  { icon: FileText, label: 'Documents', path: '/documents', description: 'Your document vault' },
  { icon: MessageCircle, label: 'Messages', path: '/messages', description: 'Contact Maven Partners' },
];

export function PortalNavigation({ code }: PortalNavigationProps) {
  const pathname = usePathname();
  const basePath = `/c/${code}`;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const isActive = (path: string) => {
    const href = `${basePath}${path}`;
    if (path === '') {
      return pathname === basePath || pathname === `${basePath}/`;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Button - Fixed in header area */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-3 bg-[#111827]/90 backdrop-blur-sm border border-white/10 rounded-xl text-gray-400 hover:text-white transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
        aria-label="Open navigation menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-out Menu */}
      <nav 
        className={clsx(
          'md:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-[#0a1628] border-r border-white/10 z-50 transform transition-transform duration-300 ease-out overflow-y-auto',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="sticky top-0 bg-[#0a1628] border-b border-white/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg shadow-teal-500/20">
              MP
            </div>
            <span className="font-semibold text-white">Maven Partners</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-gray-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close navigation menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-4 space-y-1">
          {navSections.map((item) => {
            const href = `${basePath}${item.path}`;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                href={href}
                className={clsx(
                  // L002: 48px minimum touch target
                  'flex items-center gap-3 min-h-[52px] px-4 py-3 rounded-xl transition-all duration-200',
                  active 
                    ? 'bg-teal-500/10 text-teal-400 font-semibold border border-teal-500/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                <item.icon className={clsx('h-5 w-5 flex-shrink-0', active && 'stroke-[2.5px]')} />
                <span className="text-base">{item.label}</span>
                {active && <ChevronRight className="h-4 w-4 ml-auto" />}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-64 bg-[#0a1628] border-r border-white/10 min-h-screen flex-shrink-0">
        {/* Logo Header */}
        <div className="p-4 border-b border-white/10">
          <Link href={basePath} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg shadow-teal-500/20">
              MP
            </div>
            <div>
              <p className="font-semibold text-white">Maven Partners</p>
              <p className="text-xs text-gray-500">Client Portal</p>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navSections.map((item) => {
            const href = `${basePath}${item.path}`;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                href={href}
                className={clsx(
                  // L002: 48px minimum touch target
                  'flex items-center gap-3 min-h-[48px] px-4 py-3 rounded-xl transition-all duration-200 group',
                  active 
                    ? 'bg-teal-500/10 text-teal-400 font-semibold border border-teal-500/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                <item.icon className={clsx('h-5 w-5 flex-shrink-0', active && 'stroke-[2.5px]')} />
                <span className="text-sm">{item.label}</span>
                {active && <ChevronRight className="h-4 w-4 ml-auto opacity-60" />}
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <p className="text-xs text-gray-500 text-center">
            Powered by <span className="text-teal-400">Maven</span>
          </p>
        </div>
      </nav>
    </>
  );
}
