import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Search, User, X, Plus, Clock, Star, FolderOpen } from 'lucide-react';
import DashboardHeader from './DashboardHeader';
import ProjectsOverview from './ProjectsOverview';
import ProjectDetail from './ProjectDetail';
import { Project, Note, InspirationCard, ProjectElement, DEFAULT_PROJECT_SETTINGS, DEFAULT_PROJECT_METADATA } from './types';

export type DashboardView = 'overview' | 'project';
export type DashboardTab = 'notes' | 'inspiration' | 'structure' | 'settings';

interface MuseDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MuseDashboard({ isOpen, onClose }: MuseDashboardProps) {
  const [viewMode, setViewMode] = useState<DashboardView>('overview');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>('notes');
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const saved = localStorage.getItem('muserock_projects');
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch (e) {
        setProjects(getDefaultProjects());
      }
    } else {
      setProjects(getDefaultProjects());
    }
  };

  const getDefaultProjects = (): Project[] => [];

  const handleSelectProject = (project: Project) => {
    setActiveProject(project);
    setViewMode('project');
    const updated = projects.map(p =>
      p.id === project.id ? { ...p, lastOpenedAt: new Date() } : p
    );
    setProjects(updated);
    localStorage.setItem('muserock_projects', JSON.stringify(updated));
  };

  const handleBackToOverview = () => {
    setViewMode('overview');
    setActiveProject(null);
    setActiveTab('notes');
    loadProjects();
  };

  const handleCreateProject = (name: string) => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      description: '',
      thumbnail: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastOpenedAt: new Date(),
      isFavorite: false,
      isArchived: false,
      elements: [],
      notes: [],
      settings: DEFAULT_PROJECT_SETTINGS,
      metadata: DEFAULT_PROJECT_METADATA,
    };
    const updated = [newProject, ...projects];
    setProjects(updated);
    localStorage.setItem('muserock_projects', JSON.stringify(updated));
  };

  const handleDeleteProject = (projectId: string) => {
    const updated = projects.filter(p => p.id !== projectId);
    setProjects(updated);
    localStorage.setItem('muserock_projects', JSON.stringify(updated));
  };

  const handleToggleFavorite = (projectId: string) => {
    const updated = projects.map(p =>
      p.id === projectId ? { ...p, isFavorite: !p.isFavorite } : p
    );
    setProjects(updated);
    localStorage.setItem('muserock_projects', JSON.stringify(updated));
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.lastOpenedAt).getTime() - new Date(a.lastOpenedAt).getTime())
    .slice(0, 5);

  const favoriteProjects = projects.filter(p => p.isFavorite);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 bg-brand-offwhite"
      >
        <div className="h-full flex flex-col bg-brand-offwhite text-brand-black">
          <DashboardHeader
            viewMode={viewMode}
            activeProject={activeProject}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onBack={handleBackToOverview}
            onClose={onClose}
          />

          <main className="flex-1 overflow-hidden">
            {viewMode === 'overview' ? (
              <ProjectsOverview
                projects={filteredProjects}
                recentProjects={recentProjects}
                favoriteProjects={favoriteProjects}
                searchQuery={searchQuery}
                onSelectProject={handleSelectProject}
                onCreateProject={handleCreateProject}
                onDeleteProject={handleDeleteProject}
                onToggleFavorite={handleToggleFavorite}
              />
            ) : (
              <ProjectDetail
                project={activeProject!}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onBack={handleBackToOverview}
              />
            )}
          </main>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}