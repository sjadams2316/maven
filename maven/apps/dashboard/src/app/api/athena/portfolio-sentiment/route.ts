/**
 * Athena Portfolio Sentiment API
 * 
 * Analyzes sentiment across portfolio holdings and generates proactive alerts.
 * This is the backend for the Portfolio Pulse feature.
 * 
 * GET /api/athena/portfolio-sentiment?holdings=AAPL,NVDA,MSFT,BTC,TAO
 * POST /api/athena/portfolio-sentiment
 *   { holdings: [{ symbol: "AAPL", value: 50000 }, ...] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  getBatchSentiment,
  analyzePortfolioSentiment,
  type QuickSentiment,
} from '@/lib/athena/intelligence';
import { isXAIConfigured } from '@/lib/athena/providers/xai';
import { isDesearchConfigured } from '@/lib/athena/providers/bittensor';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const holdingsParam = searchParams.get('holdings');
  
  if (!holdingsParam) {
    return NextResponse.json({
      error: 'Missing required parameter: holdings',
      example: '/api/athena/portfolio-sentiment?holdings=AAPL,NVDA,BTC',
    }, { status: 400 });
  }
  
  const symbols = holdingsParam.split(',').map(s => s.trim().toUpperCase()).slice(0, 10);
  
  try {
    const startTime = Date.now();
    
    // Check provider status
    const providers = {
      xai: isXAIConfigured(),
      desearch: isDesearchConfigured(),
    };
    
    // Get batch sentiment
    const sentiments = await getBatchSentiment(symbols);
    
    // Calculate simple aggregate (equal weight for GET)
    let totalScore = 0;
    let count = 0;
    const bullish: string[] = [];
    const bearish: string[] = [];
    const neutral: string[] = [];
    const trending: string[] = [];
    
    sentiments.forEach((sentiment, symbol) => {
      totalScore += sentiment.score;
      count++;
      
      if (sentiment.sentiment === 'bullish') bullish.push(symbol);
      else if (sentiment.sentiment === 'bearish') bearish.push(symbol);
      else neutral.push(symbol);
      
      if (sentiment.trending) trending.push(symbol);
    });
    
    const avgScore = count > 0 ? totalScore / count : 0;
    
    return NextResponse.json({
      success: true,
      providers,
      latencyMs: Date.now() - startTime,
      summary: {
        overallSentiment: avgScore > 0.15 ? 'bullish' : avgScore < -0.15 ? 'bearish' : 'neutral',
        overallScore: avgScore,
        holdingsAnalyzed: count,
        bullishCount: bullish.length,
        bearishCount: bearish.length,
        neutralCount: neutral.length,
        trendingCount: trending.length,
      },
      holdings: Object.fromEntries(sentiments),
      bullishHoldings: bullish,
      bearishHoldings: bearish,
      neutralHoldings: neutral,
      trendingHoldings: trending,
    });
    
  } catch (error) {
    console.error('Portfolio sentiment error:', error);
    return NextResponse.json({
      error: 'Failed to analyze portfolio sentiment',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { holdings } = body;
    
    if (!holdings || !Array.isArray(holdings) || holdings.length === 0) {
      return NextResponse.json({
        error: 'Missing required field: holdings',
        example: { holdings: [{ symbol: 'AAPL', value: 50000 }, { symbol: 'NVDA', value: 30000 }] },
      }, { status: 400 });
    }
    
    // Validate holdings format
    const validHoldings = holdings
      .filter((h: any) => h.symbol && typeof h.value === 'number')
      .slice(0, 15) // Limit to 15 holdings
      .map((h: any) => ({
        symbol: h.symbol.toUpperCase(),
        value: h.value,
      }));
    
    if (validHoldings.length === 0) {
      return NextResponse.json({
        error: 'No valid holdings provided',
        example: { holdings: [{ symbol: 'AAPL', value: 50000 }] },
      }, { status: 400 });
    }
    
    const startTime = Date.now();
    
    // Check provider status
    const providers = {
      xai: isXAIConfigured(),
      desearch: isDesearchConfigured(),
    };
    
    // Full portfolio analysis with position weighting
    const analysis = await analyzePortfolioSentiment(validHoldings);
    
    // Get individual holding sentiments
    const symbols = validHoldings.map(h => h.symbol);
    const sentiments = await getBatchSentiment(symbols);
    
    // Build enriched holdings array
    const enrichedHoldings = validHoldings.map(h => {
      const sentiment = sentiments.get(h.symbol);
      return {
        symbol: h.symbol,
        value: h.value,
        sentiment: sentiment ? {
          direction: sentiment.sentiment,
          score: sentiment.score,
          confidence: sentiment.confidence,
          twitterMentions: sentiment.twitterMentions,
          redditMentions: sentiment.redditMentions,
          trending: sentiment.trending,
        } : null,
      };
    });
    
    // Generate proactive alerts
    const alerts = generateAlerts(analysis, enrichedHoldings);
    
    return NextResponse.json({
      success: true,
      providers,
      latencyMs: Date.now() - startTime,
      
      // Portfolio-level summary
      portfolio: {
        sentiment: analysis.overallSentiment,
        score: analysis.overallScore,
        holdingsAnalyzed: analysis.holdingsAnalyzed,
      },
      
      // Breakdown by sentiment
      breakdown: {
        bullish: analysis.bullishHoldings,
        bearish: analysis.bearishHoldings,
        neutral: analysis.neutralHoldings,
      },
      
      // Individual holdings with sentiment
      holdings: enrichedHoldings,
      
      // Proactive alerts
      alerts,
      
      lastUpdated: analysis.lastUpdated,
    });
    
  } catch (error) {
    console.error('Portfolio sentiment POST error:', error);
    return NextResponse.json({
      error: 'Failed to analyze portfolio sentiment',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * Generate proactive alerts based on sentiment analysis
 */
function generateAlerts(
  analysis: Awaited<ReturnType<typeof analyzePortfolioSentiment>>,
  holdings: Array<{ symbol: string; value: number; sentiment: any }>
): Array<{ type: string; priority: 'high' | 'medium' | 'low'; message: string; symbol?: string }> {
  const alerts: Array<{ type: string; priority: 'high' | 'medium' | 'low'; message: string; symbol?: string }> = [];
  
  // Use analysis alerts
  analysis.alerts.forEach(alert => {
    if (alert.includes('⚠️')) {
      alerts.push({
        type: 'sentiment_bearish',
        priority: 'high',
        message: alert.replace('⚠️ ', ''),
      });
    } else if (alert.includes('📈')) {
      alerts.push({
        type: 'trending',
        priority: 'medium',
        message: alert.replace('📈 ', ''),
      });
    }
  });
  
  // Add portfolio-level alerts
  if (analysis.bearishHoldings.length >= 3) {
    alerts.push({
      type: 'portfolio_risk',
      priority: 'high',
      message: `${analysis.bearishHoldings.length} holdings showing bearish sentiment. Consider reviewing risk exposure.`,
    });
  }
  
  if (analysis.overallScore < -0.3) {
    alerts.push({
      type: 'portfolio_bearish',
      priority: 'high',
      message: `Portfolio sentiment is strongly bearish (${analysis.overallScore.toFixed(2)}). Market may be pessimistic on your holdings.`,
    });
  } else if (analysis.overallScore > 0.3) {
    alerts.push({
      type: 'portfolio_bullish',
      priority: 'low',
      message: `Portfolio sentiment is strongly bullish (${analysis.overallScore.toFixed(2)}). Social media is optimistic on your holdings.`,
    });
  }
  
  // Tax harvest opportunity with sentiment
  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  holdings.forEach(h => {
    if (h.sentiment?.direction === 'bearish' && h.value / totalValue > 0.05) {
      alerts.push({
        type: 'tax_harvest_opportunity',
        priority: 'medium',
        message: `${h.symbol} is showing bearish sentiment. If it's at a loss, consider tax-loss harvesting.`,
        symbol: h.symbol,
      });
    }
  });
  
  return alerts;
}
