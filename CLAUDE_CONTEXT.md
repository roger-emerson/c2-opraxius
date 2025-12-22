# Opraxius C2 - AI Context

Event Management Command & Control Platform with 3D GIS visualization.

## Current State

- **Phase 3**: Workcenters & Dashboards ✅ Complete
- **Status**: 3D Map rendering, Auth0 SSO working, API deployed
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

## Project Structure

```
c2-opraxius/
├── apps/
│   ├── web/                    # Next.js 14 frontend
│   │   ├── src/app/
│   │   │   ├── map-demo/       # Public 3D map demo (lazy loads @c2/map-3d)
│   │   │   ├── dashboard/      # Protected dashboard pages
│   │   │   └── api/auth/       # NextAuth routes
│   │   └── src/components/     # UI components (3D moved to map-3d package)
│   └── api-workers/            # Hono API on Workers
│       └── src/routes/         # API endpoints
├── packages/
│   ├── shared/                 # Types & constants
│   ├── database/               # Drizzle ORM schema
│   ├── gis/                    # GeoJSON parser & CLI
│   └── map-3d/                 # 3D rendering (Three.js, R3F, Drei)
│       ├── src/components/     # VenueMap3D, VenueObject, FeatureDetailPanel
│       └── src/lib/            # gis-utils.ts coordinate conversion
└── docs/                       # Documentation
```

## Key Files

| File | Purpose |
|------|---------|
| `apps/web/src/app/map-demo/page.tsx` | Public 3D map with debug panel (dynamically imports @c2/map-3d) |
| `packages/map-3d/src/components/VenueMap3D.tsx` | Main 3D scene component |
| `packages/map-3d/src/components/VenueObject.tsx` | 3D geometry rendering |
| `packages/map-3d/src/lib/gis-utils.ts` | Three.js coordinate conversion |
| `apps/api-workers/src/routes/venues.ts` | Venue API with PostGIS |
| `apps/api-workers/wrangler.development.toml` | Hyperdrive config |

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
npm run build --workspace=@c2/shared --workspace=@c2/database --workspace=@c2/gis --workspace=@c2/map-3d

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

**Cloudflare Workers (api)**:
```
# Hyperdrive binding configured in wrangler.*.toml
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

## Database Schema

```
venue_features    # GIS data (Point/Polygon/LineString)
events            # Festival events
tasks             # Task management
users             # Auth0 users with RBAC
workcenters       # 8 departments
activity_feed     # Activity log
```

## Package Dependencies

```
@c2/web depends on:
  - @c2/shared (types)
  - @c2/map-3d (3D components, lazy loaded)

@c2/map-3d depends on:
  - @c2/shared (types)
  - three, @react-three/fiber, @react-three/drei (bundled)
```

## Docs Index

- `docs/ENVIRONMENTS.md` - All URLs and endpoints
- `docs/AGENT_CI_CD_WORKFLOW.md` - CI/CD debugging guide
- `docs/PHASE3_COMPLETE.md` - Latest phase completion
- `docs/archive/` - Historical phase docs
