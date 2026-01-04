
import React from 'react';
import { Business, User, Transaction, SecurityIncident } from '../../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, ComposedChart, Line, Legend, Cell
} from 'recharts';

interface OverviewProps {
  businesses: Business[];
  users: User[];
  transactions: Transaction[];
  platformTrendData: any[];
}

export const Overview: React.FC<OverviewProps> = ({ businesses, users, transactions, platformTrendData }) => {
  const incidents: SecurityIncident[] = [
    { id: 'inc-1', type: 'brute_force', severity: 'high', status: 'investigating', description: 'Failed login attempts on Node-01', createdAt: '2024-12-28 10:30' }
  ];

  return (
    <div className="space-y-10 animate-fade-up">
      {/* 1. TOP PULSE: ENTITY & USER MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
           <div className="flex items-center justify-between border-b border-slate-50 pb-6">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Business Topology</h3>
              <i className="fas fa-layer-group text-indigo-200"></i>
           </div>
           <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                 <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active</p>
                 <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{businesses.filter(b => b.status === 'active').length}</h4>
                 <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[80%]"></div></div>
              </div>
              <div className="space-y-2 border-x border-slate-50 px-6">
                 <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Pending</p>
                 <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{businesses.filter(b => b.status === 'pending').length}</h4>
              </div>
              <div className="space-y-2">
                 <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Suspended</p>
                 <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{businesses.filter(b => b.status === 'suspended').length}</h4>
              </div>
           </div>
        </div>

        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm space-y-8">
           <div className="flex items-center justify-between border-b border-slate-50 pb-6">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Identity Matrix</h3>
              <i className="fas fa-users-viewfinder text-indigo-200"></i>
           </div>
           <div className="grid grid-cols-3 gap-6">
              <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Owners</p><h4 className="text-4xl font-black text-slate-900">{users.filter(u => u.role === 'BUSINESS_OWNER').length}</h4></div>
              <div className="border-x border-slate-50 px-6"><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Staff</p><h4 className="text-4xl font-black text-slate-900">{users.filter(u => u.role === 'ADMIN_STAFF').length}</h4></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Guests</p><h4 className="text-4xl font-black text-slate-900">{users.filter(u => u.role === 'GUEST').length}</h4></div>
           </div>
        </div>
      </div>

      {/* 2. TREASURY MONITOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-1 bg-slate-950 p-10 rounded-[48px] shadow-2xl text-white relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/10 rounded-full blur-[80px] -mr-24 -mt-24"></div>
            <div className="relative z-10">
               <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Total GTV (Monthly)</p>
               <h3 className="text-4xl font-black tracking-tighter">Rp 842.2M</h3>
               <p className="text-[9px] font-bold text-emerald-400 mt-4 uppercase tracking-widest">+14.5% vs Prev Month</p>
            </div>
         </div>
         <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-all">
            <div>
               <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-xl mb-6">
                  <i className="fas fa-hand-holding-dollar"></i>
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Seulanga Commission</p>
               <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Rp 101.0M</h3>
            </div>
         </div>
         <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex flex-col justify-between hover:border-emerald-200 transition-all">
            <div>
               <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl mb-6">
                  <i className="fas fa-calendar-check"></i>
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Reservations</p>
               <h3 className="text-3xl font-black text-slate-900 tracking-tighter">1,242</h3>
            </div>
         </div>
      </div>

      {/* 3. TREND DISCOVERY */}
      <div className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-sm space-y-10">
         <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Marketplace Trend Pulse</h3>
         <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
               <ComposedChart data={platformTrendData}>
                  <defs>
                     <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/><stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1}/>
                     </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 800}} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 800}} />
                  <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)'}} />
                  <Bar yAxisId="left" dataKey="revenue" fill="url(#barGrad)" radius={[10, 10, 0, 0]} barSize={40} name="Revenue" />
                  <Line yAxisId="left" type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={4} name="Bookings" />
               </ComposedChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* 4. INFRASTRUCTURE & SYSTEM HEALTH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 bg-slate-900 p-12 rounded-[56px] shadow-2xl text-white space-y-10 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/5 pb-8">
               <h4 className="text-xl font-black tracking-tighter uppercase">Infrastructure Monitor</h4>
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase text-emerald-400">All Nodes Operational</span>
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
               <div className="space-y-6">
                  <h5 className="text-[10px] font-black uppercase text-white/40">CPU Load</h5>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[24%]"></div></div>
                  <p className="text-xl font-black">24% <span className="text-[10px] text-white/40">Normal</span></p>
               </div>
               <div className="space-y-6">
                  <h5 className="text-[10px] font-black uppercase text-white/40">Queue Buffer</h5>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center text-xs font-bold">
                     <span>Mail Queue</span><span className="text-indigo-400">0 PENDING</span>
                  </div>
               </div>
               <div className="space-y-6">
                  <h5 className="text-[10px] font-black uppercase text-white/40">Error Trace</h5>
                  <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-center">
                     <h4 className="text-3xl font-black text-rose-400 tracking-tighter">0.02%</h4>
                     <p className="text-[9px] font-black uppercase text-rose-300 mt-1">Exception rate</p>
                  </div>
               </div>
            </div>
         </div>
         <div className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-sm space-y-10">
            <h4 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Security Node</h4>
            <div className="space-y-4">
               {incidents.map(inc => (
                  <div key={inc.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl space-y-3">
                     <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[8px] font-black uppercase border border-rose-100">{inc.severity} RISK</span>
                     <p className="text-xs font-bold text-slate-700 truncate">{inc.description}</p>
                     <p className="text-[9px] font-bold text-slate-300 uppercase">{inc.createdAt}</p>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};
