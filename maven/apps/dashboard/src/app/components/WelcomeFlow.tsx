'use client';

import { useState, useEffect } from 'react';

interface WelcomeFlowProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    id: 'vision',
    title: "What if everyone had a family office?",
    subtitle: "The wealthy have teams of advisors optimizing every dollar. We think AI can give that power to everyone.",
    icon: "💎",
    background: "from-indigo-900 via-purple-900 to-indigo-900",
  },
  {
    id: 'problem',
    title: "The wealth gap isn't just about money",
    subtitle: "It's about access. The ultra-wealthy get personalized tax strategies, portfolio optimization, and 24/7 guidance. Everyone else gets... generic advice and DIY tools.",
    icon: "⚖️",
    background: "from-slate-900 via-gray-900 to-slate-900",
  },
  {
    id: 'maven',
    title: "Meet Maven",
    subtitle: "An AI wealth partner that knows your entire financial picture — your accounts, goals, tax situation, and risk tolerance. Always learning. Always optimizing.",
    icon: "🧠",
    background: "from-purple-900 via-indigo-900 to-purple-900",
  },
  {
    id: 'capabilities',
    title: "What Maven will do for you",
    subtitle: null,
    icon: null,
    background: "from-emerald-900/50 via-teal-900/50 to-emerald-900/50",
    features: [
      { icon: "📊", title: "Portfolio Intelligence", desc: "Institutional-grade analysis for everyone" },
      { icon: "📋", title: "Tax Optimization", desc: "Strategies the wealthy use, automated for you" },
      { icon: "🎯", title: "Goal Planning", desc: "Retirement, college, home — all connected" },
      { icon: "⚡", title: "Real-time Guidance", desc: "Proactive alerts, not reactive panic" },
    ],
  },
  {
    id: 'beta',
    title: "We're just getting started",
    subtitle: "Maven is in early beta. Some features are live, others are coming. What you see today is just the beginning.",
    icon: "🚀",
    background: "from-amber-900/50 via-orange-900/50 to-amber-900/50",
    stats: [
      { label: "Live", value: "Portfolio Builder" },
      { label: "Live", value: "AI Chat" },
      { label: "Coming", value: "Tax Intelligence" },
      { label: "Coming", value: "Account Sync" },
    ],
  },
  {
    id: 'feedback',
    title: "You're not just a user — you're a co-creator",
    subtitle: "We built Maven because we believe everyone deserves world-class financial guidance. But we can't build it without you.",
    icon: "🤝",
    background: "from-pink-900/50 via-purple-900/50 to-pink-900/50",
    cta: true,
  },
];

export default function WelcomeFlow({ onComplete }: WelcomeFlowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const slide = SLIDES[currentSlide];
  const isLastSlide = currentSlide === SLIDES.length - 1;

  const nextSlide = () => {
    if (isLastSlide) {
      handleComplete();
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('maven_welcome_seen', 'true');
    setTimeout(onComplete, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleComplete}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-2xl mx-4 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 bg-gradient-to-br ${slide.background}`}>
        {/* Skip button */}
        <button
          onClick={handleComplete}
          className="absolute top-4 right-4 text-white/50 hover:text-white text-sm transition z-10"
        >
          Skip intro
        </button>

        {/* Content */}
        <div className="p-8 md:p-12 min-h-[400px] flex flex-col">
          {/* Icon */}
          {slide.icon && (
            <div className="text-6xl mb-6 animate-bounce-slow">
              {slide.icon}
            </div>
          )}

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            {slide.title}
          </h2>

          {/* Subtitle */}
          {slide.subtitle && (
            <p className="text-lg text-white/80 mb-6 leading-relaxed">
              {slide.subtitle}
            </p>
          )}

          {/* Features grid (capabilities slide) */}
          {slide.features && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              {slide.features.map((feature, idx) => (
                <div key={idx} className="bg-white/10 rounded-xl p-4">
                  <span className="text-2xl mb-2 block">{feature.icon}</span>
                  <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
                  <p className="text-sm text-white/70">{feature.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* Stats (beta slide) */}
          {slide.stats && (
            <div className="flex flex-wrap gap-3 mb-6">
              {slide.stats.map((stat, idx) => (
                <div 
                  key={idx} 
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    stat.label === 'Live' 
                      ? 'bg-emerald-500/30 text-emerald-300' 
                      : 'bg-amber-500/30 text-amber-300'
                  }`}
                >
                  {stat.label}: {stat.value}
                </div>
              ))}
            </div>
          )}

          {/* CTA (feedback slide) */}
          {slide.cta && (
            <div className="bg-white/10 rounded-xl p-6 mb-6">
              <p className="text-white/90 mb-4">
                <strong>Tell us:</strong> What would make Maven indispensable for you? What keeps you up at night about your finances? What do you wish existed?
              </p>
              <p className="text-sm text-white/70">
                Click below to start using Maven. The chat button is always there — use it to share ideas, ask questions, or just say hi.
              </p>
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            {/* Progress dots */}
            <div className="flex gap-2">
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentSlide 
                      ? 'w-6 bg-white' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              {currentSlide > 0 && (
                <button
                  onClick={prevSlide}
                  className="px-4 py-2 text-white/70 hover:text-white transition"
                >
                  ← Back
                </button>
              )}
              <button
                onClick={nextSlide}
                className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-xl hover:bg-white/90 transition"
              >
                {isLastSlide ? "Let's go! →" : "Next →"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
