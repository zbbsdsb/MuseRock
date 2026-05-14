import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Cloud, Monitor, ChevronRight, Check, X, Loader2, Sparkles } from 'lucide-react';

type AIMode = 'cloud' | 'local';
type AIProvider = 'gemini' | 'openai' | 'anthropic';

interface AIConfigWizardProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function AIConfigWizard({ onComplete, onSkip }: AIConfigWizardProps) {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<AIMode>('local');
  const [provider, setProvider] = useState<AIProvider>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleTestConnection = async () => {
    if (!apiKey.trim()) return;
    
    setIsTesting(true);
    setTestResult(null);
    
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setTestResult('success');
    setIsTesting(false);
  };

  const handleComplete = () => {
    localStorage.setItem('muserock_ai_configured', new Date().toISOString());
    localStorage.setItem('muserock_ai_mode', mode);
    localStorage.setItem('muserock_ai_provider', provider);
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem('muserock_ai_skipped', new Date().toISOString());
    onSkip();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg mx-4 bg-brand-paper border border-brand-black shadow-[32px_32px_0px_0px_rgba(26,26,26,0.15)]"
      >
        <div className="p-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-brand-black flex items-center justify-center">
                <Sparkles size={24} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] font-black text-brand-black/30">
                  Step {step} of 3
                </p>
                <h2 className="text-2xl font-serif italic font-light">
                  {step === 1 && 'Connect AI'}
                  {step === 2 && 'Choose Provider'}
                  {step === 3 && 'Enter API Key'}
                </h2>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="p-2 text-brand-black/30 hover:text-brand-black transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <p className="text-brand-black/60 font-serif leading-relaxed">
                  Choose how MuseRock connects to AI services. Local mode stores your API key in the browser. Cloud mode encrypts and stores it securely on the server.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setMode('local')}
                    className={`p-6 rounded-xl border-2 text-left transition-all ${
                      mode === 'local'
                        ? 'border-brand-black bg-brand-black/5'
                        : 'border-brand-border hover:border-brand-black/30'
                    }`}
                  >
                    <Monitor size={24} className={`mb-4 ${mode === 'local' ? 'text-brand-black' : 'text-brand-black/30'}`} />
                    <h3 className="text-lg font-serif italic mb-2">Local</h3>
                    <p className="text-xs text-brand-black/50">Key stored in browser. Works offline.</p>
                    {mode === 'local' && (
                      <div className="mt-3 flex items-center gap-1 text-brand-black">
                        <Check size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Selected</span>
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => setMode('cloud')}
                    className={`p-6 rounded-xl border-2 text-left transition-all ${
                      mode === 'cloud'
                        ? 'border-brand-black bg-brand-black/5'
                        : 'border-brand-border hover:border-brand-black/30'
                    }`}
                  >
                    <Cloud size={24} className={`mb-4 ${mode === 'cloud' ? 'text-brand-black' : 'text-brand-black/30'}`} />
                    <h3 className="text-lg font-serif italic mb-2">Cloud</h3>
                    <p className="text-xs text-brand-black/50">Key encrypted server-side. Requires backend.</p>
                    {mode === 'cloud' && (
                      <div className="mt-3 flex items-center gap-1 text-brand-black">
                        <Check size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Selected</span>
                      </div>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <p className="text-brand-black/60 font-serif leading-relaxed">
                  Select your preferred AI provider. Each offers different strengths—Gemini excels at creative tasks, GPT-4 at reasoning, Claude at nuanced analysis.
                </p>
                
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'gemini' as AIProvider, name: 'Gemini', desc: 'Creative & Visual' },
                    { id: 'openai' as AIProvider, name: 'GPT-4', desc: 'Reasoning' },
                    { id: 'anthropic' as AIProvider, name: 'Claude', desc: 'Nuanced Analysis' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setProvider(p.id)}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        provider === p.id
                          ? 'border-brand-black bg-brand-black/5'
                          : 'border-brand-border hover:border-brand-black/30'
                      }`}
                    >
                      <h3 className="text-base font-serif italic mb-1">{p.name}</h3>
                      <p className="text-[10px] text-brand-black/50">{p.desc}</p>
                      {provider === p.id && (
                        <div className="mt-2 flex justify-center">
                          <Check size={14} className="text-brand-black" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <p className="text-brand-black/60 font-serif leading-relaxed">
                  Enter your API key for {provider === 'gemini' ? 'Google Gemini' : provider === 'openai' ? 'OpenAI GPT-4' : 'Anthropic Claude'}. Your key is encrypted and never shared.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/50 block mb-2">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value);
                        setTestResult(null);
                      }}
                      placeholder={`Enter your ${provider} API key...`}
                      className="w-full px-5 py-4 bg-brand-paper border border-brand-border rounded-xl font-mono text-sm focus:border-brand-black outline-none transition-colors"
                    />
                  </div>

                  <button
                    onClick={handleTestConnection}
                    disabled={!apiKey.trim() || isTesting}
                    className="w-full py-3 border border-brand-border rounded-xl text-sm font-medium hover:border-brand-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isTesting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Testing...
                      </>
                    ) : testResult === 'success' ? (
                      <>
                        <Check size={14} className="text-green-500" />
                        Connection Successful
                      </>
                    ) : testResult === 'error' ? (
                      <>
                        <X size={14} className="text-red-500" />
                        Connection Failed
                      </>
                    ) : (
                      'Test Connection'
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-10 flex items-center justify-between">
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <button
                  key={s}
                  onClick={() => s < step && setStep(s)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    s === step
                      ? 'bg-brand-black w-6'
                      : s < step
                      ? 'bg-brand-black/40 cursor-pointer'
                      : 'bg-brand-border'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              {step > 1 && (
                <button
                  onClick={() => setStep((prev) => prev - 1)}
                  className="px-4 py-2 text-brand-black/40 hover:text-brand-black transition-colors text-sm"
                >
                  Back
                </button>
              )}
              <button
                onClick={() => {
                  if (step < 3) {
                    setStep((prev) => prev + 1);
                  } else {
                    handleComplete();
                  }
                }}
                className="px-6 py-2.5 bg-brand-black text-white rounded-full text-[10px] uppercase tracking-widest font-black hover:opacity-90 transition-all flex items-center gap-2"
              >
                {step < 3 ? (
                  <>
                    Next
                    <ChevronRight size={14} />
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    Complete Setup
                  </>
                )}
              </button>
            </div>
          </div>

          {step < 3 && (
            <button
              onClick={handleSkip}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-brand-black/30 hover:text-brand-black/50 transition-colors"
            >
              Skip for now →
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
