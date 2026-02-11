'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Search, Bell, AlertTriangle, Info, CheckCircle } from 'lucide-react';

const ALERT_TYPES = [
  { id: 'rebalance', name: 'Rebalance Needed', icon: '⚖️', description: 'Portfolio drift alert' },
  { id: 'tax', name: 'Tax Opportunity', icon: '💰', description: 'Tax-loss harvesting or conversion' },
  { id: 'risk', name: 'Risk Alert', icon: '⚠️', description: 'Concentration or risk threshold' },
  { id: 'market', name: 'Market Update', icon: '📈', description: 'Relevant market news' },
  { id: 'milestone', name: 'Milestone', icon: '🎉', description: 'Goal progress or achievement' },
  { id: 'reminder', name: 'General Reminder', icon: '🔔', description: 'Custom notification' },
];

export default function NewAlertPage() {
  const searchParams = useSearchParams();
  const isDemoMode = searchParams.get('demo') === 'true';
  const demoHref = (href: string) => isDemoMode ? `${href}?demo=true` : href;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href={demoHref('/partners/dashboard')} className="text-gray-400 hover:text-white text-sm flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Send Alert</h1>
        <p className="text-gray-400">Notify a client about something important</p>
      </div>

      <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 space-y-6">
        <div>
          <label className="block text-gray-400 text-sm mb-2">Client</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input type="text" placeholder="Search clients..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50" />
          </div>
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-3">Alert Type</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ALERT_TYPES.map((type) => (
              <button
                key={type.id}
                className="p-3 bg-white/5 border border-white/10 rounded-xl hover:border-amber-500/50 transition-colors text-left"
              >
                <span className="text-2xl mb-2 block">{type.icon}</span>
                <p className="text-white text-sm font-medium">{type.name}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-2">Message</label>
          <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" placeholder="Write your message to the client..." />
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-2">Priority</label>
          <div className="flex gap-3">
            <button className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:border-blue-500/50 hover:text-blue-400 transition-colors flex items-center justify-center gap-2">
              <Info className="w-4 h-4" /> Low
            </button>
            <button className="flex-1 py-3 bg-amber-500/20 border border-amber-500/50 rounded-xl text-amber-400 flex items-center justify-center gap-2">
              <Bell className="w-4 h-4" /> Normal
            </button>
            <button className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:border-red-500/50 hover:text-red-400 transition-colors flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4" /> High
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Link href={demoHref('/partners/dashboard')} className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white text-center transition-colors">
            Cancel
          </Link>
          <button className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 rounded-xl text-white font-medium transition-colors">
            Send Alert
          </button>
        </div>
      </div>
    </div>
  );
}
