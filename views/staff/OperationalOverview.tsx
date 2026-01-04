
import React, { useMemo } from 'react';
import { Booking, Unit, BookingStatus, UnitStatus } from '../../types';

interface OperationalOverviewProps {
  bookings: Booking[];
  units: Unit[];
  onAction: (id: string, action: string) => void;
}

export const OperationalOverview: React.FC<OperationalOverviewProps> = ({ bookings, units, onAction }) => {
  const TODAY = '2024-12-28'; // Mocking today's operational date

  // 1. DATA AGGREGATION FOR SUMMARY
  const stats = useMemo(() => {
    const todayBookings = bookings.filter(b => b.checkIn === TODAY || b.checkOut === TODAY);
    const arrivals = bookings.filter(b => b.checkIn === TODAY && b.status === BookingStatus.CONFIRMED);
    const departures = bookings.filter(b => b.checkOut === TODAY && b.status === BookingStatus.CHECKED_IN);
    const available = units.filter(u => u.status === UnitStatus.READY && u.available).length;
    const pendingPayment = bookings.filter(b => !b.verifiedPayment && b.status !== BookingStatus.CANCELLED).length;

    return { arrivals, departures, available, pendingPayment, todayTotal: todayBookings.length };
  }, [bookings, units]);

  return (
    <div className="space-y-10 animate-fade-up">
      {/* 1. DAILY SNAPSHOT TILES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm group hover:border-emerald-200 transition-all">
           <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shadow-inner">
                 <i className="fas fa-plane-arrival"></i>
              </div>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg">Today</span>
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-In Node</p>
           <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{stats.arrivals.length} <span className="text-sm font-bold text-slate-300 uppercase">Arrivals</span></h3>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm group hover:border-rose-200 transition-all">
           <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl shadow-inner">
                 <i className="fas fa-plane-departure"></i>
              </div>
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-1 rounded-lg">Today</span>
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-Out Node</p>
           <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{stats.departures.length} <span className="text-sm font-bold text-slate-300 uppercase">Departure</span></h3>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm group hover:border-indigo-200 transition-all">
           <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl shadow-inner">
                 <i className="fas fa-door-open"></i>
              </div>
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-lg">Live</span>
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Units Available</p>
           <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{stats.available} <span className="text-sm font-bold text-slate-300 uppercase">Ready</span></h3>
        </div>

        <div className="bg-slate-950 p-8 rounded-[40px] shadow-2xl text-white relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
           <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-white/10 text-indigo-400 flex items-center justify-center text-xl shadow-inner border border-white/5">
                    <i className="fas fa-hand-holding-dollar"></i>
                 </div>
                 <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest animate-pulse">Action Required</span>
              </div>
              <p className="text-[10px] font-black text-indigo-300/50 uppercase tracking-widest mb-1">Pending Settlements</p>
              <h3 className="text-4xl font-black text-white tracking-tighter">{stats.pendingPayment} <span className="text-sm font-bold text-indigo-400 uppercase">Nodes</span></h3>
           </div>
        </div>
      </div>

      {/* 2. RECEPTION DESK LIVE FLOW */}
      <div className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-sm space-y-8">
         <div className="flex items-center justify-between px-2">
            <div>
               <h3 className="text-2xl font-black text-slate-900 uppercase italic">Front Desk Traffic</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Antrian operasional untuk unit masuk dan keluar.</p>
            </div>
            <div className="flex gap-2">
               <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 transition-all"><i className="fas fa-filter text-xs"></i></button>
               <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 transition-all"><i className="fas fa-print text-xs"></i></button>
            </div>
         </div>

         <div className="overflow-x-auto rounded-[32px] border border-slate-50">
            <table className="w-full text-left">
               <thead className="bg-slate-50/50">
                  <tr>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Type</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest Node</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Allocation</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Oversight</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {stats.arrivals.concat(stats.departures).map(bk => (
                     <tr key={bk.id} className="hover:bg-slate-50/30 transition-all group">
                        <td className="px-8 py-6">
                           <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                              bk.checkIn === TODAY ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                           }`}>
                              {bk.checkIn === TODAY ? 'Inbound' : 'Outbound'}
                           </span>
                        </td>
                        <td className="px-8 py-6">
                           <p className="font-black text-slate-900 uppercase text-xs">G-IDENTITY-#{bk.guestId.substring(0,8).toUpperCase()}</p>
                           <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Ref: {bk.id}</p>
                        </td>
                        <td className="px-8 py-6">
                           <p className="text-sm font-black text-slate-700 uppercase">{units.find(u => u.id === bk.unitId)?.name}</p>
                           <div className="flex items-center gap-2 mt-1">
                              <i className={`fas fa-circle text-[6px] ${bk.verifiedPayment ? 'text-emerald-500' : 'text-amber-500'}`}></i>
                              <span className="text-[9px] font-bold text-slate-400 uppercase">{bk.verifiedPayment ? 'Settled' : 'Awaiting Payment'}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <button 
                             onClick={() => onAction(bk.id, bk.checkIn === TODAY ? 'CHECKIN' : 'CHECKOUT')}
                             className="px-6 py-2.5 bg-slate-950 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-600 transition-all"
                           >
                              {bk.checkIn === TODAY ? 'Authorize In' : 'Finalize Out'}
                           </button>
                        </td>
                     </tr>
                  ))}
                  {stats.arrivals.length === 0 && stats.departures.length === 0 && (
                     <tr>
                        <td colSpan={4} className="py-20 text-center">
                           <i className="fas fa-calendar-check text-slate-100 text-6xl mb-4"></i>
                           <p className="text-slate-300 font-black uppercase text-[10px] tracking-widest italic">No pending desk protocols for today.</p>
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};
