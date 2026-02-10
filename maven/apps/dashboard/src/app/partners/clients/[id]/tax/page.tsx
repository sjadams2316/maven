'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Demo client data - in production, fetch based on ID
const DEMO_CLIENT = {
  id: '1',
  name: 'Robert & Linda Chen',
  aum: 1250000,
  taxRate: 37.75, // Combined federal + state
  traditionalIRA: 350000,
};

// Holdings with unrealized losses for tax-loss harvesting
const TAX_LOSS_OPPORTUNITIES = [
  {
    ticker: 'VXUS',
    name: 'Vanguard Total International Stock',
    shares: 425,
    costBasis: 195700,
    currentValue: 187500,
    unrealizedLoss: -8200,
    replacement: 'IXUS',
    replacementName: 'iShares Core MSCI Total Intl Stock',
  },
  {
    ticker: 'IEMG',
    name: 'iShares Core MSCI Emerging Markets',
    shares: 180,
    costBasis: 9360,
    currentValue: 8100,
    unrealizedLoss: -1260,
    replacement: 'VWO',
    replacementName: 'Vanguard FTSE Emerging Markets',
  },
];

// Capital gains lots
const CAPITAL_GAINS = {
  shortTerm: {
    realized: 4200,
    unrealized: 12800,
  },
  longTerm: {
    realized: 18500,
    unrealized: 67000,
  },
  upcomingLongTerm: [
    { ticker: 'AAPL', shares: 50, gain: 8200, daysRemaining: 23 },
    { ticker: 'MSFT', shares: 30, gain: 5400, daysRemaining: 45 },
  ],
};

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  return `$${value.toLocaleString()}`;
}

export default function TaxPlanningPage() {
  const params = useParams();
  const [rothConversionAmount, setRothConversionAmount] = useState(50000);
  const [selectedHarvest, setSelectedHarvest] = useState<string[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);

  // Calculate total harvestable losses
  const totalHarvestableLoss = useMemo(() => {
    return TAX_LOSS_OPPORTUNITIES.filter(h => selectedHarvest.includes(h.ticker))
      .reduce((sum, h) => sum + Math.abs(h.unrealizedLoss), 0);
  }, [selectedHarvest]);

  // Calculate tax savings from harvesting
  const taxSavings = useMemo(() => {
    return totalHarvestableLoss * (DEMO_CLIENT.taxRate / 100);
  }, [totalHarvestableLoss]);

  // Roth conversion tax impact
  const rothTaxImpact = useMemo(() => {
    return rothConversionAmount * (DEMO_CLIENT.taxRate / 100);
  }, [rothConversionAmount]);

  // Multi-year Roth projection
  const rothProjection = useMemo(() => {
    const years = [1, 5, 10, 20];
    const growthRate = 0.07;
    return years.map(year => ({
      year,
      traditionalValue: rothConversionAmount * Math.pow(1 + growthRate, year) * (1 - DEMO_CLIENT.taxRate / 100),
      rothValue: (rothConversionAmount - rothTaxImpact) * Math.pow(1 + growthRate, year),
    }));
  }, [rothConversionAmount, rothTaxImpact]);

  const toggleHarvest = (ticker: string) => {
    setSelectedHarvest(prev =>
      prev.includes(ticker)
        ? prev.filter(t => t !== ticker)
        : [...prev, ticker]
    );
  };

  const selectAllHarvest = () => {
    setSelectedHarvest(TAX_LOSS_OPPORTUNITIES.map(h => h.ticker));
  };

  // Calculate estimated tax liability
  const estimatedTaxLiability = useMemo(() => {
    const shortTermTax = CAPITAL_GAINS.shortTerm.realized * (DEMO_CLIENT.taxRate / 100);
    const longTermTax = CAPITAL_GAINS.longTerm.realized * 0.20; // Long-term capital gains rate
    return shortTermTax + longTermTax;
  }, []);

  return (
    <div className="p-4 md:p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-4 md:mb-6 overflow-x-auto">
        <Link href="/partners/clients" className="text-gray-400 hover:text-white whitespace-nowrap min-h-[48px] flex items-center">
          Clients
        </Link>
        <span className="text-gray-600">/</span>
        <Link href={`/partners/clients/${params.id}`} className="text-gray-400 hover:text-white whitespace-nowrap min-h-[48px] flex items-center">
          {DEMO_CLIENT.name}
        </Link>
        <span className="text-gray-600">/</span>
        <span className="text-amber-500 whitespace-nowrap">Tax Planning</span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Tax Planning</h1>
          <p className="text-gray-400">
            Analyzing tax opportunities for <span className="text-amber-400">{DEMO_CLIENT.name}</span> •{' '}
            {formatCurrency(DEMO_CLIENT.aum)} AUM
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
          <button
            onClick={() => setShowShareModal(true)}
            className="px-4 py-3 md:py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors min-h-[48px] flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <span>📤</span>
            <span>Share with Client</span>
          </button>
          <button className="px-4 py-3 md:py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors font-medium min-h-[48px] flex items-center justify-center gap-2 text-sm md:text-base">
            <span>📄</span>
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Tax Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-3 md:p-4">
          <div className="text-gray-400 text-xs md:text-sm">Combined Tax Rate</div>
          <div className="text-lg md:text-2xl font-bold text-white">{DEMO_CLIENT.taxRate}%</div>
          <div className="text-gray-500 text-xs">Federal + State</div>
        </div>
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-3 md:p-4">
          <div className="text-gray-400 text-xs md:text-sm">Harvestable Losses</div>
          <div className="text-lg md:text-2xl font-bold text-emerald-400">
            {formatCurrency(TAX_LOSS_OPPORTUNITIES.reduce((sum, h) => sum + Math.abs(h.unrealizedLoss), 0))}
          </div>
          <div className="text-gray-500 text-xs">{TAX_LOSS_OPPORTUNITIES.length} opportunities</div>
        </div>
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-3 md:p-4">
          <div className="text-gray-400 text-xs md:text-sm">Traditional IRA</div>
          <div className="text-lg md:text-2xl font-bold text-white">{formatCurrency(DEMO_CLIENT.traditionalIRA)}</div>
          <div className="text-gray-500 text-xs">Conversion eligible</div>
        </div>
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-3 md:p-4">
          <div className="text-gray-400 text-xs md:text-sm">Est. Tax Liability</div>
          <div className="text-lg md:text-2xl font-bold text-amber-400">{formatCurrency(estimatedTaxLiability)}</div>
          <div className="text-gray-500 text-xs">Current year</div>
        </div>
      </div>

      <div className="space-y-6 md:space-y-8">
        {/* Tax-Loss Harvesting Section */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
                <span>🌾</span>
                Tax-Loss Harvesting
              </h2>
              <p className="text-gray-400 text-sm mt-1">Sell holdings with losses to offset gains</p>
            </div>
            <button
              onClick={selectAllHarvest}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors min-h-[48px] text-sm"
            >
              Select All
            </button>
          </div>

          {/* Mobile: Card layout */}
          <div className="md:hidden space-y-3 mb-4">
            {TAX_LOSS_OPPORTUNITIES.map((holding) => (
              <div
                key={holding.ticker}
                className={`p-4 rounded-xl border transition-all ${
                  selectedHarvest.includes(holding.ticker)
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-white font-medium">{holding.ticker}</div>
                    <div className="text-gray-500 text-xs">{holding.name}</div>
                  </div>
                  <div className="text-emerald-400 font-bold">
                    {formatCurrency(holding.unrealizedLoss)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <div className="text-gray-500">Cost Basis</div>
                    <div className="text-white">{formatCurrency(holding.costBasis)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Current Value</div>
                    <div className="text-white">{formatCurrency(holding.currentValue)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg mb-3">
                  <span className="text-gray-400 text-xs">Replace with:</span>
                  <span className="text-amber-400 font-medium text-sm">{holding.replacement}</span>
                </div>

                <button
                  onClick={() => toggleHarvest(holding.ticker)}
                  className={`w-full py-3 rounded-lg font-medium transition-colors min-h-[48px] ${
                    selectedHarvest.includes(holding.ticker)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {selectedHarvest.includes(holding.ticker) ? '✓ Selected' : 'Select to Harvest'}
                </button>
              </div>
            ))}
          </div>

          {/* Desktop: Table layout */}
          <div className="hidden md:block overflow-x-auto mb-4">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 text-sm border-b border-white/10">
                  <th className="pb-4 font-medium">Holding</th>
                  <th className="pb-4 font-medium text-right">Shares</th>
                  <th className="pb-4 font-medium text-right">Cost Basis</th>
                  <th className="pb-4 font-medium text-right">Current Value</th>
                  <th className="pb-4 font-medium text-right">Unrealized Loss</th>
                  <th className="pb-4 font-medium">Replacement</th>
                  <th className="pb-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {TAX_LOSS_OPPORTUNITIES.map((holding) => (
                  <tr key={holding.ticker} className="border-b border-white/5">
                    <td className="py-4">
                      <div className="text-white font-medium">{holding.ticker}</div>
                      <div className="text-gray-500 text-sm">{holding.name}</div>
                    </td>
                    <td className="py-4 text-right text-gray-300">{holding.shares}</td>
                    <td className="py-4 text-right text-gray-300">{formatCurrency(holding.costBasis)}</td>
                    <td className="py-4 text-right text-gray-300">{formatCurrency(holding.currentValue)}</td>
                    <td className="py-4 text-right text-emerald-400 font-medium">
                      {formatCurrency(holding.unrealizedLoss)}
                    </td>
                    <td className="py-4">
                      <div className="text-amber-400 font-medium">{holding.replacement}</div>
                      <div className="text-gray-500 text-xs">{holding.replacementName}</div>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => toggleHarvest(holding.ticker)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors min-h-[48px] ${
                          selectedHarvest.includes(holding.ticker)
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        {selectedHarvest.includes(holding.ticker) ? '✓ Selected' : 'Harvest'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary when items selected */}
          {selectedHarvest.length > 0 && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-emerald-400 font-medium mb-1">
                    {selectedHarvest.length} holding{selectedHarvest.length > 1 ? 's' : ''} selected for harvesting
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Total Loss: </span>
                      <span className="text-white font-medium">{formatCurrency(-totalHarvestableLoss)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Tax Savings: </span>
                      <span className="text-emerald-400 font-bold">{formatCurrency(taxSavings)}</span>
                    </div>
                  </div>
                </div>
                <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors min-h-[48px]">
                  Execute Harvest
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Roth Conversion Analysis */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
          <div className="mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
              <span>🔄</span>
              Roth Conversion Analysis
            </h2>
            <p className="text-gray-400 text-sm mt-1">Evaluate converting Traditional IRA to Roth IRA</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Conversion Calculator */}
            <div className="space-y-6">
              <div className="p-4 bg-white/5 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Traditional IRA Balance</span>
                  <span className="text-white font-medium">{formatCurrency(DEMO_CLIENT.traditionalIRA)}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-gray-300 text-sm">Conversion Amount</label>
                  <span className="text-amber-400 font-bold text-lg">{formatCurrency(rothConversionAmount)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={DEMO_CLIENT.traditionalIRA}
                  step={5000}
                  value={rothConversionAmount}
                  onChange={(e) => setRothConversionAmount(Number(e.target.value))}
                  className="w-full h-3 bg-white/10 rounded-full appearance-none cursor-pointer accent-amber-500"
                  style={{
                    background: `linear-gradient(to right, #d97706 0%, #d97706 ${(rothConversionAmount / DEMO_CLIENT.traditionalIRA) * 100}%, rgba(255,255,255,0.1) ${(rothConversionAmount / DEMO_CLIENT.traditionalIRA) * 100}%, rgba(255,255,255,0.1) 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>$0</span>
                  <span>{formatCurrency(DEMO_CLIENT.traditionalIRA)}</span>
                </div>
              </div>

              {/* Tax Impact */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <div className="text-amber-400 text-sm font-medium mb-3">Tax Impact of Conversion</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-400 text-xs">Tax Due</div>
                    <div className="text-white font-bold text-lg">{formatCurrency(rothTaxImpact)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">After-Tax Amount</div>
                    <div className="text-emerald-400 font-bold text-lg">{formatCurrency(rothConversionAmount - rothTaxImpact)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Multi-Year Strategy View */}
            <div>
              <div className="text-gray-300 text-sm font-medium mb-4">Growth Comparison (7% annual return)</div>
              <div className="space-y-3">
                {rothProjection.map(({ year, traditionalValue, rothValue }) => {
                  const rothAdvantage = rothValue - traditionalValue;
                  return (
                    <div key={year} className="p-3 bg-white/5 rounded-xl">
                      <div className="text-gray-400 text-xs mb-2">Year {year}</div>
                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <div>
                          <div className="text-gray-500 text-xs">Traditional (after tax)</div>
                          <div className="text-white font-medium">{formatCurrency(traditionalValue)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-xs">Roth (tax-free)</div>
                          <div className="text-emerald-400 font-medium">{formatCurrency(rothValue)}</div>
                        </div>
                      </div>
                      <div className={`text-xs ${rothAdvantage > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        Roth advantage: {rothAdvantage > 0 ? '+' : ''}{formatCurrency(rothAdvantage)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <div className="flex items-start gap-2">
                  <span className="text-blue-400">💡</span>
                  <p className="text-blue-300 text-xs">
                    Roth conversions are most beneficial when you expect higher tax rates in retirement 
                    or want tax-free growth for heirs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Capital Gains Summary */}
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
          <div className="mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
              <span>📈</span>
              Capital Gains Summary
            </h2>
            <p className="text-gray-400 text-sm mt-1">Track realized and unrealized gains</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Short-Term */}
            <div className="p-4 bg-white/5 rounded-xl border-l-4 border-red-500">
              <div className="text-gray-400 text-sm mb-3">Short-Term ({"<"} 1 year)</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Realized Gains</span>
                  <span className="text-white font-medium">{formatCurrency(CAPITAL_GAINS.shortTerm.realized)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Unrealized Gains</span>
                  <span className="text-gray-400">{formatCurrency(CAPITAL_GAINS.shortTerm.unrealized)}</span>
                </div>
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Tax Rate</span>
                  <span className="text-red-400 font-medium">{DEMO_CLIENT.taxRate}% (Ordinary Income)</span>
                </div>
              </div>
            </div>

            {/* Long-Term */}
            <div className="p-4 bg-white/5 rounded-xl border-l-4 border-emerald-500">
              <div className="text-gray-400 text-sm mb-3">Long-Term ({">"} 1 year)</div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Realized Gains</span>
                  <span className="text-white font-medium">{formatCurrency(CAPITAL_GAINS.longTerm.realized)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Unrealized Gains</span>
                  <span className="text-gray-400">{formatCurrency(CAPITAL_GAINS.longTerm.unrealized)}</span>
                </div>
                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Tax Rate</span>
                  <span className="text-emerald-400 font-medium">20% (LTCG Rate)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Long-Term */}
          <div>
            <div className="text-gray-300 text-sm font-medium mb-3">🕐 Lots Approaching Long-Term Status</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CAPITAL_GAINS.upcomingLongTerm.map((lot) => (
                <div key={lot.ticker} className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{lot.ticker}</span>
                    <span className="text-amber-400 text-sm">{lot.daysRemaining} days</span>
                  </div>
                  <div className="text-gray-400 text-sm mb-1">{lot.shares} shares</div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-xs">Unrealized Gain</span>
                    <span className="text-emerald-400 font-medium">+{formatCurrency(lot.gain)}</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-amber-500/20">
                    <div className="text-xs text-gray-400">
                      Potential tax savings if held: <span className="text-emerald-400 font-medium">{formatCurrency(lot.gain * (DEMO_CLIENT.taxRate - 20) / 100)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estimated Tax Liability Summary */}
          <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-gray-400 text-sm mb-1">Estimated Tax Liability (Current Year)</div>
                <div className="text-2xl font-bold text-white">{formatCurrency(estimatedTaxLiability)}</div>
              </div>
              <div className="text-right">
                <div className="text-gray-400 text-sm mb-1">After Harvesting</div>
                <div className="text-2xl font-bold text-emerald-400">{formatCurrency(Math.max(0, estimatedTaxLiability - taxSavings))}</div>
                {taxSavings > 0 && (
                  <div className="text-emerald-400 text-sm">Save {formatCurrency(taxSavings)}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/80 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
          <div className="bg-[#12121a] border-t md:border border-white/10 rounded-t-2xl md:rounded-2xl p-6 w-full md:max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Share with Client</h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-white min-w-[48px] min-h-[48px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    id="share-harvesting"
                    defaultChecked
                    className="w-5 h-5 accent-amber-500"
                  />
                  <label htmlFor="share-harvesting" className="text-white">Tax-Loss Harvesting Analysis</label>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    id="share-roth"
                    defaultChecked
                    className="w-5 h-5 accent-amber-500"
                  />
                  <label htmlFor="share-roth" className="text-white">Roth Conversion Projections</label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="share-gains"
                    defaultChecked
                    className="w-5 h-5 accent-amber-500"
                  />
                  <label htmlFor="share-gains" className="text-white">Capital Gains Summary</label>
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Add a Note (Optional)</label>
                <textarea
                  placeholder="Hi Robert & Linda, I've prepared a tax planning analysis for your review..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 resize-none min-h-[100px]"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors min-h-[48px]"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-colors font-medium min-h-[48px]"
              >
                Share Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
