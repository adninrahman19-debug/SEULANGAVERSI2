
import React, { useState, useMemo } from 'react';
/* Added UserRole to imports */
import { Business, User, Transaction, BusinessStatus, SubscriptionPlan, BusinessCategory, AuditLog, UserRole } from '../../types';
import { MOCK_AUDIT_LOGS, MOCK_USERS, MOCK_TRANSACTIONS } from '../../constants';

interface TenantGovernanceProps {
  businesses: Business[];
  onUpdateStatus: (id: string, status: BusinessStatus) => void;
  onTerminate: (id: string) => void;
  onUpdateCategory: (id: string, category: string) => void;
  onAddBusiness: (data: any) => void;
}

export const TenantGovernance: React.FC<TenantGovernanceProps> = ({ 
  businesses, onUpdateStatus, onTerminate, onUpdateCategory, onAddBusiness 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [inspectingBizId, setInspectingBizId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Derived Data
  const filteredBiz = useMemo(() => {
    return businesses.filter(b => {
      const matchSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === 'ALL' || b.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [businesses, searchQuery, filterStatus]);

  const inspectedBiz = useMemo(() => businesses.find(b => b.id === inspectingBizId), [businesses, inspectingBizId]);
  const bizOwner = useMemo(() => MOCK_USERS.find(u => u.id === inspectedBiz?.ownerId), [inspectedBiz]);
  const bizAuditLogs = useMemo(() => MOCK_AUDIT_LOGS.filter(log => log.target === inspectedBiz?.name), [inspectedBiz]);
  const bizRevenue = useMemo(() => 
    MOCK_TRANSACTIONS
      .filter(tx => tx.businessId === inspectingBizId && tx.status === 'completed')
      .reduce((sum, tx) => sum + tx.amount, 0),
    [inspectingBizId]
  );

  return (
    <div className="space-y-10 animate-fade-up">
      {/* 1. HEADER & GLOBAL ACTIONS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
         <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Registry Hub (Tenant Management)</h2>
            <p className="text-slate-400 text-sm font-medium">Otoritas pusat untuk validasi entitas, kontrol lisensi, dan manajemen kepatuhan mitra.</p>
         </div>
         <button 
           onClick={() => setIsAddModalOpen(true)}
           className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-3"
         >
            <i className="fas fa-plus"></i> Tambah Bisnis Manual
         </button>
      </div>

      {/* 2. FILTERS & REGISTRY LIST */}
      <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
         <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
            <div className="relative w-full md:w-[450px]">
               <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"></i>
               <input 
                 type="text" 
                 placeholder="Cari ID Node, Nama Bisnis, atau Legal Entity..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-slate-50 border border-slate-200 rounded-3xl py-5 pl-16 pr-8 text-sm font-bold outline-none focus:ring-4 ring-indigo-50 transition-all"
               />
            </div>
            <div className="flex bg-slate-50 p-1.5 rounded-[24px] border border-slate-100 gap-1 overflow-x-auto scrollbar-hide w-full md:w-auto">
               {['ALL', 'pending', 'active', 'suspended'].map(status => (
                  <button 
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-6 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      filterStatus === status ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {status}
                  </button>
               ))}
            </div>
         </div>

         <div className="overflow-x-auto rounded-[32px] border border-slate-50">
            <table className="w-full text-left border-collapse">
               <thead className="bg-slate-50/50">
                  <tr>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identitas Node</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Topology</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">SLA Status</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi Strategis</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredBiz.map(biz => (
                     <tr key={biz.id} className="hover:bg-slate-50/30 transition-all group">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-5">
                              <img src={biz.images[0]} className="w-14 h-14 rounded-2xl object-cover shadow-lg border-2 border-white ring-1 ring-slate-100" />
                              <div>
                                 <p className="font-black text-slate-900 uppercase text-sm group-hover:text-indigo-600 transition-colors">{biz.name}</p>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {biz.id}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className="px-4 py-1.5 bg-slate-50 text-slate-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-100">{biz.category}</span>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                              biz.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              biz.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                              'bg-rose-50 text-rose-600 border-rose-100'
                           }`}>{biz.status === 'active' ? 'Operational' : biz.status.toUpperCase()}</span>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${biz.subscription === 'Premium' ? 'bg-indigo-500 shadow-[0_0_8px_#6366f1]' : 'bg-slate-300'}`}></div>
                              <span className="text-xs font-black text-slate-700 uppercase">{biz.subscription}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-right space-x-2">
                           <button onClick={() => setInspectingBizId(biz.id)} className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm hover:shadow-md"><i className="fas fa-eye text-xs"></i></button>
                           {biz.status === 'pending' && (
                              <>
                                 <button onClick={() => onUpdateStatus(biz.id, 'active')} className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg hover:bg-emerald-600 transition-all" title="Approve"><i className="fas fa-check"></i></button>
                                 <button onClick={() => onUpdateStatus(biz.id, 'rejected')} className="p-3 bg-rose-500 text-white rounded-xl shadow-lg hover:bg-rose-600 transition-all" title="Reject"><i className="fas fa-times"></i></button>
                              </>
                           )}
                           {biz.status === 'active' && (
                              <button onClick={() => onUpdateStatus(biz.id, 'suspended')} className="p-3 bg-amber-500 text-white rounded-xl shadow-lg hover:bg-amber-600 transition-all" title="Suspend"><i className="fas fa-ban"></i></button>
                           )}
                           <button onClick={() => onTerminate(biz.id)} className="p-3 bg-slate-100 text-slate-400 hover:bg-rose-600 hover:text-white rounded-xl transition-all" title="Terminate"><i className="fas fa-trash-can text-xs"></i></button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* 3. DEEP INSPECTION SIDEBAR / MODAL */}
      {inspectingBizId && inspectedBiz && (
         <div className="fixed inset-0 z-[200] flex items-center justify-end bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-5xl h-screen shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
               <header className="p-12 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-8">
                     <img src={inspectedBiz.images[0]} className="w-24 h-24 rounded-3xl object-cover shadow-2xl ring-8 ring-white" alt="logo" />
                     <div>
                        <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-2">{inspectedBiz.name}</h3>
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] flex items-center gap-3">
                           <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
                           Deep-Dive Asset Matrix
                        </p>
                     </div>
                  </div>
                  <button onClick={() => setInspectingBizId(null)} className="w-14 h-14 bg-white text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all shadow-xl"><i className="fas fa-times text-2xl"></i></button>
               </header>

               <main className="flex-1 overflow-y-auto p-16 space-y-16 scrollbar-hide">
                  <div className="grid grid-cols-3 gap-8">
                     {/* Owner Identity */}
                     <div className="p-10 bg-slate-50 rounded-[48px] border border-slate-100 space-y-8">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Owner Identity</h4>
                        {bizOwner ? (
                          <div className="flex items-center gap-6">
                             <img src={bizOwner.avatar} className="w-16 h-16 rounded-[24px] object-cover shadow-lg ring-4 ring-white" />
                             <div>
                                <p className="font-black text-slate-900 text-lg uppercase tracking-tight">{bizOwner.name}</p>
                                <p className="text-xs font-bold text-slate-500 mb-2">{bizOwner.email}</p>
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase rounded-lg border border-emerald-100">Verified ID</span>
                             </div>
                          </div>
                        ) : <p className="text-xs text-rose-500 font-black uppercase">Owner Hub Disconnected</p>}
                     </div>

                     {/* Monetization Node */}
                     <div className="p-10 bg-indigo-600 rounded-[48px] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        <div>
                           <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.3em] mb-10">Economic Pulse</p>
                           <p className="text-5xl font-black tracking-tighter leading-none mb-2">Rp {(bizRevenue / 1000000).toFixed(1)}M</p>
                           <p className="text-[10px] font-bold text-indigo-100/50 uppercase tracking-widest">LTD Net Platform Revenue</p>
                        </div>
                        <div className="flex justify-between items-center pt-8 border-t border-white/10">
                           <span className="text-[10px] font-black uppercase">Plan: {inspectedBiz.subscription}</span>
                           <i className="fas fa-gem text-indigo-200"></i>
                        </div>
                     </div>

                     {/* Ruleset & Taxonomy */}
                     <div className="p-10 bg-white border border-slate-100 rounded-[48px] shadow-sm space-y-8">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Governance Protocol</h4>
                        <div className="space-y-6">
                           <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Change Topology</p>
                              <select 
                                value={inspectedBiz.category}
                                onChange={(e) => onUpdateCategory(inspectedBiz.id, e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-black uppercase outline-none focus:ring-4 ring-indigo-50"
                              >
                                 {Object.values(BusinessCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                              </select>
                           </div>
                           <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Comm Rate:</span>
                              <span className="text-sm font-black text-indigo-600">{inspectedBiz.commissionRate}%</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Audit Trail Section */}
                  <div className="bg-white rounded-[56px] border border-slate-100 shadow-sm overflow-hidden">
                     <div className="p-10 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Forensic Activity Audit</h4>
                        <i className="fas fa-fingerprint text-indigo-200 text-xl"></i>
                     </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead>
                              <tr className="bg-slate-50/30">
                                 <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Action</th>
                                 <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actor</th>
                                 <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Temporal Node</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-50 font-mono text-[11px]">
                              {bizAuditLogs.map(log => (
                                 <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-10 py-5">
                                       <p className="font-black text-slate-700 uppercase">{log.action}</p>
                                    </td>
                                    <td className="px-10 py-5 text-indigo-600 font-bold uppercase">{log.actorName}</td>
                                    <td className="px-10 py-5 text-slate-400 uppercase">{log.timestamp}</td>
                                 </tr>
                              ))}
                              {bizAuditLogs.length === 0 && (
                                 <tr><td colSpan={3} className="px-10 py-10 text-center text-slate-300 uppercase font-black italic">No forensic threads recorded for this node</td></tr>
                              )}
                           </tbody>
                        </table>
                     </div>
                  </div>

                  {/* Strategic Governance Override */}
                  <div className="p-12 bg-slate-950 rounded-[64px] text-white space-y-10 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
                     <h4 className="text-2xl font-black tracking-tight uppercase border-b border-white/5 pb-8 relative z-10 flex items-center gap-4">
                        <i className="fas fa-shield-halved text-rose-500"></i>
                        Strategic Sovereign Override
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        <button className="py-6 bg-white/5 border border-white/10 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex flex-col items-center gap-3">
                           <i className="fas fa-file-invoice-dollar text-indigo-400"></i>
                           Reset Financial Index
                        </button>
                        <button className="py-6 bg-white/5 border border-white/10 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex flex-col items-center gap-3">
                           <i className="fas fa-key text-amber-400"></i>
                           Force Re-authentication
                        </button>
                        <button className="py-6 bg-rose-600/20 border border-rose-500/30 text-rose-500 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-rose-600 hover:text-white transition-all flex flex-col items-center gap-3 shadow-2xl">
                           <i className="fas fa-skull-crossbones"></i>
                           Emergency Purge Node
                        </button>
                     </div>
                  </div>
               </main>
            </div>
         </div>
      )}

      {/* 4. ADD MANUAL BUSINESS MODAL */}
      {isAddModalOpen && (
         <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-[56px] shadow-2xl p-16 space-y-12 relative overflow-hidden">
               <button onClick={() => setIsAddModalOpen(false)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all z-10"><i className="fas fa-times"></i></button>
               <div>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-3">Add Manual Node</h3>
                  <p className="text-slate-400 text-sm font-medium">Inject a new business entity directly into the SEULANGA ecosystem.</p>
               </div>
               <form onSubmit={(e) => { e.preventDefault(); alert('Manual Node Integration Initialized.'); setIsAddModalOpen(false); }} className="space-y-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Entity Identity Name</label>
                     <input required placeholder="E.g. Sapphire Suites Hotel" className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-5 font-bold text-slate-900 outline-none focus:ring-4 ring-indigo-50 transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Topology Node</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-6 py-5 font-bold text-slate-900 outline-none">
                           {Object.values(BusinessCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign Owner Hub</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-6 py-5 font-bold text-slate-900 outline-none">
                           {/* Using UserRole here requires it to be imported */}
                           {MOCK_USERS.filter(u => u.role === UserRole.BUSINESS_OWNER).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                     </div>
                  </div>
                  <button type="submit" className="w-full py-6 bg-slate-950 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all">Authorize Node Creation</button>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};
