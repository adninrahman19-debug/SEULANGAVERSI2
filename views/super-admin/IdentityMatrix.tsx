
import React, { useState, useMemo } from 'react';
import { User, UserRole, VerificationStatus } from '../../types';
import { MOCK_USERS } from '../../constants';

interface IdentityMatrixProps {
  onUpdateUser: (userId: string, data: Partial<User>) => void;
  onResetPassword: (userId: string) => void;
}

export const IdentityMatrix: React.FC<IdentityMatrixProps> = ({ onUpdateUser, onResetPassword }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'ALL'>('ALL');
  const [localUsers, setLocalUsers] = useState<User[]>(MOCK_USERS);
  const [isCreateOwnerModalOpen, setIsCreateOwnerModalOpen] = useState(false);
  const [suspendedUserIds, setSuspendedUserIds] = useState<Set<string>>(new Set());

  // Derived Data
  const filteredUsers = useMemo(() => {
    return localUsers.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = filterRole === 'ALL' || u.role === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [localUsers, searchQuery, filterRole]);

  const stats = useMemo(() => ({
    owners: localUsers.filter(u => u.role === UserRole.BUSINESS_OWNER).length,
    staff: localUsers.filter(u => u.role === UserRole.ADMIN_STAFF).length,
    guests: localUsers.filter(u => u.role === UserRole.GUEST).length,
    total: localUsers.length
  }), [localUsers]);

  // Handlers
  const handleToggleSuspend = (userId: string) => {
    const isCurrentlySuspended = suspendedUserIds.has(userId);
    const newSuspended = new Set(suspendedUserIds);
    if (isCurrentlySuspended) newSuspended.delete(userId);
    else newSuspended.add(userId);
    setSuspendedUserIds(newSuspended);
    
    const user = localUsers.find(u => u.id === userId);
    alert(`Protocol ${isCurrentlySuspended ? 'RESTORE' : 'SUSPEND'} executed for identity: ${user?.name}`);
  };

  const handleCreateOwner = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const newOwner: User = {
      id: `u-new-${Date.now()}`,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: UserRole.BUSINESS_OWNER,
      createdAt: new Date().toISOString().split('T')[0],
      avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
      verificationStatus: VerificationStatus.VERIFIED
    };
    setLocalUsers([newOwner, ...localUsers]);
    setIsCreateOwnerModalOpen(false);
    alert(`Authorized Owner identity created: ${newOwner.name}`);
  };

  const rolePermissions = [
    { module: 'Dashboard & Analytics', super: 'Full', owner: 'Business Only', staff: 'Limited', guest: 'None' },
    { module: 'Identity Management', super: 'Global', owner: 'Staff Only', staff: 'None', guest: 'Profile' },
    { module: 'Financial Treasury', super: 'Global Audit', owner: 'Full Access', staff: 'Verify Only', guest: 'Payments' },
    { module: 'System Engine', super: 'Write', owner: 'None', staff: 'None', guest: 'None' },
    { module: 'Booking Control', super: 'Oversight', owner: 'Full', staff: 'Ops Only', guest: 'Create/Cancel' },
  ];

  return (
    <div className="space-y-10 animate-fade-up">
      {/* 1. TOP LEVEL METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Platform Population', value: stats.total, icon: 'fa-users', color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Authorized Owners', value: stats.owners, icon: 'fa-user-tie', color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Operations Staff', value: stats.staff, icon: 'fa-user-gear', color: 'bg-amber-50 text-amber-600' },
          { label: 'Verified Guests', value: stats.guests, icon: 'fa-user-check', color: 'bg-rose-50 text-rose-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
             <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center mb-6 text-xl shadow-inner`}>
                <i className={`fas ${stat.icon}`}></i>
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
             <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* 2. IDENTITY REPOSITORY */}
      <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-10">
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-1">
               <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Identity Matrix Hub</h2>
               <p className="text-slate-400 text-sm font-medium uppercase tracking-widest text-[10px]">Global Control over all authenticated nodes.</p>
            </div>
            <div className="flex gap-4">
               <div className="relative">
                  <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
                  <input 
                    type="text" 
                    placeholder="Search name, email, or ID..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-14 pr-6 text-xs font-bold text-slate-700 focus:ring-4 ring-indigo-50 outline-none transition-all w-full md:w-80"
                  />
               </div>
               <button 
                onClick={() => setIsCreateOwnerModalOpen(true)}
                className="px-8 py-3.5 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all flex items-center gap-3"
               >
                 <i className="fas fa-plus"></i> Create Owner Node
               </button>
            </div>
         </div>

         {/* Filter Tabs */}
         <div className="flex bg-slate-50 p-1.5 rounded-[24px] border border-slate-100 w-fit gap-1 overflow-x-auto scrollbar-hide max-w-full">
            {['ALL', UserRole.BUSINESS_OWNER, UserRole.ADMIN_STAFF, UserRole.GUEST].map(role => (
               <button 
                 key={role}
                 onClick={() => setFilterRole(role as any)}
                 className={`px-6 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                   filterRole === role ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'
                 }`}
               >
                 {role === 'ALL' ? 'UNIVERSAL' : role.replace('_', ' ')}
               </button>
            ))}
         </div>

         <div className="overflow-x-auto rounded-[32px] border border-slate-50">
            <table className="w-full text-left">
               <thead className="bg-slate-50/50">
                  <tr>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Identity</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Auth Role</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Status</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Strategic Override</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map(u => (
                     <tr key={u.id} className={`group hover:bg-slate-50/30 transition-all ${suspendedUserIds.has(u.id) ? 'opacity-50 grayscale' : ''}`}>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-5">
                              <img src={u.avatar} className="w-14 h-14 rounded-2xl object-cover shadow-lg border-2 border-white ring-1 ring-slate-100" alt="avatar" />
                              <div>
                                 <p className="font-black text-slate-900 uppercase text-sm group-hover:text-indigo-600 transition-colors">{u.name}</p>
                                 <p className="text-[10px] font-bold text-slate-400">{u.email}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                              u.role === UserRole.SUPER_ADMIN ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                              u.role === UserRole.BUSINESS_OWNER ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              u.role === UserRole.ADMIN_STAFF ? 'bg-amber-50 text-amber-600 border-amber-100' :
                              'bg-slate-50 text-slate-500 border-slate-100'
                           }`}>{u.role.replace('_', ' ')}</span>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${suspendedUserIds.has(u.id) ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                              <span className="text-[10px] font-black text-slate-700 uppercase">{suspendedUserIds.has(u.id) ? 'Terminated' : 'Operational'}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-right space-x-2">
                           <button onClick={() => onResetPassword(u.id)} className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm" title="Reset Secret Key"><i className="fas fa-key text-xs"></i></button>
                           {u.role !== UserRole.SUPER_ADMIN && (
                             <button 
                               onClick={() => handleToggleSuspend(u.id)} 
                               className={`p-3 rounded-xl transition-all shadow-lg ${
                                 suspendedUserIds.has(u.id) ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-rose-500 text-white hover:bg-rose-600'
                               }`}
                               title={suspendedUserIds.has(u.id) ? 'Activate Node' : 'Suspend Node'}
                             >
                               <i className={`fas ${suspendedUserIds.has(u.id) ? 'fa-unlock' : 'fa-ban'} text-xs`}></i>
                             </button>
                           )}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* 3. PERMISSION MATRIX */}
      <div className="bg-slate-900 p-12 rounded-[56px] shadow-2xl text-white space-y-12 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -mr-40 -mt-40"></div>
         
         <div className="relative z-10 flex items-center justify-between border-b border-white/5 pb-10">
            <div>
               <h3 className="text-3xl font-black tracking-tighter uppercase leading-none mb-2">Authority Matrix</h3>
               <p className="text-indigo-200/40 text-[10px] font-bold uppercase tracking-widest">Global RBAC (Role-Based Access Control) Protocols</p>
            </div>
            <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-indigo-400 border border-white/10 shadow-inner">
               <i className="fas fa-shield-halved text-2xl"></i>
            </div>
         </div>

         <div className="relative z-10 overflow-x-auto rounded-[32px] border border-white/5 bg-white/5 backdrop-blur-sm">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-white/5">
                     <th className="px-12 py-8 text-[11px] font-black text-indigo-300 uppercase tracking-widest">System Module</th>
                     <th className="px-12 py-8 text-[11px] font-black text-indigo-300 uppercase tracking-widest text-center">Master Alpha</th>
                     <th className="px-12 py-8 text-[11px] font-black text-indigo-300 uppercase tracking-widest text-center">Owner Node</th>
                     <th className="px-12 py-8 text-[11px] font-black text-indigo-300 uppercase tracking-widest text-center">Staff Operator</th>
                     <th className="px-12 py-8 text-[11px] font-black text-indigo-300 uppercase tracking-widest text-center">Verified Guest</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {rolePermissions.map((row, i) => (
                     <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="px-12 py-7 font-black text-indigo-50/70 text-xs uppercase tracking-tight">{row.module}</td>
                        <td className="px-12 py-7 text-center text-[10px] font-black text-indigo-400 uppercase tracking-widest">{row.super}</td>
                        <td className="px-12 py-7 text-center text-[10px] font-black text-white/40 uppercase tracking-widest">{row.owner}</td>
                        <td className="px-12 py-7 text-center text-[10px] font-black text-white/40 uppercase tracking-widest">{row.staff}</td>
                        <td className="px-12 py-7 text-center text-[10px] font-black text-white/40 uppercase tracking-widest">{row.guest}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* CREATE OWNER MODAL */}
      {isCreateOwnerModalOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[56px] shadow-2xl p-16 space-y-12 relative overflow-hidden">
              <button onClick={() => setIsCreateOwnerModalOpen(false)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all z-10"><i className="fas fa-times"></i></button>
              
              <div>
                 <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-3">Deploy Owner</h3>
                 <p className="text-slate-400 text-sm font-medium">Initialize a new governing partner node in the ecosystem.</p>
              </div>

              <form onSubmit={handleCreateOwner} className="space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Identity Name</label>
                    <input name="name" required placeholder="Full Name" className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-5 font-bold text-slate-900 outline-none focus:ring-4 ring-indigo-50 transition-all" />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Node (Email)</label>
                    <input name="email" type="email" required placeholder="owner@entity.com" className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-5 font-bold text-slate-900 outline-none focus:ring-4 ring-indigo-50 transition-all" />
                 </div>
                 
                 <div className="p-8 bg-indigo-50 rounded-[40px] border border-indigo-100">
                    <p className="text-center font-mono text-[10px] font-black text-indigo-400 uppercase tracking-widest">Temporal authorization token will be dispatched via secure email channel.</p>
                 </div>

                 <button type="submit" className="w-full py-6 bg-slate-950 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all">Authorize Identity Creation</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
