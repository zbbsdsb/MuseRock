import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Check, X, Loader2, Plus, Trash2 } from 'lucide-react';
import { useCreativeLoopStore, type IdeaCard } from '../../stores/creativeLoop.store';

const CARD_CATEGORIES = [
  { id: 'character', label: 'Character', color: 'border-amber-400/30' },
  { id: 'conflict', label: 'Conflict', color: 'border-red-400/30' },
  { id: 'symbolic', label: 'Symbolic', color: 'border-purple-400/30' },
  { id: 'structural', label: 'Structural', color: 'border-blue-400/30' },
  { id: 'worldview', label: 'Worldview', color: 'border-green-400/30' },
] as const;

interface DivergenceCardsProps {
  editorContent: string;
  onGenerate: (prompt: string) => Promise<string>;
  isLoading: boolean;
}

export default function DivergenceCards({ editorContent, onGenerate, isLoading }: DivergenceCardsProps) {
  const { ideaCards, addIdeaCard, updateIdeaCard, removeIdeaCard, clearIdeaCards } = useCreativeLoopStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [localLoading, setLocalLoading] = useState(false);

  const handleGenerateIdeas = async (prompt: string = '') => {
    setLocalLoading(true);
    try {
      const result = await onGenerate(prompt);
      
      // Try to parse JSON response
      try {
        const parsed = JSON.parse(result);
        if (Array.isArray(parsed)) {
          parsed.forEach((card: any) => {
            addIdeaCard({
              content: card.content || card.text || String(card),
              category: card.category || 'conflict',
              rationale: card.rationale || '',
            });
          });
        }
      } catch {
        // If not JSON, add as a single card
        addIdeaCard({
          content: result,
          category: 'conflict',
          rationale: 'AI-generated inspiration',
        });
      }
    } catch (err) {
      console.error('Failed to generate ideas:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleAddManualCard = () => {
    const categories = ['character', 'conflict', 'symbolic', 'structural', 'worldview'] as const;
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    addIdeaCard({
      content: 'New idea...',
      category: randomCategory,
      rationale: '',
    });
  };

  const filteredCards = selectedCategory === 'all'
    ? ideaCards
    : ideaCards.filter((c) => c.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    const cat = CARD_CATEGORIES.find(c => c.id === category);
    return cat?.color || 'border-brand-border';
  };

  const getCategoryLabel = (category: string) => {
    const cat = CARD_CATEGORIES.find(c => c.id === category);
    return cat?.label || category;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.25em] font-black text-brand-black/30">Divergence Engine</h2>
            <p className="text-xs text-brand-black/40 mt-1 font-serif italic">Generate contrasting ideas, not generic suggestions.</p>
          </div>
          <div className="flex items-center gap-2">
            {ideaCards.length > 0 && (
              <button
                onClick={clearIdeaCards}
                className="p-2 text-brand-black/30 hover:text-brand-black/60 transition-colors"
                title="Clear all cards"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-brand-black text-white'
                : 'border border-brand-border text-brand-black/50 hover:border-brand-black/30'
            }`}
          >
            All ({ideaCards.length})
          </button>
          {CARD_CATEGORIES.map((cat) => {
            const count = ideaCards.filter((c) => c.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-brand-black text-white'
                    : 'border border-brand-border text-brand-black/50 hover:border-brand-black/30'
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => handleGenerateIdeas()}
            disabled={isLoading || localLoading || !editorContent.trim()}
            className="flex-1 px-4 py-2.5 bg-brand-black text-white rounded-xl text-[10px] uppercase tracking-widest font-black hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {(isLoading || localLoading) ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Generate Ideas
              </>
            )}
          </button>
          <button
            onClick={handleAddManualCard}
            className="px-4 py-2.5 border border-brand-border rounded-xl text-[10px] uppercase tracking-widest font-black hover:border-brand-black hover:bg-brand-paper transition-all"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="flex-1 overflow-y-auto pr-1 transparent-scrollbar">
        {filteredCards.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredCards.map((card, i) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.03 }}
                  className={`p-5 rounded-xl border-2 bg-brand-paper ${getCategoryColor(card.category)} ${
                    card.isKept ? 'ring-2 ring-brand-black/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full bg-brand-black/5 flex items-center justify-center`}>
                        <Sparkles size={12} className="text-brand-black/50" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-brand-black/50">
                        {getCategoryLabel(card.category)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateIdeaCard(card.id, { isKept: card.isKept === true ? null : true })}
                        className={`p-1.5 rounded-full transition-colors ${
                          card.isKept === true
                            ? 'bg-brand-black text-white'
                            : 'text-brand-black/30 hover:text-brand-black hover:bg-brand-black/5'
                        }`}
                        title="Keep this idea"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => updateIdeaCard(card.id, { isKept: card.isKept === false ? null : false })}
                        className={`p-1.5 rounded-full transition-colors ${
                          card.isKept === false
                            ? 'bg-red-500 text-white'
                            : 'text-brand-black/30 hover:text-brand-black hover:bg-brand-black/5'
                        }`}
                        title="Discard this idea"
                      >
                        <X size={14} />
                      </button>
                      <button
                        onClick={() => removeIdeaCard(card.id)}
                        className="p-1.5 rounded-full text-brand-black/30 hover:text-brand-black hover:bg-brand-black/5 transition-colors"
                        title="Remove card"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={card.content}
                    onChange={(e) => updateIdeaCard(card.id, { content: e.target.value })}
                    className="w-full bg-transparent text-sm font-serif text-brand-black/80 placeholder-brand-black/20 resize-none outline-none mb-3"
                    rows={3}
                    placeholder="Write your idea here..."
                  />
                  {card.rationale && (
                    <div className="pt-3 border-t border-brand-black/10">
                      <textarea
                        value={card.rationale}
                        onChange={(e) => updateIdeaCard(card.id, { rationale: e.target.value })}
                        className="w-full bg-transparent text-xs text-brand-black/50 italic placeholder-brand-black/20 resize-none outline-none"
                        rows={2}
                        placeholder="Why this is a compelling divergent idea..."
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <Sparkles size={32} className="text-brand-black/10 mb-4" />
            <p className="text-sm text-brand-black/40 font-serif italic">
              {!editorContent.trim() 
                ? 'Write something in the editor first...'
                : 'Generate contrasting ideas to explore different directions'}
            </p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {ideaCards.length > 0 && (
        <div className="mt-4 pt-4 border-t border-brand-border">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-brand-black/30">
              {ideaCards.length} cards · {ideaCards.filter((c) => c.isKept).length} kept
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
