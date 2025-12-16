# ESG Command Center - Context for Claude

**Last Updated**: December 15, 2025
**Current Phase**: Phase 1 Complete (100%)
**Next Phase**: Phase 2 - 3D Map & Interaction

---

## 📍 Project Status

### Completed ✅
- Turborepo monorepo structure (2 apps, 6 packages)
- PostgreSQL 15 + PostGIS 3.4 database
- Redis 7 cache
- Drizzle ORM with 7 tables
- Auth0 + NextAuth.js authentication
- RBAC system (10 roles, 8 workcenters, granular permissions)
- Fastify REST API (9 endpoints)
- Next.js 15 frontend
- Docker Compose development environment
- Complete documentation (6 markdown files)

### In Progress ⏳
- None (Phase 1 fully complete)

### Next Up 🎯
- Phase 2: Interactive 3D venue map with Three.js
- GeoJSON import CLI tool
- Clickable 3D objects
- Detail panels

---

## 🗂️ Project Structure

```
/Users/roger/Desktop/Projects/esg-commandcenter/
├── apps/
│   ├── web/                 # Next.js 15 frontend (port 3000)
│   └── api/                 # Fastify backend (port 3001)
├── packages/
│   ├── shared/              # TypeScript types (20+ types)
│   ├── database/            # Drizzle ORM (7 tables)
│   ├── ui/                  # (ready for Phase 3)
│   ├── auth/                # (ready for future)
│   └── gis/                 # (ready for Phase 2)
├── docker-compose.yml       # PostgreSQL + Redis
├── Makefile                 # Development commands
└── [6 documentation files]
```

---

## 🔑 Key Files (Critical for Understanding)

### Database Schema
- `packages/database/src/schema/index.ts` - All 7 tables
- `packages/database/init.sql` - SQL initialization

### Authentication & RBAC
- `apps/web/src/lib/auth.ts` - NextAuth + Auth0 config
- `apps/api/src/services/rbac.service.ts` - RBAC logic
- `apps/api/src/middleware/auth.middleware.ts` - JWT auth
- `apps/api/src/middleware/rbac.middleware.ts` - Permission checks
- `apps/web/src/hooks/useAuth.ts` - Frontend RBAC hooks

### API Endpoints
- `apps/api/src/server.ts` - Fastify server
- `apps/api/src/routes/events.routes.ts` - Events API
- `apps/api/src/routes/tasks.routes.ts` - Tasks API (RBAC filtered)
- `apps/api/src/routes/venues.routes.ts` - Venues API (RBAC filtered)

### Shared Types
- `packages/shared/src/types/venue.types.ts` - 17 venue feature types, GeoJSON
- `packages/shared/src/types/task.types.ts` - Task management
- `packages/shared/src/types/user.types.ts` - Users, roles, permissions
- `packages/shared/src/constants/workcenters.ts` - 8 workcenters
- `packages/shared/src/constants/roles.ts` - 10 roles with permissions

---

## 🗄️ Database Schema (7 Tables)

1. **events** - Festival events (EDC Las Vegas, EDC Orlando)
   - PostGIS geometry for venue boundaries

2. **users** - User management
   - Auth0 SSO integration
   - Roles and workcenter access arrays
   - JSONB permissions

3. **venue_features** - GIS data
   - PostGIS geometry (Point, Polygon, LineString)
   - 17 feature types (stage, gate, vendor_booth, etc.)
   - Workcenter access control

4. **tasks** - Task management
   - Critical path tracking
   - Dependencies array
   - Workcenter assignment
   - RBAC filtering

5. **workcenters** - 8 departments
   - Operations, Production, Security, Workforce, Vendors, Sponsors, Marketing, Finance
   - Completion percentage tracking

6. **activity_feed** - Real-time activity log
   - Task updates, status changes
   - Filterable by workcenter

7. **ai_chat_history** - Claude conversations (Phase 4)
   - RBAC context logging

---

## 🔐 RBAC System

### 10 Roles
- `admin` - Full access
- `operations_lead`, `production_lead`, `security_lead`, `workforce_lead`
- `vendor_lead`, `sponsor_lead`, `marketing_lead`, `finance_lead`
- `viewer` - Read-only

### 8 Workcenters
- Operations, Production, Security, Workforce
- Vendors, Sponsors, Marketing, Finance

### Permission Model
```typescript
{
  resource: 'tasks' | 'venue_features' | 'events' | 'users',
  action: 'create' | 'read' | 'update' | 'delete',
  workcenter?: string  // Optional scope
}
```

---

## 🚀 How to Run

### Start Everything
```bash
cd /Users/roger/Desktop/Projects/esg-commandcenter

# Databases (already running)
make db-up

# Terminal 1: API
cd apps/api && npm run dev

# Terminal 2: Web
cd apps/web && npm run dev
```

### Verify Running
- Frontend: http://localhost:3000
- API Health: http://localhost:3001/health
- Database: PostgreSQL on port 5432, Redis on port 6379

---

## 📊 API Endpoints

All routes protected with JWT auth and RBAC:

```
GET  /health                    # Health check (no auth)
GET  /api/events                # List events
GET  /api/events/:id            # Get event
POST /api/events                # Create event (admin)
GET  /api/tasks                 # List tasks (RBAC filtered)
GET  /api/tasks/:id             # Get task
POST /api/tasks                 # Create task (workcenter permission)
PATCH /api/tasks/:id            # Update task (workcenter permission)
GET  /api/venues                # List venue features (RBAC filtered)
GET  /api/venues/:id            # Get venue feature
POST /api/venues                # Create venue feature
```

---

## 🎨 Tech Stack

### Frontend
- Next.js 15 (App Router)
- React 18 + TypeScript
- Three.js (installed, ready for Phase 2)
- Tailwind CSS + Shadcn/ui
- NextAuth.js + Auth0
- React Query (TanStack Query)
- Zustand

### Backend
- Node.js + Fastify
- PostgreSQL 15 + PostGIS 3.4
- Drizzle ORM
- Redis 7
- JWT authentication
- TypeScript (ESM)

### Infrastructure
- Docker + Docker Compose
- Turborepo (monorepo)
- Makefile

---

## 🎯 Phase 2 Plan (Next Steps)

**Goal**: Interactive 3D venue map

**Key Deliverables**:
1. Three.js + React Three Fiber scene
2. GeoJSON import CLI tool
3. Clickable 3D objects (stages, gates, booths)
4. Detail panels on click
5. 2D/3D map toggle
6. Performance optimization (instancing, LOD)

**Critical Files to Create**:
- `apps/web/src/components/map/VenueMap3D.tsx`
- `apps/web/src/components/map/VenueObject.tsx`
- `packages/gis/src/geojson-importer.ts`
- `packages/gis/src/coordinates.ts`

**Reference Data**: `/Users/roger/Desktop/Projects/innovate-GIS-data` (Burning Man GIS)

---

## 🐛 Known Issues / Notes

- Auth0 credentials in `.env` are placeholders (works without SSO for dev)
- API uses mock user data if no Auth0 token provided
- PostGIS 3.4 is working and verified
- All 7 database tables created and indexed
- No security vulnerabilities in npm packages

---

## 📖 Documentation Files

1. **START_HERE.md** - Quick start guide
2. **PHASE1_COMPLETE.md** - Detailed Phase 1 summary
3. **QUICKSTART.md** - 5-minute setup
4. **README.md** - Full project docs
5. **IMPLEMENTATION_PLAN.md** - 6-phase architecture
6. **SETUP_COMPLETE.md** - Setup status
7. **CLAUDE_CONTEXT.md** - This file (for next Claude session)

---

## 💬 Prompts for Next Claude Session

### To Continue Phase 2:
```
I'm working on the ESG Command Center festival management dashboard.
Phase 1 (core infrastructure, auth, RBAC, API) is complete.

Please read CLAUDE_CONTEXT.md to understand the current state.

I'm ready to start Phase 2: Interactive 3D venue map with Three.js.

The plan is in IMPLEMENTATION_PLAN.md under "Phase 2".

Let's begin by creating the VenueMap3D component.
```

### To Review Current State:
```
Please review the ESG Command Center project at:
/Users/roger/Desktop/Projects/esg-commandcenter

Read CLAUDE_CONTEXT.md for full context.

I want to understand the current RBAC implementation.
```

### To Add Features:
```
I have the ESG Command Center running (see CLAUDE_CONTEXT.md for context).

I want to add [specific feature] to [workcenter/component].

Please help me implement this.
```

---

## 🎓 Architecture Decisions

### Why Turborepo?
- Shared TypeScript types across apps
- Faster builds with caching
- Easy dependency management

### Why Drizzle ORM?
- Better TypeScript inference than Prisma
- More control over queries
- Excellent PostGIS support

### Why Fastify?
- Better performance than Express
- Native TypeScript support
- Plugin ecosystem

### Why NextAuth.js?
- Best Auth0 integration for Next.js
- Flexible callback system
- Built-in session management

### Why Three.js?
- Most mature WebGL library
- Massive ecosystem
- React Three Fiber for declarative 3D

---

## 📊 Statistics

- **Files Created**: 80+
- **Lines of Code**: ~5,000+
- **TypeScript Types**: 20+
- **API Endpoints**: 9
- **Database Tables**: 7
- **Roles**: 10
- **Workcenters**: 8
- **Venue Feature Types**: 17

---

## ✅ Phase 1 Completion Checklist

- [x] Monorepo structure
- [x] Database schema
- [x] PostGIS enabled
- [x] Auth0 + NextAuth.js
- [x] RBAC system
- [x] API routes
- [x] Frontend providers
- [x] RBAC hooks
- [x] Docker setup
- [x] Documentation
- [x] Dependencies installed
- [x] Database initialized
- [x] All tests passing

**Status**: ✅ PHASE 1 COMPLETE - Ready for Phase 2

---

**Project**: ESG Command Center - Festival Management Dashboard
**Client**: Insomniac Events (EDC Las Vegas, EDC Orlando)
**Developer**: Roger Emerson
**AI Assistant**: Claude Sonnet 4.5
**Date**: December 15, 2025
