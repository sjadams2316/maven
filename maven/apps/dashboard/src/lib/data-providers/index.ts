/**
 * Maven Data Provider Factory
 * 
 * Central hub for all data access. Swap mock ↔ live via environment variables.
 * 
 * Usage:
 *   import { getPortfolioProvider, getFundProvider } from '@/lib/data-providers';
 *   const provider = getPortfolioProvider();
 *   const accounts = await provider.getAccounts(userId);
 * 
 * Configuration via environment variables:
 *   DATA_PROVIDER_PORTFOLIO=mock|live (default: mock)
 *   DATA_PROVIDER_FUND=mock|live (default: mock)
 *   etc.
 */

import type {
  PortfolioDataProvider,
  FundDataProvider,
  TaxDataProvider,
  MarketDataProvider,
  EconomicDataProvider,
  AnalystDataProvider,
  RiskDataProvider,
  RetirementDataProvider,
  DataProviderConfig,
  DataSource,
} from './types';

// Mock providers
import { mockPortfolioProvider } from './mock/portfolio';
import { mockFundProvider } from './mock/fund';
import { mockTaxProvider } from './mock/tax';

// =============================================================================
// CONFIGURATION
// =============================================================================

function getDataSource(key: keyof DataProviderConfig): DataSource {
  const envKey = `DATA_PROVIDER_${key.toUpperCase()}`;
  const value = process.env[envKey];
  
  if (value === 'live') return 'live';
  return 'mock'; // Default to mock for safety
}

// Feature flags for easy checking
export const dataConfig = {
  get portfolio(): DataSource { return getDataSource('portfolio'); },
  get fund(): DataSource { return getDataSource('fund'); },
  get tax(): DataSource { return getDataSource('tax'); },
  get market(): DataSource { return getDataSource('market'); },
  get economic(): DataSource { return getDataSource('economic'); },
  get analyst(): DataSource { return getDataSource('analyst'); },
  get risk(): DataSource { return getDataSource('risk'); },
  get retirement(): DataSource { return getDataSource('retirement'); },
  
  // Helper to check if any live data is enabled
  get hasLiveData(): boolean {
    return (
      this.portfolio === 'live' ||
      this.fund === 'live' ||
      this.tax === 'live' ||
      this.market === 'live'
    );
  },
  
  // Summary for debugging/display
  getSummary(): Record<string, DataSource> {
    return {
      portfolio: this.portfolio,
      fund: this.fund,
      tax: this.tax,
      market: this.market,
      economic: this.economic,
      analyst: this.analyst,
      risk: this.risk,
      retirement: this.retirement,
    };
  },
};

// =============================================================================
// PROVIDER FACTORIES
// =============================================================================

/**
 * Portfolio data: accounts, holdings, balances
 * Mock: Demo portfolio | Live: Plaid integration
 */
export function getPortfolioProvider(): PortfolioDataProvider {
  if (dataConfig.portfolio === 'live') {
    // TODO: Return PlaidPortfolioProvider when implemented
    console.warn('Live portfolio provider not yet implemented, falling back to mock');
    return mockPortfolioProvider;
  }
  return mockPortfolioProvider;
}

/**
 * Fund data: holdings, ratings, performance, style box
 * Mock: Demo funds | Live: Morningstar API ($25-50K/year)
 */
export function getFundProvider(): FundDataProvider {
  if (dataConfig.fund === 'live') {
    // TODO: Return MorningstarFundProvider when implemented
    console.warn('Live fund provider not yet implemented, falling back to mock');
    return mockFundProvider;
  }
  return mockFundProvider;
}

/**
 * Tax data: tax lots, harvesting opportunities, gains summary
 * Mock: Demo lots | Live: Brokerage API integration
 */
export function getTaxProvider(): TaxDataProvider {
  if (dataConfig.tax === 'live') {
    // TODO: Return BrokerageTaxProvider when implemented
    console.warn('Live tax provider not yet implemented, falling back to mock');
    return mockTaxProvider;
  }
  return mockTaxProvider;
}

/**
 * Market data: quotes, historical prices
 * Already live via Yahoo Finance, CoinGecko, Polygon
 * This factory is for future consolidation
 */
export function getMarketProvider(): MarketDataProvider | null {
  // Market data is handled by existing API routes for now
  // Future: consolidate into a proper provider
  return null;
}

/**
 * Economic data: Fed rates, inflation, GDP
 * Already live via FRED API
 */
export function getEconomicProvider(): EconomicDataProvider | null {
  // Economic data is handled by existing API routes for now
  return null;
}

/**
 * Analyst data: ratings, price targets, consensus
 * Already live via FMP API
 */
export function getAnalystProvider(): AnalystDataProvider | null {
  // Analyst data is handled by existing API routes for now
  return null;
}

/**
 * Risk data: volatility, VaR, correlations
 * Mock: Calculated from historical | Live: Institutional risk models
 */
export function getRiskProvider(): RiskDataProvider | null {
  // TODO: Implement risk provider
  return null;
}

/**
 * Retirement data: Social Security, pensions, 401k details
 * Mock: Demo data | Live: SSA API / HR integrations
 */
export function getRetirementProvider(): RetirementDataProvider | null {
  // TODO: Implement retirement provider
  return null;
}

// =============================================================================
// CONVENIENCE EXPORTS
// =============================================================================

// Re-export types for consumers
export * from './types';

// Direct access to mock data for testing/demos
export { mockPortfolioProvider } from './mock/portfolio';
export { mockFundProvider } from './mock/fund';
export { mockTaxProvider } from './mock/tax';
