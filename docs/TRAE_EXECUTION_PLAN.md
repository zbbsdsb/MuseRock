# MuseRock — Trae Execution Plan

> **Created**: 2026-05-11
> **Purpose**: Complete, actionable task list for Trae (AI coding agent) to execute sequentially.
> **Principle**: Each task is self-contained with clear acceptance criteria. Execute in order unless stated otherwise.

---

## Phase 0: Critical Code Quality Fixes (Do First, ~2 hours)

These are bugs/issues discovered during the 2026-05-11 audit that must be fixed before any feature work.

### Task 0-1: Fix CI Pipeline Script Mismatch 🔴 HIGH

**Problem**: `.github/workflows/ci.yml` references scripts that don't exist in root `package.json`:
- `npm run build:web` → does NOT exist (root has `npm run build` = `vite build`)
- `npm run build:api` → does NOT exist (only in `apps/api/package.json`)
- `npm run typecheck` → does NOT exist (root has `npm run lint` = `tsc --noEmit`)

**Files to modify**:
1. `package.json` (root) — add the missing scripts:
   ```json
   "typecheck": "tsc --noEmit",
   "build:web": "vite build",
   "build:api": "cd apps/api && npm run build"
   ```
2. Also add `"start:api": "cd apps/api && npm run dev"` for convenience.
3. Add `"lint:api": "cd apps/api && npx tsc --noEmit"` for API linting.

**Acceptance**: Running `npm run build:web`, `npm run build:api`, `npm run typecheck` all succeed locally.

---

### Task 0-2: Remove Dead Import in App.tsx 🟡 MEDIUM

**Problem**: `apps/web/src/App.tsx` line 35 imports old service classes that are no longer used:
```typescript
import { AIService, ApiKeyService } from './services/ai';
```
These are only used as type annotations in `useRef` (lines 96-97), but the actual runtime objects are created via `createAIService()` / `createApiKeyService()` from `ai-provider.ts`.

**Fix**:
1. Delete the import of `{ AIService, ApiKeyService }` from `'./services/ai'`
2. Update the `useRef` type annotations to use the types from `ai-provider.ts`:
   ```typescript
   import type { LocalAIService, CloudAIService } from './services/ai-provider';
   const aiServiceRef = useRef<LocalAIService | CloudAIService | null>(null);
   const apiKeyServiceRef = useRef<ReturnType<typeof createApiKeyService> | null>(null);
   ```

**Acceptance**: `npm run typecheck` passes with no errors related to these types.

---

### Task 0-3: Fix API `dev` Script — No Hot Reload 🟡 MEDIUM

**Problem**: `apps/api/package.json` has `"dev": "tsc && node dist/main.js"` which requires manual restart after every code change.

**Fix**: Change to use `tsx` for development (it's already in root devDependencies):
```json
"dev": "tsx watch src/main.ts"
```
Also add: `"start:dev": "tsx watch src/main.ts"` as alias.

Note: `tsx` is installed in root `package.json` devDependencies. Since `apps/api/` is not a workspace, you may need to either:
- Add `tsx` to `apps/api/package.json` devDependencies, OR
- Use `npx tsx watch src/main.ts` to reference root's tsx

**Acceptance**: `cd apps/api && npm run dev` starts the server and auto-restarts on file changes.

---

### Task 0-4: Add Missing API Test Script 🟡 MEDIUM

**Problem**: `apps/api/package.json` has `"test": "echo \"Error: no test specified\" && exit 1"` which always fails.

**Fix**: Replace with vitest (consistent with frontend):
```json
"test": "vitest --run",
"test:watch": "vitest"
```
Also add vitest to `apps/api/package.json` devDependencies and create a minimal `apps/api/vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
});
```

**Acceptance**: `cd apps/api && npm test` runs (even if 0 tests, it shouldn't error).

---

### Task 0-5: Fix `auth.service.ts` setInterval Memory Leak 🟢 LOW

**Problem**: `apps/api/src/auth/auth.service.ts` constructor creates a `setInterval` without storing the reference or clearing it on module destruction.

**Fix**:
```typescript
private cleanupTimer: NodeJS.Timeout;

constructor(...) {
  this.cleanupTimer = setInterval(() => this.cleanupExpiredStates(), 5 * 60 * 1000);
}

// Add OnModuleDestroy lifecycle
import { OnModuleDestroy } from '@nestjs/common';

// Implement in class:
onModuleDestroy() {
  clearInterval(this.cleanupTimer);
}
```

**Acceptance**: No `clearInterval` warnings in linter output.

---

## Phase 1: Project Structure Normalization (~3 hours)

### Task 1-1: Convert to Proper Monorepo Structure 🟡 MEDIUM

**Problem**: Root `package.json` IS the web frontend's package.json (has Vite, React deps). There's no monorepo tooling (no `workspaces`, no `turbo.json`, no `nx.json`). `apps/web/` doesn't have its own `package.json`.

**Fix**: Restructure into a proper monorepo:

1. Move web dependencies from root `package.json` to new `apps/web/package.json`
2. Root `package.json` should only have:
   - `"private": true`
   - `"workspaces": ["apps/*"]` (if using npm workspaces)
   - Shared dev scripts
3. Create `apps/web/package.json` with all React/Vite/frontend deps
4. Create `apps/web/tsconfig.json` (currently at root `tsconfig.json`)
5. Update `apps/web/vite.config.ts` paths if needed
6. Update all import paths if they break

**Acceptance**: 
- `npm install` at root installs both `apps/web` and `apps/api` dependencies
- `npm run dev --workspace=apps/web` and `npm run dev --workspace=apps/api` both work
- Root `package.json` no longer contains Vite/React dependencies

**⚠️ RISK**: This is a structural refactor. Test carefully. Commit with clear message.

---

## Phase 2: Dark Theme Completion (~2 hours)

### Task 2-1: Audit and Fix Hardcoded `bg-white` Classes 🟡 MEDIUM

**Problem**: `App.tsx` and other components have ~15+ hardcoded `bg-white` classes. Dark theme works via CSS overrides (`.dark .bg-white { background-color: var(--color-brand-paper-dark) }`) but this is fragile.

**Fix**: Replace hardcoded color classes with semantic tokens where Tailwind supports it:
- `bg-white` → `bg-brand-paper` (where it means "card surface")
- Keep `bg-white` only where it literally must be white

**Files to audit** (search for `bg-white`):
- `apps/web/src/App.tsx` (lines 321, 410, 478, 565, 694, 837)
- `apps/web/src/components/MuseDashboard.tsx`
- `apps/web/src/components/MuseSphere.tsx`
- All components under `apps/web/src/components/`

**Approach**:
1. Search all `.tsx` files for `bg-white` and `bg-brand-black` hardcodings
2. Evaluate each: if it's a surface/background, use `bg-brand-paper`; if it's truly white, keep it
3. Verify dark mode renders correctly after changes

**Acceptance**: 
- Toggle dark/light mode — no jarring white flashes
- All surfaces correctly switch between light and dark palettes
- No visual regressions in light mode

---

### Task 2-2: Fix Dark Mode Color Edge Cases 🟢 LOW

**Problems found in `index.css` dark mode overrides**:
1. `.dark .bg-brand-black/5` overrides to `var(--color-brand-text-dark)` — this makes hover states FULLY opaque dark instead of subtle. Should be a transparent version.
2. `.dark .hover\:bg-brand-black/5:hover` same issue.
3. `.dark .shadow-[24px_24px_0px_0px_rgba(26,26,26,0.1)]` — the closing bracket selector exists but has no body (empty rule).

**Fix**:
```css
/* Fix: Use rgba with low alpha for hover overlays */
.dark .bg-brand-black\/5 {
  background-color: rgba(229, 229, 229, 0.05);
}
.dark .hover\:bg-brand-black\/5:hover {
  background-color: rgba(229, 229, 229, 0.08);
}

/* Fix: Add dark shadow or remove empty rule */
.dark .shadow-\[24px_24px_0px_0px_rgba\(26\,26\,26\,0\.1\)\] {
  box-shadow: 24px 24px 0px 0px rgba(0, 0, 0, 0.3);
}
```

**Acceptance**: Hover effects in dark mode are subtle, not jarring. No empty CSS rules.

---

## Phase 3: Backend Stability (~4 hours)

### Task 3-1: Replace `while(true)` with Event-Driven Job Processing 🟡 MEDIUM

**Problem**: `apps/api/src/apprentice/apprentice.service.ts` lines 141-157 have an infinite `while(true)` loop with 100ms polling. No graceful shutdown. CPU waste.

**Fix options** (pick one):

**Option A: Simple event-driven (no Redis needed, recommended for local-first)**
```typescript
private isProcessing = false;

private async processJobs() {
  if (this.isProcessing) return;
  this.isProcessing = true;
  
  try {
    while (this.jobQueue.length > 0 && this.activeJobs.size < this.maxConcurrentJobs) {
      const jobItem = this.jobQueue.shift();
      if (jobItem) {
        const jobId = jobItem.id;
        this.activeJobs.add(jobId);
        this.executeJob(jobId).finally(() => {
          this.activeJobs.delete(jobId);
          // Check if more jobs are waiting
          this.processJobs();
        });
      }
    }
  } finally {
    this.isProcessing = false;
  }
}
```

**Option B: BullMQ (if Redis is available)**
- Requires Redis running
- Create `Queue` and `Worker` instances
- Much more robust but heavier dependency

**Recommendation**: Go with Option A for now (local-first philosophy). Add BullMQ later when cloud mode needs it.

Also add graceful shutdown:
```typescript
import { OnModuleDestroy } from '@nestjs/common';

onModuleDestroy() {
  // Mark processing as stopped, allow current jobs to finish
  this.isShuttingDown = true;
}
```

**Acceptance**:
- `apprentice.service.ts` has no `while(true)` loop
- Jobs are processed when added, not on a timer
- CPU idle is near 0% when no jobs
- `onModuleDestroy` implemented

---

### Task 3-2: Add Graceful Shutdown to API Server 🟢 LOW

**Problem**: NestJS server doesn't handle SIGINT/SIGTERM gracefully. Active requests and the `processJobs` loop would be killed abruptly.

**Fix**: Add to `apps/api/src/main.ts`:
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || 3001);

  // Graceful shutdown
  const signalTriggers = ['SIGINT', 'SIGTERM'];
  signalTriggers.forEach(signal => {
    process.on(signal, async () => {
      console.log(`Received ${signal}, shutting down gracefully...`);
      await app.close();
      process.exit(0);
    });
  });
}

bootstrap();
```

**Acceptance**: Pressing Ctrl+C in terminal shows "shutting down gracefully..." message and exits cleanly.

---

## Phase 4: Testing Foundation (~3 hours)

### Task 4-1: Add Vitest Test Scaffolding for Frontend 🟡 MEDIUM

**Problem**: Frontend has vitest in devDependencies but no test files exist anywhere.

**Fix**:
1. Create `src/__tests__/` directory structure
2. Write 3-5 basic smoke tests:
   - `src/__tests__/themeStore.test.ts` — test theme toggle, dark/light mode switching
   - `src/__tests__/ai-provider.test.ts` — test `getAIMode()`, `setAIMode()`, `saveLocalApiKey()`, `getLocalApiKey()` (mock localStorage)
   - `src/__tests__/App.testtsx` — render App component, verify it mounts without crash
3. Ensure `npm test` runs these tests successfully

**Acceptance**: `npm test` runs and shows at least 3 passing tests.

---

### Task 4-2: Add Vitest Test Scaffolding for Backend 🟡 MEDIUM

**Problem**: Backend has no tests at all (test script is `exit 1`).

**Fix**:
1. Create `apps/api/src/__tests__/` directory
2. Write 2-3 basic tests:
   - `memory.service.test.ts` — test basic CRUD on the in-memory MemoryService
   - `ai-proxy.controller.test.ts` — test endpoint validation (missing API key returns 401)
   - `api-keys.service.test.ts` — test encryption/decryption roundtrip
3. Ensure `cd apps/api && npm test` runs successfully

**Acceptance**: `cd apps/api && npm test` runs and shows at least 2 passing tests.

---

## Phase 5: Documentation Updates (~1 hour)

### Task 5-1: Update README Quick Start 🟢 LOW

**Problem**: README's Quick Start likely says `npm run dev` but doesn't explain that:
1. API server must run separately in `apps/api/`
2. `.env` files must be configured first
3. In local mode, no backend is needed

**Fix**: Update README.md with accurate startup instructions:

```markdown
## Quick Start

### Option A: Local Mode (No Backend)
1. `cp apps/web/.env.example apps/web/.env` (optional, uses defaults)
2. `npm run dev` — starts frontend at http://localhost:3000
3. Open Settings → select "Local (Direct API)" → enter your API key

### Option B: Cloud Mode (Full Stack)
1. `cp apps/api/.env.example apps/api/.env` — configure database + encryption key
2. `cp apps/web/.env.example apps/web/.env` — point VITE_API_URL to backend
3. Terminal 1: `cd apps/api && npm run dev` — starts backend at http://localhost:3001
4. Terminal 2: `npm run dev` — starts frontend at http://localhost:3000
5. Open Settings → select "Cloud (Server Proxy)" → enter your API key
```

**Acceptance**: A new contributor can start the app in local mode without reading any other docs.

---

### Task 5-2: Update NEXT_ACTIONS.md Status 🟢 LOW

**After completing all tasks above**, update `docs/NEXT_ACTIONS.md`:
- Mark P0-2 (CI) as ✅ Done (once scripts are fixed)
- Mark QF-3 (unit tests) as ✅ Done
- Mark QF-4 (App.tsx monolithic) as Partially Done (dead imports removed, full refactor deferred)
- Mark QF-5 (README) as ✅ Done
- Update P3-1 (while(true) replacement) as ✅ Done
- Add new findings from audit to Code Quality section
- Update timestamp

---

## Execution Order Summary

```
┌─────────────────────────────────────────────────┐
│  Phase 0: Critical Code Fixes (2h)              │
│  0-1: Fix CI script mismatch     🔴 DO FIRST    │
│  0-2: Remove dead App.tsx import  🟡             │
│  0-3: Fix API dev hot-reload       🟡             │
│  0-4: Fix API test script          🟡             │
│  0-5: Fix setInterval leak         🟢             │
├─────────────────────────────────────────────────┤
│  Phase 1: Monorepo Restructure (3h)             │
│  1-1: Proper monorepo layout        🟡 RISKY     │
├─────────────────────────────────────────────────┤
│  Phase 2: Dark Theme (2h)                       │
│  2-1: Fix hardcoded bg-white        🟡             │
│  2-2: Fix dark mode edge cases     🟢             │
├─────────────────────────────────────────────────┤
│  Phase 3: Backend Stability (4h)                │
│  3-1: Replace while(true)           🟡             │
│  3-2: Graceful shutdown             🟢             │
├─────────────────────────────────────────────────┤
│  Phase 4: Testing Foundation (3h)               │
│  4-1: Frontend test scaffolding     🟡             │
│  4-2: Backend test scaffolding      🟡             │
├─────────────────────────────────────────────────┤
│  Phase 5: Documentation (1h)                    │
│  5-1: Update README                   🟢             │
│  5-2: Update NEXT_ACTIONS.md         🟢             │
└─────────────────────────────────────────────────┘

Total estimated: ~15 hours
```

## Commit Strategy

After each phase, make a separate commit:
- `fix(ci): add missing build scripts to root package.json`
- `refactor(web): remove dead ai.ts import from App.tsx`
- `fix(api): add hot-reload dev script and test scaffolding`
- `fix(api): resolve setInterval memory leak in auth service`
- `refactor: convert to monorepo structure with workspaces`
- `fix(theme): replace hardcoded bg-white with semantic tokens`
- `refactor(api): replace while(true) polling with event-driven processing`
- `test: add vitest scaffolding and initial smoke tests`
- `docs: update README quick start and NEXT_ACTIONS status`

---

## What NOT to Do

- ❌ Do NOT migrate to PostgreSQL/pgvector yet (P2-1 is planned but requires infrastructure decisions)
- ❌ Do NOT implement InspirationMap or MotivationGarden yet (P2-3/P3-2 depend on real memory data)
- ❌ Do NOT replace mock OWASP checks yet (P4-1, needs security tooling)
- ❌ Do NOT add BullMQ yet (P3-1 full implementation, use event-driven approach instead)
- ❌ Do NOT refactor App.tsx into separate files yet (QF-4, too risky without tests)

---

*This plan is designed to be executed sequentially by Trae. Each task has clear inputs, outputs, and acceptance criteria. If any task encounters unexpected issues, document them and move to the next task.*
