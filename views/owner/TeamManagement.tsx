
import React, { useState } from 'react';
import { User, UserRole, VerificationStatus } from '../../types';
import { MOCK_USERS } from '../../constants';

interface TeamManagementProps {
  businessId: string;
}

export const TeamManagement: React.FC<TeamManagementProps> = ({ businessId }) => {
  const [staff, setStaff] = useState<User[]>(
    MOCK_USERS.filter(u => u.businessId === businessId && u.role === UserRole.ADMIN_STAFF)
  );

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const handleToggleStaffStatus = (id: string) => {
    alert(`Protokol Akses: Node Staf ${id} telah disuspensi/diaktifkan kembali oleh Owner.`);
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const newStaff: User = {
      id: `u-staff-${Date.now()}`,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: UserRole.ADMIN_STAFF,
      businessId: businessId,
      createdAt: new Date().toISOString().split('T')[0],
      avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
      permissions: ['manage_bookings', 'guest_service']
    };
    setStaff([...staff, newStaff]);
    setIsInviteModalOpen(false);
  };

  return (
    <div className="space-y-10 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Operator Node Matrix</h2>
           <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-1">Kelola tim operasional dan delegasi tugas harian bisnis Anda.</p>
        </div>
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="px-8 py-4 bg-slate-950 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all flex items-center gap-3"
        >
          <i className="fas fa-user-plus"></i> Rekrut Staf Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {staff.map(member => (
          <div key={member.id} className="bg-white p-8 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex items-center gap-6 mb-8">
               <img src={member.avatar} className="w-16 h-16 rounded-[24px] object-cover ring-4 ring-slate-50 shadow-lg" alt="staf" />
               <div>
                  <h4 className="font-black text-slate-900 uppercase text-sm tracking-tight">{member.name}</h4>
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Operator Node</p>
               </div>
            </div>
            <div className="space-y-4 mb-8">
               <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                  <span>Izin Akses:</span>
               </div>
               <div className="flex flex-wrap gap-2">
                  {member.permissions?.map(p => (
                    <span key={p} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[8px] font-black uppercase border border-slate-100">{p.replace('_', ' ')}</span>
                  ))}
               </div>
            </div>
            <div className="flex gap-3 pt-6 border-t border-slate-50">
               <button onClick={() => alert('Membuka log kinerja staf...')} className="flex-1 py-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all text-[10px] font-black uppercase">Monitor Log</button>
               <button onClick={() => handleToggleStaffStatus(member.id)} className="p-3 bg-white border border-rose-100 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><i className="fas fa-ban"></i></button>
            </div>
          </div>
        ))}
        {staff.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-[48px]">
             <p className="text-slate-300 font-black uppercase text-xs tracking-widest italic">Belum ada tim terdaftar.</p>
          </div>
        )}
      </div>

      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-md rounded-[48px] p-12 space-y-10 shadow-2xl relative">
              <button onClick={() => setIsInviteModalOpen(false)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center transition-all"><i className="fas fa-times"></i></button>
              <div>
                 <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Undang Operator</h3>
                 <p className="text-slate-400 text-sm font-medium">Buat akun untuk resepsionis atau admin operasional.</p>
              </div>
              <form onSubmit={handleAddStaff} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Operator</label>
                    <input name="name" required className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 font-bold text-slate-900 outline-none" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Akses</label>
                    <input name="email" type="email" required className="w-full bg-slate-50 border border-slate-200 rounded-3xl px-6 py-4 font-bold text-slate-900 outline-none" />
                 </div>
                 <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl">Deploy Staf Node</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
