# MuseRock: Next Actions & Gap Analysis

> **Last Updated**: 2026-05-11
> **Status**: Active — Team Action Document
> **Purpose**: Bridge the gap between what the roadmap planned, what the codebase actually has, and what the team must do next.

---

## Executive Summary

The codebase has solid architectural scaffolding but is mostly in **skeleton + mock** state. The roadmap (`IMPLEMENTATION_ROADMAP.md`) marks everything as "Pending" while significant backend scaffolding already exists. This document provides a reality-grounded status and prioritized action items.

**Key finding**: ~60% of planned modules have scaffold code, but only ~15% are production-ready. The three most critical gaps are:

1. **API keys still stored in frontend localStorage** (P1 security requirement not met)
2. **5-layer memory is pure in-memory Map** (data lost on restart)
3. **Frontend AI providers OpenAI/Anthropic are stubs** (users get placeholder text)

---

## Current Status vs. Roadmap

| Phase | Roadmap Target | Code Reality | Completion | Blocker |
|-------|---------------|-------------|-----------|---------|
| **P0** | Repo reviewable | README ✅, docs ✅, CI ❌, .env.example ❌ | 70% | Missing CI & env config |
| **P1** | Security + BFF | NestJS scaffold ✅, OAuth PKCE ✅, **API keys in localStorage ❌** | 55% | Security arch incomplete |
| **P2** | Memory engine | 5-layer code ✅, **all in-memory Map ❌**, no pgvector | 35% | No database |
| **P3** | Apprentice + MCP | MCP Gateway ✅, Apprentice scaffold ✅, **no Temporal ❌**, UI missing | 30% | No workflow engine |
| **P4** | Compliance + Observability | Prometheus metrics ✅, **OWASP checks all mock ❌** | 20% | Mock compliance |

---

## P0 Blockers (Do First, 1 Week)

These prevent anyone from contributing or running the project reliably.

### P0-1: Create `.env.example`

**Problem**: No `.env.example` exists. Contributors cannot know which environment variables are required.

**Action**:
```
# apps/api/.env.example
DATABASE_URL=postgresql://user:pass@localhost:5432/muserock
REDIS_URL=redis://localhost:6379
OASIS_CLIENT_ID=
OASIS_CLIENT_SECRET=
OASIS_REDIRECT_URI=http://localhost:3001/auth/callback
FIREBASE_PROJECT_ID=
KMS_KEY_ID=

# apps/web/.env.example
VITE_API_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
```

**Assignee**: Full-stack dev | **Estimate**: 1 hour

---

### P0-2: GitHub Actions CI Pipeline

**Problem**: No CI/CD. PRs can break the build unnoticed.

**Action**: Create `.github/workflows/ci.yml`:
- `lint` — ESLint + Prettier check
- `typecheck` — `tsc --noEmit` for both apps
- `build` — `npm run build` for both apps
- `test` — Vitest unit tests (once they exist)

**Assignee**: DevOps | **Estimate**: 4 hours

---

### P0-3: Fix Hardcoded `localhost:3001`

**Problem**: Frontend API calls use `http://localhost:3001` hardcoded in multiple files. Breaks in any other environment.

**Files affected**: `apps/web/src/services/*.ts`, `apps/web/src/App.tsx`

**Action**: Replace all hardcoded URLs with `import.meta.env.VITE_API_URL || 'http://localhost:3001'`

**Assignee**: Frontend dev | **Estimate**: 2 hours

---

## P1 Critical (Security, 2-3 Weeks)

These are security requirements that the roadmap explicitly promised but are not met.

### P1-1: Migrate API Keys Out of Frontend

**Problem** (CRITICAL):
```typescript
// App.tsx line ~140 — API keys stored in localStorage
localStorage.setItem('muserock_state', JSON.stringify(state));
// state contains: apiKeys: { gemini, openai, anthropic }
```

**Action**:
1. Create `POST /api/keys` endpoint in NestJS — stores encrypted keys server-side
2. Implement KMS envelope encryption (or use AWS KMS / GCP KMS)
3. Frontend sends key once → server stores encrypted → returns session-based access
4. Remove all `apiKeys` from frontend state and localStorage
5. AI generation requests go through BFF, which injects the key server-side

**Acceptance criteria**:
- [ ] Zero API keys in localStorage or any client-side storage
- [ ] Keys encrypted at rest with envelope encryption
- [ ] All AI requests proxied through BFF
- [ ] Key rotation endpoint available

**Assignee**: Backend dev (encryption) + Frontend dev (migration) | **Estimate**: 5 days

---

### P1-2: Implement Anthropic Model Adapter

**Problem**: Frontend UI offers Anthropic as a provider, but backend `adapters/` only has `openai/` and `gemini/`. Frontend returns stub text for Anthropic.

**Action**:
1. Create `apps/api/src/ai/adapters/anthropic.adapter.ts` following the existing adapter pattern
2. Implement Claude API integration with structured output support
3. Register in `ModelAdapterFactory`
4. Update frontend to use BFF proxy instead of direct call

**Assignee**: Backend dev | **Estimate**: 3 days

---

### P1-3: Fix `listJobs` Query Bug

**Problem**: In `apprentice.service.ts`, when both `apprenticeId` and `status` filters are provided, the second `.where()` call overwrites the first instead of combining with AND.

**Current (broken)**:
```typescript
query = query.where('job.apprenticeId = :apprenticeId', { apprenticeId });
query = query.where('job.status = :status', { status }); // OVERWRITES above!
```

**Fix**: Use `.andWhere()` for the second condition, or use a single `.where()` with combined parameters.

**Assignee**: Backend dev | **Estimate**: 30 minutes

---

## P2 Core (Memory Engine, 4-6 Weeks)

The memory system is the heart of MuseRock. Currently it's a placebo.

### P2-1: PostgreSQL + pgvector Integration

**Problem**: All 5 memory layers use `Map<string, MemoryItem>`. Data is lost on server restart.

**Action**:
1. Provision PostgreSQL 15+ with pgvector extension
2. Create TypeORM entities for each memory layer
3. Write migration scripts (see `Storage_Optimization_Plan.md` schema)
4. Replace in-memory Maps with repository-based storage
5. Add embedding generation for semantic search
6. Implement vector similarity search API

**Priority order for layer migration**:
1. Working Memory (most critical, current session data)
2. Episodic Memory (project/world data)
3. Knowledge Memory (research assets)
4. Contextual Memory (decision history)
5. Compliance Memory (ACL + sensitivity)

**Assignee**: Backend dev | **Estimate**: 10 days

---

### P2-2: Redis Caching Layer

**Problem**: No caching. Every memory lookup is a full scan of in-memory Map (which becomes a DB query after P2-1).

**Action**:
1. Add `ioredis` dependency
2. Implement cache-aside pattern for hot memory items
3. Use Redis for session storage and rate limiting counters
4. Configure TTL matching memory layer semantics

**Assignee**: Backend dev | **Estimate**: 3 days

---

### P2-3: Build InspirationMap UI

**Problem**: `InspirationMap.tsx` does not exist. This is the signature visual feature of MuseRock.

**Action**: See `DETAILED_TASK_BREAKDOWN.md` P2-07 for full spec.
- D3.js force-directed cluster layout
- Inspiration card components
- Zoom/pan interactions
- Save/favorite functionality

**Depends on**: P2-1 (needs real memory data to visualize)

**Assignee**: Frontend dev | **Estimate**: 5 days

---

## P3 Features (Apprentice + MCP, 4-6 Weeks)

### P3-1: Replace `while(true)` Job Polling

**Problem**: `apprentice.service.ts` uses `while(true)` with 100ms `setTimeout` for job processing. This:
- Wastes CPU cycles when idle
- Cannot scale across instances
- Has no backpressure mechanism

**Action**: Replace with BullMQ (Redis-based) or Temporal:
1. Install BullMQ + Redis connection
2. Create named queues: `apprentice-critical`, `apprentice-standard`, `apprentice-background`
3. Replace `processJobs()` with BullMQ event-driven workers
4. Add job priority, retry, and dead-letter queue support

**Quick win**: BullMQ is faster to implement than Temporal and works with the existing Redis dependency (from P2-2). Temporal can be evaluated later for complex workflows.

**Assignee**: Backend dev | **Estimate**: 4 days

---

### P3-2: Build MotivationGarden UI

**Problem**: `MotivationGarden.tsx` does not exist. Second signature feature.

**Action**: See `DETAILED_TASK_BREAKDOWN.md` P3-05 for full spec.
- Audio recorder component
- Piano roll visualization
- Variation tree display
- MIDI export

**Assignee**: Frontend dev + Audio/ML engineer | **Estimate**: 5 days

---

### P3-3: Build Counterfactual Style Switcher UI

**Problem**: Not implemented. Third signature feature.

**Action**: See `DETAILED_TASK_BREAKDOWN.md` P3-06 for spec.
- Attribute slider controls (tempo, energy, density, brightness, novelty)
- A/B comparison view
- Style preset management

**Assignee**: Frontend dev | **Estimate**: 5 days

---

## P4 Hardening (Compliance + Observability, 4-6 Weeks)

### P4-1: Replace Mock OWASP Checks

**Problem**: `ComplianceService` has 11 OWASP check items that all hardcode `status: 'pass'`. This gives a false sense of security.

**Current (broken)**:
```typescript
{ id: 'owasp-1', name: 'Injection', status: 'pass' } // Always passes!
```

**Action**:
1. Integrate `zaproxy` or `owasp-zap` for automated scanning
2. Implement actual input validation checks (SQL injection, XSS, SSRF)
3. Add `helmet` middleware for security headers
4. Create CI step that fails build on OWASP failures
5. Generate compliance report from real scan results

**Assignee**: Backend dev + DevOps | **Estimate**: 5 days

---

### P4-2: Dark Theme Implementation

**Problem**: Zustand store has a `theme` field, but `App.tsx` never uses it. No dark mode exists.

**Action**:
1. Extend Tailwind config with dark mode colors
2. Add `dark` class toggle based on store value
3. Implement theme switcher component
4. Persist preference to user profile (after auth)

**Assignee**: Frontend dev | **Estimate**: 2 days

---

### P4-3: OpenTelemetry Integration

**Problem**: Prometheus metrics exist, but no distributed tracing. Cannot debug cross-service latency.

**Action**: Add `@opentelemetry/api` + `@opentelemetry/sdk-node` to NestJS. Configure trace export to Jaeger or Grafana Tempo.

**Assignee**: DevOps | **Estimate**: 3 days

---

## Code Quality Quick Fixes

These are small but impactful improvements that any team member can pick up.

| ID | Issue | Fix | Effort |
|----|-------|-----|--------|
| QF-1 | `generateId()` uses `Date.now().toString(36) + random` — collision risk at high concurrency | Replace with `uuid.v4()` | 30 min |
| QF-2 | Memory search uses `String.includes()` for scoring — no semantic understanding | Will be fixed by P2-1 vector search, but add TODO comment now | 5 min |
| QF-3 | No unit tests anywhere | Add Vitest + initial test scaffolding for services | 1 day |
| QF-4 | Frontend `App.tsx` is monolithic (~500+ lines) | Refactor into modules per P1-04 in task breakdown | 2 days |
| QF-5 | README "Quick Start" says `npm run dev` but monorepo requires running both apps separately | Document correct startup procedure | 30 min |

---

## Recommended Execution Order

```
Week 1:  P0-1 (.env.example) + P0-2 (CI) + P0-3 (hardcoded URLs) + QF-1 + QF-5
Week 2-4: P1-1 (API key migration) + P1-2 (Anthropic adapter) + P1-3 (query bug)
Week 4-9: P2-1 (PostgreSQL) + P2-2 (Redis) + P2-3 (InspirationMap)
Week 9-14: P3-1 (BullMQ) + P3-2 (MotivationGarden) + P3-3 (Style Switcher)
Week 14+: P4-1 (OWASP) + P4-2 (Dark theme) + P4-3 (OpenTelemetry)
```

**Parallel tracks** (can run simultaneously):
- **Backend track**: P0 → P1-1 → P2-1 → P3-1 → P4-1
- **Frontend track**: P0 → P1-1 (client side) → P2-3 → P3-2/P3-3 → P4-2
- **DevOps track**: P0-2 → P4-3 (stretches across all phases)

---

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| PostgreSQL migration breaks existing in-memory behavior | High | Feature-flag the switch; keep Map as fallback during transition |
| API key migration changes auth flow significantly | High | Implement behind `/v2/` API prefix; deprecate v1 after verification |
| BullMQ requires Redis (not yet provisioned) | Medium | Redis is already planned for P2-2; pull forward or use Docker Compose |
| InspirationMap requires D3.js expertise | Medium | Evaluate simpler alternatives (react-force-graph, vis.js) if D3 is a bottleneck |
| MotivationGarden requires audio/ML capabilities | High | May need to hire or contract audio engineer; consider MVP with text-only input |

---

## How to Use This Document

1. **Pick a task** from the recommended execution order
2. **Check dependencies** — don't start P2-3 before P2-1
3. **Update status** — mark items complete in this document and in `DETAILED_TASK_BREAKDOWN.md`
4. **Create PRs** — CI will validate (once P0-2 is done)
5. **Update roadmap** — once per milestone, update `IMPLEMENTATION_ROADMAP.md` to reflect actual progress

---

*This document should be updated weekly. When all items are complete, archive it and create a new one for the next milestone.*
