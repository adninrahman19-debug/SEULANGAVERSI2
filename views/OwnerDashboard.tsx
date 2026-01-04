
import React, { useState, useMemo, useEffect } from 'react';
import { 
  MOCK_BUSINESSES, MOCK_BOOKINGS, MOCK_UNITS, MOCK_USERS, MOCK_TRANSACTIONS 
} from '../constants';
import { 
  User, Business, Unit, Booking, UserRole, SubscriptionPlan, SystemModule, CategoryModuleConfig, BookingStatus 
} from '../types';
import { BusinessOverview } from './owner/BusinessOverview';
import { RevenueStrategy } from './owner/RevenueStrategy';
import { TeamManagement } from './owner/TeamManagement';
import { BusinessProfile } from './owner/BusinessProfile';
import { UnitManagement } from './owner/UnitManagement';
import { BookingManagement } from './owner/BookingManagement';
import { GuestManagement } from './owner/GuestManagement';
import { PaymentManagement } from './owner/PaymentManagement';
import { MarketingHub } from './owner/MarketingHub';
import { InternalUserManagement } from './owner/InternalUserManagement';
import { ReviewManagement } from './owner/ReviewManagement';

const revenueTrendData = [
  { name: 'Jul', revenue: 45000000, occupancy: 78, bookings: 42 },
  { name: 'Aug', revenue: 52000000, occupancy: 82, bookings: 48 },
  { name: 'Sep', revenue: 48000000, occupancy: 75, bookings: 39 },
  { name: 'Oct', revenue: 61000000, occupancy: 88, bookings: 55 },
  { name: 'Nov', revenue: 55000000, occupancy: 80, bookings: 50 },
  { name: 'Dec', revenue: 78000000, occupancy: 95, bookings: 72 },
];

type ModuleType = 'overview' | 'revenue-intel' | 'bookings' | 'inventory' | 'team' | 'finance' | 'profile' | 'reviews' | 'guests' | 'marketing';

interface OwnerDashboardProps {
  businessId: string;
  moduleConfigs: CategoryModuleConfig;
  currentUser: User | null;
  onUpdateUser: (data: Partial<User>) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ 
  businessId, moduleConfigs, currentUser, onUpdateUser 
}) => {
  const [activeModule, setActiveModule] = useState<ModuleType>('overview');
  const [selectedBizId, setSelectedBizId] = useState(businessId);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // 1. DATA STATE (SIMULATED)
  const [businessesState, setBusinessesState] = useState<Business[]>(MOCK_BUSINESSES);
  const [unitsState, setUnitsState] = useState<Unit[]>(MOCK_UNITS);
  const [bookingsState, setBookingsState] = useState<Booking[]>(MOCK_BOOKINGS);

  // 2. MULTI-PROPERTY LOGIC
  const ownedBusinesses = useMemo(() => 
    businessesState.filter(b => b.ownerId === currentUser?.id), 
  [currentUser, businessesState]);

  const business = useMemo(() => 
    businessesState.find(b => b.id === selectedBizId) || ownedBusinesses[0] || MOCK_BUSINESSES[0],
  [selectedBizId, ownedBusinesses, businessesState]);

  const units = useMemo(() => unitsState.filter(u => u.businessId === business.id), [business.id, unitsState]);
  const bookings = useMemo(() => bookingsState.filter(b => b.businessId === business.id), [business.id, bookingsState]);

  const navItems = useMemo(() => {
    const activeModules = moduleConfigs[business.category] || [];
    const items = [
      { id: 'overview', label: 'Ringkasan Bisnis', icon: 'fa-grid-horizontal', module: null },
      { id: 'revenue-intel', label: 'Strategi Harga', icon: 'fa-money-bill-trend-up', module: null },
      { id: 'bookings', label: 'Daftar Reservasi', icon: 'fa-calendar-check', module: SystemModule.BOOKING },
      { id: 'inventory', label: 'Unit Management', icon: 'fa-door-open', module: SystemModule.INVENTORY },
      { id: 'guests', label: 'Database Tamu', icon: 'fa-user-group', module: null },
      { id: 'marketing', label: 'Promo & Campaign', icon: 'fa-bullhorn', module: SystemModule.MARKETING },
      { id: 'team', label: 'Manajemen Tim', icon: 'fa-users-gear', module: SystemModule.TEAM },
      { id: 'finance', label: 'Settlement Hub', icon: 'fa-vault', module: SystemModule.PAYMENT },
      { id: 'reviews', label: 'Ulasan Tamu', icon: 'fa-star', module: SystemModule.REVIEWS },
      { id: 'profile', label: 'Profil Bisnis', icon: 'fa-id-card', module: null },
    ];
    return items.filter(item => !item.module || activeModules.includes(item.module));
  }, [business.category, moduleConfigs]);

  const handleUpdateBusiness = (data: Partial<Business>) => {
    setBusinessesState(prev => prev.map(b => b.id === business.id ? { ...b, ...data } : b));
  };

  const handleUpdateUnits = (updatedUnits: Unit[]) => {
    setUnitsState(prev => {
      const filteredOther = prev.filter(u => u.businessId !== business.id);
      return [...filteredOther, ...updatedUnits];
    });
  };

  const handleUpdateBooking = (id: string, status: BookingStatus) => {
    setBookingsState(prev => prev.map(bk => bk.id === id ? { ...bk, status } : bk));
  };

  const handleConfirmPayment = (id: string) => {
    setBookingsState(prev => prev.map(bk => bk.id === id ? { ...bk, verifiedPayment: true } : bk));
    alert('Treasury Authorization: Dana telah diverifikasi dan masuk ke ledger bisnis.');
  };

  const handleAddManualBooking = (newBooking: Booking) => {
    setBookingsState(prev => [newBooking, ...prev]);
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      
      {/* --- SIDEBAR KIRI: NAVIGASI OPERASIONAL --- */}
      <aside className="w-80 bg-white border-r border-slate-200/60 transition-all duration-500 flex flex-col z-50 shadow-sm shrink-0">
        <div className="h-24 flex items-center px-8 border-b border-slate-50 mb-4">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
                <i className="fas fa-building-shield"></i>
             </div>
             <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight text-slate-900 uppercase leading-none">Proprietary</span>
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md self-start mt-1">Owner Node</span>
             </div>
          </div>
        </div>

        <div className="px-6 mb-8">
           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Pilih Properti Aktif</p>
           <div className="relative">
              <select 
                value={selectedBizId}
                onChange={(e) => setSelectedBizId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-10 pr-4 text-xs font-black text-slate-700 outline-none focus:ring-4 ring-indigo-50 appearance-none shadow-sm cursor-pointer"
              >
                 {ownedBusinesses.map(b => (
                    <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>
                 ))}
              </select>
              <i className="fas fa-building absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 text-[10px]"></i>
              <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 text-[8px]"></i>
           </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 space-y-1.5 scrollbar-hide">
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

        <div className="p-6 mt-auto border-t border-slate-50 bg-slate-50/30">
           <div className="p-5 bg-slate-950 rounded-[32px] text-white relative overflow-hidden shadow-2xl space-y-4">
              <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl"></div>
              <div className="flex justify-between items-center relative z-10">
                 <span className="text-[9px] font-black uppercase tracking-widest text-indigo-300">{business.subscription} Plan</span>
                 <i className="fas fa-gem text-indigo-400 text-xs"></i>
              </div>
              <div className="space-y-1.5 relative z-10">
                 <div className="flex justify-between text-[10px] font-bold text-white/50 uppercase tracking-widest">
                    <span>Pemakaian Unit</span>
                    <span>{units.length} / {business.subscription === 'Premium' ? '∞' : business.subscription === 'Pro' ? '50' : '10'}</span>
                 </div>
                 <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${(units.length / (business.subscription === 'Premium' ? units.length || 1 : parseInt(business.subscription === 'Pro' ? '50' : '10'))) * 100}%` }}
                    ></div>
                 </div>
              </div>
           </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-24 bg-white/70 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-10 sticky top-0 z-40">
           <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">{activeModule.replace('-', ' ')} HUB</h1>
           </div>
           
           <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-3 pr-6 border-r border-slate-100">
                 <button onClick={() => setActiveModule('bookings')} className="px-5 py-2.5 bg-slate-950 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2">
                    <i className="fas fa-plus"></i> Reservasi Manual
                 </button>
              </div>

              <div className="flex items-center gap-4">
                 <div className="relative">
                    <button 
                      onClick={() => setIsNotifOpen(!isNotifOpen)}
                      className="w-11 h-11 bg-white border border-slate-200/50 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-sm relative"
                    >
                       <i className="fas fa-bell"></i>
                       <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white"></span>
                    </button>
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

        <main className="flex-1 overflow-y-auto p-12 scrollbar-hide">
           <div className="max-w-[1400px] mx-auto">
              {activeModule === 'overview' && (
                <BusinessOverview 
                  business={business} 
                  bookings={bookings} 
                  units={units} 
                  revenueData={revenueTrendData} 
                />
              )}
              {activeModule === 'revenue-intel' && <RevenueStrategy />}
              {activeModule === 'team' && <InternalUserManagement businessId={business.id} />}
              {activeModule === 'profile' && <BusinessProfile business={business} onUpdate={handleUpdateBusiness} />}
              {activeModule === 'inventory' && <UnitManagement business={business} units={units} onUpdateUnits={handleUpdateUnits} />}
              {activeModule === 'bookings' && (
                <BookingManagement 
                  business={business} 
                  bookings={bookings} 
                  units={units} 
                  onUpdateBooking={handleUpdateBooking}
                  onAddManualBooking={handleAddManualBooking}
                />
              )}
              {activeModule === 'guests' && <GuestManagement businessId={business.id} />}
              {activeModule === 'finance' && (
                <PaymentManagement 
                  business={business} 
                  bookings={bookings} 
                  transactions={MOCK_TRANSACTIONS.filter(tx => tx.businessId === business.id)}
                  units={units}
                  onConfirmPayment={handleConfirmPayment}
                />
              )}
              {activeModule === 'marketing' && (
                <MarketingHub 
                  business={business} 
                  onUpdateBusiness={handleUpdateBusiness}
                />
              )}
              {activeModule === 'reviews' && (
                <ReviewManagement 
                  businessId={business.id} 
                />
              )}
              
              {!['overview', 'revenue-intel', 'team', 'profile', 'inventory', 'bookings', 'guests', 'finance', 'marketing', 'reviews'].includes(activeModule) && (
                 <div className="py-40 text-center animate-fade-up">
                    <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-[40px] flex items-center justify-center mx-auto mb-10 text-4xl shadow-inner border border-white">
                       <i className="fas fa-layer-group"></i>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4">{activeModule.replace('-', ' ')} Operational</h3>
                    <p className="text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
                       Terminal monitoring sedang mengakses data sinkronisasi dari properti <strong>{business.name}</strong>.
                    </p>
                 </div>
              )}
           </div>
        </main>
      </div>
    </div>
  );
};
