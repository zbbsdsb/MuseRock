import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Bot, Search, PenTool, FileText } from 'lucide-react';

interface MuseSphereProps {
  onQuickAction?: (action: string) => void;
  isAiActive?: boolean;
}

export default function MuseSphere({ onQuickAction, isAiActive }: MuseSphereProps) {
  const [position, setPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 120 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Load saved position from localStorage
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

  // Save position to localStorage when it changes
  useEffect(() => {
    if (!isDragging) {
      localStorage.setItem('musesphere_position', JSON.stringify(position));
    }
  }, [position, isDragging]);

  // Mouse event handlers for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    let newX = e.clientX - dragOffset.current.x;
    let newY = e.clientY - dragOffset.current.y;
    
    // Keep within window bounds
    newX = Math.max(20, Math.min(window.innerWidth - 80, newX));
    newY = Math.max(20, Math.min(window.innerHeight - 80, newY));
    
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse move/up listeners when dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Handle sphere click (don't open menu when dragging)
  const handleSphereClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      setIsMenuOpen(!isMenuOpen);
    }
  };

  // Handle quick action
  const handleAction = (action: string) => {
    setIsMenuOpen(false);
    onQuickAction?.(action);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    // Handle dropped content
    const text = e.dataTransfer.getData('text');
    const html = e.dataTransfer.getData('text/html');
    const files = e.dataTransfer.files;
    
    if (files.length > 0) {
      console.log('Dropped files:', files);
      // Handle image/files
    } else if (text) {
      console.log('Dropped text:', text);
      // Handle text
    }
  };

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{ left: position.x, top: position.y }}
    >
      {/* Quick Action Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="pointer-events-auto absolute bottom-20 left-1/2 -translate-x-1/2 bg-white border border-brand-border rounded-2xl shadow-2xl p-4 min-w-[240px]"
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
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles size={18} className="text-white" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-black/60">Inspiration</span>
              </button>
              
              <button
                onClick={() => handleAction('search')}
                className="p-4 border border-brand-border rounded-xl hover:border-brand-black hover:shadow-md transition-all flex flex-col items-center gap-2 group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Search size={18} className="text-white" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-black/60">Search</span>
              </button>
              
              <button
                onClick={() => handleAction('write')}
                className="p-4 border border-brand-border rounded-xl hover:border-brand-black hover:shadow-md transition-all flex flex-col items-center gap-2 group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PenTool size={18} className="text-white" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-black/60">Write</span>
              </button>
              
              <button
                onClick={() => handleAction('note')}
                className="p-4 border border-brand-border rounded-xl hover:border-brand-black hover:shadow-md transition-all flex flex-col items-center gap-2 group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText size={18} className="text-white" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-black/60">Note</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Sphere */}
      <motion.div
        drag={!isMenuOpen}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        onClick={handleSphereClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="pointer-events-auto relative"
        animate={{
          scale: isDragOver ? 1.3 : isDragging ? 0.95 : 1,
          rotate: isDragging ? 5 : 0
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {/* Glow effect behind */}
        <div 
          className={`absolute inset-0 rounded-full blur-xl transition-all duration-300 ${
            isAiActive 
              ? 'bg-violet-500/50 animate-pulse' 
              : isDragOver 
                ? 'bg-cyan-500/50' 
                : 'bg-violet-500/30'
          }`}
        />
        
        {/* Main orb */}
        <div 
          className={`
            relative w-16 h-16 rounded-full cursor-grab active:cursor-grabbing
            backdrop-blur-xl
            bg-gradient-to-br from-white/40 via-white/20 to-white/10
            border border-white/30
            shadow-xl
            transition-all duration-300
            ${isDragOver ? 'ring-4 ring-cyan-400/50' : ''}
            ${isDragging ? 'cursor-grabbing' : ''}
          `}
        >
          {/* Inner reflection */}
          <div className="absolute top-2 left-3 w-4 h-4 rounded-full bg-white/60 blur-sm" />
          
          {/* Icon */}
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
                <Bot size={28} className="text-violet-600" />
              ) : (
                <Sparkles size={28} className="text-violet-600" />
              )}
            </motion.div>
          </div>
        </div>
        
        {/* Status indicator */}
        {isAiActive && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse"
          />
        )}
      </motion.div>
    </div>
  );
}
