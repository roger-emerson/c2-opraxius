# Manual Cloudflare Dashboard Setup Checklist

This document lists all manual steps required in the Cloudflare Dashboard to complete the CI/CD setup for all three environments (development, staging, production).

**Last Updated**: December 20, 2025

---

## Prerequisites

- Access to Cloudflare Dashboard for `opraxius.com`
- GitHub repository access to configure secrets/variables
- All DNS records should be configured (see DNS section below)

---

## DNS Records Verification

Verify these DNS records exist in Cloudflare Dashboard → DNS → Records:

### Development Environment
- ✅ `dev.api.opraxius.com` → Worker `c2-api-development` (Type: Worker)
- ❌ **MISSING**: `dev.web.opraxius.com` → CNAME `c2-web-development.pages.dev` (needs to be created)

### Staging Environment
- ✅ `staging.web.opraxius.com` → CNAME `c2-web-staging.pages.dev`
- ✅ `staging.api.opraxius.com` → Worker `c2-api-staging` (Type: Worker)

### Production Environment
- ✅ `dashboard.opraxius.com` → CNAME `c2-web-production.pages.dev`
- ✅ `api.opraxius.com` → Worker `c2-api-production` (Type: Worker)

**Action Required**: Create DNS CNAME record for `dev.web.opraxius.com` → `c2-web-development.pages.dev` (Proxy status: Proxied)

---

## Development Environment Setup

### 1. Create Pages Project: `c2-web-development`

1. Go to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
2. Connect to repository: `roger-emerson/c2-opraxius`
3. Set project name: `c2-web-development`
4. Set production branch: **`develop`** (CRITICAL)
5. Build settings:
   - Framework preset: Next.js
   - Build command: `npm run pages:build`
   - Build output directory: `.vercel/output/static`
   - Root directory: `apps/web`
   - Node version: `20`

### 2. Configure Pages Project Settings

**Settings → Functions:**
- Compatibility date: `2024-12-01`
- Compatibility flags: Add `nodejs_compat`

**Settings → Builds & deployments:**
- Production branch: `develop` (verify this is set correctly)

### 3. Add Custom Domain to Pages Project

1. Go to **c2-web-development** → **Custom domains**
2. Click **Set up a custom domain**
3. Enter: `dev.web.opraxius.com`
4. Click **Continue** → **Activate domain**
5. Wait for status to show **Active** (green indicator)

### 4. Configure Worker: `c2-api-development`

1. Go to **Workers & Pages** → **c2-api-development** (should already exist)
2. **Settings** → **Variables and Secrets**:
   - Add secrets: `DATABASE_URL`, `JWT_SECRET`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
   - These will be set automatically by GitHub Actions, but verify they exist
3. **Settings** → **Domains & Routes**:
   - Verify custom domain: `dev.api.opraxius.com` is configured
   - Status should be **Active**

---

## Staging Environment Setup

### 1. Verify Pages Project: `c2-web-staging`

**Settings → Builds & deployments:**
- ✅ Production branch: `staging` (verify this is set correctly)

**Custom domains:**
- ✅ `staging.web.opraxius.com` should be linked and Active

**Settings → Functions:**
- ✅ Compatibility date: `2024-12-01`
- ✅ Compatibility flags: `nodejs_compat` enabled

### 2. Verify Worker: `c2-api-staging`

**Settings → Domains & Routes:**
- ✅ Custom domain: `staging.api.opraxius.com` should be configured and Active

**Settings → Variables and Secrets:**
- ✅ Secrets should be set (set automatically by GitHub Actions)

---

## Production Environment Setup

### 1. Verify Pages Project: `c2-web-production`

**Settings → Builds & deployments:**
- ✅ Production branch: `main` (verify this is set correctly)

**Custom domains:**
- ✅ `dashboard.opraxius.com` should be linked and Active

**Settings → Functions:**
- ✅ Compatibility date: `2024-12-01`
- ✅ Compatibility flags: `nodejs_compat` enabled

### 2. Verify Worker: `c2-api-production`

**Settings → Domains & Routes:**
- ✅ Custom domain: `api.opraxius.com` should be configured and Active

**Settings → Variables and Secrets:**
- ✅ Secrets should be set (set automatically by GitHub Actions)

---

## GitHub Repository Configuration

### Environment Variables (Settings → Secrets and variables → Actions → Variables)

Add/verify these variables exist:

**Staging Environment:**
- `STAGING_API_URL` = `https://staging.api.opraxius.com`
- `STAGING_WEB_URL` = `https://staging.web.opraxius.com`

**Production Environment:**
- `PRODUCTION_API_URL` = `https://api.opraxius.com`
- `PRODUCTION_WEB_URL` = `https://dashboard.opraxius.com`

**Development Environment:**
- `DEVELOPMENT_API_URL` = `https://dev.api.opraxius.com`
- `DEVELOPMENT_WEB_URL` = `https://dev.web.opraxius.com`

### Secrets (Settings → Secrets and variables → Actions → Secrets)

Verify these secrets exist (should be shared across environments):
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `DATABASE_URL` (in staging environment)
- `JWT_SECRET` (in staging environment)
- `UPSTASH_REDIS_REST_URL` (in staging environment)
- `UPSTASH_REDIS_REST_TOKEN` (in staging environment)

**Note**: Development environment uses `staging` environment secrets (shared database/secrets).

---

## Verification Checklist

After completing all manual steps, verify:

### Development Environment
- [ ] DNS record `dev.web.opraxius.com` exists and points to `c2-web-development.pages.dev`
- [ ] Pages project `c2-web-development` exists with production branch = `develop`
- [ ] Custom domain `dev.web.opraxius.com` is Active in Pages project
- [ ] Worker `c2-api-development` has custom domain `dev.api.opraxius.com` configured
- [ ] Node.js compatibility enabled in Pages project
- [ ] GitHub variable `DEVELOPMENT_API_URL` is set
- [ ] GitHub variable `DEVELOPMENT_WEB_URL` is set
- [ ] Push to `develop` branch triggers deployment workflow

### Staging Environment
- [ ] Pages project `c2-web-staging` has production branch = `staging`
- [ ] Custom domain `staging.web.opraxius.com` is Active
- [ ] Worker `c2-api-staging` has custom domain `staging.api.opraxius.com` configured
- [ ] Node.js compatibility enabled in Pages project
- [ ] GitHub variables `STAGING_API_URL` and `STAGING_WEB_URL` are set
- [ ] Push to `staging` branch triggers deployment workflow

### Production Environment
- [ ] Pages project `c2-web-production` has production branch = `main`
- [ ] Custom domain `dashboard.opraxius.com` is Active
- [ ] Worker `c2-api-production` has custom domain `api.opraxius.com` configured
- [ ] Node.js compatibility enabled in Pages project
- [ ] GitHub variables `PRODUCTION_API_URL` and `PRODUCTION_WEB_URL` are set
- [ ] Push to `main` branch triggers deployment workflow (with approval)

---

## Testing Deployments

After setup, test each environment:

### Development
```bash
# Push to develop branch
git checkout develop
git push origin develop

# Verify URLs
curl https://dev.api.opraxius.com/health
curl https://dev.web.opraxius.com
```

### Staging
```bash
# Push to staging branch
git checkout staging
git push origin staging

# Verify URLs
curl https://staging.api.opraxius.com/health
curl https://staging.web.opraxius.com
```

### Production
```bash
# Push to main branch
git checkout main
git push origin main

# Verify URLs (after approval)
curl https://api.opraxius.com/health
curl https://dashboard.opraxius.com
```

---

## Troubleshooting

### Pages Deployment Shows "Deployment Not Found"
- Verify production branch matches your deployment branch
- Check custom domain is linked in Pages project
- Wait for DNS propagation (can take a few minutes)

### Worker Custom Domain Not Working
- Verify domain is configured in Worker settings → Domains & Routes
- Check DNS record exists and is proxied (orange cloud)
- Wait for DNS propagation

### GitHub Actions Workflow Fails
- Check GitHub secrets/variables are set correctly
- Verify Cloudflare API token has correct permissions
- Check workflow logs for specific error messages

### Node.js Compatibility Errors
- Ensure `nodejs_compat` flag is enabled in Pages project settings
- Verify compatibility date is set to `2024-12-01` or later

---

## Quick Reference

**Workers:**
- `c2-api-development` → `dev.api.opraxius.com`
- `c2-api-staging` → `staging.api.opraxius.com`
- `c2-api-production` → `api.opraxius.com`

**Pages:**
- `c2-web-development` → `dev.web.opraxius.com` (branch: `develop`)
- `c2-web-staging` → `staging.web.opraxius.com` (branch: `staging`)
- `c2-web-production` → `dashboard.opraxius.com` (branch: `main`)

**Branches → Deployments:**
- `develop` → Development environment
- `staging` → Staging environment
- `main` → Production environment (requires approval)

