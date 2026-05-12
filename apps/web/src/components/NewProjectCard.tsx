import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, X } from 'lucide-react';

interface NewProjectCardProps {
  onCreate: (name: string) => void;
}

export default function NewProjectCard({ onCreate }: NewProjectCardProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [projectName, setProjectName] = useState('');

  const handleCreate = () => {
    if (projectName.trim()) {
      onCreate(projectName.trim());
      setProjectName('');
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreate();
    } else if (e.key === 'Escape') {
      setIsCreating(false);
      setProjectName('');
    }
  };

  if (isCreating) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-brand-paper border-2 border-violet-500/40 rounded-2xl p-6"
      >
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Project name..."
          autoFocus
          className="w-full bg-transparent border-none outline-none text-brand-black font-serif italic text-lg placeholder-brand-black/30 mb-6"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreate}
            className="px-6 py-2.5 bg-violet-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-violet-600 transition-all shadow-md"
          >
            Create
          </button>
          <button
            onClick={() => {
              setIsCreating(false);
              setProjectName('');
            }}
            className="p-2.5 rounded-full text-brand-black/50 hover:text-brand-black hover:bg-brand-paper transition-all"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setIsCreating(true)}
      className="bg-brand-paper border-2 border-dashed border-brand-border rounded-2xl p-6 cursor-pointer hover:border-violet-500/40 hover:shadow-lg transition-all flex flex-col items-center justify-center min-h-[200px] group"
    >
      <div className="w-14 h-14 rounded-full bg-violet-500/10 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 group-hover:scale-110 transition-all shadow-md">
        <Plus size={28} className="text-violet-500" />
      </div>
      <h3 className="text-brand-black font-serif italic text-base mb-1">New Project</h3>
      <p className="text-[10px] uppercase tracking-[0.15em] font-black text-brand-black/30">Create new</p>
    </motion.div>
  );
}
