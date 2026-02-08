/**
 * Historical Stress Test Scenarios
 * 
 * These are actual historical periods that can be used to stress test portfolios.
 * Returns are monthly for accuracy, annualized for display.
 */

export interface StressScenario {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  durationMonths: number;
  
  // Asset class returns during the period (total, not annualized)
  returns: {
    usEquity: number;
    intlEquity: number;
    bonds: number;
    reits: number;
    gold: number;
    cash: number;
    bitcoin?: number;
  };
  
  // Market metrics during the scenario
  metrics: {
    sp500Peak: number;
    sp500Trough: number;
    maxDrawdown: number;
    vixPeak: number;
    unemploymentPeak?: number;
    gdpChange?: number;
  };
  
  // Recovery information
  recovery: {
    monthsToRecover: number;
    dateRecovered: string;
  };
  
  // What triggered/characterized this period
  triggers: string[];
}

export const STRESS_SCENARIOS: StressScenario[] = [
  {
    name: 'Global Financial Crisis',
    description: 'Subprime mortgage collapse, Lehman bankruptcy, global credit freeze',
    startDate: '2007-10-09',
    endDate: '2009-03-09',
    durationMonths: 17,
    returns: {
      usEquity: -0.57,
      intlEquity: -0.62,
      bonds: 0.14,
      reits: -0.68,
      gold: 0.26,
      cash: 0.03,
    },
    metrics: {
      sp500Peak: 1565,
      sp500Trough: 666,
      maxDrawdown: -0.574,
      vixPeak: 89.5,
      unemploymentPeak: 10.0,
      gdpChange: -0.042,
    },
    recovery: {
      monthsToRecover: 65,
      dateRecovered: '2013-03-28',
    },
    triggers: [
      'Subprime mortgage defaults',
      'Lehman Brothers bankruptcy',
      'AIG bailout',
      'Global credit freeze',
      'Housing market collapse',
    ],
  },
  {
    name: 'COVID-19 Crash',
    description: 'Fastest market crash in history due to pandemic shutdown',
    startDate: '2020-02-19',
    endDate: '2020-03-23',
    durationMonths: 1.1,
    returns: {
      usEquity: -0.34,
      intlEquity: -0.33,
      bonds: 0.03,
      reits: -0.43,
      gold: -0.05,
      cash: 0.00,
      bitcoin: -0.52,
    },
    metrics: {
      sp500Peak: 3386,
      sp500Trough: 2191,
      maxDrawdown: -0.339,
      vixPeak: 82.7,
      unemploymentPeak: 14.7,
      gdpChange: -0.092,
    },
    recovery: {
      monthsToRecover: 5,
      dateRecovered: '2020-08-18',
    },
    triggers: [
      'COVID-19 pandemic',
      'Global lockdowns',
      'Economic shutdown',
      'Oil price war',
      'Massive fiscal stimulus',
    ],
  },
  {
    name: 'Dot-Com Crash',
    description: 'Technology bubble burst, followed by 9/11 and corporate scandals',
    startDate: '2000-03-24',
    endDate: '2002-10-09',
    durationMonths: 31,
    returns: {
      usEquity: -0.49,
      intlEquity: -0.47,
      bonds: 0.28,
      reits: 0.15,
      gold: 0.12,
      cash: 0.08,
    },
    metrics: {
      sp500Peak: 1527,
      sp500Trough: 776,
      maxDrawdown: -0.491,
      vixPeak: 45.7,
      unemploymentPeak: 6.3,
    },
    recovery: {
      monthsToRecover: 83,
      dateRecovered: '2007-05-30',
    },
    triggers: [
      'Tech bubble burst',
      '9/11 terrorist attacks',
      'Enron/WorldCom scandals',
      'Corporate governance crisis',
    ],
  },
  {
    name: '2022 Bear Market',
    description: 'Inflation surge, aggressive Fed tightening, crypto collapse',
    startDate: '2022-01-03',
    endDate: '2022-10-12',
    durationMonths: 9,
    returns: {
      usEquity: -0.25,
      intlEquity: -0.27,
      bonds: -0.17,
      reits: -0.28,
      gold: -0.09,
      cash: 0.02,
      bitcoin: -0.65,
    },
    metrics: {
      sp500Peak: 4796,
      sp500Trough: 3577,
      maxDrawdown: -0.254,
      vixPeak: 36.5,
    },
    recovery: {
      monthsToRecover: 24,
      dateRecovered: '2024-01-19',
    },
    triggers: [
      'Inflation spike to 9.1%',
      'Fed rate hikes (0% to 5.5%)',
      'Russia-Ukraine war',
      'Crypto collapse (FTX, Luna)',
      'Bond bear market',
    ],
  },
  {
    name: 'Black Monday 1987',
    description: 'Single-day crash of 22.6%, largest in history',
    startDate: '1987-08-25',
    endDate: '1987-12-04',
    durationMonths: 3.5,
    returns: {
      usEquity: -0.34,
      intlEquity: -0.27,
      bonds: 0.06,
      reits: -0.15,
      gold: 0.08,
      cash: 0.02,
    },
    metrics: {
      sp500Peak: 337,
      sp500Trough: 216,
      maxDrawdown: -0.339,
      vixPeak: 150.2,
    },
    recovery: {
      monthsToRecover: 24,
      dateRecovered: '1989-07-26',
    },
    triggers: [
      'Program trading',
      'Portfolio insurance selling',
      'Trade deficit fears',
      'Interest rate concerns',
    ],
  },
  {
    name: '1973-74 Oil Crisis',
    description: 'OPEC embargo, stagflation, worst post-war bear market',
    startDate: '1973-01-11',
    endDate: '1974-10-03',
    durationMonths: 21,
    returns: {
      usEquity: -0.48,
      intlEquity: -0.52,
      bonds: -0.04,
      reits: -0.42,
      gold: 1.43,
      cash: 0.10,
    },
    metrics: {
      sp500Peak: 120,
      sp500Trough: 62,
      maxDrawdown: -0.482,
      vixPeak: 35.0,
      unemploymentPeak: 9.0,
    },
    recovery: {
      monthsToRecover: 92,
      dateRecovered: '1980-07-17',
    },
    triggers: [
      'OPEC oil embargo',
      'Watergate scandal',
      'Inflation spike to 12%',
      'Nixon resignation',
      'Stagflation',
    ],
  },
  {
    name: 'Euro Debt Crisis',
    description: 'Sovereign debt crisis in Greece, Italy, Spain, Portugal',
    startDate: '2011-04-29',
    endDate: '2011-10-03',
    durationMonths: 5,
    returns: {
      usEquity: -0.19,
      intlEquity: -0.24,
      bonds: 0.08,
      reits: -0.18,
      gold: 0.15,
      cash: 0.00,
      bitcoin: -0.08,
    },
    metrics: {
      sp500Peak: 1363,
      sp500Trough: 1099,
      maxDrawdown: -0.194,
      vixPeak: 48.0,
    },
    recovery: {
      monthsToRecover: 5,
      dateRecovered: '2012-02-24',
    },
    triggers: [
      'Greek debt crisis',
      'EU contagion fears',
      'US debt ceiling standoff',
      'S&P US downgrade',
    ],
  },
  {
    name: 'Rising Rate Environment 1994',
    description: 'Surprise Fed tightening, bond market rout',
    startDate: '1994-02-04',
    endDate: '1994-12-04',
    durationMonths: 10,
    returns: {
      usEquity: -0.09,
      intlEquity: -0.07,
      bonds: -0.08,
      reits: -0.06,
      gold: -0.02,
      cash: 0.04,
    },
    metrics: {
      sp500Peak: 482,
      sp500Trough: 438,
      maxDrawdown: -0.091,
      vixPeak: 23.3,
    },
    recovery: {
      monthsToRecover: 4,
      dateRecovered: '1995-02-13',
    },
    triggers: [
      'Surprise Fed rate hikes',
      'Bond market rout',
      'Orange County bankruptcy',
      'Mexico peso crisis',
    ],
  },
];

/**
 * Calculate portfolio return during a stress scenario
 */
export function calculateScenarioImpact(
  scenario: StressScenario,
  allocation: {
    usEquity: number;
    intlEquity: number;
    bonds: number;
    reits: number;
    gold: number;
    cash: number;
    crypto?: number;
  }
): {
  portfolioReturn: number;
  portfolioDrawdown: number;
  recoveryTime: number;
  comparison: {
    asset: string;
    return: number;
    contribution: number;
  }[];
} {
  let portfolioReturn = 0;
  const comparison: { asset: string; return: number; contribution: number }[] = [];
  
  // Calculate weighted returns
  const assets: [string, keyof typeof scenario.returns, keyof typeof allocation][] = [
    ['US Stocks', 'usEquity', 'usEquity'],
    ['Int\'l Stocks', 'intlEquity', 'intlEquity'],
    ['Bonds', 'bonds', 'bonds'],
    ['REITs', 'reits', 'reits'],
    ['Gold', 'gold', 'gold'],
    ['Cash', 'cash', 'cash'],
  ];
  
  for (const [name, returnKey, allocKey] of assets) {
    const weight = allocation[allocKey] || 0;
    const ret = scenario.returns[returnKey] || 0;
    const contribution = weight * ret;
    portfolioReturn += contribution;
    
    if (weight > 0) {
      comparison.push({
        asset: name,
        return: ret,
        contribution,
      });
    }
  }
  
  // Handle crypto separately (only some scenarios have it)
  if (allocation.crypto && allocation.crypto > 0 && scenario.returns.bitcoin !== undefined) {
    const cryptoContribution = allocation.crypto * scenario.returns.bitcoin;
    portfolioReturn += cryptoContribution;
    comparison.push({
      asset: 'Crypto',
      return: scenario.returns.bitcoin,
      contribution: cryptoContribution,
    });
  }
  
  // Estimate recovery time based on drawdown
  const drawdownMultiplier = Math.abs(portfolioReturn) / Math.abs(scenario.metrics.maxDrawdown);
  const recoveryTime = Math.round(scenario.recovery.monthsToRecover * drawdownMultiplier);
  
  return {
    portfolioReturn,
    portfolioDrawdown: portfolioReturn,
    recoveryTime,
    comparison: comparison.sort((a, b) => a.contribution - b.contribution),
  };
}

/**
 * Get scenarios ordered by severity
 */
export function getScenariosBySeverity(): StressScenario[] {
  return [...STRESS_SCENARIOS].sort(
    (a, b) => a.metrics.maxDrawdown - b.metrics.maxDrawdown
  );
}

/**
 * Get the worst-case scenario for a given allocation
 */
export function getWorstCaseScenario(allocation: {
  usEquity: number;
  intlEquity: number;
  bonds: number;
  reits: number;
  gold: number;
  cash: number;
  crypto?: number;
}): { scenario: StressScenario; impact: ReturnType<typeof calculateScenarioImpact> } {
  let worstScenario = STRESS_SCENARIOS[0];
  let worstImpact = calculateScenarioImpact(worstScenario, allocation);
  
  for (const scenario of STRESS_SCENARIOS) {
    const impact = calculateScenarioImpact(scenario, allocation);
    if (impact.portfolioReturn < worstImpact.portfolioReturn) {
      worstScenario = scenario;
      worstImpact = impact;
    }
  }
  
  return { scenario: worstScenario, impact: worstImpact };
}
