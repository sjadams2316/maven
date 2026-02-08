// Strategy Modeling Engine v2
// Rebuilt with accurate mechanics based on deep research

import { calculateCapitalGainsTax, calculateAfterTaxProceeds } from './tax-engine.js';

/**
 * Strategy 1: Hold (Do Nothing)
 * Baseline - keep the concentrated position
 */
export function modelHoldStrategy(params) {
  const {
    currentValue,
    costBasis,
    expectedReturn = 0.07,
    volatility = 0.25,
    years = 20,
    ordinaryIncome,
    filingStatus,
    state
  } = params;

  const projections = [];
  let value = currentValue;

  for (let year = 0; year <= years; year++) {
    const gain = value - costBasis;
    const taxIfSold = calculateCapitalGainsTax({
      gain: Math.max(0, gain),
      ordinaryIncome,
      filingStatus,
      state,
      isLongTerm: true
    }).totalTax;

    projections.push({
      year,
      nominalValue: Math.round(value),
      afterTaxValue: Math.round(value - taxIfSold),
      unrealizedGain: Math.round(gain),
      taxLiability: Math.round(taxIfSold),
      concentration: 100
    });

    value *= (1 + expectedReturn);
  }

  return {
    strategy: 'hold',
    name: 'Hold Position',
    description: 'Maintain the concentrated position with no action. Tax liability grows but is never triggered.',
    pros: [
      'No immediate tax liability',
      'Full upside participation',
      'Simple - no action required',
      'Potential step-up in basis at death'
    ],
    cons: [
      'Full concentration risk (single stock can drop 50%+)',
      'Tax liability grows with appreciation',
      'No diversification benefit',
      'Opportunity cost of not diversifying'
    ],
    projections,
    keyMetrics: {
      concentrationRisk: 'HIGH - 100% in single stock',
      liquidityRisk: 'Low - can sell anytime (but triggers tax)',
      taxEfficiency: 'Deferred indefinitely until sale or death'
    }
  };
}

/**
 * Strategy 2: Sell and Reinvest
 * Pay taxes now, diversify immediately
 */
export function modelSellAndReinvestStrategy(params) {
  const {
    currentValue,
    costBasis,
    diversifiedReturn = 0.07,
    years = 20,
    ordinaryIncome,
    filingStatus,
    state
  } = params;

  // Calculate immediate tax hit
  const saleResult = calculateAfterTaxProceeds({
    currentValue,
    costBasis,
    ordinaryIncome,
    filingStatus,
    state,
    isLongTerm: true
  });

  const afterTaxBasis = saleResult.afterTaxProceeds;
  const projections = [];
  let value = afterTaxBasis;

  for (let year = 0; year <= years; year++) {
    const newGain = value - afterTaxBasis;
    const taxIfSold = calculateCapitalGainsTax({
      gain: Math.max(0, newGain),
      ordinaryIncome,
      filingStatus,
      state,
      isLongTerm: true
    }).totalTax;

    projections.push({
      year,
      nominalValue: Math.round(value),
      afterTaxValue: Math.round(value - taxIfSold),
      unrealizedGain: Math.round(newGain),
      taxLiability: Math.round(taxIfSold),
      concentration: 0
    });

    value *= (1 + diversifiedReturn);
  }

  return {
    strategy: 'sell_reinvest',
    name: 'Sell & Diversify',
    description: 'Sell position immediately, pay capital gains tax, reinvest in diversified portfolio.',
    immediateImpact: {
      grossProceeds: currentValue,
      taxPaid: saleResult.tax,
      afterTaxProceeds: Math.round(afterTaxBasis),
      taxRate: saleResult.taxDrag
    },
    pros: [
      'Immediate full diversification',
      'Eliminates concentration risk completely',
      'Clean slate with new cost basis',
      'Simple and decisive'
    ],
    cons: [
      `Significant upfront tax: $${saleResult.tax.toLocaleString()} (${saleResult.taxDrag.toFixed(1)}%)`,
      'Less capital working for you from day one',
      'Irreversible - cannot undo'
    ],
    projections,
    keyMetrics: {
      concentrationRisk: 'ELIMINATED',
      liquidityRisk: 'None',
      taxEfficiency: `Low - ${saleResult.taxDrag.toFixed(1)}% immediate drag`
    }
  };
}

/**
 * Strategy 3: Direct Indexing + Tax Loss Harvesting
 * CORRECTED: Requires NEW capital to fund direct index portfolio
 * Losses harvested from direct index offset gains when selling concentrated stock
 */
export function modelDirectIndexingStrategy(params) {
  const {
    currentValue,
    costBasis,
    expectedReturn = 0.07,
    years = 20,
    newCapitalAvailable = 0, // NEW: Capital available for direct index portfolio
    ordinaryIncome,
    filingStatus,
    state
  } = params;

  // If no new capital specified, assume they can contribute equal to position value
  const directIndexCapital = newCapitalAvailable || currentValue;
  
  const gain = currentValue - costBasis;
  const taxCalc = calculateCapitalGainsTax({
    gain,
    ordinaryIncome,
    filingStatus,
    state,
    isLongTerm: true
  });

  // Loss harvesting alpha decays over time
  // Year 1: ~2%, decaying to ~0.5% by year 7, near 0 by year 10
  const getLossHarvestingAlpha = (year) => {
    if (year <= 1) return 0.020;
    if (year <= 3) return 0.015;
    if (year <= 5) return 0.010;
    if (year <= 7) return 0.005;
    if (year <= 10) return 0.003;
    return 0.001; // Minimal after year 10
  };

  const projections = [];
  let concentratedValue = currentValue;
  let concentratedBasis = costBasis;
  let directIndexValue = directIndexCapital;
  let directIndexBasis = directIndexCapital;
  let accumulatedLosses = 0;
  let totalTaxPaid = 0;

  // Strategy: Harvest losses each year, sell concentrated stock when losses available
  for (let year = 0; year <= years; year++) {
    // Harvest losses from direct index portfolio
    const harvestAlpha = getLossHarvestingAlpha(year);
    const lossesHarvestedThisYear = directIndexValue * harvestAlpha;
    accumulatedLosses += lossesHarvestedThisYear;

    // Calculate how much concentrated stock we can sell tax-efficiently
    let concentratedSoldThisYear = 0;
    let taxPaidThisYear = 0;

    if (accumulatedLosses > 0 && concentratedValue > 0 && year > 0) {
      // Sell concentrated stock up to the amount we can offset with losses
      // Gain per dollar of concentrated stock sold
      const gainRatio = (concentratedValue - concentratedBasis) / concentratedValue;
      
      // Max we can sell where gains are fully offset
      const maxTaxFreeSale = accumulatedLosses / Math.max(gainRatio, 0.01);
      const targetSalePercent = 0.15; // Don't sell more than 15% per year
      const targetSale = concentratedValue * targetSalePercent;
      
      concentratedSoldThisYear = Math.min(targetSale, maxTaxFreeSale, concentratedValue);
      
      const gainRealized = concentratedSoldThisYear * gainRatio;
      const lossesUsed = Math.min(accumulatedLosses, gainRealized);
      const netGain = gainRealized - lossesUsed;
      
      if (netGain > 0) {
        taxPaidThisYear = calculateCapitalGainsTax({
          gain: netGain,
          ordinaryIncome,
          filingStatus,
          state,
          isLongTerm: true
        }).totalTax;
      }
      
      accumulatedLosses -= lossesUsed;
      totalTaxPaid += taxPaidThisYear;
      
      // Update concentrated position
      const basisSold = (concentratedBasis / concentratedValue) * concentratedSoldThisYear;
      concentratedValue -= concentratedSoldThisYear;
      concentratedBasis -= basisSold;
      
      // Add to direct index (proceeds minus tax)
      directIndexValue += concentratedSoldThisYear - taxPaidThisYear;
      directIndexBasis += concentratedSoldThisYear - taxPaidThisYear;
    }

    const totalValue = concentratedValue + directIndexValue;
    const concentration = totalValue > 0 ? (concentratedValue / totalValue) * 100 : 0;

    // Calculate tax if liquidated now
    const remainingConcentratedGain = Math.max(0, concentratedValue - concentratedBasis);
    const directIndexGain = Math.max(0, directIndexValue - directIndexBasis);
    const totalGain = remainingConcentratedGain + directIndexGain;
    const taxIfLiquidated = calculateCapitalGainsTax({
      gain: totalGain,
      ordinaryIncome,
      filingStatus,
      state,
      isLongTerm: true
    }).totalTax;

    projections.push({
      year,
      concentratedValue: Math.round(concentratedValue),
      directIndexValue: Math.round(directIndexValue),
      nominalValue: Math.round(totalValue),
      afterTaxValue: Math.round(totalValue - taxIfLiquidated),
      concentration: Math.round(concentration),
      lossesHarvested: Math.round(lossesHarvestedThisYear),
      accumulatedLosses: Math.round(accumulatedLosses),
      concentratedSold: Math.round(concentratedSoldThisYear),
      taxPaid: Math.round(taxPaidThisYear),
      totalTaxPaid: Math.round(totalTaxPaid)
    });

    // Grow both portions
    concentratedValue *= (1 + expectedReturn);
    directIndexValue *= (1 + expectedReturn);
  }

  // Calculate years to meaningful diversification
  const yearTo50Percent = projections.findIndex(p => p.concentration <= 50);
  const yearTo25Percent = projections.findIndex(p => p.concentration <= 25);

  return {
    strategy: 'direct_indexing',
    name: 'Direct Indexing + Tax Loss Harvesting',
    description: `Fund a separate ${directIndexCapital.toLocaleString()} direct indexing portfolio. Harvest losses to offset gains when selling concentrated stock over time.`,
    capitalRequired: {
      newCapital: directIndexCapital,
      note: 'Requires NEW capital to fund the direct index portfolio'
    },
    timeToReduce: {
      to50Percent: yearTo50Percent > 0 ? `${yearTo50Percent} years` : 'N/A',
      to25Percent: yearTo25Percent > 0 ? `${yearTo25Percent} years` : 'N/A'
    },
    pros: [
      'Tax-efficient gradual diversification',
      'Maintains full upside on concentrated position during transition',
      'Ongoing tax alpha from loss harvesting (~1-2% early years)',
      'Flexibility - can accelerate or slow down as needed'
    ],
    cons: [
      `Requires significant new capital: $${directIndexCapital.toLocaleString()}`,
      'Takes years to fully diversify (concentration risk during transition)',
      'Loss harvesting effectiveness decays after ~7 years',
      'Complexity - requires ongoing management',
      'End up with "bag of index stocks" after harvesting exhausted'
    ],
    projections,
    keyMetrics: {
      concentrationRisk: 'Decreasing over time',
      newCapitalRequired: `$${directIndexCapital.toLocaleString()}`,
      taxEfficiency: 'High early, decays over time'
    }
  };
}

/**
 * Strategy 4: Exchange Fund (Section 721)
 * CORRECTED: Basis carries over, tax is deferred not eliminated
 */
export function modelExchangeFundStrategy(params) {
  const {
    currentValue,
    costBasis,
    diversifiedReturn = 0.065, // Slightly lower due to fees and illiquid allocation
    years = 20,
    lockupYears = 7,
    managementFee = 0.015, // 1.5% annual fee typical
    illiquidAllocation = 0.20, // 20% in real estate required
    ordinaryIncome,
    filingStatus,
    state
  } = params;

  const originalBasis = costBasis; // BASIS CARRIES OVER
  const projections = [];
  let value = currentValue;

  // Account for fee drag and illiquid allocation
  const effectiveReturn = diversifiedReturn - managementFee;
  // Illiquid portion may have different returns
  const liquidReturn = effectiveReturn;
  const illiquidReturn = 0.05; // Real estate ~5%
  const blendedReturn = (liquidReturn * (1 - illiquidAllocation)) + (illiquidReturn * illiquidAllocation);

  for (let year = 0; year <= years; year++) {
    // Gain calculated on ORIGINAL basis (this is key - basis carries over)
    const gain = value - originalBasis;
    const taxIfSold = calculateCapitalGainsTax({
      gain: Math.max(0, gain),
      ordinaryIncome,
      filingStatus,
      state,
      isLongTerm: true
    }).totalTax;

    const isLocked = year < lockupYears;
    
    // K-1 income drag (fund generates some taxable events internally)
    const k1Drag = year > 0 ? value * 0.003 : 0; // ~0.3% annual K-1 income

    projections.push({
      year,
      nominalValue: Math.round(value),
      afterTaxValue: Math.round(value - taxIfSold),
      unrealizedGain: Math.round(gain),
      deferredTaxLiability: Math.round(taxIfSold),
      concentration: 0, // Diversified from day 1
      liquidityStatus: isLocked ? 'Locked' : 'Liquid',
      k1Income: Math.round(k1Drag),
      originalBasis: Math.round(originalBasis) // Reminder that basis carries over
    });

    value *= (1 + blendedReturn);
  }

  return {
    strategy: 'exchange_fund',
    name: 'Exchange Fund (Section 721)',
    description: 'Contribute stock to partnership, receive diversified interest. Tax-free contribution but original basis carries over.',
    requirements: {
      minimumInvestment: '$500,000 - $5,000,000 typical',
      accreditedInvestor: true,
      lockupPeriod: `${lockupYears} years (IRS requirement)`,
      eligibleSecurities: 'Publicly traded, must meet diversification rules',
      illiquidAllocation: '20% must be in real estate (IRS requirement)'
    },
    taxTreatment: {
      contribution: 'Tax-free under IRC Section 721',
      basisCarryover: 'YES - Original basis carries over to diversified basket',
      atExit: `You receive diversified stocks but still have $${costBasis.toLocaleString()} basis`,
      deferral: 'Tax is DEFERRED, not eliminated',
      k1Income: 'Annual K-1 reporting for fund income/expenses'
    },
    pros: [
      'Immediate diversification',
      'No tax on contribution',
      'Professional management',
      'Potential estate planning benefits'
    ],
    cons: [
      `${lockupYears}-year lockup period (cannot access funds)`,
      'Tax is DEFERRED, not eliminated (basis carries over)',
      'High minimums ($500K-$5M)',
      'Limited to eligible securities',
      `Management fees ~${(managementFee * 100).toFixed(1)}% annually`,
      'Annual K-1 tax reporting complexity',
      '20% stuck in illiquid real estate'
    ],
    projections,
    keyMetrics: {
      concentrationRisk: 'ELIMINATED (diversified day 1)',
      liquidityRisk: `HIGH for ${lockupYears} years`,
      taxEfficiency: 'Deferred (not eliminated) - basis carries over'
    }
  };
}

/**
 * Strategy 5: Prepaid Variable Forward (PVF)
 * NEW: Sophisticated monetization strategy
 */
export function modelPrepaidVariableForward(params) {
  const {
    currentValue,
    costBasis,
    expectedReturn = 0.07,
    years = 20,
    pvfTerm = 3, // Typical PVF term in years
    floorPercent = 1.00, // 100% of current price
    capPercent = 1.20, // 120% of current price
    financingRate = 0.05, // Interest rate on prepayment
    ordinaryIncome,
    filingStatus,
    state
  } = params;

  // Calculate prepayment amount
  // Narrow band (100%/120%) = ~90% prepayment
  // Wide band (80%/140%) = ~78% prepayment
  const bandWidth = capPercent - floorPercent;
  const prepaymentPercent = 0.95 - (bandWidth * 0.75); // Rough approximation
  const prepaymentAmount = currentValue * prepaymentPercent;

  const projections = [];
  
  // Model multiple PVF cycles or settlement scenarios
  let cashReceived = prepaymentAmount;
  let stockPledged = currentValue;
  let originalBasis = costBasis;
  
  // Assume cash is invested at diversified return
  const diversifiedReturn = expectedReturn - 0.01;

  for (let year = 0; year <= years; year++) {
    let scenario = 'holding';
    let sharesDelivered = 0;
    let taxPaid = 0;
    let cashValue = 0;
    let stockValue = stockPledged;
    
    if (year === pvfTerm) {
      // Settlement year - model three scenarios
      scenario = 'settlement';
      
      // Assume stock grew at expected return
      stockValue = currentValue * Math.pow(1 + expectedReturn, pvfTerm);
      
      // Determine delivery based on stock price vs floor/cap
      const settlementPrice = stockValue;
      const floorPrice = currentValue * floorPercent;
      const capPrice = currentValue * capPercent;
      
      if (settlementPrice <= floorPrice) {
        // Stock at or below floor - deliver all shares
        sharesDelivered = 100;
        taxPaid = calculateCapitalGainsTax({
          gain: settlementPrice - originalBasis,
          ordinaryIncome,
          filingStatus,
          state,
          isLongTerm: true
        }).totalTax;
      } else if (settlementPrice >= capPrice) {
        // Stock above cap - deliver fewer shares, keep upside
        const excessValue = settlementPrice - capPrice;
        sharesDelivered = ((capPrice - floorPrice) / settlementPrice) * 100;
        // Tax on delivered portion
        const gainOnDelivered = (sharesDelivered / 100) * (settlementPrice - originalBasis);
        taxPaid = calculateCapitalGainsTax({
          gain: gainOnDelivered,
          ordinaryIncome,
          filingStatus,
          state,
          isLongTerm: true
        }).totalTax;
      } else {
        // Stock between floor and cap - variable delivery
        sharesDelivered = ((settlementPrice - floorPrice) / settlementPrice) * 100;
        const gainOnDelivered = (sharesDelivered / 100) * (settlementPrice - originalBasis);
        taxPaid = calculateCapitalGainsTax({
          gain: gainOnDelivered,
          ordinaryIncome,
          filingStatus,
          state,
          isLongTerm: true
        }).totalTax;
      }
    }

    // Cash grows at diversified return
    cashValue = prepaymentAmount * Math.pow(1 + diversifiedReturn, year);
    
    // Total value
    const stockPortion = year < pvfTerm ? stockValue : stockValue * (1 - sharesDelivered / 100);
    const totalValue = cashValue + stockPortion;
    
    projections.push({
      year,
      prepaymentValue: Math.round(cashValue),
      stockValue: Math.round(stockPortion),
      nominalValue: Math.round(totalValue),
      afterTaxValue: Math.round(totalValue - taxPaid),
      scenario,
      sharesDelivered: Math.round(sharesDelivered),
      taxPaid: Math.round(taxPaid)
    });

    stockPledged *= (1 + expectedReturn);
  }

  return {
    strategy: 'prepaid_variable_forward',
    name: 'Prepaid Variable Forward (PVF)',
    description: `Receive ${(prepaymentPercent * 100).toFixed(0)}% of stock value upfront ($${Math.round(prepaymentAmount).toLocaleString()}) in exchange for future delivery of variable shares.`,
    contractTerms: {
      prepaymentAmount: Math.round(prepaymentAmount),
      prepaymentPercent: `${(prepaymentPercent * 100).toFixed(0)}%`,
      term: `${pvfTerm} years`,
      floor: `${(floorPercent * 100).toFixed(0)}% ($${Math.round(currentValue * floorPercent).toLocaleString()})`,
      cap: `${(capPercent * 100).toFixed(0)}% ($${Math.round(currentValue * capPercent).toLocaleString()})`,
      upsideParticipation: `Above cap, keep ${((capPercent - floorPercent) / capPercent * 100).toFixed(0)}% of excess`
    },
    taxTreatment: {
      atInception: 'No taxable event (per IRS Rev. Ruling 2003-7)',
      straddleRules: 'Subject to IRC Section 1092 straddle rules',
      atSettlement: 'Capital gains recognized on shares delivered',
      requirements: 'Must have 20%+ gap between floor and cap for tax deferral'
    },
    pros: [
      `Immediate liquidity: $${Math.round(prepaymentAmount).toLocaleString()} cash upfront`,
      'Downside protection (floor)',
      'Retain some upside participation',
      'No immediate tax liability',
      'Can diversify the cash received'
    ],
    cons: [
      `Upside capped at ${((capPercent - 1) * 100).toFixed(0)}%`,
      'Complex structure with counterparty (investment bank)',
      'Subject to straddle rules (can complicate taxes)',
      'Does not achieve true diversification',
      'May conflict with insider trading policies',
      'Financing costs embedded in prepayment discount'
    ],
    projections,
    keyMetrics: {
      concentrationRisk: 'Reduced (hedged) but not eliminated',
      liquidityRisk: 'LOW - immediate cash access',
      taxEfficiency: `Deferred ${pvfTerm} years until settlement`
    }
  };
}

/**
 * Strategy 6: Charitable Remainder Trust (CRT)
 * NEW: For clients with charitable intent
 */
export function modelCharitableRemainderTrust(params) {
  const {
    currentValue,
    costBasis,
    diversifiedReturn = 0.06,
    years = 20,
    crtTerm = 20, // Years or lifetime
    payoutRate = 0.05, // 5% minimum, 50% maximum
    charitableIntent = true, // Must be true for this to make sense
    ordinaryIncome,
    filingStatus,
    state
  } = params;

  if (!charitableIntent) {
    return {
      strategy: 'crt',
      name: 'Charitable Remainder Trust',
      description: 'NOT RECOMMENDED - Client has no charitable intent',
      error: 'CRT only makes sense for clients who want to benefit charity',
      projections: []
    };
  }

  const gain = currentValue - costBasis;
  
  // CRT sells stock TAX-FREE (CRT is tax-exempt)
  // No capital gains tax on sale inside trust
  const amountInTrust = currentValue; // Full value, no tax drag
  
  // Calculate charitable deduction (present value of remainder)
  // Simplified: ~30-40% of contribution depending on term and payout rate
  const remainderFactor = Math.pow(1 - payoutRate, crtTerm);
  const charitableDeduction = currentValue * remainderFactor * 0.9; // Rough approximation
  
  // Tax savings from deduction (limited to 30% of AGI for appreciated property)
  const deductionLimit = ordinaryIncome * 0.30;
  const usableDeduction = Math.min(charitableDeduction, deductionLimit);
  const taxSavings = usableDeduction * 0.40; // Approximate marginal rate

  const projections = [];
  let trustValue = amountInTrust;

  for (let year = 0; year <= years; year++) {
    const annualPayout = trustValue * payoutRate;
    
    // Payout is taxable to beneficiary (tiered - simplified here)
    const payoutTax = annualPayout * 0.25; // Blend of ordinary income and capital gains
    const afterTaxPayout = annualPayout - payoutTax;
    
    projections.push({
      year,
      trustValue: Math.round(trustValue),
      annualPayout: Math.round(annualPayout),
      afterTaxPayout: Math.round(afterTaxPayout),
      cumulativePayouts: Math.round(afterTaxPayout * year),
      remainderToCharity: Math.round(trustValue - (trustValue * payoutRate))
    });

    // Trust grows then pays out
    trustValue = trustValue * (1 + diversifiedReturn) - annualPayout;
    trustValue = Math.max(0, trustValue);
  }

  return {
    strategy: 'crt',
    name: 'Charitable Remainder Trust (CRT)',
    description: 'Contribute stock to CRT, receive income stream for life/term, remainder goes to charity.',
    charitableBenefit: {
      remainderToCharity: `Estimated $${Math.round(amountInTrust * remainderFactor).toLocaleString()} after ${crtTerm} years`,
      charitableDeduction: `$${Math.round(charitableDeduction).toLocaleString()} (may be limited by AGI)`,
      taxSavingsFromDeduction: `~$${Math.round(taxSavings).toLocaleString()}`
    },
    incomeStream: {
      annualPayout: `$${Math.round(amountInTrust * payoutRate).toLocaleString()} (${(payoutRate * 100).toFixed(0)}% of trust)`,
      payoutTaxation: 'Taxable to beneficiary (tiered: ordinary income first, then capital gains)',
      term: `${crtTerm} years or lifetime`
    },
    taxTreatment: {
      capitalGainsOnSale: 'NONE - CRT is tax-exempt entity',
      charitableDeduction: 'Limited to 30% of AGI for appreciated property',
      carryforward: 'Unused deduction carries forward 5 years',
      payoutTax: 'Income from CRT is taxable (tiered)'
    },
    pros: [
      'No capital gains tax on sale inside CRT',
      'Immediate charitable deduction',
      'Income stream for life or term of years',
      'Full fair market value goes to work (no tax drag)',
      'Supports causes you care about'
    ],
    cons: [
      'IRREVOCABLE - cannot change your mind',
      'Only makes sense if charitable intent exists',
      'Payouts are taxable income',
      'Charity must receive at least 10% of initial value (IRS rule)',
      'Complexity in setup and administration',
      'Lost inheritance for heirs (remainder goes to charity)'
    ],
    projections,
    keyMetrics: {
      concentrationRisk: 'ELIMINATED (trust is diversified)',
      liquidityRisk: 'Income only (cannot access principal)',
      taxEfficiency: 'HIGHEST - avoids capital gains entirely'
    }
  };
}

/**
 * Compare all strategies
 */
export function compareStrategies(params) {
  const strategies = {
    hold: modelHoldStrategy(params),
    sellReinvest: modelSellAndReinvestStrategy(params),
    directIndexing: modelDirectIndexingStrategy(params),
    exchangeFund: modelExchangeFundStrategy(params),
    pvf: modelPrepaidVariableForward(params)
  };

  // Only add CRT if charitable intent
  if (params.charitableIntent) {
    strategies.crt = modelCharitableRemainderTrust(params);
  }

  // Extract key comparison points
  const comparison = {
    year10: {},
    year20: {},
    summary: {}
  };

  for (const [key, strategy] of Object.entries(strategies)) {
    if (strategy.error) continue;
    
    const proj10 = strategy.projections?.find(p => p.year === 10);
    const proj20 = strategy.projections?.find(p => p.year === 20);
    const finalProj = strategy.projections?.[strategy.projections.length - 1];

    comparison.year10[key] = {
      name: strategy.name,
      afterTaxValue: proj10?.afterTaxValue || 0,
      concentration: proj10?.concentration ?? 0
    };

    comparison.year20[key] = {
      name: strategy.name,
      afterTaxValue: proj20?.afterTaxValue || 0,
      concentration: proj20?.concentration ?? 0
    };

    comparison.summary[key] = {
      name: strategy.name,
      strategy: strategy.strategy,
      finalAfterTaxValue: finalProj?.afterTaxValue || 0,
      concentrationAtEnd: finalProj?.concentration ?? 0,
      pros: strategy.pros,
      cons: strategy.cons,
      keyMetrics: strategy.keyMetrics
    };
  }

  return {
    strategies,
    comparison,
    recommendation: generateRecommendation(params, strategies, comparison)
  };
}

/**
 * Generate smarter recommendation based on client situation
 */
function generateRecommendation(params, strategies, comparison) {
  const { currentValue, costBasis, years, charitableIntent, newCapitalAvailable } = params;
  const gain = currentValue - costBasis;
  const gainPercent = ((gain / costBasis) * 100).toFixed(0);
  const embeddedGainRatio = gain / currentValue;

  let recommendation = {
    topStrategies: [],
    analysis: [],
    situationalFactors: [],
    cautions: []
  };

  // Analyze situation
  recommendation.analysis.push(
    `Position has ${gainPercent}% unrealized gain ($${gain.toLocaleString()}).`
  );
  recommendation.analysis.push(
    `Embedded gain represents ${(embeddedGainRatio * 100).toFixed(0)}% of current value.`
  );

  // Situational recommendations
  if (charitableIntent) {
    recommendation.topStrategies.push({
      strategy: 'crt',
      name: 'Charitable Remainder Trust',
      reason: 'Charitable intent + high embedded gain = CRT avoids capital gains entirely'
    });
    recommendation.situationalFactors.push('Charitable intent present - CRT is highly tax-efficient');
  }

  if (embeddedGainRatio > 0.7) {
    recommendation.situationalFactors.push('High embedded gain ratio (>70%) - tax efficiency is critical');
    recommendation.topStrategies.push({
      strategy: 'exchangeFund',
      name: 'Exchange Fund',
      reason: 'High embedded gain + diversification need = tax-free contribution'
    });
  }

  if (newCapitalAvailable && newCapitalAvailable >= gain * 2) {
    recommendation.topStrategies.push({
      strategy: 'directIndexing',
      name: 'Direct Indexing',
      reason: 'Sufficient new capital available to fund loss harvesting portfolio'
    });
    recommendation.situationalFactors.push(`New capital ($${newCapitalAvailable.toLocaleString()}) sufficient for direct indexing`);
  } else {
    recommendation.cautions.push('Direct indexing requires significant new capital - may not be feasible');
  }

  if (years < 7) {
    recommendation.cautions.push('Short time horizon (<7 years) limits exchange fund viability due to lockup');
  }

  // Sort by after-tax value but weight situational fit
  const results = comparison.year20;
  const sorted = Object.entries(results)
    .filter(([key]) => strategies[key] && !strategies[key].error)
    .sort((a, b) => b[1].afterTaxValue - a[1].afterTaxValue);

  if (sorted.length > 0) {
    const best = sorted[0];
    recommendation.analysis.push(
      `Based on 20-year projections, ${best[1].name} shows highest after-tax value at $${best[1].afterTaxValue.toLocaleString()}.`
    );
  }

  // Add nuance
  recommendation.analysis.push(
    'However, "best" depends on your priorities: liquidity, simplicity, risk tolerance, and charitable intent.'
  );

  return recommendation;
}

export default {
  modelHoldStrategy,
  modelSellAndReinvestStrategy,
  modelDirectIndexingStrategy,
  modelExchangeFundStrategy,
  modelPrepaidVariableForward,
  modelCharitableRemainderTrust,
  compareStrategies
};
