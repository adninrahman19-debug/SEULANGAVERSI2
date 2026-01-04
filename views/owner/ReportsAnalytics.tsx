
import React, { useState, useMemo } from 'react';
import { Business, Booking, Unit, BookingStatus } from '../../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';

interface ReportsAnalyticsProps {
  business: Business;
  bookings: Booking[];
  units: Unit[];
}

export const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({ business, bookings, units }) => {
  const [timeframe, setTimeframe] = useState<'30D' | '90D' | '1Y'>('30D');

  // 1. DATA AGGREGATION LOGIC
  const stats = useMemo(() => {
    const totalGTV = bookings
      .filter(b => b.status !== BookingStatus.CANCELLED)
      .reduce((sum, b) => sum + b.totalPrice, 0);
    
    const completedBookings = bookings.filter(b => b.status === BookingStatus.COMPLETED).length;
    const activeBookings = bookings.filter(b => b.status === BookingStatus.CHECKED_IN || b.status === BookingStatus.CONFIRMED).length;
    
    // Simple occupancy calc: (booked days / total capacity days) - mocked for demo
    const avgOccupancy = 78.4; 
    
    return { totalGTV, completedBookings, activeBookings, avgOccupancy };
  }, [bookings]);

  const revenueTrendData = [
    { name: 'Week 1', revenue: 12500000, bookings: 8 },
    { name: 'Week 2', revenue: 18200000, bookings: 12 },
    { name: 'Week 3', revenue: 15100000, bookings: 10 },
    { name: 'Week 4', revenue: 22400000, bookings: 15 },
  ];

  const unitPerformance = useMemo(() => {
    return units.map(u => {
      const unitBookings = bookings.filter(b => b.unitId === u.id && b.status !== BookingStatus.CANCELLED);
      const revenue = unitBookings.reduce((sum, b) => sum + b.totalPrice, 0);
      const count = unitBookings.length;
      return { 
        name: u.name, 
        revenue, 
        bookings: count,
        occupancy: Math.floor(Math.random() * (95 - 60 + 1)) + 60 // Mocked %
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [units, bookings]);

  const handleExport = (format: 'PDF' | 'EXCEL') => {
    alert(`Dispatching cryptographic ${format} report for ${business.name}. File will be available in your downloads.`);
  };

  return (
    <div className="space-y-12 animate-fade-up">
      {/* HEADER & EXPORT CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">Intelligence & Reports</h2>
           <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-2">Analisis mendalam performa finansial dan operasional node properti.</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => handleExport('EXCEL')}
             className="px-6 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3 shadow-sm"
           >
              <i className="fas fa-file-excel text-emerald-500"></i> Export Data
           </button>
           <button 
             onClick={() => handleExport('PDF')}
             className="px-6 py-3.5 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all flex items-center gap-3"
           >
              <i className="fas fa-file-pdf text-rose-500"></i> Download Audit PDF
           </button>
        </div>
      </div>

      {/* 1. PRIMARY EVALUATION MATRIX */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Marketplace GTV', value: `Rp ${stats.totalGTV.toLocaleString()}`, trend: '+12.4%', color: 'text-indigo-600', icon: 'fa-chart-line-up' },
          { label: 'Average Occupancy', value: `${stats.avgOccupancy}%`, trend: '+5.2%', color: 'text-emerald-600', icon: 'fa-bed-pulse' },
          { label: 'Booking Volume', value: bookings.length, trend: 'Stable', color: 'text-amber-600', icon: 'fa-calendar-check' },
          { label: 'RevPAR (Est)', value: 'Rp 850K', trend: '+8.1%', color: 'text-rose-600', icon: 'fa-sack-dollar' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
             <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-xl shadow-inner ${stat.color}`}>
                   <i className={`fas ${stat.icon}`}></i>
                </div>
                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${stat.trend.includes('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>{stat.trend}</span>
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
             <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* 2. REVENUE TRAJECTORY CHART */}
      <div className="grid lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 bg-white p-10 rounded-[56px] border border-slate-100 shadow-sm space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase italic">Revenue Cycle Analysis</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Visualisasi arus kas masuk dari seluruh channel marketplace.</p>
               </div>
               <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                  {['30D', '90D', '1Y'].map(t => (
                    <button 
                      key={t} 
                      onClick={() => setTimeframe(t as any)}
                      className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${timeframe === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                    >
                      {t}
                    </button>
                  ))}
               </div>
            </div>
            <div className="h-[400px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueTrendData}>
                     <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 800}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 800}} />
                     <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '20px'}} />
                     <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={5} fillOpacity={1} fill="url(#chartGrad)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-slate-950 p-12 rounded-[56px] shadow-2xl text-white relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>
            <div className="relative z-10">
               <h3 className="text-2xl font-black tracking-tighter uppercase mb-2 italic">Occupancy Hub</h3>
               <p className="text-indigo-200/40 text-[10px] font-bold uppercase tracking-widest mb-12">Tingkat efisiensi utilitas unit</p>
               
               <div className="flex flex-col items-center text-center space-y-8">
                  <div className="relative w-48 h-48 flex items-center justify-center">
                     <svg className="w-full h-full transform -rotate-90">
                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                        <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={552.9} strokeDashoffset={552.9 - (552.9 * stats.avgOccupancy) / 100} className="text-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
                     </svg>
                     <div className="absolute flex flex-col items-center">
                        <span className="text-5xl font-black tracking-tighter">{stats.avgOccupancy}%</span>
                        <span className="text-[10px] font-black uppercase opacity-40">Utilitized</span>
                     </div>
                  </div>
                  <p className="text-xs font-medium text-indigo-100/60 leading-relaxed px-6">Anda memiliki performa okupansi di atas rata-rata cluster (72.1%).</p>
               </div>
            </div>
            <button className="relative z-10 w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Optimize Strategy Node</button>
         </div>
      </div>

      {/* 3. UNIT PERFORMANCE MATRIX */}
      <div className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-sm space-y-10">
         <div className="flex items-center justify-between">
            <div>
               <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Unit Performance Index</h3>
               <p className="text-slate-400 text-sm font-medium">Pemetaan profitabilitas dan popularitas tiap aset individu.</p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><i className="fas fa-ranking-star"></i></div>
         </div>

         <div className="overflow-x-auto rounded-[32px] border border-slate-50">
            <table className="w-full text-left">
               <thead className="bg-slate-50/50">
                  <tr>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Identity</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Total Bookings</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Avg. Occupancy</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Revenue Contribution</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {unitPerformance.map((u, i) => (
                    <tr key={i} className="hover:bg-slate-50/30 transition-all group">
                       <td className="px-10 py-8">
                          <p className="font-black text-slate-900 uppercase text-sm group-hover:text-indigo-600 transition-colors">{u.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asset Node #{i+1}</p>
                       </td>
                       <td className="px-10 py-8 text-center">
                          <p className="font-black text-slate-800 text-lg">{u.bookings}</p>
                          <p className="text-[8px] font-bold text-slate-300 uppercase">Successful Cycles</p>
                       </td>
                       <td className="px-10 py-8 text-center">
                          <div className="flex flex-col items-center gap-2">
                             <p className="font-black text-emerald-600 text-sm">{u.occupancy}%</p>
                             <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${u.occupancy}%` }}></div>
                             </div>
                          </div>
                       </td>
                       <td className="px-10 py-8 text-right">
                          <p className="font-black text-indigo-600 text-lg">Rp {u.revenue.toLocaleString()}</p>
                          <p className="text-[8px] font-bold text-slate-300 uppercase">Gross Profit contribution</p>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      <div className="p-10 bg-indigo-50 rounded-[48px] border border-indigo-100 flex items-center justify-center gap-6">
         <i className="fas fa-microchip text-indigo-600 text-xl animate-pulse"></i>
         <p className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.4em] italic leading-none">SEULANGA BUSINESS INTELLIGENCE ENGINE ACTIVE • v2.4 ANALYTICS</p>
      </div>
    </div>
  );
};
