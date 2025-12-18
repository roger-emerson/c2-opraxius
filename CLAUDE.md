# Claude Code Agent Instructions - ESG Command Center

## Project Overview

**ESG Command Center** is a festival management dashboard for Insomniac Events (EDC Las Vegas, EDC Orlando).

For detailed project context, current status, and architecture decisions, see **CLAUDE_CONTEXT.md**.

---

## Quick Reference

### Key Documentation
- `CLAUDE_CONTEXT.md` - Full project context, systematic approach, and CI/CD setup
- `README.md` - Single source of truth (quick start, features, API, deployment)
- `PHASE1_COMPLETE.md` + `PHASE2_COMPLETE.md` - Phase completion snapshots
- `IMPLEMENTATION_PLAN.md` - 6-phase architecture roadmap

### Project Structure
```
apps/
├── web/          # Next.js 15 frontend (port 3000)
└── api/          # Fastify backend (port 3001)

packages/
├── shared/       # TypeScript types
├── database/     # Drizzle ORM + PostGIS
├── ui/           # Component library (Phase 3)
├── auth/         # Auth utilities (future)
└── gis/          # GIS utilities (Phase 2)
```

### Tech Stack
- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind, Shadcn/ui
- **Backend**: Fastify, PostgreSQL 15 + PostGIS 3.4, Redis 7, Drizzle ORM
- **Auth**: Auth0 + NextAuth.js
- **Infrastructure**: Docker, Turborepo

### Running the Project
```bash
cd /Users/roger/Desktop/Projects/esg-commandcenter

# Start databases
make db-up

# Start API (Terminal 1)
cd apps/api && npm run dev

# Start Web (Terminal 2)
cd apps/web && npm run dev
```

---

## Current Status

**Phase 1**: ✅ Complete (infrastructure, auth, RBAC, API)
**Phase 2**: ✅ Complete (3D map with Three.js, GeoJSON import, dashboard)
**CI/CD**: ✅ Configured (Cloudflare staging + production)
**Phase 3**: 🚧 Next (Workcenters & dashboards)

See `CLAUDE_CONTEXT.md` for detailed status and deployment instructions.
