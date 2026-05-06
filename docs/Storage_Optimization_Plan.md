# Storage Optimization Plan

## 1. Current Status

### 1.1 Frontend Storage (Primary)
- **Technology**: localStorage
- **Scope**: Project data, user preferences, UI state
- **Key File**: `apps/web/src/services/projectRepository.ts`
- **Storage Key**: `muserock_projects`

### 1.2 Backend Storage (Incomplete)
| Component | Current Implementation | Target |
|-----------|----------------------|--------|
| Database | SQLite (memory Map) | PostgreSQL + pgvector |
| Cache | Not implemented | Redis |
| File Storage | Not implemented | Firebase Storage |
| Memory Layer | In-memory Map | Persistent storage |

### 1.3 Known Issues
- Data loss on browser cache clear or device switch
- 5MB localStorage capacity limit
- No cross-device synchronization
- No backup mechanism

---

## 2. Optimization Roadmap

### Phase 1: Local Export Enhancement
**Timeline**: 1-2 days
**Priority**: High

#### Tasks
1. **Export Format Expansion**
   - Current: JSON only
   - Add: YAML, Markdown support
   - File: `apps/web/src/services/importExport.ts`

2. **Desktop Save Support**
   - Implement File System Access API
   - Allow direct save to user desktop
   - Add auto-export reminder feature

3. **Import/Export Improvements**
   - Validate imported data structure
   - Add merge/replace option
   - Support batch export

#### Deliverables
- Enhanced export modal with format selection
- Desktop save functionality
- Import validation and error handling

---

### Phase 2: Cloud Storage Integration
**Timeline**: 3-5 days
**Priority**: High

#### Tasks
1. **Dropbox Integration**
   - Integrate Dropbox SDK (`dropbox` npm package)
   - Implement OAuth 2.0 flow
   - Add "Export to Dropbox" button in ProjectDetail
   - Support import from Dropbox

2. **Google Drive Integration** (Optional)
   - Similar implementation pattern
   - User preference storage

#### API Design
```typescript
interface CloudExportService {
  exportToDropbox(projectId: string): Promise<string>;
  importFromDropbox(filePath: string): Promise<Project>;
  exportToGoogleDrive(projectId: string): Promise<string>;
  importFromGoogleDrive(fileId: string): Promise<Project>;
}
```

#### Deliverables
- Dropbox export/import functionality
- OAuth callback handling
- Cloud file browser modal

---

### Phase 3: Backend Synchronization
**Timeline**: 5-7 days
**Priority**: Medium

#### Tasks
1. **Database Migration**
   - Migrate from SQLite to PostgreSQL
   - Add pgvector extension for vector search
   - Create database migration scripts
   - Update TypeORM configuration

2. **Memory Layer Persistence**
   - Connect 5-layer memory to PostgreSQL
   - Implement vector storage for semantic search
   - Add data synchronization mechanism

3. **Redis Integration**
   - Session management
   - Rate limiting counters
   - Cache frequently accessed data

4. **Authentication Enhancement**
   - Complete OAuth flow
   - Token management with httpOnly cookies
   - Session persistence

#### Deliverables
- PostgreSQL + pgvector database
- Persistent memory layer
- Redis caching layer
- Complete user authentication flow

---

## 3. Implementation Details

### 3.1 Local Export Enhancement

#### File: `apps/web/src/services/importExport.ts`
```typescript
export type ExportFormat = 'json' | 'yaml' | 'markdown';

export interface ExportOptions {
  format: ExportFormat;
  includeMetadata: boolean;
  prettyPrint: boolean;
}

export async function exportProject(
  projectId: string,
  options: ExportOptions
): Promise<Blob | null>;

export async function saveToDesktop(
  projectId: string,
  options: ExportOptions
): Promise<boolean>;
```

### 3.2 Dropbox Integration

#### File: `apps/web/src/services/cloudExport.ts`
```typescript
import { Dropbox } from 'dropbox';

export class DropboxService {
  private dbx: Dropbox;

  constructor(accessToken: string) {
    this.dbx = new Dropbox({ accessToken });
  }

  async uploadProject(project: Project, format: ExportFormat): Promise<string>;
  async listProjects(): Promise<CloudFile[]>;
  async downloadProject(path: string): Promise<Project>;
}
```

### 3.3 Database Schema (PostgreSQL)

```sql
-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  settings JSONB,
  is_archived BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_opened_at TIMESTAMP DEFAULT NOW()
);

-- Project elements table
CREATE TABLE project_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  content JSONB NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Memory items with vector embedding
CREATE TABLE memory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  metadata JSONB,
  embedding VECTOR(1536),
  sensitivity VARCHAR(20) DEFAULT 'public',
  layer VARCHAR(50) NOT NULL,
  user_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for vector similarity search
CREATE INDEX memory_items_embedding_idx ON memory_items USING ivfflat (embedding vector_cosine_ops);
```

---

## 4. File Structure

```
apps/web/src/services/
├── projectRepository.ts      # Existing - localStorage operations
├── importExport.ts          # New - export format enhancement
├── cloudExport.ts           # New - Dropbox/Google Drive integration
└── syncService.ts           # Future - backend synchronization

apps/api/src/
├── database/
│   ├── migrations/          # Database migration scripts
│   └── entities/            # TypeORM entities
├── memory/
│   └── layers/             # 5-layer memory (to be persisted)
└── storage/
    └── fileStorage.service.ts  # Firebase Storage integration
```

---

## 5. Testing Plan

### 5.1 Unit Tests
- Export format validation
- Data serialization/deserialization
- Cloud upload/download

### 5.2 Integration Tests
- Dropbox OAuth flow
- Database migration
- Memory layer persistence

### 5.3 E2E Tests
- Full export workflow
- Cloud import/export cycle

---

## 6. Rollback Plan

| Phase | Rollback Action |
|-------|-----------------|
| Phase 1 | Revert to current export format |
| Phase 2 | Remove cloud SDK integration |
| Phase 3 | Revert to SQLite, disable cloud sync |

---

## 7. Dependencies

| Package | Purpose | Phase |
|---------|---------|-------|
| `dropbox` | Dropbox SDK | 2 |
| `js-yaml` | YAML export | 1 |
| `file-saver` | Desktop save | 1 |
| `pg` | PostgreSQL driver | 3 |
| `typeorm` | ORM (existing) | 3 |
| `ioredis` | Redis client | 3 |

---

## 8. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Cloud SDK breaking changes | Medium | Pin version, monitor updates |
| Data migration failure | High | Full backup before migration |
| localStorage quota exceeded | Medium | Implement data pruning |
| OAuth token expiration | Low | Implement refresh token flow |

---

*Document created: 2026-05-06*
*Version: 1.0*
*Status: Planned*
