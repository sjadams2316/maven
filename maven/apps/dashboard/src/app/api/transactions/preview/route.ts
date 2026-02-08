/**
 * Transaction Preview API
 * 
 * Preview the tax impact of a sale BEFORE executing it.
 * Shows:
 * - Which lots will be sold (based on cost basis method)
 * - Gain/loss breakdown (short-term vs long-term)
 * - Wash sale warnings
 * - Optimal lot selection suggestions
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { 
  previewWashSaleImpact, 
  findSafeToSellDate,
  Transaction as WashTransaction 
} from '@/lib/wash-sale-tracker';
import { 
  calculateSaleResult, 
  findLotLevelHarvestOpportunities,
  enrichLotsWithMarketData,
  TaxLot as LotManagerTaxLot,
  CostBasisMethod
} from '@/lib/lot-manager';
import { calculateTaxSavings, estimateTaxProfile } from '@/lib/tax-calculator';

/**
 * POST: Preview a sale
 */
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      accountId,
      symbol,
      quantity,
      currentPrice,
      costBasisMethod = 'fifo',
    } = body;

    if (!accountId || !symbol || !quantity || !currentPrice) {
      return NextResponse.json(
        { error: 'Missing required fields: accountId, symbol, quantity, currentPrice' },
        { status: 400 }
      );
    }

    // Get tax profile
    const taxProfile = estimateTaxProfile(user.profileData);

    // Get existing lots for this symbol
    const existingLots = await prisma.taxLot.findMany({
      where: {
        userId: user.id,
        accountId,
        symbol: symbol.toUpperCase(),
        remainingQuantity: { gt: 0 },
      },
      orderBy: { acquisitionDate: 'asc' },
      include: {
        account: { select: { name: true, type: true, subtype: true } },
      },
    });

    if (existingLots.length === 0) {
      return NextResponse.json({
        success: true,
        warning: 'No tax lots found for this symbol. Cost basis tracking unavailable.',
        canSell: true,
        lots: [],
      });
    }

    // Convert to lot manager format
    const lots: LotManagerTaxLot[] = existingLots.map(l => ({
      id: l.id,
      accountId: l.accountId,
      accountName: l.account.name,
      symbol: l.symbol,
      originalQuantity: Number(l.quantity),
      remainingQuantity: Number(l.remainingQuantity),
      costBasisPerShare: Number(l.costBasis) / Number(l.quantity),
      totalCostBasis: Number(l.costBasis),
      acquisitionDate: l.acquisitionDate,
      acquisitionType: l.acquisitionType as any,
      isFullyDisposed: Number(l.remainingQuantity) === 0,
      isCovered: l.isCovered,
    }));

    // Enrich with current prices
    const enrichedLots = enrichLotsWithMarketData(lots, { [symbol.toUpperCase()]: currentPrice });

    // Check available quantity
    const totalAvailable = lots.reduce((sum, l) => sum + l.remainingQuantity, 0);
    if (quantity > totalAvailable) {
      return NextResponse.json({
        success: false,
        error: `Insufficient shares. You have ${totalAvailable} shares available, trying to sell ${quantity}.`,
        available: totalAvailable,
        requested: quantity,
      });
    }

    // Get all transactions for wash sale checking
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const allTransactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        symbol: symbol.toUpperCase(),
        date: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        account: { select: { name: true, type: true } },
      },
    });

    const washTransactions: WashTransaction[] = allTransactions.map(t => ({
      id: t.id,
      userId: t.userId,
      accountId: t.accountId,
      accountName: t.account.name,
      accountType: t.account.type,
      date: t.date,
      type: t.type as any,
      symbol: t.symbol || '',
      quantity: Number(t.quantity) || 0,
      price: Number(t.price) || 0,
      amount: Number(t.amount),
      fees: t.fees ? Number(t.fees) : undefined,
    }));

    // Calculate with different methods for comparison
    const methods: CostBasisMethod[] = ['fifo', 'lifo', 'hifo'];
    const comparisons: Record<string, any> = {};

    for (const method of methods) {
      const result = calculateSaleResult(
        lots,
        quantity,
        currentPrice,
        new Date(),
        method,
        undefined,
        washTransactions
      );

      // Calculate tax impact
      let taxOnGains = 0;
      let taxSavingsFromLosses = 0;

      if (result.shortTermGainLoss > 0) {
        const stCalc = calculateTaxSavings(result.shortTermGainLoss, 'short_term', taxProfile);
        taxOnGains += stCalc.taxSaved;
      } else if (result.shortTermGainLoss < 0) {
        const stCalc = calculateTaxSavings(Math.abs(result.shortTermGainLoss), 'short_term', taxProfile);
        taxSavingsFromLosses += stCalc.taxSaved;
      }

      if (result.longTermGainLoss > 0) {
        const ltCalc = calculateTaxSavings(result.longTermGainLoss, 'long_term', taxProfile);
        taxOnGains += ltCalc.taxSaved;
      } else if (result.longTermGainLoss < 0) {
        const ltCalc = calculateTaxSavings(Math.abs(result.longTermGainLoss), 'long_term', taxProfile);
        taxSavingsFromLosses += ltCalc.taxSaved;
      }

      comparisons[method] = {
        method,
        methodName: method === 'fifo' ? 'First In, First Out' : 
                    method === 'lifo' ? 'Last In, First Out' : 
                    'Highest In, First Out (Tax Optimal)',
        summary: {
          totalProceeds: result.totalProceeds,
          totalCostBasis: result.totalCostBasis,
          grossGainLoss: result.totalGainLoss,
          shortTermGainLoss: result.shortTermGainLoss,
          longTermGainLoss: result.longTermGainLoss,
          washSaleDisallowed: result.washSaleDisallowed,
          netGainLoss: result.netGainLoss,
        },
        taxImpact: {
          taxOnGains,
          taxSavingsFromLosses,
          netTaxImpact: taxOnGains - taxSavingsFromLosses,
        },
        lotsUsed: result.dispositions.map(d => {
          const lot = lots.find(l => l.id === d.lotId);
          return {
            lotId: d.lotId,
            quantity: d.quantity,
            costBasisPerShare: lot?.costBasisPerShare,
            acquisitionDate: lot?.acquisitionDate,
            holdingPeriod: d.isShortTerm ? 'short_term' : 'long_term',
            gainLoss: d.gainLoss,
          };
        }),
      };
    }

    // Find the optimal method
    const optimal = Object.values(comparisons).reduce((best: any, current: any) => {
      // Prefer method with lowest net tax impact (most savings or least tax owed)
      if (!best || current.taxImpact.netTaxImpact < best.taxImpact.netTaxImpact) {
        return current;
      }
      return best;
    }, null);

    // Check safe to sell date
    const safeToSell = findSafeToSellDate(symbol, washTransactions);

    // Preview wash sale impact for selected method
    const selectedResult = comparisons[costBasisMethod];
    const hasWashSaleRisk = selectedResult.summary.washSaleDisallowed > 0 || safeToSell.blockedUntil !== null;

    return NextResponse.json({
      success: true,
      symbol: symbol.toUpperCase(),
      quantity,
      currentPrice,
      
      // Available lots with current values
      availableLots: enrichedLots.map(l => ({
        id: l.id,
        quantity: l.remainingQuantity,
        costBasisPerShare: l.costBasisPerShare,
        currentValue: l.currentValue,
        unrealizedGainLoss: l.unrealizedGainLoss,
        holdingPeriod: l.holdingPeriod,
        daysHeld: l.daysHeld,
        acquisitionDate: l.acquisitionDate,
      })),
      
      // Comparison of different methods
      methodComparison: comparisons,
      
      // Optimal recommendation
      recommendation: {
        method: optimal.method,
        reason: optimal.summary.netGainLoss < 0 
          ? `${optimal.methodName} maximizes your tax loss (saves $${optimal.taxImpact.taxSavingsFromLosses.toFixed(2)} in taxes)`
          : `${optimal.methodName} minimizes your tax liability ($${optimal.taxImpact.taxOnGains.toFixed(2)} in taxes)`,
        taxImpact: optimal.taxImpact.netTaxImpact,
      },
      
      // Selected method result
      selectedMethod: {
        method: costBasisMethod,
        ...selectedResult,
      },
      
      // Wash sale analysis
      washSaleAnalysis: {
        hasRisk: hasWashSaleRisk,
        safeToSellDate: safeToSell.safeDate,
        blockedUntil: safeToSell.blockedUntil,
        reason: safeToSell.reason,
        currentDisallowedAmount: selectedResult.summary.washSaleDisallowed,
      },
      
      // Tax profile used
      taxProfile: {
        income: taxProfile.income,
        filingStatus: taxProfile.filingStatus,
        state: taxProfile.state,
      },
    });
  } catch (error) {
    console.error('Transaction preview error:', error);
    return NextResponse.json({ error: 'Failed to preview transaction' }, { status: 500 });
  }
}
