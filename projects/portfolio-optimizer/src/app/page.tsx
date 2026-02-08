'use client';

import { useState } from 'react';
import PortfolioInput from '@/components/PortfolioInput';
import AnalysisResults from '@/components/AnalysisResults';
import { PortfolioHolding, AnalysisResult } from '@/types';

export default function Home() {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzePortfolio = async () => {
    if (holdings.length === 0) {
      setError('Please add at least one holding');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ holdings }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Portfolio Optimizer
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Upload your portfolio, get AI-powered optimization recommendations 
            with forward-looking scenarios. ETFs and mutual funds only.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left side: Input */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">
              Your Portfolio
            </h2>
            <PortfolioInput 
              holdings={holdings} 
              setHoldings={setHoldings} 
            />
            
            <button
              onClick={analyzePortfolio}
              disabled={loading || holdings.length === 0}
              className="w-full mt-6 py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analyzing...
                </span>
              ) : (
                'Analyze & Optimize'
              )}
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
                {error}
              </div>
            )}
          </div>

          {/* Right side: Results */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-4">
              Analysis & Recommendations
            </h2>
            {analysis ? (
              <AnalysisResults analysis={analysis} />
            ) : (
              <div className="flex items-center justify-center h-64 text-slate-500">
                <p>Add holdings and click analyze to see recommendations</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
