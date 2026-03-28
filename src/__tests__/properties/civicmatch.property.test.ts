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

const candidateArb = (states: string[], counties: string[]): fc.Arbitrary<Candidate> =>
  fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 30 }),
    office: fc.string({ minLength: 1, maxLength: 30 }),
    district: fc.string({ minLength: 1, maxLength: 20 }),
    state: fc.constantFrom(...states),
    county: fc.constantFrom(...counties),
    bio: fc.string({ minLength: 0, maxLength: 50 }),
    positions: fc.dictionary(
      fc.stringMatching(/^issue-\d{1,3}$/),
      issueScoreArb,
    ) as fc.Arbitrary<Record<string, IssueScore>>,
  });

// Feature: poly-mvp, Property 5: Candidate Location Filtering
describe('Property 5: Candidate Location Filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Validates: Requirements 3.1
   *
   * For any set of candidates and any resolved location (state, county),
   * the CivicMatchEngine should return only candidates whose state and
   * county match the user's resolved location. No candidate outside the
   * user's location should appear in the results.
   */
  it('only candidates matching state and county are returned', () => {
    fc.assert(
      fc.property(
        locationArb,
        fc.array(
          candidateArb(['CA', 'NY', 'TX', 'FL'], ['Los Angeles', 'New York', 'Harris', 'Miami-Dade']),
          { minLength: 0, maxLength: 15 },
        ),
        (location: LocationResult, candidates: Candidate[]) => {
          mockedLoadCandidates.mockReturnValue(candidates);

          // Build a minimal non-empty profile so match computation runs
          const profile: IssueProfile = { 'issue-1': 1 };

          const results = computeMatches(profile, location);

          // Every returned candidate must match the location
          for (const result of results) {
            expect(result.candidate.state.toLowerCase()).toBe(location.state.toLowerCase());
            expect(result.candidate.county.toLowerCase()).toBe(location.county.toLowerCase());
          }

          // Count how many candidates in the input match the location
          const expectedCount = candidates.filter(
            (c) =>
              c.state.toLowerCase() === location.state.toLowerCase() &&
              c.county.toLowerCase() === location.county.toLowerCase(),
          ).length;

          expect(results.length).toBe(expectedCount);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('no candidate outside the user location appears in results (supplemental)', () => {
    fc.assert(
      fc.property(
        fc.record({
          city: fc.constant('Test City'),
          county: fc.constant('TestCounty'),
          state: fc.constant('ZZ'),
        }),
        fc.array(
          candidateArb(['CA', 'NY', 'TX'], ['Los Angeles', 'New York', 'Harris']),
          { minLength: 1, maxLength: 10 },
        ),
        (location: LocationResult, candidates: Candidate[]) => {
          // Location uses state "ZZ" which no candidate will match
          mockedLoadCandidates.mockReturnValue(candidates);
          const profile: IssueProfile = { 'issue-1': 1 };

          const results = computeMatches(profile, location);
          expect(results).toHaveLength(0);
        },
      ),
      { numRuns: 100 },
    );
  });
});


// Feature: poly-mvp, Property 6: Match Percentage Computation
describe('Property 6: Match Percentage Computation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Validates: Requirements 3.2, 3.3
   *
   * For any Issue Profile and any candidate's positions, the Match Percentage
   * should equal (number of issues where both the user and candidate have the
   * same non-zero score) divided by (number of issues where both have non-zero
   * scores) × 100. Issues where the user scored 0 (skip) must be excluded from
   * both numerator and denominator.
   */
  it('match percentage equals matching non-zero scores / answered non-zero scores × 100', () => {
    // Shared issue IDs so profiles and positions overlap
    const issueIds = Array.from({ length: 8 }, (_, i) => `issue-${i}`);

    const profileArb: fc.Arbitrary<IssueProfile> = fc.tuple(
      ...issueIds.map(() => issueScoreArb),
    ).map((scores) => {
      const profile: IssueProfile = {};
      scores.forEach((s, i) => { profile[issueIds[i]] = s; });
      return profile;
    });

    const positionsArb: fc.Arbitrary<Record<string, IssueScore>> = fc.tuple(
      ...issueIds.map(() => issueScoreArb),
    ).map((scores) => {
      const pos: Record<string, IssueScore> = {};
      scores.forEach((s, i) => { pos[issueIds[i]] = s; });
      return pos;
    });

    fc.assert(
      fc.property(
        profileArb,
        positionsArb,
        (profile, positions) => {
          const candidate: Candidate = {
            id: 'c1',
            name: 'Test',
            office: 'Office',
            district: 'D1',
            state: 'CA',
            county: 'Los Angeles',
            bio: '',
            positions,
          };

          const location: LocationResult = { city: 'LA', county: 'Los Angeles', state: 'CA' };
          mockedLoadCandidates.mockReturnValue([candidate]);

          const results = computeMatches(profile, location);
          expect(results).toHaveLength(1);

          const result = results[0];

          // Manually compute expected match percentage using the same logic
          let answered = 0;
          let matching = 0;
          for (const issueId of issueIds) {
            const userScore = profile[issueId];
            const candScore = positions[issueId];
            if (userScore === 0) continue;
            if (candScore === undefined || candScore === 0) continue;
            answered++;
            if (userScore === candScore) matching++;
          }

          const expectedPct = answered > 0 ? Math.round((matching / answered) * 100) : 0;
          expect(result.matchPercentage).toBe(expectedPct);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('skipped issues (score 0) are excluded from both numerator and denominator', () => {
    fc.assert(
      fc.property(
        // Generate a profile where at least one issue is skipped and one is answered
        fc.record({
          'issue-a': fc.constant(0 as IssueScore),       // always skipped
          'issue-b': fc.constantFrom(1 as const, -1 as const), // always answered
        }),
        fc.record({
          'issue-a': fc.constantFrom(1 as const, -1 as const),
          'issue-b': fc.constantFrom(1 as const, -1 as const),
        }),
        (profile, positions) => {
          const candidate: Candidate = {
            id: 'c1',
            name: 'Test',
            office: 'Office',
            district: 'D1',
            state: 'TX',
            county: 'Harris',
            bio: '',
            positions: positions as Record<string, IssueScore>,
          };

          const location: LocationResult = { city: 'Houston', county: 'Harris', state: 'TX' };
          mockedLoadCandidates.mockReturnValue([candidate]);

          const results = computeMatches(profile as IssueProfile, location);
          const result = results[0];

          // Only issue-b should count; issue-a is skipped by user
          const match = profile['issue-b'] === positions['issue-b'] ? 1 : 0;
          // Denominator is 1 (only issue-b), unless candidate also has 0 for issue-b
          const expectedPct = Math.round((match / 1) * 100);

          expect(result.matchPercentage).toBe(expectedPct);
        },
      ),
      { numRuns: 100 },
    );
  });
});


// Feature: poly-mvp, Property 7: Match Results Sorting
describe('Property 7: Match Results Sorting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Validates: Requirements 3.5
   *
   * For any list of MatchResults returned by the CivicMatchEngine,
   * the list should be sorted by matchPercentage in descending order —
   * that is, for every consecutive pair of results, the first result's
   * matchPercentage should be greater than or equal to the second's.
   */
  it('results are sorted by matchPercentage in descending order', () => {
    const issueIds = Array.from({ length: 6 }, (_, i) => `issue-${i}`);

    // Generate multiple candidates at the same location with varying positions
    const candidateWithPositionsArb = (index: number): fc.Arbitrary<Candidate> =>
      fc.tuple(...issueIds.map(() => issueScoreArb)).map((scores) => {
        const positions: Record<string, IssueScore> = {};
        scores.forEach((s, i) => { positions[issueIds[i]] = s; });
        return {
          id: `c-${index}`,
          name: `Candidate ${index}`,
          office: 'Office',
          district: 'D1',
          state: 'CA',
          county: 'Los Angeles',
          bio: '',
          positions,
        };
      });

    // Generate a non-trivial user profile (at least one non-zero score)
    const profileArb: fc.Arbitrary<IssueProfile> = fc
      .tuple(...issueIds.map(() => issueScoreArb))
      .filter((scores) => scores.some((s) => s !== 0))
      .map((scores) => {
        const profile: IssueProfile = {};
        scores.forEach((s, i) => { profile[issueIds[i]] = s; });
        return profile;
      });

    fc.assert(
      fc.property(
        profileArb,
        fc.tuple(
          candidateWithPositionsArb(0),
          candidateWithPositionsArb(1),
          candidateWithPositionsArb(2),
          candidateWithPositionsArb(3),
          candidateWithPositionsArb(4),
        ),
        (profile, candidates) => {
          const location: LocationResult = { city: 'LA', county: 'Los Angeles', state: 'CA' };
          mockedLoadCandidates.mockReturnValue(candidates);

          const results = computeMatches(profile, location);

          // Verify descending sort: each consecutive pair must satisfy a >= b
          for (let i = 0; i < results.length - 1; i++) {
            expect(results[i].matchPercentage).toBeGreaterThanOrEqual(
              results[i + 1].matchPercentage,
            );
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
