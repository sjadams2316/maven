'use client';

import { useState, useEffect } from 'react';

const ASSET_CLASSES = ['US Equity', 'Intl Developed', 'Emerging Markets', 'US Bonds'];

const PRESET_ALLOCATIONS = {
  'aggressive': { name: 'Aggressive Growth', desc: '90% equity', allocation: { 'US Equity': 60, 'Intl Developed': 20, 'Emerging Markets': 10, 'US Bonds': 10 } },
  'growth': { name: 'Growth', desc: '80% equity', allocation: { 'US Equity': 55, 'Intl Developed': 15, 'Emerging Markets': 10, 'US Bonds': 20 } },
  'balanced': { name: 'Balanced', desc: '60% equity', allocation: { 'US Equity': 40, 'Intl Developed': 12, 'Emerging Markets': 8, 'US Bonds': 40 } },
  'moderate': { name: 'Moderate', desc: '40% equity', allocation: { 'US Equity': 28, 'Intl Developed': 8, 'Emerging Markets': 4, 'US Bonds': 60 } },
  'conservative': { name: 'Conservative', desc: '20% equity', allocation: { 'US Equity': 15, 'Intl Developed': 5, 'Emerging Markets': 0, 'US Bonds': 80 } }
};

const MODEL_PORTFOLIOS = {
  'blackrock_growth': { manager: 'BlackRock', name: 'Growth', allocation: { 'US Equity': 55, 'Intl Developed': 15, 'Emerging Markets': 5, 'US Bonds': 25 } },
  'vanguard_balanced': { manager: 'Vanguard', name: 'Balanced Index', allocation: { 'US Equity': 40, 'Intl Developed': 15, 'Emerging Markets': 5, 'US Bonds': 40 } },
  'capitalgroup_growth': { manager: 'Capital Group', name: 'Growth', allocation: { 'US Equity': 50, 'Intl Developed': 20, 'Emerging Markets': 10, 'US Bonds': 20 } },
  'fidelity_60': { manager: 'Fidelity', name: '60/40', allocation: { 'US Equity': 45, 'Intl Developed': 12, 'Emerging Markets': 3, 'US Bonds': 40 } },
  'jpmorgan_balanced': { manager: 'JP Morgan', name: 'Balanced', allocation: { 'US Equity': 45, 'Intl Developed': 10, 'Emerging Markets': 5, 'US Bonds': 40 } }
};

// Insight type styling
const INSIGHT_STYLES = {
  positive: 'bg-green-50 border-green-200 text-green-800',
  negative: 'bg-red-50 border-red-200 text-red-800',
  caution: 'bg-orange-50 border-orange-200 text-orange-800',
  warning: 'bg-red-50 border-red-200 text-red-700',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  opportunity: 'bg-purple-50 border-purple-200 text-purple-800',
  projection: 'bg-indigo-50 border-indigo-200 text-indigo-800',
  aggressive: 'bg-red-50 border-red-200 text-red-800',
  growth: 'bg-green-50 border-green-200 text-green-800',
  moderate: 'bg-blue-50 border-blue-200 text-blue-800',
  conservative: 'bg-gray-50 border-gray-200 text-gray-800'
};

function InsightCard({ insight }) {
  const style = INSIGHT_STYLES[insight.type] || INSIGHT_STYLES.info;
  return (
    <div className={`p-3 rounded-lg border ${style}`}>
      <div className="flex items-start gap-2">
        <span className="text-lg">{insight.icon}</span>
        <div className="flex-1">
          <p className="font-medium">{insight.text}</p>
          {insight.detail && <p className="text-sm opacity-80 mt-1">{insight.detail}</p>}
          {insight.recovery && <p className="text-xs opacity-70 mt-1">Recovery time: {insight.recovery}</p>}
        </div>
        {insight.impact !== undefined && (
          <span className={`font-bold text-lg ${insight.impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {insight.impact > 0 ? '+' : ''}{insight.impact.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}

export default function AutoOptimizer({ onPortfolioCreated, initialAllocation, riskProfile, autoRun, onAutoRunComplete, hybridRecommendations, hybridModelName }) {
  const [allocation, setAllocation] = useState({ 'US Equity': 55, 'Intl Developed': 15, 'Emerging Markets': 10, 'US Bonds': 20 });
  const [preferences, setPreferences] = useState({ preferETF: true, maxExpenseRatio: '' });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasAutoRun, setHasAutoRun] = useState(false);

  // Apply initial allocation from risk profiler
  useEffect(() => {
    if (initialAllocation) {
      setAllocation(initialAllocation);
    }
  }, [initialAllocation]);

  // Auto-run optimizer when triggered from risk profiler
  useEffect(() => {
    if (autoRun && initialAllocation && !hasAutoRun && !loading) {
      setHasAutoRun(true);
      // Small delay to let the allocation state update
      setTimeout(() => {
        // If we have hybrid recommendations, use those directly instead of re-optimizing
        if (hybridRecommendations && hybridRecommendations.length > 0) {
          displayHybridRecommendations(initialAllocation, hybridRecommendations);
        } else {
          runOptimizerWithAllocation(initialAllocation);
        }
        if (onAutoRunComplete) onAutoRunComplete();
      }, 100);
    }
  }, [autoRun, initialAllocation, hasAutoRun, loading, hybridRecommendations]);

  // Convert hybrid recommendations to the results format that AutoOptimizer expects
  const displayHybridRecommendations = (alloc, recommendations) => {
    setLoading(true);
    
    // Calculate totals
    const totalExpense = recommendations.reduce((sum, r) => sum + (r.expense * r.weight / 100), 0);
    const totalEquity = (alloc['US Equity'] || 0) + (alloc['Intl Developed'] || 0) + (alloc['Emerging Markets'] || 0);
    
    // Build portfolio object from recommendations
    const portfolio = recommendations.map(rec => ({
      ticker: rec.ticker,
      name: rec.name,
      weight: rec.weight / 100,
      expense_ratio: rec.expense,
      asset_class: rec.asset,
      type: rec.type,
      manager: rec.manager,
      description: rec.description,
      bullets: rec.bullets,
      bestFor: rec.bestFor,
      aum: rec.aum,
      asOf: rec.asOf,
      rationale: rec.rationale,
      category: rec.category
    }));

    // Estimate expected returns based on allocation
    const expectedReturn = (totalEquity * 0.08) + ((100 - totalEquity) * 0.04);
    const volatility = (totalEquity * 0.15) + ((100 - totalEquity) * 0.05);

    // Create results object that matches the API response format
    const results = {
      portfolio,
      portfolioMetrics: {
        expectedReturn: expectedReturn,
        volatility: volatility,
        sharpeRatio: (expectedReturn - 2) / volatility,
        weightedExpenseRatio: totalExpense,
      },
      allocation: alloc,
      explanations: {
        allocation: [
          { icon: '⭐', type: 'info', text: hybridModelName || 'All-Star Hybrid Portfolio', detail: 'Built from analysis of leading asset manager models, weighted by Sharpe ratio' },
          { icon: '🎯', type: 'positive', text: 'Core + Satellite Strategy', detail: '50% passive (low-cost beta) + 50% active (alpha potential) per asset class' },
        ],
        optimization: [
          { icon: '📊', type: 'info', text: `Blended Expense Ratio: ${(totalExpense * 100).toFixed(2)}%`, detail: 'Weighted average across passive and active components' },
          { icon: '🏆', type: 'positive', text: 'Multi-Manager Diversification', detail: 'Funds from Vanguard, BlackRock, Capital Group, Fidelity, JPMorgan, PGIM, Schwab' },
        ],
        risks: []
      },
      isHybridModel: true
    };

    setResults(results);
    setLoading(false);
  };

  const runOptimizerWithAllocation = async (alloc) => {
    setLoading(true);
    setResults(null);

    try {
      const payload = {
        allocation: Object.fromEntries(
          Object.entries(alloc).filter(([, v]) => v > 0).map(([k, v]) => [k, v / 100])
        ),
        preferences: {
          preferETF: preferences.preferETF,
          maxExpenseRatio: preferences.maxExpenseRatio ? parseFloat(preferences.maxExpenseRatio) / 100 : null
        }
      };

      const res = await fetch('/api/auto-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await res.text();
        alert('Error: ' + errText);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setResults(data);
    } catch (err) {
      alert('Failed to run optimizer: ' + err.message);
    }
    setLoading(false);
  };

  const totalAllocation = Object.values(allocation).reduce((a, b) => a + b, 0);

  const handlePreset = (key) => {
    setAllocation({ ...PRESET_ALLOCATIONS[key].allocation });
  };

  const runOptimizer = async () => {
    if (Math.abs(totalAllocation - 100) > 0.1) {
      alert('Allocation must sum to 100%');
      return;
    }
    await runOptimizerWithAllocation(allocation);
  };

  const saveAsPortfolio = async () => {
    if (!results) return;

    const name = prompt('Portfolio name:', 'Optimized Portfolio');
    if (!name) return;

    try {
      await fetch('/api/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          holdings: results.portfolio.map(p => ({ ticker: p.ticker, weight: p.weight }))
        })
      });
      alert('Portfolio saved!');
      if (onPortfolioCreated) onPortfolioCreated();
    } catch (err) {
      alert('Failed to save portfolio');
    }
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Allocation */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-lg mb-4">1. Set Target Asset Allocation</h3>

        {/* Quick Presets */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Quick presets:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PRESET_ALLOCATIONS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => handlePreset(key)}
                className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded transition"
              >
                <span className="font-medium">{preset.name}</span>
                <span className="text-gray-500 ml-1 text-xs">{preset.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Model Portfolios */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 mb-2">📊 Start from asset manager model:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(MODEL_PORTFOLIOS).map(([key, model]) => (
              <button
                key={key}
                onClick={() => setAllocation({ ...model.allocation })}
                className="text-sm bg-white border border-blue-200 hover:bg-blue-100 px-3 py-1 rounded transition"
              >
                {model.manager} {model.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4">
          {ASSET_CLASSES.map(ac => (
            <div key={ac} className="flex items-center gap-4">
              <span className="w-36 text-sm font-medium">{ac}</span>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={allocation[ac] || 0}
                onChange={(e) => setAllocation({ ...allocation, [ac]: parseInt(e.target.value) })}
                className="flex-1 accent-blue-600"
              />
              <span className="w-12 text-right font-bold">{allocation[ac] || 0}%</span>
            </div>
          ))}
        </div>

        <div className={`mt-4 text-right font-bold text-lg ${Math.abs(totalAllocation - 100) < 0.1 ? 'text-green-600' : 'text-red-600'}`}>
          Total: {totalAllocation}% {Math.abs(totalAllocation - 100) < 0.1 ? '✓' : '(must equal 100%)'}
        </div>
      </div>

      {/* Step 2: Preferences */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-lg mb-4">2. Preferences (Optional)</h3>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.preferETF}
              onChange={(e) => setPreferences({ ...preferences, preferETF: e.target.checked })}
              className="h-4 w-4 accent-blue-600"
            />
            <span>Prefer ETFs over Mutual Funds</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Max Expense Ratio:</span>
            <input
              type="number"
              step="0.01"
              placeholder="e.g., 0.20"
              value={preferences.maxExpenseRatio}
              onChange={(e) => setPreferences({ ...preferences, maxExpenseRatio: e.target.value })}
              className="w-24 border rounded px-2 py-1 text-sm"
            />
            <span className="text-gray-500 text-sm">%</span>
          </div>
        </div>
      </div>

      {/* Run Button */}
      <button
        onClick={runOptimizer}
        disabled={loading || Math.abs(totalAllocation - 100) > 0.1}
        className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 disabled:opacity-50 transition shadow-lg"
      >
        {loading ? '🔄 Optimizing...' : '🚀 Find Optimal Portfolio'}
      </button>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Portfolio Summary */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
              <div>
                <h3 className="font-bold text-xl text-green-800">✅ Optimal Portfolio Found</h3>
                <div className="flex flex-wrap gap-4 mt-2 text-sm">
                  <span className="bg-white px-2 py-1 rounded">
                    Expected Return: <strong>{results.portfolioMetrics.expectedReturn.toFixed(1)}%</strong>
                  </span>
                  <span className="bg-white px-2 py-1 rounded">
                    Volatility: <strong>{results.portfolioMetrics.volatility.toFixed(1)}%</strong>
                  </span>
                  <span className="bg-white px-2 py-1 rounded">
                    Sharpe: <strong>{results.portfolioMetrics.sharpeRatio.toFixed(2)}</strong>
                  </span>
                  <span className="bg-white px-2 py-1 rounded">
                    Expense: <strong>{(results.portfolioMetrics.weightedExpenseRatio * 100).toFixed(3)}%</strong>
                  </span>
                </div>
              </div>
              <button
                onClick={saveAsPortfolio}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium transition"
              >
                💾 Save Portfolio
              </button>
            </div>

            {/* Selected Funds */}
            {results.isHybridModel ? (
              /* Enhanced display for hybrid model with full fund details */
              <div className="space-y-4">
                {['US Equity', 'Intl Developed', 'Emerging Markets', 'US Bonds'].map(assetClass => {
                  const funds = results.portfolio.filter(p => p.asset_class === assetClass);
                  if (funds.length === 0) return null;
                  return (
                    <div key={assetClass}>
                      <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <span>{assetClass}</span>
                        <span className="text-sm font-normal text-gray-500">
                          ({funds.reduce((sum, f) => sum + f.weight * 100, 0).toFixed(0)}% total)
                        </span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {funds.map(p => (
                          <div key={p.ticker} className="bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className={`text-xs px-2 py-0.5 rounded ${p.type?.includes('Active') ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {p.category || p.type}
                                </span>
                                <p className="font-bold text-lg text-gray-800 mt-1">{p.ticker}</p>
                                <p className="text-sm text-gray-600">{p.name}</p>
                                {p.manager && <p className="text-xs text-gray-400">{p.manager}</p>}
                              </div>
                              <div className="text-right">
                                <p className="text-green-600 font-bold text-xl">{(p.weight * 100).toFixed(0)}%</p>
                                <p className="text-xs text-gray-500">{p.expense_ratio}% ER</p>
                              </div>
                            </div>
                            {p.description && (
                              <p className="text-sm text-gray-600 mb-2">{p.description}</p>
                            )}
                            {p.bullets && p.bullets.length > 0 && (
                              <ul className="text-xs text-gray-500 space-y-1">
                                {p.bullets.slice(0, 2).map((b, i) => (
                                  <li key={i} className="flex items-start gap-1">
                                    <span className="text-green-500">✓</span>
                                    <span>{b}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                            {p.aum && (
                              <p className="text-xs text-gray-400 mt-2">AUM: ${p.aum} (as of {p.asOf})</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Standard compact display */
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {results.portfolio.map(p => (
                  <div key={p.ticker} className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="font-bold text-lg text-gray-800">{p.ticker}</p>
                    <p className="text-xs text-gray-500 truncate">{p.name}</p>
                    <p className="text-green-600 font-bold mt-1">{(p.weight * 100).toFixed(0)}%</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Why This Portfolio - Key Insights */}
          {results.explanations && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                📋 Why This Portfolio?
              </h3>

              {/* Allocation Insights */}
              {results.explanations.allocation?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">Allocation Strategy</h4>
                  <div className="space-y-2">
                    {results.explanations.allocation.map((insight, i) => (
                      <InsightCard key={i} insight={insight} />
                    ))}
                  </div>
                </div>
              )}

              {/* Optimization Insights */}
              {results.explanations.optimization?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">Efficiency Metrics</h4>
                  <div className="space-y-2">
                    {results.explanations.optimization.map((insight, i) => (
                      <InsightCard key={i} insight={insight} />
                    ))}
                  </div>
                </div>
              )}

              {/* Risk Insights */}
              {results.explanations.risks?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">⚠️ Risk Considerations</h4>
                  <div className="space-y-2">
                    {results.explanations.risks.map((insight, i) => (
                      <InsightCard key={i} insight={insight} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rearview Mirror & Forward Outlook */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rearview */}
            {results.explanations?.rearview?.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="font-bold text-lg mb-4">🔙 Rearview Mirror</h4>
                <p className="text-sm text-gray-500 mb-3">How this allocation would have performed in historical events:</p>
                <div className="space-y-2">
                  {results.explanations.rearview.map((insight, i) => (
                    <InsightCard key={i} insight={insight} />
                  ))}
                </div>
              </div>
            )}

            {/* Forward */}
            {results.explanations?.forward?.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="font-bold text-lg mb-4">🔮 Forward Outlook</h4>
                <p className="text-sm text-gray-500 mb-3">Projections and consensus views:</p>
                <div className="space-y-2">
                  {results.explanations.forward.map((insight, i) => (
                    <InsightCard key={i} insight={insight} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Model Comparison */}
          {results.modelComparisons && (
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-bold text-lg mb-4">📊 Comparison to Asset Manager Models</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-2 px-3">Model</th>
                      <th className="text-center py-2 px-3">Similarity</th>
                      <th className="text-center py-2 px-3">US Eq</th>
                      <th className="text-center py-2 px-3">Intl</th>
                      <th className="text-center py-2 px-3">EM</th>
                      <th className="text-center py-2 px-3">Bonds</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-blue-50 font-medium">
                      <td className="py-2 px-3">Your Portfolio</td>
                      <td className="text-center">—</td>
                      <td className="text-center">{((results.allocation['US Equity'] || 0) * 100).toFixed(0)}%</td>
                      <td className="text-center">{((results.allocation['Intl Developed'] || 0) * 100).toFixed(0)}%</td>
                      <td className="text-center">{((results.allocation['Emerging Markets'] || 0) * 100).toFixed(0)}%</td>
                      <td className="text-center">{((results.allocation['US Bonds'] || 0) * 100).toFixed(0)}%</td>
                    </tr>
                    {results.modelComparisons.map((model, i) => (
                      <tr key={model.id} className={i === 0 ? 'bg-green-50' : ''}>
                        <td className="py-2 px-3">
                          <span className="font-medium">{model.manager}</span>
                          <span className="text-gray-500 ml-1">{model.name}</span>
                          {i === 0 && <span className="ml-2 text-xs bg-green-200 text-green-800 px-1 rounded">Closest</span>}
                        </td>
                        <td className="text-center">
                          <span className={`font-medium ${model.similarity >= 80 ? 'text-green-600' : model.similarity >= 60 ? 'text-yellow-600' : 'text-gray-500'}`}>
                            {model.similarity.toFixed(0)}%
                          </span>
                        </td>
                        <td className="text-center">{(model.allocation['US Equity'] * 100).toFixed(0)}%</td>
                        <td className="text-center">{(model.allocation['Intl Developed'] * 100).toFixed(0)}%</td>
                        <td className="text-center">{(model.allocation['Emerging Markets'] * 100).toFixed(0)}%</td>
                        <td className="text-center">{(model.allocation['US Bonds'] * 100).toFixed(0)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Fund Selection Details */}
          <div className="space-y-4">
            <h4 className="font-bold text-lg">Fund Selection Details</h4>
            {Object.entries(results.results).map(([ac, data]) => data.selected && (
              <div key={ac} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h5 className="font-semibold text-lg">{ac}</h5>
                    <p className="text-sm text-gray-500">Target: {(data.weight * 100).toFixed(0)}% • Analyzed {data.fundsAnalyzed} funds</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-2xl text-green-600">{data.selected.ticker}</p>
                    <p className="text-sm text-gray-500">Score: {data.selected.totalScore.toFixed(1)}/100</p>
                  </div>
                </div>

                {/* Why This Fund */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-800 mb-2">Why {data.selected.ticker}?</p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {data.selected.reasoning.map((r, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span>•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-5 gap-2 mb-4 text-center text-sm">
                  {Object.entries(data.selected.scores).map(([key, score]) => (
                    <div key={key} className="bg-gray-50 rounded p-2">
                      <p className="text-gray-500 text-xs">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                      <p className={`font-bold ${score >= 70 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {score.toFixed(0)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Fund Stats */}
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Expense:</span>
                    <p className="font-medium">{((data.selected.expense_ratio || 0) * 100).toFixed(3)}%</p>
                  </div>
                  <div>
                    <span className="text-gray-500">1Y Return:</span>
                    <p className="font-medium">{data.selected.return_1yr?.toFixed(1) || '—'}%</p>
                  </div>
                  <div>
                    <span className="text-gray-500">3Y Return:</span>
                    <p className="font-medium">{data.selected.return_3yr?.toFixed(1) || '—'}%</p>
                  </div>
                  <div>
                    <span className="text-gray-500">AUM:</span>
                    <p className="font-medium">${data.selected.aum ? (data.selected.aum / 1e9).toFixed(1) + 'B' : '—'}</p>
                  </div>
                </div>

                {/* Top Alternatives */}
                <details className="mt-4 text-sm">
                  <summary className="cursor-pointer text-gray-600 hover:text-gray-800 font-medium">
                    View top 5 alternatives →
                  </summary>
                  <table className="w-full mt-2">
                    <thead className="text-xs text-gray-500 border-b">
                      <tr>
                        <th className="text-left py-1">#</th>
                        <th className="text-left py-1">Ticker</th>
                        <th className="text-left py-1">Name</th>
                        <th className="text-right py-1">Score</th>
                        <th className="text-right py-1">Expense</th>
                        <th className="text-right py-1">1Y</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topFunds.map(f => (
                        <tr key={f.ticker} className={f.rank === 1 ? 'bg-green-50 font-medium' : ''}>
                          <td className="py-1">{f.rank}</td>
                          <td className="py-1">{f.ticker}</td>
                          <td className="py-1 truncate max-w-[200px]">{f.name}</td>
                          <td className="py-1 text-right">{f.totalScore.toFixed(1)}</td>
                          <td className="py-1 text-right">{((f.expense_ratio || 0) * 100).toFixed(2)}%</td>
                          <td className="py-1 text-right">{f.return_1yr?.toFixed(1) || '—'}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              </div>
            ))}
          </div>

          {/* Methodology */}
          <details className="bg-gray-50 rounded-lg p-4 text-sm">
            <summary className="cursor-pointer font-medium">📐 Scoring Methodology</summary>
            <div className="mt-3 space-y-2 text-gray-600">
              <p><strong>Risk-Adjusted Return (30%):</strong> Sharpe ratio using actual returns and volatility</p>
              <p><strong>Expense Ratio (25%):</strong> Lower fees = higher score (exponentially weighted)</p>
              <p><strong>Consistency (15%):</strong> Variance of returns across 1yr, 3yr, 5yr, 10yr periods</p>
              <p><strong>Tracking Precision (15%):</strong> How closely fund tracks its asset class benchmark</p>
              <p><strong>Liquidity (15%):</strong> AUM-based score to ensure tradability</p>
              <hr className="my-2" />
              <p className="text-xs text-gray-500">
                Capital Market Assumptions based on consensus from BlackRock, Vanguard, JP Morgan, and Capital Group 2025 outlooks.
                Risk-free rate: {results.riskFreeRate}%.
              </p>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
