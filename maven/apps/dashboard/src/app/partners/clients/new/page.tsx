'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, User, Mail, Phone, DollarSign } from 'lucide-react';

export default function NewClientPage() {
  const searchParams = useSearchParams();
  const isDemoMode = searchParams.get('demo') === 'true';
  const demoHref = (href: string) => isDemoMode ? `${href}?demo=true` : href;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href={demoHref('/partners/clients')} className="text-gray-400 hover:text-white text-sm flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Clients
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Add New Client</h1>
        <p className="text-gray-400">Enter client information to get started</p>
      </div>

      <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 space-y-6">
        {/* Basic Info */}
        <div>
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-gray-400" /> Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">First Name</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Last Name</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-gray-400" /> Contact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Email</label>
              <input type="email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">Phone</label>
              <input type="tel" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" />
            </div>
          </div>
        </div>

        {/* AUM */}
        <div>
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-gray-400" /> Assets
          </h2>
          <div>
            <label className="block text-gray-400 text-sm mb-2">Estimated AUM</label>
            <input type="text" placeholder="$500,000" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" />
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <Link href={demoHref('/partners/clients')} className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white text-center transition-colors">
            Cancel
          </Link>
          <button className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 rounded-xl text-white font-medium transition-colors">
            Add Client
          </button>
        </div>
      </div>
    </div>
  );
}
