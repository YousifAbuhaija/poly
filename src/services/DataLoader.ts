import type { Candidate, IssueStatement, Election, Policy, LocationResult } from '../types';

import candidatesData from '../data/candidates.json';
import issuesData from '../data/issues.json';
import electionsData from '../data/elections.json';
import policiesData from '../data/samplePolicies.json';
import zipLookupData from '../data/zipLookup.json';

export function loadCandidates(): Candidate[] {
  try {
    return candidatesData as Candidate[];
  } catch (error) {
    throw new Error(`Failed to load candidates.json: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function loadIssues(): IssueStatement[] {
  try {
    return issuesData as IssueStatement[];
  } catch (error) {
    throw new Error(`Failed to load issues.json: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function loadElections(): Election[] {
  try {
    return electionsData as Election[];
  } catch (error) {
    throw new Error(`Failed to load elections.json: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function loadPolicies(): Policy[] {
  try {
    return policiesData as Policy[];
  } catch (error) {
    throw new Error(`Failed to load samplePolicies.json: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function loadZipLookup(): Record<string, LocationResult> {
  try {
    return zipLookupData as Record<string, LocationResult>;
  } catch (error) {
    throw new Error(`Failed to load zipLookup.json: ${error instanceof Error ? error.message : String(error)}`);
  }
}
