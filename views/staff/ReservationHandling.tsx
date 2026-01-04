
import React, { useState, useMemo } from 'react';
import { Booking, BookingStatus, Unit, UnitStatus } from '../../types';

interface ReservationHandlingProps {
  bookings: Booking[];
  units: Unit[];
  onUpdateStatus: (id: string, status: BookingStatus) => void;
  onAddBooking: (booking: Booking) => void;
  onModifyDates: (id: string, checkIn: string, checkOut: string) => void;
}

export const ReservationHandling: React.FC<ReservationHandlingProps> = ({ 
  bookings, units, onUpdateStatus, onAddBooking, onModifyDates 
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [modifyingBooking, setModifyingBooking] = useState<Booking | null>(null);

  // 1. DATA FILTERING
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const isHistory = b.status === BookingStatus.COMPLETED || b.status === BookingStatus.CANCELLED;
      const matchesSearch = b.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'active' ? !isHistory : isHistory;
      return matchesSearch && matchesTab;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [bookings, activeTab, searchQuery]);

  // 2. HANDLERS
  const handleWalkInSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newBooking: Booking = {
      id: `WALK-${Date.now()}`,
      businessId: 'b1', // Contextual
      unitId: formData.get('unitId') as string,
      guestId: 'u-walkin',
      checkIn: formData.get('checkIn') as string,
      checkOut: formData.get('checkOut') as string,
      totalPrice: Number(formData.get('price')),
      status: BookingStatus.CONFIRMED,
      createdAt: new Date().toISOString().split('T')[0],
      verifiedPayment: true,
      notes: 'Direct Walk-In'
    };
    onAddBooking(newBooking);
    setIsWalkInModalOpen(false);
    alert('Registry Success: Walk-in node authorized.');
  };

  const triggerModify = (bk: Booking) => {
    setModifyingBooking(bk);
  };

  return (
    <div className="space-y-10 animate-fade-up">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex bg-white p-1.5 rounded-[28px] border border-slate-100 shadow-sm gap-1">
          <button 
            onClick={() => setActiveTab('active')}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'active' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Live Protocol
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Archive Ledger
          </button>
        </div>

        <div className="flex gap-4">
          <div className="relative w-full md:w-80">
            <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
            <input 
              type="text" 
              placeholder="Search Thread ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-6 text-xs font-bold outline-none focus:ring-4 ring-indigo-50"
            />
          </div>
          <button 
            onClick={() => setIsWalkInModalOpen(true)}
            className="px-8 py-4 bg-slate-950 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all flex items-center gap-3"
          >
            <i className="fas fa-plus"></i> Walk-In Baru
          </button>
        </div>
      </div>

      {/* RESERVATION MATRIX */}
      <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest Node</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Allocation</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Temporal Node</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Protocol Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Operational Oversight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredBookings.map(bk => (
                <tr key={bk.id} className="hover:bg-slate-50/30 transition-all group">
                  <td className="px-10 py-8">
                    <p className="font-black text-slate-900 uppercase text-xs">#{bk.id}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Registry: {bk.createdAt}</p>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-sm font-black text-slate-700 uppercase">{units.find(u => u.id === bk.unitId)?.name}</p>
                    <p className="text-[9px] font-bold text-indigo-500 uppercase mt-1">Asset Verified</p>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-900 uppercase">{bk.checkIn}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Arrival</p>
                      </div>
                      <i className="fas fa-arrow-right text-slate-200 text-[10px]"></i>
                      <div>
                        <p className="text-[10px] font-black text-slate-900 uppercase">{bk.checkOut}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Exit</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                      bk.status === BookingStatus.CONFIRMED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      bk.status === BookingStatus.CHECKED_IN ? 'bg-indigo-50 text-indigo-600 border-indigo-100 animate-pulse' :
                      bk.status === BookingStatus.PENDING ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-slate-50 text-slate-400 border-slate-100'
                    }`}>{bk.status}</span>
                  </td>
                  <td className="px-10 py-8 text-right space-x-2">
                    {bk.status === BookingStatus.PENDING && (
                      <button onClick={() => onUpdateStatus(bk.id, BookingStatus.CONFIRMED)} className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-emerald-700 transition-all">Confirm</button>
                    )}
                    {bk.status === BookingStatus.CONFIRMED && (
                      <button onClick={() => onUpdateStatus(bk.id, BookingStatus.CHECKED_IN)} className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all">Check-In</button>
                    )}
                    {bk.status === BookingStatus.CHECKED_IN && (
                      <button onClick={() => onUpdateStatus(bk.id, BookingStatus.COMPLETED)} className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-black transition-all">Authorize Out</button>
                    )}
                    {activeTab === 'active' && (
                      <button onClick={() => triggerModify(bk)} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm"><i className="fas fa-calendar-pen text-xs"></i></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* WALK-IN MODAL */}
      {isWalkInModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[56px] shadow-2xl p-16 space-y-12 relative overflow-hidden">
            <button onClick={() => setIsWalkInModalOpen(false)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all z-10"><i className="fas fa-times"></i></button>
            <div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-3 italic">Walk-In Registry</h3>
              <p className="text-slate-400 text-sm font-medium">Bypass digital node for immediate on-site registration.</p>
            </div>
            <form onSubmit={handleWalkInSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Unit Node</label>
                <select name="unitId" required className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-5 font-bold text-slate-900 outline-none focus:ring-4 ring-indigo-50 transition-all">
                   {units.filter(u => u.available).map(u => <option key={u.id} value={u.id}>{u.name} (Rp {u.price.toLocaleString()})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Check-In Date</label>
                  <input type="date" name="checkIn" required className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-5 font-bold outline-none" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Check-Out Date</label>
                  <input type="date" name="checkOut" required className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-5 font-bold outline-none" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Daily Settlement Price (Rp)</label>
                <input name="price" type="number" required className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-5 font-bold outline-none" />
              </div>
              <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-4">
                <i className="fas fa-shield-check"></i> Authorize Walk-In
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODIFY DATE MODAL */}
      {modifyingBooking && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[56px] shadow-2xl p-16 space-y-12 relative overflow-hidden">
            <button onClick={() => setModifyingBooking(null)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all z-10"><i className="fas fa-times"></i></button>
            <div className="text-center">
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">Modify temporal Node</h3>
              <p className="text-slate-400 text-sm font-medium">Changing dates for booking #{modifyingBooking.id}</p>
            </div>
            
            <div className="p-8 bg-amber-50 rounded-[40px] border border-amber-100 flex items-start gap-5">
               <i className="fas fa-shield-halved text-amber-600 mt-1"></i>
               <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase">Attention: Date modifications require physical ID verification and may trigger economic re-calculation in the treasury hub.</p>
            </div>

            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-slate-400 uppercase ml-1">New Arrival</label>
                     <input type="date" defaultValue={modifyingBooking.checkIn} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-700" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-slate-400 uppercase ml-1">New Departure</label>
                     <input type="date" defaultValue={modifyingBooking.checkOut} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-700" />
                  </div>
               </div>
               <button 
                 onClick={() => { onModifyDates(modifyingBooking.id, '', ''); setModifyingBooking(null); }}
                 className="w-full py-5 bg-slate-950 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all"
               >
                  Authorize Modification
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
