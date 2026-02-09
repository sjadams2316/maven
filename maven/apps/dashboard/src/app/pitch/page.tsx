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
          The Intelligence Layer for Wealth
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-gray-500 text-lg">Live and learning</span>
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
          Wealth management needs an <span className="text-indigo-400">operating system</span>.
        </h2>
        
        <div className="space-y-8 mb-10">
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <p className="text-2xl text-gray-300 leading-relaxed">
              Advisors juggle <span className="text-amber-400">dozens of tools</span> — portfolio analytics, tax software, 
              planning tools, research platforms, CRMs. None of them talk to each other.
            </p>
          </div>
          
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-2xl text-gray-300 leading-relaxed">
              Clients get <span className="text-red-400">fragmented experiences</span> — logging into 5 different portals, 
              no unified view, no proactive guidance.
            </p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <div className="text-3xl font-bold text-red-400 mb-1">8+</div>
            <p className="text-sm text-gray-400">Tools the avg advisor uses</p>
            <p className="text-xs text-gray-500 mt-1">None truly integrated</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <div className="text-3xl font-bold text-amber-400 mb-1">70%</div>
            <p className="text-sm text-gray-400">Time on non-client work</p>
            <p className="text-xs text-gray-500 mt-1">Admin, data entry, prep</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-1">$0</div>
            <p className="text-sm text-gray-400">Learns from interactions</p>
            <p className="text-xs text-gray-500 mt-1">Every tool starts from zero</p>
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
        <div className="text-6xl mb-8">🧠</div>
        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white leading-tight">
          Maven is the <span className="bg-gradient-to-r from-indigo-400 to-purple-400 text-transparent bg-clip-text">Palantir</span> of wealth.
        </h2>
        
        <div className="space-y-6 text-xl md:text-2xl text-gray-300 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <p>
            An <span className="text-indigo-300 font-medium">intelligence operating system</span> that sits on top of everything.
          </p>
          <p>
            It sees all the data. Connects the dots. <span className="text-emerald-400">Learns continuously.</span>
          </p>
          <p className="text-white font-medium">
            And gets smarter with every client, every decision, every outcome.
          </p>
        </div>
        
        <div className="mt-12 p-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-2xl text-white mb-2">
            Not a tool. An <span className="text-indigo-400">intelligence layer</span>.
          </p>
          <p className="text-gray-400">
            The more it's used, the more valuable it becomes — for advisors, for clients, for everyone on the platform.
          </p>
        </div>
      </div>
    </div>
  );
}

function MavenPartnersSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 md:px-12">
      <div className="max-w-4xl w-full animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full mb-6 animate-slide-up">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-300 text-sm font-medium">Phase 1: The Launch</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Maven Partners</h2>
        <p className="text-xl text-gray-400 mb-10">Our own RIA — the tip of the spear</p>
        
        <div className="space-y-6">
          <div className="flex items-start gap-5 bg-gradient-to-r from-emerald-500/10 to-transparent border-l-4 border-emerald-500 rounded-r-2xl p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="text-4xl">🎯</div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Launch with real clients</h3>
              <p className="text-gray-400">Not a demo. Not a prototype. A real RIA with real assets, real compliance, real results. Our advisor brings 20+ years of relationships.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-5 bg-gradient-to-r from-indigo-500/10 to-transparent border-l-4 border-indigo-500 rounded-r-2xl p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="text-4xl">⚡</div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">10x advisor productivity</h3>
              <p className="text-gray-400">AI handles meeting prep, tax analysis, rebalancing reviews, and client communications. One advisor can serve 100+ clients with white-glove service.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-5 bg-gradient-to-r from-purple-500/10 to-transparent border-l-4 border-purple-500 rounded-r-2xl p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="text-4xl">📈</div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">The learning flywheel begins</h3>
              <p className="text-gray-400">Every client interaction, every decision, every outcome feeds Maven Intelligence. The system learns what works — in the real world, with real money.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolsSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 md:px-12">
      <div className="max-w-5xl w-full animate-fade-in">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white text-center">The Arsenal</h2>
        <p className="text-xl text-gray-400 text-center mb-10">Tools that give our advisors superpowers</p>
        
        <div className="grid md:grid-cols-2 gap-5">
          <div className="group bg-gradient-to-br from-amber-500/20 to-orange-600/10 border border-amber-500/30 rounded-2xl p-6 hover:scale-[1.02] transition-transform animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30">
                ⚡
              </div>
              <h3 className="text-xl font-semibold text-white">Fragility Index™</h3>
            </div>
            <p className="text-gray-300 mb-3">Real-time market stress detection across 8 pillars. Know when to be defensive <em>before</em> the crowd panics.</p>
            <p className="text-sm text-amber-400/80">Proprietary. No competitor has this.</p>
          </div>
          
          <div className="group bg-gradient-to-br from-purple-500/20 to-pink-600/10 border border-purple-500/30 rounded-2xl p-6 hover:scale-[1.02] transition-transform animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/30">
                🔮
              </div>
              <h3 className="text-xl font-semibold text-white">What-If Engine</h3>
            </div>
            <p className="text-gray-300 mb-3">Model any scenario in seconds. Show clients the impact of decisions before they make them. Gamified grades (A+ to F).</p>
            <p className="text-sm text-purple-400/80">Monte Carlo meets intuitive UX.</p>
          </div>
          
          <div className="group bg-gradient-to-br from-emerald-500/20 to-teal-600/10 border border-emerald-500/30 rounded-2xl p-6 hover:scale-[1.02] transition-transform animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/30">
                🌾
              </div>
              <h3 className="text-xl font-semibold text-white">Tax Intelligence</h3>
            </div>
            <p className="text-gray-300 mb-3">Automated tax-loss harvesting detection, wash sale protection, Roth conversion analysis. Finds alpha others miss.</p>
            <p className="text-sm text-emerald-400/80">Thousands saved per client annually.</p>
          </div>
          
          <div className="group bg-gradient-to-br from-blue-500/20 to-cyan-600/10 border border-blue-500/30 rounded-2xl p-6 hover:scale-[1.02] transition-transform animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl shadow-lg shadow-blue-500/30">
                🤖
              </div>
              <h3 className="text-xl font-semibold text-white">Oracle AI</h3>
            </div>
            <p className="text-gray-300 mb-3">AI assistant that knows the client's full picture. Generates meeting agendas, answers questions, explains complex concepts.</p>
            <p className="text-sm text-blue-400/80">Always available. Always current.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HumanPlusAISlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 md:px-12">
      <div className="max-w-4xl w-full animate-fade-in">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white text-center">Human + AI</h2>
        <p className="text-xl text-gray-400 text-center mb-10">The planners we hire aren't typical. That's the point.</p>
        
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/10 border border-blue-500/30 rounded-2xl p-6 text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-blue-500/30">
              📊
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Planning Expertise</h3>
            <p className="text-gray-400 text-sm">Deep knowledge of tax, retirement, estate, and investment strategies. The technical foundation.</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/10 border border-purple-500/30 rounded-2xl p-6 text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-purple-500/30">
              🔧
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Technology Fluency</h3>
            <p className="text-gray-400 text-sm">Native comfort with AI tools. They don't just use Maven — they push it, question it, improve it.</p>
          </div>
          
          <div className="bg-gradient-to-br from-amber-500/20 to-orange-600/10 border border-amber-500/30 rounded-2xl p-6 text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-amber-500/30">
              🧠
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Behavioral Psychology</h3>
            <p className="text-gray-400 text-sm">Understanding that most financial mistakes are emotional, not technical. Fear, greed, loss aversion.</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-center gap-8 mb-4">
            <div className="text-center">
              <div className="text-4xl mb-2">🤖</div>
              <p className="text-sm text-gray-400">AI handles</p>
              <p className="text-indigo-300 font-medium">Analysis & Optimization</p>
            </div>
            <div className="text-3xl text-gray-600">+</div>
            <div className="text-center">
              <div className="text-4xl mb-2">👤</div>
              <p className="text-sm text-gray-400">Human handles</p>
              <p className="text-indigo-300 font-medium">Behavior & Coaching</p>
            </div>
            <div className="text-3xl text-gray-600">=</div>
            <div className="text-center">
              <div className="text-4xl mb-2">✨</div>
              <p className="text-sm text-gray-400">Together create</p>
              <p className="text-emerald-300 font-medium">Superhuman Advisor</p>
            </div>
          </div>
          <p className="text-center text-gray-400 text-sm">
            This combination is rare. That's the moat. We're building a network of planners who can do what neither AI nor typical advisors can do alone.
          </p>
        </div>
      </div>
    </div>
  );
}

function FlywheelSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 md:px-12">
      <div className="max-w-4xl w-full animate-fade-in">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white text-center">The Flywheel</h2>
        <p className="text-xl text-gray-400 text-center mb-12">Maven Intelligence gets smarter with every interaction</p>
        
        <div className="relative">
          {/* Central hub */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40 z-10">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">MI</div>
              <div className="text-xs text-indigo-200">Intelligence</div>
            </div>
          </div>
          
          {/* Orbiting elements */}
          <div className="grid grid-cols-2 gap-8 py-8">
            <div className="text-right pr-20 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="inline-block bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-5">
                <h3 className="text-lg font-semibold text-emerald-400 mb-2">Partners clients</h3>
                <p className="text-sm text-gray-400">Real decisions, real outcomes</p>
              </div>
            </div>
            
            <div className="text-left pl-20 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="inline-block bg-blue-500/20 border border-blue-500/30 rounded-2xl p-5">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Market signals</h3>
                <p className="text-sm text-gray-400">40+ indicators, real-time</p>
              </div>
            </div>
            
            <div className="text-right pr-20 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="inline-block bg-purple-500/20 border border-purple-500/30 rounded-2xl p-5">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Tax outcomes</h3>
                <p className="text-sm text-gray-400">What actually saved money</p>
              </div>
            </div>
            
            <div className="text-left pl-20 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="inline-block bg-amber-500/20 border border-amber-500/30 rounded-2xl p-5">
                <h3 className="text-lg font-semibold text-amber-400 mb-2">Advisor feedback</h3>
                <p className="text-sm text-gray-400">Expert validation loop</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl text-center animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <p className="text-lg text-indigo-200">
            <span className="font-semibold">Compound learning.</span> Every month, Maven gets meaningfully better.
            <br />
            <span className="text-gray-400">That's the moat. That's what can't be copied.</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function RoadmapSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 md:px-12">
      <div className="max-w-4xl w-full animate-fade-in">
        <h2 className="text-4xl md:text-5xl font-bold mb-10 text-white text-center">The Path</h2>
        
        <div className="space-y-6">
          {/* Phase 1 */}
          <div className="flex items-start gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-2xl font-bold shadow-lg shadow-emerald-500/30">
              1
            </div>
            <div className="flex-grow bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold text-white">Maven Partners</h3>
                <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-300 text-xs rounded-full">NOW</span>
              </div>
              <p className="text-gray-400 mb-3">Launch our RIA. Prove the model with real clients, real AUM, real results.</p>
              <p className="text-sm text-emerald-400">Revenue: AUM fees · Learning: Maximum</p>
            </div>
          </div>
          
          {/* Phase 2 */}
          <div className="flex items-start gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold shadow-lg shadow-indigo-500/30">
              2
            </div>
            <div className="flex-grow bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold text-white">Maven Basic & Pro</h3>
                <span className="px-2 py-0.5 bg-indigo-500/30 text-indigo-300 text-xs rounded-full">Q3 2026</span>
              </div>
              <p className="text-gray-400 mb-3">Consumer products powered by what we've learned. Free tier for awareness, Pro ($29-49/mo) for power users.</p>
              <p className="text-sm text-indigo-400">Revenue: Subscriptions · Funnel: Converts to Partners</p>
            </div>
          </div>
          
          {/* Phase 3 */}
          <div className="flex items-start gap-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl font-bold shadow-lg shadow-amber-500/30">
              3
            </div>
            <div className="flex-grow bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-semibold text-white">SaaS for RIAs</h3>
                <span className="px-2 py-0.5 bg-amber-500/30 text-amber-300 text-xs rounded-full">SCALE</span>
              </div>
              <p className="text-gray-400 mb-3">Once we've proven the intelligence layer, offer it to other RIAs. They get our tools; we get more data.</p>
              <p className="text-sm text-amber-400">Revenue: B2B SaaS · Flywheel: Accelerates</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WhyNowSlide() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 md:px-12">
      <div className="max-w-4xl w-full animate-fade-in">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Why This Works Now</h2>
        <p className="text-xl text-gray-400 mb-10">Three things that weren't true 2 years ago</p>
        
        <div className="space-y-8">
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xl font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">AI crossed the threshold</h3>
                <p className="text-gray-400">
                  Models can now reason about complex financial situations, explain their thinking, and catch nuance. 
                  This enables real advisory intelligence, not just chatbots.
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
                <h3 className="text-xl font-semibold text-white mb-2">We're building AI-native</h3>
                <p className="text-gray-400">
                  Incumbents are bolting AI onto legacy systems. We're building from scratch with AI at the core. 
                  The architecture difference compounds over time.
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
                <h3 className="text-xl font-semibold text-white mb-2">We see where the puck is headed</h3>
                <p className="text-gray-400">
                  Building a team that deeply understands what advisors and clients actually need — not what vendors think they need.
                  AI development capability (Pantheon) that ships features at 10x speed.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-10 p-5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-lg text-center text-indigo-200">
            Start early → Learn faster → <span className="font-semibold">Widen the moat</span>
          </p>
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
          <span className="text-emerald-300 font-medium">Platform built. RIA launching.</span>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 mb-10 text-left">
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
              <span>✓</span> Built & Working
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Full portfolio analysis engine</li>
              <li>• Fragility Index (8 pillars, 40+ signals)</li>
              <li>• Tax-loss harvesting scanner</li>
              <li>• What-If scenario engine</li>
              <li>• Oracle AI assistant</li>
              <li>• Advisor dashboard with client management</li>
              <li>• Meeting prep generation</li>
            </ul>
          </div>
          
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
              <span>◐</span> In Progress
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Schwab Advisor Services integration</li>
              <li>• Compliance workflow engine</li>
              <li>• Client portal with secure messaging</li>
              <li>• Plaid account aggregation</li>
              <li>• Automated rebalancing</li>
              <li>• Mobile-responsive optimization</li>
            </ul>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <p className="text-lg text-white mb-2">
            <span className="font-semibold">Q2 2026:</span> First clients on platform
          </p>
          <p className="text-gray-400">
            Advisor breaking away from wirehouse. Existing book of business. Day one revenue.
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
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-5xl font-bold mx-auto mb-8 shadow-2xl shadow-purple-500/30 animate-glow">
          M
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
          Let's Talk
        </h2>
        <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto">
          Whether you're an advisor curious about the platform, an investor interested in the vision, 
          or someone who wants family-office intelligence for yourself — I'd love to connect.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <a
            href="mailto:sjadams2316@gmail.com?subject=Let's%20Talk%20About%20Maven"
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
            <span>See the Platform</span>
            <span className="text-xs text-gray-400">(live demo)</span>
          </Link>
        </div>
        
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-lg">
            <a href="mailto:sjadams2316@gmail.com" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-2 transition">
              <span>📧</span>
              sjadams2316@gmail.com
            </a>
          </div>
          <p className="mt-6 text-gray-500 text-sm">
            Maven Wealth · Building the intelligence layer for wealth management · 2026
          </p>
        </div>
      </div>
    </div>
  );
}

// Main Pitch component
export default function PitchPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const slides: Slide[] = [
    { id: 'title', content: <TitleSlide /> },
    { id: 'problem', content: <ProblemSlide /> },
    { id: 'vision', content: <VisionSlide /> },
    { id: 'maven-partners', content: <MavenPartnersSlide /> },
    { id: 'tools', content: <ToolsSlide /> },
    { id: 'human-plus-ai', content: <HumanPlusAISlide /> },
    { id: 'flywheel', content: <FlywheelSlide /> },
    { id: 'roadmap', content: <RoadmapSlide /> },
    { id: 'why-now', content: <WhyNowSlide /> },
    { id: 'where-we-are', content: <WhereWeAreSlide /> },
    { id: 'cta', content: <CTASlide /> },
  ];

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, [slides.length, isTransitioning]);

  const nextSlide = useCallback(() => {
    goToSlide(currentSlide + 1);
  }, [currentSlide, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentSlide - 1);
  }, [currentSlide, goToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        goToSlide(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, goToSlide]);

  // Touch/swipe navigation
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeThreshold = 50;
      
      if (touchStartX - touchEndX > swipeThreshold) {
        nextSlide();
      } else if (touchEndX - touchStartX > swipeThreshold) {
        prevSlide();
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [nextSlide, prevSlide]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-purple-900/20 pointer-events-none" />
      
      {/* Slide content */}
      <div 
        className={`relative h-screen transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          if (clickX > rect.width / 2) {
            nextSlide();
          } else {
            prevSlide();
          }
        }}
      >
        {slides[currentSlide].content}
      </div>

      {/* Navigation dots */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              goToSlide(index);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-indigo-500 w-6' 
                : 'bg-white/20 hover:bg-white/40'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="fixed bottom-8 right-8 text-sm text-gray-500">
        {currentSlide + 1} / {slides.length}
      </div>

      {/* Navigation arrows (desktop) */}
      <div className="hidden md:block">
        {currentSlide > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            className="fixed left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {currentSlide < slides.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            className="fixed right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Exit link */}
      <Link
        href="/"
        className="fixed top-6 left-6 text-gray-500 hover:text-white transition flex items-center gap-2 text-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Exit
      </Link>

      {/* CSS for animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.3); }
          50% { box-shadow: 0 0 60px rgba(139, 92, 246, 0.4); }
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
    </div>
  );
}
