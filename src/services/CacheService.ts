import type { LocationResult, Candidate } from '../types';
import type { CacheService } from './CivicDataLambda';

// --- TTL Constants (exported for property tests) ---

/** Location cache TTL: 30 days in seconds */
export const LOCATION_TTL_SECONDS = 30 * 24 * 60 * 60;

/** Candidate cache TTL: 24 hours in seconds */
export const CANDIDATES_TTL_SECONDS = 24 * 60 * 60;

// --- Sort key constants ---

export const SK_LOCATION = 'LOCATION';
export const SK_CANDIDATES = 'CANDIDATES';

// --- DynamoDB DocumentClient abstraction ---

export interface CacheItem {
  PK: string;
  SK: string;
  data: unknown;
  ttl: number;
}

export interface DocumentClient {
  get(params: { TableName: string; Key: { PK: string; SK: string } }): Promise<{ Item?: CacheItem }>;
  put(params: { TableName: string; Item: CacheItem }): Promise<void>;
}

// --- Factory ---

export function createCacheService(
  client: DocumentClient,
  tableName: string,
  now: () => number = () => Math.floor(Date.now() / 1000),
): CacheService {
  async function getLocation(zipCode: string): Promise<LocationResult | null> {
    const result = await client.get({
      TableName: tableName,
      Key: { PK: zipCode, SK: SK_LOCATION },
    });

    if (!result.Item) return null;
    if (result.Item.ttl <= now()) return null;

    return result.Item.data as LocationResult;
  }

  async function getCandidates(zipCode: string): Promise<Candidate[] | null> {
    const result = await client.get({
      TableName: tableName,
      Key: { PK: zipCode, SK: SK_CANDIDATES },
    });

    if (!result.Item) return null;
    if (result.Item.ttl <= now()) return null;

    return result.Item.data as Candidate[];
  }

  async function putLocation(zipCode: string, location: LocationResult): Promise<void> {
    await client.put({
      TableName: tableName,
      Item: {
        PK: zipCode,
        SK: SK_LOCATION,
        data: location,
        ttl: now() + LOCATION_TTL_SECONDS,
      },
    });
  }

  async function putCandidates(zipCode: string, candidates: Candidate[]): Promise<void> {
    await client.put({
      TableName: tableName,
      Item: {
        PK: zipCode,
        SK: SK_CANDIDATES,
        data: candidates,
        ttl: now() + CANDIDATES_TTL_SECONDS,
      },
    });
  }

  return { getLocation, getCandidates, putLocation, putCandidates };
}
