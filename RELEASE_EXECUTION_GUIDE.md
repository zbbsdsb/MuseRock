# 📦 MuseRock v0.1.0 - Release Execution Guide

> **Execute these steps in order to complete the v0.1.0 release**

---

## 📋 Quick Overview

| Step | Task | Estimated Time |
|------|------|----------------|
| 1 | Update Version Numbers | 2 minutes |
| 2 | Verify Public Assets | 1 minute |
| 3 | Run Type Check & Build | 3-5 minutes |
| 4 | Create Release Package | 2 minutes |
| 5 | Create Documentation | 5 minutes |
| 6 | Git Commit & Push | 2 minutes |
| 7 | Verify Deployment | 5 minutes |
| **Total** | | **~20-25 minutes** |

---

## 🛠️ Step 1: Update Version Numbers

### Update Root package.json

```json
{
  "name": "muserock",
  "version": "0.1.0",  // <-- Change from 0.0.0
  "private": true,
  ...
}
```

### Update apps/web/package.json

```json
{
  "name": "@muserock/web",
  "version": "0.1.0",  // <-- Change from 0.0.0
  ...
}
```

---

## 📁 Step 2: Verify Public Assets

Check that these files exist:

```
apps/web/public/
├── docs/
│   ├── API_Documentation.md
│   ├── Creative_Loop_Guide.md
│   ├── DEPLOYMENT_GUIDE.md
│   ├── DEPLOYMENT.md
│   ├── Muse_Engine_Guide.md
│   ├── RESEARCH_PAPER.md
│   └── Technical_Architecture.md
└── logo.png
```

✅ If any missing, copy from root `docs/` folder.

---

## 🔍 Step 3: Type Check & Build

```bash
# Go to project root
cd "e:\ceaserzhao\github projects\MuseRock"

# Run type check
npm run typecheck

# Build the application
npm run build
```

### Verify Build Output

After build, check `apps/web/dist/`:

```
apps/web/dist/
├── assets/
│   ├── index-*.js
│   ├── index-*.css
│   └── logo-*.png
├── docs/                    <-- IMPORTANT
│   └── (all .md files)
├── logo.png                 <-- IMPORTANT
└── index.html
```

✅ Verify `docs/` and `logo.png` exist in `dist/`

---

## 📦 Step 4: Create Release Package (Optional but Recommended)

### Windows (PowerShell)

```powershell
cd "e:\ceaserzhao\github projects\MuseRock"

# Create release package
Compress-Archive -Path "apps/web/dist/*" -DestinationPath "muserock-v0.1.0.zip" -Force

# Verify the ZIP
Test-Path "muserock-v0.1.0.zip"
```

### Linux/Mac (bash)

```bash
cd "e:\ceaserzhao\github projects\MuseRock"

cd apps/web/dist
zip -r ../../muserock-v0.1.0.zip .
cd ../..
```

---

## 📝 Step 5: Create Release Documentation

### Create CHANGELOG.md

```markdown
# Changelog

## v0.1.0 (2026-05-20)

### ✨ Features
- Complete Creative Loop implementation (Prime, Cloister, Divergence, Reflection)
- The Cloister - Distraction-free writing environment
- AI configuration wizard with multiple providers (Gemini, OpenAI, Anthropic)
- Onboarding tour for new users
- Quick start guide with templates
- Project management system
- Export to PDF, DOCX
- Keyboard shortcuts panel (Ctrl+/)
- Dark/Light theme toggle
- Scientific showcase with research paper documentation
- 5-layer memory architecture documentation

### 📚 Documentation
- Technical Architecture document
- Research Paper with academic citations
- API Documentation
- Creative Loop Guide
- Muse Engine Guide
- Deployment Guide

### 🎨 UI/UX
- Landing page with scientific showcase
- Responsive design
- Smooth animations with Motion
- Professional typography system
- Dark/Light theme support

### 🛠️ Infrastructure
- GitHub Pages automatic deployment
- TypeScript type checking
- Vite build system
- GitHub Actions CI/CD

### 📦 Package
- monorepo structure with apps/ (web, api)
- React 19 + TypeScript 5.8 + Vite 6.2
- Tailwind CSS 4.1 for styling
- Zustand for state management
- Firebase integration

### ⚠️ Known Issues
- API backend (apps/api) is not deployed with GitHub Pages
- Firebase authentication requires configuration
- No mobile app version yet
```

### Update RELEASE_CHECKLIST.md

Mark items as completed as you go.

---

## 🔄 Step 6: Git Commit & Push

```bash
cd "e:\ceaserzhao\github projects\MuseRock"

# Check status
git status

# Add changes
git add .

# Commit
git commit -m "chore: bump version to v0.1.0 and prepare release"

# Create tag
git tag -a v0.1.0 -m "MuseRock v0.1.0 - First Beta Release"

# Push
git push origin main
git push origin v0.1.0
```

---

## 🌐 Step 7: Verify Deployment

### Monitor GitHub Actions

1. Go to: https://github.com/zbbsdsb/MuseRock/actions
2. Wait for workflow to complete (~3-5 minutes)
3. Look for ✅ green checkmark

### Verify Live Site

1. Visit: https://zbbsdsb.github.io/MuseRock/
2. Test these features:
   - ✅ Landing page loads
   - ✅ Onboarding tour works
   - ✅ Quick start guide accessible
   - ✅ Creative Loop stages work
   - ✅ AI configuration wizard opens
   - ✅ Keyboard shortcuts (Ctrl+/)
   - ✅ Theme toggle works
   - ✅ Documentation links are functional

### Verify Environment on GitHub Repo

Check that repo shows:
- ✅ **Environments** section on right sidebar
- ✅ **github-pages** environment with active deployment

---

## 🚨 Rollback Plan (If Needed)

If something goes wrong:

```bash
# Delete local tag
git tag -d v0.1.0

# Delete remote tag
git push origin --delete v0.1.0

# Revert commit (if already pushed)
git revert HEAD
git push origin main
```

---

## 📊 Post-Release Tasks

- [ ] Create GitHub Release with the ZIP file
- [ ] Announce release (if applicable)
- [ ] Monitor for any issues
- [ ] Plan next release milestones

---

## 🔗 Quick Links

| Resource | URL |
|----------|-----|
| Live Demo | https://zbbsdsb.github.io/MuseRock/ |
| GitHub Repo | https://github.com/zbbsdsb/MuseRock |
| Actions | https://github.com/zbbsdsb/MuseRock/actions |
| Settings → Pages | https://github.com/zbbsdsb/MuseRock/settings/pages |

---

**Good luck with the release! 🚀🎸**
