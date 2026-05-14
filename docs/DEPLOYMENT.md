# MuseRock Deployment Guide

## Overview

MuseRock is deployed to GitHub Pages for easy public access. The deployment is automated via GitHub Actions and triggers on every push to the `main` branch.

**Live URL**: https://zbbsdsb.github.io/MuseRock/

## Deployment Architecture

```
Push to main → GitHub Actions → Build → GitHub Pages
                                      ↓
                              https://zbbsdsb.github.io/MuseRock/
```

## Automated Deployment

### How It Works

1. **Push to main**: Every push to the `main` branch triggers the deployment workflow
2. **Build**: GitHub Actions builds the web application with `VITE_GITHUB_PAGES=true`
3. **Deploy**: The built files are deployed to GitHub Pages

### Deployment Workflow

The deployment is handled by `.github/workflows/deploy.yml`:

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:
```

### Environment Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `VITE_GITHUB_PAGES` | `true` | Enable GitHub Pages mode in Vite |

## Local Development

### Running Locally

```bash
# Install dependencies
npm install
cd apps/web && npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000/`.

### Building for Production

```bash
# Build for local use (no base path)
cd apps/web && npm run build

# Build for GitHub Pages (with /MuseRock/ base path)
cd apps/web && VITE_GITHUB_PAGES=true npm run build
```

## GitHub Pages Configuration

### Repository Settings

GitHub Pages must be enabled in the repository settings:

1. Go to **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. The deployment workflow will handle the rest

### Custom Domain (Optional)

To use a custom domain:

1. Create a `static/CNAME` file with your domain:
   ```
   muserock.app
   ```
2. Configure your DNS provider to point to GitHub Pages
3. Update repository settings with your custom domain

## Limitations

| Feature | Status | Notes |
|---------|--------|-------|
| Static hosting only | ✅ Supported | GitHub Pages serves static files |
| Cloud Mode (backend API) | ❌ Not supported | Requires separate backend deployment |
| Custom domain | ⚠️ Optional | CNAME file can be added |
| Password protection | ❌ Not supported | Would require GitHub Pro |
| Analytics | ⚠️ External | Can add Google Analytics separately |

## Troubleshooting

### Build Fails

Check the GitHub Actions logs for errors:

1. Go to **Actions** tab in the repository
2. Click on the failed workflow run
3. Expand the failed step to see the error

### Assets Not Loading

If assets (CSS, JS) are returning 404 errors:

1. Verify the `<base href="/MuseRock/">` tag is in `index.html`
2. Check that `VITE_GITHUB_PAGES=true` is set in the workflow
3. Ensure the build output is in `apps/web/dist`

### SPA Routing Issues

GitHub Pages doesn't support server-side routing. All routes are handled client-side by React.

If direct URL navigation doesn't work:

1. Ensure the `<base>` tag is correctly set
2. Check that React Router is using `BrowserRouter` (not `HashRouter`)

## Security Notes

### API Keys

- **Local Mode**: API keys are stored in browser localStorage
- **Cloud Mode**: Requires self-hosted backend (not available on GitHub Pages)

### Public Repository

This repository is public. Do not commit:
- API keys
- Secrets
- Credentials

## Future Enhancements

- [ ] Custom domain support (`muserock.app`)
- [ ] Preview deployments for pull requests
- [ ] Cloudflare integration for backend API
- [ ] Google Analytics integration

---

*Document updated on: 2026-05-13*
*Version: 1.0*
*Author: MuseRock Team*