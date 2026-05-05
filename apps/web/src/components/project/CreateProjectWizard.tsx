import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, Check, FileText, BookOpen, Film, Plus } from 'lucide-react';
import { PROJECT_TEMPLATES, ProjectTemplate, CreateProjectDTO } from '../../types/project';

type Step = 'template' | 'details' | 'initial';

interface CreateProjectWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateProjectDTO) => void;
}

const templateIcons: Record<string, typeof FileText> = {
  blank: Plus,
  novel: BookOpen,
  script: Film,
  essay: FileText,
};

export default function CreateProjectWizard({ isOpen, onClose, onCreate }: CreateProjectWizardProps) {
  const [step, setStep] = useState<Step>('template');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('blank');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [addInitialElement, setAddInitialElement] = useState(true);

  const handleNext = () => {
    if (step === 'template') {
      setStep('details');
    } else if (step === 'details') {
      setStep('initial');
    }
  };

  const handleBack = () => {
    if (step === 'details') {
      setStep('template');
    } else if (step === 'initial') {
      setStep('details');
    }
  };

  const handleCreate = () => {
    onCreate({
      name: projectName.trim() || 'Untitled Project',
      description: projectDescription.trim(),
      templateId: selectedTemplateId,
    });
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep('template');
    setSelectedTemplateId('blank');
    setProjectName('');
    setProjectDescription('');
    setAddInitialElement(true);
    onClose();
  };

  const selectedTemplate = PROJECT_TEMPLATES.find(t => t.id === selectedTemplateId);

  const steps: { id: Step; label: string; number: number }[] = [
    { id: 'template', label: 'Template', number: 1 },
    { id: 'details', label: 'Details', number: 2 },
    { id: 'initial', label: 'Setup', number: 3 },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={resetAndClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-brand-paper border border-brand-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
              <h2 className="text-lg font-serif italic text-brand-black">Create New Project</h2>
              <button
                onClick={resetAndClose}
                className="p-2 rounded-full text-brand-black/40 hover:text-brand-black hover:bg-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center justify-center gap-4 px-6 py-4 border-b border-brand-border bg-brand-offwhite/50">
              {steps.map((s, index) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-black transition-all ${
                    index < currentStepIndex
                      ? 'bg-violet-500 text-white'
                      : index === currentStepIndex
                      ? 'bg-violet-500/20 text-violet-600 border-2 border-violet-500'
                      : 'bg-brand-border text-brand-black/40'
                  }`}>
                    {index < currentStepIndex ? <Check size={14} /> : s.number}
                  </div>
                  <span className={`text-xs font-black uppercase tracking-wider ${
                    index <= currentStepIndex ? 'text-brand-black' : 'text-brand-black/40'
                  }`}>
                    {s.label}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 rounded ${
                      index < currentStepIndex ? 'bg-violet-500' : 'bg-brand-border'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {step === 'template' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black/50 mb-4">Choose a Template</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {PROJECT_TEMPLATES.map(template => {
                        const Icon = templateIcons[template.id] || FileText;
                        return (
                          <button
                            key={template.id}
                            onClick={() => setSelectedTemplateId(template.id)}
                            className={`p-5 rounded-2xl border-2 text-left transition-all ${
                              selectedTemplateId === template.id
                                ? 'border-violet-500 bg-violet-500/5 shadow-lg'
                                : 'border-brand-border hover:border-brand-black/30 hover:bg-white'
                            }`}
                          >
                            <div className={`w-12 h-12 rounded-xl mb-3 flex items-center justify-center ${
                              selectedTemplateId === template.id
                                ? 'bg-violet-500 text-white'
                                : 'bg-brand-offwhite text-brand-black/60'
                            }`}>
                              <Icon size={20} />
                            </div>
                            <h4 className="text-sm font-serif italic text-brand-black mb-1">{template.name}</h4>
                            <p className="text-xs text-brand-black/40 line-clamp-2">{template.description}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 'details' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black/50 mb-4">Project Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-brand-black/60 mb-2">Project Name</label>
                        <input
                          type="text"
                          value={projectName}
                          onChange={e => setProjectName(e.target.value)}
                          placeholder="My Amazing Project"
                          className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-sm text-brand-black placeholder-brand-black/30 focus:outline-none focus:border-violet-500 font-serif italic"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-brand-black/60 mb-2">Description (optional)</label>
                        <textarea
                          value={projectDescription}
                          onChange={e => setProjectDescription(e.target.value)}
                          placeholder="A brief description of your project..."
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-brand-border bg-white text-sm text-brand-black placeholder-brand-black/30 focus:outline-none focus:border-violet-500 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 'initial' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black/50 mb-4">Initial Setup</h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 rounded-xl border border-brand-border hover:bg-white transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                            <Plus size={18} className="text-violet-500" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-brand-black block">Add First Element</span>
                            <span className="text-xs text-brand-black/40">Start with a blank document</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setAddInitialElement(!addInitialElement)}
                          className={`w-12 h-6 rounded-full transition-all ${
                            addInitialElement ? 'bg-violet-500' : 'bg-brand-border'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-all ${
                            addInitialElement ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </label>

                      {selectedTemplate && selectedTemplate.elements.length > 0 && (
                        <div className="p-4 rounded-xl bg-brand-offwhite/50 border border-brand-border">
                          <h4 className="text-xs font-black uppercase tracking-wider text-brand-black/50 mb-3">Template Elements</h4>
                          <div className="space-y-2">
                            {selectedTemplate.elements.map((el, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm text-brand-black/70">
                                <div className="w-6 h-6 rounded-full bg-white border border-brand-border flex items-center justify-center text-[10px] font-black">
                                  {index + 1}
                                </div>
                                <span className="font-serif italic">{el.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-brand-border bg-brand-paper/50">
              <button
                onClick={step === 'template' ? resetAndClose : handleBack}
                className="px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider text-brand-black/60 hover:text-brand-black hover:bg-white transition-all border border-transparent hover:border-brand-border flex items-center gap-2"
              >
                {step !== 'template' && <ChevronLeft size={14} />}
                {step === 'template' ? 'Cancel' : 'Back'}
              </button>

              {step === 'initial' ? (
                <button
                  onClick={handleCreate}
                  className="px-6 py-2.5 rounded-full bg-violet-500 text-white text-xs font-black uppercase tracking-wider hover:bg-violet-600 transition-all shadow-md flex items-center gap-2"
                >
                  <Check size={14} />
                  Create Project
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={step === 'details' && !projectName.trim()}
                  className="px-6 py-2.5 rounded-full bg-violet-500 text-white text-xs font-black uppercase tracking-wider hover:bg-violet-600 transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
