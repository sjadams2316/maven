import { NextResponse } from 'next/server';
import { getQuote, getReturns, getFundSummary, getBatchQuotes } from '@/lib/yahoo';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker');
  const tickers = searchParams.get('tickers'); // comma-separated
  const type = searchParams.get('type') || 'quote'; // quote, returns, summary, batch

  try {
    if (type === 'batch' && tickers) {
      const tickerList = tickers.split(',').map(t => t.trim().toUpperCase());
      const quotes = await getBatchQuotes(tickerList);
      return NextResponse.json({ quotes });
    }

    if (!ticker) {
      return NextResponse.json({ error: 'ticker required' }, { status: 400 });
    }

    const upperTicker = ticker.toUpperCase();

    switch (type) {
      case 'quote':
        const quote = await getQuote(upperTicker);
        return NextResponse.json(quote || { error: 'not found' });

      case 'returns':
        const returns = await getReturns(upperTicker);
        return NextResponse.json(returns || { error: 'not found' });

      case 'summary':
        const summary = await getFundSummary(upperTicker);
        return NextResponse.json(summary || { error: 'not found' });

      default:
        return NextResponse.json({ error: 'invalid type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Live data error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
