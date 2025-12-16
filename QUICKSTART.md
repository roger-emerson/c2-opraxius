# ESG Command Center - Quick Start Guide

## 🚀 Get Up and Running in 5 Minutes

### Prerequisites Check
```bash
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 9.0.0
docker --version # Should be installed
```

### Step 1: Install Dependencies (2 min)
```bash
cd /Users/roger/Desktop/Projects/esg-commandcenter
npm install
```

### Step 2: Set Up Environment (1 min)
```bash
# Copy environment template
cp .env.example .env

# For quick testing, the defaults work!
# For production, you'll need to configure Auth0
```

### Step 3: Start Database (1 min)
```bash
make db-up
```

Wait for this output:
```
✓ Container esg-postgres  Started
✓ Container esg-redis     Started
```

### Step 4: Initialize Database (1 min)
```bash
cd packages/database
npm install
npm run db:push
cd ../..
```

### Step 5: Start Development Server
```bash
npm run dev
```

This starts:
- 🌐 **Frontend**: http://localhost:3000
- 🔧 **API**: http://localhost:3001
- 🗄️ **Database**: localhost:5432
- 💾 **Redis**: localhost:6379

## ✅ Verify Setup

1. **Visit http://localhost:3000**
   - You should see "ESG Command Center" homepage

2. **Check Database**
   ```bash
   cd packages/database
   npm run db:studio
   ```
   - Opens Drizzle Studio at http://localhost:4983
   - Explore your database schema visually

3. **Test API** (once implemented)
   ```bash
   curl http://localhost:3001/health
   ```

## 🎯 What's Working Now

- ✅ Monorepo structure
- ✅ TypeScript configuration
- ✅ Database schema (7 tables)
- ✅ Shared types & constants
- ✅ Docker services
- ✅ Next.js frontend skeleton
- ✅ Fastify backend skeleton

## 🚧 What's Next (To Be Implemented)

- ⏳ Auth0 authentication
- ⏳ RBAC middleware
- ⏳ REST API endpoints
- ⏳ 3D map visualization
- ⏳ Workcenter dashboards

## 🐛 Common Issues

### Port Already in Use
```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill
lsof -ti:3001 | xargs kill
lsof -ti:5432 | xargs kill
```

### Docker Not Running
```bash
# Start Docker Desktop
open -a Docker
```

### Database Connection Failed
```bash
# Reset database
make db-reset
```

## 📖 Learn More

- **Full Documentation**: [README.md](README.md)
- **Implementation Plan**: [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)
- **Setup Details**: [SETUP_COMPLETE.md](SETUP_COMPLETE.md)

## 💡 Development Tips

### Watch Mode
All packages support watch mode:
```bash
# Frontend auto-reload
cd apps/web && npm run dev

# Backend auto-reload
cd apps/api && npm run dev

# Database schema changes
cd packages/database && npm run dev
```

### Database Management
```bash
# View database in browser
cd packages/database && npm run db:studio

# Generate migration
npm run db:generate

# Push schema changes
npm run db:push
```

### Clean Start
```bash
# Reset everything
make clean
make install
make db-reset
```

---

**Ready to code!** 🎉

Next: Configure Auth0 in `.env` file
