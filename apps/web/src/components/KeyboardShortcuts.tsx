import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Keyboard } from 'lucide-react';

const SHORTCUTS = [
  {
    category: 'General',
    items: [
      { keys: ['Ctrl', '/'], description: 'Toggle keyboard shortcuts' },
      { keys: ['Ctrl', ','], description: 'Open settings' },
    ],
  },
  {
    category: 'Editor',
    items: [
      { keys: ['Ctrl', 'S'], description: 'Save draft' },
      { keys: ['Ctrl', 'B'], description: 'Toggle bold' },
      { keys: ['Ctrl', 'I'], description: 'Toggle italic' },
    ],
  },
  {
    category: 'Export',
    items: [
      { keys: ['Ctrl', 'E'], description: 'Open export menu' },
      { keys: ['Ctrl', 'Shift', 'M'], description: 'Export as Markdown' },
      { keys: ['Ctrl', 'Shift', 'W'], description: 'Export as Word' },
    ],
  },
  {
    category: 'Navigation',
    items: [
      { keys: ['1'], description: 'Go to Prime stage' },
      { keys: ['2'], description: 'Go to Cloister stage' },
      { keys: ['3'], description: 'Go to Divergence stage' },
      { keys: ['4'], description: 'Go to Reflection stage' },
    ],
  },
];

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md mx-4 bg-brand-paper border border-brand-black shadow-[32px_32px_0px_0px_rgba(26,26,26,0.15)]"
      >
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-black/5 flex items-center justify-center">
                <Keyboard size={18} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] font-black text-brand-black/30">
                  Quick Reference
                </p>
                <h2 className="text-xl font-serif italic">Keyboard Shortcuts</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-brand-black/30 hover:text-brand-black transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 transparent-scrollbar">
            {SHORTCUTS.map((section) => (
              <div key={section.category}>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-black/30 mb-3">
                  {section.category}
                </h3>
                <div className="space-y-2">
                  {section.items.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 border-b border-brand-border last:border-0"
                    >
                      <span className="text-sm text-brand-black/60">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center gap-1">
                            <kbd className="px-2 py-1 bg-brand-black/5 border border-brand-border rounded text-[10px] font-mono text-brand-black/70">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-brand-black/30">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-brand-border">
            <p className="text-[10px] text-brand-black/30 text-center">
              Press <kbd className="px-1.5 py-0.5 bg-brand-black/5 border border-brand-border rounded text-[10px] font-mono">Esc</kbd> to close
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
