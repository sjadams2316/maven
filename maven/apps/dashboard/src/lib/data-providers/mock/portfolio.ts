/**
 * Mock Portfolio Data Provider
 * 
 * Realistic demo data. Replace with Plaid when ready.
 * Pattern: Import this OR the live provider, same interface.
 */

import { PortfolioDataProvider, Account, Holding } from '../types';

// Demo portfolio based on Sam's actual allocation themes
const DEMO_ACCOUNTS: Account[] = [
  {
    id: 'brokerage-1',
    name: 'Individual Brokerage',
    type: 'brokerage',
    institution: 'Fidelity',
    balance: 103000,
    holdings: [
      {
        symbol: 'CIFR',
        name: 'Cipher Mining Inc',
        shares: 2500,
        costBasis: 35000,
        currentPrice: 26.00,
        marketValue: 65000,
        gainLoss: 30000,
        gainLossPercent: 85.7,
        accountId: 'brokerage-1',
        accountType: 'brokerage',
        assetClass: 'stock',
        sector: 'Technology',
      },
      {
        symbol: 'IREN',
        name: 'Iris Energy Limited',
        shares: 1800,
        costBasis: 18000,
        currentPrice: 21.11,
        marketValue: 38000,
        gainLoss: 20000,
        gainLossPercent: 111.1,
        accountId: 'brokerage-1',
        accountType: 'brokerage',
        assetClass: 'stock',
        sector: 'Technology',
      },
    ],
  },
  {
    id: '401k-1',
    name: 'Capital Group 401(k)',
    type: '401k',
    institution: 'Capital Group',
    balance: 83000,
    holdings: [
      {
        symbol: 'AGTHX',
        name: 'American Growth Fund of America',
        shares: 800,
        costBasis: 52000,
        currentPrice: 65.00,
        marketValue: 52000,
        gainLoss: 0,
        gainLossPercent: 0,
        accountId: '401k-1',
        accountType: '401k',
        assetClass: 'stock',
        sector: 'Diversified',
      },
      {
        symbol: 'AIVSX',
        name: 'American Investment Company of America',
        shares: 600,
        costBasis: 25000,
        currentPrice: 51.67,
        marketValue: 31000,
        gainLoss: 6000,
        gainLossPercent: 24.0,
        accountId: '401k-1',
        accountType: '401k',
        assetClass: 'stock',
        sector: 'Diversified',
      },
    ],
  },
  {
    id: 'ira-1',
    name: 'Rollover IRA',
    type: 'ira',
    institution: 'Fidelity',
    balance: 150000,
    holdings: [
      {
        symbol: 'TAO',
        name: 'Bittensor',
        shares: 100,
        costBasis: 30000,
        currentPrice: 450.00,
        marketValue: 45000,
        gainLoss: 15000,
        gainLossPercent: 50.0,
        accountId: 'ira-1',
        accountType: 'ira',
        assetClass: 'crypto',
      },
      {
        symbol: 'VTI',
        name: 'Vanguard Total Stock Market ETF',
        shares: 250,
        costBasis: 55000,
        currentPrice: 260.00,
        marketValue: 65000,
        gainLoss: 10000,
        gainLossPercent: 18.2,
        accountId: 'ira-1',
        accountType: 'ira',
        assetClass: 'stock',
        sector: 'Diversified',
      },
      {
        symbol: 'BND',
        name: 'Vanguard Total Bond Market ETF',
        shares: 500,
        costBasis: 38000,
        currentPrice: 80.00,
        marketValue: 40000,
        gainLoss: 2000,
        gainLossPercent: 5.3,
        accountId: 'ira-1',
        accountType: 'ira',
        assetClass: 'bond',
      },
    ],
  },
  {
    id: 'roth-1',
    name: 'Roth IRA',
    type: 'roth',
    institution: 'Fidelity',
    balance: 65000,
    holdings: [
      {
        symbol: 'TAO',
        name: 'Bittensor',
        shares: 65,
        costBasis: 20000,
        currentPrice: 450.00,
        marketValue: 29250,
        gainLoss: 9250,
        gainLossPercent: 46.25,
        accountId: 'roth-1',
        accountType: 'roth',
        assetClass: 'crypto',
      },
      {
        symbol: 'QQQ',
        name: 'Invesco QQQ Trust',
        shares: 70,
        costBasis: 28000,
        currentPrice: 511.43,
        marketValue: 35800,
        gainLoss: 7800,
        gainLossPercent: 27.9,
        accountId: 'roth-1',
        accountType: 'roth',
        assetClass: 'stock',
        sector: 'Technology',
      },
    ],
  },
  {
    id: 'crypto-1',
    name: 'Coinbase',
    type: 'brokerage',
    institution: 'Coinbase',
    balance: 22500,
    holdings: [
      {
        symbol: 'TAO',
        name: 'Bittensor',
        shares: 50,
        costBasis: 15000,
        currentPrice: 450.00,
        marketValue: 22500,
        gainLoss: 7500,
        gainLossPercent: 50.0,
        accountId: 'crypto-1',
        accountType: 'brokerage',
        assetClass: 'crypto',
      },
    ],
  },
];

export class MockPortfolioProvider implements PortfolioDataProvider {
  private accounts = DEMO_ACCOUNTS;

  async getAccounts(userId: string): Promise<Account[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.accounts;
  }

  async getHoldings(userId: string): Promise<Holding[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.accounts.flatMap(account => account.holdings);
  }

  async getTotalValue(userId: string): Promise<number> {
    const holdings = await this.getHoldings(userId);
    return holdings.reduce((sum, h) => sum + h.marketValue, 0);
  }

  async getAssetAllocation(userId: string): Promise<Record<string, number>> {
    const holdings = await this.getHoldings(userId);
    const total = holdings.reduce((sum, h) => sum + h.marketValue, 0);
    
    const allocation: Record<string, number> = {};
    for (const holding of holdings) {
      const key = holding.assetClass;
      allocation[key] = (allocation[key] || 0) + (holding.marketValue / total) * 100;
    }
    
    return allocation;
  }

  async refreshAccounts(userId: string): Promise<void> {
    // No-op for mock - in real implementation, this would trigger Plaid refresh
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// Singleton export
export const mockPortfolioProvider = new MockPortfolioProvider();
