'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const TESTIMONIALS = [
  {
    quote: "Maven helps me understand my money in ways my old statements never could.",
    name: "Sarah C.",
    role: "Maven Partners Client",
  },
  {
    quote: "I can now serve 3x more clients without hiring additional staff.",
    name: "Jon A.",
    role: "Independent RIA",
  },
  {
    quote: "The tax-loss harvesting alone saved me $12,000 last year.",
    name: "Michael T.",
    role: "Maven Pro User",
  },
];

const FEATURES = [
  {
    icon: '🔮',
    title: 'AI-Powered Insights',
    description: 'Get personalized recommendations based on your complete financial picture.',
  },
  {
    icon: '📊',
    title: 'Portfolio Intelligence',
    description: 'Understand risk, optimize allocation, and track performance across all accounts.',
  },
  {
    icon: '💰',
    title: 'Tax Optimization',
    description: 'Automated tax-loss harvesting and wash sale detection save you thousands.',
  },
  {
    icon: '🎯',
    title: 'Retirement Planning',
    description: 'Interactive projections show exactly when you can retire and how.',
  },
  {
    icon: '🛡️',
    title: 'Risk Protection',
    description: 'Market Fragility Index™ alerts you before volatility hits your portfolio.',
  },
  {
    icon: '🤝',
    title: 'Collaborative Planning',
    description: 'Work with your advisor in real-time with shared plans and goals.',
  },
];

export default function HomePage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  // Rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white">
              M
            </div>
            <span className="text-xl font-bold text-white">Maven</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-gray-400 hover:text-white transition">Features</a>
            <a href="#pricing" className="text-gray-400 hover:text-white transition">Pricing</a>
            <a href="#advisors" className="text-gray-400 hover:text-white transition">For Advisors</a>
          </nav>
          
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard"
              className="text-gray-400 hover:text-white transition px-4 py-2"
            >
              Sign In
            </Link>
            <Link 
              href="/dashboard"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-sm text-indigo-300 mb-6">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            AI-powered wealth management is here
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Your money,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              finally understood
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Maven uses AI to give you the same wealth intelligence that used to cost $10M minimum. 
            See your complete picture, optimize taxes, and plan your future — all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/dashboard"
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white px-8 py-4 rounded-xl font-semibold text-lg transition transform hover:scale-105"
            >
              Try Maven Free →
            </Link>
            <Link 
              href="/vision"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg transition"
            >
              Watch Demo
            </Link>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">No credit card required • 14-day free trial</p>
        </div>
      </section>
      
      {/* Features */}
      <section id="features" className="py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need to build wealth
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Maven brings together all your accounts, analyzes your complete picture, 
              and gives you actionable insights to grow your wealth.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, idx) => (
              <div 
                key={idx}
                className="bg-[#12121a] border border-white/10 rounded-2xl p-6 hover:border-indigo-500/30 transition group"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-b from-transparent to-indigo-950/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-12">
            Trusted by thousands
          </h2>
          
          <div className="relative h-40">
            {TESTIMONIALS.map((testimonial, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-all duration-500 ${
                  idx === currentTestimonial 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
              >
                <p className="text-2xl text-gray-300 mb-6">"{testimonial.quote}"</p>
                <p className="text-white font-medium">{testimonial.name}</p>
                <p className="text-gray-500 text-sm">{testimonial.role}</p>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center gap-2 mt-8">
            {TESTIMONIALS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentTestimonial(idx)}
                className={`w-2 h-2 rounded-full transition ${
                  idx === currentTestimonial ? 'bg-indigo-500 w-6' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Pricing */}
      <section id="pricing" className="py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-gray-400 text-lg">
              Start free. Upgrade when you're ready.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Basic */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Maven Basic</h3>
              <p className="text-gray-500 text-sm mb-4">Get started with the essentials</p>
              <p className="text-3xl font-bold text-white mb-1">Free</p>
              <p className="text-sm text-gray-500 mb-6">forever</p>
              
              <ul className="space-y-3 mb-8">
                {['Portfolio overview', 'Basic retirement calculator', 'Market Fragility Index', 'Limited AI insights'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="text-emerald-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              
              <Link 
                href="/dashboard"
                className="block w-full py-3 bg-white/10 hover:bg-white/20 text-white text-center rounded-xl transition"
              >
                Get Started
              </Link>
            </div>
            
            {/* Pro */}
            <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-500 text-white text-xs font-medium rounded-full">
                Most Popular
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2">Maven Pro</h3>
              <p className="text-gray-400 text-sm mb-4">For serious DIY investors</p>
              <p className="text-3xl font-bold text-white mb-1">$29<span className="text-lg font-normal text-gray-400">/mo</span></p>
              <p className="text-sm text-gray-500 mb-6">billed annually</p>
              
              <ul className="space-y-3 mb-8">
                {['Everything in Basic', 'Unlimited AI insights', 'Tax-loss harvesting', 'What-If scenarios', 'Priority support'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="text-emerald-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              
              <Link 
                href="/dashboard"
                className="block w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-center rounded-xl transition"
              >
                Start Free Trial
              </Link>
            </div>
            
            {/* Partners */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Maven Partners</h3>
              <p className="text-gray-500 text-sm mb-4">Work with a Maven advisor</p>
              <p className="text-3xl font-bold text-white mb-1">Custom</p>
              <p className="text-sm text-gray-500 mb-6">included in AUM fee</p>
              
              <ul className="space-y-3 mb-8">
                {['Everything in Pro', 'Personal advisor', 'Unlimited accounts', 'Family dashboard', 'Concierge support'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                    <span className="text-emerald-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              
              <Link 
                href="/contact"
                className="block w-full py-3 bg-white/10 hover:bg-white/20 text-white text-center rounded-xl transition"
              >
                Talk to Sales
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* For Advisors */}
      <section id="advisors" className="py-24 border-t border-white/10 bg-gradient-to-b from-transparent to-emerald-950/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-sm text-emerald-400 mb-4">
                For Financial Advisors
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Serve 10x more clients with Maven for RIAs
              </h2>
              
              <p className="text-gray-400 text-lg mb-6">
                Give your clients a premium wealth experience while saving hours on portfolio analysis, 
                meeting prep, and client communication.
              </p>
              
              <ul className="space-y-4 mb-8">
                {[
                  'Control exactly what clients see (no scary alerts)',
                  'Auto-generated meeting prep with talking points',
                  'Client engagement tracking and analytics',
                  'Compliance-ready audit trails',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300">
                    <span className="text-emerald-400 mt-1">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              
              <Link 
                href="/advisor"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold transition"
              >
                Explore Advisor Dashboard →
              </Link>
            </div>
            
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
                  JA
                </div>
                <div>
                  <p className="font-medium text-white">Jon Adams</p>
                  <p className="text-xs text-gray-500">Adams Wealth Management</p>
                </div>
                <div className="ml-auto px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                  Advisor
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-white">$5.3M</p>
                  <p className="text-xs text-gray-500">Total AUM</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-white">8</p>
                  <p className="text-xs text-gray-500">Clients</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-400">+12%</p>
                  <p className="text-xs text-gray-500">YTD Return</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm">
                  <span>💡</span>
                  <span className="text-amber-200">2 tax-loss harvest opportunities ($6,400)</span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm">
                  <span>📅</span>
                  <span className="text-blue-200">3 client meetings this week</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-24 border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to take control of your wealth?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join thousands of people using Maven to understand and grow their money.
          </p>
          
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white px-8 py-4 rounded-xl font-semibold text-lg transition transform hover:scale-105"
          >
            Get Started Free →
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                M
              </div>
              <span className="text-gray-400">© 2026 Maven. All rights reserved.</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Terms</a>
              <a href="#" className="hover:text-white transition">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
