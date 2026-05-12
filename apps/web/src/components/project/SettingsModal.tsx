import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, Eye, Keyboard, Shield, Type, Save } from 'lucide-react';
import { Project, ProjectSettings } from '../types';

type TabId = 'general' | 'appearance' | 'privacy' | 'keyboard';

interface SettingsModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: ProjectSettings) => void;
}

const tabs: { id: TabId; label: string; icon: typeof Settings }[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'appearance', label: 'Appearance', icon: Eye },
  { id: 'privacy', label: 'Privacy', icon: Shield },
  { id: 'keyboard', label: 'Keyboard', icon: Keyboard },
];

export default function SettingsModal({ project, isOpen, onClose, onSave }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [settings, setSettings] = useState<ProjectSettings>(project.settings);

  useEffect(() => {
    setSettings(project.settings);
  }, [project.settings]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const updateSetting = <K extends keyof ProjectSettings>(key: K, value: ProjectSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-brand-paper border border-brand-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <Type size={18} className="text-violet-500" />
                </div>
                <div>
                  <h2 className="text-base font-serif italic text-brand-black">Settings</h2>
                  <p className="text-[10px] uppercase tracking-wider font-black text-brand-black/30">{project.name}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-brand-black/40 hover:text-brand-black hover:bg-brand-paper transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              <div className="w-48 border-r border-brand-border p-4 shrink-0">
                <nav className="space-y-1">
                  {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                          activeTab === tab.id
                            ? 'bg-violet-500 text-white shadow-md'
                            : 'text-brand-black/60 hover:bg-brand-paper hover:text-brand-black'
                        }`}
                      >
                        <Icon size={16} />
                        <span className="text-xs font-black uppercase tracking-wider">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black/50 mb-4">Auto Save</h3>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between">
                          <span className="text-sm font-medium text-brand-black">Enable Auto Save</span>
                          <button
                            onClick={() => updateSetting('autoSave', !settings.autoSave)}
                            className={`w-12 h-6 rounded-full transition-all ${
                              settings.autoSave ? 'bg-violet-500' : 'bg-brand-border'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full bg-brand-paper shadow-md transition-all ${
                              settings.autoSave ? 'translate-x-6' : 'translate-x-0.5'
                            }`} />
                          </button>
                        </label>
                        {settings.autoSave && (
                          <div>
                            <label className="block text-xs font-medium text-brand-black/60 mb-2">
                              Save Interval (seconds)
                            </label>
                            <input
                              type="number"
                              min={10}
                              max={300}
                              value={settings.autoSaveInterval}
                              onChange={e => updateSetting('autoSaveInterval', parseInt(e.target.value) || 30)}
                              className="w-32 px-4 py-2 rounded-xl border border-brand-border bg-brand-paper text-sm text-brand-black focus:outline-none focus:border-violet-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black/50 mb-4">Theme</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {(['light', 'dark', 'system'] as const).map(theme => (
                          <button
                            key={theme}
                            onClick={() => updateSetting('theme', theme)}
                            className={`py-3 px-4 rounded-xl border-2 text-xs font-black uppercase tracking-wider transition-all ${
                              settings.theme === theme
                                ? 'border-violet-500 bg-violet-500/10 text-violet-600'
                                : 'border-brand-border text-brand-black/60 hover:border-brand-black/30'
                            }`}
                          >
                            {theme}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black/50 mb-4">Font Size</h3>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min={12}
                          max={24}
                          value={settings.fontSize}
                          onChange={e => updateSetting('fontSize', parseInt(e.target.value))}
                          className="flex-1 accent-violet-500"
                        />
                        <span className="w-12 text-center text-sm font-medium text-brand-black">{settings.fontSize}px</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black/50 mb-4">Font Family</h3>
                      <select
                        value={settings.fontFamily}
                        onChange={e => updateSetting('fontFamily', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-brand-border bg-brand-paper text-sm text-brand-black focus:outline-none focus:border-violet-500"
                      >
                        <option value="serif">Serif (Playfair Display)</option>
                        <option value="sans-serif">Sans Serif (Inter)</option>
                        <option value="mono">Monospace (Fira Code)</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black/50 mb-4">Visibility</h3>
                      <label className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-brand-black block">Public Project</span>
                          <span className="text-xs text-brand-black/40">Allow others to view this project</span>
                        </div>
                        <button
                          onClick={() => updateSetting('isPublic', !settings.isPublic)}
                          className={`w-12 h-6 rounded-full transition-all ${
                            settings.isPublic ? 'bg-violet-500' : 'bg-brand-border'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-brand-paper shadow-md transition-all ${
                            settings.isPublic ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </label>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black/50 mb-4">Comments</h3>
                      <label className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-brand-black block">Allow Comments</span>
                          <span className="text-xs text-brand-black/40">Let others share feedback</span>
                        </div>
                        <button
                          onClick={() => updateSetting('allowComments', !settings.allowComments)}
                          className={`w-12 h-6 rounded-full transition-all ${
                            settings.allowComments ? 'bg-violet-500' : 'bg-brand-border'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full bg-brand-paper shadow-md transition-all ${
                            settings.allowComments ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                        </button>
                      </label>
                    </div>
                  </div>
                )}

                {activeTab === 'keyboard' && (
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-black/50 mb-4">Keyboard Shortcuts</h3>
                    <div className="space-y-3">
                      {[
                        { action: 'Save', keys: 'Ctrl + S' },
                        { action: 'New Element', keys: 'Ctrl + N' },
                        { action: 'Search', keys: 'Ctrl + K' },
                        { action: 'Toggle Sidebar', keys: 'Ctrl + B' },
                        { action: 'Settings', keys: 'Ctrl + ,' },
                      ].map(shortcut => (
                        <div key={shortcut.action} className="flex items-center justify-between py-2 border-b border-brand-border/50">
                          <span className="text-sm text-brand-black">{shortcut.action}</span>
                          <kbd className="px-3 py-1.5 rounded-lg bg-brand-paper border border-brand-border text-xs font-mono text-brand-black/70">
                            {shortcut.keys}
                          </kbd>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-brand-black/40 italic">Custom shortcuts coming soon...</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-brand-border bg-brand-paper/50">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider text-brand-black/60 hover:text-brand-black hover:bg-brand-paper transition-all border border-transparent hover:border-brand-border"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2.5 rounded-full bg-violet-500 text-white text-xs font-black uppercase tracking-wider hover:bg-violet-600 transition-all shadow-md flex items-center gap-2"
              >
                <Save size={14} />
                Save Changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
