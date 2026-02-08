import { NextRequest, NextResponse } from 'next/server';

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';

const PLAID_BASE_URL = PLAID_ENV === 'production' 
  ? 'https://production.plaid.com'
  : PLAID_ENV === 'development'
    ? 'https://development.plaid.com'
    : 'https://sandbox.plaid.com';

// Try to get user ID from Clerk if available
async function getUserId(): Promise<string | null> {
  try {
    const { auth } = await import('@clerk/nextjs/server');
    const { userId } = await auth();
    return userId;
  } catch {
    // Clerk not configured, use a temporary ID
    return 'temp_user';
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    
    if (!userId) {
      return NextResponse.json({ error: 'Session required' }, { status: 401 });
    }

    const { public_token, metadata } = await request.json();

    if (!public_token) {
      return NextResponse.json(
        { error: 'public_token is required' },
        { status: 400 }
      );
    }

    // Exchange public token for access token
    const exchangeResponse = await fetch(`${PLAID_BASE_URL}/item/public_token/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        public_token,
      }),
    });

    const exchangeData = await exchangeResponse.json();

    if (!exchangeResponse.ok) {
      console.error('Plaid exchange error:', exchangeData);
      return NextResponse.json(
        { error: exchangeData.error_message || 'Failed to exchange token' },
        { status: exchangeResponse.status }
      );
    }

    const { access_token, item_id } = exchangeData;

    // Fetch accounts
    const accountsResponse = await fetch(`${PLAID_BASE_URL}/accounts/get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: PLAID_CLIENT_ID,
        secret: PLAID_SECRET,
        access_token,
      }),
    });

    const accountsData = await accountsResponse.json();

    if (!accountsResponse.ok) {
      console.error('Plaid accounts error:', accountsData);
      return NextResponse.json(
        { error: accountsData.error_message || 'Failed to fetch accounts' },
        { status: accountsResponse.status }
      );
    }

    // TODO: Save to database
    // For now, store in response (will be saved client-side to localStorage for MVP)
    // In production, encrypt access_token and store in DB
    
    const institution = metadata?.institution || {};
    
    return NextResponse.json({
      success: true,
      item_id,
      institution: {
        id: institution.institution_id,
        name: institution.name,
      },
      accounts: accountsData.accounts.map((account: any) => ({
        id: account.account_id,
        name: account.name,
        officialName: account.official_name,
        type: account.type,
        subtype: account.subtype,
        mask: account.mask,
        currentBalance: account.balances?.current,
        availableBalance: account.balances?.available,
        currency: account.balances?.iso_currency_code || 'USD',
      })),
      // WARNING: In production, NEVER return access_token to client
      // This is only for MVP/sandbox testing
      _dev_access_token: PLAID_ENV === 'sandbox' ? access_token : undefined,
    });
  } catch (error) {
    console.error('Error exchanging token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
