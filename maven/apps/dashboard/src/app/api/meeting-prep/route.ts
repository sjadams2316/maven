import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Demo client data (in production, fetch from database)
const DEMO_CLIENTS: Record<string, {
  name: string;
  aum: number;
  riskProfile: string;
  goals: string[];
  holdings: { symbol: string; weight: number }[];
  recentActivity: string[];
  notes: string[];
  ytdReturn: number;
}> = {
  '1': {
    name: 'Robert & Linda Chen',
    aum: 1300000,
    riskProfile: 'Moderate',
    goals: ['Retirement in 2032', 'College fund for grandchildren', 'Leave legacy to children'],
    holdings: [
      { symbol: 'VTI', weight: 35 },
      { symbol: 'VXUS', weight: 15 },
      { symbol: 'BND', weight: 25 },
      { symbol: 'AAPL', weight: 12 },
      { symbol: 'MSFT', weight: 8 },
      { symbol: 'Cash', weight: 5 },
    ],
    recentActivity: [
      'Rebalanced international allocation (Jan 2026)',
      'Harvested $3,200 tax loss in VXUS (Dec 2025)',
      'Increased bond allocation by 5% (Nov 2025)',
    ],
    notes: [
      'Linda taking sabbatical - lower income this year',
      'Interested in 529 plan for grandson',
      'Concerned about market volatility',
    ],
    ytdReturn: 9.4,
  },
  '4': {
    name: 'Michael Thompson',
    aum: 520000,
    riskProfile: 'Aggressive Growth',
    goals: ['Early retirement at 55 (8 years)', 'Build wealth aggressively', 'Future home purchase'],
    holdings: [
      { symbol: 'VTI', weight: 25 },
      { symbol: 'QQQ', weight: 20 },
      { symbol: 'AAPL', weight: 12 },
      { symbol: 'GOOGL', weight: 10 },
      { symbol: 'NVDA', weight: 8 },
      { symbol: 'MSFT', weight: 10 },
      { symbol: 'Company RSUs', weight: 15 },
    ],
    recentActivity: [
      'Recorded trade: Bought 50 shares NVDA (Jan 2026)',
      'Updated risk profile to Aggressive (Dec 2025)',
      'Quarterly review completed (Dec 2025)',
    ],
    notes: [
      'Recently married - needs beneficiary update',
      'RSUs vesting March 15 (~$45K)',
      'Wants to maximize 401k contributions',
      'Currently at 12% contribution, could increase to max',
    ],
    ytdReturn: 8.9,
  },
};

// Get current market context
function getMarketContext(): string {
  // In production, fetch real market data
  return `Current market conditions (Feb 2026):
- S&P 500: Down 1.2% this week on inflation concerns
- Fed minutes show hawkish lean, rates likely to stay higher for longer
- Tech sector volatile but showing resilience
- Bond yields stable around 4.2%
- Inflation data coming Friday could move markets`;
}

export async function POST(request: NextRequest) {
  try {
    const { clientId, meetingType } = await request.json();

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
    }

    const client = DEMO_CLIENTS[clientId];
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const marketContext = getMarketContext();

    const prompt = `You are an AI assistant helping a wealth advisor prepare for a client meeting. Generate a concise, actionable meeting prep.

CLIENT PROFILE:
- Name: ${client.name}
- AUM: $${client.aum.toLocaleString()}
- Risk Profile: ${client.riskProfile}
- YTD Return: ${client.ytdReturn}%
- Goals: ${client.goals.join(', ')}

CURRENT HOLDINGS:
${client.holdings.map(h => `- ${h.symbol}: ${h.weight}%`).join('\n')}

RECENT ACTIVITY:
${client.recentActivity.join('\n')}

ADVISOR NOTES:
${client.notes.join('\n')}

MARKET CONTEXT:
${marketContext}

MEETING TYPE: ${meetingType || 'Quarterly Review'}

Generate a meeting prep with these exact sections:
1. SUMMARY (2-3 sentences about client status)
2. ACTION_ITEMS (bullet list of urgent items, max 3)
3. TALKING_POINTS (bullet list of 4-5 specific discussion topics)
4. MARKET_CONTEXT (2-3 sentences relating market conditions to their portfolio)

Format your response as JSON with keys: summary, actionItems (array), talkingPoints (array), marketContext`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract text content
    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    // Parse JSON from response
    let prep;
    try {
      // Try to extract JSON from the response
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        prep = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch {
      // Fallback: return raw text
      prep = {
        summary: textContent.text,
        actionItems: [],
        talkingPoints: [],
        marketContext: '',
      };
    }

    return NextResponse.json({
      success: true,
      clientName: client.name,
      prep,
    });
  } catch (error) {
    console.error('Meeting prep error:', error);
    return NextResponse.json(
      { error: 'Failed to generate meeting prep' },
      { status: 500 }
    );
  }
}
