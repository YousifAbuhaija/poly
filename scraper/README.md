# Politician Image Scraper

This script downloads official photos of politicians and updates the candidates.json file.

## Setup

1. Install Python 3.8+
2. Install dependencies:
   ```bash
   cd scraper
   pip install -r requirements.txt
   ```

## Usage

Run the scraper from the project root:

```bash
python scraper/image_scraper.py
```

This will:
1. Download politician images from official sources
2. Save them to `public/politicians/`
3. Update `src/data/candidates.json` with local image paths

## Adding New Politicians

Edit `POLITICIAN_IMAGES` dictionary in `image_scraper.py`:

```python
POLITICIAN_IMAGES = {
    "Politician Name": "https://official-source.gov/photo.jpg",
    # Add more...
}
```

## Image Sources

- Official government websites (.gov domains)
- Wikipedia Commons (public domain)
- Official campaign websites

All images should be public domain or have appropriate usage rights.
