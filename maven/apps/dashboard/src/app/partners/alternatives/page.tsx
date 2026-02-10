'use client';

import { useState, useMemo } from 'react';

// Types
interface Fund {
  id: string;
  name: string;
  manager: string;
  vintage: number;
  strategy: string;
  category: 'pe' | 'vc' | 'credit' | 'realestate' | 'hedge';
  commitment: number;
  contributed: number;
  distributed: number;
  nav: number;
  irr: number;
  tvpi: number;
  dpi: number;
  moic: number;
  lastValuation: string;
  irrHistory: { quarter: string; irr: number }[];
}

interface CapitalCall {
  id: string;
  fundId: string;
  amount: number;
  dueDate: string;
  paid: boolean;
  paidDate?: string;
}

interface Distribution {
  id: string;
  fundId: string;
  amount: number;
  date: string;
  type: 'return_of_capital' | 'gain' | 'dividend';
}

// Demo funds with realistic PE/VC metrics
const DEMO_FUNDS: Fund[] = [
  {
    id: 'f1',
    name: 'Sequoia Capital Fund XVIII',
    manager: 'Sequoia Capital',
    vintage: 2021,
    strategy: 'Growth Equity',
    category: 'vc',
    commitment: 500000,
    contributed: 425000,
    distributed: 180000,
    nav: 520000,
    irr: 24.5,
    tvpi: 1.65,
    dpi: 0.42,
    moic: 1.65,
    lastValuation: '2025-12-31',
    irrHistory: [
      { quarter: 'Q1 2022', irr: -8.2 },
      { quarter: 'Q2 2022', irr: -12.5 },
      { quarter: 'Q3 2022', irr: -5.1 },
      { quarter: 'Q4 2022', irr: 2.3 },
      { quarter: 'Q1 2023', irr: 8.7 },
      { quarter: 'Q2 2023', irr: 14.2 },
      { quarter: 'Q3 2023', irr: 18.5 },
      { quarter: 'Q4 2023', irr: 21.1 },
      { quarter: 'Q1 2024', irr: 22.8 },
      { quarter: 'Q2 2024', irr: 23.5 },
      { quarter: 'Q3 2024', irr: 24.0 },
      { quarter: 'Q4 2024', irr: 24.5 },
    ],
  },
  {
    id: 'f2',
    name: 'KKR Americas XII',
    manager: 'KKR & Co',
    vintage: 2020,
    strategy: 'Buyout',
    category: 'pe',
    commitment: 1000000,
    contributed: 850000,
    distributed: 420000,
    nav: 980000,
    irr: 18.2,
    tvpi: 1.65,
    dpi: 0.49,
    moic: 1.65,
    lastValuation: '2025-12-31',
    irrHistory: [
      { quarter: 'Q1 2021', irr: -15.3 },
      { quarter: 'Q2 2021', irr: -10.2 },
      { quarter: 'Q3 2021', irr: -4.5 },
      { quarter: 'Q4 2021', irr: 3.2 },
      { quarter: 'Q1 2022', irr: 7.8 },
      { quarter: 'Q2 2022', irr: 10.5 },
      { quarter: 'Q3 2022', irr: 12.1 },
      { quarter: 'Q4 2022', irr: 14.3 },
      { quarter: 'Q1 2023', irr: 15.2 },
      { quarter: 'Q2 2023', irr: 16.0 },
      { quarter: 'Q3 2023', irr: 16.8 },
      { quarter: 'Q4 2023', irr: 17.3 },
      { quarter: 'Q1 2024', irr: 17.6 },
      { quarter: 'Q2 2024', irr: 17.9 },
      { quarter: 'Q3 2024', irr: 18.0 },
      { quarter: 'Q4 2024', irr: 18.2 },
    ],
  },
  {
    id: 'f3',
    name: 'Andreessen Horowitz Bio Fund II',
    manager: 'a16z',
    vintage: 2022,
    strategy: 'Venture Capital',
    category: 'vc',
    commitment: 250000,
    contributed: 175000,
    distributed: 25000,
    nav: 210000,
    irr: 15.8,
    tvpi: 1.34,
    dpi: 0.14,
    moic: 1.34,
    lastValuation: '2025-12-31',
    irrHistory: [
      { quarter: 'Q1 2023', irr: -22.5 },
      { quarter: 'Q2 2023', irr: -18.2 },
      { quarter: 'Q3 2023', irr: -10.5 },
      { quarter: 'Q4 2023', irr: -2.1 },
      { quarter: 'Q1 2024', irr: 5.3 },
      { quarter: 'Q2 2024', irr: 10.2 },
      { quarter: 'Q3 2024', irr: 13.5 },
      { quarter: 'Q4 2024', irr: 15.8 },
    ],
  },
  {
    id: 'f4',
    name: 'Blackstone Real Estate Partners X',
    manager: 'Blackstone',
    vintage: 2019,
    strategy: 'Value-Add',
    category: 'realestate',
    commitment: 750000,
    contributed: 712500,
    distributed: 385000,
    nav: 625000,
    irr: 14.2,
    tvpi: 1.42,
    dpi: 0.54,
    moic: 1.42,
    lastValuation: '2025-12-31',
    irrHistory: [
      { quarter: 'Q1 2020', irr: -5.2 },
      { quarter: 'Q2 2020', irr: -8.5 },
      { quarter: 'Q3 2020', irr: -3.2 },
      { quarter: 'Q4 2020', irr: 2.1 },
      { quarter: 'Q1 2021', irr: 6.5 },
      { quarter: 'Q2 2021', irr: 9.2 },
      { quarter: 'Q3 2021', irr: 11.0 },
      { quarter: 'Q4 2021', irr: 12.5 },
      { quarter: 'Q1 2022', irr: 13.2 },
      { quarter: 'Q2 2022', irr: 13.8 },
      { quarter: 'Q3 2022', irr: 14.0 },
      { quarter: 'Q4 2022', irr: 14.2 },
    ],
  },
  {
    id: 'f5',
    name: 'Apollo Credit Opportunities III',
    manager: 'Apollo Global',
    vintage: 2021,
    strategy: 'Direct Lending',
    category: 'credit',
    commitment: 400000,
    contributed: 380000,
    distributed: 145000,
    nav: 395000,
    irr: 11.5,
    tvpi: 1.42,
    dpi: 0.38,
    moic: 1.42,
    lastValuation: '2025-12-31',
    irrHistory: [
      { quarter: 'Q1 2022', irr: 2.1 },
      { quarter: 'Q2 2022', irr: 4.5 },
      { quarter: 'Q3 2022', irr: 6.2 },
      { quarter: 'Q4 2022', irr: 7.8 },
      { quarter: 'Q1 2023', irr: 8.9 },
      { quarter: 'Q2 2023', irr: 9.8 },
      { quarter: 'Q3 2023', irr: 10.5 },
      { quarter: 'Q4 2023', irr: 10.9 },
      { quarter: 'Q1 2024', irr: 11.1 },
      { quarter: 'Q2 2024', irr: 11.3 },
      { quarter: 'Q3 2024', irr: 11.4 },
      { quarter: 'Q4 2024', irr: 11.5 },
    ],
  },
  {
    id: 'f6',
    name: 'Citadel Wellington Fund',
    manager: 'Citadel',
    vintage: 2023,
    strategy: 'Multi-Strategy',
    category: 'hedge',
    commitment: 500000,
    contributed: 500000,
    distributed: 85000,
    nav: 595000,
    irr: 22.8,
    tvpi: 1.36,
    dpi: 0.17,
    moic: 1.36,
    lastValuation: '2025-12-31',
    irrHistory: [
      { quarter: 'Q1 2024', irr: 8.5 },
      { quarter: 'Q2 2024', irr: 14.2 },
      { quarter: 'Q3 2024', irr: 18.5 },
      { quarter: 'Q4 2024', irr: 22.8 },
    ],
  },
];

// Demo capital calls
const DEMO_CAPITAL_CALLS: CapitalCall[] = [
  { id: 'cc1', fundId: 'f1', amount: 50000, dueDate: '2026-02-28', paid: false },
  { id: 'cc2', fundId: 'f3', amount: 35000, dueDate: '2026-03-15', paid: false },
  { id: 'cc3', fundId: 'f2', amount: 75000, dueDate: '2026-01-15', paid: true, paidDate: '2026-01-12' },
  { id: 'cc4', fundId: 'f1', amount: 45000, dueDate: '2025-12-15', paid: true, paidDate: '2025-12-10' },
  { id: 'cc5', fundId: 'f4', amount: 25000, dueDate: '2026-04-01', paid: false },
];

// Demo distributions
const DEMO_DISTRIBUTIONS: Distribution[] = [
  { id: 'd1', fundId: 'f2', amount: 125000, date: '2025-12-20', type: 'gain' },
  { id: 'd2', fundId: 'f4', amount: 85000, date: '2025-11-15', type: 'dividend' },
  { id: 'd3', fundId: 'f1', amount: 55000, date: '2025-10-30', type: 'gain' },
  { id: 'd4', fundId: 'f5', amount: 45000, date: '2025-10-01', type: 'return_of_capital' },
  { id: 'd5', fundId: 'f6', amount: 40000, date: '2025-09-15', type: 'gain' },
];

// Strategy options by category
const STRATEGIES: Record<string, string[]> = {
  pe: ['Buyout', 'Growth Equity', 'Distressed', 'Secondaries', 'Co-Investment'],
  vc: ['Seed', 'Early Stage', 'Growth', 'Late Stage', 'Sector-Specific'],
  credit: ['Direct Lending', 'Mezzanine', 'Distressed Debt', 'CLOs', 'Specialty Finance'],
  realestate: ['Core', 'Core-Plus', 'Value-Add', 'Opportunistic', 'Development'],
  hedge: ['Long/Short Equity', 'Multi-Strategy', 'Global Macro', 'Event-Driven', 'Quant'],
};

// Public market benchmark for PME
const PUBLIC_MARKET_RETURN = 12.5; // S&P 500 annualized

// J-Curve Chart Component
function JCurveChart({ data, width = 400, height = 200 }: { data: { quarter: string; irr: number }[]; width?: number; height?: number }) {
  if (data.length === 0) return null;

  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxIrr = Math.max(...data.map(d => d.irr), 0);
  const minIrr = Math.min(...data.map(d => d.irr), 0);
  const range = maxIrr - minIrr || 1;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
    const y = padding.top + chartHeight - ((d.irr - minIrr) / range) * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = pathD + ` L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  // Zero line position
  const zeroY = padding.top + chartHeight - ((0 - minIrr) / range) * chartHeight;

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map(pct => {
        const y = padding.top + (pct / 100) * chartHeight;
        return (
          <line key={pct} x1={padding.left} y1={y} x2={padding.left + chartWidth} y2={y} stroke="rgba(255,255,255,0.1)" />
        );
      })}

      {/* Zero line */}
      {minIrr < 0 && maxIrr > 0 && (
        <line x1={padding.left} y1={zeroY} x2={padding.left + chartWidth} y2={zeroY} stroke="rgba(255,255,255,0.3)" strokeDasharray="4" />
      )}

      {/* Area fill */}
      <path d={areaD} fill="url(#jcurve-gradient)" opacity={0.3} />

      {/* Line */}
      <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth={2} />

      {/* Points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#f59e0b" />
      ))}

      {/* Y-axis labels */}
      <text x={padding.left - 10} y={padding.top} fill="#6b7280" fontSize={10} textAnchor="end" dominantBaseline="middle">
        {maxIrr.toFixed(0)}%
      </text>
      <text x={padding.left - 10} y={padding.top + chartHeight} fill="#6b7280" fontSize={10} textAnchor="end" dominantBaseline="middle">
        {minIrr.toFixed(0)}%
      </text>
      {minIrr < 0 && maxIrr > 0 && (
        <text x={padding.left - 10} y={zeroY} fill="#6b7280" fontSize={10} textAnchor="end" dominantBaseline="middle">
          0%
        </text>
      )}

      {/* X-axis labels */}
      <text x={padding.left} y={height - 10} fill="#6b7280" fontSize={10} textAnchor="start">
        {data[0]?.quarter}
      </text>
      <text x={padding.left + chartWidth} y={height - 10} fill="#6b7280" fontSize={10} textAnchor="end">
        {data[data.length - 1]?.quarter}
      </text>

      {/* Gradient definition */}
      <defs>
        <linearGradient id="jcurve-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Format currency
function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  return `$${value.toLocaleString()}`;
}

// Format date
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AlternativesPage() {
  const [activeTab, setActiveTab] = useState<'pe' | 'vc' | 'credit' | 'realestate' | 'hedge'>('pe');
  const [funds, setFunds] = useState<Fund[]>(DEMO_FUNDS);
  const [capitalCalls, setCapitalCalls] = useState<CapitalCall[]>(DEMO_CAPITAL_CALLS);
  const [distributions, setDistributions] = useState<Distribution[]>(DEMO_DISTRIBUTIONS);

  // Modal states
  const [showAddInvestment, setShowAddInvestment] = useState(false);
  const [showCapitalCall, setShowCapitalCall] = useState(false);
  const [showDistribution, setShowDistribution] = useState(false);
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);

  // Add Investment form
  const [newFundName, setNewFundName] = useState('');
  const [newFundManager, setNewFundManager] = useState('');
  const [newFundVintage, setNewFundVintage] = useState(new Date().getFullYear());
  const [newFundStrategy, setNewFundStrategy] = useState('');
  const [newFundCommitment, setNewFundCommitment] = useState<number>(0);
  const [newFundContribution, setNewFundContribution] = useState<number>(0);

  // Capital Call form
  const [callFundId, setCallFundId] = useState('');
  const [callAmount, setCallAmount] = useState<number>(0);
  const [callDueDate, setCallDueDate] = useState('');

  // Distribution form
  const [distFundId, setDistFundId] = useState('');
  const [distAmount, setDistAmount] = useState<number>(0);
  const [distDate, setDistDate] = useState('');
  const [distType, setDistType] = useState<'return_of_capital' | 'gain' | 'dividend'>('gain');

  // Tab configuration
  const tabs = [
    { id: 'pe' as const, label: 'Private Equity' },
    { id: 'vc' as const, label: 'Venture Capital' },
    { id: 'credit' as const, label: 'Private Credit' },
    { id: 'realestate' as const, label: 'Real Estate' },
    { id: 'hedge' as const, label: 'Hedge Funds' },
  ];

  // Filter funds by category
  const filteredFunds = useMemo(() => {
    return funds.filter(f => f.category === activeTab);
  }, [funds, activeTab]);

  // Calculate summary metrics
  const summary = useMemo(() => {
    const totalCommitment = funds.reduce((sum, f) => sum + f.commitment, 0);
    const totalContributed = funds.reduce((sum, f) => sum + f.contributed, 0);
    const totalDistributed = funds.reduce((sum, f) => sum + f.distributed, 0);
    const totalNav = funds.reduce((sum, f) => sum + f.nav, 0);
    const unfundedCommitment = totalCommitment - totalContributed;

    // Weighted average IRR
    const weightedIrr = funds.reduce((sum, f) => sum + f.irr * f.nav, 0) / totalNav || 0;

    // PME vs S&P 500
    const pme = weightedIrr - PUBLIC_MARKET_RETURN;

    return {
      totalCommitment,
      totalContributed,
      totalDistributed,
      totalNav,
      unfundedCommitment,
      weightedIrr,
      pme,
    };
  }, [funds]);

  // Upcoming capital calls
  const upcomingCalls = useMemo(() => {
    return capitalCalls
      .filter(cc => !cc.paid)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [capitalCalls]);

  // Recent distributions
  const recentDistributions = useMemo(() => {
    return distributions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [distributions]);

  // Get fund by ID
  const getFundById = (id: string) => funds.find(f => f.id === id);

  // Handle add investment
  const handleAddInvestment = () => {
    if (!newFundName || !newFundManager || !newFundStrategy || !newFundCommitment) return;

    const newFund: Fund = {
      id: `f${Date.now()}`,
      name: newFundName,
      manager: newFundManager,
      vintage: newFundVintage,
      strategy: newFundStrategy,
      category: activeTab,
      commitment: newFundCommitment,
      contributed: newFundContribution,
      distributed: 0,
      nav: newFundContribution,
      irr: 0,
      tvpi: 1.0,
      dpi: 0,
      moic: 1.0,
      lastValuation: new Date().toISOString().split('T')[0],
      irrHistory: [],
    };

    setFunds([...funds, newFund]);
    setShowAddInvestment(false);
    resetAddInvestmentForm();
  };

  // Handle record capital call
  const handleRecordCapitalCall = () => {
    if (!callFundId || !callAmount || !callDueDate) return;

    const newCall: CapitalCall = {
      id: `cc${Date.now()}`,
      fundId: callFundId,
      amount: callAmount,
      dueDate: callDueDate,
      paid: false,
    };

    setCapitalCalls([...capitalCalls, newCall]);
    setShowCapitalCall(false);
    resetCapitalCallForm();
  };

  // Handle mark call as paid
  const handleMarkCallPaid = (callId: string) => {
    setCapitalCalls(capitalCalls.map(cc => {
      if (cc.id === callId) {
        const fund = getFundById(cc.fundId);
        if (fund) {
          // Update fund contributed amount
          setFunds(funds.map(f => {
            if (f.id === cc.fundId) {
              return { ...f, contributed: f.contributed + cc.amount };
            }
            return f;
          }));
        }
        return { ...cc, paid: true, paidDate: new Date().toISOString().split('T')[0] };
      }
      return cc;
    }));
  };

  // Handle record distribution
  const handleRecordDistribution = () => {
    if (!distFundId || !distAmount || !distDate) return;

    const newDist: Distribution = {
      id: `d${Date.now()}`,
      fundId: distFundId,
      amount: distAmount,
      date: distDate,
      type: distType,
    };

    // Update fund distributed amount
    setFunds(funds.map(f => {
      if (f.id === distFundId) {
        return { ...f, distributed: f.distributed + distAmount };
      }
      return f;
    }));

    setDistributions([...distributions, newDist]);
    setShowDistribution(false);
    resetDistributionForm();
  };

  // Reset forms
  const resetAddInvestmentForm = () => {
    setNewFundName('');
    setNewFundManager('');
    setNewFundVintage(new Date().getFullYear());
    setNewFundStrategy('');
    setNewFundCommitment(0);
    setNewFundContribution(0);
  };

  const resetCapitalCallForm = () => {
    setCallFundId('');
    setCallAmount(0);
    setCallDueDate('');
  };

  const resetDistributionForm = () => {
    setDistFundId('');
    setDistAmount(0);
    setDistDate('');
    setDistType('gain');
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Alternative Investments</h1>
          <p className="text-gray-400 text-sm md:text-base">
            Track private equity, venture capital, and alternative fund investments
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAddInvestment(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl transition-colors flex items-center gap-2 min-h-[48px]"
          >
            <span>+</span>
            <span>Add Investment</span>
          </button>
          <button
            onClick={() => setShowCapitalCall(true)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors flex items-center gap-2 min-h-[48px]"
          >
            <span>📥</span>
            <span>Capital Call</span>
          </button>
          <button
            onClick={() => setShowDistribution(true)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors flex items-center gap-2 min-h-[48px]"
          >
            <span>📤</span>
            <span>Distribution</span>
          </button>
        </div>
      </div>

      {/* Summary Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
          <div className="text-gray-400 text-xs mb-1">Total Commitment</div>
          <div className="text-white text-lg md:text-xl font-bold">{formatCurrency(summary.totalCommitment)}</div>
        </div>
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
          <div className="text-gray-400 text-xs mb-1">Contributed</div>
          <div className="text-white text-lg md:text-xl font-bold">{formatCurrency(summary.totalContributed)}</div>
        </div>
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
          <div className="text-gray-400 text-xs mb-1">Distributed</div>
          <div className="text-white text-lg md:text-xl font-bold">{formatCurrency(summary.totalDistributed)}</div>
        </div>
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
          <div className="text-gray-400 text-xs mb-1">Current NAV</div>
          <div className="text-white text-lg md:text-xl font-bold">{formatCurrency(summary.totalNav)}</div>
        </div>
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
          <div className="text-gray-400 text-xs mb-1">Unfunded</div>
          <div className="text-amber-400 text-lg md:text-xl font-bold">{formatCurrency(summary.unfundedCommitment)}</div>
        </div>
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
          <div className="text-gray-400 text-xs mb-1">Weighted IRR</div>
          <div className="text-emerald-400 text-lg md:text-xl font-bold">{summary.weightedIrr.toFixed(1)}%</div>
        </div>
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-4">
          <div className="text-gray-400 text-xs mb-1">PME vs S&P</div>
          <div className={`text-lg md:text-xl font-bold ${summary.pme >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {summary.pme >= 0 ? '+' : ''}{summary.pme.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6 md:mb-8">
        {/* Upcoming Capital Calls */}
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-4 md:p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span>📥</span> Upcoming Capital Calls
          </h3>
          {upcomingCalls.length > 0 ? (
            <div className="space-y-3">
              {upcomingCalls.slice(0, 4).map(call => {
                const fund = getFundById(call.fundId);
                const dueDate = new Date(call.dueDate);
                const isOverdue = dueDate < new Date();
                const isUrgent = !isOverdue && dueDate.getTime() - Date.now() < 14 * 24 * 60 * 60 * 1000;
                return (
                  <div key={call.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                    <div>
                      <div className="text-white font-medium text-sm">{fund?.name}</div>
                      <div className={`text-xs ${isOverdue ? 'text-red-400' : isUrgent ? 'text-amber-400' : 'text-gray-500'}`}>
                        Due: {formatDate(call.dueDate)} {isOverdue && '(Overdue!)'}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-white font-bold">{formatCurrency(call.amount)}</div>
                      <button
                        onClick={() => handleMarkCallPaid(call.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg min-h-[36px]"
                      >
                        Mark Paid
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-6">No upcoming capital calls</div>
          )}
        </div>

        {/* Recent Distributions */}
        <div className="bg-[#12121a] border border-white/10 rounded-xl p-4 md:p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span>📤</span> Recent Distributions
          </h3>
          {recentDistributions.length > 0 ? (
            <div className="space-y-3">
              {recentDistributions.map(dist => {
                const fund = getFundById(dist.fundId);
                return (
                  <div key={dist.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                    <div>
                      <div className="text-white font-medium text-sm">{fund?.name}</div>
                      <div className="text-gray-500 text-xs">
                        {formatDate(dist.date)} • {dist.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                    </div>
                    <div className="text-emerald-400 font-bold">{formatCurrency(dist.amount)}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-6">No recent distributions</div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 md:px-6 py-3 rounded-lg font-medium transition-colors min-h-[48px] whitespace-nowrap text-sm md:text-base ${
              activeTab === tab.id
                ? 'bg-amber-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Fund List */}
      {selectedFund ? (
        // Fund Detail View
        <div>
          <button
            onClick={() => setSelectedFund(null)}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 min-h-[48px]"
          >
            <span>←</span>
            <span>Back to List</span>
          </button>

          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{selectedFund.name}</h2>
                <div className="flex flex-wrap items-center gap-3 text-gray-400">
                  <span>{selectedFund.manager}</span>
                  <span>•</span>
                  <span>Vintage {selectedFund.vintage}</span>
                  <span>•</span>
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-sm">{selectedFund.strategy}</span>
                </div>
              </div>
              <div className="text-gray-500 text-sm">
                Last Valuation: {formatDate(selectedFund.lastValuation)}
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Commitment</div>
                <div className="text-white text-xl font-bold">{formatCurrency(selectedFund.commitment)}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Contributed</div>
                <div className="text-white text-xl font-bold">{formatCurrency(selectedFund.contributed)}</div>
                <div className="text-gray-500 text-xs">{((selectedFund.contributed / selectedFund.commitment) * 100).toFixed(0)}% called</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Distributed</div>
                <div className="text-emerald-400 text-xl font-bold">{formatCurrency(selectedFund.distributed)}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">Current NAV</div>
                <div className="text-white text-xl font-bold">{formatCurrency(selectedFund.nav)}</div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">IRR</div>
                <div className={`text-xl font-bold ${selectedFund.irr >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {selectedFund.irr.toFixed(1)}%
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">TVPI</div>
                <div className="text-white text-xl font-bold">{selectedFund.tvpi.toFixed(2)}x</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">DPI</div>
                <div className="text-white text-xl font-bold">{selectedFund.dpi.toFixed(2)}x</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-gray-400 text-sm mb-1">MOIC</div>
                <div className="text-white text-xl font-bold">{selectedFund.moic.toFixed(2)}x</div>
              </div>
            </div>

            {/* J-Curve Chart */}
            {selectedFund.irrHistory.length > 0 && (
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">J-Curve (IRR Over Time)</h3>
                <div className="flex justify-center overflow-x-auto">
                  <JCurveChart data={selectedFund.irrHistory} width={600} height={250} />
                </div>
              </div>
            )}

            {/* Fund Capital Calls */}
            <div className="mt-8">
              <h3 className="text-white font-semibold mb-4">Capital Call History</h3>
              <div className="bg-white/5 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-500 text-sm border-b border-white/10">
                      <th className="p-4 font-medium">Due Date</th>
                      <th className="p-4 font-medium text-right">Amount</th>
                      <th className="p-4 font-medium text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {capitalCalls.filter(cc => cc.fundId === selectedFund.id).length > 0 ? (
                      capitalCalls
                        .filter(cc => cc.fundId === selectedFund.id)
                        .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
                        .map(call => (
                          <tr key={call.id} className="border-b border-white/5">
                            <td className="p-4 text-white">{formatDate(call.dueDate)}</td>
                            <td className="p-4 text-right text-white font-medium">{formatCurrency(call.amount)}</td>
                            <td className="p-4 text-center">
                              {call.paid ? (
                                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm">
                                  Paid {call.paidDate && formatDate(call.paidDate)}
                                </span>
                              ) : (
                                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm">Pending</span>
                              )}
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="p-4 text-center text-gray-500">No capital calls recorded</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Fund Distributions */}
            <div className="mt-8">
              <h3 className="text-white font-semibold mb-4">Distribution History</h3>
              <div className="bg-white/5 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-500 text-sm border-b border-white/10">
                      <th className="p-4 font-medium">Date</th>
                      <th className="p-4 font-medium">Type</th>
                      <th className="p-4 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {distributions.filter(d => d.fundId === selectedFund.id).length > 0 ? (
                      distributions
                        .filter(d => d.fundId === selectedFund.id)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map(dist => (
                          <tr key={dist.id} className="border-b border-white/5">
                            <td className="p-4 text-white">{formatDate(dist.date)}</td>
                            <td className="p-4 text-gray-400 capitalize">{dist.type.replace('_', ' ')}</td>
                            <td className="p-4 text-right text-emerald-400 font-medium">{formatCurrency(dist.amount)}</td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="p-4 text-center text-gray-500">No distributions recorded</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Fund List View
        <div className="space-y-4">
          {filteredFunds.length > 0 ? (
            filteredFunds.map(fund => (
              <button
                key={fund.id}
                onClick={() => setSelectedFund(fund)}
                className="w-full bg-[#12121a] border border-white/10 rounded-xl p-4 md:p-6 hover:border-amber-500/50 transition-colors text-left min-h-[48px]"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-white font-semibold text-lg">{fund.name}</h3>
                      <span className="text-xs px-2 py-1 bg-white/10 text-gray-400 rounded">{fund.vintage}</span>
                      <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded">{fund.strategy}</span>
                    </div>
                    <div className="text-gray-500 text-sm">{fund.manager}</div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-8">
                    <div>
                      <div className="text-gray-500 text-xs">Commitment</div>
                      <div className="text-white font-medium">{formatCurrency(fund.commitment)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">NAV</div>
                      <div className="text-white font-medium">{formatCurrency(fund.nav)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">IRR</div>
                      <div className={`font-medium ${fund.irr >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {fund.irr.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">TVPI</div>
                      <div className="text-white font-medium">{fund.tvpi.toFixed(2)}x</div>
                    </div>
                  </div>
                </div>

                {/* Progress bar for contributed */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>{((fund.contributed / fund.commitment) * 100).toFixed(0)}% called</span>
                    <span>Last valued: {formatDate(fund.lastValuation)}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${(fund.contributed / fund.commitment) * 100}%` }}
                    />
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              No {tabs.find(t => t.id === activeTab)?.label} investments yet.
              <br />
              <button
                onClick={() => setShowAddInvestment(true)}
                className="text-amber-400 hover:text-amber-300 mt-2"
              >
                Add your first investment →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Investment Modal */}
      {showAddInvestment && (
        <div className="fixed inset-0 bg-black/80 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
          <div className="bg-[#12121a] border-t md:border border-white/10 rounded-t-2xl md:rounded-2xl p-6 md:p-8 w-full md:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white">Add Investment</h2>
              <button
                onClick={() => { setShowAddInvestment(false); resetAddInvestmentForm(); }}
                className="min-w-[48px] min-h-[48px] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Fund Name</label>
                <input
                  type="text"
                  value={newFundName}
                  onChange={(e) => setNewFundName(e.target.value)}
                  placeholder="e.g., Sequoia Capital Fund XIX"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Manager</label>
                <input
                  type="text"
                  value={newFundManager}
                  onChange={(e) => setNewFundManager(e.target.value)}
                  placeholder="e.g., Sequoia Capital"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Vintage Year</label>
                  <input
                    type="number"
                    value={newFundVintage}
                    onChange={(e) => setNewFundVintage(parseInt(e.target.value) || new Date().getFullYear())}
                    min={2000}
                    max={2030}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Strategy</label>
                  <select
                    value={newFundStrategy}
                    onChange={(e) => setNewFundStrategy(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                  >
                    <option value="">Select...</option>
                    {STRATEGIES[activeTab]?.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Commitment Amount ($)</label>
                <input
                  type="number"
                  value={newFundCommitment || ''}
                  onChange={(e) => setNewFundCommitment(parseFloat(e.target.value) || 0)}
                  placeholder="500000"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Initial Contribution ($)</label>
                <input
                  type="number"
                  value={newFundContribution || ''}
                  onChange={(e) => setNewFundContribution(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                />
                <p className="text-gray-500 text-xs mt-1">Leave 0 if no initial contribution</p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 mt-8">
              <button
                onClick={() => { setShowAddInvestment(false); resetAddInvestmentForm(); }}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors min-h-[48px]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddInvestment}
                disabled={!newFundName || !newFundManager || !newFundStrategy || !newFundCommitment}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-medium min-h-[48px]"
              >
                Add Investment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Capital Call Modal */}
      {showCapitalCall && (
        <div className="fixed inset-0 bg-black/80 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
          <div className="bg-[#12121a] border-t md:border border-white/10 rounded-t-2xl md:rounded-2xl p-6 md:p-8 w-full md:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white">Record Capital Call</h2>
              <button
                onClick={() => { setShowCapitalCall(false); resetCapitalCallForm(); }}
                className="min-w-[48px] min-h-[48px] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Select Fund</label>
                <select
                  value={callFundId}
                  onChange={(e) => setCallFundId(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                >
                  <option value="">Select a fund...</option>
                  {funds.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Call Amount ($)</label>
                <input
                  type="number"
                  value={callAmount || ''}
                  onChange={(e) => setCallAmount(parseFloat(e.target.value) || 0)}
                  placeholder="50000"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Due Date</label>
                <input
                  type="date"
                  value={callDueDate}
                  onChange={(e) => setCallDueDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 mt-8">
              <button
                onClick={() => { setShowCapitalCall(false); resetCapitalCallForm(); }}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors min-h-[48px]"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordCapitalCall}
                disabled={!callFundId || !callAmount || !callDueDate}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-medium min-h-[48px]"
              >
                Record Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Distribution Modal */}
      {showDistribution && (
        <div className="fixed inset-0 bg-black/80 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
          <div className="bg-[#12121a] border-t md:border border-white/10 rounded-t-2xl md:rounded-2xl p-6 md:p-8 w-full md:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white">Record Distribution</h2>
              <button
                onClick={() => { setShowDistribution(false); resetDistributionForm(); }}
                className="min-w-[48px] min-h-[48px] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Select Fund</label>
                <select
                  value={distFundId}
                  onChange={(e) => setDistFundId(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                >
                  <option value="">Select a fund...</option>
                  {funds.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Distribution Amount ($)</label>
                <input
                  type="number"
                  value={distAmount || ''}
                  onChange={(e) => setDistAmount(parseFloat(e.target.value) || 0)}
                  placeholder="100000"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Date</label>
                <input
                  type="date"
                  value={distDate}
                  onChange={(e) => setDistDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Type</label>
                <select
                  value={distType}
                  onChange={(e) => setDistType(e.target.value as typeof distType)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 min-h-[48px]"
                >
                  <option value="return_of_capital">Return of Capital</option>
                  <option value="gain">Gain</option>
                  <option value="dividend">Dividend</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 mt-8">
              <button
                onClick={() => { setShowDistribution(false); resetDistributionForm(); }}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors min-h-[48px]"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordDistribution}
                disabled={!distFundId || !distAmount || !distDate}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-medium min-h-[48px]"
              >
                Record Distribution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
