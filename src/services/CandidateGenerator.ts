import type { Candidate, IssueScore, LocationResult } from '../types';
import { fetchVoterInfo, fetchRepresentatives } from './GoogleCivicAPI';

/**
 * Generates real candidates from Google Civic API based on user's location
 */
export async function generateRealCandidates(location: LocationResult): Promise<Candidate[]> {
  const candidates: Candidate[] = [];
  
  try {
    const address = `${location.city}, ${location.state}`;
    
    // Fetch upcoming election candidates
    const voterInfo = await fetchVoterInfo(address);
    
    // Fetch current representatives
    const representatives = await fetchRepresentatives(address);
    
    console.log('Voter Info Response:', voterInfo);
    console.log('Representatives Response:', representatives);
    
    // Process election candidates
    if (voterInfo?.contests) {
      voterInfo.contests.forEach((contest, contestIndex) => {
        if (!contest.candidates) return;
        
        contest.candidates.forEach((candidate, candidateIndex) => {
          candidates.push({
            id: `election-${contestIndex}-${candidateIndex}`,
            name: candidate.name,
            office: contest.office,
            district: contest.district?.name || 'At-Large',
            state: location.state,
            county: location.county,
            bio: `Candidate for ${contest.office}. ${candidate.party ? `Party: ${candidate.party}` : ''}`,
            photoUrl: candidate.photoUrl,
            positions: generateRandomPositions() // We'll need to manually map these or use AI
          });
        });
      });
    }
    
    // Process current representatives
    if (representatives?.officials) {
      representatives.officials.forEach((official: any, index: number) => {
        const office = representatives.offices?.[index];
        
        candidates.push({
          id: `rep-${index}`,
          name: official.name,
          office: office?.name || 'Representative',
          district: office?.divisionId?.split('/').pop() || 'At-Large',
          state: location.state,
          county: location.county,
          bio: `Current ${office?.name || 'Representative'}. ${official.party ? `Party: ${official.party}` : ''}`,
          photoUrl: official.photoUrl,
          positions: generateRandomPositions() // We'll need to manually map these or use AI
        });
      });
    }
    
    console.log('Generated candidates:', candidates);
    return candidates;
    
  } catch (error) {
    console.error('Failed to generate real candidates:', error);
    return [];
  }
}

/**
 * Generates random positions for now - in production you'd want to:
 * 1. Scrape voting records from congress.gov or state legislature sites
 * 2. Use an AI service to analyze candidate statements
 * 3. Manually curate positions for major candidates
 */
function generateRandomPositions(): { [issueId: string]: IssueScore } {
  const positions: { [issueId: string]: IssueScore } = {};
  const issueIds = [
    'issue-001', 'issue-002', 'issue-003', 'issue-004', 'issue-005',
    'issue-006', 'issue-007', 'issue-008', 'issue-009', 'issue-010'
  ];
  
  issueIds.forEach(id => {
    // Randomly assign positions for demo purposes
    const rand = Math.random();
    if (rand < 0.4) {
      positions[id] = 1; // For
    } else if (rand < 0.8) {
      positions[id] = -1; // Against
    } else {
      positions[id] = 0; // No position
    }
  });
  
  return positions;
}

/**
 * Maps party affiliation to likely positions on issues
 * This is a simplified heuristic - real positions vary by candidate
 */
export function inferPositionsFromParty(party?: string): { [issueId: string]: IssueScore } {
  const positions: { [issueId: string]: IssueScore } = {};
  
  if (!party) return generateRandomPositions();
  
  const partyLower = party.toLowerCase();
  
  // Democratic-leaning positions
  if (partyLower.includes('democrat')) {
    return {
      'issue-001': 1,  // Healthcare funding
      'issue-002': 1,  // College tuition
      'issue-003': 1,  // Tax the rich
      'issue-004': 1,  // Rent control
      'issue-005': 1,  // Environmental regulations
      'issue-006': -1, // Police funding redirect
      'issue-007': 1,  // Electoral college abolish
      'issue-008': 1,  // Gun restrictions
      'issue-009': 1,  // Immigrant healthcare
      'issue-010': 1   // Same sex marriage
    };
  }
  
  // Republican-leaning positions
  if (partyLower.includes('republican')) {
    return {
      'issue-001': -1, // Healthcare funding
      'issue-002': -1, // College tuition
      'issue-003': -1, // Tax the rich
      'issue-004': -1, // Rent control
      'issue-005': -1, // Environmental regulations
      'issue-006': 1,  // Police funding redirect
      'issue-007': -1, // Electoral college abolish
      'issue-008': -1, // Gun restrictions
      'issue-009': -1, // Immigrant healthcare
      'issue-010': -1  // Same sex marriage
    };
  }
  
  // Libertarian or other parties
  return generateRandomPositions();
}
