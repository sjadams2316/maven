/**
 * USER CONTEXT AGGREGATOR
 * Builds comprehensive user context for the Oracle
 */

export interface UserHolding {
  symbol: string;
  name: string;
  shares: number;
  costBasis: number;
  currentValue: number;
  currentPrice: number;
  unrealizedGain: number;
  unrealizedGainPercent: number;
  isLongTerm: boolean;
  accountType: 'taxable' | 'traditional' | 'roth' | 'hsa' | 'other';
  accountName: string;
}

export interface UserAccount {
  id: string;
  name: string;
  type: 'taxable' | 'traditional' | 'roth' | '401k' | 'hsa' | 'crypto' | 'cash' | 'other';
  balance: number;
  holdings: UserHolding[];
}

export interface TaxLotInfo {
  symbol: string;
  shares: number;
  costBasis: number;
  acquisitionDate: string;
  unrealizedGain: number;
  isLongTerm: boolean;
  taxRate: number; // Estimated tax if sold
}

export interface UserContext {
  // Basic info
  firstName?: string;
  lastName?: string;
  email?: string;
  
  // Profile
  riskTolerance?: 'conservative' | 'moderate' | 'growth' | 'aggressive';
  primaryGoal?: string;
  investmentExperience?: string;
  age?: number;
  taxFilingStatus?: 'single' | 'married_joint' | 'married_separate' | 'head_of_household';
  estimatedTaxBracket?: number;
  state?: string;
  
  // Aggregated financials
  netWorth: number;
  totalInvestments: number;
  totalRetirement: number;
  totalCash: number;
  totalCrypto: number;
  totalDebt: number;
  
  // Accounts
  accounts: UserAccount[];
  
  // Holdings (consolidated across accounts)
  topHoldings: UserHolding[];
  
  // Tax opportunities
  harvestablelosses: TaxLotInfo[];
  unrealizedGains: number;
  unrealizedLosses: number;
  
  // Insights
  assetAllocation: {
    usEquity: number;
    intlEquity: number;
    bonds: number;
    cash: number;
    crypto: number;
    other: number;
  };
  
  concentrationRisks: {
    symbol: string;
    percentage: number;
  }[];
}

/**
 * Build context string for chat
 */
export function buildContextForChat(context: UserContext): string {
  let output = `\n=== USER CONTEXT ===\n`;
  
  // Basic info
  if (context.firstName) {
    output += `Name: ${context.firstName}\n`;
  }
  if (context.age) {
    output += `Age: ${context.age}\n`;
  }
  if (context.riskTolerance) {
    output += `Risk Tolerance: ${context.riskTolerance}\n`;
  }
  if (context.primaryGoal) {
    output += `Primary Goal: ${context.primaryGoal}\n`;
  }
  if (context.taxFilingStatus) {
    output += `Filing Status: ${context.taxFilingStatus}\n`;
  }
  if (context.estimatedTaxBracket) {
    output += `Est. Tax Bracket: ${context.estimatedTaxBracket}%\n`;
  }
  if (context.state) {
    output += `State: ${context.state}\n`;
  }
  
  // Net worth breakdown
  output += `\n--- FINANCIAL SUMMARY ---\n`;
  output += `Net Worth: $${context.netWorth.toLocaleString()}\n`;
  output += `├─ Investments: $${context.totalInvestments.toLocaleString()}\n`;
  output += `├─ Retirement: $${context.totalRetirement.toLocaleString()}\n`;
  output += `├─ Cash: $${context.totalCash.toLocaleString()}\n`;
  output += `├─ Crypto: $${context.totalCrypto.toLocaleString()}\n`;
  output += `└─ Debt: $${context.totalDebt.toLocaleString()}\n`;
  
  // Accounts
  if (context.accounts.length > 0) {
    output += `\n--- ACCOUNTS ---\n`;
    context.accounts.forEach(acc => {
      output += `${acc.name} (${acc.type}): $${acc.balance.toLocaleString()}\n`;
    });
  }
  
  // Top holdings
  if (context.topHoldings.length > 0) {
    output += `\n--- TOP HOLDINGS ---\n`;
    context.topHoldings.slice(0, 10).forEach(h => {
      const gainStr = h.unrealizedGain >= 0 
        ? `+$${h.unrealizedGain.toLocaleString()} (+${h.unrealizedGainPercent.toFixed(1)}%)` 
        : `-$${Math.abs(h.unrealizedGain).toLocaleString()} (${h.unrealizedGainPercent.toFixed(1)}%)`;
      output += `${h.symbol}: $${h.currentValue.toLocaleString()} | ${gainStr} | ${h.accountType}\n`;
    });
  }
  
  // Asset allocation
  if (context.assetAllocation) {
    output += `\n--- ASSET ALLOCATION ---\n`;
    const alloc = context.assetAllocation;
    output += `US Equity: ${alloc.usEquity.toFixed(1)}%\n`;
    output += `Intl Equity: ${alloc.intlEquity.toFixed(1)}%\n`;
    output += `Bonds: ${alloc.bonds.toFixed(1)}%\n`;
    output += `Cash: ${alloc.cash.toFixed(1)}%\n`;
    output += `Crypto: ${alloc.crypto.toFixed(1)}%\n`;
    if (alloc.other > 0) {
      output += `Other: ${alloc.other.toFixed(1)}%\n`;
    }
  }
  
  // Concentration risks
  if (context.concentrationRisks.length > 0) {
    output += `\n--- CONCENTRATION RISKS ---\n`;
    context.concentrationRisks.forEach(c => {
      output += `⚠️ ${c.symbol}: ${c.percentage.toFixed(1)}% of portfolio\n`;
    });
  }
  
  // Cash optimization alert
  const totalAssets = context.netWorth + context.totalDebt; // Add back debt to get total assets
  const cashPercent = totalAssets > 0 ? (context.totalCash / totalAssets) * 100 : 0;
  if (context.totalCash > 10000 && cashPercent > 15) {
    output += `\n--- 💰 CASH OPTIMIZATION OPPORTUNITY ---\n`;
    output += `Cash holdings: $${context.totalCash.toLocaleString()} (${cashPercent.toFixed(1)}% of portfolio)\n`;
    const excessCash = context.totalCash - (totalAssets * 0.10); // Assume 10% is reasonable emergency fund
    if (excessCash > 5000) {
      const potentialEarnings = excessCash * 0.045; // Assume 4.5% money market yield
      output += `⚠️ Excess cash: ~$${Math.round(excessCash).toLocaleString()}\n`;
      output += `💡 Potential annual earnings if moved to money market: ~$${Math.round(potentialEarnings).toLocaleString()}\n`;
      output += `Consider: SPAXX (Fidelity), VMFXX (Vanguard), SWVXX (Schwab) for ~4.5-5% yield\n`;
    }
  }
  
  // Tax opportunities
  if (context.harvestablelosses.length > 0) {
    output += `\n--- TAX-LOSS HARVEST OPPORTUNITIES ---\n`;
    context.harvestablelosses.forEach(lot => {
      const term = lot.isLongTerm ? 'LT' : 'ST';
      output += `${lot.symbol}: -$${Math.abs(lot.unrealizedGain).toLocaleString()} (${term}, potential tax savings: $${(Math.abs(lot.unrealizedGain) * lot.taxRate / 100).toLocaleString()})\n`;
    });
  }
  
  // Unrealized gains/losses summary
  if (context.unrealizedGains !== 0 || context.unrealizedLosses !== 0) {
    output += `\n--- UNREALIZED TAX POSITION ---\n`;
    output += `Unrealized Gains: $${context.unrealizedGains.toLocaleString()}\n`;
    output += `Unrealized Losses: $${context.unrealizedLosses.toLocaleString()}\n`;
    output += `Net: $${(context.unrealizedGains + context.unrealizedLosses).toLocaleString()}\n`;
  }
  
  output += `=== END USER CONTEXT ===\n`;
  return output;
}

/**
 * Parse localStorage profile into UserContext
 * This bridges the gap until we have database integration
 */
export function parseLocalStorageProfile(profile: any): UserContext {
  const context: UserContext = {
    firstName: profile.firstName,
    riskTolerance: profile.riskTolerance,
    primaryGoal: profile.primaryGoal,
    investmentExperience: profile.investmentExperience,
    age: profile.age,
    taxFilingStatus: profile.taxFilingStatus,
    estimatedTaxBracket: profile.taxBracket,
    state: profile.state,
    netWorth: 0,
    totalInvestments: 0,
    totalRetirement: 0,
    totalCash: 0,
    totalCrypto: profile.cryptoValue || 0,
    totalDebt: 0,
    accounts: [],
    topHoldings: [],
    harvestablelosses: [],
    unrealizedGains: 0,
    unrealizedLosses: 0,
    assetAllocation: {
      usEquity: 0,
      intlEquity: 0,
      bonds: 0,
      cash: 0,
      crypto: 0,
      other: 0
    },
    concentrationRisks: []
  };
  
  const allHoldings: UserHolding[] = [];
  
  // Process retirement accounts
  if (profile.retirementAccounts?.length) {
    profile.retirementAccounts.forEach((acc: any) => {
      const accountType = acc.type?.toLowerCase().includes('roth') ? 'roth' : 'traditional';
      const balance = acc.balance || 0;
      context.totalRetirement += balance;
      
      context.accounts.push({
        id: acc.id || acc.name,
        name: acc.name,
        type: accountType === 'roth' ? 'roth' : '401k',
        balance,
        holdings: []
      });
      
      if (acc.holdings?.length) {
        acc.holdings.forEach((h: any) => {
          allHoldings.push({
            symbol: h.ticker || h.symbol,
            name: h.name,
            shares: h.shares || 0,
            costBasis: h.costBasis || 0,
            currentValue: h.currentValue || 0,
            currentPrice: h.currentPrice || 0,
            unrealizedGain: (h.currentValue || 0) - (h.costBasis || 0),
            unrealizedGainPercent: h.costBasis ? (((h.currentValue || 0) - h.costBasis) / h.costBasis) * 100 : 0,
            isLongTerm: true, // Assume long-term for retirement accounts
            accountType: accountType as any,
            accountName: acc.name
          });
        });
      }
    });
  }
  
  // Process investment accounts
  if (profile.investmentAccounts?.length) {
    profile.investmentAccounts.forEach((acc: any) => {
      const balance = acc.balance || 0;
      context.totalInvestments += balance;
      
      context.accounts.push({
        id: acc.id || acc.name,
        name: acc.name,
        type: 'taxable',
        balance,
        holdings: []
      });
      
      if (acc.holdings?.length) {
        acc.holdings.forEach((h: any) => {
          const holding: UserHolding = {
            symbol: h.ticker || h.symbol,
            name: h.name,
            shares: h.shares || 0,
            costBasis: h.costBasis || 0,
            currentValue: h.currentValue || 0,
            currentPrice: h.currentPrice || 0,
            unrealizedGain: (h.currentValue || 0) - (h.costBasis || 0),
            unrealizedGainPercent: h.costBasis ? (((h.currentValue || 0) - h.costBasis) / h.costBasis) * 100 : 0,
            isLongTerm: h.isLongTerm ?? true,
            accountType: 'taxable',
            accountName: acc.name
          };
          allHoldings.push(holding);
          
          // Track harvestable losses
          if (holding.unrealizedGain < -500) { // Only if loss > $500
            context.harvestablelosses.push({
              symbol: holding.symbol,
              shares: holding.shares,
              costBasis: holding.costBasis,
              acquisitionDate: h.acquisitionDate || '',
              unrealizedGain: holding.unrealizedGain,
              isLongTerm: holding.isLongTerm,
              taxRate: context.estimatedTaxBracket || 24
            });
          }
        });
      }
    });
  }
  
  // Process cash accounts
  if (profile.cashAccounts?.length) {
    profile.cashAccounts.forEach((acc: any) => {
      const balance = acc.balance || 0;
      context.totalCash += balance;
      
      context.accounts.push({
        id: acc.id || acc.name,
        name: acc.name,
        type: 'cash',
        balance,
        holdings: []
      });
    });
  }
  
  // Calculate liabilities
  if (profile.liabilities?.length) {
    profile.liabilities.forEach((l: any) => {
      context.totalDebt += l.balance || 0;
    });
  }
  
  // Calculate net worth
  context.netWorth = context.totalInvestments + context.totalRetirement + context.totalCash + context.totalCrypto + (profile.realEstateEquity || 0) + (profile.businessEquity || 0) + (profile.otherAssets || 0) - context.totalDebt;
  
  // Sort and get top holdings
  allHoldings.sort((a, b) => b.currentValue - a.currentValue);
  context.topHoldings = allHoldings.slice(0, 15);
  
  // Calculate unrealized gains/losses
  allHoldings.forEach(h => {
    if (h.unrealizedGain > 0) {
      context.unrealizedGains += h.unrealizedGain;
    } else {
      context.unrealizedLosses += h.unrealizedGain;
    }
  });
  
  // Calculate asset allocation (simplified)
  const totalAssets = context.netWorth + context.totalDebt; // Gross assets
  if (totalAssets > 0) {
    // This is simplified - would need security classification for accuracy
    context.assetAllocation.usEquity = ((context.totalInvestments + context.totalRetirement) / totalAssets) * 70; // Estimate
    context.assetAllocation.intlEquity = ((context.totalInvestments + context.totalRetirement) / totalAssets) * 15;
    context.assetAllocation.bonds = ((context.totalInvestments + context.totalRetirement) / totalAssets) * 10;
    context.assetAllocation.cash = (context.totalCash / totalAssets) * 100;
    context.assetAllocation.crypto = (context.totalCrypto / totalAssets) * 100;
  }
  
  // Find concentration risks (>10% in single holding)
  const portfolioTotal = allHoldings.reduce((sum, h) => sum + h.currentValue, 0);
  if (portfolioTotal > 0) {
    allHoldings.forEach(h => {
      const pct = (h.currentValue / portfolioTotal) * 100;
      if (pct > 10) {
        context.concentrationRisks.push({
          symbol: h.symbol,
          percentage: pct
        });
      }
    });
  }
  
  return context;
}
