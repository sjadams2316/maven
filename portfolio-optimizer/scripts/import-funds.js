#!/usr/bin/env node
/**
 * Unified Fund Data Import
 * 
 * Imports fund data from multiple sources:
 * - Morningstar CSV export
 * - Financial Modeling Prep JSON
 * - ETF data JSON (existing)
 * 
 * Usage: node scripts/import-funds.js [--morningstar path.csv] [--fmp] [--etf]
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '..', 'data', 'funds.db');
const db = new Database(DB_PATH);

// Ensure schema exists with all needed columns
db.exec(`
  DROP TABLE IF EXISTS funds;
  CREATE TABLE funds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ticker TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    asset_class TEXT,
    category TEXT,
    expense_ratio REAL,
    aum REAL,
    price REAL,
    return_ytd REAL,
    return_1yr REAL,
    return_3yr REAL,
    return_5yr REAL,
    return_10yr REAL,
    std_dev_3yr REAL,
    sharpe_3yr REAL,
    beta_3yr REAL,
    alpha_3yr REAL,
    morningstar_rating INTEGER,
    medalist_rating TEXT,
    source TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX idx_funds_ticker ON funds(ticker);
  CREATE INDEX idx_funds_type ON funds(type);
  CREATE INDEX idx_funds_category ON funds(category);
  CREATE INDEX idx_funds_asset_class ON funds(asset_class);
`);

const insertFund = db.prepare(`
  INSERT OR REPLACE INTO funds (
    ticker, name, type, asset_class, category, expense_ratio, aum, price,
    return_ytd, return_1yr, return_3yr, return_5yr, return_10yr,
    std_dev_3yr, sharpe_3yr, beta_3yr, alpha_3yr,
    morningstar_rating, medalist_rating, source, updated_at
  ) VALUES (
    @ticker, @name, @type, @asset_class, @category, @expense_ratio, @aum, @price,
    @return_ytd, @return_1yr, @return_3yr, @return_5yr, @return_10yr,
    @std_dev_3yr, @sharpe_3yr, @beta_3yr, @alpha_3yr,
    @morningstar_rating, @medalist_rating, @source, datetime('now')
  )
`);

// Map Morningstar categories to asset classes
function categoryToAssetClass(category) {
  if (!category) return 'Other';
  const cat = category.toLowerCase();
  
  if (cat.includes('large') || cat.includes('mid') || cat.includes('small')) {
    if (cat.includes('foreign') || cat.includes('international') || cat.includes('world') || cat.includes('global')) {
      if (cat.includes('emerging')) return 'Emerging Markets';
      return 'Intl Developed';
    }
    return 'US Equity';
  }
  if (cat.includes('bond') || cat.includes('fixed') || cat.includes('treasury') || cat.includes('corporate')) {
    if (cat.includes('international') || cat.includes('emerging') || cat.includes('global')) {
      return 'Intl Bonds';
    }
    return 'US Bonds';
  }
  if (cat.includes('emerging')) return 'Emerging Markets';
  if (cat.includes('international') || cat.includes('foreign') || cat.includes('world')) return 'Intl Developed';
  if (cat.includes('real estate') || cat.includes('reit')) return 'Real Estate';
  if (cat.includes('commodity') || cat.includes('precious metal')) return 'Commodities';
  if (cat.includes('money market') || cat.includes('ultrashort')) return 'Cash';
  
  return 'Other';
}

function parseNumber(val) {
  if (val === null || val === undefined || val === '' || val === '—' || val === '-') return null;
  const str = String(val).replace(/[$,%]/g, '').replace(/[BMK]$/, (m) => {
    return { 'B': 'e9', 'M': 'e6', 'K': 'e3' }[m] || '';
  });
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

function parsePercent(val) {
  const num = parseNumber(val);
  if (num === null) return null;
  // If the value is already a decimal (e.g., 0.05), keep it
  // If it's a percentage (e.g., 5.00), convert to decimal
  return Math.abs(num) > 1 ? num / 100 : num;
}

function parseAUM(val) {
  if (!val) return null;
  const str = String(val).replace(/[$,]/g, '');
  const match = str.match(/([\d.]+)\s*([BMK])?/i);
  if (!match) return parseNumber(val);
  
  let num = parseFloat(match[1]);
  const suffix = (match[2] || '').toUpperCase();
  if (suffix === 'B') num *= 1e9;
  else if (suffix === 'M') num *= 1e6;
  else if (suffix === 'K') num *= 1e3;
  
  return num;
}

// Import from Morningstar CSV
function importMorningstarCSV(csvPath) {
  console.log(`\n📊 Importing Morningstar CSV: ${csvPath}`);
  
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());
  
  if (lines.length < 2) {
    console.log('   ❌ CSV appears empty');
    return 0;
  }
  
  // Parse header
  const header = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  console.log(`   Headers: ${header.slice(0, 5).join(', ')}...`);
  
  // Map common Morningstar column names
  const colMap = {
    ticker: header.findIndex(h => /^ticker$/i.test(h)),
    name: header.findIndex(h => /^name$/i.test(h)),
    category: header.findIndex(h => /category/i.test(h) && !/rank/i.test(h)),
    expenseRatio: header.findIndex(h => /expense.*ratio|adjusted.*expense/i.test(h)),
    aum: header.findIndex(h => /fund.*size|aum|assets/i.test(h)),
    return1yr: header.findIndex(h => /return.*1.*y|1.*y.*return|total.*return.*1/i.test(h)),
    return3yr: header.findIndex(h => /return.*3.*y|3.*y.*return|total.*return.*3/i.test(h)),
    return5yr: header.findIndex(h => /return.*5.*y|5.*y.*return|total.*return.*5/i.test(h)),
    return10yr: header.findIndex(h => /return.*10.*y|10.*y.*return|total.*return.*10/i.test(h)),
    stdDev: header.findIndex(h => /std.*dev|standard.*dev/i.test(h)),
    sharpe: header.findIndex(h => /sharpe/i.test(h)),
    beta: header.findIndex(h => /^beta/i.test(h)),
    alpha: header.findIndex(h => /^alpha/i.test(h)),
    rating: header.findIndex(h => /morningstar.*rating.*fund|star.*rating/i.test(h)),
    medalist: header.findIndex(h => /medalist/i.test(h)),
    type: header.findIndex(h => /investment.*type|fund.*type/i.test(h)),
  };
  
  console.log(`   Mapped columns:`, Object.fromEntries(
    Object.entries(colMap).filter(([k, v]) => v >= 0).map(([k, v]) => [k, header[v]])
  ));
  
  let imported = 0;
  let skipped = 0;
  
  for (let i = 1; i < lines.length; i++) {
    // Simple CSV parse (handles basic quoting)
    const values = [];
    let current = '';
    let inQuotes = false;
    for (const char of lines[i]) {
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const get = (col) => col >= 0 && col < values.length ? values[col] : null;
    
    const ticker = get(colMap.ticker);
    const name = get(colMap.name);
    
    if (!ticker || !name) {
      skipped++;
      continue;
    }
    
    const category = get(colMap.category);
    const typeVal = get(colMap.type);
    const type = typeVal?.toLowerCase().includes('etf') ? 'ETF' : 'MF';
    
    try {
      insertFund.run({
        ticker: ticker.toUpperCase(),
        name,
        type,
        asset_class: categoryToAssetClass(category),
        category,
        expense_ratio: parsePercent(get(colMap.expenseRatio)),
        aum: parseAUM(get(colMap.aum)),
        price: null,
        return_ytd: null,
        return_1yr: parsePercent(get(colMap.return1yr)),
        return_3yr: parsePercent(get(colMap.return3yr)),
        return_5yr: parsePercent(get(colMap.return5yr)),
        return_10yr: parsePercent(get(colMap.return10yr)),
        std_dev_3yr: parsePercent(get(colMap.stdDev)),
        sharpe_3yr: parseNumber(get(colMap.sharpe)),
        beta_3yr: parseNumber(get(colMap.beta)),
        alpha_3yr: parsePercent(get(colMap.alpha)),
        morningstar_rating: parseNumber(get(colMap.rating)),
        medalist_rating: get(colMap.medalist),
        source: 'Morningstar'
      });
      imported++;
    } catch (e) {
      skipped++;
    }
  }
  
  console.log(`   ✅ Imported: ${imported}, Skipped: ${skipped}`);
  return imported;
}

// Import from FMP JSON
function importFMPJSON(jsonPath) {
  console.log(`\n📊 Importing FMP data: ${jsonPath}`);
  
  if (!fs.existsSync(jsonPath)) {
    console.log('   ❌ File not found. Run: node scripts/fmp-import.js first');
    return 0;
  }
  
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  let imported = 0;
  
  // Import ETFs
  for (const etf of data.etfs || []) {
    try {
      insertFund.run({
        ticker: etf.ticker,
        name: etf.name,
        type: 'ETF',
        asset_class: null,
        category: null,
        expense_ratio: etf.expenseRatio || null,
        aum: etf.marketCap || null,
        price: etf.price || null,
        return_ytd: null,
        return_1yr: null,
        return_3yr: null,
        return_5yr: null,
        return_10yr: null,
        std_dev_3yr: null,
        sharpe_3yr: null,
        beta_3yr: null,
        alpha_3yr: null,
        morningstar_rating: null,
        medalist_rating: null,
        source: 'FMP'
      });
      imported++;
    } catch (e) {}
  }
  
  // Import Mutual Funds
  for (const fund of data.mutualFunds || []) {
    try {
      insertFund.run({
        ticker: fund.ticker,
        name: fund.name,
        type: 'MF',
        asset_class: null,
        category: null,
        expense_ratio: null,
        aum: null,
        price: fund.price || null,
        return_ytd: null,
        return_1yr: null,
        return_3yr: null,
        return_5yr: null,
        return_10yr: null,
        std_dev_3yr: null,
        sharpe_3yr: null,
        beta_3yr: null,
        alpha_3yr: null,
        morningstar_rating: null,
        medalist_rating: null,
        source: 'FMP'
      });
      imported++;
    } catch (e) {}
  }
  
  console.log(`   ✅ Imported: ${imported}`);
  return imported;
}

// Import existing ETF data
function importExistingETF(jsonPath) {
  console.log(`\n📊 Importing existing ETF data: ${jsonPath}`);
  
  if (!fs.existsSync(jsonPath)) {
    console.log('   ❌ File not found');
    return 0;
  }
  
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  let imported = 0;
  
  const etfs = Array.isArray(data) ? data : data.etfs || [];
  
  for (const etf of etfs) {
    try {
      insertFund.run({
        ticker: etf.ticker || etf.symbol,
        name: etf.name,
        type: 'ETF',
        asset_class: etf.asset_class || etf.assetClass || categoryToAssetClass(etf.category),
        category: etf.category,
        expense_ratio: etf.expense_ratio || etf.expenseRatio,
        aum: etf.aum || etf.totalAssets,
        price: etf.price,
        return_ytd: etf.return_ytd || etf.ytdReturn,
        return_1yr: etf.return_1yr || etf.oneYearReturn,
        return_3yr: etf.return_3yr || etf.threeYearReturn,
        return_5yr: etf.return_5yr || etf.fiveYearReturn,
        return_10yr: etf.return_10yr || etf.tenYearReturn,
        std_dev_3yr: null,
        sharpe_3yr: null,
        beta_3yr: null,
        alpha_3yr: null,
        morningstar_rating: null,
        medalist_rating: null,
        source: 'ETF-Data'
      });
      imported++;
    } catch (e) {}
  }
  
  console.log(`   ✅ Imported: ${imported}`);
  return imported;
}

// Main
function main() {
  const args = process.argv.slice(2);
  
  console.log('🚀 Unified Fund Data Import');
  console.log('===========================');
  
  let totalImported = 0;
  
  // Check for Morningstar CSV
  const msIndex = args.indexOf('--morningstar');
  if (msIndex >= 0 && args[msIndex + 1]) {
    totalImported += importMorningstarCSV(args[msIndex + 1]);
  }
  
  // Check for FMP data
  if (args.includes('--fmp')) {
    totalImported += importFMPJSON(path.join(__dirname, '..', 'data', 'fmp-funds.json'));
  }
  
  // Check for existing ETF data
  if (args.includes('--etf')) {
    totalImported += importExistingETF(path.join(__dirname, '..', 'data', 'etf-data.json'));
  }
  
  // If no args, try all sources
  if (args.length === 0) {
    console.log('\nNo arguments provided. Looking for all available sources...');
    
    // Check for any CSV files
    const dataDir = path.join(__dirname, '..');
    const csvFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.csv'));
    for (const csv of csvFiles) {
      totalImported += importMorningstarCSV(path.join(dataDir, csv));
    }
    
    // Check data directory
    const dataPath = path.join(__dirname, '..', 'data');
    if (fs.existsSync(path.join(dataPath, 'fmp-funds.json'))) {
      totalImported += importFMPJSON(path.join(dataPath, 'fmp-funds.json'));
    }
    if (fs.existsSync(path.join(dataPath, 'etf-data.json'))) {
      totalImported += importExistingETF(path.join(dataPath, 'etf-data.json'));
    }
  }
  
  // Final stats
  const stats = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN type = 'ETF' THEN 1 ELSE 0 END) as etfs,
      SUM(CASE WHEN type = 'MF' THEN 1 ELSE 0 END) as mfs,
      COUNT(DISTINCT asset_class) as asset_classes,
      COUNT(expense_ratio) as with_expense,
      COUNT(return_1yr) as with_returns
    FROM funds
  `).get();
  
  console.log('\n📈 Database Summary');
  console.log('==================');
  console.log(`   Total Funds: ${stats.total}`);
  console.log(`   ETFs: ${stats.etfs}`);
  console.log(`   Mutual Funds: ${stats.mfs}`);
  console.log(`   Asset Classes: ${stats.asset_classes}`);
  console.log(`   With Expense Ratio: ${stats.with_expense}`);
  console.log(`   With Return Data: ${stats.with_returns}`);
  console.log('');
  
  // Show by asset class
  const byClass = db.prepare(`
    SELECT asset_class, COUNT(*) as count 
    FROM funds 
    GROUP BY asset_class 
    ORDER BY count DESC
  `).all();
  
  console.log('By Asset Class:');
  for (const row of byClass) {
    console.log(`   ${row.asset_class || 'Uncategorized'}: ${row.count}`);
  }
}

main();
