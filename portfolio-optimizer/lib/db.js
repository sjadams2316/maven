const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(process.cwd(), 'data', 'funds.db'));

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS funds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'ETF' or 'MF'
    aum REAL,
    expense_ratio REAL,
    inception_date TEXT,
    category TEXT,
    asset_class TEXT, -- 'US Equity', 'Intl Developed', 'Emerging Markets', 'US Bonds', 'Other'
    return_1yr REAL,
    return_3yr REAL,
    return_5yr REAL,
    return_10yr REAL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS portfolios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS portfolio_holdings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    portfolio_id INTEGER NOT NULL,
    ticker TEXT NOT NULL,
    weight REAL NOT NULL, -- as decimal (0.25 = 25%)
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_funds_aum ON funds(aum);
  CREATE INDEX IF NOT EXISTS idx_funds_asset_class ON funds(asset_class);
`);

module.exports = db;
