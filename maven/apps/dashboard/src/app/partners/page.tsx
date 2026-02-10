'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

// Partners root - redirect to dashboard or show landing
export default function PartnersPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        router.push('/partners/dashboard');
      }
      // If not signed in, show landing (handled below)
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // Landing page for non-authenticated users
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex flex-col">
        {/* Header */}
        <header className="p-6 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <div>
              <div className="text-white font-semibold text-xl">Maven</div>
              <div className="text-amber-500 text-sm font-medium tracking-wider">PARTNERS</div>
            </div>
          </div>
          <a
            href="/sign-in?redirect_url=/partners/dashboard"
            className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg transition-colors"
          >
            Advisor Login
          </a>
        </header>

        {/* Hero */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-2xl text-center">
            <h1 className="text-5xl font-bold text-white mb-6">
              AI-Powered Wealth Intelligence
              <br />
              <span className="text-amber-500">For Modern Advisors</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Serve more clients with deeper insights. Maven Partners gives you 
              institutional-grade analysis tools and client management — powered by AI.
            </p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="/sign-up?redirect_url=/partners/dashboard"
                className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl transition-colors text-lg"
              >
                Start Free Trial
              </a>
              <a
                href="#features"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors text-lg"
              >
                See Features
              </a>
            </div>
          </div>
        </div>

        {/* Features preview */}
        <div id="features" className="p-12 bg-[#0d0d18] border-t border-white/10">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-3xl mb-4">👥</div>
              <h3 className="text-white font-semibold text-lg mb-2">Client Management</h3>
              <p className="text-gray-400">Manage all your clients in one place. Track portfolios, insights, and communications.</p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-3xl mb-4">🎛️</div>
              <h3 className="text-white font-semibold text-lg mb-2">Curated Insights</h3>
              <p className="text-gray-400">Control what each client sees. Contextualize insights for their situation.</p>
            </div>
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-white font-semibold text-lg mb-2">AI Analysis</h3>
              <p className="text-gray-400">Institutional-grade portfolio analysis, risk assessment, and recommendations.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null; // Will redirect to dashboard
}
