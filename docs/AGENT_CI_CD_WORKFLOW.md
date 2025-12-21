# Agent CI/CD Debugging Workflow

> **Purpose**: Standard operating procedure for AI agents to verify CI/CD pipeline success after pushing code changes.

---

## Post-Push Verification Workflow

After every `git push`, the agent **MUST** verify the CI/CD pipeline completes successfully.

### Step 1: Wait for Pipeline to Start (5-10 seconds)

```bash
# Brief pause to allow GitHub Actions to queue
sleep 5
```

### Step 2: Check Latest Workflow Runs

```bash
cd /path/to/repo
gh run list --limit 5
```

**Expected Output**:
```
STATUS    CONCLUSION    TITLE                    WORKFLOW              BRANCH   EVENT   ID          ELAPSED  AGE
queued    -             <commit message>         Deploy to Cloudflare  develop  push    123456789   0s       1s
completed success       <previous commit>        ...                   ...      ...     ...         ...      ...
```

### Step 3: Wait for Completion (if in_progress)

```bash
# Watch specific run until completion
gh run watch <RUN_ID>

# Or poll status every 30 seconds
gh run view <RUN_ID> --exit-status
```

### Step 4: On Failure - Get Detailed Logs

```bash
# View run summary with job status
gh run view <RUN_ID>

# Get failed step logs (most useful)
gh run view <RUN_ID> --log-failed

# Get full logs for specific job
gh run view <RUN_ID> --job=<JOB_ID> --log
```

### Step 5: Parse Error and Fix

Common error patterns and fixes:

| Error Pattern | Cause | Fix |
|---------------|-------|-----|
| `not configured to run with Edge Runtime` | Missing `runtime = 'edge'` | Add `export const runtime = 'edge';` to page |
| `Cannot find module '@c2/shared'` | Package not built | Run workspace build first |
| `Database connection failed` | Missing secrets | Check GitHub Environment secrets |
| `CORS error` | Domain not whitelisted | Add domain to CORS config |
| `Type error` | TypeScript issue | Fix type errors locally |

### Step 6: Commit Fix and Re-verify

```bash
git add -A
git commit -m "fix: <description of fix>"
git push origin <branch>

# Wait and verify again
sleep 10
gh run list --limit 3
```

---

## Quick Reference Commands

```bash
# List recent runs
gh run list --limit 5

# View specific run
gh run view <RUN_ID>

# Get failed logs only
gh run view <RUN_ID> --log-failed

# Watch run in real-time
gh run watch <RUN_ID>

# Rerun failed jobs
gh run rerun <RUN_ID> --failed

# View workflow file
gh workflow view <WORKFLOW_NAME>

# List all workflows
gh workflow list
```

---

## Standard Agent Checklist

After pushing changes, execute this checklist:

```
□ Wait 5-10 seconds for pipeline to queue
□ Run: gh run list --limit 3
□ Identify the run for your commit (check TITLE column)
□ If STATUS is "queued" or "in_progress", wait or watch
□ If CONCLUSION is "success", proceed
□ If CONCLUSION is "failure":
  □ Run: gh run view <ID> --log-failed
  □ Identify the failing step
  □ Parse error message
  □ Implement fix
  □ Commit and push fix
  □ Re-verify pipeline
□ Report final status to user
```

---

## Example Debugging Session

```bash
# 1. Check status after push
$ gh run list --limit 3
completed  failure  feat(phase3): implement...  Deploy to Cloudflare Development  develop  push  20405602214

# 2. View the failed run
$ gh run view 20405602214
X Deploy Web to Pages in 1m17s (ID 58634867365)
  X Build with @cloudflare/next-on-pages

# 3. Get failure details
$ gh run view 20405602214 --log-failed
⚡️ ERROR: Failed to produce a Cloudflare Pages build
⚡️ The following routes were not configured to run with the Edge Runtime:
⚡️   - /dashboard/[workcenter]
⚡️ Please make sure that all your non-static routes export:
⚡️   export const runtime = 'edge';

# 4. Fix identified - add runtime export
# Edit file, commit, push

# 5. Re-verify
$ gh run list --limit 3
completed  success  fix: add edge runtime...  Deploy to Cloudflare Development  develop  push  20405789123
```

---

## Environment-Specific Notes

### Development (`develop` branch)
- Deploys to: `dev.web.opraxius.com`, `dev.api.opraxius.com`
- Auto-deploys on push
- Uses `staging` GitHub environment secrets

### Staging (`staging` branch)
- Deploys to: `staging.web.opraxius.com`, `staging.api.opraxius.com`
- Auto-deploys on push
- Uses `staging` GitHub environment secrets

### Production (`main` branch)
- Deploys to: `dashboard.opraxius.com`, `api.opraxius.com`
- **Requires manual approval**
- Uses `production` GitHub environment secrets

---

## Common Cloudflare Pages Errors

### 1. Edge Runtime Not Configured

**Error**:
```
The following routes were not configured to run with the Edge Runtime:
  - /some/dynamic/[route]
```

**Fix**: Add to the page file:
```typescript
export const runtime = 'edge';
```

### 2. Node.js APIs Not Available

**Error**:
```
Error: fs is not available in the Edge Runtime
```

**Fix**: Use edge-compatible alternatives or move logic to API routes.

### 3. Package Size Too Large

**Error**:
```
Worker size exceeds the 1MB limit
```

**Fix**: Use dynamic imports, tree-shaking, or move heavy logic to API.

### 4. Build Timeout

**Error**:
```
Build exceeded maximum duration
```

**Fix**: Optimize build, reduce dependencies, use caching.

---

## Integration with Agent Memory

When encountering a CI/CD failure:

1. **Document the error** in conversation
2. **Apply the fix** with clear commit message
3. **Verify the fix** with `gh run list`
4. **Report to user** with:
   - What failed
   - Why it failed
   - How it was fixed
   - Verification that it's now passing

This ensures the user has full visibility into the CI/CD status and any issues encountered.

---

**Last Updated**: December 21, 2025

