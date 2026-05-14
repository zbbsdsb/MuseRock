# MuseRock GitHub Pages Deployment Spec

## Why

MuseRock currently has no public deployment. Deploying to GitHub Pages will allow users to access the application at `https://zbbsdsb.github.io/MuseRock/`, enabling early user testing and feedback collection before official release.

## What Changes

This spec defines the deployment pipeline for MuseRock frontend to GitHub Pages:

- Add GitHub Actions workflow for automatic deployment
- Configure Vite for GitHub Pages base path (`/MuseRock/`)
- Add CNAME support for custom domain (optional)
- Set up branch protection for production deployments

## Impact

- Affected specs: MVP deployment readiness
- Affected code:
  - `apps/web/vite.config.ts` - base path configuration
  - `apps/web/index.html` - base tag
  - `.github/workflows/deploy.yml` - deployment workflow
  - `docs/` - deployment documentation

## ADDED Requirements

### Requirement: Automatic GitHub Pages Deployment

The system SHALL automatically deploy the web application to GitHub Pages on every push to the `main` branch.

#### Scenario: Successful Deployment
- **WHEN** code is pushed to `main` branch
- **THEN** GitHub Actions builds the application
- **AND** deploys to GitHub Pages at `https://zbbsdsb.github.io/MuseRock/`

#### Scenario: Build Failure
- **WHEN** the build process fails
- **THEN** GitHub Actions reports failure
- **AND** no deployment occurs
- **AND** repository maintainers receive notification

### Requirement: Base Path Configuration

The system SHALL serve the application under the `/MuseRock/` subpath to match the repository name.

#### Scenario: Asset Loading
- **WHEN** user visits `https://zbbsdsb.github.io/MuseRock/`
- **THEN** all assets (JS, CSS, images) load correctly
- **AND** no 404 errors for assets

### Requirement: SPA Routing Compatibility

The system SHALL support client-side routing on GitHub Pages.

#### Scenario: Direct Navigation
- **WHEN** user navigates directly to `https://zbbsdsb.github.io/MuseRock/app`
- **THEN** the application loads correctly
- **AND** displays the correct page

## MODIFIED Requirements

### Requirement: Vite Configuration

The Vite configuration SHALL be updated to support GitHub Pages deployment.

#### Scenario: Development Mode
- **WHEN** running `npm run dev` locally
- **THEN** application serves at `http://localhost:3000/`
- **AND** no base path prefix is applied

#### Scenario: Production Build
- **WHEN** running `npm run build`
- **THEN** all asset paths include `/MuseRock/` prefix
- **AND** index.html contains correct base tag

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                        │
│                    zbbsdsb/MuseRock                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐ │
│  │  main branch │ ───► │   CI/CD      │ ───► │  GitHub   │ │
│  │   push       │      │  Build+Test  │      │  Pages    │ │
│  └──────────────┘      └──────────────┘      └───────────┘ │
│                            │                      │         │
│                            ▼                      ▼         │
│                     ┌──────────────┐      ┌───────────┐   │
│                     │  typecheck   │      │  https:// │   │
│                     │  build       │      │zbbsdsb.github.│ │
│                     │  test        │      │io/MuseRock │   │
│                     └──────────────┘      └───────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## GitHub Actions Workflow

### Trigger Conditions

- Push to `main` branch
- Manual trigger via `workflow_dispatch`

### Environment Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `NODE_VERSION` | `20.x` | Node.js runtime |
| `APP_NAME` | `MuseRock` | Application identifier |

### Build Steps

1. Checkout code
2. Setup Node.js 20.x
3. Install dependencies (`npm ci`)
4. Run typecheck (`npm run typecheck`)
5. Build application (`npm run build`)
6. Deploy to GitHub Pages

## Rollback Strategy

In case of deployment failure:

1. GitHub Pages will continue serving the previous successful deployment
2. No downtime occurs
3. Previous deployment remains accessible at the same URL

## Security Considerations

1. **No secrets in Pages deployment**: GitHub Pages does not support environment secrets
2. **API Keys**: Users must configure their own API keys in the application UI
3. **Cloud Mode**: Requires self-hosted backend (not available on GitHub Pages)

## Limitations

| Feature | Status | Notes |
|---------|--------|-------|
| Static hosting only | ✅ Supported | GitHub Pages serves static files |
| Cloud Mode (backend API) | ❌ Not supported | Requires separate deployment |
| Custom domain | ⚠️ Optional | CNAME file can be added |
| Password protection | ❌ Not supported | Would require GitHub Pro |
| Analytics | ⚠️ External | Can add Google Analytics separately |

## Future Enhancements

- Add custom domain support (`muserock.app`)
- Integrate with Cloudflare for backend proxy
- Add Preview deployments for PRs
