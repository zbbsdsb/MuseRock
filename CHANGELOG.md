# Changelog

All notable changes to MuseRock will be documented in this file.

## v0.1.0 (2026-05-20)

### ✨ Features
- **Complete Creative Loop** - Prime, Cloister, Divergence, Reflection stages fully implemented
- **The Cloister** - Distraction-free, serif-heavy writing environment
- **AI Configuration Wizard** - Multi-provider support (Gemini, OpenAI, Anthropic, Custom)
- **Onboarding Tour** - Interactive guide for new users
- **Quick Start Templates** - Short Story, Novel, Essay, Free Write templates
- **Project Management** - Create, view, and manage creative projects
- **Export Functionality** - Export to PDF and DOCX formats
- **Keyboard Shortcuts** - Ctrl+/ to open shortcuts panel
- **Theme Toggle** - Dark and Light mode support
- **Memory System UI** - 5-layer memory architecture showcase
- **Scientific Showcase** - Research paper and academic documentation

### 📚 Documentation
- **Technical Architecture** - Complete system architecture document
- **Research Paper** - Academic paper with 22+ citations
- **API Documentation** - API reference and usage guide
- **Creative Loop Guide** - How to use the 4-stage creative process
- **Muse Engine Guide** - AI inspiration engine documentation
- **Deployment Guide** - GitHub Pages deployment instructions

### 🎨 UI/UX Improvements
- **Landing Page** - Professional landing with scientific showcase
- **Responsive Design** - Works on desktop and tablet screens
- **Smooth Animations** - Powered by Motion library
- **Professional Typography** - Modern, readable type system
- **Visual Hierarchy** - Clear information architecture

### 🛠️ Infrastructure
- **GitHub Pages Deployment** - Automatic deployment on push to main
- **TypeScript Strict Mode** - Complete type safety
- **Vite Build System** - Fast builds and hot reload
- **GitHub Actions CI/CD** - Automated testing and deployment
- **Monorepo Structure** - apps/ (web, api) with shared dependencies

### 📦 Dependencies Updated
- React 19.0.0
- TypeScript 5.8.2
- Vite 6.2.0
- Tailwind CSS 4.1.14
- Motion 12.23.24
- Firebase 12.12.1

### ⚠️ Known Issues & Limitations
- **API Backend** - apps/api is not deployed in this release (local use only)
- **Firebase Auth** - Requires user configuration before use
- **Mobile** - No dedicated mobile app, responsive web only
- **Persistence** - Projects stored in localStorage only (no cloud sync yet)
- **Testing** - Test coverage needs improvement

### 🔧 Technical Debt
- Some components need refactoring for better maintainability
- ESLint not fully configured yet
- Playwright E2E tests not yet implemented
- Performance metrics and monitoring not set up
