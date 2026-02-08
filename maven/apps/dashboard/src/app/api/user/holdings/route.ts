import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

/**
 * Helper to get clerkId from auth or internal header
 */
async function getClerkId(request: NextRequest): Promise<string | null> {
  // First try Clerk auth
  try {
    const authResult = await auth();
    if (authResult.userId) return authResult.userId;
  } catch {
    // Ignore auth errors
  }
  
  // Fall back to internal header (from chat API tool calls)
  const internalClerkId = request.headers.get('x-clerk-user-id');
  if (internalClerkId) return internalClerkId;
  
  return null;
}

/**
 * GET /api/user/holdings
 * Fetch all holdings for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const clerkId = await getClerkId(request);
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        holdings: {
          include: {
            account: true,
            security: true
          },
          orderBy: { currentValue: 'desc' }
        },
        accounts: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      holdings: user.holdings,
      accounts: user.accounts
    });
  } catch (error) {
    console.error('Error fetching holdings:', error);
    return NextResponse.json({ error: 'Failed to fetch holdings' }, { status: 500 });
  }
}

/**
 * POST /api/user/holdings
 * Add a new holding (called by Oracle or manual input)
 */
export async function POST(request: NextRequest) {
  try {
    const clerkId = await getClerkId(request);
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized - please sign in to save holdings' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      symbol,
      name,
      quantity,
      value, // Can pass value OR quantity
      costBasis,
      accountId, // Required - which account to add to
      accountName, // Alternative - find/create account by name
      accountType, // For creating new account: 'brokerage', '401k', 'ira', 'roth_ira', etc.
      custodian // For creating new account: 'Schwab', 'Fidelity', etc.
    } = body;

    if (!symbol) {
      return NextResponse.json({ 
        error: 'Symbol required',
        needsInfo: ['symbol']
      }, { status: 400 });
    }

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { clerkId },
      include: { accounts: true }
    });

    if (!user) {
      // Create user if doesn't exist
      user = await prisma.user.create({
        data: {
          clerkId,
          email: `${clerkId}@temp.maven`, // Will be updated via Clerk webhook
        },
        include: { accounts: true }
      });
    }

    // Find or create account
    let account;
    
    if (accountId) {
      account = user.accounts.find(a => a.id === accountId);
      if (!account) {
        return NextResponse.json({ 
          error: 'Account not found',
          availableAccounts: user.accounts.map(a => ({ id: a.id, name: a.name, type: a.subtype }))
        }, { status: 400 });
      }
    } else if (accountName) {
      // Find by name (fuzzy match)
      account = user.accounts.find(a => 
        a.name.toLowerCase().includes(accountName.toLowerCase()) ||
        accountName.toLowerCase().includes(a.name.toLowerCase())
      );
      
      if (!account && accountType && custodian) {
        // Create new account
        account = await prisma.account.create({
          data: {
            userId: user.id,
            name: `${custodian} ${accountType.toUpperCase()}`,
            type: accountType.includes('401k') || accountType.includes('ira') ? 'investment' : 'investment',
            subtype: accountType,
            isManual: true,
            accountGroup: getAccountGroup(accountType)
          }
        });
      } else if (!account) {
        // Need more info to create account
        return NextResponse.json({
          error: 'Account not found. Need more info to create.',
          needsInfo: ['accountType', 'custodian'],
          availableAccounts: user.accounts.map(a => ({ id: a.id, name: a.name, type: a.subtype })),
          suggestion: user.accounts.length === 0 
            ? 'What type of account is this in? (brokerage, 401k, IRA, Roth IRA, etc.) And who is the custodian? (Schwab, Fidelity, Vanguard, etc.)'
            : `Which account should I add this to? ${user.accounts.map(a => a.name).join(', ')} - or is this a new account?`
        }, { status: 400 });
      }
    } else {
      // No account specified - need to ask
      if (user.accounts.length === 0) {
        // No accounts exist - need to create one
        if (!accountType || !custodian) {
          return NextResponse.json({
            error: 'No account specified and you have no accounts yet.',
            needsInfo: ['accountType', 'custodian'],
            suggestion: 'What type of account is this in? (brokerage, 401k, IRA, Roth IRA, etc.) And who is the custodian? (Schwab, Fidelity, Vanguard, etc.)'
          }, { status: 400 });
        }
        // Create the account
        account = await prisma.account.create({
          data: {
            userId: user.id,
            name: `${custodian} ${accountType.toUpperCase()}`,
            type: 'investment',
            subtype: accountType,
            isManual: true,
            accountGroup: getAccountGroup(accountType)
          }
        });
      } else if (user.accounts.length === 1) {
        // Only one account - use it
        account = user.accounts[0];
      } else {
        // Multiple accounts - need to ask which one
        return NextResponse.json({
          error: 'Multiple accounts found. Which one?',
          needsInfo: ['accountName'],
          availableAccounts: user.accounts.map(a => ({ id: a.id, name: a.name, type: a.subtype })),
          suggestion: `Which account should I add ${symbol} to? ${user.accounts.map(a => a.name).join(', ')}`
        }, { status: 400 });
      }
    }

    // Calculate quantity from value if needed
    let finalQuantity = quantity;
    let currentPrice = body.currentPrice;
    
    if (!finalQuantity && value) {
      // Try to get current price to calculate quantity
      try {
        const priceRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/stock-quote?symbol=${symbol}`);
        if (priceRes.ok) {
          const priceData = await priceRes.json();
          currentPrice = priceData.price;
          finalQuantity = value / currentPrice;
        } else {
          // Can't get price - store as 1 share at the value
          finalQuantity = 1;
          currentPrice = value;
        }
      } catch {
        finalQuantity = 1;
        currentPrice = value;
      }
    }

    // Check if holding already exists for this symbol in this account
    const existingHolding = await prisma.holding.findFirst({
      where: {
        accountId: account!.id,
        symbol: symbol.toUpperCase()
      }
    });

    let holding;
    
    if (existingHolding) {
      // Update existing holding
      holding = await prisma.holding.update({
        where: { id: existingHolding.id },
        data: {
          quantity: finalQuantity || existingHolding.quantity,
          costBasis: costBasis || existingHolding.costBasis,
          currentPrice: currentPrice || existingHolding.currentPrice,
          currentValue: value || (finalQuantity && currentPrice ? finalQuantity * currentPrice : existingHolding.currentValue),
          name: name || existingHolding.name,
          updatedAt: new Date()
        },
        include: { account: true }
      });
    } else {
      // Create new holding
      holding = await prisma.holding.create({
        data: {
          userId: user.id,
          accountId: account!.id,
          symbol: symbol.toUpperCase(),
          name: name || symbol.toUpperCase(),
          quantity: finalQuantity || 0,
          costBasis: costBasis,
          currentPrice: currentPrice,
          currentValue: value || (finalQuantity && currentPrice ? finalQuantity * currentPrice : undefined)
        },
        include: { account: true }
      });
    }

    return NextResponse.json({
      success: true,
      holding,
      action: existingHolding ? 'updated' : 'created',
      message: existingHolding 
        ? `Updated ${symbol} in ${account!.name} to ${formatCurrency(value || holding.currentValue)}`
        : `Added ${formatCurrency(value || holding.currentValue)} of ${symbol} to ${account!.name}`
    });
  } catch (error) {
    console.error('Error adding holding:', error);
    return NextResponse.json({ error: 'Failed to add holding' }, { status: 500 });
  }
}

/**
 * PUT /api/user/holdings
 * Update an existing holding
 */
export async function PUT(request: NextRequest) {
  try {
    const clerkId = await getClerkId(request);
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized - please sign in to update holdings' }, { status: 401 });
    }

    const body = await request.json();
    const { holdingId, symbol, accountId, quantity, value, costBasis, name } = body;

    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { holdings: { include: { account: true } } }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the holding to update
    let holding;
    
    if (holdingId) {
      holding = user.holdings.find(h => h.id === holdingId);
    } else if (symbol && accountId) {
      holding = user.holdings.find(h => 
        h.symbol?.toUpperCase() === symbol.toUpperCase() && 
        h.accountId === accountId
      );
    } else if (symbol) {
      // Find by symbol (if only one exists)
      const matches = user.holdings.filter(h => h.symbol?.toUpperCase() === symbol.toUpperCase());
      if (matches.length === 1) {
        holding = matches[0];
      } else if (matches.length > 1) {
        return NextResponse.json({
          error: `Multiple ${symbol} holdings found. Which account?`,
          needsInfo: ['accountName'],
          matches: matches.map(h => ({ 
            id: h.id, 
            account: h.account.name, 
            value: h.currentValue 
          }))
        }, { status: 400 });
      }
    }

    if (!holding) {
      return NextResponse.json({ 
        error: 'Holding not found',
        suggestion: `I couldn't find ${symbol || 'that holding'}. Want me to add it instead?`
      }, { status: 404 });
    }

    // Calculate new values
    let newQuantity = quantity;
    let newPrice = holding.currentPrice;
    
    if (!newQuantity && value && holding.currentPrice) {
      newQuantity = value / Number(holding.currentPrice);
    }

    const updatedHolding = await prisma.holding.update({
      where: { id: holding.id },
      data: {
        quantity: newQuantity ?? holding.quantity,
        currentValue: value ?? (newQuantity && newPrice ? newQuantity * Number(newPrice) : holding.currentValue),
        costBasis: costBasis ?? holding.costBasis,
        name: name ?? holding.name,
        updatedAt: new Date()
      },
      include: { account: true }
    });

    return NextResponse.json({
      success: true,
      holding: updatedHolding,
      message: `Updated ${updatedHolding.symbol} in ${updatedHolding.account.name} to ${formatCurrency(updatedHolding.currentValue)}`
    });
  } catch (error) {
    console.error('Error updating holding:', error);
    return NextResponse.json({ error: 'Failed to update holding' }, { status: 500 });
  }
}

/**
 * DELETE /api/user/holdings
 * Remove a holding
 */
export async function DELETE(request: NextRequest) {
  try {
    const clerkId = await getClerkId(request);
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized - please sign in to remove holdings' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const holdingId = searchParams.get('holdingId');
    const symbol = searchParams.get('symbol');
    const accountId = searchParams.get('accountId');

    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { holdings: { include: { account: true } } }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the holding to delete
    let holding;
    
    if (holdingId) {
      holding = user.holdings.find(h => h.id === holdingId);
    } else if (symbol && accountId) {
      holding = user.holdings.find(h => 
        h.symbol?.toUpperCase() === symbol.toUpperCase() && 
        h.accountId === accountId
      );
    } else if (symbol) {
      const matches = user.holdings.filter(h => h.symbol?.toUpperCase() === symbol.toUpperCase());
      if (matches.length === 1) {
        holding = matches[0];
      } else if (matches.length > 1) {
        return NextResponse.json({
          error: `Multiple ${symbol} holdings found. Which account?`,
          needsInfo: ['accountName'],
          matches: matches.map(h => ({ id: h.id, account: h.account.name, value: h.currentValue }))
        }, { status: 400 });
      }
    }

    if (!holding) {
      return NextResponse.json({ error: 'Holding not found' }, { status: 404 });
    }

    await prisma.holding.delete({
      where: { id: holding.id }
    });

    return NextResponse.json({
      success: true,
      message: `Removed ${holding.symbol} from ${holding.account.name}`
    });
  } catch (error) {
    console.error('Error deleting holding:', error);
    return NextResponse.json({ error: 'Failed to delete holding' }, { status: 500 });
  }
}

// Helper functions

function getAccountGroup(accountType: string): string {
  const type = accountType.toLowerCase();
  if (type.includes('401k') || type.includes('403b') || type.includes('ira') || type.includes('pension')) {
    return 'retirement';
  }
  if (type.includes('brokerage') || type.includes('taxable')) {
    return 'taxable';
  }
  if (type.includes('checking') || type.includes('savings') || type.includes('money market')) {
    return 'cash';
  }
  if (type.includes('crypto')) {
    return 'crypto';
  }
  return 'taxable';
}

function formatCurrency(value: any): string {
  if (!value) return '$0';
  const num = typeof value === 'object' ? Number(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
}
