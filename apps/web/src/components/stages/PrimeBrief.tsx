import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, X, Link as LinkIcon } from 'lucide-react';
import { useCreativeLoopStore } from '../../stores/creativeLoop.store';

export default function PrimeBrief() {
  const { primeBrief, updatePrimeBrief, setStage } = useCreativeLoopStore();
  const [newConstraint, setNewConstraint] = useState('');
  const [newReference, setNewReference] = useState('');

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

  return (
    <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
      <div className="mb-12">
        <p className="text-[10px] uppercase tracking-[0.25em] text-brand-black/30 font-black mb-3 leading-none">
          Stage: Prime
        </p>
        <h1 className="text-4xl lg:text-5xl font-serif italic font-light tracking-tight">
          Define Your Creative Intent
        </h1>
      </div>

      <div className="space-y-12 flex-1">
        {/* Intent */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/50 block mb-4">
            What are you trying to create?
          </label>
          <textarea
            value={primeBrief.intent}
            onChange={(e) => updatePrimeBrief({ intent: e.target.value })}
            placeholder="A noir detective story set in a city where memories can be traded like currency..."
            className="w-full h-32 bg-transparent text-lg font-serif text-brand-black/90 placeholder-brand-black/10 resize-none outline-none border-b border-brand-border pb-4 focus:border-brand-black transition-colors"
          />
        </div>

        {/* Constraints */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/50 block mb-4">
            Constraints & Boundaries
          </label>
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

        {/* References */}
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

      {/* CTA */}
      <div className="py-8 flex justify-end">
        <button
          onClick={() => setStage('cloister')}
          className="px-8 py-4 bg-brand-black text-white rounded-full text-[10px] uppercase tracking-widest font-black hover:opacity-90 transition-all shadow-md"
        >
          Enter The Cloister →
        </button>
      </div>
    </div>
  );
}