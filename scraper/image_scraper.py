#!/usr/bin/env python3
"""
Politician Image Scraper
Downloads official photos of politicians and saves them locally
Last updated: March 2026
"""

import requests
import json
import os
from pathlib import Path
from datetime import datetime

# Create images directory
IMAGES_DIR = Path("public/politicians")
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

# Politician image sources (official government/Wikipedia Commons URLs)
# Updated for 2026 - current officeholders as of March 2026
POLITICIAN_IMAGES = {
    # California
    "Karen Bass": "https://www.congress.gov/img/member/b001270_200.jpg",
    "Rick Caruso": "https://upload.wikimedia.org/wikipedia/commons/8/8f/Rick_Caruso_in_2022.jpg",
    
    # New York
    "Zohran Mamdani": "https://council.nyc.gov/district-36/wp-content/uploads/sites/63/2022/01/Mamdani-Headshot-scaled.jpg",
    "Eric Adams": "https://www1.nyc.gov/assets/home/images/press_release/2022/January/pr001-22.jpg",
    "Alexandria Ocasio-Cortez": "https://ocasio-cortez.house.gov/sites/evo-subsites/ocasio-cortez.house.gov/files/evo-media-image/ocasio-cortez-official.jpg",
    
    # Illinois
    "Brandon Johnson": "https://www.chicago.gov/content/dam/city/depts/mayor/Press%20Room/Photos/2023/May/Mayor%20Brandon%20Johnson%20Official%20Photo.jpg",
    
    # DC
    "Muriel Bowser": "https://mayor.dc.gov/sites/default/files/dc/sites/mayormb/page_content/attachments/Mayor%20Bowser%20Official%20Photo.jpg",
    
    # Massachusetts
    "Michelle Wu": "https://www.boston.gov/sites/default/files/img/mayor/mayor-michelle-wu-official-photo.jpg",
    
    # Florida
    "Francis Suarez": "https://www.miamigov.com/files/sharedassets/public/v/1/mayor/images/mayor-francis-suarez.jpg",
    
    # Texas
    "Kirk Watson": "https://www.austintexas.gov/sites/default/files/images/Mayor_Kirk_Watson.jpg",
    
    # Washington
    "Bruce Harrell": "https://www.seattle.gov/images/Mayor/bruce-harrell-official.jpg"
}

# Fallback to UI Avatars if download fails
def get_fallback_url(name):
    """Generate fallback avatar URL"""
    return f"https://ui-avatars.com/api/?name={name.replace(' ', '+')}&size=400&background=416165&color=D9DBF1&bold=true"

def download_image(name, url):
    """Download image from URL and save locally"""
    try:
        print(f"Downloading {name}...")
        
        # Set headers to mimic browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Create safe filename
        filename = name.lower().replace(" ", "-") + ".jpg"
        filepath = IMAGES_DIR / filename
        
        # Save image
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        print(f"✓ Saved {filename}")
        return f"/politicians/{filename}"
        
    except Exception as e:
        print(f"✗ Failed to download {name}: {e}")
        print(f"  Using fallback avatar for {name}")
        return get_fallback_url(name)

def update_candidates_json(image_map):
    """Update candidates.json with local image paths"""
    try:
        # Read current candidates
        with open('src/data/candidates.json', 'r') as f:
            candidates = json.load(f)
        
        # Update photo URLs
        for candidate in candidates:
            name = candidate['name']
            if name in image_map and image_map[name]:
                candidate['photoUrl'] = image_map[name]
                print(f"Updated {name} in candidates.json")
        
        # Write back
        with open('src/data/candidates.json', 'w') as f:
            json.dump(candidates, f, indent=2)
        
        print("\n✓ Updated candidates.json")
        
    except Exception as e:
        print(f"✗ Failed to update candidates.json: {e}")

def main():
    print("Starting politician image scraper...\n")
    
    image_map = {}
    
    # Download all images
    for name, url in POLITICIAN_IMAGES.items():
        local_path = download_image(name, url)
        if local_path:
            image_map[name] = local_path
    
    print(f"\nDownloaded {len(image_map)}/{len(POLITICIAN_IMAGES)} images")
    
    # Update candidates.json
    if image_map:
        update_candidates_json(image_map)
    
    print("\nDone!")

if __name__ == "__main__":
    main()
