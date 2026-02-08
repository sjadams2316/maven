/**
 * Mock Tax Data Provider
 * 
 * Tax lot tracking, harvesting opportunities, and capital gains summary.
 * Replace with brokerage API integration when ready.
 */

import { TaxDataProvider, TaxLot } from '../types';

// Demo tax lots with realistic dates and cost basis
const DEMO_TAX_LOTS: TaxLot[] = [
  // CIFR - multiple purchases, some gains some losses
  {
    symbol: 'CIFR',
    shares: 500,
    costBasis: 4.50,
    purchaseDate: '2023-03-15',
    holdingPeriod: 'long-term',
    gainLoss: 10750, // Current price ~26
  },
  {
    symbol: 'CIFR',
    shares: 1000,
    costBasis: 8.20,
    purchaseDate: '2023-08-22',
    holdingPeriod: 'long-term',
    gainLoss: 17800,
  },
  {
    symbol: 'CIFR',
    shares: 500,
    costBasis: 3.80,
    purchaseDate: '2024-01-10',
    holdingPeriod: 'long-term',
    gainLoss: 11100,
  },
  {
    symbol: 'CIFR',
    shares: 500,
    costBasis: 5.90,
    purchaseDate: '2024-11-15',
    holdingPeriod: 'short-term',
    gainLoss: 10050,
  },
  
  // IREN - strong gains
  {
    symbol: 'IREN',
    shares: 800,
    costBasis: 7.50,
    purchaseDate: '2023-06-01',
    holdingPeriod: 'long-term',
    gainLoss: 10888, // Current ~21
  },
  {
    symbol: 'IREN',
    shares: 600,
    costBasis: 9.20,
    purchaseDate: '2023-12-15',
    holdingPeriod: 'long-term',
    gainLoss: 7146,
  },
  {
    symbol: 'IREN',
    shares: 400,
    costBasis: 14.80,
    purchaseDate: '2024-09-20',
    holdingPeriod: 'short-term',
    gainLoss: 2524,
  },

  // VTI - index fund, steady growth
  {
    symbol: 'VTI',
    shares: 150,
    costBasis: 210.00,
    purchaseDate: '2022-01-15',
    holdingPeriod: 'long-term',
    gainLoss: 7500, // Current ~260
  },
  {
    symbol: 'VTI',
    shares: 100,
    costBasis: 235.00,
    purchaseDate: '2024-03-01',
    holdingPeriod: 'long-term',
    gainLoss: 2500,
  },

  // QQQ - tech growth
  {
    symbol: 'QQQ',
    shares: 70,
    costBasis: 380.00,
    purchaseDate: '2023-05-10',
    holdingPeriod: 'long-term',
    gainLoss: 9200, // Current ~511
  },

  // Some losers for harvesting
  {
    symbol: 'INTC',
    shares: 200,
    costBasis: 48.50,
    purchaseDate: '2023-04-01',
    holdingPeriod: 'long-term',
    gainLoss: -5200, // Intel has dropped
  },
  {
    symbol: 'PYPL',
    shares: 150,
    costBasis: 72.30,
    purchaseDate: '2023-09-15',
    holdingPeriod: 'long-term',
    gainLoss: -3195, // PayPal struggles
  },
  {
    symbol: 'DIS',
    shares: 100,
    costBasis: 118.00,
    purchaseDate: '2024-02-20',
    holdingPeriod: 'long-term',
    gainLoss: -1800, // Disney down
  },
  {
    symbol: 'BA',
    shares: 50,
    costBasis: 245.00,
    purchaseDate: '2024-06-10',
    holdingPeriod: 'short-term',
    gainLoss: -4250, // Boeing troubles
  },
];

// Wash sale watch list (symbols bought recently)
const RECENT_PURCHASES = new Set(['CIFR', 'VTI']);

export class MockTaxProvider implements TaxDataProvider {
  async getTaxLots(userId: string, symbol?: string): Promise<TaxLot[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (symbol) {
      return DEMO_TAX_LOTS.filter(lot => lot.symbol === symbol.toUpperCase());
    }
    return DEMO_TAX_LOTS;
  }

  async getHarvestingOpportunities(userId: string): Promise<{ symbol: string; loss: number; washSaleRisk: boolean }[]> {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Find all lots with losses
    const lossBySymbol: Record<string, number> = {};
    
    for (const lot of DEMO_TAX_LOTS) {
      if (lot.gainLoss < 0) {
        lossBySymbol[lot.symbol] = (lossBySymbol[lot.symbol] || 0) + lot.gainLoss;
      }
    }

    return Object.entries(lossBySymbol)
      .map(([symbol, loss]) => ({
        symbol,
        loss: Math.abs(loss),
        washSaleRisk: RECENT_PURCHASES.has(symbol),
      }))
      .sort((a, b) => b.loss - a.loss);
  }

  async getCapitalGainsSummary(userId: string, year: number): Promise<{ shortTerm: number; longTerm: number; carryforward: number }> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Calculate from lots
    let shortTerm = 0;
    let longTerm = 0;
    
    for (const lot of DEMO_TAX_LOTS) {
      if (lot.holdingPeriod === 'short-term') {
        shortTerm += lot.gainLoss;
      } else {
        longTerm += lot.gainLoss;
      }
    }

    return {
      shortTerm,
      longTerm,
      carryforward: 2500, // Demo: $2,500 carryforward from prior years
    };
  }
}

export const mockTaxProvider = new MockTaxProvider();
