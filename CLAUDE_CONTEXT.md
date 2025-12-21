# Claude Context for C2 Command Center

> **Purpose**: Essential context for AI assistants continuing work on this project.  
> **For full documentation**: See [README.md](README.md)  
> **Last Updated**: December 20, 2025

---

## Quick Status

| Item | Status |
|------|--------|
| **Phase 1** | ✅ Complete (Infrastructure, Auth, RBAC, API) |
| **Phase 2** | ⚠️ CODE Complete, READY FOR TESTING |
| **Phase 3** | 🚧 Not Started (Workcenters & Dashboards) |
| **CI/CD** | ✅ Configured (Cloudflare staging + production) |
| **Blocking Issue** | Need to run seed workflow to import test data |

---

## How to Continue This Project

### 1. Read These First (In Order)

1. **This file** - Current status and AI context
2. **[README.md](README.md)** - Full project documentation
3. **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System architecture & dependencies
4. **[docs/PHASE2_COMPLETE.md](docs/PHASE2_COMPLETE.md)** - Current phase status with reality check

### 2. Understand Current State

**What's Working:**
- ✅ All code deployed to Cloudflare (staging + production)
- ✅ Public API endpoint: `GET /api/venues/public`
- ✅ 3D map components (VenueMap3D, VenueObject, FeatureDetailPanel)
- ✅ Authentication flow with Auth0
- ✅ RBAC middleware on protected routes

**What's NOT Working:**
- ❌ No data in staging database (venue_features table empty)
- ❌ Map shows "Failed to fetch" or empty state
- ❌ Never tested end-to-end with real data
- ❌ Hyperdrive not configured in wrangler.toml

### 3. Immediate Next Steps

**To complete Phase 2 - READY TO GO!**

**Option 1: GitHub Actions (Recommended)**
1. Go to: https://github.com/roger-emerson/c2-opraxius/actions
2. Run "Seed Staging Database" workflow
3. Test at: https://staging.opraxius.com/dashboard/map

**Option 2: Shell Script**
```bash
export DATABASE_URL="<staging-db-url>"
./scripts/seed-staging-api.sh
```

**See [docs/NEXT_STEPS.md](docs/NEXT_STEPS.md) for detailed instructions**

---

## Project Structure (Quick Reference)

```
c2-opraxius/
├── apps/
│   ├── web/              # Next.js 15 frontend (Cloudflare Pages)
│   ├── api/              # Fastify backend (LOCAL DEV ONLY)
│   └── api-workers/      # Hono API (Cloudflare Workers)
├── packages/
│   ├── shared/           # Types & constants
│   ├── database/         # Drizzle ORM schema
│   └── gis/              # GeoJSON utilities + CLI
├── docs/                 # Documentation
└── .github/workflows/    # CI/CD
```

**Key Insight**: There are TWO API implementations:
- `apps/api` (Fastify) - For local development with Docker
- `apps/api-workers` (Hono) - For Cloudflare Workers deployment

---

## Branching & Deployment

```
develop  → Auto-deploys to Cloudflare development
    ↓
staging  → Auto-deploys to Cloudflare staging
    ↓
main     → Deploys to production (requires approval)
```

**Deploy to development:**
```bash
git checkout develop
git add .
git commit -m "feat: your changes"
git push origin develop  # Triggers GitHub Actions
```

**Deploy to staging:**
```bash
git checkout staging
git merge develop
git push origin staging  # Triggers GitHub Actions
```

**URLs:**
| Environment | Web | API |
|------------|-----|-----|
| Local | http://localhost:3000 | http://localhost:3001 |
| Development | https://dev.web.opraxius.com | https://dev.api.opraxius.com |
| Staging | https://staging.opraxius.com | https://api.staging.opraxius.com |
| Production | https://dashboard.opraxius.com | https://api.opraxius.com |

---

## Critical Lessons Learned

### Definition of "Done"

**❌ OLD (Wrong):** "Code exists in repo and deploys without errors"

**✅ NEW (Correct):** A feature is COMPLETE when:
1. Code written and deployed
2. **Data exists** in the environment
3. **End-to-end tested** (user can actually use it)
4. **Screenshots/proof** of working feature
5. Known limitations documented

### Phase 2 Example

What we claimed: "3D map is complete"  
What was true: Code existed, but:
- No data in staging database
- API required auth (blocking map)
- Never tested with real data
- No proof it worked

**Always verify features work end-to-end before marking complete.**

---

## Key File Locations

| Purpose | File |
|---------|------|
| API entry (Workers) | `apps/api-workers/src/index.ts` |
| Public venues endpoint | `apps/api-workers/src/routes/venues.ts` |
| 3D Map page | `apps/web/src/app/dashboard/map/page.tsx` |
| Map components | `apps/web/src/components/map/` |
| Database schema | `packages/database/src/schema/` |
| GeoJSON importer | `packages/gis/src/cli/importer.ts` |
| Test data | `packages/gis/examples/test-venue.geojson` |
| Staging workflow | `.github/workflows/deploy-staging.yml` |
| Wrangler configs | `apps/api-workers/wrangler.*.toml` |

---

## Environment Variables

**Required for Cloudflare (in GitHub Secrets):**
```
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
DATABASE_URL
JWT_SECRET
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

**For local development, see:** `.env.example`

---

## Common Issues

| Problem | Solution |
|---------|----------|
| Map shows "Loading..." forever | Check if API returns data, may need to import test data |
| 401 Unauthorized on API | Use `/api/venues/public` for map (no auth required) |
| TypeScript errors | Run `npm run build` in packages/shared and packages/database first |
| Port conflicts | `lsof -ti:3000 \| xargs kill` |
| Database issues | `make db-reset` then `make db-up` |

---

## Documentation Index

**Quick Reference**: See [docs/INDEX.md](docs/INDEX.md) for complete documentation map

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | Full project documentation |
| [docs/INDEX.md](docs/INDEX.md) | Master documentation index |
| [docs/NEXT_STEPS.md](docs/NEXT_STEPS.md) | Immediate action items |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture & dependencies |
| [docs/CLOUDFLARE_DEPLOYMENT.md](docs/CLOUDFLARE_DEPLOYMENT.md) | Cloudflare setup details |
| [docs/GITHUB_CLI_REFERENCE.md](docs/GITHUB_CLI_REFERENCE.md) | GitHub CLI commands |
| [docs/STAGING_SEED_INSTRUCTIONS.md](docs/STAGING_SEED_INSTRUCTIONS.md) | Database seeding guide |
| [docs/PHASE2_COMPLETE.md](docs/PHASE2_COMPLETE.md) | Phase 2 status report |
| [docs/PHASE2_COMPLETION_CHECKLIST.md](docs/PHASE2_COMPLETION_CHECKLIST.md) | Testing checklist |
| [docs/archive/PHASE1_COMPLETE.md](docs/archive/PHASE1_COMPLETE.md) | Phase 1 archive |

---

## For the Next AI Session

When starting a new session:

1. **Read [docs/NEXT_STEPS.md](docs/NEXT_STEPS.md) first** - Clear action items
2. **Check if seed ran** - Verify staging map has data
3. **If no data yet**: Run seed workflow via GitHub Actions
4. **If data exists**: Test 3D map, take screenshots, mark Phase 2 complete
5. **Then**: Start Phase 3 planning

**Phase 3 Goals:**
- 8 workcenter dashboard pages
- Real-time activity feed
- Task CRUD operations
- Overall readiness tracking

**New Documentation Created (Dec 20, 2025):**
- [docs/NEXT_STEPS.md](docs/NEXT_STEPS.md) - Quick start guide
- [docs/INDEX.md](docs/INDEX.md) - Master documentation index
- [docs/archive/README.md](docs/archive/README.md) - Archive structure guide
- [docs/STAGING_SEED_INSTRUCTIONS.md](docs/STAGING_SEED_INSTRUCTIONS.md) - Detailed seed instructions
- [docs/PHASE2_COMPLETION_CHECKLIST.md](docs/PHASE2_COMPLETION_CHECKLIST.md) - Testing checklist
- [.github/workflows/seed-staging.yml](.github/workflows/seed-staging.yml) - Seed workflow
- [scripts/seed-staging-api.sh](scripts/seed-staging-api.sh) - Seed script
- [packages/database/src/seed.ts](packages/database/src/seed.ts) - Event seeder

---

*Updated: December 20, 2025 - Condensed from 1062 lines to ~200 lines by removing duplication with README.md*
