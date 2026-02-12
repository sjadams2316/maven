/**
 * Athena Divergence Scanner API
 * 
 * Finds where social sentiment disagrees with analyst consensus.
 * These divergences can be valuable signals:
 * - Social ahead of analysts (retail sees something Wall Street doesn't)
 * - Analysts ahead of social (institutional knowledge retail missed)
 * 
 * GET /api/athena/divergence?symbols=NVDA,AAPL,TSLA
 * POST /api/athena/divergence { symbols: [...], holdings: [...with values...] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getQuickSentiment } from '@/lib/athena/intelligence';
import { getFMPClient } from '@/lib/fmp-client';

// ============================================================================
// TYPES
// ============================================================================

interface DivergenceResult {
  symbol: string;
  name?: string;
  
  // Social sentiment
  socialSentiment: {
    direction: 'bullish' | 'bearish' | 'neutral';
    score: number;           // -1 to +1
    confidence: number;      // 0 to 1
    twitterMentions?: number;
    redditMentions?: number;
    trending?: boolean;
  };
  
  // Analyst consensus
  analystConsensus: {
    direction: 'bullish' | 'bearish' | 'neutral';
    score: number;           // -1 to +1 (normalized from ratings)
    rating: string;          // "strong buy", "buy", "hold", "sell"
    targetUpside: number;    // % to target price
    numberOfAnalysts: number;
  };
  
  // Divergence analysis
  divergence: {
    exists: boolean;
    type: 'social_bullish_analyst_bearish' | 'social_bearish_analyst_bullish' | 'aligned' | 'neutral';
    magnitude: number;       // 0 to 2 (difference between normalized scores)
    severity: 'major' | 'moderate' | 'minor' | 'none';
    description: string;
    
    // Who might be right?
    hypothesis: string;
    
    // Confidence in the divergence signal
    confidence: number;
  };
  
  // For portfolio weighting
  portfolioWeight?: number;
  portfolioImpact?: number;  // divergence × weight
  
  timestamp: string;
}

interface ScanResult {
  timestamp: string;
  symbolsScanned: number;
  divergencesFound: number;
  
  // All results sorted by divergence magnitude
  results: DivergenceResult[];
  
  // Key findings
  majorDivergences: DivergenceResult[];
  socialLeading: DivergenceResult[];     // Social bullish, analysts neutral/bearish
  analystsLeading: DivergenceResult[];   // Analysts bullish, social neutral/bearish
  
  // Portfolio-level (if holdings provided)
  portfolioSummary?: {
    avgDivergence: number;
    riskLevel: 'high' | 'moderate' | 'low';
    topConcerns: string[];
  };
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Normalize analyst rating to -1 to +1 score
 */
function normalizeAnalystRating(rating: string, targetUpside: number): number {
  // Base score from rating
  const ratingScores: Record<string, number> = {
    'strong buy': 0.9,
    'buy': 0.6,
    'moderate buy': 0.4,
    'hold': 0,
    'moderate sell': -0.4,
    'sell': -0.6,
    'strong sell': -0.9,
  };
  
  let baseScore = ratingScores[rating.toLowerCase()] ?? 0;
  
  // Adjust by target upside (significant upside = more bullish signal)
  if (targetUpside > 30) baseScore = Math.min(1, baseScore + 0.2);
  else if (targetUpside > 15) baseScore = Math.min(1, baseScore + 0.1);
  else if (targetUpside < -10) baseScore = Math.max(-1, baseScore - 0.2);
  else if (targetUpside < 0) baseScore = Math.max(-1, baseScore - 0.1);
  
  return Math.max(-1, Math.min(1, baseScore));
}

/**
 * Convert score to direction
 */
function scoreToDirection(score: number): 'bullish' | 'bearish' | 'neutral' {
  if (score > 0.15) return 'bullish';
  if (score < -0.15) return 'bearish';
  return 'neutral';
}

/**
 * Analyze divergence between social and analyst signals
 */
function analyzeDivergence(
  socialScore: number,
  analystScore: number,
  symbol: string
): DivergenceResult['divergence'] {
  const magnitude = Math.abs(socialScore - analystScore);
  const socialDir = scoreToDirection(socialScore);
  const analystDir = scoreToDirection(analystScore);
  
  // Determine type
  let type: DivergenceResult['divergence']['type'];
  if (socialDir === 'bullish' && analystDir === 'bearish') {
    type = 'social_bullish_analyst_bearish';
  } else if (socialDir === 'bearish' && analystDir === 'bullish') {
    type = 'social_bearish_analyst_bullish';
  } else if (socialDir === analystDir && socialDir !== 'neutral') {
    type = 'aligned';
  } else {
    type = 'neutral';
  }
  
  // Determine severity
  let severity: 'major' | 'moderate' | 'minor' | 'none';
  if (type === 'social_bullish_analyst_bearish' || type === 'social_bearish_analyst_bullish') {
    severity = magnitude > 1.2 ? 'major' : magnitude > 0.8 ? 'moderate' : 'minor';
  } else if (magnitude > 0.5) {
    severity = 'minor';
  } else {
    severity = 'none';
  }
  
  // Generate description
  let description: string;
  let hypothesis: string;
  
  if (type === 'social_bullish_analyst_bearish') {
    description = `Social sentiment is ${socialScore > 0.5 ? 'strongly' : ''} bullish while analysts are ${analystScore < -0.5 ? 'strongly' : ''} bearish`;
    hypothesis = `Retail may see growth potential or catalysts that Wall Street is discounting. Watch for potential analyst upgrades if social buzz is ahead of fundamentals.`;
  } else if (type === 'social_bearish_analyst_bullish') {
    description = `Analysts are ${analystScore > 0.5 ? 'strongly' : ''} bullish while social sentiment is ${socialScore < -0.5 ? 'strongly' : ''} bearish`;
    hypothesis = `Wall Street may have conviction on fundamentals that retail is missing. Could be an opportunity if social fear is overdone, or a warning if retail knows something.`;
  } else if (type === 'aligned') {
    description = `Social and analysts are aligned (both ${socialDir})`;
    hypothesis = `Consensus view. Lower conviction edge, but alignment reduces divergence risk.`;
  } else {
    description = `No significant divergence detected`;
    hypothesis = `Signals are neutral or aligned. No clear contrarian opportunity.`;
  }
  
  // Confidence in the divergence signal
  const confidence = Math.min(1, magnitude / 1.5) * (type.includes('bullish') || type.includes('bearish') ? 0.8 : 0.5);
  
  return {
    exists: type !== 'aligned' && type !== 'neutral' && magnitude > 0.3,
    type,
    magnitude,
    severity,
    description,
    hypothesis,
    confidence,
  };
}

/**
 * Scan a single symbol for divergence
 */
async function scanSymbol(symbol: string, portfolioWeight?: number): Promise<DivergenceResult | null> {
  try {
    const timestamp = new Date().toISOString();
    
    // Fetch social sentiment
    const sentiment = await getQuickSentiment(symbol);
    
    // Fetch analyst data from FMP
    const fmpClient = getFMPClient();
    let analystData: any = null;
    let companyName = symbol;
    
    if (fmpClient) {
      try {
        const research = await fmpClient.getResearchData(symbol);
        if (research) {
          analystData = {
            rating: research.analystRating,
            targetUpside: research.currentToTarget,
            numberOfAnalysts: research.numberOfAnalysts,
          };
          companyName = research.name || symbol;
        }
      } catch (e) {
        console.error(`FMP error for ${symbol}:`, e);
      }
    }
    
    // If no analyst data, try to infer from basic data
    if (!analystData) {
      // Default to neutral analyst stance
      analystData = {
        rating: 'hold',
        targetUpside: 0,
        numberOfAnalysts: 0,
      };
    }
    
    // Normalize scores
    const socialScore = sentiment ? 
      (sentiment.sentiment === 'bullish' ? sentiment.score : 
       sentiment.sentiment === 'bearish' ? -Math.abs(sentiment.score) : 0) : 0;
    
    const analystScore = normalizeAnalystRating(
      analystData.rating,
      analystData.targetUpside
    );
    
    // Analyze divergence
    const divergence = analyzeDivergence(socialScore, analystScore, symbol);
    
    const result: DivergenceResult = {
      symbol,
      name: companyName,
      
      socialSentiment: {
        direction: scoreToDirection(socialScore),
        score: socialScore,
        confidence: sentiment?.confidence ?? 0.5,
        twitterMentions: sentiment?.twitterMentions,
        redditMentions: sentiment?.redditMentions,
        trending: sentiment?.trending,
      },
      
      analystConsensus: {
        direction: scoreToDirection(analystScore),
        score: analystScore,
        rating: analystData.rating,
        targetUpside: analystData.targetUpside,
        numberOfAnalysts: analystData.numberOfAnalysts,
      },
      
      divergence,
      timestamp,
    };
    
    // Add portfolio metrics if weight provided
    if (portfolioWeight !== undefined) {
      result.portfolioWeight = portfolioWeight;
      result.portfolioImpact = divergence.magnitude * portfolioWeight;
    }
    
    return result;
    
  } catch (error) {
    console.error(`Error scanning ${symbol}:`, error);
    return null;
  }
}

/**
 * Scan multiple symbols and compile results
 */
async function scanSymbols(
  symbols: string[],
  holdings?: Array<{ symbol: string; value: number }>
): Promise<ScanResult> {
  const timestamp = new Date().toISOString();
  
  // Calculate portfolio weights if holdings provided
  const totalValue = holdings?.reduce((sum, h) => sum + h.value, 0) ?? 0;
  const weightMap = new Map<string, number>();
  holdings?.forEach(h => {
    weightMap.set(h.symbol.toUpperCase(), h.value / totalValue);
  });
  
  // Scan all symbols in parallel (with concurrency limit)
  const BATCH_SIZE = 5;
  const results: DivergenceResult[] = [];
  
  for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
    const batch = symbols.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(symbol => scanSymbol(
        symbol.toUpperCase(),
        weightMap.get(symbol.toUpperCase())
      ))
    );
    results.push(...batchResults.filter((r): r is DivergenceResult => r !== null));
  }
  
  // Sort by divergence magnitude (descending)
  results.sort((a, b) => b.divergence.magnitude - a.divergence.magnitude);
  
  // Categorize results
  const majorDivergences = results.filter(r => r.divergence.severity === 'major');
  const socialLeading = results.filter(r => r.divergence.type === 'social_bullish_analyst_bearish');
  const analystsLeading = results.filter(r => r.divergence.type === 'social_bearish_analyst_bullish');
  
  // Portfolio summary (if holdings provided)
  let portfolioSummary;
  if (holdings && holdings.length > 0) {
    const avgDivergence = results.reduce((sum, r) => sum + (r.portfolioImpact || 0), 0);
    const divergenceCount = results.filter(r => r.divergence.exists).length;
    const majorCount = majorDivergences.length;
    
    let riskLevel: 'high' | 'moderate' | 'low';
    if (majorCount >= 2 || avgDivergence > 0.3) {
      riskLevel = 'high';
    } else if (divergenceCount >= 3 || avgDivergence > 0.15) {
      riskLevel = 'moderate';
    } else {
      riskLevel = 'low';
    }
    
    const topConcerns: string[] = [];
    if (majorDivergences.length > 0) {
      topConcerns.push(`${majorDivergences.length} holding(s) with major sentiment divergence: ${majorDivergences.map(r => r.symbol).join(', ')}`);
    }
    if (socialLeading.length > 0) {
      topConcerns.push(`Social ahead of analysts on: ${socialLeading.map(r => r.symbol).join(', ')}`);
    }
    if (analystsLeading.length > 0) {
      topConcerns.push(`Analysts ahead of social on: ${analystsLeading.map(r => r.symbol).join(', ')}`);
    }
    
    portfolioSummary = {
      avgDivergence,
      riskLevel,
      topConcerns,
    };
  }
  
  return {
    timestamp,
    symbolsScanned: symbols.length,
    divergencesFound: results.filter(r => r.divergence.exists).length,
    results,
    majorDivergences,
    socialLeading,
    analystsLeading,
    portfolioSummary,
  };
}

// ============================================================================
// API HANDLERS
// ============================================================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get('symbols');
  
  if (!symbolsParam) {
    return NextResponse.json(
      { error: 'symbols parameter required (comma-separated)' },
      { status: 400 }
    );
  }
  
  const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
  
  if (symbols.length === 0) {
    return NextResponse.json({ error: 'No valid symbols provided' }, { status: 400 });
  }
  
  if (symbols.length > 20) {
    return NextResponse.json({ error: 'Maximum 20 symbols per request' }, { status: 400 });
  }
  
  try {
    const result = await scanSymbols(symbols);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Divergence scan error:', error);
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbols, holdings } = body;
    
    // Get symbols from either symbols array or holdings
    let symbolList: string[] = [];
    
    if (symbols && Array.isArray(symbols)) {
      symbolList = symbols.map((s: string) => s.toUpperCase());
    } else if (holdings && Array.isArray(holdings)) {
      symbolList = holdings.map((h: any) => h.symbol?.toUpperCase()).filter(Boolean);
    }
    
    if (symbolList.length === 0) {
      return NextResponse.json(
        { error: 'symbols or holdings array required' },
        { status: 400 }
      );
    }
    
    if (symbolList.length > 50) {
      return NextResponse.json({ error: 'Maximum 50 symbols per request' }, { status: 400 });
    }
    
    const result = await scanSymbols(symbolList, holdings);
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Divergence scan error:', error);
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 });
  }
}
