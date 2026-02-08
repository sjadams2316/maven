/**
 * Sensitivity Analysis for Retirement Planning
 * 
 * Tests how small changes in assumptions affect outcomes.
 * Helps identify which variables matter most.
 */

import { runMonteCarloSimulation, MonteCarloParams, MonteCarloResult } from './monte-carlo-engine';

export interface SensitivityResult {
  variable: string;
  baseValue: number;
  testValues: number[];
  results: {
    value: number;
    successRate: number;
    medianEnding: number;
    p10Ending: number;
  }[];
  sensitivity: number; // How much success rate changes per unit change
}

/**
 * Run sensitivity analysis on a single variable
 */
export async function analyzeSensitivity(
  baseParams: MonteCarloParams,
  variable: keyof MonteCarloParams,
  testValues: number[],
  simulations: number = 500
): Promise<SensitivityResult> {
  const results: SensitivityResult['results'] = [];
  
  for (const value of testValues) {
    const params = { ...baseParams, [variable]: value };
    const result = runMonteCarloSimulation(params);
    
    results.push({
      value,
      successRate: result.successRate,
      medianEnding: result.percentiles.p50,
      p10Ending: result.percentiles.p10,
    });
  }
  
  // Calculate sensitivity (change in success rate per unit change)
  const baseIdx = Math.floor(testValues.length / 2);
  const baseSuccess = results[baseIdx].successRate;
  const sensitivity = testValues.length > 1
    ? (results[results.length - 1].successRate - results[0].successRate) / 
      (testValues[testValues.length - 1] - testValues[0])
    : 0;
  
  return {
    variable: variable as string,
    baseValue: testValues[baseIdx],
    testValues,
    results,
    sensitivity,
  };
}

/**
 * Run comprehensive sensitivity analysis on all major variables
 */
export function runComprehensiveSensitivity(
  baseParams: MonteCarloParams
): SensitivityResult[] {
  const analyses: SensitivityResult[] = [];
  
  // Withdrawal rate sensitivity (most impactful)
  const withdrawalRates = [0.03, 0.035, 0.04, 0.045, 0.05, 0.055, 0.06];
  analyses.push(analyzeSensitivitySync(baseParams, 'withdrawalRate', withdrawalRates));
  
  // Stock allocation sensitivity
  const stockAllocations = [0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
  analyses.push(analyzeSensitivitySync(baseParams, 'stockAllocation', stockAllocations));
  
  // Retirement duration
  const durations = [20, 25, 30, 35, 40, 45];
  analyses.push(analyzeSensitivitySync(baseParams, 'years', durations));
  
  // Expected return (equity)
  const returns = [0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.10];
  analyses.push(analyzeSensitivitySync(baseParams, 'expectedReturn', returns));
  
  // Inflation
  const inflations = [0.02, 0.025, 0.03, 0.035, 0.04, 0.045];
  analyses.push(analyzeSensitivitySync(baseParams, 'inflation', inflations));
  
  return analyses;
}

function analyzeSensitivitySync(
  baseParams: MonteCarloParams,
  variable: keyof MonteCarloParams,
  testValues: number[]
): SensitivityResult {
  const results: SensitivityResult['results'] = [];
  
  for (const value of testValues) {
    const params = { ...baseParams, [variable]: value };
    const result = runMonteCarloSimulation(params);
    
    results.push({
      value,
      successRate: result.successRate,
      medianEnding: result.percentiles.p50,
      p10Ending: result.percentiles.p10,
    });
  }
  
  const sensitivity = testValues.length > 1
    ? (results[results.length - 1].successRate - results[0].successRate) / 
      (testValues[testValues.length - 1] - testValues[0])
    : 0;
  
  return {
    variable: variable as string,
    baseValue: baseParams[variable] as number,
    testValues,
    results,
    sensitivity,
  };
}

/**
 * Calculate tornado chart data (shows which variables have most impact)
 */
export interface TornadoBar {
  variable: string;
  displayName: string;
  lowValue: number;
  highValue: number;
  lowSuccessRate: number;
  highSuccessRate: number;
  baseSuccessRate: number;
  impact: number; // Total spread in success rate
}

export function calculateTornadoChart(
  baseParams: MonteCarloParams,
  baseResult: MonteCarloResult
): TornadoBar[] {
  const bars: TornadoBar[] = [];
  
  // Define variable ranges (±20% or reasonable bounds)
  const variables: { 
    key: keyof MonteCarloParams; 
    displayName: string; 
    lowMult: number; 
    highMult: number;
    format?: 'percent' | 'years' | 'dollars';
  }[] = [
    { key: 'withdrawalRate', displayName: 'Withdrawal Rate', lowMult: 0.75, highMult: 1.25, format: 'percent' },
    { key: 'stockAllocation', displayName: 'Stock Allocation', lowMult: 0.7, highMult: 1.3, format: 'percent' },
    { key: 'years', displayName: 'Retirement Length', lowMult: 0.8, highMult: 1.2, format: 'years' },
    { key: 'expectedReturn', displayName: 'Expected Return', lowMult: 0.7, highMult: 1.3, format: 'percent' },
    { key: 'inflation', displayName: 'Inflation Rate', lowMult: 0.7, highMult: 1.5, format: 'percent' },
    { key: 'initialPortfolio', displayName: 'Starting Portfolio', lowMult: 0.8, highMult: 1.2, format: 'dollars' },
  ];
  
  for (const { key, displayName, lowMult, highMult } of variables) {
    const baseValue = baseParams[key] as number;
    const lowValue = baseValue * lowMult;
    const highValue = baseValue * highMult;
    
    // Run simulations for low and high values
    const lowResult = runMonteCarloSimulation({ ...baseParams, [key]: lowValue });
    const highResult = runMonteCarloSimulation({ ...baseParams, [key]: highValue });
    
    bars.push({
      variable: key,
      displayName,
      lowValue,
      highValue,
      lowSuccessRate: lowResult.successRate,
      highSuccessRate: highResult.successRate,
      baseSuccessRate: baseResult.successRate,
      impact: Math.abs(highResult.successRate - lowResult.successRate),
    });
  }
  
  // Sort by impact (most impactful first)
  return bars.sort((a, b) => b.impact - a.impact);
}

/**
 * Two-way sensitivity table (vary two variables simultaneously)
 */
export interface TwoWaySensitivity {
  variable1: string;
  variable2: string;
  values1: number[];
  values2: number[];
  successRates: number[][]; // [var1Index][var2Index]
}

export function runTwoWaySensitivity(
  baseParams: MonteCarloParams,
  var1: keyof MonteCarloParams,
  values1: number[],
  var2: keyof MonteCarloParams,
  values2: number[]
): TwoWaySensitivity {
  const successRates: number[][] = [];
  
  for (let i = 0; i < values1.length; i++) {
    successRates[i] = [];
    for (let j = 0; j < values2.length; j++) {
      const params = { 
        ...baseParams, 
        [var1]: values1[i],
        [var2]: values2[j]
      };
      const result = runMonteCarloSimulation(params);
      successRates[i][j] = result.successRate;
    }
  }
  
  return {
    variable1: var1,
    variable2: var2,
    values1,
    values2,
    successRates,
  };
}

/**
 * Break-even analysis: find the threshold where success drops below target
 */
export function findBreakeven(
  baseParams: MonteCarloParams,
  variable: keyof MonteCarloParams,
  targetSuccessRate: number = 0.9,
  searchMin: number,
  searchMax: number,
  precision: number = 0.001
): number | null {
  let low = searchMin;
  let high = searchMax;
  
  // Binary search for break-even point
  while (high - low > precision) {
    const mid = (low + high) / 2;
    const result = runMonteCarloSimulation({ ...baseParams, [variable]: mid });
    
    if (result.successRate >= targetSuccessRate) {
      // Success rate is still good, move toward riskier end
      if (variable === 'withdrawalRate' || variable === 'years' || variable === 'inflation') {
        low = mid; // Higher is riskier
      } else {
        high = mid; // Lower is riskier
      }
    } else {
      // Success rate dropped below target
      if (variable === 'withdrawalRate' || variable === 'years' || variable === 'inflation') {
        high = mid;
      } else {
        low = mid;
      }
    }
  }
  
  return (low + high) / 2;
}

/**
 * Generate plain-language insights from sensitivity analysis
 */
export function generateSensitivityInsights(
  tornado: TornadoBar[],
  baseResult: MonteCarloResult
): string[] {
  const insights: string[] = [];
  
  // Most impactful variable
  const mostImpactful = tornado[0];
  insights.push(
    `${mostImpactful.displayName} has the biggest impact on your success rate. ` +
    `Varying it by ±20% changes success from ${(mostImpactful.lowSuccessRate * 100).toFixed(0)}% to ${(mostImpactful.highSuccessRate * 100).toFixed(0)}%.`
  );
  
  // Withdrawal rate specific insight
  const withdrawalBar = tornado.find(t => t.variable === 'withdrawalRate');
  if (withdrawalBar) {
    const safeRate = withdrawalBar.lowValue;
    insights.push(
      `Dropping withdrawal rate to ${(safeRate * 100).toFixed(1)}% would increase success to ${(withdrawalBar.lowSuccessRate * 100).toFixed(0)}%.`
    );
  }
  
  // Equity allocation insight
  const equityBar = tornado.find(t => t.variable === 'stockAllocation');
  if (equityBar) {
    const optimalEnd = equityBar.highSuccessRate > equityBar.lowSuccessRate ? 'higher' : 'lower';
    insights.push(
      `A ${optimalEnd} stock allocation may improve outcomes slightly, but the impact is smaller than withdrawal rate.`
    );
  }
  
  // Duration insight
  const durationBar = tornado.find(t => t.variable === 'years');
  if (durationBar && durationBar.impact > 0.1) {
    insights.push(
      `Planning horizon significantly affects results. Each additional 5 years reduces success rate by ~${((durationBar.lowSuccessRate - durationBar.highSuccessRate) / 2 * 100).toFixed(0)}%.`
    );
  }
  
  return insights;
}
