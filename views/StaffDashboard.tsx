import React, { useState, useMemo, useEffect } from 'react';
import { 
  MOCK_BOOKINGS, MOCK_UNITS, MOCK_BUSINESSES, MOCK_USERS, 
  MOCK_MAINTENANCE, MOCK_AUDIT_LOGS 
} from '../constants';
import { 
  BookingStatus, Unit, UnitStatus, Booking, User, 
  MaintenanceTicket, AuditLog, UserRole, VerificationStatus 
} from '../types';

type StaffModule = 'front-desk' | 'administration' | 'core-ops' | 'guest-service' | 'inventory' | 'maintenance' | 'payments' | 'profile';

interface StaffDashboardProps {
    currentUser: User | null;
    onUpdateUser: (data: Partial<User>) => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ currentUser, onUpdateUser }) => {
  const [activeModule, setActiveModule] = useState<StaffModule>('front-desk');
  const [businessId] = useState('b1'); 
  const TODAY = '2024-12-28';
  
  const [units, setUnits] = useState<Unit[]>(MOCK_UNITS.filter(u => u.businessId === businessId));
  const [localBookings, setLocalBookings] = useState<Booking[]>(MOCK_BOOKINGS.filter(b => b.businessId === businessId));
  const [localGuests, setLocalGuests] = useState<User[]>(MOCK_USERS.filter(u => u.role === UserRole.GUEST));
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Modals & Temp States
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [reschedulingBooking, setReschedulingBooking] = useState<Booking | null>(null);
  const [bookingFilter, setBookingFilter] = useState<BookingStatus | 'ALL' | 'HISTORY'>('ALL');
  
  // Guest Service Modals
  const [selectedBookingForAction, setSelectedBookingForAction] = useState<Booking | null>(null);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Administration Modals
  const [selectedGuestForEdit, setSelectedGuestForEdit] = useState<User | null>(null);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [guestSearch, setGuestSearch] = useState('');

  // Stats for Front Desk
  const todayArrivals = localBookings.filter(b => b.checkIn === TODAY && b.status !== BookingStatus.CANCELLED);
  const todayDepartures = localBookings.filter(b => b.checkOut === TODAY && b.status === BookingStatus.CHECKED_IN);
  const availableUnitsCount = units.filter(u => u.available && u.status === UnitStatus.READY).length;
  const pendingPaymentsCount = localBookings.filter(b => !b.verifiedPayment && b.status !== BookingStatus.CANCELLED).length;

  const [staffTasks, setStaffTasks] = useState([
    { id: 't1', title: 'Verify BK-2901 Payment', priority: 'high', type: 'payment', isDone: false },
    { id: 't2', title: 'Prepare Room 201 for VIP Arrival', priority: 'medium', type: 'room', isDone: false },
    { id: 't3', title: 'Inspect AC in Unit 305', priority: 'high', type: 'maintenance', isDone: true },
  ]);

  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  // Core Actions
  const handleUpdateUnitStatus = (unitId: string, status: UnitStatus) => {
    setUnits(prev => prev.map(u => u.id === unitId ? { ...u, status, available: status === UnitStatus.READY } : u));
    alert(`Status Unit ${unitId} diperbarui menjadi ${status}.`);
  };

  const handleSyncCalendar = async () => {
    setIsSyncing(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsSyncing(false);
    alert('Sinkronisasi Kalender (OTA/Global) Berhasil Selesai.');
  };

  const handleUpdateBookingStatus = (id: string, status: BookingStatus) => {
    setLocalBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    alert(`Status reservasi ${id} diperbarui: ${status}`);
  };

  // Administration Handlers
  const handleSaveGuestData = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const guestData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phoneNumber: formData.get('phone') as string,
      verificationStatus: formData.get('verification') as VerificationStatus,
      permissions: [formData.get('notes') as string] // Reusing permissions array for internal notes in this mock
    };

    if (selectedGuestForEdit) {
      setLocalGuests(prev => prev.map(g => g.id === selectedGuestForEdit.id ? { ...g, ...guestData } : g));
      alert('Data tamu berhasil diperbarui.');
    } else {
      const newGuest: User = {
        id: `u-${Date.now()}`,
        ...guestData,
        role: UserRole.GUEST,
        avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
        createdAt: TODAY
      };
      setLocalGuests(prev => [newGuest, ...prev]);
      alert('Tamu baru berhasil didaftarkan.');
    }
    setIsGuestModalOpen(false);
    setSelectedGuestForEdit(null);
  };

  const handleVerifyIdentity = (guestId: string) => {
    setLocalGuests(prev => prev.map(g => g.id === guestId ? { ...g, verificationStatus: VerificationStatus.VERIFIED } : g));
    alert('Identitas Tamu Terverifikasi (KYC Success).');
  };

  // Guest Service Handlers
  const handleDigitalCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForAction) return;
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    setLocalBookings(prev => prev.map(b => b.id === selectedBookingForAction.id ? {
      ...b,
      status: BookingStatus.CHECKED_IN,
      notes: (b.notes || '') + ` | Digital Check-in Data: ID ${formData.get('guestIdCard')}, Nat: ${formData.get('guestNationality')}`
    } : b));
    
    setIsCheckInModalOpen(false);
    setSelectedBookingForAction(null);
    alert('Digital Check-in Berhasil. Akses Unit Diberikan.');
  };

  const handleFinalCheckOut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForAction) return;
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const damageReport = formData.get('damageNotes') as string;

    setLocalBookings(prev => prev.map(b => b.id === selectedBookingForAction.id ? {
      ...b,
      status: BookingStatus.COMPLETED,
      notes: (b.notes || '') + (damageReport ? ` | Laporan Kerusakan: ${damageReport}` : ' | Check-out bersih')
    } : b));

    setUnits(prev => prev.map(u => u.id === selectedBookingForAction.unitId ? { ...u, status: UnitStatus.DIRTY, available: false } : u));

    setIsCheckOutModalOpen(false);
    setSelectedBookingForAction(null);
    alert('Check-out Selesai.');
  };

  const handleManualBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const unitId = formData.get('unitId') as string;
    const unit = units.find(u => u.id === unitId);
    
    const newBooking: Booking = {
      id: `BK-WALK-${Date.now()}`,
      businessId: businessId,
      unitId: unitId,
      guestId: 'u-walkin',
      checkIn: formData.get('checkIn') as string,
      checkOut: formData.get('checkOut') as string,
      totalPrice: Number(formData.get('totalPrice')) || (unit?.price || 0),
      status: BookingStatus.CONFIRMED,
      createdAt: TODAY,
      verifiedPayment: true
    };
    
    setLocalBookings(prev => [newBooking, ...prev]);
    setIsWalkInModalOpen(false);
    alert('Walk-in authorized.');
  };

  const handleReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingBooking) return;
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    
    setLocalBookings(prev => prev.map(b => b.id === reschedulingBooking.id ? {
      ...b,
      checkIn: formData.get('checkIn') as string,
      checkOut: formData.get('checkOut') as string,
      notes: (b.notes || '') + ` | Rescheduled with Owner Permission: ${formData.get('permissionRef')}`
    } : b));
    
    setReschedulingBooking(null);
    alert('Date modification synced.');
  };

  const renderFrontDesk = () => (
    <div className="space-y-12 animate-fade-up">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
           <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                 <i className="fas fa-door-open text-xl"></i>
              </div>
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">Arrivals</span>
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-in Hari Ini</p>
           <h3 className="text-3xl font-black text-slate-900 tracking-tight">{todayArrivals.length}</h3>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
           <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                 <i className="fas fa-person-walking-dashed-line text-xl"></i>
              </div>
              <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-1 rounded-lg">Departures</span>
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Check-out Hari Ini</p>
           <h3 className="text-3xl font-black text-slate-900 tracking-tight">{todayDepartures.length}</h3>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
           <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                 <i className="fas fa-bed text-xl"></i>
              </div>
              <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded-lg">Inventory</span>
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Unit Siap</p>
           <h3 className="text-3xl font-black text-slate-900 tracking-tight">{availableUnitsCount}</h3>
        </div>
        <div className="bg-slate-950 p-8 rounded-[40px] shadow-xl text-white relative overflow-hidden group">
           <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-indigo-400">
                    <i className="fas fa-clock-rotate-left text-xl"></i>
                 </div>
                 <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Pending</span>
              </div>
              <p className="text-[10px] font-black text-indigo-300/60 uppercase tracking-widest mb-1">Tagihan Unverified</p>
              <h3 className="text-3xl font-black">{pendingPaymentsCount}</h3>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                 <h3 className="text-2xl font-black text-slate-900 uppercase">Protokol Kedatangan</h3>
                 <button onClick={() => setActiveModule('guest-service')} className="text-indigo-600 text-xs font-black uppercase tracking-widest hover:underline">Pelayanan Tamu</button>
              </div>
              <div className="space-y-4">
                 {todayArrivals.length > 0 ? todayArrivals.map(bk => (
                    <div key={bk.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-indigo-200 transition-all">
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-white rounded-2xl flex flex-col items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                             <i className="fas fa-arrow-right-to-bracket text-xl"></i>
                          </div>
                          <div>
                             <p className="font-black text-slate-900 uppercase">GUEST ID: {bk.guestId.toUpperCase()}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase">{units.find(u => u.id === bk.unitId)?.name} • {bk.id}</p>
                          </div>
                       </div>
                       <button onClick={() => { setSelectedBookingForAction(bk); setIsCheckInModalOpen(true); }} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all">Digital Check-In</button>
                    </div>
                 )) : (
                   <p className="text-center py-10 text-slate-300 font-bold uppercase text-[10px] tracking-widest">Tidak ada kedatangan terjadwal</p>
                 )}
              </div>
           </div>
        </div>

        <div className="space-y-8">
           <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Tugas Hari Ini</h3>
                 <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
              </div>
              <div className="space-y-4">
                 {staffTasks.map(task => (
                    <div key={task.id} className={`p-5 rounded-3xl border transition-all cursor-pointer flex items-center gap-4 ${task.isDone ? 'bg-slate-50 opacity-60' : 'bg-white border-slate-200 shadow-sm hover:border-indigo-200'}`}>
                       <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${task.isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}><i className="fas fa-check text-[10px]"></i></div>
                       <div className="flex-1 min-w-0">
                          <p className={`text-xs font-black uppercase truncate ${task.isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>{task.title}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );

  const renderAdministration = () => {
    const filteredGuests = localGuests.filter(g => 
      g.name.toLowerCase().includes(guestSearch.toLowerCase()) || 
      g.email.toLowerCase().includes(guestSearch.toLowerCase())
    );

    return (
      <div className="space-y-10 animate-fade-up">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
           <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Administrasi & CRM</h2>
              <p className="text-slate-400 text-sm font-medium">Manajemen data tamu, riwayat menginap, dan verifikasi identitas (KYC).</p>
           </div>
           <button 
             onClick={() => { setSelectedGuestForEdit(null); setIsGuestModalOpen(true); }}
             className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-3"
           >
             <i className="fas fa-user-plus"></i>
             Tambah Data Tamu
           </button>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
           <div className="relative max-w-md">
              <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input 
                 type="text" 
                 placeholder="Cari nama atau email tamu..." 
                 value={guestSearch}
                 onChange={(e) => setGuestSearch(e.target.value)}
                 className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none focus:ring-4 ring-indigo-50"
              />
           </div>

           <div className="overflow-hidden border border-slate-100 rounded-[32px]">
              <table className="w-full text-left">
                 <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Profil Tamu</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Kontak</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identitas</th>
                       <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Opsi</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {filteredGuests.map(guest => (
                       <tr key={guest.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-4">
                                <img src={guest.avatar} className="w-12 h-12 rounded-xl object-cover ring-2 ring-white shadow-sm" />
                                <div>
                                   <p className="font-black text-slate-900 uppercase text-xs">{guest.name}</p>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase">Registered: {guest.createdAt}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <p className="text-xs font-black text-slate-700">{guest.email}</p>
                             <p className="text-[10px] font-bold text-indigo-500 uppercase">{guest.phoneNumber || 'No Phone'}</p>
                          </td>
                          <td className="px-8 py-5">
                             <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border ${
                                guest.verificationStatus === VerificationStatus.VERIFIED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                             }`}>
                                {guest.verificationStatus || 'UNVERIFIED'}
                             </span>
                          </td>
                          <td className="px-8 py-5 text-right space-x-2">
                             <button onClick={() => { setSelectedGuestForEdit(guest); setIsGuestModalOpen(true); }} className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-indigo-600 hover:border-indigo-600 transition-all shadow-sm"><i className="fas fa-user-pen text-xs"></i></button>
                             {guest.verificationStatus !== VerificationStatus.VERIFIED && (
                               <button onClick={() => handleVerifyIdentity(guest.id)} className="p-2.5 bg-white border border-emerald-100 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm" title="Verifikasi KYC"><i className="fas fa-shield-check text-xs"></i></button>
                             )}
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

        {/* Guest Management Modal */}
        {isGuestModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
             <div className="bg-white w-full max-w-4xl h-[80vh] rounded-[48px] shadow-2xl flex flex-col overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-white shrink-0">
                   <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{selectedGuestForEdit ? 'Ubah Profil Tamu' : 'Daftarkan Tamu Baru'}</h3>
                   <button onClick={() => setIsGuestModalOpen(false)} className="w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all"><i className="fas fa-times"></i></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      {/* Left: Identity Form */}
                      <form onSubmit={handleSaveGuestData} className="space-y-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap Sesuai ID</label>
                            <input name="name" defaultValue={selectedGuestForEdit?.name} required className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 font-bold text-slate-900 outline-none" />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                               <input name="email" type="email" defaultValue={selectedGuestForEdit?.email} required className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 font-bold text-slate-900" />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telepon</label>
                               <input name="phone" defaultValue={selectedGuestForEdit?.phoneNumber} required className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 font-bold text-slate-900" />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status Verifikasi Identitas</label>
                            <select name="verification" defaultValue={selectedGuestForEdit?.verificationStatus || VerificationStatus.UNVERIFIED} className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 font-bold text-slate-900 outline-none">
                               {Object.values(VerificationStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catatan Internal (Privat)</label>
                            <textarea name="notes" defaultValue={selectedGuestForEdit?.permissions?.[0]} rows={3} placeholder="Tamu VIP, preferensi lantai atas, riwayat keterlambatan..." className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 font-bold text-slate-900 outline-none resize-none" />
                         </div>
                         <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl">Simpan Profil Node</button>
                      </form>

                      {/* Right: Stay History */}
                      <div className="space-y-6">
                         <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Riwayat Menginap</h4>
                         <div className="space-y-4">
                            {selectedGuestForEdit ? (
                               localBookings.filter(bk => bk.guestId === selectedGuestForEdit.id).map(bk => (
                                  <div key={bk.id} className="p-5 bg-slate-50 border border-slate-100 rounded-3xl flex justify-between items-center">
                                     <div>
                                        <p className="text-xs font-black text-slate-900 uppercase">{units.find(u => u.id === bk.unitId)?.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{bk.checkIn} — {bk.checkOut}</p>
                                     </div>
                                     <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase border ${bk.status === BookingStatus.COMPLETED ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>{bk.status}</span>
                                  </div>
                               ))
                            ) : (
                               <p className="text-center py-20 text-slate-300 font-bold uppercase text-[10px] tracking-widest italic">Pilih atau daftarkan tamu untuk melihat riwayat</p>
                            )}
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  };

  const renderInventory = () => (
    <div className="space-y-10 animate-fade-up">
       <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
             <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Ketersediaan & Kesiapan Unit</h2>
             <p className="text-slate-400 text-sm font-medium">Update status operasional kamar, blokir unit, dan sinkronisasi kalender.</p>
          </div>
          <button 
            onClick={handleSyncCalendar}
            disabled={isSyncing}
            className={`px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl transition-all flex items-center gap-3 ${
              isSyncing ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
            }`}
          >
            {isSyncing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-rotate"></i>}
            {isSyncing ? 'Syncing...' : 'Sinkron Kalender'}
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {units.map(unit => (
            <div key={unit.id} className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all">
               <div className="relative h-48 overflow-hidden">
                  <img src={unit.images[0]} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={unit.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-6 left-8">
                     <h4 className="text-xl font-black text-white uppercase leading-none mb-1">{unit.name}</h4>
                     <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{unit.type}</p>
                  </div>
                  <div className="absolute top-6 right-8">
                     <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/20 backdrop-blur-md ${
                        unit.status === UnitStatus.READY ? 'bg-emerald-500/80 text-white' :
                        unit.status === UnitStatus.MAINTENANCE ? 'bg-rose-500/80 text-white' :
                        unit.status === UnitStatus.BLOCKED ? 'bg-slate-800/80 text-white' :
                        'bg-amber-500/80 text-white'
                     }`}>{unit.status}</span>
                  </div>
               </div>
               
               <div className="p-10 flex-1 flex flex-col justify-between space-y-8">
                  <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Update Protokol:</span>
                        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                           <button onClick={() => handleUpdateUnitStatus(unit.id, UnitStatus.READY)} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${unit.status === UnitStatus.READY ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}>Ready</button>
                           <button onClick={() => handleUpdateUnitStatus(unit.id, UnitStatus.CLEANING)} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${unit.status === UnitStatus.CLEANING ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}>Cleaning</button>
                           <button onClick={() => handleUpdateUnitStatus(unit.id, UnitStatus.DIRTY)} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${unit.status === UnitStatus.DIRTY ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}>Dirty</button>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-3">
                        <button 
                           onClick={() => handleUpdateUnitStatus(unit.id, UnitStatus.MAINTENANCE)}
                           className={`py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${
                              unit.status === UnitStatus.MAINTENANCE ? 'bg-rose-500 text-white border-rose-500' : 'bg-white border-slate-200 text-slate-500 hover:border-rose-500 hover:text-rose-500'
                           }`}
                        >
                           <i className="fas fa-screwdriver-wrench"></i>
                           Tandai Maintenance
                        </button>
                        <button 
                           onClick={() => handleUpdateUnitStatus(unit.id, unit.status === UnitStatus.BLOCKED ? UnitStatus.READY : UnitStatus.BLOCKED)}
                           className={`py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${
                              unit.status === UnitStatus.BLOCKED ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-900 hover:text-slate-900'
                           }`}
                        >
                           <i className="fas fa-ban"></i>
                           {unit.status === UnitStatus.BLOCKED ? 'Buka Blokir' : 'Blokir Sementara'}
                        </button>
                     </div>
                  </div>

                  <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${unit.available ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase">{unit.available ? 'Online di Marketplace' : 'Offline / Hidden'}</span>
                     </div>
                  </div>
               </div>
            </div>
          ))}
       </div>
    </div>
  );

  const renderGuestService = () => {
    const inHouse = localBookings.filter(b => b.status === BookingStatus.CHECKED_IN);
    const pendingArrivals = localBookings.filter(b => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PENDING);

    return (
      <div className="space-y-12 animate-fade-up">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
           <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Pelayanan Tamu (Guest Hub)</h2>
              <p className="text-slate-400 text-sm font-medium">Layanan check-in, penagihan invoice, dan penutupan reservasi.</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           {/* In-House Guests */}
           <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                 <h3 className="text-xl font-black text-slate-900 uppercase">Tamu Menginap (In-House)</h3>
                 <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">{inHouse.length} ACTIVE</span>
              </div>
              <div className="space-y-4">
                 {inHouse.map(bk => {
                   const unit = units.find(u => u.id === bk.unitId);
                   return (
                     <div key={bk.id} className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 flex flex-col gap-6 hover:border-indigo-200 transition-all">
                        <div className="flex justify-between items-start">
                           <div className="flex items-center gap-5">
                              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                                 <i className="fas fa-user-tag text-xl"></i>
                              </div>
                              <div>
                                 <p className="font-black text-slate-900 uppercase">NODE-{bk.guestId.toUpperCase()}</p>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase">{unit?.name} • Room Access Verified</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Stay Duration</p>
                              <p className="text-xs font-black text-indigo-600 uppercase">{bk.checkIn} → {bk.checkOut}</p>
                           </div>
                        </div>
                        <div className="flex gap-3 pt-4 border-t border-slate-200/50">
                           <button onClick={() => { setSelectedBookingForAction(bk); setIsInvoiceModalOpen(true); }} className="flex-1 py-3 bg-white border border-indigo-200 text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all">Cetak Invoice</button>
                           <button onClick={() => { setSelectedBookingForAction(bk); setIsCheckOutModalOpen(true); }} className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-black transition-all">Proses Check-Out</button>
                        </div>
                     </div>
                   );
                 })}
                 {inHouse.length === 0 && (
                   <p className="text-center py-20 text-slate-300 font-bold uppercase text-[10px] tracking-widest italic">Belum ada tamu yang check-in</p>
                 )}
              </div>
           </div>

           {/* Pending Arrivals */}
           <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                 <h3 className="text-xl font-black text-slate-900 uppercase">Menunggu Kedatangan</h3>
                 <i className="fas fa-plane-arrival text-indigo-200 text-xl"></i>
              </div>
              <div className="space-y-4">
                 {pendingArrivals.map(bk => (
                    <div key={bk.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-indigo-200 transition-all">
                       <div>
                          <p className="font-black text-slate-900 uppercase">NODE-{bk.guestId.toUpperCase()}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{units.find(u => u.id === bk.unitId)?.name} • ETA {bk.checkIn}</p>
                       </div>
                       <button onClick={() => { setSelectedBookingForAction(bk); setIsCheckInModalOpen(true); }} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all">Digital Check-In</button>
                    </div>
                 ))}
                 {pendingArrivals.length === 0 && (
                   <p className="text-center py-20 text-slate-300 font-bold uppercase text-[10px] tracking-widest italic">Tidak ada antrian kedatangan</p>
                 )}
              </div>
           </div>
        </div>

        {/* Digital Check-In Modal */}
        {isCheckInModalOpen && selectedBookingForAction && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
             <div className="bg-white w-full max-w-xl rounded-[48px] p-12 space-y-10 shadow-2xl relative">
                <button onClick={() => setIsCheckInModalOpen(false)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all"><i className="fas fa-times"></i></button>
                <div>
                   <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Digital Check-In</h3>
                   <p className="text-slate-400 text-sm font-medium">Lengkapi data identitas tamu untuk memvalidasi akses unit.</p>
                </div>
                <form onSubmit={handleDigitalCheckIn} className="space-y-6">
                   <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 mb-6">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Booking Node</p>
                      <p className="text-sm font-black text-indigo-900 uppercase">{selectedBookingForAction.id} — {units.find(u => u.id === selectedBookingForAction.unitId)?.name}</p>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomor Identitas (NIK/Passport)</label>
                      <input name="guestIdCard" required placeholder="1234567890..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 ring-indigo-50" />
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kewarganegaraan</label>
                         <input name="guestNationality" defaultValue="Indonesia" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold outline-none" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomor Telepon</label>
                         <input name="guestPhone" required placeholder="+62..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold outline-none" />
                      </div>
                   </div>
                   <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Authorize Check-In</button>
                </form>
             </div>
          </div>
        )}

        {/* Check-Out Modal */}
        {isCheckOutModalOpen && selectedBookingForAction && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
             <div className="bg-white w-full max-w-xl rounded-[48px] p-12 space-y-10 shadow-2xl relative">
                <button onClick={() => setIsCheckOutModalOpen(false)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all"><i className="fas fa-times"></i></button>
                <div>
                   <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Check-Out & Closing</h3>
                   <p className="text-slate-400 text-sm font-medium">Finalisasi reservasi dan lapor kondisi unit.</p>
                </div>
                <form onSubmit={handleFinalCheckOut} className="space-y-6">
                   <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-2 uppercase">
                         <span>Total Tagihan:</span>
                         <span className="text-slate-900 font-black">Rp {selectedBookingForAction.totalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase">
                         <span>Status Pembayaran:</span>
                         <span className="text-emerald-600 font-black">LUNAS</span>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catatan Kerusakan / Kehilangan (Opsional)</label>
                      <textarea name="damageNotes" rows={4} placeholder="Deskripsikan jika ada barang rusak atau hilang..." className="w-full bg-slate-50 border border-slate-200 rounded-3xl py-4 px-6 text-sm font-bold focus:ring-4 ring-rose-50 outline-none resize-none" />
                   </div>
                   <button type="submit" className="w-full py-5 bg-rose-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-100 hover:bg-rose-700 transition-all">Tutup Reservasi (Closing)</button>
                </form>
             </div>
          </div>
        )}

        {/* Invoice Modal */}
        {isInvoiceModalOpen && selectedBookingForAction && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
             <div className="bg-white w-full max-w-2xl rounded-[56px] p-16 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                <button onClick={() => setIsInvoiceModalOpen(false)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all z-10"><i className="fas fa-times"></i></button>
                
                <div className="flex justify-between items-start border-b border-slate-100 pb-12 mb-12">
                   <div>
                      <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Invoice</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase">SERIAL: {selectedBookingForAction.id.toUpperCase()}</p>
                   </div>
                   <div className="text-right">
                      <p className="font-black text-slate-900 uppercase">Grand Seulanga Node</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Banda Aceh, Sumatra</p>
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-12 scrollbar-hide">
                   <div className="grid grid-cols-2 gap-12">
                      <div>
                         <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-4">Guest Identity</p>
                         <p className="text-sm font-black text-slate-900 uppercase">NODE-{selectedBookingForAction.guestId.toUpperCase()}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-4">Registry Date</p>
                         <p className="text-sm font-black text-slate-900 uppercase">{selectedBookingForAction.createdAt}</p>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Billing Sequence</p>
                      <div className="bg-slate-50 rounded-3xl p-8 space-y-4">
                         <div className="flex justify-between text-xs font-bold text-slate-600">
                            <span>Sewa Unit ({units.find(u => u.id === selectedBookingForAction.unitId)?.name})</span>
                            <span>Rp {selectedBookingForAction.totalPrice.toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between text-xs font-bold text-slate-400">
                            <span>Platform Tax (Incl.)</span>
                            <span>Rp 0</span>
                         </div>
                         <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
                            <span className="text-sm font-black text-slate-900 uppercase">Total Settlement</span>
                            <span className="text-2xl font-black text-indigo-600">Rp {selectedBookingForAction.totalPrice.toLocaleString()}</span>
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center gap-3 p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                      <i className="fas fa-certificate text-emerald-600"></i>
                      <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Transaction Verified & Digitally Signed</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-12 border-t border-slate-100 mt-auto">
                   <button onClick={() => window.print()} className="py-5 bg-slate-950 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all">
                      <i className="fas fa-print"></i> Cetak Dokumen
                   </button>
                   <button onClick={() => alert('Invoice dikirim via email dan notifikasi push tamu.')} className="py-5 bg-white border border-indigo-200 text-indigo-600 rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-50 transition-all">
                      <i className="fas fa-paper-plane"></i> Kirim Digital
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  };

  const renderCoreOps = () => {
    const filtered = localBookings.filter(bk => {
      if (bookingFilter === 'ALL') return bk.status !== BookingStatus.COMPLETED && bk.status !== BookingStatus.CANCELLED;
      if (bookingFilter === 'HISTORY') return bk.status === BookingStatus.COMPLETED || bk.status === BookingStatus.CANCELLED;
      return bk.status === bookingFilter;
    });

    return (
      <div className="space-y-10 animate-fade-up">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
           <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Inti Pekerjaan (Ops Matrix)</h2>
              <p className="text-slate-400 text-sm font-medium">Monitoring reservasi real-time, verifikasi, dan registrasi manual.</p>
           </div>
           <button 
             onClick={() => setIsWalkInModalOpen(true)}
             className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-3"
           >
             <i className="fas fa-person-walking-luggage"></i>
             Manual Walk-In
           </button>
        </div>

        {/* Filter Bar */}
        <div className="flex bg-white p-1.5 rounded-[24px] border border-slate-100 shadow-sm w-fit gap-1">
           {[
             { id: 'ALL', label: 'Aktif' },
             { id: BookingStatus.PENDING, label: 'Menunggu' },
             { id: BookingStatus.CONFIRMED, label: 'Terjadwal' },
             { id: BookingStatus.CHECKED_IN, label: 'In-House' },
             { id: 'HISTORY', label: 'Riwayat' },
           ].map(tab => (
             <button 
               key={tab.id}
               onClick={() => setBookingFilter(tab.id as any)}
               className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                 bookingFilter === tab.id ? 'bg-slate-950 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
               }`}
             >
               {tab.label}
             </button>
           ))}
        </div>

        {/* Booking Table */}
        <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden">
           <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                 <tr>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identitas Guest</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit & Jadwal</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Hub</th>
                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi Protokol</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {filtered.map(bk => (
                    <tr key={bk.id} className="hover:bg-slate-50/50 transition-colors">
                       <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-black text-[10px]">G</div>
                             <div>
                                <p className="font-black text-slate-900 uppercase">NODE-{bk.guestId.toUpperCase()}</p>
                                <p className="text-[10px] font-bold text-slate-400">{bk.id}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-10 py-6">
                          <p className="text-xs font-black text-slate-700">{units.find(u => u.id === bk.unitId)?.name}</p>
                          <p className="text-[10px] font-bold text-indigo-500 uppercase">{bk.checkIn} → {bk.checkOut}</p>
                       </td>
                       <td className="px-10 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                             bk.status === BookingStatus.CONFIRMED ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                             bk.status === BookingStatus.PENDING ? 'bg-amber-50 text-amber-600 border-amber-100' :
                             bk.status === BookingStatus.CHECKED_IN ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                             'bg-slate-100 text-slate-400 border-slate-200'
                          }`}>{bk.status}</span>
                       </td>
                       <td className="px-10 py-6 text-right space-x-2">
                          {bk.status === BookingStatus.PENDING && (
                             <>
                                <button onClick={() => handleUpdateBookingStatus(bk.id, BookingStatus.CONFIRMED)} className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all"><i className="fas fa-check"></i></button>
                                <button onClick={() => handleUpdateBookingStatus(bk.id, BookingStatus.CANCELLED)} className="p-3 bg-white border border-rose-100 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><i className="fas fa-times"></i></button>
                             </>
                          )}
                          {(bk.status === BookingStatus.CONFIRMED || bk.status === BookingStatus.PENDING) && (
                             <button onClick={() => setReschedulingBooking(bk)} className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all" title="Ubah Tanggal"><i className="fas fa-calendar-day"></i></button>
                          )}
                          {bk.status === BookingStatus.CONFIRMED && (
                             <button onClick={() => { setSelectedBookingForAction(bk); setIsCheckInModalOpen(true); }} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg hover:bg-emerald-700 transition-all">Check-In</button>
                          )}
                          {bk.status === BookingStatus.CHECKED_IN && (
                             <button onClick={() => { setSelectedBookingForAction(bk); setIsCheckOutModalOpen(true); }} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg hover:bg-black transition-all">Finalize Out</button>
                          )}
                          {bk.status === BookingStatus.COMPLETED && (
                             <span className="text-[10px] font-black text-slate-300 uppercase italic">Archived</span>
                          )}
                       </td>
                    </tr>
                 ))}
                 {filtered.length === 0 && (
                    <tr><td colSpan={4} className="py-20 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest">Tidak ada record yang ditemukan</td></tr>
                 )}
              </tbody>
           </table>
        </div>

        {/* Walk-in Modal */}
        {isWalkInModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
             <div className="bg-white w-full max-w-xl rounded-[48px] p-12 space-y-10 shadow-2xl relative">
                <button onClick={() => setIsWalkInModalOpen(false)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all"><i className="fas fa-times"></i></button>
                <div>
                   <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Walk-In Registry</h3>
                   <p className="text-slate-400 text-sm font-medium">Bypass digital hub untuk registrasi tamu on-site.</p>
                </div>
                <form onSubmit={handleManualBooking} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Unit</label>
                      <select name="unitId" required className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-black text-slate-900 outline-none">
                         {units.filter(u => u.available).map(u => <option key={u.id} value={u.id}>{u.name} (Rp {u.price.toLocaleString()})</option>)}
                      </select>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Check-In</label>
                         <input type="date" name="checkIn" required className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-black text-slate-900 outline-none" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Check-Out</label>
                         <input type="date" name="checkOut" required className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-black text-slate-900 outline-none" />
                      </div>
                   </div>
                   <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Authorize Booking</button>
                </form>
             </div>
          </div>
        )}

        {/* Reschedule Modal */}
        {reschedulingBooking && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
             <div className="bg-white w-full max-w-xl rounded-[48px] p-12 space-y-10 shadow-2xl relative">
                <button onClick={() => setReschedulingBooking(null)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all"><i className="fas fa-times"></i></button>
                <div>
                   <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Modification Hub</h3>
                   <p className="text-slate-400 text-sm font-medium">Ubah jadwal reservasi. Pastikan izin Owner telah diverifikasi.</p>
                </div>
                <form onSubmit={handleReschedule} className="space-y-6">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Check-In Baru</label>
                         <input type="date" name="checkIn" defaultValue={reschedulingBooking.checkIn} required className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-black text-slate-900 outline-none" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Check-Out Baru</label>
                         <input type="date" name="checkOut" defaultValue={reschedulingBooking.checkOut} required className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-black text-slate-900 outline-none" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Referensi Izin Owner</label>
                      <input name="permissionRef" required placeholder="E.g. WhatsApp / Verbal Agreement Ref Code" className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-black text-slate-900 outline-none focus:ring-4 ring-indigo-50" />
                   </div>
                   <button type="submit" className="w-full py-5 bg-slate-950 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-indigo-600 transition-all">Authorize Changes</button>
                </form>
             </div>
          </div>
        )}
      </div>
    );
  };

  const renderProfile = () => (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-up">
       <div className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-sm space-y-10">
          <div className="flex items-center gap-8 pb-10 border-b border-slate-50">
             <img src={currentUser?.avatar} className="w-24 h-24 rounded-3xl object-cover ring-4 ring-slate-50 shadow-xl" />
             <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-1">{currentUser?.name}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Desk #011</p>
             </div>
          </div>
          <form onSubmit={async (e) => {
             e.preventDefault();
             setIsSaving(true);
             await new Promise(r => setTimeout(r, 1000));
             onUpdateUser({ name: profileName });
             setIsSaving(false);
             alert('Identity Synced.');
          }} className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operator Name</label>
                   <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 font-bold text-slate-900 focus:outline-none focus:ring-4 ring-indigo-50" />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Responsibility Shift</label>
                   <input type="text" value="Morning Ops (08:00 - 16:00)" disabled className="w-full bg-slate-100 border border-slate-200 rounded-3xl px-6 py-4 font-bold text-slate-400 cursor-not-allowed" />
                </div>
             </div>
             <button disabled={isSaving} className="w-full py-5 bg-slate-950 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all">{isSaving ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-sync mr-2"></i>} Synchronize Ops Identity</button>
          </form>
       </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
      <aside className="w-80 bg-white border-r border-slate-200/60 transition-all duration-500 flex flex-col z-50 shadow-sm shrink-0">
        <div className="h-24 flex items-center px-8 border-b border-slate-50">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl"><i className="fas fa-clipboard-check"></i></div>
             <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight text-slate-900 uppercase">Ops Desk</span>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Grand Seulanga Node</span>
             </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-6 space-y-1.5 scrollbar-hide">
           {[
             { id: 'front-desk', label: 'Ringkasan Tugas', icon: 'fa-gauge-high' },
             { id: 'administration', label: 'Administrasi', icon: 'fa-address-card' },
             { id: 'guest-service', label: 'Pelayanan Tamu', icon: 'fa-user-tag' },
             { id: 'core-ops', label: 'Inti Pekerjaan', icon: 'fa-list-check' },
             { id: 'inventory', label: 'Ketersediaan', icon: 'fa-broom' },
             { id: 'maintenance', label: 'Maintenance Hub', icon: 'fa-screwdriver-wrench' },
             { id: 'payments', label: 'Pay Verification', icon: 'fa-money-bill-transfer' },
             { id: 'profile', label: 'Personal Ops', icon: 'fa-user-gear' }
           ].map(item => (
             <button 
                key={item.id}
                onClick={() => setActiveModule(item.id as StaffModule)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeModule === item.id ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
             >
                <i className={`fas ${item.icon} text-lg w-6`}></i>
                {item.label}
             </button>
           ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#f8fafc] scrollbar-hide p-12">
         <header className="mb-12 flex items-center justify-between">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{activeModule.replace('-', ' ')} Module</h1>
            <div className="flex items-center gap-4">
               <div className="flex flex-col items-end">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Date</p>
                  <p className="text-sm font-black text-slate-900 uppercase">{TODAY}</p>
               </div>
            </div>
         </header>
         {activeModule === 'front-desk' && renderFrontDesk()}
         {activeModule === 'administration' && renderAdministration()}
         {activeModule === 'core-ops' && renderCoreOps()}
         {activeModule === 'guest-service' && renderGuestService()}
         {activeModule === 'inventory' && renderInventory()}
         {activeModule === 'profile' && renderProfile()}
         {activeModule !== 'front-desk' && activeModule !== 'administration' && activeModule !== 'core-ops' && activeModule !== 'guest-service' && activeModule !== 'inventory' && activeModule !== 'profile' && (
            <div className="py-40 text-center animate-fade-up">
               <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300">
                  <i className={`fas fa-layer-group text-4xl`}></i>
               </div>
               <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase">{activeModule} Node</h3>
               <p className="text-slate-500 font-medium max-w-md mx-auto">Accessing operational protocols for {activeModule}.</p>
            </div>
         )}
      </main>
    </div>
  );
};
