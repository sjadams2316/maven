# Fiduciary Duty in Practice: Legal Obligations for AI-Native RIAs

**Research compiled: February 7, 2026**  
**For: Maven (AI-Native RIA)**  
**Status: Critical Legal Research**

---

## Executive Summary

Fiduciary duty under the Investment Advisers Act of 1940 imposes a federal standard of conduct on all registered investment advisers, including robo-advisors and AI-native platforms like Maven. This duty encompasses two primary components: the **Duty of Care** (requiring reasonable and suitable advice) and the **Duty of Loyalty** (requiring elimination or disclosure of conflicts of interest).

### Key Obligations at a Glance

| Obligation | Core Requirement | How Maven Must Address |
|------------|------------------|----------------------|
| Duty of Care | Provide advice in client's best interest with reasonable diligence | Algorithmic suitability, continuous monitoring, reasonable basis for recommendations |
| Duty of Loyalty | Not subordinate client interests to firm's own interests | Disclose all material conflicts, obtain informed consent, eliminate conflicts where possible |
| Disclosure | Full and fair disclosure of all material facts | ADV Part 2 brochure, Form CRS, interactive disclosures on platform |
| Suitability | Recommendations appropriate to client's financial situation | Comprehensive client profiling, risk tolerance assessment, periodic updates |
| Best Execution | Seek most favorable execution for client transactions | Periodic review of execution quality, disclose if using affiliated broker |

**Critical Finding**: The SEC explicitly confirmed in 2019 that robo-advisers and automated investment advisers are subject to the same fiduciary duty as human advisers. The firm—not the algorithm—bears liability for fiduciary breaches.

---

## Part I: Legal Foundation of Fiduciary Duty

### 1.1 Investment Advisers Act of 1940 — Section 206

Section 206 is the statutory foundation of fiduciary duty. It states it is unlawful for any investment adviser:

> "(1) to employ any device, scheme, or artifice to defraud any client or prospective client;
> 
> (2) to engage in any transaction, practice, or course of business which operates as a fraud or deceit upon any client or prospective client..."

**Key Points:**
- Unlike Exchange Act Section 10(b), Section 206 liability does NOT require the fraud be "in connection with" the purchase or sale of a security
- Section 206(1) requires scienter (intent)
- Section 206(2) can be violated through mere negligence
- Applies to SEC-registered advisers, state-registered advisers, and exempt advisers

**Citation**: 15 U.S.C. § 80b-6

### 1.2 SEC v. Capital Gains Research Bureau (1963) — The Landmark Case

The Supreme Court's 1963 decision in *SEC v. Capital Gains Research Bureau, Inc.*, 375 U.S. 180, established that Section 206 imposes a federal fiduciary duty on investment advisers.

**Facts**: Investment adviser purchased securities, recommended them to clients, then sold when prices rose (scalping).

**Holding**: Even though scalping doesn't constitute common law fraud, it violates Section 206 because:

> "Congress intended the Investment Advisers Act to establish federal fiduciary standards for investment advisers."

**Key Language**:

> "[T]he Advisers Act thus reflects... a congressional intent to **eliminate, or at least to expose, all conflicts of interest** which might incline an investment adviser—consciously or unconsciously—to render advice which was not disinterested."

**Implications**:
- Investment advisers have an "affirmative duty of utmost good faith and full and fair disclosure of all material facts"
- They must "employ reasonable care to avoid misleading clients"
- The term "fraud" in Section 206 is read more broadly than common law fraud
- The statute should be read "flexibly to effectuate its remedial purposes"

### 1.3 Subsequent Supreme Court Confirmation

**Santa Fe Industries v. Green (1977)**:
> "Congress intended the Investment Advisers Act to establish federal fiduciary standards for investment advisers." (430 U.S. 462, 471 n.11)

**Transamerica Mortgage Advisors, Inc. v. Lewis (1979)**:
> "§ 206 establishes 'federal fiduciary standards' to govern the conduct of investment advisers." (444 U.S. 11, 17)

---

## Part II: The Two Components of Fiduciary Duty

### 2.1 Duty of Care

The Duty of Care requires an adviser to provide investment advice that is in the best interest of the client, exercising reasonable diligence, care, and skill.

#### 2.1.1 Key Sub-Obligations

**A. Reasonable Inquiry / Suitability**

The adviser must have a reasonable understanding of the client's:
- Financial situation
- Investment experience
- Investment objectives
- Risk tolerance
- Time horizon
- Liquidity needs

**Source**: SEC 2019 Final Interpretation, citing Investment Advisers Act Release No. 1406 (Mar. 16, 1994)

> "An adviser must make a reasonable inquiry into a client's financial situation, investment experience, and investment objectives."

**For Robo-Advisors**: "Both robo-advisers and human advisers can meet this fiduciary requirement so long as they ask the right questions and clarify conflicting information." The questionnaire approach is acceptable if sufficiently comprehensive.

**B. Reasonable Basis for Recommendations**

The adviser must have a reasonable belief that the advice is suitable for the particular client based on:
- Client's investment profile
- Costs and reasonably available alternatives
- Product characteristics and risks

> "An adviser must provide investment advice that is suitable for its client in providing advice that is in the best interest of its client."

**C. Duty to Investigate**

The adviser has a duty to make a reasonable investigation before making recommendations, particularly regarding:
- Complex or risky products
- Products with unusual features
- Third-party investments (private funds, etc.)

**Case Example**: *In re Larry C. Grossman*, Advisers Act Release No. 4543 (Sept. 30, 2016) — Adviser held liable for recommending offshore private investment funds without adequate due diligence.

**D. Best Execution**

When selecting broker-dealers to execute transactions, advisers must seek the best execution reasonably available under the circumstances, considering:
- Total costs (commissions, spreads, fees)
- Execution quality
- Financial responsibility of the broker
- Value of research services provided

**Note**: Advisers CAN use affiliated brokers, but must disclose the conflict and ensure best execution is still achieved.

**E. Duty to Monitor (for Ongoing Relationships)**

For ongoing advisory relationships, advisers have a duty to:
- Monitor client accounts on an ongoing basis
- Periodically update client investment profile
- Evaluate whether advice remains appropriate
- Consider whether account type continues to be in client's best interest

> "[W]here the investment adviser's duties include management of the account, [the adviser] is under an obligation to monitor the performance of the account and to make appropriate changes in the portfolio."

#### 2.1.2 What the Duty of Care Does NOT Require

- **No credentials requirement**: Federal law does not require investment advisers to have specific credentials, licenses, or certifications
- **No guarantee of success**: The duty is to exercise reasonable care, not to ensure investment success
- **No prohibition on reasonable costs**: Charging fees is permitted if disclosed and reasonable
- **No independent research requirement**: Advisers may rely on research from others, but must have reasonable basis for recommendations

### 2.2 Duty of Loyalty

The Duty of Loyalty requires an adviser not to subordinate client interests to its own interests. This is a disclosure-based standard—conflicts are permitted if properly disclosed and consented to.

#### 2.2.1 Core Requirements

**A. Full and Fair Disclosure**

Advisers must provide "full and fair disclosure of all material facts" relating to:
- The advisory relationship
- Conflicts of interest
- Fees and compensation
- Business practices

> "Disclosure must be sufficiently specific so that the client is able to understand the conflicts of interest the adviser has and the business practices in which the adviser engages, and can give informed consent to such conflicts or practices or reject them."

**What is "Material"?** Information is material if there is a substantial likelihood that a reasonable client would consider it important in deciding whether to enter into or continue an advisory relationship.

**B. Informed Consent**

After disclosure, the adviser must obtain the client's informed consent to:
- Material conflicts of interest
- Business practices that may affect the client

> "Informed consent requires a client's agreement to the adviser's terms of business after full and fair disclosure of material facts and the implications of those facts."

**C. Seek to Avoid or Eliminate Conflicts**

The SEC's position:
> "[A]n adviser must seek to avoid conflicts of interest with its clients, and, at a minimum, make full disclosure of all material conflicts of interest between the adviser and its clients that could affect the advisory relationship."

**The hierarchy**:
1. Best: Eliminate the conflict entirely
2. Second: Mitigate the conflict
3. Minimum: Full and fair disclosure + informed consent

#### 2.2.2 Common Conflicts of Interest

| Conflict Type | Example | Disclosure/Mitigation |
|--------------|---------|----------------------|
| **Fee-based compensation** | Higher fees on certain products | Disclose all fee structures, avoid recommending higher-fee products when lower-fee alternatives exist |
| **Revenue sharing** | Payments from custodians or fund companies | Specific disclosure of amounts and sources |
| **12b-1 fees** | Payments from mutual funds | Disclose; strongly consider using lowest-cost share class |
| **Affiliated products** | Recommending firm's proprietary funds | Full disclosure; document reasonable basis for recommendation |
| **Soft dollars** | Research paid through client commissions | ADV Part 2A disclosure; ensure execution quality |
| **Principal trading** | Adviser buying/selling from own inventory | Written consent per transaction (Section 206(3)) |

#### 2.2.3 What CANNOT Be Waived

**Critical**: The federal fiduciary duty itself cannot be waived.

> "Because an adviser's federal fiduciary obligations are enforceable through section 206 of the Advisers Act, we would view a waiver of enforcement of section 206 as implicating section 215(a) of the Advisers Act, which provides that 'any condition, stipulation or provision binding any person to waive compliance with any provision of this title... shall be void.'"

**However**, the *scope* of the advisory relationship can be defined by agreement:
- Limiting services to certain account types
- Defining monitoring frequency
- Restricting recommendations to certain asset classes

---

## Part III: Key Case Law and Enforcement Actions

### 3.1 Landmark Cases

**SEC v. Capital Gains Research Bureau, Inc., 375 U.S. 180 (1963)**
- Established fiduciary duty under Advisers Act
- Scalping (trading ahead of recommendations) violates Section 206

**Transamerica Mortgage Advisors, Inc. v. Lewis, 444 U.S. 11 (1979)**
- Confirmed federal fiduciary standards
- Established private right of action for equitable relief

**Robare Group, Ltd. v. SEC, 922 F.3d 468 (D.C. Cir. 2019)**
- Section 206(2) violations require only negligence, not scienter
- Inadequate disclosure of revenue sharing payments violated fiduciary duty

### 3.2 SEC Enforcement Themes

The SEC has brought numerous enforcement actions on these common violations:

#### 3.2.1 Failure to Disclose Conflicts

**Moors & Cabot (2019)**: Failed to disclose conflicts relating to revenue sharing payments and other financial incentives received from clearing brokers.

**Key Quote from Enforcement Release**:
> "The RIA did not provide full and fair disclosure of these fees and revenue sharing payments and the related conflicts of interest."

#### 3.2.2 Share Class Selection

Numerous enforcement actions for recommending higher-cost share classes when lower-cost alternatives were available:
- Advisers receiving 12b-1 fees recommended share classes paying those fees
- Failed to disclose that cheaper share classes existed
- Resulted in client paying unnecessary expenses

**SEC Position**: "General" disclosures about potential receipt of 12b-1 fees are inadequate if adviser actually recommends higher-fee classes when cheaper alternatives exist.

#### 3.2.3 Robo-Advisor Specific Actions

**Wealthfront Advisers (2018)**:
- False disclosures about tax-loss harvesting methodology
- Improperly re-tweeted client testimonials
- Paid bloggers for referrals without proper disclosure
- Failed to maintain compliance program

**Betterment (2023)**: $9 million settlement
- Overstated benefits of tax-loss harvesting strategies
- Failed to disclose material changes to tax-loss harvesting methodology
- Violated fiduciary duty by not informing customers of algorithm changes

**Key Lesson**: Robo-advisors must accurately describe their algorithms and promptly disclose material changes.

### 3.3 Common Violations Summary

| Violation Category | Frequency | Typical Penalty |
|-------------------|-----------|-----------------|
| Failure to disclose conflicts | Very High | Disgorgement + civil penalty |
| Undisclosed revenue sharing | High | Disgorgement + civil penalty |
| Share class selection | High | Disgorgement of excess fees |
| Inadequate compliance policies | High | Censure + remediation |
| Misleading performance claims | Medium | Civil penalty + disgorgement |
| Custody violations | Medium | Censure + enhanced supervision |
| Unsuitable recommendations | Medium | Censure + civil penalty |

---

## Part IV: Robo-Advisors and AI — Special Considerations

### 4.1 SEC Guidance on Robo-Advisers (2017)

The SEC's Division of Investment Management issued IM Guidance Update No. 2017-02 specifically addressing robo-advisers. Key points:

**1. Same Standards Apply**
> "Automated advisers, like all SEC-registered investment advisers, are subject to all of the requirements of the Advisers Act, including the requirement that they provide advice consistent with the fiduciary duty they owe to their clients."

**2. Three Focus Areas**:
- Disclosure
- Suitability determination
- Compliance programs

**3. Interactive Disclosures**
> "A robo-adviser's use of 'interactive text' or 'pop-up boxes' on its website could be useful to provide its retail investors with explanations for terms used in the questionnaires or disclosures."

### 4.2 SEC 2019 Confirmation

The 2019 Final Interpretation explicitly addressed robo-advisers:

> "This Final Interpretation also applies to automated advisers, which are often colloquially referred to as 'robo-advisers.' Automated advisers, like all SEC-registered investment advisers, are subject to all of the requirements of the Advisers Act, including the requirement that they provide advice consistent with the fiduciary duty they owe to their clients."

### 4.3 Liability Framework for AI Advice

**Critical Question**: Who is liable when an algorithm makes an unsuitable recommendation?

**Answer**: THE FIRM IS LIABLE.

> "The firm is liable for any breaches of fiduciary duty under the federal fiduciary standard (as well as any state law fiduciary standards, if applicable)."

**Why?**
- The fiduciary duty attaches to the registered investment adviser (the firm)
- The algorithm is treated as a tool used by the firm
- Poor design or inaccurate algorithms may give rise to fiduciary violations
- The firm must be able to explain and justify the algorithm's decisions

### 4.4 Key Challenges for AI-Driven Advice

**1. Explainability**

If the algorithm's reasoning cannot be explained, the firm likely violates its fiduciary duty:

> "This failure to explain the algorithm's reasoning would likely violate the firm's fiduciary duty. This failure to supervise the algorithm's decision making would likely violate the adviser's duty to have a 'reasonable basis' in its recommendation if it cannot actually explain why the algorithm did what it did."

**Implication for Maven**: Must be able to explain WHY a recommendation was made to each client.

**2. Questionnaire Limitations**

Robo-advisers typically rely on questionnaires. Key considerations:
- Questions must be sufficiently comprehensive
- Must clarify conflicting information
- Must provide mechanism to update preferences
- Cannot be so limited that advice is actually "impersonal"

**3. Market Shock Scenarios**

What happens when market conditions change rapidly?
- Algorithm may make decisions that weren't anticipated
- Firm must have procedures to monitor algorithm behavior
- May need circuit breakers or human oversight

**4. Algorithm Changes**

Material changes to algorithms must be disclosed to clients:
- Betterment was sanctioned for changing tax-loss harvesting without disclosure
- Changes that affect investment methodology are material facts

### 4.5 Human Oversight Requirements

While not explicitly mandated, practical requirements suggest:

**Current State of Law**:
> "At the core of securities regulation lies fiduciary duties owed by private fund advisors to their investors. Today, AI cannot fulfill these fiduciary duties without human oversight."

**Best Practices**:
- Human review of algorithm outputs
- Periodic validation of algorithm accuracy
- Oversight of algorithm changes
- Ability to override algorithm when appropriate
- Documentation of supervision activities

---

## Part V: Regulation Best Interest vs. Fiduciary Standard

### 5.1 Overview

**Regulation Best Interest (Reg BI)** applies to broker-dealers when making recommendations to retail customers. It is NOT the fiduciary standard but is an enhanced suitability standard.

| Aspect | Reg BI (Broker-Dealers) | Fiduciary Standard (RIAs) |
|--------|------------------------|--------------------------|
| **Statutory Basis** | Securities Exchange Act § 15(l) | Investment Advisers Act § 206 |
| **Standard** | "Best Interest" at time of recommendation | "Best Interest" throughout relationship |
| **Duration** | Point-in-time (when recommendation made) | Ongoing duty |
| **Conflicts** | Disclose and mitigate | Eliminate or disclose + consent |
| **Enforcement** | SEC, FINRA | SEC (state regulators for small RIAs) |
| **Private Right of Action** | Limited | Yes (equitable relief) |

### 5.2 Key Differences

**1. Ongoing Duty**

RIA Fiduciary: Continuous monitoring obligation for ongoing relationships
Reg BI: No ongoing monitoring requirement after recommendation

**2. Conflict Treatment**

RIA Fiduciary: Must "seek to avoid" conflicts; eliminate where possible
Reg BI: Disclose and mitigate; elimination not required

**3. Fee Structure**

RIA Fiduciary: No specific fee requirements (must be disclosed and reasonable)
Reg BI: Must disclose and consider cost as factor

### 5.3 Why This Matters for Maven

As a registered investment adviser, Maven is held to the **higher fiduciary standard**, not Reg BI. This means:

- Ongoing monitoring obligations
- Must seek to eliminate conflicts (not just disclose)
- Broader scope of duty
- Relationship-based, not transaction-based

---

## Part VI: Documentation Requirements

### 6.1 Form ADV Requirements

**Part 1**: Firm information filed with SEC/IARD
**Part 2A (Brochure)**: Plain-English disclosure document including:
- Services offered
- Fee schedules
- Conflicts of interest
- Disciplinary history
- Methods of analysis
- Risks of investment strategies

**Part 2B (Brochure Supplement)**: Individual adviser information
**Part 3 (Form CRS)**: Short relationship summary for retail clients

### 6.2 Documentation to Prove Fiduciary Compliance

To demonstrate compliance with fiduciary duty, advisers should maintain:

**1. Client Profile Documentation**
- Initial questionnaire responses
- Updates to client information
- Risk tolerance assessments
- Investment objectives documentation

**2. Recommendation Documentation**
- Basis for each recommendation
- Alternatives considered
- Why recommendation is suitable
- Cost analysis

**3. Conflict Documentation**
- Identified conflicts
- Disclosure provided
- Client consent obtained
- Mitigation measures

**4. Monitoring Documentation**
- Account review records
- Performance relative to objectives
- Rebalancing decisions
- Communications with client

**5. Compliance Records**
- Policies and procedures
- Training records
- Supervisory reviews
- Exception reports

### 6.3 Specific for Robo-Advisors

**Algorithm Documentation**:
- Algorithm methodology
- Validation testing results
- Changes to algorithm (with dates)
- Performance monitoring

**User Interaction Records**:
- Questionnaire responses
- Disclosures displayed
- Client acknowledgments
- Platform interactions

---

## Part VII: Fee Disclosure Requirements

### 7.1 General Requirement

All fees and costs must be disclosed clearly and completely in:
- Form ADV Part 2A
- Form CRS (for retail clients)
- Investment management agreement

### 7.2 Specific Fee Disclosures

**Must Disclose**:
- Advisory fees (how calculated, when charged)
- Custody fees
- Transaction costs
- Fund expenses (expense ratios)
- 12b-1 fees received
- Revenue sharing arrangements
- Soft dollar arrangements
- Any other compensation received

**SEC Position on 12b-1 Fees**:
> "When an adviser receives, directly or indirectly, 12b-1 fees in connection with mutual fund recommendations, it has a financial incentive to recommend that a client invest in a share class that pays 12b-1 fees. The resulting conflict of interest is especially pronounced when share classes of the same funds that do not bear these fees are available to the client."

### 7.3 Best Practice: Fee Transparency

Given enforcement trends, advisers should:
1. Use lowest-cost share classes when available
2. If not using lowest-cost, document reason why
3. Disclose all compensation streams specifically
4. Avoid general/vague fee disclosures
5. Update disclosures when fee arrangements change

---

## Part VIII: Limitations and Waivers

### 8.1 What CAN Be Limited

**Scope of Services**:
- Limit to certain account types
- Limit to certain asset classes
- Limit recommendations to mutual funds only
- Define monitoring frequency (with disclosure)

**Hedge Clauses** (with limitations):
- May limit liability for ordinary negligence (in some circumstances)
- Must not mislead clients about their legal rights
- Essentially prohibited for retail clients:

> "[T]here are few (if any) circumstances in which a hedge clause in an agreement with a retail client would be consistent with [the antifraud] provisions, where the hedge clause purports to relieve the adviser from liability for conduct as to which the client has a non-waivable cause of action against the adviser provided by state or federal law."

### 8.2 What CANNOT Be Waived

- The fiduciary duty itself
- Anti-fraud protections under Section 206
- Duty to disclose material conflicts
- Duty of good faith

### 8.3 Sophisticated Investors

**Institutional Clients**: May have different disclosure requirements
- Investment mandate may suffice for "objectives"
- May rely on client's sophistication for informed consent
- Still cannot waive fiduciary duty

**Qualified Purchasers/Accredited Investors**: 
- May have more flexibility in hedge clauses
- Facts and circumstances analysis
- Still subject to fiduciary duty

---

## Part IX: How Maven Should Handle This

### 9.1 Duty of Care Implementation

**Client Profiling**:
- Comprehensive questionnaire covering all required elements
- Interactive explanations of terms
- Follow-up questions for unclear/conflicting responses
- Regular prompts to update information

**Algorithm Requirements**:
- Document methodology thoroughly
- Ensure all recommendations have "reasonable basis"
- Implement explainability—be able to articulate WHY for each client
- Log all decisions and rationale

**Monitoring**:
- Continuous automated monitoring
- Alerts for significant deviations from objectives
- Periodic human review of algorithm performance
- Client notifications of material changes

### 9.2 Duty of Loyalty Implementation

**Conflict Identification**:
- Map all revenue streams
- Document all relationships with third parties
- Identify all potential conflicts

**Disclosure Strategy**:
- Plain-English disclosures in ADV Part 2A
- Interactive pop-ups for key disclosures on platform
- Clear Form CRS for retail clients
- Specific (not general) conflict disclosures

**Conflict Mitigation**:
- Use lowest-cost share classes
- Avoid or minimize revenue sharing where possible
- Implement policies preventing conflict-driven recommendations
- Document basis for any recommendation involving conflict

### 9.3 Technology-Specific Measures

**Algorithm Governance**:
- Version control for all algorithm changes
- Testing before deployment
- Documentation of all changes
- Client notification for material changes

**Human Oversight**:
- Regular review of algorithm outputs
- Exception handling procedures
- Escalation protocols
- Authority to override algorithm

**Audit Trail**:
- Log all client interactions
- Record all recommendations
- Document basis for decisions
- Preserve for regulatory examination

### 9.4 Compliance Program

Per Advisers Act Rule 206(4)-7, must have written policies and procedures:
- Reasonably designed to prevent violations
- Annual review requirement
- Designated Chief Compliance Officer
- Training programs

**For AI-Specific**:
- Algorithm validation procedures
- Change management policies
- Data governance
- Error handling and correction

---

## Part X: Open Questions for Legal Counsel

### Immediate Questions

1. **Algorithm Explainability Standard**: What level of explainability satisfies "reasonable basis" requirement? Can we use model-agnostic explanations or must we use inherently interpretable models?

2. **Disclosure Methodology**: Are interactive disclosures on the platform sufficient, or do we need traditional document delivery? What acknowledgment/consent mechanism satisfies "informed consent"?

3. **Client Updates**: What frequency of client profile updates satisfies "reasonable" standard? Can we rely on client to initiate updates, or must we prompt?

4. **Human Oversight**: Is there a minimum human oversight requirement for AI recommendations? What documentation of human review is needed?

5. **Algorithm Changes**: What triggers "material change" requiring client disclosure? How much lead time before implementation?

### Structural Questions

6. **State Fiduciary Standards**: Do any state fiduciary standards impose additional requirements beyond federal? (Particularly California, New York)

7. **ERISA Considerations**: If we serve retirement accounts, what additional ERISA fiduciary requirements apply?

8. **Insurance Requirements**: What E&O insurance coverage is appropriate for AI-driven advice?

9. **Hedge Clause Language**: Can we include any liability limitation in our client agreement? What is the current safe harbor?

10. **Record Retention**: What is the required retention period for algorithm logs and client interaction records?

---

## Appendix A: Key Statutory and Regulatory Citations

### Statutes
- Investment Advisers Act of 1940, 15 U.S.C. § 80b-1 to -21
- Section 206 (anti-fraud), 15 U.S.C. § 80b-6
- Section 215(a) (void provisions), 15 U.S.C. § 80b-15(a)

### SEC Releases
- Commission Interpretation Regarding Standard of Conduct for Investment Advisers, IA Release No. 5248 (June 5, 2019)
- Robo-Advisers, IM Guidance Update No. 2017-02 (Feb. 2017)
- Suitability of Investment Advice (Proposed), IA Release No. 1406 (Mar. 16, 1994)
- Proxy Voting by Investment Advisers, IA Release No. 2106 (Jan. 31, 2003)

### Key Cases
- SEC v. Capital Gains Research Bureau, Inc., 375 U.S. 180 (1963)
- Transamerica Mortgage Advisors, Inc. v. Lewis, 444 U.S. 11 (1979)
- Santa Fe Industries, Inc. v. Green, 430 U.S. 462 (1977)
- Robare Group, Ltd. v. SEC, 922 F.3d 468 (D.C. Cir. 2019)

---

## Appendix B: Sources Consulted

1. SEC Commission Interpretation Regarding Standard of Conduct for Investment Advisers (2019)
2. SEC Division of Investment Management, Robo-Advisers Guidance Update (2017)
3. Megan Ji, "Are Robots Good Fiduciaries? Regulating Robo-Advisors Under the Investment Advisers Act of 1940," 117 Colum. L. Rev. (2017)
4. Arthur B. Laby, "SEC v. Capital Gains Research Bureau and the Investment Advisers Act of 1940," 91 B.U. L. Rev. 1051 (2011)
5. Duke FinReg Blog, "Robo-Advisers and the Fiduciary Duty" (2017)
6. SEC Enforcement Actions (Wealthfront 2018, Betterment 2023)
7. InnReg Compliance Guide: Reg BI and Fiduciary Standard

---

*This document is for internal research purposes and does not constitute legal advice. Maven should consult with qualified securities counsel before implementing compliance policies.*
