/**
 * Safe Withdrawal Rate Calculator
 * 
 * Implements multiple withdrawal strategies and calculates safe withdrawal rates
 * based on historical data and Monte Carlo simulation.
 */

import { SP500_ANNUAL_RETURNS, BOND_ANNUAL_RETURNS, INFLATION_ANNUAL } from './historical-returns';

export interface WithdrawalStrategy {
  name: string;
  description: string;
  calculate: (params: WithdrawalParams) => number;
}

export interface WithdrawalParams {
  portfolioValue: number;
  baseWithdrawalRate: number;
  currentYear: number;
  portfolioReturn: number;
  inflation: number;
  floorRate?: number;
  ceilingRate?: number;
  previousWithdrawal?: number;
  initialPortfolioValue?: number;
}

/**
 * Fixed Percentage Withdrawal
 * Classic 4% rule - withdraw fixed percentage of initial portfolio adjusted for inflation
 */
export const FIXED_PERCENTAGE: WithdrawalStrategy = {
  name: 'Fixed Percentage',
  description: 'Withdraw a fixed percentage of initial portfolio, adjusted for inflation each year',
  calculate: (params) => {
    const initial = params.initialPortfolioValue || params.portfolioValue;
    return initial * params.baseWithdrawalRate * Math.pow(1 + 0.025, params.currentYear);
  },
};

/**
 * Constant Dollar Withdrawal
 * Same dollar amount every year (no inflation adjustment)
 */
export const CONSTANT_DOLLAR: WithdrawalStrategy = {
  name: 'Constant Dollar',
  description: 'Withdraw the same dollar amount every year',
  calculate: (params) => {
    const initial = params.initialPortfolioValue || params.portfolioValue;
    return initial * params.baseWithdrawalRate;
  },
};

/**
 * Guardrails Strategy
 * Adjust spending when withdrawal rate hits thresholds
 */
export const GUARDRAILS: WithdrawalStrategy = {
  name: 'Guardrails',
  description: 'Adjust spending by 10% when withdrawal rate exceeds floor or ceiling',
  calculate: (params) => {
    const { portfolioValue, previousWithdrawal, floorRate = 0.03, ceilingRate = 0.05 } = params;
    
    if (!previousWithdrawal) {
      return portfolioValue * params.baseWithdrawalRate;
    }
    
    const currentRate = previousWithdrawal / portfolioValue;
    
    if (currentRate > ceilingRate) {
      // Cut spending by 10%
      return previousWithdrawal * 0.90;
    } else if (currentRate < floorRate) {
      // Increase spending by 10%
      return previousWithdrawal * 1.10;
    }
    
    // Adjust for inflation
    return previousWithdrawal * (1 + params.inflation);
  },
};

/**
 * Percentage of Portfolio
 * Withdraw fixed percentage of current portfolio value (variable income)
 */
export const PERCENTAGE_OF_PORTFOLIO: WithdrawalStrategy = {
  name: 'Percentage of Portfolio',
  description: 'Withdraw a fixed percentage of current portfolio value each year',
  calculate: (params) => {
    return params.portfolioValue * params.baseWithdrawalRate;
  },
};

/**
 * Required Minimum Distribution (RMD) Style
 * Divide portfolio by life expectancy
 */
export const RMD_STYLE: WithdrawalStrategy = {
  name: 'RMD Style',
  description: 'Divide portfolio by remaining years (like RMDs)',
  calculate: (params) => {
    const remainingYears = Math.max(1, 30 - params.currentYear); // Assume 30-year retirement
    return params.portfolioValue / remainingYears;
  },
};

/**
 * Floor and Ceiling
 * Percentage of portfolio with min/max bounds
 */
export const FLOOR_CEILING: WithdrawalStrategy = {
  name: 'Floor & Ceiling',
  description: 'Percentage of portfolio with minimum and maximum bounds',
  calculate: (params) => {
    const { portfolioValue, baseWithdrawalRate, initialPortfolioValue, inflation, currentYear } = params;
    
    const initial = initialPortfolioValue || portfolioValue;
    const baseWithdrawal = portfolioValue * baseWithdrawalRate;
    
    // Floor: 80% of initial withdrawal (inflation adjusted)
    const floor = initial * baseWithdrawalRate * 0.80 * Math.pow(1 + inflation, currentYear);
    // Ceiling: 120% of initial withdrawal (inflation adjusted)
    const ceiling = initial * baseWithdrawalRate * 1.20 * Math.pow(1 + inflation, currentYear);
    
    return Math.max(floor, Math.min(ceiling, baseWithdrawal));
  },
};

export const WITHDRAWAL_STRATEGIES: WithdrawalStrategy[] = [
  FIXED_PERCENTAGE,
  GUARDRAILS,
  PERCENTAGE_OF_PORTFOLIO,
  FLOOR_CEILING,
  RMD_STYLE,
  CONSTANT_DOLLAR,
];

/**
 * Calculate historical safe withdrawal rates using actual market data
 */
export interface HistoricalSWRResult {
  startYear: number;
  endYear: number;
  duration: number;
  maxSafeRate: number;
  endingBalance: number;
  worstYear: { year: number; balance: number };
}

export function calculateHistoricalSWR(
  stockAllocation: number = 0.60,
  duration: number = 30,
  testRates: number[] = [0.03, 0.035, 0.04, 0.045, 0.05, 0.055, 0.06]
): HistoricalSWRResult[] {
  const results: HistoricalSWRResult[] = [];
  const bondAllocation = 1 - stockAllocation;
  
  // Test each starting year
  const maxStartYear = SP500_ANNUAL_RETURNS.length - duration;
  
  for (let startIdx = 0; startIdx < maxStartYear; startIdx++) {
    const startYear = 1928 + startIdx;
    
    // Find maximum safe withdrawal rate for this period
    let maxSafeRate = 0;
    let bestEndingBalance = 0;
    let worstYear = { year: startYear, balance: 1000000 };
    
    for (const rate of testRates) {
      let balance = 1000000; // $1M initial
      let withdrawal = balance * rate;
      let survived = true;
      let currentWorstYear = { year: startYear, balance: balance };
      
      for (let year = 0; year < duration; year++) {
        const stockReturn = SP500_ANNUAL_RETURNS[startIdx + year] || 0.07;
        const bondReturn = BOND_ANNUAL_RETURNS[startIdx + year] || 0.03;
        const inflation = INFLATION_ANNUAL[startIdx + year] || 0.025;
        
        // Portfolio return
        const portfolioReturn = stockAllocation * stockReturn + bondAllocation * bondReturn;
        
        // Withdraw first
        balance -= withdrawal;
        
        // Then grow
        balance *= (1 + portfolioReturn);
        
        // Adjust withdrawal for inflation
        withdrawal *= (1 + inflation);
        
        // Track worst year
        if (balance < currentWorstYear.balance) {
          currentWorstYear = { year: startYear + year, balance };
        }
        
        // Check if depleted
        if (balance <= 0) {
          survived = false;
          break;
        }
      }
      
      if (survived && rate > maxSafeRate) {
        maxSafeRate = rate;
        bestEndingBalance = balance;
        worstYear = currentWorstYear;
      }
    }
    
    results.push({
      startYear,
      endYear: startYear + duration,
      duration,
      maxSafeRate,
      endingBalance: bestEndingBalance,
      worstYear,
    });
  }
  
  return results;
}

/**
 * Get the safe withdrawal rate percentiles from historical data
 */
export function getSWRPercentiles(
  stockAllocation: number = 0.60,
  duration: number = 30
): {
  worst: number;
  p10: number;
  p25: number;
  median: number;
  p75: number;
  p90: number;
  best: number;
  avgEndingBalance: number;
} {
  const results = calculateHistoricalSWR(stockAllocation, duration);
  const rates = results.map(r => r.maxSafeRate).sort((a, b) => a - b);
  const balances = results.map(r => r.endingBalance);
  
  const getPercentile = (arr: number[], p: number) => arr[Math.floor(arr.length * p)];
  
  return {
    worst: rates[0],
    p10: getPercentile(rates, 0.10),
    p25: getPercentile(rates, 0.25),
    median: getPercentile(rates, 0.50),
    p75: getPercentile(rates, 0.75),
    p90: getPercentile(rates, 0.90),
    best: rates[rates.length - 1],
    avgEndingBalance: balances.reduce((a, b) => a + b, 0) / balances.length,
  };
}

/**
 * Sequence of Returns Risk Analysis
 * Shows how the order of returns affects outcomes
 */
export function analyzeSequenceRisk(
  returns: number[],
  withdrawalRate: number = 0.04,
  duration: number = 30
): {
  actualOrder: { finalBalance: number; survived: boolean };
  reverseOrder: { finalBalance: number; survived: boolean };
  bestCase: { finalBalance: number; survived: boolean };
  worstCase: { finalBalance: number; survived: boolean };
  sequenceImpact: number; // % difference between worst and best
} {
  const simulate = (orderedReturns: number[]) => {
    let balance = 1000000;
    let withdrawal = balance * withdrawalRate;
    
    for (let year = 0; year < Math.min(duration, orderedReturns.length); year++) {
      balance -= withdrawal;
      balance *= (1 + orderedReturns[year]);
      withdrawal *= 1.025; // Assume 2.5% inflation
      
      if (balance <= 0) {
        return { finalBalance: 0, survived: false };
      }
    }
    
    return { finalBalance: balance, survived: true };
  };
  
  // Actual order
  const actualOrder = simulate(returns.slice(0, duration));
  
  // Reverse order
  const reverseOrder = simulate(returns.slice(0, duration).reverse());
  
  // Best case (sorted descending - best returns first)
  const bestCase = simulate([...returns.slice(0, duration)].sort((a, b) => b - a));
  
  // Worst case (sorted ascending - worst returns first)
  const worstCase = simulate([...returns.slice(0, duration)].sort((a, b) => a - b));
  
  // Calculate sequence impact
  const sequenceImpact = bestCase.finalBalance > 0 && worstCase.finalBalance > 0
    ? (bestCase.finalBalance - worstCase.finalBalance) / bestCase.finalBalance
    : 1;
  
  return {
    actualOrder,
    reverseOrder,
    bestCase,
    worstCase,
    sequenceImpact,
  };
}

/**
 * Calculate the "guardrails" thresholds for a given starting withdrawal rate
 */
export function calculateGuardrails(
  initialWithdrawalRate: number = 0.04,
  adjustmentPercent: number = 0.10
): {
  initialRate: number;
  floor: number;
  ceiling: number;
  cutTrigger: number;
  raiseTrigger: number;
} {
  return {
    initialRate: initialWithdrawalRate,
    floor: initialWithdrawalRate * (1 - adjustmentPercent), // e.g., 3.6% for 4% start
    ceiling: initialWithdrawalRate * (1 + adjustmentPercent), // e.g., 4.4% for 4% start
    cutTrigger: initialWithdrawalRate * 1.25, // Cut when rate exceeds 5%
    raiseTrigger: initialWithdrawalRate * 0.75, // Raise when rate below 3%
  };
}
