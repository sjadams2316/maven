'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Clock, ArrowLeft } from 'lucide-react';

const DEMO_ACTIVITY = [
  { id: 1, action: 'Generated Q4 report', client: 'Robert Chen', time: '2 hours ago', icon: '📄', type: 'report' },
  { id: 2, action: 'Ran portfolio analysis', client: 'Morrison Trust', time: '4 hours ago', icon: '📊', type: 'analysis' },
  { id: 3, action: 'Recorded trade', client: 'Jennifer Walsh', time: 'Yesterday', icon: '💰', type: 'trade' },
  { id: 4, action: 'Logged meeting notes', client: 'Michael Thompson', time: 'Yesterday', icon: '📞', type: 'meeting' },
  { id: 5, action: 'Sent rebalance alert', client: 'Sarah Park', time: '2 days ago', icon: '🔔', type: 'alert' },
  { id: 6, action: 'Updated risk profile', client: 'Robert Chen', time: '2 days ago', icon: '⚠️', type: 'risk' },
  { id: 7, action: 'Reviewed tax strategy', client: 'Jennifer Walsh', time: '3 days ago', icon: '📋', type: 'tax' },
  { id: 8, action: 'Completed compliance check', client: 'Morrison Trust', time: '3 days ago', icon: '✅', type: 'compliance' },
  { id: 9, action: 'Generated performance report', client: 'Sarah Park', time: '4 days ago', icon: '📈', type: 'report' },
  { id: 10, action: 'Processed RMD distribution', client: 'Michael Thompson', time: '5 days ago', icon: '💵', type: 'distribution' },
];

export default function ActivityPage() {
  const searchParams = useSearchParams();
  const isDemoMode = searchParams.get('demo') === 'true';
  const demoHref = (href: string) => isDemoMode ? `${href}?demo=true` : href;

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <Link href={demoHref('/partners/dashboard')} className="text-gray-400 hover:text-white text-sm flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Activity Log</h1>
        <p className="text-gray-400">Recent actions across all clients</p>
      </div>

      <div className="bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" />
          <span className="text-white font-medium">Last 30 Days</span>
        </div>
        <div className="divide-y divide-white/5">
          {DEMO_ACTIVITY.map((item) => (
            <div key={item.id} className="p-4 hover:bg-white/5 transition-colors">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-white">{item.action}</p>
                  <p className="text-gray-500 text-sm">{item.client}</p>
                </div>
                <span className="text-gray-500 text-sm">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
