'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
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
  Menu,
  Target,
  EyeOff,
  Search
} from 'lucide-react';
import { clsx } from 'clsx';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { useClientPortalSettings } from '@/hooks/useClientPortalSettings';
import type { ClientPortalSections } from '@/lib/client-portal-settings';

interface PortalNavigationProps {
  code: string;
}

interface NavSection {
  icon: typeof Home;
  label: string;
  path: string;
  description: string;
  sectionKey?: keyof ClientPortalSections; // Maps to settings.sections
}

const navSections: NavSection[] = [
  { icon: Home, label: 'Home', path: '', description: 'Dashboard & overview' },
  { icon: Users, label: 'Family', path: '/family', description: 'Household members', sectionKey: 'family' },
  { icon: PieChart, label: 'Portfolio', path: '/portfolio', description: 'Holdings & performance', sectionKey: 'portfolio' },
  { icon: Target, label: 'Goals', path: '/goals', description: 'Track your progress', sectionKey: 'goals' },
  { icon: Search, label: 'Explore', path: '/explore', description: 'Research investments', sectionKey: 'explore' },
  { icon: Shield, label: 'Social Security', path: '/social-security', description: 'Benefits & strategy', sectionKey: 'socialSecurity' },
  { icon: Landmark, label: 'Estate', path: '/estate', description: 'Beneficiaries & planning', sectionKey: 'estate' },
  { icon: Receipt, label: 'Tax', path: '/tax', description: 'Projections & planning', sectionKey: 'taxPlanning' },
  { icon: Heart, label: 'Philanthropy', path: '/philanthropy', description: 'Charitable giving', sectionKey: 'philanthropy' },
  { icon: FileText, label: 'Documents', path: '/documents', description: 'Your document vault', sectionKey: 'documents' },
  { icon: MessageCircle, label: 'Messages', path: '/messages', description: 'Contact Maven Partners', sectionKey: 'messages' },
];

function PortalNavigationInner({ code }: PortalNavigationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const basePath = `/c/${code}`;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Fetch settings to determine which sections to show
  const { settings, isLoading, isSectionEnabled } = useClientPortalSettings(code);
  
  // Check if in advisor preview mode
  const isPreview = searchParams.get('preview') === 'true';

  // Filter nav items based on settings
  const visibleNavItems = useMemo(() => {
    if (isLoading) {
      // While loading, show all items to avoid layout shift
      return navSections;
    }
    
    return navSections.filter(item => {
      // Home is always visible
      if (!item.sectionKey) return true;
      
      // Check if section is enabled in settings
      return isSectionEnabled(item.sectionKey);
    });
  }, [isLoading, isSectionEnabled]);
  
  // For preview mode: get hidden sections to show indicator
  const hiddenNavItems = useMemo(() => {
    if (!isPreview || isLoading) return [];
    
    return navSections.filter(item => {
      if (!item.sectionKey) return false;
      return !isSectionEnabled(item.sectionKey);
    });
  }, [isPreview, isLoading, isSectionEnabled]);

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
          {visibleNavItems.map((item) => {
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
          
          {/* Preview Mode: Show hidden sections indicator */}
          {isPreview && hiddenNavItems.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-gray-500 px-4 mb-2 flex items-center gap-1.5">
                <EyeOff className="h-3 w-3" />
                Hidden for this client
              </p>
              {hiddenNavItems.map((item) => (
                <div
                  key={item.path}
                  className="flex items-center gap-3 min-h-[44px] px-4 py-2 rounded-xl text-gray-600 opacity-50"
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm line-through">{item.label}</span>
                </div>
              ))}
            </div>
          )}
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
          {visibleNavItems.map((item) => {
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
          
          {/* Preview Mode: Show hidden sections indicator */}
          {isPreview && hiddenNavItems.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-gray-500 px-4 mb-2 flex items-center gap-1.5">
                <EyeOff className="h-3 w-3" />
                Hidden for this client
              </p>
              {hiddenNavItems.map((item) => (
                <div
                  key={item.path}
                  className="flex items-center gap-3 min-h-[40px] px-4 py-2 rounded-xl text-gray-600 opacity-50"
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs line-through">{item.label}</span>
                </div>
              ))}
            </div>
          )}
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

// Skeleton loader for navigation
function NavigationSkeleton() {
  return (
    <>
      {/* Mobile button placeholder */}
      <div className="md:hidden fixed top-4 left-4 z-50 w-12 h-12 bg-[#111827]/90 rounded-xl animate-pulse" />
      
      {/* Desktop sidebar skeleton */}
      <nav className="hidden md:flex flex-col w-64 bg-[#0a1628] border-r border-white/10 min-h-screen flex-shrink-0">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
              <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </nav>
    </>
  );
}

// Export wrapped in Suspense for useSearchParams compatibility
export function PortalNavigation({ code }: PortalNavigationProps) {
  return (
    <Suspense fallback={<NavigationSkeleton />}>
      <PortalNavigationInner code={code} />
    </Suspense>
  );
}
