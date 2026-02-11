import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

/**
 * GET /api/client-portal/commentary
 * 
 * Generates weekly market commentary for client portal.
 * Uses Claude to create calm, confident, educational content.
 * 
 * @query code - Client portal code
 * @query portfolioValue - Optional portfolio value for context
 * @query refresh - Force regenerate commentary
 * 
 * Tone: Calm, confident, educational (not alarming) - per L013
 */

// Simple in-memory cache (in production, use Redis or similar)
const commentaryCache = new Map<string, { data: CommentaryResponse; expiry: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CommentaryResponse {
  commentary: string;
  generatedAt: string;
  marketHighlights: string[];
}

// Get current market context (mock - in production, fetch from market data API)
function getMarketContext(): string {
  const date = new Date();
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
  const monthDay = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  
  // Mock market data - in production, fetch real data
  return `
Current Date: ${dayOfWeek}, ${monthDay}, ${date.getFullYear()}

Recent Market Conditions:
- S&P 500: Relatively stable with modest gains YTD
- Interest Rates: Fed maintaining current policy stance
- Economic Indicators: Employment remains strong, inflation moderating
- Sector Performance: Technology and healthcare showing resilience

General Outlook: Markets are navigating typical fluctuations while maintaining overall positive trajectory for diversified portfolios.
`;
}

async function generateCommentary(portfolioValue?: number): Promise<CommentaryResponse> {
  const anthropic = new Anthropic();
  const marketContext = getMarketContext();
  
  const portfolioContext = portfolioValue 
    ? `The client has a portfolio valued at approximately ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(portfolioValue)}.`
    : 'The client has a diversified investment portfolio.';

  const systemPrompt = `You are a wealth advisor at Maven Partners, writing a weekly market commentary for a client. 

Your tone must be:
- CALM: Never alarming or anxiety-inducing
- CONFIDENT: Reassuring without being dismissive
- EDUCATIONAL: Help them understand without overwhelming
- BRIEF: 2-3 short paragraphs maximum

Rules:
- Never mention specific stock picks or trading recommendations
- Never suggest they need to take action or call you urgently
- Never use alarming language about market drops or risks
- Focus on the long-term perspective
- Emphasize that Maven Partners is managing things on their behalf
- Make them feel that their financial life is in good hands

${portfolioContext}`;

  const userPrompt = `Write a weekly market commentary for this week based on the following context:

${marketContext}

Write 2-3 paragraphs (150-200 words total) that:
1. Acknowledge current market conditions in a calm, measured way
2. Provide reassuring context for long-term investors
3. Briefly mention what Maven Partners is focused on for their portfolio

End with a subtle confidence message - they're in good hands.

Also provide 2-3 key highlights as bullet points (just the text, no bullet characters).`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userPrompt }
    ]
  });

  // Extract text from response
  const textContent = response.content.find(c => c.type === 'text');
  const fullResponse = textContent ? textContent.text : '';

  // Parse the response - expect paragraphs followed by highlights
  const parts = fullResponse.split(/(?:Key Highlights|Highlights|Key Points):/i);
  const commentary = parts[0].trim();
  
  // Extract highlights if present
  let marketHighlights: string[] = [];
  if (parts[1]) {
    marketHighlights = parts[1]
      .split('\n')
      .map(line => line.replace(/^[-•*]\s*/, '').trim())
      .filter(line => line.length > 0)
      .slice(0, 3);
  }

  return {
    commentary,
    generatedAt: new Date().toISOString(),
    marketHighlights,
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const portfolioValueStr = searchParams.get('portfolioValue');
    const forceRefresh = searchParams.get('refresh') === 'true';
    
    if (!code) {
      return NextResponse.json(
        { error: 'Missing code parameter' },
        { status: 400 }
      );
    }

    const portfolioValue = portfolioValueStr ? parseFloat(portfolioValueStr) : undefined;
    const cacheKey = `${code}-${portfolioValue || 'default'}`;

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = commentaryCache.get(cacheKey);
      if (cached && Date.now() < cached.expiry) {
        return NextResponse.json(cached.data);
      }
    }

    // Generate new commentary
    const commentary = await generateCommentary(portfolioValue);

    // Cache the result
    commentaryCache.set(cacheKey, {
      data: commentary,
      expiry: Date.now() + CACHE_TTL,
    });

    return NextResponse.json(commentary);
  } catch (error) {
    console.error('Commentary generation error:', error);
    
    // Return a fallback commentary instead of error
    // This ensures the UI always has something to show
    const fallbackCommentary: CommentaryResponse = {
      commentary: `Markets continue their steady course this week, with the economic landscape showing familiar patterns of gradual progress. While day-to-day movements capture headlines, the fundamentals that support long-term wealth building remain intact.

At Maven Partners, we remain focused on the strategies that matter most for your financial future. Your portfolio continues to be positioned for the goals we've discussed, with appropriate diversification across asset classes. We're monitoring opportunities while maintaining the disciplined approach that serves our clients well.

As always, we're here if you have questions or want to discuss your progress toward your goals.`,
      generatedAt: new Date().toISOString(),
      marketHighlights: [
        'Markets maintaining steady trajectory amid normal volatility',
        'Economic indicators continue to support long-term investment thesis',
        'Portfolio positioning aligned with your stated goals'
      ],
    };

    return NextResponse.json(fallbackCommentary);
  }
}
