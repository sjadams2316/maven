# RIA Technology & Integration Compliance Research

**Research Date:** February 7, 2026  
**Purpose:** Architecture and compliance framework for Maven, an AI-native RIA  
**Context:** Maven plans to be its own RIA with Schwab as custodian, using a proprietary client-facing platform with potential TAMP integration for back-office capabilities

---

## Table of Contents
1. [Can an RIA Have a Proprietary Client-Facing Platform?](#1-proprietary-client-facing-platform)
2. [Custodian Integration Models](#2-custodian-integration-models)
3. [Schwab Advisor Services Specifically](#3-schwab-advisor-services)
4. [TAMP Integration Models](#4-tamp-integration-models)
5. [Discretionary Authority Through Technology](#5-discretionary-authority-through-technology)
6. [Model Portfolio Implementation](#6-model-portfolio-implementation)
7. [Data Sharing Requirements](#7-data-sharing-requirements)
8. [Client Portal Compliance](#8-client-portal-compliance)
9. [Outsourcing Compliance Considerations](#9-outsourcing-compliance)
10. [Maven Architecture Recommendations](#10-maven-architecture-recommendations)
11. [Build vs Buy Analysis](#11-build-vs-buy-analysis)

---

## 1. Proprietary Client-Facing Platform

### The Short Answer: YES

An RIA absolutely can have its own proprietary client-facing platform/website. This is in fact the model used by every robo-advisor (Betterment, Wealthfront, etc.) and increasingly by traditional RIAs seeking competitive differentiation.

### Compliance Requirements for Proprietary Platforms

#### SEC Registration Path: Internet Investment Adviser Exemption

The SEC provides a specific registration path for advisers who provide advice exclusively through an interactive website (Rule 203A-2(e)). Key requirements under the **2024 Amendment**:

1. **Operational Interactive Website**
   - Must be operational "at all times" (except temporary outages)
   - Includes websites, mobile applications, or "similar digital platforms"
   - Must provide "digital investment advisory services" on an ongoing basis
   - Must serve more than one client at all times

2. **Digital Investment Advisory Services Definition**
   - Must utilize "software-based models, algorithms, or applications"
   - Investment adviser personnel CANNOT "generate, modify, or otherwise provide client-specific investment advice through the operational interactive website or otherwise"
   - Human-directed client-specific investment advice is NOT eligible under this exemption
   - Client personal information must be collected through the website itself

3. **Elimination of De Minimis Exception**
   - Previous rule allowed up to 15 non-internet clients per 12 months
   - 2024 amendment eliminates this - ALL clients must be served exclusively through the interactive website

4. **Form ADV Representations Required**
   - Initial registration: "I will provide investment advice on an ongoing basis to more than one client exclusively through an operational interactive website"
   - Annual amendment: "I have provided and will continue to provide investment advice on an ongoing basis to more than one client exclusively through an operational interactive website"

#### Alternative: Traditional RIA with Technology-Enabled Platform

If Maven wants to combine algorithmic advice WITH human advisory services (hybrid model), it would NOT qualify for the Internet Investment Adviser Exemption and would need to:
- Register as a traditional RIA (SEC if >$100M AUM or multi-state, otherwise state-registered)
- Still use proprietary technology platform
- Comply with all standard RIA disclosure requirements

### What Must Be Disclosed About Technology

#### Form ADV Part 2A Disclosure Requirements for Algorithmic/AI Advisers:

1. **Algorithm Disclosure** (per SEC guidance):
   - General statement that an algorithm is used to manage client accounts
   - Description of how the algorithm is used (e.g., initial investment, periodic rebalancing)
   - Explanation of the underlying methodology (assumptions and limitations)
   - Third-party involvement in design, maintenance, or ownership of algorithm

2. **Risk Disclosure**:
   - Risks inherent in use of algorithm to manage client accounts
   - Lack of human interaction or intervention
   - Operational experience client should expect
   - Any instances when algorithm may rebalance without regard to market conditions

3. **AI-Specific Disclosures** (emerging best practice):
   - If AI tools form basis for investment or financial planning advice, disclose in Form ADV Part 2A brochure
   - Disclose use of AI in client agreements and communications where AI is leveraged

**Important:** You can protect proprietary trade secrets while meeting fiduciary obligations by focusing disclosure on:
- Assumptions and limitations of the underlying methodology
- Potential risks to clients
- Level of human oversight (not necessarily individual account monitoring)

### Examples of RIAs with Custom Platforms

1. **Betterment** - Pure robo-advisor with proprietary platform
2. **Wealthfront** - Pure robo-advisor with proprietary platform  
3. **Ellevest** - Robo-advisor with proprietary platform focused on women
4. **Personal Capital** (now Empower) - Hybrid with proprietary platform
5. **Vanguard Personal Advisor Services** - Hybrid model with technology platform

---

## 2. Custodian Integration Models

### What Can Flow Through RIA Platform vs Direct to Custodian

#### RIA Platform Functions (Can Build Internally):
- **Client onboarding and data collection** - Risk questionnaires, personal info gathering
- **Investment recommendations/advice generation** - Algorithmic or human
- **Portfolio construction and model selection** - Where strategy decisions are made
- **Client reporting and performance display** - Aggregated from custodian data
- **Financial planning tools** - Goal setting, projections
- **Document management** - Form delivery, signature collection
- **Client communication** - Messaging, notifications

#### Custodian Functions (Must Go Through Custodian):
- **Actual account opening** - Account creation happens at custodian
- **Trade execution** - Orders placed with custodian
- **Asset custody** - Securities held at custodian
- **Fund transfers** - ACH, wire transfers
- **Tax reporting** - 1099s, cost basis reporting
- **Official statements** - Account statements of record

#### Hybrid/Integrated Functions:
- **Account opening workflows** - RIA platform can pre-fill and validate, but submission goes to custodian
- **Trading instructions** - RIA platform generates orders, custodian executes
- **Data feeds** - Real-time/daily data flows from custodian to RIA platform

### Trading Authorization Through Technology

RIAs can obtain discretionary trading authority and execute trades through technology by:

1. **Limited Power of Attorney (LPOA)**
   - Client signs LPOA granting adviser discretionary authority
   - Can be embedded in advisory agreement or separate custodial form
   - Grants authority to buy, sell, or transact without prior client approval

2. **Automated Trading Execution**
   - RIA platform generates trade orders based on algorithm/models
   - Orders transmitted to custodian via API or trading platform
   - Custodian executes trades under LPOA authority

3. **Custodian Not Responsible for RIA Actions**
   - Custodians have no supervisory or compliance responsibility for RIAs
   - They don't evaluate whether RIA is "worthy" of discretionary authority
   - RIA is fully responsible for proper authority documentation

### Account Opening Flows

**Digital Onboarding Process (per Schwab):**
1. RIA platform collects client information
2. Data validated and guided through workflow
3. Pre-populated forms submitted to custodian
4. Digital signatures captured
5. Account opened at custodian
6. LPOA/authorization documents processed
7. Account linked to RIA trading authority

**Key Integration Points:**
- Third-party platform integration (CRM, planning tools)
- Real-time data validation
- Error reduction through guided workflows
- Not In Good Order (NIGO) rate reduction

### Data Access and APIs

**Standard Custodian Data Flows:**
1. **Daily Data Files** - Account positions, balances, transactions
2. **Real-time APIs** - Trading, account status queries
3. **Historical Data** - Performance calculation, reporting
4. **Document Delivery** - Statements, tax documents

---

## 3. Schwab Advisor Services Specifically

### Integration Capabilities

Schwab Advisor Services offers extensive integration for RIAs:

- **370+ RIA-focused solutions** with integrations available
- **Schwab OpenView Gateway®** - API integration platform (provided by Performance Technologies, Inc.)
- **Single Sign-On (SSO)** - Seamless access between platforms
- **Daily Data Files** - Account data feeds
- **Trading Integration** - Direct trade submission

### API Access for RIAs

**Schwab's API Program provides:**
- Automatic data import to third-party applications
- Account data access (positions, balances, transactions)
- Trading capabilities
- Account management functions

**Integration Matrix:**
- API integration available through Schwab OpenView Gateway®
- SSO provided by PTI (Performance Technologies, Inc.)
- Daily data files and trading integration through Charles Schwab & Co., Inc.

### Trading Platforms

**Schwab Advisor Center:**
- Proprietary trading platform for advisors
- Account management and trading
- Research and tools
- Model portfolios

**Third-Party Integration:**
- 235+ integrations with third-party technology platforms
- Direct trading integration with major portfolio management systems
- Rebalancing platform connectivity

### Digital Account Opening

Schwab offers digital onboarding workflow:
- Uses information from Schwab and third-party platforms
- Completely digital workflow
- Reduces errors and delays through data validation
- Guides advisor and client through account open process

### White-Labeling Considerations

Schwab does NOT provide white-label custody services where their name is hidden. Clients will know their assets are custodied at Schwab. However:
- RIA can be the primary relationship/brand
- Client experience flows through RIA platform
- Schwab serves as behind-the-scenes custodian
- Client statements and tax documents come from Schwab

---

## 4. TAMP Integration Models

### What is a TAMP Legally?

A **Turnkey Asset Management Platform (TAMP)** is typically a registered investment adviser (SEC or state) that provides:
- Portfolio management services
- Trading and rebalancing
- Back-office operations
- Performance reporting
- Billing services

TAMPs can operate as:
1. **Investment Adviser** - Providing advisory services
2. **Platform/Technology Provider** - Providing tools without advice
3. **Hybrid** - Both platform and optional advisory services

### How TAMPs Work with RIAs Operationally

**Sub-Advisory Model:**
- RIA maintains client relationship
- TAMP manages investments under sub-advisory agreement
- Client signs agreement with RIA; RIA has agreement with TAMP
- Investment management delegated to TAMP

**Platform Model:**
- RIA uses TAMP technology/platform
- RIA maintains discretionary authority
- TAMP executes trades at RIA's direction
- RIA uses TAMP's models or creates own

### Major TAMPs

| TAMP | Key Features |
|------|--------------|
| **Orion Portfolio Solutions** | #1 TAMP for technology, household-level rebalancing, multi-custodian integration |
| **Envestnet** | Largest TAMP by AUM, comprehensive wealth management platform |
| **AssetMark** | Full-service TAMP with advisor support |
| **SEI** | Institutional-grade platform, extensive integrations |
| **Brinker Capital** | Model portfolios, UMA capabilities |
| **Tamarac** (Envestnet) | Portfolio management, rebalancing, reporting |
| **Riskalyze** | Risk assessment, model portfolios |
| **GeoWealth** | Modern TAMP with integrated platform |

### Can Maven Be the "Orchestration Layer" with TAMPs as APIs?

**YES - This is a viable architecture.** Maven could:

1. **Maintain Primary Client Relationship**
   - Own the client experience
   - Provide proprietary platform/app
   - Deliver financial planning and advice

2. **Integrate TAMP Capabilities via API**
   - Trading/rebalancing execution
   - Model portfolio implementation
   - Performance calculation
   - Billing/fee calculation

3. **Choose Level of Integration:**
   - **Full TAMP Sub-Advisory**: TAMP has discretion, manages accounts
   - **Platform/Technology Only**: Maven retains discretion, uses TAMP tools
   - **Hybrid**: TAMP provides models, Maven executes

### TAMP Selection Criteria

**Key Factors to Evaluate:**

1. **Fee Structure Alignment**
   - Typical fees: 20-50 basis points
   - Watch for hidden fees in model lineups
   - Scalable pricing as AUM grows

2. **Technology/Integration**
   - API availability and documentation
   - Multi-custodian support
   - Integration with existing tech stack
   - Modern infrastructure vs. legacy systems

3. **Operational Fit**
   - Integrated vs. siloed workflows
   - White-label capabilities
   - Service and support quality
   - Growth scalability

4. **Compliance Infrastructure**
   - Built-in audit trails
   - Regulatory reporting support
   - Model governance

### Compliance Implications of TAMP Relationships

1. **Disclosure Requirements**
   - Must disclose use of third-party manager/sub-adviser in Form ADV
   - Disclose TAMP fees (either absorbed by RIA or passed to client)
   - Explain nature of TAMP relationship to clients

2. **Fiduciary Responsibility**
   - RIA remains fiduciary to client even when using TAMP
   - Must conduct due diligence on TAMP selection
   - Must monitor TAMP performance
   - Cannot outsource fiduciary duty itself

3. **Oversight Obligations**
   - Initial due diligence on TAMP
   - Ongoing monitoring of TAMP performance
   - Documentation of oversight activities
   - Issue management process

---

## 5. Discretionary Authority Through Technology

### Trading Authorization Requirements

To trade on behalf of clients without prior approval for each transaction:

1. **Written Authority**
   - Advisory agreement granting discretionary authority
   - Limited Power of Attorney (LPOA)
   - Can be in main agreement or separate form

2. **Form ADV Disclosure**
   - Item 5.F: Discretionary authority
   - Describe scope and nature of discretion
   - Disclose number of accounts with discretionary authority

3. **Custodian Documentation**
   - Trading authorization on file with custodian
   - LPOA forms per custodian requirements

### Client Consent for Automated Trading

**Advisory Agreement Language Should Include:**

1. **Grant of Discretionary Authority**
   > "Client grants Advisor the discretionary authority to buy, sell, or otherwise transact in securities or other investment products in one or more of the Client's designated account(s) without necessarily consulting the Client in advance or seeking the Client's pre-approval for each transaction."

2. **Algorithm/Automated Trading Disclosure**
   - That algorithm/automated system makes investment decisions
   - How often rebalancing may occur
   - That trades execute without prior individual trade approval
   - Any circumstances where algorithm may trade without regard to market conditions

3. **Restrictions**
   - Client-imposed restrictions (e.g., no specific sectors)
   - Specify whether discretion extends to third-party manager selection

### Documentation Requirements

1. **Advisory Agreement** - Signed, with discretionary authority clause
2. **Form ADV Delivery** - Brochure delivered before or at agreement signing
3. **LPOA Forms** - Per custodian requirements
4. **Risk Disclosures** - Algorithm/technology-specific risks
5. **Records Retention** - All documents per SEC Rule 204-2

---

## 6. Model Portfolio Implementation

### UMA/SMA Structures

#### Separately Managed Account (SMA)
- Single investment strategy per account
- Direct securities ownership
- Typically for higher minimums ($100K+)
- Individual securities, not pooled

#### Unified Managed Account (UMA)
- Multiple investment types in single account
- Integrates stocks, bonds, ETFs, mutual funds
- "Buckets" or "sleeves" for different strategies
- Aggregated management and reporting
- Household-level view

#### Model Delivery vs Discretionary Management

| Feature | Model Delivery | Discretionary Management |
|---------|---------------|-------------------------|
| Who has discretion | Receiving RIA | TAMP/Model Manager |
| Trade execution | RIA executes | TAMP executes |
| Customization | Full flexibility | Limited to model |
| Fiduciary duty | Fully with RIA | Shared/Delegated |
| Compliance burden | Higher for RIA | Partially shifted |

### Implementation Options for Maven

**Option 1: Model Marketplace Consumer**
- Subscribe to third-party models
- Maven maintains discretion
- Execute via TAMP platform

**Option 2: Model Creator**
- Maven creates proprietary models
- Use TAMP for execution/rebalancing
- Maintain full investment control

**Option 3: Hybrid**
- Proprietary models for core strategies
- Third-party models for specialized needs
- Unified platform experience

---

## 7. Data Sharing Requirements

### Regulatory Restrictions

**Generally NO regulatory restrictions on:**
- Data flow between RIA and custodian
- Using custodian data in RIA platform
- Aggregating client data for reporting

**Requirements:**
- Client consent for data collection/use
- Privacy policy disclosure
- Safeguard customer information (Regulation S-P)
- Data security measures

### Privacy Considerations

**Regulation S-P Requirements:**
1. **Privacy Notice** - Describe privacy practices
2. **Safeguard Rule** - Protect customer information
3. **Disposal Rule** - Properly dispose of customer information
4. **Breach Notification** - 72-hour notification requirement (2024 update)

**Third-Party Data Sharing:**
- Must have oversight of any third party accessing client data
- Due diligence on data security practices
- Contractual protections required

### Real-time vs Batch Data

| Data Type | Typical Availability | Use Case |
|-----------|---------------------|----------|
| Positions | Daily/Real-time | Portfolio display |
| Transactions | Daily | Reconciliation |
| Balances | Daily/Real-time | Client portal |
| Performance | Daily | Reporting |
| Tax lots | Daily | Tax optimization |

**Schwab Data Availability:**
- Daily data files through standard integration
- Real-time available through API integration
- Historical data for performance calculation

---

## 8. Client Portal Compliance Requirements

### What Must Be Shown

**Required Disclosures:**
1. **Fees** - Clear, accurate fee information
2. **Performance** - If shown, must follow advertising rules
3. **Form ADV Brochure** - Access to current version
4. **Form CRS** - For retail investors
5. **Privacy Policy** - How client data is used

### Performance Reporting Rules

**SEC Marketing Rule Considerations:**

1. **No False or Misleading Statements**
   - Performance must be accurate and verifiable
   - Cannot cherry-pick favorable periods

2. **Gross/Net Performance**
   - Must show net performance (after fees)
   - Can show gross if net also shown with equal prominence

3. **Time Periods**
   - Must show 1, 5, and 10-year performance (or since inception)
   - Cannot show selective periods

4. **Hypothetical Performance**
   - Restricted primarily to sophisticated investors
   - Requires extensive disclosures
   - Must have reasonable basis

5. **Model Performance**
   - If showing model/back-tested performance, extensive disclosures required
   - Must clearly distinguish from actual performance

### What's Restricted

1. **Testimonials** - Now allowed under Marketing Rule with proper disclosures
2. **Hypothetical Performance** - Restricted to sophisticated investors
3. **Third-Party Ratings** - Specific disclosure requirements
4. **Cherry-Picked Performance** - Prohibited
5. **Guarantees** - Cannot guarantee results

---

## 9. Outsourcing Compliance Considerations

### What Can Be Outsourced

Virtually any function CAN be outsourced, including:
- Investment management (via TAMP/sub-adviser)
- Trading and rebalancing
- Portfolio accounting
- Client reporting
- Billing
- Compliance support
- Cybersecurity
- Client servicing

**HOWEVER:** Fiduciary duty CANNOT be outsourced

### Oversight Requirements (SEC Proposed Rule - Status TBD)

**Note:** SEC proposed outsourcing rule in 2022 that would require formal oversight of "covered functions." Rule status unclear - may be withdrawn or modified. However, existing guidance and best practices include:

**Pre-Engagement Due Diligence:**
1. Identify and assess risks of outsourcing
2. Evaluate service provider qualifications
3. Review security and compliance practices
4. Request SOC 2 reports, security policies
5. Document decision to outsource

**Ongoing Monitoring:**
1. Monitor service provider performance
2. Track against SLAs
3. Reassess risks periodically
4. Document oversight activities

**Contractual Requirements:**
1. Define service expectations
2. Data protection requirements
3. Breach notification obligations (72 hours)
4. Right to audit
5. Termination rights

### Vendor Due Diligence Checklist

- [ ] Information security policies
- [ ] SOC 2 report (Type II preferred)
- [ ] Privacy policy
- [ ] Business continuity/disaster recovery plan
- [ ] Cybersecurity assessment
- [ ] Regulatory compliance history
- [ ] Financial stability
- [ ] Insurance coverage
- [ ] References/reputation

---

## 10. Maven Architecture Recommendations

### Recommended Architecture: Hybrid Model

Based on this research, the optimal architecture for Maven:

```
┌─────────────────────────────────────────────────────────────┐
│                    MAVEN (RIA)                               │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           PROPRIETARY CLIENT LAYER                      │ │
│  │  • Client Portal (Web/Mobile App)                       │ │
│  │  • AI-Powered Financial Planning                        │ │
│  │  • Client Onboarding/KYC                               │ │
│  │  • Algorithmic Investment Recommendations              │ │
│  │  • Communication/Messaging                              │ │
│  └────────────────────────────────────────────────────────┘ │
│                            │                                  │
│                            ▼                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         TAMP INTEGRATION LAYER (APIs)                   │ │
│  │  • Trading/Rebalancing Engine (Orion, Tamarac)         │ │
│  │  • Model Portfolio Delivery                             │ │
│  │  • Performance Calculation                              │ │
│  │  • Billing/Fee Calculation                              │ │
│  │  • Portfolio Accounting                                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                            │                                  │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                 SCHWAB ADVISOR SERVICES                      │
│                      (Custodian)                             │
│  • Account Custody                                           │
│  • Trade Execution                                           │
│  • Cash Management                                           │
│  • Tax Reporting                                             │
│  • Official Statements                                       │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Principles

1. **Own the Client Experience**
   - Maven platform is primary client touchpoint
   - Proprietary UI/UX
   - AI-native design

2. **Use Best-in-Class Back Office**
   - Don't rebuild rebalancing engines
   - Leverage proven TAMP infrastructure
   - Focus engineering on differentiation

3. **Maintain Investment Authority**
   - Maven retains discretionary authority
   - Own investment philosophy and models
   - TAMP executes at Maven's direction

4. **Schwab as Custody Foundation**
   - Reliable, scalable custodian
   - Strong API capabilities
   - Brand credibility

### Registration Strategy

**Phase 1: Launch (State Registration)**
- Register in home state initially
- Qualify as multi-state (15+ states) quickly
- OR use 120-day exemption to register SEC immediately

**Phase 2: Growth (SEC Registration)**
- Register with SEC as Internet Investment Adviser (if purely algorithmic)
- OR register as standard RIA (if hybrid human + AI)
- Maintain proper disclosures

### Compliance Priorities

1. **Form ADV Disclosures**
   - Algorithm/AI methodology
   - Technology risks and limitations
   - TAMP relationships
   - Fee structure

2. **Advisory Agreements**
   - Discretionary authority grants
   - Algorithm-specific consents
   - TAMP sub-advisory disclosure

3. **Oversight Programs**
   - TAMP due diligence and monitoring
   - Cybersecurity oversight
   - Vendor management

---

## 11. Build vs Buy Analysis

### What to BUILD (Proprietary)

| Component | Rationale |
|-----------|-----------|
| Client Portal/App | Core differentiator, brand experience |
| AI Advisory Engine | Proprietary methodology, competitive moat |
| Financial Planning Tools | Personalized experience |
| Client Onboarding | Custom user journey |
| Communication/Engagement | Brand voice, relationship |

### What to BUY/INTEGRATE (TAMP/Vendor)

| Component | Rationale |
|-----------|-----------|
| Trading/Rebalancing | Proven, regulated, complex to build |
| Portfolio Accounting | Table stakes, no competitive advantage |
| Performance Calculation | Standards-based, audit requirements |
| Billing Engine | Operational efficiency |
| Compliance Monitoring | Specialized expertise |

### Cost Comparison

**Build Full Stack:**
- Higher upfront investment ($2-5M+)
- Longer time to market (12-24 months)
- Full control
- Higher ongoing maintenance
- Regulatory burden

**TAMP Integration:**
- Lower upfront cost (<$500K platform + fees)
- Faster time to market (3-6 months)
- 20-50 bps ongoing cost
- Less control
- Shared compliance burden

### Recommended Approach

**Hybrid: Build What Differentiates, Buy What's Commoditized**

1. **BUILD** client experience and AI advisory engine
2. **INTEGRATE** TAMP for trading/rebalancing/accounting
3. **USE** Schwab for custody
4. **OUTSOURCE** compliance support initially

This approach:
- Minimizes time to market
- Focuses engineering on competitive advantage
- Leverages proven infrastructure
- Maintains regulatory compliance
- Scales efficiently

---

## Appendix: Key Sources

1. SEC IM Guidance Update 2017-02 (Robo-Advisers)
2. SEC Internet Investment Adviser Exemption 2024 Amendment
3. Investment Advisers Act of 1940, Section 205
4. Schwab Advisor Services Integration Documentation
5. Kitces.com - SEC Internet Investment Adviser Exemption
6. Kitces.com - Advisory Agreement Requirements
7. Comply.com - RIA Compliance Guide
8. Various TAMP Provider Documentation (Orion, GeoWealth)
9. SEC Proposed Outsourcing Rule (2022)
10. SEC Regulation S-P (Privacy)
