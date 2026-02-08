#!/usr/bin/env node
/**
 * Comprehensive Fund Data Fetcher
 * Uses yahoo-finance2 v2 API
 */

import YahooFinance from 'yahoo-finance2';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'funds.db');

// Create yahoo finance client
const yf = new YahooFinance();

// ETF universe by asset class
const FUND_UNIVERSE = {
  'US Equity': {
    'SPY': 'SPDR S&P 500 ETF', 'IVV': 'iShares Core S&P 500 ETF', 'VOO': 'Vanguard S&P 500 ETF',
    'VTI': 'Vanguard Total Stock Market ETF', 'ITOT': 'iShares Core S&P Total U.S. Stock ETF',
    'SCHB': 'Schwab U.S. Broad Market ETF', 'QQQ': 'Invesco QQQ Trust', 'QQQM': 'Invesco NASDAQ 100 ETF',
    'VUG': 'Vanguard Growth ETF', 'IWF': 'iShares Russell 1000 Growth ETF',
    'SCHG': 'Schwab U.S. Large-Cap Growth ETF', 'MGK': 'Vanguard Mega Cap Growth ETF',
    'VTV': 'Vanguard Value ETF', 'IWD': 'iShares Russell 1000 Value ETF',
    'SCHV': 'Schwab U.S. Large-Cap Value ETF', 'VO': 'Vanguard Mid-Cap ETF',
    'IJH': 'iShares Core S&P Mid-Cap ETF', 'MDY': 'SPDR S&P MidCap 400 ETF',
    'VB': 'Vanguard Small-Cap ETF', 'IJR': 'iShares Core S&P Small-Cap ETF',
    'IWM': 'iShares Russell 2000 ETF', 'SCHA': 'Schwab U.S. Small-Cap ETF',
    'VIG': 'Vanguard Dividend Appreciation ETF', 'SCHD': 'Schwab U.S. Dividend Equity ETF',
    'VYM': 'Vanguard High Dividend Yield ETF', 'DGRO': 'iShares Core Dividend Growth ETF'
  },
  'Intl Developed': {
    'VEA': 'Vanguard FTSE Developed Markets ETF', 'IEFA': 'iShares Core MSCI EAFE ETF',
    'EFA': 'iShares MSCI EAFE ETF', 'SCHF': 'Schwab International Equity ETF',
    'VGK': 'Vanguard FTSE Europe ETF', 'EWJ': 'iShares MSCI Japan ETF',
    'VXUS': 'Vanguard Total International Stock ETF'
  },
  'Emerging Markets': {
    'VWO': 'Vanguard FTSE Emerging Markets ETF', 'IEMG': 'iShares Core MSCI Emerging Markets ETF',
    'EEM': 'iShares MSCI Emerging Markets ETF', 'SCHE': 'Schwab Emerging Markets Equity ETF',
    'FXI': 'iShares China Large-Cap ETF', 'EWZ': 'iShares MSCI Brazil ETF'
  },
  'US Bonds': {
    'BND': 'Vanguard Total Bond Market ETF', 'AGG': 'iShares Core U.S. Aggregate Bond ETF',
    'SCHZ': 'Schwab U.S. Aggregate Bond ETF', 'IEF': 'iShares 7-10 Year Treasury Bond ETF',
    'TLT': 'iShares 20+ Year Treasury Bond ETF', 'SHY': 'iShares 1-3 Year Treasury Bond ETF',
    'LQD': 'iShares iBoxx $ Investment Grade Corporate Bond ETF',
    'TIP': 'iShares TIPS Bond ETF', 'BIL': 'SPDR Bloomberg 1-3 Month T-Bill ETF'
  },
  'Alternatives': {
    'VNQ': 'Vanguard Real Estate ETF', 'GLD': 'SPDR Gold Shares', 'IAU': 'iShares Gold Trust'
  }
};

async function fetchFundData(ticker, name, assetClass) {
  try {
    const quote = await yf.quote(ticker);
    
    // Extract key data from quote
    const data = {
      ticker,
      name: quote.shortName || quote.longName || name,
      type: 'ETF',
      asset_class: assetClass,
      aum: quote.totalAssets || quote.netAssets || null,
      expense_ratio: quote.annualReportExpenseRatio || null,
      return_1yr: quote.fiftyTwoWeekChangePercent ? quote.fiftyTwoWeekChangePercent * 100 : null,
      return_3yr: null, // Would need historical calc
      return_5yr: null,
      return_10yr: null,
      std_dev_3yr: null, // Would need historical calc  
      sharpe_ratio: null,
      yield_ttm: quote.trailingAnnualDividendYield ? quote.trailingAnnualDividendYield * 100 : null,
      price: quote.regularMarketPrice,
      market_cap: quote.marketCap
    };

    return data;
  } catch (error) {
    console.error(`  ✗ ${ticker}: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🚀 Starting fund data fetch...\n');

  const db = new Database(DB_PATH);

  // Recreate table
  db.exec(`DROP TABLE IF EXISTS funds_new`);
  db.exec(`
    CREATE TABLE funds_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticker TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'ETF',
      asset_class TEXT,
      aum REAL,
      expense_ratio REAL,
      return_1yr REAL,
      return_3yr REAL,
      return_5yr REAL,
      return_10yr REAL,
      std_dev_3yr REAL,
      sharpe_ratio REAL,
      yield_ttm REAL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO funds_new 
    (ticker, name, type, asset_class, aum, expense_ratio, return_1yr, return_3yr, 
     return_5yr, return_10yr, std_dev_3yr, sharpe_ratio, yield_ttm, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  let total = 0, success = 0;

  for (const [assetClass, funds] of Object.entries(FUND_UNIVERSE)) {
    console.log(`\n📊 ${assetClass}:`);

    for (const [ticker, name] of Object.entries(funds)) {
      total++;
      const data = await fetchFundData(ticker, name, assetClass);

      if (data) {
        insertStmt.run(
          data.ticker, data.name, data.type, data.asset_class,
          data.aum, data.expense_ratio, data.return_1yr, data.return_3yr,
          data.return_5yr, data.return_10yr, data.std_dev_3yr, data.sharpe_ratio, data.yield_ttm
        );
        success++;
        console.log(`  ✓ ${ticker}: ${data.return_1yr?.toFixed(1) || '?'}% 1yr, $${data.aum ? (data.aum/1e9).toFixed(1) + 'B' : '?'}`);
      }

      await new Promise(r => setTimeout(r, 250));
    }
  }

  // Swap tables
  try {
    db.exec(`DROP TABLE IF EXISTS funds_old`);
    db.exec(`ALTER TABLE funds RENAME TO funds_old`);
  } catch (e) { /* No existing funds table */ }
  
  db.exec(`ALTER TABLE funds_new RENAME TO funds`);
  
  try { db.exec(`DROP TABLE IF EXISTS funds_old`); } catch (e) {}

  // Create portfolio tables if needed
  db.exec(`
    CREATE TABLE IF NOT EXISTS portfolios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS portfolio_holdings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      portfolio_id INTEGER,
      ticker TEXT NOT NULL,
      weight REAL NOT NULL,
      FOREIGN KEY (portfolio_id) REFERENCES portfolios(id)
    )
  `);

  db.close();

  console.log(`\n✅ Done: ${success}/${total} funds loaded`);
}

main().catch(console.error);
