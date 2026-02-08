import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

// Import Markowitz utilities (inline for Next.js compatibility)
const CORRELATIONS = {
  'US Equity': { 'US Equity': 1.00, 'Intl Developed': 0.82, 'Emerging Markets': 0.72, 'US Bonds': 0.03, 'International Bonds': 0.15, 'Alternatives': 0.55 },
  'Intl Developed': { 'US Equity': 0.82, 'Intl Developed': 1.00, 'Emerging Markets': 0.80, 'US Bonds': 0.08, 'International Bonds': 0.35, 'Alternatives': 0.50 },
  'Emerging Markets': { 'US Equity': 0.72, 'Intl Developed': 0.80, 'Emerging Markets': 1.00, 'US Bonds': 0.10, 'International Bonds': 0.30, 'Alternatives': 0.45 },
  'US Bonds': { 'US Equity': 0.03, 'Intl Developed': 0.08, 'Emerging Markets': 0.10, 'US Bonds': 1.00, 'International Bonds': 0.65, 'Alternatives': 0.15 },
  'International Bonds': { 'US Equity': 0.15, 'Intl Developed': 0.35, 'Emerging Markets': 0.30, 'US Bonds': 0.65, 'International Bonds': 1.00, 'Alternatives': 0.20 },
  'Alternatives': { 'US Equity': 0.55, 'Intl Developed': 0.50, 'Emerging Markets': 0.45, 'US Bonds': 0.15, 'International Bonds': 0.20, 'Alternatives': 1.00 }
};

const DEFAULT_CMA = {
  'US Equity': { expectedReturn: 7.0, volatility: 16.5 },
  'Intl Developed': { expectedReturn: 7.5, volatility: 18.0 },
  'Emerging Markets': { expectedReturn: 8.5, volatility: 24.0 },
  'US Bonds': { expectedReturn: 4.5, volatility: 5.5 },
  'International Bonds': { expectedReturn: 4.0, volatility: 7.0 },
  'Alternatives': { expectedReturn: 6.0, volatility: 14.0 }
};

const RISK_FREE_RATE = 5.0;

// Historical events for backtesting context
const HISTORICAL_EVENTS = {
  gfc_2008: { name: '2008-09 Financial Crisis', impacts: { 'US Equity': -52, 'Intl Developed': -56, 'Emerging Markets': -61, 'US Bonds': 5 }, recovery: '4 years', lesson: 'Bonds provided crucial cushion; staying invested was rewarded' },
  covid_2020: { name: '2020 COVID Crash', impacts: { 'US Equity': -34, 'Intl Developed': -33, 'Emerging Markets': -32, 'US Bonds': 3.5 }, recovery: '5 months', lesson: 'Fastest recovery ever — panic selling locked in losses' },
  rate_shock_2022: { name: '2022 Rate Shock', impacts: { 'US Equity': -19, 'Intl Developed': -16, 'Emerging Markets': -22, 'US Bonds': -13 }, recovery: '2 years', lesson: 'Rare year when both stocks AND bonds fell together' },
  bull_2023_2024: { name: '2023-24 Bull Market', impacts: { 'US Equity': 52, 'Intl Developed': 22, 'Emerging Markets': 15, 'US Bonds': 8 }, recovery: 'N/A', lesson: 'AI/Mag-7 drove unprecedented US outperformance vs rest of world' },
  dotcom_2000: { name: '2000-02 Dot-Com Bust', impacts: { 'US Equity': -45, 'Intl Developed': -48, 'Emerging Markets': -35, 'US Bonds': 32 }, recovery: '7 years', lesson: 'Bonds soared while stocks crashed — diversification matters' },
  stagflation_70s: { name: '1973-74 Stagflation', impacts: { 'US Equity': -48, 'Intl Developed': -42, 'Emerging Markets': -30, 'US Bonds': -5 }, recovery: '8 years', lesson: 'Real assets (gold, commodities) outperformed paper assets' }
};

// Asset manager model portfolios for comparison
const MODEL_PORTFOLIOS = {
  blackrock_moderate: { manager: 'BlackRock', name: 'Moderate', allocation: { 'US Equity': 0.40, 'Intl Developed': 0.10, 'Emerging Markets': 0.05, 'US Bonds': 0.45 } },
  blackrock_growth: { manager: 'BlackRock', name: 'Growth', allocation: { 'US Equity': 0.55, 'Intl Developed': 0.15, 'Emerging Markets': 0.05, 'US Bonds': 0.25 } },
  vanguard_moderate: { manager: 'Vanguard', name: 'LifeStrategy Moderate', allocation: { 'US Equity': 0.40, 'Intl Developed': 0.15, 'Emerging Markets': 0.05, 'US Bonds': 0.40 } },
  vanguard_growth: { manager: 'Vanguard', name: 'LifeStrategy Growth', allocation: { 'US Equity': 0.55, 'Intl Developed': 0.20, 'Emerging Markets': 0.05, 'US Bonds': 0.20 } },
  fidelity_balanced: { manager: 'Fidelity', name: 'Balanced', allocation: { 'US Equity': 0.45, 'Intl Developed': 0.12, 'Emerging Markets': 0.03, 'US Bonds': 0.40 } },
  capitalgroup_growth: { manager: 'Capital Group', name: 'Growth', allocation: { 'US Equity': 0.50, 'Intl Developed': 0.20, 'Emerging Markets': 0.10, 'US Bonds': 0.20 } },
  jpmorgan_balanced: { manager: 'JP Morgan', name: 'Balanced', allocation: { 'US Equity': 0.45, 'Intl Developed': 0.10, 'Emerging Markets': 0.05, 'US Bonds': 0.40 } },
  schwab_growth: { manager: 'Schwab', name: 'Aggressive', allocation: { 'US Equity': 0.60, 'Intl Developed': 0.20, 'Emerging Markets': 0.10, 'US Bonds': 0.10 } }
};

// Scoring weights
const SCORING_WEIGHTS = {
  riskAdjustedReturn: 0.30,
  expenseRatio: 0.25,
  consistency: 0.15,
  trackingPrecision: 0.15,
  liquidity: 0.15
};

// Benchmark returns by asset class
const BENCHMARKS = {
  'US Equity': { return_1yr: 25, return_3yr: 10, return_5yr: 14, volatility: 16.5 },
  'Intl Developed': { return_1yr: 12, return_3yr: 5, return_5yr: 7.5, volatility: 18.0 },
  'Emerging Markets': { return_1yr: 10, return_3yr: -1, return_5yr: 4, volatility: 24.0 },
  'US Bonds': { return_1yr: 3, return_3yr: -2.5, return_5yr: 0.8, volatility: 5.5 },
  'International Bonds': { return_1yr: 2, return_3yr: -3, return_5yr: -0.5, volatility: 7.0 },
  'Alternatives': { return_1yr: 8, return_3yr: 4, return_5yr: 6, volatility: 14.0 }
};

function getDb() {
  return new Database(path.join(process.cwd(), 'data', 'funds.db'));
}

function portfolioVolatility(weights, cma = DEFAULT_CMA) {
  const assets = Object.keys(weights);
  let variance = 0;
  for (const asset1 of assets) {
    for (const asset2 of assets) {
      const w1 = weights[asset1] || 0;
      const w2 = weights[asset2] || 0;
      const vol1 = (cma[asset1]?.volatility || 15) / 100;
      const vol2 = (cma[asset2]?.volatility || 15) / 100;
      const corr = CORRELATIONS[asset1]?.[asset2] ?? 0.5;
      variance += w1 * w2 * vol1 * vol2 * corr;
    }
  }
  return Math.sqrt(variance) * 100;
}

function portfolioReturn(weights, cma = DEFAULT_CMA) {
  return Object.entries(weights).reduce((sum, [asset, weight]) => {
    return sum + weight * (cma[asset]?.expectedReturn || 6);
  }, 0);
}

function scoreFund(fund, assetClass) {
  const benchmark = BENCHMARKS[assetClass] || BENCHMARKS['US Equity'];
  const scores = {};

  // 1. Risk-Adjusted Return (Sharpe proxy)
  const vol = fund.std_dev_3yr || benchmark.volatility;
  const excessReturn = (fund.return_1yr || 0) - RISK_FREE_RATE;
  const sharpe = vol > 0 ? excessReturn / vol : 0;
  scores.riskAdjustedReturn = Math.max(0, Math.min(100, (sharpe + 0.5) * 40));

  // 2. Expense Ratio (lower is much better)
  const er = fund.expense_ratio || 0.01;
  scores.expenseRatio = Math.max(0, 100 - (er * 15000)); // 0.03% = 95.5, 0.1% = 85, 0.5% = 25

  // 3. Consistency (variance across time periods)
  const returns = [fund.return_1yr, fund.return_3yr, fund.return_5yr, fund.return_10yr].filter(r => r !== null && r !== undefined);
  if (returns.length >= 2) {
    const avg = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avg, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    scores.consistency = Math.max(0, 100 - stdDev * 3);
  } else {
    scores.consistency = 50;
  }

  // 4. Tracking Precision (how close to benchmark)
  if (fund.return_1yr && benchmark.return_1yr) {
    const trackingError = Math.abs(fund.return_1yr - benchmark.return_1yr);
    scores.trackingPrecision = Math.max(0, 100 - trackingError * 3);
  } else {
    scores.trackingPrecision = 50;
  }

  // 5. Liquidity (based on AUM)
  const aum = fund.aum || 0;
  if (aum >= 50000000000) scores.liquidity = 100;
  else if (aum >= 10000000000) scores.liquidity = 90;
  else if (aum >= 1000000000) scores.liquidity = 75;
  else if (aum >= 100000000) scores.liquidity = 60;
  else scores.liquidity = 40;

  // Weighted total score
  const totalScore =
    scores.riskAdjustedReturn * SCORING_WEIGHTS.riskAdjustedReturn +
    scores.expenseRatio * SCORING_WEIGHTS.expenseRatio +
    scores.consistency * SCORING_WEIGHTS.consistency +
    scores.trackingPrecision * SCORING_WEIGHTS.trackingPrecision +
    scores.liquidity * SCORING_WEIGHTS.liquidity;

  return { ...fund, scores, totalScore, rank: 0 };
}

function generateReasoning(selected, allFunds, assetClass) {
  const reasons = [];
  const er = selected.expense_ratio || 0;

  // Expense ratio reasoning
  if (er <= 0.0005) {
    reasons.push(`Ultra-low expense ratio (${(er * 100).toFixed(3)}%) — among the cheapest in class`);
  } else if (er <= 0.002) {
    reasons.push(`Very low expense ratio (${(er * 100).toFixed(2)}%) — keeps more returns for you`);
  } else if (er <= 0.005) {
    reasons.push(`Competitive expense ratio (${(er * 100).toFixed(2)}%)`);
  }

  // Return reasoning
  if (selected.return_1yr > BENCHMARKS[assetClass]?.return_1yr * 1.05) {
    reasons.push(`Outperformed benchmark by ${(selected.return_1yr - BENCHMARKS[assetClass].return_1yr).toFixed(1)}% over past year`);
  } else if (selected.return_1yr >= BENCHMARKS[assetClass]?.return_1yr * 0.98) {
    reasons.push(`Closely tracked benchmark (${selected.return_1yr?.toFixed(1)}% vs ${BENCHMARKS[assetClass].return_1yr}%)`);
  }

  // Consistency reasoning
  if (selected.scores.consistency >= 80) {
    reasons.push('Highly consistent returns across 1Y, 3Y, 5Y periods');
  }

  // Liquidity reasoning
  if (selected.aum >= 50000000000) {
    reasons.push(`Massive AUM ($${(selected.aum / 1e9).toFixed(0)}B) — excellent liquidity`);
  } else if (selected.aum >= 10000000000) {
    reasons.push(`Large AUM ($${(selected.aum / 1e9).toFixed(1)}B) — very liquid`);
  }

  // Sharpe reasoning
  if (selected.sharpe_ratio && selected.sharpe_ratio > 0.5) {
    reasons.push(`Strong risk-adjusted returns (Sharpe: ${selected.sharpe_ratio.toFixed(2)})`);
  }

  // Ranking reasoning
  if (allFunds.length > 1) {
    const margin = selected.totalScore - allFunds[1].totalScore;
    if (margin > 8) {
      reasons.push(`Clear winner — ${margin.toFixed(1)} pts ahead of runner-up`);
    } else if (margin > 3) {
      reasons.push(`Top choice, narrowly beating ${allFunds[1].ticker}`);
    }
  }

  return reasons.length > 0 ? reasons : ['Best overall score in this asset class'];
}

function generatePortfolioExplanations(allocation, portfolio, metrics) {
  const explanations = {
    allocation: [],
    optimization: [],
    rearview: [],
    forward: [],
    risks: []
  };

  const totalEquity = (allocation['US Equity'] || 0) + (allocation['Intl Developed'] || 0) + (allocation['Emerging Markets'] || 0);
  const totalBonds = (allocation['US Bonds'] || 0) + (allocation['International Bonds'] || 0);
  const intlEquity = (allocation['Intl Developed'] || 0) + (allocation['Emerging Markets'] || 0);

  // === ALLOCATION INSIGHTS ===
  if (totalEquity >= 0.80) {
    explanations.allocation.push({
      type: 'aggressive',
      icon: '🚀',
      text: `Aggressive allocation: ${(totalEquity * 100).toFixed(0)}% equities — positioned for maximum long-term growth`,
      detail: 'Best for investors with 15+ year horizons who can stomach significant volatility'
    });
  } else if (totalEquity >= 0.60) {
    explanations.allocation.push({
      type: 'growth',
      icon: '📈',
      text: `Growth allocation: ${(totalEquity * 100).toFixed(0)}% equities / ${(totalBonds * 100).toFixed(0)}% bonds`,
      detail: 'Balanced approach suitable for 10-15 year horizons'
    });
  } else if (totalEquity >= 0.40) {
    explanations.allocation.push({
      type: 'moderate',
      icon: '⚖️',
      text: `Moderate allocation: ${(totalEquity * 100).toFixed(0)}% equities / ${(totalBonds * 100).toFixed(0)}% bonds`,
      detail: 'Reduced volatility, suitable for 7-10 year horizons or lower risk tolerance'
    });
  } else {
    explanations.allocation.push({
      type: 'conservative',
      icon: '🛡️',
      text: `Conservative allocation: ${(totalBonds * 100).toFixed(0)}% in bonds`,
      detail: 'Focus on capital preservation — lower growth but more stability'
    });
  }

  // International diversification
  if (totalEquity > 0) {
    const intlPct = intlEquity / totalEquity;
    if (intlPct >= 0.30) {
      explanations.allocation.push({
        type: 'positive',
        icon: '🌍',
        text: `Strong international diversification: ${(intlPct * 100).toFixed(0)}% of equity is non-US`,
        detail: 'Reduces home country bias and captures global growth opportunities'
      });
    } else if (intlPct >= 0.20) {
      explanations.allocation.push({
        type: 'info',
        icon: '🌐',
        text: `Moderate international exposure: ${(intlPct * 100).toFixed(0)}% of equity outside US`,
        detail: 'Good diversification; could consider more if seeking higher expected returns'
      });
    } else if (intlPct > 0) {
      explanations.allocation.push({
        type: 'caution',
        icon: '🇺🇸',
        text: `Heavy US concentration: Only ${(intlPct * 100).toFixed(0)}% international equity`,
        detail: 'US has outperformed recently, but valuations are stretched vs rest of world'
      });
    }
  }

  // === OPTIMIZATION INSIGHTS ===
  if (metrics.sharpeRatio > 0.5) {
    explanations.optimization.push({
      type: 'positive',
      icon: '✅',
      text: `Strong risk-adjusted efficiency: Sharpe ratio of ${metrics.sharpeRatio.toFixed(2)}`,
      detail: 'Above 0.5 is considered good; you\'re getting solid return per unit of risk'
    });
  } else if (metrics.sharpeRatio > 0.3) {
    explanations.optimization.push({
      type: 'info',
      icon: '📊',
      text: `Acceptable risk-adjusted returns: Sharpe ratio of ${metrics.sharpeRatio.toFixed(2)}`,
      detail: 'Room for improvement, but not significantly suboptimal'
    });
  }

  explanations.optimization.push({
    type: 'info',
    icon: '💰',
    text: `Portfolio-weighted expense ratio: ${(metrics.weightedExpenseRatio * 100).toFixed(3)}%`,
    detail: `This costs you ~$${(metrics.weightedExpenseRatio * 100000).toFixed(0)}/year per $100K invested`
  });

  // === REARVIEW MIRROR (Historical Context) ===
  for (const [id, event] of Object.entries(HISTORICAL_EVENTS)) {
    let impact = 0;
    for (const [ac, weight] of Object.entries(allocation)) {
      impact += (event.impacts[ac] || 0) * weight;
    }
    
    if (Math.abs(impact) > 8) {
      explanations.rearview.push({
        type: impact > 0 ? 'positive' : 'negative',
        icon: impact > 0 ? '📈' : '📉',
        scenario: event.name,
        impact: impact,
        text: `${event.name}: Would have ${impact > 0 ? 'gained' : 'declined'} ${Math.abs(impact).toFixed(1)}%`,
        detail: event.lesson,
        recovery: event.recovery
      });
    }
  }

  // === FORWARD LOOKING ===
  const expectedReturn = portfolioReturn(allocation, DEFAULT_CMA);
  const volatility = portfolioVolatility(allocation, DEFAULT_CMA);

  explanations.forward.push({
    type: 'projection',
    icon: '🎯',
    text: `Expected annual return: ${expectedReturn.toFixed(1)}% | Volatility: ${volatility.toFixed(1)}%`,
    detail: 'Based on consensus capital market assumptions from BlackRock, Vanguard, JP Morgan'
  });

  // Time to double
  const yearsToDouble = expectedReturn > 0 ? 72 / expectedReturn : Infinity;
  explanations.forward.push({
    type: 'info',
    icon: '⏱️',
    text: `Investment doubles in ~${yearsToDouble.toFixed(0)} years at expected return`,
    detail: `$100K → $200K by ${2025 + Math.round(yearsToDouble)}`
  });

  // Real return
  const realReturn = expectedReturn - 2.5;
  explanations.forward.push({
    type: 'info',
    icon: '📏',
    text: `Real return after 2.5% inflation: ${realReturn.toFixed(1)}%`,
    detail: 'This is your true purchasing power growth'
  });

  // Asset manager consensus
  if (totalEquity > 0.5 && intlEquity / totalEquity < 0.25) {
    explanations.forward.push({
      type: 'opportunity',
      icon: '💡',
      text: 'Most asset managers see better value outside the US',
      detail: 'Vanguard, BlackRock, JP Morgan all suggest higher international allocation for 2025'
    });
  }

  if (totalBonds >= 0.15) {
    explanations.forward.push({
      type: 'positive',
      icon: '🏦',
      text: `Bonds yield ~5% — highest in 15+ years`,
      detail: 'Starting yields this high historically support strong bond returns'
    });
  }

  // === RISKS ===
  const maxDrawdown = volatility * 3;
  explanations.risks.push({
    type: 'warning',
    icon: '⚠️',
    text: `Estimated max drawdown: -${maxDrawdown.toFixed(0)}% in severe market stress`,
    detail: 'Based on historical relationship between volatility and drawdowns'
  });

  if (totalEquity > 0.7) {
    explanations.risks.push({
      type: 'caution',
      icon: '🎢',
      text: 'High equity exposure means expect significant swings',
      detail: `In most years, expect returns between -${(volatility * 2).toFixed(0)}% and +${(expectedReturn + volatility * 2).toFixed(0)}%`
    });
  }

  if (allocation['Emerging Markets'] > 0.10) {
    explanations.risks.push({
      type: 'info',
      icon: '🌏',
      text: `Emerging Markets (${(allocation['Emerging Markets'] * 100).toFixed(0)}%) add volatility and currency risk`,
      detail: 'Higher expected returns come with political/currency risks'
    });
  }

  return explanations;
}

export async function POST(request) {
  try {
    const { allocation, preferences = {} } = await request.json();

    if (!allocation || Object.keys(allocation).length === 0) {
      return NextResponse.json({ error: 'Allocation required' }, { status: 400 });
    }

    const db = getDb();
    const results = {};
    const portfolio = [];

    for (const [assetClass, weight] of Object.entries(allocation)) {
      if (weight <= 0) continue;

      // Build query
      let query = `SELECT * FROM funds WHERE asset_class = ?`;
      const params = [assetClass];

      // Check if table has aum column and filter
      try {
        const sample = db.prepare('SELECT aum FROM funds LIMIT 1').get();
        if (sample !== undefined) {
          query += ' AND (aum >= 100000000 OR aum IS NULL)';
        }
      } catch (e) {
        // Column doesn't exist
      }

      if (preferences.preferETF) {
        query += " AND type = 'ETF'";
      }
      if (preferences.maxExpenseRatio) {
        query += ' AND expense_ratio <= ?';
        params.push(preferences.maxExpenseRatio);
      }

      const funds = db.prepare(query).all(...params);

      if (funds.length === 0) {
        results[assetClass] = { weight, funds: [], selected: null, message: 'No funds found for this asset class' };
        continue;
      }

      // Score and rank
      const scoredFunds = funds.map(f => scoreFund(f, assetClass));
      scoredFunds.sort((a, b) => b.totalScore - a.totalScore);
      scoredFunds.forEach((f, i) => f.rank = i + 1);

      const selected = scoredFunds[0];

      results[assetClass] = {
        weight,
        fundsAnalyzed: scoredFunds.length,
        topFunds: scoredFunds.slice(0, 5),
        selected: {
          ticker: selected.ticker,
          name: selected.name,
          type: selected.type,
          expense_ratio: selected.expense_ratio,
          aum: selected.aum,
          return_1yr: selected.return_1yr,
          return_3yr: selected.return_3yr,
          return_5yr: selected.return_5yr,
          return_10yr: selected.return_10yr,
          std_dev_3yr: selected.std_dev_3yr,
          sharpe_ratio: selected.sharpe_ratio,
          totalScore: selected.totalScore,
          scores: selected.scores,
          reasoning: generateReasoning(selected, scoredFunds, assetClass)
        }
      };

      portfolio.push({
        ticker: selected.ticker,
        name: selected.name,
        weight,
        assetClass,
        expenseRatio: selected.expense_ratio
      });
    }

    // Calculate metrics
    const expectedReturn = portfolioReturn(allocation, DEFAULT_CMA);
    const volatility = portfolioVolatility(allocation, DEFAULT_CMA);
    const sharpeRatio = volatility > 0 ? (expectedReturn - RISK_FREE_RATE) / volatility : 0;
    const weightedExpenseRatio = portfolio.reduce((sum, p) => sum + (p.expenseRatio || 0) * p.weight, 0);

    const portfolioMetrics = {
      expectedReturn,
      volatility,
      sharpeRatio,
      weightedExpenseRatio,
      totalWeight: portfolio.reduce((sum, p) => sum + p.weight, 0)
    };

    // Model portfolio comparisons
    const modelComparisons = Object.entries(MODEL_PORTFOLIOS).map(([id, model]) => {
      let totalDiff = 0;
      const diffs = {};
      for (const ac of ['US Equity', 'Intl Developed', 'Emerging Markets', 'US Bonds']) {
        const diff = (allocation[ac] || 0) - (model.allocation[ac] || 0);
        diffs[ac] = diff;
        totalDiff += Math.abs(diff);
      }
      return { id, ...model, diffs, similarity: Math.max(0, 100 - totalDiff * 50) };
    }).sort((a, b) => b.similarity - a.similarity);

    // Generate comprehensive explanations
    const explanations = generatePortfolioExplanations(allocation, portfolio, portfolioMetrics);

    db.close();

    return NextResponse.json({
      allocation,
      results,
      portfolio,
      portfolioMetrics,
      scoringWeights: SCORING_WEIGHTS,
      explanations,
      modelComparisons: modelComparisons.slice(0, 5),
      closestModel: modelComparisons[0],
      cma: DEFAULT_CMA,
      riskFreeRate: RISK_FREE_RATE
    });
  } catch (error) {
    console.error('Auto-optimize error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
