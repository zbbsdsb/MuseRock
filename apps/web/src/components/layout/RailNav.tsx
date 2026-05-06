import { motion } from 'motion/react';
import logo from '../assets/logo.png';
import { PenTool, Sparkles, Search, Settings, User } from 'lucide-react';

interface RailNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSettingsClick: () => void;
  onUserClick: () => void;
  onDashboardClick: () => void;
  userDisplayName?: string;
  userPhotoUrl?: string;
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

export default function RailNav({ 
  activeTab, 
  onTabChange, 
  onSettingsClick, 
  onUserClick,
  onDashboardClick,
  userDisplayName,
  userPhotoUrl 
}: RailNavProps) {
  return (
    <nav className="w-16 border-r border-brand-border flex flex-col items-center py-10 justify-between bg-white z-30 shrink-0">
      <div className="space-y-10 flex flex-col items-center">
        <div className="w-10 h-10 flex items-center justify-center select-none">
          <img src={logo} alt="MuseRock Logo" className="w-full h-full object-contain" />
        </div>
        <div className="space-y-8 flex flex-col items-center opacity-40">
          <RailItem 
            icon={<PenTool size={20} />} 
            active={activeTab === 'write'} 
            onClick={() => onTabChange('write')} 
            label="Workspace"
          />
          <RailItem 
            icon={<Search size={20} />} 
            active={activeTab === 'search'} 
            onClick={() => onTabChange('search')} 
            label="Assets"
          />
          <RailItem
            icon={<Sparkles size={20} />}
            active={false}
            onClick={onDashboardClick}
            label="Dashboard"
          />
        </div>
      </div>
      
      <div className="space-y-6 flex flex-col items-center">
        <button onClick={onSettingsClick} className="p-1.5 hover:bg-brand-black/5 rounded-full transition-colors text-brand-black/40 hover:text-brand-black">
          <Settings size={20} />
        </button>
        <button 
          onClick={onUserClick}
          className="w-10 h-10 rounded-full bg-brand-paper border border-brand-border flex flex-col items-center justify-center hover:bg-brand-border transition-all group relative"
        >
          {userPhotoUrl ? (
            <img src={userPhotoUrl} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <User size={18} className="text-brand-black/40 group-hover:text-brand-black" />
          )}
          <span className="absolute -bottom-1 text-[8px] font-black uppercase tracking-widest text-brand-black/30 group-hover:text-brand-black/60 transition-colors whitespace-nowrap">
            {userDisplayName || 'User'}
          </span>
        </button>
      </div>
    </nav>
  );
}
