# ESG Command Center - Cloudflare Deployment Guide

This guide walks you through deploying the ESG Command Center to Cloudflare (Workers + Pages) with Supabase for PostgreSQL + PostGIS and Upstash for Redis.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Cloudflare                              │
│  ┌──────────────────────┐    ┌──────────────────────┐          │
│  │   Cloudflare Pages   │    │  Cloudflare Workers  │          │
│  │   (Next.js Frontend) │───▶│   (Hono API)         │          │
│  └──────────────────────┘    └──────────┬───────────┘          │
│                                         │                       │
│                              ┌──────────▼───────────┐          │
│                              │     Hyperdrive       │          │
│                              │ (Connection Pooling) │          │
│                              └──────────┬───────────┘          │
└─────────────────────────────────────────┼───────────────────────┘
                                          │
              ┌───────────────────────────┼───────────────────────┐
              │                           │                       │
    ┌─────────▼─────────┐      ┌─────────▼─────────┐             │
    │     Supabase      │      │      Upstash      │             │
    │  PostgreSQL +     │      │      Redis        │             │
    │     PostGIS       │      │                   │             │
    └───────────────────┘      └───────────────────┘             │
```

---

## Prerequisites

You'll need accounts for:
- [Cloudflare](https://dash.cloudflare.com) - Free tier available
- [Supabase](https://supabase.com) - Free tier with 500MB database
- [Upstash](https://upstash.com) - Free tier with 10K commands/day
- [GitHub](https://github.com) - For CI/CD

---

## Step 1: Cloudflare Setup

### 1.1 Create Account & Install CLI

```bash
# Install Wrangler CLI globally
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

### 1.2 Get Account ID

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click on "Workers & Pages" in the sidebar
3. Copy your **Account ID** from the right sidebar

### 1.3 Create API Token

1. Go to **Account Settings** > **API Tokens**
2. Click **Create Token**
3. Use the **"Edit Cloudflare Workers"** template
4. Click **Continue to summary** > **Create Token**
5. **Copy and save the token** - you won't see it again!

---

## Step 2: Supabase Setup

### 2.1 Create Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Fill in:
   - **Name**: `esg-commandcenter-staging`
   - **Database Password**: Generate a strong password and save it
   - **Region**: Choose closest to your users
4. Click **Create new project**

### 2.2 Enable PostGIS Extension

1. Go to **Database** > **Extensions**
2. Search for `postgis`
3. Click **Enable** on the PostGIS extension

### 2.3 Get Connection String

1. Go to **Settings** > **Database**
2. Find **Connection string** section
3. Copy the **URI** (starts with `postgresql://`)
4. Replace `[YOUR-PASSWORD]` with your actual password

**Example:**
```
postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

---

## Step 3: Upstash Redis Setup

### 3.1 Create Database

1. Go to [Upstash Console](https://console.upstash.com)
2. Click **Create Database**
3. Fill in:
   - **Name**: `esg-commandcenter-staging`
   - **Region**: Choose closest to Cloudflare edge
   - **Type**: Regional
4. Click **Create**

### 3.2 Get Credentials

From the database dashboard, copy:
- **UPSTASH_REDIS_REST_URL** (e.g., `https://xxx.upstash.io`)
- **UPSTASH_REDIS_REST_TOKEN** (the long token string)

---

## Step 4: Hyperdrive Setup (Connection Pooling)

Hyperdrive provides connection pooling for your PostgreSQL database at the Cloudflare edge.

```bash
# Create Hyperdrive configuration
wrangler hyperdrive create esg-staging-db \
  --connection-string="postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

Copy the returned **Hyperdrive ID** (looks like `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`).

### Update wrangler.toml

Edit `apps/api-workers/wrangler.toml`:

```toml
[[hyperdrive]]
binding = "HYPERDRIVE"
id = "your-hyperdrive-id-here"
```

---

## Step 5: GitHub Repository Secrets

Go to your GitHub repository > **Settings** > **Secrets and variables** > **Actions**

### Add these Secrets:

| Secret Name | Value |
|-------------|-------|
| `CLOUDFLARE_API_TOKEN` | Your Cloudflare API token |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |
| `DATABASE_URL` | Supabase connection string |
| `JWT_SECRET` | Generate with `openssl rand -base64 32` |
| `UPSTASH_REDIS_REST_URL` | Upstash REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash REST token |
| `AUTH0_SECRET` | Your Auth0 secret (if using Auth0) |
| `AUTH0_ISSUER_BASE_URL` | Your Auth0 domain |
| `AUTH0_CLIENT_ID` | Your Auth0 client ID |
| `AUTH0_CLIENT_SECRET` | Your Auth0 client secret |

### Add these Variables:

Go to **Variables** tab:

| Variable Name | Value |
|---------------|-------|
| `STAGING_API_URL` | `https://c2-api-staging.<account>.workers.dev` |
| `STAGING_WEB_URL` | `https://esg-web-staging.pages.dev` |

---

## Step 6: Push to Deploy Branch

```bash
# Navigate to project
cd /Users/roger/Desktop/Projects/esg-commandcenter

# Make sure you're on deploy/staging branch
git checkout deploy/staging

# Stage all changes
git add .

# Commit
git commit -m "feat: Add Cloudflare Workers deployment configuration"

# Push to trigger GitHub Actions
git push -u origin deploy/staging
```

---

## Step 7: Verify Deployment

### Check GitHub Actions

1. Go to your repository on GitHub
2. Click **Actions** tab
3. Watch the "Deploy to Cloudflare Staging" workflow

### Test API

```bash
# Health check
curl https://c2-api-staging.<your-subdomain>.workers.dev/health

# Expected response:
# {"status":"ok","timestamp":"2024-12-16T...","environment":"staging"}
```

### Test Frontend

Open in browser:
```
https://esg-web-staging.pages.dev
```

---

## Step 8: Run Database Migrations

If migrations didn't run automatically:

```bash
# Install dependencies
cd packages/database
npm install

# Run migrations
DATABASE_URL="your-supabase-url" npx drizzle-kit push
```

---

## Troubleshooting

### API Returns 500 Error

1. Check Cloudflare Workers logs:
   ```bash
   wrangler tail --name c2-api-staging
   ```
2. Verify DATABASE_URL is correct
3. Verify Hyperdrive ID is set in wrangler.toml

### Frontend Build Fails

1. Check if `@cloudflare/next-on-pages` is installed
2. Run locally first:
   ```bash
   cd apps/web
   npm run pages:build
   ```

### Database Connection Issues

1. Verify PostGIS is enabled in Supabase
2. Check connection string format
3. Test connection locally:
   ```bash
   psql "your-connection-string"
   ```

### GitHub Actions Fails

1. Verify all secrets are set correctly
2. Check the Actions logs for specific errors
3. Ensure CLOUDFLARE_ACCOUNT_ID is set (not just API token)

---

## Local Development with Wrangler

### Test API Locally

```bash
cd apps/api-workers

# Set environment variables
export DATABASE_URL="your-supabase-url"

# Run locally
wrangler dev
```

### Test Frontend Locally

```bash
cd apps/web

# Build for Cloudflare
npm run pages:build

# Preview locally
npm run pages:preview
```

---

## Merging to Main

After verifying staging works:

```bash
# Switch to main
git checkout main
git pull origin main

# Merge deployment branch
git merge deploy/staging

# Push to main
git push origin main
```

---

## Cost Estimates (Free Tier Limits)

| Service | Free Tier | Typical Usage |
|---------|-----------|---------------|
| Cloudflare Workers | 100K requests/day | Well within limits |
| Cloudflare Pages | Unlimited sites | N/A |
| Supabase | 500MB database | ~50-100MB for staging |
| Upstash Redis | 10K commands/day | ~1-2K for staging |

**Total monthly cost for staging: $0**

---

## Security Checklist

- [ ] JWT_SECRET is randomly generated (not default)
- [ ] DATABASE_URL is stored as GitHub secret (not in code)
- [ ] Auth0 credentials are configured
- [ ] CORS origins are restricted to your domains
- [ ] Hyperdrive is configured (for connection security)

---

## Next Steps

1. Configure custom domain in Cloudflare
2. Set up production environment (separate from staging)
3. Configure monitoring and alerts
4. Set up database backups in Supabase

