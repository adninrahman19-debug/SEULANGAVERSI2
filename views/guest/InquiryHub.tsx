
import React, { useState } from 'react';
import { Business, Inquiry } from '../../types';
import { MOCK_BUSINESSES } from '../../constants';

export const InquiryHub: React.FC = () => {
  const [inquiries] = useState<any[]>([
    { id: 'inq-1', businessId: 'b1', subject: 'Pertanyaan Unit Executive', message: 'Apakah harga sudah termasuk sarapan untuk 2 orang?', status: 'responded', date: '2024-12-28' },
    { id: 'inq-2', businessId: 'b2', subject: 'Survey Lokasi Penjualan', message: 'Saya tertarik melihat unit rumah tipe 45, kapan ada waktu luang?', status: 'pending', date: '2024-12-27' },
  ]);

  const getBiz = (id: string) => MOCK_BUSINESSES.find(b => b.id === id);

  return (
    <div className="space-y-10 animate-fade-up">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
        <div>
           <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Inquiry Terminal</h2>
           <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-2">Pantau status pertanyaan dan negosiasi Anda dengan mitra properti.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {inquiries.map(inq => {
          const biz = getBiz(inq.businessId);
          return (
            <div key={inq.id} className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-[100px] -z-0"></div>
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                  <div className="flex items-center gap-8">
                     <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-2xl shadow-inner ${
                        inq.status === 'responded' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                     }`}>
                        <i className={`fas ${inq.status === 'responded' ? 'fa-comment-check' : 'fa-clock-rotate-left'}`}></i>
                     </div>
                     <div>
                        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">{inq.subject}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{biz?.name} • {biz?.category}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-6">
                     <div className="text-right">
                        <p className="text-[10px] font-black text-slate-300 uppercase mb-1">Status Dialog</p>
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border tracking-widest ${
                           inq.status === 'responded' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse'
                        }`}>{inq.status}</span>
                     </div>
                     <button className="w-12 h-12 bg-slate-950 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-600 transition-all shadow-lg group-hover:scale-110">
                        <i className="fas fa-chevron-right"></i>
                     </button>
                  </div>
               </div>
               <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between text-slate-400">
                  <p className="text-sm font-medium italic">"{inq.message}"</p>
                  <span className="text-[10px] font-black uppercase tracking-tighter">{inq.date}</span>
               </div>
            </div>
          );
        })}
      </div>

      <div className="p-10 bg-slate-950 rounded-[56px] text-white flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>
         <div className="flex items-center gap-8 relative z-10">
            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-[32px] flex items-center justify-center text-4xl text-indigo-400 shadow-inner">
               <i className="fas fa-headset"></i>
            </div>
            <div>
               <h3 className="text-2xl font-black tracking-tighter uppercase mb-2">Punya Pertanyaan Lain?</h3>
               <p className="text-indigo-200/40 text-[10px] font-bold uppercase tracking-widest leading-relaxed">Gunakan fitur Inquiry langsung pada detail properti di Marketplace.</p>
            </div>
         </div>
         <button className="relative z-10 px-12 py-6 bg-white text-slate-950 rounded-[28px] font-black text-xs uppercase tracking-widest hover:bg-indigo-400 hover:text-white transition-all shadow-xl">
            Eksplorasi Marketplace
         </button>
      </div>
    </div>
  );
};
