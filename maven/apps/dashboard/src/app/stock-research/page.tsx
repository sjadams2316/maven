'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Search, BarChart3, Shield, Target, Zap } from 'lucide-react';
import Header from '@/app/components/Header';

interface ResearchData {
  symbol: string;
  name: string;
  sector: string | null;
  industry: string | null;
  description: string | null;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  fiftyDayAvg: number;
  twoHundredDayAvg: number;
  volume: number;
  avgVolume: number;
  marketCap: number;
  analystRating: string;
  numberOfAnalysts: number;
  strongBuyCount: number;
  buyCount: number;
  holdCount: number;
  sellCount: number;
  strongSellCount: number;
  targetHigh: number;
  targetLow: number;
  targetMean: number;
  targetMedian: number;
  currentToTarget: number;
  peRatio: number | null;
  pbRatio: number | null;
  psRatio: number | null;
  evToEbitda: number | null;
  grossMargin: number | null;
  operatingMargin: number | null;
  netMargin: number | null;
  roe: number | null;
  roa: number | null;
  revenueGrowth: number | null;
  earningsGrowth: number | null;
  currentRatio: number | null;
  debtToEquity: number | null;
  dividendYield: number | null;
  freeCashFlow: number | null;
  fcfYield: number | null;
  eps: number | null;
  revenue: number | null;
  netIncome: number | null;
  mavenScore: number;
  scoreBreakdown: {
    analystConviction: number;
    valuation: number;
    momentum: number;
    quality: number;
  };
  qualityGrade: string;
  valuationGrade: string;
  growthGrade: string;
  momentumGrade: string;
  technicalLevels: {
    support1: number;
    support2: number;
    resistance1: number;
    resistance2: number;
    pivotPoint: number;
  };
  bullCase: string[];
  bearCase: string[];
  catalysts: string[];
  risks: string[];
  recentNews: { title: string; link: string; publisher: string; date: string }[];
  dataSource: string;
}

function TechnicalCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 rounded-xl p-3 sm:p-4">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-sm sm:text-base font-semibold text-white">{value}</div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white/5 rounded-xl p-3 sm:p-4">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-sm font-semibold text-white">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}

function GradeBadge({ grade, label }: { grade: string; label: string }) {
  const colors: Record<string, string> = {
    A: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    B: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    C: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    D: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    F: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <div className="text-center">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border text-lg font-bold ${colors[grade] || colors.C}`}>
        {grade}
      </div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined) return 'N/A';
  if (Math.abs(n) >= 1e12) return `$${(n / 1e12).toFixed(1)}T`;
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

function formatPercent(n: number | null | undefined): string {
  if (n === null || n === undefined) return 'N/A';
  return `${n.toFixed(1)}%`;
}

function StockResearchContent() {
  const searchParams = useSearchParams();
  const initialSymbol = searchParams.get('symbol')?.toUpperCase() || '';
  const [symbol, setSymbol] = useState(initialSymbol);
  const [searchInput, setSearchInput] = useState(initialSymbol);
  const [data, setData] = useState<ResearchData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (symbol) fetchResearch(symbol);
  }, [symbol]);

  async function fetchResearch(sym: string) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/stock-research?symbol=${sym}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setData(json);
    } catch {
      setError('Unable to load research data');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchInput.trim()) {
      setSymbol(searchInput.trim().toUpperCase());
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Back + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <Link href="/demo" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <form onSubmit={handleSearch} className="flex-1 flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
                placeholder="Enter ticker (e.g. MSFT)"
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors">
              Research
            </button>
          </form>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
          </div>
        )}

        {error && (
          <div className="text-center py-20 text-red-400">{error}</div>
        )}

        {!loading && !error && !data && !symbol && (
          <div className="text-center py-20 text-gray-500">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Enter a ticker symbol to start research</p>
          </div>
        )}

        {data && (
          <>
            {/* Price Header */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">{data.symbol}</h1>
                    <span className="text-gray-400 text-lg">{data.name}</span>
                  </div>
                  {data.sector && (
                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">{data.sector} · {data.industry}</span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">${data.currentPrice.toFixed(2)}</div>
                  <div className={`text-lg font-medium ${data.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {data.changePercent >= 0 ? '+' : ''}{data.change.toFixed(2)} ({data.changePercent >= 0 ? '+' : ''}{data.changePercent.toFixed(2)}%)
                  </div>
                </div>
              </div>
              {/* Grades row */}
              <div className="flex gap-6 mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-indigo-400">{data.mavenScore}</div>
                  <div className="text-xs text-gray-500">Maven<br/>Score</div>
                </div>
                <GradeBadge grade={data.qualityGrade} label="Quality" />
                <GradeBadge grade={data.valuationGrade} label="Value" />
                <GradeBadge grade={data.growthGrade} label="Growth" />
                <GradeBadge grade={data.momentumGrade} label="Momentum" />
              </div>
            </div>

            {/* TradingView Advanced Chart */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden mb-6">
              <iframe
                src={`https://www.tradingview.com/widgetembed/?symbol=${data.symbol}&interval=D&theme=dark&style=1&locale=en&toolbar_bg=%230a0a12&enable_publishing=false&hide_top_toolbar=false&hide_legend=false&save_image=false&studies=RSI%40tv-basicstudies&studies=MACD%40tv-basicstudies&width=100%25&height=500`}
                width="100%"
                height="500"
                frameBorder="0"
                allowTransparency
                className="w-full"
              />
            </div>

            {/* Technical Analysis Section */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 mb-6">
              <h3 className="font-semibold text-lg text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-400" />
                Technical Analysis
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <TechnicalCard label="Support 1" value={`$${data.technicalLevels.support1.toFixed(2)}`} />
                <TechnicalCard label="Support 2" value={`$${data.technicalLevels.support2.toFixed(2)}`} />
                <TechnicalCard label="Resistance 1" value={`$${data.technicalLevels.resistance1.toFixed(2)}`} />
                <TechnicalCard label="Resistance 2" value={`$${data.technicalLevels.resistance2.toFixed(2)}`} />
              </div>

              {/* 52-week range bar */}
              <div className="mt-6">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>52-Week Low: ${data.fiftyTwoWeekLow.toFixed(2)}</span>
                  <span>52-Week High: ${data.fiftyTwoWeekHigh.toFixed(2)}</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full relative">
                  <div
                    className="absolute h-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 rounded-full"
                    style={{ width: '100%' }}
                  />
                  <div
                    className="absolute w-3 h-3 bg-white rounded-full top-1/2 -translate-y-1/2 border-2 border-indigo-500"
                    style={{ left: `${Math.min(100, Math.max(0, ((data.currentPrice - data.fiftyTwoWeekLow) / (data.fiftyTwoWeekHigh - data.fiftyTwoWeekLow)) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Moving averages */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">50-Day MA</span>
                  <span className={data.currentPrice > data.fiftyDayAvg ? 'text-emerald-400' : 'text-red-400'}>
                    ${data.fiftyDayAvg.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">200-Day MA</span>
                  <span className={data.currentPrice > data.twoHundredDayAvg ? 'text-emerald-400' : 'text-red-400'}>
                    ${data.twoHundredDayAvg.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* TradingView Technical Analysis Widget */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden mb-6">
              <iframe
                src={`https://www.tradingview.com/widgetembed/?symbol=${data.symbol}&interval=D&theme=dark&style=1&locale=en&toolbarbg=f1f3f6&studies=[]&hideideas=1&widgetType=technical-analysis`}
                width="100%"
                height="425"
                frameBorder="0"
                className="w-full"
              />
            </div>

            {/* Analyst Ratings + Price Targets */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Analyst Rating */}
              <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                <h3 className="font-semibold text-lg text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-400" />
                  Analyst Consensus
                </h3>
                <div className="text-center mb-4">
                  <span className={`text-2xl font-bold capitalize ${
                    data.analystRating.includes('buy') ? 'text-emerald-400' :
                    data.analystRating.includes('sell') ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {data.analystRating}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">{data.numberOfAnalysts} analysts</div>
                </div>
                {/* Rating bar */}
                <div className="flex gap-1 mb-2">
                  {[
                    { label: 'Strong Buy', count: data.strongBuyCount, color: 'bg-emerald-500' },
                    { label: 'Buy', count: data.buyCount, color: 'bg-emerald-400' },
                    { label: 'Hold', count: data.holdCount, color: 'bg-yellow-400' },
                    { label: 'Sell', count: data.sellCount, color: 'bg-red-400' },
                    { label: 'Strong Sell', count: data.strongSellCount, color: 'bg-red-500' },
                  ].map((r) => (
                    <div key={r.label} className="flex-1">
                      <div className={`h-2 ${r.color} rounded-full`} style={{ opacity: r.count > 0 ? 1 : 0.2 }} />
                      <div className="text-[10px] text-gray-500 text-center mt-1">{r.count}</div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-gray-600">
                  <span>Strong Buy</span>
                  <span>Strong Sell</span>
                </div>
              </div>

              {/* Price Targets */}
              <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                <h3 className="font-semibold text-lg text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  Price Targets
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">High</span>
                    <span className="text-white font-semibold">${data.targetHigh.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Mean</span>
                    <span className="text-indigo-400 font-bold text-lg">${data.targetMean.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Low</span>
                    <span className="text-white font-semibold">${data.targetLow.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-white/5">
                    <div className={`text-center text-lg font-bold ${data.currentToTarget >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {data.currentToTarget >= 0 ? '+' : ''}{data.currentToTarget.toFixed(1)}% upside to consensus
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fundamentals Grid */}
            <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 mb-6">
              <h3 className="font-semibold text-lg text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                Fundamentals
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                <StatCard label="P/E Ratio" value={data.peRatio ? data.peRatio.toFixed(1) + 'x' : 'N/A'} />
                <StatCard label="P/B Ratio" value={data.pbRatio ? data.pbRatio.toFixed(1) + 'x' : 'N/A'} />
                <StatCard label="P/S Ratio" value={data.psRatio ? data.psRatio.toFixed(1) + 'x' : 'N/A'} />
                <StatCard label="EV/EBITDA" value={data.evToEbitda ? data.evToEbitda.toFixed(1) + 'x' : 'N/A'} />
                <StatCard label="EPS" value={data.eps ? `$${data.eps.toFixed(2)}` : 'N/A'} />
                <StatCard label="Market Cap" value={formatNumber(data.marketCap)} />
                <StatCard label="Revenue" value={formatNumber(data.revenue)} />
                <StatCard label="Net Income" value={formatNumber(data.netIncome)} />
                <StatCard label="Gross Margin" value={formatPercent(data.grossMargin)} />
                <StatCard label="Operating Margin" value={formatPercent(data.operatingMargin)} />
                <StatCard label="Net Margin" value={formatPercent(data.netMargin)} />
                <StatCard label="ROE" value={formatPercent(data.roe)} />
                <StatCard label="Revenue Growth" value={formatPercent(data.revenueGrowth)} />
                <StatCard label="Earnings Growth" value={formatPercent(data.earningsGrowth)} />
                <StatCard label="Debt/Equity" value={data.debtToEquity ? data.debtToEquity.toFixed(2) + 'x' : 'N/A'} />
                <StatCard label="Dividend Yield" value={formatPercent(data.dividendYield)} />
                <StatCard label="FCF" value={formatNumber(data.freeCashFlow)} />
                <StatCard label="FCF Yield" value={formatPercent(data.fcfYield)} />
                <StatCard label="Current Ratio" value={data.currentRatio ? data.currentRatio.toFixed(2) : 'N/A'} />
                <StatCard label="Volume" value={data.volume?.toLocaleString() || 'N/A'} sub={`Avg: ${data.avgVolume?.toLocaleString() || 'N/A'}`} />
              </div>
            </div>

            {/* Bull/Bear Case */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                <h3 className="font-semibold text-lg text-white mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  Bull Case
                </h3>
                <ul className="space-y-2">
                  {data.bullCase.map((item, i) => (
                    <li key={i} className="text-sm text-gray-300 flex gap-2">
                      <span className="text-emerald-400 mt-0.5">+</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                <h3 className="font-semibold text-lg text-white mb-3 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                  Bear Case
                </h3>
                <ul className="space-y-2">
                  {data.bearCase.map((item, i) => (
                    <li key={i} className="text-sm text-gray-300 flex gap-2">
                      <span className="text-red-400 mt-0.5">−</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Catalysts & Risks */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                <h3 className="font-semibold text-lg text-white mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Catalysts
                </h3>
                <ul className="space-y-2">
                  {data.catalysts.map((item, i) => (
                    <li key={i} className="text-sm text-gray-300 flex gap-2">
                      <span className="text-yellow-400 mt-0.5">⚡</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6">
                <h3 className="font-semibold text-lg text-white mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-400" />
                  Risks
                </h3>
                <ul className="space-y-2">
                  {data.risks.map((item, i) => (
                    <li key={i} className="text-sm text-gray-300 flex gap-2">
                      <span className="text-orange-400 mt-0.5">⚠</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* News */}
            {data.recentNews.length > 0 && (
              <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 mb-6">
                <h3 className="font-semibold text-lg text-white mb-4">Recent News</h3>
                <div className="space-y-3">
                  {data.recentNews.map((item, i) => (
                    <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
                      className="block p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                      <div className="text-sm text-white">{item.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{item.publisher} · {item.date}</div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Data source disclaimer */}
            <div className="text-center text-xs text-gray-600 mb-8">
              Prices from Yahoo Finance (real-time) · Fundamentals from {data.dataSource === 'fmp' ? 'FMP' : 'Yahoo'} · Not financial advice
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function StockResearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    }>
      <StockResearchContent />
    </Suspense>
  );
}
