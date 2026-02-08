import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/db';

// GET - Load user profile
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        accounts: {
          include: {
            holdings: true,
          },
        },
      },
    });

    if (!user) {
      // Get email from Clerk
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses[0]?.emailAddress || '';
      const name = clerkUser?.firstName || '';

      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email,
          name,
        },
        include: {
          accounts: {
            include: {
              holdings: true,
            },
          },
        },
      });
    }

    // If we have profileData JSON, return it directly (with fresh account/holding data)
    if (user.profileData) {
      const profile = user.profileData as any;
      // Merge in fresh account/holding data from database
      const freshProfile = transformUserToProfile(user);
      return NextResponse.json({
        ...profile,
        ...freshProfile, // Override with fresh account data
        onboardingComplete: user.onboardingComplete,
      });
    }

    // Transform to frontend format
    const profile = transformUserToProfile(user);

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error loading profile:', error);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

// POST - Save user profile
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profileData = await request.json();
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress || '';

    // Upsert user with full profile data
    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        name: profileData.firstName,
        email,
        riskProfile: profileData.riskTolerance,
        onboardingComplete: true,
        profileData: profileData, // Store complete profile as JSON
      },
      create: {
        clerkId: userId,
        email,
        name: profileData.firstName,
        riskProfile: profileData.riskTolerance,
        onboardingComplete: true,
        profileData: profileData, // Store complete profile as JSON
      },
    });

    // Save accounts
    if (profileData.cashAccounts?.length) {
      for (const acc of profileData.cashAccounts) {
        await prisma.account.upsert({
          where: {
            plaidAccountId_userId: {
              plaidAccountId: `manual_cash_${acc.name}`,
              userId: user.id,
            },
          },
          update: {
            name: acc.name,
            currentBalance: acc.balance,
          },
          create: {
            userId: user.id,
            name: acc.name,
            type: 'depository',
            subtype: 'checking',
            currentBalance: acc.balance,
            isManual: true,
            accountGroup: 'cash',
            plaidAccountId: `manual_cash_${acc.name}`,
          },
        });
      }
    }

    if (profileData.retirementAccounts?.length) {
      for (const acc of profileData.retirementAccounts) {
        const account = await prisma.account.upsert({
          where: {
            plaidAccountId_userId: {
              plaidAccountId: `manual_retirement_${acc.name}`,
              userId: user.id,
            },
          },
          update: {
            name: acc.name,
            currentBalance: acc.balance,
            subtype: acc.type,
          },
          create: {
            userId: user.id,
            name: acc.name,
            type: 'investment',
            subtype: acc.type || '401k',
            currentBalance: acc.balance,
            isManual: true,
            accountGroup: 'retirement',
            plaidAccountId: `manual_retirement_${acc.name}`,
          },
        });

        // Save holdings - delete existing and recreate
        if (acc.holdings?.length) {
          // Delete existing holdings for this account
          await prisma.holding.deleteMany({
            where: { accountId: account.id }
          });
          
          // Create new holdings
          for (const h of acc.holdings) {
            await prisma.holding.create({
              data: {
                userId: user.id,
                accountId: account.id,
                symbol: h.ticker,
                name: h.name,
                quantity: h.shares || 0,
                costBasis: h.costBasis || 0,
                currentPrice: h.currentPrice || 0,
                currentValue: h.currentValue || 0,
              },
            });
          }
        }
      }
    }

    if (profileData.investmentAccounts?.length) {
      for (const acc of profileData.investmentAccounts) {
        const account = await prisma.account.upsert({
          where: {
            plaidAccountId_userId: {
              plaidAccountId: `manual_investment_${acc.name}`,
              userId: user.id,
            },
          },
          update: {
            name: acc.name,
            currentBalance: acc.balance,
          },
          create: {
            userId: user.id,
            name: acc.name,
            type: 'investment',
            subtype: 'brokerage',
            currentBalance: acc.balance,
            isManual: true,
            accountGroup: 'taxable',
            plaidAccountId: `manual_investment_${acc.name}`,
          },
        });

        // Save holdings - delete existing and recreate
        if (acc.holdings?.length) {
          // Delete existing holdings for this account
          await prisma.holding.deleteMany({
            where: { accountId: account.id }
          });
          
          // Create new holdings
          for (const h of acc.holdings) {
            await prisma.holding.create({
              data: {
                userId: user.id,
                accountId: account.id,
                symbol: h.ticker,
                name: h.name,
                quantity: h.shares || 0,
                costBasis: h.costBasis || 0,
                currentPrice: h.currentPrice || 0,
                currentValue: h.currentValue || 0,
              },
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error('Error saving profile:', error);
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}

// Helper to transform DB user to frontend profile format
function transformUserToProfile(user: any) {
  const cashAccounts = user.accounts
    ?.filter((a: any) => a.accountGroup === 'cash')
    .map((a: any) => ({
      name: a.name,
      balance: Number(a.currentBalance) || 0,
    })) || [];

  const retirementAccounts = user.accounts
    ?.filter((a: any) => a.accountGroup === 'retirement')
    .map((a: any) => ({
      name: a.name,
      type: a.subtype,
      balance: Number(a.currentBalance) || 0,
      holdings: a.holdings?.map((h: any) => ({
        ticker: h.symbol,
        name: h.name,
        shares: Number(h.quantity) || 0,
        costBasis: Number(h.costBasis) || 0,
        currentPrice: Number(h.currentPrice) || 0,
        currentValue: Number(h.currentValue) || 0,
      })) || [],
    })) || [];

  const investmentAccounts = user.accounts
    ?.filter((a: any) => a.accountGroup === 'taxable')
    .map((a: any) => ({
      name: a.name,
      balance: Number(a.currentBalance) || 0,
      holdings: a.holdings?.map((h: any) => ({
        ticker: h.symbol,
        name: h.name,
        shares: Number(h.quantity) || 0,
        costBasis: Number(h.costBasis) || 0,
        currentPrice: Number(h.currentPrice) || 0,
        currentValue: Number(h.currentValue) || 0,
      })) || [],
    })) || [];

  return {
    firstName: user.name || '',
    email: user.email || '',
    riskTolerance: user.riskProfile || '',
    onboardingComplete: user.onboardingComplete,
    cashAccounts,
    retirementAccounts,
    investmentAccounts,
  };
}
