# Maven Social Security Optimizer

*"The PDF they take to the Social Security office"*

---

## Product Vision

A comprehensive Social Security optimization tool that helps users and advisors determine the optimal claiming strategy, then generates a professional PDF report they can take directly to their SSA appointment.

**Inspiration:** BlackRock's SS estimator that advisors loved — clients would print the PDF and bring it to the SS office to execute their optimal strategy.

**Why it matters:**
- Claiming decision = $100,000-$200,000+ lifetime difference for couples
- Math is complex (spousal, survivor, earnings test, taxes)
- Most people just claim at 62 or FRA without analysis
- Perfect for AI: high value, data-intensive, personalized

---

## Core Features

### 1. Smart Data Collection

**Required Inputs:**
```
Personal:
- Date of birth
- Marital status
- Health/life expectancy (simple slider: "expect to live to...")
- State of residence (for state SS taxation)

From SSA Statement (my.ssa.gov):
- Estimated benefit at 62
- Estimated benefit at FRA  
- Estimated benefit at 70
- (Or: Full earnings history for precise calculation)

If Married:
- Spouse's DOB
- Spouse's estimated benefits
- Marriage date
- Previous marriages (10+ years = divorced spouse benefit eligible)

Financial Context:
- Other retirement income (pension, 401k, etc.)
- Expected part-time work (earnings test)
- Current tax bracket
- Roth vs Traditional allocation
```

**UX Notes:**
- Link to my.ssa.gov with instructions to download statement
- Auto-parse uploaded SSA PDF (if possible)
- Smart defaults based on life expectancy tables
- Progress bar showing data completeness

### 2. Optimization Engine

**Single Person Analysis:**
- Break-even calculations (62 vs FRA vs 70)
- NPV comparison at different discount rates
- Life expectancy sensitivity analysis
- Tax-adjusted comparisons
- Earnings test impact modeling

**Married Couple Analysis:**
- Joint claiming age optimization (both spouses)
- Survivor benefit maximization
- Spousal benefit coordination
- "Who should delay?" recommendation
- Combined lifetime benefit comparison

**Key Calculations:**
```typescript
interface SSAnalysis {
  // Core benefits
  benefitAt62: number;
  benefitAtFRA: number;
  benefitAt70: number;
  
  // Break-even
  breakEven62vs70: number;  // Age
  breakEvenFRAv70: number;
  
  // Lifetime totals
  lifetimeBenefits: {
    claimAt62: number;
    claimAtFRA: number;
    claimAt70: number;
  };
  
  // Optimal strategy
  optimalClaimingAge: number;
  optimalStrategy: string;
  lifetimeAdvantage: number;  // vs claiming at 62
  
  // For couples
  spousalBenefitValue?: number;
  survivorBenefitValue?: number;
  combinedOptimalStrategy?: {
    person1ClaimAge: number;
    person2ClaimAge: number;
    reasoning: string;
  };
}
```

### 3. Scenario Comparison

**Side-by-Side Views:**
| Scenario | Claim Age | Monthly | Lifetime | Tax Impact |
|----------|-----------|---------|----------|------------|
| A: Early | 62 | $1,680 | $423,000 | +$45,000 |
| B: FRA | 67 | $2,400 | $518,000 | +$52,000 |
| C: Delay | 70 | $2,976 | $571,000 | +$48,000 |
| **Optimal** | **70** | **$2,976** | **$571,000** | - |

**Visualizations:**
- Cumulative benefit chart (lines crossing at break-even)
- Monthly income comparison
- "What if I live to..." slider with live updates
- Tax torpedo illustration (provisional income zones)

### 4. The PDF Report (THE DELIVERABLE)

**Report Sections:**

**Cover Page:**
```
SOCIAL SECURITY OPTIMIZATION REPORT
Prepared for: [Client Name]
Prepared by: [Advisor Name / Maven]
Date: [Date]

Optimal Strategy: Claim at age [X]
Estimated Lifetime Advantage: $[XXX,XXX]
```

**Executive Summary (1 page):**
- Recommended claiming age(s)
- Estimated monthly benefit
- Break-even age
- Key factors driving recommendation
- 3-sentence plain English explanation

**Detailed Analysis (2-3 pages):**
- Full scenario comparison table
- Cumulative benefit chart
- Life expectancy analysis
- Spousal/survivor analysis (if married)
- Earnings test impact (if working)
- Tax implications

**Action Plan (1 page):**
- [ ] Create my.ssa.gov account if not done
- [ ] Verify earnings history is accurate
- [ ] Schedule SSA appointment at age [X]
- [ ] When you visit: Request to file for benefits effective [date]
- [ ] If married: Coordinate with spouse's claiming date

**Appendix:**
- Methodology explanation
- Assumptions used
- Disclaimer language
- SSA contact information

**PDF Features:**
- Professional, clean design
- Printable (optimized for 8.5x11)
- QR code linking to online version
- Advisor branding option (Maven Pro)

### 5. Integration with Maven

**Dashboard Widget:**
```
┌─────────────────────────────────────────┐
│ 📊 Social Security Optimizer            │
│                                         │
│ Your optimal claiming age: 70           │
│ Monthly benefit: $2,976                 │
│ vs Age 62: +$148,000 lifetime           │
│                                         │
│ [View Full Analysis] [Download PDF]     │
└─────────────────────────────────────────┘
```

**Oracle Integration:**
- "When should I claim Social Security?"
- "What's my break-even age?"
- "Should my spouse claim first?"
- "How does working affect my benefits?"

**Proactive Insights:**
- "You're turning 62 in 6 months. Here's your SS optimization analysis..."
- "Based on your health goals, delaying to 70 could add $87,000 to lifetime benefits"
- "Your spouse should consider claiming at 67 while you delay to 70"

---

## Technical Implementation

### Data Model

```prisma
model SocialSecurityProfile {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])
  
  // Personal
  dateOfBirth   DateTime
  lifeExpectancy Int      @default(85)
  stateOfResidence String?
  
  // Benefits (from SSA)
  benefitAt62   Decimal
  benefitAtFRA  Decimal
  benefitAt70   Decimal
  fullRetirementAge Int   // months
  
  // Work
  currentlyWorking Boolean @default(false)
  expectedEarnings Decimal?
  retirementAge    Int?
  
  // Spouse (if married)
  isMarried     Boolean  @default(false)
  spouseDOB     DateTime?
  spouseBenefitAt62 Decimal?
  spouseBenefitAtFRA Decimal?
  spouseBenefitAt70 Decimal?
  marriageDate  DateTime?
  
  // Previous marriages (for divorced spouse benefits)
  previousMarriages Json?  // [{startDate, endDate, exSpouseBenefit}]
  
  // Analysis results (cached)
  analysis      Json?
  analysisDate  DateTime?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### API Endpoints

```
POST /api/social-security/profile
  - Create/update SS profile

GET /api/social-security/analyze
  - Run optimization analysis

GET /api/social-security/scenarios
  - Compare multiple scenarios

GET /api/social-security/pdf
  - Generate PDF report

POST /api/social-security/parse-statement
  - Parse uploaded SSA statement PDF
```

### PDF Generation

**Options:**
1. **React-PDF** - Generate in browser, good for simple layouts
2. **Puppeteer** - Render HTML to PDF, more flexible
3. **PDFKit** - Node.js PDF generation, full control
4. **Vercel OG + jsPDF** - Hybrid approach

**Recommendation:** Puppeteer for this use case
- Can render complex charts
- Matches web styling exactly
- Professional output quality

---

## MVP Scope

**Phase 1 (MVP):**
- [ ] Single person analysis
- [ ] Break-even calculator
- [ ] 3-scenario comparison
- [ ] Basic PDF report
- [ ] Oracle integration

**Phase 2:**
- [ ] Married couple optimization
- [ ] Spousal benefit analysis
- [ ] Survivor benefit modeling
- [ ] Enhanced PDF with advisor branding

**Phase 3:**
- [ ] Earnings test calculator
- [ ] Tax integration (provisional income)
- [ ] Monte Carlo with SS scenarios
- [ ] SSA statement parser
- [ ] Full retirement income integration

---

## Competitive Differentiation

**What others do:**
- Simple break-even calculators
- Generic "delay if you can" advice
- Separate from rest of financial plan

**What Maven does:**
- Full couple optimization
- Tax-aware recommendations
- Integrated with portfolio/tax planning
- AI explains WHY in plain English
- Actionable PDF for SSA office
- Proactive nudges at right life moments

---

## Success Metrics

- PDF downloads per month
- % of users completing SS profile
- NPS for SS optimizer specifically
- Advisor adoption (Maven Pro)
- "Brought to SSA office" feedback

---

## References

- SSA.gov calculators (inspiration, not to copy)
- BlackRock SS estimator (Sam's reference)
- Research: `memory/research/retirement/social-security-optimization.md`

---

*This is the kind of tool that makes Maven indispensable. You use it once, see $100k+ of value, and never leave.*
