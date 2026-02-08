/**
 * Tax Calculator for Maven
 * 
 * Calculates marginal tax rates and tax savings for various optimization strategies.
 * Uses 2024/2025 tax brackets (will update for 2026 when released).
 * 
 * ITERATION NOTES:
 * v1: Basic federal brackets
 * v1.1: Added LTCG rates
 * v1.2: Added state taxes
 * v1.3: Added NIIT for high earners
 * v1.4: Added filing status support
 * v1.5: Full transparency - returns calculation breakdown
 */

// 2024 Federal Tax Brackets (indexed for inflation, close to 2025/2026)
const FEDERAL_BRACKETS_2024 = {
  single: [
    { min: 0, max: 11600, rate: 0.10 },
    { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 },
    { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243725, rate: 0.32 },
    { min: 243725, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 },
  ],
  married_filing_jointly: [
    { min: 0, max: 23200, rate: 0.10 },
    { min: 23200, max: 94300, rate: 0.12 },
    { min: 94300, max: 201050, rate: 0.22 },
    { min: 201050, max: 383900, rate: 0.24 },
    { min: 383900, max: 487450, rate: 0.32 },
    { min: 487450, max: 731200, rate: 0.35 },
    { min: 731200, max: Infinity, rate: 0.37 },
  ],
  married_filing_separately: [
    { min: 0, max: 11600, rate: 0.10 },
    { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 },
    { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243725, rate: 0.32 },
    { min: 243725, max: 365600, rate: 0.35 },
    { min: 365600, max: Infinity, rate: 0.37 },
  ],
  head_of_household: [
    { min: 0, max: 16550, rate: 0.10 },
    { min: 16550, max: 63100, rate: 0.12 },
    { min: 63100, max: 100500, rate: 0.22 },
    { min: 100500, max: 191950, rate: 0.24 },
    { min: 191950, max: 243700, rate: 0.32 },
    { min: 243700, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 },
  ],
};

// Long-term Capital Gains brackets (2024)
const LTCG_BRACKETS_2024 = {
  single: [
    { min: 0, max: 47025, rate: 0 },
    { min: 47025, max: 518900, rate: 0.15 },
    { min: 518900, max: Infinity, rate: 0.20 },
  ],
  married_filing_jointly: [
    { min: 0, max: 94050, rate: 0 },
    { min: 94050, max: 583750, rate: 0.15 },
    { min: 583750, max: Infinity, rate: 0.20 },
  ],
  married_filing_separately: [
    { min: 0, max: 47025, rate: 0 },
    { min: 47025, max: 291850, rate: 0.15 },
    { min: 291850, max: Infinity, rate: 0.20 },
  ],
  head_of_household: [
    { min: 0, max: 63000, rate: 0 },
    { min: 63000, max: 551350, rate: 0.15 },
    { min: 551350, max: Infinity, rate: 0.20 },
  ],
};

// Net Investment Income Tax (NIIT) thresholds
const NIIT_THRESHOLDS = {
  single: 200000,
  married_filing_jointly: 250000,
  married_filing_separately: 125000,
  head_of_household: 200000,
};
const NIIT_RATE = 0.038;

// State tax rates (simplified - uses top marginal rate)
// In production, would use full brackets
const STATE_TAX_RATES: Record<string, { income: number; ltcg: number }> = {
  AL: { income: 0.05, ltcg: 0.05 },
  AK: { income: 0, ltcg: 0 },
  AZ: { income: 0.025, ltcg: 0.025 },
  AR: { income: 0.047, ltcg: 0.047 },
  CA: { income: 0.133, ltcg: 0.133 }, // CA taxes LTCG as ordinary income
  CO: { income: 0.044, ltcg: 0.044 },
  CT: { income: 0.0699, ltcg: 0.0699 },
  DE: { income: 0.066, ltcg: 0.066 },
  FL: { income: 0, ltcg: 0 },
  GA: { income: 0.0549, ltcg: 0.0549 },
  HI: { income: 0.11, ltcg: 0.0725 },
  ID: { income: 0.058, ltcg: 0.058 },
  IL: { income: 0.0495, ltcg: 0.0495 },
  IN: { income: 0.0305, ltcg: 0.0305 },
  IA: { income: 0.057, ltcg: 0.057 },
  KS: { income: 0.057, ltcg: 0.057 },
  KY: { income: 0.04, ltcg: 0.04 },
  LA: { income: 0.0425, ltcg: 0.0425 },
  ME: { income: 0.0715, ltcg: 0.0715 },
  MD: { income: 0.0575, ltcg: 0.0575 },
  MA: { income: 0.09, ltcg: 0.09 }, // MA has 4% surtax on income > $1M
  MI: { income: 0.0425, ltcg: 0.0425 },
  MN: { income: 0.0985, ltcg: 0.0985 },
  MS: { income: 0.05, ltcg: 0.05 },
  MO: { income: 0.048, ltcg: 0.048 },
  MT: { income: 0.059, ltcg: 0.059 },
  NE: { income: 0.0584, ltcg: 0.0584 },
  NV: { income: 0, ltcg: 0 },
  NH: { income: 0, ltcg: 0.05 }, // NH only taxes dividends/interest
  NJ: { income: 0.1075, ltcg: 0.1075 },
  NM: { income: 0.059, ltcg: 0.059 },
  NY: { income: 0.109, ltcg: 0.109 }, // Includes NYC
  NC: { income: 0.0475, ltcg: 0.0475 },
  ND: { income: 0.025, ltcg: 0.025 },
  OH: { income: 0.0357, ltcg: 0.0357 },
  OK: { income: 0.0475, ltcg: 0.0475 },
  OR: { income: 0.099, ltcg: 0.099 },
  PA: { income: 0.0307, ltcg: 0.0307 },
  RI: { income: 0.0599, ltcg: 0.0599 },
  SC: { income: 0.064, ltcg: 0.064 },
  SD: { income: 0, ltcg: 0 },
  TN: { income: 0, ltcg: 0 },
  TX: { income: 0, ltcg: 0 },
  UT: { income: 0.0465, ltcg: 0.0465 },
  VT: { income: 0.0875, ltcg: 0.0875 },
  VA: { income: 0.0575, ltcg: 0.0575 },
  WA: { income: 0, ltcg: 0.07 }, // WA has 7% LTCG tax
  WV: { income: 0.055, ltcg: 0.055 },
  WI: { income: 0.0765, ltcg: 0.0765 },
  WY: { income: 0, ltcg: 0 },
  DC: { income: 0.1075, ltcg: 0.1075 },
};

export type FilingStatus = 'single' | 'married_filing_jointly' | 'married_filing_separately' | 'head_of_household';
export type GainType = 'ordinary_income' | 'short_term' | 'long_term';

export interface TaxProfile {
  income: number;
  filingStatus: FilingStatus;
  state: string;
}

export interface TaxCalculation {
  // Rates
  federalRate: number;
  stateRate: number;
  niitRate: number;
  combinedRate: number;
  
  // For display
  federalPercent: string;
  statePercent: string;
  combinedPercent: string;
  
  // Tax savings
  taxSaved: number;
  
  // Full breakdown
  breakdown: {
    amount: number;
    gainType: GainType;
    income: number;
    filingStatus: FilingStatus;
    state: string;
    federalBracket: string;
    stateNote: string;
    niitApplies: boolean;
    calculation: string;
  };
}

/**
 * Get the marginal federal tax rate for ordinary income
 */
export function getFederalMarginalRate(income: number, filingStatus: FilingStatus): number {
  const brackets = FEDERAL_BRACKETS_2024[filingStatus];
  for (const bracket of brackets) {
    if (income >= bracket.min && income < bracket.max) {
      return bracket.rate;
    }
  }
  return brackets[brackets.length - 1].rate;
}

/**
 * Get the long-term capital gains rate
 */
export function getLTCGRate(income: number, filingStatus: FilingStatus): number {
  const brackets = LTCG_BRACKETS_2024[filingStatus];
  for (const bracket of brackets) {
    if (income >= bracket.min && income < bracket.max) {
      return bracket.rate;
    }
  }
  return brackets[brackets.length - 1].rate;
}

/**
 * Check if NIIT applies
 */
export function getNIITRate(income: number, filingStatus: FilingStatus): number {
  const threshold = NIIT_THRESHOLDS[filingStatus];
  return income > threshold ? NIIT_RATE : 0;
}

/**
 * Get state tax rate
 */
export function getStateRate(state: string, gainType: GainType): number {
  const stateRates = STATE_TAX_RATES[state.toUpperCase()];
  if (!stateRates) return 0;
  
  if (gainType === 'long_term') {
    return stateRates.ltcg;
  }
  return stateRates.income;
}

/**
 * Calculate tax savings for a given amount
 * This is the main function - calculates exactly how much tax a loss saves
 */
export function calculateTaxSavings(
  amount: number,
  gainType: GainType,
  profile: TaxProfile
): TaxCalculation {
  const { income, filingStatus, state } = profile;
  
  // Get federal rate based on gain type
  let federalRate: number;
  let federalBracket: string;
  
  if (gainType === 'long_term') {
    federalRate = getLTCGRate(income, filingStatus);
    federalBracket = `${(federalRate * 100).toFixed(0)}% LTCG bracket`;
  } else {
    federalRate = getFederalMarginalRate(income, filingStatus);
    federalBracket = `${(federalRate * 100).toFixed(0)}% marginal bracket`;
  }
  
  // NIIT (applies to both ordinary income and capital gains for high earners)
  const niitRate = getNIITRate(income, filingStatus);
  const niitApplies = niitRate > 0;
  
  // State rate
  const stateRate = getStateRate(state, gainType);
  const stateNote = stateRate > 0 
    ? `${state} ${(stateRate * 100).toFixed(2)}%`
    : `${state} - no state income tax`;
  
  // Combined rate
  // Note: State taxes are deductible for federal, but SALT cap of $10K limits this
  // For simplicity, we add them (slightly overstates savings, but conservative for user)
  const combinedRate = federalRate + stateRate + niitRate;
  
  // Calculate savings
  const taxSaved = Math.abs(amount) * combinedRate;
  
  // Build calculation string for transparency
  const parts = [`$${Math.abs(amount).toLocaleString()} × (`];
  parts.push(`${(federalRate * 100).toFixed(1)}% federal`);
  if (stateRate > 0) parts.push(` + ${(stateRate * 100).toFixed(2)}% ${state}`);
  if (niitRate > 0) parts.push(` + ${(niitRate * 100).toFixed(1)}% NIIT`);
  parts.push(`) = $${taxSaved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  
  return {
    federalRate,
    stateRate,
    niitRate,
    combinedRate,
    federalPercent: `${(federalRate * 100).toFixed(1)}%`,
    statePercent: `${(stateRate * 100).toFixed(2)}%`,
    combinedPercent: `${(combinedRate * 100).toFixed(1)}%`,
    taxSaved,
    breakdown: {
      amount: Math.abs(amount),
      gainType,
      income,
      filingStatus,
      state,
      federalBracket,
      stateNote,
      niitApplies,
      calculation: parts.join(''),
    },
  };
}

/**
 * Estimate tax profile from onboarding data
 */
export function estimateTaxProfile(profileData: any): TaxProfile {
  // Default assumptions
  let income = 150000;
  let filingStatus: FilingStatus = 'married_filing_jointly';
  let state = 'VA';
  
  if (profileData) {
    // Income from onboarding
    if (profileData.income) {
      const incomeStr = profileData.income.toString().toLowerCase();
      if (incomeStr.includes('500') || incomeStr.includes('million')) income = 750000;
      else if (incomeStr.includes('300') || incomeStr.includes('400')) income = 400000;
      else if (incomeStr.includes('200') || incomeStr.includes('250')) income = 250000;
      else if (incomeStr.includes('150')) income = 175000;
      else if (incomeStr.includes('100')) income = 125000;
      else if (incomeStr.includes('75')) income = 87500;
      else if (incomeStr.includes('50')) income = 62500;
      else {
        // Try to parse as number
        const parsed = parseInt(incomeStr.replace(/[^0-9]/g, ''));
        if (!isNaN(parsed) && parsed > 0) income = parsed;
      }
    }
    
    // Filing status from marital status
    if (profileData.maritalStatus) {
      const status = profileData.maritalStatus.toLowerCase();
      if (status.includes('single') || status.includes('never')) {
        filingStatus = 'single';
      } else if (status.includes('married')) {
        filingStatus = 'married_filing_jointly';
      }
    }
    
    // State
    if (profileData.state) {
      state = profileData.state.toUpperCase();
    }
  }
  
  return { income, filingStatus, state };
}

/**
 * Get a human-readable tax bracket description
 */
export function describeTaxSituation(profile: TaxProfile): string {
  const federalRate = getFederalMarginalRate(profile.income, profile.filingStatus);
  const ltcgRate = getLTCGRate(profile.income, profile.filingStatus);
  const niitRate = getNIITRate(profile.income, profile.filingStatus);
  const stateRate = getStateRate(profile.state, 'ordinary_income');
  
  const parts = [];
  parts.push(`${(federalRate * 100).toFixed(0)}% federal bracket`);
  
  if (stateRate > 0) {
    parts.push(`${(stateRate * 100).toFixed(1)}% ${profile.state} state tax`);
  } else {
    parts.push(`no ${profile.state} state income tax`);
  }
  
  if (niitRate > 0) {
    parts.push(`3.8% NIIT (investment income tax)`);
  }
  
  parts.push(`${(ltcgRate * 100).toFixed(0)}% long-term capital gains rate`);
  
  return parts.join(', ');
}
