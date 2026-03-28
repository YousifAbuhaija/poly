import type { Candidate, IssueStatement, Election, Policy, LocationResult } from '../types';
import { fetchVoterInfo, fetchRepresentatives } from './GoogleCivicAPI';
import { generateRealCandidates, inferPositionsFromParty } from './CandidateGenerator';

import candidatesData from '../data/candidates.json';
import issuesData from '../data/issues.json';
import electionsData from '../data/elections.json';
import policiesData from '../data/samplePolicies.json';
import zipLookupData from '../data/zipLookup.json';

/**
 * Loads real candidates from Google Civic API based on location
 */
export async function loadRealCandidates(location: LocationResult): Promise<Candidate[]> {
  try {
    console.log('Loading real candidates for:', location);
    const realCandidates = await generateRealCandidates(location);
    
    if (realCandidates.length > 0) {
      console.log('Found real candidates:', realCandidates.length);
      return realCandidates;
    }
    
    // Fallback to mock data if no real candidates found
    console.log('No real candidates found, using mock data');
    return candidatesData as Candidate[];
  } catch (error) {
    console.error('Failed to load real candidates:', error);
    return candidatesData as Candidate[];
  }
}

/**
 * Loads candidates and enriches them with real photos from Google Civic API
 */
export async function loadCandidatesWithPhotos(location: LocationResult): Promise<Candidate[]> {
  try {
    const baseCandidates = candidatesData as Candidate[];
    
    console.log('Fetching candidate photos for:', location);
    
    // Try to fetch real candidate data from Google Civic API
    const address = `${location.city}, ${location.state}`;
    const voterInfo = await fetchVoterInfo(address);
    const representatives = await fetchRepresentatives(address);
    
    console.log('Voter info:', voterInfo);
    console.log('Representatives:', representatives);
    
    // Create a map of candidate names to photo URLs
    const photoMap = new Map<string, string>();
    
    // Extract photos from voter info (upcoming elections)
    if (voterInfo?.contests) {
      voterInfo.contests.forEach(contest => {
        contest.candidates?.forEach(candidate => {
          if (candidate.photoUrl) {
            console.log('Found photo for:', candidate.name, candidate.photoUrl);
            photoMap.set(candidate.name.toLowerCase(), candidate.photoUrl);
          }
        });
      });
    }
    
    // Extract photos from representatives (current officials)
    if (representatives?.officials) {
      representatives.officials.forEach((official: any) => {
        if (official.photoUrl) {
          console.log('Found photo for official:', official.name, official.photoUrl);
          photoMap.set(official.name.toLowerCase(), official.photoUrl);
        }
      });
    }
    
    console.log('Photo map:', photoMap);
    
    // Enrich candidates with photos
    return baseCandidates.map(candidate => ({
      ...candidate,
      photoUrl: photoMap.get(candidate.name.toLowerCase()) || candidate.photoUrl
    }));
  } catch (error) {
    console.error('Failed to load candidates with photos:', error);
    return candidatesData as Candidate[];
  }
}

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
