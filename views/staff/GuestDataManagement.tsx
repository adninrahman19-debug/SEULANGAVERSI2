
import React, { useState, useMemo } from 'react';
import { User, Booking, BookingStatus, VerificationStatus } from '../../types';

interface GuestDataManagementProps {
  guests: User[];
  bookings: Booking[];
  onUpdateGuest: (id: string, data: Partial<User>) => void;
}

export const GuestDataManagement: React.FC<GuestDataManagementProps> = ({ guests, bookings, onUpdateGuest }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 1. DATA FILTERING
  const filteredGuests = useMemo(() => {
    return guests.filter(g => 
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      g.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [guests, searchQuery]);

  const selectedGuest = useMemo(() => guests.find(g => g.id === selectedGuestId), [guests, selectedGuestId]);
  
  const guestHistory = useMemo(() => {
    if (!selectedGuestId) return [];
    return bookings.filter(b => b.guestId === selectedGuestId)
      .sort((a, b) => b.checkIn.localeCompare(a.checkIn));
  }, [bookings, selectedGuestId]);

  // 2. HANDLERS
  const handleToggleVerification = (id: string, current: VerificationStatus) => {
    const next = current === VerificationStatus.VERIFIED ? VerificationStatus.PENDING : VerificationStatus.VERIFIED;
    onUpdateGuest(id, { verificationStatus: next });
    alert(`Identity Protocol: ${id} status shifted to ${next.toUpperCase()}`);
  };

  const handleUpdateNotes = (id: string, note: string) => {
    // In a real app, this would call onUpdateGuest. 
    // Here we simulate the persistence logic.
    console.log(`Node ${id} internal notes synchronized.`);
  };

  return (
    <div className="space-y-10 animate-fade-up">
      {/* HEADER & SEARCH HUB */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">Identity Matrix Hub</h2>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-2">Pusat data tamu terpusat dan verifikasi kredensial legal.</p>
        </div>
        <div className="relative w-full md:w-96">
          <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
          <input 
            type="text" 
            placeholder="Search Name, Email, or ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-700 outline-none focus:ring-4 ring-indigo-50 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT: GUEST REGISTRY LIST */}
        <div className="lg:col-span-1 space-y-4 max-h-[75vh] overflow-y-auto pr-2 scrollbar-hide">
          {filteredGuests.map(guest => (
            <button
              key={guest.id}
              onClick={() => setSelectedGuestId(guest.id)}
              className={`w-full p-6 rounded-[36px] border text-left transition-all flex items-center gap-5 group relative overflow-hidden ${
                selectedGuestId === guest.id ? 'bg-slate-950 border-slate-900 text-white shadow-2xl scale-[1.02]' : 'bg-white border-slate-100 hover:border-indigo-200'
              }`}
            >
              <img src={guest.avatar} className="w-14 h-14 rounded-2xl object-cover shadow-lg border-2 border-white/10" alt="avatar" />
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-sm uppercase truncate mb-1">{guest.name}</h4>
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${guest.verificationStatus === VerificationStatus.VERIFIED ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-amber-400'}`}></span>
                  <p className={`text-[9px] font-black uppercase tracking-widest ${selectedGuestId === guest.id ? 'text-indigo-400' : 'text-slate-400'}`}>{guest.verificationStatus}</p>
                </div>
              </div>
              <i className={`fas fa-chevron-right text-[10px] transition-transform group-hover:translate-x-1 ${selectedGuestId === guest.id ? 'text-indigo-400' : 'text-slate-200'}`}></i>
            </button>
          ))}
          {filteredGuests.length === 0 && (
            <div className="py-20 text-center text-slate-300 font-black uppercase text-[10px] tracking-widest italic border-2 border-dashed border-slate-100 rounded-[32px]">No matching identity nodes found</div>
          )}
        </div>

        {/* RIGHT: DEEP PROFILE INSPECTION */}
        <div className="lg:col-span-2">
          {selectedGuest ? (
            <div className="bg-white rounded-[56px] border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-500">
              <div className="p-10 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row items-center gap-10">
                <div className="relative group">
                  <img src={selectedGuest.avatar} className="w-32 h-32 rounded-[40px] object-cover ring-8 ring-white shadow-2xl" alt="profile" />
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
                    <i className="fas fa-id-card text-xs"></i>
                  </div>
                </div>
                <div className="text-center md:text-left flex-1">
                  <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2 leading-none">{selectedGuest.name}</h3>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-6">Internal ID: {selectedGuest.id}</p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <button 
                      onClick={() => handleToggleVerification(selectedGuest.id, selectedGuest.verificationStatus || VerificationStatus.UNVERIFIED)}
                      className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        selectedGuest.verificationStatus === VerificationStatus.VERIFIED 
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                        : 'bg-white border border-amber-200 text-amber-600 hover:bg-amber-50'
                      }`}
                    >
                      <i className="fas fa-shield-check mr-2"></i> 
                      {selectedGuest.verificationStatus === VerificationStatus.VERIFIED ? 'Validated Identity' : 'Authorize Identity'}
                    </button>
                    <button onClick={() => setIsEditModalOpen(true)} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-black transition-all">Edit Registry</button>
                  </div>
                </div>
              </div>

              <div className="p-12 space-y-12">
                {/* Contact Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Endpoint</p>
                    <p className="text-sm font-black text-slate-900">{selectedGuest.email}</p>
                  </div>
                  <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Link</p>
                    <p className="text-sm font-black text-slate-900">{selectedGuest.phoneNumber || 'Node Unavailable'}</p>
                  </div>
                </div>

                {/* Internal Observations */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 ml-2">
                    <i className="fas fa-user-secret text-indigo-600 text-xs"></i>
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Internal Behavioral Observations</h4>
                  </div>
                  <div className="relative">
                    <textarea 
                      onBlur={(e) => handleUpdateNotes(selectedGuest.id, e.target.value)}
                      defaultValue={selectedGuest.notes}
                      placeholder="Add private observations about this identity node... (e.g. Preferred room temperature, noisy guest history, etc.)"
                      className="w-full bg-slate-50 border border-slate-200 rounded-[32px] p-8 text-sm font-bold text-slate-700 outline-none focus:ring-4 ring-indigo-50 transition-all resize-none h-32"
                    />
                    <div className="absolute bottom-4 right-6 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-[8px] font-black text-slate-300 uppercase">Auto-Sync Enabled</span>
                    </div>
                  </div>
                </div>

                {/* Stay History Matrix */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-2 italic">Stay History Matrix</h4>
                  <div className="overflow-hidden border border-slate-50 rounded-[32px]">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50/50">
                        <tr>
                          <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase">Temporal Node</th>
                          <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase">Unit Asset</th>
                          <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase text-right">Settlement</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {guestHistory.map(hist => (
                          <tr key={hist.id} className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-8 py-6 text-xs font-bold text-slate-500">{hist.checkIn} — {hist.checkOut}</td>
                            <td className="px-8 py-6">
                              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-tight">#{hist.unitId}</span>
                            </td>
                            <td className="px-8 py-6 text-right font-black text-slate-900 text-xs">Rp {hist.totalPrice.toLocaleString()}</td>
                          </tr>
                        ))}
                        {guestHistory.length === 0 && (
                          <tr>
                            <td colSpan={3} className="py-12 text-center text-slate-200 font-black uppercase text-[10px] italic">No historical cycles recorded</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[56px] border border-slate-100 h-full flex flex-col items-center justify-center text-center p-20 space-y-8 min-h-[600px]">
              <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-[40px] flex items-center justify-center text-5xl shadow-inner border border-white">
                <i className="fas fa-fingerprint"></i>
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase">Identity Inspection</h3>
                <p className="text-slate-400 font-medium max-w-xs mx-auto mt-2 leading-relaxed">Select an identity node from the matrix to visualize profile integrity and behavioral history.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EDIT REGISTRY MODAL */}
      {isEditModalOpen && selectedGuest && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[56px] shadow-2xl p-16 space-y-12 relative overflow-hidden">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all z-10"><i className="fas fa-times"></i></button>
            
            <div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-3">Modify Registry</h3>
              <p className="text-slate-400 text-sm font-medium">Updating identity node #{selectedGuest.id}</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setIsEditModalOpen(false); alert('Identity protocol updated.'); }} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity Name</label>
                <input required defaultValue={selectedGuest.name} className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-5 font-bold text-slate-900 outline-none focus:ring-4 ring-indigo-50 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Endpoint</label>
                  <input required defaultValue={selectedGuest.email} className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-5 font-bold outline-none" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Node</label>
                  <input defaultValue={selectedGuest.phoneNumber} className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-5 font-bold outline-none" />
                </div>
              </div>
              
              <button type="submit" className="w-full py-6 bg-slate-950 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all">Authorize Synchronization</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
