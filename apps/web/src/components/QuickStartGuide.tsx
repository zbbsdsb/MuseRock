import { motion } from 'motion/react';
import { Feather, Book, FileText, PenTool, ChevronRight } from 'lucide-react';

const TEMPLATES = [
  {
    id: 'short-story',
    icon: Feather,
    title: 'Short Story',
    description: 'A focused narrative with a clear beginning, middle, and end. Perfect for exploring a single idea or character.',
    color: 'border-amber-400/30',
    intent: 'Write a short story about [protagonist] who [discovers/deals with] [central conflict] in [setting]. The story should explore [theme or insight].',
    constraints: 'Keep it under 2,000 words. Use vivid sensory details. Let the ending resonate without over-explaining.',
    references: '',
  },
  {
    id: 'novel-chapter',
    icon: Book,
    title: 'Novel Chapter',
    description: 'A chapter from a longer work. Establish scene, character interiority, and forward momentum.',
    color: 'border-blue-400/30',
    intent: 'Continue the narrative of [project name]. This chapter should [advance plot point] while [developing character].',
    constraints: 'Aim for 1,500-3,000 words. Balance dialogue and internal thought. End with tension or revelation.',
    references: '',
  },
  {
    id: 'essay',
    icon: FileText,
    title: 'Essay',
    description: 'A personal or argumentative piece exploring an idea with nuance and evidence.',
    color: 'border-purple-400/30',
    intent: 'Write an essay arguing [central thesis]. The tone should be [conversational/formal/urgent].',
    constraints: 'Structure: hook, context, argument, evidence, reflection. Support claims with specific examples.',
    references: '',
  },
  {
    id: 'free-write',
    icon: PenTool,
    title: 'Free Write',
    description: 'Unstructured exploration. No rules, no judgment. Just write and see where it takes you.',
    color: 'border-green-400/30',
    intent: 'Explore the theme of [topic or feeling]. Don\'t plan. Start writing and let the piece find its own form.',
    constraints: 'Write continuously for at least 20 minutes. Don\'t stop to edit. Let the subconscious lead.',
    references: '',
  },
];

interface QuickStartGuideProps {
  onSelectTemplate: (template: {
    intent: string;
    constraints: string;
    references: string;
  }) => void;
  onStartFromScratch: () => void;
  onClose: () => void;
}

export default function QuickStartGuide({ onSelectTemplate, onStartFromScratch, onClose }: QuickStartGuideProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-3xl mx-4 bg-brand-paper border border-brand-black shadow-[24px_24px_0px_0px_rgba(26,26,26,0.1)] p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-black/30 mb-2">
            New Session
          </p>
          <h2 className="text-4xl font-serif italic font-light mb-3">
            Choose Your Path
          </h2>
          <p className="text-sm text-brand-black/50 font-serif italic">
            Start with a template to focus your creative energy, or begin with a blank canvas.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {TEMPLATES.map((template, index) => {
            const Icon = template.icon;
            return (
              <motion.button
                key={template.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  onSelectTemplate({
                    intent: template.intent,
                    constraints: template.constraints,
                    references: template.references,
                  });
                }}
                className={`p-6 rounded-xl border-2 bg-brand-paper text-left transition-all hover:shadow-lg hover:-translate-y-0.5 group ${template.color}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-black/5 flex items-center justify-center group-hover:bg-brand-black group-hover:text-white transition-all">
                    <Icon size={20} />
                  </div>
                  <ChevronRight size={16} className="text-brand-black/20 group-hover:text-brand-black/40 transition-colors" />
                </div>
                <h3 className="text-lg font-serif italic mb-2">{template.title}</h3>
                <p className="text-xs text-brand-black/50 leading-relaxed">
                  {template.description}
                </p>
              </motion.button>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-brand-border">
          <button
            onClick={onStartFromScratch}
            className="text-sm text-brand-black/40 hover:text-brand-black transition-colors font-medium"
          >
            Start from Scratch
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-brand-black/40 hover:text-brand-black transition-colors text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export { TEMPLATES };
