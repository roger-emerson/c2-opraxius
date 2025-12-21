# Next Steps - Phase 2 Completion

> **Quick Summary**: Phase 2 code is complete and deployed. Now we need to import test data to the staging database and verify the 3D map works.

---

## 🎯 Current Status

✅ **What's Done:**
- All Phase 2 code written and deployed to Cloudflare staging
- 3D map components (VenueMap3D, VenueObject, FeatureDetailPanel)
- GeoJSON import CLI tool
- Public API endpoint (`/api/venues/public`)
- Seed scripts and workflows created

❌ **What's Blocking:**
- **No test data in staging database** - the map loads but shows empty/error
- Need to import 8 test features from `../packages/gis/examples/test-venue.geojson`

---

## 🚀 How to Complete Phase 2 (Choose ONE method)

### Method 1: GitHub Actions (Easiest - Recommended)

1. Go to: https://github.com/roger-emerson/c2-opraxius/actions
2. Click "Seed Staging Database" workflow (on the left)
3. Click "Run workflow" button (top right)
4. Select `staging` branch
5. Click green "Run workflow" button
6. Wait ~2-3 minutes for completion

Then:
7. Open: https://staging.web.opraxius.com/dashboard/map
8. Verify map shows 8 features in 3D
9. Test interactions (rotate, zoom, click)

### Method 2: Shell Script (If you have DATABASE_URL)

If you have access to the staging DATABASE_URL:

```bash
# Export the DATABASE_URL from GitHub Secrets
export DATABASE_URL="postgresql://user:pass@host:port/database"

# Run the seed script
../../scripts/seed-staging-api.sh
```

This will:
- Create a test event
- Import 8 GeoJSON features
- Verify via API

Then test at: https://staging.web.opraxius.com/dashboard/map

### Method 3: Manual (Step by Step)

See [STAGING_SEED_INSTRUCTIONS.md](STAGING_SEED_INSTRUCTIONS.md) for detailed manual instructions.

---

## 📋 What to Test After Seeding

Visit: https://staging.web.opraxius.com/dashboard/map

Expected behaviors:

| Test | Expected Result |
|------|----------------|
| **Page loads** | Map renders with 8 colorful 3D objects |
| **Rotate** (left-click drag) | Camera rotates around the venue |
| **Zoom** (scroll wheel) | Camera zooms in and out |
| **Pan** (right-click drag) | Camera moves across the scene |
| **Hover** | Feature highlights orange |
| **Click feature** | Detail panel slides in from right |
| **Detail panel** | Shows name, type, status, tasks, etc. |
| **Close panel** | Click X or click elsewhere |

---

## 📸 Document Results

After testing, take screenshots of:

1. Full map view with all features
2. Detail panel open for a feature
3. Map from different angles (showing 3D perspective)
4. Hover effect on a feature

Save to: `docs/screenshots/phase2/`

---

## 🎉 Definition of "Complete"

Phase 2 is **COMPLETE** when:

1. ✅ Test data imported to staging
2. ✅ Map loads without errors
3. ✅ All 8 features visible
4. ✅ All controls working (rotate, zoom, pan, click, hover)
5. ✅ Detail panel shows correct data
6. ✅ Screenshots captured
7. ✅ No critical bugs

---

## 📚 Documentation Created

New files to help you:

- **[STAGING_SEED_INSTRUCTIONS.md](STAGING_SEED_INSTRUCTIONS.md)** - Detailed seeding instructions
- **[PHASE2_COMPLETION_CHECKLIST.md](PHASE2_COMPLETION_CHECKLIST.md)** - Full testing checklist
- **[seed-staging.yml](../.github/workflows/seed-staging.yml)** - GitHub Actions workflow
- **[seed-staging-api.sh](../scripts/seed-staging-api.sh)** - Shell script for seeding
- **[seed.ts](../packages/database/src/seed.ts)** - Creates test event

---

## 🐛 If Something Goes Wrong

### Map shows "Loading..." forever

```bash
# Check if API returns data
curl -s https://staging.api.opraxius.com/api/venues/public | jq .

# Expected: Array of 8 features
# If empty: Re-run seed script
```

### Map shows error

1. Check browser console (F12 → Console tab)
2. Check Network tab for failed API calls
3. Verify public endpoint works (no auth required)

### Features imported but not visible

1. Check camera distance in [VenueMap3D.tsx](../apps/web/src/components/map/VenueMap3D.tsx#L8)
2. Verify coordinate conversion in [coordinates.ts](../packages/gis/src/coordinates.ts)
3. Check feature data: `curl https://staging.api.opraxius.com/api/venues/public | jq '.[0]'`

---

## 🔜 After Phase 2 is Complete

Start Phase 3:
- 8 workcenter dashboard pages
- Overall Readiness tracking
- Critical Items panel
- Real-time Activity Feed
- Task CRUD operations

---

## 💡 Quick Commands Reference

```bash
# Seed staging (with DATABASE_URL)
export DATABASE_URL="postgresql://..."
../../scripts/seed-staging-api.sh

# Verify data via API
curl https://staging.api.opraxius.com/api/venues/public | jq '. | length'

# Check staging health
curl https://staging.api.opraxius.com/health

# Run seed manually
cd packages/database
DATABASE_URL="..." npm run db:seed

cd ../gis
DATABASE_URL="..." npm run import -- -f examples/test-venue.geojson -e <EVENT_ID>
```

---

## 🆘 Need Help?

1. Check [STAGING_SEED_INSTRUCTIONS.md](STAGING_SEED_INSTRUCTIONS.md)
2. Check [PHASE2_COMPLETION_CHECKLIST.md](PHASE2_COMPLETION_CHECKLIST.md)
3. Review [../CLAUDE_CONTEXT.md](../CLAUDE_CONTEXT.md) for project overview
4. Check [ARCHITECTURE.md](ARCHITECTURE.md) for system architecture

---

**Bottom line:** Run the GitHub Actions "Seed Staging Database" workflow, then test the map at staging.web.opraxius.com/dashboard/map.

That's it! 🎉
