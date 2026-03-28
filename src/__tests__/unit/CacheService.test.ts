import { describe, it, expect, vi } from 'vitest';
import {
  createCacheService,
  LOCATION_TTL_SECONDS,
  CANDIDATES_TTL_SECONDS,
  SK_LOCATION,
  SK_CANDIDATES,
  type DocumentClient,
  type CacheItem,
} from '../../services/CacheService';
import type { LocationResult, Candidate } from '../../types';

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

const sampleLocation: LocationResult = {
  city: 'Beverly Hills',
  county: 'Los Angeles',
  state: 'CA',
};

const sampleCandidates: Candidate[] = [
  {
    id: 'jane-doe-mayor',
    name: 'Jane Doe',
    office: 'Mayor',
    district: 'City',
    state: 'CA',
    county: 'Los Angeles',
    bio: 'A dedicated public servant.',
    positions: { env: 1, tax: -1 },
  },
];

describe('CacheService', () => {
  const TABLE = 'CivicCache';
  const NOW = 1_700_000_000;

  it('putLocation stores with correct PK, SK, and TTL', async () => {
    const { client } = createMockClient();
    const cache = createCacheService(client, TABLE, () => NOW);

    await cache.putLocation('90210', sampleLocation);

    expect(client.put).toHaveBeenCalledWith({
      TableName: TABLE,
      Item: {
        PK: '90210',
        SK: SK_LOCATION,
        data: sampleLocation,
        ttl: NOW + LOCATION_TTL_SECONDS,
      },
    });
  });

  it('putCandidates stores with correct PK, SK, and TTL', async () => {
    const { client } = createMockClient();
    const cache = createCacheService(client, TABLE, () => NOW);

    await cache.putCandidates('90210', sampleCandidates);

    expect(client.put).toHaveBeenCalledWith({
      TableName: TABLE,
      Item: {
        PK: '90210',
        SK: SK_CANDIDATES,
        data: sampleCandidates,
        ttl: NOW + CANDIDATES_TTL_SECONDS,
      },
    });
  });

  it('getLocation returns data when not expired', async () => {
    const { client, store } = createMockClient();
    const cache = createCacheService(client, TABLE, () => NOW);

    store.set('90210#LOCATION', {
      PK: '90210',
      SK: SK_LOCATION,
      data: sampleLocation,
      ttl: NOW + 1000,
    });

    const result = await cache.getLocation('90210');
    expect(result).toEqual(sampleLocation);
  });

  it('getLocation returns null when expired', async () => {
    const { client, store } = createMockClient();
    const cache = createCacheService(client, TABLE, () => NOW);

    store.set('90210#LOCATION', {
      PK: '90210',
      SK: SK_LOCATION,
      data: sampleLocation,
      ttl: NOW - 1,
    });

    const result = await cache.getLocation('90210');
    expect(result).toBeNull();
  });

  it('getLocation returns null when TTL equals now (boundary)', async () => {
    const { client, store } = createMockClient();
    const cache = createCacheService(client, TABLE, () => NOW);

    store.set('90210#LOCATION', {
      PK: '90210',
      SK: SK_LOCATION,
      data: sampleLocation,
      ttl: NOW,
    });

    const result = await cache.getLocation('90210');
    expect(result).toBeNull();
  });

  it('getLocation returns null when item not found', async () => {
    const { client } = createMockClient();
    const cache = createCacheService(client, TABLE, () => NOW);

    const result = await cache.getLocation('99999');
    expect(result).toBeNull();
  });

  it('getCandidates returns data when not expired', async () => {
    const { client, store } = createMockClient();
    const cache = createCacheService(client, TABLE, () => NOW);

    store.set('90210#CANDIDATES', {
      PK: '90210',
      SK: SK_CANDIDATES,
      data: sampleCandidates,
      ttl: NOW + 1000,
    });

    const result = await cache.getCandidates('90210');
    expect(result).toEqual(sampleCandidates);
  });

  it('getCandidates returns null when expired', async () => {
    const { client, store } = createMockClient();
    const cache = createCacheService(client, TABLE, () => NOW);

    store.set('90210#CANDIDATES', {
      PK: '90210',
      SK: SK_CANDIDATES,
      data: sampleCandidates,
      ttl: NOW - 100,
    });

    const result = await cache.getCandidates('90210');
    expect(result).toBeNull();
  });

  it('round-trip: put then get returns same data', async () => {
    const { client } = createMockClient();
    const cache = createCacheService(client, TABLE, () => NOW);

    await cache.putLocation('10001', sampleLocation);
    await cache.putCandidates('10001', sampleCandidates);

    const loc = await cache.getLocation('10001');
    const cands = await cache.getCandidates('10001');

    expect(loc).toEqual(sampleLocation);
    expect(cands).toEqual(sampleCandidates);
  });
});
