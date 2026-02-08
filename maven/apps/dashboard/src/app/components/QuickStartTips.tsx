'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

/**
 * Quick start tips for new users
 * Shows on first few visits to help users get oriented
 */

interface Tip {
  id: string;
  emoji: string;
  title: string;
  description: string;
  action: { label: string; href: string };
}

const TIPS: Tip[] = [
  {
    id: 'oracle',
    emoji: '🔮',
    title: 'Meet Maven Oracle',
    description: 'Your AI wealth partner. Ask anything about investing, taxes, or your portfolio.',
    action: { label: 'Open Oracle', href: '/oracle' },
  },
  {
    id: 'thesis',
    emoji: '📊',
    title: 'Understand Our Thesis',
    description: 'Not just math — see WHY we recommend what we recommend with honest uncertainty.',
    action: { label: 'View Thesis', href: '/investment-thesis' },
  },
  {
    id: 'portfolio-lab',
    emoji: '🔬',
    title: 'Analyze Your Portfolio',
    description: 'Run stress tests, optimize allocation, and see hidden risks in your holdings.',
    action: { label: 'Open Portfolio Lab', href: '/portfolio-lab' },
  },
  {
    id: 'fragility',
    emoji: '🌡️',
    title: 'Check Market Health',
    description: 'Our Fragility Index monitors 40+ indicators to gauge market vulnerability.',
    action: { label: 'View Fragility Index', href: '/fragility' },
  },
  {
    id: 'shortcuts',
    emoji: '⌨️',
    title: 'Power User Shortcuts',
    description: 'Press ⌘K to open Oracle, ⌘/ for all shortcuts. Navigate fast with G + key.',
    action: { label: 'Learn More', href: '#' },
  },
];

const TIPS_STORAGE_KEY = 'maven_tips_dismissed';
const TIPS_SHOWN_COUNT_KEY = 'maven_tips_shown_count';
const MAX_SHOW_COUNT = 5; // Show tips carousel for first 5 page views

export function QuickStartTips() {
  const [currentTip, setCurrentTip] = useState(0);
  const [dismissed, setDismissed] = useState(true);
  const [showCount, setShowCount] = useState(0);

  useEffect(() => {
    const dismissedTips = localStorage.getItem(TIPS_STORAGE_KEY);
    const count = parseInt(localStorage.getItem(TIPS_SHOWN_COUNT_KEY) || '0', 10);
    
    if (dismissedTips === 'all') {
      setDismissed(true);
    } else if (count < MAX_SHOW_COUNT) {
      setDismissed(false);
      setShowCount(count + 1);
      localStorage.setItem(TIPS_SHOWN_COUNT_KEY, String(count + 1));
    }
  }, []);

  const dismissAll = () => {
    setDismissed(true);
    localStorage.setItem(TIPS_STORAGE_KEY, 'all');
  };

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % TIPS.length);
  };

  const prevTip = () => {
    setCurrentTip((prev) => (prev - 1 + TIPS.length) % TIPS.length);
  };

  if (dismissed) return null;

  const tip = TIPS[currentTip];

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-40 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-gradient-to-br from-indigo-900/95 to-purple-900/95 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-4 shadow-2xl shadow-indigo-500/20">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{tip.emoji}</span>
            <span className="text-xs text-indigo-300 font-medium">Quick Tip {currentTip + 1}/{TIPS.length}</span>
          </div>
          <button
            onClick={dismissAll}
            className="text-indigo-300 hover:text-white transition p-1"
            title="Dismiss all tips"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <h3 className="text-white font-semibold mb-1">{tip.title}</h3>
        <p className="text-indigo-200 text-sm mb-3">{tip.description}</p>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <button
              onClick={prevTip}
              className="p-1.5 hover:bg-white/10 rounded-lg transition"
              aria-label="Previous tip"
            >
              <svg className="w-4 h-4 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextTip}
              className="p-1.5 hover:bg-white/10 rounded-lg transition"
              aria-label="Next tip"
            >
              <svg className="w-4 h-4 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {tip.action.href !== '#' ? (
            <Link
              href={tip.action.href}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm rounded-lg transition"
            >
              {tip.action.label} →
            </Link>
          ) : (
            <button
              onClick={() => {
                // Trigger keyboard shortcuts modal (dispatch custom event)
                window.dispatchEvent(new KeyboardEvent('keydown', { key: '/', metaKey: true }));
              }}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm rounded-lg transition"
            >
              {tip.action.label}
            </button>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1 mt-3">
          {TIPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentTip(i)}
              className={`w-1.5 h-1.5 rounded-full transition ${
                i === currentTip ? 'bg-white' : 'bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to tip ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
