'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import MavenChat from '@/app/components/MavenChat';

// Demo client data - in production, fetch from API based on params.id
const DEMO_CLIENTS: Record<string, any> = {
  '1': {
    id: '1',
    name: 'Robert & Linda Chen',
    email: 'robert.chen@email.com',
    aum: 1250000,
    riskTolerance: 'Moderate',
    investmentGoal: 'Retirement (2035)',
    age: 58,
    holdings: [
      { ticker: 'VTI', name: 'Vanguard Total Stock Market', shares: 1473, currentValue: 425000, costBasis: 380000, allocation: 34 },
      { ticker: 'VXUS', name: 'Vanguard Total International', shares: 2841, currentValue: 187500, costBasis: 195000, allocation: 15 },
      { ticker: 'BND', name: 'Vanguard Total Bond', shares: 3378, currentValue: 250000, costBasis: 245000, allocation: 20 },
      { ticker: 'AAPL', name: 'Apple Inc', shares: 682, currentValue: 156250, costBasis: 120000, allocation: 12.5 },
      { ticker: 'MSFT', name: 'Microsoft Corp', shares: 298, currentValue: 125000, costBasis: 100000, allocation: 10 },
      { ticker: 'Cash', name: 'Cash & Equivalents', shares: 106250, currentValue: 106250, costBasis: 106250, allocation: 8.5 },
    ],
    accounts: [
      { name: 'Joint Brokerage', type: 'taxable', value: 500000 },
      { name: 'Robert IRA', type: 'traditional_ira', value: 350000 },
      { name: 'Linda Roth IRA', type: 'roth_ira', value: 250000 },
      { name: 'Robert 401(k)', type: '401k', value: 150000 },
    ],
    taxInfo: {
      federalBracket: 0.32,
      stateBracket: 0.0575,
      filingStatus: 'married_filing_jointly',
    },
    socialSecurity: {
      robertPIA: 3200,
      lindaPIA: 1800,
      plannedStartAge: 67,
    },
  },
};

// Build a user profile object that MavenChat understands
function buildClientProfile(client: any) {
  return {
    // Basic info
    name: client.name,
    email: client.email,
    riskProfile: client.riskTolerance?.toLowerCase(),
    
    // Financial info
    financials: {
      netWorth: client.aum,
      totalRetirement: client.accounts
        .filter((a: any) => ['traditional_ira', 'roth_ira', '401k'].includes(a.type))
        .reduce((sum: number, a: any) => sum + a.value, 0),
      totalTaxable: client.accounts
        .filter((a: any) => a.type === 'taxable')
        .reduce((sum: number, a: any) => sum + a.value, 0),
    },
    
    // Holdings for context
    retirementAccounts: client.accounts
      .filter((a: any) => ['traditional_ira', 'roth_ira', '401k'].includes(a.type))
      .map((a: any) => ({
        name: a.name,
        accountType: a.type,
        balance: a.value,
        holdings: client.holdings.map((h: any) => ({
          ticker: h.ticker,
          name: h.name,
          shares: h.shares * (a.value / client.aum), // Proportional
          currentValue: h.currentValue * (a.value / client.aum),
          costBasis: h.costBasis * (a.value / client.aum),
        })),
      })),
    
    investmentAccounts: client.accounts
      .filter((a: any) => a.type === 'taxable')
      .map((a: any) => ({
        name: a.name,
        accountType: a.type,
        balance: a.value,
        holdings: client.holdings.map((h: any) => ({
          ticker: h.ticker,
          name: h.name,
          shares: h.shares * (a.value / client.aum),
          currentValue: h.currentValue * (a.value / client.aum),
          costBasis: h.costBasis * (a.value / client.aum),
        })),
      })),
    
    // Tax info
    taxInfo: client.taxInfo,
    
    // Goals
    goals: [
      {
        type: 'retirement',
        targetAge: 67,
        targetYear: 2035,
        monthlyIncome: 12000,
      },
    ],
    
    // Social Security
    socialSecurity: client.socialSecurity,
    
    // Advisor context
    advisorContext: {
      isAdvisorView: true,
      clientName: client.name,
      clientAge: client.age,
      investmentGoal: client.investmentGoal,
      riskTolerance: client.riskTolerance,
    },
  };
}

export default function ClientOracle() {
  const params = useParams();
  const clientId = params.id as string;
  
  // Get client data (in production, fetch from API)
  const client = DEMO_CLIENTS[clientId] || DEMO_CLIENTS['1'];
  const clientProfile = buildClientProfile(client);

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-white/10">
        <div className="flex items-center gap-2 text-sm mb-4">
          <Link href="/partners/clients" className="text-gray-400 hover:text-white min-h-[48px] flex items-center">
            Clients
          </Link>
          <span className="text-gray-600">/</span>
          <Link href={`/partners/clients/${clientId}`} className="text-gray-400 hover:text-white min-h-[48px] flex items-center">
            {client.name}
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-amber-500">Oracle</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">Oracle Chat</h1>
            <p className="text-gray-400 text-sm md:text-base">AI-powered analysis for {client.name}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-full text-sm">
              Advisor Mode
            </span>
            <span className="px-3 py-1.5 bg-white/10 text-gray-300 rounded-full text-sm">
              AUM: ${(client.aum / 1000000).toFixed(2)}M
            </span>
            <span className="px-3 py-1.5 bg-white/10 text-gray-300 rounded-full text-sm">
              {client.riskTolerance}
            </span>
          </div>
        </div>
      </div>

      {/* Chat Area - Full Height */}
      <div className="flex-1 overflow-hidden">
        <MavenChat 
          userProfile={clientProfile}
          mode="fullscreen"
          showContext={true}
          isDemoMode={true}
        />
      </div>

      {/* Quick Context Bar */}
      <div className="p-3 md:p-4 border-t border-white/10 bg-white/5">
        <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-400">
          <span className="font-medium text-white">Quick context:</span>
          <span>Goal: {client.investmentGoal}</span>
          <span>•</span>
          <span>Tax bracket: {Math.round(client.taxInfo.federalBracket * 100)}% fed</span>
          <span>•</span>
          <span>Holdings: {client.holdings.length} positions</span>
          <span>•</span>
          <span className="text-amber-400">
            Unrealized gain: ${((client.aum - client.holdings.reduce((s: number, h: any) => s + h.costBasis, 0)) / 1000).toFixed(0)}K
          </span>
        </div>
      </div>
    </div>
  );
}
