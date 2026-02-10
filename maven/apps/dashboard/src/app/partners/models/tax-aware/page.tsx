'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

// Tax account types
type AccountType = 'taxable' | 'taxDeferred' | 'taxFree';

// Tax efficiency indicators
type TaxEfficiency = 'efficient' | 'acceptable' | 'avoid';

interface ProductMapping {
  ticker: string;
  name: string;
  efficiency: TaxEfficiency;
  reason?: string;
}

interface SleeveMapping {
  sleeve: string;
  taxable: ProductMapping;
  taxDeferred: ProductMapping;
  taxFree: ProductMapping;
}

// Demo model with tax-aware mappings
const TAX_AWARE_MODELS = [
  {
    id: '1',
    name: 'Moderate Growth - Tax Optimized',
    description: 'Balanced growth with smart asset location',
    sleeves: [
      {
        sleeve: 'US Large Cap',
        weight: 30,
        taxable: { ticker: 'VTI', name: 'Vanguard Total Stock Market ETF', efficiency: 'efficient' as TaxEfficiency, reason: 'Low turnover, tax-efficient index fund' },
        taxDeferred: { ticker: 'SCHD', name: 'Schwab US Dividend Equity ETF', efficiency: 'efficient' as TaxEfficiency, reason: 'Dividends sheltered from taxes' },
        taxFree: { ticker: 'QQQ', name: 'Invesco QQQ Trust', efficiency: 'efficient' as TaxEfficiency, reason: 'High growth potential, tax-free forever' },
      },
      {
        sleeve: 'International',
        weight: 15,
        taxable: { ticker: 'VXUS', name: 'Vanguard Total Intl Stock ETF', efficiency: 'efficient' as TaxEfficiency, reason: 'Foreign tax credit eligible' },
        taxDeferred: { ticker: 'VWILX', name: 'Vanguard Intl Growth Fund', efficiency: 'acceptable' as TaxEfficiency, reason: 'Active fund OK in tax-deferred' },
        taxFree: { ticker: 'EEM', name: 'iShares MSCI Emerging Markets', efficiency: 'efficient' as TaxEfficiency, reason: 'High growth EM exposure' },
      },
      {
        sleeve: 'Bonds',
        weight: 30,
        taxable: { ticker: 'VTEB', name: 'Vanguard Tax-Exempt Bond ETF', efficiency: 'efficient' as TaxEfficiency, reason: 'Municipal bonds - tax-free income' },
        taxDeferred: { ticker: 'BND', name: 'Vanguard Total Bond Market ETF', efficiency: 'efficient' as TaxEfficiency, reason: 'Interest income sheltered' },
        taxFree: { ticker: 'HYG', name: 'iShares iBoxx High Yield Corp Bond', efficiency: 'acceptable' as TaxEfficiency, reason: 'Higher yield, tax-free growth' },
      },
      {
        sleeve: 'REITs',
        weight: 10,
        taxable: { ticker: '--', name: 'Avoid in Taxable', efficiency: 'avoid' as TaxEfficiency, reason: 'REIT dividends taxed as ordinary income' },
        taxDeferred: { ticker: 'VNQ', name: 'Vanguard Real Estate ETF', efficiency: 'efficient' as TaxEfficiency, reason: 'High dividends sheltered' },
        taxFree: { ticker: 'VNQ', name: 'Vanguard Real Estate ETF', efficiency: 'efficient' as TaxEfficiency, reason: 'Tax-free dividends forever' },
      },
      {
        sleeve: 'US Small Cap',
        weight: 10,
        taxable: { ticker: 'VB', name: 'Vanguard Small-Cap ETF', efficiency: 'acceptable' as TaxEfficiency, reason: 'Index fund, but higher turnover' },
        taxDeferred: { ticker: 'VSMAX', name: 'Vanguard Small-Cap Index Admiral', efficiency: 'efficient' as TaxEfficiency, reason: 'Active management OK here' },
        taxFree: { ticker: 'VBK', name: 'Vanguard Small-Cap Growth ETF', efficiency: 'efficient' as TaxEfficiency, reason: 'Max growth in Roth' },
      },
      {
        sleeve: 'Cash',
        weight: 5,
        taxable: { ticker: 'VMFXX', name: 'Vanguard Federal Money Market', efficiency: 'acceptable' as TaxEfficiency, reason: 'Interest taxed, but minimal' },
        taxDeferred: { ticker: 'VMFXX', name: 'Vanguard Federal Money Market', efficiency: 'efficient' as TaxEfficiency, reason: 'Interest sheltered' },
        taxFree: { ticker: 'VMFXX', name: 'Vanguard Federal Money Market', efficiency: 'efficient' as TaxEfficiency, reason: 'N/A - minimal allocation' },
      },
    ],
  },
];

// Demo clients for assignment
const DEMO_CLIENTS = [
  {
    id: '1',
    name: 'Robert & Linda Chen',
    accounts: [
      { type: 'taxable' as AccountType, name: 'Joint Brokerage', value: 450000 },
      { type: 'taxDeferred' as AccountType, name: 'Robert Traditional IRA', value: 350000 },
      { type: 'taxDeferred' as AccountType, name: 'Linda 401(k)', value: 280000 },
      { type: 'taxFree' as AccountType, name: 'Robert Roth IRA', value: 120000 },
      { type: 'taxFree' as AccountType, name: 'Linda Roth IRA', value: 50000 },
    ],
  },
  {
    id: '2',
    name: 'The Morrison Family Trust',
    accounts: [
      { type: 'taxable' as AccountType, name: 'Family Trust', value: 650000 },
      { type: 'taxDeferred' as AccountType, name: 'James Traditional IRA', value: 180000 },
      { type: 'taxFree' as AccountType, name: 'James Roth IRA', value: 60000 },
    ],
  },
  {
    id: '3',
    name: 'Jennifer Walsh',
    accounts: [
      { type: 'taxable' as AccountType, name: 'Individual Brokerage', value: 225000 },
      { type: 'taxDeferred' as AccountType, name: '401(k)', value: 380000 },
      { type: 'taxFree' as AccountType, name: 'Roth IRA', value: 70000 },
    ],
  },
];

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

function EfficiencyIndicator({ efficiency, reason }: { efficiency: TaxEfficiency; reason?: string }) {
  const config = {
    efficient: { icon: '✓', color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Tax-efficient' },
    acceptable: { icon: '⚠️', color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Acceptable' },
    avoid: { icon: '✗', color: 'text-red-400', bg: 'bg-red-500/20', label: 'Avoid' },
  };

  const c = config[efficiency];

  return (
    <div className="group relative inline-flex">
      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${c.bg} ${c.color} text-sm font-bold`}>
        {c.icon}
      </span>
      {reason && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
          <div className="px-3 py-2 bg-gray-900 border border-white/20 rounded-lg text-white text-xs whitespace-nowrap max-w-[250px] text-wrap">
            <div className={`font-medium mb-1 ${c.color}`}>{c.label}</div>
            {reason}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

export default function TaxAwarePage() {
  const [selectedModel, setSelectedModel] = useState(TAX_AWARE_MODELS[0]);
  const [editMode, setEditMode] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [showExplainer, setShowExplainer] = useState(true);

  // Calculate tax efficiency score
  const taxEfficiencyScore = useMemo(() => {
    let score = 0;
    let total = 0;

    selectedModel.sleeves.forEach((sleeve) => {
      const weight = sleeve.weight / 100;
      
      // Score each account type
      ['taxable', 'taxDeferred', 'taxFree'].forEach((accountType) => {
        const mapping = sleeve[accountType as keyof SleeveMapping] as ProductMapping;
        const efficiencyScore = mapping.efficiency === 'efficient' ? 1 : mapping.efficiency === 'acceptable' ? 0.7 : 0.3;
        score += efficiencyScore * weight;
        total += weight;
      });
    });

    return Math.round((score / total) * 100);
  }, [selectedModel]);

  // Calculate preview for selected client
  const clientPreview = useMemo(() => {
    if (!selectedClient) return null;
    
    const client = DEMO_CLIENTS.find((c) => c.id === selectedClient);
    if (!client) return null;

    const totalValue = client.accounts.reduce((sum, a) => sum + a.value, 0);
    
    // Group accounts by type
    const accountsByType = {
      taxable: client.accounts.filter((a) => a.type === 'taxable'),
      taxDeferred: client.accounts.filter((a) => a.type === 'taxDeferred'),
      taxFree: client.accounts.filter((a) => a.type === 'taxFree'),
    };

    // Calculate target allocations per account
    const preview: Array<{
      accountName: string;
      accountType: AccountType;
      accountValue: number;
      holdings: Array<{ sleeve: string; ticker: string; name: string; value: number; efficiency: TaxEfficiency }>;
    }> = [];

    Object.entries(accountsByType).forEach(([type, accounts]) => {
      const typeValue = accounts.reduce((sum, a) => sum + a.value, 0);
      
      accounts.forEach((account) => {
        const accountPct = account.value / typeValue; // Distribute model within account type
        
        const holdings = selectedModel.sleeves.map((sleeve) => {
          const mapping = sleeve[type as keyof SleeveMapping] as ProductMapping;
          // Skip avoided allocations
          if (mapping.efficiency === 'avoid') {
            return null;
          }
          const targetValue = (sleeve.weight / 100) * totalValue * (typeValue / totalValue) * accountPct;
          return {
            sleeve: sleeve.sleeve,
            ticker: mapping.ticker,
            name: mapping.name,
            value: targetValue,
            efficiency: mapping.efficiency,
          };
        }).filter(Boolean) as Array<{ sleeve: string; ticker: string; name: string; value: number; efficiency: TaxEfficiency }>;

        preview.push({
          accountName: account.name,
          accountType: type as AccountType,
          accountValue: account.value,
          holdings,
        });
      });
    });

    return { client, totalValue, preview };
  }, [selectedClient, selectedModel]);

  return (
    <div className="p-4 md:p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-4 md:mb-6 overflow-x-auto">
        <Link href="/partners/models" className="text-gray-400 hover:text-white whitespace-nowrap min-h-[48px] flex items-center">
          Models
        </Link>
        <span className="text-gray-600">/</span>
        <span className="text-amber-500 whitespace-nowrap">Tax-Aware Settings</span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Tax-Aware Product Selection</h1>
          <p className="text-gray-400">
            Configure which products to use in each account type for optimal after-tax returns
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-4 py-3 rounded-xl transition-colors min-h-[48px] flex items-center justify-center gap-2 ${
              editMode
                ? 'bg-amber-600 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <span>{editMode ? '💾' : '✏️'}</span>
            <span>{editMode ? 'Save Changes' : 'Edit Mappings'}</span>
          </button>
          <button
            onClick={() => setShowApplyModal(true)}
            className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors font-medium min-h-[48px] flex items-center justify-center gap-2"
          >
            <span>👤</span>
            <span>Apply to Client</span>
          </button>
        </div>
      </div>

      {/* Tax Efficiency Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 md:mb-8">
        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Tax Efficiency Score</div>
              <div className="text-3xl font-bold text-amber-400">{taxEfficiencyScore}%</div>
            </div>
          </div>
          <div className="h-2 bg-white/10 rounded-full mt-3">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all"
              style={{ width: `${taxEfficiencyScore}%` }}
            />
          </div>
        </div>

        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
          <div className="text-gray-400 text-sm mb-2">Model</div>
          <div className="text-white font-semibold text-lg">{selectedModel.name}</div>
          <div className="text-gray-500 text-sm mt-1">{selectedModel.description}</div>
        </div>

        <div className="bg-[#12121a] border border-white/10 rounded-2xl p-4 md:p-6">
          <div className="text-gray-400 text-sm mb-3">Legend</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <EfficiencyIndicator efficiency="efficient" />
              <span className="text-gray-300 text-sm">Tax-efficient choice</span>
            </div>
            <div className="flex items-center gap-2">
              <EfficiencyIndicator efficiency="acceptable" />
              <span className="text-gray-300 text-sm">Acceptable</span>
            </div>
            <div className="flex items-center gap-2">
              <EfficiencyIndicator efficiency="avoid" />
              <span className="text-gray-300 text-sm">Avoid (with explanation)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Why This Matters Explainer */}
      {showExplainer && (
        <div className="mb-6 md:mb-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-4 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-xl">💡</span>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-3">Why Tax Location Matters</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-white/5 rounded-xl">
                    <div className="text-amber-400 font-medium mb-1">💰 Taxable Accounts</div>
                    <p className="text-gray-400">
                      Avoid high turnover funds and dividend payers. Interest and dividends taxed annually.
                      Use tax-efficient index funds and municipal bonds.
                    </p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl">
                    <div className="text-blue-400 font-medium mb-1">🏦 Tax-Deferred (IRA/401k)</div>
                    <p className="text-gray-400">
                      Dividends and gains deferred until withdrawal. Put tax-inefficient assets here:
                      REITs, high-yield bonds, active funds.
                    </p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl">
                    <div className="text-emerald-400 font-medium mb-1">🌱 Tax-Free (Roth)</div>
                    <p className="text-gray-400">
                      Growth is tax-free forever! Put highest expected growth assets here:
                      growth stocks, emerging markets, aggressive allocations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowExplainer(false)}
              className="text-gray-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {!showExplainer && (
        <button
          onClick={() => setShowExplainer(true)}
          className="mb-6 text-blue-400 hover:text-blue-300 text-sm flex items-center gap-2"
        >
          <span>💡</span>
          <span>Show: Why Tax Location Matters</span>
        </button>
      )}

      {/* Product Mapping Table */}
      <div className="bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 md:p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Product Mapping by Account Type</h2>
          <p className="text-gray-400 text-sm mt-1">
            Hover over indicators for placement rationale
          </p>
        </div>

        {/* Mobile: Card layout */}
        <div className="md:hidden p-4 space-y-4">
          {selectedModel.sleeves.map((sleeve) => (
            <div key={sleeve.sleeve} className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-white font-medium">{sleeve.sleeve}</div>
                <div className="text-amber-400 text-sm">{sleeve.weight}%</div>
              </div>
              
              <div className="space-y-3">
                {/* Taxable */}
                <div className="p-3 bg-amber-500/5 rounded-lg border border-amber-500/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-amber-400 text-xs font-medium">TAXABLE</span>
                    <EfficiencyIndicator efficiency={sleeve.taxable.efficiency} reason={sleeve.taxable.reason} />
                  </div>
                  <div className="text-white font-medium">{sleeve.taxable.ticker}</div>
                  <div className="text-gray-500 text-xs truncate">{sleeve.taxable.name}</div>
                </div>

                {/* Tax-Deferred */}
                <div className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-blue-400 text-xs font-medium">TAX-DEFERRED</span>
                    <EfficiencyIndicator efficiency={sleeve.taxDeferred.efficiency} reason={sleeve.taxDeferred.reason} />
                  </div>
                  <div className="text-white font-medium">{sleeve.taxDeferred.ticker}</div>
                  <div className="text-gray-500 text-xs truncate">{sleeve.taxDeferred.name}</div>
                </div>

                {/* Roth */}
                <div className="p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-emerald-400 text-xs font-medium">ROTH</span>
                    <EfficiencyIndicator efficiency={sleeve.taxFree.efficiency} reason={sleeve.taxFree.reason} />
                  </div>
                  <div className="text-white font-medium">{sleeve.taxFree.ticker}</div>
                  <div className="text-gray-500 text-xs truncate">{sleeve.taxFree.name}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Table layout */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 text-sm border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 font-medium">Sleeve</th>
                <th className="px-6 py-4 font-medium text-center">Weight</th>
                <th className="px-6 py-4 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-amber-500 rounded-full" />
                    Taxable
                  </div>
                </th>
                <th className="px-6 py-4 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-500 rounded-full" />
                    Tax-Deferred (IRA/401k)
                  </div>
                </th>
                <th className="px-6 py-4 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full" />
                    Roth (Tax-Free)
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {selectedModel.sleeves.map((sleeve, idx) => (
                <tr key={sleeve.sleeve} className={`border-b border-white/5 ${idx % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">{sleeve.sleeve}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 bg-white/10 rounded text-white text-sm">{sleeve.weight}%</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <EfficiencyIndicator efficiency={sleeve.taxable.efficiency} reason={sleeve.taxable.reason} />
                      <div>
                        <div className={`font-medium ${sleeve.taxable.ticker === '--' ? 'text-gray-500' : 'text-white'}`}>
                          {sleeve.taxable.ticker}
                        </div>
                        <div className="text-gray-500 text-xs">{sleeve.taxable.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <EfficiencyIndicator efficiency={sleeve.taxDeferred.efficiency} reason={sleeve.taxDeferred.reason} />
                      <div>
                        <div className="text-white font-medium">{sleeve.taxDeferred.ticker}</div>
                        <div className="text-gray-500 text-xs">{sleeve.taxDeferred.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <EfficiencyIndicator efficiency={sleeve.taxFree.efficiency} reason={sleeve.taxFree.reason} />
                      <div>
                        <div className="text-white font-medium">{sleeve.taxFree.ticker}</div>
                        <div className="text-gray-500 text-xs">{sleeve.taxFree.name}</div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply to Client Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/80 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
          <div className="bg-[#12121a] border-t md:border border-white/10 rounded-t-2xl md:rounded-2xl w-full md:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white">Apply Tax-Aware Model to Client</h2>
                  <p className="text-gray-400 text-sm mt-1">Select a client to preview and apply the model</p>
                </div>
                <button
                  onClick={() => {
                    setShowApplyModal(false);
                    setSelectedClient(null);
                  }}
                  className="text-gray-400 hover:text-white min-w-[48px] min-h-[48px] flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Client Selection */}
              <div className="mb-6">
                <label className="text-gray-400 text-sm mb-3 block">Select Client</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {DEMO_CLIENTS.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => setSelectedClient(client.id)}
                      className={`p-4 rounded-xl text-left transition-all min-h-[80px] ${
                        selectedClient === client.id
                          ? 'bg-amber-500/20 border-2 border-amber-500/50'
                          : 'bg-white/5 border border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="text-white font-medium mb-1">{client.name}</div>
                      <div className="text-gray-400 text-sm">
                        {client.accounts.length} accounts • {formatCurrency(client.accounts.reduce((s, a) => s + a.value, 0))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {clientPreview && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold">Preview: {clientPreview.client.name}</h3>
                    <div className="text-gray-400 text-sm">Total: {formatCurrency(clientPreview.totalValue)}</div>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <span className="text-amber-400 text-xl">💡</span>
                      <div className="text-amber-400 text-sm">
                        The system will automatically assign the optimal product for each sleeve based on account type.
                        REITs will be excluded from taxable accounts and allocated to tax-advantaged accounts instead.
                      </div>
                    </div>
                  </div>

                  {/* Account Previews */}
                  <div className="space-y-4">
                    {clientPreview.preview.map((account, idx) => {
                      const accountTypeConfig = {
                        taxable: { color: 'amber', label: 'Taxable' },
                        taxDeferred: { color: 'blue', label: 'Tax-Deferred' },
                        taxFree: { color: 'emerald', label: 'Roth' },
                      };
                      const config = accountTypeConfig[account.accountType];

                      return (
                        <div key={idx} className={`bg-${config.color}-500/5 border border-${config.color}-500/20 rounded-xl p-4`}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 bg-${config.color}-500/20 text-${config.color}-400 rounded text-xs font-medium`}>
                                {config.label}
                              </span>
                              <span className="text-white font-medium">{account.accountName}</span>
                            </div>
                            <span className="text-gray-400">{formatCurrency(account.accountValue)}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {account.holdings.map((holding) => (
                              <div key={holding.sleeve} className="p-2 bg-white/5 rounded-lg">
                                <div className="flex items-center gap-1 mb-1">
                                  <EfficiencyIndicator efficiency={holding.efficiency} />
                                  <span className="text-white text-sm font-medium">{holding.ticker}</span>
                                </div>
                                <div className="text-gray-500 text-xs">{holding.sleeve}</div>
                                <div className="text-gray-400 text-xs">{formatCurrency(holding.value)}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {!selectedClient && (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-3">👆</div>
                  <div>Select a client above to preview the model application</div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 flex-shrink-0">
              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowApplyModal(false);
                    setSelectedClient(null);
                  }}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors min-h-[48px]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // In production, this would apply the model
                    alert(`Model applied to ${clientPreview?.client.name}!`);
                    setShowApplyModal(false);
                    setSelectedClient(null);
                  }}
                  disabled={!selectedClient}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-medium min-h-[48px]"
                >
                  Apply Tax-Aware Model
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
