# Opraxius C2

Event Management Command & Control

> **Current Status**: Phase 1, 2, & 2b complete. Auth.js v5 migration done. Ready for Phase 3.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [What's Been Built](#whats-been-built)
- [Development Workflow](#development-workflow)
- [GeoJSON Import](#geojson-import)
- [Database](#database)
- [Authentication & RBAC](#authentication--rbac)
- [API Endpoints](#api-endpoints)
- [3D Map Features](#3d-map-features)
- [Deployment](#deployment)
- [Implementation Roadmap](#implementation-roadmap)
- [Troubleshooting](#troubleshooting)

---

## Overview

Opraxius C2 is an internal command and control dashboard providing a single pane of glass for managing large-scale festival operations across multiple offices and departments.

### Key Features

- **Interactive 3D Venue Visualization** - Rotatable, zoomable 3D map with clickable objects
- **GeoJSON Import Tool** - CLI tool for importing Burning Man-style GIS data
- **8 Specialized Workcenters** - Operations, Production, Security, Workforce, Vendors, Sponsors, Marketing, Finance
- **Real-time Status Dashboard** - Overall readiness %, critical items, workstream progress
- **AI-Powered Assistant** - Claude AI integration with RBAC-scoped context (Phase 4)
- **Role-Based Access Control** - SSO with Auth0, granular permissions per workcenter
- **GIS Data Management** - PostGIS-powered spatial data for venue features

---

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker Desktop

### Get Running in 5 Minutes

```bash
# 1. Clone repository
git clone https://github.com/roger-emerson/c2-opraxius.git
cd c2-opraxius

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your Auth0 credentials (optional for local testing)

# 4. Start database services
make db-up

# 5. Initialize database
cd packages/database
npm install
npm run db:push
cd ../..

# 6. Start API server (Terminal 1)
cd apps/api
npm run dev

# 7. Start web server (Terminal 2 - new terminal)
cd apps/web
npm run dev
```

**Visit**: http://localhost:3000

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: React 18 + TypeScript
- **3D Visualization**: Three.js + React Three Fiber + Drei
- **Styling**: Tailwind CSS + Shadcn/ui
- **State**: Zustand + React Query (TanStack Query)
- **Real-time**: Pusher/Socket.IO (Phase 3)

### Backend
- **Framework**: Node.js + Fastify
- **Database**: PostgreSQL 15 + PostGIS 3.4
- **ORM**: Drizzle ORM
- **Cache**: Redis 7
- **Auth**: Auth0 + NextAuth.js

### Infrastructure
- **Dev**: Docker + Docker Compose
- **Monorepo**: Turborepo
- **Staging**: Cloudflare Workers
- **Production**: AWS (ECS, RDS, ElastiCache, S3)

---

## Project Structure

```
c2-opraxius/
├── apps/
│   ├── web/                      # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/             # App router pages
│   │   │   │   ├── (dashboard)/  # Protected dashboard routes
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── map/page.tsx
│   │   │   │   ├── auth/        # Auth pages
│   │   │   │   └── api/auth/    # NextAuth routes
│   │   │   ├── components/
│   │   │   │   └── map/         # 3D map components
│   │   │   │       ├── VenueMap3D.tsx
│   │   │   │       ├── VenueObject.tsx
│   │   │   │       └── FeatureDetailPanel.tsx
│   │   │   ├── hooks/           # RBAC hooks
│   │   │   └── lib/             # Auth config
│   │   └── package.json
│   └── api/                      # Fastify backend
│       ├── src/
│       │   ├── routes/          # API routes
│       │   ├── services/        # Business logic
│       │   ├── middleware/      # Auth & RBAC
│       │   └── server.ts
│       └── package.json
├── packages/
│   ├── shared/                   # Shared types & constants
│   │   ├── src/
│   │   │   ├── types/           # TypeScript types
│   │   │   └── constants/       # Workcenters, roles
│   │   └── package.json
│   ├── database/                 # Drizzle schema & migrations
│   │   ├── src/schema/          # 7 table schemas
│   │   └── drizzle.config.ts
│   ├── gis/                      # GeoJSON utilities
│   │   ├── src/
│   │   │   ├── coordinates.ts   # Coordinate conversion
│   │   │   ├── geojson-parser.ts # GeoJSON parsing
│   │   │   └── cli/importer.ts  # Import CLI tool
│   │   └── package.json
│   ├── ui/                       # Shared UI components
│   └── auth/                     # Auth utilities
├── docker-compose.yml            # Dev services
├── turbo.json                    # Turborepo config
├── Makefile                      # Common commands
└── README.md
```

---

## What's Been Built

### ✅ Phase 1: Core Infrastructure (Complete)

**Infrastructure**:
- Turborepo monorepo (2 apps, 6 packages)
- PostgreSQL 15 + PostGIS 3.4 + Redis 7 in Docker
- TypeScript configuration across all packages
- Makefile for common development commands

**Database** (7 tables):
- `events` - Festival events with venue boundaries (PostGIS geometry)
- `users` - Users with Auth0 SSO and RBAC
- `venue_features` - GIS data with PostGIS geometry (Point, Polygon, LineString)
- `tasks` - Task management with dependencies and critical path
- `workcenters` - 8 department tracking with completion %
- `activity_feed` - Real-time activity log
- `ai_chat_history` - Claude chat history (Phase 4)

**Authentication & RBAC**:
- Auth0 + NextAuth.js authentication
- 10 roles (admin, operations_lead, production_lead, etc.)
- 8 workcenters (Operations, Production, Security, etc.)
- Granular permission system (resource + action + workcenter)
- RBAC middleware (backend) and hooks (frontend)

**REST API** (Fastify):
- `/api/events` - Event management
- `/api/tasks` - Task CRUD with RBAC filtering
- `/api/venues` - Venue features with RBAC filtering
- JWT authentication middleware
- Permission-based route protection

### ✅ Phase 2: 3D Map & Interaction (Complete)

**GIS Package** (`packages/gis`):
- Coordinate conversion (lat/lng ↔ Three.js 3D space)
- GeoJSON parser with feature type inference
- Validation and statistics utilities
- CLI import tool for Burning Man-style GIS data

**3D Map Components**:
- `VenueMap3D.tsx` - Main Three.js scene with OrbitControls
- `VenueObject.tsx` - Renders Point/Polygon/LineString as 3D geometry
- `FeatureDetailPanel.tsx` - Slide-out detail panel with tasks

**Key Features**:
- Interactive 3D scene (rotate, pan, zoom)
- Color coding by status (pending=gray, in_progress=yellow, completed=green, blocked=red)
- Hover effects (orange highlight)
- Click interactions → detail panel
- Geometry generation: Point → Box, Polygon → Extruded Shape, LineString → Tube
- Ambient and directional lighting
- Shadow casting and receiving
- Task fetching and display

**Dashboard Integration**:
- Protected dashboard layout with sidebar
- Workcenter navigation
- Full-screen 3D map view
- User info display

### 🚧 Phase 3: Workcenters & Dashboards (Planned)

- 8 specialized workcenter pages
- Overall Readiness progress bar
- Critical Items panel
- Workstream Progress bars
- Real-time Activity Feed (Pusher/Socket.IO)
- Task CRUD operations
- Task dependencies and critical path

### 🚧 Phase 4: AI Agent Integration (Planned)

- Claude API integration
- RBAC-scoped context
- Chat interface
- Proactive suggestions

### 🚧 Phase 5: External Integrations (Planned)

- IoT sensor integration
- Ticketing system API
- Vendor system sync
- Stripe webhooks

### 🚧 Phase 6: Production Readiness (Planned)

- Performance optimization
- Security audit
- AWS infrastructure
- CI/CD pipeline
- Monitoring and logging

---

## Development Workflow

### Running Locally

```bash
# Start database services
make db-up

# Terminal 1: Start API
cd apps/api
npm run dev

# Terminal 2: Start frontend
cd apps/web
npm run dev

# Or use make command to start everything
make dev
```

**URLs**:
- Frontend: http://localhost:3000
- API: http://localhost:3001
- Database: localhost:5432
- Redis: localhost:6379

### Makefile Commands

```bash
make install       # Install all dependencies
make dev          # Start development environment
make db-up        # Start database services only
make db-down      # Stop database services
make db-reset     # Reset database (drop + recreate)
make db-migrate   # Run database migrations
make db-seed      # Seed database with sample data
make test         # Run all tests
make lint         # Run linters
make clean        # Clean build artifacts
```

### Database Management

```bash
# View database in browser (Drizzle Studio)
cd packages/database
npm run db:studio
# Opens http://localhost:4983

# Generate migration
npm run db:generate

# Push schema changes
npm run db:push

# Seed database
npm run db:seed
```

### Adding Dependencies

```bash
# Add to root (monorepo tools)
npm install -D <package> -w root

# Add to web app
npm install <package> -w @c2/web

# Add to API
npm install <package> -w @c2/api

# Add to shared package
npm install <package> -w @c2/shared
```

---

## GeoJSON Import

### CLI Tool

Import Burning Man-style GIS data into the database:

```bash
cd packages/gis

# Preview import (dry run)
npm run import -- \
  -f ../../innovate-GIS-data/2025/GeoJSON/cpns.geojson \
  -e YOUR_EVENT_ID \
  --dry-run

# Import for real
npm run import -- \
  -f ../../innovate-GIS-data/2025/GeoJSON/cpns.geojson \
  -e YOUR_EVENT_ID

# Import with custom defaults
npm run import -- \
  -f FILE.geojson \
  -e EVENT_ID \
  --type stage \
  --workcenter production
```

### Supported GeoJSON Files

Compatible with Burning Man reference data:
- `cpns.geojson` - Points of Interest (48 features)
- `plazas.geojson` - Gathering Spaces (10 features)
- `street_lines.geojson` - Roads (599 features)
- `toilets.geojson` - Restrooms (45 features)
- `trash_fence.geojson` - Boundary (1 feature)

### Feature Type Inference

The parser automatically infers feature types from names:
- "Stage" → `stage`
- "Gate" / "Portal" → `gate`
- "Vendor" / "Booth" → `vendor_booth`
- "Toilet" / "Restroom" → `restroom`
- "Plaza" / "Promenade" → `zone`
- "Medical" / "HEaT" → `medical_tent`
- "Security" / "Ranger" → `security_post`
- "Water" / "Arctica" / "Ice" → `water_station`
- "Fence" / "Boundary" → `fence`
- "Street" / "Road" → `road`

### Coordinate Conversion

Geographic coordinates (lat/lng) are converted to Three.js 3D space:

```typescript
// Simple planar projection
x = lng * scaleFactor
z = -lat * scaleFactor  // Negated for map orientation
y = altitude

// Default scale factor: 1000
// Adjustable based on venue size
```

---

## Database

### Schema (7 Tables)

**events**:
- Festival events with venue boundaries (PostGIS geometry)
- Event types: `edc_las_vegas`, `edc_orlando`, `beyond_wonderland`, etc.
- Status: `planning`, `active`, `completed`, `cancelled`

**users**:
- Auth0 SSO integration (`auth0_user_id`)
- Role: admin, operations_lead, production_lead, etc.
- Workcenters: Array of accessible workcenters
- Permissions: JSONB with granular access control

**venue_features**:
- GIS data with PostGIS geometry (Point, Polygon, LineString)
- 17 feature types (stage, gate, vendor_booth, etc.)
- Workcenter access control array
- Status: `pending`, `in_progress`, `completed`, `blocked`
- Completion percentage tracking

**tasks**:
- Task management with dependencies
- Critical path tracking (`is_critical_path`)
- Priority: `low`, `medium`, `high`, `critical`
- Linked to venue features and events

**workcenters**:
- 8 departments with completion percentages
- Status: `on_track`, `at_risk`, `delayed`

**activity_feed**:
- Real-time activity log
- Filterable by workcenter

**ai_chat_history**:
- Claude conversation history
- RBAC context logging for audit

### PostGIS Support

Spatial queries enabled:
- ST_Contains, ST_Intersects, ST_Distance
- Geometry types: Point, LineString, Polygon
- GIST indexes for fast spatial queries

### Connection

```typescript
// packages/database/src/client.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client);
```

---

## Authentication & RBAC

### Auth0 Setup

1. Create Auth0 tenant at https://auth0.com
2. Create a new Application (Regular Web Application)
3. Configure Allowed Callback URLs: `http://localhost:3000/api/auth/callback/auth0`
4. Configure Allowed Logout URLs: `http://localhost:3000`
5. Copy Client ID and Client Secret to `.env`:

```env
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret
```

### Roles (10 Roles Defined)

- `admin` - Full access to everything
- `operations_lead` - Operations workcenter + read others
- `production_lead` - Production workcenter + read others
- `security_lead` - Security workcenter + read others
- `workforce_lead` - Workforce workcenter + read others
- `vendor_lead` - Vendors workcenter + read others
- `sponsor_lead` - Sponsors workcenter + read others
- `marketing_lead` - Marketing workcenter + read others
- `finance_lead` - Finance workcenter + read others
- `viewer` - Read-only access to assigned workcenters

### Workcenters (8 Departments)

1. **Operations** - Venue logistics, infrastructure
2. **Production** - Stage production, audio/visual
3. **Security** - Safety, access control
4. **Workforce** - Staff management, scheduling
5. **Vendors** - Food, merchandise vendors
6. **Sponsors** - Sponsor activations, VIP
7. **Marketing** - Marketing, social media
8. **Finance** - Budgets, payments

### Permission Model

```typescript
type Permission = {
  resource: 'tasks' | 'venue_features' | 'events' | 'users';
  action: 'create' | 'read' | 'update' | 'delete';
  workcenter?: Workcenter;  // Optional scope
};
```

### RBAC Hooks (Frontend)

```typescript
import { useAuth, usePermission, useWorkcenterAccess } from '@/hooks/useAuth';

// Get current user
const { user, isAuthenticated, isLoading } = useAuth();

// Check permission
const canCreateTask = usePermission('tasks', 'create', 'operations');

// Check workcenter access
const hasOperationsAccess = useWorkcenterAccess('operations');

// Get user's workcenters
const { workcenters } = useWorkcenters();
```

### RBAC Middleware (Backend)

```typescript
import { requireAuth, requirePermission, requireWorkcenterAccess } from './middleware/rbac.middleware';

// Protect route
fastify.get('/api/tasks', {
  preHandler: [requireAuth, requirePermission('tasks', 'read')]
}, async (request, reply) => {
  // Route handler
});

// Workcenter-specific route
fastify.post('/api/tasks', {
  preHandler: [requireAuth, requireWorkcenterAccess(['operations', 'production'])]
}, async (request, reply) => {
  // Route handler
});
```

---

## API Endpoints

Base URL: `http://localhost:3001`

### Events

```bash
# List all events (RBAC filtered)
GET /api/events

# Get event by ID
GET /api/events/:id

# Create event (admin only)
POST /api/events
Content-Type: application/json
{
  "name": "EDC Las Vegas 2025",
  "slug": "edc-las-vegas-2025",
  "eventType": "edc_las_vegas",
  "startDate": "2025-05-16T00:00:00Z",
  "endDate": "2025-05-18T23:59:59Z",
  "status": "planning"
}
```

### Tasks

```bash
# List tasks (filtered by user's workcenters)
GET /api/tasks
GET /api/tasks?workcenter=operations
GET /api/tasks?eventId=EVENT_ID
GET /api/tasks?venueFeatureId=FEATURE_ID

# Get task by ID
GET /api/tasks/:id

# Create task (workcenter permission required)
POST /api/tasks
Content-Type: application/json
{
  "title": "Install main stage lighting",
  "description": "Install and test lighting rig",
  "workcenter": "production",
  "priority": "high",
  "status": "pending",
  "eventId": "EVENT_ID"
}

# Update task
PATCH /api/tasks/:id
Content-Type: application/json
{
  "status": "completed",
  "completedAt": "2025-12-17T12:00:00Z"
}
```

### Venue Features

```bash
# List venue features (RBAC filtered)
GET /api/venues
GET /api/venues?eventId=EVENT_ID
GET /api/venues?featureType=stage

# Get venue feature by ID
GET /api/venues/:id

# Create venue feature (permissions required)
POST /api/venues
Content-Type: application/json
{
  "name": "kineticFIELD",
  "featureType": "stage",
  "geometry": {
    "type": "Point",
    "coordinates": [-115.145, 36.272]
  },
  "eventId": "EVENT_ID",
  "workcenterAccess": ["production", "operations"]
}
```

### Health Check

```bash
GET /health
# Returns: {"status":"ok","timestamp":"2025-12-17T..."}
```

---

## 3D Map Features

### Navigation Controls

- **Rotate**: Left-click and drag
- **Pan**: Right-click and drag
- **Zoom**: Mouse wheel scroll

### Visual Features

**Color Coding by Status**:
- Gray: Pending
- Yellow: In Progress
- Green: Completed
- Red: Blocked

**Hover Effects**:
- Orange highlight when hovering over objects

**Selection Animation**:
- Pulsing effect on selected object

**Lighting**:
- Ambient light (soft overall illumination)
- Directional light with shadows

**Ground**:
- Infinite grid plane

### Geometry Types

**Point Features** (stages, gates, booths):
- Rendered as `BoxGeometry`
- Size and height vary by feature type

**Polygon Features** (plazas, zones):
- Extruded shapes from coordinate outlines
- Height based on feature type

**LineString Features** (roads, pathways):
- Tube geometry along curve path
- Width based on feature type

### Detail Panel

Click any 3D object to view:
- Feature name, code, and type
- Status badge
- Completion percentage with progress bar
- Workcenter access chips
- Additional properties
- Associated tasks (with status and priority)
- Geometry type

### Performance

**Optimizations**:
- Suspense for lazy loading
- Memoized geometry creation
- Shadow map size: 2048x2048
- Instancing ready (Phase 2 Week 5)

**Planned**:
- LOD (Level of Detail) system
- Frustum culling (automatic in Three.js)
- Texture atlasing
- Bundle size optimization

---

## Deployment

### Local Development

```bash
# Full stack
make dev

# Or manually
make db-up
cd apps/api && npm run dev
cd apps/web && npm run dev
```

### Staging (Cloudflare) - **✅ Configured**

**Branch:** `staging`
**Auto-deploys on:** Push to `staging` branch
**URLs:**
- Web: https://staging.web.opraxius.com
- API: https://staging.api.opraxius.com

```bash
# Deploy to staging
git checkout staging
git merge develop
git push origin staging  # Triggers GitHub Actions
```

**What happens:**
1. Database migrations run on staging database
2. API deploys to `c2-api-staging` Worker
3. Web builds with @cloudflare/next-on-pages and deploys to `c2-web-staging` Pages
4. Health checks verify deployment

### Production (Cloudflare) - **✅ Configured**

**Branch:** `main`
**Deploys on:** Push to `main` branch (requires manual approval)
**URLs:**
- Web: https://dashboard.opraxius.com
- API: https://api.opraxius.com

```bash
# Deploy to production
git checkout main
git merge staging
git tag v1.0.0
git push origin main --tags  # Waits for manual approval
```

**What happens:**
1. GitHub Actions workflow starts and waits for approval
2. Approve in GitHub Actions UI
3. Database migrations run on production database
4. API deploys to `c2-api-production` Worker
5. Web builds and deploys to `c2-web-production` Pages
6. Health checks verify deployment

**Requirements:**
- Cloudflare Workers compatible (Phase 2+)
- Client-side rendering only (Three.js)
- `'use client'` directive in all 3D components
- Edge runtime compatible
- No Node.js APIs in frontend

**Security:**
- ✅ Hostname blocking middleware prevents access to default `*.pages.dev` and `*.workers.dev` URLs
- ✅ Only custom domains are accessible (dev.web.opraxius.com, dev.api.opraxius.com, staging.web.opraxius.com, staging.api.opraxius.com, dashboard.opraxius.com, api.opraxius.com)
- ✅ CORS configured for custom domains only
- ✅ Next.js middleware blocks unauthorized hostnames at edge
- ✅ Hono middleware blocks unauthorized hostnames in API workers

---

## Implementation Roadmap

### ✅ Phase 1: Core Infrastructure (Weeks 1-3) - Complete

- Turborepo monorepo setup
- PostgreSQL + PostGIS + Redis
- Drizzle ORM schema (7 tables)
- Auth0 + NextAuth.js authentication
- RBAC middleware and hooks
- REST API (events, tasks, venues)

### ✅ Phase 2: 3D Map & Interaction (Weeks 4-6) - Complete

- Three.js + React Three Fiber scene
- GeoJSON import CLI tool
- 3D object rendering (Point/Polygon/LineString)
- Click interactions and detail panel
- Dashboard layout and navigation
- Color coding and hover effects

### 🚧 Phase 3: Workcenters & Dashboards (Weeks 7-10)

- 8 workcenter pages
- Overall Readiness dashboard
- Critical Items panel
- Workstream Progress bars
- Real-time Activity Feed
- Task CRUD operations
- Task dependencies and critical path

### 🚧 Phase 4: AI Agent Integration (Weeks 11-13)

- Claude API integration
- RBAC-scoped context builder
- Chat interface
- Proactive AI suggestions
- Chat history persistence

### 🚧 Phase 5: External Integrations (Weeks 14-16)

- IoT sensor integration (MQTT)
- Ticketing system API
- Vendor system sync
- Stripe webhooks

### 🚧 Phase 6: Production Readiness (Weeks 17-18)

- Performance optimization
- Security audit (OWASP Top 10)
- AWS infrastructure (Terraform)
- CI/CD pipeline (GitHub Actions)
- Monitoring (Sentry, CloudWatch)
- Load testing (100 concurrent users)

---

## Troubleshooting

### Port Already in Use

```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill  # Frontend
lsof -ti:3001 | xargs kill  # API
lsof -ti:5432 | xargs kill  # PostgreSQL
```

### Docker Not Running

```bash
# Start Docker Desktop
open -a Docker

# Verify
docker --version
```

### Database Connection Failed

```bash
# Reset database
make db-reset

# Restart services
make db-down
make db-up
```

### PostGIS Extension Missing

```bash
# Connect to container
docker exec -it c2-postgres psql -U c2 -d c2_commandcenter

# Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
\q
```

### TypeScript Can't Find Shared Types

```bash
# Build shared packages first
cd packages/shared && npm run build
cd packages/database && npm run build
```

### Auth0 Errors

The app works without Auth0 for local development! It just won't have real SSO. The API uses mock authentication for development.

### Need to Reset Everything?

```bash
make clean
make install
make db-reset
```

---

## Project Statistics

- **Packages**: 6 (2 apps + 4 shared packages)
- **Database Tables**: 7 with PostGIS support
- **TypeScript Types**: 20+
- **Feature Types**: 17 venue feature types
- **Workcenters**: 8 specialized departments
- **Roles**: 10 role definitions
- **Files Created**: 80+
- **Lines of Code**: ~5,000+

---

## Environment Variables

See `.env.example` for required environment variables.

**Required**:
```env
# Database
DATABASE_URL=postgresql://c2:password@localhost:5432/c2_commandcenter
REDIS_URL=redis://localhost:6379

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here

# Auth0
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com

# API
NEXT_PUBLIC_API_URL=http://localhost:3001
JWT_SECRET=your_jwt_secret_here
```

**Optional** (Phase 4+):
```env
# Claude API
ANTHROPIC_API_KEY=your_anthropic_api_key

# External Integrations (Phase 5)
STRIPE_SECRET_KEY=your_stripe_key
TICKETING_API_URL=https://ticketing.example.com
```

---

## License

Proprietary - Insomniac Events

---

## Contact & Support

For questions or issues, contact the development team or create an issue in the repository.

---

**Built with**: Next.js 15, React 18, Three.js, Fastify, PostgreSQL + PostGIS, Drizzle ORM, Auth0

**For**: Insomniac Events - Festival Management Dashboard

**Status**: Phase 2 Complete - Ready for Testing
