# 🚀 ESG Command Center - START HERE

Welcome to the ESG Command Center! This is your central festival management dashboard for Insomniac Events.

## ✅ Phase 1 is COMPLETE!

All core infrastructure has been built and is ready to use.

---

## 📖 Quick Links

- **[PHASE1_COMPLETE.md](PHASE1_COMPLETE.md)** - Full completion summary
- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute quick start guide
- **[README.md](README.md)** - Full project documentation
- **[IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)** - 6-phase technical roadmap

---

## 🏃 Get Started in 3 Steps

### Step 1: Start the API Server
```bash
cd /Users/roger/Desktop/Projects/esg-commandcenter/apps/api
npm run dev
```

**You should see:**
```
Server listening on http://0.0.0.0:3001
```

Leave this terminal running.

### Step 2: Start the Web Server (New Terminal)
```bash
cd /Users/roger/Desktop/Projects/esg-commandcenter/apps/web
npm run dev
```

**You should see:**
```
▲ Next.js 15.x.x
- Local:        http://localhost:3000
```

Leave this terminal running.

### Step 3: Test It Works
Open your browser to:
- **Frontend**: http://localhost:3000
- **API Health Check**: http://localhost:3001/health

---

## ✅ What's Working Now

### ✅ Database
- PostgreSQL + PostGIS running in Docker
- 7 tables created (events, users, venue_features, tasks, workcenters, activity_feed, ai_chat_history)
- All indexes and relationships configured

### ✅ Backend API
- Fastify server on port 3001
- `/api/events` - Event management
- `/api/tasks` - Task management (with RBAC)
- `/api/venues` - Venue feature management (with RBAC)
- JWT authentication middleware
- RBAC permission middleware

### ✅ Frontend
- Next.js 15 with App Router
- Auth0 + NextAuth.js configured
- Session management with React Query
- RBAC hooks (useAuth, usePermission, useWorkcenterAccess)
- Three.js installed (ready for 3D map in Phase 2)

### ✅ RBAC System
- 10 roles defined (admin, operations_lead, production_lead, etc.)
- 8 workcenters (Operations, Production, Security, Workforce, Vendors, Sponsors, Marketing, Finance)
- Granular permissions per resource and action
- Automatic data filtering by workcenter access

---

## 🔧 Common Commands

```bash
# View running containers
docker ps

# Stop/restart database
make db-down
make db-up

# View database in browser
cd packages/database && npm run db:studio

# Reset database (if needed)
make db-reset

# Run linting
npm run lint

# Build all packages
npm run build
```

---

## 📊 Project Statistics

- **Total Files Created**: 80+
- **Lines of Code**: ~5,000+
- **TypeScript Types**: 20+
- **Database Tables**: 7
- **API Endpoints**: 9
- **RBAC Roles**: 10
- **Workcenters**: 8

---

## 🎯 What to Do Next

### Option 1: Configure Auth0 (For SSO)
1. Go to https://auth0.com and create an account
2. Create a new Application (Regular Web Application)
3. Update `.env` with your credentials
4. Restart the web server

### Option 2: Explore the Database
```bash
cd packages/database
npm run db:studio
```
Opens Drizzle Studio at http://localhost:4983

### Option 3: Test the API
```bash
# Health check
curl http://localhost:3001/health

# Get events (requires auth token)
curl http://localhost:3001/api/events \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Option 4: Read the Plan
Open [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) to see the full 6-phase roadmap.

---

## 🚧 What's Coming in Phase 2

**Phase 2: 3D Map & Interaction** (Weeks 4-6)

- Interactive 3D venue map with Three.js
- Clickable 3D objects (stages, gates, booths)
- GeoJSON import tool (to import Burning Man-style GIS data)
- Detail panels for venue features
- 2D/3D map toggle
- Performance optimization

See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for full Phase 2 details.

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [START_HERE.md](START_HERE.md) | You are here! Quick start |
| [PHASE1_COMPLETE.md](PHASE1_COMPLETE.md) | Detailed Phase 1 summary |
| [QUICKSTART.md](QUICKSTART.md) | 5-minute setup guide |
| [README.md](README.md) | Full project documentation |
| [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | Technical architecture & roadmap |
| [SETUP_COMPLETE.md](SETUP_COMPLETE.md) | Initial setup status |

---

## 🐛 Troubleshooting

### Database not connecting?
```bash
make db-up
sleep 5
```

### Port already in use?
```bash
# Kill processes
lsof -ti:3000 | xargs kill  # Frontend
lsof -ti:3001 | xargs kill  # API
lsof -ti:5432 | xargs kill  # PostgreSQL
```

### Auth0 errors?
The app works without Auth0! It just won't have real SSO.
The API uses mock authentication for development.

### Need to reset everything?
```bash
make clean
make install
make db-reset
```

---

## 🎉 You're All Set!

Phase 1 is complete and ready to use. Start the servers and explore!

**Next**: Proceed to Phase 2 for 3D map visualization.

---

**Built with**: Next.js 15, React 18, Fastify, PostgreSQL + PostGIS, Drizzle ORM, Auth0, Three.js
**For**: Insomniac Events - Festival Management Dashboard
