# Claude Context for C2 Command Center

> This document provides comprehensive context for AI assistants (Claude, etc.) working on this project. It includes project state, systematic documentation approach, and continuation guidelines.

---

## Project Overview

**C2 Command Center** - Festival Management Dashboard for Insomniac Events
- **Repository**: `/Users/roger/Desktop/Projects/c2-opraxius`
- **Current Phase**: Phase 2 Complete + C2 Rebrand Complete
- **Status**: Production-ready on Cloudflare, custom domains configured, ready for Phase 3

---

## Systematic Documentation Approach

### Phase Completion Documentation Pattern

For each completed phase, we create a dedicated completion document following this pattern:

1. **PHASEx_COMPLETE.md** - Comprehensive phase completion summary
2. **Content Structure**:
   - ✅ What Was Built (detailed feature list)
   - 📊 Critical Files Created (with file paths)
   - 🎯 Success Criteria Met (checklist)
   - 🚀 How to Run/Use (step-by-step guides)
   - 📖 What Works Now (functional inventory)
   - 🎉 What's Next (preview of next phase)
   - 📊 Statistics (files, LOC, features count)

3. **Purpose**:
   - Preserves exact state at phase completion
   - Enables easy project continuation in new sessions
   - Documents what was built, how to use it, and what's next
   - Provides context for future AI assistants or team members

### Completed Phase Documents

- ✅ **PHASE1_COMPLETE.md** - Core Infrastructure completion
  - Turborepo monorepo
  - PostgreSQL + PostGIS + Redis
  - Auth0 + NextAuth.js authentication
  - RBAC system (10 roles, 8 workcenters)
  - REST API (events, tasks, venues)

- ✅ **PHASE2_COMPLETE.md** - 3D Map & Interaction completion
  - GIS package with coordinate conversion
  - GeoJSON parser and CLI import tool
  - Three.js 3D map components
  - Interactive features (rotate, zoom, click)
  - Detail panel with task integration
  - Dashboard layout

### Ongoing Reference Document

- **README.md** - Single source of truth (consolidated from all phase docs)
  - Quick start guide
  - Complete technology stack
  - Development workflow
  - All implemented features
  - API documentation
  - Troubleshooting

---

## Current State

### ✅ Phase 1: Core Infrastructure (Complete)

**Infrastructure**:
- Turborepo monorepo (2 apps: web, api + 6 packages: shared, database, gis, ui, auth, etc.)
- Docker Compose (PostgreSQL 15 + PostGIS 3.4 + Redis 7)
- TypeScript strict mode across all packages
- Makefile for development commands

**Database** (7 tables with PostGIS):
```
events              # Festival events with venue boundaries
users               # Auth0 SSO users with RBAC
venue_features      # GIS data (Point/Polygon/LineString geometry)
tasks               # Task management with dependencies
workcenters         # 8 department tracking
activity_feed       # Real-time activity log
ai_chat_history     # Claude conversations (Phase 4)
```

**Authentication & RBAC**:
- Auth0 + NextAuth.js (SSO)
- 10 roles (admin, operations_lead, production_lead, security_lead, workforce_lead, vendor_lead, sponsor_lead, marketing_lead, finance_lead, viewer)
- 8 workcenters (Operations, Production, Security, Workforce, Vendors, Sponsors, Marketing, Finance)
- Granular permission system: `{ resource, action, workcenter? }`
- RBAC middleware (backend: Fastify) and hooks (frontend: React)

**REST API** (Fastify on port 3001):
```
GET    /health               # Health check
GET    /api/events           # List events (RBAC filtered)
POST   /api/events           # Create event (admin only)
GET    /api/tasks            # List tasks (filtered by workcenters)
POST   /api/tasks            # Create task (permissions required)
PATCH  /api/tasks/:id        # Update task
GET    /api/venues           # List venue features (RBAC filtered)
POST   /api/venues           # Create venue feature
```

### ✅ Phase 2: 3D Map & Interaction (Complete)

**GIS Package** (`packages/gis`):
```typescript
// Coordinate conversion (lat/lng ↔ Three.js 3D space)
latLngToVector3(lat, lng, altitude, scaleFactor)
vector3ToLatLng(vector, scaleFactor)
calculateBounds(coordinates)

// GeoJSON parsing with type inference
parseGeoJSON(geojson, eventId, defaultType, defaultWorkcenter)
validateGeoJSON(data)
getGeoJSONStats(geojson)

// CLI import tool
npm run import -- -f FILE.geojson -e EVENT_ID [--dry-run] [--type TYPE] [--workcenter WC]
```

**3D Map Components** (`apps/web/src/components/map/`):
```
VenueMap3D.tsx          # Main Three.js scene with OrbitControls
VenueObject.tsx         # Renders Point/Polygon/LineString as 3D geometry
FeatureDetailPanel.tsx  # Slide-out detail panel with tasks
```

**Key Features**:
- Interactive 3D scene (rotate, pan, zoom)
- Color coding: pending=gray, in_progress=yellow, completed=green, blocked=red
- Hover effects (orange highlight)
- Click → detail panel
- Geometry: Point → Box, Polygon → ExtrudeGeometry, LineString → TubeGeometry
- Lighting and shadows
- Task fetching via React Query

**Dashboard** (`apps/web/src/app/(dashboard)/`):
```
layout.tsx      # Protected dashboard shell with sidebar
page.tsx        # Dashboard home with quick actions
map/page.tsx    # Full-screen 3D map view
```

### 🚧 Phase 3: Workcenters & Dashboards (Next)

Planned:
- 8 specialized workcenter pages
- Overall Readiness progress bar
- Critical Items panel
- Workstream Progress bars
- Real-time Activity Feed (Pusher/Socket.IO)
- Task CRUD operations
- Task dependencies and critical path visualization

---

## File Structure

```
c2-opraxius/
├── apps/
│   ├── web/                            # Next.js 15 frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (dashboard)/       # Protected routes
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── map/page.tsx
│   │   │   │   ├── auth/              # Auth pages
│   │   │   │   └── api/auth/          # NextAuth routes
│   │   │   ├── components/
│   │   │   │   └── map/               # 3D map components
│   │   │   ├── hooks/                 # RBAC hooks
│   │   │   └── lib/                   # Auth config
│   │   └── package.json
│   └── api/                            # Fastify backend
│       ├── src/
│       │   ├── routes/                # API routes
│       │   ├── services/              # Business logic + RBAC
│       │   ├── middleware/            # Auth & RBAC middleware
│       │   └── server.ts
│       └── package.json
├── packages/
│   ├── shared/                         # Shared types & constants
│   │   ├── src/
│   │   │   ├── types/                 # TypeScript types
│   │   │   └── constants/             # Workcenters, roles
│   │   └── package.json
│   ├── database/                       # Drizzle ORM
│   │   ├── src/schema/                # 7 table schemas
│   │   └── drizzle.config.ts
│   └── gis/                            # GeoJSON utilities
│       ├── src/
│       │   ├── coordinates.ts         # Lat/lng conversion
│       │   ├── geojson-parser.ts      # Parser + validator
│       │   └── cli/importer.ts        # Import CLI
│       └── package.json
├── docker-compose.yml                  # PostgreSQL + PostGIS + Redis
├── Makefile                            # Development commands
├── README.md                           # Consolidated documentation (single source of truth)
├── PHASE1_COMPLETE.md                  # Phase 1 completion summary
├── PHASE2_COMPLETE.md                  # Phase 2 completion summary
└── CLAUDE_CONTEXT.md                   # This file
```

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: React 18 + TypeScript 5
- **3D**: Three.js 0.171 + React Three Fiber 8.17 + Drei 9.117
- **Styling**: Tailwind CSS 3 + Shadcn/ui
- **State**: Zustand + React Query (TanStack Query)
- **Icons**: Lucide React
- **Auth**: NextAuth.js 4 + Auth0

### Backend
- **Runtime**: Node.js 18+ with TypeScript (ESM)
- **Framework**: Fastify 5
- **Database**: PostgreSQL 15 + PostGIS 3.4
- **ORM**: Drizzle ORM
- **Cache**: Redis 7
- **Auth**: JWT + Auth0

### Infrastructure
- **Dev**: Docker Compose
- **Monorepo**: Turborepo
- **Staging**: Cloudflare Workers (Phase 2 compatible)
- **Production**: AWS (ECS, RDS, ElastiCache, S3) - Phase 6

---

## How to Continue Work (For AI Assistants)

### Starting a New Session

1. **Read the README.md first** - It's the consolidated single source of truth
2. **Check current phase** - See "Implementation Roadmap" section
3. **Review relevant PHASEx_COMPLETE.md** - Understand what's been built
4. **Read this file** (CLAUDE_CONTEXT.md) - Get project context

### Working on Next Phase

1. **Check Implementation Roadmap in README.md** for next phase goals
2. **Follow the phase completion pattern**:
   - Build features incrementally
   - Test as you go
   - Document critical files created
   - Track success criteria
   - Create PHASEx_COMPLETE.md when done
3. **Update README.md** with new features (consolidate info)

### Maintaining Documentation

- **README.md**: Always keep updated as single source of truth
- **PHASEx_COMPLETE.md**: Create when phase is done (preserve snapshot)
- **CLAUDE_CONTEXT.md**: Update with major architectural changes
- **Phase-specific docs**: Only create when absolutely necessary (prefer README)

---

## Git Branching Strategy

### Branch Structure

```
main                    # Production-ready code (protected)
├── staging             # Pre-production testing (auto-deploys to Cloudflare)
├── develop             # Integration branch for features (local dev + testing)
└── feature/*           # Individual feature branches
```

### Branch Purposes

1. **`main`** - Production Branch
   - Protected branch (requires PR approval)
   - Deployed to AWS production environment (Phase 6)
   - Only merge from `staging` after full QA
   - Tagged releases (semantic versioning)

2. **`staging`** - Pre-Production Branch
   - Auto-deploys to Cloudflare Workers via GitHub Actions
   - Full integration testing environment
   - Merge from `develop` when features are complete
   - CI/CD runs full test suite before deployment

3. **`develop`** - Development Branch
   - Default branch for local development
   - Runs on local dev server (MacBook)
   - Integration point for all features
   - Merge feature branches here first

4. **`feature/*`** - Feature Branches
   - Created from `develop` for each new feature/phase
   - Examples: `feature/phase-3-workcenters`, `feature/ai-integration`
   - Deleted after merge into `develop`

### Workflow

```bash
# Start new feature (from develop)
git checkout develop
git pull origin develop
git checkout -b feature/phase-3-workcenters

# Work on feature
git add .
git commit -m "feat: implement workcenter pages"
git push origin feature/phase-3-workcenters

# Merge to develop (local testing)
git checkout develop
git merge feature/phase-3-workcenters
git push origin develop

# When ready for staging (Cloudflare deployment)
git checkout staging
git merge develop
git push origin staging  # Triggers GitHub Actions → Cloudflare

# When ready for production
git checkout main
git merge staging
git tag v1.0.0
git push origin main --tags  # Triggers GitHub Actions → AWS
```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature (Phase X completion)
fix: bug fix in RBAC middleware
docs: update README with Phase 2 guide
refactor: reorganize GIS package structure
test: add unit tests for GeoJSON parser
chore: update dependencies
ci: add GitHub Actions for Cloudflare deploy
```

### Protection Rules

**main** (production):
- Require PR approval (1+ reviewer)
- Require status checks to pass
- Require up-to-date branches
- No force push
- No deletion

**staging** (pre-production):
- Require status checks to pass
- No force push

**develop** (integration):
- Optional protections
- Allow force push for maintainers

---

## CI/CD Deployment Strategy

### Branch → Deployment Mapping

```
develop  → No CI/CD (local development only)
staging  → Cloudflare Staging (auto-deploy)
main     → Cloudflare Production (manual approval required)
```

### Cloudflare Deployments

**Staging Environment** (auto-deploy on push to `staging`):
- **API**: `c2-api-staging` Worker
  - Custom domain: `api.staging.opraxius.com`
  - Wrangler config: `apps/api-workers/wrangler.staging.toml`
  - GitHub Actions: `.github/workflows/deploy-staging.yml`
- **Web**: `c2-web-staging` Pages
  - Custom domain: `staging.opraxius.com`
  - Wrangler config: `apps/web/wrangler.staging.toml`
  - GitHub Actions: `.github/workflows/deploy-staging.yml`

**Production Environment** (manual approval on push to `main`):
- **API**: `c2-api-production` Worker
  - Custom domain: `api.opraxius.com`
  - Wrangler config: `apps/api-workers/wrangler.toml`
  - GitHub Actions: `.github/workflows/deploy-production.yml`
- **Web**: `c2-web-production` Pages
  - Custom domain: `dashboard.opraxius.com`
  - Wrangler config: `apps/web/wrangler.toml`
  - GitHub Actions: `.github/workflows/deploy-production.yml`

### GitHub Environments

**`staging` environment**:
- No protection rules (auto-deploy)
- Variables:
  - `STAGING_API_URL`: https://api.staging.opraxius.com
  - `STAGING_WEB_URL`: https://staging.opraxius.com
- Secrets: DATABASE_URL, JWT_SECRET, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID

**`production` environment**:
- Requires 1+ manual approvals before deployment
- Variables:
  - `PRODUCTION_API_URL`: https://api.opraxius.com
  - `PRODUCTION_WEB_URL`: https://dashboard.opraxius.com
- Secrets: (separate from staging) DATABASE_URL, JWT_SECRET, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID

### Deployment Workflow

```bash
# Local development (no deployment)
git checkout develop
# Work and test locally

# Deploy to staging
git checkout staging
git merge develop
git push origin staging  # Triggers GitHub Actions → Cloudflare Staging

# Test at https://staging.opraxius.com and https://api.staging.opraxius.com

# Deploy to production (requires manual approval)
git checkout main
git merge staging
git tag v1.0.0
git push origin main --tags  # Triggers GitHub Actions → Awaits approval → Cloudflare Production

# Test at https://dashboard.opraxius.com and https://api.opraxius.com
```

### CI/CD Pipeline Steps

Each deployment runs:
1. **Database Migrations** - Run `drizzle-kit push` on target database
2. **Deploy API** - Deploy Workers with secrets injection
3. **Deploy Web** - Build Next.js with `@cloudflare/next-on-pages`, deploy to Pages
4. **Verify Deployment** - Health checks on API and Web URLs

---

## Development Commands

```bash
# Installation
make install              # Install all dependencies

# Database
make db-up                # Start PostgreSQL + PostGIS + Redis
make db-down              # Stop databases
make db-reset             # Drop and recreate database
cd packages/database && npm run db:studio  # Open Drizzle Studio (localhost:4983)

# Development servers
cd apps/api && npm run dev     # Start API (localhost:3001)
cd apps/web && npm run dev     # Start frontend (localhost:3000)
make dev                       # Start everything

# GeoJSON import
cd packages/gis
npm run import -- -f FILE.geojson -e EVENT_ID [--dry-run]

# Utilities
make lint                 # Run linters
make test                 # Run tests
make clean                # Clean build artifacts
```

---

## Key Environment Variables

```env
# Database
DATABASE_URL=postgresql://c2:password@localhost:5432/c2_commandcenter
REDIS_URL=redis://localhost:6379

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<random_secret>
AUTH0_CLIENT_ID=<your_client_id>
AUTH0_CLIENT_SECRET=<your_client_secret>
AUTH0_ISSUER_BASE_URL=https://<your-tenant>.auth0.com

# API
NEXT_PUBLIC_API_URL=http://localhost:3001
JWT_SECRET=<random_secret>
```

---

## Critical Implementation Patterns

### RBAC Enforcement

**Backend** (Fastify middleware):
```typescript
import { requireAuth, requirePermission, requireWorkcenterAccess } from './middleware/rbac.middleware';

fastify.get('/api/tasks', {
  preHandler: [requireAuth, requirePermission('tasks', 'read')]
}, handler);

fastify.post('/api/tasks', {
  preHandler: [requireAuth, requireWorkcenterAccess(['operations', 'production'])]
}, handler);
```

**Frontend** (React hooks):
```typescript
import { useAuth, usePermission, useWorkcenterAccess } from '@/hooks/useAuth';

const { user, isAuthenticated } = useAuth();
const canCreate = usePermission('tasks', 'create', 'operations');
const hasAccess = useWorkcenterAccess('operations');
```

### GeoJSON Import Pattern

```bash
# Preview import
npm run import -- -f cpns.geojson -e EVENT_ID --dry-run

# Import with defaults
npm run import -- -f plazas.geojson -e EVENT_ID --type zone --workcenter operations
```

### 3D Object Rendering

```typescript
// Point → Box
if (geometry.type === 'Point') {
  return <boxGeometry args={[width, height, depth]} />;
}

// Polygon → ExtrudeGeometry
if (geometry.type === 'Polygon') {
  const shape = new THREE.Shape(/* coordinates */);
  return <extrudeGeometry args={[shape, { depth: height }]} />;
}

// LineString → TubeGeometry
if (geometry.type === 'LineString') {
  const curve = new THREE.CatmullRomCurve3(/* points */);
  return <tubeGeometry args={[curve, segments, radius]} />;
}
```

---

## Common Issues & Solutions

### Port conflicts
```bash
lsof -ti:3000 | xargs kill  # Frontend
lsof -ti:3001 | xargs kill  # API
```

### Database issues
```bash
make db-reset               # Nuclear option
docker exec -it c2-postgres psql -U c2 -d c2_commandcenter  # Manual access
```

### TypeScript errors
```bash
cd packages/shared && npm run build    # Build shared types first
cd packages/database && npm run build  # Build database types
```

### Auth0 not configured
The app works without Auth0 in local dev! Mock auth is used. Only needed for real SSO.

---

## Success Metrics

### Phase 1 (Complete)
- ✅ Full stack runs with `make dev`
- ✅ Auth0 SSO working
- ✅ RBAC filtering working
- ✅ All API endpoints protected

### Phase 2 (Complete)
- ✅ 3D map renders and is interactive
- ✅ GeoJSON import works
- ✅ Click → detail panel functional
- ✅ Color coding by status working
- ✅ Cloudflare Workers compatible

### Phase 3 (Planned)
- Task CRUD operations working
- Real-time activity feed functional
- 8 workcenter pages operational
- Overall readiness dashboard accurate

---

## Next Steps for AI Assistant

When continuing this project:

1. **Always start by reading README.md** - It's the consolidated source of truth
2. **Check the current phase status** in Implementation Roadmap section
3. **Review the relevant PHASEx_COMPLETE.md** for detailed context
4. **Follow the systematic documentation approach**:
   - Work incrementally
   - Test frequently
   - Document as you go
   - Create phase completion doc when done
   - Update README.md with consolidated info
5. **Maintain the pattern**: Each phase gets its own completion document

---

## Documentation Philosophy

### Single Source of Truth: README.md
- Consolidated, comprehensive, always up-to-date
- First place to look for any information
- Contains all implemented features, how to use them, troubleshooting

### Phase Completion Snapshots: PHASEx_COMPLETE.md
- Preserves exact state at phase completion
- Detailed "what was built" inventory
- How to run/use the phase features
- Success criteria checklist
- Statistics and metrics
- What's next preview

### Context for Continuity: CLAUDE_CONTEXT.md (this file)
- Project overview and systematic approach
- Current state summary
- How to continue work
- Critical patterns and practices
- Environment setup

### Why This Approach?
1. **Easy project resumption** - AI assistants can quickly understand state
2. **Clear progress tracking** - Each phase completion is documented
3. **Knowledge preservation** - Implementation details don't get lost
4. **Reduced redundancy** - Consolidate into README, preserve snapshots in phase docs
5. **Better collaboration** - Team members or AI can pick up work seamlessly

---

## Project Statistics (Current)

- **Packages**: 6 (2 apps + 4 shared packages)
- **Database Tables**: 7 with PostGIS support
- **API Endpoints**: 9 protected routes
- **TypeScript Types**: 20+
- **Feature Types**: 17 venue feature types
- **Workcenters**: 8 departments
- **Roles**: 10 role definitions
- **3D Components**: 3 (VenueMap3D, VenueObject, FeatureDetailPanel)
- **Files Created**: 80+
- **Lines of Code**: ~5,000+

---

---

## Reusable Systematic Approach Template

This section describes how to adapt this documentation pattern for other projects.

### For New Projects: Initial Setup

1. **Create Core Documentation Files**:
   ```
   README.md              # Single source of truth
   CLAUDE_CONTEXT.md      # AI assistant context (this template)
   .env.example           # Environment variables template
   ```

2. **Customize CLAUDE_CONTEXT.md**:
   ```markdown
   # Project Overview
   - Repository location
   - Current phase/milestone
   - Status summary

   # Systematic Approach
   - Phase completion documentation pattern
   - Branching strategy (main/staging/develop/feature/*)
   - Commit conventions

   # Current State
   - What's been built (by phase)
   - Tech stack
   - File structure

   # How to Continue Work
   - Starting a new session
   - Working on next phase
   - Documentation maintenance

   # Critical Patterns
   - Project-specific implementations
   - Common issues & solutions
   ```

3. **Set Up Branching**:
   ```bash
   git checkout -b develop
   git push -u origin develop

   git checkout -b staging
   git push -u origin staging

   git checkout develop
   ```

### For Multi-Phase Projects: Phase Workflow

**At Phase Start**:
1. Create feature branch: `feature/phase-N-name`
2. Work incrementally
3. Update README.md as you build

**At Phase End**:
1. Create `PHASEN_COMPLETE.md` with:
   - ✅ What Was Built
   - 📊 Critical Files Created
   - 🎯 Success Criteria Met
   - 🚀 How to Run/Use
   - 📖 What Works Now
   - 🎉 What's Next
   - 📊 Statistics

2. Update README.md:
   - Consolidate phase features into main docs
   - Update roadmap with completed phase

3. Update CLAUDE_CONTEXT.md:
   - Mark phase as complete
   - Update "Current State" section
   - Add any new critical patterns

4. Merge workflow:
   ```bash
   git checkout develop
   git merge feature/phase-N-name
   git push origin develop

   # When tested and ready
   git checkout staging
   git merge develop
   git push origin staging  # Auto-deploys to Cloudflare
   ```

### Suggestions for Future Improvements

1. **Automation Opportunities**:
   - Script to generate PHASEN_COMPLETE.md template
   - Pre-commit hooks to enforce commit conventions
   - Auto-generate README table of contents
   - CI/CD pipeline templates

2. **Enhanced Documentation**:
   - Architecture decision records (ADRs)
   - API documentation (OpenAPI/Swagger)
   - Component storybook for UI
   - Performance benchmarks per phase

3. **AI Assistant Optimization**:
   - **Context Priming**: Start new sessions with "Read README.md, CLAUDE_CONTEXT.md, and PHASEN_COMPLETE.md"
   - **Incremental Updates**: Update docs as you build, not at the end
   - **Clear Handoffs**: When context limit is near, create a handoff document with current TODO and blockers
   - **Code References**: Use file:line format in docs for easy navigation

4. **Branching Enhancements**:
   - `hotfix/*` branches for emergency fixes
   - `release/*` branches for release preparation
   - GitHub Actions for auto-labeling PRs
   - Automated changelog generation

5. **Testing Integration**:
   - Add test coverage to phase completion docs
   - Document critical test cases
   - Include test commands in README

### Template for Other Projects

Save this structure to reuse:

```
project-name/
├── README.md                    # Consolidated docs (quick start, features, API, troubleshooting)
├── CLAUDE_CONTEXT.md            # AI assistant context (phases, branching, patterns)
├── IMPLEMENTATION_PLAN.md       # Full technical architecture (6-phase roadmap)
├── PHASE1_COMPLETE.md           # Phase 1 snapshot
├── PHASE2_COMPLETE.md           # Phase 2 snapshot
├── .env.example                 # Environment template
└── .github/
    └── workflows/
        ├── staging.yml          # Auto-deploy to Cloudflare
        └── production.yml       # Deploy to AWS
```

### Key Principles

1. **Documentation as Code**: Treat docs like code - version controlled, reviewed, updated
2. **Single Source of Truth**: README.md is always authoritative
3. **Phase Snapshots**: PHASEx_COMPLETE.md preserves exact state
4. **Clear Branching**: develop → staging → main with automation
5. **Systematic Approach**: Repeat pattern for every phase
6. **AI-Friendly**: Make it easy for AI to understand and continue work

---

## CI/CD Setup Complete

**Completed**: 2025-12-18

### ✅ Infrastructure Status
- Branch-based deployment strategy implemented and tested
- GitHub environments configured (staging + production)
- Cloudflare custom domains assigned:
  - Staging: `staging.opraxius.com` + `api.staging.opraxius.com`
  - Production: `opraxius.com` + `api.opraxius.com`
- Environment variables and secrets configured in GitHub
- Wrangler configs created for both environments

### Configuration Files Created
- `.github/workflows/deploy-staging.yml` - Auto-deploys on push to `staging` branch
- `.github/workflows/deploy-production.yml` - Deploys on push to `main` (with approval)
- `apps/api-workers/wrangler.staging.toml` - Staging API config
- `apps/api-workers/wrangler.toml` - Production API config
- `apps/web/wrangler.staging.toml` - Staging web config
- `apps/web/wrangler.toml` - Production web config

### Workflow Tested
- ✅ `develop` branch: Confirmed no CI/CD triggers (local only)
- Ready to test: `staging` branch auto-deployment
- Ready to test: `main` branch production deployment with manual approval

### How to Deploy

**To Staging:**
```bash
git checkout staging
git merge develop
git push origin staging  # Auto-deploys to staging.opraxius.com
```

**To Production:**
```bash
git checkout main
git merge staging
git tag v1.0.0
git push origin main --tags  # Waits for manual approval, then deploys to opraxius.com
```

### Deployment Verification
After each deployment, verify:
- **Staging**: https://staging.opraxius.com | https://api.staging.opraxius.com/health
- **Production**: https://dashboard.opraxius.com | https://api.opraxius.com/health

---

## C2 Rebrand Complete

**Completed**: December 19, 2025

### ✅ Rebrand Summary
- Full rename from ESG Command Center → C2 Command Center
- Repository renamed: `esg-commandcenter` → `c2-opraxius`
- Git remote updated to new repository URL
- Docker containers renamed: `c2-postgres`, `c2-redis`
- Database credentials updated: `c2:password@localhost:5432/c2_commandcenter`
- All package names updated to `@c2/*` namespace
- Cloudflare Projects renamed to `c2-*` naming convention
- API name updated: "C2 Command Center API"

### ✅ Custom Domain Configuration
- **Staging Web**: `staging.opraxius.com` (c2-web-staging Pages)
- **Production Web**: `dashboard.opraxius.com` (c2-web-production Pages)
- **Staging API**: `api.staging.opraxius.com` (c2-api-staging Worker)
- **Production API**: `api.opraxius.com` (c2-api-production Worker)

### ✅ Hostname Blocking Middleware
Implemented defense-in-depth security to block default Cloudflare URLs:

**Frontend** ([apps/web/src/middleware.ts](apps/web/src/middleware.ts)):
- Next.js middleware blocks access to `*.pages.dev` URLs
- Returns 404 for unauthorized hostnames
- Only allows: `staging.opraxius.com`, `dashboard.opraxius.com`, `localhost`

**Backend** ([apps/api-workers/src/index.ts:19-34](apps/api-workers/src/index.ts#L19-L34)):
- Hono middleware blocks access to `*.workers.dev` URLs
- Returns 404 for unauthorized hostnames
- Only allows: `api.staging.opraxius.com`, `api.opraxius.com`, `localhost`

**CORS Updated** ([apps/api-workers/src/index.ts:56-60](apps/api-workers/src/index.ts#L56-L60)):
- Origin whitelist updated to custom domains only
- Removed old `esg-web-staging.pages.dev` reference
- Added: `staging.opraxius.com`, `dashboard.opraxius.com`

### Files Modified
- `apps/web/src/middleware.ts` (created)
- `apps/api-workers/src/index.ts` (hostname middleware + CORS + API name)
- `apps/web/wrangler.toml` (production URL comment)
- `packages/database/drizzle.config.ts` (database credentials)
- `docker-compose.yml` (container names + credentials)
- `turbo.json` (Turbo 2.0 migration: pipeline → tasks)
- `apps/api/tsconfig.json` (path aliases, removed rootDir)

### Deployment Status
- ✅ Changes pushed to `staging` branch
- ✅ Middleware deployed and active
- ✅ Default URLs blocked at edge and application level
- ✅ Custom domains configured in Cloudflare Dashboard

---

**Last Updated**: C2 Rebrand Complete - December 19, 2025
**Status**: Phase 2 Complete + C2 Rebrand + Hostname Security
**Next**: Begin Phase 3 - Workcenters & Dashboards
