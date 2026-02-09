'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// Slide data structure
interface Slide {
  id: string;
  content: React.ReactNode;
}

// Individual slide components
function TitleSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="animate-fade-in">
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-6xl font-bold mx-auto mb-10 shadow-2xl shadow-purple-500/30 animate-glow">
          M
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="bg-gradient-to-r from-white via-indigo-200 to-purple-200 text-transparent bg-clip-text">
            Maven
          </span>
        </h1>
        <p className="text-2xl md:text-4xl text-gray-300 mb-4 font-light tracking-wide">
          The Future of Wealth Intelligence
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-gray-500 text-lg">Building now</span>
        </div>
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
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
          Wealth management is <span className="text-red-400">broken</span>.
        </h2>
        
        <div className="space-y-8 mb-10">
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <p className="text-2xl text-gray-300 leading-relaxed">
              If you have <span className="text-emerald-400 font-semibold">$10 million</span>, you get a family office — 
              a team of experts who see your whole picture, optimize everything, and guide every decision.
            </p>
          </div>
          
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-2xl text-gray-300 leading-relaxed">
              Everyone else? You get a <span className="text-amber-400">robo-advisor</span> that puts you in a target-date fund, 
              or <span className="text-red-400">nothing at all</span>.
            </p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <div className="text-3xl font-bold text-red-400 mb-1">1%</div>
            <p className="text-sm text-gray-400">Annual fee for human advice</p>
            <p className="text-xs text-gray-500 mt-1">$10K/year on $1M</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <div className="text-3xl font-bold text-amber-400 mb-1">0</div>
            <p className="text-sm text-gray-400">Tax optimization from robos</p>
            <p className="text-xs text-gray-500 mt-1">Thousands left on table</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-1">∞</div>
            <p className="text-sm text-gray-400">Complexity you face alone</p>
            <p className="text-xs text-gray-500 mt-1">Accounts, taxes, timing...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function VisionSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 md:px-12">
      <div className="max-w-4xl w-full animate-fade-in text-center">
        <div className="text-6xl mb-8">✨</div>
        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white leading-tight">
          What if <span className="bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">everyone</span> had access to 
          <br />family-office-level intelligence?
        </h2>
        
        <div className="space-y-6 text-xl md:text-2xl text-gray-300 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <p>
            The same insights. The same optimization. The same guidance.
          </p>
          <p>
            Not dumbed down. Not one-size-fits-all.
          </p>
          <p className="text-indigo-300 font-medium">
            Actually personalized to <em>your</em> complete financial picture.
          </p>
        </div>
        
        <div className="mt-12 p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-2xl text-white mb-2">
            AI makes this possible now.
          </p>
          <p className="text-gray-400">
            For the first time, we can build intelligence that scales to everyone — without losing depth.
          </p>
        </div>
      </div>
    </div>
  );
}

function WhatMavenDoesSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 md:px-12">
      <div className="max-w-4xl w-full animate-fade-in">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">What Maven Does</h2>
        <p className="text-xl text-indigo-300 mb-10">Your AI wealth partner that actually understands you</p>
        
        <div className="space-y-6">
          <div className="flex items-start gap-5 bg-gradient-to-r from-blue-500/10 to-transparent border-l-4 border-blue-500 rounded-r-2xl p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="text-4xl">👁️</div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Sees your whole picture</h3>
              <p className="text-gray-400">Every account, every asset, every goal — unified. No more fragmented views across 5 different apps.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-5 bg-gradient-to-r from-emerald-500/10 to-transparent border-l-4 border-emerald-500 rounded-r-2xl p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="text-4xl">🔍</div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Finds opportunities you'd miss</h3>
              <p className="text-gray-400">Tax-loss harvesting, rebalancing, Roth conversions, risk drift — Maven catches what humans overlook.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-5 bg-gradient-to-r from-purple-500/10 to-transparent border-l-4 border-purple-500 rounded-r-2xl p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="text-4xl">🧭</div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Guides your decisions</h3>
              <p className="text-gray-400">Not black-box recommendations. Transparent reasoning you can understand, question, and learn from.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MagicSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 md:px-12">
      <div className="max-w-5xl w-full animate-fade-in">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white text-center">The Magic</h2>
        <p className="text-xl text-gray-400 text-center mb-10">Tools that feel like superpowers</p>
        
        <div className="grid md:grid-cols-2 gap-5">
          <div className="group bg-gradient-to-br from-amber-500/20 to-orange-600/10 border border-amber-500/30 rounded-2xl p-6 hover:scale-[1.02] transition-transform animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30">
                ⚡
              </div>
              <h3 className="text-xl font-semibold text-white">Fragility Index</h3>
            </div>
            <p className="text-gray-300 mb-3">Real-time market stress detection. Know when conditions are dangerous <em>before</em> the crash.</p>
            <p className="text-sm text-amber-400/80">"Be defensive when others are still euphoric."</p>
          </div>
          
          <div className="group bg-gradient-to-br from-purple-500/20 to-pink-600/10 border border-purple-500/30 rounded-2xl p-6 hover:scale-[1.02] transition-transform animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/30">
                🔮
              </div>
              <h3 className="text-xl font-semibold text-white">What-If Simulator</h3>
            </div>
            <p className="text-gray-300 mb-3">Model any scenario instantly. "What if I increase stocks by 10%?" See the impact before you act.</p>
            <p className="text-sm text-purple-400/80">Monte Carlo meets intuitive UI.</p>
          </div>
          
          <div className="group bg-gradient-to-br from-emerald-500/20 to-teal-600/10 border border-emerald-500/30 rounded-2xl p-6 hover:scale-[1.02] transition-transform animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/30">
                🌾
              </div>
              <h3 className="text-xl font-semibold text-white">Tax Optimization</h3>
            </div>
            <p className="text-gray-300 mb-3">Automated tax-loss harvesting, Roth conversion analysis, asset location. Save thousands every year.</p>
            <p className="text-sm text-emerald-400/80">The tax alpha most people leave on the table.</p>
          </div>
          
          <div className="group bg-gradient-to-br from-blue-500/20 to-cyan-600/10 border border-blue-500/30 rounded-2xl p-6 hover:scale-[1.02] transition-transform animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl shadow-lg shadow-blue-500/30">
                🔬
              </div>
              <h3 className="text-xl font-semibold text-white">Portfolio X-Ray</h3>
            </div>
            <p className="text-gray-300 mb-3">See through the surface. Factor exposures, hidden concentrations, true diversification analysis.</p>
            <p className="text-sm text-blue-400/80">Know what you actually own.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TwoProductsSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 md:px-12">
      <div className="max-w-5xl w-full animate-fade-in">
        <h2 className="text-4xl md:text-5xl font-bold mb-10 text-white text-center">Two Products, One Vision</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Maven for Individuals */}
          <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-3xl p-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-3xl font-bold mb-6 shadow-lg shadow-indigo-500/30">
              M
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Maven</h3>
            <p className="text-indigo-300 mb-4">For individuals & families</p>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1">✦</span>
                <span>Your personal wealth intelligence</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1">✦</span>
                <span>All accounts in one place</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1">✦</span>
                <span>AI that learns your goals</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1">✦</span>
                <span>Proactive insights & optimization</span>
              </li>
            </ul>
            <div className="mt-6 pt-6 border-t border-indigo-500/20">
              <p className="text-sm text-gray-400">The family office experience — for everyone.</p>
            </div>
          </div>
          
          {/* Maven Partners */}
          <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 rounded-3xl p-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-3xl font-bold mb-6 shadow-lg shadow-emerald-500/30">
              M<span className="text-lg">+</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Maven Partners</h3>
            <p className="text-emerald-300 mb-4">For financial advisors</p>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✦</span>
                <span>10x your practice without hiring</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✦</span>
                <span>White-label: your brand, your platform</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✦</span>
                <span>AI handles analysis & client prep</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✦</span>
                <span>You control what clients see</span>
              </li>
            </ul>
            <div className="mt-6 pt-6 border-t border-emerald-500/20">
              <p className="text-sm text-gray-400">Serve 100 clients like you serve 10.</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <p className="text-gray-400">Same intelligence. Different interfaces. One mission.</p>
        </div>
      </div>
    </div>
  );
}

function WhyNowSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 md:px-12">
      <div className="max-w-4xl w-full animate-fade-in">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Why Now?</h2>
        <p className="text-xl text-gray-400 mb-10">We're at an inflection point. And timing matters.</p>
        
        <div className="space-y-8">
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">AI just became good enough</h3>
                <p className="text-gray-400">
                  GPT-4, Claude, and open models crossed the threshold. They can now reason about complex financial situations, 
                  explain their thinking, and catch nuance. This wasn't possible 2 years ago.
                </p>
              </div>
            </div>
          </div>
          
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-xl font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">We're building AI-native, not AI-assisted</h3>
                <p className="text-gray-400">
                  Everyone else is bolting ChatGPT onto legacy systems. We're building from scratch — 
                  AI at the core, not the edge. The difference is night and day.
                </p>
              </div>
            </div>
          </div>
          
          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-xl font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Compound learning advantage</h3>
                <p className="text-gray-400">
                  Every user makes Maven smarter. Every edge case, every correction, every insight — 
                  feeds back into the system. Start early → learn faster → widen the moat.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-10 p-5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-lg text-center text-indigo-200">
            "The best time to build this was impossible. The second best time is <span className="font-semibold">right now</span>."
          </p>
        </div>
      </div>
    </div>
  );
}

function TeamSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 md:px-12">
      <div className="max-w-3xl w-full animate-fade-in text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-10 text-white">The Team</h2>
        
        <div className="bg-gradient-to-br from-[#12121a] to-[#1a1a24] border border-white/10 rounded-3xl p-8 md:p-12 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl shadow-indigo-500/20">
            👨‍💻
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-2">Sam Adams</h3>
          <p className="text-indigo-400 mb-6">Founder</p>
          
          <div className="space-y-3 text-gray-300 text-lg">
            <p>20+ years in fintech & wealth management</p>
            <p>Built and scaled financial platforms</p>
            <p>Deep believer in AI's transformative potential</p>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-gray-400 italic">
              "I've spent my career watching technology transform finance — but always incrementally. 
              AI is different. It's the first technology that can actually <em>think</em> alongside you. 
              Maven is what I wish I could've built 10 years ago."
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-3 text-gray-400 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-lg">
            🤖
          </div>
          <p>+ AI that writes half the code and challenges every assumption</p>
        </div>
      </div>
    </div>
  );
}

function WhereWeAreSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 md:px-12">
      <div className="max-w-4xl w-full animate-fade-in text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Where We Are</h2>
        
        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full mb-10">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-300 font-medium">Early but moving fast</span>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-10 text-left">
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
              <span>✓</span> Built
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Full portfolio analysis engine</li>
              <li>• AI-powered insights & recommendations</li>
              <li>• Beautiful, responsive UI</li>
              <li>• Tax optimization detection</li>
              <li>• What-If scenario modeling</li>
              <li>• Demo with live market data</li>
            </ul>
          </div>
          
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
              <span>◐</span> Building
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Account aggregation (Plaid)</li>
              <li>• Automated trade execution</li>
              <li>• Multi-user family views</li>
              <li>• Advisor dashboard (Partners)</li>
              <li>• Mobile apps</li>
              <li>• Bittensor AI integration</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h3 className="text-xl font-semibold text-white mb-3">Founding Partners Welcome</h3>
          <p className="text-gray-400 mb-4">
            We're looking for a small group of early believers — individuals and advisors who want to 
            shape what Maven becomes. Early access, direct input on features, and founding member pricing.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <span className="px-3 py-1.5 bg-white/5 rounded-lg text-gray-300">Priority features</span>
            <span className="px-3 py-1.5 bg-white/5 rounded-lg text-gray-300">Direct line to founders</span>
            <span className="px-3 py-1.5 bg-white/5 rounded-lg text-gray-300">Locked-in pricing</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CTASlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 md:px-12">
      <div className="max-w-3xl w-full animate-fade-in text-center">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-5xl font-bold mx-auto mb-8 shadow-2xl shadow-purple-500/30 animate-glow">
          M
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
          Let's Talk
        </h2>
        <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto">
          I'd love to show you what we're building, hear your thoughts, and see if there's a way to work together.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <a
            href="mailto:sam@mavenwealth.ai?subject=Let's%20Talk%20About%20Maven"
            className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold text-lg rounded-xl transition transform hover:scale-105 flex items-center gap-2 shadow-lg shadow-indigo-500/25"
          >
            Get in Touch
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <Link
            href="/demo"
            className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-lg rounded-xl transition flex items-center gap-2"
          >
            <span>Try the Demo</span>
            <span className="text-xs text-gray-400">(it's live)</span>
          </Link>
        </div>
        
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-lg">
            <a href="mailto:sam@mavenwealth.ai" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2 transition">
              <span>📧</span>
              sam@mavenwealth.ai
            </a>
          </div>
          <p className="mt-6 text-gray-500 text-sm">
            Built with conviction in San Francisco · 2026
          </p>
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
    { id: 'vision', content: <VisionSlide /> },
    { id: 'what-maven-does', content: <WhatMavenDoesSlide /> },
    { id: 'magic', content: <MagicSlide /> },
    { id: 'two-products', content: <TwoProductsSlide /> },
    { id: 'why-now', content: <WhyNowSlide /> },
    { id: 'team', content: <TeamSlide /> },
    { id: 'where-we-are', content: <WhereWeAreSlide /> },
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
        
        @keyframes glow {
          0%, 100% { 
            box-shadow: 0 0 30px rgba(139, 92, 246, 0.3);
          }
          50% { 
            box-shadow: 0 0 50px rgba(139, 92, 246, 0.5);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .animate-slide-up {
          opacity: 0;
          animation: slide-up 0.6s ease-out forwards;
        }
        
        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }
      `}</style>

      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-600/5 rounded-full blur-3xl" />
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
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 w-8' 
                : 'bg-white/20 hover:bg-white/40 w-2.5'
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
