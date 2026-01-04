
import React, { useState, useMemo } from 'react';
import { 
  MOCK_BOOKINGS, MOCK_UNITS, MOCK_BUSINESSES, MOCK_USERS 
} from '../constants';
import { 
  BookingStatus, Unit, UnitStatus, Booking, User, UserRole 
} from '../types';
import { ActivityLogHub } from './staff/ActivityLogHub';

type StaffModule = 'ops-monitor' | 'reception-desk' | 'cleaning-hub' | 'daily-cashier' | 'guest-ledger' | 'sop-library' | 'activity-logs' | 'profile';

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

  // --- 1. PRIORITY ALERT LOGIC (RIGHT PANEL) ---
  const priorityAlerts = useMemo(() => {
    return {
      urgentArrivals: bookings.filter(b => b.checkIn === TODAY && b.status === BookingStatus.CONFIRMED),
      urgentDepartures: bookings.filter(b => b.checkOut === TODAY && b.status === BookingStatus.CHECKED_IN),
      dirtyUnits: units.filter(u => u.status === UnitStatus.DIRTY),
    };
  }, [bookings, units]);

  // --- 2. HANDLERS ---
  const handleBookingTransition = (id: string, status: BookingStatus) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    alert(`Protocol: Booking ${id} status updated to ${status}.`);
  };

  const updateUnitStatus = (unitId: string, status: UnitStatus) => {
    setUnits(prev => prev.map(u => u.id === unitId ? { ...u, status, available: status === UnitStatus.READY } : u));
  };

  // --- 3. MODULE RENDERERS ---
  const renderOpsMonitor = () => (
    <div className="space-y-10 animate-fade-up">
       {/* High Velocity Stats */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Live Occupancy</p>
             <h3 className="text-4xl font-black text-slate-900 tracking-tighter">
                {Math.round((bookings.filter(b => b.status === BookingStatus.CHECKED_IN).length / units.length) * 100)}%
             </h3>
          </div>
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Housekeeping Queue</p>
             <h3 className="text-4xl font-black text-amber-600 tracking-tighter">{priorityAlerts.dirtyUnits.length}</h3>
          </div>
          <div className="bg-slate-950 p-8 rounded-[40px] text-white shadow-xl flex items-center justify-between">
             <div>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Daily Cash Balance</p>
                <h3 className="text-2xl font-black text-emerald-400 tracking-tight">Rp 4.250.000</h3>
             </div>
             <i className="fas fa-vault text-indigo-600/30 text-3xl"></i>
          </div>
       </div>

       {/* Active Table: Reception Workflow */}
       <div className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-sm space-y-8">
          <h3 className="text-2xl font-black text-slate-900 uppercase italic">Front Desk Traffic</h3>
          <div className="overflow-x-auto rounded-[32px] border border-slate-50">
             <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                   <tr>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest Node</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Node</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Status</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Oversight</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {bookings.slice(0, 5).map(bk => (
                      <tr key={bk.id} className="hover:bg-slate-50/50 transition-colors">
                         <td className="px-8 py-6">
                            <p className="font-black text-slate-900 uppercase text-xs">G-NODE-#{bk.guestId.substring(0,6).toUpperCase()}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">REF: {bk.id}</p>
                         </td>
                         <td className="px-8 py-6 font-bold text-slate-600 text-sm uppercase">
                            {units.find(u => u.id === bk.unitId)?.name}
                         </td>
                         <td className="px-8 py-6">
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                               bk.status === BookingStatus.CHECKED_IN ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                               bk.status === BookingStatus.CONFIRMED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                               'bg-slate-50 text-slate-400 border-slate-100'
                            }`}>{bk.status}</span>
                         </td>
                         <td className="px-8 py-6 text-right">
                            <button className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">Authorize</button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      
      {/* 1. SIDEBAR KIRI: MENU OPERASIONAL */}
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
             { id: 'ops-monitor', label: 'Dashboard Ops', icon: 'fa-gauge-high' },
             { id: 'reception-desk', label: 'Receptionist Desk', icon: 'fa-id-card-clip' },
             { id: 'cleaning-hub', label: 'Housekeeping Hub', icon: 'fa-broom-wide' },
             { id: 'daily-cashier', label: 'Kasir & Petty Cash', icon: 'fa-money-bill-transfer' },
             { id: 'guest-ledger', label: 'Daftar Tamu', icon: 'fa-user-group' },
             { id: 'activity-logs', label: 'Log Aktivitas', icon: 'fa-tower-broadcast' },
             { id: 'sop-library', label: 'Standard SOP', icon: 'fa-book-open' },
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
                 {activeModule === 'ops-monitor' && renderOpsMonitor()}
                 {activeModule === 'activity-logs' && <ActivityLogHub businessId={businessId} />}
                 
                 {/* Module Fallback */}
                 {activeModule !== 'ops-monitor' && activeModule !== 'activity-logs' && (
                    <div className="py-40 text-center animate-fade-up">
                       <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-[40px] flex items-center justify-center mx-auto mb-8 text-4xl shadow-inner border border-white">
                          <i className="fas fa-microchip"></i>
                       </div>
                       <h3 className="text-2xl font-black text-slate-900 uppercase italic">Operational Cluster Connected</h3>
                       <p className="text-slate-400 font-medium max-w-md mx-auto mt-2 leading-relaxed">
                          Terminal sinkronisasi data sedang mengakses node <strong>{activeModule.replace('-', ' ')}</strong> untuk properti {business.name}.
                       </p>
                    </div>
                 )}
              </div>
           </main>

           {/* 3. ALERT PANEL: TUGAS PRIORITAS (RIGHT SIDEBAR) */}
           <aside className="w-96 bg-white border-l border-slate-200/60 flex flex-col shrink-0 overflow-y-auto scrollbar-hide">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                 <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Critical Alert Hub</h3>
                 <span className="px-2 py-1 bg-rose-600 text-white rounded-[4px] text-[8px] font-black uppercase shadow-lg shadow-rose-900/20">LIVE DUTY</span>
              </div>

              <div className="p-8 space-y-12">
                 {/* Arrivals Node */}
                 <div className="space-y-6">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center text-xs shadow-inner"><i className="fas fa-plane-arrival"></i></div>
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Arrival Protocols</h4>
                    </div>
                    <div className="space-y-4">
                       {priorityAlerts.urgentArrivals.map(arr => (
                          <div key={arr.id} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer group">
                             <div className="flex justify-between items-start mb-3">
                                <p className="font-black text-slate-900 uppercase text-[11px]">#{arr.id}</p>
                                <span className="text-[8px] font-black text-emerald-600 uppercase px-2 py-0.5 bg-emerald-50 rounded">Confimed</span>
                             </div>
                             <p className="text-[10px] font-bold text-slate-500 uppercase">UNIT: {units.find(u => u.id === arr.unitId)?.name}</p>
                             <button 
                                onClick={() => handleBookingTransition(arr.id, BookingStatus.CHECKED_IN)}
                                className="w-full mt-4 py-3 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                             >
                                Process Check-In
                             </button>
                          </div>
                       ))}
                       {priorityAlerts.urgentArrivals.length === 0 && <p className="text-center py-10 text-[10px] text-slate-300 font-bold uppercase italic">No arrivals pending.</p>}
                    </div>
                 </div>

                 {/* Cleaning Node */}
                 <div className="space-y-6 pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center text-xs shadow-inner"><i className="fas fa-broom"></i></div>
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cleaning Queue</h4>
                    </div>
                    <div className="space-y-3">
                       {priorityAlerts.dirtyUnits.map(unit => (
                          <div key={unit.id} className="p-5 bg-slate-50 rounded-[28px] border border-slate-100 flex items-center justify-between group">
                             <div>
                                <p className="font-black text-slate-800 uppercase text-[11px]">{unit.name}</p>
                                <p className="text-[8px] font-bold text-rose-500 uppercase mt-1 flex items-center gap-1">
                                   <span className="w-1 h-1 bg-rose-500 rounded-full animate-pulse"></span>
                                   Status: Dirty
                                </p>
                             </div>
                             <button 
                               onClick={() => updateUnitStatus(unit.id, UnitStatus.CLEANING)}
                               className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
                             >
                                <i className="fas fa-play text-[9px]"></i>
                             </button>
                          </div>
                       ))}
                       {priorityAlerts.dirtyUnits.length === 0 && <p className="text-center py-10 text-[10px] text-slate-300 font-bold uppercase italic">All units are READY.</p>}
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
              <p className="text-[8px] font-black text-slate-900 uppercase tracking-[0.5em] italic">SEULANGA OPERATIONAL TERMINAL • SECURITY LEVEL 4A ACTIVE</p>
           </div>
           <div className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
              Last Pulse Check: {new Date().toLocaleTimeString()}
           </div>
        </footer>
      </div>
    </div>
  );
};
