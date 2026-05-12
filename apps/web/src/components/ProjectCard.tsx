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
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
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
      className="group relative bg-brand-paper border border-brand-border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-violet-500/30 hover:shadow-xl"
      onClick={onSelect}
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent" />
        <div className="relative w-14 h-14 rounded-full bg-brand-paper/80 shadow-md flex items-center justify-center backdrop-blur-sm">
          <span className="text-xl font-serif italic text-violet-600">
            {project.name.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-brand-black font-serif italic text-base truncate">{project.name}</h3>
            <p className="text-[10px] uppercase tracking-[0.15em] font-black text-brand-black/30 mt-1 flex items-center gap-1">
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
              className="p-2 rounded-full text-brand-black/30 hover:text-brand-black hover:bg-brand-paper transition-all opacity-0 group-hover:opacity-100"
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
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute right-0 top-full mt-2 z-20 bg-brand-paper border border-brand-border rounded-xl shadow-xl py-2 min-w-[160px]"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-black uppercase tracking-wider text-brand-black/70 hover:bg-brand-paper flex items-center gap-3"
                  >
                    <Star size={14} className={project.isFavorite ? 'fill-yellow-500 text-yellow-500' : ''} />
                    {project.isFavorite ? 'Unfavorite' : 'Favorite'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-black uppercase tracking-wider text-brand-black/70 hover:bg-brand-paper flex items-center gap-3"
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
                    className="w-full px-4 py-2.5 text-left text-xs font-black uppercase tracking-wider text-red-500 hover:bg-red-50 flex items-center gap-3"
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
          <p className="text-brand-black/40 text-xs line-clamp-2 mb-4">{project.description}</p>
        )}

        <div className="flex items-center gap-4">
          {documentCount > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-brand-paper text-brand-black/50 text-[10px]">
              <FileText size={11} />
              <span className="font-black">{documentCount}</span>
            </div>
          )}
          {cardCount > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-brand-paper text-brand-black/50 text-[10px]">
              <Lightbulb size={11} />
              <span className="font-black">{cardCount}</span>
            </div>
          )}
          {imageCount > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-brand-paper text-brand-black/50 text-[10px]">
              <Image size={11} />
              <span className="font-black">{imageCount}</span>
            </div>
          )}
        </div>
      </div>

      {project.isFavorite && (
        <div className="absolute top-3 right-3">
          <Star size={16} className="fill-yellow-500 text-yellow-500 drop-shadow-sm" />
        </div>
      )}

      <motion.div
        className="absolute inset-0 border-2 border-violet-500/0 rounded-2xl pointer-events-none"
        animate={{
          borderColor: isHovered ? 'rgba(139, 92, 246, 0.4)' : 'rgba(139, 92, 246, 0)',
        }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
}
