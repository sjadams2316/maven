'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DemoSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  emoji: string;
  gradient: string;
  mockUI?: React.ReactNode;
}

const DEMO_SLIDES: DemoSlide[] = [
  {
    id: 'problem',
    title: 'The Problem',
    subtitle: 'Your wealth is scattered',
    description: 'Multiple accounts, different brokerages, retirement plans, crypto — it\'s impossible to see the full picture. Traditional tools are built for transactions, not understanding.',
    features: [
      '401(k) at work you never check',
      'IRAs at different brokerages',
      'Brokerage accounts with random holdings',
      'No idea if you\'re on track',
    ],
    emoji: '😰',
    gradient: 'from-red-500/20 to-orange-500/20',
  },
  {
    id: 'solution',
    title: 'Maven\'s Approach',
    subtitle: 'See everything in one place',
    description: 'Enter your accounts once. Maven calculates your true net worth, asset allocation, and shows you what actually matters — without managing your money or selling you anything.',
    features: [
      'Net worth across all accounts',
      'Real asset allocation breakdown',
      'Concentration risk detection',
      'Tax optimization opportunities',
    ],
    emoji: '🎯',
    gradient: 'from-indigo-500/20 to-purple-500/20',
  },
  {
    id: 'dashboard',
    title: 'Your Dashboard',
    subtitle: 'The command center',
    description: 'See your complete financial picture at a glance. Net worth, account breakdown, top holdings, and live market data — all in one view.',
    features: [
      'Net worth with daily changes',
      'Breakdown by account type',
      'Top holdings with real-time prices',
      'Market overview (S&P, BTC, etc.)',
    ],
    emoji: '📊',
    gradient: 'from-emerald-500/20 to-cyan-500/20',
  },
  {
    id: 'oracle',
    title: 'Maven Oracle',
    subtitle: 'AI that knows your situation',
    description: 'Ask anything about your finances. Oracle sees your complete picture and gives personalized, specific answers — not generic advice.',
    features: [
      '"Should I do a Roth conversion?"',
      '"What\'s my tax-loss harvesting opportunity?"',
      '"Am I too concentrated in tech?"',
      '"How much do I need to retire at 55?"',
    ],
    emoji: '🔮',
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  {
    id: 'portfolio-lab',
    title: 'Portfolio Lab',
    subtitle: 'Deep analysis tools',
    description: 'Stress test your portfolio against historical crashes, see projected growth, get optimization recommendations with specific trades.',
    features: [
      'Stress test: 2008, COVID, 2022',
      'Monte Carlo projections',
      'Rebalancing recommendations',
      'Tax-loss harvesting scanner',
    ],
    emoji: '🔬',
    gradient: 'from-cyan-500/20 to-blue-500/20',
  },
  {
    id: 'research',
    title: 'Stock Research',
    subtitle: 'Wall Street data, democratized',
    description: 'Real analyst ratings from 70+ investment banks. Price targets, bull/bear cases, fundamentals — the same data advisors pay thousands for.',
    features: [
      'Analyst consensus (Buy/Hold/Sell)',
      'Price targets from top firms',
      'Maven Score™ (0-100 rating)',
      'Full fundamental analysis',
    ],
    emoji: '📈',
    gradient: 'from-amber-500/20 to-orange-500/20',
  },
  {
    id: 'fragility',
    title: 'Market Fragility Index',
    subtitle: 'Know when to be cautious',
    description: 'Our proprietary indicator measures systemic market stress. Not predicting crashes — measuring when conditions are ripe for volatility.',
    features: [
      '6 pillars: Valuation, Credit, Vol, Sentiment, Structure, Macro',
      'Real-time FRED data integration',
      'Historical context (pre-2008, pre-COVID)',
      'Actionable risk guidance',
    ],
    emoji: '🌡️',
    gradient: 'from-red-500/20 to-purple-500/20',
  },
  {
    id: 'cta',
    title: 'Ready to See Clearly?',
    subtitle: 'Start free in 2 minutes',
    description: 'No credit card required. No assets under management. No selling. Just clarity about your financial life.',
    features: [
      '✓ Free to start',
      '✓ Your data stays yours',
      '✓ No sales pitch, ever',
      '✓ Cancel anytime',
    ],
    emoji: '🚀',
    gradient: 'from-indigo-500/20 to-emerald-500/20',
  },
];

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGetStarted: () => void;
  autoPlay?: boolean;
}

export default function DemoModal({ isOpen, onClose, onGetStarted, autoPlay = false }: DemoModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % DEMO_SLIDES.length);
  }, []);
  
  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + DEMO_SLIDES.length) % DEMO_SLIDES.length);
  }, []);
  
  // Auto-advance slides
  useEffect(() => {
    if (!isPlaying || !isOpen) return;
    
    const timer = setInterval(() => {
      if (currentSlide < DEMO_SLIDES.length - 1) {
        nextSlide();
      } else {
        setIsPlaying(false);
      }
    }, 5000);
    
    return () => clearInterval(timer);
  }, [isPlaying, isOpen, currentSlide, nextSlide]);
  
  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'Escape') onClose();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPlaying, nextSlide, prevSlide, onClose]);
  
  const slide = DEMO_SLIDES[currentSlide];
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${((currentSlide + 1) / DEMO_SLIDES.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Main content */}
            <div className={`relative min-h-[500px] p-8 pt-12 bg-gradient-to-br ${slide.gradient}`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col md:flex-row gap-8"
                >
                  {/* Left: Content */}
                  <div className="flex-1">
                    <div className="text-6xl mb-4">{slide.emoji}</div>
                    <div className="text-sm text-indigo-400 font-medium mb-2">{slide.title}</div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{slide.subtitle}</h2>
                    <p className="text-gray-300 text-lg mb-6 leading-relaxed">{slide.description}</p>
                    
                    <ul className="space-y-3">
                      {slide.features.map((feature, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start gap-3 text-gray-300"
                        >
                          <span className="text-indigo-400 mt-1">
                            {feature.startsWith('✓') ? '' : '→'}
                          </span>
                          <span>{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                    
                    {/* CTA on last slide */}
                    {currentSlide === DEMO_SLIDES.length - 1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8"
                      >
                        <button
                          onClick={onGetStarted}
                          className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold text-lg rounded-xl transition transform hover:scale-105"
                        >
                          Get Started Free →
                        </button>
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Right: Visual (placeholder for screenshots/mockups) */}
                  <div className="flex-1 hidden md:flex items-center justify-center">
                    <div className="w-full aspect-video bg-gray-800/50 rounded-xl border border-gray-700/50 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-5xl mb-2">{slide.emoji}</div>
                        <div className="text-sm">Feature Preview</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center justify-between p-4 bg-gray-950 border-t border-gray-800">
              {/* Slide indicators */}
              <div className="flex items-center gap-2">
                {DEMO_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentSlide
                        ? 'w-6 bg-indigo-500'
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  />
                ))}
              </div>
              
              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
                
                <button
                  onClick={prevSlide}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <span className="text-sm text-gray-500 px-2">
                  {currentSlide + 1} / {DEMO_SLIDES.length}
                </span>
                
                <button
                  onClick={nextSlide}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                
                {currentSlide < DEMO_SLIDES.length - 1 ? (
                  <button
                    onClick={nextSlide}
                    className="ml-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={onGetStarted}
                    className="ml-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Get Started
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
