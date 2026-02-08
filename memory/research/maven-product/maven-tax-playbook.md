# Maven Tax Playbook
*The Tax Alpha Engine — Maven's Core Differentiator*

*Created: 2026-02-06*

---

## Executive Summary

Maven's tax optimization suite is the primary value differentiator vs robo-advisors. While Wealthfront and Betterment offer surface-level tax-loss harvesting, Maven provides **comprehensive, cross-account, personalized tax alpha** that can deliver 50-150+ bps of additional after-tax returns annually.

**Total Annual Value Potential:**
| Module | Annual Value (per $500K portfolio) |
|--------|-----------------------------------|
| Tax-Loss Harvesting Engine | $2,000-5,000 |
| Asset Location Optimizer | $1,400-4,100 |
| Roth Conversion Calculator | $3,000-15,000 (situational) |
| Capital Gains Harvester | $500-2,000 |
| NIIT Avoidance Module | $0-7,600 |
| HSA Optimization | $800-1,500 |
| **Total Potential** | **$7,700-35,200/year** |

---

## Module 1: Tax-Loss Harvesting Engine

### Logic/Algorithm

**Triggering Logic:**
```
FOR each position in taxable accounts:
  unrealized_loss = cost_basis - current_value
  loss_percentage = unrealized_loss / cost_basis
  
  IF unrealized_loss > $1,000 AND loss_percentage > 5%:
    IF has_valid_replacement(position):
      IF NOT wash_sale_blocked(position):
        QUEUE harvest_opportunity(position)
        
  # Year-end aggressive mode (December 1-28):
  IF month == 12 AND unrealized_loss > $500:
    QUEUE harvest_opportunity(position)
```

**Wash Sale Prevention (Cross-Account Monitoring):**
```
wash_sale_check(security, date):
  # Check ALL linked accounts (taxable + IRAs + spouse)
  FOR each account in household_accounts:
    FOR each transaction in account.last_61_days():
      IF transaction.security.is_substantially_identical(security):
        IF transaction.date within (date - 30days, date + 30days):
          RETURN BLOCKED
  
  # Check DRIP status
  IF security.drip_enabled:
    ALERT "Disable DRIP before harvesting"
    RETURN BLOCKED
    
  RETURN CLEAR
```

**Substantially Identical Logic:**
- Same CUSIP → BLOCKED
- Same fund family + same index → BLOCKED
- Different index, similar exposure → ALLOWED (e.g., VOO → SCHX)
- Same company stock → BLOCKED
- Same company stock vs option → BLOCKED

**Replacement Security Selection:**
1. Map position to asset class (US Large Cap, Total Market, etc.)
2. Select from pre-approved substitutes with different index tracking
3. Maintain similar beta/exposure within 0.95-1.05 correlation
4. Prefer lower expense ratio when equivalent

**Pre-approved Swap Pairs:**
| Primary | Replacement | Asset Class |
|---------|-------------|-------------|
| VOO (S&P 500) | SCHX (US Large Cap) | US Large |
| VTI (Total Market) | ITOT (Core S&P Total) | Total US |
| VXUS (Intl) | IXUS (Core MSCI Total Intl) | International |
| BND (Total Bond) | AGG (Core US Agg) | US Bonds |
| VWO (Emerging) | IEMG (Core EM) | Emerging |

**Year-End Optimization Window:**
- December 1: Scan all positions for harvest opportunities
- December 15: Alert for any >$3,000 loss opportunities
- December 28: Final harvest deadline (T+2 settlement for Dec 31)
- Alert if carryforward losses exist from prior years

### User Value: $ Savings Estimate

**Conservative estimate: 0.40-1.00% annually on harvestable losses**

Assumptions for $500K taxable portfolio:
- Average 10% of portfolio has harvestable losses in any year
- $50,000 in harvestable losses × 35% marginal rate = **$17,500 tax value**
- Deferred (not eliminated), but time value of deferral = ~**$2,000-5,000/year**

**Kitces research**: Tax-loss harvesting worth 0.2-0.4% annual alpha in normal markets, up to 1%+ in volatile years (2022, 2020).

### Data Needed

**Required:**
- All taxable account holdings with cost basis (per lot)
- All IRA/401k holdings (for wash sale monitoring)
- Spouse's accounts (if applicable)
- DRIP enrollment status
- Marginal tax bracket (federal + state)
- Capital loss carryforward from prior years

**Nice to Have:**
- Expected holding period (step-up planning)
- Target asset allocation
- Planned sales in next 30 days

### Competitor Gap

| Feature | Wealthfront | Betterment | Maven |
|---------|-------------|------------|-------|
| Basic TLH | ✅ | ✅ | ✅ |
| Cross-account wash sale monitoring | ❌ Single account | ❌ Single account | ✅ Household-wide |
| IRA wash sale prevention | ❌ | ❌ | ✅ |
| DRIP conflict detection | ❌ | ❌ | ✅ |
| Spouse account coordination | ❌ | ❌ | ✅ |
| Year-end optimization alerts | Limited | Limited | ✅ Personalized |
| Carryforward tracking | Basic | Basic | ✅ Integrated |

---

## Module 2: Asset Location Optimizer

### Logic/Algorithm

**Asset Placement Decision Rules:**
```
FOR each asset_class in portfolio:
  tax_efficiency_score = calculate_tax_efficiency(asset_class)
  expected_return = projected_return(asset_class)
  
  # Tax-inefficient assets → Tax-advantaged accounts
  IF tax_efficiency_score < 0.5:  # Bonds, REITs, high-turnover
    preferred_account = Traditional_IRA  # Tax-deferred
    backup_account = Roth_IRA
    
  # High-growth assets → Roth (maximize tax-free gains)  
  ELIF expected_return > market_return + 2%:
    preferred_account = Roth_IRA
    backup_account = Traditional_IRA
    
  # Tax-efficient assets → Taxable (preserve flexibility)
  ELSE:
    preferred_account = Taxable
    backup_account = ANY
```

**Tax Efficiency Rankings (Score 0-1):**
| Asset Class | Score | Annual Tax Drag | Placement Priority |
|-------------|-------|-----------------|-------------------|
| Tax-managed equity | 0.95 | 0.05% | Taxable |
| Total stock index | 0.90 | 0.10% | Taxable |
| Individual stocks (LTCG) | 0.85 | 0.15% | Taxable |
| Municipal bonds | 0.98 | 0.00% | Taxable |
| International equity | 0.80 | 0.20% | Taxable (foreign tax credit) |
| TIPS | 0.30 | 0.70% | Tax-deferred |
| Corporate bonds | 0.25 | 0.75% | Tax-deferred |
| High-yield bonds | 0.20 | 0.80% | Tax-deferred |
| REITs | 0.15 | 0.85% | Tax-deferred (or Roth) |
| Taxable bond funds | 0.20 | 0.80% | Tax-deferred |

**Rebalancing While Maintaining Location:**
```
rebalance_portfolio():
  # Step 1: Calculate total portfolio drift
  FOR each asset_class:
    current_weight = sum(all_accounts)
    target_weight = allocation_target
    drift = current_weight - target_weight
    
  # Step 2: Rebalance within tax-advantaged first
  FOR each trade in rebalance_trades:
    IF trade.is_sell:
      prefer_account = tax_advantaged  # Avoid taxable gains
    IF trade.is_buy:
      consider_optimal_location(asset_class)
      
  # Step 3: Direct new contributions strategically
  new_contribution_guidance():
    IF taxable_needs_bonds:
      ALERT "Consider muni bonds instead"
    IF traditional_ira_has_space AND bonds_needed:
      DIRECT bonds → Traditional_IRA
```

### User Value: $ Savings Estimate

**Schwab Research Data (per $2M portfolio, 50/50 split):**

| Marginal Tax Bracket | Annual Tax Drag Reduction |
|---------------------|--------------------------|
| 22% / 15% LTCG | 0.14% ($2,800) |
| 24% / 15% LTCG | 0.16% ($3,200) |
| 35.8% / 18.8% LTCG | 0.34% ($6,800) |
| 37% + 3.8% NIIT / 23.8% LTCG | 0.41% ($8,200) |

**For $500K portfolio: $1,400-4,100 annually**

**Vanguard finding**: 90% of benefit comes from just two moves:
1. Municipal bonds in taxable (vs taxable bonds)
2. Passive funds in taxable / active funds in tax-advantaged

### Data Needed

**Required:**
- All accounts by type (taxable, Traditional IRA, Roth, 401k)
- Current holdings in each account
- Target asset allocation
- Marginal tax bracket (federal + state)
- Time horizon

**Nice to Have:**
- Expected tax bracket in retirement
- State of residence (for muni bond selection)
- Estate planning considerations (step-up basis matters)

### Competitor Gap

| Feature | Wealthfront | Betterment | Maven |
|---------|-------------|------------|-------|
| Basic asset location | ✅ | ✅ | ✅ |
| Cross-account optimization | ❌ Managed only | ❌ Managed only | ✅ Full household |
| 401k/403b integration | ❌ | ❌ | ✅ |
| Muni bond tax-equivalent yield calc | ❌ | ❌ | ✅ |
| Rebalancing preserves location | Partial | Partial | ✅ Full |
| Step-up basis planning | ❌ | ❌ | ✅ |
| State-specific muni recommendations | ❌ | ❌ | ✅ |

---

## Module 3: Roth Conversion Calculator

### Logic/Algorithm

**Bracket-Filling Logic:**
```
calculate_optimal_conversion(user):
  current_income = user.taxable_income  # Before conversion
  
  # Find marginal bracket
  bracket = get_bracket(current_income, user.filing_status)
  
  # Calculate room in current bracket
  bracket_ceiling = bracket.upper_limit
  room_in_bracket = bracket_ceiling - current_income
  
  # Check for cliffs (ACA, IRMAA)
  aca_cliff = get_aca_cliff(user)
  irmaa_threshold = get_irmaa_threshold(user.age)
  
  max_safe_conversion = min(
    room_in_bracket,
    aca_cliff - current_income if aca_cliff else INFINITY,
    irmaa_threshold - current_income if user.age >= 63 else INFINITY
  )
  
  # Consider next bracket if favorable
  IF user.expected_future_rate > bracket.next_rate:
    extend_to_next_bracket()
    
  RETURN optimal_conversion_amount
```

**2025-2026 Bracket Reference (MFJ):**
| Bracket | Income Range | Conversion Room Example |
|---------|-------------|------------------------|
| 10% | $0 - $23,850 | — |
| 12% | $23,850 - $96,950 | $73,100 room |
| 22% | $96,950 - $206,700 | $109,750 room |
| 24% | $206,700 - $394,600 | $187,900 room |
| 32% | $394,600 - $501,050 | $106,450 room |
| 35% | $501,050 - $751,600 | $250,550 room |

**Pro-Rata Rule Handling:**
```
calculate_taxable_portion(conversion_amount):
  # Aggregate ALL Traditional IRA, SEP, SIMPLE balances
  total_pretax = sum(traditional_ira, sep_ira, simple_ira) [pretax portion]
  total_aftertax = sum(nondeductible_contributions)
  total_balance = total_pretax + total_aftertax
  
  pretax_ratio = total_pretax / total_balance
  
  taxable_amount = conversion_amount * pretax_ratio
  
  # Alert if pro-rata creates surprise tax
  IF user.has_backdoor_roth_intent AND pretax_ratio > 0.10:
    ALERT "Pro-rata rule will make backdoor Roth mostly taxable"
    SUGGEST "Roll pre-tax IRA to 401(k) first"
    
  RETURN taxable_amount
```

**Multi-Year Conversion Ladder Modeling:**
```
model_conversion_ladder(user, years=10):
  results = []
  traditional_balance = user.traditional_ira_balance
  
  FOR year in range(years):
    projected_income = estimate_income(user, year)
    optimal_conversion = calculate_optimal_conversion(user, year)
    
    tax_cost = optimal_conversion * marginal_rate(year)
    traditional_balance -= optimal_conversion
    roth_balance += optimal_conversion
    
    # Model RMD impact
    IF user.age + year >= 73:
      rmd = calculate_rmd(traditional_balance, user.age + year)
      forced_income = rmd
      
    results.append({
      'year': year,
      'conversion': optimal_conversion,
      'tax_cost': tax_cost,
      'traditional_remaining': traditional_balance,
      'rmd_projection': rmd if applicable
    })
    
  RETURN results
```

**Break-Even Analysis:**
```
calculate_breakeven(conversion_amount, current_rate, future_rate, years_to_withdrawal):
  # Tax cost now
  tax_now = conversion_amount * current_rate
  
  # Tax savings later (on growth)
  growth_factor = (1 + expected_return) ^ years_to_withdrawal
  future_value = conversion_amount * growth_factor
  tax_avoided = (future_value - conversion_amount) * future_rate
  
  # Also consider: state tax changes, RMD avoidance, estate benefits
  
  net_benefit = tax_avoided - tax_now
  breakeven_years = solve_for_years(tax_now == tax_avoided)
  
  RETURN {
    'net_benefit': net_benefit,
    'breakeven_years': breakeven_years,
    'recommendation': 'CONVERT' if net_benefit > 0 else 'HOLD'
  }
```

**Backdoor Roth Workflow:**
```
backdoor_roth_workflow(user):
  # Step 1: Check pro-rata situation
  pretax_ira_balance = sum(user.traditional_iras.pretax)
  
  IF pretax_ira_balance > 0:
    ALERT "Pro-rata rule applies"
    
    IF user.has_401k_that_accepts_rollovers:
      SUGGEST "Roll $X pre-tax IRA to 401(k) before Dec 31"
    ELSE:
      SHOW pro_rata_calculation()
      
  # Step 2: Contribution
  max_contribution = 7000  # 8000 if 50+
  GUIDE "Contribute $X to non-deductible Traditional IRA"
  
  # Step 3: Convert
  GUIDE "Convert to Roth immediately (same day ideal)"
  
  # Step 4: Documentation
  REMIND "File Form 8606 with tax return"
  TRACK basis_in_traditional_ira
```

### User Value: $ Savings Estimate

**Scenario: Married couple, age 62, $1.5M Traditional IRA**

Without conversion strategy:
- RMDs at 73: ~$58,000/year (forced taxable income)
- Plus Social Security: Pushes into higher brackets
- Potential lifetime tax: $400,000+

With systematic conversions (ages 62-72):
- Convert $100,000/year at 22% bracket
- Tax cost: $220,000 over 10 years
- RMDs reduced to ~$15,000/year
- Lifetime tax savings: **$100,000-180,000**

**Annual value during conversion years: $10,000-18,000**

For younger clients doing backdoor Roth: $7,000/year × 40 years × 8% = **$1.8M tax-free** (vs taxable account alternative)

### Data Needed

**Required:**
- All Traditional IRA, SEP, SIMPLE balances (with pre-tax/after-tax breakdown)
- Current year taxable income projection
- Filing status
- Age
- State of residence

**For Full Optimization:**
- Expected retirement income (Social Security, pensions)
- Expected retirement age
- 401(k) balance and plan rollover rules
- Medicare enrollment plans (IRMAA)
- ACA premium subsidy eligibility
- Spouse's income and accounts

### Competitor Gap

| Feature | Wealthfront | Betterment | Maven |
|---------|-------------|------------|-------|
| Conversion recommendations | ❌ | ❌ | ✅ |
| Bracket-filling optimization | ❌ | ❌ | ✅ |
| Pro-rata rule calculator | ❌ | ❌ | ✅ |
| Multi-year ladder modeling | ❌ | ❌ | ✅ |
| ACA cliff warnings | ❌ | ❌ | ✅ |
| IRMAA impact modeling | ❌ | ❌ | ✅ |
| Backdoor Roth workflow | ❌ | ❌ | ✅ |
| Form 8606 guidance | ❌ | ❌ | ✅ |

---

## Module 4: Capital Gains Harvester

### Logic/Algorithm

**0% Bracket Optimization:**
```
harvest_gains_at_zero(user):
  # 2025 0% LTCG thresholds
  thresholds = {
    'single': 48350,
    'mfj': 96700,
    'hoh': 64750
  }
  
  taxable_income = user.ordinary_income
  threshold = thresholds[user.filing_status]
  
  IF taxable_income < threshold:
    room_for_zero_gains = threshold - taxable_income
    
    # Find positions with LTCG
    gain_positions = user.taxable_positions
      .filter(holding_period > 1 year)
      .filter(unrealized_gain > 0)
      .sort_by(gain_percentage, descending)
      
    # Harvest up to threshold
    gains_to_harvest = min(
      room_for_zero_gains,
      sum(gain_positions.unrealized_gain)
    )
    
    RECOMMEND "Sell $X of appreciated positions for 0% LTCG"
    RESULT: Reset cost basis higher, future gains reduced
```

**Lot Selection Logic:**
```
select_lots_for_sale(position, amount_to_sell, goal):
  lots = position.tax_lots.sort_by(basis)
  
  IF goal == 'minimize_gain':
    # HIFO - Highest In, First Out
    selected = lots.sort_by(basis, descending)
    
  ELIF goal == 'maximize_loss':
    # Lowest basis first
    selected = lots.sort_by(basis, ascending)
    
  ELIF goal == 'harvest_long_term_only':
    # Only lots held > 1 year
    selected = lots.filter(holding_period > 365)
    
  ELIF goal == 'specific_id':
    # User selects specific lots
    selected = user.selected_lots
    
  # Verify selection doesn't create unexpected ST gains
  IF any(selected.holding_period < 365) AND goal != 'intended_short_term':
    WARN "Selection includes short-term positions"
    
  RETURN selected
```

**Short-Term to Long-Term Conversion Timing:**
```
long_term_threshold_alerts(user):
  FOR each position in user.taxable_positions:
    IF position.has_unrealized_gain:
      days_held = today - position.purchase_date
      
      IF days_held >= 335 AND days_held < 365:
        ALERT f"{position.symbol}: Hold {365 - days_held} more days for LTCG"
        potential_savings = position.gain * (user.st_rate - user.lt_rate)
        SHOW f"Potential savings: ${potential_savings}"
```

**Step-Up Basis Planning:**
```
step_up_analysis(user):
  IF user.age >= 70 OR user.has_terminal_condition:
    highly_appreciated_positions = user.taxable_positions
      .filter(gain_percentage > 50%)
      
    FOR position in highly_appreciated_positions:
      gain = position.current_value - position.cost_basis
      tax_if_sold = gain * user.ltcg_rate
      
      SHOW f"{position.symbol}: ${gain} unrealized gain"
      SHOW f"Tax if sold: ${tax_if_sold}"
      SHOW f"Tax if held until death (step-up): $0"
      
      IF position.in_estate_plan:
        RECOMMEND "Consider holding for step-up basis at death"
```

### User Value: $ Savings Estimate

**0% LTCG Harvesting:**
- MFJ in 12% bracket with $30,000 LTCG room
- Harvest $30,000 of gains at 0% vs future 15% = **$4,500 savings**

**Lot Selection Optimization:**
- $100,000 sale, lots range from $60K to $90K basis
- HIFO saves $30,000 × 15% = **$4,500** vs FIFO

**ST to LT Conversion:**
- $20,000 gain, 30 days from LTCG eligibility
- Waiting saves: $20,000 × (24% - 15%) = **$1,800**

**Step-Up at Death:**
- $500,000 unrealized gains in estate
- Step-up saves: $500,000 × 23.8% = **$119,000** (one-time, at death)

### Data Needed

**Required:**
- All taxable positions with lot-level detail
- Purchase dates per lot
- Cost basis per lot
- Current marginal tax bracket
- Current year taxable income projection

**For Step-Up Planning:**
- Age and health status
- Estate planning goals
- Beneficiary designations

### Competitor Gap

| Feature | Wealthfront | Betterment | Maven |
|---------|-------------|------------|-------|
| 0% bracket harvesting | ❌ | ❌ | ✅ |
| Lot selection optimization | Basic | Basic | ✅ HIFO + Specific ID |
| ST→LT conversion alerts | ❌ | ❌ | ✅ |
| Step-up basis planning | ❌ | ❌ | ✅ |
| Cross-account lot optimization | ❌ | ❌ | ✅ |

---

## Module 5: NIIT Avoidance Module

### Logic/Algorithm

**MAGI Monitoring:**
```
niit_threshold_monitor(user):
  thresholds = {
    'single': 200000,
    'mfj': 250000,
    'mfs': 125000
  }
  
  threshold = thresholds[user.filing_status]
  current_magi = calculate_magi(user)
  
  # Calculate net investment income
  nii = sum(
    user.interest_income,
    user.dividend_income,
    user.capital_gains,
    user.rental_income_passive,
    user.royalties,
    user.passive_business_income
  )
  
  IF current_magi > threshold:
    excess = current_magi - threshold
    niit_base = min(nii, excess)
    niit_liability = niit_base * 0.038
    
    ALERT f"NIIT exposure: ${niit_liability}"
    SUGGEST reduction_strategies(user)
```

**NIIT Reduction Strategies:**
```
niit_reduction_strategies(user):
  strategies = []
  
  # Strategy 1: Max tax-deferred contributions
  IF user.has_401k_room:
    potential_savings = user.remaining_401k_space * 0.038
    strategies.append({
      'action': 'Max 401(k) contributions',
      'savings': potential_savings
    })
    
  # Strategy 2: HSA contributions
  IF user.hsa_eligible:
    potential_savings = user.hsa_contribution_room * 0.038
    strategies.append({
      'action': 'Max HSA contributions', 
      'savings': potential_savings
    })
    
  # Strategy 3: Tax-loss harvesting
  IF user.has_unrealized_losses:
    potential_reduction = sum(user.harvestable_losses)
    strategies.append({
      'action': 'Harvest losses to offset gains',
      'nii_reduction': potential_reduction
    })
    
  # Strategy 4: Municipal bonds
  IF user.has_taxable_bonds:
    bond_income = user.taxable_bond_income
    strategies.append({
      'action': 'Replace taxable bonds with munis',
      'nii_reduction': bond_income,
      'niit_savings': bond_income * 0.038
    })
    
  # Strategy 5: Real estate professional status
  IF user.has_rental_income AND user.hours_in_real_estate > 500:
    strategies.append({
      'action': 'Evaluate real estate professional qualification',
      'potential_savings': user.rental_income * 0.038,
      'requirements': ['750+ hours', '50% of time test', 'material participation']
    })
    
  RETURN strategies.sort_by(savings, descending)
```

**Alert Thresholds:**
```
niit_alert_system(user):
  threshold = niit_threshold[user.filing_status]
  projected_magi = project_year_end_magi(user)
  
  # Yellow alert: Within $25K of threshold
  IF threshold - 25000 < projected_magi < threshold:
    ALERT "Approaching NIIT threshold - consider MAGI reduction strategies"
    
  # Red alert: Over threshold
  IF projected_magi > threshold:
    ALERT f"NIIT triggered: Projected liability ${calculate_niit(user)}"
    
  # Quarterly check-in
  quarterly_projection():
    q1_pace = user.ytd_income * 4
    IF q1_pace > threshold:
      ALERT "On pace to trigger NIIT - take action now"
```

### User Value: $ Savings Estimate

**Real Estate Professional Exception:**
- $200,000 rental income × 3.8% NIIT = **$7,600/year** (avoided if qualified)

**Asset Location for NIIT:**
- $500,000 REITs generating $25,000 income
- In taxable: $25,000 × 3.8% = $950 NIIT
- In 401(k): $0 NIIT
- **Annual savings: $950**

**Municipal Bond Substitution:**
- $300,000 taxable bonds → munis
- Eliminates ~$12,000 interest from NII
- **NIIT savings: $456/year** (plus income tax savings)

**Max 401(k) + HSA:**
- $23,500 + $8,550 = $32,050 MAGI reduction
- **NIIT savings: $1,218** (if in NIIT zone)

### Data Needed

**Required:**
- Projected annual income by type
- Filing status
- All investment income sources
- Rental property details (if applicable)

**For Advanced Strategies:**
- Hours spent in real estate activities
- Business ownership details (active vs passive)
- Material participation documentation

### Competitor Gap

| Feature | Wealthfront | Betterment | Maven |
|---------|-------------|------------|-------|
| NIIT awareness | ❌ | ❌ | ✅ |
| MAGI threshold monitoring | ❌ | ❌ | ✅ |
| Reduction strategy recommendations | ❌ | ❌ | ✅ |
| Real estate professional evaluation | ❌ | ❌ | ✅ |
| Asset location for NIIT | ❌ | ❌ | ✅ |
| Quarterly projections | ❌ | ❌ | ✅ |

---

## Module 6: HSA Optimization

### Logic/Algorithm

**Triple Tax Advantage Tracking:**
```
hsa_optimization(user):
  IF NOT user.hsa_eligible:
    IF user.can_switch_to_hdhp:
      show_hsa_benefits_comparison()
    RETURN
    
  # Maximize contributions
  limit = hsa_limit(user.coverage_type, user.age)
  contributed = user.hsa_contributions_ytd
  remaining = limit - contributed
  
  IF remaining > 0:
    RECOMMEND f"Contribute ${remaining} more to HSA"
    tax_benefit = remaining * (user.marginal_rate + user.fica_rate)
    SHOW f"Tax benefit: ${tax_benefit}"
    
  # Track "shoebox" - unreimbursed expenses
  shoebox_total = sum(user.documented_medical_expenses)
  SHOW f"Tax-free withdrawal potential: ${shoebox_total}"
```

**Receipt Vault Concept:**
```
receipt_vault_system():
  # Structure
  receipts = {
    'id': uuid,
    'date': expense_date,
    'provider': provider_name,
    'amount': expense_amount,
    'category': medical_category,
    'receipt_image': cloud_storage_url,
    'eob_document': eob_url (if applicable),
    'reimbursed': False,
    'reimbursement_date': None
  }
  
  # Tracking
  calculate_unreimbursed_total():
    RETURN sum(receipts.filter(reimbursed == False).amount)
    
  # Value projection
  future_value(years):
    current_total = calculate_unreimbursed_total()
    growth_rate = 0.07
    RETURN current_total * (1 + growth_rate) ^ years
```

**Medicare Transition Planning:**
```
medicare_transition_planning(user):
  IF user.age >= 64:
    medicare_date = calculate_medicare_enrollment(user)
    
    # 6-month lookback trap
    IF user.planning_social_security_at_65_plus:
      stop_contributions_date = medicare_date - 6_months
      
      ALERT f"Stop HSA contributions by {stop_contributions_date}"
      ALERT "Medicare coverage backdates up to 6 months"
      
      # Calculate prorated contribution
      months_eligible = calculate_eligible_months(user)
      max_contribution = (annual_limit / 12) * months_eligible
      
      SHOW f"Maximum {year} contribution: ${max_contribution}"
      
  # Post-65 usage optimization
  IF user.age >= 65:
    eligible_premiums = [
      'Medicare Part B',
      'Medicare Part D', 
      'Medicare Advantage',
      'Long-term care insurance (with limits)'
    ]
    
    NOT_eligible = ['Medigap/Supplement premiums']
    
    RECOMMEND "Use HSA for Medicare premiums (tax-free)"
    REMIND "HSA withdrawals don't affect IRMAA"
```

**Investment Optimization:**
```
hsa_investment_strategy(user):
  hsa_balance = user.hsa_balance
  
  # Keep emergency buffer in cash
  cash_buffer = min(2000, hsa_balance * 0.1)
  investable = hsa_balance - cash_buffer
  
  IF investable > 0 AND user.hsa_investments < investable:
    RECOMMEND f"Invest ${investable - user.hsa_investments} of HSA"
    
  # Provider quality check
  IF user.hsa_provider.expense_ratio > 0.15:
    RECOMMEND "Consider transferring HSA to lower-cost provider"
    SHOW "Fidelity: $0 fees, full brokerage access"
    SHOW "Lively + Schwab: Low fees, good options"
```

### User Value: $ Savings Estimate

**Annual Triple-Tax Benefit (Family Coverage, 35% bracket + NIIT):**
- Contribution: $8,550
- Tax deduction: $8,550 × 38.8% = **$3,317**
- FICA savings: $8,550 × 7.65% = **$654** (if through payroll)
- **Annual tax benefit: $3,971**

**Long-Term Shoebox Strategy:**
- $8,550/year × 30 years × 8% growth = **$1,050,000**
- With $200,000 documented receipts: **$200,000 tax-free withdrawals**
- Remaining $850,000: Tax-free for medical OR taxable like IRA (still no RMDs)

**Medicare Premium Payment:**
- Part B premium: $2,435/year (2026 projected)
- Paid from HSA: Tax-free
- Paid from taxable income: Costs $3,380 (at 38.8% rate)
- **Annual savings: $945**

### Data Needed

**Required:**
- HSA eligibility status
- Current HSA balance and contributions
- Age
- Coverage type (self-only vs family)

**For Full Optimization:**
- Documented medical expenses (receipt vault)
- HSA provider and fee structure
- Medicare enrollment plans
- Projected medical expenses in retirement

### Competitor Gap

| Feature | Wealthfront | Betterment | Maven |
|---------|-------------|------------|-------|
| HSA integration | ❌ | ❌ | ✅ |
| Shoebox tracking | ❌ | ❌ | ✅ |
| Receipt vault | ❌ | ❌ | ✅ |
| Medicare transition planning | ❌ | ❌ | ✅ |
| 6-month lookback warnings | ❌ | ❌ | ✅ |
| HSA investment optimization | ❌ | ❌ | ✅ |
| Provider comparison | ❌ | ❌ | ✅ |

---

## Implementation Priority Matrix

| Module | Implementation Effort | User Value | Priority |
|--------|----------------------|------------|----------|
| Tax-Loss Harvesting Engine | Medium | High | P0 - Launch |
| Asset Location Optimizer | Medium | High | P0 - Launch |
| Roth Conversion Calculator | High | Very High | P1 - Fast Follow |
| Capital Gains Harvester | Low | Medium | P1 - Fast Follow |
| NIIT Avoidance Module | Medium | High (affluent) | P2 |
| HSA Optimization | Medium | Medium | P2 |

---

## Data Integration Requirements

### Critical Data Sources
1. **Brokerage connections** (Plaid/Yodlee) - Holdings, cost basis, lots
2. **User-provided** - Tax bracket, filing status, 401k details
3. **IRS/tax prep** - Prior year carryforwards, Form 8606 history
4. **Real-time pricing** - For daily TLH monitoring

### Privacy/Security Considerations
- Tax data is highly sensitive
- Lot-level data may require manual upload (brokers vary)
- Cross-account aggregation requires clear user consent

---

## The Maven Difference: Summary

**Wealthfront/Betterment:** "We do tax-loss harvesting on our managed accounts"

**Maven:** "We optimize your entire tax picture — across all accounts, account types, and family members — with proactive alerts, multi-year modeling, and strategies the robo-advisors can't touch because they only see one account."

This is **tax alpha** — the measurable, quantifiable edge that justifies Maven's existence. Every module delivers value that compounds over decades.

---

*Version: 1.0 | Created: 2026-02-06 | Status: Product Development Ready*
