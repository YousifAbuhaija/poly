import type {
  LocationResult,
  Candidate,
  CivicApiSuccessResponse,
  CivicApiErrorResponse,
} from '../types';

// --- Dependency interfaces (implemented in later tasks) ---

export interface CacheService {
  getLocation(zipCode: string): Promise<LocationResult | null>;
  getCandidates(zipCode: string): Promise<Candidate[] | null>;
  putLocation(zipCode: string, location: LocationResult): Promise<void>;
  putCandidates(zipCode: string, candidates: Candidate[]): Promise<void>;
}

export interface GoogleCivicClient {
  getRepresentatives(zipCode: string): Promise<{
    location: LocationResult;
    officials: GoogleOfficial[];
  }>;
}

export interface GoogleOfficial {
  name: string;
  office: string;
  district: string;
  party?: string;
  urls?: string[];
  channels?: { type: string; id: string }[];
}

export interface PositionInferrer {
  inferPositions(
    candidate: { name: string; office: string; bio: string },
    issues: { id: string; text: string }[],
  ): Promise<{ [issueId: string]: 1 | -1 | 0 }>;
}

// --- Request / Response types ---

export interface CivicDataRequest {
  pathParameters: { zipCode: string };
  httpMethod?: string;
}

export interface LambdaResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

// --- Validation ---

const ZIP_REGEX = /^\d{5}$/;

export function isValidZipCode(zip: string): boolean {
  return ZIP_REGEX.test(zip);
}

// --- Dependencies container ---

export interface LambdaDeps {
  cache: CacheService;
  civicClient: GoogleCivicClient;
  positionInferrer: PositionInferrer;
  issues: { id: string; text: string }[];
}

// --- Helper to build responses ---

const CORS_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResponse(statusCode: number, body: unknown): LambdaResponse {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

function errorResponse(
  statusCode: number,
  error: string,
  message: string,
): LambdaResponse {
  const body: CivicApiErrorResponse = { statusCode, error, message };
  return jsonResponse(statusCode, body);
}

// --- Convert GoogleOfficial → Candidate stub (positions filled later) ---

function officialToCandidate(
  official: GoogleOfficial,
  location: LocationResult,
): Candidate {
  return {
    id: `${official.name.toLowerCase().replace(/\s+/g, '-')}-${official.office.toLowerCase().replace(/\s+/g, '-')}`,
    name: official.name,
    office: official.office,
    district: official.district,
    state: location.state,
    county: location.county,
    bio: '',
    positions: {},
  };
}

// --- Lambda handler ---

export async function handler(
  event: CivicDataRequest,
  deps: LambdaDeps,
): Promise<LambdaResponse> {
  // Method validation
  const method = (event.httpMethod ?? 'GET').toUpperCase();
  if (method !== 'GET') {
    return errorResponse(
      405,
      'Method Not Allowed',
      'Only GET requests are supported',
    );
  }

  // ZIP code validation
  const zipCode = event.pathParameters?.zipCode ?? '';
  if (!isValidZipCode(zipCode)) {
    return errorResponse(
      400,
      'Bad Request',
      'ZIP code must be exactly 5 digits',
    );
  }

  try {
    // Check cache first
    const [cachedLocation, cachedCandidates] = await Promise.all([
      deps.cache.getLocation(zipCode).catch(() => null),
      deps.cache.getCandidates(zipCode).catch(() => null),
    ]);

    if (cachedLocation && cachedCandidates) {
      const body: CivicApiSuccessResponse = {
        location: cachedLocation,
        candidates: cachedCandidates,
        source: 'cache',
      };
      return jsonResponse(200, body);
    }

    // Cache miss — call Google Civic API
    let location: LocationResult;
    let officials: GoogleOfficial[];

    try {
      const result = await deps.civicClient.getRepresentatives(zipCode);
      location = result.location;
      officials = result.officials;
    } catch {
      return errorResponse(
        502,
        'Bad Gateway',
        'Upstream civic data service is unavailable',
      );
    }

    // Convert officials to candidates and infer positions
    const candidates: Candidate[] = await Promise.all(
      officials.map(async (official) => {
        const candidate = officialToCandidate(official, location);
        try {
          const positions = await deps.positionInferrer.inferPositions(
            { name: candidate.name, office: candidate.office, bio: candidate.bio },
            deps.issues,
          );
          return { ...candidate, positions, positionsInferred: true };
        } catch {
          // Bedrock failure: all positions 0
          const fallbackPositions: { [issueId: string]: 0 } = {};
          for (const issue of deps.issues) {
            fallbackPositions[issue.id] = 0;
          }
          return { ...candidate, positions: fallbackPositions, positionsInferred: true };
        }
      }),
    );

    // Write to cache (fire-and-forget, don't block response)
    await Promise.all([
      deps.cache.putLocation(zipCode, location).catch(() => {}),
      deps.cache.putCandidates(zipCode, candidates).catch(() => {}),
    ]);

    const body: CivicApiSuccessResponse = {
      location,
      candidates,
      source: 'api',
    };
    return jsonResponse(200, body);
  } catch {
    return errorResponse(
      500,
      'Internal Server Error',
      'An unexpected error occurred',
    );
  }
}
