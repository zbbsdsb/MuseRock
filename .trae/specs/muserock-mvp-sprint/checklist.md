# MuseRock MVP Sprint Checklist

## Phase A: Critical Bug Fixes

- [ ] Word export works without `require is not defined` error
- [ ] Dark mode hover effects show semi-transparent background, not transparent text
- [ ] Chrome DevTools shows `opacity: 1` for `.dark .bg-brand-black/5` text nodes
- [ ] `npm run build` output does not contain hardcoded `GEMINI_API_KEY`

## Phase B: Backend Test Coverage

- [ ] `cd apps/api && npm test` shows at least 3 passing tests
- [ ] `health.test.ts` executes without errors
- [ ] `api-keys.service.test.ts` validates encryption logic
- [ ] `auth.service.test.ts` validates session cleanup
- [ ] No duplicate test files in `apps/api/src/`
- [ ] `cd apps/web && npm test` shows all store tests passing
- [ ] GitHub Actions ci.yml uses `codeql-action/upload-sarif@v3`

## Phase C: Dark Theme Completeness

- [ ] Global search `apps/web/src/**/*.tsx` shows `bg-white` count near 0
- [ ] Google Fonts `@import` is at file top, outside `@layer base`
- [ ] Sidebar navigation buttons show semi-transparent light background on hover in dark mode
- [ ] Editor maintains proper contrast (dark background, light text)
- [ ] AI inspiration panel has no white background residue
- [ ] Project cards display dark backgrounds correctly
- [ ] Settings modal has dark background, not white
- [ ] Export dropdown has dark background
- [ ] Theme toggle animation is smooth without flicker

## Phase D: Creative Loop State Machine

### Store Implementation
- [ ] `creativeLoop.store.ts` exports `useCreativeLoopStore` and `STAGE_CONFIG`
- [ ] Default stage is `cloister`
- [ ] `setStage` updates `currentStage` and appends to `stageHistory`
- [ ] `nextStage` cycles through all 4 stages in order
- [ ] `previousStage` cycles in reverse order
- [ ] `addIdeaCard` generates unique id and defaults `isKept: null`
- [ ] `updateIdeaCard` updates specified card fields
- [ ] `removeIdeaCard` removes card by id
- [ ] `addReflection` creates entry with id and timestamp
- [ ] Store persists to `localStorage` under `muserock-creative-loop`
- [ ] `creativeLoop.store.test.ts` has tests for all major functions

### UI Integration
- [ ] RailNav displays 4 stage icons (Compass, PenTool, Sparkles, BookOpen)
- [ ] Active stage button is visually highlighted
- [ ] Clicking stage button transitions UI to that stage
- [ ] Stage progress dots appear at bottom of main area
- [ ] `currentStage` drives conditional rendering of main content

### PrimeBrief Component
- [ ] Displays "Define Your Creative Intent" heading
- [ ] Textarea for intent description exists
- [ ] Add/remove constraint tags works
- [ ] Add/remove reference links works
- [ ] "Enter The Cloister" button navigates to cloister stage
- [ ] Uses semantic token `bg-brand-paper` for surfaces

### ReflectionPanel Component
- [ ] Displays "Session Reflection" heading
- [ ] Three textareas for progressed/abandoned/nextEntry exist
- [ ] Submit button saves reflection and clears form
- [ ] Past reflections display in reverse chronological order
- [ ] "New Session" button navigates to prime stage
- [ ] Uses semantic token `bg-brand-paper` for surfaces

### DivergenceCards Component
- [ ] Category filter chips (All/Conflict/Symbolic/Structural/Character/Worldview) display
- [ ] Cards show gradient border based on category
- [ ] Card background uses transparency (not solid light colors)
- [ ] Keep (✓) and Discard (✕) buttons update card `isKept` state
- [ ] "Generate Divergent Ideas" button calls AI with editor content
- [ ] AI response parsed into IdeaCard objects
- [ ] Uses semantic token `bg-brand-paper` for surfaces

## End-to-End Verification

- [ ] `cd apps/web && npm run typecheck` exits with 0 errors
- [ ] `cd apps/web && npm run build` generates `dist/` without errors
- [ ] `cd apps/web && npm test` shows all tests passing
- [ ] `cd apps/api && npm run typecheck` exits with 0 errors
- [ ] `cd apps/api && npm run build` generates `dist/` without errors
- [ ] `cd apps/api && npm test` shows at least 3 tests passing

## MVP Acceptance Criteria

- [ ] 1. Application opens and displays writing editor
- [ ] 2. Text input saves to localStorage
- [ ] 3. AI provider switching works (Gemini/OpenAI/Anthropic)
- [ ] 4. Export to Markdown/Word/PDF works without errors
- [ ] 5. MuseDashboard project management functions correctly
- [ ] 6. Light/Dark/System theme toggle shows no visual errors
- [ ] 7. Firebase Google login works
- [ ] 8. CI all green (typecheck + build + test pass)

## Git Commits

- [ ] `fix(web): remove require() in export.ts, use dynamic import`
- [ ] `fix(web): fix dark mode opacity pollution in index.css`
- [ ] `fix(web): remove GEMINI_API_KEY from vite define config`
- [ ] `test(api): add vitest config for globals`
- [ ] `test(api): add health, api-keys, auth service tests`
- [ ] `test(web): verify store tests pass`
- [ ] `ci: upgrade codeql-action from v2 to v3`
- [ ] `fix(theme): replace 78 hardcoded bg-white with semantic tokens`
- [ ] `feat(loop): add Creative Loop state machine store`
- [ ] `feat(loop): integrate stage indicator into RailNav`
- [ ] `feat(loop): add PrimeBrief stage component`
- [ ] `feat(loop): add ReflectionPanel stage component`
- [ ] `feat(loop): add DivergenceCards component`
- [ ] `test(loop): verify end-to-end build and tests`
