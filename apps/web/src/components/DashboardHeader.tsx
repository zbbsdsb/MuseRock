import { Search, Settings, User, ChevronLeft, X } from 'lucide-react';
import { Project } from './types';

interface DashboardHeaderProps {
  viewMode: 'overview' | 'project';
  activeProject: Project | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onBack: () => void;
  onClose: () => void;
}

export default function DashboardHeader({
  viewMode,
  activeProject,
  searchQuery,
  onSearchChange,
  onBack,
  onClose,
}: DashboardHeaderProps) {
  return (
    <header className="h-16 border-b border-brand-border bg-white flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        {viewMode === 'project' && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-brand-black/60 hover:text-brand-black transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-sm font-medium">Back to Projects</span>
          </button>
        )}

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <div>
            <h1 className="text-brand-black font-semibold text-sm">
              {viewMode === 'overview' ? 'Muse Dashboard' : activeProject?.name || 'Project'}
            </h1>
            {viewMode === 'project' && activeProject && (
              <p className="text-brand-black/40 text-xs">
                {activeProject.elements.length} elements
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-black/40" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2 bg-brand-paper border border-brand-border rounded-xl text-brand-black placeholder-brand-black/40 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="p-2 rounded-lg hover:bg-brand-black/5 text-brand-black/60 hover:text-brand-black transition-colors"
        >
          <Settings size={20} />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
          <User size={16} className="text-white" />
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-brand-black/5 text-brand-black/60 hover:text-brand-black transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </header>
  );
}