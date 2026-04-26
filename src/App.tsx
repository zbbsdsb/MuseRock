/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PenTool, 
  Sparkles, 
  Search, 
  Settings, 
  History, 
  ChevronLeft, 
  ChevronRight,
  Github,
   LogOut,
  User,
  X,
  Keyboard,
  Loader2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { MuseRockState, MuseRockMessage, ApiProvider, OasisUser } from './types';
import { AIService } from './services/ai';
import { auth, loginWithGoogle, db } from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { doc, getDocFromServer, setDoc, serverTimestamp } from 'firebase/firestore';
import { oasisAuthService } from './services/oasisAuth';
import ContinueWithOasisButton from './components/ContinueWithOasisButton';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [oasisUser, setOasisUser] = useState<OasisUser | null>(null);
  const [state, setState] = useState<MuseRockState>(() => {
    const saved = localStorage.getItem('muserock_state');
    const defaults: MuseRockState = {
      apiProvider: 'gemini',
      apiKeys: {
        gemini: '',
        openai: '',
        anthropic: '',
        custom: ''
      },
      isSettingsOpen: false,
      activeTab: 'write',
      content: '',
      history: [],
      title: 'Neon Cathedral'
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration: If user has old 'apiKey' field, move it to gemini
        if (parsed.apiKey && !parsed.apiKeys) {
          parsed.apiKeys = { ...defaults.apiKeys, gemini: parsed.apiKey };
          delete parsed.apiKey;
        }
        return { ...defaults, ...parsed };
      } catch (e) {
        return defaults;
      }
    }
    return defaults;
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOasisLoading, setIsOasisLoading] = useState(false);
  const [oasisError, setOasisError] = useState<string | null>(null);
  const aiServiceRef = useRef<AIService | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currUser) => {
      setUser(currUser);
      if (currUser) {
        getDocFromServer(doc(db, 'test', 'connection')).catch(() => {});
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Handle OAuth callback
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      if (error) {
        const errorDescription = urlParams.get('error_description');
        setOasisError(errorDescription || 'Authorization failed');
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (code && state) {
        setIsOasisLoading(true);
        setOasisError(null);
        try {
          // Validate state
          if (!oasisAuthService.validateState(state)) {
            throw new Error('Invalid state parameter');
          }

          // Exchange code for tokens
          await oasisAuthService.exchangeCodeForTokens(code);
          
          // Get user info
          const userInfo = await oasisAuthService.getUserInfo();
          setOasisUser(userInfo);
          
          // Clear URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
          setOasisError(err instanceof Error ? err.message : 'Authentication failed');
        } finally {
          setIsOasisLoading(false);
        }
      }
    };

    // Check if user is already authenticated with Oasis
    const checkOasisAuth = async () => {
      if (oasisAuthService.isAuthenticated()) {
        try {
          const userInfo = await oasisAuthService.getUserInfo();
          setOasisUser(userInfo);
        } catch (err) {
          // Token might be expired, clear it
          oasisAuthService.clearTokens();
        }
      }
    };

    handleOAuthCallback();
    checkOasisAuth();
  }, []);

  useEffect(() => {
    localStorage.setItem('muserock_state', JSON.stringify(state));
    const currentKey = state.apiKeys?.[state.apiProvider];
    if (currentKey) {
      aiServiceRef.current = new AIService(state.apiProvider, currentKey);
    }
  }, [state]);

  const toggleSettings = () => setState(prev => ({ ...prev, isSettingsOpen: !prev.isSettingsOpen }));
  
  const handleContentChange = (val: string) => setState(prev => ({ ...prev, content: val }));

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleOasisLogout = () => {
    oasisAuthService.clearTokens();
    setOasisUser(null);
  };

  const performAISearch = async () => {
    const currentKey = state.apiKeys?.[state.apiProvider];
    if (!currentKey) {
      toggleSettings();
      return;
    }
    if (!searchQuery.trim()) return;

    setIsAiLoading(true);
    setAiResult(null);
    try {
      const result = await aiServiceRef.current?.sourceAssets(searchQuery);
      setAiResult(result || 'No results found.');
    } catch (err) {
      setAiResult(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const getInspirationIdea = async (type: string) => {
    const currentKey = state.apiKeys?.[state.apiProvider];
    if (!currentKey) {
      toggleSettings();
      return;
    }

    setIsAiLoading(true);
    setAiResult(null);
    try {
      const result = await aiServiceRef.current?.getInspiration(state.content, type);
      setAiResult(result || 'No inspiration found.');
    } catch (err) {
      setAiResult(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-brand-offwhite text-brand-black font-sans overflow-hidden">
      {/* --- MINIMAL RAIL (Editorial System Nav) --- */}
      <nav className="w-16 border-r border-brand-border flex flex-col items-center py-10 justify-between bg-white z-30 shrink-0">
        <div className="space-y-10 flex flex-col items-center">
          {/* Logo "M" */}
          <div className="w-10 h-10 bg-brand-black flex items-center justify-center text-white font-bold text-xl select-none">
            M
          </div>
          <div className="space-y-8 flex flex-col items-center opacity-40">
            <RailItem 
              icon={<PenTool size={20} />} 
              active={state.activeTab === 'write'} 
              onClick={() => setState(prev => ({ ...prev, activeTab: 'write' }))} 
              label="Workspace"
            />
            <RailItem 
              icon={<Search size={20} />} 
              active={state.activeTab === 'search'} 
              onClick={() => {
                setState(prev => ({ ...prev, activeTab: 'search' }));
                setAiResult(null);
              }} 
              label="Assets"
            />
            <RailItem 
              icon={<Sparkles size={20} />} 
              active={state.activeTab === 'inspiration'} 
              onClick={() => {
                setState(prev => ({ ...prev, activeTab: 'inspiration' }));
                setAiResult(null);
              }} 
              label="Muse"
            />
          </div>
        </div>
        
        <div className="space-y-6 flex flex-col items-end">
           <button onClick={toggleSettings} className="p-1.5 hover:bg-brand-black/5 rounded-full transition-colors text-brand-black/40 hover:text-brand-black">
             <Settings size={20} />
           </button>
           {user ? (
             <button onClick={handleLogout} className="w-8 h-8 rounded-full bg-brand-border overflow-hidden border border-brand-black/10">
               {user.photoURL ? <img src={user.photoURL} referrerPolicy="no-referrer" /> : <User size={14} className="m-auto" />}
             </button>
           ) : oasisUser ? (
             <button onClick={handleOasisLogout} className="w-8 h-8 rounded-full bg-brand-border overflow-hidden border border-brand-black/10">
               {oasisUser.avatar_url ? <img src={oasisUser.avatar_url} referrerPolicy="no-referrer" /> : <User size={14} className="m-auto" />}
             </button>
           ) : (
             <div className="flex flex-col items-end gap-2">
               <button onClick={handleLogin} className="w-8 h-8 rounded-full bg-brand-paper border border-brand-border flex items-center justify-center hover:bg-brand-border transition-colors">
                 <ShieldCheck size={16} className="text-blue-500" />
               </button>
               <ContinueWithOasisButton />
             </div>
           )}
           {isOasisLoading && (
             <div className="flex items-center gap-2 text-sm text-brand-black/60">
               <Loader2 size={14} className="animate-spin" />
               <span>Authenticating...</span>
             </div>
           )}
           {oasisError && (
             <div className="text-sm text-red-500 max-w-xs text-right">
               {oasisError}
             </div>
           )}
        </div>
      </nav>

      {/* --- MAIN CREATIVE AREA --- */}
      <main className="flex-1 flex flex-col p-8 md:p-12 lg:p-16 bg-brand-paper relative overflow-hidden transition-all">
        <header className="mb-12 flex justify-between items-end max-w-4xl mx-auto w-full">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-brand-black/30 font-black mb-3 leading-none">
              Project: {state.title || 'Muse Draft'}
            </p>
            <input 
              className="text-4xl lg:text-5xl font-serif italic font-light tracking-tight bg-transparent outline-none w-full"
              value={state.title}
              onChange={(e) => setState(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Untitled Draft"
            />
          </div>
          <div className="flex space-x-3 mb-2 shrink-0">
             <button className="px-5 py-2 border border-brand-black rounded-full text-[10px] uppercase tracking-widest font-black hover:bg-brand-black/5 transition-all">
               Export
             </button>
             {user && (
               <button 
                 onClick={() => {
                    setDoc(doc(db, 'drafts', user.uid), {
                        ownerId: user.uid,
                        content: state.content,
                        title: state.title,
                        updatedAt: serverTimestamp()
                      }, { merge: true }).then(() => alert('Draft Persisted'));
                 }}
                 className="px-5 py-2 bg-brand-black text-white rounded-full text-[10px] uppercase tracking-widest font-black hover:opacity-90 transition-all shadow-md"
               >
                 Save Draft
               </button>
             )}
          </div>
        </header>
        
        <section className="max-w-4xl mx-auto w-full flex-1 overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-full h-full">
            <textarea
              value={state.content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="The sky above the port was the color of a television..."
              className="w-full h-full bg-transparent text-xl leading-[1.8] font-serif text-brand-black/90 placeholder-brand-black/10 resize-none outline-none transparent-scrollbar pr-4 py-4"
            />
          </div>
          <div className="absolute bottom-4 right-0 text-[10px] uppercase tracking-widest font-black text-brand-black/20 pointer-events-none group-hover:text-brand-black/40 transition-colors">
            {state.content.split(/\s+/).filter(x => x).length} Words Collected
          </div>
        </section>
      </main>

      {/* --- RIGHT FUNCTION AREA: Muse panel --- */}
      <AnimatePresence>
        {state.activeTab !== 'write' && (
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
                <button onClick={() => setState(prev => ({ ...prev, activeTab: 'write' }))} className="p-1 hover:bg-brand-black/5 rounded text-brand-black/40">
                  <X size={16} />
                </button>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && performAISearch()}
                  placeholder={state.activeTab === 'search' ? "Ask for assets..." : "Prompt for inspiration..."} 
                  className="w-full bg-brand-paper border-none rounded-xl px-4 py-4 text-sm focus:ring-1 focus:ring-brand-black outline-none tracking-tight shadow-inner" 
                />
                <button 
                  onClick={performAISearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-brand-black text-white rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col p-8 transparent-scrollbar">
              <div className="flex justify-between items-center mb-8">
                <span className="text-[14px] font-serif italic text-brand-black/60">Creation Assistance</span>
                <span className="text-[10px] font-black uppercase tracking-widest underline cursor-pointer hover:text-brand-accent transition-colors" onClick={() => setAiResult(null)}>Clear</span>
              </div>

              <div className="space-y-8 flex-1">
                {isAiLoading ? (
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
                      <SuggestionCard label="Plot Twist" onClick={() => getInspirationIdea('Plot Twist')} />
                      <SuggestionCard label="Atmosphere" onClick={() => getInspirationIdea('Atmospheric Imagery')} />
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
                  <div className={`w-2 h-2 rounded-full ${state.apiKeys[state.apiProvider] ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></div>
                  <span className="text-[10px] uppercase font-black tracking-[0.2em]">{state.apiProvider} Connected</span>
                </div>
                <div className="flex space-x-3 opacity-40">
                   <Github size={12} className="cursor-pointer" onClick={() => window.open('https://github.com', '_blank')} />
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {state.isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSettings}
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
                <button onClick={toggleSettings} className="p-3 hover:bg-brand-paper rounded-full transition-colors">
                  <X size={28} />
                </button>
              </div>

              <div className="space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/50">Active Provider</label>
                  <div className="grid grid-cols-4 gap-2">
                    <ProviderTab label="Gemini" active={state.apiProvider === 'gemini'} onClick={() => setState(prev => ({ ...prev, apiProvider: 'gemini' }))} />
                    <ProviderTab label="OpenAI" active={state.apiProvider === 'openai'} onClick={() => setState(prev => ({ ...prev, apiProvider: 'openai' }))} />
                    <ProviderTab label="Anthropic" active={state.apiProvider === 'anthropic'} onClick={() => setState(prev => ({ ...prev, apiProvider: 'anthropic' }))} />
                    <ProviderTab label="Custom" active={state.apiProvider === 'custom'} onClick={() => setState(prev => ({ ...prev, apiProvider: 'custom' }))} />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/50 flex items-center gap-2">
                    <Sparkles size={14} />
                    {state.apiProvider.toUpperCase()} Secrets
                  </label>
                  <input 
                    type="password"
                    value={state.apiKeys[state.apiProvider]}
                    onChange={(e) => {
                      const newKeys = { ...state.apiKeys, [state.apiProvider]: e.target.value };
                      setState(prev => ({ ...prev, apiKeys: newKeys }));
                    }}
                    placeholder={`Enter ${state.apiProvider} API key...`}
                    className="w-full px-5 py-4 bg-brand-paper border border-brand-border rounded-xl font-mono text-sm focus:border-brand-black outline-none shadow-inner transition-all"
                  />
                  <div className="p-5 bg-brand-paper border-l-4 border-brand-black rounded-r-xl">
                    <p className="text-[11px] text-brand-black/60 leading-relaxed italic">
                      MuseRock operates as a purely local tool. Your credentials persist only in your browser's encrypted local storage.
                    </p>
                  </div>
                </div>

                <button 
                  onClick={toggleSettings}
                  className="w-full py-5 bg-brand-black text-white font-black uppercase tracking-[0.3em] text-[10px] hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl"
                >
                  Confirm Configuration
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RailItem({ icon, active, onClick, label }: { icon: React.ReactNode; active?: boolean; onClick: () => void; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`relative group p-3 rounded-xl transition-all duration-300 ${active ? 'bg-brand-black text-white shadow-lg' : 'text-brand-black hover:bg-brand-paper'}`}
    >
      {icon}
      <div className="absolute left-16 px-3 py-2 bg-brand-black text-white text-[9px] font-black uppercase tracking-widest rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl">
        {label}
      </div>
    </button>
  );
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
