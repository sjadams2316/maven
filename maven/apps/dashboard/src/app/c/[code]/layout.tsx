'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useSearchParams } from 'next/navigation';

// Demo advisor data
const DEMO_ADVISOR = {
  name: 'Sam Adams',
  firm: 'Adams Wealth Partners',
  logo: null,
  primaryColor: '#F59E0B',
};

function ClientLayoutInner({ children }: { children: React.ReactNode }) {
  const params = useParams<{ code: string }>();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isPreview = searchParams.get('preview') === 'true';
  const isAdvisor = searchParams.get('advisor') === 'true';

  const navItems = [
    { href: `/c/${params.code}`, label: 'Home', icon: '🏠' },
    { href: `/c/${params.code}/portfolio`, label: 'Portfolio', icon: '📊' },
    { href: `/c/${params.code}/goals`, label: 'Goals', icon: '🎯' },
    { href: `/c/${params.code}/documents`, label: 'Documents', icon: '📁' },
    { href: `/c/${params.code}/contact`, label: 'Contact', icon: '💬' },
  ];

  const isActive = (href: string) => {
    if (href === `/c/${params.code}`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Preview Banner */}
      {isPreview && (
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-white text-center py-2 px-4 text-sm font-medium">
          <span className="mr-2">👁️</span>
          Advisor Preview — This is how your client sees their portal
          <Link 
            href={`/partners/clients/1`}
            className="ml-4 underline hover:no-underline"
          >
            Back to client →
          </Link>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0f]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo / Firm Name */}
            <Link href={`/c/${params.code}`} className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                style={{ background: `linear-gradient(135deg, ${DEMO_ADVISOR.primaryColor}, ${DEMO_ADVISOR.primaryColor}dd)` }}
              >
                {DEMO_ADVISOR.firm.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </div>
              <div className="hidden sm:block">
                <p className="text-white font-semibold text-sm">{DEMO_ADVISOR.firm}</p>
                <p className="text-gray-500 text-xs">Client Portal</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-white/10 px-4 py-2 bg-[#0a0a0f]">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[48px] ${
                  isActive(item.href)
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 mt-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm">
            Powered by <span className="text-amber-500">Maven</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

// Loading fallback
function LayoutFallback({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <header className="border-b border-white/10 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="h-10 w-32 bg-white/10 rounded animate-pulse" />
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

export default function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LayoutFallback>{children}</LayoutFallback>}>
      <ClientLayoutInner>{children}</ClientLayoutInner>
    </Suspense>
  );
}
