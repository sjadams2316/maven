'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Search, Calendar, Clock } from 'lucide-react';

export default function NewMeetingPage() {
  const searchParams = useSearchParams();
  const isDemoMode = searchParams.get('demo') === 'true';
  const demoHref = (href: string) => isDemoMode ? `${href}?demo=true` : href;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href={demoHref('/partners/dashboard')} className="text-gray-400 hover:text-white text-sm flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Log Meeting</h1>
        <p className="text-gray-400">Record meeting notes and action items</p>
      </div>

      <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 space-y-6">
        <div>
          <label className="block text-gray-400 text-sm mb-2">Client</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input type="text" placeholder="Search clients..." className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              <Calendar className="w-4 h-4 inline mr-1" /> Date
            </label>
            <input type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">
              <Clock className="w-4 h-4 inline mr-1" /> Duration
            </label>
            <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50">
              <option>15 minutes</option>
              <option>30 minutes</option>
              <option>45 minutes</option>
              <option>1 hour</option>
              <option>1.5 hours</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-2">Meeting Type</label>
          <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50">
            <option>Quarterly Review</option>
            <option>Portfolio Update</option>
            <option>Financial Planning</option>
            <option>Tax Planning</option>
            <option>Estate Planning</option>
            <option>Initial Consultation</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-2">Meeting Notes</label>
          <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" placeholder="Discussion topics, client concerns, decisions made..." />
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-2">Action Items</label>
          <textarea rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" placeholder="Follow-up tasks, one per line..." />
        </div>

        <div className="flex gap-3 pt-4">
          <Link href={demoHref('/partners/dashboard')} className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white text-center transition-colors">
            Cancel
          </Link>
          <button className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 rounded-xl text-white font-medium transition-colors">
            Save Meeting
          </button>
        </div>
      </div>
    </div>
  );
}
