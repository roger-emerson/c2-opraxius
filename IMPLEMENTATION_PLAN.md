# ESG Command Center - Festival Management Dashboard

## Project Overview
Build a central command center dashboard for Insomniac's large-scale festival management (EDC Las Vegas, EDC Orlando, etc.). This will be an internal tool providing a single pane of glass for all festival operations across multiple offices.

## Current State
- Repository: `/Users/roger/Desktop/Projects/esg-commandcenter`
- Status: Empty/greenfield project (newly initialized git repo)
- No existing code or dependencies

## Key Requirements

### 1. Interactive 3D Map (Main View)
- Central focus: 3D visualization of festival venue
- Rotatable and zoomable controls
- Clickable objects (stages, gates, vendor booths, etc.)
- Object click → detail panel with tasks and information

### 2. Eight Specialized Workcenters (Navigation Tabs)
- Operations
- Production
- Security
- Workforce
- Vendors
- Sponsors
- Marketing
- Finance

### 3. High-Level Status Dashboard
- **Overall Readiness**: Main progress bar showing total festival completion %
- **Critical Items**: Summary of critical path status, blocked tasks, overdue tasks
- **Workstream Progress**: Individual department progress bars (e.g., "Production: 80%")
- **Activity Feed**: Live stream of recent updates from different teams

### 4. AI Overview Agent
- Visible chat interface
- Proactive guidance and recommendations
- Natural language interaction

## User Requirements Summary

### Backend & Data
- Build backend from scratch
- Integrate IoT systems, ticketing systems, vendor systems, Stripe payments
- PostgreSQL database with PostGIS for spatial data

### 3D Map Data
- Create simplified representations (stages, vendor concessions, sound booths, entry/exits)
- Reference: Burning Man GIS data at `/Users/roger/Desktop/Projects/innovate-GIS-data`
- GeoJSON format with minimal schema (name, type, coordinates)

### User Base
- 50-100 simultaneous high-level users and leads

### Authentication & Permissions
- RBAC required - users only see workcenters they're authorized for
- SSO enabled
- Role-based access control per workcenter

### AI Agent
- Claude API integration
- Limited access based on user's RBAC scope
- User can only query data they have permission to see

### Deployment
- Dev: Local server (Docker Compose)
- Staging: Cloudflare Workers
- Production: AWS (ECS, RDS, ElastiCache, S3)

## Recommended Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router) with React 18+
- **3D Visualization**: Three.js with React Three Fiber (R3F) + Drei
- **2D Map**: Mapbox GL JS or MapLibre GL
- **State Management**: Zustand + React Query (TanStack Query)
- **UI Components**: Shadcn/ui + Tailwind CSS
- **Real-time**: Pusher or Socket.IO
- **Charts**: Recharts + D3.js

### Backend
- **Framework**: Node.js with Fastify
- **Database**: PostgreSQL 15+ with PostGIS extension
- **ORM**: Drizzle ORM
- **Caching**: Redis
- **Authentication**: Auth0 + NextAuth.js
- **Background Jobs**: BullMQ

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Monorepo**: Turborepo
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry + CloudWatch/Datadog
- **CDN**: Cloudflare

### AI Integration
- **Claude API**: Anthropic Claude 3.5 Sonnet
- **Vector Search**: pgvector (PostgreSQL extension)

## Project Structure

```
esg-commandcenter/
├── apps/
│   ├── web/                    # Next.js frontend
│   ├── api/                    # Fastify backend API
│   └── claude-agent/           # Claude AI service (optional)
├── packages/
│   ├── shared/                 # Shared types, constants
│   ├── database/               # Drizzle schema, migrations
│   ├── ui/                     # Shared UI components
│   ├── auth/                   # Auth utilities, RBAC
│   └── gis/                    # GIS utilities, GeoJSON helpers
├── docker/
│   ├── Dockerfile.web
│   ├── Dockerfile.api
│   └── docker-compose.yml
├── infrastructure/             # Terraform/Pulumi IaC
├── turbo.json
├── Makefile
└── README.md
```

## Database Schema (Key Tables)

### 1. events
- Festival events (EDC Las Vegas 2025, EDC Orlando 2025)
- Event dates, status, venue boundaries (PostGIS geometry)

### 2. venue_features
- GIS data for all venue objects
- Types: stage, gate, vendor_booth, sound_booth, entry, exit, pathway, area
- Geometry: Point, Polygon, or LineString (PostGIS)
- RBAC: `workcenter_access` array field
- Status tracking: pending, in_progress, completed, blocked

### 3. tasks
- Task management per workcenter
- Critical path tracking (`is_critical_path` boolean)
- Dependencies between tasks
- Assigned to users, due dates
- Linked to venue_features

### 4. users
- Email, name, role
- `workcenters` array - which workcenters user can access
- Auth0 SSO integration (`auth0_user_id`)
- Granular permissions (JSONB)

### 5. workcenters
- 8 workcenters: Operations, Production, Security, Workforce, Vendors, Sponsors, Marketing, Finance
- Track completion percentage per workcenter
- Status: on_track, at_risk, delayed

### 6. activity_feed
- Real-time activity log
- Task updates, status changes, completions
- Filterable by workcenter

### 7. ai_chat_history
- Claude conversation history
- RBAC context logged for audit

## GIS Data Modeling (Based on Burning Man Reference)

### Feature Type Taxonomy
```typescript
type VenueFeatureType =
  // Physical Structures
  | 'stage'              // Main stages (kineticFIELD, circuitGROUNDS)
  | 'gate'               // Entry/exit gates
  | 'vendor_booth'       // Food, merch vendors
  | 'sound_booth'        // DJ booths, sound control
  | 'medical_tent'       // First aid
  | 'security_post'      // Security checkpoints
  | 'restroom'           // Portable toilets
  | 'water_station'      // Hydration stations
  | 'art_installation'   // Art pieces
  | 'vip_area'           // VIP lounges

  // Infrastructure
  | 'pathway'            // Walkways (LineString)
  | 'road'               // Vehicle roads (LineString)
  | 'fence'              // Perimeter (LineString/Polygon)
  | 'parking_lot'        // Parking (Polygon)

  // Operational
  | 'command_center'     // Operations HQ
  | 'production_office'
  | 'warehouse'
  | 'generator'          // Power generation

  // Zones/Areas
  | 'zone'               // General area (Polygon)
  | 'boundary'           // Venue boundary (Polygon)
```

### GeoJSON Import Pattern
- Coordinate system: WGS 84 (EPSG:4326)
- Minimal attributes: name, type, capacity
- Workcenter access control array
- CLI import tool: `npm run import:geojson`

## 3D Visualization Approach

### Rendering Strategy
- **Simplified 3D representations** (not CAD files)
  - Stages: Extruded polygons with custom geometries
  - Gates: Simple arch models
  - Vendor Booths: Small box instances
  - Pathways: Flat planes or tube geometry along LineStrings
  - Areas/Zones: Transparent extruded polygons

### Three.js Implementation
- **React Three Fiber** for declarative 3D
- **OrbitControls** for camera navigation
- **Color coding** by status (pending=gray, in_progress=yellow, completed=green, blocked=red)
- **Interactivity**: Click objects → detail panel slides out
- **Performance**: Instancing for repeated objects, LOD system

### UX Features
- Rotate, zoom, pan around venue
- Click venue feature → show tasks, status, details
- Hover effects (outline, color change)
- Toggle 2D/3D view
- Preset camera views ("Overview", "Stage Area", "Operations Zone")

## RBAC Architecture

### Roles
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

### Permission Model
```typescript
type Permission = {
  resource: 'tasks' | 'venue_features' | 'events' | 'users';
  action: 'create' | 'read' | 'update' | 'delete';
  workcenter?: Workcenter;  // Optional scope
};
```

### SSO Integration (Auth0)
- Auth0 tenant with corporate SSO
- NextAuth.js for session management
- JWT validation middleware (backend)
- Custom claims for roles and workcenters

### Claude API Scoping
- Context builder filters data by user's workcenters
- User can only query data they have permission to see
- Chat history logs what context was provided

## Implementation Phases

### Phase 1: Core Infrastructure (Weeks 1-3)
**Goals**: Dev environment, database, auth, RBAC

**Deliverables**:
- Turborepo monorepo setup
- PostgreSQL + PostGIS + Redis (Docker Compose)
- Drizzle ORM schema and migrations
- Auth0 + NextAuth.js authentication
- RBAC middleware (backend) and hooks (frontend)
- Basic REST API (events, venues, tasks)
- `make dev` command for local development

**Critical Files**:
- [docker-compose.yml](docker-compose.yml)
- [packages/database/src/schema/index.ts](packages/database/src/schema/index.ts)
- [apps/api/src/middleware/rbac.middleware.ts](apps/api/src/middleware/rbac.middleware.ts)
- [apps/web/src/lib/auth.ts](apps/web/src/lib/auth.ts)

### Phase 2: 3D Map & Interaction (Weeks 4-6)
**Goals**: 3D venue visualization, clickable objects, GIS import

**Deliverables**:
- Three.js + React Three Fiber scene
- GeoJSON import CLI tool
- Render Point/Polygon/LineString features as 3D objects
- Click to select → detail panel
- 2D Mapbox fallback
- Performance optimization (instancing, LOD)

**Critical Files**:
- [apps/web/src/components/map/VenueMap3D.tsx](apps/web/src/components/map/VenueMap3D.tsx)
- [apps/web/src/components/map/VenueObject.tsx](apps/web/src/components/map/VenueObject.tsx)
- [packages/gis/src/geojson-importer.ts](packages/gis/src/geojson-importer.ts)
- [packages/gis/src/coordinates.ts](packages/gis/src/coordinates.ts)

### Phase 3: Workcenters & Dashboards (Weeks 7-10)
**Goals**: 8 workcenter tabs, status dashboard, task management, real-time feed

**Deliverables**:
- Dashboard layout with sidebar navigation
- 8 workcenter pages (Operations, Production, Security, etc.)
- Overall Readiness progress bar
- Critical Items panel (blocked, overdue, critical path tasks)
- Workstream Progress bars
- Activity Feed (real-time with Pusher/Socket.IO)
- Task CRUD (create, edit, assign, complete)
- Task dependencies and critical path

**Critical Files**:
- [apps/web/src/app/(dashboard)/layout.tsx](apps/web/src/app/(dashboard)/layout.tsx)
- [apps/web/src/components/dashboard/StatusBar.tsx](apps/web/src/components/dashboard/StatusBar.tsx)
- [apps/web/src/components/dashboard/ActivityFeed.tsx](apps/web/src/components/dashboard/ActivityFeed.tsx)
- [apps/api/src/services/task.service.ts](apps/api/src/services/task.service.ts)

### Phase 4: AI Agent Integration (Weeks 11-13)
**Goals**: Claude API, chat interface, RBAC-scoped context, proactive suggestions

**Deliverables**:
- Anthropic Claude API integration
- RBAC-scoped context builder
- Chat interface (drawer/modal)
- Proactive AI suggestions for blocked/overdue tasks
- Chat history persistence
- Semantic search with pgvector (optional)

**Critical Files**:
- [apps/api/src/services/ai.service.ts](apps/api/src/services/ai.service.ts)
- [apps/web/src/components/ai/ClaudeChat.tsx](apps/web/src/components/ai/ClaudeChat.tsx)
- [apps/api/src/routes/ai.routes.ts](apps/api/src/routes/ai.routes.ts)

### Phase 5: External Integrations (Weeks 14-16)
**Goals**: IoT, ticketing, vendor systems, Stripe

**Deliverables**:
- IoT sensor integration (MQTT → BullMQ → Database)
- Ticketing system API (ticket sales, gate scans, capacity)
- Vendor system sync (check-in, booth status)
- Stripe webhook integration (payments, invoicing)
- Integration monitoring dashboard

**Critical Files**:
- [apps/api/src/services/integration.service.ts](apps/api/src/services/integration.service.ts)
- [apps/api/src/queues/iot-processor.queue.ts](apps/api/src/queues/iot-processor.queue.ts)
- [apps/api/src/routes/integrations/stripe.routes.ts](apps/api/src/routes/integrations/stripe.routes.ts)

### Phase 6: Production Readiness (Weeks 17-18)
**Goals**: Performance, security, AWS deployment, documentation

**Deliverables**:
- Performance optimization (bundle size, DB queries, caching)
- Security audit (OWASP Top 10)
- AWS infrastructure (ECS, RDS, ElastiCache, S3, CloudFront)
- Infrastructure as Code (Terraform/Pulumi)
- CI/CD pipeline (GitHub Actions)
- Monitoring (Sentry, CloudWatch/Datadog)
- Documentation (README, API docs, user guide)
- Load testing (100 concurrent users)

**Critical Files**:
- [infrastructure/main.tf](infrastructure/main.tf) or [infrastructure/index.ts](infrastructure/index.ts)
- [.github/workflows/deploy.yml](.github/workflows/deploy.yml)
- [README.md](README.md)

## Critical Files to Create (Priority Order)

1. **[packages/database/src/schema/index.ts](packages/database/src/schema/index.ts)**
   - Core data model with PostGIS support
   - All features depend on this schema

2. **[apps/web/src/lib/auth.ts](apps/web/src/lib/auth.ts)**
   - NextAuth.js + Auth0 SSO configuration
   - Gateway to entire application

3. **[apps/api/src/services/rbac.service.ts](apps/api/src/services/rbac.service.ts)**
   - RBAC enforcement logic
   - Critical for multi-tenant security

4. **[apps/web/src/components/map/VenueMap3D.tsx](apps/web/src/components/map/VenueMap3D.tsx)**
   - Main 3D visualization component
   - Centerpiece of the UI

5. **[packages/shared/src/types/venue.types.ts](packages/shared/src/types/venue.types.ts)**
   - Shared TypeScript types for venue features
   - Ensures type safety across stack

## Success Criteria

### Phase 1
- ✅ `make dev` starts full stack (frontend, backend, DB, Redis)
- ✅ User can log in via Auth0 SSO
- ✅ Different roles see different navigation options
- ✅ Basic CRUD works for tasks and venue features

### Phase 2
- ✅ 3D venue loads and displays all features
- ✅ User can rotate, zoom, pan (60fps smooth)
- ✅ Clicking feature shows detail panel
- ✅ Can import sample EDC GeoJSON data

### Phase 3
- ✅ User can navigate to all 8 workcenters
- ✅ Creating task instantly updates dashboard
- ✅ Real-time activity feed shows updates
- ✅ Overall readiness % is accurate
- ✅ Critical items panel highlights issues

### Phase 4
- ✅ User can chat with Claude
- ✅ Claude only sees user's accessible workcenters
- ✅ Responses are relevant and actionable
- ✅ Proactive suggestions appear for issues

### Phase 5
- ✅ IoT sensors send data to dashboard
- ✅ Ticket sales display in Security/Operations
- ✅ Vendor check-ins update venue status
- ✅ Stripe payments process successfully

### Phase 6
- ✅ System handles 100 concurrent users
- ✅ Production environment is live on AWS
- ✅ All tests pass (unit, integration, E2E)
- ✅ Monitoring is active

## Next Steps

1. **Initialize Turborepo monorepo** at `/Users/roger/Desktop/Projects/esg-commandcenter`
2. **Set up Docker Compose** with PostgreSQL + PostGIS + Redis
3. **Create database schema** with Drizzle ORM
4. **Configure Auth0** tenant and SSO
5. **Build RBAC system** (middleware + hooks)
