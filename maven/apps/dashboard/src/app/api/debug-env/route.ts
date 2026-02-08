import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const fredKey = process.env.FRED_API_KEY;
  const hasKey = !!fredKey && fredKey.length > 10;
  
  // Test FRED API directly
  let fredTest = null;
  if (hasKey) {
    try {
      const res = await fetch(
        `https://api.stlouisfed.org/fred/series/observations?series_id=T10Y2Y&api_key=${fredKey}&file_type=json&limit=1&sort_order=desc`,
        { cache: 'no-store' }
      );
      if (res.ok) {
        const data = await res.json();
        fredTest = data.observations?.[0] || 'no data';
      } else {
        fredTest = `API error: ${res.status}`;
      }
    } catch (e: any) {
      fredTest = `Fetch error: ${e.message}`;
    }
  }
  
  return NextResponse.json({
    fredKeyConfigured: hasKey,
    fredKeyPrefix: hasKey ? fredKey?.slice(0, 8) + '...' : null,
    fredTest,
    nodeEnv: process.env.NODE_ENV,
  });
}
