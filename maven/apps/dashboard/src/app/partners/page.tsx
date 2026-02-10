'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Password for the deck
const DECK_PASSWORD = 'maven2026';

// Animated counter component
function AnimatedCounter({ end, duration = 2000, prefix = '', suffix = '', decimals = 0 }: { 
  end: number; 
  duration?: number; 
  prefix?: string; 
  suffix?: string;
  decimals?: number;
}) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
      else setCount(end);
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}
    </span>
  );
}

// Section component with scroll animation
function Section({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div 
      ref={ref}
      className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
    >
      {children}
    </div>
  );
}

export default function PartnersPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [selectedScenario, setSelectedScenario] = useState<'lean' | 'growth' | 'scale'>('growth');
  const router = useRouter();

  // Check for stored auth
  useEffect(() => {
    const stored = sessionStorage.getItem('partners-auth');
    if (stored === 'true') setAuthenticated(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === DECK_PASSWORD) {
      setAuthenticated(true);
      sessionStorage.setItem('partners-auth', 'true');
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  // Economics data
  const scenarios = {
    lean: {
      name: 'Lean Launch',
      clients: '5-15',
      aum: 10,
      feePercent: 1.0,
      revenue: 100000,
      expenses: 39000,
      netIncome: 61000,
      margin: 61,
    },
    growth: {
      name: 'Growth Phase',
      clients: '50',
      aum: 50,
      feePercent: 0.9,
      revenue: 450000,
      expenses: 139000,
      netIncome: 311000,
      margin: 69,
    },
    scale: {
      name: 'Scale (Post-Migration)',
      clients: '300+',
      aum: 250,
      feePercent: 0.8,
      revenue: 2000000,
      expenses: 485000,
      netIncome: 1515000,
      margin: 76,
    },
  };

  const currentScenario = scenarios[selectedScenario];

  // Password gate
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔐</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Maven Partners</h1>
            <p className="text-gray-400">Strategic Launch Plan — Confidential</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                autoFocus
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-500 hover:to-purple-500 transition"
            >
              Access Deck
            </button>
          </form>
          
          <p className="text-center text-gray-500 text-sm mt-6">
            <Link href="/" className="text-indigo-400 hover:text-indigo-300">← Back to Maven</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-purple-900/20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <Section>
            <p className="text-indigo-400 text-sm font-medium tracking-wider uppercase mb-4">Strategic Launch Plan — February 2026</p>
            <h1 className="text-5xl sm:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
              Maven Partners
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              One advisor. AI-powered intelligence. Institutional-quality service for 100+ clients.
            </p>
          </Section>
          
          <Section delay={300}>
            <div className="flex flex-wrap justify-center gap-8 mt-12">
              <div className="text-center">
                <p className="text-4xl font-bold text-indigo-400"><AnimatedCounter end={76} suffix="%" /></p>
                <p className="text-sm text-gray-500">Operating Margin</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-emerald-400">$<AnimatedCounter end={1.5} decimals={1} suffix="M" /></p>
                <p className="text-sm text-gray-500">Net Income at Scale</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-purple-400"><AnimatedCounter end={300} suffix="+" /></p>
                <p className="text-sm text-gray-500">Client Capacity</p>
              </div>
            </div>
          </Section>
          
          <Section delay={500}>
            <div className="mt-16 animate-bounce">
              <span className="text-gray-500">↓ Scroll to explore</span>
            </div>
          </Section>
        </div>
      </section>

      {/* The Thesis */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <Section>
            <p className="text-indigo-400 text-sm font-medium tracking-wider uppercase mb-4">The Thesis</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-8">
              The traditional wealth management model is being disrupted.
            </h2>
          </Section>
          
          <Section delay={200}>
            <div className="prose prose-invert prose-lg max-w-none">
              <p className="text-gray-300 text-lg leading-relaxed">
                Where advisors manually manage client relationships across disconnected tools — 
                this model cannot compete with AI and automation. <strong className="text-white">Maven Partners 
                will prove that one advisor, augmented by Maven's intelligence platform, can deliver 
                institutional-quality service</strong> to 100+ clients at lower cost, higher personalization, 
                and with better outcomes than legacy firms.
              </p>
            </div>
          </Section>

          <Section delay={400}>
            <div className="grid sm:grid-cols-2 gap-6 mt-12">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <span className="text-3xl mb-4 block">💰</span>
                <h3 className="text-lg font-semibold mb-2">Generational Wealth Transfer</h3>
                <p className="text-gray-400 text-sm">Trillions moving to investors who expect digitally-native experiences, not quarterly paper statements.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <span className="text-3xl mb-4 block">🤖</span>
                <h3 className="text-lg font-semibold mb-2">AI & Automation</h3>
                <p className="text-gray-400 text-sm">Enabling a single advisor to service client loads that previously required entire teams.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <span className="text-3xl mb-4 block">🏃</span>
                <h3 className="text-lg font-semibold mb-2">RIA Independence Movement</h3>
                <p className="text-gray-400 text-sm">Advisors want control over their tech stack, client experience, and investment philosophy.</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <span className="text-3xl mb-4 block">📉</span>
                <h3 className="text-lg font-semibold mb-2">Dying Wholesaler Model</h3>
                <p className="text-gray-400 text-sm">Traditional distribution faces structural decline as advisors adopt self-service AI tools.</p>
              </div>
            </div>
          </Section>
        </div>
      </section>

      {/* Maven's Edge */}
      <section className="py-24 px-4 bg-gradient-to-b from-indigo-900/10 to-transparent">
        <div className="max-w-5xl mx-auto">
          <Section>
            <p className="text-indigo-400 text-sm font-medium tracking-wider uppercase mb-4 text-center">Competitive Advantage</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-center">
              The Palantir of Wealth
            </h2>
            <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
              AI-powered intelligence combining market analytics, portfolio intelligence, and scenario modeling into a unified experience.
            </p>
          </Section>

          <div className="grid md:grid-cols-2 gap-6">
            <Section delay={100}>
              <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 border border-red-500/30 rounded-2xl p-6 h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Fragility Index™</h3>
                <p className="text-gray-400">Proprietary market stress detection that identifies portfolio vulnerabilities before they materialize. Early warning signals to both advisor and clients.</p>
              </div>
            </Section>
            
            <Section delay={200}>
              <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-500/30 rounded-2xl p-6 h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🔮</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">What-If Engine</h3>
                <p className="text-gray-400">Real-time scenario modeling. Explore the impact of market events, life changes, or allocation shifts on portfolio outcomes instantly.</p>
              </div>
            </Section>
            
            <Section delay={300}>
              <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border border-emerald-500/30 rounded-2xl p-6 h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">💵</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Tax Intelligence</h3>
                <p className="text-gray-400">Automated tax optimization: harvesting opportunities, Roth conversion analysis, asset location strategies — all surfaces automatically.</p>
              </div>
            </Section>
            
            <Section delay={400}>
              <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-2xl p-6 h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">🧠</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Oracle AI Assistant</h3>
                <p className="text-gray-400">Natural language interface. Clients ask questions about their portfolio, financial plan, and market conditions in plain English.</p>
              </div>
            </Section>
          </div>

          <Section delay={500}>
            <div className="mt-12 bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
              <p className="text-gray-400 mb-2">Built with Project Pantheon — Multi-Agent AI Development</p>
              <p className="text-2xl font-bold text-white">
                <AnimatedCounter end={20} suffix="+" /> features shipped in 4-hour sprints @ $<AnimatedCounter end={50} />–$<AnimatedCounter end={200} />/day
              </p>
            </div>
          </Section>
        </div>
      </section>

      {/* Custodial Strategy */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <Section>
            <p className="text-indigo-400 text-sm font-medium tracking-wider uppercase mb-4 text-center">Custodial Strategy</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center">
              Dual-Custodian Approach
            </h2>
          </Section>

          <div className="grid md:grid-cols-2 gap-8">
            <Section delay={100}>
              <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-2 border-indigo-500/50 rounded-2xl p-6 relative">
                <div className="absolute -top-3 left-6 px-3 py-1 bg-indigo-500 text-white text-xs font-bold rounded-full">
                  PRIMARY
                </div>
                <h3 className="text-2xl font-bold mt-4 mb-4">Altruist</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">✓</span>
                    <span><strong>Developer-First:</strong> Open API, sandbox environment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">✓</span>
                    <span><strong>All-in-One:</strong> Trading, rebalancing, billing, reporting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">✓</span>
                    <span><strong>Cost Efficient:</strong> First 100 accounts free</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">✓</span>
                    <span><strong>No Retail Conflict:</strong> Will never compete for your clients</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">✓</span>
                    <span><strong>AI Aligned:</strong> Own AI assistant (Hazel) shows commitment</span>
                  </li>
                </ul>
              </div>
            </Section>

            <Section delay={200}>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative">
                <div className="absolute -top-3 left-6 px-3 py-1 bg-gray-600 text-white text-xs font-bold rounded-full">
                  SECONDARY
                </div>
                <h3 className="text-2xl font-bold mt-4 mb-4">Charles Schwab</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span><strong>Brand Trust:</strong> Industry gold standard for clients</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span><strong>Product Suite:</strong> Banking, lending, institutional trading</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span><strong>API Access:</strong> OpenView Gateway (invite-only)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span><strong>Client Comfort:</strong> For older/conservative clients</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-gray-500 mt-1">⚠</span>
                    <span className="text-gray-400"><strong>Note:</strong> Has retail division (potential conflict)</span>
                  </li>
                </ul>
              </div>
            </Section>
          </div>

          <Section delay={300}>
            <p className="text-center text-gray-400 mt-8">
              ~30% of RIAs now use multiple custodians — this is becoming industry standard
            </p>
          </Section>
        </div>
      </section>

      {/* Interactive Economics */}
      <section className="py-24 px-4 bg-gradient-to-b from-purple-900/10 to-transparent">
        <div className="max-w-5xl mx-auto">
          <Section>
            <p className="text-indigo-400 text-sm font-medium tracking-wider uppercase mb-4 text-center">The Economics</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-center">
              What Do You Actually Take Home?
            </h2>
            <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
              Comprehensive P&L at various AUM levels. Select a scenario to explore.
            </p>
          </Section>

          <Section delay={200}>
            {/* Scenario Selector */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {(Object.keys(scenarios) as Array<keyof typeof scenarios>).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedScenario(key)}
                  className={`px-6 py-3 rounded-xl font-medium transition ${
                    selectedScenario === key
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {scenarios[key].name}
                </button>
              ))}
            </div>

            {/* Economics Card */}
            <div className="bg-[#12121a] border border-white/10 rounded-3xl p-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold">{currentScenario.name}</h3>
                  <p className="text-gray-400">{currentScenario.clients} clients • ${currentScenario.aum}M AUM</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Fee Rate</p>
                  <p className="text-xl font-bold text-indigo-400">{currentScenario.feePercent.toFixed(2)}%</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-gray-400">Gross Advisory Revenue</span>
                  <span className="text-xl font-semibold text-emerald-400">
                    ${currentScenario.revenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-gray-400">Total Operating Expenses</span>
                  <span className="text-xl font-semibold text-red-400">
                    (${currentScenario.expenses.toLocaleString()})
                  </span>
                </div>
                <div className="flex justify-between items-center py-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl px-4 -mx-4">
                  <span className="text-white font-semibold">Net Income (Before Tax)</span>
                  <span className="text-3xl font-bold text-white">
                    ${currentScenario.netIncome.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center">
                <span className="text-gray-400">Operating Margin</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${currentScenario.margin}%` }}
                    />
                  </div>
                  <span className="text-xl font-bold text-indigo-400">{currentScenario.margin}%</span>
                </div>
              </div>
            </div>
          </Section>

          <Section delay={400}>
            <div className="mt-12 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 max-w-2xl mx-auto">
              <p className="text-amber-400 font-medium mb-2">⚡ The Pantheon Advantage</p>
              <p className="text-gray-300">
                A comparable traditional RIA at $250M AUM would employ 5–8 people with 30–40% margins. 
                Maven's AI-first model fundamentally changes the cost structure — achieving <strong className="text-white">76% margins</strong> at scale.
              </p>
            </div>
          </Section>
        </div>
      </section>

      {/* Engineering Comparison */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <Section>
            <p className="text-indigo-400 text-sm font-medium tracking-wider uppercase mb-4 text-center">Engineering Economics</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center">
              Why You Can Delay Hiring
            </h2>
          </Section>

          <Section delay={200}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-4 text-gray-400 font-medium">Metric</th>
                    <th className="text-center py-4 px-4 text-gray-400 font-medium">Traditional Startup</th>
                    <th className="text-center py-4 px-4 text-indigo-400 font-medium">Maven (Pantheon)</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-white/5">
                    <td className="py-4 px-4">Engineers needed for MVP</td>
                    <td className="py-4 px-4 text-center">3–5 full-time</td>
                    <td className="py-4 px-4 text-center text-emerald-400 font-semibold">0 (AI agents)</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-4 px-4">Monthly engineering burn</td>
                    <td className="py-4 px-4 text-center">$40,000–$80,000</td>
                    <td className="py-4 px-4 text-center text-emerald-400 font-semibold">$1,500–$6,000</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-4 px-4">Time to MVP</td>
                    <td className="py-4 px-4 text-center">6–12 months</td>
                    <td className="py-4 px-4 text-center text-emerald-400 font-semibold">4–8 weeks</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-4 px-4">Annual eng cost (Year 1)</td>
                    <td className="py-4 px-4 text-center">$480K–$960K</td>
                    <td className="py-4 px-4 text-center text-emerald-400 font-semibold">$18K–$72K</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-4">First human hire needed</td>
                    <td className="py-4 px-4 text-center">Before launch</td>
                    <td className="py-4 px-4 text-center text-emerald-400 font-semibold">Month 4–6 (contract)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section delay={400}>
            <p className="text-center text-gray-400 mt-8 max-w-2xl mx-auto">
              This cost structure is what makes Maven Partners viable as a bootstrapped launch. 
              No venture capital needed — <strong className="text-white">Pantheon IS the engineering team</strong> for Phases 0–2.
            </p>
          </Section>
        </div>
      </section>

      {/* Phased Timeline */}
      <section className="py-24 px-4 bg-gradient-to-b from-indigo-900/10 to-transparent">
        <div className="max-w-5xl mx-auto">
          <Section>
            <p className="text-indigo-400 text-sm font-medium tracking-wider uppercase mb-4 text-center">Execution Roadmap</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center">
              The Four Phases
            </h2>
          </Section>

          <div className="space-y-8">
            {[
              {
                phase: 0,
                name: 'Foundation',
                timeline: 'Now – Month 2',
                color: 'from-gray-500 to-gray-600',
                items: ['Family conversations & alignment', 'BridgeFT sandbox access', 'Altruist developer outreach', 'Entity planning with RIA attorney', 'Financial runway analysis'],
              },
              {
                phase: 1,
                name: 'Build & Seed',
                timeline: 'Months 2–4',
                color: 'from-blue-500 to-cyan-500',
                items: ['Maven-Custodian integration', 'Client Portal MVP', 'Seed client identification (5–15)', 'Compliance filing (Form ADV)', 'Custodial onboarding'],
              },
              {
                phase: 2,
                name: 'Soft Launch',
                timeline: 'Months 4–6',
                color: 'from-indigo-500 to-purple-500',
                items: ['Onboard seed clients', 'Sandbox → Production', 'Platform stress testing', 'Weekly feedback loops', 'Compliance self-audit'],
              },
              {
                phase: 3,
                name: 'Growth & Visibility',
                timeline: 'Months 6–12',
                color: 'from-purple-500 to-pink-500',
                items: ['LinkedIn & social media launch', 'Active client acquisition (25–50)', 'Father\'s team migration planning', 'DC market establishment', 'Feature expansion'],
              },
              {
                phase: 4,
                name: 'Scale',
                timeline: 'Months 12–24',
                color: 'from-amber-500 to-orange-500',
                items: ['Client book migration (300–500)', 'Team expansion', 'SaaS exploration', 'Institutional partnerships', 'Category leadership'],
              },
            ].map((phase, idx) => (
              <Section key={phase.phase} delay={idx * 100}>
                <div className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${phase.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {phase.phase}
                    </div>
                    {idx < 4 && <div className="w-0.5 h-full bg-gradient-to-b from-white/20 to-transparent mt-2" />}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="flex items-baseline gap-3 mb-3">
                      <h3 className="text-xl font-bold">{phase.name}</h3>
                      <span className="text-sm text-gray-500">{phase.timeline}</span>
                    </div>
                    <ul className="grid sm:grid-cols-2 gap-2">
                      {phase.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-400 text-sm">
                          <span className="text-emerald-400">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Section>
            ))}
          </div>
        </div>
      </section>

      {/* 3-Year Vision */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Section>
            <p className="text-indigo-400 text-sm font-medium tracking-wider uppercase mb-4">The North Star</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-12">
              3-Year Vision
            </h2>
          </Section>

          <div className="grid md:grid-cols-3 gap-6">
            <Section delay={100}>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full">
                <div className="text-4xl font-bold text-indigo-400 mb-2">Year 1</div>
                <h3 className="text-xl font-semibold mb-3">Prove It</h3>
                <p className="text-gray-400 text-sm">
                  Launch Maven Partners. 25–50 clients. Demonstrate that one advisor + Maven rivals firms with 10× the headcount.
                </p>
              </div>
            </Section>
            
            <Section delay={200}>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full">
                <div className="text-4xl font-bold text-purple-400 mb-2">Year 2</div>
                <h3 className="text-xl font-semibold mb-3">Scale It</h3>
                <p className="text-gray-400 text-sm">
                  Migrate family book (300–500 households). Cross $100M AUM. Begin licensing conversations with other RIAs.
                </p>
              </div>
            </Section>
            
            <Section delay={300}>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full">
                <div className="text-4xl font-bold text-amber-400 mb-2">Year 3</div>
                <h3 className="text-xl font-semibold mb-3">Platform It</h3>
                <p className="text-gray-400 text-sm">
                  Launch Maven as SaaS. Transition from advisory practice to wealth tech company. Revenue multiple: 2–3× → 10–20×.
                </p>
              </div>
            </Section>
          </div>
        </div>
      </section>

      {/* The Why */}
      <section className="py-24 px-4 bg-gradient-to-b from-purple-900/10 to-transparent">
        <div className="max-w-3xl mx-auto text-center">
          <Section>
            <h2 className="text-3xl sm:text-4xl font-bold mb-8">
              Why This Matters
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              40 million American households with $250K–$2M in investable assets are underserved. 
              Too small for wirehouses to care about. Too complex for robo-advisors.
            </p>
            <p className="text-xl text-gray-300 leading-relaxed">
              <strong className="text-white">Maven Partners exists to serve exactly this market.</strong> 
              {" "}Democratizing access to institutional-quality intelligence that has historically been reserved for the ultra-wealthy.
            </p>
          </Section>

          <Section delay={300}>
            <div className="mt-16 p-8 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-3xl">
              <p className="text-2xl font-medium text-white italic">
                "The window is open. The structural shift is real. The question is not whether this can work—it's whether you execute the sequence correctly."
              </p>
            </div>
          </Section>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <Section>
            <h2 className="text-3xl font-bold mb-6">Ready to Execute?</h2>
            <p className="text-gray-400 mb-8">
              This plan provides the roadmap. The next step is yours.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/demo" 
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-500 hover:to-purple-500 transition"
              >
                Explore Maven Demo
              </Link>
              <Link 
                href="/vision" 
                className="px-8 py-4 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition border border-white/10"
              >
                View Vision Deck
              </Link>
            </div>
          </Section>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            Maven Partners Strategic Launch Plan — Confidential
          </p>
          <p className="text-gray-500 text-sm">
            February 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
