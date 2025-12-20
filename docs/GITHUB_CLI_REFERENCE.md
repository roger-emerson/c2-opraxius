# GitHub CLI Reference for C2 Command Center

This document provides reference commands for monitoring GitHub Actions deployments using the GitHub CLI (`gh`).

## Prerequisites

Install GitHub CLI:
```bash
# macOS
brew install gh

# Windows
winget install --id GitHub.cli

# Linux
# See https://github.com/cli/cli/blob/trunk/docs/install_linux.md
```

Authenticate:
```bash
gh auth login
```

## Monitoring Deployments

### List Recent Workflow Runs

```bash
# List last 5 runs for staging deployment workflow
gh run list --workflow="Deploy to Cloudflare Staging" --limit 5

# List last 5 runs for production deployment workflow
gh run list --workflow="Deploy to Cloudflare Production" --limit 5

# List all recent runs across all workflows
gh run list --limit 10
```

**Output format:**
```
STATUS      TITLE                               WORKFLOW                        BRANCH   EVENT  ID            ELAPSED  AGE
✓ completed Fix health check                    Deploy to Cloudflare Staging    staging  push   20390539423   4m22s    2m ago
X failed    Previous deployment                 Deploy to Cloudflare Staging    staging  push   20390231685   3m34s    30m ago
```

### Watch a Deployment in Real-Time

```bash
# Watch a specific run by ID (from gh run list)
gh run watch 20390539423

# Watch the latest run for a workflow
gh run watch $(gh run list --workflow="Deploy to Cloudflare Staging" --limit 1 --json databaseId --jq '.[0].databaseId')
```

**What you'll see:**
- Real-time job status updates
- Individual step progress
- Check marks (✓) for completed steps
- Asterisks (*) for in-progress steps
- Updates every 3 seconds
- Press `Ctrl+C` to stop watching (won't cancel the run)

### View Detailed Run Information

```bash
# View run summary
gh run view 20390539423

# View full logs
gh run view 20390539423 --log

# View logs for specific job
gh run view 20390539423 --job=58599051013 --log

# Save logs to file
gh run view 20390539423 --log > deployment-logs.txt
```

### Search Logs for Specific Output

```bash
# Check if health check passed
gh run view 20390539423 --log | grep -A 5 "Check API health"

# Find error messages
gh run view 20390539423 --log | grep -i error

# Check deployment URL
gh run view 20390539423 --log | grep "Deployment complete"

# View specific step output
gh run view 20390539423 --log | grep -A 10 "Deploy to Cloudflare Workers"
```

### Check Run Status Programmatically

```bash
# Get run status in JSON format
gh run view 20390539423 --json status,conclusion,startedAt,updatedAt

# Check if run succeeded
gh run view 20390539423 --json conclusion --jq '.conclusion == "success"'

# Get run duration
gh run view 20390539423 --json startedAt,updatedAt --jq '(.updatedAt | fromdateiso8601) - (.startedAt | fromdateiso8601)'
```

## Common Workflow Patterns

### Wait for Deployment to Complete

```bash
# Trigger deployment and wait for completion
git push origin staging && \
  gh run watch $(gh run list --workflow="Deploy to Cloudflare Staging" --limit 1 --json databaseId --jq '.[0].databaseId')
```

### Check Latest Deployment Status

```bash
# Quick status check
gh run list --workflow="Deploy to Cloudflare Staging" --limit 1

# Detailed status with logs
gh run view --log $(gh run list --workflow="Deploy to Cloudflare Staging" --limit 1 --json databaseId --jq '.[0].databaseId')
```

### Re-run Failed Deployment

```bash
# Re-run the latest failed run
gh run rerun $(gh run list --workflow="Deploy to Cloudflare Staging" --status=failure --limit 1 --json databaseId --jq '.[0].databaseId')

# Re-run only failed jobs
gh run rerun <run-id> --failed
```

### Cancel Running Deployment

```bash
# Cancel specific run
gh run cancel 20390539423

# Cancel latest run
gh run cancel $(gh run list --workflow="Deploy to Cloudflare Staging" --limit 1 --json databaseId --jq '.[0].databaseId')
```

## Debugging Failed Deployments

### Step 1: Identify Failure

```bash
# List failed runs
gh run list --workflow="Deploy to Cloudflare Staging" --status=failure --limit 5

# Get failure details
gh run view <run-id>
```

### Step 2: Examine Logs

```bash
# View full logs
gh run view <run-id> --log

# Search for error
gh run view <run-id> --log | grep -i "error\|fail\|403\|404\|500"

# Check specific job logs
gh run view <run-id> --log | grep -A 20 "Verify Deployment"
```

### Step 3: Check Job-Specific Output

```bash
# List all jobs in the run
gh run view <run-id> --json jobs --jq '.jobs[] | {name, conclusion, steps: [.steps[] | {name, conclusion}]}'

# View specific job logs
gh run view <run-id> --job=<job-id> --log
```

## C2 Command Center Specific Examples

### Verify Health Endpoints After Deployment

```bash
# Wait for deployment and check health
gh run watch <run-id> && \
  curl -I https://api.staging.opraxius.com/health && \
  curl -I https://staging.opraxius.com
```

### Monitor Both Staging and Production

```bash
# Check both environments
echo "=== STAGING ===" && \
  gh run list --workflow="Deploy to Cloudflare Staging" --limit 1 && \
echo "=== PRODUCTION ===" && \
  gh run list --workflow="Deploy to Cloudflare Production" --limit 1
```

### Deployment Verification Checklist

```bash
# 1. Check deployment status
gh run view <run-id> --json conclusion --jq '.conclusion'

# 2. Verify health endpoints
curl -f https://api.staging.opraxius.com/health
curl -f https://staging.opraxius.com

# 3. Check logs for errors
gh run view <run-id> --log | grep -i error || echo "No errors found"

# 4. Verify custom domains (not *.pages.dev or *.workers.dev)
# Should return 404
curl -I https://c2-web-staging.pages.dev || echo "Correctly blocked"
```

## Useful Aliases

Add these to your `~/.zshrc` or `~/.bashrc`:

```bash
# Quick deployment status
alias deploy-status='gh run list --limit 5'

# Watch latest staging deployment
alias deploy-watch-staging='gh run watch $(gh run list --workflow="Deploy to Cloudflare Staging" --limit 1 --json databaseId --jq ".[0].databaseId")'

# Watch latest production deployment
alias deploy-watch-prod='gh run watch $(gh run list --workflow="Deploy to Cloudflare Production" --limit 1 --json databaseId --jq ".[0].databaseId")'

# Check health endpoints
alias health-check='echo "API:" && curl -f https://api.staging.opraxius.com/health && echo "\nWeb:" && curl -f https://staging.opraxius.com'
```

## Troubleshooting

### "gh: command not found"

Install GitHub CLI:
```bash
brew install gh  # macOS
```

### "You are not logged into any GitHub hosts"

Authenticate:
```bash
gh auth login
```

### "Resource not accessible by integration"

Ensure you have access to the repository:
```bash
gh auth refresh -h github.com -s repo,workflow
```

### Rate Limiting

GitHub CLI uses the same rate limits as the API:
- Authenticated: 5,000 requests/hour
- If you hit limits, wait or use `--limit` to reduce calls

## Additional Resources

- [GitHub CLI Manual](https://cli.github.com/manual/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub CLI Workflow Commands](https://cli.github.com/manual/gh_run)

## C2 Command Center Workflows

Our GitHub Actions workflows:

1. **Deploy to Cloudflare Staging** (`.github/workflows/deploy-staging.yml`)
   - Trigger: Push to `staging` branch
   - Jobs: migrate-db → deploy-api → deploy-web → verify-deployment
   - Environments: Staging (no approval required)

2. **Deploy to Cloudflare Production** (`.github/workflows/deploy-production.yml`)
   - Trigger: Push to `main` branch with tag
   - Jobs: migrate-db → deploy-api → deploy-web → verify-deployment
   - Environments: Production (requires manual approval)

---

**Last Updated**: December 20, 2025
**Maintained by**: C2 Command Center Team
