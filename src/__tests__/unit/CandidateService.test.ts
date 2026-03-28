import { describe, it, expect } from 'vitest';
import { fetchCivicData } from '../../services/CandidateService';

describe('CandidateService', () => {
  it('returns location and candidates for a known ZIP', async () => {
    const result = await fetchCivicData('90210');

    expect(result.location).toEqual({
      city: 'Beverly Hills',
      county: 'Los Angeles',
      state: 'CA',
    });
    expect(result.candidates.length).toBeGreaterThan(0);
    expect(result.isFallback).toBe(false);
  });

  it('returns data for NYC ZIP', async () => {
    const result = await fetchCivicData('10001');

    expect(result.location.state).toBe('NY');
    expect(result.candidates.length).toBeGreaterThan(0);
  });

  it('throws for unknown ZIP', async () => {
    await expect(fetchCivicData('99999')).rejects.toThrow(
      'ZIP code 99999 is not available yet',
    );
  });
});
