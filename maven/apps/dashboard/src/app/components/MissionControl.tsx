'use client';

import { useState, useEffect } from 'react';
import { 
  WealthVelocity, 
  FICountdown, 
  Achievement, 
  Mission,
  Streak,
  RARITY_COLORS,
  calculateWealthVelocity,
  calculateFICountdown,
  checkAchievements,
  getActiveMissions,
  CelebrationEvent,
  checkForCelebrations,
} from '@/lib/gamification';
import { Term } from './InfoTooltip';

interface MissionControlProps {
  netWorth: number;
  previousNetWorth?: number;
  monthlyExpenses?: number;
  monthlySavings?: number;
  savingsRate?: number;
  taxAlphaSaved?: number;
  contributions401k?: number;
  contributionsIRA?: number;
  savingsStreak?: number;
  hasNonMortgageDebt?: boolean;
  maxPositionPercent?: number;
  harvestCount?: number;
  taxHarvestOpportunity?: number;
  emergencyFundTarget?: number;
  emergencyFundCurrent?: number;
  debtTotal?: number;
  debtPaidThisYear?: number;
  investmentReturnYTD?: number;
}

export default function MissionControl({
  netWorth,
  previousNetWorth = 0,
  monthlyExpenses = 5000,
  monthlySavings = 2000,
  savingsRate = 0.2,
  taxAlphaSaved = 0,
  contributions401k = 0,
  contributionsIRA = 0,
  savingsStreak = 0,
  hasNonMortgageDebt = false,
  maxPositionPercent = 15,
  harvestCount = 0,
  taxHarvestOpportunity = 0,
  emergencyFundTarget = 15000,
  emergencyFundCurrent = 15000,
  debtTotal = 0,
  debtPaidThisYear = 0,
  investmentReturnYTD = 0.05,
}: MissionControlProps) {
  const [showCelebration, setShowCelebration] = useState<CelebrationEvent | null>(null);
  const [confetti, setConfetti] = useState(false);

  // Calculate gamification metrics
  const wealthVelocity = calculateWealthVelocity(
    savingsRate,
    investmentReturnYTD,
    debtTotal > 0 ? debtPaidThisYear / debtTotal : 0,
    taxAlphaSaved,
    savingsStreak
  );

  const fiCountdown = calculateFICountdown(
    netWorth,
    monthlyExpenses,
    monthlySavings
  );

  const achievements = checkAchievements(
    netWorth,
    taxAlphaSaved,
    savingsStreak,
    contributions401k,
    contributionsIRA,
    hasNonMortgageDebt,
    maxPositionPercent,
    harvestCount
  );

  const missions = getActiveMissions(
    contributions401k,
    emergencyFundTarget,
    emergencyFundCurrent,
    taxHarvestOpportunity,
    debtTotal,
    debtPaidThisYear
  );

  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const inProgressAchievements = achievements.filter(a => !a.unlockedAt && (a.progress || 0) > 0);

  // Check for celebrations on mount/update
  useEffect(() => {
    // Random confetti on login (5% chance if net worth is up)
    if (netWorth > previousNetWorth && Math.random() < 0.05) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 3000);
    }
  }, [netWorth, previousNetWorth]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(0)}`;
  };

  const formatDays = (days: number) => {
    if (days >= 365) {
      const years = Math.floor(days / 365);
      const remainingDays = days % 365;
      return `${years}y ${Math.round(remainingDays / 30)}m`;
    }
    return `${days} days`;
  };

  return (
    <div className="space-y-6">
      {/* Confetti Effect */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-confetti"
                style={{
                  backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][i % 5],
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`bg-[#12121a] border ${RARITY_COLORS[showCelebration.rarity || 'rare'].border} rounded-3xl p-8 max-w-md w-full text-center ${RARITY_COLORS[showCelebration.rarity || 'rare'].glow}`}>
            <div className="text-6xl mb-4 animate-bounce">{showCelebration.icon}</div>
            <h2 className="text-3xl font-bold mb-2">{showCelebration.title}</h2>
            <p className="text-gray-400 mb-4">{showCelebration.subtitle}</p>
            {showCelebration.quote && (
              <p className="text-sm text-indigo-400 italic mb-6">"{showCelebration.quote}"</p>
            )}
            <button
              onClick={() => setShowCelebration(null)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-medium transition"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Mission Control Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 overflow-hidden relative">
        {/* Grid lines effect */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-sm font-mono text-gray-400 uppercase tracking-wider">Maven Mission Control</h2>
            </div>
            <div className="text-xs text-gray-500 font-mono">
              {new Date().toLocaleTimeString()}
            </div>
          </div>

          {/* Main Stats Row */}
          <div className="grid grid-cols-3 gap-6">
            {/* Net Worth */}
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Net Worth</p>
              <p className="text-3xl font-bold text-white font-mono">
                {formatCurrency(netWorth)}
              </p>
              {previousNetWorth > 0 && (
                <p className={`text-sm ${netWorth >= previousNetWorth ? 'text-emerald-400' : 'text-red-400'}`}>
                  {netWorth >= previousNetWorth ? '▲' : '▼'} {formatCurrency(Math.abs(netWorth - previousNetWorth))}
                </p>
              )}
            </div>

            {/* Wealth Velocity */}
            <div className="text-center border-x border-white/10 px-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                <Term id="wealth-velocity">Velocity</Term>
              </p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-3xl font-bold text-indigo-400 font-mono">{wealthVelocity.score}</p>
                <span className={`text-lg ${wealthVelocity.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {wealthVelocity.trend === 'up' ? '↑' : wealthVelocity.trend === 'down' ? '↓' : '→'}
                </span>
              </div>
              <p className="text-xs text-gray-500">Top {100 - wealthVelocity.percentile}%</p>
            </div>

            {/* FI Countdown */}
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                <Term id="fi-countdown">FI Countdown</Term>
              </p>
              <p className="text-3xl font-bold text-purple-400 font-mono">
                {formatDays(fiCountdown.daysRemaining)}
              </p>
              {fiCountdown.changeFromLastMonth !== 0 && (
                <p className={`text-sm ${fiCountdown.changeFromLastMonth < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {fiCountdown.changeFromLastMonth < 0 ? '↓' : '↑'} {Math.abs(fiCountdown.changeFromLastMonth)} days
                </p>
              )}
            </div>
          </div>

          {/* FI Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>FI Progress</span>
              <span>{fiCountdown.progress.toFixed(1)}% to {formatCurrency(fiCountdown.fiNumber)}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000"
                style={{ width: `${fiCountdown.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Active Missions */}
      {missions.length > 0 && (
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>🎯</span> Active Missions
          </h3>
          <div className="space-y-4">
            {missions.map((mission) => {
              const progress = (mission.current / mission.target) * 100;
              return (
                <div key={mission.id}>
                  <div className="flex justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span>{mission.icon}</span>
                      <span className="font-medium">{mission.name}</span>
                    </div>
                    <span className="text-sm text-gray-400">
                      {formatCurrency(mission.current)} / {formatCurrency(mission.target)}
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        mission.category === 'savings' ? 'bg-emerald-500' :
                        mission.category === 'tax' ? 'bg-indigo-500' :
                        mission.category === 'debt' ? 'bg-red-500' :
                        'bg-purple-500'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>🏆</span> Achievements
          <span className="text-sm text-gray-500 font-normal">
            {unlockedAchievements.length} unlocked
          </span>
        </h3>

        {/* Unlocked */}
        {unlockedAchievements.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
            {unlockedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`px-3 py-2 rounded-xl border ${RARITY_COLORS[achievement.rarity].bg} ${RARITY_COLORS[achievement.rarity].border} ${RARITY_COLORS[achievement.rarity].glow} flex items-center gap-2 group relative`}
                title={achievement.description}
              >
                <span className="text-xl">{achievement.icon}</span>
                <span className={`text-sm font-medium ${RARITY_COLORS[achievement.rarity].text}`}>
                  {achievement.name}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* In Progress */}
        {inProgressAchievements.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">In Progress</p>
            {inProgressAchievements.slice(0, 3).map((achievement) => (
              <div key={achievement.id} className="flex items-center gap-3">
                <span className="text-xl opacity-50">{achievement.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">{achievement.name}</span>
                    <span className="text-gray-500">{achievement.progress?.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gray-500 rounded-full"
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Velocity Components (Expandable) */}
      <details className="bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden group">
        <summary className="p-6 cursor-pointer flex items-center justify-between hover:bg-white/5 transition">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span>⚡</span> <Term id="wealth-velocity">Velocity</Term> Breakdown
          </h3>
          <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="px-6 pb-6 space-y-3">
          {Object.entries(wealthVelocity.components).map(([key, value]) => (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-white">{value.toFixed(0)} / 20</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${(value / 20) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </details>

      {/* Tax Alpha Counter */}
      {taxAlphaSaved > 0 && (
        <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-500/20 rounded-2xl p-6 text-center">
          <p className="text-sm text-emerald-400 uppercase tracking-wider mb-1">
            <Term id="tax-alpha">Tax Alpha</Term> Earned
          </p>
          <p className="text-4xl font-bold text-white font-mono">{formatCurrency(taxAlphaSaved)}</p>
          <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden max-w-xs mx-auto">
            <div 
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${Math.min((taxAlphaSaved / 10000) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">{((taxAlphaSaved / 10000) * 100).toFixed(0)}% to Tax Alpha Master</p>
        </div>
      )}

      {/* Streaks */}
      {savingsStreak > 0 && (
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>🔥</span> Streaks
          </h3>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-orange-400 font-mono">{savingsStreak}</div>
            <div>
              <p className="font-medium">Month Savings Streak</p>
              <p className="text-sm text-gray-500">Don't break the chain!</p>
            </div>
          </div>
        </div>
      )}

      {/* Add confetti animation styles */}
      <style jsx global>{`
        @keyframes confetti {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 3s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}
