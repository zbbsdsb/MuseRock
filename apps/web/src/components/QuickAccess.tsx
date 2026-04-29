import { motion } from 'motion/react';
import { Clock, Star, ChevronRight } from 'lucide-react';
import { Project } from './types';

interface QuickAccessProps {
  recentProjects: Project[];
  onSelectProject: (project: Project) => void;
}

export default function QuickAccess({ recentProjects, onSelectProject }: QuickAccessProps) {
  const formatTime = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-brand-border rounded-2xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-violet-500" />
          <h3 className="text-brand-black font-medium text-sm">Recent</h3>
        </div>
        <div className="space-y-2">
          {recentProjects.slice(0, 5).map((project) => (
            <button
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-brand-paper transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                  <span className="text-xs font-serif italic text-violet-600">
                    {project.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-brand-black/80 text-sm font-medium">{project.name}</p>
                  <p className="text-brand-black/40 text-xs">{formatTime(project.lastOpenedAt)}</p>
                </div>
              </div>
              <ChevronRight
                size={16}
                className="text-brand-black/30 group-hover:text-brand-black/60 transition-colors"
              />
            </button>
          ))}
          {recentProjects.length === 0 && (
            <p className="text-brand-black/40 text-sm text-center py-4">No recent projects</p>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-brand-border rounded-2xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Star size={16} className="text-amber-500" />
          <h3 className="text-brand-black font-medium text-sm">Quick Actions</h3>
        </div>
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-brand-paper transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <span className="text-violet-500 text-sm">+</span>
            </div>
            <div className="text-left">
              <p className="text-brand-black/80 text-sm font-medium">Start New Project</p>
              <p className="text-brand-black/40 text-xs">Create something amazing</p>
            </div>
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-brand-paper transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <span className="text-emerald-500 text-sm">↓</span>
            </div>
            <div className="text-left">
              <p className="text-brand-black/80 text-sm font-medium">Import Project</p>
              <p className="text-brand-black/40 text-xs">From file or template</p>
            </div>
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-brand-paper transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <span className="text-blue-500 text-sm">↑</span>
            </div>
            <div className="text-left">
              <p className="text-brand-black/80 text-sm font-medium">Export All</p>
              <p className="text-brand-black/40 text-xs">Backup your projects</p>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
