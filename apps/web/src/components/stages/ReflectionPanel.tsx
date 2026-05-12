import { useState } from 'react';
import { motion } from 'motion/react';
import { useCreativeLoopStore } from '../../stores/creativeLoop.store';

export default function ReflectionPanel() {
  const { addReflection, setStage, reflections } = useCreativeLoopStore();
  const [progressed, setProgressed] = useState('');
  const [abandoned, setAbandoned] = useState('');
  const [nextEntry, setNextEntry] = useState('');

  const handleSubmit = () => {
    if (!progressed.trim() && !abandoned.trim() && !nextEntry.trim()) return;
    addReflection({ progressed, abandoned, nextEntry });
    setProgressed('');
    setAbandoned('');
    setNextEntry('');
  };

  return (
    <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
      <div className="mb-12">
        <p className="text-[10px] uppercase tracking-[0.25em] text-brand-black/30 font-black mb-3 leading-none">
          Stage: Reflection
        </p>
        <h1 className="text-4xl lg:text-5xl font-serif italic font-light tracking-tight">
          Session Reflection
        </h1>
        <p className="text-sm text-brand-black/40 mt-4 font-serif italic">
          Three questions to close your creative loop.
        </p>
      </div>

      <div className="space-y-10 flex-1">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/50 block mb-3">
            What did you progress today?
          </label>
          <textarea
            value={progressed}
            onChange={(e) => setProgressed(e.target.value)}
            placeholder="Finished Chapter 3, resolved the protagonist's motivation..."
            className="w-full h-24 bg-transparent text-base font-serif text-brand-black/90 placeholder-brand-black/10 resize-none outline-none border-b border-brand-border pb-3 focus:border-brand-black transition-colors"
          />
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/50 block mb-3">
            What did you abandon or defer?
          </label>
          <textarea
            value={abandoned}
            onChange={(e) => setAbandoned(e.target.value)}
            placeholder="Dropped the subplot about the underground market..."
            className="w-full h-24 bg-transparent text-base font-serif text-brand-black/90 placeholder-brand-black/10 resize-none outline-none border-b border-brand-border pb-3 focus:border-brand-black transition-colors"
          />
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/50 block mb-3">
            Where do you pick up next time?
          </label>
          <textarea
            value={nextEntry}
            onChange={(e) => setNextEntry(e.target.value)}
            placeholder="Start with the confrontation scene in Chapter 4..."
            className="w-full h-24 bg-transparent text-base font-serif text-brand-black/90 placeholder-brand-black/10 resize-none outline-none border-b border-brand-border pb-3 focus:border-brand-black transition-colors"
          />
        </div>

        {/* Past reflections */}
        {reflections.length > 0 && (
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/30 block mb-4">
              Past Reflections
            </label>
            <div className="space-y-4 max-h-64 overflow-y-auto transparent-scrollbar">
              {reflections.slice(-5).reverse().map((r) => (
                <div key={r.id} className="p-4 bg-brand-paper border border-brand-border rounded-xl">
                  <p className="text-[10px] text-brand-black/30 mb-2">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                  {r.progressed && <p className="text-sm text-brand-black/70 mb-1">→ {r.progressed}</p>}
                  {r.abandoned && <p className="text-sm text-brand-black/40 mb-1">✕ {r.abandoned}</p>}
                  {r.nextEntry && <p className="text-sm text-brand-black/50 italic">⟶ {r.nextEntry}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="py-8 flex justify-between">
        <button
          onClick={() => setStage('prime')}
          className="px-8 py-4 border border-brand-black rounded-full text-[10px] uppercase tracking-widest font-black hover:bg-brand-black hover:text-white transition-all"
        >
          ← New Session
        </button>
        <button
          onClick={handleSubmit}
          className="px-8 py-4 bg-brand-black text-white rounded-full text-[10px] uppercase tracking-widest font-black hover:opacity-90 transition-all shadow-md"
        >
          Save Reflection
        </button>
      </div>
    </div>
  );
}