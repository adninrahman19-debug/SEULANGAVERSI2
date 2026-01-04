
import React, { useState, useMemo } from 'react';
import { User, UserRole, AuditLog } from '../../types';
import { MOCK_USERS, MOCK_AUDIT_LOGS } from '../../constants';

interface InternalUserManagementProps {
  businessId: string;
}

export const InternalUserManagement: React.FC<InternalUserManagementProps> = ({ businessId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [suspendedIds, setSuspendedIds] = useState<Set<string>>(new Set());

  // Filter staf hanya untuk bisnis ini (termasuk owner sendiri)
  const staffList = useMemo(() => {
    return MOCK_USERS.filter(u => 
      u.businessId === businessId && 
      (u.role === UserRole.ADMIN_STAFF || u.role === UserRole.BUSINESS_OWNER)
    ).filter(u => 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [businessId, searchQuery]);

  // Log aktivitas spesifik staf di bisnis ini
  const businessLogs = useMemo(() => {
    return MOCK_AUDIT_LOGS.filter(log => 
      staffList.some(s => s.id === log.actorId)
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [staffList]);

  const handleToggleSuspend = (id: string) => {
    const newSuspended = new Set(suspendedIds);
    if (newSuspended.has(id)) {
      newSuspended.delete(id);
      alert("Protokol Akses: Node operator telah dipulihkan.");
    } else {
      newSuspended.add(id);
      alert("Protokol Suspensi: Akses node operator telah dinonaktifkan sementara.");
    }
    setSuspendedIds(newSuspended);
  };

  const handleResetPassword = (name: string) => {
    if (confirm(`Kirim payload reset password ke email ${name}? Link temporal akan aktif selama 24 jam.`)) {
      alert("Decryption Token Sent: Instruksi reset password telah dikirim via jalur aman.");
    }
  };

  const handleSaveStaff = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert('Identitas operator baru telah disinkronkan ke dalam cluster bisnis.');
    setIsAddModalOpen(false);
  };

  const PERMISSIONS = [
    { id: 'manage_booking', label: 'Booking Logic', icon: 'fa-calendar-check' },
    { id: 'manage_inventory', label: 'Asset Matrix', icon: 'fa-door-open' },
    { id: 'view_finance', label: 'Treasury Access', icon: 'fa-vault' },
    { id: 'manage_reviews', label: 'Reputation Hub', icon: 'fa-star' },
    { id: 'edit_profile', label: 'Identity Control', icon: 'fa-id-card' }
  ];

  return (
    <div className="space-y-12 animate-fade-up">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Team Node Governance</h2>
           <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-2">Otorisasi operator dan manajemen hak akses sistem operasional.</p>
        </div>
        <button 
          onClick={() => { setEditingStaff(null); setIsAddModalOpen(true); }}
          className="px-8 py-4 bg-slate-950 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all flex items-center gap-3"
        >
          <i className="fas fa-user-plus"></i> Inject New Operator
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT: STAFF DIRECTORY */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
              <div className="relative">
                 <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"></i>
                 <input 
                   type="text" 
                   placeholder="Cari nama atau email operator..." 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full bg-slate-50 border border-slate-200 rounded-[28px] py-5 pl-16 pr-8 text-sm font-bold outline-none focus:ring-4 ring-indigo-50 transition-all shadow-inner"
                 />
              </div>

              <div className="overflow-hidden border border-slate-50 rounded-[32px]">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50">
                       <tr>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operator Identity</th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Auth Role</th>
                          <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Strategic Override</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {staffList.map(member => (
                          <tr key={member.id} className={`group hover:bg-slate-50/30 transition-all ${suspendedIds.has(member.id) ? 'opacity-50 grayscale' : ''}`}>
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-5">
                                   <div className="relative">
                                      <img src={member.avatar} className="w-14 h-14 rounded-2xl object-cover shadow-lg border-2 border-white ring-1 ring-slate-100" alt="staf" />
                                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${suspendedIds.has(member.id) ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                                   </div>
                                   <div>
                                      <p className="font-black text-slate-900 uppercase text-xs group-hover:text-indigo-600 transition-colors">{member.name}</p>
                                      <p className="text-[10px] font-bold text-slate-400 lowercase">{member.email}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-6 text-center">
                                <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                   member.role === UserRole.BUSINESS_OWNER ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                                }`}>
                                   {member.role === UserRole.BUSINESS_OWNER ? 'Master Admin' : 'Receptionist'}
                                </span>
                             </td>
                             <td className="px-8 py-6 text-right space-x-2">
                                <button 
                                  onClick={() => handleResetPassword(member.name)}
                                  className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm"
                                  title="Reset Password"
                                >
                                   <i className="fas fa-key text-xs"></i>
                                </button>
                                <button 
                                  onClick={() => { setEditingStaff(member); setIsAddModalOpen(true); }}
                                  className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm"
                                  title="Edit Permissions"
                                >
                                   <i className="fas fa-sliders text-xs"></i>
                                </button>
                                {member.role !== UserRole.BUSINESS_OWNER && (
                                  <button 
                                    onClick={() => handleToggleSuspend(member.id)}
                                    className={`p-3 rounded-xl transition-all shadow-lg ${
                                      suspendedIds.has(member.id) ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                                    }`}
                                    title={suspendedIds.has(member.id) ? 'Restore Access' : 'Suspend Access'}
                                  >
                                     <i className={`fas ${suspendedIds.has(member.id) ? 'fa-unlock' : 'fa-ban'} text-xs`}></i>
                                  </button>
                                )}
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

           {/* FORENSIC ACTIVITY LOGS */}
           <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-10">
              <div className="flex items-center justify-between">
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">Operational Activity Logs</h3>
                 <div className="w-10 h-10 bg-slate-50 text-slate-300 rounded-xl flex items-center justify-center border border-slate-100 shadow-inner">
                    <i className="fas fa-fingerprint"></i>
                 </div>
              </div>

              <div className="space-y-4">
                 {businessLogs.map(log => (
                    <div key={log.id} className="p-6 bg-slate-50 border border-slate-100 rounded-[32px] flex items-center justify-between group hover:border-indigo-100 transition-all">
                       <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-400 shadow-sm">
                             <i className="fas fa-clock-rotate-left"></i>
                          </div>
                          <div>
                             <p className="text-xs font-black text-slate-800 uppercase">{log.action}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Actor: {log.actorName} • Target: {log.target}</p>
                          </div>
                       </div>
                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{log.timestamp}</span>
                    </div>
                 ))}
                 {businessLogs.length === 0 && (
                   <p className="text-center py-20 text-slate-300 font-black uppercase text-[10px] tracking-widest italic">No forensic threads recorded.</p>
                 )}
              </div>
           </div>
        </div>

        {/* RIGHT: PERMISSION MATRIX OVERVIEW */}
        <div className="space-y-8">
           <div className="bg-slate-950 p-10 rounded-[56px] shadow-2xl text-white space-y-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <div className="relative z-10">
                 <h3 className="text-xl font-black tracking-tight uppercase mb-4">Authority Matrix</h3>
                 <p className="text-indigo-200/40 text-[10px] font-bold uppercase tracking-widest mb-10 leading-relaxed">Definisi hak akses global untuk operasional properti.</p>
                 
                 <div className="space-y-8">
                    {PERMISSIONS.map(perm => (
                       <div key={perm.id} className="flex gap-5 items-start">
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 shrink-0">
                             <i className={`fas ${perm.icon} text-sm`}></i>
                          </div>
                          <div>
                             <p className="text-[11px] font-black text-indigo-100 uppercase tracking-widest">{perm.label}</p>
                             <p className="text-[9px] font-medium text-white/30 leading-relaxed mt-1">Izin untuk mengakses modul {perm.label.toLowerCase()} dan memproses data terkait.</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="bg-indigo-600 p-10 rounded-[48px] shadow-xl text-white space-y-6 relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
              <h4 className="text-sm font-black uppercase tracking-widest italic">Operational Security</h4>
              <p className="text-xs font-medium leading-relaxed opacity-80 italic">"Setiap tindakan staf dicatat dalam audit log yang tidak dapat diubah oleh operator."</p>
              <div className="pt-4 flex items-center gap-3">
                 <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
                 <span className="text-[10px] font-black uppercase tracking-widest">Surveillance Active</span>
              </div>
           </div>
        </div>
      </div>

      {/* ADD/EDIT OPERATOR MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-2xl h-[85vh] rounded-[56px] shadow-2xl relative overflow-hidden flex flex-col">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-white shrink-0">
                 <div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">{editingStaff ? 'Edit Operator Authorization' : 'Deploy New Operator'}</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Konfigurasi kredensial dan hak akses operator.</p>
                 </div>
                 <button onClick={() => setIsAddModalOpen(false)} className="w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all shadow-sm"><i className="fas fa-times text-xl"></i></button>
              </div>

              <form onSubmit={handleSaveStaff} className="flex-1 overflow-y-auto p-12 space-y-12 scrollbar-hide">
                 <div className="space-y-8">
                    <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-50 pb-2 flex items-center gap-3">
                       <i className="fas fa-user-shield"></i> Identity Credentials
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                          <input required name="name" defaultValue={editingStaff?.name} placeholder="E.g. Andi Operasional" className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-bold text-slate-900 focus:ring-4 ring-indigo-50 outline-none" />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Node (Login)</label>
                          <input required name="email" type="email" defaultValue={editingStaff?.email} placeholder="andi@propernode.com" className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-bold text-slate-900 focus:ring-4 ring-indigo-50 outline-none" />
                       </div>
                    </div>
                    {!editingStaff && (
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Temporal Key (Password)</label>
                         <input required type="password" placeholder="••••••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-8 py-4 font-bold" />
                         <p className="text-[9px] font-bold text-slate-300 italic uppercase">Operator wajib mengubah password saat login pertama kali.</p>
                      </div>
                    )}
                 </div>

                 <div className="space-y-8">
                    <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-50 pb-2 flex items-center gap-3">
                       <i className="fas fa-lock-open"></i> Access Authorization Matrix
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {PERMISSIONS.map(perm => (
                          <label key={perm.id} className="p-6 bg-slate-50 border border-slate-200 rounded-3xl flex items-center justify-between cursor-pointer hover:border-indigo-200 transition-all group">
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-sm">
                                   <i className={`fas ${perm.icon}`}></i>
                                </div>
                                <span className="text-xs font-black text-slate-700 uppercase">{perm.label}</span>
                             </div>
                             <input type="checkbox" defaultChecked={editingStaff?.permissions?.includes(perm.id)} className="w-6 h-6 rounded-lg border-slate-300 text-indigo-600 focus:ring-indigo-50 cursor-pointer" />
                          </label>
                       ))}
                    </div>
                 </div>

                 <div className="pt-10 border-t border-slate-100 flex justify-end gap-4 shrink-0">
                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-10 py-4 bg-slate-50 text-slate-400 rounded-3xl font-black text-[10px] uppercase tracking-widest">Abort</button>
                    <button type="submit" className="px-12 py-4 bg-slate-950 text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all flex items-center gap-3">
                       <i className="fas fa-shield-check"></i> {editingStaff ? 'Update Authorization' : 'Authorize Operator'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
