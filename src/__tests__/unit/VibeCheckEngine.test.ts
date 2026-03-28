import { describe, it, expect, beforeEach } from 'vitest';
import {
  getIssues,
  recordResponse,
  getProfile,
  getRemainingCount,
  isComplete,
  reset,
} from '../../engines/VibeCheckEngine';

describe('VibeCheckEngine', () => {
  beforeEach(() => {
    reset();
  });

  it('loads issues from issues.json', () => {
    const issues = getIssues();
    expect(issues.length).toBeGreaterThan(0);
    expect(issues[0]).toHaveProperty('id');
    expect(issues[0]).toHaveProperty('text');
    expect(issues[0]).toHaveProperty('category');
  });

  it('returns the same issues on repeated calls', () => {
    const first = getIssues();
    const second = getIssues();
    expect(first).toBe(second);
  });

  it('starts with an empty profile', () => {
    expect(getProfile()).toEqual({});
  });

  it('records an agree response (1)', () => {
    recordResponse('issue-001', 1);
    expect(getProfile()['issue-001']).toBe(1);
  });

  it('records a disagree response (-1)', () => {
    recordResponse('issue-002', -1);
    expect(getProfile()['issue-002']).toBe(-1);
  });

  it('records a skip response (0)', () => {
    recordResponse('issue-003', 0);
    expect(getProfile()['issue-003']).toBe(0);
  });

  it('overwrites a previous response for the same issue', () => {
    recordResponse('issue-001', 1);
    recordResponse('issue-001', -1);
    expect(getProfile()['issue-001']).toBe(-1);
  });

  it('returns a copy of the profile (not a reference)', () => {
    recordResponse('issue-001', 1);
    const p = getProfile();
    p['issue-999'] = 0;
    expect(getProfile()['issue-999']).toBeUndefined();
  });

  it('getRemainingCount equals total issues initially', () => {
    const total = getIssues().length;
    expect(getRemainingCount()).toBe(total);
  });

  it('getRemainingCount decreases as responses are recorded', () => {
    const total = getIssues().length;
    recordResponse('issue-001', 1);
    expect(getRemainingCount()).toBe(total - 1);
  });

  it('isComplete returns false when not all issues answered', () => {
    recordResponse('issue-001', 1);
    expect(isComplete()).toBe(false);
  });

  it('isComplete returns true when all issues are answered', () => {
    const issues = getIssues();
    issues.forEach((issue) => recordResponse(issue.id, 1));
    expect(isComplete()).toBe(true);
  });

  it('reset clears profile and cached issues', () => {
    recordResponse('issue-001', 1);
    reset();
    expect(getProfile()).toEqual({});
    expect(getRemainingCount()).toBe(getIssues().length);
  });
});
