# Auth0 Setup Guide for C2 Command Center

This guide walks you through configuring Auth0 as the OAuth provider for the C2 Command Center application.

---

## Prerequisites

- Auth0 account ([Sign up free](https://auth0.com/signup))
- Access to GitHub repository secrets
- C2 Command Center deployed to Cloudflare

---

## Step 1: Create Auth0 Application

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Navigate to **Applications** → **Applications**
3. Click **+ Create Application**
4. Configure:
   - **Name**: `C2 Command Center`
   - **Application Type**: `Regular Web Application`
5. Click **Create**

---

## Step 2: Configure Application Settings

In your new application's **Settings** tab:

### Basic Information
- Note your **Client ID** and **Client Secret** (you'll need these later)
- Note your **Domain** (e.g., `your-tenant.auth0.com`)

### Application URIs

**Allowed Callback URLs** (one per line):
```
http://localhost:3000/api/auth/callback/auth0
https://dev.web.opraxius.com/api/auth/callback/auth0
https://staging.web.opraxius.com/api/auth/callback/auth0
https://dashboard.opraxius.com/api/auth/callback/auth0
```

**Allowed Logout URLs** (one per line):
```
http://localhost:3000
https://dev.web.opraxius.com
https://staging.web.opraxius.com
https://dashboard.opraxius.com
```

**Allowed Web Origins** (one per line):
```
http://localhost:3000
https://dev.web.opraxius.com
https://staging.web.opraxius.com
https://dashboard.opraxius.com
```

### Scroll down and click **Save Changes**

---

## Step 3: Enable Authentication Methods

1. Go to **Authentication** → **Database** → **Username-Password-Authentication**
2. Ensure it's enabled (toggle should be on)

Or for social login:
1. Go to **Authentication** → **Social**
2. Enable desired providers (Google, GitHub, etc.)

---

## Step 4: Create Auth0 API (for JWT validation)

This allows the backend Workers to validate tokens.

1. Go to **Applications** → **APIs**
2. Click **+ Create API**
3. Configure:
   - **Name**: `C2 Command Center API`
   - **Identifier**: `https://api.opraxius.com` (this is your API audience)
   - **Signing Algorithm**: `RS256`
4. Click **Create**

---

## Step 5: Set GitHub Secrets

Add these secrets to your GitHub repository for each environment:

### Navigate to Repository Settings
1. Go to your repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **Environments** and select `staging`

### Add Secrets for Staging Environment

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `AUTH0_CLIENT_ID` | Your Client ID | From Application Settings |
| `AUTH0_CLIENT_SECRET` | Your Client Secret | From Application Settings |
| `AUTH0_ISSUER_BASE_URL` | `https://your-tenant.auth0.com` | Your Auth0 domain with https:// |
| `NEXTAUTH_SECRET` | Random 32+ char string | Generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://staging.web.opraxius.com` | Your frontend URL |

### Add Secrets for Production Environment

Repeat the above for the `production` environment, using:
- `NEXTAUTH_URL`: `https://dashboard.opraxius.com`

---

## Step 6: Update GitHub Actions Workflows

The deployment workflows need to pass Auth0 secrets to Cloudflare Pages. Update the web deployment section in each workflow:

### `.github/workflows/deploy-staging.yml` (and similar for others)

The build step should include:
```yaml
- name: Build with @cloudflare/next-on-pages
  run: npm run pages:build
  working-directory: apps/web
  env:
    NEXT_PUBLIC_API_URL: ${{ vars.STAGING_API_URL }}
    AUTH0_CLIENT_ID: ${{ secrets.AUTH0_CLIENT_ID }}
    AUTH0_CLIENT_SECRET: ${{ secrets.AUTH0_CLIENT_SECRET }}
    AUTH0_ISSUER_BASE_URL: ${{ secrets.AUTH0_ISSUER_BASE_URL }}
    NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
    NEXTAUTH_URL: ${{ vars.STAGING_WEB_URL }}
```

---

## Step 7: Configure JWT Validation in Workers

The API Workers validate JWT tokens issued by Auth0. Ensure the JWT_SECRET is set:

1. Generate a secret: `openssl rand -base64 32`
2. Add to GitHub Secrets: `JWT_SECRET`
3. The deployment workflow already sets this as a Worker secret

---

## Step 8: Test Authentication Flow

1. Deploy to development:
   ```bash
   git push origin develop
   ```

2. Open https://dev.web.opraxius.com

3. Click **Sign In**

4. You should be redirected to Auth0 login page

5. After login, you should be redirected back to the dashboard

---

## Troubleshooting

### "Callback URL mismatch" Error

Auth0 is strict about callback URLs. Verify:
1. The callback URL in Auth0 **exactly** matches the one being used
2. Include the full path: `/api/auth/callback/auth0`
3. Protocol matches (`https://` vs `http://`)

### "Invalid token" in API

1. Check `JWT_SECRET` is set in Worker secrets
2. Verify Auth0 domain matches in both frontend and backend
3. Check token hasn't expired

### User Not Syncing to Database

The current implementation uses JWT claims directly. To sync users to the database:

1. Create an Auth0 Action (Actions → Flows → Login)
2. Add a post-login action to call your API
3. Or implement user sync in the NextAuth callbacks

### View Auth0 Logs

1. Go to Auth0 Dashboard → **Monitoring** → **Logs**
2. Filter by event type or user
3. Check for authentication errors

---

## RBAC Integration

The C2 Command Center uses role-based access control. To assign roles:

### Option 1: Auth0 Roles (Recommended)

1. Go to **User Management** → **Roles**
2. Create roles matching your system:
   - `admin`
   - `operations_lead`
   - `production_lead`
   - `security_lead`
   - `viewer`
   - etc.

3. Assign roles to users in **User Management** → **Users**

4. Add role to JWT token via Auth0 Action:

```javascript
// Auth0 Action: Add roles to token
exports.onExecutePostLogin = async (event, api) => {
  const roles = event.authorization?.roles || [];
  api.idToken.setCustomClaim('roles', roles);
  api.accessToken.setCustomClaim('roles', roles);
};
```

### Option 2: Database Roles

Store roles in your Supabase `users` table and fetch on login via NextAuth callbacks.

---

## Environment-Specific Configuration

| Environment | Auth0 Callback URL | NEXTAUTH_URL |
|-------------|-------------------|--------------|
| Local | `http://localhost:3000/api/auth/callback/auth0` | `http://localhost:3000` |
| Development | `https://dev.web.opraxius.com/api/auth/callback/auth0` | `https://dev.web.opraxius.com` |
| Staging | `https://staging.web.opraxius.com/api/auth/callback/auth0` | `https://staging.web.opraxius.com` |
| Production | `https://dashboard.opraxius.com/api/auth/callback/auth0` | `https://dashboard.opraxius.com` |

---

## Security Checklist

- [ ] Client Secret is stored securely (never in code)
- [ ] NEXTAUTH_SECRET is unique per environment
- [ ] Callback URLs are HTTPS in production
- [ ] Token expiration is reasonable (default: 24 hours)
- [ ] Refresh token rotation is enabled (optional but recommended)

---

## Next Steps

After completing Auth0 setup:

1. **Test login flow** on each environment
2. **Create test users** in Auth0 dashboard
3. **Assign roles** to test users
4. **Verify RBAC** - different roles see different data

---

## Related Documentation

- [Supabase Setup](./SETUP_SUPABASE.md) - Database configuration
- [Architecture](./ARCHITECTURE.md) - System overview
- [Auth0 Docs](https://auth0.com/docs) - Official documentation

