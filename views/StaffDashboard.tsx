
import React, { useState, useMemo } from 'react';
import { 
  MOCK_BOOKINGS, MOCK_UNITS, MOCK_BUSINESSES, MOCK_USERS, MOCK_PROMOTIONS 
} from '../constants';
import { 
  BookingStatus, Unit, UnitStatus, Booking, User, UserRole 
} from '../types';
import { ActivityLogHub } from './staff/ActivityLogHub';
import { OperationalOverview } from './staff/OperationalOverview';
import { ReservationHandling } from './staff/ReservationHandling';
import { CheckInOutManagement } from './staff/CheckInOutManagement';
import { UnitAvailability } from './staff/UnitAvailability';
import { GuestDataManagement } from './staff/GuestDataManagement';
import { OperationalTreasury } from './staff/OperationalTreasury';
import { PromoPricingOps } from './staff/PromoPricingOps';
import { TaskActivityHub } from './staff/TaskActivityHub';
import { NotificationCenter } from './staff/NotificationCenter';
import { HelpSopHub } from './staff/HelpSopHub';

type StaffModule = 'ops-monitor' | 'reception-desk' | 'check-in-out' | 'unit-inventory' | 'guest-ledger' | 'promo-pricing' | 'daily-cashier' | 'notification-hub' | 'task-hub' | 'sop-library' | 'activity-logs' | 'profile';

interface StaffDashboardProps {
    currentUser: User | null;
    onUpdateUser: (data: Partial<User>) => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ currentUser, onUpdateUser }) => {
  const [activeModule, setActiveModule] = useState<StaffModule>('ops-monitor');
  const [businessId] = useState('b1'); 
  const TODAY = '2024-12-28';
  
  const business = useMemo(() => MOCK_BUSINESSES.find(b => b.id === businessId) || MOCK_BUSINESSES[0], [businessId]);
  const [units, setUnits] = useState<Unit[]>(MOCK_UNITS.filter(u => u.businessId === businessId));
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS.filter(b => b.businessId === businessId));
  const [localUsers, setLocalUsers] = useState<User[]>(MOCK_USERS);

  // --- 1. ALERT PANEL LOGIC (URGENT TASKS) ---
  const priorityTasks = useMemo(() => {
    return [
      ...units.filter(u => u.status === UnitStatus.DIRTY).map(u => ({ id: u.id, type: 'CLEANING', label: `Clean ${u.name}`, priority: 'high' })),
      ...bookings.filter(b => !b.verifiedPayment && b.status !== BookingStatus.CANCELLED).map(b => ({ id: b.id, type: 'PAYMENT', label: `Settlement #${b.id}`, priority: 'medium' }))
    ];
  }, [units, bookings]);

  // --- 2. HANDLERS ---
  const handleOperationalAction = (id: string, action: string) => {
    if (action === 'CHECKIN' || action === BookingStatus.CHECKED_IN) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: BookingStatus.CHECKED_IN } : b));
      alert(`Identity verified. Room access authorized for node ${id}.`);
    } else if (action === 'CHECKOUT' || action === BookingStatus.COMPLETED) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: BookingStatus.COMPLETED } : b));
      const booking = bookings.find(b => b.id === id);
      if (booking) {
        setUnits(prev => prev.map(u => u.id === booking.unitId ? { ...u, status: UnitStatus.DIRTY, available: false } : u));
      }
      alert(`Settlement closed. Unit node returned to Housekeeping queue.`);
    } else if (action === BookingStatus.CONFIRMED) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: BookingStatus.CONFIRMED } : b));
    }
  };

  const handleConfirmPayment = (bookingId: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, verifiedPayment: true } : b));
  };

  const handleUpdateUnitStatus = (unitId: string, status: UnitStatus, available: boolean) => {
    setUnits(prev => prev.map(u => u.id === unitId ? { ...u, status, available } : u));
  };

  const handleAddManualBooking = (newBk: Booking) => {
    setBookings(prev => [newBk, ...prev]);
  };

  const handleCheckIn = (id: string, data: any) => {
    handleOperationalAction(id, 'CHECKIN');
  };

  const handleCheckOut = (id: string, notes: string) => {
    handleOperationalAction(id, 'CHECKOUT');
    if (notes) console.log(`Damage Log for ${id}: ${notes}`);
  };

  const handleUpdateGuestIdentity = (id: string, data: Partial<User>) => {
    setLocalUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
  };

  const renderModuleContent = () => {
    switch (activeModule) {
      case 'ops-monitor': return <OperationalOverview bookings={bookings} units={units} onAction={handleOperationalAction} />;
      case 'reception-desk': return (
        <ReservationHandling 
          bookings={bookings} 
          units={units} 
          onUpdateStatus={(id, status) => handleOperationalAction(id, status)}
          onAddBooking={handleAddManualBooking}
          onModifyDates={() => alert('Modifying temporal node requires Owner Overide.')}
        />
      );
      case 'check-in-out': return (
        <CheckInOutManagement 
          bookings={bookings} 
          units={units} 
          onCheckIn={handleCheckIn} 
          onCheckOut={handleCheckOut} 
        />
      );
      case 'unit-inventory': return (
        <UnitAvailability 
          units={units} 
          onUpdateUnitStatus={handleUpdateUnitStatus} 
        />
      );
      case 'daily-cashier': return (
        <OperationalTreasury 
          bookings={bookings} 
          units={units} 
          onConfirmPayment={handleConfirmPayment} 
        />
      );
      case 'guest-ledger': return (
        <GuestDataManagement 
          guests={localUsers.filter(u => u.role === UserRole.GUEST)} 
          bookings={bookings} 
          onUpdateGuest={handleUpdateGuestIdentity} 
        />
      );
      case 'promo-pricing': return (
        <PromoPricingOps 
          businessId={businessId} 
          promotions={MOCK_PROMOTIONS} 
        />
      );
      case 'notification-hub': return <NotificationCenter />;
      case 'task-hub': return <TaskActivityHub currentUser={currentUser} />;
      case 'sop-library': return <HelpSopHub />;
      case 'activity-logs': return <ActivityLogHub businessId={businessId} />;
      default: return (
        <div className="py-40 text-center animate-fade-up">
           <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-[40px] flex items-center justify-center mx-auto mb-8 text-4xl shadow-inner border border-white">
              <i className="fas fa-layer-group"></i>
           </div>
           <h3 className="text-2xl font-black text-slate-900 uppercase italic">Operational Cluster Connected</h3>
           <p className="text-slate-400 font-medium max-w-md mx-auto mt-2 leading-relaxed">
              Terminal sinkronisasi data sedang mengakses node <strong>{activeModule.replace('-', ' ')}</strong> untuk properti {business.name}.
           </p>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      
      {/* 1. SIDEBAR KIRI: NAVIGASI OPERASIONAL */}
      <aside className="w-80 bg-white border-r border-slate-200/60 flex flex-col z-50 shadow-sm shrink-0">
        <div className="h-24 flex items-center px-10 border-b border-slate-50 mb-6">
          <div className="flex items-center gap-4">
             <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3 shadow-indigo-100">
                <i className="fas fa-clipboard-list"></i>
             </div>
             <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight text-slate-900 uppercase leading-none">Ops Desk</span>
                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md mt-1 self-start">Front Line Hub</span>
             </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-6 space-y-1.5 scrollbar-hide">
           {[
             { id: 'ops-monitor', label: 'Overview Ops', icon: 'fa-gauge-high' },
             { id: 'notification-hub', label: 'Notification Center', icon: 'fa-tower-broadcast' },
             { id: 'reception-desk', label: 'Reservation Matrix', icon: 'fa-calendar-check' },
             { id: 'check-in-out', label: 'Check-In/Out Desk', icon: 'fa-id-card-clip' },
             { id: 'unit-inventory', label: 'Unit Availability', icon: 'fa-door-open' },
             { id: 'guest-ledger', label: 'Guest Identity Hub', icon: 'fa-user-group' },
             { id: 'promo-pricing', label: 'Promo & Pricing', icon: 'fa-tags' },
             { id: 'daily-cashier', label: 'Treasury & Cashier', icon: 'fa-vault' },
             { id: 'task-hub', label: 'Tugas & Aktivitas', icon: 'fa-list-check' },
             { id: 'sop-library', label: 'Help & SOP Access', icon: 'fa-book-open' },
             { id: 'activity-logs', label: 'Log Sinyal Sistem', icon: 'fa-fingerprint' },
             { id: 'profile', label: 'Profil Saya', icon: 'fa-user-gear' }
           ].map(item => (
             <button 
                key={item.id}
                onClick={() => setActiveModule(item.id as StaffModule)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                  activeModule === item.id ? 'bg-indigo-600 text-white shadow-2xl scale-[1.02]' : 'text-slate-500 hover:bg-slate-50'
                }`}
             >
                <i className={`fas ${item.icon} text-lg w-6`}></i>
                {item.label}
             </button>
           ))}
        </nav>

        <div className="p-6 border-t border-slate-50 bg-slate-50/30">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
              <p className="text-[9px] font-black text-indigo-900 uppercase tracking-widest">Operator Online: {currentUser?.name.split(' ')[0]}</p>
           </div>
        </div>
      </aside>

      {/* 2. AREA KERJA UTAMA (TOP NAVBAR + MAIN CONTENT) */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP NAVBAR: NOTIFIKASI, QUICK ACTION, PROFIL */}
        <header className="h-24 bg-white/70 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-10 shrink-0 sticky top-0 z-40">
           <div className="flex items-center gap-4">
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">{activeModule.replace('-', ' ')} HUB</h1>
           </div>
           
           <div className="flex items-center gap-6">
              <div className="hidden md:flex gap-2">
                 <button onClick={() => alert('Launching Walk-In Protocol...')} className="px-6 py-3 bg-slate-950 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2 shadow-lg">
                    <i className="fas fa-plus"></i> Walk-In Baru
                 </button>
              </div>
              <div className="w-px h-8 bg-slate-200"></div>
              <div className="flex items-center gap-4">
                 <div className="relative group">
                    <button className="w-11 h-11 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                       <i className="fas fa-bell"></i>
                       <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full border-2 border-white shadow-sm"></span>
                    </button>
                 </div>
                 <div className="flex items-center gap-3 pl-2">
                    <img src={currentUser?.avatar} className="w-10 h-10 rounded-xl object-cover ring-2 ring-white shadow-md border border-slate-100" alt="avatar" />
                    <div className="hidden lg:block text-left">
                       <p className="text-[11px] font-black text-slate-900 uppercase leading-none">{currentUser?.name.split(' ')[0]}</p>
                       <p className="text-[8px] font-black text-indigo-600 uppercase mt-0.5 tracking-widest italic">Sovereign Staff</p>
                    </div>
                 </div>
              </div>
           </div>
        </header>

        {/* WRAPPER MAIN CONTENT & ALERT PANEL */}
        <div className="flex-1 flex overflow-hidden">
           
           {/* MAIN CONTENT AREA */}
           <main className="flex-1 overflow-y-auto p-10 scrollbar-hide">
              <div className="max-w-[1100px] mx-auto">
                 {renderModuleContent()}
              </div>
           </main>

           {/* 3. ALERT PANEL: TUGAS PRIORITAS (RIGHT SIDEBAR) */}
           <aside className="w-96 bg-white border-l border-slate-200/60 flex flex-col shrink-0 overflow-y-auto scrollbar-hide">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                 <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Priority Radar</h3>
                 <span className="px-2 py-1 bg-rose-600 text-white rounded-[4px] text-[8px] font-black uppercase shadow-lg shadow-rose-900/20">LIVE DUTY</span>
              </div>

              <div className="p-8 space-y-12">
                 {/* Urgent Task Hub */}
                 <div className="space-y-6">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center text-xs shadow-inner"><i className="fas fa-triangle-exclamation"></i></div>
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Execute Immediately</h4>
                    </div>
                    <div className="space-y-4">
                       {priorityTasks.map(task => (
                          <div key={task.id} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 hover:border-indigo-200 transition-all group relative overflow-hidden">
                             <div className={`absolute top-0 right-0 w-1 h-full ${task.priority === 'high' ? 'bg-rose-500' : 'bg-amber-400'}`}></div>
                             <div className="flex justify-between items-center mb-3">
                                <p className="font-black text-slate-900 uppercase text-[11px]">{task.label}</p>
                                <span className={`text-[8px] font-black uppercase ${task.priority === 'high' ? 'text-rose-600' : 'text-amber-600'}`}>{task.priority} Priority</span>
                             </div>
                             <button className="w-full mt-2 py-3 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                Resolve Task
                             </button>
                          </div>
                       ))}
                       {priorityTasks.length === 0 && (
                          <div className="py-20 text-center opacity-30">
                             <i className="fas fa-check-circle text-4xl mb-4 text-emerald-500"></i>
                             <p className="text-[10px] font-black uppercase">All clear</p>
                          </div>
                       )}
                    </div>
                 </div>

                 {/* Operational Instructions */}
                 <div className="p-8 bg-slate-950 rounded-[40px] text-white space-y-4 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
                    <div className="relative z-10 flex items-center gap-3 mb-2">
                       <i className="fas fa-shield-halved text-indigo-400 text-xs"></i>
                       <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">Operational Standard</p>
                    </div>
                    <p className="text-[11px] font-medium leading-relaxed opacity-60 relative z-10 italic">
                       "Pastikan penagihan sisa pelunasan dan verifikasi identitas fisik tamu dilakukan sebelum menyerahkan kunci akses node."
                    </p>
                 </div>
              </div>
           </aside>
        </div>

        {/* Operational Footer */}
        <footer className="h-14 bg-white border-t border-slate-100 flex items-center justify-between px-10 shrink-0">
           <div className="flex items-center gap-4 opacity-30">
              <i className="fas fa-shield-check text-indigo-900 text-sm"></i>
              <p className="text-[8px] font-black text-slate-900 uppercase tracking-[0.5em] italic">SEULANGA OPERATIONAL HUB • SECURITY LEVEL 4A ACTIVE</p>
           </div>
        </footer>
      </div>
    </div>
  );
};
