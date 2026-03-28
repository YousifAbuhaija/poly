import type { LocationResult } from '../types';
import { loadZipLookup } from '../services/DataLoader';

const ZIP_REGEX = /^\d{5}$/;

export function isValidZip(zipCode: string): boolean {
  return ZIP_REGEX.test(zipCode);
}

export function resolve(zipCode: string): LocationResult | null {
  if (!isValidZip(zipCode)) return null;
  const lookup = loadZipLookup();
  return lookup[zipCode] ?? null;
}

export function formatLocation(location: LocationResult): string {
  return `Showing elections for: ${location.city}, ${location.state} (${location.county} County)`;
}
