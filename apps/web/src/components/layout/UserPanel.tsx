import { motion, AnimatePresence } from 'motion/react';
import { X, User, ShieldCheck, Loader2 } from 'lucide-react';
import ContinueWithOasisButton from '../ContinueWithOasisButton';

interface UserPanelProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    displayName?: string;
    email?: string;
    photoURL?: string;
  } | null;
  oasisUser?: {
    display_name?: string;
    email?: string;
    avatar_url?: string;
  } | null;
  onLogout: () => void;
  onGoogleLogin: () => void;
  isLoading: boolean;
  error?: string | null;
}

export default function UserPanel({
  isOpen,
  onClose,
  user,
  oasisUser,
  onLogout,
  onGoogleLogin,
  isLoading,
  error
}: UserPanelProps) {
  const currentUser = user || oasisUser;
  
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
            className="relative w-full max-w-md bg-brand-paper border border-brand-black shadow-[24px_24px_0px_0px_rgba(26,26,26,0.1)] p-12"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-serif italic tracking-tighter">Account</h3>
                <p className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-black/30 mt-2">Manage Your Session</p>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-brand-paper rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            {currentUser ? (
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
                    onLogout();
                    onClose();
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
                      onGoogleLogin();
                      onClose();
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

            {isLoading && (
              <div className="flex items-center justify-center gap-3 mt-6 text-sm text-brand-black/60">
                <Loader2 size={14} className="animate-spin" />
                <span>Authenticating...</span>
              </div>
            )}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
