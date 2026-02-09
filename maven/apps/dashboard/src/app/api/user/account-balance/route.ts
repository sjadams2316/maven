import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/db';

/**
 * Update Account Balance API
 * POST /api/user/account-balance
 * 
 * Updates the balance of a cash/investment account
 * Used by Oracle when user says things like "my checking is now $X"
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
    const { accountType, accountName, institution, newBalance, adjustment, note } = body;
    
    if (!accountType) {
      return NextResponse.json({ error: 'accountType is required' }, { status: 400 });
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
    
    // Map account types to profile keys
    const accountTypeMap: Record<string, { key: string; balanceKey: string; nameKey?: string; institutionKey?: string }> = {
      checking: { key: 'cashAccounts', balanceKey: 'checkingBalance', nameKey: 'checkingAccountName', institutionKey: 'checkingInstitution' },
      savings: { key: 'cashAccounts', balanceKey: 'savingsBalance', nameKey: 'savingsAccountName', institutionKey: 'savingsInstitution' },
      money_market: { key: 'cashAccounts', balanceKey: 'mmBalance', nameKey: 'mmAccountName', institutionKey: 'mmInstitution' },
    };
    
    const mapping = accountTypeMap[accountType.toLowerCase()];
    
    let previousBalance = 0;
    let finalBalance = 0;
    let updatedAccount: any = null;
    
    if (mapping) {
      // Direct balance update in profile
      previousBalance = profileData[mapping.balanceKey] || 0;
      
      if (newBalance !== undefined) {
        finalBalance = newBalance;
      } else if (adjustment !== undefined) {
        finalBalance = previousBalance + adjustment;
      } else {
        return NextResponse.json({ error: 'Either newBalance or adjustment is required' }, { status: 400 });
      }
      
      // Update profile data
      profileData[mapping.balanceKey] = finalBalance;
      if (accountName && mapping.nameKey) {
        profileData[mapping.nameKey] = accountName;
      }
      if (institution && mapping.institutionKey) {
        profileData[mapping.institutionKey] = institution;
      }
      profileData.lastUpdated = new Date().toISOString();
      
      await prisma.user.update({
        where: { id: user.id },
        data: { profileData },
      });
      
      updatedAccount = {
        type: accountType,
        name: accountName || mapping.nameKey,
        balance: finalBalance,
      };
      
    } else {
      // Try to find account by name in database
      const account = await prisma.account.findFirst({
        where: {
          userId: user.id,
          OR: [
            { name: { contains: accountName || '', mode: 'insensitive' } },
            { subtype: { contains: accountType, mode: 'insensitive' } },
          ],
        },
      });
      
      if (account) {
        previousBalance = Number(account.currentBalance) || 0;
        
        if (newBalance !== undefined) {
          finalBalance = newBalance;
        } else if (adjustment !== undefined) {
          finalBalance = previousBalance + adjustment;
        } else {
          return NextResponse.json({ error: 'Either newBalance or adjustment is required' }, { status: 400 });
        }
        
        await prisma.account.update({
          where: { id: account.id },
          data: { currentBalance: finalBalance },
        });
        
        updatedAccount = {
          id: account.id,
          type: account.type,
          name: account.name,
          balance: finalBalance,
        };
      } else {
        return NextResponse.json({ 
          error: `Could not find account of type "${accountType}"${accountName ? ` named "${accountName}"` : ''}`,
          suggestion: 'Please specify the account name or update your profile with this account first.'
        }, { status: 404 });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Updated ${updatedAccount.name || accountType} balance from $${previousBalance.toLocaleString()} to $${finalBalance.toLocaleString()}`,
      account: updatedAccount,
      previousBalance,
      newBalance: finalBalance,
      change: finalBalance - previousBalance,
      note,
    });
    
  } catch (error) {
    console.error('Account balance update error:', error);
    return NextResponse.json({ error: 'Failed to update account balance' }, { status: 500 });
  }
}
