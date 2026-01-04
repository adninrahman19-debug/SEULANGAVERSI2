
import React, { useState, useEffect, useMemo } from 'react';
import { 
  MOCK_BUSINESSES, MOCK_BOOKINGS, MOCK_UNITS, MOCK_TRANSACTIONS, 
  MOCK_USERS, MOCK_REVIEWS, MOCK_PROMOTIONS, MOCK_AUDIT_LOGS, MOCK_NOTIFICATIONS
} from '../constants';
import { getBusinessInsights } from '../services/geminiService';
import { 
  BookingStatus, UserRole, Unit, Business, User, 
  Booking, VerificationStatus, Transaction, Promotion, 
  AuditLog, Review, SubscriptionPlan, SystemModule, CategoryModuleConfig, UnitStatus, PricingRule 
} from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { RevenueStrategy } from './owner/RevenueStrategy';
import { TeamManagement } from './owner/TeamManagement';

const revenueData = [
  { name: 'Jul', revenue: 45000000, occupancy: 78, bookings: 42 },
  { name: 'Aug', revenue: 52000000, occupancy: 82, bookings: 48 },
  { name: 'Sep', revenue: 48000000, occupancy: 75, bookings: 39 },
  { name: 'Oct', revenue: 61000000, occupancy: 88, bookings: 55 },
  { name: 'Nov', revenue: 55000000, occupancy: 80, bookings: 50 },
  { name: 'Dec', revenue: 78000000, occupancy: 95, bookings: 72 },
];

type ModuleType = 'overview' | 'inventory' | 'bookings' | 'finance' | 'revenue-intel' | 'team' | 'profile' | 'marketing' | 'reviews' | 'subscription';

interface OwnerDashboardProps {
  businessId: string;
  moduleConfigs: CategoryModuleConfig;
  currentUser: User | null;
  onUpdateUser: (data: Partial<User>) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ businessId, moduleConfigs, currentUser, onUpdateUser }) => {
  const [activeModule, setActiveModule] = useState<ModuleType>('overview');
  const [selectedBizId, setSelectedBizId] = useState(businessId);
  const [insights, setInsights] = useState<string>('Memuat intelejen bisnis...');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  // 1. DATA FILTERING BERDASARKAN KEPEMILIKAN (MULTI-PROPERTY)
  const ownedBusinesses = useMemo(() => 
    MOCK_BUSINESSES.filter(b => b.ownerId === currentUser?.id), 
  [currentUser]);

  const business = useMemo(() => {
    return ownedBusinesses.find(b => b.id === selectedBizId) || ownedBusinesses[0] || MOCK_BUSINESSES[0];
  }, [selectedBizId, ownedBusinesses]);

  const units = useMemo(() => MOCK_UNITS.filter(u => u.businessId === business.id), [business.id]);
  const bookings = useMemo(() => MOCK_BOOKINGS.filter(b => b.businessId === business.id), [business.id]);

  useEffect(() => {
    fetchInsights();
  }, [business.id]);

  const fetchInsights = async () => {
    setInsights("Menghubungkan ke Gemini AI...");
    const text = await getBusinessInsights({
      revenue: revenueData[revenueData.length-1].revenue,
      occupancy: `${revenueData[revenueData.length-1].occupancy}%`,
      unitCount: units.length,
      category: business.category,
      name: business.name
    });
    setInsights(text || "AI Insights saat ini tidak tersedia.");
  };

  const navItems = useMemo(() => {
    const activeModules = moduleConfigs[business.category] || [];
    const items = [
      { id: 'overview', label: 'Ringkasan', icon: 'fa-chess-king', module: null },
      { id: 'revenue-intel', label: 'Strategi Harga', icon: 'fa-money-bill-trend-up', module: null },
      { id: 'bookings', label: 'Reservasi', icon: 'fa-calendar-check', module: SystemModule.BOOKING },
      { id: 'inventory', label: 'Aset & Unit', icon: 'fa-door-open', module: SystemModule.INVENTORY },
      { id: 'finance', label: 'Treasury & Payout', icon: 'fa-receipt', module: SystemModule.PAYMENT },
      { id: 'team', label: 'Manajemen Tim', icon: 'fa-users-gear', module: SystemModule.TEAM },
      { id: 'marketing', label: 'Growth Ads', icon: 'fa-rocket', module: SystemModule.MARKETING },
      { id: 'reviews', label: 'Ulasan Tamu', icon: 'fa-comment-dots', module: SystemModule.REVIEWS },
      { id: 'profile', label: 'Profil Bisnis', icon: 'fa-id-card', module: null },
    ];
    return items.filter(item => !item.module || activeModules.includes(item.module));
  }, [business.category, moduleConfigs]);

  // --- RENDER MODUL OVERVIEW ---
  const renderOverview = () => (
    <div className="space-y-10 animate-fade-up">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
             <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shadow-inner"><i className="fas fa-sack-dollar"></i></div>
                <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">+12.5%</span>
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gross Revenue (MoM)</p>
             <h3 className="text-2xl font-black text-slate-900 tracking-tight">Rp {(revenueData[5].revenue / 1000000).toFixed(1)}M</h3>
          </div>
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
             <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl shadow-inner"><i className="fas fa-calendar-check"></i></div>
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Bookings</p>
             <h3 className="text-2xl font-black text-slate-900 tracking-tight">{bookings.length} <span className="text-xs font-bold text-slate-400 uppercase ml-2">Threads</span></h3>
          </div>
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
             <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center text-xl shadow-inner"><i className="fas fa-door-open"></i></div>
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Occupancy Rate</p>
             <h3 className="text-2xl font-black text-slate-900 tracking-tight">{revenueData[5].occupancy}%</h3>
          </div>
          <div className="bg-slate-950 p-8 rounded-[40px] shadow-xl text-white relative overflow-hidden flex flex-col justify-center">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
             <div className="relative z-10 text-center">
                <i className="fas fa-medal text-indigo-400 text-3xl mb-3"></i>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 mb-2">Verified Balance</h4>
                <p className="text-2xl font-black text-emerald-400 tracking-tighter leading-none mb-4">Rp 12.4M</p>
                <button className="w-full py-2.5 bg-white text-indigo-600 rounded-xl font-black text-[9px] uppercase tracking-widest hover:scale-105 transition-all">Withdraw</button>
             </div>
          </div>
       </div>

       <div className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-sm space-y-10">
          <div className="flex items-center justify-between">
             <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">Market Performance Matrix</h3>
             <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div><span className="text-[10px] font-black text-slate-400 uppercase">Revenue</span></div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div><span className="text-[10px] font-black text-slate-400 uppercase">Occupancy</span></div>
             </div>
          </div>
          <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="ownerRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                  <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                  <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={5} fill="url(#ownerRev)" />
                  <Area type="monotone" dataKey="occupancy" stroke="#10b981" strokeWidth={3} fill="transparent" />
               </AreaChart>
            </ResponsiveContainer>
          </div>
       </div>
    </div>
  );

  const renderFinance = () => (
    <div className="space-y-12 animate-fade-up">
       <div className="bg-slate-950 p-12 rounded-[56px] shadow-2xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-10">
             <div className="space-y-6">
                <span className="px-4 py-1.5 bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/30">Treasury Payout Node</span>
                <h2 className="text-5xl font-black tracking-tighter uppercase leading-none italic">Verified Balance.</h2>
                <div className="pt-6 border-t border-white/10">
                   <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Estimasi Pencairan Berikutnya</p>
                   <p className="text-4xl font-black text-emerald-400 tracking-tighter">Rp 12.450.000</p>
                </div>
             </div>
             <button onClick={() => alert('Mencairkan dana ke rekening terdaftar...')} className="px-10 py-5 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.05] transition-all">Withdraw To Bank</button>
          </div>
       </div>

       <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-10">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner"><i className="fas fa-lock"></i></div>
             <h3 className="text-xl font-black text-slate-900 uppercase">Aturan Keuangan (Otoritas Platform)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 relative overflow-hidden">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Biaya Komisi Platform</p>
                <p className="text-2xl font-black text-indigo-600">{business.commissionRate || 10}% <span className="text-[10px] font-bold text-slate-400">Per Transaksi</span></p>
                <p className="mt-4 text-[9px] text-slate-400 italic">Dikelola secara global oleh Super Admin Seulanga.</p>
             </div>
             <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 relative overflow-hidden">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Service Fee Guest</p>
                <p className="text-2xl font-black text-slate-900">Rp {(business.serviceFee || 25000).toLocaleString()}</p>
                <p className="mt-4 text-[9px] text-slate-400 italic">Dikelola secara global oleh Super Admin Seulanga.</p>
             </div>
          </div>
       </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      {/* 1. SIDEBAR KIRI: MENU OPERASIONAL */}
      <aside className="w-80 bg-white border-r border-slate-200/60 transition-all duration-500 flex flex-col z-50 shadow-sm shrink-0">
        <div className="h-24 flex items-center px-8 border-b border-slate-50 shrink-0">
          <div className="flex items-center gap-4">
             <div className="w-11 h-11 bg-slate-950 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
                <i className="fas fa-building-circle-check"></i>
             </div>
             <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight text-slate-900 uppercase leading-none">Proprietary</span>
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md self-start mt-1">Owner Node</span>
             </div>
          </div>
        </div>

        {/* PROPERTY SWITCHER (Multi-property support) */}
        <div className="p-6 border-b border-slate-50 bg-slate-50/50">
           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Active Entity Context</p>
           <div className="relative">
              <select 
                value={selectedBizId}
                onChange={(e) => setSelectedBizId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-10 pr-4 text-xs font-black text-slate-700 outline-none focus:ring-4 ring-indigo-50 appearance-none shadow-sm cursor-pointer"
              >
                 {ownedBusinesses.map(b => (
                    <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>
                 ))}
              </select>
              <i className="fas fa-building absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 text-[10px]"></i>
              <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 text-[8px]"></i>
           </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 overflow-y-auto p-6 space-y-1.5 scrollbar-hide">
           {navItems.map(item => (
             <button 
                key={item.id}
                onClick={() => setActiveModule(item.id as ModuleType)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  activeModule === item.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-100 scale-[1.02]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
             >
                <i className={`fas ${item.icon} text-base w-6`}></i>
                {item.label}
             </button>
           ))}
        </nav>

        {/* STATUS BAR: SUBSCRIPTION & LIMIT (Bottom of Sidebar) */}
        <div className="p-6 mt-auto border-t border-slate-50 bg-slate-50/30">
           <div className="p-5 bg-slate-950 rounded-[32px] text-white relative overflow-hidden shadow-2xl space-y-4">
              <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl"></div>
              <div className="flex justify-between items-center relative z-10">
                 <span className="text-[9px] font-black uppercase tracking-widest text-indigo-300">{business.subscription} Plan</span>
                 <i className="fas fa-gem text-indigo-400 text-xs"></i>
              </div>
              <div className="space-y-1.5 relative z-10">
                 <div className="flex justify-between text-[10px] font-bold text-white/50 uppercase tracking-widest">
                    <span>Unit usage</span>
                    <span>{units.length} / {business.subscription === 'Premium' ? '∞' : business.subscription === 'Pro' ? '50' : '10'}</span>
                 </div>
                 <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(units.length / 50) * 100}%` }}></div>
                 </div>
              </div>
           </div>
        </div>
      </aside>

      {/* 2. TOP NAVBAR: QUICK ACTIONS & PROFILE */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
         <header className="h-24 bg-white/70 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-10 sticky top-0 z-40">
            <div className="flex items-center gap-4">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
               <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">{activeModule.replace('-', ' ')} Hub</h1>
            </div>
            
            <div className="flex items-center gap-6">
                {/* QUICK ACTIONS */}
                <div className="hidden md:flex items-center gap-3 pr-6 border-r border-slate-100">
                   <button onClick={() => setActiveModule('bookings')} className="px-5 py-2.5 bg-slate-950 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2">
                      <i className="fas fa-plus"></i> Manual Booking
                   </button>
                   <button onClick={() => alert('Generating daily report node...')} className="w-10 h-10 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl flex items-center justify-center transition-all">
                      <i className="fas fa-file-invoice"></i>
                   </button>
                </div>

                {/* NOTIFICATIONS & PROFILE */}
                <div className="flex items-center gap-4">
                   <div className="relative">
                      <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="w-11 h-11 bg-white border border-slate-200/50 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                         <i className="fas fa-bell"></i>
                      </button>
                      {isNotificationsOpen && (
                        <div className="absolute right-0 mt-4 w-80 bg-white rounded-[32px] shadow-2xl border border-slate-100 p-6 animate-in zoom-in-95 origin-top-right">
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Sinyal Node</h4>
                           <div className="space-y-4">
                              <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic">"Syncing operational logs from Marketplace Node..."</p>
                           </div>
                        </div>
                      )}
                   </div>
                   <div className="flex items-center gap-3 pl-2">
                      <img src={currentUser?.avatar} className="w-10 h-10 rounded-xl object-cover shadow-lg border-2 border-white ring-1 ring-slate-100" alt="profile" />
                      <div className="hidden lg:block text-left">
                         <p className="text-xs font-black text-slate-900 uppercase leading-none">{currentUser?.name.split(' ')[0]}</p>
                         <p className="text-[8px] font-black text-indigo-600 uppercase mt-1 tracking-widest">Sovereign Tier</p>
                      </div>
                   </div>
                </div>
            </div>
         </header>

         {/* 3. MAIN CONTENT: DATA BISNIS */}
         <main className="flex-1 overflow-y-auto scroll-smooth p-12 scrollbar-hide">
            <div className="max-w-[1400px] mx-auto">
               {activeModule === 'overview' && renderOverview()}
               {activeModule === 'revenue-intel' && <RevenueStrategy />}
               {activeModule === 'finance' && renderFinance()}
               {activeModule === 'team' && <TeamManagement businessId={business.id} />}
               
               {/* FALLBACK UNTUK MODUL YANG BELUM DIIMPLEMENTASI KHUSUS */}
               {!['overview', 'revenue-intel', 'finance', 'team'].includes(activeModule) && (
                  <div className="py-40 text-center animate-fade-up">
                     <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-[40px] flex items-center justify-center mx-auto mb-10 text-4xl shadow-inner border border-white">
                        <i className="fas fa-layer-group"></i>
                     </div>
                     <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4">{activeModule.replace('-', ' ')} Operational</h3>
                     <p className="text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
                        Data sinkronisasi dari properti <strong>{business.name}</strong> sedang aktif dalam terminal monitoring.
                     </p>
                     <div className="mt-10 flex justify-center gap-4">
                        <div className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 font-black text-[9px] uppercase tracking-widest">
                           <i className="fas fa-shield-check"></i> Encrypted Connection
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </main>
      </div>
    </div>
  );
};
