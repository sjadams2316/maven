import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

function getDb() {
  return new Database(path.join(process.cwd(), 'data', 'funds.db'));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const minAum = parseFloat(searchParams.get('minAum')) || 100000000;
  const assetClass = searchParams.get('assetClass') || '';
  const type = searchParams.get('type') || '';
  const limit = parseInt(searchParams.get('limit')) || 100;

  try {
    const db = getDb();
    
    let query = 'SELECT * FROM funds WHERE aum >= ?';
    const params = [minAum];

    if (search) {
      query += ' AND (ticker LIKE ? OR name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (assetClass) {
      query += ' AND asset_class = ?';
      params.push(assetClass);
    }
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY aum DESC LIMIT ?';
    params.push(limit);

    const funds = db.prepare(query).all(...params);
    db.close();

    return NextResponse.json(funds);
  } catch (error) {
    console.error('Error fetching funds:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
