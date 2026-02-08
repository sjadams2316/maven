import { NextResponse } from 'next/server';
import { PortfolioHolding, FundData, AnalysisResult, PortfolioMetrics, Recommendation, ScenarioProjection, StressTest } from '@/types';

// Simulated fund database - in production, this would come from Morningstar or similar
const FUND_DATABASE: Record<string, Partial<FundData>> = {
  // Broad Market US
  'VTI': { name: 'Vanguard Total Stock Market ETF', type: 'ETF', expenseRatio: 0.0003, aum: 380000, category: 'US Total Market', annualizedReturn1Y: 0.26, annualizedReturn3Y: 0.10, volatility: 0.18, beta: 1.0 },
  'SPY': { name: 'SPDR S&P 500 ETF', type: 'ETF', expenseRatio: 0.0009, aum: 500000, category: 'Large Cap Blend', annualizedReturn1Y: 0.25, annualizedReturn3Y: 0.11, volatility: 0.17, beta: 1.0 },
  'VOO': { name: 'Vanguard S&P 500 ETF', type: 'ETF', expenseRatio: 0.0003, aum: 400000, category: 'Large Cap Blend', annualizedReturn1Y: 0.25, annualizedReturn3Y: 0.11, volatility: 0.17, beta: 1.0 },
  'IVV': { name: 'iShares Core S&P 500 ETF', type: 'ETF', expenseRatio: 0.0003, aum: 450000, category: 'Large Cap Blend', annualizedReturn1Y: 0.25, annualizedReturn3Y: 0.11, volatility: 0.17, beta: 1.0 },
  'ITOT': { name: 'iShares Core S&P Total US Stock Market ETF', type: 'ETF', expenseRatio: 0.0003, aum: 50000, category: 'US Total Market', annualizedReturn1Y: 0.26, annualizedReturn3Y: 0.10, volatility: 0.18, beta: 1.0 },
  'SCHB': { name: 'Schwab US Broad Market ETF', type: 'ETF', expenseRatio: 0.0003, aum: 28000, category: 'US Total Market', annualizedReturn1Y: 0.26, annualizedReturn3Y: 0.10, volatility: 0.18, beta: 1.0 },
  
  // International
  'VXUS': { name: 'Vanguard Total International Stock ETF', type: 'ETF', expenseRatio: 0.0007, aum: 70000, category: 'International', annualizedReturn1Y: 0.08, annualizedReturn3Y: 0.04, volatility: 0.16, beta: 0.85 },
  'IXUS': { name: 'iShares Core MSCI Total International Stock ETF', type: 'ETF', expenseRatio: 0.0007, aum: 35000, category: 'International', annualizedReturn1Y: 0.08, annualizedReturn3Y: 0.04, volatility: 0.16, beta: 0.85 },
  'VEA': { name: 'Vanguard FTSE Developed Markets ETF', type: 'ETF', expenseRatio: 0.0005, aum: 120000, category: 'Developed International', annualizedReturn1Y: 0.10, annualizedReturn3Y: 0.05, volatility: 0.15, beta: 0.80 },
  'VWO': { name: 'Vanguard FTSE Emerging Markets ETF', type: 'ETF', expenseRatio: 0.0008, aum: 80000, category: 'Emerging Markets', annualizedReturn1Y: 0.12, annualizedReturn3Y: 0.02, volatility: 0.22, beta: 1.1 },
  'EFA': { name: 'iShares MSCI EAFE ETF', type: 'ETF', expenseRatio: 0.0032, aum: 55000, category: 'Developed International', annualizedReturn1Y: 0.10, annualizedReturn3Y: 0.05, volatility: 0.15, beta: 0.80 },
  
  // Bonds
  'BND': { name: 'Vanguard Total Bond Market ETF', type: 'ETF', expenseRatio: 0.0003, aum: 100000, category: 'US Bonds', annualizedReturn1Y: 0.02, annualizedReturn3Y: -0.02, volatility: 0.06, beta: 0.0 },
  'AGG': { name: 'iShares Core US Aggregate Bond ETF', type: 'ETF', expenseRatio: 0.0003, aum: 110000, category: 'US Bonds', annualizedReturn1Y: 0.02, annualizedReturn3Y: -0.02, volatility: 0.06, beta: 0.0 },
  'SCHZ': { name: 'Schwab US Aggregate Bond ETF', type: 'ETF', expenseRatio: 0.0003, aum: 8000, category: 'US Bonds', annualizedReturn1Y: 0.02, annualizedReturn3Y: -0.02, volatility: 0.06, beta: 0.0 },
  'VTIP': { name: 'Vanguard Short-Term Inflation-Protected Securities ETF', type: 'ETF', expenseRatio: 0.0004, aum: 55000, category: 'TIPS', annualizedReturn1Y: 0.04, annualizedReturn3Y: 0.02, volatility: 0.03, beta: 0.0 },
  'TIP': { name: 'iShares TIPS Bond ETF', type: 'ETF', expenseRatio: 0.0019, aum: 20000, category: 'TIPS', annualizedReturn1Y: 0.03, annualizedReturn3Y: 0.01, volatility: 0.05, beta: 0.0 },
  'VGSH': { name: 'Vanguard Short-Term Treasury ETF', type: 'ETF', expenseRatio: 0.0004, aum: 25000, category: 'Short-Term Treasury', annualizedReturn1Y: 0.045, annualizedReturn3Y: 0.02, volatility: 0.02, beta: 0.0 },
  'SHY': { name: 'iShares 1-3 Year Treasury Bond ETF', type: 'ETF', expenseRatio: 0.0015, aum: 25000, category: 'Short-Term Treasury', annualizedReturn1Y: 0.04, annualizedReturn3Y: 0.015, volatility: 0.02, beta: 0.0 },
  'TLT': { name: 'iShares 20+ Year Treasury Bond ETF', type: 'ETF', expenseRatio: 0.0015, aum: 45000, category: 'Long-Term Treasury', annualizedReturn1Y: -0.05, annualizedReturn3Y: -0.10, volatility: 0.18, beta: 0.0 },
  'VCIT': { name: 'Vanguard Intermediate-Term Corporate Bond ETF', type: 'ETF', expenseRatio: 0.0004, aum: 45000, category: 'Corporate Bond', annualizedReturn1Y: 0.04, annualizedReturn3Y: 0.00, volatility: 0.07, beta: 0.2 },
  'LQD': { name: 'iShares iBoxx Investment Grade Corporate Bond ETF', type: 'ETF', expenseRatio: 0.0014, aum: 35000, category: 'Corporate Bond', annualizedReturn1Y: 0.03, annualizedReturn3Y: -0.01, volatility: 0.08, beta: 0.2 },
  
  // Sector
  'VGT': { name: 'Vanguard Information Technology ETF', type: 'ETF', expenseRatio: 0.001, aum: 70000, category: 'Technology', annualizedReturn1Y: 0.35, annualizedReturn3Y: 0.15, volatility: 0.24, beta: 1.3 },
  'QQQ': { name: 'Invesco QQQ Trust', type: 'ETF', expenseRatio: 0.002, aum: 250000, category: 'Large Cap Growth', annualizedReturn1Y: 0.30, annualizedReturn3Y: 0.12, volatility: 0.22, beta: 1.2 },
  'XLK': { name: 'Technology Select Sector SPDR Fund', type: 'ETF', expenseRatio: 0.001, aum: 60000, category: 'Technology', annualizedReturn1Y: 0.34, annualizedReturn3Y: 0.14, volatility: 0.24, beta: 1.3 },
  'VHT': { name: 'Vanguard Health Care ETF', type: 'ETF', expenseRatio: 0.001, aum: 18000, category: 'Healthcare', annualizedReturn1Y: 0.08, annualizedReturn3Y: 0.06, volatility: 0.15, beta: 0.7 },
  'XLV': { name: 'Health Care Select Sector SPDR Fund', type: 'ETF', expenseRatio: 0.001, aum: 40000, category: 'Healthcare', annualizedReturn1Y: 0.07, annualizedReturn3Y: 0.06, volatility: 0.15, beta: 0.7 },
  'VFH': { name: 'Vanguard Financials ETF', type: 'ETF', expenseRatio: 0.001, aum: 10000, category: 'Financials', annualizedReturn1Y: 0.22, annualizedReturn3Y: 0.08, volatility: 0.20, beta: 1.1 },
  'XLF': { name: 'Financial Select Sector SPDR Fund', type: 'ETF', expenseRatio: 0.001, aum: 40000, category: 'Financials', annualizedReturn1Y: 0.22, annualizedReturn3Y: 0.08, volatility: 0.20, beta: 1.1 },
  'VNQ': { name: 'Vanguard Real Estate ETF', type: 'ETF', expenseRatio: 0.0012, aum: 35000, category: 'Real Estate', annualizedReturn1Y: 0.12, annualizedReturn3Y: 0.02, volatility: 0.20, beta: 0.8 },
  'IYR': { name: 'iShares US Real Estate ETF', type: 'ETF', expenseRatio: 0.0039, aum: 4000, category: 'Real Estate', annualizedReturn1Y: 0.11, annualizedReturn3Y: 0.01, volatility: 0.21, beta: 0.8 },
  'VDE': { name: 'Vanguard Energy ETF', type: 'ETF', expenseRatio: 0.001, aum: 8000, category: 'Energy', annualizedReturn1Y: 0.05, annualizedReturn3Y: 0.15, volatility: 0.28, beta: 1.2 },
  'XLE': { name: 'Energy Select Sector SPDR Fund', type: 'ETF', expenseRatio: 0.001, aum: 35000, category: 'Energy', annualizedReturn1Y: 0.05, annualizedReturn3Y: 0.15, volatility: 0.28, beta: 1.2 },
  
  // Factor / Style
  'VTV': { name: 'Vanguard Value ETF', type: 'ETF', expenseRatio: 0.0004, aum: 115000, category: 'Large Cap Value', annualizedReturn1Y: 0.18, annualizedReturn3Y: 0.09, volatility: 0.15, beta: 0.9 },
  'VUG': { name: 'Vanguard Growth ETF', type: 'ETF', expenseRatio: 0.0004, aum: 120000, category: 'Large Cap Growth', annualizedReturn1Y: 0.32, annualizedReturn3Y: 0.12, volatility: 0.21, beta: 1.1 },
  'VBR': { name: 'Vanguard Small-Cap Value ETF', type: 'ETF', expenseRatio: 0.0007, aum: 28000, category: 'Small Cap Value', annualizedReturn1Y: 0.15, annualizedReturn3Y: 0.06, volatility: 0.20, beta: 1.0 },
  'VBK': { name: 'Vanguard Small-Cap Growth ETF', type: 'ETF', expenseRatio: 0.0007, aum: 15000, category: 'Small Cap Growth', annualizedReturn1Y: 0.20, annualizedReturn3Y: 0.04, volatility: 0.25, beta: 1.2 },
  'MTUM': { name: 'iShares MSCI USA Momentum Factor ETF', type: 'ETF', expenseRatio: 0.0015, aum: 12000, category: 'Momentum', annualizedReturn1Y: 0.28, annualizedReturn3Y: 0.11, volatility: 0.18, beta: 1.0 },
  'QUAL': { name: 'iShares MSCI USA Quality Factor ETF', type: 'ETF', expenseRatio: 0.0015, aum: 40000, category: 'Quality', annualizedReturn1Y: 0.27, annualizedReturn3Y: 0.12, volatility: 0.17, beta: 0.95 },
  'USMV': { name: 'iShares MSCI USA Min Vol Factor ETF', type: 'ETF', expenseRatio: 0.0015, aum: 30000, category: 'Low Volatility', annualizedReturn1Y: 0.18, annualizedReturn3Y: 0.08, volatility: 0.12, beta: 0.7 },
  
  // Thematic / Higher Risk
  'ARKK': { name: 'ARK Innovation ETF', type: 'ETF', expenseRatio: 0.0075, aum: 6000, category: 'Thematic', annualizedReturn1Y: 0.45, annualizedReturn3Y: -0.15, volatility: 0.50, beta: 1.8 },
  'ARKG': { name: 'ARK Genomic Revolution ETF', type: 'ETF', expenseRatio: 0.0075, aum: 2000, category: 'Thematic', annualizedReturn1Y: 0.10, annualizedReturn3Y: -0.20, volatility: 0.45, beta: 1.5 },
  'ICLN': { name: 'iShares Global Clean Energy ETF', type: 'ETF', expenseRatio: 0.0041, aum: 3000, category: 'Clean Energy', annualizedReturn1Y: -0.10, annualizedReturn3Y: -0.05, volatility: 0.35, beta: 1.3 },
  
  // Commodities
  'GLD': { name: 'SPDR Gold Shares', type: 'ETF', expenseRatio: 0.004, aum: 60000, category: 'Gold', annualizedReturn1Y: 0.28, annualizedReturn3Y: 0.12, volatility: 0.15, beta: 0.0 },
  'IAU': { name: 'iShares Gold Trust', type: 'ETF', expenseRatio: 0.0025, aum: 28000, category: 'Gold', annualizedReturn1Y: 0.28, annualizedReturn3Y: 0.12, volatility: 0.15, beta: 0.0 },
  'SLV': { name: 'iShares Silver Trust', type: 'ETF', expenseRatio: 0.005, aum: 10000, category: 'Silver', annualizedReturn1Y: 0.35, annualizedReturn3Y: 0.08, volatility: 0.30, beta: 0.1 },
  'DBC': { name: 'Invesco DB Commodity Index Tracking Fund', type: 'ETF', expenseRatio: 0.0087, aum: 2000, category: 'Commodities', annualizedReturn1Y: 0.05, annualizedReturn3Y: 0.10, volatility: 0.18, beta: 0.3 },
  
  // Some Mutual Funds
  'VFIAX': { name: 'Vanguard 500 Index Fund Admiral', type: 'Mutual Fund', expenseRatio: 0.0004, aum: 450000, category: 'Large Cap Blend', annualizedReturn1Y: 0.25, annualizedReturn3Y: 0.11, volatility: 0.17, beta: 1.0 },
  'FXAIX': { name: 'Fidelity 500 Index Fund', type: 'Mutual Fund', expenseRatio: 0.00015, aum: 400000, category: 'Large Cap Blend', annualizedReturn1Y: 0.25, annualizedReturn3Y: 0.11, volatility: 0.17, beta: 1.0 },
  'VTSAX': { name: 'Vanguard Total Stock Market Index Fund Admiral', type: 'Mutual Fund', expenseRatio: 0.0004, aum: 350000, category: 'US Total Market', annualizedReturn1Y: 0.26, annualizedReturn3Y: 0.10, volatility: 0.18, beta: 1.0 },
  'VBTLX': { name: 'Vanguard Total Bond Market Index Fund Admiral', type: 'Mutual Fund', expenseRatio: 0.0005, aum: 100000, category: 'US Bonds', annualizedReturn1Y: 0.02, annualizedReturn3Y: -0.02, volatility: 0.06, beta: 0.0 },
  'VTIAX': { name: 'Vanguard Total International Stock Index Fund Admiral', type: 'Mutual Fund', expenseRatio: 0.0011, aum: 50000, category: 'International', annualizedReturn1Y: 0.08, annualizedReturn3Y: 0.04, volatility: 0.16, beta: 0.85 },
};

// Better alternatives mapping by category
const BETTER_ALTERNATIVES: Record<string, string[]> = {
  'Large Cap Blend': ['VOO', 'VTI', 'FXAIX'],
  'US Total Market': ['VTI', 'ITOT', 'SCHB'],
  'International': ['VXUS', 'IXUS', 'VEA'],
  'Developed International': ['VEA', 'IXUS'],
  'Emerging Markets': ['VWO', 'IEMG'],
  'US Bonds': ['BND', 'AGG', 'SCHZ'],
  'TIPS': ['VTIP', 'SCHP'],
  'Short-Term Treasury': ['VGSH', 'SHY'],
  'Long-Term Treasury': ['TLT', 'VGLT'],
  'Corporate Bond': ['VCIT', 'LQD'],
  'Technology': ['VGT', 'XLK'],
  'Large Cap Growth': ['VUG', 'SCHG'],
  'Healthcare': ['VHT', 'XLV'],
  'Financials': ['VFH', 'XLF'],
  'Real Estate': ['VNQ', 'SCHH'],
  'Energy': ['VDE', 'XLE'],
  'Large Cap Value': ['VTV', 'SCHV'],
  'Small Cap Value': ['VBR', 'IJS'],
  'Small Cap Growth': ['VBK', 'IJT'],
  'Gold': ['IAU', 'GLD'],
  'Silver': ['SLV'],
  'Commodities': ['DBC', 'PDBC'],
  'Thematic': ['ARKK'], // Keep as is - high risk/reward
  'Clean Energy': ['ICLN', 'QCLN'],
  'Momentum': ['MTUM'],
  'Quality': ['QUAL'],
  'Low Volatility': ['USMV', 'SPLV'],
};

export async function POST(request: Request) {
  try {
    const { holdings } = await request.json() as { holdings: PortfolioHolding[] };
    
    if (!holdings || holdings.length === 0) {
      return NextResponse.json({ error: 'No holdings provided' }, { status: 400 });
    }

    // Normalize weights to sum to 100
    const totalWeight = holdings.reduce((sum, h) => sum + h.weight, 0);
    const normalizedHoldings = holdings.map(h => ({
      ...h,
      weight: (h.weight / totalWeight) * 100,
    }));

    // Fetch fund data for each holding
    const currentHoldings = normalizedHoldings.map(holding => {
      const fundData = FUND_DATABASE[holding.ticker.toUpperCase()];
      return {
        ...holding,
        ticker: holding.ticker.toUpperCase(),
        name: fundData?.name || `Unknown Fund (${holding.ticker})`,
        type: fundData?.type || 'ETF',
        expenseRatio: fundData?.expenseRatio || 0.005,
        aum: fundData?.aum || 500,
        inceptionDate: '2015-01-01',
        category: fundData?.category || 'Unknown',
        annualizedReturn1Y: fundData?.annualizedReturn1Y || 0.08,
        annualizedReturn3Y: fundData?.annualizedReturn3Y || 0.06,
        volatility: fundData?.volatility || 0.20,
        sharpeRatio: calculateSharpe(fundData?.annualizedReturn1Y || 0.08, fundData?.volatility || 0.20),
        beta: fundData?.beta || 1.0,
        meetsRequirements: (fundData?.aum || 500) >= 100,
      } as PortfolioHolding & FundData;
    });

    // Calculate current portfolio metrics
    const currentMetrics = calculatePortfolioMetrics(currentHoldings);

    // Generate optimized portfolio
    const optimizedHoldings = optimizePortfolio(currentHoldings);
    const optimizedMetrics = calculatePortfolioMetrics(optimizedHoldings);

    // Generate recommendations
    const recommendations = generateRecommendations(currentHoldings, optimizedHoldings);

    // Run Monte Carlo simulations
    const currentProjections = runMonteCarloSimulation(currentMetrics.expectedReturn, currentMetrics.volatility);
    const optimizedProjections = runMonteCarloSimulation(optimizedMetrics.expectedReturn, optimizedMetrics.volatility);

    // Run stress tests
    const stressTests = runStressTests(currentHoldings, optimizedHoldings);

    // Generate summary
    const summary = generateSummary(currentMetrics, optimizedMetrics, recommendations);

    const result: AnalysisResult = {
      currentPortfolio: {
        holdings: currentHoldings,
        metrics: currentMetrics,
      },
      optimizedPortfolio: {
        holdings: optimizedHoldings,
        metrics: optimizedMetrics,
      },
      recommendations,
      projections: {
        current: currentProjections,
        optimized: optimizedProjections,
      },
      stressTests,
      summary,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}

function calculateSharpe(returnRate: number, volatility: number, riskFreeRate: number = 0.045): number {
  if (volatility === 0) return 0;
  return (returnRate - riskFreeRate) / volatility;
}

function calculatePortfolioMetrics(holdings: (PortfolioHolding & FundData)[]): PortfolioMetrics {
  // Weighted average calculations
  let expectedReturn = 0;
  let expenseRatio = 0;
  let weightedBeta = 0;
  let portfolioVolatility = 0;

  for (const holding of holdings) {
    const weight = holding.weight / 100;
    expectedReturn += (holding.annualizedReturn1Y || 0.08) * weight;
    expenseRatio += (holding.expenseRatio || 0.005) * weight;
    weightedBeta += (holding.beta || 1) * weight;
    // Simplified volatility calculation (would need correlation matrix for accuracy)
    portfolioVolatility += Math.pow((holding.volatility || 0.20) * weight, 2);
  }
  
  portfolioVolatility = Math.sqrt(portfolioVolatility) * 1.1; // Add some correlation factor

  const sharpeRatio = calculateSharpe(expectedReturn, portfolioVolatility);
  
  // Simplified diversification score based on number of holdings and category spread
  const categories = new Set(holdings.map(h => h.category));
  const diversificationScore = Math.min(100, (holdings.length * 10) + (categories.size * 15));

  return {
    expectedReturn,
    volatility: portfolioVolatility,
    sharpeRatio,
    maxDrawdown: portfolioVolatility * -2.5, // Rough approximation
    expenseRatio,
    diversificationScore,
  };
}

function optimizePortfolio(holdings: (PortfolioHolding & FundData)[]): (PortfolioHolding & FundData)[] {
  return holdings.map(holding => {
    // Find better alternative in same category
    const alternatives = BETTER_ALTERNATIVES[holding.category] || [];
    
    // Filter alternatives that are actually better
    const betterOptions = alternatives
      .map(ticker => ({ ticker, data: FUND_DATABASE[ticker] }))
      .filter(({ ticker, data }) => {
        if (!data || ticker === holding.ticker) return false;
        // Must meet requirements: $100M+ AUM
        if ((data.aum || 0) < 100) return false;
        // Should have lower expense ratio OR better return
        return (data.expenseRatio || 1) < (holding.expenseRatio || 0) || 
               (data.annualizedReturn1Y || 0) > (holding.annualizedReturn1Y || 0);
      })
      .sort((a, b) => {
        // Prefer lower expense ratio, then higher return
        const expenseDiff = (a.data?.expenseRatio || 1) - (b.data?.expenseRatio || 1);
        if (Math.abs(expenseDiff) > 0.001) return expenseDiff;
        return (b.data?.annualizedReturn1Y || 0) - (a.data?.annualizedReturn1Y || 0);
      });

    if (betterOptions.length > 0) {
      const best = betterOptions[0];
      return {
        ...holding,
        ticker: best.ticker,
        name: best.data?.name || best.ticker,
        expenseRatio: best.data?.expenseRatio || holding.expenseRatio,
        aum: best.data?.aum || holding.aum,
        annualizedReturn1Y: best.data?.annualizedReturn1Y || holding.annualizedReturn1Y,
        annualizedReturn3Y: best.data?.annualizedReturn3Y || holding.annualizedReturn3Y,
        volatility: best.data?.volatility || holding.volatility,
        beta: best.data?.beta || holding.beta,
      };
    }

    return holding;
  });
}

function generateRecommendations(
  current: (PortfolioHolding & FundData)[],
  optimized: (PortfolioHolding & FundData)[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  for (let i = 0; i < current.length; i++) {
    if (current[i].ticker !== optimized[i].ticker) {
      const expenseChange = (optimized[i].expenseRatio || 0) - (current[i].expenseRatio || 0);
      const returnChange = (optimized[i].annualizedReturn1Y || 0) - (current[i].annualizedReturn1Y || 0);
      const volatilityChange = (optimized[i].volatility || 0) - (current[i].volatility || 0);

      let reason = '';
      if (expenseChange < -0.001) {
        reason = `Lower expense ratio (${((optimized[i].expenseRatio || 0) * 100).toFixed(2)}% vs ${((current[i].expenseRatio || 0) * 100).toFixed(2)}%). `;
      }
      if (returnChange > 0.01) {
        reason += `Better historical returns. `;
      }
      if (volatilityChange < -0.01) {
        reason += `Lower volatility. `;
      }
      if (!reason) {
        reason = 'Similar exposure with better overall characteristics.';
      }

      recommendations.push({
        currentHolding: current[i],
        recommendedHolding: optimized[i],
        reason: reason.trim(),
        impact: {
          returnChange,
          volatilityChange,
          expenseChange,
        },
      });
    }
  }

  return recommendations;
}

function runMonteCarloSimulation(expectedReturn: number, volatility: number, years: number = 10, simulations: number = 1000): ScenarioProjection {
  const startingValue = 100000;
  const monthlyReturn = expectedReturn / 12;
  const monthlyVol = volatility / Math.sqrt(12);
  
  const yearlyResults: number[][] = Array(years).fill(null).map(() => []);
  
  for (let sim = 0; sim < simulations; sim++) {
    let value = startingValue;
    for (let year = 0; year < years; year++) {
      // Simulate 12 months
      for (let month = 0; month < 12; month++) {
        // Box-Muller transform for normal distribution
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        const monthlyChange = monthlyReturn + monthlyVol * z;
        value *= (1 + monthlyChange);
      }
      yearlyResults[year].push(value);
    }
  }
  
  // Calculate percentiles for each year
  const percentile = (arr: number[], p: number) => {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * p);
    return sorted[index];
  };

  return {
    years: Array.from({ length: years }, (_, i) => i + 1),
    percentile5: yearlyResults.map(yr => percentile(yr, 0.05)),
    percentile25: yearlyResults.map(yr => percentile(yr, 0.25)),
    percentile50: yearlyResults.map(yr => percentile(yr, 0.50)),
    percentile75: yearlyResults.map(yr => percentile(yr, 0.75)),
    percentile95: yearlyResults.map(yr => percentile(yr, 0.95)),
  };
}

function runStressTests(
  current: (PortfolioHolding & FundData)[],
  optimized: (PortfolioHolding & FundData)[]
): StressTest[] {
  const scenarios: { name: string; description: string; impacts: Record<string, number> }[] = [
    {
      name: '2008 Financial Crisis',
      description: 'Similar to the 2008 market crash (-50% peak to trough)',
      impacts: {
        'US Total Market': -0.50, 'Large Cap Blend': -0.50, 'Large Cap Growth': -0.45, 'Large Cap Value': -0.55,
        'International': -0.55, 'Emerging Markets': -0.60, 'Developed International': -0.50,
        'US Bonds': 0.05, 'TIPS': 0.02, 'Short-Term Treasury': 0.03, 'Long-Term Treasury': 0.20,
        'Corporate Bond': -0.05, 'Technology': -0.45, 'Healthcare': -0.35, 'Financials': -0.70,
        'Real Estate': -0.60, 'Energy': -0.50, 'Gold': 0.05, 'Commodities': -0.40,
        'Small Cap Value': -0.55, 'Small Cap Growth': -0.50, 'Thematic': -0.60,
      },
    },
    {
      name: '2022 Rate Hike',
      description: 'Rising interest rates scenario (-20% stocks, -15% bonds)',
      impacts: {
        'US Total Market': -0.20, 'Large Cap Blend': -0.20, 'Large Cap Growth': -0.30, 'Large Cap Value': -0.10,
        'International': -0.15, 'Emerging Markets': -0.25, 'Developed International': -0.15,
        'US Bonds': -0.15, 'TIPS': -0.05, 'Short-Term Treasury': -0.02, 'Long-Term Treasury': -0.30,
        'Corporate Bond': -0.15, 'Technology': -0.35, 'Healthcare': -0.10, 'Financials': 0.05,
        'Real Estate': -0.30, 'Energy': 0.30, 'Gold': -0.05, 'Commodities': 0.20,
        'Small Cap Value': -0.15, 'Small Cap Growth': -0.30, 'Thematic': -0.50, 'Low Volatility': -0.10,
      },
    },
    {
      name: 'Tech Bubble Burst',
      description: 'Tech sector correction similar to 2000-2002',
      impacts: {
        'US Total Market': -0.30, 'Large Cap Blend': -0.25, 'Large Cap Growth': -0.50, 'Large Cap Value': -0.10,
        'International': -0.20, 'Emerging Markets': -0.35, 'Developed International': -0.20,
        'US Bonds': 0.10, 'TIPS': 0.05, 'Short-Term Treasury': 0.05, 'Long-Term Treasury': 0.15,
        'Corporate Bond': 0.02, 'Technology': -0.70, 'Healthcare': -0.20, 'Financials': -0.15,
        'Real Estate': 0.05, 'Energy': -0.10, 'Gold': 0.15, 'Commodities': -0.05,
        'Small Cap Value': -0.20, 'Small Cap Growth': -0.60, 'Thematic': -0.80, 'Quality': -0.20,
      },
    },
    {
      name: 'Stagflation',
      description: 'High inflation with economic slowdown',
      impacts: {
        'US Total Market': -0.25, 'Large Cap Blend': -0.25, 'Large Cap Growth': -0.35, 'Large Cap Value': -0.15,
        'International': -0.20, 'Emerging Markets': -0.30, 'Developed International': -0.20,
        'US Bonds': -0.10, 'TIPS': 0.10, 'Short-Term Treasury': 0.02, 'Long-Term Treasury': -0.20,
        'Corporate Bond': -0.15, 'Technology': -0.30, 'Healthcare': -0.10, 'Financials': -0.20,
        'Real Estate': -0.15, 'Energy': 0.30, 'Gold': 0.25, 'Commodities': 0.35,
        'Small Cap Value': -0.20, 'Small Cap Growth': -0.35, 'Thematic': -0.40,
      },
    },
  ];

  return scenarios.map(scenario => {
    const currentImpact = current.reduce((total, holding) => {
      const impact = scenario.impacts[holding.category] || -0.20;
      return total + impact * (holding.weight / 100);
    }, 0);

    const optimizedImpact = optimized.reduce((total, holding) => {
      const impact = scenario.impacts[holding.category] || -0.20;
      return total + impact * (holding.weight / 100);
    }, 0);

    return {
      scenario: scenario.name,
      description: scenario.description,
      currentPortfolioImpact: currentImpact,
      optimizedPortfolioImpact: optimizedImpact,
    };
  });
}

function generateSummary(
  current: PortfolioMetrics,
  optimized: PortfolioMetrics,
  recommendations: Recommendation[]
): string {
  const returnImprovement = ((optimized.expectedReturn - current.expectedReturn) * 100).toFixed(2);
  const expenseSavings = ((current.expenseRatio - optimized.expenseRatio) * 100).toFixed(3);
  const volatilityChange = ((optimized.volatility - current.volatility) * 100).toFixed(2);
  const sharpeImprovement = (optimized.sharpeRatio - current.sharpeRatio).toFixed(2);

  let summary = '';
  
  if (recommendations.length === 0) {
    summary = 'Your portfolio is already well-optimized. No significant improvements identified.';
  } else {
    summary = `Found ${recommendations.length} optimization${recommendations.length > 1 ? 's' : ''}. `;
    
    if (parseFloat(expenseSavings) > 0.01) {
      summary += `You could save ${expenseSavings}% annually in expense ratios. `;
    }
    
    if (parseFloat(returnImprovement) > 0.5) {
      summary += `Expected return improves by ${returnImprovement}%. `;
    }
    
    if (parseFloat(volatilityChange) < -0.5) {
      summary += `Risk (volatility) decreases by ${Math.abs(parseFloat(volatilityChange))}%. `;
    }
    
    if (parseFloat(sharpeImprovement) > 0.05) {
      summary += `Risk-adjusted return (Sharpe) improves by ${sharpeImprovement}. `;
    }
  }

  return summary.trim();
}
