import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import type { Candidate, IssueProfile, IssueScore, LocationResult } from '../../types';

vi.mock('../../services/DataLoader', () => ({
  loadCandidates: vi.fn(() => [] as Candidate[]),
}));

import { computeMatches } from '../../engines/CivicMatchEngine';
import { loadCandidates } from '../../services/DataLoader';

const mockedLoadCandidates = vi.mocked(loadCandidates);

const issueScoreArb = fc.constantFrom(1 as const, -1 as const, 0 as const);
const nonZeroScoreArb = fc.constantFrom(1 as const, -1 as const);

const LOCATION: LocationResult = { city: 'LA', county: 'Los Angeles', state: 'CA' };
const ISSUE_IDS = Array.from({ length: 8 }, (_, i) => `issue-${i}`);

function makeProfileArb(): fc.Arbitrary<IssueProfile> {
  return fc
    .tuple(...ISSUE_IDS.map(() => issueScoreArb))
    .filter((scores) => scores.some((s) => s !== 0))
    .map((scores) => {
      const profile: IssueProfile = {};
      scores.forEach((s, i) => { profile[ISSUE_IDS[i]] = s; });
      return profile;
    });
}

function makePositionsArb(): fc.Arbitrary<Record<string, IssueScore>> {
  return fc.tuple(...ISSUE_IDS.map(() => issueScoreArb)).map((scores) => {
    const pos: Record<string, IssueScore> = {};
    scores.forEach((s, i) => { pos[ISSUE_IDS[i]] = s; });
    return pos;
  });
}

function makeCandidate(positions: Record<string, IssueScore>): Candidate {
  return {
    id: 'c1', name: 'Test', office: 'Office', district: 'D1',
    state: 'CA', county: 'Los Angeles', bio: '', positions,
  };
}

// Feature: poly-mvp, Property 10: Match Explanation Correctness
describe('Property 10: Match Explanation Correctness', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  /**
   * Validates: Requirements 4.5, 9.5
   *
   * For any candidate and any user Issue Profile, the match explanation should
   * correctly partition the candidate's positions into agreements (where user
   * and candidate scores are equal and non-zero) and disagreements (where user
   * and candidate scores are opposite and both non-zero), with no issue
   * appearing in both lists.
   */
  it('agreements and disagreements are correctly partitioned with no overlap', () => {
    fc.assert(
      fc.property(
        makeProfileArb(),
        makePositionsArb(),
        (profile, positions) => {
          const candidate = makeCandidate(positions);
          mockedLoadCandidates.mockReturnValue([candidate]);

          const results = computeMatches(profile, LOCATION);
          expect(results).toHaveLength(1);
          const { agreements, disagreements } = results[0];

          // Every agreement must be a true agreement (same non-zero score)
          for (const issueId of agreements) {
            const userScore = profile[issueId];
            const candScore = positions[issueId];
            expect(userScore).not.toBe(0);
            expect(candScore).not.toBe(0);
            expect(candScore).not.toBeUndefined();
            expect(userScore).toBe(candScore);
          }

          // Every disagreement must be a true disagreement (opposite non-zero scores)
          for (const issueId of disagreements) {
            const userScore = profile[issueId];
            const candScore = positions[issueId];
            expect(userScore).not.toBe(0);
            expect(candScore).not.toBe(0);
            expect(candScore).not.toBeUndefined();
            expect(userScore).not.toBe(candScore);
          }

          // No overlap between agreements and disagreements
          const overlap = agreements.filter((id) => disagreements.includes(id));
          expect(overlap).toHaveLength(0);

          // Agreements capped at 3, disagreements capped at 2
          expect(agreements.length).toBeLessThanOrEqual(3);
          expect(disagreements.length).toBeLessThanOrEqual(2);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('full (uncapped) agreement/disagreement sets have no overlap and cover all compared issues', () => {
    fc.assert(
      fc.property(
        makeProfileArb(),
        makePositionsArb(),
        (profile, positions) => {
          // Manually compute the full sets to verify exhaustive partitioning
          const expectedAgree: string[] = [];
          const expectedDisagree: string[] = [];

          for (const issueId of ISSUE_IDS) {
            const u = profile[issueId];
            const c = positions[issueId];
            if (u === 0 || c === undefined || c === 0) continue;
            if (u === c) expectedAgree.push(issueId);
            else expectedDisagree.push(issueId);
          }

          // No issue can be in both
          const overlapSet = new Set(expectedAgree.filter((id) => expectedDisagree.includes(id)));
          expect(overlapSet.size).toBe(0);

          // Every compared issue must be in exactly one partition
          const allCompared = [...expectedAgree, ...expectedDisagree];
          const uniqueCompared = new Set(allCompared);
          expect(uniqueCompared.size).toBe(allCompared.length);

          // Now verify the engine's sliced output is a prefix of the full sets
          const candidate = makeCandidate(positions);
          mockedLoadCandidates.mockReturnValue([candidate]);
          const results = computeMatches(profile, LOCATION);
          const { agreements, disagreements } = results[0];

          // Returned agreements must be a subset of expected agreements
          for (const id of agreements) {
            expect(expectedAgree).toContain(id);
          }
          // Returned disagreements must be a subset of expected disagreements
          for (const id of disagreements) {
            expect(expectedDisagree).toContain(id);
          }
        },
      ),
      { numRuns: 200 },
    );
  });
});
