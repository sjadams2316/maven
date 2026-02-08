import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const BENCHMARKS = {
  'US Equity': 'ITOT',
  'Intl Developed': 'IEFA',
  'Emerging Markets': 'IEMG',
  'US Bonds': 'AGG'
};

function getDb() {
  return new Database(path.join(process.cwd(), 'data', 'funds.db'));
}

function calculateBenchmarkWeights(holdings, fundsMap) {
  const assetClassWeights = {
    'US Equity': 0,
    'Intl Developed': 0,
    'Emerging Markets': 0,
    'US Bonds': 0,
    'Other': 0
  };

  for (const holding of holdings) {
    const fund = fundsMap[holding.ticker];
    if (fund && fund.asset_class) {
      if (fund.asset_class in assetClassWeights) {
        assetClassWeights[fund.asset_class] += holding.weight;
      } else {
        assetClassWeights['Other'] += holding.weight;
      }
    } else {
      assetClassWeights['Other'] += holding.weight;
    }
  }

  const benchmarkWeights = {};
  let totalMapped = 0;

  for (const [assetClass, weight] of Object.entries(assetClassWeights)) {
    if (assetClass !== 'Other' && weight > 0) {
      benchmarkWeights[BENCHMARKS[assetClass]] = weight;
      totalMapped += weight;
    }
  }

  // Normalize
  if (totalMapped > 0 && totalMapped < 1) {
    const scale = 1 / totalMapped;
    for (const ticker in benchmarkWeights) {
      benchmarkWeights[ticker] *= scale;
    }
  }

  return benchmarkWeights;
}

function calculateBenchmarkReturns(benchmarkWeights, benchmarkMap) {
  const periods = ['return_1yr', 'return_3yr', 'return_5yr', 'return_10yr'];
  const blendedReturns = {};

  for (const period of periods) {
    let weightedReturn = 0;
    for (const [ticker, weight] of Object.entries(benchmarkWeights)) {
      const benchmark = benchmarkMap[ticker];
      if (benchmark && benchmark[period] !== null) {
        weightedReturn += benchmark[period] * weight;
      }
    }
    blendedReturns[period] = weightedReturn;
  }

  return blendedReturns;
}

export async function POST(request) {
  try {
    const { portfolioIds } = await request.json();

    if (!portfolioIds || portfolioIds.length === 0) {
      return NextResponse.json({ error: 'Portfolio IDs required' }, { status: 400 });
    }

    const db = getDb();

    // Get all funds as a map
    const allFunds = db.prepare('SELECT * FROM funds').all();
    const fundsMap = {};
    for (const fund of allFunds) {
      fundsMap[fund.ticker] = fund;
    }

    // Get benchmark data
    const benchmarkTickers = Object.values(BENCHMARKS);
    const benchmarkMap = {};
    for (const ticker of benchmarkTickers) {
      if (fundsMap[ticker]) {
        benchmarkMap[ticker] = fundsMap[ticker];
      }
    }

    const comparisons = [];

    for (const portfolioId of portfolioIds) {
      const portfolio = db.prepare('SELECT * FROM portfolios WHERE id = ?').get(portfolioId);
      if (!portfolio) continue;

      const holdings = db.prepare(`
        SELECT ph.*, f.name, f.asset_class, f.expense_ratio, f.return_1yr, f.return_3yr, f.return_5yr, f.return_10yr
        FROM portfolio_holdings ph
        LEFT JOIN funds f ON ph.ticker = f.ticker
        WHERE ph.portfolio_id = ?
      `).all(portfolioId);

      // Calculate metrics
      const metrics = {
        totalWeight: 0,
        weightedExpenseRatio: 0,
        return_1yr: 0,
        return_3yr: 0,
        return_5yr: 0,
        return_10yr: 0,
        assetClassBreakdown: {}
      };

      for (const holding of holdings) {
        const fund = fundsMap[holding.ticker];
        metrics.totalWeight += holding.weight;

        if (fund) {
          if (fund.expense_ratio) {
            metrics.weightedExpenseRatio += fund.expense_ratio * holding.weight;
          }
          if (fund.return_1yr !== null) metrics.return_1yr += fund.return_1yr * holding.weight;
          if (fund.return_3yr !== null) metrics.return_3yr += fund.return_3yr * holding.weight;
          if (fund.return_5yr !== null) metrics.return_5yr += fund.return_5yr * holding.weight;
          if (fund.return_10yr !== null) metrics.return_10yr += fund.return_10yr * holding.weight;

          const assetClass = fund.asset_class || 'Other';
          metrics.assetClassBreakdown[assetClass] = (metrics.assetClassBreakdown[assetClass] || 0) + holding.weight;
        }
      }

      const benchmarkWeights = calculateBenchmarkWeights(holdings, fundsMap);
      const benchmarkReturns = calculateBenchmarkReturns(benchmarkWeights, benchmarkMap);

      const alpha = {
        return_1yr: metrics.return_1yr - benchmarkReturns.return_1yr,
        return_3yr: metrics.return_3yr - benchmarkReturns.return_3yr,
        return_5yr: metrics.return_5yr - benchmarkReturns.return_5yr,
        return_10yr: metrics.return_10yr - benchmarkReturns.return_10yr
      };

      comparisons.push({
        portfolio: { ...portfolio, holdings },
        metrics,
        benchmarkWeights,
        benchmarkReturns,
        alpha
      });
    }

    db.close();

    return NextResponse.json(comparisons);
  } catch (error) {
    console.error('Error comparing portfolios:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
