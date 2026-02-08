#!/usr/bin/env node
/**
 * Combo Strategy Analysis
 * Shows net realized gains and optimal combination approach
 */

import { calculateCapitalGainsTax, calculateAfterTaxProceeds } from '../lib/tax-engine.js';
import { compareStrategies } from '../lib/strategy-models.js';
import { modelComboStrategy, suggestAllocation } from '../lib/combo-strategy.js';

// Example client scenario
const params = {
  currentValue: 2000000,
  costBasis: 400000,
  expectedReturn: 0.08,
  years: 20,
  ordinaryIncome: 500000,
  filingStatus: 'married',
  state: 'CA',
  newCapitalAvailable: 1000000,
  charitableIntent: true
};

const gain = params.currentValue - params.costBasis;

console.log('═══════════════════════════════════════════════════════════════');
console.log('     COMBO STRATEGY ANALYSIS - Net Realized Gains');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('📊 POSITION');
console.log('─'.repeat(60));
console.log(`Current Value:    $${params.currentValue.toLocaleString()}`);
console.log(`Cost Basis:       $${params.costBasis.toLocaleString()}`);
console.log(`Unrealized Gain:  $${gain.toLocaleString()}`);
console.log(`Embedded Gain:    ${((gain / params.currentValue) * 100).toFixed(0)}%`);

// Tax if sold today
const taxIfSold = calculateAfterTaxProceeds({
  currentValue: params.currentValue,
  costBasis: params.costBasis,
  ordinaryIncome: params.ordinaryIncome,
  filingStatus: params.filingStatus,
  state: params.state,
  isLongTerm: true
});

console.log(`\nIf Sold Today:`);
console.log(`  Total Tax:      $${taxIfSold.tax.toLocaleString()} (${taxIfSold.taxDrag.toFixed(1)}%)`);
console.log(`  After-Tax:      $${taxIfSold.afterTaxProceeds.toLocaleString()}`);

// Run all individual strategies
console.log('\n\n📈 NET REALIZED GAINS BY STRATEGY');
console.log('═'.repeat(60));

const results = compareStrategies(params);

// For each strategy, calculate net realized gains
console.log('\n20-Year Analysis:\n');
console.log('Strategy'.padEnd(35) + 'Final Value'.padStart(14) + 'Tax Paid'.padStart(12) + 'Net Gain'.padStart(14));
console.log('─'.repeat(75));

const strategyMetrics = [];

for (const [key, strategy] of Object.entries(results.strategies)) {
  if (strategy.error || !strategy.projections || strategy.projections.length === 0) continue;
  
  const finalProj = strategy.projections[strategy.projections.length - 1];
  const year20 = strategy.projections.find(p => p.year === 20) || finalProj;
  if (!year20 || year20.afterTaxValue === undefined) continue;
  
  // Calculate net realized gain (after-tax value minus original investment)
  const afterTaxValue = year20.afterTaxValue || 0;
  const netGain = afterTaxValue - params.costBasis;
  
  // Estimate total tax paid
  let totalTaxPaid = 0;
  if (strategy.immediateImpact) {
    totalTaxPaid = strategy.immediateImpact.taxPaid;
  }
  // Add deferred tax (will be paid eventually)
  if (year20.deferredTaxLiability) {
    totalTaxPaid += year20.deferredTaxLiability;
  } else if (year20.taxLiability) {
    totalTaxPaid += year20.taxLiability;
  }
  
  strategyMetrics.push({
    name: strategy.name,
    afterTaxValue,
    totalTaxPaid,
    netGain
  });
  
  console.log(
    strategy.name.padEnd(35) +
    ('$' + afterTaxValue.toLocaleString()).padStart(14) +
    ('$' + Math.round(totalTaxPaid).toLocaleString()).padStart(12) +
    ('$' + Math.round(netGain).toLocaleString()).padStart(14)
  );
}

// Sort by net gain
strategyMetrics.sort((a, b) => b.netGain - a.netGain);

console.log('─'.repeat(75));
console.log(`\n👑 Best Net Gain: ${strategyMetrics[0].name} ($${strategyMetrics[0].netGain.toLocaleString()})`);

// === COMBO STRATEGY ===
console.log('\n\n🎯 COMBINATION STRATEGY');
console.log('═'.repeat(60));

// Get suggested allocation
const suggested = suggestAllocation({
  ...params,
  hasNewCapital: params.newCapitalAvailable > 0,
  estateIntent: true
});

console.log('\nSuggested Allocation:');
console.log('─'.repeat(40));
for (const [bucket, pct] of Object.entries(suggested.allocation)) {
  if (pct > 0) {
    const amount = params.currentValue * (pct / 100);
    console.log(`  ${bucket.padEnd(20)} ${pct}%  ($${amount.toLocaleString()})`);
  }
}

console.log('\nReasoning:');
suggested.reasoning.forEach(r => console.log(`  • ${r}`));

// Run combo strategy
const combo = modelComboStrategy({
  ...params,
  allocation: suggested.allocation
});

console.log('\n\n📊 COMBO STRATEGY BREAKDOWN');
console.log('─'.repeat(60));

console.log('\n1️⃣  SELL NOW BUCKET');
if (combo.allocation.sellNow.percent > 0) {
  console.log(`   Amount:     $${combo.allocation.sellNow.amount.toLocaleString()}`);
  console.log(`   Tax Paid:   $${combo.allocation.sellNow.taxPaid.toLocaleString()} (immediate)`);
  console.log(`   Result:     Diversified, tax paid, done`);
}

console.log('\n2️⃣  EXCHANGE FUND BUCKET');
if (combo.allocation.exchangeFund.percent > 0) {
  console.log(`   Amount:     $${combo.allocation.exchangeFund.amount.toLocaleString()}`);
  console.log(`   Tax:        $${combo.allocation.exchangeFund.deferredTax.toLocaleString()} (DEFERRED)`);
  console.log(`   Result:     Diversified day 1, 7yr lockup, basis carries over`);
}

console.log('\n3️⃣  DIRECT INDEXING BUCKET');
if (combo.allocation.directIndexing.percent > 0) {
  console.log(`   Concentrated: $${combo.allocation.directIndexing.amount.toLocaleString()}`);
  console.log(`   New Capital:  $${combo.allocation.directIndexing.newCapital.toLocaleString()}`);
  console.log(`   Result:       Gradual tax-efficient diversification via loss harvesting`);
}

if (combo.allocation.charitable) {
  console.log('\n4️⃣  CHARITABLE BUCKET (DAF)');
  console.log(`   Donated:      $${combo.allocation.charitable.amount.toLocaleString()}`);
  console.log(`   Deduction:    $${combo.allocation.charitable.deduction.toLocaleString()}`);
  console.log(`   Tax Savings:  $${combo.allocation.charitable.taxSavings.toLocaleString()} (from deduction)`);
  console.log(`   Cap Gains:    $0 (AVOIDED)`);
}

console.log('\n5️⃣  HOLD FOR STEP-UP BUCKET');
if (combo.allocation.holdForStepUp.percent > 0) {
  console.log(`   Amount:       $${combo.allocation.holdForStepUp.amount.toLocaleString()}`);
  console.log(`   Potential:    $${combo.allocation.holdForStepUp.potentialStepUpSavings.toLocaleString()} in taxes avoided if held until death`);
}

console.log('\n\n💰 TAX SUMMARY');
console.log('─'.repeat(60));
console.log(`Tax Paid Now:      $${combo.taxSummary.immediatelyPaid.toLocaleString()}`);
console.log(`Tax Deferred:      $${combo.taxSummary.deferred.toLocaleString()}`);
console.log(`Tax Avoided:       $${combo.taxSummary.avoided.toLocaleString()} (charitable)`);
console.log(`Step-Up Potential: $${combo.taxSummary.potentialStepUpSavings.toLocaleString()}`);
console.log(`Charitable Deduct: $${combo.taxSummary.charitableDeduction.toLocaleString()}`);

// Projections
console.log('\n\n📈 COMBO STRATEGY PROJECTIONS');
console.log('─'.repeat(80));
console.log('Year   Sell Now   Exch Fund   DI Conc   DI Index   Hold     Total      After-Tax');
console.log('─'.repeat(80));

[0, 5, 10, 15, 20].forEach(year => {
  const p = combo.projections.find(proj => proj.year === year);
  if (p) {
    console.log(
      year.toString().padEnd(6) +
      ('$' + (p.buckets.sellNow / 1000).toFixed(0) + 'k').padStart(10) +
      ('$' + (p.buckets.exchangeFund / 1000).toFixed(0) + 'k').padStart(12) +
      ('$' + (p.buckets.directIndexConcentrated / 1000).toFixed(0) + 'k').padStart(10) +
      ('$' + (p.buckets.directIndexDiversified / 1000).toFixed(0) + 'k').padStart(10) +
      ('$' + (p.buckets.holdForStepUp / 1000).toFixed(0) + 'k').padStart(9) +
      ('$' + (p.nominalValue / 1000).toFixed(0) + 'k').padStart(10) +
      ('$' + (p.afterTaxValue / 1000).toFixed(0) + 'k').padStart(12)
    );
  }
});

const finalCombo = combo.projections[combo.projections.length - 1];
const comboNetGain = finalCombo.afterTaxValue - params.costBasis;

console.log('\n\n🏆 COMPARISON: SINGLE vs COMBO');
console.log('═'.repeat(60));
console.log(`Best Single Strategy: ${strategyMetrics[0].name}`);
console.log(`  After-Tax Value:    $${strategyMetrics[0].afterTaxValue.toLocaleString()}`);
console.log(`  Net Gain:           $${strategyMetrics[0].netGain.toLocaleString()}`);
console.log(`\nCombo Strategy:`);
console.log(`  After-Tax Value:    $${finalCombo.afterTaxValue.toLocaleString()}`);
console.log(`  Net Gain:           $${comboNetGain.toLocaleString()}`);
console.log(`  Concentration:      ${combo.concentrationPath.initial}% → ${combo.concentrationPath.final}%`);

const delta = finalCombo.afterTaxValue - strategyMetrics[0].afterTaxValue;
console.log(`\nDifference: ${delta >= 0 ? '+' : ''}$${delta.toLocaleString()}`);

console.log('\n\n✅ COMBO ADVANTAGES');
console.log('─'.repeat(60));
combo.pros.forEach(p => console.log(`• ${p}`));

console.log('\n❌ COMBO DISADVANTAGES');
console.log('─'.repeat(60));
combo.cons.forEach(c => console.log(`• ${c}`));

console.log('\n═══════════════════════════════════════════════════════════════\n');
