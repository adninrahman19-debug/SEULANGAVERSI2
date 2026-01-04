
import React, { useState, useMemo } from 'react';
import { User, Booking, Unit, UserRole, BookingStatus } from '../../types';
import { MOCK_USERS, MOCK_BOOKINGS, MOCK_UNITS } from '../../constants';

interface GuestManagementProps {
  businessId: string;
}

export const GuestManagement: React.FC<GuestManagementProps> = ({ businessId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [blacklistIds, setBlacklistIds] = useState<Set<string>>(new Set());
  const [internalNotes, setInternalNotes] = useState<Record<string, string>>({});

  // 1. Ambil semua tamu yang pernah booking di bisnis ini
  const guestDatabase = useMemo(() => {
    const businessBookings = MOCK_BOOKINGS.filter(b => b.businessId === businessId);
    const guestIds = new Set(businessBookings.map(b => b.guestId));
    
    // Filter MOCK_USERS yang ada di set guestIds
    return MOCK_USERS.filter(u => guestIds.has(u.id)).filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [businessId, searchQuery]);

  const selectedGuest = useMemo(() => 
    MOCK_USERS.find(u => u.id === selectedGuestId), 
  [selectedGuestId]);

  const guestStayHistory = useMemo(() => 
    MOCK_BOOKINGS.filter(b => b.guestId === selectedGuestId && b.businessId === businessId),
  [selectedGuestId, businessId]);

  const handleToggleBlacklist = (id: string) => {
    const newBlacklist = new Set(blacklistIds);
    if (newBlacklist.has(id)) {
      newBlacklist.delete(id);
      alert("Protokol Pemulihan: Akses tamu telah diaktifkan kembali.");
    } else {
      newBlacklist.add(id);
      alert("Protokol Blacklist: Tamu telah dilarang mengakses node bisnis ini.");
    }
    setBlacklistIds(newBlacklist);
  };

  const handleSaveNote = (id: string, note: string) => {
    setInternalNotes({ ...internalNotes, [id]: note });
    alert("Catatan internal telah disinkronkan ke database.");
  };

  return (
    <div className="space-y-10 animate-fade-up">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Guest Intelligence Hub</h2>
           <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-2">Database identitas pelanggan dan riwayat perilaku transaksi.</p>
        </div>
        <div className="relative w-full md:w-96">
           <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
           <input 
             type="text" 
             placeholder="Cari identitas tamu..." 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none focus:ring-4 ring-indigo-50 transition-all"
           />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT: GUEST LIST */}
        <div className="lg:col-span-1 space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide">
           {guestDatabase.map(guest => (
             <button
               key={guest.id}
               onClick={() => setSelectedGuestId(guest.id)}
               className={`w-full p-6 rounded-[32px] border text-left transition-all flex items-center gap-5 group ${
                 selectedGuestId === guest.id ? 'bg-slate-950 border-slate-900 text-white shadow-2xl scale-[1.02]' : 'bg-white border-slate-100 hover:border-indigo-200'
               } ${blacklistIds.has(guest.id) ? 'opacity-60 grayscale' : ''}`}
             >
                <div className="relative">
                  <img src={guest.avatar} className="w-14 h-14 rounded-2xl object-cover shadow-md" alt="avatar" />
                  {blacklistIds.has(guest.id) && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-rose-600 rounded-full flex items-center justify-center text-[10px] border-2 border-white">
                      <i className="fas fa-ban"></i>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                   <h4 className="font-black text-sm uppercase truncate mb-1">{guest.name}</h4>
                   <p className={`text-[10px] font-bold uppercase tracking-widest ${selectedGuestId === guest.id ? 'text-indigo-400' : 'text-slate-400'}`}>
                      {MOCK_BOOKINGS.filter(b => b.guestId === guest.id && b.businessId === businessId).length} Kunjungan
                   </p>
                </div>
                <i className={`fas fa-chevron-right text-xs transition-transform group-hover:translate-x-1 ${selectedGuestId === guest.id ? 'text-indigo-400' : 'text-slate-200'}`}></i>
             </button>
           ))}
           {guestDatabase.length === 0 && (
             <div className="py-20 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest italic border-2 border-dashed border-slate-100 rounded-[32px]">
                Identitas Tidak Ditemukan
             </div>
           )}
        </div>

        {/* RIGHT: GUEST PROFILE DETAIL */}
        <div className="lg:col-span-2">
           {selectedGuest ? (
             <div className="bg-white rounded-[56px] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
                {/* Profile Header */}
                <div className="p-12 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row items-center gap-10">
                   <img src={selectedGuest.avatar} className="w-32 h-32 rounded-[40px] object-cover ring-8 ring-white shadow-2xl" />
                   <div className="text-center md:text-left flex-1">
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-3">
                         <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{selectedGuest.name}</h3>
                         <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${selectedGuest.verificationStatus === 'Verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                            {selectedGuest.verificationStatus} ID
                         </span>
                      </div>
                      <p className="text-slate-500 font-bold text-sm mb-6">{selectedGuest.email} • {selectedGuest.phoneNumber || 'No Contact Node'}</p>
                      <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                         <button 
                           onClick={() => handleToggleBlacklist(selectedGuest.id)}
                           className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                             blacklistIds.has(selectedGuest.id) ? 'bg-emerald-600 text-white shadow-lg' : 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white'
                           }`}
                         >
                            <i className={`fas ${blacklistIds.has(selectedGuest.id) ? 'fa-unlock' : 'fa-ban'} mr-2`}></i>
                            {blacklistIds.has(selectedGuest.id) ? 'Restore Node' : 'Blacklist Guest'}
                         </button>
                         <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg">Kirim Pesan</button>
                      </div>
                   </div>
                </div>

                <div className="p-12 space-y-12">
                   {/* Internal Notes */}
                   <div className="space-y-4">
                      <div className="flex items-center gap-3">
                         <i className="fas fa-user-secret text-indigo-600"></i>
                         <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Internal Intelligence (Notes)</h4>
                      </div>
                      <div className="relative group">
                         <textarea 
                           className="w-full bg-slate-50 border border-slate-200 rounded-[32px] p-8 text-sm font-bold text-slate-700 outline-none focus:ring-4 ring-indigo-50 transition-all resize-none"
                           placeholder="Tambahkan catatan privat untuk tamu ini (hanya dilihat oleh Owner & Staf)..."
                           rows={3}
                           defaultValue={internalNotes[selectedGuest.id] || ''}
                           onBlur={(e) => handleSaveNote(selectedGuest.id, e.target.value)}
                         />
                         <div className="absolute bottom-4 right-6 text-[8px] font-black text-slate-300 uppercase">Auto-Sync Active</div>
                      </div>
                   </div>

                   {/* Stay History Table */}
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <i className="fas fa-history text-indigo-600"></i>
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Stay History Matrix</h4>
                         </div>
                         <span className="text-[10px] font-black text-slate-400 uppercase">{guestStayHistory.length} Record</span>
                      </div>
                      <div className="overflow-hidden border border-slate-100 rounded-[32px]">
                         <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                               <tr>
                                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Booking ID</th>
                                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Unit</th>
                                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Temporal Axis</th>
                                  <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Settlement</th>
                               </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                               {guestStayHistory.map(bk => (
                                 <tr key={bk.id} className="hover:bg-slate-50/30 transition-colors">
                                    <td className="px-6 py-5 text-xs font-black text-slate-900 uppercase">#{bk.id}</td>
                                    <td className="px-6 py-5 text-xs font-bold text-slate-500 uppercase">{MOCK_UNITS.find(u => u.id === bk.unitId)?.name}</td>
                                    <td className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase">{bk.checkIn} - {bk.checkOut}</td>
                                    <td className="px-6 py-5 text-xs font-black text-indigo-600 text-right">Rp {bk.totalPrice.toLocaleString()}</td>
                                 </tr>
                               ))}
                            </tbody>
                         </table>
                      </div>
                   </div>
                </div>
             </div>
           ) : (
             <div className="bg-white rounded-[56px] border border-slate-100 h-full flex flex-col items-center justify-center text-center p-20 space-y-8">
                <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-[40px] flex items-center justify-center text-4xl shadow-inner">
                   <i className="fas fa-fingerprint"></i>
                </div>
                <div>
                   <h3 className="text-2xl font-black text-slate-900 uppercase">Identity Inspection</h3>
                   <p className="text-slate-400 font-medium max-w-xs mx-auto mt-2 leading-relaxed">Pilih tamu dari daftar kiri untuk melakukan enkripsi detail profil dan riwayat.</p>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
