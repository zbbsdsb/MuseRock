# 🎸 MuseRock: The Infinite Cerebral Quarry

> **Creators don't need tools. They need fire.**

MuseRock is an AI-powered creative collaboration platform designed for creators who demand more than ordinary writing tools. It combines distraction-free writing environments, intelligent inspiration engines, and asset sourcing capabilities to help you forge exceptional work.

[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Deploy](https://github.com/zbbsdsb/MuseRock/actions/workflows/deploy.yml/badge.svg)](https://github.com/zbbsdsb/MuseRock/deployments)

**Live Demo**: https://zbbsdsb.github.io/MuseRock/

---

## 🎯 Project Overview

MuseRock is not another "writing app." It is a high-octane collaboration engine that connects you directly to the raw, pulsating veins of human and artificial inspiration.

### Core Capabilities

| Module | Description |
|--------|-------------|
| **The Cloister** | Distraction-free, serif-heavy writing environment |
| **The Muse Engine** | AI-powered inspiration triggering and plot synthesis |
| **Asset Sourcing** | Research assistant for historical deep-cuts, scientific anomalies, and visual metaphors |
| **Memory System** | Five-layer memory architecture for persistent creative context |
| **Apprentice System** | AI agents that collaborate on creative tasks |

### Target Users

- **Writers** seeking AI assistance without losing creative control
- **Storytellers** building complex narratives with persistent world-building
- **Creators** who want intelligent inspiration, not generic suggestions

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | ≥18.0.0 | LTS recommended |
| npm | ≥9.0.0 | or pnpm ≥8.0 |
| Git | any recent | for version control |

### Installation

```bash
# Clone the repository
git clone https://github.com/zbbsdsb/muserock.git
cd muserock

# Install root dependencies
npm install

# Install web app dependencies
cd apps/web && npm install

# Install API dependencies
cd ../api && npm install

# Return to root and start development
cd ../..
```

### Running the Application

**Development Mode (both apps):**
```bash
npm run dev          # Start web app at http://localhost:3000
npm run dev:api     # Start API server at http://localhost:3001
```

**Production Build:**
```bash
npm run build        # Build web app
npm run build:api    # Build API server
```

### Configuration

1. Copy the environment template:
   ```bash
   cp apps/web/.env.example apps/web/.env
   cp apps/api/.env.example apps/api/.env
   ```

2. Open the Muse Configuration panel (press `⌘ + ,` on Mac or `Ctrl + ,` on Windows)
3. Select your preferred AI provider (Gemini, OpenAI, Anthropic, or Custom)
4. Enter your API key for the selected provider
5. Click "Confirm Configuration"

> **Security Note**: MuseRock supports two modes:
> - **Cloud Mode**: API keys stored securely server-side with AES-256-GCM encryption
> - **Local Mode**: API keys stored in browser's encrypted local storage
> Your keys are never transmitted to external servers except their respective AI providers.

---

## 🛠️ Tech Stack

### Core Technologies

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Frontend Framework** | React | 19.0.0 | UI component library |
| **Language** | TypeScript | 5.8.2 | Type-safe development |
| **Build Tool** | Vite | 6.2.0 | Fast development and building |
| **Styling** | Tailwind CSS | 4.1.14 | Utility-first CSS |
| **Animation** | Motion | 12.23.24 | Fluid UI transitions |
| **Markdown** | react-markdown | 10.1.0 | Markdown rendering |
| **Icons** | lucide-react | 0.546.0 | Consistent icon system |

### AI & Services

| Service | Package | Version | Purpose |
|---------|---------|---------|---------|
| **AI Generation** | @google/genai | 1.29.0 | Gemini Pro integration |
| **Authentication** | firebase | 12.12.1 | Google OAuth |
| **Export** | docx | 9.6.1 | Word document generation |
| **Export** | jspdf | 4.2.1 | PDF generation |
| **Export** | html2canvas | 1.4.1 | Screenshot capture |

### Development Tools

| Tool | Purpose |
|------|---------|
| **Type Checking** | TypeScript compiler |
| **Code Linting** | ESLint (planned) |
| **Testing** | Vitest + Playwright (planned) |

---

## 📁 Project Structure

```
muserock/
├── apps/
│   ├── api/                    # NestJS Backend API (BFF)
│   │   ├── src/
│   │   │   ├── ai/           # AI service adapters (Gemini, OpenAI, Anthropic)
│   │   │   ├── api-keys/     # API key encryption service
│   │   │   ├── apprentice/    # AI apprentice job system
│   │   │   ├── auth/         # OAuth authentication
│   │   │   ├── memory/       # 5-layer memory system
│   │   │   ├── mcp/          # Model Context Protocol gateway
│   │   │   ├── oasis/        # OasisBio integration
│   │   │   ├── observability/# Metrics and monitoring
│   │   │   ├── health/       # Health check endpoints
│   │   │   └── ...
│   │   └── package.json
│   └── web/                    # React Frontend
│       ├── src/
│       │   ├── App.tsx       # Main application component
│       │   ├── components/   # Reusable UI components
│       │   │   ├── stages/   # Creative Loop stage components
│       │   │   ├── editor/   # The Cloister writing editor
│       │   │   ├── layout/   # Navigation and layout
│       │   │   └── ...
│       │   ├── services/     # Business logic services
│       │   ├── stores/       # State management (Zustand)
│       │   ├── hooks/        # Custom React hooks
│       │   └── types/        # TypeScript type definitions
│       └── package.json
├── .github/
│   └── workflows/
│       └── ci.yml            # GitHub Actions CI/CD
├── docs/                      # Architecture documentation
└── package.json               # Root workspace configuration
```

---

## 🤝 Contributing

We welcome contributions from developers, designers, and creators.

### Development Workflow

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/your-username/muserock.git`
3. **Create a branch**: `git checkout -b feature/your-feature-name`
4. **Make your changes** following the code style
5. **Test** your changes: `npm run build`
6. **Commit**: `git commit -m "Add feature: description"`
7. **Push**: `git push origin feature/your-feature-name`
8. **Open a Pull Request**

### Code Standards

- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS utility classes
- **Commits**: Conventional Commits format
- **Reviews**: At least one approval required

### Reporting Issues

Please report bugs and feature requests via [GitHub Issues](https://github.com/zbbsdsb/muserock/issues).

---

## 📜 License

MuseRock is open source under the **GNU General Public License v3.0 (GPL-3.0)**.

### What This Means

| Permission | GPL-3.0 |
|------------|---------|
| Commercial use | ✅ Yes |
| Modification | ✅ Yes |
| Distribution | ✅ Yes |
| Patent use | ✅ Yes |
| Private use | ✅ Yes |
| **Share alike** | ✅ Must be |

### Third-Party Licenses

MuseRock uses the following open-source components:

| Package | License | Commercial Use |
|---------|---------|----------------|
| React | MIT | ✅ |
| TypeScript | Apache-2.0 | ✅ |
| Vite | MIT | ✅ |
| Tailwind CSS | MIT | ✅ |
| Motion | MIT | ✅ |
| Firebase | Apache-2.0 | ✅ |
| docx | MIT | ✅ |
| jspdf | Apache-2.0 | ✅ |

> **Note**: GPL-3.0 requires that derivative works be distributed under the same license. If you plan to embed MuseRock in a closed-source application, please contact us for commercial licensing options.

---

## 🙏 Attributions

MuseRock stands on the shoulders of giants:

- **Google** - Gemini AI and Firebase
- **Meta** - React framework
- **The Tailwind CSS team** - Design system
- **The Motion team** - Animation library
- **All open source contributors**

---

## 📮 Contact

- **GitHub**: [github.com/zbbsdsb/muserock](https://github.com/zbbsdsb/muserock)
- **Issues**: [GitHub Issues](https://github.com/zbbsdsb/muserock/issues)

---

## 📖 Further Reading

| Document | Description |
|----------|-------------|
| [Deployment Guide](docs/DEPLOYMENT.md) | GitHub Pages deployment and hosting |
| [API Documentation](docs/API_Documentation.md) | Complete API reference and endpoints |
| [Technical Architecture](docs/Technical_Architecture.md) | System architecture overview |
| [Creative Loop Guide](docs/Creative_Loop_Guide.md) | Guide to the 4-stage creative process |
| [Muse Engine Guide](docs/Muse_Engine_Guide.md) | AI-powered inspiration generation |

---

*"Everything that is, was once imagined."* — **MuseRock v1.0**