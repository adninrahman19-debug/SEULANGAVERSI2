
import React, { useState, useMemo } from 'react';
import { Booking, BookingStatus, Unit, Business, Review } from '../../types';
import { MOCK_BOOKINGS, MOCK_BUSINESSES, MOCK_UNITS, MOCK_REVIEWS } from '../../constants';

interface BookingHistoryProps {
  currentUser: { id: string };
  language: 'id' | 'en';
}

export const BookingHistory: React.FC<BookingHistoryProps> = ({ currentUser, language }) => {
  const [activeSubTab, setActiveSubTab] = useState<'active' | 'history'>('active');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  // Review State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // 1. DATA FILTERING
  const userBookings = useMemo(() => {
    return MOCK_BOOKINGS.filter(b => b.guestId === currentUser.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [currentUser.id]);

  const filteredList = useMemo(() => {
    return userBookings.filter(b => {
      const isPast = b.status === BookingStatus.COMPLETED || b.status === BookingStatus.CANCELLED;
      return activeSubTab === 'active' ? !isPast : isPast;
    });
  }, [userBookings, activeSubTab]);

  const getBiz = (id: string) => MOCK_BUSINESSES.find(b => b.id === id);
  const getUnit = (id: string) => MOCK_UNITS.find(u => u.id === id);

  const handleCancelRequest = () => {
    alert('Cancellation Request Dispatched: Tim treasury akan memproses pengembalian dana sesuai kebijakan pembatalan unit.');
    setIsCancelModalOpen(false);
    setSelectedBooking(null);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Reputation Node Synced: Terima kasih atas ulasan ${rating} bintang Anda.`);
    setIsReviewModalOpen(false);
    setComment('');
  };

  const d = {
    id: {
      title: 'Kontrol Reservasi',
      sub: 'Manajemen akses unit, pembatalan, dan ulasan kepuasan.',
      tab_active: 'Aktif & Mendatang',
      tab_history: 'Arsip & Riwayat',
      btn_detail: 'Detail Transaksi',
      btn_cancel: 'Ajukan Pembatalan',
      btn_review: 'Tulis Ulasan',
      status_label: 'Status Protokol',
      empty: 'Tidak ada thread reservasi ditemukan.'
    },
    en: {
      title: 'Reservation Control',
      sub: 'Unit access management, cancellations, and satisfaction reviews.',
      tab_active: 'Active & Upcoming',
      tab_history: 'Archive & History',
      btn_detail: 'Transaction Detail',
      btn_cancel: 'Request Cancel',
      btn_review: 'Write Review',
      status_label: 'Protocol Status',
      empty: 'No reservation threads found.'
    }
  }[language];

  return (
    <div className="space-y-12 animate-fade-up">
      {/* 1. HEADER & TAB NAV */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
           <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">{d.title}</h2>
           <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-2">{d.sub}</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-[32px] border border-slate-100 shadow-sm">
           <button 
            onClick={() => setActiveSubTab('active')}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'active' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
           >
              {d.tab_active}
           </button>
           <button 
            onClick={() => setActiveSubTab('history')}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'history' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
           >
              {d.tab_history}
           </button>
        </div>
      </div>

      {/* 2. BOOKING GRID */}
      <div className="grid grid-cols-1 gap-8">
        {filteredList.map(bk => {
          const biz = getBiz(bk.businessId);
          const unit = getUnit(bk.unitId);
          return (
            <div key={bk.id} className="bg-white rounded-[56px] border border-slate-100 shadow-sm overflow-hidden flex flex-col lg:flex-row group hover:shadow-2xl transition-all duration-700">
               {/* Visual Part */}
               <div className="lg:w-1/3 h-64 lg:h-auto relative overflow-hidden">
                  <img src={biz?.images[0]} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-8 left-8 right-8">
                     <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-3 inline-block">{biz?.category}</span>
                     <h3 className="text-2xl font-black text-white uppercase tracking-tight truncate">{biz?.name}</h3>
                  </div>
               </div>

               {/* Content Part */}
               <div className="flex-1 p-10 lg:p-12 flex flex-col justify-between space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{d.status_label}</p>
                        <div className="flex items-center gap-3">
                           <div className={`w-2 h-2 rounded-full ${
                             bk.status === BookingStatus.CONFIRMED ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 
                             bk.status === BookingStatus.CHECKED_IN ? 'bg-indigo-500 animate-pulse' : 
                             'bg-slate-300'
                           }`}></div>
                           <span className="text-sm font-black text-slate-900 uppercase tracking-tighter">{bk.status}</span>
                        </div>
                        <p className="text-[10px] font-bold text-indigo-600 mt-2 uppercase tracking-widest">Hash: #{bk.id}</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Unit Allocation</p>
                        <p className="text-sm font-black text-slate-700 uppercase leading-none">{unit?.name}</p>
                        <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-widest">{unit?.type} • {unit?.capacity} Pax</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Temporal Node</p>
                        <p className="text-sm font-black text-slate-700 uppercase leading-none">{bk.checkIn} — {bk.checkOut}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">2 Nights Stay Cycle</p>
                     </div>
                  </div>

                  <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-indigo-600 border border-slate-100 shadow-inner">
                           <i className="fas fa-file-invoice"></i>
                        </div>
                        <div>
                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Economic Value</p>
                           <p className="text-lg font-black text-slate-900 tracking-tighter">Rp {bk.totalPrice.toLocaleString()}</p>
                        </div>
                     </div>

                     <div className="flex gap-3 w-full md:w-auto">
                        <button 
                          onClick={() => setSelectedBooking(bk)}
                          className="flex-1 md:flex-none px-6 py-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                        >
                           {d.btn_detail}
                        </button>
                        
                        {activeSubTab === 'active' && bk.status !== BookingStatus.CHECKED_IN && (
                          <button 
                            onClick={() => { setSelectedBooking(bk); setIsCancelModalOpen(true); }}
                            className="flex-1 md:flex-none px-6 py-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                          >
                             {d.btn_cancel}
                          </button>
                        )}

                        {activeSubTab === 'history' && bk.status === BookingStatus.COMPLETED && (
                          <button 
                            onClick={() => { setSelectedBooking(bk); setIsReviewModalOpen(true); }}
                            className="flex-1 md:flex-none px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                          >
                             <i className="fas fa-star-half-stroke"></i> {d.btn_review}
                          </button>
                        )}
                     </div>
                  </div>
               </div>
            </div>
          );
        })}

        {filteredList.length === 0 && (
          <div className="py-40 text-center bg-white border border-dashed border-slate-200 rounded-[64px] space-y-8">
             <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-[40px] flex items-center justify-center mx-auto text-4xl shadow-inner border border-white">
                <i className="fas fa-layer-group"></i>
             </div>
             <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase">{d.empty}</h3>
                <p className="text-slate-400 font-medium max-w-xs mx-auto mt-2 leading-relaxed">Mulai eksplorasi marketplace untuk membuat reservasi pertama Anda.</p>
             </div>
          </div>
        )}
      </div>

      {/* 3. TRANSACTION DETAIL MODAL */}
      {selectedBooking && !isCancelModalOpen && !isReviewModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-2xl rounded-[64px] shadow-2xl p-16 relative overflow-hidden flex flex-col max-h-[90vh]">
              <button onClick={() => setSelectedBooking(null)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all z-10"><i className="fas fa-times"></i></button>
              
              <div className="absolute top-0 left-0 w-full h-4 bg-indigo-600"></div>

              <header className="mb-12">
                 <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-3">Transaction Blueprint</h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Temporal Node: {selectedBooking.createdAt}</p>
              </header>

              <main className="flex-1 overflow-y-auto space-y-10 scrollbar-hide">
                 <div className="p-10 bg-slate-50 rounded-[48px] border border-slate-100 space-y-8">
                    <div className="flex justify-between items-start">
                       <div>
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Entity Provider</p>
                          <h4 className="text-xl font-black text-slate-900 uppercase">{getBiz(selectedBooking.businessId)?.name}</h4>
                       </div>
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
                          <i className="fas fa-building text-indigo-600"></i>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                       <div>
                          <p className="text-[9px] font-black text-slate-300 uppercase mb-1">Stay Duration</p>
                          <p className="text-sm font-black text-slate-700 uppercase">{selectedBooking.checkIn} — {selectedBooking.checkOut}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[9px] font-black text-slate-300 uppercase mb-1">Unit Node</p>
                          <p className="text-sm font-black text-slate-700 uppercase">{getUnit(selectedBooking.unitId)?.name}</p>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="flex justify-between text-xs font-black uppercase text-slate-500 tracking-widest">
                       <span>Marketplace Rental Fee</span>
                       <span className="text-slate-900 font-black">Rp {selectedBooking.totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-black uppercase text-slate-500 tracking-widest">
                       <span>Platform Node Access</span>
                       <span className="text-slate-900 font-black">Rp 0</span>
                    </div>
                    <div className="pt-8 border-t border-slate-100 flex justify-between items-center">
                       <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Total Settlement</span>
                       <span className="text-4xl font-black text-indigo-600 tracking-tighter">Rp {selectedBooking.totalPrice.toLocaleString()}</span>
                    </div>
                 </div>

                 <div className="flex items-center gap-6 p-8 bg-indigo-50 rounded-[40px] border border-indigo-100">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-emerald-100">
                       <i className="fas fa-shield-check"></i>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Verification Status</p>
                       <p className="text-xs font-bold text-indigo-700 uppercase">Settlement Verified by Platform Treasury Node</p>
                    </div>
                 </div>
              </main>

              <button onClick={() => window.print()} className="mt-10 w-full py-6 bg-slate-950 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3">
                 <i className="fas fa-print"></i> Download Receipt PDF
              </button>
           </div>
        </div>
      )}

      {/* 4. CANCELLATION MODAL */}
      {isCancelModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in">
           <div className="bg-white w-full max-w-md rounded-[56px] shadow-2xl p-12 space-y-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-rose-500"></div>
              <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto text-3xl shadow-inner border border-rose-100">
                 <i className="fas fa-calendar-xmark"></i>
              </div>
              <div className="text-center">
                 <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-3">Cancel Node?</h3>
                 <p className="text-slate-500 font-medium text-sm leading-relaxed">Permintaan pembatalan untuk unit <strong>{getUnit(selectedBooking.unitId)?.name}</strong> akan diteruskan ke tim treasury.</p>
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alasan Pembatalan</label>
                 <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none">
                    <option>Perubahan rencana perjalanan</option>
                    <option>Menemukan node properti lain</option>
                    <option>Kendala darurat personal</option>
                    <option>Lainnya</option>
                 </select>
              </div>
              <div className="flex flex-col gap-3 pt-4">
                 <button onClick={handleCancelRequest} className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-rose-700 transition-all">Authorize Cancellation</button>
                 <button onClick={() => setIsCancelModalOpen(false)} className="w-full py-5 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:text-slate-600 transition-all">Abort Action</button>
              </div>
           </div>
        </div>
      )}

      {/* 5. REVIEW MODAL */}
      {isReviewModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in">
           <div className="bg-white w-full max-w-xl rounded-[64px] shadow-2xl p-16 space-y-12 relative overflow-hidden flex flex-col">
              <button onClick={() => setIsReviewModalOpen(false)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all z-10"><i className="fas fa-times"></i></button>
              
              <div className="text-center">
                 <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[28px] flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner border border-indigo-100">
                    <i className="fas fa-star-half-stroke"></i>
                 </div>
                 <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-3">Reputation Node</h3>
                 <p className="text-slate-500 font-medium">Bagikan pengalaman Anda menginap di <strong>{getBiz(selectedBooking.businessId)?.name}</strong>.</p>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-10">
                 <div className="flex justify-center gap-4">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${rating >= star ? 'bg-amber-400 text-white shadow-lg shadow-amber-200' : 'bg-slate-50 text-slate-300'}`}
                      >
                         <i className="fas fa-star"></i>
                      </button>
                    ))}
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ceritakan Pengalaman Anda</label>
                    <textarea 
                      required
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={5}
                      placeholder="Apa yang paling Anda sukai dari node properti ini?"
                      className="w-full bg-slate-50 border border-slate-200 rounded-[32px] p-8 font-bold text-slate-700 outline-none focus:ring-4 ring-indigo-50 transition-all resize-none shadow-inner"
                    />
                 </div>

                 <button type="submit" className="w-full py-6 bg-slate-950 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all">Publish Reputation Data</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
