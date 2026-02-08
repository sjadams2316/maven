'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface FirstWinModalProps {
  isOpen: boolean;
  onContinue: () => void;
}

export default function FirstWinModal({ isOpen, onContinue }: FirstWinModalProps) {
  const router = useRouter();
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-white/10 max-w-lg w-full overflow-hidden shadow-2xl"
        >
          {/* Header with alert styling */}
          <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border-b border-orange-500/20 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <span className="text-xl">⚠️</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Maven Found Something</h2>
                <p className="text-orange-400 text-sm">In this demo portfolio</p>
              </div>
            </div>
          </div>
          
          {/* The insight */}
          <div className="p-6">
            <div className="bg-orange-950/30 border border-orange-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="text-3xl">📊</div>
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    42% Tech Concentration Detected
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    This portfolio has <span className="text-orange-400 font-medium">42% exposure to technology stocks</span> — 
                    higher than 90% of diversified portfolios. If tech corrects 30%, 
                    this portfolio could drop <span className="text-red-400 font-medium">12.6%</span> from that sector alone.
                  </p>
                </div>
              </div>
            </div>
            
            {/* What this means */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 mt-1">✓</span>
                <p className="text-gray-300 text-sm">
                  <strong>Good news:</strong> The portfolio has strong growth potential
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-orange-400 mt-1">!</span>
                <p className="text-gray-300 text-sm">
                  <strong>Consider:</strong> More diversification could reduce volatility without sacrificing returns
                </p>
              </div>
            </div>
            
            {/* Maven difference */}
            <div className="bg-white/5 rounded-xl p-4 mb-6">
              <p className="text-gray-400 text-xs leading-relaxed">
                <span className="text-indigo-400 font-medium">This is what Maven does.</span> We analyze your actual holdings 
                across all accounts and surface insights you didn't know you needed. No guesswork. No generic advice.
              </p>
            </div>
            
            {/* CTA */}
            <button
              onClick={onContinue}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              Explore the Full Dashboard
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            
            <p className="text-center text-gray-500 text-xs mt-3">
              Sample portfolio • Your data will show your own insights
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
