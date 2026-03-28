#!/usr/bin/env python3
"""
NY Board of Elections Scraper
Scrapes real politician data from NY Board of Elections website
"""

import requests
from bs4 import BeautifulSoup
import json
from pathlib import Path

# NY Board of Elections URL
NY_ELECTIONS_URL = "https://www.elections.ny.gov/ElectedOfficials.html"

def scrape_ny_politicians():
    """Scrape NY politicians from Board of Elections"""
    try:
        print("Fetching NY Board of Elections data...")
        response = requests.get(NY_ELECTIONS_URL, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        table = soup.find('table')
        
        if not table:
            print("✗ Could not find table on page")
            return []
        
        politicians = []
        rows = table.find_all('tr')[1:]  # Skip header
        
        for row in rows:
            cols = row.find_all('td')
            if len(cols) < 6:
                continue
            
            office = cols[0].text.strip()
            district = cols[1].text.strip()
            first_name = cols[2].text.strip()
            middle_name = cols[3].text.strip()
            last_name = cols[4].text.strip()
            suffix = cols[5].text.strip() if len(cols) > 5 else ''
            party = cols[6].text.strip() if len(cols) > 6 else ''
            
            # Build full name
            name_parts = [first_name, middle_name, last_name, suffix]
            full_name = ' '.join([p for p in name_parts if p])
            
            # Only include major offices
            if any(keyword in office for keyword in ['Governor', 'Senator', 'Representative', 'Mayor', 'Attorney']):
                politician = {
                    'name': full_name,
                    'office': office,
                    'district': district or 'Statewide',
                    'party': party,
                    'state': 'NY',
                    'county': 'New York'
                }
                politicians.append(politician)
                print(f"  ✓ Found {full_name} - {office}")
        
        return politicians
        
    except Exception as e:
        print(f"✗ Error scraping NY elections: {e}")
        return []

def infer_positions(party):
    """Infer political positions based on party"""
    if 'Democratic' in party:
        return {
            "issue-001": 1, "issue-002": 1, "issue-003": 1, "issue-004": 1, "issue-005": 1,
            "issue-006": -1, "issue-007": 1, "issue-008": 1, "issue-009": 1, "issue-010": 1
        }
    elif 'Republican' in party:
        return {
            "issue-001": -1, "issue-002": -1, "issue-003": -1, "issue-004": -1, "issue-005": -1,
            "issue-006": 1, "issue-007": -1, "issue-008": -1, "issue-009": -1, "issue-010": -1
        }
    else:
        return {
            "issue-001": 0, "issue-002": 0, "issue-003": 0, "issue-004": 0, "issue-005": 0,
            "issue-006": 0, "issue-007": 0, "issue-008": 0, "issue-009": 0, "issue-010": 0
        }

def generate_avatar_url(name):
    """Generate avatar URL for politician"""
    return f"https://ui-avatars.com/api/?name={name.replace(' ', '+')}&size=400&background=2c3e50&color=fff&bold=true&format=svg"

def main():
    print("Starting NY Board of Elections scraper...\n")
    
    # Scrape NY politicians
    ny_politicians = scrape_ny_politicians()
    
    if not ny_politicians:
        print("\n✗ No politicians found")
        return
    
    print(f"\nFound {len(ny_politicians)} NY politicians")
    
    # Convert to candidate format
    candidates = []
    for i, pol in enumerate(ny_politicians[:20]):  # Limit to top 20
        candidate = {
            "id": f"ny-{i+1}",
            "name": pol['name'],
            "office": pol['office'],
            "district": pol['district'],
            "state": pol['state'],
            "county": pol['county'],
            "bio": f"{pol['office']} representing {pol['district']}. Party: {pol['party']}",
            "photoUrl": generate_avatar_url(pol['name']),
            "positions": infer_positions(pol['party'])
        }
        candidates.append(candidate)
    
    # Save to file
    output_path = Path("../src/data/candidates.json")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(candidates, f, indent=2)
    
    print(f"\n✓ Saved {len(candidates)} candidates to {output_path}")
    print("\nTop candidates:")
    for c in candidates[:5]:
        print(f"  - {c['name']} ({c['office']})")
    
    print("\nDone!")

if __name__ == "__main__":
    main()
