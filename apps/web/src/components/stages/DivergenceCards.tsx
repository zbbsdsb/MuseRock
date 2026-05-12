import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Sparkles } from 'lucide-react';
import { useCreativeLoopStore } from '../../stores/creativeLoop.store';

export default function DivergenceCards() {
  const { ideaCards, addIdeaCard, removeIdeaCard, toggleCardAcceptance } = useCreativeLoopStore();

  const handleAddCard = () => {
    const categories = ['character', 'conflict', 'setting', 'theme', 'dialogue', 'plot'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    addIdeaCard({
      content: 'New idea...',
      category: randomCategory as any,
      rationale: '',
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      character: 'border-amber-400 bg-amber-50',
      conflict: 'border-red-400 bg-red-50',
      setting: 'border-blue-400 bg-blue-50',
      theme: 'border-purple-400 bg-purple-50',
      dialogue: 'border-green-400 bg-green-50',
      plot: 'border-pink-400 bg-pink-50',
    };
    return colors[category] || 'border-gray-400 bg-gray-50';
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      character: 'Character',
      conflict: 'Conflict',
      setting: 'Setting',
      theme: 'Theme',
      dialogue: 'Dialogue',
      plot: 'Plot',
    };
    return labels[category] || category;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[10px] uppercase tracking-[0.25em] font-black text-brand-black/30">
          Divergence Cards
        </h2>
        <button
          onClick={handleAddCard}
          className="p-2 border border-brand-border rounded-full hover:border-brand-black hover:bg-brand-paper transition-all"
        >
          <Plus size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 transparent-scrollbar">
        <AnimatePresence>
          {ideaCards.map((card) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              className={`relative p-4 rounded-xl border-2 ${getCategoryColor(card.category)} ${
                card.accepted ? 'ring-2 ring-brand-black/20' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-black/60">
                  {getCategoryLabel(card.category)}
                </span>
                <button
                  onClick={() => removeIdeaCard(card.id)}
                  className="p-1 hover:bg-brand-black/5 rounded transition-colors"
                >
                  <X size={14} className="text-brand-black/40" />
                </button>
              </div>
              
              <textarea
                value={card.content}
                onChange={(e) => {
                  // Find the card and update its content
                  const store = useCreativeLoopStore.getState();
                  const cardIndex = store.ideaCards.findIndex((c) => c.id === card.id);
                  if (cardIndex !== -1) {
                    const updatedCards = [...store.ideaCards];
                    updatedCards[cardIndex] = { ...card, content: e.target.value };
                    useCreativeLoopStore.getState().updateIdeaCards(updatedCards);
                  }
                }}
                placeholder="Write your idea here..."
                className="w-full bg-transparent text-sm font-serif text-brand-black/80 placeholder-brand-black/20 resize-none outline-none"
                rows={3}
              />
              
              {card.rationale && (
                <div className="mt-3 pt-3 border-t border-brand-black/10">
                  <p className="text-xs text-brand-black/50 italic">{card.rationale}</p>
                </div>
              )}
              
              <div className="mt-3 flex items-center justify-between">
                <button
                  onClick={() => toggleCardAcceptance(card.id)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                    card.accepted
                      ? 'bg-brand-black text-white'
                      : 'border border-brand-border hover:border-brand-black hover:bg-brand-paper'
                  }`}
                >
                  {card.accepted ? 'Accepted' : 'Accept'}
                </button>
                <Sparkles size={14} className="text-brand-black/20" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {ideaCards.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Sparkles size={32} className="text-brand-black/10 mb-4" />
            <p className="text-sm text-brand-black/40 font-serif italic">
              Add cards to explore contrasting ideas
            </p>
            <button
              onClick={handleAddCard}
              className="mt-4 px-4 py-2 border border-brand-border rounded-full text-[10px] uppercase tracking-widest font-black hover:border-brand-black hover:bg-brand-paper transition-all"
            >
              Generate Idea
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-brand-border flex items-center justify-between">
        <span className="text-[10px] text-brand-black/30">
          {ideaCards.length} cards ({ideaCards.filter((c) => c.accepted).length} accepted)
        </span>
        <button
          onClick={() => {
            const acceptedCards = ideaCards.filter((c) => c.accepted);
            if (acceptedCards.length > 0) {
              alert(`Accepted ${acceptedCards.length} cards!`);
            }
          }}
          className="px-4 py-2 bg-brand-black text-white rounded-full text-[10px] uppercase tracking-widest font-black hover:opacity-90 transition-all"
        >
          Commit
        </button>
      </div>
    </div>
  );
}