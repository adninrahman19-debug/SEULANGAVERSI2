
import React, { useState, useMemo } from 'react';
import { Booking, BookingStatus, Unit, UnitStatus } from '../../types';

interface CheckInOutManagementProps {
  bookings: Booking[];
  units: Unit[];
  onCheckIn: (bookingId: string, guestData: any) => void;
  onCheckOut: (bookingId: string, damageNotes: string) => void;
}

export const CheckInOutManagement: React.FC<CheckInOutManagementProps> = ({ 
  bookings, units, onCheckIn, onCheckOut 
}) => {
  const TODAY = '2024-12-28';
  const [activeTab, setActiveTab] = useState<'arrivals' | 'departures'>('arrivals');
  const [processingBooking, setProcessingBooking] = useState<Booking | null>(null);
  const [damageNote, setDamageNote] = useState('');

  // 1. DATA FILTERING
  const list = useMemo(() => {
    if (activeTab === 'arrivals') {
      return bookings.filter(b => b.checkIn === TODAY && b.status === BookingStatus.CONFIRMED);
    }
    return bookings.filter(b => b.checkOut === TODAY && b.status === BookingStatus.CHECKED_IN);
  }, [bookings, activeTab]);

  // 2. HANDLERS
  const handleCheckInSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!processingBooking) return;
    const formData = new FormData(e.currentTarget);
    const guestData = {
      idNumber: formData.get('idNumber'),
      phone: formData.get('phone'),
      email: formData.get('email'),
    };
    onCheckIn(processingBooking.id, guestData);
    setProcessingBooking(null);
  };

  const handleCheckOutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!processingBooking) return;
    onCheckOut(processingBooking.id, damageNote);
    setProcessingBooking(null);
    setDamageNote('');
  };

  return (
    <div className="space-y-10 animate-fade-up">
      {/* 1. SELECTION HUB */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Desk Protocol Hub</h2>
           <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-2">Sinkronisasi fisik tamu dengan aset node digital.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-[28px] border border-slate-100 shadow-sm gap-1">
          <button 
            onClick={() => setActiveTab('arrivals')}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'arrivals' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Arrivals ({bookings.filter(b => b.checkIn === TODAY && b.status === BookingStatus.CONFIRMED).length})
          </button>
          <button 
            onClick={() => setActiveTab('departures')}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'departures' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Departures ({bookings.filter(b => b.checkOut === TODAY && b.status === BookingStatus.CHECKED_IN).length})
          </button>
        </div>
      </div>

      {/* 2. QUEUE LIST */}
      <div className="grid grid-cols-1 gap-6">
        {list.map(bk => {
          const unit = units.find(u => u.id === bk.unitId);
          return (
            <div key={bk.id} className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-10 group hover:shadow-2xl transition-all duration-500">
               <div className="flex items-center gap-10 flex-1">
                  <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center text-3xl shadow-inner ${
                    activeTab === 'arrivals' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                     <i className={`fas ${activeTab === 'arrivals' ? 'fa-plane-arrival' : 'fa-plane-departure'}`}></i>
                  </div>
                  <div className="space-y-2">
                     <div className="flex items-center gap-4">
                        <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight">#{bk.id}</h4>
                        <span className="px-4 py-1 bg-slate-50 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-100">{unit?.name}</span>
                     </div>
                     <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Guest node: G-IDENTITY-{bk.guestId.substring(0,8).toUpperCase()}</p>
                  </div>
               </div>
               <div className="flex items-center gap-12">
                  <div className="text-right">
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Status Settlement</p>
                     <p className={`font-black uppercase text-sm ${bk.verifiedPayment ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {bk.verifiedPayment ? 'Settled' : 'Unpaid Entry'}
                     </p>
                  </div>
                  <button 
                    onClick={() => setProcessingBooking(bk)}
                    className={`px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl transition-all ${
                      activeTab === 'arrivals' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-950 text-white hover:bg-black'
                    }`}
                  >
                    {activeTab === 'arrivals' ? 'Process Check-In' : 'Finalize Out'}
                  </button>
               </div>
            </div>
          );
        })}
        {list.length === 0 && (
          <div className="py-32 text-center bg-white rounded-[56px] border border-dashed border-slate-200">
             <i className="fas fa-clipboard-check text-slate-100 text-7xl mb-8"></i>
             <p className="text-slate-300 font-black uppercase text-xs tracking-widest italic">All nodes synchronized for today's {activeTab}.</p>
          </div>
        )}
      </div>

      {/* 3. MODAL: CHECK-IN / CHECK-OUT PROTOCOL */}
      {processingBooking && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[64px] shadow-2xl p-16 space-y-12 relative overflow-hidden">
            <button onClick={() => setProcessingBooking(null)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all z-10"><i className="fas fa-times"></i></button>
            
            <div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">
                {activeTab === 'arrivals' ? 'Registry Protocol' : 'Depature Protocol'}
              </h3>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-widest italic">Verifying Node #{processingBooking.id}</p>
            </div>

            {activeTab === 'arrivals' ? (
              <form onSubmit={handleCheckInSubmit} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Card (KTP/Passport)</label>
                  <input name="idNumber" required placeholder="Input physical document ID..." className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-5 font-bold outline-none focus:ring-4 ring-indigo-50" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Contact</label>
                      <input name="phone" required type="tel" className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-5 font-bold outline-none" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Node</label>
                      <input name="email" required type="email" className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-5 font-bold outline-none" />
                   </div>
                </div>
                <div className="p-8 bg-indigo-50 rounded-[40px] border border-indigo-100 flex items-center gap-4">
                   <i className="fas fa-shield-halved text-indigo-600"></i>
                   <p className="text-[10px] font-bold text-indigo-900 leading-relaxed uppercase tracking-tight">Dengan memproses ini, Anda mengonfirmasi bahwa identitas fisik tamu telah divalidasi sesuai SOP.</p>
                </div>
                <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-700 transition-all">Authorize Inbound</button>
              </form>
            ) : (
              <form onSubmit={handleCheckOutSubmit} className="space-y-8">
                <div className="p-10 bg-slate-50 rounded-[48px] border border-slate-100 space-y-6">
                   <div className="flex justify-between items-center text-xs font-black uppercase text-slate-500">
                      <span>Total Cycle Settlement</span>
                      <span className="text-slate-900">Rp {processingBooking.totalPrice.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-center text-xs font-black uppercase text-slate-500">
                      <span>Payment Status</span>
                      <span className="text-emerald-600">CLEARED</span>
                   </div>
                   <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
                      <button type="button" onClick={() => alert('Invoice generated and dispatched.')} className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase text-indigo-600 hover:bg-indigo-50 transition-all">Send Invoice Email</button>
                      <button type="button" onClick={() => window.print()} className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase text-indigo-600 hover:bg-indigo-50 transition-all">Print Invoice</button>
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Integrity Check (Damage Notes)</label>
                   <textarea 
                    value={damageNote}
                    onChange={(e) => setDamageNote(e.target.value)}
                    placeholder="Report any asset damage or lost items..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-[32px] p-8 font-bold text-slate-700 outline-none resize-none h-32 focus:ring-4 ring-rose-50"
                   />
                </div>
                <button type="submit" className="w-full py-6 bg-slate-950 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-rose-600 transition-all">Authorize Outbound & Mark Dirty</button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
