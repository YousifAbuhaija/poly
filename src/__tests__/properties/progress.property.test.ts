import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { getIssues, recordResponse, getRemainingCount, reset } from '../../engines/VibeCheckEngine';
import type { IssueScore } from '../../types';

// Feature: poly-mvp, Property 4: Progress Indicator Accuracy
describe('Property 4: Progress Indicator Accuracy', () => {
  beforeEach(() => {
    reset();
  });

  /**
   * Validates: Requirements 2.7
   *
   * For any set of N total issue statements and any number K
   * of answered statements (0 ≤ K ≤ N), the remaining count
   * should equal N − K.
   */
  it('remaining count equals total issues minus answered count', () => {
    const issues = getIssues();
    const N = issues.length;

    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: N }),
        fc.constantFrom(1 as const, -1 as const, 0 as const),
        (K: number, score: IssueScore) => {
          reset();
          // Answer the first K issues
          for (let i = 0; i < K; i++) {
            recordResponse(issues[i].id, score);
          }
          expect(getRemainingCount()).toBe(N - K);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('answering all issues leaves remaining count at zero', () => {
    const issues = getIssues();

    fc.assert(
      fc.property(
        fc.constantFrom(1 as const, -1 as const, 0 as const),
        (score: IssueScore) => {
          reset();
          for (const issue of issues) {
            recordResponse(issue.id, score);
          }
          expect(getRemainingCount()).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
