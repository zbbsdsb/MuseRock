import { motion } from 'motion/react';
import { Clock, Star, ChevronRight, Plus, Download, Upload } from 'lucide-react';
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
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-brand-paper border border-brand-border rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center">
            <Clock size={14} className="text-violet-500" />
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black/50">Recent</h3>
        </div>
        <div className="space-y-2">
          {recentProjects.slice(0, 5).map((project) => (
            <button
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="w-full flex items-center justify-between p-3 rounded-full hover:bg-brand-paper transition-all group border border-transparent hover:border-brand-border"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-paper shadow-sm flex items-center justify-center">
                  <span className="text-sm font-serif italic text-violet-600">
                    {project.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-brand-black font-serif italic text-sm">{project.name}</p>
                  <p className="text-[10px] uppercase tracking-wider font-black text-brand-black/30">{formatTime(project.lastOpenedAt)}</p>
                </div>
              </div>
              <ChevronRight
                size={16}
                className="text-brand-black/30 group-hover:text-violet-500 transition-colors"
              />
            </button>
          ))}
          {recentProjects.length === 0 && (
            <p className="text-brand-black/30 text-xs font-serif italic text-center py-6">No recent projects</p>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-brand-paper border border-brand-border rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Star size={14} className="text-amber-500" />
          </div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black/50">Quick Actions</h3>
        </div>
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 p-3 rounded-full hover:bg-brand-paper transition-all group border border-transparent hover:border-brand-border">
            <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center">
              <Plus size={18} className="text-violet-500" />
            </div>
            <div className="text-left">
              <p className="text-brand-black font-serif italic text-sm">New Project</p>
              <p className="text-[10px] uppercase tracking-wider font-black text-brand-black/30">Create new</p>
            </div>
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-full hover:bg-brand-paper transition-all group border border-transparent hover:border-brand-border">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Download size={18} className="text-emerald-500" />
            </div>
            <div className="text-left">
              <p className="text-brand-black font-serif italic text-sm">Import</p>
              <p className="text-[10px] uppercase tracking-wider font-black text-brand-black/30">From file</p>
            </div>
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-full hover:bg-brand-paper transition-all group border border-transparent hover:border-brand-border">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Upload size={18} className="text-blue-500" />
            </div>
            <div className="text-left">
              <p className="text-brand-black font-serif italic text-sm">Export All</p>
              <p className="text-[10px] uppercase tracking-wider font-black text-brand-black/30">Backup</p>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
