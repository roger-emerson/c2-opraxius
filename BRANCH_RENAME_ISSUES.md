# Issues to Address: Renaming `develop` Branch to `development`

This document identifies all locations that need to be updated if the `develop` branch is renamed to `development`.

## Critical Changes Required

### 1. GitHub Actions Workflows

#### `.github/workflows/deploy-development.yml`
- **Line 5**: `branches: [develop]` → `branches: [development]`
- **Impact**: Workflow will not trigger on pushes to renamed branch

#### `.github/workflows/validate-docs.yml`
- **Line 9**: `branches: [main, staging, develop]` → `branches: [main, staging, development]`
- **Impact**: Documentation validation won't run on pushes to renamed branch

### 2. Documentation Files

#### `README.md`
- **Line 295**: "The `develop` branch automatically deploys..."
- **Line 301**: "Simply push to the `develop` branch..."
- **Line 304**: `git checkout develop`
- **Line 307**: `git push origin develop  # Triggers automatic deployment`
- **Line 755**: `**Branch:** `develop``
- **Line 756**: `**Auto-deploys on:** Push to `develop` branch`
- **Line 763**: `git checkout develop`
- **Line 766**: `git push origin develop  # Triggers GitHub Actions`
- **Line 804**: `git merge develop`
- **Impact**: Documentation will be incorrect and confusing for developers

#### `CLAUDE_CONTEXT.md`
- **Line 89**: `develop  → Auto-deploys to Cloudflare development`
- **Line 98**: `git checkout develop`
- **Line 101**: `git push origin develop  # Triggers GitHub Actions`
- **Line 107**: `git merge develop`
- **Impact**: AI assistants will have incorrect context

#### `docs/CLOUDFLARE_DEPLOYMENT.md`
- **Line 130**: `c2-web-development`: Production branch = `develop`
- **Line 269**: "Deploys `develop` branch"
- **Line 395**: `**Branch**: `develop``
- **Line 399**: `**Auto-deploys on**: Push to `develop` branch`
- **Line 412**: "Set production branch: `develop`"
- **Line 427**: "Automatic on push to `develop` branch"
- **Impact**: Deployment documentation will be incorrect

#### `docs/ARCHITECTURE.md`
- **Line 92**: Branch diagram shows `│   develop   │`
- **Line 93**: `│  (local)    │` (note: this comment should also be updated)
- **Impact**: Architecture diagram will be outdated

#### `docs/INDEX.md`
- **Line 84**: References deploy-development.yml (workflow name stays the same, but description mentions develop branch)
- **Impact**: Minor, but should be checked for consistency

### 3. Cloudflare Infrastructure (Manual Configuration)

#### Cloudflare Pages Project: `c2-web-development`
- **Production Branch Setting**: Currently set to `develop` in Cloudflare Dashboard
- **Action Required**: Update to `development` in:
  - Workers & Pages → c2-web-development → Settings → Builds & deployments → Production branch
- **Impact**: Pages deployments will fail or deploy to wrong branch if not updated

### 4. Git Branch Protection Rules (if configured)

If branch protection rules exist in GitHub:
- **Location**: Repository Settings → Branches → Branch protection rules
- **Action Required**: Update any rules protecting `develop` branch to protect `development` instead
- **Impact**: Branch protection may not apply correctly after rename

## Summary of Changes Needed

### Code Changes (6 files)
1. `.github/workflows/deploy-development.yml` - 1 change
2. `.github/workflows/validate-docs.yml` - 1 change
3. `README.md` - 9 changes
4. `CLAUDE_CONTEXT.md` - 4 changes
5. `docs/CLOUDFLARE_DEPLOYMENT.md` - 6 changes
6. `docs/ARCHITECTURE.md` - 2 changes

**Total**: ~23 occurrences across 6 files

### Infrastructure Changes (Manual)
1. Cloudflare Pages production branch setting
2. GitHub branch protection rules (if any)

## Recommended Migration Steps

1. **Update all code/documentation first** (commit to current `develop` branch)
2. **Rename branch in Git**:
   ```bash
   git checkout develop
   git branch -m development
   git push origin development
   git push origin --delete develop
   ```
3. **Update Cloudflare Pages production branch setting**
4. **Verify GitHub Actions workflows trigger correctly**
5. **Update any local clones**:
   ```bash
   git fetch origin
   git branch -u origin/development development
   ```

## Notes

- The workflow file name `deploy-development.yml` is already correct and does not need changing
- Wrangler config files (`wrangler.development.toml`) do not reference branch names
- Scripts in `scripts/` directory do not reference branch names
- Makefile does not reference branch names

