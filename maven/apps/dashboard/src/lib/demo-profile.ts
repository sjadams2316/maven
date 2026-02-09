/**
 * DEMO PROFILE - SINGLE SOURCE OF TRUTH
 * All demo data lives here. /demo, /portfolio-lab, /tax, etc. all use this.
 * 
 * Growth Portfolio: ~$800K net worth with significant crypto exposure
 * - Focus on TAO (Bittensor), VTI, CIFR, IREN
 * - Aggressive allocation for tax-loss harvesting and rebalancing demos
 */

import { UserProfile, Holding } from '@/providers/UserProvider';

// ============================================================================
// GROWTH PORTFOLIO HOLDINGS (canonical source - used everywhere)
// These are the exact holdings shown on /demo dashboard
// ============================================================================

export interface DemoHolding {
  symbol: string;
  name: string;
  value: number;
  change: number;
  shares: string;
  sharesNum: number;
  unrealizedLoss?: number;
  dividendYield?: number;
}

/**
 * GROWTH_HOLDINGS - The canonical demo portfolio
 * This is the single source of truth for what the demo user owns.
 * All pages should derive their data from this.
 */
export const GROWTH_HOLDINGS: DemoHolding[] = [
  { symbol: 'TAO', name: 'Bittensor', value: 354900, change: 4.78, shares: '105 tokens', sharesNum: 105 },
  { symbol: 'VTI', name: 'Vanguard Total Stock', value: 185000, change: 1.2, shares: '620 shares', sharesNum: 620 },
  { symbol: 'CIFR', name: 'Cipher Mining', value: 78000, change: -2.3, shares: '12,000 shares', sharesNum: 12000 },
  { symbol: 'IREN', name: 'Iris Energy', value: 52000, change: 3.1, shares: '4,200 shares', sharesNum: 4200 },
  { symbol: 'BND', name: 'Vanguard Total Bond', value: 48000, change: 0.3, shares: '580 shares', sharesNum: 580 },
  { symbol: 'VOO', name: 'Vanguard S&P 500', value: 42000, change: 1.1, shares: '95 shares', sharesNum: 95 },
  { symbol: 'VXUS', name: 'Vanguard Total Intl', value: 35000, change: 0.8, shares: '540 shares', sharesNum: 540 },
  { symbol: 'VWO', name: 'Vanguard Emerging Mkts', value: 22000, change: -16.0, shares: '380 shares', sharesNum: 380, unrealizedLoss: -4200 },
  { symbol: 'VNQ', name: 'Vanguard REIT', value: 18000, change: -0.5, shares: '195 shares', sharesNum: 195 },
];

// Calculate totals from holdings
const HOLDINGS_TOTAL = GROWTH_HOLDINGS.reduce((sum, h) => sum + h.value, 0); // ~$835K

export const GROWTH_TARGET_ALLOCATION = {
  usStocks: 45,
  intlStocks: 15,
  bonds: 20,
  other: 20,
};

// Goals derived from holdings total
export const GROWTH_RETIREMENT_CURRENT = Math.round(HOLDINGS_TOTAL * 0.95); // ~$793K
export const GROWTH_RETIREMENT_TARGET = 3000000;
export const GROWTH_RETIREMENT_PROGRESS = Math.round((GROWTH_RETIREMENT_CURRENT / GROWTH_RETIREMENT_TARGET) * 100);

export const GROWTH_GOALS = [
  { name: 'Retirement', current: GROWTH_RETIREMENT_CURRENT, target: GROWTH_RETIREMENT_TARGET, icon: '🏖️' },
  { name: 'Beach House', current: 85000, target: 400000, icon: '🏠' },
  { name: 'Banks College', current: 28000, target: 200000, icon: '🎓' },
];

// ============================================================================
// DEMO PROFILE - Uses GROWTH_HOLDINGS as source of truth
// ============================================================================

export const DEMO_PROFILE: UserProfile = {
  // Personal (fictional demo user)
  firstName: "Alex",
  lastName: "Demo",
  email: "demo@mavenwealth.ai",
  dateOfBirth: "1985-03-15",
  state: "VA",
  filingStatus: "Married Filing Jointly",
  householdIncome: "$200,000 - $500,000",
  
  // Cash Accounts
  cashAccounts: [
    {
      id: "demo-cash-1",
      name: "Chase Checking",
      institution: "Chase",
      balance: 15000,
      type: "Checking"
    },
    {
      id: "demo-cash-2",
      name: "Marcus HYSA",
      institution: "Goldman Sachs",
      balance: 45000,
      type: "High-Yield Savings",
      interestRate: 4.4
    },
    {
      id: "demo-cash-3",
      name: "Fidelity Money Market",
      institution: "Fidelity",
      balance: 25000,
      type: "Money Market"
    }
  ],
  
  // Retirement Accounts - Contains Growth Portfolio ETFs
  retirementAccounts: [
    {
      id: "demo-ret-1",
      name: "Employer 401(k)",
      institution: "Fidelity",
      balance: 275000,
      type: "401(k)",
      employer: "Tech Corp",
      contributionPercent: 15,
      employerMatchPercent: 6,
      holdings: [
        // VTI - primary US stock holding
        { ticker: "VTI", name: "Vanguard Total Stock Market", shares: 620, costBasis: 148000, currentPrice: 298.39, currentValue: 185000 },
        // BND - bond allocation
        { ticker: "BND", name: "Vanguard Total Bond Market", shares: 580, costBasis: 44000, currentPrice: 82.76, currentValue: 48000 },
        // VOO - S&P 500
        { ticker: "VOO", name: "Vanguard S&P 500", shares: 95, costBasis: 38000, currentPrice: 442.11, currentValue: 42000 },
      ]
    },
    {
      id: "demo-ret-2",
      name: "Traditional IRA",
      institution: "Fidelity",
      balance: 75000,
      type: "Traditional IRA",
      holdings: [
        // VXUS - International
        { ticker: "VXUS", name: "Vanguard Total International", shares: 540, costBasis: 30000, currentPrice: 64.81, currentValue: 35000 },
        // VWO - Emerging markets (has unrealized loss for tax harvesting demo)
        { ticker: "VWO", name: "Vanguard Emerging Markets", shares: 380, costBasis: 26200, currentPrice: 57.89, currentValue: 22000 },
        // VNQ - REIT
        { ticker: "VNQ", name: "Vanguard Real Estate ETF", shares: 195, costBasis: 16000, currentPrice: 92.31, currentValue: 18000 },
      ]
    },
    {
      id: "demo-ret-3",
      name: "Roth IRA",
      institution: "Schwab",
      balance: 35000,
      type: "Roth IRA",
      holdings: [
        // Tech-focused speculative holdings in Roth (tax-free growth)
        { ticker: "CIFR", name: "Cipher Mining", shares: 2500, costBasis: 18000, currentPrice: 6.50, currentValue: 16250 },
        { ticker: "IREN", name: "Iris Energy", shares: 1500, costBasis: 12000, currentPrice: 12.38, currentValue: 18570 },
      ]
    },
  ],
  
  // Investment Accounts - Contains crypto and speculative
  investmentAccounts: [
    {
      id: "demo-inv-1",
      name: "Taxable Brokerage",
      institution: "Fidelity",
      balance: 95180,
      type: "Individual",
      holdings: [
        // CIFR/IREN in taxable (speculative positions)
        { ticker: "CIFR", name: "Cipher Mining", shares: 9500, costBasis: 65000, currentPrice: 6.50, currentValue: 61750, acquisitionDate: "2023-06-15" },
        { ticker: "IREN", name: "Iris Energy", shares: 2700, costBasis: 28000, currentPrice: 12.38, currentValue: 33430, acquisitionDate: "2023-08-20" },
      ]
    },
    {
      id: "demo-inv-2",
      name: "Crypto Holdings",
      institution: "Coinbase",
      balance: 354900,
      type: "Individual",
      holdings: [
        // TAO - The big crypto position that dominates the portfolio
        { ticker: "TAO", name: "Bittensor", shares: 105, costBasis: 42000, currentPrice: 3380, currentValue: 354900 },
      ]
    },
  ],
  
  // Other Assets
  realEstateEquity: 185000,
  cryptoValue: 0, // Counted in investment accounts
  businessEquity: 25000,
  otherAssets: 15000,
  
  // Liabilities
  liabilities: [
    {
      id: "demo-liab-1",
      name: "Home Mortgage",
      type: "Mortgage",
      balance: 425000,
      interestRate: 3.25,
      monthlyPayment: 2850
    },
    {
      id: "demo-liab-2",
      name: "Tesla Model Y Loan",
      type: "Auto Loan",
      balance: 28000,
      interestRate: 4.9,
      monthlyPayment: 650
    },
    {
      id: "demo-liab-3",
      name: "Chase Credit Card",
      type: "Credit Card",
      balance: 4500,
      interestRate: 24.99,
      monthlyPayment: 500
    }
  ],
  
  // Goals - Match the Growth Portfolio goals
  goals: [
    {
      id: "demo-goal-1",
      name: "Retire at 55",
      targetAmount: 3000000,
      targetDate: "2040-03-15",
      priority: "high"
    },
    {
      id: "demo-goal-2",
      name: "Kids' College Fund",
      targetAmount: 200000,
      targetDate: "2035-09-01",
      priority: "high"
    },
    {
      id: "demo-goal-3",
      name: "Beach House",
      targetAmount: 400000,
      targetDate: "2030-06-01",
      priority: "medium"
    }
  ],
  
  primaryGoal: "Early retirement with financial independence",
  riskTolerance: "growth",
  investmentExperience: "advanced",
  
  // Social Security
  socialSecurity: {
    dateOfBirth: "1985-03-15",
    lifeExpectancy: 88,
    benefitAt62: 2100,
    benefitAtFRA: 3000,
    benefitAt70: 3720,
    currentlyWorking: true,
    expectedEarnings: 250000,
    retirementAge: 55,
    spouseDOB: "1987-08-22",
    spouseBenefitAt62: 1800,
    spouseBenefitAtFRA: 2570,
    spouseBenefitAt70: 3187,
    marriageDate: "2012-06-15"
  },
  
  onboardingComplete: true,
};

// ============================================================================
// CALCULATED VALUES - Derived from DEMO_PROFILE
// ============================================================================

// Calculate net worth from DEMO_PROFILE
function calculateDemoNetWorth(): number {
  const cash = DEMO_PROFILE.cashAccounts.reduce((sum, a) => sum + a.balance, 0);
  const retirement = DEMO_PROFILE.retirementAccounts.reduce((sum, a) => sum + a.balance, 0);
  const investment = DEMO_PROFILE.investmentAccounts.reduce((sum, a) => sum + a.balance, 0);
  const other = DEMO_PROFILE.realEstateEquity + DEMO_PROFILE.businessEquity + DEMO_PROFILE.otherAssets;
  const liabilities = DEMO_PROFILE.liabilities.reduce((sum, l) => sum + l.balance, 0);
  return cash + retirement + investment + other - liabilities;
}

// Net worth: ~$687,580
// Cash: $85K + Retirement: $385K + Investment: $450K + Other: $225K - Liabilities: $457.5K
// Holdings total: ~$835K (matches GROWTH_HOLDINGS exactly)
export const DEMO_NET_WORTH = calculateDemoNetWorth();

// ============================================================================
// RETIREE DEMO PROFILE (unchanged from before)
// ============================================================================

export const RETIREE_DEMO_PROFILE: UserProfile = {
  // Personal (fictional retiree demo user)
  firstName: "Pat",
  lastName: "Retiree",
  email: "pat.retiree@mavenwealth.ai",
  dateOfBirth: "1964-07-20", // Age 62
  state: "FL",
  filingStatus: "Married Filing Jointly",
  householdIncome: "$100,000 - $200,000",
  
  // Cash Accounts (10% = ~$120K)
  cashAccounts: [
    {
      id: "ret-cash-1",
      name: "Ally Checking",
      institution: "Ally Bank",
      balance: 25000,
      type: "Checking"
    },
    {
      id: "ret-cash-2",
      name: "Ally HYSA",
      institution: "Ally Bank",
      balance: 50000,
      type: "High-Yield Savings",
      interestRate: 4.25
    },
    {
      id: "ret-cash-3",
      name: "Vanguard Money Market",
      institution: "Vanguard",
      balance: 45000,
      type: "Money Market"
    }
  ],
  
  // Retirement Accounts
  retirementAccounts: [
    {
      id: "ret-401k",
      name: "Former Employer 401(k)",
      institution: "Fidelity",
      balance: 485000,
      type: "401(k)",
      employer: "Former Corp",
      contributionPercent: 0,
      employerMatchPercent: 0,
      holdings: [
        { ticker: "BND", name: "Vanguard Total Bond Market", shares: 2800, costBasis: 210000, currentPrice: 72.40, currentValue: 202720 },
        { ticker: "VTIP", name: "Vanguard Short-Term Inflation-Protected", shares: 1200, costBasis: 58000, currentPrice: 48.50, currentValue: 58200 },
        { ticker: "VTI", name: "Vanguard Total Stock Market", shares: 350, costBasis: 75000, currentPrice: 268.50, currentValue: 93975 },
        { ticker: "SCHD", name: "Schwab US Dividend Equity", shares: 800, costBasis: 55000, currentPrice: 82.30, currentValue: 65840 },
        { ticker: "VXUS", name: "Vanguard Total International", shares: 1020, costBasis: 58000, currentPrice: 62.80, currentValue: 64056 }
      ]
    },
    {
      id: "ret-ira",
      name: "Traditional IRA",
      institution: "Vanguard",
      balance: 380000,
      type: "Traditional IRA",
      holdings: [
        { ticker: "BND", name: "Vanguard Total Bond Market", shares: 2200, costBasis: 165000, currentPrice: 72.40, currentValue: 159280 },
        { ticker: "VYM", name: "Vanguard High Dividend Yield", shares: 850, costBasis: 82000, currentPrice: 118.50, currentValue: 100725 },
        { ticker: "VTIP", name: "Vanguard Short-Term Inflation-Protected", shares: 1400, costBasis: 68000, currentPrice: 48.50, currentValue: 67900 },
        { ticker: "VTI", name: "Vanguard Total Stock Market", shares: 195, costBasis: 42000, currentPrice: 268.50, currentValue: 52358 }
      ]
    },
    {
      id: "ret-roth",
      name: "Roth IRA",
      institution: "Vanguard",
      balance: 165000,
      type: "Roth IRA",
      holdings: [
        { ticker: "VTI", name: "Vanguard Total Stock Market", shares: 280, costBasis: 55000, currentPrice: 268.50, currentValue: 75180 },
        { ticker: "SCHD", name: "Schwab US Dividend Equity", shares: 550, costBasis: 38000, currentPrice: 82.30, currentValue: 45265 },
        { ticker: "VXUS", name: "Vanguard Total International", shares: 710, costBasis: 42000, currentPrice: 62.80, currentValue: 44588 }
      ]
    }
  ],
  
  // Investment Accounts (Taxable - income-focused)
  investmentAccounts: [
    {
      id: "ret-brokerage",
      name: "Joint Brokerage",
      institution: "Vanguard",
      balance: 170000,
      type: "Joint",
      holdings: [
        { ticker: "BND", name: "Vanguard Total Bond Market", shares: 900, costBasis: 68000, currentPrice: 72.40, currentValue: 65160, acquisitionDate: "2019-03-15" },
        { ticker: "VYM", name: "Vanguard High Dividend Yield", shares: 420, costBasis: 42000, currentPrice: 118.50, currentValue: 49770, acquisitionDate: "2018-06-20" },
        { ticker: "SCHD", name: "Schwab US Dividend Equity", shares: 380, costBasis: 28000, currentPrice: 82.30, currentValue: 31274, acquisitionDate: "2020-01-10" },
        { ticker: "VTIP", name: "Vanguard Short-Term Inflation-Protected", shares: 490, costBasis: 24000, currentPrice: 48.50, currentValue: 23765, acquisitionDate: "2021-08-05" }
      ]
    }
  ],
  
  // Other Assets
  realEstateEquity: 285000, // Paid off home
  cryptoValue: 0,
  businessEquity: 0,
  otherAssets: 35000, // Valuables, vehicles
  
  // Liabilities (minimal - good debt management)
  liabilities: [
    {
      id: "ret-liab-1",
      name: "Home Equity Line",
      type: "HELOC",
      balance: 15000,
      interestRate: 8.5,
      monthlyPayment: 250
    }
  ],
  
  // Goals
  goals: [
    {
      id: "ret-goal-1",
      name: "Retire at 65",
      targetAmount: 1500000,
      targetDate: "2029-07-20",
      priority: "high"
    },
    {
      id: "ret-goal-2",
      name: "Grandkids' Education",
      targetAmount: 100000,
      targetDate: "2035-09-01",
      priority: "medium"
    },
    {
      id: "ret-goal-3",
      name: "Travel Fund",
      targetAmount: 50000,
      targetDate: "2030-01-01",
      priority: "medium"
    }
  ],
  
  primaryGoal: "Secure retirement with sustainable income",
  riskTolerance: "conservative",
  investmentExperience: "intermediate",
  
  // Social Security (critical for retirees)
  socialSecurity: {
    dateOfBirth: "1964-07-20",
    lifeExpectancy: 90,
    benefitAt62: 2100,
    benefitAtFRA: 2980, // Full Retirement Age 67
    benefitAt70: 3700,
    currentlyWorking: true,
    expectedEarnings: 95000,
    retirementAge: 65,
    spouseDOB: "1966-03-15",
    spouseBenefitAt62: 1650,
    spouseBenefitAtFRA: 2350,
    spouseBenefitAt70: 2915,
    marriageDate: "1990-05-20"
  },
  
  onboardingComplete: true,
};

// Retiree Holdings for /demo page display
export const RETIREE_HOLDINGS: DemoHolding[] = [
  { symbol: 'BND', name: 'Vanguard Total Bond', value: 427160, change: 0.3, shares: '5,900 shares', sharesNum: 5900, dividendYield: 3.8 },
  { symbol: 'VTIP', name: 'Vanguard Inflation-Protected', value: 149865, change: 0.1, shares: '3,090 shares', sharesNum: 3090, dividendYield: 5.2 },
  { symbol: 'VYM', name: 'Vanguard High Dividend', value: 150495, change: 0.9, shares: '1,270 shares', sharesNum: 1270, dividendYield: 2.9 },
  { symbol: 'VTI', name: 'Vanguard Total Stock', value: 221513, change: 1.2, shares: '825 shares', sharesNum: 825, dividendYield: 1.4 },
  { symbol: 'SCHD', name: 'Schwab Dividend Equity', value: 142379, change: 0.7, shares: '1,730 shares', sharesNum: 1730, dividendYield: 3.4 },
  { symbol: 'VXUS', name: 'Vanguard Total Intl', value: 108644, change: 0.8, shares: '1,730 shares', sharesNum: 1730, dividendYield: 3.1 },
];

export const RETIREE_TARGET_ALLOCATION = {
  usStocks: 40,
  intlStocks: 10,
  bonds: 50,
  other: 0,
};

export const RETIREE_GOALS = [
  { name: 'Retire at 65', current: 1200000, target: 1500000, icon: '🏖️' },
  { name: 'Grandkids\' Education', current: 35000, target: 100000, icon: '🎓' },
  { name: 'Travel Fund', current: 22000, target: 50000, icon: '✈️' },
];

// Calculated net worth from RETIREE_DEMO_PROFILE (~$1.2M)
export const RETIREE_NET_WORTH = 1200000;

// Annual dividend/interest income estimate
export const RETIREE_ANNUAL_INCOME = 42000; // ~3.5% yield on portfolio

// ============================================================================
// DEMO MODE UTILITIES
// ============================================================================

export type DemoVariant = 'growth' | 'retiree';

export const DEMO_MODE_KEY = 'maven_demo_mode';
export const DEMO_VARIANT_KEY = 'maven_demo_variant';

export function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(DEMO_MODE_KEY) === 'true';
}

export function enableDemoMode(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEMO_MODE_KEY, 'true');
}

export function disableDemoMode(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(DEMO_MODE_KEY);
  localStorage.removeItem(DEMO_VARIANT_KEY);
}

export function getDemoVariant(): DemoVariant {
  if (typeof window === 'undefined') return 'growth';
  return (localStorage.getItem(DEMO_VARIANT_KEY) as DemoVariant) || 'growth';
}

export function setDemoVariant(variant: DemoVariant): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEMO_VARIANT_KEY, variant);
}

export function getDemoProfile(variant: DemoVariant = 'growth'): UserProfile {
  return variant === 'retiree' ? RETIREE_DEMO_PROFILE : DEMO_PROFILE;
}

export function getDemoNetWorth(variant: DemoVariant = 'growth'): number {
  return variant === 'retiree' ? RETIREE_NET_WORTH : DEMO_NET_WORTH;
}

export function getDemoHoldings(variant: DemoVariant = 'growth'): DemoHolding[] {
  return variant === 'retiree' ? RETIREE_HOLDINGS : GROWTH_HOLDINGS;
}
