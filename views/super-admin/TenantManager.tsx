
import React, { useState, useMemo } from 'react';
import { Business, User, Transaction, BusinessStatus, BusinessCategory, SubscriptionPlan } from '../../types';

interface TenantManagerProps {
  businesses: Business[];
  onUpdateStatus: (id: string, status: BusinessStatus) => void;
  onTerminate: (id: string) => void;
  users: User[];
  transactions: Transaction[];
}

export const TenantManager: React.FC<TenantManagerProps> = ({ businesses, onUpdateStatus, onTerminate, users, transactions }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectingBizId, setInspectingBizId] = useState<string | null>(null);

  const filteredBiz = useMemo(() => 
    businesses.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.id.toLowerCase().includes(searchQuery.toLowerCase())),
    [businesses, searchQuery]
  );

  const inspectedBiz = businesses.find(b => b.id === inspectingBizId);
  const bizOwner = users.find(u => u.id === inspectedBiz?.ownerId);
  const bizRevenue = transactions
    .filter(tx => tx.businessId === inspectingBizId && tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="space-y-10 animate-fade-up">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
         <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Business Hub (Tenant)</h2>
            <p className="text-slate-400 text-sm font-medium">Global command hub for authorized business entities.</p>
         </div>
      </div>

      <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
         <div className="relative w-full md:w-[400px]">
            <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Search node name or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none focus:ring-4 ring-indigo-50"
            />
         </div>

         <div className="overflow-x-auto rounded-[32px] border border-slate-50">
            <table className="w-full text-left">
               <thead className="bg-slate-50/50">
                  <tr>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredBiz.map(biz => (
                     <tr key={biz.id} className="hover:bg-slate-50/30 transition-all group">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-5">
                              <img src={biz.images[0]} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt={biz.name} />
                              <div>
                                 <p className="font-black text-slate-900 uppercase text-xs">{biz.name}</p>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase">{biz.category} • ID: {biz.id}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border ${
                              biz.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              biz.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                              'bg-rose-50 text-rose-600 border-rose-100'
                           }`}>{biz.status}</span>
                        </td>
                        <td className="px-8 py-6 text-xs font-black text-slate-700 uppercase">{biz.subscription}</td>
                        <td className="px-8 py-6 text-right space-x-2">
                           <button onClick={() => setInspectingBizId(biz.id)} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm"><i className="fas fa-eye text-xs"></i></button>
                           {biz.status === 'pending' && <button onClick={() => onUpdateStatus(biz.id, 'active')} className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg"><i className="fas fa-check text-xs"></i></button>}
                           {biz.status === 'active' && <button onClick={() => onUpdateStatus(biz.id, 'suspended')} className="p-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all shadow-lg"><i className="fas fa-ban text-xs"></i></button>}
                           <button onClick={() => onTerminate(biz.id)} className="p-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all shadow-lg"><i className="fas fa-trash-can text-xs"></i></button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {inspectingBizId && inspectedBiz && (
         <div className="fixed inset-0 z-[200] flex items-center justify-end bg-slate-950/80 backdrop-blur-md">
            <div className="bg-white w-full max-w-4xl h-screen shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
               <header className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-6">
                     <img src={inspectedBiz.images[0]} className="w-16 h-16 rounded-3xl object-cover shadow-xl" alt="logo" />
                     <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{inspectedBiz.name}</h3>
                  </div>
                  <button onClick={() => setInspectingBizId(null)} className="w-12 h-12 bg-white text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all shadow-sm"><i className="fas fa-times text-xl"></i></button>
               </header>
               <main className="flex-1 overflow-y-auto p-12 space-y-12">
                  <div className="grid grid-cols-2 gap-8">
                     <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Owner Node</h4>
                        {bizOwner ? (
                          <div className="flex items-center gap-5">
                             <img src={bizOwner.avatar} className="w-14 h-14 rounded-2xl object-cover" />
                             <div><p className="font-black text-slate-900 text-sm uppercase">{bizOwner.name}</p><p className="text-xs font-bold text-slate-500">{bizOwner.email}</p></div>
                          </div>
                        ) : <p className="text-xs text-rose-500 font-black uppercase">Identity Desynchronized</p>}
                     </div>
                     <div className="p-8 bg-indigo-600 rounded-[40px] text-white shadow-xl">
                        <h4 className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-6">Treasury Performance</h4>
                        <p className="text-4xl font-black tracking-tighter">Rp {bizRevenue.toLocaleString()}</p>
                        <p className="text-[10px] font-bold text-indigo-200/60 mt-2 uppercase tracking-widest">Total GTV Cleared</p>
                     </div>
                  </div>
               </main>
            </div>
         </div>
      )}
    </div>
  );
};
