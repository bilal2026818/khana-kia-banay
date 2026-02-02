
import React from 'react';
import { AppScreen } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  title: string;
  isNotificationsEnabled?: boolean;
  isOffline?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeScreen, 
  onNavigate, 
  title, 
  isNotificationsEnabled,
  isOffline 
}) => {
  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-50 overflow-hidden shadow-2xl relative">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex justify-between items-end">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {isOffline && (
              <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-widest rounded-full animate-pulse">
                Offline
              </span>
            )}
          </div>
        </div>
        {activeScreen === AppScreen.HOME && (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isNotificationsEnabled ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-300'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              {isNotificationsEnabled && <circle cx="18" cy="5" r="3" fill="currentColor" stroke="white" strokeWidth="2" />}
            </svg>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 px-6">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-center z-40 safe-area-bottom">
        <NavButton 
          active={activeScreen === AppScreen.HOME} 
          onClick={() => onNavigate(AppScreen.HOME)}
          icon={<HomeIcon />}
          label="Home"
        />
        <NavButton 
          active={activeScreen === AppScreen.DISHES} 
          onClick={() => onNavigate(AppScreen.DISHES)}
          icon={<ListIcon />}
          label="Dishes"
        />
        <NavButton 
          active={activeScreen === AppScreen.PLANNER} 
          onClick={() => onNavigate(AppScreen.PLANNER)}
          icon={<CalendarIcon />}
          label="Plan"
        />
        <NavButton 
          active={activeScreen === AppScreen.SUGGEST} 
          onClick={() => onNavigate(AppScreen.SUGGEST)}
          icon={<DiceIcon />}
          label="Suggest"
        />
      </nav>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-orange-600 scale-110' : 'text-gray-400'}`}
  >
    {icon}
    <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
  </button>
);

const HomeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);

const ListIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
);

const CalendarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
);

const DiceIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M7 7h.01"/><path d="M17 7h.01"/><path d="M7 17h.01"/><path d="M17 17h.01"/><path d="M12 12h.01"/></svg>
);

export default Layout;
