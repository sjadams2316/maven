/**
 * Sensitivity Analysis for Retirement Planning
 * 
 * This module has been simplified. The sensitivity page now uses its own
 * inline simulation logic for performance and simplicity.
 * 
 * Full Monte Carlo integration is available via the Retirement Hub.
 */

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
  sensitivity: number;
}

export interface TornadoBar {
  variable: string;
  displayName: string;
  lowValue: number;
  highValue: number;
  lowSuccessRate: number;
  highSuccessRate: number;
  baseSuccessRate: number;
  impact: number;
}

// Placeholder exports for type compatibility
export function runComprehensiveSensitivity(): SensitivityResult[] {
  return [];
}

export function calculateTornadoChart(): TornadoBar[] {
  return [];
}

export function runTwoWaySensitivity() {
  return { variable1: '', variable2: '', values1: [], values2: [], successRates: [] };
}

export function generateSensitivityInsights(): string[] {
  return [];
}
