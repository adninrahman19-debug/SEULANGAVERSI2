
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
          </nav>

          <div className="mt-auto p-4 border-t border-slate-50">
             <div className="bg-slate-950 rounded-[24px] p-5 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/20 rounded-full blur-xl"></div>
                <div className="relative z-10 flex items-center gap-3">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                   <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">{user.role === UserRole.SUPER_ADMIN ? 'Master Node' : 'Partner Node'}</p>
                </div>
             </div>
          </div>
        </aside>
      )}

      {/* 2. AREA KERJA UTAMA */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        {/* TOP NAVBAR: GLOBAL COMMAND HUB */}
        <header className={`h-24 sticky top-0 z-40 px-10 flex items-center justify-between transition-all duration-300
          ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm' : 'bg-transparent'}`}
        >
          <div className="flex items-center gap-8 flex-1">
            {user && (
              <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="w-11 h-11 flex items-center justify-center bg-white text-slate-400 hover:text-indigo-600 rounded-xl transition-all border border-slate-200/50 shadow-sm">
                <i className={`fas ${isSidebarOpen ? 'fa-bars-staggered' : 'fa-bars'}`}></i>
              </button>
            )}
            {user?.role === UserRole.SUPER_ADMIN && (
               <div className="relative max-w-xl w-full hidden md:block">
                  <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
                  <input 
                    type="text" 
                    placeholder="Global Platform Search (Tenants, Transactions, Nodes...)"
                    className="w-full bg-slate-100/50 border border-slate-200 rounded-2xl py-3.5 pl-14 pr-6 text-xs font-bold text-slate-700 focus:bg-white focus:ring-4 ring-indigo-50 outline-none transition-all"
                  />
               </div>
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
                      <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest italic">Sinyal Sistem</h4>
                      <button className="text-[10px] font-black text-indigo-600 uppercase">Acknowledge All</button>
                    </div>
                    <div className="max-h-[380px] overflow-y-auto scrollbar-hide">
                      {notifications.map(n => (
                        <div key={n.id} className={`p-5 flex gap-4 hover:bg-slate-50 border-b border-slate-50 last:border-none`}>
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                            <i className="fas fa-satellite"></i>
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
                  <p className="text-[8px] font-black text-indigo-600 uppercase mt-0.5">{user?.role === UserRole.SUPER_ADMIN ? 'SOVEREIGN' : 'PARTNER'}</p>
                </div>
                <i className="fas fa-chevron-down text-[10px] text-slate-300"></i>
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-4 w-64 bg-white rounded-[24px] shadow-2xl border border-slate-100 p-2 animate-in zoom-in-95 origin-top-right z-50">
                  <button className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 rounded-xl text-slate-700 text-xs font-bold transition-all"><i className="fas fa-gears text-indigo-400"></i> Governance Settings</button>
                  <button onClick={onLogout} className="w-full flex items-center gap-3 p-4 hover:bg-rose-50 rounded-xl text-rose-600 text-xs font-black transition-all border-t border-slate-50 mt-2"><i className="fas fa-power-off"></i> {t.terminate}</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* SYSTEM ALERT BAR: RISIKO & PERINGATAN */}
        {user?.role === UserRole.SUPER_ADMIN && (
          <div className="px-10 mb-4 animate-fade-down">
             <div className="bg-slate-900 text-white rounded-[24px] p-4 flex items-center justify-between shadow-2xl border border-white/5 overflow-hidden relative group">
                <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity duration-1000"></div>
                <div className="flex items-center gap-4 relative z-10">
                   <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-900/40 animate-pulse">
                      <i className="fas fa-shield-virus text-sm"></i>
                   </div>
                   <div className="flex items-center gap-6">
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 leading-none mb-1">Risk Node Monitor</p>
                         <p className="text-xs font-bold text-white/80">3 High-risk login attempts blocked. 12 Tenants awaiting KYC verification.</p>
                      </div>
                      <div className="h-8 w-px bg-white/10 hidden md:block"></div>
                      <div className="hidden lg:block">
                         <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 leading-none mb-1">Global Treasury</p>
                         <p className="text-xs font-bold text-white/80">Withdrawal queue: Rp 0. All settlements cleared.</p>
                      </div>
                   </div>
                </div>
                <div className="flex gap-3 relative z-10">
                   <button onClick={() => onNavigate('super-admin', 'tenants')} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all">Authorize KYC</button>
                   <button onClick={() => onNavigate('super-admin', 'security')} className="px-6 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Audit Logs</button>
                </div>
             </div>
          </div>
        )}

        {/* MAIN CONTENT: DATA & KONTROL */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc] scroll-smooth p-10">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
