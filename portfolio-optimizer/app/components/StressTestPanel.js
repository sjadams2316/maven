'use client';

import { useState } from 'react';

// Historical stress scenarios with actual market data
const STRESS_SCENARIOS = {
  'gfc_2008': {
    name: '2008 Global Financial Crisis',
    period: 'Oct 2007 - Mar 2009',
    duration: '17 months',
    icon: '🏦',
    description: 'Subprime mortgage crisis led to global banking collapse. Lehman Brothers failed. S&P 500 fell 56%.',
    assetReturns: {
      'US Equity': -55.3,
      'Intl Developed': -56.2,
      'Emerging Markets': -61.4,
      'US Bonds': 6.1,
    },
    recovery: '4 years to break even',
    lesson: 'Bonds provided crucial protection. Diversification across asset classes mattered more than within equities.',
    source: 'Bloomberg, S&P Dow Jones Indices'
  },
  'covid_2020': {
    name: 'COVID-19 Crash',
    period: 'Feb 2020 - Mar 2020',
    duration: '33 days',
    icon: '🦠',
    description: 'Fastest 30% drop in history. Global pandemic fears caused panic selling across all asset classes.',
    assetReturns: {
      'US Equity': -33.9,
      'Intl Developed': -34.1,
      'Emerging Markets': -31.1,
      'US Bonds': 3.2,
    },
    recovery: '5 months to break even',
    lesson: 'Sharp crashes recover faster than slow bleeds. Staying invested was crucial - those who sold missed the fastest recovery ever.',
    source: 'Bloomberg'
  },
  'bear_2022': {
    name: '2022 Rate Hike Bear Market',
    period: 'Jan 2022 - Oct 2022',
    duration: '10 months',
    icon: '📉',
    description: 'Fed raised rates fastest in 40 years to fight inflation. Both stocks AND bonds fell together.',
    assetReturns: {
      'US Equity': -25.4,
      'Intl Developed': -26.8,
      'Emerging Markets': -29.3,
      'US Bonds': -13.0,
    },
    recovery: '~2 years (ongoing)',
    lesson: 'Traditional 60/40 didn\'t protect. When inflation spikes, both stocks and bonds can fall together.',
    source: 'Morningstar, Bloomberg'
  },
  'dotcom_2000': {
    name: 'Dot-Com Bubble Burst',
    period: 'Mar 2000 - Oct 2002',
    duration: '30 months',
    icon: '💻',
    description: 'Tech bubble collapse. NASDAQ fell 78%. Value stocks held up better than growth.',
    assetReturns: {
      'US Equity': -47.4,
      'Intl Developed': -47.8,
      'Emerging Markets': -50.2,
      'US Bonds': 25.4,
    },
    recovery: '7 years for NASDAQ, 4 years for S&P 500',
    lesson: 'Valuation matters. Bonds were the star performer. Growth stocks can stay down for a long time.',
    source: 'S&P Dow Jones Indices'
  },
  'rising_rates': {
    name: 'Rising Rate Environment',
    period: 'Hypothetical +2% rates',
    duration: '12 months',
    icon: '📈',
    description: 'What if rates rise 2% over the next year? Bond prices fall when rates rise.',
    assetReturns: {
      'US Equity': -5.0,
      'Intl Developed': -3.0,
      'Emerging Markets': -8.0,
      'US Bonds': -10.5,
    },
    recovery: 'Bond income eventually compensates',
    lesson: 'Duration is the enemy in rising rates. Short-term bonds and floating rate hold up better.',
    source: 'Hypothetical scenario based on duration analysis'
  },
};

function calculatePortfolioImpact(allocation, assetReturns) {
  let impact = 0;
  for (const [asset, weight] of Object.entries(allocation)) {
    const assetReturn = assetReturns[asset] || 0;
    impact += (weight / 100) * assetReturn;
  }
  return impact.toFixed(1);
}

export default function StressTestPanel({ portfolio, allocation, onClose }) {
  const [selectedScenario, setSelectedScenario] = useState('covid_2020');
  const scenario = STRESS_SCENARIOS[selectedScenario];
  const portfolioImpact = calculatePortfolioImpact(allocation, scenario.assetReturns);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">🔥 Stress Test Your Portfolio</h2>
          <p className="text-gray-600">See how your All-Star would handle market crises</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
      </div>

      {/* Scenario Selector */}
      <div className="grid grid-cols-5 gap-3">
        {Object.entries(STRESS_SCENARIOS).map(([key, scen]) => (
          <button
            key={key}
            onClick={() => setSelectedScenario(key)}
            className={`p-4 rounded-xl text-center transition ${
              selectedScenario === key
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
            }`}
          >
            <span className="text-2xl block mb-2">{scen.icon}</span>
            <span className="text-xs font-medium">{scen.name.split(' ').slice(0, 2).join(' ')}</span>
          </button>
        ))}
      </div>

      {/* Scenario Details */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-start gap-4 mb-6">
          <span className="text-5xl">{scenario.icon}</span>
          <div>
            <h3 className="text-xl font-bold">{scenario.name}</h3>
            <p className="text-gray-500">{scenario.period} ({scenario.duration})</p>
            <p className="text-gray-600 mt-2">{scenario.description}</p>
          </div>
        </div>

        {/* Impact Display */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-6 text-white mb-6">
          <p className="text-sm opacity-80 mb-1">Your All-Star Portfolio Would Have:</p>
          <p className="text-5xl font-bold">{portfolioImpact}%</p>
          <p className="text-sm opacity-80 mt-2">
            On a $100,000 portfolio, that's {portfolioImpact < 0 ? 'a loss of' : 'a gain of'} $
            {Math.abs(parseFloat(portfolioImpact) * 1000).toLocaleString()}
          </p>
        </div>

        {/* Asset Class Breakdown */}
        <h4 className="font-medium text-gray-700 mb-3">How Each Asset Class Performed:</h4>
        <div className="space-y-3 mb-6">
          {Object.entries(allocation).filter(([_, w]) => w > 0).map(([asset, weight]) => {
            const assetReturn = scenario.assetReturns[asset] || 0;
            const contribution = (weight / 100) * assetReturn;
            return (
              <div key={asset} className="flex items-center gap-4">
                <span className="w-32 text-sm">{asset}</span>
                <span className="w-16 text-sm text-gray-500">{weight}%</span>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden flex">
                  {assetReturn < 0 ? (
                    <>
                      <div className="flex-1" />
                      <div 
                        className="h-full bg-red-500 rounded-l-full"
                        style={{ width: `${Math.abs(assetReturn) / 0.7}%` }}
                      />
                      <div className="w-0.5 bg-gray-400" />
                      <div className="flex-1" />
                    </>
                  ) : (
                    <>
                      <div className="flex-1" />
                      <div className="w-0.5 bg-gray-400" />
                      <div 
                        className="h-full bg-green-500 rounded-r-full"
                        style={{ width: `${assetReturn / 0.3}%` }}
                      />
                      <div className="flex-1" />
                    </>
                  )}
                </div>
                <span className={`w-20 text-right font-bold ${assetReturn < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {assetReturn > 0 ? '+' : ''}{assetReturn}%
                </span>
              </div>
            );
          })}
        </div>

        {/* Recovery Time */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="font-medium text-amber-800">⏱️ Recovery Time: {scenario.recovery}</p>
        </div>

        {/* Lesson Learned */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="font-medium text-blue-800 mb-1">💡 Key Lesson:</p>
          <p className="text-blue-700">{scenario.lesson}</p>
        </div>
      </div>

      {/* Comparison to 100% Stocks */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold mb-4">Your All-Star vs 100% Stocks in This Scenario</h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center p-4 bg-indigo-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">Your All-Star Portfolio</p>
            <p className={`text-3xl font-bold ${parseFloat(portfolioImpact) < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {portfolioImpact}%
            </p>
            <p className="text-sm text-gray-500 mt-1">Diversified protection</p>
          </div>
          <div className="text-center p-4 bg-gray-100 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">100% US Stocks</p>
            <p className={`text-3xl font-bold ${scenario.assetReturns['US Equity'] < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {scenario.assetReturns['US Equity']}%
            </p>
            <p className="text-sm text-gray-500 mt-1">No protection</p>
          </div>
        </div>
        
        {parseFloat(portfolioImpact) > scenario.assetReturns['US Equity'] && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
            <p className="text-green-700 font-medium">
              ✅ Your diversification saved you {(parseFloat(portfolioImpact) - scenario.assetReturns['US Equity']).toFixed(1)}% 
              ({((parseFloat(portfolioImpact) - scenario.assetReturns['US Equity']) * 1000).toLocaleString()} per $100K)
            </p>
          </div>
        )}
      </div>

      {/* Data Source */}
      <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500">
        <strong>Data Source:</strong> {scenario.source}
        <p className="mt-1 italic">Historical returns are not indicative of future performance. Stress tests are educational tools.</p>
      </div>
    </div>
  );
}
