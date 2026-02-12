'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Header from '@/app/components/Header';
import SignalConsensus from '@/components/SignalConsensus';

export default function SignalConsensusPage() {
  const params = useParams();
  const symbol = (params.symbol as string)?.toUpperCase() || '';

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-4 mb-6">
          <Link 
            href="/demo"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <span className="text-gray-600">|</span>
          <Link
            href={`/stock-research?symbol=${symbol}`}
            className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View Full Research
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Signal Consensus: {symbol}
          </h1>
          <p className="text-gray-400">
            All Athena intelligence sources synthesized into a unified view. 
            See what Twitter, Reddit, trading signals, and forecasts are saying.
          </p>
        </div>

        {/* Main Component */}
        <SignalConsensus symbol={symbol} showHeader={false} />

        {/* Additional Context */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          {/* What is this? */}
          <div className="bg-[#12121a] rounded-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-3">What is Signal Consensus?</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Signal Consensus combines multiple intelligence sources into a single, 
              weighted assessment. Instead of checking Twitter, then Reddit, then 
              analyst reports separately, Maven's Athena brain does it all and tells 
              you what it means.
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>Twitter sentiment (via xAI)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                <span>Reddit buzz (via Desearch)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <span>Trading signals (via Vanta)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>Price forecasts (via Precog)</span>
              </div>
            </div>
          </div>

          {/* How to use */}
          <div className="bg-[#12121a] rounded-xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-3">How to Use This</h3>
            <ul className="text-gray-400 text-sm space-y-3 leading-relaxed">
              <li className="flex gap-2">
                <span className="text-green-400 font-bold">1.</span>
                <span>
                  <strong className="text-white">Check Direction:</strong> Is the overall 
                  consensus bullish, bearish, or neutral?
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-400 font-bold">2.</span>
                <span>
                  <strong className="text-white">Verify Confidence:</strong> Higher confidence 
                  means more sources agree with stronger signals.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-400 font-bold">3.</span>
                <span>
                  <strong className="text-white">Watch for Disagreements:</strong> When sources 
                  conflict, it's a signal to dig deeper before acting.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-400 font-bold">4.</span>
                <span>
                  <strong className="text-white">Review Alerts:</strong> Proactive notifications 
                  highlight what needs attention.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <p className="text-yellow-200 text-sm">
            <strong>Note:</strong> Signal Consensus is for informational purposes only. 
            Social sentiment and trading signals can change rapidly and should not be 
            the sole basis for investment decisions. Always do your own research.
          </p>
        </div>
      </main>
    </div>
  );
}
