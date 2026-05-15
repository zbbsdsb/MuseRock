import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, X, Link as LinkIcon, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useCreativeLoopStore } from '../../stores/creativeLoop.store';
import SmartTip from '../SmartTip';

const EXAMPLES = {
  intent: "A noir detective story set in a city where memories can be traded like currency. The protagonist discovers that her own childhood memories have been stolen and sold to fund a conspiracy at the highest levels of government.",
  constraints: [
    "Keep the tone atmospheric and introspective",
    "Use first-person narration",
    "No resolutions in the first scene—let mystery compound",
    "Aim for 1,500-2,500 words"
  ],
  references: [
    "Blade Runner (film) — memory as identity",
    "In the Woods There Were Dark Trees (short story) — unreliable memory",
    "https://en.wikipedia.org/wiki/Noir_fiction"
  ]
};

export default function PrimeBrief() {
  const { primeBrief, updatePrimeBrief, setStage } = useCreativeLoopStore();
  const [newConstraint, setNewConstraint] = useState('');
  const [newReference, setNewReference] = useState('');
  const [showExamples, setShowExamples] = useState({
    intent: false,
    constraints: false,
  });
  const [intentTyped, setIntentTyped] = useState(false);

  const completedFields = {
    intent: primeBrief.intent.trim().length > 0,
    constraints: primeBrief.constraints.length > 0,
    references: true,
  };
  const completedCount = Object.values(completedFields).filter(Boolean).length;

  useEffect(() => {
    if (primeBrief.intent.trim().length > 50 && !intentTyped) {
      setIntentTyped(true);
    }
  }, [primeBrief.intent, intentTyped]);

  const addConstraint = () => {
    if (newConstraint.trim()) {
      updatePrimeBrief({ constraints: [...primeBrief.constraints, newConstraint.trim()] });
      setNewConstraint('');
    }
  };

  const addReference = () => {
    if (newReference.trim()) {
      updatePrimeBrief({ references: [...primeBrief.references, newReference.trim()] });
      setNewReference('');
    }
  };

  const removeConstraint = (index: number) => {
    updatePrimeBrief({ constraints: primeBrief.constraints.filter((_, i) => i !== index) });
  };

  const removeReference = (index: number) => {
    updatePrimeBrief({ references: primeBrief.references.filter((_, i) => i !== index) });
  };

  const applyExample = (field: 'intent' | 'constraints') => {
    if (field === 'intent') {
      updatePrimeBrief({ intent: EXAMPLES.intent });
    } else if (field === 'constraints') {
      updatePrimeBrief({ constraints: EXAMPLES.constraints });
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
      <SmartTip
        id="prime-character-tip"
        message="Deo可以帮你完善角色设定！当你准备好创建角色时，它会提供深度的人物塑造建议。"
        assistantName="Deo"
        position="bottom-right"
        delay={2000}
      />

      <div className="mb-12">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] uppercase tracking-[0.25em] text-brand-black/30 font-black leading-none">
            Stage: Prime
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-brand-black/30 font-black uppercase tracking-widest">
              {completedCount}/3 Complete
            </span>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i < completedCount ? 'bg-brand-black' : 'bg-brand-border'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        <h1 className="text-4xl lg:text-5xl font-serif italic font-light tracking-tight mb-2">
          Define Your Creative Intent
        </h1>
        <p className="text-sm text-brand-black/40 font-serif italic">
          Clarify what you want to create. Set boundaries. Gather inspiration.
        </p>
      </div>

      <div className="space-y-12 flex-1">
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/50">
              What are you trying to create?
            </label>
            <button
              onClick={() => {
                setShowExamples({ ...showExamples, intent: !showExamples.intent });
                if (!showExamples.intent) {
                  applyExample('intent');
                }
              }}
              className="flex items-center gap-1 text-[10px] text-brand-black/30 hover:text-brand-black transition-colors"
            >
              <Sparkles size={12} />
              {showExamples.intent ? 'Hide Example' : 'Show Example'}
            </button>
          </div>
          <textarea
            value={primeBrief.intent}
            onChange={(e) => updatePrimeBrief({ intent: e.target.value })}
            placeholder="A noir detective story set in a city where memories can be traded like currency..."
            className={`w-full h-32 bg-transparent text-lg font-serif text-brand-black/90 placeholder-brand-black/10 resize-none outline-none border-b pb-4 transition-colors ${
              completedFields.intent ? 'border-brand-black' : 'border-brand-border'
            }`}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/50">
              Constraints & Boundaries
            </label>
            <button
              onClick={() => {
                setShowExamples({ ...showExamples, constraints: !showExamples.constraints });
                if (!showExamples.constraints) {
                  applyExample('constraints');
                }
              }}
              className="flex items-center gap-1 text-[10px] text-brand-black/30 hover:text-brand-black transition-colors"
            >
              <Sparkles size={12} />
              {showExamples.constraints ? 'Hide Example' : 'Show Example'}
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {primeBrief.constraints.map((c, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-paper border border-brand-border rounded-full text-sm text-brand-black/70"
              >
                {c}
                <button onClick={() => removeConstraint(i)} className="text-brand-black/30 hover:text-brand-black">
                  <X size={14} />
                </button>
              </motion.span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newConstraint}
              onChange={(e) => setNewConstraint(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addConstraint()}
              placeholder="Add a constraint..."
              className="flex-1 px-4 py-3 bg-transparent border border-brand-border rounded-xl text-sm outline-none focus:border-brand-black transition-colors"
            />
            <button onClick={addConstraint} className="p-3 border border-brand-border rounded-xl hover:border-brand-black hover:bg-brand-paper transition-all">
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/50 block mb-4">
            References & Seeds
          </label>
          <div className="space-y-2 mb-3">
            {primeBrief.references.map((r, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-brand-paper border border-brand-border rounded-xl">
                <LinkIcon size={14} className="text-brand-black/30" />
                <span className="flex-1 text-sm text-brand-black/70 truncate">{r}</span>
                <button onClick={() => removeReference(i)} className="text-brand-black/30 hover:text-brand-black">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newReference}
              onChange={(e) => setNewReference(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addReference()}
              placeholder="Add a reference link or note..."
              className="flex-1 px-4 py-3 bg-transparent border border-brand-border rounded-xl text-sm outline-none focus:border-brand-black transition-colors"
            />
            <button onClick={addReference} className="p-3 border border-brand-border rounded-xl hover:border-brand-black hover:bg-brand-paper transition-all">
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="py-8 flex justify-between items-center">
        <button
          onClick={() => setStage('reflection')}
          className="text-sm text-brand-black/30 hover:text-brand-black transition-colors"
        >
          Skip to Reflection →
        </button>
        <button
          onClick={() => setStage('cloister')}
          className="px-8 py-4 bg-brand-black text-white rounded-full text-[10px] uppercase tracking-widest font-black hover:opacity-90 transition-all shadow-md flex items-center gap-3"
        >
          Enter The Cloister
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  );
}
