
import React, { useState } from 'react';
import { Promotion } from '../../types';
import { MOCK_PROMOTIONS } from '../../constants';

interface VoucherWalletProps {
  language: 'id' | 'en';
}

export const VoucherWallet: React.FC<VoucherWalletProps> = ({ language }) => {
  const [activeTab, setActiveTab] = useState<'available' | 'used'>('available');
  const [loyaltyPoints] = useState(1250);

  const d = {
    id: {
      title: 'Rewards & Shards',
      sub: 'Manfaatkan keuntungan eksklusif untuk member terverifikasi Seulanga.',
      points_label: 'Loyalty Balance',
      points_unit: 'Node Points',
      tier: 'Sovereign Silver',
      btn_copy: 'Salin Kode',
      empty: 'Penyimpanan voucher kosong.'
    },
    en: {
      title: 'Rewards & Shards',
      sub: 'Utilize exclusive benefits for verified Seulanga ecosystem members.',
      points_label: 'Loyalty Balance',
      points_unit: 'Node Points',
      tier: 'Sovereign Silver',
      btn_copy: 'Copy Node',
      empty: 'Voucher storage is empty.'
    }
  }[language];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Code ${code} copied to shard clipboard.`);
  };

  return (
    <div className="space-y-12 animate-fade-up">
      {/* LOYALTY PROGRESS HEADER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-slate-950 p-12 rounded-[64px] shadow-2xl text-white relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-10 mb-12">
               <div>
                  <h2 className="text-5xl font-black tracking-tighter uppercase italic leading-none">{d.title}</h2>
                  <p className="text-indigo-400/60 text-sm font-medium uppercase tracking-widest mt-4 leading-relaxed max-w-sm">{d.sub}</p>
               </div>
               <div className="text-right flex flex-col items-center md:items-end">
                  <div className="w-14 h-14 bg-white/10 rounded-3xl flex items-center justify-center text-amber-400 border border-white/10 shadow-inner mb-4">
                     <i className="fas fa-crown text-2xl"></i>
                  </div>
                  <p className="text-[10px] font-black uppercase text-indigo-300 tracking-widest">{d.tier}</p>
                  <p className="text-[9px] font-bold text-white/20 uppercase mt-1 tracking-[0.2em]">Verified Ecosystem Tier</p>
               </div>
            </div>

            <div className="relative z-10 p-10 bg-white/5 border border-white/10 rounded-[48px] space-y-6">
               <div className="flex justify-between items-end">
                  <div>
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2">{d.points_label}</p>
                     <p className="text-6xl font-black tracking-tighter leading-none">{loyaltyPoints.toLocaleString()}<span className="text-lg opacity-20 ml-2">XP</span></p>
                  </div>
                  <button className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-500 transition-all">Redeem Shards</button>
               </div>
               <div className="space-y-3">
                  <div className="flex justify-between text-[9px] font-black uppercase text-white/40 tracking-widest">
                     <span>Current Progress to Gold Node</span>
                     <span>62%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                     <div className="h-full bg-indigo-500 shadow-[0_0_15px_#6366f1]" style={{ width: '62%' }}></div>
                  </div>
               </div>
            </div>
         </div>

         {/* QUESTS / CHALLENGES */}
         <div className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-sm space-y-10">
            <h4 className="text-xl font-black text-slate-900 uppercase italic">Active Quests</h4>
            <div className="space-y-6">
               {[
                 { title: 'Identity Pioneer', xp: '+500 XP', desc: 'Complete full KYC verification.', done: true },
                 { title: 'Global Nomad', xp: '+1200 XP', desc: 'Book stays in 3 different business categories.', done: false },
                 { title: 'Reputation Pillar', xp: '+300 XP', desc: 'Leave 5 verified property reviews.', done: false }
               ].map((quest, i) => (
                 <div key={i} className={`p-6 rounded-3xl border transition-all ${quest.done ? 'bg-emerald-50/30 border-emerald-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] font-black text-slate-900 uppercase">{quest.title}</span>
                       <span className="text-[10px] font-black text-indigo-600">{quest.xp}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{quest.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* VOUCHER GRID */}
      <div className="space-y-8">
         <div className="flex justify-between items-center px-4">
            <div className="flex bg-white p-1.5 rounded-[24px] border border-slate-100 shadow-sm gap-1">
               <button onClick={() => setActiveTab('available')} className={`px-8 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'available' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>Available Shards</button>
               <button onClick={() => setActiveTab('used')} className={`px-8 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'used' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>History</button>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {MOCK_PROMOTIONS.map(promo => (
               <div key={promo.id} className="relative group perspective-1000">
                  <div className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 flex flex-col justify-between min-h-[340px] relative overflow-hidden">
                     {/* Perforated edge effect */}
                     <div className="absolute top-1/2 -translate-y-1/2 -left-3 w-6 h-6 bg-slate-50 rounded-full border border-slate-100"></div>
                     <div className="absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-6 bg-slate-50 rounded-full border border-slate-100"></div>
                     <div className="absolute top-1/2 left-4 right-4 h-px border-t-2 border-dashed border-slate-100 -z-0"></div>

                     <div className="relative z-10 flex justify-between items-start">
                        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl shadow-inner border border-indigo-100">
                           <i className="fas fa-ticket-simple"></i>
                        </div>
                        <span className="text-[9px] font-black uppercase text-slate-300 tracking-[0.2em]">Verified Promo Node</span>
                     </div>

                     <div className="relative z-10 py-8 text-center space-y-2">
                        <h4 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{promo.discountValue}{promo.type === 'percentage' ? '%' : 'K'} OFF</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{promo.code}</p>
                     </div>

                     <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400 px-2">
                           <span>Expiring In 12 Days</span>
                           <span className="text-indigo-600">Valid Universal</span>
                        </div>
                        <button 
                          onClick={() => handleCopy(promo.code)}
                          className="w-full py-4 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl"
                        >
                           {d.btn_copy}
                        </button>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>

      <div className="p-10 bg-indigo-50 rounded-[48px] border border-indigo-100 flex items-center justify-center gap-6 group hover:bg-indigo-100 transition-all">
         <i className="fas fa-sparkles text-indigo-600 text-xl group-hover:rotate-12 transition-transform"></i>
         <p className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.4em] italic leading-none text-center">SEULANGA REWARDS MATRIX • OPERATIONAL AUTHENTICITY VERIFIED</p>
      </div>
    </div>
  );
};
