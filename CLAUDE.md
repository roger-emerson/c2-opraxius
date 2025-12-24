# Claude Code Agent Instructions - Opraxius C2

## Project Overview

**Opraxius C2** - Event Management Command & Control platform with 3D GIS visualization.

For detailed project context, current status, and architecture decisions, see **CLAUDE_CONTEXT.md**.

---

## Quick Reference

### Key Documentation
- `CLAUDE_CONTEXT.md` - **Primary reference** - Full project context, API, architecture
- `README.md` - User-facing documentation, quick start guide
- `docs/ARCHITECTURE.md` - System architecture diagrams
- `docs/ENVIRONMENTS.md` - All URLs and endpoints

### Project Structure
```
apps/
├── web/              # Next.js 14 frontend
└── api-workers/      # Hono API on Cloudflare Workers

packages/
├── shared/           # TypeScript types & constants
├── database/         # Drizzle ORM + PostGIS
├── map-3d/           # Three.js 3D map components
└── gis/              # GeoJSON parser & CLI
```

### Tech Stack
- **Frontend**: Next.js 14, React 18.2, TypeScript, Tailwind, Shadcn/ui
- **3D Rendering**: Three.js, React Three Fiber 8, Drei 9 (in `@c2/map-3d`)
- **Backend**: Hono on Cloudflare Workers
- **Database**: Supabase PostgreSQL + PostGIS via Hyperdrive
- **Auth**: Auth0 + NextAuth.js v5 (Edge Runtime)
- **Monorepo**: Turborepo

### Running Locally
```bash
cd /Users/roger/Desktop/Projects/c2-opraxius

# Start web (localhost:3000)
cd apps/web && npm run dev

# Start API workers (localhost:8787)
cd apps/api-workers && npm run dev
```

---

## Current Status

**Phase 5**: ✅ Complete (Task Management & Live Feed)
- 150 event tasks seeded across 7 workcenters
- Live activity feed with real-time updates
- 3D map with task-linked venue features

### Live URLs
- **Dev**: https://dev.web.opraxius.com | https://dev.api.opraxius.com
- **Staging**: https://staging.web.opraxius.com | https://staging.api.opraxius.com
- **Production**: https://dashboard.opraxius.com | https://api.opraxius.com

See `CLAUDE_CONTEXT.md` for full API reference and deployment workflow.
