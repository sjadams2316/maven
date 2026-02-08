const db = require('./db');
const { calculateBenchmarkWeights, calculateBenchmarkReturns, BENCHMARKS } = require('./benchmarks');

// Get all funds matching criteria
function getFunds(filters = {}) {
  let query = 'SELECT * FROM funds WHERE 1=1';
  const params = [];

  if (filters.minAum) {
    query += ' AND aum >= ?';
    params.push(filters.minAum);
  }
  if (filters.minTrackRecord) {
    query += ' AND inception_date <= date("now", ? || " years")';
    params.push(-filters.minTrackRecord);
  }
  if (filters.assetClass) {
    query += ' AND asset_class = ?';
    params.push(filters.assetClass);
  }
  if (filters.type) {
    query += ' AND type = ?';
    params.push(filters.type);
  }
  if (filters.search) {
    query += ' AND (ticker LIKE ? OR name LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  query += ' ORDER BY aum DESC';
  
  if (filters.limit) {
    query += ' LIMIT ?';
    params.push(filters.limit);
  }

  return db.prepare(query).all(...params);
}

// Get benchmark ETF data
function getBenchmarkData() {
  const tickers = Object.values(BENCHMARKS);
  const placeholders = tickers.map(() => '?').join(',');
  return db.prepare(`SELECT * FROM funds WHERE ticker IN (${placeholders})`).all(...tickers);
}

// Create a new portfolio
function createPortfolio(name, holdings) {
  const insertPortfolio = db.prepare('INSERT INTO portfolios (name) VALUES (?)');
  const insertHolding = db.prepare('INSERT INTO portfolio_holdings (portfolio_id, ticker, weight) VALUES (?, ?, ?)');

  const result = insertPortfolio.run(name);
  const portfolioId = result.lastInsertRowid;

  for (const holding of holdings) {
    insertHolding.run(portfolioId, holding.ticker, holding.weight);
  }

  return portfolioId;
}

// Get portfolio by ID
function getPortfolio(portfolioId) {
  const portfolio = db.prepare('SELECT * FROM portfolios WHERE id = ?').get(portfolioId);
  if (!portfolio) return null;

  const holdings = db.prepare(`
    SELECT ph.*, f.name, f.asset_class, f.expense_ratio, f.return_1yr, f.return_3yr, f.return_5yr, f.return_10yr
    FROM portfolio_holdings ph
    LEFT JOIN funds f ON ph.ticker = f.ticker
    WHERE ph.portfolio_id = ?
  `).all(portfolioId);

  return { ...portfolio, holdings };
}

// Get all portfolios
function getAllPortfolios() {
  return db.prepare('SELECT * FROM portfolios ORDER BY created_at DESC').all();
}

// Delete portfolio
function deletePortfolio(portfolioId) {
  db.prepare('DELETE FROM portfolios WHERE id = ?').run(portfolioId);
}

// Calculate portfolio metrics
function calculatePortfolioMetrics(holdings, fundsData) {
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
    const fund = fundsData.find(f => f.ticker === holding.ticker);
    if (!fund) continue;

    metrics.totalWeight += holding.weight;
    
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

  return metrics;
}

// Compare multiple portfolios with benchmark
function comparePortfolios(portfolioIds) {
  const fundsData = getFunds();
  const benchmarkData = getBenchmarkData();
  
  const comparisons = [];

  for (const id of portfolioIds) {
    const portfolio = getPortfolio(id);
    if (!portfolio) continue;

    const metrics = calculatePortfolioMetrics(portfolio.holdings, fundsData);
    const benchmarkWeights = calculateBenchmarkWeights(portfolio.holdings, fundsData);
    const benchmarkReturns = calculateBenchmarkReturns(benchmarkWeights, benchmarkData);

    // Calculate alpha (portfolio return - benchmark return)
    const alpha = {
      return_1yr: metrics.return_1yr - benchmarkReturns.return_1yr,
      return_3yr: metrics.return_3yr - benchmarkReturns.return_3yr,
      return_5yr: metrics.return_5yr - benchmarkReturns.return_5yr,
      return_10yr: metrics.return_10yr - benchmarkReturns.return_10yr
    };

    comparisons.push({
      portfolio,
      metrics,
      benchmarkWeights,
      benchmarkReturns,
      alpha
    });
  }

  return comparisons;
}

module.exports = {
  getFunds,
  getBenchmarkData,
  createPortfolio,
  getPortfolio,
  getAllPortfolios,
  deletePortfolio,
  calculatePortfolioMetrics,
  comparePortfolios
};
