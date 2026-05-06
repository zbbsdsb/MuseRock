export interface Project {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
  lastOpenedAt: Date;
  isFavorite: boolean;
  isArchived: boolean;
  elements: ProjectElement[];
  notes: Note[];
  settings: ProjectSettings;
  metadata: ProjectMetadata;
}

export interface ProjectMetadata {
  wordCount: number;
  characterCount: number;
  elementCount: number;
  lastEditSession: string;
  collaboratorCount: number;
  version: number;
  exportCount: number;
  lastEditAt: Date;
  createdAt: Date;
  createdWith?: string;
}

export interface ProjectSettings {
  isPublic: boolean;
  allowComments: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  fontFamily: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: 'novel' | 'script' | 'essay' | 'blank';
  elements: Partial<ProjectElement>[];
  notes: Partial<Note>[];
  settings: Partial<ProjectSettings>;
}

export type ElementType = 'document' | 'section' | 'chapter' | 'scene' | 'paragraph' | 'list' | 'quote' | 'image' | 'video' | 'link' | 'code' | 'table' | 'divider' | 'canvas' | 'card' | 'audio';

export interface ProjectElement {
  id: string;
  type: ElementType;
  name: string;
  content: string;
  order: number;
  isExpanded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  content: string;
  tags: string[];
  linkedElements: string[];
  status: 'draft' | 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectDTO {
  name: string;
  description?: string;
  templateId?: string;
}

export interface UpdateProjectDTO {
  name?: string;
  description?: string;
  settings?: Partial<ProjectSettings>;
}

export interface ProjectFilters {
  status?: 'all' | 'active' | 'archived';
  favorites?: boolean;
  dateRange?: { start: Date; end: Date };
  tags?: string[];
}

export interface ListOptions {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'updatedAt' | 'createdAt' | 'lastOpenedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ProjectList {
  projects: Project[];
  total: number;
  page: number;
  totalPages: number;
}

export const DEFAULT_PROJECT_SETTINGS: ProjectSettings = {
  isPublic: false,
  allowComments: false,
  autoSave: true,
  autoSaveInterval: 30,
  theme: 'system',
  fontSize: 14,
  fontFamily: 'serif',
};

export const DEFAULT_PROJECT_METADATA: ProjectMetadata = {
  wordCount: 0,
  characterCount: 0,
  elementCount: 0,
  lastEditSession: '',
  collaboratorCount: 0,
  version: 1,
  exportCount: 0,
  lastEditAt: new Date(),
  createdAt: new Date(),
};

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Project',
    description: 'Start from scratch with an empty project',
    thumbnail: '',
    category: 'blank',
    elements: [],
    notes: [],
    settings: {},
  },
  {
    id: 'novel',
    name: 'Novel',
    description: 'Multi-chapter novel structure with character tracking',
    thumbnail: '',
    category: 'novel',
    elements: [
      { type: 'document', name: 'Chapter 1', order: 0 },
      { type: 'document', name: 'Characters', order: 1 },
      { type: 'document', name: 'World Notes', order: 2 },
    ],
    notes: [{ status: 'draft', tags: ['outline'] }],
    settings: {},
  },
  {
    id: 'script',
    name: 'Screenplay',
    description: 'Scene-based script with formatting',
    thumbnail: '',
    category: 'script',
    elements: [
      { type: 'document', name: 'Title Page', order: 0 },
      { type: 'document', name: 'Act 1', order: 1 },
      { type: 'document', name: 'Act 2', order: 2 },
    ],
    notes: [],
    settings: {},
  },
  {
    id: 'essay',
    name: 'Essay',
    description: 'Academic essay with outline and citations',
    thumbnail: '',
    category: 'essay',
    elements: [
      { type: 'document', name: 'Introduction', order: 0 },
      { type: 'document', name: 'Body', order: 1 },
      { type: 'document', name: 'Conclusion', order: 2 },
    ],
    notes: [],
    settings: {},
  },
];

export function createProject(data: CreateProjectDTO): Project {
  const now = new Date();
  const template = data.templateId
    ? PROJECT_TEMPLATES.find((t) => t.id === data.templateId)
    : null;

  return {
    id: crypto.randomUUID(),
    name: data.name,
    description: data.description || '',
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now,
    isFavorite: false,
    isArchived: false,
    elements: (template?.elements || []).map((el, index) => ({
      id: crypto.randomUUID(),
      type: el.type || 'document',
      name: el.name || `Element ${index + 1}`,
      content: el.content || '',
      order: el.order ?? index,
      isExpanded: true,
      createdAt: now,
      updatedAt: now,
    })),
    notes: (template?.notes || []).map((note) => ({
      id: crypto.randomUUID(),
      content: note.content || '',
      tags: note.tags || [],
      linkedElements: [],
      status: note.status || 'draft',
      createdAt: now,
      updatedAt: now,
    })),
    settings: { ...DEFAULT_PROJECT_SETTINGS, ...template?.settings },
    metadata: { ...DEFAULT_PROJECT_METADATA },
  };
}

export function createProjectFromTemplate(
  template: ProjectTemplate,
  projectName: string,
  description: string = ''
): Project {
  const now = new Date();
  const elements: ProjectElement[] = template.elements.map((el, i) => ({
    id: `el-${i}-${now.getTime()}`,
    type: el.type as ElementType,
    name: el.name || `New ${el.type}`,
    content: el.content || '',
    order: el.order || i,
    isExpanded: true,
    createdAt: now,
    updatedAt: now
  }));

  const notes: Note[] = (template.notes || []).map((note, i) => ({
    id: `note-${i}-${now.getTime()}`,
    content: note.content || '',
    status: (note.status || 'draft') as any,
    tags: note.tags || [],
    linkedElements: [],
    createdAt: now,
    updatedAt: now
  }));

  return {
    id: `project-${now.getTime()}`,
    name: projectName,
    description,
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now,
    isFavorite: false,
    isArchived: false,
    elements,
    notes,
    settings: { ...DEFAULT_PROJECT_SETTINGS, ...template.settings },
    metadata: { 
      ...DEFAULT_PROJECT_METADATA, 
      createdWith: template.id,
      createdAt: now,
      lastEditAt: now
    }
  };
}

export interface ProjectExport {
  version: '1.0';
  exportedAt: string;
  project: {
    name: string;
    description: string;
    settings: ProjectSettings;
    elements: ProjectElement[];
    notes: Note[];
  };
}
