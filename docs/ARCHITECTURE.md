# Opraxius C2 - System Architecture

> Last Updated: December 20, 2025

This document provides comprehensive architectural diagrams and dependency maps for the Opraxius C2 system deployed on Cloudflare infrastructure.

---

## Table of Contents

- [High-Level System Architecture](#high-level-system-architecture)
- [Cloudflare Deployment Architecture](#cloudflare-deployment-architecture)
- [Application Layer Architecture](#application-layer-architecture)
- [Data Flow Architecture](#data-flow-architecture)
- [Dependency Map](#dependency-map)
- [Package Dependencies](#package-dependencies)
- [External Service Dependencies](#external-service-dependencies)
- [Environment Configuration](#environment-configuration)

---

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USERS                                          │
│                                                                             │
│    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                │
│    │   Browser    │    │   Browser    │    │   Mobile     │                │
│    │  (Desktop)   │    │   (Tablet)   │    │  (Future)    │                │
│    └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                │
└───────────┼───────────────────┼───────────────────┼─────────────────────────┘
            │                   │                   │
            └───────────────────┼───────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   CLOUDFLARE EDGE     │
                    │   ┌───────────────┐   │
                    │   │  CDN + WAF    │   │
                    │   └───────┬───────┘   │
                    └───────────┼───────────┘
                                │
            ┌───────────────────┼───────────────────┐
            │                   │                   │
┌───────────▼───────────┐       │       ┌───────────▼───────────┐
│   CLOUDFLARE PAGES    │       │       │  CLOUDFLARE WORKERS   │
│   ┌───────────────┐   │       │       │   ┌───────────────┐   │
│   │   Next.js     │   │       │       │   │   Hono API    │   │
│   │   Frontend    │   │       │       │   │   Backend     │   │
│   │               │   │       │       │   │               │   │
│   │ • Dashboard   │   │◄──────┼──────►│   │ • REST API    │   │
│   │ • 3D Map      │   │       │       │   │ • Auth        │   │
│   │ • Auth UI     │   │       │       │   │ • RBAC        │   │
│   └───────────────┘   │       │       │   └───────┬───────┘   │
│                       │       │       │           │           │
│ staging.web.          │       │       │   staging.api.        │
│ opraxius.com          │       │       │   opraxius.com        │
│ dashboard.opraxius.com│       │       │                       │
└───────────────────────┘       │       └───────────┼───────────┘
                                │                   │
                                │       ┌───────────▼───────────┐
                                │       │      HYPERDRIVE       │
                                │       │  (Connection Pooling) │
                                │       │    [Not Configured]   │
                                │       └───────────┬───────────┘
                                │                   │
                    ┌───────────┼───────────────────┼───────────┐
                    │           │     EXTERNAL      │           │
                    │           │     SERVICES      │           │
                    │   ┌───────▼───────┐   ┌───────▼───────┐   │
                    │   │    Auth0      │   │   PostgreSQL  │   │
                    │   │    (SSO)      │   │   + PostGIS   │   │
                    │   └───────────────┘   └───────────────┘   │
                    │                                           │
                    │   ┌───────────────┐   ┌───────────────┐   │
                    │   │   Upstash     │   │   Cloudflare  │   │
                    │   │   Redis       │   │    R2/KV      │   │
                    │   │   (Cache)     │   │   (Future)    │   │
                    │   └───────────────┘   └───────────────┘   │
                    └───────────────────────────────────────────┘
```

---

## Cloudflare Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        GITHUB REPOSITORY                                    │
│                      github.com/roger-emerson/c2-opraxius                   │
│                                                                             │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                    │
│   │   develop   │───►│   staging   │───►│    main     │                    │
│   │(auto-deploy)│    │ (auto-deploy)│   │ (approval)  │                    │
│   └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                    │
└──────────────────────────────┼──────────────────┼───────────────────────────┘
                               │                  │
                    ┌──────────▼──────────┐       │
                    │   GITHUB ACTIONS    │       │
                    │                     │       │
                    │ deploy-development.yml◄─────┘
                    │ deploy-staging.yml  │       │
                    │ deploy-production.yml◄──────┘
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ 1. migrate-db   │──►│ 2. deploy-api   │──►│ 3. deploy-web   │
│                 │   │                 │   │                 │
│ drizzle-kit push│   │ wrangler deploy │   │ wrangler pages  │
│ to PostgreSQL   │   │ to Workers      │   │ deploy          │
└─────────────────┘   └─────────────────┘   └─────────────────┘
                               │                     │
                               ▼                     ▼
                    ┌─────────────────────────────────────────┐
                    │           CLOUDFLARE INFRASTRUCTURE      │
                    │                                          │
                    │  ┌──────────────────────────────────┐   │
                    │  │          DEVELOPMENT             │   │
                    │  │                                   │   │
                    │  │  Workers: c2-api-development     │   │
                    │  │  → dev.api.opraxius.com          │   │
                    │  │                                   │   │
                    │  │  Pages: c2-web-development       │   │
                    │  │  → dev.web.opraxius.com          │   │
                    │  └──────────────────────────────────┘   │
                    │                                          │
                    │  ┌──────────────────────────────────┐   │
                    │  │           STAGING                 │   │
                    │  │                                   │   │
                    │  │  Workers: c2-api-staging         │   │
                    │  │  → staging.api.opraxius.com      │   │
                    │  │                                   │   │
                    │  │  Pages: c2-web-staging           │   │
                    │  │  → staging.web.opraxius.com      │   │
                    │  └──────────────────────────────────┘   │
                    │                                          │
                    │  ┌──────────────────────────────────┐   │
                    │  │          PRODUCTION              │   │
                    │  │                                   │   │
                    │  │  Workers: c2-api-production      │   │
                    │  │  → api.opraxius.com              │   │
                    │  │                                   │   │
                    │  │  Pages: c2-web-production        │   │
                    │  │  → dashboard.opraxius.com        │   │
                    │  └──────────────────────────────────┘   │
                    └─────────────────────────────────────────┘
```

---

## Application Layer Architecture

### Frontend (Next.js on Cloudflare Pages)

```
┌─────────────────────────────────────────────────────────────────┐
│                    apps/web (Next.js 15)                        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    APP ROUTER                            │   │
│  │                                                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│  │  │    /        │  │   /auth     │  │ /dashboard  │     │   │
│  │  │  Landing    │  │  signin/    │  │  (protected)│     │   │
│  │  │  Page       │  │  error/     │  │             │     │   │
│  │  └─────────────┘  └─────────────┘  └──────┬──────┘     │   │
│  │                                           │             │   │
│  │                        ┌──────────────────┼─────────┐  │   │
│  │                        │                  │         │  │   │
│  │                        ▼                  ▼         ▼  │   │
│  │                ┌───────────┐      ┌───────────┐     │  │   │
│  │                │   /map    │      │  /[other] │     │  │   │
│  │                │  3D Map   │      │  (Phase3) │     │  │   │
│  │                └─────┬─────┘      └───────────┘     │  │   │
│  │                      │                              │  │   │
│  └──────────────────────┼──────────────────────────────┘  │   │
│                         │                                  │   │
│  ┌──────────────────────┼──────────────────────────────┐  │   │
│  │               COMPONENTS                             │  │   │
│  │                      │                               │  │   │
│  │  ┌───────────────────┼───────────────────────────┐  │  │   │
│  │  │      /components/map/                          │  │  │   │
│  │  │                   │                            │  │  │   │
│  │  │  ┌────────────┐ ┌─┴──────────┐ ┌────────────┐ │  │  │   │
│  │  │  │VenueMap3D  │ │VenueObject │ │DetailPanel │ │  │  │   │
│  │  │  │ (Three.js) │ │(Geometry)  │ │(Tasks)     │ │  │  │   │
│  │  │  └────────────┘ └────────────┘ └────────────┘ │  │  │   │
│  │  └───────────────────────────────────────────────┘  │  │   │
│  └─────────────────────────────────────────────────────┘  │   │
│                                                            │   │
│  ┌─────────────────────────────────────────────────────┐  │   │
│  │                 STATE MANAGEMENT                     │  │   │
│  │                                                      │  │   │
│  │  ┌────────────────┐    ┌────────────────────────┐   │  │   │
│  │  │   React Query  │    │       Zustand          │   │  │   │
│  │  │  (Server State)│    │    (Client State)      │   │  │   │
│  │  │  - venues      │    │  - selectedFeature     │   │  │   │
│  │  │  - tasks       │    │  - mapSettings         │   │  │   │
│  │  │  - events      │    │  - userPreferences     │   │  │   │
│  │  └────────────────┘    └────────────────────────┘   │  │   │
│  └─────────────────────────────────────────────────────┘  │   │
└───────────────────────────────────────────────────────────────┘
```

### Backend (Hono on Cloudflare Workers)

```
┌─────────────────────────────────────────────────────────────────┐
│               apps/api-workers (Hono Framework)                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    MIDDLEWARE STACK                      │   │
│  │                                                          │   │
│  │  Request → [Logger] → [SecureHeaders] → [HostnameBlock] │   │
│  │         → [RequestTrace] → [CORS] → [DB/Cache Init]     │   │
│  │         → [Routes] → Response                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      ROUTES                              │   │
│  │                                                          │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │   │
│  │  │  /health    │ │ /api/events │ │ /api/tasks  │       │   │
│  │  │  (public)   │ │  (auth req) │ │  (auth req) │       │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘       │   │
│  │                                                          │   │
│  │  ┌─────────────┐ ┌─────────────┐                        │   │
│  │  │ /api/venues │ │/api/venues/ │                        │   │
│  │  │  (auth req) │ │  public     │                        │   │
│  │  │             │ │ (no auth)   │                        │   │
│  │  └─────────────┘ └─────────────┘                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    SERVICES                              │   │
│  │                                                          │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │   │
│  │  │  Database  │  │   Cache    │  │    Auth    │        │   │
│  │  │  Service   │  │  Service   │  │  Service   │        │   │
│  │  │ (Drizzle)  │  │ (Upstash)  │  │  (JWT)     │        │   │
│  │  └─────┬──────┘  └─────┬──────┘  └────────────┘        │   │
│  │        │               │                                │   │
│  └────────┼───────────────┼────────────────────────────────┘   │
│           │               │                                     │
└───────────┼───────────────┼─────────────────────────────────────┘
            │               │
            ▼               ▼
    ┌───────────────┐ ┌───────────────┐
    │  PostgreSQL   │ │   Upstash     │
    │  + PostGIS    │ │    Redis      │
    └───────────────┘ └───────────────┘
```

---

## Data Flow Architecture

### Request Flow (Read Path)

```
┌─────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│  User   │────►│  CF Pages    │────►│  CF Worker  │────►│  PostgreSQL  │
│ Browser │     │  (Frontend)  │     │   (API)     │     │   (Data)     │
└─────────┘     └──────────────┘     └─────────────┘     └──────────────┘
     ▲                                      │
     │                                      ▼
     │                              ┌─────────────┐
     │                              │   Upstash   │
     │                              │   Redis     │
     │                              │   (Cache)   │
     │                              └──────┬──────┘
     │                                     │
     └─────────────────────────────────────┘
              (Cached Response)
```

### Authentication Flow

```
┌─────────┐     ┌──────────────┐     ┌─────────────┐
│  User   │────►│  Auth0       │────►│  NextAuth   │
│         │     │  (Identity)  │     │  (Session)  │
└─────────┘     └──────────────┘     └──────┬──────┘
                                            │
                                            ▼
                                    ┌─────────────┐
                                    │    JWT      │
                                    │   Token     │
                                    └──────┬──────┘
                                           │
                                           ▼
                                    ┌─────────────┐
                                    │  CF Worker  │
                                    │ (Validate)  │
                                    └─────────────┘
```

---

## Dependency Map

### Critical Runtime Dependencies

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SYSTEM MUST HAVE TO RUN                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  CLOUDFLARE INFRASTRUCTURE                                                  │
│  ├── Workers (API hosting)                     [REQUIRED]                   │
│  │   ├── c2-api-development                                                  │
│  │   ├── c2-api-staging                                                     │
│  │   └── c2-api-production                                                  │
│  ├── Pages (Frontend hosting)                  [REQUIRED]                   │
│  │   ├── c2-web-development                                                  │
│  │   ├── c2-web-staging                                                     │
│  │   └── c2-web-production                                                  │
│  ├── DNS (Custom domains)                      [REQUIRED]                   │
│  │   ├── opraxius.com zone                                                  │
│  │   └── CNAME records                                                      │
│  └── Hyperdrive (DB connection pooling)        [NOT CONFIGURED] ⚠️          │
│                                                                             │
│  EXTERNAL SERVICES                                                          │
│  ├── PostgreSQL + PostGIS                      [REQUIRED]                   │
│  │   ├── Staging database                                                   │
│  │   └── Production database                                                │
│  ├── Upstash Redis                             [REQUIRED for caching]       │
│  │   ├── REST URL                                                           │
│  │   └── REST Token                                                         │
│  └── Auth0 (SSO)                               [OPTIONAL for local dev]     │
│      ├── Client ID                                                          │
│      ├── Client Secret                                                      │
│      └── Issuer URL                                                         │
│                                                                             │
│  GITHUB                                                                     │
│  ├── Repository                                [REQUIRED]                   │
│  ├── Actions (CI/CD)                           [REQUIRED for deployment]    │
│  └── Environments (staging, production)        [REQUIRED for secrets]       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Package Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MONOREPO PACKAGES                                   │
│                                                                             │
│                        ┌─────────────────┐                                  │
│                        │  @c2/shared     │                                  │
│                        │                 │                                  │
│                        │ • Types         │                                  │
│                        │ • Constants     │                                  │
│                        │ • Roles         │                                  │
│                        │ • Workcenters   │                                  │
│                        └────────┬────────┘                                  │
│                                 │                                           │
│              ┌──────────────────┼──────────────────┐                       │
│              │                  │                  │                       │
│              ▼                  ▼                  ▼                       │
│     ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐           │
│     │  @c2/database   │ │    @c2/gis      │ │    @c2/ui       │           │
│     │                 │ │                 │ │                 │           │
│     │ • Drizzle Schema│ │ • Coordinates   │ │ • Components    │           │
│     │ • Client        │ │ • GeoJSON Parser│ │ • Shadcn/ui     │           │
│     │ • Migrations    │ │ • CLI Importer  │ │ (Phase 3)       │           │
│     └────────┬────────┘ └────────┬────────┘ └────────┬────────┘           │
│              │                   │                   │                     │
│              └───────────────────┼───────────────────┘                     │
│                                  │                                          │
│              ┌───────────────────┼───────────────────┐                     │
│              │                   │                   │                     │
│              ▼                   ▼                   ▼                     │
│     ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐           │
│     │   @c2/web       │ │  @c2/api        │ │ @c2/api-workers │           │
│     │   (Next.js)     │ │  (Fastify)      │ │   (Hono)        │           │
│     │                 │ │  [LOCAL DEV]    │ │  [CLOUDFLARE]   │           │
│     │ • App Router    │ │                 │ │                 │           │
│     │ • Three.js      │ │ • REST API      │ │ • REST API      │           │
│     │ • React Query   │ │ • Auth          │ │ • Edge Runtime  │           │
│     └─────────────────┘ └─────────────────┘ └─────────────────┘           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## External Service Dependencies

### Required Secrets (GitHub Environments)

| Secret | Staging | Production | Purpose |
|--------|---------|------------|---------|
| `CLOUDFLARE_API_TOKEN` | ✅ | ✅ | Wrangler deployments |
| `CLOUDFLARE_ACCOUNT_ID` | ✅ | ✅ | Account identification |
| `DATABASE_URL` | ✅ | ✅ | PostgreSQL connection |
| `JWT_SECRET` | ✅ | ✅ | Token signing |
| `UPSTASH_REDIS_REST_URL` | ✅ | ✅ | Redis endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | ✅ | ✅ | Redis authentication |

### Required Variables (GitHub Environments)

| Variable | Development | Staging | Production | Value |
|----------|-------------|---------|------------|-------|
| `DEVELOPMENT_API_URL` | ✅ | ✅ | ❌ | `https://dev.api.opraxius.com` |
| `DEVELOPMENT_WEB_URL` | ✅ | ✅ | ❌ | `https://dev.web.opraxius.com` |
| `STAGING_API_URL` | ❌ | ✅ | ❌ | `https://staging.api.opraxius.com` |
| `STAGING_WEB_URL` | ❌ | ✅ | ❌ | `https://staging.web.opraxius.com` |
| `PRODUCTION_API_URL` | ❌ | ❌ | ✅ | `https://api.opraxius.com` |
| `PRODUCTION_WEB_URL` | ❌ | ❌ | ✅ | `https://dashboard.opraxius.com` |

---

## Environment Configuration

### Local Development

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LOCAL DEVELOPMENT                                   │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                        DOCKER COMPOSE                                  │ │
│  │                                                                        │ │
│  │  ┌─────────────────┐    ┌─────────────────┐                          │ │
│  │  │   c2-postgres   │    │    c2-redis     │                          │ │
│  │  │                 │    │                 │                          │ │
│  │  │ PostgreSQL 15   │    │    Redis 7      │                          │ │
│  │  │ + PostGIS 3.4   │    │                 │                          │ │
│  │  │                 │    │                 │                          │ │
│  │  │ Port: 5432      │    │ Port: 6379      │                          │ │
│  │  └─────────────────┘    └─────────────────┘                          │ │
│  │                                                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                      APPLICATION SERVERS                               │ │
│  │                                                                        │ │
│  │  ┌─────────────────┐    ┌─────────────────┐                          │ │
│  │  │   apps/web      │    │   apps/api      │                          │ │
│  │  │   (Next.js)     │    │  (Fastify)      │                          │ │
│  │  │                 │    │                 │                          │ │
│  │  │ Port: 3000      │    │ Port: 3001      │                          │ │
│  │  │ npm run dev     │    │ npm run dev     │                          │ │
│  │  └─────────────────┘    └─────────────────┘                          │ │
│  │                                                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  Note: Auth0 is OPTIONAL for local development (mock auth available)       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Staging Environment

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STAGING (CLOUDFLARE)                                │
│                                                                             │
│  Domains:                                                                   │
│  ├── dev.web.opraxius.com          → c2-web-development (Pages)            │
│  ├── dev.api.opraxius.com          → c2-api-development (Workers)          │
│  ├── staging.web.opraxius.com      → c2-web-staging (Pages)                │
│  └── staging.api.opraxius.com      → c2-api-staging (Workers)              │
│                                                                             │
│  Branch: staging                                                            │
│  Deploy: Auto on push                                                       │
│  Approval: Not required                                                     │
│                                                                             │
│  Database: Staging PostgreSQL instance                                      │
│  Cache: Staging Upstash Redis instance                                      │
│                                                                             │
│  ⚠️  KNOWN ISSUES:                                                          │
│  • Hyperdrive not configured - direct DB connection                         │
│  • No seed data in database - map shows empty                               │
│  • Phase 2 features not tested with real data                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Production Environment

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PRODUCTION (CLOUDFLARE)                              │
│                                                                             │
│  Domains:                                                                   │
│  ├── dashboard.opraxius.com        → c2-web-production (Pages)             │
│  └── api.opraxius.com              → c2-api-production (Workers)           │
│                                                                             │
│  Branch: main                                                               │
│  Deploy: On push with manual approval                                       │
│  Approval: Required (GitHub Environment protection)                         │
│                                                                             │
│  Database: Production PostgreSQL instance                                   │
│  Cache: Production Upstash Redis instance                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SECURITY LAYERS                                     │
│                                                                             │
│  EDGE SECURITY (Cloudflare)                                                 │
│  ├── WAF (Web Application Firewall)                                         │
│  ├── DDoS Protection                                                        │
│  ├── SSL/TLS Termination                                                    │
│  └── Bot Protection                                                         │
│                                                                             │
│  APPLICATION SECURITY                                                       │
│  ├── Hostname Blocking Middleware                                           │
│  │   └── Blocks *.workers.dev and *.pages.dev URLs                         │
│  ├── CORS Whitelist                                                         │
│  │   └── Only allows custom domains                                        │
│  ├── Secure Headers (Hono middleware)                                       │
│  └── Request Tracing (X-Request-ID)                                         │
│                                                                             │
│  AUTHENTICATION                                                             │
│  ├── Auth0 SSO                                                              │
│  ├── JWT Token Validation                                                   │
│  └── Session Management (NextAuth.js)                                       │
│                                                                             │
│  AUTHORIZATION (RBAC)                                                       │
│  ├── 10 Roles (admin → viewer)                                              │
│  ├── 8 Workcenters (Operations → Finance)                                   │
│  ├── Permission Matrix (resource × action × workcenter)                     │
│  └── Middleware enforcement on all protected routes                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Known Configuration Gaps

| Component | Status | Impact | Resolution |
|-----------|--------|--------|------------|
| Hyperdrive | Not Configured | Direct DB connection (higher latency) | Configure in wrangler.toml |
| Seed Data | Missing | Map shows empty/error | Run GeoJSON import CLI |
| Auth0 | Optional | Works without SSO locally | Configure for production |
| E2E Tests | Not Run | Features unverified in staging | Import data, test manually |

---

## Quick Reference URLs

### Staging
- **Web**: https://staging.web.opraxius.com
- **API**: https://staging.api.opraxius.com
- **Health**: https://staging.api.opraxius.com/health

### Production
- **Web**: https://dashboard.opraxius.com
- **API**: https://api.opraxius.com
- **Health**: https://api.opraxius.com/health

### Development (Cloudflare)
- **Web**: https://dev.web.opraxius.com
- **API**: https://dev.api.opraxius.com
- **Health**: https://dev.api.opraxius.com/health

### Local Development
- **Web**: http://localhost:3000
- **API**: http://localhost:3001
- **DB Studio**: http://localhost:4983

---

*This document should be updated when architectural changes are made.*

