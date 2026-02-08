'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShowcaseData {
  type: 'portfolio_comparison' | 'stress_test' | 'tax_harvest' | 'retirement_plan' | 'market_analysis' | 'general';
  title: string;
  current?: any;
  proposed?: any;
  metrics?: { label: string; current: number | string; proposed?: number | string; change?: string; good?: boolean }[];
  chartData?: { labels: string[]; datasets: { label: string; data: number[]; color: string }[] };
  insights?: string[];
  risks?: { scenario: string; impact: number; color: string }[];
  actionItems?: { priority: 'high' | 'medium' | 'low'; action: string; impact: string }[];
}

interface OracleShowcaseProps {
  trigger: React.ReactNode;
  data: ShowcaseData;
  onAnalyze?: () => Promise<string>;
  className?: string;
}

export function OracleShowcase({ trigger, data, onAnalyze, className = '' }: OracleShowcaseProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'comparison' | 'stress' | 'chart'>('overview');

  const handleOpen = async () => {
    setIsOpen(true);
    if (onAnalyze && !analysis) {
      setIsAnalyzing(true);
      try {
        const result = await onAnalyze();
        setAnalysis(result);
      } catch (e) {
        setAnalysis('Unable to generate analysis at this time.');
      }
      setIsAnalyzing(false);
    }
  };

  const formatNumber = (n: number | string) => {
    if (typeof n === 'string') return n;
    if (Math.abs(n) >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (Math.abs(n) >= 1000) return `$${(n / 1000).toFixed(0)}K`;
    if (n < 1 && n > -1) return `${(n * 100).toFixed(1)}%`;
    return n.toLocaleString();
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleOpen}
        className={`group relative overflow-hidden ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 group-hover:from-purple-600/30 group-hover:to-indigo-600/30 transition-all duration-300" />
        <div className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-lg text-white font-medium transition-all">
          <span className="text-xl">🔮</span>
          {trigger}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full"
          />
        </div>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-purple-900/30 border border-purple-500/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl shadow-purple-500/20"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 px-6 py-4 border-b border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/30">
                      🔮
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{data.title}</h2>
                      <p className="text-sm text-purple-300">Maven Oracle Analysis</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-4">
                  {['overview', 'comparison', 'stress', 'chart'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        activeTab === tab
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {tab === 'overview' && '📊 Overview'}
                      {tab === 'comparison' && '⚖️ Compare'}
                      {tab === 'stress' && '🔥 Stress Test'}
                      {tab === 'chart' && '📈 Projections'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Area */}
              <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* AI Analysis */}
                    <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-xl border border-purple-500/20 p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">🔮</span>
                        <h3 className="font-semibold text-purple-300">Oracle's Take</h3>
                      </div>
                      {isAnalyzing ? (
                        <div className="flex items-center gap-3 text-slate-400">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full"
                          />
                          <span>Analyzing your data...</span>
                        </div>
                      ) : analysis ? (
                        <p className="text-slate-300 leading-relaxed whitespace-pre-line">{analysis}</p>
                      ) : (
                        <p className="text-slate-400 italic">Analysis will appear here...</p>
                      )}
                    </div>

                    {/* Key Metrics */}
                    {data.metrics && data.metrics.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-white mb-3">📊 Key Metrics</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {data.metrics.map((metric, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
                            >
                              <div className="text-sm text-slate-400 mb-1">{metric.label}</div>
                              <div className="flex items-end gap-2">
                                <span className="text-xl font-bold text-white">
                                  {formatNumber(metric.current)}
                                </span>
                                {metric.proposed !== undefined && (
                                  <span className={`text-sm ${metric.good ? 'text-emerald-400' : 'text-amber-400'}`}>
                                    → {formatNumber(metric.proposed)}
                                  </span>
                                )}
                              </div>
                              {metric.change && (
                                <div className={`text-xs mt-1 ${metric.good ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {metric.change}
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Items */}
                    {data.actionItems && data.actionItems.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-white mb-3">✅ Recommended Actions</h3>
                        <div className="space-y-2">
                          {data.actionItems.map((item, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className={`flex items-start gap-3 p-3 rounded-lg border ${
                                item.priority === 'high'
                                  ? 'bg-red-500/10 border-red-500/30'
                                  : item.priority === 'medium'
                                  ? 'bg-amber-500/10 border-amber-500/30'
                                  : 'bg-slate-500/10 border-slate-500/30'
                              }`}
                            >
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                item.priority === 'high'
                                  ? 'bg-red-500/20 text-red-400'
                                  : item.priority === 'medium'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-slate-500/20 text-slate-400'
                              }`}>
                                {item.priority.toUpperCase()}
                              </span>
                              <div>
                                <div className="text-white font-medium">{item.action}</div>
                                <div className="text-sm text-slate-400">{item.impact}</div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Comparison Tab */}
                {activeTab === 'comparison' && (
                  <div className="space-y-6">
                    {data.current && data.proposed ? (
                      <div className="grid grid-cols-2 gap-6">
                        {/* Current */}
                        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-3 h-3 rounded-full bg-slate-400" />
                            <h3 className="font-semibold text-slate-300">Current Portfolio</h3>
                          </div>
                          <div className="space-y-3">
                            {Object.entries(data.current).map(([key, value]: [string, any]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                <span className="text-white font-medium">{formatNumber(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Proposed */}
                        <div className="bg-purple-900/30 rounded-xl border border-purple-500/30 p-5">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-3 h-3 rounded-full bg-purple-400" />
                            <h3 className="font-semibold text-purple-300">Proposed Portfolio</h3>
                          </div>
                          <div className="space-y-3">
                            {Object.entries(data.proposed).map(([key, value]: [string, any]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                <span className="text-purple-300 font-medium">{formatNumber(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-400">
                        No comparison data available
                      </div>
                    )}

                    {/* Visual Allocation Comparison */}
                    {data.current && data.proposed && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-white">Allocation Shift</h3>
                        <div className="space-y-3">
                          {Object.keys(data.current).map((key) => {
                            const curr = data.current[key] || 0;
                            const prop = data.proposed[key] || 0;
                            const change = prop - curr;
                            return (
                              <div key={key} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                  <span className={change > 0 ? 'text-emerald-400' : change < 0 ? 'text-red-400' : 'text-slate-400'}>
                                    {change > 0 ? '+' : ''}{(change * 100).toFixed(1)}%
                                  </span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden relative">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${curr * 100}%` }}
                                    className="absolute h-full bg-slate-500 rounded-full"
                                  />
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${prop * 100}%` }}
                                    transition={{ delay: 0.3 }}
                                    className="absolute h-full bg-purple-500 rounded-full opacity-70"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Stress Test Tab */}
                {activeTab === 'stress' && (
                  <div className="space-y-6">
                    {data.risks && data.risks.length > 0 ? (
                      <>
                        <h3 className="font-semibold text-white">🔥 How Your Portfolio Handles Stress</h3>
                        <div className="space-y-3">
                          {data.risks.map((risk, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-white font-medium">{risk.scenario}</span>
                                <span className={`text-lg font-bold ${
                                  risk.impact > -10 ? 'text-emerald-400' :
                                  risk.impact > -25 ? 'text-amber-400' : 'text-red-400'
                                }`}>
                                  {risk.impact > 0 ? '+' : ''}{risk.impact.toFixed(1)}%
                                </span>
                              </div>
                              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(100, 100 + risk.impact)}%` }}
                                  transition={{ delay: i * 0.1 + 0.2, duration: 0.5 }}
                                  className={`h-full rounded-full ${risk.color}`}
                                />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12 text-slate-400">
                        No stress test data available
                      </div>
                    )}
                  </div>
                )}

                {/* Chart Tab */}
                {activeTab === 'chart' && (
                  <div className="space-y-6">
                    {data.chartData ? (
                      <>
                        <h3 className="font-semibold text-white">📈 Projected Growth</h3>
                        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                          {/* Simple SVG Chart */}
                          <div className="h-64 relative">
                            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                              {/* Grid lines */}
                              {[0, 25, 50, 75, 100].map((y) => (
                                <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#334155" strokeWidth="0.5" />
                              ))}
                              
                              {/* Data lines */}
                              {data.chartData.datasets.map((dataset, di) => {
                                const maxVal = Math.max(...data.chartData!.datasets.flatMap(d => d.data));
                                const points = dataset.data.map((val, i) => {
                                  const x = (i / (dataset.data.length - 1)) * 100;
                                  const y = 100 - (val / maxVal) * 90;
                                  return `${x},${y}`;
                                }).join(' ');
                                
                                return (
                                  <motion.polyline
                                    key={di}
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 1 }}
                                    transition={{ duration: 1, delay: di * 0.3 }}
                                    points={points}
                                    fill="none"
                                    stroke={dataset.color}
                                    strokeWidth="2"
                                  />
                                );
                              })}
                            </svg>
                            
                            {/* Labels */}
                            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-slate-500 px-2">
                              {data.chartData.labels.filter((_, i) => i % Math.ceil(data.chartData!.labels.length / 5) === 0).map((label, i) => (
                                <span key={i}>{label}</span>
                              ))}
                            </div>
                          </div>
                          
                          {/* Legend */}
                          <div className="flex justify-center gap-6 mt-4">
                            {data.chartData.datasets.map((dataset, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dataset.color }} />
                                <span className="text-sm text-slate-400">{dataset.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12 text-slate-400">
                        No chart data available
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-900/80 border-t border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Powered by Claude</span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-medium transition-colors"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default OracleShowcase;
