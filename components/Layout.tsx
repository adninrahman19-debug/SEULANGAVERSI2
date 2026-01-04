
import React, { useState, useRef, useEffect } from 'react';
import { UserRole, User, AppNotification } from '../types';
import { APP_NAME, MOCK_NOTIFICATIONS, TRANSLATIONS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  onNavigate: (view: string, subView?: string) => void;
  currentView: string;
  currentSubView?: string;
  language: 'id' | 'en';
  onLanguageChange: (lang: 'id' | 'en') => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, user, onLogout, onNavigate, currentView, currentSubView, language, onLanguageChange 
}) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const [scrolled, setScrolled] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[language];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (notificationRef.current && !notificationRef.current.contains(target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(target)) setShowProfileMenu(false);
      if (langRef.current && !langRef.current.contains(target)) setShowLangMenu(false);
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const adminNavGroups = [
    {
      group: "Core Ecosystem",
      items: [
        { id: 'overview', label: t.ecosystem, icon: 'fa-brain' },
        { id: 'tenants', label: 'Business Hub', icon: 'fa-building-shield' },
        { id: 'oversight', label: 'Cross-Oversight', icon: 'fa-crosshairs' },
      ]
    },
    {
      group: "Operations",
      items: [
        { id: 'quality', label: 'Quality Control', icon: 'fa-certificate' },
        { id: 'trust', label: 'User Trust Hub', icon: 'fa-handshake-angle' },
        { id: 'reviews', label: 'Review Moderation', icon: 'fa-comment-dots' },
      ]
    },
    {
      group: "Treasury & Growth",
      items: [
        { id: 'monetization', label: 'Monetization', icon: 'fa-coins' },
        { id: 'finance', label: t.treasury, icon: 'fa-receipt' },
        { id: 'analytics', label: t.analytics, icon: 'fa-chart-pie' },
      ]
    },
    {
      group: "Infrastructure",
      items: [
        { id: 'engine', label: 'Flex Engine', icon: 'fa-microchip' },
        { id: 'security', label: 'Security Node', icon: 'fa-shield-halved' },
        { id: 'accounts', label: 'Identity Governance', icon: 'fa-users-gear' },
        { id: 'settings', label: t.settings, icon: 'fa-gear' },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden selection:bg-indigo-100 selection:text-indigo-700">
      {/* 1. PRIMARY SIDEBAR */}
      {user && (
        <aside 
          className={`sidebar-transition relative z-50 flex flex-col h-screen
          ${isSidebarOpen ? 'w-[320px] px-6' : 'w-[100px] px-4'} 
          bg-white border-r border-slate-200/60 shadow-premium`}
        >
          <div className="h-24 flex items-center justify-center shrink-0">
            <div onClick={() => onNavigate('landing')} className="flex items-center gap-4 cursor-pointer group">
              <div className="w-11 h-11 bg-indigo-600 rounded-[16px] flex items-center justify-center text-white shadow-lg shadow-indigo-100 rotate-3 transition-all group-hover:rotate-0">
                <i className="fas fa-layer-group text-lg"></i>
              </div>
              {isSidebarOpen && (
                <span className="font-black text-xl tracking-tighter text-slate-900">
                  SEULANGA<span className="text-indigo-600">.</span>
                </span>
              )}
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 space-y-8 scrollbar-hide">
            {/* Standard Nav for Non-Admin or Hybrid View */}
            {user.role !== UserRole.SUPER_ADMIN && (
              <div className="space-y-1.5">
                {[
                  { label: t.dashboard, icon: 'fa-grid-2', view: 'landing' },
                  { label: t.business_hub, icon: 'fa-hotel', view: 'owner-dash' },
                  { label: t.ops_desk, icon: 'fa-clipboard-list', view: 'staff-dash' },
                  { label: t.my_bookings, icon: 'fa-calendar-days', view: 'guest-dash' },
                  { label: t.marketplace, icon: 'fa-compass', view: 'explore' },
                ].filter(item => {
                  if (item.view === 'landing' || item.view === 'explore') return true;
                  if (item.view === 'owner-dash' && user.role === UserRole.BUSINESS_OWNER) return true;
                  if (item.view === 'staff-dash' && user.role === UserRole.ADMIN_STAFF) return true;
                  if (item.view === 'guest-dash' && user.role === UserRole.GUEST) return true;
                  return false;
                }).map((item) => (
                  <button
                    key={item.view}
                    onClick={() => onNavigate(item.view)}
                    className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-[18px] text-sm font-bold transition-all
                      ${currentView === item.view ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    <i className={`fas ${item.icon} text-lg w-6 flex justify-center`}></i>
                    {isSidebarOpen && <span>{item.label}</span>}
                  </button>
                ))}
              </div>
            )}

            {/* SUPER ADMIN DEEP NAVIGATION */}
            {user.role === UserRole.SUPER_ADMIN && adminNavGroups.map((group, idx) => (
              <div key={idx} className="space-y-3">
                {isSidebarOpen && (
                  <p className="px-5 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">{group.group}</p>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onNavigate('super-admin', item.id)}
                      className={`w-full flex items-center gap-4 px-5 py-3 rounded-[16px] text-[13px] font-bold transition-all group
                        ${currentSubView === item.id && currentView === 'super-admin'
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-[1.02]' 
                          : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                      <i className={`fas ${item.icon} text-base w-6 flex justify-center ${currentSubView === item.id ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'}`}></i>
                      {isSidebarOpen && <span className="tracking-tight">{item.label}</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {isSidebarOpen && (
            <div className="p-6 mt-auto border-t border-slate-50">
               <div className="bg-slate-950 rounded-[24px] p-5 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/20 rounded-full blur-xl"></div>
                  <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1">Governance Access</p>
                  <p className="text-xs font-bold truncate opacity-60">{user.email}</p>
               </div>
            </div>
          )}
        </aside>
      )}

      {/* 2. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        {/* TOP NAVBAR */}
        <header className={`h-24 sticky top-0 z-40 px-10 flex items-center justify-between transition-all duration-300
          ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm' : 'bg-transparent'}`}
        >
          <div className="flex items-center gap-8">
            {user && (
              <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="w-11 h-11 flex items-center justify-center bg-white text-slate-400 hover:text-indigo-600 rounded-xl transition-all border border-slate-200/50 shadow-sm">
                <i className={`fas ${isSidebarOpen ? 'fa-bars-staggered' : 'fa-bars'}`}></i>
              </button>
            )}
            
            <div className="hidden lg:flex items-center bg-slate-100/50 border border-slate-200/50 rounded-2xl px-6 py-3 w-[400px] focus-within:w-[460px] focus-within:bg-white focus-within:ring-4 ring-indigo-50 transition-all group">
              <i className="fas fa-magnifying-glass text-slate-300 mr-4 group-focus-within:text-indigo-500"></i>
              <input type="text" placeholder="Global search entities, nodes..." className="bg-transparent border-none focus:outline-none text-sm w-full font-semibold" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* NOTIFICATIONS */}
            {user && (
              <div className="relative" ref={notificationRef}>
                <button onClick={() => setShowNotifications(!showNotifications)} className="w-11 h-11 flex items-center justify-center bg-white border border-slate-200/50 rounded-xl hover:border-indigo-600 transition-all shadow-sm relative">
                  <i className="fas fa-bell text-slate-400"></i>
                  {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-4 border-[#f8fafc]">{unreadCount}</span>}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-4 w-[380px] bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 origin-top-right z-50">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                      <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest">System Alerts</h4>
                      <button onClick={markAllAsRead} className="text-[10px] font-black text-indigo-600 uppercase">Clear All</button>
                    </div>
                    <div className="max-h-[380px] overflow-y-auto scrollbar-hide">
                      {notifications.map(n => (
                        <div key={n.id} onClick={() => markAsRead(n.id)} className={`p-5 flex gap-4 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-none ${!n.isRead ? 'bg-indigo-50/20' : ''}`}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.type === 'booking' ? 'bg-emerald-50 text-emerald-500' : 'bg-indigo-50 text-indigo-500'}`}>
                            <i className="fas fa-circle-info"></i>
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-slate-900 mb-0.5">{n.title}</p>
                            <p className="text-[11px] text-slate-500 line-clamp-2">{n.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PROFILE & LOGOUT */}
            <div className="relative" ref={profileRef}>
              <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-3 p-1.5 pr-4 bg-white border border-slate-200/60 rounded-xl hover:border-indigo-600 transition-all shadow-sm">
                <img src={user?.avatar} className="w-8 h-8 rounded-lg object-cover" alt="avatar" />
                <div className="hidden sm:block text-left">
                  <p className="text-[11px] font-black text-slate-900 uppercase leading-none">{user?.name.split(' ')[0]}</p>
                </div>
                <i className="fas fa-chevron-down text-[10px] text-slate-300"></i>
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-4 w-64 bg-white rounded-[24px] shadow-2xl border border-slate-100 p-2 animate-in zoom-in-95 origin-top-right z-50">
                  <button onClick={() => { onNavigate('guest-dash', 'profile'); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 rounded-xl text-slate-700 text-xs font-bold transition-all"><i className="fas fa-user-gear"></i> Profile Hub</button>
                  <button onClick={onLogout} className="w-full flex items-center gap-3 p-4 hover:bg-rose-50 rounded-xl text-rose-600 text-xs font-black transition-all"><i className="fas fa-power-off"></i> {t.terminate}</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 3. SYSTEM ALERT BAR (Global Risk Monitor) */}
        {user?.role === UserRole.SUPER_ADMIN && (
          <div className="px-10 mb-2">
             <div className="bg-rose-600 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-rose-100 animate-pulse">
                <div className="flex items-center gap-4">
                   <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                      <i className="fas fa-triangle-exclamation"></i>
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-80">System Risk Alert</p>
                      <p className="text-sm font-bold">2 High-Severity anomalies detected in "Ecosystem Oversight". Forensic audit required.</p>
                   </div>
                </div>
                <button onClick={() => onNavigate('super-admin', 'oversight')} className="px-6 py-2 bg-white text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">Resolve Node</button>
             </div>
          </div>
        )}

        {/* 4. MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc] scroll-smooth p-10">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
