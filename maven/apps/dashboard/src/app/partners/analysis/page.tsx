'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Search, TrendingUp, PieChart, Shield, GitCompare } from 'lucide-react';

export default function AnalysisPage() {
  const searchParams = useSearchParams();
  const isDemoMode = searchParams.get('demo') === 'true';
  const demoHref = (href: string) => isDemoMode ? `${href}?demo=true` : href;

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <Link href={demoHref('/partners/dashboard')} className="text-gray-400 hover:text-white text-sm flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Run Analysis</h1>
        <p className="text-gray-400">Select a client and analysis type</p>
      </div>

      {/* Client Search */}
      <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 mb-6">
        <label className="block text-white font-medium mb-3">Select Client</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search clients..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>

      {/* Analysis Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button className="p-6 bg-[#12121a] border border-white/10 rounded-2xl hover:border-amber-500/50 transition-colors text-left group">
          <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-500/30 transition-colors">
            <PieChart className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="text-white font-semibold mb-2">Portfolio Analysis</h3>
          <p className="text-gray-400 text-sm">Holdings, allocation, factor exposure, and overlap detection</p>
        </button>

        <button className="p-6 bg-[#12121a] border border-white/10 rounded-2xl hover:border-emerald-500/50 transition-colors text-left group">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500/30 transition-colors">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-white font-semibold mb-2">Tax Analysis</h3>
          <p className="text-gray-400 text-sm">Tax-loss harvesting, Roth conversion, and year-end planning</p>
        </button>

        <button className="p-6 bg-[#12121a] border border-white/10 rounded-2xl hover:border-blue-500/50 transition-colors text-left group">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-white font-semibold mb-2">Risk Analysis</h3>
          <p className="text-gray-400 text-sm">Stress testing, concentration risk, and scenario modeling</p>
        </button>

        <Link 
          href={demoHref('/partners/analysis/divergence')} 
          className="p-6 bg-[#12121a] border border-white/10 rounded-2xl hover:border-purple-500/50 transition-colors text-left group"
        >
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
            <GitCompare className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-white font-semibold mb-2">Divergence Scanner</h3>
          <p className="text-gray-400 text-sm">Find where social sentiment disagrees with analyst consensus</p>
          <span className="inline-flex items-center gap-1 mt-2 text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full">
            ✨ Athena-Powered
          </span>
        </Link>
      </div>
    </div>
  );
}
