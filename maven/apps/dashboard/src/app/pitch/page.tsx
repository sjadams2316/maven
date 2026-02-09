'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// Slide data structure
interface Slide {
  id: string;
  content: React.ReactNode;
}

// Individual slide components for cleaner code
function TitleSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="animate-fade-in">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-5xl font-bold mx-auto mb-8 shadow-2xl shadow-indigo-500/30">
          M
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-indigo-200 to-purple-200 text-transparent bg-clip-text">
          Maven
        </h1>
        <p className="text-2xl md:text-3xl text-indigo-300 mb-4 font-light">
          AI-Powered Wealth Intelligence
        </p>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          The family office experience — now accessible to every advisor and their clients
        </p>
      </div>
      <div className="absolute bottom-24 animate-bounce text-gray-500">
        <p className="text-sm mb-2">Press → or tap to continue</p>
        <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

function ProblemSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 md:px-12">
      <div className="max-w-4xl w-full animate-fade-in">
        <div className="text-6xl mb-6">😫</div>
        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">The Problem</h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="text-4xl font-bold text-red-400 mb-2">80%</div>
            <p className="text-gray-300">of advisor time spent on operations, not advice</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="text-4xl font-bold text-amber-400 mb-2">50+</div>
            <p className="text-gray-300">clients per advisor — impossible to serve deeply</p>
          </div>
        </div>
        
        <div className="space-y-4 text-lg text-gray-300 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <p className="flex items-start gap-3">
            <span className="text-red-400">✕</span>
            <span>Can't scale without hiring more staff</span>
          </p>
          <p className="flex items-start gap-3">
            <span className="text-red-400">✕</span>
            <span>Manual portfolio analysis takes hours per client</span>
          </p>
          <p className="flex items-start gap-3">
            <span className="text-red-400">✕</span>
            <span>Tax optimization opportunities slip through the cracks</span>
          </p>
          <p className="flex items-start gap-3">
            <span className="text-red-400">✕</span>
            <span>Clients expect 24/7 engagement — you can't provide it</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function SolutionSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 md:px-12">
      <div className="max-w-4xl w-full animate-fade-in">
        <div className="text-6xl mb-6">✨</div>
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">The Solution</h2>
        <p className="text-2xl text-indigo-300 mb-10">Your AI wealth partner that never sleeps</p>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-2xl p-6 text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">Analyzes</h3>
            <p className="text-gray-400">Every portfolio, continuously. Finds opportunities you'd miss.</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-2xl p-6 text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="text-4xl mb-4">💡</div>
            <h3 className="text-xl font-semibold text-white mb-2">Generates</h3>
            <p className="text-gray-400">Personalized insights, meeting prep, and client updates automatically.</p>
          </div>
          
          <div className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 border border-pink-500/30 rounded-2xl p-6 text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-white mb-2">Engages</h3>
            <p className="text-gray-400">Clients get instant, intelligent answers — your voice, 24/7.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturesSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 md:px-12">
      <div className="max-w-5xl w-full animate-fade-in">
        <h2 className="text-4xl md:text-5xl font-bold mb-10 text-white text-center">Key Features</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl">
                📊
              </div>
              <h3 className="text-xl font-semibold text-white">Portfolio Lab</h3>
            </div>
            <p className="text-gray-400">Deep portfolio analysis with AI-powered recommendations. Factor exposure, concentration risk, optimization suggestions.</p>
          </div>
          
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-2xl">
                ⚡
              </div>
              <h3 className="text-xl font-semibold text-white">Fragility Index</h3>
            </div>
            <p className="text-gray-400">Real-time market stress indicators. Know when to be defensive before the crowd reacts.</p>
          </div>
          
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center text-2xl">
                🌾
              </div>
              <h3 className="text-xl font-semibold text-white">Tax Optimization</h3>
            </div>
            <p className="text-gray-400">Automated tax-loss harvesting, Roth conversion analysis, asset location optimization. Save thousands annually.</p>
          </div>
          
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                🔮
              </div>
              <h3 className="text-xl font-semibold text-white">What-If Simulator</h3>
            </div>
            <p className="text-gray-400">Model scenarios before executing. "What if I increase equities by 10%?" Instant Monte Carlo simulations.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 md:px-12">
      <div className="max-w-5xl w-full animate-fade-in">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white text-center">See It In Action</h2>
        <p className="text-xl text-gray-400 text-center mb-10">Beautiful, intuitive, and powerful</p>
        
        <div className="relative">
          {/* Browser mockup */}
          <div className="bg-[#1a1a24] rounded-2xl border border-white/20 shadow-2xl overflow-hidden animate-slide-up">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 bg-white/5 rounded-lg text-sm text-gray-400">
                  maven.ai/demo
                </div>
              </div>
            </div>
            
            {/* Dashboard preview */}
            <div className="p-6 bg-[#0a0a0f]">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-[#12121a] rounded-xl p-4 border border-white/10">
                  <p className="text-xs text-gray-500 mb-1">Net Worth</p>
                  <p className="text-2xl font-bold text-white">$1.2M</p>
                  <p className="text-xs text-emerald-400">+2.3% today</p>
                </div>
                <div className="bg-[#12121a] rounded-xl p-4 border border-white/10">
                  <p className="text-xs text-gray-500 mb-1">Portfolio Health</p>
                  <p className="text-2xl font-bold text-emerald-400">92</p>
                  <p className="text-xs text-gray-400">Excellent</p>
                </div>
                <div className="bg-[#12121a] rounded-xl p-4 border border-white/10">
                  <p className="text-xs text-gray-500 mb-1">Tax Savings</p>
                  <p className="text-2xl font-bold text-amber-400">$4.2K</p>
                  <p className="text-xs text-gray-400">Available</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">💡</span>
                  <span className="text-sm font-medium text-indigo-300">AI Insight</span>
                </div>
                <p className="text-sm text-gray-300">Tax-loss harvest opportunity: VWO showing $4,200 unrealized loss. Harvesting could save ~$1,050 in taxes.</p>
              </div>
            </div>
          </div>
          
          {/* Floating badges */}
          <div className="absolute -right-4 top-1/4 bg-emerald-500 text-white text-sm px-3 py-1 rounded-full shadow-lg animate-pulse">
            Live Data
          </div>
          <div className="absolute -left-4 bottom-1/4 bg-purple-500 text-white text-sm px-3 py-1 rounded-full shadow-lg">
            AI-Powered
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold rounded-xl transition"
          >
            Try the Live Demo
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ForRIAsSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 md:px-12">
      <div className="max-w-4xl w-full animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full mb-6">
          <span className="text-indigo-400">🏢</span>
          <span className="text-indigo-300 font-medium">Maven Partners</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Built for RIAs</h2>
        <p className="text-xl text-gray-400 mb-10">White-label wealth intelligence for your practice</p>
        
        <div className="space-y-6">
          <div className="flex items-start gap-4 bg-[#12121a] border border-white/10 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-2xl flex-shrink-0">
              🎨
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Your Brand, Your Platform</h3>
              <p className="text-gray-400">White-label solution with your logo, colors, and domain. Clients see your brand, not ours.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 bg-[#12121a] border border-white/10 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-2xl flex-shrink-0">
              👁️
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Advisor Controls Visibility</h3>
              <p className="text-gray-400">Decide exactly what clients can see and do. Full control over feature access, insights, and recommendations.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 bg-[#12121a] border border-white/10 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-2xl flex-shrink-0">
              📋
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Meeting Prep in Seconds</h3>
              <p className="text-gray-400">One-click generates comprehensive client review: portfolio changes, opportunities, talking points, and recommendations.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DifferentiationSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 md:px-12">
      <div className="max-w-4xl w-full animate-fade-in">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white text-center">Why Maven?</h2>
        <p className="text-xl text-gray-400 text-center mb-10">Not AI-assisted. AI-native.</p>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Traditional vs Maven comparison */}
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-red-400 mb-4">Traditional "AI" Tools</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-red-400">✕</span>
                <span>AI bolted onto legacy systems</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">✕</span>
                <span>Black-box recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">✕</span>
                <span>Single account optimization</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400">✕</span>
                <span>Generic, one-size-fits-all</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-emerald-400 mb-4">Maven</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span><strong>AI-native architecture</strong> — built from the ground up</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span><strong>Transparent reasoning</strong> — see why, not just what</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span><strong>Cross-account optimization</strong> — holistic view</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                <span><strong>Truly personalized</strong> — learns each client</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-6 text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <p className="text-xl text-white mb-2">
            "The difference between AI-assisted and AI-native is the difference between a calculator and a partner."
          </p>
          <p className="text-gray-400">— The Maven Philosophy</p>
        </div>
      </div>
    </div>
  );
}

function BusinessModelSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 md:px-12">
      <div className="max-w-4xl w-full animate-fade-in">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white text-center">Simple Pricing</h2>
        <p className="text-xl text-gray-400 text-center mb-10">Aligned incentives. No per-seat surprises.</p>
        
        <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-3xl p-8 md:p-12 text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-sm mb-6">
            <span>✓</span>
            <span>Founding Partner Pricing</span>
          </div>
          
          <div className="text-6xl md:text-7xl font-bold text-white mb-4">
            Included
          </div>
          <p className="text-2xl text-indigo-300 mb-6">with your existing AUM fee structure</p>
          
          <div className="grid md:grid-cols-3 gap-6 text-left max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl mb-2">♾️</div>
              <p className="text-gray-300 font-medium">Unlimited clients</p>
              <p className="text-sm text-gray-500">No per-seat fees</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-gray-300 font-medium">All features</p>
              <p className="text-sm text-gray-500">Full platform access</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🤝</div>
              <p className="text-gray-300 font-medium">Partner support</p>
              <p className="text-sm text-gray-500">White-glove onboarding</p>
            </div>
          </div>
        </div>
        
        <div className="text-center text-gray-400">
          <p className="text-lg mb-2">We succeed when you succeed.</p>
          <p className="text-sm">Maven grows with your AUM — our incentives are perfectly aligned with yours.</p>
        </div>
      </div>
    </div>
  );
}

function TractionSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 md:px-12">
      <div className="max-w-4xl w-full animate-fade-in text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Where We Are</h2>
        
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500/20 border border-amber-500/30 rounded-full mb-10">
          <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-amber-300 font-medium">Private Beta — Q1 2026</span>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="text-4xl font-bold text-indigo-400 mb-2">3</div>
            <p className="text-gray-300">Founding RIA Partners</p>
            <p className="text-sm text-gray-500">Actively onboarding</p>
          </div>
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="text-4xl font-bold text-emerald-400 mb-2">$50M+</div>
            <p className="text-gray-300">AUM in pilot</p>
            <p className="text-sm text-gray-500">Growing weekly</p>
          </div>
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="text-4xl font-bold text-purple-400 mb-2">100%</div>
            <p className="text-gray-300">Product focus</p>
            <p className="text-sm text-gray-500">Building what matters</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6">
          <p className="text-xl text-white mb-2">
            "We're looking for 5-10 founding RIA partners to shape the future of Maven."
          </p>
          <p className="text-gray-400">
            Early partners get priority features, direct input on the roadmap, and founding partner pricing forever.
          </p>
        </div>
      </div>
    </div>
  );
}

function CTASlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 md:px-12">
      <div className="max-w-3xl w-full animate-fade-in text-center">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-5xl font-bold mx-auto mb-8 shadow-2xl shadow-indigo-500/30">
          M
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
          Ready to Transform Your Practice?
        </h2>
        <p className="text-xl text-gray-400 mb-10">
          Join our founding partners and help shape the future of wealth intelligence.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <a
            href="mailto:sam@mavenwealth.ai?subject=Maven%20Demo%20Request"
            className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold text-lg rounded-xl transition transform hover:scale-105 flex items-center gap-2"
          >
            Schedule a Demo
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <Link
            href="/demo"
            className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-lg rounded-xl transition"
          >
            Try the Demo
          </Link>
        </div>
        
        <div className="pt-8 border-t border-white/10">
          <p className="text-gray-400 mb-4">Get in touch</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-lg">
            <a href="mailto:sam@mavenwealth.ai" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2">
              <span>📧</span>
              sam@mavenwealth.ai
            </a>
            <span className="hidden sm:block text-gray-600">|</span>
            <a href="https://mavenwealth.ai" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2">
              <span>🌐</span>
              mavenwealth.ai
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Pitch Deck Component
export default function PitchPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const slides: Slide[] = [
    { id: 'title', content: <TitleSlide /> },
    { id: 'problem', content: <ProblemSlide /> },
    { id: 'solution', content: <SolutionSlide /> },
    { id: 'features', content: <FeaturesSlide /> },
    { id: 'demo', content: <DemoSlide /> },
    { id: 'for-rias', content: <ForRIAsSlide /> },
    { id: 'differentiation', content: <DifferentiationSlide /> },
    { id: 'business-model', content: <BusinessModelSlide /> },
    { id: 'traction', content: <TractionSlide /> },
    { id: 'cta', content: <CTASlide /> },
  ];

  const goToSlide = useCallback((index: number) => {
    if (isAnimating || index === currentSlide) return;
    if (index < 0 || index >= slides.length) return;
    
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 500);
  }, [currentSlide, isAnimating, slides.length]);

  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      goToSlide(currentSlide + 1);
    }
  }, [currentSlide, goToSlide, slides.length]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  }, [currentSlide, goToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToSlide(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        goToSlide(slides.length - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, goToSlide, slides.length]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Custom animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .animate-slide-up {
          opacity: 0;
          animation: slide-up 0.6s ease-out forwards;
        }
      `}</style>

      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      {/* Slide container */}
      <div 
        className="relative h-screen cursor-pointer"
        onClick={(e) => {
          // Don't advance if clicking a link or button
          const target = e.target as HTMLElement;
          if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button')) {
            return;
          }
          nextSlide();
        }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-500 ease-in-out ${
              index === currentSlide 
                ? 'opacity-100 translate-x-0' 
                : index < currentSlide 
                  ? 'opacity-0 -translate-x-full' 
                  : 'opacity-0 translate-x-full'
            }`}
            style={{ pointerEvents: index === currentSlide ? 'auto' : 'none' }}
          >
            {slide.content}
          </div>
        ))}
      </div>

      {/* Navigation dots */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-50">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={(e) => {
              e.stopPropagation();
              goToSlide(index);
            }}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-indigo-500 w-8' 
                : 'bg-white/20 hover:bg-white/40'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
        className={`fixed left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition z-50 ${
          currentSlide === 0 ? 'opacity-30 cursor-not-allowed' : ''
        }`}
        disabled={currentSlide === 0}
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          nextSlide();
        }}
        className={`fixed right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition z-50 ${
          currentSlide === slides.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
        }`}
        disabled={currentSlide === slides.length - 1}
        aria-label="Next slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Slide counter */}
      <div className="fixed top-6 right-6 text-sm text-gray-500 z-50">
        {currentSlide + 1} / {slides.length}
      </div>

      {/* Exit link */}
      <Link
        href="/"
        className="fixed top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition z-50"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm">Exit</span>
      </Link>

      {/* Keyboard hints (only on first slide) */}
      {currentSlide === 0 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-4 text-xs text-gray-500 z-50">
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-white/10 rounded">←</kbd>
            <kbd className="px-2 py-1 bg-white/10 rounded">→</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-2 py-1 bg-white/10 rounded">Space</kbd>
            Next
          </span>
        </div>
      )}
    </div>
  );
}
