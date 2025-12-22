# Opraxius C2 - AI Context

Event Management Command & Control Platform with 3D GIS visualization.

## Current State

- **Phase 5**: Task Management & Live Feed ✅ Complete
- **Status**: 150 event tasks seeded, live activity feed, 3D map with linked tasks
- **Live URLs**:
  - Dev Web: https://dev.web.opraxius.com
  - Dev API: https://dev.api.opraxius.com
  - Staging Web: https://staging.web.opraxius.com
  - Staging API: https://staging.api.opraxius.com

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18.2, TypeScript |
| 3D Rendering | Three.js, React Three Fiber 8, Drei 9 (isolated in `@c2/map-3d`) |
| Styling | Tailwind CSS, Shadcn/ui |
| API | Hono on Cloudflare Workers |
| Database | Supabase PostgreSQL + PostGIS via Hyperdrive |
| Auth | Auth0 + NextAuth.js v5 (Edge Runtime) |
| Monorepo | Turborepo |
| Deploy | Cloudflare Pages (web) + Workers (api) |

## Task Management System

### 150 Event Management Tasks (7 Workcenters)

| Workcenter | Tasks | Description |
|------------|-------|-------------|
| Operations | 30 | Command center, signage, power, water, restrooms, medical, evacuation |
| Production | 25 | Stage rigging, LED screens, sound, lighting, pyrotechnics, DJ booths |
| Security | 25 | Perimeter, metal detection, CCTV, crowd control, K-9, VIP security |
| Workforce | 20 | Credentials, training, scheduling, uniforms, staff services |
| Vendors | 20 | Booth assignments, food safety, POS systems, health inspections |
| Marketing | 15 | Branding, photo ops, media credentials, sponsor activations |
| Finance | 15 | Cash office, box office, revenue tracking, vendor payments |

### Task-to-Feature Linking

Tasks are linked to venue features via `venueFeatureId`:
- Tasks appear on 3D map when clicking features
- Feature completion % is calculated from linked task progress
- Activity feed shows real-time task updates

### Task Statuses & Completion

| Status | Completion Range |
|--------|-----------------|
| pending | 0-10% |
| in_progress | 20-80% |
| completed | 100% |
| blocked | 10-50% |

## 3D Model Architecture

Features are automatically rendered with styled 3D models based on `featureType`:

| featureType | Model | Visual Style |
|-------------|-------|--------------|
| `stage`, `sound_booth`, `vip_area` | StageModel | Floating box with roof, accent pillars, Float animation |
| `vendor_booth`, `medical_tent`, `security_post`, `restroom`, `water_station`, `gate` | FacilityModel | Glowing cylinder with category icon & tooltip |
| `command_center`, `production_office`, `warehouse`, `generator` | FacilityModel | Larger scaled facility |
| `art_installation` | LandmarkModel | Wireframe octahedron or FerrisWheel |
| `pathway`, `road`, `fence`, `parking_lot`, `zone`, `boundary` | Infrastructure | Tube/extrude geometry from PostGIS |

## Project Structure

```
c2-opraxius/
├── apps/
│   ├── web/                    # Next.js 14 frontend
│   │   ├── src/app/
│   │   │   ├── map-demo/       # Public 3D map demo (lazy loads @c2/map-3d)
│   │   │   ├── dashboard/      # Protected dashboard with live feed
│   │   │   └── api/auth/       # NextAuth routes
│   │   └── src/components/
│   │       └── dashboard/      # ActivityFeed, CriticalItemsPanel, etc.
│   └── api-workers/            # Hono API on Workers
│       └── src/routes/
│           ├── tasks.ts        # Task CRUD with RBAC
│           ├── activity.ts     # Live feed & stats endpoints
│           └── venues.ts       # GeoJSON features
├── packages/
│   ├── shared/                 # Types & constants
│   ├── database/               # Drizzle ORM schema
│   │   └── src/
│   │       ├── seed.ts         # Event seeding
│   │       └── seed-tasks.ts   # Task seeding (150 tasks)
│   ├── gis/                    # GeoJSON parser & CLI
│   └── map-3d/                 # 3D rendering package
└── docs/                       # Documentation
```

## API Endpoints

```
# Public (no auth)
GET  /health                    # Health check
GET  /api/venues/public         # GeoJSON features
GET  /api/activity/live         # Live task activity feed
GET  /api/activity/stats        # Task statistics by workcenter

# Protected (requires auth)
GET  /api/venues                # Protected venue list
GET  /api/tasks                 # Task list (RBAC filtered)
GET  /api/tasks/:id             # Single task
POST /api/tasks                 # Create task
PATCH /api/tasks/:id            # Update task
DELETE /api/tasks/:id           # Delete task
GET  /api/activity              # Activity feed (RBAC filtered)
POST /api/activity              # Log activity
GET  /api/events                # Event list
```

## Development

```bash
# Install
npm install

# Start local dev
cd apps/web && npm run dev      # localhost:3000
cd apps/api-workers && npm run dev  # localhost:8787

# Build packages (required before web build)
npm run build --workspace=@c2/shared --workspace=@c2/map-3d

# Seed database
npm run db:seed --workspace=@c2/database        # Create event
npm run db:seed-tasks --workspace=@c2/database  # Seed 150 tasks

# Deploy
git push origin develop         # Auto-deploys to dev.*
git push origin staging         # Auto-deploys to staging.*
```

## Environment Variables

**Cloudflare Pages (web)**:
```
AUTH0_CLIENT_ID
AUTH0_CLIENT_SECRET
AUTH0_ISSUER_BASE_URL          # https://tenant.us.auth0.com (no trailing slash)
AUTH_SECRET
NEXT_PUBLIC_API_URL            # https://dev.api.opraxius.com
```

## Git Workflow

```
develop  → dev.*.opraxius.com     (auto-deploy)
staging  → staging.*.opraxius.com (auto-deploy)
main     → *.opraxius.com         (manual approval)
```

### Post-Push Verification (REQUIRED)

After every `git push`, verify GitHub Actions status:

```bash
# Step 1: Push changes
git push origin develop

# Step 2: Watch Actions (REQUIRED)
gh run list --branch develop --limit 3

# Step 3: Monitor running workflow
gh run view <RUN_ID>

# Step 4: If failed, get logs
gh run view <RUN_ID> --log-failed
```

## Critical Notes

1. **React Version**: Must use React 18.2 (not 19) for React Three Fiber compatibility
2. **Next.js Version**: Must use Next.js 14 (not 15) for React 18 support
3. **PostGIS**: Use `ST_AsGeoJSON()` in raw SQL for geometry serialization
4. **Hyperdrive**: Configure in wrangler.*.toml with Transaction mode (port 6543)
5. **Client Components**: Don't use `export const runtime = 'edge'` with `'use client'`
6. **3D Code Isolation**: All Three.js code lives in `@c2/map-3d` package, lazy-loaded via `dynamic()` import
7. **Task Linking**: Tasks linked to venue features via `venueFeatureId` appear on 3D map

## Database Schema

```
events            # Festival events
venue_features    # GIS data + featureType for model selection
tasks             # 150 event management tasks (linked to venue_features)
users             # Auth0 users with RBAC
workcenters       # 8 departments
activity_feed     # Real-time activity log
```

### Task Table Relationships

```
tasks
  ├── eventId → events.id
  ├── venueFeatureId → venue_features.id (nullable, for 3D map)
  ├── workcenter (operations, production, security, workforce, vendors, marketing, finance)
  ├── assignedTo → users.id
  └── createdBy → users.id

activity_feed
  ├── eventId → events.id
  ├── taskId → tasks.id
  └── userId → users.id
```

## Docs Index

- `docs/ENVIRONMENTS.md` - All URLs and endpoints
- `docs/AGENT_CI_CD_WORKFLOW.md` - CI/CD debugging guide
- `docs/PHASE3_COMPLETE.md` - Workcenters & Dashboards
- `docs/archive/` - Historical phase docs
