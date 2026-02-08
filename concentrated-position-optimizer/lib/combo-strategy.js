// Combo Strategy Model
// Blends multiple strategies for optimal outcome based on client needs

import { calculateCapitalGainsTax, calculateAfterTaxProceeds } from './tax-engine.js';

/**
 * Model a combination strategy
 * Allocates position across multiple strategies based on client priorities
 */
export function modelComboStrategy(params) {
  const {
    currentValue,
    costBasis,
    expectedReturn = 0.07,
    years = 20,
    ordinaryIncome,
    filingStatus,
    state,
    // Allocation percentages (should sum to 100)
    allocation = {
      sellNow: 20,        // Immediate diversification
      exchangeFund: 30,   // Tax-deferred diversification  
      directIndexing: 25, // Tax-efficient gradual sale
      charitable: 15,     // Donate to DAF (if intent)
      holdForStepUp: 10   // Estate planning
    },
    charitableIntent = false,
    newCapitalAvailable = 0
  } = params;

  // Normalize allocation
  const total = Object.values(allocation).reduce((a, b) => a + b, 0);
  const normalized = {};
  for (const [key, val] of Object.entries(allocation)) {
    normalized[key] = val / total;
  }

  // If no charitable intent, reallocate that portion
  if (!charitableIntent && normalized.charitable > 0) {
    const charitablePortion = normalized.charitable;
    normalized.charitable = 0;
    normalized.exchangeFund += charitablePortion / 2;
    normalized.directIndexing += charitablePortion / 2;
  }

  // Calculate amounts for each bucket
  const amounts = {};
  const bases = {};
  for (const [key, pct] of Object.entries(normalized)) {
    amounts[key] = currentValue * pct;
    bases[key] = costBasis * pct;
  }

  // Track cumulative metrics
  let totalTaxPaid = 0;
  let totalCharitableDeduction = 0;
  let totalDeferredTax = 0;
  
  const projections = [];
  const buckets = {
    sellNow: { value: 0, basis: 0 },
    exchangeFund: { value: amounts.exchangeFund, basis: bases.exchangeFund },
    directIndexing: { 
      concentrated: amounts.directIndexing, 
      concentratedBasis: bases.directIndexing,
      indexed: newCapitalAvailable * normalized.directIndexing,
      indexedBasis: newCapitalAvailable * normalized.directIndexing
    },
    charitable: { deduction: 0 },
    holdForStepUp: { value: amounts.holdForStepUp, basis: bases.holdForStepUp }
  };

  // === IMMEDIATE ACTIONS (Year 0) ===

  // 1. Sell Now Bucket - immediate tax hit
  if (amounts.sellNow > 0) {
    const sellResult = calculateAfterTaxProceeds({
      currentValue: amounts.sellNow,
      costBasis: bases.sellNow,
      ordinaryIncome,
      filingStatus,
      state,
      isLongTerm: true
    });
    buckets.sellNow.value = sellResult.afterTaxProceeds;
    buckets.sellNow.basis = sellResult.afterTaxProceeds; // Reset basis
    totalTaxPaid += sellResult.tax;
  }

  // 2. Charitable Bucket - donate to DAF
  if (amounts.charitable > 0 && charitableIntent) {
    // Full FMV deduction, no capital gains
    totalCharitableDeduction = amounts.charitable;
    // Tax savings from deduction (limited to 30% of AGI)
    const deductionLimit = ordinaryIncome * 0.30;
    const usableDeduction = Math.min(totalCharitableDeduction, deductionLimit);
    const taxSavings = usableDeduction * 0.37; // Approximate marginal rate
    buckets.charitable.deduction = totalCharitableDeduction;
    buckets.charitable.taxSavings = taxSavings;
  }

  // 3. Exchange Fund - deferred tax (basis carries over)
  const exchangeFundGain = amounts.exchangeFund - bases.exchangeFund;
  const exchangeFundDeferredTax = calculateCapitalGainsTax({
    gain: exchangeFundGain,
    ordinaryIncome,
    filingStatus,
    state,
    isLongTerm: true
  }).totalTax;
  totalDeferredTax += exchangeFundDeferredTax;

  // 4. Hold for Step-Up - deferred until death
  const holdGain = amounts.holdForStepUp - bases.holdForStepUp;
  const holdDeferredTax = calculateCapitalGainsTax({
    gain: holdGain,
    ordinaryIncome,
    filingStatus,
    state,
    isLongTerm: true
  }).totalTax;
  totalDeferredTax += holdDeferredTax;

  // === PROJECT FORWARD ===
  for (let year = 0; year <= years; year++) {
    // Grow each bucket
    if (year > 0) {
      buckets.sellNow.value *= (1 + expectedReturn);
      buckets.exchangeFund.value *= (1 + expectedReturn * 0.95); // Fee drag
      buckets.directIndexing.concentrated *= (1 + expectedReturn);
      buckets.directIndexing.indexed *= (1 + expectedReturn);
      buckets.holdForStepUp.value *= (1 + expectedReturn);
    }

    // Direct indexing: harvest losses and sell concentrated
    if (year > 0 && buckets.directIndexing.concentrated > 0) {
      const harvestAlpha = Math.max(0.002, 0.02 - (year * 0.002)); // Decays
      const lossesHarvested = buckets.directIndexing.indexed * harvestAlpha;
      
      // Sell some concentrated using losses
      const gainRatio = (buckets.directIndexing.concentrated - buckets.directIndexing.concentratedBasis) / 
                        buckets.directIndexing.concentrated;
      const maxSale = lossesHarvested / Math.max(gainRatio, 0.01);
      const actualSale = Math.min(maxSale, buckets.directIndexing.concentrated * 0.15);
      
      if (actualSale > 0) {
        const basisSold = (buckets.directIndexing.concentratedBasis / buckets.directIndexing.concentrated) * actualSale;
        buckets.directIndexing.concentrated -= actualSale;
        buckets.directIndexing.concentratedBasis -= basisSold;
        buckets.directIndexing.indexed += actualSale; // Reinvest
        buckets.directIndexing.indexedBasis += actualSale;
      }
    }

    // Calculate total values
    const totalNominal = 
      buckets.sellNow.value +
      buckets.exchangeFund.value +
      buckets.directIndexing.concentrated +
      buckets.directIndexing.indexed +
      buckets.holdForStepUp.value;

    // Calculate current deferred tax
    const currentDeferredTax = calculateCapitalGainsTax({
      gain: (buckets.exchangeFund.value - bases.exchangeFund) +
            (buckets.holdForStepUp.value - bases.holdForStepUp) +
            (buckets.directIndexing.concentrated - buckets.directIndexing.concentratedBasis),
      ordinaryIncome,
      filingStatus,
      state,
      isLongTerm: true
    }).totalTax;

    const afterTaxValue = totalNominal - currentDeferredTax;

    projections.push({
      year,
      buckets: {
        sellNow: Math.round(buckets.sellNow.value),
        exchangeFund: Math.round(buckets.exchangeFund.value),
        directIndexConcentrated: Math.round(buckets.directIndexing.concentrated),
        directIndexDiversified: Math.round(buckets.directIndexing.indexed),
        holdForStepUp: Math.round(buckets.holdForStepUp.value)
      },
      nominalValue: Math.round(totalNominal),
      afterTaxValue: Math.round(afterTaxValue),
      totalTaxPaid: Math.round(totalTaxPaid),
      deferredTaxLiability: Math.round(currentDeferredTax),
      charitableDeduction: Math.round(totalCharitableDeduction)
    });
  }

  // Calculate concentration over time
  const initialConcentration = ((amounts.directIndexing + amounts.holdForStepUp) / currentValue) * 100;
  const finalConcentration = (
    (buckets.directIndexing.concentrated + buckets.holdForStepUp.value) /
    projections[projections.length - 1].nominalValue
  ) * 100;

  return {
    strategy: 'combo',
    name: 'Combination Strategy',
    description: `Blend multiple approaches: ${normalized.sellNow > 0 ? Math.round(normalized.sellNow * 100) + '% sell now, ' : ''}${normalized.exchangeFund > 0 ? Math.round(normalized.exchangeFund * 100) + '% exchange fund, ' : ''}${normalized.directIndexing > 0 ? Math.round(normalized.directIndexing * 100) + '% direct indexing, ' : ''}${normalized.charitable > 0 && charitableIntent ? Math.round(normalized.charitable * 100) + '% charitable, ' : ''}${normalized.holdForStepUp > 0 ? Math.round(normalized.holdForStepUp * 100) + '% hold for step-up' : ''}`,
    allocation: {
      sellNow: { 
        percent: Math.round(normalized.sellNow * 100),
        amount: Math.round(amounts.sellNow),
        taxPaid: Math.round(totalTaxPaid)
      },
      exchangeFund: {
        percent: Math.round(normalized.exchangeFund * 100),
        amount: Math.round(amounts.exchangeFund),
        deferredTax: Math.round(exchangeFundDeferredTax)
      },
      directIndexing: {
        percent: Math.round(normalized.directIndexing * 100),
        amount: Math.round(amounts.directIndexing),
        newCapital: Math.round(newCapitalAvailable * normalized.directIndexing)
      },
      charitable: charitableIntent ? {
        percent: Math.round(normalized.charitable * 100),
        amount: Math.round(amounts.charitable),
        deduction: Math.round(totalCharitableDeduction),
        taxSavings: Math.round(buckets.charitable.taxSavings || 0)
      } : null,
      holdForStepUp: {
        percent: Math.round(normalized.holdForStepUp * 100),
        amount: Math.round(amounts.holdForStepUp),
        potentialStepUpSavings: Math.round(holdDeferredTax)
      }
    },
    taxSummary: {
      immediatelyPaid: Math.round(totalTaxPaid),
      deferred: Math.round(totalDeferredTax),
      avoided: charitableIntent ? Math.round(calculateCapitalGainsTax({
        gain: amounts.charitable - bases.charitable,
        ordinaryIncome,
        filingStatus,
        state,
        isLongTerm: true
      }).totalTax) : 0,
      charitableDeduction: Math.round(totalCharitableDeduction),
      potentialStepUpSavings: Math.round(holdDeferredTax)
    },
    pros: [
      'Balances immediate diversification with tax efficiency',
      'Multiple "buckets" provide flexibility',
      'Some immediate liquidity while deferring most taxes',
      charitableIntent ? 'Charitable deduction provides immediate tax benefit' : null,
      'Hold portion preserves step-up option for estate planning'
    ].filter(Boolean),
    cons: [
      'Complexity - multiple strategies to manage',
      'May not be optimal for any single goal',
      'Requires ongoing attention and rebalancing',
      'Exchange fund portion has 7-year lockup'
    ],
    concentrationPath: {
      initial: Math.round(initialConcentration),
      final: Math.round(finalConcentration),
      reduction: Math.round(initialConcentration - finalConcentration)
    },
    projections,
    keyMetrics: {
      concentrationRisk: `Reduced from ${Math.round(initialConcentration)}% to ${Math.round(finalConcentration)}%`,
      liquidityRisk: 'Mixed - some immediate, some locked',
      taxEfficiency: 'Optimized across multiple dimensions'
    }
  };
}

/**
 * Calculate optimal allocation based on client priorities
 */
export function suggestAllocation(params) {
  const {
    currentValue,
    costBasis,
    charitableIntent = false,
    liquidityNeed = 'moderate', // low, moderate, high
    riskTolerance = 'moderate', // low, moderate, high
    timeHorizon = 20,
    hasNewCapital = false,
    estateIntent = false
  } = params;

  const gain = currentValue - costBasis;
  const embeddedGainRatio = gain / currentValue;

  let allocation = {
    sellNow: 0,
    exchangeFund: 0,
    directIndexing: 0,
    charitable: 0,
    holdForStepUp: 0
  };

  // Base on liquidity need
  if (liquidityNeed === 'high') {
    allocation.sellNow = 30;
  } else if (liquidityNeed === 'moderate') {
    allocation.sellNow = 15;
  } else {
    allocation.sellNow = 5;
  }

  // Charitable allocation
  if (charitableIntent) {
    allocation.charitable = embeddedGainRatio > 0.5 ? 20 : 10;
  }

  // Estate planning
  if (estateIntent || timeHorizon > 20) {
    allocation.holdForStepUp = 15;
  } else {
    allocation.holdForStepUp = 5;
  }

  // Direct indexing (if have capital)
  if (hasNewCapital) {
    allocation.directIndexing = 30;
  } else {
    allocation.directIndexing = 10;
  }

  // Rest goes to exchange fund
  const allocated = Object.values(allocation).reduce((a, b) => a + b, 0);
  allocation.exchangeFund = Math.max(0, 100 - allocated);

  return {
    allocation,
    reasoning: [
      liquidityNeed === 'high' ? 'Higher sell-now allocation for liquidity needs' : null,
      charitableIntent ? 'Charitable allocation for tax-efficient giving' : null,
      hasNewCapital ? 'Direct indexing allocation (have new capital)' : 'Limited direct indexing (no new capital)',
      estateIntent ? 'Hold portion for step-up at death' : null,
      'Exchange fund for tax-deferred diversification'
    ].filter(Boolean)
  };
}

export default {
  modelComboStrategy,
  suggestAllocation
};
