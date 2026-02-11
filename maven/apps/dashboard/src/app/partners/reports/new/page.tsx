'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, FileText, BarChart3, PieChart, TrendingUp } from 'lucide-react';

const REPORT_TYPES = [
  { id: 'performance', name: 'Performance Report', icon: TrendingUp, description: 'Returns, benchmarks, and attribution' },
  { id: 'portfolio', name: 'Portfolio Summary', icon: PieChart, description: 'Holdings, allocation, and analysis' },
  { id: 'tax', name: 'Tax Report', icon: FileText, description: 'Realized gains, losses, and projections' },
  { id: 'quarterly', name: 'Quarterly Review', icon: BarChart3, description: 'Comprehensive quarterly summary' },
];

export default function NewReportPage() {
  const searchParams = useSearchParams();
  const isDemoMode = searchParams.get('demo') === 'true';
  const demoHref = (href: string) => isDemoMode ? `${href}?demo=true` : href;

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <Link href={demoHref('/partners/reports')} className="text-gray-400 hover:text-white text-sm flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Reports
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Generate Report</h1>
        <p className="text-gray-400">Select report type and client</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {REPORT_TYPES.map((report) => (
          <button
            key={report.id}
            className="p-6 bg-[#12121a] border border-white/10 rounded-2xl hover:border-amber-500/50 transition-colors text-left group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                <report.icon className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">{report.name}</h3>
                <p className="text-gray-400 text-sm">{report.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
