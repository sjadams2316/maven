'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Global keyboard shortcuts for power users
 * 
 * Shortcuts:
 * - Cmd/Ctrl + K: Open Oracle (command palette)
 * - Cmd/Ctrl + /: Show shortcuts modal
 * - G then D: Go to Dashboard
 * - G then P: Go to Portfolio Lab
 * - G then O: Go to Oracle
 * - G then T: Go to Investment Thesis
 * - Escape: Close any modal
 */

interface Shortcut {
  keys: string[];
  description: string;
  action: () => void;
}

export function KeyboardShortcuts() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);
  const [gPressed, setGPressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Cmd/Ctrl + K: Open Oracle
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        router.push('/oracle');
        return;
      }

      // Cmd/Ctrl + /: Show shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setShowHelp(true);
        return;
      }

      // Escape: Close help modal
      if (e.key === 'Escape') {
        setShowHelp(false);
        setGPressed(false);
        return;
      }

      // G prefix for navigation
      if (e.key === 'g' && !gPressed) {
        setGPressed(true);
        setTimeout(() => setGPressed(false), 1500); // Reset after 1.5s
        return;
      }

      // Navigation shortcuts (G + key)
      if (gPressed) {
        switch (e.key) {
          case 'd':
            e.preventDefault();
            router.push('/dashboard');
            break;
          case 'p':
            e.preventDefault();
            router.push('/portfolio-lab');
            break;
          case 'o':
            e.preventDefault();
            router.push('/oracle');
            break;
          case 't':
            e.preventDefault();
            router.push('/investment-thesis');
            break;
          case 'f':
            e.preventDefault();
            router.push('/fragility');
            break;
          case 'm':
            e.preventDefault();
            router.push('/monte-carlo');
            break;
          case 's':
            e.preventDefault();
            router.push('/settings');
            break;
        }
        setGPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, gPressed]);

  // "G pressed" indicator
  const [showGIndicator, setShowGIndicator] = useState(false);
  useEffect(() => {
    if (gPressed) {
      setShowGIndicator(true);
    } else {
      const timer = setTimeout(() => setShowGIndicator(false), 200);
      return () => clearTimeout(timer);
    }
  }, [gPressed]);

  return (
    <>
      {/* G pressed indicator */}
      {showGIndicator && (
        <div className="fixed bottom-4 right-4 z-50 px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg shadow-lg animate-in fade-in zoom-in-95 duration-200">
          <span className="opacity-70">Press:</span>{' '}
          <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-xs">d</kbd> Dashboard{' '}
          <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-xs">p</kbd> Portfolio{' '}
          <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-xs">o</kbd> Oracle
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowHelp(false)}
          />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Keyboard Shortcuts</h2>
              <button
                onClick={() => setShowHelp(false)}
                className="p-1 hover:bg-slate-800 rounded-lg transition"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs text-slate-500 uppercase tracking-wider">Quick Actions</div>
              
              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <span className="text-slate-300">Open Oracle</span>
                <div className="flex gap-1">
                  <kbd className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">⌘</kbd>
                  <kbd className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">K</kbd>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <span className="text-slate-300">Show Shortcuts</span>
                <div className="flex gap-1">
                  <kbd className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">⌘</kbd>
                  <kbd className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">/</kbd>
                </div>
              </div>

              <div className="text-xs text-slate-500 uppercase tracking-wider mt-4">Navigation (press G then...)</div>
              
              {[
                { key: 'D', label: 'Dashboard' },
                { key: 'P', label: 'Portfolio Lab' },
                { key: 'O', label: 'Oracle' },
                { key: 'T', label: 'Investment Thesis' },
                { key: 'F', label: 'Fragility Index' },
                { key: 'M', label: 'Monte Carlo' },
                { key: 'S', label: 'Settings' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between py-1">
                  <span className="text-slate-400 text-sm">{label}</span>
                  <div className="flex gap-1">
                    <kbd className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">G</kbd>
                    <kbd className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">{key}</kbd>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-500 text-center">
              Press <kbd className="px-1 bg-slate-800 rounded">Esc</kbd> to close
            </div>
          </div>
        </div>
      )}
    </>
  );
}
