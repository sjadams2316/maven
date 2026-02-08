/**
 * Tax-Equivalent Yield Calculator
 * 
 * Calculates the yield a taxable bond must earn to match
 * a municipal bond's after-tax return.
 */

// 2024 Federal tax brackets (married filing jointly)
const FEDERAL_BRACKETS_MFJ = [
  { min: 0, max: 23200, rate: 0.10 },
  { min: 23200, max: 94300, rate: 0.12 },
  { min: 94300, max: 201050, rate: 0.22 },
  { min: 201050, max: 383900, rate: 0.24 },
  { min: 383900, max: 487450, rate: 0.32 },
  { min: 487450, max: 731200, rate: 0.35 },
  { min: 731200, max: Infinity, rate: 0.37 }
];

// 2024 Federal tax brackets (single)
const FEDERAL_BRACKETS_SINGLE = [
  { min: 0, max: 11600, rate: 0.10 },
  { min: 11600, max: 47150, rate: 0.12 },
  { min: 47150, max: 100525, rate: 0.22 },
  { min: 100525, max: 191950, rate: 0.24 },
  { min: 191950, max: 243725, rate: 0.32 },
  { min: 243725, max: 609350, rate: 0.35 },
  { min: 609350, max: Infinity, rate: 0.37 }
];

// State income tax rates (top marginal rates)
const STATE_TAX_RATES = {
  'CA': 0.133,   // California
  'NY': 0.109,   // New York State
  'NYC': 0.1477, // NY State + NYC (10.9% + 3.876%)
  'NJ': 0.1075,  // New Jersey
  'MA': 0.09,    // Massachusetts
  'OR': 0.099,   // Oregon
  'MN': 0.0985,  // Minnesota
  'VT': 0.0875,  // Vermont
  'HI': 0.11,    // Hawaii
  'WI': 0.0765,  // Wisconsin
  'ME': 0.0715,  // Maine
  'CT': 0.0699,  // Connecticut
  'DC': 0.1075,  // Washington DC
  'VA': 0.0575,  // Virginia
  'MD': 0.0575,  // Maryland (plus local)
  'CO': 0.044,   // Colorado
  'IL': 0.0495,  // Illinois (flat)
  'PA': 0.0307,  // Pennsylvania (flat)
  'AZ': 0.025,   // Arizona
  'TX': 0,       // Texas (no income tax)
  'FL': 0,       // Florida (no income tax)
  'WA': 0,       // Washington (no income tax)
  'NV': 0,       // Nevada (no income tax)
  'WY': 0,       // Wyoming (no income tax)
  'TN': 0,       // Tennessee (no income tax)
  'AK': 0,       // Alaska (no income tax)
  'SD': 0,       // South Dakota (no income tax)
  'NH': 0,       // New Hampshire (no income tax on wages)
};

// NIIT threshold
const NIIT_RATE = 0.038;
const NIIT_THRESHOLD_MFJ = 250000;
const NIIT_THRESHOLD_SINGLE = 200000;

/**
 * Get federal marginal tax rate based on income
 */
function getFederalMarginalRate(income, filingStatus = 'married') {
  const brackets = filingStatus === 'single' ? FEDERAL_BRACKETS_SINGLE : FEDERAL_BRACKETS_MFJ;
  
  for (const bracket of brackets) {
    if (income >= bracket.min && income < bracket.max) {
      return bracket.rate;
    }
  }
  return 0.37; // Top rate
}

/**
 * Check if NIIT applies
 */
function getNIITRate(income, filingStatus = 'married') {
  const threshold = filingStatus === 'single' ? NIIT_THRESHOLD_SINGLE : NIIT_THRESHOLD_MFJ;
  return income > threshold ? NIIT_RATE : 0;
}

/**
 * Get state tax rate
 */
function getStateRate(state) {
  return STATE_TAX_RATES[state.toUpperCase()] || 0;
}

/**
 * Calculate Tax-Equivalent Yield
 * 
 * @param {number} muniYield - Municipal bond yield (as decimal, e.g., 0.04 for 4%)
 * @param {Object} options - Calculation options
 * @param {number} options.income - Taxable income
 * @param {string} options.filingStatus - 'single' or 'married'
 * @param {string} options.state - State code (e.g., 'CA', 'NY')
 * @param {boolean} options.isInState - Whether muni is from client's state
 * @param {boolean} options.includeNIIT - Whether to include NIIT in calculation
 * @returns {Object} TEY results
 */
function calculateTEY(muniYield, options = {}) {
  const {
    income = 500000,
    filingStatus = 'married',
    state = 'CA',
    isInState = true,
    includeNIIT = true
  } = options;

  // Get tax rates
  const federalRate = getFederalMarginalRate(income, filingStatus);
  const niitRate = includeNIIT ? getNIITRate(income, filingStatus) : 0;
  const stateRate = getStateRate(state);

  // Combined federal rate (including NIIT)
  const federalEffective = federalRate + niitRate;

  // For in-state munis: exempt from both federal and state
  // For out-of-state munis: exempt from federal only
  let combinedRate;
  let stateTaxOnMuni = 0;

  if (isInState) {
    // Both federal and state exempt
    // Combined rate accounting for federal deduction of state taxes
    // Simplified: just add them (slight overestimate due to SALT cap)
    combinedRate = federalEffective + stateRate;
  } else {
    // Federal exempt, but state taxable
    combinedRate = federalEffective;
    stateTaxOnMuni = stateRate;
  }

  // Cap combined rate at reasonable maximum
  combinedRate = Math.min(combinedRate, 0.60);

  // Calculate TEY
  // For in-state: TEY = muniYield / (1 - combinedRate)
  // For out-of-state: muniYield is reduced by state tax, then compare
  let taxEquivalentYield;
  let effectiveMuniYield = muniYield;

  if (isInState) {
    taxEquivalentYield = muniYield / (1 - combinedRate);
  } else {
    // Muni yield is reduced by state tax
    effectiveMuniYield = muniYield * (1 - stateRate);
    // Then calculate TEY for federal portion
    taxEquivalentYield = effectiveMuniYield / (1 - federalEffective);
  }

  // Calculate how much more a taxable bond needs to yield
  const yieldAdvantage = taxEquivalentYield - muniYield;
  const yieldMultiplier = taxEquivalentYield / muniYield;

  return {
    muniYield: muniYield,
    muniYieldPercent: (muniYield * 100).toFixed(2) + '%',
    taxEquivalentYield: taxEquivalentYield,
    taxEquivalentYieldPercent: (taxEquivalentYield * 100).toFixed(2) + '%',
    
    // Tax rates used
    federalRate: federalRate,
    federalRatePercent: (federalRate * 100).toFixed(1) + '%',
    niitRate: niitRate,
    niitRatePercent: (niitRate * 100).toFixed(1) + '%',
    stateRate: stateRate,
    stateRatePercent: (stateRate * 100).toFixed(1) + '%',
    combinedRate: combinedRate,
    combinedRatePercent: (combinedRate * 100).toFixed(1) + '%',
    
    // Scenario details
    isInState: isInState,
    state: state,
    filingStatus: filingStatus,
    income: income,
    
    // Analysis
    yieldAdvantage: yieldAdvantage,
    yieldAdvantagePercent: (yieldAdvantage * 100).toFixed(2) + '%',
    yieldMultiplier: yieldMultiplier.toFixed(2) + 'x',
    
    // Recommendation
    recommendation: generateRecommendation(muniYield, taxEquivalentYield, combinedRate, state, isInState),
    
    // For out-of-state: show the effective yield after state tax
    effectiveMuniYield: isInState ? null : effectiveMuniYield,
    effectiveMuniYieldPercent: isInState ? null : (effectiveMuniYield * 100).toFixed(2) + '%'
  };
}

/**
 * Generate a recommendation based on TEY analysis
 */
function generateRecommendation(muniYield, tey, combinedRate, state, isInState) {
  const insights = [];
  
  // High combined rate insight
  if (combinedRate >= 0.45) {
    insights.push(`At ${(combinedRate * 100).toFixed(1)}% combined marginal rate, municipal bonds are highly tax-efficient.`);
  } else if (combinedRate >= 0.35) {
    insights.push(`At ${(combinedRate * 100).toFixed(1)}% combined rate, munis offer meaningful tax benefit.`);
  } else {
    insights.push(`At ${(combinedRate * 100).toFixed(1)}% combined rate, compare carefully to taxable yields.`);
  }
  
  // In-state vs out-of-state
  if (isInState && STATE_TAX_RATES[state] > 0.08) {
    insights.push(`${state} has high state taxes (${(STATE_TAX_RATES[state] * 100).toFixed(1)}%). In-state munis provide significant additional benefit.`);
  } else if (!isInState && STATE_TAX_RATES[state] > 0.08) {
    insights.push(`Consider in-state ${state} munis for additional ${(STATE_TAX_RATES[state] * 100).toFixed(1)}% state tax savings.`);
  }
  
  // Yield comparison
  const breakeven = tey;
  insights.push(`A taxable bond must yield at least ${(breakeven * 100).toFixed(2)}% to match this muni's after-tax return.`);
  
  return insights;
}

/**
 * Compare muni vs taxable bond
 */
function compareBonds(muniYield, taxableYield, options = {}) {
  const teyResult = calculateTEY(muniYield, options);
  
  const muniBetter = teyResult.taxEquivalentYield > taxableYield;
  const difference = teyResult.taxEquivalentYield - taxableYield;
  
  return {
    ...teyResult,
    taxableYield: taxableYield,
    taxableYieldPercent: (taxableYield * 100).toFixed(2) + '%',
    winner: muniBetter ? 'municipal' : 'taxable',
    differencePercent: (Math.abs(difference) * 100).toFixed(2) + '%',
    analysis: muniBetter
      ? `The municipal bond (${teyResult.muniYieldPercent} = ${teyResult.taxEquivalentYieldPercent} TEY) beats the taxable bond (${(taxableYield * 100).toFixed(2)}%) by ${(difference * 100).toFixed(2)}% on a tax-equivalent basis.`
      : `The taxable bond (${(taxableYield * 100).toFixed(2)}%) beats the municipal bond (${teyResult.muniYieldPercent} = ${teyResult.taxEquivalentYieldPercent} TEY) by ${(Math.abs(difference) * 100).toFixed(2)}%.`
  };
}

/**
 * Get all available states
 */
function getStates() {
  return Object.entries(STATE_TAX_RATES)
    .map(([code, rate]) => ({
      code,
      rate,
      ratePercent: (rate * 100).toFixed(2) + '%',
      name: getStateName(code)
    }))
    .sort((a, b) => b.rate - a.rate);
}

function getStateName(code) {
  const names = {
    'CA': 'California', 'NY': 'New York', 'NYC': 'New York City',
    'NJ': 'New Jersey', 'MA': 'Massachusetts', 'OR': 'Oregon',
    'MN': 'Minnesota', 'VT': 'Vermont', 'HI': 'Hawaii',
    'WI': 'Wisconsin', 'ME': 'Maine', 'CT': 'Connecticut',
    'DC': 'Washington DC', 'VA': 'Virginia', 'MD': 'Maryland',
    'CO': 'Colorado', 'IL': 'Illinois', 'PA': 'Pennsylvania',
    'AZ': 'Arizona', 'TX': 'Texas', 'FL': 'Florida',
    'WA': 'Washington', 'NV': 'Nevada', 'WY': 'Wyoming',
    'TN': 'Tennessee', 'AK': 'Alaska', 'SD': 'South Dakota',
    'NH': 'New Hampshire'
  };
  return names[code] || code;
}

module.exports = {
  calculateTEY,
  compareBonds,
  getStates,
  getFederalMarginalRate,
  getStateRate,
  STATE_TAX_RATES
};
