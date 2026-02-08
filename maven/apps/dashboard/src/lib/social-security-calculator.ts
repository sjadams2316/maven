/**
 * Social Security Optimization Calculator
 * 
 * Comprehensive engine for SS benefit calculations, break-even analysis,
 * spousal benefit coordination, and NPV comparisons.
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface SSProfile {
  dateOfBirth: string;
  lifeExpectancy: number;
  benefitAt62: number;
  benefitAtFRA: number;
  benefitAt70: number;
  currentlyWorking?: boolean;
  expectedEarnings?: number;
  retirementAge?: number;
  // Spouse
  isMarried?: boolean;
  spouseDOB?: string;
  spouseBenefitAt62?: number;
  spouseBenefitAtFRA?: number;
  spouseBenefitAt70?: number;
  marriageDate?: string;
}

export interface BenefitAtAge {
  age: number;
  ageMonths: number;
  monthlyBenefit: number;
  annualBenefit: number;
  percentOfPIA: number;
  delayCreditsOrReduction: string;
}

export interface BreakEvenResult {
  age1: number;
  age2: number;
  breakEvenAge: number;
  breakEvenMonths: number;
  formattedBreakEven: string;
  age1TotalAtBreakEven: number;
  age2TotalAtBreakEven: number;
  monthsToRecoup: number;
}

export interface ClaimingScenario {
  claimingAge: number;
  monthlyBenefit: number;
  annualBenefit: number;
  percentOfPIA: number;
  cumulativeByAge75: number;
  cumulativeByAge80: number;
  cumulativeByAge85: number;
  cumulativeByAge90: number;
  cumulativeAtLifeExpectancy: number;
  npv3Percent: number;
  npv5Percent: number;
  lifetimeTotal: number;
}

export interface SSAnalysis {
  // Personal info
  fullRetirementAge: number;
  fullRetirementAgeMonths: number;
  primaryInsuranceAmount: number;
  
  // Benefits at key ages
  benefitAt62: BenefitAtAge;
  benefitAtFRA: BenefitAtAge;
  benefitAt70: BenefitAtAge;
  benefitAtCustomAge?: BenefitAtAge;
  
  // Scenarios
  scenarios: ClaimingScenario[];
  
  // Break-even analysis
  breakEven62vsFRA: BreakEvenResult;
  breakEven62vs70: BreakEvenResult;
  breakEvenFRAvs70: BreakEvenResult;
  
  // Optimal recommendation
  optimalClaimingAge: number;
  optimalStrategy: string;
  optimalExplanation: string;
  lifetimeAdvantage: number;
  
  // Life expectancy sensitivity
  lifetimeByLifeExpectancy: {
    lifeExpectancy: number;
    bestAge: number;
    bestLifetime: number;
  }[];
}

export interface SpousalAnalysis {
  spousalBenefitAtFRA: number;
  spousalBenefitAt62: number;
  ownVsSpousal: 'own' | 'spousal';
  combinedOptimalStrategy: {
    person1ClaimAge: number;
    person2ClaimAge: number;
    reasoning: string;
    combinedLifetime: number;
  };
  survivorBenefitValue: number;
}

// ============================================
// CONSTANTS
// ============================================

// FRA by birth year (for people born 1943+)
const FRA_TABLE: Record<number, { years: number; months: number }> = {
  1943: { years: 66, months: 0 },
  1944: { years: 66, months: 0 },
  1945: { years: 66, months: 0 },
  1946: { years: 66, months: 0 },
  1947: { years: 66, months: 0 },
  1948: { years: 66, months: 0 },
  1949: { years: 66, months: 0 },
  1950: { years: 66, months: 0 },
  1951: { years: 66, months: 0 },
  1952: { years: 66, months: 0 },
  1953: { years: 66, months: 0 },
  1954: { years: 66, months: 0 },
  1955: { years: 66, months: 2 },
  1956: { years: 66, months: 4 },
  1957: { years: 66, months: 6 },
  1958: { years: 66, months: 8 },
  1959: { years: 66, months: 10 },
  1960: { years: 67, months: 0 },
};

// Earnings test thresholds (2025 figures - update annually)
const EARNINGS_TEST_2025 = {
  underFRA: 22320,        // Annual exempt amount
  underFRAWithholding: 2, // $1 withheld per $2 over
  yearOfFRA: 59520,       // Monthly exempt in year of FRA
  yearOfFRAWithholding: 3 // $1 withheld per $3 over
};

// Average life expectancy by age (SSA actuarial tables approximation)
const LIFE_EXPECTANCY_TABLE: Record<number, number> = {
  62: 84.6,
  65: 85.2,
  67: 85.7,
  70: 86.5,
};

// ============================================
// CORE CALCULATION FUNCTIONS
// ============================================

/**
 * Get Full Retirement Age based on birth year
 */
export function getFullRetirementAge(birthYear: number): { years: number; months: number } {
  if (birthYear <= 1937) return { years: 65, months: 0 };
  if (birthYear >= 1960) return { years: 67, months: 0 };
  return FRA_TABLE[birthYear] || { years: 67, months: 0 };
}

/**
 * Calculate age in years and months from DOB to a target date
 */
export function calculateAge(dob: string, targetDate: Date = new Date()): { years: number; months: number } {
  const birthDate = new Date(dob);
  let years = targetDate.getFullYear() - birthDate.getFullYear();
  let months = targetDate.getMonth() - birthDate.getMonth();
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  if (targetDate.getDate() < birthDate.getDate()) {
    months--;
    if (months < 0) {
      years--;
      months += 12;
    }
  }
  
  return { years, months };
}

/**
 * Calculate Primary Insurance Amount (PIA) from benefit at FRA
 * (This is the reverse calculation - normally PIA → benefit, but we have benefit)
 */
export function calculatePIA(benefitAtFRA: number): number {
  // If we have the benefit at FRA, that IS the PIA
  return benefitAtFRA;
}

/**
 * Calculate benefit reduction for claiming before FRA
 * Rules:
 * - 5/9 of 1% per month for first 36 months before FRA
 * - 5/12 of 1% per month for additional months beyond 36
 */
export function calculateEarlyReduction(monthsEarly: number): number {
  if (monthsEarly <= 0) return 1.0;
  
  const first36Months = Math.min(monthsEarly, 36);
  const additionalMonths = Math.max(monthsEarly - 36, 0);
  
  // 5/9 of 1% = 0.00555... per month for first 36
  const reductionFirst36 = first36Months * (5 / 9 / 100);
  // 5/12 of 1% = 0.00417... per month for additional
  const reductionAdditional = additionalMonths * (5 / 12 / 100);
  
  return 1 - reductionFirst36 - reductionAdditional;
}

/**
 * Calculate delayed retirement credits for claiming after FRA
 * 8% per year (2/3 of 1% per month) until age 70
 */
export function calculateDelayedCredits(monthsDelayed: number): number {
  if (monthsDelayed <= 0) return 1.0;
  
  // Cap at 36 months (3 years from 67 to 70)
  const cappedMonths = Math.min(monthsDelayed, 36);
  
  // 8% per year = 2/3 of 1% per month = 0.00667 per month
  return 1 + (cappedMonths * (2 / 3 / 100));
}

/**
 * Calculate benefit at any claiming age
 */
export function calculateBenefitAtAge(
  pia: number,
  claimingAge: number,
  claimingMonth: number,
  fraYears: number,
  fraMonths: number
): BenefitAtAge {
  const totalClaimingMonths = claimingAge * 12 + claimingMonth;
  const totalFRAMonths = fraYears * 12 + fraMonths;
  
  const monthsDifference = totalClaimingMonths - totalFRAMonths;
  
  let multiplier: number;
  let delayCreditsOrReduction: string;
  
  if (monthsDifference < 0) {
    // Claiming early
    multiplier = calculateEarlyReduction(Math.abs(monthsDifference));
    const reductionPercent = ((1 - multiplier) * 100).toFixed(1);
    delayCreditsOrReduction = `-${reductionPercent}% (${Math.abs(monthsDifference)} months early)`;
  } else if (monthsDifference > 0) {
    // Claiming late (delayed retirement credits)
    multiplier = calculateDelayedCredits(monthsDifference);
    const increasePercent = ((multiplier - 1) * 100).toFixed(1);
    delayCreditsOrReduction = `+${increasePercent}% (${monthsDifference} months delayed)`;
  } else {
    multiplier = 1.0;
    delayCreditsOrReduction = 'At FRA (100%)';
  }
  
  const monthlyBenefit = Math.round(pia * multiplier);
  
  return {
    age: claimingAge,
    ageMonths: claimingMonth,
    monthlyBenefit,
    annualBenefit: monthlyBenefit * 12,
    percentOfPIA: multiplier * 100,
    delayCreditsOrReduction,
  };
}

/**
 * Calculate cumulative benefits received by a certain age
 */
export function calculateCumulativeBenefits(
  claimingAge: number,
  monthlyBenefit: number,
  byAge: number
): number {
  const monthsReceiving = Math.max(0, (byAge - claimingAge) * 12);
  return monthsReceiving * monthlyBenefit;
}

/**
 * Calculate Net Present Value of benefit stream
 */
export function calculateNPV(
  claimingAge: number,
  monthlyBenefit: number,
  currentAge: number,
  lifeExpectancy: number,
  annualDiscountRate: number
): number {
  const monthlyRate = annualDiscountRate / 12;
  let npv = 0;
  
  // Months until first benefit
  const monthsToStart = Math.max(0, (claimingAge - currentAge) * 12);
  
  // Total months of benefits
  const benefitMonths = (lifeExpectancy - claimingAge) * 12;
  
  for (let month = 0; month < benefitMonths; month++) {
    const totalMonthsFromNow = monthsToStart + month;
    const discountFactor = Math.pow(1 + monthlyRate, -totalMonthsFromNow);
    npv += monthlyBenefit * discountFactor;
  }
  
  return Math.round(npv);
}

/**
 * Calculate break-even age between two claiming strategies
 */
export function calculateBreakEven(
  age1: number,
  benefit1: number,
  age2: number,
  benefit2: number
): BreakEvenResult {
  // The earlier claimer accumulates benefits while the later claimer waits
  const monthsWaiting = (age2 - age1) * 12;
  const headStart = monthsWaiting * benefit1;
  
  // Monthly advantage of later claiming
  const monthlyAdvantage = benefit2 - benefit1;
  
  if (monthlyAdvantage <= 0) {
    // Earlier claiming is always better
    return {
      age1,
      age2,
      breakEvenAge: 999,
      breakEvenMonths: 0,
      formattedBreakEven: 'Never (earlier is always better)',
      age1TotalAtBreakEven: 0,
      age2TotalAtBreakEven: 0,
      monthsToRecoup: 0,
    };
  }
  
  // Months needed to recoup the head start
  const monthsToRecoup = Math.ceil(headStart / monthlyAdvantage);
  const breakEvenMonths = monthsToRecoup % 12;
  const breakEvenYears = Math.floor(monthsToRecoup / 12);
  const breakEvenAge = age2 + breakEvenYears + (breakEvenMonths / 12);
  
  const age1TotalAtBreakEven = (monthsWaiting + monthsToRecoup) * benefit1;
  const age2TotalAtBreakEven = monthsToRecoup * benefit2;
  
  return {
    age1,
    age2,
    breakEvenAge: Math.round(breakEvenAge * 10) / 10,
    breakEvenMonths,
    formattedBreakEven: `Age ${Math.floor(breakEvenAge)} and ${breakEvenMonths} months`,
    age1TotalAtBreakEven,
    age2TotalAtBreakEven,
    monthsToRecoup,
  };
}

// ============================================
// MAIN ANALYSIS FUNCTION
// ============================================

/**
 * Generate comprehensive SS analysis
 */
export function analyzeSocialSecurity(profile: SSProfile): SSAnalysis {
  const birthYear = new Date(profile.dateOfBirth).getFullYear();
  const fra = getFullRetirementAge(birthYear);
  const pia = calculatePIA(profile.benefitAtFRA);
  
  const currentAge = calculateAge(profile.dateOfBirth);
  const currentAgeYears = currentAge.years + (currentAge.months / 12);
  
  // Calculate benefits at key ages
  const benefitAt62 = calculateBenefitAtAge(pia, 62, 0, fra.years, fra.months);
  const benefitAtFRA = calculateBenefitAtAge(pia, fra.years, fra.months, fra.years, fra.months);
  const benefitAt70 = calculateBenefitAtAge(pia, 70, 0, fra.years, fra.months);
  
  // Generate scenarios for ages 62-70
  const scenarios: ClaimingScenario[] = [];
  for (let age = 62; age <= 70; age++) {
    const benefit = calculateBenefitAtAge(pia, age, 0, fra.years, fra.months);
    
    scenarios.push({
      claimingAge: age,
      monthlyBenefit: benefit.monthlyBenefit,
      annualBenefit: benefit.annualBenefit,
      percentOfPIA: benefit.percentOfPIA,
      cumulativeByAge75: calculateCumulativeBenefits(age, benefit.monthlyBenefit, 75),
      cumulativeByAge80: calculateCumulativeBenefits(age, benefit.monthlyBenefit, 80),
      cumulativeByAge85: calculateCumulativeBenefits(age, benefit.monthlyBenefit, 85),
      cumulativeByAge90: calculateCumulativeBenefits(age, benefit.monthlyBenefit, 90),
      cumulativeAtLifeExpectancy: calculateCumulativeBenefits(age, benefit.monthlyBenefit, profile.lifeExpectancy),
      npv3Percent: calculateNPV(age, benefit.monthlyBenefit, currentAgeYears, profile.lifeExpectancy, 0.03),
      npv5Percent: calculateNPV(age, benefit.monthlyBenefit, currentAgeYears, profile.lifeExpectancy, 0.05),
      lifetimeTotal: calculateCumulativeBenefits(age, benefit.monthlyBenefit, profile.lifeExpectancy),
    });
  }
  
  // Break-even calculations
  const breakEven62vsFRA = calculateBreakEven(62, benefitAt62.monthlyBenefit, fra.years, benefitAtFRA.monthlyBenefit);
  const breakEven62vs70 = calculateBreakEven(62, benefitAt62.monthlyBenefit, 70, benefitAt70.monthlyBenefit);
  const breakEvenFRAvs70 = calculateBreakEven(fra.years, benefitAtFRA.monthlyBenefit, 70, benefitAt70.monthlyBenefit);
  
  // Find optimal claiming age based on life expectancy
  const sortedByLifetime = [...scenarios].sort((a, b) => b.cumulativeAtLifeExpectancy - a.cumulativeAtLifeExpectancy);
  const optimalScenario = sortedByLifetime[0];
  const worstScenario = sortedByLifetime[sortedByLifetime.length - 1];
  const scenario62 = scenarios.find(s => s.claimingAge === 62)!;
  
  // Generate optimal strategy explanation
  let optimalExplanation = '';
  let optimalStrategy = '';
  
  if (profile.lifeExpectancy < breakEven62vs70.breakEvenAge) {
    optimalStrategy = 'Claim at 62';
    optimalExplanation = `With your life expectancy of ${profile.lifeExpectancy}, you won't live past the break-even age of ${breakEven62vs70.formattedBreakEven} between claiming at 62 vs 70. Earlier claiming maximizes your lifetime benefits.`;
  } else if (profile.lifeExpectancy >= 85) {
    optimalStrategy = 'Delay to 70';
    optimalExplanation = `With your life expectancy of ${profile.lifeExpectancy}, delaying to age 70 maximizes your lifetime benefits. You'll receive ${((benefitAt70.monthlyBenefit / benefitAt62.monthlyBenefit - 1) * 100).toFixed(0)}% more per month than claiming at 62.`;
  } else {
    optimalStrategy = `Claim at ${optimalScenario.claimingAge}`;
    optimalExplanation = `Based on your life expectancy of ${profile.lifeExpectancy}, claiming at age ${optimalScenario.claimingAge} optimizes your lifetime benefits. This balances the higher monthly benefit of delaying against years of benefits received.`;
  }
  
  // Life expectancy sensitivity
  const lifetimeByLifeExpectancy = [78, 80, 82, 85, 88, 90, 95].map(le => {
    const scenarioTotals = scenarios.map(s => ({
      age: s.claimingAge,
      total: calculateCumulativeBenefits(s.claimingAge, s.monthlyBenefit, le),
    }));
    const best = scenarioTotals.reduce((a, b) => a.total > b.total ? a : b);
    return {
      lifeExpectancy: le,
      bestAge: best.age,
      bestLifetime: best.total,
    };
  });
  
  return {
    fullRetirementAge: fra.years,
    fullRetirementAgeMonths: fra.months,
    primaryInsuranceAmount: pia,
    benefitAt62,
    benefitAtFRA,
    benefitAt70,
    scenarios,
    breakEven62vsFRA,
    breakEven62vs70,
    breakEvenFRAvs70,
    optimalClaimingAge: optimalScenario.claimingAge,
    optimalStrategy,
    optimalExplanation,
    lifetimeAdvantage: optimalScenario.cumulativeAtLifeExpectancy - scenario62.cumulativeAtLifeExpectancy,
    lifetimeByLifeExpectancy,
  };
}

// ============================================
// SPOUSAL BENEFIT CALCULATIONS
// ============================================

/**
 * Calculate spousal benefit reduction
 * Spousal benefits max at 50% of worker's PIA at FRA
 * Reduced if claimed early (same formula as own benefits for first 36 months, then 5/12%)
 */
export function calculateSpousalBenefit(
  workerPIA: number,
  ownPIA: number,
  claimingAge: number,
  fraYears: number,
  fraMonths: number
): number {
  const maxSpousalBenefit = workerPIA * 0.5;
  
  // Spouse gets the higher of their own benefit or spousal benefit
  if (ownPIA >= maxSpousalBenefit) {
    return 0; // Own benefit is higher
  }
  
  const totalClaimingMonths = claimingAge * 12;
  const totalFRAMonths = fraYears * 12 + fraMonths;
  const monthsEarly = Math.max(0, totalFRAMonths - totalClaimingMonths);
  
  // Spousal benefits do NOT increase after FRA (no delayed retirement credits)
  if (monthsEarly <= 0) {
    return maxSpousalBenefit - ownPIA;
  }
  
  // Apply early reduction
  const multiplier = calculateEarlyReduction(monthsEarly);
  return Math.max(0, (maxSpousalBenefit * multiplier) - ownPIA);
}

/**
 * Analyze spousal coordination strategies
 */
export function analyzeSpousalBenefits(profile: SSProfile): SpousalAnalysis | null {
  if (!profile.isMarried || !profile.spouseBenefitAtFRA) {
    return null;
  }
  
  const workerPIA = profile.benefitAtFRA;
  const spousePIA = profile.spouseBenefitAtFRA;
  const birthYear = new Date(profile.dateOfBirth).getFullYear();
  const fra = getFullRetirementAge(birthYear);
  
  // Calculate spousal benefit potential
  const spousalBenefitAtFRA = calculateSpousalBenefit(workerPIA, spousePIA, fra.years, fra.years, fra.months);
  const spousalBenefitAt62 = calculateSpousalBenefit(workerPIA, spousePIA, 62, fra.years, fra.months);
  
  // Determine if own benefit or spousal is better
  const ownVsSpousal = spousePIA >= workerPIA * 0.5 ? 'own' : 'spousal';
  
  // Simple combined strategy analysis
  // Higher earner should delay to maximize survivor benefit
  const higherEarner = workerPIA >= spousePIA ? 'worker' : 'spouse';
  const higherPIA = Math.max(workerPIA, spousePIA);
  const lowerPIA = Math.min(workerPIA, spousePIA);
  
  // Survivor benefit = 100% of deceased's benefit at time of death
  // So higher earner delaying to 70 protects the survivor
  const survivorBenefitValue = higherPIA * 1.24 * 12 * 10; // Rough estimate: 10 years of survivor benefit at 124%
  
  return {
    spousalBenefitAtFRA,
    spousalBenefitAt62,
    ownVsSpousal,
    combinedOptimalStrategy: {
      person1ClaimAge: higherEarner === 'worker' ? 70 : fra.years,
      person2ClaimAge: higherEarner === 'spouse' ? 70 : 62,
      reasoning: `The ${higherEarner === 'worker' ? 'primary earner' : 'spouse'} should delay to 70 to maximize the survivor benefit. The other spouse can claim earlier for household income.`,
      combinedLifetime: 0, // Would need full modeling
    },
    survivorBenefitValue,
  };
}

// ============================================
// EARNINGS TEST CALCULATOR
// ============================================

export interface EarningsTestResult {
  grossEarnings: number;
  withheldBenefits: number;
  netBenefitsReceived: number;
  benefitsRecoupedAtFRA: boolean;
  recoupedMonthlyIncrease: number;
}

/**
 * Calculate earnings test impact
 */
export function calculateEarningsTest(
  annualEarnings: number,
  monthlyBenefit: number,
  currentAge: number,
  fraYears: number
): EarningsTestResult {
  // If at or past FRA, no earnings test
  if (currentAge >= fraYears) {
    return {
      grossEarnings: annualEarnings,
      withheldBenefits: 0,
      netBenefitsReceived: monthlyBenefit * 12,
      benefitsRecoupedAtFRA: false,
      recoupedMonthlyIncrease: 0,
    };
  }
  
  // Under FRA for entire year
  const excessEarnings = Math.max(0, annualEarnings - EARNINGS_TEST_2025.underFRA);
  const withheldBenefits = Math.min(
    excessEarnings / EARNINGS_TEST_2025.underFRAWithholding,
    monthlyBenefit * 12 // Can't withhold more than total benefits
  );
  
  const monthsWithheld = Math.ceil(withheldBenefits / monthlyBenefit);
  
  // Benefits ARE recouped at FRA - they increase your monthly benefit
  // As if you had claimed that many months later
  const recoupedMonthlyIncrease = monthsWithheld * (5 / 9 / 100) * monthlyBenefit;
  
  return {
    grossEarnings: annualEarnings,
    withheldBenefits: Math.round(withheldBenefits),
    netBenefitsReceived: Math.round((monthlyBenefit * 12) - withheldBenefits),
    benefitsRecoupedAtFRA: true,
    recoupedMonthlyIncrease: Math.round(recoupedMonthlyIncrease),
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format currency for display
 */
export function formatSSCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(2)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

/**
 * Format age with months
 */
export function formatAge(years: number, months: number = 0): string {
  if (months === 0) return `${years}`;
  return `${years} years, ${months} months`;
}

/**
 * Get recommendation summary for PDF
 */
export function getRecommendationSummary(analysis: SSAnalysis, profile: SSProfile): {
  headline: string;
  bullets: string[];
  actionItems: string[];
} {
  const scenario62 = analysis.scenarios.find(s => s.claimingAge === 62)!;
  const scenario70 = analysis.scenarios.find(s => s.claimingAge === 70)!;
  const optimalScenario = analysis.scenarios.find(s => s.claimingAge === analysis.optimalClaimingAge)!;
  
  const headline = `Claim Social Security at age ${analysis.optimalClaimingAge}`;
  
  const bullets = [
    `Your monthly benefit at ${analysis.optimalClaimingAge}: $${optimalScenario.monthlyBenefit.toLocaleString()}`,
    `This is ${optimalScenario.percentOfPIA.toFixed(0)}% of your full benefit`,
    `Break-even vs. claiming at 62: ${analysis.breakEven62vs70.formattedBreakEven}`,
    `Estimated lifetime benefit: $${optimalScenario.lifetimeTotal.toLocaleString()}`,
    analysis.lifetimeAdvantage > 0 
      ? `Advantage over claiming at 62: +$${analysis.lifetimeAdvantage.toLocaleString()}`
      : `Claiming at 62 would yield ${formatSSCurrency(Math.abs(analysis.lifetimeAdvantage))} more`,
  ];
  
  const actionItems = [
    'Create a my Social Security account at ssa.gov/myaccount',
    'Verify your earnings history is accurate',
    `Schedule your SSA appointment ${analysis.optimalClaimingAge >= 67 ? '3 months before' : 'when'} you turn ${analysis.optimalClaimingAge}`,
    'Bring this report and a valid ID to your appointment',
    profile.isMarried ? 'Coordinate claiming timing with your spouse' : '',
  ].filter(Boolean);
  
  return { headline, bullets, actionItems };
}
