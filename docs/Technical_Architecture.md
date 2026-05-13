# MuseRock Technical Architecture

## System Overview

MuseRock is a modular, distributed system designed to provide creative assistance through AI-powered agents and advanced memory management. The system follows a monorepo architecture with clear separation of concerns between frontend, backend, and external services.

**Current Stage**: MVP (Minimum Viable Product)

## Architecture Diagram

```mermaid
flowchart TD
    subgraph Frontend [Frontend - React + TypeScript]
        App[App Component]
        Landing[Landing Page]
        RailNav[Rail Navigation]
        Cloister[The Cloister - Editor]
        PrimeBrief[Prime Brief Component]
        Divergence[Divergence Cards]
        Reflection[Reflection Panel]
        Export[Export Functions]
        Theme[Theme System]
        Auth[Auth UI]
    end

    subgraph StateManagement [State Management - Zustand]
        AppStore[App Store]
        AIStore[AI Store]
        AuthStore[Auth Store]
        CreativeLoopStore[Creative Loop Store]
        ThemeStore[Theme Store]
    end

    subgraph Backend [Backend - NestJS]
        BFF[BFF API Layer]
        AIProxy[AI Proxy Controller]
        ApiKeys[API Keys Controller]
        Health[Health Controller]
        AIService[AI Service]
        ModelAdapters[Model Adapter Factory]
        ApiKeysService[API Keys Service]
        HealthService[Health Service]
        Encryption[Encryption (AES-256-GCM)]
        MemoryLayers[5-Layer Memory (In-Memory)]
        Observability[Observability Service]
        Compliance[Compliance Service (Mock)]
        Apprentice[Apprentice Service]
        MCP[MCP Gateway (Scaffold)]
        Oasis[OasisBio (Scaffold)]
    end

    subgraph External [External Services]
        Gemini[Google Gemini]
        OpenAI[OpenAI]
        Anthropic[Anthropic]
        Firebase[Firebase Auth]
    end

    subgraph Storage [Data Storage]
        SQLite[SQLite (Dev)]
        LocalStorage[LocalStorage (Frontend)]
    end

    %% Frontend connections
    App --> Landing
    App --> RailNav
    App --> Cloister
    App --> PrimeBrief
    App --> Divergence
    App --> Reflection
    App --> Export
    App --> Theme
    App --> Auth

    App --> StateManagement
    StateManagement --> AppStore
    StateManagement --> AIStore
    StateManagement --> AuthStore
    StateManagement --> CreativeLoopStore
    StateManagement --> ThemeStore

    %% Frontend to Backend
    App --> BFF

    %% Backend connections
    BFF --> AIProxy
    BFF --> ApiKeys
    BFF --> Health
    BFF --> Observability

    AIProxy --> AIService
    ApiKeys --> ApiKeysService
    Health --> HealthService

    AIService --> ModelAdapters
    ModelAdapters --> Gemini
    ModelAdapters --> OpenAI
    ModelAdapters --> Anthropic

    ApiKeysService --> Encryption
    ApiKeysService --> SQLite

    %% Optional components
    Compliance --> MemoryLayers
    Apprentice --> AIService

    %% Storage
    AIStore --> LocalStorage
    AppStore --> LocalStorage
    CreativeLoopStore --> LocalStorage
    AuthStore --> LocalStorage
    ThemeStore --> LocalStorage

    Auth --> Firebase
```

## Component Details

### Frontend Layer

#### Web Application
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand with persistence to localStorage
- **Markdown Rendering**: react-markdown

**Key Components**:

- **App.tsx**: Main application orchestrator with Creative Loop stage routing
- **Landing.tsx**: Marketing and onboarding page
- **RailNav.tsx**: Navigation rail with Creative Loop stage indicators
- **Editor.tsx**: The Cloister - distraction-free writing environment
- **PrimeBrief.tsx**: Stage 1 - Intent setting and project definition
- **DivergenceCards.tsx**: Stage 3 - AI-powered idea generation
- **ReflectionPanel.tsx**: Stage 4 - Session reflection and logging
- **SettingsModal.tsx**: Configuration panel for AI providers and themes

#### Landing Page
- Marketing copy and onboarding
- Feature highlights
- Quick start CTA
- Theme toggle

#### Creative Loop State Machine
- **Stages**: Prime → Cloister → Divergence → Reflection
- **Persistence**: Zustand middleware persists to localStorage
- **History**: Tracks stage entry/exit times and duration

#### Export Functions
- Markdown export
- Word (.docx) export via dynamic import
- PDF export via html2canvas + jsPDF

#### Theme System
- **Light Mode**: Default, clean interface
- **Dark Mode**: Eye-friendly dark theme
- **Semantic Tokens**: `bg-brand-paper`, `text-brand-black` instead of hardcoded colors

---

### State Management

#### App Store
- Active project management
- UI state
- Navigation

#### AI Store
- AI provider configuration
- API keys (Local Mode only)
- Generation history
- Idea cards

#### Auth Store
- User authentication state
- Firebase integration

#### Creative Loop Store
- Current stage
- Stage history and timing
- Prime brief data
- Idea cards
- Reflection entries

#### Theme Store
- Active theme
- Theme preferences

---

### Backend Layer

#### NestJS BFF (Backend for Frontend)
- **Framework**: NestJS with TypeScript
- **Architecture**: Modular feature-based modules
- **API Style**: REST + tRPC (planned)
- **WebSocket**: Socket.io for MCP (coming soon)

#### AI Proxy Controller
- Routes AI requests through backend
- Retrieves encrypted API keys
- Validates requests
- Error handling

#### API Keys Controller
- `POST /api-keys`: Save encrypted API key
- `GET /api-keys`: List configured keys
- `DELETE /api-keys/:provider`: Delete key
- Encryption: AES-256-GCM

#### Health Controller
- `GET /health`: Liveness probe
- `GET /health/ready`: Readiness probe

#### AI Service
- Multi-provider AI generation
- Prompt registry
- Token usage tracking
- Error recovery

#### Model Adapter Factory
- **Gemini Adapter**: Google Gemini API integration
- **OpenAI Adapter**: OpenAI API integration
- **Anthropic Adapter**: Claude API integration via fetch
- **Base Adapter**: Common interface for all providers

#### Memory Service (MVP)
- **5-Layer Architecture**: Working, Episodic, Contextual, Knowledge, Compliance
- **Current Storage**: In-memory Map (data lost on restart)
- **Future**: PostgreSQL + pgvector for persistence

#### Apprentice Service
- Job queue system
- Event-driven processing
- Agent lifecycle management

#### Compliance Service (Mock)
- Security checks
- OWASP Top 10 (mock implementation)

#### Observability Service
- Metrics collection
- Logging
- Prometheus endpoint

#### MCP Gateway (Scaffold)
- JSON-RPC protocol
- Method handlers (skeleton)
- WebSocket support (planned)

#### OasisBio Adapter (Scaffold)
- OAuth PKCE flow
- Session management
- Placeholder for future integration

---

### Data Storage

#### SQLite (Development)
- API keys table
- OAuth sessions
- Future: Memory persistence

#### localStorage (Frontend)
- User preferences
- Writing content
- Idea cards
- Creative loop state
- Theme settings
- API keys (Local Mode only)

---

### External Services

#### AI Providers
- **Gemini**: @google/genai SDK
- **OpenAI**: openai SDK
- **Anthropic**: Direct fetch API

#### Authentication
- **Firebase Auth**: Google sign-in
- **Future**: OasisBio OAuth

---

## Data Flow

### AI Generation Flow (Cloud Mode)

```
1. User writes prompt in frontend
2. Frontend sends to POST /ai/generate
3. BFF retrieves encrypted API key from DB
4. BFF decrypts API key
5. BFF calls appropriate AI provider
6. AI provider returns response
7. BFF returns response to frontend
8. Frontend displays result
```

### AI Generation Flow (Local Mode)

```
1. User writes prompt in frontend
2. Frontend retrieves API key from localStorage
3. Frontend calls AI provider directly
4. AI provider returns response
5. Frontend displays result
```

### Creative Loop Flow

```
1. User enters Prime stage
2. Sets intent, constraints, references
3. Moves to Cloister - writes
4. Moves to Divergence - generates ideas
5. Keeps/discards cards
6. Moves to Reflection - logs session
7. Optionally repeats the loop
```

---

## Security Architecture

### Authentication & Authorization
- **OAuth PKCE**: Secure third-party auth (planned)
- **Local Mode**: No auth needed, fully client-side
- **Cloud Mode**: JWT-based auth (planned)

### Data Security
- **Encryption**: AES-256-GCM for stored API keys
- **httpOnly Cookies**: For tokens (future)
- **Data Sanitization**: Input validation
- **No Secrets in Frontend**: API keys never hardcoded in bundle

### API Security
- **Rate Limiting**: Planned
- **Request Validation**: Zod schemas (planned)
- **Error Handling**: No sensitive info in error messages
- **CORS**: Configured for development

---

## Development Architecture

### Monorepo Structure
```
muserock/
├── apps/
│   ├── api/                    # NestJS Backend
│   │   ├── src/
│   │   │   ├── ai/            # AI adapters & service
│   │   │   ├── api-keys/      # Key management
│   │   │   ├── apprentice/    # Agent system
│   │   │   ├── auth/          # Authentication
│   │   │   ├── memory/        # 5-layer memory
│   │   │   ├── mcp/           # Model Context Protocol
│   │   │   ├── oasis/         # OasisBio integration
│   │   │   ├── health/        # Health checks
│   │   │   └── observability/ # Metrics
│   │   └── package.json
│   └── web/                    # React Frontend
│       ├── src/
│       │   ├── components/    # UI components
│       │   ├── services/      # Business logic
│       │   ├── stores/        # Zustand stores
│       │   ├── utils/         # Helpers
│       │   └── App.tsx
│       └── package.json
├── docs/                       # Documentation
└── package.json
```

### Build & Dev Tools
- **Root package.json**: Shared scripts for build, dev, typecheck
- **Vite**: Frontend build
- **TypeScript**: Strict type checking
- **Vitest**: Testing framework
- **ESLint**: Linting (planned)

---

## Testing Architecture

### Backend Testing
- **Framework**: Vitest
- **Test Files**: *.test.ts alongside source
- **Coverage**: Health, API Keys, Auth services
- **Mocks**: TypeORM repositories, ConfigService

### Frontend Testing
- **Framework**: Vitest
- **Test Files**: *.test.ts alongside stores
- **Coverage**: Store logic tests
- **Mocks**: localStorage, external services

### CI/CD
- **GitHub Actions**: Automated builds & tests
- **Status Checks**: Typecheck, build, test required before merge

---

## Future Architecture (Post-MVP)

### Planned Additions

#### Persistence Layer
- PostgreSQL database
- pgvector for embeddings
- Redis for caching
- Migration system

#### MCP Gateway
- Full JSON-RPC implementation
- WebSocket real-time
- Plugin system
- Audit logging

#### Apprentice System
- BullMQ job queue
- Agent execution engine
- Budget & timeout controls

#### Memory Engine
- Vector similarity search
- ACL & sensitivity filtering
- Persistence across restarts

#### Observability
- Prometheus metrics
- Grafana dashboards
- OpenTelemetry tracing

---

## Current Status

### ✅ Complete for MVP
- Frontend Creative Loop
- Multi-provider AI integration
- Cloud/Local mode switching
- API key encryption
- Health check endpoints
- Dark theme support
- Export functions (Markdown, Word, PDF)
- Basic test suite

### 🔄 In Progress
- CI/CD pipeline refinement
- Additional test coverage

### 📋 Planned (Post-MVP)
- PostgreSQL + pgvector
- Redis integration
- MCP Gateway implementation
- Apprentice job queue
- Full observability stack
- Compliance & security hardening

---

*Document updated on: 2026-05-13*
*Version: 2.0 (MVP)*
*Author: MuseRock Team*