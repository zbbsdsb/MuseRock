import { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Lightbulb, Image, MoreVertical, Trash2, Copy, Star, Clock } from 'lucide-react';
import { Project } from './types';

interface ProjectCardProps {
  project: Project;
  onSelect: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

export default function ProjectCard({ project, onSelect, onDelete, onToggleFavorite }: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString();
  };

  const documentCount = project.elements.filter(e => e.type === 'document').length;
  const cardCount = project.elements.filter(e => e.type === 'card').length;
  const imageCount = project.elements.filter(e => e.type === 'image').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-white border border-brand-border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/10"
      onClick={onSelect}
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center">
          <span className="text-2xl font-serif italic text-violet-600">
            {project.name.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-brand-black font-medium text-sm truncate">{project.name}</h3>
            <p className="text-brand-black/40 text-xs mt-1 flex items-center gap-1">
              <Clock size={10} />
              {formatDate(project.lastOpenedAt)}
            </p>
          </div>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 text-brand-black/40 hover:text-brand-black rounded transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical size={16} />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 top-full mt-1 z-20 bg-white border border-brand-border rounded-xl shadow-xl py-1 min-w-[140px]"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite();
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-brand-black/80 hover:bg-brand-paper flex items-center gap-2"
                  >
                    <Star size={14} className={project.isFavorite ? 'fill-yellow-500 text-yellow-500' : ''} />
                    {project.isFavorite ? 'Unfavorite' : 'Favorite'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-brand-black/80 hover:bg-brand-paper flex items-center gap-2"
                  >
                    <Copy size={14} />
                    Duplicate
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-brand-paper flex items-center gap-2"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </div>

        {project.description && (
          <p className="text-brand-black/50 text-xs line-clamp-2 mb-3">{project.description}</p>
        )}

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-brand-black/40 text-xs">
            <FileText size={12} />
            <span>{documentCount}</span>
          </div>
          <div className="flex items-center gap-1 text-brand-black/40 text-xs">
            <Lightbulb size={12} />
            <span>{cardCount}</span>
          </div>
          <div className="flex items-center gap-1 text-brand-black/40 text-xs">
            <Image size={12} />
            <span>{imageCount}</span>
          </div>
        </div>
      </div>

      {project.isFavorite && (
        <div className="absolute top-3 right-3">
          <Star size={16} className="fill-yellow-500 text-yellow-500" />
        </div>
      )}

      <motion.div
        className="absolute inset-0 border-2 border-violet-500/0 rounded-2xl pointer-events-none"
        animate={{
          borderColor: isHovered ? 'rgba(139, 92, 246, 0.5)' : 'rgba(139, 92, 246, 0)',
        }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
}
