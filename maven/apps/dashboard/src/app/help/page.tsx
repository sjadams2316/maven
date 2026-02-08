'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';

const FAQ = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'How do I connect my accounts?',
        a: 'Go to Dashboard → Link Accounts (or visit /accounts/link). We use Plaid for secure bank-level connections. Your credentials are never stored on our servers.',
      },
      {
        q: 'Is my data secure?',
        a: 'Yes. We use 256-bit encryption, SOC 2 Type II compliance, and never store your bank credentials. Your data is encrypted at rest and in transit.',
      },
      {
        q: 'What accounts can I connect?',
        a: 'Most major brokerages (Schwab, Fidelity, Vanguard, etc.), banks, 401(k) providers, and crypto exchanges (Coinbase, etc.).',
      },
    ],
  },
  {
    category: 'Features',
    questions: [
      {
        q: 'What is the Market Fragility Index?',
        a: 'Our proprietary indicator that measures market stress across 8 pillars (volatility, credit spreads, liquidity, etc.). It helps you understand market conditions before they impact your portfolio.',
      },
      {
        q: 'How does tax-loss harvesting work?',
        a: 'Maven scans your portfolio for positions with losses. You can "harvest" these losses to offset gains, reducing your tax bill. We also detect wash sale risks.',
      },
      {
        q: 'What is the Oracle?',
        a: 'Maven Oracle is our AI assistant that can answer questions about your portfolio, run analyses, and provide personalized insights based on your financial situation.',
      },
    ],
  },
  {
    category: 'Pricing',
    questions: [
      {
        q: 'Is Maven free?',
        a: 'Maven Basic is free forever with limited features. Maven Pro is $29-49/month with full features. Maven Partners includes advisor support.',
      },
      {
        q: 'Can I cancel anytime?',
        a: 'Yes, you can cancel your subscription at any time. Your data will be retained for 30 days in case you want to reactivate.',
      },
    ],
  },
  {
    category: 'Maven Partners',
    questions: [
      {
        q: 'What is Maven Partners?',
        a: 'Maven Partners connects you with a fiduciary financial advisor who uses Maven to manage your wealth. The platform is included in their advisory fee.',
      },
      {
        q: 'How do I join Maven Partners?',
        a: 'You\'ll receive an invite code from your advisor. Visit the invite link to create your account and access your personalized dashboard.',
      },
    ],
  },
];

const CONTACT_OPTIONS = [
  {
    icon: '💬',
    title: 'Chat with Support',
    desc: 'Get instant help from our team',
    action: 'Start Chat',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    icon: '📧',
    title: 'Email Us',
    desc: 'support@maven.com',
    action: 'Send Email',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: '📞',
    title: 'Call Us',
    desc: 'Mon-Fri 9am-5pm ET',
    action: '(555) 123-4567',
    color: 'from-emerald-500 to-teal-500',
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);
  
  const toggleQuestion = (question: string) => {
    setExpandedQuestions(prev =>
      prev.includes(question)
        ? prev.filter(q => q !== question)
        : [...prev, question]
    );
  };
  
  const filteredFAQ = FAQ.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.questions.length > 0);
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl mx-auto mb-4">
            ❓
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">How can we help?</h1>
          <p className="text-gray-400">Search our FAQ or contact support</p>
        </div>
        
        {/* Search */}
        <div className="relative mb-8">
          <input
            type="text"
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-5 py-4 pl-12 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 text-lg"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
        </div>
        
        {/* Contact Options */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {CONTACT_OPTIONS.map((option, idx) => (
            <button
              key={idx}
              className="bg-[#12121a] border border-white/10 rounded-2xl p-5 text-left hover:border-indigo-500/30 transition group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition`}>
                {option.icon}
              </div>
              <h3 className="font-semibold text-white mb-1">{option.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{option.desc}</p>
              <span className="text-indigo-400 text-sm">{option.action} →</span>
            </button>
          ))}
        </div>
        
        {/* FAQ */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Frequently Asked Questions</h2>
          
          {filteredFAQ.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No results found for "{searchQuery}"</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="text-indigo-400 hover:text-indigo-300 mt-2"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredFAQ.map((category, catIdx) => (
                <div key={catIdx}>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                    {category.category}
                  </h3>
                  <div className="bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
                    {category.questions.map((item, idx) => (
                      <div key={idx}>
                        <button
                          onClick={() => toggleQuestion(item.q)}
                          className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition"
                        >
                          <span className="font-medium text-white pr-4">{item.q}</span>
                          <span className={`text-gray-500 transition-transform ${
                            expandedQuestions.includes(item.q) ? 'rotate-180' : ''
                          }`}>
                            ▼
                          </span>
                        </button>
                        {expandedQuestions.includes(item.q) && (
                          <div className="px-4 pb-4">
                            <p className="text-gray-400 leading-relaxed">{item.a}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Still need help? */}
        <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Still need help?</h3>
          <p className="text-gray-400 mb-4">Our support team is here for you.</p>
          <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition">
            Contact Support
          </button>
        </div>
        
        {/* Quick Links */}
        <div className="mt-8 grid sm:grid-cols-4 gap-4">
          {[
            { icon: '📚', label: 'Documentation', href: '#' },
            { icon: '🎥', label: 'Video Tutorials', href: '#' },
            { icon: '📝', label: 'Blog', href: '#' },
            { icon: '🔒', label: 'Security', href: '#' },
          ].map((link, idx) => (
            <Link
              key={idx}
              href={link.href}
              className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition"
            >
              <span className="text-xl">{link.icon}</span>
              <span className="text-gray-300">{link.label}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
