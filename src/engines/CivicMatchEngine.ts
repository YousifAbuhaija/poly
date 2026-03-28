import type { IssueProfile, Candidate, MatchResult, LocationResult } from '../types';
import { loadCandidates } from '../services/DataLoader';

/**
 * Computes candidate match results based on the user's issue profile and location.
 * - Filters candidates by state and county matching the user's location
 * - Computes match percentage excluding skipped issues (score 0)
 * - Returns results sorted by matchPercentage descending
 *
 * @param profile - The user's issue profile
 * @param location - The user's resolved location
 * @param candidatesOverride - Optional candidates array; if provided, used instead of loadCandidates()
 */
export function computeMatches(
  profile: IssueProfile,
  location: LocationResult,
  candidatesOverride?: Candidate[],
): MatchResult[] {
  const candidates = candidatesOverride ?? loadCandidates();

  // Filter candidates by location (case-insensitive)
  const localCandidates = candidates.filter(
    (c) =>
      c.state.toLowerCase() === location.state.toLowerCase() &&
      c.county.toLowerCase() === location.county.toLowerCase(),
  );

  return localCandidates
    .map((candidate) => buildMatchResult(candidate, profile))
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
}

function buildMatchResult(candidate: Candidate, profile: IssueProfile): MatchResult {
  const agreements: string[] = [];
  const disagreements: string[] = [];
  let answered = 0;
  let matching = 0;

  for (const [issueId, userScore] of Object.entries(profile)) {
    // Skip issues the user didn't answer
    if (userScore === 0) continue;

    const candidateScore = candidate.positions[issueId];
    // Only count issues where the candidate also has a position
    if (candidateScore === undefined || candidateScore === 0) continue;

    answered++;

    if (userScore === candidateScore) {
      matching++;
      agreements.push(issueId);
    } else {
      disagreements.push(issueId);
    }
  }

  const matchPercentage = answered > 0 ? Math.round((matching / answered) * 100) : 0;

  return {
    candidate,
    matchPercentage,
    agreements: agreements.slice(0, 3),
    disagreements: disagreements.slice(0, 2),
  };
}
