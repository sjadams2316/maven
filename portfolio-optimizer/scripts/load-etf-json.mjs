import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const db = new Database(path.join(projectRoot, 'data', 'funds.db'));

// Load JSON data
const etfData = JSON.parse(fs.readFileSync(path.join(projectRoot, 'data', 'etf-data.json'), 'utf8'));

console.log(`Loading ${etfData.length} ETFs from JSON...`);

const insert = db.prepare(`
  INSERT OR REPLACE INTO funds (ticker, name, type, aum, category, asset_class, updated_at)
  VALUES (@ticker, @name, 'ETF', @aum, @category, @asset_class, datetime('now'))
`);

let added = 0;
for (const etf of etfData) {
  if (etf.aum >= 100000000) {
    try {
      insert.run(etf);
      added++;
    } catch (e) {
      console.error(`Failed to add ${etf.ticker}: ${e.message}`);
    }
  }
}

console.log(`\\n✅ Added ${added} ETFs (>$100M AUM)`);

const summary = db.prepare('SELECT asset_class, COUNT(*) as count FROM funds GROUP BY asset_class ORDER BY count DESC').all();
console.log('\\nFunds by asset class:');
for (const row of summary) {
  console.log(`  ${row.asset_class}: ${row.count}`);
}

const total = db.prepare('SELECT COUNT(*) as count FROM funds').get();
console.log(`\\nTotal funds in database: ${total.count}`);

db.close();
