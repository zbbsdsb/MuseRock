# 🚀 MuseRock v0.1.0 Release Checklist

## Pre-Release Steps

- [ ] Run TypeScript checks: `npm run typecheck`
- [ ] Run build: `npm run build`
- [ ] Test the application locally: `npm run dev`
- [ ] Update version number in `package.json` (from 0.0.0 to 0.1.0)
- [ ] Update version number in `apps/web/package.json`
- [ ] Add git commit with changes
- [ ] Tag the release: `git tag -a v0.1.0 -m "First beta release"`
- [ ] Push to main branch

## Deployment

- [ ] GitHub Pages will automatically deploy on push to main
- [ ] Monitor deploy action: https://github.com/zbbsdsb/MuseRock/actions
- [ ] Verify deployment: https://zbbsdsb.github.io/MuseRock/

## Post-Release Verification

- [ ] Visit demo URL and test landing page
- [ ] Go through onboarding tour
- [ ] Test the Creative Loop stages (Prime, Cloister, Divergence, Reflection)
- [ ] Test AI configuration wizard
- [ ] Verify dark/light theme toggles
- [ ] Test keyboard shortcuts (Ctrl+/)
- [ ] Test export functionality
