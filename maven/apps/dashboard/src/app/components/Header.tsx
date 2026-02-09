'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useUser, UserButton, SignInButton } from '@clerk/nextjs';
import { openOracle } from '@/lib/open-oracle';
import ProfileCompletionIndicator from './ProfileCompletionIndicator';

interface HeaderProps {
  profile?: {
    firstName?: string;
    netWorth?: number;
    totalInvestments?: number;
  } | null;
  showFinancialSummary?: boolean;
}

export default function Header({ profile, showFinancialSummary = true }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useUser();

  // Calculate totals from profile if available
  const netWorth = profile?.netWorth || 0;
  const totalInvestments = profile?.totalInvestments || 0;

  const navLinks: { href: string; label: string; highlight?: boolean }[] = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/portfolio-lab', label: 'Portfolio Lab' },
    { href: '/goals', label: 'Goals' },
    { href: '/family', label: 'Family' },
    { href: '/oracle', label: 'Oracle' },
    { href: '/advisor', label: 'Advisor', highlight: true },
  ];

  return (
    <header className="border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Always links to home */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white">
              M
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Maven</h1>
              <p className="text-xs text-gray-500">AI Wealth Partner</p>
            </div>
          </Link>

          {/* Financial Summary (shown on homepage when user has data) */}
          {showFinancialSummary && netWorth > 0 && pathname === '/' && (
            <div className="hidden md:flex items-center gap-6 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
              <div>
                <p className="text-xs text-gray-500">Net Worth</p>
                <p className="text-lg font-semibold text-white">
                  ${netWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              {totalInvestments > 0 && (
                <div className="border-l border-white/10 pl-4">
                  <p className="text-xs text-gray-500">Investments</p>
                  <p className="text-lg font-semibold text-emerald-400">
                    ${totalInvestments.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <nav className="hidden sm:flex items-center gap-6">
            {navLinks.map((link) => (
              link.href === '/oracle' ? (
                <div key={link.href} className="flex items-center gap-3">
                  {/* Profile Completion Indicator - shown next to Oracle */}
                  <ProfileCompletionIndicator />
                  <button
                    onClick={() => openOracle()}
                    className="text-sm transition text-purple-400 hover:text-purple-300"
                  >
                    🔮 {link.label}
                  </button>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm transition ${
                    pathname === link.href || pathname?.startsWith(link.href + '/')
                      ? 'text-indigo-400 font-medium'
                      : link.highlight
                      ? 'text-amber-400 hover:text-amber-300'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {link.label}
                  {link.highlight && (
                    <span className="ml-1 text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
                      Pro
                    </span>
                  )}
                </Link>
              )
            ))}
          </nav>

          {/* Right side - Auth & Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {isLoaded && (
              <>
                {isSignedIn ? (
                  <>
                    {/* Settings link when signed in */}
                    <Link
                      href="/settings"
                      className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-400 hover:text-white transition"
                    >
                      Settings
                    </Link>
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: "w-8 h-8 sm:w-9 sm:h-9"
                        }
                      }}
                    />
                  </>
                ) : (
                  <>
                    {/* Get Started & Sign In when not signed in */}
                    <Link
                      href="/onboarding"
                      className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-400 hover:text-white transition"
                    >
                      Get Started
                    </Link>
                    <SignInButton mode="modal">
                      <button className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition">
                        Sign In
                      </button>
                    </SignInButton>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="sm:hidden flex items-center gap-4 mt-3 overflow-x-auto pb-1">
          {navLinks.map((link) => (
            link.href === '/oracle' ? (
              <button
                key={link.href}
                onClick={() => openOracle()}
                className="text-sm whitespace-nowrap transition text-purple-400 hover:text-purple-300"
              >
                🔮 Oracle
              </button>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm whitespace-nowrap transition ${
                  pathname === link.href
                    ? 'text-indigo-400 font-medium'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            )
          ))}
        </nav>
      </div>
    </header>
  );
}
