# Opraxius C2 - Environments & Endpoints

> **Complete reference for all deployed environments, URLs, and user-accessible features**
>
> **Last Updated**: December 24, 2025

---

## Environment Overview

| Environment | Branch | Auto-Deploy | Approval Required |
|-------------|--------|-------------|-------------------|
| **Development** | `develop` | ✅ Yes | No |
| **Staging** | `staging` | ✅ Yes | No |
| **Production** | `main` | ✅ Yes | ⚠️ Yes (manual) |

---

## 🔧 Development Environment

**Branch**: `develop`  
**Purpose**: Latest features, testing new code

### URLs

| Service | URL |
|---------|-----|
| **Web Dashboard** | https://dev.web.opraxius.com |
| **API** | https://dev.api.opraxius.com |

### User-Accessible Pages

| Page | URL | Description |
|------|-----|-------------|
| Homepage | https://dev.web.opraxius.com/ | Landing page |
| Sign In | https://dev.web.opraxius.com/auth/signin | Authentication page |
| Dashboard | https://dev.web.opraxius.com/dashboard | Main dashboard with readiness overview |
| 3D Map | https://dev.web.opraxius.com/dashboard/map | Interactive 3D venue visualization |
| Operations | https://dev.web.opraxius.com/dashboard/operations | Operations workcenter |
| Production | https://dev.web.opraxius.com/dashboard/production | Production workcenter |
| Security | https://dev.web.opraxius.com/dashboard/security | Security workcenter |
| Workforce | https://dev.web.opraxius.com/dashboard/workforce | Workforce workcenter |
| Vendors | https://dev.web.opraxius.com/dashboard/vendors | Vendors workcenter |
| Marketing | https://dev.web.opraxius.com/dashboard/marketing | Marketing workcenter |
| Finance | https://dev.web.opraxius.com/dashboard/finance | Finance workcenter |

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| https://dev.api.opraxius.com/health | GET | Health check |
| https://dev.api.opraxius.com/ | GET | API info |
| https://dev.api.opraxius.com/api/events | GET | List events |
| https://dev.api.opraxius.com/api/tasks | GET | List tasks |
| https://dev.api.opraxius.com/api/venues | GET | List venue features |
| https://dev.api.opraxius.com/api/venues/public | GET | Public venue features (no auth) |
| https://dev.api.opraxius.com/api/activity | GET | Activity feed |

---

## 🎭 Staging Environment

**Branch**: `staging`  
**Purpose**: Pre-production testing, QA verification

### URLs

| Service | URL |
|---------|-----|
| **Web Dashboard** | https://staging.web.opraxius.com |
| **API** | https://staging.api.opraxius.com |

### User-Accessible Pages

| Page | URL | Description |
|------|-----|-------------|
| Homepage | https://staging.web.opraxius.com/ | Landing page |
| Sign In | https://staging.web.opraxius.com/auth/signin | Authentication page |
| Dashboard | https://staging.web.opraxius.com/dashboard | Main dashboard with readiness overview |
| 3D Map | https://staging.web.opraxius.com/dashboard/map | Interactive 3D venue visualization |
| Operations | https://staging.web.opraxius.com/dashboard/operations | Operations workcenter |
| Production | https://staging.web.opraxius.com/dashboard/production | Production workcenter |
| Security | https://staging.web.opraxius.com/dashboard/security | Security workcenter |
| Workforce | https://staging.web.opraxius.com/dashboard/workforce | Workforce workcenter |
| Vendors | https://staging.web.opraxius.com/dashboard/vendors | Vendors workcenter |
| Marketing | https://staging.web.opraxius.com/dashboard/marketing | Marketing workcenter |
| Finance | https://staging.web.opraxius.com/dashboard/finance | Finance workcenter |

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| https://staging.api.opraxius.com/health | GET | Health check |
| https://staging.api.opraxius.com/ | GET | API info |
| https://staging.api.opraxius.com/api/events | GET | List events |
| https://staging.api.opraxius.com/api/tasks | GET | List tasks |
| https://staging.api.opraxius.com/api/venues | GET | List venue features |
| https://staging.api.opraxius.com/api/venues/public | GET | Public venue features (no auth) |
| https://staging.api.opraxius.com/api/activity | GET | Activity feed |

---

## 🚀 Production Environment

**Branch**: `main`  
**Purpose**: Live user-facing environment

### URLs

| Service | URL |
|---------|-----|
| **Web Dashboard** | https://dashboard.opraxius.com |
| **API** | https://api.opraxius.com |

### User-Accessible Pages

| Page | URL | Description |
|------|-----|-------------|
| Homepage | https://dashboard.opraxius.com/ | Landing page |
| Sign In | https://dashboard.opraxius.com/auth/signin | Authentication page |
| Dashboard | https://dashboard.opraxius.com/dashboard | Main dashboard with readiness overview |
| 3D Map | https://dashboard.opraxius.com/dashboard/map | Interactive 3D venue visualization |
| Operations | https://dashboard.opraxius.com/dashboard/operations | Operations workcenter |
| Production | https://dashboard.opraxius.com/dashboard/production | Production workcenter |
| Security | https://dashboard.opraxius.com/dashboard/security | Security workcenter |
| Workforce | https://dashboard.opraxius.com/dashboard/workforce | Workforce workcenter |
| Vendors | https://dashboard.opraxius.com/dashboard/vendors | Vendors workcenter |
| Marketing | https://dashboard.opraxius.com/dashboard/marketing | Marketing workcenter |
| Finance | https://dashboard.opraxius.com/dashboard/finance | Finance workcenter |

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| https://api.opraxius.com/health | GET | Health check |
| https://api.opraxius.com/ | GET | API info |
| https://api.opraxius.com/api/events | GET | List events |
| https://api.opraxius.com/api/tasks | GET | List tasks |
| https://api.opraxius.com/api/venues | GET | List venue features |
| https://api.opraxius.com/api/venues/public | GET | Public venue features (no auth) |
| https://api.opraxius.com/api/activity | GET | Activity feed |

---

## 💻 Local Development

**Branch**: Any  
**Purpose**: Local development and testing

### URLs

| Service | URL |
|---------|-----|
| **Web Dashboard** | http://localhost:3000 |
| **API** | http://localhost:3001 |
| **Drizzle Studio** | http://localhost:4983 |

### User-Accessible Pages

| Page | URL | Description |
|------|-----|-------------|
| Homepage | http://localhost:3000/ | Landing page |
| Sign In | http://localhost:3000/auth/signin | Authentication page |
| Dashboard | http://localhost:3000/dashboard | Main dashboard |
| 3D Map | http://localhost:3000/dashboard/map | 3D venue visualization |
| Workcenters | http://localhost:3000/dashboard/{workcenter} | 8 workcenter pages |

### Starting Local Environment

```bash
# Start databases
make db-up

# Start API (Terminal 1)
cd apps/api && npm run dev

# Start Web (Terminal 2)
cd apps/web && npm run dev

# Open Drizzle Studio (Terminal 3)
cd packages/database && npm run db:studio
```

---

## API Reference

### Public Endpoints (No Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check - returns status, timestamp, environment |
| GET | `/` | API info - returns name, version, environment |
| GET | `/api/venues/public` | Public venue features for map display |

### Protected Endpoints (Authentication Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List events (RBAC filtered) |
| POST | `/api/events` | Create event (admin only) |
| PATCH | `/api/events/:id` | Update event |
| GET | `/api/tasks` | List tasks (filtered by workcenter) |
| GET | `/api/tasks/:id` | Get single task |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/venues` | List venue features (RBAC filtered) |
| POST | `/api/venues` | Create venue feature |
| GET | `/api/activity` | Get activity feed |
| POST | `/api/activity` | Log activity |

### Query Parameters

**Tasks Endpoint** (`/api/tasks`):
- `?workcenter=operations` - Filter by workcenter
- `?eventId=uuid` - Filter by event

**Activity Endpoint** (`/api/activity`):
- `?workcenter=operations` - Filter by workcenter
- `?limit=20` - Limit results (max 100)

---

## Branch → Environment Mapping

```
┌─────────────┐     ┌──────────────────────────────────────┐
│   develop   │ ──► │  Development (dev.*.opraxius.com)    │
└─────────────┘     └──────────────────────────────────────┘
       │
       ▼
┌─────────────┐     ┌──────────────────────────────────────┐
│   staging   │ ──► │  Staging (staging.*.opraxius.com)    │
└─────────────┘     └──────────────────────────────────────┘
       │
       ▼
┌─────────────┐     ┌──────────────────────────────────────┐
│    main     │ ──► │  Production (dashboard/api.opraxius) │
└─────────────┘     └──────────────────────────────────────┘
```

### Deployment Workflow

```bash
# 1. Push to develop (auto-deploys to Development)
git push origin develop

# 2. Merge to staging (auto-deploys to Staging)
git checkout staging && git merge develop && git push origin staging

# 3. Merge to main (requires approval, deploys to Production)
git checkout main && git merge staging && git push origin main
```

---

## Feature Availability by Phase

| Feature | Phase | Dev | Staging | Prod |
|---------|-------|-----|---------|------|
| 3D Venue Map | 2 | ✅ | ✅ | ✅ |
| GeoJSON Import | 2 | ✅ | ✅ | ✅ |
| Workcenter Pages | 3 | ✅ | ⏳ | ⏳ |
| Task CRUD | 3 | ✅ | ⏳ | ⏳ |
| Activity Feed | 3 | ✅ | ⏳ | ⏳ |
| Overall Readiness | 3 | ✅ | ⏳ | ⏳ |
| Critical Items | 3 | ✅ | ⏳ | ⏳ |
| AI Assistant | 4 | ⏳ | ⏳ | ⏳ |

**Legend**: ✅ Available | ⏳ Pending merge/deployment

---

## Quick Health Check Commands

```bash
# Check all environments
curl -s https://dev.api.opraxius.com/health | jq
curl -s https://staging.api.opraxius.com/health | jq
curl -s https://api.opraxius.com/health | jq

# Check web endpoints
curl -s -o /dev/null -w "%{http_code}" https://dev.web.opraxius.com/
curl -s -o /dev/null -w "%{http_code}" https://staging.web.opraxius.com/
curl -s -o /dev/null -w "%{http_code}" https://dashboard.opraxius.com/
```

---

## Security Notes

- **Default Cloudflare URLs are blocked** - Only custom domains work
- **CORS configured** for each environment's web domain
- **RBAC enforced** on all protected API endpoints
- **Auth0 SSO** for authentication (mock auth available locally)

---

## Related Documentation

- [CLOUDFLARE_DEPLOYMENT.md](CLOUDFLARE_DEPLOYMENT.md) - Infrastructure setup
- [AGENT_CI_CD_WORKFLOW.md](AGENT_CI_CD_WORKFLOW.md) - CI/CD debugging
- [GITHUB_CLI_REFERENCE.md](GITHUB_CLI_REFERENCE.md) - GitHub Actions commands
- [../CLAUDE_CONTEXT.md](../CLAUDE_CONTEXT.md) - Full project context

---

**Last Updated**: December 24, 2025 | **Phase**: 5 Complete

