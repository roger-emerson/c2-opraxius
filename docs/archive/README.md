# Documentation Archive

> **This directory contains historical documentation from completed project phases.**

---

## Archive Policy

When a phase is completed and the project moves to the next phase:

1. **Move phase-specific documentation to this archive**
   - Documents that are no longer actively maintained
   - Historical snapshots of completed phases
   - Reference material for past decisions

2. **Update all references in active documentation**
   - Update links in CLAUDE_CONTEXT.md
   - Update links in README.md
   - Update links in docs/INDEX.md
   - Run validation script to verify

3. **Add archive metadata to document header**
   - Archive date
   - Phase completion status
   - Link to current phase documentation

---

## Current Archives

### Phase 1 (Complete - December 18, 2025)

| Document | Description |
|----------|-------------|
| [PHASE1_COMPLETE.md](PHASE1_COMPLETE.md) | Phase 1 completion snapshot - Infrastructure, Auth, RBAC, API |

**Phase 1 Summary:**
- ✅ Turborepo monorepo setup
- ✅ PostgreSQL + PostGIS + Redis
- ✅ Drizzle ORM schema (7 tables)
- ✅ Auth0 + NextAuth.js authentication
- ✅ RBAC middleware and hooks
- ✅ REST API (events, tasks, venues)

---

## Future Archives

### Phase 2 (In Progress → To Be Archived When Phase 3 Begins)

Phase 2 documentation will be archived here when Phase 3 begins:

**Planned Archive Structure:**
```
archive/
├── README.md (this file)
├── PHASE1_COMPLETE.md (current)
└── phase2/
    ├── PHASE2_COMPLETE.md
    ├── PHASE2_COMPLETION_CHECKLIST.md
    └── STAGING_SEED_INSTRUCTIONS.md (may remain active)
```

**Documents to Archive:**
- `PHASE2_COMPLETE.md` → Status report for Phase 2 (3D map & interaction)
- `PHASE2_COMPLETION_CHECKLIST.md` → QA testing checklist
- `STAGING_SEED_INSTRUCTIONS.md` → May remain active if still relevant

### Phase 3+ (Future)

Phase 3+ documentation will follow the same archival pattern:

```
archive/
├── README.md
├── PHASE1_COMPLETE.md
├── phase2/
│   └── [Phase 2 docs]
├── phase3/
│   └── [Phase 3 docs]
└── phase4/
    └── [Phase 4 docs]
```

---

## Archive Guidelines

### When to Archive

Archive documentation when:
- ✅ Phase is marked as complete
- ✅ Next phase has begun
- ✅ Document is no longer actively maintained
- ✅ Document serves only as historical reference

### When NOT to Archive

Keep documentation active if:
- ❌ Still used for current development
- ❌ Contains procedures still in use (e.g., deployment guides)
- ❌ Referenced by current phase work
- ❌ Architecture documentation (unless superseded)

### How to Archive

```bash
# 1. Move document to appropriate archive subdirectory
mv docs/PHASE2_COMPLETE.md docs/archive/phase2/PHASE2_COMPLETE.md

# 2. Add archive header to document
# Add at top:
# > **ARCHIVED**: This document describes Phase 2 (completed DATE)
# > **Current Phase**: See ../PHASEX_COMPLETE.md (link to current phase doc)

# 3. Update all references
# - Update CLAUDE_CONTEXT.md
# - Update docs/INDEX.md
# - Update any cross-references

# 4. Run validation
./scripts/validate-docs.sh

# 5. Update this README.md
# - Add to "Current Archives" section
# - Update archive structure diagram
```

---

## Accessing Archived Documentation

**From docs/INDEX.md:**
- All archived documents are listed under the "Archive" section
- Links point to this archive directory

**From CLAUDE_CONTEXT.md:**
- Archived documents listed in "Documentation Index" table
- Marked with "(Archive)" or "(Historical)" label

**From Search:**
- All markdown files including archives are searchable
- Use file path to identify archived vs. active docs

---

## Version History

| Date | Change | Phase |
|------|--------|-------|
| 2025-12-20 | Created archive structure and README | Phase 2 |
| 2025-12-20 | Archived PHASE1_COMPLETE.md | Phase 1 |
| TBD | Archive Phase 2 documentation | Phase 2 |

---

**For active documentation, see [../INDEX.md](../INDEX.md)**
