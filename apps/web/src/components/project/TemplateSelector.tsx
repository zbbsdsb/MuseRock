import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Plus, 
  Save, 
  Layout, 
  CheckCircle2
} from 'lucide-react';
import TemplateCard from './TemplateCard';
import { 
  ProjectTemplate, 
  PROJECT_TEMPLATES, 
  createProjectFromTemplate 
} from '../../types/project';

interface TemplateSelectorProps {
  onSelectTemplate?: (template: ProjectTemplate) => void;
  onClose?: () => void;
}

export default function TemplateSelector({
  onSelectTemplate,
  onClose
}: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [showCreateCustom, setShowCreateCustom] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<ProjectTemplate[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const allTemplates = [...PROJECT_TEMPLATES, ...customTemplates];

  const handleSelectTemplate = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
    onSelectTemplate?.(template);
  };

  const handleDeleteCustomTemplate = (templateId: string) => {
    setCustomTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  const handleCreateCustomTemplate = () => {
    setShowCreateCustom(true);
  };

  const handleSaveCustomTemplate = (template: ProjectTemplate) => {
    setCustomTemplates(prev => [...prev, template]);
    setShowCreateCustom(false);
    setIsCreating(false);
  };

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'blank', name: 'Blank' },
    { id: 'novel', name: 'Novel' },
    { id: 'script', name: 'Script' },
    { id: 'essay', name: 'Essay' },
    { id: 'custom', name: 'Custom' },
  ];

  const [activeCategory, setActiveCategory] = useState('all');

  const filteredTemplates = allTemplates.filter(t => 
    activeCategory === 'all' || t.category === activeCategory
  );

  return (
    <div className="fixed inset-0 bg-brand-black/40 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-brand-paper w-full max-w-4xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
          <div>
            <h2 className="text-xl font-serif italic text-brand-black">Choose a Template</h2>
            <p className="text-sm text-brand-black/50">Start with a template or create your own</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-brand-paper text-brand-black/40 hover:text-brand-black transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2 px-6 py-3 border-b border-brand-border/50 bg-brand-paper/80">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`
                px-4 py-1.5 rounded-xl text-sm font-medium transition-all
                ${activeCategory === category.id 
                  ? 'bg-violet-500 text-white shadow-md' 
                  : 'text-brand-black/60 hover:bg-brand-paper'}
              `}
            >
              {category.name}
            </button>
          ))}
          <div className="flex-1" />
          <button
            onClick={handleCreateCustomTemplate}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-violet-500/10 text-violet-700 text-sm font-medium hover:bg-violet-500/20 transition-colors"
          >
            <Plus size={16} />
            Create Custom
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                isBuiltIn={!customTemplates.some(t => t.id === template.id)}
                isSelected={selectedTemplate?.id === template.id}
                onSelect={handleSelectTemplate}
                onDelete={handleDeleteCustomTemplate}
              />
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <Layout size={48} className="text-brand-black/20 mb-4" />
              <p className="text-lg font-serif italic text-brand-black/60">No templates found</p>
              <p className="text-sm text-brand-black/40 mt-1">Try another category</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-brand-border bg-brand-paper/80">
          {selectedTemplate && (
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-500" />
              <span className="text-sm text-brand-black/70">
                Selected: <span className="font-medium text-brand-black">{selectedTemplate.name}</span>
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-brand-black/60 hover:text-brand-black hover:bg-brand-paper transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => selectedTemplate && handleSelectTemplate(selectedTemplate)}
              disabled={!selectedTemplate}
              className="px-6 py-2 rounded-xl bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Use Template
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showCreateCustom && (
            <CreateTemplateModal
              onSave={handleSaveCustomTemplate}
              onClose={() => setShowCreateCustom(false)}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

interface CreateTemplateModalProps {
  onSave: (template: ProjectTemplate) => void;
  onClose: () => void;
}

function CreateTemplateModal({ onSave, onClose }: CreateTemplateModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('custom');

  const handleSave = () => {
    const template: ProjectTemplate = {
      id: `custom-${Date.now()}`,
      name,
      description,
      thumbnail: '',
      category: category as any,
      elements: [
        { type: 'document', name: 'Main Document', order: 0 }
      ],
      notes: [],
      settings: {},
    };
    onSave(template);
  };

  return (
    <div className="absolute inset-0 bg-brand-black/60 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-brand-paper w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border">
          <h3 className="text-lg font-serif italic text-brand-black">Create Custom Template</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-brand-paper text-brand-black/40 hover:text-brand-black"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-brand-black/50">
              Template Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="My Awesome Template"
              className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-brand-paper text-sm text-brand-black placeholder-brand-black/30 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-brand-black/50">
              Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe what this template is for..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-brand-paper text-sm text-brand-black placeholder-brand-black/30 focus:outline-none focus:border-violet-500 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-brand-black/50">
              Category
            </label>
            <div className="flex gap-2 flex-wrap">
              {['custom', 'novel', 'script', 'essay'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`
                    px-3 py-1.5 rounded-xl text-sm font-medium transition-colors
                    ${category === cat 
                      ? 'bg-violet-500 text-white' 
                      : 'bg-brand-offwhite text-brand-black/60 hover:bg-brand-paper'}
                  `}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-brand-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-brand-black/60 hover:text-brand-black hover:bg-brand-paper transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save size={16} />
            Save Template
          </button>
        </div>
      </motion.div>
    </div>
  );
}