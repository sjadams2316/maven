'use client';

import { useState, useEffect, useRef, useMemo } from 'react';

interface WealthDataPoint {
  year: number;
  age: number;
  portfolio: number;
  socialSecurity: number;
  totalIncome: number;
  phase: 'accumulation' | 'retirement';
  milestone?: string;
  milestoneIcon?: string;
  isDownturn?: boolean;
}

interface WealthJourneyChartProps {
  currentAge: number;
  currentInvestments: number;
  retirementAge: number;
  annualContribution: number;
  expectedReturn: number;
  socialSecurityMonthly: number;
  socialSecurityStartAge: number;
  onYearSelect?: (year: WealthDataPoint | null) => void;
}

// Milestones with gamification
const MILESTONES = [
  { amount: 100000, label: 'Six Figures', icon: '🌟', color: 'text-yellow-400' },
  { amount: 250000, label: 'Quarter Million', icon: '💪', color: 'text-blue-400' },
  { amount: 500000, label: 'Half Million', icon: '🏔️', color: 'text-purple-400' },
  { amount: 1000000, label: 'Millionaire', icon: '🎉', color: 'text-emerald-400' },
  { amount: 2000000, label: 'Double Comma', icon: '🏆', color: 'text-amber-400' },
  { amount: 5000000, label: 'High Net Worth', icon: '👑', color: 'text-pink-400' },
  { amount: 10000000, label: 'Eight Figures', icon: '💎', color: 'text-cyan-400' },
];

export default function WealthJourneyChart({
  currentAge,
  currentInvestments,
  retirementAge,
  annualContribution,
  expectedReturn,
  socialSecurityMonthly,
  socialSecurityStartAge,
  onYearSelect
}: WealthJourneyChartProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackYear, setPlaybackYear] = useState(0);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [showStressTest, setShowStressTest] = useState(false);
  const [stressScenario, setStressScenario] = useState<'none' | 'mild' | 'severe' | '2008'>('none');
  const [showCelebration, setShowCelebration] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const currentYear = new Date().getFullYear();

  // Generate wealth data with market volatility simulation
  const wealthData = useMemo(() => {
    const data: WealthDataPoint[] = [];
    const yearsToProject = Math.max(retirementAge - currentAge + 25, 45);
    let portfolio = currentInvestments;
    let reachedMilestones = new Set<number>();
    
    // Stress test adjustments
    const getStressAdjustment = (year: number, age: number) => {
      if (stressScenario === 'none') return 0;
      if (stressScenario === 'mild') {
        // 15% correction in year 5
        if (year === currentYear + 5) return -0.15;
        return 0;
      }
      if (stressScenario === 'severe') {
        // 30% crash in year 3, slow recovery
        if (year === currentYear + 3) return -0.30;
        if (year === currentYear + 4) return -0.05;
        return 0;
      }
      if (stressScenario === '2008') {
        // 2008-style: -38% in year 3, -10% in year 4, then recovery
        if (year === currentYear + 3) return -0.38;
        if (year === currentYear + 4) return -0.10;
        return 0;
      }
      return 0;
    };
    
    for (let i = 0; i <= yearsToProject; i++) {
      const age = currentAge + i;
      const year = currentYear + i;
      const isRetired = age >= retirementAge;
      const phase = isRetired ? 'retirement' : 'accumulation';
      
      // Calculate returns with some simulated volatility
      const baseReturn = expectedReturn / 100;
      const volatility = 0.02 * Math.sin(i * 0.5) + 0.01 * Math.cos(i * 0.7); // Subtle wave
      const stressAdjustment = getStressAdjustment(year, age);
      const yearReturn = i === 0 ? 0 : baseReturn + volatility + stressAdjustment;
      
      // Growth
      if (i > 0) {
        const growth = portfolio * yearReturn;
        const contribution = isRetired ? 0 : annualContribution;
        portfolio = portfolio + growth + contribution;
        
        // Retirement withdrawals (4% rule)
        if (isRetired) {
          portfolio = portfolio * (1 - 0.04);
        }
      }
      
      // Social Security
      const ssIncome = age >= socialSecurityStartAge ? socialSecurityMonthly * 12 : 0;
      
      // Check for milestone
      let milestone: string | undefined;
      let milestoneIcon: string | undefined;
      for (const m of MILESTONES) {
        if (portfolio >= m.amount && !reachedMilestones.has(m.amount)) {
          milestone = m.label;
          milestoneIcon = m.icon;
          reachedMilestones.add(m.amount);
          break;
        }
      }
      
      // Add retirement milestone
      if (age === retirementAge) {
        milestone = 'Retirement!';
        milestoneIcon = '🎊';
      }
      
      data.push({
        year,
        age,
        portfolio: Math.max(0, portfolio),
        socialSecurity: ssIncome,
        totalIncome: (portfolio * 0.04) + ssIncome,
        phase,
        milestone,
        milestoneIcon,
        isDownturn: stressAdjustment < -0.1
      });
    }
    
    return data;
  }, [currentAge, currentInvestments, retirementAge, annualContribution, expectedReturn, socialSecurityMonthly, socialSecurityStartAge, stressScenario]);

  // Animation playback
  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    let lastTime = 0;
    const speed = 150; // ms per year

    const animate = (time: number) => {
      if (time - lastTime > speed) {
        setPlaybackYear(prev => {
          const next = prev + 1;
          if (next >= wealthData.length) {
            setIsPlaying(false);
            return prev;
          }
          
          // Check for milestone celebration
          const dataPoint = wealthData[next];
          if (dataPoint?.milestone) {
            setShowCelebration(dataPoint.milestoneIcon || '🎉');
            setTimeout(() => setShowCelebration(null), 1500);
          }
          
          return next;
        });
        lastTime = time;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, wealthData]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 40, right: 20, bottom: 60, left: 70 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Find max value for scale
    const maxPortfolio = Math.max(...wealthData.map(d => d.portfolio)) * 1.1;
    const retirementIndex = wealthData.findIndex(d => d.age === retirementAge);

    // Draw grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight * i / 5);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    // Draw retirement divider
    if (retirementIndex > 0) {
      const x = padding.left + (retirementIndex / wealthData.length) * chartWidth;
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Labels
      ctx.fillStyle = 'rgba(99, 102, 241, 0.8)';
      ctx.font = '11px system-ui';
      ctx.fillText('Accumulation', padding.left + 10, padding.top + 20);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.8)';
      ctx.fillText('Retirement', x + 10, padding.top + 20);
    }

    // Draw the wealth line
    const activeData = isPlaying ? wealthData.slice(0, playbackYear + 1) : wealthData;
    
    // Gradient fill under line
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
    
    ctx.beginPath();
    ctx.moveTo(padding.left, height - padding.bottom);
    
    activeData.forEach((d, i) => {
      const x = padding.left + (i / (wealthData.length - 1)) * chartWidth;
      const y = padding.top + chartHeight - (d.portfolio / maxPortfolio) * chartHeight;
      if (i === 0) {
        ctx.lineTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    if (activeData.length > 0) {
      const lastX = padding.left + ((activeData.length - 1) / (wealthData.length - 1)) * chartWidth;
      ctx.lineTo(lastX, height - padding.bottom);
    }
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Draw line
    ctx.beginPath();
    activeData.forEach((d, i) => {
      const x = padding.left + (i / (wealthData.length - 1)) * chartWidth;
      const y = padding.top + chartHeight - (d.portfolio / maxPortfolio) * chartHeight;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    // Line style changes for retirement phase
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw milestones
    wealthData.forEach((d, i) => {
      if (d.milestone && (!isPlaying || i <= playbackYear)) {
        const x = padding.left + (i / (wealthData.length - 1)) * chartWidth;
        const y = padding.top + chartHeight - (d.portfolio / maxPortfolio) * chartHeight;
        
        // Milestone dot
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = d.phase === 'retirement' ? '#a855f7' : '#f59e0b';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Draw downturns markers
    wealthData.forEach((d, i) => {
      if (d.isDownturn && (!isPlaying || i <= playbackYear)) {
        const x = padding.left + (i / (wealthData.length - 1)) * chartWidth;
        const y = padding.top + chartHeight - (d.portfolio / maxPortfolio) * chartHeight;
        
        ctx.fillStyle = '#ef4444';
        ctx.font = '16px system-ui';
        ctx.fillText('📉', x - 8, y - 15);
      }
    });

    // Draw animated dot (current position)
    if (activeData.length > 0) {
      const currentData = activeData[activeData.length - 1];
      const x = padding.left + ((activeData.length - 1) / (wealthData.length - 1)) * chartWidth;
      const y = padding.top + chartHeight - (currentData.portfolio / maxPortfolio) * chartHeight;
      
      // Glow effect
      const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
      glowGradient.addColorStop(0, 'rgba(99, 102, 241, 0.8)');
      glowGradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.fill();
      
      // Main dot
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#6366f1';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Value label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'center';
      const valueText = `$${(currentData.portfolio / 1000000).toFixed(2)}M`;
      ctx.fillText(valueText, x, y - 25);
    }

    // Y-axis labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = maxPortfolio * (5 - i) / 5;
      const y = padding.top + (chartHeight * i / 5);
      ctx.fillText(`$${(value / 1000000).toFixed(1)}M`, padding.left - 10, y + 4);
    }

    // X-axis labels (ages)
    ctx.textAlign = 'center';
    const ageStep = Math.ceil(wealthData.length / 8);
    wealthData.forEach((d, i) => {
      if (i % ageStep === 0 || i === wealthData.length - 1) {
        const x = padding.left + (i / (wealthData.length - 1)) * chartWidth;
        ctx.fillText(`${d.age}`, x, height - padding.bottom + 20);
      }
    });
    ctx.fillText('Age', width / 2, height - 10);

    // Hover highlight
    if (hoveredYear !== null) {
      const idx = hoveredYear;
      if (idx >= 0 && idx < wealthData.length) {
        const d = wealthData[idx];
        const x = padding.left + (idx / (wealthData.length - 1)) * chartWidth;
        
        // Vertical line
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, height - padding.bottom);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

  }, [wealthData, playbackYear, isPlaying, hoveredYear, retirementAge]);

  // Handle mouse move for hover
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padding = { left: 70, right: 20 };
    const chartWidth = rect.width - padding.left - padding.right;

    const relativeX = (x - padding.left) / chartWidth;
    const idx = Math.round(relativeX * (wealthData.length - 1));
    
    if (idx >= 0 && idx < wealthData.length) {
      setHoveredYear(idx);
      onYearSelect?.(wealthData[idx]);
    }
  };

  const handleMouseLeave = () => {
    setHoveredYear(null);
    onYearSelect?.(null);
  };

  const activeYearData = hoveredYear !== null 
    ? wealthData[hoveredYear] 
    : (isPlaying ? wealthData[playbackYear] : wealthData[retirementAge - currentAge] || wealthData[0]);

  const resetPlayback = () => {
    setPlaybackYear(0);
    setIsPlaying(false);
  };

  return (
    <div className="bg-[#0d0d14] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
      {/* Celebration animation */}
      {showCelebration && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="text-8xl animate-bounce">{showCelebration}</div>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 animate-pulse" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            📈 Your Wealth Journey
            {isPlaying && <span className="text-sm font-normal text-indigo-400 animate-pulse">Playing...</span>}
          </h2>
          <p className="text-sm text-gray-400">Watch your wealth grow through accumulation and retirement</p>
        </div>
        
        {/* Playback controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
              isPlaying 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                : 'bg-indigo-500 text-white hover:bg-indigo-600'
            }`}
          >
            {isPlaying ? '⏸ Pause' : '▶️ Watch Journey'}
          </button>
          {playbackYear > 0 && !isPlaying && (
            <button
              onClick={resetPlayback}
              className="px-3 py-2 bg-white/5 text-gray-400 rounded-lg text-sm hover:bg-white/10 transition"
            >
              ↺ Reset
            </button>
          )}
        </div>
      </div>

      {/* Stress test toggle */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <span className="text-sm text-gray-400">Scenario:</span>
        {[
          { id: 'none', label: '📈 Normal', desc: 'Expected growth' },
          { id: 'mild', label: '📉 Mild Correction', desc: '-15% in year 5' },
          { id: 'severe', label: '⚠️ Severe Crash', desc: '-30% in year 3' },
          { id: '2008', label: '🔥 2008-Style', desc: '-38% crisis' },
        ].map(scenario => (
          <button
            key={scenario.id}
            onClick={() => {
              setStressScenario(scenario.id as typeof stressScenario);
              resetPlayback();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs transition ${
              stressScenario === scenario.id
                ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
            title={scenario.desc}
          >
            {scenario.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-80 cursor-crosshair"
          style={{ width: '100%', height: '320px' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
      </div>

      {/* Active year info card */}
      {activeYearData && (
        <div className={`mt-4 p-4 rounded-xl border ${
          activeYearData.phase === 'retirement' 
            ? 'bg-purple-500/10 border-purple-500/30' 
            : 'bg-indigo-500/10 border-indigo-500/30'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {activeYearData.milestoneIcon && <span className="text-2xl">{activeYearData.milestoneIcon}</span>}
              <div>
                <p className="font-semibold text-white">
                  Year {activeYearData.year} · Age {activeYearData.age}
                </p>
                <p className={`text-xs ${activeYearData.phase === 'retirement' ? 'text-purple-400' : 'text-indigo-400'}`}>
                  {activeYearData.phase === 'retirement' ? '🏖️ Retirement Phase' : '💼 Accumulation Phase'}
                </p>
              </div>
            </div>
            {activeYearData.milestone && (
              <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm">
                {activeYearData.milestone}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-400">Portfolio Value</p>
              <p className="text-xl font-bold text-white">${activeYearData.portfolio.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            {activeYearData.phase === 'retirement' && (
              <>
                <div>
                  <p className="text-xs text-gray-400">Portfolio Income (4%)</p>
                  <p className="text-xl font-bold text-emerald-400">
                    ${Math.round(activeYearData.portfolio * 0.04).toLocaleString()}/yr
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Social Security</p>
                  <p className="text-xl font-bold text-blue-400">
                    {activeYearData.socialSecurity > 0 
                      ? `$${activeYearData.socialSecurity.toLocaleString()}/yr`
                      : `Starts age ${socialSecurityStartAge}`
                    }
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Annual Income</p>
                  <p className="text-xl font-bold text-white">
                    ${Math.round(activeYearData.totalIncome).toLocaleString()}/yr
                  </p>
                  <p className="text-xs text-gray-500">
                    ${Math.round(activeYearData.totalIncome / 12).toLocaleString()}/mo
                  </p>
                </div>
              </>
            )}
            {activeYearData.phase === 'accumulation' && (
              <>
                <div>
                  <p className="text-xs text-gray-400">Annual Contribution</p>
                  <p className="text-xl font-bold text-blue-400">${annualContribution.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Years to Retirement</p>
                  <p className="text-xl font-bold text-purple-400">{retirementAge - activeYearData.age}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">If Retired Now (4%)</p>
                  <p className="text-xl font-bold text-gray-400">
                    ${Math.round(activeYearData.portfolio * 0.04 / 12).toLocaleString()}/mo
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-500" />
          <span>Portfolio Value</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span>Milestone</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <span>Retirement Milestone</span>
        </div>
        {stressScenario !== 'none' && (
          <div className="flex items-center gap-2">
            <span>📉</span>
            <span>Market Downturn</span>
          </div>
        )}
      </div>
    </div>
  );
}
