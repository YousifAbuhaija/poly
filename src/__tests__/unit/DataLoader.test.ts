import { describe, it, expect } from 'vitest';
import {
  loadCandidates,
  loadIssues,
  loadElections,
  loadPolicies,
  loadZipLookup,
} from '../../services/DataLoader';

describe('DataLoader', () => {
  it('loadCandidates returns an array of candidates with expected shape', () => {
    const candidates = loadCandidates();
    expect(Array.isArray(candidates)).toBe(true);
    expect(candidates.length).toBeGreaterThan(0);
    const first = candidates[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('office');
    expect(first).toHaveProperty('positions');
  });

  it('loadIssues returns an array of issue statements with expected shape', () => {
    const issues = loadIssues();
    expect(Array.isArray(issues)).toBe(true);
    expect(issues.length).toBeGreaterThan(0);
    const first = issues[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('text');
    expect(first).toHaveProperty('category');
  });

  it('loadElections returns an array of elections with expected shape', () => {
    const elections = loadElections();
    expect(Array.isArray(elections)).toBe(true);
    expect(elections.length).toBeGreaterThan(0);
    const first = elections[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('date');
    expect(first).toHaveProperty('offices');
  });

  it('loadPolicies returns an array of policies with expected shape', () => {
    const policies = loadPolicies();
    expect(Array.isArray(policies)).toBe(true);
    expect(policies.length).toBeGreaterThan(0);
    const first = policies[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('title');
    expect(first).toHaveProperty('text');
    expect(first).toHaveProperty('category');
  });

  it('loadZipLookup returns a record with LocationResult values', () => {
    const lookup = loadZipLookup();
    expect(typeof lookup).toBe('object');
    expect(Object.keys(lookup).length).toBeGreaterThan(0);
    const entry = lookup['90210'];
    expect(entry).toBeDefined();
    expect(entry.city).toBe('Beverly Hills');
    expect(entry.county).toBe('Los Angeles');
    expect(entry.state).toBe('CA');
  });
});
