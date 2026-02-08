import { NextResponse } from 'next/server';

// Import the TEY calculator
const teyCalculator = require('../../../lib/tey-calculator');

/**
 * GET /api/tey
 * Get available states and their tax rates
 */
export async function GET() {
  try {
    const states = teyCalculator.getStates();
    return NextResponse.json({
      states,
      federalBrackets: [
        { bracket: '10%', mfj: '$0 - $23,200', single: '$0 - $11,600' },
        { bracket: '12%', mfj: '$23,200 - $94,300', single: '$11,600 - $47,150' },
        { bracket: '22%', mfj: '$94,300 - $201,050', single: '$47,150 - $100,525' },
        { bracket: '24%', mfj: '$201,050 - $383,900', single: '$100,525 - $191,950' },
        { bracket: '32%', mfj: '$383,900 - $487,450', single: '$191,950 - $243,725' },
        { bracket: '35%', mfj: '$487,450 - $731,200', single: '$243,725 - $609,350' },
        { bracket: '37%', mfj: 'Over $731,200', single: 'Over $609,350' }
      ],
      niitThresholds: {
        married: 250000,
        single: 200000,
        rate: 0.038
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/tey
 * Calculate Tax-Equivalent Yield
 * 
 * Body:
 * - muniYield: number (as decimal, e.g., 0.04 for 4%)
 * - income: number (taxable income)
 * - filingStatus: 'single' | 'married'
 * - state: string (state code, e.g., 'CA')
 * - isInState: boolean (whether muni is from client's state)
 * - taxableYield: number (optional, for comparison)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      muniYield,
      income = 500000,
      filingStatus = 'married',
      state = 'CA',
      isInState = true,
      taxableYield = null,
      includeNIIT = true
    } = body;

    if (muniYield === undefined || muniYield === null) {
      return NextResponse.json(
        { error: 'muniYield is required' },
        { status: 400 }
      );
    }

    // Convert percentage to decimal if needed
    const yieldDecimal = muniYield > 1 ? muniYield / 100 : muniYield;
    
    const options = {
      income,
      filingStatus,
      state,
      isInState,
      includeNIIT
    };

    let result;
    
    if (taxableYield !== null) {
      // Compare muni to taxable
      const taxableDecimal = taxableYield > 1 ? taxableYield / 100 : taxableYield;
      result = teyCalculator.compareBonds(yieldDecimal, taxableDecimal, options);
    } else {
      // Just calculate TEY
      result = teyCalculator.calculateTEY(yieldDecimal, options);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('TEY calculation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
