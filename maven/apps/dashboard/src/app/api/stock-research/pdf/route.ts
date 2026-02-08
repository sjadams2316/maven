import { NextRequest, NextResponse } from 'next/server';

/**
 * Generate a Maven Research Report PDF
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const {
      symbol,
      name,
      currentPrice,
      change,
      changePercent,
      mavenScore,
      scoreBreakdown,
      analystRating,
      numberOfAnalysts,
      buyCount,
      holdCount,
      sellCount,
      targetHigh,
      targetLow,
      targetMean,
      currentToTarget,
      fiftyTwoWeekHigh,
      fiftyTwoWeekLow,
      fiftyDayAvg,
      twoHundredDayAvg,
      bullCase,
      bearCase,
      catalysts,
      risks,
      recentNews,
      userHolding
    } = data;

    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Generate HTML for PDF
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1a1a2e;
      line-height: 1.5;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #6366f1;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 28px;
      font-weight: 700;
      color: #6366f1;
    }
    .logo span { color: #a855f7; }
    .date { color: #666; font-size: 14px; }
    .title-section {
      margin-bottom: 30px;
    }
    .symbol {
      font-size: 48px;
      font-weight: 700;
      color: #1a1a2e;
    }
    .company-name {
      font-size: 20px;
      color: #666;
      margin-top: 5px;
    }
    .price-row {
      display: flex;
      align-items: baseline;
      gap: 15px;
      margin-top: 10px;
    }
    .price {
      font-size: 36px;
      font-weight: 600;
    }
    .change {
      font-size: 18px;
      font-weight: 500;
    }
    .change.positive { color: #10b981; }
    .change.negative { color: #ef4444; }
    .maven-score-section {
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      color: white;
      padding: 25px;
      border-radius: 12px;
      margin-bottom: 30px;
    }
    .maven-score-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .maven-score-title {
      font-size: 20px;
      font-weight: 600;
    }
    .maven-score-value {
      font-size: 48px;
      font-weight: 700;
    }
    .score-breakdown {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
    }
    .score-item {
      background: rgba(255,255,255,0.15);
      padding: 12px;
      border-radius: 8px;
      text-align: center;
    }
    .score-label { font-size: 11px; opacity: 0.9; }
    .score-value { font-size: 24px; font-weight: 600; margin-top: 5px; }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a2e;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
    }
    .two-column {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .analyst-box {
      background: #f8fafc;
      padding: 20px;
      border-radius: 12px;
    }
    .rating {
      font-size: 24px;
      font-weight: 600;
      text-transform: capitalize;
      margin-bottom: 10px;
    }
    .rating.buy { color: #10b981; }
    .rating.hold { color: #f59e0b; }
    .rating.sell { color: #ef4444; }
    .rating-bar {
      display: flex;
      height: 24px;
      border-radius: 6px;
      overflow: hidden;
      margin: 15px 0;
    }
    .rating-buy { background: #10b981; }
    .rating-hold { background: #f59e0b; }
    .rating-sell { background: #ef4444; }
    .rating-legend {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #666;
    }
    .targets-box {
      background: #f8fafc;
      padding: 20px;
      border-radius: 12px;
    }
    .target-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .target-row:last-child { border-bottom: none; }
    .upside {
      font-size: 24px;
      font-weight: 600;
      text-align: center;
      margin-top: 15px;
      padding: 15px;
      border-radius: 8px;
    }
    .upside.positive { background: #d1fae5; color: #059669; }
    .upside.negative { background: #fee2e2; color: #dc2626; }
    .case-section {
      background: #f8fafc;
      padding: 20px;
      border-radius: 12px;
    }
    .case-section.bull { border-left: 4px solid #10b981; }
    .case-section.bear { border-left: 4px solid #ef4444; }
    .case-title {
      font-weight: 600;
      margin-bottom: 12px;
      font-size: 16px;
    }
    .case-title.bull { color: #059669; }
    .case-title.bear { color: #dc2626; }
    .case-list {
      list-style: none;
    }
    .case-list li {
      padding: 6px 0;
      font-size: 14px;
      color: #374151;
    }
    .case-list li::before {
      content: "•";
      margin-right: 8px;
      font-weight: bold;
    }
    .bull .case-list li::before { color: #10b981; }
    .bear .case-list li::before { color: #ef4444; }
    .user-position {
      background: #dbeafe;
      border: 2px solid #3b82f6;
      padding: 20px;
      border-radius: 12px;
      margin-bottom: 25px;
    }
    .user-position-title {
      font-weight: 600;
      color: #1d4ed8;
      margin-bottom: 10px;
    }
    .position-details {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
    }
    .position-item {
      text-align: center;
    }
    .position-label { font-size: 12px; color: #666; }
    .position-value { font-size: 20px; font-weight: 600; color: #1a1a2e; }
    .news-section {
      margin-top: 25px;
    }
    .news-item {
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .news-item:last-child { border-bottom: none; }
    .news-title {
      font-size: 14px;
      color: #1a1a2e;
    }
    .news-meta {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }
    .sources {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
    }
    .sources-title {
      font-size: 14px;
      font-weight: 600;
      color: #666;
      margin-bottom: 10px;
    }
    .sources-list {
      font-size: 12px;
      color: #888;
    }
    .disclaimer {
      margin-top: 30px;
      padding: 20px;
      background: #fef3c7;
      border-radius: 8px;
      font-size: 11px;
      color: #92400e;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      color: #888;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">Maven<span>™</span></div>
      <div style="font-size: 12px; color: #888;">AI-Powered Research Report</div>
    </div>
    <div class="date">${today}</div>
  </div>

  <div class="title-section">
    <div class="symbol">${symbol}</div>
    <div class="company-name">${name}</div>
    <div class="price-row">
      <span class="price">$${currentPrice.toFixed(2)}</span>
      <span class="change ${change >= 0 ? 'positive' : 'negative'}">
        ${change >= 0 ? '+' : ''}${change.toFixed(2)} (${changePercent.toFixed(2)}%)
      </span>
    </div>
  </div>

  ${userHolding ? `
  <div class="user-position">
    <div class="user-position-title">📊 Your Position</div>
    <div class="position-details">
      <div class="position-item">
        <div class="position-label">Shares Owned</div>
        <div class="position-value">${userHolding.shares.toLocaleString()}</div>
      </div>
      <div class="position-item">
        <div class="position-label">Current Value</div>
        <div class="position-value">$${(userHolding.currentValue || 0).toLocaleString()}</div>
      </div>
      <div class="position-item">
        <div class="position-label">At Target Price</div>
        <div class="position-value">$${(userHolding.shares * targetMean).toLocaleString()}</div>
      </div>
    </div>
  </div>
  ` : ''}

  <div class="maven-score-section">
    <div class="maven-score-header">
      <div class="maven-score-title">🎯 Maven Score™</div>
      <div class="maven-score-value">${mavenScore}</div>
    </div>
    <div class="score-breakdown">
      <div class="score-item">
        <div class="score-label">Analyst Conviction</div>
        <div class="score-value">${scoreBreakdown.analystConviction}</div>
      </div>
      <div class="score-item">
        <div class="score-label">Valuation</div>
        <div class="score-value">${scoreBreakdown.valuation}</div>
      </div>
      <div class="score-item">
        <div class="score-label">Momentum</div>
        <div class="score-value">${scoreBreakdown.momentum}</div>
      </div>
      <div class="score-item">
        <div class="score-label">Quality</div>
        <div class="score-value">${scoreBreakdown.quality}</div>
      </div>
    </div>
  </div>

  <div class="two-column">
    <div class="section">
      <div class="section-title">📊 Analyst Ratings</div>
      <div class="analyst-box">
        <div class="rating ${analystRating.includes('buy') ? 'buy' : analystRating === 'hold' ? 'hold' : 'sell'}">
          ${analystRating}
        </div>
        <div style="font-size: 14px; color: #666;">${numberOfAnalysts} analysts covering</div>
        <div class="rating-bar">
          <div class="rating-buy" style="width: ${(buyCount / numberOfAnalysts) * 100}%"></div>
          <div class="rating-hold" style="width: ${(holdCount / numberOfAnalysts) * 100}%"></div>
          <div class="rating-sell" style="width: ${(sellCount / numberOfAnalysts) * 100}%"></div>
        </div>
        <div class="rating-legend">
          <span>Buy: ${buyCount}</span>
          <span>Hold: ${holdCount}</span>
          <span>Sell: ${sellCount}</span>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">🎯 Price Targets</div>
      <div class="targets-box">
        <div class="target-row">
          <span>Low</span>
          <span style="font-weight: 600; color: #ef4444;">$${targetLow.toFixed(2)}</span>
        </div>
        <div class="target-row">
          <span>Mean</span>
          <span style="font-weight: 600; color: #6366f1;">$${targetMean.toFixed(2)}</span>
        </div>
        <div class="target-row">
          <span>High</span>
          <span style="font-weight: 600; color: #10b981;">$${targetHigh.toFixed(2)}</span>
        </div>
        <div class="upside ${currentToTarget >= 0 ? 'positive' : 'negative'}">
          ${currentToTarget >= 0 ? '+' : ''}${currentToTarget.toFixed(1)}% to Mean Target
        </div>
      </div>
    </div>
  </div>

  <div class="two-column" style="margin-top: 20px;">
    <div class="case-section bull">
      <div class="case-title bull">🐂 Bull Case</div>
      <ul class="case-list">
        ${bullCase.map((point: string) => `<li>${point}</li>`).join('')}
      </ul>
    </div>
    <div class="case-section bear">
      <div class="case-title bear">🐻 Bear Case</div>
      <ul class="case-list">
        ${bearCase.map((point: string) => `<li>${point}</li>`).join('')}
      </ul>
    </div>
  </div>

  <div class="section" style="margin-top: 25px;">
    <div class="section-title">📈 Technical Levels</div>
    <div class="two-column">
      <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #666;">52-Week High</span>
          <span style="font-weight: 600;">$${fiftyTwoWeekHigh.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #666;">52-Week Low</span>
          <span style="font-weight: 600;">$${fiftyTwoWeekLow.toFixed(2)}</span>
        </div>
      </div>
      <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="color: #666;">50-Day Avg</span>
          <span style="font-weight: 600;">$${fiftyDayAvg.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #666;">200-Day Avg</span>
          <span style="font-weight: 600;">$${twoHundredDayAvg.toFixed(2)}</span>
        </div>
      </div>
    </div>
  </div>

  ${recentNews && recentNews.length > 0 ? `
  <div class="news-section">
    <div class="section-title">📰 Recent News</div>
    ${recentNews.slice(0, 3).map((news: any) => `
      <div class="news-item">
        <div class="news-title">${news.title}</div>
        <div class="news-meta">${news.publisher} • ${news.date}</div>
      </div>
    `).join('')}
  </div>
  ` : ''}

  <div class="sources">
    <div class="sources-title">Data Sources</div>
    <div class="sources-list">
      Price data: Yahoo Finance (delayed) • Analyst estimates: Simulated based on price performance • 
      News: Yahoo Finance News API • Technical indicators: Calculated from historical prices
    </div>
  </div>

  <div class="disclaimer">
    <strong>Important Disclaimer:</strong> This report is for informational purposes only and does not constitute 
    investment advice. Maven is not a registered investment advisor. Past performance does not guarantee future 
    results. Analyst ratings and price targets are estimates and may not reflect actual outcomes. Always conduct 
    your own research and consult with a qualified financial advisor before making investment decisions.
  </div>

  <div class="footer">
    Generated by Maven™ • mavenwealth.ai • ${today}
  </div>
</body>
</html>
    `;

    // Return HTML that can be printed to PDF by the browser
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
