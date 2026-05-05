import {
  Project,
  ProjectElement,
  Note,
  CreateProjectDTO,
  UpdateProjectDTO,
  ProjectFilters,
  ListOptions,
  ProjectList,
  createProject as createProjectInstance,
} from '../types/project';

const STORAGE_KEY = 'muserock_projects';

export interface ProjectRepository {
  create(data: CreateProjectDTO): Project;
  getById(id: string): Project | null;
  getAll(options?: ListOptions): ProjectList;
  update(id: string, data: UpdateProjectDTO): Project | null;
  delete(id: string): boolean;
  toggleFavorite(id: string): Project | null;
  archive(id: string): Project | null;
  unarchive(id: string): Project | null;
  search(query: string): Project[];
  filter(filters: ProjectFilters): Project[];
  addElement(projectId: string, element: Omit<ProjectElement, 'id' | 'createdAt' | 'updatedAt'>): Project | null;
  updateElement(projectId: string, elementId: string, data: Partial<ProjectElement>): Project | null;
  removeElement(projectId: string, elementId: string): Project | null;
  reorderElements(projectId: string, elementIds: string[]): Project | null;
  addNote(projectId: string, note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Project | null;
  updateNote(projectId: string, noteId: string, data: Partial<Note>): Project | null;
  removeNote(projectId: string, noteId: string): Project | null;
  exportProject(id: string): string | null;
  importProject(jsonString: string): Project | null;
}

function getStoredProjects(): Project[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const projects = JSON.parse(stored);
    return projects.map((p: Project) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
      lastOpenedAt: new Date(p.lastOpenedAt),
      elements: p.elements.map((e: ProjectElement) => ({
        ...e,
        createdAt: new Date(e.createdAt),
        updatedAt: new Date(e.updatedAt),
      })),
      notes: p.notes.map((n: Note) => ({
        ...n,
        createdAt: new Date(n.createdAt),
        updatedAt: new Date(n.updatedAt),
      })),
    }));
  } catch {
    return [];
  }
}

function saveProjects(projects: Project[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function sortProjects(projects: Project[], options?: ListOptions): Project[] {
  if (!options?.sortBy) return projects;

  const sorted = [...projects];
  const sortFn = (a: Project, b: Project) => {
    let comparison = 0;
    switch (options.sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'updatedAt':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'lastOpenedAt':
        comparison = new Date(a.lastOpenedAt).getTime() - new Date(b.lastOpenedAt).getTime();
        break;
    }
    return options.sortOrder === 'desc' ? -comparison : comparison;
  };
  return sorted.sort(sortFn);
}

export const projectRepository: ProjectRepository = {
  create(data: CreateProjectDTO): Project {
    const projects = getStoredProjects();
    const newProject = createProjectInstance(data);
    projects.unshift(newProject);
    saveProjects(projects);
    return newProject;
  },

  getById(id: string): Project | null {
    const projects = getStoredProjects();
    return projects.find(p => p.id === id) || null;
  },

  getAll(options?: ListOptions): ProjectList {
    const projects = getStoredProjects();
    const sorted = sortProjects(projects, options);
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;
    return {
      projects: sorted.slice(start, end),
      total: projects.length,
      page,
      totalPages: Math.ceil(projects.length / limit),
    };
  },

  update(id: string, data: UpdateProjectDTO): Project | null {
    const projects = getStoredProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return null;

    projects[index] = {
      ...projects[index],
      ...data,
      settings: data.settings
        ? { ...projects[index].settings, ...data.settings }
        : projects[index].settings,
      updatedAt: new Date(),
    };
    saveProjects(projects);
    return projects[index];
  },

  delete(id: string): boolean {
    const projects = getStoredProjects();
    const filtered = projects.filter(p => p.id !== id);
    if (filtered.length === projects.length) return false;
    saveProjects(filtered);
    return true;
  },

  toggleFavorite(id: string): Project | null {
    const projects = getStoredProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return null;

    projects[index] = {
      ...projects[index],
      isFavorite: !projects[index].isFavorite,
      updatedAt: new Date(),
    };
    saveProjects(projects);
    return projects[index];
  },

  archive(id: string): Project | null {
    const projects = getStoredProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return null;

    projects[index] = {
      ...projects[index],
      isArchived: true,
      updatedAt: new Date(),
    };
    saveProjects(projects);
    return projects[index];
  },

  unarchive(id: string): Project | null {
    const projects = getStoredProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return null;

    projects[index] = {
      ...projects[index],
      isArchived: false,
      updatedAt: new Date(),
    };
    saveProjects(projects);
    return projects[index];
  },

  search(query: string): Project[] {
    const projects = getStoredProjects();
    const lowerQuery = query.toLowerCase();
    return projects.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.notes.some(n => n.content.toLowerCase().includes(lowerQuery))
    );
  },

  filter(filters: ProjectFilters): Project[] {
    let projects = getStoredProjects();

    if (filters.status === 'archived') {
      projects = projects.filter(p => p.isArchived);
    } else if (filters.status === 'active') {
      projects = projects.filter(p => !p.isArchived);
    }

    if (filters.favorites) {
      projects = projects.filter(p => p.isFavorite);
    }

    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      projects = projects.filter(p => {
        const date = new Date(p.updatedAt);
        return date >= start && date <= end;
      });
    }

    if (filters.tags && filters.tags.length > 0) {
      projects = projects.filter(p =>
        p.notes.some(n => n.tags.some(t => filters.tags!.includes(t)))
      );
    }

    return projects;
  },

  addElement(projectId: string, element: Omit<ProjectElement, 'id' | 'createdAt' | 'updatedAt'>): Project | null {
    const projects = getStoredProjects();
    const index = projects.findIndex(p => p.id === projectId);
    if (index === -1) return null;

    const now = new Date();
    const newElement: ProjectElement = {
      ...element,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    projects[index] = {
      ...projects[index],
      elements: [...projects[index].elements, newElement],
      updatedAt: now,
    };
    saveProjects(projects);
    return projects[index];
  },

  updateElement(projectId: string, elementId: string, data: Partial<ProjectElement>): Project | null {
    const projects = getStoredProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return null;

    const elementIndex = projects[projectIndex].elements.findIndex(e => e.id === elementId);
    if (elementIndex === -1) return null;

    const now = new Date();
    projects[projectIndex].elements[elementIndex] = {
      ...projects[projectIndex].elements[elementIndex],
      ...data,
      updatedAt: now,
    };
    projects[projectIndex].updatedAt = now;
    saveProjects(projects);
    return projects[projectIndex];
  },

  removeElement(projectId: string, elementId: string): Project | null {
    const projects = getStoredProjects();
    const index = projects.findIndex(p => p.id === projectId);
    if (index === -1) return null;

    projects[index] = {
      ...projects[index],
      elements: projects[index].elements.filter(e => e.id !== elementId),
      updatedAt: new Date(),
    };
    saveProjects(projects);
    return projects[index];
  },

  reorderElements(projectId: string, elementIds: string[]): Project | null {
    const projects = getStoredProjects();
    const index = projects.findIndex(p => p.id === projectId);
    if (index === -1) return null;

    const elementMap = new Map(projects[index].elements.map(e => [e.id, e]));
    const reordered = elementIds
      .map((id, order) => {
        const el = elementMap.get(id);
        return el ? { ...el, order } : null;
      })
      .filter((e): e is ProjectElement => e !== null);

    projects[index] = {
      ...projects[index],
      elements: reordered,
      updatedAt: new Date(),
    };
    saveProjects(projects);
    return projects[index];
  },

  addNote(projectId: string, note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Project | null {
    const projects = getStoredProjects();
    const index = projects.findIndex(p => p.id === projectId);
    if (index === -1) return null;

    const now = new Date();
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    projects[index] = {
      ...projects[index],
      notes: [...projects[index].notes, newNote],
      updatedAt: now,
    };
    saveProjects(projects);
    return projects[index];
  },

  updateNote(projectId: string, noteId: string, data: Partial<Note>): Project | null {
    const projects = getStoredProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return null;

    const noteIndex = projects[projectIndex].notes.findIndex(n => n.id === noteId);
    if (noteIndex === -1) return null;

    const now = new Date();
    projects[projectIndex].notes[noteIndex] = {
      ...projects[projectIndex].notes[noteIndex],
      ...data,
      updatedAt: now,
    };
    projects[projectIndex].updatedAt = now;
    saveProjects(projects);
    return projects[projectIndex];
  },

  removeNote(projectId: string, noteId: string): Project | null {
    const projects = getStoredProjects();
    const index = projects.findIndex(p => p.id === projectId);
    if (index === -1) return null;

    projects[index] = {
      ...projects[index],
      notes: projects[index].notes.filter(n => n.id !== noteId),
      updatedAt: new Date(),
    };
    saveProjects(projects);
    return projects[index];
  },

  exportProject(id: string): string | null {
    const project = this.getById(id);
    if (!project) return null;
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      project,
    }, null, 2);
  },

  importProject(jsonString: string): Project | null {
    try {
      const data = JSON.parse(jsonString);
      if (!data.project || !data.version) return null;

      const project: Project = {
        ...data.project,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        lastOpenedAt: new Date(),
      };

      const projects = getStoredProjects();
      projects.unshift(project);
      saveProjects(projects);
      return project;
    } catch {
      return null;
    }
  },
};
