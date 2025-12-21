# C2 Command Center - Documentation Index

> **Complete documentation map for the c2-opraxius project**
>
> **Last Updated**: December 21, 2025

---

## Quick Start

| Document | Description |
|----------|-------------|
| [ENVIRONMENTS.md](ENVIRONMENTS.md) | **🔗 ALL URLS** - Complete list of environments, endpoints, and user pages |
| [../CLAUDE_CONTEXT.md](../CLAUDE_CONTEXT.md) | AI assistant context - project status and key references |
| [../README.md](../README.md) | Full project documentation - comprehensive guide |

---

## Architecture & Design

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | System architecture diagrams, deployment architecture, dependency maps |
| [CLOUDFLARE_DEPLOYMENT.md](CLOUDFLARE_DEPLOYMENT.md) | Cloudflare infrastructure setup and deployment guide |
| [ENVIRONMENTS.md](ENVIRONMENTS.md) | All environments, URLs, endpoints, and branch mappings |

---

## Operations & DevOps

| Document | Description |
|----------|-------------|
| [AGENT_CI_CD_WORKFLOW.md](AGENT_CI_CD_WORKFLOW.md) | **NEW** - CI/CD debugging workflow for AI agents |
| [STAGING_SEED_INSTRUCTIONS.md](STAGING_SEED_INSTRUCTIONS.md) | Database seeding procedures for staging environment |
| [GITHUB_CLI_REFERENCE.md](GITHUB_CLI_REFERENCE.md) | GitHub Actions monitoring and CLI commands |

---

## Development Status & Testing

| Document | Description |
|----------|-------------|
| [PHASE3_COMPLETE.md](PHASE3_COMPLETE.md) | **LATEST** - Phase 3 completion (Workcenters & Dashboards) |
| [PHASE2_COMPLETE.md](PHASE2_COMPLETE.md) | Phase 2 status report (3D Map & Interaction) |
| [PHASE2_COMPLETION_CHECKLIST.md](PHASE2_COMPLETION_CHECKLIST.md) | QA testing checklist for Phase 2 features |

---

## Archive

| Document | Description |
|----------|-------------|
| [archive/README.md](archive/README.md) | Archive policy and structure |
| [archive/PHASE1_COMPLETE.md](archive/PHASE1_COMPLETE.md) | Phase 1 completion snapshot (historical reference) |

---

## Documentation Categories

### By Purpose
- **Getting Started**: NEXT_STEPS.md, CLAUDE_CONTEXT.md, README.md
- **Architecture**: ARCHITECTURE.md, CLOUDFLARE_DEPLOYMENT.md
- **Operations**: STAGING_SEED_INSTRUCTIONS.md, GITHUB_CLI_REFERENCE.md
- **Development**: PHASE2_COMPLETE.md, PHASE2_COMPLETION_CHECKLIST.md
- **Historical**: archive/PHASE1_COMPLETE.md

### By Audience
- **Developers**: README.md → NEXT_STEPS.md → ARCHITECTURE.md
- **AI Assistants**: CLAUDE_CONTEXT.md → NEXT_STEPS.md → specific docs
- **DevOps**: CLOUDFLARE_DEPLOYMENT.md, STAGING_SEED_INSTRUCTIONS.md, GITHUB_CLI_REFERENCE.md
- **QA/Testing**: PHASE2_COMPLETION_CHECKLIST.md

---

## Quick Links

### 🔧 Development Environment (Branch: `develop`)
| Service | URL |
|---------|-----|
| Web Dashboard | https://dev.web.opraxius.com |
| API | https://dev.api.opraxius.com |
| Health Check | https://dev.api.opraxius.com/health |

### 🎭 Staging Environment (Branch: `staging`)
| Service | URL |
|---------|-----|
| Web Dashboard | https://staging.web.opraxius.com |
| API | https://staging.api.opraxius.com |
| Health Check | https://staging.api.opraxius.com/health |

### 🚀 Production Environment (Branch: `main`)
| Service | URL |
|---------|-----|
| Web Dashboard | https://dashboard.opraxius.com |
| API | https://api.opraxius.com |
| Health Check | https://api.opraxius.com/health |

### GitHub Resources
- Repository: https://github.com/roger-emerson/c2-opraxius
- Actions: https://github.com/roger-emerson/c2-opraxius/actions

**Workflows:**
- [Deploy Development](../.github/workflows/deploy-development.yml)
- [Deploy Staging](../.github/workflows/deploy-staging.yml)
- [Deploy Production](../.github/workflows/deploy-production.yml)
- [Seed Development](../.github/workflows/seed-development.yml)
- [Seed Staging](../.github/workflows/seed-staging.yml)

---

## Documentation Guidelines

When creating new documentation:

1. **Choose the right location**:
   - Current phase documentation → `docs/`
   - Historical/archived documentation → `docs/archive/`
   - AI assistant context → `CLAUDE_CONTEXT.md`
   - User-facing documentation → `README.md`

2. **Update cross-references**:
   - Add new doc to this INDEX.md
   - Update CLAUDE_CONTEXT.md if relevant for AI assistants
   - Use relative paths for all internal links
   - Run `../scripts/validate-docs.sh` to verify links

3. **Archive when phase completes**:
   - Move phase-specific docs to `archive/`
   - Update all references in active documentation
   - Add archive header to document
   - Update `archive/README.md`

---

**For questions about documentation structure, see [../CLAUDE_CONTEXT.md](../CLAUDE_CONTEXT.md) or [archive/README.md](archive/README.md)**
