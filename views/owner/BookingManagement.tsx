
import React, { useState, useMemo } from 'react';
import { Booking, BookingStatus, Unit, Business, UserRole } from '../../types';

interface BookingManagementProps {
  business: Business;
  bookings: Booking[];
  units: Unit[];
  onUpdateBooking: (id: string, status: BookingStatus) => void;
  onAddManualBooking: (data: any) => void;
}

type BookingFilter = 'pending' | 'active' | 'history';

export const BookingManagement: React.FC<BookingManagementProps> = ({ 
  business, bookings, units, onUpdateBooking, onAddManualBooking 
}) => {
  const [filter, setFilter] = useState<BookingFilter>('active');
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBookings = useMemo(() => {
    return bookings.filter(bk => {
      const unit = units.find(u => u.id === bk.unitId);
      const matchesSearch = bk.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           unit?.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const isHistory = bk.status === BookingStatus.COMPLETED || bk.status === BookingStatus.CANCELLED;
      const isPending = bk.status === BookingStatus.PENDING;
      const isActive = bk.status === BookingStatus.CONFIRMED || bk.status === BookingStatus.CHECKED_IN;

      if (filter === 'history') return isHistory && matchesSearch;
      if (filter === 'pending') return isPending && matchesSearch;
      return isActive && matchesSearch;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [bookings, filter, searchQuery, units]);

  const handleWalkInSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newBooking = {
      id: `BK-WALK-${Date.now()}`,
      businessId: business.id,
      unitId: formData.get('unitId'),
      guestId: 'u-manual',
      checkIn: formData.get('checkIn'),
      checkOut: formData.get('checkOut'),
      totalPrice: Number(formData.get('totalPrice')),
      status: BookingStatus.CONFIRMED,
      createdAt: new Date().toISOString().split('T')[0],
      verifiedPayment: true,
      notes: 'Manual Walk-In Entry'
    };
    onAddManualBooking(newBooking);
    setIsWalkInModalOpen(false);
    alert('Reservasi Manual Berhasil Didaftarkan.');
  };

  return (
    <div className="space-y-10 animate-fade-up">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Reservations Ledger</h2>
           <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-2">Monitor sirkulasi tamu dan kendali transaksi unit secara real-time.</p>
        </div>
        <button 
          onClick={() => setIsWalkInModalOpen(true)}
          className="px-8 py-4 bg-slate-950 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all flex items-center gap-3"
        >
          <i className="fas fa-person-walking-luggage"></i> Manual Walk-In
        </button>
      </div>

      {/* FILTER & SEARCH HUB */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
        <div className="flex bg-white p-1.5 rounded-[24px] border border-slate-100 shadow-sm gap-1">
          {[
            { id: 'pending', label: 'Antrian (Pending)', count: bookings.filter(b => b.status === BookingStatus.PENDING).length },
            { id: 'active', label: 'Aktif / In-House', count: bookings.filter(b => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.CHECKED_IN).length },
            { id: 'history', label: 'Riwayat Selesai', count: bookings.filter(b => b.status === BookingStatus.COMPLETED || b.status === BookingStatus.CANCELLED).length },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setFilter(tab.id as BookingFilter)}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
                filter === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-md text-[8px] ${filter === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>{tab.count}</span>
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-80">
          <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
          <input 
            type="text" 
            placeholder="Cari ID atau Unit..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-6 text-xs font-bold outline-none focus:ring-4 ring-indigo-50"
          />
        </div>
      </div>

      {/* RESERVATION LIST */}
      <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest & Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Node</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Temporal Axis</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Settlement</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Otoritas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredBookings.map(bk => {
                const unit = units.find(u => u.id === bk.unitId);
                return (
                  <tr key={bk.id} className="hover:bg-slate-50/30 transition-all group">
                    <td className="px-10 py-8">
                       <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
                            bk.status === BookingStatus.PENDING ? 'bg-amber-50 text-amber-600' :
                            bk.status === BookingStatus.CHECKED_IN ? 'bg-indigo-50 text-indigo-600' :
                            bk.status === BookingStatus.CONFIRMED ? 'bg-emerald-50 text-emerald-600' :
                            'bg-slate-100 text-slate-400'
                          }`}>
                             <i className={`fas ${bk.guestId === 'u-manual' ? 'fa-user-tag' : 'fa-user-circle'}`}></i>
                          </div>
                          <div>
                             <p className="font-black text-slate-900 uppercase text-xs tracking-tight">#{bk.id}</p>
                             <div className="flex items-center gap-2 mt-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                  bk.status === BookingStatus.CHECKED_IN ? 'bg-indigo-500 animate-pulse' : 
                                  bk.status === BookingStatus.PENDING ? 'bg-amber-500' : 'bg-slate-300'
                                }`}></div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bk.status}</span>
                             </div>
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-8">
                       <p className="text-sm font-black text-slate-700 uppercase">{unit?.name || 'Unknown Unit'}</p>
                       <p className="text-[10px] font-bold text-indigo-500 uppercase mt-1">{unit?.type}</p>
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex items-center gap-4">
                          <div className="text-right">
                             <p className="text-[10px] font-black text-slate-900 uppercase">{bk.checkIn}</p>
                             <p className="text-[8px] font-bold text-slate-400 uppercase">In</p>
                          </div>
                          <i className="fas fa-arrow-right-long text-slate-200 text-[10px]"></i>
                          <div>
                             <p className="text-[10px] font-black text-slate-900 uppercase">{bk.checkOut}</p>
                             <p className="text-[8px] font-bold text-slate-400 uppercase">Out</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                       <p className="text-sm font-black text-slate-900">Rp {bk.totalPrice.toLocaleString()}</p>
                       <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${bk.verifiedPayment ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {bk.verifiedPayment ? 'Settled' : 'Unpaid'}
                       </span>
                    </td>
                    <td className="px-10 py-8 text-right space-x-2 whitespace-nowrap">
                       {bk.status === BookingStatus.PENDING && (
                         <>
                           <button onClick={() => onUpdateBooking(bk.id, BookingStatus.CONFIRMED)} className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg hover:bg-emerald-600 transition-all"><i className="fas fa-check"></i></button>
                           <button onClick={() => onUpdateBooking(bk.id, BookingStatus.CANCELLED)} className="p-3 bg-rose-500 text-white rounded-xl shadow-lg hover:bg-rose-600 transition-all"><i className="fas fa-times"></i></button>
                         </>
                       )}
                       {bk.status === BookingStatus.CONFIRMED && (
                         <button onClick={() => onUpdateBooking(bk.id, BookingStatus.CHECKED_IN)} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all">Check-In Guest</button>
                       )}
                       {bk.status === BookingStatus.CHECKED_IN && (
                         <button onClick={() => onUpdateBooking(bk.id, BookingStatus.COMPLETED)} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-black transition-all">Finalize Out</button>
                       )}
                       {(bk.status === BookingStatus.COMPLETED || bk.status === BookingStatus.CANCELLED) && (
                         <button className="p-3 bg-slate-50 text-slate-300 rounded-xl hover:text-indigo-600 transition-colors"><i className="fas fa-file-invoice"></i></button>
                       )}
                    </td>
                  </tr>
                );
              })}
              {filteredBookings.length === 0 && (
                <tr>
                   <td colSpan={5} className="py-32 text-center">
                      <i className="fas fa-calendar-xmark text-slate-100 text-6xl mb-6"></i>
                      <p className="text-slate-300 font-black uppercase text-xs tracking-widest italic">Tidak ada data reservasi pada node ini.</p>
                   </td>
                </tr>
              )}
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
                 <p className="text-slate-400 text-sm font-medium">Bypass digital node untuk pendaftaran tamu langsung di lokasi.</p>
              </div>
              <form onSubmit={handleWalkInSubmit} className="space-y-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Unit Asset</label>
                    <select name="unitId" required className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-4 font-bold text-slate-900 outline-none focus:ring-4 ring-indigo-50">
                       {units.filter(u => u.available).map(u => <option key={u.id} value={u.id}>{u.name} (Rp {u.price.toLocaleString()})</option>)}
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Check-In</label>
                       <input type="date" name="checkIn" required className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-4 font-bold text-slate-900 outline-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Check-Out</label>
                       <input type="date" name="checkOut" required className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-4 font-bold text-slate-900 outline-none" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Settlement (Rp)</label>
                    <input type="number" name="totalPrice" required className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-4 font-bold text-slate-900 outline-none" placeholder="Masukkan total biaya..." />
                 </div>
                 <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-4">
                    <i className="fas fa-shield-check"></i> Authorize Entry
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
