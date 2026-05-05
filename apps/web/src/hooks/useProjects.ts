import { useState, useEffect, useCallback } from 'react';
import {
  Project,
  CreateProjectDTO,
  UpdateProjectDTO,
  ProjectFilters,
  ProjectElement,
  Note,
} from '../types/project';
import { projectRepository } from '../services/projectRepository';

export interface UseProjectsReturn {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  filters: ProjectFilters;
  createProject: (data: CreateProjectDTO) => Project;
  updateProject: (id: string, data: UpdateProjectDTO) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (id: string | null) => void;
  toggleFavorite: (id: string) => void;
  archive: (id: string) => void;
  unarchive: (id: string) => void;
  addElement: (projectId: string, element: Omit<ProjectElement, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateElement: (projectId: string, elementId: string, data: Partial<ProjectElement>) => void;
  removeElement: (projectId: string, elementId: string) => void;
  reorderElements: (projectId: string, elementIds: string[]) => void;
  addNote: (projectId: string, note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (projectId: string, noteId: string, data: Partial<Note>) => void;
  removeNote: (projectId: string, noteId: string) => void;
  search: (query: string) => Project[];
  setFilters: (filters: ProjectFilters) => void;
  clearFilters: () => void;
  refresh: () => void;
}

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<ProjectFilters>({ status: 'active' });

  const loadProjects = useCallback(() => {
    setIsLoading(true);
    setError(null);
    try {
      const list = projectRepository.getAll();
      setProjects(list.projects);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const createProject = useCallback((data: CreateProjectDTO): Project => {
    const project = projectRepository.create(data);
    setProjects(prev => [project, ...prev]);
    return project;
  }, []);

  const updateProject = useCallback((id: string, data: UpdateProjectDTO) => {
    const updated = projectRepository.update(id, data);
    if (updated) {
      setProjects(prev => prev.map(p => p.id === id ? updated : p));
    }
  }, []);

  const deleteProject = useCallback((id: string) => {
    const success = projectRepository.delete(id);
    if (success) {
      setProjects(prev => prev.filter(p => p.id !== id));
      if (currentProjectId === id) {
        setCurrentProjectId(null);
      }
    }
  }, [currentProjectId]);

  const setCurrentProject = useCallback((id: string | null) => {
    setCurrentProjectId(id);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    const updated = projectRepository.toggleFavorite(id);
    if (updated) {
      setProjects(prev => prev.map(p => p.id === id ? updated : p));
    }
  }, []);

  const archive = useCallback((id: string) => {
    const updated = projectRepository.archive(id);
    if (updated) {
      setProjects(prev => prev.map(p => p.id === id ? updated : p));
    }
  }, []);

  const unarchive = useCallback((id: string) => {
    const updated = projectRepository.unarchive(id);
    if (updated) {
      setProjects(prev => prev.map(p => p.id === id ? updated : p));
    }
  }, []);

  const addElement = useCallback((projectId: string, element: Omit<ProjectElement, 'id' | 'createdAt' | 'updatedAt'>) => {
    const updated = projectRepository.addElement(projectId, element);
    if (updated) {
      setProjects(prev => prev.map(p => p.id === projectId ? updated : p));
    }
  }, []);

  const updateElement = useCallback((projectId: string, elementId: string, data: Partial<ProjectElement>) => {
    const updated = projectRepository.updateElement(projectId, elementId, data);
    if (updated) {
      setProjects(prev => prev.map(p => p.id === projectId ? updated : p));
    }
  }, []);

  const removeElement = useCallback((projectId: string, elementId: string) => {
    const updated = projectRepository.removeElement(projectId, elementId);
    if (updated) {
      setProjects(prev => prev.map(p => p.id === projectId ? updated : p));
    }
  }, []);

  const reorderElements = useCallback((projectId: string, elementIds: string[]) => {
    const updated = projectRepository.reorderElements(projectId, elementIds);
    if (updated) {
      setProjects(prev => prev.map(p => p.id === projectId ? updated : p));
    }
  }, []);

  const addNote = useCallback((projectId: string, note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const updated = projectRepository.addNote(projectId, note);
    if (updated) {
      setProjects(prev => prev.map(p => p.id === projectId ? updated : p));
    }
  }, []);

  const updateNote = useCallback((projectId: string, noteId: string, data: Partial<Note>) => {
    const updated = projectRepository.updateNote(projectId, noteId, data);
    if (updated) {
      setProjects(prev => prev.map(p => p.id === projectId ? updated : p));
    }
  }, []);

  const removeNote = useCallback((projectId: string, noteId: string) => {
    const updated = projectRepository.removeNote(projectId, noteId);
    if (updated) {
      setProjects(prev => prev.map(p => p.id === projectId ? updated : p));
    }
  }, []);

  const search = useCallback((query: string): Project[] => {
    if (!query.trim()) return projects;
    return projectRepository.search(query);
  }, [projects]);

  const setFilters = useCallback((newFilters: ProjectFilters) => {
    setFiltersState(newFilters);
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({ status: 'active' });
  }, []);

  const refresh = useCallback(() => {
    loadProjects();
  }, [loadProjects]);

  const currentProject = currentProjectId
    ? projects.find(p => p.id === currentProjectId) || null
    : null;

  return {
    projects,
    currentProject,
    isLoading,
    error,
    filters,
    createProject,
    updateProject,
    deleteProject,
    setCurrentProject,
    toggleFavorite,
    archive,
    unarchive,
    addElement,
    updateElement,
    removeElement,
    reorderElements,
    addNote,
    updateNote,
    removeNote,
    search,
    setFilters,
    clearFilters,
    refresh,
  };
}

export function useProjectById(id: string | null): Project | null {
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    if (!id) {
      setProject(null);
      return;
    }
    setProject(projectRepository.getById(id));
  }, [id]);

  return project;
}
