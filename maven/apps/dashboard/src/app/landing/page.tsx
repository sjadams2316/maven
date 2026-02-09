'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with framer-motion
const OracleWelcome = dynamic(() => import('../components/OracleWelcome'), { ssr: false });

export default function LandingPage() {
  const router = useRouter();
  const [marketData, setMarketData] = useState<any>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    fetch('/api/market-data')
      .then(res => res.json())
      .then(data => {
        // Transform API response to expected format
        const stocks = data.stocks || [];
        const crypto = data.crypto || [];
        
        // Map stocks array to indices object
        const spyData = stocks.find((s: { symbol: string }) => s.symbol === 'SPY');
        
        // Map crypto array to object
        const btcData = crypto.find((c: { symbol: string }) => c.symbol === 'BTC');
        
        setMarketData({
          indices: {
            sp500: spyData ? { price: spyData.price, changePercent: spyData.changePercent } : null,
          },
          crypto: {
            BTC: btcData ? { price: btcData.price, changePercent: btcData.changePercent } : null,
          },
        });
      })
      .catch(() => {});
  }, []);
  
  const handleEnterDemo = () => {
    // Check if user has seen the welcome before (in this session)
    const hasSeenWelcome = sessionStorage.getItem('maven_seen_welcome');
    
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    } else {
      router.push('/dashboard');
    }
  };
  
  const handleWelcomeComplete = () => {
    sessionStorage.setItem('maven_seen_welcome', 'true');
    setShowWelcome(false);
    router.push('/dashboard');
  };

  return (
    <>
      {/* Epic Welcome Experience */}
      {showWelcome && (
        <OracleWelcome onComplete={handleWelcomeComplete} />
      )}
      
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-600/10 rounded-full blur-3xl" />

        {/* Header */}
        <header className="relative z-10 max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
                M
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Maven</h1>
                <p className="text-xs text-gray-500">AI Wealth Partner</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 text-sm bg-purple-500/20 text-purple-300 rounded-full">Beta</span>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-gray-300">Now in Private Beta</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Your Personal
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text"> Family Office</span>
              <br />Powered by AI
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              The wealth intelligence that $10M+ clients get from family offices — 
              now accessible to everyone through AI.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={handleEnterDemo}
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold text-lg rounded-xl transition transform hover:scale-105 flex items-center gap-2"
              >
                Enter Maven
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <button
                onClick={() => {
                  document.getElementById('vision')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-lg rounded-xl transition"
              >
                Learn More
              </button>
            </div>

            {/* Live Market Ticker */}
            {marketData && (
              <div className="inline-flex items-center gap-6 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">S&P 500</span>
                  <span className="font-semibold">{marketData.indices?.sp500?.price?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  <span className={`text-sm ${marketData.indices?.sp500?.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {marketData.indices?.sp500?.changePercent >= 0 ? '+' : ''}{marketData.indices?.sp500?.changePercent?.toFixed(2)}%
                  </span>
                </div>
                <div className="w-px h-6 bg-white/10" />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">BTC</span>
                  <span className="font-semibold">${marketData.crypto?.BTC?.price?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  <span className={`text-sm ${marketData.crypto?.BTC?.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {marketData.crypto?.BTC?.changePercent >= 0 ? '+' : ''}{marketData.crypto?.BTC?.changePercent?.toFixed(2)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* The Vision */}
      <section id="vision" className="py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">The Problem We're Solving</h2>
            <p className="text-xl text-gray-400 leading-relaxed">
              If you have $10M+, you get a family office: a team of experts handling your investments, taxes, 
              estate planning, and wealth strategy. Everyone else? You're on your own with fragmented tools 
              and generic advice.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-8">
              <div className="w-14 h-14 rounded-xl bg-red-500/20 flex items-center justify-center text-3xl mb-6">
                🏦
              </div>
              <h3 className="text-xl font-semibold mb-3">Fragmented Tools</h3>
              <p className="text-gray-400">
                Your wealth is scattered across brokerages, 401ks, banks, and spreadsheets. 
                No single place to see the complete picture.
              </p>
            </div>
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-8">
              <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center text-3xl mb-6">
                💰
              </div>
              <h3 className="text-xl font-semibold mb-3">Expensive Advisors</h3>
              <p className="text-gray-400">
                Quality financial advice costs 1% of assets annually. That's $10K/year on a $1M portfolio — 
                compounding to hundreds of thousands lost over time.
              </p>
            </div>
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-8">
              <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center text-3xl mb-6">
                🤖
              </div>
              <h3 className="text-xl font-semibold mb-3">Generic Robo-Advice</h3>
              <p className="text-gray-400">
                Current "robo-advisors" just put you in a target-date fund. No tax optimization, 
                no personalization, no real intelligence.
              </p>
            </div>
          </div>

          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">
              Maven Changes Everything
            </h2>
            <p className="text-xl text-gray-400 leading-relaxed">
              We're building the AI wealth partner that everyone deserves. One that sees your complete financial picture, 
              optimizes across all your accounts, minimizes your taxes, and gives you institutional-quality insights — 
              at a fraction of the cost.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-[#0c0c12] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Maven Does</h2>
            <p className="text-gray-400 text-lg">Building the complete AI wealth platform, one module at a time.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Live Features */}
            <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-2xl p-8">
              <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-sm rounded-full">Live Now</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Portfolio Intelligence</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span>All-Star model portfolios from Vanguard, BlackRock, Capital Group & more</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span>Sharpe-weighted consensus recommendations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span>Risk profiling with institutional frameworks</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span>AI chat powered by Claude for personalized guidance</span>
                </li>
              </ul>
            </div>

            {/* Coming Soon */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-sm rounded-full">Coming Soon</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Full Wealth Platform</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-start gap-3">
                  <span className="text-gray-500 mt-1">○</span>
                  <span>Account aggregation — see everything in one place</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-500 mt-1">○</span>
                  <span>Tax-loss harvesting automation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-500 mt-1">○</span>
                  <span>Roth conversion optimizer</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-500 mt-1">○</span>
                  <span>Cross-account rebalancing</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-500 mt-1">○</span>
                  <span>AI trading signals via Bittensor</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-white/10">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Meet Maven?</h2>
          <p className="text-xl text-gray-400 mb-10">
            We're in early beta, learning and improving every day. Your feedback shapes what we build.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-10 py-5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold text-xl rounded-xl transition transform hover:scale-105"
          >
            Enter Maven →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-500">
            Maven — AI-native wealth intelligence · Powered by <span className="text-indigo-400">Bittensor</span>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Built by Sam & Eli · 2026
          </p>
        </div>
      </footer>
    </div>
    </>
  );
}
