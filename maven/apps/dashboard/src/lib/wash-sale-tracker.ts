/**
 * Wash Sale Tracker
 * 
 * Enforces IRS wash sale rules:
 * - Cannot claim loss if you buy substantially identical security
 *   within 30 days BEFORE or AFTER the sale
 * - Applies across ALL accounts (including retirement!)
 * - Disallowed loss gets added to cost basis of replacement shares
 * 
 * Key insight: The 61-day window (30 before + sale day + 30 after)
 * 
 * ITERATION NOTES:
 * v1: Basic 61-day window check
 * v1.1: Cross-account detection
 * v1.2: Substantially identical securities
 * v1.3: Disallowed loss calculation
 * v1.4: Replacement share basis adjustment
 */

import { SUBSTANTIALLY_IDENTICAL } from './tax-loss-scanner';

// Re-export for convenience
export { SUBSTANTIALLY_IDENTICAL };

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  accountName?: string;
  accountType?: string;
  date: Date;
  type: 'buy' | 'sell' | 'dividend' | 'transfer' | 'other';
  symbol: string;
  quantity: number;
  price: number;
  amount: number;  // Total (quantity * price + fees)
  fees?: number;
}

export interface WashSaleViolation {
  // The sale that triggered the wash sale
  saleTransaction: Transaction;
  saleDate: Date;
  lossAmount: number;
  
  // The purchase that caused the violation
  triggeringPurchase: Transaction;
  purchaseDate: Date;
  daysFromSale: number;  // Negative = before sale, positive = after
  
  // Impact
  disallowedLoss: number;
  adjustedBasis: number;  // New cost basis for replacement shares
  
  // Details
  isCrossAccount: boolean;
  saleAccountName: string;
  purchaseAccountName: string;
  
  // Explanation
  explanation: string;
}

export interface WashSaleCheckResult {
  hasViolation: boolean;
  violations: WashSaleViolation[];
  totalDisallowedLoss: number;
  allowedLoss: number;
  warnings: string[];
}

/**
 * Get all substantially identical tickers for a given symbol
 */
export function getIdenticalSecurities(symbol: string): Set<string> {
  const upperSymbol = symbol.toUpperCase();
  const identical = new Set([upperSymbol]);
  
  // Direct lookup
  const directMatches = SUBSTANTIALLY_IDENTICAL[upperSymbol];
  if (directMatches) {
    directMatches.forEach(t => identical.add(t));
  }
  
  // Reverse lookup - find all tickers that consider this one identical
  for (const [key, values] of Object.entries(SUBSTANTIALLY_IDENTICAL)) {
    if (values.includes(upperSymbol)) {
      identical.add(key);
      values.forEach(v => identical.add(v));
    }
  }
  
  return identical;
}

/**
 * Check if two symbols are substantially identical for wash sale purposes
 */
export function areSubstantiallyIdentical(symbol1: string, symbol2: string): boolean {
  const upper1 = symbol1.toUpperCase();
  const upper2 = symbol2.toUpperCase();
  
  if (upper1 === upper2) return true;
  
  const identical1 = getIdenticalSecurities(upper1);
  return identical1.has(upper2);
}

/**
 * Calculate days between two dates (negative if date1 > date2)
 */
function daysBetween(date1: Date, date2: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((date2.getTime() - date1.getTime()) / msPerDay);
}

/**
 * Check for wash sale violations on a proposed or actual sale
 * 
 * @param saleTransaction - The sale to check
 * @param allTransactions - All transactions across all accounts
 * @param costBasis - Cost basis of the shares being sold
 */
export function checkWashSale(
  saleTransaction: Transaction,
  allTransactions: Transaction[],
  costBasis: number
): WashSaleCheckResult {
  const violations: WashSaleViolation[] = [];
  const warnings: string[] = [];
  
  const saleDate = new Date(saleTransaction.date);
  const saleSymbol = saleTransaction.symbol.toUpperCase();
  const saleQuantity = Math.abs(saleTransaction.quantity);
  const saleProceeds = Math.abs(saleTransaction.amount);
  
  // Calculate loss (if no loss, no wash sale concern)
  const grossLoss = costBasis - saleProceeds;
  if (grossLoss <= 0) {
    return {
      hasViolation: false,
      violations: [],
      totalDisallowedLoss: 0,
      allowedLoss: 0,  // No loss to allow
      warnings: [],
    };
  }
  
  // Get identical securities
  const identicalSecurities = getIdenticalSecurities(saleSymbol);
  
  // Define the 61-day window
  const windowStart = new Date(saleDate);
  windowStart.setDate(windowStart.getDate() - 30);
  const windowEnd = new Date(saleDate);
  windowEnd.setDate(windowEnd.getDate() + 30);
  
  // Find all purchases of identical securities within the window
  const triggeringPurchases = allTransactions.filter(t => {
    // Must be a buy
    if (t.type !== 'buy') return false;
    
    // Must be identical security
    if (!identicalSecurities.has(t.symbol.toUpperCase())) return false;
    
    // Must be within 61-day window
    const txDate = new Date(t.date);
    if (txDate < windowStart || txDate > windowEnd) return false;
    
    // Can't be the same transaction
    if (t.id === saleTransaction.id) return false;
    
    return true;
  });
  
  if (triggeringPurchases.length === 0) {
    return {
      hasViolation: false,
      violations: [],
      totalDisallowedLoss: 0,
      allowedLoss: grossLoss,
      warnings: [],
    };
  }
  
  // Calculate wash sale impact
  // The disallowed loss is proportional to replacement shares
  let totalReplacementShares = 0;
  
  for (const purchase of triggeringPurchases) {
    const purchaseDate = new Date(purchase.date);
    const daysFromSale = daysBetween(saleDate, purchaseDate);
    const isCrossAccount = purchase.accountId !== saleTransaction.accountId;
    
    // Replacement shares are the lesser of sold shares or purchased shares
    const replacementShares = Math.min(saleQuantity, Math.abs(purchase.quantity));
    totalReplacementShares += replacementShares;
    
    // Disallowed loss is proportional
    const disallowedRatio = replacementShares / saleQuantity;
    const disallowedLoss = grossLoss * disallowedRatio;
    
    // The disallowed loss gets added to the cost basis of replacement shares
    const originalPurchaseBasis = Math.abs(purchase.amount);
    const adjustedBasis = originalPurchaseBasis + disallowedLoss;
    
    // Build explanation
    let explanation = `You sold ${saleQuantity} shares of ${saleSymbol} at a $${grossLoss.toFixed(2)} loss. `;
    
    if (daysFromSale < 0) {
      explanation += `${Math.abs(daysFromSale)} days BEFORE this sale, `;
    } else if (daysFromSale > 0) {
      explanation += `${daysFromSale} days AFTER this sale, `;
    } else {
      explanation += `On the SAME DAY, `;
    }
    
    explanation += `you purchased ${Math.abs(purchase.quantity)} shares of ${purchase.symbol}`;
    
    if (isCrossAccount) {
      explanation += ` in a DIFFERENT account (${purchase.accountName || 'another account'})`;
    }
    
    explanation += `. This triggers wash sale rules. `;
    explanation += `$${disallowedLoss.toFixed(2)} of your loss is disallowed and added to the cost basis of the new shares.`;
    
    violations.push({
      saleTransaction,
      saleDate,
      lossAmount: grossLoss,
      triggeringPurchase: purchase,
      purchaseDate,
      daysFromSale,
      disallowedLoss,
      adjustedBasis,
      isCrossAccount,
      saleAccountName: saleTransaction.accountName || 'Unknown',
      purchaseAccountName: purchase.accountName || 'Unknown',
      explanation,
    });
    
    if (isCrossAccount) {
      warnings.push(
        `⚠️ Cross-account wash sale detected: Purchase in ${purchase.accountName || 'another account'} ` +
        `triggers wash sale on sale in ${saleTransaction.accountName || 'this account'}.`
      );
    }
  }
  
  const totalDisallowedLoss = violations.reduce((sum, v) => sum + v.disallowedLoss, 0);
  const allowedLoss = Math.max(0, grossLoss - totalDisallowedLoss);
  
  return {
    hasViolation: violations.length > 0,
    violations,
    totalDisallowedLoss,
    allowedLoss,
    warnings,
  };
}

/**
 * Preview wash sale impact BEFORE executing a sale
 * Returns what would happen if the user sells now
 */
export function previewWashSaleImpact(
  symbol: string,
  quantity: number,
  currentPrice: number,
  costBasis: number,
  accountId: string,
  accountName: string,
  allTransactions: Transaction[]
): WashSaleCheckResult {
  // Create a hypothetical sale transaction
  const hypotheticalSale: Transaction = {
    id: 'preview',
    userId: '',
    accountId,
    accountName,
    date: new Date(),
    type: 'sell',
    symbol,
    quantity: -quantity,  // Negative for sale
    price: currentPrice,
    amount: quantity * currentPrice,
  };
  
  return checkWashSale(hypotheticalSale, allTransactions, costBasis);
}

/**
 * Find upcoming wash sale windows that would affect a planned sale
 * Useful for "when can I safely sell?" questions
 */
export function findSafeToSellDate(
  symbol: string,
  allTransactions: Transaction[]
): { safeDate: Date; blockedUntil: Date | null; reason: string } {
  const identicalSecurities = getIdenticalSecurities(symbol);
  const today = new Date();
  
  // Find most recent purchase of identical security
  const recentPurchases = allTransactions
    .filter(t => 
      t.type === 'buy' && 
      identicalSecurities.has(t.symbol.toUpperCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (recentPurchases.length === 0) {
    return {
      safeDate: today,
      blockedUntil: null,
      reason: 'No recent purchases of identical securities. Safe to sell anytime.',
    };
  }
  
  const mostRecentPurchase = recentPurchases[0];
  const purchaseDate = new Date(mostRecentPurchase.date);
  const windowEnd = new Date(purchaseDate);
  windowEnd.setDate(windowEnd.getDate() + 30);
  
  if (today > windowEnd) {
    return {
      safeDate: today,
      blockedUntil: null,
      reason: `Last purchase was ${daysBetween(purchaseDate, today)} days ago. Wash sale window has passed.`,
    };
  }
  
  const daysUntilSafe = daysBetween(today, windowEnd) + 1;
  const safeDate = new Date(windowEnd);
  safeDate.setDate(safeDate.getDate() + 1);
  
  return {
    safeDate,
    blockedUntil: windowEnd,
    reason: `Recent purchase on ${purchaseDate.toLocaleDateString()} creates wash sale risk. ` +
            `Wait ${daysUntilSafe} more day(s) until ${safeDate.toLocaleDateString()} to sell safely.`,
  };
}

/**
 * Check if a planned purchase would trigger wash sale on recent sales
 * (The reverse check - buying after selling at a loss)
 */
export function checkPurchaseTriggersWashSale(
  symbol: string,
  purchaseAccountId: string,
  allTransactions: Transaction[],
  allTaxLots: Array<{ symbol: string; costBasis: number; acquisitionDate: Date; remainingQuantity: number }>
): { wouldTrigger: boolean; affectedSales: Transaction[]; warning: string } {
  const identicalSecurities = getIdenticalSecurities(symbol);
  const today = new Date();
  const windowStart = new Date(today);
  windowStart.setDate(windowStart.getDate() - 30);
  
  // Find recent sales of identical securities at a loss
  const recentLossSales = allTransactions.filter(t => {
    if (t.type !== 'sell') return false;
    if (!identicalSecurities.has(t.symbol.toUpperCase())) return false;
    
    const txDate = new Date(t.date);
    if (txDate < windowStart) return false;
    
    // Check if it was a loss (would need cost basis)
    // For now, flag any recent sale as potentially affected
    return true;
  });
  
  if (recentLossSales.length === 0) {
    return {
      wouldTrigger: false,
      affectedSales: [],
      warning: '',
    };
  }
  
  return {
    wouldTrigger: true,
    affectedSales: recentLossSales,
    warning: `⚠️ Buying ${symbol} now may trigger wash sale on your recent sale(s). ` +
             `If you sold at a loss within the last 30 days, that loss may be disallowed.`,
  };
}
