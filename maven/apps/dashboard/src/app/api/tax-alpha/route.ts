/**
 * Tax Alpha API
 * 
 * Tracks every dollar Maven saves users through tax optimization.
 * 
 * ITERATION NOTES:
 * v1: Basic CRUD for events
 * v1.1: Added summary calculation
 * v1.2: Added opportunity scanning
 * v1.3: Full transparency - returns calculation breakdown
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { calculateTaxSavings, estimateTaxProfile, GainType } from '@/lib/tax-calculator';

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        taxAlphaEvents: {
          orderBy: { identifiedAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate summary
    const events = user.taxAlphaEvents;
    const realized = events.filter(e => e.status === 'realized');
    const potential = events.filter(e => e.status === 'potential');

    const summary = {
      // Realized (actually executed)
      realizedTotal: realized.reduce((sum, e) => sum + Number(e.taxSaved), 0),
      realizedCount: realized.length,
      
      // Potential (identified, not yet executed)
      potentialTotal: potential.reduce((sum, e) => sum + Number(e.taxSaved), 0),
      potentialCount: potential.length,
      
      // Combined
      totalIdentified: events.reduce((sum, e) => sum + Number(e.taxSaved), 0),
      
      // Breakdown by type
      byType: {
        LOSS_HARVEST: events.filter(e => e.type === 'LOSS_HARVEST').reduce((sum, e) => sum + Number(e.taxSaved), 0),
        ROTH_CONVERSION: events.filter(e => e.type === 'ROTH_CONVERSION').reduce((sum, e) => sum + Number(e.taxSaved), 0),
        ASSET_LOCATION: events.filter(e => e.type === 'ASSET_LOCATION').reduce((sum, e) => sum + Number(e.taxSaved), 0),
        GAIN_DEFERRAL: events.filter(e => e.type === 'GAIN_DEFERRAL').reduce((sum, e) => sum + Number(e.taxSaved), 0),
        WASH_SALE_AVOIDED: events.filter(e => e.type === 'WASH_SALE_AVOIDED').reduce((sum, e) => sum + Number(e.taxSaved), 0),
      },
    };

    return NextResponse.json({
      summary,
      events: events.map(e => ({
        id: e.id,
        type: e.type,
        status: e.status,
        ticker: e.ticker,
        description: e.description,
        amount: Number(e.amount),
        taxSaved: Number(e.taxSaved),
        federalRate: Number(e.federalRate),
        stateRate: Number(e.stateRate),
        rateType: e.rateType,
        calculation: e.calculation,
        identifiedAt: e.identifiedAt,
        expiresAt: e.expiresAt,
        realizedAt: e.realizedAt,
      })),
    });
  } catch (error) {
    console.error('Tax alpha GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch tax alpha data' }, { status: 500 });
  }
}

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
    const { type, ticker, accountId, description, amount, gainType = 'short_term' } = body;

    if (!type || !description || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: type, description, amount' },
        { status: 400 }
      );
    }

    // Calculate tax savings
    const taxProfile = estimateTaxProfile(user.profileData);
    const taxCalc = calculateTaxSavings(amount, gainType as GainType, taxProfile);

    // Create the event
    const event = await prisma.taxAlphaEvent.create({
      data: {
        userId: user.id,
        type,
        ticker,
        accountId,
        description,
        amount,
        taxSaved: taxCalc.taxSaved,
        federalRate: taxCalc.federalRate,
        stateRate: taxCalc.stateRate,
        rateType: gainType,
        calculation: taxCalc.breakdown,
        taxYear: new Date().getFullYear(),
      },
    });

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        type: event.type,
        status: event.status,
        ticker: event.ticker,
        description: event.description,
        amount: Number(event.amount),
        taxSaved: Number(event.taxSaved),
        calculation: event.calculation,
        identifiedAt: event.identifiedAt,
      },
      taxSaved: taxCalc.taxSaved,
      calculationBreakdown: taxCalc.breakdown.calculation,
    });
  } catch (error) {
    console.error('Tax alpha POST error:', error);
    return NextResponse.json({ error: 'Failed to create tax alpha event' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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
    const { eventId, status } = body;

    if (!eventId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: eventId, status' },
        { status: 400 }
      );
    }

    // Verify the event belongs to this user
    const existingEvent = await prisma.taxAlphaEvent.findFirst({
      where: {
        id: eventId,
        userId: user.id,
      },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Update the event
    const event = await prisma.taxAlphaEvent.update({
      where: { id: eventId },
      data: {
        status,
        realizedAt: status === 'realized' ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        status: event.status,
        realizedAt: event.realizedAt,
      },
    });
  } catch (error) {
    console.error('Tax alpha PUT error:', error);
    return NextResponse.json({ error: 'Failed to update tax alpha event' }, { status: 500 });
  }
}
