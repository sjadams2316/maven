'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Search, TrendingUp, TrendingDown, MessageCircle, Send, Loader2, Sparkles, ArrowRight, X } from 'lucide-react';
import { clsx } from 'clsx';

// Demo portfolio for impact analysis
const DEMO_PORTFOLIO = {
  totalValue: 850000,
  allocation: {
    usStocks: 45,
    intlStocks: 12,
    bonds: 25,
    cash: 8,
    crypto: 5,
    reits: 5,
  },
  holdings: [
    { symbol: 'VTI', name: 'Vanguard Total Stock Market', value: 280000, type: 'US Stocks' },
    { symbol: 'BND', name: 'Vanguard Total Bond', value: 212500, type: 'Bonds' },
    { symbol: 'VXUS', name: 'Vanguard Total International', value: 102000, type: 'Intl Stocks' },
    { symbol: 'VNQ', name: 'Vanguard Real Estate', value: 42500, type: 'REITs' },
    { symbol: 'TAO', name: 'Bittensor', value: 42500, type: 'Crypto' },
  ],
};

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange?: string;
}

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap?: number;
  peRatio?: number;
  dividendYield?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  type: string;
}

interface PortfolioImpact {
  currentAllocation: Record<string, number>;
  newAllocation: Record<string, number>;
  concentrationRisk: 'low' | 'moderate' | 'high';
  overlap: number;
  notes: string[];
}

// Categorize securities into asset classes
function getAssetClass(symbol: string, type: string): string {
  const cryptoSymbols = ['BTC', 'ETH', 'TAO', 'SOL', 'DOGE', 'ADA', 'XRP'];
  const bondETFs = ['BND', 'AGG', 'TLT', 'VCIT', 'VCSH', 'LQD', 'HYG', 'TIP', 'VTIP'];
  const intlETFs = ['VXUS', 'VEA', 'VWO', 'IEFA', 'EEM', 'IXUS'];
  const reitETFs = ['VNQ', 'SCHH', 'IYR', 'XLRE'];
  
  if (type === 'Cryptocurrency' || cryptoSymbols.includes(symbol.toUpperCase())) return 'Crypto';
  if (bondETFs.includes(symbol.toUpperCase())) return 'Bonds';
  if (intlETFs.includes(symbol.toUpperCase())) return 'Intl Stocks';
  if (reitETFs.includes(symbol.toUpperCase())) return 'REITs';
  if (type === 'ETF' || type === 'Mutual Fund') return 'US Stocks'; // Default ETFs to US
  return 'US Stocks'; // Default stocks to US
}

// Calculate portfolio impact
function calculateImpact(stock: StockData, investmentAmount: number = 10000): PortfolioImpact {
  const assetClass = getAssetClass(stock.symbol, stock.type);
  const newTotal = DEMO_PORTFOLIO.totalValue + investmentAmount;
  
  // Current allocation
  const currentAllocation = { ...DEMO_PORTFOLIO.allocation };
  
  // Calculate new allocation
  const newAllocation = { ...currentAllocation };
  const assetClassKey = assetClass.toLowerCase().replace(' ', '') as keyof typeof currentAllocation;
  
  // Add investment to appropriate asset class
  const currentValue = (currentAllocation[assetClassKey] || 0) / 100 * DEMO_PORTFOLIO.totalValue;
  const newValue = currentValue + investmentAmount;
  const newPercent = (newValue / newTotal) * 100;
  
  // Recalculate all percentages
  Object.keys(newAllocation).forEach(key => {
    const k = key as keyof typeof newAllocation;
    if (k === assetClassKey) {
      newAllocation[k] = Math.round(newPercent * 10) / 10;
    } else {
      const oldValue = (currentAllocation[k] / 100) * DEMO_PORTFOLIO.totalValue;
      newAllocation[k] = Math.round((oldValue / newTotal) * 100 * 10) / 10;
    }
  });
  
  // Check for overlap with existing holdings
  const existingHolding = DEMO_PORTFOLIO.holdings.find(
    h => h.symbol.toUpperCase() === stock.symbol.toUpperCase()
  );
  const overlap = existingHolding ? 100 : 0;
  
  // Determine concentration risk
  let concentrationRisk: 'low' | 'moderate' | 'high' = 'low';
  if (newAllocation[assetClassKey] > 40) concentrationRisk = 'high';
  else if (newAllocation[assetClassKey] > 30) concentrationRisk = 'moderate';
  
  // Generate notes
  const notes: string[] = [];
  const allocationChange = newAllocation[assetClassKey] - currentAllocation[assetClassKey];
  
  if (allocationChange > 0) {
    notes.push(`${assetClass} allocation: ${currentAllocation[assetClassKey]}% → ${newAllocation[assetClassKey]}%`);
  }
  
  if (existingHolding) {
    notes.push(`You already own ${existingHolding.symbol} — this would increase your position`);
  }
  
  if (concentrationRisk === 'high') {
    notes.push(`⚠️ This would concentrate ${newAllocation[assetClassKey]}% in ${assetClass}`);
  }
  
  if (stock.type === 'Cryptocurrency') {
    notes.push(`Crypto is volatile — consider your risk tolerance`);
  }
  
  return {
    currentAllocation,
    newAllocation,
    concentrationRisk,
    overlap,
    notes,
  };
}

export default function ExplorePage() {
  const params = useParams<{ code: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [portfolioImpact, setPortfolioImpact] = useState<PortfolioImpact | null>(null);
  const [showOracleChat, setShowOracleChat] = useState(false);
  const [oracleMessages, setOracleMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [oracleInput, setOracleInput] = useState('');
  const [isOracleTyping, setIsOracleTyping] = useState(false);
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);
  const [advisorMessage, setAdvisorMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/stock-search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  // Load stock details
  const selectStock = useCallback(async (result: SearchResult) => {
    setSelectedStock(null);
    setPortfolioImpact(null);
    setSearchQuery('');
    setSearchResults([]);
    setIsLoadingStock(true);
    setShowOracleChat(false);
    setOracleMessages([]);
    
    try {
      const res = await fetch(`/api/stock-quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols: [result.symbol] }),
      });
      const data = await res.json();
      const quote = data.quotes?.[result.symbol];
      
      if (quote) {
        const stockData: StockData = {
          symbol: result.symbol,
          name: result.name,
          price: quote.price || 0,
          change: quote.change || 0,
          changePercent: quote.changePercent || 0,
          marketCap: quote.marketCap,
          peRatio: quote.peRatio,
          dividendYield: quote.dividendYield,
          fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
          type: result.type,
        };
        setSelectedStock(stockData);
        setPortfolioImpact(calculateImpact(stockData));
      }
    } catch (error) {
      console.error('Failed to load stock:', error);
    } finally {
      setIsLoadingStock(false);
    }
  }, []);

  // Ask Maven Oracle
  const askOracle = useCallback(async (question?: string) => {
    if (!selectedStock) return;
    
    const prompt = question || oracleInput.trim();
    if (!prompt) return;
    
    setOracleInput('');
    setOracleMessages(prev => [...prev, { role: 'user', content: prompt }]);
    setIsOracleTyping(true);
    
    try {
      const context = {
        firstName: 'John',
        currentHoldings: DEMO_PORTFOLIO.holdings,
        researchingStock: {
          symbol: selectedStock.symbol,
          name: selectedStock.name,
          price: selectedStock.price,
          type: selectedStock.type,
        },
        portfolioImpact,
      };
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          context,
          history: oracleMessages,
        }),
      });
      
      const data = await res.json();
      setOracleMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setOracleMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I had trouble processing that. Please try again.' 
      }]);
    } finally {
      setIsOracleTyping(false);
    }
  }, [selectedStock, oracleInput, oracleMessages, portfolioImpact]);

  // Send message to advisor
  const sendToAdvisor = useCallback(() => {
    if (!selectedStock || !advisorMessage.trim()) return;
    
    // In production, this would call an API to notify the advisor
    console.log('Sending to advisor:', {
      stock: selectedStock.symbol,
      message: advisorMessage,
      clientCode: params.code,
    });
    
    setMessageSent(true);
    setTimeout(() => {
      setShowAdvisorModal(false);
      setAdvisorMessage('');
      setMessageSent(false);
    }, 2000);
  }, [selectedStock, advisorMessage, params.code]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Explore Investments</h1>
        <p className="text-gray-400">
          Research stocks, ETFs, and crypto. See how they'd fit your portfolio.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a stock, ETF, or crypto..."
            className="w-full pl-12 pr-4 py-4 bg-[#111827] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition"
          />
          {isSearching && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 animate-spin" />
          )}
        </div>
        
        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#111827] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
            {searchResults.map((result) => (
              <button
                key={result.symbol}
                onClick={() => selectStock(result)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition text-left"
              >
                <div>
                  <p className="text-white font-medium">{result.symbol}</p>
                  <p className="text-gray-400 text-sm">{result.name}</p>
                </div>
                <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">
                  {result.type}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoadingStock && (
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-8 text-center">
          <Loader2 className="h-8 w-8 text-teal-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading investment details...</p>
        </div>
      )}

      {/* Stock Details */}
      {selectedStock && !isLoadingStock && (
        <div className="space-y-6">
          {/* Stock Card */}
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-2xl font-bold text-white">{selectedStock.symbol}</h2>
                  <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">
                    {selectedStock.type}
                  </span>
                </div>
                <p className="text-gray-400">{selectedStock.name}</p>
              </div>
              <button
                onClick={() => setSelectedStock(null)}
                className="p-2 text-gray-500 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex items-end gap-4 mb-6">
              <span className="text-4xl font-bold text-white">
                {formatCurrency(selectedStock.price)}
              </span>
              <span className={clsx(
                'flex items-center gap-1 text-lg font-medium pb-1',
                selectedStock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
              )}>
                {selectedStock.changePercent >= 0 ? (
                  <TrendingUp className="h-5 w-5" />
                ) : (
                  <TrendingDown className="h-5 w-5" />
                )}
                {formatPercent(selectedStock.changePercent)}
              </span>
            </div>
            
            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {selectedStock.marketCap && (
                <div>
                  <p className="text-gray-500 text-xs mb-1">Market Cap</p>
                  <p className="text-white font-medium">
                    {selectedStock.marketCap >= 1e12 
                      ? `$${(selectedStock.marketCap / 1e12).toFixed(1)}T`
                      : selectedStock.marketCap >= 1e9
                        ? `$${(selectedStock.marketCap / 1e9).toFixed(1)}B`
                        : `$${(selectedStock.marketCap / 1e6).toFixed(0)}M`
                    }
                  </p>
                </div>
              )}
              {selectedStock.peRatio && (
                <div>
                  <p className="text-gray-500 text-xs mb-1">P/E Ratio</p>
                  <p className="text-white font-medium">{selectedStock.peRatio.toFixed(1)}</p>
                </div>
              )}
              {selectedStock.dividendYield && selectedStock.dividendYield > 0 && (
                <div>
                  <p className="text-gray-500 text-xs mb-1">Dividend Yield</p>
                  <p className="text-white font-medium">{selectedStock.dividendYield.toFixed(2)}%</p>
                </div>
              )}
              {selectedStock.fiftyTwoWeekHigh && (
                <div>
                  <p className="text-gray-500 text-xs mb-1">52-Week Range</p>
                  <p className="text-white font-medium">
                    ${selectedStock.fiftyTwoWeekLow?.toFixed(0)} - ${selectedStock.fiftyTwoWeekHigh.toFixed(0)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Portfolio Impact */}
          {portfolioImpact && (
            <div className="bg-[#111827] border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-teal-400" />
                How this would fit your portfolio
              </h3>
              
              <p className="text-gray-400 text-sm mb-4">
                If you invested $10,000 in {selectedStock.symbol}:
              </p>
              
              {/* Allocation Changes */}
              <div className="space-y-3 mb-6">
                {portfolioImpact.notes.map((note, idx) => (
                  <div 
                    key={idx}
                    className={clsx(
                      'flex items-start gap-3 p-3 rounded-lg',
                      note.includes('⚠️') ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-white/5'
                    )}
                  >
                    <span className="text-sm text-gray-300">{note}</span>
                  </div>
                ))}
              </div>
              
              {/* Concentration Risk Badge */}
              <div className="flex items-center gap-2 mb-6">
                <span className="text-gray-400 text-sm">Concentration Risk:</span>
                <span className={clsx(
                  'px-2 py-1 rounded text-xs font-medium',
                  portfolioImpact.concentrationRisk === 'low' && 'bg-emerald-500/20 text-emerald-400',
                  portfolioImpact.concentrationRisk === 'moderate' && 'bg-amber-500/20 text-amber-400',
                  portfolioImpact.concentrationRisk === 'high' && 'bg-red-500/20 text-red-400'
                )}>
                  {portfolioImpact.concentrationRisk.charAt(0).toUpperCase() + portfolioImpact.concentrationRisk.slice(1)}
                </span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowOracleChat(true);
                    if (oracleMessages.length === 0) {
                      askOracle(`Tell me about ${selectedStock.symbol} and whether it would be a good fit for my portfolio. Consider my current holdings and risk tolerance.`);
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-400 rounded-xl transition font-medium"
                >
                  <MessageCircle className="h-5 w-5" />
                  Ask Maven
                </button>
                <button
                  onClick={() => setShowAdvisorModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition font-medium"
                >
                  <Send className="h-5 w-5" />
                  Discuss with Advisor
                </button>
              </div>
            </div>
          )}

          {/* Oracle Chat */}
          {showOracleChat && (
            <div className="bg-[#111827] border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔮</span>
                  <h3 className="font-semibold text-white">Maven Oracle</h3>
                </div>
                <button
                  onClick={() => setShowOracleChat(false)}
                  className="p-2 text-gray-500 hover:text-white transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Messages */}
              <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
                {oracleMessages.map((msg, idx) => (
                  <div 
                    key={idx}
                    className={clsx(
                      'flex',
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div className={clsx(
                      'max-w-[85%] rounded-2xl px-4 py-3',
                      msg.role === 'user' 
                        ? 'bg-teal-500/20 text-white' 
                        : 'bg-white/5 text-gray-300'
                    )}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isOracleTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 rounded-2xl px-4 py-3">
                      <Loader2 className="h-5 w-5 text-teal-400 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={oracleInput}
                    onChange={(e) => setOracleInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && askOracle()}
                    placeholder="Ask a follow-up question..."
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50"
                  />
                  <button
                    onClick={() => askOracle()}
                    disabled={!oracleInput.trim() || isOracleTyping}
                    className="px-4 py-3 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 text-teal-400 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!selectedStock && !isLoadingStock && (
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-teal-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Research any investment</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Search for stocks, ETFs, or crypto to see details, how they'd impact your portfolio, and discuss with Maven or your advisor.
          </p>
        </div>
      )}

      {/* Advisor Modal */}
      {showAdvisorModal && selectedStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !messageSent && setShowAdvisorModal(false)}
          />
          <div className="relative bg-[#111827] border border-white/10 rounded-2xl w-full max-w-md p-6">
            {messageSent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✓</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Message Sent!</h3>
                <p className="text-gray-400 text-sm">
                  Your advisor will review your interest in {selectedStock.symbol} and get back to you.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Discuss {selectedStock.symbol} with your advisor
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Let your advisor know you're interested in this investment. They'll review and get back to you.
                </p>
                
                <textarea
                  value={advisorMessage}
                  onChange={(e) => setAdvisorMessage(e.target.value)}
                  placeholder={`I'm interested in learning more about ${selectedStock.symbol}...`}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 resize-none mb-4"
                />
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAdvisorModal(false)}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendToAdvisor}
                    disabled={!advisorMessage.trim()}
                    className="flex-1 px-4 py-3 bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/30 text-teal-400 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send to Advisor
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
