import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

function getDb() {
  return new Database(path.join(process.cwd(), 'data', 'funds.db'));
}

export async function GET() {
  try {
    const db = getDb();
    
    // Ensure tables exist
    db.exec(`
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
    
    const portfolios = db.prepare('SELECT * FROM portfolios ORDER BY created_at DESC').all();
    db.close();
    
    return NextResponse.json(portfolios);
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, holdings } = await request.json();
    
    if (!name || !holdings || holdings.length === 0) {
      return NextResponse.json({ error: 'Name and holdings required' }, { status: 400 });
    }

    const db = getDb();
    
    // Ensure tables exist
    db.exec(`
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

    const insertPortfolio = db.prepare('INSERT INTO portfolios (name) VALUES (?)');
    const insertHolding = db.prepare('INSERT INTO portfolio_holdings (portfolio_id, ticker, weight) VALUES (?, ?, ?)');

    const result = insertPortfolio.run(name);
    const portfolioId = result.lastInsertRowid;

    for (const holding of holdings) {
      insertHolding.run(portfolioId, holding.ticker, holding.weight);
    }

    db.close();

    return NextResponse.json({ id: portfolioId, name });
  } catch (error) {
    console.error('Error creating portfolio:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
