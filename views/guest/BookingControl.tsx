
import React, { useState } from 'react';
import { Booking, BookingStatus, Unit, Business } from '../../types';
import { MOCK_BUSINESSES, MOCK_UNITS } from '../../constants';

interface BookingControlProps {
  bookings: Booking[];
  language: 'id' | 'en';
}

export const BookingControl: React.FC<BookingControlProps> = ({ bookings, language }) => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(bookings[0] || null);

  const d = {
    id: {
      title: 'Matrix Reservasi Saya',
      sub: 'Kelola akses unit, check-in digital, dan riwayat sirkulasi.',
      active_node: 'Node Aktif',
      qr_desc: 'Tunjukkan kode ini pada scanner di lokasi untuk otorisasi akses.',
      btn_receipt: 'Unduh Invoice',
      btn_direction: 'Navigasi Ke Lokasi',
      policy: 'Protokol Kebijakan',
      checkin_time: 'Jadwal Masuk',
      checkout_time: 'Jadwal Keluar'
    },
    en: {
      title: 'My Reservation Matrix',
      sub: 'Manage unit access, digital check-in, and circulation history.',
      active_node: 'Active Node',
      qr_desc: 'Present this code to the on-site scanner for access authorization.',
      btn_receipt: 'Download Receipt',
      btn_direction: 'Navigate to Node',
      policy: 'Policy Protocol',
      checkin_time: 'Arrival Schedule',
      checkout_time: 'Departure Schedule'
    }
  }[language];

  const getBiz = (id: string) => MOCK_BUSINESSES.find(b => b.id === id);
  const getUnit = (id: string) => MOCK_UNITS.find(u => u.id === id);

  return (
    <div className="space-y-10 animate-fade-up">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
        <div>
           <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">{d.title}</h2>
           <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-2">{d.sub}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* LEFT: RESERVATION SELECTOR */}
        <div className="lg:col-span-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide">
           {bookings.map(bk => {
             const biz = getBiz(bk.businessId);
             const isActive = selectedBooking?.id === bk.id;
             return (
               <button
                 key={bk.id}
                 onClick={() => setSelectedBooking(bk)}
                 className={`w-full p-8 rounded-[40px] border text-left transition-all relative overflow-hidden group ${
                   isActive ? 'bg-indigo-600 border-indigo-500 text-white shadow-2xl scale-[1.02]' : 'bg-white border-slate-100 hover:border-indigo-200'
                 }`}
               >
                  {isActive && <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>}
                  <div className="relative z-10 space-y-4">
                     <div className="flex justify-between items-center">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isActive ? 'bg-white/20' : 'bg-slate-100 text-slate-400'}`}>{bk.status}</span>
                        <p className={`text-[10px] font-black ${isActive ? 'text-indigo-200' : 'text-slate-300'}`}>ID: {bk.id}</p>
                     </div>
                     <h4 className="text-xl font-black uppercase tracking-tight leading-none truncate">{biz?.name}</h4>
                     <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                           <span className={`text-[8px] font-black uppercase ${isActive ? 'text-indigo-200' : 'text-slate-300'}`}>Check-In</span>
                           <span className="text-xs font-black">{bk.checkIn}</span>
                        </div>
                        <i className={`fas fa-arrow-right-long text-[10px] ${isActive ? 'text-indigo-300' : 'text-slate-200'}`}></i>
                        <div className="flex flex-col">
                           <span className={`text-[8px] font-black uppercase ${isActive ? 'text-indigo-200' : 'text-slate-300'}`}>Check-Out</span>
                           <span className="text-xs font-black">{bk.checkOut}</span>
                        </div>
                     </div>
                  </div>
               </button>
             );
           })}
        </div>

        {/* RIGHT: INTERACTIVE CONTROL HUB */}
        <div className="lg:col-span-8">
           {selectedBooking ? (
             <div className="bg-white rounded-[56px] border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                {/* Visual Identity Section */}
                <div className="md:w-1/2 p-12 bg-slate-950 text-white flex flex-col justify-between relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-cover bg-center grayscale" style={{backgroundImage: `url(${getBiz(selectedBooking.businessId)?.images[0]})`}}></div>
                   <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/90 to-slate-950"></div>
                   
                   <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-10">
                         <div className="w-12 h-12 bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center text-indigo-400 shadow-inner">
                            <i className="fas fa-ticket-simple"></i>
                         </div>
                         <div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter">{getUnit(selectedBooking.unitId)?.name}</h3>
                            <p className="text-indigo-400 text-[9px] font-black uppercase tracking-[0.3em]">{getBiz(selectedBooking.businessId)?.name}</p>
                         </div>
                      </div>

                      <div className="space-y-12 py-10">
                         <div className="flex justify-center">
                            <div className="p-8 bg-white rounded-[48px] shadow-[0_0_50px_rgba(99,102,241,0.3)] group cursor-pointer hover:scale-105 transition-transform duration-500">
                               <i className="fas fa-qrcode text-8xl text-slate-900 group-hover:opacity-80 transition-opacity"></i>
                               <div className="mt-6 flex flex-col items-center gap-2">
                                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active Node Signal</span>
                               </div>
                            </div>
                         </div>
                         <p className="text-center text-indigo-200/40 text-[10px] font-medium leading-relaxed max-w-xs mx-auto italic">"{d.qr_desc}"</p>
                      </div>
                   </div>

                   <div className="relative z-10 pt-10 border-t border-white/5 grid grid-cols-2 gap-8">
                      <div>
                         <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">{d.checkin_time}</p>
                         <p className="text-xl font-black uppercase leading-none">14:00 <span className="text-[10px] opacity-40 italic">WIB</span></p>
                      </div>
                      <div className="text-right">
                         <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">{d.checkout_time}</p>
                         <p className="text-xl font-black uppercase leading-none">12:00 <span className="text-[10px] opacity-40 italic">WIB</span></p>
                      </div>
                   </div>
                </div>

                {/* Operations Section */}
                <div className="flex-1 p-12 space-y-12 overflow-y-auto scrollbar-hide">
                   <div className="space-y-6">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-4">{d.policy}</h4>
                      <div className="space-y-6">
                         {[
                           { label: 'Cancelation', value: 'Flexible • Refund 100% within 48h', icon: 'fa-calendar-xmark' },
                           { label: 'Security', value: 'Government ID Required at Node Arrival', icon: 'fa-id-card' },
                           { label: 'Amenities', value: 'Fiber WiFi, Smart TV, King Bed Node', icon: 'fa-cubes' }
                         ].map((p, i) => (
                           <div key={i} className="flex gap-4 items-start">
                              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 text-xs shrink-0">
                                 <i className={`fas ${p.icon}`}></i>
                              </div>
                              <div>
                                 <p className="text-[10px] font-black text-slate-900 uppercase leading-none mb-1">{p.label}</p>
                                 <p className="text-xs text-slate-500 font-medium leading-relaxed">{p.value}</p>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-6 pt-6 border-t border-slate-50">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Financial Summary</h4>
                      <div className="p-8 bg-indigo-50 rounded-[40px] border border-indigo-100 flex justify-between items-center">
                         <div>
                            <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Settlement Total</p>
                            <p className="text-2xl font-black text-indigo-900 tracking-tighter">Rp {selectedBooking.totalPrice.toLocaleString()}</p>
                         </div>
                         <div className="text-right">
                            <span className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[8px] font-black uppercase shadow-lg shadow-emerald-200">Settled</span>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                      <button className="py-5 bg-slate-950 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl flex items-center justify-center gap-3">
                         <i className="fas fa-file-invoice-dollar"></i> {d.btn_receipt}
                      </button>
                      <button className="py-5 bg-white border border-slate-200 text-slate-900 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                         <i className="fas fa-map-location-dot"></i> {d.btn_direction}
                      </button>
                   </div>
                </div>
             </div>
           ) : (
             <div className="bg-white rounded-[56px] border border-slate-100 h-full min-h-[600px] flex flex-col items-center justify-center text-center p-20 space-y-8">
                <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-[40px] flex items-center justify-center text-5xl shadow-inner border border-white">
                   <i className="fas fa-ticket"></i>
                </div>
                <div>
                   <h3 className="text-2xl font-black text-slate-900 uppercase">Registry Empty</h3>
                   <p className="text-slate-400 font-medium max-w-xs mx-auto mt-2 leading-relaxed">Anda tidak memiliki reservasi aktif dalam klaster Seulanga saat ini.</p>
                </div>
             </div>
           )}
        </div>
      </div>

      <div className="p-10 bg-slate-900 rounded-[48px] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[80px]"></div>
         <div className="flex items-center gap-8 relative z-10">
            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-2xl text-indigo-400 border border-white/10 shadow-inner">
               <i className="fas fa-shield-heart"></i>
            </div>
            <div>
               <h3 className="text-xl font-black tracking-tighter uppercase mb-1">Seulanga Traveler Guard</h3>
               <p className="text-indigo-200/40 text-[10px] font-bold uppercase tracking-widest leading-relaxed">Setiap reservasi dilindungi oleh protokol keamanan finansial dan asuransi pihak ketiga.</p>
            </div>
         </div>
         <button className="relative z-10 px-8 py-4 bg-white text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-400 hover:text-white transition-all shadow-xl whitespace-nowrap">
            View Protocol Details
         </button>
      </div>
    </div>
  );
};
