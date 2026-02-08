/**
 * MAVEN GAMIFICATION ENGINE
 * "Make the mundane feel epic"
 */

// ============================================
// TYPES
// ============================================

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'milestone' | 'optimization' | 'streak' | 'secret';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
  progress?: number; // 0-100
  requirement: number;
  current?: number;
}

export interface Streak {
  id: string;
  name: string;
  icon: string;
  current: number;
  best: number;
  lastUpdated: Date;
}

export interface Mission {
  id: string;
  name: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  unit: string;
  category: 'savings' | 'tax' | 'debt' | 'investment';
}

export interface WealthVelocity {
  score: number;
  trend: 'up' | 'down' | 'stable';
  percentile: number;
  components: {
    savingsRate: number;
    investmentGrowth: number;
    debtPaydown: number;
    taxEfficiency: number;
    consistency: number;
  };
}

export interface FICountdown {
  targetDate: Date;
  daysRemaining: number;
  changeFromLastMonth: number;
  fiNumber: number;
  currentNetWorth: number;
  progress: number; // 0-100
}

// ============================================
// ACHIEVEMENTS DEFINITIONS
// ============================================

export const ACHIEVEMENTS: Omit<Achievement, 'unlockedAt' | 'current'>[] = [
  // Milestone Achievements
  {
    id: 'first_10k',
    name: 'Getting Started',
    description: 'Reach $10,000 net worth',
    icon: '🌱',
    category: 'milestone',
    rarity: 'common',
    requirement: 10000,
  },
  {
    id: 'first_50k',
    name: 'Building Momentum',
    description: 'Reach $50,000 net worth',
    icon: '📈',
    category: 'milestone',
    rarity: 'common',
    requirement: 50000,
  },
  {
    id: 'first_100k',
    name: 'First 100K',
    description: 'The hardest $100K — Charlie Munger',
    icon: '🎯',
    category: 'milestone',
    rarity: 'uncommon',
    requirement: 100000,
  },
  {
    id: 'first_250k',
    name: 'Quarter Million',
    description: 'Reach $250,000 net worth',
    icon: '💪',
    category: 'milestone',
    rarity: 'rare',
    requirement: 250000,
  },
  {
    id: 'first_500k',
    name: 'Half Way There',
    description: 'Reach $500,000 net worth',
    icon: '🏔️',
    category: 'milestone',
    rarity: 'rare',
    requirement: 500000,
  },
  {
    id: 'millionaire',
    name: 'Seven Figures',
    description: 'Reach $1,000,000 net worth',
    icon: '👑',
    category: 'milestone',
    rarity: 'epic',
    requirement: 1000000,
  },
  {
    id: 'double_comma',
    name: 'Double Comma Club',
    description: 'Reach $10,000,000 net worth',
    icon: '🏆',
    category: 'milestone',
    rarity: 'legendary',
    requirement: 10000000,
  },

  // Optimization Achievements
  {
    id: 'tax_hunter',
    name: 'Tax Hunter',
    description: 'Complete your first tax-loss harvest',
    icon: '🎣',
    category: 'optimization',
    rarity: 'uncommon',
    requirement: 1,
  },
  {
    id: 'tax_alpha_1k',
    name: 'Tax Optimizer',
    description: 'Save $1,000 through tax optimization',
    icon: '💰',
    category: 'optimization',
    rarity: 'uncommon',
    requirement: 1000,
  },
  {
    id: 'tax_alpha_5k',
    name: 'Tax Strategist',
    description: 'Save $5,000 through tax optimization',
    icon: '🧮',
    category: 'optimization',
    rarity: 'rare',
    requirement: 5000,
  },
  {
    id: 'tax_alpha_10k',
    name: 'Tax Alpha Master',
    description: 'Save $10,000 through tax optimization',
    icon: '🧙',
    category: 'optimization',
    rarity: 'epic',
    requirement: 10000,
  },
  {
    id: 'maxed_401k',
    name: 'Maxed Out',
    description: 'Max out your 401(k) contribution',
    icon: '💪',
    category: 'optimization',
    rarity: 'uncommon',
    requirement: 23000, // 2024 limit
  },
  {
    id: 'maxed_ira',
    name: 'IRA Champion',
    description: 'Max out your IRA contribution',
    icon: '🏅',
    category: 'optimization',
    rarity: 'common',
    requirement: 7000, // 2024 limit
  },
  {
    id: 'debt_slayer',
    name: 'Debt Slayer',
    description: 'Pay off all non-mortgage debt',
    icon: '⚔️',
    category: 'optimization',
    rarity: 'rare',
    requirement: 1,
  },
  {
    id: 'diversified',
    name: 'Diversified',
    description: 'No single position over 20% of portfolio',
    icon: '🎨',
    category: 'optimization',
    rarity: 'common',
    requirement: 1,
  },

  // Streak Achievements
  {
    id: 'streak_3',
    name: 'Hat Trick',
    description: 'Maintain a 3-month savings streak',
    icon: '🔥',
    category: 'streak',
    rarity: 'common',
    requirement: 3,
  },
  {
    id: 'streak_6',
    name: 'On Fire',
    description: 'Maintain a 6-month savings streak',
    icon: '🔥🔥',
    category: 'streak',
    rarity: 'uncommon',
    requirement: 6,
  },
  {
    id: 'streak_12',
    name: 'Unstoppable',
    description: 'Maintain a 12-month savings streak',
    icon: '🔥🔥🔥',
    category: 'streak',
    rarity: 'rare',
    requirement: 12,
  },
  {
    id: 'streak_24',
    name: 'Compound Commander',
    description: 'Maintain a 24-month savings streak',
    icon: '🚀',
    category: 'streak',
    rarity: 'epic',
    requirement: 24,
  },
  
  // Secret Achievements
  {
    id: 'diamond_hands',
    name: 'Diamond Hands',
    description: 'Don\'t sell during a 10%+ market drop',
    icon: '💎',
    category: 'secret',
    rarity: 'rare',
    requirement: 1,
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Check Maven before 6 AM',
    icon: '🐦',
    category: 'secret',
    rarity: 'common',
    requirement: 1,
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Check Maven after midnight',
    icon: '🦉',
    category: 'secret',
    rarity: 'common',
    requirement: 1,
  },
  {
    id: 'birthday',
    name: 'Birthday Bonus',
    description: 'Log in on your birthday',
    icon: '🎂',
    category: 'secret',
    rarity: 'uncommon',
    requirement: 1,
  },
  {
    id: 'konami',
    name: 'Retro Gamer',
    description: '↑↑↓↓←→←→BA',
    icon: '🎮',
    category: 'secret',
    rarity: 'rare',
    requirement: 1,
  },
  {
    id: 'tax_day_survivor',
    name: 'Tax Day Survivor',
    description: 'File taxes before April 15',
    icon: '📋',
    category: 'secret',
    rarity: 'common',
    requirement: 1,
  },
  {
    id: 'escape_velocity',
    name: 'Escape Velocity',
    description: 'Reach your FI number',
    icon: '🚀',
    category: 'milestone',
    rarity: 'legendary',
    requirement: 1,
  },
];

// ============================================
// CALCULATIONS
// ============================================

/**
 * Calculate Wealth Velocity score (0-100)
 * Higher = building wealth faster
 */
export function calculateWealthVelocity(
  savingsRate: number, // as decimal (0.2 = 20%)
  investmentReturnYTD: number, // as decimal
  debtPaydownRate: number, // monthly debt payment / total debt
  taxAlphaSaved: number, // dollar amount
  monthsConsistent: number // months hitting savings target
): WealthVelocity {
  // Normalize each component to 0-20 scale
  const savingsScore = Math.min(savingsRate * 100, 20); // 20% savings = max
  const investmentScore = Math.min((investmentReturnYTD + 0.1) * 100, 20); // -10% to +10% normalized
  const debtScore = Math.min(debtPaydownRate * 200, 20); // 10% paydown = max
  const taxScore = Math.min(taxAlphaSaved / 500, 20); // $10k = max
  const consistencyScore = Math.min(monthsConsistent / 0.6, 20); // 12 months = max

  const score = Math.round(savingsScore + investmentScore + debtScore + taxScore + consistencyScore);
  
  // Determine percentile (simplified - would use real data in production)
  const percentile = Math.min(Math.round(score * 1.5), 99);

  return {
    score,
    trend: 'up', // Would calculate from historical data
    percentile,
    components: {
      savingsRate: savingsScore,
      investmentGrowth: investmentScore,
      debtPaydown: debtScore,
      taxEfficiency: taxScore,
      consistency: consistencyScore,
    },
  };
}

/**
 * Calculate Financial Independence countdown
 */
export function calculateFICountdown(
  currentNetWorth: number,
  monthlyExpenses: number,
  monthlySavings: number,
  expectedReturnRate: number = 0.07 // 7% default
): FICountdown {
  // FI number = 25x annual expenses (4% rule)
  const fiNumber = monthlyExpenses * 12 * 25;
  
  if (currentNetWorth >= fiNumber) {
    return {
      targetDate: new Date(),
      daysRemaining: 0,
      changeFromLastMonth: 0,
      fiNumber,
      currentNetWorth,
      progress: 100,
    };
  }

  // Calculate years to FI using compound growth formula
  // FV = PV(1+r)^n + PMT[((1+r)^n - 1) / r]
  // Solve for n iteratively
  let years = 0;
  let projectedWealth = currentNetWorth;
  const annualSavings = monthlySavings * 12;
  
  while (projectedWealth < fiNumber && years < 100) {
    projectedWealth = projectedWealth * (1 + expectedReturnRate) + annualSavings;
    years++;
  }

  const targetDate = new Date();
  targetDate.setFullYear(targetDate.getFullYear() + years);

  const daysRemaining = Math.round(years * 365);
  const progress = Math.min((currentNetWorth / fiNumber) * 100, 100);

  return {
    targetDate,
    daysRemaining,
    changeFromLastMonth: 0, // Would calculate from historical
    fiNumber,
    currentNetWorth,
    progress,
  };
}

/**
 * Check which achievements are unlocked
 */
export function checkAchievements(
  netWorth: number,
  taxAlphaSaved: number,
  savingsStreak: number,
  contributions401k: number,
  contributionsIRA: number,
  hasNonMortgageDebt: boolean,
  maxPositionPercent: number,
  harvestCount: number
): Achievement[] {
  const unlocked: Achievement[] = [];

  ACHIEVEMENTS.forEach((achievement) => {
    let isUnlocked = false;
    let current = 0;

    switch (achievement.id) {
      // Net worth milestones
      case 'first_10k':
      case 'first_50k':
      case 'first_100k':
      case 'first_250k':
      case 'first_500k':
      case 'millionaire':
      case 'double_comma':
        current = netWorth;
        isUnlocked = netWorth >= achievement.requirement;
        break;

      // Tax optimization
      case 'tax_hunter':
        current = harvestCount;
        isUnlocked = harvestCount >= 1;
        break;
      case 'tax_alpha_1k':
      case 'tax_alpha_5k':
      case 'tax_alpha_10k':
        current = taxAlphaSaved;
        isUnlocked = taxAlphaSaved >= achievement.requirement;
        break;

      // Contributions
      case 'maxed_401k':
        current = contributions401k;
        isUnlocked = contributions401k >= achievement.requirement;
        break;
      case 'maxed_ira':
        current = contributionsIRA;
        isUnlocked = contributionsIRA >= achievement.requirement;
        break;

      // Debt
      case 'debt_slayer':
        current = hasNonMortgageDebt ? 0 : 1;
        isUnlocked = !hasNonMortgageDebt;
        break;

      // Diversification
      case 'diversified':
        current = maxPositionPercent < 20 ? 1 : 0;
        isUnlocked = maxPositionPercent < 20;
        break;

      // Streaks
      case 'streak_3':
      case 'streak_6':
      case 'streak_12':
      case 'streak_24':
        current = savingsStreak;
        isUnlocked = savingsStreak >= achievement.requirement;
        break;
    }

    if (isUnlocked || current > 0) {
      unlocked.push({
        ...achievement,
        unlockedAt: isUnlocked ? new Date() : undefined,
        current,
        progress: Math.min((current / achievement.requirement) * 100, 100),
      });
    }
  });

  return unlocked;
}

/**
 * Get active missions based on user state
 */
export function getActiveMissions(
  contributions401k: number,
  emergencyFundTarget: number,
  emergencyFundCurrent: number,
  taxHarvestOpportunity: number,
  debtTotal: number,
  debtPaidThisYear: number
): Mission[] {
  const missions: Mission[] = [];

  // 401k Mission
  const max401k = 23000; // 2024 limit
  if (contributions401k < max401k) {
    missions.push({
      id: 'max_401k',
      name: 'Max 401(k)',
      description: 'Maximize your tax-advantaged savings',
      icon: '💼',
      target: max401k,
      current: contributions401k,
      unit: '$',
      category: 'savings',
    });
  }

  // Emergency Fund Mission
  if (emergencyFundCurrent < emergencyFundTarget) {
    missions.push({
      id: 'emergency_fund',
      name: 'Emergency Fund',
      description: '3-6 months of expenses',
      icon: '🛡️',
      target: emergencyFundTarget,
      current: emergencyFundCurrent,
      unit: '$',
      category: 'savings',
    });
  }

  // Tax Harvest Mission
  if (taxHarvestOpportunity > 500) {
    missions.push({
      id: 'tax_harvest',
      name: 'Tax Harvest',
      description: 'Capture available tax losses',
      icon: '🎣',
      target: taxHarvestOpportunity,
      current: 0,
      unit: '$',
      category: 'tax',
    });
  }

  // Debt Payoff Mission
  if (debtTotal > 0) {
    missions.push({
      id: 'debt_freedom',
      name: 'Debt Freedom',
      description: 'Eliminate non-mortgage debt',
      icon: '⚔️',
      target: debtTotal,
      current: debtPaidThisYear,
      unit: '$',
      category: 'debt',
    });
  }

  return missions;
}

// ============================================
// RARITY COLORS
// ============================================

export const RARITY_COLORS = {
  common: {
    bg: 'bg-gray-500/20',
    border: 'border-gray-500/30',
    text: 'text-gray-400',
    glow: '',
  },
  uncommon: {
    bg: 'bg-green-500/20',
    border: 'border-green-500/30',
    text: 'text-green-400',
    glow: '',
  },
  rare: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/20',
  },
  epic: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    glow: 'shadow-purple-500/30',
  },
  legendary: {
    bg: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/40 shadow-lg',
  },
};

// ============================================
// CELEBRATION TRIGGERS
// ============================================

export interface CelebrationEvent {
  type: 'achievement' | 'milestone' | 'streak' | 'launch';
  title: string;
  subtitle: string;
  icon: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  quote?: string;
  stats?: { label: string; value: string }[];
}

export function checkForCelebrations(
  previousNetWorth: number,
  currentNetWorth: number,
  previousAchievements: string[],
  currentAchievements: Achievement[]
): CelebrationEvent | null {
  // Check for newly unlocked achievements
  for (const achievement of currentAchievements) {
    if (achievement.unlockedAt && !previousAchievements.includes(achievement.id)) {
      return {
        type: 'achievement',
        title: achievement.name,
        subtitle: achievement.description,
        icon: achievement.icon,
        rarity: achievement.rarity,
      };
    }
  }

  // Check for net worth milestones
  const milestones = [10000, 25000, 50000, 100000, 250000, 500000, 1000000, 5000000, 10000000];
  for (const milestone of milestones) {
    if (previousNetWorth < milestone && currentNetWorth >= milestone) {
      return {
        type: 'launch',
        title: '🚀 LAUNCH DETECTED',
        subtitle: `You just hit $${(milestone / 1000).toFixed(0)}K net worth!`,
        icon: '🚀',
        rarity: milestone >= 1000000 ? 'legendary' : milestone >= 100000 ? 'epic' : 'rare',
        quote: milestone === 100000 
          ? '"The first $100K is the hardest" — Charlie Munger'
          : milestone === 1000000 
          ? '"A million dollars isn\'t cool. You know what\'s cool? A billion dollars." — Sean Parker'
          : undefined,
      };
    }
  }

  return null;
}

// ============================================
// EASTER EGGS
// ============================================

export function checkEasterEgg(sequence: string[]): string | null {
  const konamiCode = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a'];
  
  if (sequence.length >= 10) {
    const lastTen = sequence.slice(-10);
    if (JSON.stringify(lastTen) === JSON.stringify(konamiCode)) {
      return 'konami';
    }
  }
  
  return null;
}

export function checkTimeBasedEasterEgg(): string | null {
  const now = new Date();
  const hour = now.getHours();
  
  if (hour < 6) return 'early_bird';
  if (hour >= 24 || hour < 1) return 'night_owl';
  
  // Check for special dates
  const month = now.getMonth();
  const day = now.getDate();
  
  if (month === 3 && day === 15) return 'tax_day_survivor'; // April 15
  
  return null;
}
