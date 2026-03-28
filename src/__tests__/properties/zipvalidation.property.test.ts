// Feature: dynamic-civic-data, Property 1: Valid ZIP acceptance
// Feature: dynamic-civic-data, Property 2: Invalid ZIP rejection

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  isValidZipCode,
  handler,
  type LambdaDeps,
  type CivicDataRequest,
} from '../../services/CivicDataLambda';

/**
 * Validates: Requirements 1.1
 *
 * For any string that is exactly 5 decimal digits, the validator should accept it.
 */
describe('Property 1: Valid ZIP acceptance', () => {
  it('accepts any 5-digit numeric string', () => {
    const fiveDigitZipArb = fc
      .integer({ min: 0, max: 99999 })
      .map((n) => n.toString().padStart(5, '0'));

    fc.assert(
      fc.property(fiveDigitZipArb, (zip: string) => {
        expect(isValidZipCode(zip)).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});

/**
 * Validates: Requirements 1.4
 *
 * For any string that is NOT exactly 5 decimal digits, the validator should reject it
 * and the handler should return a 400 status code.
 */
// Feature: dynamic-civic-data, Property 2: Invalid ZIP rejection
describe('Property 2: Invalid ZIP rejection', () => {
  const invalidZipArb = fc
    .string()
    .filter((s) => !/^\d{5}$/.test(s));

  // Dummy deps — handler returns 400 before touching any of these
  const dummyDeps: LambdaDeps = {
    cache: {
      getLocation: async () => null,
      getCandidates: async () => null,
      putLocation: async () => {},
      putCandidates: async () => {},
    },
    civicClient: {
      getRepresentatives: async () => {
        throw new Error('should not be called');
      },
    },
    positionInferrer: {
      inferPositions: async () => {
        throw new Error('should not be called');
      },
    },
    issues: [],
  };

  it('isValidZipCode rejects any non-5-digit string', () => {
    fc.assert(
      fc.property(invalidZipArb, (zip: string) => {
        expect(isValidZipCode(zip)).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  it('handler returns 400 for any non-5-digit ZIP', async () => {
    await fc.assert(
      fc.asyncProperty(invalidZipArb, async (zip: string) => {
        const event: CivicDataRequest = {
          pathParameters: { zipCode: zip },
        };
        const response = await handler(event, dummyDeps);
        expect(response.statusCode).toBe(400);

        const body = JSON.parse(response.body);
        expect(body.error).toBe('Bad Request');
        expect(body.message).toBe('ZIP code must be exactly 5 digits');
      }),
      { numRuns: 100 },
    );
  });
});
