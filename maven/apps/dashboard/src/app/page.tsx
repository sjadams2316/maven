'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useUser, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { useMemeRedirect } from './components/MemeInterstitial';
import { useUserProfile } from '@/providers/UserProvider';
import DemoModal from './components/DemoModal';
import FirstWinModal from './components/FirstWinModal';
import { enableDemoMode } from '@/lib/demo-profile';

export default function LandingPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const [marketData, setMarketData] = useState<any>(null);
  const [showDemo, setShowDemo] = useState(false);
  const [showFirstWin, setShowFirstWin] = useState(false);
  const { triggerMeme, MemeComponent } = useMemeRedirect();
  
  // Use centralized UserProvider
  const { profile, financials, isLoading: checkingProfile, isOnboarded, isDemoMode, enterDemoMode } = useUserProfile();
  
  // Handle entering demo mode - show first win insight before dashboard
  const handleExploreDemoMode = () => {
    enterDemoMode();
    setShowFirstWin(true);
  };
  
  // Continue to dashboard after first win
  const handleFirstWinContinue = () => {
    setShowFirstWin(false);
    router.push('/dashboard');
  };

  // No auto-redirect - let users see landing page first
  // They can click "Go to Dashboard" to proceed

  useEffect(() => {
    fetch('/api/market-data')
      .then(res => res.json())
      .then(data => {
        // Transform API response to expected format
        const stocks = data.stocks || [];
        const crypto = data.crypto || [];
        
        // Map stocks array to indices object
        const spyData = stocks.find((s: { symbol: string }) => s.symbol === 'SPY');
        const qqqData = stocks.find((s: { symbol: string }) => s.symbol === 'QQQ');
        const diaData = stocks.find((s: { symbol: string }) => s.symbol === 'DIA');
        
        // Map crypto array to object
        const btcData = crypto.find((c: { symbol: string }) => c.symbol === 'BTC');
        
        setMarketData({
          indices: {
            sp500: spyData ? { price: spyData.price, changePercent: spyData.changePercent } : null,
            nasdaq: qqqData ? { price: qqqData.price, changePercent: qqqData.changePercent } : null,
            dow: diaData ? { price: diaData.price, changePercent: diaData.changePercent } : null,
          },
          crypto: {
            BTC: btcData ? { price: btcData.price, changePercent: btcData.changePercent } : null,
          },
          timestamp: data.timestamp,
        });
      })
      .catch(() => {});
  }, []);

  // Use financials from UserProvider - only show for signed-in, onboarded users (not demo mode)
  const financialSummary = (isSignedIn && isOnboarded && !isDemoMode && financials && financials.netWorth > 0) ? {
    netWorth: financials.netWorth,
    investments: financials.totalRetirement + financials.totalInvestments,
    cash: financials.totalCash
  } : null;
  
  // Landing page always shown - no auto-redirect

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {MemeComponent}
      
      {/* Demo Modal */}
      <DemoModal
        isOpen={showDemo}
        onClose={() => setShowDemo(false)}
        onGetStarted={() => {
          setShowDemo(false);
          triggerMeme('/onboarding', 'cta');
        }}
        autoPlay={true}
      />
      
      {/* First Win Modal - shows insight before entering demo */}
      <FirstWinModal
        isOpen={showFirstWin}
        onContinue={handleFirstWinContinue}
      />
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-600/10 rounded-full blur-3xl" />

        {/* Header */}
        <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-90 transition">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl sm:text-2xl font-bold">
                M
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Maven</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Financial Clarity</p>
              </div>
            </Link>
            
            {/* Financial Summary (when signed in with data) */}
            {financialSummary && (
              <div className="hidden md:flex items-center gap-6 px-5 py-2 bg-white/5 border border-white/10 rounded-xl">
                <div>
                  <p className="text-xs text-gray-500">Net Worth</p>
                  <p className="text-lg font-semibold text-white">
                    ${financialSummary.netWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
                {financialSummary.investments > 0 && (
                  <div className="border-l border-white/10 pl-4">
                    <p className="text-xs text-gray-500">Investments</p>
                    <p className="text-lg font-semibold text-emerald-400">
                      ${financialSummary.investments.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-purple-500/20 text-purple-300 rounded-full">Private Beta</span>
              
              {isLoaded && (
                <>
                  {isSignedIn ? (
                    <>
                      <Link
                        href="/onboarding"
                        className="hidden sm:block px-3 py-1.5 text-sm text-gray-400 hover:text-white transition"
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
                    <SignInButton mode="modal">
                      <button className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition">
                        Sign In
                      </button>
                    </SignInButton>
                  )}
                </>
              )}
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-12 sm:pt-16 sm:pb-20 md:pt-20 md:pb-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/5 border border-white/10 rounded-full mb-6 sm:mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs sm:text-sm text-gray-300">Private Beta ✨</span>
            </div>
            
            {/* THE SINGLE PROMISE */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              Understand Your Money.
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">Make Smarter Decisions.</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-400 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
              Maven is your AI wealth intelligence partner — the clarity of a family office, 
              without handing control to a black box.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 px-4 sm:px-0">
              <button
                onClick={() => triggerMeme('/sign-up', 'cta')}
                className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold text-lg sm:text-xl rounded-xl transition transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
              >
                Get Started Free
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button
                onClick={handleExploreDemoMode}
                className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-5 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold text-base sm:text-lg rounded-xl transition flex items-center justify-center gap-2"
              >
                <span className="text-lg">🎮</span>
                Try Demo — No Signup
              </button>
            </div>
            
            {/* Trust signals - simpler */}
            <p className="text-sm text-gray-500 mb-10">
              Free during beta • No credit card • Your data stays private
            </p>

            {/* Live Market Ticker - Yahoo Finance Style */}
            {marketData && (
              <div className="w-full max-w-4xl mx-auto">
                {/* Market Status */}
                <div className="flex items-center justify-center gap-3 mb-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span>US Markets Closed</span>
                  </div>
                  <span className="text-gray-600">•</span>
                  <span>As of {new Date(marketData.timestamp).toLocaleString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true 
                  })}</span>
                </div>
                
                {/* Index Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {/* S&P 500 */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 hover:bg-white/[0.07] transition group">
                    <div className="text-xs text-gray-500 mb-1">S&P 500</div>
                    <div className="text-lg sm:text-xl font-bold text-white">
                      {marketData.indices?.sp500?.price?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-sm font-medium ${marketData.indices?.sp500?.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {marketData.indices?.sp500?.changePercent >= 0 ? '▲' : '▼'} {Math.abs(marketData.indices?.sp500?.changePercent || 0).toFixed(2)}%
                      </span>
                      {/* Realistic sparkline with gradient */}
                      <svg className="w-16 h-8 ml-auto" viewBox="0 0 64 32" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="sparkGreen1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={marketData.indices?.sp500?.changePercent >= 0 ? '#10b981' : '#ef4444'} stopOpacity="0.3"/>
                            <stop offset="100%" stopColor={marketData.indices?.sp500?.changePercent >= 0 ? '#10b981' : '#ef4444'} stopOpacity="0"/>
                          </linearGradient>
                        </defs>
                        <path 
                          d={marketData.indices?.sp500?.changePercent >= 0 
                            ? "M0,24 C4,22 8,26 12,20 C16,14 20,18 24,15 C28,12 32,16 36,10 C40,6 44,9 48,7 C52,5 56,8 60,5 L64,4" 
                            : "M0,8 C4,10 8,6 12,12 C16,18 20,14 24,17 C28,20 32,16 36,22 C40,26 44,23 48,25 C52,27 56,24 60,27 L64,28"}
                          fill="url(#sparkGreen1)"
                        />
                        <path 
                          d={marketData.indices?.sp500?.changePercent >= 0 
                            ? "M0,24 C4,22 8,26 12,20 C16,14 20,18 24,15 C28,12 32,16 36,10 C40,6 44,9 48,7 C52,5 56,8 60,5 L64,4" 
                            : "M0,8 C4,10 8,6 12,12 C16,18 20,14 24,17 C28,20 32,16 36,22 C40,26 44,23 48,25 C52,27 56,24 60,27 L64,28"}
                          fill="none" 
                          stroke={marketData.indices?.sp500?.changePercent >= 0 ? '#10b981' : '#ef4444'} 
                          strokeWidth="2"
                          strokeLinecap="round"
                          className="group-hover:stroke-[2.5] transition-all"
                        />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Dow Jones */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 hover:bg-white/[0.07] transition group">
                    <div className="text-xs text-gray-500 mb-1">Dow Jones</div>
                    <div className="text-lg sm:text-xl font-bold text-white">
                      {marketData.indices?.dow?.price?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-sm font-medium ${marketData.indices?.dow?.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {marketData.indices?.dow?.changePercent >= 0 ? '▲' : '▼'} {Math.abs(marketData.indices?.dow?.changePercent || 0).toFixed(2)}%
                      </span>
                      <svg className="w-16 h-8 ml-auto" viewBox="0 0 64 32" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="sparkGreen2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={marketData.indices?.dow?.changePercent >= 0 ? '#10b981' : '#ef4444'} stopOpacity="0.3"/>
                            <stop offset="100%" stopColor={marketData.indices?.dow?.changePercent >= 0 ? '#10b981' : '#ef4444'} stopOpacity="0"/>
                          </linearGradient>
                        </defs>
                        <path 
                          d={marketData.indices?.dow?.changePercent >= 0 
                            ? "M0,22 C4,24 8,20 12,18 C16,16 20,19 24,14 C28,10 32,13 36,9 C40,7 44,10 48,6 C52,4 56,7 60,4 L64,3" 
                            : "M0,10 C4,8 8,12 12,14 C16,16 20,13 24,18 C28,22 32,19 36,23 C40,25 44,22 48,26 C52,28 56,25 60,28 L64,29"}
                          fill="url(#sparkGreen2)"
                        />
                        <path 
                          d={marketData.indices?.dow?.changePercent >= 0 
                            ? "M0,22 C4,24 8,20 12,18 C16,16 20,19 24,14 C28,10 32,13 36,9 C40,7 44,10 48,6 C52,4 56,7 60,4 L64,3" 
                            : "M0,10 C4,8 8,12 12,14 C16,16 20,13 24,18 C28,22 32,19 36,23 C40,25 44,22 48,26 C52,28 56,25 60,28 L64,29"}
                          fill="none" 
                          stroke={marketData.indices?.dow?.changePercent >= 0 ? '#10b981' : '#ef4444'} 
                          strokeWidth="2"
                          strokeLinecap="round"
                          className="group-hover:stroke-[2.5] transition-all"
                        />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Nasdaq */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 hover:bg-white/[0.07] transition group">
                    <div className="text-xs text-gray-500 mb-1">Nasdaq</div>
                    <div className="text-lg sm:text-xl font-bold text-white">
                      {marketData.indices?.nasdaq?.price?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-sm font-medium ${marketData.indices?.nasdaq?.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {marketData.indices?.nasdaq?.changePercent >= 0 ? '▲' : '▼'} {Math.abs(marketData.indices?.nasdaq?.changePercent || 0).toFixed(2)}%
                      </span>
                      <svg className="w-16 h-8 ml-auto" viewBox="0 0 64 32" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="sparkGreen3" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={marketData.indices?.nasdaq?.changePercent >= 0 ? '#10b981' : '#ef4444'} stopOpacity="0.3"/>
                            <stop offset="100%" stopColor={marketData.indices?.nasdaq?.changePercent >= 0 ? '#10b981' : '#ef4444'} stopOpacity="0"/>
                          </linearGradient>
                        </defs>
                        <path 
                          d={marketData.indices?.nasdaq?.changePercent >= 0 
                            ? "M0,26 C4,23 8,27 12,21 C16,17 20,20 24,16 C28,13 32,17 36,11 C40,8 44,12 48,7 C52,5 56,9 60,5 L64,4" 
                            : "M0,6 C4,9 8,5 12,11 C16,15 20,12 24,16 C28,19 32,15 36,21 C40,24 44,20 48,25 C52,27 56,23 60,27 L64,28"}
                          fill="url(#sparkGreen3)"
                        />
                        <path 
                          d={marketData.indices?.nasdaq?.changePercent >= 0 
                            ? "M0,26 C4,23 8,27 12,21 C16,17 20,20 24,16 C28,13 32,17 36,11 C40,8 44,12 48,7 C52,5 56,9 60,5 L64,4" 
                            : "M0,6 C4,9 8,5 12,11 C16,15 20,12 24,16 C28,19 32,15 36,21 C40,24 44,20 48,25 C52,27 56,23 60,27 L64,28"}
                          fill="none" 
                          stroke={marketData.indices?.nasdaq?.changePercent >= 0 ? '#10b981' : '#ef4444'} 
                          strokeWidth="2"
                          strokeLinecap="round"
                          className="group-hover:stroke-[2.5] transition-all"
                        />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Bitcoin - 24/7 */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 hover:bg-white/[0.07] transition group">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs text-gray-500">Bitcoin</span>
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        24/7
                      </span>
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-white">
                      ${marketData.crypto?.BTC?.price?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-sm font-medium ${marketData.crypto?.BTC?.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {marketData.crypto?.BTC?.changePercent >= 0 ? '▲' : '▼'} {Math.abs(marketData.crypto?.BTC?.changePercent || 0).toFixed(2)}%
                      </span>
                      <svg className="w-16 h-8 ml-auto" viewBox="0 0 64 32" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="sparkBTC" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={marketData.crypto?.BTC?.changePercent >= 0 ? '#f59e0b' : '#ef4444'} stopOpacity="0.3"/>
                            <stop offset="100%" stopColor={marketData.crypto?.BTC?.changePercent >= 0 ? '#f59e0b' : '#ef4444'} stopOpacity="0"/>
                          </linearGradient>
                        </defs>
                        <path 
                          d={marketData.crypto?.BTC?.changePercent >= 0 
                            ? "M0,28 C4,26 8,24 12,22 C16,20 20,24 24,18 C28,14 32,16 36,12 C40,8 44,10 48,6 C52,4 56,6 60,4 L64,2" 
                            : "M0,4 C4,6 8,8 12,10 C16,12 20,8 24,14 C28,18 32,16 36,20 C40,24 44,22 48,26 C52,28 56,26 60,28 L64,30"}
                          fill="url(#sparkBTC)"
                        />
                        <path 
                          d={marketData.crypto?.BTC?.changePercent >= 0 
                            ? "M0,28 C4,26 8,24 12,22 C16,20 20,24 24,18 C28,14 32,16 36,12 C40,8 44,10 48,6 C52,4 56,6 60,4 L64,2" 
                            : "M0,4 C4,6 8,8 12,10 C16,12 20,8 24,14 C28,18 32,16 36,20 C40,24 44,22 48,26 C52,28 56,26 60,28 L64,30"}
                          fill="none" 
                          stroke={marketData.crypto?.BTC?.changePercent >= 0 ? '#f59e0b' : '#ef4444'} 
                          strokeWidth="2"
                          strokeLinecap="round"
                          className="group-hover:stroke-[2.5] transition-all"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* THE 4 HEADLINE FEATURES */}
      <section className="py-16 sm:py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Four Ways Maven Thinks With You</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Not dashboards. Not automation. Actual intelligence for your money decisions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Oracle - The Soul */}
            <div className="bg-gradient-to-br from-indigo-600/10 to-indigo-600/5 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 hover:border-indigo-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-2xl">
                  🔮
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Oracle</h3>
                  <p className="text-indigo-400 text-sm">Ask anything about your money</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                "Should I do a Roth conversion this year?" "How exposed am I to a tech crash?" 
                "What's my actual asset allocation across all accounts?"
              </p>
              <p className="text-gray-300 text-sm">
                <strong>Real answers based on your situation</strong> — not generic advice. 
                Maven knows your portfolio and explains the reasoning.
              </p>
            </div>

            {/* Portfolio Lab - The Proof */}
            <div className="bg-gradient-to-br from-purple-600/10 to-purple-600/5 border border-purple-500/20 rounded-2xl p-6 sm:p-8 hover:border-purple-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-2xl">
                  🧪
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Portfolio Lab</h3>
                  <p className="text-purple-400 text-sm">Advisor-grade analysis, automated</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Stress test against 2008, COVID, and rate hikes. See concentration risks. 
                Get optimization suggestions with explanations.
              </p>
              <p className="text-gray-300 text-sm">
                <strong>The analysis advisors do manually</strong> — in seconds. 
                Understand not just <em>what</em> to change, but <em>why</em>.
              </p>
            </div>

            {/* Fragility Index - The Differentiator */}
            <div className="bg-gradient-to-br from-orange-600/10 to-orange-600/5 border border-orange-500/20 rounded-2xl p-6 sm:p-8 hover:border-orange-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-2xl">
                  📊
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Market Fragility Index™</h3>
                  <p className="text-orange-400 text-sm">Know when conditions are fragile</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                40+ indicators. 8 pillars: valuation, credit, volatility, sentiment, and more. 
                Based on complexity theory — measures conditions, not predictions.
              </p>
              <p className="text-gray-300 text-sm">
                <strong>Institutional-grade risk awareness</strong> — the kind of signal 
                hedge funds monitor, explained simply.
              </p>
            </div>

            {/* Financial Snapshot - The Heart */}
            <div className="bg-gradient-to-br from-emerald-600/10 to-emerald-600/5 border border-emerald-500/20 rounded-2xl p-6 sm:p-8 hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-2xl">
                  📸
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Financial Snapshot</h3>
                  <p className="text-emerald-400 text-sm">See your path to financial freedom</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Interactive projections with sliders. Adjust retirement age, contributions, 
                returns — see the impact instantly.
              </p>
              <p className="text-gray-300 text-sm">
                <strong>The emotional anchor</strong> — turn abstract numbers into 
                a clear picture of your future.
              </p>
            </div>
          </div>
          
          {/* The positioning statement */}
          <div className="mt-12 text-center">
            <div className="inline-block bg-white/5 border border-white/10 rounded-xl px-6 py-4 max-w-2xl">
              <p className="text-gray-300 text-sm sm:text-base">
                <span className="text-gray-500">Mint tells you what happened.</span>
                <span className="mx-2 text-gray-600">•</span>
                <span className="text-gray-500">Robo-advisors say "trust us."</span>
                <br className="sm:hidden" />
                <span className="mx-2 text-gray-600 hidden sm:inline">•</span>
                <span className="text-white font-medium">Maven says "let's think this through together."</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* #9: Simple Roadmap Section */}
      <section className="py-12 sm:py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Where We Are</h2>
            <p className="text-gray-400 text-base sm:text-lg">Transparency about what's real and what's coming.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {/* Available Now */}
            <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-600/10 border border-emerald-500/30 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-emerald-400 font-semibold text-sm sm:text-base">Available Now</span>
              </div>
              <ul className="space-y-2 sm:space-y-3 text-gray-300 text-sm sm:text-base">
                <li>• Portfolio analysis & risk insights</li>
                <li>• Model portfolio comparisons</li>
                <li>• AI chat for financial questions</li>
                <li>• Live market data</li>
                <li>• Risk profiling</li>
              </ul>
            </div>

            {/* In Development */}
            <div className="bg-[#12121a] border border-amber-500/30 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-amber-400 font-semibold text-sm sm:text-base">In Development</span>
              </div>
              <ul className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base">
                <li>• Account aggregation</li>
                <li>• Tax-loss harvesting insights</li>
                <li>• Roth conversion calculator</li>
                <li>• Cross-account view</li>
              </ul>
            </div>

            {/* Planned */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                <span className="text-gray-400 font-semibold text-sm sm:text-base">Planned</span>
              </div>
              <ul className="space-y-2 sm:space-y-3 text-gray-500 text-sm sm:text-base">
                <li>• Estate planning insights</li>
                <li>• Retirement projections</li>
                <li>• 529 / education planning</li>
                <li>• Advisor collaboration tools</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* #6: Trust Signals Section */}
      <section className="py-12 sm:py-24 bg-[#0c0c12] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Built on Trust</h2>
            <p className="text-gray-400 text-base sm:text-lg">Your financial data deserves serious protection.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-indigo-500/20 flex items-center justify-center text-xl sm:text-2xl mx-auto mb-3 sm:mb-4">
                🔒
              </div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Your Data Stays Yours</h3>
              <p className="text-gray-400 text-xs sm:text-sm">
                We don't sell your data. Ever. Your financial information is used only to serve you.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-purple-500/20 flex items-center justify-center text-xl sm:text-2xl mx-auto mb-3 sm:mb-4">
                🛡️
              </div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Bank-Level Security</h3>
              <p className="text-gray-400 text-xs sm:text-sm">
                256-bit encryption in transit and at rest. We treat your data like we'd treat our own.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-pink-500/20 flex items-center justify-center text-xl sm:text-2xl mx-auto mb-3 sm:mb-4">
                💬
              </div>
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Information, Not Advice</h3>
              <p className="text-gray-400 text-xs sm:text-sm">
                Maven provides financial information and education — not personalized investment advice. Big decisions deserve professional guidance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* #5: Stronger Beta CTA */}
      <section className="py-12 sm:py-24 border-t border-white/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">Join the Private Beta</h2>
          <p className="text-lg sm:text-xl text-gray-400 mb-6 sm:mb-8">
            We're building Maven with early users who want financial clarity without the complexity. 
            Your feedback directly shapes what we build.
          </p>
          
          {/* Who should join */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 text-left max-w-xl mx-auto">
            <h3 className="font-semibold mb-3 sm:mb-4 text-center text-sm sm:text-base">Who the beta is for</h3>
            <ul className="space-y-2 text-gray-300 text-sm sm:text-base">
              <li className="flex items-start gap-2">
                <span className="text-indigo-400">•</span>
                <span>People who want to understand their finances better, not just automate them</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400">•</span>
                <span>Those comfortable with early-stage software and willing to share feedback</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400">•</span>
                <span>Anyone who's felt underserved by generic robo-advisors or priced out of quality advice</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold text-lg sm:text-xl rounded-xl transition transform hover:scale-105"
          >
            Get Financial Clarity →
          </button>
          
          <p className="text-gray-500 text-xs sm:text-sm mt-4 sm:mt-6">
            Free during beta. No credit card required.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-gray-500 text-sm sm:text-base">
            Maven — Financial clarity, powered by intelligence
          </p>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            Built by Sam & Eli · 2026
          </p>
          <p className="text-xs text-gray-600 mt-4 max-w-2xl mx-auto">
            Maven provides general financial information and education. It is not a registered investment advisor 
            and does not provide personalized investment advice. Please consult qualified professionals for advice 
            specific to your situation.
          </p>
        </div>
      </footer>
    </div>
  );
}
// Auto-deploy test - Sun Feb  8 19:08:54 EST 2026
// Deploy test Sun Feb  8 19:13:00 EST 2026
