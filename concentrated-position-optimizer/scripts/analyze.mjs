#!/usr/bin/env node
/**
 * Concentrated Position Analyzer CLI v2
 * Using corrected strategy models
 */

import { calculateCapitalGainsTax, calculateAfterTaxProceeds } from '../lib/tax-engine.js';
import { compareStrategies } from '../lib/strategy-models.js';

// Example: Tech executive with concentrated AAPL position
const params = {
  // Position details
  currentValue: 2000000,    // $2M current value
  costBasis: 400000,        // $400k cost basis (5x gain)
  
  // Market assumptions
  expectedReturn: 0.08,     // 8% expected return
  diversifiedReturn: 0.07,  // 7% diversified return
  volatility: 0.25,
  
  // Client profile
  ordinaryIncome: 500000,   // $500k ordinary income
  filingStatus: 'married',
  state: 'CA',
  
  // Time horizon
  years: 20,
  
  // NEW: Strategy-specific inputs
  newCapitalAvailable: 2000000, // For direct indexing
  charitableIntent: false       // Set to true to include CRT
};

console.log('═══════════════════════════════════════════════════════════════');
console.log('     CONCENTRATED POSITION OPTIMIZER v2 - Analysis Report');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`\nGenerated: ${new Date().toISOString()}\n`);

// Position Summary
const gain = params.currentValue - params.costBasis;
const embeddedGainRatio = ((gain / params.currentValue) * 100).toFixed(0);

console.log('📊 POSITION SUMMARY');
console.log('─'.repeat(60));
console.log(`Current Value:     $${params.currentValue.toLocaleString()}`);
console.log(`Cost Basis:        $${params.costBasis.toLocaleString()}`);
console.log(`Unrealized Gain:   $${gain.toLocaleString()}`);
console.log(`Gain Percentage:   ${(((gain) / params.costBasis) * 100).toFixed(0)}%`);
console.log(`Embedded Gain:     ${embeddedGainRatio}% of position value`);

// Tax Analysis
console.log('\n💰 TAX ANALYSIS (If Sold Today)');
console.log('─'.repeat(60));
const taxResult = calculateAfterTaxProceeds({
  currentValue: params.currentValue,
  costBasis: params.costBasis,
  ordinaryIncome: params.ordinaryIncome,
  filingStatus: params.filingStatus,
  state: params.state,
  isLongTerm: true
});
console.log(`Gain to be taxed:  $${taxResult.gain.toLocaleString()}`);
console.log(`Total Tax:         $${taxResult.tax.toLocaleString()}`);
console.log(`Effective Rate:    ${taxResult.taxDrag.toFixed(1)}%`);
console.log(`After-Tax Value:   $${taxResult.afterTaxProceeds.toLocaleString()}`);

// Run all strategies
console.log('\n📈 STRATEGY COMPARISON');
console.log('─'.repeat(60));
const results = compareStrategies(params);

// 10-Year Comparison
console.log('\n10-Year Projected After-Tax Value:');
const sorted10 = Object.entries(results.comparison.year10)
  .filter(([key]) => results.strategies[key] && !results.strategies[key].error)
  .sort((a, b) => b[1].afterTaxValue - a[1].afterTaxValue);
sorted10.forEach(([key, data], i) => {
  const bar = '█'.repeat(Math.round(data.afterTaxValue / 100000));
  const marker = i === 0 ? '👑' : '  ';
  console.log(`${marker} ${data.name.padEnd(40)} $${data.afterTaxValue.toLocaleString().padStart(12)} ${bar}`);
});

// 20-Year Comparison
console.log('\n20-Year Projected After-Tax Value:');
const sorted20 = Object.entries(results.comparison.year20)
  .filter(([key]) => results.strategies[key] && !results.strategies[key].error)
  .sort((a, b) => b[1].afterTaxValue - a[1].afterTaxValue);
sorted20.forEach(([key, data], i) => {
  const bar = '█'.repeat(Math.round(data.afterTaxValue / 200000));
  const marker = i === 0 ? '👑' : '  ';
  console.log(`${marker} ${data.name.padEnd(40)} $${data.afterTaxValue.toLocaleString().padStart(12)} ${bar}`);
});

// Recommendation
console.log('\n\n🎯 ANALYSIS');
console.log('═'.repeat(60));
const rec = results.recommendation;
console.log('\nKey Points:');
rec.analysis.forEach(a => console.log(`• ${a}`));

if (rec.situationalFactors?.length > 0) {
  console.log('\n✓ Situational Factors:');
  rec.situationalFactors.forEach(f => console.log(`  • ${f}`));
}

if (rec.cautions?.length > 0) {
  console.log('\n⚠ Cautions:');
  rec.cautions.forEach(c => console.log(`  • ${c}`));
}

// Strategy Details
console.log('\n\n📋 STRATEGY DETAILS');
console.log('═'.repeat(60));

for (const [key, strategy] of Object.entries(results.strategies)) {
  if (strategy.error) continue;
  
  console.log(`\n### ${strategy.name.toUpperCase()}`);
  console.log(strategy.description);
  
  console.log('\n✅ Pros:');
  strategy.pros?.forEach(p => console.log(`   • ${p}`));
  
  console.log('\n❌ Cons:');
  strategy.cons?.forEach(c => console.log(`   • ${c}`));
  
  if (strategy.immediateImpact) {
    console.log('\n📉 Immediate Impact:');
    console.log(`   Tax Paid: $${strategy.immediateImpact.taxPaid.toLocaleString()}`);
    console.log(`   After-Tax Proceeds: $${strategy.immediateImpact.afterTaxProceeds.toLocaleString()}`);
  }
  
  if (strategy.capitalRequired) {
    console.log('\n⚠️  Capital Required:');
    console.log(`   New Capital: $${strategy.capitalRequired.newCapital.toLocaleString()}`);
    console.log(`   Note: ${strategy.capitalRequired.note}`);
  }
  
  if (strategy.taxTreatment?.basisCarryover) {
    console.log('\n📋 Tax Note:');
    console.log(`   Basis Carryover: ${strategy.taxTreatment.basisCarryover}`);
    console.log(`   At Exit: ${strategy.taxTreatment.atExit}`);
  }
  
  if (strategy.contractTerms) {
    console.log('\n⚙️  Contract Terms:');
    console.log(`   Prepayment: ${strategy.contractTerms.prepaymentPercent} ($${strategy.contractTerms.prepaymentAmount.toLocaleString()})`);
    console.log(`   Floor: ${strategy.contractTerms.floor}`);
    console.log(`   Cap: ${strategy.contractTerms.cap}`);
    console.log(`   Term: ${strategy.contractTerms.term}`);
  }
  
  if (strategy.keyMetrics) {
    console.log('\n📊 Key Metrics:');
    console.log(`   Concentration: ${strategy.keyMetrics.concentrationRisk}`);
    console.log(`   Liquidity: ${strategy.keyMetrics.liquidityRisk}`);
    console.log(`   Tax Efficiency: ${strategy.keyMetrics.taxEfficiency}`);
  }
}

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('\n⚠️  DISCLAIMER: This analysis is for educational purposes only.');
console.log('    Consult qualified tax, legal, and financial professionals.');
console.log('\n═══════════════════════════════════════════════════════════════\n');
