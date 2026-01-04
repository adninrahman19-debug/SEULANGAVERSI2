
import React, { useState, useMemo } from 'react';
import { Business, SubscriptionPlan, Transaction, BusinessStatus } from '../../types';
import { MOCK_BUSINESSES, MOCK_TRANSACTIONS } from '../../constants';

interface BillingMatrixProps {
  businesses: Business[];
  onUpdateBusiness: (id: string, data: Partial<Business>) => void;
}

export const BillingMatrix: React.FC<BillingMatrixProps> = ({ businesses, onUpdateBusiness }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState<SubscriptionPlan | 'ALL'>('ALL');
  const [selectedBizId, setSelectedBizId] = useState<string | null>(null);

  // Derived Data
  const filteredBiz = useMemo(() => {
    return businesses.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) || b.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlan = filterPlan === 'ALL' || b.subscription === filterPlan;
      return matchesSearch && matchesPlan;
    });
  }, [businesses, searchQuery, filterPlan]);

  const billingStats = useMemo(() => {
    const expiringSoon = businesses.filter(b => {
      if (!b.subscriptionExpiry) return false;
      const days = Math.ceil((new Date(b.subscriptionExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return days > 0 && days <= 7;
    }).length;

    return {
      activeSubs: businesses.filter(b => b.status === 'active').length,
      expiringSoon,
      trials: businesses.filter(b => b.isTrial).length,
      monthlyRevenue: MOCK_TRANSACTIONS.filter(t => t.type === 'subscription').reduce((sum, t) => sum + t.amount, 0)
    };
  }, [businesses]);

  const handlePlanChange = (bizId: string, plan: SubscriptionPlan) => {
    onUpdateBusiness(bizId, { 
      subscription: plan,
      isTrial: false,
      subscriptionExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
    });
    alert(`Protocol: Node ${bizId} transitioned to ${plan} tier. Cycle initialized.`);
    setSelectedBizId(null);
  };

  const handleToggleTrial = (bizId: string) => {
    const biz = businesses.find(b => b.id === bizId);
    onUpdateBusiness(bizId, { isTrial: !biz?.isTrial });
    alert(`Trial node state toggled for ${biz?.name}.`);
  };

  return (
    <div className="space-y-10 animate-fade-up">
      {/* 1. TREASURY SNAPSHOT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Subscriptions', value: billingStats.activeSubs, icon: 'fa-gem', color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Revenue Axis (MRR)', value: `Rp ${(billingStats.monthlyRevenue / 1000000).toFixed(1)}M`, icon: 'fa-chart-line', color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Expiring Nodes (7d)', value: billingStats.expiringSoon, icon: 'fa-calendar-exclamation', color: 'bg-rose-50 text-rose-600', alert: billingStats.expiringSoon > 0 },
          { label: 'Trial Pipelines', value: billingStats.trials, icon: 'fa-flask', color: 'bg-amber-50 text-amber-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
            {stat.alert && <div className="absolute inset-0 bg-rose-500/5 animate-pulse"></div>}
            <div className="relative z-10">
               <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center mb-6 text-xl shadow-inner`}>
                  <i className={`fas ${stat.icon}`}></i>
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
               <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* 2. SUBSCRIPTION LEDGER */}
      <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-10">
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-1">
               <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Subscription Matrix</h2>
               <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">Global lifecycle control for all business tiers.</p>
            </div>
            <div className="flex gap-4">
               <div className="relative">
                  <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
                  <input 
                    type="text" 
                    placeholder="Search node ID or business name..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-14 pr-6 text-xs font-bold text-slate-700 focus:ring-4 ring-indigo-50 outline-none transition-all w-full md:w-80"
                  />
               </div>
               <select 
                 value={filterPlan}
                 onChange={(e) => setFilterPlan(e.target.value as any)}
                 className="bg-slate-50 border border-slate-200 rounded-2xl px-6 py-3.5 text-[10px] font-black text-indigo-600 uppercase outline-none focus:ring-4 ring-indigo-50"
               >
                  <option value="ALL">All Tiers</option>
                  {Object.values(SubscriptionPlan).map(p => <option key={p} value={p}>{p}</option>)}
               </select>
            </div>
         </div>

         <div className="overflow-x-auto rounded-[32px] border border-slate-50">
            <table className="w-full text-left">
               <thead className="bg-slate-50/50">
                  <tr>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Entity</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Active Plan</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trial Node</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Temporal Expiry</th>
                     <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Oversight</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredBiz.map(biz => {
                    const daysLeft = biz.subscriptionExpiry ? Math.ceil((new Date(biz.subscriptionExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
                    return (
                      <tr key={biz.id} className="group hover:bg-slate-50/30 transition-all">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-5">
                              <img src={biz.images[0]} className="w-12 h-12 rounded-xl object-cover shadow-sm ring-2 ring-white" alt="logo" />
                              <div>
                                 <p className="font-black text-slate-900 uppercase text-xs group-hover:text-indigo-600 transition-colors">{biz.name}</p>
                                 <p className="text-[10px] font-bold text-slate-400">Node ID: {biz.id}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                           <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                             biz.subscription === SubscriptionPlan.PREMIUM ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                             biz.subscription === SubscriptionPlan.PRO ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                             'bg-slate-50 text-slate-500 border-slate-100'
                           }`}>{biz.subscription}</span>
                        </td>
                        <td className="px-8 py-6 text-center">
                           <button 
                             onClick={() => handleToggleTrial(biz.id)}
                             className={`w-10 h-10 rounded-xl transition-all border flex items-center justify-center mx-auto ${
                               biz.isTrial ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-lg shadow-amber-100' : 'bg-white border-slate-100 text-slate-200 hover:text-slate-400'
                             }`}
                           >
                             <i className="fas fa-flask text-xs"></i>
                           </button>
                        </td>
                        <td className="px-8 py-6 text-center">
                           <div>
                              <p className={`text-xs font-black uppercase ${daysLeft !== null && daysLeft <= 7 ? 'text-rose-500 animate-pulse' : 'text-slate-700'}`}>
                                 {biz.subscriptionExpiry || 'No Expiry'}
                              </p>
                              {daysLeft !== null && (
                                 <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">{daysLeft > 0 ? `${daysLeft} Days Remaining` : 'EXPIRED'}</p>
                              )}
                           </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => setSelectedBizId(biz.id)}
                                className="px-6 py-2.5 bg-slate-950 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg"
                              >
                                Upgrade / Downgrade
                              </button>
                              <button 
                                onClick={() => onUpdateBusiness(biz.id, { status: biz.status === 'suspended' ? 'active' : 'suspended' })}
                                className={`p-2.5 rounded-xl transition-all shadow-sm border ${
                                  biz.status === 'suspended' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                                }`}
                                title={biz.status === 'suspended' ? 'Authorize Re-activation' : 'Manual Suspension'}
                              >
                                 <i className={`fas ${biz.status === 'suspended' ? 'fa-bolt' : 'fa-ban'} text-xs`}></i>
                              </button>
                           </div>
                        </td>
                      </tr>
                    );
                  })}
               </tbody>
            </table>
         </div>
      </div>

      {/* 3. PLATFORM INVOICE LOG (SUBSCRIPTIONS) */}
      <div className="bg-slate-900 p-12 rounded-[56px] shadow-2xl text-white space-y-12 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -mr-40 -mt-40"></div>
         
         <div className="relative z-10 flex items-center justify-between border-b border-white/5 pb-10">
            <div>
               <h3 className="text-3xl font-black tracking-tighter uppercase leading-none mb-2 italic">Treasury Registry</h3>
               <p className="text-indigo-200/40 text-[10px] font-bold uppercase tracking-widest">Log of all subscription-based financial settlements</p>
            </div>
            <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-indigo-400 border border-white/10 shadow-inner">
               <i className="fas fa-file-invoice-dollar text-2xl"></i>
            </div>
         </div>

         <div className="relative z-10 overflow-x-auto rounded-[32px] border border-white/5 bg-white/5 backdrop-blur-sm">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-white/5">
                     <th className="px-12 py-8 text-[11px] font-black text-indigo-300 uppercase tracking-widest">Serial Node</th>
                     <th className="px-12 py-8 text-[11px] font-black text-indigo-300 uppercase tracking-widest">Entity Node</th>
                     <th className="px-12 py-8 text-[11px] font-black text-indigo-300 uppercase tracking-widest text-center">Payload Value</th>
                     <th className="px-12 py-8 text-[11px] font-black text-indigo-300 uppercase tracking-widest text-center">Temporal Axis</th>
                     <th className="px-12 py-8 text-[11px] font-black text-indigo-300 uppercase tracking-widest text-right">Protokol</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {MOCK_TRANSACTIONS.filter(t => t.type === 'subscription').map(tx => (
                     <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-12 py-7 font-mono text-[11px] font-black text-white/30 uppercase tracking-tighter">#{tx.id.toUpperCase()}</td>
                        <td className="px-12 py-7">
                           <p className="text-xs font-black uppercase text-indigo-50">{businesses.find(b => b.id === tx.businessId)?.name}</p>
                           <p className="text-[9px] font-bold text-white/20 uppercase mt-1">Tier Settlement</p>
                        </td>
                        <td className="px-12 py-7 text-center">
                           <p className="font-black text-emerald-400">Rp {tx.amount.toLocaleString()}</p>
                        </td>
                        <td className="px-12 py-7 text-center text-[10px] font-black text-white/40 uppercase">{tx.createdAt}</td>
                        <td className="px-12 py-7 text-right">
                           <button className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase text-white/40 hover:text-white hover:bg-indigo-600 transition-all">Audit PDF</button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* PLAN ASSIGNMENT MODAL */}
      {selectedBizId && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[56px] shadow-2xl p-16 space-y-12 relative overflow-hidden">
              <button onClick={() => setSelectedBizId(null)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all z-10"><i className="fas fa-times"></i></button>
              
              <div className="text-center">
                 <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-3 italic">Tier Transition</h3>
                 <p className="text-slate-400 text-sm font-medium">Re-mapping the economic node of <strong>{businesses.find(b => b.id === selectedBizId)?.name}</strong>.</p>
              </div>

              <div className="space-y-4">
                 {[SubscriptionPlan.BASIC, SubscriptionPlan.PRO, SubscriptionPlan.PREMIUM].map(plan => (
                    <button 
                      key={plan}
                      onClick={() => handlePlanChange(selectedBizId, plan)}
                      className="w-full group p-8 bg-slate-50 border border-slate-200 rounded-[32px] flex items-center justify-between hover:border-indigo-600 hover:bg-white transition-all shadow-sm hover:shadow-xl"
                    >
                       <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
                             plan === SubscriptionPlan.PREMIUM ? 'bg-indigo-50 text-indigo-600' : 
                             plan === SubscriptionPlan.PRO ? 'bg-emerald-50 text-emerald-600' :
                             'bg-slate-100 text-slate-400'
                          }`}>
                             <i className={`fas ${plan === SubscriptionPlan.PREMIUM ? 'fa-gem' : plan === SubscriptionPlan.PRO ? 'fa-rocket' : 'fa-leaf'}`}></i>
                          </div>
                          <div className="text-left">
                             <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{plan} Node</h4>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{plan === SubscriptionPlan.PREMIUM ? 'Unlimited Capacity' : plan === SubscriptionPlan.PRO ? '50 Unit Matrix' : '10 Unit Basic'}</p>
                          </div>
                       </div>
                       <i className="fas fa-arrow-right text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-2 transition-all"></i>
                    </button>
                 ))}
              </div>
              
              <div className="p-8 bg-indigo-50 rounded-[40px] border border-indigo-100">
                 <p className="text-center font-mono text-[9px] font-black text-indigo-400 uppercase tracking-widest">This override will bypass standard payment protocols and force a manual ledger update.</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
