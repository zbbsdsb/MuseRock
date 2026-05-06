import { motion } from 'motion/react';
import { X, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface MusePanelProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
  isLoading: boolean;
  aiResult: string | null;
  onClearResult: () => void;
  onGetInspiration: (type: string) => void;
  apiProvider: string;
  isApiConnected: boolean;
}

function SuggestionCard({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="p-5 border border-brand-border rounded-xl bg-white hover:border-brand-black hover:shadow-lg transition-all text-left flex flex-col gap-3 group"
    >
      <div className="w-8 h-8 rounded-lg bg-brand-paper flex items-center justify-center group-hover:scale-110 transition-transform">
        <Sparkles size={14} className="text-brand-accent" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-brand-black/60 group-hover:text-brand-black transition-colors">{label}</p>
    </button>
  );
}

export default function MusePanel({
  isOpen,
  onClose,
  searchQuery,
  onSearchQueryChange,
  onSearch,
  isLoading,
  aiResult,
  onClearResult,
  onGetInspiration,
  apiProvider,
  isApiConnected
}: MusePanelProps) {
  return (
    <motion.aside 
      initial={{ x: 400 }}
      animate={{ x: 0 }}
      exit={{ x: 400 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="w-[400px] bg-white border-l border-brand-border flex flex-col z-20 shadow-2xl"
    >
      <div className="p-8 border-b border-brand-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[10px] uppercase tracking-[0.25em] font-black text-brand-black/30">Muse Engine</h2>
          <button onClick={onClose} className="p-1 hover:bg-brand-black/5 rounded text-brand-black/40">
            <X size={16} />
          </button>
        </div>
        <div className="relative">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            placeholder="Ask for assets..." 
            className="w-full bg-brand-paper border-none rounded-xl px-4 py-4 text-sm focus:ring-1 focus:ring-brand-black outline-none tracking-tight shadow-inner" 
          />
          <button 
            onClick={onSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-brand-black text-white rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col p-8">
        <div className="flex justify-between items-center mb-8">
          <span className="text-[14px] font-serif italic text-brand-black/60">Creation Assistance</span>
          <span className="text-[10px] font-black uppercase tracking-widest underline cursor-pointer hover:text-brand-accent transition-colors" onClick={onClearResult}>Clear</span>
        </div>

        <div className="space-y-8 flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-30">
              <Loader2 size={32} className="animate-spin text-brand-black" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">Synthesizing Muse</p>
            </div>
          ) : aiResult ? (
            <div className="markdown-body text-sm leading-relaxed prose prose-stone prose-sm max-w-none animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ReactMarkdown>{aiResult}</ReactMarkdown>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <SuggestionCard label="Plot Twist" onClick={() => onGetInspiration('Plot Twist')} />
                <SuggestionCard label="Atmosphere" onClick={() => onGetInspiration('Atmospheric Imagery')} />
              </div>
              <div className="flex flex-col items-center opacity-10 py-12">
                <Sparkles size={64} strokeWidth={0.5} />
                <p className="text-[10px] uppercase tracking-[0.4em] mt-6 font-black italic">Awaiting Spark</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 bg-brand-black text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isApiConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></div>
            <span className="text-[10px] uppercase font-black tracking-[0.2em]">{apiProvider} Connected</span>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
