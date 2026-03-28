// Feature: dynamic-civic-data, Property 13: Match engine data-source invariance
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import type { Candidate, IssueProfile, IssueScore, LocationResult } from '../../types';

// Mock DataLoader so we can inject arbitrary candidate sets
vi.mock('../../services/DataLoader', () => ({
  loadCandidates: vi.fn(() => [] as Candidate[]),
}));

import { computeMatches } from '../../engines/CivicMatchEngine';
import { loadCandidates } from '../../services/DataLoader';

const mockedLoadCandidates = vi.mocked(loadCandidates);

// Arbitrary generators
const issueScoreArb = fc.constantFrom(1 as const, -1 as const, 0 as const);

const locationArb: fc.Arbitrary<LocationResult> = fc.record({
  city: fc.string({ minLength: 1, maxLength: 20 }),
  county: fc.stringMatching(/^[A-Za-z ]{1,20}$/),
  state: fc.stringMatching(/^[A-Z]{2}$/),
});

const candidateArb = (location: LocationResult): fc.Arbitrary<Candidate> =>
  fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 30 }),
    office: fc.string({ minLength: 1, maxLength: 30 }),
    district: fc.string({ minLength: 1, maxLength: 20 }),
    state: fc.constant(location.state),
    county: fc.constant(location.county),
    bio: fc.string({ minLength: 0, maxLength: 50 }),
    positions: fc.dictionary(
      fc.stringMatching(/^issue-\d{1,3}$/),
      issueScoreArb,
    ) as fc.Arbitrary<Record<string, IssueScore>>,
  });

const profileArb: fc.Arbitrary<IssueProfile> = fc.dictionary(
  fc.stringMatching(/^issue-\d{1,3}$/),
  issueScoreArb,
).filter((p) => Object.keys(p).length > 0) as fc.Arbitrary<IssueProfile>;

/**
 * Validates: Requirements 7.1, 7.3
 *
 * For any two identical Candidate arrays where one set has
 * `positionsInferred: true` and the other has `positionsInferred: false`
 * (or undefined), the CivicMatchEngine should produce identical
 * matchPercentage, agreements, and disagreements for each candidate.
 */
describe('Property 13: Match engine data-source invariance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('match results are identical regardless of positionsInferred flag', () => {
    fc.assert(
      fc.property(
        locationArb,
        fc.integer({ min: 1, max: 8 }),
        profileArb,
        (location, candidateCount, profile) => {
          // Generate candidates bound to the location using fc.sample
          const baseCandidates = fc.sample(candidateArb(location), candidateCount);

          // Run 1: candidates WITHOUT positionsInferred (undefined)
          const candidatesWithout: Candidate[] = baseCandidates.map((c) => {
            const { positionsInferred, ...rest } = c as Candidate & { positionsInferred?: boolean };
            return rest as Candidate;
          });

          mockedLoadCandidates.mockReturnValue(candidatesWithout);
          const resultsWithout = computeMatches(profile, location);

          // Run 2: candidates WITH positionsInferred: true
          const candidatesWith: Candidate[] = baseCandidates.map((c) => ({
            ...c,
            positionsInferred: true,
          }));

          mockedLoadCandidates.mockReturnValue(candidatesWith);
          const resultsWith = computeMatches(profile, location);

          // Both runs should return the same number of results
          expect(resultsWith.length).toBe(resultsWithout.length);

          // Each result should have identical match data
          for (let i = 0; i < resultsWith.length; i++) {
            expect(resultsWith[i].matchPercentage).toBe(resultsWithout[i].matchPercentage);
            expect(resultsWith[i].agreements).toEqual(resultsWithout[i].agreements);
            expect(resultsWith[i].disagreements).toEqual(resultsWithout[i].disagreements);
            // Candidate IDs should match (same ordering)
            expect(resultsWith[i].candidate.id).toBe(resultsWithout[i].candidate.id);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('match results are identical with positionsInferred: false vs positionsInferred: true', () => {
    fc.assert(
      fc.property(
        locationArb,
        fc.integer({ min: 1, max: 6 }),
        profileArb,
        (location, candidateCount, profile) => {
          const baseCandidates = fc.sample(candidateArb(location), candidateCount);

          // Run 1: candidates with positionsInferred: false
          const candidatesFalse: Candidate[] = baseCandidates.map((c) => ({
            ...c,
            positionsInferred: false,
          }));

          mockedLoadCandidates.mockReturnValue(candidatesFalse);
          const resultsFalse = computeMatches(profile, location);

          // Run 2: candidates with positionsInferred: true
          const candidatesTrue: Candidate[] = baseCandidates.map((c) => ({
            ...c,
            positionsInferred: true,
          }));

          mockedLoadCandidates.mockReturnValue(candidatesTrue);
          const resultsTrue = computeMatches(profile, location);

          expect(resultsTrue.length).toBe(resultsFalse.length);

          for (let i = 0; i < resultsTrue.length; i++) {
            expect(resultsTrue[i].matchPercentage).toBe(resultsFalse[i].matchPercentage);
            expect(resultsTrue[i].agreements).toEqual(resultsFalse[i].agreements);
            expect(resultsTrue[i].disagreements).toEqual(resultsFalse[i].disagreements);
            expect(resultsTrue[i].candidate.id).toBe(resultsFalse[i].candidate.id);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
