# Opraxius C2 - AI Context

Event Management Command & Control Platform with 3D GIS visualization.

## Current State

- **Phase 4**: 3D Model Integration ✅ Complete
- **Status**: Styled 3D models rendering, Auth0 SSO working, API deployed
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

## 3D Model Architecture

Features are automatically rendered with styled 3D models based on `featureType`:

| featureType | Model | Visual Style |
|-------------|-------|--------------|
| `stage`, `sound_booth`, `vip_area` | StageModel | Floating box with roof, accent pillars, Float animation |
| `vendor_booth`, `medical_tent`, `security_post`, `restroom`, `water_station`, `gate` | FacilityModel | Glowing cylinder with category icon & tooltip |
| `command_center`, `production_office`, `warehouse`, `generator` | FacilityModel | Larger scaled facility |
| `art_installation` | LandmarkModel | Wireframe octahedron or FerrisWheel |
| `pathway`, `road`, `fence`, `parking_lot`, `zone`, `boundary` | Infrastructure | Tube/extrude geometry from PostGIS |

### Model Components

```
packages/map-3d/src/components/
├── VenueMap3D.tsx      # Main scene: Canvas, lighting, controls, legends
├── VenueObject.tsx     # Smart wrapper: selects model by featureType
├── StageModel.tsx      # Stages: floating box, roof, pillars, Float
├── FacilityModel.tsx   # Facilities: glowing cylinder, Html tooltip
├── LandmarkModel.tsx   # Art: wireframe octahedron, FerrisWheel
└── FeatureDetailPanel.tsx  # Glassmorphism detail panel
```

### Visual Features

- **Lighting**: Ambient + directional + colored accent lights (magenta/cyan)
- **Shadows**: ContactShadows for grounded feel
- **Background**: Stars + night environment
- **Animations**: Float for stages, rotation for landmarks, pulse for selection
- **UI**: Glassmorphism panels with status/type legends

## Project Structure

```
c2-opraxius/
├── apps/
│   ├── web/                    # Next.js 14 frontend
│   │   ├── src/app/
│   │   │   ├── map-demo/       # Public 3D map demo (lazy loads @c2/map-3d)
│   │   │   ├── dashboard/      # Protected dashboard pages
│   │   │   └── api/auth/       # NextAuth routes
│   │   └── src/components/     # UI components
│   └── api-workers/            # Hono API on Workers
│       └── src/routes/         # API endpoints
├── packages/
│   ├── shared/                 # Types & constants (ModelCategory, etc.)
│   ├── database/               # Drizzle ORM schema
│   ├── gis/                    # GeoJSON parser & CLI
│   └── map-3d/                 # 3D rendering package
│       ├── src/components/     # StageModel, FacilityModel, LandmarkModel
│       └── src/lib/            # gis-utils.ts, colors.ts
└── docs/                       # Documentation
```

## Key Files

| File | Purpose |
|------|---------|
| `packages/map-3d/src/components/StageModel.tsx` | Styled stage with Float animation |
| `packages/map-3d/src/components/FacilityModel.tsx` | Glowing facility cylinder |
| `packages/map-3d/src/components/LandmarkModel.tsx` | Art installation / FerrisWheel |
| `packages/map-3d/src/components/VenueObject.tsx` | Model selector by featureType |
| `packages/map-3d/src/lib/colors.ts` | Status colors, feature colors, model categories |
| `packages/shared/src/types/venue.types.ts` | ModelCategory type, featureTypeToModelCategory() |

## API Endpoints

```
GET  /health                    # Health check
GET  /api/venues/public         # GeoJSON features (no auth)
GET  /api/venues                # Protected venue list
GET  /api/tasks                 # Task list (RBAC filtered)
GET  /api/events                # Event list (RBAC filtered)
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

## Critical Notes

1. **React Version**: Must use React 18.2 (not 19) for React Three Fiber compatibility
2. **Next.js Version**: Must use Next.js 14 (not 15) for React 18 support
3. **PostGIS**: Use `ST_AsGeoJSON()` in raw SQL for geometry serialization
4. **Hyperdrive**: Configure in wrangler.*.toml with Transaction mode (port 6543)
5. **Client Components**: Don't use `export const runtime = 'edge'` with `'use client'`
6. **3D Code Isolation**: All Three.js code lives in `@c2/map-3d` package, lazy-loaded via `dynamic()` import
7. **Model Selection**: VenueObject automatically picks StageModel/FacilityModel/LandmarkModel based on featureType

## Database Schema

```
venue_features    # GIS data (Point/Polygon/LineString) + featureType for model selection
events            # Festival events
tasks             # Task management
users             # Auth0 users with RBAC
workcenters       # 8 departments
activity_feed     # Activity log
```

## Docs Index

- `docs/ENVIRONMENTS.md` - All URLs and endpoints
- `docs/AGENT_CI_CD_WORKFLOW.md` - CI/CD debugging guide
- `docs/PHASE3_COMPLETE.md` - Workcenters & Dashboards
- `docs/archive/` - Historical phase docs
