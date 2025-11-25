# Adding Skis to the Database

## Quick Start

1. **Add skis to `ski-data.json`** - Edit the file and add your ski entries to the `skis` array
2. **Run one command** to add them to the database:

```bash
# Add to local database only (for testing)
npm run add-skis:local

# Add to production database only
npm run add-skis:prod

# Add to both local and production
npm run add-skis:both
```

## Prerequisites for Production

If you want to add skis to production, you need to set your Cloudflare API token:

**PowerShell:**
```powershell
$env:CLOUDFLARE_API_TOKEN="your-token-here"
```

**Bash (Linux/Mac):**
```bash
export CLOUDFLARE_API_TOKEN="your-token-here"
```

Or set it permanently in your system environment variables.

## JSON Format

Add your skis to the `skis` array in `ski-data.json`:

```json
{
  "skis": [
    {
      "brand": "Nordica",
      "model": "Enforcer 100",
      "year": 2025,
      "gender": "Men's/Unisex",
      "waistWidth": 100.0,
      "msrp": 799.99,
      "imageUrl": "/images/nordica-enforcer-100.jpg",
      "attributes": {
        "skillLevel": "Advanced",
        "terrain": ["All-Mountain", "Powder"],
        "flexProfile": "Stiff / Damp",
        "turnStyle": "Long & Fast",
        "skiFeature": null
      }
    }
  ]
}
```

### Attribute Values

- **skillLevel**: `"Beginner"`, `"Intermediate"`, `"Advanced"`, `"Expert"`
- **terrain**: Array of `"All-Mountain"`, `"On-Piste"`, `"Powder"`, `"Park / Freestyle"`
- **flexProfile**: `"Playful / Soft"`, `"Stiff / Damp"`, `"Buttery / Jib"`, `"Stiff / Jumps"`, `"Medium / Forgiving"`
- **turnStyle**: `"Short & Quick"`, `"Long & Fast"`
- **skiFeature**: `"True Twin"`, `"Directional Twin"`, or `null` (for non-park skis)

## How It Works

The script:
1. Reads `ski-data.json`
2. Generates SQL statements to upsert (update or insert) each ski
3. Executes the SQL on the selected database(s)
4. Automatically handles:
   - Updating existing skis (matched by Brand + Model + Year)
   - Inserting new skis
   - Updating attribute links

## Troubleshooting

- **"CLOUDFLARE_API_TOKEN not found"**: Set the environment variable (see Prerequisites above)
- **"Ski already exists"**: The script will update it automatically - this is normal
- **SQL errors**: Check that your attribute values match the allowed values exactly
