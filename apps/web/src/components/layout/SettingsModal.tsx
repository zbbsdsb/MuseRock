import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiProvider: string;
  onApiProviderChange: (provider: string) => void;
  apiKeys: Record<string, string>;
  onApiKeyChange: (key: string, value: string) => void;
}

function ProviderTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`py-3 text-[9px] font-black uppercase tracking-widest border-2 rounded-xl transition-all ${active ? 'border-brand-black bg-brand-black text-white' : 'border-brand-border text-brand-black opacity-40 hover:opacity-100 hover:bg-brand-paper'}`}
    >
      {label}
    </button>
  );
}

export default function SettingsModal({
  isOpen,
  onClose,
  apiProvider,
  onApiProviderChange,
  apiKeys,
  onApiKeyChange
}: SettingsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-paper/90 backdrop-blur-xl"
          />
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="relative w-full max-w-xl bg-white border border-brand-black shadow-[24px_24px_0px_0px_rgba(26,26,26,0.1)] p-12"
          >
            <div className="flex items-center justify-between mb-12">
              <div>
                <h3 className="text-3xl font-serif italic tracking-tighter">Muse Configuration</h3>
                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-black/30 mt-2">Provider Credentials & Global Settings</p>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-brand-paper rounded-full transition-colors">
                <X size={28} />
              </button>
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/50">Active Provider</label>
                <div className="grid grid-cols-4 gap-2">
                  <ProviderTab label="Gemini" active={apiProvider === 'gemini'} onClick={() => onApiProviderChange('gemini')} />
                  <ProviderTab label="OpenAI" active={apiProvider === 'openai'} onClick={() => onApiProviderChange('openai')} />
                  <ProviderTab label="Anthropic" active={apiProvider === 'anthropic'} onClick={() => onApiProviderChange('anthropic')} />
                  <ProviderTab label="Custom" active={apiProvider === 'custom'} onClick={() => onApiProviderChange('custom')} />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/50 flex items-center gap-2">
                  <Sparkles size={14} />
                  {apiProvider.toUpperCase()} Secrets
                </label>
                <input 
                  type="password"
                  value={apiKeys[apiProvider] || ''}
                  onChange={(e) => onApiKeyChange(apiProvider, e.target.value)}
                  placeholder={`Enter ${apiProvider} API key...`}
                  className="w-full px-5 py-4 bg-brand-paper border border-brand-border rounded-xl font-mono text-sm focus:border-brand-black outline-none shadow-inner transition-all"
                />
                <div className="p-5 bg-brand-paper border-l-4 border-brand-black rounded-r-xl">
                  <p className="text-[11px] text-brand-black/60 leading-relaxed italic">
                    MuseRock operates as a purely local tool. Your credentials persist only in your browser's encrypted local storage.
                  </p>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="w-full py-5 bg-brand-black text-white font-black uppercase tracking-[0.3em] text-[10px] hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl"
              >
                Confirm Configuration
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
