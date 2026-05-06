import { motion, AnimatePresence } from 'motion/react';
import { Download, FileText, FileDown, FileImage } from 'lucide-react';

interface HeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  onExport: (format: 'markdown' | 'word' | 'pdf') => void;
  onSaveDraft: () => void;
  isExporting: boolean;
  canSave: boolean;
}

export default function Header({ 
  title, 
  onTitleChange, 
  onExport, 
  onSaveDraft, 
  isExporting,
  canSave 
}: HeaderProps) {
  const [isExportMenuOpen, setIsExportMenuOpen] = (typeof window !== 'undefined') ? require('react').useState(false) : { useState: () => [false, () => {}] }.useState();
  const useState = require('react').useState;
  const internalIsExportMenuOpen = useState(false);

  const currentIsExportMenuOpen = typeof isExportMenuOpen === 'boolean' ? isExportMenuOpen : internalIsExportMenuOpen[0];
  const setCurrentIsExportMenuOpen = typeof isExportMenuOpen === 'boolean' ? (typeof setIsExportMenuOpen === 'function' ? setIsExportMenuOpen : () => {}) : internalIsExportMenuOpen[1];

  require('react').useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const exportMenu = document.querySelector('.export-menu-container');
      if (exportMenu && !exportMenu.contains(target)) {
        setCurrentIsExportMenuOpen(false);
      }
    };

    if (currentIsExportMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [currentIsExportMenuOpen, setCurrentIsExportMenuOpen]);

  const React = require('react');

  return (
    <header className="mb-12 flex justify-between items-end max-w-4xl mx-auto w-full">
      <div>
        <p className="text-[10px] uppercase tracking-[0.25em] text-brand-black/30 font-black mb-3 leading-none">
          Project: {title || 'Muse Draft'}
        </p>
        <input 
          className="text-4xl lg:text-5xl font-serif italic font-light tracking-tight bg-transparent outline-none w-full"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Untitled Draft"
        />
      </div>
      <div className="flex space-x-3 mb-2 shrink-0">
         <div className="relative export-menu-container">
           <button 
             onClick={() => setCurrentIsExportMenuOpen(!currentIsExportMenuOpen)}
             className="px-5 py-2 border border-brand-black rounded-full text-[10px] uppercase tracking-widest font-black hover:bg-brand-black/5 transition-all flex items-center gap-2"
           >
             <Download size={14} />
             {isExporting ? 'Exporting...' : 'Export'}
           </button>
           <AnimatePresence>
             {currentIsExportMenuOpen && (
               <motion.div
                 initial={{ opacity: 0, y: -10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 className="absolute top-full right-0 mt-2 bg-white border border-brand-border rounded-xl shadow-xl py-2 z-50 min-w-[180px]"
               >
                 <button 
                   onClick={() => {
                     onExport('markdown');
                     setCurrentIsExportMenuOpen(false);
                   }}
                   className="w-full px-4 py-3 text-left text-sm hover:bg-brand-paper flex items-center gap-3 transition-colors"
                 >
                   <FileText size={16} className="text-brand-black/60" />
                   <span>Export as Markdown</span>
                 </button>
                 <button 
                   onClick={() => {
                     onExport('word');
                     setCurrentIsExportMenuOpen(false);
                   }}
                   className="w-full px-4 py-3 text-left text-sm hover:bg-brand-paper flex items-center gap-3 transition-colors"
                 >
                   <FileDown size={16} className="text-brand-black/60" />
                   <span>Export as Word</span>
                 </button>
                 <button 
                   onClick={() => {
                     onExport('pdf');
                     setCurrentIsExportMenuOpen(false);
                   }}
                   className="w-full px-4 py-3 text-left text-sm hover:bg-brand-paper flex items-center gap-3 transition-colors"
                 >
                   <FileImage size={16} className="text-brand-black/60" />
                   <span>Export as PDF</span>
                 </button>
               </motion.div>
             )}
           </AnimatePresence>
         </div>
         {canSave && (
           <button 
             onClick={onSaveDraft}
             className="px-5 py-2 bg-brand-black text-white rounded-full text-[10px] uppercase tracking-widest font-black hover:opacity-90 transition-all shadow-md"
           >
             Save Draft
           </button>
         )}
      </div>
    </header>
  );
}
