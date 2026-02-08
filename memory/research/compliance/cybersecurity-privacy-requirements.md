# Cybersecurity & Data Privacy Requirements for RIAs

## Deep Research Report for Maven (AI-Native RIA)
**Research Date:** February 7, 2026  
**Status:** Comprehensive - Security is existential for fintech

---

## Executive Summary

This report details the cybersecurity and data privacy regulatory requirements for SEC-registered investment advisers (RIAs). The regulatory landscape has shifted significantly:

- **SEC proposed cybersecurity rules for RIAs were WITHDRAWN in June 2025** - The enhanced cybersecurity rulemaking was scrapped with no explanation
- **However, Regulation S-P amendments (June 2024) ARE FINAL** - These impose substantial new requirements effective December 3, 2025
- **Regulation S-ID (Identity Theft Red Flags) remains fully in effect**
- **State privacy laws (CCPA/CPRA) apply to certain RIA data** - Not fully exempt
- **Custodian requirements now mandate cyber insurance** - Schwab, Fidelity require minimum $1M coverage

**Bottom Line for Maven:** Even with the proposed SEC cyber rules withdrawn, the regulatory burden remains substantial through Regulation S-P amendments, Regulation S-ID, state privacy laws, and custodian requirements.

---

## 1. SEC Regulation S-P (Privacy of Consumer Financial Information)

### Legal Authority
17 CFR Part 248, Subpart A (Privacy of Consumer Financial Information and Safeguarding Personal Information)

### Scope
Applies to:
- SEC-registered investment advisers
- Broker-dealers  
- Registered investment companies
- Foreign (non-resident) SEC-registered entities

**Key Definition - "Consumer":** An individual who obtains or has obtained a financial product or service primarily for personal, family, or household purposes. Does NOT apply to business/commercial/agricultural purposes.

### Privacy Notice Requirements

#### Initial Privacy Notice (§248.4)
Must provide "clear and conspicuous" notice that accurately reflects privacy policies and practices to:
1. **Customers** - Not later than when establishing customer relationship
2. **Consumers** - Before disclosing nonpublic personal information to nonaffiliated third parties

**Content Requirements (§248.6):**
- Categories of nonpublic personal information collected
- Categories of information disclosed
- Categories of affiliates and nonaffiliated third parties receiving disclosures
- Consumer's right to opt out
- Policies for protecting confidentiality and security of information

**Model Privacy Form (Form S-P):** SEC provides a model form in Appendix A that satisfies notice requirements if used correctly.

#### Annual Privacy Notice (§248.5)
- Must provide clear and conspicuous notice annually during customer relationship
- "Annually" = at least once in any 12-consecutive-month period
- Terminated customers (former customers) do NOT require annual notice

**Exception (FAST Act):** Annual notice NOT required if:
1. Only disclosing information under permitted exceptions (§248.13, 248.14, 248.15), AND
2. No changes in policies/practices from most recent privacy notice

### Opt-Out Requirements (§248.7)

Must provide consumers reasonable opportunity to opt out before disclosing nonpublic personal information to nonaffiliated third parties.

**Opt-Out Notice Must Include:**
- Statement that you disclose (or reserve right to disclose) information to nonaffiliated third parties
- Consumer's right to opt out
- Reasonable means to exercise opt-out (check-off boxes, reply forms, electronic means, toll-free number)

**Unreasonable Opt-Out Means:**
- Requiring consumer to write their own letter
- Only providing check-box with initial notice but not subsequent notices

**Joint Accounts:** May provide single opt-out notice; must accept direction from any joint consumer

### Safeguards Rule (§248.30) - **MAJOR 2024 AMENDMENTS**

**Effective Dates:**
- Larger entities: December 3, 2025
- Smaller entities: June 3, 2026

#### Written Policies and Procedures Required
Every covered institution must develop, implement, and maintain written policies and procedures addressing:
1. **Administrative safeguards**
2. **Technical safeguards**  
3. **Physical safeguards**

#### Objectives Must Be Reasonably Designed To:
1. Ensure security and confidentiality of customer information
2. Protect against anticipated threats or hazards
3. Protect against unauthorized access resulting in substantial harm

#### NEW: Response Program for Unauthorized Access (§248.30(a)(3))

Written policies MUST include a program to detect, respond to, and recover from unauthorized access including:

1. **Assess** nature and scope of incident, identify customer information systems and types potentially accessed

2. **Contain and control** incident to prevent further unauthorized access

3. **Notify affected individuals** whose sensitive customer information was or is reasonably likely to have been accessed

#### NEW: Customer Notification Requirements (§248.30(a)(4))

**Timing:** As soon as practicable, but NOT LATER THAN 30 DAYS after becoming aware

**Attorney General Delay:** May delay up to 30 days (extendable to 60 days, then additional 60 in extraordinary circumstances) if AG determines notice poses substantial risk to national security/public safety

**Notice Contents Must Include:**
- General description of incident and type of sensitive information affected
- Date or estimated date of incident (if reasonably possible to determine)
- Contact information (toll-free number, email, postal address, specific office)
- Recommendation to review account statements and report suspicious activity
- Explanation of fraud alerts and how to place them
- How to obtain free credit reports
- FTC identity theft resources and reporting information

**Definition - "Sensitive Customer Information":** Information that alone or in conjunction with other information, compromise of which could create reasonably likely risk of substantial harm. Includes:
- Social Security numbers
- Government IDs (driver's license, passport)
- Biometric records
- Account numbers combined with authenticating information

#### NEW: Service Provider Requirements (§248.30(a)(5))

Must establish policies for oversight of service providers, including due diligence and monitoring, to ensure:
1. Service providers take appropriate measures to protect against unauthorized access
2. **Service providers notify RIA no later than 72 hours** after becoming aware of breach affecting customer information system

**Contract provisions should require:**
- Security protections for customer information
- 72-hour breach notification to RIA
- Cooperation with RIA's incident response

#### Disposal Requirements (§248.30(b))
Must properly dispose of consumer and customer information by taking reasonable measures to protect against unauthorized access during disposal.

#### Recordkeeping Requirements (§248.30(c))
Must maintain:
- Written policies and procedures
- Documentation of detected unauthorized access and responses
- Investigation and determination records regarding notification
- Service provider contracts and agreements
- Disposal policies

**Retention:** Records (other than policies) must be preserved for 6 years, first 2 years in easily accessible place.

---

## 2. SEC Regulation S-ID (Identity Theft Red Flags)

### Legal Authority
17 CFR Part 248, Subpart C (Regulation S-ID: Identity Theft Red Flags)

### Who Must Comply
SEC-registered investment advisers that:
- Are "financial institutions" or "creditors" under Fair Credit Reporting Act
- Offer or maintain "covered accounts"

### Definition - "Covered Account"
1. Accounts primarily for personal/family/household purposes permitting multiple payments/transactions (e.g., brokerage accounts, mutual fund accounts permitting wire transfers)
2. Any other account with reasonably foreseeable risk to customers or firm from identity theft

### Identity Theft Prevention Program Requirements (§248.201(d))

#### Program Must Be:
- Written
- Appropriate to size and complexity of firm
- Appropriate to nature and scope of activities

#### Program Must Include Reasonable Policies to:

1. **Identify Relevant Red Flags** for covered accounts and incorporate into program

2. **Detect Red Flags** that have been incorporated

3. **Respond Appropriately** to detected Red Flags to prevent and mitigate identity theft

4. **Update Periodically** to reflect changes in risks

### Categories of Red Flags (Appendix A)

**Must consider Red Flags from these categories:**

1. **Alerts from Consumer Reporting Agencies:**
   - Fraud or active duty alerts
   - Credit freeze notices
   - Address discrepancy notices
   - Patterns inconsistent with history

2. **Suspicious Documents:**
   - Altered or forged documents
   - Photo/description inconsistent with presenter
   - Information inconsistent with application

3. **Suspicious Personal Identifying Information:**
   - Information inconsistent with external sources
   - Information associated with known fraudulent activity
   - Address is mail drop or prison
   - SSN same as other applicants

4. **Unusual Account Activity:**
   - Requests shortly following address change
   - Patterns inconsistent with established activity
   - Long-inactive accounts suddenly active
   - Mail returned as undeliverable

5. **Notice of Identity Theft:**
   - Customer reports identity theft
   - Law enforcement alerts
   - Notification from other sources

### Appropriate Responses to Red Flags
- Monitor account for evidence of identity theft
- Contact customer
- Change passwords/security codes
- Reopen account with new number
- Not opening new account
- Closing existing account
- Notifying law enforcement
- Determining no response warranted

### Administration Requirements (§248.201(e))

1. **Board/Senior Management Approval:** Initial written program must be approved by board of directors, appropriate committee, or designated senior management employee

2. **Oversight:** Board, committee, or senior management must be involved in oversight, development, implementation, and administration

3. **Staff Training:** Train staff as necessary to effectively implement

4. **Service Provider Oversight:** Exercise appropriate oversight of service provider arrangements

### Annual Reporting
Staff responsible for program must report at least annually to board/committee/senior management on:
- Compliance with requirements
- Effectiveness of policies
- Service provider arrangements
- Significant incidents and management response
- Recommendations for material changes

---

## 3. SEC Proposed Cybersecurity Rules (2022-2023) - **WITHDRAWN**

### Critical Update: Rules Withdrawn June 2025

**On June 16, 2025, the SEC withdrew proposed cybersecurity rules for investment advisers.**

### What Was Proposed (Now Withdrawn)
The proposed rules (Release No. 33-11028, February 2022) would have required:
- Adoption of cybersecurity policies and procedures
- Cybersecurity monitoring and protections
- Disclosure of cybersecurity risks and incidents to clients
- Confidential reporting to SEC of significant cybersecurity incidents (within 48 hours)
- Record maintenance

### Why Withdrawn
The SEC, now under Republican leadership following the 2024 election, offered no explanation. The withdrawal aligns with broader Trump administration opposition to regulation.

### Impact on Maven
- **The proposed rules will NOT become effective**
- However, Regulation S-P amendments (which ARE effective) impose similar requirements
- SEC examination priorities continue to emphasize cybersecurity
- Best practice is to prepare as if comprehensive rules applied

### What Remains Effective
Despite withdrawal of proposed rules:
1. Regulation S-P Safeguards Rule (with 2024 amendments) - **EFFECTIVE**
2. Regulation S-ID Identity Theft Prevention - **EFFECTIVE**
3. SEC cybersecurity examination priorities - **ONGOING**
4. State privacy laws - **APPLICABLE**
5. Custodian requirements - **MANDATORY**

---

## 4. State Privacy Laws Impact

### California - CCPA/CPRA

#### NOT a Full Exemption for RIAs
- CCPA/CPRA does NOT provide blanket exemption for financial institutions
- Provides **data-level exemption** only for information "subject to" GLBA
- Data NOT covered by GLBA (e.g., B2B data, employee data, website visitor data) IS subject to CCPA

#### What's Exempt (Data-Level)
Personal information collected, processed, sold, or disclosed pursuant to GLBA:
- Consumer account information
- Nonpublic personal information about household financial products/services

#### What's NOT Exempt
- Business/commercial client information (GLBA doesn't cover business purposes)
- Employee information
- Website visitor data (people not seeking financial products)
- Marketing data
- **Critical: Private right of action under §1798.150 for data security failures - NOT EXEMPT**

#### CCPA Data Security Obligation
Even for GLBA-covered information, the CCPA private right of action applies to firms that fail to implement reasonable security measures.

### States with Full Entity-Level GLBA Exemptions
Some states fully exempt entities subject to GLBA:
- **Virginia (VCDPA):** Full exemption for financial institutions subject to Title V of GLBA
- **Colorado (CPA):** Full entity exemption for financial institutions
- **Nevada:** Full exemption for financial institutions subject to GLBA
- **Utah:** Full entity exemption

### States Moving Away from Full Exemptions
- **Connecticut (SB 1295, effective October 2025):** Removes entity-level exemption, adds data-level exemption only
- **California:** Data-level exemption only from inception

### Key States for Maven
1. **California** - Large population, no full exemption, private right of action
2. **New York** - No comprehensive privacy law yet, but DFS cybersecurity rules apply to banks/insurance
3. **Texas** - New privacy law with GLBA exemption
4. **Florida** - New privacy law with GLBA exemption (threshold-based)

### Practical Impact
Maven must:
- Maintain GLBA compliance for consumer financial information
- Implement CCPA compliance for non-GLBA data (employees, B2B, marketing)
- Monitor state law changes as exemptions narrow
- Implement reasonable security regardless of exemptions

---

## 5. Required vs. Best Practice Security Measures

### MANDATORY Controls (Regulatory Requirements)

#### Under Regulation S-P Safeguards Rule:
1. **Written Policies and Procedures** covering administrative, technical, and physical safeguards
2. **Incident Response Program** to detect, respond, and recover from unauthorized access
3. **Customer Notification Procedures** within 30 days of breach
4. **Service Provider Oversight** including 72-hour notification requirements
5. **Information Disposal Procedures** for consumer and customer information
6. **Recordkeeping** for 6 years

#### Under Regulation S-ID:
1. **Written Identity Theft Prevention Program**
2. **Red Flag Detection Procedures**
3. **Response Procedures**
4. **Board/Management Oversight and Approval**
5. **Staff Training**
6. **Annual Reporting**

### "Reasonable" Security Standard

The SEC requires "reasonably designed" policies and procedures. Courts and regulators interpret this through:

#### FTC Reasonableness Factors:
- Size and complexity of data operations
- Nature and scope of activities  
- Sensitivity of information handled
- Cost of security measures vs. risk
- Current technological capabilities

#### SEC Examination Focus Areas:
- Governance and risk assessment
- Access controls and authentication
- Data loss prevention
- Vendor management
- Incident response planning
- Employee training

### Industry Benchmarks: NIST Cybersecurity Framework 2.0

NIST CSF 2.0 (released 2024) provides the leading framework for financial services. The SEC uses NIST for its own cybersecurity program.

#### Six Core Functions:
1. **GOVERN** (New in 2.0) - Cybersecurity governance, risk strategy, roles and responsibilities
2. **IDENTIFY** - Asset management, business environment, risk assessment
3. **PROTECT** - Access control, training, data security, maintenance
4. **DETECT** - Anomalies, continuous monitoring, detection processes
5. **RESPOND** - Response planning, communications, analysis, mitigation
6. **RECOVER** - Recovery planning, improvements, communications

#### Cyber Risk Institute (CRI) Profile
Financial sector-specific implementation of NIST CSF developed by industry consortium.

### Technical Controls Checklist (Best Practice Elevated to Expected)

Based on SEC examination priorities and industry standards:

**Access Controls:**
- [ ] Multi-factor authentication (MFA) for all systems
- [ ] Role-based access controls
- [ ] Privileged access management
- [ ] Regular access reviews and termination procedures
- [ ] Password policies (complexity, rotation)

**Data Protection:**
- [ ] Encryption at rest (AES-256)
- [ ] Encryption in transit (TLS 1.2+)
- [ ] Data loss prevention (DLP) tools
- [ ] Secure data disposal procedures
- [ ] Data classification system

**Network Security:**
- [ ] Firewalls and intrusion detection/prevention
- [ ] Network segmentation
- [ ] Endpoint detection and response (EDR)
- [ ] Regular vulnerability scanning
- [ ] Penetration testing (annual)

**Monitoring and Detection:**
- [ ] Security information and event management (SIEM)
- [ ] Log aggregation and retention
- [ ] 24/7 monitoring capability (in-house or MSSP)
- [ ] Anomaly detection
- [ ] Threat intelligence feeds

**Business Continuity:**
- [ ] Data backup procedures (3-2-1 rule)
- [ ] Backup testing and restoration drills
- [ ] Disaster recovery plan
- [ ] Business continuity plan
- [ ] Incident response plan

**Training and Awareness:**
- [ ] Annual security awareness training
- [ ] Phishing simulations
- [ ] Role-specific training
- [ ] New employee security onboarding
- [ ] Documented training records

---

## 6. Incident Response Requirements

### Notification Timeline Summary

| Requirement | Deadline | Who Notifies | Who Receives Notice |
|-------------|----------|--------------|---------------------|
| Service Provider → RIA | 72 hours | Service provider | RIA |
| RIA → Affected Individuals | 30 days | RIA | Affected customers |
| State Breach Notification | Varies (typically 30-60 days) | RIA | State AG/Consumers |
| SEC Confidential Report | 48 hours (proposed, now withdrawn) | RIA | SEC |

### Regulation S-P Response Program (§248.30(a)(3))

#### Phase 1: Assessment
Procedures to assess:
- Nature and scope of incident
- Customer information systems potentially accessed
- Types of customer information potentially compromised

#### Phase 2: Containment
Take appropriate steps to:
- Contain the incident
- Control the incident  
- Prevent further unauthorized access

#### Phase 3: Customer Notification
Unless investigation determines no substantial harm likely:
- Notify affected individuals within 30 days
- Include all required content (see Section 1)
- Provide clear and conspicuous notice in writing

### State Breach Notification Laws

**Most states require notification within 30-60 days.** Key variations:

| State | Consumer Notice | AG Notice | Timeline |
|-------|-----------------|-----------|----------|
| California | Required | >500 affected | Without unreasonable delay |
| New York | Required | AG, DFS | Most expedient time |
| Texas | Required | >250 affected | 60 days |
| Florida | Required | >500 affected | 30 days |
| Massachusetts | Required | AG + Director | As soon as practicable |

### Documentation Requirements

Must maintain written documentation of:
1. Detected unauthorized access incidents
2. Response actions taken
3. Recovery activities
4. Investigation process and findings
5. Notification determinations (including basis for any non-notification decision)
6. Attorney General delay requests
7. Copies of all notices sent

### Incident Response Playbook Outline

**Pre-Incident:**
1. Establish incident response team and roles
2. Document escalation procedures
3. Maintain contact lists (legal, forensics, PR, law enforcement)
4. Define incident severity levels
5. Prepare notification templates

**During Incident:**
1. **Hour 0-1:** Initial detection and triage
   - Identify and validate incident
   - Activate incident response team
   - Initiate containment
   
2. **Hours 1-24:** Investigation and containment
   - Preserve evidence
   - Determine scope
   - Continue containment
   - Engage forensics if needed
   
3. **Hours 24-72:** Assessment and decisions
   - Determine if customer information affected
   - Assess notification obligations
   - Prepare draft notifications
   - Brief senior management/board
   
4. **Days 3-30:** Notification and remediation
   - Finalize customer notifications
   - File required state/regulatory notices
   - Complete remediation
   - Document lessons learned

**Post-Incident:**
1. Root cause analysis
2. Update policies and procedures
3. Additional training if needed
4. Report to board/management

---

## 7. Vendor Due Diligence Requirements

### Regulatory Requirements

#### Under Regulation S-P (§248.30(a)(5))
Must establish and maintain policies and procedures reasonably designed to:
1. **Require oversight** of service providers through due diligence and monitoring
2. Ensure service providers take appropriate measures to **protect against unauthorized access**
3. Require service providers to **notify RIA within 72 hours** of breach

#### Under Regulation S-ID (Appendix A, Section VI(c))
When engaging service providers for activities in connection with covered accounts, must take steps to ensure service provider activities are conducted in accordance with reasonable policies to detect, prevent, and mitigate identity theft.

**Options include:**
- Contractual requirement for Red Flag policies
- Contractual requirement to report Red Flags or take appropriate steps

### Third-Party Risk Management Framework

#### Pre-Engagement Due Diligence

**Information Security Assessment:**
- [ ] Request SOC 2 Type II report
- [ ] Review penetration test results
- [ ] Assess security certifications (ISO 27001, etc.)
- [ ] Review security questionnaire responses
- [ ] Evaluate data handling practices

**Risk Classification:**
- **Critical:** Access to sensitive customer data, critical systems
- **High:** Access to internal systems, some customer data
- **Medium:** Limited system access, no sensitive data
- **Low:** No system/data access

#### Contract Requirements

**Required Contractual Provisions:**
1. **Security obligations:** Maintain reasonable security measures
2. **Breach notification:** Notify within 72 hours of discovery
3. **Incident cooperation:** Assist in investigation and response
4. **Audit rights:** Right to review security practices
5. **Subcontractor restrictions:** Flow-down of requirements
6. **Data handling:** Restrictions on use, disclosure, and retention
7. **Termination provisions:** Data return/destruction requirements

**Sample Breach Notification Clause:**
> "Service Provider shall notify Client in writing as soon as practicable, but no later than seventy-two (72) hours after becoming aware that a security breach has occurred resulting in unauthorized access to any Customer Information maintained by Service Provider."

#### Ongoing Monitoring

**Annual Activities:**
- [ ] Review updated SOC 2 reports
- [ ] Confirm security certifications remain current
- [ ] Reassess risk classification
- [ ] Review service provider incident history
- [ ] Update risk register

**Periodic Activities:**
- [ ] Monitor security news for vendor breaches
- [ ] Conduct service-level reviews
- [ ] Verify contract compliance
- [ ] Update vendor inventory

### Documentation Requirements

Maintain records of:
- Vendor risk assessments
- Due diligence documentation
- Contracts and agreements
- Monitoring activities
- Incident reports from vendors
- Remediation actions

---

## 8. Cybersecurity Insurance

### Regulatory Status
**Not federally mandated, but effectively required by:**
- Custodian requirements (Schwab, Fidelity)
- Best practice expectations
- Contractual obligations
- SEC examination expectations

### Custodian Mandates

#### Charles Schwab Requirements
All RIA firms using Schwab custody must carry minimum **$1 million aggregate coverage** for:
- Errors and omissions (E&O)
- Social engineering
- Theft by hackers
- Employee theft (if applicable)

#### Fidelity Institutional Requirements
All RIAs must maintain:
- Professional liability/E&O insurance
- Cyber insurance with **$250,000 minimum** for social engineering coverage

### Recommended Coverage Amounts

| Firm Size (AUM) | Recommended Coverage |
|-----------------|---------------------|
| Under $100M | $1M - $2M |
| $100M - $500M | $2M - $5M |
| $500M - $1B | $5M - $10M |
| Over $1B | $10M+ |

### Key Policy Provisions

#### First-Party Coverage (Direct Losses)
- **Data breach response costs:** Forensics, notification, credit monitoring
- **Business interruption:** Lost income during outage
- **Cyber extortion:** Ransomware payments (controversial)
- **Data restoration:** Costs to recover/recreate data
- **Crisis management:** PR and reputation repair

#### Third-Party Coverage (Liability)
- **Privacy liability:** Claims from affected individuals
- **Network security liability:** Claims from security failures
- **Regulatory defense:** Costs to defend regulatory actions
- **Media liability:** Defamation, IP infringement from cyber incident

#### Key Exclusions to Watch
- Prior known incidents
- Failure to maintain minimum security
- Unencrypted portable devices
- War/nation-state attacks
- Infrastructure failures

### Application Process Considerations

Insurers will evaluate:
- MFA implementation
- Endpoint detection and response
- Backup procedures
- Employee training
- Incident response plan
- Prior claims/incidents

**Pro tip:** Implement security controls BEFORE applying - premiums and terms are heavily influenced by security posture.

### Insurance Checklist

- [ ] Minimum $1M coverage to meet custodian requirements
- [ ] Social engineering coverage (min $250K for Fidelity)
- [ ] First-party and third-party coverage
- [ ] Regulatory defense coverage
- [ ] Business interruption coverage
- [ ] Retroactive date before firm inception
- [ ] Reasonable retention/deductible
- [ ] Clear notification requirements (to insurer)
- [ ] Panel counsel you're comfortable with

---

## 9. Written Information Security Policy (WISP) Requirements

### Regulatory Basis

The SEC Safeguards Rule (§248.30) requires "written policies and procedures" addressing administrative, technical, and physical safeguards. This is effectively a WISP requirement.

### Required Elements

Based on Regulation S-P, Regulation S-ID, and industry standards:

#### 1. Governance and Oversight
- Senior management/board responsibility assignment
- Security committee or designated security officer
- Reporting structure and frequency
- Policy approval and review process

#### 2. Risk Assessment
- Annual risk assessment procedures
- Asset inventory and classification
- Threat identification
- Vulnerability assessment
- Risk prioritization and treatment

#### 3. Access Controls
- User provisioning and deprovisioning
- Authentication requirements (passwords, MFA)
- Access review procedures
- Privileged access management
- Remote access policies

#### 4. Data Protection
- Data classification system
- Encryption standards
- Data handling procedures
- Data retention and disposal
- Data loss prevention

#### 5. Network Security
- Network architecture documentation
- Firewall and segmentation rules
- Intrusion detection/prevention
- Wireless security
- Remote access security

#### 6. Endpoint Security
- Device management
- Anti-malware requirements
- Patch management
- Mobile device policies
- BYOD policies (if applicable)

#### 7. Incident Response
- Incident classification
- Detection and escalation procedures
- Response team and responsibilities
- Communication procedures
- Customer notification procedures
- Post-incident review

#### 8. Business Continuity/Disaster Recovery
- Backup procedures
- Recovery time objectives
- Recovery point objectives
- Testing procedures
- Plan maintenance

#### 9. Vendor Management
- Due diligence requirements
- Contract requirements
- Ongoing monitoring
- Incident coordination

#### 10. Employee Security
- Background checks
- Security awareness training
- Acceptable use policies
- Termination procedures
- Physical security

### Update Frequency

**Minimum Requirements:**
- **Annual review:** Full policy review and update
- **Significant change trigger:** Update after major incidents, organizational changes, or new threats
- **Regulatory change trigger:** Update for new requirements

**Documentation:**
- Date of each review/update
- Reviewer/approver names
- Summary of changes
- Version control

### Board/Management Oversight

#### Regulation S-ID Requirements:
- Board/committee/senior management must approve initial program
- Must be involved in oversight, development, implementation
- Must receive annual compliance reports

#### Best Practice:
- Quarterly board briefings on cybersecurity
- Annual board approval of WISP
- Board-level cybersecurity expertise or education
- Documented board discussions in minutes

---

## 10. SEC Examination Priorities - Cybersecurity Focus

### FY 2026 Examination Priorities (Released November 2025)

The SEC Division of Examinations explicitly lists cybersecurity as a critical examination area:

#### Cybersecurity Focus Areas:
1. **Cybersecurity governance** - Board/management oversight
2. **Identity theft prevention controls** - Regulation S-ID compliance
3. **Vendor oversight** - Third-party risk management
4. **Preparedness for sophisticated threats** - Including AI-driven intrusions
5. **Regulation S-P compliance** - Safeguards and incident response

### Historical Examination Focus (2024-2025)

#### Perennial Focus Areas:
- Governance and risk assessment
- Access rights and controls
- Data loss prevention
- Mobile security
- Incident response testing
- Vendor management

#### Emerging Focus Areas:
- Cloud security
- Remote work security
- Artificial intelligence risks
- Ransomware preparedness
- Supply chain security

### Common Examination Deficiencies

Based on SEC risk alerts and enforcement actions:

1. **Inadequate policies and procedures** - Generic or boilerplate policies not tailored to firm
2. **Insufficient board/management oversight** - No documented oversight activities
3. **Weak access controls** - Lack of MFA, poor password practices
4. **Inadequate vendor management** - No due diligence, missing contract provisions
5. **Untested incident response plans** - Plans that exist but haven't been tested
6. **Insufficient training** - No documentation of security awareness training
7. **Poor configuration management** - Unpatched systems, default configurations

### Preparing for Examination

**Documentation to Have Ready:**
- [ ] Written information security policies
- [ ] Risk assessments
- [ ] Vendor due diligence files
- [ ] Service provider contracts
- [ ] Employee training records
- [ ] Incident response plan
- [ ] Business continuity/disaster recovery plan
- [ ] Board/management meeting minutes (cybersecurity items)
- [ ] Penetration test results
- [ ] Vulnerability scan results
- [ ] Incident logs (if any)
- [ ] Access control documentation
- [ ] Network diagrams

**Interview Preparation:**
- CCO should be able to explain cybersecurity governance
- IT/Security lead should explain technical controls
- Senior management should demonstrate awareness and oversight

---

## Maven Security Roadmap Recommendations

### Phase 1: Foundation (Before Launch)

**Immediate Priorities:**
1. ✅ Draft comprehensive WISP aligned with Reg S-P requirements
2. ✅ Implement Identity Theft Prevention Program (Reg S-ID)
3. ✅ Establish MFA across all systems
4. ✅ Obtain cyber insurance ($1M+ minimum)
5. ✅ Document vendor management procedures
6. ✅ Create incident response plan

### Phase 2: Operationalize (First 6 Months)

1. Complete risk assessment
2. Implement security awareness training program
3. Deploy SIEM/monitoring solution
4. Conduct penetration test
5. Test incident response plan (tabletop exercise)
6. Establish board reporting cadence

### Phase 3: Mature (6-18 Months)

1. Achieve SOC 2 Type II compliance
2. Implement advanced threat detection
3. Automate compliance monitoring
4. Conduct third-party security assessment
5. Develop security metrics and KPIs
6. Consider ISO 27001 certification

### AI-Specific Considerations for Maven

As an AI-native RIA, Maven faces unique security challenges:

1. **Model Security:**
   - Protect training data and model weights
   - Secure API endpoints
   - Monitor for model manipulation/poisoning

2. **Data Governance:**
   - Clear data lineage for AI inputs
   - Explainability for regulatory inquiries
   - Audit trails for AI-driven decisions

3. **Third-Party AI Risk:**
   - Assess security of AI vendors
   - Understand data handling by AI providers
   - Contract protections for AI services

4. **Emerging Threats:**
   - Prompt injection attacks
   - AI-generated phishing (targeting firm)
   - Deepfake social engineering

---

## Compliance Checklist Summary

### Regulation S-P Compliance
- [ ] Written policies and procedures (admin, technical, physical safeguards)
- [ ] Initial privacy notice at relationship establishment
- [ ] Annual privacy notice (or meet exception criteria)
- [ ] Opt-out mechanisms for third-party disclosures
- [ ] Incident response program
- [ ] Customer notification procedures (30-day timeline)
- [ ] Service provider oversight (72-hour notification requirement)
- [ ] Information disposal procedures
- [ ] Recordkeeping (6-year retention)

### Regulation S-ID Compliance
- [ ] Written Identity Theft Prevention Program
- [ ] Periodic covered account assessment
- [ ] Red Flag identification procedures
- [ ] Red Flag detection procedures
- [ ] Response procedures
- [ ] Board/management approval
- [ ] Staff training
- [ ] Annual compliance reporting
- [ ] Service provider oversight

### State Privacy Compliance
- [ ] CCPA/CPRA procedures for non-GLBA data
- [ ] State breach notification procedures
- [ ] Data inventory (what's covered by GLBA vs. state law)

### Insurance and Custodian Compliance
- [ ] Cyber insurance (minimum $1M)
- [ ] E&O insurance
- [ ] Social engineering coverage
- [ ] Meet custodian-specific requirements

### Documentation Requirements
- [ ] Written Information Security Policy (WISP)
- [ ] Risk assessment (annual)
- [ ] Vendor due diligence files
- [ ] Training records
- [ ] Incident logs
- [ ] Board/management meeting minutes
- [ ] Policy review/approval records

---

## Key Regulatory Sources

1. **Regulation S-P:** 17 CFR Part 248, Subpart A
2. **Regulation S-ID:** 17 CFR Part 248, Subpart C
3. **SEC Safeguards Rule Amendments:** 89 FR 47786 (June 3, 2024)
4. **SEC 2026 Examination Priorities:** sec.gov/files/2026-exam-priorities.pdf
5. **NIST Cybersecurity Framework 2.0:** nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf
6. **CCPA/CPRA:** Cal. Civ. Code §§1798.100-1798.199

---

*Research compiled February 2026. Regulations change frequently - verify current requirements before relying on this document.*
