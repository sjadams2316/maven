/**
 * Tax-Loss Harvesting Scanner
 * 
 * Scans portfolio for harvesting opportunities with REAL constraints:
 * - Only taxable accounts (losses in retirement accounts don't matter)
 * - Requires cost basis (can't calculate loss without it)
 * - Checks wash sale risk across ALL accounts
 * - Suggests substitute securities to maintain exposure
 * - Tracks holding period (short-term vs long-term)
 * 
 * ITERATION NOTES:
 * v1: Basic loss detection
 * v1.1: Filter to taxable accounts only
 * v1.2: Require cost basis
 * v1.3: Wash sale detection across all accounts
 * v1.4: Holding period tracking (STCG vs LTCG)
 * v1.5: Substitute security suggestions
 * v1.6: Added minimum thresholds and smart filtering
 */

import { calculateTaxSavings, TaxProfile, GainType } from './tax-calculator';

// Taxable account types (losses matter here)
const TAXABLE_ACCOUNT_TYPES = [
  'brokerage',
  'individual',
  'joint',
  'taxable',
  'trust', // Trusts are taxable entities
];

// Tax-advantaged account types (losses DON'T matter here)
const TAX_ADVANTAGED_TYPES = [
  '401k',
  '403b',
  '457',
  'traditional_ira',
  'roth_ira',
  'ira',
  'roth',
  'hsa',
  '529',
  'sep_ira',
  'simple_ira',
  'pension',
  'retirement', // Generic
];

// Substantially identical security mappings
// If you sell one, buying the other within 30 days = wash sale
export const SUBSTANTIALLY_IDENTICAL: Record<string, string[]> = {
  // S&P 500 funds (IRS considers these substantially identical)
  'VOO': ['IVV', 'SPY', 'SPLG', 'FXAIX', 'SWPPX'],
  'IVV': ['VOO', 'SPY', 'SPLG', 'FXAIX', 'SWPPX'],
  'SPY': ['VOO', 'IVV', 'SPLG', 'FXAIX', 'SWPPX'],
  
  // Total US market funds
  'VTI': ['ITOT', 'SWTSX', 'FSKAX', 'SCHB'],
  'ITOT': ['VTI', 'SWTSX', 'FSKAX', 'SCHB'],
  
  // Total international funds  
  'VXUS': ['IXUS', 'FZILX', 'SWISX'],
  'IXUS': ['VXUS', 'FZILX', 'SWISX'],
  
  // Emerging markets
  'VWO': ['IEMG', 'EEM', 'SCHE'],
  'IEMG': ['VWO', 'EEM', 'SCHE'],
  
  // Developed international
  'VEA': ['IEFA', 'EFA', 'SCHF'],
  'IEFA': ['VEA', 'EFA', 'SCHF'],
  
  // Bond funds
  'BND': ['AGG', 'SCHZ', 'FBND'],
  'AGG': ['BND', 'SCHZ', 'FBND'],
};

// Recommended substitutes for tax-loss harvesting
// These are NOT substantially identical but provide similar exposure
const HARVEST_SUBSTITUTES: Record<string, { ticker: string; name: string; reason: string }[]> = {
  // S&P 500 → Total Market (different index = safe)
  'VOO': [
    { ticker: 'VTI', name: 'Vanguard Total Stock Market', reason: 'Broader US exposure, different index' },
    { ticker: 'SCHB', name: 'Schwab US Broad Market', reason: 'Similar large-cap tilt, different index' },
  ],
  'SPY': [
    { ticker: 'VTI', name: 'Vanguard Total Stock Market', reason: 'Broader US exposure, different index' },
    { ticker: 'ITOT', name: 'iShares Core S&P Total US', reason: 'Total market, not S&P 500' },
  ],
  
  // Total market → S&P 500 (reverse)
  'VTI': [
    { ticker: 'VOO', name: 'Vanguard S&P 500', reason: 'Large-cap focused, different index' },
    { ticker: 'SCHX', name: 'Schwab US Large-Cap', reason: 'Large-cap, different methodology' },
  ],
  
  // International
  'VXUS': [
    { ticker: 'VEA', name: 'Vanguard Developed Markets', reason: 'Developed only, excludes EM' },
    { ticker: 'SCHF', name: 'Schwab International Equity', reason: 'Different index provider' },
  ],
  
  // Emerging markets
  'VWO': [
    { ticker: 'SCHE', name: 'Schwab Emerging Markets', reason: 'Different index (FTSE vs MSCI)' },
  ],
  
  // Individual stocks → Sector ETFs (always safe)
  'AAPL': [
    { ticker: 'XLK', name: 'Technology Select Sector', reason: 'Tech sector ETF, not identical' },
    { ticker: 'VGT', name: 'Vanguard Information Technology', reason: 'Tech sector, diversified' },
  ],
  'MSFT': [
    { ticker: 'XLK', name: 'Technology Select Sector', reason: 'Tech sector ETF, not identical' },
  ],
  'GOOGL': [
    { ticker: 'XLC', name: 'Communication Services Select', reason: 'Comm services sector' },
  ],
  'AMZN': [
    { ticker: 'XLY', name: 'Consumer Discretionary Select', reason: 'Consumer discretionary sector' },
  ],
  'TSLA': [
    { ticker: 'XLY', name: 'Consumer Discretionary Select', reason: 'Consumer discretionary sector' },
    { ticker: 'QCLN', name: 'First Trust NASDAQ Clean Edge', reason: 'Clean energy/EV exposure' },
  ],
  'NVDA': [
    { ticker: 'SMH', name: 'VanEck Semiconductor', reason: 'Semiconductor sector ETF' },
    { ticker: 'SOXX', name: 'iShares Semiconductor', reason: 'Semiconductor sector' },
  ],
  
  // Bitcoin miners
  'MARA': [
    { ticker: 'WGMI', name: 'Valkyrie Bitcoin Miners', reason: 'Bitcoin mining ETF' },
  ],
  'RIOT': [
    { ticker: 'WGMI', name: 'Valkyrie Bitcoin Miners', reason: 'Bitcoin mining ETF' },
  ],
  'CIFR': [
    { ticker: 'WGMI', name: 'Valkyrie Bitcoin Miners', reason: 'Bitcoin mining ETF' },
  ],
  'CLSK': [
    { ticker: 'WGMI', name: 'Valkyrie Bitcoin Miners', reason: 'Bitcoin mining ETF' },
  ],
};

export interface Holding {
  ticker: string;
  name?: string;
  shares?: number;
  quantity?: number;
  value?: number;
  currentValue?: number;
  costBasis?: number;
  purchaseDate?: string | Date;
  accountType?: string;
  accountName?: string;
  accountId?: string;
}

export interface Account {
  id?: string;
  name: string;
  type: string;
  custodian?: string;
  holdings?: Holding[];
  balance?: number;
}

export interface HarvestOpportunity {
  // The holding to harvest
  ticker: string;
  name?: string;
  accountName: string;
  accountType: string;
  
  // Position details
  shares: number;
  currentValue: number;
  costBasis: number;
  unrealizedLoss: number;
  
  // Tax impact
  holdingPeriod: 'short_term' | 'long_term' | 'unknown';
  taxSavings: number;
  effectiveRate: number;
  calculationBreakdown: string;
  
  // Wash sale risk
  washSaleRisk: 'none' | 'warning' | 'high';
  washSaleNote?: string;
  identicalHoldings?: { ticker: string; account: string; type: string }[];
  
  // Substitutes
  substitutes: { ticker: string; name: string; reason: string }[];
  
  // Actionability
  isActionable: boolean;
  blockers: string[];
}

export interface ScanResult {
  opportunities: HarvestOpportunity[];
  summary: {
    totalHarvestable: number;
    totalTaxSavings: number;
    actionableCount: number;
    blockedCount: number;
    needsCostBasis: string[];
  };
  warnings: string[];
}

/**
 * Determine if an account type is taxable
 */
export function isTaxableAccount(accountType: string): boolean {
  const type = accountType.toLowerCase().replace(/[_\s-]/g, '');
  
  // Check if it's explicitly tax-advantaged
  for (const taxAdvantaged of TAX_ADVANTAGED_TYPES) {
    if (type.includes(taxAdvantaged.replace(/[_\s-]/g, ''))) {
      return false;
    }
  }
  
  // Check if it's explicitly taxable
  for (const taxable of TAXABLE_ACCOUNT_TYPES) {
    if (type.includes(taxable)) {
      return true;
    }
  }
  
  // Default: assume taxable if not clearly retirement
  // This is conservative (better to flag than miss)
  return true;
}

/**
 * Calculate holding period from purchase date
 */
export function getHoldingPeriod(purchaseDate?: string | Date): 'short_term' | 'long_term' | 'unknown' {
  if (!purchaseDate) return 'unknown';
  
  const purchase = new Date(purchaseDate);
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  
  if (purchase <= oneYearAgo) {
    return 'long_term';
  }
  return 'short_term';
}

/**
 * Find wash sale risks for a ticker across all accounts
 */
export function findWashSaleRisks(
  ticker: string,
  allAccounts: Account[],
  excludeAccountId?: string
): { ticker: string; account: string; type: string }[] {
  const risks: { ticker: string; account: string; type: string }[] = [];
  const upperTicker = ticker.toUpperCase();
  
  // Get substantially identical tickers
  const identicalTickers = new Set([upperTicker]);
  if (SUBSTANTIALLY_IDENTICAL[upperTicker]) {
    SUBSTANTIALLY_IDENTICAL[upperTicker].forEach(t => identicalTickers.add(t));
  }
  
  // Reverse lookup - find all tickers that consider this one identical
  for (const [key, values] of Object.entries(SUBSTANTIALLY_IDENTICAL)) {
    if (values.includes(upperTicker)) {
      identicalTickers.add(key);
    }
  }
  
  // Scan all accounts for identical securities
  for (const account of allAccounts) {
    if (account.id === excludeAccountId) continue;
    
    for (const holding of account.holdings || []) {
      const holdingTicker = holding.ticker.toUpperCase();
      if (identicalTickers.has(holdingTicker)) {
        risks.push({
          ticker: holdingTicker,
          account: account.name,
          type: account.type,
        });
      }
    }
  }
  
  return risks;
}

/**
 * Get substitute securities for tax-loss harvesting
 */
export function getSubstitutes(ticker: string): { ticker: string; name: string; reason: string }[] {
  const upperTicker = ticker.toUpperCase();
  return HARVEST_SUBSTITUTES[upperTicker] || [];
}

/**
 * Scan portfolio for tax-loss harvesting opportunities
 */
export function scanForHarvestOpportunities(
  accounts: Account[],
  taxProfile: TaxProfile,
  options: {
    minLoss?: number;        // Minimum loss to consider (default: $100)
    minTaxSavings?: number;  // Minimum tax savings to consider (default: $25)
  } = {}
): ScanResult {
  const { minLoss = 100, minTaxSavings = 25 } = options;
  
  const opportunities: HarvestOpportunity[] = [];
  const needsCostBasis: string[] = [];
  const warnings: string[] = [];
  
  // Scan each account
  for (const account of accounts) {
    const accountType = account.type || 'unknown';
    
    // Skip tax-advantaged accounts
    if (!isTaxableAccount(accountType)) {
      continue;
    }
    
    // Scan holdings in this taxable account
    for (const holding of account.holdings || []) {
      const ticker = holding.ticker.toUpperCase();
      const currentValue = holding.currentValue || holding.value || 0;
      const costBasis = holding.costBasis;
      const shares = holding.shares || holding.quantity || 0;
      
      // Skip if no cost basis
      if (costBasis === undefined || costBasis === null) {
        if (currentValue > 500) { // Only flag significant positions
          needsCostBasis.push(`${ticker} in ${account.name}`);
        }
        continue;
      }
      
      // Calculate unrealized gain/loss
      const unrealizedGL = currentValue - costBasis;
      
      // Skip if not a loss or below threshold
      if (unrealizedGL >= 0 || Math.abs(unrealizedGL) < minLoss) {
        continue;
      }
      
      const unrealizedLoss = Math.abs(unrealizedGL);
      
      // Determine holding period
      const holdingPeriod = getHoldingPeriod(holding.purchaseDate);
      
      // Calculate tax savings
      // Short-term losses offset ordinary income (higher rate)
      // Long-term losses offset LTCG (lower rate)
      // Unknown defaults to short-term (conservative - shows higher potential)
      const gainType: GainType = holdingPeriod === 'long_term' ? 'long_term' : 'short_term';
      const taxCalc = calculateTaxSavings(unrealizedLoss, gainType, taxProfile);
      
      // Skip if tax savings below threshold
      if (taxCalc.taxSaved < minTaxSavings) {
        continue;
      }
      
      // Check wash sale risks
      const identicalHoldings = findWashSaleRisks(ticker, accounts, account.id);
      let washSaleRisk: 'none' | 'warning' | 'high' = 'none';
      let washSaleNote: string | undefined;
      
      if (identicalHoldings.length > 0) {
        // Check if any are in retirement accounts (bigger risk)
        const inRetirement = identicalHoldings.some(h => !isTaxableAccount(h.type));
        
        if (inRetirement) {
          washSaleRisk = 'high';
          washSaleNote = `⚠️ You hold ${ticker} (or similar) in retirement accounts. Buying there within 30 days of selling = wash sale. The loss would be disallowed.`;
        } else {
          washSaleRisk = 'warning';
          washSaleNote = `Note: You hold similar securities in other taxable accounts. Avoid buying within 30 days.`;
        }
      }
      
      // Get substitute suggestions
      const substitutes = getSubstitutes(ticker);
      
      // Determine if actionable
      const blockers: string[] = [];
      if (washSaleRisk === 'high') {
        blockers.push('High wash sale risk - identical security in retirement account');
      }
      if (holdingPeriod === 'unknown') {
        blockers.push('Unknown holding period - verify purchase date for accurate tax treatment');
      }
      
      opportunities.push({
        ticker,
        name: holding.name,
        accountName: account.name,
        accountType,
        shares,
        currentValue,
        costBasis,
        unrealizedLoss,
        holdingPeriod,
        taxSavings: taxCalc.taxSaved,
        effectiveRate: taxCalc.combinedRate,
        calculationBreakdown: taxCalc.breakdown.calculation,
        washSaleRisk,
        washSaleNote,
        identicalHoldings: identicalHoldings.length > 0 ? identicalHoldings : undefined,
        substitutes,
        isActionable: blockers.length === 0,
        blockers,
      });
    }
  }
  
  // Sort by tax savings (highest first)
  opportunities.sort((a, b) => b.taxSavings - a.taxSavings);
  
  // Calculate summary
  const actionable = opportunities.filter(o => o.isActionable);
  const blocked = opportunities.filter(o => !o.isActionable);
  
  // Add warnings
  if (needsCostBasis.length > 0) {
    warnings.push(`Missing cost basis for ${needsCostBasis.length} position(s). Add cost basis to see potential tax savings.`);
  }
  
  if (blocked.length > 0) {
    warnings.push(`${blocked.length} opportunity(s) have wash sale risks or missing data.`);
  }
  
  return {
    opportunities,
    summary: {
      totalHarvestable: opportunities.reduce((sum, o) => sum + o.unrealizedLoss, 0),
      totalTaxSavings: opportunities.reduce((sum, o) => sum + o.taxSavings, 0),
      actionableCount: actionable.length,
      blockedCount: blocked.length,
      needsCostBasis,
    },
    warnings,
  };
}

/**
 * Format opportunity for display
 */
export function formatOpportunity(opp: HarvestOpportunity): string {
  const parts = [
    `**${opp.ticker}** in ${opp.accountName}`,
    `Loss: $${opp.unrealizedLoss.toLocaleString()} → Tax savings: **$${opp.taxSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**`,
    `Holding period: ${opp.holdingPeriod === 'long_term' ? 'Long-term (>1 year)' : opp.holdingPeriod === 'short_term' ? 'Short-term (<1 year)' : 'Unknown'}`,
  ];
  
  if (opp.washSaleNote) {
    parts.push(opp.washSaleNote);
  }
  
  if (opp.substitutes.length > 0) {
    parts.push(`Suggested substitute: ${opp.substitutes[0].ticker} (${opp.substitutes[0].reason})`);
  }
  
  return parts.join('\n');
}
