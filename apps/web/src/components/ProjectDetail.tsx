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
      <aside className="w-64 border-r border-brand-border bg-white p-4 shrink-0 flex flex-col">
        <div className="mb-6 flex-1">
          <h3 className="text-brand-black/40 text-xs font-semibold uppercase tracking-wider mb-3">Elements</h3>
          <div className="space-y-1">
            {project.elements.length === 0 ? (
              <p className="text-brand-black/30 text-xs italic">No elements yet</p>
            ) : (
              project.elements.map((element) => (
                <div
                  key={element.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-brand-paper transition-colors cursor-pointer group"
                >
                  {element.type === 'document' && <FileText size={14} className="text-blue-500" />}
                  {element.type === 'canvas' && <Image size={14} className="text-purple-500" />}
                  {element.type === 'card' && <Lightbulb size={14} className="text-amber-500" />}
                  {element.type === 'image' && <Image size={14} className="text-emerald-500" />}
                  <span className="text-brand-black/70 text-sm flex-1 truncate">{element.name}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <button
          onClick={onBack}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-paper text-brand-black/60 hover:text-brand-black hover:bg-brand-border transition-all border border-brand-border"
        >
          <ChevronLeft size={18} />
          <span className="text-sm font-medium">Back to Projects</span>
        </button>
      </aside>

      <div className="flex-1 flex flex-col bg-brand-offwhite">
        <div className="border-b border-brand-border bg-white px-6">
          <div className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-brand-black'
                    : 'text-brand-black/50 hover:text-brand-black/70'
                }`}
              >
                <div className="flex items-center gap-2">
                  <tab.icon size={16} />
                  {tab.label}
                </div>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'notes' && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-4">
                <FileText size={40} className="text-violet-500/50" />
              </div>
              <h3 className="text-brand-black/60 text-lg font-medium mb-2">Notes Panel</h3>
              <p className="text-brand-black/40 text-sm max-w-md">
                Capture thoughts, context, and ideas. Notes help you organize your creative process.
              </p>
              <button className="mt-4 px-4 py-2 bg-violet-500 text-white text-sm font-medium rounded-lg hover:bg-violet-600 transition-colors">
                Create Note
              </button>
            </div>
          )}

          {activeTab === 'inspiration' && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
                <Sparkles size={40} className="text-amber-500/50" />
              </div>
              <h3 className="text-brand-black/60 text-lg font-medium mb-2">Inspiration Panel</h3>
              <p className="text-brand-black/40 text-sm max-w-md">
                Nurture creative inspiration. Generate ideas and save them as cards for later use.
              </p>
              <button className="mt-4 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors">
                Get Inspiration
              </button>
            </div>
          )}

          {activeTab === 'structure' && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
                <FolderTree size={40} className="text-emerald-500/50" />
              </div>
              <h3 className="text-brand-black/60 text-lg font-medium mb-2">Structure Panel</h3>
              <p className="text-brand-black/40 text-sm max-w-md">
                Visualize your project structure. Drag and drop to organize elements.
              </p>
              <button className="mt-4 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors">
                Add Element
              </button>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-brand-black/5 flex items-center justify-center mb-4">
                <Settings size={40} className="text-brand-black/30" />
              </div>
              <h3 className="text-brand-black/60 text-lg font-medium mb-2">Project Settings</h3>
              <p className="text-brand-black/40 text-sm max-w-md">
                Configure project metadata, privacy settings, and export options.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
