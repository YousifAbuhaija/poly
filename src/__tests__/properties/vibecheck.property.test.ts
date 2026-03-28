import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { recordResponse, getProfile, reset } from '../../engines/VibeCheckEngine';
import type { IssueScore } from '../../types';

// Feature: poly-mvp, Property 3: Issue Response Scoring
describe('Property 3: Issue Response Scoring', () => {
  beforeEach(() => {
    reset();
  });

  /**
   * Validates: Requirements 2.3, 2.4
   *
   * For any issue ID and any user response (1, -1, or 0),
   * recording the response should store exactly that value
   * in the Issue Profile under that issue's ID.
   */
  it('recording a response stores the exact score in the profile', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.constantFrom(1 as const, -1 as const, 0 as const),
        (issueId: string, score: IssueScore) => {
          reset();
          recordResponse(issueId, score);
          const profile = getProfile();
          expect(profile[issueId]).toBe(score);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('recording multiple responses preserves all stored values', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.tuple(
            fc.string({ minLength: 1 }),
            fc.constantFrom(1 as const, -1 as const, 0 as const)
          ),
          { minLength: 1, maxLength: 20 }
        ),
        (entries: [string, IssueScore][]) => {
          reset();
          // Build expected map — last write wins for duplicate IDs
          const expected: Record<string, IssueScore> = {};
          for (const [id, score] of entries) {
            recordResponse(id, score);
            expected[id] = score;
          }
          const profile = getProfile();
          for (const [id, score] of Object.entries(expected)) {
            expect(profile[id]).toBe(score);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
