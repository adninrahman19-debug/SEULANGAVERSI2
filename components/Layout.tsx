
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
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const [scrolled, setScrolled] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[language];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (notificationRef.current && !notificationRef.current.contains(target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(target)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const adminNavGroups = [
    {
      group: "Strategic Oversight",
      items: [
        { id: 'overview', label: 'Ecosystem Monitor', icon: 'fa-globe' },
        { id: 'tenants', label: 'Tenant Governance', icon: 'fa-building-shield' },
        { id: 'oversight', label: 'Risk Radar', icon: 'fa-shield-virus' },
        { id: 'trust', label: 'Trust & Reputation', icon: 'fa-gavel' },
        { id: 'analytics', label: 'Strategic Intel', icon: 'fa-chart-mixed' },
      ]
    },
    {
      group: "Engine & Monetization",
      items: [
        { id: 'engine', label: 'Flex Architecture', icon: 'fa-microchip' },
        { id: 'monetization', label: 'Pricing Hub', icon: 'fa-coins' },
        { id: 'finance', label: 'Global Treasury', icon: 'fa-vault' },
      ]
    },
    {
      group: "Platform Integrity",
      items: [
        { id: 'security', label: 'Security Alpha', icon: 'fa-shield-halved' },
        { id: 'quality', label: 'Marketplace Hub', icon: 'fa-certificate' },
        { id: 'accounts', label: 'Global ID Matrix', icon: 'fa-users-gear' },
        { id: 'settings', label: 'System Cockpit', icon: 'fa-gears' },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* 1. SIDEBAR KIRI: NAVIGASI UTAMA */}
      {user && (
        <aside 
          className={`sidebar-transition relative z-50 flex flex-col h-screen
          ${isSidebarOpen ? 'w-[320px] px-6' : 'w-[100px] px-4'} 
          bg-white border-r border-slate-200/60 shadow-premium`}
        >
          <div className="h-24 flex items-center justify-center shrink-0 border-b border-slate-50 mb-6">
            <div onClick={() => onNavigate('landing')} className="flex items-center gap-4 cursor-pointer group">
              <div className="w-11 h-11 bg-indigo-600 rounded-[16px] flex items-center justify-center text-white shadow-lg shadow-indigo-100 rotate-3 transition-all group-hover:rotate-0">
                <i className="fas fa-layer-group text-lg"></i>
              </div>
              {isSidebarOpen && (
                <span className="font-black text-xl tracking-tighter text-slate-900 uppercase">
                  SEULANGA<span className="text-indigo-600">.</span>
                </span>
              )}
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto space-y-8 scrollbar-hide pb-10">
            {user.role === UserRole.SUPER_ADMIN ? (
              adminNavGroups.map((group, idx) => (
                <div key={idx} className="space-y-3">
                  {isSidebarOpen && (
                    <p className="px-5 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">{group.group}</p>
                  )}
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => onNavigate('super-admin', item.id)}
                        className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-[16px] text-[12px] font-bold transition-all group
                          ${currentSubView === item.id && currentView === 'super-admin'
                            ? 'bg-slate-950 text-white shadow-xl scale-[1.02]' 
                            : 'text-slate-500 hover:bg-slate-50'
                          }`}
                      >
                        <i className={`fas ${item.icon} text-base w-6 flex justify-center ${currentSubView === item.id ? 'text-indigo-400' : 'text-slate-400 group-hover:text-indigo-500'}`}></i>
                        {isSidebarOpen && <span className="tracking-tight uppercase">{item.label}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
               <div className="space-y-1.5">
                  {[
                    { label: t.dashboard, icon: 'fa-grid-2', view: 'landing' },
                    { label: t.business_hub, icon: 'fa-hotel', view: 'owner-dash', role: UserRole.BUSINESS_OWNER },
                    { label: t.ops_desk, icon: 'fa-clipboard-list', view: 'staff-dash', role: UserRole.ADMIN_STAFF },
                    { label: t.my_bookings, icon: 'fa-calendar-days', view: 'guest-dash', role: UserRole.GUEST },
                    { label: t.marketplace, icon: 'fa-compass', view: 'explore' },
                  ].filter(item => {
                    if (!item.role) return true;
                    return item.role === user.role;
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
          </nav>

          <div className="mt-auto p-4 border-t border-slate-50">
             <div className="bg-slate-950 rounded-[24px] p-5 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/20 rounded-full blur-xl"></div>
                <div className="relative z-10 flex items-center gap-3">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                   <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">
                     {user.role === UserRole.SUPER_ADMIN ? 'Sovereign Node' : 
                      user.role === UserRole.BUSINESS_OWNER ? 'Proprietary Node' : 'Operational Node'}
                   </p>
                </div>
             </div>
          </div>
        </aside>
      )}

      {/* 2. AREA KERJA UTAMA */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        {/* TOP NAVBAR */}
        <header className={`h-24 sticky top-0 z-40 px-10 flex items-center justify-between transition-all duration-300
          ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm' : 'bg-transparent'}`}
        >
          <div className="flex items-center gap-8 flex-1">
            {user && (
              <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="w-11 h-11 flex items-center justify-center bg-white text-slate-400 hover:text-indigo-600 rounded-xl transition-all border border-slate-200/50 shadow-sm">
                <i className={`fas ${isSidebarOpen ? 'fa-bars-staggered' : 'fa-bars'}`}></i>
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="relative" ref={notificationRef}>
                <button onClick={() => setShowNotifications(!showNotifications)} className="w-11 h-11 flex items-center justify-center bg-white border border-slate-200/50 rounded-xl hover:border-indigo-600 transition-all shadow-sm relative">
                  <i className="fas fa-bell text-slate-400"></i>
                  {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-4 border-[#f8fafc]">{unreadCount}</span>}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-4 w-[380px] bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 origin-top-right z-50">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                      <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest italic">Signal Central</h4>
                      <button className="text-[10px] font-black text-indigo-600 uppercase">Clear All</button>
                    </div>
                    <div className="max-h-[380px] overflow-y-auto scrollbar-hide">
                      {notifications.map(n => (
                        <div key={n.id} className={`p-5 flex gap-4 hover:bg-slate-50 border-b border-slate-50 last:border-none`}>
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                            <i className="fas fa-bolt"></i>
                          </div>
                          <div>
                            <p className="text-[13px] font-black text-slate-900 mb-0.5 uppercase">{n.title}</p>
                            <p className="text-[11px] text-slate-500 line-clamp-2">{n.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="relative" ref={profileRef}>
              <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-3 p-1.5 pr-4 bg-white border border-slate-200/60 rounded-xl hover:border-indigo-600 transition-all shadow-sm">
                <img src={user?.avatar} className="w-8 h-8 rounded-lg object-cover shadow-sm" alt="avatar" />
                <div className="hidden sm:block text-left">
                  <p className="text-[11px] font-black text-slate-900 uppercase leading-none">{user?.name.split(' ')[0]}</p>
                  <p className="text-[8px] font-black text-indigo-600 uppercase mt-0.5">{user?.role.replace('_', ' ')}</p>
                </div>
                <i className="fas fa-chevron-down text-[10px] text-slate-300"></i>
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-4 w-64 bg-white rounded-[24px] shadow-2xl border border-slate-100 p-2 animate-in zoom-in-95 origin-top-right z-50">
                  <button onClick={onLogout} className="w-full flex items-center gap-3 p-4 hover:bg-rose-50 rounded-xl text-rose-600 text-xs font-black transition-all mt-2"><i className="fas fa-power-off"></i> {t.terminate}</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#f8fafc] scroll-smooth p-10">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
