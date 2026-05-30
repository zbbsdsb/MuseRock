import {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectElement,
  Note,
  IdeaCard,
  ReflectionEntry,
  ProjectSettings,
  ProjectMetadata,
  PrimeBrief,
  LoopStage,
  DEFAULT_PROJECT_SETTINGS,
  DEFAULT_PROJECT_METADATA,
  DEFAULT_PRIME_BRIEF,
  PROJECT_TEMPLATES,
  ProjectTemplate,
} from './types.js';
import { StorageService, defaultStorage } from './storage-service.js';

function generateId(): string {
  return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export class ProjectModel {
  private storage: StorageService;

  constructor(storage?: StorageService) {
    this.storage = storage || defaultStorage;
  }

  async initialize(): Promise<void> {
    await this.storage.initialize();
  }

  createProject(input: CreateProjectInput): Project {
    const now = new Date().toISOString();
    const template = input.templateId
      ? PROJECT_TEMPLATES.find((t) => t.id === input.templateId)
      : null;

    const elements: ProjectElement[] = (template?.elements || []).map(
      (el, index) => ({
        id: generateId(),
        type: el.type || 'document',
        name: el.name || `Element ${index + 1}`,
        content: el.content || '',
        order: el.order ?? index,
        isExpanded: true,
        createdAt: now,
        updatedAt: now,
      })
    );

    const notes: Note[] = (template?.notes || []).map((note) => ({
      id: generateId(),
      content: note.content || '',
      tags: note.tags || [],
      linkedElements: [],
      status: note.status || 'draft',
      createdAt: now,
      updatedAt: now,
    }));

    const settings: ProjectSettings = {
      ...DEFAULT_PROJECT_SETTINGS,
      ...template?.settings,
    };

    const project: Project = {
      id: generateId(),
      name: input.name,
      description: input.description || '',
      createdAt: now,
      updatedAt: now,
      lastOpenedAt: now,
      isFavorite: false,
      isArchived: false,
      elements,
      notes,
      settings,
      metadata: {
        ...DEFAULT_PROJECT_METADATA,
        createdAt: now,
        lastEditAt: now,
        createdWith: template?.id,
      },
      prime: {
        ...DEFAULT_PRIME_BRIEF,
        ...template?.prime,
      },
      cloister: {
        content: '',
        lastEditAt: now,
      },
      divergence: [],
      reflection: [],
      config: {
        currentStage: 'cloister',
        stageHistory: [
          { stage: 'cloister', enteredAt: now, exitedAt: null },
        ],
        stageEnterCount: {
          prime: 0,
          cloister: 1,
          divergence: 0,
          reflection: 0,
        },
      },
    };

    return project;
  }

  async createAndSaveProject(input: CreateProjectInput): Promise<Project> {
    const project = this.createProject(input);
    await this.storage.saveProject(project);
    return project;
  }

  validateProject(project: Project): ValidationResult {
    const errors: string[] = [];

    if (!project.id || project.id.trim() === '') {
      errors.push('Project ID is required');
    }
    if (!project.name || project.name.trim() === '') {
      errors.push('Project name is required');
    }
    if (project.name.length > 100) {
      errors.push('Project name must be 100 characters or less');
    }
    if (project.description.length > 1000) {
      errors.push('Project description must be 1000 characters or less');
    }
    if (!this.isValidISOString(project.createdAt)) {
      errors.push('Invalid createdAt date');
    }
    if (!this.isValidISOString(project.updatedAt)) {
      errors.push('Invalid updatedAt date');
    }
    if (!this.isValidISOString(project.lastOpenedAt)) {
      errors.push('Invalid lastOpenedAt date');
    }

    project.elements.forEach((el, index) => {
      if (!el.id) errors.push(`Element ${index} has no ID`);
      if (!el.type) errors.push(`Element ${index} has no type`);
      if (!el.name) errors.push(`Element ${index} has no name`);
    });

    project.notes.forEach((note, index) => {
      if (!note.id) errors.push(`Note ${index} has no ID`);
    });

    project.divergence.forEach((card, index) => {
      if (!card.id) errors.push(`Idea card ${index} has no ID`);
      if (!card.content) errors.push(`Idea card ${index} has no content`);
    });

    project.reflection.forEach((entry, index) => {
      if (!entry.id) errors.push(`Reflection entry ${index} has no ID`);
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private isValidISOString(str: string): boolean {
    try {
      const date = new Date(str);
      return !isNaN(date.getTime()) && date.toISOString() === str;
    } catch {
      return false;
    }
  }

  updateProject(project: Project, input: UpdateProjectInput): Project {
    const now = new Date().toISOString();
    const updatedProject: Project = {
      ...project,
      updatedAt: now,
      name: input.name ?? project.name,
      description: input.description ?? project.description,
    };

    if (input.settings) {
      updatedProject.settings = { ...project.settings, ...input.settings };
    }

    if (input.prime) {
      updatedProject.prime = { ...project.prime, ...input.prime };
    }

    if (input.cloister) {
      updatedProject.cloister = {
        ...project.cloister,
        ...input.cloister,
        lastEditAt: now,
      };
    }

    if (input.divergence) {
      updatedProject.divergence = input.divergence;
    }

    if (input.reflection) {
      updatedProject.reflection = input.reflection;
    }

    if (input.config) {
      updatedProject.config = { ...project.config, ...input.config };
    }

    return updatedProject;
  }

  async updateAndSaveProject(
    projectId: string,
    input: UpdateProjectInput
  ): Promise<Project | null> {
    const project = await this.storage.loadProject(projectId);
    if (!project) return null;
    const updated = this.updateProject(project, input);
    await this.storage.saveProject(updated);
    return updated;
  }

  async getProject(projectId: string): Promise<Project | null> {
    return this.storage.loadProject(projectId);
  }

  async getAllProjects(): Promise<Project[]> {
    const ids = await this.storage.listProjects();
    const projects: Project[] = [];
    for (const id of ids) {
      const project = await this.storage.loadProject(id);
      if (project) {
        projects.push(project);
      }
    }
    return projects;
  }

  async deleteProject(projectId: string): Promise<boolean> {
    return this.storage.deleteProject(projectId);
  }

  addIdeaCard(
    project: Project,
    card: Omit<IdeaCard, 'id' | 'createdAt' | 'isKept'>
  ): Project {
    const now = new Date().toISOString();
    const newCard: IdeaCard = {
      ...card,
      id: generateId(),
      createdAt: now,
      isKept: null,
    };
    return {
      ...project,
      updatedAt: now,
      divergence: [...project.divergence, newCard],
    };
  }

  updateIdeaCard(
    project: Project,
    cardId: string,
    updates: Partial<IdeaCard>
  ): Project {
    const now = new Date().toISOString();
    return {
      ...project,
      updatedAt: now,
      divergence: project.divergence.map((card) =>
        card.id === cardId ? { ...card, ...updates } : card
      ),
    };
  }

  removeIdeaCard(project: Project, cardId: string): Project {
    const now = new Date().toISOString();
    return {
      ...project,
      updatedAt: now,
      divergence: project.divergence.filter((card) => card.id !== cardId),
    };
  }

  addReflection(
    project: Project,
    entry: Omit<ReflectionEntry, 'id' | 'createdAt'>
  ): Project {
    const now = new Date().toISOString();
    const newEntry: ReflectionEntry = {
      ...entry,
      id: generateId(),
      createdAt: now,
    };
    return {
      ...project,
      updatedAt: now,
      reflection: [...project.reflection, newEntry],
    };
  }

  setStage(project: Project, stage: LoopStage): Project {
    const now = new Date().toISOString();
    const updatedHistory = project.config.stageHistory.map((h, i) =>
      i === project.config.stageHistory.length - 1 && !h.exitedAt
        ? { ...h, exitedAt: now }
        : h
    );
    return {
      ...project,
      updatedAt: now,
      config: {
        ...project.config,
        currentStage: stage,
        stageHistory: [
          ...updatedHistory,
          { stage, enteredAt: now, exitedAt: null },
        ],
        stageEnterCount: {
          ...project.config.stageEnterCount,
          [stage]: project.config.stageEnterCount[stage] + 1,
        },
      },
    };
  }
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const defaultProjectModel = new ProjectModel();
