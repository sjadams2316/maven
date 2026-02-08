// Stress Testing Scenarios

const HISTORICAL_SCENARIOS = {
  'dotcom_crash': {
    name: '2000-2002 Dot-Com Crash',
    description: 'Tech bubble burst, 3-year bear market',
    period: '2000-2002',
    shocks: {
      'US Equity': -45.0,
      'Intl Developed': -48.0,
      'Emerging Markets': -35.0,
      'US Bonds': 32.0
    }
  },
  'gfc_2008': {
    name: '2008 Global Financial Crisis',
    description: 'Lehman collapse, global credit freeze',
    period: '2008-2009',
    shocks: {
      'US Equity': -52.0,
      'Intl Developed': -56.0,
      'Emerging Markets': -61.0,
      'US Bonds': 5.0
    }
  },
  'covid_crash': {
    name: '2020 COVID Crash',
    description: 'Fastest bear market in history (34 days)',
    period: 'Feb-Mar 2020',
    shocks: {
      'US Equity': -34.0,
      'Intl Developed': -33.0,
      'Emerging Markets': -32.0,
      'US Bonds': 3.5
    }
  },
  'rate_shock_2022': {
    name: '2022 Rate Shock',
    description: 'Fed aggressive rate hikes, stocks and bonds down together',
    period: '2022',
    shocks: {
      'US Equity': -19.0,
      'Intl Developed': -16.0,
      'Emerging Markets': -22.0,
      'US Bonds': -13.0
    }
  },
  'stagflation_70s': {
    name: '1973-1974 Stagflation',
    description: 'Oil crisis, high inflation, recession',
    period: '1973-1974',
    shocks: {
      'US Equity': -48.0,
      'Intl Developed': -42.0,
      'Emerging Markets': -30.0,
      'US Bonds': -5.0
    }
  },
  'black_monday': {
    name: '1987 Black Monday',
    description: 'Single-day 22% crash',
    period: 'Oct 1987',
    shocks: {
      'US Equity': -33.0,
      'Intl Developed': -28.0,
      'Emerging Markets': -25.0,
      'US Bonds': 2.0
    }
  },
  'em_crisis_1997': {
    name: '1997-1998 EM Crisis',
    description: 'Asian financial crisis, Russian default, LTCM',
    period: '1997-1998',
    shocks: {
      'US Equity': -15.0,
      'Intl Developed': -12.0,
      'Emerging Markets': -55.0,
      'US Bonds': 12.0
    }
  }
};

const HYPOTHETICAL_SCENARIOS = {
  'severe_recession': {
    name: 'Severe Recession',
    description: 'Deep recession, risk-off environment',
    shocks: {
      'US Equity': -40.0,
      'Intl Developed': -45.0,
      'Emerging Markets': -50.0,
      'US Bonds': 8.0
    }
  },
  'inflation_spike': {
    name: 'Inflation Spike',
    description: 'Unexpected inflation surge, rates rise sharply',
    shocks: {
      'US Equity': -25.0,
      'Intl Developed': -20.0,
      'Emerging Markets': -30.0,
      'US Bonds': -15.0
    }
  },
  'dollar_collapse': {
    name: 'Dollar Collapse',
    description: 'Loss of USD reserve status, currency crisis',
    shocks: {
      'US Equity': -35.0,
      'Intl Developed': 10.0,
      'Emerging Markets': 5.0,
      'US Bonds': -25.0
    }
  },
  'tech_bubble_2': {
    name: 'AI Bubble Burst',
    description: 'Tech/AI valuations collapse',
    shocks: {
      'US Equity': -35.0,
      'Intl Developed': -20.0,
      'Emerging Markets': -25.0,
      'US Bonds': 5.0
    }
  }
};

// Apply stress scenario to portfolio
function applyScenario(holdings, fundsData, scenario) {
  let portfolioImpact = 0;
  const holdingImpacts = [];
  
  for (const holding of holdings) {
    const fund = fundsData.find(f => f.ticker === holding.ticker);
    const assetClass = fund?.asset_class || 'US Equity';
    const shock = scenario.shocks[assetClass] || scenario.shocks['US Equity'] || -20;
    
    const impact = shock * holding.weight;
    portfolioImpact += impact;
    
    holdingImpacts.push({
      ticker: holding.ticker,
      name: fund?.name || holding.ticker,
      weight: holding.weight,
      assetClass,
      shock,
      impact
    });
  }
  
  return {
    scenario: scenario.name,
    description: scenario.description,
    period: scenario.period,
    portfolioImpact,
    holdingImpacts
  };
}

// Run all scenarios
function runAllScenarios(holdings, fundsData) {
  const results = {
    historical: [],
    hypothetical: []
  };
  
  for (const [key, scenario] of Object.entries(HISTORICAL_SCENARIOS)) {
    results.historical.push({
      id: key,
      ...applyScenario(holdings, fundsData, scenario)
    });
  }
  
  for (const [key, scenario] of Object.entries(HYPOTHETICAL_SCENARIOS)) {
    results.hypothetical.push({
      id: key,
      ...applyScenario(holdings, fundsData, scenario)
    });
  }
  
  // Sort by impact (worst first)
  results.historical.sort((a, b) => a.portfolioImpact - b.portfolioImpact);
  results.hypothetical.sort((a, b) => a.portfolioImpact - b.portfolioImpact);
  
  return results;
}

// Monte Carlo simulation
function monteCarloSimulation(holdings, fundsData, cma, years = 10, simulations = 1000) {
  const results = [];
  
  // Get portfolio expected return and volatility
  let expectedReturn = 0;
  let volatility = 0;
  
  for (const holding of holdings) {
    const fund = fundsData.find(f => f.ticker === holding.ticker);
    const assetClass = fund?.asset_class || 'US Equity';
    const acData = cma.assetClasses[assetClass];
    
    if (acData) {
      expectedReturn += acData.expectedReturn * holding.weight;
    }
  }
  
  // Simplified volatility calculation (asset-weighted)
  for (const holding of holdings) {
    const fund = fundsData.find(f => f.ticker === holding.ticker);
    const assetClass = fund?.asset_class || 'US Equity';
    const acData = cma.assetClasses[assetClass];
    
    if (acData) {
      volatility += acData.volatility * holding.weight;
    }
  }
  
  // Run simulations
  for (let i = 0; i < simulations; i++) {
    let value = 100;
    const path = [value];
    
    for (let year = 0; year < years; year++) {
      // Random return using normal distribution approximation (Box-Muller)
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      
      const yearReturn = (expectedReturn + z * volatility) / 100;
      value *= (1 + yearReturn);
      path.push(value);
    }
    
    results.push({
      finalValue: value,
      totalReturn: (value - 100) / 100,
      annualizedReturn: Math.pow(value / 100, 1 / years) - 1,
      path
    });
  }
  
  // Sort by final value
  results.sort((a, b) => a.finalValue - b.finalValue);
  
  // Calculate percentiles
  const percentiles = {
    p5: results[Math.floor(simulations * 0.05)],
    p25: results[Math.floor(simulations * 0.25)],
    p50: results[Math.floor(simulations * 0.50)],
    p75: results[Math.floor(simulations * 0.75)],
    p95: results[Math.floor(simulations * 0.95)],
    mean: {
      finalValue: results.reduce((s, r) => s + r.finalValue, 0) / simulations,
      totalReturn: results.reduce((s, r) => s + r.totalReturn, 0) / simulations,
      annualizedReturn: results.reduce((s, r) => s + r.annualizedReturn, 0) / simulations
    }
  };
  
  return {
    simulations,
    years,
    expectedReturn,
    volatility,
    percentiles,
    worstCase: results[0],
    bestCase: results[results.length - 1]
  };
}

module.exports = {
  HISTORICAL_SCENARIOS,
  HYPOTHETICAL_SCENARIOS,
  applyScenario,
  runAllScenarios,
  monteCarloSimulation
};
