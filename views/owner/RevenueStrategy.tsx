
import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, ComposedChart, Line
} from 'recharts';

const comparisonData = [
  { name: 'Mon', internal: 1200000, market: 1100000 },
  { name: 'Tue', internal: 1200000, market: 1150000 },
  { name: 'Wed', internal: 1350000, market: 1300000 },
  { name: 'Thu', internal: 1350000, market: 1400000 },
  { name: 'Fri', internal: 1500000, market: 1650000 },
  { name: 'Sat', internal: 1800000, market: 1900000 },
  { name: 'Sun', internal: 1600000, market: 1550000 },
];

export const RevenueStrategy: React.FC = () => {
  const [autoPricing, setAutoPricing] = useState(true);
  
  return (
    <div className="space-y-10 animate-fade-up">
      {/* 1. STRATEGY CONTROL PANEL */}
      <div className="bg-slate-950 p-10 rounded-[48px] shadow-2xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-10">
          <div className="max-w-xl space-y-6">
            <div className="inline-flex items-center gap-3 bg-indigo-500/20 px-4 py-2 rounded-full border border-indigo-500/30">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">AI Revenue Optimizer Active</span>
            </div>
            <h2 className="text-5xl font-black tracking-tighter uppercase leading-none">Smart Rate <br/> <span className="text-indigo-400 italic">Engine.</span></h2>
            <p className="text-indigo-100/60 font-medium leading-relaxed">Sistem secara otomatis menyesuaikan harga unit Anda berdasarkan algoritma okupansi real-time, tren hari libur, dan aktivitas kompetitor di radius 5KM.</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[40px] flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-8">
               <span className="text-xs font-black uppercase tracking-widest text-indigo-300">Auto-Pricing Logic</span>
               <button 
                onClick={() => setAutoPricing(!autoPricing)}
                className={`w-14 h-7 rounded-full relative transition-all ${autoPricing ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-700'}`}
               >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${autoPricing ? 'right-1' : 'left-1'}`}></div>
               </button>
            </div>
            <div className="space-y-4">
               <div className="flex justify-between text-[10px] font-bold uppercase opacity-40">
                  <span>Occupancy Threshold</span>
                  <span>Adjustment</span>
               </div>
               <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-sm font-black text-indigo-50">Under 40%</span>
                  <span className="text-sm font-black text-rose-400">-15% (Flash Sale)</span>
               </div>
               <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-sm font-black text-indigo-50">Above 85%</span>
                  <span className="text-sm font-black text-emerald-400">+25% (Yield Max)</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* 2. PRICE COMPARISON CHART */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-10">
           <div className="flex items-center justify-between">
              <div>
                 <h3 className="text-xl font-black text-slate-900 uppercase">Market Pulse Radar</h3>
                 <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">Perbandingan harga internal vs rata-rata pasar</p>
              </div>
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                 <i className="fas fa-tower-broadcast"></i>
              </div>
           </div>
           <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                 <ComposedChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                    <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="internal" fill="#4f46e5" radius={[10, 10, 0, 0]} name="Harga Anda" />
                    <Line type="monotone" dataKey="market" stroke="#f59e0b" strokeWidth={4} dot={{r: 6}} name="Rata-rata Pasar" />
                 </ComposedChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* 3. REVENUE RECOMMENDATIONS */}
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
           <h3 className="text-xl font-black text-slate-900 uppercase italic">Insights.</h3>
           <div className="space-y-6">
              {[
                { title: 'Markup Akhir Pekan', desc: 'Permintaan meningkat 40% setiap hari Sabtu. Sistem merekomendasikan kenaikan harga Rp 150k untuk unit Deluxe.', icon: 'fa-trending-up', color: 'text-emerald-500' },
                { title: 'Stok Terbatas', desc: 'Sisa 1 unit untuk tanggal 31 Des. Aktifkan "Last Minute Premium" untuk profit ekstra 10%.', icon: 'fa-bolt-lightning', color: 'text-amber-500' },
                { title: 'Target Okupansi', desc: 'Bulan ini Anda tertinggal 5% dari target. Pertimbangkan aktivasi voucher khusus tamu lokal.', icon: 'fa-bullseye', color: 'text-indigo-500' }
              ].map((item, i) => (
                <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer group">
                   <div className="flex gap-4 items-start">
                      <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm ${item.color} group-hover:scale-110 transition-transform`}>
                         <i className={`fas ${item.icon}`}></i>
                      </div>
                      <div>
                         <p className="text-xs font-black text-slate-900 uppercase mb-1">{item.title}</p>
                         <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                      </div>
                   </div>
                </div>
              ))}
           </div>
           <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all">Lihat Laporan Lengkap</button>
        </div>
      </div>
    </div>
  );
};
