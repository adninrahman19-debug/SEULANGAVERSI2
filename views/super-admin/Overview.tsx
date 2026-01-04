
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
    { id: 'inc-1', type: 'brute_force', severity: 'high', status: 'investigating', description: 'Blocked brute-force node at Cloud-Gate-01', createdAt: '2024-12-28 10:30' }
  ];

  const totalGTV = transactions.reduce((acc, curr) => acc + curr.amount, 0);
  const platformRevenue = transactions.filter(t => t.type === 'commission').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-12 animate-fade-up">
      {/* 1. PRIMARY METRICS NODES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-slate-950 p-10 rounded-[48px] shadow-2xl text-white relative overflow-hidden group border border-white/5">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[60px] -mr-16 -mt-16 group-hover:bg-indigo-500/40 transition-all"></div>
           <div className="relative z-10">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6">Total GTV Platform</p>
              <h3 className="text-4xl font-black tracking-tighter mb-4">Rp {(totalGTV / 1000000).toFixed(1)}M</h3>
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">+12.4% Growth Axis</span>
           </div>
        </div>
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Net Platform Treasury</p>
           <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Rp {(platformRevenue / 1000000).toFixed(1)}M</h3>
           <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Cleared Liquidity</span>
        </div>
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Marketplace Supply</p>
           <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">{businesses.filter(b => b.status === 'active').length} Nodes</h3>
           <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Global Live Entities</span>
        </div>
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Ecosystem Identity</p>
           <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">{(users.length / 1000).toFixed(1)}K</h3>
           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Verified User Matrix</span>
        </div>
      </div>

      {/* 2. VOLUME TREND ANALYSIS */}
      <div className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-sm space-y-12">
         <div className="flex items-center justify-between">
            <div>
               <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">Platform Transaction Velocity</h3>
               <p className="text-slate-400 text-sm font-medium">Aggregated business logic activity across all property verticals.</p>
            </div>
            <div className="flex bg-slate-50 p-2 rounded-2xl border border-slate-100">
               <button className="px-8 py-3 bg-white text-[10px] font-black uppercase text-indigo-600 rounded-xl shadow-lg">GTV Thread</button>
               <button className="px-8 py-3 text-[10px] font-black uppercase text-slate-400">Net Profit</button>
            </div>
         </div>
         <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
               <ComposedChart data={platformTrendData}>
                  <defs>
                     <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/><stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1}/>
                     </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 800}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 800}} />
                  <Tooltip contentStyle={{borderRadius: '32px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.12)', padding: '24px'}} />
                  <Bar dataKey="revenue" fill="url(#volGrad)" radius={[12, 12, 0, 0]} barSize={60} name="Transaction Value" />
                  <Line type="monotone" dataKey="bookings" stroke="#10b981" strokeWidth={5} dot={{r: 8, fill: '#10b981', strokeWidth: 5, stroke: '#fff'}} name="Activity Cycles" />
               </ComposedChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* 3. SYSTEM INTEGRITY NODES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 bg-slate-900 p-12 rounded-[56px] shadow-2xl text-white space-y-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px]"></div>
            <div className="relative z-10 flex items-center justify-between border-b border-white/5 pb-10">
               <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-white/5 rounded-3xl flex items-center justify-center text-emerald-400 border border-white/10 shadow-inner">
                     <i className="fas fa-server text-xl"></i>
                  </div>
                  <div>
                    <h4 className="text-2xl font-black tracking-tighter uppercase leading-none mb-1">Infrastruktur & Ops Health</h4>
                    <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Global Node Monitoring</p>
                  </div>
               </div>
               <span className="px-6 py-2 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">Operational</span>
            </div>
            
            <div className="relative z-10 grid grid-cols-3 gap-16">
               <div className="space-y-6">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Platform Uptime</p>
                  <h5 className="text-5xl font-black text-white tracking-tighter leading-none">99.99<span className="text-lg opacity-40">%</span></h5>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[99.99%] shadow-[0_0_10px_#10b981]"></div></div>
               </div>
               <div className="space-y-6">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Latency Node</p>
                  <h5 className="text-5xl font-black text-white tracking-tighter leading-none">1.2<span className="text-lg opacity-40">ms</span></h5>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 w-[20%] shadow-[0_0_10px_#6366f1]"></div></div>
               </div>
               <div className="space-y-6">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Security Clearance</p>
                  <h5 className="text-5xl font-black text-white tracking-tighter leading-none">A+</h5>
                  <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Hardened Protection</p>
               </div>
            </div>
         </div>

         <div className="bg-white p-12 rounded-[56px] border border-slate-100 shadow-sm space-y-10">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <i className="fas fa-shield-halved text-xl"></i>
               </div>
               <h4 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">Security Alpha</h4>
            </div>
            <div className="space-y-5">
               {incidents.map(inc => (
                  <div key={inc.id} className="p-8 bg-slate-50 border border-slate-100 rounded-[32px] space-y-4 group hover:border-rose-200 transition-all cursor-pointer">
                     <div className="flex justify-between items-center">
                        <span className="px-4 py-1.5 bg-rose-50 text-rose-600 rounded-full text-[9px] font-black uppercase border border-rose-100 tracking-widest">Critical Alert</span>
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{inc.createdAt}</span>
                     </div>
                     <p className="text-xs font-bold text-slate-700 leading-relaxed">{inc.description}</p>
                     <div className="flex items-center gap-2 pt-2 text-[10px] font-black text-indigo-600 uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                        Verify Trace Node <i className="fas fa-arrow-right text-[8px]"></i>
                     </div>
                  </div>
               ))}
            </div>
            <button className="w-full py-5 bg-slate-950 text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 transition-all">Access Security Matrix</button>
         </div>
      </div>
    </div>
  );
};
