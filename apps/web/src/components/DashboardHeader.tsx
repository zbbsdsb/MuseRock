import { Search, Settings, User, ChevronLeft, X, Sparkles } from 'lucide-react';
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
    <header className="h-20 border-b border-brand-border bg-brand-paper flex items-center justify-between px-8 shrink-0">
      <div className="flex items-center gap-6">
        {viewMode === 'project' && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-brand-black/60 hover:text-brand-black hover:bg-brand-paper transition-all border border-transparent hover:border-brand-border"
          >
            <ChevronLeft size={18} />
            <span className="text-xs font-black uppercase tracking-widest">Back</span>
          </button>
        )}

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-serif italic text-brand-black tracking-tight">
              {viewMode === 'overview' ? 'Muse Dashboard' : activeProject?.name || 'Project'}
            </h1>
            {viewMode === 'project' && activeProject && (
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-brand-black/30">
                {activeProject.elements.length} elements
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-12">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-black/30" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-11 pr-4 py-3 bg-brand-paper border border-brand-border rounded-full text-brand-black placeholder-brand-black/30 focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="p-3 rounded-full hover:bg-brand-paper text-brand-black/40 hover:text-brand-black transition-all border border-transparent hover:border-brand-border"
        >
          <Settings size={18} />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-md">
          <User size={18} className="text-white" />
        </div>
        <button
          onClick={onClose}
          className="p-3 rounded-full hover:bg-brand-paper text-brand-black/40 hover:text-brand-black transition-all border border-transparent hover:border-brand-border"
        >
          <X size={18} />
        </button>
      </div>
    </header>
  );
}
