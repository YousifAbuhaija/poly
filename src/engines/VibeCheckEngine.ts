import type { IssueStatement, IssueScore, IssueProfile, LocationResult } from '../types';
import { loadIssues } from '../services/DataLoader';

let issues: IssueStatement[] | null = null;
let profile: IssueProfile = Object.create(null);

export function getIssues(location?: LocationResult | null): IssueStatement[] {
  if (!issues) {
    issues = loadIssues(location);
  }
  return issues;
}

export function recordResponse(issueId: string, score: IssueScore): void {
  profile[issueId] = score;
}

export function getProfile(): IssueProfile {
  return { ...profile };
}

export function getRemainingCount(): number {
  const total = getIssues().length;
  const answered = Object.keys(profile).length;
  return total - answered;
}

export function isComplete(): boolean {
  return getRemainingCount() === 0 && getIssues().length > 0;
}

export function reset(): void {
  issues = null;
  profile = Object.create(null);
}
