# MuseRock Project Overview

## Project Description

MuseRock is a creative assistance tool designed to help users with various creative tasks, including writing, design, research, and music creation. It integrates advanced AI models and memory systems to provide intelligent assistance throughout the creative process.

## Core Features

### 1. MuseSoda Memory Engine
- **5-Layer Memory Architecture**:
  - Working Memory: Short-term memory for current tasks
  - Episodic Memory: Event-based memory for past experiences
  - Contextual Memory: Context-aware memory for understanding relationships
  - Knowledge Memory: Structured knowledge storage
  - Compliance Memory: Secure storage for sensitive information
- **ACL and Sensitivity Filtering**: All memory operations go through access control and sensitivity level filtering
- **Vector Search**: Integration with pgvector for semantic search capabilities

### 2. Apprentice System
- **Role-Based Agents**: Specialized agents for different creative tasks (researcher, writer, designer, musician)
- **Job Queue**: Asynchronous task processing with concurrency control
- **Budget Management**: Token budget control for AI model usage
- **Timeout Control**: Execution timeout management
- **Review Modes**: Auto and manual review modes for task results

### 3. OasisBio Integration
- **OAuth 2.0 + PKCE Authentication**: Secure third-party authentication
- **User Profile Sync**: Synchronization with OasisBio user profiles
- **Bio Asset Access**: Access to biological assets through OasisBio API
- **Personalized Recommendations**: Tailored recommendations based on user data

### 4. MCP Gateway
- **JSON-RPC Protocol**: Standardized API communication
- **Batch Request Processing**: Efficient handling of multiple requests
- **Rate Limiting**: Protection against API abuse
- **Comprehensive Error Handling**: Detailed error reporting and handling

### 5. Observability Stack
- **Logging**: Comprehensive system logging
- **Metrics Collection**: Performance and usage metrics
- **Tracing**: Distributed tracing for debugging
- **Health Checks**: System health monitoring

## Technical Stack

### Frontend
- **Framework**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: Local Storage (client-side)
- **UI Components**: Custom components with Lucide icons

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Authentication**: OAuth 2.0 + PKCE, Firebase Auth
- **AI Integration**: OpenAI, Gemini, Anthropic APIs
- **Database**: PostgreSQL (planned for persistence)
- **Vector Search**: pgvector

### DevOps
- **CI/CD**: GitHub Actions
- **Deployment**: Containerized deployment
- **Monitoring**: Prometheus/Grafana (planned)
- **Security**: OWASP Top 10 compliance

## Project Structure

```
MuseRock/
├── apps/
│   ├── api/          # Backend API service (NestJS)
│   └── web/          # Frontend application (React)
├── packages/         # Shared packages
├── infra/            # Infrastructure configuration
├── .trae/            # Trae configuration
├── planning/         # Project planning documents
└── docs/             # Project documentation
```

## Use Cases

### 1. Creative Writing Assistance
- Generate plot ideas and character development
- Provide atmospheric descriptions and dialogue suggestions
- Assist with editing and revision

### 2. Research Support
- Gather information on specific topics
- Analyze and summarize research materials
- Generate citations and references

### 3. Design Inspiration
- Generate design concepts and style guides
- Provide color palette and typography suggestions
- Assist with layout and composition

### 4. Music Creation
- Generate musical ideas and themes
- Provide genre-specific suggestions
- Assist with arrangement and production

## Target Users

- **Writers**: Authors, bloggers, content creators
- **Designers**: Graphic designers, UI/UX designers
- **Researchers**: Academic researchers, students
- **Musicians**: Composers, songwriters, producers
- **Creative Professionals**: Anyone involved in creative work

## Development Roadmap

### Phase 1: Baseline Fixes
- Complete missing files
- Fix security issues
- Establish build and test baseline

### Phase 2: BFF & Identity Gateway
- Implement NestJS BFF
- Authentication and session management
- OasisBio OAuth integration

### Phase 3: MuseSoda/Apprentice/OasisBio
- Build memory engine
- Develop apprentice system
- Integrate OasisBio adapter

### Phase 4: MCP & Observability
- Implement MCP Gateway
- Build observability stack

### Phase 5: Compliance & Open Source Governance
- Establish compliance framework
- Implement open source governance

## Conclusion

MuseRock is a comprehensive creative assistance tool that leverages advanced AI and memory systems to support users throughout their creative journey. With its modular architecture and powerful features, it provides a flexible and intelligent platform for a wide range of creative tasks.

---

*Document updated on: 2026-04-27*
*Version: 1.0*
*Author: MuseRock Team*