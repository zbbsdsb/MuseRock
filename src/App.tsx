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
import { MuseRockState, MuseRockMessage } from './types';
import { AIService } from './services/ai';
import { auth, loginWithGoogle, db } from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { doc, getDocFromServer, setDoc, serverTimestamp, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [state, setState] = useState<MuseRockState>(() => {
    const saved = localStorage.getItem('muserock_state');
    const initial = saved ? JSON.parse(saved) : {
      apiKey: '',
      isSettingsOpen: false,
      activeTab: 'write',
      content: '',
      history: []
    };
    return initial;
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const aiServiceRef = useRef<AIService | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currUser) => {
      setUser(currUser);
      if (currUser) {
        // Test connection as per guidelines
        getDocFromServer(doc(db, 'test', 'connection')).catch(() => {});
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('muserock_state', JSON.stringify(state));
    if (state.apiKey) {
      aiServiceRef.current = new AIService(state.apiKey);
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

  const performAISearch = async () => {
    if (!state.apiKey) {
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
    if (!state.apiKey) {
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
    <div className="flex h-screen bg-[#F5F5F0] text-[#141414] font-sans overflow-hidden">
      {/* ... (Sidebar same as before, truncated for brevity in replacement but I will include full content) ... */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarCollapsed ? 64 : 260 }}
        className="relative bg-white border-r border-[#141414]/10 flex flex-col z-20"
      >
        <div className="p-4 border-bottom border-[#141414]/5 flex items-center justify-between">
          {!isSidebarCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-[#141414] rounded flex items-center justify-center">
                <Sparkles size={18} className="text-white" />
              </div>
              <span className="font-bold tracking-tighter text-xl uppercase italic">MuseRock</span>
            </motion.div>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 hover:bg-[#141414]/5 rounded transition-colors"
          >
            {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          <SidebarItem 
            icon={<PenTool size={20} />} 
            label="Workspace" 
            active={state.activeTab === 'write'} 
            collapsed={isSidebarCollapsed}
            onClick={() => setState(prev => ({ ...prev, activeTab: 'write' }))}
          />
          <SidebarItem 
            icon={<Search size={20} />} 
            label="Asset Sourcing" 
            active={state.activeTab === 'search'} 
            collapsed={isSidebarCollapsed}
            onClick={() => {
              setState(prev => ({ ...prev, activeTab: 'search' }));
              setAiResult(null);
            }}
          />
          <SidebarItem 
            icon={<Sparkles size={20} />} 
            label="Inspiration" 
            active={state.activeTab === 'inspiration'} 
            collapsed={isSidebarCollapsed}
            onClick={() => {
              setState(prev => ({ ...prev, activeTab: 'inspiration' }));
              setAiResult(null);
            }}
          />
        </nav>

        <div className="px-2 py-4 space-y-1 border-t border-[#141414]/5">
          <SidebarItem 
            icon={<Settings size={20} />} 
            label="API Settings" 
            collapsed={isSidebarCollapsed}
            onClick={toggleSettings}
          />
          <SidebarItem 
            icon={<Github size={20} />} 
            label="View on GitHub" 
            collapsed={isSidebarCollapsed}
            onClick={() => window.open('https://github.com', '_blank')}
          />
          <div className="pt-2">
            {user ? (
              <div className="flex flex-col gap-1 px-3">
                <button 
                   onClick={handleLogout}
                   className="flex items-center gap-3 w-full px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg text-red-500 hover:bg-red-50 transition-all"
                >
                  <LogOut size={18} />
                  {!isSidebarCollapsed && <span>Sign Out</span>}
                </button>
                {!isSidebarCollapsed && (
                  <div className="px-3 py-2 flex items-center gap-2">
                    {user.photoURL ? (
                      <img src={user.photoURL} className="w-5 h-5 rounded-full border border-black/10" referrerPolicy="no-referrer" />
                    ) : (
                      <User size={16} />
                    )}
                    <span className="text-[9px] font-bold text-[#141414]/40 truncate">{user.email}</span>
                  </div>
                )}
              </div>
            ) : (
             <button 
               onClick={handleLogin}
               className="flex items-center gap-3 w-full px-3 py-2 text-xs font-black uppercase tracking-widest rounded-lg text-[#141414] hover:bg-[#141414]/5 transition-all border border-black/5"
             >
               <ShieldCheck size={20} className="text-blue-500" />
               {!isSidebarCollapsed && <span>Authenticating</span>}
             </button>
            )}
          </div>
        </div>
      </motion.aside>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-14 border-b border-[#141414]/5 bg-white/50 backdrop-blur-sm flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-semibold uppercase tracking-widest text-[#141414]/40">Muse Draft Alpha</h1>
            <div className="h-4 w-[1px] bg-[#141414]/10" />
            <span className="text-xs font-mono text-[#141414]/40">Words: {state.content.split(/\s+/).filter(x => x).length}</span>
          </div>
          <div className="flex items-center gap-4">
             {!state.apiKey && (
               <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-[10px] font-bold text-amber-700 uppercase tracking-tight">
                 <Sparkles size={12} />
                 API Key Missing
               </div>
             )}
             {user && (
               <button 
                 onClick={() => {
                   // Simple manual save demo
                   if (user) {
                      setDoc(doc(db, 'drafts', 'current-draft'), {
                        ownerId: user.uid,
                        content: state.content,
                        title: 'Untitled Draft',
                        updatedAt: serverTimestamp()
                      }, { merge: true }).then(() => {
                        alert('Draft Saved to Cloud');
                      });
                   }
                 }}
                 className="px-4 py-1.5 bg-[#141414] text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 transition-transform"
               >
                 Save to Cloud
               </button>
             )}
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <section className="flex-1 overflow-y-auto bg-white p-8 md:p-12 lg:p-16 selection:bg-[#141414] selection:text-white">
            <textarea
              value={state.content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="What are we building today? Start writing here or use the tools on the left for inspiration..."
              className="w-full h-[80vh] text-lg leading-relaxed text-[#141414]/80 placeholder-[#141414]/20 resize-none outline-none font-serif transparent-scrollbar"
            />
          </section>

          <AnimatePresence>
            {state.activeTab !== 'write' && (
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-[420px] bg-[#F9F9F7] border-l border-[#141414]/10 p-6 flex flex-col gap-6 overflow-y-auto shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-black uppercase tracking-[0.2em]">{state.activeTab === 'search' ? 'Asset Sourcing' : 'Inspiration'}</h2>
                  <button onClick={() => setState(prev => ({ ...prev, activeTab: 'write' }))} className="p-1 hover:bg-[#141414]/5 rounded text-[#141414]/40">
                    <X size={16} />
                  </button>
                </div>

                {state.activeTab === 'search' ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#141414]/30" size={16} />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && performAISearch()}
                        placeholder="Search for references, data, assets..." 
                        className="w-full pl-10 pr-10 py-3 bg-white border border-[#141414]/10 rounded-xl text-sm focus:ring-1 focus:ring-[#141414] outline-none shadow-sm transition-all"
                      />
                      <button 
                        onClick={performAISearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-[#141414] text-white rounded-lg"
                      >
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Tag label="Plot twist" onClick={() => getInspirationIdea('Plot Twist')} />
                    <Tag label="Scene setting" onClick={() => getInspirationIdea('Atmospheric Scene Setting')} />
                    <Tag label="Concept logic" onClick={() => getInspirationIdea('Technical Concept Logic')} />
                    <Tag label="Character flaw" onClick={() => getInspirationIdea('Character Motivation/Flaw')} />
                  </div>
                )}

                <div className="flex-1">
                  {isAiLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <Loader2 size={32} className="animate-spin text-[#141414]/20" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#141414]/30 italic">Muse is thinking...</p>
                    </div>
                  ) : aiResult ? (
                    <div className="markdown-body p-6 bg-white border border-[#141414]/5 rounded-2xl shadow-sm text-sm leading-relaxed prose prose-slate">
                      <ReactMarkdown>{aiResult}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="mt-8 flex flex-col items-center opacity-20 py-12 text-center">
                      <Sparkles size={48} strokeWidth={1} />
                      <p className="text-[10px] uppercase tracking-[0.3em] mt-4 font-black">
                        {state.activeTab === 'search' ? 'Awaiting your query' : 'Awaiting the trigger'}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {state.isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSettings}
              className="absolute inset-0 bg-[#F5F5F0]/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="relative w-full max-w-md bg-white border border-[#141414] shadow-[16px_16px_0px_0px_#141414] p-10"
            >
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-2xl font-black tracking-tighter uppercase italic">Configuration</h3>
                  <p className="text-[10px] uppercase tracking-widest text-[#141414]/40 mt-1">Creator Credentials</p>
                </div>
                <button onClick={toggleSettings} className="p-2 hover:bg-[#141414]/5 rounded-full border border-black/5">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#141414]/60 flex items-center gap-2">
                    <Sparkles size={14} />
                    Gemini API Key
                  </label>
                  <div className="relative">
                    <input 
                      type="password"
                      value={state.apiKey}
                      onChange={(e) => setState(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="sk-..."
                      className="w-full px-4 py-4 bg-[#F9F9F7] border border-[#141414]/10 rounded-xl font-mono text-sm focus:border-[#141414] outline-none shadow-inner transition-all"
                    />
                  </div>
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                    <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                      MuseRock uses your key locally. No server-side storage. Follow best practices for local security.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#141414]/60 flex items-center gap-2">
                    <Keyboard size={14} />
                    System Language
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="py-3 text-xs font-black uppercase border-2 border-[#141414] bg-[#141414] text-white rounded-xl">English</button>
                    <button className="py-3 text-xs font-black uppercase border-2 border-[#141414]/10 rounded-xl hover:bg-[#141414]/5 transition-colors">Chinese</button>
                  </div>
                </div>

                <button 
                  onClick={toggleSettings}
                  className="group relative w-full py-5 bg-[#141414] text-white font-black uppercase tracking-[0.2em] text-[10px] hover:bg-[#000] transition-all overflow-hidden"
                >
                  <span className="relative z-10">Commence Creation</span>
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarItem({ icon, label, active, collapsed, onClick }: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      className={`
        relative group flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-all duration-300
        ${active ? 'bg-[#141414] text-white shadow-lg' : 'text-[#141414]/50 hover:bg-[#141414]/5 hover:text-[#141414]'}
      `}
    >
      <div className={`shrink-0 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</div>
      {!collapsed && <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">{label}</span>}
      {collapsed && (
        <div className="absolute left-20 px-3 py-2 bg-[#141414] text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
          {label}
        </div>
      )}
    </button>
  );
}

function Tag({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="p-4 bg-white border border-[#141414]/10 hover:border-[#141414] hover:shadow-md rounded-2xl text-[10px] font-black uppercase tracking-wider text-[#141414]/60 hover:text-[#141414] transition-all text-left flex flex-col gap-2 group"
    >
      <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-amber-500" />
      {label}
    </button>
  );
}
