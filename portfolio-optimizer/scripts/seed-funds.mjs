import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const dataDir = path.join(projectRoot, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'funds.db'));

db.exec(`
  DROP TABLE IF EXISTS funds;
  CREATE TABLE funds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    aum REAL,
    expense_ratio REAL,
    inception_date TEXT,
    category TEXT,
    asset_class TEXT,
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
    weight REAL NOT NULL,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
  );
`);

// Sample fund data (based on recent market data)
const funds = [
  // BENCHMARK ETFs
  { ticker: 'ITOT', name: 'iShares Core S&P Total U.S. Stock Market ETF', type: 'ETF', aum: 58000000000, expense_ratio: 0.0003, asset_class: 'US Equity', return_1yr: 26.5, return_3yr: 9.2, return_5yr: 14.8, return_10yr: 12.1 },
  { ticker: 'IEFA', name: 'iShares Core MSCI EAFE ETF', type: 'ETF', aum: 115000000000, expense_ratio: 0.0007, asset_class: 'Intl Developed', return_1yr: 11.2, return_3yr: 4.8, return_5yr: 7.5, return_10yr: 5.2 },
  { ticker: 'IEMG', name: 'iShares Core MSCI Emerging Markets ETF', type: 'ETF', aum: 82000000000, expense_ratio: 0.0009, asset_class: 'Emerging Markets', return_1yr: 8.5, return_3yr: -2.1, return_5yr: 4.2, return_10yr: 3.8 },
  { ticker: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF', type: 'ETF', aum: 110000000000, expense_ratio: 0.0003, asset_class: 'US Bonds', return_1yr: 2.1, return_3yr: -2.8, return_5yr: 0.5, return_10yr: 1.8 },
  
  // US EQUITY ETFs
  { ticker: 'SPY', name: 'SPDR S&P 500 ETF Trust', type: 'ETF', aum: 560000000000, expense_ratio: 0.0009, asset_class: 'US Equity', return_1yr: 27.2, return_3yr: 10.5, return_5yr: 15.2, return_10yr: 12.8 },
  { ticker: 'VOO', name: 'Vanguard S&P 500 ETF', type: 'ETF', aum: 450000000000, expense_ratio: 0.0003, asset_class: 'US Equity', return_1yr: 27.3, return_3yr: 10.6, return_5yr: 15.3, return_10yr: 12.9 },
  { ticker: 'IVV', name: 'iShares Core S&P 500 ETF', type: 'ETF', aum: 480000000000, expense_ratio: 0.0003, asset_class: 'US Equity', return_1yr: 27.2, return_3yr: 10.5, return_5yr: 15.2, return_10yr: 12.8 },
  { ticker: 'VTI', name: 'Vanguard Total Stock Market ETF', type: 'ETF', aum: 420000000000, expense_ratio: 0.0003, asset_class: 'US Equity', return_1yr: 26.8, return_3yr: 9.8, return_5yr: 14.9, return_10yr: 12.3 },
  { ticker: 'QQQ', name: 'Invesco QQQ Trust', type: 'ETF', aum: 290000000000, expense_ratio: 0.002, asset_class: 'US Equity', return_1yr: 32.5, return_3yr: 12.1, return_5yr: 19.8, return_10yr: 18.2 },
  { ticker: 'VUG', name: 'Vanguard Growth ETF', type: 'ETF', aum: 125000000000, expense_ratio: 0.0004, asset_class: 'US Equity', return_1yr: 35.2, return_3yr: 11.8, return_5yr: 18.5, return_10yr: 15.1 },
  { ticker: 'VTV', name: 'Vanguard Value ETF', type: 'ETF', aum: 118000000000, expense_ratio: 0.0004, asset_class: 'US Equity', return_1yr: 18.5, return_3yr: 8.2, return_5yr: 11.2, return_10yr: 10.1 },
  { ticker: 'IJH', name: 'iShares Core S&P Mid-Cap ETF', type: 'ETF', aum: 85000000000, expense_ratio: 0.0005, asset_class: 'US Equity', return_1yr: 22.1, return_3yr: 7.5, return_5yr: 12.8, return_10yr: 10.5 },
  { ticker: 'IJR', name: 'iShares Core S&P Small-Cap ETF', type: 'ETF', aum: 82000000000, expense_ratio: 0.0006, asset_class: 'US Equity', return_1yr: 18.8, return_3yr: 4.2, return_5yr: 10.5, return_10yr: 9.2 },
  { ticker: 'IWM', name: 'iShares Russell 2000 ETF', type: 'ETF', aum: 75000000000, expense_ratio: 0.0019, asset_class: 'US Equity', return_1yr: 17.5, return_3yr: 3.8, return_5yr: 9.8, return_10yr: 8.5 },
  { ticker: 'SCHD', name: 'Schwab U.S. Dividend Equity ETF', type: 'ETF', aum: 62000000000, expense_ratio: 0.0006, asset_class: 'US Equity', return_1yr: 15.2, return_3yr: 8.5, return_5yr: 12.8, return_10yr: 11.5 },
  { ticker: 'VIG', name: 'Vanguard Dividend Appreciation ETF', type: 'ETF', aum: 85000000000, expense_ratio: 0.0006, asset_class: 'US Equity', return_1yr: 18.2, return_3yr: 9.1, return_5yr: 12.5, return_10yr: 11.2 },
  
  // INTERNATIONAL ETFs
  { ticker: 'VEA', name: 'Vanguard FTSE Developed Markets ETF', type: 'ETF', aum: 145000000000, expense_ratio: 0.0005, asset_class: 'Intl Developed', return_1yr: 11.5, return_3yr: 5.1, return_5yr: 7.8, return_10yr: 5.5 },
  { ticker: 'VXUS', name: 'Vanguard Total International Stock ETF', type: 'ETF', aum: 72000000000, expense_ratio: 0.0007, asset_class: 'Intl Developed', return_1yr: 10.8, return_3yr: 3.5, return_5yr: 6.2, return_10yr: 4.8 },
  { ticker: 'EFA', name: 'iShares MSCI EAFE ETF', type: 'ETF', aum: 62000000000, expense_ratio: 0.0032, asset_class: 'Intl Developed', return_1yr: 11.1, return_3yr: 4.5, return_5yr: 7.2, return_10yr: 5.0 },
  { ticker: 'VWO', name: 'Vanguard FTSE Emerging Markets ETF', type: 'ETF', aum: 82000000000, expense_ratio: 0.0008, asset_class: 'Emerging Markets', return_1yr: 9.2, return_3yr: -1.5, return_5yr: 4.5, return_10yr: 4.0 },
  { ticker: 'EEM', name: 'iShares MSCI Emerging Markets ETF', type: 'ETF', aum: 22000000000, expense_ratio: 0.0068, asset_class: 'Emerging Markets', return_1yr: 8.8, return_3yr: -2.0, return_5yr: 4.0, return_10yr: 3.5 },
  
  // BOND ETFs
  { ticker: 'BND', name: 'Vanguard Total Bond Market ETF', type: 'ETF', aum: 110000000000, expense_ratio: 0.0003, asset_class: 'US Bonds', return_1yr: 2.2, return_3yr: -2.5, return_5yr: 0.8, return_10yr: 1.9 },
  { ticker: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF', type: 'ETF', aum: 52000000000, expense_ratio: 0.0015, asset_class: 'US Bonds', return_1yr: -5.2, return_3yr: -12.5, return_5yr: -4.8, return_10yr: 0.5 },
  { ticker: 'IEF', name: 'iShares 7-10 Year Treasury Bond ETF', type: 'ETF', aum: 32000000000, expense_ratio: 0.0015, asset_class: 'US Bonds', return_1yr: 1.5, return_3yr: -4.2, return_5yr: -0.5, return_10yr: 1.2 },
  { ticker: 'LQD', name: 'iShares iBoxx $ Investment Grade Corporate Bond ETF', type: 'ETF', aum: 38000000000, expense_ratio: 0.0014, asset_class: 'US Bonds', return_1yr: 3.8, return_3yr: -2.1, return_5yr: 1.5, return_10yr: 2.5 },
  { ticker: 'HYG', name: 'iShares iBoxx $ High Yield Corporate Bond ETF', type: 'ETF', aum: 18000000000, expense_ratio: 0.0049, asset_class: 'US Bonds', return_1yr: 8.5, return_3yr: 2.2, return_5yr: 3.8, return_10yr: 4.2 },
  { ticker: 'VCIT', name: 'Vanguard Intermediate-Term Corporate Bond ETF', type: 'ETF', aum: 52000000000, expense_ratio: 0.0004, asset_class: 'US Bonds', return_1yr: 4.5, return_3yr: -1.2, return_5yr: 2.2, return_10yr: 2.8 },
  
  // SECTOR ETFs
  { ticker: 'XLK', name: 'Technology Select Sector SPDR Fund', type: 'ETF', aum: 72000000000, expense_ratio: 0.001, asset_class: 'US Equity', return_1yr: 38.5, return_3yr: 14.2, return_5yr: 22.5, return_10yr: 19.8 },
  { ticker: 'XLF', name: 'Financial Select Sector SPDR Fund', type: 'ETF', aum: 42000000000, expense_ratio: 0.001, asset_class: 'US Equity', return_1yr: 28.2, return_3yr: 8.5, return_5yr: 12.8, return_10yr: 11.2 },
  { ticker: 'XLV', name: 'Health Care Select Sector SPDR Fund', type: 'ETF', aum: 42000000000, expense_ratio: 0.001, asset_class: 'US Equity', return_1yr: 8.5, return_3yr: 5.2, return_5yr: 9.8, return_10yr: 10.5 },
  { ticker: 'XLE', name: 'Energy Select Sector SPDR Fund', type: 'ETF', aum: 38000000000, expense_ratio: 0.001, asset_class: 'US Equity', return_1yr: 5.2, return_3yr: 18.5, return_5yr: 8.2, return_10yr: 2.5 },
  { ticker: 'XLI', name: 'Industrial Select Sector SPDR Fund', type: 'ETF', aum: 22000000000, expense_ratio: 0.001, asset_class: 'US Equity', return_1yr: 22.8, return_3yr: 10.2, return_5yr: 13.5, return_10yr: 11.8 },
  
  // VANGUARD MUTUAL FUNDS
  { ticker: 'VFIAX', name: 'Vanguard 500 Index Fund Admiral', type: 'MF', aum: 450000000000, expense_ratio: 0.0004, asset_class: 'US Equity', return_1yr: 27.2, return_3yr: 10.5, return_5yr: 15.2, return_10yr: 12.8 },
  { ticker: 'VTSAX', name: 'Vanguard Total Stock Market Index Admiral', type: 'MF', aum: 380000000000, expense_ratio: 0.0004, asset_class: 'US Equity', return_1yr: 26.8, return_3yr: 9.8, return_5yr: 14.9, return_10yr: 12.3 },
  { ticker: 'VTIAX', name: 'Vanguard Total International Stock Index Admiral', type: 'MF', aum: 85000000000, expense_ratio: 0.0011, asset_class: 'Intl Developed', return_1yr: 10.8, return_3yr: 3.5, return_5yr: 6.2, return_10yr: 4.8 },
  { ticker: 'VBTLX', name: 'Vanguard Total Bond Market Index Admiral', type: 'MF', aum: 120000000000, expense_ratio: 0.0005, asset_class: 'US Bonds', return_1yr: 2.2, return_3yr: -2.5, return_5yr: 0.8, return_10yr: 1.9 },
  
  // FIDELITY MUTUAL FUNDS
  { ticker: 'FXAIX', name: 'Fidelity 500 Index Fund', type: 'MF', aum: 520000000000, expense_ratio: 0.00015, asset_class: 'US Equity', return_1yr: 27.2, return_3yr: 10.5, return_5yr: 15.2, return_10yr: 12.8 },
  { ticker: 'FSKAX', name: 'Fidelity Total Market Index Fund', type: 'MF', aum: 95000000000, expense_ratio: 0.00015, asset_class: 'US Equity', return_1yr: 26.8, return_3yr: 9.8, return_5yr: 14.9, return_10yr: 12.3 },
  { ticker: 'FTIHX', name: 'Fidelity Total International Index Fund', type: 'MF', aum: 42000000000, expense_ratio: 0.0006, asset_class: 'Intl Developed', return_1yr: 10.5, return_3yr: 3.2, return_5yr: 6.0, return_10yr: 4.5 },
  
  // AMERICAN FUNDS (CAPITAL GROUP)
  { ticker: 'AGTHX', name: 'American Funds Growth Fund of America', type: 'MF', aum: 280000000000, expense_ratio: 0.0062, asset_class: 'US Equity', return_1yr: 32.5, return_3yr: 11.2, return_5yr: 16.8, return_10yr: 14.2 },
  { ticker: 'AIVSX', name: 'American Funds Investment Company of America', type: 'MF', aum: 150000000000, expense_ratio: 0.0059, asset_class: 'US Equity', return_1yr: 25.8, return_3yr: 10.1, return_5yr: 14.5, return_10yr: 12.5 },
  { ticker: 'ANCFX', name: 'American Funds New Perspective Fund', type: 'MF', aum: 145000000000, expense_ratio: 0.0075, asset_class: 'Intl Developed', return_1yr: 22.5, return_3yr: 8.5, return_5yr: 13.2, return_10yr: 11.8 },
  { ticker: 'ANWPX', name: 'American Funds New World Fund', type: 'MF', aum: 52000000000, expense_ratio: 0.0098, asset_class: 'Emerging Markets', return_1yr: 12.5, return_3yr: 1.8, return_5yr: 6.5, return_10yr: 5.2 },
  { ticker: 'CAIBX', name: 'American Funds Capital Income Builder', type: 'MF', aum: 135000000000, expense_ratio: 0.0059, asset_class: 'US Equity', return_1yr: 14.2, return_3yr: 6.8, return_5yr: 9.5, return_10yr: 8.2 },
  { ticker: 'CWGIX', name: 'American Funds Capital World Growth & Income', type: 'MF', aum: 125000000000, expense_ratio: 0.0075, asset_class: 'Intl Developed', return_1yr: 18.5, return_3yr: 7.2, return_5yr: 11.2, return_10yr: 9.8 },
  { ticker: 'ABALX', name: 'American Funds American Balanced Fund', type: 'MF', aum: 185000000000, expense_ratio: 0.0059, asset_class: 'US Equity', return_1yr: 16.5, return_3yr: 6.5, return_5yr: 10.2, return_10yr: 9.5 },
  { ticker: 'ABNDX', name: 'American Funds Bond Fund of America', type: 'MF', aum: 72000000000, expense_ratio: 0.0058, asset_class: 'US Bonds', return_1yr: 3.5, return_3yr: -1.8, return_5yr: 1.2, return_10yr: 2.2 },
];

console.log('Seeding fund database...\n');

const insert = db.prepare(`
  INSERT INTO funds (ticker, name, type, aum, expense_ratio, asset_class, return_1yr, return_3yr, return_5yr, return_10yr)
  VALUES (@ticker, @name, @type, @aum, @expense_ratio, @asset_class, @return_1yr, @return_3yr, @return_5yr, @return_10yr)
`);

for (const fund of funds) {
  insert.run(fund);
  console.log(`✓ ${fund.ticker} - ${fund.name}`);
}

console.log(`\n✅ Done! ${funds.length} funds added.`);

const summary = db.prepare('SELECT asset_class, COUNT(*) as count FROM funds GROUP BY asset_class').all();
console.log('\nFunds by asset class:');
for (const row of summary) {
  console.log(`  ${row.asset_class}: ${row.count}`);
}

db.close();
