/**
 * Transactions API
 * 
 * Records investment transactions (buy/sell) and auto-manages tax lots.
 * Also checks for wash sale violations on sells.
 * 
 * GET: List transactions with filters
 * POST: Record a new transaction (auto-creates tax lot for buys)
 * 
 * This is the foundation for:
 * - Per-lot cost basis tracking
 * - Wash sale detection
 * - Accurate gain/loss calculation
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { checkWashSale, previewWashSaleImpact, Transaction as WashTransaction } from '@/lib/wash-sale-tracker';
import { calculateSaleResult, TaxLot as LotManagerTaxLot } from '@/lib/lot-manager';

/**
 * GET: List transactions with optional filters
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const accountId = searchParams.get('accountId');
    const type = searchParams.get('type');  // buy, sell
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build filter
    const where: any = { userId: user.id };
    if (symbol) where.symbol = symbol.toUpperCase();
    if (accountId) where.accountId = accountId;
    if (type) where.type = type;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        take: limit,
        skip: offset,
        include: {
          account: {
            select: { name: true, type: true, subtype: true },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({
      transactions: transactions.map(t => ({
        id: t.id,
        date: t.date,
        type: t.type,
        symbol: t.symbol,
        name: t.name,
        quantity: t.quantity ? Number(t.quantity) : null,
        price: t.price ? Number(t.price) : null,
        amount: Number(t.amount),
        fees: t.fees ? Number(t.fees) : null,
        accountId: t.accountId,
        accountName: t.account.name,
        accountType: t.account.subtype || t.account.type,
      })),
      total,
      hasMore: offset + transactions.length < total,
    });
  } catch (error) {
    console.error('Transactions GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

/**
 * POST: Record a new transaction
 * 
 * For BUY: Creates a new tax lot
 * For SELL: Disposes from existing lots (FIFO default), checks wash sales
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
      date,
      type,  // 'buy' or 'sell'
      symbol,
      quantity,
      price,
      fees = 0,
      costBasisMethod = 'fifo',  // For sells
      specificLotIds,  // For specific identification
    } = body;

    // Validation
    if (!accountId || !date || !type || !symbol || !quantity || !price) {
      return NextResponse.json(
        { error: 'Missing required fields: accountId, date, type, symbol, quantity, price' },
        { status: 400 }
      );
    }

    if (!['buy', 'sell'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be "buy" or "sell"' },
        { status: 400 }
      );
    }

    // Verify account belongs to user
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: user.id },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const transactionDate = new Date(date);
    const totalAmount = quantity * price + fees;

    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId,
        date: transactionDate,
        type,
        symbol: symbol.toUpperCase(),
        name: `${type.toUpperCase()} ${symbol.toUpperCase()}`,
        quantity: type === 'buy' ? quantity : -quantity,
        price,
        amount: type === 'buy' ? totalAmount : totalAmount,
        fees,
        category: ['Investment', type === 'buy' ? 'Purchase' : 'Sale'],
      },
    });

    let result: any = {
      success: true,
      transaction: {
        id: transaction.id,
        date: transaction.date,
        type: transaction.type,
        symbol: transaction.symbol,
        quantity: Number(transaction.quantity),
        price: Number(transaction.price),
        amount: Number(transaction.amount),
      },
    };

    if (type === 'buy') {
      // Create a new tax lot
      const taxLot = await prisma.taxLot.create({
        data: {
          userId: user.id,
          accountId,
          symbol: symbol.toUpperCase(),
          quantity,
          remainingQuantity: quantity,
          costBasis: totalAmount,
          acquisitionDate: transactionDate,
          acquisitionType: 'purchase',
          isCovered: true,
        },
      });

      result.taxLot = {
        id: taxLot.id,
        symbol: taxLot.symbol,
        quantity: Number(taxLot.quantity),
        costBasisPerShare: totalAmount / quantity,
        acquisitionDate: taxLot.acquisitionDate,
      };
      result.message = `Recorded purchase of ${quantity} ${symbol} and created tax lot.`;

      // Check if this purchase triggers wash sale on recent sales
      const recentSales = await prisma.transaction.findMany({
        where: {
          userId: user.id,
          type: 'sell',
          symbol: symbol.toUpperCase(),
          date: {
            gte: new Date(transactionDate.getTime() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      });

      if (recentSales.length > 0) {
        result.washSaleWarning = {
          triggered: true,
          message: `⚠️ This purchase may trigger wash sale rules on your recent sale(s) of ${symbol} within the last 30 days. Any losses from those sales may be disallowed.`,
          affectedSalesCount: recentSales.length,
        };
      }

    } else {
      // SELL: Dispose from existing lots
      
      // Get all lots for this symbol in this account
      const existingLots = await prisma.taxLot.findMany({
        where: {
          userId: user.id,
          accountId,
          symbol: symbol.toUpperCase(),
          remainingQuantity: { gt: 0 },
        },
        orderBy: { acquisitionDate: 'asc' },  // FIFO default
      });

      if (existingLots.length === 0) {
        // No lots to dispose from - still record the sale but warn
        result.warning = `No tax lots found for ${symbol} in this account. Sale recorded but cost basis unknown.`;
        result.message = `Recorded sale of ${quantity} ${symbol}. Cost basis tracking unavailable.`;
        return NextResponse.json(result);
      }

      // Convert to lot manager format
      const lots: LotManagerTaxLot[] = existingLots.map(l => ({
        id: l.id,
        accountId: l.accountId,
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

      // Get all transactions for wash sale checking
      const allTransactions = await prisma.transaction.findMany({
        where: {
          userId: user.id,
          symbol: symbol.toUpperCase(),
          date: {
            gte: new Date(transactionDate.getTime() - 61 * 24 * 60 * 60 * 1000),
            lte: new Date(transactionDate.getTime() + 30 * 24 * 60 * 60 * 1000),
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

      // Calculate sale result with lot dispositions
      const saleResult = calculateSaleResult(
        lots,
        quantity,
        price,
        transactionDate,
        costBasisMethod as any,
        specificLotIds,
        washTransactions
      );

      // Record dispositions and update lot quantities
      for (const disposition of saleResult.dispositions) {
        // Create disposition record
        await prisma.disposition.create({
          data: {
            taxLotId: disposition.lotId,
            quantity: disposition.quantity,
            proceeds: disposition.proceeds,
            saleDate: transactionDate,
            gainLoss: disposition.gainLoss,
            isShortTerm: disposition.isShortTerm,
            washSaleDisallowed: disposition.washSaleDisallowed,
          },
        });

        // Update lot remaining quantity
        const lot = existingLots.find(l => l.id === disposition.lotId);
        if (lot) {
          const newRemaining = Number(lot.remainingQuantity) - disposition.quantity;
          await prisma.taxLot.update({
            where: { id: lot.id },
            data: { remainingQuantity: newRemaining },
          });
        }
      }

      result.saleDetails = {
        dispositions: saleResult.dispositions.map(d => ({
          lotId: d.lotId,
          quantity: d.quantity,
          costBasis: d.costBasis,
          proceeds: d.proceeds,
          gainLoss: d.gainLoss,
          isShortTerm: d.isShortTerm,
          washSaleDisallowed: d.washSaleDisallowed,
        })),
        summary: {
          totalProceeds: saleResult.totalProceeds,
          totalCostBasis: saleResult.totalCostBasis,
          grossGainLoss: saleResult.totalGainLoss,
          shortTermGainLoss: saleResult.shortTermGainLoss,
          longTermGainLoss: saleResult.longTermGainLoss,
          washSaleDisallowed: saleResult.washSaleDisallowed,
          netGainLoss: saleResult.netGainLoss,
        },
      };

      if (saleResult.washSaleDisallowed > 0) {
        result.washSaleWarning = {
          triggered: true,
          disallowedAmount: saleResult.washSaleDisallowed,
          message: `⚠️ Wash sale detected! $${saleResult.washSaleDisallowed.toFixed(2)} of your loss is disallowed due to purchases within 30 days.`,
        };
      }

      result.message = `Recorded sale of ${quantity} ${symbol}. ${saleResult.netGainLoss >= 0 ? 'Gain' : 'Loss'}: $${Math.abs(saleResult.netGainLoss).toFixed(2)}`;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Transactions POST error:', error);
    return NextResponse.json({ error: 'Failed to record transaction' }, { status: 500 });
  }
}
