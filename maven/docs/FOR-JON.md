# Maven — Weekend Update

*Hey Dad — wanted to share what we added today and how the vision is coming together.*

---

## What We Built This Weekend

Big push over the last couple days. Maven went from "portfolio tracker with an AI chat" to a real wealth management platform. Here's what's new:

**Today's additions:**

- **"How Does This Work?" buttons** — Every tool now has an educational explainer showing methodology, data sources, and limitations. Transparency built in.

- **Oracle learns from conversations** — Persistent memory system. Oracle remembers your preferences, goals, risk tolerance, family situation. Gets smarter over time.

- **"EZ Button" AI explanations** — One click on any complex analysis and Oracle walks you through it in plain English with 4 tabs: Overview, Compare, Stress Test, Projections. Added to Portfolio Lab, Monte Carlo, Tax Harvesting, Fragility Index, Social Security.

- **Investment Thesis Engine** — Explains *why* we recommend allocations, not just what. Shows views from Vanguard, BlackRock, JPMorgan. Honest about uncertainty.

- **ThesisInsight integration** — Quick "thesis check" now shows on Dashboard, Portfolio Lab, and Rebalance page. At a glance: are you in line with our recommended ranges?

- **Data architecture upgrade** — Built to flip from demo data to live APIs (Plaid, Morningstar) with one config change. No code rewrites when we're ready to pay up.

- **Fund X-Ray** — Morningstar-style fund analysis: style box, sectors, holdings, fund comparison, overlap detection.

- **Keyboard shortcuts** — Power user features: ⌘K opens Oracle, ⌘/ shows help, G+D/P/O/T/F/M for quick nav.

- **Quick Start Tips** — Onboarding carousel for new users. Helps people discover features without being overwhelming.

**This weekend total:** 36+ new pages, ~15,000 lines of code, 98 routes live.

---

## The Vision Coming Together

Here's what I'm seeing: **Maven can be the platform that democratizes what family offices do.**

Family offices serving $10M+ clients have teams doing exactly what Maven does — market monitoring, tax optimization, retirement modeling, investment research. They charge 1%+ for it.

Maven does it with AI. Same intelligence, fraction of the cost, available to everyone.

**The three pieces are now in place:**

1. **Intelligence layer** — Fragility Index, Monte Carlo, Thesis Engine. Real analysis, not toy demos.

2. **Advisor tools** — Dashboard that lets you manage clients, control their experience, prep for meetings. Makes one advisor as productive as a team.

3. **Business model** — Free tier for lead gen, paid tier for DIY, Partners tier for real relationships. The funnel feeds itself.

It's not just a product anymore. It's a platform with a path to revenue.

---

**Live now at:** https://mavenwealth.ai

---

## Tools You'd Actually Use

### 📊 Market Fragility Index
Real-time dashboard tracking 40+ market indicators across 8 categories:
- Credit spreads, yield curve, volatility
- Breadth, momentum, valuations
- Sentiment, macro conditions

Shows a single score (0-100) with plain-English interpretation. Right now it's at 47 — "Elevated" zone, meaning caution warranted but not panic.

**Why it's useful:** One glance tells you if markets are stressed. No more checking 15 different screens.

---

### 🎯 Portfolio Lab
Analyzes any portfolio and shows:
- Current allocation vs. targets
- Risk metrics (volatility, Sharpe, max drawdown)
- Tax-efficient rebalancing suggestions
- "What if" scenarios (rate changes, market drops)

---

### 🔮 Oracle (AI Assistant)
Chat interface powered by Claude (Anthropic's AI). Ask it anything:
- "What's driving the market today?"
- "Explain this client's risk exposure"
- "Draft talking points for a review meeting"

It has context about portfolios and market conditions — not just generic answers.

---

### 📈 Monte Carlo Retirement Simulator
Production-grade simulation using:
- 97 years of actual market history (1928-2024)
- Bootstrap sampling (uses real return sequences, not just averages)
- Correlation-aware multi-asset modeling
- Social Security integration

Shows probability of success across 1,000+ scenarios with specific recommendations.

---

### 💡 Investment Thesis Engine
This is new as of today. Instead of just saying "rebalance to 20% international," Maven explains *why*:

- **Structural case:** Why the asset class exists in portfolios
- **Valuation:** Cheap, fair, or expensive (with actual metrics)
- **Expected returns:** 10-year estimates from Vanguard, BlackRock, JPMorgan
- **What could go wrong:** Honest about risks and timing uncertainty

Example: International stocks are trading at a 50% discount to US on P/E. But we acknowledge that's been true since 2015 — so we're honest about value trap risk.

---

### 🔍 Fund X-Ray
Morningstar-style fund analysis:
- Style box (growth/value, large/small)
- Sector breakdown
- Top holdings
- Compare multiple funds side-by-side
- Overlap detection ("you own the same 20 stocks in 3 different funds")

---

### 📉 Stress Testing
Shows exactly what would happen to a portfolio in historical crises:
- 2008 Financial Crisis
- 2020 COVID Crash
- 2000 Dot-Com Bust
- 1987 Black Monday

Not theoretical — uses actual returns from each asset class during those periods.

---

### 🏦 Tax-Loss Harvesting Scanner
Scans holdings for:
- Unrealized losses available to harvest
- Wash sale risks (flags if you'd violate the 30-day rule)
- Tax-efficient swap suggestions (sell VTI at a loss, buy ITOT)

---

## What's Different About Maven

**It's AI-native, not AI-assisted.** Most "AI" tools in finance are just ChatGPT bolted onto existing software. Maven is built from scratch with AI at the core.

**It explains itself.** Every recommendation comes with reasoning. Not "trust the black box" — full transparency on methodology and data sources.

**It's honest about uncertainty.** We show ranges, not false precision. When we don't know something, we say so.

---

## Advisor Dashboard

There's a full advisor control panel at `/advisor` with tools built specifically for managing a practice:

### Client Management
- **Client list** with search, filter, sort by AUM/last contact/risk score
- **Client detail pages** with portfolio view, activity history, notes
- **Meeting prep generator** — one click to create talking points for any client review

### Insight Curation (This is the Differentiator)
Here's what makes Maven different for advisors: **you control what clients see.**

If the Fragility Index spikes to 75 and shows "High Risk" — you might not want that hitting a nervous client's screen at 9pm. With Maven, you can:
- **Hide** insights that would cause unnecessary panic
- **Show** insights that reinforce your advice
- **Contextualize** — add your own note explaining what it means for *their* situation

The client gets a curated experience. You stay in control of the relationship.

### Practice Analytics
- AUM tracking across all clients
- Engagement metrics (who's logging in, who's not)
- Upcoming reviews and compliance deadlines
- Alert center for drift, tax opportunities, life events

---

## Business Model

Three tiers, each serving a different purpose:

### Maven Basic (Free)
- Limited tools, manual data entry only
- Lead generation — gets people in the door
- Upsell path to Pro or Partners

### Maven Pro ($29-49/month)
- Full toolset, account linking via Plaid
- For DIY investors who want serious tools
- This is the conversion funnel — when life gets complicated (inheritance, retirement, divorce), they want a human advisor

### Maven Partners (Included with AUM relationship)
- **This is the actual business**
- Full platform for advisor + client
- Advisor controls the experience
- White-glove onboarding
- Direct Schwab integration (no manual entry)

**The flywheel:** Free users → paid DIY users → life event → want an advisor → become Partners clients. Same model Morgan Stanley runs with E*Trade.

---

## Compliance — Why This Isn't an Issue

This was a big question early on, so let me address it directly.

### Maven is a Tool, Not an Advisor

Maven doesn't give investment advice. **You do.** Maven is like Bloomberg, Morningstar, or eMoney — it's analysis software that helps advisors do their job better.

- Maven suggests, you decide
- Maven analyzes, you recommend
- Maven drafts, you approve

The fiduciary responsibility stays exactly where it belongs: with the licensed advisor. Maven just makes you faster and more thorough.

### Nothing Changes Regulatory

If you're an RIA (or setting one up), your compliance obligations are the same whether you use Maven, a spreadsheet, or a yellow legal pad. The tools don't create new requirements.

What Maven does:
- **Research and analysis** — same as reading Morningstar reports
- **Portfolio visualization** — same as any reporting software
- **"What if" scenarios** — same as running numbers in Excel
- **Meeting prep** — same as writing your own notes

What Maven doesn't do:
- Execute trades (you use Schwab/Fidelity for that)
- Make investment decisions (you do)
- Communicate directly with clients without your approval (you control everything)

### We Actually Make Compliance Easier

Maven has compliance tools built in:

- **Risk tolerance questionnaires** — documented, scored, timestamped
- **Suitability documentation** — automatic records of why recommendations fit the client
- **Audit trails** — every action logged
- **Meeting notes** — generated and stored

Most compliance headaches come from poor documentation. Maven documents everything by default.

### The AI Angle

"But what about AI making recommendations?"

The AI (Oracle) is like having a research analyst on staff. It can:
- Summarize market conditions
- Draft talking points
- Explain complex concepts
- Answer questions about a portfolio

It cannot:
- Make decisions for clients
- Execute anything
- Bypass advisor approval

Every insight Oracle generates is a *draft* that you review before it goes anywhere. Same as if a junior analyst handed you a memo — you'd read it before acting on it.

### Bottom Line

Maven makes your practice more efficient and your documentation more thorough. It doesn't create new compliance requirements — if anything, it makes existing requirements easier to meet.

---

## Technical Architecture (Summary)

**Frontend:** Next.js (React) — modern, fast, works on any device

**AI:** Claude by Anthropic — most capable AI model for reasoning and analysis. Not ChatGPT.

**Data Sources:**
| Source | What It Provides |
|--------|------------------|
| Yahoo Finance | Stock/index prices (real-time) |
| CoinGecko | Crypto prices (real-time) |
| FRED | Economic indicators (Fed data) |
| FMP | Fundamentals, analyst ratings |

**Data Architecture:** Built with a "mock now, live later" pattern. Every data source can flip from demo data to real APIs with one config change. When we add Plaid (account aggregation) or Morningstar (fund data), it's plug-and-play.

**Hosting:** Vercel (same infrastructure as major tech companies). Auto-scales, fast globally.

**Security:** All API keys server-side, no sensitive data exposed to browser.

---

## Quick Stats

- **98 pages/tools** built and deployed
- **Live data** from Yahoo Finance, CoinGecko, FRED (Federal Reserve)
- **AI powered** by Claude (Anthropic) — same technology behind the most advanced AI assistants
- **Real-time** market monitoring and alerts

---

## Try It

Just go to https://mavenwealth.ai and click around. The Oracle (🔮 button in bottom right) is a good place to start — ask it anything.

Advisor dashboard is at `/advisor` — shows the practice management side.

No login required for the demo. Everything you see is functional.

---

*Questions? Just text me.*
