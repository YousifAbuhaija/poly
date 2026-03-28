import { describe, it, expect, vi } from 'vitest';
import {
  handler,
  isValidZipCode,
  type CivicDataRequest,
  type LambdaDeps,
  type CacheService,
  type GoogleCivicClient,
  type PositionInferrer,
} from '../../services/CivicDataLambda';
import type { LocationResult, Candidate } from '../../types';

// --- Helpers ---

const ISSUES = [
  { id: 'issue-1', text: 'Climate change' },
  { id: 'issue-2', text: 'Healthcare' },
];

function makeMockCache(overrides?: Partial<CacheService>): CacheService {
  return {
    getLocation: vi.fn().mockResolvedValue(null),
    getCandidates: vi.fn().mockResolvedValue(null),
    putLocation: vi.fn().mockResolvedValue(undefined),
    putCandidates: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function makeMockCivicClient(overrides?: Partial<GoogleCivicClient>): GoogleCivicClient {
  return {
    getRepresentatives: vi.fn().mockResolvedValue({
      location: { city: 'Springfield', county: 'Sangamon', state: 'IL' },
      officials: [
        { name: 'Jane Doe', office: 'Mayor', district: 'District 1' },
      ],
    }),
    ...overrides,
  };
}

function makeMockInferrer(overrides?: Partial<PositionInferrer>): PositionInferrer {
  return {
    inferPositions: vi.fn().mockResolvedValue({
      'issue-1': 1,
      'issue-2': -1,
    }),
    ...overrides,
  };
}

function makeDeps(overrides?: Partial<LambdaDeps>): LambdaDeps {
  return {
    cache: makeMockCache(),
    civicClient: makeMockCivicClient(),
    positionInferrer: makeMockInferrer(),
    issues: ISSUES,
    ...overrides,
  };
}

function makeRequest(zip: string, method?: string): CivicDataRequest {
  return {
    pathParameters: { zipCode: zip },
    httpMethod: method,
  };
}

function parseBody(body: string) {
  return JSON.parse(body);
}

// --- Tests ---

describe('isValidZipCode', () => {
  it('accepts valid 5-digit ZIP codes', () => {
    expect(isValidZipCode('90210')).toBe(true);
    expect(isValidZipCode('00000')).toBe(true);
    expect(isValidZipCode('99999')).toBe(true);
  });

  it('rejects non-5-digit strings', () => {
    expect(isValidZipCode('')).toBe(false);
    expect(isValidZipCode('1234')).toBe(false);
    expect(isValidZipCode('123456')).toBe(false);
    expect(isValidZipCode('abcde')).toBe(false);
    expect(isValidZipCode('9021a')).toBe(false);
    expect(isValidZipCode(' 90210')).toBe(false);
  });
});

describe('handler', () => {
  describe('method validation', () => {
    it('returns 405 for POST requests', async () => {
      const res = await handler(makeRequest('90210', 'POST'), makeDeps());
      expect(res.statusCode).toBe(405);
      expect(parseBody(res.body).message).toBe('Only GET requests are supported');
    });

    it('returns 405 for PUT requests', async () => {
      const res = await handler(makeRequest('90210', 'PUT'), makeDeps());
      expect(res.statusCode).toBe(405);
    });

    it('allows GET requests', async () => {
      const res = await handler(makeRequest('90210', 'GET'), makeDeps());
      expect(res.statusCode).not.toBe(405);
    });

    it('defaults to GET when httpMethod is undefined', async () => {
      const res = await handler(makeRequest('90210'), makeDeps());
      expect(res.statusCode).not.toBe(405);
    });
  });

  describe('ZIP validation', () => {
    it('returns 400 for invalid ZIP codes', async () => {
      const res = await handler(makeRequest('abc'), makeDeps());
      expect(res.statusCode).toBe(400);
      expect(parseBody(res.body).message).toBe('ZIP code must be exactly 5 digits');
    });

    it('returns 400 for empty ZIP', async () => {
      const res = await handler(makeRequest(''), makeDeps());
      expect(res.statusCode).toBe(400);
    });

    it('returns 400 for 4-digit ZIP', async () => {
      const res = await handler(makeRequest('1234'), makeDeps());
      expect(res.statusCode).toBe(400);
    });
  });

  describe('cache hit', () => {
    it('returns cached data with source "cache"', async () => {
      const location: LocationResult = { city: 'LA', county: 'Los Angeles', state: 'CA' };
      const candidates: Candidate[] = [{
        id: 'c1', name: 'Test', office: 'Mayor', district: 'D1',
        state: 'CA', county: 'Los Angeles', bio: 'Bio', positions: { 'issue-1': 1 },
      }];

      const deps = makeDeps({
        cache: makeMockCache({
          getLocation: vi.fn().mockResolvedValue(location),
          getCandidates: vi.fn().mockResolvedValue(candidates),
        }),
      });

      const res = await handler(makeRequest('90210'), deps);
      expect(res.statusCode).toBe(200);
      const body = parseBody(res.body);
      expect(body.source).toBe('cache');
      expect(body.location).toEqual(location);
      expect(body.candidates).toEqual(candidates);
    });
  });

  describe('cache miss → API call', () => {
    it('calls Google Civic API and returns source "api"', async () => {
      const deps = makeDeps();
      const res = await handler(makeRequest('62701'), deps);
      expect(res.statusCode).toBe(200);
      const body = parseBody(res.body);
      expect(body.source).toBe('api');
      expect(body.location.city).toBe('Springfield');
      expect(body.candidates.length).toBe(1);
      expect(body.candidates[0].positionsInferred).toBe(true);
    });

    it('writes results to cache after API call', async () => {
      const cache = makeMockCache();
      const deps = makeDeps({ cache });
      await handler(makeRequest('62701'), deps);
      expect(cache.putLocation).toHaveBeenCalledWith('62701', expect.any(Object));
      expect(cache.putCandidates).toHaveBeenCalledWith('62701', expect.any(Array));
    });
  });

  describe('Google Civic API failure', () => {
    it('returns 502 when Google API throws', async () => {
      const deps = makeDeps({
        civicClient: makeMockCivicClient({
          getRepresentatives: vi.fn().mockRejectedValue(new Error('API down')),
        }),
      });
      const res = await handler(makeRequest('90210'), deps);
      expect(res.statusCode).toBe(502);
      expect(parseBody(res.body).message).toBe('Upstream civic data service is unavailable');
    });
  });

  describe('Bedrock inference failure', () => {
    it('returns candidate with all positions 0 on inference failure', async () => {
      const deps = makeDeps({
        positionInferrer: makeMockInferrer({
          inferPositions: vi.fn().mockRejectedValue(new Error('Bedrock down')),
        }),
      });
      const res = await handler(makeRequest('62701'), deps);
      expect(res.statusCode).toBe(200);
      const body = parseBody(res.body);
      const candidate = body.candidates[0];
      expect(candidate.positionsInferred).toBe(true);
      expect(candidate.positions['issue-1']).toBe(0);
      expect(candidate.positions['issue-2']).toBe(0);
    });
  });

  describe('CORS headers', () => {
    it('includes CORS headers on success', async () => {
      const res = await handler(makeRequest('90210'), makeDeps());
      expect(res.headers['Access-Control-Allow-Origin']).toBe('*');
      expect(res.headers['Content-Type']).toBe('application/json');
    });

    it('includes CORS headers on error', async () => {
      const res = await handler(makeRequest('bad'), makeDeps());
      expect(res.headers['Access-Control-Allow-Origin']).toBe('*');
    });
  });

  describe('response schema', () => {
    it('returns well-formed candidate objects', async () => {
      const res = await handler(makeRequest('62701'), makeDeps());
      const body = parseBody(res.body);
      const candidate = body.candidates[0];
      expect(candidate).toHaveProperty('id');
      expect(candidate).toHaveProperty('name');
      expect(candidate).toHaveProperty('office');
      expect(candidate).toHaveProperty('district');
      expect(candidate).toHaveProperty('state');
      expect(candidate).toHaveProperty('county');
      expect(candidate).toHaveProperty('bio');
      expect(candidate).toHaveProperty('positions');
    });
  });
});
