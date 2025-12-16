# ESG Command Center - Test Plan

> **Version:** 1.0  
> **Phase:** Phase 1 Testing  
> **Author:** Claude Agent (Debug Mode)  
> **Created:** December 16, 2025  
> **Status:** In Progress

---

## 1. Overview

### 1.1 Project Description

The ESG Command Center is a festival management dashboard for Insomniac Events (EDC Las Vegas, EDC Orlando). It provides:
- Real-time venue monitoring with PostGIS spatial data
- Task management across 8 workcenters
- Role-based access control (RBAC) with 10 roles
- Activity feed and audit logging

### 1.2 Test Plan Objectives

- [x] Define test categories and scope
- [ ] Ensure database schema integrity with PostGIS
- [ ] Validate RBAC permission logic (security-critical)
- [ ] Verify API endpoint behavior and auth
- [ ] Test frontend authentication hooks
- [ ] Achieve 80%+ code coverage on critical paths

### 1.3 Scope

**In Scope (Phase 1):**
- Database schema (7 tables)
- RBAC system (10 roles, 8 workcenters)
- Authentication (Auth0 + NextAuth.js)
- API endpoints (9 routes)
- Frontend hooks (useAuth, RBAC)

**Out of Scope:**
- Phase 2 features (3D map, Three.js)
- Performance/load testing
- Mobile responsiveness
- Accessibility (WCAG)

---

## 2. Test Strategy

### 2.1 Test Levels

| Level | Description | Tools | Coverage Target |
|-------|-------------|-------|-----------------|
| Unit | Individual functions, services, hooks | Vitest | 80% |
| Integration | API + Database, Auth flows | Vitest + Supertest | 70% |
| E2E | Full user journeys | Playwright | Critical paths |

### 2.2 Test Types

- [x] Unit Testing
- [x] Integration Testing
- [ ] E2E Testing
- [ ] Security Testing (RBAC)
- [ ] Regression Testing

### 2.3 Test Tools

```
Runtime:          Vitest 1.x (ESM native, fast)
API Testing:      Supertest
E2E:              Playwright
Mocking:          Vitest built-in
Database:         Test containers / In-memory
Coverage:         @vitest/coverage-v8
```

---

## 3. Test Categories

### 3.1 Database & Schema Tests (Priority: High)

**Scope:** 7 tables, PostGIS geometry, Drizzle ORM

| ID | Test Case | Description | Status |
|----|-----------|-------------|--------|
| DB-001 | Events table CRUD | Create, read, update, delete events | Pending |
| DB-002 | Events PostGIS geometry | Venue boundary geometry storage | Pending |
| DB-003 | Users table CRUD | User creation with roles array | Pending |
| DB-004 | Users permissions JSONB | JSONB permission storage/retrieval | Pending |
| DB-005 | Venue features PostGIS | Point, Polygon, LineString storage | Pending |
| DB-006 | Venue feature types | 17 feature types validation | Pending |
| DB-007 | Tasks CRUD | Task creation with dependencies | Pending |
| DB-008 | Tasks workcenter FK | Workcenter assignment integrity | Pending |
| DB-009 | Workcenters CRUD | 8 workcenters with completion % | Pending |
| DB-010 | Activity feed logging | Activity creation and filtering | Pending |
| DB-011 | AI chat history | Conversation storage with RBAC context | Pending |
| DB-012 | PostGIS spatial queries | ST_Contains, ST_Distance, ST_Within | Pending |
| DB-013 | Index performance | Verify indexes on foreign keys | Pending |
| DB-014 | Cascade deletes | Event deletion cascades | Pending |
| DB-015 | Constraint validation | NOT NULL, unique constraints | Pending |

**Test File:** `tests/unit/database/schema.test.ts`

---

### 3.2 RBAC System Tests (Priority: CRITICAL)

**Scope:** 10 roles, 8 workcenters, permission matrix

| ID | Test Case | Description | Status |
|----|-----------|-------------|--------|
| RBAC-001 | Admin full access | Admin can access all resources | Pending |
| RBAC-002 | Viewer read-only | Viewer cannot create/update/delete | Pending |
| RBAC-003 | Operations lead scope | Only operations workcenter access | Pending |
| RBAC-004 | Production lead scope | Only production workcenter access | Pending |
| RBAC-005 | Security lead scope | Only security workcenter access | Pending |
| RBAC-006 | Workforce lead scope | Only workforce workcenter access | Pending |
| RBAC-007 | Vendor lead scope | Only vendors workcenter access | Pending |
| RBAC-008 | Sponsor lead scope | Only sponsors workcenter access | Pending |
| RBAC-009 | Marketing lead scope | Only marketing workcenter access | Pending |
| RBAC-010 | Finance lead scope | Only finance workcenter access | Pending |
| RBAC-011 | Cross-workcenter deny | Lead cannot access other workcenters | Pending |
| RBAC-012 | Permission inheritance | Role inherits base permissions | Pending |
| RBAC-013 | Task filtering by role | Tasks filtered by user's workcenter | Pending |
| RBAC-014 | Venue filtering by role | Venues filtered by user's workcenter | Pending |
| RBAC-015 | hasPermission utility | Permission check function | Pending |
| RBAC-016 | canAccessWorkcenter | Workcenter access validation | Pending |
| RBAC-017 | Multiple workcenters | User with multiple workcenter access | Pending |
| RBAC-018 | Permission escalation | Cannot grant higher permissions | Pending |
| RBAC-019 | Role assignment | Only admin can assign roles | Pending |
| RBAC-020 | Audit logging | Permission checks are logged | Pending |

**Test File:** `tests/unit/rbac/permissions.test.ts`

---

### 3.3 Authentication Tests (Priority: High)

**Scope:** Auth0, NextAuth.js, JWT handling

| ID | Test Case | Description | Status |
|----|-----------|-------------|--------|
| AUTH-001 | Auth0 callback | OAuth callback handling | Pending |
| AUTH-002 | JWT generation | Token creation with claims | Pending |
| AUTH-003 | JWT validation | Token signature verification | Pending |
| AUTH-004 | JWT expiration | Expired token rejection | Pending |
| AUTH-005 | Session creation | NextAuth session from token | Pending |
| AUTH-006 | Session refresh | Token refresh flow | Pending |
| AUTH-007 | Logout flow | Session destruction | Pending |
| AUTH-008 | Auth middleware | Protected route enforcement | Pending |
| AUTH-009 | Mock user fallback | Dev mode without Auth0 | Pending |
| AUTH-010 | User sync | Auth0 user → DB user sync | Pending |

**Test File:** `tests/integration/auth/auth-flow.test.ts`

---

### 3.4 API Endpoint Tests (Priority: High)

**Scope:** 9 endpoints, request/response validation

| ID | Test Case | Description | Status |
|----|-----------|-------------|--------|
| API-001 | GET /health | Health check returns 200 | Pending |
| API-002 | GET /api/events | List all events | Pending |
| API-003 | GET /api/events/:id | Get single event | Pending |
| API-004 | POST /api/events | Create event (admin only) | Pending |
| API-005 | GET /api/events/:id 404 | Non-existent event | Pending |
| API-006 | GET /api/tasks | List tasks (RBAC filtered) | Pending |
| API-007 | GET /api/tasks/:id | Get single task | Pending |
| API-008 | POST /api/tasks | Create task (workcenter perm) | Pending |
| API-009 | PATCH /api/tasks/:id | Update task (workcenter perm) | Pending |
| API-010 | GET /api/venues | List venues (RBAC filtered) | Pending |
| API-011 | GET /api/venues/:id | Get single venue | Pending |
| API-012 | POST /api/venues | Create venue feature | Pending |
| API-013 | Unauthorized access | 401 without token | Pending |
| API-014 | Forbidden access | 403 without permission | Pending |
| API-015 | Invalid payload | 400 validation errors | Pending |

**Test File:** `tests/integration/api/endpoints.test.ts`

---

### 3.5 API + RBAC Integration Tests (Priority: CRITICAL)

**Scope:** Filtered responses by role/workcenter

| ID | Test Case | Description | Status |
|----|-----------|-------------|--------|
| INT-001 | Admin sees all tasks | No filtering for admin | Pending |
| INT-002 | Ops lead sees ops tasks | Filtered to operations | Pending |
| INT-003 | Viewer sees all (read) | Read access, no mutations | Pending |
| INT-004 | Cross-workcenter task deny | Cannot update other's task | Pending |
| INT-005 | Admin venue full access | All venue features | Pending |
| INT-006 | Security sees security | Security workcenter venues | Pending |
| INT-007 | Task create workcenter | Auto-assign user's workcenter | Pending |
| INT-008 | Task update permissions | Own workcenter only | Pending |
| INT-009 | Venue create permissions | Feature type permissions | Pending |
| INT-010 | Activity feed filtering | Feed filtered by workcenter | Pending |

**Test File:** `tests/integration/api/rbac-integration.test.ts`

---

### 3.6 Frontend Hook Tests (Priority: Medium)

**Scope:** useAuth, RBAC hooks, providers

| ID | Test Case | Description | Status |
|----|-----------|-------------|--------|
| FE-001 | useAuth returns user | Authenticated user data | Pending |
| FE-002 | useAuth loading state | Loading during auth check | Pending |
| FE-003 | useAuth unauthenticated | Null user when logged out | Pending |
| FE-004 | usePermissions hook | Check user permissions | Pending |
| FE-005 | useWorkcenter hook | Current workcenter context | Pending |
| FE-006 | AuthProvider setup | Context provider mounting | Pending |
| FE-007 | Protected component | Renders only when authed | Pending |
| FE-008 | Role-based render | Conditional by role | Pending |

**Test File:** `tests/unit/hooks/auth-hooks.test.ts`

---

## 4. Test Environment

### 4.1 Infrastructure

- [x] Local development (Docker Compose)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Test database (isolated PostgreSQL)
- [ ] Mock Auth0 (for unit tests)

### 4.2 Test Database Setup

```bash
# Start test database
docker compose -f docker-compose.test.yml up -d

# Run migrations
npm run db:migrate:test

# Seed test data
npm run db:seed:test
```

### 4.3 Test Data Requirements

- 2 events (EDC Vegas, EDC Orlando)
- 10 users (1 per role)
- 8 workcenters
- 20 venue features (mixed types)
- 30 tasks (across workcenters)

---

## 5. Test Execution

### 5.1 Commands

```bash
# Run all tests
npm run test

# Run specific category
npm run test:db        # Database tests
npm run test:rbac      # RBAC tests
npm run test:api       # API tests
npm run test:e2e       # E2E tests

# With coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### 5.2 CI/CD Integration

```yaml
# .github/workflows/test.yml
- name: Run Tests
  run: npm run test:coverage
  
- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

---

## 6. Exit Criteria

- [ ] All critical tests passing (RBAC, Auth)
- [ ] Code coverage ≥ 80% on critical paths
- [ ] No P0/P1 bugs open
- [ ] API contract tests passing
- [ ] Security tests passing (permission escalation)

---

## 7. Test File Index

| File | Category | Tests |
|------|----------|-------|
| `tests/unit/database/schema.test.ts` | Database | 15 |
| `tests/unit/rbac/permissions.test.ts` | RBAC | 20 |
| `tests/unit/hooks/auth-hooks.test.ts` | Frontend | 8 |
| `tests/integration/auth/auth-flow.test.ts` | Auth | 10 |
| `tests/integration/api/endpoints.test.ts` | API | 15 |
| `tests/integration/api/rbac-integration.test.ts` | RBAC+API | 10 |
| `tests/fixtures/test-data.ts` | Fixtures | - |
| `tests/setup/vitest.config.ts` | Config | - |

**Total: ~78 test cases defined** (more to be added in execution)

---

## Appendix A: Role-Permission Matrix

| Role | tasks:read | tasks:write | venues:read | venues:write | events:* | users:* |
|------|------------|-------------|-------------|--------------|----------|---------|
| admin | ✅ all | ✅ all | ✅ all | ✅ all | ✅ | ✅ |
| ops_lead | ✅ ops | ✅ ops | ✅ ops | ✅ ops | ❌ | ❌ |
| prod_lead | ✅ prod | ✅ prod | ✅ prod | ✅ prod | ❌ | ❌ |
| security_lead | ✅ sec | ✅ sec | ✅ sec | ✅ sec | ❌ | ❌ |
| viewer | ✅ all | ❌ | ✅ all | ❌ | ❌ | ❌ |

---

## Appendix B: Debug Session Reference

See `.debug/` folder for agent reasoning chain:
- `.debug/reasoning.md` - Decision log
- `.debug/actions.log` - Action history
- `.debug/checkpoints.md` - Progress snapshots


