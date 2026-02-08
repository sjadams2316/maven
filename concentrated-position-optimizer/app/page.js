'use client';

import { useState } from 'react';

export default function Home() {
  const [mode, setMode] = useState('single'); // 'single' or 'portfolio'
  const [inputs, setInputs] = useState({
    currentValue: 2000000,
    costBasis: 400000,
    ticker: 'AAPL',
    ordinaryIncome: 500000,
    filingStatus: 'married',
    state: 'CA',
    years: 20,
    expectedReturn: 8,
    newCapitalAvailable: 2000000,
    charitableIntent: false
  });
  
  const [bulkInput, setBulkInput] = useState('');
  const [positions, setPositions] = useState([]);
  const [results, setResults] = useState(null);
  const [portfolioResults, setPortfolioResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [parseError, setParseError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked :
              (name === 'filingStatus' || name === 'state' || name === 'ticker') 
                ? value 
                : parseFloat(value) || 0
    }));
  };

  // Parse bulk input - supports tab, comma, or space delimited
  const parseBulkInput = (text) => {
    setParseError('');
    const lines = text.trim().split('\n').filter(line => line.trim());
    const parsed = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      // Skip header rows
      if (line.toLowerCase().includes('ticker') || line.toLowerCase().includes('symbol')) continue;
      
      // Try different delimiters: tab, comma, multiple spaces
      let parts = line.split('\t');
      if (parts.length < 3) parts = line.split(',');
      if (parts.length < 3) parts = line.split(/\s{2,}/);
      if (parts.length < 3) parts = line.split(/\s+/);
      
      if (parts.length >= 3) {
        const ticker = parts[0].trim().toUpperCase();
        const currentValue = parseFloat(parts[1].replace(/[$,]/g, ''));
        const costBasis = parseFloat(parts[2].replace(/[$,]/g, ''));
        
        if (ticker && !isNaN(currentValue) && !isNaN(costBasis)) {
          parsed.push({ ticker, currentValue, costBasis });
        } else {
          setParseError(`Line ${i + 1}: Could not parse "${line}"`);
        }
      } else {
        setParseError(`Line ${i + 1}: Need at least ticker, value, and cost basis`);
      }
    }
    
    return parsed;
  };

  const handleBulkPaste = (e) => {
    const text = e.target.value;
    setBulkInput(text);
    if (text.trim()) {
      const parsed = parseBulkInput(text);
      setPositions(parsed);
    } else {
      setPositions([]);
    }
  };

  const removePosition = (index) => {
    setPositions(prev => prev.filter((_, i) => i !== index));
  };

  const analyzeSingle = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs)
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error('Analysis error:', err);
    }
    setLoading(false);
  };

  const analyzePortfolio = async () => {
    if (positions.length === 0) return;
    
    setLoading(true);
    setPortfolioResults(null);
    
    try {
      // Analyze each position
      const positionResults = await Promise.all(
        positions.map(async (pos) => {
          const res = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...inputs,
              ticker: pos.ticker,
              currentValue: pos.currentValue,
              costBasis: pos.costBasis,
              // Scale new capital proportionally
              newCapitalAvailable: inputs.newCapitalAvailable * (pos.currentValue / positions.reduce((sum, p) => sum + p.currentValue, 0))
            })
          });
          return { position: pos, analysis: await res.json() };
        })
      );
      
      // Aggregate results
      const totalValue = positions.reduce((sum, p) => sum + p.currentValue, 0);
      const totalBasis = positions.reduce((sum, p) => sum + p.costBasis, 0);
      const totalGain = totalValue - totalBasis;
      const totalTax = positionResults.reduce((sum, r) => sum + (r.analysis.taxAnalysis?.totalTax || 0), 0);
      
      // Find best strategy for each position
      const recommendations = positionResults.map(r => {
        const strategies = r.analysis.comparison?.year20 || {};
        let bestStrategy = null;
        let bestValue = 0;
        
        Object.entries(strategies).forEach(([key, data]) => {
          if (data.afterTaxValue > bestValue) {
            bestValue = data.afterTaxValue;
            bestStrategy = key;
          }
        });
        
        return {
          ticker: r.position.ticker,
          currentValue: r.position.currentValue,
          costBasis: r.position.costBasis,
          gain: r.position.currentValue - r.position.costBasis,
          gainPercent: ((r.position.currentValue - r.position.costBasis) / r.position.costBasis * 100).toFixed(1),
          taxIfSold: r.analysis.taxAnalysis?.totalTax || 0,
          bestStrategy,
          bestStrategyName: r.analysis.strategies?.[bestStrategy]?.name || bestStrategy,
          year20Value: bestValue,
          analysis: r.analysis
        };
      });
      
      setPortfolioResults({
        positions: recommendations,
        totals: {
          totalValue,
          totalBasis,
          totalGain,
          totalTax,
          weightedGainPercent: ((totalGain / totalBasis) * 100).toFixed(1),
          embeddedGainPercent: ((totalGain / totalValue) * 100).toFixed(1)
        }
      });
      
    } catch (err) {
      console.error('Portfolio analysis error:', err);
    }
    setLoading(false);
  };

  const gain = inputs.currentValue - inputs.costBasis;
  const gainPercent = inputs.costBasis > 0 ? ((gain / inputs.costBasis) * 100).toFixed(0) : 0;
  const embeddedRatio = inputs.currentValue > 0 ? ((gain / inputs.currentValue) * 100).toFixed(0) : 0;

  return (
    <div className="container">
      <h1>Concentrated Position Optimizer</h1>
      <p className="subtitle">Model tax-efficient strategies for managing concentrated stock positions</p>

      {/* Mode Toggle */}
      <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1.5rem'}}>
        <button 
          onClick={() => { setMode('single'); setPortfolioResults(null); }}
          className={mode === 'single' ? 'btn-primary' : 'btn-secondary'}
          style={{padding: '0.5rem 1rem'}}
        >
          Single Position
        </button>
        <button 
          onClick={() => { setMode('portfolio'); setResults(null); }}
          className={mode === 'portfolio' ? 'btn-primary' : 'btn-secondary'}
          style={{padding: '0.5rem 1rem'}}
        >
          Portfolio (Bulk Paste)
        </button>
      </div>

      {mode === 'portfolio' ? (
        /* Portfolio Mode */
        <div className="grid grid-2">
          <div className="card">
            <h2>📋 Paste Portfolio Positions</h2>
            <p style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem'}}>
              Paste from Excel or CSV. Format: <strong>Ticker, Current Value, Cost Basis</strong> (one per line)
            </p>
            
            <textarea
              value={bulkInput}
              onChange={handleBulkPaste}
              placeholder={`AAPL, 500000, 100000
NVDA, 800000, 150000
MSFT, 300000, 120000
GOOGL, 400000, 200000`}
              style={{
                width: '100%',
                height: '150px',
                padding: '0.75rem',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                resize: 'vertical'
              }}
            />
            
            {parseError && (
              <div style={{color: '#dc2626', fontSize: '0.875rem', marginTop: '0.5rem'}}>
                ⚠ {parseError}
              </div>
            )}

            {positions.length > 0 && (
              <div style={{marginTop: '1rem'}}>
                <h3 style={{fontSize: '0.875rem', marginBottom: '0.5rem'}}>Parsed Positions ({positions.length})</h3>
                <table style={{width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse'}}>
                  <thead>
                    <tr style={{borderBottom: '1px solid #e5e7eb'}}>
                      <th style={{textAlign: 'left', padding: '0.5rem'}}>Ticker</th>
                      <th style={{textAlign: 'right', padding: '0.5rem'}}>Value</th>
                      <th style={{textAlign: 'right', padding: '0.5rem'}}>Basis</th>
                      <th style={{textAlign: 'right', padding: '0.5rem'}}>Gain %</th>
                      <th style={{padding: '0.5rem'}}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((pos, i) => (
                      <tr key={i} style={{borderBottom: '1px solid #f3f4f6'}}>
                        <td style={{padding: '0.5rem', fontWeight: '600'}}>{pos.ticker}</td>
                        <td style={{textAlign: 'right', padding: '0.5rem'}}>${pos.currentValue.toLocaleString()}</td>
                        <td style={{textAlign: 'right', padding: '0.5rem'}}>${pos.costBasis.toLocaleString()}</td>
                        <td style={{textAlign: 'right', padding: '0.5rem', color: pos.currentValue > pos.costBasis ? '#16a34a' : '#dc2626'}}>
                          {((pos.currentValue - pos.costBasis) / pos.costBasis * 100).toFixed(0)}%
                        </td>
                        <td style={{padding: '0.5rem'}}>
                          <button onClick={() => removePosition(i)} style={{color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer'}}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <h2 style={{marginTop: '1.5rem'}}>👤 Client Profile</h2>

            <div className="grid grid-2">
              <div className="form-group">
                <label>Ordinary Income ($)</label>
                <input 
                  type="number" 
                  name="ordinaryIncome" 
                  value={inputs.ordinaryIncome}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Filing Status</label>
                <select name="filingStatus" value={inputs.filingStatus} onChange={handleChange}>
                  <option value="single">Single</option>
                  <option value="married">Married Filing Jointly</option>
                </select>
              </div>
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label>State</label>
                <select name="state" value={inputs.state} onChange={handleChange}>
                  <option value="CA">California (13.3%)</option>
                  <option value="NY">New York (10.9%)</option>
                  <option value="NJ">New Jersey (10.75%)</option>
                  <option value="MA">Massachusetts (9.0%)</option>
                  <option value="VA">Virginia (5.75%)</option>
                  <option value="CO">Colorado (4.4%)</option>
                  <option value="IL">Illinois (4.95%)</option>
                  <option value="PA">Pennsylvania (3.07%)</option>
                  <option value="TX">Texas (0%)</option>
                  <option value="FL">Florida (0%)</option>
                  <option value="WA">Washington (7%)</option>
                  <option value="NV">Nevada (0%)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Time Horizon (Years)</label>
                <input 
                  type="number" 
                  name="years" 
                  value={inputs.years}
                  onChange={handleChange}
                  min="5"
                  max="30"
                />
              </div>
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label>New Capital Available ($)</label>
                <input 
                  type="number" 
                  name="newCapitalAvailable" 
                  value={inputs.newCapitalAvailable}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Expected Return (%)</label>
                <input 
                  type="number" 
                  name="expectedReturn" 
                  value={inputs.expectedReturn}
                  onChange={handleChange}
                  step="0.5"
                />
              </div>
            </div>

            <div className="form-group" style={{display: 'flex', alignItems: 'center'}}>
              <input 
                type="checkbox" 
                name="charitableIntent" 
                checked={inputs.charitableIntent}
                onChange={handleChange}
                style={{width: 'auto', marginRight: '0.5rem'}}
              />
              <label style={{marginBottom: 0}}>Client has charitable intent</label>
            </div>

            <button 
              className="btn-primary" 
              onClick={analyzePortfolio}
              disabled={loading || positions.length === 0}
              style={{width: '100%', marginTop: '1rem'}}
            >
              {loading ? 'Analyzing Portfolio...' : `Analyze ${positions.length} Position${positions.length !== 1 ? 's' : ''}`}
            </button>
          </div>

          {/* Portfolio Results */}
          <div>
            {!portfolioResults ? (
              <div className="card" style={{textAlign: 'center', padding: '3rem'}}>
                <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📊</div>
                <h3>Paste Portfolio Data</h3>
                <p style={{color: '#6b7280'}}>
                  Copy positions from Excel or a brokerage statement. Include ticker, current value, and cost basis.
                </p>
                <div style={{marginTop: '1.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px', textAlign: 'left'}}>
                  <strong>Example formats:</strong>
                  <pre style={{fontSize: '0.75rem', marginTop: '0.5rem', color: '#6b7280'}}>
{`AAPL    500000    100000
NVDA, 800000, 150000
MSFT  300000  120000`}
                  </pre>
                </div>
              </div>
            ) : (
              <>
                {/* Portfolio Summary */}
                <div className="card">
                  <h2>💼 Portfolio Summary</h2>
                  <div className="grid grid-3" style={{marginTop: '1rem'}}>
                    <div className="stat">
                      <div className="stat-value">${portfolioResults.totals.totalValue.toLocaleString()}</div>
                      <div className="stat-label">Total Value</div>
                    </div>
                    <div className="stat">
                      <div className="stat-value positive">${portfolioResults.totals.totalGain.toLocaleString()}</div>
                      <div className="stat-label">Total Gain ({portfolioResults.totals.weightedGainPercent}%)</div>
                    </div>
                    <div className="stat">
                      <div className="stat-value negative">${portfolioResults.totals.totalTax.toLocaleString()}</div>
                      <div className="stat-label">Tax if All Sold</div>
                    </div>
                  </div>
                </div>

                {/* Position-by-Position */}
                <div className="card" style={{marginTop: '1rem'}}>
                  <h2>📋 Position Analysis</h2>
                  <table style={{width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse', marginTop: '1rem'}}>
                    <thead>
                      <tr style={{borderBottom: '2px solid #e5e7eb'}}>
                        <th style={{textAlign: 'left', padding: '0.75rem'}}>Ticker</th>
                        <th style={{textAlign: 'right', padding: '0.75rem'}}>Value</th>
                        <th style={{textAlign: 'right', padding: '0.75rem'}}>Gain</th>
                        <th style={{textAlign: 'right', padding: '0.75rem'}}>Tax</th>
                        <th style={{textAlign: 'left', padding: '0.75rem'}}>Best Strategy</th>
                        <th style={{textAlign: 'right', padding: '0.75rem'}}>20-Yr Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portfolioResults.positions.map((pos, i) => (
                        <tr key={i} style={{borderBottom: '1px solid #f3f4f6'}}>
                          <td style={{padding: '0.75rem', fontWeight: '600'}}>{pos.ticker}</td>
                          <td style={{textAlign: 'right', padding: '0.75rem'}}>${pos.currentValue.toLocaleString()}</td>
                          <td style={{textAlign: 'right', padding: '0.75rem', color: '#16a34a'}}>
                            ${pos.gain.toLocaleString()} ({pos.gainPercent}%)
                          </td>
                          <td style={{textAlign: 'right', padding: '0.75rem', color: '#dc2626'}}>
                            ${pos.taxIfSold.toLocaleString()}
                          </td>
                          <td style={{padding: '0.75rem'}}>
                            <span className="badge badge-success">{pos.bestStrategyName}</span>
                          </td>
                          <td style={{textAlign: 'right', padding: '0.75rem', fontWeight: '600'}}>
                            ${pos.year20Value.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{borderTop: '2px solid #e5e7eb', fontWeight: '700'}}>
                        <td style={{padding: '0.75rem'}}>TOTAL</td>
                        <td style={{textAlign: 'right', padding: '0.75rem'}}>${portfolioResults.totals.totalValue.toLocaleString()}</td>
                        <td style={{textAlign: 'right', padding: '0.75rem', color: '#16a34a'}}>${portfolioResults.totals.totalGain.toLocaleString()}</td>
                        <td style={{textAlign: 'right', padding: '0.75rem', color: '#dc2626'}}>${portfolioResults.totals.totalTax.toLocaleString()}</td>
                        <td colSpan="2"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Click to expand details */}
                <div style={{marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280', textAlign: 'center'}}>
                  Switch to Single Position mode and select a ticker to see detailed strategy comparison
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Single Position Mode - Original UI */
        <div className="grid grid-2">
          {/* Input Form */}
          <div className="card">
            <h2>📊 Position Details</h2>
            
            <div className="form-group">
              <label>Ticker Symbol</label>
              <input 
                type="text" 
                name="ticker" 
                value={inputs.ticker}
                onChange={handleChange}
                placeholder="AAPL"
              />
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label>Current Value ($)</label>
                <input 
                  type="number" 
                  name="currentValue" 
                  value={inputs.currentValue}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Cost Basis ($)</label>
                <input 
                  type="number" 
                  name="costBasis" 
                  value={inputs.costBasis}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{marginTop: '1rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px'}}>
              <div className="grid grid-3">
                <div>
                  <div style={{fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase'}}>Unrealized Gain</div>
                  <div style={{fontSize: '1.25rem', fontWeight: '700', color: gain >= 0 ? '#16a34a' : '#dc2626'}}>
                    ${gain.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase'}}>Gain %</div>
                  <div style={{fontSize: '1.25rem', fontWeight: '700', color: gain >= 0 ? '#16a34a' : '#dc2626'}}>
                    {gainPercent}%
                  </div>
                </div>
                <div>
                  <div style={{fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase'}}>Embedded Gain</div>
                  <div style={{fontSize: '1.25rem', fontWeight: '700', color: '#2563eb'}}>
                    {embeddedRatio}%
                  </div>
                </div>
              </div>
            </div>

            <h2 style={{marginTop: '1.5rem'}}>👤 Client Profile</h2>

            <div className="grid grid-2">
              <div className="form-group">
                <label>Ordinary Income ($)</label>
                <input 
                  type="number" 
                  name="ordinaryIncome" 
                  value={inputs.ordinaryIncome}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Filing Status</label>
                <select name="filingStatus" value={inputs.filingStatus} onChange={handleChange}>
                  <option value="single">Single</option>
                  <option value="married">Married Filing Jointly</option>
                </select>
              </div>
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label>State</label>
                <select name="state" value={inputs.state} onChange={handleChange}>
                  <option value="CA">California (13.3%)</option>
                  <option value="NY">New York (10.9%)</option>
                  <option value="NJ">New Jersey (10.75%)</option>
                  <option value="MA">Massachusetts (9.0%)</option>
                  <option value="MN">Minnesota (9.85%)</option>
                  <option value="OR">Oregon (9.9%)</option>
                  <option value="VT">Vermont (8.75%)</option>
                  <option value="HI">Hawaii (7.25%)</option>
                  <option value="VA">Virginia (5.75%)</option>
                  <option value="CO">Colorado (4.4%)</option>
                  <option value="IL">Illinois (4.95%)</option>
                  <option value="PA">Pennsylvania (3.07%)</option>
                  <option value="TX">Texas (0%)</option>
                  <option value="FL">Florida (0%)</option>
                  <option value="WA">Washington (7%)</option>
                  <option value="NV">Nevada (0%)</option>
                  <option value="WY">Wyoming (0%)</option>
                  <option value="TN">Tennessee (0%)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Time Horizon (Years)</label>
                <input 
                  type="number" 
                  name="years" 
                  value={inputs.years}
                  onChange={handleChange}
                  min="5"
                  max="30"
                />
              </div>
            </div>

            <h2 style={{marginTop: '1.5rem'}}>💰 Strategy Inputs</h2>

            <div className="form-group">
              <label>New Capital Available for Direct Indexing ($)</label>
              <input 
                type="number" 
                name="newCapitalAvailable" 
                value={inputs.newCapitalAvailable}
                onChange={handleChange}
              />
              <small style={{color: '#6b7280', fontSize: '0.75rem'}}>
                Direct indexing requires NEW capital to fund the loss-harvesting portfolio
              </small>
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label>Expected Return (%)</label>
                <input 
                  type="number" 
                  name="expectedReturn" 
                  value={inputs.expectedReturn}
                  onChange={handleChange}
                  step="0.5"
                  min="0"
                  max="20"
                />
              </div>
              <div className="form-group" style={{display: 'flex', alignItems: 'center', paddingTop: '1.5rem'}}>
                <input 
                  type="checkbox" 
                  name="charitableIntent" 
                  checked={inputs.charitableIntent}
                  onChange={handleChange}
                  style={{width: 'auto', marginRight: '0.5rem'}}
                />
                <label style={{marginBottom: 0}}>Client has charitable intent</label>
              </div>
            </div>

            <button 
              className="btn-primary" 
              onClick={analyzeSingle}
              disabled={loading}
              style={{width: '100%', marginTop: '1rem'}}
            >
              {loading ? 'Analyzing...' : 'Analyze Strategies'}
            </button>
          </div>

          {/* Quick Summary */}
          <div>
            {!results ? (
              <div className="card" style={{textAlign: 'center', padding: '3rem'}}>
                <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📈</div>
                <h3>Enter Position Details</h3>
                <p style={{color: '#6b7280'}}>
                  Input your concentrated position details and click "Analyze Strategies" to see a comprehensive comparison.
                </p>
              </div>
            ) : (
              <>
                {/* Tax Impact */}
                <div className="card">
                  <h2>💰 Tax Impact (If Sold Today)</h2>
                  <div className="grid grid-2">
                    <div className="stat">
                      <div className="stat-value negative">${results.taxAnalysis?.totalTax?.toLocaleString()}</div>
                      <div className="stat-label">Total Tax</div>
                    </div>
                    <div className="stat">
                      <div className="stat-value">{results.taxAnalysis?.effectiveRate}%</div>
                      <div className="stat-label">Effective Rate</div>
                    </div>
                  </div>
                  <div style={{fontSize: '0.875rem', color: '#6b7280', marginTop: '1rem'}}>
                    After-tax proceeds: ${results.taxAnalysis?.afterTaxProceeds?.toLocaleString()}
                  </div>
                </div>

                {/* Recommendation */}
                <div className="recommendation">
                  <h3>🎯 Analysis</h3>
                  <ul style={{margin: '1rem 0', paddingLeft: '1.25rem'}}>
                    {results.recommendation?.analysis?.map((a, i) => (
                      <li key={i} style={{marginBottom: '0.5rem'}}>{a}</li>
                    ))}
                  </ul>
                  
                  {results.recommendation?.situationalFactors?.length > 0 && (
                    <>
                      <h4 style={{fontSize: '0.875rem', marginTop: '1rem', color: '#16a34a'}}>✓ Situational Factors</h4>
                      <ul style={{margin: '0.5rem 0', paddingLeft: '1.25rem', fontSize: '0.875rem'}}>
                        {results.recommendation.situationalFactors.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  {results.recommendation?.cautions?.length > 0 && (
                    <>
                      <h4 style={{fontSize: '0.875rem', marginTop: '1rem', color: '#d97706'}}>⚠ Cautions</h4>
                      <ul style={{margin: '0.5rem 0', paddingLeft: '1.25rem', fontSize: '0.875rem'}}>
                        {results.recommendation.cautions.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Strategy Comparison - Single Mode Only */}
      {mode === 'single' && results && (
        <>
          <div className="card">
            <h2>📊 Strategy Comparison ({inputs.years}-Year Projection)</h2>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Strategy</th>
                  <th>Year 10 Value</th>
                  <th>Year 20 Value</th>
                  <th>Concentration</th>
                  <th>Key Trade-off</th>
                </tr>
              </thead>
              <tbody>
                {results.comparison && Object.entries(results.comparison.summary)
                  .filter(([key]) => results.strategies[key] && !results.strategies[key].error)
                  .sort((a, b) => (results.comparison.year20[b[0]]?.afterTaxValue || 0) - (results.comparison.year20[a[0]]?.afterTaxValue || 0))
                  .map(([key, data], index) => {
                    const isTop = index === 0;
                    return (
                      <tr key={key} className={isTop ? 'highlight' : ''}>
                        <td>
                          {data.name}
                          {isTop && <span className="badge badge-success" style={{marginLeft: '0.5rem'}}>Highest Value</span>}
                        </td>
                        <td>${results.comparison.year10[key]?.afterTaxValue?.toLocaleString()}</td>
                        <td>${results.comparison.year20[key]?.afterTaxValue?.toLocaleString()}</td>
                        <td>{data.concentrationAtEnd}%</td>
                        <td style={{fontSize: '0.75rem', color: '#6b7280'}}>
                          {data.keyMetrics?.taxEfficiency || '-'}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Strategy Details */}
          <h2 style={{marginTop: '2rem', marginBottom: '1rem'}}>📋 Strategy Details</h2>
          <div className="grid grid-2">
            {results.strategies && Object.entries(results.strategies)
              .filter(([key, strategy]) => !strategy.error)
              .map(([key, strategy]) => {
                const year20Value = results.comparison.year20[key]?.afterTaxValue || 0;
                const maxValue = Math.max(...Object.values(results.comparison.year20).map(v => v.afterTaxValue || 0));
                const isTop = year20Value === maxValue;
                
                return (
                  <div key={key} className={`strategy-card ${isTop ? 'winner' : ''}`}>
                    <h3>
                      {strategy.name}
                      {isTop && <span className="badge badge-success">Highest Value</span>}
                    </h3>
                    <p style={{fontSize: '0.875rem', color: '#6b7280', margin: '0.5rem 0'}}>
                      {strategy.description}
                    </p>
                    
                    {/* Strategy-specific info */}
                    {strategy.immediateImpact && (
                      <div style={{background: '#fef2f2', padding: '0.75rem', borderRadius: '8px', margin: '0.75rem 0', fontSize: '0.875rem'}}>
                        <strong>Immediate Tax:</strong> ${strategy.immediateImpact.taxPaid?.toLocaleString()} ({strategy.immediateImpact.taxRate?.toFixed(1)}%)
                      </div>
                    )}

                    {strategy.capitalRequired && (
                      <div style={{background: '#fefce8', padding: '0.75rem', borderRadius: '8px', margin: '0.75rem 0', fontSize: '0.875rem'}}>
                        <strong>⚠ Requires New Capital:</strong> ${strategy.capitalRequired.newCapital?.toLocaleString()}
                      </div>
                    )}

                    {strategy.taxTreatment?.basisCarryover && (
                      <div style={{background: '#fff7ed', padding: '0.75rem', borderRadius: '8px', margin: '0.75rem 0', fontSize: '0.875rem'}}>
                        <strong>Note:</strong> Original basis carries over. Tax is DEFERRED, not eliminated.
                      </div>
                    )}

                    {strategy.contractTerms && (
                      <div style={{background: '#eff6ff', padding: '0.75rem', borderRadius: '8px', margin: '0.75rem 0', fontSize: '0.875rem'}}>
                        <strong>Prepayment:</strong> {strategy.contractTerms.prepaymentPercent} (${strategy.contractTerms.prepaymentAmount?.toLocaleString()})
                        <br/>
                        <strong>Floor/Cap:</strong> {strategy.contractTerms.floor} / {strategy.contractTerms.cap}
                      </div>
                    )}

                    {strategy.charitableBenefit && (
                      <div style={{background: '#f0fdf4', padding: '0.75rem', borderRadius: '8px', margin: '0.75rem 0', fontSize: '0.875rem'}}>
                        <strong>Charitable Deduction:</strong> {strategy.charitableBenefit.charitableDeduction}
                        <br/>
                        <strong>Tax Savings:</strong> {strategy.charitableBenefit.taxSavingsFromDeduction}
                      </div>
                    )}

                    <div className="pros-cons">
                      <div className="pros">
                        <h4>Pros</h4>
                        <ul>
                          {strategy.pros?.slice(0, 4).map((p, i) => <li key={i}>{p}</li>)}
                        </ul>
                      </div>
                      <div className="cons">
                        <h4>Cons</h4>
                        <ul>
                          {strategy.cons?.slice(0, 4).map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
                    </div>

                    {strategy.keyMetrics && (
                      <div style={{marginTop: '1rem', fontSize: '0.75rem', color: '#6b7280'}}>
                        <strong>Concentration:</strong> {strategy.keyMetrics.concentrationRisk}<br/>
                        <strong>Liquidity:</strong> {strategy.keyMetrics.liquidityRisk}<br/>
                        <strong>Tax Efficiency:</strong> {strategy.keyMetrics.taxEfficiency}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          <div className="disclaimer">
            <strong>Disclaimer:</strong> This tool is for educational and informational purposes only. It does not constitute investment, tax, or legal advice. 
            Projections are based on simplifying assumptions and actual results may vary significantly. Key assumptions include constant returns, 
            no transaction costs, and simplified tax calculations. Always consult with qualified tax, legal, and financial professionals before 
            implementing any strategy. Past performance does not guarantee future results.
          </div>
        </>
      )}
    </div>
  );
}
