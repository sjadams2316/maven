'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useUserProfile } from '@/providers/UserProvider';
import Header from '../components/Header';
import InfoTooltip from '../components/InfoTooltip';
import {
  MOCK_FUND_DATA,
  MOCK_STOCK_DATA,
  getAggregatedHoldings,
  getAggregateSectorExposure,
  getAggregateGeographicExposure,
  getAggregateFactorExposures,
  TAX_LOSS_HARVESTING_PAIRS,
  MODEL_PORTFOLIOS,
  type MorningstarFundData,
} from '@/lib/mock-morningstar-data';

// Demo portfolio for showcase
const DEMO_PORTFOLIO = [
  { ticker: 'VOO', shares: 150, value: 78500, costBasis: 62000 },
  { ticker: 'QQQ', shares: 80, value: 42000, costBasis: 35000 },
  { ticker: 'VXUS', shares: 200, value: 12400, costBasis: 14200 },
  { ticker: 'BND', shares: 100, value: 7200, costBasis: 8500 },
  { ticker: 'SCHD', shares: 120, value: 10200, costBasis: 8800 },
  { ticker: 'FXAIX', shares: 50, value: 9500, costBasis: 7200 },
  { ticker: 'ARKK', shares: 45, value: 2100, costBasis: 5800 }, // Loss position
];

type TabType = 'overview' | 'holdings' | 'sectors' | 'factors' | 'risk' | 'optimize' | 'tax';

// Enhanced demo tour with multi-step sequences and element targeting
interface DemoStep {
  tab: TabType;
  elementId?: string;
  action: 'spotlight' | 'cursor-move' | 'hover' | 'click' | 'scroll';
  message: string;
  duration: number;
  subMessage?: string;
}

const ENHANCED_DEMO_TOUR: DemoStep[] = [
  // Overview Tab - Multiple steps
  { tab: 'overview', elementId: 'portfolio-stats', action: 'spotlight', message: '📊 Your Portfolio at a Glance', subMessage: '$161K across 7 funds with Morningstar data', duration: 3500 },
  { tab: 'overview', elementId: 'voo-row', action: 'cursor-move', message: '⭐ VOO: 5-Star Fund', subMessage: 'Ultra-low 0.03% expense ratio — best in class', duration: 3500 },
  { tab: 'overview', elementId: 'arkk-row', action: 'hover', message: '📉 ARKK: Down 63%', subMessage: 'But this loss is actually an opportunity...', duration: 3500 },
  { tab: 'overview', elementId: 'insights-recommendations', action: 'spotlight', message: '💡 AI-Powered Insights', subMessage: 'Maven identifies actionable opportunities', duration: 3000 },
  
  // X-Ray Holdings Tab
  { tab: 'holdings', elementId: 'overlap-alert', action: 'spotlight', message: '⚠️ Hidden Concentration Detected!', subMessage: 'Apple appears in 4 different funds', duration: 4000 },
  { tab: 'holdings', elementId: 'aapl-row', action: 'cursor-move', message: '🍎 Apple: 7.2% of Portfolio', subMessage: 'A 10% drop in Apple costs you ~$1,160', duration: 4000 },
  { tab: 'holdings', elementId: 'holdings-table', action: 'scroll', message: '🔍 See Through Your Funds', subMessage: 'Know exactly what stocks you own', duration: 3000 },
  
  // Sectors Tab
  { tab: 'sectors', elementId: 'tech-sector', action: 'spotlight', message: '🖥️ Tech Concentration: 42%', subMessage: 'vs S&P 500 weight of 29% — overweight alert', duration: 4000 },
  { tab: 'sectors', elementId: 'geo-breakdown', action: 'cursor-move', message: '🌍 Geographic Exposure', subMessage: 'Only 8% international — consider diversifying', duration: 3500 },
  
  // Factor Analysis Tab
  { tab: 'factors', elementId: 'factor-bars', action: 'spotlight', message: '📈 Factor Exposures Explained', subMessage: 'Growth tilt from QQQ, quality from VOO', duration: 4000 },
  { tab: 'factors', elementId: 'factor-insights', action: 'hover', message: '⚖️ Balance Your Factors', subMessage: 'Add value exposure to reduce volatility', duration: 3500 },
  
  // Risk Analysis Tab
  { tab: 'risk', elementId: 'stress-tests', action: 'spotlight', message: '🌪️ Historical Stress Tests', subMessage: 'See how you would have performed in past crises', duration: 3500 },
  { tab: 'risk', elementId: 'crash-2008', action: 'cursor-move', message: '💥 2008 Financial Crisis', subMessage: '-48.2% — portfolio loss of ~$78K', duration: 4000 },
  { tab: 'risk', elementId: 'concentration-risk', action: 'hover', message: '🎯 Concentration Risk Analysis', subMessage: 'Top 10 stocks = 38.5% of portfolio', duration: 3500 },
  
  // Optimize Tab
  { tab: 'optimize', elementId: 'model-selector', action: 'spotlight', message: '🎯 Model Portfolio Comparison', subMessage: 'See how you stack up against targets', duration: 3500 },
  { tab: 'optimize', elementId: 'rebalance-trades', action: 'cursor-move', message: '📊 Smart Rebalancing', subMessage: 'Sell overweight US equity, buy international', duration: 4000 },
  { tab: 'optimize', elementId: 'fee-reduction', action: 'hover', message: '💰 Save $485/year in Fees', subMessage: 'Switch QQQ to QQQM — same exposure, lower cost', duration: 4000 },
  
  // Tax Alpha Tab - The Big Finale
  { tab: 'tax', elementId: 'tax-loss-section', action: 'spotlight', message: '💰 Tax-Loss Harvesting', subMessage: 'Turn losses into tax savings', duration: 3500 },
  { tab: 'tax', elementId: 'arkk-harvest', action: 'cursor-move', message: '🎉 ARKK: $3,700 Tax Savings!', subMessage: 'Sell at -63%, swap to SOXQ, keep exposure', duration: 5000 },
  { tab: 'tax', elementId: 'total-tax-alpha', action: 'spotlight', message: '✨ Total Tax Alpha: $3,700', subMessage: 'That\'s real money back in your pocket', duration: 4000 },
];

// Animated cursor component
function DemoCursor({ targetId, isActive }: { targetId?: string; isActive: boolean }) {
  const [position, setPosition] = useState({ x: 0, y: 0, visible: false });
  
  useEffect(() => {
    if (!isActive || !targetId) {
      setPosition(prev => ({ ...prev, visible: false }));
      return;
    }
    
    const element = document.getElementById(targetId);
    if (element) {
      const rect = element.getBoundingClientRect();
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        visible: true
      });
    }
  }, [targetId, isActive]);
  
  if (!position.visible) return null;
  
  return (
    <div 
      className="fixed z-[100] pointer-events-none transition-all duration-700 ease-out"
      style={{ left: position.x - 12, top: position.y - 12 }}
    >
      {/* Cursor pointer */}
      <svg width="32" height="32" viewBox="0 0 24 24" className="drop-shadow-lg filter">
        <path 
          d="M4 4L20 12L12 14L10 22L4 4Z" 
          fill="white" 
          stroke="#6366f1" 
          strokeWidth="2"
        />
      </svg>
      {/* Click ripple effect */}
      <div className="absolute inset-0 animate-ping">
        <div className="w-8 h-8 rounded-full bg-indigo-500/30" />
      </div>
    </div>
  );
}

// Element spotlight component
function Spotlight({ elementId, isActive }: { elementId?: string; isActive: boolean }) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  
  useEffect(() => {
    if (!isActive || !elementId) {
      setRect(null);
      return;
    }
    
    const element = document.getElementById(elementId);
    if (element) {
      setRect(element.getBoundingClientRect());
      // Add highlight class to element
      element.classList.add('demo-spotlight-target');
      return () => element.classList.remove('demo-spotlight-target');
    }
  }, [elementId, isActive]);
  
  if (!rect) return null;
  
  return (
    <div className="fixed inset-0 z-[90] pointer-events-none">
      {/* Darkened overlay with cutout */}
      <div className="absolute inset-0 bg-black/40" />
      {/* Spotlight hole */}
      <div 
        className="absolute bg-transparent rounded-xl transition-all duration-500 ease-out"
        style={{
          left: rect.left - 8,
          top: rect.top - 8,
          width: rect.width + 16,
          height: rect.height + 16,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.4), 0 0 30px 10px rgba(99,102,241,0.4)',
        }}
      >
        {/* Pulsing border */}
        <div className="absolute inset-0 rounded-xl border-2 border-indigo-400 animate-pulse" />
        {/* Corner accents */}
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-indigo-400 rounded-tl" />
        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-indigo-400 rounded-tr" />
        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-indigo-400 rounded-bl" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-indigo-400 rounded-br" />
      </div>
    </div>
  );
}

export default function PortfolioOptimizerPage() {
  const { profile } = useUserProfile();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedModel, setSelectedModel] = useState<string>('growth');
  const [showRebalancePreview, setShowRebalancePreview] = useState(false);
  
  // Enhanced demo mode state
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [showDemoIntro, setShowDemoIntro] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  
  // Get current demo step
  const currentDemoStep = isDemoMode ? ENHANCED_DEMO_TOUR[demoStep] : null;
  
  // Auto-tour effect with enhanced sequencing
  useEffect(() => {
    if (!isDemoMode || isPaused) return;
    
    const step = ENHANCED_DEMO_TOUR[demoStep];
    if (!step) {
      // Tour complete - show completion message briefly then reset
      setTimeout(() => {
        setIsDemoMode(false);
        setDemoStep(0);
      }, 500);
      return;
    }
    
    // Switch to correct tab
    setActiveTab(step.tab);
    
    // Simulate hover effect for hover actions
    if (step.action === 'hover' && step.elementId) {
      setHoveredElement(step.elementId);
    } else {
      setHoveredElement(null);
    }
    
    // Scroll element into view if needed
    if (step.elementId) {
      setTimeout(() => {
        const element = document.getElementById(step.elementId!);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
    
    const timer = setTimeout(() => {
      setDemoStep(prev => prev + 1);
    }, step.duration);
    
    return () => clearTimeout(timer);
  }, [isDemoMode, demoStep, isPaused]);
  
  const startDemo = useCallback(() => {
    setShowDemoIntro(false);
    setDemoStep(0);
    setIsPaused(false);
    setIsDemoMode(true);
  }, []);
  
  const stopDemo = useCallback(() => {
    setIsDemoMode(false);
    setHoveredElement(null);
    setIsPaused(false);
  }, []);
  
  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);
  
  const skipToStep = useCallback((stepIndex: number) => {
    setDemoStep(stepIndex);
    setIsPaused(false);
  }, []);
  
  // Use demo portfolio for showcase
  const portfolio = DEMO_PORTFOLIO;
  const totalValue = portfolio.reduce((sum, p) => sum + p.value, 0);
  const totalCostBasis = portfolio.reduce((sum, p) => sum + p.costBasis, 0);
  const totalGain = totalValue - totalCostBasis;
  const totalGainPercent = ((totalGain / totalCostBasis) * 100).toFixed(1);
  
  // Calculate aggregated data
  const aggregatedHoldings = useMemo(() => getAggregatedHoldings(portfolio), [portfolio]);
  const sectorExposure = useMemo(() => getAggregateSectorExposure(portfolio), [portfolio]);
  const geoExposure = useMemo(() => getAggregateGeographicExposure(portfolio), [portfolio]);
  const factorExposures = useMemo(() => getAggregateFactorExposures(portfolio), [portfolio]);
  
  // Sort holdings by overlap (most overlapped first)
  const sortedHoldings = useMemo(() => {
    return Array.from(aggregatedHoldings.entries())
      .sort((a, b) => b[1].funds.length - a[1].funds.length || b[1].totalWeight - a[1].totalWeight);
  }, [aggregatedHoldings]);
  
  // Calculate portfolio-level metrics
  const portfolioMetrics = useMemo(() => {
    let weightedExpenseRatio = 0;
    let weightedSharpe = 0;
    let weightedStdDev = 0;
    let weightedBeta = 0;
    let totalStars = 0;
    let fundCount = 0;
    
    for (const holding of portfolio) {
      const fundData = MOCK_FUND_DATA[holding.ticker];
      if (!fundData) continue;
      
      const weight = holding.value / totalValue;
      weightedExpenseRatio += fundData.expenseRatio * weight;
      weightedSharpe += fundData.riskMetrics.sharpeRatio * weight;
      weightedStdDev += fundData.riskMetrics.standardDeviation * weight;
      weightedBeta += fundData.riskMetrics.beta * weight;
      totalStars += fundData.morningstarRating;
      fundCount++;
    }
    
    return {
      expenseRatio: weightedExpenseRatio,
      annualFees: (weightedExpenseRatio / 100) * totalValue,
      sharpeRatio: weightedSharpe,
      standardDeviation: weightedStdDev,
      beta: weightedBeta,
      avgMorningstarRating: fundCount > 0 ? totalStars / fundCount : 0,
    };
  }, [portfolio, totalValue]);
  
  // Tax loss harvesting opportunities
  const taxLossOpportunities = useMemo(() => {
    return portfolio
      .filter(p => p.value < p.costBasis)
      .map(p => ({
        ...p,
        loss: p.costBasis - p.value,
        taxSavings: (p.costBasis - p.value) * 0.35, // Assuming 35% marginal rate
        alternatives: TAX_LOSS_HARVESTING_PAIRS[p.ticker] || [],
        fundData: MOCK_FUND_DATA[p.ticker],
      }));
  }, [portfolio]);
  
  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'holdings', label: 'X-Ray Holdings', icon: '🔍' },
    { id: 'sectors', label: 'Sectors & Geo', icon: '🌍' },
    { id: 'factors', label: 'Factor Analysis', icon: '📈' },
    { id: 'risk', label: 'Risk Analysis', icon: '⚠️' },
    { id: 'optimize', label: 'Optimize', icon: '🎯' },
    { id: 'tax', label: 'Tax Alpha', icon: '💰' },
  ];

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };
  
  const renderStyleBox = (position: number) => {
    const boxes = Array(9).fill(false);
    boxes[position - 1] = true;
    
    return (
      <div className="grid grid-cols-3 gap-0.5 w-12 h-12">
        {boxes.map((active, i) => (
          <div
            key={i}
            className={`w-3.5 h-3.5 rounded-sm ${
              active ? 'bg-indigo-500' : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
    );
  };
  
  const renderFactorBar = (value: number, label: string) => {
    const width = Math.abs(value) * 50;
    const isPositive = value >= 0;
    
    return (
      <div className="flex items-center gap-3">
        <span className="w-24 text-sm text-gray-400">{label}</span>
        <div className="flex-1 flex items-center">
          <div className="w-1/2 flex justify-end">
            {!isPositive && (
              <div
                className="h-4 bg-red-500/60 rounded-l"
                style={{ width: `${width}%` }}
              />
            )}
          </div>
          <div className="w-px h-6 bg-gray-600" />
          <div className="w-1/2">
            {isPositive && (
              <div
                className="h-4 bg-emerald-500/60 rounded-r"
                style={{ width: `${width}%` }}
              />
            )}
          </div>
        </div>
        <span className={`w-12 text-sm text-right ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {value > 0 ? '+' : ''}{value.toFixed(2)}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Intro Modal */}
        {showDemoIntro && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-900 to-indigo-950 rounded-2xl max-w-lg w-full p-8 border border-indigo-500/30 shadow-2xl shadow-indigo-500/20">
              <div className="text-center">
                <div className="text-6xl mb-4">🔮</div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-400 text-xs font-medium mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  Institutional Preview
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Portfolio Optimizer Pro</h2>
                <p className="text-gray-400 mb-6">
                  A preview of what Maven delivers with full Morningstar data integration. 
                  This is the future of wealth management — coming soon.
                </p>
                
                <div className="grid grid-cols-2 gap-3 mb-6 text-left">
                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-indigo-400 font-medium">🔍 X-Ray Vision</div>
                    <div className="text-xs text-gray-500">See through funds to actual holdings</div>
                  </div>
                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-indigo-400 font-medium">📊 Factor Analysis</div>
                    <div className="text-xs text-gray-500">Understand your return drivers</div>
                  </div>
                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-indigo-400 font-medium">🌪️ Stress Testing</div>
                    <div className="text-xs text-gray-500">See how you'd fare in 2008</div>
                  </div>
                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-indigo-400 font-medium">💰 Tax Alpha</div>
                    <div className="text-xs text-gray-500">Find hidden tax savings</div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDemoIntro(false)}
                    className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Explore Manually
                  </button>
                  <button
                    onClick={startDemo}
                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>▶️</span> Watch Demo Tour
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Enhanced Demo Overlay */}
        {isDemoMode && currentDemoStep && (
          <>
            {/* Spotlight effect */}
            {(currentDemoStep.action === 'spotlight' || currentDemoStep.action === 'hover') && (
              <Spotlight elementId={currentDemoStep.elementId} isActive={true} />
            )}
            
            {/* Animated cursor */}
            {currentDemoStep.action === 'cursor-move' && (
              <DemoCursor targetId={currentDemoStep.elementId} isActive={true} />
            )}
            
            {/* Message card - fixed position */}
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[110] w-full max-w-md px-4">
              <div className="bg-gradient-to-br from-gray-900/95 to-indigo-950/95 backdrop-blur-xl text-white p-5 rounded-2xl shadow-2xl shadow-indigo-500/20 border border-indigo-500/30">
                {/* Step counter */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {ENHANCED_DEMO_TOUR.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => skipToStep(i)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            i === demoStep 
                              ? 'bg-indigo-400 scale-125' 
                              : i < demoStep 
                                ? 'bg-indigo-400/50' 
                                : 'bg-gray-600 hover:bg-gray-500'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400 ml-2">
                      {demoStep + 1} / {ENHANCED_DEMO_TOUR.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={togglePause}
                      className="p-1.5 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors"
                      title={isPaused ? 'Resume' : 'Pause'}
                    >
                      {isPaused ? '▶️' : '⏸️'}
                    </button>
                    <button 
                      onClick={stopDemo}
                      className="p-1.5 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors"
                      title="Stop Tour"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                
                {/* Main message */}
                <h3 className="text-lg font-semibold mb-1">{currentDemoStep.message}</h3>
                {currentDemoStep.subMessage && (
                  <p className="text-sm text-gray-300">{currentDemoStep.subMessage}</p>
                )}
                
                {/* Paused indicator */}
                {isPaused && (
                  <div className="mt-3 text-xs text-amber-400 flex items-center gap-2">
                    <span className="animate-pulse">⏸️</span> Paused — click play or any dot to continue
                  </div>
                )}
                
                {/* Progress bar */}
                <div className="mt-4 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${((demoStep + 1) / ENHANCED_DEMO_TOUR.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Demo completion celebration */}
        {isDemoMode && demoStep >= ENHANCED_DEMO_TOUR.length && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-gray-900 to-indigo-950 p-8 rounded-2xl text-center max-w-md border border-indigo-500/30">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-2">Tour Complete!</h2>
              <p className="text-gray-400 mb-6">
                That's the power of Maven with institutional-grade data. Ready to transform your wealth management?
              </p>
              <button
                onClick={stopDemo}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-colors"
              >
                Start Exploring
              </button>
            </div>
          </div>
        )}
        
        {/* Demo Banner */}
        <div className="mb-6 p-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔮</span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-amber-200">Portfolio Optimizer Pro</h3>
                  <span className="px-2 py-0.5 bg-amber-500/30 text-amber-300 text-xs rounded-full font-medium">Institutional Preview</span>
                </div>
                <p className="text-sm text-amber-200/70">
                  A preview of institutional-grade analysis with full Morningstar data. 
                  Coming soon with real data integration.
                </p>
              </div>
            </div>
            {!isDemoMode && (
              <button
                onClick={startDemo}
                className="px-4 py-2 bg-amber-500/30 hover:bg-amber-500/40 text-amber-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <span>▶️</span> Watch Tour
              </button>
            )}
          </div>
        </div>
        
        {/* Header Stats */}
        <div id="portfolio-stats" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className={`bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 transition-all ${hoveredElement === 'portfolio-stats' ? 'ring-2 ring-indigo-500/50' : ''}`}>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Portfolio Value</div>
            <div className="text-2xl font-bold text-white mt-1">${(totalValue / 1000).toFixed(0)}K</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Total Gain</div>
            <div className={`text-2xl font-bold mt-1 ${totalGain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalGain >= 0 ? '+' : ''}{totalGainPercent}%
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Expense Ratio</div>
            <div className="text-2xl font-bold text-white mt-1">{(portfolioMetrics.expenseRatio).toFixed(2)}%</div>
            <div className="text-xs text-gray-500">${portfolioMetrics.annualFees.toFixed(0)}/yr</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Sharpe Ratio</div>
            <div className="text-2xl font-bold text-white mt-1">{portfolioMetrics.sharpeRatio.toFixed(2)}</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Beta</div>
            <div className="text-2xl font-bold text-white mt-1">{portfolioMetrics.beta.toFixed(2)}</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="text-xs text-gray-400 uppercase tracking-wider">Avg Rating</div>
            <div className="text-lg font-bold text-yellow-400 mt-1">
              {renderStars(Math.round(portfolioMetrics.avgMorningstarRating))}
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 p-1 bg-gray-800/30 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
        
        {/* Tab Content */}
        <div className="space-y-6">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Holdings Grid */}
              <div className="bg-gray-800/40 rounded-xl border border-gray-700/50 overflow-hidden">
                <div className="p-4 border-b border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white">Portfolio Holdings</h3>
                  <p className="text-sm text-gray-400">Your funds with Morningstar data overlay</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
                        <th className="px-4 py-3">Fund</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3 text-center">Rating</th>
                        <th className="px-4 py-3 text-center">Style</th>
                        <th className="px-4 py-3 text-right">Value</th>
                        <th className="px-4 py-3 text-right">Weight</th>
                        <th className="px-4 py-3 text-right">Expense</th>
                        <th className="px-4 py-3 text-right">Gain/Loss</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/30">
                      {portfolio.map((holding) => {
                        const fundData = MOCK_FUND_DATA[holding.ticker];
                        const gain = holding.value - holding.costBasis;
                        const gainPercent = ((gain / holding.costBasis) * 100).toFixed(1);
                        const rowId = `${holding.ticker.toLowerCase()}-row`;
                        const isHighlighted = hoveredElement === rowId;
                        
                        return (
                          <tr 
                            key={holding.ticker} 
                            id={rowId}
                            className={`hover:bg-gray-700/20 transition-all ${isHighlighted ? 'bg-indigo-500/20 ring-2 ring-indigo-500/50' : ''}`}
                          >
                            <td className="px-4 py-3">
                              <div className="font-medium text-white">{holding.ticker}</div>
                              <div className="text-xs text-gray-500 truncate max-w-[200px]">
                                {fundData?.name || 'Unknown'}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-400">
                              {fundData?.category || '—'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-yellow-400 text-sm">
                                {fundData ? renderStars(fundData.morningstarRating) : '—'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center">
                                {fundData ? renderStyleBox(fundData.styleBox) : '—'}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-white">
                              ${holding.value.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-400">
                              {((holding.value / totalValue) * 100).toFixed(1)}%
                            </td>
                            <td className="px-4 py-3 text-right text-gray-400">
                              {fundData ? `${fundData.expenseRatio.toFixed(2)}%` : '—'}
                            </td>
                            <td className={`px-4 py-3 text-right font-medium ${gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {gain >= 0 ? '+' : ''}{gainPercent}%
                              <div className="text-xs opacity-70">
                                ${Math.abs(gain).toLocaleString()}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Quick Insights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 rounded-xl p-5 border border-emerald-500/20">
                  <div className="flex items-center gap-2 text-emerald-400 mb-3">
                    <span className="text-xl">✓</span>
                    <span className="font-semibold">Strengths</span>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Low-cost core (VOO at 0.03%)</li>
                    <li>• Strong Morningstar ratings (avg 4.1★)</li>
                    <li>• Solid quality factor tilt (+0.42)</li>
                    <li>• Tax-efficient index funds</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-xl p-5 border border-amber-500/20">
                  <div className="flex items-center gap-2 text-amber-400 mb-3">
                    <span className="text-xl">⚠</span>
                    <span className="font-semibold">Opportunities</span>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• High overlap in top holdings (AAPL in 4 funds)</li>
                    <li>• Concentrated in tech (42% vs 29% S&P)</li>
                    <li>• Limited international exposure (8%)</li>
                    <li>• ARKK dragging returns (-63%)</li>
                  </ul>
                </div>
                
                <div id="insights-recommendations" className={`bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 rounded-xl p-5 border transition-all ${hoveredElement === 'insights-recommendations' ? 'border-indigo-400 ring-2 ring-indigo-500/50' : 'border-indigo-500/20'}`}>
                  <div className="flex items-center gap-2 text-indigo-400 mb-3">
                    <span className="text-xl">💡</span>
                    <span className="font-semibold">Recommendations</span>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Harvest ARKK losses ($3,700 tax alpha)</li>
                    <li>• Consolidate S&P exposure (VOO + FXAIX)</li>
                    <li>• Increase international to 15-20%</li>
                    <li>• Add value tilt for diversification</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* X-RAY HOLDINGS TAB */}
          {activeTab === 'holdings' && (
            <div className="space-y-6">
              <div className="bg-gray-800/40 rounded-xl border border-gray-700/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Holdings X-Ray <InfoTooltip term="diversification"><span className="text-gray-500 cursor-help">ⓘ</span></InfoTooltip>
                </h3>
                <p className="text-sm text-gray-400 mb-6">
                  See through your funds to the actual stocks you own. Identify hidden concentration and overlap.
                </p>
                
                {/* Overlap Alert */}
                <div id="overlap-alert" className={`mb-6 p-4 bg-amber-500/10 border rounded-lg transition-all ${hoveredElement === 'overlap-alert' ? 'border-amber-400 ring-2 ring-amber-500/50' : 'border-amber-500/30'}`}>
                  <div className="flex items-center gap-2 text-amber-400 font-medium mb-2">
                    <span>⚠️</span>
                    <span>High Overlap Detected</span>
                  </div>
                  <p className="text-sm text-amber-200/70">
                    You own <strong>Apple (AAPL)</strong> in 4 different funds, totaling <strong>7.2%</strong> of your portfolio. 
                    This hidden concentration means a 10% drop in Apple would cost you ~$1,160.
                  </p>
                </div>
                
                <div id="holdings-table" className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-700/50">
                        <th className="px-4 py-3">Stock</th>
                        <th className="px-4 py-3">Sector</th>
                        <th className="px-4 py-3 text-right">Total Weight</th>
                        <th className="px-4 py-3 text-right">Est. Value</th>
                        <th className="px-4 py-3">Found In</th>
                        <th className="px-4 py-3 text-center">Overlap</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/30">
                      {sortedHoldings.slice(0, 20).map(([ticker, data]) => {
                        const rowId = `${ticker.toLowerCase()}-row`;
                        const isHighlighted = hoveredElement === rowId;
                        return (
                        <tr 
                          key={ticker} 
                          id={rowId}
                          className={`hover:bg-gray-700/20 transition-all ${isHighlighted ? 'bg-indigo-500/20 ring-2 ring-indigo-500/50' : ''}`}
                        >
                          <td className="px-4 py-3">
                            <div className="font-medium text-white">{ticker}</div>
                            <div className="text-xs text-gray-500">{data.name}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400">{data.sector}</td>
                          <td className="px-4 py-3 text-right font-medium text-white">
                            {data.totalWeight.toFixed(2)}%
                          </td>
                          <td className="px-4 py-3 text-right text-gray-400">
                            ${((data.totalWeight / 100) * totalValue).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {data.funds.map((fund) => (
                                <span
                                  key={fund}
                                  className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300"
                                >
                                  {fund}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {data.funds.length > 1 ? (
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                data.funds.length >= 4 ? 'bg-red-500/20 text-red-400' :
                                data.funds.length >= 3 ? 'bg-amber-500/20 text-amber-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {data.funds.length}x overlap
                              </span>
                            ) : (
                              <span className="text-gray-600">—</span>
                            )}
                          </td>
                        </tr>
                      );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* SECTORS & GEO TAB */}
          {activeTab === 'sectors' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sector Breakdown */}
              <div id="tech-sector" className={`bg-gray-800/40 rounded-xl border p-6 transition-all ${hoveredElement === 'tech-sector' ? 'border-indigo-400 ring-2 ring-indigo-500/50' : 'border-gray-700/50'}`}>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Sector Exposure <InfoTooltip term="asset-allocation"><span className="text-gray-500 cursor-help">ⓘ</span></InfoTooltip>
                </h3>
                <div className="space-y-3">
                  {Object.entries(sectorExposure)
                    .sort(([, a], [, b]) => b - a)
                    .map(([sector, weight]) => {
                      const benchmarkWeight = MOCK_FUND_DATA['VOO']?.sectorWeights[sector as keyof typeof MOCK_FUND_DATA['VOO']['sectorWeights']] || 0;
                      const diff = weight - benchmarkWeight;
                      
                      return (
                        <div key={sector} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-300 capitalize">
                              {sector.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">{weight.toFixed(1)}%</span>
                              <span className={`text-xs ${diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                                ({diff > 0 ? '+' : ''}{diff.toFixed(1)}% vs S&P)
                              </span>
                            </div>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                Math.abs(diff) > 5 ? (diff > 0 ? 'bg-amber-500' : 'bg-blue-500') : 'bg-indigo-500'
                              }`}
                              style={{ width: `${Math.min(weight, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
              
              {/* Geographic Breakdown */}
              <div id="geo-breakdown" className={`bg-gray-800/40 rounded-xl border p-6 transition-all ${hoveredElement === 'geo-breakdown' ? 'border-indigo-400 ring-2 ring-indigo-500/50' : 'border-gray-700/50'}`}>
                <h3 className="text-lg font-semibold text-white mb-4">Geographic Exposure</h3>
                <div className="space-y-4">
                  {Object.entries(geoExposure)
                    .sort(([, a], [, b]) => b - a)
                    .map(([region, weight]) => {
                      const regionLabels: Record<string, { label: string; flag: string }> = {
                        northAmerica: { label: 'North America', flag: '🇺🇸' },
                        europe: { label: 'Europe', flag: '🇪🇺' },
                        asia: { label: 'Asia Pacific', flag: '🌏' },
                        emergingMarkets: { label: 'Emerging Markets', flag: '🌍' },
                        other: { label: 'Other', flag: '🌐' },
                      };
                      
                      return (
                        <div key={region} className="flex items-center gap-4">
                          <span className="text-2xl">{regionLabels[region]?.flag || '🌐'}</span>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-gray-300">{regionLabels[region]?.label || region}</span>
                              <span className="text-white font-medium">{weight.toFixed(1)}%</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full"
                                style={{ width: `${weight}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
                
                {/* International Alert */}
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-blue-200">
                    <strong>💡 Tip:</strong> Most advisors recommend 20-40% international exposure for diversification.
                    Your current allocation ({geoExposure.europe + geoExposure.asia + geoExposure.emergingMarkets}%) is below typical recommendations.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* FACTOR ANALYSIS TAB */}
          {activeTab === 'factors' && (
            <div className="space-y-6">
              <div id="factor-bars" className={`bg-gray-800/40 rounded-xl border p-6 transition-all ${hoveredElement === 'factor-bars' ? 'border-indigo-400 ring-2 ring-indigo-500/50' : 'border-gray-700/50'}`}>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Factor Exposures <InfoTooltip term="beta"><span className="text-gray-500 cursor-help">ⓘ</span></InfoTooltip>
                </h3>
                <p className="text-sm text-gray-400 mb-6">
                  Factor investing targets specific return drivers. Understanding your portfolio's factor tilts 
                  helps explain performance and identify hidden risks.
                </p>
                
                <div className="space-y-4">
                  {renderFactorBar(factorExposures.value, 'Value')}
                  {renderFactorBar(factorExposures.growth, 'Growth')}
                  {renderFactorBar(factorExposures.momentum, 'Momentum')}
                  {renderFactorBar(factorExposures.quality, 'Quality')}
                  {renderFactorBar(factorExposures.size, 'Size (Small)')}
                  {renderFactorBar(factorExposures.volatility, 'Low Vol')}
                  {renderFactorBar(factorExposures.yield, 'Yield')}
                </div>
                
                <div id="factor-insights" className={`mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 transition-all ${hoveredElement === 'factor-insights' ? 'ring-2 ring-indigo-500/50 rounded-lg' : ''}`}>
                  <div className="p-4 bg-gray-700/30 rounded-lg">
                    <h4 className="font-medium text-white mb-2">What This Means</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• <strong>Growth tilt (+{factorExposures.growth.toFixed(2)})</strong> — QQQ driving growth exposure</li>
                      <li>• <strong>Quality tilt (+{factorExposures.quality.toFixed(2)})</strong> — Good! Quality companies tend to outperform</li>
                      <li>• <strong>Large cap bias ({factorExposures.size.toFixed(2)})</strong> — Missing small cap premium</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-gray-700/30 rounded-lg">
                    <h4 className="font-medium text-white mb-2">Factor Risks</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Growth has underperformed value historically in rising rate environments</li>
                      <li>• Low yield exposure may mean less downside protection</li>
                      <li>• Consider adding value (SCHD) or small cap (VB) for diversification</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* RISK ANALYSIS TAB */}
          {activeTab === 'risk' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800/40 rounded-xl border border-gray-700/50 p-5">
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Standard Deviation</div>
                  <div className="text-3xl font-bold text-white">{portfolioMetrics.standardDeviation.toFixed(1)}%</div>
                  <div className="text-sm text-gray-400 mt-1">Annual volatility</div>
                </div>
                
                <div className="bg-gray-800/40 rounded-xl border border-gray-700/50 p-5">
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Portfolio Beta</div>
                  <div className="text-3xl font-bold text-white">{portfolioMetrics.beta.toFixed(2)}</div>
                  <div className="text-sm text-gray-400 mt-1">vs S&P 500</div>
                </div>
                
                <div className="bg-gray-800/40 rounded-xl border border-gray-700/50 p-5">
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Sharpe Ratio</div>
                  <div className="text-3xl font-bold text-white">{portfolioMetrics.sharpeRatio.toFixed(2)}</div>
                  <div className="text-sm text-gray-400 mt-1">Risk-adjusted return</div>
                </div>
              </div>
              
              {/* Stress Test Preview */}
              <div id="stress-tests" className={`bg-gray-800/40 rounded-xl border p-6 transition-all ${hoveredElement === 'stress-tests' ? 'border-indigo-400 ring-2 ring-indigo-500/50' : 'border-gray-700/50'}`}>
                <h3 className="text-lg font-semibold text-white mb-4">Historical Stress Tests</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: '2008 Financial Crisis', loss: -48.2, spLoss: -50.9, id: 'crash-2008' },
                    { name: '2020 COVID Crash', loss: -31.5, spLoss: -33.9, id: 'crash-covid' },
                    { name: '2022 Rate Hikes', loss: -22.8, spLoss: -25.4, id: 'crash-2022' },
                    { name: 'Dot-Com Bust (2000-02)', loss: -52.1, spLoss: -49.1, id: 'crash-dotcom' },
                    { name: '1970s Stagflation', loss: -42.5, spLoss: -48.2, id: 'crash-70s' },
                    { name: '10% Correction', loss: -11.8, spLoss: -10.0, id: 'crash-10pct' },
                  ].map((scenario) => (
                    <div 
                      key={scenario.name} 
                      id={scenario.id}
                      className={`p-4 bg-gray-700/30 rounded-lg transition-all ${hoveredElement === scenario.id ? 'ring-2 ring-indigo-500/50 bg-gray-700/50' : ''}`}
                    >
                      <div className="text-sm text-gray-400 mb-2">{scenario.name}</div>
                      <div className="text-2xl font-bold text-red-400">{scenario.loss}%</div>
                      <div className="text-xs text-gray-500 mt-1">
                        S&P 500: {scenario.spLoss}%
                        <span className={scenario.loss > scenario.spLoss ? 'text-emerald-400 ml-2' : 'text-red-400 ml-2'}>
                          ({scenario.loss > scenario.spLoss ? 'Better' : 'Worse'})
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        Portfolio loss: ${Math.abs((scenario.loss / 100) * totalValue).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Concentration Risk */}
              <div id="concentration-risk" className={`bg-gray-800/40 rounded-xl border p-6 transition-all ${hoveredElement === 'concentration-risk' ? 'border-indigo-400 ring-2 ring-indigo-500/50' : 'border-gray-700/50'}`}>
                <h3 className="text-lg font-semibold text-white mb-4">Concentration Risk</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-3">Top 10 Holdings = Your Portfolio</h4>
                    <p className="text-sm text-gray-300 mb-4">
                      Your top 10 underlying stocks make up <strong className="text-white">38.5%</strong> of your portfolio.
                      A 20% drop in these stocks would cost you <strong className="text-red-400">${((0.385 * 0.2) * totalValue).toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>.
                    </p>
                    <div className="space-y-2">
                      {sortedHoldings.slice(0, 5).map(([ticker, data]) => (
                        <div key={ticker} className="flex items-center gap-2">
                          <span className="w-16 text-sm font-medium text-white">{ticker}</span>
                          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${data.totalWeight * 5}%` }}
                            />
                          </div>
                          <span className="w-16 text-sm text-gray-400 text-right">{data.totalWeight.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-3">Sector Concentration</h4>
                    <p className="text-sm text-gray-300 mb-4">
                      <strong className="text-amber-400">Technology at 42%</strong> is significantly above the S&P 500 weight of 29%.
                      Consider sector diversification.
                    </p>
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <p className="text-sm text-amber-200">
                        <strong>Risk:</strong> A tech sector correction (like 2022's -33%) would hit your portfolio harder than a diversified portfolio.
                        Estimated additional loss: <strong>${((0.13 * 0.33) * totalValue).toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* OPTIMIZE TAB */}
          {activeTab === 'optimize' && (
            <div className="space-y-6">
              {/* Model Portfolio Comparison */}
              <div id="model-selector" className={`bg-gray-800/40 rounded-xl border p-6 transition-all ${hoveredElement === 'model-selector' ? 'border-indigo-400 ring-2 ring-indigo-500/50' : 'border-gray-700/50'}`}>
                <h3 className="text-lg font-semibold text-white mb-4">Compare to Model Portfolios</h3>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {Object.entries(MODEL_PORTFOLIOS).map(([key, model]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedModel(key)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedModel === key
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-700/50 text-gray-400 hover:text-white'
                      }`}
                    >
                      {model.name}
                    </button>
                  ))}
                </div>
                
                {selectedModel && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-4">Target vs Current Allocation</h4>
                      <div className="space-y-4">
                        {Object.entries(MODEL_PORTFOLIOS[selectedModel as keyof typeof MODEL_PORTFOLIOS].allocation).map(([asset, target]) => {
                          // Calculate current allocation
                          let current = 0;
                          if (asset === 'usEquity') current = 85;
                          else if (asset === 'intlEquity') current = 8;
                          else if (asset === 'bonds') current = 5;
                          else if (asset === 'cash') current = 1;
                          else if (asset === 'alternatives') current = 1;
                          
                          const diff = current - target;
                          
                          return (
                            <div key={asset}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-300 capitalize">{asset.replace(/([A-Z])/g, ' $1')}</span>
                                <div className="flex gap-4">
                                  <span className="text-gray-500">Target: {target}%</span>
                                  <span className="text-white">Current: {current}%</span>
                                  <span className={diff > 0 ? 'text-amber-400' : diff < 0 ? 'text-blue-400' : 'text-gray-500'}>
                                    {diff > 0 ? '+' : ''}{diff}%
                                  </span>
                                </div>
                              </div>
                              <div className="h-2 bg-gray-700 rounded-full overflow-hidden relative">
                                <div
                                  className="h-full bg-gray-600 rounded-full"
                                  style={{ width: `${target}%` }}
                                />
                                <div
                                  className={`absolute top-0 h-full rounded-full ${
                                    current > target ? 'bg-amber-500' : 'bg-indigo-500'
                                  }`}
                                  style={{ 
                                    width: `${Math.min(current, target)}%`,
                                    opacity: current > target ? 0.7 : 1
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div id="rebalance-trades" className={`transition-all ${hoveredElement === 'rebalance-trades' ? 'ring-2 ring-indigo-500/50 rounded-lg p-2 -m-2' : ''}`}>
                      <h4 className="text-sm font-medium text-gray-400 mb-4">Rebalancing Trades</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex justify-between items-center">
                          <div>
                            <div className="text-sm font-medium text-red-400">Sell US Equity</div>
                            <div className="text-xs text-gray-400">QQQ, VOO overweight</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-red-400">-$32,400</div>
                            <div className="text-xs text-gray-500">-20% allocation</div>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex justify-between items-center">
                          <div>
                            <div className="text-sm font-medium text-emerald-400">Buy International</div>
                            <div className="text-xs text-gray-400">VXUS underweight</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-emerald-400">+$19,400</div>
                            <div className="text-xs text-gray-500">+12% allocation</div>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex justify-between items-center">
                          <div>
                            <div className="text-sm font-medium text-emerald-400">Buy Bonds</div>
                            <div className="text-xs text-gray-400">BND underweight</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-emerald-400">+$16,200</div>
                            <div className="text-xs text-gray-500">+10% allocation</div>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setShowRebalancePreview(true)}
                        className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                      >
                        Preview Rebalancing Impact →
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Optimization Opportunities */}
              <div className="bg-gray-800/40 rounded-xl border border-gray-700/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Optimization Opportunities</h3>
                
                <div className="space-y-4">
                  <div id="fee-reduction" className={`p-4 bg-emerald-500/10 border rounded-lg transition-all ${hoveredElement === 'fee-reduction' ? 'border-emerald-400 ring-2 ring-emerald-500/50' : 'border-emerald-500/30'}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">💰</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-emerald-400">Fee Reduction</h4>
                          <span className="text-emerald-400 font-bold">Save $485/year</span>
                        </div>
                        <p className="text-sm text-gray-300 mt-1">
                          Switch from QQQ (0.20%) to QQQM (0.15%) for identical exposure at lower cost.
                          Also consider consolidating VOO + FXAIX into a single position.
                        </p>
                        <button className="mt-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded text-sm hover:bg-emerald-500/30 transition-colors">
                          View Trade Details
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🔄</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-blue-400">Reduce Overlap</h4>
                          <span className="text-blue-400 font-bold">Improve Diversification</span>
                        </div>
                        <p className="text-sm text-gray-300 mt-1">
                          VOO and FXAIX are essentially identical funds. Consolidate into one and use the 
                          freed capital for asset classes you're missing (international, small cap).
                        </p>
                        <button className="mt-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-sm hover:bg-blue-500/30 transition-colors">
                          View Consolidation Plan
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">⚖️</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-amber-400">Factor Rebalance</h4>
                          <span className="text-amber-400 font-bold">Reduce Risk</span>
                        </div>
                        <p className="text-sm text-gray-300 mt-1">
                          Add value factor exposure to balance your growth tilt. Consider SCHV or VTV 
                          to reduce volatility while maintaining equity exposure.
                        </p>
                        <button className="mt-2 px-3 py-1 bg-amber-500/20 text-amber-400 rounded text-sm hover:bg-amber-500/30 transition-colors">
                          View Factor Analysis
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* TAX ALPHA TAB */}
          {activeTab === 'tax' && (
            <div className="space-y-6">
              {/* Tax Loss Harvesting */}
              <div id="tax-loss-section" className={`bg-gray-800/40 rounded-xl border p-6 transition-all ${hoveredElement === 'tax-loss-section' ? 'border-indigo-400 ring-2 ring-indigo-500/50' : 'border-gray-700/50'}`}>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Tax-Loss Harvesting Opportunities <InfoTooltip term="tax-loss-harvesting"><span className="text-gray-500 cursor-help">ⓘ</span></InfoTooltip>
                </h3>
                <p className="text-sm text-gray-400 mb-6">
                  Sell positions at a loss, immediately buy similar (not identical) funds to maintain exposure,
                  and use the losses to offset gains or income.
                </p>
                
                {taxLossOpportunities.length > 0 ? (
                  <div className="space-y-4">
                    {taxLossOpportunities.map((opp) => {
                      const harvestId = `${opp.ticker.toLowerCase()}-harvest`;
                      return (
                      <div 
                        key={opp.ticker} 
                        id={harvestId}
                        className={`p-4 bg-emerald-500/10 border rounded-lg transition-all ${hoveredElement === harvestId ? 'border-emerald-400 ring-2 ring-emerald-500/50 scale-[1.02]' : 'border-emerald-500/30'}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-white">{opp.ticker}</span>
                              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">
                                -{((opp.loss / opp.costBasis) * 100).toFixed(0)}% loss
                              </span>
                            </div>
                            <div className="text-sm text-gray-400">{opp.fundData?.name}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-emerald-400">
                              ${opp.taxSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </div>
                            <div className="text-xs text-gray-500">estimated tax savings</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                          <div>
                            <div className="text-gray-500">Current Value</div>
                            <div className="text-white">${opp.value.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Cost Basis</div>
                            <div className="text-white">${opp.costBasis.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Harvestable Loss</div>
                            <div className="text-red-400">-${opp.loss.toLocaleString()}</div>
                          </div>
                        </div>
                        
                        {opp.alternatives.length > 0 && (
                          <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Swap To (Similar Funds)</div>
                            <div className="flex flex-wrap gap-2">
                              {opp.alternatives.map((alt) => (
                                <button
                                  key={alt}
                                  className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                                >
                                  {alt} →
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      );
                    })}
                    
                    <div id="total-tax-alpha" className={`p-4 bg-gray-700/30 rounded-lg transition-all ${hoveredElement === 'total-tax-alpha' ? 'ring-2 ring-emerald-500/50' : ''}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-white">Total Tax Alpha Available</div>
                          <div className="text-sm text-gray-400">
                            {taxLossOpportunities.length} position{taxLossOpportunities.length > 1 ? 's' : ''} with harvestable losses
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-emerald-400">
                            ${taxLossOpportunities.reduce((sum, o) => sum + o.taxSavings, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </div>
                          <div className="text-sm text-gray-500">
                            from ${taxLossOpportunities.reduce((sum, o) => sum + o.loss, 0).toLocaleString()} in losses
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <span className="text-4xl mb-4 block">📈</span>
                    <p>No tax-loss harvesting opportunities — all positions are in the green!</p>
                  </div>
                )}
              </div>
              
              {/* Asset Location */}
              <div className="bg-gray-800/40 rounded-xl border border-gray-700/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Asset Location Optimization</h3>
                <p className="text-sm text-gray-400 mb-6">
                  Place tax-inefficient assets in tax-advantaged accounts and tax-efficient assets in taxable accounts.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-700/30 rounded-lg">
                    <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                      <span className="text-emerald-400">🏦</span>
                      Tax-Advantaged (401k, IRA)
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-gray-300">Bonds (BND)</span>
                        <span className="text-emerald-400">✓ Correct</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-300">REITs</span>
                        <span className="text-emerald-400">✓ Correct</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-300">High-dividend (SCHD)</span>
                        <span className="text-emerald-400">✓ Correct</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-300">ARKK (high turnover)</span>
                        <span className="text-amber-400">⚠ Move here</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-gray-700/30 rounded-lg">
                    <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                      <span className="text-blue-400">💼</span>
                      Taxable Brokerage
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex justify-between">
                        <span className="text-gray-300">Index ETFs (VOO, VTI)</span>
                        <span className="text-emerald-400">✓ Correct</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-300">Tax-managed funds</span>
                        <span className="text-emerald-400">✓ Correct</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-300">Growth stocks (low dividend)</span>
                        <span className="text-emerald-400">✓ Correct</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-300">Municipal bonds</span>
                        <span className="text-emerald-400">✓ Correct</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                  <p className="text-sm text-indigo-200">
                    <strong>💡 Estimated Tax Savings:</strong> Proper asset location could save you 
                    <strong> $320-480 annually</strong> in taxes by sheltering tax-inefficient assets.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span className="text-amber-400 text-xs font-medium">Institutional Preview</span>
          </div>
          <p>
            Portfolio Optimizer Pro — What Maven delivers with full Morningstar integration
          </p>
          <p className="mt-1 text-gray-600">
            Simulated data for demonstration purposes • Real data integration coming soon
          </p>
        </div>
      </main>
      
      {/* Rebalance Preview Modal */}
      {showRebalancePreview && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white">Rebalancing Preview</h3>
                  <p className="text-sm text-gray-400 mt-1">Review changes before executing</p>
                </div>
                <button
                  onClick={() => setShowRebalancePreview(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-sm text-gray-400">Before</div>
                  <div className="text-2xl font-bold text-white mt-1">{portfolioMetrics.standardDeviation.toFixed(1)}%</div>
                  <div className="text-xs text-gray-500">Standard Deviation</div>
                </div>
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <div className="text-sm text-gray-400">After</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">11.5%</div>
                  <div className="text-xs text-emerald-400/70">-{(portfolioMetrics.standardDeviation - 11.5).toFixed(1)}% volatility</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-white mb-3">Trade Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-red-500/10 rounded">
                    <span className="text-red-400">SELL QQQ</span>
                    <span className="text-red-400">-40 shares ($21,000)</span>
                  </div>
                  <div className="flex justify-between p-2 bg-red-500/10 rounded">
                    <span className="text-red-400">SELL VOO</span>
                    <span className="text-red-400">-22 shares ($11,400)</span>
                  </div>
                  <div className="flex justify-between p-2 bg-emerald-500/10 rounded">
                    <span className="text-emerald-400">BUY VXUS</span>
                    <span className="text-emerald-400">+312 shares ($19,400)</span>
                  </div>
                  <div className="flex justify-between p-2 bg-emerald-500/10 rounded">
                    <span className="text-emerald-400">BUY BND</span>
                    <span className="text-emerald-400">+225 shares ($16,200)</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <p className="text-sm text-amber-200">
                  <strong>⚠️ Tax Impact:</strong> Selling QQQ and VOO will realize approximately 
                  <strong> $8,400 in capital gains</strong>. Consider:
                </p>
                <ul className="text-sm text-amber-200/70 mt-2 space-y-1">
                  <li>• Execute in tax-advantaged accounts if possible</li>
                  <li>• Offset with ARKK loss harvesting ($3,700)</li>
                  <li>• Spread sales across tax years</li>
                </ul>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRebalancePreview(false)}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowRebalancePreview(false);
                    // In real app, would execute trades
                  }}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                >
                  Execute Rebalance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
