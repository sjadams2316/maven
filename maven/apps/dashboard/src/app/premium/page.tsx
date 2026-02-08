'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import WealthPulse from '../components/WealthPulse';
import TiltCard from '../components/TiltCard';
import GlowCard from '../components/GlowCard';
import SparklineChart from '../components/SparklineChart';
import { AnimatedCurrency, AnimatedPercent } from '../components/AnimatedNumber';
import FloatingOrb from '../components/FloatingOrb';

const HOLDINGS = [
  { symbol: 'TAO', name: 'Bittensor', value: 684000, change: 4.78, sparkline: [600, 620, 610, 650, 680, 670, 684] },
  { symbol: 'CIFR', name: 'Cipher Mining', value: 78000, change: -2.3, sparkline: [85, 82, 80, 78, 76, 77, 78] },
  { symbol: 'IREN', name: 'Iris Energy', value: 52000, change: 3.1, sparkline: [48, 49, 50, 51, 50, 51, 52] },
  { symbol: 'VTI', name: 'Vanguard Total Stock', value: 185000, change: 1.2, sparkline: [180, 181, 182, 183, 184, 184, 185] },
];

const INSIGHTS = [
  { icon: '💰', title: 'Tax savings opportunity', desc: '$4,200 in harvestable losses', priority: 'high' },
  { icon: '📊', title: 'Portfolio drift detected', desc: 'Tech overweight by 8%', priority: 'medium' },
  { icon: '🎯', title: 'Goal milestone reached', desc: '40% to retirement!', priority: 'celebration' },
];

export default function PremiumDashboard() {
  const [mounted, setMounted] = useState(false);
  const [marketData, setMarketData] = useState<any>({});
  
  useEffect(() => {
    setMounted(true);
    
    // Fetch live market data
    const fetchMarket = async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,bittensor&vs_currencies=usd&include_24hr_change=true'
        );
        if (response.ok) {
          const data = await response.json();
          setMarketData(data);
        }
      } catch (e) {
        console.error('Market fetch error:', e);
      }
    };
    
    fetchMarket();
    const interval = setInterval(fetchMarket, 60000);
    return () => clearInterval(interval);
  }, []);
  
  if (!mounted) return null;
  
  const btcPrice = marketData.bitcoin?.usd || 0;
  const taoPrice = marketData.bittensor?.usd || 0;
  
  return (
    <div className="min-h-screen bg-[#0a0a0f] relative">
      {/* Gradient orbs in background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
      </div>
      
      <Header />
      
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
            Good morning, Sam 👋
          </h1>
          <p className="text-gray-400">
            Your wealth grew <span className="text-emerald-400">+$12,400</span> since yesterday
          </p>
        </div>
        
        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Wealth Pulse */}
          <div className="lg:col-span-2">
            <WealthPulse
              netWorth={1150000}
              dayChange={12400}
              dayChangePercent={1.09}
              weekData={[1100000, 1110000, 1105000, 1120000, 1135000, 1142000, 1150000]}
              monthData={[1050000, 1080000, 1070000, 1095000, 1110000, 1120000, 1125000, 1118000, 1135000, 1142000, 1148000, 1150000]}
            />
            
            {/* Holdings */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Top Holdings</h2>
                <Link href="/portfolio-lab" className="text-sm text-indigo-400 hover:text-indigo-300">
                  View all →
                </Link>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {HOLDINGS.map((holding, idx) => (
                  <TiltCard key={idx} maxTilt={8} glare={true}>
                    <GlowCard glowColor={holding.change >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}>
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg font-bold text-white">{holding.symbol}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                holding.change >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                {holding.change >= 0 ? '+' : ''}{holding.change}%
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">{holding.name}</p>
                          </div>
                          <SparklineChart
                            data={holding.sparkline}
                            width={80}
                            height={32}
                            color="auto"
                            strokeWidth={2}
                            showArea={false}
                          />
                        </div>
                        
                        <AnimatedCurrency
                          value={holding.value}
                          className="text-2xl font-bold text-white"
                        />
                      </div>
                    </GlowCard>
                  </TiltCard>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Live Market */}
            <GlowCard glowColor="rgba(99, 102, 241, 0.3)">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <h3 className="font-semibold text-white">Live Market</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">₿</span>
                      <span className="text-white font-medium">Bitcoin</span>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">
                        {btcPrice > 0 ? `$${btcPrice.toLocaleString()}` : '...'}
                      </p>
                      {marketData.bitcoin?.usd_24h_change && (
                        <p className={`text-xs ${marketData.bitcoin.usd_24h_change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {marketData.bitcoin.usd_24h_change >= 0 ? '+' : ''}{marketData.bitcoin.usd_24h_change.toFixed(2)}%
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🧠</span>
                      <span className="text-white font-medium">Bittensor</span>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">
                        {taoPrice > 0 ? `$${taoPrice.toLocaleString()}` : '...'}
                      </p>
                      {marketData.bittensor?.usd_24h_change && (
                        <p className={`text-xs ${marketData.bittensor.usd_24h_change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {marketData.bittensor.usd_24h_change >= 0 ? '+' : ''}{marketData.bittensor.usd_24h_change.toFixed(2)}%
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </GlowCard>
            
            {/* Insights */}
            <div>
              <h3 className="font-semibold text-white mb-4">Insights</h3>
              <div className="space-y-3">
                {INSIGHTS.map((insight, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all hover:scale-[1.02] cursor-pointer ${
                      insight.priority === 'high' 
                        ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50'
                        : insight.priority === 'celebration'
                        ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{insight.icon}</span>
                      <div>
                        <p className="font-medium text-white">{insight.title}</p>
                        <p className="text-sm text-gray-400">{insight.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Goals Preview */}
            <GlowCard glowColor="rgba(139, 92, 246, 0.3)">
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white">Goals</h3>
                  <Link href="/goals" className="text-xs text-indigo-400">View all →</Link>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">🏖️ Retirement</span>
                      <span className="text-white">40%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[40%] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">🏠 Beach House</span>
                      <span className="text-white">21%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[21%] bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </GlowCard>
          </div>
        </div>
      </main>
      
      {/* Floating Oracle Orb */}
      <FloatingOrb
        href="/oracle"
        icon="🔮"
        label="Ask Maven Oracle"
        pulseColor="purple"
        size="lg"
      />
    </div>
  );
}
