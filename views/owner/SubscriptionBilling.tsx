
import React, { useState, useMemo } from 'react';
import { Business, SubscriptionPlan, Transaction } from '../../types';
import { MOCK_TRANSACTIONS } from '../../constants';

interface SubscriptionBillingProps {
  business: Business;
  onUpdateBusiness: (data: Partial<Business>) => void;
}

export const SubscriptionBilling: React.FC<SubscriptionBillingProps> = ({ business, onUpdateBusiness }) => {
  const [isUpgradeLoading, setIsUpgradeLoading] = useState<string | null>(null);

  // 1. FILTER INVOICES (Subscription Only)
  const billingHistory = useMemo(() => {
    return MOCK_TRANSACTIONS.filter(t => t.businessId === business.id && t.type === 'subscription')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [business.id]);

  // 2. LIMIT CALCULATIONS
  const limits = useMemo(() => {
    const config = {
      [SubscriptionPlan.BASIC]: { units: 10, staff: 1, analytics: 'Basic', ai: false },
      [SubscriptionPlan.PRO]: { units: 50, staff: 10, analytics: 'Advanced', ai: true },
      [SubscriptionPlan.PREMIUM]: { units: 999, staff: 99, analytics: 'Enterprise', ai: true },
    };
    return config[business.subscription as SubscriptionPlan] || config[SubscriptionPlan.BASIC];
  }, [business.subscription]);

  // 3. HANDLERS
  const handlePlanTransition = async (plan: SubscriptionPlan) => {
    if (plan === business.subscription) return;
    
    setIsUpgradeLoading(plan);
    // Simulate payment protocol sync
    await new Promise(r => setTimeout(r, 2000));
    
    onUpdateBusiness({ 
      subscription: plan,
      subscriptionExpiry: '2025-12-31' // Simulated renewal
    });
    
    setIsUpgradeLoading(null);
    alert(`Protocol Transition: Node bisnis Anda telah ditingkatkan ke tier ${plan}. Transaksi tercatat di platform ledger.`);
  };

  return (
    <div className="space-y-12 animate-fade-up">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">Subscription & Billing</h2>
           <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-2">Otorisasi lisensi platform dan manajemen kapasitas operasional.</p>
        </div>
      </div>

      {/* 1. CURRENT ACTIVE NODE STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 bg-slate-950 p-12 rounded-[56px] shadow-2xl text-white relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
            <div className="relative z-10">
               <div className="flex justify-between items-start mb-12">
                  <div>
                     <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-400/30">Active License</span>
                     <h3 className="text-6xl font-black tracking-tighter mt-6 uppercase italic">{business.subscription} Node</h3>
                  </div>
                  <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center text-indigo-400 shadow-inner">
                     <i className="fas fa-gem text-2xl"></i>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-10 border-t border-white/10 pt-10">
                  <div>
                     <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2">Registry Expiry</p>
                     <p className="text-xl font-black text-white">{business.subscriptionExpiry || '2024-12-31'}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2">Cycle Status</p>
                     <p className="text-xl font-black text-emerald-400 uppercase tracking-tight">Verified & Operational</p>
                  </div>
               </div>
            </div>
            <button className="mt-12 w-full py-5 bg-white text-slate-950 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-400 hover:text-white transition-all active:scale-95 relative z-10">
               Extend Current Protocol
            </button>
         </div>

         {/* RESOURCE MATRIX (QUOTAS) */}
         <div className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-sm space-y-10">
            <h3 className="text-xl font-black text-slate-900 uppercase italic">Resource Matrix</h3>
            <div className="space-y-8">
               <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                     <span className="text-slate-400">Unit Capacity</span>
                     <span className="text-indigo-600">8 / {limits.units} Nodes</span>
                  </div>
                  <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                     <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${(8 / limits.units) * 100}%` }}></div>
                  </div>
               </div>
               <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                     <span className="text-slate-400">Staff Identity Nodes</span>
                     <span className="text-indigo-600">3 / {limits.staff} Slots</span>
                  </div>
                  <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                     <div className="h-full bg-indigo-400 rounded-full transition-all duration-1000" style={{ width: `${(3 / limits.staff) * 100}%` }}></div>
                  </div>
               </div>
               <div className="pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl text-center">
                     <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Intelligence</p>
                     <p className="text-xs font-black text-slate-700 uppercase">{limits.analytics}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl text-center">
                     <p className="text-[8px] font-black text-slate-400 uppercase mb-1">AI Engine</p>
                     <p className={`text-xs font-black uppercase ${limits.ai ? 'text-emerald-500' : 'text-slate-300'}`}>{limits.ai ? 'ACTIVE' : 'LOCKED'}</p>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* 2. PLAN TRANSITION HUB */}
      <div className="space-y-10">
         <div className="text-center max-w-2xl mx-auto space-y-4">
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Scale Your Infrastructure</h3>
            <p className="text-slate-400 font-medium">Beralih antar tier layanan untuk membuka otoritas modul yang lebih luas.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
               { id: SubscriptionPlan.BASIC, price: '0', icon: 'fa-leaf', color: 'text-emerald-500', bg: 'bg-emerald-50', desc: 'Sesuai untuk properti rintisan.' },
               { id: SubscriptionPlan.PRO, price: '499K', icon: 'fa-rocket', color: 'text-indigo-500', bg: 'bg-indigo-50', desc: 'Pertumbuhan agresif & tim dinamis.' },
               { id: SubscriptionPlan.PREMIUM, price: '1.2M', icon: 'fa-crown', color: 'text-amber-500', bg: 'bg-amber-50', desc: 'Operasional absolut tanpa batas.' },
            ].map(plan => {
               const isActive = business.subscription === plan.id;
               return (
                  <div key={plan.id} className={`p-10 rounded-[56px] border transition-all duration-500 flex flex-col justify-between group ${
                     isActive ? 'bg-white border-indigo-600 shadow-2xl scale-[1.05]' : 'bg-white border-slate-100 hover:border-indigo-200'
                  }`}>
                     <div className="space-y-8">
                        <div className="flex justify-between items-center">
                           <div className={`w-14 h-14 rounded-3xl flex items-center justify-center text-xl shadow-inner ${plan.bg} ${plan.color}`}>
                              <i className={`fas ${plan.icon}`}></i>
                           </div>
                           {isActive && <span className="px-3 py-1 bg-indigo-600 text-white text-[8px] font-black uppercase rounded-lg tracking-[0.2em] shadow-lg">Current Node</span>}
                        </div>
                        <div>
                           <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{plan.id}</h4>
                           <div className="flex items-baseline gap-1 mt-2">
                              <span className="text-xs font-bold text-slate-300 uppercase">Rp</span>
                              <span className="text-4xl font-black text-slate-900 tracking-tighter">{plan.price}</span>
                              <span className="text-xs font-bold text-slate-300 uppercase">/bln</span>
                           </div>
                           <p className="text-xs text-slate-400 font-medium leading-relaxed mt-4">{plan.desc}</p>
                        </div>
                        <div className="space-y-4 pt-6 border-t border-slate-50">
                           <div className="flex items-center gap-3">
                              <i className="fas fa-check text-indigo-500 text-[10px]"></i>
                              <span className="text-[10px] font-bold text-slate-600 uppercase">{plan.id === 'Premium' ? 'Unlimited' : plan.id === 'Pro' ? '50' : '10'} Unit Asset</span>
                           </div>
                           <div className="flex items-center gap-3">
                              <i className="fas fa-check text-indigo-500 text-[10px]"></i>
                              <span className="text-[10px] font-bold text-slate-600 uppercase">{plan.id === 'Premium' ? 'Priority' : 'Standard'} Marketplace Rank</span>
                           </div>
                        </div>
                     </div>
                     
                     <button 
                        disabled={isActive || !!isUpgradeLoading}
                        onClick={() => handlePlanTransition(plan.id)}
                        className={`mt-10 w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                           isActive 
                              ? 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100' 
                              : isUpgradeLoading === plan.id
                                 ? 'bg-indigo-600 text-white animate-pulse'
                                 : 'bg-slate-950 text-white hover:bg-indigo-600 shadow-xl'
                        }`}
                     >
                        {isActive ? 'Aktif' : isUpgradeLoading === plan.id ? 'Syncing...' : 'Pilih Protokol Ini'}
                     </button>
                  </div>
               );
            })}
         </div>
      </div>

      {/* 3. BILLING LEDGER */}
      <div className="bg-white p-10 rounded-[56px] border border-slate-100 shadow-sm space-y-10">
         <div className="flex items-center justify-between px-4">
            <div>
               <h3 className="text-2xl font-black text-slate-900 uppercase">Billing Registry</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Audit trail seluruh transaksi langganan platform.</p>
            </div>
            <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner"><i className="fas fa-file-invoice-dollar"></i></div>
         </div>

         <div className="overflow-x-auto rounded-[32px] border border-slate-50">
            <table className="w-full text-left">
               <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Temporal node</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Serial Number</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan Node</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Economic Value</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Audit Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {billingHistory.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/30 transition-all">
                       <td className="px-10 py-7 text-xs font-bold text-slate-500 uppercase">{tx.createdAt}</td>
                       <td className="px-10 py-7 font-mono text-[11px] font-black text-slate-400 tracking-tighter">#{tx.id.toUpperCase()}</td>
                       <td className="px-10 py-7">
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[9px] font-black uppercase rounded-lg border border-slate-200">Subscription Fee</span>
                       </td>
                       <td className="px-10 py-7 text-center">
                          <p className="text-sm font-black text-slate-900">Rp {tx.amount.toLocaleString()}</p>
                       </td>
                       <td className="px-10 py-7 text-right">
                          <div className="flex justify-end items-center gap-4">
                             <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                tx.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                             }`}>{tx.status}</span>
                             <button className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm"><i className="fas fa-file-pdf text-xs"></i></button>
                          </div>
                       </td>
                    </tr>
                  ))}
                  {billingHistory.length === 0 && (
                     <tr>
                        <td colSpan={5} className="py-32 text-center text-slate-200 font-black uppercase text-[11px] tracking-[0.4em] italic">No transaction records found in ledger.</td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      <div className="p-10 bg-indigo-50 rounded-[48px] border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-6">
            <i className="fas fa-shield-halved text-indigo-600 text-2xl animate-pulse"></i>
            <div>
               <p className="text-sm font-black text-indigo-900 uppercase">Seulanga Secure Billing Protocol Active</p>
               <p className="text-[10px] font-medium text-indigo-600 uppercase tracking-widest mt-1">PCI-DSS Compliant • Encrypted Transaction Nodes</p>
            </div>
         </div>
         <button className="px-8 py-3 bg-white border border-indigo-200 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Hubungi Treasury Hub</button>
      </div>
    </div>
  );
};
