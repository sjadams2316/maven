'use client';

import { useState } from 'react';

// Capital Market Assumptions from research (2025 data)
const CMA_DATA = {
  'US Large Cap': {
    jpmorgan: { return: 6.7, vol: 15.5, note: 'Valuations drag 1.8%' },
    vanguard: { return: 5.0, range: [3, 7], vol: 17.0, note: '10yr median' },
    blackrock: { return: 6.5, vol: 15.8, note: 'Bottom-up DCF' },
    goldman: { return: 6.5, vol: 16.0, note: '10yr forecast' },
    historical: { return: 10.2, vol: 15.3, period: '1926-2024' },
  },
  'US Small Cap': {
    jpmorgan: { return: 7.5, vol: 20.5, note: 'Size premium' },
    vanguard: { return: 5.8, range: [3.5, 8], vol: 22.0, note: 'Higher than large' },
    blackrock: { return: 7.2, vol: 21.0, note: 'Small cap premium' },
    historical: { return: 11.8, vol: 20.1, period: '1926-2024' },
  },
  'Intl Developed': {
    jpmorgan: { return: 7.1, vol: 16.5, note: 'Global ex-US' },
    vanguard: { return: 7.0, range: [5, 9], vol: 18.0, note: 'Attractive valuations' },
    blackrock: { return: 6.8, vol: 17.0, note: 'Currency tailwind' },
    goldman: { return: 7.5, vol: 16.5, note: 'Higher than US' },
    historical: { return: 8.5, vol: 17.5, period: '1970-2024' },
  },
  'Emerging Markets': {
    jpmorgan: { return: 7.2, vol: 22.0, note: 'Higher growth, higher risk' },
    vanguard: { return: 6.0, range: [3, 9], vol: 24.0, note: 'Wide range' },
    blackrock: { return: 7.0, vol: 23.0, note: 'Demographics + growth' },
    goldman: { return: 8.0, vol: 22.0, note: 'Undervalued' },
    historical: { return: 9.5, vol: 23.5, period: '1988-2024' },
  },
  'US Aggregate Bonds': {
    jpmorgan: { return: 4.8, vol: 5.5, note: 'Starting yields help' },
    vanguard: { return: 4.5, range: [3.5, 5.5], vol: 5.0, note: 'Higher than recent' },
    blackrock: { return: 4.6, vol: 5.2, note: 'Bonds are back' },
    historical: { return: 5.2, vol: 5.5, period: '1926-2024' },
  },
  'US Long Treasuries': {
    jpmorgan: { return: 5.2, vol: 12.0, note: 'Duration risk premium' },
    vanguard: { return: 4.8, range: [3.5, 6], vol: 13.0, note: 'Rate sensitive' },
    blackrock: { return: 5.0, vol: 12.5, note: 'Safe haven' },
    historical: { return: 5.5, vol: 11.0, period: '1926-2024' },
  },
  'TIPS': {
    jpmorgan: { return: 4.2, vol: 6.0, note: 'Inflation protection' },
    vanguard: { return: 4.0, range: [3, 5], vol: 6.5, note: 'Real return ~2%' },
    blackrock: { return: 4.3, vol: 6.2, note: 'Hedge for surprise inflation' },
    historical: { return: 4.8, vol: 6.0, period: '1997-2024' },
  },
  'US High Yield': {
    jpmorgan: { return: 6.1, vol: 10.0, note: 'Tight spreads' },
    vanguard: { return: 5.5, range: [4, 7], vol: 11.0, note: 'Default drag' },
    blackrock: { return: 5.8, vol: 10.5, note: 'Credit risk premium' },
    historical: { return: 7.5, vol: 10.2, period: '1983-2024' },
  },
  'Private Equity': {
    jpmorgan: { return: 9.9, vol: 18.0, note: 'Illiquidity premium' },
    blackrock: { return: 9.5, vol: 17.0, note: 'Access required' },
    note: 'Not accessible to all investors. 7-10 year lockups typical.',
  },
  'US Real Estate': {
    jpmorgan: { return: 8.1, vol: 14.0, note: '"Generational opportunity"' },
    vanguard: { return: 7.0, range: [5, 9], vol: 15.0, note: 'REITs proxy' },
    blackrock: { return: 7.5, vol: 14.5, note: 'Reset from 2022-23' },
    historical: { return: 9.2, vol: 18.0, period: '1972-2024' },
  },
  'Commodities': {
    jpmorgan: { return: 3.8, vol: 17.0, note: 'Energy transition drag' },
    vanguard: { return: 3.5, range: [1, 6], vol: 18.0, note: 'Inflation hedge' },
    blackrock: { return: 4.0, vol: 17.5, note: 'Geopolitical risk' },
    historical: { return: 4.5, vol: 18.5, period: '1970-2024' },
  },
};

const THEMES = [
  {
    title: 'U.S. Equity Returns Are Muted',
    icon: '📉',
    detail: 'All major firms expect 6-7% vs. historical 10%. Why? Elevated valuations (P/E ~21x vs 16x average), compressed equity risk premium, and higher rates creating competition from bonds.',
    implication: 'Don\'t expect the next decade to look like the last. Diversification matters more.',
    color: 'orange'
  },
  {
    title: 'International Equities Look Attractive',
    icon: '🌍',
    detail: 'Lower starting valuations (P/E ~14x), potential currency tailwinds, and cyclical catch-up opportunity. JPMorgan and Goldman expect international to outperform U.S.',
    implication: 'Consider increasing international allocation beyond typical home bias.',
    color: 'green'
  },
  {
    title: 'Fixed Income Renaissance',
    icon: '📈',
    detail: 'Starting yields of 4-5% mean bonds actually provide income again. After a brutal 2022, the math works. Bonds now offer real diversification from equities.',
    implication: 'Bonds aren\'t dead. They\'re finally competitive.',
    color: 'blue'
  },
  {
    title: 'Real Estate Reset',
    icon: '🏢',
    detail: 'JPMorgan calls it a "generational opportunity." After 2022-23 valuation reset, expected returns of 7-8% with meaningful income component.',
    implication: 'REITs may be attractive for income and diversification.',
    color: 'purple'
  },
];

export default function CMADashboard() {
  const [selectedAsset, setSelectedAsset] = useState('US Large Cap');
  const [showMethodology, setShowMethodology] = useState(false);

  const asset = CMA_DATA[selectedAsset];
  const firms = ['jpmorgan', 'vanguard', 'blackrock', 'goldman'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">Capital Market Assumptions</h2>
            <p className="opacity-90">
              10-year return forecasts from major asset managers. These are starting points, not guarantees.
            </p>
          </div>
          <button 
            onClick={() => setShowMethodology(!showMethodology)}
            className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition"
          >
            {showMethodology ? 'Hide' : 'Show'} Methodology
          </button>
        </div>

        {showMethodology && (
          <div className="mt-4 p-4 bg-white/10 rounded-lg text-sm">
            <p className="font-medium mb-2">How Firms Build CMAs:</p>
            <ul className="space-y-1 opacity-90">
              <li>• <strong>Vanguard (VCMM):</strong> Monte Carlo simulation, 10,000 runs, full probability distributions</li>
              <li>• <strong>JPMorgan (LTCMA):</strong> Building blocks approach, 200+ assets, 100+ contributors</li>
              <li>• <strong>BlackRock:</strong> Augmented DCF models, bottom-up earnings, structural drivers</li>
              <li>• <strong>Goldman Sachs:</strong> Proprietary models, shorter-term tactical overlays</li>
            </ul>
            <p className="mt-3 text-xs opacity-70">
              ⚠️ CMAs have wide confidence intervals. A 6% expected return could easily realize as 2% or 12% over 10 years.
            </p>
          </div>
        )}
      </div>

      {/* Key Themes */}
      <div>
        <h3 className="font-semibold text-lg mb-3">🎯 2025 Key Themes (Consensus)</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {THEMES.map((theme, i) => (
            <div key={i} className={`bg-${theme.color}-50 border border-${theme.color}-200 rounded-xl p-4`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{theme.icon}</span>
                <div>
                  <h4 className={`font-semibold text-${theme.color}-800`}>{theme.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{theme.detail}</p>
                  <p className={`text-sm font-medium text-${theme.color}-700 mt-2`}>
                    → {theme.implication}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Asset Selector */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold mb-4">📊 Compare CMAs by Asset Class</h3>
        
        {/* Asset Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.keys(CMA_DATA).map(assetName => (
            <button
              key={assetName}
              onClick={() => setSelectedAsset(assetName)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                selectedAsset === assetName 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {assetName}
            </button>
          ))}
        </div>

        {/* CMA Comparison */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium">Firm</th>
                <th className="text-center py-3 px-4 font-medium">Expected Return</th>
                <th className="text-center py-3 px-4 font-medium">Volatility</th>
                <th className="text-left py-3 px-4 font-medium">Note</th>
              </tr>
            </thead>
            <tbody>
              {firms.map(firm => asset[firm] && (
                <tr key={firm} className="border-t">
                  <td className="py-3 px-4">
                    <span className="font-medium capitalize">
                      {firm === 'jpmorgan' ? 'JPMorgan' : 
                       firm === 'vanguard' ? 'Vanguard' :
                       firm === 'blackrock' ? 'BlackRock' : 'Goldman Sachs'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-xl font-bold text-green-600">
                      {asset[firm].return}%
                    </span>
                    {asset[firm].range && (
                      <span className="text-xs text-gray-500 block">
                        Range: {asset[firm].range[0]}-{asset[firm].range[1]}%
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-gray-700">{asset[firm].vol}%</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {asset[firm].note}
                  </td>
                </tr>
              ))}
              {asset.historical && (
                <tr className="border-t bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-500">Historical Avg</span>
                    <span className="text-xs text-gray-400 block">{asset.historical.period}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-xl font-bold text-gray-500">
                      {asset.historical.return}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-500">
                    {asset.historical.vol}%
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500 italic">
                    Past performance ≠ future results
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Visual Comparison */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Expected Return Comparison</h4>
          <div className="space-y-2">
            {firms.filter(f => asset[f]).map(firm => (
              <div key={firm} className="flex items-center gap-3">
                <span className="w-20 text-xs text-gray-600 capitalize">
                  {firm === 'jpmorgan' ? 'JPM' : 
                   firm === 'vanguard' ? 'VGD' :
                   firm === 'blackrock' ? 'BLK' : 'GS'}
                </span>
                <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all"
                    style={{ width: `${(asset[firm].return / 12) * 100}%` }}
                  />
                </div>
                <span className="w-12 text-right font-bold text-green-600">
                  {asset[firm].return}%
                </span>
              </div>
            ))}
            {asset.historical && (
              <div className="flex items-center gap-3 opacity-60">
                <span className="w-20 text-xs text-gray-600">Hist.</span>
                <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gray-400 rounded-full"
                    style={{ width: `${(asset.historical.return / 12) * 100}%` }}
                  />
                </div>
                <span className="w-12 text-right font-bold text-gray-500">
                  {asset.historical.return}%
                </span>
              </div>
            )}
          </div>
        </div>

        {asset.note && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            ⚠️ {asset.note}
          </div>
        )}
      </div>

      {/* 60/40 Projection */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold mb-4">📈 60/40 Portfolio Outlook</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-indigo-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">JPMorgan Forecast</p>
            <p className="text-3xl font-bold text-indigo-600">6.4%</p>
            <p className="text-xs text-gray-500">10-year expected</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">Vanguard Forecast</p>
            <p className="text-3xl font-bold text-blue-600">5.5%</p>
            <p className="text-xs text-gray-500">median estimate</p>
          </div>
          <div className="text-center p-4 bg-gray-100 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">Historical Avg</p>
            <p className="text-3xl font-bold text-gray-500">8.1%</p>
            <p className="text-xs text-gray-500">1926-2024</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-4">
          The 60/40 portfolio isn't dead, but don't expect historical returns. Current valuations and 
          interest rates suggest 2-3% lower returns than the long-term average.
        </p>
      </div>

      {/* Sources */}
      <details className="bg-gray-50 rounded-lg p-4 text-sm">
        <summary className="cursor-pointer font-medium">📚 Sources</summary>
        <div className="mt-3 space-y-2 text-gray-600">
          <p>• JPMorgan Long-Term Capital Market Assumptions 2025 (29th edition)</p>
          <p>• Vanguard Capital Markets Model (VCMM) 2025</p>
          <p>• BlackRock Capital Market Assumptions 2025</p>
          <p>• Goldman Sachs 10-Year Forecasts (December 2024)</p>
          <p className="text-xs text-gray-400 mt-2">
            Last updated: February 2026. CMAs are updated annually by each firm.
          </p>
        </div>
      </details>
    </div>
  );
}
