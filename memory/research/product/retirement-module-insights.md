# Maven Retirement Module: Product Insights

*Date: 2026-02-06*
*From: Research Session - Retirement Account Types & Distribution Strategies*

---

## Advisor Pain Points Identified

Based on the complexity of retirement rules, here's what advisors struggle with:

### 1. Contribution Limit Complexity

**The Problem**: 
- Limits change every year
- Multiple account types with different rules
- Catch-up rules now vary by age (50-59, 60-63, 64+)
- SECURE 2.0 added Roth catch-up mandate for high earners
- Spousal contributions, self-employed calculations all differ

**Maven Opportunity**: 
**"Contribution Maximizer"** — Input client's situation, get personalized max contributions across all accounts with automatic limit updates.

---

### 2. Distribution Strategy Coordination

**The Problem**:
- RMDs start at different ages depending on birth year
- QCDs can start before RMDs (70½ vs 73)
- 72(t) SEPP rules are complex and risky to modify
- Roth conversion timing vs RMD timing
- IRMAA impact from distributions

**Maven Opportunity**:
**"Distribution Optimizer"** — Model multi-year distribution strategies showing:
- Tax impact by account type
- QCD vs standard RMD comparison
- Roth conversion headroom
- IRMAA threshold monitoring

---

### 3. Concentrated Position Analysis

**The Problem**:
- Multiple strategies exist (exchange funds, direct indexing, charitable, hedging)
- Each has different minimums, timelines, tax implications
- Advisors don't always know which fits the client

**Maven Opportunity**:
**"Concentration Risk Analyzer"** — For any concentrated position, show:
- Unrealized gain and tax at sale
- Exchange fund eligibility and projected outcome
- Direct indexing timeline to diversification
- Charitable gift impact (DAF, CRT)
- Decision matrix based on client profile

---

## Feature Ideas

### A. "What-If" Scenario Engine

Let advisors model:
- "What if client maxes Roth 401k instead of Traditional?"
- "What if we do Roth conversions to top of 22% bracket for 10 years?"
- "What if we use QCDs to satisfy all RMDs?"
- "What if client joins exchange fund vs sells and diversifies?"

**Killer feature**: Show 10-year and lifetime tax projections for each scenario.

---

### B. Alert System

Proactive notifications:
- "Client turns 70½ next year — QCD strategy available"
- "Client will be in 60-63 super catch-up window for 2027"
- "Client's income exceeded $150K — Roth catch-up required next year"
- "RMD deadline in 30 days — $X still needed to satisfy"

---

### C. Client Education Generator

Advisors need to explain complex rules simply. Maven could generate:
- Plain-language summaries of strategies
- Visual comparisons (Roth vs Traditional over time)
- Personalized one-pagers for client meetings

---

## Competitive Differentiation

### What Existing Tools Miss

1. **Most planning software**: Treats accounts separately, doesn't optimize across account types
2. **Robo-advisors**: Don't handle complex scenarios (exchange funds, 72(t), NUA)
3. **Tax software**: Backward-looking, not forward-looking optimization
4. **Spreadsheets**: Can't model all the variables, error-prone

### Maven's Edge

- **Cross-account optimization** (what goes where)
- **Tax-aware recommendations** (not just "max your 401k")
- **Scenario modeling** (show outcomes, not just rules)
- **Plain-language explanations** (AI advantage)

---

## Data Integration Needs

To power these features, Maven needs:

| Data Type | Source |
|-----------|--------|
| Account balances | Plaid, Yodlee, direct custodian feeds |
| Contribution history | 5498 forms, plan records |
| Cost basis | 1099-B, brokerage feeds |
| Tax return data | 1040, client upload |
| IRS limits | Annual updates (automate from IRS.gov) |
| Employer plan details | Plan documents, 5500 filings |

---

## MVP Scope Suggestion

**Phase 1**: Contribution Maximizer
- Client inputs income, age, accounts available
- Maven outputs: "Here's what you can contribute and where"
- Handles edge cases (spousal, self-employed, catch-up)

**Phase 2**: Distribution Optimizer
- Model RMD + QCD + Roth conversion strategies
- Show 10-year tax projections

**Phase 3**: Concentration Risk Module
- Integrate exchange fund analysis
- Compare all diversification strategies

---

*This informs Maven Pro feature prioritization.*
