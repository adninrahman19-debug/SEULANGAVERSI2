
import React, { useState, useMemo } from 'react';
import { Business, Promotion, PricingRule, SubscriptionPlan } from '../../types';
import { MOCK_PROMOTIONS } from '../../constants';

interface MarketingHubProps {
  business: Business;
  onUpdateBusiness: (data: Partial<Business>) => void;
}

type MarketingTab = 'vouchers' | 'pricing-rules' | 'featured';

export const MarketingHub: React.FC<MarketingHubProps> = ({ business, onUpdateBusiness }) => {
  const [activeTab, setActiveTab] = useState<MarketingTab>('vouchers');
  const [promos, setPromos] = useState<Promotion[]>(MOCK_PROMOTIONS.filter(p => p.businessId === business.id));
  const [rules, setRules] = useState<PricingRule[]>([
    { id: 'pr-1', businessId: business.id, name: 'High Season (Dec-Jan)', type: 'seasonal', adjustmentType: 'percentage', value: 25, isActive: true, startDate: '2024-12-01', endDate: '2025-01-15' },
    { id: 'pr-2', businessId: business.id, name: 'Weekend Markup', type: 'weekend', adjustmentType: 'fixed', value: 150000, isActive: true }
  ]);

  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);

  // Handlers
  const handleTogglePromo = (id: string) => {
    setPromos(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  const handleToggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  };

  const handleRequestFeatured = () => {
    onUpdateBusiness({ isFeaturedRequested: true });
    alert('Permintaan Featured Listing telah dikirim. Treasury node akan memverifikasi pembayaran Anda.');
  };

  const handleCreatePromo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPromo: Promotion = {
      id: `prm-${Date.now()}`,
      businessId: business.id,
      code: (formData.get('code') as string).toUpperCase(),
      discountValue: Number(formData.get('value')),
      type: formData.get('type') as 'percentage' | 'fixed',
      startDate: formData.get('start') as string,
      endDate: formData.get('end') as string,
      isActive: true,
      description: formData.get('desc') as string
    };
    setPromos([newPromo, ...promos]);
    setIsPromoModalOpen(false);
  };

  return (
    <div className="space-y-10 animate-fade-up">
      {/* 1. HEADER & STRATEGY NAV */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">Growth Strategy Hub</h2>
           <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-2">Kelola instrumen promosi, optimasi harga dinamis, dan visibilitas marketplace.</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
           {[
             { id: 'vouchers', label: 'Vouchers', icon: 'fa-ticket' },
             { id: 'pricing-rules', label: 'Price Engine', icon: 'fa-gears' },
             { id: 'featured', label: 'Marketplace Boost', icon: 'fa-fire' },
           ].map(tab => (
             <button 
               key={tab.id}
               onClick={() => setActiveTab(tab.id as MarketingTab)}
               className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                 activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'
               }`}
             >
               <i className={`fas ${tab.icon} text-[10px]`}></i>
               {tab.label}
             </button>
           ))}
        </div>
      </div>

      {/* 2. VOUCHER & CAMPAIGN SECTION */}
      {activeTab === 'vouchers' && (
        <div className="space-y-8">
           <div className="flex justify-between items-end px-2">
              <div>
                 <h3 className="text-xl font-black text-slate-900 uppercase">Active Campaigns</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gunakan kode voucher untuk menarik traksi guest node.</p>
              </div>
              <button 
                onClick={() => setIsPromoModalOpen(true)}
                className="px-6 py-3 bg-slate-950 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2 shadow-xl"
              >
                 <i className="fas fa-plus"></i> Buat Voucher
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {promos.map(promo => (
                <div key={promo.id} className={`bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm group hover:shadow-2xl transition-all duration-500 relative overflow-hidden ${!promo.isActive ? 'opacity-60 grayscale' : ''}`}>
                   <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl -mr-12 -mt-12"></div>
                   <div className="flex justify-between items-start mb-8">
                      <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex flex-col items-center justify-center border border-indigo-100 shadow-inner">
                         <span className="text-[8px] font-black uppercase">Disc</span>
                         <span className="text-lg font-black">{promo.discountValue}{promo.type === 'percentage' ? '%' : 'K'}</span>
                      </div>
                      <div className="text-right">
                         <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${promo.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                            {promo.isActive ? 'Active Node' : 'Paused'}
                         </span>
                      </div>
                   </div>
                   <div className="space-y-2 mb-8">
                      <h4 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none">{promo.code}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{promo.description || 'Global Campaign Discount'}</p>
                   </div>
                   <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex flex-col">
                         <span className="text-[8px] font-black text-slate-300 uppercase">Validity Period</span>
                         <span className="text-[10px] font-black text-slate-700 uppercase">{promo.startDate} — {promo.endDate}</span>
                      </div>
                      <button 
                        onClick={() => handleTogglePromo(promo.id)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${promo.isActive ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-600'}`}
                      >
                         <i className={`fas ${promo.isActive ? 'fa-pause' : 'fa-play'} text-xs`}></i>
                      </button>
                   </div>
                </div>
              ))}
              {promos.length === 0 && (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-[40px]">
                   <p className="text-slate-300 font-black uppercase text-xs tracking-widest italic">Belum ada campaign aktif.</p>
                </div>
              )}
           </div>
        </div>
      )}

      {/* 3. DYNAMIC PRICING ENGINE SECTION */}
      {activeTab === 'pricing-rules' && (
        <div className="space-y-8">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                 <h3 className="text-xl font-black text-slate-900 uppercase italic">Dynamic Pricing Matrix</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sistem otomatisasi harga berdasarkan kalender dan sirkulasi pasar.</p>
              </div>
              <button 
                onClick={() => setIsRuleModalOpen(true)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all"
              >
                 <i className="fas fa-plus"></i> Add Adjustment Node
              </button>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {rules.map(rule => (
                <div key={rule.id} className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all">
                   <div className="flex items-center gap-8">
                      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-2xl shadow-inner ${
                         rule.type === 'seasonal' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'
                      }`}>
                         <i className={`fas ${rule.type === 'seasonal' ? 'fa-umbrella-beach' : 'fa-calendar-day'}`}></i>
                      </div>
                      <div>
                         <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-1">{rule.name}</h4>
                         <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black text-indigo-500 uppercase bg-indigo-50 px-2 py-0.5 rounded">{rule.type} Adjustment</span>
                            {rule.startDate && <span className="text-[9px] font-bold text-slate-400 uppercase">{rule.startDate} - {rule.endDate}</span>}
                         </div>
                      </div>
                   </div>
                   <div className="text-right flex items-center gap-6">
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Value Shift</p>
                         <p className={`text-xl font-black ${rule.value > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {rule.value > 0 ? '+' : ''}{rule.value.toLocaleString()}{rule.adjustmentType === 'percentage' ? '%' : ''}
                         </p>
                      </div>
                      <button 
                        onClick={() => handleToggleRule(rule.id)}
                        className={`w-14 h-7 rounded-full relative transition-all ${rule.isActive ? 'bg-indigo-600' : 'bg-slate-200'}`}
                      >
                         <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${rule.isActive ? 'right-1' : 'left-1'}`}></div>
                      </button>
                   </div>
                </div>
              ))}
           </div>

           <div className="p-10 bg-slate-950 rounded-[56px] text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
              <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                 <div>
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-6">
                       <i className="fas fa-robot"></i>
                    </div>
                    <h4 className="text-3xl font-black uppercase tracking-tighter mb-4">Autopilot Price Guard</h4>
                    <p className="text-indigo-100/60 text-sm font-medium leading-relaxed">Aktifkan protokol AI untuk menyesuaikan harga secara otomatis berdasarkan tren okupansi pasar di radius properti Anda.</p>
                 </div>
                 <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] flex flex-col items-center text-center space-y-6">
                    <p className="text-xs font-black uppercase text-indigo-300">Status Protokol AI</p>
                    <div className="flex items-center gap-4">
                       <span className="text-[10px] font-black text-white/40 uppercase">Disabled</span>
                       <div className="w-16 h-8 bg-white/10 rounded-full flex items-center px-1">
                          <div className="w-6 h-6 bg-white/20 rounded-full"></div>
                       </div>
                       <span className="text-[10px] font-black text-white/40 uppercase">Enabled</span>
                    </div>
                    <button disabled className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest opacity-30 cursor-not-allowed">Upgrade to PRO for AI Engine</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* 4. MARKETPLACE BOOST (FEATURED) SECTION */}
      {activeTab === 'featured' && (
        <div className="max-w-4xl mx-auto space-y-10 animate-fade-up">
           <div className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-[100px]"></div>
              
              <div className="flex flex-col md:flex-row items-center gap-12 pb-12 border-b border-slate-50">
                 <div className="w-32 h-32 bg-amber-50 rounded-[40px] flex items-center justify-center text-5xl text-amber-500 shadow-inner">
                    <i className="fas fa-fire-flame-curved"></i>
                 </div>
                 <div className="text-center md:text-left flex-1">
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-3 leading-none italic">Marketplace Boost</h3>
                    <p className="text-slate-400 font-medium text-lg leading-relaxed">Tingkatkan visibilitas properti Anda di hasil pencarian teratas Marketplace Seulanga.</p>
                 </div>
              </div>

              <div className="py-12 space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 space-y-4">
                       <div className="flex items-center gap-3">
                          <i className="fas fa-chart-line-up text-indigo-600"></i>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expected Traction Node</h4>
                       </div>
                       <p className="text-4xl font-black text-slate-900 tracking-tighter">3.5x <span className="text-lg font-bold opacity-30 italic">Reach</span></p>
                       <p className="text-[9px] font-bold text-slate-500 uppercase leading-relaxed">Rata-rata kenaikan klik dari guest node terverifikasi.</p>
                    </div>
                    <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 space-y-4">
                       <div className="flex items-center gap-3">
                          <i className="fas fa-coins text-amber-500"></i>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Cost</h4>
                       </div>
                       <p className="text-3xl font-black text-slate-900 tracking-tighter">Rp 250K <span className="text-xs font-bold opacity-30 uppercase">/ 30 Days</span></p>
                       <p className="text-[9px] font-bold text-slate-500 uppercase leading-relaxed">Biaya tetap per siklus billing (Flat Rate).</p>
                    </div>
                 </div>

                 <div className="p-10 bg-indigo-50 border border-indigo-100 rounded-[40px] flex items-center justify-between">
                    <div className="flex items-center gap-6">
                       <div className={`w-3 h-3 rounded-full ${business.isFeatured ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-slate-300'}`}></div>
                       <div>
                          <p className="text-sm font-black text-indigo-900 uppercase">Status Boost Saat Ini</p>
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{business.isFeatured ? 'ENTITY IS CURRENTLY FEATURED' : 'ENTITY IS NOT BOOSTED'}</p>
                       </div>
                    </div>
                    {business.isFeaturedRequested ? (
                      <span className="px-6 py-3 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-200">Awaiting Auth</span>
                    ) : !business.isFeatured && (
                      <button 
                        onClick={handleRequestFeatured}
                        className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                      >
                         Activate Node Boost
                      </button>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* MODALS */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[56px] shadow-2xl p-16 space-y-12 relative overflow-hidden">
              <button onClick={() => setIsPromoModalOpen(false)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all z-10"><i className="fas fa-times"></i></button>
              <div>
                 <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-3 italic">Campaign Registry</h3>
                 <p className="text-slate-400 text-sm font-medium">Buat voucher diskon baru untuk properti Anda.</p>
              </div>
              <form onSubmit={handleCreatePromo} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Voucher Code (Identity)</label>
                    <input name="code" required placeholder="E.g. YEAR_END_DEAL" className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-4 font-bold text-slate-900 outline-none focus:ring-4 ring-indigo-50" />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Discount Type</label>
                       <select name="type" className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-6 py-4 font-bold outline-none">
                          <option value="percentage">Percentage (%)</option>
                          <option value="fixed">Fixed Amount (Rp)</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Value</label>
                       <input name="value" type="number" required className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-4 font-bold" />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                       <input type="date" name="start" required className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-4 font-bold" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                       <input type="date" name="end" required className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-4 font-bold" />
                    </div>
                 </div>
                 <button type="submit" className="w-full py-6 bg-slate-950 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-4">
                    <i className="fas fa-shield-check"></i> Authorize Campaign
                 </button>
              </form>
           </div>
        </div>
      )}

      {isRuleModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-xl rounded-[56px] shadow-2xl p-16 space-y-12 relative overflow-hidden">
              <button onClick={() => setIsRuleModalOpen(false)} className="absolute top-10 right-10 w-12 h-12 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all z-10"><i className="fas fa-times"></i></button>
              <div>
                 <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-3 italic">Price Engine Node</h3>
                 <p className="text-slate-400 text-sm font-medium">Tambah aturan harga dinamis baru.</p>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); alert('Adjustment Rule Created.'); setIsRuleModalOpen(false); }} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rule Identity Name</label>
                    <input required placeholder="E.g. Lebaran Peak Season" className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-4 font-bold text-slate-900 outline-none" />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Adjustment Type</label>
                       <select className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-6 py-4 font-bold outline-none">
                          <option>Markup (+)</option>
                          <option>Discount (-)</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Value (%)</label>
                       <input type="number" required className="w-full bg-slate-50 border border-slate-200 rounded-[28px] px-8 py-4 font-bold" />
                    </div>
                 </div>
                 <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-4">
                    <i className="fas fa-bolt"></i> Deploy Price Logic
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
