'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TEYCalculator() {
  const [inputs, setInputs] = useState({
    muniYield: 4.0,
    taxableYield: 5.5,
    income: 500000,
    filingStatus: 'married',
    state: 'CA',
    isInState: true
  });
  
  const [result, setResult] = useState(null);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load states on mount
  useEffect(() => {
    fetch('/api/tey')
      .then(res => res.json())
      .then(data => setStates(data.states || []))
      .catch(console.error);
  }, []);

  // Calculate on input change
  useEffect(() => {
    const calculate = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/tey', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            muniYield: inputs.muniYield / 100,
            taxableYield: inputs.taxableYield / 100,
            income: inputs.income,
            filingStatus: inputs.filingStatus,
            state: inputs.state,
            isInState: inputs.isInState
          })
        });
        const data = await res.json();
        setResult(data);
      } catch (err) {
        console.error('Calculation error:', err);
      }
      setLoading(false);
    };
    
    calculate();
  }, [inputs]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <header style={{ 
        borderBottom: '1px solid rgba(255,255,255,0.1)', 
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" style={{ 
            color: '#94a3b8', 
            textDecoration: 'none',
            fontSize: '0.875rem'
          }}>
            ← Back to Portfolio
          </Link>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
            Tax-Equivalent Yield Calculator
          </h1>
        </div>
        <span style={{ 
          background: 'rgba(99, 102, 241, 0.2)', 
          color: '#a5b4fc',
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: '600'
        }}>
          Maven
        </span>
      </header>

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Inputs */}
          <div style={{ 
            background: 'rgba(255,255,255,0.05)', 
            borderRadius: '16px', 
            padding: '1.5rem',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1.5rem', color: '#e2e8f0' }}>
              📊 Bond Comparison
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                  Municipal Bond Yield (%)
                </label>
                <input
                  type="number"
                  name="muniYield"
                  value={inputs.muniYield}
                  onChange={handleChange}
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(0,0,0,0.2)',
                    color: 'white',
                    fontSize: '1.25rem',
                    fontWeight: '600'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                  Taxable Bond Yield (%)
                </label>
                <input
                  type="number"
                  name="taxableYield"
                  value={inputs.taxableYield}
                  onChange={handleChange}
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(0,0,0,0.2)',
                    color: 'white',
                    fontSize: '1.25rem',
                    fontWeight: '600'
                  }}
                />
              </div>
            </div>

            <h2 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', marginTop: '2rem', color: '#e2e8f0' }}>
              👤 Tax Situation
            </h2>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                Taxable Income ($)
              </label>
              <input
                type="number"
                name="income"
                value={inputs.income}
                onChange={handleChange}
                step="10000"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(0,0,0,0.2)',
                  color: 'white',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                  Filing Status
                </label>
                <select
                  name="filingStatus"
                  value={inputs.filingStatus}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(0,0,0,0.2)',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                >
                  <option value="married">Married Filing Jointly</option>
                  <option value="single">Single</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                  State
                </label>
                <select
                  name="state"
                  value={inputs.state}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(0,0,0,0.2)',
                    color: 'white',
                    fontSize: '1rem'
                  }}
                >
                  {states.map(s => (
                    <option key={s.code} value={s.code}>
                      {s.name} ({s.ratePercent})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: '#e2e8f0'
              }}>
                <input
                  type="checkbox"
                  name="isInState"
                  checked={inputs.isInState}
                  onChange={handleChange}
                  style={{ width: '18px', height: '18px' }}
                />
                Municipal bond is from my state (double tax-exempt)
              </label>
            </div>
          </div>

          {/* Results */}
          <div>
            {result && (
              <>
                {/* Winner Card */}
                <div style={{ 
                  background: result.winner === 'municipal' 
                    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.1))'
                    : 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.1))',
                  borderRadius: '16px', 
                  padding: '1.5rem',
                  border: `1px solid ${result.winner === 'municipal' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`,
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                    BETTER CHOICE
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                    {result.winner === 'municipal' ? '🏛️ Municipal Bond' : '💵 Taxable Bond'}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#e2e8f0' }}>
                    {result.analysis}
                  </div>
                </div>

                {/* TEY Display */}
                <div style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  borderRadius: '16px', 
                  padding: '1.5rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                    TAX-EQUIVALENT YIELD
                  </div>
                  <div style={{ 
                    fontSize: '3rem', 
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #22c55e, #10b981)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {result.taxEquivalentYieldPercent}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                    A {inputs.muniYield}% muni = {result.taxEquivalentYieldPercent} taxable
                  </div>
                </div>

                {/* Tax Breakdown */}
                <div style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  borderRadius: '16px', 
                  padding: '1.5rem',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '1rem', color: '#e2e8f0' }}>
                    Tax Rate Breakdown
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>Federal Marginal Rate</span>
                      <span style={{ fontWeight: '600' }}>{result.federalRatePercent}</span>
                    </div>
                    {result.niitRate > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94a3b8' }}>NIIT (3.8%)</span>
                        <span style={{ fontWeight: '600' }}>{result.niitRatePercent}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#94a3b8' }}>State Rate ({inputs.state})</span>
                      <span style={{ fontWeight: '600' }}>{result.stateRatePercent}</span>
                    </div>
                    <div style={{ 
                      borderTop: '1px solid rgba(255,255,255,0.1)', 
                      paddingTop: '0.75rem',
                      display: 'flex', 
                      justifyContent: 'space-between' 
                    }}>
                      <span style={{ color: '#e2e8f0', fontWeight: '600' }}>Combined Rate</span>
                      <span style={{ fontWeight: '700', color: '#f59e0b' }}>{result.combinedRatePercent}</span>
                    </div>
                  </div>

                  {!inputs.isInState && result.effectiveMuniYieldPercent && (
                    <div style={{ 
                      marginTop: '1rem', 
                      padding: '0.75rem', 
                      background: 'rgba(245, 158, 11, 0.1)',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      color: '#fbbf24'
                    }}>
                      ⚠️ Out-of-state muni: After {inputs.state} state tax, effective yield is {result.effectiveMuniYieldPercent}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Recommendations */}
        {result && result.recommendation && (
          <div style={{ 
            background: 'rgba(255,255,255,0.05)', 
            borderRadius: '16px', 
            padding: '1.5rem',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#e2e8f0' }}>
              💡 Insights
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#94a3b8' }}>
              {result.recommendation.map((insight, i) => (
                <li key={i} style={{ marginBottom: '0.5rem' }}>{insight}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Educational Note */}
        <div style={{ 
          marginTop: '2rem',
          padding: '1rem',
          borderRadius: '8px',
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          fontSize: '0.875rem',
          color: '#a5b4fc'
        }}>
          <strong>Note:</strong> Municipal bond interest is federally tax-exempt. In-state munis are also 
          state tax-exempt. This calculator helps compare after-tax yields. Always consult a tax 
          professional for personalized advice.
        </div>
      </main>
    </div>
  );
}
