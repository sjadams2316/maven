'use client';

import { useState, useEffect } from 'react';

interface Holding {
  ticker: string;
  name?: string;
  shares: number;
  costBasis: number;
  currentPrice?: number;
  currentValue?: number;
  percentage?: number;
}

interface HoldingsInputProps {
  holdings: Holding[];
  onChange: (holdings: Holding[]) => void;
  totalBalance?: number;
  mode?: 'value' | 'percentage';
  onModeChange?: (mode: 'value' | 'percentage') => void;
  onTotalBalanceChange?: (balance: number) => void;
  showTotalInput?: boolean;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Format number with commas
function formatNumber(num: number): string {
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

// Parse formatted number
function parseFormattedNumber(str: string): number {
  return parseFloat(str.replace(/,/g, '')) || 0;
}

export default function HoldingsInput({ 
  holdings, 
  onChange, 
  totalBalance = 0,
  mode = 'value',
  onModeChange,
  onTotalBalanceChange,
  showTotalInput = false,
}: HoldingsInputProps) {
  const [searchTicker, setSearchTicker] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [lookupCache, setLookupCache] = useState<Record<string, { name: string; price: number }>>({});
  const [localTotal, setLocalTotal] = useState(totalBalance.toString());
  
  // Ask Maven state
  const [showMavenHelper, setShowMavenHelper] = useState(false);
  const [mavenQuery, setMavenQuery] = useState('');
  const [mavenSearching, setMavenSearching] = useState(false);
  const [mavenResult, setMavenResult] = useState<{ ticker: string; name: string; price?: number } | null>(null);
  const [mavenError, setMavenError] = useState('');
  
  // CSV Import state
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvParsed, setCsvParsed] = useState<Holding[]>([]);
  const [csvError, setCsvError] = useState('');
  const [csvImporting, setCsvImporting] = useState(false);

  const debouncedSearch = useDebounce(searchTicker, 300);

  // Sync local total with prop
  useEffect(() => {
    if (totalBalance > 0) {
      setLocalTotal(formatNumber(totalBalance));
    }
  }, [totalBalance]);

  // Fetch stock quote
  const fetchQuote = async (ticker: string): Promise<{ name: string; price: number } | null> => {
    if (lookupCache[ticker.toUpperCase()]) {
      return lookupCache[ticker.toUpperCase()];
    }

    try {
      const response = await fetch(`/api/stock-quote?ticker=${ticker.toUpperCase()}`);
      if (response.ok) {
        const data = await response.json();
        const result = { name: data.name, price: data.price };
        setLookupCache(prev => ({ ...prev, [ticker.toUpperCase()]: result }));
        return result;
      }
    } catch (error) {
      console.error('Failed to fetch quote:', error);
    }
    return null;
  };

  // Ask Maven to find a ticker
  const askMavenForTicker = async () => {
    if (!mavenQuery.trim()) return;
    
    setMavenSearching(true);
    setMavenError('');
    setMavenResult(null);
    
    try {
      // Call the chat API which has web search capability
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `I need to find the correct ticker symbol for this investment: "${mavenQuery}"

IMPORTANT: Use the web_search tool to look this up and verify the current information. Search for "${mavenQuery} ticker symbol" or "${mavenQuery} stock ETP ETF" to find accurate details.

After searching, respond ONLY with a JSON object in this exact format, nothing else:
{"ticker": "SYMBOL", "name": "Full Official Name of Investment"}

If you cannot find it even after searching, respond with:
{"error": "Could not find this investment. Please try a more specific name or check the spelling."}

Do NOT guess. Only return information you found from the search.`,
          conversationId: `ticker_lookup_${Date.now()}`
        }),
      });
      
      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      const content = data.response || data.content || data.message || '';
      
      // Try to parse JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.error) {
          setMavenError(parsed.error);
        } else if (parsed.ticker) {
          // Fetch current price
          const quote = await fetchQuote(parsed.ticker);
          setMavenResult({
            ticker: parsed.ticker.toUpperCase(),
            name: parsed.name || parsed.ticker,
            price: quote?.price,
          });
        }
      } else {
        setMavenError('Could not understand the response. Please try again.');
      }
    } catch (error) {
      console.error('Maven lookup error:', error);
      setMavenError('Something went wrong. Please try again.');
    } finally {
      setMavenSearching(false);
    }
  };

  const addMavenResult = () => {
    if (!mavenResult) return;
    
    if (holdings.some(h => h.ticker.toUpperCase() === mavenResult.ticker.toUpperCase())) {
      setMavenError(`${mavenResult.ticker} is already in your holdings`);
      return;
    }
    
    const newHolding: Holding = {
      ticker: mavenResult.ticker,
      name: mavenResult.name,
      shares: 0,
      costBasis: 0,
      currentPrice: mavenResult.price,
      currentValue: 0,
      percentage: 0,
    };
    
    onChange([...holdings, newHolding]);
    
    // Reset Maven helper
    setShowMavenHelper(false);
    setMavenQuery('');
    setMavenResult(null);
    setMavenError('');
    setSearchTicker('');
  };

  // Parse CSV/Spreadsheet text
  const parseCsvText = (text: string) => {
    setCsvError('');
    
    if (!text.trim()) {
      setCsvParsed([]);
      return;
    }
    
    const lines = text.trim().split('\n').filter(line => line.trim());
    const parsed: Holding[] = [];
    const errors: string[] = [];
    
    // Detect delimiter (tab, comma, or multiple spaces)
    const firstLine = lines[0];
    const delimiter = firstLine.includes('\t') ? '\t' : 
                      firstLine.includes(',') ? ',' : 
                      /\s{2,}/.test(firstLine) ? /\s{2,}/ : ',';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Skip header row if detected
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('ticker') || lowerLine.includes('symbol') || lowerLine.includes('security')) {
        continue;
      }
      
      const parts = line.split(delimiter).map(p => p.trim().replace(/"/g, '').replace(/^\$/, ''));
      
      if (parts.length < 1) continue;
      
      // Try to extract ticker (first column that looks like a ticker)
      let ticker = '';
      let shares = 0;
      let costBasis = 0;
      let currentValue = 0;
      let name = '';
      
      // Pattern: TICKER, [NAME], SHARES, [COST BASIS], [VALUE]
      // Or: TICKER, SHARES, VALUE
      // Or just: TICKER, VALUE
      
      for (const part of parts) {
        const cleaned = part.replace(/,/g, '');
        
        // Check if it's a ticker (1-6 uppercase letters, possibly with numbers)
        if (!ticker && /^[A-Z]{1,6}(-[A-Z]+)?$/.test(part.toUpperCase())) {
          ticker = part.toUpperCase();
        }
        // Check if it's a number (shares, cost basis, or value)
        else if (/^[\d,]+\.?\d*$/.test(cleaned)) {
          const num = parseFloat(cleaned);
          if (num > 0) {
            if (shares === 0 && num < 1000000) {
              shares = num;
            } else if (currentValue === 0) {
              currentValue = num;
            } else if (costBasis === 0) {
              costBasis = num;
            }
          }
        }
        // Otherwise it might be a name
        else if (!name && part.length > 2 && !/^[\d\$,\.]+$/.test(part)) {
          name = part;
        }
      }
      
      if (ticker) {
        // Skip if already in current holdings
        if (holdings.some(h => h.ticker.toUpperCase() === ticker)) {
          errors.push(`Skipped ${ticker} (already in holdings)`);
          continue;
        }
        
        parsed.push({
          ticker,
          name: name || ticker,
          shares: shares || 0,
          costBasis: costBasis || 0,
          currentValue: currentValue || 0,
          percentage: 0,
        });
      } else if (line.length > 5) {
        errors.push(`Could not parse: "${line.slice(0, 30)}..."`);
      }
    }
    
    if (errors.length > 0 && errors.length < 5) {
      setCsvError(errors.join('; '));
    } else if (errors.length >= 5) {
      setCsvError(`${errors.length} lines could not be parsed`);
    }
    
    setCsvParsed(parsed);
  };
  
  // Import parsed CSV holdings
  const importCsvHoldings = async () => {
    if (csvParsed.length === 0) return;
    
    setCsvImporting(true);
    
    // Fetch current prices for all tickers
    const enriched = await Promise.all(csvParsed.map(async (h) => {
      const quote = await fetchQuote(h.ticker);
      return {
        ...h,
        name: quote?.name || h.name,
        currentPrice: quote?.price,
        currentValue: h.currentValue || (quote?.price && h.shares ? quote.price * h.shares : 0),
      };
    }));
    
    // Add to holdings
    onChange([...holdings, ...enriched]);
    
    // Reset
    setShowCsvImport(false);
    setCsvText('');
    setCsvParsed([]);
    setCsvError('');
    setCsvImporting(false);
  };

  // Search for tickers via Yahoo Finance API
  useEffect(() => {
    if (debouncedSearch.length >= 1) {
      setIsSearching(true);
      
      // Special handling for CASH
      if (debouncedSearch.toUpperCase() === 'CASH' || debouncedSearch.toUpperCase().startsWith('CASH')) {
        setSearchResults([
          { ticker: 'CASH', name: 'Cash (USD)', type: 'Cash' },
          { ticker: 'SPAXX', name: 'Fidelity Government Money Market', type: 'Money Market' },
          { ticker: 'VMFXX', name: 'Vanguard Federal Money Market', type: 'Money Market' },
          { ticker: 'SWVXX', name: 'Schwab Value Advantage Money Fund', type: 'Money Market' },
        ]);
        setIsSearching(false);
        return;
      }
      
      // Search Yahoo Finance
      const searchYahoo = async () => {
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedSearch)}&limit=10`);
          if (response.ok) {
            const data = await response.json();
            setSearchResults(data.results.map((r: any) => ({
              ticker: r.ticker,
              name: r.name,
              type: r.type
            })));
          } else {
            setSearchResults([]);
          }
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      };
      
      searchYahoo();
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [debouncedSearch]);

  const addHolding = async (ticker: string, name?: string) => {
    if (holdings.some(h => h.ticker.toUpperCase() === ticker.toUpperCase())) {
      alert(`${ticker} is already in your holdings`);
      return;
    }

    const quote = await fetchQuote(ticker);
    const newHolding: Holding = {
      ticker: ticker.toUpperCase(),
      name: quote?.name || name || ticker.toUpperCase(),
      shares: 0,
      costBasis: 0,
      currentPrice: quote?.price,
      currentValue: 0,
      percentage: 0,
    };

    onChange([...holdings, newHolding]);
    setSearchTicker('');
    setSearchResults([]);
  };

  const updateHolding = (index: number, updates: Partial<Holding>) => {
    const updated = holdings.map((h, i) => {
      if (i !== index) return h;
      
      const newHolding = { ...h, ...updates };
      
      // In percentage mode, calculate value from total balance
      if (mode === 'percentage' && totalBalance > 0 && newHolding.percentage !== undefined) {
        newHolding.currentValue = (newHolding.percentage / 100) * totalBalance;
        if (newHolding.currentPrice && newHolding.currentPrice > 0) {
          newHolding.shares = newHolding.currentValue / newHolding.currentPrice;
        }
      }
      // In value mode, calculate from shares × price
      else if (mode === 'value' && newHolding.currentPrice && newHolding.shares) {
        newHolding.currentValue = newHolding.currentPrice * newHolding.shares;
      }
      
      return newHolding;
    });
    onChange(updated);
  };

  const removeHolding = (index: number) => {
    onChange(holdings.filter((_, i) => i !== index));
  };

  // Recalculate values when total balance changes (percentage mode)
  useEffect(() => {
    if (mode === 'percentage' && totalBalance > 0 && holdings.length > 0) {
      const updated = holdings.map(h => {
        if (h.percentage !== undefined && h.percentage > 0) {
          const currentValue = (h.percentage / 100) * totalBalance;
          const shares = h.currentPrice && h.currentPrice > 0 ? currentValue / h.currentPrice : h.shares;
          return { ...h, currentValue, shares };
        }
        return h;
      });
      // Only update if values actually changed
      const hasChanges = updated.some((h, i) => h.currentValue !== holdings[i].currentValue);
      if (hasChanges) {
        onChange(updated);
      }
    }
  }, [totalBalance, mode]);

  const totalValue = holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
  const totalPercentage = holdings.reduce((sum, h) => sum + (h.percentage || 0), 0);

  const handleTotalChange = (value: string) => {
    // Allow commas and numbers
    const cleaned = value.replace(/[^0-9,]/g, '');
    setLocalTotal(cleaned);
    
    const numericValue = parseFormattedNumber(cleaned);
    if (onTotalBalanceChange && numericValue !== totalBalance) {
      onTotalBalanceChange(numericValue);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle + Total Balance Input */}
      {(onModeChange || showTotalInput) && (
        <div className="flex flex-col sm:flex-row gap-3 p-3 bg-[var(--card)] rounded-xl border border-[var(--border)]">
          {onModeChange && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onModeChange('percentage')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  mode === 'percentage'
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--background)] border border-[var(--border)] text-[var(--muted)] hover:text-white'
                }`}
              >
                % Allocation
              </button>
              <button
                type="button"
                onClick={() => onModeChange('value')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  mode === 'value'
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--background)] border border-[var(--border)] text-[var(--muted)] hover:text-white'
                }`}
              >
                $ Values
              </button>
            </div>
          )}
          
          {showTotalInput && mode === 'percentage' && (
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--muted)]">Total Balance:</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={localTotal}
                    onChange={(e) => handleTotalChange(e.target.value)}
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-lg pl-7 pr-3 py-2 text-sm font-medium focus:outline-none focus:border-[var(--primary)]"
                    placeholder="Enter total account value"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTicker}
              onChange={(e) => setSearchTicker(e.target.value.toUpperCase())}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)]"
              placeholder="Search ticker or fund name..."
            />
            {isSearching && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                ⏳
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => searchTicker && addHolding(searchTicker)}
            className="px-4 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl font-medium transition"
          >
            + Add
          </button>
          <button
            type="button"
            onClick={() => setShowCsvImport(true)}
            className="px-4 py-3 bg-[var(--card)] border border-[var(--border)] hover:bg-[var(--background)] text-white rounded-xl font-medium transition flex items-center gap-2"
            title="Import from spreadsheet"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">Import</span>
          </button>
        </div>

        {/* Search Results Dropdown */}
        {(searchResults.length > 0 || (searchTicker.length >= 2 && !isSearching)) && (
          <div className="absolute z-10 w-full mt-2 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden max-h-72 overflow-y-auto">
            {searchResults.map((result: any) => (
              <button
                key={result.ticker}
                type="button"
                onClick={() => addHolding(result.ticker, result.name)}
                className="w-full px-4 py-3 text-left hover:bg-[var(--background)] transition flex justify-between items-center gap-2"
              >
                <div className="flex-1 min-w-0">
                  <span className="font-semibold">{result.ticker}</span>
                  <span className="text-sm text-[var(--muted)] ml-2 truncate">{result.name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {result.type && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      result.type === 'ETF' ? 'bg-blue-500/20 text-blue-300' :
                      result.type === 'Mutual Fund' ? 'bg-purple-500/20 text-purple-300' :
                      result.type === 'Crypto' ? 'bg-orange-500/20 text-orange-300' :
                      result.type === 'Money Market' || result.type === 'Cash' ? 'bg-gray-500/20 text-gray-300' :
                      'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {result.type}
                    </span>
                  )}
                  <span className="text-[var(--primary)]">+</span>
                </div>
              </button>
            ))}
            
            {/* Ask Maven Option */}
            <button
              type="button"
              onClick={() => {
                setShowMavenHelper(true);
                setMavenQuery(searchTicker);
                setSearchTicker('');
                setSearchResults([]);
              }}
              className="w-full px-4 py-3 text-left hover:bg-purple-500/10 transition flex items-center gap-3 border-t border-[var(--border)] bg-gradient-to-r from-purple-500/5 to-indigo-500/5"
            >
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm">
                🔮
              </span>
              <div>
                <span className="font-medium text-purple-300">Can't find it? Ask Maven</span>
                <span className="text-sm text-[var(--muted)] block">I'll help identify any investment</span>
              </div>
            </button>
          </div>
        )}
      </div>
      
      {/* Maven Helper Modal */}
      {showMavenHelper && (
        <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/30 rounded-xl p-4 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl flex-shrink-0">
              🔮
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-purple-200">Ask Maven</h4>
              <p className="text-sm text-[var(--muted)]">Describe the investment you're looking for</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowMavenHelper(false);
                setMavenQuery('');
                setMavenResult(null);
                setMavenError('');
              }}
              className="text-[var(--muted)] hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={mavenQuery}
              onChange={(e) => setMavenQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && askMavenForTicker()}
              className="flex-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
              placeholder="e.g., 'Apple stock', 'Vanguard S&P 500 fund', 'Bitcoin ETF'"
              autoFocus
            />
            <button
              type="button"
              onClick={askMavenForTicker}
              disabled={mavenSearching || !mavenQuery.trim()}
              className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 disabled:opacity-50 text-white rounded-xl font-medium transition"
            >
              {mavenSearching ? '...' : 'Find'}
            </button>
          </div>
          
          {mavenError && (
            <p className="text-sm text-red-400">{mavenError}</p>
          )}
          
          {mavenResult && (
            <div className="bg-[var(--background)] border border-emerald-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-lg text-emerald-400">{mavenResult.ticker}</span>
                  <span className="text-sm text-[var(--muted)] ml-2">{mavenResult.name}</span>
                  {mavenResult.price && (
                    <span className="text-sm text-emerald-400 ml-2">${mavenResult.price.toFixed(2)}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={addMavenResult}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg font-medium transition"
                >
                  + Add
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CSV Import Modal */}
      {showCsvImport && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Import from Spreadsheet
              </h4>
              <p className="text-sm text-[var(--muted)]">Paste holdings from Excel, Google Sheets, or CSV</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowCsvImport(false);
                setCsvText('');
                setCsvParsed([]);
                setCsvError('');
              }}
              className="text-[var(--muted)] hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="text-xs text-[var(--muted)] p-3 bg-[var(--background)] rounded-lg">
            <p className="font-medium mb-1">Accepted formats:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>TICKER, SHARES, VALUE (e.g., "VTI, 100, 25000")</li>
              <li>TICKER, NAME, SHARES (e.g., "AAPL, Apple Inc, 50")</li>
              <li>Just paste directly from your brokerage statement</li>
            </ul>
          </div>
          
          <textarea
            value={csvText}
            onChange={(e) => {
              setCsvText(e.target.value);
              parseCsvText(e.target.value);
            }}
            className="w-full h-40 bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-[var(--primary)] resize-none"
            placeholder="Paste your holdings here...

Example:
VTI    100    25000
AAPL   50     8500
BND    200    15000"
          />
          
          {csvError && (
            <p className="text-sm text-yellow-400">⚠️ {csvError}</p>
          )}
          
          {csvParsed.length > 0 && (
            <div className="bg-[var(--background)] rounded-xl p-3 space-y-2">
              <p className="text-sm font-medium text-emerald-400">
                ✓ Found {csvParsed.length} holdings to import:
              </p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {csvParsed.slice(0, 10).map((h, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>
                      <span className="font-medium">{h.ticker}</span>
                      {h.name && h.name !== h.ticker && <span className="text-[var(--muted)] ml-2">{h.name.slice(0, 25)}</span>}
                    </span>
                    <span className="text-[var(--muted)]">
                      {h.shares > 0 ? `${h.shares} shares` : ''}
                      {(h.currentValue || 0) > 0 ? ` · $${(h.currentValue || 0).toLocaleString()}` : ''}
                    </span>
                  </div>
                ))}
                {csvParsed.length > 10 && (
                  <p className="text-xs text-[var(--muted)]">...and {csvParsed.length - 10} more</p>
                )}
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowCsvImport(false);
                setCsvText('');
                setCsvParsed([]);
                setCsvError('');
              }}
              className="px-4 py-2 bg-[var(--background)] border border-[var(--border)] text-white rounded-lg font-medium hover:bg-[var(--card)] transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={importCsvHoldings}
              disabled={csvParsed.length === 0 || csvImporting}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition flex items-center gap-2"
            >
              {csvImporting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Importing...
                </>
              ) : (
                <>Import {csvParsed.length} Holdings</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Holdings List */}
      {holdings.length > 0 && (
        <div className="space-y-3">
          {holdings.map((holding, idx) => (
            <div key={idx} className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <span className="font-bold text-lg">{holding.ticker}</span>
                  {holding.name && holding.name !== holding.ticker && (
                    <span className="text-sm text-[var(--muted)] ml-2 block sm:inline">{holding.name}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeHolding(idx)}
                  className="text-red-400 hover:text-red-300 text-sm ml-2"
                >
                  ✕
                </button>
              </div>

              {mode === 'percentage' ? (
                /* Percentage Mode */
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-[var(--muted)] mb-1">Allocation %</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={holding.percentage || ''}
                        onChange={(e) => {
                          const pct = parseFloat(e.target.value) || 0;
                          updateHolding(idx, { percentage: pct });
                        }}
                        className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 pr-8 py-2 text-sm focus:outline-none focus:border-[var(--primary)]"
                        placeholder="0"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] text-sm">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--muted)] mb-1">Value</label>
                    <div className="px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm text-emerald-400 font-medium">
                      ${formatNumber(holding.currentValue || 0)}
                    </div>
                  </div>
                </div>
              ) : (
                /* Value Mode */
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-[var(--muted)] mb-1">Shares</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={holding.shares || ''}
                      onChange={(e) => {
                        const shares = parseFloat(e.target.value) || 0;
                        const currentValue = holding.currentPrice ? shares * holding.currentPrice : holding.currentValue;
                        updateHolding(idx, { shares, currentValue });
                      }}
                      className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--muted)] mb-1">Value</label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--muted)] text-sm">$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={holding.currentValue ? formatNumber(holding.currentValue) : ''}
                        onChange={(e) => {
                          const value = parseFormattedNumber(e.target.value);
                          if (holding.currentPrice && holding.currentPrice > 0) {
                            const shares = value / holding.currentPrice;
                            updateHolding(idx, { shares, currentValue: value });
                          } else {
                            updateHolding(idx, { currentValue: value });
                          }
                        }}
                        className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg pl-6 pr-2 py-2 text-sm focus:outline-none focus:border-[var(--primary)]"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--muted)] mb-1">Cost Basis</label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--muted)] text-sm">$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={holding.costBasis ? formatNumber(holding.costBasis) : ''}
                        onChange={(e) => updateHolding(idx, { costBasis: parseFormattedNumber(e.target.value) })}
                        className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg pl-6 pr-2 py-2 text-sm focus:outline-none focus:border-[var(--primary)]"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Price indicator */}
              {holding.currentPrice && (
                <div className="mt-2 text-xs text-[var(--muted)]">
                  Price: <span className="text-emerald-400">${holding.currentPrice.toFixed(2)}</span>
                  {holding.shares > 0 && mode === 'percentage' && (
                    <span className="ml-2">• ~{holding.shares.toFixed(2)} shares</span>
                  )}
                </div>
              )}

              {/* Gain/Loss indicator (value mode) */}
              {mode === 'value' && holding.currentValue && holding.costBasis > 0 && (
                <div className="mt-2 text-xs">
                  <span className="text-[var(--muted)]">Unrealized: </span>
                  <span className={holding.currentValue > holding.costBasis ? 'text-emerald-400' : 'text-red-400'}>
                    {holding.currentValue > holding.costBasis ? '+' : ''}
                    ${formatNumber(holding.currentValue - holding.costBasis)}
                    {' '}
                    ({holding.currentValue > holding.costBasis ? '+' : ''}
                    {(((holding.currentValue - holding.costBasis) / holding.costBasis) * 100).toFixed(1)}%)
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* Totals */}
          <div className="pt-2 border-t border-[var(--border)] space-y-1">
            {mode === 'percentage' && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--muted)]">Total Allocation</span>
                <span className={`font-medium ${totalPercentage === 100 ? 'text-emerald-400' : totalPercentage > 100 ? 'text-red-400' : 'text-amber-400'}`}>
                  {totalPercentage.toFixed(1)}%
                  {totalPercentage !== 100 && (
                    <span className="text-xs ml-1">({totalPercentage < 100 ? `${(100 - totalPercentage).toFixed(1)}% unallocated` : 'over 100%'})</span>
                  )}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Value</span>
              <span className="text-xl font-bold text-emerald-400">
                ${formatNumber(totalValue)}
              </span>
            </div>
          </div>
        </div>
      )}

      {holdings.length === 0 && (
        <p className="text-sm text-[var(--muted)] text-center py-4">
          Search for a ticker above to add holdings
        </p>
      )}
    </div>
  );
}
