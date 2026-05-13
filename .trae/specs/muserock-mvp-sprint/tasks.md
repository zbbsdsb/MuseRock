# MuseRock MVP Sprint Tasks

## Phase A: Critical Bug Fixes (~2h)

- [ ] **Task A-1**: Fix `export.ts` require() in ESM
  - [ ] SubTask A-1.1: Read `apps/web/src/utils/export.ts` line 98
  - [ ] SubTask A-1.2: Replace `require('docx')` with dynamic `await import('docx')`
  - [ ] SubTask A-1.3: Update `parseContentToParagraphs` function signature to accept classes as parameters
  - [ ] SubTask A-1.4: Verify Word export works without errors

- [ ] **Task A-2**: Fix `index.css` opacity pollution
  - [ ] SubTask A-2.1: Read `apps/web/src/index.css` lines 107-138
  - [ ] SubTask A-2.2: Replace `background-color + opacity` with `rgba()` for dark theme overrides
  - [ ] SubTask A-2.3: Move Google Fonts `@import` to file top (outside @layer)
  - [ ] SubTask A-2.4: Verify opacity no longer affects child text elements

- [ ] **Task A-3**: Remove API Key leak from vite.config.ts
  - [ ] SubTask A-3.1: Read `apps/web/vite.config.ts` line 11
  - [ ] SubTask A-3.2: Remove `define: { 'process.env.GEMINI_API_KEY': ... }` block
  - [ ] SubTask A-3.3: Verify build output doesn't contain hardcoded API keys

## Phase B: Backend Test Coverage (~2h)

- [ ] **Task B-1**: Add backend test files
  - [ ] SubTask B-1.1: Create `apps/api/src/__tests__/health.test.ts` with basic sanity checks
  - [ ] SubTask B-1.2: Create `apps/api/src/__tests__/api-keys.service.test.ts` with encryption tests
  - [ ] SubTask B-1.3: Create `apps/api/src/__tests__/auth.service.test.ts` with session cleanup tests
  - [ ] SubTask B-1.4: Deduplicate test files if duplicates exist

- [ ] **Task B-2**: Verify frontend tests pass
  - [ ] SubTask B-2.1: Run `cd apps/web && npm test`
  - [ ] SubTask B-2.2: Fix any failing store tests (ai.store, app.store, auth.store)
  - [ ] SubTask B-2.3: Ensure all 3 test files pass

- [ ] **Task B-3**: Update CI action version
  - [ ] SubTask B-3.1: Update `github/codeql-action/upload-sarif@v2` to `@v3` in ci.yml

## Phase C: Dark Theme Completeness (~1h)

- [ ] **Task C-1**: Replace hardcoded `bg-white` with semantic tokens
  - [ ] SubTask C-1.1: Replace in `RailNav.tsx`, `Header.tsx`, `MusePanel.tsx`, `UserPanel.tsx`
  - [ ] SubTask C-1.2: Replace in `SettingsModal.tsx`, `QuickAccess.tsx`, `ProjectDetail.tsx`
  - [ ] SubTask C-1.3: Replace in `ProjectCard.tsx`, `TemplateSelector.tsx`, `TemplateCard.tsx`
  - [ ] SubTask C-1.4: Replace in project `SettingsModal.tsx`, `MuseDashboard.tsx`, `MuseSphere.tsx`
  - [ ] SubTask C-1.5: Global search to confirm `bg-white` count near 0

- [ ] **Task C-2**: Manual dark mode verification
  - [ ] SubTask C-2.1: Start dev server and toggle dark mode
  - [ ] SubTask C-2.2: Verify all components have correct dark backgrounds
  - [ ] SubTask C-2.3: Fix any remaining white backgrounds found

## Phase D: Creative Loop State Machine (~8h)

- [ ] **Task D-1**: Create creativeLoop.store.ts
  - [ ] SubTask D-1.1: Create `apps/web/src/stores/creativeLoop.store.ts` with 4-stage state machine
  - [ ] SubTask D-1.2: Define STAGE_CONFIG for Prime/Cloister/Divergence/Reflection
  - [ ] SubTask D-1.3: Implement stage navigation actions (setStage, nextStage, previousStage)
  - [ ] SubTask D-1.4: Implement Prime Brief data management
  - [ ] SubTask D-1.5: Implement Idea Cards management
  - [ ] SubTask D-1.6: Implement Reflection entries management
  - [ ] SubTask D-1.7: Add persist middleware with partialize
  - [ ] SubTask D-1.8: Create `creativeLoop.store.test.ts` with unit tests
  - [ ] SubTask D-1.9: Update `stores/index.ts` barrel export

- [ ] **Task D-2**: Integrate stage indicator into UI
  - [ ] SubTask D-2.1: Import creativeLoop store in App.tsx
  - [ ] SubTask D-2.2: Replace activeTab logic with currentStage logic
  - [ ] SubTask D-2.3: Add getStageIcon helper function
  - [ ] SubTask D-2.4: Add stage progress dots at bottom of main area

- [ ] **Task D-3**: Create PrimeBrief component
  - [ ] SubTask D-3.1: Create `apps/web/src/components/stages/PrimeBrief.tsx`
  - [ ] SubTask D-3.2: Implement intent/constraints/references input forms
  - [ ] SubTask D-3.3: Add "Enter The Cloister" CTA button
  - [ ] SubTask D-3.4: Integrate into App.tsx for currentStage === 'prime'

- [ ] **Task D-4**: Create ReflectionPanel component
  - [ ] SubTask D-4.1: Create `apps/web/src/components/stages/ReflectionPanel.tsx`
  - [ ] SubTask D-4.2: Implement 3-question format (progressed/abandoned/nextEntry)
  - [ ] SubTask D-4.3: Display past reflections history
  - [ ] SubTask D-4.4: Integrate into App.tsx for currentStage === 'reflection'

- [ ] **Task D-5**: Create DivergenceCards component
  - [ ] SubTask D-5.1: Create `apps/web/src/components/stages/DivergenceCards.tsx`
  - [ ] SubTask D-5.2: Fix hardcoded category colors to use transparency
  - [ ] SubTask D-5.3: Implement category filter chips
  - [ ] SubTask D-5.4: Implement keep/discard actions for each card
  - [ ] SubTask D-5.5: Integrate into App.tsx for currentStage === 'divergence'

- [ ] **Task D-6**: End-to-end verification
  - [ ] SubTask D-6.1: Run `npm run typecheck` - verify 0 errors
  - [ ] SubTask D-6.2: Run `npm run build` - verify successful build
  - [ ] SubTask D-6.3: Run `npm test` - verify all tests pass

## Task Dependencies

```
Phase A
├── A-1 (export.ts) ──────────────────┐
├── A-2 (index.css) ──────────────────┤──► No dependencies
└── A-3 (vite.config) ───────────────┘

Phase B
├── B-1 (backend tests) ──────────────┐
├── B-2 (frontend tests) ────────────┤──► After A-1, A-2 complete
└── B-3 (CI action) ─────────────────┘

Phase C
├── C-1 (replace bg-white) ───────────┐──► After A-2 complete
└── C-2 (manual verification) ────────┘

Phase D
├── D-1 (store) ───────────────────────┐
├── D-2 (UI integration) ─────────────┤──► After Phase A-C complete
├── D-3 (PrimeBrief) ─────────────────┤
├── D-4 (ReflectionPanel) ────────────┤
├── D-5 (DivergenceCards) ────────────┤
└── D-6 (verification) ───────────────┘
```
