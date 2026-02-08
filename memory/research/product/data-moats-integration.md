# Data Moats & Integration Strategy
*Research Date: 2026-02-05*

## The Data Hierarchy of Value

### Tier 1: Commodity Data (No Moat)
- Market prices
- Basic account balances
- Standard portfolio metrics
- Public company information

**Everyone has this. It's not a differentiator.**

### Tier 2: Aggregated Data (Weak Moat)
- Multi-account consolidation
- Net worth calculation
- Basic transaction categorization

**Plaid/Yodlee provide this. 6-month head start max.**

### Tier 3: Enriched Data (Medium Moat)
- Intelligent categorization (AI-powered)
- Behavioral patterns
- Spending/saving trends
- Tax optimization opportunities

**Requires ML investment. 1-2 year head start.**

### Tier 4: Proprietary Intelligence (Strong Moat)
- Cross-client pattern recognition
- Advisor behavior models
- Predictive client analytics
- Proprietary benchmarks

**Network effects kick in. Very hard to replicate.**

---

## Data Aggregation: Plaid vs Yodlee vs MX

### Plaid

**Pros:**
- Fast integration (weeks, not months)
- Developer-friendly APIs
- Strong in consumer banking
- 12,000+ US institutions
- Real-time webhooks

**Cons:**
- Investment data less robust
- Capital One connectivity issues (historically)
- Per-transaction pricing model can be expensive at scale
- 89% out-of-box categorization accuracy

**Best For:** Quick MVP, consumer banking focus

### Yodlee (Envestnet)

**Pros:**
- 19,000+ data sources globally
- 92% categorization accuracy
- Deeper wealth management heritage
- Strong in investment accounts
- Envestnet ecosystem integration

**Cons:**
- Longer integration (months)
- Higher minimums and pricing
- Connectivity success rates lower than Plaid
- Enterprise-focused, less startup-friendly

**Best For:** Full wealth management picture, enterprise clients

### MX

**Pros:**
- Beautiful pre-built UI components
- Good for large organizations
- Strong in credit unions
- Data enrichment built-in

**Cons:**
- Uses other aggregators under the hood (including Quovo)
- Less control over data pipeline
- Higher pricing

**Best For:** Organizations wanting turnkey solution

### **Maven Recommendation:**
Start with **Plaid** for speed to market. Layer in **Yodlee** for investment account depth as needed. Build proprietary enrichment on top of raw data.

---

## Custodian Integration Strategy

### The Big Three

| Custodian | RIA Market Share | API Quality | Integration Priority |
|-----------|------------------|-------------|---------------------|
| Schwab (incl. TDA) | ~50% | Good, improving | CRITICAL |
| Fidelity | ~25% | Good | HIGH |
| Pershing | ~15% | Moderate | MEDIUM |

### Schwab API Capabilities:
- Account data and positions
- Trading (limited)
- Performance reporting
- SSO integration
- Expanding API ecosystem post-TDA merger

### Fidelity API Capabilities:
- Open architecture approach
- Strong data APIs
- Good SSO
- WealthScape integration

### Integration Approach:

**Phase 1: Read-Only**
- Account positions
- Performance data
- Transaction history
- Client demographics

**Phase 2: Write Capabilities**
- Trading integration (careful!)
- Account opening
- Money movement
- Document management

**Phase 3: Deep Integration**
- Real-time data feeds
- Compliance integration
- Billing automation
- Custom reporting

---

## Real-Time vs Batch Data

### Real-Time Use Cases:
- Trading applications
- Alert triggers
- Live client meetings
- Intraday monitoring

**Cost:** Higher, requires streaming infrastructure

### Batch (Daily) Use Cases:
- Performance reporting
- Rebalancing analysis
- Tax calculations
- Most planning scenarios

**Cost:** Lower, simpler infrastructure

### Maven Approach:
- **Batch by default** for cost efficiency
- **Real-time available** as premium feature for trading-active advisors
- **Smart caching** with freshness indicators
- **On-demand refresh** when user needs current data

---

## Building Data Defensibility

### The Network Effect Strategy:

1. **Aggregate advisor behavior**
   - What recommendations work?
   - Which client conversations succeed?
   - What triggers client satisfaction?

2. **Build proprietary benchmarks**
   - "Maven Advisors" performance
   - Client satisfaction indices
   - Best practice patterns

3. **Create comparison data**
   - "How does my practice compare?"
   - Anonymous peer benchmarking
   - Industry trend identification

### The AI Training Loop:

```
Advisor makes recommendation
        ↓
Track client action/response
        ↓
Measure outcome over time
        ↓
Train models on success patterns
        ↓
Better recommendations
        ↓
More advisor adoption
        ↓
More data
        ↓
Better models
        ↓
MOAT DEEPENS
```

---

## Integration Prioritization Framework

### Criteria for Integration Priority:

1. **Market coverage** - What % of advisors use this?
2. **Data value** - What unique data does it provide?
3. **Switching cost** - How sticky is this integration?
4. **Revenue potential** - Does it enable paid features?
5. **Implementation effort** - How hard is it?

### Priority Matrix:

| Integration | Coverage | Value | Sticky | Revenue | Effort | SCORE |
|------------|----------|-------|--------|---------|--------|-------|
| Schwab | 50% | High | High | High | Med | **A** |
| Fidelity | 25% | High | High | High | Med | **A** |
| Plaid | 90% | Med | Low | Med | Low | **A** |
| Pershing | 15% | High | High | Med | High | **B** |
| Orion | 20% | Med | Med | Med | Med | **B** |
| eMoney | 30% | Med | Med | Low | Med | **C** |
| Salesforce | 15% | Low | Med | Low | High | **C** |

### Integration Roadmap:

**Month 1-3:**
- Plaid (all accounts aggregation)
- Schwab (primary custodian)

**Month 4-6:**
- Fidelity (second custodian)
- Basic CRM import/export

**Month 7-12:**
- Pershing (third custodian)
- Deep Orion/Envestnet integration
- Advanced planning software connections

---

## Data Security Requirements

### Financial Data Standards:
- **SOC 2 Type II** certification (mandatory)
- **AES-256** encryption at rest
- **TLS 1.3** in transit
- **Regular penetration testing**
- **FINRA/SEC compliance** frameworks

### Advisor Expectations:
- Ability to delete client data
- Audit trails for all access
- Role-based permissions
- MFA everywhere
- Vendor security questionnaire ready

---

## The Held-Away Account Challenge

### The Problem:
Advisors often only see 30-50% of client wealth (what they manage). The rest is:
- 401(k) at employer
- Spouse's accounts
- Real estate equity
- Business ownership
- Inheritance expected
- Life insurance cash value

### The Opportunity:
Platform that shows **complete picture** wins trust and AUM.

### Solution:
1. Plaid for bank/brokerage accounts
2. Manual entry for real estate, business
3. Document storage for estate plans, insurance
4. Reminder system for periodic updates
5. AI to estimate held-away based on patterns

---

## Alternative Data Sources (Future)

### Emerging Data That Could Create Moat:

1. **Tax return integration** (with permission)
   - Actual income data
   - Real tax situation
   - Business complexity

2. **Social Security projections**
   - Direct SSA integration
   - Personalized benefit estimates

3. **Health data** (sensitive, careful)
   - Longevity estimates
   - Healthcare cost modeling

4. **Career/income trajectory**
   - LinkedIn integration
   - Industry trends
   - Compensation benchmarks

5. **Real estate values**
   - Zillow/Redfin APIs
   - Automated home equity updates

---

## Data Pricing Intelligence

### What Aggregators Charge:

**Plaid:**
- Free tier available (limited)
- $0.10-$0.50 per connected account/month
- Volume discounts significant

**Yodlee:**
- Higher minimums ($25K+/year often)
- Better pricing at scale
- Negotiable for strategic partners

### Cost Management:
- Only refresh data when needed
- Implement smart caching
- Batch requests where possible
- Negotiate annual contracts for predictability

### Pass-Through Strategy:
Consider: Should advisors pay extra for more account connections?
- Freemium: 5 linked accounts included
- Pro: Unlimited accounts
- This creates natural upsell while managing costs
