/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import logo from './assets/logo.png';
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
  ShieldCheck,
  Download,
  FileText,
  FileDown,
  FileImage,
  Moon,
  Sun,
  Compass,
  BookOpen
} from 'lucide-react';
import { useThemeStore } from './stores/themeStore';
import { useCreativeLoopStore, STAGE_CONFIG, STAGE_ORDER } from './stores/creativeLoop.store';
import type { LoopStage } from './stores/creativeLoop.store';
import ReactMarkdown from 'react-markdown';
import { MuseRockState, MuseRockMessage, ApiProvider, OasisUser } from './types';
import { createAIService, createApiKeyService, getAIMode, setAIMode, type AIMode, type LocalAIService, type CloudAIService } from './services/ai-provider';
import { auth, loginWithGoogle, db } from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { doc, getDocFromServer, setDoc, serverTimestamp } from 'firebase/firestore';
import ContinueWithOasisButton from './components/ContinueWithOasisButton';
import MuseDashboard from './components/MuseDashboard';
import MuseSphere from './components/MuseSphere';
import { MuseSphereProvider } from './providers/MuseSphereProvider';
import { exportToMarkdown, exportToWord, exportToPDF } from './utils/export';
import PrimeBrief from './components/stages/PrimeBrief';
import ReflectionPanel from './components/stages/ReflectionPanel';
import DivergenceCards from './components/stages/DivergenceCards';

export default function App() {
  const { currentStage, setStage } = useCreativeLoopStore();
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
        // Remove apiKeys from localStorage - they are now stored server-side
        if (parsed.apiKeys) {
          delete parsed.apiKeys;
        }
        if (parsed.apiKey) {
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
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOasisLoading, setIsOasisLoading] = useState(false);
  const [oasisError, setOasisError] = useState<string | null>(null);
  const [isUserPanelOpen, setIsUserPanelOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<{[key: string]: boolean}>({});
  const [aiMode, setAiModeState] = useState<AIMode>(getAIMode());
  const aiServiceRef = useRef<LocalAIService | CloudAIService | null>(null);
  const apiKeyServiceRef = useRef<ReturnType<typeof createApiKeyService> | null>(null);
  const { isDark, toggleTheme } = useThemeStore();

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
    const handleOAuthCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get('error');

      if (error) {
        setOasisError(error);
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    };

    // Check if user is already authenticated with Oasis
    const checkOasisAuth = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/auth/userinfo`, {
          credentials: 'include',
        });
        if (response.ok) {
          const userInfo = await response.json();
          if (!userInfo.error) {
            setOasisUser(userInfo);
          }
        }
      } catch (err) {
        console.error('Error checking Oasis auth:', err);
      }
    };

    handleOAuthCallback();
    checkOasisAuth();
  }, []);

  useEffect(() => {
    // Save state without apiKeys to localStorage
    const stateToSave = { ...state };
    delete (stateToSave as any).apiKeys;
    localStorage.setItem('muserock_state', JSON.stringify(stateToSave));
    
    // Initialize AI service based on current mode
    aiServiceRef.current = createAIService(state.apiProvider) as any;
    apiKeyServiceRef.current = createApiKeyService() as any;
    
    // Check API key status
    checkApiKeyStatus();
  }, [state.apiProvider, aiMode]);

  const checkApiKeyStatus = async () => {
    if (!apiKeyServiceRef.current) return;
    try {
      const keys = await apiKeyServiceRef.current.list();
      const status: {[key: string]: boolean} = {};
      keys.forEach(key => {
        status[key.provider] = key.hasKey;
      });
      setApiKeyStatus(status);
    } catch (err) {
      console.error('Error checking API key status:', err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const exportMenu = document.querySelector('.export-menu-container');
      if (exportMenu && !exportMenu.contains(target)) {
        setIsExportMenuOpen(false);
      }
    };

    if (isExportMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExportMenuOpen]);

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

  const handleExport = async (format: 'markdown' | 'word' | 'pdf') => {
    setIsExporting(true);
    setIsExportMenuOpen(false);
    
    try {
      switch (format) {
        case 'markdown':
          await exportToMarkdown({ title: state.title, content: state.content });
          break;
        case 'word':
          await exportToWord({ title: state.title, content: state.content });
          break;
        case 'pdf':
          await exportToPDF({ title: state.title, content: state.content });
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleOasisLogout = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setOasisUser(null);
    } catch (err) {
      console.error('Error logging out from Oasis:', err);
    }
  };

  const performAISearch = async () => {
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

  const handleSaveApiKey = async (provider: ApiProvider, apiKey: string) => {
    if (!apiKeyServiceRef.current) return;
    try {
      await apiKeyServiceRef.current.save(provider, apiKey);
      await checkApiKeyStatus();
      alert('API Key saved securely on server');
    } catch (err) {
      alert(`Failed to save API key: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDropContent = async (content: string, type: 'text' | 'image' | 'url' | 'files') => {
    setState(prev => ({ ...prev, activeTab: 'search' }));
    setIsAiLoading(true);
    setAiResult(null);

    try {
      let prompt = '';
      switch (type) {
        case 'text':
          prompt = `Analyze this text and provide creative insights:\n\n${content}`;
          break;
        case 'image':
          prompt = `Describe this image and provide creative inspiration based on its content.`;
          break;
        case 'url':
          prompt = `Summarize the content at this URL and provide key insights:\n\n${content}`;
          break;
        case 'files':
          prompt = `Analyze these files and provide creative insights:\n\n${content}`;
          break;
      }

      const result = await aiServiceRef.current?.sourceAssets(prompt);
      setAiResult(result || 'No results found.');
    } catch (err) {
      setAiResult(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-brand-offwhite text-brand-black font-sans overflow-hidden">
      {/* --- MINIMAL RAIL (Editorial System Nav) --- */}
      <nav className="w-16 border-r border-brand-border flex flex-col items-center py-10 justify-between bg-brand-paper z-30 shrink-0">
        <div className="space-y-10 flex flex-col items-center">
          {/* Logo */}
          <div className="w-10 h-10 flex items-center justify-center select-none">
            <img src={logo} alt="MuseRock Logo" className="w-full h-full object-contain" />
          </div>
          <div className="space-y-8 flex flex-col items-center opacity-40">
            {Object.values(STAGE_CONFIG).map((stage) => (
              <RailItem
                key={stage.id}
                icon={getStageIcon(stage.icon)}
                active={currentStage === stage.id}
                onClick={() => setStage(stage.id)}
                label={stage.label}
              />
            ))}
          </div>
        </div>
        
        <div className="space-y-6 flex flex-col items-center">
          <button 
            onClick={toggleTheme}
            className="p-1.5 hover:bg-brand-black/5 rounded-full transition-colors text-brand-black/40 hover:text-brand-black"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={toggleSettings} className="p-1.5 hover:bg-brand-black/5 rounded-full transition-colors text-brand-black/40 hover:text-brand-black">
            <Settings size={20} />
          </button>
          <button 
            onClick={() => setIsUserPanelOpen(true)}
            className="w-10 h-10 rounded-full bg-brand-paper border border-brand-border flex flex-col items-center justify-center hover:bg-brand-border transition-all group relative"
          >
            {user ? (
              <img src={user.photoURL || ''} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full object-cover" />
            ) : oasisUser ? (
              <img src={oasisUser.avatar_url || ''} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <User size={18} className="text-brand-black/40 group-hover:text-brand-black" />
            )}
            <span className="absolute -bottom-1 text-[8px] font-black uppercase tracking-widest text-brand-black/30 group-hover:text-brand-black/60 transition-colors whitespace-nowrap">
              {user?.displayName || oasisUser?.display_name || 'User'}
            </span>
          </button>
        </div>
      </nav>

      {/* --- MAIN CREATIVE AREA --- */}
      <main className="flex-1 flex flex-col p-8 md:p-12 lg:p-16 bg-brand-paper relative overflow-hidden transition-all">
        <header className="mb-12 flex justify-between items-end max-w-4xl mx-auto w-full">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-brand-black/30 font-black mb-3 leading-none">
              Stage: {STAGE_CONFIG[currentStage].label}
            </p>
            <input 
              className="text-4xl lg:text-5xl font-serif italic font-light tracking-tight bg-transparent outline-none w-full"
              value={state.title}
              onChange={(e) => setState(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Untitled Draft"
            />
          </div>
          <div className="flex space-x-3 mb-2 shrink-0">
             <div className="relative export-menu-container">
               <button 
                 onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                 className="px-5 py-2 border border-brand-black rounded-full text-[10px] uppercase tracking-widest font-black hover:bg-brand-black/5 transition-all flex items-center gap-2"
               >
                 <Download size={14} />
                 {isExporting ? 'Exporting...' : 'Export'}
               </button>
               <AnimatePresence>
                 {isExportMenuOpen && (
                   <motion.div
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     className="absolute top-full right-0 mt-2 bg-brand-paper border border-brand-border rounded-xl shadow-xl py-2 z-50 min-w-[180px]"
                   >
                     <button 
                       onClick={() => handleExport('markdown')}
                       className="w-full px-4 py-3 text-left text-sm hover:bg-brand-paper flex items-center gap-3 transition-colors"
                     >
                       <FileText size={16} className="text-brand-black/60" />
                       <span>Export as Markdown</span>
                     </button>
                     <button 
                       onClick={() => handleExport('word')}
                       className="w-full px-4 py-3 text-left text-sm hover:bg-brand-paper flex items-center gap-3 transition-colors"
                     >
                       <FileDown size={16} className="text-brand-black/60" />
                       <span>Export as Word</span>
                     </button>
                     <button 
                       onClick={() => handleExport('pdf')}
                       className="w-full px-4 py-3 text-left text-sm hover:bg-brand-paper flex items-center gap-3 transition-colors"
                     >
                       <FileImage size={16} className="text-brand-black/60" />
                       <span>Export as PDF</span>
                     </button>
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
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
          {currentStage === 'cloister' && (
            <>
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
            </>
          )}
          {currentStage === 'divergence' && (
            <>
              <div className="absolute top-0 left-0 w-full h-full">
                <textarea
                  value={state.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Your writing appears here. Switch to The Cloister for full-screen writing."
                  className="w-full h-full bg-transparent text-xl leading-[1.8] font-serif text-brand-black/90 placeholder-brand-black/10 resize-none outline-none transparent-scrollbar pr-4 py-4"
                />
              </div>
              <div className="absolute bottom-4 right-0 text-[10px] uppercase tracking-widest font-black text-brand-black/20 pointer-events-none">
                Divergence Mode - AI Generating Contrasting Ideas
              </div>
            </>
          )}
          {currentStage === 'prime' && <PrimeBrief />}
          {currentStage === 'reflection' && <ReflectionPanel />}
        </section>

        {/* Creative Loop Stage Indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-border">
          <motion.div
            className="h-full bg-brand-black"
            initial={false}
            animate={{
              width: `${((STAGE_ORDER.indexOf(currentStage) + 1) / STAGE_ORDER.length) * 100}%`,
            }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          />
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {STAGE_ORDER.map((stage, i) => (
            <button
              key={stage}
              onClick={() => setStage(stage)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentStage === stage
                  ? 'bg-brand-black scale-125'
                  : i < STAGE_ORDER.indexOf(currentStage)
                    ? 'bg-brand-black/40'
                    : 'bg-brand-border'
              }`}
              title={STAGE_CONFIG[stage].label}
            />
          ))}
        </div>
      </main>

      {/* --- RIGHT FUNCTION AREA: Muse panel --- */}
      <AnimatePresence>
        {currentStage === 'divergence' && (
          <motion.aside 
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-[400px] bg-brand-paper border-l border-brand-border flex flex-col z-20 shadow-2xl"
          >
            <div className="p-8 border-b border-brand-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[10px] uppercase tracking-[0.25em] font-black text-brand-black/30">Muse Engine</h2>
                <button onClick={() => setStage('cloister')} className="p-1 hover:bg-brand-black/5 rounded text-brand-black/40">
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

            <div className="flex-1 overflow-y-auto p-6 transparent-scrollbar">
              <DivergenceCards />
            </div>

            <div className="p-6 bg-brand-black text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${apiKeyStatus[state.apiProvider] ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></div>
                  <span className="text-[10px] uppercase font-black tracking-[0.2em]">{state.apiProvider} {apiKeyStatus[state.apiProvider] ? 'Connected' : 'Not Configured'}</span>
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
              className="relative w-full max-w-xl bg-brand-paper border border-brand-black shadow-[24px_24px_0px_0px_rgba(26,26,26,0.1)] p-12"
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
                {/* AI Mode Toggle */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/50 flex items-center gap-2">
                    <ShieldCheck size={14} />
                    AI Connection Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { setAIMode('cloud'); setAiModeState('cloud'); }}
                      className={`py-3 rounded-xl border-2 font-black uppercase tracking-[0.15em] text-[10px] transition-all ${
                        aiMode === 'cloud'
                          ? 'border-brand-black bg-brand-black text-white'
                          : 'border-brand-border bg-brand-paper text-brand-black/60 hover:border-brand-black/30'
                      }`}
                    >
                      Cloud (Server Proxy)
                    </button>
                    <button
                      onClick={() => { setAIMode('local'); setAiModeState('local'); }}
                      className={`py-3 rounded-xl border-2 font-black uppercase tracking-[0.15em] text-[10px] transition-all ${
                        aiMode === 'local'
                          ? 'border-brand-black bg-brand-black text-white'
                          : 'border-brand-border bg-brand-paper text-brand-black/60 hover:border-brand-black/30'
                      }`}
                    >
                      Local (Direct API)
                    </button>
                  </div>
                  <p className="text-[11px] text-brand-black/40 leading-relaxed italic">
                    {aiMode === 'cloud'
                      ? 'Keys are encrypted and stored on the server. Requires backend running.'
                      : 'Keys are stored in your browser. Works offline without backend.'}
                  </p>
                </div>

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
                    {state.apiProvider.toUpperCase()} API Key
                    {apiKeyStatus[state.apiProvider] && (
                      <span className="text-green-500 text-[8px] ml-2">✓ Configured</span>
                    )}
                  </label>
                  <input 
                    type="password"
                    id={`api-key-${state.apiProvider}`}
                    placeholder={`Enter ${state.apiProvider} API key...`}
                    className="w-full px-5 py-4 bg-brand-paper border border-brand-border rounded-xl font-mono text-sm focus:border-brand-black outline-none shadow-inner transition-all"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const input = document.getElementById(`api-key-${state.apiProvider}`) as HTMLInputElement;
                        if (input?.value) {
                          handleSaveApiKey(state.apiProvider, input.value);
                          input.value = '';
                        }
                      }}
                      className="flex-1 py-3 bg-brand-black text-white font-black uppercase tracking-[0.2em] text-[10px] hover:opacity-90 transition-all rounded-xl"
                    >
                      Save Securely
                    </button>
                    {apiKeyStatus[state.apiProvider] && (
                      <button
                        onClick={() => apiKeyServiceRef.current?.delete(state.apiProvider)}
                        className="px-4 py-3 border border-red-300 text-red-500 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-red-50 transition-all rounded-xl"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="p-5 bg-brand-paper border-l-4 border-brand-black rounded-r-xl">
                    <p className="text-[11px] text-brand-black/60 leading-relaxed italic">
                      {aiMode === 'cloud'
                        ? 'Your API key is encrypted and stored securely on the server. It is never stored in your browser\'s local storage.'
                        : 'Your API key is stored in your browser\'s local storage. This is fine for local-only use. Switch to Cloud mode for server-side encryption.'}
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

      <AnimatePresence>
        {isUserPanelOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUserPanelOpen(false)}
              className="absolute inset-0 bg-brand-paper/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="relative w-full max-w-md bg-brand-paper border border-brand-black shadow-[24px_24px_0px_0px_rgba(26,26,26,0.1)] p-12"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-serif italic tracking-tighter">Account</h3>
                  <p className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-black/30 mt-2">Manage Your Session</p>
                </div>
                <button onClick={() => setIsUserPanelOpen(false)} className="p-3 hover:bg-brand-paper rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              {user || oasisUser ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-brand-paper rounded-xl">
                    <div className="w-14 h-14 rounded-full bg-brand-border overflow-hidden border border-brand-black/10">
                      {user?.photoURL ? (
                        <img src={user.photoURL} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      ) : oasisUser?.avatar_url ? (
                        <img src={oasisUser.avatar_url} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      ) : (
                        <User size={24} className="m-auto text-brand-black/40" />
                      )}
                    </div>
                    <div>
                      <p className="font-serif italic text-lg">
                        {user?.displayName || oasisUser?.display_name || 'User'}
                      </p>
                      <p className="text-sm text-brand-black/50">
                        {user?.email || oasisUser?.email || 'No email provided'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (user) handleLogout();
                      else handleOasisLogout();
                      setIsUserPanelOpen(false);
                    }}
                    className="w-full py-4 border border-brand-black rounded-xl text-[10px] uppercase tracking-[0.2em] font-black hover:bg-brand-black hover:text-white transition-all"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-[11px] text-brand-black/60 leading-relaxed italic text-center">
                    Connect your account to enable cloud sync and additional features.
                  </p>
                  <div className="space-y-4">
                    <button 
                      onClick={() => {
                        handleLogin();
                        setIsUserPanelOpen(false);
                      }}
                      className="w-full py-4 bg-brand-black text-white rounded-xl text-[10px] uppercase tracking-[0.2em] font-black hover:opacity-90 transition-all flex items-center justify-center gap-3"
                    >
                      <ShieldCheck size={16} className="text-blue-400" />
                      Continue with Google
                    </button>
                    <ContinueWithOasisButton className="w-full" />
                  </div>
                </div>
              )}

              {isOasisLoading && (
                <div className="flex items-center justify-center gap-3 mt-6 text-sm text-brand-black/60">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Authenticating...</span>
                </div>
              )}
              {oasisError && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{oasisError}</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <MuseDashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
      />

      <MuseSphereProvider
        isAiActive={isAiLoading}
        onQuickAction={async (action: string) => {
          switch (action) {
            case 'inspiration':
              setState(prev => ({ ...prev, activeTab: 'search' }));
              setAiResult(null);
              await getInspirationIdea('Plot Twist');
              break;
            case 'search':
              setState(prev => ({ ...prev, activeTab: 'search' }));
              setAiResult(null);
              break;
            case 'write':
              setState(prev => ({ ...prev, activeTab: 'write' }));
              break;
            case 'note':
              break;
          }
        }}
        onDropContent={handleDropContent}
      >
        <MuseSphere />
      </MuseSphereProvider>
    </div>
  );
}

function getStageIcon(iconName: string) {
  switch (iconName) {
    case 'Compass': return <Compass size={20} />;
    case 'PenTool': return <PenTool size={20} />;
    case 'Sparkles': return <Sparkles size={20} />;
    case 'BookOpen': return <BookOpen size={20} />;
    default: return <Sparkles size={20} />;
  }
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
      className="p-5 border border-brand-border rounded-xl bg-brand-paper hover:border-brand-black hover:shadow-lg transition-all text-left flex flex-col gap-3 group"
    >
      <div className="w-8 h-8 rounded-lg bg-brand-paper flex items-center justify-center group-hover:scale-110 transition-transform">
        <Sparkles size={14} className="text-brand-accent" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-brand-black/60 group-hover:text-brand-black transition-colors">{label}</p>
    </button>
  );
}