# Staging Database Seed Instructions

> **Goal**: Import test data into the staging database so the 3D map has features to display

---

## Prerequisites

1. **DATABASE_URL** for staging environment (from GitHub Secrets)
2. **jq** installed (`brew install jq`)
3. **Node.js 18+** and npm installed

---

## Method 1: Using the Seed Script (Recommended)

This is the simplest method - one command to do everything.

### Step 1: Get the DATABASE_URL

The staging DATABASE_URL is stored as a GitHub secret. You need to:

1. Go to GitHub repository settings
2. Navigate to Settings → Secrets and variables → Actions
3. Find the `DATABASE_URL` secret for the **staging** environment
4. Copy the value (it should look like: `postgresql://user:pass@host:port/database`)

### Step 2: Run the seed script

```bash
# Export the DATABASE_URL
export DATABASE_URL="postgresql://user:pass@host:port/database"

# Run the seed script
./scripts/seed-staging-api.sh
```

This script will:
1. ✅ Check API health
2. ✅ Install dependencies
3. ✅ Build workspace packages
4. ✅ Create a test event (EDC Las Vegas 2025)
5. ✅ Import 8 test GeoJSON features
6. ✅ Verify data via API

**Expected output:**
```
✅ Staging database seeded successfully!

Next steps:
1. Open: https://staging.web.opraxius.com/dashboard/map
2. Verify the map renders with 8 features
3. Test interactions (rotate, zoom, click)
4. Take screenshots for documentation
```

---

## Method 2: Manual Steps

If you prefer to run each step manually:

### Step 1: Create test event

```bash
cd packages/database
DATABASE_URL="<your-staging-db-url>" npm run db:seed
```

This creates a test event with slug `test-event-001` and outputs the event ID.

### Step 2: Import GeoJSON data

```bash
cd ../gis
DATABASE_URL="<your-staging-db-url>" npm run import -- \
  -f examples/test-venue.geojson \
  -e <EVENT_ID_FROM_STEP_1>
```

### Step 3: Verify import

```bash
curl -s https://staging.api.opraxius.com/api/venues/public | jq .
```

You should see 8 features returned.

---

## Method 3: Using GitHub Actions (Future Enhancement)

We could add a `seed-staging` workflow that runs on manual dispatch:

```yaml
name: Seed Staging Database
on:
  workflow_dispatch:

jobs:
  seed:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: npm run build --workspace=@c2/shared --workspace=@c2/database --workspace=@c2/gis
      - run: npm run db:seed
        working-directory: packages/database
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      - run: |
          EVENT_ID=$(DATABASE_URL="${{ secrets.DATABASE_URL }}" npx tsx -e "import { db, events } from './dist/index.js'; import { eq } from 'drizzle-orm'; const result = await db.select().from(events).where(eq(events.slug, 'test-event-001')).limit(1); console.log(result[0].id);")
          npm run import -- -f examples/test-venue.geojson -e "$EVENT_ID"
        working-directory: packages/gis
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

---

## Test Data Overview

The test GeoJSON file (`packages/gis/examples/test-venue.geojson`) contains **8 features**:

| # | Name | Type | Geometry | Workcenter |
|---|------|------|----------|------------|
| 1 | Main Stage | stage | Polygon | production |
| 2 | Circuit Grounds | stage | Polygon | production |
| 3 | Cosmic Meadow | stage | Polygon | production |
| 4 | Main Entrance | entrance | Point | security |
| 5 | VIP Entrance | entrance | Point | security |
| 6 | Security Perimeter North | fence | LineString | security |
| 7 | Food Court Plaza | plaza | Polygon | operations |
| 8 | First Aid Station 1 | medical | Point | operations |

These features will render as:
- **3 Stages** (yellow/green polygons - large extruded shapes)
- **2 Entrances** (colored boxes - points)
- **1 Fence** (line/tube geometry)
- **1 Plaza** (extruded polygon)
- **1 Medical Station** (colored box - point)

---

## Verification Steps

After seeding, verify the data is loaded:

### 1. Check API endpoint

```bash
curl -s https://staging.api.opraxius.com/api/venues/public | jq '. | length'
```

Expected: `8`

### 2. Check individual feature

```bash
curl -s https://staging.api.opraxius.com/api/venues/public | jq '.[0]'
```

Expected: Feature object with name, type, geometry, etc.

### 3. Open the 3D map

Visit: https://staging.web.opraxius.com/dashboard/map

Expected behavior:
- Map loads without errors
- 8 features render in 3D space
- Features are colored by status
- Can rotate, zoom, pan
- Can click features to see details

---

## Troubleshooting

### "DATABASE_URL not set"

Make sure you've exported the DATABASE_URL:
```bash
export DATABASE_URL="postgresql://user:pass@host:port/database"
```

### "Test event already exists"

This is fine! The seed script will detect the existing event and use it:
```bash
cd packages/gis
DATABASE_URL="..." npm run import -- -f examples/test-venue.geojson -e <EXISTING_EVENT_ID>
```

### "Failed to import features"

Check:
1. DATABASE_URL is correct and accessible
2. Database has the latest migrations (`drizzle-kit push`)
3. PostGIS extension is enabled

### Map shows "Loading..." forever

Check:
1. API returns data: `curl https://staging.api.opraxius.com/api/venues/public`
2. Browser console for errors
3. Network tab shows successful API call

---

## Next Steps After Seeding

Once data is imported:

1. ✅ **Test the 3D map** - Open staging.web.opraxius.com/dashboard/map
2. ✅ **Test interactions** - Rotate, zoom, click features
3. ✅ **Verify detail panel** - Click a feature and check the detail panel appears
4. ✅ **Take screenshots** - Document the working map
5. ✅ **Update Phase 2 docs** - Mark as fully complete with proof

---

## Files Created

- `packages/database/src/seed.ts` - Creates test event
- `scripts/seed-staging.sh` - Shell script (database method)
- `scripts/seed-staging-api.sh` - Shell script with API verification
- `docs/STAGING_SEED_INSTRUCTIONS.md` - This file

---

*Last updated: December 20, 2025*
