# MAVEN MASTER PLAN
## The Financial Operating System for Everyone

*Version 1.0 — February 6, 2026*
*Sam Adams & Eli*

---

# PART I: THE OPPORTUNITY

## Why Now

We're at the intersection of seven macro trends converging simultaneously for the first time:

| Trend | Data Point | Implication |
|-------|------------|-------------|
| **Archaic Infrastructure** | 43% of banks still run on 60-year-old COBOL | Incumbents can't move fast |
| **Generational Shift** | 41% of Gen Z/Millennials would let AI manage investments | Users want AI-native |
| **Wealth Transfer** | $124 trillion moving to younger generations | New money choosing new platforms |
| **Advisor Shortage** | 100,000 advisor shortage by 2034 | Demand for automated solutions |
| **Tokenization** | $16+ trillion tokenized assets by 2030 | New asset classes need new rails |
| **Tax Optimization Gap** | 1-2% annual alpha left on table | Clear value proposition |
| **AI Cost Collapse** | 1,000x cost decline in 3 years | AI-native now economically viable |

**The platforms built in 2026-2027 will define wealth management for the next 30 years** — just as Schwab (1975), E*TRADE (1992), and Robinhood (2013) defined their eras.

---

## The Problem

Your financial life is scattered across a dozen accounts, three tax documents, two advisors, and a spreadsheet you update quarterly. No one sees the whole picture — not even you.

**What the wealthy get:**
- Family offices with dedicated teams
- Continuous tax optimization
- Sophisticated planning across all assets
- Coordinated strategy

**What everyone else gets:**
- Robos that manage one account in a black box
- Aggregators that show balances but offer no intelligence
- Tax software that shows up once a year
- Advisors that cost 1% annually and still miss opportunities

---

## The Six Gaps No One Fills

We researched every competitor. Here's what's missing:

| Gap | Current State | Maven's Solution |
|-----|---------------|------------------|
| **Cross-account tax optimization** | Wealthfront only optimizes assets they hold | See ALL accounts, optimize across ALL |
| **Tax-aware trading** | Know impact only after trading | Show impact BEFORE you trade |
| **Year-round tax strategy** | TurboTax shows up in April | Optimize January through December |
| **Consumer Roth/asset location** | Requires $500K+ and an advisor | Democratize with AI |
| **The full loop** | No one does Aggregate → Analyze → Optimize → Trade → File | We do all five |
| **AI-native architecture** | Others bolt on AI as a feature | Built FROM AI |

---

## Competitive Landscape

| Category | Key Players | Their Weakness |
|----------|-------------|----------------|
| **Robo-Advisors** | Wealthfront ($75B), Betterment ($56B) | Only optimize accounts they hold; black box |
| **Aggregators** | Empower, Copilot, Monarch | Read-only dashboards; no action |
| **Tax Software** | TurboTax (60% market share) | Seasonal; reports the past |
| **AI Startups** | Mezzi | Suggestions only; no execution |

**No one combines:** See everything + Understand it + Optimize it + Execute it + File taxes

---

# PART II: THE VISION

## What Maven Is

Maven is the **intelligence layer for your entire financial life** — a co-pilot that helps you think through complex decisions with clarity and confidence.

**Maven is:**
- An insight engine for your complete financial picture
- A thinking partner for tax strategy, Roth conversions, risk management
- A way to get clarity without expensive advisors
- Built to explain WHY, not just what

**Maven is NOT:**
- A broker or trading platform (we use Alpaca)
- A robo-advisor that automatically invests
- A source of personalized financial advice
- A get-rich-quick scheme

---

## The Full Loop

```
┌─────────────────────────────────────────────────────────────────┐
│                           MAVEN                                  │
│                                                                  │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐     │
│  │AGGREGATE │ → │ ANALYZE  │ → │ OPTIMIZE │ → │ EXECUTE  │     │
│  │          │   │          │   │          │   │          │     │
│  │Brokerage │   │Risk      │   │Tax-loss  │   │Trade via │     │
│  │401k      │   │exposure  │   │harvest   │   │Alpaca    │     │
│  │Crypto    │   │Tax       │   │Roth      │   │          │     │
│  │Tokenized │   │liability │   │convert   │   │Or export │     │
│  │Real est. │   │Opps      │   │Rebalance │   │to broker │     │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘     │
│                                                                  │
│                         ↓                                        │
│                  ┌──────────┐                                    │
│                  │   FILE   │                                    │
│                  │          │                                    │
│                  │ 1040     │                                    │
│                  │ 8949     │                                    │
│                  │ Sched D  │                                    │
│                  │ State    │                                    │
│                  └──────────┘                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**"TurboTax is a rearview mirror. Maven is a windshield."**

---

## The Tokenization Thesis

By 2030, portfolios won't just be stocks and bonds. They'll include:
- Tokenized real estate (fractional ownership)
- Tokenized treasuries (T-bills on-chain)
- Tokenized private equity (Apollo, KKR, Blackstone deals)
- Crypto-native assets (BTC, ETH, TAO)
- AI-generated alpha (Bittensor signals)

**No one can handle the tax complexity** of tokenized assets today. Maven will.

---

# PART III: THE BUILD PLAN

## Regulatory Reality (The Good News)

| Activity | Registration Needed |
|----------|---------------------|
| Aggregating accounts, showing data | **None** |
| Generic financial education/info | **None** |
| Personalized investment advice | RIA (Phase 3) |
| Executing trades | Alpaca handles this |
| Tax preparation/filing | PTIN (1 week) |

**Key insight:** We don't need RIA registration to launch. Start as "financial dashboard with AI insights" — zero registration required.

---

## Phase 1: Foundation (Months 1-3)
*Goal: Launchable MVP with Account Aggregation + AI Insights*

### Features
- User authentication (Clerk)
- Account linking via Plaid
- Net worth dashboard (real-time)
- Holdings overview across accounts
- AI chat for financial questions
- Basic spending insights

### Technical Stack
```
Frontend:  Next.js + TypeScript + Tailwind + shadcn/ui
Backend:   Next.js API Routes + tRPC
Database:  PostgreSQL (Supabase) + Prisma ORM
External:  Plaid | Anthropic | Clerk | Vercel
```

### Budget & Timeline
- **Timeline:** 10-12 weeks
- **Budget:** ~$26,000
- **Team:** Sam + Eli + UI contractor (40-60 hrs)

### Key Deliverables
- [ ] Working account aggregation (Plaid sandbox → production)
- [ ] AI chat with financial context
- [ ] Basic dashboard showing net worth and holdings
- [ ] Security fundamentals (encryption, auth, audit logging)

---

## Phase 2: Tax Intelligence (Months 4-8)
*Goal: Tax Optimization + Trading Integration*

### Features
- Tax-loss harvesting opportunity detection
- Wash sale tracking (cross-account)
- Asset location optimization suggestions
- Capital gains/losses reporting
- Alpaca paper trading integration
- Proactive AI insights

### Tax Engine Architecture
```
┌─────────────────────────────────────────┐
│            TAX ENGINE                    │
├─────────────────────────────────────────┤
│ 1. Cost Basis Tracker (per-lot)         │
│ 2. Gain/Loss Calculator (ST vs LT)      │
│ 3. Tax-Loss Harvesting Scanner          │
│ 4. Wash Sale Monitor (61-day window)    │
│ 5. Asset Location Optimizer             │
└─────────────────────────────────────────┘
```

### Integrations
- **SnapTrade:** Better brokerage coverage, OAuth-based
- **Alpaca:** Paper trading first, live later
- **Coinbase API:** Direct crypto integration

### Budget & Timeline
- **Timeline:** 16-18 weeks
- **Budget:** ~$125,000
- **Team:** Add Sr. Full-Stack Engineer ($180-250K + equity)

### Key Deliverables
- [ ] Tax engine with lot tracking and wash sale prevention
- [ ] Cross-account tax optimization suggestions
- [ ] Paper trading via Alpaca
- [ ] AI with tool-calling for financial operations

---

## Phase 3: Scale (Months 9-18)
*Goal: Tax Filing, Live Trading, Mobile, Maven Pro*

### Features
- Column Tax API for tax filing
- Live trading via Alpaca
- One-click tax-loss harvesting execution
- Mobile apps (React Native)
- Maven Pro for RIAs

### RIA Registration (When Ready)
- Required for personalized investment advice
- State registration if <$100M AUM
- Timeline: 2-6 months
- Cost: $10-30K with attorney

### Budget & Timeline
- **Timeline:** 9-12 months
- **Budget:** $300-600K
- **Team:** Add Mobile Engineer, Head of Compliance

---

## Technical Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Primary aggregation | Plaid | Industry standard, best coverage |
| Brokerage aggregation | SnapTrade | OAuth-based, trading capability |
| Trading execution | Alpaca | They handle broker-dealer compliance |
| Tax filing | Column Tax | Best API, 6-12 months saved vs DIY |
| Mobile | React Native | Shared codebase, faster development |
| AI model | Claude Sonnet | Best reasoning for financial analysis |

---

# PART IV: GO-TO-MARKET

## Target Customers (Prioritized)

### Tier 1: Tech-Forward Millennials (Primary)
- **Who:** 25-35 year olds, $75K-$200K income
- **Why:** 90% of Wealthfront users are under 45; highest AI comfort
- **Pain:** Overwhelmed by complexity, hate traditional finance
- **Message:** "Your 24/7 AI wealth advisor"

### Tier 2: Mass Affluent DIY Investors
- **Who:** 35-50, $150K-$500K investable assets
- **Why:** Have money, care about tax optimization
- **Pain:** Leaving money on table, scattered accounts
- **Message:** "See your whole picture, keep more of it"

### Tier 3: HNW via Maven Pro (B2B)
- **Who:** $500K+ via RIA relationships
- **Why:** Sam's network advantage
- **Message:** "Give your clients AI-powered wealth management"

---

## Distribution Strategy

### Pre-Launch
- [ ] Waitlist landing page with referral queue
- [ ] Sam posts 3-5x/week on LinkedIn
- [ ] Build Discord community for early adopters
- [ ] Identify 50 beta testers from personal network

### Launch (Month 1-3)
- [ ] Release to first 100 beta users (high-touch)
- [ ] Rapid iteration based on feedback
- [ ] Product Hunt launch
- [ ] First RIA pilots for Maven Pro

### Growth (Month 4-12)
- [ ] Open beta with referral program
- [ ] Content marketing (SEO for tax optimization terms)
- [ ] Influencer/creator partnerships
- [ ] Press push with user testimonials

---

## Referral Mechanics

| Company | Tactic | Result |
|---------|--------|--------|
| Robinhood | Free stock for referrals | 1M waitlist pre-launch |
| Wealthfront | +$5K managed free | 15% invite conversion |
| Revolut | Cash rewards | 700% growth |

**Maven Approach:**
- Refer a friend → both get 3 months premium free
- Gamified waitlist (share to move up)
- "Maven saved me $X" shareable moments

---

## Product Tiers

### The Ladder Strategy
**Build for Olympic swimmers, section off a shallow end.**

| Tier | Target User | Price | Core Value |
|------|-------------|-------|------------|
| **Maven Basics** | Beginners, employees | Free | Learn to swim — financial literacy through AI |
| **Maven** | DIY investors | $12/mo | See clearly — full dashboard, Oracle, tracking |
| **Maven Premium** | Serious optimizers | $25/mo | Keep more — tax engine, advanced optimization |
| **Maven Pro** | RIAs, advisors | $300/mo | Scale expertise — multi-client platform |

### Maven Basics (The Enterprise Play)
Same powerful Oracle, simplified for beginners:
- Guided onboarding ("Do you have an emergency fund?")
- Financial concept explanations built into conversation
- Achievement-based learning (unlock topics as you progress)
- Budget creation wizard
- First investment plan builder

**B2B2C Model:** Companies buy Maven Basics for employee wellness → employees who want more → convert to paid Maven users.

### Maven (Core Product)
Full wealth intelligence:
- Complete account aggregation
- Net worth tracking & projections
- AI Oracle with full context
- Portfolio analysis & allocation
- Concentration risk detection
- Basic tax insights

### Maven Premium
Advanced optimization:
- Tax-loss harvesting detection & execution
- Roth conversion analysis
- Asset location optimization
- Wash sale prevention
- Trading via Alpaca
- Tax filing integration

### Maven Pro (B2B)
For financial advisors:
- Multi-client dashboard
- White-label options
- Compliance features
- Client reporting
- API access

**Philosophy:** Freemium drives virality. Monetize engaged users. Way cheaper than 1% AUM advisors.

---

## Gamification: The Elon Approach

*"Make the mundane feel epic. Saving for retirement should feel like launching a rocket."*

### Core Philosophy
- **Real metrics, not fake points** — Show actual money saved, not badges
- **Progress toward something epic** — "Funding your financial independence"
- **Status that's earned** — Achievements reflect real accomplishments
- **Competition that inspires** — Compare improvement, not wealth
- **Surprise and delight** — Easter eggs, celebrations, humor

### Wealth Velocity™
**One number that captures your financial momentum** (like 0-60 for Tesla)

```
WEALTH VELOCITY: 47 ↑
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You're building wealth faster than 82% of your age group
```

Factors in:
- Savings rate
- Investment returns
- Debt paydown speed
- Tax efficiency
- Optimization actions taken

### Tax Alpha Counter™
**Running total of money Maven has saved you**

```
┌─────────────────────────────────────┐
│  TAX ALPHA EARNED                   │
│  $4,847                             │
│  ████████████░░░░░░░░ 48% to 10K    │
│  "Tax Hunter" status unlocked       │
└─────────────────────────────────────┘
```

### Financial Independence Countdown
```
┌─────────────────────────────────────┐
│  🚀 INDEPENDENCE DAY                │
│  March 14, 2047                     │
│  7,672 days remaining               │
│                                     │
│  ↓ 142 days faster than last month  │
└─────────────────────────────────────┘
```

### Achievement System

**Milestone Badges** (Real accomplishments)
| Badge | Requirement | Rarity |
|-------|-------------|--------|
| 🎯 First 100K | Net worth hits $100,000 | Common |
| 💪 Maxed Out | Max 401k contribution | Uncommon |
| 🎣 Tax Hunter | First tax-loss harvest | Uncommon |
| ⚔️ Debt Slayer | Pay off all non-mortgage debt | Rare |
| 🏆 Six Figure Saver | Save $100K+ in a year | Rare |
| 🚀 Escape Velocity | FI number reached | Legendary |
| 👑 Generational | $1M+ net worth | Epic |
| 🧙 Tax Alpha Master | Save $10K+ through optimization | Epic |

**Streak System**
- 🔥 **Savings Streak** — Consecutive months hitting savings target
- 📈 **Growth Streak** — Consecutive months of net worth increase  
- 🎯 **Optimization Streak** — Consecutive months taking an optimization action

### Mission Control Dashboard
**Make wealth tracking feel like SpaceX**

```
┌────────────────────────────────────────────────────────────┐
│  M A V E N   M I S S I O N   C O N T R O L                │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  NET WORTH          VELOCITY      FI COUNTDOWN             │
│  $247,832           47 ↑          7,672 days              │
│  ▲ $3,241 (1.3%)                  ↓ 142 faster            │
│                                                            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                            │
│  ACTIVE MISSIONS                                           │
│  ● Max 401k ━━━━━━━━━━━━━░░░░ 76%     $17,250 / $23,000  │
│  ● Emergency fund ━━━━━━━━━━━━━━━━━━ 100% ✓ COMPLETE      │
│  ● Tax harvest ━━━━░░░░░░░░░░░░░░░░ 23%     $1,847 found │
│                                                            │
│  RECENT ACHIEVEMENTS                                       │
│  🎯 First 100K unlocked 14 days ago                       │
│  💪 Maxed Out streak: 3 years                             │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Launch Moments
**Epic celebrations for big milestones**

When user hits $100K:
```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                    🚀 LAUNCH DETECTED 🚀                   │
│                                                            │
│              YOU JUST HIT $100,000 NET WORTH              │
│                                                            │
│     "The first $100K is the hardest" — Charlie Munger     │
│                                                            │
│                 [Share Achievement]                        │
│                                                            │
│        Average time to $100K: 8.2 years                   │
│        Your time: 6.1 years                               │
│        You're 25% faster than average 🏆                  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Social Features (Anonymous)

**Peer Comparison** (by age bracket, income range)
- "Your savings rate is higher than 73% of your peers"
- "You're optimizing taxes better than 91% of users"
- "Your Wealth Velocity puts you in the top 15%"

**Shareable Cards** (amounts hidden, achievements shown)
```
┌─────────────────────────────────┐
│  🏆 MAVEN ACHIEVEMENT           │
│                                 │
│  Sam just unlocked              │
│  "Tax Alpha Master"             │
│                                 │
│  Saved $10,000+ through         │
│  tax optimization               │
│                                 │
│  mavenwealth.ai                 │
└─────────────────────────────────┘
```

### Easter Eggs & Surprises

- **Konami Code** → Reveals hidden lifetime stats
- **Birthday** → Special "Birthday Bonus" achievement + confetti
- **Tax Day (April 15)** → "Tax Survivor" badge if filed early
- **Market crash days** → "Diamond Hands" badge for not panic selling
- **Random confetti** → 1% chance on login if net worth up
- **Secret achievements** → Hidden until unlocked
- **Holiday themes** → Festive UI on major holidays

### Notifications That Don't Suck

Instead of: *"Your portfolio is down 2%"*

Maven says: *"Markets are down. Your Wealth Velocity is unchanged because you're still saving. Diamond hands. 💎"*

Instead of: *"Time to check your accounts"*

Maven says: *"You're 47 days into your savings streak. Don't break the chain. 🔥"*

### The Psychology

| Human Need | How Maven Satisfies It |
|------------|----------------------|
| **Progress** | Wealth Velocity, streaks, countdowns |
| **Achievement** | Badges, milestones, launch moments |
| **Status** | Peer comparisons, shareable cards |
| **Mastery** | Tax Alpha, optimization scores |
| **Belonging** | Anonymous community stats |
| **Surprise** | Easter eggs, random rewards |

**The goal:** Make checking Maven feel like checking a video game — but the rewards are real money.

---

## Realistic Benchmarks

| Milestone | Target |
|-----------|--------|
| Month 3 | 500-1,000 beta users |
| Month 6 | 2,500-5,000 users |
| Month 12 | 10,000-25,000 users |
| Year 1 MRR | $10K-$50K |
| Year 1 AUM | $5M-$25M |

---

# PART V: WINNING REQUIREMENTS

## Competitive Moats

| Moat Type | Strength | How to Build |
|-----------|----------|--------------|
| **Switching Costs** | STRONGEST | Multi-year history, personalized models, complex configurations |
| **Trust/Brand** | VERY STRONG | Transparency, track record, never have a breach |
| **Speed** | STRONG (early) | AI-native = 2-person team does work of 10 |
| **Data** | MODERATE | Personalized model built on years of user data |
| **Network Effects** | WEAK | Not primary moat; don't design around it |

---

## Sam + Eli's Unfair Advantages

| Advantage | How to Maximize |
|-----------|-----------------|
| **Capital Group background** | Credibility, network for RIA channel, industry insight |
| **AI-native development** | Ship faster than anyone expects; 2-person = 10-person output |
| **Timing** | AI moment + robo fatigue + wealth transfer |
| **Personal capital** | Can bootstrap; don't need to raise immediately |

---

## What Kills Fintechs (And How to Avoid)

| Risk | Frequency | Mitigation |
|------|-----------|------------|
| Regulatory issues | #1 (73%) | Compliance advisor from Day 1 |
| Running out of money | #2 | 18+ month runway; track burn weekly |
| No product-market fit | #3 | Talk to 100 users before building |
| Security breach | Catastrophic | Security-first; encrypt everything |
| Trust erosion | Slow death | Radical transparency; fast response |

---

## Critical Success Factors

1. **Speed of Execution** — Ship fast, learn fast, iterate fast
2. **Regulatory Discipline** — Get compliance help early; one misstep is fatal
3. **Authentic Differentiation** — Don't build "Wealthfront with AI"; solve real pain
4. **Capital Efficiency** — Stay lean until PMF is clear
5. **Trust Building** — Takes years to build, seconds to lose

---

# PART VI: FINANCIALS

## Year 1 Budget (Bootstrapped)

| Category | Monthly | Annual |
|----------|---------|--------|
| Infrastructure | $500 | $6,000 |
| Plaid/SnapTrade | $750 | $9,000 |
| AI APIs | $1,000 | $12,000 |
| Contractors | $3,000 | $36,000 |
| Legal/Compliance | $3,000 | $36,000 |
| Misc | $500 | $6,000 |
| **Total** | **$8,750** | **$105,000** |

*Note: Assumes Sam's salary covered externally; Eli's cost = API usage*

## Year 1 Budget (Seed-Funded)

| Category | Monthly | Annual |
|----------|---------|--------|
| Team (3 FT) | $50,000 | $600,000 |
| Infrastructure | $2,000 | $24,000 |
| Aggregation/APIs | $3,000 | $36,000 |
| Legal/Compliance | $5,000 | $60,000 |
| Marketing | $5,000 | $60,000 |
| **Total** | **$65,000** | **$780,000** |

---

## Revenue Projections (Conservative)

| Month | Users | Premium (10%) | MRR |
|-------|-------|---------------|-----|
| 6 | 3,000 | 300 | $3,750 |
| 12 | 15,000 | 1,500 | $18,750 |
| 18 | 40,000 | 4,000 | $50,000 |
| 24 | 80,000 | 10,000 | $125,000 |

*Assumes $12.50 average premium price*

---

# PART VII: THE THREE PROMISES

## 1. Clarity
You will always understand your complete financial picture and what it means.

No black boxes. No jargon. When Maven suggests something, it explains why.

## 2. Optimization
You will never leave money on the table through tax inefficiency, poor asset location, or missed opportunities.

The average investor loses 0.5-1% annually to poor tax management. Maven eliminates that.

## 3. Sovereignty
Your data is yours. Your decisions are yours.

Maven serves you — we don't sell you, and we don't sell your data.

---

# PART VIII: THE PATH FORWARD

## Next 90 Days

### Week 1-2
- [ ] Finalize MVP feature set
- [ ] Set up development environment
- [ ] Plaid sandbox integration
- [ ] Basic auth flow

### Week 3-6
- [ ] Account aggregation working
- [ ] Database schema finalized
- [ ] AI chat integrated
- [ ] Basic dashboard UI

### Week 7-10
- [ ] Holdings and net worth display
- [ ] Transaction categorization
- [ ] Security hardening
- [ ] Beta landing page live

### Week 11-12
- [ ] First 50 beta users
- [ ] Feedback collection system
- [ ] Iterate based on feedback
- [ ] Plan Phase 2

---

## Key Decisions to Make

| Decision | Options | Deadline |
|----------|---------|----------|
| Funding path | Bootstrap vs Seed | Month 6 |
| First hire | Engineer vs Designer | Month 4 |
| RIA timing | Phase 2 vs Phase 3 | Month 9 |
| Mobile timing | Phase 2 vs Phase 3 | Month 6 |

---

## Success Metrics

### Year 1
- [ ] 10,000+ active users
- [ ] $10K+ MRR
- [ ] NPS > 50
- [ ] Zero security incidents
- [ ] Clear product-market fit signal

### Year 2
- [ ] 50,000+ active users
- [ ] $50K+ MRR
- [ ] Maven Pro launched
- [ ] Tax filing live
- [ ] Series A ready (if VC path)

### Year 3
- [ ] 200,000+ users
- [ ] $500K+ MRR
- [ ] Category recognition
- [ ] Profitable or clear path

---

# CONCLUSION

## The Thesis

There WILL be an AI-native wealth platform that becomes the default for the next generation. 

The question is whether Maven is that platform.

**We have:**
- ✅ The right timing (AI inflection + robo fatigue + wealth transfer)
- ✅ The right background (Capital Group + AI-native)
- ✅ The right vision (full loop, not just features)
- ✅ The right advantages (speed, network, capital efficiency)

**We need:**
- ⏳ Exceptional execution over 3+ years
- ⏳ Regulatory discipline from Day 1
- ⏳ Users who love us enough to refer
- ⏳ Luck (some required, minimize with preparation)

---

## The End State

One place to:
- See every dollar and token you own
- Understand your risks and opportunities
- Optimize your taxes continuously
- Trade any asset — traditional or tokenized
- File your taxes without touching another app
- Get intelligence that improves over time

**The family office for everyone.**

Not through cheap automation, but through genuine intelligence.

---

*The financial system is broken. We're building the fix.*

*Maven — See clearly. Decide confidently. Keep more.*

---

**Document Control**
- Version: 1.0
- Created: February 6, 2026
- Authors: Sam Adams, Eli
- Status: Living document — update as we learn

---

*"Optimise all copy for felt understanding, not technical impressiveness. The user should feel smarter and calmer after reading, not more overwhelmed."*
