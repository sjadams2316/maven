import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/db';

/**
 * Transfer Funds API
 * POST /api/user/transfer
 * 
 * Records a transfer between accounts and optionally a purchase
 * Used by Oracle when user says "I moved $X from checking to brokerage and bought CIFR"
 */

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    
    // Also check header for API calls from chat
    const headerClerkId = request.headers.get('x-clerk-user-id');
    const effectiveClerkId = clerkId || headerClerkId;
    
    if (!effectiveClerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { fromAccount, toAccount, amount, purchaseTicker, purchaseShares } = body;
    
    if (!fromAccount || !toAccount || !amount) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        required: ['fromAccount', 'toAccount', 'amount']
      }, { status: 400 });
    }
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { clerkId: effectiveClerkId },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Get current profile data
    const profileData = (user.profileData as any) || {};
    
    // Account type mapping
    const accountMap: Record<string, string> = {
      checking: 'checkingBalance',
      savings: 'savingsBalance',
      'money market': 'mmBalance',
      mm: 'mmBalance',
      brokerage: 'brokerageBalance',
    };
    
    // Normalize account names
    const normalizeAccountName = (name: string): string => {
      return name.toLowerCase().trim();
    };
    
    const fromNorm = normalizeAccountName(fromAccount);
    const toNorm = normalizeAccountName(toAccount);
    
    let fromBalanceKey = accountMap[fromNorm];
    let toBalanceKey = accountMap[toNorm];
    
    // Try partial matching if exact match fails
    if (!fromBalanceKey) {
      for (const [key, value] of Object.entries(accountMap)) {
        if (fromNorm.includes(key) || key.includes(fromNorm)) {
          fromBalanceKey = value;
          break;
        }
      }
    }
    if (!toBalanceKey) {
      for (const [key, value] of Object.entries(accountMap)) {
        if (toNorm.includes(key) || key.includes(toNorm)) {
          toBalanceKey = value;
          break;
        }
      }
    }
    
    let fromBalance = 0;
    let toBalance = 0;
    let fromUpdated = false;
    let toUpdated = false;
    
    // Update FROM account
    if (fromBalanceKey && profileData[fromBalanceKey] !== undefined) {
      fromBalance = profileData[fromBalanceKey] - amount;
      profileData[fromBalanceKey] = Math.max(0, fromBalance); // Don't go negative
      fromUpdated = true;
    }
    
    // Update TO account
    if (toBalanceKey && profileData[toBalanceKey] !== undefined) {
      toBalance = (profileData[toBalanceKey] || 0) + amount;
      profileData[toBalanceKey] = toBalance;
      toUpdated = true;
    }
    
    // If purchase was made, add to holdings
    let purchaseResult = null;
    if (purchaseTicker && toBalanceKey === 'brokerageBalance') {
      // Add holding to brokerage
      const brokerageHoldings = profileData.brokerageHoldings || [];
      
      // Check if holding already exists
      const existingIndex = brokerageHoldings.findIndex(
        (h: any) => h.ticker?.toUpperCase() === purchaseTicker.toUpperCase()
      );
      
      if (existingIndex >= 0) {
        // Update existing holding
        brokerageHoldings[existingIndex].shares = (brokerageHoldings[existingIndex].shares || 0) + (purchaseShares || 0);
        brokerageHoldings[existingIndex].currentValue = (brokerageHoldings[existingIndex].currentValue || 0) + amount;
        purchaseResult = brokerageHoldings[existingIndex];
      } else {
        // Add new holding
        const newHolding = {
          ticker: purchaseTicker.toUpperCase(),
          name: purchaseTicker.toUpperCase(),
          shares: purchaseShares || 0,
          costBasis: amount,
          currentPrice: purchaseShares ? amount / purchaseShares : 0,
          currentValue: amount,
        };
        brokerageHoldings.push(newHolding);
        profileData.brokerageHoldings = brokerageHoldings;
        purchaseResult = newHolding;
      }
    }
    
    // Save updates
    profileData.lastUpdated = new Date().toISOString();
    
    await prisma.user.update({
      where: { id: user.id },
      data: { profileData },
    });
    
    // Build response
    const response: any = {
      success: true,
      transfer: {
        from: fromAccount,
        to: toAccount,
        amount,
      },
    };
    
    if (fromUpdated) {
      response.fromBalance = profileData[fromBalanceKey!];
    } else {
      response.fromNote = `Could not find "${fromAccount}" in profile. You may need to update this account manually.`;
    }
    
    if (toUpdated) {
      response.toBalance = profileData[toBalanceKey!];
    } else {
      response.toNote = `Could not find "${toAccount}" in profile. You may need to update this account manually.`;
    }
    
    if (purchaseResult) {
      response.purchase = {
        ticker: purchaseTicker,
        shares: purchaseShares,
        amount,
        holding: purchaseResult,
      };
    }
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Transfer error:', error);
    return NextResponse.json({ error: 'Failed to record transfer' }, { status: 500 });
  }
}
