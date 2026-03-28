const API_KEY = 'AIzaSyC-faliKoZ4ql0445jQejAvcKsyJcwjIx4';
const BASE_URL = 'https://www.googleapis.com/civicinfo/v2';

export interface CivicCandidate {
  name: string;
  party?: string;
  candidateUrl?: string;
  phone?: string;
  photoUrl?: string;
  email?: string;
  channels?: Array<{
    type: string;
    id: string;
  }>;
}

export interface CivicContest {
  office: string;
  district?: {
    name: string;
    scope: string;
  };
  candidates?: CivicCandidate[];
}

export interface VoterInfoResponse {
  election: {
    id: string;
    name: string;
    electionDay: string;
  };
  contests?: CivicContest[];
  pollingLocations?: any[];
  state?: any[];
}

/**
 * Fetches voter information including candidates for a given address
 */
export async function fetchVoterInfo(address: string): Promise<VoterInfoResponse | null> {
  try {
    const url = `https://civicinfo.googleapis.com/civicinfo/v2/voterinfo?key=${API_KEY}&address=${encodeURIComponent(address)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Google Civic API error:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch voter info:', error);
    return null;
  }
}

/**
 * Fetches list of available elections
 */
export async function fetchElections() {
  try {
    const url = `${BASE_URL}/elections?key=${API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Google Civic API error:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch elections:', error);
    return null;
  }
}

/**
 * Fetches representatives for a given address
 */
export async function fetchRepresentatives(address: string) {
  try {
    const url = `https://civicinfo.googleapis.com/civicinfo/v2/representatives?key=${API_KEY}&address=${encodeURIComponent(address)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Google Civic API error:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch representatives:', error);
    return null;
  }
}
