'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';

// Demo advisor data
const DEMO_ADVISOR = {
  name: 'Sam Adams',
  email: 'sam@mavenadvisors.com',
  firm: 'Maven Wealth Advisors',
  avatar: null,
};

// Inner layout component that uses useSearchParams
function PartnersLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check for demo mode via query param
  const isDemoMode = searchParams.get('demo') === 'true';

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-expand sidebar on desktop
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Redirect to sign-in if not authenticated AND not in demo mode
  useEffect(() => {
    if (isLoaded && !isSignedIn && !isDemoMode) {
      router.push('/sign-in?redirect_url=/partners/dashboard');
    }
  }, [isLoaded, isSignedIn, isDemoMode, router]);

  // Close sidebar when navigating on mobile
  const handleNavClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Helper to preserve demo param in nav links
  const getNavHref = (href: string) => {
    return isDemoMode ? `${href}?demo=true` : href;
  };

  // Loading state (skip if demo mode)
  if (!isDemoMode && !isLoaded) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // Not signed in and not demo mode - will redirect
  if (!isDemoMode && !isSignedIn) {
    return null;
  }

  // Determine display name
  const displayName = isDemoMode 
    ? DEMO_ADVISOR.name 
    : (user?.fullName || user?.primaryEmailAddress?.emailAddress);

  const navItems = [
    { href: '/partners/dashboard', label: 'Dashboard', icon: '📈' },
    { href: '/partners/clients', label: 'Clients', icon: '👥' },
    { href: '/partners/compare', label: 'Compare', icon: '🔀' },
    { href: '/partners/models', label: 'Models', icon: '📊' },
    { href: '/partners/rebalance', label: 'Rebalance', icon: '⚖️' },
    { href: '/partners/alternatives', label: 'Alternatives', icon: '🏦' },
    { href: '/partners/insights', label: 'Insights', icon: '💡' },
    { href: '/partners/compliance', label: 'Compliance', icon: '✅' },
    { href: '/partners/reports', label: 'Reports', icon: '📄' },
    { href: '/partners/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a12] flex">
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-amber-600 to-amber-500 text-white text-center py-2 px-4 text-sm font-medium">
          <span className="mr-2">🎯</span>
          Demo Mode — Explore Maven Partners with sample data
          <Link 
            href="/partners/dashboard" 
            className="ml-4 underline hover:no-underline"
          >
            Sign in for real →
          </Link>
        </div>
      )}

      {/* Mobile Header with Hamburger */}
      <header className={`md:hidden fixed left-0 right-0 z-40 bg-[#0d0d18] border-b border-white/10 px-4 h-16 flex items-center justify-between ${isDemoMode ? 'top-10' : 'top-0'}`}>
        <Link href={getNavHref('/partners/dashboard')} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <div>
            <div className="text-white font-semibold text-sm">Maven</div>
            <div className="text-amber-500 text-xs font-medium tracking-wider">PARTNERS</div>
          </div>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="min-w-[48px] min-h-[48px] flex items-center justify-center text-white hover:bg-white/10 rounded-xl transition-colors"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky left-0 z-50 h-screen
          bg-[#0d0d18] border-r border-white/10 
          flex flex-col transition-all duration-300 ease-in-out
          ${isDemoMode ? 'top-10' : 'top-0'}
          ${isMobile 
            ? `w-72 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} pt-16`
            : sidebarOpen ? 'w-64' : 'w-20'
          }
        `}
        style={{ height: isDemoMode ? 'calc(100vh - 40px)' : '100vh' }}
      >
        {/* Logo - Desktop only */}
        <div className="hidden md:block p-6 border-b border-white/10">
          <Link href={getNavHref('/partners/dashboard')} className="flex items-center gap-3 min-h-[48px]">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            {sidebarOpen && (
              <div>
                <div className="text-white font-semibold">Maven</div>
                <div className="text-amber-500 text-xs font-medium tracking-wider">PARTNERS</div>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={getNavHref(item.href)}
              onClick={handleNavClick}
              className="flex items-center gap-3 px-4 min-h-[48px] rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group"
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {(sidebarOpen || isMobile) && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 min-h-[48px]">
            {isDemoMode ? (
              // Demo mode avatar
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold">
                {DEMO_ADVISOR.name.split(' ').map(n => n[0]).join('')}
              </div>
            ) : (
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10"
                  }
                }}
              />
            )}
            {(sidebarOpen || isMobile) && (
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">
                  {displayName}
                </div>
                <div className="text-gray-500 text-xs">
                  {isDemoMode ? 'Demo Advisor' : 'Advisor'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Collapse toggle - Desktop only */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden md:flex p-4 border-t border-white/10 text-gray-500 hover:text-white transition-colors min-h-[48px] items-center justify-center"
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </aside>

      {/* Main content */}
      <main className={`flex-1 overflow-auto ${isDemoMode ? 'pt-10 md:pt-10' : ''} ${isMobile ? 'pt-16' : ''} ${isDemoMode && isMobile ? 'pt-26' : ''}`}>
        {children}
      </main>
    </div>
  );
}

// Loading fallback
function LayoutFallback() {
  return (
    <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
    </div>
  );
}

// Main layout with Suspense boundary for useSearchParams
export default function PartnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LayoutFallback />}>
      <PartnersLayoutInner>{children}</PartnersLayoutInner>
    </Suspense>
  );
}
