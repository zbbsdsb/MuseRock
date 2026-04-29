import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Clock, Star, FolderOpen, Download, Upload } from 'lucide-react';
import ProjectCard from './ProjectCard';
import NewProjectCard from './NewProjectCard';
import QuickAccess from './QuickAccess';
import { Project } from './types';

interface ProjectsOverviewProps {
  projects: Project[];
  recentProjects: Project[];
  favoriteProjects: Project[];
  searchQuery: string;
  onSelectProject: (project: Project) => void;
  onCreateProject: (name: string) => void;
  onDeleteProject: (projectId: string) => void;
  onToggleFavorite: (projectId: string) => void;
}

export default function ProjectsOverview({
  projects,
  recentProjects,
  favoriteProjects,
  searchQuery,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onToggleFavorite,
}: ProjectsOverviewProps) {
  const [filter, setFilter] = useState<'all' | 'favorites' | 'recent'>('all');

  const filteredProjects = filter === 'favorites'
    ? favoriteProjects
    : filter === 'recent'
      ? recentProjects
      : projects;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-brand-black mb-1">My Projects</h2>
            <p className="text-brand-black/50 text-sm">{projects.length} projects</p>
          </div>

          <div className="flex items-center gap-2 bg-brand-paper rounded-xl p-1 border border-brand-border">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-violet-500 text-white'
                  : 'text-brand-black/60 hover:text-brand-black'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('favorites')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                filter === 'favorites'
                  ? 'bg-violet-500 text-white'
                  : 'text-brand-black/60 hover:text-brand-black'
              }`}
            >
              <Star size={14} />
              Favorites
            </button>
            <button
              onClick={() => setFilter('recent')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                filter === 'recent'
                  ? 'bg-violet-500 text-white'
                  : 'text-brand-black/60 hover:text-brand-black'
              }`}
            >
              <Clock size={14} />
              Recent
            </button>
          </div>
        </div>

        {filter === 'all' && !searchQuery && (
          <div className="mb-8">
            <QuickAccess
              recentProjects={recentProjects}
              onSelectProject={onSelectProject}
            />
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filter === 'all' && !searchQuery && (
            <NewProjectCard onCreate={onCreateProject} />
          )}

          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ProjectCard
                project={project}
                onSelect={() => onSelectProject(project)}
                onDelete={() => onDeleteProject(project.id)}
                onToggleFavorite={() => onToggleFavorite(project.id)}
              />
            </motion.div>
          ))}

          {filteredProjects.length === 0 && filter !== 'all' && (
            <div className="col-span-full py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-black/5 flex items-center justify-center mx-auto mb-4">
                {filter === 'favorites' ? (
                  <Star size={32} className="text-brand-black/20" />
                ) : (
                  <Clock size={32} className="text-brand-black/20" />
                )}
              </div>
              <h3 className="text-brand-black/60 text-lg font-medium mb-2">
                {filter === 'favorites' ? 'No favorites yet' : 'No recent projects'}
              </h3>
              <p className="text-brand-black/40 text-sm">
                {filter === 'favorites'
                  ? 'Star projects to see them here'
                  : 'Start working on a project to see it here'}
              </p>
            </div>
          )}

          {filter === 'all' && projects.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-black/5 flex items-center justify-center mx-auto mb-4">
                <FolderOpen size={32} className="text-brand-black/20" />
              </div>
              <h3 className="text-brand-black/60 text-lg font-medium mb-2">No projects yet</h3>
              <p className="text-brand-black/40 text-sm">Create your first project to get started</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}