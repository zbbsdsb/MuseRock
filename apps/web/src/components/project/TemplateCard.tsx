import React from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  BookOpen, 
  Film, 
  Layout, 
  Plus, 
  Edit, 
  Trash2
} from 'lucide-react';
import { 
  ProjectTemplate, 
  PROJECT_TEMPLATES, 
  createProject 
} from '../../types/project';
import { elementTypeIcons } from './elementIcons';

interface TemplateCardProps {
  template: ProjectTemplate;
  isBuiltIn?: boolean;
  isSelected?: boolean;
  onSelect?: (template: ProjectTemplate) => void;
  onEdit?: (template: ProjectTemplate) => void;
  onDelete?: (templateId: string) => void;
}

const categoryIcons: Record<string, typeof FileText> = {
  blank: Plus,
  novel: BookOpen,
  script: Film,
  essay: FileText,
  custom: Layout,
};

const categoryColors: Record<string, string> = {
  blank: 'bg-slate-100 text-slate-600',
  novel: 'bg-purple-100 text-purple-600',
  script: 'bg-red-100 text-red-600',
  essay: 'bg-blue-100 text-blue-600',
  custom: 'bg-violet-100 text-violet-600',
};

export default function TemplateCard({
  template,
  isBuiltIn = true,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
}: TemplateCardProps) {
  const Icon = categoryIcons[template.category] || Plus;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative p-5 rounded-2xl border-2 transition-all
        ${isSelected 
          ? 'border-violet-500 bg-violet-50 shadow-lg' 
          : 'border-brand-border bg-brand-paper hover:border-violet-300'}
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center
          ${categoryColors[template.category] || 'bg-slate-100 text-slate-600'}
        `}>
          <Icon size={20} />
        </div>
        
        {!isBuiltIn && (
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(template);
              }}
              className="p-1.5 rounded-lg hover:bg-brand-offwhite text-brand-black/40 hover:text-brand-black transition-colors"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(template.id);
              }}
              className="p-1.5 rounded-lg hover:bg-red-50 text-brand-black/40 hover:text-red-500 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="mb-3">
        <h3 className="text-base font-serif italic text-brand-black mb-1">
          {template.name}
        </h3>
        <p className="text-xs text-brand-black/50 line-clamp-2">
          {template.description}
        </p>
      </div>

      <div className="border-t border-brand-border/50 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {template.elements.slice(0, 3).map((el, i) => {
              const ElIcon = elementTypeIcons[el.type as keyof typeof elementTypeIcons];
              return (
                <div 
                  key={i}
                  className="w-6 h-6 rounded-full bg-brand-offwhite flex items-center justify-center"
                >
                  <ElIcon size={12} className="text-brand-black/60" />
                </div>
              );
            })}
            {template.elements.length > 3 && (
              <span className="text-xs text-brand-black/40">
                +{template.elements.length - 3}
              </span>
            )}
          </div>
          <span className="text-xs font-medium text-brand-black/40">
            {template.elements.length} {template.elements.length === 1 ? 'Element' : 'Elements'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}