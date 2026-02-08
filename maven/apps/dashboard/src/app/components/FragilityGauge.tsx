'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IndicatorScore {
  value: number | null;
  score: number;
  percentile: number;
  status: string;
  description: string;
}

interface PillarScore {
  name: string;
  score: number;
  weight: number;
  indicators: Record<string, IndicatorScore>;
  interpretation: string;
}

interface FragilityData {
  timestamp: string;
  compositeScore: number;
  zone: string;
  zoneColor: string;
  zoneEmoji: string;
  interpretation: string;
  pillars: Record<string, PillarScore>; // Dynamic pillars (8 total now)
  keyRisks: string[];
  keyStrengths: string[];
  actionItems: string[];
  dataAsOf: string;
  indicatorCount?: number;
  dataQuality?: {
    realDataSources: number;
    totalSources: number;
    percentReal: number;
  };
  rawData?: Record<string, number | null>;
}

function GaugeArc({ score, color }: { score: number; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    const size = 200;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);
    
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 80;
    const lineWidth = 12;
    
    // Background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI * 0.8, Math.PI * 2.2);
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Score arc
    const scoreAngle = Math.PI * 0.8 + (score / 100) * Math.PI * 1.4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, Math.PI * 0.8, scoreAngle);
    
    // Gradient based on score
    const gradient = ctx.createLinearGradient(0, size, size, 0);
    gradient.addColorStop(0, '#10B981'); // Green
    gradient.addColorStop(0.4, '#F59E0B'); // Yellow
    gradient.addColorStop(0.7, '#F97316'); // Orange
    gradient.addColorStop(1, '#EF4444'); // Red
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Zone labels
    ctx.font = '10px system-ui';
    ctx.fillStyle = '#6B7280';
    ctx.textAlign = 'center';
    
    // 0 label
    ctx.fillText('0', centerX - 70, centerY + 50);
    // 100 label
    ctx.fillText('100', centerX + 70, centerY + 50);
    
  }, [score, color]);
  
  return <canvas ref={canvasRef} className="mx-auto" />;
}

function PillarBar({ pillar, expanded, onToggle }: { 
  pillar: PillarScore; 
  expanded: boolean;
  onToggle: () => void;
}) {
  const getBarColor = (score: number) => {
    if (score < 30) return 'bg-emerald-500';
    if (score < 50) return 'bg-yellow-500';
    if (score < 70) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="mb-3">
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between text-sm mb-1 hover:bg-gray-800/50 p-1 rounded transition-colors"
      >
        <span className="text-gray-300">{pillar.name}</span>
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold">{pillar.score}</span>
          <span className="text-gray-500 text-xs">{expanded ? '▼' : '▶'}</span>
        </div>
      </button>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div 
          className={`h-full ${getBarColor(pillar.score)} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${pillar.score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      
      <AnimatePresence>
        {expanded && Object.keys(pillar.indicators).length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-2 pl-4 border-l border-gray-700 space-y-2"
          >
            {Object.entries(pillar.indicators).map(([key, indicator]) => (
              <div key={key} className="text-xs">
                <div className="flex justify-between text-gray-400">
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className={
                    indicator.score < 30 ? 'text-emerald-400' :
                    indicator.score < 50 ? 'text-yellow-400' :
                    indicator.score < 70 ? 'text-orange-400' : 'text-red-400'
                  }>{indicator.score}</span>
                </div>
                <div className="text-gray-500 text-[10px]">{indicator.description}</div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FragilityGauge({ compact = false }: { compact?: boolean }) {
  const [data, setData] = useState<FragilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/fragility-index');
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError('Failed to load fragility data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
    // Refresh every 15 minutes
    const interval = setInterval(fetchData, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  if (loading) {
    return (
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-48 mb-4" />
          <div className="h-48 bg-gray-700 rounded-full w-48 mx-auto mb-4" />
          <div className="h-4 bg-gray-700 rounded w-full mb-2" />
          <div className="h-4 bg-gray-700 rounded w-3/4" />
        </div>
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <div className="text-red-400">{error || 'No data available'}</div>
      </div>
    );
  }
  
  if (compact) {
    return (
      <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-colors cursor-pointer"
           onClick={() => setShowDetails(true)}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Market Fragility</span>
          <span className="text-lg">{data.zoneEmoji}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold" style={{ color: data.zoneColor }}>
            {data.compositeScore}
          </span>
          <span className="text-sm text-gray-500 capitalize">{data.zone}</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            Maven Market Fragility Index™
            <span className="text-xs bg-indigo-600/50 px-2 py-0.5 rounded-full">BETA</span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Measuring systemic fragility, not predicting crashes
          </p>
        </div>
        <div className="text-right text-xs text-gray-500">
          <div>Updated: {new Date(data.timestamp).toLocaleTimeString()}</div>
          <div>Data as of: {data.dataAsOf}</div>
          {data.indicatorCount && (
            <div className="text-indigo-400">{data.indicatorCount} indicators</div>
          )}
          {data.dataQuality && (
            <div className="text-emerald-400">{data.dataQuality.percentReal}% real data</div>
          )}
        </div>
      </div>
      
      {/* Main Gauge */}
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Gauge */}
          <div className="flex-shrink-0">
            <div className="relative">
              <GaugeArc score={data.compositeScore} color={data.zoneColor} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold" style={{ color: data.zoneColor }}>
                  {data.compositeScore}
                </span>
                <span className="text-lg capitalize mt-1" style={{ color: data.zoneColor }}>
                  {data.zoneEmoji} {data.zone}
                </span>
              </div>
            </div>
          </div>
          
          {/* Interpretation */}
          <div className="flex-1">
            <p className="text-gray-300 mb-4">{data.interpretation}</p>
            
            {/* Key Risks */}
            {data.keyRisks.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                  <span>⚠️</span> Key Risks
                </h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  {data.keyRisks.map((risk, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-red-500">•</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Strengths */}
            {data.keyStrengths.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                  <span>✓</span> Supporting Factors
                </h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  {data.keyStrengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-500">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Pillar Breakdown */}
      <div className="p-4 border-t border-gray-800">
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between text-sm text-gray-400 hover:text-white transition-colors"
        >
          <span>Pillar Breakdown</span>
          <span>{showDetails ? '▼' : '▶'}</span>
        </button>
        
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6"
            >
              {Object.entries(data.pillars).map(([key, pillar]) => (
                <PillarBar 
                  key={key}
                  pillar={pillar}
                  expanded={expandedPillar === key}
                  onToggle={() => setExpandedPillar(expandedPillar === key ? null : key)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Action Items */}
      {data.actionItems.length > 0 && (
        <div className="p-4 border-t border-gray-800 bg-gray-900/30">
          <h4 className="text-sm font-semibold text-indigo-400 mb-2">💡 Suggested Actions</h4>
          <ul className="text-sm text-gray-400 space-y-1">
            {data.actionItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-indigo-500">→</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Historical Context */}
      <div className="p-4 border-t border-gray-800">
        <h4 className="text-xs font-semibold text-gray-500 mb-2">Historical Context</h4>
        <div className="flex gap-4 text-xs">
          <div className="text-center">
            <div className="text-gray-400">Pre-COVID</div>
            <div className="text-lg font-semibold text-orange-400">58</div>
            <div className="text-gray-600">Feb 2020</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Pre-2022</div>
            <div className="text-lg font-semibold text-red-400">71</div>
            <div className="text-gray-600">Dec 2021</div>
          </div>
          <div className="text-center">
            <div className="text-gray-400">Current</div>
            <div className="text-lg font-semibold" style={{ color: data.zoneColor }}>
              {data.compositeScore}
            </div>
            <div className="text-gray-600">Now</div>
          </div>
        </div>
      </div>
      
      {/* Disclaimer */}
      <div className="px-4 py-3 border-t border-gray-800 bg-gray-950/50">
        <p className="text-[10px] text-gray-600">
          The Maven Market Fragility Index™ measures market conditions, not predictions. 
          High fragility indicates elevated risk, not certain outcomes. 
          Based on complexity theory research. Not financial advice.
        </p>
      </div>
    </div>
  );
}
