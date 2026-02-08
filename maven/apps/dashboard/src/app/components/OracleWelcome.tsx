'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OracleWelcomeProps {
  onComplete: () => void;
  userName?: string;
}

/**
 * Epic welcome experience for new users
 * Features:
 * - Cinematic text reveal
 * - Glowing orb animation
 * - Particle effects
 * - "Your life is about to change" energy
 */
export default function OracleWelcome({ onComplete, userName }: OracleWelcomeProps) {
  const [stage, setStage] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  
  // Progress through stages
  useEffect(() => {
    const timings = [2000, 2500, 2500, 3000, 2000]; // Duration for each stage
    
    if (stage < 5) {
      const timer = setTimeout(() => setStage(s => s + 1), timings[stage]);
      return () => clearTimeout(timer);
    } else {
      // Final stage complete
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }
  }, [stage, onComplete]);
  
  // Show skip button after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowSkip(true), 2000);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#050508] flex items-center justify-center overflow-hidden"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/50 via-transparent to-indigo-950/50" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"
        />
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: window.innerHeight + 20,
              opacity: 0 
            }}
            animate={{ 
              y: -20,
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
            className="absolute w-1 h-1 bg-violet-400 rounded-full"
          />
        ))}
      </div>
      
      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-2xl">
        
        {/* The Orb */}
        <motion.div 
          className="mx-auto mb-12 relative"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          {/* Outer glow rings */}
          <motion.div
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 w-40 h-40 mx-auto rounded-full bg-violet-500/20 blur-2xl"
            style={{ left: '50%', transform: 'translateX(-50%)' }}
          />
          <motion.div
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 w-32 h-32 mx-auto rounded-full bg-purple-500/30 blur-xl"
            style={{ left: '50%', top: '10%', transform: 'translateX(-50%)' }}
          />
          
          {/* The main orb */}
          <motion.div 
            animate={{ 
              boxShadow: [
                '0 0 40px rgba(139, 92, 246, 0.5), 0 0 80px rgba(139, 92, 246, 0.3), 0 0 120px rgba(139, 92, 246, 0.2)',
                '0 0 60px rgba(139, 92, 246, 0.7), 0 0 100px rgba(139, 92, 246, 0.4), 0 0 140px rgba(139, 92, 246, 0.3)',
                '0 0 40px rgba(139, 92, 246, 0.5), 0 0 80px rgba(139, 92, 246, 0.3), 0 0 120px rgba(139, 92, 246, 0.2)',
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 flex items-center justify-center"
          >
            <motion.span 
              animate={{ 
                scale: [1, 1.1, 1],
                filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-5xl"
              style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.5))' }}
            >
              🔮
            </motion.span>
          </motion.div>
        </motion.div>
        
        {/* Cinematic text sequence */}
        <div className="h-48 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {stage === 0 && (
              <motion.div
                key="stage0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <p className="text-violet-400 text-lg tracking-widest uppercase">
                  Welcome{userName ? `, ${userName}` : ''}
                </p>
              </motion.div>
            )}
            
            {stage === 1 && (
              <motion.div
                key="stage1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Your money has been{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">
                    waiting
                  </span>
                </h1>
              </motion.div>
            )}
            
            {stage === 2 && (
              <motion.div
                key="stage2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  For someone who{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                    understands
                  </span>
                </h1>
              </motion.div>
            )}
            
            {stage === 3 && (
              <motion.div
                key="stage3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="text-center"
              >
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400">
                    Maven does.
                  </span>
                </h1>
              </motion.div>
            )}
            
            {stage === 4 && (
              <motion.div
                key="stage4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <p className="text-xl text-gray-300 mb-2">
                  AI-powered wealth intelligence
                </p>
                <p className="text-gray-500">
                  Tax savings • Portfolio optimization • Retirement planning
                </p>
              </motion.div>
            )}
            
            {stage >= 5 && (
              <motion.div
                key="stage5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onComplete}
                  className="px-10 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold text-lg rounded-2xl shadow-lg shadow-violet-500/25 transition-all"
                >
                  Show Me What I'm Missing →
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-8">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: stage === i ? 1.3 : 1,
                backgroundColor: stage >= i ? 'rgb(139, 92, 246)' : 'rgb(55, 65, 81)',
              }}
              className="w-2 h-2 rounded-full transition-colors"
            />
          ))}
        </div>
      </div>
      
      {/* Skip button */}
      <AnimatePresence>
        {showSkip && stage < 5 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onComplete}
            className="absolute bottom-8 right-8 text-gray-500 hover:text-gray-300 text-sm transition-colors"
          >
            Skip intro →
          </motion.button>
        )}
      </AnimatePresence>
      
      {/* Maven logo watermark */}
      <div className="absolute bottom-8 left-8 flex items-center gap-2 opacity-30">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
          M
        </div>
        <span className="text-white text-sm font-medium">Maven</span>
      </div>
    </motion.div>
  );
}
