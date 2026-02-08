'use client';

import { useState, useEffect } from 'react';
import FundSearch from './components/FundSearch';
import PortfolioBuilder from './components/PortfolioBuilder';
import ComparisonView from './components/ComparisonView';
import OptimizerView from './components/OptimizerView';
import StressTestView from './components/StressTestView';
import AutoOptimizer from './components/AutoOptimizer';
import RiskProfiler from './components/RiskProfiler';
import CMADashboard from './components/CMADashboard';
import RebalanceMonitor from './components/RebalanceMonitor';

export default function Home() {
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolios, setSelectedPortfolios] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [activeTab, setActiveTab] = useState('auto');
  const [selectedForAnalysis, setSelectedForAnalysis] = useState(null);
  const [showRiskProfiler, setShowRiskProfiler] = useState(false);
  const [recommendedAllocation, setRecommendedAllocation] = useState(null);
  const [riskProfile, setRiskProfile] = useState(null);
  const [autoRunOptimizer, setAutoRunOptimizer] = useState(false);
  const [hybridRecommendations, setHybridRecommendations] = useState(null);
  const [hybridModelName, setHybridModelName] = useState(null);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    const res = await fetch('/api/portfolios');
    const data = await res.json();
    setPortfolios(data);
  };

  const handleCompare = async () => {
    if (selectedPortfolios.length < 1) return;
    
    const res = await fetch('/api/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portfolioIds: selectedPortfolios })
    });
    const data = await res.json();
    setComparison(data);
    setActiveTab('compare');
  };

  const togglePortfolioSelection = (id) => {
    setSelectedPortfolios(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  const selectForAnalysis = (portfolio) => {
    setSelectedForAnalysis(portfolio);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Portfolio Optimizer</h1>
        <p className="text-gray-600 mt-2">
          Auto-optimize portfolios, compare side-by-side, and stress test against historical scenarios
        </p>
      </header>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b pb-2">
        {[
          { id: 'auto', label: '🚀 Auto-Optimize', highlight: true },
          { id: 'cma', label: '📊 Market Assumptions' },
          { id: 'rebalance', label: '⚖️ Rebalance Monitor' },
          { id: 'build', label: 'Build Portfolios' },
          { id: 'compare', label: 'Compare' },
          { id: 'optimize', label: 'CMA Analysis' },
          { id: 'stress', label: 'Stress Test' },
          { id: 'funds', label: 'Fund Database' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2 px-4 font-medium transition ${
              activeTab === tab.id 
                ? tab.highlight ? 'border-b-2 border-green-600 text-green-600' : 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Auto-Optimize Tab */}
      {activeTab === 'auto' && (
        <div>
          {/* Risk Profiler Launch */}
          <div className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold mb-1">🎯 Not sure where to start?</h2>
                <p className="opacity-90">
                  Take our 2-minute risk assessment quiz to get a personalized allocation recommendation.
                </p>
              </div>
              <button
                onClick={() => setShowRiskProfiler(true)}
                className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition whitespace-nowrap"
              >
                Take Risk Quiz →
              </button>
            </div>
            {riskProfile && (
              <div className="mt-4 p-4 bg-white/10 rounded-lg">
                <p className="text-sm opacity-80 mb-1">Your Profile:</p>
                <p className="font-bold text-lg">{riskProfile.name}</p>
                <p className="text-sm opacity-90">
                  Expected Return: {riskProfile.expectedReturn} • Max Drawdown: {riskProfile.maxDrawdown}
                </p>
                <p className="text-xs opacity-70 mt-2">
                  ✓ Allocation applied to optimizer below
                </p>
              </div>
            )}
          </div>
          <AutoOptimizer 
            onPortfolioCreated={fetchPortfolios} 
            initialAllocation={recommendedAllocation}
            riskProfile={riskProfile}
            autoRun={autoRunOptimizer}
            onAutoRunComplete={() => setAutoRunOptimizer(false)}
            hybridRecommendations={hybridRecommendations}
            hybridModelName={hybridModelName}
          />
        </div>
      )}

      {/* Build Tab */}
      {activeTab === 'build' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Create New Portfolio</h2>
            <PortfolioBuilder onSave={fetchPortfolios} />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Saved Portfolios</h2>
            <div className="space-y-3">
              {portfolios.map(p => (
                <div 
                  key={p.id}
                  className={`p-4 bg-white rounded-lg shadow cursor-pointer transition ${
                    selectedPortfolios.includes(p.id) ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div onClick={() => togglePortfolioSelection(p.id)} className="flex-1">
                      <h3 className="font-medium">{p.name}</h3>
                      <p className="text-sm text-gray-500">
                        Created {new Date(p.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { selectForAnalysis(p); setActiveTab('optimize'); }}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                      >
                        CMA
                      </button>
                      <button
                        onClick={() => { selectForAnalysis(p); setActiveTab('stress'); }}
                        className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                      >
                        Stress
                      </button>
                      <input
                        type="checkbox"
                        checked={selectedPortfolios.includes(p.id)}
                        onChange={() => togglePortfolioSelection(p.id)}
                        className="h-5 w-5 text-blue-600"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {portfolios.length === 0 && (
                <p className="text-gray-500 text-center py-8">No portfolios yet. Use Auto-Optimize or create one manually.</p>
              )}
            </div>
            
            {selectedPortfolios.length > 0 && (
              <button
                onClick={handleCompare}
                className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Compare {selectedPortfolios.length} Portfolio{selectedPortfolios.length > 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Compare Tab */}
      {activeTab === 'compare' && (
        <ComparisonView comparison={comparison} />
      )}

      {/* CMA Analysis Tab */}
      {activeTab === 'optimize' && (
        <div>
          {!selectedForAnalysis && portfolios.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
              <p className="text-yellow-800">Select a portfolio to analyze:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {portfolios.map(p => (
                  <button
                    key={p.id}
                    onClick={() => selectForAnalysis(p)}
                    className="bg-white border px-3 py-1 rounded hover:bg-gray-50"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <OptimizerView 
            portfolioId={selectedForAnalysis?.id} 
            portfolioName={selectedForAnalysis?.name}
          />
        </div>
      )}

      {/* Stress Test Tab */}
      {activeTab === 'stress' && (
        <div>
          {!selectedForAnalysis && portfolios.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
              <p className="text-yellow-800">Select a portfolio to stress test:</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {portfolios.map(p => (
                  <button
                    key={p.id}
                    onClick={() => selectForAnalysis(p)}
                    className="bg-white border px-3 py-1 rounded hover:bg-gray-50"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <StressTestView 
            portfolioId={selectedForAnalysis?.id}
            portfolioName={selectedForAnalysis?.name}
          />
        </div>
      )}

      {/* CMA Dashboard Tab */}
      {activeTab === 'cma' && (
        <CMADashboard />
      )}

      {/* Rebalance Monitor Tab */}
      {activeTab === 'rebalance' && (
        <RebalanceMonitor />
      )}

      {/* Funds Tab */}
      {activeTab === 'funds' && (
        <FundSearch />
      )}

      {/* Risk Profiler Modal */}
      {showRiskProfiler && (
        <RiskProfiler 
          onComplete={(portfolioData, profile) => {
            // Handle both old format (just allocation) and new format (object with recommendations)
            if (portfolioData.allocation) {
              setRecommendedAllocation(portfolioData.allocation);
              setHybridRecommendations(portfolioData.recommendations || null);
              setHybridModelName(portfolioData.modelName || null);
            } else {
              // Legacy: just allocation object
              setRecommendedAllocation(portfolioData);
              setHybridRecommendations(null);
              setHybridModelName(null);
            }
            setRiskProfile(profile);
            setShowRiskProfiler(false);
            setAutoRunOptimizer(true); // Trigger auto-optimization
            setActiveTab('auto'); // Make sure we're on the right tab
          }}
          onClose={() => setShowRiskProfiler(false)}
        />
      )}
    </main>
  );
}
