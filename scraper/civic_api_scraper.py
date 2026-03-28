#!/usr/bin/env python3
"""
Google Civic Information API Scraper
Fetches real politician data including photos from Google Civic API
"""

import requests
import json
from pathlib import Path

API_KEY = "AIzaSyC-faliKoZ4ql0445jQejAvcKsyJcwjIx4"
BASE_URL = "https://civicinfo.googleapis.com/civicinfo/v2"

# ZIP codes to fetch data for
ZIP_CODES = {
    "90210": {"city": "Beverly Hills", "state": "CA", "county": "Los Angeles"},
    "10001": {"city": "New York", "state": "NY", "county": "New York"},
    "60601": {"city": "Chicago", "state": "IL", "county": "Cook"},
    "20001": {"city": "Washington", "state": "DC", "county": "District of Columbia"},
    "02101": {"city": "Boston", "state": "MA", "county": "Suffolk"},
    "33101": {"city": "Miami", "state": "FL", "county": "Miami-Dade"},
    "78701": {"city": "Austin", "state": "TX", "county": "Travis"},
    "98101": {"city": "Seattle", "state": "WA", "county": "King"},
}

def fetch_representatives(address):
    """Fetch representatives for a given address"""
    try:
        url = "https://civicinfo.googleapis.com/civicinfo/v2/representatives"
        params = {
            "key": API_KEY,
            "address": address,
            "includeOffices": "true",
            "levels": ["country", "administrativeArea1", "locality"],
            "roles": ["legislatorUpperBody", "legislatorLowerBody", "headOfGovernment"]
        }
        
        print(f"Fetching representatives for {address}...")
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        return response.json()
    except Exception as e:
        print(f"✗ Error fetching representatives: {e}")
        return None

def fetch_voter_info(address):
    """Fetch voter info including election candidates"""
    try:
        url = "https://civicinfo.googleapis.com/civicinfo/v2/voterinfo"
        params = {
            "key": API_KEY,
            "address": address
        }
        
        print(f"Fetching voter info for {address}...")
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 404:
            print(f"  No upcoming elections found")
            return None
            
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"  No voter info available: {e}")
        return None

def parse_candidates(zip_code, location_info):
    """Parse API response into candidate objects"""
    candidates = []
    
    # Fetch both representatives and voter info
    address = f"{zip_code}, USA"
    reps_data = fetch_representatives(address)
    voter_data = fetch_voter_info(address)
    
    # Parse current representatives
    if reps_data and 'officials' in reps_data:
        offices = reps_data.get('offices', [])
        officials = reps_data.get('officials', [])
        
        for office in offices:
            office_name = office.get('name', '')
            official_indices = office.get('officialIndices', [])
            
            for idx in official_indices:
                if idx < len(officials):
                    official = officials[idx]
                    
                    # Infer positions based on party
                    party = official.get('party', '')
                    positions = infer_positions(party)
                    
                    candidate = {
                        "id": f"{zip_code}-{len(candidates)}",
                        "name": official.get('name', 'Unknown'),
                        "office": office_name,
                        "district": office.get('divisionId', '').split('/')[-1],
                        "state": location_info['state'],
                        "county": location_info['county'],
                        "bio": f"Current {office_name}. Party: {party}",
                        "photoUrl": official.get('photoUrl', ''),
                        "positions": positions
                    }
                    
                    candidates.append(candidate)
                    print(f"  ✓ Added {candidate['name']} - {office_name}")
    
    # Parse election candidates
    if voter_data and 'contests' in voter_data:
        for contest in voter_data['contests']:
            office_name = contest.get('office', 'Unknown Office')
            contest_candidates = contest.get('candidates', [])
            
            for candidate_data in contest_candidates:
                party = candidate_data.get('party', '')
                positions = infer_positions(party)
                
                candidate = {
                    "id": f"{zip_code}-election-{len(candidates)}",
                    "name": candidate_data.get('name', 'Unknown'),
                    "office": office_name,
                    "district": contest.get('district', {}).get('name', 'At-Large'),
                    "state": location_info['state'],
                    "county": location_info['county'],
                    "bio": f"Candidate for {office_name}. Party: {party}",
                    "photoUrl": candidate_data.get('photoUrl', ''),
                    "positions": positions
                }
                
                candidates.append(candidate)
                print(f"  ✓ Added {candidate['name']} - {office_name} (Candidate)")
    
    return candidates

def infer_positions(party):
    """Infer political positions based on party affiliation"""
    party_lower = party.lower()
    
    if 'democrat' in party_lower:
        return {
            "issue-001": 1,  "issue-002": 1,  "issue-003": 1,  "issue-004": 1,  "issue-005": 1,
            "issue-006": -1, "issue-007": 1,  "issue-008": 1,  "issue-009": 1,  "issue-010": 1
        }
    elif 'republican' in party_lower:
        return {
            "issue-001": -1, "issue-002": -1, "issue-003": -1, "issue-004": -1, "issue-005": -1,
            "issue-006": 1,  "issue-007": -1, "issue-008": -1, "issue-009": -1, "issue-010": -1
        }
    else:
        # Independent/other - mixed positions
        return {
            "issue-001": 0,  "issue-002": 1,  "issue-003": 0,  "issue-004": 1,  "issue-005": 1,
            "issue-006": 0,  "issue-007": 0,  "issue-008": 0,  "issue-009": 0,  "issue-010": 1
        }

def main():
    print("Starting Google Civic API scraper...\n")
    
    all_candidates = []
    
    for zip_code, location in ZIP_CODES.items():
        print(f"\n{'='*60}")
        print(f"Processing {location['city']}, {location['state']} ({zip_code})")
        print('='*60)
        
        candidates = parse_candidates(zip_code, location)
        all_candidates.extend(candidates)
        
        print(f"Found {len(candidates)} politicians for {location['city']}")
    
    print(f"\n{'='*60}")
    print(f"Total politicians found: {len(all_candidates)}")
    print('='*60)
    
    # Save to candidates.json
    output_path = Path(__file__).parent.parent / "src" / "data" / "candidates.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(all_candidates, f, indent=2)
    
    print(f"\n✓ Saved {len(all_candidates)} candidates to {output_path}")
    
    # Print summary
    print("\nSummary:")
    with_photos = sum(1 for c in all_candidates if c['photoUrl'])
    print(f"  - Candidates with photos: {with_photos}/{len(all_candidates)}")
    print(f"  - Candidates without photos: {len(all_candidates) - with_photos}")
    
    print("\nDone!")

if __name__ == "__main__":
    main()
