# Account Aggregation Landscape for Maven

*Last updated: February 2026*

## Executive Summary

Account aggregation is a critical infrastructure decision for any fintech building wealth management or PFM tools. The market is competitive with 5 major providers (Plaid, Yodlee, MX, Finicity, Akoya) plus emerging "super aggregators" that abstract multiple providers. Key findings:

- **Plaid** is the market leader with best developer experience but expensive ($1K+/month minimum)
- **Investment account data** is harder to aggregate than bank accounts—requires special attention
- **CFPB 1033 rule** (finalized Oct 2024) is reshaping the landscape, compliance begins April 2026
- **No single provider** offers perfect coverage—multi-aggregator strategies are becoming common
- **For Maven**: Consider starting with CSV upload MVP, then SnapTrade ($2/user/mo) for investments, evaluate Plaid/Quiltt later

---

## 1. Major Providers Comparison

### Plaid

**The market leader with the best developer experience**

| Attribute | Details |
|-----------|---------|
| **Coverage** | 12,000+ institutions in US/Canada, 2,400+ support investment data |
| **Strengths** | Best API documentation, fastest integration, widest brand recognition |
| **Weaknesses** | Capital One connectivity issues, inconsistent investment data quality, transaction categorization ~89% accuracy |
| **Pricing Model** | Per-connection + monthly platform fee |
| **Minimum Commitment** | ~$500-1,000/month platform fee, 12-month contracts typical |
| **Investment Data** | Holdings, cost basis, 24-month transaction history |
| **OAuth Support** | Yes, for major banks |

**Security/Legal Issues:**
- **2022**: $58 million settlement for privacy violations (misleading login screens that looked like banks, excessive data collection)
- **2024 (June)**: Indirectly affected by Evolve Bank breach—Plaid was a partner, some customer data exposed via LockBit ransomware attack
- No direct major breach of Plaid's systems, but their credential-storage model has been controversial

**Fidelity Access**: Available upon request (Fidelity requires Akoya connection for some aggregators)

---

### Yodlee (Envestnet)

**The enterprise incumbent with deepest coverage**

| Attribute | Details |
|-----------|---------|
| **Coverage** | 21,000+ global sources (claims largest coverage) |
| **Strengths** | Deepest wealth management data, better small bank/credit union coverage, 92% transaction categorization accuracy |
| **Weaknesses** | Slower integration (weeks-months), lower connectivity success rates than Plaid, complex API |
| **Pricing Model** | Platform fee + per-user/month |
| **Minimum Commitment** | $1,000-2,000/month minimum, annual contracts required |
| **Target Market** | Enterprise, wealth management, established fintechs |

**Key Consideration**: Historically better for investment account data depth, but harder to work with technically.

---

### MX Technologies

**The bank-friendly aggregator with focus on data intelligence**

| Attribute | Details |
|-----------|---------|
| **Coverage** | Strong US coverage, built on FDX (Financial Data Exchange) standards |
| **Strengths** | Clean data, good transaction enrichment, preferred by many banks/credit unions |
| **Weaknesses** | Less startup-friendly, historically "aggregated other aggregators" for investments |
| **Pricing Model** | Custom/enterprise (not publicly disclosed) |
| **Minimum Commitment** | Negotiated; typically higher than Plaid |
| **Differentiator** | Strong data cleansing/categorization, works with FIs as data provider |

**Developer Notes**: 
- Development environment limited to 100 users
- Max 25 members (linked accounts) per user
- Good documentation but less polished than Plaid

---

### Finicity (Mastercard)

**Open banking purist with strong OAuth connections**

| Attribute | Details |
|-----------|---------|
| **Coverage** | Strong for top-tier banks, 100% OAuth with Capital One, Chase, BoA, Wells |
| **Strengths** | FCRA-compliant reports, 24-month transaction snapshots, Mastercard backing |
| **Weaknesses** | Coverage outside major banks similar to Plaid, less dev community |
| **Pricing Model** | Enterprise pricing, negotiated |
| **Focus** | Lending use cases, income/asset verification |
| **Differentiator** | Clean regulatory positioning, open banking advocacy |

**Best For**: Lending apps, income verification, anyone wanting to avoid screen-scraping liability.

---

### Akoya (Bank-Owned Consortium)

**The bank-controlled "safe" option**

| Attribute | Details |
|-----------|---------|
| **Ownership** | 11 major banks (including JPMorgan, Wells Fargo, PNC) + Fidelity + The Clearing House |
| **Coverage** | Limited to owner banks + their networks—NOT comprehensive |
| **Strengths** | High reliability for covered institutions, no screen-scraping, bank-approved |
| **Weaknesses** | Very limited coverage, difficult API (not developer-friendly), slow to add institutions |
| **Pricing Model** | Per-connection, negotiated |
| **Reality Check** | Banks use Akoya to control data access—PNC and Fidelity require Akoya for any data sharing |

**Critical Issue**: Akoya's API is described as "more of an OAuth switchboard bundling disparate bank APIs" rather than a unified developer-friendly interface. Integration is significantly harder than Plaid.

**Strategic Risk**: Banks are pushing fintechs toward Akoya to control the ecosystem. This is not necessarily in fintechs' best interest.

---

## 2. Pricing Deep Dive

### Per-Connection Pricing Models

| Provider | Initial Connection | Monthly/Active User | Platform Fee |
|----------|-------------------|---------------------|--------------|
| **Plaid** | $0.30-1.50 | $1.50-2.00/user/mo for transactions | $500-1,000/mo |
| **Yodlee** | $0.50-1.50 | $1.00-2.00/user/mo | $1,000-2,000/mo |
| **MX** | Custom | Custom | Custom (enterprise) |
| **Finicity** | Custom | Custom | Custom (enterprise) |
| **Akoya** | Custom | Custom | Custom |
| **SnapTrade** | Free | $2/connected user/mo | None (startup tier) |
| **Quiltt** | Custom | Custom (25-30% off rack rates) | None for custom tier |

### Hidden Costs to Watch

1. **Account Verification** — Often separate from transaction data ($0.30-1.00/verification)
2. **Identity Verification** — Premium pricing ($1.00-1.50/verification)
3. **Asset Reports** — $2.00-5.00/report generation
4. **Real-time Refresh** — Often requires negotiation/add-on pricing
5. **Investment Data** — Typically premium tier, separate from bank transactions
6. **Re-authentication** — When users need to re-link (broken connections), some providers charge again

### Volume Discounts

| Scale | Expected Discount |
|-------|-------------------|
| 10,000+ MAU | 30-50% off base rates |
| 50,000+ MAU | Additional negotiated discounts |
| 200,000+ MAU | Enterprise agreements, ~55% total reduction |

**Real-World Example** (from fintech founder):
- 5,000 users: ~$0.90/active user/month
- 50,000 users: ~$0.60/active user/month (after renegotiation)
- 200,000+ users: ~$0.40/active user/month (enterprise agreement)

---

## 3. Coverage & Reliability

### Well-Covered Institutions

| Category | Coverage Quality |
|----------|-----------------|
| **Big 4 Banks** (Chase, BoA, Wells, Citi) | Excellent (all providers) |
| **Major Brokerages** (Schwab, Fidelity, TD) | Good-Excellent (varies by provider) |
| **Digital Banks** (Chime, Varo, SoFi) | Good (Plaid typically best) |
| **Large Credit Unions** | Moderate-Good |

### Problem Areas

| Category | Issues |
|----------|--------|
| **Small Banks/Credit Unions** | Inconsistent coverage across all providers |
| **Fidelity Investments** | Requires Akoya connection (restricted) |
| **Capital One** | Historically problematic with Plaid (now improving) |
| **TD Ameritrade** | Transition issues post-Schwab merger |
| **Crypto Exchanges** | Very limited native support—need specialized providers |
| **International Accounts** | Poor coverage in US-focused aggregators |

### Connection Stability & Breakage

**Industry Reality**: Connection breakage is a persistent problem across ALL aggregators.

| Issue | Frequency | Impact |
|-------|-----------|--------|
| **Initial Connection Failures** | 5-15% of attempts | User abandonment |
| **Connection Degradation** | Weeks to months | Missing transactions |
| **Required Re-authentication** | Every 30-90 days for some banks | User friction |
| **Bank-side Changes** | Ongoing | Sudden breakage |

**User Complaints** (from forums):
- "Plaid connection claims working but no transactions for 10 days"
- "35% of transactions miscategorized" (Plaid)
- "TD account connectivity issues persist"

**Mitigation Strategy**: Multi-aggregator approach is increasingly common—use different aggregators for different institutions based on their strengths.

### Re-authentication Frequency

Varies significantly by institution:
- **OAuth-connected banks**: Rarely (token-based)
- **Screen-scraping connections**: Every 30-90 days common
- **Banks actively blocking**: More frequent failures

---

## 4. Technical Considerations

### OAuth vs Screen-Scraping

| Method | Description | Future |
|--------|-------------|--------|
| **OAuth** | User authenticates directly with bank, app receives token | The future—regulatorily preferred |
| **Screen-Scraping** | Aggregator uses user's credentials to log in as user | Being phased out, legal liability concerns |

**Regulatory Direction**: CFPB 1033 rule strongly favors OAuth/API-based access. Screen-scraping creates liability for apps if credentials are misused.

**Current Reality**: ~40-60% of connections still use screen-scraping because many banks don't offer APIs.

### Open Banking Regulations

#### US (CFPB 1033)

| Status | Details |
|--------|---------|
| **Rule Finalized** | October 22, 2024 |
| **Compliance Dates** | Begin April 2026 (phased by institution size) |
| **Coverage** | Deposit accounts, credit cards, digital wallets, some BNPL |
| **NOT Covered** | Investments, auto loans, mortgages, personal loans, payroll |
| **Current Status** | CFPB seeking to revise the rule (2025), enforcement paused during rulemaking |

**Key Implication for Maven**: Investment account data is NOT covered by 1033—will still require aggregators/scraping/partnerships.

#### EU (PSD2/Open Banking)

More mature than US—mandatory API access for banks, standardized interfaces. US is 5+ years behind.

### Data Refresh Rates

| Type | Typical Rate |
|------|--------------|
| **Bank Transactions** | Daily overnight (standard), on-demand for premium |
| **Investment Holdings** | Daily overnight, after market hours |
| **Investment Transactions** | Daily overnight |
| **Real-time** | Premium add-on, not universally available |

### What Data You Actually Get

#### Bank Accounts
- Account type, balance, available balance
- Transaction history (typically 12-24 months)
- Transaction date, amount, description
- Categorization (varies in quality)

#### Investment Accounts
- **Holdings**: Security name, ticker, CUSIP/ISIN, quantity, current value
- **Cost Basis**: Available but often incomplete/inconsistent
- **Transactions**: Buy/sell, dividends, transfers (24 months typical)
- **Performance**: Usually NOT provided—must calculate
- **Options/Complex Securities**: Partial support

**Critical Gaps for Wealth Management**:
- Cost basis data is often missing or wrong
- Tax lot information is incomplete
- Options positions inconsistently reported
- Alternative investments (PE, VC, RE) rarely available
- Crypto positions require separate integration

---

## 5. For a Startup Like Maven

### Realistic Cost Modeling

| Scale | Plaid Estimate | SnapTrade Estimate | Notes |
|-------|---------------|-------------------|-------|
| **100 users** | $1,000+/mo (platform fee dominated) | $200/mo | Plaid minimum kills you |
| **1,000 users** | $1,500-2,500/mo | $2,000/mo | Costs converging |
| **10,000 users** | $6,000-10,000/mo | $20,000/mo | Plaid wins with volume discounts |
| **10,000 users (negotiated)** | $4,000-6,000/mo | Negotiate | Volume matters |

### Recommended Progression for Maven

#### Phase 1: MVP (0-100 users)
- **Primary**: Manual CSV upload + statement parsing
- **Secondary**: SnapTrade for investment accounts ($2/user, no minimum)
- **Cost**: ~$200/mo
- **Rationale**: Validate product before committing to expensive infrastructure

#### Phase 2: Early Growth (100-1,000 users)
- **Primary**: SnapTrade or Quiltt
- **Secondary**: Add Plaid for bank accounts if needed
- **Cost**: $200-2,500/mo
- **Rationale**: Start with investment-focused provider for Maven's use case

#### Phase 3: Scale (1,000-10,000 users)
- **Evaluate**: Direct Plaid relationship, Quiltt's multi-aggregator approach
- **Negotiate**: Volume discounts become meaningful
- **Cost**: $2,000-10,000/mo depending on negotiation

### Which Provider to Start With

For a **wealth management app** like Maven:

1. **SnapTrade** — Best startup option for investments
   - $2/connected user/month, no minimum
   - Investment-focused (brokerages, not just banks)
   - Trading capability if needed later
   - 30+ brokerage integrations

2. **Plaid** — When you have scale OR need bank + investment
   - Best overall coverage
   - Requires $500-1K+ monthly commitment
   - Good for combined bank + investment

3. **Quiltt** — If you want multi-aggregator flexibility
   - Routes to MX, Finicity, Akoya, Plaid
   - Single API, wholesale pricing (25-30% off)
   - Good for optimizing coverage across providers

### Build vs Buy

| Approach | Pros | Cons |
|----------|------|------|
| **Buy (aggregator)** | Fast launch, maintained coverage, compliance handled | Cost, vendor dependency, data quality limitations |
| **Build direct integrations** | Full control, potentially cheaper at scale | Massive engineering effort, ongoing maintenance, legal complexity |
| **Hybrid** | Best of both | Complexity, multiple vendors |

**Recommendation**: Buy for now. Building direct integrations makes sense only at massive scale (100K+ users) or for specific high-priority institutions.

### Compliance Requirements

| Requirement | When Needed | Cost/Effort |
|-------------|-------------|-------------|
| **SOC 2 Type 1** | Enterprise sales, B2B partnerships | $20-50K, 3-6 months |
| **SOC 2 Type 2** | Required by many banks, large customers | $50-100K, 6-12 months |
| **GLBA** | If collecting financial data | Built into policies |
| **State Privacy Laws** | California (CCPA), etc. | Legal review |

**Minimum Viable Compliance**: 
- Privacy policy, data handling documentation
- Encryption at rest and in transit
- Access controls and audit logging
- SOC 2 can wait until you have enterprise customers

---

## 6. Alternatives to Traditional Aggregators

### Manual CSV Upload (MVP Approach)

**The underrated option for early-stage products**

| Pros | Cons |
|------|------|
| Zero aggregator cost | User friction |
| Works with ANY institution | No automation |
| Full data quality control | Requires parser development |
| No compliance complexity | Users may not have CSVs |

**Implementation Tips**:
- Support common formats: Schwab, Fidelity, Vanguard, E*TRADE
- Consider OFX/QFX files (standard format)
- Build flexible parser that improves over time
- Allow manual position entry as fallback

**Recommended For**: Maven's MVP to validate product before infrastructure investment

### Direct Brokerage API Integrations

| Brokerage | API Availability | Notes |
|-----------|-----------------|-------|
| **Schwab** | Yes (developer.schwab.com) | Full trading + data API, requires account |
| **E*TRADE** | Yes | Trading + data |
| **Fidelity** | No public API | Requires Akoya or partnership |
| **Vanguard** | No public API | Aggregators only |
| **Interactive Brokers** | Yes | Full API, complex |
| **Alpaca** | Yes | Commission-free, API-first |

**Reality Check**: Direct integrations are powerful but require:
- Individual business development with each brokerage
- Ongoing maintenance as APIs change
- Security reviews and compliance
- Not scalable to dozens of brokerages

### Specialized Investment Aggregators

| Provider | Focus | Pricing |
|----------|-------|---------|
| **SnapTrade** | Brokerage accounts + trading | $2/user/mo |
| **Vezgo** | Crypto + traditional | Custom |
| **Zabo** (acquired) | Was crypto-focused | N/A |

### Hybrid Approach (Recommended)

1. **Manual CSV** for MVP validation
2. **SnapTrade** for automated investment data
3. **Plaid** later for bank accounts if needed
4. **Direct APIs** for top 2-3 brokerages at scale

---

## 7. Provider Comparison Matrix

| Factor | Plaid | Yodlee | MX | Finicity | Akoya | SnapTrade |
|--------|-------|--------|-------|----------|-------|-----------|
| **Startup-Friendly** | ⭐⭐⭐ | ⭐ | ⭐⭐ | ⭐⭐ | ⭐ | ⭐⭐⭐⭐⭐ |
| **Investment Data** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Bank Coverage** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | N/A |
| **API Quality** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| **Pricing Transparency** | ⭐⭐ | ⭐ | ⭐ | ⭐ | ⭐ | ⭐⭐⭐⭐⭐ |
| **Connection Reliability** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Cost at 100 users** | $$$ | $$$$ | $$$ | $$$ | $$$ | $ |
| **Cost at 10K users** | $$ | $$ | $$ | $$ | $$ | $$$ |

---

## 8. Recommendations for Maven

### Immediate Actions

1. **Build CSV upload first** — Validate product with zero aggregator cost
2. **Evaluate SnapTrade** — $2/user pricing is startup-friendly for investments
3. **Skip Plaid initially** — $1K/mo minimum doesn't make sense at early stage

### Medium-term (1,000+ users)

1. **Negotiate with Plaid** — Volume starts to matter
2. **Consider Quiltt** — Multi-aggregator flexibility, wholesale pricing
3. **Begin SOC 2 Type 1** — Will need for enterprise customers

### Long-term (10,000+ users)

1. **Multi-aggregator strategy** — Use best provider per institution
2. **Direct brokerage integrations** — Top 2-3 brokerages
3. **SOC 2 Type 2** — Required for large financial institutions

### Key Risks

1. **Fidelity access** — May require Akoya relationship
2. **Connection reliability** — Plan for user complaints and support load
3. **Data quality** — Cost basis and tax lot data is often poor
4. **Regulatory changes** — 1033 implementation may shift the landscape

---

## Sources

- Plaid Documentation & Pricing (plaid.com/docs)
- YCombinator/Reddit discussions on aggregator pricing (2024-2025)
- Fintech Takes: "Aggregating the Aggregators" (June 2024)
- SnapTrade Pricing (snaptrade.com/pricing)
- Quiltt documentation (quiltt.io)
- CFPB Section 1033 rulemaking documents
- Industry reports on Evolve Bank breach (July 2024)
- Mastercard/Finicity documentation
- Various fintech forum discussions
