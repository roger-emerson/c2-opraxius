# Cloudflare Deployment Guide

## Overview

This document provides a comprehensive guide for deploying the C2 Command Center to Cloudflare's infrastructure, including Workers (API) and Pages (Web frontend).

## Architecture

The C2 Command Center uses a split deployment strategy:

- **API**: Deployed to Cloudflare Workers
  - Framework: Hono
  - Custom domains: `api.staging.opraxius.com`, `api.opraxius.com`
  - Deployment: Via GitHub Actions using `wrangler deploy`

- **Web**: Deployed to Cloudflare Pages
  - Framework: Next.js with `@cloudflare/next-on-pages`
  - Custom domains: `staging.opraxius.com`, `dashboard.opraxius.com`
  - Deployment: Via GitHub Actions using `wrangler pages deploy`

## Prerequisites

1. **Cloudflare Account** with:
   - Domain configured (opraxius.com)
   - Workers and Pages enabled
   - API Token with appropriate permissions

2. **GitHub Repository Secrets**:
   - `CLOUDFLARE_API_TOKEN`: API token for deployments
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
   - Database connection strings and other environment variables

3. **Domain DNS**:
   - DNS managed by Cloudflare (proxied through Cloudflare)

## Cloudflare Workers (API) Setup

### 1. Create Worker Projects

Create two Worker projects in Cloudflare Dashboard:
- `c2-api-staging` (for staging environment)
- `c2-api-production` (for production environment)

### 2. Configure Custom Domains

For each Worker:

1. Go to **Workers & Pages** → Select your worker → **Settings** → **Domains & Routes**
2. Add custom domain:
   - Staging: `api.staging.opraxius.com`
   - Production: `api.opraxius.com`

### 3. Set Environment Variables

In **Workers & Pages** → Worker → **Settings** → **Variables and Secrets**:

Add all required environment variables from `.env.example`:
- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- etc.

### 4. Deployment Configuration

Workers are deployed via `wrangler.toml` configuration:

```toml
# apps/api-workers/wrangler.staging.toml
name = "c2-api-staging"
main = "src/index.ts"
compatibility_date = "2024-12-01"

[vars]
ENVIRONMENT = "staging"
```

Deployment command (in GitHub Actions):
```bash
npx wrangler deploy --config apps/api-workers/wrangler.staging.toml
```

### 5. Security Considerations

**Hostname Blocking**: The Worker includes middleware to block requests from non-approved domains:

```typescript
// Only allow requests from custom domains, block *.workers.dev
app.use('*', async (c, next) => {
  const hostname = url.hostname;
  const allowedDomains = [
    'api.staging.opraxius.com',
    'api.opraxius.com',
    'localhost',
  ];

  if (!allowedDomains.includes(hostname)) {
    return c.text('Not Found', 404);
  }

  await next();
});
```

**Health Check Bypass**: The `/health` endpoint allows curl and GitHub Actions user-agents for CI/CD verification:

```typescript
if (path === '/health' && (userAgent.includes('curl') || userAgent.includes('GitHub'))) {
  return next();
}
```

## Cloudflare Pages (Web) Setup

### 1. Create Pages Projects

Create two Pages projects in Cloudflare Dashboard:
- `c2-web-staging`
- `c2-web-production`

### 2. Configure Production Branch

**CRITICAL**: Set the production branch for each Pages project:

1. Go to **Workers & Pages** → Your Pages project → **Settings** → **Builds & deployments**
2. Under **Production branch**, set:
   - `c2-web-staging`: Production branch = `staging`
   - `c2-web-production`: Production branch = `main`

This ensures custom domains route to the correct branch deployments.

### 3. Configure Node.js Compatibility

Pages Functions require Node.js compatibility for Next.js:

1. Go to **Workers & Pages** → Your Pages project → **Settings** → **Functions**
2. Under **Compatibility flags**, add: `nodejs_compat`
3. Set **Compatibility date**: `2024-12-01` (or latest)

**Note**: The `compatibility_flags` in `wrangler.toml` are **NOT** applied to `wrangler pages deploy`. You must configure these in the Dashboard.

### 4. Configure Custom Domains

**IMPORTANT**: Custom domains must be added in TWO places:

#### A. DNS Records (Cloudflare Dashboard → DNS)

Add CNAME records pointing to Pages deployment:

```
Type: CNAME
Name: staging
Target: c2-web-staging.pages.dev
Proxy status: Proxied (orange cloud)
TTL: Auto
```

```
Type: CNAME
Name: dashboard
Target: c2-web-production.pages.dev
Proxy status: Proxied (orange cloud)
TTL: Auto
```

#### B. Pages Project Custom Domains

For each Pages project, add the custom domain:

1. Go to **Workers & Pages** → Your Pages project → **Custom domains**
2. Click **Set up a custom domain**
3. Enter domain (e.g., `staging.opraxius.com`)
4. Click **Continue** → **Activate domain**
5. Wait for status to show **Active** (green indicator)

**Why both are needed**:
- DNS CNAME: Routes traffic from your domain to Cloudflare Pages
- Pages custom domain: Links the domain to your specific Pages deployment

### 5. Middleware Considerations

**Important**: Next.js middleware does **NOT** work with `@cloudflare/next-on-pages` for hostname blocking.

❌ **Don't do this** (middleware won't execute on Pages):
```typescript
// This won't work for blocking *.pages.dev URLs
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host');
  if (hostname.includes('.pages.dev')) {
    return new NextResponse('Not Found', { status: 404 });
  }
}
```

✅ **Instead**: Control access via Cloudflare Dashboard settings and custom domain configuration. Only configured custom domains will work; `*.pages.dev` URLs can be disabled in Dashboard settings.

### 6. Security Configuration

To block direct `*.pages.dev` access:

1. Go to **Workers & Pages** → Your Pages project → **Settings** → **General**
2. Under **Access Policy**, configure:
   - Enable "Require visitors to authenticate"
   - Or use Cloudflare Access policies

Alternatively, use Cloudflare Page Rules:
1. Go to **Rules** → **Page Rules**
2. Create rule for `*.pages.dev/*`
3. Setting: "Forwarding URL" → Redirect to custom domain

### 7. Build Configuration

Next.js is built with `@cloudflare/next-on-pages`:

```json
{
  "scripts": {
    "build": "next build",
    "pages:build": "npx @cloudflare/next-on-pages"
  }
}
```

The build output is in `.vercel/output/static/` which is deployed to Pages.

Deployment command (in GitHub Actions):
```bash
npx wrangler pages deploy apps/web/.vercel/output/static --project-name=c2-web-staging
```

## GitHub Actions CI/CD

### Workflow Structure

The deployment workflow has 4 sequential jobs:

1. **Run Database Migrations**
   - Runs Drizzle migrations against staging database
   - Ensures schema is up-to-date before deployment

2. **Deploy API to Workers**
   - Builds and deploys Hono API to Cloudflare Workers
   - Sets environment variables via secrets

3. **Deploy Web to Pages**
   - Builds Next.js app with `@cloudflare/next-on-pages`
   - Deploys to Cloudflare Pages

4. **Verify Deployment**
   - Waits 30s for propagation
   - Checks API health: `curl https://api.staging.opraxius.com/health`
   - Checks Web health: `curl https://staging.opraxius.com`
   - Fails deployment if either returns non-200 status

### Deployment Workflow

See [`.github/workflows/deploy-staging.yml`](../.github/workflows/deploy-staging.yml) for complete workflow.

Key steps for Pages deployment:

```yaml
- name: Build with @cloudflare/next-on-pages
  run: |
    npm run build
    npm run pages:build
  working-directory: apps/web

- name: Deploy to Cloudflare Pages
  uses: cloudflare/wrangler-action@v3
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    command: pages deploy apps/web/.vercel/output/static --project-name=c2-web-staging
```

## Common Issues and Solutions

### Issue 1: Health Check Returns 403 Forbidden

**Symptom**: GitHub Actions health check fails with 403 status.

**Cause**: Cloudflare Bot Fight Mode or Security Level blocking GitHub Actions (datacenter IPs).

**Solution**:
1. Go to **Security** → **WAF** → **Tools**
2. Add Page Rule or custom rule to bypass security for `/health` endpoint
3. Or set Security Level to "Low" for health check path

### Issue 2: Custom Domain Shows "Deployment Not Found"

**Symptom**: Custom domain returns 404 or "Deployment Not Found" page.

**Cause**: Custom domain not linked to Pages project, or production branch mismatch.

**Solutions**:
1. Verify custom domain is added in Pages project (not just DNS)
2. Check production branch setting matches your deployment branch
3. Trigger new deployment after adding custom domain
4. Wait for DNS propagation (can take a few minutes)

### Issue 3: Pages Deployment Shows Node.js Compatibility Errors

**Symptom**: Pages deployment returns 503 or compatibility errors.

**Cause**: `nodejs_compat` flag not set in Dashboard.

**Solution**:
1. Go to Pages project → **Settings** → **Functions**
2. Add compatibility flag: `nodejs_compat`
3. Set compatibility date: `2024-12-01`
4. Redeploy

### Issue 4: Middleware Not Blocking `*.pages.dev` URLs

**Symptom**: Next.js middleware doesn't execute on Cloudflare Pages.

**Cause**: `@cloudflare/next-on-pages` doesn't support all Next.js middleware features.

**Solution**: Use Cloudflare Dashboard settings and custom domain configuration instead of middleware for access control.

## Monitoring and Troubleshooting

### Check Deployment Status

Using GitHub CLI:

```bash
# List recent deployments
gh run list --workflow="Deploy to Cloudflare Staging" --limit 5

# Watch deployment in real-time
gh run watch <run-id>

# View logs
gh run view <run-id> --log

# View only failed jobs
gh run view <run-id> --log-failed
```

See [GITHUB_CLI_REFERENCE.md](GITHUB_CLI_REFERENCE.md) for complete command reference.

### Test Endpoints

```bash
# Test API health
curl -I https://api.staging.opraxius.com/health

# Test web homepage
curl -I https://staging.opraxius.com

# Test with specific user agent (simulates GitHub Actions)
curl -H "User-Agent: GitHub-Hookshot" https://api.staging.opraxius.com/health
```

### Check Cloudflare Logs

1. Go to **Workers & Pages** → Your project → **Logs**
2. Filter by time range and log level
3. Look for errors or unusual patterns

### Verify DNS Resolution

```bash
# Check DNS CNAME record
dig staging.opraxius.com

# Check DNS with specific nameserver
dig @1.1.1.1 staging.opraxius.com

# Trace DNS propagation
nslookup staging.opraxius.com
```

## Environment-Specific Configuration

### Staging Environment

- **API Domain**: `api.staging.opraxius.com`
- **Web Domain**: `staging.opraxius.com`
- **Branch**: `staging`
- **Database**: Staging database instance
- **Worker**: `c2-api-staging`
- **Pages Project**: `c2-web-staging`

### Production Environment

- **API Domain**: `api.opraxius.com`
- **Web Domain**: `dashboard.opraxius.com`
- **Branch**: `main`
- **Database**: Production database instance
- **Worker**: `c2-api-production`
- **Pages Project**: `c2-web-production`

## Rollback Procedures

### Rollback Worker Deployment

```bash
# List previous deployments
wrangler deployments list --config apps/api-workers/wrangler.staging.toml

# Rollback to specific deployment
wrangler rollback <deployment-id> --config apps/api-workers/wrangler.staging.toml
```

### Rollback Pages Deployment

1. Go to **Workers & Pages** → Pages project → **Deployments**
2. Find the previous successful deployment
3. Click **Rollback to this deployment**

Or via `wrangler`:

```bash
# This requires manual intervention in Dashboard
# Pages rollback is not fully supported via CLI
```

## Best Practices

1. **Always test in staging first** before deploying to production
2. **Monitor health checks** after each deployment
3. **Use environment variables** for configuration (never hardcode)
4. **Version your API** to support gradual rollouts
5. **Set up alerts** for deployment failures
6. **Document custom configurations** in Cloudflare Dashboard
7. **Test custom domains** after initial setup and any DNS changes
8. **Keep wrangler.toml in sync** with Dashboard settings where applicable
9. **Use GitHub Environments** for deployment approval gates (production)
10. **Monitor Cloudflare Analytics** for traffic patterns and errors

## Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [@cloudflare/next-on-pages Documentation](https://github.com/cloudflare/next-on-pages)
- [GitHub CLI Reference](GITHUB_CLI_REFERENCE.md)
