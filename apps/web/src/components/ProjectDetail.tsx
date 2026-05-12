import { motion } from 'motion/react';
import { FileText, Lightbulb, Image, Settings, Sparkles, FolderTree, ChevronLeft } from 'lucide-react';
import { Project } from './types';
import { DashboardTab } from './MuseDashboard';

interface ProjectDetailProps {
  project: Project;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onBack: () => void;
}

const tabs = [
  { id: 'notes' as const, label: 'Notes', icon: FileText },
  { id: 'inspiration' as const, label: 'Inspiration', icon: Sparkles },
  { id: 'structure' as const, label: 'Structure', icon: FolderTree },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
];

export default function ProjectDetail({ project, activeTab, onTabChange, onBack }: ProjectDetailProps) {
  return (
    <div className="h-full flex">
      <aside className="w-72 border-r border-brand-border bg-brand-paper p-6 shrink-0 flex flex-col">
        <div className="mb-8 flex-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black/30 mb-4">Elements</h3>
          <div className="space-y-2">
            {project.elements.length === 0 ? (
              <p className="text-brand-black/20 text-xs italic font-serif">No elements yet</p>
            ) : (
              project.elements.map((element) => (
                <div
                  key={element.id}
                  className="flex items-center gap-3 p-3 rounded-full hover:bg-brand-paper transition-all cursor-pointer group border border-transparent hover:border-brand-border"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-paper flex items-center justify-center group-hover:scale-110 transition-transform">
                    {element.type === 'document' && <FileText size={14} className="text-blue-500" />}
                    {element.type === 'canvas' && <Image size={14} className="text-purple-500" />}
                    {element.type === 'card' && <Lightbulb size={14} className="text-amber-500" />}
                    {element.type === 'image' && <Image size={14} className="text-emerald-500" />}
                  </div>
                  <span className="text-brand-black/70 text-sm flex-1 truncate">{element.name}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <button
          onClick={onBack}
          className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-brand-paper text-brand-black/60 hover:text-brand-black hover:bg-brand-border transition-all border border-brand-border"
        >
          <ChevronLeft size={16} />
          <span className="text-xs font-black uppercase tracking-widest">Back to Projects</span>
        </button>
      </aside>

      <div className="flex-1 flex flex-col bg-brand-offwhite">
        <div className="border-b border-brand-border bg-brand-paper px-8">
          <div className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative px-6 py-4 text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id
                    ? 'text-brand-black'
                    : 'text-brand-black/40 hover:text-brand-black/70'
                }`}
              >
                <div className="flex items-center gap-2">
                  <tab.icon size={14} />
                  {tab.label}
                </div>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-violet-500 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-12 overflow-y-auto">
          {activeTab === 'notes' && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full bg-violet-500/10 flex items-center justify-center mb-6">
                <FileText size={48} className="text-violet-500/40" />
              </div>
              <h3 className="text-2xl font-serif italic text-brand-black/70 mb-3">Notes</h3>
              <p className="text-brand-black/40 text-sm max-w-md leading-relaxed">
                Capture thoughts, context, and ideas. Notes help you organize your creative process.
              </p>
              <button className="mt-8 px-8 py-3 bg-violet-500 text-white text-xs font-black uppercase tracking-widest rounded-full hover:bg-violet-600 transition-all shadow-lg">
                Create Note
              </button>
            </div>
          )}

          {activeTab === 'inspiration' && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center mb-6">
                <Sparkles size={48} className="text-amber-500/40" />
              </div>
              <h3 className="text-2xl font-serif italic text-brand-black/70 mb-3">Inspiration</h3>
              <p className="text-brand-black/40 text-sm max-w-md leading-relaxed">
                Nurture creative inspiration. Generate ideas and save them as cards for later use.
              </p>
              <button className="mt-8 px-8 py-3 bg-amber-500 text-white text-xs font-black uppercase tracking-widest rounded-full hover:bg-amber-600 transition-all shadow-lg">
                Get Inspiration
              </button>
            </div>
          )}

          {activeTab === 'structure' && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                <FolderTree size={48} className="text-emerald-500/40" />
              </div>
              <h3 className="text-2xl font-serif italic text-brand-black/70 mb-3">Structure</h3>
              <p className="text-brand-black/40 text-sm max-w-md leading-relaxed">
                Visualize your project structure. Drag and drop to organize elements.
              </p>
              <button className="mt-8 px-8 py-3 bg-emerald-500 text-white text-xs font-black uppercase tracking-widest rounded-full hover:bg-emerald-600 transition-all shadow-lg">
                Add Element
              </button>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 rounded-full bg-brand-black/5 flex items-center justify-center mb-6">
                <Settings size={48} className="text-brand-black/20" />
              </div>
              <h3 className="text-2xl font-serif italic text-brand-black/70 mb-3">Settings</h3>
              <p className="text-brand-black/40 text-sm max-w-md leading-relaxed">
                Configure project metadata, privacy settings, and export options.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
