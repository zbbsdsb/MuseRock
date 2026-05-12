# MuseRock: Next Actions & Gap Analysis

> **Last Updated**: 2026-05-12 (Morning audit — post Trae Phase 1 execution)
> **Status**: Active — Team Action Document
> **Purpose**: Bridge the gap between what the roadmap planned, what the codebase actually has, and what the team must do next.

---

## Executive Summary

The codebase has solid architectural scaffolding. As of the latest update, the **P0 blockers and P1 critical security items are now resolved**. The architecture supports both **local-first** (direct API calls, no backend) and **cloud** (server-side proxy with encrypted key storage) modes, switchable at runtime.

**Key finding**: ~60% of planned modules have scaffold code, ~25% are now production-ready. The three most critical gaps remaining are:

1. **5-layer memory is pure in-memory Map** (data lost on restart) — P2 priority
2. **Frontend signature UIs not built** (InspirationMap, MotivationGarden) — P2/P3 priority
3. **Apprentice job processing uses `while(true)` polling** — P3 priority

---

## Current Status vs. Roadmap

| Phase | Roadmap Target | Code Reality | Completion | Blocker |
|-------|---------------|-------------|-----------|---------|
| **P0** | Repo reviewable | README ✅, docs ✅, CI ❌, .env.example ✅ | 85% | Missing CI only |
| **P1** | Security + BFF | NestJS ✅, OAuth PKCE ✅, API key encryption ✅, Local/Cloud mode ✅ | **90%** | Dark theme pending |
| **P2** | Memory engine | 5-layer code ✅, **all in-memory Map ❌**, no pgvector | 35% | No database |
| **P3** | Apprentice + MCP | MCP Gateway ✅, Apprentice scaffold ✅, **no Temporal ❌**, UI missing | 30% | No workflow engine |
| **P4** | Compliance + Observability | Prometheus metrics ✅, **OWASP checks all mock ❌** | 20% | Mock compliance |

---

## ✅ Completed Items (2026-05-11)

### P0-1: `.env.example` Created ✅
Both `apps/api/.env.example` and `apps/web/.env.example` now exist with all required environment variables documented.

### P0-3: Hardcoded URLs Fixed ✅
All frontend API calls now use `import.meta.env.VITE_API_URL || 'http://localhost:3001'` instead of hardcoded URLs.

### P1-1: API Key Architecture — Dual Mode ✅
**This is the biggest update.** MuseRock now supports two runtime modes:

#### Cloud Mode (default)
- Frontend calls backend proxy (`POST /ai/generate`, `POST /ai/inspiration`, `POST /ai/source-assets`)
- API keys encrypted server-side via `ApiKeysService` (AES-256-GCM)
- Keys stored in SQLite `api_keys` table, never in browser
- Endpoints: `POST /api-keys` (save), `GET /api-keys` (list), `DELETE /api-keys/:provider`

#### Local Mode
- Frontend calls AI APIs directly (Gemini, OpenAI, Anthropic)
- Keys stored in `localStorage` under `muserock_local_keys`
- Works without backend running — pure local experience
- Mode switch persists across sessions

#### Implementation details
- New file: `apps/web/src/services/ai-provider.ts` — abstraction layer with `LocalAIService`, `CloudAIService`, `createAIService()`, `createApiKeyService()` factories
- Updated: `apps/web/src/App.tsx` — settings panel now includes mode toggle (Cloud/Local), dynamic key storage hints
- Existing: `apps/api/src/ai/ai-proxy.controller.ts` — cloud proxy endpoints (already existed)
- Existing: `apps/api/src/api-keys/api-keys.service.ts` — AES-256-GCM encryption (already existed)

### P1-2: All AI Providers Fully Functional ✅
- **Gemini**: Full SDK integration via `@google/generative-ai` ✅
- **OpenAI**: Full SDK integration via `openai` ✅
- **Anthropic**: Full integration via `fetch` to Anthropic Messages API ✅ (works in both local and cloud modes)
- Backend adapter pattern also available: `adapters/anthropic.adapter.ts` registered in `ModelAdapterFactory`

### P1-3: `listJobs` Query Bug Fixed ✅
Second `.where()` changed to `.andWhere()` to properly combine filter conditions.

### QF-1: `generateId()` Collision Risk Fixed ✅
Replaced `Date.now().toString(36) + random` with `uuidv4()`.

---

## P0 Blockers (Remaining, 1 Week)

### P0-2: GitHub Actions CI Pipeline ❌

**Problem**: No CI/CD. PRs can break the build unnoticed.

**Action**: Create `.github/workflows/ci.yml`:
- `lint` — ESLint + Prettier check
- `typecheck` — `tsc --noEmit` for both apps
- `build` — `npm run build` for both apps
- `test` — Vitest unit tests (once they exist)

**Assignee**: DevOps | **Estimate**: 4 hours

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

**Problem**: `useThemeStore` exists but dark mode colors are not fully applied across all components.

**Action**:
1. Extend Tailwind config with dark mode colors
2. Audit all components for dark mode support
3. Ensure theme toggle works correctly

**Assignee**: Frontend dev | **Estimate**: 2 days

---

### P4-3: OpenTelemetry Integration

**Problem**: Prometheus metrics exist, but no distributed tracing. Cannot debug cross-service latency.

**Action**: Add `@opentelemetry/api` + `@opentelemetry/sdk-node` to NestJS. Configure trace export to Jaeger or Grafana Tempo.

**Assignee**: DevOps | **Estimate**: 3 days

---

## Code Quality Quick Fixes

| ID | Issue | Fix | Effort | Status |
|----|-------|-----|--------|--------|
| QF-1 | `generateId()` collision risk | Replace with `uuid.v4()` | 30 min | ✅ Done |
| QF-2 | Memory search uses `String.includes()` | Will be fixed by P2-1 vector search | 5 min | Pending |
| QF-3 | No unit tests anywhere | Add Vitest + initial test scaffolding | 1 day | ✅ Done |
| QF-4 | Frontend `App.tsx` is monolithic (~700+ lines) | Refactor into modules | 2 days | Pending |
| QF-5 | README "Quick Start" says `npm run dev` | Document correct startup procedure | 30 min | ✅ Done |
| QF-6 | CI scripts (`build:web`, `build:api`, `typecheck`) missing | Added to root package.json | 30 min | ✅ Done |
| QF-7 | `App.tsx` has dead import (`AIService` from old ai.ts) | Removed dead imports, updated types | 30 min | ✅ Done |
| QF-8 | `ApiKeysService` uses `process.env` directly (breaks hot reload) | Switched to `ConfigService` | 30 min | ✅ Done |
| QF-9 | `ApprenticeService` uses `while(true)` polling | Replaced with event-driven wake-up pattern | 1 hour | ✅ Done |
| QF-10 | `auth.service.ts` setInterval 内存泄漏 | 添加 `OnModuleDestroy`, `clearInterval` | 30 min | ✅ Done |
| QF-11 | API `dev` 脚本无热重载 (`tsc && node dist`) | 改为 `tsx watch src/main.ts` | 15 min | ✅ Done |
| QF-12 | `apps/web/package.json` 不存在（非真 monorepo） | 新增 `apps/web/package.json` + `vite.config.ts` | 1 hour | ✅ Done |
| QF-13 | API 无测试（`test` 脚本 exit 1） | 添加 `vitest.config.ts` + `test` 脚本 | 30 min | ✅ Done (配置) / ❌ 无测试文件 |
| QF-14 | README 无准确 Quick Start | 更新为双端口启动说明 | 30 min | ✅ Done |
| QF-10 | `auth.service.ts` setInterval leak | Added `OnModuleDestroy` + cleanup | 30 min | ✅ Done |
| QF-11 | API dev script no hot reload | Changed to `tsx watch` for hot reload | 15 min | ✅ Done |
| QF-12 | Dark theme CSS variable mismatch | Rewrote CSS using proper Tailwind v4 dark mode | 1 hour | ✅ Done |

---

## Recommended Execution Order (Updated: 2026-05-12)

```
Week 1:  ✅ P0-1 (.env.example) + ✅ P0-3 (hardcoded URLs) + ✅ P1-1 (API key dual-mode) + ✅ P1-2 (Anthropic) + ✅ P1-3 (query bug) + ✅ QF-1
Week 2:  ✅ QF-5 (README fix) + ✅ QF-6/7/8/9/10/11 + CI pipeline
Week 3-8: P2-1 (PostgreSQL) + P2-2 (Redis) + P2-3 (InspirationMap)
Week 8-14: P3-1 (BullMQ) + P3-2 (MotivationGarden) + P3-3 (Style Switcher)
Week 14+: P4-1 (OWASP) + P4-2 (Dark theme) + P4-3 (OpenTelemetry)
```

**Parallel tracks** (can run simultaneously):
- **Backend track**: P0-2 (CI) → P2-1 → P3-1 → P4-1
- **Frontend track**: P2-3 → P3-2/P3-3 → P4-2
- **DevOps track**: P0-2 → P4-3 (stretches across all phases)

---

## Architecture: AI Connection Modes

MuseRock supports two AI connection modes, switchable at runtime via Settings panel:

```
┌─────────────────────────────────────────────────────────────────┐
│                        MuseRock Frontend                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              ai-provider.ts (Abstraction Layer)           │    │
│  │  createAIService(provider) → LocalAIService | CloudAIService │
│  │  createApiKeyService()    → Local Keys    | Cloud Keys    │    │
│  └──────────┬──────────────────────────────┬───────────────┘    │
│             │                              │                      │
│      [local mode]                   [cloud mode]                  │
│             │                              │                      │
│             ▼                              ▼                      │
│    ┌────────────────┐          ┌──────────────────────┐          │
│    │ Direct to API   │          │ POST /ai/generate    │          │
│    │ (Gemini/OpenAI/ │          │ POST /ai/inspiration │          │
│    │  Anthropic)     │          │ POST /ai/source-assets│         │
│    │ Keys in localStorage         │ Credentials: include│          │
│    └────────────────┘          └──────────┬───────────┘          │
│                                            │                      │
│                                  ┌─────────▼─────────┐           │
│                                  │   NestJS Backend   │           │
│                                  │  ai-proxy.controller│          │
│                                  │  API Keys: AES-256 │           │
│                                  │  Storage: SQLite    │          │
│                                  └───────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| PostgreSQL migration breaks existing in-memory behavior | High | Feature-flag the switch; keep Map as fallback during transition |
| BullMQ requires Redis (not yet provisioned) | Medium | Redis is already planned for P2-2; pull forward or use Docker Compose |
| InspirationMap requires D3.js expertise | Medium | Evaluate simpler alternatives (react-force-graph, vis.js) if D3 is a bottleneck |
| MotivationGarden requires audio/ML capabilities | High | May need to hire or contract audio engineer; consider MVP with text-only input |
| ~~API key migration changes auth flow~~ | ~~High~~ | ✅ **Resolved** — dual mode architecture avoids this |

---

## How to Use This Document

1. **Pick a task** from the recommended execution order
2. **Check dependencies** — don't start P2-3 before P2-1
3. **Update status** — mark items complete in this document and in `DETAILED_TASK_BREAKDOWN.md`
4. **Create PRs** — CI will validate (once P0-2 is done)
5. **Update roadmap** — once per milestone, update `IMPLEMENTATION_ROADMAP.md` to reflect actual progress

---

*This document should be updated weekly. When all items are complete, archive it and create a new one for the next milestone.*
