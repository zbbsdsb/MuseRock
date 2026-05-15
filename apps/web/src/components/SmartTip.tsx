import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles } from 'lucide-react';

interface SmartTipProps {
  id: string;
  message: string;
  assistantName?: 'Deo' | 'Dia';
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
  delay?: number;
}

export default function SmartTip({
  id,
  message,
  assistantName = 'Deo',
  position = 'bottom-right',
  delay = 0
}: SmartTipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if this tip has been dismissed before
    const dismissedTips = localStorage.getItem('muserock-dismissed-tips');
    const dismissedSet = dismissedTips ? JSON.parse(dismissedTips) : new Set();

    if (!dismissedSet.has(id)) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setIsDismissed(true);
    }
  }, [id, delay]);

  const handleDismiss = () => {
    setIsVisible(false);
    
    // Save dismissed state
    setTimeout(() => {
      const dismissedTips = localStorage.getItem('muserock-dismissed-tips');
      const dismissedSet = dismissedTips ? JSON.parse(dismissedTips) : new Set();
      dismissedSet.add(id);
      localStorage.setItem('muserock-dismissed-tips', JSON.stringify(Array.from(dismissedSet)));
      setIsDismissed(true);
    }, 300);
  };

  if (isDismissed) return null;

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-left': 'top-4 left-4'
  };

  const assistantColors = {
    'Deo': 'bg-orange-500',
    'Dia': 'bg-pink-500'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className={`fixed z-50 ${positionClasses[position]}`}
        >
          <div className="bg-brand-paper border border-brand-border rounded-2xl shadow-xl p-4 max-w-sm relative">
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-brand-border transition-colors text-brand-black/40 hover:text-brand-black"
            >
              <X size={14} />
            </button>
            
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full ${assistantColors[assistantName]} flex items-center justify-center shrink-0`}>
                <Sparkles size={16} className="text-white" />
              </div>
              
              <div className="flex-1">
                <p className="text-xs font-black uppercase tracking-widest text-brand-black/40 mb-1">
                  {assistantName}
                </p>
                <p className="text-sm text-brand-black/80 leading-relaxed">
                  {message}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
