
import React from 'react';
import { User, Booking, Business, BookingStatus } from '../../types';
import { MOCK_BUSINESSES, MOCK_BOOKINGS, MOCK_PROMOTIONS } from '../../constants';

interface GuestHomeProps {
  user: User;
  onNavigate: (view: string, subView?: string) => void;
  onSelectTab: (tab: string) => void;
}

export const GuestHome: React.FC<GuestHomeProps> = ({ user, onNavigate, onSelectTab }) => {
  const activeBookings = MOCK_BOOKINGS.filter(b => 
    b.guestId === user.id && 
    (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.CHECKED_IN)
  );

  const recommendations = MOCK_BUSINESSES.slice(0, 3);
  const activePromos = MOCK_PROMOTIONS.filter(p => p.isActive).slice(0, 2);

  return (
    <div className="space-y-12 animate-fade-up">
      {/* 1. HERO WELCOME & QUICK STATS */}
      <section className="bg-slate-950 rounded-[56px] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="text-center md:text-left space-y-6">
            <div className="inline-flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full border border-white/10">
               <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
               <span className="text-[10px] font-black uppercase tracking-widest italic">Guest Node Alpha Verified</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none uppercase italic">Hello, <br/> {user.name.split(' ')[0]}.</h2>
            <p className="text-indigo-200/60 font-medium max-w-sm leading-relaxed">Temukan dan kelola hunian idaman Anda di seluruh ekosistem Seulanga.</p>
          </div>
          <div className="flex gap-4">
             <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] text-center min-w-[140px] backdrop-blur-md">
                <p className="text-[10px] font-black text-indigo-400 uppercase mb-2">My Points</p>
                <p className="text-4xl font-black">1.2K</p>
             </div>
             <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] text-center min-w-[140px] backdrop-blur-md">
                <p className="text-[10px] font-black text-emerald-400 uppercase mb-2">Wishlist</p>
                <p className="text-4xl font-black">{user.wishlist?.length || 0}</p>
             </div>
          </div>
        </div>
      </section>

      {/* 2. LIVE BOOKING STATUS (If any) */}
      {activeBookings.length > 0 && (
        <section className="space-y-6">
           <div className="flex items-center justify-between px-4">
              <h3 className="text-xl font-black text-slate-900 uppercase italic">Reservasi Berjalan</h3>
              <button onClick={() => onSelectTab('bookings')} className="text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline">Kelola Semua</button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeBookings.map(bk => {
                const biz = MOCK_BUSINESSES.find(b => b.id === bk.businessId);
                return (
                  <div key={bk.id} className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all cursor-pointer">
                     <div className="flex items-center gap-6">
                        <img src={biz?.images[0]} className="w-20 h-20 rounded-3xl object-cover shadow-xl" />
                        <div>
                           <div className="flex items-center gap-3 mb-1">
                              <h4 className="font-black text-slate-900 uppercase text-sm">{biz?.name}</h4>
                              <span className="px-3 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-indigo-100">{bk.status}</span>
                           </div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bk.checkIn} — {bk.checkOut}</p>
                        </div>
                     </div>
                     <button onClick={() => onSelectTab('bookings')} className="w-12 h-12 bg-slate-950 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-600 transition-all shadow-lg group-hover:scale-110">
                        <i className="fas fa-key"></i>
                     </button>
                  </div>
                );
              })}
           </div>
        </section>
      )}

      {/* 3. PROMO STREAM & QUICK SEARCH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-xl font-black text-slate-900 uppercase italic">Rekomendasi Properti</h3>
               <button onClick={() => onNavigate('explore')} className="text-indigo-600 text-[10px] font-black uppercase tracking-widest">Eksplorasi Semua →</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {recommendations.map(biz => (
                  <div key={biz.id} onClick={() => onNavigate('property-detail')} className="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 group cursor-pointer flex flex-col">
                     <div className="h-48 relative overflow-hidden">
                        <img src={biz.images[0]} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={biz.name} />
                        <div className="absolute top-4 left-4">
                           <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black text-indigo-600 uppercase tracking-widest border border-white shadow-lg">{biz.category}</span>
                        </div>
                     </div>
                     <div className="p-8 space-y-4 flex-1 flex flex-col justify-between">
                        <div>
                           <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none group-hover:text-indigo-600 transition-colors">{biz.name}</h4>
                           <p className="text-[9px] font-bold text-slate-400 mt-2 line-clamp-1 italic">{biz.address}</p>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                           <div className="flex items-center gap-1 text-amber-400 text-xs">
                              <i className="fas fa-star"></i>
                              <span className="font-black text-slate-900">{biz.rating}</span>
                           </div>
                           <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Detail Node →</span>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <div className="space-y-8">
            <h3 className="text-xl font-black text-slate-900 uppercase italic">Voucher & Promo</h3>
            <div className="space-y-4">
               {activePromos.map(promo => (
                  <div key={promo.id} className="bg-indigo-600 p-8 rounded-[40px] text-white relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                     <p className="text-[8px] font-black uppercase tracking-[0.3em] text-indigo-200 mb-4">Limited Offer Node</p>
                     <h4 className="text-3xl font-black tracking-tighter mb-1">{promo.discountValue}{promo.type === 'percentage' ? '%' : 'K'} OFF</h4>
                     <p className="text-[10px] font-bold text-indigo-100/60 uppercase tracking-widest mb-6">Code: {promo.code}</p>
                     <button className="w-full py-3 bg-white text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Klaim Promo</button>
                  </div>
               ))}
               <button onClick={() => onSelectTab('rewards')} className="w-full py-5 bg-slate-50 border border-slate-200 text-slate-400 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:text-indigo-600 hover:bg-white transition-all">Buka Dompet Voucher</button>
            </div>
         </div>
      </div>

      {/* 4. ACTIVITY HISTORY PREVIEW */}
      <section className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-sm space-y-8">
         <div className="flex items-center justify-between px-4">
            <h3 className="text-xl font-black text-slate-900 uppercase italic">Riwayat Aktivitas</h3>
            <i className="fas fa-clock-rotate-left text-slate-200 text-2xl"></i>
         </div>
         <div className="space-y-4">
            {MOCK_BOOKINGS.filter(b => b.guestId === user.id && b.status === BookingStatus.COMPLETED).slice(0, 2).map(log => (
               <div key={log.id} className="p-6 bg-slate-50 rounded-[32px] flex items-center justify-between group hover:border-indigo-100 transition-all border border-transparent">
                  <div className="flex items-center gap-6">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors shadow-sm">
                        <i className="fas fa-check-circle"></i>
                     </div>
                     <div>
                        <p className="text-xs font-black text-slate-900 uppercase">Checkout Selesai Node #{log.id}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Temporal Node: {log.checkOut}</p>
                     </div>
                  </div>
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Archive</span>
               </div>
            ))}
         </div>
      </section>
    </div>
  );
};
