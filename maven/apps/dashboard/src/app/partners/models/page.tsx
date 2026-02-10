'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

// Types
interface Holding {
  ticker: string;
  weight: number;
}

interface Sleeve {
  id: string;
  name: string;
  assetClass: string;
  holdings: Holding[];
}

interface SleeveAllocation {
  sleeveId: string;
  weight: number;
}

interface Model {
  id: string;
  name: string;
  riskLevel: number;
  sleeveAllocations: SleeveAllocation[];
  createdAt: string;
}

// Demo clients for "Apply to Client" dropdown
const DEMO_CLIENTS = [
  { id: '1', name: 'Robert & Linda Chen' },
  { id: '2', name: 'The Morrison Family Trust' },
  { id: '3', name: 'Jennifer Walsh' },
  { id: '4', name: 'Michael Thompson' },
  { id: '5', name: 'Sarah & David Park' },
];

// Demo sleeves
const INITIAL_SLEEVES: Sleeve[] = [
  { id: 's1', name: 'US Large Cap Core', assetClass: 'Equity', holdings: [{ ticker: 'VTI', weight: 60 }, { ticker: 'VOO', weight: 40 }] },
  { id: 's2', name: 'US Small Cap', assetClass: 'Equity', holdings: [{ ticker: 'VB', weight: 50 }, { ticker: 'IJR', weight: 50 }] },
  { id: 's3', name: 'International Developed', assetClass: 'Equity', holdings: [{ ticker: 'VXUS', weight: 70 }, { ticker: 'IXUS', weight: 30 }] },
  { id: 's4', name: 'Emerging Markets', assetClass: 'Equity', holdings: [{ ticker: 'VWO', weight: 50 }, { ticker: 'IEMG', weight: 50 }] },
  { id: 's5', name: 'US Bonds', assetClass: 'Fixed Income', holdings: [{ ticker: 'BND', weight: 60 }, { ticker: 'AGG', weight: 40 }] },
  { id: 's6', name: 'Municipal Bonds', assetClass: 'Fixed Income', holdings: [{ ticker: 'VTEB', weight: 50 }, { ticker: 'MUB', weight: 50 }] },
  { id: 's7', name: 'REITs', assetClass: 'Real Estate', holdings: [{ ticker: 'VNQ', weight: 100 }] },
];

// Demo models
const INITIAL_MODELS: Model[] = [
  {
    id: 'm1',
    name: 'Conservative',
    riskLevel: 3,
    sleeveAllocations: [
      { sleeveId: 's1', weight: 20 },
      { sleeveId: 's3', weight: 10 },
      { sleeveId: 's4', weight: 10 },
      { sleeveId: 's5', weight: 40 },
      { sleeveId: 's6', weight: 20 },
    ],
    createdAt: '2024-01-15',
  },
  {
    id: 'm2',
    name: 'Moderate',
    riskLevel: 5,
    sleeveAllocations: [
      { sleeveId: 's1', weight: 30 },
      { sleeveId: 's2', weight: 10 },
      { sleeveId: 's3', weight: 15 },
      { sleeveId: 's4', weight: 5 },
      { sleeveId: 's5', weight: 30 },
      { sleeveId: 's6', weight: 10 },
    ],
    createdAt: '2024-01-15',
  },
  {
    id: 'm3',
    name: 'Aggressive',
    riskLevel: 8,
    sleeveAllocations: [
      { sleeveId: 's1', weight: 40 },
      { sleeveId: 's2', weight: 20 },
      { sleeveId: 's3', weight: 20 },
      { sleeveId: 's4', weight: 10 },
      { sleeveId: 's5', weight: 10 },
    ],
    createdAt: '2024-01-15',
  },
];

const ASSET_CLASSES = ['Equity', 'Fixed Income', 'Real Estate', 'Commodities', 'Cash'];

// Pie chart colors
const PIE_COLORS = [
  '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#06b6d4', '#84cc16',
];

// Simple SVG Pie Chart Component
function PieChart({ data, size = 200 }: { data: { label: string; value: number; color: string }[]; size?: number }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;

  let currentAngle = -90; // Start from top
  const paths = data.map((slice, i) => {
    const angle = (slice.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const radius = size / 2 - 10;
    const cx = size / 2;
    const cy = size / 2;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    // Handle full circle case
    if (data.length === 1 || angle >= 359.9) {
      return (
        <circle key={i} cx={cx} cy={cy} r={radius} fill={slice.color} />
      );
    }

    return (
      <path
        key={i}
        d={`M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
        fill={slice.color}
      />
    );
  });

  return (
    <svg width={size} height={size} className="mx-auto">
      {paths}
    </svg>
  );
}

export default function ModelsPage() {
  const [activeTab, setActiveTab] = useState<'models' | 'sleeves'>('models');
  const [sleeves, setSleeves] = useState<Sleeve[]>(INITIAL_SLEEVES);
  const [models, setModels] = useState<Model[]>(INITIAL_MODELS);
  
  // Modal states
  const [showSleeveModal, setShowSleeveModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  
  // Create Sleeve form
  const [newSleeveName, setNewSleeveName] = useState('');
  const [newSleeveAssetClass, setNewSleeveAssetClass] = useState('Equity');
  const [newSleeveHoldings, setNewSleeveHoldings] = useState<Holding[]>([{ ticker: '', weight: 0 }]);
  
  // Create Model form
  const [newModelName, setNewModelName] = useState('');
  const [newModelRisk, setNewModelRisk] = useState(5);
  const [newModelAllocations, setNewModelAllocations] = useState<SleeveAllocation[]>([]);
  
  // Helper to get sleeve by id
  const getSleeveById = (id: string) => sleeves.find(s => s.id === id);
  
  // Calculate total weight for sleeves
  const sleeveWeightTotal = useMemo(() => {
    return newSleeveHoldings.reduce((sum, h) => sum + (h.weight || 0), 0);
  }, [newSleeveHoldings]);
  
  // Calculate total weight for models
  const modelWeightTotal = useMemo(() => {
    return newModelAllocations.reduce((sum, a) => sum + (a.weight || 0), 0);
  }, [newModelAllocations]);
  
  // Get expanded holdings for a model
  const getExpandedHoldings = (model: Model) => {
    const holdingsMap: Record<string, number> = {};
    
    model.sleeveAllocations.forEach(alloc => {
      const sleeve = getSleeveById(alloc.sleeveId);
      if (sleeve) {
        sleeve.holdings.forEach(holding => {
          const effectiveWeight = (alloc.weight / 100) * holding.weight;
          holdingsMap[holding.ticker] = (holdingsMap[holding.ticker] || 0) + effectiveWeight;
        });
      }
    });
    
    return Object.entries(holdingsMap)
      .map(([ticker, weight]) => ({ ticker, weight: Math.round(weight * 100) / 100 }))
      .sort((a, b) => b.weight - a.weight);
  };
  
  // Pie chart data for model
  const getModelPieData = (model: Model) => {
    return model.sleeveAllocations.map((alloc, i) => {
      const sleeve = getSleeveById(alloc.sleeveId);
      return {
        label: sleeve?.name || 'Unknown',
        value: alloc.weight,
        color: PIE_COLORS[i % PIE_COLORS.length],
      };
    });
  };
  
  // Preview pie data for model creation
  const previewPieData = useMemo(() => {
    return newModelAllocations
      .filter(a => a.weight > 0)
      .map((alloc, i) => {
        const sleeve = getSleeveById(alloc.sleeveId);
        return {
          label: sleeve?.name || 'Unknown',
          value: alloc.weight,
          color: PIE_COLORS[i % PIE_COLORS.length],
        };
      });
  }, [newModelAllocations, sleeves]);
  
  // Create sleeve handler
  const handleCreateSleeve = () => {
    if (!newSleeveName.trim() || sleeveWeightTotal !== 100) return;
    
    const validHoldings = newSleeveHoldings.filter(h => h.ticker.trim() && h.weight > 0);
    if (validHoldings.length === 0) return;
    
    const newSleeve: Sleeve = {
      id: `s${Date.now()}`,
      name: newSleeveName.trim(),
      assetClass: newSleeveAssetClass,
      holdings: validHoldings,
    };
    
    setSleeves([...sleeves, newSleeve]);
    setShowSleeveModal(false);
    setNewSleeveName('');
    setNewSleeveAssetClass('Equity');
    setNewSleeveHoldings([{ ticker: '', weight: 0 }]);
  };
  
  // Create model handler
  const handleCreateModel = () => {
    if (!newModelName.trim() || modelWeightTotal !== 100) return;
    
    const validAllocations = newModelAllocations.filter(a => a.weight > 0);
    if (validAllocations.length === 0) return;
    
    const newModel: Model = {
      id: `m${Date.now()}`,
      name: newModelName.trim(),
      riskLevel: newModelRisk,
      sleeveAllocations: validAllocations,
      createdAt: new Date().toISOString().split('T')[0],
    };
    
    setModels([...models, newModel]);
    setShowModelModal(false);
    setNewModelName('');
    setNewModelRisk(5);
    setNewModelAllocations([]);
  };
  
  // Clone model handler
  const handleCloneModel = (model: Model) => {
    const clonedModel: Model = {
      ...model,
      id: `m${Date.now()}`,
      name: `${model.name} (Copy)`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setModels([...models, clonedModel]);
  };
  
  // Add holding row
  const addHoldingRow = () => {
    setNewSleeveHoldings([...newSleeveHoldings, { ticker: '', weight: 0 }]);
  };
  
  // Remove holding row
  const removeHoldingRow = (index: number) => {
    setNewSleeveHoldings(newSleeveHoldings.filter((_, i) => i !== index));
  };
  
  // Update holding
  const updateHolding = (index: number, field: 'ticker' | 'weight', value: string | number) => {
    const updated = [...newSleeveHoldings];
    updated[index] = { ...updated[index], [field]: value };
    setNewSleeveHoldings(updated);
  };
  
  // Add allocation row
  const addAllocationRow = () => {
    const unusedSleeve = sleeves.find(s => !newModelAllocations.some(a => a.sleeveId === s.id));
    if (unusedSleeve) {
      setNewModelAllocations([...newModelAllocations, { sleeveId: unusedSleeve.id, weight: 0 }]);
    }
  };
  
  // Remove allocation row
  const removeAllocationRow = (index: number) => {
    setNewModelAllocations(newModelAllocations.filter((_, i) => i !== index));
  };
  
  // Update allocation
  const updateAllocation = (index: number, field: 'sleeveId' | 'weight', value: string | number) => {
    const updated = [...newModelAllocations];
    updated[index] = { ...updated[index], [field]: value };
    setNewModelAllocations(updated);
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Model Portfolios</h1>
          <p className="text-gray-400 text-sm md:text-base">
            Build and manage reusable portfolio models from sleeve building blocks
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/partners/models/drift"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[48px]"
          >
            <span>📊</span>
            <span>Drift Monitor</span>
          </Link>
          <Link
            href="/partners/models/tax-aware"
            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[48px]"
          >
            <span>🎯</span>
            <span>Tax-Aware Settings</span>
          </Link>
        </div>
      </div>

      {/* Tax-Aware Feature Highlight */}
      <Link href="/partners/models/tax-aware">
        <div className="mb-6 p-4 md:p-5 bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl hover:border-amber-500/40 transition-colors cursor-pointer">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🎯</span>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Tax-Aware Product Selection</h3>
                <p className="text-gray-400 text-sm">
                  Configure different products for taxable, tax-deferred, and Roth accounts. Maximize after-tax returns.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-amber-400 font-medium text-sm">
              <span>Configure</span>
              <span>→</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 mb-6 w-fit">
        <button
          onClick={() => setActiveTab('models')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors min-h-[48px] ${
            activeTab === 'models'
              ? 'bg-amber-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Models
        </button>
        <button
          onClick={() => setActiveTab('sleeves')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors min-h-[48px] ${
            activeTab === 'sleeves'
              ? 'bg-amber-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Sleeves
        </button>
      </div>

      {/* SLEEVES TAB */}
      {activeTab === 'sleeves' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowSleeveModal(true)}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl transition-colors flex items-center gap-2 min-h-[48px]"
            >
              <span>+</span>
              <span>Create Sleeve</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sleeves.map((sleeve) => (
              <div
                key={sleeve.id}
                className="bg-[#12121a] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold text-lg">{sleeve.name}</h3>
                    <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded mt-1 inline-block">
                      {sleeve.assetClass}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  {sleeve.holdings.map((holding, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 font-mono">{holding.ticker}</span>
                      <span className="text-white font-medium">{holding.weight}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODELS TAB */}
      {activeTab === 'models' && !selectedModel && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => {
                setNewModelAllocations([]);
                setShowModelModal(true);
              }}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl transition-colors flex items-center gap-2 min-h-[48px]"
            >
              <span>+</span>
              <span>Create Model</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model)}
                className="bg-[#12121a] border border-white/10 rounded-2xl p-5 hover:border-amber-500/50 transition-colors text-left min-h-[48px]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold text-lg">{model.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-gray-400 text-sm">Risk:</span>
                      <div className="flex items-center gap-1">
                        {[...Array(10)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-4 rounded-sm ${
                              i < model.riskLevel
                                ? model.riskLevel <= 3
                                  ? 'bg-emerald-500'
                                  : model.riskLevel <= 6
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                                : 'bg-white/10'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-500 text-sm">{model.riskLevel}/10</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-center">
                  <PieChart data={getModelPieData(model)} size={120} />
                </div>
                <div className="mt-4 space-y-1">
                  {model.sleeveAllocations.slice(0, 3).map((alloc, i) => {
                    const sleeve = getSleeveById(alloc.sleeveId);
                    return (
                      <div key={alloc.sleeveId} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                          />
                          <span className="text-gray-400 truncate max-w-[140px]">{sleeve?.name}</span>
                        </div>
                        <span className="text-white font-medium">{alloc.weight}%</span>
                      </div>
                    );
                  })}
                  {model.sleeveAllocations.length > 3 && (
                    <div className="text-gray-500 text-xs text-center pt-1">
                      +{model.sleeveAllocations.length - 3} more sleeves
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MODEL DETAIL VIEW */}
      {activeTab === 'models' && selectedModel && (
        <div>
          <button
            onClick={() => setSelectedModel(null)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 min-h-[48px] min-w-[48px]"
          >
            <span>←</span>
            <span>Back to Models</span>
          </button>

          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{selectedModel.name}</h2>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">Risk Level:</span>
                  <div className="flex items-center gap-1">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-5 rounded-sm ${
                          i < selectedModel.riskLevel
                            ? selectedModel.riskLevel <= 3
                              ? 'bg-emerald-500'
                              : selectedModel.riskLevel <= 6
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                            : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-white font-medium">{selectedModel.riskLevel}/10</span>
                </div>
                <div className="text-gray-500 text-sm mt-2">Created: {selectedModel.createdAt}</div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Apply to Client dropdown */}
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      alert(`Model "${selectedModel.name}" applied to ${DEMO_CLIENTS.find(c => c.id === e.target.value)?.name}`);
                      e.target.value = '';
                    }
                  }}
                  className="px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl transition-colors min-h-[48px] cursor-pointer"
                  defaultValue=""
                >
                  <option value="" disabled>Apply to Client</option>
                  {DEMO_CLIENTS.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleCloneModel(selectedModel)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors min-h-[48px]"
                >
                  Clone Model
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Pie Chart */}
              <div className="flex flex-col items-center">
                <h3 className="text-white font-semibold mb-4">Sleeve Allocation</h3>
                <PieChart data={getModelPieData(selectedModel)} size={220} />
                <div className="mt-6 space-y-2 w-full max-w-xs">
                  {selectedModel.sleeveAllocations.map((alloc, i) => {
                    const sleeve = getSleeveById(alloc.sleeveId);
                    return (
                      <div key={alloc.sleeveId} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                          />
                          <span className="text-gray-300">{sleeve?.name}</span>
                        </div>
                        <span className="text-white font-medium">{alloc.weight}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Expanded Holdings */}
              <div>
                <h3 className="text-white font-semibold mb-4">Underlying Holdings</h3>
                <div className="bg-white/5 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-500 text-sm border-b border-white/10">
                        <th className="p-4 font-medium">Ticker</th>
                        <th className="p-4 font-medium text-right">Weight</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getExpandedHoldings(selectedModel).map((holding, i) => (
                        <tr key={holding.ticker} className="border-b border-white/5">
                          <td className="p-4 text-white font-mono">{holding.ticker}</td>
                          <td className="p-4 text-right text-amber-400 font-medium">{holding.weight.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE SLEEVE MODAL */}
      {showSleeveModal && (
        <div className="fixed inset-0 bg-black/80 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
          <div className="bg-[#12121a] border-t md:border border-white/10 rounded-t-2xl md:rounded-2xl p-6 md:p-8 w-full md:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white">Create Sleeve</h2>
              <button
                onClick={() => setShowSleeveModal(false)}
                className="min-w-[48px] min-h-[48px] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Sleeve Name</label>
                <input
                  type="text"
                  value={newSleeveName}
                  onChange={(e) => setNewSleeveName(e.target.value)}
                  placeholder="e.g., US Tech Sector"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Asset Class</label>
                <select
                  value={newSleeveAssetClass}
                  onChange={(e) => setNewSleeveAssetClass(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                >
                  {ASSET_CLASSES.map(ac => (
                    <option key={ac} value={ac}>{ac}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-gray-400 text-sm">Holdings</label>
                  <span className={`text-sm font-medium ${sleeveWeightTotal === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    Total: {sleeveWeightTotal}%
                  </span>
                </div>
                <div className="space-y-2">
                  {newSleeveHoldings.map((holding, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={holding.ticker}
                        onChange={(e) => updateHolding(i, 'ticker', e.target.value.toUpperCase())}
                        placeholder="Ticker"
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 min-h-[48px] font-mono"
                      />
                      <input
                        type="number"
                        value={holding.weight || ''}
                        onChange={(e) => updateHolding(i, 'weight', parseFloat(e.target.value) || 0)}
                        placeholder="%"
                        className="w-24 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 min-h-[48px] text-right"
                      />
                      <button
                        onClick={() => removeHoldingRow(i)}
                        className="min-w-[48px] min-h-[48px] flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors"
                        disabled={newSleeveHoldings.length === 1}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addHoldingRow}
                  className="mt-3 w-full py-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-colors min-h-[48px]"
                >
                  + Add Holding
                </button>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 mt-8">
              <button
                onClick={() => setShowSleeveModal(false)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors min-h-[48px]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSleeve}
                disabled={!newSleeveName.trim() || sleeveWeightTotal !== 100}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-medium min-h-[48px]"
              >
                Create Sleeve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MODEL MODAL */}
      {showModelModal && (
        <div className="fixed inset-0 bg-black/80 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
          <div className="bg-[#12121a] border-t md:border border-white/10 rounded-t-2xl md:rounded-2xl p-6 md:p-8 w-full md:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white">Create Model</h2>
              <button
                onClick={() => setShowModelModal(false)}
                className="min-w-[48px] min-h-[48px] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left side: Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Model Name</label>
                  <input
                    type="text"
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                    placeholder="e.g., Growth Portfolio"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Risk Level: {newModelRisk}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={newModelRisk}
                    onChange={(e) => setNewModelRisk(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Conservative</span>
                    <span>Aggressive</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-gray-400 text-sm">Sleeve Allocations</label>
                    <span className={`text-sm font-medium ${modelWeightTotal === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      Total: {modelWeightTotal}%
                    </span>
                  </div>
                  <div className="space-y-2">
                    {newModelAllocations.map((alloc, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <select
                          value={alloc.sleeveId}
                          onChange={(e) => updateAllocation(i, 'sleeveId', e.target.value)}
                          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                        >
                          {sleeves.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={alloc.weight || ''}
                          onChange={(e) => updateAllocation(i, 'weight', parseFloat(e.target.value) || 0)}
                          placeholder="%"
                          className="w-24 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 min-h-[48px] text-right"
                        />
                        <button
                          onClick={() => removeAllocationRow(i)}
                          className="min-w-[48px] min-h-[48px] flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addAllocationRow}
                    disabled={newModelAllocations.length >= sleeves.length}
                    className="mt-3 w-full py-3 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 hover:text-white rounded-xl transition-colors min-h-[48px]"
                  >
                    + Add Sleeve
                  </button>
                </div>
              </div>

              {/* Right side: Pie Preview */}
              <div className="flex flex-col items-center justify-center bg-white/5 rounded-xl p-6">
                <h3 className="text-gray-400 text-sm mb-4">Preview</h3>
                {previewPieData.length > 0 ? (
                  <>
                    <PieChart data={previewPieData} size={160} />
                    <div className="mt-4 space-y-1 text-sm w-full">
                      {previewPieData.map((d, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded" style={{ backgroundColor: d.color }} />
                            <span className="text-gray-400 truncate max-w-[100px]">{d.label}</span>
                          </div>
                          <span className="text-white">{d.value}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-gray-500 text-center py-8">
                    Add sleeves to see preview
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 mt-8">
              <button
                onClick={() => setShowModelModal(false)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors min-h-[48px]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateModel}
                disabled={!newModelName.trim() || modelWeightTotal !== 100}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-medium min-h-[48px]"
              >
                Create Model
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
