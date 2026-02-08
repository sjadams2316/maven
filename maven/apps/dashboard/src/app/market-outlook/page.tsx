'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getValuationAssessment,
  generateMarketOutlook,
  CAPE_PERCENTILES,
  estimateReturnFromCAPE,
} from '@/lib/valuation-indicators';
import { ToolExplainer } from '@/app/components/ToolExplainer';

interface ValuationData {
  timestamp: string;
  indicators: {
    cape: number;
    trailingPE: number | null;
    treasury10Y: number | null;
    treasury2Y: number | null;
    fedFundsRate: number | null;
    unemployment: number | null;
    vix: number | null;
  };
  derived: {
    yieldCurveSpread: number | null;
    isYieldCurveInverted: boolean;
    buffettIndicator: number;
    earningsYield: number;
    fedModelSpread: number | null;
    fedModelFavorsStocks: boolean;
  };
  assessment: {
    valuation: string;
    expectedRealReturn: number;
    riskLevel: string;
  };
}

export default function MarketOutlookPage() {
  const [data, setData] = useState<ValuationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/valuations');
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError('Failed to load market data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">📊</div>
          <div className="text-slate-400">Loading market data...</div>
        </div>
      </div>
    );
  }
  
  // Use defaults if data failed
  const indicators = data?.indicators || {
    cape: 35,
    trailingPE: 25,
    treasury10Y: 0.045,
    treasury2Y: 0.043,
    fedFundsRate: 0.05,
    unemployment: 4.0,
    vix: 15,
  };
  
  const derived = data?.derived || {
    yieldCurveSpread: 0.2,
    isYieldCurveInverted: false,
    buffettIndicator: 1.7,
    earningsYield: 0.04,
    fedModelSpread: -0.005,
    fedModelFavorsStocks: false,
  };
  
  const cape = indicators.cape || 35;
  const capeAssessment = getValuationAssessment(cape);
  const returnEstimate = estimateReturnFromCAPE(cape);
  
  const outlook = generateMarketOutlook({
    cape,
    buffettIndicator: derived.buffettIndicator,
    treasury10Y: indicators.treasury10Y || 0.045,
    fedFundsRate: indicators.fedFundsRate || 0.05,
    inflation: 0.03,
    unemploymentRate: indicators.unemployment || 4.0,
    yieldCurveSpread: derived.yieldCurveSpread || 0,
    vix: indicators.vix || 15,
  });
  
  const formatPercent = (value: number | null) => 
    value !== null ? `${(value * 100).toFixed(2)}%` : 'N/A';
  
  const getOutlookColor = (assessment: string) => {
    switch (assessment) {
      case 'bullish': return 'text-green-400';
      case 'neutral': return 'text-yellow-400';
      case 'cautious': return 'text-orange-400';
      case 'bearish': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };
  
  const getValuationColor = (level: string) => {
    switch (level) {
      case 'cheap': return 'text-green-400 bg-green-500/20';
      case 'fair': return 'text-yellow-400 bg-yellow-500/20';
      case 'expensive': return 'text-orange-400 bg-orange-500/20';
      case 'very_expensive': return 'text-red-400 bg-red-500/20';
      default: return 'text-slate-400';
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm mb-2 inline-block">
            ← Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Market Outlook</h1>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-slate-400">
              Valuation-based analysis and expected return forecasts
            </p>
            <ToolExplainer toolName="market-outlook" />
          </div>
          {data?.timestamp && (
            <p className="text-xs text-slate-500 mt-1">
              Data as of {new Date(data.timestamp).toLocaleString()}
            </p>
          )}
        </div>
        
        {/* Overall Assessment */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="col-span-2 bg-gradient-to-br from-slate-800/70 to-slate-900/70 rounded-xl border border-slate-700/50 p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="text-5xl">
                {outlook.overallAssessment === 'bullish' ? '🐂' :
                 outlook.overallAssessment === 'neutral' ? '⚖️' :
                 outlook.overallAssessment === 'cautious' ? '⚠️' : '🐻'}
              </div>
              <div>
                <div className="text-slate-400 text-sm">Overall Market Outlook</div>
                <div className={`text-4xl font-bold capitalize ${getOutlookColor(outlook.overallAssessment)}`}>
                  {outlook.overallAssessment}
                </div>
              </div>
            </div>
            
            <p className="text-lg text-slate-300 mb-6">{outlook.recommendation}</p>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-red-400 font-medium mb-2">⚠️ Risks</h4>
                <ul className="space-y-1">
                  {outlook.risks.length > 0 ? outlook.risks.map((risk, i) => (
                    <li key={i} className="text-sm text-slate-400">• {risk}</li>
                  )) : (
                    <li className="text-sm text-slate-500">No major risks identified</li>
                  )}
                </ul>
              </div>
              <div>
                <h4 className="text-green-400 font-medium mb-2">✓ Opportunities</h4>
                <ul className="space-y-1">
                  {outlook.opportunities.length > 0 ? outlook.opportunities.map((opp, i) => (
                    <li key={i} className="text-sm text-slate-400">• {opp}</li>
                  )) : (
                    <li className="text-sm text-slate-500">Limited opportunities at current valuations</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
          
          {/* Expected Returns */}
          <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-xl border border-purple-500/30 p-6">
            <h3 className="text-lg font-semibold mb-4">Expected 10Y Real Return</h3>
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-purple-300">
                {formatPercent(outlook.expectedReturn.mid)}
              </div>
              <div className="text-slate-400 text-sm mt-1">per year (real)</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Optimistic</span>
                <span className="text-green-400">{formatPercent(outlook.expectedReturn.high)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Base Case</span>
                <span className="text-purple-300">{formatPercent(outlook.expectedReturn.mid)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Pessimistic</span>
                <span className="text-red-400">{formatPercent(outlook.expectedReturn.low)}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              Based on CAPE ratio of {cape.toFixed(1)}
            </p>
          </div>
        </div>
        
        {/* Key Indicators */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
            <div className="text-slate-400 text-sm">CAPE Ratio</div>
            <div className="text-3xl font-bold">{cape.toFixed(1)}</div>
            <div className={`text-sm mt-1 px-2 py-0.5 rounded inline-block ${getValuationColor(capeAssessment.level)}`}>
              {capeAssessment.level.replace('_', ' ')}
            </div>
          </div>
          
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
            <div className="text-slate-400 text-sm">10Y Treasury</div>
            <div className="text-3xl font-bold">
              {indicators.treasury10Y ? (indicators.treasury10Y * 100).toFixed(2) : 'N/A'}%
            </div>
            <div className="text-sm text-slate-500 mt-1">Risk-free rate</div>
          </div>
          
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
            <div className="text-slate-400 text-sm">Yield Curve</div>
            <div className={`text-3xl font-bold ${derived.isYieldCurveInverted ? 'text-red-400' : 'text-green-400'}`}>
              {derived.yieldCurveSpread !== null ? `${(derived.yieldCurveSpread * 100).toFixed(0)}bp` : 'N/A'}
            </div>
            <div className="text-sm text-slate-500 mt-1">
              {derived.isYieldCurveInverted ? '⚠️ Inverted' : '✓ Normal'}
            </div>
          </div>
          
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
            <div className="text-slate-400 text-sm">VIX</div>
            <div className={`text-3xl font-bold ${
              (indicators.vix || 0) < 15 ? 'text-green-400' :
              (indicators.vix || 0) < 25 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {indicators.vix?.toFixed(1) || 'N/A'}
            </div>
            <div className="text-sm text-slate-500 mt-1">
              {(indicators.vix || 0) < 15 ? 'Low volatility' :
               (indicators.vix || 0) < 25 ? 'Normal' : 'Elevated fear'}
            </div>
          </div>
        </div>
        
        {/* CAPE Historical Context */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold mb-4">📊 CAPE Historical Percentiles</h3>
            <div className="space-y-3">
              {[
                { label: '90th Percentile', value: CAPE_PERCENTILES.p90, note: 'Expensive' },
                { label: '75th Percentile', value: CAPE_PERCENTILES.p75, note: '' },
                { label: 'Median', value: CAPE_PERCENTILES.median, note: 'Fair value' },
                { label: '25th Percentile', value: CAPE_PERCENTILES.p25, note: '' },
                { label: '10th Percentile', value: CAPE_PERCENTILES.p10, note: 'Cheap' },
              ].map((item) => (
                <div key={item.label} className="relative">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">{item.label}</span>
                    <span>{item.value.toFixed(1)}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                      style={{ width: `${(item.value / 50) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              
              {/* Current CAPE marker */}
              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="flex justify-between">
                  <span className="text-purple-400 font-medium">Current CAPE</span>
                  <span className="text-purple-400 font-bold">{cape.toFixed(1)}</span>
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  {capeAssessment.historicalContext}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
            <h3 className="text-lg font-semibold mb-4">📈 Other Valuation Metrics</h3>
            
            <div className="space-y-4">
              {/* Buffett Indicator */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Buffett Indicator (Mkt Cap/GDP)</span>
                  <span className={`font-medium ${
                    derived.buffettIndicator < 1 ? 'text-green-400' :
                    derived.buffettIndicator < 1.4 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {(derived.buffettIndicator * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      derived.buffettIndicator < 1 ? 'bg-green-500' :
                      derived.buffettIndicator < 1.4 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, (derived.buffettIndicator / 2) * 100)}%` }}
                  />
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Historical average: 85% | Current: {(derived.buffettIndicator * 100).toFixed(0)}%
                </div>
              </div>
              
              {/* Fed Model */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Fed Model (E/Y vs 10Y)</span>
                  <span className={`font-medium ${derived.fedModelFavorsStocks ? 'text-green-400' : 'text-red-400'}`}>
                    {derived.fedModelSpread !== null ? `${(derived.fedModelSpread * 100).toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  {derived.fedModelFavorsStocks ? '✓ Stocks favored vs bonds' : '⚠️ Bonds more attractive'}
                </div>
              </div>
              
              {/* Earnings Yield */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Earnings Yield</span>
                  <span className="font-medium">{(derived.earningsYield * 100).toFixed(2)}%</span>
                </div>
                <div className="text-xs text-slate-500">
                  Inverse of P/E — what you "earn" per dollar invested
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* What This Means */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl border border-blue-500/30 p-6">
          <h3 className="text-lg font-semibold mb-4">💡 What This Means For Your Planning</h3>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <h4 className="text-purple-400 font-medium mb-2">Monte Carlo Inputs</h4>
              <p className="text-sm text-slate-400">
                With CAPE at {cape.toFixed(0)}, historical data suggests using <strong className="text-white">{formatPercent(returnEstimate.expectedRealReturn + 0.025)}</strong> nominal 
                return assumption instead of the historical average of 10%.
              </p>
            </div>
            <div>
              <h4 className="text-purple-400 font-medium mb-2">Safe Withdrawal Rate</h4>
              <p className="text-sm text-slate-400">
                At current valuations, consider a more conservative <strong className="text-white">3.5%</strong> withdrawal 
                rate instead of the traditional 4% rule.
              </p>
            </div>
            <div>
              <h4 className="text-purple-400 font-medium mb-2">Asset Allocation</h4>
              <p className="text-sm text-slate-400">
                {capeAssessment.level === 'very_expensive' || capeAssessment.level === 'expensive' 
                  ? 'Consider slightly lower equity allocation or larger cash buffer.'
                  : 'Current allocations appropriate for long-term investors.'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Methodology */}
        <div className="mt-6 bg-slate-800/30 rounded-xl border border-slate-700/30 p-4">
          <details>
            <summary className="text-sm text-slate-400 cursor-pointer">📚 Methodology & Data Sources</summary>
            <div className="mt-4 text-xs text-slate-500 space-y-2">
              <p><strong>CAPE Ratio:</strong> Cyclically Adjusted Price-to-Earnings (Shiller PE). Price divided by 10-year average inflation-adjusted earnings. Smooths business cycle effects.</p>
              <p><strong>Expected Returns:</strong> Historically, CAPE explains ~40% of subsequent 10-year returns. Formula: Expected Real Return ≈ 1/CAPE (earnings yield) + growth adjustment.</p>
              <p><strong>Buffett Indicator:</strong> Total stock market cap divided by GDP. Warren Buffett called it "probably the best single measure of where valuations stand."</p>
              <p><strong>Fed Model:</strong> Compares earnings yield to 10Y Treasury yield. When earnings yield exceeds bond yield, stocks are theoretically more attractive.</p>
              <p><strong>Limitations:</strong> Valuations are poor short-term timing tools but useful for setting long-term expectations. The market can stay overvalued for years.</p>
              <p><strong>Data Source:</strong> Federal Reserve Economic Data (FRED), Robert Shiller's data.</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
