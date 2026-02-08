// Tax Calculation Engine
// Handles federal and state capital gains tax calculations

/**
 * 2024/2025 Federal Long-Term Capital Gains Brackets
 * Plus 3.8% NIIT for high earners
 */
const FEDERAL_LTCG_BRACKETS = {
  single: [
    { min: 0, max: 47025, rate: 0 },
    { min: 47025, max: 518900, rate: 0.15 },
    { min: 518900, max: Infinity, rate: 0.20 }
  ],
  married: [
    { min: 0, max: 94050, rate: 0 },
    { min: 94050, max: 583750, rate: 0.15 },
    { min: 583750, max: Infinity, rate: 0.20 }
  ]
};

/**
 * Net Investment Income Tax threshold
 */
const NIIT_THRESHOLD = {
  single: 200000,
  married: 250000
};
const NIIT_RATE = 0.038;

/**
 * State capital gains tax rates (simplified - top marginal rates)
 * Some states have no income tax, some tax cap gains as ordinary income
 */
const STATE_CG_RATES = {
  'AL': 0.05, 'AK': 0, 'AZ': 0.025, 'AR': 0.047, 'CA': 0.133,
  'CO': 0.044, 'CT': 0.0699, 'DE': 0.066, 'FL': 0, 'GA': 0.0549,
  'HI': 0.0725, 'ID': 0.058, 'IL': 0.0495, 'IN': 0.0315, 'IA': 0.06,
  'KS': 0.057, 'KY': 0.045, 'LA': 0.0425, 'ME': 0.0715, 'MD': 0.0575,
  'MA': 0.09, 'MI': 0.0425, 'MN': 0.0985, 'MS': 0.05, 'MO': 0.048,
  'MT': 0.0675, 'NE': 0.0664, 'NV': 0, 'NH': 0.05, 'NJ': 0.1075,
  'NM': 0.059, 'NY': 0.109, 'NC': 0.0525, 'ND': 0.029, 'OH': 0.0399,
  'OK': 0.0475, 'OR': 0.099, 'PA': 0.0307, 'RI': 0.0599, 'SC': 0.07,
  'SD': 0, 'TN': 0, 'TX': 0, 'UT': 0.0485, 'VT': 0.0875,
  'VA': 0.0575, 'WA': 0.07, 'WV': 0.065, 'WI': 0.0765, 'WY': 0,
  'DC': 0.1075
};

/**
 * Calculate total capital gains tax
 */
export function calculateCapitalGainsTax(params) {
  const {
    gain,                    // Total capital gain
    ordinaryIncome = 0,      // Other ordinary income (for bracket calculation)
    filingStatus = 'single', // 'single' or 'married'
    state = 'CA',            // State abbreviation
    isLongTerm = true        // Long-term vs short-term
  } = params;

  if (gain <= 0) {
    return {
      federalTax: 0,
      stateTax: 0,
      niit: 0,
      totalTax: 0,
      effectiveRate: 0
    };
  }

  let federalTax = 0;
  let niit = 0;

  if (isLongTerm) {
    // Long-term capital gains - preferential rates
    federalTax = calculateFederalLTCG(gain, ordinaryIncome, filingStatus);
  } else {
    // Short-term - taxed as ordinary income (simplified to top bracket)
    federalTax = gain * 0.37; // Top ordinary income rate
  }

  // NIIT calculation
  const totalIncome = ordinaryIncome + gain;
  const niitThreshold = NIIT_THRESHOLD[filingStatus];
  if (totalIncome > niitThreshold) {
    const niitableIncome = Math.min(gain, totalIncome - niitThreshold);
    niit = niitableIncome * NIIT_RATE;
  }

  // State tax
  const stateRate = STATE_CG_RATES[state] || 0;
  const stateTax = gain * stateRate;

  const totalTax = federalTax + niit + stateTax;
  const effectiveRate = totalTax / gain;

  return {
    gain,
    federalTax: Math.round(federalTax),
    stateTax: Math.round(stateTax),
    niit: Math.round(niit),
    totalTax: Math.round(totalTax),
    effectiveRate: Math.round(effectiveRate * 1000) / 10, // percentage
    breakdown: {
      federalRate: Math.round((federalTax / gain) * 1000) / 10,
      stateRate: Math.round(stateRate * 1000) / 10,
      niitRate: niit > 0 ? 3.8 : 0
    }
  };
}

/**
 * Calculate federal LTCG tax with bracket awareness
 */
function calculateFederalLTCG(gain, ordinaryIncome, filingStatus) {
  const brackets = FEDERAL_LTCG_BRACKETS[filingStatus];
  let remainingGain = gain;
  let tax = 0;
  
  // Start from where ordinary income ends
  let currentLevel = ordinaryIncome;

  for (const bracket of brackets) {
    if (remainingGain <= 0) break;
    
    if (currentLevel >= bracket.max) continue;
    
    const bracketStart = Math.max(currentLevel, bracket.min);
    const bracketEnd = bracket.max;
    const roomInBracket = bracketEnd - bracketStart;
    const gainInBracket = Math.min(remainingGain, roomInBracket);
    
    tax += gainInBracket * bracket.rate;
    remainingGain -= gainInBracket;
    currentLevel += gainInBracket;
  }

  return tax;
}

/**
 * Calculate after-tax proceeds from selling a position
 */
export function calculateAfterTaxProceeds(params) {
  const {
    currentValue,
    costBasis,
    ordinaryIncome = 0,
    filingStatus = 'single',
    state = 'CA',
    isLongTerm = true
  } = params;

  const gain = currentValue - costBasis;
  
  if (gain <= 0) {
    // Loss - no tax, might have value for harvesting
    return {
      currentValue,
      costBasis,
      gain,
      tax: 0,
      afterTaxProceeds: currentValue,
      taxDrag: 0,
      lossValue: Math.abs(gain) * 0.40 // Approximate value of loss for harvesting
    };
  }

  const taxCalc = calculateCapitalGainsTax({
    gain,
    ordinaryIncome,
    filingStatus,
    state,
    isLongTerm
  });

  return {
    currentValue,
    costBasis,
    gain,
    tax: taxCalc.totalTax,
    afterTaxProceeds: currentValue - taxCalc.totalTax,
    taxDrag: taxCalc.effectiveRate,
    taxBreakdown: taxCalc.breakdown
  };
}

/**
 * Project future tax liability under different scenarios
 */
export function projectFutureTax(params) {
  const {
    currentValue,
    costBasis,
    expectedReturn = 0.07,
    years = 10,
    ordinaryIncome = 200000,
    filingStatus = 'single',
    state = 'CA'
  } = params;

  const projections = [];
  let value = currentValue;

  for (let year = 0; year <= years; year++) {
    const gain = value - costBasis;
    const taxCalc = calculateCapitalGainsTax({
      gain: Math.max(0, gain),
      ordinaryIncome,
      filingStatus,
      state,
      isLongTerm: true
    });

    projections.push({
      year,
      value: Math.round(value),
      gain: Math.round(gain),
      taxIfSold: taxCalc.totalTax,
      afterTaxValue: Math.round(value - taxCalc.totalTax),
      effectiveRate: taxCalc.effectiveRate
    });

    value *= (1 + expectedReturn);
  }

  return projections;
}

export default {
  calculateCapitalGainsTax,
  calculateAfterTaxProceeds,
  projectFutureTax,
  STATE_CG_RATES
};
