// Feature: dynamic-civic-data, Property 3: API response schema conformance

import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import {
  handler,
  type LambdaDeps,
  type CivicDataRequest,
  type GoogleOfficial,
  type CacheService,
  type GoogleCivicClient,
  type PositionInferrer,
} from '../../services/CivicDataLambda';
import type { LocationResult, IssueScore } from '../../types';

// --- Arbitrary generators ---

const issueScoreArb: fc.Arbitrary<1 | -1 | 0> = fc.constantFrom(
  1 as const,
  -1 as const,
  0 as const,
);

const locationArb: fc.Arbitrary<LocationResult> = fc.record({
  city: fc.string({ minLength: 1, maxLength: 20 }),
  county: fc.string({ minLength: 1, maxLength: 20 }),
  state: fc.string({ minLength: 1, maxLength: 20 }),
});

const googleOfficialArb: fc.Arbitrary<GoogleOfficial> = fc.record({
  name: fc.string({ minLength: 1, maxLength: 30 }),
  office: fc.string({ minLength: 1, maxLength: 30 }),
  district: fc.string({ minLength: 1, maxLength: 20 }),
  party: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: undefined }),
  urls: fc.option(fc.array(fc.webUrl(), { minLength: 0, maxLength: 2 }), { nil: undefined }),
  channels: fc.option(
    fc.array(
      fc.record({
        type: fc.string({ minLength: 1, maxLength: 10 }),
        id: fc.string({ minLength: 1, maxLength: 20 }),
      }),
      { minLength: 0, maxLength: 2 },
    ),
    { nil: undefined },
  ),
});

// Generate a random set of issue definitions (1–5 issues)
const issuesArb = fc.array(
  fc.record({
    id: fc.stringMatching(/^issue-[a-z0-9]{1,8}$/),
    text: fc.string({ minLength: 1, maxLength: 40 }),
  }),
  { minLength: 1, maxLength: 5 },
);

// Valid 5-digit ZIP
const validZipArb = fc
  .integer({ min: 0, max: 99999 })
  .map((n) => n.toString().padStart(5, '0'));


/**
 * Validates: Requirements 1.2, 8.3
 *
 * For any successful response from the Civic Data Lambda, the response body
 * should contain a `location` object with non-empty `city`, `county`, and
 * `state` strings, and a `candidates` array where each element has non-empty
 * `id`, `name`, `office`, `district`, `state`, `county`, and `bio` fields,
 * plus a `positions` object.
 */
describe('Property 3: API response schema conformance', () => {
  it('successful responses have correct location and candidate schema', async () => {
    await fc.assert(
      fc.asyncProperty(
        validZipArb,
        locationArb,
        fc.array(googleOfficialArb, { minLength: 1, maxLength: 5 }),
        issuesArb,
        async (zip, location, officials, issues) => {
          // Build position map for each issue
          const positionMap: Record<string, 1 | -1 | 0> = {};
          for (const issue of issues) {
            positionMap[issue.id] = 1; // deterministic valid score
          }

          const mockCache: CacheService = {
            getLocation: vi.fn().mockResolvedValue(null),
            getCandidates: vi.fn().mockResolvedValue(null),
            putLocation: vi.fn().mockResolvedValue(undefined),
            putCandidates: vi.fn().mockResolvedValue(undefined),
          };

          const mockCivicClient: GoogleCivicClient = {
            getRepresentatives: vi.fn().mockResolvedValue({
              location,
              officials,
            }),
          };

          const mockInferrer: PositionInferrer = {
            inferPositions: vi.fn().mockResolvedValue(positionMap),
          };

          const deps: LambdaDeps = {
            cache: mockCache,
            civicClient: mockCivicClient,
            positionInferrer: mockInferrer,
            issues,
          };

          const event: CivicDataRequest = {
            pathParameters: { zipCode: zip },
          };

          const response = await handler(event, deps);

          // Should be a successful response
          expect(response.statusCode).toBe(200);

          const body = JSON.parse(response.body);

          // --- Location schema ---
          expect(body.location).toBeDefined();
          expect(typeof body.location.city).toBe('string');
          expect(body.location.city.length).toBeGreaterThan(0);
          expect(typeof body.location.county).toBe('string');
          expect(body.location.county.length).toBeGreaterThan(0);
          expect(typeof body.location.state).toBe('string');
          expect(body.location.state.length).toBeGreaterThan(0);

          // --- Candidates array ---
          expect(Array.isArray(body.candidates)).toBe(true);
          expect(body.candidates.length).toBe(officials.length);

          for (const candidate of body.candidates) {
            // Non-empty string fields
            expect(typeof candidate.id).toBe('string');
            expect(candidate.id.length).toBeGreaterThan(0);

            expect(typeof candidate.name).toBe('string');
            expect(candidate.name.length).toBeGreaterThan(0);

            expect(typeof candidate.office).toBe('string');
            expect(candidate.office.length).toBeGreaterThan(0);

            expect(typeof candidate.district).toBe('string');
            expect(candidate.district.length).toBeGreaterThan(0);

            expect(typeof candidate.state).toBe('string');
            expect(candidate.state.length).toBeGreaterThan(0);

            expect(typeof candidate.county).toBe('string');
            expect(candidate.county.length).toBeGreaterThan(0);

            // Bio is a string (may be empty since it's derived from GoogleOfficial which has no bio)
            expect(typeof candidate.bio).toBe('string');

            // Positions is an object
            expect(typeof candidate.positions).toBe('object');
            expect(candidate.positions).not.toBeNull();
          }

          // --- Source field ---
          expect(body.source).toBe('api');
        },
      ),
      { numRuns: 100 },
    );
  });
});
