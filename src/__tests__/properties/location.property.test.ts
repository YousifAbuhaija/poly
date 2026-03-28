import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { resolve, formatLocation } from '../../engines/LocationResolver';
import { loadZipLookup } from '../../services/DataLoader';

const zipLookup = loadZipLookup();
const validZips = Object.keys(zipLookup);

// Feature: poly-mvp, Property 1: ZIP Resolution Round Trip
describe('Property 1: ZIP Resolution Round Trip', () => {
  it('resolving a valid ZIP returns non-empty city/county/state and correct formatted string', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...validZips),
        (zip) => {
          const result = resolve(zip);
          expect(result).not.toBeNull();
          expect(result!.city.length).toBeGreaterThan(0);
          expect(result!.county.length).toBeGreaterThan(0);
          expect(result!.state.length).toBeGreaterThan(0);

          const formatted = formatLocation(result!);
          expect(formatted).toBe(
            `Showing elections for: ${result!.city}, ${result!.state} (${result!.county} County)`
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: poly-mvp, Property 2: Invalid ZIP Rejection
describe('Property 2: Invalid ZIP Rejection', () => {
  it('non-5-digit strings are rejected', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => !/^\d{5}$/.test(s)),
        (input) => {
          expect(resolve(input)).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('5-digit strings not in lookup are rejected', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^\d{5}$/).filter(s => !(s in zipLookup)),
        (zip) => {
          expect(resolve(zip)).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });
});
