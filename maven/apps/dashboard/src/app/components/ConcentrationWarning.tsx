'use client';

import Link from 'next/link';

interface ConcentratedPosition {
  ticker: string;
  value: number;
  percentage: number;
}

interface ConcentrationWarningProps {
  positions: ConcentratedPosition[];
  portfolioValue: number;
  threshold?: number; // Default 25%
  onDismiss?: () => void;
}

/**
 * ConcentrationWarning - Critical P0 alert for portfolio concentration risk
 * 
 * Triggers when ANY single position exceeds the threshold (default 25%) of total portfolio.
 * This is a safety/liability feature - users MUST be warned about catastrophic concentration risk.
 * 
 * Design: Red/critical styling to stand out from regular insights.
 * Always appears ABOVE other insights when triggered.
 */
export default function ConcentrationWarning({
  positions,
  portfolioValue,
  threshold = 25,
  onDismiss,
}: ConcentrationWarningProps) {
  if (positions.length === 0) return null;
  
  // Sort by concentration (highest first)
  const sortedPositions = [...positions].sort((a, b) => b.percentage - a.percentage);
  const highestConcentration = sortedPositions[0];
  const isCritical = highestConcentration.percentage >= 50;
  const isExtreme = highestConcentration.percentage >= 75;
  
  // Determine severity level for messaging
  const getSeverityLabel = () => {
    if (isExtreme) return 'EXTREME';
    if (isCritical) return 'CRITICAL';
    return 'HIGH';
  };
  
  const getSeverityMessage = () => {
    if (isExtreme) {
      return `${highestConcentration.ticker} alone represents ${highestConcentration.percentage.toFixed(0)}% of your portfolio. This level of concentration poses severe risk to your wealth.`;
    }
    if (isCritical) {
      return `${highestConcentration.ticker} represents ${highestConcentration.percentage.toFixed(0)}% of your portfolio — more than half your wealth is in a single position.`;
    }
    if (positions.length === 1) {
      return `${highestConcentration.ticker} represents ${highestConcentration.percentage.toFixed(0)}% of your portfolio, exceeding the recommended ${threshold}% limit for any single position.`;
    }
    return `${positions.length} positions exceed the ${threshold}% concentration threshold. Diversification can help protect your portfolio.`;
  };
  
  return (
    <div className={`
      relative overflow-hidden rounded-xl p-4 border-2 
      ${isExtreme 
        ? 'bg-gradient-to-br from-red-950/80 to-rose-950/80 border-red-500/60' 
        : isCritical
          ? 'bg-gradient-to-br from-red-900/60 to-rose-900/60 border-red-500/50'
          : 'bg-gradient-to-br from-red-900/40 to-orange-900/40 border-red-500/40'
      }
    `}>
      {/* Pulsing background effect for extreme cases */}
      {isExtreme && (
        <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
      )}
      
      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white transition flex items-center justify-center text-xs z-10"
          title="Dismiss (warning will return next session)"
        >
          ✕
        </button>
      )}
      
      <div className="relative flex gap-4">
        {/* Warning Icon */}
        <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-lg
          ${isExtreme 
            ? 'bg-gradient-to-br from-red-600 to-red-700 animate-pulse' 
            : 'bg-gradient-to-br from-red-500 to-rose-600'
          }
        `}>
          🚨
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`
              px-2 py-0.5 text-xs font-bold rounded
              ${isExtreme 
                ? 'bg-red-500 text-white animate-pulse' 
                : isCritical
                  ? 'bg-red-500/80 text-white'
                  : 'bg-red-500/60 text-white'
              }
            `}>
              {getSeverityLabel()} CONCENTRATION RISK
            </span>
            <span className="text-xs text-red-300">P0 — Requires Attention</span>
          </div>
          
          <h3 className="font-semibold text-white mb-1">
            Portfolio Concentration Warning
          </h3>
          
          <p className="text-sm text-gray-300 mb-3">
            {getSeverityMessage()}
          </p>
          
          {/* Concentrated positions list */}
          <div className="mb-3 space-y-1.5">
            {sortedPositions.slice(0, 3).map((pos, idx) => (
              <div 
                key={pos.ticker}
                className="flex items-center justify-between p-2 bg-black/20 rounded-lg text-sm"
              >
                <div className="flex items-center gap-2">
                  <div className={`
                    w-2 h-2 rounded-full
                    ${pos.percentage >= 75 ? 'bg-red-500 animate-pulse' : pos.percentage >= 50 ? 'bg-red-400' : 'bg-orange-400'}
                  `} />
                  <span className="font-medium text-white">{pos.ticker}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">
                    ${pos.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                  <span className={`
                    font-bold min-w-[50px] text-right
                    ${pos.percentage >= 50 ? 'text-red-400' : 'text-orange-400'}
                  `}>
                    {pos.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
            {sortedPositions.length > 3 && (
              <p className="text-xs text-gray-500 pl-2">
                +{sortedPositions.length - 3} more concentrated positions
              </p>
            )}
          </div>
          
          {/* Risk explanation */}
          <div className="p-2 bg-black/30 rounded-lg mb-3">
            <p className="text-xs text-gray-400">
              <strong className="text-gray-300">Why this matters:</strong> If {highestConcentration.ticker} drops 50%, 
              you would lose <strong className="text-red-400">
                ${((highestConcentration.value * 0.5)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </strong> ({((highestConcentration.percentage * 0.5)).toFixed(0)}% of your portfolio). 
              Diversification helps protect against single-asset catastrophic loss.
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs text-gray-500">
              Guideline: No single position &gt;{threshold}%
            </span>
            <Link
              href="/portfolio-lab"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition text-sm font-medium"
            >
              <span>Explore Diversification Options</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper function to detect concentrated positions from holdings
 * Use this in dashboard or other components to determine if warning should show
 */
export function detectConcentratedPositions(
  holdings: Array<{ ticker: string; currentValue?: number }>,
  totalPortfolioValue: number,
  threshold: number = 25
): ConcentratedPosition[] {
  if (totalPortfolioValue <= 0) return [];
  
  return holdings
    .filter(h => h.currentValue && h.currentValue > 0)
    .map(h => ({
      ticker: h.ticker,
      value: h.currentValue!,
      percentage: (h.currentValue! / totalPortfolioValue) * 100,
    }))
    .filter(p => p.percentage > threshold)
    .sort((a, b) => b.percentage - a.percentage);
}
