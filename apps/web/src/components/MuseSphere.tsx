import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Bot, Search, PenTool, FileText, Image, Link, XCircle, Settings, ZoomIn, ZoomOut } from 'lucide-react';
import { useMuseSphereContext } from '../providers/MuseSphereProvider';

type SphereSize = 'small' | 'medium' | 'large';
type SphereTheme = 'violet' | 'cyan' | 'amber' | 'emerald';

interface SphereSettings {
  size: SphereSize;
  theme: SphereTheme;
  isLocked: boolean;
}

const themeColors = {
  violet: {
    primary: 'from-violet-500 to-purple-600',
    glow: 'bg-violet-500',
    icon: 'text-violet-600',
    ring: 'ring-violet-400',
  },
  cyan: {
    primary: 'from-cyan-500 to-blue-600',
    glow: 'bg-cyan-500',
    icon: 'text-cyan-600',
    ring: 'ring-cyan-400',
  },
  amber: {
    primary: 'from-amber-500 to-orange-600',
    glow: 'bg-amber-500',
    icon: 'text-amber-600',
    ring: 'ring-amber-400',
  },
  emerald: {
    primary: 'from-emerald-500 to-green-600',
    glow: 'bg-emerald-500',
    icon: 'text-emerald-600',
    ring: 'ring-emerald-400',
  },
};

const sizeClasses = {
  small: 'w-12 h-12',
  medium: 'w-16 h-16',
  large: 'w-20 h-20',
};

const iconSizes = {
  small: 22,
  medium: 28,
  large: 34,
};

export default function MuseSphere() {
  const { isAiActive, onQuickAction, onDropContent } = useMuseSphereContext();
  
  const [position, setPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 120 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dropPreview, setDropPreview] = useState<string | null>(null);
  const [settings, setSettings] = useState<SphereSettings>(() => {
    const saved = localStorage.getItem('musesphere_settings');
    if (saved) {
      try {
        return { ...{ size: 'medium', theme: 'violet', isLocked: false }, ...JSON.parse(saved) };
      } catch {
        return { size: 'medium', theme: 'violet', isLocked: false };
      }
    }
    return { size: 'medium', theme: 'violet', isLocked: false };
  });
  
  const dragOffset = useRef({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('musesphere_position');
    if (saved) {
      try {
        setPosition(JSON.parse(saved));
      } catch (e) {
        // Use default position
      }
    }
  }, []);

  useEffect(() => {
    if (!isDragging) {
      localStorage.setItem('musesphere_position', JSON.stringify(position));
    }
  }, [position, isDragging]);

  useEffect(() => {
    localStorage.setItem('musesphere_settings', JSON.stringify(settings));
  }, [settings]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (settings.isLocked) return;
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || settings.isLocked) return;
    
    let newX = e.clientX - dragOffset.current.x;
    let newY = e.clientY - dragOffset.current.y;
    
    const size = settings.size === 'small' ? 48 : settings.size === 'medium' ? 64 : 80;
    newX = Math.max(20, Math.min(window.innerWidth - size - 20, newX));
    newY = Math.max(20, Math.min(window.innerHeight - size - 20, newY));
    
    setPosition({ x: newX, y: newY });
  }, [isDragging, settings]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleSphereClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      setIsMenuOpen(!isMenuOpen);
    }
  };

  const handleAction = (action: string) => {
    setIsMenuOpen(false);
    onQuickAction(action);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDropPreview(null);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const text = e.dataTransfer.getData('text/plain');
    const url = e.dataTransfer.getData('text/uri-list') || (text && text.startsWith('http') ? text : null);
    const files = Array.from(e.dataTransfer.files);
    
    let content: string | null = null;
    let contentType: 'text' | 'image' | 'url' | 'files' = 'text';
    
    if (files.length > 0) {
      contentType = 'files';
      const imageFiles = files.filter(f => f.type.startsWith('image/'));
      if (imageFiles.length > 0) {
        contentType = 'image';
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setDropPreview(result);
          onDropContent?.(result, 'image');
        };
        reader.readAsDataURL(imageFiles[0]);
        return;
      }
      content = `Files dropped: ${files.map(f => f.name).join(', ')}`;
    } else if (url) {
      contentType = 'url';
      content = url;
      setDropPreview(`🔗 ${url.substring(0, 50)}${url.length > 50 ? '...' : ''}`);
    } else if (text) {
      contentType = 'text';
      content = text.substring(0, 200);
      setDropPreview(`📝 ${content.substring(0, 30)}${content.length > 30 ? '...' : ''}`);
    }
    
    if (content) {
      onDropContent?.(content, contentType);
    }
    
    setTimeout(() => setDropPreview(null), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setDropPreview('📷 Image uploaded');
          onDropContent?.(result, 'image');
        };
        reader.readAsDataURL(file);
      } else {
        setDropPreview(`📄 ${file.name}`);
        onDropContent?.(file.name, 'files');
      }
      setTimeout(() => setDropPreview(null), 3000);
    }
    e.target.value = '';
  };

  const adjustSize = (delta: number) => {
    const sizes: SphereSize[] = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(settings.size);
    const newIndex = Math.max(0, Math.min(sizes.length - 1, currentIndex + delta));
    setSettings(prev => ({ ...prev, size: sizes[newIndex] }));
  };

  const toggleLock = () => {
    setSettings(prev => ({ ...prev, isLocked: !prev.isLocked }));
  };

  const themes: SphereTheme[] = ['violet', 'cyan', 'amber', 'emerald'];

  const theme = themeColors[settings.theme];

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{ left: position.x, top: position.y }}
    >
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="pointer-events-auto absolute bottom-24 left-1/2 -translate-x-1/2 bg-white border border-brand-border rounded-2xl shadow-2xl p-4 min-w-[280px]"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase tracking-widest font-black text-brand-black/30">Quick Actions</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1 hover:bg-brand-paper rounded-full transition-colors"
              >
                <X size={14} className="text-brand-black/40" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAction('inspiration')}
                className="p-4 border border-brand-border rounded-xl hover:border-brand-black hover:shadow-md transition-all flex flex-col items-center gap-2 group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${themeColors.violet.primary} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Sparkles size={18} className="text-white" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-black/60">Inspiration</span>
              </button>
              
              <button
                onClick={() => handleAction('search')}
                className="p-4 border border-brand-border rounded-xl hover:border-brand-black hover:shadow-md transition-all flex flex-col items-center gap-2 group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${themeColors.cyan.primary} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Search size={18} className="text-white" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-black/60">Search</span>
              </button>
              
              <button
                onClick={() => handleAction('write')}
                className="p-4 border border-brand-border rounded-xl hover:border-brand-black hover:shadow-md transition-all flex flex-col items-center gap-2 group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${themeColors.amber.primary} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <PenTool size={18} className="text-white" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-black/60">Write</span>
              </button>
              
              <button
                onClick={() => handleAction('note')}
                className="p-4 border border-brand-border rounded-xl hover:border-brand-black hover:shadow-md transition-all flex flex-col items-center gap-2 group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${themeColors.emerald.primary} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <FileText size={18} className="text-white" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-black/60">Note</span>
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-brand-border">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/30 mb-3 block">Drop Files or Content</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-brand-border rounded-xl p-4 text-center cursor-pointer hover:border-brand-black hover:bg-brand-paper transition-all"
              >
                <div className="flex items-center justify-center gap-2 text-brand-black/40">
                  <Image size={16} />
                  <span className="text-xs">Click to upload or drag & drop</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="pointer-events-auto absolute bottom-24 right-0 bg-white border border-brand-border rounded-xl shadow-xl p-3 min-w-[160px]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-brand-black/30">Size</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => adjustSize(-1)} className="p-1 hover:bg-brand-paper rounded transition-colors">
                    <ZoomOut size={12} />
                  </button>
                  <button onClick={() => adjustSize(1)} className="p-1 hover:bg-brand-paper rounded transition-colors">
                    <ZoomIn size={12} />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-brand-black/30">Theme</span>
                <div className="flex gap-1">
                  {themes.map(t => (
                    <button
                      key={t}
                      onClick={() => setSettings(prev => ({ ...prev, theme: t }))}
                      className={`w-5 h-5 rounded-full ${themeColors[t].primary.replace('to-', ' ')} ${settings.theme === t ? 'ring-2 ring-offset-1 ring-brand-black' : ''}`}
                    />
                  ))}
                </div>
              </div>
              
              <button
                onClick={toggleLock}
                className={`w-full py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors ${
                  settings.isLocked 
                    ? 'bg-brand-black text-white' 
                    : 'border border-brand-border text-brand-black/60 hover:bg-brand-paper'
                }`}
              >
                {settings.isLocked ? '🔒 Locked' : '🔓 Unlocked'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {dropPreview && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="pointer-events-auto absolute -top-16 left-1/2 -translate-x-1/2 bg-brand-black text-white text-xs px-3 py-2 rounded-full shadow-lg whitespace-nowrap"
          >
            {dropPreview}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        drag={!isMenuOpen && !settings.isLocked}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        onClick={handleSphereClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="pointer-events-auto relative"
        animate={{
          scale: isDragOver ? 1.4 : isDragging ? 0.95 : 1,
          rotate: isDragging ? 5 : 0
        }}
        whileHover={{ scale: settings.isLocked ? 1 : 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <div 
          className={`absolute inset-0 rounded-full blur-xl transition-all duration-300 ${
            isAiActive 
              ? `${theme.glow}/50 animate-pulse` 
              : isDragOver 
                ? `${theme.glow}/50 scale-150` 
                : `${theme.glow}/30`
          }`}
        />
        
        <div 
          className={`
            relative ${sizeClasses[settings.size]} rounded-full cursor-${settings.isLocked ? 'default' : 'grab'} active:cursor-grabbing
            backdrop-blur-xl
            bg-gradient-to-br from-white/40 via-white/20 to-white/10
            border border-white/30
            shadow-xl
            transition-all duration-300
            ${isDragOver ? `ring-4 ${theme.ring}/50` : ''}
            ${settings.isLocked ? 'opacity-70' : ''}
          `}
        >
          <div className="absolute top-2 left-3 w-3 h-3 rounded-full bg-white/60 blur-sm" />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{
                rotate: isAiActive ? 360 : 0,
                scale: isAiActive ? [1, 1.2, 1] : 1
              }}
              transition={{
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity }
              }}
            >
              {isAiActive ? (
                <Bot size={iconSizes[settings.size]} className={theme.icon} />
              ) : (
                <Sparkles size={iconSizes[settings.size]} className={theme.icon} />
              )}
            </motion.div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsSettingsOpen(!isSettingsOpen);
              setIsMenuOpen(false);
            }}
            className="absolute -bottom-1 -right-1 w-5 h-5 bg-brand-black text-white rounded-full flex items-center justify-center shadow-md hover:bg-brand-black/80 transition-colors"
          >
            <Settings size={10} />
          </button>
        </div>
        
        {isAiActive && (
          <div className="absolute -top-1 -right-1 flex items-center gap-1">
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(false);
                setDropPreview(null);
              }}
              className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-lg"
            >
              <X size={10} />
            </motion.button>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse"
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}