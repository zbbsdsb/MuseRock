import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';

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
        className="bg-white border border-violet-500/30 rounded-2xl p-6"
      >
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Project name..."
          autoFocus
          className="w-full bg-transparent border-none outline-none text-brand-black text-sm font-medium placeholder-brand-black/40 mb-4"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-violet-500 text-white text-sm font-medium rounded-lg hover:bg-violet-600 transition-colors"
          >
            Create
          </button>
          <button
            onClick={() => {
              setIsCreating(false);
              setProjectName('');
            }}
            className="px-4 py-2 text-brand-black/60 text-sm font-medium hover:text-brand-black transition-colors"
          >
            Cancel
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
      className="bg-white border-2 border-dashed border-brand-border rounded-2xl p-6 cursor-pointer hover:border-violet-500/30 transition-all flex flex-col items-center justify-center min-h-[200px] group"
    >
      <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors">
        <Plus size={24} className="text-violet-500" />
      </div>
      <h3 className="text-brand-black font-medium text-sm mb-1">New Project</h3>
      <p className="text-brand-black/40 text-xs">Create a new creative project</p>
    </motion.div>
  );
}
