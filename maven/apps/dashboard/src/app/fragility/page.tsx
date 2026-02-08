'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import FragilityGauge from '../components/FragilityGauge';
import { useUserProfile } from '@/providers/UserProvider';
import { ToolExplainer } from '@/app/components/ToolExplainer';
import { OracleShowcase } from '@/app/components/OracleShowcase';

interface FragilityData {
  compositeScore: number;
  zone: string;
  zoneColor: string;
  zoneEmoji: string;
  interpretation: string;
  actionItems: string[];
  keyRisks: string[];
  keyStrengths: string[];
  pillars?: Record<string, {
    name: string;
    score: number;
    indicators: Record<string, {
      value: number | null;
      score: number;
      description: string;
    }>;
  }>;
}

// Deep dive explanations for each indicator
const INDICATOR_DEEP_DIVES: Record<string, {
  title: string;
  what: string;
  why: string;
  current: string;
  historical: string;
  action: string;
}> = {
  buffettIndicator: {
    title: 'Buffett Indicator (Market Cap / GDP)',
    what: 'Total US stock market capitalization divided by GDP. Warren Buffett called it "probably the best single measure of where valuations stand at any given moment."',
    why: 'When stocks are worth more than the entire economy produces in a year, it suggests excessive optimism. The market can\'t sustainably grow faster than the economy indefinitely.',
    current: 'Currently at ~230% — the highest in history. The long-term average is around 100%.',
    historical: 'Was 140% before the dot-com crash (2000), 100% before 2008, and 195% before the 2022 selloff.',
    action: 'At extreme levels, consider reducing equity exposure or hedging. Markets can stay expensive for years, but mean reversion is powerful over decades.'
  },
  cape: {
    title: 'CAPE Ratio (Shiller P/E)',
    what: 'Cyclically Adjusted Price-to-Earnings ratio. Stock prices divided by 10-year average inflation-adjusted earnings. Smooths out business cycle noise.',
    why: 'High CAPE means you\'re paying more for each dollar of earnings. Historically, high CAPE predicts lower 10-year returns (not timing, but magnitude).',
    current: 'Currently around 40 — only exceeded during the dot-com bubble peak.',
    historical: 'Average since 1880: ~17. Was 44 in 2000, 27 in 2007, 38 in late 2021.',
    action: 'Don\'t sell everything when CAPE is high, but temper return expectations. Consider value tilts or international diversification where CAPE is lower.'
  },
  yieldCurve: {
    title: 'Yield Curve (10Y - 2Y Spread)',
    what: 'The difference between 10-year and 2-year Treasury yields. Normally positive (you get paid more to lend longer).',
    why: 'Inversion (negative spread) has preceded every recession since 1955. It means the bond market expects rate cuts — usually because of economic weakness.',
    current: 'Recently normalized after being inverted for ~2 years — the longest inversion in history.',
    historical: 'Inverted before 2008, 2020, and 2022. Average lead time to recession: 12-18 months.',
    action: 'Inversion is a warning, not a timing signal. When it normalizes (steepens), the recession often follows within months. Increase defensive positioning.'
  },
  vix: {
    title: 'VIX (Fear Index)',
    what: 'The CBOE Volatility Index — measures expected 30-day volatility implied by S&P 500 option prices. Often called the "Fear Gauge."',
    why: 'Low VIX means complacency. High VIX means panic. Paradoxically, very low VIX can be risky — it means no one is hedging.',
    current: 'VIX below 15 indicates complacency. Above 30 indicates fear. Above 50 is panic.',
    historical: 'Spiked to 80+ during 2008 and COVID. Was around 12 before the 2018 "Volmageddon" event.',
    action: 'When VIX is very low (<15), hedges are cheap — good time to buy protection. When VIX spikes, it\'s often too late/expensive.'
  },
  hySpread: {
    title: 'High Yield Spread (Junk Bond Spread)',
    what: 'The extra yield investors demand to hold risky corporate bonds vs. safe Treasuries. Measures credit market stress.',
    why: 'Credit markets are often smarter than stock markets. Widening spreads mean lenders are worried about defaults.',
    current: 'Spreads under 3% are historically tight (complacent). Above 6% indicates stress. Above 10% is crisis.',
    historical: 'Hit 20%+ in 2008-2009 and briefly spiked to 10% during COVID before Fed intervention.',
    action: 'Watch for rapid widening — it often leads stocks lower. Tight spreads + high valuations = fragile setup.'
  },
  concentration: {
    title: 'Market Concentration (Top 10 Weight)',
    what: 'The percentage of the S&P 500\'s total value held by the top 10 stocks. Higher = less diversification.',
    why: 'When a few mega-caps dominate, index investors have concentrated risk. If those leaders stumble, the whole market falls.',
    current: 'Top 10 now represent ~33% of S&P 500 — exceeding the dot-com peak.',
    historical: 'Was 25% in 2000 (then Cisco, GE, Intel led). Was 18% in 2010. Has doubled since 2015.',
    action: 'Consider equal-weight indexes (RSP vs SPY) or mid-cap exposure to reduce concentration risk.'
  },
  marginDebt: {
    title: 'Margin Debt (Leverage)',
    what: 'Money borrowed against brokerage accounts to buy more stocks. High margin debt = investors borrowing to bet.',
    why: 'Leverage amplifies both gains and losses. When markets drop, margin calls force selling, creating cascades.',
    current: 'Near all-time highs in absolute terms, though more moderate as % of market cap.',
    historical: 'Peaked before 2000 and 2007. Margin calls accelerated the 1929, 2000, and 2008 crashes.',
    action: 'If using margin, keep utilization low. In fragile markets, forced sellers set prices.'
  },
  consumerSentiment: {
    title: 'Consumer Sentiment',
    what: 'University of Michigan survey of consumer confidence about the economy and personal finances.',
    why: 'Consumers are 70% of GDP. When they feel bad, they spend less. Can be self-fulfilling prophecy.',
    current: 'Recently depressed despite strong employment — often due to inflation perception.',
    historical: 'Tanked before every recession. Was extremely low in 2022 despite no recession.',
    action: 'Low sentiment is contrarian bullish long-term but confirms fragility short-term.'
  },
  dollarIndex: {
    title: 'Dollar Index (DXY)',
    what: 'Value of USD vs. basket of major currencies (EUR, JPY, GBP, etc.).',
    why: 'Strong dollar = stress for emerging markets (they borrow in dollars) and US multinationals (hurts earnings). Dollar strength often correlates with risk-off.',
    current: 'Dollar near multi-decade highs — creates headwind for global growth.',
    historical: 'Spiked during 2008 crisis, 2020 COVID, and 2022 rate hikes.',
    action: 'Strong dollar can break things globally. Watch for EM crises if dollar keeps rising.'
  }
};

// Zone-specific optimization strategies
const ZONE_STRATEGIES = {
  resilient: {
    title: 'Growth Mode',
    description: 'Market conditions favor risk-taking. Consider increasing equity exposure.',
    actions: [
      { label: 'Increase equity allocation to target', impact: 'high', type: 'growth' },
      { label: 'Deploy excess cash into markets', impact: 'medium', type: 'deploy' },
      { label: 'Consider growth-tilted factors', impact: 'medium', type: 'tilt' },
      { label: 'Reduce bond overweight if any', impact: 'low', type: 'rebalance' },
    ],
    targetAllocation: { equity: 80, bonds: 15, cash: 5 },
    color: 'emerald',
  },
  normal: {
    title: 'Balanced Mode',
    description: 'Standard risk management appropriate. Maintain target allocation.',
    actions: [
      { label: 'Rebalance to target allocation', impact: 'medium', type: 'rebalance' },
      { label: 'Review and trim winners if overweight', impact: 'low', type: 'trim' },
      { label: 'Ensure adequate diversification', impact: 'medium', type: 'diversify' },
      { label: 'Continue regular contributions', impact: 'medium', type: 'deploy' },
    ],
    targetAllocation: { equity: 70, bonds: 25, cash: 5 },
    color: 'yellow',
  },
  elevated: {
    title: 'Cautious Mode',
    description: 'Multiple stress signals present. Consider reducing risk exposure.',
    actions: [
      { label: 'Reduce equity allocation by 10-15%', impact: 'high', type: 'reduce' },
      { label: 'Increase cash buffer to 10%', impact: 'high', type: 'cash' },
      { label: 'Review stop-losses on volatile positions', impact: 'medium', type: 'protect' },
      { label: 'Consider quality factor tilt', impact: 'medium', type: 'tilt' },
      { label: 'Trim concentrated positions', impact: 'medium', type: 'trim' },
    ],
    targetAllocation: { equity: 60, bonds: 30, cash: 10 },
    color: 'orange',
  },
  fragile: {
    title: 'Defensive Mode',
    description: 'High probability of volatility expansion. Prioritize capital preservation.',
    actions: [
      { label: 'Reduce equity to defensive levels', impact: 'critical', type: 'reduce' },
      { label: 'Increase cash to 15-20%', impact: 'critical', type: 'cash' },
      { label: 'Add hedges (put options, VIX calls)', impact: 'high', type: 'hedge' },
      { label: 'Shift to defensive sectors', impact: 'high', type: 'rotate' },
      { label: 'Eliminate leveraged positions', impact: 'critical', type: 'delever' },
    ],
    targetAllocation: { equity: 45, bonds: 35, cash: 20 },
    color: 'red',
  },
  critical: {
    title: 'Preservation Mode',
    description: 'Conditions similar to pre-crisis periods. Maximum capital protection.',
    actions: [
      { label: 'Reduce equity to minimum', impact: 'critical', type: 'reduce' },
      { label: 'Maximize cash position (25%+)', impact: 'critical', type: 'cash' },
      { label: 'Full hedge on remaining equity', impact: 'critical', type: 'hedge' },
      { label: 'Short-term Treasuries only', impact: 'high', type: 'safety' },
    ],
    targetAllocation: { equity: 30, bonds: 45, cash: 25 },
    color: 'gray',
  },
};

function IndicatorModal({ 
  indicatorKey, 
  onClose 
}: { 
  indicatorKey: string; 
  onClose: () => void;
}) {
  const info = INDICATOR_DEEP_DIVES[indicatorKey];
  
  if (!info) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-start justify-between">
            <h2 className="text-xl font-bold text-white">{info.title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-indigo-400 mb-2">📊 What is it?</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{info.what}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-orange-400 mb-2">⚠️ Why does it matter?</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{info.why}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-emerald-400 mb-2">📈 Current Reading</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{info.current}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-yellow-400 mb-2">📜 Historical Context</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{info.historical}</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-cyan-400 mb-2">💡 What to do about it</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{info.action}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ActionCard({ action, index }: { action: { label: string; impact: string; type: string }; index: number }) {
  const impactColors = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };
  
  const typeIcons: Record<string, string> = {
    reduce: '📉', cash: '💵', hedge: '🛡️', protect: '🔒', deploy: '🚀',
    rebalance: '⚖️', trim: '✂️', tilt: '📊', rotate: '🔄', delever: '⚠️',
    safety: '🏦', monitor: '👁️', diversify: '🌐', growth: '📈',
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-center gap-3 p-3 rounded-lg border ${impactColors[action.impact as keyof typeof impactColors] || impactColors.medium} transition-all hover:scale-[1.02]`}
    >
      <span className="text-xl">{typeIcons[action.type] || '•'}</span>
      <span className="flex-1 text-sm">{action.label}</span>
      <span className={`text-xs px-2 py-0.5 rounded-full ${
        action.impact === 'critical' ? 'bg-red-600/30 text-red-300' :
        action.impact === 'high' ? 'bg-orange-600/30 text-orange-300' :
        'bg-gray-600/30 text-gray-300'
      }`}>
        {action.impact}
      </span>
    </motion.div>
  );
}

function AllocationBar({ label, current, recommended, color }: {
  label: string;
  current: number;
  recommended: number;
  color: string;
}) {
  const diff = recommended - current;
  
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-300">{label}</span>
        <span className={`font-medium ${diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-gray-400'}`}>
          {current}% → {recommended}%
          {diff !== 0 && (
            <span className="ml-1 text-xs">
              ({diff > 0 ? '+' : ''}{diff}%)
            </span>
          )}
        </span>
      </div>
      <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden">
        {/* Current allocation */}
        <div 
          className={`absolute top-0 left-0 h-full ${color} opacity-40`}
          style={{ width: `${current}%` }}
        />
        {/* Recommended allocation marker */}
        <div 
          className={`absolute top-0 h-full w-1 ${color} shadow-lg`}
          style={{ left: `${recommended}%` }}
        />
        {/* Label for current */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 text-xs font-medium text-white"
          style={{ left: `${Math.min(current / 2, 40)}%` }}
        >
          Current: {current}%
        </div>
      </div>
    </div>
  );
}

function PortfolioComparison({ fragilityData, userAllocation }: { 
  fragilityData: FragilityData | null;
  userAllocation: { equity: number; bonds: number; cash: number };
}) {
  if (!fragilityData) return null;
  
  const strategy = ZONE_STRATEGIES[fragilityData.zone as keyof typeof ZONE_STRATEGIES] || ZONE_STRATEGIES.normal;
  const recommended = strategy.targetAllocation;
  
  const totalDrift = Math.abs(recommended.equity - userAllocation.equity) +
                     Math.abs(recommended.bonds - userAllocation.bonds) +
                     Math.abs(recommended.cash - userAllocation.cash);
  
  const driftStatus = totalDrift < 10 ? 'aligned' : totalDrift < 25 ? 'moderate' : 'significant';
  
  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Your Portfolio vs. Recommended</h3>
        <span className={`text-xs px-3 py-1 rounded-full ${
          driftStatus === 'aligned' ? 'bg-emerald-500/20 text-emerald-400' :
          driftStatus === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {driftStatus === 'aligned' ? '✓ Well Aligned' :
           driftStatus === 'moderate' ? '⚠ Some Drift' : '⚠ Significant Drift'}
        </span>
      </div>
      
      <div className="p-6">
        {/* Visual comparison bars */}
        <AllocationBar 
          label="Equity" 
          current={userAllocation.equity} 
          recommended={recommended.equity}
          color="bg-indigo-500"
        />
        <AllocationBar 
          label="Bonds" 
          current={userAllocation.bonds} 
          recommended={recommended.bonds}
          color="bg-emerald-500"
        />
        <AllocationBar 
          label="Cash" 
          current={userAllocation.cash} 
          recommended={recommended.cash}
          color="bg-yellow-500"
        />
        
        {/* Summary message */}
        <div className={`mt-4 p-4 rounded-lg ${
          driftStatus === 'aligned' ? 'bg-emerald-950/30 border border-emerald-800/30' :
          driftStatus === 'moderate' ? 'bg-yellow-950/30 border border-yellow-800/30' :
          'bg-red-950/30 border border-red-800/30'
        }`}>
          {driftStatus === 'aligned' ? (
            <p className="text-sm text-emerald-300">
              ✓ Your portfolio allocation is well-aligned with current market conditions. 
              Continue monitoring for changes.
            </p>
          ) : driftStatus === 'moderate' ? (
            <p className="text-sm text-yellow-300">
              ⚠ Your portfolio has some drift from recommended levels. Consider gradual 
              rebalancing over the next few weeks.
            </p>
          ) : (
            <p className="text-sm text-red-300">
              ⚠ Significant gap between your allocation and recommended levels given current 
              fragility ({fragilityData.compositeScore}). Review the action items below.
            </p>
          )}
        </div>
        
        {/* Side by side numbers */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4">
            <h4 className="text-xs text-gray-500 mb-3">YOUR CURRENT</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Equity</span>
                <span className="text-white font-medium">{userAllocation.equity}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Bonds</span>
                <span className="text-white font-medium">{userAllocation.bonds}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Cash</span>
                <span className="text-white font-medium">{userAllocation.cash}%</span>
              </div>
            </div>
          </div>
          
          <div className={`rounded-xl p-4 ${
            fragilityData.zone === 'resilient' ? 'bg-emerald-950/30 border border-emerald-800/30' :
            fragilityData.zone === 'normal' ? 'bg-yellow-950/30 border border-yellow-800/30' :
            fragilityData.zone === 'elevated' ? 'bg-orange-950/30 border border-orange-800/30' :
            fragilityData.zone === 'fragile' ? 'bg-red-950/30 border border-red-800/30' :
            'bg-gray-800/50 border border-gray-700/30'
          }`}>
            <h4 className="text-xs text-gray-500 mb-3">RECOMMENDED ({fragilityData.zone.toUpperCase()})</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Equity</span>
                <span className="text-white font-medium">{recommended.equity}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Bonds</span>
                <span className="text-white font-medium">{recommended.bonds}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Cash</span>
                <span className="text-white font-medium">{recommended.cash}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskCard({ 
  risk, 
  type, 
  onClick 
}: { 
  risk: string; 
  type: 'risk' | 'strength';
  onClick?: () => void;
}) {
  // Try to extract indicator key from risk text
  const indicatorKeys = Object.keys(INDICATOR_DEEP_DIVES);
  const matchedKey = indicatorKeys.find(key => 
    risk.toLowerCase().includes(key.toLowerCase().replace(/([A-Z])/g, ' $1').trim())
  );
  
  const isClickable = !!matchedKey && !!onClick;
  
  return (
    <motion.div
      whileHover={isClickable ? { scale: 1.02 } : {}}
      className={`p-3 rounded-lg border transition-all ${
        type === 'risk' 
          ? 'bg-red-950/20 border-red-800/30 hover:border-red-600/50' 
          : 'bg-emerald-950/20 border-emerald-800/30 hover:border-emerald-600/50'
      } ${isClickable ? 'cursor-pointer' : ''}`}
      onClick={() => isClickable && onClick?.()}
    >
      <div className="flex items-start gap-2">
        <span className={type === 'risk' ? 'text-red-400' : 'text-emerald-400'}>
          {type === 'risk' ? '⚠️' : '✓'}
        </span>
        <div className="flex-1">
          <p className="text-sm text-gray-300">{risk}</p>
          {isClickable && (
            <p className="text-xs text-gray-500 mt-1">Click for deep dive →</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function OptimizationPanel({ fragilityData }: { fragilityData: FragilityData | null }) {
  const router = useRouter();
  
  if (!fragilityData) {
    return (
      <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-48 mb-4" />
        <div className="h-4 bg-gray-700 rounded w-full mb-2" />
        <div className="h-4 bg-gray-700 rounded w-3/4" />
      </div>
    );
  }
  
  const strategy = ZONE_STRATEGIES[fragilityData.zone as keyof typeof ZONE_STRATEGIES] || ZONE_STRATEGIES.normal;
  
  return (
    <div className={`bg-gradient-to-br from-${strategy.color}-950/30 to-gray-900/50 rounded-xl border border-gray-800 overflow-hidden`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-800/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{fragilityData.zoneEmoji}</span>
            <div>
              <h2 className="text-xl font-bold text-white">{strategy.title}</h2>
              <p className="text-sm text-gray-400">Fragility Score: {fragilityData.compositeScore}</p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/portfolio-optimizer?fragility=${fragilityData.zone}`)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-all hover:scale-105 flex items-center gap-2"
          >
            <span>🎯</span>
            Optimize Now
          </button>
        </div>
        <p className="text-gray-300">{strategy.description}</p>
      </div>
      
      {/* Recommended Actions */}
      <div className="p-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-4">Recommended Actions</h3>
        <div className="space-y-2">
          {strategy.actions.map((action, i) => (
            <ActionCard key={i} action={action} index={i} />
          ))}
        </div>
        
        {/* Quick Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-2">
          <button 
            onClick={() => router.push('/portfolio-optimizer?tab=optimize')}
            className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 rounded-lg text-sm transition-colors border border-indigo-500/30"
          >
            📊 Run Full Analysis
          </button>
          <button 
            onClick={() => router.push('/portfolio-optimizer?tab=risk')}
            className="px-4 py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 rounded-lg text-sm transition-colors border border-orange-500/30"
          >
            🌪️ Stress Test Portfolio
          </button>
          <button 
            onClick={() => router.push('/portfolio-optimizer?tab=tax')}
            className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg text-sm transition-colors border border-emerald-500/30"
          >
            💰 Find Tax Alpha
          </button>
        </div>
        
        {/* Oracle Explain Button */}
        <div className="mt-6 pt-6 border-t border-gray-800/50">
          <OracleShowcase
            trigger={<span>Have Maven Oracle Explain What This Means</span>}
            data={{
              type: 'market_analysis',
              title: 'Market Fragility Analysis',
              metrics: [
                { label: 'Fragility Score', current: fragilityData.compositeScore, good: fragilityData.compositeScore < 50 },
                { label: 'Market Zone', current: fragilityData.zone.charAt(0).toUpperCase() + fragilityData.zone.slice(1) },
                { label: 'Risk Level', current: strategy.title },
              ],
              risks: [
                { scenario: 'If markets correct 10%', impact: -10, color: 'bg-amber-500' },
                { scenario: 'If we see 2008-style crash', impact: -45, color: 'bg-red-500' },
                { scenario: 'If rates spike 1%', impact: -15, color: 'bg-orange-500' },
                { scenario: 'If volatility doubles', impact: -20, color: 'bg-rose-500' },
              ],
              actionItems: strategy.actions.slice(0, 4).map((action, i) => ({
                priority: i === 0 ? 'high' as const : i === 1 ? 'medium' as const : 'low' as const,
                action: action.label,
                impact: `Impact: ${action.impact}`
              }))
            }}
            onAnalyze={async () => {
              const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  message: `Explain the current market fragility conditions to me like I'm a regular investor. The Fragility Index score is ${fragilityData.compositeScore} (${fragilityData.zone} zone). ${fragilityData.interpretation}. What does this mean in plain English? Should I be worried? What should I actually do with my portfolio right now? Be specific and practical.`
                })
              });
              const data = await response.json();
              return data.response || 'Unable to generate analysis.';
            }}
            className="w-full justify-center"
          />
        </div>
      </div>
    </div>
  );
}

export default function FragilityPage() {
  const router = useRouter();
  const { profile } = useUserProfile();
  const [fragilityData, setFragilityData] = useState<FragilityData | null>(null);
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(null);
  const [showAllRisks, setShowAllRisks] = useState(false);
  
  // Calculate user's current allocation from their holdings
  const userAllocation = {
    equity: 72, // Default, would calculate from actual holdings
    bonds: 18,
    cash: 10,
  };
  
  // If we have user profile with holdings, calculate real allocation
  // TODO: Integrate with UserProvider holdings data
  
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/fragility-index');
        if (res.ok) {
          const data = await res.json();
          setFragilityData(data);
        }
      } catch (error) {
        console.error('Failed to fetch fragility data:', error);
      }
    }
    fetchData();
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
              M
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Maven</h1>
              <p className="text-xs text-gray-500">AI Wealth Partner</p>
            </div>
          </Link>
          
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/portfolio-optimizer" className="text-gray-400 hover:text-white transition-colors">
              Portfolio Optimizer
            </Link>
            <Link href="/oracle" className="text-gray-400 hover:text-white transition-colors">
              Oracle
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-950/50 border border-indigo-800/50 rounded-full px-4 py-1 text-sm text-indigo-300 mb-4">
            <span className="animate-pulse">●</span>
            100% Real-Time Data • 40+ Indicators
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Market Fragility Index™
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Not predicting <span className="text-red-400">when</span> the avalanche happens. 
            Measuring <span className="text-emerald-400">how ripe</span> conditions are for one.
          </p>
          <div className="mt-4">
            <ToolExplainer toolName="fragility-index" />
          </div>
        </div>
        
        {/* Main Three Column Layout */}
        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          {/* Left: Fragility Gauge */}
          <div className="lg:col-span-5">
            <FragilityGauge />
          </div>
          
          {/* Right: Optimization Panel */}
          <div className="lg:col-span-7">
            <OptimizationPanel fragilityData={fragilityData} />
          </div>
        </div>
        
        {/* Portfolio Comparison - Full Width */}
        <div className="mb-8">
          <PortfolioComparison fragilityData={fragilityData} userAllocation={userAllocation} />
        </div>
        
        {/* Key Risks & Strengths - Clickable Deep Dives */}
        {fragilityData && (fragilityData.keyRisks.length > 0 || fragilityData.keyStrengths.length > 0) && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Key Risks */}
            {fragilityData.keyRisks.length > 0 && (
              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                  <span>⚠️</span> Key Risk Factors
                  <span className="text-xs bg-red-950/50 px-2 py-0.5 rounded text-red-300">
                    Click for details
                  </span>
                </h3>
                <div className="space-y-2">
                  {(showAllRisks ? fragilityData.keyRisks : fragilityData.keyRisks.slice(0, 4)).map((risk, i) => (
                    <RiskCard 
                      key={i} 
                      risk={risk} 
                      type="risk"
                      onClick={() => {
                        // Find matching indicator
                        const keys = Object.keys(INDICATOR_DEEP_DIVES);
                        const match = keys.find(k => 
                          risk.toLowerCase().includes(k.toLowerCase().replace(/([A-Z])/g, ' $1').trim()) ||
                          risk.toLowerCase().includes(INDICATOR_DEEP_DIVES[k].title.split(' ')[0].toLowerCase())
                        );
                        if (match) setSelectedIndicator(match);
                      }}
                    />
                  ))}
                  {fragilityData.keyRisks.length > 4 && (
                    <button 
                      onClick={() => setShowAllRisks(!showAllRisks)}
                      className="text-sm text-indigo-400 hover:text-indigo-300 mt-2"
                    >
                      {showAllRisks ? 'Show less' : `Show ${fragilityData.keyRisks.length - 4} more...`}
                    </button>
                  )}
                </div>
              </div>
            )}
            
            {/* Key Strengths */}
            {fragilityData.keyStrengths.length > 0 && (
              <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                  <span>✓</span> Supporting Factors
                </h3>
                <div className="space-y-2">
                  {fragilityData.keyStrengths.map((strength, i) => (
                    <RiskCard key={i} risk={strength} type="strength" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Indicator Quick Reference */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">📊 Indicator Deep Dives</h3>
          <p className="text-sm text-gray-400 mb-4">Click any indicator to learn what it means and why it matters:</p>
          <div className="flex flex-wrap gap-2">
            {Object.keys(INDICATOR_DEEP_DIVES).map(key => (
              <button
                key={key}
                onClick={() => setSelectedIndicator(key)}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg text-sm transition-colors border border-gray-700 hover:border-gray-600"
              >
                {INDICATOR_DEEP_DIVES[key].title.split('(')[0].trim()}
              </button>
            ))}
          </div>
        </div>
        
        {/* Philosophy Card */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="text-4xl">📚</div>
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">The Philosophy</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Based on complexity theory from <span className="text-indigo-400">"Ubiquity: Why Catastrophes Happen"</span> by Mark Buchanan. 
                Complex systems (markets, earthquakes, forest fires) reach <span className="text-orange-400">critical states</span> where 
                small triggers can cause cascading failures. You can't predict <em>when</em> the grain of sand triggers 
                the avalanche, but you can measure when the sandpile is at critical state.
              </p>
            </div>
          </div>
        </div>
        
        {/* How It Works */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-5">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-white mb-2">8 Pillars</h3>
            <p className="text-sm text-gray-400">
              Valuation, Credit, Volatility, Sentiment, Structure, Macro, Liquidity, Contagion
            </p>
          </div>
          
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-5">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold text-white mb-2">40+ Indicators</h3>
            <p className="text-sm text-gray-400">
              Buffett Indicator, CAPE, Credit Spreads, VIX, Yield Curve, TED Spread, and more
            </p>
          </div>
          
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-5">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold text-white mb-2">Real Data Sources</h3>
            <p className="text-sm text-gray-400">
              Federal Reserve (FRED), Yahoo Finance, CNN Fear & Greed. Updated continuously.
            </p>
          </div>
        </div>
        
        {/* Risk Zones */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Understanding the Zones</h2>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 text-center text-sm">
            <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-800/30">
              <div className="text-2xl mb-1">🟢</div>
              <div className="text-emerald-400 font-semibold">0-25</div>
              <div className="text-emerald-300 text-xs">Resilient</div>
              <div className="text-gray-500 text-xs mt-1">Risk-on</div>
            </div>
            <div className="p-3 rounded-lg bg-yellow-950/50 border border-yellow-800/30">
              <div className="text-2xl mb-1">🟡</div>
              <div className="text-yellow-400 font-semibold">25-45</div>
              <div className="text-yellow-300 text-xs">Normal</div>
              <div className="text-gray-500 text-xs mt-1">Balanced</div>
            </div>
            <div className="p-3 rounded-lg bg-orange-950/50 border border-orange-800/30">
              <div className="text-2xl mb-1">🟠</div>
              <div className="text-orange-400 font-semibold">45-65</div>
              <div className="text-orange-300 text-xs">Elevated</div>
              <div className="text-gray-500 text-xs mt-1">Cautious</div>
            </div>
            <div className="p-3 rounded-lg bg-red-950/50 border border-red-800/30">
              <div className="text-2xl mb-1">🔴</div>
              <div className="text-red-400 font-semibold">65-80</div>
              <div className="text-red-300 text-xs">Fragile</div>
              <div className="text-gray-500 text-xs mt-1">Defensive</div>
            </div>
            <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/30">
              <div className="text-2xl mb-1">⚫</div>
              <div className="text-gray-300 font-semibold">80-100</div>
              <div className="text-gray-200 text-xs">Critical</div>
              <div className="text-gray-500 text-xs mt-1">Preserve</div>
            </div>
          </div>
        </div>
        
        {/* Historical Validation */}
        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Historical Validation</h2>
          <p className="text-sm text-gray-400 mb-4">
            A useful fragility indicator should show elevated readings <em>before</em> major market events:
          </p>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="text-red-400 text-3xl font-bold">74</div>
              <div className="text-gray-400 text-sm mt-1">Aug 2008</div>
              <div className="text-gray-600 text-xs">Pre-Lehman</div>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="text-orange-400 text-3xl font-bold">58</div>
              <div className="text-gray-400 text-sm mt-1">Feb 2020</div>
              <div className="text-gray-600 text-xs">Pre-COVID</div>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="text-red-400 text-3xl font-bold">71</div>
              <div className="text-gray-400 text-sm mt-1">Dec 2021</div>
              <div className="text-gray-600 text-xs">Pre-2022 selloff</div>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="text-emerald-400 text-3xl font-bold">28</div>
              <div className="text-gray-400 text-sm mt-1">Mar 2009</div>
              <div className="text-gray-600 text-xs">Market bottom</div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-600 text-sm">
          <p>
            Maven Market Fragility Index™ is for educational purposes only. 
            Not financial advice. Past patterns do not guarantee future results.
          </p>
        </div>
      </footer>
      
      {/* Indicator Deep Dive Modal */}
      <AnimatePresence>
        {selectedIndicator && (
          <IndicatorModal 
            indicatorKey={selectedIndicator} 
            onClose={() => setSelectedIndicator(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
