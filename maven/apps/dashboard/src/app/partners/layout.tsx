'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';

// Partners Portal Layout - distinct from consumer Maven
export default function PartnersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in?redirect_url=/partners/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  // Close sidebar when navigating on mobile
  const handleNavClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null; // Will redirect
  }

  const navItems = [
    { href: '/partners/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/partners/clients', label: 'Clients', icon: '👥' },
    { href: '/partners/rebalance', label: 'Rebalance', icon: '⚖️' },
    { href: '/partners/insights', label: 'Insights', icon: '💡' },
    { href: '/partners/compliance', label: 'Compliance', icon: '✅' },
    { href: '/partners/reports', label: 'Reports', icon: '📄' },
    { href: '/partners/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a12] flex">
      {/* Mobile Header with Hamburger */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#0d0d18] border-b border-white/10 px-4 h-16 flex items-center justify-between">
        <Link href="/partners/dashboard" className="flex items-center gap-3">
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
          fixed md:sticky top-0 left-0 z-50 h-screen
          bg-[#0d0d18] border-r border-white/10 
          flex flex-col transition-all duration-300 ease-in-out
          ${isMobile 
            ? `w-72 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} pt-16`
            : sidebarOpen ? 'w-64' : 'w-20'
          }
        `}
      >
        {/* Logo - Desktop only */}
        <div className="hidden md:block p-6 border-b border-white/10">
          <Link href="/partners/dashboard" className="flex items-center gap-3 min-h-[48px]">
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
              href={item.href}
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
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10"
                }
              }}
            />
            {(sidebarOpen || isMobile) && (
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">
                  {user?.fullName || user?.primaryEmailAddress?.emailAddress}
                </div>
                <div className="text-gray-500 text-xs">Advisor</div>
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
      <main className="flex-1 overflow-auto pt-16 md:pt-0">
        {children}
      </main>
    </div>
  );
}
