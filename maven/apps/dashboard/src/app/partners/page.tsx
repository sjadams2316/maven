'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';

// Partners root - public landing with demo options
export default function PartnersPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [activePreview, setActivePreview] = useState<'advisor' | 'client'>('advisor');

  // If signed in, redirect to dashboard
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/partners/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // Public landing page
  return (
    <div className="min-h-screen bg-[#0a0a12] flex flex-col">
      {/* Header */}
      <header className="p-4 md:p-6 flex items-center justify-between border-b border-white/10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            <span className="text-white font-bold text-lg md:text-xl">M</span>
          </div>
          <div>
            <div className="text-white font-semibold text-lg md:text-xl">Maven</div>
            <div className="text-amber-500 text-xs md:text-sm font-medium tracking-widest">PARTNERS</div>
          </div>
        </Link>
        <a
          href="/sign-in?redirect_url=/partners/dashboard"
          className="px-4 md:px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg transition-colors text-sm md:text-base"
        >
          Advisor Login
        </a>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12">
        <div className="max-w-5xl w-full">
          {/* Title */}
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6">
              AI-Powered Wealth Intelligence
              <br />
              <span className="text-amber-500">For Modern Advisors</span>
            </h1>
            <p className="text-base md:text-xl text-gray-400 max-w-2xl mx-auto">
              Serve more clients with deeper insights. See what you get — and what your clients experience.
            </p>
          </div>

          {/* Split Preview Toggle */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex bg-white/5 border border-white/10 rounded-xl p-1">
              <button
                onClick={() => setActivePreview('advisor')}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-all text-sm md:text-base ${
                  activePreview === 'advisor'
                    ? 'bg-amber-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                👨‍💼 Advisor View
              </button>
              <button
                onClick={() => setActivePreview('client')}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-all text-sm md:text-base ${
                  activePreview === 'client'
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                👤 Client View
              </button>
            </div>
          </div>

          {/* Preview Cards - Side by Side on Desktop */}
          <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
            {/* Advisor Preview */}
            <div 
              className={`relative rounded-2xl border overflow-hidden transition-all duration-300 ${
                activePreview === 'advisor' 
                  ? 'border-amber-500 shadow-xl shadow-amber-500/20 scale-[1.02]' 
                  : 'border-white/10 opacity-60 hover:opacity-80'
              }`}
              onClick={() => setActivePreview('advisor')}
            >
              <div className="bg-[#12121a] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">M</span>
                  </div>
                  <span className="text-white font-medium">Advisor Dashboard</span>
                </div>
                {/* Mock Dashboard UI */}
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-gray-500 text-xs">Total AUM</div>
                      <div className="text-white font-bold">$12.4M</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-gray-500 text-xs">Clients</div>
                      <div className="text-white font-bold">47</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-gray-500 text-xs">Alerts</div>
                      <div className="text-amber-500 font-bold">5</div>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">Recent Clients</span>
                      <span className="text-amber-500 text-xs">View all →</span>
                    </div>
                    <div className="space-y-2">
                      {['John Smith — $850K', 'Sarah Johnson — $1.2M', 'Michael Chen — $450K'].map((client, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
                          <span className="text-white">{client}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-t from-[#0a0a12] to-transparent absolute bottom-0 left-0 right-0 h-16"></div>
            </div>

            {/* Client Preview */}
            <div 
              className={`relative rounded-2xl border overflow-hidden transition-all duration-300 ${
                activePreview === 'client' 
                  ? 'border-indigo-500 shadow-xl shadow-indigo-500/20 scale-[1.02]' 
                  : 'border-white/10 opacity-60 hover:opacity-80'
              }`}
              onClick={() => setActivePreview('client')}
            >
              <div className="bg-slate-50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">A</span>
                  </div>
                  <span className="text-gray-800 font-medium">Adams Wealth</span>
                </div>
                {/* Mock Client UI */}
                <div className="space-y-3">
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                    <div className="text-slate-500 text-xs mb-1">Your Portfolio</div>
                    <div className="text-slate-900 font-bold text-2xl">$850,000</div>
                    <div className="text-emerald-600 text-sm">+8.2% YTD</div>
                  </div>
                  <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200">
                    <div className="flex items-center gap-2 text-amber-600 text-sm font-medium mb-2">
                      <span>💡</span> Insight from your advisor
                    </div>
                    <p className="text-slate-600 text-sm">
                      You have a $3,200 tax-loss harvesting opportunity. I recommend we discuss this before year-end.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-t from-[#0a0a12] to-transparent absolute bottom-0 left-0 right-0 h-16"></div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-8">
            <Link
              href="/partners/dashboard?demo=true"
              className="w-full sm:w-auto px-6 md:px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl transition-all text-base md:text-lg flex items-center justify-center gap-2 min-h-[48px] shadow-lg shadow-amber-500/20"
            >
              👨‍💼 Try Advisor Demo
            </Link>
            <Link
              href="/c/DEMO-JS123"
              className="w-full sm:w-auto px-6 md:px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all text-base md:text-lg flex items-center justify-center gap-2 min-h-[48px] shadow-lg shadow-indigo-500/20"
            >
              👤 Try Client Demo
            </Link>
          </div>

          {/* Value Props */}
          <div className="text-center text-sm text-gray-500 mb-12">
            No signup required • Full interactive demos • See both perspectives
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="border-t border-white/10 bg-[#0d0d18] px-4 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-4">
            What Makes Maven Partners Different
          </h2>
          <p className="text-gray-400 text-center mb-8 md:mb-12 max-w-2xl mx-auto">
            Your clients see a calm, curated experience. You see everything.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Feature 1 */}
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-amber-500/30 transition-colors">
              <div className="text-3xl mb-4">🎛️</div>
              <h3 className="text-white font-semibold text-lg mb-2">Curated Insights</h3>
              <p className="text-gray-400 text-sm">
                AI generates insights automatically. You decide what each client sees, add your context, and control the message.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-amber-500/30 transition-colors">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-white font-semibold text-lg mb-2">Deep Analysis</h3>
              <p className="text-gray-400 text-sm">
                Portfolio X-ray, tax-loss harvesting scanner, risk analysis, What-If simulator — institutional tools made accessible.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-amber-500/30 transition-colors">
              <div className="text-3xl mb-4">👥</div>
              <h3 className="text-white font-semibold text-lg mb-2">Client Delight</h3>
              <p className="text-gray-400 text-sm">
                Your clients get a clean, mobile-friendly portal. They see their portfolio and your curated guidance — nothing overwhelming.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-amber-500/30 transition-colors">
              <div className="text-3xl mb-4">🏠</div>
              <h3 className="text-white font-semibold text-lg mb-2">Households</h3>
              <p className="text-gray-400 text-sm">
                Group couples and families. See aggregated views, coordinate tax strategies, plan across generations.
              </p>
            </div>
            
            {/* Feature 5 */}
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-amber-500/30 transition-colors">
              <div className="text-3xl mb-4">✅</div>
              <h3 className="text-white font-semibold text-lg mb-2">Compliance Ready</h3>
              <p className="text-gray-400 text-sm">
                Built-in tracking for suitability reviews, risk assessments, ADV delivery, and audit trails.
              </p>
            </div>
            
            {/* Feature 6 */}
            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-amber-500/30 transition-colors">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-white font-semibold text-lg mb-2">No AUM Fees</h3>
              <p className="text-gray-400 text-sm">
                Simple per-advisor pricing. Your margins stay yours. Scale your practice without scaling your costs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-white/10 px-4 py-12 md:py-16 text-center">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
          Ready to see it in action?
        </h2>
        <p className="text-gray-400 mb-6 max-w-lg mx-auto">
          Try both demos — advisor and client — with no signup required.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/partners/dashboard"
            className="w-full sm:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl transition-colors min-h-[48px] flex items-center justify-center"
          >
            Advisor Demo →
          </Link>
          <Link
            href="/c/DEMO-JS123"
            className="w-full sm:w-auto px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl transition-colors min-h-[48px] flex items-center justify-center"
          >
            Client Demo →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 px-4 py-6 text-center text-sm text-gray-500">
        <Link href="/" className="hover:text-white transition-colors">
          ← Back to Maven
        </Link>
        <span className="mx-3">•</span>
        <span>Maven Partners is part of Maven Wealth Intelligence</span>
      </footer>
    </div>
  );
}
