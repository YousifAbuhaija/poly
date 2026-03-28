// Feature: dynamic-civic-data, Property 4: Cache TTL correctness
import { describe, it, expect, vi } from 'vitest';
import * as fc from 'fast-check';
import {
  createCacheService,
  LOCATION_TTL_SECONDS,
  CANDIDATES_TTL_SECONDS,
  SK_LOCATION,
  SK_CANDIDATES,
  type DocumentClient,
  type CacheItem,
} from '../../services/CacheService';
import type { LocationResult, Candidate, IssueScore } from '../../types';

// --- Shared mock client factory ---

function createMockClient() {
  const store = new Map<string, CacheItem>();

  const client: DocumentClient = {
    get: vi.fn(async ({ Key }) => {
      const item = store.get(`${Key.PK}#${Key.SK}`);
      return { Item: item };
    }),
    put: vi.fn(async ({ Item }) => {
      store.set(`${Item.PK}#${Item.SK}`, Item);
    }),
  };

  return { client, store };
}

// --- Shared arbitraries ---

const zipCodeArb = fc.stringMatching(/^\d{5}$/);

const locationArb: fc.Arbitrary<LocationResult> = fc.record({
  city: fc.string({ minLength: 1, maxLength: 30 }),
  county: fc.string({ minLength: 1, maxLength: 30 }),
  state: fc.stringMatching(/^[A-Z]{2}$/),
});

const issueScoreArb: fc.Arbitrary<IssueScore> = fc.constantFrom(1 as const, -1 as const, 0 as const);

const candidateArb: fc.Arbitrary<Candidate> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 30 }),
  office: fc.string({ minLength: 1, maxLength: 30 }),
  district: fc.string({ minLength: 1, maxLength: 20 }),
  state: fc.stringMatching(/^[A-Z]{2}$/),
  county: fc.string({ minLength: 1, maxLength: 30 }),
  bio: fc.string({ minLength: 0, maxLength: 50 }),
  positions: fc.dictionary(
    fc.stringMatching(/^issue-\d{1,3}$/),
    issueScoreArb,
  ) as fc.Arbitrary<Record<string, IssueScore>>,
});

// Reasonable Unix timestamp range (2020-01-01 to 2035-01-01)
const timestampArb = fc.integer({ min: 1_577_836_800, max: 2_051_222_400 });

const TABLE = 'CivicCache';

// --- Property 4: Cache TTL correctness ---
// Validates: Requirements 2.1, 2.2

describe('Property 4: Cache TTL correctness', () => {
  it('putLocation sets TTL to now + 30 days (LOCATION_TTL_SECONDS)', async () => {
    await fc.assert(
      fc.asyncProperty(
        timestampArb,
        zipCodeArb,
        locationArb,
        async (nowSeconds, zip, location) => {
          const { client, store } = createMockClient();
          const cache = createCacheService(client, TABLE, () => nowSeconds);

          await cache.putLocation(zip, location);

          const item = store.get(`${zip}#${SK_LOCATION}`);
          expect(item).toBeDefined();
          expect(item!.ttl).toBe(nowSeconds + LOCATION_TTL_SECONDS);
          expect(item!.SK).toBe(SK_LOCATION);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('putCandidates sets TTL to now + 24 hours (CANDIDATES_TTL_SECONDS)', async () => {
    await fc.assert(
      fc.asyncProperty(
        timestampArb,
        zipCodeArb,
        fc.array(candidateArb, { minLength: 0, maxLength: 5 }),
        async (nowSeconds, zip, candidates) => {
          const { client, store } = createMockClient();
          const cache = createCacheService(client, TABLE, () => nowSeconds);

          await cache.putCandidates(zip, candidates);

          const item = store.get(`${zip}#${SK_CANDIDATES}`);
          expect(item).toBeDefined();
          expect(item!.ttl).toBe(nowSeconds + CANDIDATES_TTL_SECONDS);
          expect(item!.SK).toBe(SK_CANDIDATES);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('LOCATION_TTL_SECONDS equals exactly 30 days in seconds', () => {
    expect(LOCATION_TTL_SECONDS).toBe(30 * 24 * 60 * 60);
    expect(LOCATION_TTL_SECONDS).toBe(2_592_000);
  });

  it('CANDIDATES_TTL_SECONDS equals exactly 24 hours in seconds', () => {
    expect(CANDIDATES_TTL_SECONDS).toBe(24 * 60 * 60);
    expect(CANDIDATES_TTL_SECONDS).toBe(86_400);
  });
});

// Feature: dynamic-civic-data, Property 5: Cache round-trip
// Validates: Requirements 2.3, 2.4

describe('Property 5: Cache round-trip', () => {
  it('location written to cache is deeply equal when read back before TTL expiration', async () => {
    await fc.assert(
      fc.asyncProperty(
        timestampArb,
        zipCodeArb,
        locationArb,
        async (nowSeconds, zip, location) => {
          const { client } = createMockClient();
          const cache = createCacheService(client, TABLE, () => nowSeconds);

          await cache.putLocation(zip, location);

          const retrieved = await cache.getLocation(zip);
          expect(retrieved).toEqual(location);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('candidates written to cache are deeply equal when read back before TTL expiration', async () => {
    await fc.assert(
      fc.asyncProperty(
        timestampArb,
        zipCodeArb,
        fc.array(candidateArb, { minLength: 0, maxLength: 5 }),
        async (nowSeconds, zip, candidates) => {
          const { client } = createMockClient();
          const cache = createCacheService(client, TABLE, () => nowSeconds);

          await cache.putCandidates(zip, candidates);

          const retrieved = await cache.getCandidates(zip);
          expect(retrieved).toEqual(candidates);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('location and candidates for the same ZIP are independently retrievable', async () => {
    await fc.assert(
      fc.asyncProperty(
        timestampArb,
        zipCodeArb,
        locationArb,
        fc.array(candidateArb, { minLength: 1, maxLength: 5 }),
        async (nowSeconds, zip, location, candidates) => {
          const { client } = createMockClient();
          const cache = createCacheService(client, TABLE, () => nowSeconds);

          await cache.putLocation(zip, location);
          await cache.putCandidates(zip, candidates);

          const retrievedLocation = await cache.getLocation(zip);
          const retrievedCandidates = await cache.getCandidates(zip);

          expect(retrievedLocation).toEqual(location);
          expect(retrievedCandidates).toEqual(candidates);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// Feature: dynamic-civic-data, Property 6: Expired cache entries treated as absent
// Validates: Requirements 2.5

describe('Property 6: Expired cache entries treated as absent', () => {
  it('getLocation returns null when read time is after TTL expiration', async () => {
    await fc.assert(
      fc.asyncProperty(
        timestampArb,
        zipCodeArb,
        locationArb,
        // Extra seconds past expiration (at least 1 second after TTL)
        fc.integer({ min: 1, max: 365 * 24 * 60 * 60 }),
        async (writeTime, zip, location, extraSeconds) => {
          const { client } = createMockClient();

          // Write at writeTime — TTL will be writeTime + LOCATION_TTL_SECONDS
          let currentTime = writeTime;
          const cache = createCacheService(client, TABLE, () => currentTime);

          await cache.putLocation(zip, location);

          // Advance time past TTL expiration
          currentTime = writeTime + LOCATION_TTL_SECONDS + extraSeconds;

          const retrieved = await cache.getLocation(zip);
          expect(retrieved).toBeNull();
        },
      ),
      { numRuns: 100 },
    );
  });

  it('getCandidates returns null when read time is after TTL expiration', async () => {
    await fc.assert(
      fc.asyncProperty(
        timestampArb,
        zipCodeArb,
        fc.array(candidateArb, { minLength: 1, maxLength: 5 }),
        fc.integer({ min: 1, max: 365 * 24 * 60 * 60 }),
        async (writeTime, zip, candidates, extraSeconds) => {
          const { client } = createMockClient();

          let currentTime = writeTime;
          const cache = createCacheService(client, TABLE, () => currentTime);

          await cache.putCandidates(zip, candidates);

          // Advance time past TTL expiration
          currentTime = writeTime + CANDIDATES_TTL_SECONDS + extraSeconds;

          const retrieved = await cache.getCandidates(zip);
          expect(retrieved).toBeNull();
        },
      ),
      { numRuns: 100 },
    );
  });

  it('getLocation returns null at exact TTL boundary (ttl <= now)', async () => {
    await fc.assert(
      fc.asyncProperty(
        timestampArb,
        zipCodeArb,
        locationArb,
        async (writeTime, zip, location) => {
          const { client } = createMockClient();

          let currentTime = writeTime;
          const cache = createCacheService(client, TABLE, () => currentTime);

          await cache.putLocation(zip, location);

          // Set time to exactly the TTL value (ttl === now → treated as expired)
          currentTime = writeTime + LOCATION_TTL_SECONDS;

          const retrieved = await cache.getLocation(zip);
          expect(retrieved).toBeNull();
        },
      ),
      { numRuns: 100 },
    );
  });

  it('getCandidates returns null at exact TTL boundary (ttl <= now)', async () => {
    await fc.assert(
      fc.asyncProperty(
        timestampArb,
        zipCodeArb,
        fc.array(candidateArb, { minLength: 1, maxLength: 5 }),
        async (writeTime, zip, candidates) => {
          const { client } = createMockClient();

          let currentTime = writeTime;
          const cache = createCacheService(client, TABLE, () => currentTime);

          await cache.putCandidates(zip, candidates);

          // Set time to exactly the TTL value (ttl === now → treated as expired)
          currentTime = writeTime + CANDIDATES_TTL_SECONDS;

          const retrieved = await cache.getCandidates(zip);
          expect(retrieved).toBeNull();
        },
      ),
      { numRuns: 100 },
    );
  });
});
