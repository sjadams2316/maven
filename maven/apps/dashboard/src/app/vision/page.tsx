'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const VISION_PASSWORD = 'maven2026';
const MAGIC_TOKEN = 'adams-family-2026';

// Slide data
const slides = [
  {
    id: 'cover',
    type: 'cover',
    content: {
      title: 'Why the RIA Model is Maven\'s Killer Use Case',
      subtitle: 'A thesis in plain English',
    }
  },
  {
    id: 'graveyard',
    type: 'standard',
    content: {
      title: 'The Graveyard of Consumer Fintech',
      body: [
        'Mint is dead.',
        'Personal Capital sold for parts.',
        'Robos are commoditized, racing to zero.',
      ],
      highlight: 'Customer acquisition cost > lifetime value',
      footer: 'Consumers don\'t pay for financial tools. They churn. They\'re skeptical. This is not the game to play.'
    }
  },
  {
    id: 'comparison',
    type: 'comparison',
    content: {
      title: 'Why AI + Advisor Beats AI OR Advisor',
      columns: [
        {
          title: 'Pure AI (Robos)',
          items: ['No trust, no relationship', 'Can\'t handle complexity', 'Clients feel like a number', 'Commoditized to zero margin'],
          winner: false
        },
        {
          title: 'Pure Advisor',
          items: ['Expensive, doesn\'t scale', 'Manual, error-prone', 'Sees clients twice a year', 'Can\'t compete on experience'],
          winner: false
        },
        {
          title: 'AI + Advisor (Maven)',
          items: ['Trust of human relationship', 'Intelligence of AI analysis', 'Scales without sacrificing quality', 'Experience that wows clients'],
          winner: true
        }
      ],
      highlight: 'This isn\'t AI replacing humans. It\'s AI unleashing humans.'
    }
  },
  {
    id: 'human-element',
    type: 'standard',
    content: {
      title: 'The Human Element Remains Essential',
      highlight: 'People still want someone to talk to.',
      body: [
        'Clients will still want to call someone when the market drops 20%.',
        'They\'ll want a human when deciding whether to retire early.',
        'They\'ll want to look someone in the eye when planning their estate.',
      ],
      footer: 'Technology doesn\'t eliminate this need — it elevates it. The advisor who has Maven becomes the advisor who always has the answer, always has the context, always has time.'
    }
  },
  {
    id: 'wirehouse-obsolete',
    type: 'two-column',
    content: {
      title: 'The Wirehouse Model is Obsolete',
      left: {
        title: 'What wirehouses provided:',
        items: ['Brand name and trust', 'Research and insights', 'Product access', 'Compliance infrastructure', 'Training and support']
      },
      right: {
        title: 'What\'s changed:',
        items: [
          'Research is commoditized',
          'Product access is democratized', 
          'Compliance can be outsourced',
          'Technology? Systems from 2005.',
          'The brand? Gen Z doesn\'t care.'
        ]
      },
      footer: 'What wirehouses provide in 2026: a logo, bureaucracy, conflicts of interest, and a 55-65% haircut on everything you produce.'
    }
  },
  {
    id: 'breakaway',
    type: 'standard',
    content: {
      title: 'The Breakaway Moment',
      intro: 'Thousands of top advisors are trapped at wirehouses:',
      body: [
        'Keeping 35-45% of what they produce',
        'Using 1990s technology',
        'Watching their clients get mediocre experiences',
        'Knowing they could do better independently',
      ],
      highlight: 'What stops them? Fear.',
      footer: 'Maven eliminates that fear. With Maven, a breakaway advisor offers clients something better than the wirehouse — not just the same thing with a different logo.'
    }
  },
  {
    id: 'flip-phone',
    type: 'tipping-point',
    content: {
      quote: '"Nothing happens, then everything happens."',
      body: 'The moment a client experiences real-time portfolio intelligence, AI-powered planning, and an interface built for 2026 instead of 2006 — they can\'t unsee it.',
      highlight: 'The wirehouse experience suddenly feels like using a flip phone.'
    }
  },
  {
    id: 'open-architecture',
    type: 'three-boxes',
    content: {
      title: 'Open Architecture: True Independence',
      intro: 'Custody at Schwab. Fully open architecture. No proprietary products.',
      boxes: [
        {
          title: 'Fiduciary Purity',
          body: 'No conflicts of interest. We recommend what\'s best, period.'
        },
        {
          title: 'Best-in-Class Everything',
          body: 'Best custodian. Best TAMP. Best planning tools. Swap as better options emerge.'
        },
        {
          title: 'Integration Flexibility',
          body: 'Schwab, Fidelity, Orion, Envestnet, Plaid. Any tool, any system.'
        }
      ],
      footer: 'We\'re not building a walled garden. We\'re building the intelligence layer that sits on top of everything.'
    }
  },
  {
    id: 'innovation-wave',
    type: 'list',
    content: {
      title: 'Positioned for the Innovation Wave',
      intro: 'Wealth management will change more in 10 years than in the last 50:',
      items: [
        { label: 'AI-Native Advisory', desc: 'Table stakes in 2 years. Adopt early or become obsolete.' },
        { label: 'Tokenization', desc: 'BlackRock, Fidelity, Franklin Templeton are already building it.' },
        { label: 'Regulatory Evolution', desc: 'SEC modernizing. New asset classes coming.' },
        { label: '$84T Wealth Transfer', desc: 'Next gen expects digital-first. No more PDFs.' },
      ],
      highlight: 'We\'re not adapting to change. We\'re positioned to drive it.'
    }
  },
  {
    id: 'tech-native',
    type: 'standard',
    content: {
      title: 'The Scaling Model: Tech-Native Planners',
      intro: 'Traditional model: hire relationship people, teach them finance.',
      highlight: 'Maven model: hire people who understand both technology AND planning.',
      body: [
        'Uses AI tools fluently',
        'Understands the tech stack',
        'Can interpret data, not just read reports',
        'Connects with clients digitally and in person',
      ],
      footer: 'Each one, powered by Maven, can serve 3x the clients with better outcomes. That\'s the math that builds a firm.'
    }
  },
  {
    id: 'experience-economy',
    type: 'standard',
    content: {
      title: 'The Experience Economy',
      highlight: 'Clients don\'t want service. They want an experience.',
      body: [
        'Most advisors compete on service — responsiveness, accuracy, politeness.',
        'We compete on experience — how clients FEEL about their financial lives.',
        'Maven doesn\'t just answer questions. It transforms anxiety into confidence.',
        'That\'s not service. That\'s transformation.',
      ],
      footer: 'An irresistible experience creates word of mouth. Word of mouth creates growth. Growth without marketing spend.'
    }
  },
  {
    id: 'platform-endgame',
    type: 'phases',
    content: {
      title: 'The Growth Model',
      phases: [
        { num: '1', title: 'Prove It', body: 'Launch Maven-powered RIA. Real clients, real money, real compliance. Deliver an experience they\'ve never had.' },
        { num: '2', title: 'Word of Mouth', body: 'Irresistible experience → organic referrals. Clients become advocates. Growth without paid acquisition.' },
        { num: '3', title: 'Scale with Talent', body: 'Hire tech-savvy, charismatic planners who enhance the human connection. Each one serves 3x clients with better outcomes.' },
      ],
      footer: 'The best technology stays in-house. That\'s the moat. SaaS for others? Maybe someday — a watered-down version. But not the crown jewels.'
    }
  },
  {
    id: 'bottom-line',
    type: 'finale',
    content: {
      title: 'The Bottom Line',
      lines: [
        'Consumer fintech is a marketing war. We don\'t win that.',
        'Advisor platforms compete on service. We compete on experience.',
        '',
        'The RIA model isn\'t a pivot. It\'s the unlock.',
        'The client experience isn\'t a feature. It\'s the product.',
        'Word of mouth isn\'t a hope. It\'s the strategy.',
      ],
      highlight: 'This is how Maven wins.'
    }
  }
];

function VisionContent() {
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Auth check
  useEffect(() => {
    const token = searchParams.get('token');
    const auth = sessionStorage.getItem('vision_auth');
    if (token === MAGIC_TOKEN || auth === 'true') {
      sessionStorage.setItem('vision_auth', 'true');
      setIsAuthenticated(true);
    }
    setChecking(false);
  }, [searchParams]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlide(prev => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === VISION_PASSWORD) {
      sessionStorage.setItem('vision_auth', 'true');
      setIsAuthenticated(true);
    } else {
      setError(true);
    }
  };
  
  const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1));
  const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0));
  
  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white animate-pulse">
          M
        </div>
      </div>
    );
  }
  
  // Password gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white mx-auto mb-6">
              M
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Maven Vision Document</h1>
            <p className="text-gray-400">This document is confidential.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="Enter access code"
              className={`w-full bg-white/5 border ${error ? 'border-red-500' : 'border-white/20'} rounded-xl px-4 py-4 text-white text-center text-lg tracking-widest placeholder-gray-500 focus:outline-none focus:border-indigo-500`}
              autoFocus
            />
            {error && <p className="text-red-400 text-sm text-center">Incorrect access code</p>}
            <button type="submit" className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold rounded-xl transition">
              Access Document
            </button>
          </form>
        </div>
      </div>
    );
  }
  
  const slide = slides[currentSlide];
  
  // Render slide based on type
  const renderSlide = () => {
    const c = slide.content as any;
    
    switch (slide.type) {
      case 'cover':
        return (
          <div className="flex flex-col items-center justify-center text-center h-full">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-4xl font-bold text-white mb-8">
              M
            </div>
            <p className="text-indigo-400 text-sm uppercase tracking-[4px] font-semibold mb-4">Maven Wealth Intelligence</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight max-w-4xl">
              {c.title}
            </h1>
            <p className="text-xl text-gray-400 italic">{c.subtitle}</p>
            <p className="absolute bottom-20 text-gray-500 text-sm">February 2026</p>
          </div>
        );
        
      case 'standard':
        return (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">{c.title}</h2>
            {c.intro && <p className="text-xl text-gray-300 mb-6">{c.intro}</p>}
            {c.body && (
              <ul className="space-y-4 mb-8">
                {c.body.map((item: string, i: number) => (
                  <li key={i} className="text-xl text-gray-300 flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
            {c.highlight && (
              <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-l-4 border-indigo-500 p-6 rounded-r-xl mb-8">
                <p className="text-2xl font-semibold text-white">{c.highlight}</p>
              </div>
            )}
            {c.footer && <p className="text-lg text-gray-400">{c.footer}</p>}
          </div>
        );
        
      case 'list':
        return (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">{c.title}</h2>
            {c.intro && <p className="text-xl text-gray-300 mb-8">{c.intro}</p>}
            <div className="space-y-4 mb-8">
              {c.items.map((item: any, i: number) => (
                <div key={i} className="flex items-start gap-4">
                  <span className="text-indigo-400 font-bold text-xl">→</span>
                  <div>
                    <span className="text-xl font-semibold text-white">{item.label}</span>
                    <span className="text-xl text-gray-400"> — {item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
            {c.highlight && (
              <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-l-4 border-indigo-500 p-6 rounded-r-xl mb-6">
                <p className="text-2xl font-semibold text-white">{c.highlight}</p>
              </div>
            )}
            {c.footer && <p className="text-lg text-gray-400">{c.footer}</p>}
          </div>
        );
        
      case 'comparison':
        return (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-10 text-center">{c.title}</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {c.columns.map((col: any, i: number) => (
                <div key={i} className={`rounded-2xl p-6 ${col.winner ? 'bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border-2 border-indigo-500' : 'bg-white/5 border border-white/10'}`}>
                  <h3 className={`text-xl font-semibold mb-4 ${col.winner ? 'text-indigo-400' : 'text-gray-300'}`}>{col.title}</h3>
                  <ul className="space-y-2">
                    {col.items.map((item: string, j: number) => (
                      <li key={j} className="text-gray-400 text-sm">• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-l-4 border-indigo-500 p-6 rounded-r-xl">
              <p className="text-2xl font-semibold text-white text-center">{c.highlight}</p>
            </div>
          </div>
        );
        
      case 'two-column':
        return (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-10">{c.title}</h2>
            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-gray-300 mb-4">{c.left.title}</h3>
                <ul className="space-y-2">
                  {c.left.items.map((item: string, i: number) => (
                    <li key={i} className="text-gray-400">• {item}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl p-6 border border-red-500/30">
                <h3 className="text-lg font-semibold text-red-400 mb-4">{c.right.title}</h3>
                <ul className="space-y-2">
                  {c.right.items.map((item: string, i: number) => (
                    <li key={i} className="text-gray-300">• {item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-xl text-gray-300">{c.footer}</p>
          </div>
        );
        
      case 'quote':
        return (
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-4xl md:text-5xl text-gray-400 italic mb-10">{c.quote}</p>
            <p className="text-xl text-gray-300 mb-10">{c.body}</p>
            <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-l-4 border-indigo-500 p-6 rounded-r-xl inline-block">
              <p className="text-2xl font-semibold text-white">{c.highlight}</p>
            </div>
          </div>
        );
      
      case 'tipping-point':
        return (
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-4xl md:text-5xl text-gray-400 italic mb-8">{c.quote}</p>
            
            {/* S-Curve / Tipping Point Visualization */}
            <div className="relative w-full max-w-2xl mx-auto h-64 mb-10">
              {/* Background grid */}
              <div className="absolute inset-0 opacity-20">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="absolute w-full border-t border-white/30" style={{ top: `${i * 25}%` }} />
                ))}
              </div>
              
              {/* The S-curve line */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                    <stop offset="60%" stopColor="#6366f1" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="1" />
                  </linearGradient>
                </defs>
                {/* Slow phase - nearly flat */}
                {/* Tipping point - exponential */}
                <path
                  d="M 0 180 Q 100 175, 200 160 Q 280 140, 320 80 Q 360 20, 400 10"
                  fill="none"
                  stroke="url(#curveGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="animate-pulse"
                  style={{
                    strokeDasharray: 600,
                    strokeDashoffset: 0,
                    animation: 'drawLine 3s ease-in-out infinite',
                  }}
                />
                {/* Tipping point marker */}
                <circle cx="280" cy="130" r="8" fill="#a855f7" className="animate-ping" style={{ animationDuration: '2s' }} />
                <circle cx="280" cy="130" r="6" fill="#a855f7" />
              </svg>
              
              {/* Labels */}
              <div className="absolute bottom-0 left-0 text-xs text-gray-500">Slow build</div>
              <div className="absolute bottom-0 right-0 text-xs text-gray-500">Explosion</div>
              <div className="absolute top-1/3 right-1/4 transform translate-x-4">
                <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg px-3 py-1">
                  <span className="text-sm text-purple-400 font-semibold">Tipping Point</span>
                </div>
              </div>
              
              {/* Timeline labels */}
              <div className="absolute -bottom-8 left-0 right-0 flex justify-between text-xs text-gray-600">
                <span>2020</span>
                <span>2022</span>
                <span>2024</span>
                <span className="text-indigo-400 font-bold">NOW</span>
              </div>
              
              <style jsx>{`
                @keyframes drawLine {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.7; }
                }
              `}</style>
            </div>
            
            <p className="text-xl text-gray-300 mb-8 mt-12">{c.body}</p>
            
            {/* AI convergence visual */}
            <div className="flex justify-center items-center gap-4 mb-10 flex-wrap">
              <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-gray-400">LLMs</div>
              <div className="text-gray-600">+</div>
              <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-gray-400">APIs</div>
              <div className="text-gray-600">+</div>
              <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-gray-400">Data</div>
              <div className="text-gray-600">+</div>
              <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-gray-400">UX</div>
              <div className="text-2xl text-indigo-400 mx-2">=</div>
              <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/50 rounded-lg px-4 py-2 text-sm text-indigo-400 font-semibold">Maven</div>
            </div>
            
            <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-l-4 border-indigo-500 p-6 rounded-r-xl inline-block">
              <p className="text-2xl font-semibold text-white">{c.highlight}</p>
            </div>
          </div>
        );
        
      case 'three-boxes':
        return (
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{c.title}</h2>
            <p className="text-xl text-gray-300 mb-10">{c.intro}</p>
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {c.boxes.map((box: any, i: number) => (
                <div key={i} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold mb-4">{i + 1}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{box.title}</h3>
                  <p className="text-gray-400">{box.body}</p>
                </div>
              ))}
            </div>
            <p className="text-lg text-gray-400">{c.footer}</p>
          </div>
        );
        
      case 'phases':
        return (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-10">{c.title}</h2>
            <div className="space-y-6 mb-10">
              {c.phases.map((phase: any, i: number) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {phase.num}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">{phase.title}</h3>
                    <p className="text-gray-400">{phase.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-lg text-gray-300">{c.footer}</p>
          </div>
        );
        
      case 'finale':
        return (
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-10">{c.title}</h2>
            <div className="space-y-4 mb-10">
              {c.lines.map((line: string, i: number) => (
                <p key={i} className={`text-xl ${line === '' ? 'h-4' : i < 2 ? 'text-gray-400' : 'text-gray-300'}`}>
                  {line}
                </p>
              ))}
            </div>
            <div className="inline-block bg-gradient-to-r from-indigo-500 to-purple-500 px-10 py-5 rounded-2xl">
              <p className="text-3xl font-bold text-white">{c.highlight}</p>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] text-white overflow-hidden">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-white/10 z-50">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>
      
      {/* Slide content */}
      <div 
        className="min-h-screen flex items-center justify-center px-6 py-20 cursor-pointer"
        onClick={nextSlide}
      >
        {renderSlide()}
      </div>
      
      {/* Navigation */}
      <div className="fixed bottom-6 left-0 right-0 flex items-center justify-center gap-4 z-50">
        <button
          onClick={(e) => { e.stopPropagation(); prevSlide(); }}
          disabled={currentSlide === 0}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrentSlide(i); }}
              className={`w-2 h-2 rounded-full transition ${i === currentSlide ? 'bg-indigo-500 w-6' : 'bg-white/30 hover:bg-white/50'}`}
            />
          ))}
        </div>
        
        <button
          onClick={(e) => { e.stopPropagation(); nextSlide(); }}
          disabled={currentSlide === slides.length - 1}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Slide counter */}
      <div className="fixed top-4 right-4 text-sm text-gray-500 z-50">
        {currentSlide + 1} / {slides.length}
      </div>
      
      {/* Keyboard hint */}
      <div className="fixed bottom-20 left-0 right-0 text-center text-xs text-gray-600">
        Click or press → to continue
      </div>
    </div>
  );
}

export default function VisionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white animate-pulse">
          M
        </div>
      </div>
    }>
      <VisionContent />
    </Suspense>
  );
}
