/**
 * Tax-Loss Harvesting Scanner API
 * 
 * Scans user's portfolio for harvesting opportunities and creates TaxAlphaEvents.
 * Only scans taxable accounts, requires cost basis, checks wash sale risks.
 * 
 * GET: Run scan and return opportunities (doesn't save)
 * POST: Run scan and save opportunities as TaxAlphaEvents
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { scanForHarvestOpportunities, Account, HarvestOpportunity } from '@/lib/tax-loss-scanner';
import { estimateTaxProfile } from '@/lib/tax-calculator';

/**
 * Transform database holdings to scanner format
 */
function transformToScannerFormat(user: any): Account[] {
  const accounts: Account[] = [];
  const profileData = user.profileData as any;
  
  if (!profileData) return accounts;
  
  // Process retirement accounts
  if (profileData.retirementAccounts) {
    for (const acc of profileData.retirementAccounts) {
      accounts.push({
        id: acc.id || `retirement_${acc.name}`,
        name: acc.name || 'Retirement Account',
        type: acc.type || 'retirement',
        custodian: acc.custodian,
        holdings: (acc.holdings || []).map((h: any) => ({
          ticker: h.ticker,
          name: h.name,
          shares: h.shares,
          currentValue: h.currentValue,
          costBasis: h.costBasis,
          purchaseDate: h.purchaseDate,
        })),
        balance: acc.balance,
      });
    }
  }
  
  // Process investment (taxable) accounts
  if (profileData.investmentAccounts) {
    for (const acc of profileData.investmentAccounts) {
      accounts.push({
        id: acc.id || `investment_${acc.name}`,
        name: acc.name || 'Investment Account',
        type: acc.type || 'brokerage', // Default to brokerage (taxable)
        custodian: acc.custodian,
        holdings: (acc.holdings || []).map((h: any) => ({
          ticker: h.ticker,
          name: h.name,
          shares: h.shares,
          currentValue: h.currentValue,
          costBasis: h.costBasis,
          purchaseDate: h.purchaseDate,
        })),
        balance: acc.balance,
      });
    }
  }
  
  return accounts;
}

/**
 * GET: Preview scan results without saving
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

    // Get tax profile
    const taxProfile = estimateTaxProfile(user.profileData);
    
    // Transform holdings to scanner format
    const accounts = transformToScannerFormat(user);
    
    if (accounts.length === 0) {
      return NextResponse.json({
        opportunities: [],
        summary: {
          totalHarvestable: 0,
          totalTaxSavings: 0,
          actionableCount: 0,
          blockedCount: 0,
          needsCostBasis: [],
        },
        warnings: ['No accounts found. Add your holdings to scan for opportunities.'],
        taxProfile: {
          income: taxProfile.income,
          filingStatus: taxProfile.filingStatus,
          state: taxProfile.state,
        },
      });
    }

    // Run scanner
    const result = scanForHarvestOpportunities(accounts, taxProfile);

    return NextResponse.json({
      ...result,
      taxProfile: {
        income: taxProfile.income,
        filingStatus: taxProfile.filingStatus,
        state: taxProfile.state,
      },
      accountsScanned: accounts.length,
      holdingsScanned: accounts.reduce((sum, a) => sum + (a.holdings?.length || 0), 0),
    });
  } catch (error) {
    console.error('Tax scan GET error:', error);
    return NextResponse.json({ error: 'Failed to scan for opportunities' }, { status: 500 });
  }
}

/**
 * POST: Run scan and save opportunities as TaxAlphaEvents
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

    // Get tax profile
    const taxProfile = estimateTaxProfile(user.profileData);
    
    // Transform holdings to scanner format
    const accounts = transformToScannerFormat(user);

    // Run scanner
    const result = scanForHarvestOpportunities(accounts, taxProfile);

    // Get existing potential events to avoid duplicates
    const existingEvents = await prisma.taxAlphaEvent.findMany({
      where: {
        userId: user.id,
        status: 'potential',
        type: 'LOSS_HARVEST',
      },
    });
    
    const existingTickers = new Set(existingEvents.map(e => e.ticker?.toUpperCase()));

    // Create new events for opportunities we haven't logged yet
    const newEvents: any[] = [];
    
    for (const opp of result.opportunities) {
      // Skip if we already have a potential event for this ticker
      if (existingTickers.has(opp.ticker.toUpperCase())) {
        continue;
      }
      
      // Create description
      let description = `Harvest $${opp.unrealizedLoss.toLocaleString()} loss in ${opp.ticker}`;
      if (opp.washSaleRisk !== 'none') {
        description += ' ⚠️';
      }
      
      // Determine expiration (year-end is the natural deadline)
      const yearEnd = new Date(new Date().getFullYear(), 11, 31);
      
      newEvents.push({
        userId: user.id,
        type: 'LOSS_HARVEST',
        status: 'potential',
        ticker: opp.ticker,
        description,
        amount: opp.unrealizedLoss,
        taxSaved: opp.taxSavings,
        federalRate: taxProfile.filingStatus === 'married_filing_jointly' 
          ? (taxProfile.income > 383900 ? 0.32 : 0.24) 
          : (taxProfile.income > 191950 ? 0.32 : 0.24),
        stateRate: 0.0575, // TODO: Use actual from tax calculator
        rateType: opp.holdingPeriod === 'long_term' ? 'long_term' : 'short_term',
        calculation: {
          holdingPeriod: opp.holdingPeriod,
          shares: opp.shares,
          costBasis: opp.costBasis,
          currentValue: opp.currentValue,
          effectiveRate: opp.effectiveRate,
          calculationBreakdown: opp.calculationBreakdown,
          washSaleRisk: opp.washSaleRisk,
          washSaleNote: opp.washSaleNote,
          identicalHoldings: opp.identicalHoldings,
          substitutes: opp.substitutes,
          accountName: opp.accountName,
          accountType: opp.accountType,
          isActionable: opp.isActionable,
          blockers: opp.blockers,
        },
        expiresAt: yearEnd,
        taxYear: new Date().getFullYear(),
      });
    }

    // Batch create new events
    if (newEvents.length > 0) {
      await prisma.taxAlphaEvent.createMany({
        data: newEvents,
      });
    }

    // Also expire any old potential events for tickers no longer at a loss
    const currentLossTickers = new Set(result.opportunities.map(o => o.ticker.toUpperCase()));
    const toExpire = existingEvents.filter(e => 
      e.ticker && !currentLossTickers.has(e.ticker.toUpperCase())
    );
    
    if (toExpire.length > 0) {
      await prisma.taxAlphaEvent.updateMany({
        where: {
          id: { in: toExpire.map(e => e.id) },
        },
        data: {
          status: 'expired',
        },
      });
    }

    return NextResponse.json({
      success: true,
      newEventsCreated: newEvents.length,
      eventsExpired: toExpire.length,
      summary: result.summary,
      warnings: result.warnings,
    });
  } catch (error) {
    console.error('Tax scan POST error:', error);
    return NextResponse.json({ error: 'Failed to save scan results' }, { status: 500 });
  }
}
