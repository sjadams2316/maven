// Portfolio Insights Generator
// Provides backward-looking context and forward-looking positioning

// 2025/2026 Capital Market Assumptions from major asset managers
const CMA_SOURCES = {
  blackrock: {
    name: 'BlackRock',
    date: '2025',
    assumptions: {
      'US Equity': { return: 6.5, view: 'neutral', notes: 'Valuations elevated, earnings growth key' },
      'Intl Developed': { return: 7.5, view: 'overweight', notes: 'Europe/Japan valuations more attractive' },
      'Emerging Markets': { return: 8.5, view: 'overweight', notes: 'China uncertainty but India/LatAm bright spots' },
      'US Bonds': { return: 5.0, view: 'neutral', notes: 'Higher starting yields support returns' }
    }
  },
  jpmorgan: {
    name: 'JP Morgan',
    date: '2025',
    assumptions: {
      'US Equity': { return: 7.0, view: 'neutral', notes: 'Favor quality and dividend growers' },
      'Intl Developed': { return: 6.5, view: 'neutral', notes: 'Currency headwinds possible' },
      'Emerging Markets': { return: 7.5, view: 'overweight', notes: 'Selective opportunities in EM' },
      'US Bonds': { return: 4.5, view: 'overweight', notes: 'Attractive yields, duration risk manageable' }
    }
  },
  vanguard: {
    name: 'Vanguard',
    date: '2025',
    assumptions: {
      'US Equity': { return: 5.5, view: 'underweight', notes: 'High valuations limit upside' },
      'Intl Developed': { return: 7.0, view: 'overweight', notes: 'Better value outside US' },
      'Emerging Markets': { return: 7.5, view: 'neutral', notes: 'Higher volatility but compensated' },
      'US Bonds': { return: 4.8, view: 'overweight', notes: 'Best outlook in over a decade' }
    }
  },
  capitalgroup: {
    name: 'Capital Group',
    date: '2025',
    assumptions: {
      'US Equity': { return: 7.2, view: 'neutral', notes: 'Focus on quality companies with pricing power' },
      'Intl Developed': { return: 7.8, view: 'overweight', notes: 'Opportunities in European industrials, Japan' },
      'Emerging Markets': { return: 8.2, view: 'overweight', notes: 'India, Mexico, Indonesia favored' },
      'US Bonds': { return: 5.2, view: 'neutral', notes: 'Multi-sector approach preferred' }
    }
  }
};

// Historical market events for context
const HISTORICAL_EVENTS = {
  gfc_2008: {
    name: '2008-2009 Global Financial Crisis',
    impacts: {
      'US Equity': -52,
      'Intl Developed': -56,
      'Emerging Markets': -61,
      'US Bonds': 5
    },
    recovery: '4 years to recover (March 2013)',
    lesson: 'Diversification into bonds provided cushion and rebalancing opportunities'
  },
  covid_2020: {
    name: '2020 COVID Crash & Recovery',
    impacts: {
      'US Equity': -34,
      'Intl Developed': -33,
      'Emerging Markets': -32,
      'US Bonds': 3.5
    },
    recovery: '6 months to recover',
    lesson: 'Fastest recovery in history; staying invested was key'
  },
  rate_shock_2022: {
    name: '2022 Rate Shock',
    impacts: {
      'US Equity': -19,
      'Intl Developed': -16,
      'Emerging Markets': -22,
      'US Bonds': -13
    },
    recovery: 'Partial recovery in 2023-2024',
    lesson: 'Rare year where stocks AND bonds fell together; duration risk in bonds'
  },
  bull_2023_2024: {
    name: '2023-2024 AI-Led Bull Market',
    impacts: {
      'US Equity': 52,
      'Intl Developed': 22,
      'Emerging Markets': 15,
      'US Bonds': 8
    },
    recovery: 'N/A - positive period',
    lesson: 'Concentration in Mag 7 drove returns; broad market lagged'
  }
};

function generateRearviewInsights(allocation) {
  const insights = [];
  
  // Calculate hypothetical impacts for each event
  for (const [eventId, event] of Object.entries(HISTORICAL_EVENTS)) {
    let portfolioImpact = 0;
    for (const [ac, weight] of Object.entries(allocation)) {
      portfolioImpact += (event.impacts[ac] || 0) * weight;
    }
    
    if (portfolioImpact < -25) {
      insights.push({
        type: 'warning',
        event: event.name,
        text: `Would have declined ${Math.abs(portfolioImpact).toFixed(0)}% during ${event.name}. ${event.lesson}`
      });
    } else if (portfolioImpact < -10) {
      insights.push({
        type: 'caution',
        event: event.name,
        text: `Would have declined ${Math.abs(portfolioImpact).toFixed(0)}% during ${event.name}, less than pure equity. ${event.recovery}`
      });
    } else if (portfolioImpact > 20) {
      insights.push({
        type: 'positive',
        event: event.name,
        text: `Would have gained ${portfolioImpact.toFixed(0)}% during ${event.name}.`
      });
    }
  }
  
  // Add allocation-specific insights
  const usEquity = allocation['US Equity'] || 0;
  const intl = (allocation['Intl Developed'] || 0) + (allocation['Emerging Markets'] || 0);
  const bonds = allocation['US Bonds'] || 0;
  
  if (usEquity > 0.7) {
    insights.push({
      type: 'info',
      text: 'Heavy US equity concentration (>70%) means high correlation to S&P 500 performance'
    });
  }
  
  if (bonds >= 0.3) {
    insights.push({
      type: 'positive',
      text: `${(bonds * 100).toFixed(0)}% bond allocation historically provided stability in equity drawdowns (except 2022)`
    });
  }
  
  if (intl >= 0.2) {
    insights.push({
      type: 'info',
      text: `International allocation (${(intl * 100).toFixed(0)}%) has lagged US since 2010 but provided diversification benefits`
    });
  }
  
  return insights;
}

function generateForwardInsights(allocation) {
  const insights = [];
  
  // Calculate consensus expected return
  let consensusReturn = 0;
  const sourceReturns = [];
  
  for (const [sourceId, source] of Object.entries(CMA_SOURCES)) {
    let sourceReturn = 0;
    for (const [ac, weight] of Object.entries(allocation)) {
      sourceReturn += (source.assumptions[ac]?.return || 6) * weight;
    }
    sourceReturns.push({ name: source.name, return: sourceReturn });
    consensusReturn += sourceReturn;
  }
  consensusReturn /= Object.keys(CMA_SOURCES).length;
  
  insights.push({
    type: 'summary',
    text: `Consensus expected return: ${consensusReturn.toFixed(1)}% annually (range: ${Math.min(...sourceReturns.map(s => s.return)).toFixed(1)}% - ${Math.max(...sourceReturns.map(s => s.return)).toFixed(1)}%)`
  });
  
  // Check positioning vs consensus views
  const usEquity = allocation['US Equity'] || 0;
  const intlDev = allocation['Intl Developed'] || 0;
  const em = allocation['Emerging Markets'] || 0;
  const bonds = allocation['US Bonds'] || 0;
  
  // US Equity positioning
  if (usEquity > 0.5) {
    const views = Object.values(CMA_SOURCES).filter(s => s.assumptions['US Equity'].view === 'underweight');
    if (views.length >= 2) {
      insights.push({
        type: 'caution',
        text: `${(usEquity * 100).toFixed(0)}% US equity is above consensus weight. ${views.map(v => v.name).join(', ')} suggest underweighting due to elevated valuations.`
      });
    }
  }
  
  // International positioning
  const totalIntl = intlDev + em;
  if (totalIntl < 0.2) {
    insights.push({
      type: 'opportunity',
      text: `Only ${(totalIntl * 100).toFixed(0)}% international exposure. Most strategists see better value outside the US — consider increasing.`
    });
  } else if (totalIntl >= 0.3) {
    insights.push({
      type: 'positive',
      text: `${(totalIntl * 100).toFixed(0)}% international allocation aligns with consensus view that non-US markets offer better valuations.`
    });
  }
  
  // Bond positioning
  if (bonds >= 0.2) {
    insights.push({
      type: 'positive',
      text: `${(bonds * 100).toFixed(0)}% bonds provides income and stability. Starting yields (~5%) are highest in 15+ years, supporting forward returns.`
    });
  } else if (bonds < 0.1 && bonds > 0) {
    insights.push({
      type: 'info',
      text: `Low bond allocation (${(bonds * 100).toFixed(0)}%) means less cushion if equities correct. Consider if appropriate for risk tolerance.`
    });
  }
  
  // EM-specific
  if (em >= 0.1) {
    insights.push({
      type: 'info',
      text: `${(em * 100).toFixed(0)}% EM exposure captures growth potential (India, Mexico, Indonesia) but comes with higher volatility and China uncertainty.`
    });
  }
  
  // Add source-specific commentary
  insights.push({
    type: 'detail',
    text: `BlackRock favors international equities. JP Morgan likes quality/dividend stocks. Vanguard is most bullish on bonds. Capital Group emphasizes active management.`
  });
  
  return insights;
}

function generatePortfolioInsights(allocation) {
  return {
    rearview: generateRearviewInsights(allocation),
    forward: generateForwardInsights(allocation),
    sources: Object.entries(CMA_SOURCES).map(([id, s]) => ({
      id,
      name: s.name,
      date: s.date
    }))
  };
}

module.exports = {
  CMA_SOURCES,
  HISTORICAL_EVENTS,
  generateRearviewInsights,
  generateForwardInsights,
  generatePortfolioInsights
};
