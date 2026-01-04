
import React from 'react';
import { Business, Booking, Unit, SubscriptionPlan } from '../../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface BusinessOverviewProps {
  business: Business;
  bookings: Booking[];
  units: Unit[];
  revenueData: any[];
}

export const BusinessOverview: React.FC<BusinessOverviewProps> = ({ 
  business, bookings, units, revenueData 
}) => {
  const todayDate = new Date().toISOString().split('T')[0];
  const bookingsToday = bookings.filter(b => b.createdAt === todayDate).length;
  const currentMonthBookings = revenueData[revenueData.length - 1].bookings;
  const currentRevenue = revenueData[revenueData.length - 1].revenue;
  const currentOccupancy = revenueData[revenueData.length - 1].occupancy;

  const unitLimit = business.subscription === SubscriptionPlan.PREMIUM ? 'Unlimited' : 
                   business.subscription === SubscriptionPlan.PRO ? '50' : '10';

  return (
    <div className="space-y-10 animate-fade-up">
      {/* 1. STATUS & LICENSE SUMMARY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-2xl shadow-inner ${
              business.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              <i className={`fas ${business.status === 'active' ? 'fa-check-circle' : 'fa-ban'}`}></i>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Operasional Bisnis</p>
              <h3 className="text-2xl font-black text-slate-900 uppercase">
                {business.status === 'active' ? 'Node Active / Operational' : 'Node Suspended'}
              </h3>
            </div>
          </div>
          <div className="text-right">
             <span className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
               {business.subscription} Plan
             </span>
          </div>
        </div>

        <div className="bg-indigo-600 p-8 rounded-[40px] shadow-xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-12 -mt-12"></div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-4">Kapasitas Aset Terpakai</p>
            <div className="flex items-end justify-between mb-4">
              <h4 className="text-4xl font-black tracking-tighter">{units.length} / {unitLimit}</h4>
              <span className="text-[10px] font-bold opacity-60 uppercase">Units</span>
            </div>
            <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-white h-full rounded-full transition-all duration-1000" 
                style={{ width: `${(units.length / (parseInt(unitLimit) || 100)) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CORE PERFORMANCE TILES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[36px] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Revenue (Bulan Ini)</p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Rp {(currentRevenue / 1000000).toFixed(1)}M</h3>
          <p className="text-[10px] font-bold text-emerald-500 mt-2">+12.5% vs Lalu</p>
        </div>
        <div className="bg-white p-8 rounded-[36px] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Booking (Hari Ini)</p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{bookingsToday} <span className="text-xs text-slate-400">Reservasi</span></h3>
          <p className="text-[10px] font-bold text-slate-400 mt-2">Total {currentMonthBookings} bln ini</p>
        </div>
        <div className="bg-white p-8 rounded-[36px] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Okupansi Asset</p>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{currentOccupancy}% <span className="text-xs text-slate-400">Terisi</span></h3>
          <p className="text-[10px] font-bold text-indigo-500 mt-2">High Demand Node</p>
        </div>
        <div className="bg-slate-950 p-8 rounded-[36px] text-white shadow-xl flex items-center justify-between">
           <div>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Payout Ready</p>
              <h3 className="text-xl font-black text-emerald-400">Rp 12.4M</h3>
           </div>
           <button className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-indigo-600 transition-all">
              <i className="fas fa-arrow-right text-xs"></i>
           </button>
        </div>
      </div>

      {/* 3. TREND CHART & NOTIFICATIONS */}
      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 uppercase">Tren Reservasi Bisnis</h3>
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
               <span className="text-[10px] font-black text-slate-400 uppercase">Volume Booking</span>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorBbk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} />
                <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
                <Area type="monotone" dataKey="bookings" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorBbk)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
          <div className="flex items-center justify-between">
             <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Notifikasi Ops</h3>
             <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
          </div>
          <div className="space-y-4">
            {[
              { title: 'Pembayaran Baru', desc: 'Booking #BK-2901 telah dibayar.', icon: 'fa-receipt', color: 'text-emerald-500' },
              { title: 'Maintenance Unit', desc: 'Unit 305 butuh pengecekan AC.', icon: 'fa-tools', color: 'text-amber-500' },
              { title: 'Review Guest', desc: 'Alice Guest memberi rating 5.', icon: 'fa-star', color: 'text-indigo-500' }
            ].map((n, i) => (
              <div key={i} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex gap-4 hover:border-indigo-200 transition-all cursor-pointer group">
                <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm ${n.color} group-hover:scale-110 transition-transform`}>
                  <i className={`fas ${n.icon} text-xs`}></i>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-900 uppercase">{n.title}</p>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight mt-1">{n.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-indigo-600 transition-all">Lihat Semua Log</button>
        </div>
      </div>
    </div>
  );
};
