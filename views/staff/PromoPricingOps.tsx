
import React, { useState, useMemo } from 'react';
import { Promotion, PricingRule, Business } from '../../types';
import { MOCK_PROMOTIONS } from '../../constants';

interface PromoPricingOpsProps {
  businessId: string;
  promotions: Promotion[];
}

export const PromoPricingOps: React.FC<PromoPricingOpsProps> = ({ businessId, promotions }) => {
  const [activeTab, setActiveTab] = useState<'vouchers' | 'rules'>('vouchers');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. DATA FILTERING
  const activePromos = useMemo(() => {
    return promotions.filter(p => 
      p.businessId === businessId && 
      p.isActive &&
      p.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [promotions, businessId, searchQuery]);

  // Mocked active pricing rules for the specific business
  const systemRules: PricingRule[] = [
    { id: 'pr-1', businessId, name: 'Weekend Surge Protocol', type: 'weekend', adjustmentType: 'fixed', value: 150000, isActive: true },
    { id: 'pr-2', businessId, name: 'High Season Dec-Jan', type: 'seasonal', adjustmentType: 'percentage', value: 20, isActive: true, startDate: '2024-12-01', endDate: '2025-01-15' }
  ];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Node Alpha: Voucher code ${code} copied to terminal clipboard.`);
  };

  return (
    <div className="space-y-10 animate-fade-up">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Promo Execution Terminal</h2>
           <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-2">Otorisasi penggunaan voucher dan monitoring aturan harga aktif.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-[28px] border border-slate-100 shadow-sm gap-1">
          <button 
            onClick={() => setActiveTab('vouchers')}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'vouchers' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Active Vouchers ({activePromos.length})
          </button>
          <button 
            onClick={() => setActiveTab('rules')}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'rules' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Pricing Rules
          </button>
        </div>
      </div>

      {/* SEARCH HUB */}
      <div className="relative w-full md:w-96">
        <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
        <input 
          type="text" 
          placeholder="Search active node..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold text-slate-700 outline-none focus:ring-4 ring-indigo-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'vouchers' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activePromos.map(promo => (
                <div key={promo.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-[100px]"></div>
                   <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                         <i className="fas fa-ticket"></i>
                      </div>
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] border border-emerald-100 animate-pulse">Live</span>
                   </div>
                   <div className="space-y-2 mb-8 relative z-10">
                      <h4 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{promo.code}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{promo.description || 'Generic Marketplace Discount'}</p>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center relative z-10">
                      <div>
                         <p className="text-[8px] font-black text-slate-300 uppercase">Discount Payload</p>
                         <p className="text-lg font-black text-indigo-600">-{promo.discountValue}{promo.type === 'percentage' ? '%' : 'K'}</p>
                      </div>
                      <button 
                        onClick={() => handleCopyCode(promo.code)}
                        className="px-6 py-2.5 bg-slate-950 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg"
                      >
                         Apply Node
                      </button>
                   </div>
                </div>
              ))}
              {activePromos.length === 0 && (
                <div className="col-span-full py-32 text-center bg-white rounded-[56px] border border-dashed border-slate-200">
                   <i className="fas fa-box-open text-slate-100 text-6xl mb-6"></i>
                   <p className="text-slate-300 font-black uppercase text-xs tracking-widest italic">No active vouchers detected in current cluster.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
               {systemRules.map(rule => (
                 <div key={rule.id} className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all">
                    <div className="flex items-center gap-8">
                       <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-2xl shadow-inner ${
                          rule.type === 'seasonal' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'
                       }`}>
                          <i className={`fas ${rule.type === 'seasonal' ? 'fa-umbrella-beach' : 'fa-calendar-day'}`}></i>
                       </div>
                       <div>
                          <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-1">{rule.name}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{rule.type} Adjustment Rule</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Value Shift</p>
                       <p className={`text-xl font-black ${rule.value > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {rule.value > 0 ? '+' : ''}{rule.value.toLocaleString()}{rule.adjustmentType === 'percentage' ? '%' : ''}
                       </p>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>

        {/* RESTRICTION PANEL */}
        <div className="space-y-8">
           <div className="bg-slate-950 p-10 rounded-[48px] shadow-2xl text-white space-y-10 relative overflow-hidden flex flex-col justify-between min-h-[450px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                 <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-8 border border-white/5">
                    <i className="fas fa-lock-keyhole"></i>
                 </div>
                 <h3 className="text-3xl font-black tracking-tighter uppercase leading-none mb-6">Authority Restricted</h3>
                 <p className="text-indigo-200/40 text-sm font-medium leading-relaxed mb-10 italic">"Penciptaan promo dan perubahan aturan harga hanya dapat dilakukan oleh Owner atau Super Admin."</p>
                 
                 <div className="space-y-4">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase text-white/30">
                       <i className="fas fa-circle-xmark"></i>
                       <span>Create Voucher Code</span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase text-white/30">
                       <i className="fas fa-circle-xmark"></i>
                       <span>Modify Pricing Logic</span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase text-emerald-400">
                       <i className="fas fa-circle-check"></i>
                       <span>Apply Active Voucher</span>
                    </div>
                 </div>
              </div>
              <button className="relative z-10 w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-300">Request Override</button>
           </div>

           <div className="p-8 bg-indigo-50 rounded-[40px] border border-indigo-100 flex items-center justify-center gap-4">
              <i className="fas fa-shield-halved text-indigo-600 text-sm"></i>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">SEULANGA RBAC POLICY V4.1 ACTIVE</p>
           </div>
        </div>
      </div>
    </div>
  );
};
