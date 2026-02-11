/**
 * Athena Test Harness
 * 
 * Run tests against the intent router and report accuracy.
 * Target: >90% accuracy before shipping.
 */

import { TEST_QUERIES, QUERY_COUNTS, type TestQuery } from './test-queries';

// Types for router integration
export interface RouterResult {
  type: 'chat' | 'trading_decision' | 'portfolio_analysis' | 'research' | 'simple_lookup';
  urgency: 'realtime' | 'normal' | 'background';
  complexity: 'low' | 'medium' | 'high';
  sources: string[];
  confidence?: number;
}

export interface TestFailure {
  id: string;
  query: string;
  field: 'type' | 'urgency' | 'complexity' | 'sources';
  expected: string;
  got: string;
}

export interface HarnessResult {
  total: number;
  passed: number;
  failed: number;
  accuracy: number;
  passesThreshold: boolean; // >90%
  failures: TestFailure[];
  byType: {
    [key in TestQuery['expectedType']]: {
      total: number;
      passed: number;
      accuracy: number;
    };
  };
  byField: {
    type: { passed: number; total: number; accuracy: number };
    urgency: { passed: number; total: number; accuracy: number };
    complexity: { passed: number; total: number; accuracy: number };
    sources: { passed: number; total: number; accuracy: number };
  };
  durationMs: number;
}

// Router function type - to be injected
export type RouterFunction = (
  query: string, 
  context?: TestQuery['context']
) => Promise<RouterResult> | RouterResult;

/**
 * Compare sources arrays (order-independent)
 */
function sourcesMatch(expected: string[], got: string[]): boolean {
  if (expected.length !== got.length) return false;
  const expectedSet = new Set(expected);
  return got.every(s => expectedSet.has(s));
}

/**
 * Run a single test query
 */
async function runSingleTest(
  testQuery: TestQuery,
  router: RouterFunction,
): Promise<{ passed: boolean; failures: TestFailure[] }> {
  const result = await router(testQuery.query, testQuery.context);
  const failures: TestFailure[] = [];

  // Check type (primary classification)
  if (result.type !== testQuery.expectedType) {
    failures.push({
      id: testQuery.id,
      query: testQuery.query,
      field: 'type',
      expected: testQuery.expectedType,
      got: result.type,
    });
  }

  // Check urgency
  if (result.urgency !== testQuery.expectedUrgency) {
    failures.push({
      id: testQuery.id,
      query: testQuery.query,
      field: 'urgency',
      expected: testQuery.expectedUrgency,
      got: result.urgency,
    });
  }

  // Check complexity
  if (result.complexity !== testQuery.expectedComplexity) {
    failures.push({
      id: testQuery.id,
      query: testQuery.query,
      field: 'complexity',
      expected: testQuery.expectedComplexity,
      got: result.complexity,
    });
  }

  // Check sources
  if (!sourcesMatch(testQuery.expectedSources, result.sources)) {
    failures.push({
      id: testQuery.id,
      query: testQuery.query,
      field: 'sources',
      expected: testQuery.expectedSources.join(', '),
      got: result.sources.join(', '),
    });
  }

  return {
    passed: failures.length === 0,
    failures,
  };
}

/**
 * Run the full test harness
 */
export async function runTestHarness(
  router: RouterFunction,
  options: {
    verbose?: boolean;
    filterType?: TestQuery['expectedType'];
    filterTags?: string[];
    stopOnFail?: boolean;
  } = {}
): Promise<HarnessResult> {
  const startTime = Date.now();
  const { verbose = false, filterType, filterTags, stopOnFail = false } = options;

  // Filter queries if needed
  let queries = TEST_QUERIES;
  if (filterType) {
    queries = queries.filter(q => q.expectedType === filterType);
  }
  if (filterTags && filterTags.length > 0) {
    queries = queries.filter(q => 
      filterTags.some(tag => q.tags?.includes(tag))
    );
  }

  const allFailures: TestFailure[] = [];
  let passedCount = 0;

  // Track by type
  const byType: HarnessResult['byType'] = {
    trading_decision: { total: 0, passed: 0, accuracy: 0 },
    portfolio_analysis: { total: 0, passed: 0, accuracy: 0 },
    simple_lookup: { total: 0, passed: 0, accuracy: 0 },
    research: { total: 0, passed: 0, accuracy: 0 },
    chat: { total: 0, passed: 0, accuracy: 0 },
  };

  // Track by field
  const byField = {
    type: { passed: 0, total: queries.length, accuracy: 0 },
    urgency: { passed: 0, total: queries.length, accuracy: 0 },
    complexity: { passed: 0, total: queries.length, accuracy: 0 },
    sources: { passed: 0, total: queries.length, accuracy: 0 },
  };

  // Run tests
  for (const testQuery of queries) {
    byType[testQuery.expectedType].total++;

    try {
      const { passed, failures } = await runSingleTest(testQuery, router);

      if (passed) {
        passedCount++;
        byType[testQuery.expectedType].passed++;
        byField.type.passed++;
        byField.urgency.passed++;
        byField.complexity.passed++;
        byField.sources.passed++;
      } else {
        allFailures.push(...failures);
        
        // Track field-level passes
        const failedFields = new Set(failures.map(f => f.field));
        if (!failedFields.has('type')) byField.type.passed++;
        if (!failedFields.has('urgency')) byField.urgency.passed++;
        if (!failedFields.has('complexity')) byField.complexity.passed++;
        if (!failedFields.has('sources')) byField.sources.passed++;

        if (verbose) {
          console.log(`❌ ${testQuery.id}: ${testQuery.query.slice(0, 50)}...`);
          failures.forEach(f => {
            console.log(`   ${f.field}: expected "${f.expected}", got "${f.got}"`);
          });
        }

        if (stopOnFail) break;
      } else if (verbose) {
        console.log(`✅ ${testQuery.id}: ${testQuery.query.slice(0, 50)}...`);
      }
    } catch (error) {
      // Router threw an error - count as failure
      allFailures.push({
        id: testQuery.id,
        query: testQuery.query,
        field: 'type',
        expected: testQuery.expectedType,
        got: `ERROR: ${error instanceof Error ? error.message : String(error)}`,
      });

      if (verbose) {
        console.log(`💥 ${testQuery.id}: Router error - ${error}`);
      }

      if (stopOnFail) break;
    }
  }

  // Calculate accuracies
  const accuracy = queries.length > 0 ? (passedCount / queries.length) * 100 : 0;

  for (const type of Object.keys(byType) as TestQuery['expectedType'][]) {
    byType[type].accuracy = byType[type].total > 0 
      ? (byType[type].passed / byType[type].total) * 100 
      : 0;
  }

  for (const field of Object.keys(byField) as (keyof typeof byField)[]) {
    byField[field].accuracy = (byField[field].passed / byField[field].total) * 100;
  }

  const durationMs = Date.now() - startTime;

  return {
    total: queries.length,
    passed: passedCount,
    failed: queries.length - passedCount,
    accuracy,
    passesThreshold: accuracy >= 90,
    failures: allFailures,
    byType,
    byField,
    durationMs,
  };
}

/**
 * Format results for console output
 */
export function formatResults(result: HarnessResult): string {
  const lines: string[] = [];
  
  lines.push('');
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('              ATHENA ROUTER TEST RESULTS                ');
  lines.push('═══════════════════════════════════════════════════════');
  lines.push('');
  
  // Overall stats
  const statusEmoji = result.passesThreshold ? '✅' : '❌';
  lines.push(`${statusEmoji} Overall Accuracy: ${result.accuracy.toFixed(1)}% (threshold: 90%)`);
  lines.push(`   Passed: ${result.passed}/${result.total} | Failed: ${result.failed}`);
  lines.push(`   Duration: ${result.durationMs}ms`);
  lines.push('');

  // By type breakdown
  lines.push('By Query Type:');
  lines.push('─────────────────────────────────────────────────────');
  for (const [type, stats] of Object.entries(result.byType)) {
    const emoji = stats.accuracy >= 90 ? '✅' : stats.accuracy >= 70 ? '⚠️' : '❌';
    lines.push(`  ${emoji} ${type.padEnd(20)} ${stats.passed}/${stats.total} (${stats.accuracy.toFixed(1)}%)`);
  }
  lines.push('');

  // By field breakdown
  lines.push('By Field:');
  lines.push('─────────────────────────────────────────────────────');
  for (const [field, stats] of Object.entries(result.byField)) {
    const emoji = stats.accuracy >= 90 ? '✅' : stats.accuracy >= 70 ? '⚠️' : '❌';
    lines.push(`  ${emoji} ${field.padEnd(12)} ${stats.passed}/${stats.total} (${stats.accuracy.toFixed(1)}%)`);
  }
  lines.push('');

  // Failures (if any)
  if (result.failures.length > 0) {
    lines.push('Failures:');
    lines.push('─────────────────────────────────────────────────────');
    
    // Group by query ID
    const failuresByQuery = new Map<string, TestFailure[]>();
    for (const f of result.failures) {
      if (!failuresByQuery.has(f.id)) {
        failuresByQuery.set(f.id, []);
      }
      failuresByQuery.get(f.id)!.push(f);
    }

    for (const [id, failures] of failuresByQuery) {
      lines.push(`  ${id}: "${failures[0].query.slice(0, 60)}${failures[0].query.length > 60 ? '...' : ''}"`);
      for (const f of failures) {
        lines.push(`    └─ ${f.field}: expected "${f.expected}", got "${f.got}"`);
      }
    }
    lines.push('');
  }

  lines.push('═══════════════════════════════════════════════════════');
  
  return lines.join('\n');
}

/**
 * Quick test runner - call from scripts or tests
 */
export async function quickTest(router: RouterFunction): Promise<boolean> {
  const result = await runTestHarness(router);
  console.log(formatResults(result));
  return result.passesThreshold;
}

/**
 * Mock router for testing the harness itself
 * Returns random results - should NOT pass the threshold
 */
export function createMockRouter(accuracy: number = 0.5): RouterFunction {
  const types: RouterResult['type'][] = ['chat', 'trading_decision', 'portfolio_analysis', 'research', 'simple_lookup'];
  const urgencies: RouterResult['urgency'][] = ['realtime', 'normal', 'background'];
  const complexities: RouterResult['complexity'][] = ['low', 'medium', 'high'];
  const allSources = ['market_data', 'portfolio', 'news', 'analysis', 'knowledge_base'];

  return (query: string, context?: TestQuery['context']): RouterResult => {
    // Find the expected result
    const expected = TEST_QUERIES.find(q => q.query === query);
    
    if (expected && Math.random() < accuracy) {
      // Return correct result based on accuracy
      return {
        type: expected.expectedType,
        urgency: expected.expectedUrgency,
        complexity: expected.expectedComplexity,
        sources: [...expected.expectedSources],
        confidence: 0.9,
      };
    }

    // Return random result
    return {
      type: types[Math.floor(Math.random() * types.length)],
      urgency: urgencies[Math.floor(Math.random() * urgencies.length)],
      complexity: complexities[Math.floor(Math.random() * complexities.length)],
      sources: allSources.slice(0, Math.floor(Math.random() * 3) + 1),
      confidence: Math.random(),
    };
  };
}

// Export query stats for validation
export { QUERY_COUNTS };
