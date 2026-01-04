
import React, { useState, useMemo } from 'react';
import { Booking, BookingStatus, Unit, Business, User } from '../../types';
import { MOCK_BUSINESSES, MOCK_UNITS, MOCK_BOOKINGS } from '../../constants';

interface BookingProtocolProps {
  currentUser: User;
  language: 'id' | 'en';
}

export const BookingProtocol: React.FC<BookingProtocolProps> = ({ currentUser, language }) => {
  const [activeBookings, setActiveBookings] = useState<Booking[]>(
    MOCK_BOOKINGS.filter(b => b.guestId === currentUser.id)
  );
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(activeBookings[0]?.id || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const selectedBooking = useMemo(() => 
    activeBookings.find(b => b.id === selectedBookingId), 
  [activeBookings, selectedBookingId]);

  const business = useMemo(() => 
    MOCK_BUSINESSES.find(b => b.id === selectedBooking?.businessId), 
  [selectedBooking]);

  const unit = useMemo(() => 
    MOCK_UNITS.find(u => u.id === selectedBooking?.unitId), 
  [selectedBooking]);

  const handleUploadProof = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setIsUploading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsUploading(false);
          setActiveBookings(prev => prev.map(b => 
            b.id === selectedBookingId ? { ...b, status: BookingStatus.CONFIRMED, verifiedPayment: true } : b
          ));
          alert('Evidence Synchronized: Bukti pembayaran telah diterima oleh node treasury.');
        }, 500);
      }
    }, 300);
  };

  const d = {
    id: {
      title: 'Protokol Reservasi',
      sub: 'Kelola siklus hidup transaksi dan otorisasi akses unit.',
      status_label: 'Status Transmisi',
      unit_info: 'Informasi Node Unit',
      price_info: 'Estimasi Payload Ekonomi',
      upload_title: 'Unggah Bukti Bayar',
      upload_sub: 'Kirim bukti transfer ke treasury hub untuk verifikasi manual.',
      timeline: 'Timeline Aktivitas',
      total_pay: 'Total Settlement'
    },
    en: {
      title: 'Reservation Protocol',
      sub: 'Manage transaction lifecycles and unit access authorization.',
      status_label: 'Transmission Status',
      unit_info: 'Unit Node Information',
      price_info: 'Economic Payload Estimation',
      upload_title: 'Upload Payment Shard',
      upload_sub: 'Send transfer proof to treasury hub for manual verification.',
      timeline: 'Activity Timeline',
      total_pay: 'Settlement Total'
    }
  }[language];

  const getStatusStep = (status: BookingStatus) => {
    switch(status) {
      case BookingStatus.PENDING: return 1;
      case BookingStatus.CONFIRMED: return 2;
      case BookingStatus.CHECKED_IN: return 3;
      case BookingStatus.COMPLETED: return 4;
      default: return 1;
    }
  };

  return (
    <div className="space-y-12 animate-fade-up">
      {/* 1. SELECTION & STATUS OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT: RESERVATION THREADS */}
        <div className="lg:col-span-4 space-y-6">
           <div className="px-2">
              <h3 className="text-xl font-black text-slate-900 uppercase italic">Active Threads</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daftar transaksi yang sedang berjalan.</p>
           </div>
           <div className="space-y-3">
              {activeBookings.map(bk => {
                const biz = MOCK_BUSINESSES.find(b => b.id === bk.businessId);
                return (
                  <button
                    key={bk.id}
                    onClick={() => setSelectedBookingId(bk.id)}
                    className={`w-full p-6 rounded-[32px] border text-left transition-all group relative overflow-hidden ${
                      selectedBookingId === bk.id ? 'bg-slate-950 border-slate-900 text-white shadow-2xl scale-[1.02]' : 'bg-white border-slate-100 hover:border-indigo-200'
                    }`}
                  >
                     <div className="relative z-10 flex justify-between items-start">
                        <div>
                           <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${selectedBookingId === bk.id ? 'text-indigo-400' : 'text-slate-300'}`}>Node Registry: {bk.id}</p>
                           <h4 className="font-black text-sm uppercase truncate">{biz?.name}</h4>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          bk.status === BookingStatus.PENDING ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                        }`}>{bk.status}</span>
                     </div>
                  </button>
                );
              })}
           </div>
        </div>

        {/* RIGHT: DETAILED INTERFACE */}
        <div className="lg:col-span-8">
           {selectedBooking ? (
              <div className="bg-white rounded-[56px] border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[650px]">
                 {/* Visual Summary Side */}
                 <div className="md:w-5/12 bg-slate-950 p-10 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                    <div className="relative z-10">
                       <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-8 border border-white/5 shadow-inner">
                          <i className="fas fa-file-invoice-dollar text-xl"></i>
                       </div>
                       <h3 className="text-3xl font-black uppercase tracking-tighter mb-2 italic">Summary Node</h3>
                       <p className="text-indigo-200/40 text-[9px] font-black uppercase tracking-[0.3em] mb-10">Verified Transaction Shard</p>
                       
                       <div className="space-y-8">
                          <div className="space-y-1">
                             <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">{d.unit_info}</p>
                             <p className="text-lg font-black uppercase">{unit?.name}</p>
                             <p className="text-[10px] font-medium text-white/40">{business?.name}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Schedule Matrix</p>
                             <p className="text-sm font-black uppercase">{selectedBooking.checkIn} — {selectedBooking.checkOut}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Node ID Registry</p>
                             <p className="text-xs font-mono text-white/30 uppercase tracking-tighter">HASH_SYNC_{selectedBooking.id.toUpperCase()}</p>
                          </div>
                       </div>
                    </div>

                    <div className="relative z-10 pt-10 border-t border-white/5">
                       <p className="text-[8px] font-black text-indigo-300 uppercase tracking-widest mb-2">{d.total_pay}</p>
                       <p className="text-4xl font-black text-emerald-400 tracking-tighter">Rp {selectedBooking.totalPrice.toLocaleString()}</p>
                    </div>
                 </div>

                 {/* Action & Status Side */}
                 <div className="flex-1 p-10 space-y-10 overflow-y-auto scrollbar-hide bg-white">
                    {/* Status Progress Bar */}
                    <div className="space-y-6">
                       <div className="flex justify-between items-center px-2">
                          <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">{d.status_label}</h4>
                          <span className="text-[10px] font-black text-indigo-600 uppercase italic">Stage {getStatusStep(selectedBooking.status)} of 4</span>
                       </div>
                       <div className="relative pt-4 px-2">
                          <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden flex">
                             <div className={`h-full bg-indigo-600 transition-all duration-1000 shadow-[0_0_10px_#6366f1]`} style={{ width: `${(getStatusStep(selectedBooking.status) / 4) * 100}%` }}></div>
                          </div>
                          <div className="flex justify-between mt-4">
                             {['Pending', 'Confirmed', 'Checked', 'Done'].map((st, i) => (
                                <div key={st} className="flex flex-col items-center gap-1">
                                   <div className={`w-2 h-2 rounded-full ${getStatusStep(selectedBooking.status) >= i + 1 ? 'bg-indigo-600' : 'bg-slate-100'}`}></div>
                                   <span className={`text-[8px] font-black uppercase ${getStatusStep(selectedBooking.status) >= i + 1 ? 'text-indigo-600' : 'text-slate-300'}`}>{st}</span>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>

                    {/* Dynamic Action Area */}
                    {selectedBooking.status === BookingStatus.PENDING ? (
                      <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[40px] space-y-8 animate-in slide-in-from-bottom-4">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-sm shadow-lg">
                               <i className="fas fa-cloud-arrow-up"></i>
                            </div>
                            <div>
                               <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{d.upload_title}</h4>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Identity Auth Required</p>
                            </div>
                         </div>
                         
                         <label className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-indigo-200 rounded-[32px] cursor-pointer hover:bg-white transition-all group overflow-hidden">
                            {isUploading ? (
                              <div className="flex flex-col items-center gap-4">
                                 <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                                 <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Syncing Data {uploadProgress}%</p>
                              </div>
                            ) : (
                              <>
                                <i className="fas fa-file-invoice text-3xl text-indigo-300 mb-4 group-hover:scale-110 transition-transform"></i>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center px-10">Seret Bukti Bayar atau <span className="text-indigo-600 underline">Klik untuk Telusuri</span></p>
                                <input type="file" className="hidden" onChange={handleUploadProof} accept="image/*,application/pdf" />
                              </>
                            )}
                         </label>
                         
                         <div className="p-5 bg-white/60 rounded-2xl border border-indigo-100/50 space-y-2">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Treasury Endpoint</p>
                            <p className="text-[10px] font-bold text-slate-700">Bank SEULANGA HUB • ACC: 8821 000 2299</p>
                         </div>
                      </div>
                    ) : (
                      <div className="space-y-8 animate-in fade-in duration-500">
                         <div className="p-8 bg-slate-50 border border-slate-100 rounded-[40px] space-y-6">
                            <div className="flex items-center gap-4 text-emerald-600">
                               <i className="fas fa-check-circle text-xl"></i>
                               <h4 className="text-xs font-black uppercase tracking-widest">Siklus Pembayaran Selesai</h4>
                            </div>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed italic">"Payload ekonomi Anda telah divalidasi oleh treasury platform. Silakan tunjukkan QR pada tab 'Matrix' saat kedatangan untuk serah terima kunci akses."</p>
                            <button className="w-full py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-slate-950 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2">
                               <i className="fas fa-download"></i> Unduh Receipt Node
                            </button>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Security Key</p>
                               <div className="flex items-center gap-2">
                                  <i className="fas fa-lock text-indigo-400 text-xs"></i>
                                  <span className="text-xs font-mono font-bold text-slate-900">•••• •••• ••••</span>
                               </div>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Access Protocol</p>
                               <div className="flex items-center gap-2 text-emerald-600">
                                  <i className="fas fa-signal text-xs"></i>
                                  <span className="text-[10px] font-black uppercase">Ready for Check-In</span>
                               </div>
                            </div>
                         </div>
                      </div>
                    )}

                    {/* Timeline History */}
                    <div className="space-y-6 pt-6 border-t border-slate-50">
                       <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{d.timeline}</h4>
                       <div className="space-y-6">
                          {[
                            { title: 'Identity Verification Dispatched', date: '28 Dec, 10:20', icon: 'fa-fingerprint', color: 'text-indigo-400' },
                            { title: 'Reservation Thread Created', date: '28 Dec, 10:15', icon: 'fa-plus-circle', color: 'text-indigo-400' }
                          ].map((log, i) => (
                            <div key={i} className="flex gap-6 items-start relative group">
                               <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-xs text-slate-400 shrink-0 border border-slate-100">
                                  <i className={`fas ${log.icon}`}></i>
                               </div>
                               <div>
                                  <p className="text-[10px] font-black text-slate-900 uppercase leading-none mb-1">{log.title}</p>
                                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{log.date}</p>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
           ) : (
              <div className="bg-white rounded-[56px] border border-slate-100 h-full min-h-[600px] flex flex-col items-center justify-center text-center p-20 space-y-8">
                 <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-[40px] flex items-center justify-center text-5xl shadow-inner border border-white">
                    <i className="fas fa-layer-group"></i>
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase">Registry Offline</h3>
                    <p className="text-slate-400 font-medium max-w-xs mx-auto mt-2 leading-relaxed">Pilih thread reservasi dari daftar di sebelah kiri untuk memproses transaksi atau monitoring status.</p>
                 </div>
              </div>
           )}
        </div>
      </div>

      {/* FOOTER INFO */}
      <div className="p-10 bg-slate-50 rounded-[48px] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-bl-[100px]"></div>
         <div className="flex items-center gap-6 relative z-10">
            <i className="fas fa-shield-check text-indigo-400 text-2xl"></i>
            <div>
               <p className="text-sm font-black text-slate-900 uppercase italic">Seulanga Secure Transaction Engine</p>
               <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">Seluruh data transaksi dienkripsi dan dipantau oleh otoritas platform 24/7.</p>
            </div>
         </div>
         <button className="px-10 py-4 bg-white border border-slate-200 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm">Bantuan Teknis</button>
      </div>
    </div>
  );
};
