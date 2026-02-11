/**
 * Athena Test Harness
 * 
 * Usage:
 * ```typescript
 * import { runTestHarness, formatResults, TEST_QUERIES } from '@/lib/athena/tests';
 * 
 * const result = await runTestHarness(yourRouter);
 * console.log(formatResults(result));
 * 
 * if (!result.passesThreshold) {
 *   throw new Error(`Router accuracy ${result.accuracy}% below 90% threshold`);
 * }
 * ```
 */

export { 
  TEST_QUERIES, 
  QUERY_COUNTS,
  getQueriesByType,
  getQueriesByTag,
  getEdgeCases,
  type TestQuery,
} from './test-queries';

export { 
  runTestHarness,
  formatResults,
  quickTest,
  createMockRouter,
  type RouterFunction,
  type RouterResult,
  type TestFailure,
  type HarnessResult,
} from './harness';
