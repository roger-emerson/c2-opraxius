# Supabase + Cloudflare Hyperdrive Setup Guide

This guide walks you through connecting your Supabase PostgreSQL database to Cloudflare Workers using Hyperdrive for connection pooling.

---

## Prerequisites

- Supabase account with a project created
- Cloudflare account with Workers enabled
- Wrangler CLI installed and authenticated (`npm install -g wrangler && wrangler login`)

---

## Step 1: Get Your Supabase Connection String

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Database**
4. Scroll to **Connection string** section
5. Select **URI** tab
6. Copy the connection string (it looks like):
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```

> **Important**: Use the **Pooler connection string** (port 6543) for Hyperdrive, NOT the direct connection (port 5432).

---

## Step 2: Enable PostGIS Extension

The C2 Command Center uses PostGIS for geospatial features. Enable it in Supabase:

1. Go to **Database** → **Extensions**
2. Search for `postgis`
3. Click **Enable**

Or run this SQL in the SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

---

## Step 3: Create Hyperdrive Configurations

Run these commands to create Hyperdrive bindings for each environment. Replace `YOUR_SUPABASE_CONNECTION_STRING` with your actual connection string.

```bash
# Authenticate with Cloudflare (if not already done)
wrangler login

# Create Development Hyperdrive
wrangler hyperdrive create c2-development-db \
  --connection-string="YOUR_SUPABASE_CONNECTION_STRING"

# Create Staging Hyperdrive  
wrangler hyperdrive create c2-staging-db \
  --connection-string="YOUR_SUPABASE_CONNECTION_STRING"

# Create Production Hyperdrive
wrangler hyperdrive create c2-production-db \
  --connection-string="YOUR_SUPABASE_CONNECTION_STRING"
```

Each command will output a Hyperdrive ID like:
```
Created Hyperdrive config c2-development-db with ID: a1b2c3d4e5f6...
```

**Save these IDs** - you'll need them in the next step.

---

## Step 4: Update Wrangler Configuration Files

Update each wrangler.toml file with the corresponding Hyperdrive ID:

### Development (`apps/api-workers/wrangler.development.toml`)

```toml
[[hyperdrive]]
binding = "HYPERDRIVE"
id = "YOUR_DEVELOPMENT_HYPERDRIVE_ID"
```

### Staging (`apps/api-workers/wrangler.staging.toml`)

```toml
[[hyperdrive]]
binding = "HYPERDRIVE"
id = "YOUR_STAGING_HYPERDRIVE_ID"
```

### Production (`apps/api-workers/wrangler.toml`)

```toml
[[hyperdrive]]
binding = "HYPERDRIVE"
id = "YOUR_PRODUCTION_HYPERDRIVE_ID"
```

---

## Step 5: Run Database Migrations

Push the Drizzle schema to create all tables:

```bash
cd packages/database

# Set your connection string (use direct connection for migrations, port 5432)
export DATABASE_URL="postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres"

# Push schema to database
npm run db:push
```

This creates the following tables:
- `events` - Festival events
- `users` - Auth users with RBAC
- `venue_features` - GIS data (PostGIS geometry)
- `tasks` - Task management
- `workcenters` - Department tracking
- `activity_feed` - Activity log
- `ai_chat_history` - Claude conversations

---

## Step 6: Set GitHub Secrets

Add the DATABASE_URL to your GitHub repository secrets for CI/CD:

1. Go to your repository → **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets for the **staging** environment:
   - `DATABASE_URL`: Your Supabase direct connection string (port 5432)

3. Add the same for the **production** environment (if using a separate database)

---

## Step 7: Verify Connection

Deploy and test the API health endpoint:

```bash
# Deploy to development
cd apps/api-workers
wrangler deploy -c wrangler.development.toml

# Test health check
curl https://dev.api.opraxius.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-21T...",
  "environment": "development"
}
```

---

## Troubleshooting

### "No database connection string available" Error

The Worker can't find the Hyperdrive binding. Verify:
1. Hyperdrive ID is correct in wrangler.toml
2. The binding name is `HYPERDRIVE` (case-sensitive)
3. You've deployed after updating the config

### "Connection refused" or Timeout Errors

1. Check Supabase project is not paused (free tier pauses after 7 days)
2. Verify you're using the pooler connection string (port 6543)
3. Check Supabase dashboard for any connection issues

### PostGIS Errors

If you see errors about geometry types:
1. Ensure PostGIS extension is enabled in Supabase
2. Re-run migrations: `npm run db:push`

### View Hyperdrive Configs

```bash
# List all Hyperdrive configs
wrangler hyperdrive list

# Get details of a specific config
wrangler hyperdrive get c2-development-db
```

### Delete and Recreate Hyperdrive

```bash
# Delete existing config
wrangler hyperdrive delete c2-development-db

# Create new one
wrangler hyperdrive create c2-development-db --connection-string="..."
```

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         Cloudflare Workers              │
│    (apps/api-workers on edge)           │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Hono API                        │   │
│  │  - /health                       │   │
│  │  - /api/venues                   │   │
│  │  - /api/tasks                    │   │
│  │  - /api/events                   │   │
│  └──────────────┬──────────────────┘   │
│                 │                       │
│        ┌────────▼────────┐              │
│        │   Hyperdrive    │              │
│        │ (connection     │              │
│        │  pooling)       │              │
│        └────────┬────────┘              │
└─────────────────┼───────────────────────┘
                  │
         ┌────────▼────────┐
         │    Supabase     │
         │   PostgreSQL    │
         │   + PostGIS     │
         └─────────────────┘
```

**Why Hyperdrive?**
- Connection pooling at the edge reduces latency
- Handles connection limits better than direct connections
- Caches query results for faster responses
- Works seamlessly with serverless Workers

---

## Next Steps

After completing this setup:

1. **Seed test data**: See the seed workflow in GitHub Actions or run:
   ```bash
   cd packages/database && npm run db:seed
   cd packages/gis && npm run import -- -f examples/test-venue.geojson -e [EVENT_ID]
   ```

2. **Configure Auth0**: See [SETUP_AUTH0.md](./SETUP_AUTH0.md)

3. **Test the 3D map**: Open https://dev.web.opraxius.com/dashboard/map

