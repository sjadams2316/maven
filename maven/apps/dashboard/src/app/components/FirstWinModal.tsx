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
          {/* Header - MONEY FOUND, not warning */}
          <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border-b border-emerald-500/20 px-6 py-5">
            <div className="flex items-center gap-4">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 flex items-center justify-center border border-emerald-500/30"
              >
                <span className="text-3xl">💰</span>
              </motion.div>
              <div>
                <motion.h2 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-white"
                >
                  We found <span className="text-emerald-400">$4,185</span>
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-emerald-400/80 text-sm"
                >
                  Hidden in this sample portfolio
                </motion.p>
              </div>
            </div>
          </div>
          
          {/* The breakdown */}
          <div className="p-6">
            {/* Money breakdown - the hook */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-black/30 rounded-xl p-4 mb-6"
            >
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-emerald-400">$3,700</div>
                  <div className="text-xs text-gray-500 mt-1">Tax Savings</div>
                  <div className="text-[10px] text-gray-600">from loss harvesting</div>
                </div>
                <div className="border-x border-white/10">
                  <div className="text-2xl font-bold text-blue-400">$485</div>
                  <div className="text-xs text-gray-500 mt-1">Fee Reduction</div>
                  <div className="text-[10px] text-gray-600">per year</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">3</div>
                  <div className="text-xs text-gray-500 mt-1">Insights</div>
                  <div className="text-[10px] text-gray-600">need attention</div>
                </div>
              </div>
            </motion.div>
            
            {/* How we found it */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="space-y-3 mb-6"
            >
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 mt-0.5">💰</span>
                <p className="text-gray-300 text-sm">
                  <strong className="text-emerald-400">ARKK is down 63%</strong> — perfect for tax-loss harvesting. 
                  Swap to similar fund, keep exposure, pocket the tax savings.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 mt-0.5">💵</span>
                <p className="text-gray-300 text-sm">
                  <strong className="text-blue-400">QQQ → QQQM</strong> — same holdings, 0.05% lower fees. 
                  Small change, $485/year saved.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-400 mt-0.5">🔮</span>
                <p className="text-gray-300 text-sm">
                  <strong className="text-purple-400">X-Ray vision</strong> — you own Apple in 4 different funds 
                  (7.2% total exposure). Maven sees what you can't.
                </p>
              </div>
            </motion.div>
            
            {/* Maven difference */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-r from-indigo-950/50 to-purple-950/50 border border-indigo-500/20 rounded-xl p-4 mb-6"
            >
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="text-indigo-400 font-semibold">This is what Maven does.</span> We scan your 
                actual holdings across all accounts and find money you didn't know you were leaving on the table.
              </p>
            </motion.div>
            
            {/* CTA */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onClick={onContinue}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-semibold rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              Show Me Everything
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.button>
            
            <p className="text-center text-gray-500 text-xs mt-3">
              Demo portfolio • Connect your accounts to see your own opportunities
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
