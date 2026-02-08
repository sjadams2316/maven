'use client';

import { useState, useEffect } from 'react';
import BenchmarkComparison from './BenchmarkComparison';
import StressTestPanel from './StressTestPanel';
import ModelBattle from './ModelBattle';
import AllocationPlayground from './AllocationPlayground';

export default function HybridModelView({ riskProfile, onGeneratePortfolio }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSourceModels, setShowSourceModels] = useState(false);
  const [selectedFund, setSelectedFund] = useState(null);
  const [activePanel, setActivePanel] = useState(null); // 'benchmark' | 'stress' | 'battle' | 'playground'

  useEffect(() => {
    if (riskProfile) {
      fetchHybridModel();
    }
  }, [riskProfile]);

  const fetchHybridModel = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hybrid-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riskProfile }),
      });
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error('Failed to fetch hybrid model:', err);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Analyzing {riskProfile} models from major asset managers...</p>
      </div>
    );
  }

  if (!data || !data.hybridModel) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-700">Failed to build hybrid model. Please try again.</p>
      </div>
    );
  }

  const { hybridModel, sourceModels, consensus, insights } = data;

  return (
    <div className="space-y-6">
      {/* Fund Detail Modal */}
      {selectedFund && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedFund(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className={`text-xs px-2 py-1 rounded ${selectedFund.type?.includes('Active') ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                  {selectedFund.type}
                </span>
                <h3 className="text-2xl font-bold mt-2">{selectedFund.ticker}</h3>
                <p className="text-gray-600">{selectedFund.name}</p>
                <p className="text-sm text-gray-500">{selectedFund.manager}</p>
              </div>
              <button onClick={() => setSelectedFund(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            
            {selectedFund.description && (
              <p className="text-gray-700 mb-4">{selectedFund.description}</p>
            )}
            
            {selectedFund.bullets && (
              <ul className="space-y-2 mb-4">
                {selectedFund.bullets.map((bullet, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-indigo-500 mt-1">✓</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
            
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-500">Expense Ratio</p>
                <p className="text-lg font-bold text-green-600">{selectedFund.expense}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Weight in Portfolio</p>
                <p className="text-lg font-bold text-indigo-600">{selectedFund.weight}%</p>
              </div>
              {selectedFund.aum && (
                <div>
                  <p className="text-xs text-gray-500">Assets Under Management</p>
                  <p className="text-lg font-bold text-gray-700">${selectedFund.aum}</p>
                </div>
              )}
              {selectedFund.asOf && (
                <div>
                  <p className="text-xs text-gray-500">Data As Of</p>
                  <p className="text-lg font-bold text-gray-700">{selectedFund.asOf}</p>
                </div>
              )}
            </div>
            
            {selectedFund.bestFor && (
              <p className="mt-4 text-sm text-gray-600">
                <strong>Best for:</strong> {selectedFund.bestFor}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Hero Section with Personality */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-2xl p-8">
        <div className="flex items-start justify-between">
          <div>
            {insights && (
              <p className="text-indigo-200 text-sm font-medium mb-1">"{insights.nickname}"</p>
            )}
            <h2 className="text-3xl font-bold mb-2">{hybridModel.name}</h2>
            <p className="text-indigo-100 mb-4">
              Built by analyzing {sourceModels.length} model portfolios from leading asset managers, 
              weighted by historical risk-adjusted returns (Sharpe ratio).
            </p>
            <span className="inline-flex items-center gap-1 bg-white/20 text-white text-xs px-3 py-1 rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
              Fund data as of Q4 2025
            </span>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">{hybridModel.expectedReturn}%</p>
            <p className="text-indigo-200 text-sm">Expected Return</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{hybridModel.expectedReturn}%</p>
            <p className="text-xs text-indigo-200">Expected Return</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{hybridModel.expectedVol}%</p>
            <p className="text-xs text-indigo-200">Expected Volatility</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{hybridModel.sharpe}</p>
            <p className="text-xs text-indigo-200">Sharpe Ratio</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{sourceModels.length}</p>
            <p className="text-xs text-indigo-200">Source Models</p>
          </div>
        </div>
      </div>

      {/* Model Philosophy & Quote */}
      {insights && (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🎯</div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">Investment Philosophy</h3>
              <p className="text-gray-700 mb-4">{insights.philosophy}</p>
              
              <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg mb-4">
                <p className="text-gray-700 italic">{insights.quote}</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Why This Model Works</h4>
                  <ul className="space-y-1">
                    {insights.bullets?.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-green-500">✓</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Market Conditions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-green-500">📈</span>
                      <div><strong>Bull Market:</strong> <span className="text-gray-600">{insights.marketConditions?.bullMarket}</span></div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-red-500">📉</span>
                      <div><strong>Bear Market:</strong> <span className="text-gray-600">{insights.marketConditions?.bearMarket}</span></div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-amber-500">💰</span>
                      <div><strong>Rising Rates:</strong> <span className="text-gray-600">{insights.marketConditions?.risingRates}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hybrid Allocation */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold text-lg mb-4">📊 Optimal Allocation (Sharpe-Weighted Consensus)</h3>
        
        <div className="space-y-3 mb-6">
          {Object.entries(hybridModel.allocation).filter(([_, v]) => v > 0).map(([asset, weight]) => (
            <div key={asset} className="flex items-center gap-4">
              <span className="w-32 text-sm font-medium">{asset}</span>
              <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${weight}%` }}
                />
              </div>
              <span className="w-16 text-right font-bold text-lg">{weight}%</span>
            </div>
          ))}
        </div>

        {/* Consensus Analysis */}
        {consensus && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h4 className="font-medium text-gray-700 mb-3">Manager Consensus Analysis</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {Object.entries(consensus).map(([asset, data]) => (
                <div key={asset} className="bg-white rounded-lg p-3">
                  <p className="font-medium text-gray-800">{asset}</p>
                  <p className="text-gray-500">Range: {data.min}% - {data.max}%</p>
                  <p className={`text-xs mt-1 ${
                    data.consensus === 'Strong' ? 'text-green-600' :
                    data.consensus === 'Moderate' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {data.consensus} consensus (±{data.spread}%)
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Funds */}
        <h4 className="font-medium text-gray-700 mb-3">🎯 Recommended Fund Implementation (Active + Passive Mix)</h4>
        
        {/* Group by category */}
        <div className="space-y-4">
          {/* Core (Passive) */}
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">📊 Core Holdings (Low-Cost Beta) — <span className="text-blue-600">Click any fund for details</span></p>
            <div className="grid md:grid-cols-2 gap-3">
              {hybridModel.recommendations.filter(r => r.category === 'Core (Passive)').map((rec, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedFund(rec)}
                  className="border border-blue-200 bg-blue-50 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xl font-bold text-blue-700">{rec.ticker}</span>
                      <span className="text-blue-600 text-sm ml-2">{rec.weight}%</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded block">{rec.type}</span>
                      <span className="text-xs text-gray-500">{rec.manager}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{rec.name}</p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">{rec.rationale}</p>
                    <span className="text-xs font-medium text-green-600">{rec.expense}% ER</span>
                  </div>
                  <p className="text-xs text-blue-500 mt-2">Click for details →</p>
                </div>
              ))}
            </div>
          </div>

          {/* Satellite (Active) */}
          {hybridModel.recommendations.filter(r => r.category === 'Satellite (Active)').length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">🎯 Satellite Holdings (Active Alpha) — <span className="text-purple-600">Click any fund for details</span></p>
              <div className="grid md:grid-cols-2 gap-3">
                {hybridModel.recommendations.filter(r => r.category === 'Satellite (Active)').map((rec, i) => (
                  <div 
                    key={i} 
                    onClick={() => setSelectedFund(rec)}
                    className="border border-purple-200 bg-purple-50 rounded-lg p-4 hover:border-purple-400 hover:shadow-md transition cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xl font-bold text-purple-700">{rec.ticker}</span>
                        <span className="text-purple-600 text-sm ml-2">{rec.weight}%</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded block">{rec.type}</span>
                        <span className="text-xs text-gray-500">{rec.manager}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{rec.name}</p>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500">{rec.rationale}</p>
                      <span className="text-xs font-medium text-amber-600">{rec.expense}% ER</span>
                    </div>
                    <p className="text-xs text-purple-500 mt-2">Click for details →</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Philosophy Note */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
          <strong>Core + Satellite Approach:</strong> We combine low-cost passive funds for core market exposure (beta) 
          with select active funds that have demonstrated alpha potential. This balances cost efficiency with the 
          opportunity for outperformance.
        </div>
      </div>

      {/* Source Models */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">📈 Source Model Analysis</h3>
          <button 
            onClick={() => setShowSourceModels(!showSourceModels)}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            {showSourceModels ? 'Hide Details' : 'Show All Models'}
          </button>
        </div>

        {/* Weight Breakdown */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Models weighted by historical Sharpe ratio:</p>
          <div className="flex flex-wrap gap-2">
            {hybridModel.sourceModels.map((model, i) => (
              <div 
                key={i} 
                className="bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 text-sm"
              >
                <span className="font-medium text-indigo-800">{model.manager}</span>
                <span className="text-indigo-600 ml-2">{model.weight}</span>
                <span className="text-gray-500 ml-1 text-xs">(Sharpe: {model.sharpe})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Full Model Table */}
        {showSourceModels && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-3">Manager</th>
                  <th className="text-left py-2 px-3">Model</th>
                  <th className="text-center py-2 px-3">US Eq</th>
                  <th className="text-center py-2 px-3">Intl</th>
                  <th className="text-center py-2 px-3">Bonds</th>
                  <th className="text-center py-2 px-3">Return</th>
                  <th className="text-center py-2 px-3">Vol</th>
                  <th className="text-center py-2 px-3">Sharpe</th>
                  <th className="text-center py-2 px-3">Expense</th>
                </tr>
              </thead>
              <tbody>
                {sourceModels.map((model, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium">{model.manager}</td>
                    <td className="py-2 px-3 text-gray-600 text-xs">{model.model}</td>
                    <td className="py-2 px-3 text-center">{model.allocation['US Equity'] || 0}%</td>
                    <td className="py-2 px-3 text-center">{(model.allocation['Intl Equity'] || 0) + (model.allocation['Intl Developed'] || 0)}%</td>
                    <td className="py-2 px-3 text-center">{(model.allocation['US Bonds'] || 0) + (model.allocation['Intl Bonds'] || 0)}%</td>
                    <td className="py-2 px-3 text-center text-green-600 font-medium">{model.historicalReturn}%</td>
                    <td className="py-2 px-3 text-center">{model.historicalVol}%</td>
                    <td className="py-2 px-3 text-center font-bold">{model.sharpe}</td>
                    <td className="py-2 px-3 text-center text-gray-500">{model.expenseRatio}%</td>
                  </tr>
                ))}
                {/* Hybrid row */}
                <tr className="border-t-2 border-indigo-300 bg-indigo-50 font-bold">
                  <td className="py-2 px-3 text-indigo-700">Maven</td>
                  <td className="py-2 px-3 text-indigo-600 text-xs">All-Star Hybrid</td>
                  <td className="py-2 px-3 text-center">{hybridModel.allocation['US Equity']}%</td>
                  <td className="py-2 px-3 text-center">{hybridModel.allocation['Intl Developed']}%</td>
                  <td className="py-2 px-3 text-center">{hybridModel.allocation['US Bonds']}%</td>
                  <td className="py-2 px-3 text-center text-green-600">{hybridModel.expectedReturn}%</td>
                  <td className="py-2 px-3 text-center">{hybridModel.expectedVol}%</td>
                  <td className="py-2 px-3 text-center text-indigo-700">{hybridModel.sharpe}</td>
                  <td className="py-2 px-3 text-center text-green-600">~0.05%</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Interactive Panels */}
      {activePanel === 'benchmark' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <BenchmarkComparison 
              portfolio={hybridModel} 
              onClose={() => setActivePanel(null)} 
            />
          </div>
        </div>
      )}

      {activePanel === 'stress' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <StressTestPanel 
              portfolio={hybridModel}
              allocation={hybridModel.allocation}
              onClose={() => setActivePanel(null)} 
            />
          </div>
        </div>
      )}

      {activePanel === 'battle' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6">
            <ModelBattle 
              portfolio={hybridModel}
              allocation={hybridModel.allocation}
              onClose={() => setActivePanel(null)} 
            />
          </div>
        </div>
      )}

      {activePanel === 'playground' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <AllocationPlayground 
              initialAllocation={hybridModel.allocation}
              onClose={() => setActivePanel(null)} 
            />
          </div>
        </div>
      )}

      {/* What's Next - Gamified Actions */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold mb-2">🎮 What Do You Want To Do?</h3>
          <p className="text-slate-300">Your All-Star portfolio is ready. Now let's explore it.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* Primary CTA */}
          <div 
            onClick={() => onGeneratePortfolio({ 
              allocation: hybridModel.allocation, 
              recommendations: hybridModel.recommendations,
              modelName: hybridModel.name,
              insights: insights
            })}
            className="col-span-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 cursor-pointer hover:from-green-400 hover:to-emerald-400 transition shadow-lg group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xl font-bold mb-1">🔍 Dig Deeper Into This Portfolio</h4>
                <p className="text-green-100">See the full fund lineup, implementation details, and get ready to invest</p>
              </div>
              <div className="text-4xl group-hover:translate-x-2 transition-transform">→</div>
            </div>
          </div>

          {/* Compare to Benchmark */}
          <div 
            onClick={() => setActivePanel('benchmark')}
            className="bg-slate-700/50 rounded-xl p-5 cursor-pointer hover:bg-slate-700 hover:scale-[1.02] transition group"
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl">📊</div>
              <div>
                <h4 className="font-bold mb-1">Compare to Benchmarks</h4>
                <p className="text-sm text-slate-400">See how your All-Star stacks up vs S&P 500, 60/40, and target-date funds</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs bg-slate-600 px-2 py-1 rounded">vs S&P 500</span>
              <span className="text-xs bg-slate-600 px-2 py-1 rounded">vs 60/40</span>
              <span className="text-xs bg-slate-600 px-2 py-1 rounded">vs Target Date</span>
            </div>
          </div>

          {/* Stress Test */}
          <div 
            onClick={() => setActivePanel('stress')}
            className="bg-slate-700/50 rounded-xl p-5 cursor-pointer hover:bg-slate-700 hover:scale-[1.02] transition group"
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl">🔥</div>
              <div>
                <h4 className="font-bold mb-1">Stress Test It</h4>
                <p className="text-sm text-slate-400">How would your portfolio handle 2008, COVID crash, or rising rates?</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs bg-red-900/50 px-2 py-1 rounded">2008 Crisis</span>
              <span className="text-xs bg-red-900/50 px-2 py-1 rounded">COVID Crash</span>
              <span className="text-xs bg-amber-900/50 px-2 py-1 rounded">2022 Bear</span>
            </div>
          </div>

          {/* Compare to Other Models */}
          <div 
            onClick={() => setActivePanel('battle')}
            className="bg-slate-700/50 rounded-xl p-5 cursor-pointer hover:bg-slate-700 hover:scale-[1.02] transition group"
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl">⚔️</div>
              <div>
                <h4 className="font-bold mb-1">Battle Other Models</h4>
                <p className="text-sm text-slate-400">Head-to-head vs Vanguard LifeStrategy, BlackRock, Fidelity models</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs bg-blue-900/50 px-2 py-1 rounded">vs Vanguard</span>
              <span className="text-xs bg-slate-600 px-2 py-1 rounded">vs BlackRock</span>
              <span className="text-xs bg-green-900/50 px-2 py-1 rounded">vs Fidelity</span>
            </div>
          </div>

          {/* Allocation Playground */}
          <div 
            onClick={() => setActivePanel('playground')}
            className="bg-slate-700/50 rounded-xl p-5 cursor-pointer hover:bg-slate-700 hover:scale-[1.02] transition group"
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl">🎛️</div>
              <div>
                <h4 className="font-bold mb-1">Allocation Playground</h4>
                <p className="text-sm text-slate-400">Adjust the dials and watch return, volatility, and Sharpe change in real-time</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">More bonds</span>
                <div className="flex-1 h-1 bg-slate-600 rounded">
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-green-500 rounded w-3/5"></div>
                </div>
                <span className="text-slate-400">More stocks</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fun Stats */}
        <div className="border-t border-slate-700 pt-6">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-green-400">{hybridModel.expectedReturn}%</p>
              <p className="text-xs text-slate-400">Expected Return</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-400">{hybridModel.expectedVol}%</p>
              <p className="text-xs text-slate-400">Volatility</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-400">{hybridModel.sharpe}</p>
              <p className="text-xs text-slate-400">Sharpe Ratio</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-400">{sourceModels.length}</p>
              <p className="text-xs text-slate-400">Models Combined</p>
            </div>
          </div>
        </div>

        {/* Achievement Badge */}
        <div className="mt-6 flex justify-center">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-full px-6 py-2 flex items-center gap-2 shadow-lg">
            <span className="text-xl">🏆</span>
            <span className="font-bold">All-Star Portfolio Unlocked!</span>
          </div>
        </div>
      </div>

      {/* Methodology */}
      <details className="bg-gray-50 rounded-xl p-4 text-sm">
        <summary className="cursor-pointer font-medium">📐 Methodology</summary>
        <div className="mt-3 space-y-2 text-gray-600">
          <p><strong>Step 1:</strong> Collected model portfolios from 6 major asset managers (Vanguard, BlackRock, JPMorgan, Capital Group, Fidelity, Schwab)</p>
          <p><strong>Step 2:</strong> Normalized allocations to standard asset classes (US Equity, Intl Developed, Emerging Markets, US Bonds)</p>
          <p><strong>Step 3:</strong> Calculated weights based on historical Sharpe ratio (higher risk-adjusted returns = more weight)</p>
          <p><strong>Step 4:</strong> Built weighted average allocation = Maven All-Star Hybrid</p>
          <p><strong>Step 5:</strong> Selected lowest-cost funds for implementation (targeting &lt;0.10% weighted expense)</p>
          <hr className="my-2" />
          <p className="text-xs text-gray-500">
            Historical data from Morningstar and fund fact sheets. Past performance does not guarantee future results.
            This is not investment advice — consult a qualified advisor for personalized recommendations.
          </p>
        </div>
      </details>
    </div>
  );
}
