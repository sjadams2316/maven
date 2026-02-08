/**
 * Tax Lot Manager
 * 
 * Creates and manages tax lots from transactions.
 * Supports multiple cost basis methods:
 * - FIFO (First In, First Out) - default
 * - LIFO (Last In, First Out)
 * - HIFO (Highest In, First Out) - tax optimal for gains
 * - Specific Identification - user chooses
 * 
 * ITERATION NOTES:
 * v1: FIFO implementation
 * v1.1: Added LIFO and HIFO
 * v1.2: Per-lot gain/loss calculation
 * v1.3: Holding period tracking
 * v1.4: Integration with wash sale tracker
 */

import { checkWashSale, Transaction } from './wash-sale-tracker';

export type CostBasisMethod = 'fifo' | 'lifo' | 'hifo' | 'specific';

export interface TaxLot {
  id: string;
  accountId: string;
  accountName?: string;
  symbol: string;
  
  // Quantities
  originalQuantity: number;
  remainingQuantity: number;
  
  // Cost basis
  costBasisPerShare: number;
  totalCostBasis: number;
  
  // Dates
  acquisitionDate: Date;
  
  // Type
  acquisitionType: 'purchase' | 'gift' | 'inheritance' | 'transfer' | 'dividend_reinvest';
  
  // Status
  isFullyDisposed: boolean;
  
  // Tax info
  isCovered: boolean;  // Broker reports to IRS
  
  // Calculated at query time
  holdingPeriod?: 'short_term' | 'long_term';
  daysHeld?: number;
  currentValue?: number;
  unrealizedGainLoss?: number;
  unrealizedGainLossPercent?: number;
}

export interface LotDisposition {
  lotId: string;
  quantity: number;
  proceeds: number;
  proceedsPerShare: number;
  saleDate: Date;
  
  // Calculated
  costBasis: number;
  gainLoss: number;
  isShortTerm: boolean;
  
  // Wash sale adjustments
  washSaleDisallowed: number;
  adjustedGainLoss: number;
}

export interface SaleResult {
  dispositions: LotDisposition[];
  totalProceeds: number;
  totalCostBasis: number;
  totalGainLoss: number;
  shortTermGainLoss: number;
  longTermGainLoss: number;
  washSaleDisallowed: number;
  netGainLoss: number;  // After wash sale adjustments
}

/**
 * Calculate holding period and days held
 */
export function calculateHoldingPeriod(acquisitionDate: Date, asOfDate: Date = new Date()): {
  holdingPeriod: 'short_term' | 'long_term';
  daysHeld: number;
} {
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysHeld = Math.floor((asOfDate.getTime() - acquisitionDate.getTime()) / msPerDay);
  
  // Long-term = held more than 1 year (365 days)
  const holdingPeriod = daysHeld > 365 ? 'long_term' : 'short_term';
  
  return { holdingPeriod, daysHeld };
}

/**
 * Create tax lots from a buy transaction
 */
export function createLotFromPurchase(
  transaction: Transaction,
  accountName?: string
): TaxLot {
  const quantity = Math.abs(transaction.quantity);
  const totalCost = Math.abs(transaction.amount);
  
  return {
    id: `lot_${transaction.id}`,
    accountId: transaction.accountId,
    accountName: accountName || transaction.accountName,
    symbol: transaction.symbol.toUpperCase(),
    originalQuantity: quantity,
    remainingQuantity: quantity,
    costBasisPerShare: totalCost / quantity,
    totalCostBasis: totalCost,
    acquisitionDate: new Date(transaction.date),
    acquisitionType: 'purchase',
    isFullyDisposed: false,
    isCovered: true,
  };
}

/**
 * Sort lots according to cost basis method
 */
export function sortLotsForSale(
  lots: TaxLot[],
  method: CostBasisMethod,
  specificLotIds?: string[]
): TaxLot[] {
  if (method === 'specific' && specificLotIds) {
    // Return lots in the specified order
    return specificLotIds
      .map(id => lots.find(l => l.id === id))
      .filter((l): l is TaxLot => l !== undefined && l.remainingQuantity > 0);
  }
  
  const availableLots = lots.filter(l => l.remainingQuantity > 0);
  
  switch (method) {
    case 'fifo':
      // Oldest first
      return availableLots.sort((a, b) => 
        a.acquisitionDate.getTime() - b.acquisitionDate.getTime()
      );
      
    case 'lifo':
      // Newest first
      return availableLots.sort((a, b) => 
        b.acquisitionDate.getTime() - a.acquisitionDate.getTime()
      );
      
    case 'hifo':
      // Highest cost basis first (minimizes gains / maximizes losses)
      return availableLots.sort((a, b) => 
        b.costBasisPerShare - a.costBasisPerShare
      );
      
    default:
      return availableLots;
  }
}

/**
 * Calculate sale result with lot-level detail
 * This is the core function for tax-aware selling
 */
export function calculateSaleResult(
  lots: TaxLot[],
  quantityToSell: number,
  pricePerShare: number,
  saleDate: Date,
  method: CostBasisMethod = 'fifo',
  specificLotIds?: string[],
  allTransactions?: Transaction[]  // For wash sale checking
): SaleResult {
  const sortedLots = sortLotsForSale(lots, method, specificLotIds);
  const dispositions: LotDisposition[] = [];
  
  let remainingToSell = quantityToSell;
  let totalProceeds = 0;
  let totalCostBasis = 0;
  let shortTermGainLoss = 0;
  let longTermGainLoss = 0;
  let washSaleDisallowed = 0;
  
  for (const lot of sortedLots) {
    if (remainingToSell <= 0) break;
    
    const quantityFromThisLot = Math.min(remainingToSell, lot.remainingQuantity);
    const proceeds = quantityFromThisLot * pricePerShare;
    const costBasis = quantityFromThisLot * lot.costBasisPerShare;
    const gainLoss = proceeds - costBasis;
    
    const { holdingPeriod } = calculateHoldingPeriod(lot.acquisitionDate, saleDate);
    const isShortTerm = holdingPeriod === 'short_term';
    
    // Check for wash sale if we have transaction history
    let lotWashSaleDisallowed = 0;
    if (allTransactions && gainLoss < 0) {
      // Only check if there's a loss
      const saleTransaction: Transaction = {
        id: `sale_${lot.id}_${Date.now()}`,
        userId: '',
        accountId: lot.accountId,
        accountName: lot.accountName,
        date: saleDate,
        type: 'sell',
        symbol: lot.symbol,
        quantity: -quantityFromThisLot,
        price: pricePerShare,
        amount: proceeds,
      };
      
      const washSaleResult = checkWashSale(saleTransaction, allTransactions, costBasis);
      lotWashSaleDisallowed = washSaleResult.totalDisallowedLoss;
    }
    
    const adjustedGainLoss = gainLoss + lotWashSaleDisallowed;  // Less negative if wash sale
    
    dispositions.push({
      lotId: lot.id,
      quantity: quantityFromThisLot,
      proceeds,
      proceedsPerShare: pricePerShare,
      saleDate,
      costBasis,
      gainLoss,
      isShortTerm,
      washSaleDisallowed: lotWashSaleDisallowed,
      adjustedGainLoss,
    });
    
    totalProceeds += proceeds;
    totalCostBasis += costBasis;
    
    if (isShortTerm) {
      shortTermGainLoss += adjustedGainLoss;
    } else {
      longTermGainLoss += adjustedGainLoss;
    }
    
    washSaleDisallowed += lotWashSaleDisallowed;
    remainingToSell -= quantityFromThisLot;
  }
  
  return {
    dispositions,
    totalProceeds,
    totalCostBasis,
    totalGainLoss: totalProceeds - totalCostBasis,
    shortTermGainLoss,
    longTermGainLoss,
    washSaleDisallowed,
    netGainLoss: shortTermGainLoss + longTermGainLoss,
  };
}

/**
 * Find tax-loss harvesting opportunities at the lot level
 * This is more accurate than position-level because it finds
 * harvestable lots within positions that might be overall profitable
 */
export function findLotLevelHarvestOpportunities(
  lots: TaxLot[],
  currentPrices: Record<string, number>,
  minLoss: number = 100
): Array<{
  lot: TaxLot;
  currentPrice: number;
  currentValue: number;
  unrealizedLoss: number;
  holdingPeriod: 'short_term' | 'long_term';
  daysHeld: number;
}> {
  const opportunities: Array<{
    lot: TaxLot;
    currentPrice: number;
    currentValue: number;
    unrealizedLoss: number;
    holdingPeriod: 'short_term' | 'long_term';
    daysHeld: number;
  }> = [];
  
  for (const lot of lots) {
    if (lot.remainingQuantity <= 0) continue;
    
    const currentPrice = currentPrices[lot.symbol.toUpperCase()];
    if (!currentPrice) continue;
    
    const currentValue = lot.remainingQuantity * currentPrice;
    const costBasis = lot.remainingQuantity * lot.costBasisPerShare;
    const unrealizedGL = currentValue - costBasis;
    
    // Only include losses above threshold
    if (unrealizedGL >= 0 || Math.abs(unrealizedGL) < minLoss) continue;
    
    const { holdingPeriod, daysHeld } = calculateHoldingPeriod(lot.acquisitionDate);
    
    opportunities.push({
      lot,
      currentPrice,
      currentValue,
      unrealizedLoss: Math.abs(unrealizedGL),
      holdingPeriod,
      daysHeld,
    });
  }
  
  // Sort by loss amount (largest first)
  return opportunities.sort((a, b) => b.unrealizedLoss - a.unrealizedLoss);
}

/**
 * Optimize lot selection for tax-loss harvesting
 * Prefers short-term losses (higher tax benefit) over long-term
 */
export function optimizeLotSelectionForHarvest(
  lots: TaxLot[],
  currentPrices: Record<string, number>,
  targetLossAmount?: number
): TaxLot[] {
  const opportunities = findLotLevelHarvestOpportunities(lots, currentPrices);
  
  if (!targetLossAmount) {
    // No target - return all lots with losses, short-term first
    return opportunities
      .sort((a, b) => {
        // Short-term first (more valuable)
        if (a.holdingPeriod !== b.holdingPeriod) {
          return a.holdingPeriod === 'short_term' ? -1 : 1;
        }
        // Then by loss amount
        return b.unrealizedLoss - a.unrealizedLoss;
      })
      .map(o => o.lot);
  }
  
  // Target specified - select lots to hit the target
  const selectedLots: TaxLot[] = [];
  let accumulatedLoss = 0;
  
  // Prioritize short-term losses
  const shortTermOpps = opportunities.filter(o => o.holdingPeriod === 'short_term');
  const longTermOpps = opportunities.filter(o => o.holdingPeriod === 'long_term');
  
  for (const opp of [...shortTermOpps, ...longTermOpps]) {
    if (accumulatedLoss >= targetLossAmount) break;
    
    selectedLots.push(opp.lot);
    accumulatedLoss += opp.unrealizedLoss;
  }
  
  return selectedLots;
}

/**
 * Calculate unrealized gains/losses for all lots
 */
export function enrichLotsWithMarketData(
  lots: TaxLot[],
  currentPrices: Record<string, number>
): TaxLot[] {
  return lots.map(lot => {
    const currentPrice = currentPrices[lot.symbol.toUpperCase()];
    if (!currentPrice || lot.remainingQuantity <= 0) {
      return lot;
    }
    
    const { holdingPeriod, daysHeld } = calculateHoldingPeriod(lot.acquisitionDate);
    const currentValue = lot.remainingQuantity * currentPrice;
    const costBasis = lot.remainingQuantity * lot.costBasisPerShare;
    const unrealizedGainLoss = currentValue - costBasis;
    const unrealizedGainLossPercent = (unrealizedGainLoss / costBasis) * 100;
    
    return {
      ...lot,
      holdingPeriod,
      daysHeld,
      currentValue,
      unrealizedGainLoss,
      unrealizedGainLossPercent,
    };
  });
}

/**
 * Group lots by symbol with aggregated stats
 */
export function groupLotsBySymbol(lots: TaxLot[]): Map<string, {
  symbol: string;
  totalShares: number;
  totalCostBasis: number;
  averageCostBasis: number;
  lots: TaxLot[];
  oldestAcquisition: Date;
  newestAcquisition: Date;
}> {
  const grouped = new Map<string, {
    symbol: string;
    totalShares: number;
    totalCostBasis: number;
    averageCostBasis: number;
    lots: TaxLot[];
    oldestAcquisition: Date;
    newestAcquisition: Date;
  }>();
  
  for (const lot of lots) {
    if (lot.remainingQuantity <= 0) continue;
    
    const symbol = lot.symbol.toUpperCase();
    const existing = grouped.get(symbol);
    
    if (existing) {
      existing.totalShares += lot.remainingQuantity;
      existing.totalCostBasis += lot.remainingQuantity * lot.costBasisPerShare;
      existing.lots.push(lot);
      
      if (lot.acquisitionDate < existing.oldestAcquisition) {
        existing.oldestAcquisition = lot.acquisitionDate;
      }
      if (lot.acquisitionDate > existing.newestAcquisition) {
        existing.newestAcquisition = lot.acquisitionDate;
      }
      
      existing.averageCostBasis = existing.totalCostBasis / existing.totalShares;
    } else {
      grouped.set(symbol, {
        symbol,
        totalShares: lot.remainingQuantity,
        totalCostBasis: lot.remainingQuantity * lot.costBasisPerShare,
        averageCostBasis: lot.costBasisPerShare,
        lots: [lot],
        oldestAcquisition: lot.acquisitionDate,
        newestAcquisition: lot.acquisitionDate,
      });
    }
  }
  
  return grouped;
}
