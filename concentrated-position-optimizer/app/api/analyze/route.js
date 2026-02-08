import { NextResponse } from 'next/server';
import { calculateCapitalGainsTax, calculateAfterTaxProceeds } from '../../../lib/tax-engine.js';
import { compareStrategies } from '../../../lib/strategy-models.js';

export async function POST(request) {
  try {
    const body = await request.json();
    
    const {
      currentValue,
      costBasis,
      ticker,
      ordinaryIncome,
      filingStatus,
      state,
      years,
      expectedReturn,
      // New parameters
      newCapitalAvailable,
      charitableIntent,
      liquidityNeed,
      riskTolerance
    } = body;

    // Calculate immediate tax if sold
    const taxAnalysis = calculateAfterTaxProceeds({
      currentValue,
      costBasis,
      ordinaryIncome,
      filingStatus,
      state,
      isLongTerm: true
    });

    // Run strategy comparison with corrected models
    const params = {
      currentValue,
      costBasis,
      expectedReturn: expectedReturn / 100,
      diversifiedReturn: (expectedReturn - 1) / 100,
      volatility: 0.25,
      years,
      ordinaryIncome,
      filingStatus,
      state,
      // New parameters
      newCapitalAvailable: newCapitalAvailable || currentValue,
      charitableIntent: charitableIntent || false,
      liquidityNeed: liquidityNeed || 'low',
      riskTolerance: riskTolerance || 'moderate'
    };

    const strategyResults = compareStrategies(params);

    // Calculate some summary stats
    const gain = currentValue - costBasis;
    const embeddedGainRatio = gain / currentValue;

    return NextResponse.json({
      success: true,
      inputs: body,
      positionAnalysis: {
        currentValue,
        costBasis,
        unrealizedGain: gain,
        gainPercent: ((gain / costBasis) * 100).toFixed(1),
        embeddedGainRatio: (embeddedGainRatio * 100).toFixed(1)
      },
      taxAnalysis: {
        gain: taxAnalysis.gain,
        totalTax: taxAnalysis.tax,
        effectiveRate: taxAnalysis.taxDrag,
        afterTaxProceeds: taxAnalysis.afterTaxProceeds,
        breakdown: taxAnalysis.taxBreakdown
      },
      strategies: strategyResults.strategies,
      comparison: strategyResults.comparison,
      recommendation: strategyResults.recommendation
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed', message: error.message },
      { status: 500 }
    );
  }
}
