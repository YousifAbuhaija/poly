import type { CivicDataResult } from '../types';
import { loadCandidates, loadZipLookup } from './DataLoader';

/**
 * Loads civic data for a ZIP code from local JSON files.
 * Throws if the ZIP code isn't in the local dataset.
 */
export async function fetchCivicData(zipCode: string): Promise<CivicDataResult> {
  const zipLookup = loadZipLookup();
  const location = zipLookup[zipCode];

  if (!location) {
    throw new Error(`ZIP code ${zipCode} is not available yet. Try one of our demo ZIPs like 90210 or 10001.`);
  }

  const candidates = loadCandidates();

  return {
    location,
    candidates,
    isFallback: false,
  };
}
