# ESG Command Center

Festival Management Dashboard for Insomniac Events (EDC Las Vegas, EDC Orlando, etc.)

## Overview

The ESG Command Center is an internal command and control dashboard providing a single pane of glass for managing large-scale festival operations across multiple offices and departments.

### Key Features

- **Interactive 3D Venue Visualization** - Rotatable, zoomable 3D map of festival venues with clickable objects
- **8 Specialized Workcenters** - Operations, Production, Security, Workforce, Vendors, Sponsors, Marketing, Finance
- **Real-time Status Dashboard** - Overall readiness %, critical items, workstream progress, activity feed
- **AI-Powered Assistant** - Claude AI integration with RBAC-scoped context for proactive guidance
- **Role-Based Access Control** - SSO with Auth0, granular permissions per workcenter
- **GIS Data Management** - PostGIS-powered spatial data for venue features

## Technology Stack

### Frontend
- Next.js 15 (App Router)
- React 18 + TypeScript
- Three.js + React Three Fiber (3D visualization)
- Tailwind CSS + Shadcn/ui
- Zustand + React Query

### Backend
- Node.js + Fastify
- PostgreSQL 15 + PostGIS
- Drizzle ORM
- Redis (caching + pub/sub)
- Auth0 + NextAuth.js

### Infrastructure
- Docker + Docker Compose (dev)
- Turborepo (monorepo)
- Cloudflare Workers (staging)
- AWS (production: ECS, RDS, ElastiCache, S3)

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker Desktop

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/roger-emerson/esg-commandcenter.git
   cd esg-commandcenter
   ```

2. **Install dependencies**
   ```bash
   make install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Start development environment**
   ```bash
   make dev
   ```

   This will:
   - Start PostgreSQL + PostGIS + Redis in Docker
   - Run database migrations
   - Start Next.js frontend (http://localhost:3000)
   - Start Fastify API (http://localhost:3001)

### Makefile Commands

- `make install` - Install all dependencies
- `make dev` - Start development environment
- `make db-up` - Start database services only
- `make db-down` - Stop database services
- `make db-reset` - Reset database (drop + recreate)
- `make db-migrate` - Run database migrations
- `make db-seed` - Seed database with sample data
- `make test` - Run all tests
- `make lint` - Run linters
- `make clean` - Clean build artifacts

## Project Structure

```
esg-commandcenter/
├── apps/
│   ├── web/                    # Next.js frontend
│   └── api/                    # Fastify backend API
├── packages/
│   ├── shared/                 # Shared types, constants
│   ├── database/               # Drizzle schema, migrations
│   ├── ui/                     # Shared UI components
│   ├── auth/                   # Auth utilities, RBAC
│   └── gis/                    # GIS utilities, GeoJSON helpers
├── docker-compose.yml          # Development services
├── turbo.json                  # Turborepo config
├── Makefile                    # Common commands
└── README.md
```

## Development Workflow

### Running Locally

```bash
# Terminal 1: Start databases
make db-up

# Terminal 2: Start API
cd apps/api && npm run dev

# Terminal 3: Start frontend
cd apps/web && npm run dev
```

Or simply:
```bash
make dev  # Starts everything
```

### Database Migrations

```bash
# Create a new migration
cd packages/database
npm run db:generate

# Run migrations
npm run db:push

# Seed database
npm run db:seed
```

### Adding Dependencies

```bash
# Add to root (monorepo tools)
npm install -D <package> -w root

# Add to web app
npm install <package> -w @esg/web

# Add to API
npm install <package> -w @esg/api

# Add to shared package
npm install <package> -w @esg/shared
```

## Environment Variables

See `.env.example` for required environment variables.

### Auth0 Setup

1. Create Auth0 tenant at https://auth0.com
2. Create a new application (Regular Web Application)
3. Configure Allowed Callback URLs: `http://localhost:3000/api/auth/callback/auth0`
4. Configure Allowed Logout URLs: `http://localhost:3000`
5. Copy Client ID and Client Secret to `.env`

### Claude API Setup

1. Get API key from https://console.anthropic.com
2. Add to `.env` as `ANTHROPIC_API_KEY`

## Deployment

### Staging (Cloudflare Workers)
```bash
npm run deploy:staging
```

### Production (AWS)
```bash
npm run deploy:production
```

See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for full deployment architecture.

## Documentation

- [Implementation Plan](IMPLEMENTATION_PLAN.md) - Full technical architecture and roadmap
- [API Documentation](docs/API.md) - API endpoints and usage
- [Database Schema](packages/database/README.md) - Database structure and relationships
- [User Guide](docs/USER_GUIDE.md) - End-user documentation

## License

Proprietary - Insomniac Events
