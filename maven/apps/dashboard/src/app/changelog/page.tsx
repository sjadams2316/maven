'use client';

import Link from 'next/link';
import Header from '../components/Header';

interface ChangelogEntry {
  version: string;
  date: Date;
  title: string;
  highlights: string[];
  features?: string[];
  improvements?: string[];
  fixes?: string[];
}

const CHANGELOG: ChangelogEntry[] = [
  {
    version: '2.4.0',
    date: new Date('2026-02-08'),
    title: 'Advisor Dashboard & Family Wealth',
    highlights: [
      'Complete advisor control panel for Maven Partners',
      'Multi-generational family wealth view',
      'Goals tracker with projections',
    ],
    features: [
      'Advisor Dashboard with client management',
      'Insight curation controls for advisors',
      'Meeting prep generator with talking points',
      'Family wealth dashboard with tree visualization',
      'Financial goals tracker with on-track projections',
      'Client invite flow with welcome cards',
      'Practice analytics for advisors',
    ],
    improvements: [
      'Reorganized dashboard tools (Primary + Additional)',
      'Glowing Oracle button animation',
      'Better mobile navigation with bottom tabs',
    ],
  },
  {
    version: '2.3.0',
    date: new Date('2026-02-01'),
    title: 'Tax Optimization Suite',
    highlights: [
      'Automated tax-loss harvesting scanner',
      'Wash sale detection and prevention',
      'What-If scenario engine',
    ],
    features: [
      'Tax-loss harvesting scanner with swap suggestions',
      'Wash sale risk detection across accounts',
      'What-If scenario engine (12 presets + custom)',
      'Life transition playbooks (inheritance, job loss)',
      'Retirement optimizer with 401k analysis',
    ],
    improvements: [
      'Faster account syncing',
      'Improved Oracle response quality',
    ],
    fixes: [
      'Fixed portfolio chart rendering on mobile',
      'Corrected retirement projection calculations',
    ],
  },
  {
    version: '2.2.0',
    date: new Date('2026-01-15'),
    title: 'Market Fragility Index™',
    highlights: [
      'Real-time market stress indicator',
      '8 pillars of market health analysis',
      'Personalized portfolio impact alerts',
    ],
    features: [
      'Market Fragility Index with 8 pillars',
      '40+ indicators tracked in real-time',
      'Historical fragility chart',
      'Personalized impact analysis for your portfolio',
      'Fragility alerts and notifications',
    ],
    improvements: [
      'New dark theme throughout',
      'Redesigned dashboard layout',
    ],
  },
  {
    version: '2.1.0',
    date: new Date('2026-01-01'),
    title: 'Portfolio Lab Launch',
    highlights: [
      'Complete portfolio analysis suite',
      'AI-powered optimization suggestions',
      'Stress testing with historical scenarios',
    ],
    features: [
      'Portfolio Lab with 6 analysis tabs',
      'Monte Carlo retirement projections',
      'Risk-adjusted optimization suggestions',
      'Stress testing (2008, COVID, etc.)',
      'Correlation analysis',
    ],
  },
  {
    version: '2.0.0',
    date: new Date('2025-12-01'),
    title: 'Maven 2.0 - AI Wealth Partner',
    highlights: [
      'Complete platform redesign',
      'Maven Oracle AI assistant',
      'Multi-account aggregation',
    ],
    features: [
      'Maven Oracle - conversational AI assistant',
      'Plaid integration for account linking',
      'Real-time portfolio sync',
      'Net worth tracking',
      'Beautiful new dashboard',
    ],
  },
];

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl mx-auto mb-4">
            ✨
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">What's New in Maven</h1>
          <p className="text-gray-400">Latest features, improvements, and fixes</p>
        </div>
        
        {/* Changelog Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500 via-purple-500 to-transparent" />
          
          <div className="space-y-12">
            {CHANGELOG.map((entry, idx) => (
              <div key={idx} className="relative pl-12 sm:pl-16">
                {/* Timeline dot */}
                <div className="absolute left-0 sm:left-2 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white z-10">
                  {entry.version.split('.')[1]}
                </div>
                
                {/* Content */}
                <div className="bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden">
                  {/* Header */}
                  <div className="p-4 sm:p-6 border-b border-white/10">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-mono rounded">
                        v{entry.version}
                      </span>
                      <span className="text-sm text-gray-500">{formatDate(entry.date)}</span>
                    </div>
                    <h2 className="text-xl font-bold text-white">{entry.title}</h2>
                  </div>
                  
                  {/* Highlights */}
                  <div className="p-4 sm:p-6 bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
                    <div className="flex flex-wrap gap-2">
                      {entry.highlights.map((highlight, hIdx) => (
                        <span 
                          key={hIdx}
                          className="px-3 py-1 bg-white/10 text-gray-300 text-sm rounded-full"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Details */}
                  <div className="p-4 sm:p-6 space-y-4">
                    {entry.features && entry.features.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-emerald-400 mb-2 flex items-center gap-2">
                          <span>✨</span> New Features
                        </h4>
                        <ul className="space-y-1">
                          {entry.features.map((feature, fIdx) => (
                            <li key={fIdx} className="text-sm text-gray-400 flex items-start gap-2">
                              <span className="text-emerald-500 mt-1">•</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {entry.improvements && entry.improvements.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
                          <span>📈</span> Improvements
                        </h4>
                        <ul className="space-y-1">
                          {entry.improvements.map((improvement, iIdx) => (
                            <li key={iIdx} className="text-sm text-gray-400 flex items-start gap-2">
                              <span className="text-blue-500 mt-1">•</span>
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {entry.fixes && entry.fixes.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-amber-400 mb-2 flex items-center gap-2">
                          <span>🐛</span> Bug Fixes
                        </h4>
                        <ul className="space-y-1">
                          {entry.fixes.map((fix, fxIdx) => (
                            <li key={fxIdx} className="text-sm text-gray-400 flex items-start gap-2">
                              <span className="text-amber-500 mt-1">•</span>
                              {fix}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Subscribe */}
        <div className="mt-12 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">Stay Updated</h3>
          <p className="text-gray-400 text-sm mb-4">Get notified about new features and updates</p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition">
              Subscribe
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
