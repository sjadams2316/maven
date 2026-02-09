# Maven Test Personas

*Use these personas to validate every feature and change.*

---

## Validation Rule

**No feature ships without testing against at least 3 personas.**

---

## Persona 1: New User (Empty State)

**Name:** Alex Starting
**Scenario:** Just heard about Maven, clicked "Try Demo"

```yaml
profile:
  net_worth: $0 (no data entered)
  accounts: none
  holdings: none
  
focus_areas:
  - First impressions (do they understand what Maven does?)
  - Onboarding flow (is it clear what to do next?)
  - Empty states (do pages look broken without data?)
  - Value proposition (why should they continue?)
  
test_questions:
  - Is the "Try Demo" experience compelling?
  - Can they understand Maven in 30 seconds?
  - Is the path to entering their own data clear?
  - Do empty states guide, not confuse?
```

---

## Persona 2: Basic User

**Name:** Jordan Starter
**Scenario:** Young professional, just starting to invest

```yaml
profile:
  age: 28
  net_worth: $50,000
  income: $85,000
  
accounts:
  - 401(k): $35,000 (target date fund)
  - Roth IRA: $12,000 (VTI, VXUS)
  - Savings: $3,000
  
holdings: 5 positions
risk_tolerance: Growth
goals: [retirement, emergency_fund]
  
focus_areas:
  - Core features work with simple data
  - Recommendations are appropriate for situation
  - Not overwhelmed by advanced features
  - Feels like Maven is "for them"
  
test_questions:
  - Are insights relevant to their situation?
  - Does Portfolio Lab make sense with 5 holdings?
  - Is retirement projection believable?
  - Do they feel encouraged, not inadequate?
```

---

## Persona 3: Power User

**Name:** Morgan Maven (Default Demo Profile)
**Scenario:** Engaged user with complex portfolio

```yaml
profile:
  age: 45
  net_worth: $800,000
  income: $250,000
  
accounts:
  - 401(k): $350,000
  - Roth IRA: $150,000
  - Brokerage: $200,000
  - HSA: $25,000
  - 529: $28,000
  - Crypto: $47,000
  
holdings: 45+ positions
risk_tolerance: Moderate
goals: [retirement_2045, college_savings, beach_house]
  
focus_areas:
  - All features fully exercised
  - Complex scenarios handled correctly
  - Performance with many holdings
  - Cross-account optimization
  
test_questions:
  - Does allocation calculate correctly across accounts?
  - Are tax-loss opportunities identified?
  - Do stress tests run without errors?
  - Is the UI performant with this much data?
```

---

## Persona 4: HNW User (Concentrated)

**Name:** Taylor Techstock
**Scenario:** Tech executive with concentrated position

```yaml
profile:
  age: 42
  net_worth: $3,200,000
  income: $450,000 (+ equity comp)
  
accounts:
  - Company Stock: $1,900,000 (60% of portfolio)
  - 401(k): $600,000
  - Brokerage: $500,000
  - RSUs vesting: $400,000/year
  
holdings: 
  - NVDA: $1,900,000 (concentrated)
  - Plus 25 other positions
  
special_situations:
  - RSU vesting schedule
  - 10b5-1 plan consideration
  - QSBS eligibility question
  - AMT exposure
  
focus_areas:
  - Concentration warnings appropriate
  - Diversification strategies relevant
  - Tax implications of selling
  - Equity comp tools work
  
test_questions:
  - Does concentration alert show prominently?
  - Are suggestions for diversification smart?
  - Does tax analysis handle large gains correctly?
  - Is the advice sophisticated enough?
```

---

## Persona 5: Retiree

**Name:** Pat Pension
**Scenario:** Recently retired, income-focused

```yaml
profile:
  age: 68
  net_worth: $1,500,000
  income: $40,000 (pension) + SS pending
  
accounts:
  - Traditional IRA: $900,000
  - Roth IRA: $200,000
  - Brokerage: $300,000
  - Savings: $100,000
  
holdings: 30 positions (dividend-focused)
risk_tolerance: Conservative
goals: [income_generation, legacy, healthcare]
  
special_situations:
  - RMD starting age 73
  - Social Security optimization
  - Medicare IRMAA considerations
  - Roth conversion ladder potential
  
focus_areas:
  - Income projections accurate
  - SS optimizer works correctly
  - RMD calculations correct
  - Drawdown strategies sensible
  
test_questions:
  - Is SS optimization recommendation sound?
  - Does income projection include RMDs?
  - Are withdrawal strategies tax-efficient?
  - Does the UI feel reassuring, not scary?
```

---

## Persona 6: Tech Executive

**Name:** Sam TechExec
**Scenario:** Executive with complex equity compensation

```yaml
profile:
  age: 38
  net_worth: $2,800,000
  income: $350,000 base + $500,000 equity
  
accounts:
  - Company ESPP: $180,000
  - RSUs (vested): $1,200,000
  - RSUs (unvested): $800,000
  - ISOs: 50,000 shares
  - 401(k): $400,000
  - Brokerage: $220,000
  
special_situations:
  - ISO exercise strategy (AMT)
  - 83(b) election consideration
  - QSBS qualification check
  - 10b5-1 plan timing
  - Blackout period awareness
  
focus_areas:
  - Equity comp handled correctly
  - Tax scenarios for ISO exercise
  - Concentration risk with company stock
  - Vesting schedule integration
  
test_questions:
  - Does Maven understand RSU vs ISO vs ESPP?
  - Are tax implications calculated correctly?
  - Is 10b5-1 guidance appropriate?
  - Does it flag blackout period risks?
```

---

## Persona 7: Advisor View

**Name:** Jamie Advisor
**Scenario:** RIA managing multiple clients

```yaml
profile:
  role: Independent RIA
  aum: $50M
  clients: 35
  
test_clients:
  - 3 HNW ($2M+)
  - 10 Affluent ($500K-2M)
  - 15 Mass Affluent ($100K-500K)
  - 7 Emerging ($50K-100K)
  
focus_areas:
  - Client list performance
  - Cross-client insights
  - Meeting prep generation
  - Bulk actions
  - Compliance documentation
  
test_questions:
  - Can advisor see all clients at a glance?
  - Are insights prioritized correctly?
  - Does meeting prep save time?
  - Is compliance trail complete?
```

---

## Using Test Personas

### For Development
```bash
# Load test profile in browser console
# Scripts at: maven/test/load-[persona]-profile.js
```

### For QA Agents
```
Before approving any change:
1. Test with new_user (empty state)
2. Test with power_user (full data)
3. Test with at least one specialty persona (retiree, tech_exec, etc.)
4. Document which personas were tested
```

### For UX Agents
```
For each screen/flow:
1. Walk through as new_user — is it clear?
2. Walk through as retiree — is it reassuring?
3. Walk through as tech_exec — is it sophisticated enough?
4. Walk through on mobile for all personas
```

---

*Test personas are living documents. Update as we learn more about real users.*
