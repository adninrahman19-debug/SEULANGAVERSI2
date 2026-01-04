
import React, { useState, useMemo } from 'react';
import { Business, User, Transaction, BusinessStatus, SubscriptionPlan } from '../../types';

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
  const bizTransactions = transactions.filter(tx => tx.businessId === inspectingBizId);
  const bizRevenue = bizTransactions
    .filter(tx => tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="space-y-10 animate-fade-up">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
         <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Tenant Governance (Business Hub)</h2>
            <p className="text-slate-400 text-sm font-medium">Verify legal credentials, monitor platform GTV contribution, and enforce ecosystem rules.</p>
         </div>
         <div className="flex gap-4">
            <button className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all flex items-center gap-3">
               <i className="fas fa-file-contract text-indigo-500"></i> Export Registry
            </button>
         </div>
      </div>

      <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
         <div className="relative w-full md:w-[450px]">
            <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"></i>
            <input 
              type="text" 
              placeholder="Search entity node, legal name or tax ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-3xl py-5 pl-16 pr-8 text-sm font-bold outline-none focus:ring-4 ring-indigo-50 transition-all"
            />
         </div>

         <div className="overflow-x-auto rounded-[32px] border border-slate-50">
            <table className="w-full text-left">
               <thead className="bg-slate-50/50">
                  <tr>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity Identity</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">SLA Status</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan Node</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Otoritas</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredBiz.map(biz => (
                     <tr key={biz.id} className="hover:bg-slate-50/30 transition-all group">
                        <td className="px-10 py-8">
                           <div className="flex items-center gap-6">
                              <img src={biz.images[0]} className="w-16 h-16 rounded-2xl object-cover shadow-xl ring-4 ring-white" alt={biz.name} />
                              <div>
                                 <p className="font-black text-slate-900 uppercase text-sm group-hover:text-indigo-600 transition-colors">{biz.name}</p>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{biz.category} • KYC: Verified</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-10 py-8">
                           <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                              biz.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              biz.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                              'bg-rose-50 text-rose-600 border-rose-100'
                           }`}>{biz.status === 'active' ? 'Operational' : biz.status.toUpperCase()}</span>
                        </td>
                        <td className="px-10 py-8">
                           <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${biz.subscription === 'Premium' ? 'bg-indigo-500' : 'bg-slate-400'}`}></div>
                              <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{biz.subscription}</span>
                           </div>
                        </td>
                        <td className="px-10 py-8 text-right space-x-2">
                           <button onClick={() => setInspectingBizId(biz.id)} className="p-3.5 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm hover:shadow-md"><i className="fas fa-eye text-xs"></i></button>
                           {biz.status === 'pending' && <button onClick={() => onUpdateStatus(biz.id, 'active')} className="p-3.5 bg-emerald-500 text-white rounded-xl shadow-lg hover:bg-emerald-600 transition-all"><i className="fas fa-check"></i></button>}
                           {biz.status === 'active' && <button onClick={() => onUpdateStatus(biz.id, 'suspended')} className="p-3.5 bg-amber-500 text-white rounded-xl shadow-lg hover:bg-amber-600 transition-all"><i className="fas fa-ban"></i></button>}
                           <button onClick={() => onTerminate(biz.id)} className="p-3.5 bg-rose-500 text-white rounded-xl shadow-lg hover:bg-rose-600 transition-all"><i className="fas fa-trash-can text-xs"></i></button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {inspectingBizId && inspectedBiz && (
         <div className="fixed inset-0 z-[200] flex items-center justify-end bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl h-screen shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
               <header className="p-12 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-8">
                     <img src={inspectedBiz.images[0]} className="w-20 h-20 rounded-3xl object-cover shadow-2xl ring-8 ring-white" alt="logo" />
                     <div>
                        <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">{inspectedBiz.name}</h3>
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mt-2">Strategic Entity Profile</p>
                     </div>
                  </div>
                  <button onClick={() => setInspectingBizId(null)} className="w-14 h-14 bg-white text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all shadow-xl"><i className="fas fa-times text-2xl"></i></button>
               </header>
               <main className="flex-1 overflow-y-auto p-16 space-y-16 scrollbar-hide">
                  <div className="grid grid-cols-2 gap-10">
                     <div className="p-10 bg-slate-50 rounded-[48px] border border-slate-100 space-y-8">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Authorized Owner Node</h4>
                        {bizOwner ? (
                          <div className="flex items-center gap-6">
                             <img src={bizOwner.avatar} className="w-20 h-20 rounded-3xl object-cover shadow-lg" />
                             <div>
                                <p className="font-black text-slate-900 text-lg uppercase tracking-tight">{bizOwner.name}</p>
                                <p className="text-xs font-bold text-slate-500">{bizOwner.email}</p>
                                <p className="text-[9px] font-black text-emerald-500 uppercase mt-2 italic">Identity Verified</p>
                             </div>
                          </div>
                        ) : <p className="text-xs text-rose-500 font-black uppercase">Identity Link Broken</p>}
                     </div>
                     <div className="p-10 bg-indigo-600 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                        <h4 className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.3em] mb-10">Treasury Performance</h4>
                        <p className="text-5xl font-black tracking-tighter">Rp {bizRevenue.toLocaleString()}</p>
                        <p className="text-[10px] font-bold text-indigo-100/40 mt-4 uppercase tracking-widest">Total Cleared Marketplace GTV</p>
                     </div>
                  </div>

                  <div className="space-y-8">
                     <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Ecosystem Ruleset</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 bg-white border border-slate-100 rounded-[32px] space-y-4">
                           <div className="flex items-center gap-3">
                              <i className="fas fa-percent text-indigo-500 text-sm"></i>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Commission Override</p>
                           </div>
                           <p className="text-2xl font-black text-slate-900">{inspectedBiz.commissionRate || '10'}% <span className="text-[10px] text-slate-400">(Default)</span></p>
                        </div>
                        <div className="p-8 bg-white border border-slate-100 rounded-[32px] space-y-4">
                           <div className="flex items-center gap-3">
                              <i className="fas fa-shield-virus text-rose-500 text-sm"></i>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Level</p>
                           </div>
                           <p className="text-2xl font-black text-emerald-500 uppercase tracking-tighter">LOW RISK</p>
                        </div>
                     </div>
                  </div>

                  <div className="p-10 bg-slate-950 rounded-[56px] text-white space-y-8">
                     <h4 className="text-xl font-black tracking-tight uppercase border-b border-white/5 pb-6">Strategic Governance Override</h4>
                     <div className="grid grid-cols-2 gap-6">
                        <button className="py-5 bg-white/5 border border-white/10 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all">Audit Global Logs</button>
                        <button className="py-5 bg-white/5 border border-white/10 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all">Reset Marketplace Index</button>
                        <button className="py-5 bg-rose-600 text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-rose-700 transition-all">Emergency Suspension</button>
                        <button className="py-5 bg-indigo-600 text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-700 transition-all">Elevate to Featured Node</button>
                     </div>
                  </div>
               </main>
            </div>
         </div>
      )}
    </div>
  );
};
